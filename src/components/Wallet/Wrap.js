import React from 'react';
import { connect } from 'react-redux';
import BigNumber from 'bignumber.js';
import { wrapWAN, unwrapWWAN } from '../../lib/wallet';
import { toUnitAmount, truncateDecimals } from '../../lib/utils';
import { stateUtils } from '../../selectors/account';
import { getSelectedAccount } from 'wan-dex-sdk-wallet';

const mapStateToProps = state => {
  const WWAN = state.config.get('WWAN');
  const selectedAccount = getSelectedAccount(state);
  const wanBalance = selectedAccount ? selectedAccount.get('balance') : new BigNumber('0');
  const address = selectedAccount ? selectedAccount.get('address') : null;
  const wwanBalance = stateUtils.getTokenAvailableBalance(state, address, 'WWAN');
  return {
    wanBalance: toUnitAmount(wanBalance, 18),
    wwanBalance: toUnitAmount(wwanBalance, WWAN.decimals),
    dexTranslations: state.dex.get('dexTranslations')
  };
};

class Wrap extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      amount: '0'
    };
  }

  componentDidUpdate(prevProps) {
    const { type } = this.props;
    if (type !== prevProps.type) {
      this.setState({ amount: '0' });
    }
  }

  render() {
    const { wanBalance, wwanBalance, type, dexTranslations } = this.props;
    const { amount } = this.state;
    const isWrap = type === 'wrap';
    const typeLabel = isWrap? dexTranslations.wrap : dexTranslations.unwrap;

    return (
      <form className="form flex-column text-secondary flex-1 justify-content-between block">
        <div className="form-group">
          <label className="text-secondary">
            {dexTranslations.Amount} ({isWrap ? wanBalance.toFixed(8) : wwanBalance.toFixed(8)} {dexTranslations.Max})
          </label>
          <div className="input-group">
            <input
              className="form-control"
              type="number"
              min="0"
              step="0.00000001"
              value={amount}
              onChange={event => this.setState({amount: truncateDecimals(event.target.value, 8)})}
            />
          </div>
        </div>
        <button
          type="button"
          className={`form-control btn ${isWrap ? 'btn-success' : 'btn-danger'}`}
          onClick={() => this.submit()}>
          {typeLabel}
        </button>
      </form>
    );
  }

  submit() {
    const { dispatch, type, wanBalance, wwanBalance, dexTranslations} = this.props;
    const isWrap = type === 'wrap';
    const typeLabel = isWrap? dexTranslations.wrap : dexTranslations.unwrap;
    const { amount } = this.state;
    let value = new BigNumber(amount || "0");
    let balance = (type === 'wrap')? wanBalance : wwanBalance;
    if (value.lte(0)) {
      window.alertAntd({tip: dexTranslations.wrapTip1});
      return;
    } else if (value.gt(balance)) {
      window.alertAntd({tip: dexTranslations.wrapTip2 + typeLabel});
      return;
    }
    if (type === 'wrap') {
      dispatch(wrapWAN(amount));
    } else {
      dispatch(unwrapWWAN(amount));
    }
  }
}

export default connect(mapStateToProps)(Wrap);
