import * as Redux from 'redux';
import { IocContext } from 'power-di';
import { logger, isClass } from 'power-di/utils';
import { EventBus } from '../event';
import { SpyEvent, SpyEventType } from '../event';
import { ProxyObject } from './ProxyObject';
import { guard, commonForEach, compare, shallowCopy, getPath } from '../utils';
import { IStoreAdapter, IStore } from '../interface';
import { TrackingData, ChangeTrackData } from './TrackingData';
import { OduxConfig } from './OduxConfig';
import { BaseStore } from '../store/BaseStore';

export interface ActionType extends Redux.Action {
    data: ChangeTrackData[];
}

interface MetadataType {
    values: { [key: string]: ProxyObject };
}
interface MetaType {
    __ODUX__: MetadataType;
}

export class Odux implements IStoreAdapter {
    private static get REDUX_ACTION_TYPE() { return '$$Odux'; }
    private static get exemptPrefix() { return '__ODUX__'; }

    private rootStore: Redux.Store<any>;
    private eventBus: EventBus;

    private isInited = false;
    private dispatchTimer: any;
    private storeKeys: string[] = [];
    private trackingData = new TrackingData();

    constructor(
        private ioc = IocContext.DefaultInstance,
        private config?: OduxConfig
    ) {
        this.config = Object.assign(new OduxConfig, this.config || {});

        this.eventBus = ioc.get<EventBus>(EventBus) || new EventBus();
        this.eventBus.addEventListener(SpyEvent, (evt: SpyEvent) => {
            this.handleSpyEvent(evt.message);
        });
    }

    private get console() {
        const hasGroup = !!console.group;
        const thisConsole = {
            log: (...msg: any[]) => { if (hasGroup) console.log.apply(console, msg); },
            info: (...msg: any[]) => { if (hasGroup) console.info.apply(console, msg); },
            warn: console.warn,
            error: console.error,
            group: (msg: string) => { if (console.group) console.group(msg); },
            groupCollapsed: (msg: string) => { if (console.groupCollapsed) console.groupCollapsed(msg); },
            groupEnd: () => { if (console.groupEnd) console.groupEnd(); },
        };
        const noConsole = {
            log: (...msg: any[]) => { },
            info: (...msg: any[]) => { },
            warn: console.warn,
            error: console.error,
            group: (msg: string) => { },
            groupCollapsed: (msg: string) => { },
            groupEnd: () => { },
        };
        return this.config.isDebug ? thisConsole : noConsole;
    }

    setRootStore(store: Redux.Store<any>): Odux {
        this.rootStore = store;
        return this;
    }

    getRootStore() {
        return this.rootStore;
    }

    /**
     * init stores
     * @param StoreTypes typeof BaseStore[]
     */
    public initStores(StoreTypes?: any[]) {
        const ioc = this.ioc;
        if (!StoreTypes) {
            StoreTypes = ioc.getSubClasses<typeof BaseStore>(BaseStore);
        }
        StoreTypes && StoreTypes.forEach((st: typeof BaseStore) => {
            if (isClass(st)) {
                ioc.replace(st, new st(this));
            }
        });
    }

    public registerStore(store: IStore) {
        if (this.storeKeys.indexOf(store.type) >= 0) {
            throw new Error(`already has the same store. ${store.type}`);
        } else {
            this.storeKeys.push(store.type);
        }
    }

    public setPrefix(prefix: string): Odux {
        this.config.prefix = prefix;
        return this;
    }

    public getStoreData<T = any>(storeName?: string, initial: any = {}): T {
        const store = this.rootStore;
        if (!store) {
            throw new Error('Store not ready');
        }
        let state = store.getState();
        if (this.config.prefix) {
            this.config.prefix.split('.').forEach((name) => {
                this.directWriteChange(() => state = state[name] || {});
            });
        }
        if (storeName) {
            if (!state[storeName]) {
                this.console.info('Init Store...', storeName);
                this.directWriteChange(() => state[storeName] = initial);
            }
            return state[storeName];
        }
        return state;
    }

    public getDataByPath(path: string, store = this.getStoreData()): any {
        path.split('.').forEach((name) => {
            if (!store || !name) return;
            store = store[name];
        });
        return store;
    }

    public initTracker() {
        if (!this.isInited) {
            this.createDataProxy(this.getStoreData());
            this.isInited = true;
        }
    }

    public transactionBegin() {
        if (this.trackingData.isTracking) {
            this.console.log('is Already in tracking.[Begin]');
        }
        this.console.groupCollapsed('Data Change Tracking...');
        this.initTracker();
        this.trackingData.isTracking++;
    }

    public transactionChange(func: () => void, err?: (data: Error) => void) {
        this.transactionBegin();
        guard(func, undefined, (error) => {
            if (this.config.isDebug) {
                this.console.warn('transactionChange error', error);
            }
            err && err(error);
        });
        this.transactionEnd();
    }

    public directWriteChange(func: () => void, err?: (data: Error) => void) {
        const oldWriteTrackingStatus = this.trackingData.isDirectWriting;
        this.trackingData.isDirectWriting = true;
        guard(func, undefined, (error) => {
            if (this.config.isDebug) {
                this.console.warn('directWriteChange error', error);
            }
            err && err(error);
        });
        this.trackingData.isDirectWriting = oldWriteTrackingStatus;
    }

    /** 结束跟踪 */
    public transactionEnd() {
        if (!this.trackingData.isTracking) {
            this.console.warn('is NOT in tracking.[End]');
            this.console.groupEnd();
            return;
        }
        this.trackingData.isTracking--;
        if (this.trackingData.isTracking) {
            this.console.info('is Already in tracking.[End]');
            this.console.groupEnd();
            return;
        }
        this.console.info('Tracking ending...');
        const storeData = this.getStoreData();
        this.createDataProxy(storeData, '', false);

        // TODO 优化
        const readTrackingPaths = Object.keys(this.trackingData.readTracking);
        this.console.info('readTrackingPaths...', readTrackingPaths.length);
        readTrackingPaths.forEach((path) => {
            let hasData = true;
            let data = this.getDataByPath(path, storeData);
            this.console.log('[check]:', path, !!data);
            if (!data) {
                const event = this.trackingData.readTracking[path].value;
                this.trackingData.changeTracking.push(event);
            } else if (this.isObject(data)) {
                this.checkNewProps(data, path);
            }
        });
        this.trackingData.readTracking = {};
        if (this.trackingData.changeTracking.length > 0) {
            this.dispatchChange(this.trackingData.changeTracking);
            this.trackingData.changeTracking = [];
        }
        this.console.groupEnd();
    }

    public mainReducer(state: any, action: ActionType) {
        if (!state) {
            state = {};
            this.storeKeys.forEach(key => {
                state[key] = undefined;
            });
            this.createDataProxy(state);
        }
        if (action.type !== Odux.REDUX_ACTION_TYPE) {
            return state;
        }
        if (!action.data || action.data.length < 1) {
            this.console.warn('No change data');
            return state;
        }
        let newState: any = shallowCopy(state);
        this.directWriteChange(() => {
            if (this.config.isDebug) {
                this.console.groupCollapsed('mainReducer');
                this.console.log('action:', action);
                action.data.forEach(change => {
                    this.console.log(change.parentPath, change.key, change._source, typeof change.newValue);
                });
                this.console.groupEnd();
            }

            let copyNew: string[] = [];
            let copyNewObject: { [key: string]: any } = {};
            let data: any = newState;
            let oldLastData: any;
            // TODO 待优化
            action.data.forEach((change) => {
                let path = '';
                change.parentPath && change.parentPath.split('.').forEach((name) => {
                    if (!data) {
                        return;
                    }
                    if (!name) {
                        this.console.warn('no name:', path, change.parentPath, change.key);
                        return;
                    }
                    if (!data.hasOwnProperty(name)) {
                        this.console.warn(`no object:key:${name} path:${path} change:`, change);
                        return;
                    }

                    const fullPath = getPath(path, name);
                    oldLastData = data[name];
                    if (copyNew.indexOf(fullPath) < 0) {
                        copyNew.push(fullPath);
                        this.console.info('shallow copy：', fullPath);
                        if (this.isObject(oldLastData)) {
                            // TODO 多路径同步更新
                            data[name] = shallowCopy(oldLastData);

                            copyNewObject[fullPath] = data[name];
                        } else {
                            this.console.warn('shallow copy fail.', fullPath, change.parentPath, typeof oldLastData);
                            this.console.log(change);
                            data = {};
                        }
                    }
                    data = data[name];
                    path = fullPath;
                });
                if (path === change.parentPath && data) {
                    switch (change.type) {
                        case 'New':
                        case 'Update':
                            if (oldLastData !== data && oldLastData[change.key] !== change.oldValue) {
                                this.console.log('[restore oldValue]:', path, change.key);
                                this.recoverData(oldLastData, change.oldValue, change.key);
                            }
                            if (data[change.key] !== change.newValue) {
                                this.console.log('[assign newValue]:', path, change.key);
                                data[change.key = change.newValue];
                            }
                            this.createDataProxy(change.newValue, change.fullPath, true);
                            break;
                    }

                }
                data = newState;
            });

            this.console.log('new object createDataProxy...');
            copyNew.forEach(newPath => {
                this.createDataProxy(copyNewObject[newPath], newPath, false);
            });

            this.createDataProxy(newState, '', false);
            // if (this.config.isDebug) {
            // compare.call(this, state, newState, '')
            // }
            this.console.info('[Return]newState');
        });
        return newState;
    }

    private recoverData(data: any, value: any, key: string) {
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: true,
            value: value
        });
    }

    private handleSpyEvent(event: SpyEventType) {
        const {
            isTracking,
            isDirectWriting,
            readTracking,
            changeTracking,
        } = this.trackingData;

        if (!isDirectWriting) {
            switch (event.type) {
                case 'Update':
                    if (isTracking) {
                        this.console.log('Write Tracking(recording)：', event.fullPath);
                        (event as ChangeTrackData)._source = 'Update_recording_SpyEvent';
                        changeTracking.push(event);
                        Object.keys(readTracking)
                            .filter(path => path.startsWith(event.fullPath) && path !== event.fullPath)
                            .forEach(path => {
                                delete readTracking[path];
                            });
                    } else {
                        if (!this.config.autoTracking) {
                            throw new Error('CANNOT modify data without tracking when autoTracking is FALSE.');
                        }
                        this.console.log('Write Tracking(dispatch)：', event.fullPath);
                        (event as ChangeTrackData)._source = 'Update_dispatch_SpyEvent';
                        this.dispatchChange([event]);
                    }
                    break;

                case 'Read':
                    if (isTracking && this.isObject(event.newValue)) {
                        (event as ChangeTrackData)._source = 'Read_SpyEvent';
                        readTracking[event.fullPath] = {
                            value: event
                        };
                    }
                    break;
            }
        }
    }

    private checkNewProps(data: any, path: string = ''): boolean {
        this.console.groupCollapsed('checkNewProps... ' + path);
        let hasNewProps = false;
        if (this.isObject(data)) {
            commonForEach(data, (key: any) => {
                const fullPath = getPath(path, key);
                const meta = this.getMeta(data);
                if (meta && !meta.values[key]) {
                    hasNewProps = true;
                    this.console.log('[new props]：', fullPath);
                    let change = this.trackingData.changeTracking
                        .find((item: any) => item.fullPath === fullPath);
                    if (change) {
                        change.newValue = data[key];
                        change._source = 'checkNewProps';
                    } else {
                        change = {
                            key: key,
                            type: 'New',
                            newValue: data[key],
                            parentPath: path,
                            fullPath: fullPath,
                            _source: 'checkNewProps',
                        };
                        this.trackingData.changeTracking.push(change);
                    }

                    this.createDataProxy(data[key], fullPath);
                    this.setProxyProperty(data, key, path);
                }
            });
        }
        this.console.groupEnd();
        return hasNewProps;
    }

    private createDataProxy(data: any, path = '', deep = true, cycleCheckStartId = -1) {
        if (!this.isObject(data)) {
            return;
        }

        this.console.groupCollapsed('createDataProxy，Deep：' + deep + ' ' + path);

        commonForEach(data, (key: any) => {
            const fullPath = getPath(path, key);
            this.console.log(fullPath);

            // TODO 检测循环引用

            this.setProxyProperty(data, key, path);

            if (deep && this.isObject(data[key]) && key !== Odux.exemptPrefix) {
                this.createDataProxy(data[key], fullPath, deep, cycleCheckStartId);
            }
        });
        this.console.groupEnd();
    }

    private setProxyProperty(proxyObject: any, key: string, dataPath: string) {
        if (!this.isObject(proxyObject) || !key || key === Odux.exemptPrefix) {
            return;
        }

        let meta = this.getMeta(proxyObject);
        if (!meta) {
            meta = this.setMeta(proxyObject);
        }
        if (proxyObject[key] instanceof ProxyObject) {
            meta.values[key] = proxyObject[key];
        } else {
            const fullPath = getPath(dataPath, key);
            if (this.isObject(proxyObject[key])) {
                this.setMeta(proxyObject[key]);
            }
            meta.values[key] = new ProxyObject(
                this.eventBus,
                this.config,
                this.trackingData,
                proxyObject[key],
                key,
                dataPath,
                fullPath
            );
        }

        const self = this;
        Object.defineProperty(proxyObject, key, {
            configurable: true,
            enumerable: true,
            get: function () {
                const values = self.getMeta(this).values;
                if (!values[key]) {
                    this.console.warn('no value get', key, values);
                    return undefined;
                }
                return values[key].get();
            },
            set: function (value) {
                const values = self.getMeta(this).values;
                if (!values[key]) {
                    this.console.warn('no value set', key, values);
                    return;
                }
                values[key].set(value);
            }
        });
    }

    private dispatchChange(changes: ChangeTrackData[]) {
        if (this.dispatchTimer) {
            this.trackingData.changeDatas = this.trackingData.changeDatas.concat(changes);
            return;
        } else {
            this.trackingData.changeDatas = changes;
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

    private dispatchAction() {
        this.console.groupCollapsed('Changes Dispatching...' + this.trackingData.changeDatas.length);
        this.rootStore.dispatch({
            type: Odux.REDUX_ACTION_TYPE,
            data: this.trackingData.changeDatas
        } as ActionType);
        this.trackingData.changeDatas = [];
        this.console.groupEnd();
    }

    private isObject(data: any) {
        return data !== null && typeof data === 'object';
    }

    private setMeta(data: any, meta: MetadataType = { values: {} }) {
        if (data && this.isObject(data) && !data[Odux.exemptPrefix]) {
            Object.defineProperty(data, Odux.exemptPrefix, {
                enumerable: false,
                writable: false,
                configurable: true,
                value: meta || { values: {} } as MetadataType
            });
        }
        return data && data[Odux.exemptPrefix];
    }

    private getMeta<T>(data: any): MetadataType {
        const meta = !!data && (data as any)[Odux.exemptPrefix];
        return meta;
    }
}