import React, { memo, useEffect, useState } from "react";
import { useChain, useMoralisWeb3Api, useMoralis } from "react-moralis";
import BigNumber from 'bignumber.js';
import { getSymbolByChainId } from '../../utils';

const BalanceTokens = () => {
    
    const Web3Api = useMoralisWeb3Api();
		const {account} = useMoralis();
		const {chainId} = useChain();

    const [nativeBalance, setNativeBalance] = useState(null);
    const [balances, setBalances] = useState([]);

    // const [tokens, setTokens] = useState([]);
    const [native, setNative] = useState(null);

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
      }
      
      getTokens();
    }, []);

    useEffect(() => {
      if (nativeBalance) {
        const ts = [];
        const nb = {};

        nb.symbol = getSymbolByChainId(chainId);
        nb.balance = new BigNumber(nativeBalance.balance).dividedBy(new BigNumber(10).pow(18)).toNumber()

        balances.map((b) => {
          ts.push({
            symbol: b.symbol, 
            balance: new BigNumber(b.balance).dividedBy(new BigNumber(10).pow(b.decimals)).toNumber()
          });
        });

        // setTokens(ts);
        setNative(nb);
      }
    }, [balances, nativeBalance]);

    return (
      <div className="d-balance">
        <h4>Balance</h4>
        {native && (
        <p>{native.balance} {native.symbol}</p>
        )}
        {/* {tokens && tokens.map((token, index) => (
          <p key={index}>{token.balance} {token.symbol}</p>
        ))} */}
      </div>
    );
};
export default memo(BalanceTokens);