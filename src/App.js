import React from 'react';
import { connect } from 'react-redux';
import { loadMarkets, loadTradeHistory } from './actions/markets';
import { loadLanguage } from './actions/dex';
import Header, { activityPagePath, mainPagePath, orderDetailPagePath } from './components/Header';
import WebsocketConnector from './components/WebsocketConnector';
import OrderBook from './components/Orderbook';
import Trade from './components/Trade';
import Wallet from './components/Wallet';
import Orders from './components/Orders';
import Charts from './components/Charts';
import TradeHistory from './components/TradeHistory';
import { HydroWallet } from 'wan-dex-sdk-wallet/build/wallets';
import { watchWallet } from 'wan-dex-sdk-wallet/build/actions/wallet';
import env from './lib/env';
import MediaQuery from 'react-responsive';
import Fold from './components/Fold';
import { Wallet as SDKWallet } from 'wan-dex-sdk-wallet';
import 'wan-dex-sdk-wallet/index.css';
import { message } from 'antd';
import OrderDetail from './components/OrderDetail';
import Activity from './components/Activity';

const mapStateToProps = state => {
  const selectedAccountID = state.WalletReducer.get('selectedAccountID');
  return {
    selectedAccountID,
    currentMarket: state.market.getIn(['markets', 'currentMarket']),
    networkId: state.WalletReducer.getIn(['accounts', selectedAccountID, 'networkId']),
    dexTranslations : state.dex.get("dexTranslations"),
    walletTranslations: state.dex.get('walletTranslations'),
    dexLanguage : state.dex.get("dexLanguage"),
  };
};

function alertAntd(info) {
  if(typeof(info) === "string") {
    message.success(info, 10);
  } else {
    if (info.toString().includes("Error")) {
      message.error(info.toString(), 10);
    } else if (info.hasOwnProperty('tip')) {
      message.info(info.tip, 5);
    } else {
      message.info(JSON.stringify(info), 10);
    }
  }
}

class App extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      mobileTab: 'trade',
      currentPath: mainPagePath,
    };

    window.alertAntd = alertAntd;

    const { dispatch } = this.props;
    loadLanguage(dispatch)
  }

  componentDidMount() {
    const { dispatch, currentMarket } = this.props;
    dispatch(loadMarkets());
    if (parseInt(env.NETWORK_ID) === 66) {
      this.initTestBrowserWallet();
    }
    if (currentMarket) {
      dispatch(loadTradeHistory(currentMarket.id));
    }
  }

  componentDidUpdate(prevProps) {
    const { currentMarket, dispatch } = this.props;

    if (currentMarket !== prevProps.currentMarket) {
      dispatch(loadTradeHistory(currentMarket.id));
    }

    // if (dexLanguage && dexLanguage !== prevProps.dexLanguage) {
    //   dispatch(setDexTranslations(dexLanguage));
    // }
  }

  async initTestBrowserWallet() {
    HydroWallet.setNodeUrl(env.NODE_URL);
    const wallet = await HydroWallet.import(
      'B7A0C9D2786FC4DD080EA5D619D36771AEB0C8C26C290AFD3451B92BA2B7BC2C',
      '123456'
    );
    this.props.dispatch(watchWallet(wallet));
  }

  setPath = (p) => {
    this.setState({currentPath: p});
  };

  getNetworkName() {
    switch (parseInt(env.NETWORK_ID, 10)) {
      case 1:
        return 'Mainnet';
      case 3:
        return 'Ropsten';
      case 4:
        return 'Rinkeby';
      case 66:
        return 'localhost:8545';
      default:
        return 'id: ' + env.NETWORK_ID;
    }
  }

  renderMobile() {
    const selectTab = this.state.mobileTab;
    const currentPath = this.state.currentPath;
    const { dexTranslations } = this.props;

    let content;
    if (selectTab === 'trade' || !selectTab) {
      content = <Trade />;
    } else if (selectTab === 'orders') {
      content = <Orders dexTranslations={dexTranslations} />;
    } else if (selectTab === 'charts') {
      content = <Charts />;
    } else if (selectTab === 'orderbook') {
      content = (
        <>
          <div className="title">
            <div>
              <div>{dexTranslations.Orderbook}</div>
              <div className="text-secondary">{dexTranslations.orderbookTip}</div>
            </div>
          </div>
          <OrderBook />
        </>
      );
    } else if (selectTab === 'history') {
      content = (
        <>
          <div className="title flex align-items-center">
            <div>Trade History</div>
          </div>
          <TradeHistory />
        </>
      );
    } else if (selectTab === 'wallet') {
      content = <Wallet />;
    }

    if (currentPath === mainPagePath) {
      return (
        <div className="flex-column flex-1 overflow-hidden">
          <div className="mobileApp flex-column flex-1">{content}</div>
          <div className="flex nav-tabs overflow-auto position-relative">
            <div className="nav-item flex-1 border-top-dark d-inline-block">
              <div
                onClick={() => this.setState({ mobileTab: 'trade' })}
                className={`tab-button text-secondary text-center${selectTab === 'trade' ? ' active' : ''}`}>
                Trade
              </div>
            </div>
            <div className="nav-item flex-1 border-top-dark d-inline-block">
              <div
                onClick={() => this.setState({ mobileTab: 'orders' })}
                className={`tab-button text-secondary text-center${selectTab === 'orders' ? ' active' : ''}`}>
                Orders
              </div>
            </div>
            <div className="nav-item flex-1 border-top-dark d-inline-block">
              <div
                onClick={() => this.setState({ mobileTab: 'charts' })}
                className={`tab-button text-secondary text-center${selectTab === 'charts' ? ' active' : ''}`}>
                Charts
              </div>
            </div>
            <div className="nav-item flex-1 border-top-dark d-inline-block">
              <div
                onClick={() => this.setState({ mobileTab: 'orderbook' })}
                className={`tab-button text-secondary text-center${selectTab === 'orderbook' ? ' active' : ''}`}>
                Orderbook
              </div>
            </div>
            <div className="nav-item flex-1 border-top-dark d-inline-block">
              <div
                onClick={() => this.setState({ mobileTab: 'history' })}
                className={`tab-button text-secondary text-center${selectTab === 'history' ? ' active' : ''}`}>
                History
              </div>
            </div>
            <div className="nav-item flex-1 border-top-dark d-inline-block">
              <div
                onClick={() => this.setState({ mobileTab: 'wallet' })}
                className={`tab-button text-secondary text-center${selectTab === 'wallet' ? ' active' : ''}`}>
                Wallet
              </div>
            </div>
          </div>
        </div>
      );
    } else if (currentPath === orderDetailPagePath) {
      return (
        <OrderDetail />
      );
    } else if (currentPath === activityPagePath) {
      return (
        <Activity />
      );
    }

  }

  renderTablet() {
    const currentPath = this.state.currentPath;
    if (currentPath === mainPagePath) {
      return (
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-column border-right-dark">
            <div className="grid flex-1">
              <Trade />
            </div>
          </div>
          <div className="flex-column">
            <div className="flex-column flex-1">
              <div className="grid flex-1">
                <Charts />
              </div>
              <Fold className="border-top-dark flex-1 flex-column">
                <div className="" data-fold-item-title="Orderbook">
                  <OrderBook />
                </div>
                <div className="" data-fold-item-title="Trade History">
                  <TradeHistory />
                </div>
                <div className="" data-fold-item-title="Orders">
                  <Orders />
                </div>
              </Fold>
            </div>
          </div>
        </div>
      );
    } else if (currentPath === orderDetailPagePath) {
      return (
        <OrderDetail />
      );
    } else if (currentPath === activityPagePath) {
      return (
        <Activity />
      );
    }

  }

  renderLaptop() {
    const currentPath = this.state.currentPath;
    if (currentPath === mainPagePath) {
      return (
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-column border-right-dark">
            <div className="grid flex-1">
              <Trade />
            </div>
          </div>
          <Fold className="grid border-right-dark flex-column">
            <div className="panelFill grid flex-column" data-fold-item-title="Orderbook">
              <OrderBook />
            </div>
            <div className="grid flex-column" data-fold-item-title="Trade History">
              <TradeHistory />
            </div>
          </Fold>
          <div className="flex-column flex-1">
            <div className="grid flex-2">
              <Charts />
            </div>
            <div className="grid flex-1 border-top-dark">
              <Orders />
            </div>
          </div>
        </div>
      );
    } else if (currentPath === orderDetailPagePath) {
      return (
        <OrderDetail />
      );
    } else if (currentPath === activityPagePath) {
      return (
        <Activity />
      );
    }

  }

  renderDesktop() {
    const currentPath = this.state.currentPath;
    const { dexTranslations } = this.props;

    if (currentPath === mainPagePath) {
      return (
        <div className="flex flex-1 overflow-hidden">
          <div className="flex">
            <div className="flex-column flex-1 border-right-dark">
              <div className="grid flex-1">
                <Trade />
              </div>
            </div>
            <div className="grid border-right-dark flex-column">
              <div className="title">
                <div className="titleLogo"/>
                <div>{dexTranslations.Orderbook}</div>
              </div>
              <OrderBook />
            </div>
          </div>
          <div className="flex-column flex-1 border-right-dark">
            <div className="grid border-bottom-dark flex-2">
              <Charts />
            </div>
            <div className="grid flex-1 border-top-dark">
              <Orders dexTranslations={dexTranslations}/>
            </div>
          </div>
          <div className="flex-column">
            <div className="grid border-left-dark flex-1">
              <div className="title flex align-items-center">
                <div className="titleLogo"/>
                <div>{dexTranslations.tradeHistory}</div>
              </div>
              <TradeHistory />
            </div>
            {/* <div className="grid flex-1 border-top-dark">
              <Wallet />
            </div> */}
          </div>
        </div>
      );
    } else if (currentPath === orderDetailPagePath) {
      return (
        <OrderDetail />
      );
    } else if (currentPath === activityPagePath) {
      return (
        <Activity />
      );
    }

  }
  
  render() {
    const { currentMarket, networkId, selectedAccountID, walletTranslations} = this.props;
    if (!currentMarket) {
      return null;
    }

    const defaultWalletType = (window.web3 && window.web3.eth && window.injectWeb3) ? 'LIGHTWALLET' : 'Hydro-Wallet';
    return (
      <div className="app">
        <SDKWallet title="Starter Kit Wallet" nodeUrl={env.NODE_URL} unit="WAN" defaultWalletType={defaultWalletType} translations={walletTranslations} />
        <WebsocketConnector />
        <Header setPath={this.setPath} currentPath={this.state.currentPath}/>
        {selectedAccountID === 'EXTENSION' && parseInt(networkId, 10) !== parseInt(env.NETWORK_ID, 10) && (
          <span className="network-warning bg-warning text-white text-center" style={{ padding: 4 }}>
            Network Error: Switch Metamask's network to {this.getNetworkName()}.
          </span>
        )}
        <MediaQuery minWidth={1366}>{this.renderDesktop()}</MediaQuery>
        <MediaQuery minWidth={1024} maxWidth={1365}>
          {this.renderLaptop()}
        </MediaQuery>
        <MediaQuery minWidth={768} maxWidth={1023}>
          {this.renderTablet()}
        </MediaQuery>
        <MediaQuery maxWidth={767}>{this.renderMobile()}</MediaQuery>
      </div>
    );
  }
}

export default connect(mapStateToProps)(App);
