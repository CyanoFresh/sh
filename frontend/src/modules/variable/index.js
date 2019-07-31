import React, { Component } from 'react';
import clsx from 'clsx';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { CircularProgress, withStyles } from '@material-ui/core';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import DialogActions from '@material-ui/core/DialogActions';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Paper from '@material-ui/core/Paper';

const MAX_HISTORY_SECONDS = 259200;   // 3 days

const styles = theme => ({
  paper: {
    padding: theme.spacing(1.5, 3),
    borderRadius: theme.shape.borderRadius * 2,
    cursor: 'pointer',
    transition: '.5s',
  },
  name: {
    ...theme.typography.h6,
    flexGrow: 1,
    fontWeight: 'lighter',
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
  'color-red': {
    background: `linear-gradient(135deg, #ff6d00, #ff4081)`,
  },
  'color-blue': {
    background: `linear-gradient(135deg, #9575cd, #1976d2)`,
  },
  'color-purple': {
    background: `linear-gradient(135deg, #ba68c8, #5e35b1)`,
  },
  'color-light_blue': {
    background: `linear-gradient(135deg, #4db6ac, #0288d1)`,
  },
  variableName: {
    fontSize: '16px',
    fontWeight: 'lighter',
    fontFamily: theme.typography.fontFamily,
  },
  variableValue: {
    fontSize: '40px',
    fontFamily: theme.typography.fontFamily,
  },
  formControl: {
    margin: theme.spacing(),
    minWidth: 120,
  },
});

class Variable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      id: props.id,
      name: props.name,
      value: props.value,
      suffix: props.suffix,
      prefix: props.prefix,
      color: props.color,
      lastUpdate: props.lastUpdate,
      openModal: false,
      history: [],
      historyPeriod: '6_hours',
      isLoadingHistory: false,
    };
  }

  componentDidMount() {
    this.props.core.subscribe(`variable/${this.state.id}`, this.onUpdate);
  }

  componentWillUnmount() {
    this.props.core.unsubscribe(`variable/${this.state.id}`, this.onUpdate);
  }

  onUpdate = (data) => {
    this.setState(({ history }) => {
      const now = Date.now() / 1000;

      // Remove old history
      history = history.filter(historyItem => historyItem.date - now <= MAX_HISTORY_SECONDS);

      history.push({
        date: now,
        value: data,
      });

      return {
        value: data,
        history,
      };
    });
  };

  handleClick = () => {
    this.setState({
      openModal: true,
    });

    return this.loadHistory(this.state.historyPeriod);
  };

  loadHistory = async (period = '6_hours') => {
    this.setState({
      isLoadingHistory: true,
    });

    try {
      const { history } = await window.user.fetch(`/variable/${this.props.id}/history?period=${period}`);

      this.setState({
        isLoadingHistory: false,
        history,
      });
    } catch (e) {
      this.setState({
        isLoadingHistory: false,
      });

      throw e;
    }
  };

  handleClose = () => this.setState({
    openModal: false,
  });

  handleHistoryPeriodChange = e => {
    this.setState({
      historyPeriod: e.target.value,
    });

    return this.loadHistory(e.target.value);
  };

  render() {
    const { name, prefix, suffix, value, lastUpdate } = this.state;
    const { fullScreen, classes } = this.props;

    let color = this.state.color;
    const outdatedValue = lastUpdate && Date.now() / 1000 - lastUpdate > 3600;  // if value was not updated for last hour

    if (outdatedValue || !value) {
      color = 'grey';
    }

    return (
      <Grid item sm={6} xs={12}>
        <Paper className={clsx(classes.paper, classes[`color-${color}`])} onClick={this.handleClick}>
          <Grid container alignContent="space-between">
            <Grid item className={classes.name}>
              {name}
            </Grid>
            <Grid item className={classes.value}>
              {prefix}{this.state.value}{suffix}
            </Grid>
          </Grid>
        </Paper>

        <Dialog open={this.state.openModal} fullScreen={fullScreen} fullWidth={true} maxWidth={'md'}
                onClose={this.handleClose}
                aria-labelledby="simple-dialog-title">
          <DialogTitle id="simple-dialog-title">{name}</DialogTitle>
          <DialogContent>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="historyPeriod">Period</InputLabel>
              <Select
                value={this.state.historyPeriod}
                onChange={this.handleHistoryPeriodChange}
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

            {this.state.isLoadingHistory
              ? <CircularProgress/>
              : <ResponsiveContainer aspect={2}>
                <AreaChart data={this.state.history}>
                  <XAxis dataKey="date"
                         tickFormatter={value => new Date(value * 1000).toLocaleTimeString()}/>
                  <YAxis domain={['dataMin - 3', 'dataMax + 3']}/>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <Tooltip labelFormatter={value => new Date(value * 1000).toLocaleString()}/>
                  <Legend/>
                  <Area type="monotone" dataKey="value" stroke="red" name={name} unit={suffix}/>
                </AreaChart>
              </ResponsiveContainer>}
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    );
  }
}

export default withStyles(styles)(withMobileDialog()(Variable));