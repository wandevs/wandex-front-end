
export const saveActivity = (key, value) => {
  window.localStorage.setItem(key, value)
};

export const readActivity = (key) => {
  return window.localStorage.getItem(key);
};