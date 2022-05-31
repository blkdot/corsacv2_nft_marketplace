import React, { memo, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as selectors from '../../store/selectors';
import * as actions from '../../store/actions/thunks';

import { navigate, useParams } from '@reach/router';
import Footer from '../components/footer';
import CheckboxFilter from '../components/CheckboxFilter';

//IMPORT DYNAMIC STYLED COMPONENT
import { StyledHeader } from '../Styles';
import Search3Cols from '../components/Search3Cols';
//SWITCH VARIABLE FOR PAGE STYLE
const theme = 'GREY'; //LIGHT, GREY, RETRO

const SearchItems = () => {
  const params = useParams();
  const dispatch = useDispatch();
  const currentUserState = useSelector(selectors.currentUserState);

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

      <section className='jumbotron breadcumb no-bg'
              style={{backgroundImage: `url(${currentUserState && currentUserState.data && currentUserState.data.banner ? currentUserState.data.banner : ''})`}}>
        <div className='mainbreadcumb'>
          <div className='container'>
            <div className='row m-10-hor'>
              <div className='col-12'>
                <h1 className='text-center'>Searched Items</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

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
            <Search3Cols 
              search={params.search}
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
export default memo(SearchItems);