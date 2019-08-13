import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import clsx from 'clsx';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import CallEnd from '@material-ui/icons/CallEnd';
import LockOpen from '@material-ui/icons/LockOpen';
import { red } from '@material-ui/core/colors';

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(1.3, 2),
    borderRadius: theme.shape.borderRadius * 2,
    cursor: 'pointer',
    transition: '.5s',
    background: '#fff',
  },
  isRinging: {
    background: '#2196f3',
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
  actions: {
    display: 'flex',
  },
  unlockBtn: {
    flexGrow: 1,
    marginRight: theme.spacing(),
  },
  hangUpBtn: {
    background: red[600],
    '&:hover': {
      background: red[700],
    },
  },
}));

function Widget({ core, id, name, onClick, ...props }) {
  const classes = useStyles();

  const [isAutoUnlock, setIsAutoUnlock] = useState(props.isAutoUnlock);
  const [isRinging, setIsRinging] = useState(props.isRinging);

  useEffect(() => {
    const onRinging = (data) => {
      setIsRinging(data);
    };

    const onUnlocked = () => {
      setIsRinging(false);
    };

    const onAutoUnlockUpdate = (data) => {
      setIsAutoUnlock(data);
    };

    core.subscribe(`buzzer/${id}/ringing`, onRinging);
    core.subscribe(`buzzer/${id}/unlocked`, onUnlocked);
    core.subscribe(`buzzer/${id}/auto_unlock`, onAutoUnlockUpdate);

    return () => {
      core.unsubscribe(`buzzer/${id}/ringing`, onRinging);
      core.unsubscribe(`buzzer/${id}/unlocked`, onUnlocked);
      core.unsubscribe(`buzzer/${id}/auto_unlock`, onAutoUnlockUpdate);
    };
  }, [id]);

  const handleAutoUnlockChange = e => core.publishJson(`buzzer/${id}/auto_unlock/set`, e.target.checked);

  const handleUnlockClick = unlock => (e) => {
    e.stopPropagation();

    core.publishJson(`buzzer/${id}/unlock`, unlock);
  };

  let controls;

  if (isRinging) {
    controls = (
      <Grid item xs={6}>
        <div className={classes.actions}>
          <Button variant="contained" color="primary" className={classes.unlockBtn} onClick={handleUnlockClick(true)}>
            <LockOpen/>
          </Button>
          <Button variant="contained" color="secondary" className={classes.hangUpBtn}
                  onClick={handleUnlockClick(false)}>
            <CallEnd/>
          </Button>
        </div>
      </Grid>
    );
  } else {
    controls = (
      <div onClick={e => e.stopPropagation()}>
      <FormControlLabel
        control={
          <Switch checked={isAutoUnlock} onChange={handleAutoUnlockChange} value="checkedA"/>
        }
        label="Auto"
      />
    </div>
    );
  }

  return (
    <Grid item sm={6} xs={12}>
      <Paper
        className={clsx(classes.paper, {
          [classes.isRinging]: isRinging,
        })}
        onClick={onClick}
      >
        <Grid container alignContent="space-between">
          <Grid item className={classes.name}>
            {name}
          </Grid>
          {controls}
        </Grid>
      </Paper>
    </Grid>
  );
}

export default Widget;
