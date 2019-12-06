import BigNumber from 'bignumber.js';
import api from '../lib/api';
import env from '../lib/env';
import {
  getFiatPrice
} from '../lib/utils';

export const updateCurrentMarket = currentMarket => {
  return async dispatch => {
    let fiatRet = await getFiatPrice([currentMarket.baseToken, currentMarket.quoteToken]);

    if (fiatRet.status === 200) {
      let baseTokenName = currentMarket.baseToken;
      let quoteTokenName = currentMarket.quoteToken;
      let price = fiatRet.data;
      if (baseTokenName.length > 3 && baseTokenName.startsWith('W')) {
        baseTokenName = baseTokenName.slice(1);
      }
      if (quoteTokenName.length > 3 && quoteTokenName.startsWith('W')) {
        quoteTokenName = quoteTokenName.slice(1);
      }

      if (price[baseTokenName]) {
        currentMarket.fiat = price[baseTokenName];
        currentMarket.baseTokenFiat = price[baseTokenName];
      } else {
        currentMarket.fiat = '--';
        currentMarket.baseTokenFiat = '--';
      }
      
      if (price[quoteTokenName]) {
        currentMarket.quoteTokenFiat = price[quoteTokenName];
      } else {
        currentMarket.quoteTokenFiat = '--';
      }

    }
    return dispatch({
      type: 'UPDATE_CURRENT_MARKET',
      payload: {
        currentMarket
      }
    });
  };
};

export const loadMarkets = () => {
  return async (dispatch, getState) => {
    const res = await api.get(`/operatormarkets/${env.OPERATOR_ID}`);
    if (res.data.status === 0) {
      const markets = res.data.data.markets;
      markets.forEach(formatMarket);
      let baseTokens = markets.map((market) => {
        return market.baseToken;
      });
      let quoteTokens = markets.map((market) => {
        return market.quoteToken;
      });
      let allTokens = baseTokens.concat(quoteTokens);
      let fiatRet = await getFiatPrice(allTokens);
      if (fiatRet.status === 200) {
        markets.forEach((market) => {
          let baseTokenName = market.baseToken;
          let quoteTokenName = market.quoteToken;
          let price = fiatRet.data;
          if (baseTokenName.length > 3 && baseTokenName.startsWith('W')) {
            baseTokenName = baseTokenName.slice(1);
          }
          if (quoteTokenName.length > 3 && quoteTokenName.startsWith('W')) {
            quoteTokenName = quoteTokenName.slice(1);
          }

          if (price[baseTokenName]) {
            market.fiat = price[baseTokenName];
            market.baseTokenFiat = price[baseTokenName];
          } else {
            market.fiat = '--';
            market.baseTokenFiat = '--';
          }

          if (price[quoteTokenName]) {
            market.quoteTokenFiat = price[quoteTokenName];
          } else {
            market.quoteTokenFiat = '--';
          }
        });
      }
      return dispatch({
        type: 'LOAD_MARKETS',
        payload: {
          markets
        }
      });
    } else {
      window.alertAntd(res.data.desc);
    }
  };
};

// load current market trade history
export const loadTradeHistory = marketID => {
  return async (dispatch, getState) => {
    const res = await api.get(`/markets/${marketID}/trades`);
    const currentMarket = getState().market.getIn(['markets', 'currentMarket']);
    if (currentMarket.id === marketID) {
      return dispatch({
        type: 'LOAD_TRADE_HISTORY',
        payload: res.data.data.trades
      });
    }
  };
};

export const updatePrice = price => {
  return {
    type: 'PRICE_UPDATE',
    payload: {
      price
    }
  }
}

const formatMarket = market => {
  market.gasFeeAmount = new BigNumber(market.gasFeeAmount);
  market.asMakerFeeRate = new BigNumber(market.asMakerFeeRate);
  market.asTakerFeeRate = new BigNumber(market.asTakerFeeRate);
  market.marketOrderMaxSlippage = new BigNumber(market.marketOrderMaxSlippage);
};