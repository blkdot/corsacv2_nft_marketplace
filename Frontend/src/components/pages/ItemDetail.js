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

import { Spin, Modal } from "antd";
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
//SWITCH VARIABLE FOR PAGE STYLE
const theme = 'GREY'; //LIGHT, GREY, RETRO

const ItemDetail = () => {
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
		const {account} = useMoralis();
		const {chainId} = useChain();

    const listItemFunction = "getSaleInfo";
		
		const [saleInfo, setSaleInfo] = useState(null);
		const [nft, setNFT] = useState(null);

		const [basePrice, setBasePrice] = useState(0);
		const [yourBalance, setYourBalance] = useState(0);
		const [serviceFee, setServiceFee] = useState(0);
		const [serviceFeePercent, setServiceFeePercent] = useState(0);
		const [payment, setPayment] = useState(0);
		const [decimals, setDecimals] = useState(18);
		const [symbol, setSymbol] = useState("BNB");
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
				amount = (basePrice + serviceFee) * (new BigNumber(10).pow(decimals)).toNumber();
			} else if (type === 'bid') {
				amount = (bidAmount + bidAmount * serviceFeePercent / 100) * (new BigNumber(10).pow(decimals)).toNumber();
			} else {
				return;
			}
			// console.log("bidAmount:", typeof(bidAmount));
			// console.log(bidAmount * serviceFeePercent / 100);
			// console.log("amount:", amount);
			const ops = {
				contractAddress: corsacTokenAddress,
				functionName: "approve",
				abi: corsacTokenABI,
				params: {
					spender: marketAddress,
					amount: amount.toString()
				},
			};
			await contractProcessor.fetch({
				params: ops,
				onSuccess: (result) => {
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
			const totalPrice = (basePrice + serviceFee) * (new BigNumber(10).pow(decimals)).toNumber();
			console.log("totalPrice:", totalPrice);
			const ops = {
				contractAddress: marketAddress,
				functionName: "buy",
				abi: contractABI,
				params: {
					saleId: new BigNumber(saleInfo.saleId._hex, 16).toNumber(),
				},
				msgValue: totalPrice,
			};
			await contractProcessor.fetch({
				params: ops,
				onSuccess: (result) => {
					console.log("success:buy");
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

			console.log("placeBid");
			const price = bidAmount * (new BigNumber(10).pow(decimals)).toNumber();
			const totalPrice = (bidAmount + bidAmount * serviceFeePercent / 100) * (new BigNumber(10).pow(decimals)).toNumber();
			console.log("bid Amount:", price);
			console.log("totalPrice:", totalPrice);
			const ops = {
				contractAddress: marketAddress,
				functionName: "placeBid",
				abi: contractABI,
				params: {
					saleId: new BigNumber(saleInfo.saleId._hex, 16).toNumber(),
					price: totalPrice
				},
				// msgValue: totalPrice
			};
			console.log(ops);
			await contractProcessor.fetch({
				params: ops,
				onSuccess: async (result) => {
					console.log("success:placeBid");
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

		useEffect(() => {
			if (nftDetailState == undefined) {
				navigate('/');
			} else {
				setNFT(nftDetailState.data);
			}
    }, [nftDetailState]);

		useEffect(() => {
			async function getSalesInfo(nft) {
        const ops = {
          contractAddress: marketAddress,
          functionName: listItemFunction,
          abi: contractABI,
          params: {
            startIdx: 0,
            count: 100000
          },
        };
        
        await contractProcessor.fetch({
          params: ops,
          onSuccess: (result) => {
            console.log("success");
            const sales = result.filter((sale, index) => {
							return (nft.token_address.toLowerCase() == sale.sc.toLowerCase() && 
                      parseInt(nft.token_id) === parseInt(sale.tokenId.toString()));
						});

						if (sales.length > 0) {
							console.log("sale INFO:", sales[0]);
							setPayment(sales[0].payment);
							setSaleInfo(sales[0]);
						} else {
							setPayment(0);
							setSaleInfo(null);
						}
						setIsPageLoading(false);
          },
          onError: (error) => {
            console.log("failed:", error);
            setSaleInfo(null);
						isPageLoading(false);
          },
        });
      }

			if (nft) {
				console.log("item detail:", nft);
				getSalesInfo(nft);
			}
		}, [nft]);

		useEffect(() => {
			async function getAuctionInfo () {
				const options = {
					chain: chainId,
					address: account
				};
				
				const balances = await Web3Api.account.getTokenBalances(options);
				// console.log(balances);
				// const nativeBalance = await Web3Api.account.getNativeBalance(options);
				
				const token = balances.filter((t, index) => {
					// return t.token_address.toLowerCase() == corsacTokenAddress.toLowerCase();
					return t.token_address.toLowerCase() == nft.payment.addr.toLowerCase();
				});
				
				let bPrice = new BigNumber(saleInfo.basePrice._hex, 16).toNumber();
				let yBalance = new BigNumber(token[0].balance).toNumber();
	
				// if payment is corsac token, not stable coin
				if (saleInfo.payment._hex !== 0x00) {
					bPrice = (new BigNumber(saleInfo.basePrice._hex, 16)).dividedBy(new BigNumber(10).pow(token[0].decimals)).toNumber();
					yBalance = (new BigNumber(token[0].balance)).dividedBy(new BigNumber(10).pow(token[0].decimals)).toNumber();

					setDecimals(token[0].decimals);
					setSymbol(token[0].symbol);
				}
				
				// const bPrice = new BigNumber(saleInfo.basePrice._hex, 16).toNumber();
				// const yBalance = new BigNumber(token[0].balance).toNumber();
				const sFeePercent = (new BigNumber(saleInfo.feeRatio._hex, 16)) / 100;
				const sFee = bPrice * (new BigNumber(saleInfo.feeRatio._hex, 16)) / 10000;
	
				setBasePrice(bPrice);
				setYourBalance(yBalance);
				setServiceFeePercent(sFeePercent);
				setServiceFee(sFee);
				setIsPageLoading(false);
			}

			if (saleInfo) {
				getAuctionInfo();
			}
		}, [saleInfo]);

		useEffect(() => {
			async function getBidList() {
				try {
          await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/bid/getBids`, {
						headers: {
							'Content-Type': 'application/json',
						},
            params: {
              saleId: new BigNumber(saleInfo.saleId._hex).toNumber()
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
          });
        } catch {
          console.log('error in fetching bids by saleId');
        }
			}

			if (saleInfo) {
				getBidList();
			}
		}, [symbol, decimals]);

    return (
			<div className="greyscheme">
				<StyledHeader theme={theme} />
				
				<section className='container'>
				{/* {isCheckoutLoading && 
					<div className="row mt-md-5 pt-md-4">
          	<StyledSpin tip="Loading..." size="large" />
					</div>
        } */}
				
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
								{/* <img src={ nft.preview_image && api.baseUrl + nft.preview_image.url} className="img-fluid img-rounded mb-sm-30" alt=""/> */}
								<img src={ nft.image} className="img-fluid img-rounded mb-sm-30" alt=""/>
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
								{/* <h2>{nft.title}</h2> */}
								<h2>{nft.name}</h2>
								<div className="item_info_counts">
									<div className="item_info_type"><i className="fa fa-image"></i>{nft.category}</div>
									<div className="item_info_views"><i className="fa fa-eye"></i>{nft.views}</div>
									<div className="item_info_like"><i className="fa fa-heart"></i>{nft.likes}</div>
								</div>
								<p>{nft.description}</p>

								<div className="d-flex flex-row">
										<div className="mr40">
												<h6>Creator</h6>
												<div className="item_author">                                    
														<div className="author_list_pp">
																<span>
																		<img className="lazy" src={nft.author && api.baseUrl + nft.author.avatar.url} alt=""/>
																		<i className="fa fa-check"></i>
																</span>
														</div>                                    
														<div className="author_list_info">
																<span>{nft.author && nft.author.username}</span>
														</div>
												</div>
										</div>
										<div className="mr40">
												<h6>Collection</h6>
												<div className="item_author">                                    
														<div className="author_list_pp">
																<span>
																		<img className="lazy" src={nft.author && api.baseUrl + nft.author.avatar.url} alt=""/>
																		<i className="fa fa-check"></i>
																</span>
														</div>                                    
														<div className="author_list_info">
																<span>{nft.author && nft.author.username}</span>
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
																							<img className="lazy" src={nft.author && api.baseUrl + nft.author.avatar.url} alt=""/>
																							<i className="fa fa-check"></i>
																					</span>
																			</div>                                    
																			<div className="author_list_info">
																					<span>{nft.author && nft.author.username}</span>
																			</div>
																	</div>
															</div>

															<div className="row mt-5">
																	<div className="col-lg-4 col-md-6 col-sm-6">
																			<div className="nft_attr">
																					<h5>Background</h5>
																					<h4>Yellowish Sky</h4>
																					<span>85% have this trait</span>
																			</div>
																	</div>
																	<div className="col-lg-4 col-md-6 col-sm-6">
																			<div className="nft_attr">
																					<h5>Eyes</h5>
																					<h4>Purple Eyes</h4>
																					<span>14% have this trait</span>
																			</div>
																	</div>
																	<div className="col-lg-4 col-md-6 col-sm-6">
																			<div className="nft_attr">
																					<h5>Nose</h5>
																					<h4>Small Nose</h4>
																					<span>45% have this trait</span>
																			</div>
																	</div>
																	<div className="col-lg-4 col-md-6 col-sm-6">
																			<div className="nft_attr">
																					<h5>Mouth</h5>
																					<h4>Smile Red Lip</h4>
																					<span>61% have this trait</span>
																			</div>
																	</div>
																	<div className="col-lg-4 col-md-6 col-sm-6">
																			<div className="nft_attr">
																					<h5>Neck</h5>
																					<h4>Pink Ribbon</h4>
																					<span>27% have this trait</span>
																			</div>
																	</div>
																	<div className="col-lg-4 col-md-6 col-sm-6">
																			<div className="nft_attr">
																					<h5>Hair</h5>
																					<h4>Pink Short</h4>
																					<span>35% have this trait</span>
																			</div>
																	</div>
																	<div className="col-lg-4 col-md-6 col-sm-6">
																			<div className="nft_attr">
																					<h5>Accessories</h5>
																					<h4>Heart Necklace</h4>
																					<span>33% have this trait</span>
																			</div>
																	</div>
																	<div className="col-lg-4 col-md-6 col-sm-6">
																			<div className="nft_attr">
																					<h5>Hat</h5>
																					<h4>Cute Panda</h4>
																					<span>62% have this trait</span>
																			</div>
																	</div>      
																	<div className="col-lg-4 col-md-6 col-sm-6">
																			<div className="nft_attr">
																					<h5>Clothes</h5>
																					<h4>Casual Purple</h4>
																					<span>78% have this trait</span>
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
																					{/* <img className="lazy" src={api.baseUrl + bid.author.avatar.url} alt=""/> */}
																					<i className="fa fa-check"></i>
																			</span>
																	</div>                                    
																	<div className="p_list_info">
																		<span className="text-danger">{bid.walletAddr === account && 'Your'} Bid: <b>{bid.price} {symbol}</b></span>
																		<span>by <b>{bid.walletAddr}</b> at <b>{moment(bid.created_at).format('L, LT')}</b></span>
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
													{nft.history && nft.history.map((bid, index) => (
															<div className="p_list" key={index}>
																	<div className="p_list_pp">
																			<span>
																					<img className="lazy" src={api.baseUrl + bid.author.avatar.url} alt=""/>
																					<i className="fa fa-check"></i>
																			</span>
																	</div>                                    
																	<div className="p_list_info">
																			Bid {bid.author.id === nft.author.id && 'accepted'} <b>{bid.value} ETH</b>
																			<span>by <b>{bid.author.username}</b> at {moment(bid.created_at).format('L, LT')}</span>
																	</div>
															</div>
													))}
											</div>
											)}

											{/* button for checkout */}
											<div className="d-flex flex-row mt-5">
												{(nft.onSale || nft.onOffer) && 
													<button className='btn-main lead mb-5 mr15' onClick={() => handleBuyClick()}>Buy Now</button>
												}
												{!isBidEnded && nft.onAuction && 
													<button className='btn-main btn2 lead mb-5' onClick={() => handlePlacebidClick()}>Place A Bid</button>
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
								You are about to purchase a <span className="bold">{nft.name} #{nft.token_id}</span> 
								<span className="bold"> from {saleInfo.seller}</span>
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
				{ openCheckoutbid && !notAvailableBalance &&
					<div className='checkout'>
						<div className='maincheckout'>
							<button className='btn-close' onClick={() => closeCheckoutbid()}>x</button>
							<div className='heading'>
									<h3>Place a Bid</h3>
							</div>
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
									{bidAmount * serviceFeePercent / 100} {symbol}
								</div>
							</div>
							<div className='heading'>
								<p>You will pay</p>
								<div className='subtotal'>
									{bidAmount * (100 + serviceFeePercent) / 100} {symbol}
								</div>
							</div>
							{/* { (!invalidBidAmount && tokenApproved) ? (
								<button className='btn-main lead mb-5' onClick={() => handleCheckoutbidClick()}>Place a bid</button>
							) : (
								<button className='btn-main lead mb-5' onClick={() => handleCheckBidAllowanceClick()}>Check Allowance</button>
							)} */}
							<button className='btn-main lead mb-5' onClick={() => handleCheckoutbidClick()}>
								Place a bid
							</button>
						</div>
					</div>
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