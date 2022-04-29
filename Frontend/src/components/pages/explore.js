import React, { memo, useState, useEffect } from 'react';
import { navigate } from '@reach/router';
import Explore3Cols from '../components/Explore3Cols';
import Footer from '../components/footer';
import CheckboxFilter from '../components/CheckboxFilter';

//IMPORT DYNAMIC STYLED COMPONENT
import { StyledHeader } from '../Styles';
//SWITCH VARIABLE FOR PAGE STYLE
const theme = 'GREY'; //LIGHT, GREY, RETRO

const Explore= () => {
  const [filterCategories, setFilterCategories] = useState([]);
  const [filterSaleTypes, setFilterSaleTypes] = useState([]);
  const [filterPayments, setFilterPayments] = useState([]);
  const [filterCollections, setFilterCollections] = useState([]);
  
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
            <CheckboxFilter 
              filterCategories={filterCategories}
              filterSaleTypes={filterSaleTypes}
              filterPayments={filterPayments}
              filterCollections={filterCollections}
              setFilterCategories={setFilterCategories}
              setFilterSaleTypes={setFilterSaleTypes}
              setFilterPayments={setFilterPayments}
              setFilterCollections={setFilterCollections}
            />
          </div>
          <div className="col-md-9">
            <Explore3Cols 
              filterCategories={filterCategories}
              filterSaleTypes={filterSaleTypes}
              filterPayments={filterPayments}
              filterCollections={filterCollections}
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
export default memo(Explore);