import { ethers } from "ethers";
import { AbstractCredentialCalculator, CalculateResult, MODE } from "../types";
import { getProvider } from "../../lib/utils";


const balanceOfAbi = [{
    "inputs": [
        {
            "internalType": "address",
            "name": "owner",
            "type": "address"
        }
    ],
    "name": "balanceOf",
    "outputs": [
        {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }
    ],
    "stateMutability": "view",
    "type": "function"
}]

class NftHoldingsCalcualator extends AbstractCredentialCalculator {

    _network
    _contract

    constructor(network, contract) {
        super()
        this._network = network
        this._contract = contract
    }

    getMode(): MODE {
        return MODE.DISABLE_CACHE
    }

    getNetworks(): number[] | null {
        return [this._network]
    }

    async process(owner: string, start?: number, end?: number): Promise<CalculateResult> {

        const contract = new ethers.Contract(
            this._contract,
            [{
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "owner",
                        "type": "address"
                    }
                ],
                "name": "balanceOf",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            }],
            getProvider(this._network)
        );

        return {
            value: parseInt((await contract.balanceOf(owner)).toString() || "0"),
            txs: []
        }
    }
}

export default NftHoldingsCalcualator