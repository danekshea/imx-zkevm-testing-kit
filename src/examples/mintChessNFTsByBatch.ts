import { collectionAddress } from "../../config";
import { getWallet } from "../utils";
import { ERC721Client } from "@imtbl/contracts";

const destinationAddress = "0x42c2d104C05A9889d79Cdcd82F69D389ea24Db9a";

export const gasOverrides = {
  maxPriorityFeePerGas: 100e9, // 100 Gwei
  maxFeePerGas: 150e9,
  gasLimit: 400000, // Set an appropriate gas limit for your transaction
};

const batchMintChessNFTs = async () => {
  const wallet = getWallet();

  const provider = wallet.provider;
  const contract = new ERC721Client(collectionAddress);
  // We can use the read function hasRole to check if the intended signer
  // has sufficient permissions to mint before we send the transaction
  const minterRole = await contract.MINTER_ROLE(provider);
  const hasMinterRole = await contract.hasRole(provider, minterRole, wallet.address);

  if (!hasMinterRole) {
    // Handle scenario without permissions...
    console.log("Account doesnt have permissions to mint. Try using the grant minter role function.");
    return Promise.reject(new Error("Account doesnt have permissions to mint."));
  }

  const mints = [
    {
      to: destinationAddress,
      quantity: 10,
    },
  ];

  // Rather than be executed directly, contract write functions on the SDK client are returned
  // as populated transactions so that users can implement their own transaction signing logic.
  const populatedTransaction = await contract.populateMintBatchByQuantity(mints);
  const txhash = await wallet.sendTransaction({ ...populatedTransaction, ...gasOverrides });
  console.log(txhash); // To get the TransactionResponse value
  return txhash;
};

batchMintChessNFTs()
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.log(error);
  });
