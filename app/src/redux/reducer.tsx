import { Connection, Keypair } from "@solana/web3.js";
import { Program, Provider, web3 } from "@project-serum/anchor";
// constants
import idl from "../idl.json";
// types
export const UPDATE_AMOUNT = "UPDATE_AMOUNT";
export const SET_DEPOSIT = "SET_DEPOSIT";
export const SET_WITHDRAW = "SET_WITHDRAW";
export const LOAD_KEYPAIR = "LOAD_KEYPAIR";

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
  action: string;
  endpoint: string;
  keypair?: Keypair;
  statePda: web3.PublicKey;
  poolPda: web3.PublicKey;
  redeemableMintPda: web3.PublicKey;
  poolRedeemablePda: web3.PublicKey;
  connection: Connection;
  program: Program;
  provider: Provider;
  programId: web3.PublicKey;
  programPubkeyStr: string;
  idl: any;
}
const pair: Uint8Array = new Uint8Array([
  137, 10, 190, 145, 61, 159, 94, 34, 125, 181, 216, 222, 167, 145, 228, 240,
  85, 23, 195, 65, 231, 85, 64, 71, 3, 62, 17, 109, 147, 64, 129, 182, 240, 93,
  38, 195, 100, 211, 54, 181, 206, 211, 184, 193, 121, 210, 4, 138, 24, 190, 41,
  95, 40, 146, 22, 96, 149, 56, 123, 194, 149, 45, 35, 139,
]);
const keypair: Keypair = Keypair.fromSecretKey(pair);
// @ts-ignore
const connection: Connection = new Connection(
  "http://127.0.0.1:8899",
  "processed"
);
// @ts-ignore
const provider: Provider = new Provider(connection, keypair, {
  preflightCommitment: "processed",
});
// @ts-ignore
const programId: web3.PublicKey = new web3.PublicKey(idl.metadata.address);
// @ts-ignore
const program: Program = new Program(idl, programId, provider);

export const initState: IinitState = {
  action: "Deposit",
  keypair,
  connection,
  provider,
  programId,
  program,
  idl,
  endpoint: "http://127.0.0.1:8899",
  programPubkeyStr: '6cDMc7baVfghT4sUx1t3sEfohxXyj4XwDr8pbarQfz1z',
  statePda: new web3.PublicKey("GPVQCW1pu31pDRj1kpAfXbLRkJ1dgzQcPcMrL5k6eCHN"),
  poolPda: new web3.PublicKey("6xgvfU1kC2FnaEuyA7yGNYFTMb1NuwKb8HNVho6PHdao"),
  redeemableMintPda: new web3.PublicKey(
    "E2GLt7UyAUBZqUUUdqtCGw8DMS2LnroBmsNkh6hn4qoU"
  ),
  poolRedeemablePda: new web3.PublicKey(
    "ArSQsjnEXzzmhMZmQ2rNzmh6xVVLxj8NwhixpCMfy2RK"
  ),
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
    default:
      return state;
  }
};

export default GeneralReducer;
