import { syncTokenMetadata } from "../service/schedule/tokenMetadataSyncer"

const foo = async () => {
    while (await syncTokenMetadata()) {
        console.log("finished page x")
    }
}

foo()