---
sidebar_position: 3
title: "3. Server & Client Components"
---

# Server & Client Components

> *Server Components là thay đổi lớn nhất của React trong 10 năm qua, và App Router xây toàn bộ trên nền tảng này. Hiểu sai ranh giới server/client là lỗi phổ biến nhất khi phỏng vấn Next.js hiện đại.*

---

## Câu 3: 'use client' directive dùng khi nào? `[Basic]`

### Câu hỏi

> Directive `'use client'` để làm gì? Khi nào em cần thêm nó vào file, và đặt nó ở đâu là hợp lý?

### Giải thích lý thuyết

`'use client'` **không phải** là "render component này ở client" — nó là **marker đánh dấu ranh giới (boundary) giữa server bundle và client bundle**. Mọi thứ phía sau boundary này (bao gồm cả các module được import) sẽ được đưa vào client bundle và hydrate ở browser.

Cần `'use client'` khi component dùng:

1. **Hooks có state/lifecycle**: `useState`, `useEffect`, `useReducer`, `useContext`...
2. **Event handlers**: `onClick`, `onChange`, `onSubmit`...
3. **Browser API**: `window`, `localStorage`, `IntersectionObserver`...
4. **Third-party lib dùng hooks** (chart, animation, form lib...).

Hai quy tắc quan trọng hay bị hỏi xoáy:

- **Directive áp dụng cho cả import subtree**: file có `'use client'` thì mọi component nó import cũng trở thành client component — **không cần lặp lại** `'use client'` ở các file con.
- **Đặt boundary càng sâu (càng lá) càng tốt**: nếu đặt `'use client'` ở layout/page cấp cao, toàn bộ cây con bị kéo vào client bundle. Pattern đúng: tách phần interactive thành component nhỏ, chỉ đánh dấu component đó.

**Pitfall**: nhiều người thêm `'use client'` "cho chắc" vào mọi file → mất hết lợi ích zero-bundle của Server Components.

### Code minh hoạ

```tsx
// ❌ SAI: đánh dấu cả page là client chỉ vì 1 nút bấm
// app/products/page.tsx
"use client"; // toàn bộ page + mọi import vào client bundle!

import { useState } from "react";

export default function ProductsPage() {
  const [liked, setLiked] = useState(false);
  // ... 500 dòng UI tĩnh cũng bị ship JS xuống client
}

// ✅ ĐÚNG: page vẫn là Server Component, tách phần interactive ra
// app/products/page.tsx (Server Component — mặc định, không cần directive)
import { LikeButton } from "./LikeButton";

export default async function ProductsPage() {
  const products = await fetchProducts(); // fetch trực tiếp trên server
  return (
    <main>
      {products.map((p) => (
        <article key={p.id}>
          <h2>{p.name}</h2>          {/* phần tĩnh — zero JS */}
          <LikeButton id={p.id} />   {/* chỉ phần này là client */}
        </article>
      ))}
    </main>
  );
}

// app/products/LikeButton.tsx
"use client"; // boundary đặt ở component lá — đúng chỗ

import { useState } from "react";

export function LikeButton({ id }: { id: string }) {
  const [liked, setLiked] = useState(false);
  return (
    <button onClick={() => setLiked(!liked)}>
      {liked ? "Đã thích" : "Thích"}
    </button>
  );
}

// Lưu ý: component được LikeButton import KHÔNG cần 'use client' nữa
// app/products/HeartIcon.tsx — tự động thuộc client bundle khi LikeButton import nó
export function HeartIcon() {
  return <svg>{/* ... */}</svg>;
}
```

### Đáp án mẫu

> "Em hiểu `'use client'` là directive đánh dấu **ranh giới giữa server bundle và client bundle**, chứ không phải lệnh 'chỉ render ở client'. Em thêm nó khi component cần interactivity: hooks như `useState`/`useEffect`, event handler như `onClick`, browser API như `localStorage`, hoặc third-party lib dùng hooks. Điểm quan trọng là directive áp dụng cho **cả import subtree** — file con được client component import sẽ tự động vào client bundle, không cần lặp lại directive. Vì vậy nguyên tắc của em là đặt boundary **càng sâu càng tốt**: thay vì đánh dấu cả page, em tách phần interactive thành component nhỏ rồi chỉ đánh dấu component đó. Như vậy phần còn lại vẫn là Server Component, không ship JS thừa xuống client — đây cũng là một trong những cách giảm bundle size hiệu quả nhất trong App Router."

---

## Câu 4: Server-only và client-only packages là gì? `[Intermediate]`

### Câu hỏi

> Package `server-only` và `client-only` trong Next.js dùng để làm gì? Tại sao nên dùng chúng cho data-access layer?

### Giải thích lý thuyết

Vì ranh giới server/client trong App Router chỉ là một directive, rất dễ xảy ra tình huống: một module chứa **secret hoặc DB code** vô tình bị import vào Client Component → code (và có thể cả secret) **leak vào client bundle**.

Hai package "rỗng" (chỉ là marker) giải quyết việc này ở **build time**:

| Package       | Ý nghĩa                                  | Khi import sai môi trường       |
| ------------- | ---------------------------------------- | -------------------------------- |
| `server-only` | Module này CHỈ được chạy trên server     | Client Component import → **build-time error** |
| `client-only` | Module này CHỈ được chạy trên client     | Server Component import → **build-time error** |

Cơ chế: hai package này khai báo `exports` với điều kiện môi trường trong `package.json` — khi bundler resolve sai môi trường sẽ ném lỗi ngay lúc build, **fail fast** thay vì âm thầm leak.

Use case điển hình:

- `server-only`: data-access layer (query DB, đọc `process.env.DB_PASSWORD`), API client dùng secret key.
- `client-only`: module đụng `window`/`localStorage` ngay khi import (top-level), tránh crash khi server render.

**Pitfall**: nhiều người nghĩ "env var không có `NEXT_PUBLIC_` thì tự an toàn" — đúng là giá trị không được inline, nhưng **logic code vẫn có thể bị bundle vào client** và lộ cấu trúc query, endpoint nội bộ. `server-only` chặn triệt để từ gốc.

### Code minh hoạ

```tsx
// Cài đặt: npm install server-only client-only

// lib/data/users.ts — data-access layer, tuyệt đối không được vào client
import "server-only"; // dòng đầu tiên của file

import { db } from "@/lib/db";

export async function getUserWithSecrets(id: string) {
  // Code này đụng DB connection string, secret...
  // Nếu Client Component nào import file này → BUILD FAIL ngay
  return db.user.findUnique({ where: { id } });
}

// app/profile/page.tsx — Server Component: import OK
import { getUserWithSecrets } from "@/lib/data/users";

export default async function ProfilePage() {
  const user = await getUserWithSecrets("123");
  return <h1>{user.name}</h1>;
}

// components/UserCard.tsx — Client Component: import sẽ LỖI BUILD
"use client";
// ❌ Error: You're importing a component that needs "server-only".
// import { getUserWithSecrets } from "@/lib/data/users";

// ---

// lib/storage.ts — module chỉ chạy được ở browser
import "client-only";

// Top-level access window — server import là crash, client-only chặn từ build
export function getTheme(): string {
  return window.localStorage.getItem("theme") ?? "light";
}
```

### Đáp án mẫu

> "Đây là hai package marker để **enforce ranh giới môi trường ở build time**. Em import `'server-only'` ở đầu các file thuộc data-access layer — chỗ query DB, dùng secret key. Nếu sau này có ai vô tình import file đó vào một Client Component, build sẽ fail ngay với error rõ ràng, thay vì âm thầm leak code và secret vào client bundle. Ngược lại `'client-only'` dùng cho module đụng `window` hay `localStorage` ngay top-level — Server Component import nhầm là lỗi build luôn chứ không đợi crash runtime. Em thấy đây là pattern bắt buộc cho team đông người: ranh giới server/client trong App Router rất dễ vô tình vi phạm khi refactor, nên fail fast lúc build an toàn hơn nhiều so với trông chờ code review. Trong dự án thực tế, em đặt convention: mọi file trong `lib/data/` đều bắt đầu bằng `import 'server-only'`."

---

## Câu 17: Server Components là gì? `[Basic]`

### Câu hỏi

> React Server Components (RSC) là gì? Chúng khác gì so với component React truyền thống?

### Giải thích lý thuyết

**React Server Components** là component **chỉ render trên server** — kết quả render được gửi xuống client dưới dạng dữ liệu mô tả UI (RSC Payload), còn **code của component không bao giờ được gửi xuống browser**.

Đặc điểm cốt lõi:

1. **Zero JS xuống client**: component không nằm trong client bundle, không hydrate.
2. **`async/await` trực tiếp**: Server Component có thể là async function — `await fetch()`, `await db.query()` ngay trong thân component, không cần `useEffect` + state loading.
3. **Truy cập tài nguyên server trực tiếp**: DB, file system, secret env var — vì code chỉ chạy trên server.
4. **Mặc định trong App Router**: mọi component trong `app/` là Server Component trừ khi đánh dấu `'use client'`.

Những thứ Server Component **không làm được**:

- Không dùng `useState`, `useEffect` hay bất kỳ hook nào có state/lifecycle.
- Không gắn event handler (`onClick`...) — vì không có JS chạy ở browser.
- Không dùng browser API.

**Phân biệt quan trọng** (hay nhầm): RSC **không phải là SSR**. SSR render component thành HTML rồi vẫn ship JS xuống để hydrate; RSC render xong là xong — không ship JS, không hydrate. Hai cơ chế này hoạt động song song trong Next.js.

### Code minh hoạ

```tsx
// app/posts/[slug]/page.tsx
// Server Component — MẶC ĐỊNH trong App Router, không cần directive nào

import { db } from "@/lib/db"; // truy cập DB trực tiếp — an toàn vì chỉ chạy server

// Component là ASYNC FUNCTION — điều không thể với component truyền thống
export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>; // Next 15: params là Promise
}) {
  const { slug } = await params;

  // Fetch data trực tiếp trong component — không useEffect, không loading state thủ công
  const post = await db.post.findUnique({ where: { slug } });

  // Đọc secret thoải mái — không bao giờ leak vì code không xuống client
  const cdnUrl = process.env.PRIVATE_CDN_URL;

  if (!post) {
    return <p>Không tìm thấy bài viết</p>;
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <img src={`${cdnUrl}/${post.cover}`} alt={post.title} />
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
    </article>
  );
}

// ❌ Những thứ KHÔNG dùng được trong Server Component:
// useState(...)        → lỗi: hooks cần client
// onClick={...}        → lỗi: event handler không serialize được
// window.localStorage  → lỗi: không có browser API trên server
```

### Đáp án mẫu

> "Server Components là component **chỉ render trên server** — client nhận kết quả render dưới dạng RSC Payload, còn code của component **không bao giờ được ship xuống browser**, nên đóng góp zero JS vào client bundle. Trong App Router, mọi component mặc định là Server Component. Cái em thích nhất là viết được **async component**: `await` fetch hay query DB ngay trong thân component, không cần `useEffect` cộng loading state như trước. Vì code chỉ chạy server nên truy cập DB, file system, secret env var đều an toàn. Đổi lại, Server Component không có state, không có event handler, không đụng được browser API — những phần đó phải tách ra Client Component. Em cũng lưu ý RSC khác SSR: SSR render ra HTML nhưng vẫn ship JS để hydrate, còn RSC thì không ship JS và không hydrate — hai cơ chế bổ trợ nhau chứ không thay thế nhau."

---

## Câu 18: Lợi ích của Server Components là gì? `[Basic]`

### Câu hỏi

> Tại sao Next.js chọn Server Components làm mặc định? Liệt kê các lợi ích chính và giải thích.

### Giải thích lý thuyết

| Lợi ích | Giải thích |
| --- | --- |
| **Zero bundle JS** | Code component (kèm dependencies nặng như markdown parser, syntax highlighter, date lib) không vào client bundle → tải trang nhanh hơn, đặc biệt trên mobile/mạng yếu. |
| **Data fetching gần data source** | Fetch chạy trên server, cùng datacenter với DB/API → latency thấp, không waterfall client-server nhiều vòng. |
| **Bảo mật** | Secret key, DB credentials, business logic nhạy cảm ở lại server — không có cách nào leak vì code không được gửi đi. |
| **Tự động code-splitting** | Client Components được tham chiếu từ Server Components tự trở thành split point — không cần `React.lazy` thủ công. |
| **Caching kết quả render** | Kết quả render (RSC Payload, full route cache) cache được trên server/CDN và tái sử dụng giữa các request, giữa các user. |
| **SEO** | Nội dung render sẵn thành HTML hoàn chỉnh từ server → crawler đọc được ngay, không phụ thuộc JS execution. |

Insight cho phỏng vấn: lợi ích lớn nhất trong thực tế là **dependencies nặng biến mất khỏi bundle**. Ví dụ kinh điển: render markdown với `shiki` + `remark` (~hàng trăm KB) — trong Server Component, toàn bộ số KB đó là 0 ở client.

**Pitfall**: zero bundle không có nghĩa "miễn phí hoàn toàn" — vẫn tốn compute server, và RSC Payload vẫn phải truyền qua mạng (nhưng thường nhỏ hơn nhiều so với JS tương ứng và không tốn CPU parse/execute).

### Code minh hoạ

```tsx
// app/blog/[slug]/page.tsx — ví dụ "dependency nặng biến mất"
import "server-only";
import { unified } from "unified";          // ~vài trăm KB dependencies
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeShiki from "@shikijs/rehype";  // syntax highlighter rất nặng
import rehypeStringify from "rehype-stringify";

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 1. Data fetching gần data source — server gọi DB nội bộ, latency ~1ms
  const post = await db.post.findUnique({ where: { slug } });

  // 2. Toàn bộ pipeline markdown chạy TRÊN SERVER
  //    Client bundle: 0 KB cho unified/remark/shiki
  const html = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeShiki, { theme: "github-dark" })
    .use(rehypeStringify)
    .process(post!.markdown);

  // 3. Crawler nhận HTML đầy đủ → SEO tốt
  return <article dangerouslySetInnerHTML={{ __html: String(html) }} />;
}

// 4. Tự động code-splitting: chỉ cần import Client Component là có split point
import { CommentBox } from "./CommentBox"; // 'use client' → tự thành chunk riêng

// 5. Caching kết quả render — page static được cache toàn bộ
export const revalidate = 3600; // full route cache 1 giờ, mọi user dùng chung
```

### Đáp án mẫu

> "Lợi ích lớn nhất là **zero bundle JS**: code của Server Component và mọi dependency nó dùng không vào client bundle. Ví dụ thực tế của em là trang blog dùng remark cộng shiki để render markdown — mấy trăm KB lib đó hoàn toàn ở lại server, client nhận HTML thuần. Thứ hai là **data fetching gần data source**: fetch chạy trên server cùng datacenter với DB nên latency rất thấp, tránh waterfall nhiều vòng từ browser. Thứ ba là **bảo mật** — secret và DB code không có cách nào leak vì code không được gửi đi. Ngoài ra còn có **code-splitting tự động** ở mỗi client boundary, kết quả render **cache được** trên server và chia sẻ giữa các user, và **SEO** tốt vì crawler nhận HTML đầy đủ. Tổng hợp lại, đó là lý do Next.js chọn server-first làm mặc định — chỉ phần thực sự cần tương tác mới trả giá bằng JS."

---

## Câu 19: Client Components là gì và khi nào cần dùng? `[Basic]`

### Câu hỏi

> Client Components là gì? Khi nào em cần dùng? Client Component có render trên server không?

### Giải thích lý thuyết

**Client Component** là component được đánh dấu bằng `'use client'` — code của nó được đưa vào client bundle và **hydrate ở browser** để có interactivity.

Cần Client Component khi:

1. **Interactivity / state**: `useState`, `useReducer`, form có validation realtime.
2. **Lifecycle / effects**: `useEffect`, `useLayoutEffect`.
3. **Event handlers**: `onClick`, `onChange`, `onSubmit`...
4. **Browser API**: `window`, `localStorage`, `geolocation`, `IntersectionObserver`.
5. **Custom hooks** phụ thuộc các thứ trên, hoặc **third-party lib dùng hooks** (React Hook Form, Framer Motion, chart libs...).
6. **Context**: `useContext` và các Provider có state.

**Đây là câu bẫy kinh điển**: "Client Component có phải chỉ render ở client không?" — **KHÔNG**. Client Component vẫn được **render trên server thành HTML lần đầu** (SSR/prerender), gửi xuống cùng trang, rồi mới **hydrate** ở browser để gắn event listener. "Client" trong tên nghĩa là *code chạy được ở client và có trong client bundle*, không phải *chỉ render ở client*. Hệ quả thực tế: code trong thân Client Component vẫn chạy trên server lần đầu → đụng `window` trực tiếp ở thân component vẫn crash khi SSR, phải đưa vào `useEffect` hoặc dùng `dynamic(..., { ssr: false })`.

### Code minh hoạ

```tsx
// components/SearchBox.tsx
"use client"; // cần vì: useState + event handler + browser API

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function SearchBox() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  // ❌ SAI: window ở thân component — vẫn CRASH khi server prerender!
  // const width = window.innerWidth;

  // ✅ ĐÚNG: browser API trong useEffect — chỉ chạy sau hydrate ở client
  useEffect(() => {
    const saved = window.localStorage.getItem("lastQuery");
    if (saved) setQuery(saved);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.localStorage.setItem("lastQuery", query);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)} // event handler → cần client
        placeholder="Tìm kiếm..."
      />
      <button type="submit">Tìm</button>
    </form>
  );
}

// Vòng đời của Client Component:
// 1. Server: render ra HTML tĩnh (input hiển thị nhưng CHƯA tương tác được)
// 2. Browser: tải JS chunk của component
// 3. Hydrate: React gắn event listeners → form bắt đầu hoạt động
// → User thấy UI ngay (nhờ SSR), tương tác được sau khi hydrate

// Trường hợp thực sự muốn TẮT server render (lib đụng window khi import):
import dynamic from "next/dynamic";
const MapWidget = dynamic(() => import("./MapWidget"), { ssr: false });
```

### Đáp án mẫu

> "Client Component là component đánh dấu `'use client'` — code được ship xuống browser và hydrate để có interactivity. Em dùng khi cần state với `useState`, effects, event handler như `onClick`, browser API như `localStorage`, hoặc third-party lib dùng hooks. Nhưng có một điểm em thấy nhiều người hiểu sai — và đây là câu bẫy phổ biến: Client Component **không phải chỉ render ở client**. Nó vẫn được **server render ra HTML lần đầu** rồi mới hydrate ở browser, nên user vẫn thấy nội dung ngay cả trước khi JS tải xong. 'Client' nghĩa là code nằm trong client bundle, chứ không phải nơi render duy nhất. Hệ quả thực tế là nếu em đụng `window` trực tiếp ở thân component thì vẫn crash lúc SSR — phải đưa vào `useEffect`, hoặc với lib đụng browser API ngay khi import thì dùng `dynamic` với `ssr: false`."

---

## Câu 20: Server Components và Client Components khác nhau thế nào? `[Intermediate]`

### Câu hỏi

> So sánh chi tiết Server Components và Client Components: nơi render, bundle, hooks, data fetching, re-render. Khi thiết kế page em phân chia thế nào?

### Giải thích lý thuyết

| Tiêu chí | Server Component | Client Component |
| --- | --- | --- |
| **Đánh dấu** | Mặc định trong App Router | `'use client'` ở đầu file |
| **Nơi render** | Chỉ trên server | Server (HTML lần đầu) + client (hydrate, re-render) |
| **Code trong client bundle** | Không (zero JS) | Có (ship + parse + execute ở browser) |
| **Hooks (`useState`, `useEffect`...)** | Không | Có |
| **Event handlers** | Không | Có |
| **`async/await` trong thân component** | Có (async component) | Không trực tiếp (dùng `use()` để unwrap Promise) |
| **Truy cập backend (DB, fs, secret)** | Trực tiếp | Không — phải qua API/Server Actions |
| **Browser API** | Không | Có (sau hydrate) |
| **Re-render khi tương tác** | Không (render 1 lần mỗi request/cache) | Có (state change → re-render ở client) |
| **Props nhận được** | Bất kỳ | Phải **serializable** khi truyền từ Server → Client |
| **Context** | Không dùng `useContext` | Dùng được |

Hai điểm "ăn điểm" khi phỏng vấn:

1. **Serialization boundary**: props truyền từ Server Component sang Client Component phải serialize được (đi qua mạng dưới dạng RSC Payload) — function thường, class instance, Symbol đều không truyền được. Ngoại lệ: **Server Actions** (function có `'use server'`) truyền được vì Next.js serialize chúng thành reference.
2. **Re-render model**: Server Component không "sống" ở client — khi Client Component setState, chỉ phần client re-render; phần server muốn cập nhật phải refetch RSC Payload (qua `router.refresh()` hoặc navigation/revalidate).

### Code minh hoạ

```tsx
// app/orders/page.tsx — Server Component (mặc định)
import { db } from "@/lib/db";
import { OrderFilter } from "./OrderFilter";

export default async function OrdersPage() {
  // ✅ async/await trực tiếp + truy cập DB
  const orders = await db.order.findMany({ take: 50 });

  return (
    <main>
      <h1>Đơn hàng</h1>
      {/* ✅ Props serializable: plain object, array, string, number, Date đơn giản */}
      <OrderFilter
        orders={orders.map((o) => ({ id: o.id, total: o.total, status: o.status }))}
      />

      {/* ❌ KHÔNG truyền được qua boundary:
          <OrderFilter onSelect={(id) => db.order.delete(...)} />  // function thường
          <OrderFilter db={db} />                                   // class instance
      */}
    </main>
  );
}

// app/orders/OrderFilter.tsx — Client Component
"use client";

import { useState, useMemo } from "react";

type OrderLite = { id: string; total: number; status: string };

export function OrderFilter({ orders }: { orders: OrderLite[] }) {
  // ✅ State + re-render ở client; Server Component cha KHÔNG re-render
  const [status, setStatus] = useState("all");

  const filtered = useMemo(
    () => (status === "all" ? orders : orders.filter((o) => o.status === status)),
    [orders, status]
  );

  return (
    <>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="all">Tất cả</option>
        <option value="paid">Đã thanh toán</option>
      </select>
      <ul>
        {filtered.map((o) => (
          <li key={o.id}>{o.id} — {o.total.toLocaleString("vi-VN")}đ</li>
        ))}
      </ul>
    </>
  );
}

// Ngoại lệ serialization: Server Action truyền được như prop
// app/orders/actions.ts
"use server";
export async function deleteOrder(id: string) {
  await db.order.delete({ where: { id } });
}
// → <OrderFilter onDelete={deleteOrder} /> hợp lệ (serialize thành reference)
```

### Đáp án mẫu

> "Khác biệt cốt lõi: Server Component **chỉ render trên server**, không ship JS xuống client, được phép `async/await` và truy cập DB/secret trực tiếp, nhưng không có hooks, không event handler, và không re-render khi user tương tác. Client Component thì có state, effects, event handler, browser API — đổi lại code nằm trong client bundle, và muốn lấy data phải qua API hoặc Server Actions. Có hai điểm tinh tế em luôn nhấn mạnh: một là **serialization boundary** — props từ Server sang Client phải serialize được, không truyền function hay class instance, trừ Server Actions. Hai là **re-render model**: khi Client Component setState thì chỉ phần client re-render; Server Component đã render xong rồi, muốn cập nhật phải `router.refresh()` hoặc revalidate. Khi thiết kế page, em mặc định mọi thứ là Server Component, fetch data ở cao nhất, rồi đẩy interactivity xuống các Client Component lá nhỏ nhất có thể."

---

## Câu 21: Có thể import Server Component vào Client Component không? `[Advanced]`

### Câu hỏi

> Em có thể import một Server Component vào trong Client Component không? Nếu không thì làm sao để hiển thị Server Component bên trong Client Component?

### Giải thích lý thuyết

**Đây là câu bẫy kinh điển nhất của chủ đề RSC.** Câu trả lời: **KHÔNG import trực tiếp được** — nhưng vẫn **compose được** qua props.

Tại sao import trực tiếp không được? Vì `'use client'` áp dụng cho **cả import subtree**: khi Client Component `import ServerThing from "./ServerThing"`, bundler coi `ServerThing` là một phần của client bundle → nó **âm thầm biến thành Client Component**. Hậu quả:

- Nếu `ServerThing` là async component, dùng DB, hay import `server-only` → **build error**.
- Nếu nó "vô tình chạy được" → code và dependencies của nó bị kéo hết vào client bundle, mất sạch lợi ích RSC. Đây là dạng lỗi âm thầm nguy hiểm.

**Pattern đúng: truyền qua props (children/slot)**. Server Component cha render cả hai và "nhét" Server Component vào Client Component dưới dạng `children` (hoặc bất kỳ prop nào).

**Tại sao composition pattern hoạt động?** Vì thứ đi qua boundary không phải là *code* mà là *kết quả render*. Khi Server Component cha render, `<ServerThing />` đã được render xong trên server thành RSC Payload; Client Component chỉ nhận một "ô đã render sẵn" và quyết định đặt nó ở đâu trong cây. Client không cần (và không có) code của `ServerThing` — nó chỉ cầm output. Đó là lý do server content có thể nằm "bên trong" client tree một cách hợp lệ.

### Code minh hoạ

```tsx
// app/dashboard/ServerStats.tsx — Server Component, đụng DB
import "server-only";
import { db } from "@/lib/db";

export async function ServerStats() {
  const count = await db.order.count();
  return <p>Tổng đơn hàng: {count}</p>;
}

// ❌ SAI: Client Component import trực tiếp Server Component
// app/dashboard/Panel.tsx
"use client";
// import { ServerStats } from "./ServerStats";
// → ServerStats bị kéo vào client bundle, 'server-only' + async sẽ gây BUILD ERROR.
// Nếu không có guard nào, nó âm thầm thành Client Component — lỗi nguy hiểm hơn.

// ✅ ĐÚNG: Client Component nhận children (slot) — không biết bên trong là gì
// app/dashboard/CollapsiblePanel.tsx
"use client";

import { useState } from "react";

export function CollapsiblePanel({
  title,
  children, // "ô trống" — nội dung đã được server render sẵn
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <section>
      <button onClick={() => setOpen(!open)}>{title}</button>
      {open && children} {/* chỉ quyết định VỊ TRÍ hiển thị, không render lại */}
    </section>
  );
}

// app/dashboard/page.tsx — Server Component cha lắp ráp cả hai
import { CollapsiblePanel } from "./CollapsiblePanel";
import { ServerStats } from "./ServerStats";

export default function DashboardPage() {
  return (
    <CollapsiblePanel title="Thống kê">
      {/* ServerStats render TRÊN SERVER thành RSC Payload,
          rồi được "nhét" vào slot children của Client Component */}
      <ServerStats />
    </CollapsiblePanel>
  );
}

// Lưu ý: chiều ngược lại thì bình thường —
// Server Component import Client Component là pattern chuẩn hằng ngày.
```

### Đáp án mẫu

> "Đây là câu bẫy kinh điển ạ. **Không import trực tiếp được**: vì `'use client'` áp dụng cho cả import subtree, nên Server Component bị Client Component import sẽ **âm thầm biến thành Client Component** — nhẹ thì phình bundle, nặng thì build error nếu nó là async hay dùng `server-only`. Pattern đúng là **composition qua props**: Server Component cha render cả hai, truyền Server Component vào Client Component dưới dạng `children` hoặc một prop slot. Lý do pattern này hoạt động là vì thứ đi qua boundary **không phải code mà là kết quả render** — `<ServerStats />` đã render xong trên server thành RSC Payload, Client Component chỉ nhận một ô nội dung render sẵn và quyết định đặt nó ở đâu, ví dụ ẩn hiện khi toggle. Còn chiều ngược lại — Server import Client — thì hoàn toàn bình thường, đó là pattern dùng hằng ngày."

---

## Câu 53: RSC Payload là gì và serialization boundary hoạt động ra sao? `[Advanced]`

### Câu hỏi

> RSC Payload (React Flight) là gì, chứa những gì? Serialization boundary giữa Server và Client Component giới hạn props như thế nào, và RSC Payload đóng vai trò gì khi navigate?

### Giải thích lý thuyết

**RSC Payload** là định dạng dữ liệu nhị phân/text đặc biệt (nội bộ gọi là **React Flight**) mà React dùng để mô tả **kết quả render của Server Components**. Nó không phải HTML, cũng không phải JSON thuần — là một stream các dòng, mỗi dòng mô tả một phần của cây UI.

RSC Payload chứa 3 thứ chính:

1. **Kết quả render của Server Components** — dạng cây element đã render (tag, props tĩnh, text).
2. **Placeholder (reference) cho Client Components** — không chứa code, chỉ chứa tham chiếu tới JS chunk cần tải (module ID) và vị trí trong cây.
3. **Props truyền từ Server → Client Components** — đã serialize.

**Serialization boundary**: vì props phải đi qua mạng trong payload, chúng phải serialize được theo chuẩn của React Flight:

| Truyền được | Không truyền được |
| --- | --- |
| string, number, boolean, null/undefined | **Function thường** (closure không serialize được) |
| plain object, array, Map, Set | **Class instance** (Prisma model, `dayjs` object...) |
| `Date` (chuẩn, được Flight hỗ trợ) | Date "phức tạp" — object bọc date của lib (Moment, Dayjs) |
| Promise (client unwrap bằng `use()`) | Symbol, WeakMap, DOM node |
| JSX / ReactNode (đã render) | Event emitter, stream Node |
| **Server Actions** (`'use server'` → serialize thành reference) | React element kèm function props chưa render |

**Vai trò khi navigation**: với **soft navigation** (click `<Link>` trong app), Next.js **không tải full HTML mới** — client fetch RSC Payload của route đích, React reconcile cây mới với cây hiện tại: phần layout giữ nguyên **không mất state**, phần thay đổi được swap. Đây là lý do App Router navigate mượt như SPA mà nội dung mới vẫn render từ server.

**Pitfall thực tế**: truyền nguyên Prisma model (class instance có method) làm prop cho Client Component → lỗi serialize hoặc warning; phải map về plain object trước.

### Code minh hoạ

```tsx
// app/products/page.tsx — Server Component
import { db } from "@/lib/db";
import { AddToCart } from "./AddToCart";
import { addToCartAction } from "./actions";

export default async function ProductsPage() {
  const products = await db.product.findMany();

  return (
    <main>
      {products.map((p) => (
        <AddToCart
          key={p.id}
          // ✅ Serializable: map class instance (Prisma model) → plain object
          product={{ id: p.id, name: p.name, price: p.price }}
          // ✅ Date chuẩn được Flight hỗ trợ
          updatedAt={p.updatedAt}
          // ✅ Server Action — serialize thành REFERENCE, không phải code
          onAdd={addToCartAction}
          // ❌ Các trường hợp lỗi serialize:
          // onClick={() => console.log(p.id)}  → function thường: KHÔNG
          // product={p}                         → Prisma instance có method: KHÔNG
          // formatter={dayjs(p.updatedAt)}      → class instance của lib: KHÔNG
        />
      ))}
    </main>
  );
}

// app/products/actions.ts
"use server";
export async function addToCartAction(productId: string) {
  // chạy trên server khi client gọi — đi qua boundary dưới dạng reference
}

// Hình dung RSC Payload (minh hoạ, đã đơn giản hoá):
//
// 0: ["$", "main", null, { children: [...] }]            ← kết quả render server
// 1: I["./AddToCart.tsx", ["chunk-abc.js"], "AddToCart"] ← reference client component
// 2: ["$", "$L1", "p1", {                                 ← placeholder + props serialize
//      product: { id: "p1", name: "Áo", price: 200000 },
//      updatedAt: "$D2026-06-10T00:00:00.000Z",           ← Date có encoding riêng
//      onAdd: "$F{server-action-id}"                      ← action = reference
//    }]
//
// Soft navigation: click <Link href="/products">
// → client fetch RSC Payload (KHÔNG phải full HTML)
// → React reconcile: layout giữ nguyên state, chỉ swap phần page thay đổi
```

### Đáp án mẫu

> "RSC Payload — định dạng React Flight — là dữ liệu mô tả **kết quả render của Server Components**, gồm ba phần: cây UI đã render từ server, các **placeholder tham chiếu** tới Client Components kèm module ID của JS chunk, và **props đã serialize** truyền qua boundary. Vì props phải đi qua mạng nên chúng phải serializable: plain object, array, string, number, `Date` chuẩn, thậm chí Promise thì được; còn function thường, class instance như Prisma model hay object của Dayjs thì không — ngoại lệ duy nhất là Server Actions, được serialize thành reference. Pitfall em hay gặp là truyền nguyên model từ ORM xuống Client Component — phải map về plain object trước. Điểm hay nữa là khi **soft navigation** bằng `<Link>`, Next.js chỉ fetch RSC Payload của route mới chứ không tải full HTML — React reconcile nên layout giữ nguyên state, chỉ phần thay đổi được swap. Đó là lý do App Router vừa render từ server vừa navigate mượt như SPA."
