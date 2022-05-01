import React, { memo, useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import UserTopSeller from './UserTopSeller';
import * as selectors from '../../store/selectors';
import { fetchAuthorList } from "../../store/actions/thunks";
import axios from "axios";
import api from "../../core/api";

const TopSeller = () => {
  const [topSellers, setTopSellers] = useState([]);

  const defaultAvatar = api.baseUrl + '/uploads/thumbnail_author_4_623046d09c.jpg';

  useEffect(async () => {
    try {
      await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/activity/bestseller`, {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {}
      }).then(async res => {
        let sellers = [];
        let rank = 1;
        for (let s of res.data.sellers) {
          sellers.push({
            rank: rank++,
            name: s.users && s.users[0] ? s.users[0].name : 'Unknown',
            avatar: s.users && s.users[0] ? s.users[0].avatar : defaultAvatar,
            walletAddr: s._id,
            sales: s.sales
          });
        }
        setTopSellers(sellers);
      });
    } catch {
      console.log('error in fetching best sellers');
    }
  }, []);

  return (
    <div>
      <ol className="author_list">
      { topSellers && topSellers.map((author, index) => (
          <li key={index}>
            <UserTopSeller user={author} />
          </li>
      ))}
      </ol>
    </div>
  );
};
export default memo(TopSeller);