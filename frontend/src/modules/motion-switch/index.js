import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import MotionIcon from '@material-ui/icons/WifiTethering';
import Tooltip from '@material-ui/core/Tooltip';

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
    this.props.core.subscribe(`motion-switch/${this.state.id}`, this.onStateUpdate);
    this.props.core.subscribe(`motion-switch/${this.state.id}/motion`, this.onMotionUpdate);
  }

  componentWillUnmount() {
    this.props.core.unsubscribe(`motion-switch/${this.state.id}`, this.onStateUpdate);
    this.props.core.unsubscribe(`motion-switch/${this.state.id}/motion`, this.onMotionUpdate);
  }

  onStateUpdate = state => this.setState({ state });
  onMotionUpdate = motionEnabled => this.setState({ motionEnabled });

  handleClick = () => this.props.core.publishJson(`motion-switch/${this.state.id}/toggle`);
  // handleMotionClick = () => this.props.core.publishJson(`motion-switch/${this.state.id}/motion/toggle`); // TODO
  handleMotionClick = () => this.props.core.publishJson(`motion-switch/${this.state.id}/motion/set`, !this.state.motionEnabled);

  render() {
    const { state, motionEnabled, name } = this.state;

    return (
      <Grid item lg={4} md={6} sm={6} xs={12}>
        <ButtonGroup
          variant="contained"
          size="large"
          color={(state && motionEnabled) ? 'primary' : 'default'}
          fullWidth={true}
        >
          <Button
            color={state ? 'primary' : 'default'}
            onClick={this.handleClick}
          >
            {name}
          </Button>

          <Tooltip title="Toggle motion-enabled light" aria-label="toggle">
            <Button
              color={motionEnabled ? 'primary' : 'default'}
              onClick={this.handleMotionClick}
            >
              <MotionIcon/>
            </Button>
          </Tooltip>
        </ButtonGroup>
      </Grid>
    );
  }
}

export default withStyles(styles)(MotionSwitch);
