import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import * as selectors from '../../store/selectors';
import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Footer from '../components/footer';
import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.sticky.white {
    background: #212428;
    border-bottom: 0;
    box-shadow: 0 4px 20px 0 rgba(10,10,10, .8);
  }
  header#myHeader.navbar .search #quick_search{
    color: #fff;
    background: rgba(255, 255, 255, .1);
  }
  header#myHeader.navbar.white .btn, .navbar.white a, .navbar.sticky.white a{
    color: #fff;
  }
  header#myHeader .dropdown-toggle::after{
    color: #fff;
  }
  header#myHeader .logo .d-block{
    display: none !important;
  }
  header#myHeader .logo .d-none{
    display: none !important;
  }
  header#myHeader .logo .d-4{
    display: block !important;
  }
  .navbar .search #quick_search{
    border-radius: 20px;
  }
  .navbar .navbar-item .lines {
    border-bottom: 2px solid #ff343f;
  }
  .navbar .mainside a{
    text-align: center;
    color: #fff !important;
    background: #ff343f;
    border-radius: 30px;
  }
  .navbar .mainside a:hover {
    box-shadow: 2px 2px 20px 0 #ff343f;
    transition: all .3s ease;
  }
  .navbar .menu-line, .navbar .menu-line1, .navbar .menu-line2{
    background: #fff;
  }
  .item-dropdown{
    color: #fff !important;
    background: rgba(33, 36, 40, .9);
    box-shadow: 2px 2px 30px 0px rgba(20, 20, 20, 0.1);
  }
  .item-dropdown .dropdown a{
    color: #fff !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  .item-dropdown .dropdown a:hover{
    color: #fff !important;
    background: #ff343f;
  }
  footer.footer-light .subfooter span img.d-1{
    display: none !important;
  }
  footer.footer-light .subfooter span img.d-4{
    display: inline-block !important;
  }
  .de_countdown{
    right: 10px;
    color: #fff;
  }
  .author_list_pp{
    margin-left:0;
  }
  footer.footer-light .subfooter{
    border-top: 1px solid rgba(255,255,255,.1);
  }
  #scroll-to-top div {
    background: #ff343f;
  }
  @media only screen and (max-width: 1199px) { 
    .navbar {
      background: #212428;
    }
  }
`;

const Faq = () => {
  const currentUserState = useSelector(selectors.currentUserState);

  return (
  <div className="greyscheme">
    <GlobalStyles/>

    <section className='jumbotron breadcumb no-bg'
            style={{backgroundImage: `url(${currentUserState && currentUserState.data && currentUserState.data.banner ? currentUserState.data.banner : ''})`}}>
      <div className='mainbreadcumb'>
        <div className='container'>
          <div className='row m-10-hor'>
            <div className='col-12'>
              <h1 className='text-center'>FAQ</h1>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className='container'>
      <div className='row'>
        <div className='col-md-12'>
          <Accordion>
            <Card>
              <Card.Header>
                <Accordion.Toggle as={Button} variant="" eventKey="0">
                  <strong>1. How Do I Sell an NFT in Corsac Marketplace?</strong>
                </Accordion.Toggle>
              </Card.Header>
              <Accordion.Collapse eventKey="0">
                <Card.Body>
                  To sell an NFT first you will have to create one. 
                  You can do this simply by clicking on the Connect Wallet button on main page and follow by setting up your profile in the My Profile and afterwhich heading to My Collections to mint an Collection of NFTs of your choice, 
                  following the on page instructions which includes selecting the file and inputting the details of it, After uploading is successful, 
                  you will be redirected to your item detail page where you can set the item for sale or auction, 
                  or head to My NFTs in profile Settings.
                </Card.Body>
              </Accordion.Collapse>
            </Card>
            <Card>
              <Card.Header>
                <Accordion.Toggle as={Button} variant="" eventKey="1">
                  <strong>2. Are there any hidden fee for selling or buying NFT?</strong>
                </Accordion.Toggle>
              </Card.Header>
              <Accordion.Collapse eventKey="1">
                <Card.Body>
                  There are no hidden fees but a very nominal amount of service fee is levied per transaction of an NFT. 
                  This fee is used for the maintenance of the servers and keeping the network secure.
                </Card.Body>
              </Accordion.Collapse>
            </Card>
            <Card>
              <Card.Header>
                <Accordion.Toggle as={Button} variant="" eventKey="2">
                  <strong>3. Why is my item not on Sale or Why I am not able to create an NFT?</strong>
                </Accordion.Toggle>
              </Card.Header>
              <Accordion.Collapse eventKey="2">
                <Card.Body>
                  This is highly likely that you don't have enough Smart Chain BNB to cover the gas fee required for the process. 
                  So make sure you have enough Smart Chain BNB in your wallet. 
                  Even after that if you are facing the same issue, feel free to reach out to us via email or through our telegram channel.
                </Card.Body>
              </Accordion.Collapse>
            </Card>
            <Card>
              <Card.Header>
                <Accordion.Toggle as={Button} variant="" eventKey="3">
                  <strong>4. Why should I choose Corsac Marketplace for selling NFT over other NFT Platforms like OpenSEA and Rarible?</strong>
                </Accordion.Toggle>
              </Card.Header>
              <Accordion.Collapse eventKey="3">
                <Card.Body>
                  Unlike OpenSEA or Rarible; our NFT Marketplace is first of it's kind which is based on CORSAC V2 (Corsac), 
                  a hyper-deflationary reflection token designed to become more scarce over time along with rewarding holders of Corsac (CORSAC V2) in BUSD for transactions of NFT happening in this marketplace. <br/>
                  Apart from this our fee is only 1.5% which is fairly low compared to any other NFT marketplace, and with Royalties up to 40% and NFT to be Purchased with BEP-20 of your choice (Whitelisting Needed)
                </Card.Body>
              </Accordion.Collapse>
            </Card>
          </Accordion>
        </div>
      </div>
    </section>

    <Footer />
  </div>
)
};
export default memo(Faq);