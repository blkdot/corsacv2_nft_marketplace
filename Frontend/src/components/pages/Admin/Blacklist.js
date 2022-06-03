import React, { memo, useEffect, useState, useRef } from "react";
import { useSelector } from 'react-redux';
import * as selectors from '../../../store/selectors';
import Footer from '../../components/footer';
import { navigate } from '@reach/router';
import { useMoralis } from "react-moralis";

//IMPORT DYNAMIC STYLED COMPONENT
import { StyledHeader } from '../../Styles';

import { Spin, Modal, Table, Space, Input } from "antd";
import styled from 'styled-components';
import { addActivity, getAllItems, getUserInfo, getFileTypeFromURL, updateBlacklist } from "../../../utils";
import BlacklistItem from "../../components/Admin/BlacklistItem";

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
const StyledTable = styled(Table)`
  .ant-table-tbody > tr.ant-table-row:hover > td,
  .ant-table-tbody > tr > td.ant-table-cell-row-hover {
    cursor: pointer;
  }
`
//SWITCH VARIABLE FOR PAGE STYLE
const theme = 'GREY'; //LIGHT, GREY, RETRO

const Blacklist = () => {
  const { account, isAuthenticated, Moralis } = useMoralis();
  
  const currentUserState = useSelector(selectors.currentUserState);

  const [openMenu, setOpenMenu] = React.useState(true);
  const [openMenu1, setOpenMenu1] = React.useState(false);
  const handleBtnClick = () => {
    setItem(null);

    setOpenMenu(!openMenu);
    setOpenMenu1(false);
    document.getElementById("Mainbtn").classList.add("active");
    document.getElementById("Mainbtn1").classList.remove("active");
  };
  const handleBtnClick1 = () => {
    setItem(null);

    setOpenMenu1(!openMenu1);
    setOpenMenu(false);
    document.getElementById("Mainbtn1").classList.add("active");
    document.getElementById("Mainbtn").classList.remove("active");
  };

  const columns = [
    {title: 'Type', dataIndex: 'type', key: 'type', responsive: ['md'],},
    {title: 'Name', dataIndex: 'name', key: 'name', sortDirections: ['ascend', 'descend'], 
      sorter: function(a, b) {
        const nameA = a.name.toUpperCase(); // ignore upper and lowercase
        const nameB = b.name.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // names must be equal
        return 0;
      },
    },
    {title: 'Collection', dataIndex: 'collection', key: 'collection', responsive: ['md'], sortDirections: ['ascend', 'descend'], 
      sorter: function(a, b) {
        const nameA = a.collection.toUpperCase(); // ignore upper and lowercase
        const nameB = b.collection.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // names must be equal
        return 0;
      },
    },
    {title: 'Token ID', dataIndex: 'tokenId', key: 'tokenId', responsive: ['md'],},
    {
      title: 'Status',
      key: 'status',
      render: (text, record) => (
        <Space size="middle">
          <span style={record.blocked ? {color: "#FF343F"} : {}}>{record.blocked ? 'Blocked' : ''}</span>
        </Space>
      ),
    },
  ];

  const [allItems, setAllItems] = useState([]);
  const [blacklist, setBlacklist] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [filteredBlacklist, setFilteredBlacklist] = useState([]);

  const [sValItems, setSValItems] = useState('');
  const [sValBlacklist, setSValBlacklist] = useState('');
  const [item, setItem] = useState(null);

  const [loading, setLoading] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [openModal, setOpenModal] = useState(false);

  const closeModal = () => {
    setOpenModal(false);
    setModalTitle('');
    setModalMessage('');
  }

  const searchItems = (value) => {
    const currValue = value;
    setSValItems(currValue);

    const filteredData = allItems.filter(item => item.name.toLowerCase().includes(currValue.toLowerCase()));
    setFilteredItems(filteredData);
  }

  const searchBlacklist = (value) => {
    const currValue = value;
    setSValBlacklist(currValue);

    const filteredData = blacklist.filter(item => item.name.toLowerCase().includes(currValue.toLowerCase()));
    setFilteredBlacklist(filteredData);
  }

  const selectItem = async (record) => {
    setLoading(true);

    const options = {
      chain: process.env.REACT_APP_CHAIN_ID,
      address: record.collectionAddr,
      token_id: record.tokenId,
    };

    const result = await Moralis.Web3API.token.getTokenIdMetadata(options);
    let nft = result;

    //get metadata
    if (nft.metadata) {
      if (typeof nft.metadata === "string") {
        nft.metadata = JSON.parse(nft.metadata);
      } else {
        nft.metadata = nft.metadata;
      }
    } else if (nft.token_uri) {
      const response = await fetch(nft.token_uri);
      nft.metadata = await response.json();
    } else {
      nft.metadata = null;
    }

    nft.author = await getUserInfo(nft.owner_of.toLowerCase());
    nft.creator = await getUserInfo(nft.metadata.creator);

    nft.id = record.id;
    nft.type = record.type;
    nft.name = record.name;
    nft.collection = record.collection;
    nft.collectionAddr = record.collectionAddr;
    nft.tokenId = record.tokenId;
    nft.blocked = record.blocked;

    //get item type
    let file = null;
    if (nft.image) {
      file = await getFileTypeFromURL(nft.image);
    } else if (nft.metadata && nft.metadata.image) {
      file = await getFileTypeFromURL(nft.metadata.image);
    } else {
      file = {mimeType: 'image', fileType: 'image'};
    }
    nft.item_type = file.fileType;
    nft.mime_type = file.mimeType;

    setItem(nft);
    setLoading(false);
  }

  const handleBlacklist = async (item, blocked) => {
    setLoading(true);

    const res = await updateBlacklist(item.id, blocked);
    
    if (res.data.updated) {
      //save activity
      const aRes = await addActivity({
        actor: account.toLowerCase(),
        actionType: 0,
        description: `Administrator ${blocked === 1 ? 'blocked' : 'unblocked'} item - "${item.name}".`,
        from: item.author ? item.author.walletAddr.toLowerCase() : '',
        collectionAddr: item.collectionAddr.toLowerCase(),
        tokenId: item.tokenId
      });

      //reset items
      const items = JSON.parse(JSON.stringify(allItems));
      for (let e of items) {
        if (e.id === item.id) {
          e.blocked = blocked;
          break;
        }
      }

      const bl = items.filter(item => item.blocked == 1);

      const filteredItemsData = items.filter(item => item.name.toLowerCase().includes(sValItems.toLowerCase()));
      const filteredBlacklistData = bl.filter(item => item.name.toLowerCase().includes(sValBlacklist.toLowerCase()));

      item.blocked = blocked;
      setItem(item);
      
      setAllItems(items);
      setFilteredItems(filteredItemsData);

      setBlacklist(bl);
      setFilteredBlacklist(filteredBlacklistData);

      setLoading(false);

      setOpenModal(true);
      setModalTitle('Success');
      setModalMessage(`Item(${item.name}) was ${blocked === 1 ? 'blocked' : 'unblocked'} successfully!`);
    } else {
      setLoading(false);

      setOpenModal(true);
      setModalTitle('Error');
      setModalMessage('Error occurs while handling blacklist');
    }
  }

  useEffect(() => {
    async function getData() {
      setLoading(true);

      const items = await getAllItems();

      setAllItems(items);
      setFilteredItems(items);

      setBlacklist(items.filter(item => item.blocked === 1));
      setFilteredBlacklist(items.filter(item => item.blocked === 1));

      setLoading(false);
    }

    if (!account || !isAuthenticated || !currentUserState.data || !currentUserState.data.isAdmin) {
      navigate("/wallet");
    } else {
      getData(); 
    }
  }, [account, isAuthenticated, currentUserState.data]);
  
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

      <section className='jumbotron breadcumb no-bg'
              style={{backgroundImage: `url(${currentUserState && currentUserState.data && currentUserState.data.banner ? currentUserState.data.banner : ''})`}}>
        <div className='mainbreadcumb'>
          <div className='container'>
            <div className='row m-10-hor'>
              <div className='col-12'>
                <h1 className='text-center'>Blacklist</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='container'>
        <div className='row'>
          <div className="col-lg-7 col-md-6 col-sm-6 col-xs-12 mb-5">
            <div className='col-lg-12'>
                <div className="items_filter">
                  <ul className="de_nav">
                    <li id='Mainbtn' className="active"><span onClick={handleBtnClick}>All</span></li>
                    <li id='Mainbtn1' className=""><span onClick={handleBtnClick1}>Blacklist</span></li>
                  </ul>
              </div>
            </div>
            {openMenu && (  
              <div id='zero1' className='onStep fadeIn'>
                <div className="field-set">
                  <Input id="s_val_items" className="mt-4 mb-4" placeholder="Enter item name" defaultValue={sValItems} onChange={(e) => searchItems(e.target.value)} />
                  <StyledTable id="t_items" columns={columns} dataSource={filteredItems} 
                    onRow={(record, rowIndex) => {
                      return {
                        onClick: event => selectItem(record), // click row
                        onDoubleClick: event => {}, // double click row
                        onContextMenu: event => {}, // right button click row
                        onMouseEnter: event => {}, // mouse enter row
                        onMouseLeave: event => {}, // mouse leave row
                      };
                    }}
                  />
                </div>
              </div>
            )}
            {openMenu1 && (  
              <div id='zero2' className='onStep fadeIn'>
                <div className="field-set">
                  <Input id="s_val_blacklist" className="mt-4 mb-4" placeholder="Enter item name" defaultValue={sValBlacklist} onChange={(e) => searchBlacklist(e.target.value)} />
                  <StyledTable id="t_blacklist" columns={columns} dataSource={filteredBlacklist} 
                    onRow={(record, rowIndex) => {
                      return {
                        onClick: event => selectItem(record), // click row
                        onDoubleClick: event => {}, // double click row
                        onContextMenu: event => {}, // right button click row
                        onMouseEnter: event => {}, // mouse enter row
                        onMouseLeave: event => {}, // mouse leave row
                      };
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="col-lg-5 col-md-6 col-sm-6 col-xs-12 ">
            <BlacklistItem item={item} handleBlacklist={handleBlacklist} />
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

export default memo(Blacklist);