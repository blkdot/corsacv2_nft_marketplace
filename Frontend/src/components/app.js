import React, { useEffect } from "react";
import { useDispatch } from 'react-redux';
import { useMoralis } from "react-moralis";
import * as actions from '../store/actions/thunks';
import { Router, Location, Redirect, navigate, createHistory } from '@reach/router';
import ScrollToTopBtn from './menu/ScrollToTop';
import Header from './menu/header';
import Home from './pages/home';
import Explore from './pages/explore';
import Author from './pages/Author';
import Wallet from './pages/wallet';
import Activity from './pages/Activity';
import Contact from './pages/contact';
import Profile from './pages/Profile';
import MyNFT from './pages/MyNFT';
import CreateCollection from './pages/createCollection';
import CreateItem from './pages/createItem';
import Collections from './pages/Collections';
import Collection from './pages/collectionDetail';
import MyCollections from "./pages/myCollections";
import LiveAuction from "./pages/LiveAuction";
import About from "./pages/About";
import Faq from "./pages/faq";
import Item from "./pages/Item";

import { createGlobalStyle } from 'styled-components';
import Notification from "./pages/Notification";

const history = createHistory(window);

const GlobalStyles = createGlobalStyle`
  :root {
    scroll-behavior: unset;
  }
`;

export const ScrollTop = ({ children, location }) => {
  useEffect(() => window.scrollTo(0,0), [location])
  return children
}

const PosedRouter = ({ children }) => (
  <Location history={history}>
    {({ location }) => (
      <div id='routerhang'>
        <div key={location.key}>
          <Router location={location}>
            {children}
          </Router>
        </div>
      </div>
    )}
  </Location>
);

const App = ({ isServerInfo }) => {
  const { Moralis, isWeb3Enabled, enableWeb3, isAuthenticated, isWeb3EnableLoading, account } = useMoralis();

  const dispatch = useDispatch();
  const unsubscribe = Moralis.onAccountChanged((account) => {
    dispatch(actions.setCurrentUser(account.toLowerCase()));
    if (isAuthenticated && account) {
      navigate("/profile/" + account.toLowerCase());
    }
  });

  useEffect(() => {
    async function initializeWeb3() {
      const connectorId = window.localStorage.getItem("connectorId");
      // console.log("connectorId:", connectorId);
      console.log("isAuthenticated:", isAuthenticated);
      console.log("isWeb3Enabled:", isWeb3Enabled);
      console.log("isWeb3EnableLoading:", isWeb3EnableLoading);
      // console.log("window.web3:", window.web3);
      // console.log("window.ethereum:", window.ethereum);
      // if (isAuthenticated && account) {
      //   navigate("/profile/" + account.toLowerCase());
      // }
      
      // if ((isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading) || !Moralis.web3 || !Moralis.web3._isProvider) {
      //   if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading) {
      //     await enableWeb3({ provider: connectorId });
      //   }
      // }
  
      if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading) {
        if (connectorId) {
          await enableWeb3({ provider: connectorId });
        } else {
          await enableWeb3();
        }
      }
  
      if (account) {
        dispatch(actions.setCurrentUser(account));
      }  
    }

    initializeWeb3();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isWeb3Enabled, account]);

  return (
    <div className="wraper">
      <GlobalStyles />
      <Header/>
      <PosedRouter>
        <ScrollTop path="/">
          <Home exact path="/">
            <Redirect to="/home" />
          </Home>
          
          <Explore path="/explore" />
          <LiveAuction path="/auctions" />
          <Collections path="/collections" />

          <CreateCollection path="/createCollection" />
          <CreateItem path="/createItem" />
                    
          <Collection path="/collection/:address" />
          <Item path="/collection/:collectionAddr/:tokenId/:ownerAddr" />
          <Item path="/collection/:collectionAddr/:tokenId" />
          
          <Author path="/author/:walletAddr" />
          
          <Profile path="/profile/:userAddr" />
          <MyNFT path="/mynft" />
          <MyCollections path="/myCollections" />

          <Wallet path="/wallet" />

          <Activity path="/activity" />
          <Notification path="/notification" />
          
          <About path="/about" />
          <Faq path="/faq" />
          <Contact path="/contact" />
        </ScrollTop>
      </PosedRouter>
      <ScrollToTopBtn />
    </div>
  );
};
export default App;