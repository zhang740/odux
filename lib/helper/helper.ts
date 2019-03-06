import 'reflect-metadata';
import { IocContext, ClassType } from 'power-di';
import { getClsTypeByDecorator, getSuperClassInfo } from 'power-di/utils';
import { Odux, BaseStore } from '../core';

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

        if (getSuperClassInfo(DataType).every(t => t.class !== BaseStore)) {
          throw new Error(
            `[odux]inject Type is not extend BaseStore: ${DataType} ${target} ${key}`
          );
        }
        if (!ioc.has(DataType)) {
          if (ioc.has(Odux)) {
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
