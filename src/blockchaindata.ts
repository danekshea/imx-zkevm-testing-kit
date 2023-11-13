import { blockchainData, config } from "@imtbl/sdk";
require("dotenv").config();

const client = new blockchainData.BlockchainData({
  baseConfig: new config.ImmutableConfiguration({
    environment: config.Environment.SANDBOX,
    apiKey: process.env.IMMUTABLE_API_KEY,
  }),
});

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

const refreshCollectionMetadata = async (contractAddress: string, chainName: string) => {
  const updatedCollection = await client.refreshCollectionMetadata({
    chainName: chainName,
    contractAddress: contractAddress,
    refreshCollectionMetadataRequest: {
      collection_metadata: {
        name: "Dane's Iguanas",
        symbol: "BASP",
        description: "Some description",
        image: "https://some-url",
        external_link: "https://some-url",
        contract_uri: "https://some-url",
        base_uri: "https://some-url",
      },
    },
  });
  return updatedCollection;
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

client.



const COLLECTION_ADDRESS = "0x66148F9523fb208CF4e5B5953Eb2c6E7296FAC4D";

const main = async () => {
  const result = await refreshCollectionMetadata(COLLECTION_ADDRESS, "imtbl-zkevm-testnet", "Dane's Iguanas");
  return result;
};

main().then((result) => {
  console.log(result);
});
