export function compare(preObj: any, nxtObj: any, before: string = '') {
  if (nxtObj instanceof Object || nxtObj instanceof Array) {
    for (let key in nxtObj) {
      if (nxtObj.hasOwnProperty(key)) {
        let iseq = !!preObj && !!nxtObj && preObj[key] === nxtObj[key];
        if (
          preObj &&
          nxtObj &&
          preObj[key] &&
          nxtObj[key] &&
          preObj[key] instanceof Function &&
          nxtObj[key] instanceof Function
        ) {
          iseq = false;
        }
        let str = before + '.' + key;
        if (iseq) {
          console.log(str, iseq);
        } else {
          console.info(str, iseq);
        }
      }
      if (preObj instanceof Object || preObj instanceof Array) {
        compare(preObj[key], nxtObj[key], before + '.' + key);
      }
    }
  }
}
