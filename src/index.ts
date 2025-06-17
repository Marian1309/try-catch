// --- Result Types ---
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

// --- Type Guards ---
export const isSuccess = <T, E>(result: Result<T, E>): result is Success<T> =>
  result.status === "success";

export const isFailure = <T, E>(result: Result<T, E>): result is Failure<E> =>
  result.status === "failure";

// --- TryCatch Options ---
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

// --- Core Async Wrapper with Selector ---
export const tryCatch = async <T, S = T, E = Error>(
  promise: Promise<T>,
  options?: TryCatchOptions<E> & {
    /**
     * Selector function to pick/transform the resolved data.
     */
    select?: (data: T) => S;
  }
): Promise<Result<S, E>> => {
  try {
    const data = await promise;
    const selectedData = options?.select
      ? options.select(data)
      : (data as unknown as S);

    return {
      status: "success",
      data: selectedData,
      error: null,
    };
  } catch (error: unknown) {
    const processedError =
      error instanceof Error ? error : new Error(String(error));

    if (options?.logError) console.error("Error occurred:", processedError);
    options?.onError?.(processedError as E);

    return {
      status: "failure",
      data: null,
      error: processedError as E,
    };
  } finally {
    options?.onFinally?.();
  }
};
