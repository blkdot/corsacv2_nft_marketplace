import React, { memo, useEffect, useState } from "react";
import Slider from "react-slick";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { carouselCollectionSingle } from './constants';
import { useSelector, useDispatch } from 'react-redux';
import * as selectors from '../../store/selectors';
import { fetchNftShowcase } from "../../store/actions/thunks";
import { navigate } from "@reach/router";
import api from "../../core/api";
import axios from "axios";
import { useMoralisDapp } from "../../providers/MoralisDappProvider/MoralisDappProvider";
import { useChain, useMoralis, useMoralisWeb3Api, useWeb3ExecuteFunction, useMoralisQuery } from "react-moralis";


const SliderCarouselHome = () => {

  // const dispatch = useDispatch();
  // const nftsState = useSelector(selectors.nftShowcaseState);
  // const nfts = nftsState.data ? nftsState.data : [];
  
  // useEffect(() => {
  //     dispatch(fetchNftShowcase());
  // }, [dispatch]);

  const navigateTo = (link) => {
      navigate(link);
  }

  const [payments, setPayments] = useState([]);
  const [nfts, setNfts] = useState([]);
  const [sales, setSales] = useState([]);

  const contractProcessor = useWeb3ExecuteFunction();
  const { marketAddress, contractABI, corsacTokenAddress } = useMoralisDapp();
  const Web3Api = useMoralisWeb3Api();
  const { Moralis, account } = useMoralis();
  const { chainId } = useChain();

  const getSalesInfo = async () => {
    if (window.web3 === undefined && window.ethereum === undefined)
      return;

    const ops = {
      contractAddress: marketAddress,
      functionName: "getSaleInfo",
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
        setSales(result);
      },
      onError: (error) => {
        console.log("failed:getSalesInfo", error);
        setSales([]);
      },
    });
  };

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

  useEffect(async () => {
    const isWeb3Active = Moralis.ensureWeb3IsInstalled();
    if (!isWeb3Active) {
      await Moralis.enableWeb3();
    }

    getPayments();
    getSalesInfo();
  }, []);

  useEffect(() => {
    console.log(sales);
  }, [sales]);

  return (
    <div className='nft-big'>
      <Slider {...carouselCollectionSingle}>
        {nfts && nfts.map( (nft, index) => (
          <div onClick={() => navigateTo(nft.nft_link)} className='itm' index={index+1} key={index}>
            <div className="nft_pic">                            
              <span>
                <span className="nft_pic_info">
                  <span className="nft_pic_title">{nft.title}</span>
                  <span className="nft_pic_by">{nft.author.username}</span>
                </span>
              </span>
              <div className="nft_pic_wrap">
                <img src={api.baseUrl + nft.preview_image.url} className="lazy img-fluid" alt=""/>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default memo(SliderCarouselHome);
