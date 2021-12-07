// types
export const UPDATE_AMOUNT = 'UPDATE_AMOUNT';
export const SET_DEPOSIT = 'SET_DEPOSIT';
export const SET_WITHDRAW = 'SET_WITHDRAW';

// actions
export const setWithdraw = () => (dispatch: any) => {
  dispatch({
    type: SET_WITHDRAW,
  });
};
export const setDeposit = () => (dispatch: any) => {
  dispatch({
    type: SET_DEPOSIT,
  });
};
export const updateAmount = (payload: any) => (dispatch: any) => {
  dispatch({
    type: UPDATE_AMOUNT,
    payload,
  });
};

// init state
export const initState = {
  action: "Deposit",
};

/**
 * main
 */
 const GeneralReducer = (state = initState, action: any) => {
  switch (action.type) {
    case UPDATE_AMOUNT:
      return {
        ...state,
        amount: action.payload,
      }
    case SET_DEPOSIT:
      return {
        ...state,
        action: 'Deposit',
      }
    case SET_WITHDRAW:
      return {
        ...state,
        action: 'Withdraw',
      }
    default:
      return state;
    }
};

export default GeneralReducer;