import { getDefaultProvider, Wallet } from 'ethers'; // ethers v5
import { Provider, TransactionResponse } from '@ethersproject/providers'; // ethers v5
import { ERC721Client } from '@imtbl/zkevm-contracts';
import { RPC } from '../config';
import { blockchainData } from '@imtbl/sdk';
import { getRPCProvider, getWallet } from './utils';
require('dotenv').config();

const COLLECTION_ADDRESS = '0xe5e2c6ef80122c8036b2f9cd8781d170e80ca970';

const mintByID = async (wallet: Wallet, contractAddress: string): Promise<TransactionResponse> => {
  const contract = new ERC721Client(contractAddress);
  const provider = wallet.provider;

  const minterRole = await contract.MINTER_ROLE(provider);

  const hasMinterRole = await contract.hasRole(
    provider,
    minterRole,
    wallet.address
  );

  if (!hasMinterRole) {
    // Handle scenario without permissions...
    console.log('Account doesnt have permissions to mint. Try using the grant minter role function.');
    return Promise.reject(
      new Error('Account doesnt have permissions to mint.')
    );
  }

  // Construct the mint requests
  const requests = [
    {
      to: "0x42c2d104C05A9889d79Cdcd82F69D389ea24Db9a",
      tokenIds: [11, 12, 13, 14],
    }
  ];

  // Rather than be executed directly, contract write functions on the SDK client are returned
  // as populated transactions so that users can implement their own transaction signing logic.
  const populatedTransaction = await contract.populateMintBatch(requests);
  const result = await wallet.sendTransaction(populatedTransaction);
  console.log(result); // To get the TransactionResponse value
  return result;
};

const mintByBatch = async (wallet:Wallet, contractAddress: string): Promise<TransactionResponse> => {
  
  const provider = wallet.provider;
  const contract = new ERC721Client(contractAddress);
  // We can use the read function hasRole to check if the intended signer
  // has sufficient permissions to mint before we send the transaction
  const minterRole = await contract.MINTER_ROLE(provider);
  const hasMinterRole = await contract.hasRole(
    provider,
    minterRole,
    wallet.address
  );

  if (!hasMinterRole) {
    // Handle scenario without permissions...
    console.log('Account doesnt have permissions to mint. Try using the grant minter role function.');
    return Promise.reject(
      new Error('Account doesnt have permissions to mint.')
    );
  }

  const mints = [
    {
      to: '0x42c2d104C05A9889d79Cdcd82F69D389ea24Db9a',
      quantity: 10,
    }
  ];

  // Rather than be executed directly, contract write functions on the SDK client are returned
  // as populated transactions so that users can implement their own transaction signing logic.
  const populatedTransaction = await contract.populateMintBatchByQuantity(
    mints
  );
  const txhash = await wallet.sendTransaction(populatedTransaction);
  console.log(txhash); // To get the TransactionResponse value
  return txhash;
};

const grantMinterRole = async(wallet: Wallet, contractAddress: string): Promise<TransactionResponse> => {
    const contract = new ERC721Client(contractAddress);
    const tx = await contract.populateGrantMinterRole(wallet.address);
    console.log(`Granting minter role to ${wallet.address} on ${contractAddress}...`);

    const txhash = await wallet.sendTransaction(tx);
    console.log(`Transaction hash: ${txhash.hash}`);

    return txhash;
}

const getAdmins = async(provider: Provider, contractAddress: string) => {
  const contract = new ERC721Client(contractAddress);
  const admins = await contract.getAdmins(provider);
  console.log(admins);
}

const setRoyalty = async(wallet: Wallet, contractAddress: string):Promise<TransactionResponse> => {
  const contract = new ERC721Client(contractAddress);

  const requests = [
    {
      tokenId: 10,
      receiver: wallet.address,
      feeNumerator: 200
    }
  ]
  const royaltyTX = await contract.populateSetNFTRoyaltyReceiver(requests[0].tokenId, requests[0].receiver, requests[0].feeNumerator);

  const txhash = await wallet.sendTransaction(royaltyTX);
  
  return txhash;
}

const getRoyalty = async(provider: Provider, contractAddress: string) => {
    const contract = new ERC721Client(contractAddress);
    // The wallet of the intended signer of the mint request
    const result = await contract.royaltyInfo(provider, 1, 1000);
    return result;
}

const setBaseURI = async(wallet: Wallet, contractAddress:string):Promise<TransactionResponse> => {
  const contract = new ERC721Client(contractAddress);

  const result = await contract.populateSetBaseURI('ipfs://QmQ3RxhfAw9ca2mX34tFm7hk685EAwprZDDdiYPmfsXnsg');
  const txhash = await wallet.sendTransaction(result);
  return txhash
}

const getInfo = async(contractAddress:string) => { 
  const contract = new ERC721Client(contractAddress);
  const provider = await getRPCProvider();

  console.log('Base URI: ' + (await contract.baseURI(provider).catch(e => 'Call failed')));
  console.log('Contract URI: ' + (await contract.contractURI(provider).catch(e => 'Call failed')));
  console.log('Name: ' + (await contract.name(provider).catch(e => 'Call failed')));
  console.log('Symbol: ' + (await contract.symbol(provider).catch(e => 'Call failed')));
  console.log('Total Supply: ' + (await contract.totalSupply(provider).catch(e => 'Call failed')));
  console.log('Operator Allowlist: ' + (await contract.operatorAllowlist(provider).catch(e => 'Call failed')));
  console.log('Domain Separator: ' + (await contract.DOMAIN_SEPARATOR(provider).catch(e => 'Call failed')));
  console.log('Default Admin Role: ' + (await contract.DEFAULT_ADMIN_ROLE(provider).catch(e => 'Call failed')));
  console.log('Minter Role: ' + (await contract.MINTER_ROLE(provider).catch(e => 'Call failed')));
  console.log('EIP712 Domain: ' + (await contract.eip712Domain(provider).catch(e => 'Call failed')));
}




getInfo(COLLECTION_ADDRESS).then((result) => {
}).catch((err) => {
  console.log(err);
})

// const wallet = getWallet();
// mintByID(wallet, COLLECTION_ADDRESS).then((txhash) => {
//   console.log(txhash);
// }
// ).catch((err) => {
//   console.log(err);
// })

// const wallet = getWallet();
// grantMinterRole(wallet, COLLECTION_ADDRESS).then((txhash) => {
//   console.log(txhash);
// }).catch((err) => {
//   console.log(err);
// })



// getTotalSupply(COLLECTION_ADDRESS).then((result) => {
//   console.log(result);
// });

// const wallet = getWallet();
// mintByBatch(wallet, COLLECTION_ADDRESS).then((tx) => {
//   console.log("Minting TXHash:", tx);
// }).catch((err) => {
//   console.log(err);
// });


// setBaseURI(provider).then((txhash) => {
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