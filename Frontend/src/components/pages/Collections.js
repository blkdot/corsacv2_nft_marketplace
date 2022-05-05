import React, { memo, useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import * as selectors from '../../store/selectors';
import {useChain, useMoralis, useMoralisWeb3Api, useWeb3ExecuteFunction} from "react-moralis";
import Footer from '../components/footer';

import {useMoralisDapp} from "../../providers/MoralisDappProvider/MoralisDappProvider";

import axios from "axios";

//IMPORT DYNAMIC STYLED COMPONENT
import { StyledHeader } from '../Styles';
import { navigate } from "@reach/router";

import { Spin, Modal } from "antd";
import styled from 'styled-components';

import moment from "moment";
import { defaultAvatar, fallbackImg } from "../components/constants";
import { formatAddress } from "../../utils";

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
const Collections = props => {
  const currentUserState = useSelector(selectors.currentUserState);

  const { account, Moralis } = useMoralis();
  const { chainId } = useChain();
  const { marketAddress, contractABI } = useMoralisDapp();
  const contractProcessor = useWeb3ExecuteFunction();
  const { isWeb3Enabled, enableWeb3, isAuthenticated, isWeb3EnableLoading } = useMoralis();
  const Web3Api = useMoralisWeb3Api();

  const [collections, setCollections] = useState([]);

  const [pageTitle, setPageTitle] = useState("Collections");

  const [loading, setLoading] = useState(true);
  const [loadingTitle, setLoadingTitle] = useState("Loading...");

  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [openModal, setOpenModal] = useState(false);

  const [height, setHeight] = useState(0);

  const onImgLoad = ({target:img}) => {
    let currentHeight = height;
    if(currentHeight < img.offsetHeight) {
        setHeight(img.offsetHeight);
    }
  }

  const closeModal = () => {
    setOpenModal(false);
    setModalTitle('');
    setModalMessage('');
  }
  
  useEffect(async () => {
    setPageTitle("Collections");

    setOpenModal(false);
    setLoading(true);
    
    //get collections from backend
    await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/collection/all`, {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {}
    }).then(async res => {
      let cs = res.data.collections;
      
      for (let c of cs) {
        const options = {
          address: c.collectionAddr,
          chain: process.env.REACT_APP_CHAIN_ID,
        };
        const NFTs = await Web3Api.token.getAllTokenIds(options);
        c.itemsCount = NFTs.result.length;
        c.url = `/collection/${c.collectionAddr}`;
      }
      
      setCollections(cs);
      setLoading(false);
    }).catch((e) => {
      setLoading(false);

      setOpenModal(false);
      setModalTitle('Error');
      setModalMessage('Error occurs while fetching data from backend');
    });
    
  }, [account]);

  return (
    <div className="greyscheme">
      <StyledHeader theme={theme} />

      <StyledModal
        title=''
        visible={loading}
        centered
        footer={null}
        closable={false}
      >
        <div className="row">
        <StyledSpin tip={loadingTitle} size="large" />
        </div>
      </StyledModal>

      <section className='jumbotron breadcumb no-bg'
              style={{backgroundImage: `url(${currentUserState && currentUserState.data && currentUserState.data.banner ? currentUserState.data.banner : ''})`}}>
        <div className='mainbreadcumb'>
          <div className='container'>
            <div className='row m-10-hor'>
              <div className='col-12'>
                <h1 className='text-center'>{pageTitle}</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='container'>
        <div className="col-md-12">
          <div className="row">
            <div className="d-item col-lg-12 col-md-12 col-sm-12 col-xs-12 mb-4">
              <button id="createButton" className="btn-main" onClick={()=>{navigate("/createCollection")}}>
                Create Collection
              </button>
            </div>
          </div>
          {!loading && collections.length == 0 &&
          <div className="row">
            <div className="alert alert-danger" role="alert">
              No collections
            </div>
          </div>
          }
          <div className="row">
            { collections && collections.map((collection, index) => (
              <div className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4" key={index}>
                <div className="nft__item m-0">
                  { collection.collectionType && collection.collectionType === 1 ? (
                    <div className='icontype'><i className="fa fa-bookmark"></i></div>   
                    ) : (  
                    <div className='icontype'><i className="fa fa-shopping-basket"></i></div>
                    )
                  }
                  <div className="author_list_pp">
                    <span onClick={()=> navigate(collection.creators[0] && collection.creators[0].walletAddr ? '/author/' + collection.creators[0].walletAddr : '')}>
                      <img className="lazy" 
                        src={collection.creators[0] && collection.creators[0].avatar ? collection.creators[0].avatar : defaultAvatar} 
                        title={collection.creators[0] && collection.creators[0].name ? collection.creators[0].name : (collection.creators[0] && collection.creators[0].walletAddr ? formatAddress(collection.creators[0].walletAddr, 'wallet') : 'Unknown')}
                        alt=""/>
                      <i className="fa fa-check"></i>
                    </span>
                  </div>
                  <div className="nft__item_wrap" style={{height: `${height}px`}}>
                    <Outer>
                      <span>
                          <img onLoad={onImgLoad} src={ collection.image ? collection.image : fallbackImg } className="lazy nft__item_preview" alt=""/>
                      </span>
                    </Outer>
                  </div>
                  
                  <div className="nft__item_info">
                      <span onClick={() => collection.url ? navigate(`${collection.url}`) : ''}>
                        <h4>{collection.title} ({collection.symbol})</h4>
                      </span>
                      {/* { collection.walletAddr && 
                        <div className="nft__item_price" style={{wordBreak: "break-all"}}>
                          By {collection.walletAddr}
                        </div>
                      } */}
                      { collection.category && 
                        <div className="nft__item_price">
                          Category: {collection.category}
                        </div>
                      }
                      { collection.itemsCount >= 0 && 
                        <div className="nft__item_price">
                          Items: {collection.itemsCount}
                        </div>
                      }
                      { collection.timeStamp && 
                        <div className="nft__item_price">
                          Created at {moment(collection.timeStamp * 1000).format('L')}
                        </div>
                      }
                      <div className="nft__item_like mb-4">
                      </div>
                  </div> 
                </div>
              </div>
              )
            )}
          </div>
        </div>
      </section>
      <Footer />

      { openModal && 
        <div className='checkout'>
          <div className='maincheckout'>
            <button className='btn-close' onClick={() => closeModal()}>x</button>
            <div className='heading'>
                <h3>{modalTitle}</h3>
            </div>
            <p>
              <span className="bold">{modalMessage}</span>
            </p>
            <button className='btn-main lead mb-5' onClick={() => closeModal()}>Yes</button>
          </div>
        </div>
      }
    </div>
  );
}
export default memo(Collections);