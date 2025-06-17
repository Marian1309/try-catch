// --- Type Guards ---
export const isSuccess = (result) => result.status === "success";
export const isFailure = (result) => result.status === "failure";
// --- Core Async Wrapper with Selector ---
export const tryCatch = async (promise, options) => {
    try {
        const data = await promise;
        const selectedData = options?.select
            ? options.select(data)
            : data;
        return {
            status: "success",
            data: selectedData,
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
