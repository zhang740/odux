import test from 'ava';
import { BaseStore, Odux } from '../lib';
import { IocContext } from 'power-di';

interface TestObject {
  num?: number;
  new_value?: any;
}
class TestStore extends BaseStore {
  a_object: TestObject;
  test: string;
}

let defaultOdux: Odux, testStore: TestStore;

test.beforeEach('init Odux', t => {
  defaultOdux = new Odux({ dispatchDelay: -1, iocContext: new IocContext(), isDebug: false });
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
});

test('name.', t => {
  class PrefixTest extends BaseStore {
    $aliasName = 'xxx';
    data: any;
  }

  const store = new PrefixTest(defaultOdux);
  store.data = { a: 123 };

  t.true(store.data.a === 123);
});

test('props default value.', t => {
  class TestStore extends BaseStore {
    a_object: TestObject = { num: 999 };
  }
  const testStore = new TestStore(defaultOdux);
  t.true(testStore.a_object.num === 999);
});
