import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core';

const styles = theme => ({
  switchButton: {
    '&:active': {
      boxShadow: theme.shadows[2],
    },
  },
});

class Switch extends Component {
  state = {};

  constructor(props) {
    super(props);

    this.state = {
      state: props.state,
      name: props.name,
      id: props.id,
    };
  }

  componentDidMount() {
    this.props.socket.subscribe(`switch/${this.state.id}`, this.onUpdate);
  }

  componentWillUnmount() {
    this.props.socket.unsubscribe(`switch/${this.state.id}`, this.onUpdate);
  }

  onUpdate = newState => this.setState({
    state: newState,
  });

  handleClick = () => this.props.socket.sendJson(`switch/${this.state.id}/set`, !this.state.state);

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
        </Button>
      </Grid>
    );
  }
}

export default withStyles(styles)(Switch);