import { getGlobalType } from 'power-di/utils';
import { IStore, IStoreAdapter } from '../interface';
import { IocContext } from 'power-di';

export const DataSymbol = Symbol('DataSymbol');

export class BaseStore implements IStore {
  private static excludeKeys = ['type', DataSymbol, 'storeAliasName', 'storeAdapter'];
  public static get type(): string {
    return getGlobalType(this);
  }
  public get type(): string {
    return getGlobalType(this.constructor);
  }

  public get [DataSymbol](): any {
    if (!this.storeAdapter) {
      console.error(`NO storeAdapter. [${this.type} (alias: ${this.storeAliasName})]`);
      return;
    }
    return this.storeAdapter.getStoreData(this.storeAliasName || this.type);
  }
  storeAliasName: string;
  private storeAdapter: IStoreAdapter;
  constructor(storeOrIoC: IStoreAdapter | IocContext) {
    this.storeAdapter =
      storeOrIoC instanceof IocContext ? storeOrIoC.get(IStoreAdapter) : storeOrIoC;

    if (!this.storeAdapter) {
      throw new Error(
        `registerStore [${this.type} (alias: ${this.storeAliasName})] fail! no storeAdapter.`
      );
    }

    function needRedirect(target: any, p: any) {
      if (BaseStore.excludeKeys.indexOf(p) >= 0) {
        return false;
      }
      const value = target[p];
      const type = typeof value;
      return ['undefined', 'number', 'string', 'object'].indexOf(type) >= 0;
    }

    const thisProxy = new Proxy(this, {
      get(target, p) {
        const need = needRedirect(target, p);
        return need ? target[DataSymbol][p] : target[p];
      },
      set(target, p, value) {
        if (needRedirect(target, p)) {
          target[DataSymbol][p] = value;
        } else {
          target[p] = value;
        }
        return true;
      },
    });

    this.storeAdapter.registerStore(thisProxy);
    return thisProxy;
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
