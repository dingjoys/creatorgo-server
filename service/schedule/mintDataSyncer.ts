import { quietSequelize, sequelize } from "../model"
import { NftMintData } from "../model/nftMintData"
import { NftTransfer } from "../model/nftTransfer"


let globalCurrentIndex = 0
export const syncMintData = async () => {
    const batchSize = 100
    const count = await NftTransfer.count()
    const sql = `
        select contract, count(*) as mint_count, sum(amount) as total_amount, as max_token_id from nft_transfer 
        where \`from\`=x'0000000000000000000000000000000000000000'
        group by contract limit ${globalCurrentIndex},${batchSize} 
    `
    const result = await quietSequelize.query(sql)
    if (result[0].length > 0) {
        console.log(`inserting - ${result[0].length}`)
        await NftMintData.bulkCreate(result[0]?.map(
            (r: any) => {
                return {
                    contract: r.contract,
                    mint_count: r.mint_count,
                    max_token_id: r.max_token_id,
                    total_amount: r.total_amount,
                    trace_id: count
                }
            }
        ), {
            ignoreDuplicates: true
        })
        globalCurrentIndex += batchSize;
        return result[0].length
    } else {
        return 0
    }
}