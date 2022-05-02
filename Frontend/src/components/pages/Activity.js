import React, { memo, useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import * as selectors from '../../store/selectors';
import Footer from '../components/footer';

import axios from "axios";
import api from "../../core/api";

//IMPORT DYNAMIC STYLED COMPONENT
import { StyledHeader } from '../Styles';
import { Spin, Modal } from "antd";
import styled from 'styled-components';

import moment from "moment";

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
const Activity = () => {
  const currentUserState = useSelector(selectors.currentUserState);

  const [activities, setActivities] = useState([]);
  const [actionType, setActionType] = useState(null);

  const [loading, setLoading] = useState(true);
  
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [openModal, setOpenModal] = useState(false);

  const defaultAvatar = api.baseUrl + '/uploads/thumbnail_author_4_623046d09c.jpg';
    
  const closeModal = () => {
    setOpenModal(false);
    setModalTitle('');
    setModalMessage('');
  }

  const getAllActivities = async () => {
    document.getElementById("follow").classList.remove("active");
    document.getElementById("sale").classList.remove("active");
    document.getElementById("offer").classList.remove("active");
    document.getElementById("like").classList.remove("active");

    //get activities from backend
    await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/activity/all`, {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {}
    }).then(async res => {
      let acts = [];
      for (let a of res.data.activities) {
        let className = '';
        if ([3, 4, 6, 7, 8, 9, 10].includes(parseInt(a.actionType))) {
          className = 'act_sale';
        } else if ([5, 11].includes(parseInt(a.actionType))) {
          className = 'act_offer';
        } else if (parseInt(a.actionType) == 12) {
          className = 'act_like';
        } else if (parseInt(a.actionType) == 13) {
          className = 'follow';
        } else {
          className = '';
        }

        acts.push({
          actor: a.actorUsers && a.actorUsers[0] && a.actorUsers[0].name ? a.actorUsers[0].name : a.actor,
          avatar: a.actorUsers && a.actorUsers[0] && a.actorUsers[0].avatar ? a.actorUsers[0].avatar : defaultAvatar,
          type: a.actionType,
          description: a.description,
          timeStamp: moment(a.timeStamp * 1000).format('L, LT'),
          from: a.fromUsers && a.fromUsers[0] && a.fromUsers[0].name ? a.fromUsers[0].name : a.from,
          className: className
        });
      }
      
      setActivities(acts);
      setLoading(false);
    }).catch((e) => {
      setLoading(false);

      setOpenModal(false);
      setModalTitle('Error');
      setModalMessage('Error occurs while fetching data from backend');
    });
  }

  const getActivitiesByType = async (type) => {
    let types = [];
    switch (type) {
      case "sale":
        types = [3, 4, 6, 7, 8, 9, 10];
        document.getElementById("follow").classList.remove("active");
        document.getElementById("sale").classList.add("active");
        document.getElementById("offer").classList.remove("active");
        document.getElementById("like").classList.remove("active");
        break;
      case "like":
        types = [12];
        document.getElementById("follow").classList.remove("active");
        document.getElementById("sale").classList.remove("active");
        document.getElementById("offer").classList.remove("active");
        document.getElementById("like").classList.add("active");
        break;
      case "offer":
        types = [5, 11];
        document.getElementById("follow").classList.remove("active");
        document.getElementById("sale").classList.remove("active");
        document.getElementById("offer").classList.add("active");
        document.getElementById("like").classList.remove("active");
        break;
      case "follow":
        types = [13];
        document.getElementById("follow").classList.add("active");
        document.getElementById("sale").classList.remove("active");
        document.getElementById("offer").classList.remove("active");
        document.getElementById("like").classList.remove("active");
        break;
    }

    //get activities from backend
    await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/activity/type`, {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        actionTypes: types
      }
    }).then(async res => {
      let acts = [];
      for (let a of res.data.activities) {
        let className = '';
        if ([3, 4, 6, 7, 8, 9, 10].includes(parseInt(a.actionType))) {
          className = 'act_sale';
        } else if ([5, 11].includes(parseInt(a.actionType))) {
          className = 'act_offer';
        } else if (parseInt(a.actionType) == 12) {
          className = 'act_like';
        } else if (parseInt(a.actionType) == 13) {
          className = 'follow';
        } else {
          className = '';
        }
        
        acts.push({
          actor: a.actorUsers && a.actorUsers[0] && a.actorUsers[0].name ? a.actorUsers[0].name : a.actor,
          avatar: a.actorUsers && a.actorUsers[0] && a.actorUsers[0].avatar? a.actorUsers[0].avatar : defaultAvatar,
          type: a.actionType,
          description: a.description,
          timeStamp: moment(a.timeStamp * 1000).format('L, LT'),
          from: a.fromUsers && a.fromUsers[0] && a.fromUsers[0].name ? a.fromUsers[0].name : a.from,
          className: className
        });
      }
            
      setActivities(acts);
      setLoading(false);
    }).catch((e) => {
      setLoading(false);

      setOpenModal(false);
      setModalTitle('Error');
      setModalMessage('Error occurs while fetching data from backend');
    });
  }
  
  useEffect(() => {
    setOpenModal(false);
    setLoading(true);
    
    setActionType("all");
  }, []);

  useEffect(async () => {
    if (actionType != null) {
      if (actionType === "all") {
        await getAllActivities();
      } else {
        await getActivitiesByType(actionType);
      }
    }
  }, [actionType]);

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
        <StyledSpin tip="Loading Activities..." size="large" />
        </div>
      </StyledModal>

      <section className='jumbotron breadcumb no-bg'
              style={{backgroundImage: `url(${currentUserState && currentUserState.data && currentUserState.data.banner ? currentUserState.data.banner : ''})`}}>
        <div className='mainbreadcumb'>
          <div className='container'>
            <div className='row m-10-hor'>
              <div className='col-12'>
                <h1 className='text-center'>Activity</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='container'>
        <div className='row'>
          <div className="col-md-8">
            <ul className="activity-list">
              {activities && activities.map((activity, index) => (
                  <li className={activity.className} key={index}>
                    <img className="lazy" src={activity.avatar} alt=""/>
                    <div className="act_list_text">
                        <h4>{activity.actor}</h4>
                        {activity.description}
                        <span className="act_list_date">
                          {activity.timeStamp}
                        </span>
                    </div>
                  </li>
                )
              )}
            </ul>
          </div>
          <div className="col-md-4">
            <span className="filter__l">Filter</span>
            <span className="filter__r" onClick={() => setActionType("all")}>Reset</span>
            <div className="spacer-half"></div>
            <div className="clearfix"></div>
            <ul className="activity-filter">
              <li id='sale' className="filter_by_sales" onClick={() => setActionType("sale")}><i className="fa fa-shopping-basket"></i>Sales</li>
              <li id='like' className="filter_by_likes" onClick={() => setActionType("like")}><i className="fa fa-heart"></i>Likes</li>
              <li id='offer' className="filter_by_offers" onClick={() => setActionType("offer")}><i className="fa fa-gavel"></i>Offers</li>
              <li id='follow' className="filter_by_followings" onClick={() => setActionType("follow")}><i className="fa fa-check"></i>Followings</li>
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
export default memo(Activity);