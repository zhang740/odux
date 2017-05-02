import { BaseEvent } from './event';
export interface SpyEventType {
    type: 'Create' | 'Update' | 'Read' | 'New';
    key: string;
    parentPath: string;
    fullPath: string;
    object?: any;
    newValue?: any;
    oldValue?: any;
}
export declare class SpyEvent extends BaseEvent<SpyEventType> {
}
