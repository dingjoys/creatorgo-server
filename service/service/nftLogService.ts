import { hexStringToBinary, numberishToBinary } from "../lib/utils"
import { NftTransfer } from "../model/nftTransfer"

type QuicknodeStreamLogsRawData = {
    "amount": number,
    "block_number": number,
    "contract": string,
    "from": string,
    "hash": string,
    "log_index": number,
    "to": string,
    "token_id": string
}

export const bulkCreateNftTransfers = async (raw: QuicknodeStreamLogsRawData[]) => {
    if (raw.length) {
        const data = raw.map(r => {
            if (r.token_id == "0x") {
                console.log(r)
            }
            return {
                "amount": r.amount,
                "block_number": r.block_number,
                "contract": hexStringToBinary(r.contract),
                "from": hexStringToBinary(r.from),
                "hash": hexStringToBinary(r.hash),
                "log_index": r.log_index,
                "to": hexStringToBinary(r.to),
                // "token_id": r.token_id == "0x" ? 0 : BigInt(r.token_id)
                "token_id": numberishToBinary(r.token_id == "0x" ? 0 : BigInt(r.token_id))
            }
        })
        try {
            return await NftTransfer.bulkCreate(data, {
                ignoreDuplicates: true
            }).then(res => {
                return data.length
            })
        } catch (e) {
            console.error(e)
        }
    } else {
        return 0    
    }
}
