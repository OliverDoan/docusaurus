---
sidebar_position: 1
title: "1. Types và Validation"
---

# Types và Validation

---

## Mục lục

- [TypeScript với React](#typescript-với-react)
- [PropTypes (legacy)](#proptypes-legacy)
- [Type cho component](#type-cho-component)
- [Validation runtime](#validation-runtime)
- [Zod vs Yup vs Valibot](#zod-vs-yup-vs-valibot)

---

## TypeScript với React

TypeScript là **default 2026** cho mọi project React mới. Lợi ích:

- Autocomplete props, hook.
- Catch bug compile-time (typo, undefined, sai type).
- Refactor an toàn.
- Documentation từ type.

(Tham khảo [TypeScript roadmap](/docs/typescript/01-gioi-thieu/1_typescript-la-gi)
cho cơ bản.)

---

## PropTypes (legacy)

Trước TS, React có **PropTypes** để runtime check props:

```jsx
import PropTypes from "prop-types";

function Greeting({ name, age }) {
  return <p>Hi {name}, {age}</p>;
}

Greeting.propTypes = {
  name: PropTypes.string.isRequired,
  age: PropTypes.number,
};
```

:::warning[Cần lưu ý]

**PropTypes đã được tách khỏi React core từ v19**:

- Check **runtime only** — đến lúc chạy mới biết sai.
- Verbose hơn TS interface.
- TS bắt lỗi **compile-time** — sớm hơn nhiều.

Năm 2026, **đừng dùng PropTypes** trong code mới. Migrate sang TypeScript.

:::

---

## Type cho component

**Functional component**:

```tsx
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

function Button({ label, onClick, variant = "primary", disabled }: ButtonProps) {
  return <button onClick={onClick} disabled={disabled}>{label}</button>;
}
```

**Children type**:

```tsx
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
}

function Card({ children }: CardProps) {
  return <div>{children}</div>;
}
```

**Event handler**:

```tsx
function Form() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} />
    </form>
  );
}
```

**Extend HTML attribute**:

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

function Button({ variant = "primary", ...rest }: ButtonProps) {
  return <button data-variant={variant} {...rest} />;
}

// Nhận mọi prop của <button>: type, disabled, aria-*, data-*, etc.
<Button type="submit" aria-label="Save">Save</Button>
```

:::info[Phân tích]

**Tránh `React.FC`**:

```tsx
// Không khuyến nghị
const Button: React.FC<ButtonProps> = ({ label }) => <button>{label}</button>;

// Khuyến nghị
function Button({ label }: ButtonProps) {
  return <button>{label}</button>;
}
```

Lý do:

- `React.FC` ngầm thêm `children?: ReactNode` → component không nhận
  children vẫn pass type-check.
- Generic component khó hơn.
- React docs đã bỏ khỏi example.

:::

**Generic component**:

```tsx
interface SelectProps<T> {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  renderOption: (option: T) => string;
}

function Select<T>({ options, value, onChange, renderOption }: SelectProps<T>) {
  return (
    <select value={JSON.stringify(value)} onChange={(e) => onChange(JSON.parse(e.target.value))}>
      {options.map((opt, i) => (
        <option key={i} value={JSON.stringify(opt)}>{renderOption(opt)}</option>
      ))}
    </select>
  );
}

// Dùng
<Select<User>
  options={users}
  value={selectedUser}
  onChange={setSelectedUser}
  renderOption={u => u.name}
/>
```

---

## Validation runtime

TypeScript chỉ check **compile-time**. Data từ ngoài (API, user, localStorage)
**không type-safe runtime**:

```tsx
const user = await fetch("/api/user").then(r => r.json());
// user có type 'any' — TS không biết đúng hay sai

user.name; // TS không complain, runtime có thể crash
```

→ Cần **runtime validation** tại boundary:

```tsx
import { z } from "zod";

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

type User = z.infer<typeof UserSchema>;

async function fetchUser() {
  const raw = await fetch("/api/user").then(r => r.json());
  return UserSchema.parse(raw); // throw nếu sai schema
  // Trả về User (typed)
}
```

---

## Zod vs Yup vs Valibot

[**Zod**](https://zod.dev) — phổ biến nhất, TypeScript-first:

```tsx
const schema = z.object({
  email: z.string().email(),
  age: z.number().int().min(18),
});

type Input = z.infer<typeof schema>;

const result = schema.safeParse(input);
if (!result.success) {
  console.log(result.error.flatten());
}
```

[**Valibot**](https://valibot.dev) — alternative gọn hơn, tree-shakeable:

```tsx
import * as v from "valibot";

const schema = v.object({
  email: v.pipe(v.string(), v.email()),
  age: v.pipe(v.number(), v.integer(), v.minValue(18)),
});

const result = v.safeParse(schema, input);
```

[**Yup**](https://github.com/jquense/yup) — cũ, vẫn maintain:

```tsx
import * as yup from "yup";

const schema = yup.object({
  email: yup.string().email().required(),
  age: yup.number().integer().min(18).required(),
});

await schema.validate(input);
```

[**Joi**](https://joi.dev) — Node.js focused, ít dùng frontend.

:::info[Phân tích]

**So sánh nhanh:**

| | Zod | Valibot | Yup |
|--|-----|---------|-----|
| Bundle size | ~14KB | **~3KB** | ~12KB |
| Tree-shakeable | Khá | **Tốt** | Khá |
| TypeScript infer | **Xuất sắc** | Xuất sắc | Tốt |
| Adoption | **#1** | Tăng | Giảm |
| Ecosystem (resolver, plugins) | **Phong phú** | Đang xây | Có |

**Quy tắc:**

- Default project mới → **Zod**.
- Quan tâm bundle size critical → **Valibot**.
- Legacy đã dùng Yup → giữ, migrate nếu cần.

Stack tích hợp Zod:

- **RHF**: `@hookform/resolvers/zod`.
- **tRPC**: input schema.
- **Drizzle ORM**: type inference.
- **Next.js Server Actions**: input parse.

Có thể nói Zod là **lingua franca** của TypeScript ecosystem 2026.

:::

:::tip[Mẹo]

**Pattern "schema everywhere":**

```ts
// schemas/user.ts
import { z } from "zod";

export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
});

export type User = z.infer<typeof userSchema>;
```

Dùng schema này khắp nơi:

```ts
// API client
const user = userSchema.parse(await fetch("/api/user").then(r => r.json()));

// Form validation
const form = useForm<User>({ resolver: zodResolver(userSchema) });

// Local storage
const stored = userSchema.parse(JSON.parse(localStorage.getItem("user")));

// Server route
export async function POST(req: Request) {
  const data = userSchema.parse(await req.json());
}
```

**1 schema = 1 type + N validation point**. Đây là productivity boost
lớn nhất khi TS gặp Zod.

:::

:::warning[Cần lưu ý]

**`parse` vs `safeParse`:**

```ts
// parse — throw nếu sai
const user = userSchema.parse(input); // crash app nếu input sai

// safeParse — trả result object
const result = userSchema.safeParse(input);
if (result.success) {
  console.log(result.data); // typed
} else {
  console.log(result.error); // ZodError
}
```

Trong API/server: dùng `parse`, để error bubble lên error handler.
Trong form: dùng `safeParse` để hiển thị error đẹp.

:::
