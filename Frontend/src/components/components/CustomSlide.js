import React, { memo } from "react";
import { navigate } from '@reach/router';

const CustomSlide = ({ index, type, avatar, banner, username, uniqueId, collectionId }) => {
  return (
    <div className='itm' index={index}>
      <div className="nft_coll">
          <div className="nft_wrap" style={{display: "flex", justifyContent: "center"}}>
              <span>
                <img src={banner} className="lazy img-fluid" alt="" style={{width: "250px", height: "250px"}}/>
              </span>
          </div>
          <div className="nft_coll_pp">
              <span onClick={()=> navigate("/collection/" + collectionId)}><img className="lazy" src={avatar} alt=""/></span>
              <i className="fa fa-check"></i>
          </div>
          <div className="nft_coll_info">
              <span onClick={()=> navigate("/collection/" + collectionId)}><h4>{ username }</h4></span>
              <span>{ type === 0 ? 'BEP-721' : type === 1 ? 'BEP-1155' : 'Unknown'}</span>
          </div>
      </div>
    </div>
  )
}

export default memo(CustomSlide);