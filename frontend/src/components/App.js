import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import SignIn from './SignIn';
import PrivateApp from './PrivateApp';
import CssBaseline from '@material-ui/core/CssBaseline';

const NoMatch = () => <div className="NoMatch"><h1>404</h1></div>;

function App() {
  return (
    <Router>
      <CssBaseline/>
      <Switch>
        <Route path="/login" component={SignIn}/>
        <PrivateRoute path="/" component={PrivateApp}/>
        <Route component={NoMatch}/>
      </Switch>
    </Router>
  );
}

export default App;
