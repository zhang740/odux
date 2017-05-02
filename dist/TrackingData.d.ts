import { SpyEventType } from './event';
export interface ChangeTrackData extends SpyEventType {
    _source?: string;
}
export declare class TrackingData {
    readTracking: {
        [key: string]: {
            value: ChangeTrackData;
        };
    };
    changeTracking: ChangeTrackData[];
    changeDatas: ChangeTrackData[];
    isTracking: number;
    isDirectWriting: boolean;
}
