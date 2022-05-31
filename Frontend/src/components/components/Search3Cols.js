import React, { memo, useEffect, useState } from 'react';
import NftCard from './NftCard';
import { useMoralisDapp } from "../../providers/MoralisDappProvider/MoralisDappProvider";
import { useMoralis } from "react-moralis";
import { Spin } from "antd";
import styled from 'styled-components';
import BigNumber from 'bignumber.js';
import { getFileTypeFromURL, getPayments, getUserInfo, getFavoriteCount, getBlacklist, searchItems, sleep } from '../../utils';
import { navigate } from '@reach/router';

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
  const [filteredNFTs, setFilteredNFTs] = useState([]);
  const [saleNFTs, setSaleNFTs] = useState([]);

  const [blacklist, setBlacklist] = useState([]);

  const [loading, setLoading] = useState(true);

  const { marketAddress, contractABI } = useMoralisDapp();
  const { Moralis, isInitialized, account, isAuthenticated } = useMoralis();

  const handleBuyClick = (nft) => {
    navigate(`/collection/${nft.token_address}/${nft.token_id ? nft.token_id : nft.tokenId}/${nft.author ? nft.author.walletAddr : ''}`);
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
    if (search === undefined || search === null) {
      search = '';
    }
    const items = await searchItems(search);
    
    if (!isInitialized || !Moralis.Web3API) {
      const APP_ID = process.env.REACT_APP_MORALIS_APPLICATION_ID;
      const SERVER_URL = process.env.REACT_APP_MORALIS_SERVER_URL;

      Moralis.start({
        serverUrl: SERVER_URL,
        appId: APP_ID
      });
    }

    const nfts = [];

    for (const item of items) {
      const options = {
				chain: process.env.REACT_APP_CHAIN_ID,
				address: item.token_address,
				token_id: item.token_id,
			};

      try {
				const result = await Moralis.Web3API.token.getTokenIdMetadata(options);
				// const nft = result;
				// await sleep(1000);
				// const result = await Moralis.Web3API.token.getTokenIdOwners(options);
				// const nft = result.result[0];

        if (typeof result.metadata === "string") {
          result.metadata = JSON.parse(result.metadata);
        }
        
        result.image = result.metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');

        result.author = result.owner_of ? await getUserInfo(result.owner_of.toLowerCase()) : null;

        result.creator = result.metadata && result.metadata.creator ? await getUserInfo(result.metadata.creator) : null;

        if (isAuthenticated && account) {
          result.isOwner = result.owner_of && result.owner_of.toLowerCase() === account.toLowerCase();
        }

        let file = null;
        if (result.image) {
          file = await getFileTypeFromURL(result.image);
        } else if (result.metadata && result.metadata.image) {
          file = await getFileTypeFromURL(result.metadata.image);
        } else {
          file = {mimeType: 'image', fileType: 'image'};
        }
        result.item_type = file.fileType;
        result.mime_type = file.mimeType;

        //get sale info
        const sales = saleNFTs.filter((s) => {
          return s[2].toLowerCase() === (result.owner_of ? result.owner_of.toLowerCase() : '') &&
            s[3].toLowerCase() === result.token_address.toLowerCase() &&
            parseInt(s[4]) === parseInt(result.token_id);
        });
        if (sales.length === 1) { 
          const sale = sales[0];

          //get amounts
          result.saleAmount = sale[5];
          result.saleBalance = sale[13];

          const method = parseInt(sale[8]);
          const endTime = parseInt(sale[10]);
          const currentTime = Math.floor(new Date().getTime() / 1000);
          const payment = payments[parseInt(sale[6])];
          const decimals = (payment && payment.decimals != undefined && payment.decimals != null) ? parseInt(payment.decimals) : 18;
          const basePrice = new BigNumber(sale[7]).dividedBy(new BigNumber(10).pow(decimals)).toNumber();
          
          result.price = basePrice;
          result.payment = payment;

          if (method === 1 && endTime > currentTime) {
            result.onAuction = true;
            result.onSale = false;
            result.onOffer = false;
            result.endTime = endTime;
          } else if (method === 0) {
            result.onAuction = false;
            result.onSale = true;
            result.onOffer = false;
          } else if (method === 1) {
            result.onAuction = false;
            result.onSale = false;
            result.onOffer = true;
          } else {
            result.onAuction = false;
            result.onSale = false;
            result.onOffer = false;
          }
        }

        //get favorites
        try {
          const favorites = await getFavoriteCount(result.token_address, result.token_id, account ? account : null);
          result.likes = favorites.count;
          result.liked = favorites.liked;
        } catch (e) {
          console.log(e);
          result.likes = 0;
          result.liked = false;
        }

        //isBlocked
        const bl = blacklist.filter(item =>  {
          return item.collectionAddr.toLowerCase() === result.token_address.toLowerCase() && 
            parseInt(item.tokenId) === parseInt(result.token_id);
        });
        if (bl.length > 0) {
          result.blocked = 1;
        } else {
          result.blocked = 0;
        }

        //apply filters
        const cat = result.metadata && result.metadata.collection ? result.metadata.collection.category : null;
        const saleType = result.onSale ? 0 : (result.onAuction ? 1 : (result.onOffer ? 2 : null));
        const pm = result.payment ? result.payment.value : null;
        const collection = result.metadata && result.metadata.collection ? result.metadata.collection.addr : null;
        
        let flag = true;
        if (filterCategories.length > 0) {
          const fc = filterCategories.filter((c, index) => {
            return c.value === cat;
          });

          if (fc.length === 0) {
            flag = false;
          }
        }
        
        if (filterSaleTypes.length > 0) {
          const fs = filterSaleTypes.filter((c, index) => {
            return parseInt(c.value) === parseInt(saleType);
          });

          if (fs.length === 0) {
            flag = false;
          }
        }

        if (filterPayments.length > 0) {
          const fp = filterPayments.filter((c, index) => {
            return parseInt(c.value) === parseInt(pm);
          });

          if (fp.length === 0) {
            flag = false;
          }
        }

        if (filterCollections.length > 0) {
          const fcc = filterCollections.filter((c, index) => {
            return c.value === collection;
          });

          if (fcc.length === 0) {
            flag = false;
          }
        }

        if (flag) {
          nfts.push(result);
        }
			} catch (err) {
				console.log(err)
			}
    }
    
    // console.log(nfts);
    setFilteredNFTs(nfts);
    setLoading(false);
  }

  useEffect(() => {
    async function getBaseData() {
      setPayments(await getPayments());
      setBlacklist(await getBlacklist());
      await getSalesInfo();
    }

    setLoading(true);
    getBaseData();
  }, [filterCategories, filterSaleTypes, filterPayments, filterCollections]);

  useEffect(() => {
    fetchItems();
  }, [saleNFTs]);

  return (
    <div className='row'>
        {loading && 
          <StyledSpin tip="Loading..." size="large" />
        }
        {!loading && filteredNFTs.length == 0 &&
          <div className="alert alert-danger" role="alert">
            No items
          </div>
        }
        {!loading && filteredNFTs && filteredNFTs.map( (nft, index) => (
          <NftCard 
            nft={nft} 
            key={index}
            className="d-item col-lg-4 col-md-6 col-sm-6 col-xs-12 mb-4"
            handleItemClick={handleBuyClick}
            clockTop={true}
          />
        ))}
    </div>              
    );
}

export default memo(Search3Cols);
