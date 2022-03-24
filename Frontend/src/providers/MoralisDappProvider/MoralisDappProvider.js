import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import MoralisDappContext from "./context";

function MoralisDappProvider({ children }) {
  const { web3, Moralis, user } = useMoralis();
  const [corsacTokenAddress, setCorsacTokenAddress] = 
    useState('0x5698ec5045E685a1399cf0c8a4f3a40883d870a1');
  const [walletAddress, setWalletAddress] = useState();
  const [chainId, setChainId] = useState();
   //Smart Contract ABI here  
  const [contractABI, setContractABI] = useState('[{"inputs":[{"internalType":"address","name":"singleCollectionDeployer","type":"address"},{"internalType":"address","name":"multipleCollectionDeployer","type":"address"}],"stateMutability":"payable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"winner","type":"address"},{"indexed":false,"internalType":"uint256","name":"saleId","type":"uint256"},{"components":[{"internalType":"uint256","name":"saleId","type":"uint256"},{"internalType":"address","name":"creator","type":"address"},{"internalType":"address","name":"seller","type":"address"},{"internalType":"address","name":"sc","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"copy","type":"uint256"},{"internalType":"uint256","name":"payment","type":"uint256"},{"internalType":"uint256","name":"basePrice","type":"uint256"},{"internalType":"uint256","name":"method","type":"uint256"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"endTime","type":"uint256"},{"internalType":"uint256","name":"feeRatio","type":"uint256"},{"internalType":"uint256","name":"royaltyRatio","type":"uint256"}],"indexed":false,"internalType":"struct CorsacNFTFactory.CorsacNFTSale","name":"ti","type":"tuple"}],"name":"AcceptOffer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"winner","type":"address"},{"indexed":false,"internalType":"uint256","name":"totalPrice","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"serviceFee","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"saleId","type":"uint256"},{"components":[{"internalType":"uint256","name":"saleId","type":"uint256"},{"internalType":"address","name":"creator","type":"address"},{"internalType":"address","name":"seller","type":"address"},{"internalType":"address","name":"sc","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"copy","type":"uint256"},{"internalType":"uint256","name":"payment","type":"uint256"},{"internalType":"uint256","name":"basePrice","type":"uint256"},{"internalType":"uint256","name":"method","type":"uint256"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"endTime","type":"uint256"},{"internalType":"uint256","name":"feeRatio","type":"uint256"},{"internalType":"uint256","name":"royaltyRatio","type":"uint256"}],"indexed":false,"internalType":"struct CorsacNFTFactory.CorsacNFTSale","name":"saleInfo","type":"tuple"}],"name":"AuctionResult","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"saleId","type":"uint256"},{"components":[{"internalType":"uint256","name":"saleId","type":"uint256"},{"internalType":"address","name":"creator","type":"address"},{"internalType":"address","name":"seller","type":"address"},{"internalType":"address","name":"sc","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"copy","type":"uint256"},{"internalType":"uint256","name":"payment","type":"uint256"},{"internalType":"uint256","name":"basePrice","type":"uint256"},{"internalType":"uint256","name":"method","type":"uint256"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"endTime","type":"uint256"},{"internalType":"uint256","name":"feeRatio","type":"uint256"},{"internalType":"uint256","name":"royaltyRatio","type":"uint256"}],"indexed":false,"internalType":"struct CorsacNFTFactory.CorsacNFTSale","name":"saleInfo","type":"tuple"}],"name":"Buy","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"enum ICorsacNFTFactory.CollectionType","name":"collectionType","type":"uint8"},{"indexed":true,"internalType":"address","name":"from","type":"address"}],"name":"CollectionAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"factory","type":"address"},{"indexed":true,"internalType":"address","name":"newContract","type":"address"}],"name":"CreatedCorsacERC1155","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"factory","type":"address"},{"indexed":true,"internalType":"address","name":"newContract","type":"address"}],"name":"CreatedCorsacERC721","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"saleId","type":"uint256"},{"components":[{"internalType":"uint256","name":"saleId","type":"uint256"},{"internalType":"address","name":"creator","type":"address"},{"internalType":"address","name":"seller","type":"address"},{"internalType":"address","name":"sc","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"copy","type":"uint256"},{"internalType":"uint256","name":"payment","type":"uint256"},{"internalType":"uint256","name":"basePrice","type":"uint256"},{"internalType":"uint256","name":"method","type":"uint256"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"endTime","type":"uint256"},{"internalType":"uint256","name":"feeRatio","type":"uint256"},{"internalType":"uint256","name":"royaltyRatio","type":"uint256"}],"indexed":false,"internalType":"struct CorsacNFTFactory.CorsacNFTSale","name":"saleInfo","type":"tuple"}],"name":"ListedOnSale","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"saleId","type":"uint256"},{"components":[{"internalType":"uint256","name":"saleId","type":"uint256"},{"internalType":"address","name":"creator","type":"address"},{"internalType":"address","name":"seller","type":"address"},{"internalType":"address","name":"sc","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"copy","type":"uint256"},{"internalType":"uint256","name":"payment","type":"uint256"},{"internalType":"uint256","name":"basePrice","type":"uint256"},{"internalType":"uint256","name":"method","type":"uint256"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"endTime","type":"uint256"},{"internalType":"uint256","name":"feeRatio","type":"uint256"},{"internalType":"uint256","name":"royaltyRatio","type":"uint256"}],"indexed":false,"internalType":"struct CorsacNFTFactory.CorsacNFTSale","name":"ti","type":"tuple"}],"name":"MakeOffer","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"enum ICorsacNFTFactory.CollectionType","name":"collectionType","type":"uint8"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"NewCollectionCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"id","type":"uint256"},{"indexed":true,"internalType":"address","name":"tokenAddress","type":"address"}],"name":"PaymentTokenSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"bidPrice","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"saleId","type":"uint256"},{"components":[{"internalType":"uint256","name":"saleId","type":"uint256"},{"internalType":"address","name":"creator","type":"address"},{"internalType":"address","name":"seller","type":"address"},{"internalType":"address","name":"sc","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"copy","type":"uint256"},{"internalType":"uint256","name":"payment","type":"uint256"},{"internalType":"uint256","name":"basePrice","type":"uint256"},{"internalType":"uint256","name":"method","type":"uint256"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"endTime","type":"uint256"},{"internalType":"uint256","name":"feeRatio","type":"uint256"},{"internalType":"uint256","name":"royaltyRatio","type":"uint256"}],"indexed":false,"internalType":"struct CorsacNFTFactory.CorsacNFTSale","name":"saleInfo","type":"tuple"}],"name":"PlaceBid","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"saleId","type":"uint256"},{"components":[{"internalType":"uint256","name":"saleId","type":"uint256"},{"internalType":"address","name":"creator","type":"address"},{"internalType":"address","name":"seller","type":"address"},{"internalType":"address","name":"sc","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"copy","type":"uint256"},{"internalType":"uint256","name":"payment","type":"uint256"},{"internalType":"uint256","name":"basePrice","type":"uint256"},{"internalType":"uint256","name":"method","type":"uint256"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"endTime","type":"uint256"},{"internalType":"uint256","name":"feeRatio","type":"uint256"},{"internalType":"uint256","name":"royaltyRatio","type":"uint256"}],"indexed":false,"internalType":"struct CorsacNFTFactory.CorsacNFTSale","name":"saleInfo","type":"tuple"}],"name":"RemoveFromSale","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"},{"indexed":false,"internalType":"bool","name":"set","type":"bool"}],"name":"SetCreatorForFactory","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"newFeeRatio","type":"uint256"}],"name":"SetDefaultFeeRatio","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"newRoyaltyRatio","type":"uint256"}],"name":"SetDefaultRoyaltyRatio","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"saleId","type":"uint256"},{"components":[{"internalType":"uint256","name":"saleId","type":"uint256"},{"internalType":"address","name":"creator","type":"address"},{"internalType":"address","name":"seller","type":"address"},{"internalType":"address","name":"sc","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"copy","type":"uint256"},{"internalType":"uint256","name":"payment","type":"uint256"},{"internalType":"uint256","name":"basePrice","type":"uint256"},{"internalType":"uint256","name":"method","type":"uint256"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"endTime","type":"uint256"},{"internalType":"uint256","name":"feeRatio","type":"uint256"},{"internalType":"uint256","name":"royaltyRatio","type":"uint256"}],"indexed":false,"internalType":"struct CorsacNFTFactory.CorsacNFTSale","name":"sale","type":"tuple"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"paySeller","type":"uint256"},{"indexed":false,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"address","name":"winner","type":"address"},{"indexed":false,"internalType":"uint256","name":"fee","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"royalty","type":"uint256"},{"indexed":false,"internalType":"address","name":"devAddress","type":"address"},{"indexed":false,"internalType":"uint256","name":"devFee","type":"uint256"}],"name":"Trade","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"from","type":"address"},{"indexed":false,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"address","name":"collection","type":"address"},{"indexed":false,"internalType":"uint256[]","name":"ids","type":"uint256[]"},{"indexed":false,"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"name":"TransferNFTs","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"singleCollectionDeployer","type":"address"},{"indexed":true,"internalType":"address","name":"multipleCollectionDeployer","type":"address"}],"name":"UpdateDeployers","type":"event"},{"inputs":[],"name":"DELAY_PERIOD","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"saleId","type":"uint256"}],"name":"acceptOffer","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"}],"name":"addCollection","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"saleId","type":"uint256"}],"name":"buy","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"enum ICorsacNFTFactory.CollectionType","name":"collectionType","type":"uint8"},{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_symbol","type":"string"},{"internalType":"string","name":"_uri","type":"string"}],"name":"createNewCollection","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sc","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"payment","type":"uint256"},{"internalType":"uint256","name":"copy","type":"uint256"},{"internalType":"uint256","name":"method","type":"uint256"},{"internalType":"uint256","name":"duration","type":"uint256"},{"internalType":"uint256","name":"basePrice","type":"uint256"},{"internalType":"uint256","name":"feeRatio","type":"uint256"},{"internalType":"uint256","name":"royaltyRatio","type":"uint256"},{"internalType":"uint256","name":"isOther","type":"uint256"}],"name":"createSale","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"defaultFeeRatio","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"defaultRoyaltyRatio","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"devAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"endPendingCreator","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"saleId","type":"uint256"}],"name":"finalizeAuction","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"getCollection","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getCollections","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getPaymentToken","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getRecentCollection","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"startIdx","type":"uint256"},{"internalType":"uint256","name":"count","type":"uint256"}],"name":"getSaleInfo","outputs":[{"components":[{"internalType":"uint256","name":"saleId","type":"uint256"},{"internalType":"address","name":"creator","type":"address"},{"internalType":"address","name":"seller","type":"address"},{"internalType":"address","name":"sc","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"copy","type":"uint256"},{"internalType":"uint256","name":"payment","type":"uint256"},{"internalType":"uint256","name":"basePrice","type":"uint256"},{"internalType":"uint256","name":"method","type":"uint256"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"endTime","type":"uint256"},{"internalType":"uint256","name":"feeRatio","type":"uint256"},{"internalType":"uint256","name":"royaltyRatio","type":"uint256"}],"internalType":"struct CorsacNFTFactory.CorsacNFTSale[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"collectionAddr","type":"address"}],"name":"getTokenId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"sc","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"copy","type":"uint256"},{"internalType":"uint256","name":"payment","type":"uint256"},{"internalType":"uint256","name":"unitPrice","type":"uint256"},{"internalType":"uint256","name":"duration","type":"uint256"}],"name":"makeOffer","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"collectionAddr","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"string","name":"uri","type":"string"}],"name":"mintTo","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"saleId","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"}],"name":"placeBid","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"saleId","type":"uint256"}],"name":"removeSale","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"saleCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"newFeeRatio","type":"uint256"}],"name":"setDefaultFeeRatio","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newRoyaltyRatio","type":"uint256"}],"name":"setDefaultRoyaltyRatio","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"addr","type":"address"}],"name":"setDevAddr","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tId","type":"uint256"},{"internalType":"address","name":"tokenAddr","type":"address"}],"name":"setPaymentToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"bool","name":"set","type":"bool"}],"name":"startPendingCreator","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"singleCollectionDeployer","type":"address"},{"internalType":"address","name":"multipleCollectionDeployer","type":"address"}],"name":"updateDeployers","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}]');
  // const [marketAddress, setMarketAddress] = useState("0x43710522f81F32C4B8E7731C08D8cd4e37b5c822")
  const [marketAddress, setMarketAddress] = useState("0xdc35331F61Bdc9D241A825966777CBcb992DB1aD");
  //Smart Contract Address Here

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
    <MoralisDappContext.Provider value={{ walletAddress, chainId, marketAddress, corsacTokenAddress, setCorsacTokenAddress, setMarketAddress, contractABI, setContractABI }}>
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
