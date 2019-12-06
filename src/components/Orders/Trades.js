import React from 'react';
import { connect } from 'react-redux';
import { loadTrades } from '../../actions/account';
import { getSelectedAccount } from 'wan-dex-sdk-wallet';
import BigNumber from 'bignumber.js';

const mapStateToProps = state => {
  const selectedAccount = getSelectedAccount(state);
  const address = selectedAccount ? selectedAccount.get('address') : null;
  return {
    address,
    trades: state.account.get('trades'),
    isLoggedIn: state.account.getIn(['isLoggedIn', address]),
    currentMarket: state.market.getIn(['markets', 'currentMarket']),
    dexTranslations: state.language.get('dexTranslations'),
  };
};

class Trades extends React.PureComponent {
  componentDidMount() {
    const { isLoggedIn, dispatch } = this.props;
    if (isLoggedIn) {
      dispatch(loadTrades());
    }
  }

  componentDidUpdate(prevProps) {
    const { isLoggedIn, dispatch, trades, currentMarket } = this.props;
    if (isLoggedIn && (isLoggedIn !== prevProps.isLoggedIn || currentMarket !== prevProps.currentMarket)) {
      dispatch(loadTrades());
    }

    if (trades !== prevProps.trades) {
      this.ps && this.ps.update();
    }
  }

  render() {
    const { trades, address, currentMarket, dexTranslations } = this.props;
    return (
      <div className="trades flex-1 position-relative overflow-auto">
        <table className="table">
          <thead>
            <tr className="text-secondary">
              <th className="pair-column">{dexTranslations.Pair}</th>
              <th>{dexTranslations.Side}</th>
              <th className="text-right">{dexTranslations.Price}</th>
              <th className="text-right">{dexTranslations.Amount}</th>
              <th className="text-right">{dexTranslations.Status}</th>
            </tr>
          </thead>
          <tbody>
            {trades
              .toArray()
              .reverse()
              .map(([id, trade]) => {
                let side;
                if (trade.taker === address) {
                  side = trade.takerSide;
                } else {
                  side = trade.takerSide === 'buy' ? 'sell' : 'buy';
                }

                let status;
                let className = 'text-right ';
                if (trade.status === 'successful') {
                  status = <i className="fa fa-check" aria-hidden="true" />;
                  className += 'text-success';
                } else if (trade.status === 'pending') {
                  status = <i className="fa fa-circle-o-notch fa-spin" aria-hidden="true" />;
                } else {
                  className += 'text-danger';
                  status = <i className="fa fa-close" aria-hidden="true" />;
                }
                const symbol = trade.marketID.split('-')[0];
                return (
                  <tr key={id}>
                    <td className="pair-column">{trade.marketID}</td>
                    <td className={`${side === 'sell' ? 'text-danger' : 'text-success'}`}>{side}</td>
                    <td className={`text-right${side === 'sell' ? ' text-danger' : ' text-success'}`}>
                      {new BigNumber(trade.price).toFixed(currentMarket.priceDecimals)}
                    </td>
                    <td className="text-right">
                      {new BigNumber(trade.amount).toFixed(currentMarket.amountDecimals)} {symbol}
                    </td>
                    <td className={className}>{status}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    );
  }
}

export default connect(mapStateToProps)(Trades);
