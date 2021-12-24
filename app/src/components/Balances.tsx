// react
import React, { useEffect } from "react";
// mui
import withStyles, { StyleRules } from "@mui/styles/withStyles";
import { Divider, Stack, Theme } from "@mui/material";
// web3
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { web3, Wallet } from "@project-serum/anchor";
// components
import UserBalance from "./balances/UserBalance";
import PoolBalance from "./balances/PoolBalance";
// utils
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { updatePoolAmount, updateUserAmount } from "../redux/reducer";
import { getAssocTokenAcct, GetProvider, updateTokenBalance } from "../utils/utils";


const Balances = withStyles((theme: Theme): StyleRules => ({
  Balances: {
    padding: '10px 0',
  },
}))(({ classes }: any) => {
  // init hooks
  const dispatch = useAppDispatch();
  const wallet = useAnchorWallet();
  // state
  const endpoint = useAppSelector(s => s.endpoint);
  const poolCurrencyAssoc = useAppSelector(s => s.pool.currencyAssoc) as web3.PublicKey;
  const currencyMintPda = useAppSelector(s => s.currency.pda) as web3.PublicKey;
  console.log('poolCurrencyAssoc', poolCurrencyAssoc)
  // fxns
  const fetchBalance = async (wallet: Wallet | undefined) => {
    const [provider] = GetProvider(wallet, endpoint);
    await updateTokenBalance(poolCurrencyAssoc, provider, updatePoolAmount, dispatch);
    if (wallet) {
      const [userCurrencyAssoc] = getAssocTokenAcct(wallet.publicKey, currencyMintPda);
      await updateTokenBalance(userCurrencyAssoc, provider, updateUserAmount, dispatch);
    }
  };
  // effects
  const isWallet = wallet && wallet.publicKey.toString();
  useEffect(() => {
    fetchBalance(wallet as Wallet);
    // eslint-disable-next-line
  }, [isWallet]);
  
  return (
    <Stack
      className={`${classes.Balances} h100`}
      flexDirection="column"
    >
      <UserBalance />
      <Divider orientation="horizontal" variant="middle" style={{padding: 4}} />
      <PoolBalance />
    </Stack>
  );
});

export default Balances;