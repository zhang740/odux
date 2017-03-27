import { IStore } from './IStore';
export declare abstract class IStoreAdapter {
    abstract registerStore: (store: IStore<any>) => void;
    abstract getStoreData<T>(storeName: string, initial?: any): T;
    abstract getDataByPath(path: string): any;
    abstract initTracker(): void;
    abstract transactionBegin(): void;
    abstract transactionChange(func: () => void): void;
    abstract transactionEnd(): void;
    abstract directWriteChange(func: () => void): void;
}
