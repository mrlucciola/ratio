// react
import React from "react";
// mui
import withStyles, { StyleRules } from "@mui/styles/withStyles";
import { Button, Theme, Typography } from "@mui/material";
import { blue, grey } from "@mui/material/colors";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { setDeposit, setWithdraw } from "../redux/reducer";
// components
// import NavGroupRight from './NavGroupRight';
// import NavGroupCenter from './NavGroupCenter';
// import NavGroupLeft from './NavGroupLeft';
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
  active: {
    backgroundColor: blue['A100'],
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
        backgroundColor: action === 'Deposit' ? blue['800']: blue['400'],
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
        backgroundColor: action === 'Withdraw' ? blue['800']: blue['400'],
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
      </div>
    </div>
  );
};
const Navbar = withStyles(NavbarStyles)(NavbarComponent);

// export
export default Navbar;
