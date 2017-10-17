import {
  connect as nativeConnect,
  InferableComponentEnhancerWithProps,
  DispatchProp,
} from 'react-redux';

export type MapStateToProps<T, P> = (ownProps?: T) => P;

export function connect<T>(mapper: MapStateToProps<T, any>) {
  return nativeConnect(
    (state: any, props: T) => mapper(props),
  );
}
