---
sidebar_position: 8
title: "8. Deployment, Testing & Migration"
---

# Deployment, Testing & Migration

> *Nhóm câu hỏi này kiểm tra khả năng đưa app Next.js ra production thật: deploy lên Vercel hay self-host bằng Docker, viết test cho App Router, và migrate codebase legacy. Đây là phần tách ứng viên "biết code Next" khỏi ứng viên "đã vận hành Next".*

---

## Câu 9: Deploy Next.js lên Vercel và những gì Vercel lo tự động `[Intermediate]`

### Câu hỏi

> Deploy Next.js lên Vercel hoạt động ra sao, và những tính năng nào Vercel xử lý tự động mà nếu self-host bạn phải tự lo?

### Giải thích lý thuyết

Flow deploy trên Vercel rất gọn: **git push → Vercel nhận webhook → chạy `next build` → tự động "tách" output theo từng route**:

- Trang static/SSG → file HTML đẩy lên **CDN edge network** toàn cầu.
- Trang dynamic / Route Handler / Server Action → mỗi route thành **serverless function** (hoặc edge function nếu khai `runtime = "edge"`) — không cần config gì thêm.
- Static asset (`_next/static`, ảnh đã optimize) → CDN với cache header immutable.

Những thứ Vercel **lo tự động** — và là danh sách việc bạn phải tự làm khi self-host:

| Vercel tự lo | Self-host phải tự làm |
| --- | --- |
| CDN toàn cầu + cache ISR **phân tán** (mọi region thấy cùng bản revalidate) | Tự dựng CDN (CloudFront/Cloudflare); ISR cache mặc định nằm trên **filesystem từng instance** → chạy nhiều instance là lệch cache, phải viết `cacheHandler` tuỳ chỉnh trỏ vào Redis |
| Image Optimization có sẵn trên edge | Cài Sharp, lo CPU cho `/_next/image`, hoặc offload sang CDN ảnh qua custom loader |
| Auto-scale theo traffic, scale to zero khi vắng | Tự lo capacity: PM2 cluster, Kubernetes HPA, load balancer |
| Preview deployment cho mỗi PR | Tự dựng môi trường preview (CI + môi trường ephemeral) |
| Cron jobs (`vercel.json`), edge network cho middleware | Tự chạy cron (systemd timer/K8s CronJob); middleware chạy tại origin chứ không gần user |
| Zero-downtime deploy, rollback 1 click | Reverse proxy (nginx) + rolling deploy/blue-green tự dựng |

**Insight phỏng vấn**: Vercel không có "magic" — bản chất là họ vận hành hộ bạn một bộ hạ tầng chuẩn hoá quanh build output của Next. Hiểu danh sách trên giúp bạn trả lời luôn câu "tại sao self-host Next.js lại khó hơn deploy một Express app".

### Code minh hoạ

```jsonc
// vercel.json — những thứ "có sẵn" trên Vercel chỉ cần khai báo
{
  "crons": [
    { "path": "/api/cron/cleanup", "schedule": "0 2 * * *" } // Vercel tự gọi route này
  ]
}
```

```typescript
// next.config.ts — SELF-HOST nhiều instance: phải tự lo chia sẻ ISR cache
import type { NextConfig } from "next";

const config: NextConfig = {
  // Mặc định ISR cache ghi vào .next/cache trên filesystem TỪNG instance
  // → 3 instance sau load balancer là 3 bản cache lệch nhau
  cacheHandler: require.resolve("./cache-handler.mjs"), // custom handler trỏ Redis
  cacheMaxMemorySize: 0, // tắt cache in-memory mặc định khi đã dùng handler ngoài
};
export default config;
```

```javascript
// cache-handler.mjs — khung cacheHandler dùng Redis (rút gọn)
import { createClient } from "redis";

const client = createClient({ url: process.env.REDIS_URL });
await client.connect();

export default class CacheHandler {
  async get(key) {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  }
  async set(key, data, ctx) {
    // Mọi instance đọc/ghi chung Redis → ISR nhất quán như trên Vercel
    await client.set(key, JSON.stringify({ value: data, lastModified: Date.now(), tags: ctx.tags }));
  }
  async revalidateTag(tag) {
    // Xoá các entry mang tag — phục vụ revalidateTag()
  }
}
```

### Đáp án mẫu

> "Trên Vercel, em chỉ cần git push — Vercel chạy `next build` rồi tự tách output: trang static lên CDN, mỗi route dynamic thành một serverless function, route khai `runtime: 'edge'` thành edge function, asset tĩnh lên CDN với cache immutable. Giá trị thật của Vercel là những thứ nó lo tự động: CDN với ISR cache phân tán nhất quán giữa các region, image optimization, auto-scale và scale to zero, preview deployment mỗi PR, cron, rollback một click. Nếu self-host, em phải tự lo hết: nginx làm reverse proxy, CDN riêng, đặc biệt là ISR cache — mặc định ghi filesystem từng instance nên chạy nhiều instance là lệch cache, phải viết `cacheHandler` tuỳ chỉnh trỏ vào Redis; rồi cài Sharp cho image optimizer, PM2 hay Kubernetes để scale và zero-downtime deploy. Nên em hay nói: Vercel không magic, nó chỉ vận hành hộ mình bộ hạ tầng đó."

---

## Câu 42: Self-host bằng Node server và output: 'standalone' `[Advanced]`

### Câu hỏi

> Self-host Next.js bằng Node server như thế nào, và `output: 'standalone'` giải quyết vấn đề gì khi đóng gói deploy?

### Giải thích lý thuyết

Cách self-host cơ bản: chạy `next build` rồi `next start` — Next khởi động một Node server đầy đủ tính năng (SSR, ISR, Image Optimization, Route Handlers...). Nhưng cách "ngây thơ" này có **vấn đề đóng gói**: để `next start` chạy được, bạn phải copy lên server cả `node_modules` — thường **vài trăm MB đến cả GB**, gồm cả devDependencies dùng lúc build (TypeScript, ESLint, Tailwind...) mà runtime không hề cần. Docker image phình to, deploy chậm, attack surface rộng.

**`output: 'standalone'`** giải quyết đúng chỗ đó. Khi build, Next chạy **file tracing** (dựa trên `@vercel/nft`): phân tích import graph để biết chính xác file nào trong `node_modules` được dùng lúc **runtime**, rồi copy CHỈ những file đó vào `.next/standalone` kèm một **`server.js`** tự chứa. Kết quả: copy nguyên thư mục `.next/standalone` sang đâu là `node server.js` chạy được ở đó — không cần `npm install`, không cần cả `next` CLI.

Hai thứ **phải copy thêm thủ công** (Next cố tình không copy vì khuyến nghị để CDN serve):

- `public/` → đặt vào `standalone/public`
- `.next/static` → đặt vào `standalone/.next/static`

Vận hành thực tế:

- Đặt sau **nginx** làm reverse proxy: TLS termination, gzip/brotli, serve static file trực tiếp (đỡ Node), rate limit.
- Quản lý process bằng **PM2** (cluster mode tận dụng multi-core) hoặc **systemd** — tự restart khi crash.
- Biến môi trường: server-side env đọc lúc **runtime** nên đổi env chỉ cần restart; riêng `NEXT_PUBLIC_*` bị **inline lúc build** — đổi là phải build lại, đây là pitfall kinh điển.

### Code minh hoạ

```typescript
// next.config.ts
import type { NextConfig } from "next";

const config: NextConfig = {
  output: "standalone", // build ra .next/standalone tự chứa
};
export default config;
```

```bash
# Build và đóng gói deploy
next build

# .next/standalone đã có server.js + node_modules tối thiểu (file tracing)
# Copy thêm 2 thứ Next không tự copy:
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static

# Trên server: KHÔNG cần npm install, không cần next CLI
PORT=3000 HOSTNAME=0.0.0.0 node .next/standalone/server.js
```

```bash
# PM2 cluster mode — tận dụng multi-core, tự restart khi crash
pm2 start .next/standalone/server.js --name web -i max
```

```nginx
# nginx — reverse proxy trước Node server
server {
  listen 443 ssl;
  server_name example.com;

  # Static file để nginx serve thẳng, đỡ tải cho Node
  location /_next/static/ {
    alias /app/.next/standalone/.next/static/;
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

### Đáp án mẫu

> "Cơ bản nhất là `next build` rồi `next start` — Next tự chạy một Node server đầy đủ SSR, ISR, image optimization. Vấn đề là muốn `next start` chạy thì phải mang theo cả `node_modules` — thường cả GB, gồm cả devDependencies mà runtime không cần. `output: 'standalone'` giải quyết bằng file tracing: lúc build, Next phân tích import graph và copy chỉ những file `node_modules` thực sự dùng ở runtime vào `.next/standalone`, kèm một `server.js` tự chứa — copy thư mục này đi đâu là `node server.js` chạy được, không cần npm install. Em lưu ý phải copy thêm `public/` và `.next/static` vào vì Next không tự copy — khuyến nghị là để CDN/nginx serve. Production em đặt sau nginx để lo TLS và serve static, chạy bằng PM2 cluster mode, và nhớ rằng `NEXT_PUBLIC_*` bị inline lúc build — đổi giá trị là phải build lại."

---

## Câu 43: Dockerfile tối ưu với multi-stage build `[Advanced]`

### Câu hỏi

> Viết Dockerfile cho Next.js production tối ưu ra sao? Tại sao nên dùng multi-stage build với `output: 'standalone'`?

### Giải thích lý thuyết

Dockerfile "ngây thơ" (copy hết source + `npm install` + `next build` + `next start` trong một stage) cho ra image **1GB+**: chứa toàn bộ source, devDependencies, cache build. Multi-stage build + standalone đưa image về **~150MB** nhờ nguyên tắc: **stage cuối chỉ chứa đúng những gì runtime cần**.

Cấu trúc chuẩn **3 stage**:

1. **`deps`** — copy CHỈ `package.json` + lockfile rồi `npm ci`. Tách riêng để tận dụng **Docker layer cache**: chừng nào lockfile chưa đổi, layer cài dependency được cache — sửa source code không phải cài lại deps, build CI nhanh hơn nhiều.
2. **`builder`** — copy `node_modules` từ `deps` + toàn bộ source, chạy `next build`. Với `output: 'standalone'`, output đã được file-tracing gọn sẵn.
3. **`runner`** — từ base `node:20-alpine` sạch, chỉ copy 3 thứ từ `builder`: `.next/standalone`, `.next/static`, `public`. Chạy bằng **user non-root** (`nextjs`), `EXPOSE 3000`, `CMD ["node", "server.js"]`.

Các điểm tối ưu/bảo mật đi kèm:

- **`.dockerignore`**: loại `node_modules`, `.next`, `.git`, `.env*` — vừa build nhanh (context nhỏ) vừa tránh lộ secret vào image.
- **User non-root**: container bị khai thác thì attacker không có quyền root — checklist security chuẩn.
- **`HEALTHCHECK`** (hoặc probe của K8s): orchestrator biết container sống thật chứ không chỉ "process đang chạy".
- `ENV NODE_ENV=production`, `HOSTNAME=0.0.0.0` để server bind đúng interface trong container.

### Code minh hoạ

```dockerfile
# syntax=docker/dockerfile:1

# ---------- Stage 1: deps — chỉ cài dependency, tận dụng layer cache ----------
FROM node:20-alpine AS deps
WORKDIR /app
# Chỉ copy manifest — lockfile chưa đổi thì layer này được cache
COPY package.json package-lock.json ./
RUN npm ci

# ---------- Stage 2: builder — build app ----------
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build   # next.config.ts đã khai output: 'standalone'

# ---------- Stage 3: runner — image cuối chỉ chứa runtime ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# User non-root — container bị khai thác cũng không có quyền root
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Chỉ copy 3 thứ runtime cần — image ~150MB thay vì 1GB+
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
```

```bash
# .dockerignore — build context nhỏ + không lộ secret vào image
node_modules
.next
.git
.env*
Dockerfile
README.md
```

### Đáp án mẫu

> "Em dùng multi-stage 3 tầng. Stage `deps` chỉ copy `package.json` và lockfile rồi `npm ci` — tách riêng để tận dụng layer cache của Docker: sửa source code mà lockfile không đổi thì không phải cài lại dependency, CI build nhanh hơn hẳn. Stage `builder` copy node_modules từ deps cộng source rồi chạy `next build` với `output: 'standalone'`. Stage `runner` từ `node:20-alpine` sạch, chỉ copy đúng ba thứ: thư mục standalone, `.next/static` và `public` — nhờ vậy image từ hơn 1GB xuống còn khoảng 150MB, vì không mang theo source, devDependencies hay cache build. Em chạy bằng user non-root để container bị khai thác cũng không có quyền root, thêm `HEALTHCHECK` cho orchestrator, và `.dockerignore` loại `node_modules`, `.git`, `.env` — vừa build nhanh vừa không lộ secret vào image."

---

## Câu 44: output: 'export' và giới hạn của static export `[Intermediate]`

### Câu hỏi

> `output: 'export'` trong Next.js làm gì, và những tính năng nào KHÔNG dùng được khi static export?

### Giải thích lý thuyết

`output: 'export'` biến `next build` thành **static site generator thuần**: output là thư mục **`out/`** chứa HTML/CSS/JS tĩnh — **không cần Node server**. Host ở bất kỳ đâu serve được file tĩnh: S3 + CloudFront, GitHub Pages, Netlify, nginx, thậm chí mở file local. App vẫn là SPA đầy đủ sau khi load — client navigation, React hoạt động bình thường — chỉ là **không có gì chạy trên server lúc request**.

Vì không có server runtime, mọi tính năng cần server **đều bị loại**:

| Tính năng | Vì sao không dùng được |
| --- | --- |
| **Server Actions** | Cần server nhận POST lúc runtime |
| **Route Handlers động** | Chỉ giữ được `GET` static (kết quả "đóng băng" thành file lúc build) |
| **ISR / `revalidate`** | Không có server để regenerate — content chốt cứng lúc build |
| **Middleware** | Chạy lúc request — không tồn tại request server nào cả |
| **`cookies()` / `headers()`** | Là dữ liệu per-request — build time không có request |
| **Dynamic route không có `generateStaticParams`** | Next không biết phải export những path nào thành file |
| **`next/image` mặc định** | Optimizer là endpoint server `/_next/image` — phải dùng `unoptimized: true` hoặc custom loader trỏ CDN ảnh |

**Khi nào dùng**: landing page, documentation, blog, portfolio — content thuần static, không cần per-request logic. Cần dữ liệu động thì gọi API từ client (CSR) hoặc rebuild khi content đổi (webhook từ CMS → CI). Nếu app cần dù chỉ một trong các thứ ở bảng trên — chọn server deployment, đừng cố "lách".

### Code minh hoạ

```typescript
// next.config.ts
import type { NextConfig } from "next";

const config: NextConfig = {
  output: "export", // next build → ra thư mục out/ thuần static
  images: {
    unoptimized: true, // không có server optimizer — hoặc dùng custom loader trỏ CDN ảnh
  },
  // trailingSlash: true → out/about/index.html, hợp với S3/nginx serve thư mục
  trailingSlash: true,
};
export default config;
```

```tsx
// app/blog/[slug]/page.tsx — dynamic route BẮT BUỘC có generateStaticParams
export async function generateStaticParams() {
  const posts = await fetch("https://cms.example.com/posts").then((r) => r.json());
  // Next export mỗi slug thành một file HTML trong out/blog/<slug>/
  return posts.map((p: { slug: string }) => ({ slug: p.slug }));
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // fetch này chạy LÚC BUILD — kết quả đóng băng vào HTML
  const post = await fetch(`https://cms.example.com/posts/${slug}`).then((r) => r.json());
  return <article><h1>{post.title}</h1></article>;
}

// ❌ Những thứ này build sẽ báo lỗi với output: 'export':
// export const dynamic = "force-dynamic";
// import { cookies } from "next/headers";  → per-request, không có request
// <form action={serverAction}>            → Server Action cần server
```

```bash
next build
# → thư mục out/ — deploy đi đâu cũng được:
aws s3 sync out/ s3://my-bucket --delete   # S3 + CloudFront
# hoặc trỏ nginx root vào out/, hoặc push lên GitHub Pages
```

### Đáp án mẫu

> "`output: 'export'` biến `next build` thành static site generator thuần: ra thư mục `out/` chỉ có HTML/CSS/JS, không cần Node server — host trên S3, GitHub Pages hay nginx đều được. Vì không có server lúc runtime nên mọi thứ cần server đều mất: Server Actions, Route Handler động — chỉ giữ được GET static đóng băng lúc build, ISR và revalidate, middleware, `cookies()`/`headers()` vì là dữ liệu per-request. Dynamic route bắt buộc có `generateStaticParams` để Next biết export những path nào, và `next/image` mặc định cũng không chạy vì optimizer là endpoint server — phải set `unoptimized` hoặc custom loader trỏ CDN ảnh. Em dùng export cho landing page, docs, blog thuần static; còn app cần dữ liệu động thì hoặc gọi API từ client, hoặc webhook CMS trigger rebuild — nếu cần nhiều hơn thế thì em chọn server deployment ngay từ đầu."

---

## Câu 45: Jest + React Testing Library và giới hạn với async Server Components `[Advanced]`

### Câu hỏi

> Set up Jest + React Testing Library cho Next.js như thế nào, và tại sao Jest không test trực tiếp được async Server Components?

### Giải thích lý thuyết

**Setup**: Next.js cung cấp sẵn **`next/jest`** — một transformer config tự lo gần hết phần khó:

- Transform code bằng **SWC** (nhanh, hiểu JSX/TS) với đúng cấu hình babel/SWC mà Next dùng.
- Tự mock CSS Modules, file ảnh, `next/font` — những thứ Jest vốn không hiểu.
- Tự load `.env` và bỏ qua `node_modules`/`.next`.

Mình chỉ cần khai `testEnvironment: "jsdom"` (giả lập DOM cho component test) và `setupFilesAfterEnv` để import `@testing-library/jest-dom`. Với **Client Component** và **Server Component sync** (không async), test bằng RTL như React thường: `render()` → query bằng role/text → assert.

**Vì sao async Server Component không test trực tiếp được?**

1. Async Server Component là **async function trả về `Promise<JSX>`** — `render(<Page />)` của RTL kỳ vọng element đồng bộ; đưa Promise vào là vỡ ("Objects are not valid as a React child" hoặc treo).
2. Nó được thiết kế chạy trong **môi trường server**: fetch data, gọi DB, đọc `cookies()` — **jsdom** là môi trường browser giả lập, không có RSC runtime để "await" component và serialize kết quả.
3. React Testing Library + Jest **chưa hỗ trợ đầy đủ** RSC — đây là giới hạn được chính Next.js docs ghi rõ.

**Workaround thực tế**:

- **Tách logic ra khỏi component**: data fetching/transform đưa vào function thuần → unit test function đó trực tiếp, component chỉ còn lớp mỏng.
- **Gọi component như function**: `render(await Page({ params }))` — chạy được với case đơn giản, nhưng là hack: không có RSC runtime thật, vỡ khi component dùng `cookies()`, Suspense, hay render component async con.
- **Để E2E lo**: khuyến nghị **chính thức của Next.js docs** — dùng E2E (Playwright/Cypress) cho async Server Components vì chỉ môi trường thật mới chạy đúng RSC pipeline.

### Code minh hoạ

```typescript
// jest.config.ts — next/jest tự lo transform SWC, mock CSS/ảnh/font
import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" }); // đọc next.config + .env

const config: Config = {
  testEnvironment: "jsdom", // giả lập DOM cho component test
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
};

export default createJestConfig(config);
```

```typescript
// jest.setup.ts
import "@testing-library/jest-dom";
```

```tsx
// __tests__/counter.test.tsx — Client Component: test bình thường với RTL
import { render, screen, fireEvent } from "@testing-library/react";
import Counter from "@/components/Counter";

test("tăng giá trị khi bấm nút", () => {
  render(<Counter />);
  fireEvent.click(screen.getByRole("button", { name: /tăng/i }));
  expect(screen.getByText("1")).toBeInTheDocument();
});
```

```tsx
// ❌ Async Server Component — render trực tiếp là VỠ
// app/users/page.tsx
export default async function UsersPage() {
  const users = await fetch("https://api.example.com/users").then((r) => r.json());
  return <ul>{users.map((u: any) => <li key={u.id}>{u.name}</li>)}</ul>;
}

// __tests__/users.test.tsx
// render(<UsersPage />)  → ❌ UsersPage() trả Promise<JSX>, jsdom không await được

// Workaround 1 (khuyến nghị): tách logic ra function thuần để unit test
// lib/users.ts
export async function getUsers() { /* fetch + transform */ }
// → test getUsers() trực tiếp, không cần render component

// Workaround 2 (giới hạn): gọi component như async function
test("render danh sách user (hack, case đơn giản)", async () => {
  const ui = await UsersPage(); // await trước, rồi mới render JSX kết quả
  render(ui);
  expect(screen.getByRole("list")).toBeInTheDocument();
});
// ⚠️ Vỡ khi component dùng cookies()/headers(), Suspense, hoặc có async child

// Workaround 3 (chính thức theo Next.js docs): để E2E (Playwright) test — xem câu 46
```

### Đáp án mẫu

> "Setup thì Next cho sẵn `next/jest`: nó tự lo transform bằng SWC đúng config của Next, tự mock CSS Modules, ảnh và `next/font` — em chỉ cần khai `testEnvironment: 'jsdom'` và setup file import `jest-dom`. Client Component và Server Component sync test bằng RTL như React thường. Nhưng async Server Component thì không test trực tiếp được, vì hai lý do: một, nó là async function trả về Promise chứa JSX — `render()` của RTL không await được; hai, nó thiết kế để chạy trong môi trường server với fetch, DB, `cookies()` — jsdom không có RSC runtime để render đúng. Workaround của em: tách data logic ra function thuần để unit test riêng; case đơn giản thì có thể `render(await Page(props))` như gọi function thường nhưng đó là hack, vỡ với Suspense hay `cookies()`. Còn khuyến nghị chính thức trong Next.js docs là để E2E lo phần async Server Components."

---

## Câu 46: Playwright cho E2E testing App Router `[Intermediate]`

### Câu hỏi

> Vì sao Playwright là lựa chọn E2E phù hợp cho Next.js App Router, và setup cơ bản trông như thế nào?

### Giải thích lý thuyết

Lý do cốt lõi: **E2E chạy browser thật nên không quan tâm ranh giới Server/Client Component**. Đây chính là điểm Jest + jsdom bó tay (câu 45): với Playwright, async Server Component, streaming qua `<Suspense>`, Server Actions, middleware redirect, ISR — tất cả chạy qua **đúng pipeline production** (browser gửi request thật → server render thật), nên test phản ánh đúng những gì user thấy. Next.js docs cũng khuyến nghị E2E cho async Server Components.

Setup xoay quanh **`playwright.config.ts`** với 2 mảnh quan trọng:

1. **`webServer`** — Playwright **tự chạy app trước khi test**: production-like thì `next build && next start` (khuyến nghị cho CI, test đúng behavior production gồm cả caching), local dev có thể `next dev` cho nhanh. `reuseExistingServer` để local không phải khởi động lại server đang chạy.
2. **`baseURL`** — test chỉ cần `page.goto("/")` thay vì URL tuyệt đối.

Khả năng debug là điểm ăn tiền của Playwright: **trace** (timeline từng action + DOM snapshot), **screenshot/video khi fail** — trên CI chỉ cần tải artifact về mở `npx playwright show-trace` là thấy chính xác test chết ở đâu. Chạy CI với GitHub Actions chỉ cần cài browser (`npx playwright install --with-deps`) rồi `npx playwright test`.

Pattern test điển hình cho App Router: điền form → submit (Server Action chạy thật trên server) → assert kết quả/redirect — flow này không có cách nào test đúng bằng unit test.

### Code minh hoạ

```typescript
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",       // trace để debug khi fail
    screenshot: "only-on-failure",
  },
  webServer: {
    // Playwright tự build + start app trước khi chạy test — production behavior thật
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI, // local: dùng lại server đang chạy
    timeout: 120_000,
  },
});
```

```typescript
// e2e/signup.spec.ts — test Server Action + streaming end-to-end
import { test, expect } from "@playwright/test";

test("đăng ký thành công qua Server Action", async ({ page }) => {
  await page.goto("/signup");

  // Điền form — chạy trên browser thật
  await page.getByLabel("Email").fill("user@example.com");
  await page.getByLabel("Mật khẩu").fill("secret123");

  // Submit → Server Action chạy THẬT trên server (điều Jest không làm được)
  await page.getByRole("button", { name: "Đăng ký" }).click();

  // Assert kết quả sau redirect
  await expect(page).toHaveURL("/dashboard");
  await expect(page.getByText("Chào mừng user@example.com")).toBeVisible();
});

test("trang dùng Suspense streaming hiện fallback rồi tới content", async ({ page }) => {
  await page.goto("/dashboard");
  // Streaming/RSC chạy qua đúng pipeline production — không cần biết
  // component nào là Server, component nào là Client
  await expect(page.getByRole("heading", { name: "Doanh thu" })).toBeVisible();
});
```

```yaml
# .github/workflows/e2e.yml — chạy E2E trên CI
name: E2E
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test   # webServer tự build + start app
      - uses: actions/upload-artifact@v4
        if: failure()
        with: { name: playwright-report, path: playwright-report/ } # trace + screenshot
```

### Đáp án mẫu

> "Vì E2E chạy browser thật nên nó không cần quan tâm component nào là Server hay Client — async Server Component, streaming qua Suspense, Server Actions, middleware đều chạy qua đúng pipeline production, đúng những gì user thấy. Đây cũng là khuyến nghị chính thức của Next.js docs cho async Server Components mà Jest với jsdom không render được. Setup cơ bản gồm `playwright.config.ts` với hai mảnh: `webServer` để Playwright tự chạy `next build` và `next start` trước khi test — test đúng behavior production gồm cả caching, và `baseURL` để test chỉ cần `page.goto('/')`. Test điển hình của em: điền form, submit để Server Action chạy thật, rồi expect redirect và nội dung sau đó. Khi fail, Playwright tự chụp screenshot và ghi trace — trên CI em upload artifact lên, tải về mở trace viewer là thấy chính xác chết ở bước nào. GitHub Actions chỉ cần cài browser rồi `npx playwright test`."

---

## Câu 47: _app.tsx và _document.tsx — App Router thay bằng gì `[Intermediate]`

### Câu hỏi

> `_app.tsx` và `_document.tsx` trong Pages Router làm gì, và App Router thay thế chúng bằng gì?

### Giải thích lý thuyết

Trong Pages Router, hai file đặc biệt này chia nhau hai tầng:

- **`_app.tsx`** — component wrap **mọi page**. Là nơi duy nhất được import global CSS, đặt layout chung, mount provider (Theme, Redux, React Query...). Chạy cả server lẫn client, re-render khi navigate.
- **`_document.tsx`** — customize **HTML shell**: thẻ `<html>`, `<head>`, `<body>`, attribute `lang`, script bên thứ ba cần đặt sớm. **Chỉ render trên server** (lúc SSR/SSG), không có lifecycle, không có event handler, không chạy lại khi client navigate.

Pitfall kinh điển: đặt logic cần client (useEffect, onClick) vào `_document` → không bao giờ chạy; hoặc nhét provider nặng vào `_app` → mọi page tải theo.

App Router gom cả hai vào **một** file:

| Pages Router | App Router | Ghi chú |
| --- | --- | --- |
| `_document.tsx` (html/head/body) | `app/layout.tsx` (root layout render `<html>`, `<body>`) | Root layout **bắt buộc** có `<html>` và `<body>` |
| `_app.tsx` (provider, global CSS, layout) | `app/layout.tsx` + nested layout | Layout lồng nhau theo segment, không re-render khi navigate |
| `next/head` | **Metadata API** (`export const metadata`, `generateMetadata`) | Type-safe, dedupe tự động, hỗ trợ OG image |
| Layout re-mount mỗi navigation | `template.tsx` nếu **muốn** re-mount (animation, reset state) | Layout mặc định giữ state |

Điểm hay để ghi điểm: root layout là **Server Component**, nên provider client (Theme, React Query) phải tách ra file `providers.tsx` có `"use client"` rồi wrap `{children}` — children vẫn là Server Component được (composition pattern).

### Code minh hoạ

```tsx
// app/layout.tsx — thay thế cả _app lẫn _document
import "./globals.css"; // global CSS — trước đây chỉ được import ở _app
import type { Metadata } from "next";
import { Providers } from "./providers";

// Metadata API — thay cho next/head trong _app/_document
export const metadata: Metadata = {
  title: { default: "My App", template: "%s | My App" },
  description: "Mô tả site",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Phần này trước đây thuộc _document.tsx
    <html lang="vi">
      <body>
        {/* Phần này trước đây thuộc _app.tsx */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

```tsx
// app/providers.tsx — provider client tách riêng
"use client";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  // Tạo QueryClient trong state để không share giữa các request khi SSR
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class">{children}</ThemeProvider>
    </QueryClientProvider>
  );
}
```

```tsx
// app/dashboard/template.tsx — khi MUỐN re-mount mỗi lần navigate
// (layout.tsx giữ state, template.tsx tạo instance mới → chạy lại animation/effect)
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="fade-in">{children}</div>;
}
```

### Đáp án mẫu

> "Trong Pages Router, `_app.tsx` wrap mọi page — là nơi đặt global CSS, layout chung và provider; còn `_document.tsx` customize HTML shell như thẻ `html`, `head`, `body`, và chỉ render trên server, không có lifecycle. Sang App Router, root `layout.tsx` thay thế cả hai: nó render trực tiếp `<html>` và `<body>` (việc của `_document`), đồng thời wrap children bằng provider và import global CSS (việc của `_app`). Khác biệt lớn là layout App Router **không re-render khi navigate** — muốn re-mount thì dùng `template.tsx`. Phần `next/head` được thay bằng Metadata API, type-safe và tự dedupe. Một điểm em hay lưu ý khi migrate: root layout là Server Component, nên provider client phải tách ra file riêng có `'use client'` và nhận children qua composition — như vậy phần còn lại của tree vẫn là Server Component."

---

## Câu 58: Edge Runtime vs Node.js Runtime `[Advanced]`

### Câu hỏi

> Edge Runtime vs Node.js Runtime trong Next.js là gì?

### Giải thích lý thuyết

**Edge Runtime** là runtime nhẹ dựa trên **V8 isolates** (cùng công nghệ Cloudflare Workers, Vercel Edge Functions) thay vì process Node.js đầy đủ. Hai đặc tính cốt lõi: **cold start ~0ms** (isolate khởi tạo trong mili-giây, không phải boot cả Node process) và **chạy gần user** trên CDN edge network — request từ Việt Nam xử lý ở Singapore thay vì bay sang us-east-1. Đổi lại, nó chỉ expose **Web Standard APIs** (`fetch`, `Request`, `Response`, `crypto`, Web Streams...) — không có `fs`, không TCP socket, không native addon, và bundle bị giới hạn size.

So sánh đầy đủ:

| Tiêu chí | Node.js Runtime | Edge Runtime |
| --- | --- | --- |
| API support | Toàn bộ Node API + npm ecosystem | Subset Web API (fetch, crypto, streams) |
| Cold start | Chậm hơn (boot Node process, ~100ms+) | ~0ms (V8 isolate) |
| Location | Region cố định (origin server) | Phân tán toàn cầu trên CDN edge |
| Size limit | Lớn (50MB+ tuỳ platform) | Nhỏ (~1-4MB) |
| Database TCP | ✅ Prisma, pg, mysql2... | ❌ chỉ HTTP-based driver |
| Native addon (`bcrypt`, `sharp`) | ✅ | ❌ |
| Filesystem (`fs`) | ✅ | ❌ |

**Mặc định**: Pages, Layouts, Route Handlers, Server Actions chạy **Node**; **middleware mặc định chạy Edge** (Next 15.2 có experimental Node middleware nhưng edge vẫn là chuẩn). Khai báo per route segment: `export const runtime = "edge"` hoặc `"nodejs"` — một app mix được, layout khai runtime áp cho cả subtree.

**Chọn runtime nào** — quy tắc thực chiến: **mặc định Node, chỉ lên Edge khi có lý do rõ**:

- **Edge hợp với**: middleware/auth check (verify JWT bằng `jose` — Web Crypto), geo-based logic (redirect theo country, GDPR banner), A/B testing trên critical path, streaming AI response (Web Streams + cold start 0 hợp traffic burst).
- **Node bắt buộc khi**: database driver TCP (`pg`, `mysql2`, Prisma engine classic), native module (`bcrypt`, `sharp`), cần `fs`, CPU nặng hoặc bundle to (generate PDF, AWS SDK...).

**Pitfall kinh điển — ORM trên Edge**: Prisma/`pg` fail trên edge vì không có TCP. Giải pháp là **HTTP/WebSocket driver**: Neon serverless driver, PlanetScale database-js, Prisma Accelerate, Drizzle HTTP. Nhưng kể cả chạy được vẫn còn **vấn đề vật lý**: edge function ở Tokyo gọi DB ở Virginia → mỗi query 150-200ms round-trip; route cần 3-4 query tuần tự **chậm hơn hẳn** Node function đặt cạnh DB. Edge + DB chỉ hợp khi DB cũng phân tán (Turso, Cloudflare D1, read replica đa region) hoặc route chỉ cần 0-1 query. Tức là: **edge không tự động nhanh hơn** — chỉ nhanh ở cold start và proximity.

### Code minh hoạ

```typescript
// middleware.ts — mặc định Edge: use case điển hình là auth check sớm
import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose"; // jose dùng Web Crypto → chạy được trên edge

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("session")?.value;
    try {
      if (!token) throw new Error("no token");
      await jwtVerify(token, secret); // chặn ngay tại edge, không tốn compute origin
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*"] };
```

```typescript
// app/api/report/route.ts — Node runtime: DB TCP + fs + CPU nặng
export const runtime = "nodejs"; // mặc định, khai cho tường minh

import { prisma } from "@/lib/prisma"; // Prisma cần TCP → bắt buộc Node
import fs from "node:fs/promises";     // fs chỉ có trên Node

export async function GET() {
  const orders = await prisma.order.findMany({ take: 100 });
  const template = await fs.readFile("./templates/report.html", "utf8");
  return Response.json({ count: orders.length });
}
```

```typescript
// app/api/products/route.ts — Edge + DB: BẮT BUỘC HTTP driver
export const runtime = "edge";

import { neon } from "@neondatabase/serverless"; // query qua HTTP, không cần TCP

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  // ⚠️ DB ở us-east-1 mà edge ở Singapore → mỗi query là round-trip
  // xuyên lục địa — chỉ nên 0-1 query/route
  const products = await sql`SELECT id, name, price FROM products LIMIT 20`;
  return Response.json(products);
}

// ❌ Trên edge những import này fail:
// import { PrismaClient } from "@prisma/client"; // cần TCP engine
// import { Pool } from "pg";                     // cần net.Socket
// import bcrypt from "bcrypt";                   // native addon
```

### Đáp án mẫu

> "Edge Runtime là runtime nhẹ dựa trên V8 isolates — cùng công nghệ Cloudflare Workers — cold start gần 0 và chạy trên CDN edge gần user; đổi lại chỉ có subset Web API: `fetch`, `crypto`, Web Streams — không có `fs`, TCP socket hay native addon, bundle giới hạn vài MB. Node runtime thì đầy đủ Node API và ecosystem npm nhưng cold start chậm hơn và chạy ở region cố định. Khai báo per route segment bằng `export const runtime` — mặc định mọi thứ là Node, riêng middleware mặc định edge. Nguyên tắc của em: mặc định Node, chỉ lên edge khi có lý do — auth check với `jose`, geo logic, A/B test, streaming AI. Pitfall lớn nhất là ORM: Prisma hay `pg` fail trên edge vì cần TCP, phải dùng HTTP driver như Neon; nhưng kể cả chạy được, edge ở Singapore gọi DB ở Mỹ thì mỗi query là round-trip xuyên lục địa — edge không tự động nhanh hơn Node đặt cạnh DB."

---

## Câu 65: Chiến lược migrate Pages Router sang App Router `[Advanced]`

### Câu hỏi

> Chiến lược migrate từ Pages Router sang App Router là gì? Hai router có chạy song song được không?

### Giải thích lý thuyết

**Chạy song song được không? CÓ** — và đây chính là nền tảng của chiến lược incremental migration mà Next.js chính thức khuyến nghị. `pages/` và `app/` cùng tồn tại trong một project, mỗi route được serve bởi router sở hữu nó. Một điểm cần nói chính xác (nhiều người trả lời sai): nếu **cùng một path** tồn tại ở cả hai router (ví dụ `pages/about.tsx` và `app/about/page.tsx`), Next **không** "ưu tiên app" mà báo **conflict error lúc build** — bạn phải xoá một bên. Nghĩa là mỗi route chỉ thuộc về đúng một router tại một thời điểm.

**Chiến lược incremental** em khuyến nghị:

1. **Route ít rủi ro trước**: route mới, trang marketing/static, trang ít traffic — không động vào checkout/auth khi chưa quen mental model.
2. **Dựng root layout** (`app/layout.tsx`) — port nội dung `_app` + `_document`; provider client tách ra `providers.tsx`. Logic chung (analytics, theme) tạm thời tồn tại ở cả hai phía cho đến khi migrate xong.
3. **Đổi data fetching** từng route:
   - `getServerSideProps` → **async Server Component** fetch trực tiếp (mặc định dynamic, hoặc thêm `cache: "no-store"` khi cần chắc chắn).
   - `getStaticProps` + `revalidate` → fetch với `next: { revalidate: N }`.
   - `getStaticPaths` → `generateStaticParams`.
4. **Đổi API**: `useRouter` từ `next/router` → `next/navigation` (API khác hẳn: không còn `router.query` — thay bằng `useSearchParams`/`useParams`, không còn `router.events`); `next/head` → Metadata API.
5. Component dùng hook/event handler → thêm `"use client"`, nhưng đừng dán vô tội vạ — đẩy ranh giới client xuống lá tree.

**Pitfalls phải nêu để ghi điểm senior**:

- **Navigation giữa hai router là hard navigation** (full page load, mất client state) — Next phải reload để chuyển runtime. Vì vậy nên migrate **theo cụm route liên quan** (cả flow checkout cùng lúc) thay vì rải rác, tránh user bị reload giữa flow.
- `router.query` trong Pages Router gộp cả path param lẫn query string; App Router tách thành `useParams` và `useSearchParams` — bug tinh vi khi port.
- Component lib cũ giả định mọi thứ chạy client → import vào Server Component là vỡ; cần audit.
- Testing/E2E phải cover cả hai phía suốt giai đoạn chuyển tiếp.

### Code minh hoạ

```tsx
// TRƯỚC — pages/products/[id].tsx (Pages Router)
import type { GetStaticProps, GetStaticPaths } from "next";
import Head from "next/head";

export const getStaticPaths: GetStaticPaths = async () => {
  const products = await fetchProducts();
  return { paths: products.map((p) => ({ params: { id: p.id } })), fallback: "blocking" };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const product = await fetchProduct(params!.id as string);
  return { props: { product }, revalidate: 60 };
};

export default function ProductPage({ product }) {
  return (
    <>
      <Head><title>{product.name}</title></Head>
      <h1>{product.name}</h1>
    </>
  );
}
```

```tsx
// SAU — app/products/[id]/page.tsx (App Router)
// Lưu ý: phải XOÁ pages/products/[id].tsx — trùng path là conflict error lúc build
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> }; // Next 15: params là Promise

// getStaticPaths → generateStaticParams
export async function generateStaticParams() {
  const products = await fetchProducts();
  return products.map((p) => ({ id: p.id }));
}

// next/head → Metadata API
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProduct(id);
  return { title: product.name };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  // getStaticProps + revalidate: 60 → fetch với next.revalidate (ISR giữ nguyên hành vi)
  const product = await fetch(`${API}/products/${id}`, {
    next: { revalidate: 60 },
  }).then((r) => r.json());

  return <h1>{product.name}</h1>;
}
```

```tsx
// Đổi useRouter — API khác hẳn giữa hai router
// TRƯỚC (Pages Router)
import { useRouter } from "next/router";
function Old() {
  const router = useRouter();
  const { id, tab } = router.query; // gộp path param + query string
  // router.events.on("routeChangeStart", ...) — App Router KHÔNG còn
}

// SAU (App Router)
("use client");
import { useRouter, useParams, useSearchParams } from "next/navigation";
function New() {
  const router = useRouter();          // chỉ còn push/replace/back/refresh
  const { id } = useParams<{ id: string }>(); // path param tách riêng
  const tab = useSearchParams().get("tab");   // query string tách riêng
}
```

### Đáp án mẫu

> "Có, hai router chạy song song được trong cùng project — đây là nền tảng để migrate incremental, nhưng với điều kiện không trùng path: cùng một route tồn tại ở cả `pages/` lẫn `app/` là Next báo conflict error lúc build chứ không tự ưu tiên bên nào. Chiến lược của em: dựng root `layout.tsx` thay `_app`/`_document` trước, rồi migrate từ route ít rủi ro — trang mới, trang static — chừa checkout/auth lại sau. Mỗi route em đổi `getServerSideProps` thành async Server Component fetch trực tiếp, `getStaticProps` + revalidate thành `fetch` với `next.revalidate`, `getStaticPaths` thành `generateStaticParams`, `next/head` thành Metadata API, và `useRouter` chuyển từ `next/router` sang `next/navigation` — chú ý `router.query` bị tách thành `useParams` và `useSearchParams`. Pitfall lớn nhất em luôn cảnh báo team: navigation giữa hai router là **hard navigation** — full reload, mất client state — nên phải migrate theo cụm flow liên quan chứ không rải rác từng trang."

---

## Bẫy thường gặp khi trả lời

| Sai lầm | Đúng là |
| --- | --- |
| "Self-host chỉ cần `next build` + `next start` là xong như Vercel" | Phải tự lo CDN, ISR cache chia sẻ giữa instance (`cacheHandler` + Redis), image optimizer, scale, zero-downtime deploy |
| "`output: 'standalone'` copy luôn cả `public/` và static" | Phải tự copy `public/` và `.next/static` vào standalone — Next cố tình không copy |
| "Docker chỉ cần một stage, copy hết rồi build" | Multi-stage 3 tầng: image từ 1GB+ xuống ~150MB, layer cache cho deps, user non-root |
| "`output: 'export'` vẫn dùng được ISR và Server Actions" | Static export mất hết: Server Actions, Route Handler động, ISR, middleware, `cookies()`/`headers()` |
| "Async Server Component test bằng Jest + RTL như component thường" | `render()` không await được Promise JSX, jsdom không có RSC runtime — Next.js docs khuyến nghị dùng E2E |
| "Edge Runtime luôn nhanh hơn Node" | Chỉ nhanh ở cold start + proximity; gọi DB xa thì tổng latency tệ hơn Node đặt cạnh DB |
| "Prisma chạy được trên Edge như thường" | Cần HTTP driver (Neon, PlanetScale, Accelerate) — TCP driver fail |
| "Trùng route giữa `pages/` và `app/` thì `app/` thắng" | Build báo conflict error — mỗi route chỉ thuộc một router |
| "Navigate giữa hai router vẫn là client navigation mượt" | Là hard navigation — full reload, mất client state |
