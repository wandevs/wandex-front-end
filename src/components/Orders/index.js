import React from 'react';
import OpenOrders from './OpenOrders';
import Trades from './Trades';
import Selector from '../Selector';
import './styles.scss';
import connect from 'react-redux/es/connect/connect';


class Orders extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedAccountID: 'openOrders'
    };
  }
  render() {
    const { selectedAccountID } = this.state;
    const { dexTranslations } = this.props;
    const OPTIONS = [{ value: 'openOrders', name: dexTranslations.Orders }, { value: 'filled', name: dexTranslations.Filled }];
    return (
      <>
        <div className="title flex justify-content-between align-items-center">
          <div className="title">
            <div className="titleLogo"/>
            <div>{dexTranslations.Orders}</div>
          </div>
          <Selector
            options={OPTIONS}
            selectedValue={selectedAccountID}
            handleClick={option => {
              this.setState({ selectedAccountID: option.value });
            }}
          />
        </div>
        {selectedAccountID === 'openOrders' ? <OpenOrders /> : <Trades />}
      </>
    );
  }
}

const mapStateToProps = state => {
  return {
    dexTranslations: state.language.get('dexTranslations'),
  };
};

export default connect(mapStateToProps)(Orders);