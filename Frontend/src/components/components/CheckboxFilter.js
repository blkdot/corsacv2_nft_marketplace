import React, { memo, useEffect, useState } from 'react';
import axios from 'axios';
import { categories } from './constants/cateogries';

const CheckboxFilter = ({
    filterCategories, 
    filterSaleTypes, 
    filterPayments, 
    filterCollections, 
    setFilterCategories, 
    setFilterSaleTypes, 
    setFilterPayments, 
    setFilterCollections
  }) => {

  const [collections, setCollections] = useState([]);
  const [payments, setPayments] = useState([]);
  const saleTypes = [
    { value: 0, label: 'On Sale'},
    { value: 1, label: 'On Auction'},
    { value: 2, label: 'On Offer'}
  ];

  let fc = [];
  let fs = [];
  let fp = [];
  let fcc = [];

  async function getCollections() {
    try {
      await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/collection/all`, {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {}
      }).then(async res => {
        let collections = [];
        for (let c of res.data.collections) {
          collections.push({
            value: c.collectionAddr,
            label: c.title
          });
        }
        setCollections(collections);
      });
    } catch {
      console.log('error in fetching collections');
    }
  }

  async function getPayments() {
    try {
      await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/payment/all`, {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          allowed: 1
        }
      }).then(async res => {
        let payments = [];
        for (let p of res.data.payments) {
          payments.push({
            value: p.id,
            label: `${p.title} (${p.symbol})`
          });
        }
        setPayments(payments);
      });
    } catch {
      console.log('error in fetching payments');
    }
  }

  const handleCategories = (e) => {
    if (e.target.checked === true) {
      let c = categories.filter((c, index) => {
        return c.value === e.target.value;
      });

      if (c.length > 0) {
        fc.push(c[0]);
      }
    } else {
      for (let i = 0; i < fc.length; i++) {
        if (fc[i].value === e.target.value) {
          fc.splice(i, 1); 
          i--; 
        }
      }
    }

    setFilterCategories(fc);
  };

  const handleSaleTypes = (e) => {
    if (e.target.checked === true) {
      let t = saleTypes.filter((t, index) => {
        return parseInt(t.value) === parseInt(e.target.value);
      });
      
      if (t.length > 0) {
        fs.push(t[0]);
      }
    } else {
      for (let i = 0; i < fs.length; i++) {
        if (parseInt(fs[i].value) === parseInt(e.target.value)) {
          fs.splice(i, 1); 
          i--; 
        }
      }
    }

    // console.log("filterSaleTypes:", fs);
    setFilterSaleTypes(fs);
  };

  const handlePayments = (e) => {
    if (e.target.checked === true) {
      let p = payments.filter((p, index) => {
        return parseInt(p.value) === parseInt(e.target.value);
      });
      
      if (p.length > 0) {
        fp.push(p[0]);
      }
    } else {
      for (let i = 0; i < fp.length; i++) {
        if (parseInt(fp[i].value) === parseInt(e.target.value)) {
          fp.splice(i, 1);
          i--; 
        }
      }
    }

    // console.log("filterPayments:", fp);
    setFilterPayments(fp);
  };

  const handleCollections = (e) => {
    if (e.target.checked === true) {
      let c = collections.filter((c, index) => {
        return c.value === e.target.value;
      });
      
      if (c.length > 0) {
        fcc.push(c[0]);
      }
    } else {
      for (let i = 0; i < fcc.length; i++) {
        if (fcc[i].value === e.target.value) {
          fcc.splice(i, 1);
          i--; 
        }
      }
    }

    // console.log("filterCollections:", fcc);
    setFilterCollections(fcc);
  };

  useEffect(async () => {
    await getPayments();
    await getCollections();
  }, []);
  
  return (
    <>
      <div className="item_filter_group">
        <h4>Select Categories</h4>
        <div className="de_form">
          { categories.map((item, index) => (
            <div className="de_checkbox" key={index}>
              <input 
                id={`cat_${item.value}`}
                name={`cat_${item.value}`}
                type="checkbox" 
                value={item.value}
                onChange={handleCategories}
              />
              <label htmlFor={`cat_${item.value}`}>{item.label}</label>
            </div>
        ))}
        </div>
      </div>

      <div className="item_filter_group">
        <h4>Select Sale Types</h4>
        <div className="de_form">
          { saleTypes.map((item, index) => (
            <div className="de_checkbox" key={index}>
              <input 
                id={`sale_${item.value}`}
                name={`sale_${item.value}`}
                type="checkbox" 
                value={item.value}
                onChange={handleSaleTypes}
              />
              <label htmlFor={`sale_${item.value}`}>{item.label}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="item_filter_group">
        <h4>Select Payments</h4>
        <div className="de_form">
          { payments.map((item, index) => (
            <div className="de_checkbox" key={index}>
              <input 
                id={`payment_${item.value}`} 
                name={`payment_${item.value}`} 
                type="checkbox" 
                value={item.value}
                onChange={handlePayments}
              />
              <label htmlFor={`payment_${item.value}`} >{item.label}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="item_filter_group">
        <h4>Collections</h4>
        <div className="de_form">
        { collections.map((item, index) => (
          <div className="de_checkbox" key={index}>
            <input 
              id={`collection_${item.value}`} 
              name={`collection_${item.value}`} 
              type="checkbox" 
              value={item.value}
              onChange={handleCollections}
            />
            <label htmlFor={`collection_${item.value}`} >{item.label}</label>
          </div>
        ))}
        </div>
      </div>
    </>
  );
}

export default memo(CheckboxFilter)