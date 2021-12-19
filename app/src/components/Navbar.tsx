// react
import React, { useState } from "react";
// mui
import withStyles, { StyleRules } from "@mui/styles/withStyles";
import { Button, Snackbar, Theme, Typography } from "@mui/material";
import { blue, grey, teal, blueGrey } from "@mui/material/colors";
// web3
import { AppBar, Container, makeStyles, Toolbar } from "@material-ui/core";
import { WalletMultiButton } from "@solana/wallet-adapter-material-ui";
// others
import { Keypair } from "@solana/web3.js";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { loadKeypair, setDeposit, setWithdraw } from "../redux/reducer";
// components
// interfaces
interface IProps {
  classes?: any;
}
// component
const RatioLogoStyles = (theme: Theme): StyleRules => ({
  Button: {
    '&.MuiButton-root': {
      position: 'absolute',
      left: 0,
    },
    minHeight: "70px",
    maxWidth: "300px",
    minWidth: "100%",
    display: "flex",
  },
  text: {
    padding: `0 5px`,
    color: grey['50'],
  },
});
const RatioLogoComponent: React.FC<IProps> = ({ classes }) => {

  return (
    <Button
      className={`${classes.Button} flexcol`}
      variant="text"
    >
      <Typography component="div" className={`${classes.text}`}>
        Ratio
      </Typography>
    </Button>
  );
};
const RatioLogo = withStyles(RatioLogoStyles)(RatioLogoComponent);

// component
const DepositButtonStyles = (theme: Theme): StyleRules => ({
  Button: {
    minHeight: "70px",
    maxWidth: "300px",
    minWidth: "100%",
    display: "flex",
  },
  text: {
    padding: `0 20px`,
  },
});
const DepositButtonComponent: React.FC<IProps> = ({ classes }) => {
  // state
  const action = useAppSelector(s => s.action);
  const dispatch = useAppDispatch();

  return (
    <Button
      className={`${classes.Button} flexcol`}
      onClick={() => {dispatch(setDeposit())}}
      variant="contained"
      style={{
        backgroundColor: action === 'Deposit' ? blue['800']: blueGrey['300'],
        color: action === 'Deposit' ? grey['50']: grey['400'],
      }}
      disableElevation={action !== 'Deposit'}
    >
      <Typography component="div" className={`${classes.text}`}>
        Deposit
      </Typography>
    </Button>
  );
};
const DepositButton = withStyles(DepositButtonStyles)(DepositButtonComponent);

// component
const WithdrawButtonComponent: React.FC<IProps> = ({ classes }) => {
  // state
  const action = useAppSelector(s => s.action);
  const dispatch = useAppDispatch();
  console.log('deposit', action, action === 'Withdraw')

  return (
    <Button
      className={`${classes.Button} flexcol`}
      onClick={() => {dispatch(setWithdraw())}}
      variant="contained"
      style={{
        backgroundColor: action === 'Withdraw' ? blue['800']: blueGrey['300'],
        color: action === 'Withdraw' ? grey['50']: grey['400'],
      }}
      disableElevation={action !== 'Withdraw'}
    >
      <Typography component="div" className={`${classes.text}`}>
        Withdraw
      </Typography>
    </Button>
  );
};
const WithdrawButton = withStyles(DepositButtonStyles)(WithdrawButtonComponent);

// component
const ConnectButtonStyles = (theme: Theme): StyleRules => ({
  Button: {
    '&.MuiButton-root': {
      position: 'absolute',
      right: 0,
      backgroundColor: teal['200'],
      color: grey["700"],
    },
    '&.MuiButton-root:hover': {
      backgroundColor: teal['100'],
      borderColor: '#0062cc',
      boxShadow: 'none',
    },
    minHeight: "70px",
    maxWidth: "300px",
    // @ts-ignore
    width: "100%",
    display: "flex",
  },
  text: {
    padding: `0 20px`,
  },
});

const ConnectButtonComponent: React.FC<IProps> = ({ classes }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const kp: Keypair | undefined = useAppSelector(s => s.keypair);

  const handleClick = () => {
    const keypair: Keypair = new Keypair();
    dispatch(loadKeypair(keypair));
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };
  return (
    <>
      <WalletMultiButton className={`${classes.Button} flexcol`} />
      {/* <Button
        className={`${classes.Button} flexcol`}
        variant="contained"
        onClick={handleClick}
        disabled={!!kp}
      >
        <Typography component="div" className={`${classes.text} w100`} noWrap>
          {kp ? kp?.publicKey.toString(): `Generate & connect to random wallet`}
        </Typography>
      </Button>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={isOpen}
        onClose={handleClose}
        message={`Successfully loaded keypair: \n${kp && kp.publicKey}`}
      /> */}
    </>
  );
};
const ConnectButton = withStyles(ConnectButtonStyles)(ConnectButtonComponent);

/**
 * Navbar
 */
const NavbarStyles = (theme: Theme): StyleRules => ({
  Navbar: {
    backgroundColor: "#939393",
    minHeight: "70px",
    width: "100%",
    minWidth: "100%",
    display: "flex",
  },
  mainNav: {},
});
const NavbarComponent: React.FC<IProps> = ({ classes }) => {
  
  return (
    <div className={`${classes.Navbar} w100 flexcol`}>
      <div className={`${classes.mainNav} h100 flexrow coreElem`}>
        <RatioLogo />
        <DepositButton />
        <WithdrawButton />
        {/* <WalletMultiButton /> */}
        <ConnectButton />
      </div>
    </div>
  );
};
const Navbar = withStyles(NavbarStyles)(NavbarComponent);

// export
export default Navbar;
