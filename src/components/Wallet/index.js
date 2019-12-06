import React from 'react';
import Selector from '../Selector';
import Tokens from './Tokens';
import Wrap from './Wrap';
import './styles.scss';
import connect from 'react-redux/es/connect/connect';

const OPTIONS = [
  { value: 'tokens', name: 'Tokens' },
  { value: 'wrap', name: 'Wrap' },
  { value: 'unwrap', name: 'Unwrap' }
];

class Wallet extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedAccountID: OPTIONS[0].value
    };
  }

  render() {
    const { selectedAccountID } = this.state;
    const { dexTranslations } = this.props;
    OPTIONS[0].name = dexTranslations.Tokens;
    OPTIONS[1].name = dexTranslations.Wrap;
    OPTIONS[2].name = dexTranslations.Unwrap;
    return (
      <>
        <div className="title flex justify-content-between align-items-center">
          <div>{dexTranslations.Wallet}</div>
          <Selector
            options={OPTIONS}
            selectedValue={selectedAccountID}
            handleClick={option => {
              this.setState({ selectedAccountID: option.value });
            }}
          />
        </div>
        <div className="flex-column flex-1 position-relative overflow-auto panelBg">
          {this.renderTabPanel()}
        </div>
      </>
    );
  }

  renderTabPanel() {
    const { selectedAccountID } = this.state;
    switch (selectedAccountID) {
      case 'tokens':
        return <Tokens />;
      case 'wrap':
        return <Wrap type="wrap" />;
      case 'unwrap':
        return <Wrap type="unwrap" />;
      default:
        return <Tokens />;
    }
  }
}

const mapStateToProps = state => {
  return {
    dexTranslations: state.language.get('dexTranslations'),
  };
};
export default connect(mapStateToProps)(Wallet);