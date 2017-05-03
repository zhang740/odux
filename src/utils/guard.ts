export function guard<T>(func: () => T, defaultValue?: T, onError?: (error: Error) => T | void): T {
    try {
        return func();
    } catch (error) {
        return (onError && onError(error)) || defaultValue;
    }
}