import React, { memo, useEffect, useState, useRef } from "react";
import Footer from '../components/footer';
import Select from 'react-select';
import axios from "axios";
import moment from "moment";
import { navigate } from '@reach/router';
import { useMoralisDapp } from "../../providers/MoralisDappProvider/MoralisDappProvider";
import { useChain, useMoralisWeb3Api, useMoralis, useMoralisFile, useWeb3ExecuteFunction, useMoralisQuery } from "react-moralis";

//IMPORT DYNAMIC STYLED COMPONENT
import { StyledHeader } from '../Styles';

import { Spin, Modal } from "antd";
import styled from 'styled-components';
import BigNumber from "bignumber.js";

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

const CreateItem = () => {
  const inputColorStyle = {
    color: '#111'
  };

  const defaultValue = {
    value: null,
    label: 'Select Filter'
  };

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

  const contractProcessor = useWeb3ExecuteFunction();
  const { marketAddress, contractABI, corsacTokenAddress, corsacTokenABI } = useMoralisDapp();
  const Web3Api = useMoralisWeb3Api();
  const { account, Moralis } = useMoralis();
  const { saveFile, moralisFile } = useMoralisFile();
  const { chainId } = useChain();

  const imgInput = useRef(null);
  const [image, setImage] = useState({ preview: '', data: '' });
  const [collections, setCollections] = useState([]);
  const [payments, setPayments] = useState([]);
  const [collection, setCollection] = useState(null);
  const [payment, setPayment] = useState(null);
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [royalty, setRoyalty] = useState(0);
  const [loading, setLoading] = useState(false);

  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [openModal, setOpenModal] = useState(false);

  const handleFileChange = (e) => {
    try {
      const img = {
        preview: URL.createObjectURL(e.target.files[0]),
        data: e.target.files[0],
      }
      setImage(img);
    } catch (e) {
      setImage(image);
    }
  };

  const handleImageUpload = () => {
    imgInput.current.click();
  }

  const handleImageRemove = () => {
    setImage({ preview: '', data: '' });
  }

  const handleCollectionChange = (selectedOption) => {
    setCollection(selectedOption);
  };

  const handlePaymentChange = (selectedOption) => {
    setPayment(selectedOption);
  };

  const handleCreateItem = async (e) => {
    //check form data
    e.preventDefault();
    if (account == '') {
      setModalTitle('Error');
      setModalMessage("Please connect your wallet");
      setOpenModal(true);
      return;
    }
    if (image.preview == '') {
      setModalTitle('Error');
      setModalMessage("Choose one image for your item");
      setOpenModal(true);
      return;
    }
    if (collection.value == undefined || collection.value == '') {
      setModalTitle('Error');
      setModalMessage("Choose collection for your item");
      setOpenModal(true);
      return;
    }
    if (payment.value == undefined || payment.value == '') {
      setModalTitle('Error');
      setModalMessage("Choose payment for your item");
      setOpenModal(true);
      return;
    }
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

    setLoading(true);

    //save image and metadata to ipfs using moralis
    const APP_ID = process.env.REACT_APP_MORALIS_APPLICATION_ID;
    const SERVER_URL = process.env.REACT_APP_MORALIS_SERVER_URL;
    const GATEWAY_URL = process.env.REACT_APP_MORALIS_GATEWAY_URL;
    
    Moralis.initialize(APP_ID);
    Moralis.serverURL = SERVER_URL;

    // const file = new Moralis.File(image.data.name, image.data);
    // await file.saveIPFS();
    // console.log(file.ipfs(), file.hash());
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
    // console.log(imageFileIpfs);
    // console.log("imagePath:", GATEWAY_URL + imageFileIpfs.hash());

    const metadata = {
      name: itemName,
      description: description,
      collection: collection,
      image: GATEWAY_URL + imageFileIpfs.hash(),
      payment: payment,
      royalty: royalty
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
    // console.log(metadataFileIpfs);
    
    const metadataUrl = GATEWAY_URL + metadataFileIpfs.hash();
    // console.log("metadataUrl:", metadataUrl);

    // const response = await fetch(metadataUrl);
    // console.log(await response.json());

    //mint NFT
    let ops = {
      contractAddress: marketAddress,
      functionName: "mintTo",
      abi: contractABI,
      params: {
        collectionAddr: collection.addr,
        _to: account,
        uri: metadataUrl
      }
    };
    await contractProcessor.fetch({
      params: ops,
      onSuccess: (result) => {
        console.log("success:mintToByUser");
        setLoading(false);
        navigate('/mynft');
      },
      onError: (error) => {
        console.log("failed:mintToByUser", error);
        setLoading(false);

        setModalTitle('Error');
        if (error.message) {
          setModalMessage(error.message);
        } else {
          setModalMessage(error);
        }
        setOpenModal(true);
      },
    });

    //get token id
    let token_id = null;
    ops.functionName = "getTokenId";
    ops.params = {collectionAddr: collection.addr};
    await contractProcessor.fetch({
      params: ops,
      onSuccess: (result) => {
        console.log("success:getTokenId");
        setLoading(false);
        console.log("getTokenId:", result);
        token_id = new BigNumber(result._hex).toNumber();
      },
      onError: (error) => {
        console.log("failed:getTokenId", error);
        setLoading(false);

        setModalTitle('Error');
        if (error.message) {
          setModalMessage(error.message);
        } else {
          setModalMessage(error);
        }
        setOpenModal(true);
      },
    });

    //save item into db
    let formData = new FormData();
    formData.append('walletAddr', account.toLowerCase());
    formData.append('collection', collection.value);
    formData.append('payment', payment.value);
    formData.append('title', itemName);
    formData.append('description', description);
    formData.append('image', GATEWAY_URL + imageFileIpfs.hash());
    formData.append('royalty', royalty);
    formData.append('timeStamp', Math.floor(new Date().getTime() / 1000));
    try {
      setLoading(true);
      const res = await axios.post(`${process.env.REACT_APP_SERVER_URL}/api/item/create`, formData);
      setLoading(false);

      if (res) {
        if (res.data.type === 'error') {
          setModalTitle('Error');
        } else {
          setModalTitle('Success');
        }
        setModalMessage(res.data.message);
        setOpenModal(true);
      }
    } catch(ex) {
      console.log(ex);
      setModalTitle('Error');
      setModalMessage(ex.message);
      setOpenModal(true);
      return;
    }
    // navigate("/");
    setLoading(false);
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
        const erc721Collections = res.data.collections.filter((c, index) => {
          return c.collectionType === 0;
        });

        let myCollections = [];
        for (let c of erc721Collections) {
          myCollections.push({value: c._id, label: c.title, addr: c.collectionAddr, symbol: c.symbol});
        }
        setCollections(myCollections);
      });
    } catch {
      console.log('error in fetching collections');
    }
  }

  async function getPayments() {
    try {
      await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/payments`, {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          allowed: 1
        }
      }).then(async res => {
        let payments = [];
        for (let p of res.data.payments) {
          payments.push({value: p.id, label: p.title + " (" + p.symbol + ")", addr: p.addr, title: p.title, type: p.type});
        }
        setPayments(payments);
      });
    } catch {
      console.log('error in fetching payments');
    }
  }

  useEffect(() => {
    if (account != undefined && account != '') {
      getCollections();
      getPayments();
    }
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
        <StyledSpin tip="Loading..." size="large" />
        </div>
      </StyledModal>

      <section className='jumbotron breadcumb no-bg'>
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
              <h5>Upload image <span className="text-muted">(Required)</span></h5>
              <div className="d-create-file">
                <p id="file_name">Image for Collection</p>
                <div className='browse'>
                  <input type="button" id="get_file" className="btn-main" value="Browse"/>
                  <input id='upload_file' type="file" ref={imgInput} onChange={handleFileChange} accept="image/*" />
                </div>
              </div>

              <div className="spacer-single"></div>

              <h5>Choose collection <span className="text-muted">(Required)</span></h5>
              <Select 
                  styles={customStyles}
                  options={[defaultValue, ...collections]}
                  onChange={handleCollectionChange}
              />
              
              <div className="spacer-30"></div>

              <h5>Choose payment <span className="text-muted">(Required)</span></h5>
              <Select 
                  styles={customStyles}
                  options={[defaultValue, ...payments]}
                  onChange={handlePaymentChange}
              />
              
              <div className="spacer-30"></div>

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

              <input type="button" id="submit" className="btn-main" value="Create Item" onClick={handleCreateItem}/>
            </div>
          </div>

          <div className="col-lg-3 col-sm-6 col-xs-12">
            <h5>Preview Image</h5>
            <div className="nft__item m-0">
              {image.preview &&
              <>
              <div className="nft__item_wrap" onClick={handleImageUpload}>
                  <span>
                    <img src={image.preview} className="lazy nft__item_preview" alt=""/>
                  </span>
              </div>
              <input type="button" className="btn-main" value="Remove Image" onClick={handleImageRemove}/>
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