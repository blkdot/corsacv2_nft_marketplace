import React, { memo, useEffect, useState } from 'react';
import { Modal, Spin, Input, InputNumber } from "antd";
import { useMoralisDapp } from "../../../providers/MoralisDappProvider/MoralisDappProvider";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";
import axios from 'axios';
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
const StyledInput = styled(Input)`
  border: solid 1px rgba(255, 255, 255, 0.1);
  background-color: transparent;
  color: #FFF;
  .ant-input {
    background-color: transparent;
    color: #FFF;
  }
  .ant-input-clear-icon {
    color: #FFF;
  }
`
const StyledInputNumber = styled(InputNumber)`
  border: solid 1px rgba(255, 255, 255, 0.1);
  background-color: transparent;
  color: #FFF;
  .ant-input-number-input {
    background-color: transparent;
    color: #FFF;
  }
`

//react functional component
const PaymentDetail = ({setPayment}) => {
  const Web3Api = useMoralisWeb3Api();

  const [tokenType, setTokenType] = useState(0);
  const [tokenName, setTokenName] = useState('');
  const [tokenAddr, setTokenAddr] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenDecimals, setTokenDecimals] = useState(18);

  const [loading, setLoading] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [openModal, setOpenModal] = useState(false);

  const closeModal = () => {
    setOpenModal(false);
    setModalTitle('');
    setModalMessage('');
  }

  const fetchTokenMetadata = async (e) => {
    const address = e.target.value;
    if (!address) {
      setTokenName('');
      setTokenSymbol('');
      setTokenDecimals(18);
      return;
    }

    setLoading(true);
    // Get metadata for one token. Ex: USDT token on ETH
    const options = {
      chain: process.env.REACT_APP_CHAIN_ID,
      addresses: address,
    };

    try {
      const res = await Web3Api.token.getTokenMetadata(options);
      const tokenMetadata = res[0] ? res[0] : null;
      
      setTokenName(tokenMetadata ? tokenMetadata.name : '');
      setTokenSymbol(tokenMetadata ? tokenMetadata.symbol : '');
      setTokenDecimals(tokenMetadata ? tokenMetadata.decimals : 18);

      setLoading(false);
    } catch (e) {
      console.log(e);

      setTokenName('');
      setTokenSymbol('');
      setTokenDecimals(18);
            
      setLoading(false);
    }
    // await axios.get(`https://deep-index.moralis.io/api/v2/erc20/metadata`, {
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'X-API-Key': 'fnuHcmNLPkOdwGsMV24bR6e2JOqEAoWqSFKPG8eujPah3KciyIIX7aavoJnOGtHg'
    //   },
    //   params: {
    //     chain: process.env.REACT_APP_CHAIN_ID,
    //     addresses: address,
    //   }
    // }).then((res) => {
    //   const tokenMetadata = res.data[0] ? res.data[0] : null;
    //   setTokenName(tokenMetadata ? tokenMetadata.name : '');
    //   setTokenSymbol(tokenMetadata ? tokenMetadata.symbol : '');
    //   setTokenDecimals(tokenMetadata ? tokenMetadata.decimals : 18);

    //   setLoading(false);
    // }).catch((e) => {
    //   console.log(e);

    //   setTokenName('');
    //   setTokenSymbol('');
    //   setTokenDecimals(18);
            
    //   setLoading(false);
    // });
  };

  const handleTokenType = (type) => {
    if (type === 0) {
      // document.getElementById("btn1").classList.add("active");
      document.getElementById("btn2").classList.remove("active");
    } else {
      document.getElementById("btn2").classList.add("active");
      // document.getElementById("btn1").classList.remove("active");
    }
    
    setTokenType(type);
  }

  const handleSavePayment = () => {
    if (!tokenAddr || !tokenName || !tokenSymbol || !tokenDecimals) {
      setOpenModal(true);
      setModalTitle('Error');
      setModalMessage('Please enter correct BEP-20 token info');

      return;
    }

    setPayment({
      type: 'BEP-20',
      name: tokenName,
      symbol: tokenSymbol,
      addr: tokenAddr,
      decimals: tokenDecimals
    });
  }

  return (
    <div className='row'>
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

      <div className="field-set">
        <h5>Type <span className="text-muted">(Required)</span></h5>
        <ul className="de_nav" style={{textAlign: 'left'}}>
          <li id='btn2' className="active" onClick={() => handleTokenType(1)}><span><i className="fa fa-money"></i> BEP-20</span>
          </li>
        </ul>

        <div className="spacer-single"></div>

        <h5>Address <span className="text-muted">(Required)</span></h5>
        <input type="text" 
          name="token_address" 
          id="token_address" 
          className="form-control" 
          placeholder="Enter token address" 
          value={tokenAddr} 
          onChange={(e) => setTokenAddr(e.target.value)}
          onBlur={fetchTokenMetadata}
          required
        />

        <div className="spacer-single"></div>

        <h5>Name <span className="text-muted">(Required)</span></h5>
        <input type="text" 
          name="token_name" 
          id="token_name" 
          className="form-control" 
          placeholder="Enter token name" 
          value={tokenName} 
          onChange={(e) => setTokenName(e.target.value)}
          readOnly
          required
        />

        <div className="spacer-single"></div>

        <h5>Symbol <span className="text-muted">(Required)</span></h5>
        <input type="text" 
          name="token_symbol" 
          id="token_symbol" 
          className="form-control" 
          placeholder="Enter token symbol" 
          value={tokenSymbol} 
          onChange={(e) => setTokenSymbol(e.target.value)}
          readOnly
          required
        />

        <div className="spacer-single"></div>

        <h5>Decimals <span className="text-muted">(Required)</span></h5>
        <input type="number" 
          name="token_decimals" 
          id="token_decimals" 
          className="form-control" 
          placeholder="Enter token decimals" 
          value={tokenDecimals} 
          onChange={(e) => setTokenDecimals(e.target.value)}
          min={0}
          readOnly
          required
        />
        
        <div className="spacer-single"></div>

        <input type="button" id="submit" className="btn-main" value="Save Payment" onClick={handleSavePayment}/>
      </div>

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
};

export default memo(PaymentDetail);