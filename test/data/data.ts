import { createStore, applyMiddleware, compose, Store } from 'redux';
import { BaseStore, bindProperty, Odux } from '../../lib';

export const adapter = new Odux(undefined, { dispatchDelay: -1 });
const finalCreateStore: any = compose(applyMiddleware(...[]))(createStore);
const rootReducer = adapter.mainReducer.bind(adapter);
export const store = finalCreateStore(rootReducer);
adapter.setReduxStore(store);
