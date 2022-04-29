import React, { memo, useEffect, useState } from 'react';
import { Modal, Spin } from "antd";
import { useMoralisDapp } from "../../providers/MoralisDappProvider/MoralisDappProvider";
import { useChain, useMoralis, useMoralisWeb3Api, useWeb3ExecuteFunction } from "react-moralis";
import axios from "axios";
import BigNumber from "bignumber.js";
import styled from 'styled-components';
import Countdown from 'react-countdown';
import { navigate } from '@reach/router';
import api from "../../core/api";
import { useDispatch } from 'react-redux';
import * as actions from '../../store/actions/thunks';

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

  const [height, setHeight] = useState(0);

  const onImgLoad = ({target:img}) => {
      let currentHeight = height;
      if(currentHeight < img.offsetHeight) {
          setHeight(img.offsetHeight);
      }
  }

  const contractProcessor = useWeb3ExecuteFunction();
  const { account, Moralis } = useMoralis();
  const { chainId } = useChain();
  const Web3Api = useMoralisWeb3Api();
  const { marketAddress, contractABI } = useMoralisDapp();

  const [loading, setLoading] = useState(true);
  
  const [saleNFTs, setSaleNFTs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [clockTop, setClockTop] = useState(true);
  
  const NEW_ITEM_DURATION = 7 * 24 * 3600;
  const defaultAvatar = api.baseUrl + '/uploads/thumbnail_author_4_623046d09c.jpg';
  const fallbackImg = 
    "data:image/png;base64,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";

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

  async function getSalesInfo() {
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
        setSaleNFTs(result);
      },
      onError: (error) => {
        console.log("failed:getSalesInfo", error);
        setSaleNFTs([]);
      },
    });
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

  const handleItemClick = (nft) => {
    dispatch(actions.setBuyNFT(nft));
    navigate('/item-detail');
  };

  useEffect(async () => {
    if (window.web3 === undefined && window.ethereum === undefined)
        return;
    const web3 = await Moralis.enableWeb3();

    getPayments();
    getSalesInfo();
  }, []);

  useEffect(async () => {
    if (saleNFTs && saleNFTs.length > 0) {
      setLoading(true);
      const promises = [];
      
      for (let saleInfo of saleNFTs) {
        //check if sale is new
        const currentTime = Math.floor(new Date().getTime() / 1000);
        if (currentTime - parseInt(saleInfo.startTime) > NEW_ITEM_DURATION) {
          continue;
        }

        try {
          const options = {
            address: saleInfo.sc,
            chain: chainId
          };

          const result = await Moralis.Web3API.token.getAllTokenIds(options);
          
          const temp = result?.result.filter((nft, index) => {
            return parseInt(nft.token_id) === parseInt(saleInfo.tokenId.toString());
          });
          
          if (temp.length > 0) {
            temp[0].saleId = parseInt(saleInfo.saleId._hex);
            temp[0].method = parseInt(saleInfo.method._hex);

            //get seller info
            try {
              await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/user`, {
                headers: {
                  'Content-Type': 'application/json',
                },
                params: {
                  walletAddr: saleInfo.seller.toLowerCase()
                }
              }).then(res => {
                temp[0].author = res.data.user;
              });
            } catch (err) {
              console.log("fetching user error:", err);
              temp[0].author = null;
            }

            //get creator of nft
            temp[0].creator = temp[0].metadata && temp[0].metadata.creator ? await getNFTCreator(temp[0].metadata.creator) : null;

            temp[0].endTime = (temp[0].method === 1) ? parseInt(saleInfo.endTime._hex) : null;
            
            if (temp[0].method === 0) {
              temp[0].onSale = true;
              temp[0].onAuction = false;
              temp[0].onOffer = false;
            } else if (temp[0].method === 1) {
              temp[0].onSale = false;
              temp[0].onAuction = true;
              temp[0].onOffer = false;
            } else if (temp[0].method === 2) {
              temp[0].onSale = false;
              temp[0].onAuction = false;
              temp[0].onOffer = true;
            } else {
              temp[0].onSale = false;
              temp[0].onAuction = false;
              temp[0].onOffer = false;
            }

            const payment = (payments.length >= parseInt(saleInfo.payment._hex) + 1) ? payments[parseInt(saleInfo.payment._hex)] : null;
            
            if (payment) {
              temp[0].price = new BigNumber(saleInfo.basePrice._hex).dividedBy(new BigNumber(10).pow(payment.decimals)).toNumber();
              temp[0].payment = payment;
            }
          }

          promises.push(...temp);
        } catch (e) {
          console.log(e);
        }
      }

      for (let nft of promises) {
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
      }

      console.log("new items:", promises);

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
                    <img onLoad={onImgLoad} src={ nft.metadata.image ? nft.metadata.image : fallbackImg } className="lazy nft__item_preview" alt=""/>
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
                      {(nft.onSale || nft.onOffer) && (
                        <span onClick={() => handleItemClick(nft)}>Buy Now</span>
                      )}
                      {(nft.onAuction) && (
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