import { IStore } from './IStore';

export abstract class IStoreAdapter {
    /** 注册Store */
    abstract registerStore: (store: IStore<any>) => void;

    /** 获取仓储数据，undefined时为{} */
    abstract getStoreData<T>(storeName: string, initial?: any): T;

    /** 获取子集数据，可能为undefined */
    abstract getDataByPath(path: string): any;

    /** 初始化数据跟踪 */
    abstract initTracker(): void;

    /** 开始跟踪事务 */
    abstract transactionBegin(): void;

    /** 批量跟踪 */
    abstract transactionChange(func: () => void): void;

    /** 结束跟踪事务 */
    abstract transactionEnd(): void;

    /** 直写变更 */
    abstract directWriteChange(func: () => void): void;
}