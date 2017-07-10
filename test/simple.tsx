import test from 'ava';
import * as render from 'react-test-renderer';
import { createStore, applyMiddleware, compose, Store } from 'redux';
import { BaseStore } from '../dist';
import { createOdux, registerStore, connect, getComponent } from '../dist/simple';

test('odux simple.', (t) => {
    const finalCreateStore: any = compose()(createStore);

    @registerStore()
    class AStore extends BaseStore {

    }

    const odux = createOdux();
    odux.loadStores();
    const rootReducer = odux.mainReducer.bind(odux);
    const store = finalCreateStore(rootReducer);
    odux.setRootStore(store);

    t.true(getComponent<AStore>(AStore) instanceof AStore);
});