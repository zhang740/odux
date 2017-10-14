import { Odux } from '../core/Odux';
import { OduxConfig } from '../core/OduxConfig';
import { BaseAction } from '../action/BaseAction';

export function createOdux(config?: OduxConfig) {
  const odux = new Odux(undefined, config);
  BaseAction.GlobalAdapters.push(odux);
  return odux;
}

import { createStore, applyMiddleware, compose, Store } from 'redux';
export function createOduxAIO(config: OduxConfig = {}, middlewares: any[] = []) {
  const odux = createOdux(config);

  const composeEnhancers =
    config.isDebug &&
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
