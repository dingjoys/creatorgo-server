// function main1(data) {
//     try {
//         var data = data.streamData;
//         var filteredReceipts = [];

//         data.receipts.forEach(receipt => {
//             let relevantLogs = receipt.logs.filter(log =>
//                 log.topics[0] === "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef" &&
//                 log.topics.length === 3
//             );
//             if (relevantLogs.length > 0) {
//                 filteredReceipts.push(receipt);
//             }
//         });

//         return {
//             totalReceipts: data.receipts.length,
//             filteredCount: filteredReceipts.length,
//             receipts: filteredReceipts
//         };
//     } catch (e) {
//         return { error: e.message };
//     }
// }

// 0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62
// TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)

// TransferBatch(operator, from, to, ids, values)


// 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
// Transfer (index_topic_1 address from, index_topic_2 address to, index_topic_3 uint256 tokenId)

function main(data) {
    var filteredData = data.streamData;
    return filteredData.
        filter(d => d.topics[0] == "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62" ||
            d.topics[0] == "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef").
        map(d => {
            if (d.topics[0] == "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62") {
                return {
                    contract: d.address,
                    from: `0x${d.topics[2].substring(26)}`,
                    to: `0x${d.topics[3].substring(26)}`,
                    token_id: d.topics[4],
                    log_index: parseInt(d.logIndex) || 0,
                    hash: d.transactionHash,
                    block_number: d.blockNumber,
                    amount: 1
                }
            } else {
                return {
                    contract: d.address,
                    from: `0x${d.topics[1].substring(26)}`,
                    to: `0x${d.topics[2].substring(26)}`,
                    token_id: d.topics[3],
                    log_index: parseInt(d.logIndex) || 0,
                    hash: d.transactionHash,
                    block_number: d.blockNumber,
                    amount: 1
                }
            }
        })
}