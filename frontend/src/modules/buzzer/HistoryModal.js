import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import React, { useMemo, useState } from 'react';
import { CircularProgress } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import Avatar from '@material-ui/core/Avatar';
import CallIcon from '@material-ui/icons/PhoneInTalk';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import { HISTORY_TYPES, HISTORY_TYPES_LABELS } from './constants';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';

const HistoryItems = ({ id, name, open, onClose, core }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useMemo(() => {
    const loadHistory = async () => {
      setIsLoading(true);

      try {
        const response = await core.authenticatedRequest({
          url: `/buzzer/${id}/history`,
          responseType: 'json',
          method: 'get',
        });

        setIsLoading(false);

        if (!response.data.ok) {
          return setError('Wrong server response');
        }

        setError(null);
        setData(response.data.history);
      } catch (e) {
        setIsLoading(false);
        setError('Cannot load history');

        console.error(e);
      }
    };

    loadHistory();
  }, [
    id,
    core,
  ]);

  let history = (
    <Box bgcolor="text.secondary" color="background.paper" p={2}>
      History is empty
    </Box>
  );

  if (isLoading) {
    history = <div><CircularProgress/></div>;
  } else if (error) {
    history = (
      <Box bgcolor="error.main" color="background.paper" p={2}>
        {error}
      </Box>
    );
  } else if (data && data.length) {
    history = (
      <List>
        {data.map(historyItem =>
          <ListItem key={historyItem.date}>
            <ListItemAvatar>
              <Avatar>
                {historyItem.type === HISTORY_TYPES.RINGING ? <CallIcon/> : <LockOpenIcon/>}
              </Avatar>
            </ListItemAvatar>

            <ListItemText
              primary={`${name} was ${HISTORY_TYPES_LABELS[historyItem.type]}`}
              secondary={new Date(historyItem.date * 1000).toLocaleString()}
            />
          </ListItem>,
        )}
      </List>
    );
  }

  return history;
};

const HistoryModal = ({ id, name, open, onClose, core }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth={'md'}
      aria-labelledby="buzzer-dialog-title"
    >
      <DialogTitle id="buzzer-dialog-title">History of {name}</DialogTitle>
      <DialogContent>
        <HistoryItems id={id} name={name} core={core}/>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HistoryModal;
