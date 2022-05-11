import React, { memo, useEffect, useState } from 'react';
import { Modal, Spin } from "antd";
import { useMoralisDapp } from "../../providers/MoralisDappProvider/MoralisDappProvider";
import { useMoralis } from "react-moralis";
import BigNumber from "bignumber.js";
import styled from 'styled-components';

import { navigate } from '@reach/router';
import { useDispatch } from 'react-redux';
import * as actions from '../../store/actions/thunks';
import { defaultAvatar, fallbackImg } from './constants';
import { formatAddress, formatUserName, getFileTypeFromURL, getPayments, getUserInfo, getFavoriteCount } from '../../utils';
import NftCard from './NftCard';

const StyledSpin = styled(Spin)`
  .ant-spin-dot-item {
    background-color: #FF343F;
  }
  .ant-spin-text {
    color: #FF343F;
  }
`
const StyledModal = styled(Modal)`
  .ant-modal-content {
    background-color: transparent;
  }
`
const Outer = styled.div`
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 8px;
`;

//react functional component
const NewItems = () => {
  const dispatch = useDispatch();

  const [nfts, setNfts] = useState([]);

  const { isAuthenticated, account, Moralis } = useMoralis();
  const { marketAddress, contractABI } = useMoralisDapp();

  const [loading, setLoading] = useState(true);
  
  const [saleNFTs, setSaleNFTs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [clockTop, setClockTop] = useState(true);

  const NEW_ITEM_DURATION = 7 * 24 * 3600;

  async function getSalesInfo() {
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
    setSaleNFTs(data);
  }

  const handleItemClick = (nft) => {
    dispatch(actions.setBuyNFT(nft));
    navigate(`/collection/${nft.token_address}/${nft.token_id ? nft.token_id : nft.tokenId}`);
  };

  useEffect(async () => {
    if (window.web3 === undefined && window.ethereum === undefined){
      return;
    }
    setPayments(await getPayments());
    await getSalesInfo();
  }, []);

  useEffect(async () => {
    if (saleNFTs && saleNFTs.length > 0) {
      setLoading(true);
      const promises = [];
      
      for (let saleInfo of saleNFTs) {
        //check if sale is new
        const currentTime = Math.floor(new Date().getTime() / 1000);
        if (currentTime - parseInt(saleInfo[9]) > NEW_ITEM_DURATION) {
          continue;
        }
        
        try {
          const options = {
            address: saleInfo[3],
            chain: process.env.REACT_APP_CHAIN_ID,
            token_id: saleInfo[4],
          };

          const result = await Moralis.Web3API.token.getTokenIdMetadata(options);
          let nft = result;
          
          nft.saleId = parseInt(saleInfo[0]);
          nft.method = parseInt(saleInfo[8]);

          //get seller info
          nft.author = await getUserInfo(saleInfo[2].toLowerCase());
          if (!nft.author) {
            nft.author = {walletAddr: saleInfo[2].toLowerCase()};
          }
          if (isAuthenticated && account) {
            nft.isOwner = nft.author && nft.author.walletAddr.toLowerCase() === account.toLowerCase();
          }
          
          if (nft.metadata) {
            if (typeof nft.metadata === "string") {
              nft.metadata = JSON.parse(nft.metadata);
            } else {
              nft.metadata = nft.metadata;
            }
          } else if (nft.token_uri) {
            const response = await fetch(nft.token_uri);
            nft.metadata = await response.json();
          } else {
            nft.metadata = null;
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

          //get creator of nft
          nft.creator = nft.metadata && nft.metadata.creator ? await getUserInfo(nft.metadata.creator) : null;

          nft.endTime = (nft.method === 1) ? parseInt(saleInfo[10]) : null;
          
          if (nft.method === 0) {
            nft.onSale = true;
            nft.onAuction = false;
            nft.onOffer = false;
          } else if (nft.method === 1) {
            nft.onSale = false;
            nft.onAuction = true;
            nft.onOffer = false;
          } else if (nft.method === 2) {
            nft.onSale = false;
            nft.onAuction = false;
            nft.onOffer = true;
          } else {
            nft.onSale = false;
            nft.onAuction = false;
            nft.onOffer = false;
          }

          const payment = (payments.length >= parseInt(saleInfo[6]) + 1) ? payments[parseInt(saleInfo[6])] : null;
          
          if (payment) {
            nft.price = new BigNumber(saleInfo[7]).dividedBy(new BigNumber(10).pow(payment.decimals)).toNumber();
            nft.payment = payment;
          }

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
          
          promises.push(nft);
        } catch (e) {
          console.log(e);
        }
      }

      // console.log("new items:", promises);

      setNfts(promises);
    }

    setLoading(false);
  }, [saleNFTs, payments]);

  return (
    <div className='row'>
      <StyledSpin tip="Loading..." size="large" spinning={loading}/>
        
      { nfts && nfts.map( (nft, index) => (
        <NftCard
          nft={nft}
          handleItemClick={handleItemClick}
          key={index}
          clockTop={clockTop}
        />
      ))}
    </div>
  );
};

export default memo(NewItems);