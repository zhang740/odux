import { Odux } from '../core/Odux';
import { OduxConfig } from '../core/OduxConfig';
import { BaseAction } from '../action/BaseAction';

export function createOdux(config?: OduxConfig) {
    const odux = new Odux(undefined, config);
    BaseAction.GlobalAdapters.push(odux);
    return odux;
}

import { createStore, applyMiddleware, compose, Store } from 'redux';
export function createOduxAIO(config?: OduxConfig, middlewares: any[] = []) {

    const finalCreateStore: any = (compose as any)(
        applyMiddleware(...middlewares),
        this.window && (this.window as any).devToolsExtension && config.isDebug ?
            (window as any).devToolsExtension() : (f: any) => f
    )(createStore);

    const odux = createOdux(config);

    odux.setRootStore(finalCreateStore(odux.mainReducer.bind(odux)));

    return odux;
}