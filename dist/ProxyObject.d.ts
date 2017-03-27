import { Spy } from './Spy';
export declare class ProxyObject<T> {
    protected spy: Spy;
    protected value: T;
    protected key: string;
    protected parentPath: string;
    protected fullPath: string;
    constructor(spy: Spy, value: T, key: string, parentPath: string, fullPath: string);
    get(): T;
    set(newValue: T): void;
}
