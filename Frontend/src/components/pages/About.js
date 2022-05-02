import React, { memo } from "react";
import { useSelector } from 'react-redux';
import * as selectors from '../../store/selectors';
import Footer from '../components/footer';
import Reveal from 'react-awesome-reveal';

//IMPORT DYNAMIC STYLED COMPONENT
import { StyledHeader } from '../Styles';
import { Spin, Modal } from "antd";
import styled from 'styled-components';

import { keyframes } from "@emotion/react";

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

const About = () => {
  const currentUserState = useSelector(selectors.currentUserState);

  return (
    <div className="greyscheme">
      <StyledHeader theme={theme} />

      <section className='jumbotron breadcumb no-bg'
              style={{backgroundImage: `url(${currentUserState && currentUserState.data && currentUserState.data.banner ? currentUserState.data.banner : ''})`}}>
        <div className='mainbreadcumb'>
          <div className='container'>
            <div className='row m-10-hor'>
              <div className='col-12'>
                <h1 className='text-center'>About Us</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='container'>
        <div className='row'>
          <div className="col-md-6">
            <img src="../img/about.png" class="w-100 mb-5" alt="" />
          </div>
          <div className="col-md-6">
            <p>Founded on 1st November 2021, Corsac (CORSAC V2) is a reflection token based on Binance Smart Chain, where holders earn BUSD just for holding the tokens. Corsac had a stellar launch which was reflected by it getting listed in CMC and CoinGecko and getting over thousands of holders on board within 24 hours from its launch. Unlike Other tokens, Corsac has got multiple utilities, few of them includes:</p>
            <p>CorsacSwap: Fast, Secure and Most Convenient way to swap your native crypto for Corsac.</p>
            <p>Corsac Finance: Unique away of lending your BUSD and earn interest on them. Lending is secure as you get CORSAC V2 as collateral and on top of that earn the reflections on the collateral as well. Else you can borrow BUSD for some other investments, keep the capital gains and return the rest without getting your bank involved.</p>
            <p>We at Corsac believe in constantly improving and bring out new utilities. Be a part of Corsac, and let your investment ventures take wings.</p>
          </div>
        </div>
        <div className='row de-flex' style={{justifyContent: 'center'}}>
          <div className="col-xl-4 col-lg-4 col-md-6 mb-3">
            <div className="feature-box f-boxed style-3">
              <Reveal className='onStep' keyframes={fadeInUp} delay={0} duration={600} triggerOnce>
                <i className="bg-color-2 i-boxed icon_wallet"></i>
              </Reveal>
              <div className="text">
                <Reveal className='onStep' keyframes={fadeInUp} delay={100} duration={600} triggerOnce>
                  <h4 className="">CorsacSwap</h4>
                </Reveal>
                <Reveal className='onStep' keyframes={fadeInUp} delay={200} duration={600} triggerOnce>
                  <p className="">Fast, Secure and Most Convenient way to swap your native crypto for Corsac.</p>
                </Reveal>
              </div>
              <i className="wm icon_wallet"></i>
            </div>
          </div>

          <div className="col-xl-4 col-lg-4 col-md-6 mb-3">
            <div className="feature-box f-boxed style-3">
              <Reveal className='onStep' keyframes={fadeInUp} delay={0} duration={600} triggerOnce>
                <i className=" bg-color-2 i-boxed icon_currency"></i>
              </Reveal>
              <div className="text">
                <Reveal className='onStep' keyframes={fadeInUp} delay={100} duration={600} triggerOnce>
                  <h4 className="">Corsac Finance</h4>
                </Reveal>
                <Reveal className='onStep' keyframes={fadeInUp} delay={200} duration={600} triggerOnce>
                  <p className="">Unique away of lending your BUSD and earn interest on them.</p>
                </Reveal>
              </div>
              <i className="wm icon_currency"></i>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
export default memo(About);