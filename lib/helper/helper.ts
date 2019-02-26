import 'reflect-metadata';
import { IocContext, ClassType } from 'power-di';
import { getGlobalType, getClsTypeByDecorator } from 'power-di/utils';
import { IStoreAdapter } from '../interface';
import { BaseStore } from '../store/BaseStore';

const OduxMetaSymbol = Symbol('OduxMeta');
export const PropsKeySymbol = '__$odux';

export type DataConnectType = (ioc: IocContext) => any;

interface OduxMetaType {
  connect: {
    [key: string]: DataConnectType;
  };
}

export function getMetadata(target: any): OduxMetaType {
  const data = Object.getOwnPropertyDescriptor(target, OduxMetaSymbol);
  if (!data) {
    Object.defineProperty(target, OduxMetaSymbol, {
      configurable: false,
      writable: false,
      value: { connect: {} } as OduxMetaType,
    });
    return getMetadata(target);
  }
  return data.value;
}

export function inject<T extends ClassType>(
  config: {
    dataType?: InstanceType<T>;
    getter?: (ioc: IocContext) => any;
  } = {}
) {
  return (target: any, key: string) => {
    const meta = getMetadata(target.constructor);
    meta.connect[key] =
      config.getter ||
      (ioc => {
        const DataType = getClsTypeByDecorator(config.dataType, target, key);
        if (!ioc.has(DataType)) {
          if (ioc.has(IStoreAdapter)) {
            ioc.register(DataType);
          } else {
            ioc.register(DataType, undefined, { autoNew: false, regInSuperClass: true });
          }
        }
        meta.connect[key] = ioc => {
          return ioc.get(DataType);
        };
        return meta.connect[key](ioc);
      });

    return {
      get: function() {
        return this.props[PropsKeySymbol][key];
      },
    } as any;
  };
}

export const tracking = (transaction = true) => (
  target: any,
  key: string,
  descriptor: PropertyDescriptor
) => {
  const fn = descriptor.value;

  return {
    configurable: true,
    writable: false,
    value: function(this: BaseStore) {
      const odux = (this as any).storeAdapter;
      if (odux) {
        const useFunc = transaction ? odux.transactionChange : odux.directWriteChange;
        useFunc.bind(odux)(
          () => {
            fn.apply(this, [...(arguments as any)]);
          },
          (error: Error) => {
            console.error(`Error: ${getGlobalType(this.constructor)} -> ${key}`, error);
          }
        );
      } else {
        console.warn(
          `Can't use @tracking, no Odux on IOCContext. method: ${getGlobalType(
            this.constructor
          )} -> ${key}`
        );
        fn.apply(this, [...(arguments as any)]);
      }
    },
  };
};
