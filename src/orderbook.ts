import { config, orderbook } from "@imtbl/sdk";
import { providers } from "ethers";
import { getDefaultProvider, Wallet } from "ethers"; // ethers v5
import { RPC, environment } from "../config";
import { getWallet } from "./utils";
import { gasOverrides } from "../config";
require("dotenv").config();

const orderbookSDK = new orderbook.Orderbook({
  baseConfig: { environment: environment },
  overrides: {
    provider: new providers.JsonRpcProvider(RPC),
  },
});

const prepareAndSignListing = async(wallet: Wallet) => {
  const provider = wallet.provider;

  const gasPrice = await provider.getGasPrice();
  const nonce = await provider.getTransactionCount(wallet.address);

  //Create the sell asset
  const sellAsset: orderbook.ERC721Item = {
    type: "ERC721",
    contractAddress: "0x908aAb24939160ACa78C4267ddc291C5891B952d",
    tokenId: "51",
  };

  //Create the buy asset
  const buyAsset: orderbook.NativeItem = {
    type: "NATIVE",
    amount: "10000000000000",
  };

  //Prepare the listing
  const result = await orderbookSDK.prepareListing({
    makerAddress: "0x42c2d104C05A9889d79Cdcd82F69D389ea24Db9a",
    sell: sellAsset,
    buy: buyAsset,
  });

  //Go through and find the transactions and actually build it and return the JSON, this will sign the approval
  for (const action of result.actions) {
    if (action.type === orderbook.ActionType.TRANSACTION) {
      console.log("Detected transaction, building and sending...");
      const builttx = await action.buildTransaction();
      builttx.gasPrice = gasPrice;
      builttx.nonce = nonce;
      console.log(builttx);
      const signedtx = await wallet.signTransaction(builttx);
      const receipt = await provider.sendTransaction(signedtx);
      console.log(`Transaction hash: ${receipt.hash}`);
    }
  }

  let signature: string = "";
  for (const action of result.actions) {
    if (action.type === orderbook.ActionType.SIGNABLE) {
      console.log("Detected signable, signing...");
      signature = await wallet._signTypedData(action.message.domain, action.message.types, action.message.value);
      console.log(`Signature: ${signature}`);
      // console.log(action.message.domain);
      // console.log(action.message.types);
      // console.log(action.message.value);
    }
  }

  console.log("Creating listing...");
  const orderResponse = await orderbookSDK.createListing({
    orderComponents: result.orderComponents,
    orderHash: result.orderHash,
    orderSignature: signature,
    makerFees: [
      {
        amount: "100",
        recipientAddress: "0x42c2d104C05A9889d79Cdcd82F69D389ea24Db9a", // Replace address with your own marketplace address
      },
    ],
  });
  console.log(`Order response: ${orderResponse}`);
  console.log(orderResponse);
}

const fulfillOrder = async(wallet: Wallet, orderID: string) => {
  
  const provider = wallet.provider;

  const gasPrice = await provider.getGasPrice();
  const nonce = await provider.getTransactionCount(wallet.address);
  
  const result = await orderbookSDK.fulfillOrder(orderID, wallet.address, [
    {
      amount: "1000000",
      recipientAddress: "0x42c2d104C05A9889d79Cdcd82F69D389ea24Db9a", // Replace address with your own marketplace address
    },
  ]);
  
  //Go through and find the transactions and actually build it and return the JSON, this will sign the approval
  for (const action of result.actions) {
    if (action.type === orderbook.ActionType.TRANSACTION) {
      console.log("Detected transaction, building and sending...");
      const builttx = await action.buildTransaction();
      builttx.gasPrice = gasPrice;
      builttx.nonce = nonce;
      console.log(builttx);
      const signedtx = await wallet.signTransaction(builttx);
      const receipt = await provider.sendTransaction(signedtx);
      console.log(`Transaction hash: ${receipt.hash}`);
    }
  }
}

const cancelOrder = async(wallet: Wallet, orderID: string) => {
  const { signableAction } = await orderbookSDK.prepareOrderCancellations([orderID]);
  const cancellationSignature = await wallet._signTypedData(
    signableAction.message.domain,
    signableAction.message.types,
    signableAction.message.value
  );
  const cancelOrder = await orderbookSDK.cancelOrders([orderID], wallet.address, cancellationSignature);
  console.log(cancelOrder);
}

// const wallet = getWallet();
// prepareAndSignListing(wallet).then(() => {
// }
// ).catch((err) => {
//   console.log(err.body.details);
// })

// const wallet = getWallet();
// fulfillOrder(wallet, '018d02b8-da57-4bfc-41ad-781b1c60fd82').then(() => {
// }
// ).catch((err) => {
//   console.log(err);
// })

// const wallet = getWallet();
// cancelOrder(wallet, '018d02bb-773c-d168-387b-bd21f3848dfa').then((txhash) => {
// }
// ).catch((err) => {
//   console.log(err);
// })

