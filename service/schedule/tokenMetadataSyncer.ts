import { ethers } from "ethers"
import { Op } from "sequelize"
import { binaryToHexString, binaryToNumber, getProvider, redis } from "../lib/utils"
import { NftTokenMetadata } from "../model/nftTokenMetadata"
import { NftTransfer } from "../model/nftTransfer"


export const syncTokenMetadata = async () => {
    const redisKey = `syncmintdata-1`
    const provider = getProvider()

    const batchSize = 1000
    const tokens: any[] = await NftTransfer.findAll({
        attributes: ["contract", "token_id"],
        raw: true,
        limit: batchSize,
        offset: (parseInt(await redis.get(redisKey) || 0))
    })
    if (tokens?.length) {
        const existed = await NftTokenMetadata.findAll({
            where: {
                [Op.or]: tokens.map(t => {
                    return {
                        contract: t.contract,
                        token_id: t.token_id
                    }
                })
            }, raw: true
        })
        const notExisted = tokens.filter(c1 => existed.indexOf(c1) == -1)
        for (const token of notExisted) {
            try {
                const contractObj = new ethers.Contract(binaryToHexString(token.contract), [{
                    "inputs": [
                        {
                            "internalType": "uint256",
                            "name": "tokenId",
                            "type": "uint256"
                        }
                    ],
                    "name": "uri",
                    "outputs": [
                        {
                            "internalType": "string",
                            "name": "",
                            "type": "string"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                }, {
                    "inputs": [
                        {
                            "internalType": "uint256",
                            "name": "tokenId",
                            "type": "uint256"
                        }
                    ],
                    "name": "tokenURI",
                    "outputs": [
                        {
                            "internalType": "string",
                            "name": "",
                            "type": "string"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                }], provider)
                let metadataUri = ""
                try { metadataUri = await contractObj.uri(binaryToNumber(token.token_id)) } catch (e) {
                    try {
                        metadataUri = await contractObj.tokenURI(binaryToNumber(token.token_id))
                    } catch (e2) {
                        console.log(token)
                    }
                }
                await NftTokenMetadata.create({
                    contract: token.contract,
                    token_id: token.token_id,
                    metadataUrl: metadataUri
                }, {
                    ignoreDuplicates: true
                })
                const curr = await redis.get(redisKey)
                await redis.set(redisKey, parseInt(curr || 0) + 1)
                console.log(`finished - ${parseInt(curr || 0)}`)
            } catch (e) {
                console.error(e)
                console.log(`failed - ${token}`)
            }
        }
        return true
    } else {
        return false
    }
}