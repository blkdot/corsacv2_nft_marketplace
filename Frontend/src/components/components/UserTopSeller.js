import { navigate } from '@reach/router';
import React, { memo } from 'react';
import { formatAddress, formatUserName } from '../../utils';

//react functional component
const UserTopSeller = ({ user }) => {
  return (
    <>
      <div className="author_list_pp">
        <span onClick={()=> navigate(`/author/${user.walletAddr}`)}>
          <img className="lazy" src={user.avatar} alt=""/>
          <i className="fa fa-check"></i>
        </span>
      </div>                                    
      <div className="author_list_info">
        <span onClick={()=> navigate(`/author/${user.walletAddr}`)}>
          {user.name ? formatUserName(user.name) : formatAddress(user.walletAddr, 'wallet')}
        </span>
        <span className="bot">{user.sales} sales</span>
      </div>   
    </>     
  );
};

export default memo(UserTopSeller);