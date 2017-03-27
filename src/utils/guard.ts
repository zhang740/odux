export function guard<T>(func: () => T, defaultValue?: T, onError?: (error: Error) => void): T {
    try {
        return func()
    } catch (error) {
        onError && onError(error)
        return defaultValue
    }
}