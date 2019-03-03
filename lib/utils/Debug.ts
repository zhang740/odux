const hasGroup = !!console.group;
export class Debug {
  isDebug = false;

  warn = console.warn;
  error = console.error;

  trace(...msg: any[]) {
    if (hasGroup) this.isDebug && console.trace.apply(console, msg);
  }

  log(...msg: any[]) {
    if (hasGroup) this.isDebug && console.log.apply(console, msg);
  }

  info(...msg: any[]) {
    if (hasGroup) this.isDebug && console.info.apply(console, msg);
  }

  group(msg: string) {
    if (console.group) this.isDebug && console.group(msg);
  }
  groupCollapsed(msg: string) {
    if (console.groupCollapsed) this.isDebug && console.groupCollapsed(msg);
  }
  groupEnd() {
    if (console.groupEnd) this.isDebug && console.groupEnd();
  }
}
