---
sidebar_position: 10
title: "10. Câu hỏi bổ sung"
---

# Câu hỏi bổ sung (ngoài bộ 66 câu)

> *Đây là các câu phỏng vấn giá trị không nằm trong bộ 66 câu chuẩn nhưng rất hay được hỏi. Nắm chắc chúng giúp bạn xử lý gọn những câu "đào sâu" mà interviewer dùng để phân loại ứng viên.*

:::note[Ghi nhớ nhanh]

- ⭐ **Hydration = React "thổi sự sống" vào HTML tĩnh** — client render lại component tree, adopt DOM có sẵn rồi gắn event listener & state; đạt TTI. Server Component không cần hydrate.
- **Client render phải khớp HTML server** — React giả định HTML là kết quả render; lệch nhau gây hydration mismatch, React phải vứt DOM và render lại từ đầu, mất lợi ích SSR.
- **"Uncanny valley" giữa FCP và TTI** — user thấy trang nhưng click chưa phản hồi; bundle JS càng lớn khoảng này càng dài → lý do đẩy mạnh Server Components.

:::

---

## Câu B1: Hydration là gì? `[Basic]`

### Câu hỏi

> Hydration là gì? Tại sao cần hydration sau khi server đã render HTML, và vì sao JS bundle phải render ra kết quả khớp với HTML đó?

### Giải thích lý thuyết

HTML mà SSR/SSG gửi về chỉ là **markup tĩnh** — user nhìn thấy nội dung nhưng **chưa tương tác được**: button không có onClick, form không có handler, state chưa tồn tại.

**Hydration** là quá trình React trên client "thổi sự sống" vào HTML tĩnh đó:

1. Browser hiển thị HTML server gửi về (user thấy content — FCP).
2. JS bundle tải về và thực thi.
3. React chạy lại render trên client để **dựng lại component tree** (Fiber tree) trong memory.
4. React **đối chiếu** tree này với DOM có sẵn — thay vì tạo DOM mới, nó **adopt (nhận nuôi)** các DOM node hiện có.
5. React **gắn event listener** (onClick, onChange...) và khởi tạo state, effect.
6. Từ thời điểm này, page trở thành React app đầy đủ — **TTI (Time to Interactive)** đạt được.

Trong Next.js, lệnh thực hiện việc này là `hydrateRoot(domNode, <App/>)` (framework gọi hộ bạn).

**Tại sao client render phải khớp HTML server?** Vì hydration được thiết kế để **không render lại DOM** — React *giả định* HTML có sẵn chính là kết quả render của component tree, nên nó chỉ "ướm" tree lên DOM và gắn listener. Nếu hai bên lệch nhau, React không biết gắn listener vào đâu cho đúng → **hydration mismatch** (chi tiết ở Câu B2), và React phải vứt DOM server đi, render lại từ đầu trên client — mất toàn bộ lợi ích SSR.

**Khoảng trống cần biết — "uncanny valley":** giữa lúc user *thấy* trang (FCP) và lúc trang *tương tác được* (TTI), click vào button sẽ không có phản hồi. Bundle JS càng lớn, khoảng này càng dài. Đây là lý do Next.js đẩy mạnh Server Components: code của Server Component **không gửi xuống client và không cần hydrate** — chỉ Client Component (`"use client"`) mới phải hydrate, giúp thu nhỏ chi phí này.

### Code minh hoạ

```tsx
// app/products/[id]/page.tsx — Server Component: KHÔNG cần hydrate
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await fetchProduct(id);

  return (
    <main>
      {/* Phần này là HTML thuần sau khi render — không gửi JS xuống client */}
      <h1>{product.name}</h1>
      <p>{product.description}</p>

      {/* Chỉ island này cần hydrate */}
      <AddToCartButton productId={product.id} />
    </main>
  );
}

// app/products/[id]/AddToCartButton.tsx — Client Component: CẦN hydrate
"use client";
import { useState } from "react";

export default function AddToCartButton({ productId }: { productId: string }) {
  const [adding, setAdding] = useState(false);

  // Trước hydration: button HIỂN THỊ nhưng click KHÔNG có tác dụng
  // Sau hydration: React gắn onClick + khởi tạo state → tương tác được
  async function handleClick() {
    setAdding(true);
    await fetch("/api/cart", {
      method: "POST",
      body: JSON.stringify({ productId }),
    });
    setAdding(false);
  }

  return (
    <button onClick={handleClick} disabled={adding}>
      {adding ? "Đang thêm..." : "Thêm vào giỏ"}
    </button>
  );
}

// Bản chất hydration (React làm ngầm trong Next.js):
//
// import { hydrateRoot } from "react-dom/client";
// hydrateRoot(document, <App />);
// // ≠ createRoot().render(): KHÔNG tạo DOM mới,
// // mà ADOPT DOM có sẵn + gắn event listener lên đó.
//
// Timeline:
// t=0ms   : HTML hiển thị (FCP) — thấy button nhưng click vô dụng
// t=400ms : JS bundle tải xong, React hydrate
// t=450ms : Event listener gắn xong (TTI) — page tương tác được
```

### Đáp án mẫu

> "Hydration là quá trình biến HTML tĩnh mà server gửi về thành React app tương tác được. SSR cho user *thấy* nội dung sớm, nhưng HTML đó chưa có event listener hay state. Khi JS bundle tải xong, React render lại component tree trên client, đối chiếu với DOM có sẵn, rồi **adopt** các DOM node đó thay vì tạo mới — sau đó gắn onClick, onChange và khởi tạo state. Xong bước này page mới đạt TTI. Client render phải khớp HTML server vì React giả định DOM có sẵn chính là output của tree — nó chỉ 'ướm' lên và gắn listener; lệch nhau là hydration mismatch, React phải vứt DOM đi render lại từ đầu, mất sạch lợi ích SSR. Một insight em hay nói thêm: giữa FCP và TTI có khoảng 'thấy mà chưa bấm được' — bundle càng to khoảng này càng dài. Server Components giải quyết đúng chỗ đó: chỉ Client Component mới cần ship JS và hydrate, phần còn lại là HTML thuần."

---

## Câu B2: Hydration mismatch là gì? Nguyên nhân thường gặp? `[Intermediate]`

### Câu hỏi

> Hydration mismatch là gì? Kể các nguyên nhân thường gặp và cách fix cho từng trường hợp.

### Giải thích lý thuyết

**Hydration mismatch** xảy ra khi **HTML server render ≠ kết quả render lần đầu trên client**. React khi hydrate kỳ vọng hai bên giống hệt nhau; lệch nhau thì React log error (`Hydration failed...`) và phải **vứt bỏ DOM server, render lại toàn bộ từ client** — chậm hơn, có thể gây nháy UI, và làm SSR trở nên vô nghĩa cho phần đó.

**Nguyên nhân thường gặp:**

| Nguyên nhân | Vì sao mismatch |
| ----------- | --------------- |
| `Date.now()`, `new Date().toLocaleString()` | Thời điểm render server ≠ client; timezone/locale khác nhau |
| `Math.random()`, `crypto.randomUUID()` | Mỗi lần chạy ra giá trị khác — server một giá trị, client một giá trị |
| Đọc `window`, `localStorage` trong render | Server không có browser API → render nhánh khác client |
| HTML không hợp lệ (`<p>` lồng `<div>`, `<p>` lồng `<p>`) | Browser tự "sửa" HTML sai khi parse → DOM thực tế khác HTML server gửi |
| Browser extension (Grammarly, ad blocker...) | Chèn element vào DOM **trước khi** React hydrate — không phải bug code |

**Cách fix theo từng trường hợp:**

1. **`useEffect` + state** — pattern phổ biến nhất: render lần đầu giống server (giá trị placeholder), rồi cập nhật giá trị client-only **sau khi hydrate** trong `useEffect`. Hai bên khớp nhau ở lần render đầu → không mismatch.
2. **`suppressHydrationWarning`** — đặt trên element mà nội dung *chắc chắn và chấp nhận được* là khác nhau (đồng hồ, timestamp). Chỉ áp dụng cho element đó, **không lan xuống children** — và không nên lạm dụng vì nó che luôn bug thật.
3. **`dynamic(..., { ssr: false })`** — với component phụ thuộc nặng vào browser API (chart, map, editor): bỏ hẳn SSR cho component đó, chỉ render ở client.
4. **Sửa HTML cho hợp lệ** — không lồng block element trong `<p>`, kiểm tra component UI library render ra thẻ gì.
5. **Extension** — test ở chế độ incognito để xác nhận; nếu đúng do extension thì không phải lỗi code.

**Insight:** đừng fix bằng `typeof window !== "undefined" ? A : B` ngay trong render — đó chính là *nguyên nhân* mismatch chứ không phải cách fix, vì server đi nhánh B còn client lần đầu đi nhánh A.

### Code minh hoạ

```tsx
"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// ❌ Mismatch: server render giờ UTC, client render giờ local
function BadClock() {
  return <span>{new Date().toLocaleTimeString()}</span>;
}

// ❌ Mismatch: server không có window → đi nhánh else, client đi nhánh if
function BadTheme() {
  const theme =
    typeof window !== "undefined" ? localStorage.getItem("theme") : "light";
  return <div data-theme={theme}>...</div>;
}

// ✅ Fix 1: useEffect — lần render đầu khớp server, cập nhật sau khi hydrate
function GoodClock() {
  const [time, setTime] = useState<string | null>(null); // server + client lần 1: null

  useEffect(() => {
    // Chỉ chạy trên client, SAU khi hydrate xong → an toàn
    setTime(new Date().toLocaleTimeString());
  }, []);

  return <span>{time ?? "--:--:--"}</span>;
}

// ✅ Fix 2: suppressHydrationWarning — chấp nhận khác biệt ở ĐÚNG element này
function StampedTime({ iso }: { iso: string }) {
  return (
    <time dateTime={iso} suppressHydrationWarning>
      {new Date(iso).toLocaleString()} {/* locale user có thể khác server */}
    </time>
  );
}

// ✅ Fix 3: dynamic ssr:false — component phụ thuộc browser API, bỏ SSR luôn
const MapWidget = dynamic(() => import("./MapWidget"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

// ❌ Mismatch do HTML không hợp lệ: browser tự tách <div> ra khỏi <p>
function BadMarkup() {
  return (
    <p>
      Mô tả: <div>chi tiết</div> {/* <div> trong <p> — DOM bị browser sửa lại */}
    </p>
  );
}

// ✅ Fix 4: dùng markup hợp lệ
function GoodMarkup() {
  return (
    <div>
      Mô tả: <div>chi tiết</div>
    </div>
  );
}
```

### Đáp án mẫu

> "Hydration mismatch là khi HTML server render khác với kết quả render lần đầu trên client — React phát hiện lệch, log error và phải vứt DOM server đi để render lại từ client, vừa chậm vừa mất lợi ích SSR. Nguyên nhân top đầu em gặp: `Date`/`Math.random` ra giá trị khác nhau giữa hai lần chạy; đọc `window` hay `localStorage` ngay trong render khiến server đi nhánh khác; HTML không hợp lệ như `<div>` trong `<p>` bị browser tự sửa; và browser extension chèn DOM trước khi hydrate. Cách fix tuỳ case: với giá trị client-only thì render placeholder trước rồi set giá trị trong `useEffect` để lần render đầu khớp server; với element chấp nhận khác biệt như đồng hồ thì `suppressHydrationWarning` — dùng tiết kiệm; với component nặng browser API như map, chart thì `dynamic` với `ssr: false`. Còn nghi ngờ extension thì em test incognito để loại trừ. Điều em tránh nhất là `typeof window` ternary trong render — nó chính là nguồn mismatch chứ không phải cách fix."

---

## Câu B3: React `cache()` trong Next.js là gì? `[Advanced]`

### Câu hỏi

> Em query database bằng Prisma trong nhiều Server Component khác nhau trên cùng một trang. Làm sao tránh query trùng lặp? React `cache()` giải quyết việc này như thế nào, và nó khác gì với fetch memoization?

### Giải thích lý thuyết

`cache()` là API của **React** (không phải Next.js), dùng để **memoize kết quả của một function trong 1 render pass** trên server.

Vấn đề nó giải quyết:
- `fetch()` được Next.js tự động memoize trong cùng render pass — nhưng **chỉ áp dụng cho fetch**.
- DB query qua Prisma/Drizzle, gọi SDK, đọc file... **không phải fetch** → không được dedupe tự động.
- Nếu `Layout`, `Page`, `generateMetadata` cùng cần `getUser(id)` → 3 query DB trùng lặp.

Cơ chế:
- Wrap function bằng `cache()` → tạo memoized version.
- Trong **cùng 1 render pass** (1 server request), gọi nhiều lần với **cùng arguments** → chỉ chạy 1 lần, các lần sau trả kết quả đã memo.
- Cache key dựa trên **reference của function + arguments** (so sánh shallow, object arguments phải cùng reference mới hit).
- Hết render pass → cache bị xoá. **Không persist** qua request.

So sánh với các cơ chế cache khác:

| Cơ chế               | Áp dụng cho            | Thời gian sống       | Persist qua request? |
| -------------------- | ---------------------- | -------------------- | -------------------- |
| `fetch` memoization  | Chỉ `fetch()`          | 1 render pass        | Không                |
| React `cache()`      | Mọi function (DB, ORM) | 1 render pass        | Không                |
| `unstable_cache` / `'use cache'` | Mọi function | Theo revalidate      | Có (Data Cache)      |
| Data Cache (`fetch`) | `fetch()` có cache     | Theo revalidate      | Có                   |

Pitfalls:
- Khai báo `cache()` **ngoài component** (module scope). Khai báo trong component → mỗi render tạo function mới → không bao giờ hit cache.
- Object arguments: `getUser({ id: 1 })` gọi 2 lần với 2 object literal khác nhau → **miss cache** vì khác reference. Truyền primitive (`getUser(1)`) an toàn hơn.
- Chỉ hoạt động trên server (Server Component, Server Action). Trong Client Component nó không có tác dụng memo theo request.
- Đừng nhầm với `unstable_cache`/`'use cache'` — hai cái đó là **Data Cache** persist qua request, còn `cache()` chỉ sống trong 1 request.

### Code minh hoạ

```typescript
// lib/data/user.ts
import { cache } from "react";
import { db } from "@/lib/db";

// ✅ Khai báo ở module scope — share memo giữa các component
export const getUser = cache(async (id: string) => {
  console.log("DB query chạy"); // Log này chỉ in 1 lần / request
  return db.user.findUnique({ where: { id } });
});

// app/users/[id]/layout.tsx
export default async function Layout({ params, children }) {
  const { id } = await params;
  const user = await getUser(id); // Query DB lần đầu
  return (
    <div>
      <Breadcrumb name={user?.name} />
      {children}
    </div>
  );
}

// app/users/[id]/page.tsx
export default async function Page({ params }) {
  const { id } = await params;
  const user = await getUser(id); // Hit memo — KHÔNG query DB lại
  return <Profile user={user} />;
}

// app/users/[id]/page.tsx — generateMetadata cũng dedupe
export async function generateMetadata({ params }) {
  const { id } = await params;
  const user = await getUser(id); // Vẫn hit memo trong cùng request
  return { title: user?.name };
}

// ❌ Sai: object argument khác reference → miss cache
export const getUserBad = cache(async (opts: { id: string }) => {
  return db.user.findUnique({ where: { id: opts.id } });
});
await getUserBad({ id: "1" }); // chạy query
await getUserBad({ id: "1" }); // object mới → MISS, query lại!

// Khác với 'use cache' (Next 15 canary) — persist qua request
// async function getProducts() {
//   "use cache";
//   return db.product.findMany();
// }
```

### Đáp án mẫu

> "React `cache()` memoize kết quả function trong **1 render pass** trên server. Nó giải quyết bài toán mà fetch memoization không cover: Next.js chỉ tự dedupe `fetch()`, còn DB query qua Prisma hay ORM thì không. Khi `Layout`, `Page` và `generateMetadata` cùng cần `getUser(id)`, nếu không có `cache()` thì query DB chạy 3 lần — wrap bằng `cache()` thì chỉ chạy 1 lần, các lần sau trả kết quả memo. Quan trọng là nó **không persist qua request** — hết render pass là cache xoá, nên không có vấn đề stale data. Em phân biệt rõ với `unstable_cache` hay `'use cache'` — hai cái đó ghi vào Data Cache, sống qua nhiều request và cần revalidate. Pitfall em hay nhắc: phải khai báo `cache()` ở module scope, và tránh truyền object literal làm argument vì cache key so sánh theo reference."

---

## Câu B4: `force-cache` và `no-store` khác nhau thế nào? `[Basic]`

### Câu hỏi

> Giải thích sự khác nhau giữa `cache: 'force-cache'` và `cache: 'no-store'` khi gọi fetch. Hai option này ảnh hưởng thế nào đến việc route được render static hay dynamic?

### Giải thích lý thuyết

Đây là 2 đầu đối lập của trục caching:

| Tiêu chí               | `force-cache`                              | `no-store`                                  |
| ---------------------- | ------------------------------------------ | ------------------------------------------- |
| Hành vi                | Lưu response vào **Data Cache** vĩnh viễn  | **Bỏ qua cache**, gọi origin mỗi request    |
| Lần fetch sau          | Trả từ cache (cache HIT)                   | Luôn gọi network (cache MISS chủ động)      |
| Cách làm mới data      | `revalidate` time-based hoặc on-demand     | Tự nhiên fresh mỗi request                  |
| Ảnh hưởng rendering    | Route có thể **static** (prerender)        | Route thành **dynamic** (render mỗi request)|
| Phù hợp với            | Data ít đổi: categories, config, blog post | Data per-user/realtime: giỏ hàng, dashboard |

Cơ chế quan trọng:
- `force-cache`: lần đầu fetch → lưu vào Data Cache → mọi request sau (của mọi user) đọc từ cache. Data chỉ đổi khi `revalidatePath`/`revalidateTag` hoặc redeploy (tuỳ cấu hình).
- `no-store`: opt-out hoàn toàn. Quan trọng: **một fetch `no-store` làm cả route segment thành dynamic** — Next.js không thể prerender HTML vì data phải fresh mỗi request. Tức là 1 dòng fetch có thể đổi behavior của cả trang.
- Request Memoization vẫn áp dụng cho cả hai trong cùng 1 render pass (dedupe trong 1 request vẫn xảy ra với GET).

Bối cảnh version:
- Next 14: không ghi gì = `force-cache`.
- Next 15: không ghi gì = không cache (gần như `no-store`, nhưng không ép route thành dynamic một cách tường minh như `no-store`). Vì vậy ở Next 15, viết explicit option giúp code tự document ý đồ.

Pitfall phỏng vấn: nhiều người nghĩ `no-store` chỉ ảnh hưởng 1 fetch — thực tế nó **lan ra cả route** (static → dynamic), kéo theo mất Full Route Cache, TTFB tăng.

### Code minh hoạ

```typescript
// app/blog/page.tsx
// ✅ force-cache: blog list ít đổi → route được prerender static
export default async function BlogPage() {
  const posts = await fetch("https://cms.example.com/posts", {
    cache: "force-cache", // Cache vĩnh viễn trong Data Cache
  }).then((r) => r.json());

  return <PostList posts={posts} />;
}
// Build xong → HTML static, mọi user nhận cùng 1 bản từ CDN

// app/dashboard/page.tsx
// no-store: số liệu realtime → route thành DYNAMIC
export default async function Dashboard() {
  const stats = await fetch("https://api.example.com/stats", {
    cache: "no-store", // Mỗi request gọi API mới
  }).then((r) => r.json());

  return <StatsView stats={stats} />;
}
// Chỉ 1 fetch no-store → CẢ trang render lại mỗi request

// Pattern trộn: phần static + phần dynamic stream qua Suspense
import { Suspense } from "react";

export default function HybridPage() {
  return (
    <>
      <StaticHero />          {/* Prerender được */}
      <Suspense fallback={<Skeleton />}>
        <LiveStats />          {/* Chứa fetch no-store, stream sau */}
      </Suspense>
    </>
  );
}

async function LiveStats() {
  const stats = await fetch("https://api.example.com/stats", {
    cache: "no-store",
  }).then((r) => r.json());
  return <StatsView stats={stats} />;
}

// Middle ground: không cần vĩnh viễn, không cần realtime → revalidate
const news = await fetch("https://api.example.com/news", {
  next: { revalidate: 300 }, // Cache nhưng làm mới mỗi 5 phút
});
```

### Đáp án mẫu

> "`force-cache` lưu response vào Data Cache và dùng lại cho mọi request sau — data chỉ đổi khi revalidate hoặc redeploy. `no-store` thì ngược lại: bỏ qua cache, gọi origin mỗi request. Điểm quan trọng nhất em luôn nhấn mạnh: hai option này **quyết định route static hay dynamic**. Route chỉ toàn `force-cache` thì Next prerender được thành HTML static, serve từ CDN cực nhanh. Nhưng chỉ cần **1 fetch `no-store`** là cả route segment thành dynamic, render lại mỗi request, mất Full Route Cache — một dòng code đổi behavior cả trang. Nên với data realtime em hay cô lập nó vào component riêng wrap `Suspense` để shell vẫn static. Ở Next 15 default là không cache, nên em viết explicit option để code tự nói lên ý đồ; còn case ở giữa — không cần realtime tuyệt đối — em dùng `next.revalidate` thay vì `no-store`."

---

## Câu B5: Route Segment Config là gì? `[Advanced]`

### Câu hỏi

> Em thấy đầu file `page.tsx` có các dòng như `export const dynamic = 'force-dynamic'` hay `export const revalidate = 60`. Route Segment Config gồm những option nào và chúng tương tác với fetch options ra sao?

### Giải thích lý thuyết

Route Segment Config là các **export const đặc biệt** ở đầu `page.tsx` / `layout.tsx` / `route.ts`, dùng để **override behavior của cả segment** thay vì cấu hình từng fetch. Giá trị phải là hằng số phân tích tĩnh được (không tính toán runtime).

**Các option chính:**

| Option           | Giá trị                                            | Tác dụng                                                                 |
| ---------------- | -------------------------------------------------- | ------------------------------------------------------------------------ |
| `dynamic`        | `'auto'` \| `'force-dynamic'` \| `'force-static'` \| `'error'` | Ép chế độ render của segment                                  |
| `revalidate`     | `false` \| `0` \| `number`                          | Thời gian revalidate mặc định cho cả segment                             |
| `fetchCache`     | `'auto'` \| `'force-cache'` \| `'force-no-store'` \| `'default-cache'` \| `'default-no-store'`... | Override cache default của mọi fetch trong segment |
| `runtime`        | `'nodejs'` (default) \| `'edge'`                    | Môi trường thực thi                                                      |
| `dynamicParams`  | `true` (default) \| `false`                         | Slug ngoài `generateStaticParams`: render on-demand hay 404              |

**Chi tiết `dynamic`:**
- `'auto'` (mặc định): Next tự infer — dùng dynamic API (`cookies()`, `headers()`...) hoặc fetch `no-store` thì dynamic.
- `'force-dynamic'`: luôn render mỗi request (tương đương SSR truyền thống).
- `'force-static'`: ép static — `cookies()`/`headers()`/`searchParams` trả giá trị rỗng thay vì làm trang dynamic.
- `'error'`: ép static và **throw lỗi lúc build** nếu có code dùng dynamic API — dùng làm "chốt chặn" cho trang bắt buộc static.

**Chi tiết `revalidate` (segment-level):**
- `false`: cache vô hạn (mặc định cho static).
- `0`: luôn dynamic.
- `number`: ISR cho cả segment.
- **Thứ tự ưu tiên với fetch options**: revalidate **thấp nhất** thắng — segment `revalidate = 3600` nhưng 1 fetch `revalidate: 60` → cả route đi theo nhịp 60s. Ngược lại fetch không khai báo gì sẽ "thừa hưởng" giá trị của segment.

**Chi tiết `fetchCache`:** ít dùng, là "cây gậy lớn" override default của mọi fetch trong segment — hữu ích khi migrate Next 14 → 15 muốn giữ behavior cũ (`fetchCache = 'default-cache'`) mà chưa kịp sửa từng fetch.

Pitfalls:
- Config đặt ở **layout** ảnh hưởng mọi page con — `force-dynamic` ở root layout giết static toàn site.
- `force-static` không làm data per-user "tự đúng" — `cookies()` trả rỗng, dễ tạo bug logic âm thầm thay vì lỗi rõ ràng.
- `runtime = 'edge'` không hỗ trợ đầy đủ Node API (Prisma engine cũ, fs...) — đổi runtime phải kiểm tra dependency.

### Code minh hoạ

```typescript
// app/dashboard/page.tsx
// Trang dashboard per-user: luôn render mỗi request
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const stats = await fetch("https://api.io/stats").then((r) => r.json());
  return <Stats data={stats} />;
}

// app/blog/[slug]/page.tsx
// Trang blog: ISR cả segment + chặn slug lạ
export const revalidate = 3600;       // mặc định cho mọi fetch trong segment
export const dynamicParams = false;   // slug ngoài generateStaticParams → 404

export async function generateStaticParams() {
  const posts = await getAllSlugs();
  return posts.map((slug) => ({ slug }));
}

export default async function Post({ params }) {
  const { slug } = await params;
  // Fetch này không khai báo revalidate → thừa hưởng 3600 từ segment
  const post = await fetch(`https://cms.io/posts/${slug}`).then((r) => r.json());

  // Fetch này khai báo 60 → giá trị THẤP NHẤT thắng,
  // effective revalidate của cả route = 60
  const related = await fetch(`https://cms.io/related/${slug}`, {
    next: { revalidate: 60 },
  }).then((r) => r.json());

  return <Article post={post} related={related} />;
}

// app/pricing/page.tsx
// Chốt chặn: trang pricing BẮT BUỘC static — ai thêm cookies() là build FAIL
export const dynamic = "error";

// app/legacy/layout.tsx
// Migrate Next 14 → 15: giữ default cache cũ cho cả nhánh /legacy
export const fetchCache = "default-cache";

// app/api/geo/route.ts
// Route Handler chạy Edge runtime (gần user, cold start thấp)
export const runtime = "edge";

export async function GET(req: Request) {
  return Response.json({ region: process.env.VERCEL_REGION });
}

// ❌ Pitfall: force-dynamic ở ROOT layout → cả site mất static
// app/layout.tsx
// export const dynamic = "force-dynamic"; // ĐỪNG làm thế nếu không chủ đích
```

### Đáp án mẫu

> "Route Segment Config là các `export const` đặc biệt ở đầu page, layout hoặc route handler để **điều khiển behavior cả segment** thay vì từng fetch. Quan trọng nhất là `dynamic` với 4 giá trị: `auto` để Next tự infer, `force-dynamic` ép render mỗi request, `force-static` ép static — lúc đó `cookies()` trả rỗng — và `error` em rất thích cho trang bắt buộc static vì nó **fail ngay lúc build** nếu ai vô tình thêm dynamic API. Ngoài ra có `revalidate` cấp segment, `fetchCache` override default mọi fetch — tiện khi migrate 14 lên 15 — `runtime` chọn nodejs hay edge, và `dynamicParams` quyết định slug lạ được render on-demand hay 404. Về thứ tự ưu tiên với fetch options: revalidate **thấp nhất thắng** — segment 3600 nhưng một fetch khai báo 60 thì cả route theo nhịp 60 giây. Pitfall em luôn cảnh báo: đặt `force-dynamic` ở layout cao sẽ giết static của mọi trang con."

---

## Câu B6: redirect() và permanentRedirect() khác nhau thế nào? `[Intermediate]`

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

## Câu B7: useRouter() trong next/navigation khác gì so với next/router? `[Intermediate]`

### Câu hỏi

> `useRouter()` import từ `next/navigation` khác gì so với `next/router` cũ? `router.refresh()` làm gì?

### Giải thích lý thuyết

App Router dùng `useRouter` từ **`next/navigation`** — API hoàn toàn khác `next/router` (Pages Router):

| Khía cạnh           | `next/router` (Pages)             | `next/navigation` (App)                    |
| ------------------- | --------------------------------- | ------------------------------------------ |
| `router.push/replace/back` | Có                          | Có (`push`, `replace`, `back`, `forward`)  |
| `router.query`      | Có (params + search params)       | **Bỏ** → dùng `useParams()` + `useSearchParams()` |
| `router.pathname`   | Có                                 | **Bỏ** → dùng `usePathname()`              |
| `router.events`     | Có (`routeChangeStart`...)        | **Bỏ** — theo dõi đổi route bằng `useEffect` trên `usePathname` |
| `router.refresh()`  | Không có                          | **Mới** — refetch RSC payload              |
| `router.prefetch()` | Có                                 | Có                                         |
| Dùng ở đâu          | Mọi component                     | **Chỉ Client Component** (`'use client'`)  |

Triết lý thay đổi: thay vì 1 object router "biết tất cả", App Router **tách thành các hook nhỏ** (`usePathname`, `useSearchParams`, `useParams`) — component chỉ subscribe đúng thứ nó cần → ít re-render thừa hơn.

**`router.refresh()`** — đáng nhớ nhất: gửi request lên server **refetch RSC payload** của route hiện tại, server re-render Server Components với data mới, nhưng **giữ nguyên client state** (`useState`, scroll, focus không mất). Đây là cách "làm tươi" data sau mutation mà không full reload. Không cần gọi nếu mutation dùng Server Action + `revalidatePath` (đã tự refresh).

Pitfall: gọi `useRouter` từ `next/navigation` trong Server Component → error; import nhầm từ `next/router` trong App Router → error "NextRouter was not mounted".

### Code minh hoạ

```tsx
"use client"; // useRouter (next/navigation) CHỈ dùng trong Client Component

import { useRouter } from "next/navigation"; // ⚠️ KHÔNG phải next/router

export function ProductActions({ productId }: { productId: string }) {
  const router = useRouter();

  async function handleDelete() {
    const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
    if (!res.ok) {
      // Hiển thị lỗi thân thiện cho người dùng
      alert("Xoá sản phẩm thất bại, vui lòng thử lại");
      return;
    }

    // refresh(): refetch RSC payload — Server Component re-render với data mới,
    // nhưng client state (useState, scroll) GIỮ NGUYÊN — không full reload
    router.refresh();
  }

  return (
    <div>
      <button onClick={() => router.push(`/products/${productId}/edit`)}>
        Sửa
      </button>
      <button onClick={() => router.replace("/products")}>
        Về danh sách (không thêm history entry)
      </button>
      <button onClick={() => router.back()}>Quay lại</button>
      <button onClick={handleDelete}>Xoá</button>
    </div>
  );
}

// ❌ Pages Router cũ — KHÔNG còn trong next/navigation:
// const router = useRouter();          // từ next/router
// router.query.id                      // → thay bằng useParams()
// router.pathname                      // → thay bằng usePathname()
// router.events.on("routeChangeStart") // → bỏ, không có thay thế trực tiếp

// ✅ App Router — theo dõi route change bằng usePathname + useEffect
"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Chạy mỗi khi pathname đổi — thay cho router.events
    trackPageView(pathname);
  }, [pathname]);

  return null;
}
```

### Đáp án mẫu

> "Trong App Router em import `useRouter` từ `next/navigation`, không phải `next/router` — import nhầm là lỗi runtime ngay. Router mới chỉ còn các method điều hướng: `push`, `replace`, `back`, `forward`, `prefetch`, và thêm `refresh()`. Những thứ cũ như `router.query`, `router.pathname`, `router.events` bị **tách ra thành hook riêng**: `useParams`, `useSearchParams`, `usePathname` — component chỉ subscribe đúng cái cần nên ít re-render hơn. `router.events` bị bỏ hẳn, em thay bằng `useEffect` theo dõi `usePathname`. Method em dùng nhiều nhất là `router.refresh()`: nó refetch RSC payload để Server Component render lại với data mới sau mutation, nhưng **giữ nguyên client state** — không phải full reload. Lưu ý cuối: `useRouter` là hook nên chỉ dùng được trong Client Component có `'use client'`."

---

## Câu B8: usePathname() và useSearchParams() dùng để làm gì? `[Intermediate]`

### Câu hỏi

> `usePathname()` và `useSearchParams()` dùng khi nào? Vì sao `useSearchParams()` hay gây lỗi lúc build, và em update query string trên URL như thế nào?

### Giải thích lý thuyết

Cả hai đều là hook trong `next/navigation`, **chỉ dùng trong Client Component**:

- **`usePathname()`**: trả về pathname hiện tại (ví dụ `/blog/nextjs`) — dùng cho active nav link, analytics, breadcrumb.
- **`useSearchParams()`**: trả về object `URLSearchParams` **read-only** của query string — dùng cho filter, search, pagination state trên URL.

**Pitfall nổi tiếng nhất khi build**: với route được **static render**, query string không tồn tại lúc prerender — component dùng `useSearchParams` phải được bọc trong **`<Suspense>` boundary**. Nếu không, Next báo lỗi build: *"useSearchParams() should be wrapped in a suspense boundary"* và toàn bộ route bị đẩy sang client-side render. Đây là câu hỏi "đã build production thật chưa" kinh điển.

**Pattern update query string**: `useSearchParams` là read-only → muốn đổi query, tạo `URLSearchParams` mới từ giá trị hiện tại, set/delete key, rồi `router.replace(pathname + "?" + params)`. Dùng `replace` thay vì `push` cho filter/search để không spam history. Lưu ý immutability: `new URLSearchParams(searchParams)` tạo bản copy, không mutate object gốc.

Trong Server Component không dùng được 2 hook này — page nhận prop `searchParams` (Next 15: là Promise, phải `await`).

### Code minh hoạ

```tsx
// 1. usePathname — active nav link
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname(); // ví dụ: "/blog/nextjs"
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link href={href} className={isActive ? "text-blue-600 font-bold" : ""}>
      {label}
    </Link>
  );
}

// 2. useSearchParams + pattern update query string
"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function SearchFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams(); // read-only URLSearchParams

  function handleSearch(term: string) {
    // Tạo bản copy — KHÔNG mutate searchParams gốc
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    params.delete("page"); // đổi filter thì reset pagination

    // replace: không thêm history entry — gõ từng ký tự không spam nút Back
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <input
      defaultValue={searchParams.get("q") ?? ""}
      onChange={(e) => handleSearch(e.target.value)}
      placeholder="Tìm sản phẩm..."
    />
  );
}

// 3. Pitfall build: useSearchParams cần Suspense khi static render
// app/products/page.tsx (Server Component)
import { Suspense } from "react";
import { SearchFilter } from "./SearchFilter";

export default function ProductsPage() {
  return (
    <div>
      <h1>Sản phẩm</h1>
      {/* ✅ Bọc Suspense — không thì build báo:
          "useSearchParams() should be wrapped in a suspense boundary" */}
      <Suspense fallback={<div>Đang tải bộ lọc...</div>}>
        <SearchFilter />
      </Suspense>
    </div>
  );
}

// 4. Server Component đọc query string qua prop searchParams (Next 15: Promise)
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const products = await searchProducts(q ?? "");
  return <ProductList products={products} />;
}
```

### Đáp án mẫu

> "`usePathname` trả về pathname hiện tại — em dùng chủ yếu cho active nav link và tracking. `useSearchParams` trả về `URLSearchParams` read-only của query string — em dùng để giữ state filter, search, pagination trên URL, share link được và F5 không mất. Pitfall kinh điển: khi route static render, component dùng `useSearchParams` **phải bọc trong Suspense boundary**, không thì build fail với lỗi 'should be wrapped in a suspense boundary' — em từng dính khi thêm search box vào page static. Pattern update query của em: vì hook là read-only nên tạo `new URLSearchParams(searchParams)` để copy, `set`/`delete` key, rồi `router.replace(pathname + '?' + params)` — dùng `replace` để gõ search không spam history. Còn trong Server Component thì không dùng hook, page nhận prop `searchParams` — Next 15 phải `await` vì nó là Promise."

---

## Câu B9: Image Optimization hoạt động ra sao bên dưới? `[Intermediate]`

### Câu hỏi

> Đào sâu hơn câu trước: khi request một ảnh qua `next/image`, chuyện gì xảy ra phía server? Ảnh external và CDN bên thứ ba xử lý thế nào?

### Giải thích lý thuyết

Cơ chế bên dưới là **on-demand optimization**:

1. Component `<Image>` render ra `<img>` với `src` trỏ tới endpoint nội bộ: `/_next/image?url=<src>&w=<width>&q=<quality>`.
2. Request đầu tiên tới endpoint này: server (dùng **Sharp**) fetch ảnh gốc, resize về width yêu cầu, convert format theo header `Accept` của browser.
3. Kết quả được **cache** vào `<distDir>/cache/images` (self-host) hoặc edge cache (Vercel). Request sau serve thẳng từ cache — chỉ tốn CPU lần đầu. TTL điều khiển bằng `minimumCacheTTL` và header `Cache-Control` của ảnh gốc.

**Ảnh external**: phải whitelist qua `remotePatterns` trong `next.config.ts` — nếu không Next ném lỗi. Đây là biện pháp security: tránh endpoint `/_next/image` bị abuse làm open image proxy (kẻ xấu truyền URL bất kỳ, server bạn tốn CPU/bandwidth optimize hộ).

**Custom loader**: nếu đã có CDN chuyên image (Cloudinary, Imgix, imgproxy), nên offload optimization sang đó — loader chỉ là function build URL, server Next không phải xử lý ảnh nữa. Đặc biệt quan trọng khi self-host nhiều traffic vì Sharp ăn CPU.

**`fill` mode**: khi không biết trước kích thước (ảnh từ CMS, background) — ảnh fill theo parent có `position: relative`, kết hợp `object-fit` qua CSS.

**`placeholder="blur"`**: với ảnh local import tĩnh, Next tự generate `blurDataURL` lúc build; với ảnh external phải tự cung cấp (vd dùng `plaiceholder`). Blur placeholder cải thiện perceived performance rõ rệt.

**Pitfall phỏng vấn hay hỏi**: self-host mà quên cài Sharp (Next 15 đã bundle sẵn nhưng môi trường Docker Alpine có thể thiếu binary) → optimization chậm hoặc fail; `remotePatterns` dùng wildcard quá rộng (`hostname: "**"`) → mở lại lỗ hổng proxy.

### Code minh hoạ

```typescript
// next.config.ts
import type { NextConfig } from "next";

const config: NextConfig = {
  images: {
    // Whitelist ảnh external — bắt buộc, chống abuse endpoint /_next/image
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.example.com",
        pathname: "/uploads/**", // chỉ cho phép path cụ thể
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24, // cache ảnh đã optimize tối thiểu 1 ngày
  },
};
export default config;
```

```tsx
import Image from "next/image";

// Custom loader — offload optimization sang Cloudinary, server Next khỏi xử lý
const cloudinaryLoader = ({ src, width, quality }: {
  src: string; width: number; quality?: number;
}) => `https://res.cloudinary.com/demo/image/upload/w_${width},q_${quality ?? 75},f_auto/${src}`;

export function Avatar({ src }: { src: string }) {
  return <Image loader={cloudinaryLoader} src={src} width={96} height={96} alt="Avatar" />;
}

// fill mode — không biết trước kích thước, parent quyết định
export function CoverImage({ src }: { src: string }) {
  return (
    <div style={{ position: "relative", aspectRatio: "16/9" }}>
      <Image src={src} alt="" fill sizes="100vw" style={{ objectFit: "cover" }} />
    </div>
  );
}

// Blur placeholder — ảnh import tĩnh, Next tự generate blurDataURL lúc build
import hero from "@/public/hero.jpg";
export function Hero() {
  return <Image src={hero} alt="Hero" placeholder="blur" priority />;
}
```

### Đáp án mẫu

> "Bên dưới, `<Image>` render `src` trỏ về endpoint `/_next/image` kèm query `url`, `w`, `q`. Request đầu tiên server dùng Sharp fetch ảnh gốc, resize và convert format theo header Accept của browser, rồi cache kết quả — request sau serve thẳng từ cache nên chỉ tốn CPU lần đầu. Với ảnh external em phải whitelist `remotePatterns`, vừa là config vừa là security — không thì endpoint này thành open proxy, ai cũng truyền URL vào bắt server mình optimize hộ. Nếu dự án đã có CDN image như Cloudinary, em viết custom loader để build URL trỏ thẳng CDN, offload toàn bộ việc xử lý ảnh — quan trọng khi self-host vì Sharp ăn CPU. Với ảnh không biết trước kích thước em dùng `fill` kèm parent relative, và `placeholder='blur'` cho ảnh tĩnh để cải thiện perceived performance — Next tự generate blurDataURL lúc build."

---

## Câu B10: Edge Runtime là gì? `[Intermediate]`

### Câu hỏi

> Edge Runtime trong Next.js là gì? Nó khác gì việc chạy code trên server Node.js bình thường, và có những giới hạn nào?

### Giải thích lý thuyết

**Edge Runtime** là một runtime nhẹ dựa trên **V8 isolates** (cùng công nghệ Cloudflare Workers, Vercel Edge Functions) thay vì process Node.js đầy đủ. Hai đặc tính cốt lõi:

1. **Cold start ~0ms**: V8 isolate khởi tạo trong mili-giây vì không phải boot cả Node process — chỉ là một context JS cách ly trong process có sẵn. Serverless Node thường cold start hàng trăm ms.
2. **Chạy gần user**: code được deploy lên **CDN edge network** — hàng trăm location toàn cầu. Request từ Việt Nam được xử lý ở Singapore thay vì bay sang us-east-1, giảm latency đáng kể cho logic nhẹ như redirect, auth check.

Đổi lại là giới hạn:

- **Chỉ có subset API**: Edge Runtime expose **Web Standard APIs** (`fetch`, `Request`, `Response`, `URL`, `crypto`, `TextEncoder`, Web Streams...) — **không có Node API đầy đủ**: không `fs`, không `net`/TCP socket, không `child_process`, không native addon (`.node` binary).
- **Giới hạn size**: bundle code bị giới hạn (Vercel ~1-4MB tuỳ plan) — không nhét được thư viện nặng.
- **Giới hạn CPU time** trên một số platform — phù hợp logic nhẹ, không phù hợp tính toán nặng.

Trong Next.js, hai nơi dùng Edge Runtime:

- **Middleware** (`middleware.ts`) — mặc định chạy edge.
- Route Handler / Page opt-in qua `export const runtime = "edge"`.

**Pitfall**: nhiều thư viện (Prisma classic, `pg`, `bcrypt`) cần Node API → import vào file edge là build fail hoặc runtime error. Đây là lý do đa số API route thực tế vẫn chạy Node runtime.

### Code minh hoạ

```typescript
// middleware.ts — mặc định chạy Edge Runtime, không cần khai báo
import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Chỉ dùng Web API: cookies, headers, URL — không có fs, net...
  const token = request.cookies.get("session")?.value;

  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    // Redirect ngay tại edge gần user — không round-trip về origin
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*"] };
```

```typescript
// app/api/geo/route.ts — Route Handler opt-in Edge Runtime
export const runtime = "edge"; // 👈 khai báo chạy edge

export async function GET(request: Request) {
  // Web API hoạt động bình thường
  const country = request.headers.get("x-vercel-ip-country") ?? "unknown";

  // ✅ fetch, crypto, TextEncoder... đều OK
  const data = await fetch("https://api.example.com/rates").then((r) => r.json());

  // ❌ Những thứ này KHÔNG chạy được trên edge:
  // import fs from "fs";              → không có filesystem
  // import { Client } from "pg";      → không có TCP socket
  // import bcrypt from "bcrypt";      → native addon

  return Response.json({ country, data });
}
```

### Đáp án mẫu

> "Edge Runtime là runtime nhẹ dựa trên V8 isolates — cùng công nghệ với Cloudflare Workers — thay vì process Node đầy đủ. Hai điểm mạnh: cold start gần như bằng 0 vì isolate khởi tạo trong mili-giây, và code chạy trên CDN edge gần user — request từ Việt Nam xử lý ở Singapore thay vì bay sang Mỹ, latency giảm rõ. Đổi lại nó chỉ có subset API theo Web Standard: `fetch`, `Request`, `Response`, `crypto`, Web Streams — không có Node API như `fs`, TCP socket hay native addon, và bundle bị giới hạn size. Trong Next.js, middleware mặc định chạy edge, còn Route Handler hay Page thì opt-in bằng `export const runtime = 'edge'`. Pitfall em từng dính: import Prisma classic hay `pg` vào file edge là fail ngay vì chúng cần TCP socket — nên logic dính database em thường để Node runtime."
