import { applyMiddleware, createStore, compose } from 'redux';
import promiseMiddleware from 'redux-promise';
import persistState from 'redux-localstorage';

import reducer from './reducer';

const enhancer = compose(
  applyMiddleware(promiseMiddleware),
  persistState(['page.project'])
);

export default createStore(reducer, enhancer);
