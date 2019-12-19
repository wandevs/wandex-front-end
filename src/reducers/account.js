import { Map, OrderedMap } from 'immutable';
import { BigNumber } from 'bignumber.js';

export const initState = Map({
  isLoggedIn: Map(),
  tokensInfo: Map(),
  approving: Map(),
  orders: OrderedMap(),
  trades: OrderedMap(),
  transactions: OrderedMap()
});

const initialTokenInfo = Map({
  balance: new BigNumber('0'),
  allowance: new BigNumber('0'),
  address: '',
  decimals: 0,
  lockedBalance: new BigNumber('0')
});

export default (state = initState, action) => {
  switch (action.type) {
    case 'UPDATE_TOKEN_LOCKED_BALANCES': {
      const { lockedBalances, accountAddress } = action.payload;
      for (let k of Object.keys(lockedBalances)) {
        let tokenInfoState = state.getIn(['tokensInfo', accountAddress, k]);
        if (!tokenInfoState) {
          tokenInfoState = initialTokenInfo;
        }
        tokenInfoState = tokenInfoState.set('lockedBalance', lockedBalances[k]);
        state = state.setIn(['tokensInfo', accountAddress, k], tokenInfoState);
      }
      return state;
    }
    case 'LOGIN':
      state = state.setIn(['isLoggedIn', action.payload.address], true);
      return state;
    case 'LOGOUT':
      state = state.setIn(['isLoggedIn', action.payload.address], false);
      return state;
    case 'LOAD_ORDERS':
      state = state.set('orders', OrderedMap());
      action.payload.orders.forEach(o => {
        state = state.setIn(['orders', o.id], o);
      });
      state = state.set('ordersCount', action.payload.ordersCount);
      return state;
    case 'LOAD_MORE_ORDERS':
    {
      const old = state.get('orders');
      // state = state.set('orders', OrderedMap());
      let n = OrderedMap();
      action.payload.orders.forEach(o => {
        n = n.set(o.id, o);
      });
      state = state.set('orders', old.concat(n));
      state = state.set('ordersCount', action.payload.ordersCount);
      return state;
    }
    case 'ORDER_LOADING':
      state = state.set('order_loading', action.payload.order_loading);
      return state;
    case 'OTHER_ORDER_LOADING':
      state = state.set('other_order_loading', action.payload.other_order_loading);
      return state;
    case 'LOAD_OTHER_ORDERS':
      state = state.set('otherOrders', OrderedMap());
      action.payload.otherOrders.forEach(o => {
        state = state.setIn(['otherOrders', o.id], o);
      });
      state = state.set('otherOrdersCount', action.payload.otherOrdersCount);
      return state;
    case 'LOAD_MORE_OTHER_ORDERS':
    {
      const old = state.get('otherOrders');
      let n = OrderedMap();
      action.payload.otherOrders.forEach(o => {
        n = n.set(o.id, o);
      });
      state = state.set('otherOrders', old.concat(n));
      state = state.set('otherOrdersCount', action.payload.otherOrdersCount);
      return state;
    }
    case 'ORDER_UPDATE':
      const order = action.payload.order;
      const ordersPath = ['orders', order.id];

      if (state.getIn(ordersPath)) {
        if (order.status !== 'pending') {
          state = state.deleteIn(ordersPath);
        } else {
          state = state.setIn(ordersPath, order);
        }
      } else if (order.status === 'pending') {
        state = state.setIn(ordersPath, order);
      }
      return state;
    case 'CANCEL_ORDER':
      state = state.deleteIn(['orders', action.payload.id]);
      return state;
    case 'LOAD_TRADES':
      state = state.set('trades', OrderedMap());
      action.payload.trades.reverse().forEach(t => {
        state = state.setIn(['trades', t.id], t);
      });
      return state;
    case 'TRADE_UPDATE':
      let trade = action.payload.trade;
      state = state.setIn(['trades', trade.id], trade);
      return state;
    case 'UPDATE_TOKEN_INFO': {
      const { symbol, balance, allowance, decimals, tokenAddress, accountAddress } = action.payload;
      let tokenInfoState = state.getIn(['tokensInfo', accountAddress, symbol]);
      if (!tokenInfoState) {
        tokenInfoState = initialTokenInfo;
      }
      tokenInfoState = tokenInfoState.set('allowance', allowance);
      tokenInfoState = tokenInfoState.set('balance', balance);
      tokenInfoState = tokenInfoState.set('address', tokenAddress);
      tokenInfoState = tokenInfoState.set('symbol', symbol);

      if (decimals) {
        tokenInfoState = tokenInfoState.set('decimals', decimals);
      }
      state = state.setIn(['tokensInfo', accountAddress, symbol], tokenInfoState);
      return state;
    }
    case 'TOKEN_APPROVE_START': {
      const { symbol } = action.payload;
      state = state.setIn(['approving', symbol], true);
      return state;
    }
    case 'TOKEN_APPROVE_END': {
      const { symbol } = action.payload;
      state = state.setIn(['approving', symbol], false);
      return state;
    }
    default:
      return state;
  }
};
