import React from 'react';
import { Modal, Button } from 'antd';
import styles from './styles.scss';
import { connect } from 'react-redux';

class Guide extends React.PureComponent {
  componentDidMount() {
  }

  componentDidUpdate() {
  }

  render() {
    const { dexTranslations } = this.props;
    return (
      <div className={styles.container}>
        <Modal
          title={dexTranslations.QuickStartGuide}
          visible={this.props.visible}
          onCancel={this.props.onCancel}
          footer={null}
          >
          <div className={styles.img}/>
          <div className={styles.guideInfo}>
            <div className={styles.textLine}> { dexTranslations.guideTip1 } </div>
            <div className={styles.textLine}>{ dexTranslations.guideTip2 }</div>
            <div className={styles.textLine}>{ dexTranslations.guideTip3 }</div>
          </div>
          <Button className={ styles.closeButton } onClick={this.props.onCancel}>{dexTranslations.Gotit}!</Button>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    dexTranslations: state.language.get('dexTranslations'),
  };
};

export default connect(mapStateToProps)(Guide);