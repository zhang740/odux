export class OduxConfig {
    prefix?: string;
    isDebug?= false;
    /**  dispatch data delay time, ms. -1：sync，>=0：async */
    dispatchDelay?= 0;
    /** TODO 是否使用事务提交。修改及时生效，或者仅在tracking中、dispatch后生效 */
    transaction?= false;
    autoTracking?= true;
}