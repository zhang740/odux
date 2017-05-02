import test from 'ava';
import { createStore, applyMiddleware, compose, Store } from 'redux';
import { BaseStore, bindProperty, Odux } from '../dist';

const adapter = new Odux(undefined, { isDebug: true, dispatchDelay: -1 });
const finalCreateStore: any = compose(applyMiddleware(...[]))(createStore);
const rootReducer = adapter.mainReducer.bind(adapter);
const store = finalCreateStore(rootReducer);
adapter.setRootStore(store);

interface TestObject {
    num?: number;
}
interface DataModel {
    test: string;
    a_object: TestObject;
}
class TestStore extends BaseStore<DataModel> {
    @bindProperty()
    a_object: TestObject;
}

test('no store.', (t) => {
    const adapter = new Odux(undefined, { isDebug: true, dispatchDelay: -1 });
    const finalCreateStore: any = compose(applyMiddleware(...[]))(createStore);
    const rootReducer = adapter.mainReducer.bind(adapter);
    const store = finalCreateStore(rootReducer);
    t.throws(adapter.getStoreData);
});

const testStore = new TestStore(adapter);

test('base.', (t) => {
    testStore.Data.test = '111222';
    testStore.Data.a_object = { num: 1 };
    const oldData = testStore.Data;
    testStore.Adapter.transactionChange(() => {
        testStore.a_object.num = 2;
    });
    t.true(testStore.Data !== oldData);
    t.true(testStore.Data.test === oldData.test);
    t.true(testStore.Data.a_object !== oldData.a_object);
    t.true(testStore.Data.a_object.num !== oldData.a_object.num);
    t.true(testStore.a_object === testStore.Data.a_object);
});

test('get store.', (t) => {
    t.true(adapter.getRootStore() === store);
    t.true(testStore.Data === testStore.Adapter.getStoreData(testStore.type));
});

test('error, redefined.', (t) => {
    t.throws(() => {
        new TestStore(adapter);
    });
});

test('prefix.', (t) => {
    t.true(!!testStore.a_object);
    adapter.setPrefix('__test__');
    t.true(!testStore.a_object);
    adapter.setPrefix('');
});