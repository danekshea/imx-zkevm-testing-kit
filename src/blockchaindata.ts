import { blockchainData, config } from "@imtbl/sdk";
import { collectionAddress } from "../config";
require("dotenv").config();

const getActivity = async (chainName: string, activityId: string) => {
  const activity = await client.getActivity({
    chainName,
    activityId
  });
  return activity;
}

const getCollection = async (contractAddress: string, chainName: string) => {
  const collection = await client.getCollection({
    chainName,
    contractAddress,
  });
  return collection;
}

const getMetadata = async (contractAddress: string, chainName: string, metadataId: string) => {
  const metadata = await client.getMetadata({
    chainName,
    contractAddress,
    metadataId
  });
  return metadata;
}

const getNFT = async (contractAddress: string, chainName: string, tokenId: string) => {
  const nft = await client.getNFT({
    contractAddress,
    chainName,
    tokenId
  });
  return nft;
}

const getToken = async (contractAddress: string, chainName: string, tokenId: string) => {
  const token = await client.getToken({
    contractAddress,
    chainName,
  });
  return token;
}

const listActivities = async (chainName: string) => {
  const activities = await client.listActivities({
    chainName,
  });
  return activities;
}

const listAllNFTOwners = async (chainName: string, fromUpdatedAt: string) => {
  const owners = await client.listAllNFTOwners({
    chainName,
    fromUpdatedAt,
  });
  return owners;
}

const refreshNFTMetadata = async (contractAddress: string, chainName: string) => {
  const updatedNFT = await client.refreshNFTMetadata({
    chainName,
    contractAddress,
    refreshNFTMetadataByTokenIDRequest: {
      nft_metadata: [
        {
          name: "newName",
          animation_url: null,
          image: null,
          external_url: null,
          youtube_url: null,
          description: null,
          attributes: [],
        },
      ],
    },
  });

  return updatedNFT;
};

const refreshCollectionMetadata = async (client: blockchainData.BlockchainData, chainName: string, contractAddress: string) => {
  const collection = await client.getCollection({ chainName: chainName, contractAddress: contractAddress })
  return client.refreshCollectionMetadata({
    chainName,
    contractAddress,
    refreshCollectionMetadataRequest: {
      collection_metadata: {
        base_uri: 'https://aqua-coastal-wolverine-421.mypinata.cloud/ipfs/QmWHYv8w8fCEXMEhDgDqHTruKrQnUfqbVYqnPBzhXmm8QS',
        // do not modify any other field. Still required to be provided
        name: collection.result.name,
        symbol: collection.result.symbol,
        description: collection.result.description,
        image: collection.result.image,
        contract_uri: collection.result.contract_uri || null,
        external_link: collection.result.external_link,
      }
    }
  })
};

const refreshStackedMetadata = async (contractAddress: string, chainName: string) => {
  const updatedStacked = await client.refreshStackedMetadata({
    chainName: chainName,
    contractAddress: contractAddress,
    refreshMetadataByIDRequest: {
      metadata: [
        {
          name: "Dane's Iguanas",
          description: "Some description",
          image: "https://some-url",
          external_url: "https://some-url", // Note the underscore instead of a dash
          animation_url: "https://some-url",
          youtube_url: "https://some-url",
          attributes: []
        },
        {
          name: "Dane's Iguanas",
          description: "Some description",
          image: "https://some-url",
          external_url: "https://some-url", // Note the underscore instead of a dash
          animation_url: "https://some-url",
          youtube_url: "https://some-url",
          attributes: []
        }
      ],
    }
  });
  return updatedStacked;
};


const client = new blockchainData.BlockchainData({
  baseConfig: {
    environment: config.Environment.SANDBOX,
    apiKey: process.env.IMMUTABLE_SECRET_API_KEY,
    publishableKey: process.env.IMMUTABLE_PUBLISHABLE_API_KEY,
  },
});


const main = async () => {
  const result = await refreshCollectionMetadata(client, "imtbl-zkevm-testnet", collectionAddress);
  return result;
};

main().then((result) => {
  console.log(result);
});
