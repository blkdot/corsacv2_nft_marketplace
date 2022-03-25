import React, { memo, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as selectors from '../../store/selectors';
import * as actions from '../../store/actions/thunks';
import { clearNfts, clearFilter } from '../../store/actions';
import MyNftCard from './MyNftCard';
import NftMusicCard from './NftMusicCard';
import { shuffleArray } from '../../store/utils';
import {Tooltip, Modal, Input, Spin, Button, Skeleton, Tabs, DatePicker } from "antd";
import {useMoralisDapp} from "../../providers/MoralisDappProvider/MoralisDappProvider";
import {useMoralis, useWeb3ExecuteFunction, useNFTBalances} from "react-moralis";

//react functional component
const MyNFTBalanceOnSale = ({ showLoadMore = true, shuffle = false, authorId = null }) => {

    const dispatch = useDispatch();
    const {data: NFTBalances} = useNFTBalances();
    const nfts = NFTBalances ? NFTBalances.result : [];
    // let saleNFTs = [];
    const [saleNFTs, setSaleNFTs] = useState([]);
        
    const [height, setHeight] = useState(0);

    const onImgLoad = ({target:img}) => {
        let currentHeight = height;
        if(currentHeight < img.offsetHeight) {
            setHeight(img.offsetHeight);
        }
    }

    const contractProcessor = useWeb3ExecuteFunction();
    const {marketAddress, contractABI} = useMoralisDapp();
    const [visible1, setVisibility1] = useState(false);
    const [visible2, setVisibility2] = useState(false);
    const [nftToSend, setNftToSend] = useState(null);
    const [price, setPrice] = useState(0);
    const [loading, setLoading] = useState(false);

    const listItemFunction = "getSaleInfo";
    const [dueDate, setDueDate] = useState(null);
    const [duration, setDuration] = useState(0);
    const [tabKey, setTabKey] = useState("1");
    const { TabPane } = Tabs;

    const {account} = useMoralis();

    useEffect(() => {
      async function getSalesOf(seller) {
        const ops = {
          contractAddress: marketAddress,
          functionName: listItemFunction,
          abi: contractABI,
          params: {
            startIdx: 0,
            count: 100000
          },
        };
        await contractProcessor.fetch({
          params: ops,
          onSuccess: (result) => {
            let nftsArray = [];
            result.map((salesInfo, index) => {
              if (salesInfo.seller.toLowerCase() == seller.toLowerCase()) {
                const temp = nfts.filter((nft, idx) => {
                  return (nft.token_address.toLowerCase() == salesInfo.sc.toLowerCase() && 
                      nft.token_id == salesInfo.tokenId.toString());
                });
                nftsArray.push(...temp);
              }
            });
            setSaleNFTs(nftsArray);
          },
          onError: (error) => {
            console.log("failed:", error);
            setSaleNFTs([]);
          },
        });
      }
      getSalesOf(account);
    },[nfts]);

    

    //will run when component unmounted
    useEffect(() => {
        return () => {
            dispatch(clearFilter());
            dispatch(clearNfts());
        }
    },[dispatch]);

    const loadMore = () => {
        dispatch(actions.fetchNftBalancesBreakdown(authorId));
    }

    return (
        <div className='row'>
            {saleNFTs && saleNFTs.map( (nft, index) => (
                nft.category === 'music' ?
                <NftMusicCard nft={nft} audioUrl={nft.audio_url} key={index} onImgLoad={onImgLoad} height={height} />
                :
                <MyNftCard 
                  nft={nft} 
                  key={`${nft.symbol}_${nft.token_id}`}
                  onImgLoad={onImgLoad} 
                  height={height} 
                  setNftToSend={setNftToSend}
                  setVisibility1={setVisibility1}
                  setVisibility2={setVisibility2}
                  onSale={true}
                />
            ))}
            { showLoadMore && nfts.length <= 20 &&
                <div className='col-lg-12'>
                    <div className="spacer-single"></div>
                    <span onClick={loadMore} className="btn-main lead m-auto">Load More</span>
                </div>
            }

        </div>
    );
};

export default memo(MyNFTBalanceOnSale);