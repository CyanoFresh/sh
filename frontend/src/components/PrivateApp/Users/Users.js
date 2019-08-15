import React from 'react';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Person from '@material-ui/icons/Person';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core';
import useFetch from '../../../core/useFetch';
import Loading from '../Loading';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2, 3),
  },
  header: {
    // padding: theme.spacing(2,2,0,2),
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

export default ({ match }) => {
  const classes = useStyles();
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

  return (
    <Grid item md={6}>
      <Paper className={classes.paper}>
        <div className={classes.header}>
          <Typography variant="h5" component="h3">
            Users
          </Typography>
        </div>
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
      </Paper>

      <Fab
        color="primary"
        aria-label="add"
        className={classes.fab}
        component={Link}
        to="/users/create"
      >
        <AddIcon />
      </Fab>
    </Grid>
  );
};
