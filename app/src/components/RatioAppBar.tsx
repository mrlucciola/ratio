import React, { useState } from 'react';
import withStyles from "@mui/styles/withStyles";
import { AppBar, Box, Button, IconButton, Menu, MenuItem, Theme, Toolbar, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { styled, StyleRules } from "@mui/styles";
import { Menu as MenuIcon } from "@mui/icons-material";
import { grey } from '@mui/material/colors';
import { setAction } from '../redux/reducer';

const StyledToolbar = styled(Toolbar)(({ theme }: any) => ({
  // alignItems: 'flex-start',
  paddingTop: '0.2em',
  paddingBottom: '1em',
  '&.MuiToolbar-root': {
    // height: 80,
  },
  // Override media queries injected by theme.mixins.toolbar
  '@media all': {
    // minHeight: 128,
  },
}));

// main
const RatioAppBar = withStyles((theme: Theme): StyleRules => ({
  RatioAppBar: {},
  box: {
    '& .MuiPaper-root': {
      backgroundColor: '#555'
    },
  },
}))(({ classes }: any) => {
  // init hooks
  const dispatch = useAppDispatch();
  // state
  const action = useAppSelector(s => s.action);
  const [anchorElem, setAnchorElem] = useState<any>();
  const open = Boolean(anchorElem);
  // event handlers
  const handleClick = (e: any) => {
    setAnchorElem(e.currentTarget);
  };
  const handleClose = (e: any) => {
    setAnchorElem(null);
    dispatch(setAction(e.currentTarget.innerText));
  };
  // logic
  let path;
  switch (action) {
    case 'Mint':
      path = '$RATIO -> Pool';
      break;
    case 'Withdraw':
      path = 'Pool -> $RATIO -> User';
      break;
    case 'Deposit':
      path = 'User -> $RATIO -> Pool';
      break;
    default:
      break;
  }

  return (
    <Box sx={{ flexGrow: 1 }} className={`${classes.box} w100`}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={handleClick}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorElem}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            <MenuItem defaultValue='Deposit' value="Deposit" onClick={handleClose}>Deposit</MenuItem>
            <MenuItem defaultValue='Withdraw' value="Withdraw" onClick={handleClose}>Withdraw</MenuItem>
            <MenuItem defaultValue='Mint' value="Mint" onClick={handleClose}>Mint</MenuItem>
          </Menu>
          <Typography
            variant="h5"
            noWrap
            component="div"
            sx={{ flexGrow: 1, alignSelf: 'center' }}
          >
            {action}
          </Typography>
          <Button style={{color: grey['300']}}>
            {path}
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
});

export default RatioAppBar;
