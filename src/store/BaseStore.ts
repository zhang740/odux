import { getGlobalType } from 'power-di/utils';
import { IStore, IStoreAdapter } from '../interface';

export class BaseStore<DataType = any> implements IStore<DataType> {

  public get type(): string {
    return getGlobalType(this.constructor);
  }
  public static get type(): string {
    return getGlobalType(this);
  }

  constructor(
    private storeAdapter: IStoreAdapter,
  ) {
    storeAdapter.registerStore && storeAdapter.registerStore(this);
  }

  public get Data(): DataType {
    return this.storeAdapter.getStoreData<DataType>(this.type);
  }

  public get Adapter(): IStoreAdapter {
    return this.storeAdapter;
  }
}
