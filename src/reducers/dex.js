import { fromJS } from "immutable";
import { loadTranslations, loadWalletTranslations } from '../actions/dex';

export const initState = fromJS({
  dexTranslations: loadTranslations("English"),
  walletTranslations: loadWalletTranslations("English"),
  dexLanguage : "English"
});

export default (state = initState, action) => {
  switch (action.type) {
    case "DEX_SET_TRANSLATIONS":
      state = state.set("dexTranslations", action.payload.dexTranslations);
      state = state.set("walletTranslations", action.payload.walletTranslations);
      state = state.set("dexLanguage", action.payload.dexLanguage);
      return state;
    default:
      return state;
  }
}