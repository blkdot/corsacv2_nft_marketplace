import React, { memo, useEffect, useState } from 'react';
import NftCard from './NftCard';
import { useMoralisDapp } from "../../providers/MoralisDappProvider/MoralisDappProvider";
import { useMoralis, useMoralisWeb3Api, useWeb3ExecuteFunction, useMoralisQuery } from "react-moralis";
import { Spin } from "antd";
import styled from 'styled-components';
import BigNumber from 'bignumber.js';
import { getFileTypeFromURL, getPayments, getUserInfo, getFavoriteCount, getBlacklist, searchItems } from '../../utils';
import { fallbackImg } from './constants';

const StyledSpin = styled(Spin)`
  .ant-spin-dot-item {
    background-color: #FF343F;
  }
  .ant-spin-text {
    color: #FF343F;
  }
`

const Search3Cols = ({search, filterCategories, filterSaleTypes, filterPayments, filterCollections}) => {
  const [payments, setPayments] = useState([]);
  const [nfts, setNFTs] = useState([]);
  const [saleNFTs, setSaleNFTs] = useState([]);

  const [blacklist, setBlacklist] = useState([]);

  const [isExplorerLoading, setIsExplorerLoading] = useState(true);

  const { marketAddress, contractABI } = useMoralisDapp();
  const { Moralis, account, isAuthenticated } = useMoralis();
  const { data, error, isLoading } = useMoralisQuery("SalesList");
  
  const fetchMarketItems = JSON.parse(
    JSON.stringify(data, [
      "saleId",
      "creator",
      "seller",
      "sc",
      "tokenId",
      "copy",
      "payment",
      "basePrice",
      "method",
      "startTime",
      "endTime",
      "feeRatio",
      "royaltyRatio",
      "confirmed"
    ])
  );
  const getMarketItem = (nft) => {
    const result = fetchMarketItems?.find(
      (e) =>
        parseInt(e.saleId) === parseInt(nft?.saleId) &&
        e.sc.toLowerCase() === nft?.token_address.toLowerCase() &&
        e.tokenId === nft?.token_id 
        // && e.confirmed === true
    );
    return result;
  };

  async function getSalesInfo() {
    if (window.web3 === undefined && window.ethereum === undefined)
      return;
    
    const ops = {
      chain: process.env.REACT_APP_CHAIN_ID,
      address: marketAddress,
      function_name: "getSaleInfo",
      abi: contractABI,
      params: {
        startIdx: "0",
        count: "100000"
      },
    };
    const data = await Moralis.Web3API.native.runContractFunction(ops);
    // console.log("saleInfo:", data);
    setSaleNFTs(data);
  }

  async function fetchItems() {
    console.log("query:", search);
    if (search === undefined || search === null) {
      search = '';
    }
    const items = await searchItems(search);
    console.log(items)
    
    setIsExplorerLoading(false);
  }

  useEffect(() => {
    async function getBaseData() {
      setPayments(await getPayments());
      setBlacklist(await getBlacklist());
      await getSalesInfo();
    }

    setIsExplorerLoading(true);
    getBaseData();
  }, [filterCategories, filterSaleTypes, filterPayments, filterCollections]);

  useEffect(() => {
    fetchItems();
  }, [saleNFTs]);

  return (
    <div className='row'>
        {/* {isExplorerLoading && 
          <StyledSpin tip="Loading..." size="large" />
        }
        {!isExplorerLoading && nfts.length == 0 &&
          <div className="alert alert-danger" role="alert">
            No items
          </div>
        }
        {!isExplorerLoading && nfts && nfts.map( (nft, index) => (
          <NftCard 
            nft={nft} 
            key={index}
            className="d-item col-lg-4 col-md-6 col-sm-6 col-xs-12 mb-4"
            page="explore"
          />
        ))} */}
    </div>              
    );
}

export default memo(Search3Cols);
