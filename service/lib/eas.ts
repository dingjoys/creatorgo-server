import { EAS, Offchain, SchemaEncoder, SchemaRegistry, TransactionSigner, } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import { hexString } from "../types";
dotenv.config();

export const EASContractAddress = "0x4200000000000000000000000000000000000021";
export const EASSchemaRegistryAddress = "0x4200000000000000000000000000000000000020"

const createSchema = async () => {
    const provider = new ethers.JsonRpcProvider("https://maximum-spring-daylight.base-sepolia.quiknode.pro/f80c89e1e8f03bdb4eea77aa68bf8546d8862cc5/")
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider)

    const schemaRegistry = new SchemaRegistry(EASSchemaRegistryAddress);
    schemaRegistry.connect(wallet as any);

    const schema = "uint256 score";
    // const resolverAddress = "0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0";
    const revocable = true;

    const transaction = await schemaRegistry.register({
        schema,
        revocable,
    });
    console.log(transaction)
    // Optional: Wait for transaction to be validated
    await transaction.wait();
}

export const issue = async (to: hexString, score) => {
    const eas = new EAS(EASContractAddress);
    const provider = new ethers.JsonRpcProvider("https://maximum-spring-daylight.base-sepolia.quiknode.pro/f80c89e1e8f03bdb4eea77aa68bf8546d8862cc5/")
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider)

    eas.connect(wallet as any);
    const schemaEncoder = new SchemaEncoder("uint256 score");
    const encodedData = schemaEncoder.encodeData([
        { name: "score", value: Math.floor(score), type: "uint256" },
    ]);

    const schemaUID = "0xef2dbf5e8da46ea760bb4c6eb2635bf04adfc1ade6158e594263363db2a55bcf";
    const tx = await eas.attest({
        schema: schemaUID,
        data: {
            recipient: to,
            expirationTime: BigInt(0),
            revocable: true, // Be aware that if your schema is not revocable, this MUST be false
            data: encodedData,
        },
    });

    const newAttestationUID = await tx.wait();

    console.log("New attestation UID:", newAttestationUID);
    return newAttestationUID
}
