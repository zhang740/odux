import { IStore, IStoreAdapter } from '../interface';
export class BaseAction {
    public static get GlobalAdapters() { return this.globalAdapters; }
    private static globalAdapters: IStoreAdapter[] = [];

    protected trackingBegin(stores?: IStore<any>[]) {
        ((stores && stores.map(s => s.Adapter)) || BaseAction.GlobalAdapters).forEach((adapter) => {
            adapter && adapter.transactionBegin();
        });
    }

    protected tracking(func: () => void, stores?: IStore<any>[], onErr?: (err: any) => void) {
        this.trackingBegin(stores);
        try {
            func();
        } catch (error) {
            onErr && onErr(error);
        }
        this.trackingEnd(stores);
    }

    protected trackingEnd(stores?: IStore<any>[]) {
        ((stores && stores.map(s => s.Adapter)) || BaseAction.GlobalAdapters).forEach((adapter) => {
            adapter && adapter.transactionEnd();
        });
    }
}