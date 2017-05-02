import { IStoreAdapter } from './IStoreAdapter';
export declare interface IStore<DataType = any> {
    readonly type: string;
    readonly Data: DataType;
    readonly Adapter: IStoreAdapter;
}