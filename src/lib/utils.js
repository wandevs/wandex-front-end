import BigNumber from 'bignumber.js';
import axios from 'axios';

export const sleep = time => new Promise(r => setTimeout(r, time));

export const toUnitAmount = (amount, decimals) => {
  return new BigNumber(amount).div(Math.pow(10, decimals));
};

export const isTokenApproved = allowance => {
  return allowance.gt(10 ** 30);
};

export const getFiatPrice = async (tokenNameArray, fiatName = "USD") => {
  let tokenArray = []

  for(let i=0; i<tokenNameArray.length; i++) {
    if (tokenNameArray[i].length > 3 && tokenNameArray[i].startsWith('W')) {
      tokenArray.push(tokenNameArray[i].slice(1));
    } else {
      tokenArray.push(tokenNameArray[i]);
    }
  }
  try {
    let ret = await axios({
      method: 'GET',
      url: 'https://min-api.cryptocompare.com/data/pricemulti',
      timeout: 5000,
      params: {
        fsyms: tokenArray.join(),
        tsyms: fiatName,
        api_key: '55b208aeb1740c3db63421ea086a2b0d3cc983b51621f3d84505ae419ec87525',
      }
    })
    return ret;
  } catch (error) {
    console.log('Get fiat price timeout:', error.message);
    return {status: 404};
  }
}

export const truncateDecimals = (input, decimals) => {
  if(!input) {return ""}
  
  let result;
  if (decimals === 0) {
    result = input.match(/\d+/);
  } else {
    let rule = "^(\\d+)(.\\d{1," + decimals + "})?";
    result = input.match(new RegExp(rule));
  }
  return result? result[0] : "";
}

export const formatMarket = (market) => {
  let extra = {isExternalPrice: false};
  // fiat
  let baseFiat = market.baseTokenFiat[Object.keys(market.baseTokenFiat)[0]];  
  extra.baseFiat = (baseFiat !== "-") ? Number(baseFiat) : 0;
  let quoteFiat = market.quoteTokenFiat[Object.keys(market.quoteTokenFiat)[0]];
  extra.quoteFiat = (quoteFiat !== "-") ? Number(quoteFiat) : 0;
  // price, external price as the second choice
  if (market.lastPrice !== "0") {
    extra.price = Number(market.lastPrice);
  } else if (baseFiat && quoteFiat) {
    extra.price = Number(baseFiat/quoteFiat).toFixed(market.priceDecimals);
    extra.isExternalPrice = true;
  } else {
    extra.price = 0;
  }
  // volume
  if (quoteFiat && market) {
    extra.volume24h = quoteFiat * Number(market.quoteTokenVolume24h);
  }
  //
  extra.high24h = Number(market.highPrice24h);
  extra.low24h = Number(market.lowPrice24h);
  market.extra = extra;
  return market;
}

export const getFiatCode = (markets) => {
  for (let i = 0; i < markets.size; i++) {
    let unit = Object.keys(markets.get(i).fiat)[0];
    if (unit !== "0") {
      return unit;
    }
  }
  return "";
}

export const getFiatSymbol = (markets) => {
  let code = getFiatCode(markets);
  if (code === "USD") {
    return "$";
  } else if (code === "CNY") {
    return "¥";
  } else {
    return "";
  }
}

export const formatPriceChange = (value, decimals) => {
  let prefix = "", text = "-", suffix = "%";
  if (value > 0) {
    prefix = "+";
    text = Number(value).toFixed(decimals);
  } else if (value < 0) {
    text = Number(value).toFixed(decimals);
  } else {
    suffix = "";
  }
  return prefix + text + suffix;
}