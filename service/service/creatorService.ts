import { fn, literal, Op } from "sequelize";
import { binaryToHexString, binaryToNumber, fetchAPiOrIpfsData, getProvider, hexStringToBinary, redis } from "../lib/utils";
import { quietSequelize, sequelize } from "../model";
import { nftContractMetadata as NftContractMetadata } from "../model/nftContractMetadata";
import { NftTransfer } from "../model/nftTransfer";
import { hexString } from "../types";
import axios from 'axios'
import { BigNumberish, ethers } from "ethers";
import { nftAbi } from "../schedule/contractSyncer";
import { NftMintData } from "../model/nftMintData";
import { NftTokenMetadata } from "../model/nftTokenMetadata";

type Creator = {
    address: hexString,
    contracts: {
        metadata: string,
        address: hexString,
        supply: number,
        uniqueHolderNumber: number,
        whaleNumber: number,
    }[],
    best_srcs: string[], // 随机挑选
    score: number,
    uniqueHolderNumber: number,
    whaleNumber: number,
}

let whales: string[] = []
const getWhales = async () => {
    if (whales.length) {
        return whales
    } else {
        while (whales.length < 1000) {
            const result = (await axios.get(`https://restapi.nftscan.com/api/v2/statistics/ranking/wallet?sort_field=holding_volume&sort_direction=desc&limit=100&offset=${whales.length}`, {
                headers: {
                    'X-API-KEY': 'B8Jsv1hdmcMfz3oYEcXNxYbP'
                }
            }))?.data
            whales = whales.concat(result?.data?.map(d => d.account_address.toLowerCase()))
        }
        return whales
    }
}
export const randomCreators = async (limit, offset) => {
    // const owners: any[] = await NftContractMetadata.findAll({
    //     attributes: [[literal("distinct(owner)"), "owner"]],
    //     order: [fn("rand")],
    //     // where: { supply: { [Op.gt]: 100 } },
    //     raw: true, limit: 5, offset: offset || 0
    // })

    const ownersRaw: any = await sequelize.query(`
        select distinct (owner) from (
        select tmp.*, sum(nft_mint_data.max_token_id) as max_token_id from (select nft_contract_metadata.owner from nft_contract_metadata left join nft_mint_data on nft_contract_metadata.contract = nft_mint_data.contract
where nft_mint_data.mint_count > 100 
order by nft_contract_metadata.id desc) as tmp
join nft_contract_metadata on tmp.owner = nft_contract_metadata.owner
join nft_mint_data on nft_contract_metadata.contract = nft_mint_data.contract
where max_token_id<20
group by tmp.owner limit 100) as tmp
        order by rand() limit ${offset || 0},${limit || 5}
        `)
    const owners = ownersRaw?.[0]

    const data = await Promise.all(owners?.map(o => getCreatorData(binaryToHexString(o.owner)))).then(d => d).catch(es => {
        console.log(es)
    })
    return data
}

export const getCreatorData = async (address) => {
    const redisKey = `CreatorData-4-${address}`
    if (await redis.get(redisKey)) {
        return JSON.parse(await redis.get(redisKey))
    }

    const contracts: any[] = await NftContractMetadata.findAll({
        where: {
            owner: hexStringToBinary(address),

        }, raw: true
    })
    const minted = await NftTransfer.count({
        where: {
            to: binaryToHexString(address),
            [Op.and]: [literal("`from`=x'0000000000000000000000000000000000000000'")]
        },
    })
    let zora = {}
    try {
        zora = (await axios.get(`https://zora.co/api/profiles/${ethers.getAddress(address)}?expandedData=true`)).data
    }
    catch (e) {

    }

    if (contracts.length) {
        const mintData: any[] = await NftMintData.findAll({
            where: contracts?.length ? {
                contract: { [Op.in]: contracts.map(c => c.contract) }
            } : {}, raw: true
        })
        console.log(1)
        const recentMintersRaw: any = await sequelize.query(`
            SELECT \`to\`, contract
            FROM (
                SELECT 
                    \`to\`, contract,
                    ROW_NUMBER() OVER (PARTITION BY contract ORDER BY (SELECT NULL)) AS rn
                FROM nft_transfer_2
                ${contracts?.length ? `WHERE contract IN (${contracts.map(c => `x'${binaryToHexString(c.contract).substring(2)}'`).join(",")})` : ""}
            ) AS ranked
            WHERE rn <= 5;
            `)

        const recentMinters = recentMintersRaw?.[0]?.map(
            raw => ({ owner: binaryToHexString(raw.to), contract: binaryToHexString(raw.contract) })
        )
        console.log(2)
        const uniqueMinters = await NftTransfer.findAndCountAll(
            {
                attributes: [[literal("distinct(`to`)"), "owner"]],
                where: {
                    contract: { [Op.in]: contracts.map(c => c.contract) },
                    [Op.and]: [literal("`from`=x'0000000000000000000000000000000000000000'")]
                },
                raw: true, limit: 1000000
            }
        )

        console.log(3)
        const recentMints: any[] = await NftTransfer.findAll(
            {
                where: {
                    contract: { [Op.in]: contracts.map(c => c.contract) },
                    [Op.and]: [literal("`from`=x'0000000000000000000000000000000000000000'")]
                },
                raw: true, limit: 10,
                order: [["id", "desc"]]
            }
        )
        console.log(4)
        const tmpWhaleAddress = await getWhales()
        const whaleNumber = uniqueMinters.rows.filter((r: any) => {
            return tmpWhaleAddress.indexOf(binaryToHexString(r.owner).toLowerCase()) > -1
        }).length

        const firstMintBlockNumber = ((await NftTransfer.findOne(
            {
                where: {
                    contract: { [Op.in]: contracts.map(c => c.contract) },
                    [Op.and]: [literal("`from`=x'0000000000000000000000000000000000000000'")]
                },
                raw: true, order: [["id", "asc"]]
            }
        )) as any)?.block_number

        console.log(5)
        const provider = getProvider()
        const collections: any[] = []
        for (let c of contracts) {
            const mintfun = (await axios.get(`https://mint.fun/api/mintfun/contract/7777777:${binaryToHexString(c.contract)}/details`)).data
            console.log(binaryToHexString(c.contract))
            collections.push({
                // metadata: await getContractMetadata(binaryToHexString(c.contract), provider),
                tokens: await getCollectionData(binaryToHexString(c.contract), provider),
                mintfun,
                contract: binaryToHexString(c.contract)
            })
        }

        console.log(6)
        const creationCounts = (await quietSequelize.query(`
            select count(*) as \`count\` from (select distinct(token_id) from nft_transfer_2 where 
            contract in ( ${contracts.map(c => `x'${binaryToHexString(c.contract).substring(2)}'`).join(",")} )
            ) as tmp
        `) as any)?.[0]?.[0]?.count

        console.log(7)
        const activeMintBlockNumber = (await quietSequelize.query(`
            select count(*) from (select distinct(block_number) from nft_transfer_2 where 
            contract in ( ${contracts.map(c => `x'${binaryToHexString(c.contract).substring(2)}'`).join(",")} )
            ) as tmp
        `) as any)?.[0]?.[0]?.count

        console.log(8)

        const result = {
            address,
            uniqueHolderNumber: uniqueMinters.count,
            totalAmount: mintData.reduce((total, curr) => total + curr.total_amount, 0),
            totalMint: mintData.reduce((total, curr) => total + curr.mint_count, 0),
            whaleNumber,
            collections,
            score: 0,
            recentMints: recentMints.map(m => {
                return {
                    contract: binaryToHexString(m.contract),
                    token_id: binaryToHexString(m.token_id),
                    minter: binaryToHexString(m.to),
                    block_number: m.block_number
                }
            }),
            firstMintBlockNumber,
            zora,
            minted,
            creationCounts,
            activeMintBlockNumber,
            recentMinters
        }
        result.score = await calcScore(result)
        await redis.set(redisKey, JSON.stringify(result))
        return result
    } else {
        return {
            minted,
            zora,
            score: calcScore({ minted })
        }
    }
}

export const getCollectionData = async (contract, provider) => {
    const tokenIds: any = await NftTransfer.findAll({
        attributes: ["token_id", [literal("sum(amount)"), "total_amount"]],
        where: {
            contract: hexStringToBinary(contract),
            [Op.and]: [literal("`from`=x'0000000000000000000000000000000000000000'")]
        },
        group: ["token_id"],
        limit: 100000,
        raw: true
    })
    console.log(6.1)
    const metadatas: any[] = tokenIds?.length ? (await NftTokenMetadata.findAll({
        where: {
            [Op.or]: tokenIds.map(ti => {
                return {
                    token_id: ti.token_id,
                    contract: ti.contract
                }
            })
        }, raw: true
    })) : []
    console.log(6.2)
    const data: any[] = []
    // for (let i = 0; i < 3 && i < tokenIds.length; i++) {
    for (let i = 0; i < tokenIds.length; i++) {
        let tokenIdObj = tokenIds[i]
        // const img = await getNftMetadata(contract, binaryToNumber(tokenIdObj.token_id), provider)
        data.push({
            tokenId: binaryToNumber(tokenIdObj.token_id).toString(),
            total_amount: tokenIdObj.total_amount,
            metadata: metadatas.find(md => md.contract == tokenIdObj.contract && md.token_id == tokenIdObj.token_id)
        })
    }

    return data
}

export const getContractMetadata = async (contract, provider) => {
    const contractObj = new ethers.Contract(contract, nftAbi, provider)
    try {
        const contractURI = await contractObj.contractURI()
        if (contractURI) {
            const metadataRaw = await fetchAPiOrIpfsData(contractURI)
            return metadataRaw
        }
    }
    catch (e) {
        console.log(`error 4 - ${contract}`)
    }
}

export const getNftMetadata = async (contract, tokenId: BigNumberish, provider) => {
    const contractObj = new ethers.Contract(contract, nftAbi, provider)
    try {
        const uri = await contractObj.uri(tokenId)
        if (uri) {
            const result = await fetchAPiOrIpfsData(uri)
            return result;
            if (result.image) {
                return (result.image)
            }
        }
    } catch (e) {
        try {
            const uri = await contractObj.tokenURI(tokenId)
            if (uri) {
                const result = await fetchAPiOrIpfsData(uri)
                return result;
                if (result.image) {
                    return result.image
                }
            }

        } catch (e2) {
            return null
        }
    }
}

export const calcScore = (data) => {
    let score = 0
    // 1. sold total nfts
    // 2. earnings
    // 3. mint days - engagement
    // 4. whales
    // 5. 
    // const data = 
    // {
    //     uniqueHolderNumber: uniqueMinters.count,
    //     totalAmount: mintData.reduce((total, curr) => total + curr.total_amount, 0),
    //     totalMint: mintData.reduce((total, curr) => total + curr.mint_count, 0),
    //     whaleNumber,
    //     collections,
    //     score: calcScore(address),
    //     recentMints: recentMints.map(m => {
    //         return {
    //             contract: binaryToHexString(m.contract),
    //             token_id: binaryToHexString(m.token_id),
    //             minter: binaryToHexString(m.to),
    //             block_number: m.block_number
    //         }
    //     }),
    //     firstMintBlockNumber,
    //     zora,
    //     minted
    // }
    // const rawData = await getCreatorData(address)
    score += (Math.min((data.minted || 0) / 1 * 20, 10))
    score += (Math.min((data.uniqueHolderNumber || 0) / 1000 * 20, 10))
    score += (Math.min((data.whaleNumber || 0) / 10 * 20, 10))
    score += (Math.min((data.creationCounts || 0) / 20 * 20, 10))
    score += (Math.min((data.activeMintBlockNumber || 0) / 1000 * 20, 10))

    return score
}