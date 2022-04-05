import React, { memo, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import * as actions from '../../store/actions/thunks';
import { clearNfts, clearFilter } from '../../store/actions';
import MyNftCard from './MyNftCard';
import NftMusicCard from './NftMusicCard';
import { Modal, Input, Spin, Button, Tabs, DatePicker } from "antd";
import { useMoralisDapp } from "../../providers/MoralisDappProvider/MoralisDappProvider";
import { useMoralis, useWeb3ExecuteFunction, useNFTBalances } from "react-moralis";
import BigNumber from "bignumber.js";
import styled from 'styled-components';

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

//react functional component
const MyNFTBalance = ({ showLoadMore = true, shuffle = false, authorId = null }) => {
    const mt100 = { marginTop: "100px" };
        
    const dispatch = useDispatch();
    const {data: NFTBalances, isLoading} = useNFTBalances();
    const [nfts, setNfts] = useState([]);

    const [height, setHeight] = useState(0);

    const onImgLoad = ({target:img}) => {
        let currentHeight = height;
        if(currentHeight < img.offsetHeight) {
            setHeight(img.offsetHeight);
        }
    }

    const contractProcessor = useWeb3ExecuteFunction();
    const {marketAddress, contractABI} = useMoralisDapp();
    const [visible1, setVisibility1] = useState(false);
    const [visible2, setVisibility2] = useState(false);
    const [nftToSend, setNftToSend] = useState(null);
    const [price, setPrice] = useState(0);
    const [loading, setLoading] = useState(false);

    const [errorTitle, setErrorTitle] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [openErrorModal, setOpenErrorModal] = useState(false);

    const listItemFunction = "createSale";
    const [dueDate, setDueDate] = useState(null);
    const [duration, setDuration] = useState(0);
    const [tabKey, setTabKey] = useState("1");
    const { TabPane } = Tabs;

    const [saleNFTs, setSaleNFTs] = useState([]);
    const {account} = useMoralis();

    function onChangeDueDate(date, dateString) {
      setDueDate(date);
      let from = Math.floor(new Date().getTime() / 1000);
      let to = Math.floor(date._d.getTime() / 1000);
      setDuration(to - from);
    }
  
    function tabCallback(key) {
      setTabKey(key);
    }

    async function list(nft) {
      console.log(duration);
      setLoading(true);
      const p = price * ("1e" + 9);
      const ops = {
        contractAddress: marketAddress,
        functionName: listItemFunction,
        abi: contractABI,
        params: {
          sc: nft.token_address,
          tokenId: parseInt(nft.token_id),
          payment: 1,
          copy: 1,
          method: parseInt(tabKey) - 1,
          duration: duration,
          basePrice: String(p),
          feeRatio: 0,
          royaltyRatio: 0,
          isOther: 1
        },
      };
      
      await contractProcessor.fetch({
        params: ops,
        onSuccess: () => {
          console.log("success");
          setLoading(false);
          setVisibility2(false);
          // addItemImage();
          succList();
          nft.onSale = true;
        },
        onError: (error) => {
          console.log(error);
          setLoading(false);
          failList();
        },
      });
    }

    function succList() {
      let secondsToGo = 5;
      
      setErrorTitle(`Success`);
      setErrorMsg(`Your NFT was listed on the marketplace`);
      setOpenErrorModal(true);
      
      setTimeout(() => {
        setOpenErrorModal(false);
      }, secondsToGo * 1000);
    }

    function failList() {
      let secondsToGo = 5;
      
      setErrorTitle(`Error`);
      setErrorMsg(`There was a problem listing your NFT`);
      setOpenErrorModal(true);
      
      setTimeout(() => {
        setOpenErrorModal(false);
      }, secondsToGo * 1000);
    }

    async function approveAll(nft) {
      setLoading(true);
      const ops = {
        contractAddress: nft.token_address,
        functionName: "setApprovalForAll",
        abi: [{
          "inputs": [
            {"internalType": "address", "name": "operator", "type": "address"}, 
            {"internalType": "bool", "name": "approved", "type": "bool"}
          ], 
          "name": "setApprovalForAll", 
          "outputs": [], 
          "stateMutability": "nonpayable", 
          "type": "function"
        }],
        params: {
          operator: marketAddress,
          approved: true
        },
      };
  
      await contractProcessor.fetch({
        params: ops,
        onSuccess: () => {
          console.log("Approval Received");
          setLoading(false);
          setVisibility1(false);
          succApprove();
        },
        onError: (error) => {
          setLoading(false);
          failApprove();
        },
      });
    }

    function succApprove() {
      let secondsToGo = 5;
      
      setErrorTitle(`Success`);
      setErrorMsg(`Approval is now set, you may list your NFT`);
      setOpenErrorModal(true);
      
      setTimeout(() => {
        setOpenErrorModal(false);
      }, secondsToGo * 1000);
    }
  
    function failApprove() {
      let secondsToGo = 5;
      
      setErrorTitle(`Error`);
      setErrorMsg(`There was a problem with setting approval`);
      setOpenErrorModal(true);
      
      setTimeout(() => {
        setOpenErrorModal(false);
      }, secondsToGo * 1000);
    }

    function closeCreateSaleModal() {
      setVisibility2(false);
      setLoading(false);
    }

    useEffect(() => {
      if (NFTBalances && NFTBalances.result) {
        setNfts(NFTBalances.result);
      }
    }, [NFTBalances]);

    useEffect(() => {
      async function getSalesOf(seller) {
        const ops = {
          contractAddress: marketAddress,
          functionName: 'getSaleInfo',
          abi: contractABI,
          params: {
            startIdx: 0,
            count: 100000
          },
        };
        await contractProcessor.fetch({
          params: ops,
          onSuccess: (result) => {
            let nftsArray = [];
            result.map((salesInfo, index) => {
              if (salesInfo.seller.toLowerCase() === seller.toLowerCase()) {
                const temp = nfts.filter((nft, idx) => {
                  return (nft.token_address.toLowerCase() === salesInfo.sc.toLowerCase() && 
                      nft.token_id === salesInfo.tokenId.toString());
                });
                if (temp !== []) {
                  nftsArray.push(salesInfo);
                }
              }
            });
            
            setSaleNFTs(nftsArray);
          },
          onError: (error) => {
            console.log("failed:", error);
            setSaleNFTs([]);
          },
        });
      }
      getSalesOf(account);
    }, [nfts]);

    useEffect(() => {
      nfts.map((nft, index) => {
        const sale = saleNFTs.find(e => e.sc.toLowerCase() === nft.token_address.toLowerCase() && new BigNumber(e.tokenId._hex).toNumber() === parseInt(nft.token_id));
        
        if (sale !== undefined) {
          const method = new BigNumber(sale.method._hex).toNumber();
          if (method === 0x00) {
            nft.onAuction = false;
            nft.onSale = true;
            nft.onOffer = false;
          } else if (method === 0x01) {
            nft.onAuction = true;
            nft.onSale = false;
            nft.onOffer = false;
          } else {
            nft.onAuction = false;
            nft.onSale = false;
            nft.onOffer = true;
          }
        } else {
          nft.onAuction = false;
          nft.onSale = false;
          nft.onOffer = false;
        }
      });
    }, [saleNFTs]);
    
    //will run when component unmounted
    useEffect(() => {
        return () => {
            dispatch(clearFilter());
            dispatch(clearNfts());
        }
    },[dispatch]);

    const loadMore = () => {
        dispatch(actions.fetchNftBalancesBreakdown(authorId));
    }

    return (
        <div className='row'>
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

          {!isLoading && nfts && nfts.map( (nft, index) => (
              nft.category === 'music' ?
              <NftMusicCard nft={nft} audioUrl={nft.audio_url} key={index} onImgLoad={onImgLoad} height={height} />
              :
              <MyNftCard 
                nft={nft} 
                key={`${nft.symbol}_${nft.token_id}`}
                onImgLoad={onImgLoad} 
                height={height} 
                setNftToSend={setNftToSend}
                setVisibility1={setVisibility1}
                setVisibility2={setVisibility2}
              />
          ))}
          { showLoadMore && nfts.length <= 20 &&
            <div className='col-lg-12'>
                <div className="spacer-single"></div>
                <span onClick={loadMore} className="btn-main lead m-auto">Load More</span>
            </div>
          }
          { visible1 && 
					<div className='checkout'>
						<div className='maincheckout' style={mt100}>
							<button className='btn-close' onClick={() => setVisibility1(false)}>x</button>
							<div className='heading'>
									<h3>Approve to list NFT in the market</h3>
							</div>
							<StyledSpin spinning={loading} tip="Approving">
                <img
                  src={`${nftToSend?.image}`}
                  style={{
                    width: "250px",
                    margin: "auto",
                    borderRadius: "10px",
                    marginBottom: "15px",
                  }}
                  alt=""
                />
              </StyledSpin>
							<div className="d-flex flex-row mt-5">
                <button className='btn-main btn2' onClick={() => setVisibility1(false)}>Cancel</button>
                <button className='btn-main' onClick={() => approveAll(nftToSend)}>Approve</button>
              </div>
						</div>
					</div>
				  }
          { visible2 && 
					<div className='checkout'>
						<div className='maincheckout' style={mt100}>
							<button className='btn-close' onClick={() => closeCreateSaleModal()}>x</button>
							<div className='heading'>
									<h3>{`List ${nftToSend?.name} #${nftToSend?.token_id} For Sale`}</h3>
							</div>
							<StyledSpin spinning={loading} tip="Creating Sale">
                <img
                  src={`${nftToSend?.image}`}
                  style={{
                    width: "250px",
                    margin: "auto",
                    borderRadius: "10px",
                    marginBottom: "15px",
                  }}
                  alt=""
                />
                <Tabs defaultActiveKey={tabKey} onChange={tabCallback}>
                  <TabPane tab="Fixed price" key="1">
                    <Input
                      autoFocus
                      placeholder="Amount"
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </TabPane>
                  <TabPane tab="Timed Auction" key="2">
                    <Input
                      autoFocus
                      placeholder="Amount"
                      onChange={(e) => setPrice(e.target.value)}
                      style={{marginBottom: "16px"
                    }}
                    />
                    <DatePicker onChange={onChangeDueDate} value={dueDate}/>
                  </TabPane>
                </Tabs>
              </StyledSpin>
							<div className="d-flex flex-row mt-5">
                <button className='btn-main btn2' onClick={() => closeCreateSaleModal()}>Cancel</button>
                <button className='btn-main' onClick={() => list(nftToSend)}>List</button>
              </div>
						</div>
					</div>
				  }
          { openErrorModal && 
					<div className='checkout'>
						<div className='maincheckout' style={mt100}>
							<button className='btn-close' onClick={() => setOpenErrorModal(false)}>x</button>
							<div className='heading'>
									<h3>{errorTitle}</h3>
							</div>
							<p>{errorMsg}</p>
							<div className="d-flex flex-row mt-5">
                <button className='btn-main btn2' onClick={() => setOpenErrorModal(false)}>Close</button>
              </div>
						</div>
					</div>
				  }
        </div>              
    );
};

export default memo(MyNFTBalance);