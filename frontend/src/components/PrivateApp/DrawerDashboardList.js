import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';
import React from 'react';
import { Dashboard } from '@material-ui/icons';
import { Link } from 'react-router-dom';
import useFetch from '../../core/useFetch';
import Loading from './Loading';
import Box from '@material-ui/core/Box';

export default () => {
  const [{ data, isLoading, error }] = useFetch(
    {
      url: '/dashboards',
      method: 'GET',
      responseType: 'json',
    },
    [],
  );

  if (isLoading) {
    return <Loading size={35} thickness={3} variant="small"/>;
  }

  if (error) {
    return (
      <Box p={2}>
        {error}
      </Box>
    );
  }

  return <List>
    {data.dashboards.map((dashboard) => (
      <ListItem button key={dashboard.id} component={Link} to={`/${dashboard.id}`}>
        <ListItemIcon><Dashboard/></ListItemIcon>
        <ListItemText primary={dashboard.name}/>
      </ListItem>
    ))}
  </List>;
};
