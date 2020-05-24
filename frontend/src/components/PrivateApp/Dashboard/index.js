import React, { useEffect, useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import core from '../../../core';
import Room from './Room';
import Loading from '../Loading';

const Dashboard = (props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const onConnect = async () => {
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
        setError(e.message);
      }
    };

    const onDisconnect = () => {
      console.log('Dashboard socket offline');

      setIsLoading(true);
    };

    core.on('connect', onConnect);
    core.on('disconnect', onDisconnect);

    if (core.socket && core.socket.connected) {
      onConnect();
    }

    return () => {
      core.off('connect', onConnect);
      core.off('disconnect', onDisconnect);
    };
  }, [props.match.params.dashboard]);

  if (isLoading) {
    return <Loading/>;
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
