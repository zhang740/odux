import * as React from 'react';
import * as PropTypes from 'prop-types';
import { IocContext } from 'power-di';
import { getGlobalType } from 'power-di/utils';
import { EventBus } from '../event';
import { ChangeEvent } from '../core';
import { shallowEqual } from '../utils';
import { getMetadata, PropsKeySymbol } from '../helper/helper';

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
    const propsMapper: MapToProps<OwnPropsType, MapperPropsType> = (state, ownProps, ioc) => {
      let mapperProps = {};
      if (mapper) {
        mapperProps = mapper(state, ownProps, ioc) || {};
      }

      const bindData = {};
      const connect = getMetadata(target).connect;
      if (connect) {
        for (const key in connect) {
          bindData[key] = connect[key](ioc);
        }
      }
      return {
        ...(ownProps || {}),
        ...mapperProps,
        [PropsKeySymbol]: bindData,
        _debug: bindData,
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

      constructor(props: OwnPropsType, context: any) {
        super(props, context);

        this.ioc = context.iocContext || IocContext.DefaultInstance;
        this.eventBus = this.ioc.get(EventBus);
        this.state = { data: propsMapper(this.state, props, this.ioc) };
      }

      onReduxChange = (evt: ChangeEvent) => {
        this.checkStateChange();
      }

      componentDidMount() {
        this.eventBus.addEventListener(ChangeEvent, this.onReduxChange);
      }
      componentWillUnmount() {
        this.eventBus.removeEventListener(ChangeEvent, this.onReduxChange);
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
