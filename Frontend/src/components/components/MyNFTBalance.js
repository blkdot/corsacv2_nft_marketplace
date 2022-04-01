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

//react functional component
const MyNFTBalance = ({ showLoadMore = true, shuffle = false, authorId = null }) => {

    const dispatch = useDispatch();
    const {data: NFTBalances} = useNFTBalances();
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
      const modal = Modal.success({
        title: "Success!",
        content: `Your NFT was listed on the marketplace`,
      });
      setTimeout(() => {
        modal.destroy();
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
      const modal = Modal.success({
        title: "Success!",
        content: `Approval is now set, you may list your NFT`,
      });
      setTimeout(() => {
        modal.destroy();
      }, secondsToGo * 1000);
    }
  
    function failList() {
      let secondsToGo = 5;
      const modal = Modal.error({
        title: "Error!",
        content: `There was a problem listing your NFT`,
      });
      setTimeout(() => {
        modal.destroy();
      }, secondsToGo * 1000);
    }
  
    function failApprove() {
      let secondsToGo = 5;
      const modal = Modal.error({
        title: "Error!",
        content: `There was a problem with setting approval`,
      });
      setTimeout(() => {
        modal.destroy();
      }, secondsToGo * 1000);
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
          if (sale.method._hex === 0x00) {
            nft.onAuction = false;
            nft.onSale = true;
            nft.onOffer = false;
          } else if (sale.method._hex === 0x01) {
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
            {nfts && nfts.map( (nft, index) => (
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
            <Modal
              key="1"
              title='Approve to list NFT in the market'
              visible={visible1}
              onCancel={() => setVisibility1(false)}
              onOk={() => () => approveAll(nftToSend)}
              okText="List"
              footer={[
                <Button onClick={() => setVisibility1(false)} key="1">
                  Cancel
                </Button>,
                <Button onClick={() => approveAll(nftToSend)} type="primary" key="2">
                  Approve
                </Button>
              ]}
            >
              <Spin spinning={loading}>
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
              </Spin>
            </Modal>
            <Modal
              key="2"
              title={`List ${nftToSend?.name} #${nftToSend?.token_id} For Sale`}
              visible={visible2}
              onCancel={() => setVisibility2(false)}
              onOk={() => list(nftToSend)}
              okText="List"
              footer={[
                <Button onClick={() => setVisibility2(false)} key="1">
                  Cancel
                </Button>,
                <Button onClick={() => list(nftToSend)} type="primary" key="2">
                  List
                </Button>
              ]}
            >
              <Spin spinning={loading}>
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
                {/* <Input
                  autoFocus
                  placeholder="Listing Price in the Market"
                  onChange={(e) => setPrice(e.target.value)}
                /> */}
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
              </Spin>
            </Modal>
        </div>              
    );
};

export default memo(MyNFTBalance);