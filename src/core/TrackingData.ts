import { SpyEventType } from '../event';

export interface ChangeTrackData extends SpyEventType {
    _source?: string;
}

export class TrackingData {
    readTracking: { [key: string]: { value: ChangeTrackData } } = {};
    changeTracking: ChangeTrackData[] = [];
    changeDatas: ChangeTrackData[] = [];
    isTracking: number = 0;
    isDirectWriting: boolean = false;
}