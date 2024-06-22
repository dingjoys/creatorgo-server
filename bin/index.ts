
const Moralis = require("moralis").default;


const streamingSecret = "2vqCa6qnbRHsbmoA7WdO94dNxkhFFJfSQWY7xPaKtmx3IwuU3K8TKmoIbM5R5PAZ"
const workspaceId = "4e8efe99-2f57-4208-b526-57b6d7246e2d"

const _main = async () => {

    await Moralis.start({
        apiKey: "YOUR_API_KEY",
    });


    const NFT_transfer_ABI = [{
        "anonymous": false,
        "inputs": [
            { "indexed": true, "name": "from", "type": "address" },
            { "indexed": true, "name": "to", "type": "address" },
            { "indexed": true, "name": "tokenId", "type": "uint256" },
        ],
        "name": "transfer",
        "type": "event",
    }]; // valid abi of the event

    const options = {
        chains: [0x2105], // list of blockchains to monitor
        description: "monitor NFT transfers", // your description
        tag: "NFT_transfers", // give it a tag
        abi: NFT_transfer_ABI,
        includeContractLogs: true,
        allAddresses: true,
        topic0: ["Transfer(address,address,uint256)"], // topic of the event
        webhookUrl: "http://8.217.5.3:3036/nft", // webhook url to receive events,
    };

    const stream = await Moralis.Streams.add(options);

}