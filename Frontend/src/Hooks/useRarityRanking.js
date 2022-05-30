import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { getCollection, sleep } from "../utils";

export const useRarityRanking = (collectionAddr) => {
  const { Moralis, isInitialized } = useMoralis();
  const [rarity, setRarity] = useState([]);
  const [isCalculated, setIsCalculated] = useState(false);

  useEffect(async () => {
    if (!isInitialized || !Moralis.Web3API) {
      const APP_ID = process.env.REACT_APP_MORALIS_APPLICATION_ID;
      const SERVER_URL = process.env.REACT_APP_MORALIS_SERVER_URL;

      Moralis.start({
        serverUrl: SERVER_URL,
        appId: APP_ID
      });
    }

    const collection = await getCollection(collectionAddr);

    const NFTs = await Moralis.Web3API.token.getAllTokenIds({
      address: collectionAddr,
      chain: process.env.REACT_APP_CHAIN_ID
    });
  
    const totalNum = NFTs.total;
    const pageSize = NFTs.page_size;
    // console.log(collectionAddr);
    // console.log(totalNum);
    // console.log(pageSize);
    // console.log(collection);
    //initializes rarity
    let rarities = [];
    for (const trait of collection.traits) {
      rarities.push({
        trait_type: trait.trait_type,
        value: null,
        count: 0,
        rarity_percentage: 0,
        rarity_score: 0
      });

      for (const value of trait.values) {
        rarities.push({
          trait_type: trait.trait_type,
          value: value,
          count: 0,
          rarity_percentage: 0,
          rarity_score: 0
        });
      }
    }
    
    //get all nfts
    let allNFTs = NFTs.result;
    for (let i = pageSize; i < totalNum; i = i + pageSize) {
      const NFTs = await Moralis.Web3API.token.getAllTokenIds({
        address: collectionAddr,
        offset: i,
      });
      allNFTs = allNFTs.concat(NFTs.result);
      await sleep(6000);
    }

    //get number of items with trait value
    for (const e of allNFTs) {
      let attr = [];
      if (e.metadata) {
        attr = e.metadata.attributes;
      } else if (e.token_uri) {
        try {
          const response = await fetch(e.token_uri);
          const data = await response.json();
          attr = data.attributes;
        } catch (error) {
          console.log(error);
        }
      }

      for (const a of attr) {
        const rs = rarities.filter((r, index) => {
          return r.trait_type === a.trait_type && r.value === a.value;
        });
        if (rs.length === 1) {
          rs[0].count++;
        }
      }
    }

    //calculates rarity
    for (const rarity of rarities) {
      rarity.rarity_percentage = rarity.count / totalNum;
      if (rarity.rarity_percentage !== 0) {
        rarity.rarity_score = 1 / rarity.rarity_percentage;
      }
    }
    console.log("aaa:", rarities);

    setIsCalculated(true);
    setRarity(rarities);
  }, [collectionAddr]);
  
  return {
    rarity,
    isCalculated
  };
};
