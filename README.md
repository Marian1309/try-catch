# `@pidchashyi/try-catch`

> 🧰 Type-safe `try/catch` wrapper for async operations — returns structured `Result<T, E>` objects instead of throwing errors.

Eliminate unhandled exceptions and simplify async error handling with a clean, typed interface. Features optional logging, lifecycle hooks, retry mechanisms, and full type inference.

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
  status: "success";
  data: T;
  error: null;
  performance?: number;
};
```

#### Failure Type

```ts
type Failure<E> = {
  status: "failure";
  data: null;
  error: E;
  performance?: number;
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
  performance?: boolean; // Enable performance tracking
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

### Basic Usage

```ts
import { tryCatch, isSuccess } from "@pidchashyi/try-catch";

const result = await tryCatch(
  fetch("https://api.example.com/data").then((res) => res.json()),
  {
    select: (data) => data.items,
    logError: true,
  }
);

if (isSuccess(result)) {
  console.log("Data:", result.data);
} else {
  console.error("Error:", result.error);
}
```

### With Retry Logic

```ts
const result = await tryCatch(fetchWithPotentialFailure(), {
  retry: {
    retries: 3,
    delayMs: 1000,
  },
  logError: true,
  onError: (err) => notifyUser(err),
  performance: true,
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
