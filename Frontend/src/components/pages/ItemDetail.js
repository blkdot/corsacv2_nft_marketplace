import React, { memo, useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import Clock from "../components/Clock";
import Footer from '../components/footer';
//import { createGlobalStyle } from 'styled-components';
import * as selectors from '../../store/selectors';

/*import Checkout from "../components/Checkout";*/
import api from "../../core/api";
import moment from "moment";
import { navigate } from '@reach/router';
import BigNumber from 'bignumber.js'

import {useMoralisDapp} from "../../providers/MoralisDappProvider/MoralisDappProvider";
import {useChain, useMoralisWeb3Api, useMoralis, useWeb3ExecuteFunction, useNFTBalances, useMoralisQuery} from "react-moralis";

//IMPORT DYNAMIC STYLED COMPONENT
import { StyledHeader } from '../Styles';
//SWITCH VARIABLE FOR PAGE STYLE
const theme = 'GREY'; //LIGHT, GREY, RETRO

const ItemDetail = ({ nftId }) => {
    const inputColorStyle = {
    	color: '#111'
    };

    const [openMenu0, setOpenMenu0] = useState(true);
    const [openMenu, setOpenMenu] = useState(false);
    const [openMenu1, setOpenMenu1] = useState(false);
		
    const nftDetailState = useSelector(selectors.buyNFTState);

		const contractProcessor = useWeb3ExecuteFunction();
    const {marketAddress, contractABI, corsacTokenAddress} = useMoralisDapp();
		const Web3Api = useMoralisWeb3Api();
		const {account} = useMoralis();
		const {chainId} = useChain();

    const contractABIJson = JSON.parse(contractABI);
		const listItemFunction = "getSaleInfo";
		
		const [saleInfo, setSaleInfo] = useState(null);
		const [nft, setNFT] = useState(null);

		const [basePrice, setBasePrice] = useState(0);
		const [yourBalance, setYourBalance] = useState(0);
		const [payment, setPayment] = useState(0);
		const [decimals, setDecimals] = useState(18);
		const [symbol, setSymbol] = useState("BNB");

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
			const options = {
				chain: chainId,
				address: account
			};
			console.log(options);
			const balances = await Web3Api.account.getTokenBalances(options);
			const nativeBalance = await Web3Api.account.getNativeBalance(options);
			// console.log("token blance:", balances);
			// console.log("native balance:", nativeBalance);

			const token = balances.filter((t, index) => {
				return t.token_address.toLowerCase() == corsacTokenAddress.toLowerCase();
			});
			// console.log("Token Balance:", token[0]);
			// console.log("Native Balance:", nativeBalance);
			// console.log("Sale Info:", saleInfo);
			// console.log("Sale Info:", (new BigNumber(saleInfo.basePrice._hex, 16)).comparedTo(token[0].balance, 10));
			// console.log("Sale Info:", (new BigNumber(saleInfo.basePrice._hex, 16)).comparedTo(100000000000, 10));
			setDecimals(token[0].decimals);
			setSymbol(token[0].symbol);
			setBasePrice((new BigNumber(saleInfo.basePrice._hex, 16)).dividedBy(new BigNumber(10).pow(token[0].decimals)).toNumber());
			setYourBalance((new BigNumber(nativeBalance.balance)).dividedBy(new BigNumber(10).pow(token[0].decimals)).toNumber());
			console.log("Fixed price:", basePrice);
			console.log("Fixed balance:", yourBalance);

			if (basePrice > yourBalance) {
				setNotAvailableBalance(true);
			}
			setOpenCheckout(true);
		};

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
          abi: contractABIJson,
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
                      nft.token_id == sale.tokenId.toString());
						});
						console.log("sale INFO:", sales[0]);
						setSaleInfo(sales[0]);
          },
          onError: (error) => {
            console.log("failed:", error);
            setSaleInfo(null);
          },
        });
      }

			if (nft) {
				getSalesInfo(nft);
			}
		}, [nft]);

		
    const [openCheckout, setOpenCheckout] = React.useState(false);
    const [openCheckoutbid, setOpenCheckoutbid] = React.useState(false);
		const [notAvailableBalance, setNotAvailableBalance] = useState(false);

    return (
			<div className="greyscheme">
				<StyledHeader theme={theme} />
				{ nft && 
					<section className='container'>
						<div className='row mt-md-5 pt-md-4'>
							<div className="col-md-6 text-center">
									<img src={ nft.preview_image && api.baseUrl + nft.preview_image.url} className="img-fluid img-rounded mb-sm-30" alt=""/>
							</div>
							<div className="col-md-6">
								<div className="item_info">
									{nft.item_type === 'on_auction' &&
										<>
											Auctions ends in 
											<div className="de_countdown">
													<Clock deadline={nft.deadline} />
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
														<button className='btn-main lead mb-5 mr15' onClick={() => handleBuyClick()}>Buy Now</button>
														<button className='btn-main btn2 lead mb-5' onClick={() => setOpenCheckoutbid(true)}>Place Bid</button>
												</div>
										</div>     
									</div>          
								</div>
							</div>
						</div>
					</section>
				}
				<Footer /> 
				{ openCheckout &&
					notAvailableBalance ? (
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
							<div className='detailcheckout mt-4'>
								<div className='listcheckout'>
									<h6>
										Enter quantity. <span className="color">10 available</span>
									</h6>
									<input type="text" name="buy_now_qty" id="buy_now_qty" className="form-control" style={inputColorStyle}/>
								</div>
							</div>
							<div className='heading mt-3'>
								<p>Your balance</p>
								<div className='subtotal'>
									10.67856 ETH
								</div>
							</div>
							<div className='heading'>
								<p>Service fee 2.5%</p>
								<div className='subtotal'>
									0.00325 ETH
								</div>
							</div>
							<div className='heading'>
								<p>You will pay</p>
								<div className='subtotal'>
									0.013325 ETH
								</div>
							</div>
							<button className='btn-main lead mb-5' onClick={() => handleBuyClick(nft)}>Checkout</button>
						</div>
					</div>) : (
						<p>aaa</p>
					)
				}
				{ openCheckoutbid &&
					<div className='checkout'>
						<div className='maincheckout'>
							<button className='btn-close' onClick={() => setOpenCheckoutbid(false)}>x</button>
							<div className='heading'>
									<h3>Place a Bid</h3>
							</div>
							<p>
								You are about to purchase a <span className="bold">AnimeSailorClub #304</span> 
								<span className="bold"> from Monica Lucas</span>
							</p>
							<div className='detailcheckout mt-4'>
								<div className='listcheckout'>
									<h6>Your bid (ETH)</h6>
									<input type="text" className="form-control" style={inputColorStyle} />
								</div>
							</div>
							<div className='detailcheckout mt-3'>
								<div className='listcheckout'>
									<h6>
										Enter quantity. <span className="color">10 available</span>
									</h6>
									<input type="text" name="buy_now_qty" id="buy_now_qty" className="form-control" style={inputColorStyle} />
								</div>
							</div>
							<div className='heading mt-3'>
								<p>Your balance</p>
								<div className='subtotal'>
									10.67856 ETH
								</div>
							</div>
							<div className='heading'>
								<p>Service fee 2.5%</p>
								<div className='subtotal'>
									0.00325 ETH
								</div>
							</div>
							<div className='heading'>
								<p>You will pay</p>
								<div className='subtotal'>
									0.013325 ETH
								</div>
							</div>
								<button className='btn-main lead mb-5'>Checkout</button>
						</div>
					</div>
				}
			</div>
    );
}

export default memo(ItemDetail);