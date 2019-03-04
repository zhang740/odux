import { IocContext } from 'power-di';
import { getGlobalType } from 'power-di/utils';
import { Odux } from './Odux';
import { StoreAdapter } from './StoreAdapter';

const MetaSymbol = Symbol('MetaSymbol');
interface MetaType {
  adapter: StoreAdapter;
}

export function getStoreMeta(store: BaseStore): MetaType {
  const meta = store[MetaSymbol];
  if (!meta) {
    Object.defineProperty(store, MetaSymbol, {
      enumerable: false,
      writable: false,
      value: {} as MetaType,
    });
    return getStoreMeta(store);
  }
  return meta;
}

export class BaseStore {
  private static excludeKeys = [
    MetaSymbol,
    '$aliasName',
    '$prefix',
    ...Object.getOwnPropertyNames(Object),
  ];

  protected set $aliasName(value: string) {
    getStoreMeta(this).adapter.setAliasName(value);
  }

  protected set $prefix(value: string[]) {
    getStoreMeta(this).adapter.setPrefix(value);
  }

  constructor(storeOrIoC: Odux | IocContext) {
    const odux = storeOrIoC instanceof IocContext ? storeOrIoC.get(Odux) : storeOrIoC;
    const type = getGlobalType(this.constructor);
    if (!odux) {
      throw new Error(`registerStore [${type} (alias: ${this.$aliasName})] fail! no odux.`);
    }

    function getDataType(target: any, p: any) {
      if (BaseStore.excludeKeys.indexOf(p) >= 0) {
        return false;
      }
      const value = target[p];
      const type = typeof value;
      if (type === 'function') return 'function';
      return ['undefined', 'number', 'string', 'bool', 'object', 'symbol'].indexOf(type) >= 0
        ? 'data'
        : false;
    }

    const thisProxy: any = new Proxy(this, {
      get(target, p) {
        const dataType = getDataType(target, p);
        const meta = getStoreMeta(target);
        return dataType === 'data'
          ? meta.adapter.getData()[p]
          : dataType === 'function'
          ? meta.adapter.transactionChange(target[p].bind(thisProxy))
          : target[p];
      },
      set(target, p, value) {
        if (getDataType(target, p) === 'data') {
          thisProxy.changeData(() => {
            const data = getStoreMeta(target).adapter.getData();
            data[p] = value;
          });
        } else {
          target[p] = value;
        }
        return true;
      },
    });

    const meta = getStoreMeta(this);
    meta.adapter = new StoreAdapter(odux, type);
    odux.registerStore(this);
    return thisProxy;
  }

  /** 数据变更方法，推荐把业务逻辑封装在 Store 上独立的方法内 */
  changeData(func: () => void) {
    func();
  }
}
