import { IocContext } from 'power-di';
import { Helper, createOduxAIO } from '../../lib';

export function getHelper() {
  const iocContext = new IocContext;
  const odux = createOduxAIO({ iocContext });

  return new Helper(iocContext);
}
