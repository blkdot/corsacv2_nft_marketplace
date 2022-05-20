import React, { memo, useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import Footer from '../components/footer';
//import { createGlobalStyle } from 'styled-components';
import * as selectors from '../../store/selectors';

/*import Checkout from "../components/Checkout";*/
import api from "../../core/api";
import axios from "axios";
import moment from "moment";
import { navigate } from '@reach/router';
import BigNumber from 'bignumber.js';

import {useMoralisDapp} from "../../providers/MoralisDappProvider/MoralisDappProvider";
import {useChain, useMoralisWeb3Api, useMoralis, useWeb3ExecuteFunction, useMoralisQuery} from "react-moralis";
import Countdown from 'react-countdown';

//IMPORT DYNAMIC STYLED COMPONENT
import { StyledHeader } from '../Styles';

import { Spin, Modal, Button } from "antd";
import styled from 'styled-components';
import { formatAddress } from "../../utils";
import { defaultAvatar, fallbackImg } from "../components/constants";

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
const PlaceBidModal = styled(Modal)`
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
	.price-detail-row {
		display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 5px;
		font-size: 2.3rem;
    font-weight: 700;
    line-height: normal;
		letter-spacing: 1px;
	}
	.price-detail-row p {
		margin-bottom: 0;
    font-size: 15px;
    font-weight: 400;
    letter-spacing: normal;
		margin-top: 0;
	}
	.price-detail-row .subtotal {
		color: #111;
    font-size: 15px;
	}
`
//SWITCH VARIABLE FOR PAGE STYLE
const theme = 'GREY'; //LIGHT, GREY, RETRO

const ItemDetail = () => {
		const currentUserState = useSelector(selectors.currentUserState);

    const inputColorStyle = {
    	color: '#111'
    };

    const [openMenu0, setOpenMenu0] = useState(true);
    const [openMenu, setOpenMenu] = useState(false);
    const [openMenu1, setOpenMenu1] = useState(false);
		
    const nftDetailState = useSelector(selectors.buyNFTState);

		const contractProcessor = useWeb3ExecuteFunction();
    const {marketAddress, contractABI, corsacTokenAddress, corsacTokenABI} = useMoralisDapp();
		const Web3Api = useMoralisWeb3Api();
		const {account, Moralis} = useMoralis();
		const {chainId} = useChain();

    const listItemFunction = "getSaleInfo";
		
		const [saleInfo, setSaleInfo] = useState(null);
		const [nft, setNFT] = useState(null);

		const [basePrice, setBasePrice] = useState(0);
		const [yourBalance, setYourBalance] = useState(0);
		const [serviceFee, setServiceFee] = useState(0);
		const [serviceFeePercent, setServiceFeePercent] = useState(0);
		const [payments, setPayments] = useState([]);
		const [payment, setPayment] = useState(0);
		const [decimals, setDecimals] = useState(null);
		const [symbol, setSymbol] = useState(null);
		const [tokenApproved, setTokenApproved] = useState(false);

		const [openCheckout, setOpenCheckout] = useState(false);
    const [openCheckoutbid, setOpenCheckoutbid] = useState(false);
		const [notAvailableBalance, setNotAvailableBalance] = useState(false);

		const [invalidBidAmount, setInvalidBidAmount] = useState(false);
		const [openInvalidBidAmount, setOpenInvalidBidAmount] = useState(false);

		const [errorMessage, setErrorMessage] = useState('');
		const [openErrorModal, setOpenErrorModal] = useState(false);

		const [placeBidErrorMsg, setPlaceBidErrorMsg] = useState('');
		const [placeBidError, setPlaceBidError] = useState(false);

		const [bidAmount, setBidAmount] = useState(0);
		const [lastBidAmount, setLastBidAmount] = useState(0);
		const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
		const [isPageLoading, setIsPageLoading] = useState(true);
		const [isBidEnded, setIsBidEnded] = useState(false);

		const [isWalletConnected, setIsWalletConnected] = useState(true);
		const [isBidded, setIsBidded] = useState(false);

		const renderer = props => {
			if (props.completed) {
				setIsBidEnded(true);
				// Render a completed state
				return <span>Ended</span>;
			} else {
				// Render a countdown
				return <span>{props.formatted.days}d {props.formatted.hours}h {props.formatted.minutes}m {props.formatted.seconds}s</span>;
			}
		};

		const handleBtnClick0 = () => {
			setOpenMenu0(!openMenu0);
			setOpenMenu(false);
			setOpenMenu1(false);
			document.getElementById("Mainbtn0").classList.add("active");
			document.getElementById("Mainbtn").classList.remove("active");
			document.getElementById("Mainbtn1").classList.remove("active");
		};

		const handleBtnClick = () => {
			setOpenMenu(!openMenu);
			setOpenMenu1(false);
			setOpenMenu0(false);
			document.getElementById("Mainbtn").classList.add("active");
			document.getElementById("Mainbtn1").classList.remove("active");
			document.getElementById("Mainbtn0").classList.remove("active");
		};

		const handleBtnClick1 = () => {
			setOpenMenu1(!openMenu1);
			setOpenMenu(false);
			setOpenMenu0(false);
			document.getElementById("Mainbtn1").classList.add("active");
			document.getElementById("Mainbtn").classList.remove("active");
			document.getElementById("Mainbtn0").classList.remove("active");
		};

		const handleBuyClick = async () => {
			if (!account) {
				setIsWalletConnected(false);
				return;
			} else {
				setIsWalletConnected(true);
			}

			setIsCheckoutLoading(true);

			if ((basePrice + serviceFee) > yourBalance) {
				setNotAvailableBalance(true);
			}
			
			// check allowance
			if (payment != 0x0) {
				// in case ERC-20 token, not stable coin
				const ops = {
					contractAddress: corsacTokenAddress,
					functionName: "allowance",
					abi: corsacTokenABI,
					params: {
						owner: account,
						spender: marketAddress
					},
				};
				console.log("checking allowance...");
				await contractProcessor.fetch({
					params: ops,
					onSuccess: async (result) => {
						console.log("success");
						
						const allowance = (new BigNumber(result._hex, 16)).dividedBy(new BigNumber(10).pow(decimals)).toNumber();
						console.log("allowance:", allowance);

						if (basePrice + serviceFee > allowance) {
							setTokenApproved(false);
						} else {
							setTokenApproved(true);
						}
					},
					onError: (error) => {
						console.log("failed:", error);
					},
				});
			}

			setIsCheckoutLoading(false);
			setOpenCheckout(true);			
		};

		const handlePlacebidClick = async () => {
			if (!account) {
				setIsWalletConnected(false);
				return;
			} else {
				setIsWalletConnected(true);
			}

			setIsCheckoutLoading(true);

			if ((basePrice + serviceFee) > yourBalance) {
				setNotAvailableBalance(true);
			}
			
			setIsCheckoutLoading(false);
			setOpenCheckoutbid(true);
		};

		const closeInvalidBidAmount = () => {
			setInvalidBidAmount(false);
			setOpenInvalidBidAmount(false);
			setOpenCheckoutbid(true);
		};

		const closeCheckoutbid = () => {
			setPlaceBidErrorMsg('');
			setPlaceBidError(false);
			setOpenCheckoutbid(false);
		};

		const changeBidAmount = (event) => {
			setBidAmount(parseFloat(event.target.value));
			setInvalidBidAmount(false);
			setTokenApproved(false);
		};

		const closeErrorModal = () => {
			setErrorMessage('');
			setOpenErrorModal(false);
		};

		const handleCheckoutClick = async () => {
			if (payment != 0x0) {
				// in case ERC-20 token, not stable coin
				if (tokenApproved) {
					await buyItem();
				} else {
					await approveToken();
				}
			} else {
				// in case stable coin
				await buyItem();
			}
		};

		const handleCheckoutbidClick = async () => {
			setIsCheckoutLoading(true);

			// check bidAmount
			const amount = bidAmount + bidAmount * serviceFeePercent / 100;
			if (bidAmount < basePrice || amount >= yourBalance) {
				setIsCheckoutLoading(false);
				setInvalidBidAmount(true);
				setOpenInvalidBidAmount(true);
				setOpenCheckoutbid(false);
				return;
			}

			setInvalidBidAmount(false);

			// check allowance
			if (payment != 0x0) {
				// in case ERC-20 token, not stable coin
				const ops = {
					contractAddress: corsacTokenAddress,
					functionName: "allowance",
					abi: corsacTokenABI,
					params: {
						owner: account,
						spender: marketAddress
					},
				};
				console.log("checking allowance...");
				await contractProcessor.fetch({
					params: ops,
					onSuccess: async (result) => {
						console.log("success");
						
						const allowance = (new BigNumber(result._hex, 16)).dividedBy(new BigNumber(10).pow(decimals)).toNumber();
						console.log("allowance:", allowance);

						if (bidAmount + serviceFee > allowance) {
							approveToken('bid');
						} else {
							await placeBid();
						}
					},
					onError: (error) => {
						console.log("failed:", error);
						setIsCheckoutLoading(false);
						setPlaceBidErrorMsg(error.data.message);
						setPlaceBidError(true);
					},
				});
			} else {
				await placeBid();
			}
		};

		const approveToken = async (type='buy') => {
			setIsCheckoutLoading(true);

			// const amount = (new BigNumber(2)).pow(256) - 1;
			let amount = 0;
			if (type === 'buy') {
				amount = Moralis.Units.Token(basePrice + serviceFee, decimals);
			} else if (type === 'bid') {
				amount = Moralis.Units.Token(bidAmount + bidAmount * serviceFeePercent / 100, decimals);
			} else {
				return;
			}
			
			const ops = {
				contractAddress: payments[payment].addr,
				functionName: "approve",
				abi: [{
          "inputs": [
						{
							"internalType": "address",
							"name": "spender",
							"type": "address"
						},
						{
							"internalType": "uint256",
							"name": "amount",
							"type": "uint256"
						}
					],
					"name": "approve",
					"outputs": [
						{
							"internalType": "bool",
							"name": "",
							"type": "bool"
						}
					],
					"stateMutability": "nonpayable",
					"type": "function"
        }],
				params: {
					spender: marketAddress,
					amount: amount.toString()
				},
			};
			await contractProcessor.fetch({
				params: ops,
				onSuccess: async (result) => {
					await result.wait();

					console.log("success:approved");
					setTokenApproved(true);
					setIsCheckoutLoading(false);
					return true;
				},
				onError: (error) => {
					console.log("failed:approved", error);
					setTokenApproved(false);
					setIsCheckoutLoading(false);
					return false;
				},
			});
		};

		const buyItem = async () => {
			console.log("buyItem");
			const totalPrice = Moralis.Units.Token(basePrice + serviceFee, decimals);
			const ops = {
				contractAddress: marketAddress,
				functionName: "buy",
				abi: contractABI,
				params: {
					saleId: parseInt(saleInfo[0]),
				},
				msgValue: totalPrice,
			};
			await contractProcessor.fetch({
				params: ops,
				onSuccess: async (result) => {
					console.log("success:buy");
					await result.wait();

					//save activity
					try {
						const itemName = (nft.metadata && nft.metadata.name) ? nft.metadata.name : nft.name;
						const description = currentUserState.data.name + ": bought a item - " + itemName;
			
						const res = await axios.post(
							`${process.env.REACT_APP_SERVER_URL}/api/activity/save`, 
							{
								'actor': account.toLowerCase(),
								'actionType': 6,
								'description': description,
								'from': nft.author && nft.author.walletAddr ? nft.author.walletAddr : 'Unknown',
								'collectionAddr': nft.token_address,
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

					navigate('/mynft');
				},
				onError: (error) => {
					console.log("failed:buy", error);
				},
			});
		};

		const placeBid = async () => {
			setPlaceBidErrorMsg('');
			setPlaceBidError(false);

			// console.log("placeBid");
			const price = bidAmount * (new BigNumber(10).pow(decimals)).toNumber();
			const totalPrice = Moralis.Units.Token(bidAmount + bidAmount * serviceFeePercent / 100, decimals);
			// console.log("bid Amount:", price);
			// console.log("totalPrice:", totalPrice);
			const ops = {
				contractAddress: marketAddress,
				functionName: "placeBid",
				abi: contractABI,
				params: {
					saleId: parseInt(saleInfo[0]),
					price: totalPrice
				},
				msgValue: totalPrice
			};
			await contractProcessor.fetch({
				params: ops,
				onSuccess: async (result) => {
					console.log("success:placeBid");
					await result.wait();

					//save activity
					try {
						const itemName = (nft.metadata && nft.metadata.name) ? nft.metadata.name : nft.name;
						const description = currentUserState.data.name + ": placed a bid - " + itemName;
			
						const res = await axios.post(
							`${process.env.REACT_APP_SERVER_URL}/api/activity/save`, 
							{
								'actor': account.toLowerCase(),
								'actionType': 7,
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

					setIsCheckoutLoading(false);
					const res = await axios.post(`${process.env.REACT_APP_SERVER_URL}/api/bid/add`, {
							walletAddr: account,
							price: price,
							saleId: ops.params.saleId
							// itemId: nft._id,
						}, {
							headers: {
								'Content-Type': 'application/json',
							}
						}
					);
					navigate('/mynft');
				},
				onError: (error) => {
					console.log("failed:placeBid", error);
					// setErrorMessage(error.data.message);
					// setOpenErrorModal(true);
					if (error.data) {
						setPlaceBidErrorMsg(error.data.message);
					} else if (error.message) {
						setPlaceBidErrorMsg(error.message);
					} else {
						setPlaceBidErrorMsg(error.toString());
					}
					setPlaceBidError(true);
					setIsCheckoutLoading(false);
				},
			});
		}

		async function getPayments() {
			try {
				await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/payment/all`, {
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

		const handleCancelClick = async (nft) => {
			let functionName = null;
			let action = null;
			let actionType = null;
			
			setIsCheckoutLoading(true);

			if (nft.isOwner && nft.onSale) {
				functionName = 'removeSale';
				action = 'sale';
				actionType = 9;
			} else if (nft.isOwner && nft.onAuction) {
				functionName = 'cancelAuction';
				action = 'auction';
				actionType = 10;
			} else if (nft.isOwner && nft.onOffer) {
				functionName = '';
				action = 'offer';
				actionType = 11;
			} else if (!nft.isOwner && isBidded) {
				functionName = 'cancelBid';
				action = 'bid';
				actionType = 14;
			} else {
				functionName = '';
			}

			if (functionName && functionName) {
				const ops = {
					contractAddress: marketAddress,
					functionName: functionName,
					abi: contractABI,
					params: {
						saleId: parseInt(saleInfo[0]),
					},
				};
				await contractProcessor.fetch({
					params: ops,
					onSuccess: async (result) => {
						console.log("success:cancel " + action);
						await result.wait();

						//save activity
						try {
							const itemName = (nft.metadata && nft.metadata.name) ? nft.metadata.name : nft.name;
							const description = currentUserState.data.name + ": canceled " + action + " - " + itemName;
				
							const res = await axios.post(
								`${process.env.REACT_APP_SERVER_URL}/api/activity/save`, 
								{
									'actor': account.toLowerCase(),
									'actionType': actionType,
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

							if (actionType == 14) {
								setIsBidded(false);
							}
						} catch(ex) {
							console.log(ex);
						}

						setIsCheckoutLoading(false);
					},
					onError: (error) => {
						console.log("failed:cancel " + action, error);
						// setErrorMessage(error.data.message);
						// setOpenErrorModal(true);
						if (error.data) {
							setPlaceBidErrorMsg(error.data.message);
						} else if (error.message) {
							setPlaceBidErrorMsg(error.message);
						} else {
							setPlaceBidErrorMsg(error.toString());
						}
						setPlaceBidError(true);
						setIsCheckoutLoading(false);
					},
				});
			}
		}

		async function getBidList() {
			try {
				await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/bid/getBids`, {
					headers: {
						'Content-Type': 'application/json',
					},
					params: {
						saleId: parseInt(saleInfo[0])
					}
				}).then(async res => {
					let bids = [];
					let max = 0;
					for (let bid of res.data) {
						let b = JSON.parse(JSON.stringify(bid));
						b.price = new BigNumber(bid.price.$numberDecimal).dividedBy(new BigNumber(10).pow(decimals)).toNumber();
						bids.push(b);

						if (max < b.price) {
							max = b.price;
						}
					}
					
					nft.bids = bids;
					setLastBidAmount(max);

					if (res.data.length > 0) {
						let lastBid = res.data[res.data.length - 1];
						setIsBidded(lastBid.walletAddr.toLowerCase() === (account ? account.toLowerCase() : null));
					}
				});
			} catch {
				console.log('error in fetching bids by saleId');
			}
		}

		async function getHistory() {
			try {
				await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/activity/history`, {
					headers: {
						'Content-Type': 'application/json',
					},
					params: {
						collectionAddr: nft.token_address.toLowerCase(),
						tokenId: parseInt(nft.token_id ? nft.token_id : nft.tokenId)
					}
				}).then(async res => {
					let history = [];
					for (let h of res.data.history) {
						history.push({
							actor: (h.actorUsers && h.actorUsers[0]) ? (h.actorUsers[0].name ? h.actorUsers[0].name : formatAddress(h.actorUsers[0].walletAddr, 'wallet')) : '',
							actorAvatar: h.actorUsers && h.actorUsers[0] ? h.actorUsers[0].avatar : defaultAvatar,
							from: (h.fromUsers && h.fromUsers[0]) ? (h.fromUsers[0].name ? h.fromUsers[0].name : formatAddress(h.fromUsers[0].walletAddr, 'wallet')) : '',
							actionType: h.actionType,
							description: h.description,
							timeStamp: h.timeStamp * 1000
						});
					}
					
					nft.history = history;
				});
			} catch {
				console.log('error in fetching history by item');
			}
		}

		useEffect(() => {
			if (nftDetailState == undefined) {
				navigate('/');
			} else {
				setNFT(nftDetailState.data);

				getPayments();
			}
    }, [nftDetailState]);

		useEffect(() => {
			async function getSalesInfo(nft) {
        const ops = {
					chain: process.env.REACT_APP_CHAIN_ID,
          address: marketAddress,
          function_name: listItemFunction,
          abi: contractABI,
          params: {
            startIdx: "0",
            count: "100000"
          },
        };
				const result = await Moralis.Web3API.native.runContractFunction(ops);
				const sales = result.filter((sale, index) => {
					return (nft.token_address.toLowerCase() == sale[3].toLowerCase() && 
									parseInt(nft.tokenId ? nft.tokenId : nft.token_id) === parseInt(sale[4]));
				});
				
				if (sales.length > 0) {
					// console.log("sale INFO:", sales[0]);
					const sale = sales[0];
					setPayment(sale[6]);
					setSaleInfo(sale);
				} else {
					setPayment(0);
					setSaleInfo(null);
				}
				setIsPageLoading(false);
      }

			async function fetchData() {
				await getHistory();
				await getSalesInfo(nft);
			}

			if (nft) {
				// console.log("item detail:", nft);
				fetchData();
			}
		}, [nft]);

		useEffect(() => {
			async function getDetailedInfo () {
				let bPrice = 0;
				let yBalance = 0;

				if (account) {
					const options = {
						chain: chainId,
						address: account
					};
					
					const balances = await Web3Api.account.getTokenBalances(options);
					// console.log(balances);
									
					const token = balances.filter((t, index) => {
						// return t.token_address.toLowerCase() == corsacTokenAddress.toLowerCase();
						return t.token_address.toLowerCase() == nft.payment.addr.toLowerCase();
					});
					
					if (parseInt(saleInfo[6]) === 0x00) {
						//payment is stable coin like BNB
						const nativeBalance = await Web3Api.account.getNativeBalance(options);
						bPrice = (new BigNumber(saleInfo[7])).dividedBy(new BigNumber(10).pow(18)).toNumber();
						yBalance = (new BigNumber(nativeBalance.balance)).dividedBy(new BigNumber(10).pow(18)).toNumber();
						
						// setDecimals(payments[0].decimals);
						// setSymbol(payments[0].symbol);
					} else {
						if (token.length > 0) {
							bPrice = (new BigNumber(saleInfo[7])).dividedBy(new BigNumber(10).pow(token[0].decimals)).toNumber();
							yBalance = (new BigNumber(token[0].balance)).dividedBy(new BigNumber(10).pow(token[0].decimals)).toNumber();
	
							// setDecimals(token[0].decimals);
							// setSymbol(token[0].symbol);
						} else {
							//you haven't current token
							const opt = {
								chain: chainId,
								addresses: nft.payment.addr.toLowerCase(),
							};
							// const tokenMetadata = await Web3Api.token.getTokenMetadata(opt);
							// bPrice = (new BigNumber(saleInfo[7])).dividedBy(new BigNumber(10).pow(parseInt(tokenMetadata[0].decimals))).toNumber();
							bPrice = (new BigNumber(saleInfo[7])).dividedBy(new BigNumber(10).pow(parseInt(nft.payment.decimals))).toNumber();
							yBalance = 0;
							// setDecimals(nft.payment.decimals);
							// setSymbol(nft.payment.symbol);
						}
					}
				} else {
					bPrice = (new BigNumber(saleInfo[7])).dividedBy(new BigNumber(10).pow(nft.payment.decimals)).toNumber();
					yBalance = 0;
				}
				setDecimals(nft.payment.decimals);
				setSymbol(nft.payment.symbol);

				// const bPrice = new BigNumber(saleInfo.basePrice._hex, 16).toNumber();
				// const yBalance = new BigNumber(token[0].balance).toNumber();
				const sFeePercent = (new BigNumber(saleInfo[11])) / 100;
				const sFee = bPrice * (new BigNumber(saleInfo[12])) / 10000;
	
				setBasePrice(bPrice);
				setYourBalance(yBalance);
				setServiceFeePercent(sFeePercent);
				setServiceFee(sFee);
				setIsPageLoading(false);
			}

			if (saleInfo) {
				getDetailedInfo();
			}
		}, [saleInfo]);

		useEffect(() => {
			if (saleInfo) {
				getBidList();
			}
		}, [saleInfo, symbol, decimals]);

		return (
			<div className="greyscheme">
				<StyledHeader theme={theme} />
				
				<section className='container'>
					<StyledModal
						key="1"
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

					<StyledModal
						key="2"
						title=''
						visible={isCheckoutLoading}
						centered
						footer={null}
						closable={false}
					>
						<div className="row">
						<StyledSpin tip="Loading..." size="large" />
						</div>
					</StyledModal>
					
					{ !isPageLoading && nft && 
						<div className='row mt-md-5 pt-md-4'>
							<div className="col-md-6 text-center">
									{ nft.item_type && nft.item_type == 'image' &&
										<img src={nft.image ? nft.image : nft.metadata && nft.metadata.image ? nft.metadata.image : fallbackImg} className="img-fluid img-rounded mb-sm-30" alt=""/>
									}
									{ nft.item_type && nft.item_type == 'video' &&
										<video width="100%" height="100%" controls className="img-fluid img-rounded mb-sm-30">
											<source src={nft.image ? nft.image : nft.metadata && nft.metadata.image ? nft.metadata.image : fallbackImg} type={nft.mime_type} />
										</video>
									}
									{ nft.item_type && nft.item_type == 'audio' &&
										<audio controls className="img-fluid img-rounded mb-sm-30">
											<source src={nft.image ? nft.image : nft.metadata && nft.metadata.image ? nft.metadata.image : fallbackImg} type={nft.mime_type} />
										</audio>
									}
							</div>
							<div className="col-md-6">
								<div className="item_info">
									{nft.onAuction &&
										<>
											Auctions ends in 
											<div className="de_countdown">
												<Countdown
													date={parseInt(nft.endTime) * 1000}
													renderer={renderer}
												/>
											</div>
										</>
									}
									
									<h2>{nft.metadata && nft.metadata.name ? nft.metadata.name : nft.name}</h2>
									<div className="item_info_counts">
										<div className="item_info_type"><i className="fa fa-image"></i>{nft.metadata && nft.metadata.collection.category ? nft.metadata.collection.category : nft.category}</div>
										<div className="item_info_views"><i className="fa fa-eye"></i>{nft.views}</div>
										<div className="item_info_like"><i className="fa fa-heart"></i>{nft.likes}</div>
									</div>
									
									<div className="d-flex flex-row">
										<div className="mr40">
											<h6>Creator</h6>
											<div className="item_author">                                    
												<div className="author_list_pp">
													<span>
														<img className="lazy" 
																src={nft.creator && nft.creator.avatar ? nft.creator.avatar : defaultAvatar} 
																title={nft.creator && nft.creator.name ? nft.creator.name : 'Unknown'} 
																alt=""
														/>
														<i className="fa fa-check"></i>
													</span>
												</div>
												<div className="author_list_info">
													<span>{nft.creator && nft.creator.name ? nft.creator.name : 'Unknown'}</span>
												</div>
											</div>
										</div>
										<div className="mr40">
											<h6>Collection</h6>
											<div className="item_author">                                    
												<div className="author_list_pp" onClick={() => navigate("/collection/" + (nft.collection && nft.collection.addr ? nft.collection.addr : (nft.metadata && nft.metadata.collection ? nft.metadata.collection.addr : '')))}>
													<span>
														<img className="lazy" 
																src={nft.metadata && nft.metadata.collection && nft.metadata.collection.image ? nft.metadata.collection.image : fallbackImg}
																title={nft.metadata && nft.metadata.collection && nft.metadata.collection.label ? nft.metadata.collection.label : 'Unknown'} 
																alt=""/>
														<i className="fa fa-check"></i>
													</span>
												</div>                                    
												<div className="author_list_info">
													<span>{nft.metadata && nft.metadata.collection && nft.metadata.collection.label ? nft.metadata.collection.label : 'Unknown'}</span>
												</div>
											</div>
										</div>
									</div>

									<div className="spacer-40"></div>

									<div className="de_tab">

										<ul className="de_nav">
											<li id='Mainbtn0' className="active"><span onClick={handleBtnClick0}>Details</span></li>
											<li id='Mainbtn' ><span onClick={handleBtnClick}>Bids</span></li>
											<li id='Mainbtn1' className=''><span onClick={handleBtnClick1}>History</span></li>
										</ul>
																				
										<div className="de_tab_content">
											{openMenu0  && (  
											<div className="tab-1 onStep fadeIn">
												<div className="d-block mb-3">
													<div className="mr40">
														<h6>Owner</h6>
														<div className="item_author">                                    
															<div className="author_list_pp">
																<span>
																	<img className="lazy" 
																			src={nft.author && nft.author.avatar ? nft.author.avatar : defaultAvatar} 
																			title={nft.author && nft.author.name ? nft.author.name : 'Unknown'} 
																			alt=""
																	/>
																	<i className="fa fa-check"></i>
																</span>
															</div>                                    
															<div className="author_list_info">
																<span>{nft.author && nft.author.name ? nft.author.name : 'Unknown'}</span>
															</div>
														</div>
													</div>

													<div className="row mt-5">
														<div className="col-lg-12 col-md-12 col-sm-12">
															{ nft.price != 0 && nft.price != null && 
															<div className="nft_attr">
																<h3>
																	Price: {nft.price ? nft.price.toString() + ' ' + nft.payment.symbol : ''}
																</h3>
																<h3 className="mb-0">
																	Royalty: {nft.metadata && nft.metadata.royalty ? nft.metadata.royalty.toString() + ' %' : ''}
																</h3>
															</div>
															}
															<div className="nft_attr" style={{textAlign: "left"}}>
																<h4 className="mb-4">Description:</h4>
																<span dangerouslySetInnerHTML={{__html: nft.metadata && nft.metadata.description ? nft.metadata.description.replaceAll('\n', "<br/>") : ''}} />
															</div>
														</div>
													</div>
												</div>
											</div>
											)}

											{openMenu  && (  
											<div className="tab-1 onStep fadeIn">
													{nft.bids && nft.bids.map((bid, index) => (
															<div className="p_list" key={index}>
																	<div className="p_list_pp">
																			<span>
																					<img className="lazy" 
																						src={bid.user && bid.user.avatar ? bid.user.avatar : defaultAvatar} 
																						title={bid.user && bid.user.name ? bid.user.name : ''} 
																						alt=""/>
																					<i className="fa fa-check"></i>
																			</span>
																	</div>                                    
																	<div className="p_list_info">
																		<span className="text-danger">{bid.walletAddr === account && 'Your'} Bid: <b>{bid.price} {symbol}</b></span>
																		<span>by <b>{bid.user && bid.user.name ? bid.user.name : formatAddress(bid.walletAddr, 'wallet')}</b> at <b>{moment(bid.created_at).format('L, LT')}</b></span>
																	</div>
															</div>
													))}
													{(nft.bids === undefined || nft.bids === null || nft.bids.length === 0) &&
														<div className="p_list">
															<span><b>No bids</b></span>
														</div>
													}
											</div>
											)}

											{openMenu1 && ( 
											<div className="tab-2 onStep fadeIn">
													{nft.history && nft.history.map((history, index) => (
															<div className="p_list" key={index}>
																	<div className="p_list_pp">
																			<span>
																					<img className="lazy" src={history.actorAvatar} alt=""/>
																					<i className="fa fa-check"></i>
																			</span>
																	</div>                                    
																	<div className="p_list_info">
																			<b>{history.actor}</b>
																			<span>{history.description}</span>
																			<span>{history.from ? 'From' : ''} <b>{history.from ? history.from : ''}</b> at <b>{moment(history.timeStamp).format('L, LT')}</b></span>
																	</div>
															</div>
													))}
											</div>
											)}

											{/* button for checkout */}
											<div className="d-flex flex-row mt-5">
												{nft.isOwner && (nft.onSale || nft.onAuction || nft.onOffer) &&
													<button className='btn-main lead mb-5 mr15' onClick={() => handleCancelClick(nft)}>Cancel {nft.onSale ? 'Sale' : nft.onAuction ? 'Auction' : nft.onOffer ? 'Offer' : 'Sale'}</button>
												}
												{!nft.isOwner && (nft.onSale || nft.onOffer) && 
													<button className='btn-main lead mb-5 mr15' onClick={() => handleBuyClick()}>Buy Now</button>
												}
												{!nft.isOwner && (!isBidEnded && nft.onAuction && !isBidded) && 
													<button className='btn-main btn2 lead mb-5' onClick={() => handlePlacebidClick()}>Place A Bid</button>
												}
												{!nft.isOwner && (!isBidEnded && isBidded) && 
													<button className='btn-main btn2 lead mb-5' onClick={() => handleCancelClick(nft)}>Cancel Bid</button>
												}
											</div>
										</div>     
									</div>          
								</div>
							</div>
						</div>
					}
				</section>
				
				<Footer /> 
				{ openCheckout && !notAvailableBalance &&
					(
					<div className='checkout'>
						<div className='maincheckout'>
							<button className='btn-close' onClick={() => setOpenCheckout(false)}>x</button>
							<div className='heading'>
								<h3>Checkout</h3>
							</div>
							<p>
								You are about to purchase a <span className="bold">{nft.metadata && nft.metadata.name ? nft.metadata.name : ''}({nft.name} #{nft.token_id})</span> 
								<span className="bold"> from {nft.author && nft.author.name ? nft.author.name : saleInfo.seller}</span>
							</p>
							{/* <div className='detailcheckout mt-4'>
								<div className='listcheckout'>
									<h6>
										Enter quantity. <span className="color">10 available</span>
									</h6>
									<input type="text" name="buy_now_qty" id="buy_now_qty" className="form-control" style={inputColorStyle}/>
								</div>
							</div> */}
							<div className='heading mt-3'>
								<p>Your balance</p>
								<div className='subtotal'>
									{yourBalance} {symbol}
								</div>
							</div>
							<div className='heading mt-3'>
								<p>Item Price</p>
								<div className='subtotal'>
									{basePrice} {symbol}
								</div>
							</div>
							<div className='heading'>
								<p>Service fee {serviceFeePercent}%</p>
								<div className='subtotal'>
									{serviceFee} {symbol}
								</div>
							</div>
							<div className='heading'>
								<p>You will pay</p>
								<div className='subtotal'>
									{basePrice + serviceFee} {symbol}
								</div>
							</div>
							<button className='btn-main lead mb-5' onClick={() => handleCheckoutClick()}>
								{tokenApproved ? 'Checkout' : 'Approve'}
							</button>
						</div>
					</div>
					)
				}
				{ !isWalletConnected &&
					(
					<div className='checkout'>
						<div className='maincheckout'>
							<button className='btn-close' onClick={() => setIsWalletConnected(true)}>x</button>
							<div className='heading'>
								<h3>Note</h3>
							</div>
							<p>
								<span className="bold">Please connect your wallet to purchase.</span>
							</p>
							<button className='btn-main lead mb-5' onClick={() => navigate("/wallet")}>
								Connect wallet
							</button>
						</div>
					</div>
					)
				}
				{ openCheckout && notAvailableBalance &&
					(
					<div className='checkout'>
						<div className='maincheckout'>
							<button className='btn-close' onClick={() => setOpenCheckout(false)}>x</button>
							<div className='heading'>
								<h3>Error</h3>
							</div>
							<p>
								Your balance is <span className="bold">Not Enough</span> to buy this item.
							</p>
							<div className='heading mt-3'>
								<p>Your balance</p>
								<div className='subtotal'>
									{yourBalance} {symbol}
								</div>
							</div>
							<div className='heading'>
								<p>Item Price</p>
								<div className='subtotal'>
									{basePrice} {symbol}
								</div>
							</div>
							<div className='heading'>
								<p>Service fee {serviceFeePercent}%</p>
								<div className='subtotal'>
									{serviceFee} {symbol}
								</div>
							</div>
							<div className='heading'>
								<p>You have to pay</p>
								<div className='subtotal'>
									{basePrice + serviceFee} {symbol}
								</div>
							</div>
							<button className='btn-main lead mb-5' onClick={() => setOpenCheckout(false)}>Okay, got it!</button>
						</div>
					</div>
					)
				}
				
				{ !isPageLoading && nft &&
				<PlaceBidModal 
          title={`Place a Bid`}
          visible={openCheckoutbid && !notAvailableBalance} 
          centered
          maskClosable={false}
          onOk={() => handleCheckoutbidClick()} 
          onCancel={() => closeCheckoutbid()}
          footer={[
            <Button onClick={() => closeCheckoutbid()}>Cancel</Button>,
            <Button type="primary" danger onClick={() => handleCheckoutbidClick()}>Place a bid</Button>
          ]}
        >
					{placeBidError &&
						<div className="alert alert-danger" role="alert">
							{placeBidErrorMsg}
						</div>
					}
					<p>
						You are about to purchase a <span className="bold">{nft.name} #{nft.token_id}</span> 
						<span className="bold"> from {nft.seller}</span>
					</p>
					<div className='detailcheckout mt-4'>
						<div className='listcheckout'>
							<h6>Your bid ({symbol})</h6>
							<input 
								type="number" 
								className="form-control" 
								style={inputColorStyle} 
								value={bidAmount}
								// onChange={(event) => {setBidAmount(event.target.value)}} 
								onChange={changeBidAmount}
								min={basePrice} 
								step="0.00001"
							/>
							<span className="text-danger">Last Bid Amount: {lastBidAmount} {symbol}</span>
						</div>
					</div>
					{/* <div className='detailcheckout mt-3'>
						<div className='listcheckout'>
							<h6>
								Enter quantity. <span className="color">10 available</span>
							</h6>
							<input type="text" name="buy_now_qty" id="buy_now_qty" className="form-control" style={inputColorStyle} />
						</div>
					</div> */}
					<div className='price-detail-row mt-3'>
						<p>Your balance</p>
						<div className='subtotal'>
							{yourBalance} {symbol}
						</div>
					</div>
					<div className='price-detail-row'>
						<p>Item Price</p>
						<div className='subtotal'>
							{basePrice} {symbol}
						</div>
					</div>
					<div className='price-detail-row'>
						<p>Service fee {serviceFeePercent}%</p>
						<div className='subtotal'>
							{bidAmount * serviceFeePercent / 100} {symbol}
						</div>
					</div>
					<div className='price-detail-row'>
						<p>You will pay</p>
						<div className='subtotal'>
							{bidAmount * (100 + serviceFeePercent) / 100} {symbol}
						</div>
					</div>
				</PlaceBidModal>
				}
				{ openCheckoutbid && notAvailableBalance &&
					<div className='checkout'>
						<div className='maincheckout'>
							<button className='btn-close' onClick={() => setOpenCheckoutbid(false)}>x</button>
							<div className='heading'>
									<h3>Place a Bid</h3>
							</div>
							<p>
								Your balance is <span className="bold">Not Enough</span> to bid this item.
							</p>
							<div className='heading mt-3'>
								<p>Your balance</p>
								<div className='subtotal'>
									{yourBalance} {symbol}
								</div>
							</div>
							<div className='heading'>
								<p>Item Price</p>
								<div className='subtotal'>
									{basePrice} {symbol}
								</div>
							</div>
							<div className='heading'>
								<p>Service fee {serviceFeePercent}%</p>
								<div className='subtotal'>
									{serviceFee} {symbol}
								</div>
							</div>
							<div className='heading'>
								<p>You will pay minimum</p>
								<div className='subtotal'>
									{basePrice + serviceFee} {symbol}
								</div>
							</div>
							<button className='btn-main lead mb-5' onClick={() => setOpenCheckoutbid(false)}>Okay, got it!</button>
						</div>
					</div>
				}
				{ openInvalidBidAmount && invalidBidAmount &&
					<div className='checkout'>
						<div className='maincheckout'>
							<button className='btn-close' onClick={() => closeInvalidBidAmount()}>x</button>
							<div className='heading'>
									<h3>Error</h3>
							</div>
							<p>
								Your bid amount should be <span className="bold">greater</span> than base price or <span className="bold">less</span> than your balance.
							</p>
							<div className='heading mt-3'>
								<p>Your balance</p>
								<div className='subtotal'>
									{yourBalance} {symbol}
								</div>
							</div>
							<div className='heading'>
								<p>Base Price</p>
								<div className='subtotal'>
									{basePrice} {symbol}
								</div>
							</div>
							<div className='heading'>
								<p>Your bid amount</p>
								<div className='subtotal'>
									{bidAmount} {symbol}
								</div>
							</div>
							<button className='btn-main lead mb-5' onClick={() => closeInvalidBidAmount()}>Okay, got it</button>
						</div>
					</div>
				}
				{ openErrorModal && 
					<div className='checkout'>
						<div className='maincheckout'>
							<button className='btn-close' onClick={() => closeErrorModal()}>x</button>
							<div className='heading'>
									<h3>Error</h3>
							</div>
							<p>
								<span className="bold">{errorMessage}</span>
							</p>
							<div className='heading mt-3'>
								<p>Your balance</p>
								<div className='subtotal'>
									{yourBalance} {symbol}
								</div>
							</div>
							<div className='heading'>
								<p>Base Price</p>
								<div className='subtotal'>
									{basePrice} {symbol}
								</div>
							</div>
							<div className='heading'>
								<p>Your bid amount</p>
								<div className='subtotal'>
									{bidAmount} {symbol}
								</div>
							</div>
							<button className='btn-main lead mb-5' onClick={() => closeErrorModal()}>Okay, got it</button>
						</div>
					</div>
				}
			</div>
    );
}

export default memo(ItemDetail);