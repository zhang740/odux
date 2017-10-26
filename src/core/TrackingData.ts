import { SpyEventType } from './SpyEvent';

export interface ChangeTrackData extends SpyEventType {
  _source?: string;
}

export class TrackingData {
  readTracking: { [key: string]: { value: ChangeTrackData } } = {};
  changeTracking: ChangeTrackData[] = [];
  changeDatas: ChangeTrackData[] = [];
  isTracking: number = 0;
  isDirectWriting: boolean = false;

  addChangeTracking = (data: ChangeTrackData) => {
    if (this.isDirectWriting) {
      data.parentObject[data.key] = data.newValue;
    } else {
      this.changeTracking.push(data);
    }
  }
}
