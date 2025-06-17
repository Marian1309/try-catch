# `@pidchashyi/try-catch`

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
import { tryCatch, isSuccess, isFailure } from "@pidchashyi/try-catch";

const result = await tryCatch(
  fetch("https://jsonplaceholder.typicode.com/users").then((res) => res.json()),
  {
    select: (data) => data.map((user) => user.name),
  }
);

if (isSuccess(result)) {
  console.log("User names:", result.data);
} else {
  console.error("Failed to fetch user names:", result.error);
}
```

---

## 🛠️ With Options

```ts
const result = await tryCatch(fetchData(), {
  logError: true,
  onError: (err) => {
    // custom error reporting
    reportToService(err);
  },
  onFinally: () => {
    // disable loading
    setIsLoading(false);
  },
});
```

---

## 🧪 Type Guards

```ts
if (isSuccess(result)) {
  // result.data is strongly typed and non-null
} else if (isFailure(result)) {
  // result.error is strongly typed and non-null
}
```

---

## 🧰 API Reference

### `tryCatch(promise, options?)`

Wraps any async function or promise and returns a typed `Result<T, E>` object.

#### Parameters:

| Name      | Type                                               | Description                     |
| --------- | -------------------------------------------------- | ------------------------------- |
| `promise` | `Promise<T>`                                       | Async operation to wrap         |
| `options` | `TryCatchOptions<E> & { select?: (data: T) => S }` | Optional callbacks and selector |

#### Returns:

```ts
Promise<Result<S, E>>;
```

---

### `TryCatchOptions<E>`

| Option      | Type                 | Description                          |
| ----------- | -------------------- | ------------------------------------ |
| `logError`  | `boolean`            | Logs error to console if `true`      |
| `onError`   | `(error: E) => void` | Optional custom error handler        |
| `onFinally` | `() => void`         | Called regardless of success/failure |
| `select`    | `(data: T) => S`     | Selector function to transform data  |

---

## 🛡️ Safeguards & Features

✅ Fully typed `Success<T>` / `Failure<E>`
✅ Catches unknown errors and casts to `Error`
✅ Optional error logger and lifecycle hooks
✅ Helps enforce non-throwing API patterns
❌ No global side effects
❌ No dependency on specific frameworks

---

## 👤 Author

Built with safety-first philosophy by [Pidchashyi](https://github.com/Marian1309/try-catch)

---

## 📄 License

MIT © [LICENSE](https://github.com/Marian1309/try-catch/blob/main/LICENSE)

---

If you want, I can also help generate a package.json or prepare other docs!
