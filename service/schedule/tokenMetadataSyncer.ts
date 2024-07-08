import { ethers } from "ethers"
import { Op, literal } from "sequelize"
import { binaryToHexString, binaryToNumber, getProvider, redis } from "../lib/utils"
import { NftTokenMetadata } from "../model/nftTokenMetadata"
import { NftTransfer } from "../model/nftTransfer"

export const syncTokenMetadata = async () => {
    const redisKey = `syncmintdata-4`
    const provider = getProvider()

    const batchSize = 1000
    const tokens: any[] = await NftTransfer.findAll({
        attributes: ["contract", "token_id"],
        where: {
            [Op.and]: [literal("`from`=x'0000000000000000000000000000000000000000'")],
        },
        raw: true,
        limit: batchSize,
        offset: (parseInt(await redis.get(redisKey) || 224569))
    })
    if (tokens?.length) {
        const existed: any[] = await NftTokenMetadata.findAll({
            where: {
                [Op.or]: tokens.map(t => {
                    return {
                        contract: t.contract,
                        token_id: t.token_id
                    }
                })
            }, raw: true
        })
        // const notExisted = tokens.filter(c1 => existed.indexOf(c1) == -1)
        for (const token of tokens) {

            console.log(binaryToNumber(token.token_id), binaryToHexString(token.contract))
            if (existed.find(ex => ex.contract == token.contract && ex.token_id == token.token_id)) {
                const curr = await redis.get(redisKey)
                console.log(`hit cache - ${parseInt(curr || 224569)}`)
                await redis.set(redisKey, parseInt(curr || 0) + 1)
                continue
            }
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
                existed.push({
                    contract: token.contract,
                    token_id: token.token_id,
                })
                const curr = await redis.get(redisKey)
                await redis.set(redisKey, parseInt(curr || 224569) + 1)
                console.log(`finished - ${parseInt(curr || 224569)}`)
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