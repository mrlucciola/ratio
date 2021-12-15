// react
import React, { useEffect, useState } from "react";
// mui
import withStyles, { StyleRules } from "@mui/styles/withStyles";
import { Button, Paper, Snackbar, TextField, Theme, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
// web3
import {Keypair, Connection} from "@solana/web3.js";
import Wallet from "@project-serum/sol-wallet-adapter";
import { loadKeypair } from "../redux/reducer";

// component
interface IProps {
  classes?: any;
}
const BodyStyles = (theme: Theme): StyleRules => {
  const radiusAmt = 10;
  return {
    Body: {
      maxWidth: 600,
      minWidth: 600,
      minHeight: 100,
      "&.MuiPaper-rounded": {
        borderRadius: radiusAmt,
      },
    },
    input: {
      "&.MuiTextField-root": {
        margin: `10px 0px`,
      },
    },
    submit: {
      "&.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary": {
        borderRadius: `0 0 ${radiusAmt}px ${radiusAmt}px`,
      },
    },
  };
};

// type WindowSol<T extends Window> = Object & {
//   solana: T;
// }

const BodyComponent: React.FC<IProps> = ({ classes }) => {
  // init hooks
  const dispatch = useAppDispatch();
  // state
  const action: string = useAppSelector((s) => s.action);
  const kp: any = useAppSelector((s) => s.keypair);
  const [isOpen, setIsOpen]: [boolean, Function] = useState<boolean>(false);
  const [input, setInput]: [string, Function] = useState<string>("");
  const [rpcConnection, setRpcConnection] = useState<Connection>();
  // fxns
  const submitWithdrawal = () => {};
  const submitDeposit = async () => {};
  const submitAction = async () => {
    if (['Deposit', 'Withdraw'].includes(action)) {
      try {
        action === "Deposit" && await submitDeposit();
        action === "Withdraw" && await submitWithdrawal();
        handleClick();
      } catch (error) {
        alert(error);
      }
    }
  };
  const handleClick = () => {
    const keypair: Keypair = new Keypair();
    dispatch(loadKeypair(keypair));
    setIsOpen(true);
  };
  const handleClose = () => {
    setIsOpen(false);
  };
  const getConnection = async () => {
    const connection: Connection = new Connection(
      "http://localhost:8899", // clusterApiUrl(""),
      "confirmed"
    );
    setRpcConnection(connection);
  };
  const getProvider = async () => {
    const { solana: provider } = window;
    if (provider) {
      await provider.connect();

      if (provider.isPhantom) {
        console.log("Is Phantom installed?  ", provider.isPhantom);
        return provider;
      }
    }
  };
  const getRecentBlockhashAndFees = async (connection: Connection) => {
    return await connection.getRecentBlockhash();
  };

  // effects
  useEffect(() => {
    getConnection();
  }, []);

  return (
    <Paper className={`${classes.Body} flexcol`} variant="outlined">
      <TextField
        className={classes.input}
        label={`${action} amount`}
        variant="outlined"
        value={input}
        onChange={(e) => {
          const strLen = e.target.value.length;
          if (strLen > 0) {
            const lastValue = e.target.value[strLen - 1];
            "1234567890".includes(lastValue) && setInput(e.target.value);
          } else {
            setInput(e.target.value);
          }
        }}
      />
      <Button
        className={`${classes.submit} w100 flexcol`}
        variant="contained"
        onClick={submitAction}
        disabled={!kp || input === ""}
      >
        {action}
      </Button>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={isOpen}
        onClose={handleClose}
        message={`Submitting ${action.toLowerCase()} for ${input} tokens`}
      />
    </Paper>
  );
};
const Body = withStyles(BodyStyles)(BodyComponent);

// export
export default Body;
