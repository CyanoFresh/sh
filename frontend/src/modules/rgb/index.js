import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core';
import RGBDialog from './Dialog';
import { MODE } from './constants';

const styles = {
  rgbButton: {
    'border-width': '2px',
    '&:hover': {
      'border-width': '2px',
    }
  },
};

class Rgb extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: props.name,
      id: props.id,
      mode: props.mode,
      red: props.red,
      green: props.green,
      blue: props.blue,
      brightness: props.brightness,
      speed: props.speed,
      open: false,
    };
  }

  componentDidMount() {
    this.props.socket.subscribe(`rgb/${this.state.id}`, this.onUpdate);
  }

  componentWillUnmount() {
    this.props.socket.unsubscribe(`rgb/${this.state.id}`, this.onUpdate);
  }

  onUpdate = (data) => this.setState({
    ...data,
  });

  update = (id, newState) => {
    this.props.socket.sendJson(`rgb/${id}/set`, newState);
  };

  handleButtonClick = () => {
    this.setState({
      open: true,
    });
  };

  handleClose = () => {
    this.setState({
      open: false,
    });
  };

  render() {
    const { mode, red, green, blue, name, open } = this.state;
    const { classes } = this.props;
    const isOn = mode === MODE.RAINBOW || (mode === MODE.COLOR && (red !== 0 || green !== 0 || blue !== 0));

    return (
      <Grid item lg={4} md={6} sm={6} xs={12}>
        <Button color={isOn ? 'primary' : 'default'}
                variant={'outlined'}
                fullWidth={true}
                className={classes.rgbButton}
                onClick={this.handleButtonClick}>
          {name}
        </Button>

        <RGBDialog open={open} onClose={this.handleClose} update={this.update} {...this.state}/>
      </Grid>
    );
  }
}

export default withStyles(styles)(Rgb);