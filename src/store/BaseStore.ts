import { IocContext } from 'power-di';
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
    protected storeAdapter: IStoreAdapter,
    private ioc?: IocContext,
  ) {
    if (!storeAdapter && ioc) {
      storeAdapter = ioc.get<IStoreAdapter>(IStoreAdapter);
    }
    if (storeAdapter) {
      storeAdapter.registerStore && storeAdapter.registerStore(this);
    } else {
      throw new Error(`registerStore [${this.type}] fail! no storeAdapter.`);
    }
  }

  public get Data(): DataType {
    if (!this.storeAdapter) {
      console.error(`NO storeAdapter. [${this.type}]`);
      return;
    }
    return this.storeAdapter.getStoreData<DataType>(this.type);
  }

  /** 开始跟踪事务 */
  public transactionBegin() {
    this.storeAdapter.transactionBegin();
  }

  /** 批量跟踪 */
  public transactionChange(func: () => void, err?: (data: Error) => void) {
    this.storeAdapter.transactionChange(func, err);
  }

  /** 结束跟踪事务 */
  public transactionEnd() {
    this.storeAdapter.transactionEnd();
  }

  /** 直写变更 */
  public directWriteChange(func: () => void, err?: (data: Error) => void) {
    this.storeAdapter.directWriteChange(func, err);
  }
}
