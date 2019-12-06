import React from 'react';
import { connect } from 'react-redux';
import styles from './styles.scss';
import { Modal, Button, Drawer, InputNumber } from 'antd';
import { WalletButtonLong, getSelectedAccount } from 'wan-dex-sdk-wallet';
import Tokens from './Tokens'
import { stateUtils } from '../../selectors/account';
import { toUnitAmount, truncateDecimals } from '../../lib/utils';
import { loadTokens } from '../../actions/account';
import { BigNumber } from 'bignumber.js';
import { wrapWAN, unwrapWWAN } from '../../lib/wallet';

const mapStateToProps = state => {
  const selectedAccountID = state.WalletReducer.get('selectedAccountID');
  const selectedAccount = getSelectedAccount(state);
  const address = selectedAccount ? selectedAccount.get('address') : null;
  return {
    tokensInfo: stateUtils.getTokensInfo(state, address),
    wanBalance: toUnitAmount(state.WalletReducer.getIn(['accounts', selectedAccountID, 'balance']), 18),
    markets: state.market.getIn(['markets', 'data']).toArray(),
    address,
    dexTranslations : state.dex.get("dexTranslations"),
  };
};

class Balance extends React.PureComponent {
  state = { 
    wrapVisible: false, 
    unwrapVisible: false, 
    wrapAmount: null,
    totalFiat: 0,
    type: 'wrap',
    wwanBalance: null, 
  }

  componentDidMount() {
    const { address, dispatch, markets } = this.props;
    if (address) {
      dispatch(loadTokens());
      this.fiats = [];
      this.getFiatFromMarkets(markets);
      this.getTotalFiat();
    }
  }

  componentDidUpdate(prevProps) {
    const { address, dispatch, markets } = this.props;
    if (address && address !== prevProps.address) {
      dispatch(loadTokens());
      this.fiats = [];
      this.getFiatFromMarkets(markets);
    }
    this.getTotalFiat();
    if(this.ps) {
      this.ps.update();
    }
  }

  getTotalFiat() {
    const { tokensInfo, wanBalance } = this.props;
    const displayDecimals = 6;
    let totalFiat = 0;
    let wwanBalance = 0;
    if (this.fiats) {
      tokensInfo.toArray().map(([token, info]) => {
        const { balance, decimals, lockedBalance } = info.toJS();
        const availableBalance = toUnitAmount(BigNumber.max(balance.minus(lockedBalance), '0'), decimals).toFixed(displayDecimals);
        totalFiat += Number((this.fiats[token]||0)*availableBalance);
        if(token === 'WWAN') {
          wwanBalance = Number(availableBalance);
        }
        return null;
      });

      totalFiat += Number((this.fiats['WWAN']||0)*wanBalance);

      if(this.state.wwanBalance !== wwanBalance || this.state.totalFiat !== totalFiat) {
        this.setState({wwanBalance: wwanBalance, totalFiat: totalFiat})
      }
    }
  }

  getFiatFromMarkets(markets) {
    for(let i=0; i<markets.length; i++) {
      if(!this.fiats[markets[i].baseToken]) {
        this.fiats[markets[i].baseToken] = markets[i].baseTokenFiat['USD'] || 0;
      }
    }
  }

  showWrapDrawer = () => {
    if(!this.state.wrapVisible) {
      this.setState({
        wrapVisible: true,
        unwrapVisible: false,
        wrapAmount: null,
        type: "wrap"
      });
    } else {
      this.onWrapClose();
    }
  };

  showUnwrapDrawer = () => {
    if(!this.state.unwrapVisible) {
      this.setState({
        wrapVisible: false,
        unwrapVisible: true,
        wrapAmount: null,
        type: "unwrap"
      });
    } else {
      this.onWrapClose();
    }
  };
  
  onWrapClose = () => {
    this.setState({
      wrapVisible: false,
      unwrapVisible: false
    });
  };

  onWrapSubmit = () => {
    const { dispatch, wanBalance } = this.props;
    const { wrapAmount, type, wwanBalance } = this.state;
    let value = new BigNumber(wrapAmount || "0");
    let balance = (type === 'wrap')? wanBalance : wwanBalance;
    if (value.lte(0)) {
      window.alertAntd({tip: "Amount must be larger than 0"});
      return;
    } else if (value.gt(balance)) {
      window.alertAntd({tip: "Asset is insufficient to " + type});
      return;
    }
    if (type === 'wrap') {
      dispatch(wrapWAN(wrapAmount));
    } else {
      dispatch(unwrapWWAN(wrapAmount));
    }
    this.onWrapClose()
  }

  render() {
    const { wanBalance, dexTranslations } = this.props;
    let totalFiat = this.state.totalFiat;
    const displayDecimals = 6;
    let wwanBalance = this.state.wwanBalance;
    let wrapBalance = 0;

    // this.getTotalFiat();

    if(wanBalance!==null && wwanBalance!==null) {
      wrapBalance = this.state.wrapVisible ? 
        wanBalance.toFixed(displayDecimals) + " WAN" : 
        wwanBalance.toFixed(displayDecimals)+ " WWAN";
    } else {
      wrapBalance = "--"
    }

    return (
      <div>
        <Modal
          title={dexTranslations.Balances}
          visible={this.props.visible}
          onCancel={this.props.onCancel}
          footer={null}
          >
          <div>
            <WalletButtonLong className={styles.walletButton + " HydroSDK-button HydroSDK-toggleButton"}/>
          </div>
          <div className={styles.totalBalance + " flex"}>
            <span className={styles.totalBalanceFont + " flex-2"}>{"$"+totalFiat.toFixed(2)}</span>
            <span className={styles.totalBalanceFontSecond + " flex-1"}>{dexTranslations.estimated}</span>
          </div>
          <div className="flex">
            <Button className={styles.wrapButtonLeft + " flex-1"} onClick={this.showWrapDrawer}>{dexTranslations.wrapWan}</Button>
            <Button className={styles.wrapButtonRight + " flex-1"} onClick={this.showUnwrapDrawer}>{dexTranslations.unwrapWan}</Button>
          </div>
          <div className={styles.tokensContainer} >
            <Drawer
              // title="WRAP WAN"
              placement="top"
              closable={false}
              onClose={this.onWrapClose}
              visible={this.state.wrapVisible||this.state.unwrapVisible}
              getContainer={document.getElementById('drawer-container')}
              style={{ position: 'absolute' }}
              // className={styles.tokensContainer}
            >
              <div className={styles.wanBalance}>{dexTranslations.Balance + ": " + wrapBalance}</div>
              <InputNumber 
                size="large" 
                placeholder={"Input the count to "+(this.state.wrapVisible?"wrap":"unwrap")} 
                className={styles.wrapInput} 
                min={0}
                value={this.state.wrapAmount}
                onChange={value => this.setState({wrapAmount: truncateDecimals(value.toString(), 8)})}
                />
              <p style={{color:"gray"}}>{dexTranslations.wanWaning}</p>
              <div className="flex">
                <Button className={styles.wrapSendButton + " flex-1"} onClick={this.onWrapSubmit}>{(this.state.wrapVisible || (!this.state.wrapVisible && !this.state.unwrapVisible))?dexTranslations.WRAP:dexTranslations.UNWRAP}</Button>
                <Button className={styles.wrapSendButton + " flex-1"} onClick={this.onWrapClose}>{dexTranslations.cancel}</Button>
              </div>
            </Drawer>
            <Tokens/>
          </div>
        </Modal>
      </div>
    );
  }
}

export default connect(mapStateToProps)(Balance);
