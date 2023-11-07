import { Wallet, getDefaultProvider, providers } from "ethers";
import { RPC } from "../config";

export const getWallet = (): Wallet => {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("No private key found in .env file");
  }
  const provider = getRPCProvider(); // getRPCProvider will throw an error if it fails
  return new Wallet(privateKey, provider);
};

export const getRPCProvider = (): providers.Provider => {
  if (!RPC) {
    throw new Error("No RPC URL provided in config");
  }
  return getDefaultProvider(RPC);
};
