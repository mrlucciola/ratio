// react
import React, {FC} from "react";
// mui
import withStyles, { StyleRules } from "@mui/styles/withStyles";
import { Theme } from "@mui/material";
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import grey from "@mui/material/colors/grey";
// interfaces

// constants
const columnCount = 4;
const xs = 12 / columnCount;

// component
interface FooterHeaderProps {
  classes?: any,
  text?: string,
}
const FooterHeaderStyles = (theme: Theme): StyleRules => ({
  header: {
    alignSelf: 'flex-start',
    color: 'whitesmoke',
  },
});
const FooterHeaderComponent: FC<FooterHeaderProps> = ({ classes, text }) => {
  return (
    <Typography className={`${classes.header}`} variant="subtitle2">{text}</Typography>
  );
}
const FooterHeader = withStyles(FooterHeaderStyles)(FooterHeaderComponent);

// component
interface FooterLinkProps {
  text?: string,
}
const FooterLinkStyles = (theme: Theme): StyleRules => ({});
const FooterLinkComponent: FC<FooterLinkProps> = ({ text }) => {
  return (
    <Typography noWrap color="grey.100" variant="caption">{text}</Typography>
  );
}
const FooterLink = withStyles(FooterLinkStyles)(FooterLinkComponent);

/**
 * main
 */
interface FooterProps {
  classes?: any;
}
const FooterStyles = (theme: Theme): StyleRules => ({
  footerContainer: {
    backgroundColor: grey[600],
  },
  Footer: {
    '&.MuiPaper-root': {
      backgroundColor: 'transparent',
    },
  },
  columnLinks: {
    position: 'relative',
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    margin: 0,
  },
  copyright: {},
  container: {
    '&.MuiContainer-root': {
      display: 'flex',
      flexFlow: 'column',
    },
  },
 });
const FooterComponent: FC<FooterProps> = ({ classes }) => {
  const column1 = (
    <Grid direction="column" flexWrap="nowrap" alignSelf="flex-start" item xs={xs}>
      <FooterHeader text="Company" />
      <ul className={`${classes.columnLinks} flexcol`}>
        <FooterLink text={"About us"} />
        <FooterLink text={"Mission"} />
        <FooterLink text={"Support"} />
        <FooterLink text={"Careers"} />
        <FooterLink text={"Investors & Advisors"} />
        <FooterLink text={"Partners"} />
      </ul>
    </Grid>
  );
  const column2 = (
    <Grid direction="column" flexWrap="nowrap" alignSelf="flex-start" item xs={xs}>
      <FooterHeader text="Platform" />
      <ul className={`${classes.columnLinks} flexcol`}>
        <FooterLink text={"Documentation"} />
        <FooterLink text={"Developer Portal"} />
        <FooterLink text={"Marketing"} />
        <FooterLink text={"Consulting"} />
      </ul>
    </Grid>
  );
  const column3 = (
    <Grid direction="column" flexWrap="nowrap" alignSelf="flex-start" item xs={xs}>
      <FooterHeader text="Social" />
      <ul className={`${classes.columnLinks} flexcol`}>
        <FooterLink text={"Discord"} />
        <FooterLink text={"Twitter"} />
        <FooterLink text={"Instagram"} />
      </ul>
    </Grid>
  );
  const column4 = (
    <Grid direction="column" flexWrap="nowrap" alignSelf="flex-start" item xs={xs}>
      <FooterHeader text="Legal" />
      <ul className={`${classes.columnLinks} flexcol`}>
        <FooterLink text={"Terms"} />
        <FooterLink text={"Privacy"} />
      </ul>
    </Grid>
  );

  return (
    <Stack className={`${classes.footerContainer} w100 flexcol`}>
      <div className={`${classes.Footer} coreElem`} >
        <Container className={`${classes.container} flexcol`} maxWidth="md">
          <Toolbar className={`w100`}>
            {column1}
            {column2}
            {column3}
            {column4}
          </Toolbar>
          <Typography className={`${classes.copyright}`} variant="caption" color="grey.300">
            &copy; 2021 Ratio-Test
          </Typography>
        </Container>
      </div>
    </Stack>
  );
};
const Footer = withStyles(FooterStyles)(FooterComponent);

export default Footer;
