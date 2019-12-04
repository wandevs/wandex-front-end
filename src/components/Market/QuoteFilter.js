import React from 'react';
import Selector from '../Selector';
import { Input, Icon } from 'antd';
import './styles.scss';

class QuoteFilter extends React.PureComponent {
  render() {
    return (
      <div>
        <div className="flex">
          <Selector
            options={this.props.quoteTokens}
            selectedValue={this.props.selectedToken}
            handleClick={option => {this.props.onSelectToken(option.value)}}
          />
        </div>
        <div>
          <Input
            placeholder="Search"
            value={this.props.searchKey}
            prefix={<Icon type="search" style={{color: 'white'}} />}
            onChange={e => this.props.onSearch(e.target.value)}
            onClick={e => e.stopPropagation()}
            onPressEnter={e => e.stopPropagation()}
          />
        </div>
      </div>
    );
  }
}

export default QuoteFilter;
