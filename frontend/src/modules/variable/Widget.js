import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import clsx from 'clsx';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(1.3, 2),
    borderRadius: theme.shape.borderRadius * 2,
    cursor: 'pointer',
    transition: '.5s',
    color: '#fff',
  },
  name: {
    ...theme.typography.h6,
    flexGrow: 1,
    fontWeight: 400,
  },
  value: {
    ...theme.typography.h6,
  },
  'color-default': {
    background: `#fff`,
    color: '#222',
    '& variableName': {
      color: '#222',
      fontSize: '16px',
      fontWeight: 'lighter',
      fontFamily: theme.typography.fontFamily,
    },
  },
  'color-grey': {
    background: `#e2e2e2`,
    color: '#aeaeae',
    '& variableName': {
      color: '#AEAEAE',
      fontSize: '16px',
      fontWeight: 'lighter',
      fontFamily: theme.typography.fontFamily,
    },
  },
  'color-light_blue': {
    background: `linear-gradient(135deg, #4db6ac, #0288d1)`,
  },
  'color-blue': {
    background: `linear-gradient(135deg, #9575cd, #1976d2)`,
  },
  'color-purple': {
    background: `linear-gradient(135deg, #ba68c8, #5e35b1)`,
  },
  'color-red': {
    background: `linear-gradient(135deg, #ff6d00, #ff4081)`,
  },
}));

const OUTDATED_VALUE_INTERVAL = 3600;

const Widget = ({ color, lastUpdate, name, onClick, prefix, suffix, value }) => {
  const classes = useStyles();

  const isOutdatedValue = lastUpdate && Date.now() / 1000 - lastUpdate > OUTDATED_VALUE_INTERVAL;  // if value was not updated for last hour

  let colorVariant = color;

  if (isOutdatedValue || !value) {
    colorVariant = 'grey';
  }

  return (
    <Grid item sm={6} xs={12}>
      <Paper className={clsx(classes.paper, classes[`color-${colorVariant}`])} onClick={onClick}>
        <Grid container alignContent="space-between">
          <Grid item className={classes.name}>
            {name}
          </Grid>
          <Grid item className={classes.value}>
            {prefix}{value}{suffix}
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
};

export default Widget;