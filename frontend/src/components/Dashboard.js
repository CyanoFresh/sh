import React, { Component } from 'react';
import core from '../core';
import Room from './Room';
import Grid from '@material-ui/core/Grid';

class Dashboard extends Component {
  state = {
    loading: true,
    error: null,
  };

  componentDidMount() {
    this.load();
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.location === this.props.location) {
      return;
    }

    this.load();
  };

  load = async () => {
    this.setState({
      loading: true,
    });

    const dashboardId = this.props.match.params.dashboard || 'main';

    console.log(`Loading dashboard data for id ${dashboardId}...`);

    try {
      const res = await core.authenticatedRequest({
        url: `/dashboard/${dashboardId}`,
        method: 'get',
        responseType: 'json',
      });

      if (!res.data.ok) {
        return this.setState({
          loading: false,
          error: 'Invalid dashboard data',
        });
      }

      console.log(res.data);

      await core.loadModules(res.data.modules);

      return this.setState({
        loading: false,
        error: null,
        ...res.data,
      });
    } catch (e) {
      return this.setState({
        loading: false,
        error: 'Cannot fetch dashboard data',
      });
    }
  };

  render() {
    if (this.state.loading) {
      return 'Loading...';
    } else if (this.state.error) {
      return this.state.error;
    }

    return (
      <Grid container spacing={2}>
        {this.state.items.map(room => <Room key={room.id} {...room}/>)}
      </Grid>
    );
  }
}

export default Dashboard;