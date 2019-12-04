const default_activity_capacity = 10;
const default_activity_endIndex = -1;

const getLocaleItem = (name, defaultValue) => {
  const str = window.localStorage.getItem(name);
  let rt = defaultValue;
  if (str) {
    rt = parseInt(str);
  }

  return rt;
};

export const loadActivity = () => {
  return async (dispatch, ) => {
    let endIndex = getLocaleItem("endIndex", default_activity_endIndex);
    let capacity = getLocaleItem("capacity", 0);

    if (capacity === 0) {
      capacity = default_activity_capacity;
      endIndex = default_activity_endIndex;
      window.localStorage.setItem('capacity', capacity.toString());
      window.localStorage.setItem('endIndex', endIndex.toString());
    }

    const items = [];
    let loadNum = capacity;
    if (endIndex < capacity) {
      loadNum = endIndex + 1;
    }

    const startIndex = (endIndex + 1 - loadNum ) % capacity;
    for(let i = 0; i < loadNum; i++) {
      let index = (startIndex + i) ;
      if (index >= capacity) {
        index = index - capacity;
      }
      const item = window.localStorage.getItem("act-" + index);
      if (item) {
        items.push(item)
      }
      console.log("***" + index + "----"+ item);
    }

    return dispatch({
      type: 'LOAD_ACTIVITY',
      payload: {
        endIndex,
        capacity,
        items
      }
    })
  };
};

export const addActivity = (message) => {
  return async (dispatch, getState) => {
    let endIndex = getLocaleItem('endIndex', default_activity_endIndex);
    let capacity = getState().activity.capacity;
    if (!capacity) {
      capacity = getLocaleItem('capacity', default_activity_capacity);
    }
    endIndex += 1;
    message = (new Date()).getTime().toString() + ":" + message;
    const actIndex = endIndex % capacity;
    window.localStorage.setItem('act-' + actIndex, message);
    window.localStorage.setItem('endIndex', endIndex.toString());

    return dispatch({
      type: 'ADD_ACTIVITY',
      payload: {
        endIndex,
        item: message
      }
    })
  };
};

export const addOrderActivity = (order) => {
  const message = {
    marketID: order.marketID,
    side: order.side,
    amount: order.amount,
    price: order.price,
    status: order.status,
    confirmedAmount: order.confirmedAmount,
  };
  return addActivity("order:" + JSON.stringify(message))
};
export const addTradeActivity = (order) => {
  const message = {
    marketID: order.marketID,
    side: order.side,
    amount: order.amount,
    price: order.price,
    status: order.status,
    confirmedAmount: order.confirmedAmount,
  };
  return addActivity("trade:" + JSON.stringify(message))
};