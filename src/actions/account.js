import { getAllowance, getTokenBalance } from '../lib/wallet';
import { saveLoginData } from '../lib/session';
import BigNumber from 'bignumber.js';
import api from '../lib/api';
import { getSelectedAccount, getSelectedAccountWallet } from 'wan-dex-sdk-wallet';
import { addActivity } from './activity';

// request ddex private auth token
export const loginRequest = () => {
  return async (dispatch, getState) => {
    const message = 'HYDRO-AUTHENTICATION';
    const state = getState();
    const selectedAccount = getSelectedAccount(state);
    const address = selectedAccount ? selectedAccount.get('address') : null;
    const wallet = getSelectedAccountWallet(state);
    if (!wallet) {
      return;
    }
    const signature = await wallet.signPersonalMessage(message);
    if (!signature) {
      return;
    }

    const hydroAuthentication = address + '#' + message + '#' + signature;
    saveLoginData(address, hydroAuthentication);
    return dispatch(login(address, hydroAuthentication));
  };
};

export const login = address => {
  return (dispatch, getState) => {
    dispatch(addActivity("login:"+ address));
    dispatch(loadAccountLockedBalance());
    dispatch({ type: 'LOGIN', payload: { address } });
  };
};

export const logout = address => {
  return dispatch => {
    dispatch(addActivity("logout:"+ address));
    dispatch({ type: 'LOGOUT', payload: { address } });
  };
};

// 获取账号锁定余额(订单中的余额)
export const loadAccountLockedBalance = () => {
  return async (dispatch, getState) => {
    const state = getState();
    const selectedAccount = getSelectedAccount(state);
    const accountAddress = selectedAccount ? selectedAccount.get('address') : null;
    if (!accountAddress) {
      return;
    }

    const res = await api.get('/account/lockedBalances');
    const lockedBalances = {};
    if (res.data.status === 0) {
      res.data.data.lockedBalances.forEach(x => {
        lockedBalances[x.symbol] = x.lockedBalance;
      });
      dispatch(updateTokenLockedBalances(lockedBalances));
    }
  };
};

export const updateTokenLockedBalances = lockedBalances => {
  return (dispatch, getState) => {
    const selectedAccount = getSelectedAccount(getState());
    const accountAddress = selectedAccount ? selectedAccount.get('address') : null;
    if (!accountAddress) {
      return;
    }

    Object.keys(lockedBalances).forEach((key, index) => {
      lockedBalances[key] = new BigNumber(lockedBalances[key]);
    });

    return dispatch({
      type: 'UPDATE_TOKEN_LOCKED_BALANCES',
      payload: { lockedBalances, accountAddress }
    });
  };
};

// load ERC20 tokens balance and allowance
export const loadTokens = () => {
  return async (dispatch, getState) => {
    const state = getState();
    const selectedAccount = getSelectedAccount(state);
    const accountAddress = selectedAccount ? selectedAccount.get('address') : null;

    if (!accountAddress) {
      return;
    }

    const markets = state.market.getIn(['markets', 'data']).toArray();
    let tokens = {};
    let promises = [];

    // load quote tokens first
    for (let i = 0; i < markets.length; i++) {
      const market = markets[i];
      if (tokens[market.quoteToken]) {
        continue;
      }
      tokens[market.quoteToken] = true;
      promises.push(dispatch(loadToken(market.quoteTokenAddress, market.quoteToken, market.quoteTokenDecimals)));
    }

    // then base tokens
    for (let i = 0; i < markets.length; i++) {
      const market = markets[i];
      if (tokens[market.baseToken]) {
        continue;
      }
      tokens[market.baseToken] = true;
      promises.push(dispatch(loadToken(market.baseTokenAddress, market.baseToken, market.baseTokenDecimals)));
    }

    await Promise.all(promises);
  };
};

// load ERC20 token 10 times
export const watchToken = (tokenAddress, symbol, decimals) => {
  return dispatch => {
    for (let i = 0; i < 10; i++) {
      setTimeout(() => dispatch(loadToken(tokenAddress, symbol, decimals)), 3000 * i);
    }
  };
};

export const loadToken = (tokenAddress, symbol, decimals) => {
  return async (dispatch, getState) => {
    const state = getState();
    const selectedAccount = getSelectedAccount(state);
    const accountAddress = selectedAccount ? selectedAccount.get('address') : null;
    if (!accountAddress) {
      return;
    }

    const [balance, allowance] = await Promise.all([
      getTokenBalance(tokenAddress, accountAddress),
      getAllowance(tokenAddress, accountAddress)
    ]);

    return dispatch({
      type: 'UPDATE_TOKEN_INFO',
      payload: {
        tokenAddress,
        accountAddress,
        symbol,
        balance,
        allowance,
        decimals
      }
    });
  };
};

// load all my pending orders
export const loadOrders = () => {
  return async (dispatch, getState) => {
    const currentMarket = getState().market.getIn(['markets', 'currentMarket']);
    const res = await api.get(`/orders?marketID=${currentMarket.id}`);
    markOrderLoadingState(dispatch, false);
    if (res.data.status === 0) {
      const data = res.data.data;
      return dispatch({
        type: 'LOAD_ORDERS',
        payload: {
          orders: data ? data.orders.map(format) : [],
          ordersCount: data ? data.count : 0
        }
      });
    } else {
      window.alertAntd(res.data.desc);
    }
  };
};

export const markOrderLoadingState = (dispatch, isLoading ) => {
  dispatch({
    type: 'ORDER_LOADING',
    payload: {
      order_loading: isLoading
    }
  });
  console.log("loading="+isLoading);
};
export const markOtherOrderLoadingState = (dispatch, isLoading ) => {
  dispatch({
    type: 'OTHER_ORDER_LOADING',
    payload: {
      other_order_loading: isLoading
    }
  });
};

export const loadMoreOrders = () => {
  return async (dispatch, getState) => {
    const currentMarket = getState().market.getIn(['markets', 'currentMarket']);
    const ordersCount = getState().account.get('ordersCount');
    const old = getState().account.get('orders');
    if (old && ordersCount === old.size) {
      markOrderLoadingState(dispatch, false);
      return;
    }

    const perPage = 20;
    const page = parseInt((old.size + perPage - 1) / perPage) + 1;
    const res = await api.get(`/orders?marketID=${currentMarket.id}&page=${page}&perPage=${perPage}`);

    if (res.data.status === 0) {
      const data = res.data.data;
      dispatch({
        type: 'LOAD_MORE_ORDERS',
        payload: {
          orders: data ? data.orders.map(format) : [],
          ordersCount: data ? data.count : 0,
        }
      });
    } else {
      window.alertAntd(res.data.desc);
    }
    markOrderLoadingState(dispatch, false);
  };
};

export const loadOtherOrders = () => {
  return async (dispatch, getState) => {
    const currentMarket = getState().market.getIn(['markets', 'currentMarket']);
    const res = await api.get(`/orders/nostatus?marketID=${currentMarket.id}`);
    markOtherOrderLoadingState(dispatch, false);
    if (res.data.status === 0) {
      const data = res.data.data;
      return dispatch({
        type: 'LOAD_OTHER_ORDERS',
        payload: {
          otherOrders: data ? data.orders.map(format) : [],
          otherOrdersCount: data ? data.count : 0
        }
      });
    } else {
      window.alertAntd(res.data.desc);
    }
  };
};

export const loadMoreOtherOrders = () => {
  return async (dispatch, getState) => {
    const currentMarket = getState().market.getIn(['markets', 'currentMarket']);
    const ordersCount = getState().account.get('otherOrdersCount');
    const old = getState().account.get('otherOrders');
    if (old && ordersCount === old.size) {
      markOtherOrderLoadingState(dispatch, false);
      return;
    }

    const perPage = 20;
    const page = parseInt((old.size + perPage - 1) / perPage) + 1;
    const res = await api.get(`/orders/nostatus?marketID=${currentMarket.id}&page=${page}&perPage=${perPage}`);

    if (res.data.status === 0) {
      const data = res.data.data;
      dispatch({
        type: 'LOAD_OTHER_ORDERS',
        payload: {
          otherOrders: data ? data.orders.map(format) : [],
          otherOrdersCount: data ? data.count : 0
        }
      });
    } else {
      window.alertAntd(res.data.desc);
    }
    markOtherOrderLoadingState(dispatch, false);
  };
};



// load all my trades
export const loadTrades = () => {
  return async (dispatch, getState) => {
    const currentMarket = getState().market.getIn(['markets', 'currentMarket']);
    const res = await api.get(`/markets/${currentMarket.id}/trades/mine`);

    if (res.data.status === 0) {
      const data = res.data.data;
      return dispatch({
        type: 'LOAD_TRADES',
        payload: {
          trades: data ? data.trades : []
        }
      });
    } else {
      window.alertAntd(res.data.desc);
    }
  };
};

export const orderUpdate = json => {
  return {
    type: 'ORDER_UPDATE',
    payload: { order: format(json) }
  };
};

export const cancelOrder = id => {
  return async (dispatch, getState) => {
    const res = await api.delete(`/orders/${id}`);

    if (res.data.status === 0) {
      window.alertAntd('Successfully cancelled order');
      dispatch({
        type: 'CANCEL_ORDER',
        payload: { id }
      });
    } else {
      window.alertAntd(res.data.desc);
    }
  };
};

// Number or String format to Bignumber
const format = json => {
  return {
    id: json.id,
    marketID: json.marketID,
    side: json.side,
    status: json.status,
    gasFeeAmount: new BigNumber(json.gasFeeAmount || 0),
    makerFeeRate: new BigNumber(json.makerFeeRate || 0),
    takerFeeRate: new BigNumber(json.takerFeeRate || 0),
    price: new BigNumber(json.price),
    availableAmount: new BigNumber(json.availableAmount),
    canceledAmount: new BigNumber(json.canceledAmount),
    confirmedAmount: new BigNumber(json.confirmedAmount),
    pendingAmount: new BigNumber(json.pendingAmount),
    createdAt: json.createdAt,
    json: json.json,
    amount: new BigNumber(json.amount)
  };
};
