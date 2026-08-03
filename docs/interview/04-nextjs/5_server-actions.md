---
sidebar_position: 5
title: "5. Server Actions & Mutations"
---

# Server Actions & Mutations

> *Server Actions biến mutation thành "gọi function" — nhưng đừng quên: mỗi action là một public endpoint, và mọi quy tắc bảo mật của API vẫn áp dụng.*

:::note[Ghi nhớ nhanh]

- ⭐ **Server Action = public HTTP endpoint (RPC)** — phải auth/authz/validate bên trong từng action, không tin `FormData` hay hidden field; ẩn nút ở UI không phải bảo mật.
- ⭐ **Bắt buộc revalidate sau mutation** — gọi `revalidatePath`/`revalidateTag` trong action, quên là user vẫn thấy data cũ do `Router Cache` phía client.
- **Error handling** — expected error thì `return { success, error }` (đừng throw vì production mask message); `redirect()` throw `NEXT_REDIRECT` nên không đặt trong `try/catch`.
- **Progressive enhancement** — `<form action>` chạy cả khi JS chưa load; validate bằng `Zod` trên server vì `FormData` là untrusted input.
- **Bộ hook React 19** — `useActionState` là state máy nhận kết quả action; `useFormStatus` phải nằm ở component con trong form; `useOptimistic` tự rollback khi action lỗi.
- **CSRF** — Next chống sẵn (chỉ POST + so khớp `Origin`/`Host`), nhưng vẫn phải tự lo authz per-action, validation, rate limit.

:::

---

## Câu 28: Server Actions là gì? `[Intermediate]`

### Câu hỏi

> Server Actions trong Next.js là gì?

### Giải thích lý thuyết

Server Action là **async function chạy trên server** nhưng có thể được gọi từ client như gọi function bình thường — bản chất là một dạng **RPC (Remote Procedure Call)** mà Next.js tự wiring giùm.

Đánh dấu bằng directive `'use server'`:
- Đặt **đầu file** → mọi export trong file là Server Action.
- Đặt **đầu function body** → chỉ function đó là action (chỉ dùng được trong Server Component).

Cơ chế bên dưới:

1. Lúc build, Next.js gán cho mỗi action một **action ID** (không đoán được) và tự sinh một **POST endpoint** ẩn.
2. Khi client gọi action, Next gửi POST request kèm action ID + arguments (serialize được — phải là giá trị React có thể serialize: primitive, FormData, plain object...).
3. Server chạy function, trả kết quả về, đồng thời có thể **trả luôn RSC payload mới** — UI update trong cùng 1 round-trip, không cần refetch riêng.

**Progressive enhancement**: khi gắn action vào `<form action={...}>`, form hoạt động **cả khi JavaScript chưa load hoặc bị disable** — browser submit form theo cách truyền thống, Next nhận POST và chạy action. Đây là điểm khác biệt lớn so với `onClick + fetch`.

Dùng Server Actions cho **mutation** (create/update/delete), không dùng cho data fetching — fetch trong action chạy tuần tự qua POST, mất caching và parallelism của Server Component.

Pitfalls:
- Arguments và return value phải **serializable** (không pass class instance, function, Date cần cẩn thận).
- Action được export là endpoint công khai — sẽ nói kỹ ở câu 57.

### Code minh hoạ

```typescript
// app/actions/todos.ts
"use server"; // toàn bộ export trong file là Server Action

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function createTodo(formData: FormData) {
  const title = formData.get("title") as string;

  // Chạy hoàn toàn trên server — truy cập DB trực tiếp, secret an toàn
  await db.todo.create({ data: { title } });

  // Invalidate cache để UI thấy data mới
  revalidatePath("/todos");
}

// app/todos/page.tsx — Server Component
import { createTodo } from "@/app/actions/todos";

export default async function TodosPage() {
  const todos = await db.todo.findMany();

  return (
    <>
      {/* Form hoạt động cả khi JS chưa load — progressive enhancement */}
      <form action={createTodo}>
        <input name="title" required />
        <button type="submit">Thêm</button>
      </form>
      <ul>
        {todos.map((t) => (
          <li key={t.id}>{t.title}</li>
        ))}
      </ul>
    </>
  );
}

// Gọi từ Client Component như gọi function thường (RPC)
"use client";
import { createTodo } from "@/app/actions/todos";

function QuickAdd() {
  return (
    <button
      onClick={async () => {
        const fd = new FormData();
        fd.set("title", "Việc mới");
        await createTodo(fd); // thực chất là POST request Next tự sinh
      }}
    >
      Thêm nhanh
    </button>
  );
}
```

### Đáp án mẫu

> "Server Action là async function đánh dấu `'use server'`, chạy trên server nhưng gọi được từ client như RPC. Bên dưới, Next.js tự sinh một POST endpoint với action ID riêng cho mỗi action — client gọi function thì thực chất là gửi POST, server chạy logic rồi trả kết quả kèm luôn RSC payload mới nên UI update trong 1 round-trip. Em dùng nó cho mutation: tạo, sửa, xóa data — truy cập DB trực tiếp, secret không bao giờ lộ ra client. Điểm em thích nhất là progressive enhancement: gắn action vào `<form action>` thì form vẫn submit được cả khi JS chưa load — browser fallback về POST truyền thống. Lưu ý: arguments phải serializable, và mỗi action là public endpoint nên vẫn phải auth bên trong."

---

## Câu 29: Cách sử dụng Server Actions với HTML forms? `[Intermediate]`

### Câu hỏi

> Cách sử dụng Server Actions với HTML forms?

### Giải thích lý thuyết

Luồng hoạt động của form action:

1. `<form action={serverAction}>` — React/Next serialize form thành **FormData** khi submit.
2. Next gửi POST request đến endpoint của action, kèm FormData.
3. Action chạy trên server: validate → mutate DB → `revalidatePath/Tag` hoặc `redirect`.
4. Next trả về RSC payload mới → UI update mà không full page reload (khi có JS).

Điểm quan trọng:

- **Không cần JS**: khi JS chưa load, browser submit form theo cách truyền thống (native POST) — action vẫn chạy. Đây là progressive enhancement thật sự.
- **Nhận state trả về**: dùng hook `useActionState` (React 19) — action nhận `(prevState, formData)`, return value trở thành state mới. Dùng để hiển thị lỗi validation, message thành công.
- **Validation phải ở server**: FormData là untrusted input. Validate bằng **Zod** trong action — `safeParse` rồi trả field errors về cho form. Validation client-side (HTML `required`, pattern) chỉ là UX, không phải security.

Pitfall: đừng chỉ validate ở client rồi tin FormData — attacker có thể POST trực tiếp đến endpoint của action với payload tùy ý.

### Code minh hoạ

```typescript
// app/actions/register.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

// Schema validation trên server — không tin dữ liệu client
const registerSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  name: z.string().min(2, "Tên tối thiểu 2 ký tự").max(100),
});

export type RegisterState = {
  success: boolean;
  errors?: Record<string, string[]>;
  message?: string;
};

// Signature cho useActionState: (prevState, formData) => newState
export async function registerUser(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
  });

  if (!parsed.success) {
    // Trả field errors về cho form hiển thị
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await db.user.create({ data: parsed.data });
  } catch (error) {
    console.error("Đăng ký thất bại:", error);
    return { success: false, message: "Có lỗi xảy ra, vui lòng thử lại" };
  }

  revalidatePath("/users");
  return { success: true, message: "Đăng ký thành công" };
}

// app/register/form.tsx — Client Component
"use client";

import { useActionState } from "react";
import { registerUser, type RegisterState } from "@/app/actions/register";

const initialState: RegisterState = { success: false };

export function RegisterForm() {
  // useActionState wrap action → nhận state trả về + trạng thái pending
  const [state, formAction, isPending] = useActionState(
    registerUser,
    initialState
  );

  return (
    <form action={formAction}>
      <input name="email" type="email" required />
      {state.errors?.email && <p className="error">{state.errors.email[0]}</p>}

      <input name="name" required minLength={2} />
      {state.errors?.name && <p className="error">{state.errors.name[0]}</p>}

      <button type="submit" disabled={isPending}>
        {isPending ? "Đang gửi..." : "Đăng ký"}
      </button>

      {state.message && <p>{state.message}</p>}
    </form>
  );
}
// Form này hoạt động cả khi JS chưa load:
// browser POST truyền thống → action vẫn chạy → server render lại page
```

### Đáp án mẫu

> "Khi em gắn Server Action vào `<form action>`, lúc submit React serialize form thành FormData và gửi POST đến endpoint của action. Action chạy trên server: validate, mutate DB, revalidate cache, rồi trả RSC payload mới về để UI update không cần reload. Điểm hay là không cần JS — khi JS chưa load, browser submit form theo cách truyền thống và action vẫn chạy, đúng tinh thần progressive enhancement. Để nhận state trả về, em dùng `useActionState` — action nhận `(prevState, formData)`, return value thành state mới, em dùng để show lỗi validation từng field và trạng thái pending để disable nút submit. Về validation, em luôn validate bằng Zod trên server vì FormData là untrusted input — HTML validation chỉ là UX, attacker có thể POST thẳng vào endpoint."

---

## Câu 30: Revalidation sau mutation trong Server Actions? `[Intermediate]`

### Câu hỏi

> Revalidation sau mutation trong Server Actions?

### Giải thích lý thuyết

Mutation xong mà **không revalidate thì UI vẫn hiển thị data cũ** — vì Next.js cache nhiều tầng (Data Cache, Full Route Cache, Router Cache phía client). Server Action mutate DB thành công không có nghĩa là cache biết data đã đổi.

Các công cụ revalidate trong action:

| API                     | Phạm vi invalidate                                      | Khi nào dùng                                  |
| ----------------------- | ------------------------------------------------------- | --------------------------------------------- |
| `revalidatePath(path)`  | Toàn bộ cache của 1 route (Data + Full Route + Router)  | Mutation ảnh hưởng 1 trang cụ thể             |
| `revalidateTag(tag)`    | Mọi fetch gắn `next: { tags: [...] }` có tag đó         | Data dùng ở nhiều trang — invalidate chính xác |
| `redirect(url)`         | Điều hướng + render trang đích với data mới             | Sau create → đưa user đến trang detail        |
| `router.refresh()`      | (Client) refetch RSC payload route hiện tại, giữ state  | Mutation qua fetch/API route từ client        |

Điểm quan trọng:

1. **Gọi revalidate ngay trong action** — đây là ưu thế lớn so với API Route: flow "mutate → invalidate → UI mới" nằm gọn trong 1 round-trip. Khi action chạy xong, Next trả về RSC payload **đã render lại** với data mới, client update tức thì.
2. `revalidateTag` chính xác hơn `revalidatePath` khi cùng một data hiển thị ở nhiều nơi (list, detail, sidebar) — gắn tag lúc fetch, invalidate 1 phát trúng tất cả.
3. **`router.refresh()`** dành cho trường hợp mutation không đi qua Server Action (ví dụ gọi API route bằng fetch từ Client Component) — nó refetch Server Component của route hiện tại nhưng **giữ nguyên client state** (useState, scroll).
4. `redirect()` sau mutation: trang đích được render mới, nhưng nếu data đích nằm trong cache cũ thì vẫn nên `revalidatePath` trước khi redirect.

**Pitfall kinh điển**: quên revalidate → user submit form thành công nhưng list không thấy item mới, back lại trang cũ vẫn thấy data stale do **Router Cache** phía client giữ RSC payload cũ. Nhiều người tưởng là bug — thực ra là thiếu `revalidatePath/Tag` trong action.

### Code minh hoạ

```typescript
// app/actions/posts.ts
"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

// ❌ SAI: mutate xong không revalidate
export async function badCreatePost(formData: FormData) {
  await db.post.create({ data: { title: formData.get("title") as string } });
  // User quay lại /posts → vẫn thấy list CŨ (Router Cache + Full Route Cache)
}

// ✅ revalidatePath — invalidate theo route
export async function createPost(formData: FormData) {
  await db.post.create({ data: { title: formData.get("title") as string } });
  revalidatePath("/posts"); // list render lại với data mới ngay trong response
}

// ✅ revalidateTag — invalidate chính xác theo data, trúng mọi trang dùng tag
export async function updateProduct(id: string, data: ProductInput) {
  await db.product.update({ where: { id }, data });
  revalidateTag("products"); // list + detail + sidebar đều dùng tag này
}

// Fetch gắn tag để revalidateTag hoạt động
async function getProducts() {
  const res = await fetch("https://api.example.com/products", {
    next: { tags: ["products"] },
  });
  return res.json();
}

// ✅ redirect sau mutation — revalidate trước rồi mới redirect
export async function createOrder(formData: FormData) {
  const order = await db.order.create({ data: parse(formData) });
  revalidatePath("/orders"); // list orders sẽ mới khi user quay lại
  redirect(`/orders/${order.id}`); // điều hướng đến trang detail
}
```

```tsx
// Trường hợp mutation KHÔNG qua Server Action → router.refresh() phía client
"use client";

import { useRouter } from "next/navigation";

export function LikeButton({ postId }: { postId: string }) {
  const router = useRouter();

  async function handleLike() {
    await fetch(`/api/posts/${postId}/like`, { method: "POST" });
    // Refetch RSC payload của route hiện tại — giữ nguyên client state
    router.refresh();
  }

  return <button onClick={handleLike}>Like</button>;
}
```

### Đáp án mẫu

> "Sau khi mutate DB trong Server Action, em phải chủ động revalidate vì Next cache nhiều tầng — Data Cache, Full Route Cache và Router Cache phía client. Em gọi `revalidatePath` khi mutation ảnh hưởng một route cụ thể, hoặc `revalidateTag` khi data hiển thị ở nhiều nơi — gắn tag lúc fetch rồi invalidate một phát trúng tất cả. Điểm hay là gọi ngay trong action: Next render lại và trả RSC payload mới trong cùng round-trip, UI update tức thì. Sau create em thường `revalidatePath` rồi `redirect` sang trang detail. Với mutation không qua action — ví dụ fetch API route từ client — em dùng `router.refresh()` để refetch Server Component mà vẫn giữ client state. Bẫy kinh điển là quên revalidate: mutation thành công nhưng user vẫn thấy data cũ do Router Cache — không phải bug, là thiếu revalidate."

---

## Câu 31: Error handling trong Server Actions như thế nào? `[Advanced]`

### Câu hỏi

> Error handling trong Server Actions như thế nào?

### Giải thích lý thuyết

Nguyên tắc cốt lõi: phân biệt **expected errors** (validation fail, không đủ quyền, record không tồn tại) và **unexpected errors** (DB sập, bug). Hai loại xử lý khác nhau:

**1. Expected errors → return, đừng throw.**
Pattern chuẩn là trả về object `{ success, error/errors }` và hiển thị qua `useActionState`. Lý do **không throw error thô**: trong production, Next.js **mask message của error** throw từ server (tránh leak thông tin nhạy cảm như connection string, stack trace) — client chỉ nhận message chung chung kèm digest. User sẽ không bao giờ thấy "Email đã tồn tại" nếu bạn throw nó.

**2. Unexpected errors → log đầy đủ phía server, trả message thân thiện.**
`console.error`/logger với context, rồi return `{ success: false, error: "Có lỗi xảy ra" }` — không bao giờ trả raw error message ra client.

**3. `error.tsx` không phải lưới an toàn cho mọi action.**
Error boundary chỉ bắt lỗi xảy ra **trong render flow** — action gọi qua `<form action>` hoặc trong `startTransition` thì lỗi throw không bắt được sẽ nổi lên error boundary gần nhất. Nhưng action gọi **trực tiếp trong event handler** (`onClick={() => await action()}`) chạy ngoài render flow — error boundary **không bắt** được, phải tự `try/catch` tại chỗ. Đây là điểm bẫy nhiều người dính.

**4. `redirect()` hoạt động bằng cách throw** error đặc biệt `NEXT_REDIRECT` để Next bắt ở framework level. Hệ quả: **không đặt `redirect()` trong `try/catch`** — catch sẽ "nuốt" mất error và redirect không xảy ra, lại còn log nhầm là lỗi. Luôn gọi `redirect()` **sau** khối try/catch, hoặc re-throw khi `isRedirectError(error)`.

### Code minh hoạ

```typescript
// app/actions/users.ts
"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// ❌ SAI: throw error thô
export async function badCreateUser(formData: FormData) {
  const email = formData.get("email") as string;
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    // Production: message bị Next MASK — client chỉ thấy
    // "An error occurred in the Server Components render" + digest
    throw new Error("Email đã tồn tại");
  }
}

const schema = z.object({ email: z.string().email(), name: z.string().min(2) });

export type ActionState = {
  success: boolean;
  errors?: Record<string, string[]>;
  error?: string;
};

// ✅ ĐÚNG: expected error → RETURN object; unexpected → log + message chung
export async function createUser(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // Expected: validation fail → trả field errors
  const parsed = schema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
  });
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  // Expected: business rule → trả message cụ thể, user hiểu được
  const existing = await db.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return { success: false, error: "Email đã được đăng ký" };
  }

  let userId: string;
  try {
    const user = await db.user.create({ data: parsed.data });
    userId = user.id;
  } catch (error) {
    // Unexpected: log đầy đủ phía server, KHÔNG leak ra client
    console.error("createUser thất bại:", error);
    return { success: false, error: "Có lỗi xảy ra, vui lòng thử lại" };
  }

  revalidatePath("/users");
  redirect(`/users/${userId}`); // ✅ NGOÀI try/catch — throw NEXT_REDIRECT
}
```

```tsx
// Hiển thị lỗi qua useActionState
"use client";
import { useActionState } from "react";
import { createUser, type ActionState } from "@/app/actions/users";

export function UserForm() {
  const [state, formAction, isPending] = useActionState(createUser, {
    success: false,
  });

  return (
    <form action={formAction}>
      <input name="email" />
      {state.errors?.email && <p className="error">{state.errors.email[0]}</p>}
      <input name="name" />
      {state.error && <p className="error">{state.error}</p>}
      <button disabled={isPending}>Tạo</button>
    </form>
  );
}

// ⚠️ Action gọi từ event handler — error boundary KHÔNG bắt → tự try/catch
function DeleteButton({ id }: { id: string }) {
  return (
    <button
      onClick={async () => {
        try {
          await deleteUser(id); // ngoài render flow / transition
        } catch {
          toast.error("Xóa thất bại"); // error.tsx không cứu được ở đây
        }
      }}
    >
      Xóa
    </button>
  );
}
```

### Đáp án mẫu

> "Em chia 2 loại lỗi. Expected errors — validation fail, email trùng, không đủ quyền — em **return** object `{success, error}` chứ không throw, rồi hiển thị qua `useActionState`. Lý do không throw thô: production Next mask message của error từ server để tránh leak thông tin, client chỉ thấy message chung kèm digest — user sẽ không bao giờ đọc được 'Email đã tồn tại'. Unexpected errors em log đầy đủ phía server và trả message thân thiện. Về `error.tsx`: nó chỉ bắt lỗi trong render flow — action gọi qua form action thì được, còn gọi trực tiếp trong event handler thì error boundary không bắt, phải try/catch tại chỗ. Cuối cùng, `redirect()` hoạt động bằng cách throw `NEXT_REDIRECT` nên tuyệt đối không đặt trong try/catch — catch sẽ nuốt mất và redirect không chạy; em luôn gọi nó sau khối try/catch."

---

## Câu 33: Cookies và Headers trong Next.js Server Components và Actions? `[Basic]`

### Câu hỏi

> Cookies và Headers trong Next.js Server Components và Actions?

### Giải thích lý thuyết

Cả hai đều import từ `next/headers`. **Next.js 15: đây là async API — phải `await`** (Next 14 trở về trước là sync, đây là breaking change hay bị hỏi).

**`cookies()`** — quy tắc quan trọng nhất:

| Thao tác         | Server Component | Server Action | Route Handler |
| ---------------- | ---------------- | ------------- | ------------- |
| Đọc (`get`)      | ✅               | ✅            | ✅            |
| Set (`set`)      | ❌               | ✅            | ✅            |
| Xóa (`delete`)   | ❌               | ✅            | ✅            |

**Tại sao không set được cookie trong Server Component?** Vì cookie được gửi qua **response header** (`Set-Cookie`). Server Component render theo kiểu **streaming** — khi component đang render thì header có thể đã được gửi xuống browser rồi, không thể quay lại sửa. Server Action và Route Handler xử lý request riêng, kiểm soát được response trước khi gửi nên set được.

**`headers()`** — read-only hoàn toàn:

1. Chỉ **đọc request headers** (`get`, `has`), không set được. Muốn set **response** header thì dùng Route Handler hoặc `middleware.ts` (qua `NextResponse`).
2. Use case: `user-agent` (detect bot/mobile), `authorization` (Bearer token), geo/IP headers từ proxy (`x-forwarded-for`, `x-vercel-ip-country`), `accept-language` (i18n).
3. Header như `x-forwarded-for` chỉ tin khi đứng sau proxy mình kiểm soát — client có thể spoof.

**Side effect chung**: gọi `cookies()` hay `headers()` trong page làm route trở thành **dynamic** — render mỗi request, mất static cache. Hợp lý vì cookie/header là per-request, không thể prerender 1 HTML chung. Đừng vô tình thêm vào page muốn giữ static.

Khi set cookie session: luôn dùng `httpOnly` (chống XSS đọc cookie), `secure` (chỉ HTTPS), `sameSite: 'lax'` (giảm rủi ro CSRF).

### Code minh hoạ

```typescript
// Đọc cookie + header trong Server Component
// app/dashboard/page.tsx
import { cookies, headers } from "next/headers";

export default async function Dashboard() {
  const cookieStore = await cookies(); // Next 15: PHẢI await
  const headerList = await headers();

  const session = cookieStore.get("session")?.value;
  const theme = cookieStore.get("theme")?.value ?? "light";

  const userAgent = headerList.get("user-agent") ?? "";
  const country = headerList.get("x-vercel-ip-country") ?? "VN";
  const isMobile = /Mobile|Android|iPhone/i.test(userAgent);

  // Lưu ý: dùng cookies()/headers() → page này trở thành DYNAMIC
  const user = session ? await getUserFromSession(session) : null;
  return <DashboardView user={user} theme={theme} mobile={isMobile} country={country} />;
}

// ❌ SAI: set cookie trong Server Component — runtime error
export default async function BadPage() {
  const cookieStore = await cookies();
  cookieStore.set("visited", "true"); // Error! Response có thể đã stream
  return <div>...</div>;
}

// ✅ ĐÚNG: set/delete cookie trong Server Action
// app/actions/auth.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const { token } = await verifyCredentials(
    formData.get("email") as string,
    formData.get("password") as string
  );

  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,           // JS client không đọc được — chống XSS
    secure: true,             // chỉ gửi qua HTTPS
    sameSite: "lax",          // giảm rủi ro CSRF
    maxAge: 60 * 60 * 24 * 7, // 7 ngày
    path: "/",
  });

  redirect("/dashboard");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/signin");
}

// ✅ Route Handler cũng set được cookie + response header
// app/api/auth/callback/route.ts
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const token = await exchangeOAuthCode(req);
  const cookieStore = await cookies();
  cookieStore.set("session", token, { httpOnly: true, secure: true });
  return Response.redirect(new URL("/dashboard", req.url));
}

// ✅ Set RESPONSE header → middleware (headers() chỉ đọc request header)
// middleware.ts
import { NextResponse } from "next/server";

export function middleware() {
  const response = NextResponse.next();
  response.headers.set("x-request-id", crypto.randomUUID());
  return response;
}
```

### Đáp án mẫu

> "Em dùng `cookies()` và `headers()` từ `next/headers` — Next 15 cả hai là async API nên phải `await`, khác Next 14 là sync. Trong Server Component em chỉ **đọc** được: cookie qua `get/has`, header qua `get` — như `user-agent`, `authorization` hay geo header. Còn **set và delete cookie chỉ được phép trong Server Action hoặc Route Handler** — lý do là cookie đi qua response header `Set-Cookie`, mà Server Component render kiểu streaming nên header có thể đã gửi xuống browser, không sửa lại được. `headers()` thì read-only hoàn toàn — muốn set response header phải dùng middleware hoặc Route Handler. Side effect quan trọng: gọi hai API này làm route thành dynamic, mất static cache — hợp lý vì chúng per-request. Khi set cookie session, em luôn dùng `httpOnly`, `secure`, `sameSite: 'lax'`."

---

## Câu 34: Optimistic updates với Server Actions và useOptimistic? `[Advanced]`

### Câu hỏi

> Optimistic updates với Server Actions và useOptimistic?

### Giải thích lý thuyết

**Vấn đề**: Server Action mất 1 round-trip (vài trăm ms) — nếu chờ action xong mới update UI thì cảm giác chậm. Optimistic update = **hiển thị kết quả ngay lập tức** như thể đã thành công, server xử lý sau.

**`useOptimistic(state, updateFn)`** (React 19) là hook chuyên cho việc này:

- Nhận `state` thật (từ props/server) và `updateFn(currentState, optimisticValue)` — function **pure** tính ra state "lạc quan".
- Trả về `[optimisticState, addOptimistic]` — gọi `addOptimistic(value)` thì UI render `optimisticState` **ngay lập tức**, trong khi action vẫn đang chạy.
- **React tự quản lý vòng đời**: khi action hoàn tất và state thật mới (sau revalidate) chảy xuống, optimistic state được thay bằng state thật. Nếu action **lỗi**, React tự **rollback** về state cũ — không phải viết code revert thủ công.

Điều kiện: `addOptimistic` phải được gọi **trong transition** — tức là bên trong form action, hoặc wrap trong `startTransition` (từ `useTransition`) khi gọi từ event handler. Gọi ngoài transition sẽ bị warning và không hoạt động đúng.

**So với manual optimistic state** (tự `setState` trước rồi revert trong catch): `useOptimistic` gọn hơn hẳn — không cần lưu snapshot state cũ, không cần viết logic rollback, không lo race condition khi nhiều update chồng nhau (React queue các optimistic update theo transition).

Use case kinh điển: like button, todo list, comment, vote — các mutation nhỏ, tỷ lệ thành công cao, user cần phản hồi tức thì.

Pitfall: vẫn phải `revalidatePath/Tag` trong action — optimistic state chỉ là "tạm ứng" UI, state thật phải được server xác nhận và chảy xuống lại.

### Code minh hoạ

```tsx
// app/actions/likes.ts
"use server";
import { revalidatePath } from "next/cache";

export async function likePost(postId: string) {
  await db.like.create({ data: { postId, userId: await getUserId() } });
  revalidatePath(`/posts/${postId}`); // state thật chảy xuống sau khi xong
}

// LikeButton — optimistic ngay trong form action
"use client";
import { useOptimistic } from "react";
import { likePost } from "@/app/actions/likes";

export function LikeButton({ postId, likes }: { postId: string; likes: number }) {
  // updateFn PURE: (state hiện tại, giá trị optimistic) => state lạc quan
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    likes,
    (current, increment: number) => current + increment
  );

  return (
    // form action chạy trong transition → gọi addOptimistic hợp lệ
    <form
      action={async () => {
        addOptimisticLike(1);    // UI hiện likes + 1 NGAY LẬP TỨC
        await likePost(postId);  // server chạy; lỗi → React TỰ rollback
      }}
    >
      <button type="submit">❤️ {optimisticLikes}</button>
    </form>
  );
}
```

```tsx
// Todo list — optimistic item + kết hợp useTransition cho event handler
"use client";
import { useOptimistic, useTransition } from "react";
import { addTodo } from "@/app/actions/todos";

type Todo = { id: string; title: string; pending?: boolean };

export function TodoList({ todos }: { todos: Todo[] }) {
  const [isPending, startTransition] = useTransition();

  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (current, title: string) => [
      ...current,
      { id: `tmp-${Date.now()}`, title, pending: true }, // đánh dấu item tạm
    ]
  );

  function handleAdd(title: string) {
    // Gọi từ event handler → PHẢI wrap trong startTransition
    startTransition(async () => {
      addOptimisticTodo(title); // item hiện ngay với style mờ
      await addTodo(title);     // xong → revalidate → state thật thay thế
    });
  }

  return (
    <ul>
      {optimisticTodos.map((t) => (
        <li key={t.id} style={{ opacity: t.pending ? 0.5 : 1 }}>
          {t.title}
        </li>
      ))}
    </ul>
  );
}

// ❌ Manual optimistic — dài dòng, phải tự rollback, dễ race condition
function ManualLike({ likes }: { likes: number }) {
  const [count, setCount] = useState(likes);
  async function handle() {
    const prev = count;
    setCount(count + 1); // tự tạm ứng
    try {
      await likePost("id");
    } catch {
      setCount(prev); // tự rollback — useOptimistic làm giùm việc này
    }
  }
  return <button onClick={handle}>❤️ {count}</button>;
}
```

### Đáp án mẫu

> "Optimistic update là hiển thị kết quả ngay khi user thao tác, không chờ server — em dùng `useOptimistic(state, updateFn)`. Hook nhận state thật và một pure function tính state 'lạc quan', trả về `[optimisticState, addOptimistic]`. Khi gọi `addOptimistic`, UI render kết quả tức thì trong lúc Server Action vẫn chạy; action xong và revalidate thì state thật thay thế, còn nếu action lỗi thì **React tự rollback** về state cũ — em không phải viết code revert thủ công như manual optimistic state. Điều kiện là gọi trong transition: trong form action thì tự nhiên có, còn từ event handler phải wrap `startTransition`. Em hay dùng cho like button, todo, comment — mutation nhỏ, cần phản hồi tức thì. Lưu ý vẫn phải `revalidatePath` trong action vì optimistic chỉ là tạm ứng UI, state thật phải do server xác nhận."

---

## Câu 50: useFormStatus và useActionState — và tại sao useFormStatus phải nằm trong component con? `[Advanced]`

### Câu hỏi

> useFormStatus và useActionState dùng để làm gì với Server Actions, và tại sao useFormStatus phải nằm trong component con của form?

### Giải thích lý thuyết

Hai hook phục vụ 2 nhu cầu khác nhau khi làm form với Server Actions:

| Hook              | Trả về                              | Mục đích                                          |
| ----------------- | ----------------------------------- | ------------------------------------------------- |
| `useFormStatus`   | `{ pending, data, method, action }` | Đọc trạng thái submit của **form cha gần nhất**   |
| `useActionState`  | `[state, formAction, isPending]`    | "State máy" cho action: nhận kết quả action trả về + pending |

**`useActionState`** (React 19, thay cho `useFormState` cũ): wrap một action có signature `(prevState, formData)`. Return value của action trở thành `state` mới — dùng cho validation errors, message. Phần tử thứ 3 `isPending` cho biết action đang chạy.

**`useFormStatus`** — đây là **câu bẫy kinh điển**: hook này đọc trạng thái qua **context** mà React cung cấp từ `<form>` **cha gần nhất** — cơ chế giống `useContext`, provider chính là thẻ `<form>`.

Hệ quả: nếu gọi `useFormStatus` trong **chính component render ra `<form>`**, tại vị trí gọi hook thì component đó **không nằm bên trong form nào cả** (form là con của nó, không phải cha) → không có "form cha" để đọc → `pending` luôn `false`.

Fix: tách phần cần đọc status (nút submit) ra **component con riêng**, đặt **bên trong** `<form>`. Đây cũng là pattern chuẩn: một `<SubmitButton />` tái sử dụng cho mọi form.

Khi nào dùng cái nào:
- Chỉ cần disable nút khi submit → `useFormStatus` trong SubmitButton (component không cần biết action là gì).
- Cần kết quả trả về (errors, message) → `useActionState` (đã có sẵn `isPending`, nhiều khi không cần `useFormStatus` nữa).
- Kết hợp cả hai: `useActionState` quản state ở form, `SubmitButton` dùng `useFormStatus` để tự quản pending — button tái sử dụng được khắp nơi.

### Code minh hoạ

```tsx
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createPost, type PostState } from "@/app/actions/posts";

// ❌ SAI: useFormStatus trong CÙNG component chứa <form>
function BadForm() {
  const { pending } = useFormStatus();
  // Tại vị trí này, component KHÔNG nằm trong form nào
  // → không có form cha → pending LUÔN LUÔN false!

  return (
    <form action={createPost}>
      <input name="title" />
      <button disabled={pending}>{pending ? "Đang lưu..." : "Lưu"}</button>
      {/* disabled không bao giờ kích hoạt */}
    </form>
  );
}

// ✅ ĐÚNG: tách SubmitButton thành component con, nằm BÊN TRONG <form>
function SubmitButton({ label }: { label: string }) {
  // Bây giờ <form> là CHA của component này
  // → useFormStatus đọc được context do form cung cấp
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? "Đang xử lý..." : label}
    </button>
  );
}

// Kết hợp useActionState (state máy) + useFormStatus (pending ở button)
const initialState: PostState = { errors: {} };

export function PostForm() {
  // [state hiện tại, action đã wrap, đang pending?]
  const [state, formAction, isPending] = useActionState(createPost, initialState);

  return (
    <form action={formAction}>
      <input name="title" />
      {state.errors?.title && <p className="error">{state.errors.title[0]}</p>}

      <textarea name="content" />
      {state.errors?.content && <p className="error">{state.errors.content[0]}</p>}

      {/* SubmitButton tự đọc pending qua context — tái sử dụng cho mọi form */}
      <SubmitButton label="Đăng bài" />

      {/* Hoặc dùng isPending từ useActionState cho UI ngoài button */}
      {isPending && <p>Đang gửi bài viết...</p>}
      {state.message && <p>{state.message}</p>}
    </form>
  );
}

// app/actions/posts.ts
("use server");

export type PostState = {
  errors?: Record<string, string[]>;
  message?: string;
};

export async function createPost(
  prevState: PostState,
  formData: FormData
): Promise<PostState> {
  // validate + mutate...
  return { message: "Đăng bài thành công" };
}
```

### Đáp án mẫu

> "`useActionState` là state máy cho Server Action: nó wrap action signature `(prevState, formData)`, trả về `[state, formAction, isPending]` — em dùng để nhận validation errors hay message mà action return về. Còn `useFormStatus` đọc trạng thái pending của form, nhưng cơ chế của nó là đọc qua **context do thẻ `<form>` cha gần nhất cung cấp** — giống useContext với form là provider. Đó là lý do bẫy kinh điển: nếu gọi `useFormStatus` ngay trong component render ra form, thì tại vị trí đó component không nằm **bên trong** form nào — form là con chứ không phải cha — nên `pending` luôn false. Fix là tách `SubmitButton` thành component con đặt bên trong form. Em hay làm một SubmitButton dùng chung: nó tự biết pending qua context, không cần biết action là gì, tái sử dụng cho mọi form trong app."

---

## Câu 57: Security considerations khi dùng Server Actions? `[Advanced]`

### Câu hỏi

> Security considerations khi dùng Server Actions?

### Giải thích lý thuyết

Nhận thức quan trọng nhất: **mỗi Server Action được export là một PUBLIC HTTP endpoint**. Nó "trông như" function nội bộ, nhưng attacker hoàn toàn có thể POST trực tiếp đến endpoint với action ID và payload tùy ý — không cần đi qua UI của bạn.

Các lớp bảo vệ bắt buộc:

1. **Authentication + Authorization BÊN TRONG từng action**. Đừng dựa vào việc "nút này chỉ hiện với admin" — UI ẩn nút không ngăn được request. Mỗi action phải tự verify session và check quyền trên chính resource đang thao tác (authz theo resource, không chỉ theo role).

2. **Không tin bất kỳ dữ liệu nào từ client — kể cả hidden field**. `<input type="hidden" name="userId">` hay `name="price"` đều sửa được qua DevTools hoặc POST trực tiếp. Giá trị nhạy cảm (userId, price, role) phải lấy từ **server-side source of truth** (session, DB), không lấy từ FormData.

3. **Validate input bằng Zod** trong mọi action — schema chặt: type, length, enum, range.

4. **Closure values được mã hóa nhưng đừng dựa vào**. Khi action định nghĩa inline trong Server Component và "đóng" (close over) biến bên ngoài, Next serialize biến đó gửi xuống client (đã encrypt với key per-build). Encryption chống đọc/sửa, nhưng: key đổi mỗi build (multi-instance phải set `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` đồng bộ), và đây không phải cơ chế authz — vẫn phải re-check quyền trong action.

5. **Rate limiting** — action là endpoint nên cũng cần chống abuse/brute-force như API thường (theo IP/user, đặc biệt action login, gửi email).

6. **Dead code elimination KHÔNG xóa action đã export**. Action export ra nhưng không còn dùng trong UI **vẫn là endpoint sống** — ai biết action ID cũ vẫn gọi được. Phải chủ động xóa action không dùng, đừng để "rác" thành attack surface.

### Code minh hoạ

```typescript
// app/actions/admin.ts
"use server";

import { z } from "zod";
import { getSession } from "@/lib/auth";
import { ratelimit } from "@/lib/ratelimit";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// ❌ NGUY HIỂM: không auth, tin hidden field từ client
export async function badDeleteUser(formData: FormData) {
  const userId = formData.get("userId") as string; // attacker sửa được!
  await db.user.delete({ where: { id: userId } });
  // Bất kỳ ai POST đến endpoint này đều xóa được user bất kỳ
}

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100),
  bio: z.string().max(500).optional(),
});

// ✅ AN TOÀN: đầy đủ các lớp bảo vệ
export async function updateProfile(formData: FormData) {
  // Lớp 1: Authentication — verify session BÊN TRONG action
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Chưa đăng nhập" };
  }

  // Lớp 2: Rate limiting — action là public endpoint, chống abuse
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") ?? "unknown";
  const { success: allowed } = await ratelimit.limit(`profile:${session.userId}:${ip}`);
  if (!allowed) {
    return { success: false, error: "Quá nhiều request, thử lại sau" };
  }

  // Lớp 3: Validation — không tin FormData
  const parsed = updateProfileSchema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio"),
  });
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  // Lớp 4: userId lấy từ SESSION, không lấy từ hidden field
  await db.user.update({
    where: { id: session.userId }, // server-side source of truth
    data: parsed.data,
  });

  revalidatePath("/profile");
  return { success: true };
}

// ✅ Authorization theo RESOURCE, không chỉ theo role
export async function deletePost(postId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Chưa đăng nhập" };

  const post = await db.post.findUnique({ where: { id: postId } });
  if (!post) return { success: false, error: "Không tìm thấy bài viết" };

  // Check quyền trên CHÍNH resource này: owner hoặc admin
  const canDelete = post.authorId === session.userId || session.role === "admin";
  if (!canDelete) {
    return { success: false, error: "Không có quyền xóa" };
  }

  await db.post.delete({ where: { id: postId } });
  revalidatePath("/posts");
  return { success: true };
}

// Lưu ý closure: action inline đóng biến bên ngoài
// app/products/[id]/page.tsx
export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } });

  async function buy() {
    "use server";
    // `product.price` bị close over → serialize xuống client (đã encrypt)
    // ĐỪNG dựa vào giá này — re-fetch từ DB trước khi tính tiền!
    const fresh = await db.product.findUnique({ where: { id } });
    await charge(fresh!.price);
  }

  return <form action={buy}>...</form>;
}
```

### Đáp án mẫu

> "Điều đầu tiên em luôn nhắc team: Server Action là **public HTTP endpoint** — attacker POST thẳng vào được, không cần đi qua UI. Nên lớp bảo vệ thứ nhất là auth và authz **bên trong từng action**: verify session, rồi check quyền trên chính resource đang thao tác — ẩn nút ở UI không phải là bảo mật. Thứ hai, không tin bất kỳ dữ liệu nào từ client kể cả hidden field — userId, price phải lấy từ session hoặc DB, và mọi input validate bằng Zod. Thứ ba, closure values trong action inline được Next encrypt khi gửi xuống client, nhưng em không dựa vào đó — giá tiền vẫn re-fetch từ DB. Thứ tư, rate limiting cho action nhạy cảm như login. Cuối cùng, một điểm ít người biết: dead code elimination không xóa action đã export — action không còn dùng vẫn là endpoint sống, phải chủ động dọn để giảm attack surface."

---

## Câu 63: Server Actions có bảo vệ CSRF tích hợp không, và vẫn phải tự lo những lớp bảo mật nào? `[Advanced]`

### Câu hỏi

> Server Actions có bảo vệ CSRF tích hợp không, và bạn vẫn phải tự lo những lớp bảo mật nào?

### Giải thích lý thuyết

**Có** — Next.js tích hợp sẵn nhiều lớp chống CSRF cho Server Actions:

1. **Chỉ chấp nhận POST** — Server Action không bao giờ được gọi qua GET, loại bỏ CSRF dạng `<img src>`, link, prefetch (các vector chỉ tạo được GET).
2. **So khớp `Origin` header với `Host` header** — nếu request đến từ origin khác (form trên site attacker submit chéo sang), Next reject. Đây là cơ chế chống CSRF chính, thay cho CSRF token truyền thống.
3. **Action ID không đoán được** — mỗi action có ID do build sinh ra; attacker không có ID thì không biết gọi endpoint nào. (Đây là defense-in-depth, không phải lớp chính — đừng coi là secret.)
4. Cookie `SameSite` (mặc định các session lib dùng `lax`) thêm một lớp nữa ở phía cookie.

**Cấu hình khi chạy sau reverse proxy**: nếu app đứng sau proxy/load balancer mà `Host` header bị rewrite (khác origin thật user thấy), việc so khớp Origin vs Host sẽ **fail oan** hoặc cần nới lỏng. Khi đó cấu hình `serverActions.allowedOrigins` trong `next.config.ts` để khai báo các origin hợp lệ — và chỉ khai báo domain mình kiểm soát, đừng wildcard bừa.

**Những gì framework KHÔNG lo giùm** — CSRF protection không thay thế:

| Lớp                    | Tại sao vẫn cần                                                  |
| ---------------------- | ---------------------------------------------------------------- |
| Authentication         | CSRF check chỉ chặn cross-site, không chặn request không có session |
| Authorization per-action | User hợp lệ vẫn có thể gọi action vượt quyền (IDOR)            |
| Input validation       | Same-origin request vẫn chứa payload độc hại                     |
| Rate limiting          | Origin hợp lệ vẫn spam/brute-force được                          |
| Audit log              | Cần truy vết ai làm gì với mutation nhạy cảm                     |

Insight phỏng vấn: câu này phân biệt mid và senior — mid trả lời "Next có chống CSRF rồi nên yên tâm"; senior hiểu CSRF chỉ là **một** threat model (lừa browser của victim gửi request chéo site), còn attacker gọi **trực tiếp** endpoint với session của chính họ thì CSRF protection hoàn toàn vô nghĩa — phải có authz, validation, rate limit riêng.

### Code minh hoạ

```typescript
// next.config.ts — cấu hình khi chạy sau reverse proxy
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Proxy rewrite Host header → khai báo origin hợp lệ
      // CHỈ liệt kê domain mình kiểm soát, không wildcard bừa
      allowedOrigins: ["app.example.com", "*.internal.example.com"],
      bodySizeLimit: "2mb", // giới hạn payload — chống abuse upload lớn
    },
  },
};

export default nextConfig;

// Minh họa: những gì Next ĐÃ lo (không phải code của mình)
// - Request GET đến action endpoint → reject
// - Origin: https://evil.com nhưng Host: app.example.com → reject
// - Action ID sai/không tồn tại → reject

// Những gì PHẢI TỰ LO — ví dụ action chuyển tiền đầy đủ các lớp
// app/actions/transfer.ts
"use server";

import { z } from "zod";
import { getSession } from "@/lib/auth";
import { ratelimit } from "@/lib/ratelimit";
import { auditLog } from "@/lib/audit";

const transferSchema = z.object({
  toAccountId: z.string().uuid(),
  amount: z.number().positive().max(100_000_000),
});

export async function transferMoney(input: unknown) {
  // 1. Authentication — CSRF check KHÔNG thay được bước này
  const session = await getSession();
  if (!session) return { success: false, error: "Chưa đăng nhập" };

  // 2. Rate limiting — origin hợp lệ vẫn spam được
  const { success: allowed } = await ratelimit.limit(`transfer:${session.userId}`);
  if (!allowed) return { success: false, error: "Thao tác quá nhanh" };

  // 3. Input validation — same-origin vẫn có payload độc hại
  const parsed = transferSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Dữ liệu không hợp lệ" };

  // 4. Authorization per-action — chống IDOR
  const account = await db.account.findFirst({
    where: { ownerId: session.userId }, // tài khoản nguồn PHẢI của chính user
  });
  if (!account || account.balance < parsed.data.amount) {
    return { success: false, error: "Số dư không đủ" };
  }

  // 5. Thực hiện trong transaction
  await db.$transaction([
    db.account.update({
      where: { id: account.id },
      data: { balance: { decrement: parsed.data.amount } },
    }),
    db.account.update({
      where: { id: parsed.data.toAccountId },
      data: { balance: { increment: parsed.data.amount } },
    }),
  ]);

  // 6. Audit log — truy vết mutation nhạy cảm
  await auditLog({
    actor: session.userId,
    action: "transfer",
    detail: parsed.data,
  });

  return { success: true };
}
```

### Đáp án mẫu

> "Có — Next.js chống CSRF sẵn cho Server Actions bằng ba cơ chế: action chỉ chấp nhận POST nên loại các vector GET như img tag; Next so khớp `Origin` header với `Host` header, request cross-site bị reject — đây là lớp chính, thay cho CSRF token truyền thống; và mỗi action có ID build-time không đoán được, là defense-in-depth. Khi app chạy sau reverse proxy làm Host header bị rewrite, em cấu hình `serverActions.allowedOrigins` trong next.config để khai báo origin hợp lệ — chỉ domain mình kiểm soát. Nhưng em luôn nhấn mạnh: CSRF chỉ là một threat model — lừa browser victim gửi request chéo site. Attacker gọi trực tiếp endpoint bằng session của chính họ thì CSRF protection vô nghĩa, nên vẫn phải tự lo: authentication, authorization per-action chống IDOR, input validation bằng Zod, rate limiting, và audit log cho mutation nhạy cảm."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                                       | Đúng là                                                                  |
| ------------------------------------------------------------- | ------------------------------------------------------------------------ |
| "Mutate DB xong là UI tự cập nhật"                            | Phải `revalidatePath/Tag` trong action — quên là user thấy data cũ do Router Cache |
| "Throw error thô trong action để báo lỗi cho user"            | Production mask message — trả về `{success, error}` + hiển thị qua `useActionState` |
| "error.tsx bắt mọi lỗi từ Server Action"                      | Chỉ bắt trong render flow / form action — gọi từ event handler phải try/catch tại chỗ |
| "Đặt redirect() trong try/catch cho an toàn"                  | redirect() throw NEXT_REDIRECT — catch sẽ nuốt mất, không redirect       |
| "cookies()/headers() gọi sync như Next 14"                    | Next 15 là async — phải `await`                                          |
| "Set cookie ở đâu cũng được"                                  | Chỉ trong Server Action hoặc Route Handler — response đã stream          |
| "useOptimistic phải tự viết code rollback khi lỗi"            | React tự rollback về state cũ khi action lỗi — chỉ cần updateFn pure     |
| "useFormStatus gọi cùng component chứa form"                  | Phải nằm trong component CON bên trong form — đọc qua context của form cha |
| "Server Action là function nội bộ nên an toàn"                | Là PUBLIC endpoint — phải auth/authz/validate trong từng action          |
| "Next chống CSRF rồi nên khỏi lo bảo mật"                     | CSRF chỉ là 1 threat model — vẫn phải tự lo authz, validation, rate limit |
