import { quietSequelize } from "../service/model"
import { NftTransfer } from "../service/model/nftTransfer"
import moment from 'moment'
const _main = async () => {

    const count = await NftTransfer.count()
    const now = moment().format()

    const sql = `
        insert ignore into nft_mint_data(contract, trace_id, mint_count, max_token_id, total_amount, createdAt, updatedAt)
        (select contract, ${count} as trace_id, count(*) as mint_count, max(token_id) as max_token_id, sum(amount) as total_amount, 
        "${now}" as createdAt, "${now}" as updatedAt from nft_transfer 
        where \`from\`=x'0000000000000000000000000000000000000000'
        group by contract)
        `
    await quietSequelize.query(sql)
}
_main()