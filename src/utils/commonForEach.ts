export function commonForEach(data: any, func: (key: string) => void) {
    let target: any[] = []
    const isArray = data instanceof Array
    if (isArray) {
        target = data
    } else if (data instanceof Object) {
        target = Object.keys(data)
    }
    for (let index = 0; index < target.length; index++) {
        if (isArray) {
            func(index + '')
        } else {
            func(target[index])
        }
    }
}