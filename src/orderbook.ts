import { config, orderbook } from "@imtbl/sdk";
import { providers } from "ethers";
import { getDefaultProvider, Wallet } from "ethers"; // ethers v5
import { RPC, environment } from "../config";
require("dotenv").config();

const orderbookSDK = new orderbook.Orderbook({
  baseConfig: { environment: environment },
  overrides: {
    provider: new providers.JsonRpcProvider(RPC),
  },
});

const provider = getDefaultProvider(RPC);

async function prepareAndSignListing(wallet: Wallet) {
  const gasPrice = await provider.getGasPrice();
  const nonce = await provider.getTransactionCount(wallet.address);

  //Create the sell asset
  const sellAsset: orderbook.ERC721Item = {
    type: "ERC721",
    contractAddress: "0xE6feF103604f068F35c9417DE2d9ABFeFD4Ff958",
    tokenId: "340282366920938463463374607431768221408",
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
        recipient: "0x42c2d104C05A9889d79Cdcd82F69D389ea24Db9a", // Replace address with your own marketplace address
      },
    ],
  });
  console.log(`Order response: ${await orderResponse}`);
  console.log(orderResponse);
}

async function fulfillOrder(wallet: Wallet, orderID: string) {
  const buyOrder = await orderbookSDK.fulfillOrder("018b648c-6f74-403a-c1d1-3769dfc13ff4", wallet.address, [
    {
      amount: "1000000",
      recipient: "0x42c2d104C05A9889d79Cdcd82F69D389ea24Db9a", // Replace address with your own marketplace address
    },
  ]);
  console.log(buyOrder);
}

async function cancelOrder(wallet: Wallet, orderID: string) {
  const { signableAction }  = await orderbookSDK.prepareOrderCancellations([orderID]);
  const cancellationSignature = await wallet._signTypedData(
    signableAction.message.domain,
    signableAction.message.types,
    signableAction.message.value
  );
  const cancelOrder = await orderbookSDK.cancelOrders([orderID], wallet.address, cancellationSignature);
  console.log(cancelOrder);
}

async function main() {
  if (process.env.PRIVATE_KEY) {
    const wallet = new Wallet(process.env.PRIVATE_KEY, provider);
    //await prepareAndSignListing(wallet);
    //await cancelOrder(wallet, '018b935f-5f1f-78ec-04dc-f913e17f9985');
  } else {
    console.error("No private key found in environment variables");
  }
}
main();
