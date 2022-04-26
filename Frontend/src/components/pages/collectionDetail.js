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
import { navigate } from "@reach/router";

import { Spin, Modal } from "antd";
import styled from 'styled-components';
import Countdown from 'react-countdown';

import moment from "moment";
import BigNumber from "bignumber.js";

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

  const { account, Moralis } = useMoralis();
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

  const [height, setHeight] = useState(0);
  const [clockTop, setClockTop] = useState(true);

  const fallbackImg =
    "data:image/png;base64,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";

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

  useEffect(async () => {
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
          chain: chainId,
        };

        //get nfts of items of collection
        const NFTs = await Web3Api.token.getAllTokenIds(options);
        const itemsCount = NFTs.result.length;
        c.itemsCount = itemsCount;
        console.log("nfts:", NFTs);
        setCollection(c);

        //get all saleItems from marketplace
        let saleItems = [];
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
          onSuccess: async (result) => {
            console.log("success");
            saleItems = result;

            console.log("saleItems:", saleItems);

            let newNFTs = [];
            for (let nft of NFTs.result) {
              let metadata = null;
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
                return nft.token_address.toLowerCase() === s.sc.toLowerCase() 
                        && parseInt(nft.token_id) === new BigNumber(s.tokenId._hex).toNumber() 
                        // && s.confirmed === true;
              });

              if (sales.length > 0) {
                const sale = sales[0];

                const method = new BigNumber(sale.method._hex).toNumber();
                const endTime = new BigNumber(sale.endTime._hex).toNumber();
                const currentTime = Math.floor(new Date().getTime() / 1000);
                const payment = payments[new BigNumber(sale.payment._hex).toNumber()];
                const decimals = (payment && payment.decimals != undefined && payment.decimals != null) ? parseInt(payment.decimals) : 18;
                const basePrice = new BigNumber(sale.basePrice._hex).dividedBy(new BigNumber(10).pow(decimals)).toNumber();
                
                metadata.price = basePrice;

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

              newNFTs.push(tempNFT);
            }
            console.log("newNFTs:", newNFTs);
            
            setItems(newNFTs);
            setLoading(false);
          },
          onError: (error) => {
            console.log("failed:", error);

            setLoading(false);

            setOpenModal(true);
            setModalTitle('Error');
            setModalMessage('Error occurs while fetching data from contract');
          },
        });
      }).catch((e) => {
        setLoading(false);

        setOpenModal(true);
        setModalTitle('Error');
        setModalMessage('Error occurs while fetching data from backend');
      });
    }

    if (account) {
      getFetchItems();
      setLoading(true);
    }
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
              style={{backgroundImage: `url(${currentUserState && currentUserState.data && currentUserState.data.banner ? `${process.env.REACT_APP_SERVER_URL}/${currentUserState.data.banner}` : ''})`}}>
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
                  {/* <div className="author_list_pp">
                      <span onClick={()=> navigateTo(nft.author_link ? nft.author_link : '')}>                                    
                          <img className="lazy" src="" alt=""/>
                          <i className="fa fa-check"></i>
                      </span>
                  </div> */}
                  <div className="nft__item_wrap" style={{height: `${height}px`}}>
                    <Outer>
                      <span>
                        <img onLoad={onImgLoad} src={ nft.image } className="lazy nft__item_preview" alt=""/>
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
                          {nft.price} {nft.payment.symbol ? nft.payment.symbol : nft.payment.label}
                        </div>
                      }
                      <div className="nft__item_action">
                        {(nft.onSale || nft.onOffer) && (
                          <span onClick={() => handleItemClick(nft)}>Buy Now</span>
                        )}
                        {(nft.onAuction) && (
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