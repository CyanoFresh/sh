import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import core from './core';
import * as serviceWorker from './serviceWorker';

window.sh = core;

ReactDOM.render(<App/>, document.getElementById('root'));

serviceWorker.unregister();
