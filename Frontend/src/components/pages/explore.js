import { useEffect } from 'react';
import { navigate } from '@reach/router';
import Explore3Cols from '../components/Explore3Cols';
import Footer from '../components/footer';
import CheckboxFilter from '../components/CheckboxFilter';

//IMPORT DYNAMIC STYLED COMPONENT
import { StyledHeader } from '../Styles';
//SWITCH VARIABLE FOR PAGE STYLE
const theme = 'GREY'; //LIGHT, GREY, RETRO

const explore= () => {
  if (window.web3 == undefined &&  window.ethereum == undefined) {
    // show error: Install Metamask
    const errorMessage = 'You need an Ethereum wallet to interact with this marketplace. Unlock your wallet, get MetaMask.io or Portis on desktop, or get Trust Wallet or Coinbase Wallet on mobile.'
    alert(errorMessage)
    // throw new Error(errorMessage)
    navigate('/');
  }
    
  return (
    <div className="greyscheme">
      <StyledHeader theme={theme} />

      <section className='container'>
        <div className='row'>
          <div className="spacer-double"></div>
          <div className='col-md-3'>
            <CheckboxFilter />
          </div>
          <div className="col-md-9">
            <Explore3Cols showLoadMore={false} />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
export default explore;