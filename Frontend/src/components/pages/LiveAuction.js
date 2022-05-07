// import { process } from "dotenv";
import React, { memo, useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import * as selectors from '../../store/selectors';
import * as actions from '../../store/actions/thunks';
import { useMoralis, useWeb3ExecuteFunction } from "react-moralis";
import Footer from '../components/footer';

import {useMoralisDapp} from "../../providers/MoralisDappProvider/MoralisDappProvider";

import axios from "axios";

import { navigate } from "@reach/router";

import Countdown from 'react-countdown';
import { Spin, Modal } from "antd";
import styled from 'styled-components';

import BigNumber from "bignumber.js";
import { createGlobalStyle } from 'styled-components';
import { getFileTypeFromURL } from "../../utils";
import { defaultAvatar, fallbackImg } from "../components/constants";

//IMPORT DYNAMIC STYLED COMPONENT
import { StyledHeader } from '../Styles';

//SWITCH VARIABLE FOR PAGE STYLE
const theme = 'GREY'; //LIGHT, GREY, RETRO

const GlobalStyles = createGlobalStyle`
  .greyscheme .de_countdown{
    position: relative;
    display: flex;
    align-items: center;
    text-align: center;
    justify-content: center;
    right: 0;
  }
`

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
`

const renderer = props => {
  // console.log(props);
  if (props.completed) {
    // Render a completed state
    return <span>Ended</span>;
  } else {
    // Render a countdown
    return <span>{props.formatted.days}d {props.formatted.hours}h {props.formatted.minutes}m {props.formatted.seconds}s</span>;
  }
};

const LiveAuction = () => {
  const dispatch = useDispatch();

  const currentUserState = useSelector(selectors.currentUserState);
  
  const { account, Moralis, isAuthenticated } = useMoralis();
  const { marketAddress, contractABI } = useMoralisDapp();
  const contractProcessor = useWeb3ExecuteFunction();
  
  const [auctions, setAuctions] = useState([]);
  const [saleNFTs, setSaleNFTs] = useState([]);
  const [payments, setPayments] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [loadingTitle, setLoadingTitle] = useState("Loading...");

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
      function_name: "getSaleInfo",
      abi: contractABI,
      params: {
        startIdx: "0",
        count: "100000"
      },
    };
    const data = await Moralis.Web3API.native.runContractFunction(ops);
    // console.log("saleInfo:", data);
    const sales = data.filter((sale, index) => {
      return parseInt(sale[8]) === 0x01;
    });
    setSaleNFTs(sales);
  }

  async function getPayments() {
    try {
      await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/payments`, {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          allowed: 1
        }
      }).then(async res => {
        let payments = [];
        for (let p of res.data.payments) {
          payments.push({
            value: p.id, 
            label: p.title + " (" + p.symbol + ")", 
            addr: p.addr, 
            title: p.title, 
            type: p.type,
            symbol: p.symbol,
            decimals: p.decimals
          });
        }
        setPayments(payments);
      });
    } catch {
      console.log('error in fetching payments');
    }
  }

  const getNFTCreator = async (walletAddr) => {
    let creator = null;
    
    await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/user`, {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        walletAddr: walletAddr.toLowerCase()
      }
    }).then(res => {
      creator = res.data.user;
    }).catch(err => {
      console.log(err);
      creator = null;
    });
            
    return creator;
  };

  const handleBuyClick = (nft) => {
    dispatch(actions.setBuyNFT(nft));
    navigate('/item-detail');
  };

  useEffect(async () => {
    setLoading(true);
    await getPayments();
    await getSalesInfo();
  }, []);

  useEffect(async () => {
    if (saleNFTs.length > 0) {
      setLoading(true);
      
      let nfts = [];
      for (let sale of saleNFTs) {
        try {
          const options = {
            address: sale[3],
            chain: process.env.REACT_APP_CHAIN_ID
          };
          const result = await Moralis.Web3API.token.getAllTokenIds(options);
          
          const temp = result?.result.filter((nft, index) => {
            return parseInt(nft.token_id) === parseInt(sale[4]);
          });

          if (temp.length > 0) {
            //get price by payment
            if (payments.length >= parseInt(sale[6]) + 1) {
              const payment = payments[parseInt(sale[6])];
              temp[0].price = new BigNumber(sale[7]).dividedBy(new BigNumber(10).pow(payment.decimals)).toNumber();
              temp[0].payment = payment;
            }
            
            //get metadata
            if (temp[0].metadata === null) {
              const ops = {
                address: temp[0].token_address,
                token_id: temp[0].token_id,
                chain: process.env.REACT_APP_CHAIN_ID
              };
              const tokenIdMetadata = await Moralis.Web3API.token.getTokenIdMetadata(ops);
              if (tokenIdMetadata.token_uri) {
                await fetch((tokenIdMetadata.token_uri))
                  .then((response) => response.json())
                  .then((data) => {
                    temp[0].image = data.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
                    temp[0].metadata = data;
                  }).catch(function() {
                    console.log("error: getting uri");
                    temp[0].image = fallbackImg;
                  });
              } else {
                temp[0].image = fallbackImg;
              }
            } else {
              if (typeof temp[0].metadata === "string") {
                temp[0].metadata = JSON.parse(temp[0].metadata);
                temp[0].image = temp[0].metadata.image ? temp[0].metadata.image : fallbackImg;
              }
            }

            //get author/seller info
            try {
              await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/user`, {
                headers: {
                  'Content-Type': 'application/json',
                },
                params: {
                  walletAddr: sale[2].toLowerCase()
                }
              }).then(res => {
                temp[0].author = res.data.user;
                if (isAuthenticated && account) {
                  temp[0].isOwner = res.data.user && res.data.user.walletAddr.toLowerCase() === account.toLowerCase();
                }
              });
            } catch (err) {
              console.log("fetching user error:", err);
              temp[0].author = null;
            }

            //set endTime
            temp[0].endTime = parseInt(sale[10]);

            //get creator of NFT
            temp[0].creator = temp[0].metadata && temp[0].metadata.creator ? await getNFTCreator(temp[0].metadata.creator) : null;

            //check sale type
            if (parseInt(sale[8]) === 0x00) {
              temp[0].onSale = true;
              temp[0].onAuction = false;
              temp[0].onOffer = false;
            } else if (parseInt(sale[8]) === 0x01) {
              temp[0].onSale = false;
              temp[0].onAuction = true;
              temp[0].onOffer = false;
            } else if (parseInt(sale[8]) === 0x02) {
              temp[0].onSale = false;
              temp[0].onAuction = false;
              temp[0].onOffer = true;
            } else {
              temp[0].onSale = false;
              temp[0].onAuction = false;
              temp[0].onOffer = false;
            }

            let file = null;
            if (temp[0].image) {
              file = await getFileTypeFromURL(temp[0].image);
            } else if (temp[0].metadata && temp[0].metadata.image) {
              file = await getFileTypeFromURL(temp[0].metadata.image);
            } else {
              file = {mimeType: 'image', fileType: 'image'};
            }
            temp[0].item_type = file.fileType;
            temp[0].mime_type = file.mimeType;

            nfts.push(temp[0]);
          }
        } catch (e) {
          console.log(e);
        }
      }
      setLoading(false);
      setAuctions(nfts);
    } else {
      setLoading(false);
    }
  }, [saleNFTs]);

  return (
    <div className="greyscheme">
      <StyledHeader theme={theme} />
      <GlobalStyles />

      <StyledModal
        title=''
        visible={loading}
        centered
        footer={null}
        closable={false}
      >
        <div className="row">
          <StyledSpin tip={loadingTitle} size="large" />
        </div>
      </StyledModal>

      <section className='jumbotron breadcumb no-bg'
              style={{backgroundImage: `url(${currentUserState && currentUserState.data && currentUserState.data.banner ? currentUserState.data.banner : ''})`}}>
        <div className='mainbreadcumb'>
          <div className='container'>
            <div className='row m-10-hor'>
              <div className='col-12'>
                <h1 className='text-center'>Live Auction</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='container'>
        <div className="row">
          { auctions && auctions.map( (nft, index) => (
            <div className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4" key={index}>
              <div className="nft__item m-0">
                { nft.item_type && nft.item_type === 'single_items' ? (
                  <div className='icontype'><i className="fa fa-bookmark"></i></div>   
                  ) : (  
                  <div className='icontype'><i className="fa fa-shopping-basket"></i></div>
                    )
                }
                <div className="author_list_pp">
                  <span onClick={()=> navigate(nft.author && nft.author.walletAddr ? "/author/" + nft.author.walletAddr : '')}>
                    <img className="lazy" 
                        src={nft.author && nft.author.avatar ? nft.author.avatar : defaultAvatar} 
                        title={nft.author && nft.author.name ? nft.author.name : 'Unknown'}
                        alt=""/>
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
                          <source src={nft.image} type={nft.mime_type} />
                        </video>
                      }
                      { nft.item_type && nft.item_type == 'audio' &&
                        <audio onLoadedMetadata={onImgLoad} controls className="lazy nft__item_preview">
                          <source src={nft.image} type={nft.mime_type} />
                        </audio>
                      }
                    </span>
                  </Outer>
                </div>
                { nft.endTime && 
                  <div className="de_countdown mt-4 mb-4">
                    <Countdown
                      date={parseInt(nft.endTime) * 1000}
                      renderer={renderer}
                    />
                    <span className="space-40"></span>
                  </div>
                  
                }
                <div className="nft__item_info">
                  <span onClick={() => handleBuyClick(nft)}>
                    <h4>{nft.metadata && nft.metadata.name ? nft.metadata.name : nft.name}</h4>
                  </span>
                  
                  { nft.price && 
                  <div className="nft__item_price">
                    {nft.price} {nft.payment && nft.payment.symbol ? nft.payment.symbol : 'Unknown'}
                  </div>
                  }
                  <div className="nft__item_action">
                    {nft.isOwner && (
                      <span onClick={() => handleBuyClick(nft)}>Cancel Auction</span>
                    )}
                    {!nft.isOwner && (
                      <span onClick={() => handleBuyClick(nft)}>Place a bid</span>
                    )}
                  </div>
                  <div className="nft__item_like">
                      <i className="fa fa-heart"></i><span>{nft.likes ? nft.likes : 0}</span>
                  </div>                            
                </div> 
              </div>
            </div>
          ))}
          
        </div>
      </section>


      <Footer />
    </div>
  )
};

export default memo(LiveAuction);