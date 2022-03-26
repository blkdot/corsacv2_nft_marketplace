import React, { memo, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as selectors from '../../store/selectors';
import * as actions from '../../store/actions/thunks';
import MyNftCard from './MyNftCard';
import NftMusicCard from './NftMusicCard';
import { clearNfts, clearFilter } from '../../store/actions';
import {useMoralisDapp} from "../../providers/MoralisDappProvider/MoralisDappProvider";
import {useChain, useMoralis, useWeb3ExecuteFunction, useNFTBalances, useMoralisQuery} from "react-moralis";
import { navigate } from '@reach/router';


const Explore3Cols = ({showLoadMore = true}) => {

    const dispatch = useDispatch();
    // const {data: NFTBalances} = useNFTBalances();
    // const nftItems = useSelector(selectors.nftItems);
    // const nfts = NFTBalances ? NFTBalances.result : [];
    const [nfts, setNFTs] = useState([]);
    const [saleNFTs, setSaleNFTs] = useState([]);
    const contractProcessor = useWeb3ExecuteFunction();
    const {marketAddress, contractABI} = useMoralisDapp();
    const listItemFunction = "getSaleInfo";
    const {Moralis, account} = useMoralis();
    const {chainId} = useChain();
    const queryMarketItems = useMoralisQuery("ListedOnSale");

    const [height, setHeight] = useState(0);

    const fallbackImg =
      "data:image/png;base64,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";

    const onImgLoad = ({target:img}) => {
      let currentHeight = height;
      if(currentHeight < img.offsetHeight) {
          setHeight(img.offsetHeight);
      }
    }

    useEffect(() => {
      async function getSalesInfo() {
        const web3 = await Moralis.enableWeb3();
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
            console.log("success");
            setSaleNFTs(result);
          },
          onError: (error) => {
            console.log("failed:", error);
            setSaleNFTs([]);
          },
        });
      }
      
      getSalesInfo();
    },[]);

    useEffect(() => {
      async function fetchAPIData() {
        console.log(chainId);
        if (saleNFTs && saleNFTs.length > 0) {
          const promises = [];
          
          for (let saleInfo of saleNFTs) {
            const options = {
              address: saleInfo.sc,
              chain: chainId
            };
            try {
              const web3 = await Moralis.enableWeb3();
              const result = await Moralis.Web3API.token.getAllTokenIds(options);
              
              const temp = result?.result.filter((nft, index) => {
                return nft.token_id == saleInfo.tokenId.toString();
              });
              
              promises.push(...temp);
            } catch (e) {
              console.log(e);
            }
          }

          console.log("NFTs:", promises);

          for (let nft of promises) {
            if (!nft.metadata) {
              // const options = {
              //   address: nft.token_address,
              //   token_id: nft.token_id,
              //   flag: "uri",
              //   chain: chainId
              // };
              // const result = await Moralis.Web3API.token.reSyncMetadata(options);
              // const options1 = {
              //   address: nft.token_address,
              //   token_id: nft.token_id,
              //   chain: chainId
              // };
              // const tokenIdMetadata = await Moralis.Web3API.token.getTokenIdMetadata(options1);
              // if (tokenIdMetadata.token_uri) {
              //   await fetch((tokenIdMetadata.token_uri))
              //     .then((response) => response.json())
              //     .then((data) => {
              //       nft.imagePath = data.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
              //     })
              // } else {
              //   nft.imagePath = fallbackImg;
              // }
              nft.imagePath = fallbackImg;
            } else {
              nft.imagePath = JSON.parse(nft.metadata).image.replace('ipfs://', 'https://ipfs.io/ipfs/');
            }
          }

          console.log("NFTs111:", promises);
          setNFTs(promises);
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
                // <NftCard nft={nft} key={index} onImgLoad={onImgLoad} height={height} className="d-item col-lg-4 col-md-6 col-sm-6 col-xs-12 mb-4" />
                nft.category === 'music' ?
                <NftMusicCard nft={nft} audioUrl={nft.audio_url} key={index} onImgLoad={onImgLoad} height={height} />
                :
                <MyNftCard 
                  nft={nft} 
                  key={index}
                  onImgLoad={onImgLoad} 
                  height={height} 
                  className="d-item col-lg-4 col-md-6 col-sm-6 col-xs-12 mb-4"
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
}

export default memo(Explore3Cols);