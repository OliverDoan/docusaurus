---
sidebar_position: 1
title: "1. Forms trong React"
---

# Forms trong React

**Form** (biểu mẫu để người dùng nhập liệu, như đăng nhập hay đăng ký) là phần quan trọng của hầu hết ứng dụng web. Trong React, bạn cần quản lý giá trị các ô nhập, xử lý khi gửi và **validation** (kiểm tra dữ liệu hợp lệ trước khi gửi đi). Bài này giới thiệu các cách làm form từ cơ bản (controlled/uncontrolled) đến các thư viện mạnh như React Hook Form, cùng cách kiểm tra dữ liệu với Zod.

---

## Mục lục

- [Controlled vs Uncontrolled](#controlled-vs-uncontrolled)
- [React Hook Form (khuyến nghị)](#react-hook-form-khuyến-nghị)
- [Formik](#formik)
- [TanStack Form](#tanstack-form)
- [React 19 Actions](#react-19-actions)
- [Validation với Zod](#validation-với-zod)

---

## Controlled vs Uncontrolled

**Controlled** — React giữ state, value qua state:

```jsx
function ControlledForm() {
  const [email, setEmail] = useState("");

  return (
    <input
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
  );
}
```

**Uncontrolled** — DOM giữ state, đọc qua ref:

```jsx
function UncontrolledForm() {
  const emailRef = useRef(null);

  const submit = () => {
    console.log(emailRef.current.value);
  };

  return <input ref={emailRef} defaultValue="" />;
}
```

| | Controlled | Uncontrolled |
|--|-----------|--------------|
| Validate khi gõ | Dễ | Khó |
| Disable submit | Dễ | Cần state |
| Performance form lớn | **Kém** (re-render mỗi gõ) | Tốt |
| Re-render | Mỗi keystroke | Không |

---

## React Hook Form (khuyến nghị)

[RHF](https://react-hook-form.com) — uncontrolled, performant, tốt nhất 2026.

```bash
npm install react-hook-form
```

```tsx
import { useForm } from "react-hook-form";

function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    await api.send(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register("email", {
          required: "Email bắt buộc",
          pattern: { value: /^[^@]+@[^@]+/, message: "Email không hợp lệ" },
        })}
      />
      {errors.email && <p>{errors.email.message}</p>}

      <textarea {...register("message", { required: true })} />
      {errors.message && <p>Message bắt buộc</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Đang gửi..." : "Gửi"}
      </button>
    </form>
  );
}
```

:::info[Phân tích]

**RHF dùng uncontrolled + ref** thay vì state → component không re-render
mỗi keystroke → form lớn (50+ field) vẫn smooth.

Lợi ích:

- **Performance** — chỉ re-render khi error/value cụ thể đổi.
- **Validation built-in** + tích hợp Zod/Yup/Joi qua resolver.
- **TypeScript support** xuất sắc.
- **Bundle nhỏ** (~9KB).
- **Field array, nested form, watch, controlled wrapper** — đầy đủ.

Pattern phổ biến — RHF + Zod:

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  age: z.number().min(18),
});

type FormData = z.infer<typeof schema>;

function Form() {
  const { register, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return <form onSubmit={handleSubmit(save)}>...</form>;
}
```

Type FormData auto infer từ schema → single source of truth.

:::

---

## Formik

[Formik](https://formik.org) — truyền thống, **controlled-based**.

```jsx
import { Formik, Form, Field, ErrorMessage } from "formik";

<Formik
  initialValues={{ email: "" }}
  validate={(values) => {
    const errors = {};
    if (!values.email) errors.email = "Required";
    return errors;
  }}
  onSubmit={(values) => save(values)}
>
  <Form>
    <Field name="email" />
    <ErrorMessage name="email" />
    <button type="submit">Submit</button>
  </Form>
</Formik>
```

:::warning[Cần lưu ý]

**Formik đã giảm phổ biến** — RHF thắng vì performance:

- Controlled → re-render mỗi keystroke.
- API verbose hơn RHF.
- TypeScript support kém hơn.
- Maintain mode (commit ít).

→ **Không khuyến nghị** Formik cho project mới. Chỉ giữ cho codebase cũ.

:::

---

## TanStack Form

[TanStack Form](https://tanstack.com/form) — mới, type-safe, framework-agnostic
(React, Vue, Solid, Lit).

```tsx
import { useForm } from "@tanstack/react-form";

function Form() {
  const form = useForm({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) => {
      await api.save(value);
    },
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      form.handleSubmit();
    }}>
      <form.Field
        name="email"
        validators={{ onChange: ({ value }) => !value && "Required" }}
        children={(field) => (
          <>
            <input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors && <p>{field.state.meta.errors[0]}</p>}
          </>
        )}
      />
    </form>
  );
}
```

Đặc điểm:

- Multi-framework.
- Type-safe end-to-end.
- Tích hợp tốt với TanStack Router (data fetching trong loader).

Đang early stage — cộng đồng chưa lớn bằng RHF.

---

## React 19 Actions

React 19 + Next.js App Router có **Server Actions** — form submit không
qua API route.

```tsx
async function createUser(formData: FormData) {
  "use server";
  await db.user.create({
    data: { name: formData.get("name") as string },
  });
}

function Form() {
  return (
    <form action={createUser}>
      <input name="name" />
      <SubmitButton />
    </form>
  );
}
```

**`useFormStatus`** — pending state tự động:

```jsx
"use client";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? "..." : "Save"}</button>;
}
```

**`useActionState`** — quản lý state + error:

```jsx
const [state, formAction] = useActionState(createUser, { error: null });

return (
  <form action={formAction}>
    <input name="name" />
    {state.error && <p>{state.error}</p>}
    <button>Save</button>
  </form>
);
```

:::info[Phân tích]

**Khi nào dùng React 19 Actions vs RHF?**

| | Server Actions | RHF |
|--|---------------|-----|
| Server framework | Next.js, Remix | Bất kỳ |
| Validation | Server-side (Zod) | Client-side |
| Progressive enhancement | **Có** (form work no-JS) | Không |
| Complex client form | Hạn chế | **Tốt** |
| Field array, dynamic | Cần custom | Built-in |

Kết hợp tốt:

```tsx
// Client validation với RHF + Zod
// Server validation lại với Zod khi submit (defense in depth)
const onSubmit = async (data) => {
  // RHF đã validate client
  const result = await serverAction(data); // server validate again
  if (result.error) {
    setError(result.error);
  }
};
```

Pattern này dùng nhiều trong Next.js App Router 2026.

:::

---

## Validation với Zod

```tsx
import { z } from "zod";

const userSchema = z.object({
  email: z.string().email(),
  age: z.number().int().min(18).max(120),
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Password không khớp",
  path: ["confirmPassword"],
});

type UserInput = z.infer<typeof userSchema>;

// Validate
const result = userSchema.safeParse(input);
if (!result.success) {
  console.log(result.error.errors);
}
```

Zod thắng vì:

- **Type infer** từ schema → single source.
- **Composable** — schema kết hợp dễ.
- **Tích hợp** RHF, tRPC, Drizzle, Astro Content.

Alternatives: **Valibot** (nhẹ hơn, tree-shake tốt), **Yup** (cũ),
**Joi** (Node-focused).

:::tip[Mẹo]

**Stack form tiêu chuẩn 2026:**

- **RHF** + **Zod** + **shadcn/ui Form components** — cho client-side
  validation và UI.
- **Server Actions** + **Zod** — cho server-side validation và mutation.
- **Both** — pattern "defense in depth": validate cả 2 phía.

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({ /* ... */ });
type FormData = z.infer<typeof schema>;

function Form() {
  const form = useForm<FormData>({ resolver: zodResolver(schema) });
  return (
    <form onSubmit={form.handleSubmit(serverAction)}>
      {/* shadcn form components */}
    </form>
  );
}
```

:::
