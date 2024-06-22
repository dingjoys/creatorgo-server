import fs from 'fs';
import path from 'path';
import { loadJSONData } from '../lib/utils';
import { Collection, Credential } from "./types";
import NftHoldingsCalcualator from './nft_holdings';

// const __dirname = path.resolve();

export function list() {
    const collections: Collection[] = []
    const projectsPath = path.join(__dirname, "strategies");
    const files = fs.readdirSync(projectsPath);
    for (let i = 0; i < files.length; i++) {
        let file = files[i]
        const collectionDirPath = path.join(projectsPath, file);
        const stat = fs.statSync(collectionDirPath);
        if (stat.isDirectory()) {
            let projectMetadata = loadJSONData(path.join(collectionDirPath, "metadata.json"));
            const subfiles = fs.readdirSync(collectionDirPath);
            let credentials: Credential[] = []

            for (let j = 0; j < subfiles.length; j++) {
                const subfile = subfiles[j];
                if (fs.statSync(path.join(collectionDirPath, subfile)).isDirectory()) {
                    let credentialMetadata = loadJSONData(path.join(collectionDirPath, subfile, "metadata.json"));
                    credentials.push({ slug: `${file}/${subfile}`, metadata: credentialMetadata })
                }
            }
            collections.push({
                slug: file,
                metadata: projectMetadata,
                credentials
            })
        }
    }
    return collections;
}


const networkExample = 100;
const contractExample = "0x22c1f6050e56d2876009903609a2cc3fef83b415"
export const validate = async (owner, proposalId) => {
    return 10
    // return (await (new NftHoldingsCalcualator(networkExample, contractExample).calculate(owner))).value > 0
}