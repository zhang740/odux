import { IocContext, RegisterOptions } from 'power-di';
import { getDecorators } from 'power-di/helper';
import { getSuperClassInfo } from 'power-di/utils';
import {
  InferableComponentEnhancerWithProps,
  DispatchProp,
} from 'react-redux';

import { connect as oduxConnect, MapStateToProps } from '../core/connect';
import { BaseStore } from '../store/BaseStore';
import { IStore, IStoreAdapter } from '../interface';

export class Decorators {
  private decorators = getDecorators(this.ioc);
  public get iocContext() { return this.ioc; }

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

  bindProperty = (bindKey?: string, initial?: () => any) => (target: BaseStore, key: string) => {
    const property = bindKey || key;

    Object.defineProperty(target, key, {
      get: function (this: BaseStore) {
        let result = this.Data[property];
        if (!result && initial !== undefined) {
          this.Adapter.directWriteChange(() => {
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

  connect = <T>(mapper: (ioc: IocContext) => MapStateToProps<T, any>) => {
    return oduxConnect(mapper(IocContext.DefaultInstance));
  }

  inject = (type: Object) => {

    return this.decorators.lazyInject(type, true);
  }

  /**
   * Component
   *
   * @template T OwnPropsType
   * @template P MapperPropsType
   * @param {(ioc: IocContext) => (ownProps?: T) => P} mapper
   * @param {(MapperPropsType?: P) => any} component (MapperPropsType only for type) `typeof MapperPropsType`
   * @returns Component
   * @memberof Decorators
   */
  component<T, P>(
    mapper: (ioc: IocContext) => (ownProps?: T) => P,
    component: (
      // (only for type) `typeof MapperPropsType`
      MapperPropsType?: P
    ) => any
  ) {
    return oduxConnect<T>(mapper(this.ioc))(component());
  }
}

export const decorators = new Decorators(IocContext.DefaultInstance);
