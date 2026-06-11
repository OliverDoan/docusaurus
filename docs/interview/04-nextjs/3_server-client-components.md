---
sidebar_position: 3
title: "3. Server & Client Components"
---

# Server & Client Components

> *Server Components là thay đổi lớn nhất của React trong 10 năm qua, và App Router xây toàn bộ trên nền tảng này. Hiểu sai ranh giới server/client là lỗi phổ biến nhất khi phỏng vấn Next.js hiện đại.*

---

## Câu 3: 'use client' directive trong Next.js dùng khi nào? `[Basic]`

### Câu hỏi

> 'use client' directive trong Next.js dùng khi nào? Đặt nó ở đâu trong cây component là hợp lý?

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

## Câu 4: Server-only và client-only packages trong Next.js là gì? `[Intermediate]`

### Câu hỏi

> Server-only và client-only packages trong Next.js là gì? Tại sao nên dùng chúng cho data-access layer?

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

## Câu 18: React Server Components là gì? `[Basic]`

### Câu hỏi

> React Server Components là gì? Chúng khác gì component React truyền thống, và mang lại những lợi ích nào?

### Giải thích lý thuyết

**React Server Components (RSC)** là component **chỉ render trên server** — kết quả render được gửi xuống client dưới dạng dữ liệu mô tả UI (RSC Payload), còn **code của component không bao giờ được gửi xuống browser**.

Đặc điểm cốt lõi:

1. **Zero JS xuống client**: component không nằm trong client bundle, không hydrate.
2. **`async/await` trực tiếp**: Server Component có thể là async function — `await fetch()`, `await db.query()` ngay trong thân component, không cần `useEffect` + state loading.
3. **Truy cập tài nguyên server trực tiếp**: DB, file system, secret env var — vì code chỉ chạy trên server.
4. **Mặc định trong App Router**: mọi component trong `app/` là Server Component trừ khi đánh dấu `'use client'`.

Những thứ Server Component **không làm được**: không dùng `useState`/`useEffect` hay hook có state/lifecycle, không gắn event handler (`onClick`...), không dùng browser API.

Lợi ích chính (lý do Next.js chọn làm mặc định):

| Lợi ích | Giải thích |
| --- | --- |
| **Zero bundle JS** | Code component kèm dependencies nặng (markdown parser, syntax highlighter, date lib) không vào client bundle → tải trang nhanh hơn, nhất là trên mobile/mạng yếu. |
| **Data fetching gần data source** | Fetch chạy trên server, cùng datacenter với DB/API → latency thấp, không waterfall client-server nhiều vòng. |
| **Bảo mật** | Secret key, DB credentials, business logic nhạy cảm ở lại server — không thể leak vì code không được gửi đi. |
| **Code-splitting tự động** | Mỗi Client Component được tham chiếu từ server tree tự thành split point — không cần `React.lazy` thủ công. |
| **Caching + SEO** | Kết quả render cache được trên server/CDN, chia sẻ giữa các user; crawler nhận HTML đầy đủ. |

**Phân biệt quan trọng** (hay nhầm): RSC **không phải là SSR**. SSR render component thành HTML rồi vẫn ship JS xuống để hydrate; RSC render xong là xong — không ship JS, không hydrate. Hai cơ chế này hoạt động song song trong Next.js.

### Code minh hoạ

```tsx
// app/posts/[slug]/page.tsx
// Server Component — MẶC ĐỊNH trong App Router, không cần directive nào

import { db } from "@/lib/db"; // truy cập DB trực tiếp — an toàn vì chỉ chạy server
import { renderMarkdown } from "@/lib/markdown"; // dùng remark + shiki (~vài trăm KB)

// Component là ASYNC FUNCTION — điều không thể với component truyền thống
export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>; // Next 15: params là Promise
}) {
  const { slug } = await params;

  // Fetch data trực tiếp trong component — không useEffect, không loading state thủ công
  const post = await db.post.findUnique({ where: { slug } });
  if (!post) return <p>Không tìm thấy bài viết</p>;

  // Pipeline markdown nặng chạy TRÊN SERVER → client bundle: 0 KB cho remark/shiki
  const html = await renderMarkdown(post.markdown);

  // Đọc secret thoải mái — không bao giờ leak vì code không xuống client
  const cdnUrl = process.env.PRIVATE_CDN_URL;

  return (
    <article>
      <h1>{post.title}</h1>
      <img src={`${cdnUrl}/${post.cover}`} alt={post.title} />
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}

// ❌ Những thứ KHÔNG dùng được trong Server Component:
// useState(...)        → lỗi: hooks cần client
// onClick={...}        → lỗi: event handler không serialize được
// window.localStorage  → lỗi: không có browser API trên server
```

### Đáp án mẫu

> "Server Components là component **chỉ render trên server** — client nhận kết quả render dưới dạng RSC Payload, còn code của component **không bao giờ được ship xuống browser**, nên đóng góp zero JS vào client bundle. Trong App Router, mọi component mặc định là Server Component. Khác biệt lớn nhất với component truyền thống là viết được **async component**: `await` fetch hay query DB ngay trong thân component, không cần `useEffect` cộng loading state. Lợi ích thực tế em thấy rõ nhất là **dependencies nặng biến mất khỏi bundle** — ví dụ render markdown bằng remark cộng shiki, mấy trăm KB lib đó ở lại server hết. Ngoài ra còn bảo mật vì secret không thể leak, data fetching gần DB nên latency thấp, code-splitting tự động và SEO tốt. Em cũng lưu ý RSC khác SSR: SSR vẫn ship JS để hydrate, còn RSC thì không — hai cơ chế bổ trợ nhau chứ không thay thế nhau."

---

## Câu 19: Server Component có thể import Client Component không và ngược lại? `[Advanced]`

### Câu hỏi

> Server Component có thể import Client Component không và ngược lại? Nếu một chiều không được thì làm sao để hiển thị Server Component bên trong Client Component?

### Giải thích lý thuyết

**Đây là câu bẫy kinh điển nhất của chủ đề RSC.** Hai chiều **không đối xứng**:

**Chiều 1 — Server import Client: HOÀN TOÀN OK.** Đây là pattern chuẩn hằng ngày: Server Component cha render phần tĩnh, import Client Component cho phần interactive. Mỗi điểm import như vậy chính là một **client boundary** — bundler tự tạo split point, JS chunk của Client Component được tải riêng. Cây component điển hình là server ở trên, client ở các lá.

**Chiều 2 — Client import Server: KHÔNG được như mong đợi.** Vì `'use client'` áp dụng cho **cả import subtree**: khi Client Component `import ServerThing`, bundler coi `ServerThing` là một phần của client bundle → nó **âm thầm bị kéo thành Client Component**. Hậu quả:

- Nếu `ServerThing` là async component, dùng DB, hay import `server-only` → **build error**.
- Nếu nó "vô tình chạy được" → code và dependencies bị kéo hết vào client bundle, mất sạch lợi ích RSC. Đây là dạng lỗi âm thầm nguy hiểm hơn.

**Pattern đúng để đặt server content trong client tree: truyền qua `children`/props (composition)**. Server Component cha render cả hai và "nhét" Server Component vào Client Component dưới dạng `children` (hoặc bất kỳ prop slot nào).

**Tại sao composition hoạt động?** Vì thứ đi qua boundary không phải là *code* mà là *kết quả render*. Khi Server Component cha render, `<ServerThing />` đã render xong trên server thành RSC Payload; Client Component chỉ nhận một "ô đã render sẵn" và quyết định đặt nó ở đâu trong cây. Client không cần (và không có) code của `ServerThing`.

### Code minh hoạ

```tsx
// ✅ CHIỀU 1: Server import Client — pattern chuẩn hằng ngày
// app/dashboard/page.tsx (Server Component)
import { CollapsiblePanel } from "./CollapsiblePanel"; // Client Component → tạo client boundary
import { ServerStats } from "./ServerStats";

// app/dashboard/ServerStats.tsx — Server Component, đụng DB
import "server-only";
import { db } from "@/lib/db";

export async function ServerStats() {
  const count = await db.order.count();
  return <p>Tổng đơn hàng: {count}</p>;
}

// ❌ CHIỀU 2: Client import Server — Server Component bị kéo thành client
// app/dashboard/Panel.tsx
"use client";
// import { ServerStats } from "./ServerStats";
// → ServerStats bị coi là client module: 'server-only' + async → BUILD ERROR.
// Nếu không có guard nào, nó âm thầm thành Client Component — lỗi nguy hiểm hơn.

// ✅ PATTERN ĐÚNG: Client Component nhận children (slot) — không biết bên trong là gì
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
export default function DashboardPage() {
  return (
    <CollapsiblePanel title="Thống kê">
      {/* ServerStats render TRÊN SERVER thành RSC Payload,
          rồi được "nhét" vào slot children của Client Component */}
      <ServerStats />
    </CollapsiblePanel>
  );
}
```

### Đáp án mẫu

> "Hai chiều không đối xứng ạ. **Server import Client thì hoàn toàn bình thường** — đó là pattern hằng ngày, và mỗi điểm import như vậy là một client boundary, bundler tự tạo split point cho JS chunk. **Chiều ngược lại thì không được như mong đợi**: vì `'use client'` áp dụng cho cả import subtree, Server Component bị Client Component import sẽ **âm thầm bị kéo thành Client Component** — nhẹ thì phình bundle, nặng thì build error nếu nó là async hay dùng `server-only`. Muốn đặt server content bên trong client tree, pattern đúng là **composition qua props**: Server Component cha render cả hai, truyền Server Component vào Client Component dưới dạng `children` hoặc prop slot. Pattern này hoạt động vì thứ đi qua boundary **không phải code mà là kết quả render** — Client Component chỉ nhận một ô nội dung đã render sẵn và quyết định đặt nó ở đâu, ví dụ ẩn hiện khi toggle."

---

## Câu 20: Khi nào nên dùng Server Component, khi nào dùng Client Component? `[Intermediate]`

### Câu hỏi

> Khi nào nên dùng Server Component, khi nào dùng Client Component? So sánh hai loại và trình bày cách em quyết định khi thiết kế một page.

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
| **Context** | Không dùng `useContext` | Dùng được |

**Decision tree** khi thiết kế:

1. Component cần **state, event handler, effect, browser API, hooks**? → **Client Component**.
2. Component cần **fetch data, đụng DB/secret, render nội dung tĩnh/nặng**? → **Server Component**.
3. Cần cả hai? → **Tách**: Server Component fetch data + render khung, đẩy phần interactive xuống Client Component lá, truyền data qua props.
4. Không cần gì đặc biệt (UI thuần từ props)? → **Để mặc định là Server Component** — đừng thêm `'use client'` thừa.

Nguyên tắc tổng quát: **server-first** — mặc định mọi thứ là Server Component, fetch data ở cao nhất, chỉ "trả giá bằng JS" cho đúng những lá thực sự cần tương tác.

**Câu bẫy kinh điển đi kèm**: "Client Component có phải chỉ render ở client không?" — **KHÔNG**. Client Component vẫn được **render trên server thành HTML lần đầu** (SSR/prerender), gửi xuống cùng trang, rồi mới **hydrate** ở browser để gắn event listener. "Client" nghĩa là *code nằm trong client bundle*, không phải *nơi render duy nhất*. Hệ quả: đụng `window` trực tiếp ở thân Client Component vẫn crash khi SSR — phải đưa vào `useEffect` hoặc dùng `dynamic(..., { ssr: false })`.

### Code minh hoạ

```tsx
// app/orders/page.tsx — Server Component (mặc định): fetch + khung tĩnh
import { db } from "@/lib/db";
import { OrderFilter } from "./OrderFilter";

export default async function OrdersPage() {
  // ✅ async/await trực tiếp + truy cập DB — việc của Server Component
  const orders = await db.order.findMany({ take: 50 });

  return (
    <main>
      <h1>Đơn hàng</h1> {/* phần tĩnh — zero JS */}
      {/* Đẩy interactivity xuống lá, truyền data đã map qua props */}
      <OrderFilter
        orders={orders.map((o) => ({ id: o.id, total: o.total, status: o.status }))}
      />
    </main>
  );
}

// app/orders/OrderFilter.tsx — Client Component: state + event handler
"use client";

import { useState, useEffect, useMemo } from "react";

type OrderLite = { id: string; total: number; status: string };

export function OrderFilter({ orders }: { orders: OrderLite[] }) {
  // ✅ State + re-render ở client; Server Component cha KHÔNG re-render
  const [status, setStatus] = useState("all");

  // ❌ SAI: window ở thân component — vẫn CRASH khi server prerender lần đầu!
  // const width = window.innerWidth;

  // ✅ ĐÚNG: browser API trong useEffect — chỉ chạy sau hydrate ở client
  useEffect(() => {
    const saved = window.localStorage.getItem("lastFilter");
    if (saved) setStatus(saved);
  }, []);

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

// Vòng đời của Client Component (nhấn mạnh: vẫn SSR lần đầu!):
// 1. Server: render ra HTML tĩnh (select hiển thị nhưng CHƯA tương tác được)
// 2. Browser: tải JS chunk của component
// 3. Hydrate: React gắn event listeners → bắt đầu hoạt động
```

### Đáp án mẫu

> "Quy tắc của em là **server-first**: mặc định mọi thứ là Server Component — fetch data, đụng DB/secret, render nội dung tĩnh hay dùng lib nặng đều để trên server vì zero JS xuống client. Em chỉ chuyển sang Client Component khi thực sự cần: state với `useState`, event handler như `onClick`, effects, browser API, hoặc lib dùng hooks. Khi một màn hình cần cả hai, em tách: Server Component fetch data và render khung, rồi đẩy phần interactive xuống các Client Component lá nhỏ nhất có thể, truyền data qua props. Có hai điểm tinh tế em luôn nhấn: một là **Client Component vẫn được server render ra HTML lần đầu** rồi mới hydrate — 'client' nghĩa là code nằm trong client bundle chứ không phải nơi render duy nhất, nên đụng `window` ở thân component vẫn crash lúc SSR. Hai là **re-render model**: client setState chỉ re-render phần client; Server Component muốn cập nhật phải `router.refresh()` hoặc revalidate."

---

## Câu 21: Context API có hoạt động với Server Components không? `[Advanced]`

### Câu hỏi

> Context API có hoạt động với Server Components không? Nếu không thì làm sao dùng Provider (theme, auth...) trong App Router, và làm sao chia sẻ data giữa các Server Components?

### Giải thích lý thuyết

**Câu trả lời ngắn: KHÔNG.** `createContext` và `useContext` là **client API** — Server Component không gọi được. Lý do sâu hơn nằm ở model render:

1. **Context tồn tại để phản ứng với thay đổi**: provider đổi value → các consumer **re-render**. Nhưng Server Component **không re-render** — nó render một lần mỗi request rồi kết quả được gửi đi. Không có vòng đời ở client thì khái niệm "subscribe vào context" vô nghĩa.
2. `createContext` trả về object có chứa cơ chế subscription — không serialize được qua RSC Payload.

**Pattern đúng trong App Router** — provider vẫn dùng được, chỉ cần đặt đúng chỗ:

- Tách provider thành một **Client Component riêng** (`'use client'`), nhận `children`.
- Đặt provider đó trong **root layout** (Server Component) và bọc `children`.
- Nhờ **composition** (như Câu 19): `children` được truyền qua props là *kết quả render*, nên **các Server Component bên trong provider vẫn là Server Component** — không bị kéo vào client bundle. Chỉ các **Client Component** trong cây mới `useContext` được.

**Chia sẻ data giữa các Server Components** (thay thế vai trò context phía server):

- **Truyền props** bình thường — đơn giản nhất.
- **React `cache()`**: memoize một function theo **từng request** — nhiều Server Component cùng gọi `getCurrentUser()` chỉ query DB một lần, không cần "context" hay truyền props xuyên nhiều tầng. (Riêng `fetch` đã được Next.js tự dedupe trong cùng render.)

**Pitfall**: đặt `'use client'` lên chính root layout để dùng provider → toàn bộ app thành client. Phải tách provider ra file riêng.

### Code minh hoạ

```tsx
// ❌ SAI: dùng context trực tiếp trong Server Component
// app/layout.tsx (Server Component)
// import { createContext } from "react";
// const ThemeContext = createContext("light"); // ❌ Error: createContext is not
//                                              //    supported in Server Components

// ✅ ĐÚNG bước 1: provider là Client Component riêng
// app/providers.tsx
"use client";

import { createContext, useContext, useState } from "react";

const ThemeContext = createContext<{ theme: string; toggle: () => void } | null>(null);

export function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState("light");
  return (
    <ThemeContext.Provider
      value={{ theme, toggle: () => setTheme((t) => (t === "light" ? "dark" : "light")) }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme phải dùng trong <Providers>");
  return ctx;
}

// ✅ ĐÚNG bước 2: root layout VẪN là Server Component, bọc children bằng provider
// app/layout.tsx
import { Providers } from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        {/* children là KẾT QUẢ RENDER (composition) →
            các page/Server Component bên trong VẪN là Server Components */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

// Client Component bất kỳ trong cây dùng được context:
// "use client"; const { theme, toggle } = useTheme();

// ✅ Chia sẻ data giữa các SERVER Components: React cache() per-request
// lib/auth.ts
import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";

export const getCurrentUser = cache(async () => {
  // Nhiều Server Component cùng gọi trong 1 request → chỉ query 1 lần
  return db.user.findUnique({ where: { id: await getSessionUserId() } });
});

// app/dashboard/page.tsx và app/dashboard/Sidebar.tsx (đều là Server Components)
// cùng gọi await getCurrentUser() — không cần context, không prop drilling
```

### Đáp án mẫu

> "Không ạ — `createContext` và `useContext` là **client API**, Server Component gọi là lỗi ngay. Về bản chất cũng hợp lý: context tồn tại để consumer **re-render** khi value đổi, mà Server Component không re-render — nó render một lần mỗi request rồi gửi kết quả đi. Nhưng provider vẫn dùng bình thường trong App Router với pattern chuẩn: em tách provider thành **Client Component riêng** nhận `children`, rồi đặt nó trong root layout bọc `children`. Nhờ composition, `children` đi qua dưới dạng kết quả render nên **các Server Component bên trong vẫn là Server Component**, không bị kéo vào client bundle — chỉ Client Component trong cây mới `useContext`. Còn để chia sẻ data giữa các Server Components, em truyền props hoặc dùng **React `cache()`** memoize theo từng request — ví dụ `getCurrentUser()` được nhiều component gọi nhưng chỉ query DB một lần, thay thế luôn nhu cầu context phía server."

---

## Câu 22: Third-party libraries và Server Components có vấn đề gì? `[Advanced]`

### Câu hỏi

> Third-party libraries và Server Components có vấn đề gì? Em xử lý thế nào khi một lib dùng hooks nhưng chưa khai báo 'use client', hoặc lib chỉ chạy được ở browser?

### Giải thích lý thuyết

Vấn đề gốc: **rất nhiều lib trong hệ sinh thái React được viết trước thời RSC**. Chúng dùng `useState`/`useEffect` hoặc browser API nhưng **không có directive `'use client'`** trong source — vì trước đây mọi component mặc nhiên là "client". Khi import các lib này vào Server Component (mặc định trong App Router) → lỗi kiểu *"useState only works in a Client Component..."* hoặc *"window is not defined"*.

Các tình huống và cách xử lý:

| Tình huống | Triệu chứng | Cách xử lý |
| --- | --- | --- |
| Lib dùng hooks, chưa có `'use client'` | Lỗi khi import vào Server Component | **Wrap trong file riêng có `'use client'` rồi re-export** — file wrapper trở thành client boundary |
| Lib đụng `window` ngay khi import / chỉ chạy client (map, chart, editor) | `window is not defined` lúc SSR (vì Client Component vẫn prerender trên server) | `next/dynamic` với **`ssr: false`** — component chỉ render ở browser |
| Lib "RSC-ready" (có `'use client'` sẵn, hoặc thuần server như `date-fns`, ORM) | Hoạt động bình thường | Dùng trực tiếp; ưu tiên chọn lib loại này khi cân nhắc dependencies |
| CSS-in-JS runtime (styled-components, Emotion) | Không hoạt động trong Server Components | Cần style registry cho phần client, hoặc chuyển sang zero-runtime (Tailwind, CSS Modules) — chi tiết ở câu #10 |

Lưu ý phân biệt hai tầng lỗi: **(1)** lỗi "cần client" → giải quyết bằng wrapper `'use client'`; **(2)** lỗi "cần browser thật" → wrapper chưa đủ vì Client Component vẫn SSR lần đầu, phải thêm `ssr: false` hoặc đẩy phần đụng browser API vào `useEffect`.

Khi đánh giá lib mới, nên kiểm tra docs/package.json xem lib đã hỗ trợ RSC chưa (có `'use client'` trong bundle, có hướng dẫn App Router).

### Code minh hoạ

```tsx
// Tình huống 1: lib dùng hooks nhưng chưa có 'use client'
// ❌ SAI: import thẳng vào Server Component
// app/page.tsx (Server Component)
// import { Carousel } from "acme-carousel";
// → Error: useState only works in a Client Component...

// ✅ ĐÚNG: wrap trong file riêng có 'use client' rồi re-export
// components/Carousel.tsx
"use client";

export { Carousel } from "acme-carousel"; // wrapper = client boundary

// app/page.tsx (vẫn là Server Component)
import { Carousel } from "@/components/Carousel"; // ✅ OK — đi qua wrapper

export default function Page() {
  return (
    <main>
      <h1>Sản phẩm</h1>
      <Carousel images={["/a.jpg", "/b.jpg"]} />
    </main>
  );
}

// Tình huống 2: lib CHỈ chạy ở browser (đụng window ngay khi import)
// Wrapper 'use client' CHƯA đủ — Client Component vẫn SSR lần đầu → vẫn crash!
// ✅ dynamic import với ssr: false — chỉ render ở browser
// components/MapSection.tsx
"use client";

import dynamic from "next/dynamic";

// Next.js 15: ssr: false chỉ được dùng bên trong Client Component
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => <p>Đang tải bản đồ...</p>,
});

export function MapSection() {
  return <LeafletMap center={[21.03, 105.85]} />;
}

// Tình huống 3: lib thuần logic (không hooks, không browser API)
// app/report/page.tsx (Server Component)
import { format } from "date-fns"; // ✅ chạy thẳng trên server, 0 KB xuống client

export default async function ReportPage() {
  return <p>Báo cáo ngày {format(new Date(), "dd/MM/yyyy")}</p>;
}
```

### Đáp án mẫu

> "Vấn đề gốc là nhiều lib React được viết trước thời RSC: chúng dùng hooks hoặc browser API nhưng **không khai báo `'use client'`**, nên import vào Server Component là lỗi ngay. Cách xử lý của em tuỳ tầng lỗi. Với lib chỉ thiếu directive, em tạo **file wrapper riêng có `'use client'` rồi re-export** — wrapper đó thành client boundary, Server Component import qua wrapper là chạy. Với lib đụng `window` ngay khi import như map hay chart, wrapper chưa đủ vì Client Component vẫn SSR lần đầu — em dùng `next/dynamic` với **`ssr: false`** để component chỉ render ở browser, kèm `loading` fallback. Khi chọn dependencies mới, em ưu tiên lib đã 'RSC-ready' hoặc thuần logic như `date-fns` — loại này chạy thẳng trong Server Component và không tốn KB nào ở client. Riêng CSS-in-JS runtime như styled-components cũng không hoạt động trong Server Components — cần style registry hoặc chuyển zero-runtime, phần này em xin trình bày kỹ ở câu hỏi về styling."

---

## Câu 53: Server Component props phải tuân theo quy tắc gì? `[Advanced]`

### Câu hỏi

> Props truyền từ Server Component sang Client Component phải tuân theo quy tắc gì? Tại sao có giới hạn đó, và RSC Payload liên quan thế nào?

### Giải thích lý thuyết

**Quy tắc: props đi qua boundary Server → Client phải serializable.** Lý do nằm ở cách dữ liệu di chuyển: kết quả render của Server Components được đóng gói thành **RSC Payload** (định dạng nội bộ tên **React Flight**) và **truyền qua mạng** xuống client. Payload này chứa 3 thứ:

1. **Kết quả render của Server Components** — cây element đã render (tag, props tĩnh, text).
2. **Placeholder (reference) cho Client Components** — không chứa code, chỉ chứa module ID của JS chunk cần tải và vị trí trong cây.
3. **Props truyền từ Server → Client** — phải **serialize** được để đi cùng payload.

Vì props phải "đóng gói gửi qua mạng", React Flight quy định rõ cái gì qua được:

| ✅ Truyền được | ❌ Không truyền được |
| --- | --- |
| string, number, boolean, null/undefined | **Function thường** (closure không serialize được) — ngoại lệ duy nhất: **Server Action** (`'use server'`, serialize thành reference) |
| plain object, array, Map, Set | **Class instance** (Prisma model, object của Dayjs/Moment...) |
| `Date` chuẩn (Flight có encoding riêng) | Date "phức tạp" — object bọc date của lib |
| Promise (client unwrap bằng `use()`) | **Symbol**, WeakMap, DOM node |
| JSX / ReactNode (đã render — nền tảng của composition pattern) | Event emitter, stream Node |

Lưu ý: quy tắc này chỉ áp cho **boundary Server → Client**. Props giữa hai Server Components, hoặc giữa hai Client Components, truyền gì cũng được như React thường.

**Vai trò của RSC Payload khi navigation**: với **soft navigation** (click `<Link>`), Next.js không tải full HTML mới — client fetch RSC Payload của route đích, React reconcile: layout giữ nguyên **không mất state**, chỉ phần thay đổi được swap. Đây là lý do App Router navigate mượt như SPA mà nội dung mới vẫn render từ server.

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
          // ❌ Các trường hợp VI PHẠM quy tắc serialization:
          // onClick={() => console.log(p.id)}  → function thường: KHÔNG
          // product={p}                         → Prisma instance có method: KHÔNG
          // formatter={dayjs(p.updatedAt)}      → class instance của lib: KHÔNG
          // tag={Symbol("hot")}                 → Symbol: KHÔNG
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

> "Quy tắc cốt lõi: props từ Server Component sang Client Component phải **serializable**, vì chúng đi qua mạng bên trong **RSC Payload** — định dạng React Flight gồm kết quả render server, các placeholder tham chiếu Client Components kèm module ID, và props đã serialize. Cụ thể: plain object, array, string, number, `Date` chuẩn, thậm chí Promise thì truyền được; còn **function thường, class instance** như Prisma model hay object của Dayjs, và **Symbol** thì không — ngoại lệ duy nhất là **Server Actions**, được serialize thành reference. Pitfall em hay gặp là truyền nguyên model từ ORM xuống Client Component — phải map về plain object trước. Em cũng lưu ý quy tắc này chỉ áp cho boundary Server → Client; props giữa hai Client Components thì thoải mái. Hiểu RSC Payload còn giải thích vì sao soft navigation mượt: click `<Link>` chỉ fetch payload của route mới, React reconcile nên layout giữ nguyên state."

---

## Bẫy thường gặp khi trả lời

| Bẫy | Trả lời sai | Trả lời đúng |
| --- | --- | --- |
| "`'use client'` nghĩa là chỉ render ở client" | Client Component không render trên server | Client Component **vẫn SSR ra HTML lần đầu**, rồi mới hydrate — "client" nghĩa là code nằm trong client bundle |
| "Phải thêm `'use client'` vào mọi file con" | Lặp directive ở từng file | Directive áp dụng cho **cả import subtree** — chỉ cần ở file boundary |
| "RSC chính là SSR" | Đồng nhất hai khái niệm | SSR vẫn ship JS để hydrate; RSC **không ship JS, không hydrate** — hai cơ chế song song |
| "Client không thể chứa Server Component" | Kết luận là bất khả thi | Không **import** trực tiếp được, nhưng **compose qua `children`/props** thì được — thứ đi qua boundary là kết quả render |
| "Context không dùng được trong App Router" | Bỏ context hoàn toàn | Provider là **Client Component đặt trong root layout**; Server Components bên trong vẫn giữ nguyên nhờ composition |
| "Lib lỗi với RSC là không dùng được" | Loại bỏ lib | Wrap re-export trong file `'use client'`; lib chỉ chạy browser thì `dynamic(..., { ssr: false })` |
| "Props truyền qua boundary thoải mái như React thường" | Truyền function/class instance | Props Server → Client phải **serializable** qua RSC Payload — ngoại lệ duy nhất là Server Actions |
| "Server Component re-render khi client setState" | Nghĩ cả cây re-render | Server Component render 1 lần mỗi request; muốn cập nhật phải `router.refresh()`/revalidate |
