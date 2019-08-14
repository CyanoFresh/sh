import React, { useEffect, useState } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core';
import { HISTORY_TYPES, HISTORY_TYPES_LABELS } from './constants';

const useStyles = makeStyles(theme => ({
  close: {
    padding: theme.spacing(0.5),
  },
}));

export default ({ id, name, core, isRinging }) => {
  const classes = useStyles();

  const [isRingingOpen, setIsRingingOpen] = useState(isRinging);
  const [msg, setMsg] = useState({
    open: false,
    text: null,
  });

  useEffect(() => {
    console.log('Noti effetct');

    const onUnlocked = (data) => {
      const label = HISTORY_TYPES_LABELS[data ? HISTORY_TYPES.AUTO_UNLOCKED : HISTORY_TYPES.UNLOCKED];

      setIsRingingOpen(false);
      setMsg({
        text: `${name} was ${label}`,
        open: true,
      });
    };

    const onAutoUnlockUpdate = (data) => {
      let text = `Auto-unlock was disabled for ${name}`;

      if (data) {
        text = `${name} will be auto-unlocked for 5 min`;
      }

      setMsg({
        open: true,
        text,
      });
    };

    core.subscribe(`buzzer/${id}/ringing`, setIsRingingOpen);
    core.subscribe(`buzzer/${id}/unlocked`, onUnlocked);
    core.subscribe(`buzzer/${id}/auto_unlock`, onAutoUnlockUpdate);

    return () => {
      core.unsubscribe(`buzzer/${id}/ringing`, setIsRingingOpen);
      core.unsubscribe(`buzzer/${id}/unlocked`, onUnlocked);
      core.unsubscribe(`buzzer/${id}/auto_unlock`, onAutoUnlockUpdate);
    };
  }, [id, name, core]);

  const handleMsgClose = () => setMsg({
    open: false,
    text: null,
  });

  // const handleRingingClose = () => setIsRingingOpen(false);

  const handleUnlock = () => core.publishJson(`buzzer/${id}/unlock`, true);

  return (
    <React.Fragment>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        open={msg.open}
        autoHideDuration={5000}
        onClose={handleMsgClose}
        message={msg.text}
        action={[
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            className={classes.close}
            onClick={handleMsgClose}
          >
            <CloseIcon/>
          </IconButton>,
        ]}
      />

      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        open={isRingingOpen}
        // onClose={handleRingingClose}
        message={<span id="message-id">{name} is ringing</span>}
        action={[
          <Button
            key="undo"
            color="secondary"
            size="small"
            onClick={handleUnlock}
          >
            UNLOCK
          </Button>,
        ]}
      />
    </React.Fragment>
  );
}
