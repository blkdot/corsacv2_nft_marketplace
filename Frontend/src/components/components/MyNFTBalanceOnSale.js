import React, { memo, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import * as actions from '../../store/actions/thunks';
import { clearNfts, clearFilter } from '../../store/actions';
import MyNftCard from './MyNftCard';
import NftMusicCard from './NftMusicCard';
import {useMoralisDapp} from "../../providers/MoralisDappProvider/MoralisDappProvider";
import {useMoralis, useWeb3ExecuteFunction, useNFTBalances} from "react-moralis";

//react functional component
const MyNFTBalanceOnSale = ({ showLoadMore = true, authorId = null }) => {

    const dispatch = useDispatch();
    const {data: NFTBalances} = useNFTBalances();
    const nfts = NFTBalances ? NFTBalances.result : [];
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
    
    const listItemFunction = "getSaleInfo";
    
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
              if (salesInfo.method._hex === 0x00 && salesInfo.seller.toLowerCase() === seller.toLowerCase()) {
                const temp = nfts.filter((nft, idx) => {
                  return (nft.token_address.toLowerCase() === salesInfo.sc.toLowerCase() && 
                      nft.token_id === salesInfo.tokenId.toString());
                });
                nftsArray.push(...temp);
              }
            });
            nftsArray.map((e, index) => {
              e.onSale = true;
              e.onAuction = false;
              e.onOffer = false;
            })
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