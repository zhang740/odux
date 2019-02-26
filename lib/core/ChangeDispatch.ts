import { IocContext } from 'power-di';
import { BaseEvent, EventBus } from '../event';
import { Odux } from '../core';
import { Unsubscribe, Store } from 'redux';

export class ChangeEvent extends BaseEvent<any> {
}

export class ChangeDispatch {
  private unsubscribe: Unsubscribe;
  private store: Store<any>;

  constructor(
    private eventBus: EventBus,
  ) {
  }

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
    this.eventBus.emit(new ChangeEvent(this.store.getState()));
  }
}
