import test from 'ava';
import * as render from 'react-test-renderer';
import { createStore, applyMiddleware, compose, Store } from 'redux';
import { BaseStore } from '../lib';
import { createOdux, createOduxAIO, registerStore, connect, getComponent } from '../lib/simple';

test('odux simple.', (t) => {
  const finalCreateStore: any = compose()(createStore);

  @registerStore()
  class AStore extends BaseStore {

  }

  const odux = createOdux();
  odux.initStores();
  const rootReducer = odux.mainReducer.bind(odux);
  const store = finalCreateStore(rootReducer);
  odux.setReduxStore(store);

  t.true(getComponent<AStore>(AStore) instanceof AStore);
});

test('odux simple AIO.', (t) => {
  const finalCreateStore: any = compose()(createStore);

  @registerStore()
  class AStore extends BaseStore {

  }

  const odux = createOduxAIO();
  odux.initStores();

  t.true(getComponent<AStore>(AStore) instanceof AStore);
});
