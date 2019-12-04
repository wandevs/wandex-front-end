import React from 'react';
import { connect } from 'react-redux';
import { updateCurrentMarket } from '../../actions/markets';
import QuoteFilter from './QuoteFilter';
import MarketSelector from './MarketSelector';
import './styles.scss';
import { getFiatCode } from '../../lib/utils';

const ALL_QUOTE_TOKENS = [
  {value: '', name: 'ALL'},
  {value: 'WWAN', name: 'WWAN'},
  {value: 'WETH', name: 'WETH'},
  {value: 'WBTC', name: 'WBTC'},
  {value: '$', name: 'Stable Coins'}
];

const STABLE_TOKEN = [
  'WUSDC', // TODO, ignore others
  'WGUSD',
  'WTUSD'
]

function formatMarket(market) {
  // market price, external price as the second choice
  market.extra = {};
  let price = 0, isExternalPrice = false;
  let baseFiat = market.baseTokenFiat[Object.keys(market.baseTokenFiat)[0]];
  market.extra.baseFiat = (baseFiat !== "-")? Number(baseFiat) : 0;
  let quoteFiat = market.quoteTokenFiat[Object.keys(market.quoteTokenFiat)[0]];
  market.extra.quoteFiat = (quoteFiat !== "-")? Number(quoteFiat) : 0;  
  if (quoteFiat !== "-") {
    market.extra.volume24h = quoteFiat * Number(market.quoteTokenVolume24h);
    if (baseFiat !== "-") {
      isExternalPrice = Number(baseFiat/quoteFiat).toFixed(market.priceDecimals);
    }
  }

  if (market.lastPrice !== "0") {
    price = Number(market.lastPrice);
  } else {
    let baseFiat = market.baseTokenFiat[Object.keys(market.baseTokenFiat)[0]];
    if ((baseFiat !== "-") && (quoteFiat !== "-")) {
      price = Number(baseFiat/quoteFiat).toFixed(market.priceDecimals);
      isExternalPrice = true;
    }
  }
  market.extra.price = price;
  market.extra.isExternalPrice = isExternalPrice;
  // volume
  if (quoteFiat !== "-") {
    market.extra.volume24h = quoteFiat * Number(market.quoteTokenVolume24h);
  }
  return market;
}

const mapStateToProps = state => {
  return {
    currentMarket: state.market.getIn(['markets', 'currentMarket']),
    markets: state.market.getIn(['markets', 'data']).map(market => formatMarket(market))
  };
};

class Market extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      quoteTokens: ALL_QUOTE_TOKENS,
      selectedQuoteToken: ALL_QUOTE_TOKENS[0].value,
      searchKey: "",
      fiatUnit: getFiatCode(props.markets),
      candidateMarkets: this.filterMarkets(props.markets, null, null)
    };
  }

  render() {
    return (
      <div>
        <div style={{background: "$backgroundGrey"}}>
          <QuoteFilter
            quoteTokens={this.state.quoteTokens}
            selectedToken={this.state.selectedQuoteToken}
            onSelectToken={token => this.selectQuoteToken(token)}
            searchKey={this.state.searchKey}
            onSearch={key => this.changeSearchKey(key)}
          />
        </div>
        <div>
          <MarketSelector
            markets={this.state.candidateMarkets}
            fiatUnit={this.state.fiatUnit}
            onSelectMarket={(market) => this.selectMarket(market)}
          />
        </div>
      </div>
    );
  }

  selectQuoteToken(token) {
    this.setState({selectedQuoteToken: token});
    this.setState({candidateMarkets: this.filterMarkets(this.props.markets, token, this.state.searchKey)});
  }  

  changeSearchKey(key) {
    this.setState({searchKey: key});
    this.setState({candidateMarkets: this.filterMarkets(this.props.markets, this.state.selectedQuoteToken, key)});
  }

  selectMarket(market) {
    if (this.props.currentMarket.id !== market.id) {
      this.props.dispatch(updateCurrentMarket(market));
    }
    if (this.state.searchKey) {
      this.setState({searchKey: ""}); // used once
      this.setState({candidateMarkets: this.filterMarkets(this.props.markets, this.state.selectedQuoteToken, "")});
    }
  }

  filterMarkets(markets, quoteToken, key) {
    return markets.filter((market) => {
      if (quoteToken) {
        let pairs = market.id.split('-');
        if (quoteToken === '$') { // stable token
          if (!STABLE_TOKEN.includes(pairs[1])) {
            return false;
          }
        } else if (pairs[1] !== quoteToken) {
          return false;
        }
      }
      if (key) {
        let reg = new RegExp(key, 'i');
        if (!market.id.match(reg)) {
          return false;
        }
      }
      return true;
    })
  }
}

export default connect(mapStateToProps)(Market);
