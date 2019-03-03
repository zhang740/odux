export class BaseEvent<EventType = {}> {
  public data: EventType;

  constructor(data?: EventType) {
    this.data = data || ({} as EventType);
  }
}
