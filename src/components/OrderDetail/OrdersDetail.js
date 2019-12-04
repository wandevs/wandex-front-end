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
    const { currentMarket } = this.props;
    const dataSource = this.props.typeOrders.toArray().map((v) => {
      return v[1];
    });

    const columns = [
      {
        title: 'Submission Date',
        dataIndex: 'createdAt',
        render: text => text.split('.')[0].replace('T',' '),
      },
      {
        title: 'Side',
        dataIndex: 'side',
      },
      {
        title: 'Status',
        dataIndex: 'status',
      },
      {
        title: 'Price',
        dataIndex: 'price',
        render: text => text.toFixed(currentMarket.priceDecimals),
      },
      {
        title: 'Available',
        dataIndex: 'availableAmount',
        render: text => text.toFixed(currentMarket.amountDecimals),
      },
      {
        title: 'Filled',
        dataIndex: 'confirmedAmount',
        render: text => text.toFixed(currentMarket.amountDecimals),
      },
      {
        title: 'Pending',
        dataIndex: 'pendingAmount',
        render: text => text.toFixed(currentMarket.amountDecimals),
      },
      {
        title: 'Canceled',
        dataIndex: 'canceledAmount',
        render: text => text.toFixed(currentMarket.amountDecimals),
      },
      {
        title: 'Total',
        dataIndex: 'amount',
        render: text => text.toFixed(currentMarket.amountDecimals),
        // className: "order-detail text-right",
      },
    ];

    const columnSmall = [
      {
        title: 'Side',
        dataIndex: 'side',
      },
      {
        title: 'Price',
        dataIndex: 'price',
        render: text => text.toFixed(currentMarket.priceDecimals),
      },
      {
        title: 'Available',
        dataIndex: 'availableAmount',
        render: text => text.toFixed(currentMarket.amountDecimals),
      },
      {
        title: 'Filled',
        dataIndex: 'confirmedAmount',
        render: text => text.toFixed(currentMarket.amountDecimals),
      },
      {
        title: 'Total',
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