import React from 'react';
import { connect } from 'react-redux';
import style from './styles.scss';
import { Menu, Dropdown, Button, Icon } from 'antd';
import Market from '../Market';
import { formatMarket, getFiatSymbol } from '../../lib/utils';

const mapStateToProps = state => {
  return {
    currentMarket: state.market.getIn(['markets', 'currentMarket']),
    markets: state.market.getIn(['markets', 'data'])
  };
};

class StateBar extends React.PureComponent {
  render() {
    const currentMarket = formatMarket(this.props.currentMarket);
    if(!currentMarket) {return}
    let fiat = getFiatSymbol(this.props.markets);
    console.log("StateBar: %O", currentMarket);
    return (
      <div className={style['state-block'] + " navbar bg-blue navbar-expand-lg " + style.StateBar}>
        {/* <img className="navbar-brand" src={require('../../images/hydro.svg')} alt="hydro" /> */}
        <div className={style.stateItem + " item"}>
          <span>{currentMarket.id}</span>
        </div>
        <div className="dropdown navbar-nav item">
          <Dropdown
            trigger={["click"]}
            overlayClassName="nav-dropdown-overlay"            
            overlay={(
                <Menu>
                  <Menu.Item>
                    <Market />
                  </Menu.Item>
                </Menu>
            )}>
            <Button className={style.stateButton}>
              Select Market <Icon type="caret-down" />
            </Button>
          </Dropdown>
        </div>
        <div className={style.subitem}>
          <span style={{color:"gray"}}> Last Price:</span>
          <span className={style.subText}>{currentMarket.extra.price} ({fiat}{currentMarket.extra.baseFiat})</span>
        </div>
        <div className={style.subitem}>
          <span style={{color:"gray"}}> 24h Change:</span>
          <span className={style.subText}>{Number(currentMarket.price24h).toFixed(8)}</span>
        </div>
        <div className={style.subitem}>
          <span style={{color:"gray"}}> 24h Volume:</span>
          <span className={style.subText}>{Number(currentMarket.extra.volume24h).toFixed(6)}</span>
        </div>
        <div className={style.subitem}>
          <span style={{color:"gray"}}> 24h High:</span>
          <span className={style.subText}>{currentMarket.extra.high24h}</span>
        </div>
        <div className={style.subitem}>
          <span style={{color:"gray"}}> 24h Low:</span>
          <span className={style.subText}>{currentMarket.extra.low24h}</span>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(StateBar);
