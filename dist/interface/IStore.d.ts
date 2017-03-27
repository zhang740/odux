import { IStoreAdapter } from './IStoreAdapter';
export interface IStore<DataType> {
    readonly type: string;
    readonly Data: DataType;
    readonly Adapter: IStoreAdapter;
}
