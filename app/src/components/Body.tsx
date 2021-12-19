// react
import React, { useEffect, useState } from "react";
// mui
import withStyles, { StyleRules } from "@mui/styles/withStyles";
import {
  Button,
  Paper,
  Snackbar,
  TextField,
  Theme,
  Typography,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
// web3
import { web3, Provider } from "@project-serum/anchor";
import { Keypair, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import Wallet from "@project-serum/sol-wallet-adapter";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { loadKeypair } from "../redux/reducer";
import MintElem from "./MintElem";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
// local
// import * as idl from "../idl.json";
// const programId = new web3.PublicKey(idl.metadata.address);

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
    text: {
      padding: `20px 0`,
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
  // const wallet = useAnchorWallet();
  // const wallet = useWallet();
  const dispatch = useAppDispatch();
  // state
  const action: string = useAppSelector((s) => s.action);
  const statePda: web3.PublicKey = useAppSelector((s) => s.statePda);
  const poolPda: web3.PublicKey = useAppSelector((s) => s.poolPda);
  const connection = useAppSelector((s) => s.connection);
  const provider: Provider = useAppSelector((s) => s.provider);
  const redeemableMintPda: web3.PublicKey = useAppSelector(
    (s) => s.redeemableMintPda
  );
  const poolRedeemablePda: web3.PublicKey = useAppSelector(
    (s) => s.poolRedeemablePda
  );
  const keypair: any = useAppSelector((s) => s.keypair);
  const [isOpen, setIsOpen]: [boolean, Function] = useState<boolean>(false);
  const [input, setInput]: [string, Function] = useState<string>("");
  // const [provider, setProvider] = useState<Provider>();
  const [tokenAmt, setTokenAmt] = useState<number>();
  // fxns
  const getBalance = async (publicKey: web3.PublicKey) => {
    try {
      // @ts-ignore
      const res: web3.RpcResponseAndContext<web3.TokenAmount> =
        await provider?.connection.getTokenAccountBalance(poolRedeemablePda);

      const _tokenAmt = Number(res.value.amount);
      const lamports = await connection.getBalance(publicKey);
      // console.log('lamps', lamports / LAMPORTS_PER_SOL)
      // console.log('tokenAmt', tokenAmt / LAMPORTS_PER_SOL)
      setTokenAmt(_tokenAmt);
      // console.log(_tokenAmt / LAMPORTS_PER_SOL);
      // @ts-ignore
      return lamports / LAMPORTS_PER_SOL;
    } catch (error) {
      console.log("error", error);
    }
  };
  const submitWithdrawal = () => {};
  const submitDeposit = async () => {};
  const submitAction = async () => {
    if (["Deposit", "Withdraw"].includes(action)) {
      try {
        action === "Deposit" && (await submitDeposit());
        action === "Withdraw" && (await submitWithdrawal());
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


  // effects
  useEffect(() => {
    provider && getBalance(keypair.publicKey);
  }, [provider]);

  return (
    <Paper className={`${classes.Body} flexcol`} variant="outlined">
      <div className={`${classes.text}`}>
        <Typography>
          {action === "Deposit" &&
            "Deposit funds to the pool, or mint directly to the pool"}
          {action === "Withdraw" && "Withdraw funds from the pool"}
        </Typography>
      </div>
      <MintElem />
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
        disabled={!keypair || input === ""}
      >
        {action}
      </Button>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
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
