import React, { memo, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../store/actions/thunks';
import styled from "styled-components";
// import Clock from "./Clock";
import { navigate } from '@reach/router';

import { useMoralis, useWeb3ExecuteFunction } from "react-moralis";
import { useMoralisDapp } from "../../providers/MoralisDappProvider/MoralisDappProvider";
import Countdown from 'react-countdown';
import { Modal, Spin } from "antd";
import BigNumber from 'bignumber.js';
import api from "../../core/api";
import axios from 'axios';
import * as selectors from '../../store/selectors';
import { defaultAvatar, fallbackImg } from '../components/constants';
import { formatAddress, formatUserName } from '../../utils';

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
  // console.log(props);
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
const MyNftCard = ({ 
                  nft, 
                  className = 'd-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4', 
                  clockTop = true, 
                  height, 
                  onImgLoad,
                  setNftToSend,
                  setVisibility1,
                  setVisibility2,
                  page = ''
                 }) => {
    const currentUserState = useSelector(selectors.currentUserState);
    
    const { account } = useMoralis();
    
    const dispatch = useDispatch();

    const { contractABI, marketAddress } = useMoralisDapp();
    const contractProcessor = useWeb3ExecuteFunction();

    const navigateTo = (link) => {
        navigate(link);
    }

    const [isLoading, setIsLoading] = useState(false);

    const handleSellClick = async (nft) => {
      setIsLoading(true);
      setNftToSend(nft);
            
      let flag = await isApprovedForAll(nft);
      
      setIsLoading(false);
      if (flag) setVisibility2(true);
      else setVisibility1(true);
    };

    const handleBuyClick = (nft) => {
      dispatch(actions.setBuyNFT(nft));
      navigateTo(`/collection/${nft.token_address}/${nft.token_id ? nft.token_id : nft.tokenId}`);
    };

    const handleCancelSaleClick = async (nft) => {
      setIsLoading(true);
      
      let saleCount = 0;
      let saleId = null;

      let ops = {
        contractAddress: marketAddress,
        functionName: "saleCount",
        abi: contractABI,
        params: {},
      };
      
      await contractProcessor.fetch({
        params: ops,
        onSuccess: (result) => {
          saleCount = new BigNumber(result._hex).toNumber();
        },
        onError: (error) => {
          console.log(error);
          setIsLoading(false);
        },
      });

      ops = {
        contractAddress: marketAddress,
        functionName: "getSaleInfo",
        abi: contractABI,
        params: {
          startIdx: 0,
          count: saleCount
        },
      };
      
      await contractProcessor.fetch({
        params: ops,
        onSuccess: async (result) => {
          // get saleId from sale list
          for (let sale of result) {
            const tokenId = new BigNumber(sale.tokenId._hex).toNumber();
            const tokenAddress = sale.sc.toLowerCase();

            if (parseInt(nft.token_id) === tokenId && 
                nft.token_address.toLowerCase() === tokenAddress) {
              saleId = new BigNumber(sale.saleId._hex).toNumber();
              break;
            }
          }

          // cancel sale
          if (saleId !== null && saleId !== undefined) {
            let callFunctionName = '';
            
            if (nft.onAuction) {
              callFunctionName = 'cancelAuction';
            } else if (nft.onSale || nft.onOffer) {
              callFunctionName = 'removeSale';
            } else {
              callFunctionName = '';
            }
            
            if (callFunctionName !== '') {
              if (await cancelSale(saleId, callFunctionName)) {
                //save activity
                try {
                  const itemName = (nft.metadata && nft.metadata.name) ? nft.metadata.name : nft.name;
                  const description = currentUserState.data.name + ": cancelled " + ((nft.onSale) ? "sale" : (nft.onAuction) ? "auction" : (nft.onOffer) ? "offer" : "unknown") + " - " + itemName;
            
                  const res = await axios.post(
                    `${process.env.REACT_APP_SERVER_URL}/api/activity/save`, 
                    {
                      'actor': account.toLowerCase(),
                      'actionType': (nft.onSale) ? 9 : (nft.onAuction) ? 10 : (nft.onOffer) ? 11 : 99,
                      'description': description,
                      'from': '',
                      'collectionAddr': nft.token_address.toLowerCase(),
                      'tokenId': nft.token_id
                    },
                    {
                      headers: {
                        'Content-Type': 'application/json',
                      }
                    }
                  );
                } catch(ex) {
                  console.log(ex);
                }

                nft.onSale = false;
                nft.onAuction = false;
                nft.onOffer = false;
                nft.price = null;
                nft.payment = null;
                nft.endTime = null;
              }
            }
          }
          setIsLoading(false);
        },
        onError: (error) => {
          console.log(error);
          setIsLoading(false);
        },
      });
    };

    async function cancelSale(saleId, cfn) {
      let flag = true;
      const ops = {
        contractAddress: marketAddress,
        functionName: cfn,
        abi: contractABI,
        params: {
          saleId: saleId
        },
      };
      
      await contractProcessor.fetch({
        params: ops,
        onSuccess: () => {
          console.log("success:cancelSale");
          flag = true;
        },
        onError: (error) => {
          console.log(error);
          flag = false;
        },
      });

      return flag;
    };

    async function isApprovedForAll(nft) {
      const ops = {
        contractAddress: nft.token_address,
        functionName: "isApprovedForAll",
        abi: [{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}],
        params: {
          owner: account,
          operator: marketAddress
        },
      };
      let flag = false;
      await contractProcessor.fetch({
        params: ops,
        onSuccess: (result) => {
          // setApproved(result);
          flag = result;
        },
        onError: (error) => {
          // setApproved(false);
          flag = false;
        },
      });
      return flag;
    }
        
    return (
        <div className={className}>
          <StyledModal
            key="100"
            title=''
            visible={isLoading}
            centered
            footer={null}
            closable={false}
          >
            <div className="row">
              <StyledSpin tip="Loading..." size="large" />
            </div>
          </StyledModal>

          { nft &&
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
                <span onClick={()=> navigateTo(nft.author && nft.author.walletAddr ? "/author/" + nft.author.walletAddr : '')}>
                  <img className="lazy" 
                      src={nft.author && nft.author.avatar ? nft.author.avatar : defaultAvatar} 
                      title={nft.author && nft.author.name ? formatUserName(nft.author.name) : formatAddress(nft.author.walletAddr, 'wallet')}
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
                <span onClick={() => handleBuyClick(nft)}>
                  <h4>{nft.metadata && nft.metadata.name ? nft.metadata.name : nft.name}</h4>
                </span>
                
                { (nft.onSale || nft.onAuction || nft.onOffer) && 
                <div className="nft__item_price">
                  {nft.price} {nft.payment && nft.payment.symbol ? nft.payment.symbol : 'Unknown'}
                </div>
                }
                <div className="nft__item_action">
                  { page && page === 'explore' ? (
                  <>
                    {nft.isOwner && (
                      <span onClick={() => handleBuyClick(nft)}>Cancel {nft.onSale ? 'Sale' : nft.onAuction ? 'Auction' : nft.onOffer ? 'Offer' : 'Sale'}</span>
                    )}
                    {!nft.isOwner && (nft.onSale || nft.onOffer) && (
                      <span onClick={() => handleBuyClick(nft)}>Buy Now</span>
                    )}
                    {!nft.isOwner && (nft.onAuction) && (
                      <span onClick={() => handleBuyClick(nft)}>Place a bid</span>
                    )}
                  </>
                  ) : (
                    (nft.onSale || nft.onOffer || nft.onAuction) ? (
                      <>
                      <span onClick={() => handleCancelSaleClick(nft)}>
                        Cancel {nft.onSale ? 'Sale' : (nft.onOffer ? 'Offer' : 'Auction')}
                      </span><br/>
                      <span onClick={() => navigate(`/collection/${nft.token_address}/${nft.token_id ? nft.token_id : nft.tokenId}`)}>View Item</span>
                      </>
                    )
                    : (
                      <>
                      <span onClick={() => handleSellClick(nft)}>Create Sale</span><br/>
                      <span onClick={() => navigate(`/collection/${nft.token_address}/${nft.token_id ? nft.token_id : nft.tokenId}`)}>View Item</span>
                      </>
                    )
                  )}
                </div>
                  <div className="nft__item_like">
                      <i className="fa fa-heart"></i><span>{nft.likes ? nft.likes : 0}</span>
                  </div>                            
              </div> 
          </div>
          }
        </div>             
    );
};

export default memo(MyNftCard);