---
sidebar_position: 5
title: "5. Server Actions & Mutations"
---

# Server Actions & Mutations

> *Server Actions biến mutation thành "gọi function" — nhưng đừng quên: mỗi action là một public endpoint, và mọi quy tắc bảo mật của API vẫn áp dụng.*

---

## Câu 32: Server Actions là gì? `[Intermediate]`

### Câu hỏi

> Server Actions trong Next.js là gì? Cơ chế hoạt động bên dưới như thế nào, và tại sao nói nó hỗ trợ progressive enhancement?

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

## Câu 33: Khi nào nên dùng Server Actions thay vì API Routes? `[Intermediate]`

### Câu hỏi

> Dự án của em cần xử lý mutation (tạo/sửa/xóa data). Em nên dùng Server Actions hay viết Route Handler (`app/api/.../route.ts`)? Tiêu chí lựa chọn là gì?

### Giải thích lý thuyết

Quy tắc ngắn gọn: **mutation nội bộ app → Server Actions; expose ra ngoài → API Routes**.

| Tiêu chí                | Server Actions                              | API Routes (Route Handler)              |
| ----------------------- | ------------------------------------------- | --------------------------------------- |
| Type-safety             | End-to-end — TypeScript infer trực tiếp     | Tự định nghĩa type 2 đầu, dễ lệch       |
| Fetch layer             | Không cần — import và gọi như function      | Phải viết fetch + serialize + parse     |
| Revalidate / redirect   | `revalidateTag/Path`, `redirect` tích hợp   | Tự xử lý, client phải refetch           |
| HTTP method             | Chỉ POST (Next tự quản lý)                  | GET/POST/PUT/PATCH/DELETE tùy ý         |
| Consumer                | Chỉ app Next.js của mình                    | Mobile app, third-party, service khác   |
| Response format         | Next quản lý (RSC payload)                  | Tùy ý: JSON, stream, file, SSE          |
| Progressive enhancement | Có (qua form action)                        | Không                                   |

Dùng **Server Actions** khi:
- Mutation từ chính app Next.js (form submit, button click).
- Muốn type-safe end-to-end, không muốn maintain fetch layer.
- Cần `revalidatePath/Tag` + `redirect` ngay sau mutation trong 1 flow.

Dùng **API Routes** khi:
- **Public API** cho third-party hoặc mobile app consume.
- **Webhook receiver** (Stripe, GitHub... — bên ngoài không thể gọi Server Action).
- Cần **HTTP method khác POST** (GET cho client-side fetching, DELETE theo chuẩn REST).
- Cần **response format đặc thù**: file download, SSE streaming, custom headers/status code.

Pitfall phỏng vấn: nhiều người nghĩ Server Actions "thay thế hoàn toàn" API Routes — sai. Chúng giải quyết 2 bài toán khác nhau: Server Actions là RPC nội bộ cho mutation; API Routes là HTTP interface công khai.

### Code minh hoạ

```typescript
// ✅ Server Action — mutation nội bộ, type-safe end-to-end
// app/actions/products.ts
"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

export async function createProduct(input: { name: string; price: number }) {
  const product = await db.product.create({ data: input });

  revalidateTag("products"); // invalidate cache ngay trong flow
  redirect(`/products/${product.id}`); // điều hướng luôn
}

// Client gọi — không cần fetch layer, type được infer
"use client";
import { createProduct } from "@/app/actions/products";

function CreateButton() {
  return (
    <button onClick={() => createProduct({ name: "Laptop", price: 1500 })}>
      Tạo
    </button>
  );
}

// ✅ API Route — khi cần expose ra ngoài
// app/api/v1/products/route.ts — mobile app / third-party gọi
export async function GET(req: Request) {
  const products = await db.product.findMany();
  return Response.json({ success: true, data: products });
}

// app/api/webhooks/stripe/route.ts — webhook bắt buộc là HTTP endpoint
export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")!;
  const event = stripe.webhooks.constructEvent(
    await req.text(),
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
  // ... xử lý event
  return Response.json({ received: true });
}

// app/api/export/route.ts — response format đặc thù (file download)
export async function GET() {
  const csv = await generateCsv();
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="products.csv"',
    },
  });
}
```

### Đáp án mẫu

> "Quy tắc của em: mutation từ chính app Next.js thì dùng Server Actions, còn expose ra ngoài thì dùng API Routes. Server Actions cho em type-safe end-to-end — import function và gọi trực tiếp, không phải viết fetch layer, không phải maintain type 2 đầu. Nó còn tích hợp sẵn `revalidateTag` và `redirect` nên flow mutation → invalidate cache → điều hướng nằm gọn trong 1 function. Em chuyển sang API Routes khi: cần public API cho mobile hoặc third-party, nhận webhook từ Stripe/GitHub — bên ngoài không thể gọi Server Action; cần method khác POST như GET cho client fetching; hoặc cần response đặc thù như file download, SSE streaming. Tóm lại hai cái không thay thế nhau: Server Actions là RPC nội bộ, API Routes là HTTP interface công khai."

---

## Câu 34: Form actions trong Next.js hoạt động như thế nào? `[Intermediate]`

### Câu hỏi

> Em gắn Server Action vào `<form action={...}>`. Luồng xử lý diễn ra như thế nào? Làm sao nhận state trả về từ action và validate dữ liệu?

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

## Câu 35: Cookies trong Server Components truy cập bằng cách nào? `[Basic]`

### Câu hỏi

> Em cần đọc cookie session trong Server Component và set cookie sau khi login. Làm thế nào, và có giới hạn gì cần biết?

### Giải thích lý thuyết

Dùng `cookies()` từ `next/headers`. **Next.js 15: đây là async API — phải `await`** (Next 14 trở về trước là sync, đây là breaking change hay bị hỏi).

Quy tắc quan trọng nhất:

| Thao tác         | Server Component | Server Action | Route Handler |
| ---------------- | ---------------- | ------------- | ------------- |
| Đọc (`get`)      | ✅               | ✅            | ✅            |
| Set (`set`)      | ❌               | ✅            | ✅            |
| Xóa (`delete`)   | ❌               | ✅            | ✅            |

**Tại sao không set được cookie trong Server Component?** Vì cookie được gửi qua **response header** (`Set-Cookie`). Server Component render theo kiểu **streaming** — khi component đang render thì header có thể đã được gửi xuống browser rồi, không thể quay lại sửa. Server Action và Route Handler xử lý request riêng, kiểm soát được response trước khi gửi nên set được.

Side effect cần nhớ: gọi `cookies()` trong page làm route trở thành **dynamic** — render mỗi request, mất static cache. Hợp lý vì cookie là per-user, không thể prerender 1 HTML chung.

### Code minh hoạ

```typescript
// Đọc cookie trong Server Component
// app/dashboard/page.tsx
import { cookies } from "next/headers";

export default async function Dashboard() {
  const cookieStore = await cookies(); // Next 15: PHẢI await

  const session = cookieStore.get("session")?.value;
  const theme = cookieStore.get("theme")?.value ?? "light";
  const hasConsent = cookieStore.has("cookie-consent");

  // Lưu ý: dùng cookies() → page này trở thành dynamic
  const user = session ? await getUserFromSession(session) : null;
  return <DashboardView user={user} theme={theme} />;
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
    httpOnly: true,          // JS client không đọc được — chống XSS
    secure: true,            // chỉ gửi qua HTTPS
    sameSite: "lax",         // giảm rủi ro CSRF
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

// ✅ Route Handler cũng set được
// app/api/auth/callback/route.ts
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const token = await exchangeOAuthCode(req);
  const cookieStore = await cookies();
  cookieStore.set("session", token, { httpOnly: true, secure: true });
  return Response.redirect(new URL("/dashboard", req.url));
}
```

### Đáp án mẫu

> "Em dùng `cookies()` từ `next/headers` — lưu ý Next 15 đây là async API nên phải `await cookies()`, khác Next 14 là sync. Trong Server Component em chỉ **đọc** được cookie: `get`, `has`. Còn **set và delete chỉ được phép trong Server Action hoặc Route Handler** — lý do là cookie đi qua response header `Set-Cookie`, mà Server Component render theo kiểu streaming nên header có thể đã gửi xuống browser rồi, không sửa lại được. Một side effect quan trọng: gọi `cookies()` làm route thành dynamic, render mỗi request và mất static cache — hợp lý vì cookie là per-user. Khi set cookie session, em luôn dùng `httpOnly`, `secure`, `sameSite: 'lax'` để chống XSS đọc cookie và giảm rủi ro CSRF."

---

## Câu 36: Headers trong Server Components truy cập bằng cách nào? `[Basic]`

### Câu hỏi

> Em cần đọc `user-agent` và `authorization` header của request trong Server Component. Dùng API gì, và nó ảnh hưởng gì đến rendering?

### Giải thích lý thuyết

Dùng `headers()` từ `next/headers` — giống `cookies()`, **Next 15 là async, phải `await`**.

Đặc điểm:

1. **Read-only** — chỉ đọc request headers, không set được. Muốn set **response** header thì dùng Route Handler hoặc `middleware.ts` (qua `NextResponse`).
2. Trả về object dạng Web `Headers` — dùng `get()`, `has()`, `forEach()`.
3. Gọi `headers()` làm route thành **dynamic** — headers là per-request, không thể prerender static.

Use case phổ biến:
- `user-agent` — detect bot/mobile để render khác.
- `authorization` — đọc Bearer token (thường gặp khi BFF nhận token từ gateway).
- Geo/IP headers từ proxy: `x-forwarded-for`, `x-vercel-ip-country` (Vercel), `cf-ipcountry` (Cloudflare).
- `referer`, `accept-language` — i18n, analytics.

Pitfall:
- Headers như `x-forwarded-for` do proxy thêm vào — client có thể spoof nếu hạ tầng không strip; chỉ tin khi đứng sau proxy mình kiểm soát.
- Đừng vô tình thêm `headers()` vào page muốn giữ static — sẽ âm thầm mất prerender. Có thể khai báo `export const dynamic = "force-static"` để bị báo lỗi sớm khi ai đó lỡ thêm dynamic API.

### Code minh hoạ

```typescript
// app/page.tsx — Server Component
import { headers } from "next/headers";

export default async function Page() {
  const headerList = await headers(); // Next 15: PHẢI await

  // Đọc các header phổ biến
  const userAgent = headerList.get("user-agent") ?? "";
  const authorization = headerList.get("authorization"); // "Bearer xxx"
  const acceptLanguage = headerList.get("accept-language");

  // Geo headers từ hosting/proxy (Vercel, Cloudflare)
  const country = headerList.get("x-vercel-ip-country") ?? "VN";
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();

  // Lưu ý: dùng headers() → page này thành dynamic, render mỗi request
  const isMobile = /Mobile|Android|iPhone/i.test(userAgent);

  return isMobile ? <MobileLayout country={country} /> : <DesktopLayout country={country} />;
}

// ❌ headers() là read-only — không set được
export default async function BadPage() {
  const headerList = await headers();
  // headerList.set("x-custom", "value"); // Không tồn tại method set!
  return <div>...</div>;
}

// ✅ Set response header → dùng middleware hoặc Route Handler
// middleware.ts
import { NextResponse } from "next/server";

export function middleware() {
  const response = NextResponse.next();
  response.headers.set("x-request-id", crypto.randomUUID());
  return response;
}

// Pattern: verify Bearer token trong Server Component
import { headers } from "next/headers";
import { redirect } from "next/navigation";

async function getAuthenticatedUser() {
  const headerList = await headers();
  const auth = headerList.get("authorization");

  if (!auth?.startsWith("Bearer ")) {
    redirect("/signin");
  }
  return verifyToken(auth.slice("Bearer ".length));
}

export default async function ProtectedPage() {
  const user = await getAuthenticatedUser();
  return <Profile user={user} />;
}
```

### Đáp án mẫu

> "Em dùng `headers()` từ `next/headers` — Next 15 là async API nên phải `await headers()`. Nó trả về object Web Headers read-only, em dùng `get()` để đọc `user-agent`, `authorization`, `accept-language`, hay geo header như `x-vercel-ip-country`. Read-only nghĩa là chỉ đọc request header — muốn set response header thì phải dùng middleware hoặc Route Handler. Điều quan trọng cần nhớ: gọi `headers()` làm route thành dynamic, render mỗi request và mất static cache, vì header là per-request không thể prerender. Nên em chỉ dùng khi thật sự cần — ví dụ detect bot, đọc Bearer token, hay lấy country để hiển thị nội dung theo vùng. Với header như `x-forwarded-for`, em chỉ tin khi app đứng sau proxy mình kiểm soát vì client có thể spoof."

---

## Câu 37: redirect() và permanentRedirect() khác nhau thế nào? `[Intermediate]`

### Câu hỏi

> `redirect()` và `permanentRedirect()` trong `next/navigation` khác nhau ở điểm gì? Tại sao không được đặt `redirect()` trong `try/catch`?

### Giải thích lý thuyết

Khác biệt cốt lõi là **HTTP status code** và **ý nghĩa với SEO/caching**:

| Tiêu chí           | `redirect()`                          | `permanentRedirect()`                    |
| ------------------ | ------------------------------------- | ---------------------------------------- |
| Status code        | **307** Temporary Redirect            | **308** Permanent Redirect               |
| Ý nghĩa            | Chuyển hướng tạm thời                 | URL đã đổi vĩnh viễn                     |
| SEO                | Search engine giữ index URL cũ        | Search engine chuyển index + ranking sang URL mới |
| Browser/CDN cache  | Không cache redirect                  | Có thể cache lâu dài                     |
| Use case           | Auth redirect, sau mutation, A/B      | Đổi slug, đổi domain, restructure URL    |

(307/308 thay vì 302/301 vì chúng **giữ nguyên HTTP method** — POST vẫn là POST sau redirect, quan trọng với form submission.)

**Cơ chế hoạt động — điểm bẫy kinh điển**: `redirect()` hoạt động bằng cách **throw một error đặc biệt** (`NEXT_REDIRECT`). Next.js bắt error này ở framework level và thực hiện chuyển hướng. Hệ quả:

1. Code sau `redirect()` **không bao giờ chạy** — không cần `return redirect(...)` (dù return cũng không sao, giúp TypeScript hiểu flow).
2. **KHÔNG đặt `redirect()` trong `try/catch` bao quát** — `catch (error)` sẽ "nuốt" mất error `NEXT_REDIRECT` và redirect không xảy ra. Nếu buộc phải dùng try/catch, gọi `redirect()` **sau** khối try/catch, hoặc re-throw khi `isRedirectError(error)`.

Nơi gọi được: **Server Component, Server Action, Route Handler**. Trong Client Component chỉ gọi được trong quá trình render (ít dùng) — event handler nên dùng `useRouter().push()`.

Lưu ý: vì permanent redirect bị browser cache rất lâu, cấu hình sai 308 khó "rút lại" — chỉ dùng khi chắc chắn URL đổi vĩnh viễn.

### Code minh hoạ

```typescript
// app/profile/page.tsx — redirect trong Server Component
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/signin"); // 307 — tạm thời, không cần return
  }

  // TypeScript hiểu session non-null ở đây (redirect return type là never)
  return <Profile user={session.user} />;
}

// permanentRedirect — khi URL đổi vĩnh viễn
// app/blog/[oldSlug]/page.tsx
import { permanentRedirect } from "next/navigation";

export default async function OldPost({
  params,
}: {
  params: Promise<{ oldSlug: string }>;
}) {
  const { oldSlug } = await params;
  const post = await db.post.findUnique({ where: { oldSlug } });

  if (post?.newSlug) {
    permanentRedirect(`/articles/${post.newSlug}`); // 308 — SEO chuyển sang URL mới
  }
  // ...
}

// ❌ BẪY KINH ĐIỂN: redirect trong try/catch
"use server";
import { redirect } from "next/navigation";

export async function badAction(formData: FormData) {
  try {
    await db.order.create({ data: parse(formData) });
    redirect("/orders"); // throw NEXT_REDIRECT...
  } catch (error) {
    // ...bị catch nuốt mất ở đây → KHÔNG redirect, lại còn log nhầm là lỗi!
    console.error("Tạo order thất bại:", error);
    return { success: false };
  }
}

// ✅ ĐÚNG: redirect nằm NGOÀI try/catch
export async function goodAction(formData: FormData) {
  let orderId: string;
  try {
    const order = await db.order.create({ data: parse(formData) });
    orderId = order.id;
  } catch (error) {
    console.error("Tạo order thất bại:", error);
    return { success: false, message: "Không tạo được order" };
  }

  redirect(`/orders/${orderId}`); // ngoài try/catch — chạy đúng
}

// ✅ Hoặc re-throw redirect error nếu buộc phải try/catch rộng
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function alternativeAction(formData: FormData) {
  try {
    await processAndRedirect(formData);
  } catch (error) {
    if (isRedirectError(error)) throw error; // trả error redirect về cho Next xử lý
    return { success: false };
  }
}
```

### Đáp án mẫu

> "Khác nhau chính là status code và ý nghĩa SEO: `redirect()` trả 307 — chuyển hướng tạm thời, search engine giữ index URL cũ; `permanentRedirect()` trả 308 — vĩnh viễn, search engine chuyển index và ranking sang URL mới, browser cache redirect lâu dài. Next dùng 307/308 thay vì 302/301 vì chúng giữ nguyên HTTP method sau redirect. Em dùng `redirect` cho auth flow và sau mutation, `permanentRedirect` khi đổi slug hay restructure URL — và phải chắc chắn vì 308 bị cache, khó rút lại. Điểm bẫy quan trọng: `redirect()` hoạt động bằng cách throw error `NEXT_REDIRECT` để Next bắt ở framework level — nên tuyệt đối không đặt trong try/catch, vì catch sẽ nuốt mất error và redirect không xảy ra. Em luôn gọi redirect sau khối try/catch. Nó gọi được trong Server Component, Server Action và Route Handler."

---

## Câu 50: useFormStatus và useActionState — và tại sao useFormStatus phải nằm trong component con? `[Advanced]`

### Câu hỏi

> `useFormStatus` và `useActionState` dùng để làm gì? Em đặt `useFormStatus` ngay trong component chứa `<form>` thì `pending` luôn là `false` — vì sao, và fix thế nào?

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

> Server Actions trông như function nội bộ — chỉ cần import và gọi. Vậy về security có gì phải lo? Hãy liệt kê các lớp bảo vệ em sẽ áp dụng.

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

> Next.js có chống CSRF sẵn cho Server Actions không? Cơ chế cụ thể là gì? Và những gì framework KHÔNG lo giùm mà em phải tự làm?

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
| "Server Actions thay thế hoàn toàn API Routes"                | RPC nội bộ cho mutation; public API/webhook/SSE vẫn cần Route Handler    |
| "cookies()/headers() gọi sync như Next 14"                    | Next 15 là async — phải `await`                                          |
| "Set cookie ở đâu cũng được"                                  | Chỉ trong Server Action hoặc Route Handler — response đã stream          |
| "Đặt redirect() trong try/catch cho an toàn"                  | redirect() throw NEXT_REDIRECT — catch sẽ nuốt mất, không redirect       |
| "useFormStatus gọi cùng component chứa form"                  | Phải nằm trong component CON bên trong form — đọc qua context của form cha |
| "Server Action là function nội bộ nên an toàn"                | Là PUBLIC endpoint — phải auth/authz/validate trong từng action          |
| "Next chống CSRF rồi nên khỏi lo bảo mật"                     | CSRF chỉ là 1 threat model — vẫn phải tự lo authz, validation, rate limit |
