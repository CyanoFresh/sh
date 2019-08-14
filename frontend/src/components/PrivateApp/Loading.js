import React, { useEffect, useState } from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    'justify-content': 'center',
    'align-items': 'center',
    paddingTop: '100px',
  },
  hidden: {
    opacity: 0,
  },
});

export default ({ delay = 1000, size = 100, thickness = 2.6 }) => {
  const classes = useStyles();
  const [show, setShow] = useState(!delay);

  useEffect(() => {
    if (delay) {
      const timer = setTimeout(() => {
        setShow(true);
      }, delay);

      return () => {
        clearTimeout(timer);
      };
    }
  });

  // TODO: show
  return (
    <div className={classes.root}>
      <CircularProgress size={size} thickness={thickness}/>
    </div>
  );
}
