import { BaseEvent } from './BaseEvent';
import { ClassType } from 'power-di';
import { getGlobalType } from 'power-di/utils';

export class StoreChangeEvent extends BaseEvent<
  {
    storeKey?: string;
    value: any;
  }[]
> {}

const getUid = (function() {
  let id = 0;
  return () => id++;
})();

export class EventBus {
  private eventHandlers: { [key: string]: ((event: BaseEvent) => void)[] } = {};
  private componentListeners: {
    cId: string;
    listener: (evt: StoreChangeEvent) => void;
    storeKeys?: string[];
  }[] = [];

  public setComponentListener(
    cId: string,
    listener?: (evt: StoreChangeEvent) => void,
    storeKeys?: string[]
  ) {
    const clIndex = this.componentListeners.findIndex(c => c.cId === cId);
    if (!listener && clIndex >= 0) {
      this.componentListeners.splice(clIndex, 1);
      return;
    }
    const cl = this.componentListeners[clIndex];
    if (!cl) {
      if (!cId) {
        cId = `$odux$cl_${getUid()}`;
      }
      this.componentListeners.push({ cId, listener, storeKeys });
    } else {
      cl.listener = listener;
      cl.storeKeys = storeKeys;
    }
    return cId;
  }

  public emitComponentEvent(evt: StoreChangeEvent) {
    const storeKeys = evt.data.map(e => e.storeKey).filter(s => s);
    const components = storeKeys.length
      ? this.componentListeners.filter(
          cl => !cl.storeKeys || storeKeys.some(sk => cl.storeKeys.indexOf(sk) >= 0)
        )
      : this.componentListeners;
    components.forEach(cl => {
      cl.listener(evt);
    });
  }

  /**
   * addEventListener
   * @param eventType typeof BaseEvent
   * @param callback event callback
   */
  public addListener<T extends ClassType>(
    eventType: T,
    callback: (event: InstanceType<T>) => void
  ) {
    const type = this.getEventType(eventType);
    if (!this.eventHandlers[type]) {
      this.eventHandlers[type] = [];
    }
    this.eventHandlers[type].push(callback);
  }

  /**
   * removeEventListener
   * @param eventType typeof BaseEvent
   * @param callback event callback
   */
  public removeListener<T extends ClassType>(
    eventType: T,
    callback: (event: InstanceType<T>) => void
  ) {
    const type = this.getEventType(eventType);
    const element = this.eventHandlers[type];
    if (element) {
      const index = element.indexOf(callback);
      if (index !== -1) {
        element.splice(index, 1);
      }
    }
  }

  public removeAllListeners<T extends BaseEvent>(eventType: T) {
    const type = this.getEventType(eventType);
    this.eventHandlers[type] = [];
  }

  public emit<T extends BaseEvent>(event: T) {
    if (!(event instanceof BaseEvent)) {
      throw new Error(`need instance of 'BaseEvent', but ${typeof event}.`);
    }
    const type = this.getEventType(event.constructor);
    this.eventHandlers[type] &&
      this.eventHandlers[type].forEach(handler => {
        handler(event);
      });
  }

  private getEventType(evt: any) {
    try {
      return getGlobalType(evt);
    } catch (error) {
      throw new Error(`EventType NotFound. ${error}`);
    }
  }
}
