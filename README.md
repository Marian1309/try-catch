# `@pidchashyi/try-catch`

> 🧰 Type-safe `try/catch` wrapper for async operations — returns structured `Result<T, E>` objects instead of throwing errors.

Eliminate unhandled exceptions and simplify async error handling with a clean, typed interface. Features optional logging, lifecycle hooks, retry mechanisms, performance tracking, and full type inference.

---

## 📦 Installation

```bash
npm install @pidchashyi/try-catch
```

---

## ⚙️ Core Types

### `Result<T, E>`

```ts
type Result<T, E = Error> = Success<T> | Failure<E>;
```

#### Success Type

```ts
type Success<T> = {
  status: "success"; // Always "success"
  data: T; // The successful result data
  error: null; // Always null
  performance?: number; // Execution time in seconds (if enabled)
};
```

#### Failure Type

```ts
type Failure<E> = {
  status: "failure"; // Always "failure"
  data: null; // Always null
  error: E; // The error that occurred
  performance?: number; // Execution time in seconds (if enabled)
};
```

### Configuration Types

#### RetryOptions

```ts
type RetryOptions = {
  retries: number; // Number of retry attempts
  delayMs?: number; // Delay between retries in milliseconds
};
```

#### BaseTryCatchOptions

```ts
type BaseTryCatchOptions<E = Error> = {
  logError?: boolean; // Enable error logging to console
  onError?: (error: E) => void; // Custom error handler callback
  onFinally?: () => void; // Callback executed after try-catch
  performance?: boolean; // Enable performance tracking in seconds
};
```

#### TryCatchOptions

```ts
type TryCatchOptions<E = Error> = BaseTryCatchOptions<E> & {
  retry?: RetryOptions;
};
```

#### TryCatchAllOptions

```ts
type TryCatchAllOptions<E = Error> = BaseTryCatchOptions<E> & {
  failFast?: boolean; // If true, fails on first error (default)
};
```

#### PartialResults

```ts
type PartialResults<T, E = Error> = {
  successes: T[]; // Array of successful results
  errors: E[]; // Array of errors that occurred
  successIndices: number[]; // Original indices of successes
  errorIndices: number[]; // Original indices of failures
};
```

---

## 🌍 Global Configuration

The package provides utilities to set global configuration options that will be applied to all try-catch operations. Local options passed to individual try-catch calls will override these global settings.

### Global Configuration Functions

```ts
setGlobalTryCatchConfig(config: Partial<TryCatchOptions>): void
getGlobalTryCatchConfig(): Partial<TryCatchOptions>
```

### Example: Setting Global Error Handling

```ts
// @/app/layout.tsx
import { setGlobalTryCatchConfig } from "@pidchashyi/try-catch";

// Set up global error tracking for all try-catch operations
setGlobalTryCatchConfig({
  logError: true,
  performance: true,
  onError: async (error) => {
    await trackError({
      message: "Unhandled tryCatch error",
      source: "global",
      error,
    });
  },
});

// All subsequent try-catch calls will use these settings
const result1 = await tryCatch(fetchData()); // Uses global config
const result2 = await tryCatchSync(processData); // Uses global config

// Local options override global settings
const result3 = await tryCatch(fetchData(), {
  logError: false, // Overrides global logError setting
  onError: (err) => customErrorHandler(err), // Overrides global onError handler
});
```

### Available Global Options

The global configuration accepts all standard try-catch options:

```ts
type TryCatchOptions<E = Error> = {
  logError?: boolean; // Enable error logging to console
  onError?: (error: E) => void; // Global error handler
  onFinally?: () => void; // Global cleanup function
  performance?: boolean; // Enable performance tracking
  retry?: {
    // Global retry settings
    retries: number;
    delayMs?: number;
  };
};
```

### Best Practices

- Set global configuration early in your application's lifecycle
- Use global config for common error tracking/logging
- Override global settings with local options when needed
- Keep global handlers lightweight to avoid performance impact
- Consider using TypeScript for better type inference

---

## 🛠️ Core Functions

### `tryCatchSync<T, S = T, E = Error>`

Synchronous try-catch wrapper for non-async operations.

```ts
const result = tryCatchSync(() => someOperation(), {
  select: (data) => transformData(data),
  logError: true,
  onError: (err) => handleError(err),
  onFinally: () => cleanup(),
});
```

### `tryCatch<T, S = T, E = Error>`

Asynchronous try-catch wrapper with retry capabilities.

```ts
const result = await tryCatch(fetchData(), {
  retry: { retries: 3, delayMs: 1000 },
  select: (data) => transformData(data),
  logError: true,
  onError: (err) => handleError(err),
  onFinally: () => cleanup(),
});
```

### `tryCatchAll<T, E = Error>`

Execute multiple promises concurrently with fail-fast behavior.

```ts
const result = await tryCatchAll([promise1, promise2, promise3], {
  logError: true,
  onError: (err) => handleError(err),
  onFinally: () => cleanup(),
});
```

### `tryCatchAllSafe<T, E = Error>`

Execute multiple promises concurrently with fail-soft behavior.

```ts
const result = await tryCatchAllSafe([promise1, promise2, promise3], {
  logError: true,
  onError: (err) => handleError(err),
  onFinally: () => cleanup(),
});
```

---

## 🔍 Utility Functions

### Type Guards

```ts
isSuccess<T, E>(result: Result<T, E>): result is Success<T>
isFailure<T, E>(result: Result<T, E>): result is Failure<E>
```

### Helper Functions

```ts
sleep(ms: number): Promise<void>                 // Delay execution
toError(error: unknown): Error                   // Convert unknown to Error
getErrorMessage(error: unknown): string          // Extract error message
map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E>  // Transform success value
```

---

## 📝 Examples

### Basic Usage with Performance Tracking

```ts
import { tryCatch, isSuccess } from "@pidchashyi/try-catch";

const result = await tryCatch(
  fetch("https://api.example.com/data").then((res) => res.json()),
  {
    select: (data) => data.items,
    logError: true,
    performance: true, // Enable performance tracking
  }
);

if (isSuccess(result)) {
  console.log("Data:", result.data);
  console.log("Operation took:", result.performance, "seconds");
} else {
  console.error("Error:", result.error);
  console.log("Failed operation took:", result.performance, "seconds");
}
```

### With Retry Logic and Performance Tracking

```ts
const result = await tryCatch(fetchWithPotentialFailure(), {
  retry: {
    retries: 3,
    delayMs: 1000,
  },
  logError: true,
  onError: (err) => notifyUser(err),
  performance: true, // Enable performance tracking
});

if (isSuccess(result)) {
  console.log(`Operation succeeded in ${result.performance} seconds`);
}
```

### Parallel Operations

```ts
const result = await tryCatchAll([fetchUser(1), fetchUser(2), fetchUser(3)]);

if (isSuccess(result)) {
  console.log("All users:", result.data);
}
```

### Safe Parallel Operations

```ts
const result = await tryCatchAllSafe([
  fetchUser(1),
  fetchUser(2),
  fetchUser(3),
]);

if (isSuccess(result)) {
  console.log("Successful fetches:", result.data.successes);
  console.log("Failed fetches:", result.data.errors);
  console.log("Success indices:", result.data.successIndices);
}
```

---

## 🛡️ Features & Benefits

✅ Fully typed `Success<T>` / `Failure<E>` results
✅ Comprehensive retry mechanism
✅ Performance tracking
✅ Parallel execution support
✅ Safe error handling with type inference
✅ Optional logging and lifecycle hooks
✅ Transform results with selectors
✅ No dependencies
✅ Framework agnostic

---

## 👤 Author

Built with safety-first philosophy by [Pidchashyi](https://github.com/Marian1309/try-catch)

---

## 📄 License

MIT © [LICENSE](https://github.com/Marian1309/try-catch/blob/main/LICENSE)
