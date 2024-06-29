import { fn, Op } from "sequelize";
import { binaryToHexString, binaryToNumber, fetchAPiOrIpfsData, getProvider, hexStringToBinary } from "../lib/utils";
import { quietSequelize } from "../model";
import { nftContractMetadata as NftContractMetadata } from "../model/nftContractMetadata";
import { NftTransfer } from "../model/nftTransfer";
import { hexString } from "../types";
import axios from 'axios'
import { ethers } from "ethers";
import { nftAbi } from "../schedule/contractSyncer";

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
        // const whaleAddresses = await getWhales()
        const uniqueHoldersNumber = await NftTransfer.findAndCountAll(
            {
                attributes: [[fn("distinct", "to"), "owner"]],
                where: {
                    contract: { [Op.in]: contracts.map(c => c.contract) }
                },
                raw: true
            }
        )
        const imgs = await getCreatorImgs(address)
        return {
            uniqueHoldersNumber,
            imgs,
            contracts: contracts.map(c => c.contract)
        }
        // const whaleNumber = uniqueHoldersNumber.rows.filter((r: any) => {
        //     r.owner
        // })
    } else {
        return null
    }
}

const creatorImageCache = {}
export const getCreatorImgs = async (address) => {

    if (creatorImageCache[address]) {
        return creatorImageCache[address]
    }

    const contracts: any[] = await NftContractMetadata.findAll({
        where: {
            owner: hexStringToBinary(address)
        }, raw: true
    })
    if (contracts.length) {
        const provider = getProvider()
        const imgs: string[] = []
        for (let contract of contracts) {
            const contractAddress = binaryToHexString(contract.contract)
            const randomTokenIds: any = await NftTransfer.findAll({
                attributes: [[fn("distinct", "token_id"), "token_id"]],
                order: [fn("random")],
                where: {
                    contract: contract.contract
                },
                limit: 5
            })

            const contractObj = new ethers.Contract(contractAddress, nftAbi, provider)
            try {
                const uri = await contractObj.uri(binaryToNumber(randomTokenIds))
                if (uri) {
                    const result = await fetchAPiOrIpfsData(uri)
                    if (result.image) {
                        imgs.push(result.image)
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