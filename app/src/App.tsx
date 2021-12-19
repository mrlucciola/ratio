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
interface IProps {
  classes?: any;
}

const NavAndBodyStyles = (theme: Theme): StyleRules => ({
  NavAndBody: {
    minHeight: "100vh",
    justifyContent: "start",
  },
});
const NavAndBodyComponent: React.FC<IProps> = ({ classes }) => {
  return (
    <Stack className={`${classes.NavAndBody} w100 flexcol`}>
      <Navbar />
      <Body />
    </Stack>
  );
};
const NavAndBody = withStyles(NavAndBodyStyles)(NavAndBodyComponent);

const AppStyles = (theme: Theme): StyleRules => ({
  App: {
    backgroundColor: "#eaebe8",
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
});
console.log('working here')
const AppComponent: React.FC<IProps> = ({ classes }) => {
  const endpoint: string = useAppSelector((s) => s.endpoint);
  const onWalletError = useCallback((error) => {
    // enqueueSnackbar(
    //   error.message ? `${error.name}: ${error.message}` : error.name,
    //   { variant: "error" }
    // );
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
};
const App = withStyles(AppStyles)(AppComponent);

export default App;
