import React from 'react';
import { Modal, Button } from 'antd';
import styles from './styles.scss';

class Guide extends React.PureComponent {
  componentDidMount() {
  }

  componentDidUpdate() {
  }

  render() {
    return (
      <div className={styles.container}>
        <Modal
          title="Quick Start Guide"
          visible={this.props.visible}
          onCancel={this.props.onCancel}
          footer={null}
          >
          <div className={styles.img}/>
          <div className={styles.guideInfo}>
            <div className={styles.textLine}>1) If it is your first time using WRDEX, please click the “Connect” button to link your wallet account to the DEX.  </div>
            <div className={styles.textLine}>2) In order to be able to trade WAN token in the DEX, first you need to “wrap” the native WAN token into “WWAN”. Please do not “wrap” all your WAN token balance since gas fee will be deducted in native WAN balance.</div> 
            <div className={styles.textLine}>3) Also please don’t forget to authorize trading of individual tokens by clicking on the switch beside it, this step will also consume a little amount of gas fee.</div>
          </div>
          <Button className={ styles.closeButton } onClick={this.props.onCancel}>Got it!</Button>
        </Modal>
      </div>
    );
  }
}

export default Guide;
