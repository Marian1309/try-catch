/**
 * @package @pidchashyi/try-catch
 * A TypeScript utility package for elegant error handling with Result types
 * @author [Marian Pidchashyi]
 * @license MIT
 */

// ==============================
// Core Type Definitions
// ==============================

/**
 * Represents a successful operation with data
 */
export type Success<T> = {
  status: "success";
  data: T;
  error: null;
  performance?: number;
};

/**
 * Represents a failed operation with error
 */
export type Failure<E> = {
  status: "failure";
  data: null;
  error: E;
  performance?: number;
};

/**
 * Union type representing either Success or Failure
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;

// ==============================
// Configuration Types
// ==============================

/**
 * Configuration options for retry mechanism
 */
export type RetryOptions = {
  /** Number of retry attempts */
  retries: number;
  /** Delay between retries in milliseconds */
  delayMs?: number;
};

/**
 * Base configuration options for try-catch operations
 */
export type BaseTryCatchOptions<E = Error> = {
  /** Enable error logging to console */
  logError?: boolean;
  /** Custom error handler callback */
  onError?: (error: E) => void;
  /** Callback executed after try-catch regardless of outcome */
  onFinally?: () => void;
  /** Enable performance tracking in seconds */
  performance?: boolean;
};

/**
 * Extended options for async try-catch operations
 */
export type TryCatchOptions<E = Error> = BaseTryCatchOptions<E> & {
  /** Retry configuration */
  retry?: RetryOptions;
};

/**
 * Extended options for tryCatchAll including failure behavior
 */
export type TryCatchAllOptions<E = Error> = BaseTryCatchOptions<E> & {
  /**
   * If true, fails immediately on first error (default)
   * If false, continues execution and collects all results and errors
   */
  failFast?: boolean;
};

/**
 * Represents partial results when using fail-soft mode
 * Contains both successful results and errors that occurred
 */
export type PartialResults<T, E = Error> = {
  /** Array of successful results */
  successes: T[];
  /** Array of errors that occurred */
  errors: E[];
  /** Original indices of successful results */
  successIndices: number[];
  /** Original indices of failed results */
  errorIndices: number[];
};

// ==============================
// Type Guards
// ==============================

/**
 * Type guard to check if a Result is successful
 */
export const isSuccess = <T, E>(result: Result<T, E>): result is Success<T> =>
  result.status === "success";

/**
 * Type guard to check if a Result is a failure
 */
export const isFailure = <T, E>(result: Result<T, E>): result is Failure<E> =>
  result.status === "failure";

// ==============================
// Utility Functions
// ==============================

/**
 * Creates a promise that resolves after specified milliseconds
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Converts any unknown thrown value into a standard Error instance
 */
export const toError = (error: unknown): Error =>
  error instanceof Error ? error : new Error(String(error));

/**
 * Extracts a readable error message from any thrown error
 */
export const getErrorMessage = (error: unknown): string =>
  toError(error).message;

/**
 * Maps a Result's success value to a new value while preserving the Result wrapper
 * If the Result is a failure, it is returned unchanged
 */
export const map = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> => {
  if (isSuccess(result)) {
    return {
      status: "success",
      data: fn(result.data),
      error: null,
    };
  }
  return result;
};

// ==============================
// Core Functions
// ==============================

/**
 * Synchronous try-catch wrapper
 * @param fn - Function to be executed
 * @param options - Configuration options
 * @returns Result object containing either success data or error
 */
export const tryCatchSync = <T, S = T, E = Error>(
  fn: () => T,
  options?: BaseTryCatchOptions<E> & {
    /** Optional data transformer */
    select?: (data: T) => S;
  }
): Result<S, E> => {
  const startTime = options?.performance ? performance.now() : 0;

  try {
    const data = fn();
    const selectedData = options?.select
      ? options.select(data)
      : (data as unknown as S);

    const result: Success<S> = {
      status: "success",
      data: selectedData,
      error: null,
    };

    if (options?.performance) {
      result.performance = (performance.now() - startTime) / 1000;
    }

    return result;
  } catch (error: unknown) {
    const processedError = toError(error) as E;

    if (options?.logError) console.error("Error occurred:", processedError);
    options?.onError?.(processedError);

    const result: Failure<E> = {
      status: "failure",
      data: null,
      error: processedError,
    };

    if (options?.performance) {
      result.performance = (performance.now() - startTime) / 1000;
    }

    return result;
  } finally {
    options?.onFinally?.();
  }
};

/**
 * Asynchronous try-catch wrapper with retry capabilities
 * @param promiseFactory - Function that returns a promise to be executed
 * @param options - Configuration options
 * @returns Result object containing either success data or error
 */
export const tryCatch = async <T, S = T, E = Error>(
  promiseFactory: Promise<T>,
  options?: TryCatchOptions<E> & {
    /** Optional data transformer */
    select?: (data: T) => S;
  }
): Promise<Result<S, E>> => {
  const {
    retry,
    select,
    logError,
    onError,
    onFinally,
    performance: trackPerformance,
  } = options || {};
  const maxRetries = retry?.retries ?? 1;
  let attempt = 0;
  const startTime = trackPerformance ? performance.now() : 0;

  try {
    while (attempt < maxRetries) {
      try {
        const data = await promiseFactory;
        const selectedData = select ? select(data) : (data as unknown as S);

        const result: Success<S> = {
          status: "success",
          data: selectedData,
          error: null,
        };

        if (trackPerformance) {
          result.performance = (performance.now() - startTime) / 1000;
        }

        return result;
      } catch (error: unknown) {
        attempt++;
        const processedError = toError(error) as E;

        if (logError) console.error("Error occurred:", processedError);
        onError?.(processedError);

        if (attempt >= maxRetries) {
          const result: Failure<E> = {
            status: "failure",
            data: null,
            error: processedError,
          };

          if (trackPerformance) {
            result.performance = (performance.now() - startTime) / 1000;
          }

          return result;
        }

        if (retry?.delayMs) await sleep(retry.delayMs);
      }
    }

    // This should never be reached due to the while loop condition
    throw new Error("Unexpected retry failure");
  } catch (error: unknown) {
    const result: Failure<E> = {
      status: "failure",
      data: null,
      error: toError(error) as E,
    };

    if (trackPerformance) {
      result.performance = (performance.now() - startTime) / 1000;
    }

    return result;
  } finally {
    onFinally?.();
  }
};

/**
 * Executes multiple promises concurrently and returns a Result with an array of values
 * Uses fail-fast behavior - if any promise fails, the entire operation fails
 * @param promises - Array of promises to execute
 * @param options - Configuration options for error handling
 */
export const tryCatchAll = async <T, E = Error>(
  promises: Promise<T>[],
  options?: BaseTryCatchOptions<E>
): Promise<Result<T[], E>> => {
  const {
    logError,
    onError,
    onFinally,
    performance: trackPerformance,
  } = options || {};
  const startTime = trackPerformance ? performance.now() : 0;

  try {
    const results = await Promise.all(promises);
    const result: Success<T[]> = {
      status: "success",
      data: results,
      error: null,
    };

    if (trackPerformance) {
      result.performance = (performance.now() - startTime) / 1000;
    }

    return result;
  } catch (error: unknown) {
    const processedError = toError(error) as E;
    if (logError) console.error("Error occurred:", processedError);
    onError?.(processedError);

    const result: Failure<E> = {
      status: "failure",
      data: null,
      error: processedError,
    };

    if (trackPerformance) {
      result.performance = (performance.now() - startTime) / 1000;
    }

    return result;
  } finally {
    onFinally?.();
  }
};

/**
 * Executes multiple promises concurrently and collects all results and errors
 * Uses fail-soft behavior - continues execution even if some promises fail
 * @param promises - Array of promises to execute
 * @param options - Configuration options for error handling
 */
export const tryCatchAllSafe = async <T, E = Error>(
  promises: Promise<T>[],
  options?: BaseTryCatchOptions<E>
): Promise<Result<PartialResults<T, E>, E>> => {
  const {
    logError,
    onError,
    onFinally,
    performance: trackPerformance,
  } = options || {};
  const startTime = trackPerformance ? performance.now() : 0;

  try {
    const results = await Promise.allSettled(promises);
    const partialResults: PartialResults<T, E> = {
      successes: [],
      errors: [],
      successIndices: [],
      errorIndices: [],
    };

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        partialResults.successes.push(result.value);
        partialResults.successIndices.push(index);
      } else {
        const error = toError(result.reason) as E;
        partialResults.errors.push(error);
        partialResults.errorIndices.push(index);
        if (logError) console.error(`Error at index ${index}:`, error);
        onError?.(error);
      }
    });

    // If all promises failed, return failure
    if (partialResults.successes.length === 0) {
      const result: Failure<E> = {
        status: "failure",
        data: null,
        error: new Error(
          `All ${partialResults.errors.length} promises failed`
        ) as E,
      };

      if (trackPerformance) {
        result.performance = (performance.now() - startTime) / 1000;
      }

      return result;
    }

    // Return partial results if at least one promise succeeded
    const result: Success<PartialResults<T, E>> = {
      status: "success",
      data: partialResults,
      error: null,
    };

    if (trackPerformance) {
      result.performance = (performance.now() - startTime) / 1000;
    }

    return result;
  } catch (error: unknown) {
    // This should rarely happen as Promise.allSettled doesn't reject
    const processedError = toError(error) as E;
    if (logError) console.error("Unexpected error:", processedError);
    onError?.(processedError);

    const result: Failure<E> = {
      status: "failure",
      data: null,
      error: processedError,
    };

    if (trackPerformance) {
      result.performance = (performance.now() - startTime) / 1000;
    }

    return result;
  } finally {
    onFinally?.();
  }
};
