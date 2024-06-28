import { hexStringToBinary } from "../lib/utils";
import { nftContractMetadata as NftContractMetadata } from "../model/nftContractMetadata";
import { hexString } from "../types";

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

export const leaderboard = () => {

}

export const getCreatorData = async (address) => {

    const contracts = await NftContractMetadata.findAll({
        where: {
            owner: hexStringToBinary(address)
        }
    })
    



}

export const calcScore = (address) => {

}