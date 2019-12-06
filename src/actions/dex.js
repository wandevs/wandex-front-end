import enTranslations from "../language/en_US";
import cnTranslations from "../language/cn_ZH";
import enWalletTranslations from "../language/wallet_en_US";
import cnWalletTranslations from "../language/wallet_cn_ZH";


export const loadTranslations = (name) => {
  if (name === "English") {
    return enTranslations;
  } else if (name === "Chinese") {
    return cnTranslations;
  }
};

export const loadWalletTranslations = (name) => {
  if (name === "English") {
    return enWalletTranslations;
  } else if (name === "Chinese") {
    return cnWalletTranslations;
  }
};

export const loadLanguage = (dispatch) => {
  const dexLanguage = window.localStorage.getItem("dexLanguage");
  if (dexLanguage) {
    setDexTranslations(dexLanguage, dispatch);
  } else {
    setDexTranslations("English", dispatch);
  }
};

export const setDexTranslations = ( dexLanguage, dispatch ) => {
  window.localStorage.setItem("dexLanguage", dexLanguage);
  const dexContent = loadTranslations(dexLanguage);
  const walletContent = loadWalletTranslations(dexLanguage);

  dispatch({
      type: "DEX_SET_TRANSLATIONS",
      payload: {
        dexLanguage: dexLanguage,
        dexTranslations: dexContent,
        walletTranslations: walletContent,
      }
    });
};