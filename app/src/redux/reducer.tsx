import { Keypair } from "@solana/web3.js";
// constants
import { initState } from "./initState";
// types
export const UPDATE_AMOUNT = "UPDATE_AMOUNT";
export const UPDATE_POOL_AMOUNT = "UPDATE_POOL_AMOUNT";
export const UPDATE_USER_AMOUNT = "UPDATE_USER_AMOUNT";
export const SET_DEPOSIT = "SET_DEPOSIT";
export const SET_WITHDRAW = "SET_WITHDRAW";
export const LOAD_KEYPAIR = "LOAD_KEYPAIR";
export const SET_ACTION = "SET_ACTION";

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
export const setAction = (payload: string) => (dispatch: any) => {
  dispatch({
    type: SET_ACTION,
    payload,
  });
};
export const updateUserAmount = (payload: number) => (dispatch: any) => {
  dispatch({
    type: UPDATE_USER_AMOUNT,
    payload,
  });
};
export const updatePoolAmount = (payload: number) => (dispatch: any) => {
  dispatch({
    type: UPDATE_POOL_AMOUNT,
    payload,
  });
};
export const updateAmount = (payload: number) => (dispatch: any) => {
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

/**
 * main
 */
const GeneralReducer = (state = initState, action: any) => {
  switch (action.type) {
    case UPDATE_AMOUNT:
      return {
        ...state,
        amount: action.payload,
      };
    case UPDATE_POOL_AMOUNT:
      return {
        ...state,
        poolAmount: action.payload,
      };
    case UPDATE_USER_AMOUNT:
      return {
        ...state,
        userAmount: action.payload,
      };
    case SET_DEPOSIT:
      return {
        ...state,
        action: "Deposit",
      };
    case SET_WITHDRAW:
      return {
        ...state,
        action: "Withdraw",
      };
    case LOAD_KEYPAIR:
      return {
        ...state,
        keypair: action.payload,
      };
    case SET_ACTION:
      return {
        ...state,
        action: action.payload,
      };
    default:
      return state;
  }
};

export default GeneralReducer;
