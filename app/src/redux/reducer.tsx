import { Keypair } from "@solana/web3.js";

// types
export const UPDATE_AMOUNT = 'UPDATE_AMOUNT';
export const SET_DEPOSIT = 'SET_DEPOSIT';
export const SET_WITHDRAW = 'SET_WITHDRAW';
export const LOAD_KEYPAIR = 'LOAD_KEYPAIR';

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
export const loadKeypair = (payload: Keypair) => (dispatch: any) => {
  dispatch({
    type: LOAD_KEYPAIR,
    payload,
  });
};

// init state
interface IinitState {
  action: string,
  keypair?: Keypair,
}
export const initState: IinitState = {
  action: "Deposit",
  keypair: undefined,
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
    case LOAD_KEYPAIR:
      return {
        ...state,
        keypair: action.payload,
      }
    default:
      return state;
    }
};

export default GeneralReducer;