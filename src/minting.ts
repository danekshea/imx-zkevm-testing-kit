import { getDefaultProvider, Wallet } from "ethers"; // ethers v5
import { Provider, TransactionResponse } from "@ethersproject/providers"; // ethers v5
import { ERC721Client } from "@imtbl/contracts";
import { collectionAddress, gasOverrides, mintingAPIAddressSandbox, API_URL } from "../config";
import { RPC } from "../config";
import { blockchainData, config as sdkConfig } from "@imtbl/sdk";
import { Types } from "@imtbl/sdk/dist/blockchain_data";
import { getRPCProvider, getWallet } from "./utils";
require("dotenv").config();

const mintByID = async (wallet: Wallet, contractAddress: string): Promise<TransactionResponse> => {
  const contract = new ERC721Client(contractAddress);
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
      to: "0xd087DE864C9723045A82DEf0566A0bB6436905Bd",
      tokenIds: [11, 12, 13],
    },
  ];

  // Rather than be executed directly, contract write functions on the SDK client are returned
  // as populated transactions so that users can implement their own transaction signing logic.
  const populatedTransaction = await contract.populateMintBatch(requests);
  const result = await wallet.sendTransaction({ ...populatedTransaction, ...gasOverrides });
  console.log(result); // To get the TransactionResponse value
  return result;
};

const mintByBatch = async (wallet: Wallet, contractAddress: string): Promise<TransactionResponse> => {
  const provider = wallet.provider;
  const contract = new ERC721Client(contractAddress);
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
      to: "0x42c2d104C05A9889d79Cdcd82F69D389ea24Db9a",
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

const mintByMintingAPI = async (contractAddress: string): Promise<blockchainData.Types.CreateMintRequestResult> => {
  //Remember to grant the minting role to the mintingAPIAddress
  const config: blockchainData.BlockchainDataModuleConfiguration = {
    baseConfig: new sdkConfig.ImmutableConfiguration({
      environment: sdkConfig.Environment.SANDBOX,
    }),
    overrides: {
      basePath: API_URL,
      headers: {
        "x-immutable-api-key": process.env.IMMUTABLE_API_KEY!,
      },
    },
  };

  const client = new blockchainData.BlockchainData(config);

  const chainName = "imtbl-zkevm-testnet";

  const response = await client.createMintRequest({
    chainName,
    contractAddress,
    createMintRequestRequest: {
      assets: [
        {
          owner_address: "0x42c2d104C05A9889d79Cdcd82F69D389ea24Db9a",
          reference_id: "1",
          //Remove token_id line if you want to batch mint
          token_id: "2",
          metadata: {
            name: "Amar Gambit",
            description: null,
            image: "https://raw.githubusercontent.com/danekshea/imx-zkevm-testing-kit/master/data/chessnfts/images/1.svg",
            animation_url: null,
            youtube_url: null,
            attributes: [
              {
                trait_type: "eco",
                value: "A00",
              },
              {
                trait_type: "FEN",
                value: "rn1qkbnr/ppp2ppp/8/3p4/5p2/6PB/PPPPP2P/RNBQK2R w KQkq - 0 5",
              },
            ],
          },
        },
      ],
    },
  });
  return response;
};

const grantMinterRole = async (wallet: Wallet, minterRoleAddress: string, contractAddress: string): Promise<TransactionResponse> => {
  const contract = new ERC721Client(contractAddress);
  const tx = await contract.populateGrantMinterRole(minterRoleAddress);
  console.log(`Granting minter role to ${minterRoleAddress} on ${contractAddress}...`);

  const txhash = await wallet.sendTransaction({ ...tx, ...gasOverrides });
  console.log(`Transaction hash: ${txhash.hash}`);

  return txhash;
};

const getAdmins = async (provider: Provider, contractAddress: string) => {
  const contract = new ERC721Client(contractAddress);
  const admins = await contract.getAdmins(provider);
  console.log(admins);
};

const setRoyalty = async (wallet: Wallet, contractAddress: string): Promise<TransactionResponse> => {
  const contract = new ERC721Client(contractAddress);

  const requests = [
    {
      tokenId: 10,
      receiver: wallet.address,
      feeNumerator: 200,
    },
  ];
  const royaltyTX = await contract.populateSetNFTRoyaltyReceiver(requests[0].tokenId, requests[0].receiver, requests[0].feeNumerator);

  const txhash = await wallet.sendTransaction({ ...royaltyTX, ...gasOverrides });

  return txhash;
};

const getRoyalty = async (provider: Provider, contractAddress: string) => {
  const contract = new ERC721Client(contractAddress);
  // The wallet of the intended signer of the mint request
  const result = await contract.royaltyInfo(provider, 1, 1000);
  return result;
};

const setBaseURI = async (wallet: Wallet, contractAddress: string, url: string): Promise<TransactionResponse> => {
  const contract = new ERC721Client(contractAddress);

  // Get the transaction data from the contract
  const result = await contract.populateSetBaseURI(url);

  // Modify the transaction data with gas overrides
  const txhash = await wallet.sendTransaction({ ...result, ...gasOverrides });

  return txhash;
};

const getInfo = async (contractAddress: string) => {
  const contract = new ERC721Client(contractAddress);
  const provider = await getRPCProvider();

  console.log("Base URI: " + (await contract.baseURI(provider).catch((e) => "Call failed")));
  console.log("Contract URI: " + (await contract.contractURI(provider).catch((e) => "Call failed")));
  console.log("Name: " + (await contract.name(provider).catch((e) => "Call failed")));
  console.log("Symbol: " + (await contract.symbol(provider).catch((e) => "Call failed")));
  console.log("Total Supply: " + (await contract.totalSupply(provider).catch((e) => "Call failed")));
  console.log("Operator Allowlist: " + (await contract.operatorAllowlist(provider).catch((e) => "Call failed")));
  console.log("Domain Separator: " + (await contract.DOMAIN_SEPARATOR(provider).catch((e) => "Call failed")));
  console.log("Default Admin Role: " + (await contract.DEFAULT_ADMIN_ROLE(provider).catch((e) => "Call failed")));
  console.log("Minter Role: " + (await contract.MINTER_ROLE(provider).catch((e) => "Call failed")));
  console.log("EIP712 Domain: " + (await contract.eip712Domain(provider).catch((e) => "Call failed")));
};

// mintByMintingAPI(collectionAddress).then((result) => {
//   console.log(result);
// });

// getInfo(collectionAddress).then((result) => {
// }).catch((err) => {
//   console.log(err);
// })

// const wallet = getWallet();
// mintByID(wallet, collectionAddress).then((txhash) => {
//   console.log(txhash);
// }
// ).catch((err) => {
//   console.log(err);
// })

// const wallet = getWallet();
// grantMinterRole(wallet, mintingAPIAddressSandbox, collectionAddress)
//   .then((txhash) => {
//     console.log(txhash);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// getTotalSupply(collectionAddress).then((result) => {
//   console.log(result);
// });

// const wallet = getWallet();
// mintByBatch(wallet, collectionAddress).then((tx) => {
//   console.log("Minting TXHash:", tx);
// }).catch((err) => {
//   console.log(err);
// });

// const wallet = getWallet();
// const url = 'https://raw.githubusercontent.com/danekshea/imx-zkevm-testing-kit/master/data/chessnfts/metadata/';
// setBaseURI(wallet, collectionAddress, url).then((txhash) => {
//   console.log(txhash);
// }
// ).catch((err) => {
//   console.log(err);
// })

// getRoyalty(provider).then((result) => {
//     console.log(result[0]);

//     //convert a big number to normal number
//     const fee = result[1].toNumber();
//     console.log(fee);
// }
// ).catch((err) => {
//     console.log(err);
// })

// setRoyalty(provider).then((result) => {
//   console.log(result);
// }).catch((err) => {
//   console.log(err);
// })
