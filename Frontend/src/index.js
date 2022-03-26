import React from 'react';
import ReactDOM from 'react-dom';
import "antd/dist/antd.css";
import "./assets/animated.css";
import '../node_modules/font-awesome/css/font-awesome.min.css'; 
import '../node_modules/elegant-icons/style.css';
import '../node_modules/et-line/style.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/dist/js/bootstrap.js';
import './assets/style.scss';
import './assets/style_grey.scss';
import App from './components/app';
import * as serviceWorker from './serviceWorker';

//redux store
import { Provider } from 'react-redux'
import store from './store';

import { MoralisProvider } from "react-moralis";
import { MoralisDappProvider } from "./providers/MoralisDappProvider/MoralisDappProvider";

const APP_ID = process.env.REACT_APP_MORALIS_APPLICATION_ID;
const SERVER_URL = process.env.REACT_APP_MORALIS_SERVER_URL;

const Application = () => {
  const isServerInfo = APP_ID && SERVER_URL ? true : false;

  if (isServerInfo)
    return (
      <MoralisProvider appId={APP_ID} serverUrl={SERVER_URL} store={store}>
        <MoralisDappProvider>
          {/* <App isServerInfo /> */}
          <Provider store={store}>
            <App isServerInfo />
          </Provider>
        </MoralisDappProvider>
      </MoralisProvider>
    );
  else {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        {/* <QuickStart /> */}
        <p>Can't connect to Moralis Server!</p>
      </div>
    );
  }
};

ReactDOM.render(
	<Application />,
	document.getElementById('root')
);
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();