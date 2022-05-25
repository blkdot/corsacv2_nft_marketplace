import React, { memo, useEffect, useState } from 'react';
import { navigate } from '@reach/router';
import { defaultAvatar, fallbackImg } from '../constants';
import { formatUserName, formatAddress } from '../../../utils';

//react functional component
const BlacklistItem = ({item, handleBlacklist}) => {
  return (
    <div className='row'>
      <h3 className="mb-4" style={{textAlign: "center"}}>Item Detailed</h3>
      { item && 
        <>
          <div className="text-center">
              { item.item_type && item.item_type == 'image' &&
                <img src={item.image ? item.image : item.metadata && item.metadata.image ? item.metadata.image : fallbackImg} className="img-fluid img-rounded mb-sm-30" alt=""/>
              }
              { item.item_type && item.item_type == 'video' &&
                <video width="100%" height="100%" controls className="img-fluid img-rounded mb-sm-30">
                  <source src={item.image ? item.image : item.metadata && item.metadata.image ? item.metadata.image : fallbackImg} type={item.mime_type} />
                </video>
              }
              { item.item_type && item.item_type == 'audio' &&
                <audio controls className="img-fluid img-rounded mb-sm-30">
                  <source src={item.image ? item.image : item.metadata && item.metadata.image ? item.metadata.image : fallbackImg} type={item.mime_type} />
                </audio>
              }
          </div>
          <div className="item_info mt-4">
            <h5>Status</h5>
            <p className="">
              {item.blocked === 1 &&
                <strong style={{color: "#FF343F"}}>Blocked</strong>
              }
              {item.blocked === 0 &&
                <strong>Unblocked</strong>
              }
            </p>

            <div className="spacer-10"></div>

            <h5>Type</h5>
            <ul className="de_nav" style={{textAlign: 'left'}}>
              <li id='btn1' className={item.type === 'BEP-721' ? 'active' : ''}><span><i className="fa fa-user"></i> BEP-721</span></li>
              <li id='btn2' className={item.type === 'BEP-1155' ? 'active' : ''}><span><i className="fa fa-users"></i> BEP-1155</span></li>
            </ul>

            <div className="spacer-10"></div>

            <div className="d-flex flex-row">
              <div className="mr40">
                <h5>Creator</h5>
                <div className="item_author">                                    
                  <div className="author_list_pp" onClick={() => navigate(`/author/${item.creator && item.creator.walletAddr ? item.creator.walletAddr.toLowerCase() : ''}`)}>
                    <span>
                      <img className="lazy" 
                          src={item.creator && item.creator.avatar ? item.creator.avatar : defaultAvatar} 
                          title={item.creator && item.creator.name ? formatUserName(item.creator.name) : formatAddress(item.creator.walletAddr.toLowerCase(), 'wallet')} 
                          alt=""
                      />
                      <i className="fa fa-check"></i>
                    </span>
                  </div>
                  <div className="author_list_info">
                    <span>{item.creator && item.creator.name ? formatUserName(item.creator.name) : formatAddress(item.creator.walletAddr.toLowerCase(), 'wallet')}</span>
                  </div>
                </div>
              </div>
              <div className="mr40">
                <h5>Collection</h5>
                <div className="item_author">
                  <div className="author_list_pp" onClick={() => navigate("/collection/" + (item.collectionAddr ? item.collectionAddr : (item.metadata && item.metadata.collection ? item.metadata.collection.addr : '')))}>
                    <span>
                      <img className="lazy" 
                          src={item.metadata && item.metadata.collection && item.metadata.collection.image ? item.metadata.collection.image : fallbackImg}
                          title={item.metadata && item.metadata.collection && item.metadata.collection.title ? formatUserName(`${item.metadata.collection.title} (${item.metadata.collection.symbol})`) : formatAddress(item.metadata.collection.addr, 'collection')} 
                          alt=""/>
                      <i className="fa fa-check"></i>
                    </span>
                  </div>
                  <div className="author_list_info">
                    <span>{item.metadata && item.metadata.collection && item.metadata.collection.title ? `${item.metadata.collection.title} (${item.metadata.collection.symbol})` : 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="spacer-single"></div>
            <div className="spacer-10"></div>

            <h5>Name</h5>
            <p className="">{item.name}</p>

            <div className="spacer-10"></div>

            <h5>Category</h5>
            <p className="">{item.metadata && item.metadata.collection.category ? item.metadata.collection.category : ''}</p>

            <div className="spacer-10"></div>
            
            <h5>Token ID</h5>
            <p className="">{item.tokenId}</p>

            <div className="spacer-10"></div>

            <h5>Description</h5>
            <p dangerouslySetInnerHTML={{__html: item.metadata && item.metadata.description ? item.metadata.description.replaceAll('\n', "<br/>") : ''}}></p>

            <div className="spacer-10"></div>

            <div className="mr40">
              <h5>Owner</h5>
              <div className="item_author">                                    
                <div className="author_list_pp" onClick={() => navigate(`/author/${item.author && item.author.walletAddr ? item.author.walletAddr.toLowerCase() : ''}`)}>
                  <span>
                    <img className="lazy" 
                        src={item.author && item.author.avatar ? item.author.avatar : defaultAvatar} 
                        title={item.author && item.author.name ? formatUserName(item.author.name) : formatAddress(item.owner_of.toString(), 'wallet')} 
                        alt=""
                    />
                    <i className="fa fa-check"></i>
                  </span>
                </div>                                    
                <div className="author_list_info">
                  <span>{item.author && item.author.name ? formatUserName(item.author.name) : formatAddress(item.owner_of.toString(), 'wallet')}</span>
                </div>
              </div>
            </div>

            <div className="spacer-single"></div>
            <div className="spacer-10"></div>

            <h5>Royalty</h5>
            <p className="">{item.metadata && item.metadata.royalty ? (item.metadata.royalty / 100).toFixed(1) : 0} %</p>

            <h5>Amount</h5>
            <p className="">{item.amount}</p>

            <div className="d-flex flex-row mt-5">
              {item && item.blocked === 1 && 
                <button className='btn-main btn2 lead mb-5' onClick={() => handleBlacklist(item, 0)}>Unblock Item</button>
              }
              {item && item.blocked === 0 &&
                <button className='btn-main btn2 lead mb-5' onClick={() => handleBlacklist(item, 1)}>Block Item</button>
              }
            </div>
          </div>
        </>
      }
      { !item &&
        <div className="alert alert-danger" role="alert">
          No item
        </div>
      }
    </div>
  );
};

export default memo(BlacklistItem);