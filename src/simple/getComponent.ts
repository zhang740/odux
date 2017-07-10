import { IocContext } from 'power-di';

export function getComponent<T>(type: any) {
    return IocContext.DefaultInstance.get<T>(type);
}