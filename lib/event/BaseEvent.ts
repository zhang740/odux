export class BaseEvent<EventType = {}> {

  public message: EventType;

  constructor(message?: EventType) {
    this.message = message || {} as EventType;
  }
}
