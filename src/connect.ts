import { connect as nativeConnect } from 'react-redux';
import { IocContext } from 'power-di';

export type MapStateToProps<T> = (ownProps?: T) => T;

export function connect<T>(mapper: MapStateToProps<T>) {
    return nativeConnect(
        (state: any, props: T) => mapper(props),
    ) as any;
}