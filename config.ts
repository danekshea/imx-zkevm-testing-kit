import { config } from "@imtbl/sdk";

export const RPC = "https://rpc.testnet.immutable.com";

export const API_URL = "https://api.sandbox.immutable.com";

export const environment = config.Environment.SANDBOX;

export const collectionAddress: string = "0x88b87272649b3495d99b1702f358286b19f8c3da";

export const mintingAPIAddressSandbox: string = "0x9CcFbBaF5509B1a03826447EaFf9a0d1051Ad0CF";

export const mintingAPIAddressMainnet: string = "0xbb7ee21AAaF65a1ba9B05dEe234c5603C498939E";

export const gasOverrides = {
  maxPriorityFeePerGas: 100e9, // 100 Gwei
  maxFeePerGas: 150e9,
  gasLimit: 200000, // Set an appropriate gas limit for your transaction
};
