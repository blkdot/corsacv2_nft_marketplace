import React, { memo, useEffect, useState } from "react";
import Slider from "react-slick";
import { useMoralis } from "react-moralis";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { carouselCollectionSingle, fallbackImg } from './constants';
import { useDispatch } from 'react-redux';
import * as actions from '../../store/actions/thunks';
import { navigate } from "@reach/router";
import axios from "axios";
import { useMoralisDapp } from "../../providers/MoralisDappProvider/MoralisDappProvider";
import { formatAddress, formatUserName, getFileTypeFromURL, getPayments, getUserInfo } from "../../utils";

const SliderCarouselHome = () => {
  const dispatch = useDispatch();
  const [payments, setPayments] = useState([]);
  const [nfts, setNfts] = useState([]);
  const [sales, setSales] = useState([]);
  const [items, setItems] = useState([]);
  const [newItems, setNewItems] = useState([]);
  const { marketAddress, contractABI } = useMoralisDapp();
  const { account, Moralis, isAuthenticated, isWeb3Enabled, isWeb3EnableLoading } = useMoralis();
  
  const getSalesInfo = async () => {
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
      setSales(data);
  };

  async function getRecentItems() {
    try {
      await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/item/recent`, {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {}
      }).then(async res => {
        setItems(res.data.items);
      });
    } catch {
      console.log('error in fetching items');
    }
  }

  const handleBuyClick = (nft) => {
    dispatch(actions.setBuyNFT(nft));
    navigate(`/collection/${nft.token_address}/${nft.token_id ? nft.token_id : nft.tokenId}`);
  };

  useEffect(async () => {
    const isWeb3Active = Moralis.ensureWeb3IsInstalled();
    
    setPayments(await getPayments());

    await getRecentItems();
    await getSalesInfo();
  }, [isWeb3Enabled, !isWeb3EnableLoading]);

  useEffect(async () => {
    let newItems = [];
    for (let item of items) {
      let newItem = JSON.parse(JSON.stringify(item));
      if (item.collections.length > 0 && item.tokenId) {
        const ops = {
          address: item.collections[0].collectionAddr,
          token_id: item.tokenId,
          chain: process.env.REACT_APP_CHAIN_ID,
        };
        const tokenIdMetadata = await Moralis.Web3API.token.getTokenIdMetadata(ops);
        let metadata = null;
        if (tokenIdMetadata.metadata) {
          metadata = JSON.parse(tokenIdMetadata.metadata);
        } else {
          if (tokenIdMetadata.token_uri) {
            await fetch((tokenIdMetadata.token_uri))
              .then((response) => response.json())
              .then((data) => {
                data.image = data.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
                metadata = data;
              }).catch(function() {
                console.log("error: getting uri");
              });
          }
        }

        //get author/seller info
        newItem.author = await getUserInfo(tokenIdMetadata.owner_of.toLowerCase());
        if (!newItem.author) {
          newItem.author = {walletAddr: tokenIdMetadata.owner_of.toLowerCase()};
        }
        if (isAuthenticated && account) {
          newItem.isOwner = newItem.walletAddr && newItem.author.walletAddr.toLowerCase() === account.toLowerCase();
        }
        
        newItem.token_address = item.collections[0].collectionAddr;
        newItem.image = item.image;
        newItem.metadata = metadata;
        
        if (item.creator) {
          newItem.creator = await getUserInfo(item.creator.toLowerCase());
          
          if (!newItem.creator) {
            newItem.creator = {walletAddr: item.creator.toLowerCase()};
          }
        } else {
          newItem.creator = '';
        }
        
        newItem.collection = metadata && metadata.collection ? metadata.collection : null;

        newItems.push(newItem);
      }
    }
    
    setNewItems(newItems);
  }, [items]);

  useEffect(async () => {
    for (let ni of newItems) {
      const ss = sales.filter((s, index) => {
        return s[3].toLowerCase() === ni.token_address.toLowerCase() && 
          parseInt(s[4]) === parseInt(ni.tokenId);
      });
      if (ss.length > 0) {
        let sale = ss[0];
        if (parseInt(sale[8]) === 0x00) {
          ni.onSale = true;
          ni.onAuction = false;
          ni.onOffer = false;
        } else if (parseInt(sale[8]) === 0x01) {
          ni.onSale = false;
          ni.onAuction = true;
          ni.onOffer = false;
        } else if (parseInt(sale[8]) === 0x02) {
          ni.onSale = false;
          ni.onAuction = false;
          ni.onOffer = true;
        }
        ni.method = parseInt(sale[8]);
        ni.endTime = sale[10];
        ni.payment = payments[parseInt(sale[6])];
        ni.price = Moralis.Units.FromWei(sale[7], ni.payment.decimals);
        ni.seller = sale[2];
      }

      let file = null;
      if (ni.image) {
        file = await getFileTypeFromURL(ni.image);
      } else if (ni.metadata && ni.metadata.image) {
        file = await getFileTypeFromURL(ni.metadata.image);
      } else {
        file = {mimeType: 'image', fileType: 'image'};
      }
      ni.item_type = file.fileType;
      ni.mime_type = file.mimeType;
    }

    // console.log(newItems);
    setNfts(newItems);
  }, [sales, newItems]);

  return (
    <div className='nft-big'>
      { nfts && nfts.length > 0 &&
      <Slider {...carouselCollectionSingle}>
        {nfts && nfts.map( (nft, index) => (
          <div onClick={() => handleBuyClick(nft)} className='itm' index={index+1} key={index}>
            <div className="nft_pic">
              <span>
                <span className="nft_pic_info">
                  <span className="nft_pic_title">{nft.metadata && nft.metadata.name ? nft.metadata.name : nft.name}</span>
                  <span className="nft_pic_by">{nft.author && nft.author.name ? formatUserName(nft.author.name) : formatAddress(nft.author.walletAddr.toLowerCase(), 'wallet')}</span>
                </span>
              </span>
              <div className="nft_pic_wrap">
                { nft.item_type && nft.item_type == 'image' &&
                  <img src={nft.image ? nft.image : nft.metadata && nft.metadata.image ? nft.metadata.image : fallbackImg} className="lazy img-fluid" alt=""/>
                }
                { nft.item_type && nft.item_type == 'video' &&
                  <video width="100%" height="100%" controls className="lazy img-fluid">
                    <source src={nft.image} type={nft.mime_type} />
                  </video>
                }
                { nft.item_type && nft.item_type == 'audio' &&
                  <audio controls className="lazy img-fluid">
                    <source src={nft.image} type={nft.mime_type} />
                  </audio>
                }
              </div>
            </div>
          </div>
        ))}
      </Slider>
    }
    </div>
  );
}

export default memo(SliderCarouselHome);
