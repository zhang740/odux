import { Odux, OduxConfig } from '../core';

function mergeConfig(config?: OduxConfig) {
  return {
    ...new OduxConfig(),
    ...(config || {}),
  };
}

export function createOdux(config?: OduxConfig, reduxStore?: any) {
  config = mergeConfig(config);
  const odux = new Odux(config);

  if (reduxStore) {
    odux.setReduxStore(reduxStore);
  }
  odux.initStores();
  return odux;
}

import { createStore, applyMiddleware, compose } from 'redux';
export function createOduxAIO(config?: OduxConfig, middlewares: any[] = [], enhancers: any[] = []) {
  config = mergeConfig(config);
  const odux = new Odux(config);

  const composeEnhancers =
    config.devMode &&
    typeof window === 'object' &&
    (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
      : compose;

  const enhancer = composeEnhancers(applyMiddleware(...middlewares), ...enhancers);
  const store = createStore(odux.mainReducer.bind(odux), enhancer);

  odux.setReduxStore(store);
  odux.initStores();
  return odux;
}

function combineReducer(odux: Odux, reducer: any) {
  return (state: any, action: any) => {
    return odux.mainReducer(reducer(state, action), action);
  };
}

export function createOduxEnhancer(config?: OduxConfig) {
  const odux = createOdux(config);
  return (createStore: any) => (reducer: any, preloadedState: any, enhancer: any) => {
    const rootReducer = combineReducer(odux, reducer);
    const store = createStore(rootReducer, preloadedState, enhancer);
    const dispatch = store.dispatch;
    odux.setReduxStore(store);
    return {
      ...store,
      dispatch,
    };
  };
}

export function createOduxForDva(config?: OduxConfig) {
  const odux = createOdux(config);
  return {
    extraEnhancers: [
      (createStore: any) => (reducer: any, preloadedState: any, enhancer: any) => {
        const store = createStore(reducer, preloadedState, enhancer);
        const dispatch = store.dispatch;
        odux.setReduxStore(store);
        return {
          ...store,
          dispatch,
        };
      },
    ],
    onReducer: (reducer: any) => {
      return combineReducer(odux, reducer);
    },
  };
}
