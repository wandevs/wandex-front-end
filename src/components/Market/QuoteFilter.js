import React from 'react';
import Selector from '../Selector';
import { Input, Icon } from 'antd';
import style from './styles.scss';

class QuoteFilter extends React.PureComponent {
  render() {
    return (
      <div className={style.marketHeader}>
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
            suffix={<Icon type="search" className={style.quoteSearchIcon} />}
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
