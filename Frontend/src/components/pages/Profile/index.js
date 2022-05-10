import React, { memo, useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import * as selectors from '../../../store/selectors';
import * as actions from '../../../store/actions/thunks';

import axios from "axios";

import Footer from '../../components/footer';

import { navigate } from '@reach/router';
import { useMoralis, useMoralisFile } from "react-moralis";

//IMPORT DYNAMIC STYLED COMPONENT
import { StyledHeader } from '../../Styles';

import { Spin, Modal } from "antd";
import styled from 'styled-components';
import api from "../../../core/api";

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

const Profile = ({ userAddr }) => {
  const dispatch = useDispatch();
  const currentUserState = useSelector(selectors.currentUserState);
  
  const { account, Moralis, isAuthenticated } = useMoralis();
  const { saveFile } = useMoralisFile();
  
  const [user, setUser] = useState(null);

  const avatarInput = useRef(null);
  const [avatar, setAvatar] = useState({ preview: '', data: '' });
  
  const bannerInput = useRef(null);
  const [banner, setBanner] = useState({ preview: '', data: '' });
  
  const [userName, setUserName] = useState('');
  const [about, setAbout] = useState('');
  const [twitter, setTwitter] = useState('');
  const [youtube, setYoutube] = useState('');
  const [instagram, setInstagram] = useState('');
  
  const defaultAvatar = api.baseUrl + '/uploads/thumbnail_author_4_623046d09c.jpg';
  const defaultBanner = api.baseUrl + '/uploads/medium_2_770d4f4fa5.jpg';
  
  const [loading, setLoading] = useState(false);
  const [loadingTitle, setLoadingTitle] = useState("Loading...");

  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [openModal, setOpenModal] = useState(false);

  const handleAvatarChange = (e) => {
    try {
      const img = {
        preview: URL.createObjectURL(e.target.files[0]),
        data: e.target.files[0],
      }
      setAvatar(img);
    } catch (e) {
      setAvatar(avatar);
    }
  };

  const handleBannerChange = (e) => {
    try {
      const img = {
        preview: URL.createObjectURL(e.target.files[0]),
        data: e.target.files[0],
      }
      setBanner(img);
    } catch (e) {
      setBanner(banner);
    }
  };

  const handleAvatarUpload = () => {
    avatarInput.current.click();
  }

  const handleAvatarRemove = () => {
    setAvatar({ preview: '', data: '' });
  }

  const handleBannerUpload = () => {
    bannerInput.current.click();
  }

  const handleBannerRemove = () => {
    setBanner({ preview: '', data: '' });
  }

  const handleSaveProfile = async (e) => {
    setLoading(true);

    //check form data
    e.preventDefault();

    if (account == '') {
      setLoading(false);

      setModalTitle('Error');
      setModalMessage("Please connect your wallet");
      setOpenModal(true);
      return;
    }

    if (!userName) {
      setLoading(false);

      setModalTitle('Error');
      setModalMessage("Please enter your name");
      setOpenModal(true);
      return;
    }

    Moralis.initialize(APP_ID);
    Moralis.serverURL = SERVER_URL;

    //save avatar image into ipfs
    let avatarIpfs = null;
    if (avatar.data) {
      await saveFile(
        avatar.data.name, 
        avatar.data, 
        { 
          saveIPFS: true,
          onSuccess: (result) => {
            avatarIpfs = GATEWAY_URL + result.hash();
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
    }

    //save banner image into ipfs
    let bannerIpfs = null;
    if (banner.data) {
      await saveFile(
        banner.data.name, 
        banner.data, 
        { 
          saveIPFS: true,
          onSuccess: (result) => {
            bannerIpfs = GATEWAY_URL + result.hash();
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
    }

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/api/user/save`, 
        {
          'walletAddr': account.toLowerCase(),
          'name': userName,
          'avatar': avatarIpfs,
          'banner': bannerIpfs,
          'about': about,
          'twitter': twitter,
          'youtube': youtube,
          'instagram': instagram
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      setLoading(false);

      if (res) {
        if (res.data.type === 'error') {
          setModalTitle('Error');
          setModalMessage(res.data.message);
          setOpenModal(true);
        } else {
          dispatch(actions.setCurrentUser(account.toLowerCase()));

          setModalTitle('Success');
          setModalMessage(res.data.message);
          setOpenModal(true);
        }
      }
    } catch (error) {
      console.log(error);
      setLoading(false);

      setModalTitle('Error');
      setModalMessage(error.message);
      setOpenModal(true);
      return;
    }
  }

  const closeModal = () => {
    setOpenModal(false);
    setModalTitle('');
    setModalMessage('');
  }

  useEffect(() => {
    if (currentUserState.data != undefined && currentUserState.data != null) {
      setUser(currentUserState.data);

      setUserName(currentUserState.data.name);
      setAbout(currentUserState.data.about);
      setTwitter(currentUserState.data.twitter);
      setYoutube(currentUserState.data.youtube);
      setInstagram(currentUserState.data.instagram);
    }
  }, [currentUserState]);

  useEffect(() => {
    if (account) {
      setLoadingTitle("Updating your profile...");
    }
  }, [account]);

  useEffect(() => {
    if (!isAuthenticated || !account) {
      navigate('/');
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

      <section id='profile_banner' 
              className='jumbotron breadcumb no-bg' 
              style={{backgroundImage: `url(${banner.preview ? banner.preview : user && user.banner ? user.banner : defaultBanner})`}}>
        <div className='mainbreadcumb'>
        </div>
      </section>
      
      <section className='container d_coll no-top no-bottom'>
        <div className='row'>
          <div className="col-md-12">
            <div className="d_profile">
              <div className="profile_avatar">
                <div className="d_profile_img">
                  <img src={avatar.preview ? avatar.preview : user && user.avatar ? user.avatar : defaultAvatar} alt=""/>
                  <i className="fa fa-check"></i>
                </div>
                <div className="profile_name">
                  <h4>
                    My Profile
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='container'>
        <div className="row">
          <div className="col-lg-7 offset-lg-1 mb-5">
            <div className="field-set">
              <h5>User name <span className="text-muted">(Required)</span></h5>
              <input type="text" 
                    name="username" 
                    id="username" 
                    className="form-control" 
                    placeholder="Enter user name" 
                    value={userName} 
                    onChange={(e) => setUserName(e.target.value)}
                    required
              />

              <div className="spacer-10"></div>

              <h5>About <span className="text-muted">(Optional)</span></h5>
              <textarea data-autoresize name="about" id="about" className="form-control" placeholder="Tell us something about you" value={about} onChange={(e) => setAbout(e.target.value)}></textarea>

              <div className="spacer-10"></div>

              <h5>Twitter <span className="text-muted">(Optional)</span></h5>
              <input type="text" 
                    name="twitter" 
                    id="twitter" 
                    className="form-control" 
                    placeholder="Enter your twitter account" 
                    value={twitter} 
                    onChange={(e) => setTwitter(e.target.value)}
              />

              <div className="spacer-10"></div>
              
              <h5>Youtube <span className="text-muted">(Optional)</span></h5>
              <input type="text" 
                    name="youtube" 
                    id="youtube" 
                    className="form-control" 
                    placeholder="Enter your youtube account" 
                    value={youtube} 
                    onChange={(e) => setYoutube(e.target.value)}
              />

              <div className="spacer-10"></div>

              <h5>Instagram <span className="text-muted">(Optional)</span></h5>
              <input type="text" 
                    name="instagram" 
                    id="instagram" 
                    className="form-control" 
                    placeholder="Enter your instagram account" 
                    value={instagram} 
                    onChange={(e) => setInstagram(e.target.value)}
              />

              <div className="spacer-10"></div>

              <input type="button" id="submit" className="btn-main" value="Save Profile" onClick={handleSaveProfile}/>
            </div>
          </div>

          <div className="col-lg-3 col-sm-6 col-xs-12">
            <h5>Avatar Image</h5>
            {avatar.preview &&
            <>
            <img src={avatar.preview}
                className="d-profile-img-edit img-fluid"
                style={{width: '150px', height: '150px', objectFit: 'cover'}}
                onClick={handleAvatarUpload}
            />
                
            <input type="button" className="btn-main mb-4" value="Remove Profile" onClick={handleAvatarRemove}/>
            </>
            }
            
            <div className="d-create-file" style={{padding: "10px"}}>
              <div className='browse'>
                <input type="button" id="get_file" className="btn-main" value="Browse"/>
                <input id='upload_file' type="file" ref={avatarInput} onChange={handleAvatarChange} accept="image/*" />
              </div>
            </div>

            <div className="spacer-single"></div>

            <h5>Banner Image <i className="fa fa-info-circle id-color-2" data-bs-toggle="tooltip" data-bs-placement="top" title="" data-bs-original-title="Recommend 1500 x 500. Max size: 50MB. Click the image to upload." aria-label="Recommend 1500 x 500. Max size: 50MB. Click the image to upload."></i></h5>
            {banner.preview &&
            <>
            <img src={banner.preview}
                className="d-banner-img-edit img-fluid"
                // style={{width: '150px', height: '150px', objectFit: 'cover'}}
                onClick={handleBannerUpload}
            />
                
            <input type="button" className="btn-main mb-4" value="Remove Banner" onClick={handleBannerRemove}/>
            </>
            }
            
            <div className="d-create-file" style={{padding: "10px"}}>
              <div className='browse'>
                <input type="button" id="get_file" className="btn-main" value="Browse"/>
                <input id='upload_file' type="file" ref={bannerInput} onChange={handleBannerChange} accept="image/*" />
              </div>
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

export default memo(Profile);