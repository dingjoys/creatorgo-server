import { quietSequelize } from "../service/model"
import { NftTransfer } from "../service/model/nftTransfer"

const _main = async () => {

    const count = await NftTransfer.count()
    const sql = `
        insert ignore into nft_mint_data(contract, trace_id, mint_count, max_token_id, total_amount, createdAt, updatedAt)
        VALUEs 
        (select contract, ${count} as trace_id, count(*) as mint_count, max(token_id) as max_token_id, sum(amount) as total_amount, now(), now() from nft_transfer 
        where \`from\`=x'0000000000000000000000000000000000000000'
        group by contract)

        `
    await quietSequelize.query(sql)
}
_main()