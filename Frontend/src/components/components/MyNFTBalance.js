import React, { memo, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../store/actions/thunks';
import { clearNfts, clearFilter } from '../../store/actions';
import MyNftCard from './MyNftCard';
import NftMusicCard from './NftMusicCard';
import { Modal, Input, Select, Option, Spin, Button, Tabs, DatePicker } from "antd";
import { useMoralisDapp } from "../../providers/MoralisDappProvider/MoralisDappProvider";
import { useChain, useMoralis, useMoralisWeb3Api, useWeb3ExecuteFunction, useNFTBalances } from "react-moralis";
import axios from "axios";
import BigNumber from "bignumber.js";
import styled from 'styled-components';
import * as selectors from '../../store/selectors';
import { navigate } from '@reach/router';
import { getFileTypeFromURL } from '../../utils';

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
const CreateSaleModal = styled(Modal)`
  .ant-modal-title {
    font-weight: 600;
  }
  .ant-modal-content {
    border-radius: 8px;
  }
  .ant-modal-header {
    border-radius: 8px 8px 0 0;
  }
  .ant-modal-footer {
    border-radius: 0 0 8px 8px;
    padding-bottom: 16px;
  }
  .ant-btn {
    font-size: 16px;
    font-weight: 800;
    border-radius: 4px;
  }
`

//react functional component
const MyNFTBalance = ({ showLoadMore = true, shuffle = false, authorId = null }) => {
    const mt100 = { marginTop: "100px" };

    const { Option } = Select;

    const currentUserState = useSelector(selectors.currentUserState);
    const {getNFTBalances, data: NFTBalances, isLoading} = useNFTBalances();
    const [nfts, setNfts] = useState([]);
    const [myNfts, setMyNfts] = useState([]);

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
    const [payments, setPayments] = useState([]);
    const [salePayment, setSalePayment] = useState(0);
    const [auctionPayment, setAuctionPayment] = useState(0);
       
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

      if (parseInt(tabKey) - 1 === 1) {
        if (duration < 1) {
          setLoading(false);
          setErrorTitle('Error');
          setErrorMsg('Please enter auction end datetime!');
          setOpenErrorModal(true);
          return;
        }
      }

      const method = parseInt(tabKey) - 1;
      let payment = null;
      if (method == 0) {
        payment = salePayment;
      } else if (method == 1) {
        payment = auctionPayment;
      } else {
        payment = 0;
      }

      const p = price * ("1e" + payments[payment].decimals);
      
      const ops = {
        contractAddress: marketAddress,
        functionName: listItemFunction,
        abi: contractABI,
        params: {
          sc: nft.token_address,
          tokenId: parseInt(nft.token_id),
          payment: payment,
          copy: 1,
          method: method,
          duration: duration,
          basePrice: String(p),
          feeRatio: 0,
          royaltyRatio: 0,
          isOther: 1
        },
      };
      
      await contractProcessor.fetch({
        params: ops,
        onSuccess: async (result) => {
          await result.wait();
          
          console.log("success");
          setLoading(false);
          setVisibility2(false);
          // addItemImage();
          succList();

          //save activity
          try {
            const itemName = (nft.metadata && nft.metadata.name) ? nft.metadata.name : nft.name;
            const description = currentUserState.data.name + ": created " + ((method === 0) ? "sale" : (method === 1) ? "auction" : (method === 2) ? "offer" : "unknown") + " - " + itemName;
            
            const res = await axios.post(
              `${process.env.REACT_APP_SERVER_URL}/api/activity/save`, 
              {
                'actor': account.toLowerCase(),
                'actionType': (method === 0) ? 3 : (method === 1) ? 4 : (method === 2) ? 5 : 99,
                'description': description,
                'from': '',
                'collectionAddr': nft.token_address.toLowerCase(),
                'tokenId': parseInt(nft.token_id)
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

          // const options = {
          //   chain: chainId,
          //   address: account
          // };
          
          // const balances = await Web3Api.account.getTokenBalances(options);
          // const token = balances.filter((t, index) => {
          //   return t.token_address.toLowerCase() == corsacTokenAddress.toLowerCase();
          // });

          if (payments.length >= payment + 1) {
            nft.price = new BigNumber(ops.params.basePrice).dividedBy(new BigNumber(10).pow(payments[payment].decimals)).toNumber();
            nft.payment = payments[payment];
          }

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

    useEffect(async () => {
      const isWeb3Active = Moralis.ensureWeb3IsInstalled();
      if (!isWeb3Active) {
        await Moralis.enableWeb3();
      }
      
      getPayments();
    }, []);

    useEffect(() => {
      if (isLoading) {
        setIsPageLoading(true);
      }
    }, [isLoading]);

    useEffect(async () => {
      let collections = [];

      //get collections from contract
      // const ops = {
      //   contractAddress: marketAddress,
      //   functionName: "getCollections",
      //   abi: contractABI,
      //   params: {}
      // };
      // await contractProcessor.fetch({
      //   params: ops,
      //   onSuccess: (chainCollections) => {
      //     collections = chainCollections;
      //   },
      //   onError: (error) => {
      //     console.log("failed:", error);
      //   },
      // });
      
      //get collections from backend
      await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/collection/all`, {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {}
      }).then(async res => {
        for (let c of res.data.collections) {
          collections.push(c.collectionAddr);
        }
      }).catch((error) => {
        console.log("failed:getAllCollection");
      });

      if (NFTBalances && NFTBalances.result) {
        // console.log(NFTBalances.result);
        
        let myNFTs = [];
        for (let nft of NFTBalances.result) {
          let cs = collections.filter((c, index) => {
            return c.toLowerCase() === nft.token_address;
          });
          if (cs.length === 0) {
            continue;
          }
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
            // console.log('TokenIdMetadata:', tokenIdMetadata);
            if (tokenIdMetadata.token_uri) {
              await fetch((tokenIdMetadata.token_uri))
                .then((response) => response.json())
                .then((data) => {
                  nft.image = data.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
                  nft.metadata = data;
                }).catch(function() {
                  console.log("error: getting uri");
                  nft.image = fallbackImg;
                });
            } else {
              nft.image = fallbackImg;
            }
            // nft.image = fallbackImg;
          } else {
            if (!nft.image) {
              nft.image = JSON.parse(JSON.stringify(nft.metadata)).image.replace('ipfs://', 'https://ipfs.io/ipfs/');
            }
          }

          //get author/seller info
          try {
            await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/user`, {
              headers: {
                'Content-Type': 'application/json',
              },
              params: {
                walletAddr: nft.owner_of.toLowerCase()
              }
            }).then(res => {
              nft.author = res.data.user;
            });
          } catch (err) {
            console.log("fetching user error:", err);
            nft.author = null;
          }

          //get creator of nft
          nft.creator = nft.metadata && nft.metadata.creator ? await getNFTCreator(nft.metadata.creator) : null;

          myNFTs.push(nft);
        }
        setNfts(myNFTs);
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
            for (let salesInfo of result) {
              if (salesInfo.seller.toLowerCase() === seller.toLowerCase()) {
                const temp = nfts.filter((nft, idx) => {
                  return (nft.token_address.toLowerCase() === salesInfo.sc.toLowerCase() && 
                      nft.token_id === salesInfo.tokenId.toString());
                });
                if (temp !== []) {
                  nftsArray.push(salesInfo);
                }
              }
            }

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

    useEffect(async () => {
      if (nfts.length > 0) {
        for (let nft of nfts) {
          const sale = saleNFTs.find(e => e.sc.toLowerCase() === nft.token_address.toLowerCase() && new BigNumber(e.tokenId._hex).toNumber() === parseInt(nft.token_id));
          
          if (sale !== undefined) {
            //get price by payment
            if (payments.length >= parseInt(sale.payment) + 1) {
              const payment = payments[parseInt(sale.payment)];
              nft.price = new BigNumber(sale.basePrice._hex).dividedBy(new BigNumber(10).pow(payment.decimals)).toNumber();
              nft.payment = payment;
            }
            
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

          let file = null;
          if (nft.image) {
            file = await getFileTypeFromURL(nft.image);
          } else if (nft.metadata && nft.metadata.image) {
            file = await getFileTypeFromURL(nft.metadata.image);
          } else {
            file = {mimeType: 'image', fileType: 'image'};
          }
          nft.item_type = file.fileType;
          nft.mime_type = file.mimeType;
        }
        setIsPageLoading(false);
      } else {
        setIsPageLoading(false);
      }
      
      setMyNfts(nfts);
    }, [saleNFTs, saleNFTs.length]);

    const updateNFTs = (newNFT, index) => {
      console.log("calling updateNFTs:", newNFT, index);
      const tempNFTs = JSON.parse(JSON.stringify(nfts));
      if (tempNFTs.length >= index + 1) {
        tempNFTs[index] = newNFT;
        setNfts(tempNFTs);
      }
    };
    
    const handleSalePaymentChange = (value) => {
      setSalePayment(value);
    };

    const handleAuctionPaymentChange = (value) => {
      setAuctionPayment(value);
    };

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

        <div className="row">
          <div className="d-item col-lg-12 col-md-12 col-sm-12 col-xs-12 mb-4">
            <button id="createButton" className="btn-main" onClick={()=>{navigate("/createItem")}}>
              Create Item
            </button>
          </div>
        </div>

        {!isPageLoading && myNfts.length == 0 &&
          <div className="row">
            <div className="alert alert-danger" role="alert">
              No NFTs
            </div>
          </div>
        }
        {!isPageLoading && myNfts && myNfts.map( (nft, index) => (
          <MyNftCard 
            nft={nft} 
            key={`${nft.token_address}_${nft.token_id}`}
            onImgLoad={onImgLoad} 
            height={height} 
            setNftToSend={setNftToSend}
            setVisibility1={setVisibility1}
            setVisibility2={setVisibility2}
          />
        ))}
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

        <CreateSaleModal 
          title={`List ${nftToSend?.name} #${nftToSend?.token_id} For Sale`}
          visible={visible2} 
          centered
          maskClosable={false}
          onOk={() => list(nftToSend)} 
          onCancel={() => closeCreateSaleModal()}
          footer={[
            <Button onClick={() => closeCreateSaleModal()} key="1">Cancel</Button>,
            <Button type="primary" danger onClick={() => list(nftToSend)} key="2">List</Button>
          ]}
        >
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
              <TabPane tab="Fixed Price" key="1">
                <Select defaultValue={0} style={{ width: "100%", marginBottom: "10px" }} onChange={handleSalePaymentChange}>
                  { payments && payments.map((payment, index) => (
                      <Option value={payment.value} key={index}>{payment.label}</Option>
                    ))
                  }
                </Select>
                <Input
                  autoFocus
                  placeholder="Amount"
                  onChange={(e) => setPrice(e.target.value)}
                />
              </TabPane>
              <TabPane tab="Timed Auction" key="2">
                <Select defaultValue={0} style={{ width: "100%", marginBottom: "10px" }} onChange={handleAuctionPaymentChange}>
                  { payments && payments.map((payment, index) => (
                      <Option value={payment.value} key={index}>{payment.label}</Option>
                    ))
                  }
                </Select>
                <Input
                  autoFocus
                  placeholder="Amount"
                  onChange={(e) => setPrice(e.target.value)}
                  style={{marginBottom: "16px"
                }}
                />
                <DatePicker showTime onChange={onChangeDueDate} value={dueDate}/>
              </TabPane>
            </Tabs>
          </StyledSpin>
        </CreateSaleModal>
        
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