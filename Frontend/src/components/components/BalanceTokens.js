import React, { memo, useEffect, useState } from "react";
import { useChain, useMoralisWeb3Api, useMoralis } from "react-moralis";
import BigNumber from 'bignumber.js';
import { getSymbolByChainId } from '../../utils';
import { mainnetChainID, wbnbAddr } from "./constants";
import { Spin } from "antd";
import styled from 'styled-components';

const StyledSpin = styled(Spin)`
  .ant-spin-dot-item {
    background-color: #FF343F;
  }
  .ant-spin-text {
    color: #FF343F;
  }
`

const BalanceTokens = () => {
    
    const Web3Api = useMoralisWeb3Api();
		const {account} = useMoralis();
		const {chainId} = useChain();

    const [nativeBalance, setNativeBalance] = useState(null);
    const [balances, setBalances] = useState([]);

    const [tokens, setTokens] = useState([]);
    const [native, setNative] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
      async function getTokens() {
        const options = {
          chain: chainId,
          address: account
        };
        const bs = await Web3Api.account.getTokenBalances(options);
        const nb = await Web3Api.account.getNativeBalance(options);

        setBalances(bs);
        setNativeBalance(nb);
        setLoading(false);
      }
      
      setLoading(true);
      getTokens();
    }, [account]);

    useEffect(() => {
      async function getTokenBalances() {
        const ts = [];
        const nb = {};

        nb.symbol = getSymbolByChainId(chainId);
        nb.balance = new BigNumber(nativeBalance.balance).dividedBy(new BigNumber(10).pow(18)).toNumber();

        const options = {
          address: wbnbAddr,
          chain: mainnetChainID,
          exchange: 'pancakeswap-v2'
        };
        const wbnb = await Web3Api.token.getTokenPrice(options);
        nb.usd = wbnb.usdPrice * nb.balance;

        for (const b of balances) {
          const balance = new BigNumber(b.balance).dividedBy(new BigNumber(10).pow(b.decimals)).toNumber();

          // const options = {
          //   address: b.token_address,
          //   chain: mainnetChainID,
          //   exchange: 'pancakeswap-v2'
          // };

          let usd = 0;

          // try {
          //   const price = await Web3Api.token.getTokenPrice(options);
          //   usd = price.usdPrice * balance;
          // } catch(e) {
          //   console.log(e);
          //   usd = 0;
          // }
          
          ts.push({
            symbol: b.symbol, 
            balance: balance,
            usd: usd
          });
        }

        setTokens(ts);
        setNative(nb);
        setLoading(false);
      }

      if (nativeBalance) {
        setLoading(true);
        getTokenBalances();
      }
    }, [balances, nativeBalance]);

    return (
      <div className="d-balance">
        <h4>Balances</h4>
        <div style={{overflowY: 'auto', maxHeight: '180px'}}>
          {loading &&
            <p className="mt-1 mb-1 text-center">
              <StyledSpin size="small" />
            </p>
          }
          {!loading && native && 
            <p><strong>{native.balance.toFixed(3)} BNB</strong> (${native.usd.toFixed(3)})</p>
          }
          {!loading && tokens && tokens.map((token, index) => (
            <p key={index}>{token.balance.toFixed(3)} {token.symbol} (${token.usd.toFixed(3)})</p>
          ))}
        </div>
      </div>
    );
};
export default memo(BalanceTokens);