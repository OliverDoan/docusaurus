---
sidebar_position: 4
title: "4. Advanced Patterns trong production"
---

# Advanced Patterns trong production

> *Phần này test trải nghiệm thực tế. Đáp án "đúng sách" sẽ bị trừ điểm — interviewer muốn nghe câu chuyện và quyết định trong context cụ thể.*

:::note[Ghi nhớ nhanh]

- ⭐ **Discriminated union cho state** — thay `{ data, loading, error }` (cho phép state vô nghĩa) bằng union có discriminator (`status`); switch để TS narrow, khỏi dùng `!`. Cùng ý là `Result<T, E>`.
- ⭐ **Validate ở boundary với Zod** — không `as User` response; schema `parse` vừa validate runtime vừa derive type; schema là single source of truth (`z.infer`).
- **Type-safe form** — Zod schema + `z.infer` + `useForm<T>` để field/validation/submit đồng bộ một nguồn.
- **Module augmentation** — `declare module`/`declare global` để mở rộng third-party type (Express `Request`, `Window`, MUI theme); file phải là module (`export {}`).
- **Inference** — để TS infer tối đa; bắt buộc annotate param, return của public API, `useState`/`useRef` khi initial mơ hồ; ưu tiên `satisfies` hơn `as`.
- **Strict migration** — không big bang; bật từng flag (`strictNullChecks` trước), per-folder strict, ratchet count trong CI, dùng `// @ts-expect-error` (không `@ts-ignore`).

:::

---

## Câu 1: Type-safe Form với react-hook-form `[Intermediate]`

### Câu hỏi

> Em viết form login với react-hook-form. Làm sao để type của field, validation, và submit handler đều type-safe?

### Giải thích lý thuyết

Pattern phổ biến:

1. Định nghĩa schema (Zod/Yup).
2. Infer TS type từ schema — **single source of truth**.
3. Truyền type cho `useForm<T>`.

### Code minh hoạ

```typescript
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// 1. Schema = source of truth
const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
  remember: z.boolean().default(false),
});

// 2. Infer TS type
type LoginInput = z.infer<typeof loginSchema>;
// { email: string; password: string; remember: boolean }

// 3. Form với type chặt
function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginInput> = async (data) => {
    // data đã type chặt: { email: string; password: string; remember: boolean }
    await api.login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register("password")} type="password" />
      {errors.password && <span>{errors.password.message}</span>}

      <input {...register("remember")} type="checkbox" />
    </form>
  );
}

// Nested field — type vẫn chặt
const profileSchema = z.object({
  user: z.object({
    name: z.string(),
    address: z.object({ city: z.string() }),
  }),
});
type Profile = z.infer<typeof profileSchema>;

// register("user.address.city") — TS auto-complete + check
```

### Đáp án mẫu

> "Pattern em luôn dùng: Zod schema là **single source of truth**, infer TS type bằng `z.infer<typeof schema>`. Truyền type này vào `useForm<LoginInput>` và `SubmitHandler<LoginInput>`. Như vậy chỉ cần update schema một chỗ — type, validation runtime, error message tự động sync. Với react-hook-form mới, `register('field')` còn auto-complete tên field theo schema, sai tên là TS báo. Em không tách type và schema khai báo 2 nơi — đó là pattern legacy đau đầu khi maintain. Một lợi thế lớn nữa: `data` trong `onSubmit` đã được Zod parse → đảm bảo data đúng shape runtime, không cần check lại."

---

## Câu 2: API response không có type — em xử lý thế nào? `[Intermediate]`

### Câu hỏi

> Backend trả response không có schema, không có OpenAPI, không có @types. Em sẽ làm gì để FE vẫn type-safe?

### Giải thích lý thuyết

Có 3 chiến lược:

1. **Manual type** + cast — nhanh nhưng rủi ro.
2. **Schema validation** (Zod/Valibot) ở edge — chi phí runtime nhưng catch lỗi sớm.
3. **Code-gen** từ OpenAPI/GraphQL nếu có spec.

Best practice: schema-validate ở **boundary** (chỗ data vào app), nội bộ tin type.

### Code minh hoạ

```typescript
// Cách tệ: cast bừa
async function fetchUser(): Promise<User> {
  const res = await fetch("/api/me");
  return res.json() as User; // ❌ Không validate gì cả
}

// Cách tốt: Zod parse + clear error
const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  age: z.number().optional(),
});
type User = z.infer<typeof userSchema>;

async function fetchUser(): Promise<User> {
  const res = await fetch("/api/me");
  if (!res.ok) throw new Error(res.statusText);
  const json = await res.json();
  return userSchema.parse(json); // Throw chi tiết nếu shape sai
}

// Wrap generic
async function apiGet<T>(url: string, schema: z.ZodType<T>): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new ApiError(res.status, res.statusText);
  return schema.parse(await res.json());
}

const user = await apiGet("/api/me", userSchema);          // user: User
const posts = await apiGet("/api/posts", z.array(postSchema));

// Safe parse (không throw)
const result = userSchema.safeParse(json);
if (result.success) {
  result.data;
} else {
  result.error.flatten();
}

// Khi không thể schema-validate (data quá phức tạp / không rảnh):
// Dùng manual type + branded "unsafe" marker
type Unsafe<T> = T & { __unsafe: true };
async function fetchUnsafe<T>(url: string): Promise<Unsafe<T>> {
  // Document rõ caller hiểu rủi ro
  return fetch(url).then((r) => r.json());
}
```

### Đáp án mẫu

> "Em không bao giờ `as User` thẳng response — đó là TS giả tạo, runtime vẫn có thể sai. Cách em làm: định nghĩa Zod schema cho mỗi endpoint, `userSchema.parse(json)` để vừa validate runtime vừa derive type. Em viết wrapper `apiGet<T>(url, schema)` để mọi call qua đó. Nếu backend trả data lệch schema, Zod throw chi tiết — em biết ngay endpoint nào sai thay vì lỗi tận trong component. Em chấp nhận chi phí runtime của parse vì giá trị catch-bug-sớm vượt xa, đặc biệt khi BE thay đổi không báo. Nếu có OpenAPI/GraphQL spec thì code-gen (openapi-typescript / graphql-codegen) còn tốt hơn — type + schema sync tự động."

---

## Câu 3: Discriminated Union — pattern cho state quản lý phức tạp `[Senior]`

### Câu hỏi

> Em đang viết một custom hook `useFetch` trả về `{ data, loading, error }`. Tại sao pattern này có vấn đề về type, và `discriminated union` fix thế nào?

### Giải thích lý thuyết

Pattern `{ data, loading, error }` cho phép **các state không hợp lệ**:

- `{ loading: true, data: someData }` — đang load mà có data?
- `{ loading: false, data: null, error: null }` — không load, không lỗi, nhưng data null?

TS không thể narrow giúp — caller phải check cả 3 field.

Discriminated union enforce **chỉ một state hợp lệ tại một thời điểm**.

### Code minh hoạ

```typescript
// ❌ Anti-pattern: bag of fields
type BadState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
};

function Component() {
  const { data, loading, error } = useFetch<User>("/api/me") as BadState<User>;

  if (loading) return <Spinner />;
  if (error) return <Err />;
  // data có thể vẫn null? TS không narrow
  return <View name={data!.name} />; // ❌ phải dùng !
}

// ✅ Discriminated union — state explicit
type FetchState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };

function useFetch<T>(url: string): FetchState<T> { ... }

function Component2() {
  const state = useFetch<User>("/api/me");

  switch (state.status) {
    case "idle":     return <button>Load</button>;
    case "loading":  return <Spinner />;
    case "error":    return <Err message={state.error.message} />;
    case "success":  return <View name={state.data.name} />; // ✅ data narrow
  }
}

// Pattern: Result type
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

async function tryFetch<T>(url: string): Promise<Result<T>> {
  try {
    return { ok: true, value: await fetch(url).then((r) => r.json()) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e : new Error(String(e)) };
  }
}

const r = await tryFetch<User>("/api/me");
if (r.ok) r.value.name;     // narrowed
else      r.error.message;  // narrowed
```

### Đáp án mẫu

> "Vấn đề chính: `{ data, loading, error }` cho phép tổ hợp state vô nghĩa — ví dụ `loading=true` mà `data` lại có giá trị, hoặc cả 3 đều null/false. TS không narrow giúp được, caller phải check thủ công và dễ sót case. Discriminated union fix bằng cách định nghĩa state là union các 'shape' rõ ràng — mỗi shape có một field discriminator (`status: 'loading' | 'success' | ...`). Khi switch trên discriminator, TS narrow type — trong nhánh `success` thì `data` chắc chắn có, không cần `!`. Em áp dụng pattern này không chỉ cho data fetching mà còn cho mọi state có "mode": form (idle/submitting/error/success), connection (offline/connecting/online)... Code reviewer còn ép em viết `default: const _: never = state` để exhaustive."

---

## Câu 4: Module Augmentation — khi nào dùng? `[Senior]`

### Câu hỏi

> Em muốn thêm `theme` vào Express `Request` object hoặc thêm method vào `Array.prototype`. Làm sao type-safe?

### Giải thích lý thuyết

**Module Augmentation** = thêm declaration vào module/global đã tồn tại. Cú pháp:

```typescript
declare module "package-name" {
  interface ExistingInterface {
    newField: string;
  }
}
```

Use case:
- Mở rộng third-party type (Express, NextAuth, Mui theme).
- Thêm global type (`Window`, `globalThis`).
- Augment `Array.prototype` (cẩn thận — runtime cần polyfill thật).

### Code minh hoạ

```typescript
// 1. Augment Express Request
// types/express.d.ts
import "express";
declare module "express" {
  interface Request {
    user?: { id: string; role: string };
  }
}

// middleware sau đó:
app.use((req, res, next) => {
  req.user = { id: "u1", role: "admin" }; // ✅ type-safe
  next();
});

app.get("/me", (req, res) => res.json(req.user));

// 2. Augment Next.js NextRequest (App Router)
import "next/server";
declare module "next/server" {
  interface NextRequest {
    geo?: { country: string; city: string };
  }
}

// 3. Augment global Window
// global.d.ts
declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
export {};  // BUỘC export để file là module, augment global đúng

window.gtag?.("event", "click");

// 4. Augment MUI theme
import "@mui/material/styles";
declare module "@mui/material/styles" {
  interface Palette {
    brand: { primary: string };
  }
  interface PaletteOptions {
    brand?: { primary: string };
  }
}

// 5. Augment Array.prototype (CẨN THẬN — cần polyfill thật)
declare global {
  interface Array<T> {
    last(): T | undefined;
  }
}
Array.prototype.last = function () { return this[this.length - 1]; };
```

### Đáp án mẫu

> "Module augmentation cho phép thêm field/method vào type của module đã tồn tại. Em dùng nhiều nhất ở 3 chỗ: thứ nhất là **Express Request** — sau khi middleware gắn `req.user`, em augment Request interface để các route handler dùng `req.user` type-safe; thứ hai là **Window** — gắn `gtag`, `dataLayer` cho analytics, không phải `(window as any).gtag` khắp nơi; thứ ba là **MUI/theme** — declare thêm custom palette colors. Bẫy quan trọng: file augment phải là **module** (có ít nhất 1 `import` hoặc `export`) — nếu là plain script thì augment không vào module, thay vào đó override global. Em luôn để `export {}` ở cuối nếu file không có import/export khác."

---

## Câu 5: Type Inference — khi nào explicit, khi nào để TS infer? `[Senior]`

### Câu hỏi

> Em theo nguyên tắc nào về việc thêm type annotation? Có chỗ nào em **bắt buộc** không để TS infer không?

### Giải thích lý thuyết

Nguyên tắc thực dụng:

| Vị trí                            | Để TS infer hay annotate?                           |
| --------------------------------- | --------------------------------------------------- |
| Local variable                    | Để infer (`const x = 5`)                            |
| Function parameter                | **Annotate** — không infer được                     |
| Function return                   | Tuỳ. Annotate cho public API; để infer cho helper   |
| `useState`                        | Annotate khi initial là null/empty                  |
| `useRef`                          | Annotate type của ref                                |
| Generic call site                 | Để infer; chỉ annotate khi TS không suy ra được     |
| Object literal được pass làm prop | `satisfies` thay vì `as` hoặc inline annotation     |

### Code minh hoạ

```typescript
// 1. Local variable — để infer
const count = 5;              // number
const user = { name: "An" };  // { name: string }

// 2. Param — bắt buộc annotate
function greet(name: string): void { ... }

// 3. Return type — annotate cho public API
export function fetchUser(id: string): Promise<User> { ... } // explicit
function helperToUpperFirst(s: string) { ... }                // infer OK

// Tại sao annotate public? Catch bug khi accidentally đổi return shape.

// 4. useState — annotate khi initial mơ hồ
const [user, setUser] = useState<User | null>(null);   // ✅ phải annotate
const [count, setCount] = useState(0);                  // infer number, OK

// 5. useRef — luôn annotate
const inputRef = useRef<HTMLInputElement>(null);

// 6. Generic call — để infer
const arr = ["a", "b"].map((s) => s.toUpperCase()); // string[], TS suy ra

// Chỉ annotate khi TS suy sai
function makeBox<T>() {
  return { items: [] as T[] };
}
const box = makeBox<User>(); // explicit vì không thể infer

// 7. Const assertion vs annotation
const colors1 = ["red", "blue"];           // string[]
const colors2 = ["red", "blue"] as const;  // readonly ["red", "blue"]

// 8. satisfies thay vì cast
const config = {
  api: "https://example.com",
  retries: 3,
} satisfies { api: string; retries: number };
// config.api có type string literal, không bị widen
```

### Đáp án mẫu

> "Quy tắc của em: **để TS infer hết mức có thể**, chỉ annotate khi cần. Bắt buộc annotate ở 3 chỗ: function parameter (TS không thể infer), function return type cho **public API** (bắt sớm bug khi vô tình đổi shape), và `useState`/`useRef` khi initial value mơ hồ (`useState<User | null>(null)`). Helper function nội bộ thì em để infer return — đỡ noise. Generic call em để TS infer — chỉ explicit khi không suy ra được như `makeBox<User>()`. Một nguyên tắc nữa: thay vì `as T` em ưu tiên `satisfies T` để giữ literal type. Lý do triết lý: type annotation thừa = code phải maintain thừa, và nó che mất khả năng TS bắt bug khi shape thay đổi."

---

## Câu 6: Strict mode migration — chiến lược cho legacy codebase `[Senior]`

### Câu hỏi

> Em được giao migrate một codebase TS 1 năm tuổi từ `strict: false` sang `strict: true`. Có ~500 type errors. Chiến lược của em?

### Giải thích lý thuyết

Quy tắc lớn: **không big bang**. Migration từng bước, blocker = pipeline phải vẫn green.

Chiến lược thực tế:

1. **Đo lường**: chạy `tsc --noEmit` với strict flag, đếm error theo file.
2. **Bật từng flag thay vì `strict: true`**: `strictNullChecks` → `noImplicitAny` → ... — mỗi flag là một PR riêng.
3. **Per-file strict**: dùng `// @ts-check` hoặc TS project references để áp strict cho thư mục mới trước.
4. **Ratchet pattern**: track count, mỗi PR giảm count, không cho tăng (CI check).
5. **`// @ts-expect-error` thay `@ts-ignore`**: expect-error sẽ fail nếu file đó hết lỗi → tự nhắc remove.

### Code minh hoạ

```typescript
// 1. tsconfig.json — strict từng bước
{
  "compilerOptions": {
    "strict": false,
    "strictNullChecks": true,      // bật cái này trước
    // "noImplicitAny": true,      // bật sau khi clear strictNullChecks
    // "strictFunctionTypes": true,
  }
}

// 2. Per-folder strict với project references
// packages/new-feature/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "strict": true } // module mới strict ngay
}

// 3. @ts-expect-error — tự fail khi file fix xong
// @ts-expect-error TODO migrate: incompatible types
const result = legacyFunction(input);

// 4. Ratchet — script count error, fail CI nếu count tăng
// scripts/typescript-baseline.js
const errors = execSync("tsc --noEmit", { encoding: "utf8" });
const count = errors.split("\n").filter((l) => l.includes("error TS")).length;
const baseline = Number(readFileSync(".ts-baseline", "utf8"));
if (count > baseline) {
  console.error(`TS errors increased: ${count} > ${baseline}`);
  process.exit(1);
}
writeFileSync(".ts-baseline", String(count)); // chỉ ratchet xuống

// 5. Replace `any` từng bước
// any → unknown nếu chưa biết
function process(data: any) { ... }
function process(data: unknown) { ... } // buộc narrow, an toàn hơn
```

### Đáp án mẫu

> "Không big bang — em sẽ thua trong PR review. Bước 1: chạy `tsc --noEmit` với strict, đếm error theo flag và theo file, lập kế hoạch. Bước 2: bật từng flag thay vì `strict: true` — thường em bật `strictNullChecks` trước vì nó catch nhiều bug nhất, sau đó `noImplicitAny`, rồi các flag khác. Mỗi flag là một PR riêng có thể review. Bước 3: cho module/feature mới, em set `strict: true` ngay qua TS project reference — code mới không bị 'nhiễm' lỏng. Bước 4: ratchet — script đếm error count, CI fail nếu PR làm tăng count. Bước 5: dùng `// @ts-expect-error` thay vì `@ts-ignore` ở chỗ tạm bỏ qua — khi file đó được fix, expect-error báo unused → tự nhắc remove. Trải nghiệm thực tế: tốt nhất bắt đầu từ file có nhiều bug runtime — vừa fix type vừa lộ ra bug thật."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                                  | Đúng là                                                              |
| -------------------------------------------------------- | -------------------------------------------------------------------- |
| "TS chặn được mọi runtime error"                         | TS = compile-time. Runtime cần Zod/Yup ở boundary                    |
| "`any` ở chỗ legacy không sao"                           | `any` lan truyền — function nhận any trả any, lây cả chain           |
| "Module augmentation cần `as any` để pass build"         | Không — đặt file `.d.ts` trong `include`, không cần cast             |
| "`as const` và `satisfies` giống nhau"                   | `as const` widen → readonly literal; `satisfies` validate type        |
| "Migrate strict mode là việc 1 PR"                       | Big bang PR sẽ không bao giờ merge. Cần chiến lược từng bước         |
