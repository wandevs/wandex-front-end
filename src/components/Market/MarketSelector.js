import React from 'react';
import { Table } from 'antd';
import './styles.scss';

const columns = [
  {
    title: 'Pair',
    dataIndex: 'id',
    sorter: (a, b) => (a.id > b.id)? 1 : (a.id < b.id)? -1 : 0,
    sortDirections: ['descend', 'ascend'],
    width: 140
  },
  {
    title: 'Market Price',
    dataIndex: 'extra.price',
    sorter: (a, b) => a.extra.price - b.extra.price,
    sortDirections: ['descend', 'ascend'],
    render: (value, market) => {return formatPrice(value, market)},
    width: 120
  },
  {
    title: '24h Change',
    dataIndex: 'price24h',
    sorter: (a, b) => a.price24h - b.price24h,
    sortDirections: ['descend', 'ascend'],
    onCell: (market) => {return {className: market.price24h > 0? "green" : market.price24h < 0? "red" : ""}},
    render: (value) => {return formatPriceChange(value, 2)},
    width: 120
  },
  {
    title: '', // to fill
    dataIndex: 'extra.volume24h',
    defaultSortOrder: 'descend',
    sorter: (a, b) => a.amount24h - b.amount24h,
    sortDirections: ['descend', 'ascend'],
    render: (value) => {return value.toFixed(2)}
    // width: 120
  },  
];

function formatPrice(value, market) {
  if (value === 0) {
    return "-";
  } else {
    let text = value;
    if (market.extra.isExternalPrice) {
      text += "*";
      return <span title="price is from coinmarketcap.com">{text}</span>
    } else {
      return text;
    }
  }
}

function formatPriceChange(value, decimals) {
  let prefix = "", text = "-", suffix = "%";
  if (value > 0) {
    prefix = "+";
    text = Number(value).toFixed(decimals);
  } else if (value < 0) {
    text = Number(value).toFixed(decimals);
  } else {
    suffix = "";
  }
  return prefix + text + suffix;
}

class MarketSelector extends React.PureComponent {
  render() {
    columns[3].title = '24h Volume (' + this.props.fiatUnit + ')';
    return (
      <div>
        <Table
          columns={columns}
          dataSource={this.props.markets.toArray()}
          rowKey={market => market.id}
          pagination={false}
          scroll={{y: 'calc(100vh - 250px)'}}
          onRow={market => {
            return {
              onClick: e => this.props.onSelectMarket(market)
            };
          }}
          onHeaderRow={() => {
            return {
              onClick: e => {e.stopPropagation()}
            };
          }}
        />
      </div>
    );
  }
}

export default MarketSelector;