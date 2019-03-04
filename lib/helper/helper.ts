import 'reflect-metadata';
import { IocContext, ClassType } from 'power-di';
import { getClsTypeByDecorator } from 'power-di/utils';
import { Odux } from '../core';

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
        console.log({ DataType }, ioc.has(DataType));

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
