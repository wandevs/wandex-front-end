import React from 'react';
import { connect } from 'react-redux';
import { List } from 'antd';

const mapStateToProps = state => {
  return {
    endIndex: state.activity.get('endIndex'),
    capacity: state.activity.get('capacity'),
    items: state.activity.get('items')
  };
};

class Activity extends React.PureComponent {
  componentDidMount() {
  }

  render() {
    const activityPattern = /(\d+):([^:]+):(.+)/;
    const renderItems = this.props.items.reverse().toArray().map((v) => {
      const newItem = activityPattern.exec(v[1]);
      return (new Date(parseInt(newItem[1]))).toLocaleString() + " " + newItem[2] + " " + newItem[3].replace("\\","")
    });
    return (
      <List
        dataSource = {renderItems}
        renderItem = { item => <List.Item>{
          item
        } </List.Item> }
      />
    )
  }
}

export default connect(mapStateToProps)(Activity);