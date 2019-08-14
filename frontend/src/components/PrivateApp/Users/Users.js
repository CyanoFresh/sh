import React from 'react';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Person from '@material-ui/icons/Person';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { Link } from 'react-router-dom';
import useFetch from '../../../core/useFetch';
import Loading from '../Loading';

export default ({ match }) => {
  const [{ data, isLoading, error }] = useFetch(
    {
      url: '/users',
      method: 'GET',
      responseType: 'json',
    },
    [],
  );

  if (isLoading) {
    return <Loading/>;
  }

  if (error) {
    return (
      <Box bgcolor="error.main" color="background.paper" p={2}>
        {error}
      </Box>
    );
  }

  console.log(data);

  return (
    <List>
      {data.users.map(user => (
        <ListItem button key={user.id} component={Link} to={`${match.url}/${user.id}`}>
          <ListItemIcon>
            <Person/>
          </ListItemIcon>
          <ListItemText primary={user.name + ' — ' + user.user_id} secondary={user.room_id}/>
        </ListItem>
      ))}
    </List>
  );
};
