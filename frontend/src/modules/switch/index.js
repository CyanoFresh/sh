import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core';

const styles = theme => ({
  button: {
    '&:active': {
      boxShadow: theme.shadows[2],
    },
  },
});

class Switch extends Component {
  constructor(props) {
    super(props);

    this.state = {
      state: props.state,
      name: props.name,
      id: props.id,
    };
  }

  componentDidMount() {
    this.props.core.subscribe(`switch/${this.state.id}`, this.onUpdate);
  }

  componentWillUnmount() {
    console.log(this.props);
    this.props.core.unsubscribe(`switch/${this.state.id}`, this.onUpdate);
  }

  onUpdate = state => this.setState({ state });

  handleClick = () => this.props.core.publishJson(`switch/${this.state.id}/toggle`);

  render() {
    const { state, name } = this.state;
    const { classes } = this.props;

    return (
      <Grid item lg={4} md={6} sm={6} xs={12}>
        <Button
          color={state ? 'primary' : 'default'}
          variant="contained"
          className={classes.button}
          fullWidth={true}
          size="large"
          onClick={this.handleClick}
        >
          {name}
        </Button>
      </Grid>
    );
  }
}

export default withStyles(styles)(Switch);
