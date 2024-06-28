
import config from "config";
import { BigNumber, BigNumberish, ethers } from 'ethers';
import { hexString } from "../types";
const fs = require("fs");

export async function sleep(ms: number) {
  return new Promise(resolve => { setTimeout(resolve, ms) })
}

export function loadJSONData(filePath) {
  try {
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(jsonData);
    return data;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return {}
    } else {
      throw error;
    }
  }
}

export const getProvider = (chain?: any) => {
  return new ethers.providers.JsonRpcProvider(
    "https://rpc-zora-mainnet-0.t.conduit.xyz/A1RqteMBmSBumexysZZz3Lb6gBU4uG1Dc"
  );
};

export const compareIgnoringCase = (str1: string | null, str2: string | null) => {
  return str1 && str2 && str1.toLowerCase() === str2.toLowerCase();
};

function getRandomInteger(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const getRandomSeiRpcUrl = (chainId) => {
  const _rpcEndpoints = config.sei_rpc_endpoints[chainId];
  if (!_rpcEndpoints || !_rpcEndpoints.length)
    return null;
  const rpcEndpoint = _rpcEndpoints[getRandomInteger(0, _rpcEndpoints.length - 1)]
  return rpcEndpoint
}
exports.getRandomSeiRpcUrl = getRandomSeiRpcUrl

/**
 * @param abi target object
 */
export const getAbiParamType = (abi, eventDataAnalysis?: boolean) => {
  if (eventDataAnalysis) {
    return abi.inputs.filter(input => input.indexed != true).map((input) => {
      if (input.type == 'tuple') {
        return `tuple(${input.components.map(c => c.type).join(",")})`
      } else return input.type
    })
  } else {
    return abi.inputs.map((input) => {
      if (input.type == 'tuple') {
        return `tuple(${input.components.map(c => c.type).join(",")})`
      } else return input.type
    })
  }
}
exports.getAbiParamType = getAbiParamType;

export const getAbiParamTypeFromSimple = (abiSimple) => {
  try {
    let params = abiSimple.split("(")[1].split(")")[0].split(",").map(s => s.split(" ")[0])
    return params.map((input) => {
      return input
    })

  } catch (e) { return "" }
}

export const DefaultResponse = (data?, ctx?) => {
  return {
    data: data == null ? 200 : data,
    code: 0,
    msg: "success",
    auth: ctx?.auth
  }
}
export const DefaultError = (msg, code?) => {
  return {
    data: {},
    code: code || 99,
    msg
  }
}
exports.DefaultError = DefaultError;

export const ERROR_CODE_PARAM_ERROR = 400
export const ERROR_CODE_DURATION = 401

export const hexStringToBinary = (owner) => {
  if (!(owner?.length >= 2)) {
    return null
  }
  if (owner.startsWith("0x"))
    return Buffer.from(owner.toLowerCase().slice(2), 'hex');
  else
    return Buffer.from(owner.toLowerCase(), 'hex');
}

export const binaryToHexString = (binary: any) => {
  if (!binary) {
    return null
  }

  try {
    if (binary?.startsWith("0x")) {
      return binary
    }
  } catch (e) { }

  return `0x${binary.toString('hex')}`;
}

export const numberishToBinary = (number: BigNumberish) => {
  if (BigNumber.from(number.toString()).isZero())
    return Buffer.from("")
  const buffer = Buffer.from(
    `${BigNumber.from(number.toString()).toHexString().slice(2)}`,
    'hex');
  return buffer;
}

export const binaryToNumber = (binary) => {
  if (!binary || !binary?.length) {
    return BigNumber.from(0);
  }
  return BigNumber.from(`0x${binary.toString('hex')}`);
}

export const unique = (arr: number[]) => {
  if (!arr?.length)
    return []
  return [...new Set(arr)]
}

export const getErc20TransferTableName = (network: any, contract: hexString) => {
  return `erc20_transfer_${parseInt(network)}_${contract.substring(2).toLowerCase()}`
}
export const getErc721TransferTableName = (network: any, contract: hexString) => {
  return `erc721_transfer_${parseInt(network)}_${contract.substring(2).toLowerCase()}`
}
export const getTransactionTableName = (network: any, contract: hexString) => {
  return `tx_${parseInt(network)}_${contract.substring(2).toLowerCase()}`
}