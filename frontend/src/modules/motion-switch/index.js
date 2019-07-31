import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core';
import Switch from '@material-ui/core/Switch';

const styles = theme => ({
  switchButton: {
    '&:active': {
      boxShadow: theme.shadows[2],
    },
  },
  colorSwitchBase: {
    height: 'auto',
  },
});

class MotionSwitch extends Component {
  constructor(props) {
    super(props);

    this.state = {
      state: props.state,
      motionEnabled: props.motionEnabled,
      name: props.name,
      id: props.id,
    };
  }

  componentDidMount() {
    this.props.socket.subscribe(`motion-switch/${this.state.id}`, this.onStateUpdate);
    this.props.socket.subscribe(`motion-switch/${this.state.id}/motion`, this.onMotionUpdate);
  }

  componentWillUnmount() {
    this.props.socket.unsubscribe(`motion-switch/${this.state.id}`, this.onStateUpdate);
    this.props.socket.unsubscribe(`motion-switch/${this.state.id}/motion`, this.onMotionUpdate);
  }

  onStateUpdate = state => this.setState({ state });
  onMotionUpdate = motionEnabled => this.setState({ motionEnabled });

  handleClick = () => this.props.socket.sendJson(`motion-switch/${this.state.id}/set`, !this.state.state);
  handleMotionClick = () => this.props.socket.sendJson(`motion-switch/${this.state.id}/motion/set`, !this.state.motionEnabled);

  render() {
    const { state, name } = this.state;
    const { classes } = this.props;

    return (
      <Grid item lg={4} md={6} sm={6} xs={12}>
        <Button color={state ? 'primary' : 'default'}
                variant="contained"
                className={classes.switchButton}
                fullWidth={true}
                onClick={this.handleClick}>
          {name}
          <Switch
            checked={this.state.motionEnabled}
            classes={{
              switchBase: classes.colorSwitchBase,
            }}
            onChange={this.handleMotionClick}
            onClick={e => e.stopPropagation()}
            value="checkedB"
            color="default"
          />
        </Button>
      </Grid>
    );
  }
}

export default withStyles(styles)(MotionSwitch);