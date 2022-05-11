// import { process } from "dotenv";
import React, { memo, useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import * as selectors from '../../store/selectors';
import * as actions from '../../store/actions/thunks';
import { useMoralis } from "react-moralis";
import Footer from '../components/footer';

import {useMoralisDapp} from "../../providers/MoralisDappProvider/MoralisDappProvider";

import { navigate } from "@reach/router";

import Countdown from 'react-countdown';
import { Spin, Modal } from "antd";
import styled from 'styled-components';

import BigNumber from "bignumber.js";
import { createGlobalStyle } from 'styled-components';
import { formatAddress, formatUserName, getFileTypeFromURL, getPayments, getUserInfo, getFavoriteCount } from "../../utils";
import { defaultAvatar, fallbackImg } from "../components/constants";

import NftCard from "../components/NftCard";

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
    
  const [auctions, setAuctions] = useState([]);
  const [saleNFTs, setSaleNFTs] = useState([]);
  const [payments, setPayments] = useState([]);
  
  const [loading, setLoading] = useState(true);
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

  const handleBuyClick = (nft) => {
    dispatch(actions.setBuyNFT(nft));
    navigate(`/collection/${nft.token_address}/${nft.token_id ? nft.token_id : nft.tokenId}`);
  };

  useEffect(() => {
    async function getBaseData() {
      setPayments(await getPayments());
      await getSalesInfo();
    }

    getBaseData();
  }, []);

  useEffect(() => {
    async function getLiveAuctions() {
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
            temp[0].author = await getUserInfo(sale[2].toLowerCase());
            if (!temp[0].author) {
              temp[0].author = {walletAddr: sale[2].toLowerCase()};
            }

            if (isAuthenticated && account) {
              temp[0].isOwner = temp[0].author && temp[0].author.walletAddr.toLowerCase() === account.toLowerCase();
            }
            
            //set endTime
            temp[0].endTime = parseInt(sale[10]);

            //get creator of NFT
            temp[0].creator = temp[0].metadata && temp[0].metadata.creator ? await getUserInfo(temp[0].metadata.creator) : null;

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

            //get favorites
            try {
              const favorites = await getFavoriteCount(temp[0].token_address, temp[0].token_id, account ? account : null);
              temp[0].likes = favorites.count;
              temp[0].liked = favorites.liked;
            } catch (e) {
              console.log(e);
              temp[0].likes = 0;
              temp[0].liked = false;
            }

            nfts.push(temp[0]);
          }
        } catch (e) {
          console.log(e);
        }
      }

      setAuctions(nfts);
      setLoading(false);
    }
    if (saleNFTs.length > 0) {
      getLiveAuctions();
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
            <NftCard
              nft={nft}
              className={"d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4"}
              handleItemClick={handleBuyClick}
              key={index}
              clockTop={false}
            />
          ))}
        </div>
      </section>


      <Footer />
    </div>
  )
};

export default memo(LiveAuction);