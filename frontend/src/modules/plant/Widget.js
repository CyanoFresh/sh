import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(1.3, 2),
    borderRadius: theme.shape.borderRadius * 2,
    cursor: 'pointer',
    transition: '.5s',
    color: '#fff',
    background: 'linear-gradient(135deg, #3ff37b, #31d8bb)',
  },
  name: {
    ...theme.typography.h6,
    flexGrow: 1,
    fontWeight: 400,
  },
  value: {
    ...theme.typography.h6,
  },
}));

function Widget({ core, id, name, onClick, ...props }) {
  const classes = useStyles();

  const [moisture, setMoisture] = useState(props.moisture);

  useEffect(() => {
    console.log('Plant Widget effect');

    const onUpdate = (data) => {
      if (data.moisture) {
        setMoisture(data.moisture);
      }
    };

    core.subscribe(`plant/${id}`, onUpdate);

    return () => {
      core.unsubscribe(`plant/${id}`, onUpdate);
    };
  }, [id, core]);

  return (
    <Grid item sm={6} xs={12}>
      <Paper className={classes.paper} onClick={onClick}>
        <Grid container alignContent="space-between">
          <Grid item className={classes.name}>
            {name}
          </Grid>
          <Grid item className={classes.value}>
            {moisture}%
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
}

export default Widget;
