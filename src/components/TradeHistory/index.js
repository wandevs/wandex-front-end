import React from 'react';
import { connect } from 'react-redux';
import BigNumber from 'bignumber.js';
import moment from 'moment';

const mapStateToProps = state => {
  return {
    tradeHistory: state.market.get('tradeHistory'),
    currentMarket: state.market.getIn(['markets', 'currentMarket']),
    dexTranslations: state.language.get('dexTranslations'),
  };
};

class TradeHistory extends React.PureComponent {
  // componentDidUpdate(prevProps) {
  //   const { tradeHistory } = this.props;
  // }

  render() {
    const { tradeHistory, currentMarket, dexTranslations } = this.props;
    return (
      <div className="trade-history flex-1 position-relative overflow-auto panelBg">
        <table className="table">
          <thead>
            <tr className="text-secondary">
              <th className="text-right">{dexTranslations.Price}</th>
              <th className="text-right">{dexTranslations.Amount}</th>
              <th>{dexTranslations.Time}</th>
            </tr>
          </thead>
          <tbody>
            {tradeHistory
              .toArray()
              .reverse()
              .map(([id, trade]) => {
                const colorGreen = trade.takerSide === 'buy';
                return (
                  <tr key={trade.id}>
                    <td className={['text-right', colorGreen ? 'text-success' : 'text-danger'].join(' ')}>
                      {new BigNumber(trade.price).toFixed(currentMarket.priceDecimals)}
                      {trade.takerSide === 'buy' ? (
                        <i className="fa fa-arrow-up" aria-hidden="true" />
                      ) : (
                        <i className="fa fa-arrow-down" aria-hidden="true" />
                      )}
                    </td>
                    <td className="text-right">{new BigNumber(trade.amount).toFixed(currentMarket.amountDecimals)}</td>
                    <td className="text-secondary">{moment(trade.executedAt).format('HH:mm:ss')}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    );
  }
}

export default connect(mapStateToProps)(TradeHistory);
