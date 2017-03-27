export interface SpyEvent {
    type: 'Create' | 'Update' | 'Read' | 'New'
    key: string
    parentPath: string
    fullPath: string
    object?: any
    newValue?: any
    oldValue?: any
}

export class Spy {
    private spyListeners: ((event: SpyEvent) => void)[] = []

    isSpyEnabled() {
        return !!this.spyListeners.length
    }

    spyReport(event: SpyEvent) {
        if (!this.spyListeners.length)
            return false
        const listeners = this.spyListeners
        for (let i = 0, l = listeners.length; i < l; i++)
            listeners[i](event)
    }

    addListener(listener: (change: any) => void) {
        this.spyListeners.push(listener)
    }

    removeListener(listener: (change: any) => void) {
        const idx = this.spyListeners.indexOf(listener)
        if (idx >= 0) {
            this.spyListeners.splice(idx, 1)
        }
    }
}