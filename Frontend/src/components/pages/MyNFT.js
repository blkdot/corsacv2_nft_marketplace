import React, { memo, useEffect, useState } from "react";
import {useMoralis, useNFTBalances, useWeb3ExecuteFunction} from "react-moralis";
import { useSelector, useDispatch } from 'react-redux';
import * as selectors from '../../store/selectors';
import MyNFTBalance from '../components/MyNFTBalance';
import MyNFTBalanceOnSale from '../components/MyNFTBalanceOnSale';
import Footer from '../components/footer';
import api from "../../core/api";

import {useMoralisDapp} from "../../providers/MoralisDappProvider/MoralisDappProvider";
import {CopyToClipboard} from 'react-copy-to-clipboard';

//IMPORT DYNAMIC STYLED COMPONENT
import { StyledHeader } from '../Styles';
import { navigate } from "@reach/router";
//SWITCH VARIABLE FOR PAGE STYLE
const theme = 'GREY'; //LIGHT, GREY, RETRO

const MyNFT = function({ collectionId = 1 }) {
  const currentUserState = useSelector(selectors.currentUserState);

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

  const defaultAvatar = api.baseUrl + '/uploads/thumbnail_author_4_623046d09c.jpg';
  const defaultBanner = api.baseUrl + '/uploads/medium_2_770d4f4fa5.jpg';

  const {account} = useMoralis();
  const [copied, setCopied] = useState(false);
  const {marketAddress, contractABI} = useMoralisDapp();
  const contractProcessor = useWeb3ExecuteFunction();
  const listItemFunction = "createSale";
  const { isWeb3Enabled, enableWeb3, isAuthenticated, isWeb3EnableLoading } = useMoralis();
  const inputColorStyle = {
    color: '#111'
  };

  useEffect(() => {
    const connectorId = window.localStorage.getItem("connectorId");
    if (!isAuthenticated) 
      navigate('/');
  }, []);
  
  return (
    <div className="greyscheme">
      <StyledHeader theme={theme} />
      
      <section id='profile_banner' 
              className='jumbotron breadcumb no-bg' 
              style={{backgroundImage: `url(${currentUserState && currentUserState.data && currentUserState.data.banner ? `${process.env.REACT_APP_SERVER_URL}/${currentUserState.data.banner}` : defaultBanner})`}}>
        <div className='mainbreadcumb'>
        </div>
      </section>
      
      <section className='container d_coll no-top no-bottom'>
        <div className='row'>
          <div className="col-md-12">
            <div className="d_profile">
                <div className="profile_avatar">
                  <div className="d_profile_img">
                    <img src={currentUserState && currentUserState.data && currentUserState.data.avatar ? `${process.env.REACT_APP_SERVER_URL}/${currentUserState.data.avatar}` : defaultAvatar}
                    alt=""/>
                    <i className="fa fa-check"></i>
                  </div>
                
                  <div className="profile_name">
                    <h4>
                      My NFTs
                        <div className="clearfix"></div>
                        <span id="wallet" className="profile_wallet">{ account }</span>
                        <CopyToClipboard text={account} onCopy={() => setCopied(true)}>
                          <button id="btn_copy" title="Copy Address" style={inputColorStyle}>Copy</button>
                        </CopyToClipboard>
                    </h4>
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
                    {/* <li id='Mainbtn' className="active"><span onClick={handleBtnClick}>Owned</span></li> */}
                    {/* <li id='Mainbtn1' className=""><span onClick={handleBtnClick1}>On Sale</span></li> */}
                </ul>
            </div>
          </div>
        </div>
        
        {openMenu && (  
          <div id='zero1' className='onStep fadeIn'>
            <MyNFTBalance showLoadMore={false} />
          </div>
        )}
        {openMenu1 && ( 
          <div id='zero2' className='onStep fadeIn'>
            <MyNFTBalanceOnSale showLoadMore={false} />
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
export default memo(MyNFT);