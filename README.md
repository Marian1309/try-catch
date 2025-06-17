# `@pidchahyi/try-catch`

> 🧰 Type-safe `try/catch` wrapper for async operations — returns structured `Result<T, E>` objects instead of throwing errors.

Eliminate unhandled exceptions and simplify async error handling with a clean, typed interface. Features optional logging, lifecycle hooks, and full type inference.

---

## 📦 Installation

```bash
npm install @pidchashyi/try-catch
```

---

## ⚙️ API Overview

### `Result<T, E>`

```ts
type Result<T, E = Error> = Success<T> | Failure<E>;
```

- `Success<T>`: `{ status: "success"; data: T; error: null }`
- `Failure<E>`: `{ status: "failure"; data: null; error: E }`

### Type Guards

```ts
isSuccess(result): result is Success<T>;
isFailure(result): result is Failure<E>;
```

---

## 🔧 Usage

### Basic Example

```ts
import { tryCatch, isSuccess, isFailure } from "@pidchashyi/try-catch-result";

const result = await tryCatch(fetchUser());

if (isSuccess(result)) {
  console.log("User:", result.data);
} else {
  console.error("Failed to fetch user:", result.error);
}
```

---

## 🛠️ With Options

```ts
const result = await tryCatch(fetchData(), {
  logError: true,
  onError: (err) => reportToService(err),
  onFinally: () => console.log("Operation complete."),
});
```

---

## 🧪 Type Guards

```ts
if (isSuccess(result)) {
  // result.data is now typed as the successful value
} else if (isFailure(result)) {
  // result.error is now typed and non-null
}
```

---

## 🧰 API Reference

### `tryCatch(promise, options?)`

Wraps any async function or promise and returns a typed `Result<T, E>` object.

#### Parameters:

| Name      | Type                 | Description                      |
| --------- | -------------------- | -------------------------------- |
| `promise` | `Promise<T>`         | Async operation to wrap          |
| `options` | `TryCatchOptions<E>` | Optional error/logging callbacks |

#### Returns:

```ts
Promise<Result<T, E>>;
```

---

### `TryCatchOptions<E>`

| Option      | Type                 | Description                             |
| ----------- | -------------------- | --------------------------------------- |
| `logError`  | `boolean`            | Logs error to console if `true`         |
| `onError`   | `(error: E) => void` | Optional custom error handler           |
| `onFinally` | `() => void`         | Called regardless of success or failure |

---

## 🛡️ Safeguards & Features

✅ Fully typed `Success<T>` / `Failure<E>`
✅ Catches `unknown` errors and casts to `Error`
✅ Optional error logger and callbacks
✅ Helps enforce non-throwing API patterns
❌ No global side effects
❌ No dependency on specific frameworks

---

## 👤 Author

Built with safety-first philosophy by [Pidchashyi](https://github.com/Marian1309/try-catch)

---

## 📄 License

MIT © [LICENCE](https://github.com/Marian1309/try-catch/blob/main/LICENSE)
