import React from 'react';
import { connect } from 'react-redux';
import { loadOrders, cancelOrder } from '../../actions/account';
import { getSelectedAccount } from 'wan-dex-sdk-wallet';
import { addActivity } from '../../actions/activity';

const mapStateToProps = state => {
  const selectedAccount = getSelectedAccount(state);
  const address = selectedAccount ? selectedAccount.get('address') : null;
  return {
    orders: state.account.get('orders'),
    isLoggedIn: state.account.getIn(['isLoggedIn', address]),
    currentMarket: state.market.getIn(['markets', 'currentMarket']),
    dexTranslations: state.dex.get('dexTranslations'),
  };
};

class OpenOrders extends React.PureComponent {
  componentDidMount() {
    const { isLoggedIn, dispatch } = this.props;
    if (isLoggedIn) {
      dispatch(loadOrders());
    }
  }

  componentDidUpdate(prevProps) {
    const { isLoggedIn, dispatch, currentMarket } = this.props;
    if (isLoggedIn && (isLoggedIn !== prevProps.isLoggedIn || currentMarket !== prevProps.currentMarket)) {
      dispatch(loadOrders());
    }
  }

  render() {
    const { orders, dispatch, currentMarket, dexTranslations } = this.props;
    return (
      <div className="orders flex-1 position-relative overflow-auto" >
        <table className="table">
          <thead>
            <tr className="text-secondary">
              <th className="pair-column">{dexTranslations.Pair}</th>
              <th>{dexTranslations.Side}</th>
              <th className="text-right">{dexTranslations.Price}</th>
              <th className="text-right">{dexTranslations.Amount}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {orders
              .toArray()
              .reverse()
              .map(([id, order]) => {
                if (order.availableAmount.eq(0)) {
                  return null;
                }
                const symbol = order.marketID.split('-')[0];
                return (
                  <tr key={id}>
                    <td className="pair-column">{order.marketID}</td>
                    <td className={order.side === 'sell' ? 'text-danger' : 'text-success'}>{order.side}</td>
                    <td className="text-right">{order.price.toFixed(currentMarket.priceDecimals)}</td>
                    <td className="text-right">
                      {order.availableAmount.toFixed(currentMarket.amountDecimals)} {symbol}
                    </td>
                    <td className="text-right">
                      <button className="btn btn-outline-danger" onClick={() => {
                        dispatch(addActivity("cancelOrder:"+ order.id));
                        dispatch(cancelOrder(order.id))
                      }}>
                        {dexTranslations.Cancel}
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    );
  }
}

export default connect(mapStateToProps)(OpenOrders);
