import { collectionAddress } from "../../config";
import { getWallet } from "../utils";
import { ERC721Client } from "@imtbl/contracts";

const destinationAddress = "0x7CEeF3f09F2d3D6f7AdD17ff35B129094dFE6df7";

export const gasOverrides = {
  maxPriorityFeePerGas: 100e9, // 100 Gwei
  maxFeePerGas: 150e9,
  gasLimit: 3500000, // Set an appropriate gas limit for your transaction
};

const mintChessNFTsByID = async () => {
  const wallet = getWallet();

  const contract = new ERC721Client(collectionAddress);
  const provider = wallet.provider;

  const minterRole = await contract.MINTER_ROLE(provider);

  const hasMinterRole = await contract.hasRole(provider, minterRole, wallet.address);

  if (!hasMinterRole) {
    // Handle scenario without permissions...
    console.log("Account doesnt have permissions to mint. Try using the grant minter role function.");
    return Promise.reject(new Error("Account doesnt have permissions to mint."));
  }

  // Construct the mint requests
  const requests = [
    {
      to: destinationAddress,
      tokenIds: Array.from({ length: 100 }, (_, i) => i + 1),
    },
  ];

  // Rather than be executed directly, contract write functions on the SDK client are returned
  // as populated transactions so that users can implement their own transaction signing logic.
  const populatedTransaction = await contract.populateMintBatch(requests);
  const result = await wallet.sendTransaction({ ...populatedTransaction, ...gasOverrides });
  console.log(result); // To get the TransactionResponse value
  return result;
};

mintChessNFTsByID()
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.log(error);
  });
