import { IStoreAdapter } from './IStoreAdapter';
export declare interface IStore<DataType = any> {
  readonly type: string;
  readonly storeAliasName: string;
  readonly Data: DataType;
}
