// react
import React from "react";
import { useAppSelector } from "../../redux/hooks";
// mui
import withStyles, { StyleRules } from "@mui/styles/withStyles";
import { Card, CardHeader, Divider, Theme, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";

// main
const UserBalance = withStyles((theme: Theme): StyleRules => ({
  paper: {
    backgroundColor: 'none',
  },
  text: {
    padding: `5px 20px`,
    color: grey['50'],
  },
  title: {
    '&.MuiCardHeader-root': {
      padding: 10,
      paddingLeft: 15,
    },
    alignSelf: 'start',
  },
  header: {
    fontSize: '.5em',
    padding: 0,
    alignSelf: 'end',
    '&.MuiCardHeader-root': {
      alignSelf: 'end',
      padding: '10px',
    },
    '& .MuiTypography-root': {
      textAlign: 'end',
    },
  },
}))(({ classes }: any) => {
  // state
  const userAmount = useAppSelector(s => s.userAmount);

  return (
    <Card className={`${classes.paper} flexcol`} elevation={0}>
      
      <CardHeader
        className={`${classes.title}`}
        title={<Typography fontSize="1.1em">User</Typography>}
      />
      <Divider orientation="horizontal" flexItem />
      <CardHeader
        className={`${classes.header} flexcol`}
        title={<Typography fontSize="2.1em">{userAmount}</Typography>}
        subheader={<Typography component={'div'} justifySelf='flex-end' fontSize="1.75em" color={grey["600"]}>$RATIO</Typography>}
      />
    </Card>
  );
});

export default UserBalance;