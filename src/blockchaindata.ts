import { blockchainData, config } from "@imtbl/sdk";
require("dotenv").config();

console.log(process.env.IMMUTABLE_API_KEY);
const client = new blockchainData.BlockchainData({
  baseConfig: new config.ImmutableConfiguration({
    environment: config.Environment.SANDBOX,
    apiKey: process.env.IMMUTABLE_API_KEY,
  }),
});

const refreshNFTMetadata = async (contractAddress: string, chainName: string, newName: string) => {
  const updatedNFT = await client.refreshNFTMetadata({
    chainName,
    contractAddress,
    refreshNFTMetadataByTokenIDRequest: {
      nft_metadata: [
        {
          name: newName,
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

const refreshCollectionMetadata = async (contractAddress: string, chainName: string, newName: string) => {
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

const COLLECTION_ADDRESS = "0x66148F9523fb208CF4e5B5953Eb2c6E7296FAC4D";

const main = async () => {
  const result = await refreshCollectionMetadata(COLLECTION_ADDRESS, "imtbl-zkevm-testnet", "Dane's Iguanas");
  return result;
};

main().then((result) => {
  console.log(result);
});
