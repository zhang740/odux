import { Spy } from './Spy'

export class ProxyObject<T> {

    constructor(
        protected spy: Spy,
        protected value: T,
        protected key: string,
        protected parentPath: string,
        protected fullPath: string,
    ) {
        this.spy.spyReport({
            type: 'Create',
            key,
            parentPath,
            fullPath,
            newValue: value,
        })
    }

    get() {
        this.spy.spyReport({
            type: 'Read',
            key: this.key,
            parentPath: this.parentPath,
            fullPath: this.fullPath,
            newValue: this.value,
        })
        return this.value
    }

    set(newValue: T) {
        const oldValue = this.value
        this.value = newValue
        this.spy.spyReport({
            type: 'Update',
            key: this.key,
            parentPath: this.parentPath,
            fullPath: this.fullPath,
            newValue: newValue,
            oldValue: oldValue
        })
    }
}