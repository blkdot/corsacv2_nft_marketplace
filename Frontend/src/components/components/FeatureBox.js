import React from 'react';
import Reveal from 'react-awesome-reveal';
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

const featurebox= () => (
  <div className='row'>
    <div className="col-xl-3 col-lg-4 col-md-6 mb-3 d-flex">
      <div className="feature-box f-boxed style-3">
        <Reveal className='onStep' keyframes={fadeInUp} delay={0} duration={600} triggerOnce>
          <i className="bg-color-2 i-boxed icon_wallet"></i>
        </Reveal>
        <div className="text">
          <Reveal className='onStep' keyframes={fadeInUp} delay={100} duration={600} triggerOnce>
            <h4 className="">Set up your wallet</h4>
          </Reveal>
          <Reveal className='onStep' keyframes={fadeInUp} delay={200} duration={600} triggerOnce>
            <p className="">Once you've set up the wallet of your choice, connect it to Corsac Marketplace, by clicking the connect wallet on the top right corner.</p>
          </Reveal>
        </div>
        <i className="wm icon_wallet"></i>
      </div>
    </div>

    <div className="col-xl-3 col-lg-4 col-md-6 mb-3 d-flex">
      <div className="feature-box f-boxed style-3">
        <Reveal className='onStep' keyframes={fadeInUp} delay={0} duration={600} triggerOnce>
          <i className=" bg-color-2 i-boxed icon_id"></i>
        </Reveal>
        <div className="text">
          <Reveal className='onStep' keyframes={fadeInUp} delay={100} duration={600} triggerOnce>
            <h4 className="">Set up your profile</h4>
          </Reveal>
          <Reveal className='onStep' keyframes={fadeInUp} delay={200} duration={600} triggerOnce>
            <p className="">Click Profile and set up your Profile. Add social links, a description, profile &amp; banner images</p>
          </Reveal>
        </div>
        <i className="wm icon_id"></i>
      </div>
    </div>

    <div className="col-xl-3 col-lg-4 col-md-6 mb-3 d-flex">
      <div className="feature-box f-boxed style-3">
        <Reveal className='onStep' keyframes={fadeInUp} delay={0} duration={600} triggerOnce>
          <i className=" bg-color-2 i-boxed icon_cloud-upload_alt"></i>
        </Reveal>
        <div className="text">
          <Reveal className='onStep' keyframes={fadeInUp} delay={100} duration={600} triggerOnce>
            <h4 className="">Add your NFT's</h4>
          </Reveal>
          <Reveal className='onStep' keyframes={fadeInUp} delay={200} duration={600} triggerOnce>
            <p className="">Upload your work (image, video, audio, or 3D arts), add a title and description, and customize your NFTs.</p>
          </Reveal>
        </div>
        <i className="wm icon_cloud-upload_alt"></i>
      </div>
    </div>

    <div className="col-xl-3 col-lg-4 col-md-6 mb-3 d-flex">
        <div className="feature-box f-boxed style-3">
          <Reveal className='onStep' keyframes={fadeInUp} delay={0} duration={600} triggerOnce>
            <i className=" bg-color-2 i-boxed icon_tags_alt"></i>
          </Reveal>
          <div className="text">
            <Reveal className='onStep' keyframes={fadeInUp} delay={100} duration={600} triggerOnce>
              <h4 className="">Sell your NFT's</h4>
            </Reveal>
            <Reveal className='onStep' keyframes={fadeInUp} delay={200} duration={600} triggerOnce>
              <p className="">Choose between auctions, fixed-price listings. You choose how you want to sell your NFTs, and we help you sell them in Corsac or Other Token as well.</p>
            </Reveal>
          </div>
          <i className="wm icon_tags_alt"></i>
        </div>
    </div>
  </div>
);
export default featurebox;