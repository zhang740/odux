import { BaseEvent } from './BaseEvent';

export interface SpyEventType {
  type: 'Create' | 'Update' | 'Read' | 'New';
  key: string;
  parentObject: any;
  parentPath: string;
  fullPath: string;
  newValue?: any;
  oldValue?: any;
}

export class SpyEvent extends BaseEvent<SpyEventType> {
}
