import React from 'react';
import './styles.scss';
import OrdersDetail from './OrdersDetail'
import {
  loadOtherOrders,
  loadOrders,
  loadMoreOrders,
  loadMoreOtherOrders,
  markOrderLoadingState,
  markOtherOrderLoadingState,
} from '../../actions/account';
import { getSelectedAccount } from 'wan-dex-sdk-wallet';
import { connect } from 'react-redux';

const mapStateToProps = state => {
  const selectedAccount = getSelectedAccount(state);
  const address = selectedAccount ? selectedAccount.get('address') : null;
  return {
    orders: state.account.get('orders'),
    ordersCount: state.account.get('ordersCount'),
    otherOrders: state.account.get('otherOrders'),
    isLoggedIn: state.account.getIn(['isLoggedIn', address]),
    orderLoading: state.account.get('order_loading'),
    otherOrderLoading: state.account.get('other_order_loading'),
    currentMarket: state.market.getIn(['markets', 'currentMarket'])
  };
};

class OrderDetail extends React.PureComponent {
  componentDidMount() {
    const { isLoggedIn, dispatch } = this.props;
    if (isLoggedIn) {
      markOrderLoadingState(dispatch, true);
      markOtherOrderLoadingState(dispatch, true);
      dispatch(loadOtherOrders());
      dispatch(loadOrders());
    }
  }

  componentDidUpdate(prevProps) {
    const { isLoggedIn, dispatch, orders, currentMarket } = this.props;
    if (isLoggedIn && (isLoggedIn !== prevProps.isLoggedIn || currentMarket !== prevProps.currentMarket)) {
      dispatch(loadOtherOrders());
      dispatch(loadOrders());
    }
    if (orders !== prevProps.orders) {
      this.ps && this.ps.update();
    }
  }

  loadMore( type ) {
    const { orderLoading, otherOrderLoading, dispatch } = this.props;

    if (type === 1) {
      if (!orderLoading) {
        markOrderLoadingState(dispatch, true);
        dispatch(loadMoreOrders());
      }
    } else {
      if (!otherOrderLoading) {
        markOtherOrderLoadingState(dispatch, true);
        dispatch(loadMoreOtherOrders());
      }
    }
  }
  render() {
    const {orders, otherOrders, currentMarket, orderLoading, otherOrderLoading} = this.props;

    if (!otherOrders) {
      return null
    }

    return (
      <div className="container-0">
        <OrdersDetail loading={orderLoading} typeOrders={orders} count={this.props.ordersCount} itemType={1} currentMarket={currentMarket} loadMore={() => this.loadMore(1)}/>
        <OrdersDetail loading={otherOrderLoading} typeOrders={otherOrders} itemType={2} currentMarket={currentMarket}/>
      </div>
    );
  }
}

export default connect(mapStateToProps)(OrderDetail);