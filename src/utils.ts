import { Wallet, getDefaultProvider, providers } from "ethers";
import { RPC } from "../config";
import { config } from "dotenv";
import path from "path";
const jwt = require("jsonwebtoken");
const jwkToPem = require("jwk-to-pem");
const axios = require("axios");
import { promisify } from "util";
import { IMX_JWT_KEY_URL } from "./config";
import { createVerify } from "crypto";
const SnsValidator = require("sns-validator");
const validator = new SnsValidator();

// Function to load .env file
const loadEnv = () => {
  if (!process.env.PRIVATE_KEY) {
    config({ path: path.resolve(__dirname, "../.env") });
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

export async function verifyIDToken(IDtoken: string, IMX_JWT_KEY_URL: string): Promise<void> {
  try {
    const response = await axios.get(IMX_JWT_KEY_URL);
    const jwks = response.data;

    // Select the key you want to use, likely you'll want the first one
    const jwk = jwks.keys[0];

    // Convert the JWK to a PEM
    const pem = jwkToPem(jwk);

    // Convert jwt.verify to a promise-based function
    const verifyPromise = promisify(jwt.verify);

    try {
      const decoded = await verifyPromise(IDtoken, pem, { algorithms: ["RS256"] });
      console.log("JWT verified:", decoded);
    } catch (err) {
      console.log("JWT verification failed:", err);
      throw err;
    }
  } catch (error) {
    console.error("Error during token verification:", error);
    throw error;
  }
}

export async function decodeIDToken(IDtoken: string): Promise<PassportIDToken> {
  const decoded: PassportIDToken = jwt.decode(IDtoken, { complete: true });
  //console.log("Decoded JWT:", decoded);
  return decoded;
}

export async function verifySNSSignature(webhookPayload: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    validator.validate(webhookPayload, (err) => {
      if (err) {
        console.error("Signature validation failed:", err);
        reject(false);
      } else {
        console.log("Signature verification successful");
        resolve(true);
      }
    });
  });
}
