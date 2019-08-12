import React, { useEffect } from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import core from '../core';
import Dashboard from './Dashboard';
import NoMatch from './NoMatch';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import MenuIcon from '@material-ui/icons/Menu';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import LogoutIcon from '@material-ui/icons/ExitToApp';
import DashboardList from './DrawerDashboardList';
import Hidden from '@material-ui/core/Hidden';

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root: {
    // flexGrow: 1,
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    // marginLeft: drawerWidth,
    // [theme.breakpoints.up('sm')]: {
    //   width: `calc(100% - ${drawerWidth}px)`,
    // },
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
  drawer: {
    // width: drawerWidth,
    // flexShrink: 0,
    [theme.breakpoints.up('sm')]: {
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
    // height: '100vh',
    // overflow: 'auto',
    padding: theme.spacing(3),
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

  const drawer = (
    <React.Fragment>
      <DashboardList/>
      <Divider/>
      <List>
        <ListItem button onClick={logOut}>
          <ListItemIcon><LogoutIcon/></ListItemIcon>
          <ListItemText primary="Logout"/>
        </ListItem>
      </List>
    </React.Fragment>
  );

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
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Hidden smUp implementation="css">
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
            {drawer}
          </Drawer>
        </Hidden>
        <Hidden xsDown implementation="css">
          <Drawer
            classes={{
              paper: classes.drawerPaper,
            }}
            variant="permanent"
            open
          >
            <div className={classes.toolbar}/>
            {drawer}
          </Drawer>
        </Hidden>
      </nav>

      <main className={classes.content}>
        <div className={classes.toolbar}/>

        <Switch>
          <Route path="/:dashboard?" exact component={Dashboard}/>
          <Route component={NoMatch}/>
        </Switch>
      </main>
    </div>
  );
};

export default PrivateApp;
