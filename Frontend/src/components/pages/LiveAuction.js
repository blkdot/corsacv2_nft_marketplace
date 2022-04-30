import React, { memo, useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import * as selectors from '../../store/selectors';
import * as actions from '../../store/actions/thunks';
import { useChain, useMoralis, useWeb3ExecuteFunction } from "react-moralis";
import Footer from '../components/footer';

import {useMoralisDapp} from "../../providers/MoralisDappProvider/MoralisDappProvider";

import axios from "axios";

import { navigate } from "@reach/router";

import Countdown from 'react-countdown';
import { Spin, Modal } from "antd";
import styled from 'styled-components';

import BigNumber from "bignumber.js";
import { createGlobalStyle } from 'styled-components';
import api from "../../core/api";

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
  
  const { Moralis } = useMoralis();
  const { chainId } = useChain();
  const { marketAddress, contractABI } = useMoralisDapp();
  const contractProcessor = useWeb3ExecuteFunction();
  
  const [auctions, setAuctions] = useState([]);
  const [saleNFTs, setSaleNFTs] = useState([]);
  const [payments, setPayments] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [loadingTitle, setLoadingTitle] = useState("Loading...");

  const [height, setHeight] = useState(0);

  const defaultAvatar = api.baseUrl + '/uploads/thumbnail_author_4_623046d09c.jpg';
  const fallbackImg =
    "data:image/png;base64,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";

  const onImgLoad = ({target:img}) => {
    let currentHeight = height;
    if(currentHeight < img.offsetHeight) {
        setHeight(img.offsetHeight);
    }
  }

  async function getSalesInfo() {
    if (window.web3 === undefined && window.ethereum === undefined)
      return;
    const web3 = await Moralis.enableWeb3();
    const ops = {
      contractAddress: marketAddress,
      functionName: "getSaleInfo",
      abi: contractABI,
      params: {
        startIdx: 0,
        count: 100000
      },
    };
    await contractProcessor.fetch({
      params: ops,
      onSuccess: (result) => {
        console.log("success:getSalesInfo");
        // console.log(ops);
        const sales = result.filter((sale, index) => {
          return parseInt(sale.method) === 0x01;
        });
        setSaleNFTs(sales);
      },
      onError: (error) => {
        console.log("failed:getSalesInfo", error);
        setSaleNFTs([]);
      },
    });
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
            address: sale.sc,
            chain: chainId
          };
          const result = await Moralis.Web3API.token.getAllTokenIds(options);
          
          const temp = result?.result.filter((nft, index) => {
            return parseInt(nft.token_id) === parseInt(sale.tokenId);
          });

          if (temp.length > 0) {
            //get price by payment
            if (payments.length >= parseInt(sale.payment) + 1) {
              const payment = payments[parseInt(sale.payment)];
              temp[0].price = new BigNumber(sale.basePrice._hex).dividedBy(new BigNumber(10).pow(payment.decimals)).toNumber();
              temp[0].payment = payment;
            }

            //get metadata
            if (temp[0].metadata === null) {
              const ops = {
                address: temp[0].token_address,
                token_id: temp[0].token_id,
                chain: chainId
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
                  walletAddr: sale.seller.toLowerCase()
                }
              }).then(res => {
                temp[0].author = res.data.user;
              });
            } catch (err) {
              console.log("fetching user error:", err);
              temp[0].author = null;
            }

            //set endTime
            temp[0].endTime = parseInt(sale.endTime);

            //check sale type
            if (parseInt(sale.method) === 0x00) {
              temp[0].onSale = true;
              temp[0].onAuction = false;
              temp[0].onOffer = false;
            } else if (parseInt(sale.method) === 0x01) {
              temp[0].onSale = false;
              temp[0].onAuction = true;
              temp[0].onOffer = false;
            } else if (parseInt(sale.method) === 0x02) {
              temp[0].onSale = false;
              temp[0].onAuction = false;
              temp[0].onOffer = true;
            } else {
              temp[0].onSale = false;
              temp[0].onAuction = false;
              temp[0].onOffer = false;
            }
          }

          nfts.push(temp[0]);
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
                      <img onLoad={onImgLoad} src={ nft.image } className="lazy nft__item_preview" alt=""/>
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
                    <span onClick={() => handleBuyClick(nft)}>Place a bid</span>
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