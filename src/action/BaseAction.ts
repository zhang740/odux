import { IStore } from '../interface'
export class BaseAction {

    private storeManager: IStore<any>[] = []

    protected addStore(store: IStore<any>) {
        store && this.storeManager.push(store)
    }

    protected trackingBegin(stores?: IStore<any>[]) {
        (stores || this.storeManager).forEach((store) => {
            store.Adapter && store.Adapter.transactionBegin()
        })
    }

    protected tracking(func: () => void, stores?: IStore<any>[], onErr?: (err: any) => void, ) {
        (stores || this.storeManager).forEach((store) => {
            store && store.Adapter && store.Adapter.transactionBegin()
        })
        try {
            func()
        } catch (error) {
            onErr && onErr(error)
        }
        (stores || this.storeManager).forEach((store) => {
            store && store.Adapter && store.Adapter.transactionEnd()
        })
    }

    protected trackingEnd(stores?: IStore<any>[]) {
        (stores || this.storeManager).forEach((store) => {
            store && store.Adapter && store.Adapter.transactionEnd()
        })
    }
}