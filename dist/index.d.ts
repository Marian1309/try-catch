export type Success<T> = {
    status: "success";
    data: T;
    error: null;
};
export type Failure<E> = {
    status: "failure";
    data: null;
    error: E;
};
export type Result<T, E = Error> = Success<T> | Failure<E>;
export declare const isSuccess: <T, E>(result: Result<T, E>) => result is Success<T>;
export declare const isFailure: <T, E>(result: Result<T, E>) => result is Failure<E>;
export type TryCatchOptions<E = Error> = {
    /**
     * Log the error to the console.
     */
    logError?: boolean;
    /**
     * Optional custom error handler.
     */
    onError?: (error: E) => void;
    /**
     * Called regardless of success/failure.
     */
    onFinally?: () => void;
};
export declare const tryCatch: <T, S = T, E = Error>(promise: Promise<T>, options?: TryCatchOptions<E> & {
    /**
     * Selector function to pick/transform the resolved data.
     */
    select?: (data: T) => S;
}) => Promise<Result<S, E>>;
