import React, { memo, useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import Footer from '../components/footer';
//import { createGlobalStyle } from 'styled-components';
import * as selectors from '../../store/selectors';

/*import Checkout from "../components/Checkout";*/

import axios from "axios";
import moment from "moment";
import { navigate, useParams } from '@reach/router';
import BigNumber from 'bignumber.js';

import {useMoralisDapp} from "../../providers/MoralisDappProvider/MoralisDappProvider";
import { useMoralisWeb3Api, useMoralis, useWeb3ExecuteFunction } from "react-moralis";
import Countdown from 'react-countdown';

//IMPORT DYNAMIC STYLED COMPONENT
import { StyledHeader } from '../Styles';

import { Spin, Modal, Button } from "antd";
import styled from 'styled-components';
import { formatAddress, getFileTypeFromURL, getUserInfo, getPayments, getHistory, formatUserName, getFavoriteCount, addLike, removeLike } from "../../utils";
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

const Item = () => {
		const params = useParams();
		const currentUserState = useSelector(selectors.currentUserState);

    const inputColorStyle = {
    	color: '#111'
    };

    const [openMenu0, setOpenMenu0] = useState(true);
    const [openMenu, setOpenMenu] = useState(false);
    const [openMenu1, setOpenMenu1] = useState(false);
		
    const contractProcessor = useWeb3ExecuteFunction();
    const { marketAddress, contractABI } = useMoralisDapp();
		const Web3Api = useMoralisWeb3Api();
		const { isAuthenticated, account, Moralis, isInitialized } = useMoralis();
		
		const [nft, setNFT] = useState(null);

		const [basePrice, setBasePrice] = useState(0);
		const [yourBalance, setYourBalance] = useState(0);
		const [serviceFee, setServiceFee] = useState(0);
		const [serviceFeePercent, setServiceFeePercent] = useState(0);
		const [royaltyFee, setRoyaltyFee] = useState(0);
		const [royaltyFeePercent, setRoyaltyFeePercent] = useState(0);
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

		const [foundNFT, setFoundNFT] = useState(true);

		const [likes, setLikes] = useState(0);
  	const [liked, setLiked] = useState(false);

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

			if ((basePrice + serviceFee + royaltyFee) > yourBalance) {
				setNotAvailableBalance(true);
			}
			
			// check allowance
			if (payment != 0x0) {
				// in case ERC-20 token, not stable coin
				const ops = {
					contractAddress: nft.payment.addr,
					functionName: "allowance",
					abi: [{
						"inputs": [
							{
								"internalType": "address",
								"name": "owner",
								"type": "address"
							},
							{
								"internalType": "address",
								"name": "spender",
								"type": "address"
							}
						],
						"name": "allowance",
						"outputs": [
							{
								"internalType": "uint256",
								"name": "",
								"type": "uint256"
							}
						],
						"stateMutability": "view",
						"type": "function"
					}],
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
			} else {
				setTokenApproved(true);
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

			if ((basePrice + serviceFee + royaltyFee) > yourBalance) {
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
			const amount = bidAmount + bidAmount * (serviceFeePercent + royaltyFeePercent) / 100;
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
					contractAddress: nft.payment.addr,
					functionName: "allowance",
					abi: [{
						"inputs": [
							{
								"internalType": "address",
								"name": "owner",
								"type": "address"
							},
							{
								"internalType": "address",
								"name": "spender",
								"type": "address"
							}
						],
						"name": "allowance",
						"outputs": [
							{
								"internalType": "uint256",
								"name": "",
								"type": "uint256"
							}
						],
						"stateMutability": "view",
						"type": "function"
					}],
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

						if (bidAmount + serviceFee + royaltyFee > allowance) {
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
				amount = Moralis.Units.Token(basePrice + serviceFee + royaltyFee, decimals);
			} else if (type === 'bid') {
				amount = Moralis.Units.Token(bidAmount + bidAmount * (serviceFeePercent + royaltyFeePercent) / 100, decimals);
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
			const totalPrice = Moralis.Units.Token(basePrice + serviceFee + royaltyFee, decimals);
			const ops = {
				contractAddress: marketAddress,
				functionName: "buy",
				abi: contractABI,
				params: {
					saleId: parseInt(nft.saleId),
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
						const description = currentUserState.data.name + ": purchased a item - " + itemName;
			
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

			const price = bidAmount * (new BigNumber(10).pow(decimals)).toNumber();
			const totalPrice = Moralis.Units.Token(bidAmount + bidAmount * (serviceFeePercent + royaltyFeePercent) / 100, decimals);
			
			const ops = {
				contractAddress: marketAddress,
				functionName: "placeBid",
				abi: contractABI,
				params: {
					saleId: parseInt(nft.saleId),
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
						saleId: parseInt(nft.saleId),
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

							//reset item
							if ([9, 10, 11].includes(parseInt(actionType))) {
								let temp = JSON.parse(JSON.stringify(nft));
								temp.onSale = false;
								temp.onAuction = false;
								temp.onOffer = false;
								temp.price = null;
								temp.payment = null;
								temp.endTime = null;
								setNFT(temp);
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

		async function getNFTData(collectionAddr, tokenId) {
			setIsPageLoading(true);

			//get payments data
			const payments = await getPayments();

			//get sales data
			const ops = {
				chain: process.env.REACT_APP_CHAIN_ID,
				address: marketAddress,
				function_name: "getSaleInfo",
				abi: contractABI,
				params: {
					startIdx: "0",
					count: "100000"
				},
			};
	
			const sales = await Moralis.Web3API.native.runContractFunction(ops);
			
			const options = {
				chain: process.env.REACT_APP_CHAIN_ID,
				address: collectionAddr,
				token_id: tokenId,
			};

			if (!isInitialized || !Moralis.Web3API) {
				const APP_ID = process.env.REACT_APP_MORALIS_APPLICATION_ID;
				const SERVER_URL = process.env.REACT_APP_MORALIS_SERVER_URL;

				Moralis.start({
					serverUrl: SERVER_URL,
					appId: APP_ID
				});
			}
			
			let nft = null;
			try {
				const result = await Moralis.Web3API.token.getTokenIdMetadata(options);
				nft = result;
			} catch (err) {
				console.log(err);
				setIsPageLoading(false);
				setFoundNFT(false);
				return;
			}

			if (!nft) {
				setIsPageLoading(false);
				setFoundNFT(false);
				return;
			}
			
			//get metadata
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

			//get author info
			nft.author = await getUserInfo(nft.owner_of.toLowerCase());
			if (!nft.author) {
				nft.author = {walletAddr: nft.owner_of.toLowerCase()};
			}

			if (isAuthenticated && account) {
				nft.isOwner = nft.author && nft.author.walletAddr.toLowerCase() === account.toLowerCase();
			}
			
			//get item type
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

			//get creator of nft
			nft.creator = nft.metadata && nft.metadata.creator ? await getUserInfo(nft.metadata.creator) : null;
			if (!nft.creator) {
				nft.creator = {walletAddr: nft.metadata.creator};
			}

			const s = sales.filter((s, index) => {
				return s[3].toLowerCase() === collectionAddr && parseInt(s[4]) === parseInt(tokenId);
			});
			
			const sale = s.length > 0 ? s[0] : null;

			if (sale) {
				nft.saleId = parseInt(sale[0]);
				nft.seller = sale[2];
				nft.method = parseInt(sale[8]);
				nft.endTime = parseInt(sale[10]);

				if (nft.method === 0) {
					nft.onSale = true;
					nft.onAuction = false;
					nft.onOffer = false;
				} else if (nft.method === 1) {
					nft.onSale = false;
					nft.onAuction = true;
					nft.onOffer = false;
				} else if (nft.method === 2) {
					nft.onSale = false;
					nft.onAuction = false;
					nft.onOffer = true;
				} else {
					nft.onSale = false;
					nft.onAuction = false;
					nft.onOffer = false;
				}

				const p = (payments.length >= parseInt(sale[6]) + 1) ? payments[parseInt(sale[6])] : null;
				if (p) {
					nft.price = new BigNumber(sale[7]).dividedBy(new BigNumber(10).pow(p.decimals)).toNumber();
					nft.payment = p;
					setPayment(sale[6]);
				}

				//get price and balance
				let bPrice = 0;
				let yBalance = 0;
				if (account) {
					const options = {
						chain: process.env.REACT_APP_CHAIN_ID,
						address: account
					};
					const balances = await Web3Api.account.getTokenBalances(options);
					const token = balances.filter((t, index) => {
						return t.token_address.toLowerCase() == nft.payment.addr.toLowerCase();
					});
					
					if (parseInt(sale[6]) === 0x00) {
						//payment is stable coin like BNB
						const nativeBalance = await Web3Api.account.getNativeBalance(options);
						bPrice = (new BigNumber(sale[7])).dividedBy(new BigNumber(10).pow(18)).toNumber();
						yBalance = (new BigNumber(nativeBalance.balance)).dividedBy(new BigNumber(10).pow(18)).toNumber();
					} else {
						if (token.length > 0) {
							bPrice = (new BigNumber(sale[7])).dividedBy(new BigNumber(10).pow(token[0].decimals)).toNumber();
							yBalance = (new BigNumber(token[0].balance)).dividedBy(new BigNumber(10).pow(token[0].decimals)).toNumber();
						} else {
							//you haven't current token
							const opt = {
								chain: process.env.REACT_APP_CHAIN_ID,
								addresses: nft.payment.addr.toLowerCase(),
							};
							bPrice = (new BigNumber(sale[7])).dividedBy(new BigNumber(10).pow(parseInt(nft.payment.decimals))).toNumber();
							yBalance = 0;
						}
					}
				} else {
					bPrice = (new BigNumber(sale[7])).dividedBy(new BigNumber(10).pow(nft.payment.decimals)).toNumber();
					yBalance = 0;
				}
				setDecimals(nft.payment.decimals);
				setSymbol(nft.payment.symbol);

				const sFeePercent = (new BigNumber(sale[11])) / 100;
				const rFeePercent = (new BigNumber(sale[12])) / 100;
				const sFee = bPrice * (new BigNumber(sale[11])) / 10000;
				const rFee = bPrice * (new BigNumber(sale[12])) / 10000;
	
				setBasePrice(bPrice);
				setYourBalance(yBalance);
				setServiceFeePercent(sFeePercent);
				setServiceFee(sFee);
				setRoyaltyFeePercent(rFeePercent);
				setRoyaltyFee(rFee);
				
				//get bids
				try {
					await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/bid/getBids`, {
						headers: {
							'Content-Type': 'application/json',
						},
						params: {
							saleId: parseInt(sale[0])
						}
					}).then(async res => {
						let bids = [];
						let max = 0;
						for (let bid of res.data) {
							let b = JSON.parse(JSON.stringify(bid));
							b.price = new BigNumber(bid.price.$numberDecimal).dividedBy(new BigNumber(10).pow(nft.payment.decimals)).toNumber();
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
			
			nft.history = await getHistory(nft.token_address, nft.token_id);

			//get favorites
			try {
				const favorites = await getFavoriteCount(nft.token_address, nft.token_id, account ? account : null);
				nft.likes = favorites.count;
				nft.liked = favorites.liked;
			} catch (e) {
				console.log(e);
				nft.likes = 0;
				nft.liked = false;
			}

			setNFT(nft);
			setIsPageLoading(false);
		}

		useEffect(() => {
			async function getBaseData() {
				setPayments(await getPayments());
			}
			if (params.collectionAddr && params.tokenId) {
				getBaseData();
			} else {
				navigate("/");
			}
		}, []);

		useEffect(() => {
			if (params.collectionAddr && params.tokenId) {
				getNFTData(params.collectionAddr, params.tokenId);	
			} else {
				navigate("/");
			}
		}, [payments, account]);

		useEffect(() => {
			if (nft) {
				setLikes(nft.likes);
				setLiked(nft.liked);
			}
		}, [nft])

		return (
			<div className="greyscheme">
				<StyledHeader theme={theme} />
				
				<section className='container'>
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

					<Modal
						key="3"
						title='Error'
						visible={!foundNFT}
						centered
						onOk={() => navigate("/")} 
						onCancel={() => navigate("/")}
						footer={[
							<Button type="primary" danger onClick={() => navigate("/")} key="1">Okay, got it</Button>
						]}
					>
						<div className="row">
							<h4>Can't find this item with {params.collectionAddr}#{params.tokenId}</h4>
						</div>
					</Modal>

					{isPageLoading && 
						<div className='row mt-md-5 pt-md-4'>
							<StyledSpin tip="Loading..." size="large" />
						</div>
					}
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
										<div className="item_info_like" onClick={() => handleFavorite(nft)}>
											<i className="fa fa-heart" style={liked ? {color: '#FF3F34'} : {}} title={liked ? 'UnFavorate' : 'Favorite'}></i>{nft.likes}
										</div>
									</div>
									
									<div className="d-flex flex-row">
										<div className="mr40">
											<h6>Creator</h6>
											<div className="item_author">                                    
												<div className="author_list_pp" onClick={() => navigate(`/author/${nft.creator && nft.creator.walletAddr ? nft.creator.walletAddr.toLowerCase() : ''}`)}>
													<span>
														<img className="lazy" 
																src={nft.creator && nft.creator.avatar ? nft.creator.avatar : defaultAvatar} 
																title={nft.creator && nft.creator.name ? formatUserName(nft.creator.name) : formatAddress(nft.creator.walletAddr.toLowerCase(), 'wallet')} 
																alt=""
														/>
														<i className="fa fa-check"></i>
													</span>
												</div>
												<div className="author_list_info">
													<span>{nft.creator && nft.creator.name ? formatUserName(nft.creator.name) : formatAddress(nft.creator.walletAddr.toLowerCase(), 'wallet')}</span>
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
																title={nft.metadata && nft.metadata.collection && nft.metadata.collection.label ? formatUserName(nft.metadata.collection.label) : formatAddress(nft.metadata.collection.addr, 'collection')} 
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
															<div className="author_list_pp" onClick={() => navigate(`/author/${nft.author && nft.author.walletAddr ? nft.author.walletAddr.toLowerCase() : ''}`)}>
																<span>
																	<img className="lazy" 
																			src={nft.author && nft.author.avatar ? nft.author.avatar : defaultAvatar} 
																			title={nft.author && nft.author.name ? formatUserName(nft.author.name) : formatAddress(nft.owner_of.toString(), 'wallet')} 
																			alt=""
																	/>
																	<i className="fa fa-check"></i>
																</span>
															</div>                                    
															<div className="author_list_info">
																<span>{nft.author && nft.author.name ? formatUserName(nft.author.name) : formatAddress(nft.owner_of.toString(), 'wallet')}</span>
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
																	Royalty: {nft.metadata && nft.metadata.royalty ? (parseInt(nft.metadata.royalty) / 100).toFixed(2) + ' %' : ''}
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
																						title={bid.user && bid.user.name ? formatUserName(bid.user.name) : ''} 
																						alt=""/>
																					<i className="fa fa-check"></i>
																			</span>
																	</div>                                    
																	<div className="p_list_info">
																		<span className="text-danger">{bid.walletAddr === account && 'Your'} Bid: <b>{bid.price} {symbol}</b></span>
																		<span>by <b>{bid.user && bid.user.name ? formatUserName(bid.user.name) : formatAddress(bid.walletAddr, 'wallet')}</b> at <b>{moment(bid.created_at).format('L, LT')}</b></span>
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
											<div className="tab-2 onStep fadeIn" style={{overflowY: "scroll", maxHeight: "230px"}}>
													{nft.history && nft.history.map((history, index) => (
															<div className="p_list" key={index} style={{position: "relative"}}>
																	<div className="p_list_pp" style={{marginTop: "5px"}}>
																		<span>
																			<img className="lazy" src={history.actorAvatar} alt=""/>
																			<i className="fa fa-check"></i>
																		</span>
																	</div>                                    
																	<div className="p_list_info">
																		<b>{formatUserName(history.actor)}</b>
																		<span>{history.description}</span>
																		<span>{history.from ? 'From' : ''} <b>{history.from ? formatUserName(history.from) : ''}</b> at <b>{moment(history.timeStamp).format('L, LT')}</b></span>
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
								<span className="bold"> from {nft.author && nft.author.name ? nft.author.name : formatAddress(nft.seller, 'wallet')}</span>
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
								<p>Royalty fee {royaltyFeePercent}%</p>
								<div className='subtotal'>
									{royaltyFee} {symbol}
								</div>
							</div>
							<div className='heading'>
								<p>You will pay</p>
								<div className='subtotal'>
									{basePrice + serviceFee + royaltyFee} {symbol}
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
								<p>Royalty fee {royaltyFeePercent}%</p>
								<div className='subtotal'>
									{royaltyFee} {symbol}
								</div>
							</div>
							<div className='heading'>
								<p>You have to pay</p>
								<div className='subtotal'>
									{basePrice + serviceFee + royaltyFee} {symbol}
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
            <Button key="cancel-button" onClick={() => closeCheckoutbid()}>Cancel</Button>,
            <Button key="bid-button" type="primary" danger onClick={() => handleCheckoutbidClick()}>Place a bid</Button>
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
						<p>Royalty fee {royaltyFeePercent}%</p>
						<div className='subtotal'>
							{bidAmount * royaltyFeePercent / 100} {symbol}
						</div>
					</div>
					<div className='price-detail-row'>
						<p>You will pay</p>
						<div className='subtotal'>
							{bidAmount * (100 + serviceFeePercent + royaltyFeePercent) / 100} {symbol}
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
								<p>Royalty fee {royaltyFeePercent}%</p>
								<div className='subtotal'>
									{royaltyFee} {symbol}
								</div>
							</div>
							<div className='heading'>
								<p>You will pay minimum</p>
								<div className='subtotal'>
									{basePrice + serviceFee + royaltyFee} {symbol}
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

export default memo(Item);
