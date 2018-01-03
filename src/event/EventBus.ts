import { BaseEvent } from './BaseEvent';
import { getGlobalType } from 'power-di/utils';

export class EventBus {

  private eventHandlers: { [key: string]: ((event: BaseEvent) => void)[] } = {};

  /**
   * addEventListener
   * @param eventType typeof BaseEvent, break with ts@2.4.1
   * @param callback event callback
   */
  public addEventListener<T extends BaseEvent>(eventType: any, callback: (event: T) => void) {
    const type = this.getEventType(eventType);
    if (!this.eventHandlers[type]) {
      this.eventHandlers[type] = [];
    }
    this.eventHandlers[type].push(callback);
  }

  /**
   * removeEventListener
   * @param eventType typeof BaseEvent, break with ts@2.4.1
   * @param callback event callback
   */
  public removeEventListener<T extends BaseEvent>(eventType: any, callback: (event: T) => void) {
    const type = this.getEventType(eventType);
    const element = this.eventHandlers[type];
    if (element) {
      const index = element.indexOf(callback);
      if (index !== -1) {
        element.splice(index, 1);
      }
    }
  }

  public removeAllEventListeners(eventType: any) {
    const type = this.getEventType(eventType);
    this.eventHandlers[type] = [];
  }

  public emit<T extends BaseEvent>(event: T) {
    if (!(event instanceof BaseEvent)) {
      throw new Error(`need instance of 'BaseEvent', but ${typeof event}.`);
    }
    const type = this.getEventType(event.constructor);
    this.eventHandlers[type] &&
      this.eventHandlers[type].forEach((handler) => {
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
