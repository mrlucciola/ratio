// react
import React, { useCallback, useState } from "react";
// mui
import withStyles, { StyleRules } from "@mui/styles/withStyles";
import {
  Button,
  Card,
  Snackbar,
  Stack,
  TextField,
  Theme,
  Typography,
} from "@mui/material";
// web3
import { AnchorWallet, useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import {
  Program,
  BN,
  web3,
  Wallet,
} from "@project-serum/anchor";
import { Connection, Transaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, Token as SplToken, } from "@solana/spl-token";
// components
import Balances from "./Balances";
import RatioAppBar from "./RatioAppBar";
// utils
import { checkIfAccountExists, getAssocTokenAcct, GetProvider, getTokenBalance, handleTxn, sendSingleIxnTxn } from "../utils/utils";
import { updatePoolAmount, updateUserAmount } from "../redux/reducer";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { useEffect } from "react";

import MuiAlert from '@mui/material/Alert';

const Alert: any = React.forwardRef(function Alert(props, ref) {
  // @ts-ignore
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// @ts-ignore
const handleClick = (setToastMsg, action, input) => {
  setToastMsg(`Submitting ${action.toLowerCase()} for ${input} tokens`);
};
const handleClose = (setIsOpen: any) => () => {setIsOpen(false)};

const Body = withStyles((theme: Theme): StyleRules => {
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
})(({ classes }: any) => {
  // init hooks
  const wallet = useAnchorWallet();
  // @ts-ignore
  const isWallet = wallet && wallet?.toString();
  const dispatch = useAppDispatch();
  // state
  const action: string = useAppSelector((s) => s.action);
  const [toastMsg, setToastMsg]: [string, Function] = useState<string>("");
  const [isOpen, setIsOpen]: [boolean, Function] = useState<boolean>(false);
  const [input, setInput]: [string, Function] = useState<string>("");
  const idlRatio = useAppSelector(s => s.idlRatio);
  const idlMintAndDeposit = useAppSelector(s => s.idlMintAndDeposit);
  const currencyMintPda = useAppSelector(s => s.currency.pda);
  const poolCurrencyPda = useAppSelector(s => s.pool.currencyPda) as web3.PublicKey;
  const programIdMintAndDeposit = useAppSelector(s => s.programIdMintAndDeposit);
  const programIdRatio = useAppSelector(s => s.programIdRatio);
  const statePda = useAppSelector(s => s.state.pda);
  const poolPda = useAppSelector(s => s.pool.pda);

  // fxns
  
  useEffect(() => {setIsOpen(toastMsg === '' ? false : true)}, [toastMsg])
  
  const deposit = useCallback(
    async (depositAmount: number) => {
      try {
        const [userCurrencyAssoc] = getAssocTokenAcct(wallet?.publicKey as any, currencyMintPda);
        const [provider] = GetProvider(wallet, 'http://127.0.0.1:8899');
        await checkIfAccountExists(provider, wallet as Wallet, userCurrencyAssoc, currencyMintPda);

        const program: Program = new Program(idlRatio, programIdRatio, provider);
        const txn = (new web3.Transaction()).add(
          SplToken.createApproveInstruction(
            TOKEN_PROGRAM_ID,
            userCurrencyAssoc,
            statePda,
            wallet?.publicKey as web3.PublicKey,
            [],
            depositAmount
          )
        );
        txn.add(program.instruction.deposit(
          new BN(depositAmount),
          {
            accounts: {
              pool: poolPda,
              currencyMint: currencyMintPda,
              userCurrency: userCurrencyAssoc,
              poolCurrency: poolCurrencyPda,
              tokenProgram: TOKEN_PROGRAM_ID,
              payer: wallet?.publicKey as web3.PublicKey,
            },
          }
        ));
        const receipt = await handleTxn(txn, provider, wallet as Wallet);
        console.log('receiptreceipt', receipt)
        setInput("");
        const poolBalance = await getTokenBalance(poolCurrencyPda, provider);
        dispatch(updatePoolAmount(Number(poolBalance)));
        
        const userBalance = await getTokenBalance(userCurrencyAssoc, provider);
        dispatch(updateUserAmount(Number(userBalance)));
      } catch (error) {
        console.log(error);
      }
    },
    [poolCurrencyPda.toString(), statePda.toString(), currencyMintPda.toString(), isWallet],
    // [isWallet],
  );
  const withdraw = useCallback(
    async (withdrawAmount: number) => {
      const [userCurrencyAssoc] = getAssocTokenAcct(wallet?.publicKey as any, currencyMintPda);
      const [provider, connection] = GetProvider(wallet, 'http://127.0.0.1:8899');
      const program: Program = new Program(idlRatio, programIdRatio, provider);
      await checkIfAccountExists(provider, wallet as Wallet, userCurrencyAssoc, currencyMintPda);

      const txn = (new web3.Transaction()).add(program.instruction.withdraw(
        new BN(withdrawAmount),
        {
          accounts: {
            state: statePda,
            currencyMint: currencyMintPda,
            userCurrency: userCurrencyAssoc,
            tokenProgram: TOKEN_PROGRAM_ID,
            poolCurrency: poolCurrencyPda,
            pool: poolPda,
            payer: wallet?.publicKey as web3.PublicKey,
          },
        }
      ));
      await handleTxn(txn, provider, wallet as Wallet);
      setInput("");
      const poolBalance = await getTokenBalance(poolCurrencyPda, provider);
      dispatch(updatePoolAmount(Number(poolBalance)));
      
      const userBalance = await getTokenBalance(userCurrencyAssoc, provider);
      dispatch(updateUserAmount(Number(userBalance)));
    },
    [poolCurrencyPda.toString(), statePda.toString(), currencyMintPda.toString(), isWallet],
  );
  const mintToPool = useCallback(
    async (mintAmount: number) => {
      const [provider] = GetProvider(wallet, 'http://127.0.0.1:8899');
      const program: Program = new Program(idlMintAndDeposit, programIdMintAndDeposit, provider);
      const txn = (new web3.Transaction()).add(program.instruction.mintAndDepositCpi(
        new BN(mintAmount),
        {
          accounts: {
            state: statePda,
            currencyMint: currencyMintPda,
            destCurrency: poolCurrencyPda,
            ratioProgram: programIdRatio,
            tokenProgram: TOKEN_PROGRAM_ID,
          },
        }
      ));
      await handleTxn(txn, provider, wallet as Wallet);

      // update state
      setInput("");
      const poolBalance = await getTokenBalance(poolCurrencyPda, provider);
      dispatch(updatePoolAmount(Number(poolBalance)));
    },
    [poolCurrencyPda.toString(), statePda.toString(), currencyMintPda.toString(), isWallet],
  );
  const submitAction = useCallback(async () => {
    if (["Deposit", "Withdraw", "Mint"].includes(action)) {
      handleClick(setToastMsg, action, input);
      try {
        action === "Deposit" && (await deposit(Number(input)));
        action === "Withdraw" && (await withdraw(Number(input)));
        action === "Mint" && (await mintToPool(Number(input)));
        setToastMsg(`${action} successful!`);
      } catch (error) {
        setToastMsg(`error: ${error}`);
      }
    }
  }, [action, input],);

  return (
    <Stack flexDirection="row" alignItems="center">
      <Balances />
      <Card className={`${classes.Body} flexcol`} variant="outlined" elevation={0}>
        <RatioAppBar />
        <div className={`${classes.text}`}>
          <Typography>
            {action === "Deposit" && "Deposit funds to the pool"}
            {action === "Withdraw" && "Withdraw funds from the pool"}
            {action === "Mint" && "Mint funds and deposit them into the pool"}
          </Typography>
        </div>
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
          disabled={!wallet?.publicKey || input === ""}
        >
          {action}
        </Button>
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          open={isOpen}
          onClose={handleClose(setIsOpen)}
          message={toastMsg}
          autoHideDuration={3000}
          resumeHideDuration={1000}
        >
          <Alert
            severity={
              (() => {
                if (toastMsg.toLowerCase().includes('success')) return 'success';
                if (toastMsg.toLowerCase().includes('error')) return 'error';
                return 'info';
              })()
            }
          >{toastMsg}</Alert>
        </Snackbar>
      </Card>
    </Stack>
  );
});

// export
export default Body;
