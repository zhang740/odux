import { IStore } from '../interface';
export declare class BaseAction {
    private storeManager;
    protected addStore(store: IStore<any>): void;
    protected trackingBegin(stores?: IStore<any>[]): void;
    protected tracking(func: () => void, stores?: IStore<any>[], onErr?: (err: any) => void): void;
    protected trackingEnd(stores?: IStore<any>[]): void;
}
