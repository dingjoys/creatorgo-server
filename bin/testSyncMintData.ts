import { syncMintData } from "../service/schedule/mintDataSyncer"

const _main = async () => {
    while (await syncMintData()) {

    }
}
_main()