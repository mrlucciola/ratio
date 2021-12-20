// react
import React, { useCallback, useState, useEffect } from "react";
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
import MuiAlert from '@mui/material/Alert';
// web3
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import {
  Program,
  BN,
  web3,
  Wallet,
} from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
// components
import Balances from "./Balances";
import RatioAppBar from "./RatioAppBar";
// utils
import { checkIfAccountExists, getAssocTokenAcct, GetProvider, getTokenBalance, handleTxn } from "../utils/utils";
import { updatePoolAmount, updateUserAmount } from "../redux/reducer";
import { useAppDispatch, useAppSelector } from "../redux/hooks";


// component
const Alert: any = React.forwardRef(function Alert(props, ref) {
  // @ts-ignore
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

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
  const dispatch = useAppDispatch();
  // state
  const action: string = useAppSelector((s) => s.action);
  const [toastMsg, setToastMsg]: [string, Function] = useState<string>("");
  const [isOpen, setIsOpen]: [boolean, Function] = useState<boolean>(false);
  const [input, setInput]: [string, Function] = useState<string>("");
  const idlRatio = useAppSelector(s => s.idlRatio);
  const idlMintAndDeposit = useAppSelector(s => s.idlMintAndDeposit);
  const currencyMintPda = useAppSelector(s => s.currency.pda);
  const programIdRatio = useAppSelector(s => s.programIdRatio);
  const programIdMintAndDeposit = useAppSelector(s => s.programIdMintAndDeposit);
  const statePda = useAppSelector(s => s.state.pda);
  const poolPda = useAppSelector(s => s.pool.pda);
  const [poolCurrencyAssoc] = getAssocTokenAcct(poolPda, currencyMintPda);
  // fxns
  const handleClick = () => {
    setToastMsg(`Submitting ${action.toLowerCase()} for ${input} tokens`);
  };
  const handleClose = () => {
    setIsOpen(false)
  };
  // effects
  useEffect(() => {
    setIsOpen(toastMsg === '' ? false : true);
  }, [toastMsg])
  // callbacks
  const deposit = useCallback(
    async (depositAmount: number) => {
      const [userCurrencyAssoc] = getAssocTokenAcct(wallet?.publicKey as any, currencyMintPda);
      const [provider] = GetProvider(wallet, 'http://127.0.0.1:8899');
      await checkIfAccountExists(provider, wallet as Wallet, userCurrencyAssoc, currencyMintPda);
      const program: Program = new Program(idlRatio, programIdRatio, provider);
      const txnDeposit = new web3.Transaction();
      txnDeposit.add(program.instruction.deposit(
        new BN(depositAmount),
        {
          accounts: {
            pool: poolPda,
            currencyMint: currencyMintPda,
            userCurrency: userCurrencyAssoc,
            poolCurrency: poolCurrencyAssoc,
            tokenProgram: TOKEN_PROGRAM_ID,
            payer: wallet?.publicKey as web3.PublicKey,
          },
        }
      ));
      const receipt = await handleTxn(txnDeposit, provider, wallet as Wallet);
      setInput("");
      const poolBalance = await getTokenBalance(poolCurrencyAssoc, provider);
      dispatch(updatePoolAmount(Number(poolBalance)));
      
      const userBalance = await getTokenBalance(userCurrencyAssoc, provider);
      dispatch(updateUserAmount(Number(userBalance)));
    },
    [poolCurrencyAssoc, statePda, currencyMintPda, wallet && wallet.publicKey.toString()],
  );
  const withdraw = useCallback(
    async (withdrawAmount: number) => {
      const [userCurrencyAssoc] = getAssocTokenAcct(wallet?.publicKey as any, currencyMintPda);
      const [provider] = GetProvider(wallet, 'http://127.0.0.1:8899');
      const program: Program = new Program(idlRatio, programIdRatio, provider);
      await checkIfAccountExists(provider, wallet as Wallet, userCurrencyAssoc, currencyMintPda);
      const txn = new web3.Transaction();
      txn.add(program.instruction.withdraw(
        new BN(withdrawAmount),
        {
          accounts: {
            state: statePda,
            currencyMint: currencyMintPda,
            userCurrency: userCurrencyAssoc,
            tokenProgram: TOKEN_PROGRAM_ID,
            poolCurrency: poolCurrencyAssoc,
            pool: poolPda,
            payer: wallet?.publicKey as web3.PublicKey,
          },
        }
      ));
      await handleTxn(txn, provider, wallet as Wallet);
      setInput("");
      const poolBalance = await getTokenBalance(poolCurrencyAssoc, provider);
      dispatch(updatePoolAmount(Number(poolBalance)));
      
      const userBalance = await getTokenBalance(userCurrencyAssoc, provider);
      dispatch(updateUserAmount(Number(userBalance)));
    },
    [poolCurrencyAssoc, statePda, currencyMintPda, wallet && wallet.publicKey.toString()],
  );
  const mintToPool = useCallback(
    async (mintAmount: number) => {
      const [provider, connection] = GetProvider(wallet, 'http://127.0.0.1:8899');
      const program: Program = new Program(idlMintAndDeposit, programIdMintAndDeposit, provider);
      const txnMint = new web3.Transaction();
      txnMint.add(program.instruction.mintAndDepositCpi(
        new BN(mintAmount),
        {
          accounts: {
            state: statePda,
            currencyMint: currencyMintPda,
            destCurrency: poolCurrencyAssoc,
            ratioProgram: programIdRatio,
            tokenProgram: TOKEN_PROGRAM_ID,
          },
        }
      ));
      try {
        const response = await handleTxn(txnMint, provider, wallet as Wallet);
      } catch (error) {
        // @ts-ignore
        console.log(error.code, error.msg);
      }
      setInput("");
      const poolBalance = await getTokenBalance(poolCurrencyAssoc, provider);
      dispatch(updatePoolAmount(Number(poolBalance)));
    },
    [poolCurrencyAssoc, statePda, currencyMintPda, wallet && wallet.publicKey.toString()],
  );
  const submitAction = async () => {
    if (["Deposit", "Withdraw", "Mint"].includes(action)) {
      handleClick();
      try {
        action === "Deposit" && (await deposit(Number(input)));
        action === "Withdraw" && (await withdraw(Number(input)));
        action === "Mint" && (await mintToPool(Number(input)));
        setToastMsg(`${action} successful!`);
      } catch (error) {
        setToastMsg(`error: ${error}`);
      }
    }
  };

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
          onClose={handleClose}
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
