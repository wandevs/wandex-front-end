import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import market from './market';
import account from './account';
import config from './config';
import activity from './activity'
import language from './language'
import { WalletReducer } from 'wan-dex-sdk-wallet';

const rootReducer = combineReducers({
  account,
  activity,
  config,
  language,
  market,
  form: !!formReducer ? formReducer : {},
  WalletReducer
});
export default rootReducer;
