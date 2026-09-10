---
sidebar_position: 1
title: "1. Server vs Client Components"
---

# Server vs Client Components

Trong Next.js, **rendering** (kết xuất, tức quá trình biến code thành giao diện hiển thị) có thể diễn ra ở hai nơi. **Server Components** là các component được dựng sẵn trên máy chủ, còn **Client Components** là các component chạy trong trình duyệt và có thể tương tác với người dùng. Bài này giúp bạn phân biệt hai loại này và biết khi nào nên dùng loại nào.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Server Component là mặc định** — async, fetch được DB/secret/env, nhưng KHÔNG có hook, event handler hay browser API, và không vào client bundle.
- ⭐ **`"use client"` đánh dấu boundary** ở đầu file — có hook/event/browser API; mọi child import từ đó tự kế thừa là Client.
- **Composition** — Server có thể wrap Client, nhưng Client không import trực tiếp Server; truyền Server qua `children`/prop (pattern "Server in Client").
- **Quy tắc thực dụng** — default Server, chỉ convert sang Client khi cần hook/event, push `"use client"` càng sâu (leaf) càng tốt.
- **Phân biệt 3 directive** — `"use client"` (file Client), `"use server"` đầu file (file chứa Server Actions), `"use server"` trong function (function đó là Server Action).

:::

---

## Mục lục

- [Vì sao có nhiều rendering mode?](#vì-sao-có-nhiều-rendering-mode)
- [Server Components (default)](#server-components-default)
- [Client Components ("use client")](#client-components-use-client)
- [Composition](#composition)
- [Khi nào dùng cái nào?](#khi-nào-dùng-cái-nào)
- ["use server" directive](#use-server-directive)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Vì sao có nhiều rendering mode?

**Vấn đề:** Mỗi trang có yêu cầu khác nhau về **tốc độ**, **SEO** và **độ tươi dữ liệu**. Một chế độ render duy nhất không tối ưu cho tất cả:

```tsx
// Render tất cả mọi trang theo cùng MỘT cách
// → trang marketing cần nhanh + SEO nhưng lại render lại mỗi request (chậm)
// → dashboard cần dữ liệu mới theo user nhưng lại bị cache tĩnh (sai)
// → trang sản phẩm vừa cần nhanh, vừa cần cập nhật giá → không cách nào vừa lòng cả hai
```

**Giải pháp:** Next cho chọn chế độ render **theo từng trang**, cân bằng đánh đổi:

```tsx
// SSG — build sẵn lúc deploy, nhanh nhất + phục vụ qua CDN (trang tĩnh)
export const dynamic = "force-static";

// SSR — render mỗi request, cá nhân hoá theo user (dữ liệu luôn mới)
export const dynamic = "force-dynamic";

// ISR — tĩnh nhưng tự làm mới định kỳ (vừa nhanh vừa cập nhật)
export const revalidate = 60; // giây

// CSR — component "use client" cho phần tương tác trong trình duyệt
// RSC + PPR — kết hợp tĩnh + động trên cùng một trang (shell tĩnh, nội dung động stream sau)
```

Cây quyết định dưới đây giúp chọn chế độ render phù hợp theo yêu cầu của từng trang:

```mermaid
flowchart TD
  Start["Trang này cần gì?"]
  Start --> Q1{"Nội dung ít đổi,<br/>ưu tiên tốc độ + SEO?"}
  Q1 -->|"Có"| SSG["SSG (force-static)<br/>build sẵn, phục vụ qua CDN"]
  Q1 -->|"Không"| Q2{"Dữ liệu riêng theo user,<br/>luôn phải mới?"}
  Q2 -->|"Có"| SSR["SSR (force-dynamic)<br/>render mỗi request"]
  Q2 -->|"Không"| Q3{"Tĩnh nhưng cần<br/>cập nhật định kỳ?"}
  Q3 -->|"Có"| ISR["ISR (revalidate = 60)<br/>vừa nhanh vừa tươi"]
  Q3 -->|"Không"| CSR["CSR / use client<br/>cho phần tương tác"]
```

:::tip[Dùng thực tế]

- **Landing / marketing** → **SSG**: nội dung ít đổi, ưu tiên tốc độ và SEO.
- **Trang cá nhân / dashboard** → **SSR**: dữ liệu phải mới và riêng cho từng user.
- **E-commerce (trang sản phẩm)** → **ISR**: tĩnh để nhanh, làm mới định kỳ để cập nhật giá/tồn kho.
- **Phần tương tác (form, counter, filter)** → **CSR** (`"use client"`); **PPR** cho shell tĩnh + nội dung động stream sau.

:::

---

## Server Components (default)

Mặc định trong App Router — mọi component là **Server Component**:

```tsx
// app/page.tsx — Server Component (no "use client")
import { db } from "@/lib/db";

export default async function HomePage() {
  const users = await db.user.findMany(); // chạy server
  return (
    <ul>
      {users.map(u => <li key={u.id}>{u.name}</li>)}
    </ul>
  );
}
```

Đặc điểm:

- **Async function** — `await` data fetching.
- **Không có hook** (useState, useEffect, useContext, useRef).
- **Không có event handler** (onClick, onChange).
- **Không có browser API** (window, document, localStorage).
- **Có thể đọc**: DB, file system, env var, Node API.

→ Render trên server, không vào client bundle.

---

## Client Components ("use client")

Đánh dấu **`"use client"`** ở **đầu file**:

```tsx
// app/components/Counter.tsx
"use client";

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

Đặc điểm:

- **Có hook** (useState, useEffect, useContext...).
- **Có event handler**.
- **Truy cập browser API**.
- **Không có** `await` top-level (trừ trong async function).
- **Không truy cập** DB, secret env trực tiếp.

→ Render hybrid: SSR cho HTML initial + hydrate JS bundle client.

:::info[Phân tích]

**`"use client"` đánh dấu boundary**, không phải component đó chỉ render
client:

- Server pre-render HTML lần đầu (SSR).
- Bundle JS gửi về client.
- Client hydrate: gắn event, state, effect.
- Sau đó interactive.

Component được import từ Client Component → cũng là Client (kế thừa).

```tsx
// Counter.tsx có "use client"
// Sub.tsx KHÔNG cần "use client" — vẫn được coi là client
function Sub() {
  return <div>Sub</div>;
}
```

`"use client"` chỉ cần ở **file gốc của boundary** — child tự thừa kế.

:::

---

## Composition

**Server Component có thể wrap Client Component**:

```tsx
// app/page.tsx (Server)
import Counter from "./Counter";

async function HomePage() {
  const data = await fetchData(); // server-side
  return (
    <div>
      <h1>{data.title}</h1>
      <Counter />  {/* Client */}
    </div>
  );
}
```

**Client Component pass children là Server Component qua prop**:

```tsx
// app/page.tsx (Server)
import { ClientWrapper } from "./ClientWrapper";

async function HomePage() {
  const user = await fetchUser();
  return (
    <ClientWrapper>
      <UserCard user={user} /> {/* Server render bên trong wrapper */}
    </ClientWrapper>
  );
}
```

```tsx
// ClientWrapper.tsx
"use client";

export function ClientWrapper({ children }) {
  const [isOpen, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(o => !o)}>Toggle</button>
      {isOpen && children} {/* children là Server, đã render từ server */}
    </div>
  );
}
```

Pattern này gọi là **"Server in Client"** — children được render server,
pass qua như slot.

:::tip[Mẹo]

**Pattern khi cần Server data trong Client tree**:

```tsx
// SAI — Client import Server component
"use client";
import ServerComp from "./ServerComp"; // ServerComp dùng DB

export function ClientWrapper() {
  return <ServerComp />; // sẽ build error
}

// ĐÚNG — Server pass element xuống Client
// page.tsx (Server)
function Page() {
  return (
    <ClientWrapper serverContent={<ServerComp />} />
  );
}
```

Pass JSX element làm prop — element được render server side, Client chỉ
quyết định **đặt ở đâu**.

:::

---

## Khi nào dùng cái nào?

| Need | Component |
|------|-----------|
| Fetch data từ DB/API | **Server** |
| Read secret env (`API_KEY`) | **Server** |
| SEO content | **Server** |
| Component tĩnh không interaction | **Server** |
| `useState`, `useEffect` | **Client** |
| Event handler (onClick) | **Client** |
| Browser API (localStorage, window) | **Client** |
| Animation, gesture | **Client** |
| Form interactive | **Client** (action có thể server) |

**Quy tắc thực dụng**:

- **Default Server**.
- Convert sang Client **chỉ khi cần** hook/event.
- Push `"use client"` **càng sâu trong tree càng tốt** — leaf component
  thôi.

```tsx
// Tệ — toàn page là Client (mất Server benefit)
"use client";
function Page() {
  const [filter, setFilter] = useState("");
  return (
    <>
      <Header />
      <Filter value={filter} onChange={setFilter} />
      <ProductList filter={filter} />
    </>
  );
}

// Tốt — chỉ Filter là Client
function Page() {
  return (
    <>
      <Header />
      <ProductsSection /> {/* Server, fetch data */}
    </>
  );
}

async function ProductsSection() {
  const products = await fetchProducts();
  return <ProductListInteractive products={products} />;
}

"use client";
function ProductListInteractive({ products }) {
  const [filter, setFilter] = useState("");
  return <>{/* ... */}</>;
}
```

---

## "use server" directive

`"use server"` đánh dấu **Server Action** — function chạy server, gọi
từ client:

```ts
// app/actions.ts
"use server";

export async function createPost(formData: FormData) {
  await db.post.create({
    data: { title: formData.get("title") as string },
  });
}
```

Hoặc inline trong component:

```tsx
"use client";

export default function Form() {
  async function action(formData) {
    "use server"; // function này chạy server
    await db.post.create({ data: { title: formData.get("title") } });
  }

  return (
    <form action={action}>
      <input name="title" />
      <button>Save</button>
    </form>
  );
}
```

:::warning[Cần lưu ý]

**Phân biệt 3 directive:**

| Directive | Vị trí | Ý nghĩa |
|-----------|--------|---------|
| `"use client"` | Đầu file | File này + dependency = Client Component |
| `"use server"` | Đầu file | File chứa Server Actions |
| `"use server"` | Trong function | Function này là Server Action |

`"use client"` và `"use server"` **không đối lập** — đánh dấu boundary
khác nhau.

Đừng:

```tsx
// SAI
"use client";
"use server"; // không có ý nghĩa trộn lẫn
```

Server Component **không có directive** — đó là default.

:::

:::info[Phân tích]

**Network payload Server Component vs Client Component**:

Server Component build sinh ra **RSC payload** (JSON-like):

```
M1:{"id":"_ssr_components/Header.js"}
...
[children, props for Header]
```

Client browser nhận:

- **HTML** (initial paint, SEO).
- **RSC payload** (subsequent navigation).
- **JS bundle** (Client Components hydrate).

Server Component update qua RSC payload **không cần ship JS** — chỉ data.
Nhỏ hơn nhiều so với ship cả component code.

→ Lý do bundle Next.js App Router thường **nhỏ hơn** Pages Router cùng
feature.

:::

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi đối chiếu lại với nội dung phía trên.

1. Trong App Router, một component không có directive nào thì mặc định là loại gì, và điều đó ảnh hưởng thế nào tới lượng JS gửi xuống trình duyệt?
2. Kể ra những thứ `Server Component` KHÔNG làm được (hook, event handler, browser API) và giải thích vì sao lại có giới hạn đó.
3. `"use client"` thực chất đánh dấu điều gì — component đó chỉ chạy trong trình duyệt, hay nó là ranh giới của một nhánh trong cây component?
4. Một `Client Component` có được server render HTML lần đầu không? Mô tả các bước từ HTML đầu tiên tới lúc trang tương tác được (`hydration`).
5. File A có `"use client"` và import file B (B không khai báo gì) — B là Server hay Client? Giải thích cơ chế kế thừa boundary.
6. So sánh `SSG`, `SSR`, `ISR` và `CSR`: mỗi chế độ đánh đổi gì giữa tốc độ, `SEO` và độ tươi của dữ liệu?
7. `export const dynamic = "force-static"`, `"force-dynamic"` và `export const revalidate` khác nhau ra sao? Cho ví dụ trang nên dùng từng loại.
8. Với trang chi tiết sản phẩm e-commerce (giá và tồn kho đổi liên tục nhưng vẫn cần `SEO`), bạn chọn chế độ render nào và lập luận thế nào?
9. Vì sao `Client Component` không import trực tiếp được `Server Component`? Cách đúng để đặt một `Server Component` bên trong cây Client là gì?
10. Giải thích pattern "Server in Client" — truyền qua `children` hoặc JSX element làm prop. Lúc đó phần Server được render ở đâu và khi nào?
11. Props truyền từ Server sang Client phải thoả điều kiện gì? Chuyện gì xảy ra nếu bạn truyền một function làm prop?
12. Vì sao nên đẩy `"use client"` xuống càng sâu (component lá) càng tốt? Nếu đặt ngay đầu `page.tsx` thì bạn mất những lợi ích nào?
13. Phân biệt ba directive: `"use client"` đầu file, `"use server"` đầu file, và `"use server"` bên trong function. Chúng có đối lập nhau không?
14. `Server Action` là gì, khác `route handler` (`API route`) ở điểm nào, và khi nào bạn chọn cái nào?
15. `RSC payload` là gì? Nó khác HTML và khác JS bundle ra sao, và được dùng ở lần tải đầu hay lúc điều hướng sau đó?
16. Vì sao bundle của App Router thường nhỏ hơn Pages Router với cùng tính năng?
17. Bạn cần `useState` cho phần lọc, nhưng dữ liệu lại lấy từ DB bằng secret key — thiết kế cây component thế nào cho đúng?
18. Một thư viện UI bên thứ ba dùng hook nhưng không khai báo `"use client"`, import vào Server Component thì lỗi. Bạn xử lý ra sao?
19. `Context Provider` (theme, auth, react-query) nên đặt ở đâu trong App Router để không biến cả cây thành Client?
20. Làm sao đảm bảo code chứa secret không vô tình lọt vào client bundle? Nêu vai trò của `server-only` và quy ước `NEXT_PUBLIC_`.
