import React from 'react';
import { useMoralis } from "react-moralis";
import { connectors } from '../components/constants/wallets';


const Wallet= () => {
  const {authenticate, isAuthenticated, account, logout} = useMoralis();

  return (
    <div className="row">
      {connectors.map(({title, icon, connectorId, note, description}, key) => (
        <div
          className="col-lg-3 mb30"
          key={key}
          onClick={async () => {
            try {
              await authenticate({provider: connectorId});
              window.localStorage.setItem("connectorId", connectorId);
            } catch (e) {
              console.error(e);
            }
          }}
        >
          <span className="box-url">
            { note != null && note != '' &&
              <span className="box-url-label">{note}</span>
            }
            <img src={icon} alt="" className="mb20"/>
            <h4>{title}</h4>
            <p>{description}</p>
          </span>
        </div>
      ))}                                
    </div>);
};
export default Wallet;