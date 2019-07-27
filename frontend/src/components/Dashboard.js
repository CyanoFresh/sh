import React, { Component } from 'react';
import core from '../core';

class Dashboard extends Component {
  state = {
    loading: true,
    error: null,
  };

  componentDidMount() {
    console.log('Dashboard mount', this.props);

    this.load();
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.location === this.props.location) {
      return;
    }

    console.log('Dashboard update', this.props, prevProps);

    this.load();
  };

  load = async () => {
    this.setState({
      loading: true,
    });

    const dashboardId = this.props.match.params.dashboard || 'main';

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

      return this.setState({
        loading: false,
        error: null,
        ...res.data,
      });
    } catch (e) {
      this.setState({
        loading: false,
        error: 'Cannot fetch dashboard data',
      });
    }
  };

  render() {
    const { match } = this.props;

    if (this.state.loading) {
      return 'Loading...';
    } else if (this.state.error) {
      return this.state.error;
    }

    return <React.Fragment>
      <h1>Dashboard {match.params.dashboard}</h1>
      {this.state.items.map(room => <div key={room.id}>{room.name}</div>)}
    </React.Fragment>;
  }
}

export default Dashboard;