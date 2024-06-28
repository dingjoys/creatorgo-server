import { sleep } from "../service/lib/utils";
import { syncNewContractInfos } from "../service/schedule/contractSyncer";

const _main = async () => {
    while (await syncNewContractInfos()) {
    }
}

_main()