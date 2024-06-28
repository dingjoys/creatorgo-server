import { ethers } from "ethers"
import { binaryToHexString, getProvider, hexStringToBinary, sleep } from "../lib/utils"
import { quietSequelize, sequelize } from "../model"
import axios from 'axios'
import { nftContractMetadata } from "../model/nftContractMetadata"

const ipfsHead = "https://metopia.quicknode-ipfs.com/ipfs"
const fetchUri = (uri) => {
    if (uri.startsWith("ipfs://")) {
        return axios.get(`${ipfsHead}/${uri.replace("ipfs://", "")}`).then(res => res.data)
    } else {
        return axios.get(uri).then(res => res.data)
    }
}

let globalCurrentIndex = 5
export const syncNewContractInfos = async () => {
    const provider = getProvider()

    const batchSize = 1000
    const contracts = (await sequelize.query(`
             select distinct contract from nft_transfer limit ${globalCurrentIndex},${batchSize}
        `))?.[0]?.map((c: any) => binaryToHexString(c.contract))
    if (contracts?.length) {
        const existed = (await quietSequelize.query(`
            select contract from nft_contract_metadata where contract in (
        ${contracts.map(c => `x'${c.substring(2)}'`).join(",")}
            )
       `))?.[0]?.map((c: any) => binaryToHexString(c.contract))
        const notExisted = contracts.filter(c1 => existed.indexOf(c1) == -1)
        for (const contract of notExisted) {
            try {
                const contractObj = new ethers.Contract(contract, nftAbi, provider)

                let supply = 0
                try {
                    supply = parseInt((await contractObj.totalSupply())?.toString())
                } catch (e) {
                    console.log(`error 1 - ${contract}`)
                }

                let name: any = ""
                try {
                    name = await contractObj.name()
                } catch (e) {

                    console.log(`error 2 - ${contract}`)
                }

                let owner: any = null
                try {
                    const tmp = await contractObj.owner()
                    owner = hexStringToBinary(tmp)
                } catch (e) {

                    console.log(`error 3 - ${contract}`)
                }

                let metadata = ""
                try {
                    const contractURI = await contractObj.contractURI()
                    if (contractURI) {
                        const metadataRaw = await fetchUri(contractURI)
                        metadata = JSON.stringify(metadataRaw)
                    }
                }
                catch (e) {
                    console.log(`error 4 - ${contract}`)
                }
                console.log("metadata", metadata)
                await nftContractMetadata.create({
                    contract: hexStringToBinary(contract),
                    name,
                    supply,
                    owner,
                    metadata
                }, {
                    ignoreDuplicates: true
                })

                console.log(`finished - ${globalCurrentIndex} - ${contract}`)
                globalCurrentIndex++;
            } catch (e) {
                console.error(e)
                console.log(`failed - ${contract}`)
            }
            await sleep(1000)
        }
        return true
    } else {
        return false
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
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "tokenURI",
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