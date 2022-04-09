import React, { memo, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import * as actions from '../../store/actions/thunks';
import { clearNfts, clearFilter } from '../../store/actions';
import MyNftCard from './MyNftCard';
import NftMusicCard from './NftMusicCard';
import { Modal, Input, Spin, Button, Tabs, DatePicker } from "antd";
import { useMoralisDapp } from "../../providers/MoralisDappProvider/MoralisDappProvider";
import { useChain, useMoralis, useWeb3ExecuteFunction, useNFTBalances } from "react-moralis";
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
    const [isPageLoading, setIsPageLoading] = useState(true);

    const [errorTitle, setErrorTitle] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [openErrorModal, setOpenErrorModal] = useState(false);

    const listItemFunction = "createSale";
    const [dueDate, setDueDate] = useState(null);
    const [duration, setDuration] = useState(0);
    const [tabKey, setTabKey] = useState("1");
    const { TabPane } = Tabs;

    const [saleNFTs, setSaleNFTs] = useState([]);
    const {account, Moralis} = useMoralis();
    const { chainId } = useChain();
    const fallbackImg = 
      "data:image/png;base64,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";

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

          if (parseInt(ops.params.method) === 0) {
            nft.onSale = true;
            nft.onAuction = false;
            nft.onOffer = false;
          } else if (parseInt(ops.params.method) === 1) {
            nft.onAuction = true;
            nft.onSale = false;
            nft.onOffer = false;
            nft.endTime = Math.floor(new Date().getTime() / 1000 + duration);
          } else {
            nft.onOffer = true;
            nft.onSale = false;
            nft.onAuction = false;
          }
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

    useEffect(async () => {
      if (NFTBalances && NFTBalances.result) {
        for (let nft of NFTBalances.result) {
          if (!nft.metadata) {
            // const options = {
            //   address: nft.token_address,
            //   token_id: nft.token_id,
            //   flag: "uri",
            //   chain: chainId
            // };
            // const result = await Moralis.Web3API.token.reSyncMetadata(options);
            const options1 = {
              address: nft.token_address,
              token_id: nft.token_id,
              chain: chainId
            };
            const tokenIdMetadata = await Moralis.Web3API.token.getTokenIdMetadata(options1);
            if (tokenIdMetadata.token_uri) {
              await fetch((tokenIdMetadata.token_uri))
                .then((response) => response.json())
                .then((data) => {
                  nft.imagePath = data.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
                }).catch(function() {
                  console.log("error: getting uri");
                  nft.imagePath = fallbackImg;
                });
            } else {
              nft.imagePath = fallbackImg;
            }
            // nft.imagePath = fallbackImg;
          } else {
            nft.imagePath = JSON.parse(nft.metadata).image.replace('ipfs://', 'https://ipfs.io/ipfs/');
          }
        }
        setNfts(NFTBalances.result);
        setIsPageLoading(false);
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
            nft.endTime = new BigNumber(sale.endTime._hex).toNumber();
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
            visible={isPageLoading}
            centered
            footer={null}
            closable={false}
          >
            <div className="row">
            <StyledSpin tip="Loading..." size="large" />
            </div>
          </StyledModal>

          {!isPageLoading && nfts && nfts.map( (nft, index) => (
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