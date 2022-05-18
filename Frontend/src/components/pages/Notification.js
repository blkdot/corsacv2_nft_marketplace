import React, { memo, useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import { useMoralis } from "react-moralis";
import * as selectors from '../../store/selectors';
import Footer from '../components/footer';

//IMPORT DYNAMIC STYLED COMPONENT
import { StyledHeader } from '../Styles';
import { Spin, Modal } from "antd";
import styled from 'styled-components';
import { formatAddress, getNotifications, markupRead } from "../../utils";

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

const Notification = () => {
  const currentUserState = useSelector(selectors.currentUserState);
  const { account } = useMoralis();

  const [notifications, setNotifications] = useState([]);
  const [actionType, setActionType] = useState(null);

  const [loading, setLoading] = useState(true);
  
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [openModal, setOpenModal] = useState(false);

  const closeModal = () => {
    setOpenModal(false);
    setModalTitle('');
    setModalMessage('');
  }

  const handleMarkupRead = async () => {
    if (account) {
      await markupRead(account.toLowerCase()).then(() => {
        let ns = JSON.parse(JSON.stringify(notifications));
        for (let n of ns) {
          n.read = true;
        }

        setNotifications(ns);
      });
    }
  }

  const getAllNotifications = async (walletAddr) => {
    let temp = await getNotifications(walletAddr);
    let ns = [];

    for (let n of temp) {
      let className = '';
      if ([3, 4, 6, 7, 8, 9, 10, 17].includes(parseInt(n.actionType))) {
        className = 'act_sale';
      } else if ([5, 11].includes(parseInt(n.actionType))) {
        className = 'act_offer';
      } else if ([12, 15].includes(parseInt(n.actionType))) {
        className = 'act_like';
      } else if ([13, 16].includes(parseInt(n.actionType))) {
        className = 'follow';
      } else {
        className = '';
      }

      n.className = className;
      ns.push(n);
    }
    setNotifications(ns);
    setLoading(false);
  }

  useEffect(() => {
    if (account) {
      getAllNotifications(account.toLowerCase());
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

      <section className='jumbotron breadcumb no-bg'
              style={{backgroundImage: `url(${currentUserState && currentUserState.data && currentUserState.data.banner ? currentUserState.data.banner : ''})`}}>
        <div className='mainbreadcumb'>
          <div className='container'>
            <div className='row m-10-hor'>
              <div className='col-12'>
                <h1 className='text-center'>Notifications</h1>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className='container'>
        <div className="row">
          <div className="d-item col-lg-12 col-md-12 col-sm-12 col-xs-12 mb-4">
            <button className="btn-main" onClick={() => handleMarkupRead()}>
              Markup as Read
            </button>
          </div>
        </div>
        <div className='row'>
          <div className="col-md-12">
            <ul className="activity-list">
              {notifications && notifications.map((notification, index) => (
                  <li className={notification.className} key={index}>
                    <img className="lazy" src={notification.actorAvatar} alt=""/>
                    <div className="act_list_text">
                        <h4>
                          { formatAddress(notification.actor, 'wallet') } &nbsp;
                          {notification.read &&
                            <i className="fa fa-check-circle"></i>
                          }
                        </h4>
                        {notification.description}
                        <span className="act_list_date">
                          {notification.duration} ago
                        </span>
                    </div>
                  </li>
                )
              )}
            </ul>
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
export default memo(Notification);