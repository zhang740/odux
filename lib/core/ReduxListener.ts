import { EventBus, BaseEvent } from '../event';
import { Unsubscribe, Store } from 'redux';

export class ReduxChangeEvent extends BaseEvent<any> {}

export class ReduxListener {
  private unsubscribe: Unsubscribe;
  private store: Store<any>;

  constructor(private eventBus: EventBus) {}

  subscribeReduxStore(store: Store<any>) {
    this.unsubscribe = store.subscribe(this.listener);
  }

  unsubscribeReduxStore() {
    this.unsubscribe && this.unsubscribe();
  }

  change(store: Store<any>) {
    this.unsubscribeReduxStore();
    this.subscribeReduxStore(store);
    this.store = store;
  }

  listener = () => {
    this.eventBus.emit(new ReduxChangeEvent(this.store.getState()));
  }
}
