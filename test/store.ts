import test from 'ava';
import { BaseStore, Odux, DataSymbol } from '../lib';
import { IocContext } from 'power-di';
import { createStore, applyMiddleware, compose } from 'redux';

const iocContext = new IocContext();
const defaultOdux = new Odux({ dispatchDelay: -1, iocContext });
const finalCreateStore: any = compose(applyMiddleware(...[]))(createStore);
const rootReducer = defaultOdux.mainReducer.bind(defaultOdux);
const store = finalCreateStore(rootReducer);
defaultOdux.setReduxStore(store);

interface TestObject {
  num?: number;
}
class TestStore extends BaseStore {
  a_object: TestObject;
  test: string;
  new_value: any;
}

test('no store.', t => {
  const odux = new Odux({ dispatchDelay: -1 });
  t.throws(() => odux.getStoreData());
  odux.dispose();
});

const testStore = new TestStore(defaultOdux);
function initStore() {
  testStore.test = undefined;
  testStore.a_object = {};
  testStore.new_value = undefined;
}

test('base.', t => {
  t.true(TestStore.type === testStore.type);

  initStore();

  testStore.test = '111222';
  testStore.a_object = { num: 1 };
  const oldData = testStore[DataSymbol];
  testStore.transactionChange(() => {
    testStore.a_object.num = 2;
  });
  t.true(testStore[DataSymbol] !== oldData);
  t.true(testStore.test === oldData.test);
  t.true(testStore.a_object !== oldData.a_object);
  t.true(testStore.a_object.num !== oldData.a_object.num);
  t.true(testStore.a_object === testStore.a_object);

  testStore.transactionChange(() => {
    testStore.a_object.num = 5;
    t.true(testStore.a_object.num === 5);
    testStore.a_object.num = 9;
    t.true(testStore.a_object.num === 9);
  });
  t.true(testStore.a_object.num === 9);
});

test('new props.', t => {
  const oldData = testStore[DataSymbol];
  t.true(!oldData.new_value);
  testStore.transactionChange(() => {
    testStore.new_value = {};
  });
  t.true(!!testStore.new_value);
  t.true(!oldData.new_value);
  t.true(oldData !== testStore[DataSymbol]);
  t.true(oldData.new_value !== testStore.new_value);
});

test('get store.', t => {
  initStore();

  t.true(defaultOdux.getReduxStore() === store);
  t.true(testStore[DataSymbol] === defaultOdux.getStoreData(testStore.type));
});

test('error, redefined.', t => {
  t.throws(() => {
    new TestStore(defaultOdux);
  });
});

test('prefix.', t => {
  t.true(!!testStore.a_object);
  defaultOdux.setPrefix('__test__');
  t.true(!testStore.a_object);
  t.true(!testStore.a_object);
  defaultOdux.setPrefix('');
});

test('without tracking method.', t => {
  initStore();

  testStore.a_object = { num: 1 };
  const oldData = testStore[DataSymbol];

  testStore.a_object.num = 2;

  t.true(testStore[DataSymbol] !== oldData);
  t.true(testStore.a_object !== oldData.a_object);
  t.true(testStore.a_object.num !== oldData.a_object.num);
  t.true(testStore.a_object === testStore.a_object);
});

test('props default value.', t => {
  class TestStore extends BaseStore {
    a_object: TestObject = { num: 999 };
  }
  const testStore = new TestStore(defaultOdux);
  t.true(testStore.a_object.num === 999);
  t.true(testStore[DataSymbol].a_object.num === 999);
});

test('getDataByPath.', t => {
  const odux = defaultOdux as Odux;
  t.true(odux.getReduxStore().getState() === odux.getDataByPath(''));
});
