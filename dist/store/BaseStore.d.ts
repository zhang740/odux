import { IocContext } from 'power-di';
import { IStore, IStoreAdapter } from '../interface';
export declare function registerStore(iocContext?: IocContext): (target: any) => void;
export declare const bindProperty: (bindKey?: string, inital?: any) => (target: BaseStore<any>, key: string) => void;
export declare class BaseStore<DataType = any> implements IStore<DataType> {
    private storeAdapter;
    readonly type: string;
    static readonly type: string;
    constructor(storeAdapter: IStoreAdapter);
    readonly Data: DataType;
    readonly Adapter: IStoreAdapter;
}
