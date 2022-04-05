import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import MoralisDappContext from "./context";

function MoralisDappProvider({ children }) {
  const { web3, Moralis, user } = useMoralis();
  const [walletAddress, setWalletAddress] = useState();
  const [chainId, setChainId] = useState();
  
  // ERC-20 token contract address and ABI
  const [corsacTokenAddress, setCorsacTokenAddress] = 
    useState('0x0b1B6859b760911D8d60BDB46728D96dbdc3062c');
  const corsacTokenABI = require("../../contracts/corsac-token.json");
  
  //Marketplace contract address and ABI here  
  const [marketAddress, setMarketAddress] = useState("0xAD3a37891DE6046F5eE7F551812B7213C51d0a87");
  const contractABI = require("../../contracts/marketplace.json");
  
  // console.log(web3, Moralis, user);
  // useEffect(() => {
  //   Moralis.onChainChanged(function (chain) {
  //     setChainId(chain);
  //   });

  //   Moralis.onAccountsChanged(function (address) {
  //     setWalletAddress(address[0]);
  //   });
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // useEffect(() => setChainId(web3.givenProvider?.chainId));
  // useEffect(
  //   () => setWalletAddress(web3.givenProvider?.selectedAddress || user?.get("ethAddress")),
  //   [web3, user]
  // );

  return (
    <MoralisDappContext.Provider value={{ 
        walletAddress, 
        chainId, 
        corsacTokenAddress, 
        setCorsacTokenAddress,
        corsacTokenABI,
        marketAddress, 
        setMarketAddress, 
        contractABI
      }}
    >
      {children}
    </MoralisDappContext.Provider>
  );
}

function useMoralisDapp() {
  const context = React.useContext(MoralisDappContext);
  if (context === undefined) {
    throw new Error("useMoralisDapp must be used within a MoralisDappProvider");
  }
  return context;
}

export { MoralisDappProvider, useMoralisDapp };
