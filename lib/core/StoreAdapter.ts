import { Odux } from './Odux';

export class StoreAdapter {
  private name: string;
  private prefix: string[];
  private storeKey: string;
  constructor(private odux: Odux, name: string) {
    this.name = name;
    this.storeKey = odux.registerStorePath(this.storePath);
  }

  get StoreKey() {
    return this.storeKey;
  }

  /** 设置Store别名 */
  setAliasName(value: string) {
    this.name = value;
    this.storeKey = this.odux.registerStorePath(this.storePath, this.storeKey);
  }

  /** 设置Store在ReduxStore上路径前缀 */
  setPrefix(value: string[]) {
    this.prefix = value;
    this.storeKey = this.odux.registerStorePath(this.storePath, this.storeKey);
  }

  /** 获取Store数据 */
  getData() {
    return this.odux.getStoreData(this.storeKey);
  }

  /** 批量跟踪 */
  public transactionChange(func: (...args: any[]) => void, err?: (data: Error) => void) {
    const adapter = this;
    return function() {
      return adapter.odux.transactionChange(
        adapter.storeKey,
        () => func.apply(this, arguments),
        err
      );
    };
  }

  private get storePath() {
    return []
      .concat(this.prefix || [])
      .concat(this.name)
      .filter(s => s);
  }
}
