import React from 'react';
import Explore3Cols from '../components/Explore3Cols';
import Footer from '../components/footer';
import CheckboxFilter from '../components/CheckboxFilter';

//IMPORT DYNAMIC STYLED COMPONENT
import { StyledHeader } from '../Styles';
//SWITCH VARIABLE FOR PAGE STYLE
const theme = 'GREY'; //LIGHT, GREY, RETRO

const explore= () => (
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
export default explore;