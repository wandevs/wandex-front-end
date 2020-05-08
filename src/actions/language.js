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

function getQueryVariable(variable){
  let query = window.location.search.substring(1);
  let vars = query.split("&");
  for (let i=0;i<vars.length;i++) {
    let pair = vars[i].split("=");
    if(pair[0] === variable){return pair[1];}
  }
  return(false);
}

export const loadLanguage = (dispatch) => {
  const urlConfigLang = getQueryVariable('lang');
  if (!urlConfigLang) {
    const dexLanguage = window.localStorage.getItem("dexLanguage");
    if (dexLanguage) {
      setDexTranslations(dexLanguage, dispatch);
    } else {
      setDexTranslations("English", dispatch);
    }
  } else {
    if (urlConfigLang === "zh") {
      setDexTranslations("Chinese", dispatch);
    } else {
      setDexTranslations("English", dispatch);
    }
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