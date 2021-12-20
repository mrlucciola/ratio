import withStyles from "@mui/styles/withStyles";
import { Button, Typography } from "@mui/material";
import { blue, blueGrey, grey } from "@mui/material/colors";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { setWithdraw } from "../redux/reducer";
import { DepositButtonStyles } from "./DepositButton";

// main
const WithdrawButton = withStyles(DepositButtonStyles)(({ classes }: any) => {
  // state
  const action = useAppSelector(s => s.action);
  const dispatch = useAppDispatch();

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
});

export default WithdrawButton;
