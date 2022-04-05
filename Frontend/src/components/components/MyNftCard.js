import React, { memo, useState } from 'react';
import { useDispatch } from 'react-redux';
import * as actions from '../../store/actions/thunks';
import styled from "styled-components";
// import Clock from "./Clock";
import { navigate } from '@reach/router';

import { useMoralis, useWeb3ExecuteFunction } from "react-moralis";
import { useMoralisDapp } from "../../providers/MoralisDappProvider/MoralisDappProvider";
import Countdown from 'react-countdown';
import { Modal, Spin } from "antd";
import BigNumber from 'bignumber.js';

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
      navigateTo('/item-detail');
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

          // remove sale
          if (saleId) {
            if (await removeSale(saleId)) {
              nft.onSale = false;
              nft.onAuction = false;
              nft.onOffer = false;
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

    const removeSale = async (saleId)=> {
      let flag = true;
      const ops = {
        contractAddress: marketAddress,
        functionName: "removeSale",
        abi: contractABI,
        params: {
          saleId: saleId
        },
      };
      
      await contractProcessor.fetch({
        params: ops,
        onSuccess: () => {
          console.log("success:removeSale");
          flag = true;
        },
        onError: (error) => {
          console.log(error);
          flag = false;
        },
      });

      return flag;
    };

    // const handlePlaceBidClick = (nft) => {
    //   alert("place a bid");
    // }

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

    const fallbackImg =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2Ibzx0tc44fYX/16lV6NDFLXH+YL32jwiACRBiEbf5KcXoTIsQSpzXx4N28Ja4BQoK7rgXiydbHjx/P25TaQAJEGAguWy0+2Q8PD6/Ki4R8EVl+bzBOnZY95fq9rj9zAkTI2SxdidBHqG9+skdw43borCXO/ZcJdraPWdv22uIEiLA4q7nvvCug8WTqzQveOH26fodo7g6uFe/a17W3+nFBAkRYENRdb1vkkz1CH9cPsVy/jrhr27PqMYvENYNlHAIesRiBYwRy0V+8iXP8+/fvX11Mr7L7ECueb/r48eMqm7FuI2BGWDEG8cm+7G3NEOfmdcTQw4h9/55lhm7DekRYKQPZF2ArbXTAyu4kDYB2YxUzwg0gi/41ztHnfQG26HbGel/crVrm7tNY+/1btkOEAZ2M05r4FB7r9GbAIdxaZYrHdOsgJ/wCEQY0J74TmOKnbxxT9n3FgGGWWsVdowHtjt9Nnvf7yQM2aZU/TIAIAxrw6dOnAWtZZcoEnBpNuTuObWMEiLAx1HY0ZQJEmHJ3HNvGCBBhY6jtaMoEiJB0Z29vL6ls58vxPcO8/zfrdo5qvKO+d3Fx8Wu8zf1dW4p/cPzLly/dtv9Ts/EbcvGAHhHyfBIhZ6NSiIBTo0LNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg==";
    
    let nftImageUrl = nft.imagePath ? nft.imagePath : fallbackImg;
    let nftName = nft ? nft.name : '';

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

          <div className="nft__item m-0">
          { nft.item_type && nft.item_type === 'single_items' ? (
            <div className='icontype'><i className="fa fa-bookmark"></i></div>   
            ) : (  
            <div className='icontype'><i className="fa fa-shopping-basket"></i></div>
              )
          }
              { nft.endTime && clockTop &&
                  <div className="de_countdown">
                      {/* <Clock deadline={nft.deadline} /> */}
                      <Countdown
                        date={parseInt(nft.endTime) * 1000}
                        // zeroPadTime={2}
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
                          <img onLoad={onImgLoad} src={ nftImageUrl } className="lazy nft__item_preview" alt=""/>
                      </span>
                  </Outer>
              </div>
              { nft.endTime && !clockTop &&
                  // <div className="de_countdown">
                  //     <Clock deadline={nft.deadline} />
                  // </div>
                  <Countdown
                      date={parseInt(nft.endTime) * 1000}
                      // zeroPadTime={2}
                      renderer={renderer}
                  />
              }
              <div className="nft__item_info">
                  <span onClick={() => navigateTo(nft.nft_link ? `${nft.nft_link}/${nft.id}` : '')}>
                      {/* <h4>{nft.title}</h4> */}
                      <h4>{nftName}</h4>
                  </span>
                  { nft.status && nft.status === 'has_offers' ? (
                          <div className="has_offers">
                              <span className='through'>{nft.priceover}</span> {nft.price} ETH
                          </div> 
                      ) : (
                          <div className="nft__item_price">
                              {nft.price} ETH
                              { nft.status === 'on_auction' && 
                                  <span>{nft.bid}/{nft.max_bid}</span>
                              }
                          </div>
                      )
                  }
                  <div className="nft__item_action">
                    { page && page === 'explore' ? (
                    <>
                      {(nft.onSale || nft.onOffer) && (
                        <span onClick={() => handleBuyClick(nft)}>Buy Now</span>
                      )}
                      {(nft.onAuction) && (
                        <span onClick={() => handleBuyClick(nft)}>Place a bid</span>
                      )}
                    </>
                    ) : (
                      (nft.onSale || nft.onOffer || nft.onAuction) ? (
                        <span onClick={() => handleCancelSaleClick(nft)}>Cancel Sale</span>
                      )
                      : (
                        <span onClick={() => handleSellClick(nft)}>Create Sale</span>
                      )
                    )}
                  </div>
                  <div className="nft__item_like">
                      <i className="fa fa-heart"></i><span>{nft.likes ? nft.likes : 0}</span>
                  </div>                            
              </div> 
          </div>
        </div>             
    );
};

export default memo(MyNftCard);