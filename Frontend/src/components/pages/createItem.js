import React, { memo, useEffect, useState, useRef } from "react";
import { useSelector } from 'react-redux';
import * as selectors from '../../store/selectors';
import Footer from '../components/footer';
import Select from 'react-select';
import axios from "axios";
import { navigate } from '@reach/router';
import { useMoralisDapp } from "../../providers/MoralisDappProvider/MoralisDappProvider";
import { useChain, useMoralisWeb3Api, useMoralis, useMoralisFile, useWeb3ExecuteFunction, useMoralisQuery } from "react-moralis";

//IMPORT DYNAMIC STYLED COMPONENT
import { StyledHeader } from '../Styles';

import { Spin, Modal } from "antd";
import styled from 'styled-components';
import BigNumber from "bignumber.js";
import { addItem, audioTypes, getFileTypeFromURL, videoTypes } from "../../utils";
import moment from "moment";

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

const APP_ID = process.env.REACT_APP_MORALIS_APPLICATION_ID;
const SERVER_URL = process.env.REACT_APP_MORALIS_SERVER_URL;
const GATEWAY_URL = process.env.REACT_APP_MORALIS_GATEWAY_URL;

const CreateItem = () => {
  const customStyles = {
    option: (base, state) => ({
      ...base,
      background: "#fff",
      color: "#333",
      borderRadius: state.isFocused ? "0" : 0,
      "&:hover": {
          background: "#eee",
      }
    }),
    menu: base => ({
      ...base,
      borderRadius: 0,
      marginTop: 0
    }),
    menuList: base => ({
      ...base,
      padding: 0
    }),
    control: (base, state) => ({
      ...base,
      padding: 2
    })
  };

  const currentUserState = useSelector(selectors.currentUserState);

  const contractProcessor = useWeb3ExecuteFunction();
  const { marketAddress, contractABI } = useMoralisDapp();
  const { account, Moralis, isAuthenticated } = useMoralis();
  const { saveFile } = useMoralisFile();
  const { chainId } = useChain();

  const imgInput = useRef(null);
  const [image, setImage] = useState({ preview: '', data: '', type: '' });
  const [collections, setCollections] = useState([]);
  const [collection, setCollection] = useState(null);
  const [traits, setTraits] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [royalty, setRoyalty] = useState(0);
  const [copy, setCopy] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingTitle, setLoadingTitle] = useState("Loading...");

  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [openModal, setOpenModal] = useState(false);

  const [height, setHeight] = useState(0);

  const onImgLoad = (e) => {
    let currentHeight = height;
    if(currentHeight < e.target.offsetHeight) {
        setHeight(e.target.offsetHeight);
    }
  }

  const handleFileChange = async (e) => {
    try {
      const file = e.target.files[0];
      let fileType = null;

      if (videoTypes.includes(file.type)) {
        fileType = 'video';
      } else if (audioTypes.includes(file.type)) {
        fileType = 'audio';
      } else {
        fileType = 'image';
      }

      const img = {
        preview: URL.createObjectURL(file),
        data: file,
        type: fileType,
        mime_type: file.type
      }
      setImage(img);
    } catch (e) {
      setImage({ preview: '', data: '', type: '' });
    }
  };

  const handleImageUpload = () => {
    imgInput.current.click();
  }

  const handleImageRemove = () => {
    setImage({ preview: '', data: '', type: '' });
  }

  const handleCollectionChange = (selectedOption) => {
    const ts = [];
    const as = [];
    for (const trait of selectedOption.traits) {
      const vs = [];
      for (const v of trait.values) {
        vs.push({
          type: trait.trait_type,
          value: v,
          label: v
        });
      }
      ts.push({
        type: trait.trait_type,
        values: vs
      });
      as.push({
        trait_type: trait.trait_type,
        value: null
      })
    }
        
    setCollection(selectedOption);
    setTraits(ts);
    setAttributes(as);
    setCopy(1);
  }

  const handleTraitChange = (selectedOption, index) => {
    const list = [...attributes];
    list[index].value = selectedOption.value;
    setAttributes(list);
  }

  const handleCreateItem = async (e) => {
    //check form data
    e.preventDefault();
    if (account == '') {
      setModalTitle('Error');
      setModalMessage("Please connect your wallet");
      setOpenModal(true);
      return;
    }
    if (!image || image.preview == '') {
      setModalTitle('Error');
      setModalMessage("Choose media for your item");
      setOpenModal(true);
      return;
    }
    if (collection && (collection.value === undefined || collection.value === null || collection.value === '')) {
      setModalTitle('Error');
      setModalMessage("Choose collection for your item");
      setOpenModal(true);
      return;
    }
    // if (payment && (payment.value === undefined || payment.value === null || payment.value === '')) {
    //   setModalTitle('Error');
    //   setModalMessage("Choose payment for your item");
    //   setOpenModal(true);
    //   return;
    // }
    if (itemName == '') {
      setModalTitle('Error');
      setModalMessage("Enter name for your item");
      setOpenModal(true);
      return;
    }
    if (parseInt(royalty) < 0 || parseInt(royalty) > 40) {
      setModalTitle('Error');
      setModalMessage("Enter royalty for your item (max 40%)");
      setOpenModal(true);
      return;
    }
    if (copy < 0) {
      setModalTitle('Error');
      setModalMessage("Enter number of copy");
      setOpenModal(true);
      return;
    }

    setLoading(true);

    //save image and metadata to ipfs using moralis
    Moralis.initialize(APP_ID);
    Moralis.serverURL = SERVER_URL;

    let imageFileIpfs = null;
    await saveFile(
      image.data.name, 
      image.data, 
      { 
        saveIPFS: true,
        onSuccess: (result) => {
          imageFileIpfs = result;
        },
        onError: (error) => {
          setLoading(false);

          setModalTitle('Error');
          if (error.message) {
            setModalMessage(error.message);
          } else {
            setModalMessage(error);
          }
          setOpenModal(true);
        }
      }
    );
    
    const metadata = {
      name: itemName,
      description: description,
      collection: collection,
      image: GATEWAY_URL + imageFileIpfs.hash(),
      // payment: payment,
      royalty: royalty * 100,
      creator: account.toLowerCase(),
      attributes: attributes
    };
    let metadataFileIpfs = null;
    await saveFile(
      "metadata.json", 
      {
        base64: btoa(JSON.stringify(metadata))
      }, 
      { 
        type: "base64",
        saveIPFS: true,
        onSuccess: (result) => {
          metadataFileIpfs = result;
        },
        onError: (error) => {
          setLoading(false);

          setModalTitle('Error');
          if (error.message) {
            setModalMessage(error.message);
          } else {
            setModalMessage(error);
          }
          setOpenModal(true);
        }
      }
    );
        
    const metadataUrl = GATEWAY_URL + metadataFileIpfs.hash();
    //mint NFT
    let ops = {
      contractAddress: marketAddress,
      functionName: "mintTo",
      abi: contractABI,
      params: {
        collectionAddr: collection.addr,
        _to: account,
        _uri: metadataUrl,
        _quantity: collection.type === 1 ? Math.floor(copy) : 1
      }
    };
    await contractProcessor.fetch({
      params: ops,
      onSuccess: async (result) => {
        console.log("success:mintTo");
        const tx = await result.wait();
        const event = tx.events?.filter((e) => {return e.event === "MintTo"});
        const token_id = parseInt(event[0].args.tokenId);
        //save item into db
        try {
          const res = await addItem({
            walletAddr: account.toLowerCase(),
            collectionId: collection.value,
            tokenId: token_id,
            title: itemName,
            description: description,
            image: GATEWAY_URL + imageFileIpfs.hash(),
            metadata: metadataUrl,
            royalty: royalty,
            amount: copy,
            creator: account.toLowerCase(),
            attributes: attributes
          });
          
          const options = {
            address: collection.addr,
            token_id: token_id,
            flag: "uri",
            chain: chainId
          };
          const result = await Moralis.Web3API.token.reSyncMetadata(options);
          
          setLoading(false);

          if (res) {
            if (res.data.type === 'error') {
              setModalTitle('Error');
              setModalMessage(res.data.message);
              setOpenModal(true);
            } else {
              setModalTitle('Success');
              setModalMessage(res.data.message);
              setOpenModal(true);

              setTimeout(async () => {
                
                navigate('/collection/' + collection.addr);
              }, 2000);
            }
          }
        } catch(ex) {
          console.log(ex);
          setLoading(false);

          setModalTitle('Error');
          setModalMessage(ex.message);
          setOpenModal(true);
          return;
        }
        // navigate("/");
        setLoading(false);
      },
      onError: (error) => {
        console.log("failed:mintTo", error);
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
  }

  const handleCreateCollection = async (e) => {
    navigate("/createCollection");
  }

  const closeModal = () => {
    setOpenModal(false);
    setModalTitle('');
    setModalMessage('');
  }

  async function getCollections() {
    try {
      await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/collection`, {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          walletAddr: account.toLowerCase()
        }
      }).then(async res => {
        let myCollections = [];
        for (let c of res.data.collections) {
          myCollections.push({
            value: c._id, 
            label: `${c.title} (${c.collectionType === 0 ? 'BEP-721' : c.collectionType === 1 ? 'BEP-1155' : 'Unknown'})`, 
            title: c.title,
            addr: c.collectionAddr, 
            type: c.collectionType,
            symbol: c.symbol,
            category: c.category,
            image: c.image,
            timeStamp: c.timeStamp,
            traits: c.traits
          });
        }
        setCollections(myCollections);
      });
    } catch {
      console.log('error in fetching collections');
    }
  }

  useEffect(() => {
    if (account != undefined && account != '') {
      getCollections();
      // getPayments();
      setLoadingTitle("Creating your item...");
    }
  }, [account]);

  useEffect(() => {
    if (!isAuthenticated || !account) {
      navigate('/wallet');
    }
  }, []);

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
                <h1 className='text-center'>Create Item</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='container'>
        <div className="row">
          <div className="col-lg-7 offset-lg-1 mb-5">
            <div className="field-set">
              <h5>Upload image/video/audio <span className="text-muted">(Required)</span></h5>
              <div className="d-create-file">
                <p id="file_name">Media file for your item</p>
                <div className='browse'>
                  <input type="button" id="get_file" className="btn-main" value="Browse"/>
                  <input id='upload_file' type="file" ref={imgInput} onChange={handleFileChange} accept="image/*, audio/*, video/*" />
                </div>
              </div>

              <div className="spacer-single"></div>

              <h5>
                Choose collection <span className="text-muted">(Required)</span>
                &nbsp;<span aria-hidden="true" className="icon_plus" title="Create New Collection" onClick={handleCreateCollection}></span>
              </h5>
              <Select 
                  styles={customStyles}
                  options={[{value: null, label: "Select Filter", traits: []}, ...collections]}
                  onChange={handleCollectionChange}
              />
              
              <div className="spacer-30"></div>

              {collection && collection.type != null &&
                <>
                  <h5>Collection Information:</h5>
                  <div className="nft__item_price">
                    Title: {collection.title}
                  </div>
                  <div className="nft__item_price">
                    Symbol: {collection.symbol}
                  </div>
                  <div className="nft__item_price">
                    Type: {collection.type === 0 ? 'BEP-721' : collection.type === 1 ? 'BEP-1155' : 'Unknown'}
                  </div>
                  <div className="nft__item_price">
                    Category: {collection.category}
                  </div>
                  <div className="nft__item_price">
                    Created At: {moment(collection.timeStamp * 1000).format('L, LT')}
                  </div>

                  <div className="spacer-30"></div>
                </>
              }
              
              <h5>Item Name <span className="text-muted">(30 available, required)</span></h5>
              <input type="text" 
                    name="item_name" 
                    id="item_name" 
                    className="form-control" 
                    placeholder="Enter item name" 
                    maxLength={30}
                    value={itemName} 
                    onChange={(e) => setItemName(e.target.value)}
                    required
              />

              <div className="spacer-10"></div>

              <h5>Description <span className="text-muted">(Optional)</span></h5>
              <textarea data-autoresize name="item_desc" id="item_desc" className="form-control" placeholder="Tell us something about this item" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>

              <div className="spacer-10"></div>

              <h5>Attributes</h5>
              {traits && traits.map((trait, index) => (
                <div style={{marginLeft: "30px"}} key={index}>
                  <h6>{trait.type} <span className="text-muted">(Optional)</span></h6>
                  <Select 
                      styles={customStyles}
                      options={[{type: trait.type, value: null, label: "Select Filter"}, ...trait.values]}
                      onChange={(e) => handleTraitChange(e, index)}
                  />
                  <div className="spacer-30"></div>
                </div>
              ))}
              {!traits || traits.length === 0 &&
                <>
                  <span className="text-muted">This collection has no traits.</span>
                  <div className="spacer-30"></div>
                </>
              }
              
              <h5>Royalty <span className="text-muted">(Required, Max. 40%)</span></h5>
              <input type="number" 
                    name="royalty" 
                    id="royalty" 
                    className="form-control" 
                    placeholder="Enter your royalty" 
                    value={royalty} 
                    onChange={(e) => setRoyalty(e.target.value)}
                    min={0}
                    max={40}
                    required
              />
              
              <div className="spacer-10"></div>

              {collection && collection.type === 1 &&
                <>
                  <h5>Number of copy <span className="text-muted">(Required)</span></h5>
                  <input type="number" 
                        name="copy" 
                        id="copy" 
                        className="form-control" 
                        placeholder="Enter number of copy" 
                        value={copy} 
                        onChange={(e) => setCopy(e.target.value)}
                        min={1}
                        step={1}
                        required
                  />
                  
                  <div className="spacer-10"></div>
                </>
              }

              <input type="button" id="submit" className="btn-main" value="Create Item" onClick={handleCreateItem}/>
            </div>
          </div>

          <div className="col-lg-3 col-sm-6 col-xs-12">
            <h5>Preview Media</h5>
            <div className="nft__item m-0">
              { image.preview && image.type && 
                <>
                <div className="nft__item_wrap" style={{height: `${height}px`}} onClick={handleImageUpload}>
                  <span>
                  { image.type === 'image' &&
                    <img onLoad={onImgLoad} src={image.preview} className="lazy nft__item_preview" alt=""/>
                  }
                  { image.type === 'video' &&
                    <video onLoadedMetadata={onImgLoad} 
                      width="100%" 
                      height="100%" 
                      controls 
                      className="lazy nft__item_preview"
                      src={image.preview} 
                      type={image.mime_type}
                    >
                  </video>
                  }
                  { image.type === 'audio' &&
                    <audio onLoadedMetadata={onImgLoad} 
                      controls 
                      className="lazy nft__item_preview"
                      src={image.preview} type={image.mime_type}
                    >
                    </audio>
                  }
                  </span>
                </div>
                <input type="button" className="btn-main" value="Remove Media" onClick={handleImageRemove}/>
                </>
              }
            </div>
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

export default memo(CreateItem);