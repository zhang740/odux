import { EventBus } from './event';
import { TrackingData } from './TrackingData';
import { OduxConfig } from './OduxConfig';
export declare class ProxyObject<T = any> {
    protected eventBus: EventBus;
    protected config: OduxConfig;
    protected trackingData: TrackingData;
    protected value: T;
    protected key: string;
    protected parentPath: string;
    protected fullPath: string;
    constructor(eventBus: EventBus, config: OduxConfig, trackingData: TrackingData, value: T, key: string, parentPath: string, fullPath: string);
    get(): T;
    set(newValue: T): void;
}
