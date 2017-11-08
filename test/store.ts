import test from 'ava';
import { createStore, applyMiddleware, compose, Store } from 'redux';
import { BaseStore, helper, Odux, IStoreAdapter } from '../lib';
import { adapter as defaultOdux, store } from './data/data';
import { IocContext } from 'power-di';
const { bindProperty, registerStore, tracking } = helper;

interface TestObject {
    num?: number;
}
interface DataModel {
    test: string;
    a_object: TestObject;
    new_value: any;
}
class TestStore extends BaseStore<DataModel> {
    @bindProperty()
    a_object: TestObject;
}

test('no store.', (t) => {
    const odux = new Odux({ dispatchDelay: -1 });
    t.throws(() => odux.getStoreData());
    odux.dispose();
});

const testStore = new TestStore(defaultOdux);
function initStore() {
    testStore.Data.test = undefined;
    testStore.Data.a_object = {};
    testStore.Data.new_value = undefined;
}

test('base.', (t) => {
    t.true(TestStore.type === testStore.type);

    initStore();

    testStore.Data.test = '111222';
    testStore.Data.a_object = { num: 1 };
    const oldData = testStore.Data;
    testStore.transactionChange(() => {
        testStore.a_object.num = 2;
    });
    t.true(testStore.Data !== oldData);
    t.true(testStore.Data.test === oldData.test);
    t.true(testStore.Data.a_object !== oldData.a_object);
    t.true(testStore.Data.a_object.num !== oldData.a_object.num);
    t.true(testStore.a_object === testStore.Data.a_object);

    testStore.transactionChange(() => {
        testStore.a_object.num = 5;
        t.true(testStore.a_object.num === 5);
        testStore.a_object.num = 9;
        t.true(testStore.a_object.num === 9);
    });
    t.true(testStore.a_object.num === 9);
});

test('new props.', (t) => {
    const oldData = testStore.Data;
    t.true(!oldData.new_value);
    testStore.transactionChange(() => {
        testStore.Data.new_value = {};
    });
    t.true(!!testStore.Data.new_value);
    t.true(!oldData.new_value);
    t.true(oldData !== testStore.Data);
    t.true(oldData.new_value !== testStore.Data.new_value);
});

test('get store.', (t) => {
    initStore();

    t.true(defaultOdux.getReduxStore() === store);
    t.true(testStore.Data === defaultOdux.getStoreData(testStore.type));
});

test('error, redefined.', (t) => {
    t.throws(() => {
        new TestStore(defaultOdux);
    });
});

test('prefix.', (t) => {
    t.true(!!testStore.a_object);
    defaultOdux.setPrefix('__test__');
    t.true(!testStore.Data.a_object);
    t.true(!testStore.a_object);
    defaultOdux.setPrefix('');
});

test('without tracking method.', (t) => {
    initStore();

    testStore.a_object = { num: 1 };
    const oldData = testStore.Data;

    testStore.a_object.num = 2;

    t.true(testStore.Data !== oldData);
    t.true(testStore.Data.a_object !== oldData.a_object);
    t.true(testStore.Data.a_object.num !== oldData.a_object.num);
    t.true(testStore.a_object === testStore.Data.a_object);
});

test('props default value.', (t) => {
    class TestStore extends BaseStore<DataModel> {
        @bindProperty(undefined, () => ({ num: 999 }))
        a_object: TestObject;
    }
    const testStore = new TestStore(defaultOdux);
    t.true(testStore.a_object.num === 999);
    t.true(testStore.Data.a_object.num === 999);
});

test('registerStore.', (t) => {
    const context = IocContext.DefaultInstance;
    context.register(Odux, IStoreAdapter);

    @registerStore()
    class TestStore extends BaseStore {
    }

    t.true(context.get<TestStore>(TestStore) instanceof TestStore);
});

test('getDataByPath.', (t) => {
    const odux = defaultOdux as Odux;
    t.true(odux.getReduxStore().getState() === odux.getDataByPath(''));
});
