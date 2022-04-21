import React, { memo, useEffect, useState } from "react";
import {useChain, useMoralis, useNFTBalances, useMoralisWeb3Api, useWeb3ExecuteFunction} from "react-moralis";
import Footer from '../components/footer';
import * as selectors from '../../store/selectors';
import { fetchHotCollections, setNFTBalances } from "../../store/actions/thunks";
import api from "../../core/api";

import {useMoralisDapp} from "../../providers/MoralisDappProvider/MoralisDappProvider";
import {CopyToClipboard} from 'react-copy-to-clipboard';

import axios from "axios";

//IMPORT DYNAMIC STYLED COMPONENT
import { StyledHeader } from '../Styles';
import { navigate, useParams } from "@reach/router";

import { Spin, Modal } from "antd";
import styled from 'styled-components';

import moment from "moment";
import BigNumber from "bignumber.js";

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
  const routerParams = useParams();

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

  const fallbackImg =
    "data:image/png;base64,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";

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
    let apiUrl = null;
    let apiParams = {};
    if (props.user && props.user === "me") {
      if (!isAuthenticated || !account) {
        navigate('/');
      }
      
      setPageTitle("My Collections");
      apiUrl = `${process.env.REACT_APP_SERVER_URL}/api/collection`;
      apiParams.walletAddr = account ? account.toLowerCase() : '';
    } else {
      apiUrl = `${process.env.REACT_APP_SERVER_URL}/api/collection/all`;
    }
    
    setOpenModal(false);
    setLoading(true);
    const isWeb3Active = Moralis.ensureWeb3IsInstalled();
    if (!isWeb3Active) {
      await Moralis.enableWeb3();
    }
    const ops = {
      contractAddress: marketAddress,
      functionName: "getCollections",
      abi: contractABI,
      params: {}
    };
    await contractProcessor.fetch({
      params: ops,
      onSuccess: async (chainCollections) => {
        console.log("success:getCollections");
        console.log(chainCollections);
        await axios.get(apiUrl, {
          headers: {
            'Content-Type': 'application/json',
          },
          params: apiParams
        }).then(async res => {
          let cs = [];
          console.log(res.data.collections);
          for (let c of chainCollections) {
            const dcs = res.data.collections.filter((e, index) => {
              return e.collectionAddr.toLowerCase() == c.toLowerCase() && e.created === 1;
            });

            if (dcs.length > 0) {
              cs.push(dcs[0]);
            } else {
              if (props.user && props.user === "me") {
                continue;
              }

              const options = {
                address: c,
                chain: chainId,
              };
              const NFTs = await Web3Api.token.getAllTokenIds(options);
              console.log("NFTs:", NFTs);
              if (NFTs.result.length > 0) {
                const nft = NFTs.result[0];
                if (nft.image) {
                  cs.push({
                    collectionAddr: c,
                    title: nft.name ? nft.name : 'Unknown',
                    symbol: nft.symbol ? nft.symbol : 'Unknown',
                    image: nft.image
                  });
                  continue;
                }
                if (nft.metadata) {
                  if (nft.metadata.image) {
                    cs.push({
                      collectionAddr: c,
                      title: nft.name ? nft.name : nft.metadata.name,
                      symbol: nft.symbol ? nft.symbol : nft.metadata.symbol,
                      image: nft.metadata.image
                    });
                    continue;
                  }
                }
                if (nft.token_uri) {
                  const response = await fetch(nft.token_uri);
                  const metadata = await response.json();
                  if (metadata.image) {
                    cs.push({
                      collectionAddr: c,
                      title: nft.name ? nft.name : metadata.name,
                      symbol: nft.symbol ? nft.symbol : metadata.symbol,
                      image: metadata.image
                    });
                    continue;
                  }
                }
                cs.push({
                  collectionAddr: c,
                  title: nft.name ? nft.name : 'Unknown',
                  symbol: nft.symbol ? nft.symbol : 'Unknown',
                });
              } else {
                cs.push({
                  collectionAddr: c,
                  title: 'Unknown',
                  symbol: 'Unknown'
                });
              }
            }
          }
          console.log("collections:", cs);
          setCollections(cs);
          setLoading(false);
        });
      },
      onError: (error) => {
        console.log("failed:getCollections", error);
        setLoading(false);

        setModalTitle('Error');
        if (error.message) {
          setModalMessage(error.message);
        } else {
          setModalMessage(error);
        }
        setOpenModal(true);
        return;
      },
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

      <section className='jumbotron breadcumb no-bg'>
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
                  
                  {/* <div className="author_list_pp">
                      <span onClick={()=> navigateTo(collection.author_link ? collection.author_link : '')}>                                    
                          <img className="lazy" src="" alt=""/>
                          <i className="fa fa-check"></i>
                      </span>
                  </div> */}
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
                      { collection.walletAddr && 
                        <div className="nft__item_price" style={{wordBreak: "break-all"}}>
                          By {collection.walletAddr}
                        </div>
                      }
                      { collection.category && 
                        <div className="nft__item_price">
                          Category: {collection.category}
                        </div>
                      }
                      { collection.timeStamp && 
                        <div className="nft__item_price">
                          Created at {moment(collection.timeStamp * 1000).format('L, LT')}
                        </div>
                      }
                      <div className="nft__item_like">
                          <i className="fa fa-heart"></i><span>{collection.likes ? collection.likes : 0}</span>
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