import { IocContext } from 'power-di';

export class OduxConfig {
  devMode ? = false;
  /**  dispatch data delay time, ms. default: 0. -1：sync，>=0：async */
  dispatchDelay ? = 0;
  iocContext ? = IocContext.DefaultInstance;
  isDebug ? = false;
}
