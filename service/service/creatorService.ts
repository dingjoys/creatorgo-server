import { fn, literal, Op } from "sequelize";
import { binaryToHexString, binaryToNumber, fetchAPiOrIpfsData, getProvider, hexStringToBinary } from "../lib/utils";
import { quietSequelize } from "../model";
import { nftContractMetadata as NftContractMetadata } from "../model/nftContractMetadata";
import { NftTransfer } from "../model/nftTransfer";
import { hexString } from "../types";
import axios from 'axios'
import { ethers } from "ethers";
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

        const uniqueHolders = await NftTransfer.findAndCountAll(
            {
                attributes: [[literal("distinct(to)"), "owner"]],
                where: {
                    contract: { [Op.in]: contracts.map(c => c.contract) }
                },
                raw: true, limit: 10
            }
        )
        const imgs = await getCreatorImgs(address, contracts.map(c => binaryToHexString(c.contract)))
        return {
            uniqueHolderNumber: uniqueHolders.count,
            totalAmount: mintData.reduce((total, curr) => total + curr.total_amount, 0),,
            totalMint: mintData.reduce((total, curr) => total + curr.mint_count, 0),
            imgs,
            contracts: contracts.map(c => binaryToHexString(c.contract))
        }
        // const whaleNumber = uniqueHoldersNumber.rows.filter((r: any) => {
        //     r.owner
        // })
    } else {
        return null
    }
}

const creatorImageCache = {}
export const getCreatorImgs = async (address, contracts: hexString[]) => {

    console.log(contracts, creatorImageCache[address])
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
            const contractObj = new ethers.Contract(contract, nftAbi, provider)
            try {
                for (let tokenIdObj of randomTokenIds) {
                    console.log(tokenIdObj)
                    const uri = await contractObj.uri(binaryToNumber(tokenIdObj.token_id))
                    if (uri) {
                        const result = await fetchAPiOrIpfsData(uri)
                        if (result.image) {
                            imgs.push(result.image)
                        }
                    }
                }
            } catch (e) {
                try {
                    const uri = await contractObj.tokenURI(binaryToNumber(randomTokenIds))
                    if (uri) {
                        const result = await fetchAPiOrIpfsData(uri)
                        if (result.image) {
                            imgs.push(result.image)
                        }
                    }

                } catch (e2) {

                }
            }
        }
        creatorImageCache[address] = imgs
        return imgs
    } else {
        return null
    }
}

export const calcScore = (address) => {

}