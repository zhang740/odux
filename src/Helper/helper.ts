import { IocContext, RegisterOptions, RegKeyType } from 'power-di';
import { getDecorators, Decorators } from 'power-di/helper';
import { getGlobalType, getSuperClassInfo } from 'power-di/utils';

import { Odux } from '../core';
import { BaseStore } from '../store/BaseStore';
import { IStore, IStoreAdapter } from '../interface';
import { MapToProps, connect as oduxConnect, ConnectStateType } from '../react-odux';
import { ChangeDispatch, ChangeEvent } from '../core';
import { EventBus } from '../event';

// typescript (> 2.6) require
import * as React from 'react';

export class Helper {
  public get iocContext() { return this.ioc; }
  private decorators = getDecorators(this.ioc);
  private get odux() {
    return this.iocContext.get<Odux>(Odux);
  }

  constructor(private ioc: IocContext) { }

  powerDi = () => {
    return this.decorators;
  }

  registerStore = () => {
    const self = this;
    return function (target: any) {
      const storeAdapter = self.ioc.get<IStoreAdapter>(IStoreAdapter);
      if (storeAdapter) {
        self.ioc.register(new target(storeAdapter), target);
      } else {
        self.ioc.register(target, undefined, { autoNew: false, regInSuperClass: true });
      }
    };
  }

  /** bindProperty for Store */
  bindProperty = (bindKey?: string, initial?: () => any) => (target: BaseStore, key: string) => {
    const helper = this;
    const property = bindKey || key;

    Object.defineProperty(target, key, {
      get: function (this: BaseStore) {
        let result = this.Data[property];
        if (!result && initial !== undefined) {
          // FIXME storeAdapter?
          const odux = (this as any).storeAdapter || helper.odux;
          if (!odux) {
            throw new Error(`NO odux before read property [${bindKey} (${key}) - ${getGlobalType(target.constructor)}].`);
          }
          odux.directWriteChange(() => {
            result = this.Data[property] = initial();
          });
        }
        return result;
      },
      set: function (this: BaseStore, value) {
        this.Data[property] = value;
      }
    });
  }

  /** connect for Component */
  connect = <OwnPropsType>(mapper: MapToProps<OwnPropsType, any>) => {
    return oduxConnect(this.ioc, mapper);
  }

  /** register for IOCComponent, detail use powerDi */
  register = (key?: RegKeyType, options?: RegisterOptions) => {
    return this.decorators.register(key, options);
  }

  /** lazyInject for IOCComponent, detail use powerDi */
  inject = (type: Object) => {
    return this.decorators.lazyInject(type, true);
  }

  /**
   * Component
   *
   * @template OwnPropsType OwnPropsType
   * @template MapperPropsType MapperPropsType
   * @param {(ioc: IocContext, ownProps?: T) => P} mapper
   * @param {(MapperPropsType?: P) => any} component (MapperPropsType only for type) `typeof MapperPropsType`
   * @returns Component
   * @memberof Decorators
   */
  component<OwnPropsType, MapperPropsType>(
    mapper: MapToProps<OwnPropsType, MapperPropsType>,
    component: (
      // (only for type) `typeof MapperPropsType`
      MapperPropsType: MapperPropsType,
      ioc: IocContext
    ) => any
  ) {
    return oduxConnect(this.ioc, mapper)(component(undefined, this.ioc));
  }

  getIOCComponent = <T>(type: any) => {
    return this.ioc.get<T>(type);
  }

  tracking = (transaction = true) => (target: any, key: string, descriptor: PropertyDescriptor) => {
    const helper = this;
    const fn = descriptor.value;

    return {
      configurable: true,
      get() {
        if (this === fn.prototype || this.hasOwnProperty(key)) {
          return fn;
        }

        const boundFn = function () {
          const odux = (this as any).storeAdapter || helper.odux;
          if (odux) {
            const useFunc = transaction ? odux.transactionChange : odux.directWriteChange;
            useFunc.bind(odux)(function () {
              fn.apply(target, [...arguments as any]);
            }, ((error: Error) => {
              console.error(`Error: ${getGlobalType(target.constructor)} -> ${key}`);
            }));
          } else {
            console.warn(`Can't use @tracking, no Odux on IOCContext. method: ${getGlobalType(target.constructor)} -> ${key}`);
            fn.apply(target, [...arguments as any]);
          }
        };
        Object.defineProperty(this, key, {
          value: boundFn,
          configurable: true,
          writable: true
        });
        return boundFn;
      }
    };
  }
}

export const helper = new Helper(IocContext.DefaultInstance);
