import { config } from "@imtbl/sdk";

export const RPC = "https://rpc.testnet.immutable.com";

export const environment = config.Environment.SANDBOX;

export const collectionAddress:string = '0xe5e2c6ef80122c8036b2f9cd8781d170e80ca970';

export const gasOverrides = {
  maxPriorityFeePerGas: 100e9, // 100 Gwei
  maxFeePerGas: 150e9,
  gasLimit: 200000, // Set an appropriate gas limit for your transaction
};