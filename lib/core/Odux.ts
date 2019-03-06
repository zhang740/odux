import * as Redux from 'redux';
import { IocContext } from 'power-di';
import { isClass, getGlobalType } from 'power-di/utils';
import { EventBus, StoreChangeEvent } from '../event';
import { guard } from '../utils';
import { OduxConfig } from './OduxConfig';
import { BaseStore } from './BaseStore';
import { Debug } from '../utils';
import { createDraft, finishDraft, setAutoFreeze } from 'immer';
import { ReduxListener, ReduxChangeEvent } from './ReduxListener';
import { compare } from '../utils';
import { shallowEqual } from '../utils';

const getUid = (function() {
  let id = 0;
  return () => id++;
})();

interface ChangeData {
  storeKey: string;
  paths: string[];
  newValue: any;
}

export interface ActionType extends Redux.Action {
  data: ChangeData[];
}

export class Odux {
  private static get REDUX_ACTION_TYPE() {
    return '$$Odux';
  }

  private get ioc() {
    return this.config.iocContext;
  }
  private eventBus: EventBus;
  private changeDispatch: ReduxListener;
  private debug: Debug = new Debug();

  private reduxStore: Redux.Store<any>;
  private localStore: {
    [key: string]: {
      paths: string[];
      value: any;
      draft: any;
      inProduce: boolean;
    };
  } = {};

  private dispatchTimer: any;
  private isTracking = 0;

  constructor(private config?: OduxConfig) {
    this.config = config = {
      ...new OduxConfig(),
      ...(this.config || {}),
    };

    if (!config.iocContext) {
      this.debug.warn('no iocContext in config, use IocContext.DefaultInstance.');
      config.iocContext = IocContext.DefaultInstance;
    }

    // register to iocContext
    if (config.iocContext.get(Odux)) {
      this.debug.warn('is already has [Odux] in IocContext, this new instance CANNOT register.');
    } else {
      config.iocContext.register(this, Odux);
    }

    // configure event bus
    this.eventBus = this.ioc.get(EventBus);
    if (!this.eventBus) {
      this.eventBus = new EventBus();
      this.ioc.register(this.eventBus, EventBus);
    }
    this.changeDispatch = new ReduxListener(this.eventBus);
    this.eventBus.addListener(ReduxChangeEvent, this.storeChangeListener);

    setAutoFreeze(this.config.devMode);

    this.debug.isDebug = this.config.isDebug;
  }

  public dispose() {
    this.changeDispatch.unsubscribeReduxStore();
  }

  public setReduxStore(store: Redux.Store<any>): Odux {
    this.reduxStore = store;
    this.changeDispatch.change(store);
    return this;
  }

  public getReduxStore() {
    return this.reduxStore;
  }

  public initStores(StoreTypes?: any[]) {
    const ioc = this.ioc;
    if (!StoreTypes) {
      StoreTypes = ioc.getSubClasses<typeof BaseStore>(BaseStore) || [];
    }
    StoreTypes.forEach((StoreType: typeof BaseStore) => {
      if (isClass(StoreType)) {
        ioc.replace(StoreType, new StoreType(this));
      }
    });
  }

  public registerStore(store: BaseStore) {
    const StoreType = store.constructor;
    this.debug.log('[registerStore]', getGlobalType(StoreType));
    if (!this.ioc.has(StoreType)) {
      this.ioc.register(store, StoreType);
    }
  }

  public getStore<T extends typeof BaseStore>(type: T) {
    return this.ioc.get(type);
  }

  public registerStorePath(storePath: string[], oldStoreKey?: string) {
    if (oldStoreKey) {
      delete this.localStore[oldStoreKey];
    }
    let storeKey = storePath.join('.');
    storeKey = this.localStore[storeKey] ? `${storeKey}_${getUid()}` : storeKey;
    this.localStore[storeKey] = {
      paths: storePath,
      value: this.reduxStore
        ? storePath.reduce((s, k) => s[k] || {}, this.reduxStore.getState())
        : {},
      draft: undefined,
      inProduce: false,
    };
    this.debug.log('[registerStorePath]', storePath, storeKey, oldStoreKey);
    return storeKey;
  }

  public getStoreData<T = any>(storeKey: string): T {
    if (!this.localStore[storeKey]) {
      throw new Error(`No Store Register: [${storeKey}]`);
    }
    const store = this.localStore[storeKey];
    return store.draft || store.value;
  }

  public transactionChange(storeKey: string, func: () => void, err?: (data: Error) => void) {
    this.debug.log('[transactionBegin]', this.isTracking);
    this.isTracking++;
    this.debug.log('[transactionChange]', storeKey);
    const state = this.getStoreData(storeKey);

    this.debug.log('[before draft]', storeKey, state);
    const store = this.localStore[storeKey];

    const finish = () => {
      if (storeFirstDraft) {
        store.inProduce = false;
        store.draft = finishDraft(store.draft);
        if (shallowEqual(store.value, store.draft)) {
          store.draft = undefined;
        }
      }
      this.debug.log('[after draft]', storeKey, store.draft);
      this.isTracking--;
      this.debug.log('[transactionEnd]', this.isTracking);
      if (this.isTracking === 0) {
        this.dispatchChange();
      }
    };

    let storeFirstDraft = false;

    if (!store.inProduce) {
      store.draft = createDraft(state);
      store.inProduce = true;
      storeFirstDraft = true;
    }

    let result: any;
    guard(
      () => {
        result = func();
      },
      undefined,
      error => {
        this.debug.error('transactionChange error', error);
        err && err(error);
      }
    );

    if (result instanceof Promise) {
      return result
        .then(data => {
          finish();
          return data;
        })
        .catch(err => {
          finish();
          throw err;
        });
    } else {
      finish();
      return result;
    }
  }

  public applyChange(storeKeys: string[]) {
    storeKeys
      .filter(k => this.localStore[k].inProduce)
      .forEach(k => {
        const store = this.localStore[k];
        store.draft = finishDraft(store.draft);
      });
    this.dispatchAction(storeKeys);
    storeKeys
      .filter(k => this.localStore[k].inProduce)
      .forEach(k => {
        const store = this.localStore[k];
        store.draft = createDraft(store.value);
      });
  }

  public mainReducer(state: any, action: ActionType) {
    const newState = { ...(state || {}) };
    if (!state) {
      Object.keys(this.localStore).forEach(key => {
        const store = this.localStore[key];
        this.setValue(newState, store.paths, store.value);
      });
    }
    if (action.type !== Odux.REDUX_ACTION_TYPE) {
      return newState;
    }
    this.debug.log('[mainReducer]', action);
    action.data.forEach(change => {
      this.setValue(newState, change.paths, change.newValue);
    });

    this.debug.log('[mainReducer] newState', newState);
    if (this.config.isDebug) {
      // compare(state, newState, '');
    }
    return newState;
  }

  private setValue(state: any, paths: string[], value: any) {
    const prefix = [...paths];
    const name = prefix.pop();
    prefix.forEach(k => {
      if (!state[k]) {
        state[k] = {};
      }
      state[k] = { ...state[k] };
      state = state[k];
    });
    state[name] = value;
  }

  private storeChangeListener = (evt: ReduxChangeEvent) => {
    const state = evt.data;
    this.debug.log('[storeChangeListener]', state);
    const changedStore: { storeKey: string; value: any }[] = [];

    Object.keys(this.localStore).forEach(k => {
      const storePath = this.localStore[k].paths;
      try {
        const store = this.localStore[k];
        const newValue = storePath.reduce((s, k) => s[k], state);
        if (!shallowEqual(store.value, newValue)) {
          changedStore.push({ storeKey: k, value: newValue });
          store.value = newValue;
        }
      } catch (error) {
        this.debug.info(
          '[storeChangeListener] store: [',
          storePath.join('.'),
          '] not exist.',
          error
        );
      }
      this.eventBus.emitComponentEvent(new StoreChangeEvent(changedStore));
    });
  }

  private dispatchChange() {
    this.debug.log('[dispatchChange]', !!this.dispatchTimer);
    if (this.dispatchTimer) {
      return;
    }

    if (this.config.dispatchDelay === -1) {
      this.dispatchAction();
    } else {
      this.dispatchTimer = setTimeout(() => {
        this.dispatchTimer = undefined;
        this.dispatchAction();
      }, this.config.dispatchDelay);
    }
  }

  private dispatchAction(storeKeys?: string[]) {
    storeKeys = storeKeys || Object.keys(this.localStore);
    const changes = storeKeys
      .filter(k => {
        const store = this.localStore[k];
        return store.draft && !shallowEqual(store.value, store.draft);
      })
      .map(k => {
        const store = this.localStore[k];
        const data = {
          storeKey: k,
          paths: store.paths,
          newValue: store.draft,
        } as ChangeData;
        store.draft = undefined;
        return data;
      });
    this.debug.log('[dispatchAction]', changes);
    if (changes.length) {
      if (this.reduxStore) {
        this.reduxStore.dispatch({
          type: Odux.REDUX_ACTION_TYPE,
          data: changes,
        } as ActionType);
      } else {
        changes.forEach(change => {
          this.localStore[change.storeKey].value = change.newValue;
        });
        this.eventBus.emitComponentEvent(
          new StoreChangeEvent(
            changes.map(change => {
              return {
                storeKey: change.storeKey,
                value: change.newValue,
              };
            })
          )
        );
      }
    }
  }
}
