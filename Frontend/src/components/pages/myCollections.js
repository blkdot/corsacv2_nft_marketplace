import React, { memo, useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import * as selectors from '../../store/selectors';
import { useMoralis, useNFTBalances } from "react-moralis";
import Footer from '../components/footer';

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
const MyCollections = props => {
  const currentUserState = useSelector(selectors.currentUserState);
  
  const { account } = useMoralis();
  const { data: NFTBalances, isLoading} = useNFTBalances();

  const [myCollections, setMyCollections] = useState([]);

  const [pageTitle] = useState("My Collections");

  const [loading, setLoading] = useState(false);
  const [loadingTitle] = useState("Loading...");

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

  useEffect(() => {
    if (isLoading) {
      setLoading(true);
    }
  }, [isLoading]);
  
  useEffect(() => {
    async function getMyCollections() {
      setOpenModal(false);
      
      //get collections from backend
      await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/collection`, {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          walletAddr: account.toLowerCase()
        }
      }).then(async res => {
        let collections = res.data.collections;

        for (let c of collections) {
          c.itemsCount = 0;
          c.url = `/collection/${c.collectionAddr}`;
        
          if (NFTBalances && NFTBalances.result && NFTBalances.result.length > 0) {
            for (let nft of NFTBalances.result) {
              if (nft.token_address.toLowerCase() === c.collectionAddr.toLowerCase()) {
                c.itemsCount++;
              }
            }
          }
        }
        
        setMyCollections(collections);
        setLoading(false);
      }).catch((error) => {
        console.log(error);
        setLoading(false);

        setModalTitle('Error');
        setModalMessage('Error occurs while fetching data');
        setOpenModal(true);
      });
    }

    if (account && !isLoading && NFTBalances) {
      getMyCollections();
    }
  }, [account, NFTBalances, isLoading]);

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
          {!loading && myCollections.length === 0 &&
          <div className="row">
            <div className="alert alert-danger" role="alert">
              No collections
            </div>
          </div>
          }
          <div className="row">
            { myCollections && myCollections.map((collection, index) => (
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
                      { collection.collectionType != null && 
                        <div className="nft__item_price">
                          Type: {collection.collectionType === 0 ? 'BEP-721' : collection.collectionType === 1 ? 'BEP-1155' : 'Unknown'}
                        </div>
                      }
                      { collection.category && 
                        <div className="nft__item_price">
                          Category: {collection.category}
                        </div>
                      }
                      { collection.itemsCount >= 0 && 
                        <div className="nft__item_price">
                          Your items: {collection.itemsCount}
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
export default memo(MyCollections);