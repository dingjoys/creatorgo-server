import { ethers } from "ethers"
import { binaryToHexString, getProvider, hexStringToBinary, sleep } from "../lib/utils"
import { sequelize } from "../model"
import axios from 'axios'
import { nftContractMetadata } from "../model/nftContractMetadata"

const ipfsHead = "https://metopia.quicknode-ipfs.com/ipfs"
const fetchUri = (uri) => {
    if (uri.startsWith("ipfs://")) {
        return axios.get(`${ipfsHead}/${uri.replace("ipfs://", "")}`).then(res => res.data)
    } else {
        return axios.get(uri)
    }
}

let currentIndex = 0
export const syncNewContractInfos = async () => {
    const provider = getProvider()

    const batchSize = 1000
    console.log(await sequelize.query(`
        select distinct contract from nft_transfer limit 10,0
   `))
    const contracts = (await sequelize.query(`
             select distinct contract from nft_transfer limit ${currentIndex},${batchSize}
        `))?.[0]?.map((c: any) => binaryToHexString(c.contract))
    console.log("length1 - ", contracts.length)
    if (contracts?.length) {
        const existed = (await sequelize.query(`
            select contract from nft_transfer where contract in (
        ${contracts.map(c => `'${c}'`).join(",")}
            )
       `))?.[0]?.map((c: any) => binaryToHexString(c.contract))
        const notExisted = contracts.filter(c1 => existed.indexOf(c1) == -1)
        console.log("LENGTH - ", notExisted.length)
        for (const contract of notExisted) {
            try {
                const contractObj = new ethers.Contract(contract, nftAbi, provider)
                const supply = parseInt((await contractObj.totalSupply())?.toString())
                const name = await contractObj.name()

                let owner: any = null
                try {
                    const tmp = await contractObj.owner()
                    owner = hexStringToBinary(tmp)
                } catch (e) {

                }

                let metadata = ""
                try {
                    const contractURI = await contractObj.contractURI()
                    if (contractURI) {
                        metadata = JSON.stringify(await fetchUri(contractURI))
                    }
                }
                catch (e) {

                }
                await nftContractMetadata.create({
                    contract: hexStringToBinary(contract),
                    name,
                    supply,
                    owner,
                    metadata
                })

                console.log(`created - ${contract} - ${{
                    contract: hexStringToBinary(contract),
                    name,
                    supply,
                    owner,
                    metadata
                }}`)
                currentIndex++;
            } catch (e) {
                console.error(e)
                console.log(`failed - ${contract}`)
            }
            await sleep(1000)
        }
        currentIndex += batchSize
    }

}


const nftAbi = [
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [],
        "name": "contractURI",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "uri",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]