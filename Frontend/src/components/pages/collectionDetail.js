import React, { memo, useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import * as selectors from '../../store/selectors';
import * as actions from '../../store/actions/thunks';
import {useChain, useMoralis, useMoralisWeb3Api, useWeb3ExecuteFunction} from "react-moralis";
import Footer from '../components/footer';

import {useMoralisDapp} from "../../providers/MoralisDappProvider/MoralisDappProvider";

import axios from "axios";

//IMPORT DYNAMIC STYLED COMPONENT
import { StyledHeader } from '../Styles';
import { navigate, useParams } from "@reach/router";

import { Spin, Modal } from "antd";
import styled from 'styled-components';
import moment from "moment";
import BigNumber from "bignumber.js";
import { fallbackImg } from "../components/constants";
import { getFileTypeFromURL, getUserInfo, getFavoriteCount, sleep, getBlacklist } from "../../utils";
import NftCard from "../components/NftCard";

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

const Collection = () => {
  const params = useParams();
  const currentUserState = useSelector(selectors.currentUserState);
  
  const dispatch = useDispatch();

  const { account, Moralis, isAuthenticated } = useMoralis();
  const { marketAddress, contractABI } = useMoralisDapp();
  const Web3Api = useMoralisWeb3Api();

  const [collection, setCollection] = useState({});
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingTitle, setLoadingTitle] = useState("Loading...");

  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [openModal, setOpenModal] = useState(false);

  const [clockTop, setClockTop] = useState(true);

  const closeModal = () => {
    setOpenModal(false);
    setModalTitle('');
    setModalMessage('');
  }

  const handleItemClick = (nft) => {
    dispatch(actions.setBuyNFT(nft));
    navigate(`/collection/${nft.token_address}/${nft.token_id ? nft.token_id : nft.tokenId}/${nft.author ? nft.author.walletAddr : ''}`);
  };

  async function getFetchItems() {
    if (!params.address) {
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
      await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/payment/all`, {
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

    //get blacklist
    const blacklist = await getBlacklist();

    const collectionAddr = params.address;

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
        // const tokenIdMetadata = await Moralis.Web3API.token.getTokenIdMetadata(options);
        await sleep(1000);
        const result = await Moralis.Web3API.token.getTokenIdOwners(options);

        for (let tokenIdMetadata of result.result) {
          nft.amount = tokenIdMetadata.amount;

          //get author/seller info
          nft.author = await getUserInfo(tokenIdMetadata.owner_of.toLowerCase());
          if (!nft.author) {
            nft.author = {walletAddr: tokenIdMetadata.owner_of.toLowerCase()};
          }

          if (isAuthenticated && account) {
            nft.isOwner = nft.author && nft.author.walletAddr.toLowerCase() === account.toLowerCase();
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
            return nft.token_address.toLowerCase() === s[3].toLowerCase() &&
              parseInt(nft.token_id) === parseInt(s[4]) && 
              s[2].toLowerCase() === (tokenIdMetadata.owner_of ? tokenIdMetadata.owner_of.toLowerCase() : s[2].toLowerCase());
          });

          if (sales.length > 0) {
            // console.log(sales);
            const sale = sales[0];
            //get amounts
            nft.saleAmount = sale[5];
            nft.saleBalance = sale[13];

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
              nft.endTime = endTime;
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
          tempNFT.creator = nft.metadata && nft.metadata.creator ? await getUserInfo(nft.metadata.creator) : null;
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
          if (tempNFT.onAuction) {
          tempNFT.endTime = nft.endTime;
          }
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

          //get favorites
          try {
            const favorites = await getFavoriteCount(tempNFT.token_address, tempNFT.token_id, account ? account : null);
            tempNFT.likes = favorites.count;
            tempNFT.liked = favorites.liked;
          } catch (e) {
            console.log(e);
            tempNFT.likes = 0;
            tempNFT.liked = false;
          }

          //get amounts
          tempNFT.amount = nft.amount;
          tempNFT.saleAmount = nft.saleAmount;
          tempNFT.saleBalance = nft.saleBalance;
          
          //isBlocked
          const bl = blacklist.filter(item =>  {
            return item.collectionAddr.toLowerCase() === nft.token_address.toLowerCase() && 
              parseInt(item.tokenId) === parseInt(nft.token_id);
          });
          if (bl.length > 0) {
            tempNFT.blocked = 1;
          } else {
            tempNFT.blocked = 0;
          }

          newNFTs.push(tempNFT);
        }
      }
      // console.log("newNFTs:", newNFTs);
      // console.log(blacklist);
      
      setItems(newNFTs);
      setLoading(false);
    }).catch((e) => {
      setLoading(false);

      setOpenModal(true);
      setModalTitle('Error');
      setModalMessage('Error occurs while fetching data from backend');
    });
  }

  useEffect(() => {
    setLoading(true);
    getFetchItems();
  }, [account]);

  useEffect(() => {
    if (!params.address) {
      navigate("/");
    }
  }, []);

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
                  <span id="type" className="profile_wallet">Type: {collection.collectionType === 0 ? 'BEP-721' : collection.collectionType === 1 ? 'BEP-1155' : 'Unknown'}</span><br/>
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
            <NftCard
              nft={nft}
              className={"d-flex d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4"}
              handleItemClick={handleItemClick}
              key={index}
              clockTop={clockTop}
            />
          ))}
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