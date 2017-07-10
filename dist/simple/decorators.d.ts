import { IocContext, RegisterOptions } from 'power-di';
export declare const lazyInject: (type: any, always?: boolean, subClass?: boolean) => (target: any, key: any) => void, register: (key?: string | Function, options?: RegisterOptions) => (target: any) => void, registerSubClass: (key?: string | Function, options?: RegisterOptions) => (target: any) => void;
import { MapStateToProps } from '../core/connect';
export declare function registerStore(): (target: any) => void;
export declare function connect<T>(mapper: (ioc: IocContext) => MapStateToProps<T>): any;
