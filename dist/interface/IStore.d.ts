import { IStoreAdapter } from './IStoreAdapter';
export interface IStore<DataType = any> {
    readonly type: string;
    readonly Data: DataType;
    readonly Adapter: IStoreAdapter;
}
