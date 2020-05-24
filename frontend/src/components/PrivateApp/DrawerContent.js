import React from 'react';
import DashboardList from './DrawerDashboardList';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { Link } from 'react-router-dom';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import UsersIcon from '@material-ui/icons/People';
import ListItemText from '@material-ui/core/ListItemText';
import LogoutIcon from '@material-ui/icons/ExitToApp';

export default ({ onLogout }) => {
  return <React.Fragment>
    <DashboardList/>
    <Divider/>
    <List>
      <ListItem button component={Link} to={`/users`}>
        <ListItemIcon><UsersIcon/></ListItemIcon>
        <ListItemText primary="Users"/>
      </ListItem>
      <ListItem button onClick={onLogout}>
        <ListItemIcon><LogoutIcon/></ListItemIcon>
        <ListItemText primary="Logout"/>
      </ListItem>
    </List>
  </React.Fragment>;
}
