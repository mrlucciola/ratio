// react
import React, { useEffect } from "react";
// mui
import withStyles, { StyleRules } from "@mui/styles/withStyles";
import { Chip, Divider, Stack, Theme } from "@mui/material";
// web3
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { updatePoolAmount, updateUserAmount } from "../redux/reducer";
import { getAssocTokenAcct, GetProvider, getTokenBalance } from "../utils/utils";
import { AnchorWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import { web3 } from "@project-serum/anchor";
import UserBalance from "./balances/UserBalance";
import PoolBalance from "./balances/PoolBalance";


const Balances = withStyles((theme: Theme): StyleRules => ({
  Balances: {
    padding: '10px 0',
    '& > div': {
      // margin: '20px, 0',
    },
  },
}))(({ classes }: any) => {
  // init hooks
  const dispatch = useAppDispatch();
  const wallet = useAnchorWallet();
  // state
  const endpoint = useAppSelector(s => s.endpoint);
  const poolCurrencyAssoc = useAppSelector(s => s.pool.currencyAssoc) as web3.PublicKey;
  const currencyMintPda = useAppSelector(s => s.currency.pda) as web3.PublicKey;
  // fxns
  const fetchBalance = async (wallet: AnchorWallet | undefined) => {
    const [provider] = GetProvider(wallet, endpoint);
    const poolBalance = await getTokenBalance(poolCurrencyAssoc, provider);
    dispatch(updatePoolAmount(Number(poolBalance)));
    if (wallet) {
      const [userCurrencyAssoc] = getAssocTokenAcct(wallet.publicKey, currencyMintPda);
      const userBalance = await getTokenBalance(userCurrencyAssoc, provider);
      dispatch(updateUserAmount(Number(userBalance)));
    }
  };
  // effects
  useEffect(() => {
    fetchBalance(wallet);
  }, [wallet && wallet.publicKey.toString()]);
  
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