
const Moralis = require("moralis").default;


const streamingSecretKey = "2vqCa6qnbRHsbmoA7WdO94dNxkhFFJfSQWY7xPaKtmx3IwuU3K8TKmoIbM5R5PAZ"
const workspaceId = "4e8efe99-2f57-4208-b526-57b6d7246e2d"

const _main = async () => {

    await Moralis.start({
        apiKey: streamingSecretKey,
    });
    console.log("connected")
    const NFT_transfer_ABI = [{
        "anonymous": false,
        "inputs": [
            { "indexed": true, "name": "from", "type": "address" },
            { "indexed": true, "name": "to", "type": "address" },
            { "indexed": true, "name": "tokenId", "type": "uint256" },
        ],
        "name": "Transfer",
        "type": "event",
    }];
    const topic = "Transfer(address,address,uint256)";

    const options = {
        chains: [0x2105], // list of blockchains to monitor
        description: "monitor NFT transfers", // your description
        tag: "NFT_transfers", // give it a tag
        abi: NFT_transfer_ABI,
        includeContractLogs: true,
        topic0: [topic], // topic of the event
        webhookUrl: "http://8.217.5.3:3036/webhook/nft", // webhook url to receive events,
    };
    const stream = await Moralis.Streams.add(options);

    console.log("stream inited")

    const { id } = stream.toJSON(); // { id: 'YOUR_STREAM_ID', ...stream }

    console.log(id)
    // Attach the contract address to the stream
    await Moralis.Streams.addAddress({
        id,
        address: "0x1e1ad3d381bc0ccea5e44c29fb1f7a0981b97f37", // USDC address
    });
}
console.log("begin")
_main()