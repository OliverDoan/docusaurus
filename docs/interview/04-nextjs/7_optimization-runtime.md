---
sidebar_position: 7
title: "7. Optimization, Tooling & Runtimes"
---

# Optimization, Tooling & Runtimes

> *Nhóm câu hỏi này kiểm tra việc bạn có thực sự "ship production" hay chưa: tối ưu image/font, hiểu runtime model, và biết dùng tooling để chẩn đoán performance. Trả lời tốt phần này thường tách ứng viên Middle khỏi Senior.*

---

## Câu 42: next/image tối ưu hình ảnh như thế nào? `[Basic]`

### Câu hỏi

> `next/image` tối ưu hình ảnh như thế nào so với thẻ `<img>` thường? Tại sao Next.js bắt buộc khai báo `width`/`height`?

### Giải thích lý thuyết

Image thường là tài nguyên nặng nhất trên page — chiếm ~50% tổng byte tải về. `next/image` giải quyết 4 vấn đề lớn của `<img>` thường:

1. **Resize đúng kích thước thiết bị**: thay vì ship ảnh 4000px gốc cho điện thoại 390px, Next tự generate `srcset` từ `deviceSizes` config — browser pick variant nhỏ nhất đủ dùng. Prop `sizes` cho browser biết ảnh chiếm bao nhiêu viewport để chọn đúng.
2. **Modern format**: tự convert sang **WebP/AVIF** cho browser hỗ trợ (qua header `Accept`) — nhẹ hơn JPEG 30-50% cùng chất lượng.
3. **Lazy load mặc định**: ảnh dưới fold chỉ load khi gần scroll tới (`loading="lazy"` native). Ảnh LCP thì ngược lại — đánh dấu `priority` để **preload**, không lazy.
4. **Chống CLS (Cumulative Layout Shift)**: bắt buộc `width`/`height` (hoặc `fill`) để Next reserve sẵn không gian bằng `aspect-ratio` — ảnh load xong không đẩy content nhảy xuống. Đây là lý do prop này **bắt buộc**, không phải làm khó dev.

So sánh nhanh:

| Khía cạnh         | `<img>` thường                  | `next/image`                         |
| ----------------- | ------------------------------- | ------------------------------------ |
| Kích thước serve  | 1 file gốc cho mọi device       | srcset nhiều variant theo device     |
| Format            | Format gốc (JPEG/PNG)           | WebP/AVIF tự động                    |
| Lazy load         | Phải tự thêm `loading="lazy"`   | Mặc định lazy, trừ `priority`        |
| CLS               | Dễ dính nếu quên size           | Bắt buộc size → không CLS            |
| Preload LCP image | Tự viết `<link rel="preload">`  | Prop `priority`                      |

**Pitfalls**: quên `priority` cho hero image → LCP chậm vì bị lazy load; set `sizes` sai (mặc định `100vw`) → browser tải variant to hơn cần thiết; dùng `next/image` cho icon nhỏ → overhead không xứng, nên dùng SVG inline.

### Code minh hoạ

```tsx
import Image from "next/image";

export default function ProductPage() {
  return (
    <>
      {/* Hero = LCP image → priority để preload, KHÔNG lazy */}
      <Image
        src="/hero.jpg"
        width={1200}
        height={600}
        alt="Banner sản phẩm"
        priority
        // sizes: mobile chiếm full viewport, desktop tối đa 1200px
        sizes="(max-width: 768px) 100vw, 1200px"
      />

      {/* Ảnh dưới fold → mặc định lazy load, không cần làm gì thêm */}
      <Image
        src="/gallery-1.jpg"
        width={800}
        height={600}
        alt="Ảnh chi tiết"
        sizes="(max-width: 768px) 100vw, 50vw"
      />

      {/* ❌ Anti-pattern: <img> không size → ảnh load xong đẩy content = CLS */}
      {/* <img src="/photo.jpg" /> */}
    </>
  );
}
```

### Đáp án mẫu

> "`next/image` tối ưu 4 thứ chính ạ. Một là resize đúng device — nó generate srcset nhiều kích thước, browser dựa vào `sizes` để tải variant nhỏ nhất đủ dùng, thay vì ship ảnh 4K cho mobile. Hai là modern format — tự convert sang WebP hoặc AVIF cho browser hỗ trợ, nhẹ hơn JPEG 30-50%. Ba là lazy load mặc định cho ảnh dưới fold, còn ảnh LCP thì em đánh dấu `priority` để preload. Bốn là chống CLS — Next bắt buộc khai báo `width`/`height` hoặc dùng `fill` để reserve sẵn không gian, ảnh load xong không làm layout nhảy. Pitfall em hay gặp là quên `priority` cho hero image khiến LCP tụt, và set `sizes` sai làm browser tải ảnh to hơn cần. Với icon nhỏ em không dùng `next/image` mà dùng SVG inline cho nhẹ."

---

## Câu 43: Image Optimization hoạt động ra sao bên dưới? `[Intermediate]`

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

## Câu 44: next/font giúp tối ưu font như thế nào? `[Intermediate]`

### Câu hỏi

> `next/font` giải quyết những vấn đề gì so với cách load Google Fonts truyền thống qua `<link>`? Cơ chế zero layout shift hoạt động ra sao?

### Giải thích lý thuyết

Cách truyền thống — `<link href="https://fonts.googleapis.com/...">` — có 4 vấn đề:

- Thêm DNS lookup + connection tới domain Google → chậm.
- **FOUT/FOIT**: text nhảy font hoặc invisible khi font về muộn.
- **Layout shift**: fallback font và web font khác metric (chiều cao, độ rộng chữ) → khi swap, dòng chữ tràn khác đi, layout nhảy → CLS.
- **Privacy/GDPR**: browser user request thẳng tới Google kèm IP. Toà án Đức từng phán dùng Google Fonts qua CDN vi phạm GDPR — đây là điểm nói ra rất ăn điểm phỏng vấn.

`next/font` giải quyết:

1. **Self-host lúc build**: Next download font file từ Google **lúc build**, serve từ chính domain app — runtime **không có request nào tới Google**. Hết vấn đề privacy lẫn DNS lookup thừa.
2. **Zero layout shift**: Next tính metric của web font, rồi generate fallback font (vd Arial) được điều chỉnh bằng CSS `size-adjust`, `ascent-override`, `descent-override` sao cho fallback chiếm đúng kích thước web font. Khi swap font, text không đổi dimension → CLS ≈ 0.
3. **Font subsetting**: `subsets: ["latin", "vietnamese"]` chỉ tải glyph cần — giảm size đáng kể. Tiếng Việt bắt buộc subset `vietnamese` không thì mất dấu.
4. **CSS variable**: expose `variable: "--font-x"` để dùng trong Tailwind/CSS, tách khai báo font khỏi nơi sử dụng.
5. **Preload tự động**: font dùng ở layout/page nào được tự động `<link rel="preload">` cho route đó.

**Pitfall**: khai báo font lặp lại ở nhiều file → mỗi lần khai báo là một instance font riêng (tăng size). Nên khai báo 1 lần (vd `app/fonts.ts`) rồi import.

### Code minh hoạ

```typescript
// app/fonts.ts — khai báo 1 lần duy nhất, tránh duplicate instance
import { Inter, Roboto_Mono } from "next/font/google";
import localFont from "next/font/local";

export const inter = Inter({
  subsets: ["latin", "vietnamese"], // subsetting — chỉ tải glyph cần
  display: "swap",                  // hiện fallback ngay, swap khi font về
  variable: "--font-inter",         // CSS variable cho Tailwind
});

export const mono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

// Font thương hiệu tự host
export const brand = localFont({
  src: [
    { path: "./fonts/Brand-Regular.woff2", weight: "400" },
    { path: "./fonts/Brand-Bold.woff2", weight: "700" },
  ],
  variable: "--font-brand",
});
```

```tsx
// app/layout.tsx
import { inter, mono } from "./fonts";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Gắn CSS variable ở root — Next tự preload font cho route
    <html lang="vi" className={`${inter.variable} ${mono.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

```typescript
// tailwind.config.ts — map CSS variable vào utility class
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
};
```

### Đáp án mẫu

> "`next/font` self-host font ngay lúc build — Next download font file từ Google một lần khi build, serve từ domain của app, nên runtime không có request nào tới Google. Lợi kép: nhanh hơn vì bớt DNS lookup, và sạch về privacy/GDPR — từng có phán quyết ở Đức về việc load Google Fonts qua CDN. Điểm em thích nhất là zero layout shift: Next tính metric web font rồi generate fallback font có `size-adjust` và `ascent-override` sao cho fallback chiếm đúng kích thước, lúc swap font text không đổi dimension nên CLS gần như bằng 0. Em luôn set subset `['latin', 'vietnamese']` để chỉ tải glyph cần — tiếng Việt mà thiếu subset là mất dấu. Em expose font qua CSS variable để Tailwind dùng, khai báo một lần ở file `fonts.ts` chứ không lặp lại nhiều nơi — mỗi lần khai báo là một instance riêng, phình size."

---

## Câu 45: Edge Runtime là gì? `[Intermediate]`

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

---

## Câu 46: Node.js Runtime và Edge Runtime khác nhau thế nào? `[Intermediate]`

### Câu hỏi

> So sánh Node.js Runtime và Edge Runtime trong Next.js. Cách khai báo runtime cho từng route? Mặc định mỗi phần của app chạy runtime nào?

### Giải thích lý thuyết

Next.js 15 cho phép chọn runtime **per route segment** — mỗi page/layout/route handler tự quyết định:

| Tiêu chí            | Node.js Runtime                         | Edge Runtime                              |
| ------------------- | --------------------------------------- | ----------------------------------------- |
| API support         | Toàn bộ Node API + npm ecosystem        | Subset Web API (fetch, crypto, streams)   |
| Cold start          | Chậm hơn (boot Node process, ~100ms+)   | ~0ms (V8 isolate)                         |
| Location            | Region cố định (origin server)          | Phân tán toàn cầu trên CDN edge           |
| Size limit          | Lớn (vd 50MB+ tuỳ platform)             | Nhỏ (~1-4MB)                              |
| Database TCP        | ✅ Prisma, pg, mysql2...                | ❌ chỉ HTTP-based driver                  |
| Native addon        | ✅ bcrypt, sharp...                     | ❌                                        |
| Filesystem (`fs`)   | ✅                                      | ❌                                        |
| Use case            | API có DB, business logic phức tạp      | Middleware, auth check, redirect, geo     |

**Mặc định**:

- Pages, Layouts, Route Handlers, Server Actions → **Node.js runtime**.
- **Middleware → Edge runtime** (từ Next 15.2 có experimental Node middleware, nhưng mặc định và phổ biến vẫn là edge — nên middleware phải viết bằng Web API thuần).

Khai báo bằng segment config export:

```ts
export const runtime = "edge";   // hoặc "nodejs" (mặc định)
```

Lưu ý quan trọng: runtime là **per segment** — một app có thể mix, route `/api/auth` chạy edge, route `/api/reports` chạy Node. Layout khai báo runtime ảnh hưởng cả subtree bên dưới nó.

**Pitfall**: nghĩ rằng edge "luôn nhanh hơn". Edge chỉ nhanh hơn ở cold start và network proximity; nếu route edge phải gọi database đặt ở `us-east-1` thì mỗi query là một round-trip xuyên lục địa — tổng latency có thể **tệ hơn** Node runtime đặt cạnh DB. Câu này dẫn thẳng tới câu 58.

### Code minh hoạ

```typescript
// app/api/report/route.ts — Node runtime (mặc định, khai báo cho tường minh)
export const runtime = "nodejs";

import { prisma } from "@/lib/prisma"; // Prisma cần TCP → bắt buộc Node
import fs from "node:fs/promises";     // fs chỉ có trên Node

export async function GET() {
  const orders = await prisma.order.findMany({ take: 100 });
  const template = await fs.readFile("./templates/report.html", "utf8");
  // ... generate report nặng CPU — hợp với Node
  return Response.json({ count: orders.length });
}
```

```typescript
// app/api/flags/route.ts — Edge runtime: logic nhẹ, cần latency thấp toàn cầu
export const runtime = "edge";

export async function GET(request: Request) {
  const country = request.headers.get("x-vercel-ip-country") ?? "US";
  // Feature flag theo geo — không cần DB, chỉ logic thuần
  const flags = { newCheckout: country === "VN", betaSearch: true };
  return Response.json(flags, {
    headers: { "Cache-Control": "public, max-age=60" },
  });
}
```

```typescript
// app/dashboard/layout.tsx — runtime khai báo ở layout áp cho cả subtree
export const runtime = "nodejs";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <section>{children}</section>;
}
```

### Đáp án mẫu

> "Khác nhau ở 4 trục chính ạ. API: Node runtime có đầy đủ Node API và ecosystem npm — `fs`, TCP socket, native addon; Edge chỉ có subset Web API. Cold start: Edge gần như 0 nhờ V8 isolate, Node phải boot process nên chậm hơn. Location: Edge phân tán toàn cầu trên CDN, Node chạy ở region cố định. Size: Edge giới hạn bundle vài MB, Node thoải mái hơn nhiều. Cách khai báo là `export const runtime = 'edge'` hoặc `'nodejs'` ở mức từng route segment — page, layout, route handler đều set riêng được, mặc định là Node, riêng middleware mặc định là edge nên phải viết bằng Web API thuần. Một điểm em hay nhấn mạnh: edge không tự động nhanh hơn — nếu route edge gọi database ở Mỹ thì mỗi query là một round-trip xuyên lục địa, tổng latency có khi tệ hơn Node đặt cạnh DB."

---

## Câu 58: Chọn Edge hay Node.js Runtime cho use case nào — góc nhìn thực chiến? `[Advanced]`

### Câu hỏi

> Trong dự án thực tế, em quyết định route nào chạy Edge, route nào chạy Node.js dựa trên tiêu chí gì? Kể những pitfall đã gặp khi đưa code lên Edge.

### Giải thích lý thuyết

Quy tắc thực chiến: **mặc định Node, chỉ đưa lên Edge khi có lý do rõ ràng**. Cây quyết định:

**Edge phù hợp khi** — logic nhẹ, không phụ thuộc Node API, hưởng lợi từ proximity:

- **Middleware / auth check**: verify JWT (bằng `jose` — thư viện Web Crypto), redirect chưa login — chạy ở edge chặn request sớm, không tốn compute origin.
- **Geo-based logic**: redirect theo country, hiển thị giá theo region, GDPR banner.
- **A/B testing**: gán bucket qua cookie rồi rewrite sang variant — phải nhanh vì nằm trên critical path mọi request.
- **Streaming AI responses**: proxy/stream token từ LLM API về client — Edge hỗ trợ Web Streams tốt, cold start 0 hợp với traffic dạng burst.

**Node bắt buộc khi**:

- **Database driver TCP**: `pg`, `mysql2`, **Prisma** (engine classic), TypeORM — đều cần TCP socket.
- **Native module**: `bcrypt`, `sharp`, `canvas` — native addon không chạy trên isolate.
- **Filesystem**: đọc template, xử lý file upload tạm.
- **CPU nặng / bundle to**: generate PDF, xử lý ảnh, SDK cồng kềnh (AWS SDK v2...).

**Pitfall kinh điển — ORM trên Edge**: Prisma/`pg` không chạy trên Edge vì không có TCP. Giải pháp là **HTTP/WebSocket-based driver**: Neon serverless driver (`@neondatabase/serverless`), PlanetScale serverless driver (`@planetscale/database`), Prisma Accelerate, Drizzle với driver HTTP. Nhưng kể cả khi chạy được, vẫn còn **vấn đề vật lý**: edge function ở Tokyo gọi DB ở Virginia → mỗi query 150-200ms round-trip; route cần 3-4 query tuần tự là chậm hơn hẳn Node function đặt cùng region DB. Edge + DB chỉ hợp khi DB cũng phân tán (Turso, Cloudflare D1, read replica đa region) hoặc route chỉ cần 0-1 query.

**Chi phí & vendor lock-in**: Edge Functions thường tính tiền theo mô hình khác (per-request + CPU time) — rẻ cho logic nhẹ nhưng giá khó đoán khi scale. Quan trọng hơn: code viết quanh edge runtime + driver đặc thù (Vercel Edge Config, KV, Neon driver) tạo độ dính platform — self-host lại sau này tốn công refactor. Node runtime với `output: 'standalone'` thì portable: Docker chạy đâu cũng được.

### Code minh hoạ

```typescript
// middleware.ts — use case Edge điển hình: auth check + A/B test
import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose"; // jose dùng Web Crypto → chạy được trên edge

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
  // 1. Auth check tại edge — chặn sớm, không tốn compute origin
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("session")?.value;
    try {
      if (!token) throw new Error("no token");
      await jwtVerify(token, secret);
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 2. A/B test — gán bucket, rewrite sang variant
  const bucket = request.cookies.get("ab-bucket")?.value
    ?? (Math.random() < 0.5 ? "a" : "b");
  const response = bucket === "b" && request.nextUrl.pathname === "/"
    ? NextResponse.rewrite(new URL("/home-variant-b", request.url))
    : NextResponse.next();
  response.cookies.set("ab-bucket", bucket);
  return response;
}
```

```typescript
// app/api/products/route.ts — Edge + DB: BẮT BUỘC dùng HTTP driver
export const runtime = "edge";

import { neon } from "@neondatabase/serverless"; // query qua HTTP, không cần TCP

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  // ⚠️ Lưu ý: nếu DB ở us-east-1 mà edge ở Singapore,
  // mỗi query vẫn là round-trip xuyên lục địa — chỉ nên 0-1 query/route
  const products = await sql`SELECT id, name, price FROM products LIMIT 20`;
  return Response.json(products);
}

// ❌ Trên edge những import này sẽ fail:
// import { PrismaClient } from "@prisma/client"; // cần TCP engine
// import { Pool } from "pg";                     // cần net.Socket
```

```typescript
// app/api/chat/route.ts — Edge cho streaming AI: cold start 0 + Web Streams
export const runtime = "edge";

export async function POST(request: Request) {
  const { prompt } = await request.json();
  const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      stream: true, // stream token về client qua Web Streams
      messages: [{ role: "user", content: prompt }],
    }),
  });
  // Pipe thẳng stream upstream về client — edge xử lý tốt, không buffer
  return new Response(upstream.body, {
    headers: { "Content-Type": "text/event-stream" },
  });
}
```

### Đáp án mẫu

> "Nguyên tắc của em là mặc định Node, chỉ đưa lên Edge khi có lý do rõ. Edge em dùng cho 4 nhóm: middleware auth check với `jose`, logic geo như redirect theo country, A/B test gán bucket rewrite variant, và streaming AI response — cold start 0 cộng Web Streams rất hợp. Node em giữ cho mọi thứ dính database driver TCP như Prisma hay `pg`, native module như `bcrypt`, `sharp`, cần `fs`, hoặc bundle to. Pitfall lớn nhất em từng gặp là ORM trên edge — Prisma không chạy vì không có TCP, phải chuyển sang HTTP driver như Neon hay PlanetScale serverless driver. Nhưng kể cả chạy được, nếu DB ở Mỹ mà edge ở Singapore thì mỗi query là round-trip xuyên lục địa, route nhiều query tuần tự còn chậm hơn Node đặt cạnh DB. Em cũng cân nhắc lock-in: code dính Vercel KV, Edge Config hay driver đặc thù sẽ khó self-host lại sau này."

---

## Câu 59: Bundle analyzer trong Next.js được dùng như thế nào? `[Intermediate]`

### Câu hỏi

> Khi client bundle của app Next.js phình to, em dùng tool gì để chẩn đoán và quy trình xử lý thế nào?

### Giải thích lý thuyết

Tool chuẩn là **`@next/bundle-analyzer`** — wrapper quanh `webpack-bundle-analyzer`:

1. **Setup**: wrap config trong `next.config.ts`, bật bằng biến môi trường `ANALYZE=true`.
2. **Chạy**: `ANALYZE=true npm run build` → mở các report HTML dạng **treemap**: `client.html` (quan trọng nhất — JS ship xuống browser), `nodejs.html` và `edge.html` (server bundle, ảnh hưởng cold start chứ không ảnh hưởng user tải trang).
3. **Đọc treemap**: mỗi ô là một module, diện tích tỉ lệ với size. Nhìn ô to bất thường trong `node_modules` → đó là nghi phạm. Chú ý 3 số: **stat** (size gốc), **parsed** (sau minify), **gzipped** (thực tế truyền qua mạng — số nên quan tâm nhất).

Sau khi tìm ra thủ phạm, fix theo thứ tự ROI:

| Vấn đề tìm thấy                         | Fix                                                            |
| --------------------------------------- | -------------------------------------------------------------- |
| Component nặng (editor, chart, map)     | `next/dynamic` — chỉ load khi user cần                          |
| Import cả thư viện (`import _ from`)    | Cherry-pick import / nhờ tree-shaking                           |
| Lib barrel-file lớn (MUI, lucide-react) | `optimizePackageImports` trong `next.config.ts`                 |
| Lib nặng có thay thế                    | `moment` (~70kb) → `date-fns`/`dayjs`; `axios` → `fetch`        |
| Code chỉ chạy server lọt vào client     | Chuyển sang Server Component / `server-only` package            |

**`optimizePackageImports`** (Next 13.5+, mặc định bật cho một số lib phổ biến): tự transform import từ barrel file thành import trực tiếp module con — giải quyết các lib mà tree-shaking thường fail vì side effects.

**Insight phỏng vấn**: nói thêm về **phòng ngừa** — đo size là việc liên tục, không phải một lần: gắn size-limit/bundle check vào CI để PR nào làm bundle tăng quá ngưỡng là fail; theo dõi First Load JS mà `next build` in ra mỗi lần build.

### Code minh hoạ

```typescript
// next.config.ts — setup bundle analyzer
import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true", // chỉ bật khi cần phân tích
});

const config: NextConfig = {
  experimental: {
    // Tự tách barrel import thành import trực tiếp — fix lib tree-shake kém
    optimizePackageImports: ["@mui/material", "lucide-react", "lodash-es"],
  },
};

export default withBundleAnalyzer(config);
// Chạy: ANALYZE=true npm run build
// → mở client.html xem treemap, tìm ô to bất thường trong node_modules
```

```tsx
// Fix 1: dynamic import component nặng — loại khỏi initial bundle
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), {
  loading: () => <p>Đang tải editor...</p>,
  ssr: false, // editor chỉ chạy client, khỏi SSR
});

// Fix 2: cherry-pick thay vì import cả lib
// ❌ import _ from "lodash";            → kéo cả ~70kb
// ✅ import debounce from "lodash/debounce"; → vài kb

// Fix 3: thay lib nặng bằng lib nhẹ tương đương
// ❌ import moment from "moment";       → ~70kb + locale
// ✅ import { format } from "date-fns";  → tree-shake tốt, chỉ vài kb

// Fix 4: logic không interactive → chuyển sang Server Component,
// thư viện format/parse không ship xuống client nữa
import { marked } from "marked"; // chỉ chạy trên server

export default async function PostBody({ md }: { md: string }) {
  const html = marked(md); // parse markdown trên server
  return <article dangerouslySetInnerHTML={{ __html: html }} />;
}
```

### Đáp án mẫu

> "Em dùng `@next/bundle-analyzer` — wrap vào `next.config.ts` rồi chạy `ANALYZE=true npm run build`. Nó mở treemap riêng cho client và server bundle; em tập trung vào client vì đó là JS user thực sự tải, và nhìn số gzipped chứ không nhìn stat size. Tìm ra thủ phạm rồi em fix theo ROI: component nặng như editor, chart thì `next/dynamic` để load khi cần; lib import cả gói thì cherry-pick; lib barrel file lớn như MUI, lucide-react thì khai `optimizePackageImports` để Next tự transform import; lib nặng có thay thế thì đổi — `moment` sang `date-fns`, `axios` sang fetch; còn code không interactive thì chuyển hẳn sang Server Component để lib không ship xuống client. Em cũng coi đây là việc liên tục: gắn size check vào CI, PR nào làm First Load JS vượt ngưỡng là fail, không đợi bundle phình mới đi dọn."

---

## Câu 60: Turbopack là gì và lợi ích của nó? `[Intermediate]`

### Câu hỏi

> Turbopack là gì? Vì sao nó nhanh hơn webpack, và tới Next.js 15 thì trạng thái production-ready đến đâu?

### Giải thích lý thuyết

**Turbopack** là bundler viết bằng **Rust**, được Vercel xây dựng (dẫn dắt bởi tác giả webpack — Tobias Koppers) để thay thế webpack trong Next.js. Hai lý do nó nhanh:

1. **Rust thay JavaScript**: bundler chạy native code, parallel hoá tốt trên multi-core — bản thân ngôn ngữ đã cho lợi thế lớn so với webpack chạy trên Node.
2. **Incremental computation + function-level caching**: kiến trúc cốt lõi (engine Turbo) memoize kết quả **ở mức từng function call** trong quá trình build. Khi một file đổi, Turbopack chỉ tính lại đúng những function bị ảnh hưởng bởi thay đổi đó — không re-bundle cả dependency graph. Webpack cũng có cache nhưng granularity thô hơn nhiều (module/chunk level).

Kết quả thực tế (số liệu Vercel công bố trên app lớn):

- `next dev` khởi động nhanh hơn **vài lần đến hàng chục lần** so với webpack dev (app càng to chênh lệch càng lớn).
- **HMR/Fast Refresh** nhanh hơn rõ rệt — update phản ánh gần như tức thì vì chỉ tính lại phần đổi.

**Trạng thái theo version** (chính xác để trả lời phỏng vấn):

| Mốc        | Trạng thái Turbopack                                          |
| ---------- | ------------------------------------------------------------- |
| Next 13    | `next dev --turbo` alpha/beta                                  |
| **Next 15**| **`next dev --turbo` STABLE** — dev dùng production-grade      |
| Next 15.x  | `next build` với Turbopack vẫn alpha/beta — production build mặc định vẫn webpack |

So sánh ngắn với Vite/webpack: **Vite** dev nhanh nhờ né bundling — serve native ESM, esbuild pre-bundle deps; nhưng dev (unbundled ESM) và prod (Rollup bundle) là hai pipeline khác nhau, app rất lớn có thể gặp thác request module khi dev. **Turbopack** vẫn bundle cả dev lẫn prod nhưng nhanh nhờ incremental cache — nhất quán dev/prod hơn và scale tốt với app lớn. **Webpack** chậm nhất nhưng ecosystem plugin/loader trưởng thành nhất — đây cũng là rào cản của Turbopack: không tương thích webpack plugin tuỳ biến, ai phụ thuộc custom webpack config phải chờ hoặc tìm tương đương.

**Pitfall**: bật `--turbo` mà project có custom webpack config trong `next.config` → config đó bị bỏ qua/không tương thích; cần kiểm tra trước khi migrate.

### Code minh hoạ

```jsonc
// package.json — bật Turbopack cho dev (stable từ Next 15)
{
  "scripts": {
    "dev": "next dev --turbo",   // dev server dùng Turbopack
    "build": "next build",       // production build: mặc định vẫn webpack (Next 15)
    "start": "next start"
  }
}
```

```typescript
// next.config.ts — config riêng cho Turbopack (Next 15)
import type { NextConfig } from "next";

const config: NextConfig = {
  // Next 15: config Turbopack nằm dưới experimental.turbo
  experimental: {
    turbo: {
      // Tương đương webpack loader rule — vd import SVG thành React component
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
      // Alias module khi resolve
      resolveAlias: {
        underscore: "lodash",
      },
    },
  },

  // ⚠️ Pitfall: custom webpack() config KHÔNG áp dụng khi chạy --turbo
  // webpack: (config) => { ... }  ← bị bỏ qua, phải tìm tương đương trong turbo.rules
};

export default config;
```

### Đáp án mẫu

> "Turbopack là bundler viết bằng Rust do Vercel xây để thay webpack trong Next.js. Nó nhanh nhờ hai thứ: Rust chạy native và parallel tốt, và quan trọng hơn là kiến trúc incremental computation với caching ở mức function — khi em sửa một file, nó chỉ tính lại đúng những function bị ảnh hưởng chứ không re-bundle cả graph. Thực tế dev server start nhanh hơn nhiều lần, app càng lớn chênh lệch càng rõ, và HMR gần như tức thì. Về trạng thái: từ Next 15, `next dev --turbo` đã stable nên em dùng cho dev thoải mái, còn `next build` với Turbopack lúc đó vẫn chưa stable — production build mặc định vẫn là webpack. So với Vite: Vite né bundling bằng native ESM nên dev và prod là hai pipeline khác nhau, còn Turbopack bundle cả hai nên nhất quán hơn và scale tốt với app lớn. Pitfall em lưu ý là custom webpack config bị bỏ qua khi bật `--turbo`, phải chuyển sang `turbo.rules` tương đương."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                              | Đúng là                                                                  |
| ---------------------------------------------------- | ------------------------------------------------------------------------ |
| "`next/image` optimize ảnh lúc build"                | On-demand lúc request đầu tiên qua `/_next/image`, rồi cache              |
| "Edge Runtime luôn nhanh hơn Node"                   | Chỉ nhanh ở cold start + proximity; gọi DB xa thì tổng latency tệ hơn     |
| "Prisma chạy được trên Edge như thường"              | Cần HTTP driver (Neon, PlanetScale, Accelerate) — TCP driver fail         |
| "`next/font` chỉ là cách import font cho gọn"        | Self-host lúc build + size-adjust fallback → privacy + zero CLS           |
| "Turbopack đã thay webpack hoàn toàn ở Next 15"      | Chỉ `next dev --turbo` stable; production build mặc định vẫn webpack      |
| "Bundle to thì cứ dynamic import hết là xong"        | Phải đo bằng analyzer trước, fix theo thủ phạm thật, gắn check vào CI     |
