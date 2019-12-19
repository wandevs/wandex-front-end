import React from 'react';
import { connect } from 'react-redux';
import { loadTokens, tokenApproveStart, tokenApproveFinish } from '../../actions/account';
import { toUnitAmount, isTokenApproved } from '../../lib/utils';
import { stateUtils } from '../../selectors/account';
import { enable, disable } from '../../lib/wallet';
import { getSelectedAccount } from 'wan-dex-sdk-wallet';
import { BigNumber } from 'bignumber.js';
import styles from './styles.scss';
import { Switch, Tooltip } from 'antd';

const mapStateToProps = state => {
  const selectedAccountID = state.WalletReducer.get('selectedAccountID');
  const selectedAccount = getSelectedAccount(state);
  const address = selectedAccount ? selectedAccount.get('address') : null;
  return {
    tokensInfo: stateUtils.getTokensInfo(state, address),
    approving: stateUtils.getApproveState(state),
    address,
    wanBalance: toUnitAmount(state.WalletReducer.getIn(['accounts', selectedAccountID, 'balance']), 18),
    markets: state.market.getIn(['markets', 'data']).toArray(),
    dexTranslations : state.language.get("dexTranslations"),
  };
};

class Tokens extends React.PureComponent {
  state = {loading: false}

  componentDidMount() {
    const { address, dispatch, markets } = this.props;
    if (address) {
      dispatch(loadTokens());
      this.fiats = [];
      this.getFiatFromMarkets(markets);
    }
  }

  componentDidUpdate(prevProps) {
    const { address, dispatch, markets } = this.props;
    if (address && address !== prevProps.address) {
      dispatch(loadTokens());
      this.fiats = [];
      this.getFiatFromMarkets(markets);
    }
  }

  moveWwanToFirst(arr) {
    if(!arr || arr.length === 0) {
      return
    }

    for(let i=0; i<arr.length; i++) {
      if(arr[i][0]==="WWAN") {
        this.swapItem(arr, i, 0);
        break;
      }
    }
  }

  swapItem(arr, fromIndex, toIndex) {
    arr[toIndex] = arr.splice(fromIndex, 1, arr[toIndex])[0];
    return arr;
  }

  getFiatFromMarkets(markets) {
    for(let i=0; i<markets.length; i++) {
      if(!this.fiats[markets[i].baseToken]) {
        this.fiats[markets[i].baseToken] = markets[i].baseTokenFiat['USD'] || 0;
      }
    }
  }

  render() {
    const { dispatch, tokensInfo, dexTranslations /*wanBalance*/, approving } = this.props;
    const displayDecimals = 6;
    const toolTipApprove = dexTranslations.toolTipApprove;
    const tokensInfoArray = tokensInfo.toArray();
    this.moveWwanToFirst(tokensInfoArray);
    
    return (
      <div className="flex-column">
        {/* <div className={styles.tokenOnePanel + " token flex"}>
          <div className="col-6">WAN</div>
          <div className="col-6 text-right">{wanBalance.toFixed(displayDecimals)}</div>
        </div> */}
        {tokensInfoArray.map(([token, info]) => {
          const { address, balance, allowance, decimals, lockedBalance, symbol } = info.toJS();
          const isApproved = isTokenApproved(allowance);
          const availableBalance = toUnitAmount(BigNumber.max(balance.minus(lockedBalance), '0'), decimals).toFixed(displayDecimals);
          const toolTipTitle = `In-Order: ${toUnitAmount(lockedBalance, decimals).toFixed(
            displayDecimals
          )}Total: ${toUnitAmount(balance, decimals).toFixed(displayDecimals)}`;
          let fiat = 0;
          if(this.fiats) {
            fiat = (this.fiats[token]||0)*availableBalance;
            if (fiat < 0.01 && token !== 'WWAN') {
              return null;
            }
          }

          return (
            <div key={token} className={styles.tokenOnePanel + " token flex"}>
              <div className="flex-column col-2">
                <Tooltip title={toolTipApprove}>
                <Switch
                  className={styles.switchStyle}
                  checked={isApproved}
                  onChange={(value, event) => {
                    if (isApproved) {
                      dispatch(disable(address, token, decimals));
                    } else {
                      dispatch(enable(address, token, decimals));
                    }
                    dispatch(tokenApproveStart(symbol));
                    setTimeout(()=>{
                      if (approving.get(symbol)) {
                        //Timeout 30s
                        dispatch(tokenApproveFinish(symbol));
                      }
                    }, 30000);
                  }}
                  key={address}
                  id={address}
                  loading={approving.get(symbol)}
                />
                </Tooltip>
              </div>

              <div className="flex-column col-5">
                <div>{token}</div>
                <div className={styles.fiatColor}>{isApproved ? dexTranslations.Enabled : dexTranslations.Disabled}</div>
              </div>
              <div className="col-5 text-right">
                <Tooltip title={toolTipTitle}>
                <div
                  className="flex-column"
                  key={toolTipTitle}
                  data-html="true"
                  data-toggle="tooltip"
                  data-placement="right"
                  title={toolTipTitle}
                  >
                  {availableBalance}
                </div>
                <div className={styles.fiatColor}>{"$"+fiat.toFixed(2)}</div>
                </Tooltip>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

export default connect(mapStateToProps)(Tokens);
