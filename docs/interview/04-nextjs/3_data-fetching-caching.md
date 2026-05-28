---
sidebar_position: 3
title: "3. Data Fetching & Caching Strategy"
---

# Data Fetching & Caching Strategy

> *Caching trong Next.js là phần khó nhất, đồng thời là phần làm hệ thống chạy nhanh nhất nếu hiểu đúng.*

---

## Câu 1: `fetch` trong Next.js có gì khác `fetch` browser? `[Intermediate]`

### Câu hỏi

> Em viết `await fetch("https://api.example.com")` trong Server Component. Có gì khác với `fetch` thường?

### Giải thích lý thuyết

Next.js extend native `fetch`:

1. **Auto memoization** — trong 1 render, cùng URL + options chỉ chạy 1 lần (deduplication).
2. **Data Cache** — response cache persistent qua các request (default behavior thay đổi giữa các version).
3. **Cache options** qua `next` object:
   - `revalidate: number` — ISR.
   - `tags: string[]` — tag-based invalidation.
4. **Cache options** chuẩn:
   - `cache: 'force-cache' | 'no-store'`.

### Code minh hoạ

```typescript
// 1. Memoization tự động trong 1 render
async function Page() {
  const [a, b] = await Promise.all([
    fetch("/api/data").then(r => r.json()),
    fetch("/api/data").then(r => r.json()), // Chỉ 1 request thực sự
  ]);
}

// 2. Cache forever (legacy default)
const data = await fetch(url);

// Next 15 đổi default: không cache trừ khi opt-in
const dataNext15 = await fetch(url, { cache: "force-cache" });

// 3. ISR — cache với revalidate
const products = await fetch(url, {
  next: { revalidate: 3600 }, // 1 hour
});

// 4. Tag-based
const post = await fetch(`/api/posts/${id}`, {
  next: { tags: ["posts", `post-${id}`] },
});

// Invalidate
import { revalidateTag } from "next/cache";
revalidateTag("posts");           // toàn bộ posts
revalidateTag(`post-${id}`);      // chỉ 1 post

// 5. Không cache
const userStats = await fetch(url, { cache: "no-store" });
// Tương đương: dynamic = "force-dynamic" cho route

// Combine với React cache cho non-fetch operations
import { cache } from "react";

const getUser = cache(async (id: string) => {
  return db.user.findUnique({ where: { id } });
});

async function ProfilePage({ params }) {
  const u = await getUser(params.id);  // memoize trong render
  return <Profile user={u} />;
}

async function Sidebar({ userId }) {
  const u = await getUser(userId);     // hit memo, không query DB lại
  return <UserCard user={u} />;
}
```

### Đáp án mẫu

> "Next.js extend `fetch` với 3 thứ chính. Thứ nhất, **auto-memoization**: trong 1 render request, fetch cùng URL chỉ chạy 1 lần — em không cần lift fetch lên parent để share, gọi ở component nào tiện thì gọi. Thứ hai, **Data Cache** persistent qua request — fetch cache vào server cache (Next 14 default), revalidate qua `next.revalidate` (ISR) hoặc invalidate qua `next.tags` + `revalidateTag`. Thứ ba, **cache options**: `cache: 'no-store'` opt-out hoàn toàn (SSR mỗi request), `force-cache` opt-in mãi mãi. Next 15 đổi default — không cache nếu không khai báo, để tránh accidental staleness. Cho operation không phải fetch (DB query qua Prisma), em dùng `cache()` của React để memoize trong 1 render — pattern tương tự `fetch` dedupe."

---

## Câu 2: Khi nào nên dùng API Route (Route Handler) vs trực tiếp fetch trong Server Component `[Intermediate]`

### Câu hỏi

> Em có data từ DB. Em có nên viết Route Handler `/api/users` rồi fetch trong Server Component, hay query thẳng `prisma.user.findMany()` trong Server Component?

### Giải thích lý thuyết

Câu trả lời ngắn: **query thẳng trong Server Component** trong hầu hết trường hợp.

Lý do:
- Tránh **thêm 1 network hop** không cần thiết.
- Type-safe end-to-end (return type của Prisma trực tiếp).
- Ít boilerplate (không phải viết route + serialize JSON + parse).

Cần Route Handler khi:
- Endpoint public cho **external client** (mobile, third-party).
- Cần serve cho **client component** (TanStack Query, SWR).
- Streaming response (SSE, WebSocket-like).
- Webhook receiver.

### Code minh hoạ

```typescript
// ❌ Anti-pattern: tạo route trung gian không cần thiết
// app/api/users/route.ts
export async function GET() {
  const users = await prisma.user.findMany();
  return Response.json(users);
}

// app/users/page.tsx
async function Page() {
  const res = await fetch("http://localhost:3000/api/users"); // network hop thừa
  const users = await res.json();
  return <UserList users={users} />;
}

// ✅ Đúng: query thẳng
// app/users/page.tsx
async function Page() {
  const users = await prisma.user.findMany(); // type-safe, không hop
  return <UserList users={users} />;
}

// Tách logic ra service layer để reuse
// lib/services/users.ts
import { cache } from "react";

export const getUsers = cache(async () => {
  return prisma.user.findMany();
});

// Dùng cả trong Server Component và Route Handler nếu cần
async function Page() {
  const users = await getUsers();
  return <UserList users={users} />;
}

// app/api/users/route.ts — chỉ tạo nếu cần expose
export async function GET() {
  const users = await getUsers();
  return Response.json(users);
}

// Khi NÊN có Route Handler:
// 1. Webhook
// app/api/webhook/stripe/route.ts
export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const event = stripe.webhooks.constructEvent(await req.text(), sig, secret);
  // process event
}

// 2. Client component cần fetch (polling, lazy load)
"use client";
function LiveStats() {
  const { data } = useQuery({
    queryKey: ["stats"],
    queryFn: () => fetch("/api/stats").then(r => r.json()),
    refetchInterval: 5000,
  });
}
// app/api/stats/route.ts — cần endpoint cho client query

// 3. External consumer
// app/api/v1/products/route.ts — mobile app gọi

// 4. Streaming SSE
// app/api/chat/route.ts
export async function POST(req: Request) {
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of llmStream()) {
        controller.enqueue(new TextEncoder().encode(chunk));
      }
      controller.close();
    },
  });
  return new Response(stream);
}
```

### Đáp án mẫu

> "Mặc định query thẳng trong Server Component — không tạo Route Handler trung gian. Lý do: thêm route giữa = thêm network hop, mất type-safe, thêm boilerplate. Em chỉ tạo Route Handler khi: **webhook** từ external (Stripe, GitHub); **client component cần fetch** (polling, lazy load với TanStack Query); **API public** cho mobile/third-party consume; hoặc **streaming response** (SSE cho LLM chat). Để reuse logic giữa server và client, em tách function vào `lib/services/` rồi dùng `cache()` để dedupe — có thể gọi từ cả Server Component lẫn Route Handler. Quy tắc của em: nếu chỉ Next.js dùng → query thẳng; có client external dùng → tạo endpoint. Tránh 'cargo cult' tạo route cho mọi data fetch như thời Pages Router."

---

## Câu 3: Cache invalidation strategy — thực tế phức tạp `[Senior]`

### Câu hỏi

> Em có blog. Post được edit qua admin panel. Em làm sao để user reader thấy update ngay lập tức nhưng vẫn tận dụng cache?

### Giải thích lý thuyết

3 chiến lược:

1. **Time-based (ISR)** — `revalidate: N`. Đơn giản nhưng stale tối đa N giây.
2. **On-demand (revalidatePath/Tag)** — invalidate ngay khi data đổi. Cần điểm trigger (webhook, mutation).
3. **Combine** — `revalidate: 3600` (fallback) + on-demand (instant update).

Pattern thực tế:
- Admin edit post → server action update DB → `revalidateTag('post-' + id)` → user thấy update trong vòng giây.
- ISR `revalidate: 3600` làm safety net nếu webhook miss.

### Code minh hoạ

```typescript
// 1. Fetch với tag
// app/posts/[slug]/page.tsx
export default async function Post({ params }) {
  const post = await fetch(`https://api.../posts/${params.slug}`, {
    next: {
      tags: [`post-${params.slug}`, "posts"],
      revalidate: 3600, // safety net
    },
  }).then((r) => r.json());

  return <Article post={post} />;
}

// 2. Server Action — invalidate khi edit
// app/admin/posts/[slug]/edit/page.tsx
"use server";

import { revalidateTag, revalidatePath } from "next/cache";

async function updatePost(slug: string, formData: FormData) {
  await db.post.update({
    where: { slug },
    data: { title: formData.get("title") as string },
  });

  // Invalidate cụ thể
  revalidateTag(`post-${slug}`);

  // Hoặc invalidate broader
  revalidateTag("posts");  // tất cả list post

  // Hoặc path-based
  revalidatePath(`/posts/${slug}`);
  revalidatePath("/posts"); // list
}

// 3. Webhook từ external CMS
// app/api/webhook/revalidate/route.ts
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const secret = req.headers.get("x-webhook-secret");
  if (secret !== process.env.WEBHOOK_SECRET) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { type, slug } = await req.json();
  switch (type) {
    case "post.updated":
      revalidateTag(`post-${slug}`);
      revalidateTag("posts");
      break;
    case "post.deleted":
      revalidatePath(`/posts/${slug}`);
      revalidatePath("/posts");
      break;
  }
  return NextResponse.json({ revalidated: true });
}

// 4. Pattern hybrid: cache + stale-while-revalidate + on-demand
// fetch với revalidate=3600 → background refresh max 1h
// + webhook revalidateTag khi data đổi → instant update
// Best of both: free reads (cache hit), fresh data
```

### Đáp án mẫu

> "Em dùng pattern hybrid: **tag-based fetch + on-demand revalidation + ISR safety net**. Khi fetch post, em gắn tag `post-{slug}` và `posts` với `revalidate: 3600` (1 giờ fallback). Khi admin edit post qua Server Action, sau khi update DB em gọi `revalidateTag('post-{slug}')` cho page detail và `revalidateTag('posts')` cho list — user thấy update gần như instant. Nếu CMS external (Sanity, Strapi), em set webhook trỏ về `/api/webhook/revalidate` với secret check — same effect. ISR `revalidate: 3600` là safety net phòng khi webhook miss (network issue, redeploy). Lợi: read là cache hit hầu hết time (free, fast), write có instant invalidation, fail-safe nếu webhook fail. Trade-off: code phức tạp hơn, cần maintain tag consistency — em document tag naming convention trong codebase."

---

## Câu 4: `searchParams` vs `useSearchParams` — server vs client `[Intermediate]`

### Câu hỏi

> Em có URL `/products?category=phone&page=2`. Làm sao để đọc params trong Server Component và Client Component? Có gì khác?

### Giải thích lý thuyết

| Hook/Prop                | Dùng ở             | Đặc tính                                |
| ------------------------ | ------------------ | --------------------------------------- |
| `searchParams` prop      | Server Component   | Sync — pass vào page như prop           |
| `useSearchParams()`      | Client Component    | Hook — re-run khi URL đổi               |
| `params` prop            | Server (dynamic route) | Dynamic segments của route           |
| `useParams()`            | Client              | Dynamic segments                        |

Server component nhận `searchParams` async (Next 15+).

### Code minh hoạ

```typescript
// Server Component
// app/products/page.tsx
export default async function Products({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const params = await searchParams; // Next 15: phải await
  const category = params.category;
  const page = parseInt(params.page ?? "1");

  const products = await fetchProducts({ category, page });
  return <ProductList products={products} />;
}

// Client Component
"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  const handleChange = (newCategory: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("category", newCategory);
    params.delete("page"); // reset page
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <select value={category ?? ""} onChange={(e) => handleChange(e.target.value)}>
      <option value="phone">Phone</option>
      <option value="laptop">Laptop</option>
    </select>
  );
}

// Dynamic route params
// app/blog/[slug]/page.tsx
export default async function Post({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // ...
}

// Client
"use client";
import { useParams } from "next/navigation";
function BlogClient() {
  const params = useParams();
  return <div>{params.slug}</div>;
}

// Type-safe search params với Zod
import { z } from "zod";

const searchSchema = z.object({
  category: z.enum(["phone", "laptop"]).optional(),
  page: z.coerce.number().int().positive().default(1),
});

export default async function Products({ searchParams }) {
  const parsed = searchSchema.safeParse(await searchParams);
  if (!parsed.success) return <Error400 />;
  // parsed.data.category type là 'phone' | 'laptop' | undefined
  // parsed.data.page type là number
}

// Lib: nuqs cho type-safe search params với hook
import { useQueryState } from "nuqs";

function FilterClient() {
  const [category, setCategory] = useQueryState("category");
  return ...;
}
```

### Đáp án mẫu

> "Server Component nhận `searchParams` qua prop (Next 15 là Promise, phải `await`). Client Component dùng `useSearchParams()` hook — auto re-run khi URL đổi. Em dùng server-side khi: initial render cần data dựa trên params (SSR with filter); SEO quan trọng (category page có meta khác nhau). Client-side khi: interactive filter, update URL on user action. Pattern thực tế: server đọc params để fetch initial data; client component dùng `useRouter().push()` cập nhật URL khi user filter, server re-render với params mới. Em validate params với Zod ở server — params từ URL là untrusted input, không trust. Lib `nuqs` em hay dùng cho client — type-safe API, sync URL với React state, đỡ tự viết `URLSearchParams` boilerplate."

---

## Câu 5: Race condition trong data fetching `[Senior]`

### Câu hỏi

> User gõ vào search box. Em fetch API mỗi keystroke (debounced). Vẫn có thể gặp race condition. Vì sao và cách fix?

### Giải thích lý thuyết

Race condition: response 1 (chậm) có thể về sau response 2 (nhanh) → overwrite kết quả mới bằng kết quả cũ.

Pattern fix:

1. **AbortController** — cancel request cũ khi có request mới.
2. **Sequence check** — gắn ID/timestamp request, ignore response không phải mới nhất.
3. **TanStack Query** — dedupe + cancel built-in.

### Code minh hoạ

```javascript
// ❌ Race condition
function BadSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query) return;
    fetch(`/api/search?q=${query}`)
      .then((r) => r.json())
      .then(setResults);
  }, [query]);
  // User gõ "a" → fetch /search?q=a (slow, 2s)
  // User gõ "ab" → fetch /search?q=ab (fast, 100ms)
  // response "ab" về trước → set results
  // response "a" về sau → set results = a results ❌
}

// ✅ Fix 1: AbortController
function GoodSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query) return;
    const controller = new AbortController();

    fetch(`/api/search?q=${query}`, { signal: controller.signal })
      .then((r) => r.json())
      .then(setResults)
      .catch((err) => {
        if (err.name === "AbortError") return; // expected
        console.error(err);
      });

    return () => controller.abort();
  }, [query]);
}

// ✅ Fix 2: Sequence ID
function SeqSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const seqRef = useRef(0);

  useEffect(() => {
    if (!query) return;
    const mySeq = ++seqRef.current;

    fetch(`/api/search?q=${query}`)
      .then((r) => r.json())
      .then((data) => {
        if (mySeq === seqRef.current) {
          setResults(data); // chỉ apply nếu là response mới nhất
        }
      });
  }, [query]);
}

// ✅ Fix 3: TanStack Query (recommended)
function QuerySearch() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const { data: results = [] } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: ({ signal }) =>
      fetch(`/api/search?q=${debouncedQuery}`, { signal }).then((r) => r.json()),
    enabled: !!debouncedQuery,
  });
  // TanStack Query tự cancel request cũ + dedupe + cache
}

// Server-side: race condition khi 2 user update cùng resource
// Pattern: optimistic concurrency
async function updatePost(id, updates, expectedVersion) {
  const result = await db.post.update({
    where: { id, version: expectedVersion }, // chỉ update nếu version match
    data: { ...updates, version: { increment: 1 } },
  });
  if (!result) throw new ConflictError("Post was modified by another user");
}
```

### Đáp án mẫu

> "Race condition xảy ra khi response chậm về sau response nhanh và overwrite. Em fix bằng 3 cách tuỳ ngữ cảnh. Đơn giản nhất: **AbortController** — cleanup function của useEffect call `controller.abort()`, request cũ tự cancel khi user gõ tiếp. Cách thứ hai: **sequence ID** — mỗi request có ID tăng dần, response check ID match nhất mới apply. Cách tốt nhất production: **TanStack Query** — pass `signal` từ queryFn, library tự handle cancel + dedupe + cache. Em hầu như không tự viết debounce + fetch nữa — TanStack Query + `useDebounce` (cho query key) là đủ. Một detail: AbortError nên filter khỏi error log — nó là behavior mong muốn, không phải bug. Race condition server-side cũng có (2 user update cùng record) — fix bằng optimistic concurrency với version column."

---

## Câu 6: Cookies, headers, cấu hình dynamic `[Senior]`

### Câu hỏi

> Em đọc cookie trong Server Component để check user. Đột nhiên page chuyển sang dynamic (không cache). Giải thích.

### Giải thích lý thuyết

Next.js inferred static/dynamic dựa trên API dùng trong render:

- Dùng `cookies()`, `headers()`, `searchParams`, `cache: 'no-store'` fetch → **dynamic**.
- Không dùng cái nào → **static**, có thể prerender.

Lý do: cookies/headers per-request → không thể prerender 1 HTML cho mọi user.

Cách handle:
- Explicit `export const dynamic = "force-dynamic"` để rõ ý.
- Hoặc đẩy logic dùng cookie xuống Client Component, page vẫn static.
- Hoặc dùng middleware cho check auth, page vẫn static.

### Code minh hoạ

```typescript
// app/dashboard/page.tsx
import { cookies } from "next/headers";

export default async function Dashboard() {
  const cookieStore = await cookies(); // dynamic API
  const token = cookieStore.get("session")?.value;

  // Page giờ là dynamic, render mỗi request, không cache
  const user = await fetchUser(token);
  return <DashboardView user={user} />;
}

// Tương tự với headers
import { headers } from "next/headers";

export default async function Page() {
  const h = await headers();
  const userAgent = h.get("user-agent");
  // dynamic
}

// Explicit khai báo
export const dynamic = "force-dynamic"; // chắc chắn dynamic
export const dynamic = "force-static";  // chắc chắn static (fail nếu dùng dynamic API)
export const dynamic = "error";          // throw nếu cố làm dynamic
export const dynamic = "auto";           // mặc định (infer)

// Pattern: tách dynamic logic ra component nhỏ
// app/page.tsx — giữ static
export default function Page() {
  return (
    <>
      <Header />  {/* static */}
      <Suspense fallback={<UserSkeleton />}>
        <UserSection /> {/* dynamic, stream */}
      </Suspense>
    </>
  );
}

async function UserSection() {
  const cookieStore = await cookies();
  const user = await fetchUser(cookieStore.get("session")?.value);
  return <UserInfo user={user} />;
}
// Page vẫn cache shell static; chỉ UserSection dynamic

// Auth pattern phổ biến
// middleware.ts
export function middleware(req) {
  const token = req.cookies.get("session");
  if (!token && req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }
}
// Page static, middleware handle auth redirect → có thể tận dụng cache

// Set cookie từ Server Action
"use server";
import { cookies } from "next/headers";

async function login(formData: FormData) {
  const { token } = await api.login(...);
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}
```

### Đáp án mẫu

> "Next.js infer page là static hay dynamic dựa trên API sử dụng. `cookies()`, `headers()`, `searchParams` async, hoặc `cache: 'no-store'` fetch → page **dynamic**, render mỗi request, không cache. Đây là design có lý: cookie per-user, không thể prerender 1 HTML cho mọi user. Pattern em dùng để **giữ phần lớn page static**: đẩy logic đọc cookie xuống component nhỏ wrap Suspense — shell static cache CDN, chỉ user-specific section dynamic và stream vào. Hoặc dùng middleware cho check auth — page vẫn static, middleware redirect signin nếu chưa login. Em explicit `export const dynamic = 'force-static'` cho page nhất định không được dynamic (catch bug khi vô tình thêm cookies()). Set cookie qua Server Action với httpOnly + secure + sameSite — security best practice."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                                | Đúng là                                                              |
| ------------------------------------------------------ | -------------------------------------------------------------------- |
| "Fetch trong Next giống fetch browser"                 | Next extend với memoization, Data Cache, tags                        |
| "Tạo Route Handler cho mọi data fetch"                 | Query thẳng trong Server Component nếu chỉ Next dùng                 |
| "ISR đủ cho mọi case stale data"                       | Cần on-demand revalidation để update instant                         |
| "Cookies không ảnh hưởng cache"                        | Đọc cookie → page tự thành dynamic, mất cache                        |
| "Race condition không xảy ra với React"                | Vẫn có nếu không cancel/sequence; TanStack Query handle giùm         |
