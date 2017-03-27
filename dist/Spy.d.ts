export interface SpyEvent {
    type: 'Create' | 'Update' | 'Read' | 'New';
    key: string;
    parentPath: string;
    fullPath: string;
    object?: any;
    newValue?: any;
    oldValue?: any;
}
export declare class Spy {
    private spyListeners;
    isSpyEnabled(): boolean;
    spyReport(event: SpyEvent): boolean;
    addListener(listener: (change: any) => void): void;
    removeListener(listener: (change: any) => void): void;
}
