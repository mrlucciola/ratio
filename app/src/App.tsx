// react
import React, { useCallback } from "react";
// mui
import withStyles, { StyleRules } from "@mui/styles/withStyles";
import { Stack, Theme } from "@mui/material";
// web3
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletDialogProvider } from "@solana/wallet-adapter-material-ui";
import { getPhantomWallet } from "@solana/wallet-adapter-wallets";
// components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Body from "./components/Body";
import { useAppSelector } from "./redux/hooks";

// constants
const wallets = [getPhantomWallet()];

// component
const NavAndBody = withStyles((theme: Theme): StyleRules => ({
  NavAndBody: {
    minHeight: "100vh",
    justifyContent: "start",
  },
}))(({ classes }: any) => {
  return (
    <Stack className={`${classes.NavAndBody} w100 flexcol`}>
      <Navbar />
      <Body />
    </Stack>
  );
});

// main
const App = withStyles((theme: Theme): StyleRules => ({
  App: {
    backgroundColor: "#eff2f4",
    minWidth: "100vw",
    maxWidth: "100vw",
    width: "100vw",
    "& .coreElem": {
      maxWidth: 1300,
      width: "100%",
    },
    "&*": {
      boxSizing: "border-box",
      position: "relative",
    },
  },
}))(({ classes }: any) => {
  // state
  const endpoint: string = useAppSelector(s => s.endpoint);
  // callbacks
  const onWalletError = useCallback(error => {
    console.error(error);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} onError={onWalletError} autoConnect>
        <WalletDialogProvider>
          <Stack className={`${classes.App}`}>
            <NavAndBody />
            <Footer />
          </Stack> 
        </WalletDialogProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
});

export default App;
