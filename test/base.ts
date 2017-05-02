import test from 'ava';
import { BaseStore, bindProperty } from '../dist';

interface TestObject {
    num: number;
}
interface DataModel {
    test: string;
    a_object: TestObject;
}
class TestStore extends BaseStore<DataModel> {
    @bindProperty()
    a_object: TestObject;
}

test('base', (t) => {
    t.pass();
});