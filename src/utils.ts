import { Wallet, getDefaultProvider, providers } from "ethers";
import { RPC } from "../config";
import { config } from 'dotenv';
import path from 'path';

// Function to load .env file
const loadEnv = () => {
  if (!process.env.PRIVATE_KEY) {
    config({ path: path.resolve(__dirname, '../.env') });
  }
};

export const getWallet = (): Wallet => {
  loadEnv();
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("No private key found in .env file");
  }
  const provider = getRPCProvider(); // getRPCProvider will throw an error if it fails
  return new Wallet(privateKey, provider);
};

export const getRPCProvider = (): providers.Provider => {
  loadEnv();
  if (!RPC) {
    throw new Error("No RPC URL provided in config");
  }
  return getDefaultProvider(RPC);
};
