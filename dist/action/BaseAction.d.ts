import { IStore, IStoreAdapter } from '../interface';
export declare class BaseAction {
    static readonly GlobalAdapters: IStoreAdapter[];
    private static globalAdapters;
    protected trackingBegin(stores?: IStore<any>[]): void;
    protected tracking(func: () => void, stores?: IStore<any>[], onErr?: (err: any) => void): void;
    protected trackingEnd(stores?: IStore<any>[]): void;
}
