import { Odux } from '../core/Odux';
import { OduxConfig } from '../core/OduxConfig';
import { BaseAction } from '../action/BaseAction';

export function createOdux(config?: OduxConfig) {
    const odux = new Odux(undefined, config);
    BaseAction.GlobalAdapters.push(odux);
    return odux;
}