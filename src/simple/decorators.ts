import { IocContext, RegisterOptions } from 'power-di';
import { getDecorators } from 'power-di/helper';
import { getSuperClassInfo } from 'power-di/utils';
const decorators = getDecorators();
import { connect as oduxConnect, MapStateToProps } from '../core/connect';

export function registerStore() {
  return decorators.register(undefined, { autoNew: false, regInSuperClass: true });
}

export function connect<T>(mapper: (ioc: IocContext) => MapStateToProps<T>) {
  return oduxConnect(mapper(IocContext.DefaultInstance));
}

export function inject(type: any) {

  return decorators.lazyInject(type, true);
}

export type CMapStateToProps<T> = (ownProps?: T) => {
  Props: T, Component: any,
};
export function component<T>(mapper: (ioc: IocContext) => CMapStateToProps<T>) {
  const Component = mapper(IocContext.DefaultInstance)({} as any).Component;
  return oduxConnect<T>(
    (props) => mapper(IocContext.DefaultInstance)(props).Props
  )(Component);
}
