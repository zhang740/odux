"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const power_di_1 = require("power-di");
const event_1 = require("./event");
const event_2 = require("./event");
const ProxyObject_1 = require("./ProxyObject");
const utils_1 = require("./utils");
const TrackingData_1 = require("./TrackingData");
const OduxConfig_1 = require("./OduxConfig");
const BaseStore_1 = require("./store/BaseStore");
class Odux {
    constructor(ioc = power_di_1.IocContext.DefaultInstance, config = new OduxConfig_1.OduxConfig) {
        this.ioc = ioc;
        this.config = config;
        this.isInited = false;
        this.storeKeys = [];
        this.trackingData = new TrackingData_1.TrackingData();
        this.eventBus = ioc.get(event_1.EventBus) || new event_1.EventBus();
        this.eventBus.addEventListener(event_2.SpyEvent, (evt) => {
            this.handleSpyEvent(evt.message);
        });
    }
    static get REDUX_ACTION_TYPE() { return '$$Odux'; }
    static get exemptPrefix() { return '__ODUX__'; }
    get console() {
        const hasGroup = !!console.group;
        const thisConsole = {
            log: (...msg) => { if (hasGroup)
                console.log.apply(console, msg); },
            info: (...msg) => { if (hasGroup)
                console.info.apply(console, msg); },
            warn: console.warn,
            error: console.error,
            group: (msg) => { if (console.group)
                console.group(msg); },
            groupCollapsed: (msg) => { if (console.groupCollapsed)
                console.groupCollapsed(msg); },
            groupEnd: () => { if (console.groupEnd)
                console.groupEnd(); },
        };
        const noConsole = {
            log: (...msg) => { },
            info: (...msg) => { },
            warn: console.warn,
            error: console.error,
            group: (msg) => { },
            groupCollapsed: (msg) => { },
            groupEnd: () => { },
        };
        return this.config.isDebug ? thisConsole : noConsole;
    }
    setRootStore(store) {
        this.rootStore = store;
        return this;
    }
    getRootStore() {
        return this.rootStore;
    }
    loadStores() {
        const ioc = this.ioc;
        const storeTypes = ioc.getSubClasses(BaseStore_1.BaseStore);
        storeTypes.forEach(storeType => {
            ioc.replace(storeType, new storeType(this));
        });
    }
    registerStore(store) {
        if (this.storeKeys.indexOf(store.type) >= 0) {
            throw new Error(`already has the same store. ${store.type}`);
        }
        else {
            this.storeKeys.push(store.type);
        }
    }
    setPrefix(prefix) {
        this.config.prefix = prefix;
        return this;
    }
    getStoreData(storeName, initial = {}) {
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
    getDataByPath(path, store = this.getStoreData()) {
        if (path) {
            path.split('.').forEach((name) => {
                if (!store)
                    return;
                store = store[name];
            });
        }
        return store;
    }
    initTracker() {
        if (!this.isInited) {
            this.createDataProxy(this.getStoreData());
            this.isInited = true;
        }
    }
    transactionBegin() {
        if (this.trackingData.isTracking) {
            this.console.log('is Already in tracking.[Begin]');
        }
        this.console.groupCollapsed('Data Change Tracking...');
        this.initTracker();
        this.trackingData.isTracking++;
    }
    transactionChange(func, err) {
        this.transactionBegin();
        utils_1.guard(func, undefined, (error) => {
            if (this.config.isDebug) {
                this.console.warn('transactionChange error', error);
            }
            err && err(error);
        });
        this.transactionEnd();
    }
    directWriteChange(func, err) {
        const oldWriteTrackingStatus = this.trackingData.isDirectWriting;
        this.trackingData.isDirectWriting = true;
        utils_1.guard(func, undefined, (error) => {
            if (this.config.isDebug) {
                this.console.warn('directWriteChange error', error);
            }
            err && err(error);
        });
        this.trackingData.isDirectWriting = oldWriteTrackingStatus;
    }
    transactionEnd() {
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
        const readTrackingPaths = Object.keys(this.trackingData.readTracking);
        this.console.info('readTrackingPaths...', readTrackingPaths.length);
        readTrackingPaths.forEach((path) => {
            let hasData = true;
            let data = this.getDataByPath(path, storeData);
            this.console.log('[check]:', path, !!data);
            if (!data) {
                const event = this.trackingData.readTracking[path].value;
                this.trackingData.changeTracking.push(event);
            }
            else if (this.isObject(data)) {
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
    mainReducer(state, action) {
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
        let newState = utils_1.shallowCopy(state);
        this.directWriteChange(() => {
            if (this.config.isDebug) {
                this.console.groupCollapsed('mainReducer');
                this.console.log('action:', action);
                action.data.forEach(change => {
                    this.console.log(change.parentPath, change.key, change._source, typeof change.newValue);
                });
                this.console.groupEnd();
            }
            let copyNew = [];
            let copyNewObject = {};
            let data = newState;
            let oldLastData;
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
                    const fullPath = utils_1.getPath(path, name);
                    oldLastData = data[name];
                    if (copyNew.indexOf(fullPath) < 0) {
                        copyNew.push(fullPath);
                        this.console.info('shallow copy：', fullPath);
                        if (this.isObject(oldLastData)) {
                            data[name] = utils_1.shallowCopy(oldLastData);
                            copyNewObject[fullPath] = data[name];
                        }
                        else {
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
            this.console.info('[Return]newState');
        });
        return newState;
    }
    recoverData(data, value, key) {
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: true,
            value: value
        });
    }
    handleSpyEvent(event) {
        const { isTracking, isDirectWriting, readTracking, changeTracking, } = this.trackingData;
        if (!isDirectWriting) {
            switch (event.type) {
                case 'Update':
                    if (isTracking) {
                        this.console.log('Write Tracking(recording)：', event.fullPath);
                        event._source = 'Update_recording_SpyEvent';
                        changeTracking.push(event);
                        Object.keys(readTracking)
                            .filter(path => path.startsWith(event.fullPath) && path !== event.fullPath)
                            .forEach(path => {
                            delete readTracking[path];
                        });
                    }
                    else {
                        this.console.log('Write Tracking(dispatch)：', event.fullPath);
                        event._source = 'Update_dispatch_SpyEvent';
                        this.dispatchChange([event]);
                    }
                    break;
                case 'Read':
                    if (isTracking && this.isObject(event.newValue)) {
                        event._source = 'Read_SpyEvent';
                        readTracking[event.fullPath] = {
                            value: event
                        };
                    }
                    break;
            }
        }
    }
    checkNewProps(data, path = '') {
        this.console.groupCollapsed('checkNewProps... ' + path);
        let hasNewProps = false;
        if (this.isObject(data)) {
            utils_1.commonForEach(data, (key) => {
                const fullPath = utils_1.getPath(path, key);
                const meta = this.getMeta(data);
                if (meta && !meta.values[key]) {
                    hasNewProps = true;
                    this.console.log('[new props]：', fullPath);
                    let change = this.trackingData.changeTracking
                        .find((item) => item.fullPath === fullPath);
                    if (change) {
                        change.newValue = data[key];
                        change._source = 'checkNewProps';
                    }
                    else {
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
    createDataProxy(data, path = '', deep = true, cycleCheckStartId = -1) {
        if (!this.isObject(data)) {
            return;
        }
        this.console.groupCollapsed('createDataProxy，Deep：' + deep + ' ' + path);
        utils_1.commonForEach(data, (key) => {
            const fullPath = utils_1.getPath(path, key);
            this.console.log(fullPath);
            this.setProxyProperty(data, key, path);
            if (deep && this.isObject(data[key]) && key !== Odux.exemptPrefix) {
                this.createDataProxy(data[key], fullPath, deep, cycleCheckStartId);
            }
        });
        this.console.groupEnd();
    }
    setProxyProperty(proxyObject, key, dataPath) {
        if (!this.isObject(proxyObject) || !key || key === Odux.exemptPrefix) {
            return;
        }
        let meta = this.getMeta(proxyObject);
        if (!meta) {
            meta = this.setMeta(proxyObject);
        }
        if (proxyObject[key] instanceof ProxyObject_1.ProxyObject) {
            meta.values[key] = proxyObject[key];
        }
        else {
            const fullPath = utils_1.getPath(dataPath, key);
            if (this.isObject(proxyObject[key])) {
                this.setMeta(proxyObject[key]);
            }
            meta.values[key] = new ProxyObject_1.ProxyObject(this.eventBus, this.config, this.trackingData, proxyObject[key], key, dataPath, fullPath);
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
    dispatchChange(changes) {
        if (this.dispatchTimer) {
            this.trackingData.changeDatas = this.trackingData.changeDatas.concat(changes);
            return;
        }
        else {
            this.trackingData.changeDatas = changes;
        }
        if (this.config.dispatchDelay === -1) {
            this.dispatchAction();
        }
        else {
            this.dispatchTimer = setTimeout(() => {
                this.dispatchTimer = undefined;
                this.dispatchAction();
            }, this.config.dispatchDelay);
        }
    }
    dispatchAction() {
        this.console.groupCollapsed('Changes Dispatching...' + this.trackingData.changeDatas.length);
        this.rootStore.dispatch({
            type: Odux.REDUX_ACTION_TYPE,
            data: this.trackingData.changeDatas
        });
        this.trackingData.changeDatas = [];
        this.console.groupEnd();
    }
    isObject(data) {
        return data !== null && typeof data === 'object';
    }
    setMeta(data, meta = { values: {} }) {
        return utils_1.guard(() => {
            if (data && this.isObject(data) && !data[Odux.exemptPrefix]) {
                Object.defineProperty(data, Odux.exemptPrefix, {
                    enumerable: false,
                    writable: false,
                    configurable: true,
                    value: meta || { values: {} }
                });
            }
            return data && data[Odux.exemptPrefix];
        }, undefined, (err) => {
            this.console.warn('setMeta', err);
        });
    }
    getMeta(data) {
        const meta = !!data && data[Odux.exemptPrefix];
        return meta;
    }
}
exports.Odux = Odux;
//# sourceMappingURL=Odux.js.map