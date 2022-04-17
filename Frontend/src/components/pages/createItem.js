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

  const { marketAddress, contractABI, corsacTokenAddress, corsacTokenABI } = useMoralisDapp();
  const Web3Api = useMoralisWeb3Api();
  const { account, Moralis } = useMoralis();
  const { saveFile, moralisFile } = useMoralisFile();
  const { chainId } = useChain();

  const imgInput = useRef(null);
  const [image, setImage] = useState({ preview: '', data: '' });
  const [collections, setCollections] = useState([]);
  const [collection, setCollection] = useState([]);
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [royalty, setRoyalty] = useState(0);
  const [loading, setLoading] = useState(false);

  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [openModal, setopenModal] = useState(false);

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

  const handleCreateItem = async (e) => {
    //check form data
    e.preventDefault();
    if (account == '') {
      setModalTitle('Error');
      setModalMessage("Please connect your wallet");
      setopenModal(true);
      return;
    }
    if (image.preview == '') {
      setModalTitle('Error');
      setModalMessage("Choose one image for your item");
      setopenModal(true);
      return;
    }
    if (collection.value == undefined || collection.value == '') {
      setModalTitle('Error');
      setModalMessage("Choose collection for your item");
      setopenModal(true);
      return;
    }
    if (itemName == '') {
      setModalTitle('Error');
      setModalMessage("Enter name for your item");
      setopenModal(true);
      return;
    }
    if (parseInt(royalty) < 0 || parseInt(royalty) > 40) {
      setModalTitle('Error');
      setModalMessage("Enter royalty for your item (max 40%)");
      setopenModal(true);
      return;
    }

    //save image to ipfs using moralis
    const metadata = {
      "name": itemName,
      "description": description,
      "collection": collection
    };
    const file = new Moralis.File("file.json", {base64: btoa(JSON.stringify(metadata))});
    // const file = new Moralis.File(image.data.name, image.data);
    await file.saveIPFS();
    console.log(file.ipfs(), file.hash());
    // let fileIpfs = await saveFile(image.data.name, image.data, { saveIPFS: true });
    // console.log(fileIpfs);

    //check if collection name exists
    // if (isExistCollection() === true) {
    //   setModalTitle('Error');
    //   setModalMessage("Collection name was duplicated!");
    //   setopenModal(true);
    //   return;
    // }

    //create and save collection into db
    // let formData = new FormData();
    // formData.append('walletAddr', account.toLowerCase());
    // formData.append('collectionType', collectionType);
    // formData.append('title', title);
    // formData.append('symbol', symbol);
    // formData.append('url', url);
    // formData.append('category', category.value);
    // formData.append('description', description);
    // formData.append('file', image.data);
    // try {
    //   setLoading(true);
    //   const res = await axios.post(`${process.env.REACT_APP_SERVER_URL}/api/collection/create`, formData);
    //   setLoading(false);

    //   if (res) {
    //     if (res.data.type === 'error') {
    //       setModalTitle('Error');
    //     } else {
    //       setModalTitle('Success');
    //     }
    //     setModalMessage(res.data.message);
    //     setopenModal(true);
    //   }
    // } catch(ex) {
    //   console.log(ex);
    //   setModalTitle('Error');
    //   setModalMessage(ex.message);
    //   setopenModal(true);
    //   return;
    // }
    // navigate("/");
  }

  const closeModal = () => {
    setopenModal(false);
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
          myCollections.push({value: c._id, label: c.title});
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