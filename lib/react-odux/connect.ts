import * as React from 'react';
import { IocContext } from 'power-di';
import { getGlobalType } from 'power-di/utils';
import { Odux } from '../core';
import { EventBus } from '../event';
import { ChangeEvent, ChangeDispatch } from '../core';
import { shallowEqual } from '../utils';

export type MapToProps<OwnPropsType, MapperPropsType> = (ioc: IocContext, ownProps?: OwnPropsType) => MapperPropsType;

export interface StateType {
  data: any;
}

export function connect<OwnPropsType, MapperPropsType>(ioc: IocContext, mapper: MapToProps<OwnPropsType, MapperPropsType>) {

  return function (realComponent: any) {
    const propsMapper: MapToProps<OwnPropsType, MapperPropsType> =
      (ioc, ownProps) => {
        let mapperProps = {};
        if (mapper) {
          mapperProps = mapper(ioc, ownProps) || {};
        }

        const __odux_bind = {};
        const metadata = realComponent.prototype.__ODUX_PROPS;
        if (metadata) {
          for (const key in metadata) {
            __odux_bind[key] = metadata[key](ioc);
          }
        }
        return {
          ...(ownProps || {}),
          ...mapperProps,
          __odux_bind,
        } as any;
      };

    const Connect = class extends React.Component<OwnPropsType, StateType> {
      static WrappedComponent: any;
      static displayName: string;

      eventBus: EventBus;
      needUpdate = true;

      constructor(props: OwnPropsType, context: any) {
        super(props, context);

        this.eventBus = ioc.get(EventBus);

        this.state = { data: propsMapper(ioc, props), };
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

      shouldComponentUpdate(nextProps: Readonly<OwnPropsType>, nextState: Readonly<{}>, nextContext: any) {
        return this.needUpdate;
      }

      checkStateChange(props = this.props) {
        const newState = propsMapper(ioc, this.props);
        this.needUpdate = !shallowEqual(this.state.data, newState);
        if (this.needUpdate) {
          this.setState({
            data: newState,
          });
        }
        this.needUpdate = this.needUpdate || !shallowEqual(this.props, props);
      }

      render() {
        return React.createElement(realComponent, {
          ...this.props as any,
          ...this.state.data,
        });
      }
    };

    const wrappedComponentName = realComponent.displayName
      || realComponent.name
      || getGlobalType(realComponent)
      || 'Component';
    Connect.displayName = `Odux(${wrappedComponentName})`;

    return Connect;
  };
}
