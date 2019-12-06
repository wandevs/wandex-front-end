import React from 'react';
import { InfinityTable } from '../Table'
import { Spin } from 'antd'
import './styles.scss';

class OrdersDetail extends React.PureComponent {
  loadMoreContent = () => (
    <div
      style={{
        textAlign: 'center',
        paddingTop: 6,
        paddingBottom: 6,
      }}
    >
      <Spin tip="Loading..." />
    </div>
  );


  render() {
    const { currentMarket, dexTranslations } = this.props;
    const dataSource = this.props.typeOrders.toArray().map((v) => {
      return v[1];
    });

    const columns = [
      {
        title: dexTranslations.SubmissionDate,
        dataIndex: 'createdAt',
        render: text => text.split('.')[0].replace('T',' '),
      },
      {
        title: dexTranslations.Side,
        dataIndex: 'side',
      },
      {
        title: dexTranslations.Status,
        dataIndex: 'status',
      },
      {
        title: dexTranslations.Price,
        dataIndex: 'price',
        render: text => text.toFixed(currentMarket.priceDecimals),
      },
      {
        title: dexTranslations.Available,
        dataIndex: 'availableAmount',
        render: text => text.toFixed(currentMarket.amountDecimals),
      },
      {
        title: dexTranslations.Filled,
        dataIndex: 'confirmedAmount',
        render: text => text.toFixed(currentMarket.amountDecimals),
      },
      {
        title: dexTranslations.Pending,
        dataIndex: 'pendingAmount',
        render: text => text.toFixed(currentMarket.amountDecimals),
      },
      {
        title: dexTranslations.Canceled,
        dataIndex: 'canceledAmount',
        render: text => text.toFixed(currentMarket.amountDecimals),
      },
      {
        title: dexTranslations.Total,
        dataIndex: 'amount',
        render: text => text.toFixed(currentMarket.amountDecimals),
        // className: "order-detail text-right",
      },
    ];

    const columnSmall = [
      {
        title: dexTranslations.Side,
        dataIndex: 'side',
      },
      {
        title: dexTranslations.Price,
        dataIndex: 'price',
        render: text => text.toFixed(currentMarket.priceDecimals),
      },
      {
        title: dexTranslations.Available,
        dataIndex: 'availableAmount',
        render: text => text.toFixed(currentMarket.amountDecimals),
      },
      {
        title: dexTranslations.Filled,
        dataIndex: 'confirmedAmount',
        render: text => text.toFixed(currentMarket.amountDecimals),
      },
      {
        title: dexTranslations.Total,
        dataIndex: 'amount',
        render: text => text.toFixed(currentMarket.amountDecimals),
      },
    ];

    let useColumn = columns;
    if (window && window.innerWidth && window.innerWidth <= 768) {
      useColumn = columnSmall;
    }

    return (
      <InfinityTable
        rowKey="id"
        loading={this.props.loading}
        onFetch={this.props.loadMore}
        loadingIndicator={this.loadMoreContent()}
        columns={useColumn}
        scroll={{ y: 300 }}
        dataSource={dataSource}
        pageSize={20}
        bordered
        debug
      />
    );
  }
}

export default OrdersDetail;