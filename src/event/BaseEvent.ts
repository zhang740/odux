export class BaseEvent<EventType = any> {

    public message: EventType;

    constructor(message?: EventType) {
        this.message = message || {} as EventType;
    }
}