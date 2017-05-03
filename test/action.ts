import test from 'ava';
import { BaseAction, BaseStore } from '../dist';
import { adapter, store } from './data/data';

interface TestObject {
    num?: number;
}
interface DataModel {
    a_object: TestObject;
    new_value: any;
}
class TestStore extends BaseStore<DataModel> {
}
const testStore = new TestStore(adapter);

test('changeData with tracking.', (t) => {
    class TestAction extends BaseAction {
        public changeData(store: TestStore) {
            this.tracking(() => {
                store.Data.a_object.num = 999;
            }, [store]);
        }
    }

    const action = new TestAction();
    testStore.Data.a_object = { num: 1 };
    t.true(testStore.Data.a_object.num === 1);
    action.changeData(testStore);
    t.true(testStore.Data.a_object.num === 999);
});

test('changeData with track begin/end.', (t) => {
    class TestAction extends BaseAction {
        public changeData(store: TestStore) {
            this.trackingBegin([store]);
            store.Data.a_object.num = 999;
            this.trackingEnd([store]);
        }
    }

    const action = new TestAction();
    testStore.Data.a_object = { num: 1 };
    t.true(testStore.Data.a_object.num === 1);
    action.changeData(testStore);
    t.true(testStore.Data.a_object.num === 999);
});

test('tracking when error.', (t) => {
    class TestAction extends BaseAction {
        public changeData(store: TestStore) {
            this.tracking(() => {
                throw new Error();
            }, [store], (err) => {
                t.pass();
            });
        }
    }
    const action = new TestAction();
    action.changeData(testStore);
});

test('changeData with tracking, GlobalAdapters.', (t) => {
    class TestAction extends BaseAction {
        public changeData(store: TestStore) {
            this.tracking(() => {
                store.Data.a_object.num = 999;
            });
        }
    }

    BaseAction.GlobalAdapters.push(testStore.Adapter);

    const action = new TestAction();
    testStore.Data.a_object = { num: 1 };
    t.true(testStore.Data.a_object.num === 1);
    action.changeData(testStore);
    t.true(testStore.Data.a_object.num === 999);

    BaseAction.GlobalAdapters.splice(BaseAction.GlobalAdapters.indexOf(testStore.Adapter), 1);
});