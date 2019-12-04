import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.scss';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import rootReducer from './reducers';
import BigNumber from 'bignumber.js';


BigNumber.config({ EXPONENTIAL_AT: 1000 });

export const store = createStore(rootReducer, applyMiddleware(thunk));

function getExplorer() {
  let explorer = window.navigator.userAgent;
  let ie11 = ("ActiveXObject" in window);
  function compare(s) {
      return (explorer.indexOf(s) >= 0);
  }
  if (ie11 || compare("MSIE") || compare("Edge")) {
    return 'ie';
  } else if (compare("Firefox")) {
    return 'Firefox';
  } else if (compare("Chrome")) {
    return 'Chrome';
  } else if (compare("Opera")) {
    return 'Opera';
  } else if (compare("Safari")) {
    return 'Safari';
  } else {
    return 'Unknown';
  }
}

if (getExplorer() === 'ie') {
  alert('To ensure your asset security, Chrome, Firefox or Safari is recommended.');
} else {
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root')
  );
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
