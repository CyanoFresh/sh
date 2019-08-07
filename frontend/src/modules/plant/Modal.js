import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Button from '@material-ui/core/Button';
import { CircularProgress, makeStyles } from '@material-ui/core';
import DialogActions from '@material-ui/core/DialogActions';
import React, { useEffect, useState } from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import List from '@material-ui/core/List';
import HistoryItem from './HistoryItem';
import { useTheme } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';

const useStyles = makeStyles(theme => ({
  form: {
    marginBottom: theme.spacing(2),
  },
}));

const History = ({ core, id, ...props }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    console.log('Plant Dialog ()');

    const loadHistory = async () => {
      setIsLoading(true);

      try {
        const response = await core.authenticatedRequest({
          url: `/plant/${id}/history`,
          responseType: 'json',
          method: 'get',
        });

        console.log(response.data);

        setIsLoading(false);

        if (!response.data.ok) {
          return setError('Wrong server response');
        }

        setError(null);
        setHistory(response.data.history);
      } catch (e) {
        setIsLoading(false);
        setError('Cannot load history');

        console.error(e);
      }
    };

    loadHistory();
  }, [core, id]);

  if (isLoading) {
    return <div><CircularProgress/></div>;
  } else if (error) {
    return (
      <Box bgcolor="error.main" color="background.paper" p={2}>
        {error}
      </Box>
    );
  } else if (history.length) {
    return (
      <List>
        {history.map(historyItem => <HistoryItem key={historyItem.date} name={props.name} data={historyItem}/>)}
      </List>
    );
  }

  return (
    <Box bgcolor="text.secondary" color="background.paper" p={2}>
      History is empty
    </Box>
  );
};

export default ({ core, ...props }) => {
  const classes = useStyles();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [inputs, setInputs] = useState({
    minMoisture: props.minMoisture,
    duration: props.duration,
  });

  const onSubmit = (e) => {
    e.preventDefault();

    core.socket.publish(
      `plant/${props.id}/set`,
      JSON.stringify(inputs),
    );
  };
  const onChange = name => event => {
    setInputs({
      ...inputs,
      [name]: parseInt(event.target.value),
    });
  };
  const onWaterClick = () => {
    core.socket.publish(
      `plant/${props.id}/water`,
      JSON.stringify(true),
    );
  };

  useEffect(() => {
    const onUpdate = (data) => {
      if (data.minMoisture) {
        setInputs({
          ...inputs,
          minMoisture: data.minMoisture,
        });
      }

      if (data.duration) {
        setInputs({
          ...inputs,
          duration: data.duration,
        });
      }
    };

    core.subscribe(`plant/${props.id}`, onUpdate);

    return () => {
      core.unsubscribe(`plant/${props.id}`, onUpdate);
    };
  }, [core, props.id]);

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      fullWidth
      fullScreen={fullScreen}
      aria-labelledby="history-title"
    >
      <DialogTitle id="history-title">{props.name}</DialogTitle>
      <DialogContent>
        <form onSubmit={onSubmit} className={classes.form}>
          <Grid container spacing={2}>
            <Grid item sm={6} xs={12}>
              <TextField
                id="min-moisture"
                label="Min Moisture"
                value={inputs.minMoisture}
                onChange={onChange('minMoisture')}
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  inputProps: { min: 1, max: 100 },
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
                margin="normal"
                required
              />
            </Grid>
            <Grid item sm={6} xs={12}>
              <TextField
                id="duration"
                label="Duration of watering"
                value={inputs.duration}
                onChange={onChange('duration')}
                type="number"
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">sec.</InputAdornment>,
                  inputProps: { min: 1, max: 60 },
                }}
                fullWidth
                margin="normal"
                required
              />
            </Grid>
            <Grid item sm={6}>
              <Button type="submit" color="primary" variant="contained" fullWidth>
                Apply
              </Button>
            </Grid>
            <Grid item sm={6}>
              <Button onClick={onWaterClick} color="secondary" variant="contained" fullWidth>
                Water now
              </Button>
            </Grid>
          </Grid>
        </form>

        <History core={core} {...props} />

      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
