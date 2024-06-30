import { EAS, Offchain, SchemaEncoder, SchemaRegistry, TransactionSigner } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
dotenv.config();

export const EASContractAddress = "0x4200000000000000000000000000000000000021"; // Sepolia v0.26
export const EASSchemaRegistryAddress = "0x4200000000000000000000000000000000000020"
// Initialize the sdk with the address of the EAS Schema contract address

const _main = async () => {

    const eas = new EAS(EASContractAddress);
    const provider = new ethers.JsonRpcProvider("https://maximum-spring-daylight.base-sepolia.quiknode.pro/f80c89e1e8f03bdb4eea77aa68bf8546d8862cc5/")
console.log(process.env.PRIVATE_KEY)
0xef2dbf5e8da46ea760bb4c6eb2635bf04adfc1ade6158e594263363db2a55bcf
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider)

    eas.connect(wallet as any);

    const schemaRegistry = new SchemaRegistry(EASSchemaRegistryAddress);

    schemaRegistry.connect(wallet as any);

    const schema = "uint256 score";
    // const resolverAddress = "0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0"; // Sepolia 0.26
    const revocable = true;

    const transaction = await schemaRegistry.register({
        schema,
        revocable,
    });
console.log(transaction)
    // Optional: Wait for transaction to be validated
    await transaction.wait();
    console.log()
}

_main()