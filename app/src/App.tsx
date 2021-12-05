// react
import React from "react";
// mui
import withStyles, { StyleRules } from "@mui/styles/withStyles";
import { Stack, Theme } from "@mui/material";
// components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Body from "./components/Body";

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

const AppComponent: React.FC<IProps> = ({ classes }) => {
  return (
    <Stack className={`${classes.App}`}>
      <NavAndBody />
      <Footer />
    </Stack>
  );
};
const App = withStyles(AppStyles)(AppComponent);

export default App;
