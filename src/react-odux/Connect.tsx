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

  return function (WrappedComponent: any) {
    const Connect = class extends React.Component<OwnPropsType, StateType> {
      static WrappedComponent: any;
      static displayName: string;

      eventBus: EventBus;
      needUpdate = true;

      constructor(props: OwnPropsType, context: any) {
        super(props, context);

        this.eventBus = ioc.get(EventBus);

        this.state = { data: mapper(ioc, props), };
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
        const newState = mapper(ioc, this.props);
        this.needUpdate = !shallowEqual(this.state.data, newState);
        console.warn('debug', this.needUpdate, Connect.displayName, this.state.data, newState);
        if (this.needUpdate) {
          this.setState({
            data: newState,
          });
        }
      }

      render() {
        console.log('render', Connect.displayName, this.state);
        return React.createElement(WrappedComponent, this.state.data);
      }
    };

    const wrappedComponentName = WrappedComponent.displayName
      || WrappedComponent.name
      || getGlobalType(WrappedComponent)
      || 'Component';
    Connect.displayName = `Odux(${wrappedComponentName})`;

    return Connect;
  };
}
