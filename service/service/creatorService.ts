import { fn, literal, Op } from "sequelize";
import { binaryToHexString, binaryToNumber, fetchAPiOrIpfsData, getProvider, hexStringToBinary } from "../lib/utils";
import { quietSequelize } from "../model";
import { nftContractMetadata as NftContractMetadata } from "../model/nftContractMetadata";
import { NftTransfer } from "../model/nftTransfer";
import { hexString } from "../types";
import axios from 'axios'
import { BigNumberish, ethers, providers } from "ethers";
import { nftAbi } from "../schedule/contractSyncer";
import { NftMintData } from "../model/nftMintData";

type Creator = {
    address: hexString,
    contracts: {
        metadata: string,
        address: hexString,
        supply: number,
        uniqueHolderNumber: number,
        whaleNumber: number,
    }[],
    best_srcs: string[], // 随机挑选
    score: number,
    uniqueHolderNumber: number,
    whaleNumber: number,
}

let whales = []
const getWhales = async () => {
    if (whales.length) {
        return whales
    } else {
        while (whales.length < 1000) {
            const result = (await axios.get(`https://restapi.nftscan.com/api/v2/statistics/ranking/wallet?sort_field=holding_volume&sort_direction=desc&limit=100&offset=${whales.length}`, {
                headers: {
                    'X-API-KEY': 'B8Jsv1hdmcMfz3oYEcXNxYbP'
                }
            }))?.data
            whales = whales.concat(result?.data?.map(d => d.account_address))
        }
        return whales
    }
}
export const leaderboard = () => {

}

export const getCreatorData = async (address) => {
    console.log(address)
    const contracts: any[] = await NftContractMetadata.findAll({
        where: {
            owner: hexStringToBinary(address)
        }, raw: true
    })
    if (contracts.length) {
        const mintData: any[] = await NftMintData.findAll({
            where: {
                contract: { [Op.in]: contracts.map(c => c.contract) }
            }, raw: true
        })

        const uniqueMinters = await NftTransfer.findAndCountAll(
            {
                attributes: [[literal("distinct(`to`)"), "owner"]],
                where: {
                    contract: { [Op.in]: contracts.map(c => c.contract) },
                    [Op.and]: [literal("`from`=x'0000000000000000000000000000000000000000'")]
                },
                raw: true, limit: 1000000
            }
        )

        const recentMints: any[] = await NftTransfer.findAll(
            {
                where: {
                    contract: { [Op.in]: contracts.map(c => c.contract) },
                    [Op.and]: [literal("`from`=x'0000000000000000000000000000000000000000'")]
                },
                raw: true, limit: 10,
                order: [["id", "desc"]]
            }
        )

        const whaleNumber = uniqueMinters.rows.filter((r: any) => {
            r.owner
        }).length

        const firstMintBlockNumber = ((await NftTransfer.findOne(
            {
                where: {
                    contract: { [Op.in]: contracts.map(c => c.contract) },
                    [Op.and]: [literal("`from`=x'0000000000000000000000000000000000000000'")]
                },
                raw: true, order: [["id", "asc"]]
            }
        )) as any)?.block_number

        const provider = getProvider()
        const collections: any[] = []
        for (let c of contracts) {
            const mintfun = (await axios.get(`https://mint.fun/api/mintfun/contract/7777777:${binaryToHexString(c.contract)}/details`)).data
            collections.push({
                metadata: getContractMetadata(binaryToHexString(c.contract), provider),
                tokens: await getCollectionData(binaryToHexString(c.contract), provider),
                mintfun
            })
        }
        console.log(`https://zora.co/api/trpc/profile.getProfile?input=%7B%22json%22%3A%22${ethers.utils.getAddress(address)}%22%7D`)
        const zora = (await axios.get(`https://zora.co/api/trpc/profile.getProfile?input=%7B%22json%22%3A%22${ethers.utils.getAddress(address)}%22%7D`)).data
        return {
            uniqueHolderNumber: uniqueMinters.count,
            totalAmount: mintData.reduce((total, curr) => total + curr.total_amount, 0),
            totalMint: mintData.reduce((total, curr) => total + curr.mint_count, 0),
            whaleNumber,
            collections,
            score: calcScore(address),
            recentMints: recentMints.map(m => {
                return {
                    minter: binaryToHexString(m.to),
                    block_number: m.block_number
                }
            }),
            firstMintBlockNumber,

        }
    } else {
        return null
    }
}

export const getCollectionData = async (contract, provider) => {
    console.log(contract)
    const tokenIds: any = await NftTransfer.findAll({
        attributes: ["token_id", [literal("sum(amount)"), "total_amount"]],
        where: {
            contract: hexStringToBinary(contract),
            [Op.and]: [literal("`from`=x'0000000000000000000000000000000000000000'")]
        },
        group: ["token_id"],
        limit: 100000,
        raw: true
    })
    const data: any[] = []
    for (let tokenIdObj of tokenIds) {
        const img = await getNftMetadata(contract, binaryToNumber(tokenIdObj.token_id), provider)
        data.push({
            contract,
            tokenId: binaryToNumber(tokenIdObj.token_id).toString(),
            total_amount: tokenIdObj.total_amount,
            img
        })
    }
    return data
}

const creatorImageCache = {}
export const getCreatorImgs = async (address, contracts: hexString[]) => {

    if (creatorImageCache[address]) {
        return creatorImageCache[address]
    }

    if (contracts.length) {
        const provider = getProvider()
        const imgs: string[] = []
        for (let contract of contracts) {
            const randomTokenIds: any = await NftTransfer.findAll({
                attributes: [[literal("distinct(token_id)"), "token_id"]],
                order: [fn("rand")],
                where: {
                    contract: hexStringToBinary(contract)
                },
                limit: 5,
                raw: true
            })
            for (let tokenIdObj of randomTokenIds) {
                imgs.push(await getNftMetadata(contract, binaryToNumber(tokenIdObj.token_id), provider))
            }
        }
        creatorImageCache[address] = imgs
        return imgs
    } else {
        return null
    }
}

export const getContractMetadata = async (contract, provider) => {
    const contractObj = new ethers.Contract(contract, nftAbi, provider)
    try {
        const contractURI = await contractObj.contractURI()
        if (contractURI) {
            const metadataRaw = await fetchAPiOrIpfsData(contractURI)
            return metadataRaw
        }
    }
    catch (e) {
        console.log(`error 4 - ${contract}`)
    }
}

export const getNftMetadata = async (contract, tokenId: BigNumberish, provider) => {
    const contractObj = new ethers.Contract(contract, nftAbi, provider)
    try {
        const uri = await contractObj.uri(tokenId)
        if (uri) {
            const result = await fetchAPiOrIpfsData(uri)
            return result;
            if (result.image) {
                return (result.image)
            }
        }
    } catch (e) {
        try {
            const uri = await contractObj.tokenURI(tokenId)
            if (uri) {
                const result = await fetchAPiOrIpfsData(uri)
                return result;
                if (result.image) {
                    return result.image
                }
            }

        } catch (e2) {
            return null
        }
    }
}

export const calcScore = (address,) => {

    const score = Math.random() * 100
    return score

}