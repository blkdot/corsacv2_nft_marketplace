import React, { memo, useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import styled from "styled-components";
import Countdown from 'react-countdown';
import { navigate } from '@reach/router';
import { defaultAvatar, fallbackImg, wbnbAddr, mainnetChainID } from './constants';
import { formatAddress, formatUserName, addLike, removeLike } from '../../utils';
import BigNumber from "bignumber.js";

const Outer = styled.div`
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 8px;
`;

const renderer = props => {
  if (props.completed) {
    // Render a completed state
    return <span>Ended</span>;
  } else {
    // Render a countdown
    return <span>{props.formatted.days}d {props.formatted.hours}h {props.formatted.minutes}m {props.formatted.seconds}s</span>;
  }
};

//react functional component
const NftCard = ({ nft, className = 'd-flex d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4', clockTop = true, handleItemClick }) => {
  const { account, Moralis, isInitialized } = useMoralis();
  const [height, setHeight] = useState(210);

  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [usdPrice, setUsdPrice] = useState(0);
  
  const onImgLoad = (e) => {
    let currentHeight = height;
    if(currentHeight < e.target.offsetHeight) {
        setHeight(e.target.offsetHeight);
    }
  }

  const handleFavorite = async (nft) => {
    if (account && nft.author && (account.toLowerCase() !== nft.author.walletAddr.toLowerCase())) {
      if (liked) {
        //will unlike
        await removeLike(
          account.toLowerCase(), 
          nft.token_address.toLowerCase(), 
          (nft.token_id ? nft.token_id : nft.tokenId)
        ).then((res) => {
          setLikes(--nft.likes);
          setLiked(false);
        });
      } else {
        //will like
        await addLike(
          account.toLowerCase(), 
          nft.token_address.toLowerCase(), 
          (nft.token_id ? nft.token_id : nft.tokenId)
        ).then((res) => {
          setLikes(++nft.likes);
          setLiked(true);
        });
      }
    }
  }

  useEffect(() => {
    async function getBaseData(nft) {
      setLikes(nft.likes);
      setLiked(nft.liked);

      if (!isInitialized || !Moralis.Web3API) {
        const APP_ID = process.env.REACT_APP_MORALIS_APPLICATION_ID;
        const SERVER_URL = process.env.REACT_APP_MORALIS_SERVER_URL;

        Moralis.start({
          serverUrl: SERVER_URL,
          appId: APP_ID
        });
      }

      let options = {
        address: wbnbAddr,
        chain: mainnetChainID,
        exchange: 'pancakeswap-v2'
      };
      const wbnb = await Moralis.Web3API.token.getTokenPrice(options);

      let usd = 0;
                      
      if (nft.payment) {
        if (nft.payment.addr) {
          options = {
            address: nft.payment.addr,
            chain: mainnetChainID,
            exchange: 'pancakeswap-v2'
          };

          try {
            const erc20Token = await Moralis.Web3API.token.getTokenPrice(options);
            usd = (parseFloat(nft.price) * parseFloat(erc20Token.usdPrice)).toFixed(3);
          } catch(e) {
            usd = 0;
          }
        } else {
          usd = (parseFloat(nft.price) * parseFloat(wbnb.usdPrice)).toFixed(3);
        }
      } else {
        usd = 0;
      }

      setUsdPrice(usd);
    }
    
    if (nft) {
      getBaseData(nft);
    }
  }, [nft])

  return (
    <div className={className}>
      <div className="nft__item m-0">
        { nft.item_type && nft.item_type === 'single_items' ? (
          <div className='icontype'><i className="fa fa-bookmark"></i></div>   
          ) : (  
          <div className='icontype'><i className="fa fa-shopping-basket"></i></div>
            )
        }
        { nft.endTime && nft.endTime > 0 && clockTop &&
          <div className="de_countdown">
            <Countdown
              date={parseInt(nft.endTime) * 1000}
              renderer={renderer}
            />
          </div>
        }
          <div className="author_list_pp">
            {/* <span onClick={()=> navigate('/author/' + (nft.seller ? nft.seller.walletAddress : ''))}> */}
            <span onClick={() => navigate(`/author/${nft.author.walletAddr.toLowerCase()}`)}>
              <img className="lazy" 
                  src={nft.author && nft.author.avatar ? nft.author.avatar : defaultAvatar} 
                  title={nft.author && nft.author.name ? formatUserName(nft.author.name) : formatAddress(nft.author.walletAddr, 'wallet')} 
                  alt={nft.author && nft.author.name ? formatUserName(nft.author.name) : formatAddress(nft.author.walletAddr, 'wallet')} 
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
          { nft.endTime && nft.endTime > 0 && !clockTop &&
            <div className="de_countdown mt-4 mb-4">
              <Countdown
                date={parseInt(nft.endTime) * 1000}
                renderer={renderer}
              />
            </div>
          }
          <div className="nft__item_info">
            <span onClick={() => handleItemClick(nft)}>
              <h4>{nft.metadata && nft.metadata.collection ? nft.metadata.collection.title : nft.name} #{nft.token_id}</h4>
              <h4 className="text-muted">{nft.metadata.name ? nft.metadata.name : nft.name}</h4>
            </span>
              { (nft.onSale || nft.onOffer || nft.onAuction) && 
                  <div className="nft__item_price">
                    {nft.price} {nft.payment ? nft.payment.symbol : 'Unknown'} (${usdPrice})
                    <span>{nft.saleBalance} of {nft.saleAmount}</span>
                    {/* { nft.onAuction && 
                        <span>{nft.bid}/{nft.max_bid}</span>
                    } */}
                  </div>
              }
              { nft.amount && 
                <div className="nft__item_price">
                  Amount:<span>{nft.amount}</span>
                </div>
              }
              { nft.blocked === 1 && 
                <div className="nft__item_price">
                  Status:<span>Blocked</span>
                </div>
              }

              { nft.blocked !== 1 ? (
                <>
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
                  <div className="nft__item_like" onClick={() => handleFavorite(nft)}>
                    <i className="fa fa-heart" style={liked ? {color: '#FF3F34'} : {}} title={liked ? 'UnFavorate' : 'Favorite'}></i>
                    <span>{likes ? likes : 0}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="nft__item_action">
                    <span onClick={() => handleItemClick(nft)}>View Item</span>
                  </div>
                  <div className="nft__item_like">
                    <i className="fa fa-heart" style={liked ? {color: '#FF3F34'} : {}} title={liked ? 'UnFavorate' : 'Favorite'}></i>
                    <span>{likes ? likes : 0}</span>
                  </div>
                </>
              )}
          </div> 
      </div>
    </div>
  );
};

export default memo(NftCard);
