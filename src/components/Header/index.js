import React from 'react';
import { loginRequest, login } from '../../actions/account';
import { loadActivity, addActivity } from '../../actions/activity';
import { setDexTranslations } from '../../actions/dex';
import { connect } from 'react-redux';
import { WalletButton, getSelectedAccount } from 'wan-dex-sdk-wallet';
import style from './styles.scss';
import { loadAccountHydroAuthentication } from '../../lib/session';
import { Menu, Dropdown, Icon } from 'antd';
import StateBar from '../StateBar';
import Balance from '../Balance';
import Guide from '../Guide';

const mapStateToProps = state => {
  const selectedAccount = getSelectedAccount(state);
  const address = selectedAccount ? selectedAccount.get('address') : null;
  return {
    address,
    isLocked: selectedAccount ? selectedAccount.get('isLocked') : true,
    isLoggedIn: state.account.getIn(['isLoggedIn', address]),
    currentMarket: state.market.getIn(['markets', 'currentMarket']),
    markets: state.market.getIn(['markets', 'data']),
    dexTranslations: state.dex.get('dexTranslations'),
  };
};

export const mainPagePath = '/main';
export const orderDetailPagePath = '/ordersdetail';
export const activityPagePath = '/activity';

class Header extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      balanceModelVisible: false,
      guideModeVisible: false,
    }
  }
  componentDidMount() {
    const { address, dispatch } = this.props;
    dispatch(loadActivity());
    const hydroAuthentication = loadAccountHydroAuthentication(address);
    setTimeout(this.openGuideModel, 50);
    if (hydroAuthentication) {
      dispatch(login(address));
      setTimeout(this.openBalanceModel, 0);
      setTimeout(this.closeBalanceModel, 100);
    }
  }
  componentDidUpdate(prevProps) {
    const { address, dispatch } = this.props;
    const hydroAuthentication = loadAccountHydroAuthentication(address);
    if (address !== prevProps.address && hydroAuthentication) {
      dispatch(login(address));
      setTimeout(this.openBalanceModel, 0);
      setTimeout(this.closeBalanceModel, 100);
    }
  }
  UNSAFE_componentWillUpdate(nextProp) {
    const { dispatch, address, isLocked } = this.props;
    if (nextProp.isLocked !== isLocked) {
      console.log("lock:" + nextProp.isLocked + " address:" + address);
      if (!nextProp.isLocked) {
        dispatch(addActivity("unlock:" + address))
      }
    }
  }

  setPath = (name) => {
    const { currentPath } = this.props;

    if (currentPath === name) {
      this.props.setPath(mainPagePath)
    } else {
      this.props.setPath(name)
    }
  };

  setLanguage = (name) => {
    const { dispatch } = this.props;

    setDexTranslations(name, dispatch)
  };

  openBalanceModel = () => {
    this.setState({balanceModelVisible:true});
  }

  closeBalanceModel = () => {
    this.setState({balanceModelVisible:false});
  }

  openGuideModel = () => {
    this.setState({ guideModelVisible:true });
  }

  closeGuideModel = () => {
    this.setState({ guideModelVisible:false });
  }

  render() {
    const { dexTranslations } = this.props;
    const orderName = dexTranslations.Orders;
    const activityName = dexTranslations.Activity;
    const backName = dexTranslations.Back;
    return (
      <div className={style.Header}>
        <div className={style.headerHeight + " navbar bg-darkblue navbar-expand-lg"}>
          <div className="navbar-brand">
            <img className={style.logoimg} src={require('../../images/logo.png')} alt="wr" />
          </div>
          <div className="dropdown navbar-nav mr-auto"/>
        <button
          className="btn btn-primary collapse-toggle"
          type="button"
          data-toggle="collapse"
          data-target="#navbar-collapse"
          aria-expanded="false">
          <i className="fa fa-bars" />
        </button>
        <div className="collapse" id="navbar-collapse">
          <div className={style.item} >
            <button className={style.mynav}
              onClick={() => { this.setPath(orderDetailPagePath)}}>
              { this.props.currentPath === orderDetailPagePath ? backName : orderName}
            </button>
          </div>
          <div className={style.vline}/>
          <div className={style.item}>
            <button className={style.mynav} onClick={() => { this.openBalanceModel()}}>
              {dexTranslations.Balances}
            </button>
            {
              this.state.balanceModelVisible 
              ? (<Balance visible={this.state.balanceModelVisible} onCancel={() => { this.closeBalanceModel() }} />)
              : null
            }
            {
              this.state.guideModelVisible 
              ? (<Guide visible={this.state.guideModelVisible} onCancel={() => { this.closeGuideModel() }} />)
              : null
            }
          </div>
          <div className={style.vline}/>
          <div className={style.item}>
            <button className={style.mynav} onClick={() => { this.setPath(activityPagePath)}}>
              { this.props.currentPath === activityPagePath ? backName : activityName}
            </button>
          </div>
          <div className={style.vline}/>
          <div className={style.item} >
            <Dropdown
                trigger={["click"]}
                overlay={(
                    <Menu>
                      <Menu.Item>
                        <a
                            href="https://github.com/wanchain/dex-scaffold"
                            target="_blank"
                            rel="noopener noreferrer">
                            <div className={style.menuitem}>{dexTranslations.Documents}</div>
                        </a>
                      </Menu.Item>
                    </Menu>
                )}>
              <button className={style.mynav}>
                {dexTranslations.Settings} <Icon type="down" />
              </button>
            </Dropdown>
          </div>
          <div className={style.vline}/>

          <div className={style.item}>
            <WalletButton />
          </div>
          <div className={style.vline}/>
          <div className="item ">
            <Dropdown
                trigger={["click"]}
                overlay={(
                    <Menu>
                      <Menu.Item>
                        <div className={style.menuitem} onClick={() => { this.setLanguage("English") }}>{dexTranslations.English}</div>
                      </Menu.Item>
                      <Menu.Item>
                        <div className={style.menuitem} onClick={() => { this.setLanguage("Chinese") }}>{dexTranslations.Chinese}</div>
                      </Menu.Item>
                    </Menu>
                )}>
              <button className={style.mynav} >
                {dexTranslations.Language}  <Icon type="down" />
              </button>
            </Dropdown>
          </div>
            {this.renderAccount()}
          </div>
        </div>
        <div>
          <StateBar />
        </div>
      </div>
    );
  }

  renderAccount() {
    const { address, dispatch, isLoggedIn, isLocked } = this.props;
    if ((isLoggedIn && address) || isLocked) {
      return null;
    } else if (address) {
      return (
        <button className="btn btn-success" style={{ marginLeft: 12 }} onClick={() => dispatch(loginRequest())}>
          connect
        </button>
      );
    } else {
      return null;
    }
  }
}

export default connect(mapStateToProps)(Header);
