import React, { memo, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as selectors from '../../store/selectors';
import * as actions from '../../store/actions/thunks';
import NftCard from './NftCard';
import { clearNfts, clearFilter } from '../../store/actions';
import {useMoralisDapp} from "../../providers/MoralisDappProvider/MoralisDappProvider";
import {useChain, useMoralis, useWeb3ExecuteFunction, useNFTBalances, useMoralisQuery} from "react-moralis";


const Explore3Cols = () => {

    const dispatch = useDispatch();
    // const {data: NFTBalances} = useNFTBalances();
    // const nftItems = useSelector(selectors.nftItems);
    // const nfts = NFTBalances ? NFTBalances.result : [];
    const nfts = [];
    const [saleNFTs, setSaleNFTs] = useState([]);
    const contractProcessor = useWeb3ExecuteFunction();
    const {marketAddress, contractABI} = useMoralisDapp();
    const contractABIJson = JSON.parse(contractABI);
    const listItemFunction = "getSaleInfo";
    const {Moralis, account} = useMoralis();
    const {chainId} = useChain();
    const queryMarketItems = useMoralisQuery("ListedOnSale");

    const [height, setHeight] = useState(0);

    const onImgLoad = ({target:img}) => {
      let currentHeight = height;
      if(currentHeight < img.offsetHeight) {
          setHeight(img.offsetHeight);
      }
    }

    useEffect(() => {
      async function getSalesInfo(seller) {
        const ops = {
          contractAddress: marketAddress,
          functionName: listItemFunction,
          abi: contractABIJson,
          params: {
            startIdx: 0,
            count: 100000
          },
        };
        console.log("calling getSalesInfo...");
        await contractProcessor.fetch({
          params: ops,
          onSuccess: (result) => {
            console.log("success");
            console.log(result);
            setSaleNFTs(result);
          },
          onError: (error) => {
            console.log("failed:", error);
            setSaleNFTs([]);
          },
        });
      }
      getSalesInfo(account);
    },[]);

    useEffect(() => {
      function fetchAPIData() {
        console.log(chainId);
        if (saleNFTs && saleNFTs.length > 0) {
          const promises = [];
          saleNFTs.map(async (saleInfo, index) => {
            const options = {address: saleInfo.sc, chain: chainId };
            try {
              const result = await Moralis.Web3API.token.getAllTokenIds(options);
              console.log("result111:", result.result);
              promises.push(result);
            } catch (e) {
              console.log(e);
            }
          });

          console.log("NFTs:", promises);
        }
      }

      fetchAPIData();
    }, [saleNFTs]);
    
    // useEffect(() => {
    //     dispatch(actions.fetchNftsBreakdown());
    // }, [dispatch]);

    //will run when component unmounted
    useEffect(() => {
        return () => {
            dispatch(clearFilter());
            dispatch(clearNfts());
        }
    },[dispatch]);
    
    const loadMore = () => {
        dispatch(actions.fetchNftsBreakdown());
    }
    
  return (
    <div className='row'>
        {nfts && nfts.map( (nft, index) => (
                <NftCard nft={nft} key={index} onImgLoad={onImgLoad} height={height} className="d-item col-lg-4 col-md-6 col-sm-6 col-xs-12 mb-4" />
            ))}
        { nfts.length <= 20 &&
            <div className='col-lg-12'>
                <div className="spacer-single"></div>
                <span onClick={loadMore} className="btn-main lead m-auto">Load More</span>
            </div>
        }
    </div>              
    );
}

export default memo(Explore3Cols);