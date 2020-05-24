import React, { useEffect, useState } from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
  },
  full: {
    padding: theme.spacing(10, 0),
  },
  small: {
    padding: theme.spacing(1, 0),
  },
  hidden: {
    opacity: 0,
  },
}));

/**
 * @param {("full"|"small")} variant
 * @param delay
 * @param size
 * @param thickness
 */
export default ({ delay = 1000, size = 100, thickness = 2.6, variant = 'full' }) => {
  const classes = useStyles();
  const [show, setShow] = useState(!Boolean(delay));

  useEffect(() => {
    if (delay) {
      const timer = setTimeout(() => setShow(true), delay);

      return () => clearTimeout(timer);
    }
  });

  // TODO: show
  return (
    <div className={clsx(classes.root, classes[variant], {
      [classes.hidden]: !show,
    })}>
      <CircularProgress size={size} thickness={thickness}/>
    </div>
  );
}
