import * as Redux from 'redux';
import { SpyEvent } from './Spy';
import { IStoreAdapter, IStore } from './interface';
export interface ActionType extends Redux.Action {
    data: ChangeTrackData[];
}
export interface ChangeTrackData extends SpyEvent {
    _source?: string;
}
export declare class ReduxStoreAdapter implements IStoreAdapter {
    private static defaultInstance;
    private static REDUX_ACTION_TYPE;
    private static exemptPrefix;
    private rootStore;
    private prefix;
    private isInited;
    private dispatchTimer;
    private storeKeys;
    private spy;
    private isDebug;
    private autoTracking;
    private trackingData;
    constructor();
    private readonly console;
    static readonly DefaultInstance: ReduxStoreAdapter;
    setRootStore(store: Redux.Store<any>): ReduxStoreAdapter;
    getRootStore(): Redux.Store<any>;
    registerStore(store: IStore<any>): void;
    setPrefix(prefix: string): ReduxStoreAdapter;
    setReduxActionType(type: string): ReduxStoreAdapter;
    getStoreData<T>(storeName?: string, initial?: any): T;
    getDataByPath(path: string, store?: any): any;
    initTracker(): void;
    transactionBegin(): void;
    transactionChange(func: () => void): void;
    directWriteChange(func: () => void): void;
    transactionEnd(): void;
    mainReducer(state: any, action: ActionType): any;
    private recoverData(data, value, key);
    private handleSpyEvent(event);
    private checkNewProps(data, path?);
    private createDataProxy(data, path?, deep?, cycleCheckStartId?);
    private getCycleCheckId(data);
    private setProxyProperty(proxyObject, key, dataPath);
    private genPropConfig(key);
    private dispatchChange(changes);
    private isObject(data);
    private setMeta(data, meta?);
    private getMeta<T>(data);
}
