import { syncNewContractInfos } from "../service/schedule/contractSyncer";

const _main = () => {
    while (syncNewContractInfos()) { 
        
    }
}

_main()