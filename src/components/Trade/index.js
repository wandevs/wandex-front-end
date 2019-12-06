import React from 'react';
import { connect } from 'react-redux';
import { formValueSelector, Field, stopSubmit } from 'redux-form';
import { TRADE_FORM_ID } from '../../actions/trade';
import { reduxForm } from 'redux-form';
import { trade } from '../../actions/trade';
import BigNumber from 'bignumber.js';
import { loadHotDiscountRules, getHotTokenAmount } from '../../actions/fee';
import { calculateTrade } from '../../lib/tradeCalculator';
import { loginRequest } from '../../actions/account';
import './styles.scss';
import { sleep, toUnitAmount, truncateDecimals } from '../../lib/utils';
import { getSelectedAccount } from 'wan-dex-sdk-wallet';
import { stateUtils } from '../../selectors/account';
import { Button, Select } from 'antd';
const { Option } = Select;

const mapStateToProps = state => {
  const selector = formValueSelector(TRADE_FORM_ID);
  const bids = state.market.getIn(['orderbook', 'bids']);
  const asks = state.market.getIn(['orderbook', 'asks']);
  const selectedAccount = getSelectedAccount(state);
  const address = selectedAccount ? selectedAccount.get('address') : null;
  const currentMarket = state.market.getIn(['markets', 'currentMarket']);
  const selectPrice = state.market.getIn(['tokenPrices', 'price'])
  const lastTrade = state.market.get('tradeHistory').last();
  const lastPrice = lastTrade ? new BigNumber(lastTrade.price) : new BigNumber('0');

  return {
    initialValues: {
      side: 'buy',
      orderType: 'limit',
      subtotal: new BigNumber(0),
      total: new BigNumber(0),
      totalBase: new BigNumber(0),
      feeRate: new BigNumber(0),
      gasFee: new BigNumber(0),
      hotDiscount: new BigNumber(1),
      tradeFee: new BigNumber(0),
      estimatedPrice: new BigNumber(0),
      marketOrderWorstPrice: new BigNumber(0),
      marketOrderWorstTotalQuote: new BigNumber(0),
      marketOrderWorstTotalBase: new BigNumber(0),
    },
    lastPrice,
    selectPrice,
    currentMarket,
    quoteTokenBalance: stateUtils.getTokenAvailableBalance(state, address, currentMarket.quoteToken),
    baseTokenBalance: stateUtils.getTokenAvailableBalance(state, address, currentMarket.baseToken),
    hotTokenAmount: state.config.get('hotTokenAmount'),
    address,
    isLoggedIn: state.account.getIn(['isLoggedIn', address]),
    price: new BigNumber(selector(state, 'price') || 0),
    amount: new BigNumber(selector(state, 'amount') || 0),
    total: new BigNumber(selector(state, 'total') || 0),
    totalBase: new BigNumber(selector(state, 'totalBase') || 0),
    subtotal: new BigNumber(selector(state, 'subtotal') || 0),
    feeRate: new BigNumber(selector(state, 'feeRate') || 0),
    gasFee: new BigNumber(selector(state, 'gasFee') || 0),
    estimatedPrice: new BigNumber(selector(state, 'estimatedPrice') || 0),
    marketOrderWorstPrice: new BigNumber(selector(state, 'marketOrderWorstPrice') || 0),
    marketOrderWorstTotalQuote: new BigNumber(selector(state, 'marketOrderWorstTotalQuote') || 0),
    marketOrderWorstTotalBase: new BigNumber(selector(state, 'marketOrderWorstTotalBase') || 0),
    hotDiscount: new BigNumber(selector(state, 'hotDiscount') || 1),
    tradeFee: new BigNumber(selector(state, 'tradeFee') || 0),
    side: selector(state, 'side'),
    orderType: selector(state, 'orderType'),
    bestBidPrice: bids.size > 0 ? bids.get(0)[0].toString() : null,
    bestAskPrice: asks.size > 0 ? asks.get(asks.size - 1)[0].toString() : null,
    bids,
    asks,
    dexTranslations: state.language.get('dexTranslations'),
  };
};

class Trade extends React.PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    loadHotDiscountRules();
    this.interval = window.setInterval(() => {
      dispatch(getHotTokenAmount());
    }, 30 * 1000);
  }

  componentDidUpdate(prevProps) {
    const { currentMarket, reset, lastPrice, selectPrice, price, change, orderType, side } = this.props;
    if (currentMarket.id === prevProps.currentMarket.id) {
      if (!lastPrice.eq(prevProps.lastPrice) && price.eq(0) && orderType !== "market") {
        change('price', lastPrice);
      }
      if (selectPrice && !selectPrice.eq(prevProps.selectPrice) && orderType !== "market") {
        change('price', selectPrice);
      }

      if (orderType === "market") {
        if (side === "sell") {
          this.updateMarketPrice();
        } else {
          this.updateMarketAmount();
        }
      }

      this.updateFees(prevProps);
    } else {
      reset();
    }


  }

  render() {
    const { side, handleSubmit, currentMarket, total, gasFee, amount, tradeFee, subtotal, change, quoteTokenBalance, baseTokenBalance, orderType, dexTranslations } = this.props;
    if (!currentMarket) {
      return null;
    }
    const disDecimal = currentMarket.priceDecimals + currentMarket.amountDecimals;
    let amountUnit = currentMarket.baseToken;
    let amountDecimals = currentMarket.amountDecimals;
    if (orderType === "market" && side === "buy") {
      amountUnit = currentMarket.quoteToken;
      amountDecimals = currentMarket.priceDecimals; 
    } 

    return (
      <>
        <div className="title">
          <div className="titleLogo"/>
          <div>{dexTranslations.Trade}</div>
        </div>
        <div className="trade flex-1 flex-column overflow-auto">
          <ul className="nav nav-tabs">
            <li className="nav-item flex-1 flex">
              <div
                className={`flex-1 tab-button text-secondary text-center${side === 'buy' ? ' active' : ''}`}
                onClick={() => change('side', 'buy')}>
                {dexTranslations.Buy}
              </div>
            </li>
            <li className="nav-item flex-1 flex">
              <div
                className={`flex-1 tab-button text-secondary text-center${side === 'sell' ? ' active' : ''}`}
                onClick={() => change('side', 'sell')}>
                {dexTranslations.Sell}
              </div>
            </li>
          </ul>
          <div className="flex flex-1 position-relative overflow-auto panelBg" >
            <form
              className="form flex-column text-secondary flex-1 justify-content-between"
              onSubmit={handleSubmit(() => this.submit())}>
              <div>
                <div className="selectField">
                <Select 
                  defaultValue="limit"
                  value={orderType}
                  >
                  <Option value="limit" onClick={()=>this.changeOrderType("limit")}>{dexTranslations.LimitOrder}</Option>
                  <Option value="market" onClick={()=>this.changeOrderType("market")}>{dexTranslations.MarketOrder}</Option>
                </Select>
                </div>
                {
                  (orderType==="limit") ? 
                  (
                  <div>
                    <div className="best-buttons">
                      <Button onClick={()=>this.updatePrice("ask")} className="best-button">{dexTranslations.BestAsk}</Button>
                      <Button onClick={()=>this.updatePrice("bid")} className="best-button-right">{dexTranslations.BestBid}</Button>
                    </div>
                    <Field
                      name="price"
                      unit={currentMarket.quoteToken}
                      autoComplete="off"
                      component={this.renderField}
                      label={dexTranslations.LimitPrice}
                      placeholder={Number(0).toFixed(currentMarket.priceDecimals)}
                      type="number"
                      min="0"
                      step={Number(1 / (10 ** currentMarket.priceDecimals))}
                      normalize={this.normalizePrice.bind(this)}
                    />
                  </div>
                  ) : 
                  (
                  <div>
                    {(side === "buy")?
                    (<Field
                      name="amountEstimate"
                      unit={currentMarket.baseToken}
                      autoComplete="off"
                      component={this.renderDisableField}
                      label={currentMarket.baseToken + " " + dexTranslations.AmountEstimate}
                      placeholder={Number(0).toFixed(currentMarket.priceDecimals)}
                      type="text"
                      min="0"
                    />):(
                    <Field
                      name="priceEstimate"
                      unit={currentMarket.quoteToken}
                      autoComplete="off"
                      component={this.renderDisableField}
                      label={dexTranslations.AveragePriceEstimate}
                      placeholder={Number(0).toFixed(currentMarket.priceDecimals)}
                      type="text"
                      min="0"
                    />)}
                  </div>
                  )
                }
                
                <Field
                  name="amount"
                  unit={amountUnit}
                  autoComplete="off"
                  component={this.renderField}
                  label={dexTranslations.Amount}
                  placeholder={Number(0).toFixed(amountDecimals)}
                  type="number"
                  min="0"
                  step={Number(1 / (10 ** amountDecimals))}
                  normalize={this.normalizeAmount.bind(this)}
                />
                <div>
                  <Button onClick={()=>this.updateAmount(25)} className="percentButton">25%</Button>
                  <Button onClick={()=>this.updateAmount(50)} className="percentButton">50%</Button>
                  <Button onClick={()=>this.updateAmount(75)} className="percentButton">75%</Button>
                  <Button onClick={()=>this.updateAmount(100)} className="percentButton">100%</Button>
                </div>
                <div className="form-group">
                  <div className="form-title">{dexTranslations.OrderSummary}</div>
                  <div className="list">
                    <div className="item flex justify-content-between">
                      <div className="name">{dexTranslations.Amount}</div>
                      <div className="name">{amount.toFixed(amountDecimals) + " " + amountUnit}</div>
                    </div>
                    <div className="item flex justify-content-between" style={{"marginBottom":"10px"}}>
                      <div className="name">{(side === 'buy' ? currentMarket.quoteToken:currentMarket.baseToken) + " " + dexTranslations.Available}</div>
                      <div className="name">
                      {
                        side === 'buy'?
                        toUnitAmount(quoteTokenBalance<0?0:quoteTokenBalance, currentMarket.quoteTokenDecimals).toFixed(disDecimal, BigNumber.ROUND_DOWN) + " " + currentMarket.quoteToken :
                        toUnitAmount(baseTokenBalance<0?0:baseTokenBalance, currentMarket.baseTokenDecimals).toFixed(disDecimal, BigNumber.ROUND_DOWN) + " " + currentMarket.baseToken
                        }
                      </div>
                    </div>
                    <div className="item flex justify-content-between">
                      <div className="name">{dexTranslations.Subtotal}</div>
                      <div className="name">{subtotal.toFixed(disDecimal)+ " " + currentMarket.quoteToken}</div>
                    </div>
                    <div className="item flex justify-content-between" style={{"marginBottom":"10px"}}>
                      <div className="name">{dexTranslations.Fees}</div>
                      <div className="name">{gasFee.plus(tradeFee).toFixed(disDecimal)+ " " + currentMarket.quoteToken}</div>
                    </div>
                    <div className="item flex justify-content-between">
                      <div className="name">{dexTranslations.Total}</div>
                      <div className="name">{total.toFixed(disDecimal)+ " " + currentMarket.quoteToken}</div>
                    </div>
                  </div>
                </div>
              </div>
              <button type="submit" className={`btn trade-button`}>
                {side?side.toString().toUpperCase():side} {currentMarket.baseToken}
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  normalizePrice(price) {
    const { currentMarket } = this.props;
    return truncateDecimals(price, currentMarket.priceDecimals);
  }

  normalizeAmount(amount, ) {
    const { currentMarket, orderType, side } = this.props;
    let amountDecimals = currentMarket.priceDecimals;
    if (orderType === "market" && side === "buy") {
      amountDecimals = currentMarket.priceDecimals; 
    } 
    return truncateDecimals(amount, amountDecimals);
  }  

  renderField = ({ input, label, unit, meta, ...attrs }) => {
    const { submitFailed, error } = meta;

    return (
      <div className="form-group">
        <label>{label}</label>
        <div className="input-group">
          <input className="form-control" {...input} {...attrs} />
          <span className="text-secondary unit">{unit}</span>
        </div>
        <span className="text-danger">{submitFailed && (error && <span>{error}</span>)}</span>
      </div>
    );
  };

  renderDisableField = ({ input, label, unit, meta, ...attrs }) => {
    const { submitFailed, error } = meta;

    return (
      <div className="form-group">
        <label>{label}</label>
        <div className="input-group-disable">
          <input className="form-control-disable" disabled={true} {...input} {...attrs} />
          <span className="text-secondary unit">{unit}</span>
        </div>
        <span className="text-danger">{submitFailed && (error && <span>{error}</span>)}</span>
      </div>
    );
  };

  async submit() {
    const { amount, price, side, orderType, dispatch, isLoggedIn, address } = this.props;
    if (!isLoggedIn) {
      await dispatch(loginRequest(address));
      // Metamask's window will be hidden when continuous call Metamask sign method
      await sleep(500);
    }
    try {
      await dispatch(trade(side, price, amount, orderType));
    } catch (e) {
      window.alertAntd(e);
    }
  }

  updateMarketPrice() {
    const { amount, bids, orderType, currentMarket, change } = this.props;
    if (orderType !== "market" || amount.toString() === "0") {
      return;
    }

    let orderArray = null;
    let findAmount = Number(0);
    let totalPrice = Number(0);
    let amountDecimals = currentMarket.amountDecimals;
    let totalAmount = amount.toFixed(amountDecimals);
    
    if(!bids) {return}
    
    orderArray = bids.toArray();

    for (let i=0; i<orderArray.length; i++) {
      let price = Number(orderArray[i][0].toFixed(currentMarket.priceDecimals));
      let priceAmount = Number(orderArray[i][1].toFixed(currentMarket.amountDecimals));
      if((findAmount + priceAmount) <= totalAmount) {
        findAmount += priceAmount;
        totalPrice += price * priceAmount;
      } else {
        let lastAmount = (totalAmount - findAmount);
        findAmount += lastAmount;
        totalPrice += price * lastAmount;
        break;
      }

      if(findAmount >= totalAmount) {
        break;
      }
    }
    change('priceEstimate', (totalPrice/findAmount).toFixed(currentMarket.priceDecimals));
  }

  updateMarketAmount() {
    const { amount, asks, orderType, currentMarket, change } = this.props;
    if (orderType !== "market" || amount.toString() === "0") {
      return;
    }

    let orderArray = null;
    let findAmount = Number(0);
    let totalBaseToken = Number(0);
    let amountDecimals = currentMarket.priceDecimals; 
    //quoteAmount
    let totalAmount = amount.toFixed(amountDecimals);

    if(!asks) {return}
    
    orderArray = asks.toArray().reverse();      

    for (let i=0; i<orderArray.length; i++) {
      let price = Number(orderArray[i][0].toFixed(currentMarket.priceDecimals));
      let subAmount = Number(orderArray[i][1].toFixed(currentMarket.amountDecimals));
      let priceAmount = Number(orderArray[i][1].toFixed(currentMarket.amountDecimals)) * price;
      if((findAmount + priceAmount) <= totalAmount) {
        findAmount += priceAmount;
        totalBaseToken += subAmount;
      } else {
        let lastAmount = (totalAmount - findAmount);
        findAmount += lastAmount;
        totalBaseToken += lastAmount / price;
        break;
      }

      if(findAmount >= totalAmount) {
        break;
      }
    }

    let bigBaseToken = new BigNumber(totalBaseToken)

    change('amountEstimate', bigBaseToken.toFixed(currentMarket.amountDecimals, BigNumber.ROUND_DOWN));
  }

  updateFees(prevProps) {
    const { currentMarket, orderType, side, price, amount, hotTokenAmount, change } = this.props;
    if (
      orderType === prevProps.orderType &&
      side === prevProps.side &&
      price.eq(prevProps.price) &&
      amount.eq(prevProps.amount) &&
      hotTokenAmount.eq(prevProps.hotTokenAmount)
    ) {
      return;
    }
    const { asMakerFeeRate, asTakerFeeRate, gasFeeAmount, priceDecimals, amountDecimals, quoteTokenDecimals } = currentMarket;

    const calculateParam = {
      orderType,
      side,
      price: new BigNumber(price),
      amount: new BigNumber(amount),
      hotTokenAmount,
      gasFeeAmount,
      asMakerFeeRate,
      asTakerFeeRate,
      amountDecimals,
      priceDecimals,
      quoteTokenDecimals
    };
    const calculateResult = calculateTrade(calculateParam);

    change('subtotal', calculateResult.subtotal);
    change('estimatedPrice', calculateResult.estimatedPrice);
    change('totalBase', calculateResult.totalBaseTokens);
    change('total', calculateResult.totalQuoteTokens);
    change('feeRate', calculateResult.feeRateAfterDiscount);
    change('gasFee', calculateResult.gasFeeAmount);
    change('hotDiscount', calculateResult.hotDiscount);
    change('tradeFee', calculateResult.tradeFeeAfterDiscount);
  }

  changeOrderType(type) {
    const { change } = this.props;
    change('orderType', type)
    if (type === "market") {
      change('price', 0);
      change('priceEstimate', '');
      change('amountEstimate', '');
      change('amount', '');
    }
  }

  updatePrice(type) {
    const { bestBidPrice, bestAskPrice, change } = this.props;
    if(type==="ask") {
      if(bestAskPrice) {change('price', bestAskPrice);}
    } else {
      if(bestAskPrice) {change('price', bestBidPrice);}
    }
  }

  updateAmount(amountPercent) {
    const { currentMarket, side, price,  change, quoteTokenBalance, baseTokenBalance } = this.props;
    if (side === 'sell') {
      const total = toUnitAmount(baseTokenBalance, currentMarket.baseTokenDecimals);
      const decimal = currentMarket.amountDecimals;
      if (total <= 0) {
        return;
      }
      change('amount', (new BigNumber(total * amountPercent / 100.0)).toFixed(decimal, BigNumber.ROUND_DOWN));
    } else {
      const total = toUnitAmount(quoteTokenBalance, currentMarket.quoteTokenDecimals).toFixed(currentMarket.priceDecimals, BigNumber.ROUND_DOWN);
      const decimal = currentMarket.amountDecimals;
      if (total <= 0) {
        return;
      }
      if (amountPercent <= 75) {
        change('amount', (total * amountPercent / 100.0 / price).toFixed(decimal));
      } else {
        let maxAmount = new BigNumber(total * amountPercent / 100.0 / price);
        maxAmount = maxAmount.toFixed(decimal, BigNumber.ROUND_DOWN);
        const fee = this.getFeeByAmount(new BigNumber(maxAmount));
        if(maxAmount > fee/price) {
          change('amount', (new BigNumber(maxAmount - fee / price)).toFixed(decimal, BigNumber.ROUND_DOWN));
        }
      }
    }
  }

  getFeeByAmount(amount) {
    const { currentMarket, orderType, side, price, hotTokenAmount } = this.props;
    const { asMakerFeeRate, asTakerFeeRate, gasFeeAmount, priceDecimals, amountDecimals } = currentMarket;

    const calculateParam = {
      orderType,
      side,
      price: new BigNumber(price),
      amount: new BigNumber(amount),
      hotTokenAmount,
      gasFeeAmount,
      asMakerFeeRate,
      asTakerFeeRate,
      amountDecimals,
      priceDecimals
    };
    const ret = calculateTrade(calculateParam);
    return ret.totalQuoteTokens - ret.subtotal;
  }
}

const validate = (values, props) => {
  const { price, amount, total, amountEstimate } = values;
  const { side, address, currentMarket, quoteTokenBalance, baseTokenBalance, orderType } = props;

  let _price, _amount, _total;

  const errors = {};

  if (address) {
    if (side === 'buy') {
      const quoteTokenAmount = toUnitAmount(quoteTokenBalance, currentMarket.quoteTokenDecimals);
      if (quoteTokenAmount.eq(0)) {
        errors.amount = `Insufficient ${currentMarket.quoteToken} balance`;
      }
    } else {
      const baseTokenAmount = toUnitAmount(baseTokenBalance, currentMarket.baseTokenDecimals);
     
      if (baseTokenAmount.eq(0)) {
        errors.amount = `Insufficient ${currentMarket.baseToken} balance`;
      }
    }
  }

  if (orderType === "market" && side === "buy") {
    if (Number(amountEstimate) <= 0)
    {
      errors.amount = `Amount too small`;
    }
  }

  if (!errors.price) {
    if (!price) {
      errors.price = 'Price required';
    } else if (isNaN(Number(price))) {
      errors.price = 'Price must be a number';
    } else {
      _price = new BigNumber(price);
      if (_price.lte('0')) {
        errors.price = `Price cannot be 0`;
      }

      if (!_price.lte('1e13')) {
        errors.price = `Price too large`;
      }
    }
  }
  if (!errors.amount) {
    if (!amount) {
      errors.amount = 'Amount required';
    } else if (isNaN(Number(amount))) {
      errors.amount = 'Amount must be a number';
    } else {
      _amount = new BigNumber(amount);

      if (_amount.lte('0')) {
        errors.amount = `Amount cannot be 0`;
      } else if (_amount.multipliedBy(_price).lt(currentMarket.minOrderSize)) {
        errors.amount = `total sale price too small`;
      }
    }
  }

  if (!errors.amount && !errors.price && total && address) {
    _total = new BigNumber(total);
    if (side === 'buy') {
      const quoteTokenAmount = toUnitAmount(quoteTokenBalance, currentMarket.quoteTokenDecimals);

      if (_total.gt(quoteTokenAmount)) {
        errors.amount = `Insufficient ${currentMarket.quoteToken} balance`;
      }
    } else {
      const baseTokenAmount = toUnitAmount(baseTokenBalance, currentMarket.baseTokenDecimals);

      if (_amount.gt(baseTokenAmount)) {
        errors.amount = `Insufficient ${currentMarket.baseToken} balance`;
      } else if (_total.lte('0')) {
        errors.amount = `Amount too small: total sale price less than fee`;
      }
    }
  }
  return errors;
};

const shouldError = () => {
  return true;
};
const onSubmitFail = (_, dispatch) => {
  setTimeout(() => {
    dispatch(stopSubmit(TRADE_FORM_ID));
  }, 3000);
};

export default connect(mapStateToProps)(
  reduxForm({
    form: TRADE_FORM_ID,
    destroyOnUnmount: false,
    onSubmitFail,
    validate,
    shouldError
  })(Trade)
);
