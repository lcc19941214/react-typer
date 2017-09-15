import React from 'react';
import ReactDOM from 'react-dom';
import './style/index.less';
import Typer from './typer';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<Typer />, document.getElementById('root'));
registerServiceWorker();
