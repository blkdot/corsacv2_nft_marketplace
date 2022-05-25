import React, { memo, useEffect, useState } from 'react';
import MyNftCard from './MyNftCard';
import { useMoralisDapp } from "../../providers/MoralisDappProvider/MoralisDappProvider";
import { useMoralis, useMoralisWeb3Api, useWeb3ExecuteFunction, useMoralisQuery } from "react-moralis";
import { Spin } from "antd";
import styled from 'styled-components';
import BigNumber from 'bignumber.js';
import { getFileTypeFromURL, getPayments, getUserInfo, getFavoriteCount, getBlacklist } from '../../utils';
import { fallbackImg } from './constants';

const StyledSpin = styled(Spin)`
  .ant-spin-dot-item {
    background-color: #FF343F;
  }
  .ant-spin-text {
    color: #FF343F;
  }
`

const Explore3Cols = ({filterCategories, filterSaleTypes, filterPayments, filterCollections}) => {
  const [payments, setPayments] = useState([]);
  const [nfts, setNFTs] = useState([]);
  const [saleNFTs, setSaleNFTs] = useState([]);

  const [blacklist, setBlacklist] = useState([]);

  const [isExplorerLoading, setIsExplorerLoading] = useState(true);

  const { marketAddress, contractABI } = useMoralisDapp();
  const listItemFunction = "getSaleInfo";
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

  const [height, setHeight] = useState(210);

  const onImgLoad = (e) => {
    let currentHeight = height;
    if(currentHeight < e.target.offsetHeight) {
        setHeight(e.target.offsetHeight);
    }
  }

  async function getSalesInfo() {
    if (window.web3 === undefined && window.ethereum === undefined)
      return;
    
    const ops = {
      chain: process.env.REACT_APP_CHAIN_ID,
      address: marketAddress,
      function_name: listItemFunction,
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

  async function fetchAPIData() {
    if (saleNFTs && saleNFTs.length > 0) {
      const promises = [];
      
      for (let saleInfo of saleNFTs) {
        const options = {
          address: saleInfo[3],
          chain: process.env.REACT_APP_CHAIN_ID
        };
        try {
          const result = await Moralis.Web3API.token.getAllTokenIds(options);
          
          const temp = result?.result.filter((nft, index) => {
            return parseInt(nft.token_id) === parseInt(saleInfo[4]);
          });
          
          if (temp.length > 0) {
            temp[0].saleId = parseInt(saleInfo[0]);
            temp[0].method = parseInt(saleInfo[8]);
            temp[0].saleAmount = parseInt(saleInfo[5]);
            temp[0].saleBalance = parseInt(saleInfo[13]);

            if (payments.length >= parseInt(saleInfo[6]) + 1) {
              const payment = payments[parseInt(saleInfo[6])];
              temp[0].price = new BigNumber(saleInfo[7]).dividedBy(new BigNumber(10).pow(payment.decimals)).toNumber();
              temp[0].payment = payment;
            }
          }

          promises.push(...temp);
          // console.log(temp[0]);
        } catch (e) {
          console.log(e);
        }
      }

      let filteredNfts = [];
      for (let nft of promises) {
        if (!nft.metadata) {
          const options1 = {
            address: nft.token_address,
            token_id: nft.token_id,
            chain: process.env.REACT_APP_CHAIN_ID
          };
          const tokenIdMetadata = await Moralis.Web3API.token.getTokenIdMetadata(options1);
          if (tokenIdMetadata.token_uri) {
            await fetch((tokenIdMetadata.token_uri))
              .then((response) => response.json())
              .then((data) => {
                nft.image = data.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
                nft.metadata = data;
              }).catch(function() {
                console.log("error: getting uri");
                nft.image = fallbackImg;
              });
          } else {
            nft.image = fallbackImg;
          }
        } else {
          if (typeof nft.metadata === "string") {
            nft.metadata = JSON.parse(nft.metadata);
          }
          
          nft.image = nft.metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
        }

        //get creator of NFT
        nft.creator = nft.metadata && nft.metadata.creator ? await getUserInfo(nft.metadata.creator) : null;

        const marketItem = getMarketItem(nft);
        // console.log("nft:", nft);
        // console.log("marketItem from Moralis:", marketItem);
        
        if (marketItem !== undefined && marketItem !== null) {
          nft.seller = marketItem.seller;

          //get author/seller info
          nft.author = await getUserInfo(nft.seller.toLowerCase());
          if (!nft.author) {
            nft.author = {walletAddr: nft.seller.toLowerCase()};
          }

          if (isAuthenticated && account) {
            nft.isOwner = nft.author && nft.author.walletAddr.toLowerCase() === account.toLowerCase();
          }

          if (parseInt(marketItem.method) === 0x00) {
            nft.onAuction = false;
            nft.onSale = true;
            nft.onOffer = false;
          } else if (parseInt(marketItem.method) === 0x01) {
            nft.onAuction = true;
            nft.onSale = false;
            nft.onOffer = false;
            nft.endTime = marketItem.endTime;
            nft.confirmed = marketItem.confirmed;
          } else {
            nft.onAuction = false;
            nft.onSale = false;
            nft.onOffer = true;
          }
        } else {
          nft.onAuction = false;
          nft.onSale = false;
          nft.onOffer = false;
        }

        let file = null;
        if (nft.image) {
          file = await getFileTypeFromURL(nft.image);
        } else if (nft.metadata && nft.metadata.image) {
          file = await getFileTypeFromURL(nft.metadata.image);
        } else {
          file = {mimeType: 'image', fileType: 'image'};
        }
        nft.item_type = file.fileType;
        nft.mime_type = file.mimeType;

        //get favorites
        try {
          const favorites = await getFavoriteCount(nft.token_address, nft.token_id, account ? account : null);
          nft.likes = favorites.count;
          nft.liked = favorites.liked;
        } catch (e) {
          console.log(e);
          nft.likes = 0;
          nft.liked = false;
        }

        //isBlocked
        const bl = blacklist.filter(item =>  {
          return item.collectionAddr.toLowerCase() === nft.token_address.toLowerCase() && 
            parseInt(item.tokenId) === parseInt(nft.token_id);
        });
        if (bl.length > 0) {
          nft.blocked = 1;
        } else {
          nft.blocked = 0;
        }

        //apply filters
        const cat = nft.metadata && nft.metadata.collection ? nft.metadata.collection.category : null;
        const saleType = nft.onSale ? 0 : nft.onAuction ? 1 : nft.onOffer ? 2 : null;
        const payment = nft.payment ? nft.payment.value : null;
        const collection = nft.metadata && nft.metadata.collection ? nft.metadata.collection.addr : null;
        
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
            return parseInt(c.value) === parseInt(payment);
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
          filteredNfts.push(nft);
        }
      }

      // console.log("NFTs:", filteredNfts);
      setNFTs(filteredNfts);
    }
    
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
    if (isLoading && nfts.length == 0) {
      setIsExplorerLoading(true);
    } else {
      if (fetchMarketItems.length > 0) {
        fetchAPIData();
      } else {
        setIsExplorerLoading(false);
      }
    }
    
  }, [saleNFTs, isLoading, fetchMarketItems.length]);

  return (
    <div className='row'>
        {isExplorerLoading && 
          <StyledSpin tip="Loading..." size="large" />
        }
        {!isExplorerLoading && nfts.length == 0 &&
          <div className="alert alert-danger" role="alert">
            No items
          </div>
        }
        {!isExplorerLoading && nfts && nfts.map( (nft, index) => (
          <MyNftCard 
            nft={nft} 
            key={index}
            onImgLoad={onImgLoad} 
            height={height} 
            className="d-item col-lg-4 col-md-6 col-sm-6 col-xs-12 mb-4"
            page="explore"
          />
        ))}
    </div>              
    );
}

export default memo(Explore3Cols);
