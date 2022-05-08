import React, { memo, useEffect, useState } from 'react';
import { Modal, Spin } from "antd";
import { useMoralisDapp } from "../../providers/MoralisDappProvider/MoralisDappProvider";
import { useMoralis, useMoralisWeb3Api, useWeb3ExecuteFunction } from "react-moralis";
import axios from "axios";
import BigNumber from "bignumber.js";
import styled from 'styled-components';
import Countdown from 'react-countdown';
import { navigate } from '@reach/router';
import { useDispatch } from 'react-redux';
import * as actions from '../../store/actions/thunks';
import { defaultAvatar, fallbackImg } from './constants';
import { getFileTypeFromURL, getPayments, getUserInfo } from '../../utils';

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
const renderer = props => {
  if (props.completed) {
    // Render a completed state
    return <span>Ended</span>;
  } else {
    // Render a countdown
    return <span>{props.formatted.days}d {props.formatted.hours}h {props.formatted.minutes}m {props.formatted.seconds}s</span>;
  }
};

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

  const [height, setHeight] = useState(210);

  const { isAuthenticated, account, Moralis } = useMoralis();
  const { marketAddress, contractABI } = useMoralisDapp();

  const [loading, setLoading] = useState(true);
  
  const [saleNFTs, setSaleNFTs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [clockTop, setClockTop] = useState(true);

  const NEW_ITEM_DURATION = 7 * 24 * 3600;

  const onImgLoad = (e) => {
    let currentHeight = height;
    if(currentHeight < e.target.offsetHeight) {
        setHeight(e.target.offsetHeight);
    }
  }
  
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
          try {
            await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/user`, {
              headers: {
                'Content-Type': 'application/json',
              },
              params: {
                walletAddr: saleInfo[2].toLowerCase()
              }
            }).then(res => {
              nft.author = res.data.user;
              if (isAuthenticated && account) {
                nft.isOwner = nft.author && nft.author.walletAddr.toLowerCase() === account.toLowerCase();
              }
            });
          } catch (err) {
            console.log("fetching user error:", err);
            nft.author = null;
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
        <div className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4" key={index}>
          <div className="nft__item m-0">
            { nft.item_type && nft.item_type === 'single_items' ? (
              <div className='icontype'><i className="fa fa-bookmark"></i></div>   
              ) : (  
              <div className='icontype'><i className="fa fa-shopping-basket"></i></div>
                )
            }
            { nft.endTime && clockTop &&
              <div className="de_countdown">
                <Countdown
                  date={parseInt(nft.endTime) * 1000}
                  renderer={renderer}
                />
              </div>
            }
              <div className="author_list_pp">
                {/* <span onClick={()=> navigate('/author/' + (nft.seller ? nft.seller.walletAddress : ''))}> */}
                <span>
                  <img className="lazy" 
                      src={nft.author && nft.author.avatar ? nft.author.avatar : defaultAvatar} 
                      title={nft.author && nft.author.name ? nft.author.name : 'Unknown'} 
                      alt={nft.author && nft.author.name ? nft.author.name : 'Unknown'} 
                  />
                  <i className="fa fa-check"></i>
                </span>
              </div>
              <div className="nft__item_wrap" style={{height: `${height}px`}}>
                <Outer>
                  <span>
                    { nft.item_type && nft.item_type == 'image' &&
                      <img onLoad={onImgLoad} src={nft.image ? nft.image : nft.metadata && nft.metadata.image ? nft.metadata.image : fallbackImg} className="lazy nft__item_preview" alt=""/>
                    }
                    { nft.item_type && nft.item_type == 'video' &&
                      <video onLoadedMetadata={onImgLoad} width="100%" height="100%" controls className="lazy nft__item_preview">
                        <source src={nft.image ? nft.image : nft.metadata && nft.metadata.image ? nft.metadata.image : fallbackImg} type={nft.mime_type} />
                      </video>
                    }
                    { nft.item_type && nft.item_type == 'audio' &&
                      <audio onLoadedMetadata={onImgLoad} controls className="lazy nft__item_preview">
                        <source src={nft.image ? nft.image : nft.metadata && nft.metadata.image ? nft.metadata.image : fallbackImg} type={nft.mime_type} />
                      </audio>
                    }
                  </span>
                </Outer>
              </div>
              { nft.endTime && !clockTop &&
                <Countdown
                  date={parseInt(nft.endTime) * 1000}
                  renderer={renderer}
                />
              }
              <div className="nft__item_info">
                <span onClick={() => handleItemClick(nft)}>
                  <h4>{nft.metadata.name ? nft.metadata.name : nft.name}</h4>
                </span>
                  { nft.onSale || nft.onOffer || nft.onAuction ? (
                      <div className="nft__item_price">
                        {nft.price} {nft.payment ? nft.payment.symbol : 'Unknown'}
                        {/* { nft.onAuction && 
                            <span>{nft.bid}/{nft.max_bid}</span>
                        } */}
                      </div>
                    ) : (
                      <div className="nft__item_price">
                        {nft.price} {nft.payment ? nft.payment.symbol : 'Unknown'}
                      </div>
                      )
                  }
                  <div className="nft__item_action">
                    <>
                      {nft.isOwner && (
                        <span onClick={() => handleItemClick(nft)}>Cancel {nft.onSale ? 'Sale' : nft.onAuction ? 'Auction' : nft.onOffer ? 'Offer' : 'Sale'}</span>
                      )}
                      {(!nft.isOwner && (nft.onSale || nft.onOffer)) && (
                        <span onClick={() => handleItemClick(nft)}>Buy Now</span>
                      )}
                      {(!nft.isOwner && nft.onAuction) && (
                        <span onClick={() => handleItemClick(nft)}>Place a bid</span>
                      )}
                    </>
                  </div>
                  <div className="nft__item_like">
                      <i className="fa fa-heart"></i><span>{nft.likes ? nft.likes : 0}</span>
                  </div>                            
              </div> 
          </div>
        </div>
        )
      )
      }
    </div>
  );
};

export default memo(NewItems);