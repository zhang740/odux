export function getPath(path: string, key: string): string {
    let readPath = path;
    if (readPath && readPath !== '') {
        readPath += '.';
    }
    readPath += key;
    return readPath;
}