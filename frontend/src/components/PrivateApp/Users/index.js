import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Users from './Users';
import User from './User';
import Grid from '@material-ui/core/Grid';
import CreateUser from './CreateUser';

export default ({ match }) => {
  return (
    <React.Fragment>
      <Grid container spacing={4}>
        <Route path={match.path} exact component={Users}/>
        <Switch>
          <Route path={`${match.path}/create`} component={CreateUser}/>
          <Route path={`${match.path}/:userId`} component={User}/>
        </Switch>
      </Grid>
    </React.Fragment>
  );
};
