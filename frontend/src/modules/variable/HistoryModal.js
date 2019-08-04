import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import React, { useMemo, useState } from 'react';
import { CircularProgress } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { makeStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  formControl: {
    marginBottom: theme.spacing(2),
    width: '50%',
  },
}));

function HistoryContent({ id, core, name, suffix }) {
  const classes = useStyles();

  const [period, setPeriod] = useState('6_hours');
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useMemo(() => {
    const loadHistory = async () => {
      setIsLoading(true);

      try {
        const response = await core.authenticatedRequest({
          url: `/variable/${id}/history?period=${period}`,
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
    period,
    id,
    core,
  ]);

  let history;

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
      <ResponsiveContainer aspect={2}>
        <AreaChart data={data}>
          <XAxis dataKey="date"
                 tickFormatter={value => new Date(value * 1000).toLocaleTimeString()}/>
          <YAxis domain={['dataMin - 5', 'dataMax + 5']}/>
          <CartesianGrid strokeDasharray="3 3"/>
          <Tooltip labelFormatter={value => new Date(value * 1000).toLocaleString()}/>
          <Legend/>
          <Area type="monotone" dataKey="value" stroke="red" name={name} unit={suffix} isAnimationActive={false}/>
        </AreaChart>
      </ResponsiveContainer>
    );
  } else {
    history = (
      <Box bgcolor="text.secondary" color="background.paper" p={2}>
        No history for selected period
      </Box>
    );
  }

  return <>
    <FormControl className={classes.formControl}>
      <InputLabel htmlFor="historyPeriod">Period</InputLabel>
      <Select
        value={period}
        onChange={event => setPeriod(event.target.value)}
        inputProps={{
          name: 'historyPeriod',
          id: 'historyPeriod',
        }}
      >
        <MenuItem value="3_days">3 days</MenuItem>
        <MenuItem value="24_hours">24 hours</MenuItem>
        <MenuItem value="12_hours">12 hours</MenuItem>
        <MenuItem value="6_hours">6 hours</MenuItem>
        <MenuItem value="3_hours">3 hours</MenuItem>
      </Select>
    </FormControl>

    {history}
  </>;
}

const HistoryModal = ({ id, name, suffix, open, onClose, core }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return <Dialog open={open} fullScreen={fullScreen} fullWidth={true}
                 maxWidth={'md'}
                 onClose={onClose}
                 aria-labelledby="variable-dialog-title">
    <DialogTitle id="variable-dialog-title">History of {name}</DialogTitle>
    <DialogContent>
      <HistoryContent core={core} id={id} name={name} suffix={suffix}/>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">
        Close
      </Button>
    </DialogActions>
  </Dialog>;
};

export default HistoryModal;
