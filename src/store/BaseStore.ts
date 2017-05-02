import { IocContext } from 'power-di';
import { getGlobalType } from 'power-di/utils';
import { IStore, IStoreAdapter } from '../interface';

export function registerStore(iocContext = IocContext.DefaultInstance) {
    return function (target: any) {
        const storeAdapter = iocContext.get<IStoreAdapter>(IStoreAdapter);
        iocContext.register(new target(storeAdapter), target);
    };
}

export const bindProperty = (bindKey?: string, inital?: any) => (target: BaseStore, key: string) => {
    const property = bindKey || key;
    Object.defineProperty(target, key, {
        get: function (this: BaseStore) {
            let result = this.Data[property];
            if (!result && inital !== undefined) {
                this.Adapter.directWriteChange(() => {
                    result = this.Data[property] = inital;
                });
            }
            return result;
        },
        set: function (this: BaseStore, value) {
            this.Data[property] = value;
        }
    });
};

export class BaseStore<DataType = any> implements IStore<DataType> {

    public get type(): string {
        return getGlobalType(this.constructor);
    }
    public static get type(): string {
        return getGlobalType(this);
    }

    constructor(
        private storeAdapter: IStoreAdapter,
    ) {
        storeAdapter.registerStore && storeAdapter.registerStore(this);
    }

    public get Data(): DataType {
        return this.storeAdapter.getStoreData<DataType>(this.type);
    }

    public get Adapter(): IStoreAdapter {
        return this.storeAdapter;
    }
}