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
            <img src="../img/about.png" className="w-100 mb-5" alt="" />
          </div>
          <div className="col-md-6">
            <p>
              Corsac v2 (Previously Corsac) is a decentralised deflationary token, 
              which means it has been designed to become scarcer over time, thus increasing its value. 
            </p>
            <p>
              Apart from this Corsac v2 rewards its holders with 9% Binance-pegged USD (BUSD) for every buy, 
              sell and transfer of the token in the Binance Blockchain. 
            </p>
            <p>
              To ensure that the transactions keep flowing, 
              multiple utilities have been developed and many more are under development, 
              which will lead to sustainable transaction of Corsac v2 and thus generating generous amount of BUSD reflection for the holders.
            </p>
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