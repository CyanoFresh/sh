import React, { Component } from 'react';
import {
  Route,
  Link,
  Switch,
} from 'react-router-dom';
import core from '../core';
import Dashboard from './Dashboard';
import NoMatch from './NoMatch';

class PrivateApp extends Component {
  componentDidMount() {
    console.log('PrivateApp mount');

    core.connect();

    core.socket.on('connect', this.onConnect);
  }

  componentWillUnmount() {
    console.log('PrivateApp unmount');

    core.socket.off('connect', this.onConnect);
  }

  onConnect = () => {
    console.log('Socket connected');
  };

  render() {
    let { history } = this.props;

    const logOut = async () => {
      await Promise.all([
        await core.auth.signOut(),
        await core.disconnect(),
      ]);

      history.push('/');
    };

    return <React.Fragment>
      <Link to={'/'}>Home Dashboard</Link>
      <Link to={'/1'}>Dashboard 1</Link>
      <button onClick={logOut}>Log Out</button>

      <Switch>
        <Route path="/:dashboard?" exact component={Dashboard}/>
        <Route component={NoMatch}/>
      </Switch>
    </React.Fragment>;
  }
}

export default PrivateApp;