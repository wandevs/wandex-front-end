import React from 'react';
import { connect } from 'react-redux';
import style from './styles.scss';
import { Menu, Dropdown, Button, Icon } from 'antd';
import Market from '../Market';
import { formatMarket, getFiatSymbol } from '../../lib/utils';
import { formatPriceChange } from '../../lib/utils'

const mapStateToProps = state => {
  return {
    currentMarket: state.market.getIn(['markets', 'currentMarket']),
    markets: state.market.getIn(['markets', 'data']),
    dexTranslations: state.language.get("dexTranslations"),
  };
};

class StateBar extends React.PureComponent {
  render() {
    const currentMarket = formatMarket(this.props.currentMarket);
    const { dexTranslations } = this.props;

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
              {dexTranslations.SelectMarket} <Icon type="caret-down" />
            </Button>
          </Dropdown>
        </div>
        <div className={style.subitem}>
          <span style={{color:"gray"}}> {dexTranslations.LastPric}:</span>
          <span className={style.subText}>{currentMarket.extra.price} ({fiat}{currentMarket.extra.baseFiat})</span>
        </div>
        <div className={style.subitem}>
          <span style={{color:"gray"}}> {dexTranslations.Change24h}:</span>
          <span className={style.subText}>{formatPriceChange(currentMarket.price24h, 2)}</span>
        </div>
        <div className={style.subitem}>
          <span style={{color:"gray"}}> {dexTranslations.Volume24h}:</span>
          <span className={style.subText}>{Number(currentMarket.extra.volume24h).toFixed(6)}</span>
        </div>
        <div className={style.subitem}>
          <span style={{color:"gray"}}> {dexTranslations.High24h}:</span>
          <span className={style.subText}>{currentMarket.extra.high24h}</span>
        </div>
        <div className={style.subitem}>
          <span style={{color:"gray"}}> {dexTranslations.Low24h}:</span>
          <span className={style.subText}>{currentMarket.extra.low24h}</span>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(StateBar);
