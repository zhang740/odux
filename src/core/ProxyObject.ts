import { EventBus, SpyEvent } from '../event';
import { TrackingData } from './TrackingData';
import { OduxConfig } from './OduxConfig';

export class ProxyObject<T = any> {

  constructor(
    protected eventBus: EventBus,
    protected config: OduxConfig,
    protected trackingData: TrackingData,
    protected parentObject: any,
    protected value: T,
    protected key: string,
    protected parentPath: string,
    protected fullPath: string,
  ) {
    this.eventBus.emit(new SpyEvent({
      type: 'Create',
      key,
      parentObject,
      parentPath,
      fullPath,
      newValue: value,
    }));
  }

  get() {
    this.eventBus.emit(new SpyEvent({
      type: 'Read',
      key: this.key,
      parentObject: this.parentObject,
      parentPath: this.parentPath,
      fullPath: this.fullPath,
      newValue: this.value,
    }));
    return this.value;
  }

  set(newValue: T) {
    const oldValue = this.value;
    this.value = newValue;
    this.eventBus.emit(new SpyEvent({
      type: 'Update',
      key: this.key,
      parentObject: this.parentObject,
      parentPath: this.parentPath,
      fullPath: this.fullPath,
      newValue: newValue,
      oldValue: oldValue
    }));
  }
}
