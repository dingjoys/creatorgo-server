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

export const calcScore = (address) => {
    
}