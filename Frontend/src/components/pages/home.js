import React from 'react';
import { navigate } from '@reach/router';
import SliderCarouselHome from '../components/SliderCarouselHome';
import NewItems from '../components/NewItems';
import HotCollections from '../components/hotCollections';
import TopSeller from '../components/TopSeller';
import FeatureBox from '../components/FeatureBox';
import Footer from '../components/footer';
import Reveal from 'react-awesome-reveal';
import { keyframes } from "@emotion/react";
//IMPORT DYNAMIC STYLED COMPONENT
import { StyledHeader } from '../Styles';

const fadeInUp = keyframes`
  0% {
    opacity: 0;
    -webkit-transform: translateY(40px);
    transform: translateY(40px);
  }
  100% {
    opacity: 1;
    -webkit-transform: translateY(0);
    transform: translateY(0);
  }
`;


//SWITCH VARIABLE FOR PAGE STYLE
const theme = 'GREY'; //LIGHT, GREY, RETRO

const homethree= () => (
  <div className="greyscheme">
    <StyledHeader theme={theme} />
    <section className="jumbotron no-bg" style={{backgroundImage: `url(${'./img/background/homepage.png'})`}}>
      <div className='container'>
        <div className='row align-items-center'>
          <div className='col-lg-6'>
            <div className="spacer-single"></div>
            <Reveal className='onStep' keyframes={fadeInUp} delay={0} duration={600} triggerOnce>
              <h6 className=""><span className="text-uppercase color">Corsac V2 Market</span></h6>
            </Reveal>
            <div className="spacer-10"></div>
            <Reveal className='onStep' keyframes={fadeInUp} delay={300} duration={600} triggerOnce>
              <h1 className="">Discover Rare Digital Art And Collect NFTs</h1>
            </Reveal>
            <Reveal className='onStep' keyframes={fadeInUp} delay={600} duration={600} triggerOnce>
              <p className=" lead">
                Home to the world’s first custom non-fungible tokens’ (NFT) marketplace transactable via Corsac (CORSAC V2), a hyper deflationary token that is designed to become scarce over time. Holders of Corsac (CORSAC V2) will earn a 9% reward from every Buy/Sell/Transfer in Binance-pegged USD (BUSD), a regulated stable currency, sent straight to holders wallets every hour
              </p>
            </Reveal>
            <div className="spacer-10"></div>
            <Reveal className='onStep' keyframes={fadeInUp} delay={800} duration={900} triggerOnce>
              <div className="" style={{display: "flex", gap: "10px"}}>
              <span onClick={()=> navigate("/explore")} className="btn-main lead">Explore</span>
              <span onClick={()=> navigate("/createItem")} className="btn-main lead">Create</span>
              </div>
              <div className="mb-sm-30"></div>
            </Reveal>
            <div className="spacer-double"></div>
          </div>
          <div className='col-lg-6 px-0'>
            <SliderCarouselHome/>
          </div>
        </div>
      </div>
    </section>

    <section className='container'>
      <div className='container'>
        <div className='row'>
          <div className='col-lg-12'>
            <h2 className='style-2'>New Items</h2>
          </div>
        </div>
        <NewItems />
      </div>
    </section>

    <section className='container no-top'>
      <div className='row'>
        <div className='col-lg-12'>
          <h2 className='style-2'>Hot Collections</h2>
        </div>
      </div>
      <div className='container no-top'>
        <div className='row'>
          <div className='col-lg-12 px-0'>
            <HotCollections />
          </div>
        </div>
      </div>
    </section>

    <section className='container no-top'>
      <div className='row'>
        <div className='col-lg-12'>
          <h2 className='style-2'>Top Seller</h2>
        </div>
        <div className='col-lg-12'>
          <TopSeller />
        </div>
      </div>
    </section>

    <section className='container no-top'>
      <div className='row'>
        <div className='col-lg-12'>
          <h2 className='style-2'>Create and sell your NFTs</h2>
        </div>
      </div>
      <div className='container px-0'>
        <FeatureBox/>
      </div>
    </section>

    <Footer />

  </div>
);
export default homethree;