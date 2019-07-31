import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { CircularProgress, withStyles } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import withMobileDialog from '@material-ui/core/withMobileDialog/withMobileDialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import List from '@material-ui/core/List';
import NotesIcon from '@material-ui/icons/Notes';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import InputAdornment from '@material-ui/core/InputAdornment';
import { HISTORY_TYPES, MAX_HISTORY, WATERED_TIMEOUT_RATE } from './constants';
import HistoryItem from './HistoryItem';

const styles = theme => ({
  paper: {
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px`,
    background: `linear-gradient(135deg, #38ef7d, #11998e)`,
    cursor: 'pointer',
    color: '#fff',
  },
  loading: {
    color: '#222',
    marginRight: '10px',
  },
  loadingWhite: {
    color: '#fff',
    marginRight: '10px',
  },
  close: {
    padding: theme.spacing.unit / 2,
  },
  moisture: {
    fontSize: '40px',
    fontFamily: theme.typography.fontFamily,
    padding: 0,
  },
  name: {
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'lighter',
    fontFamily: theme.typography.fontFamily,
  },
  button: {
    marginTop: 5,
    color: '#efefef',
  },
  historyEmptyText: {
    ...theme.typography.subtitle1,
    textAlign: 'center',
    color: theme.palette.text.secondary,
    padding: '20px 0 5px',
  },
});

class Plant extends Component {
  waterCheckTimeout = null;

  constructor(props) {
    super(props);

    this.state = {
      id: props.id,
      name: props.name,
      moisture: props.moisture,
      minMoisture: props.minMoisture,
      duration: props.duration,
      isWatering: false,
      isApplying: false,
      wateredMsgOpen: false,
      notificationOpen: false,
      notificationText: '',
      history: [],
      isLoadingHistory: false,
      openModal: false,
    };
  }

  componentDidMount() {
    this.props.socket.subscribe(`plant/${this.state.id}`, this.onUpdate);
    this.props.socket.subscribe(`plant/${this.state.id}/watered`, this.onWatered);
  }

  componentWillUnmount() {
    this.props.socket.unsubscribe(`plant/${this.state.id}`, this.onUpdate);
    this.props.socket.unsubscribe(`plant/${this.state.id}/watered`, this.onWatered);
  }

  onWatered = () => {
    clearTimeout(this.waterCheckTimeout);

    this.setState(prevState => ({
      notificationOpen: true,
      notificationText: `${this.state.name} was watered`,
      isWatering: false,
      history: [
        {
          data: { type: HISTORY_TYPES.WATERED },
          date: Date.now() / 1000,
        },
        ...prevState.history,
      ],
    }));
  };

  onUpdate = data => {
    const newState = { ...data };
    const historyData = { type: HISTORY_TYPES.SETTINGS_CHANGED };

    if (data.minMoisture) {
      historyData.oldMoisture = this.state.minMoisture;
      historyData.newMoisture = data.minMoisture;
    }

    if (data.duration) {
      historyData.oldDuration = this.state.duration;
      historyData.newDuration = data.duration;
    }

    if (Object.keys(historyData).length > 1) {
      newState.history = [
        {
          data: historyData,
          date: Date.now() / 1000,
        },
        ...this.state.history.slice(0, MAX_HISTORY - 1),
      ];
    }

    if (this.state.isApplying) {
      newState.isApplying = false;
      newState.notificationOpen = true;
      newState.notificationText = `Settings for ${this.state.name} were updated`;
    }

    this.setState(newState);
  };

  handleWaterClick = e => {
    e.stopPropagation();

    this.setState({
      isWatering: true,
    });

    this.props.socket.sendJson(`plant/${this.state.id}/water`, true);

    this.waterCheckTimeout = setTimeout(() => {
      this.setState({
        isWatering: false,
        notificationOpen: true,
        notificationText: `Error: timeout for ${this.state.name} watering`,
      });
    }, this.state.duration * WATERED_TIMEOUT_RATE * 1000);
  };

  handleClick = (e) => {
    e.preventDefault();

    this.setState({
      openModal: true,
      isLoadingHistory: true,
    });

    window.user
      .fetch(`/plant/${this.state.id}/history`)
      .then(({ history }) => this.setState({
        isLoadingHistory: false,
        history,
      }))
      .catch(e => {
        this.setState({
          isLoadingHistory: false,
        });

        throw e;
      });
  };

  handleModalClose = () => this.setState({
    openModal: false,
  });

  handleNotificationClose = () => this.setState({
    notificationOpen: false,
  });

  handleChange = name => event => {
    this.setState({ [name]: parseInt(event.target.value) });
  };

  handleApply = (e) => {
    e.preventDefault();

    this.setState({
      isApplying: true,
    });

    this.props.socket.sendJson(`plant/${this.state.id}/set`, {
      minMoisture: this.state.minMoisture,
      duration: this.state.duration,
    });
  };

  static formatDate = date => new Date(date * 1000).toLocaleString();

  render() {
    const { name, moisture } = this.state;
    const { classes, fullScreen } = this.props;
    const { isApplying, isLoadingHistory, duration, openModal, isWatering, minMoisture, history, notificationOpen, notificationText } = this.state;

    let historyItems;

    if (isLoadingHistory) {
      historyItems = <CircularProgress size={54} thickness={5} className={classes.loading}/>;
    } else if (history.length) {
      historyItems = (
        <List>
          {history.map(historyItem =>
            <HistoryItem key={historyItem.date} name={name} data={historyItem} formatDate={Plant.formatDate}/>,
          )}
        </List>
      );
    } else {
      historyItems = (
        <div className={classes.historyEmptyText}>
          <NotesIcon/>
          History is empty
        </div>
      );
    }

    return (
      <React.Fragment>
        <Grid item lg={4} md={6} sm={6} xs={12}>
          <Paper className={classes.paper} elevation={1} onClick={this.handleClick}>
            <div className={classes.name}>
              {name}
            </div>

            <Grid container spacing={8}>
              <Grid item xs={5}>
                <div className={classes.moisture}>
                  {moisture}%
                </div>
              </Grid>
              <Grid item xs>
                <Button color="default"
                        variant="outlined"
                        fullWidth={true}
                        className={classes.button}
                        onClick={this.handleWaterClick}>
                  {isWatering ? 'Watering...' : 'Water'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Dialog open={openModal} onClose={this.handleModalClose}
                fullWidth
                fullScreen={fullScreen}
                aria-labelledby="history-title">
          <DialogTitle id="history-title">{name}</DialogTitle>
          <DialogContent>
            <form onSubmit={this.handleApply}>
              <Grid container spacing={16}>
                <Grid item sm={6} xs={12}>
                  <TextField
                    id="min-moisture"
                    label="Min Moisture"
                    value={minMoisture}
                    onChange={this.handleChange('minMoisture')}
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
                    value={duration}
                    onChange={this.handleChange('duration')}
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
                  {isApplying &&
                  <CircularProgress size={19} thickness={5} className={classes.loadingWhite}/>}
                  Apply
                </Button>
              </FormControl>
            </form>

            {historyItems}

          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleModalClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          open={notificationOpen}
          autoHideDuration={5000}
          onClose={this.handleNotificationClose}
          ContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">{notificationText}</span>}
          action={[
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              className={classes.close}
              onClick={this.handleNotificationClose}
            >
              <CloseIcon/>
            </IconButton>,
          ]}
        />
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(withMobileDialog()(Plant));