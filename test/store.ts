import test from 'ava';
import { BaseStore, Odux } from '../lib';
import { IocContext } from 'power-di';
import { createStore, applyMiddleware, compose } from 'redux';

interface TestObject {
  num?: number;
  new_value?: any;
}
class TestStore extends BaseStore {
  a_object: TestObject;
  test: string;
}

let defaultOdux: Odux, store: any, testStore: TestStore;

test.beforeEach('init Odux', t => {
  defaultOdux = new Odux({ dispatchDelay: -1, iocContext: new IocContext(), isDebug: false });
  const finalCreateStore: any = compose(applyMiddleware(...[]))(createStore);
  const rootReducer = defaultOdux.mainReducer.bind(defaultOdux);
  store = finalCreateStore(rootReducer);
  defaultOdux.setReduxStore(store);
  testStore = new TestStore(defaultOdux);
});

test('no store.', t => {
  const odux = new Odux({ dispatchDelay: -1 });
  t.throws(() => odux.getStoreData('123'));
  odux.dispose();
});

function initStore() {
  testStore.test = undefined;
  testStore.a_object = {};
}

test('base.', t => {
  initStore();

  testStore.test = '111222';
  testStore.a_object = { num: 1 };
  const oldData = testStore.a_object;
  testStore.changeData(() => {
    testStore.a_object.num = 2;
  });

  t.true(testStore.a_object.num === 2);
  t.true(testStore.a_object.num !== oldData.num);
  t.true(testStore.a_object !== oldData);
  t.true(testStore.test === '111222');
  t.true(testStore.a_object === testStore.a_object);
});

test('prefix.', t => {
  class PrefixTest extends BaseStore {
    $prefix = ['a'];
    data: any;
  }

  const store = new PrefixTest(defaultOdux);
  store.data = { a: 123 };

  t.true(store.data.a === 123);
  const state = defaultOdux.getReduxStore().getState();
  t.deepEqual(state, { a: { PrefixTest: { data: { a: 123 } } } });
});

test('name.', t => {
  class PrefixTest extends BaseStore {
    $aliasName = 'xxx';
    data: any;
  }

  const store = new PrefixTest(defaultOdux);
  store.data = { a: 123 };

  t.true(store.data.a === 123);
  const state = defaultOdux.getReduxStore().getState();
  t.deepEqual(state, { xxx: { data: { a: 123 } } });
});

test('props default value.', t => {
  class TestStore extends BaseStore {
    a_object: TestObject = { num: 999 };
  }
  const testStore = new TestStore(defaultOdux);
  t.true(testStore.a_object.num === 999);
});

test('function return value.', async t => {
  class AStore extends BaseStore {
    data = { a: '123' };

    funcA() {
      return 'a';
    }

    funcB() {
      return this.data.a;
    }

    async funcC() {
      return 'c';
    }
  }

  const odux = new AStore(defaultOdux);
  t.true(odux.funcA() === 'a');
  t.true(odux.funcB() === '123');
  const c = odux.funcC();
  t.true(c instanceof Promise);
  t.true((await c) === 'c');
});
