export declare type MapStateToProps<T> = (ownProps?: T) => T;
export declare function connect<T>(mapper: MapStateToProps<T>): any;
