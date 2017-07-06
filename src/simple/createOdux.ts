import { Odux } from '../Odux';
import { OduxConfig } from '../OduxConfig';
import { BaseAction } from '../action/BaseAction';

export function createOdux(config?: OduxConfig) {
    const odux = new Odux(undefined, config);
    BaseAction.GlobalAdapters.push(odux);
    return odux;
}