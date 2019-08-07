import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { CircularProgress, withStyles } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import clsx from 'clsx';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import withMobileDialog from '@material-ui/core/withMobileDialog/withMobileDialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Avatar from '@material-ui/core/Avatar';
import CallIcon from '@material-ui/icons/PhoneInTalk';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import ListItemText from '@material-ui/core/ListItemText';

const styles = theme => ({
  paper: {
    ...theme.mixins.gutters(),
    padding: `14px ${theme.spacing(2)}px 18px`,
    transition: 0.5,
    background: 'linear-gradient(45deg, #66B6F8, #5983E8)',
    color: '#fff',
  },
  isRinging: {
    background: 'linear-gradient(-45deg, red, #ff9100)',
  },
  loading: {
    color: '#fff',
    marginRight: '10px',
  },
  close: {
    padding: theme.spacing(0.5),
  },
  button: {
    color: '#fff',
    border: '1px solid rgba(255, 255, 255, 0.4)',
  },
  title: {
    ...theme.typography.h6,
    color: '#fff',
    fontSize: 16,
    fontWeight: 'lighter',
    paddingBottom: 8,
  },
});

class Buzzer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      id: props.id,
      name: props.name,
      isRinging: props.isRinging,
      history: [],
      isLoadingHistory: false,
      openHistoryModal: false,
      unlockedMsgOpen: false,
      ringingMsgOpen: props.isRinging,
    };
  }

  componentDidMount() {
    this.props.core.subscribe(`buzzer/${this.state.id}/ringing`, this.onRinging);
    this.props.core.subscribe(`buzzer/${this.state.id}/unlocked`, this.onUnlocked);
  }

  componentWillUnmount() {
    this.props.core.unsubscribe(`buzzer/${this.state.id}/ringing`, this.onRinging);
    this.props.core.unsubscribe(`buzzer/${this.state.id}/unlocked`, this.onUnlocked);
  }

  onRinging = isRinging => {
    this.setState(prevState => {
      const newState = {
        ringingMsgOpen: isRinging,
        isRinging,
      };

      if (isRinging) {
        newState.history = [
          {
            date: JSON.stringify(new Date()),
            type: 'ringing',
          },
          ...prevState.history,
        ];
      }

      return newState;
    });
  };

  onUnlocked = () => {
    this.setState(prevState => ({
      isRinging: false,
      ringingMsgOpen: false,
      unlockedMsgOpen: true,
      history: [
        {
          date: JSON.stringify(new Date()),
          type: 'unlocked',
        },
        ...prevState.history,
      ],
    }));
  };

  handleUnlockClick = () => {
    this.props.core.socket.publish(
      `buzzer/${this.state.id}/unlock`,
      JSON.stringify(true),
    );

    this.setState({
      ringingMsgOpen: false,
    });
  };

  handleHistoryClick = () => {
    this.setState({
      isLoadingHistory: true,
    });

    // window.user.fetch(`/buzzer/${this.state.id}/history`)
    //   .then(({ history }) => {
    //     this.setState({
    //       isLoadingHistory: false,
    //       openHistoryModal: true,
    //       history,
    //     });
    //   })
    //   .catch(e => {
    //     this.setState({
    //       isLoadingHistory: false,
    //     });
    //
    //     throw e;
    //   });
  };

  handleHistoryClose = () => this.setState({
    openHistoryModal: false,
  });

  handleUnlockedNotiClose = () => this.setState({
    unlockedMsgOpen: false,
  });

  handleRingingNotiClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    this.setState({
      ringingMsgOpen: false,
    });
  };

  render() {
    const { name, isRinging, openHistoryModal, unlockedMsgOpen, ringingMsgOpen, history, isLoadingHistory } = this.state;
    const { classes, fullScreen } = this.props;

    const paperClassname = clsx(classes.paper, isRinging && classes.isRinging);

    return (
      <React.Fragment>
        <Grid item lg={4} md={6} sm={6} xs={12}>
          <Paper className={paperClassname} elevation={1}>
            <div className={classes.title}>
              {name}
            </div>

            <Grid container spacing={8}>
              <Grid item xs>
                <Button color="default"
                        variant="outlined"
                        fullWidth={true}
                        className={classes.button}
                        onClick={this.handleUnlockClick}>
                  Unlock
                </Button>
              </Grid>

              <Grid item xs>
                <Button color="default"
                        variant="outlined"
                        fullWidth={true}
                        className={classes.button}
                        onClick={this.handleHistoryClick}>
                  {isLoadingHistory && <CircularProgress size={19} thickness={5} className={classes.loading}/>} History
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Dialog open={openHistoryModal} onClose={this.handleHistoryClose}
                fullWidth
                fullScreen={fullScreen}
                aria-labelledby="history-title">
          <DialogTitle id="history-title">{name}</DialogTitle>
          <DialogContent>
            {history.length
              ? <List>
                {history.map(historyItem =>
                  <ListItem key={historyItem.date}>
                    <Avatar>
                      {historyItem.type === 'ringing' ? <CallIcon/> : <LockOpenIcon/>}
                    </Avatar>

                    <ListItemText primary={`${name} was ${historyItem.type}`}
                                  secondary={new Date(JSON.parse(JSON.stringify(historyItem.date))).toLocaleString()}/>
                  </ListItem>,
                )}
              </List>
              : 'History is empty'}
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleHistoryClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          open={unlockedMsgOpen}
          autoHideDuration={5000}
          onClose={this.handleUnlockedNotiClose}
          ContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">{name} was unlocked</span>}
          action={[
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              className={classes.close}
              onClick={this.handleUnlockedNotiClose}
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
          open={ringingMsgOpen}
          onClose={this.handleRingingNotiClose}
          ContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">{name} is ringing</span>}
          action={[
            <Button key="undo" color="secondary" size="small" onClick={this.handleUnlockClick}>
              UNLOCK
            </Button>,
          ]}
        />
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(withMobileDialog()(Buzzer));
