// react
import React from "react";
// mui
import withStyles, { StyleRules } from "@mui/styles/withStyles";
import { Stack, Theme } from "@mui/material";

interface IProps {
  classes?: any;
}

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
    </Stack>
  );
};
const App = withStyles(AppStyles)(AppComponent);

export default App;
