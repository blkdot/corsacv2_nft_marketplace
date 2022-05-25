import React, { memo, useEffect, useState } from "react";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";
import Footer from '../components/footer';
import { defaultAvatar, defaultBanner } from "../components/constants"; 

import { useMoralisDapp } from "../../providers/MoralisDappProvider/MoralisDappProvider";
import { CopyToClipboard } from 'react-copy-to-clipboard';

//IMPORT DYNAMIC STYLED COMPONENT
import { StyledHeader } from '../Styles';
import { navigate, useParams } from "@reach/router";
import { getFileTypeFromURL, formatAddress, formatUserName, getAllCollection, getPayments, getUserInfo, getFavoriteCount, getBlacklist } from "../../utils";
import BigNumber from "bignumber.js";
import { Spin, Modal } from "antd";
import styled from 'styled-components';
import NftCard from "../components/NftCard";

//SWITCH VARIABLE FOR PAGE STYLE
const theme = 'GREY'; //LIGHT, GREY, RETRO

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

const Outer = styled.div`
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 8px;
`

const Author = () => {
  const params = useParams();
  
  const [openMenu, setOpenMenu] = React.useState(true);
  const [openMenu1, setOpenMenu1] = React.useState(false);
  const handleBtnClick = () => {
    setOpenMenu(!openMenu);
    setOpenMenu1(false);
    document.getElementById("Mainbtn").classList.add("active");
    document.getElementById("Mainbtn1").classList.remove("active");
  };
  const handleBtnClick1 = () => {
    setOpenMenu1(!openMenu1);
    setOpenMenu(false);
    document.getElementById("Mainbtn1").classList.add("active");
    document.getElementById("Mainbtn").classList.remove("active");
  };

  const [isLoading, setIsLoading] = useState(true);
  const [author, setAuthor] = useState(null);
  const [nfts, setNFTs] = useState([]);
  const [saleNFTs, setSaleNFTs] = useState([]);
  const {account} = useMoralis();
  const [copied, setCopied] = useState(false);
  const {marketAddress, contractABI} = useMoralisDapp();
  const { Moralis, isInitialized, isAuthenticated } = useMoralis();
  const Web3Api = useMoralisWeb3Api();

  const [clockTop, setClockTop] = useState(true);

  const handleItemClick = (nft) => {
    navigate(`/collection/${nft.token_address}/${nft.token_id ? nft.token_id : nft.tokenId}/${nft.author ? nft.author.walletAddr : ''}`);
  };
    
  const inputColorStyle = {
    color: '#111'
  };

  useEffect(() => {
    async function getBaseData() {
      if (!isInitialized || !Moralis.Web3API) {
				const APP_ID = process.env.REACT_APP_MORALIS_APPLICATION_ID;
				const SERVER_URL = process.env.REACT_APP_MORALIS_SERVER_URL;

				Moralis.start({
					serverUrl: SERVER_URL,
					appId: APP_ID
				});
			}

      setIsLoading(true);

      //get blacklist
      const blacklist = await getBlacklist();

      //get sales
      let saleItems = [];
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

      saleItems = await Moralis.Web3API.native.runContractFunction(ops);
      
      let author = await getUserInfo(params.walletAddr);
      const collections = await getAllCollection();
      const payments = await getPayments();
            
      if (!author) {
        author = {};
        author.walletAddr = params.walletAddr;
      }

      //get all nfts from user wallet address
      const options = {
        chain: process.env.REACT_APP_CHAIN_ID,
        address: params.walletAddr,
      };

      let result = null;
      try {
        result = await Web3Api.account.getNFTs(options);
      } catch (e) {
        console.log(e);
      }
      
      const items = result && result.result ? result.result : [];
      const nfts = [];
      const saleNFTs = [];
      for (let item of items) {
        const cs = collections.filter((c, index) => {
          return c.collectionAddr.toLowerCase() === item.token_address.toLowerCase();
        });

        if (cs.length === 0) {
          continue;
        }

        //check if item is on sale
        const sales = saleItems.filter((sale, index) => {
          return sale[3].toLowerCase() === item.token_address.toLowerCase() && 
            parseInt(sale[4]) === parseInt(item.token_id) && 
            sale[2].toLowerCase() === (item.owner_of ? item.owner_of.toLowerCase() : sale[2].toLowerCase());
        });
        if (sales.length > 0) {
          const sale = sales[0];

          item.saleAmount = parseInt(sale[5]);
          item.saleBalance = parseInt(sale[13]);

          item.payment = payments[sale[6]];
          item.price = new BigNumber(sale[7]).dividedBy(new BigNumber(10).pow(item.payment.decimals)).toNumber();

          switch (parseInt(sale[8])) {
            case 0x00:
              item.onSale = true;
              item.onAuction = false;
              item.onOffer = false;

              break;
            case 0x01:
              item.onSale = false;
              item.onAuction = true;
              item.onOffer = false;
              item.endTime = parseInt(sale[10]);

              break;
            case 0x02:
              item.onSale = false;
              item.onAuction = false;
              item.onOffer = true;

              break;
            default:
              item.onSale = false;
              item.onAuction = false;
              item.onOffer = false;
          }
        } else {
          item.onSale = false;
          item.onAuction = false;
          item.onOffer = false;
        }

        //parse metadata
        if (item.metadata) {
          if (typeof item.metadata === "string") {
            item.metadata = JSON.parse(item.metadata);
          }
        } else if (item.token_uri) {
          const response = await fetch(item.token_uri);
          item.metadata = await response.json();
        } else {
          item.metadata = null;
        }

        //get author and creator
        item.author = author;
        item.author = author && author ? item.author : null;
        if (isAuthenticated && account) {
          item.isOWner = author.walletAddr.toLowerCase() === item.owner_of.toLowerCase();
        }

        //get item type
        let file = null;
        if (item.image) {
          file = await getFileTypeFromURL(item.image);
        } else if (item.metadata && item.metadata.image) {
          file = await getFileTypeFromURL(item.metadata.image);
        } else {
          file = {mimeType: 'image', fileType: 'image'};
        }
        item.item_type = file.fileType;
        item.mime_type = file.mimeType;

        //get favorites
        try {
          const favorites = await getFavoriteCount(item.token_address, item.token_id, account ? account : null);
          item.likes = favorites.count;
          item.liked = favorites.liked;
        } catch (e) {
          console.log(e);
          item.likes = 0;
          item.liked = false;
        }

        //isBlocked
        const bl = blacklist.filter(nft =>  {
          return nft.collectionAddr.toLowerCase() === item.token_address.toLowerCase() && 
            parseInt(nft.tokenId) === parseInt(item.token_id);
        });
        if (bl.length > 0) {
          item.blocked = 1;
        } else {
          item.blocked = 0;
        }

        nfts.push(item);

        if (item.onSale || item.onAuction || item.onOffer) {
          saleNFTs.push(item);
        }
      }

      setNFTs(nfts);
      setAuthor(author);
      setSaleNFTs(saleNFTs);

      setIsLoading(false);
    }
    
    if (!params.walletAddr) {
      navigate("/");
    }

    getBaseData();
  }, []);
  
  return (
    <div className="greyscheme">
      <StyledHeader theme={theme} />

      <StyledModal
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
      
      <section id='profile_banner' 
              className='jumbotron breadcumb no-bg' 
              style={{backgroundImage: `url(${author && author.banner ? author.banner : defaultBanner})`}}>
        <div className='mainbreadcumb'>
        </div>
      </section>

      <section className='container d_coll no-top no-bottom'>
        <div className='row'>
          <div className="col-md-12">
            <div className="d_profile">
              <div className="profile_avatar">
                <div className="d_profile_img">
                  <img src={author && author.avatar ? author.avatar : defaultAvatar}
                  alt=""/>
                  <i className="fa fa-check"></i>
                </div>
              
                <div className="profile_name">
                  <h4>
                    {author && author.name ? formatUserName(author.name) : author ? formatAddress(author.walletAddr, 'wallet') : ''}
                    <div className="clearfix"></div>
                    <span id="wallet" className="profile_wallet">{author && author.walletAddr ? author.walletAddr : ''}</span>
                    <CopyToClipboard text={author && author.walletAddr ? author.walletAddr : ''} onCopy={() => setCopied(true)}>
                      <button id="btn_copy" title="Copy Address" style={inputColorStyle}>Copy</button>
                    </CopyToClipboard>
                  </h4>
                  <div className="user_info">
                    <p>{author && author.about ? author.about : ''}</p>
                  </div>
                  <div style={{textAlign: 'center', display: 'flex', justifyContent: 'center'}}>
                    <button type="button" className="btn-main" style={{marginRight: "10px"}}>Follow</button>
                    <button type="button" className="btn-main">Report</button>
                  </div>
                </div>
              </div>
              <div className="de-flex" style={{justifyContent: 'center'}}>
                <div className="de-flex-col mt-4">
                  <div className="social-icons">
                    { author && author.twitter &&
                    <span style={{cursor: 'pointer', marginRight: '10px', border: '1px solid #727272', padding: '10px', borderRadius: '50%'}} onClick={()=> window.open(`https://twitter.com/${author.twitter}`, "_self")}>
                      <i className="fa fa-twitter fa-lg"></i>
                    </span>
                    }
                    { author && author.instagram &&
                    <span style={{cursor: 'pointer', marginRight: '10px', border: '1px solid #727272', padding: '10px', borderRadius: '50%'}} onClick={()=> window.open(`https://instagram.com/${author.instagram}`, "_self")}>
                      <i className="fa fa-instagram fa-lg"></i>
                    </span>
                    }
                    { author && author.youtube &&
                    <span style={{cursor: 'pointer', marginRight: '10px', border: '1px solid #727272', padding: '10px', borderRadius: '50%'}} onClick={()=> window.open(`https://www.youtube.com/${author.youtube}`, "_self")}>
                      <i className="fa fa-youtube fa-lg"></i>
                    </span>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className='container no-top'>
        <div className='row'>
          <div className='col-lg-12'>
              <div className="items_filter">
                <ul className="de_nav">
                  <li id='Mainbtn' className="active"><span onClick={handleBtnClick}>Owned</span></li>
                  <li id='Mainbtn1' className=""><span onClick={handleBtnClick1}>On Sale</span></li>
                </ul>
            </div>
          </div>
        </div>
        
        {openMenu && (  
          <div id='zero1' className='onStep fadeIn'>
            <div className='row'>
            {!isLoading && nfts && nfts.map((nft, index) => (
              <NftCard
                nft={nft}
                className={"d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4"}
                handleItemClick={handleItemClick}
                key={index}
                clockTop={clockTop}
              />
            ))}
            </div>
          </div>
        )}
        {openMenu1 && ( 
          <div id='zero2' className='onStep fadeIn'>
            <div className='row'>
            {!isLoading && saleNFTs && saleNFTs.map((nft, index) => (
              <NftCard
                nft={nft}
                className={"d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4"}
                handleItemClick={handleItemClick}
                key={index}
                clockTop={clockTop}
              />
            ))}
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
export default memo(Author);