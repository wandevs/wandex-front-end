import React from 'react';
import { connect } from 'react-redux';
import './styles.scss';
import { updatePrice } from '../../actions/markets';
import { Tooltip } from 'antd';

class OrderBook extends React.Component {
  constructor(props) {
    super(props);
    this.lastUpdatedAt = null;
    this.forceRenderTimer = null;
    this.mouseOverAsk = false;
    this.mouseOverBid = false;
  }

  // max 1 render in 1 second
  shouldComponentUpdate() {
    if (this.lastUpdatedAt) {
      const diff = new Date().valueOf() - this.lastUpdatedAt;
      const shouldRender = diff > 1000;

      if (!shouldRender && !this.forceRenderTimer) {
        this.forceRenderTimer = setTimeout(() => {
          this.forceUpdate();
          this.forceRenderTimer = null;
        }, 1000 - diff);
      }
      return shouldRender;
    } else {
      return true;
    }
  }

  componentWillUnmount() {
    if (this.forceRenderTimer) {
      clearInterval(this.forceRenderTimer);
    }
  }

  componentDidUpdate() {
    this.lastUpdatedAt = new Date();
  }

  onClick = (price) => {
    const { dispatch } = this.props;
    dispatch(updatePrice(price));
  }

  renderProgressBar = (side, amount) => {
    let { bids, asks } = this.props;
    let totalAmount = 0;
    if(bids && bids.size > 0) {
      let bidDesc = bids.reverse();
      for(let i=0; i<bidDesc.size; i++) {
        totalAmount += Number(bidDesc.toArray()[i][1].toString());
      }
    }

    if(asks && asks.size > 0) {
      for(let i=0; i<asks.size; i++) {
        totalAmount += Number(asks.toArray()[i][1].toString());
      }
    }

    const width = 354 * Number(amount) / Number(totalAmount);

    const style = {width: width.toFixed(0) + "px"};

    return(
      side==="ask" ? (<div className="orderbook-progress-red" style={style}/>) : (<div className="orderbook-progress-green" style={style}/>)
    )
  }

  renderTipTitle = (price) => {
    let { bids, asks, currentMarket, dexTranslations } = this.props;
    let totalAmount = 0;
    let totalPrice = 0;
    if(bids && bids.size > 0) {
      let bidDesc = bids.reverse();
      let start = false;
      for(let i=0; i<bidDesc.size; i++) {
        if(price === bidDesc.toArray()[i][0].toString()) {
          start = true;
        }

        if(start) {
          totalPrice += Number(bidDesc.toArray()[i][0].toString())*Number(bidDesc.toArray()[i][1].toString());
          totalAmount += Number(bidDesc.toArray()[i][1].toString());
        }
      }
    }

    if(asks && asks.size > 0) {
      let start = false;
      for(let i=0; i<asks.size; i++) {
        if(price === asks.toArray()[i][0].toString()) {
          start = true;
        }

        if(start) {
          totalPrice += Number(asks.toArray()[i][0].toString())*Number(asks.toArray()[i][1].toString());
          totalAmount += Number(asks.toArray()[i][1].toString());
        }
      }
    }

    return(
      <div className="tipTitle">
        <div className="subTitle">{dexTranslations.AveragePrice}</div>
        <div className="subAmount">{(totalPrice/totalAmount).toFixed(currentMarket.priceDecimals)}</div>
        <div className="subTitle">{dexTranslations.Sum} {currentMarket.baseToken}: </div>
        <div className="subAmount">{totalAmount.toFixed(currentMarket.amountDecimals)}</div>
        <div className="subTitle">{dexTranslations.Sum} {currentMarket.quoteToken}: </div>
        <div className="subAmount">{totalPrice.toFixed(currentMarket.priceDecimals)}</div>
      </div>
    )
  }

  darkOrder(id, type, hover) {
    if(type === "ask") {
      for(let i=0; i<id; i++) {
        let divID = "ask_order_" + i;
        let obj = document.getElementById(divID);
        obj.style.backgroundColor= hover?"#2B1C2E":"#1B1C2E";
      }
    } else {
      for(let i=0; i<id; i++) {
        let divID = "bid_order_" + i;
        let obj = document.getElementById(divID);
        obj.style.backgroundColor= hover?"#1B2C2E":"#1B1C2E";
      }
    }
  }

  displayFormat(value, precision, decimal) {
    return value > 1e6 ? value.toPrecision(precision) : value.toFixed(decimal);
  }

  render() {
    let { bids, asks, websocketConnected, currentMarket, dexTranslations } = this.props;
    let midPrice = 0;
    let midInfo = "";
    let fiatMidPrice = "";
    if(bids.size > 0 && asks.size > 0) {
      midPrice += Number(bids.slice(0, 20).toArray()[0].toString().split(',')[0]);
      midPrice += Number(asks.slice(-20).reverse().toArray()[0].toString().split(',')[0]);
      midPrice /= 2;
    } else if (bids.size > 0) {
      midPrice += Number(bids.slice(0, 20).toArray()[0].toString().split(',')[0]);      
    } else if (asks.size > 0) {
      midPrice += Number(asks.slice(-20).reverse().toArray()[0].toString().split(',')[0]);
    }


    if(currentMarket.fiat && currentMarket.fiat !== "--") {
      fiatMidPrice = currentMarket.fiat[Object.keys(currentMarket.fiat)[0]] + " " + Object.keys(currentMarket.fiat)[0];
    } else {
      fiatMidPrice = "--"
    }

    midInfo = " " + midPrice.toFixed(currentMarket.priceDecimals) 
      + " " + currentMarket.quoteToken 
      + " " + fiatMidPrice;

    let bidIndex = 0;
    let askIndex = 0;

    return (
      <div className="orderbook flex-column flex-1 overflow-auto panelBg">
        <div className="flex header text-secondary">
          <div className="col-4 text-right">{dexTranslations.Amount}({currentMarket.baseToken})</div>
          <div className="col-4 text-right">{dexTranslations.Price}({currentMarket.quoteToken})</div>
          <div className="col-4 text-right">{dexTranslations.Total}({currentMarket.quoteToken})</div>
        </div>
        <div className="flex-column flex-1 overflow-auto">
          <div className="asks customBid flex-column flex-column-reverse flex-2 overflow-hidden">
            {asks
              .slice(-20)
              .reverse()
              .toArray()
              .map(([price, amount]) => {
                const disAmount = this.displayFormat(amount, 6, currentMarket.amountDecimals);
                const disPrice = this.displayFormat(price, 6, currentMarket.priceDecimals);
                const disTotal = this.displayFormat(price * amount, 6, currentMarket.priceDecimals);
                return (
                  <Tooltip placement="left"  key={price.toString()}
                  title={this.renderTipTitle(price.toString())}>
                  <div className="ask customBidNone flex align-items-center" 
                    key={price.toString()} 
                    id={"ask_order_"+(askIndex++).toString()}
                    onClick={this.onClick.bind(this, price)}
                    onMouseEnter={this.darkOrder.bind(this, askIndex, "ask", true)}
                    onMouseLeave={this.darkOrder.bind(this, askIndex, "ask", false)}
                    >
                    <div className="col-4 orderbook-amount text-right">
                      {disAmount}
                    </div>
                    <div className="col-4 text-danger text-right">{disPrice}</div>
                    <div className="col-4 text-danger text-right">{disTotal}</div>
                    {this.renderProgressBar("ask", amount.toString())}
                  </div>
                  </Tooltip>
                );
              })}
          </div>
          <div className="status border-top-dark border-bottom-dark">
            {websocketConnected ? (
              <div className="col-12 text-success text-center">
                <i className="fa fa-circle" aria-hidden="true" /> {midInfo}
              </div>
            ) : (
              <div className="col-12 text-danger text-center">
                <i className="fa fa-circle" aria-hidden="true" /> {midInfo}
              </div>
            )}
          </div>
          <div className="bids customAsk flex-column flex-1 overflow-hidden">
            {bids
              .slice(0, 20)
              .toArray()
              .map(([price, amount]) => {
                const disAmount = this.displayFormat(amount, 6, currentMarket.amountDecimals);
                const disPrice = this.displayFormat(price, 6, currentMarket.priceDecimals);
                const disTotal = this.displayFormat(price * amount, 6, currentMarket.priceDecimals);
                return (
                  <Tooltip placement="left" key={price.toString()}
                  title={this.renderTipTitle(price.toString())}>
                  <div className="bid customAskNone flex align-items-center" 
                    key={price.toString()} 
                    id={"bid_order_"+(bidIndex++).toString()}
                    onClick={this.onClick.bind(this, price)}
                    onMouseEnter={this.darkOrder.bind(this, bidIndex, "bid", true)}
                    onMouseLeave={this.darkOrder.bind(this, bidIndex, "bid", false)}>
                    <div className="col-4 orderbook-amount text-right">
                      {disAmount}
                    </div>
                    <div className="col-4 text-success text-right">{disPrice}</div>
                    <div className="col-4 text-success text-right">{disTotal}</div>
                    {this.renderProgressBar("bid", amount.toString())}
                  </div>
                  </Tooltip>
                );
              })}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    asks: state.market.getIn(['orderbook', 'asks']),
    bids: state.market.getIn(['orderbook', 'bids']),
    loading: false,
    currentMarket: state.market.getIn(['markets', 'currentMarket']),
    websocketConnected: state.config.get('websocketConnected'),
    theme: state.config.get('theme'),
    dexTranslations: state.language.get('dexTranslations'),
  };
};

export default connect(mapStateToProps)(OrderBook);
