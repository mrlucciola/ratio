// react
import React, { useEffect, useState } from "react";
// mui
import withStyles, { StyleRules } from "@mui/styles/withStyles";
import {
  Button,
  Stack,
  TextField,
  Theme,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  Program,
  BN,
  web3,
  Provider,
  Wallet,
} from "@project-serum/anchor";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { Connection, Keypair, LAMPORTS_PER_SOL, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { GetProvider } from "../utils/utils";
// import { TextEncoder } from "util";

// local
// constants
// component
interface IProps {
  classes?: any;
}
const BodyStyles = (theme: Theme): StyleRules => {
  const radiusAmt = 10;
  return {
    MintElem: {
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

const MintElemComponent: React.FC<IProps> = ({ classes }) => {
  // init hooks
  // @ts-ignore
  // const { publicKey, signMessage } = useWallet();
  const wallet = useWallet();
  // console.log('qwer', program)
  // const dispatch = useAppDispatch();
  // state
  const idl = useAppSelector((s) => s.idl);
  const programId: web3.PublicKey = useAppSelector((s) => s.programId);
  const connection: Connection = useAppSelector((s) => s.connection);
  const provider= useAppSelector((s) => s.provider);
  const program: Program = new Program(idl, programId, provider);
  const statePda: web3.PublicKey = useAppSelector((s) => s.statePda);
  const keypair = useAppSelector((s) => s.keypair);
  const poolPda: web3.PublicKey = useAppSelector((s) => s.poolPda);
  const redeemableMintPda: web3.PublicKey = useAppSelector(
    (s) => s.redeemableMintPda
  );
  const poolRedeemablePda: web3.PublicKey = useAppSelector(
    (s) => s.poolRedeemablePda
  );
  const [input, setInput]: [string, Function] = useState<string>("");

  // fxns
  // event handlers
  const mintToPool = async (
    mintAmount: number,
    statePda: web3.PublicKey,
    poolPda: web3.PublicKey,
    redeemableMintPda: web3.PublicKey,
    poolRedeemablePda: web3.PublicKey
  ) => {
    const mintAmountBn = new BN(mintAmount * 10 ** 7);
    const accounts = {
      state: statePda,
      pool: poolPda,
      redeemableMint: redeemableMintPda,
      poolRedeemable: poolRedeemablePda,
      tokenProgram: TOKEN_PROGRAM_ID,
    };
    const payload = {
      accounts,
      signers: [],
    };
    let signature = "";
    try {
      const [provider, connection] = GetProvider(wallet, 'http://127.0.0.1:8899');
      const publicKey = provider.wallet.publicKey;
      const receiver = new web3.PublicKey(poolRedeemablePda);

      let associatedTokenAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        redeemableMintPda,
        receiver,
        true
      );
      
      signature = await program.rpc.mintAndDeposit(254, mintAmountBn, {
        accounts: {
          mint: redeemableMintPda,
          destination: associatedTokenAccount,
          payer: provider.wallet.publicKey,
          receiver: receiver,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [],
      });
      // setInput("");
    } catch (error) {
      console.log(error);
      alert(error);
    }
  };

  return (
    <Stack className={`${classes.MintElem} flexcol`} direction="row">
      <TextField
        className={classes.input}
        label={`Mint amount`}
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
        variant="contained"
        onClick={() => {
          console.log("MINTING", 9, "TOKENS");
          mintToPool(
            Number(input),
            statePda,
            poolPda,
            redeemableMintPda,
            poolRedeemablePda
          );
        }}
      >
        Mint and Deposit
      </Button>
    </Stack>
  );
};
const MintElem = withStyles(BodyStyles)(MintElemComponent);

// export
export default MintElem;
