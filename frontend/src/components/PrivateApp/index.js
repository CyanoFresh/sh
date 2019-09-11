import React, { useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import MenuIcon from '@material-ui/icons/Menu';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import core from '../../core';
import Dashboard from './Dashboard';
import NoMatch from '../NoMatch';
import Users from './Users';
import DrawerContent from './DrawerContent';

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  drawer: {
    [theme.breakpoints.up('md')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  drawerPaper: {
    width: drawerWidth,
  },
  title: {
    flexGrow: 1,
    fontFamily: 'Product Sans',
    fontWeight: 'normal',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1),
    },
  },
  toolbar: theme.mixins.toolbar,
}));

const PrivateApp = ({ history }) => {
  const classes = useStyles();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const open = Boolean(anchorEl);

  const logOut = async () => {
    await Promise.all([
      core.auth.signOut(),
      core.disconnect(),
    ]);

    history.push('/');
  };

  useEffect(() => {
    const onConnect = async () => {
      console.log('Socket connected');
    };

    core.connect();

    core.socket.on('connect', onConnect);

    return () => {
      core.socket.off('connect', onConnect);
    };
  }, []);

  function handleMenu(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  function handleDrawerToggle() {
    setMobileOpen(!mobileOpen);
  }

  return (
    <div className={classes.root}>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            onClick={handleDrawerToggle}
            color="inherit"
            aria-label="open drawer"
          >
            <MenuIcon/>
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            Solomaha Home
          </Typography>
          <div>
            <IconButton
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle/>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={open}
              onClose={handleClose}
              PaperProps={{
                style: {
                  width: 200,
                },
              }}
            >
              <MenuItem disabled divider>Logged in as {core.auth.userData.name}</MenuItem>
              <MenuItem onClick={logOut}>Log Out</MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      <nav className={classes.drawer} aria-label="mailbox folders">
        <Hidden mdUp implementation="css">
          <Drawer
            variant="temporary"
            open={mobileOpen}
            anchor={theme.direction === 'rtl' ? 'right' : 'left'}
            onClose={handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            <DrawerContent onLogout={logOut}/>
          </Drawer>
        </Hidden>
        <Hidden smDown implementation="css">
          <Drawer
            classes={{
              paper: classes.drawerPaper,
            }}
            variant="permanent"
            open
          >
            <div className={classes.toolbar}/>
            <DrawerContent onLogout={logOut}/>
          </Drawer>
        </Hidden>
      </nav>

      <main className={classes.content}>
        <div className={classes.toolbar}/>

        <Switch>
          <Route path="/users" component={Users}/>
          <Route path="/:dashboard?" exact component={Dashboard}/>
          <Route component={NoMatch}/>
        </Switch>
      </main>
    </div>
  );
};

export default PrivateApp;
