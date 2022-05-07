import React, { memo, useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import * as selectors from '../../store/selectors';
import * as actions from '../../store/actions/thunks';
import {useChain, useMoralis, useMoralisWeb3Api, useWeb3ExecuteFunction} from "react-moralis";
import Footer from '../components/footer';

import {useMoralisDapp} from "../../providers/MoralisDappProvider/MoralisDappProvider";

import axios from "axios";
import api from "../../core/api";

//IMPORT DYNAMIC STYLED COMPONENT
import { StyledHeader } from '../Styles';
import { navigate } from "@reach/router";

import { Spin, Modal } from "antd";
import styled from 'styled-components';
import Countdown from 'react-countdown';

import moment from "moment";
import BigNumber from "bignumber.js";
import { defaultAvatar, fallbackImg } from "../components/constants";
import { getFileTypeFromURL } from "../../utils";

//SWITCH VARIABLE FOR PAGE STYLE
const theme = 'GREY'; //LIGHT, GREY, RETRO

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

const Collection = props => {
  const currentUserState = useSelector(selectors.currentUserState);

  const dispatch = useDispatch();

  const { account, Moralis, isAuthenticated, isWeb3EnableLoading, isWeb3Enabled } = useMoralis();
  const { chainId } = useChain();
  const { marketAddress, contractABI } = useMoralisDapp();
  const contractProcessor = useWeb3ExecuteFunction();
  const Web3Api = useMoralisWeb3Api();

  const [collection, setCollection] = useState({});
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingTitle, setLoadingTitle] = useState("Loading...");

  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [openModal, setOpenModal] = useState(false);

  const [height, setHeight] = useState(210);
  const [clockTop, setClockTop] = useState(true);

  const onImgLoad = ({target:img}) => {
    let currentHeight = height;
    if(currentHeight < img.offsetHeight) {
        setHeight(img.offsetHeight);
    }
  }

  const renderer = props => {
    if (props.completed) {
      // Render a completed state
      return <span>Ended</span>;
    } else {
      // Render a countdown
      return <span>{props.formatted.days}d {props.formatted.hours}h {props.formatted.minutes}m {props.formatted.seconds}s</span>;
    }
  }

  const closeModal = () => {
    setOpenModal(false);
    setModalTitle('');
    setModalMessage('');
  }

  const handleItemClick = (nft) => {
    dispatch(actions.setBuyNFT(nft));
    navigate('/item-detail');
  };

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

  async function getFetchItems() {
    if (!props.address) {
      setOpenModal(true);
      setModalTitle('Error');
      setModalMessage('Missing collection address');

      setTimeout(() => {
        setOpenModal(false);
        navigate("/");
      }, 5000);
    }

    //get all payments
    let payments = [];
    try {
      await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/payments`, {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          allowed: 1
        }
      }).then(async res => {
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
      });
    } catch {
      console.log('error in fetching payments');
    }

    if (payments.length === 0) {
      setLoading(false);

      setModalTitle('Error');
      setModalMessage('Cannot get payments list from backend');
      setOpenModal(true);
      return;
    }

    const collectionAddr = props.address;

    //get collection from backend
    await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/collection/address`, {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        collectionAddr: collectionAddr
      }
    }).then(async res => {
      let c = res.data.collection;
      if (!c._id) {
        setLoading(false);

        setOpenModal(true);
        setModalTitle('Error');
        setModalMessage('Cannot get collection with this address');
        
        setTimeout(() => {
          setOpenModal(false);
          navigate("/");
        }, 5000);
      }

      const options = {
        address: c.collectionAddr,
        // chain: chainId,
        chain: process.env.REACT_APP_CHAIN_ID,
      };

      //get nfts of items of collection
      const NFTs = await Web3Api.token.getAllTokenIds(options);
      const itemsCount = NFTs.result.length;
      c.itemsCount = itemsCount;
      // console.log("nfts:", NFTs);
      setCollection(c);

      //get all saleItems from marketplace
      let saleItems = [];
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
      saleItems = await Moralis.Web3API.native.runContractFunction(ops);
      // console.log("saleItems:", saleItems);

      let newNFTs = [];
      // console.log(NFTs.result);
      for (let nft of NFTs.result) {
        let metadata = null;
        //get metadata
        const options = {
          address: nft.token_address,
          token_id: nft.token_id,
          chain: process.env.REACT_APP_CHAIN_ID
        };
        const tokenIdMetadata = await Moralis.Web3API.token.getTokenIdMetadata(options);
        //get author/seller info
        try {
          await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/user`, {
            headers: {
              'Content-Type': 'application/json',
            },
            params: {
              walletAddr: tokenIdMetadata.owner_of.toLowerCase()
            }
          }).then(res => {
            nft.author = res.data.user;
            if (isAuthenticated && account) {
              nft.isOwner = res.data.user && res.data.user.walletAddr.toLowerCase() === account.toLowerCase();
            }
          });
        } catch (err) {
          console.log("fetching user error:", err);
          nft.author = null;
        }

        if (nft.metadata) {
          if (typeof nft.metadata === "string") {
            metadata = JSON.parse(nft.metadata);
          } else {
            metadata = nft.metadata;
          }
        } else if (nft.token_uri) {
          const response = await fetch(nft.token_uri);
          metadata = await response.json();
        } else {
          metadata = null;
        }
        
        let sales = saleItems.filter((s, index) => {
          return nft.token_address.toLowerCase() === s[3].toLowerCase() 
                  && parseInt(nft.token_id) === parseInt(s[4]);
        });

        if (sales.length > 0) {
          const sale = sales[0];

          const method = parseInt(sale[8]);
          const endTime = parseInt(sale[10]);
          const currentTime = Math.floor(new Date().getTime() / 1000);
          const payment = payments[parseInt(sale[6])];
          const decimals = (payment && payment.decimals != undefined && payment.decimals != null) ? parseInt(payment.decimals) : 18;
          const basePrice = new BigNumber(sale[7]).dividedBy(new BigNumber(10).pow(decimals)).toNumber();
          
          metadata.price = basePrice;
          metadata.payment = payment;

          if (method === 1 && endTime > currentTime) {
            metadata.onAuction = true;
            metadata.onSale = false;
            metadata.onOffer = false;
            metadata.endTime = endTime;
          } else if (method === 0) {
            metadata.onAuction = false;
            metadata.onSale = true;
            metadata.onOffer = false;
          } else if (method === 1) {
            metadata.onAuction = false;
            metadata.onSale = false;
            metadata.onOffer = true;
          } else {
            metadata.onAuction = false;
            metadata.onSale = false;
            metadata.onOffer = false;
          }
        }
        
        nft.metadata = metadata;

        let tempNFT = {};
        tempNFT.creator = nft.metadata && nft.metadata.creator ? await getNFTCreator(nft.metadata.creator) : null;
        tempNFT.author = nft.author ? nft.author : null;
        tempNFT.metadata = metadata;
        tempNFT.token_address = nft.token_address;
        tempNFT.token_id = nft.token_id;
        tempNFT.name = !nft.metadata ? nft.name : nft.metadata.name;
        tempNFT.description = !nft.metadata ? '' : nft.metadata.description;
        tempNFT.collection = !nft.metadata ? nft.name : nft.metadata.collection.label;
        tempNFT.image = !nft.metadata ? (nft.image ? nft.image : fallbackImg): nft.metadata.image;
        tempNFT.payment = !nft.metadata ? (nft.payment ? nft.payment : 'Unknown'): nft.metadata.payment;
        tempNFT.price = !nft.metadata ? (nft.price ? nft.price : 0): nft.metadata.price;
        tempNFT.onSale = !nft.metadata ? false : (nft.metadata.onSale == null ? false : nft.metadata.onSale);
        tempNFT.onAuction = !nft.metadata ? false : (nft.metadata.onAuction == null ? false : nft.metadata.onAuction);
        tempNFT.onOffer = !nft.metadata ? false : (nft.metadata.onOffer == null ? false : nft.metadata.onOffer);
        tempNFT.endTime = !nft.metadata ? false : (nft.metadata.endTime == null ? 0 : nft.metadata.endTime);
        tempNFT.isOwner = nft.isOwner ? nft.isOwner : false;

        let file = null;
        if (tempNFT.image) {
          file = await getFileTypeFromURL(tempNFT.image);
        } else if (tempNFT.metadata && tempNFT.metadata.image) {
          file = await getFileTypeFromURL(tempNFT.metadata.image);
        } else {
          file = {mimeType: 'image', fileType: 'image'};
        }
        tempNFT.item_type = file.fileType;
        tempNFT.mime_type = file.mimeType;

        newNFTs.push(tempNFT);
      }
      // console.log("newNFTs:", newNFTs);
      
      setItems(newNFTs);
      setLoading(false);
    }).catch((e) => {
      setLoading(false);

      setOpenModal(true);
      setModalTitle('Error');
      setModalMessage('Error occurs while fetching data from backend');
    });
  }

  useEffect(async () => {
    getFetchItems();
    setLoading(true);
  }, [account]);

  return (
    <div className="greyscheme">
      <StyledHeader theme={theme} />

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

      <section id='profile_banner' 
              className='jumbotron breadcumb no-bg' 
              style={{backgroundImage: `url(${currentUserState && currentUserState.data && currentUserState.data.banner ? currentUserState.data.banner : ''})`}}>
        <div className='mainbreadcumb'>
        </div>
      </section>

      <section className='container d_coll no-top no-bottom'>
        <div className='row'>
          <div className="col-md-12">
            <div className="d_profile">
              <div className="profile_avatar">
              { collection.image && 
                <div className="d_profile_img">
                  <img src={collection.image} alt=""/>
                  <i className="fa fa-check"></i>
                </div>
              }
              { collection.title != null &&
              <div className="profile_name">
                  <h4>
                    {collection.title} ({collection.symbol})
                    <div className="clearfix"></div>
                  </h4>
                  <p id="description" className="text-muted">{collection.description}</p>
                  <span id="category" className="profile_wallet">Category: {collection.category}</span><br/>
                  <span id="item_count" className="profile_wallet">Items: {collection.itemsCount}</span><br/>
                  <span id="created_at" className="profile_wallet">Created at {moment(collection.timeStamp * 1000).format('L')}</span>
              </div>
              }
            </div>
          </div>
        </div>
        </div>
      </section>

      <section className='container no-top'>
        <div className="col-md-12">
          <div className="row">
            <div className="d-item col-lg-12 col-md-12 col-sm-12 col-xs-12 mb-4">
              <button id="createButton" className="btn-main" onClick={()=>{navigate("/createItem")}}>
                Create item
              </button>
            </div>
          </div>
          
          {!loading && items.length == 0 &&
          <div className="row">
            <div className="alert alert-danger" role="alert">
              No items
            </div>
          </div>
          }

          <div className="row">
          { !loading && items && items.map((nft, index) => (
            <div className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4" key={index}>
              <div className="nft__item m-0">
                { nft.endTime !=null && nft.endTime > 0 && clockTop &&
                  <div className="de_countdown">
                    <Countdown
                      date={parseInt(nft.endTime) * 1000}
                      renderer={renderer}
                    />
                  </div>
                }
                  <div className="author_list_pp">
                      <span onClick={()=> navigate(nft.author && nft.author.walletAddr ? '/author/' + nft.author.walletAddr : '/')}>                                    
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
                  { nft.endTime != null && nft.endTime > 0 && !clockTop &&
                      <Countdown
                        date={parseInt(nft.endTime) * 1000}
                        renderer={renderer}
                      />
                  }
                  <div className="nft__item_info">
                      <span onClick={() => navigate(nft.nft_link ? `${nft.nft_link}/${nft.id}` : '')}>
                        <h4>{nft.name}</h4>
                      </span>
                      { (nft.onSale || nft.onOffer || nft.onAuction) &&
                        <div className="nft__item_price">
                          {nft.price} {nft.payment && nft.payment.symbol ? nft.payment.symbol : 'Unknown'}
                        </div>
                      }
                      <div className="nft__item_action">
                        {nft.isOwner && (nft.onSale || nft.onAuction || nft.onOffer) && (
                          <span onClick={() => handleItemClick(nft)}>Cancel {nft.onSale ? 'Sale' : nft.onAuction ? 'Auction' : nft.onOffer ? 'Offer' : 'Sale'}</span>
                        )}
                        {!nft.isOwner && (nft.onSale || nft.onOffer) && (
                          <span onClick={() => handleItemClick(nft)}>Buy Now</span>
                        )}
                        {!nft.isOwner && (nft.onAuction) && (
                          <span onClick={() => handleItemClick(nft)}>Place a bid</span>
                        )}
                        {(!nft.onAuction && !nft.onSale && !nft.onOffer) && (
                          <span onClick={() => handleItemClick(nft)}>View Item</span>
                        )}
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
        </div>
      </section>
      <Footer />

      { openModal && 
        <div className='checkout'>
          <div className='maincheckout'>
            <button className='btn-close' onClick={() => closeModal()}>x</button>
            <div className='heading'>
                <h3>{modalTitle}</h3>
            </div>
            <p>
              <span className="bold">{modalMessage}</span>
            </p>
            <button className='btn-main lead mb-5' onClick={() => closeModal()}>Yes</button>
          </div>
        </div>
      }
    </div>
  );
}
export default memo(Collection);