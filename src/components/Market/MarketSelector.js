import React from 'react';
import { Table } from 'antd';
import style from './styles.scss';
import { formatPriceChange } from '../../lib/utils'

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

class MarketSelector extends React.PureComponent {
  render() {
    const { dexTranslations } = this.props;
    const columns = [
      {
        title: dexTranslations.Pair,
        dataIndex: 'id',
        sorter: (a, b) => (a.id > b.id) ? 1 : (a.id < b.id) ? -1 : 0,
        sortDirections: ['descend', 'ascend'],
        // width: 140,
        // flex: 1,
      },
      {
        title: dexTranslations.MarketPrice,
        dataIndex: 'extra.price',
        sorter: (a, b) => a.extra.price - b.extra.price,
        sortDirections: ['descend', 'ascend'],
        render: (value, market) => { return formatPrice(value, market) },
        // width: 120,
        // flex: 1,
        align: 'right',
      },
      {
        title: dexTranslations.Change24h,
        dataIndex: 'price24h',
        sorter: (a, b) => a.price24h - b.price24h,
        sortDirections: ['descend', 'ascend'],
        onCell: (market) => { return { className: market.price24h > 0 ? "green" : market.price24h < 0 ? "red" : "" } },
        render: (value) => { return formatPriceChange(value, 2) },
        // width: 120,
        // flex: 1,
        align: 'right',
      },
      {
        title: '', // to fill
        dataIndex: 'extra.volume24h',
        defaultSortOrder: 'descend',
        sorter: (a, b) => a.amount24h - b.amount24h,
        sortDirections: ['descend', 'ascend'],
        render: (value) => { return value && value.toFixed(2) },
        // width: 120,
        // flex: 1,
        align: 'right',
      },
    ];
    columns[3].title = dexTranslations.Volume24h + '(' + this.props.fiatUnit + ')';

    return (
      <Table
        columns={columns}
        dataSource={this.props.markets.toArray()}
        rowKey={market => market.id}
        pagination={false}
        // scroll={{y: 'calc(100vh - 250px)'}}
        className={style.marketTable}
        onRow={market => {
          return {
            onClick: () => this.props.onSelectMarket(market)
          };
        }}
        onHeaderRow={() => {
          return {
            onClick: e => { e.stopPropagation() }
          };
        }}
      />
    );
  }
}

export default MarketSelector;