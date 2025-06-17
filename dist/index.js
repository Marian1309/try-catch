// --- Type Guards ---
export const isSuccess = (result) => result.status === "success";
export const isFailure = (result) => result.status === "failure";
// --- Core Async Wrapper ---
export const tryCatch = async (promise, options) => {
    try {
        const data = await promise;
        return {
            status: "success",
            data,
            error: null,
        };
    }
    catch (error) {
        const processedError = error instanceof Error ? error : new Error(String(error));
        if (options?.logError)
            console.error("Error occurred:", processedError);
        options?.onError?.(processedError);
        return {
            status: "failure",
            data: null,
            error: processedError,
        };
    }
    finally {
        options?.onFinally?.();
    }
};
