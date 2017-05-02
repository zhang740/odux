import * as Redux from 'redux';
import { IocContext } from 'power-di';
import { IStoreAdapter, IStore } from './interface';
import { ChangeTrackData } from './TrackingData';
import { OduxConfig } from './OduxConfig';
export interface ActionType extends Redux.Action {
    data: ChangeTrackData[];
}
export declare class Odux implements IStoreAdapter {
    private config;
    private static readonly REDUX_ACTION_TYPE;
    private static readonly exemptPrefix;
    private rootStore;
    private eventBus;
    private isInited;
    private dispatchTimer;
    private storeKeys;
    private trackingData;
    constructor(ioc?: IocContext, config?: OduxConfig);
    private readonly console;
    setRootStore(store: Redux.Store<any>): Odux;
    getRootStore(): Redux.Store<any>;
    registerStore(store: IStore): void;
    setPrefix(prefix: string): Odux;
    getStoreData<T = any>(storeName?: string, initial?: any): T;
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
    private setProxyProperty(proxyObject, key, dataPath);
    private dispatchChange(changes);
    private dispatchAction();
    private isObject(data);
    private setMeta(data, meta?);
    private getMeta<T>(data);
}
