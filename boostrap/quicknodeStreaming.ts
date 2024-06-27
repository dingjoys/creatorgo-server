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



// 0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62
// TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)

// https://basescan.org/tx/0x30e3d0d60924c3868909973853b9c6a75c5153c28e43a60c7dd9bfbed7a8eb47#eventlog
// TransferBatch(operator, from, to, ids, values)

// 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
// Transfer (index_topic_1 address from, index_topic_2 address to, index_topic_3 uint256 tokenId)

const main2 = (data) => {
    var filteredData = data.streamData;
    const result = []
    for (let logs of filteredData) {
        for (let log of logs) {
            if (log.topics && (log.topics[0] == "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62" ||
                log.topics[0] == "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef")) {
                if (log.topics[0] == "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62") {
                    result.push({
                        contract: log.address,
                        from: `0x${log.topics[2].substring(26)}`,
                        to: `0x${log.topics[3].substring(26)}`,
                        // token_id: log.data.substring(0,66),
                        token_id: log.data.substring(0, 66).replace(/0x0+/, '0x'),
                        log_index: parseInt(log.logIndex) || 0,
                        hash: log.transactionHash,
                        block_number: parseInt(log.blockNumber),
                        amount: parseInt(`0x${log.data.substring(66)}`.replace(/0x0+/, '0x'))
                    })
                } else {
                    result.push({
                        contract: log.address,
                        from: `0x${log.topics[1].substring(26)}`,
                        to: `0x${log.topics[2].substring(26)}`,
                        // token_id: log.topics[3]?log.topics[3].replace(/^0+/, '0x'):null ,
                        token_id: log.data.replace(/0x0+/, '0x'),
                        log_index: parseInt(log.logIndex) || 0,
                        hash: log.transactionHash,
                        block_number: parseInt(log.blockNumber),
                        amount: 1
                    })
                }
            }
        }
    }
    return result
}