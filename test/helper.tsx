import test from 'ava';
import * as render from 'react-test-renderer';
import { createStore, applyMiddleware, compose, Store } from 'redux';
import { BaseStore } from '../lib';
import { createOdux, createOduxAIO, helper } from '../lib';
const { registerStore, getIOCComponent } = helper;

test('odux simple.', (t) => {
  const finalCreateStore: any = compose()(createStore);

  @registerStore()
  class AStore extends BaseStore {

  }

  const odux = createOdux();
  const rootReducer = odux.mainReducer.bind(odux);
  const store = finalCreateStore(rootReducer);
  odux.setReduxStore(store);

  t.true(getIOCComponent<AStore>(AStore) instanceof AStore);
});

test('odux simple AIO.', (t) => {
  @registerStore()
  class AStore extends BaseStore {

  }

  const odux = createOduxAIO();

  t.true(getIOCComponent<AStore>(AStore) instanceof AStore);
});
