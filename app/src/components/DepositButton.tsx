import withStyles, { StyleRules } from "@mui/styles/withStyles";
import { Button, Typography, Theme } from "@mui/material";
import { blue, blueGrey, grey } from "@mui/material/colors";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { setDeposit } from "../redux/reducer";

export const DepositButtonStyles = (theme: Theme): StyleRules => ({
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
const DepositButton = withStyles(DepositButtonStyles)(({ classes }: any) => {
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
});
export default DepositButton;