import { IocContext } from 'power-di';
import { Odux, OduxConfig } from '../core';
import { BaseAction } from '../action/BaseAction';
import { IStoreAdapter } from '../interface';

export function createOdux(config?: OduxConfig, reduxStore?: any) {
  config = {
    ...new OduxConfig,
    ...(config || {}),
  };
  const odux = new Odux(config);
  BaseAction.GlobalAdapters.push(odux);
  config.iocContext.register(odux, Odux);
  config.iocContext.register(odux, IStoreAdapter);
  odux.initStores();
  if (reduxStore) {
    odux.setReduxStore(reduxStore);
  }
  return odux;
}

import { createStore, applyMiddleware, compose, Store } from 'redux';
export function createOduxAIO(config?: OduxConfig, middlewares: any[] = []) {
  config = {
    ...new OduxConfig,
    ...(config || {}),
  };
  const odux = createOdux(config);

  const composeEnhancers =
    config.devMode &&
      typeof window === 'object' &&
      (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
      (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      }) : compose;

  const enhancer = composeEnhancers(
    applyMiddleware(...middlewares),
  );
  const store = createStore(odux.mainReducer.bind(odux), enhancer);

  odux.setReduxStore(store);

  return odux;
}
