import { IocContext, RegisterOptions } from 'power-di';
import { getDecorators } from 'power-di/helper';
import { getGlobalType, getSuperClassInfo } from 'power-di/utils';

import { Odux } from '../core';
import { BaseStore } from '../store/BaseStore';
import { IStore, IStoreAdapter } from '../interface';
import { MapToProps, connect as oduxConnect, ConnectStateType } from '../react-odux';
import { ChangeDispatch, ChangeEvent } from '../core';
import { EventBus } from '../event';

export class Helper {
  public get iocContext() { return this.ioc; }
  private decorators = getDecorators(this.ioc);
  private get odux() {
    return helper.ioc.get<Odux>(Odux);
  }

  constructor(private ioc: IocContext) { }

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
          helper.odux.directWriteChange(() => {
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

  /** inject for IOCComponent */
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

  getIOCComponent<T>(type: any) {
    return this.ioc.get<T>(type);
  }

  tracking = (use = true) => (target: any, key: string, descriptor: PropertyDescriptor) => {
    const helper = this;
    const fn = descriptor.value;

    return {
      configurable: true,
      get() {
        if (this === fn.prototype || this.hasOwnProperty(key)) {
          return fn;
        }

        const boundFn = function () {
          if (helper.odux) {
            const useFunc = use ? helper.odux.transactionChange : helper.odux.directWriteChange;
            useFunc.bind(helper.odux)(() => {
              fn.apply(target, [...arguments]);
            });
          } else {
            console.warn(`Can't use @tracking, no Odux on IOCContext. method: ${getGlobalType(target.constructor)} -> ${key}`);
            fn.apply(target, [...arguments]);
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
