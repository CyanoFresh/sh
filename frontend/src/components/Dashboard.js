import React, { useEffect, useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';
import core from '../core';
import Room from './Room';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    'justify-content': 'center',
    'align-items': 'center',
    paddingTop: '100px',
  },
  progress: {
    margin: theme.spacing(2),
  },
}));

const Dashboard = (props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rooms, setRooms] = useState([]);
  const classes = useStyles();

  useEffect(() => {
    console.log('Dashboard effect');

    const onConnect = async () => {
      console.log('Dashboard socket connect');

      setIsLoading(true);

      const dashboardId = props.match.params.dashboard || 'main';

      console.log(`Loading dashboard data for id ${dashboardId}...`);

      try {
        const res = await core.authenticatedRequest({
          url: `/dashboard/${dashboardId}`,
          method: 'get',
          responseType: 'json',
        });

        if (!res.data.ok) {
          setIsLoading(false);
          setError('Invalid dashboard data');
          return;
        }

        console.log(res.data);

        await core.loadModules(res.data.modules);

        setIsLoading(false);
        setError(null);
        setRooms(res.data.items);
      } catch (e) {
        setIsLoading(false);
        setError(e);
      }
    };

    const onDisconnect = () => {
      console.log('Dashboard socket offline');

      setIsLoading(true);
    };

    core.on('connect', onConnect);
    core.on('disconnect', onDisconnect);

    return () => {
      core.off('connect', onConnect);
      core.off('disconnect', onDisconnect);
    };
  });

  if (isLoading) {
    return (
      <div className={classes.root}>
        <CircularProgress className={classes.progress} size={100} thickness={2.6}/>
      </div>
    );
  } else if (error) {
    return (
      <Box bgcolor="error.main" color="background.paper" p={2}>
        {error}
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {rooms.map(room => <Room key={room.id} {...room}/>)}
    </Grid>
  );
};

export default Dashboard;