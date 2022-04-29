import React, { memo, useEffect, useState } from 'react';
import MyNftCard from './MyNftCard';
import NftMusicCard from './NftMusicCard';
import { useMoralisDapp } from "../../providers/MoralisDappProvider/MoralisDappProvider";
import { useChain, useMoralis, useMoralisWeb3Api, useWeb3ExecuteFunction, useMoralisQuery } from "react-moralis";
import { Spin } from "antd";
import styled from 'styled-components';
import BigNumber from 'bignumber.js';
import axios from "axios";

const StyledSpin = styled(Spin)`
  .ant-spin-dot-item {
    background-color: #FF343F;
  }
  .ant-spin-text {
    color: #FF343F;
  }
`

const Explore3Cols = ({filterCategories, filterSaleTypes, filterPayments, filterCollections}) => {
  const [payments, setPayments] = useState([]);
  const [nfts, setNFTs] = useState([]);
  const [saleNFTs, setSaleNFTs] = useState([]);

  const [isExplorerLoading, setIsExplorerLoading] = useState(true);

  const contractProcessor = useWeb3ExecuteFunction();
  const { marketAddress, contractABI, corsacTokenAddress } = useMoralisDapp();
  const listItemFunction = "getSaleInfo";
  const Web3Api = useMoralisWeb3Api();
  const { Moralis, account } = useMoralis();
  const { chainId } = useChain();
  const { data, error, isLoading } = useMoralisQuery("SalesList");
  const fetchMarketItems = JSON.parse(
    JSON.stringify(data, [
      "saleId",
      "creator",
      "seller",
      "sc",
      "tokenId",
      "copy",
      "payment",
      "basePrice",
      "method",
      "startTime",
      "endTime",
      "feeRatio",
      "royaltyRatio",
      "confirmed"
    ])
  );
  const getMarketItem = (nft) => {
    const result = fetchMarketItems?.find(
      (e) =>
        parseInt(e.saleId) === parseInt(nft?.saleId._hex) &&
        e.sc.toLowerCase() === nft?.token_address.toLowerCase() &&
        e.tokenId === nft?.token_id 
        // && e.confirmed === true
    );
    return result;
  };

  const [height, setHeight] = useState(0);

  const fallbackImg =
    "data:image/png;base64,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";

  const onImgLoad = ({target:img}) => {
    let currentHeight = height;
    if(currentHeight < img.offsetHeight) {
        setHeight(img.offsetHeight);
    }
  }

  async function getSalesInfo() {
    if (window.web3 === undefined && window.ethereum === undefined)
      return;
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
        console.log("success:getSalesInfo");
        // console.log(ops);
        // console.log(result);
        setSaleNFTs(result);
      },
      onError: (error) => {
        console.log("failed:getSalesInfo", error);
        setSaleNFTs([]);
      },
    });
  }

  async function getPayments() {
    try {
      await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/payments`, {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          allowed: 1
        }
      }).then(async res => {
        let payments = [];
        for (let p of res.data.payments) {
          payments.push({
            value: p.id, 
            label: p.title + " (" + p.symbol + ")", 
            addr: p.addr, 
            title: p.title, 
            type: p.type,
            symbol: p.symbol,
            decimals: p.decimals
          });
        }
        setPayments(payments);
      });
    } catch {
      console.log('error in fetching payments');
    }
  }

  const getNFTCreator = async (walletAddr) => {
    let creator = null;
    
    await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/user`, {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        walletAddr: walletAddr.toLowerCase()
      }
    }).then(res => {
      creator = res.data.user;
    }).catch(err => {
      console.log(err);
      creator = null;
    });
            
    return creator;
  };

  async function fetchAPIData() {
    // const web3 = await Moralis.enableWeb3();
    const ops = {
      chain: chainId,
      address: account
    };
    
    // const balances = await Web3Api.account.getTokenBalances(ops);
    // const token = balances.filter((t, index) => {
    //   return t.token_address.toLowerCase() == corsacTokenAddress.toLowerCase();
    // });

    if (saleNFTs && saleNFTs.length > 0) {
      const promises = [];
      // console.log("fetchMarketItems:", fetchMarketItems);
      // console.log("saleNFTs:", saleNFTs);
      
      for (let saleInfo of saleNFTs) {
        const options = {
          address: saleInfo.sc,
          chain: chainId
        };
        try {
          const result = await Moralis.Web3API.token.getAllTokenIds(options);
          
          const temp = result?.result.filter((nft, index) => {
            return parseInt(nft.token_id) === parseInt(saleInfo.tokenId.toString());
          });
          
          if (temp.length > 0) {
            temp[0].saleId = saleInfo.saleId;

            //get price by payment
            if (payments.length >= parseInt(saleInfo.payment) + 1) {
              const payment = payments[parseInt(saleInfo.payment)];
              temp[0].price = new BigNumber(saleInfo.basePrice._hex).dividedBy(new BigNumber(10).pow(payment.decimals)).toNumber();
              temp[0].payment = payment;
            }

            // if (token.length > 0) {
            //   temp[0].price = new BigNumber(saleInfo.basePrice._hex).dividedBy(new BigNumber(10).pow(token[0].decimals)).toNumber();
            //   temp[0].price_symbol = token[0].symbol;
            // }
          }

          promises.push(...temp);
        } catch (e) {
          console.log(e);
        }
      }

      // console.log("NFTs:", promises);
      let filteredNfts = [];
      for (let nft of promises) {
        if (!nft.metadata) {
          // const options = {
          //   address: nft.token_address,
          //   token_id: nft.token_id,
          //   flag: "uri",
          //   chain: chainId
          // };
          // const result = await Moralis.Web3API.token.reSyncMetadata(options);
          const options1 = {
            address: nft.token_address,
            token_id: nft.token_id,
            chain: chainId
          };
          const tokenIdMetadata = await Moralis.Web3API.token.getTokenIdMetadata(options1);
          if (tokenIdMetadata.token_uri) {
            await fetch((tokenIdMetadata.token_uri))
              .then((response) => response.json())
              .then((data) => {
                nft.image = data.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
                nft.metadata = data;
              }).catch(function() {
                console.log("error: getting uri");
                nft.image = fallbackImg;
              });
          } else {
            nft.image = fallbackImg;
          }
          // nft.image = fallbackImg;
        } else {
          if (typeof nft.metadata === "string") {
            nft.metadata = JSON.parse(nft.metadata);
          }
          
          nft.image = nft.metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
        }

        //get creator of NFT
        nft.creator = nft.metadata && nft.metadata.creator ? await getNFTCreator(nft.metadata.creator) : null;

        const marketItem = getMarketItem(nft);
        // console.log("nft:", nft);
        // console.log("marketItem from Moralis:", marketItem);
        
        if (marketItem !== undefined && marketItem !== null) {
          nft.seller = marketItem.seller;

          //get author/seller info
          try {
            await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/user`, {
              headers: {
                'Content-Type': 'application/json',
              },
              params: {
                walletAddr: nft.seller.toLowerCase()
              }
            }).then(res => {
              nft.author = res.data.user;
            });
          } catch (err) {
            console.log("fetching user error:", err);
            nft.author = null;
          }

          if (parseInt(marketItem.method) === 0x00) {
            nft.onAuction = false;
            nft.onSale = true;
            nft.onOffer = false;
          } else if (parseInt(marketItem.method) === 0x01) {
            nft.onAuction = true;
            nft.onSale = false;
            nft.onOffer = false;
            nft.endTime = marketItem.endTime;
            nft.confirmed = marketItem.confirmed;
          } else {
            nft.onAuction = false;
            nft.onSale = false;
            nft.onOffer = true;
          }
        } else {
          nft.onAuction = false;
          nft.onSale = false;
          nft.onOffer = false;
        }

        //apply filters
        const cat = nft.metadata && nft.metadata.collection ? nft.metadata.collection.category : null;
        const saleType = nft.onSale ? 0 : nft.onAuction ? 1 : nft.onOffer ? 2 : null;
        const payment = nft.payment ? nft.payment.value : null;
        const collection = nft.metadata && nft.metadata.collection ? nft.metadata.collection.addr : null;
        
        let flag = true;
        if (filterCategories.length > 0) {
          const fc = filterCategories.filter((c, index) => {
            return c.value === cat;
          });

          if (fc.length === 0) {
            flag = false;
          }
        }

        if (filterSaleTypes.length > 0) {
          const fs = filterSaleTypes.filter((c, index) => {
            return parseInt(c.value) === parseInt(saleType);
          });

          if (fs.length === 0) {
            flag = false;
          }
        }

        if (filterPayments.length > 0) {
          const fp = filterPayments.filter((c, index) => {
            return parseInt(c.value) === parseInt(payment);
          });

          if (fp.length === 0) {
            flag = false;
          }
        }

        if (filterCollections.length > 0) {
          const fcc = filterCollections.filter((c, index) => {
            return c.value === collection;
          });

          if (fcc.length === 0) {
            flag = false;
          }
        }

        if (flag) {
          filteredNfts.push(nft);
        }
      }

      // console.log("NFTs:", filteredNfts);
      setNFTs(filteredNfts);
    }
    
    setIsExplorerLoading(false);
  }

  useEffect(async () => {
    setIsExplorerLoading(true);
    await getPayments();
    await getSalesInfo();
  }, [filterCategories, filterSaleTypes, filterPayments, filterCollections]);

  useEffect(() => {
    if (isLoading && nfts.length == 0) {
      setIsExplorerLoading(true);
    } else {
      if (fetchMarketItems.length > 0) {
        fetchAPIData();
      } else {
        setIsExplorerLoading(false);
      }
    }
    
  }, [saleNFTs, isLoading, fetchMarketItems.length]);

  return (
    <div className='row'>
        {isExplorerLoading && 
          <StyledSpin tip="Loading..." size="large" />
        }
        {!isExplorerLoading && nfts.length == 0 &&
          <div className="alert alert-danger" role="alert">
            No items
          </div>
        }
        {!isExplorerLoading && nfts && nfts.map( (nft, index) => (
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
                  page="explore"
                />
            ))}
    </div>              
    );
}

export default memo(Explore3Cols);