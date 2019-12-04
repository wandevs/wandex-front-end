import React from 'react';
import { loginRequest, login } from '../../actions/account';
import { loadActivity, addActivity } from '../../actions/activity';
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
    markets: state.market.getIn(['markets', 'data'])
  };
};

export const mainPagePath = '/main';
export const orderDetailPagePath = '/ordersdetail';
export const activityPagePath = '/activity';

const orderName = "Orders";
const activityName = "Activity";
const backName = "Back";
class Header extends React.PureComponent {
  constructor() {
    super();
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
    const { address, isLocked } = this.props;
    if (nextProp.isLocked !== isLocked) {
      console.log("lock:" + nextProp.isLocked + " address:" + address);
      if (!nextProp.isLocked) {
        this.props.dispatch(addActivity("unlock:" + address))
      }
    }
  }

  setPath = (name) => {
    if (this.props.currentPath === name) {
      this.props.setPath(mainPagePath)
    } else {
      this.props.setPath(name)
    }
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
              Balances
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
                            <div className={style.menuitem}>Documents</div>
                        </a>
                      </Menu.Item>
                    </Menu>
                )}>
              <button className={style.mynav}>
                Settings <Icon type="down" />
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
                        <div className={style.menuitem} onClick={() => { /*this.setPath()*/ }}>English</div>
                      </Menu.Item>
                      {/* <Menu.Item>
                        <div className={style.menuitem}>Chinese</div>
                      </Menu.Item> */}
                    </Menu>
                )}>
              <button className={style.mynav} >
                Language  <Icon type="down" />
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
