import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import core from '../core';

function PrivateRoute({ component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      render={props =>
        core.auth.isAuthenticated()
          ? <Component {...props} />
          : <Redirect to={{
            pathname: '/login',
            state: { from: props.location },
          }}/>
      }
    />
  );
}

export default PrivateRoute;