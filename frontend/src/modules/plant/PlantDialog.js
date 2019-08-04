import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import { CircularProgress, makeStyles } from '@material-ui/core';
import DialogActions from '@material-ui/core/DialogActions';
import React, { useState } from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import List from '@material-ui/core/List';
import HistoryItem from './HistoryItem';
import { useTheme } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';

const useStyles = makeStyles(theme => ({
  formControl: {
    marginBottom: theme.spacing(2),
    width: '50%',
  },
}));

// TODO
function PlantDialog(props) {
  const classes = useStyles();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  let History;

  if (isLoading) {
    History = <div><CircularProgress/></div>;
  } else if (error) {
    History = (
      <Box bgcolor="error.main" color="background.paper" p={2}>
        {error}
      </Box>
    );
  } else if (history.length) {
    History = (
      <List>
        {history.map(historyItem => <HistoryItem key={historyItem.date} name={props.name} data={historyItem}/>)}
      </List>
    );
  } else {
    History = (
      <Box bgcolor="text.secondary" color="background.paper" p={2}>
        History is empty
      </Box>
    );
  }

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
        <form onSubmit={onSubmit}>
          <Grid container spacing={16}>
            <Grid item sm={6} xs={12}>
              <TextField
                id="min-moisture"
                label="Min Moisture"
                value={props.minMoisture}
                onChange={onChange}
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
                value={props.duration}
                onChange={onChange}
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
          </Grid>
          <FormControl margin="normal" fullWidth>
            <Button type="submit" color="primary" variant="contained">
              {isApplying && <CircularProgress size={19} thickness={5} className={classes.loadingWhite}/>}
              Apply
            </Button>
          </FormControl>
        </form>

        {History}

      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PlantDialog;
