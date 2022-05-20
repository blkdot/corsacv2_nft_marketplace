import React, { memo, useEffect, useState, useRef } from "react";
import { useSelector } from 'react-redux';
import * as selectors from '../../../store/selectors';
import Footer from '../../components/footer';
import Select from 'react-select';
import axios from "axios";
import { navigate } from '@reach/router';
import { useMoralisDapp } from "../../../providers/MoralisDappProvider/MoralisDappProvider";
import { useMoralis, useMoralisFile, useWeb3ExecuteFunction } from "react-moralis";

//IMPORT DYNAMIC STYLED COMPONENT
import { StyledHeader } from '../../Styles';

import { Spin, Modal, Table, Space, Tag } from "antd";
import styled from 'styled-components';
import { categories } from "../../components/constants/cateogries";
import { addPayment, getPayments, removePayment } from "../../../utils";
import PaymentDetail from "../../components/Admin/PaymentDetail";

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

//Moralis config
const APP_ID = process.env.REACT_APP_MORALIS_APPLICATION_ID;
const SERVER_URL = process.env.REACT_APP_MORALIS_SERVER_URL;
const GATEWAY_URL = process.env.REACT_APP_MORALIS_GATEWAY_URL;

const PaymentSetting = () => {
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

  const currentUserState = useSelector(selectors.currentUserState);
  const { account } = useMoralis();

  const columns = [
    {title: 'ID', dataIndex: 'id', key: 'id', responsive: ['md'],},
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
    {title: 'Symbol', dataIndex: 'symbol', key: 'symbol', responsive: ['md'],},
    {title: 'Decimals', dataIndex: 'decimals', key: 'decimals', responsive: ['md'],},
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        ( record && ![0, 1, 2].includes(record.id) &&
        <Space size="middle">
          <a onClick={() => handleDelete(record)} style={{color: "#FF343F"}}>Delete</a>
        </Space>
        )
      ),
    },
  ];

  const [dataSource, setDataSource] = useState([]);

  const [payment, setPayment] = useState(null);

  const [loading, setLoading] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [openModal, setOpenModal] = useState(false);

  const closeModal = () => {
    setOpenModal(false);
    setModalTitle('');
    setModalMessage('');
  }

  const handleDelete = async (record) => {
    const res = await removePayment(record.addr.toLowerCase());

    if (res.removed) {
      setOpenModal(true);
      setModalTitle('Success');
      setModalMessage(`Token "${record.name}" was removed successfully!`);

      let payments = JSON.parse(JSON.stringify(dataSource));
      payments = payments.filter((p, index) => {
        return p.addr.toLowerCase() !== record.addr.toLowerCase();
      });

      setDataSource(payments);
    } else {
      setOpenModal(true);
      setModalTitle('Error');
      setModalMessage(res.message);
    }
  }

  useEffect(() => {
    async function getPaymentData() {
      const ps = await getPayments();
      let payments = [];
      for (let p of ps) {
        payments.push({
          key: p.value,
          id: p.value,
          type: p.type === 0 ? 'Native' : 'BEP-20',
          name: p.title,
          symbol: p.symbol,
          decimals: p.decimals,
          addr: p.addr
        });
      }

      setDataSource(payments);
    }

    if (!account || !currentUserState.data || !currentUserState.data.isAdmin) {
      navigate("/wallet");
    } else {
      getPaymentData(); 
    }
  }, [account]);

  useEffect(() => {
    async function addTokenToPayments(payment) {
      const ps = dataSource.filter((p, index) => {
        return p.addr.toLowerCase() === payment.addr.toLowerCase();
      });
  
      if (ps.length > 0) {
        setOpenModal(true);
        setModalTitle('Error');
        setModalMessage(`Token "${payment.name}" added already!`);
        return;
      }
  
      const id = Math.max.apply(Math, dataSource.map(p => p.id)) + 1;
      const p = JSON.parse(JSON.stringify(payment));
      const payments = JSON.parse(JSON.stringify(dataSource));
      p.key = id;
      p.id = id;

      const res = await addPayment(p);
      if (res.added) {
        payments.push(p);
        setDataSource(payments);

        setOpenModal(true);
        setModalTitle('Success');
        setModalMessage(`Token "${p.name}" was added successfully!`);
      } else {
        setOpenModal(true);
        setModalTitle('Error');
        setModalMessage(res.message);
      }
    }

    if (payment) {
      addTokenToPayments(payment);
    }
  }, [payment])
  
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
                <h1 className='text-center'>Payment Setting</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='container'>
        <div className="row">
          <div className="col-lg-7 offset-lg-1 mb-5">
            <div className="field-set">
              <Table columns={columns} dataSource={dataSource} />
            </div>
          </div>

          <div className="col-lg-3 col-sm-6 col-xs-12">
            <PaymentDetail setPayment={setPayment} />
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

export default memo(PaymentSetting);