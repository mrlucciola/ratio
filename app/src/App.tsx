// react
import React from "react";
// mui
import withStyles, { StyleRules } from "@mui/styles/withStyles";
import { Stack, Theme } from "@mui/material";
// components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

interface IProps {
  classes?: any;
}

const NavBarStyles = (theme: Theme): StyleRules => ({
  NavBar: {
    minHeight: "100vh",
    justifyContent: "start",
  },
});
const NavBarComponent: React.FC<IProps> = ({ classes }) => {
  return (
    <Stack className={`${classes.NavBar} w100 flexcol`}>
      <Navbar />
    </Stack>
  );
};
const NavBar = withStyles(NavBarStyles)(NavBarComponent);

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

const AppComponent: React.FC<IProps> = ({ classes }) => {
  return (
    <Stack className={`${classes.App}`}>
      <NavBar />
      <Footer />
    </Stack>
  );
};
const App = withStyles(AppStyles)(AppComponent);

export default App;
