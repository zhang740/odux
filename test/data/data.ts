import { createStore, applyMiddleware, compose, Store } from 'redux';
import { Odux } from '../../lib';

export const adapter = new Odux({ dispatchDelay: -1 });
const finalCreateStore: any = compose(applyMiddleware(...[]))(createStore);
const rootReducer = adapter.mainReducer.bind(adapter);
export const store = finalCreateStore(rootReducer);
adapter.setReduxStore(store);
