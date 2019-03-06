import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as hoistStatics from 'hoist-non-react-statics';
import { IocContext, ClassType } from 'power-di';
import { getGlobalType } from 'power-di/utils';
import { EventBus, StoreChangeEvent } from '../event';
import { shallowEqual } from '../utils';
import { getMetadata, PropsKeySymbol, DataConnectType } from './helper';
import { BaseStore, Odux } from '../core';
import { getStoreMeta } from '../core/BaseStore';

export type MapToProps<OwnPropsType, MapperPropsType> = (
  state: any,
  ownProps: OwnPropsType,
  ioc: IocContext
) => MapperPropsType;

export interface StateType {
  data: any;
}

const ConnectMetaSymbol = Symbol('ConnectMetaSymbol');

function getConnects(Type: ClassType): { [key: string]: DataConnectType } {
  const connect = getMetadata(Type).connect;
  const superType = Object.getPrototypeOf(Type);
  if (superType) {
    return {
      ...getConnects(superType),
      ...connect,
    };
  }
  return connect || {};
}

export function connect<OwnPropsType, MapperPropsType>(
  mapper?: MapToProps<OwnPropsType, MapperPropsType>
) {
  return function(WrappedComponent: any) {
    let storeKeys: string[] = [];

    const propsMapper: MapToProps<OwnPropsType, MapperPropsType> = (state, ownProps, ioc) => {
      let mapperProps = {};
      if (mapper) {
        mapperProps = mapper(state, ownProps, ioc) || {};
      }

      const bindData = {};
      const connect = getConnects(WrappedComponent);
      for (const key in connect) {
        const data = (bindData[key] = connect[key](ioc));

        // TODO 支持计算表达式解析store
        if (storeKeys) {
          if (data instanceof BaseStore) {
            storeKeys.push(getStoreMeta(data).adapter.StoreKey);
          } else {
            storeKeys = undefined;
          }
        }
      }
      return {
        ...(ownProps || {}),
        ...mapperProps,
        [PropsKeySymbol]: bindData,
      } as any;
    };

    const Connect = class extends React.Component<OwnPropsType, StateType> {
      public static contextTypes = {
        iocContext: PropTypes.any,
      };
      static displayName: string;

      [ConnectMetaSymbol]: {
        ioc?: IocContext;
        odux?: Odux;
        eventBus?: EventBus;
        needUpdate: boolean;
        cId?: string;
        inst?: any;
        onStoreChange: (evt: StoreChangeEvent) => void;
      } = {
        needUpdate: true,
        onStoreChange: (evt: StoreChangeEvent) => {
          this.checkStateChange();
        },
      };

      constructor(props: OwnPropsType, context: any) {
        super(props, context);

        const meta = this[ConnectMetaSymbol];
        meta.ioc = (context && context.iocContext) || IocContext.DefaultInstance;
        meta.odux = meta.ioc.get(Odux);
        if (!meta.odux) {
          console.warn(
            `NOTFOUND odux at iocContext (or default instance of ioc), will auto create one with 'new Odux();' on ioc.`
          );
          meta.odux = new Odux({ iocContext: meta.ioc });
        }
        meta.eventBus = meta.ioc.get(EventBus);
        const store = meta.odux.getReduxStore();
        this.state = {
          data: propsMapper(store && store.getState(), props, meta.ioc),
        };
      }

      componentDidMount() {
        this[ConnectMetaSymbol].cId = this[ConnectMetaSymbol].eventBus.setComponentListener(
          undefined,
          this[ConnectMetaSymbol].onStoreChange,
          storeKeys
        );
      }

      componentWillUnmount() {
        this[ConnectMetaSymbol].eventBus.setComponentListener(this[ConnectMetaSymbol].cId);
      }

      componentWillReceiveProps(nextProps: Readonly<OwnPropsType>, nextContext: any) {
        this.checkStateChange(nextProps);
      }

      shouldComponentUpdate(
        nextProps: Readonly<OwnPropsType>,
        nextState: Readonly<{}>,
        nextContext: any
      ) {
        return this[ConnectMetaSymbol].needUpdate;
      }

      checkStateChange(props = this.props) {
        const meta = this[ConnectMetaSymbol];
        const store = meta.odux.getReduxStore();
        const newState = propsMapper(store && store.getState(), this.props, meta.ioc);
        meta.needUpdate = !shallowEqual(this.state.data, newState);
        if (meta.needUpdate) {
          this.setState({
            data: newState,
          });
        }
        meta.needUpdate = meta.needUpdate || !shallowEqual(this.props, props);
      }

      render() {
        const props: any = this.props;
        const store = this[ConnectMetaSymbol].odux.getReduxStore();
        return React.createElement(WrappedComponent, {
          dispatch: store.dispatch,
          ...props,
          ...this.state.data,
        });
      }
    };

    const wrappedComponentName =
      WrappedComponent.displayName ||
      WrappedComponent.name ||
      getGlobalType(WrappedComponent) ||
      'Component';
    Connect.displayName = `Odux(${wrappedComponentName})`;

    return hoistStatics(Connect, WrappedComponent) as React.ClassType<any, any, any>;
  };
}
