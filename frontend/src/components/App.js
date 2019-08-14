import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import PrivateRoute from './PrivateRoute';
import SignIn from './SignIn';
import PrivateApp from './PrivateApp';
import NoMatch from './NoMatch';

function App() {
  return (
    <Router>
      <CssBaseline/>
      <Switch>
        <Route path="/login" exact component={SignIn}/>
        <PrivateRoute path="/" component={PrivateApp}/>
        <Route component={NoMatch}/>
      </Switch>
    </Router>
  );
}

export default App;
