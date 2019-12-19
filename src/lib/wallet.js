import BigNumber from 'bignumber.js';
import { watchToken, tokenApproveFinish } from '../actions/account';
import abi from './abi';
import env from './env';
import { getSelectedAccountWallet, getTransactionReceipt, getContract } from 'wan-dex-sdk-wallet';
import { addActivity } from '../actions/activity';
export let web3, Contract;

export const getTokenBalance = async (tokenAddress, accountAddress) => {
  const contract = getContract(tokenAddress, abi);
  const balance = await contract.balanceOf(accountAddress);
  return new BigNumber(balance);
};

export const getAllowance = async (tokenAddress, accountAddress) => {
  const contract = getContract(tokenAddress, abi);
  const allowance = await contract.allowance(accountAddress, env.HYDRO_PROXY_ADDRESS);
  return new BigNumber(allowance);
};

export const wrapWAN = amount => {
  return async (dispatch, getState) => {
    const state = getState();
    const WWAN = state.config.get('WWAN');
    const value = new BigNumber(amount).multipliedBy(Math.pow(10, WWAN.decimals)).toString();

    let params = {
      to: WWAN.address,
      data: '0xd0e30db0',
      value
    };

    try {
      const wallet = getSelectedAccountWallet(state);
      const transactionID = await wallet.sendTransaction(params);

      window.alertAntd(`Wrap WAN request submitted`);
      watchTransactionStatus(transactionID, async success => {
        if (success) {
          dispatch(addActivity("wrapWan:" + amount + "wan"));
          dispatch(watchToken(WWAN.address, WWAN.symbol, WWAN.decimals));
          window.alertAntd('Wrap WAN Successfully');
        } else {
          window.alertAntd('Wrap WAN Failed');
        }
      });
      return transactionID;
    } catch (e) {
      window.alertAntd(e);
    }
    return null;
  };
};

export const unwrapWWAN = amount => {
  return async (dispatch, getState) => {
    const state = getState();
    const WWAN = state.config.get('WWAN');
    const value = new BigNumber(amount).multipliedBy(Math.pow(10, WWAN.decimals)).toString(16);
    const wallet = getSelectedAccountWallet(state);
    const functionSelector = '2e1a7d4d';
    const valueString = get64BytesString(value);

    let params = {
      to: WWAN.address,
      data: `0x${functionSelector}${valueString}`,
      value: 0
    };

    try {
      const transactionID = await wallet.sendTransaction(params);

      window.alertAntd(`Unwrap WWAN request submitted`);
      watchTransactionStatus(transactionID, async success => {
        if (success) {
          dispatch(addActivity("unwrapWan:" + amount +"wan"));
          dispatch(watchToken(WWAN.address, WWAN.symbol, WWAN.decimals));
          window.alertAntd('Unwrap WAN Successfully');
        } else {
          window.alertAntd('Unwrap WAN Failed');
        }
      });
      return transactionID;
    } catch (e) {
      window.alertAntd(e);
    }
    return null;
  };
};

export const enable = (address, symbol, decimals) => {
  return async (dispatch, getState) => {
    let transactionID = await dispatch(
      approve(address, symbol, 'f000000000000000000000000000000000000000000000000000000000000000', 'Enable', decimals)
    );
    return transactionID;
  };
};

export const disable = (address, symbol, decimals) => {
  return async (dispatch, getState) => {
    let transactionID = await dispatch(
      approve(address, symbol, '0000000000000000000000000000000000000000000000000000000000000000', 'Disable', decimals)
    );
    return transactionID;
  };
};

export const approve = (tokenAddress, symbol, allowance, action, decimals) => {
  return async (dispatch, getState) => {
    const state = getState();
    const functionSelector = '095ea7b3';
    let spender = get64BytesString(env.HYDRO_PROXY_ADDRESS);
    if (spender.length !== 64) {
      return null;
    }

    let params = {
      to: tokenAddress,
      data: `0x${functionSelector}${spender}${allowance}`,
      value: 0
    };

    try {
      const wallet = getSelectedAccountWallet(state);
      const transactionID = await wallet.sendTransaction(params);

      window.alertAntd(`${action} ${symbol} request submitted`);
      watchTransactionStatus(transactionID, async success => {
        if (success) {
          dispatch(addActivity(symbol + ":approve:" + action));
          dispatch(watchToken(tokenAddress, symbol, decimals));
          window.alertAntd(`${action} ${symbol} Successfully`);
        } else {
          window.alertAntd(`${action} ${symbol} Failed`);
        }
        dispatch(tokenApproveFinish(symbol));
      });
      return transactionID;
    } catch (e) {
      dispatch(tokenApproveFinish(symbol));
      popMsg(e);
    }
    return null;
  };
};

const popMsg = (e) => {
  let msg = e.message;
  if (msg.indexOf("Need Unlock Wallet") >= 0) {
    window.alertAntd({tip: 'Need unlock wallet'});
  } else if (msg.indexOf("invalid response") >= 0) {
    window.alertAntd({tip: 'The network status is not good, please try again later'});
  } else {
    window.alertAntd(e);
  }
}

const watchTransactionStatus = (txID, callback) => {
  const getTransactionStatus = async () => {
    const tx = await getTransactionReceipt(txID);
    if (!tx) {
      window.setTimeout(() => getTransactionStatus(txID), 3000);
    } else if (callback) {
      callback(Number(tx.status) === 1);
    } else {
      window.alertAntd('success');
    }
  };
  window.setTimeout(() => getTransactionStatus(txID), 3000);
};

const get64BytesString = string => {
  string = string.replace('0x', '');
  while (string.length < 64) {
    string = '0'.concat(string);
  }
  return string;
};
