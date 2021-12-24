// react
import React from "react";
// mui
import withStyles, { StyleRules } from "@mui/styles/withStyles";
import { Button, Divider, Theme, Typography } from "@mui/material";
import { grey, teal } from "@mui/material/colors";
// web3
import { WalletMultiButton } from "@solana/wallet-adapter-material-ui";
import Balances from "./Balances";
// components
// interfaces
// component
const RatioLogo = withStyles((theme: Theme): StyleRules => ({
  Button: {
    minHeight: "70px",
    // maxWidth: "300px",
    minWidth: "100%",
    display: "flex",
  },
  text: {
    padding: `0 5px`,
    // color: grey['50'],
    textTransform: 'none',
    color: grey['800'],
    fontSize: '40px',
  },
}))(({ classes }: any) => {

  return (
    <Button
      className={`${classes.Button} flexcol`}
      variant="text"
    >
      <Typography component="div" fontSize={'2em'} className={`${classes.text}`}>
        Ratio
      </Typography>
    </Button>
  );
});

/**
 * Navbar
 */
const Navbar = withStyles((theme: Theme): StyleRules => ({
  Navbar: {
    // backgroundColor: "#939393",
    minHeight: "70px",
    width: "100%",
    minWidth: "100%",
    display: "flex",
    // borderBottom: `1px solid `,
  },
  mainNav: {},
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
    maxWidth: "200px",
    margin: '0 20px',
    // @ts-ignore
    width: "100%",
    display: "flex",
  },
  divider: {
    '&.MuiDivider-root': {
      backgroundColor: 'rgba(200, 200, 200, 0.12)',
      borderColor: 'rgba(200, 200, 200, 0.12)',
    },
    backgroundColor: 'rgba(200, 200, 200, 0.12)',
    borderColor: 'rgba(200, 200, 200, 0.12)',
    maxWidth: '90%',
    width: '90%',
    minWidth: '90%',
  },
}))(({ classes }: any) => {
  
  return (
    <>
      <div className={`${classes.Navbar} w100 flexcol`}>
        <div className={`${classes.mainNav} h100 flexrow coreElem`}>
          <RatioLogo />
          <WalletMultiButton className={`${classes.Button} flexcol`} />
        </div>
      </div>
      <Divider className={`${classes.divider}`}/>
    </>
  );
});

// export
export default Navbar;
