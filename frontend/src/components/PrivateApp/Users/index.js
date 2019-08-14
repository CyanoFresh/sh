import React from 'react';
import PrivateRoute from '../../PrivateRoute';
import Users from './Users';
import User from './User';

export default ({ match }) => {
  return (
    <React.Fragment>
      <PrivateRoute path={`${match.path}/:userId`} component={User} />
      <PrivateRoute path={match.path} exact component={Users} />
    </React.Fragment>
  );
};
