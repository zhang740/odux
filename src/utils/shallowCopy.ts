export function shallowCopy(data: any, copyMeta = true) {
    let newData: any
    if (data instanceof Array) {
        newData = [].concat(data)
        // if (copyMeta) {
        //     this.setMeta(newData, this.getMeta(data))
        // }
    } else if (data instanceof Object) {
        // newData = Object.assign({}, data)
        newData = {}
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const element = data[key]
                newData[key] = element
            }
        }
        // if (copyMeta) {
        //     this.setMeta(newData, this.getMeta(data))
        // }
    } else {
        newData = data
    }
    return newData
}