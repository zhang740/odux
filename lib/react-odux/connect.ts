import * as React from 'react';
import * as PropTypes from 'prop-types';
import { IocContext } from 'power-di';
import { getGlobalType } from 'power-di/utils';
import { EventBus, StoreChangeEvent } from '../event';
import { shallowEqual } from '../utils';
import { getMetadata, PropsKeySymbol } from '../helper/helper';
import { BaseStore } from '../core';
import { getStoreMeta } from '../core/BaseStore';

export type MapToProps<OwnPropsType, MapperPropsType> = (
  state: any,
  ownProps: OwnPropsType,
  ioc: IocContext
) => MapperPropsType;

export interface StateType {
  data: any;
}

export function connect<OwnPropsType, MapperPropsType>(
  mapper?: MapToProps<OwnPropsType, MapperPropsType>
) {
  return function(target: any) {
    let storeKeys: string[] = [];

    const propsMapper: MapToProps<OwnPropsType, MapperPropsType> = (state, ownProps, ioc) => {
      let mapperProps = {};
      if (mapper) {
        mapperProps = mapper(state, ownProps, ioc) || {};
      }

      const bindData = {};
      const connect = getMetadata(target).connect;
      if (connect) {
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

      ioc: IocContext;
      eventBus: EventBus;
      needUpdate = true;
      cId: string;

      constructor(props: OwnPropsType, context: any) {
        super(props, context);

        this.ioc = context.iocContext || IocContext.DefaultInstance;
        this.eventBus = this.ioc.get(EventBus);
        this.state = { data: propsMapper(this.state, props, this.ioc) };
      }

      onStoreChange = (evt: StoreChangeEvent) => {
        this.checkStateChange();
      }

      componentDidMount() {
        this.cId = this.eventBus.setComponentListener(undefined, this.onStoreChange, storeKeys);
      }

      componentWillUnmount() {
        this.eventBus.setComponentListener(this.cId);
      }

      componentWillReceiveProps(nextProps: Readonly<OwnPropsType>, nextContext: any) {
        this.checkStateChange(nextProps);
      }

      shouldComponentUpdate(
        nextProps: Readonly<OwnPropsType>,
        nextState: Readonly<{}>,
        nextContext: any
      ) {
        return this.needUpdate;
      }

      checkStateChange(props = this.props) {
        const newState = propsMapper(this.state, this.props, this.ioc);
        this.needUpdate = !shallowEqual(this.state.data, newState);
        if (this.needUpdate) {
          this.setState({
            data: newState,
          });
        }
        this.needUpdate = this.needUpdate || !shallowEqual(this.props, props);
      }

      render() {
        return React.createElement(target, {
          ...(this.props as any),
          ...this.state.data,
        });
      }
    };

    const wrappedComponentName =
      target.displayName || target.name || getGlobalType(target) || 'Component';
    Connect.displayName = `Odux(${wrappedComponentName})`;

    return Connect as React.ClassType<any, any, any>;
  };
}
