import React, { memo, useEffect, useState } from "react";
import Slider from "react-slick";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { settings, defaultAvatar, fallbackImg } from "./constants";
import CustomSlide from "./CustomSlide";
import axios from "axios";
import styled from 'styled-components';
import { Spin } from "antd";
import { shuffleArray } from '../../store/utils';

const StyledSpin = styled(Spin)`
  .ant-spin-dot-item {
    background-color: #FF343F;
  }
  .ant-spin-text {
    color: #FF343F;
  }
`

const HotCollections = () => {
  const MAX_COUNT = 5;
  const [hotCollections, setHotCollections] = useState([]);

  const [loading, setLoading] = useState(true);

  async function getCollections() {
    try {
      await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/collection/all`, {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {}
      }).then(async res => {
        let collections = shuffleArray(res.data.collections);
        let count = collections.length > MAX_COUNT ? MAX_COUNT : collections.length;

        for (let i = 0; i < count; i++) {
          let c = collections[i];

          //get user info
          let author = null;
          await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/user`, {
            headers: {
              'Content-Type': 'application/json',
            },
            params: {
              walletAddr: c.walletAddr.toLowerCase()
            }
          }).then(res1 => {
            author = res1.data.user;
          });

          c.author = author;
        }

        setHotCollections(collections);
      });
    } catch {
      console.log('error in fetching collections');
    }

    setLoading(false);
  }
  
  useEffect(() => {
    getCollections();
  }, [settings]);

  return (
      <div className='nft' style={{textAlign: "center"}}>
        <StyledSpin tip="Loading..." size="large" spinning={loading}/>
        { hotCollections.length > 0 &&
        <Slider {...settings}>
          { hotCollections && hotCollections.map((collection, index) => (
            <CustomSlide
              key={index}
              index={index + 1}
              type={collection.collectionType}
              avatar={collection.author && collection.author.avatar ? collection.author.avatar : defaultAvatar}
              banner={collection.image ? collection.image : fallbackImg}
              username={collection.title}
              uniqueId={collection.category}
              collectionId={collection.collectionAddr}
            />
          ))}
        </Slider>
        }
      </div>
  );
};

export default memo(HotCollections);
