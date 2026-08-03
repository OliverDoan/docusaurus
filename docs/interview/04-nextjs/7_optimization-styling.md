---
sidebar_position: 7
title: "7. Optimization, Styling & Tooling"
---

# Optimization, Styling & Tooling

> *Nhóm câu hỏi này kiểm tra việc bạn có thực sự "ship production" hay chưa: chọn giải pháp styling đúng cho App Router, tối ưu image/font, hiểu Core Web Vitals, xử lý environment variables an toàn, và dùng tooling để chẩn đoán performance. Trả lời tốt phần này thường tách ứng viên Middle khỏi Senior.*

:::note[Ghi nhớ nhanh]

- ⭐ **CSS-in-JS runtime va chạm với RSC** — `styled-components`/`Emotion` sinh CSS bằng JS lúc render, cần context nên buộc component thành Client và lan `'use client'`; SSR cần dựng style registry với `useServerInsertedHTML`.
- **CSS Modules & Tailwind là build-time** — extract ra file CSS tĩnh, Next chỉ thêm `<link>`, Server Component dùng thoải mái và cache/tải song song.
- **Muốn DX của CSS-in-JS mà thân thiện RSC** — dùng zero-runtime: `vanilla-extract`, `Panda CSS`, `StyleX` (viết TS, compile ra CSS tĩnh).
- **Tối ưu image/font & env** — biết `next/image`, `next/font`, Core Web Vitals và xử lý biến môi trường an toàn (chỉ `NEXT_PUBLIC_` mới lộ ra client).

:::

---

## Câu 10: Tại sao CSS-in-JS runtime gặp khó với Server Components? `[Advanced]`

### Câu hỏi

> Trong App Router, tại sao CSS-in-JS runtime (styled-components, Emotion) gặp khó với Server Components, còn CSS Modules và Tailwind thì không?

### Giải thích lý thuyết

Mấu chốt nằm ở chữ **runtime**: styled-components/Emotion sinh CSS **lúc component render bằng JavaScript** — và cơ chế đó va thẳng vào model của Server Components:

1. **Cần JS chạy phía client + React Context**: CSS-in-JS runtime dựa vào context/registry (`ThemeProvider`, style cache) để track style đã inject, dedupe và chèn `<style>` vào DOM. Server Component **không có context, không có lifecycle, không ship JS** — nên thư viện không có chỗ để hoạt động. Kết quả: mọi component dùng styled-components buộc phải là **Client Component**, và `'use client'` lan rộng dần lên cây — mất luôn lợi ích giảm bundle của RSC.
2. **SSR cần style registry**: kể cả trong Client Component, khi server render HTML lần đầu, style sinh ra trong lúc render phải được gom lại và chèn vào HTML trước khi gửi xuống — không thì trang flash unstyled. App Router yêu cầu tự dựng **style registry** dùng hook `useServerInsertedHTML` để thu thập style theo từng chunk streaming. Đây là boilerplate dễ làm sai, và mỗi thư viện phải hỗ trợ riêng.

**CSS Modules và Tailwind không dính vấn đề này** vì chúng là **build-time**: output là **file CSS tĩnh** được extract lúc build, Next chỉ việc thêm `<link>` vào head. Không cần JS runtime, không cần context — nên Server Component import và dùng vô tư; CSS còn được cache và tải song song với JS.

**Hướng giải nếu vẫn muốn DX của CSS-in-JS**: dùng thế hệ **zero-runtime** — **vanilla-extract**, **Panda CSS**, **StyleX**: viết style bằng TypeScript nhưng compile ra CSS tĩnh lúc build → vừa type-safe, vừa thân thiện RSC.

### Code minh hoạ

```tsx
// ❌ styled-components trong Server Component → lỗi,
// vì nó cần context + inject style bằng JS lúc render
// import styled from "styled-components";
// const Title = styled.h1`color: red;`; // ép cả file thành 'use client'

// lib/registry.tsx — boilerplate BẮT BUỘC nếu dùng styled-components với App Router
"use client";
import { useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { ServerStyleSheet, StyleSheetManager } from "styled-components";

export default function StyledComponentsRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sheet] = useState(() => new ServerStyleSheet());

  // Gom style sinh ra trong lúc SSR, chèn vào HTML stream
  useServerInsertedHTML(() => {
    const styles = sheet.getStyleElement();
    sheet.instance.clearTag();
    return <>{styles}</>;
  });

  if (typeof window !== "undefined") return <>{children}</>;
  return <StyleSheetManager sheet={sheet.instance}>{children}</StyleSheetManager>;
}
```

```tsx
// ✅ CSS Modules — build-time, Server Component dùng thẳng, không cần 'use client'
import styles from "./Hero.module.css";

export default async function Hero() {
  const data = await fetch("https://api.example.com/hero").then((r) => r.json());
  return <h1 className={styles.title}>{data.heading}</h1>;
}

// ✅ Tailwind — cũng build-time: scan class lúc build, output CSS tĩnh
export function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border p-4 shadow-sm">{children}</div>;
}
```

```typescript
// ✅ Zero-runtime CSS-in-JS (vanilla-extract) — viết bằng TS, compile ra CSS tĩnh
// styles.css.ts
import { style } from "@vanilla-extract/css";

export const title = style({
  fontSize: "2rem",
  color: "navy",
}); // build xong chỉ còn class name + file CSS — RSC dùng được
```

### Đáp án mẫu

> "Vấn đề nằm ở chữ runtime ạ. styled-components hay Emotion sinh CSS bằng JavaScript lúc render và cần context, style registry để inject `<style>` — mà Server Component không có context, không ship JS, nên các thư viện này chỉ chạy được trong Client Component. Hệ quả là `'use client'` lan rộng lên cây, mất lợi ích giảm bundle của RSC. Kể cả với Client Component, SSR trong App Router còn phải tự dựng style registry bằng `useServerInsertedHTML` để gom style vào HTML stream — boilerplate dễ sai. CSS Modules và Tailwind thì là build-time: output là CSS tĩnh extract lúc build, không cần JS runtime, nên Server Component dùng vô tư. Nếu team vẫn thích DX kiểu CSS-in-JS, em sẽ đề xuất thế hệ zero-runtime như vanilla-extract, Panda CSS hay StyleX — viết bằng TypeScript nhưng compile ra CSS tĩnh, thân thiện với RSC."

---

## Câu 35: next/image component mang lại lợi ích gì? `[Basic]`

### Câu hỏi

> next/image component mang lại lợi ích gì?

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

**Cơ chế bên dưới (nói thêm để ăn điểm)**: optimization là **on-demand** — `<Image>` render `src` trỏ tới endpoint `/_next/image?url=...&w=...&q=...`; request đầu tiên server dùng Sharp resize/convert rồi **cache**, request sau serve thẳng từ cache. Với ảnh external phải whitelist qua **`remotePatterns`** trong `next.config.ts` — vừa là config vừa là security, tránh endpoint bị abuse làm open image proxy.

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

```typescript
// next.config.ts — ảnh external phải whitelist, chống abuse endpoint /_next/image
import type { NextConfig } from "next";

const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.example.com",
        pathname: "/uploads/**", // chỉ cho phép path cụ thể
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
};
export default config;
```

### Đáp án mẫu

> "`next/image` tối ưu 4 thứ chính ạ. Một là resize đúng device — nó generate srcset nhiều kích thước, browser dựa vào `sizes` để tải variant nhỏ nhất đủ dùng, thay vì ship ảnh 4K cho mobile. Hai là modern format — tự convert sang WebP hoặc AVIF cho browser hỗ trợ, nhẹ hơn JPEG 30-50%. Ba là lazy load mặc định cho ảnh dưới fold, còn ảnh LCP thì em đánh dấu `priority` để preload. Bốn là chống CLS — Next bắt buộc khai báo `width`/`height` hoặc dùng `fill` để reserve sẵn không gian, ảnh load xong không làm layout nhảy. Bên dưới, optimization là on-demand: request đầu tiên server resize rồi cache, ảnh external phải whitelist `remotePatterns` để tránh endpoint bị abuse. Pitfall em hay gặp là quên `priority` cho hero image khiến LCP tụt, và set `sizes` sai làm browser tải ảnh to hơn cần."

---

## Câu 36: next/font trong Next.js hoạt động như thế nào? `[Intermediate]`

### Câu hỏi

> next/font trong Next.js hoạt động như thế nào? Nó giải quyết những vấn đề gì so với cách load Google Fonts truyền thống qua `<link>`?

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

## Câu 40: Core Web Vitals và Next.js tối ưu chúng như thế nào? `[Intermediate]`

### Câu hỏi

> Core Web Vitals và Next.js tối ưu chúng như thế nào?

### Giải thích lý thuyết

**Core Web Vitals** là 3 chỉ số Google dùng đo trải nghiệm thực của user (và xếp hạng SEO):

| Metric  | Đo gì                                        | Ngưỡng tốt |
| ------- | -------------------------------------------- | ---------- |
| **LCP** (Largest Contentful Paint) | Thời điểm phần tử lớn nhất hiện ra | ≤ 2.5s |
| **CLS** (Cumulative Layout Shift)  | Mức độ layout "nhảy" trong khi load | ≤ 0.1 |
| **INP** (Interaction to Next Paint)| Độ trễ phản hồi tương tác (thay FID từ 2024) | ≤ 200ms |

Next.js có cơ chế tối ưu **built-in cho từng metric**:

**LCP**:
- `next/image` với prop `priority` → preload hero image, không lazy load nhầm phần tử LCP.
- **SSR/SSG**: HTML có content ngay từ response đầu — không phải đợi JS tải xong rồi mới render như SPA thuần.
- `next/font` tự preload font cho route → text render sớm.

**CLS**:
- `next/image` **bắt buộc** `width`/`height` (hoặc `fill`) → reserve sẵn không gian, ảnh về không đẩy layout.
- `next/font` generate fallback font với `size-adjust`/`ascent-override` → swap font không đổi dimension chữ.

**INP**:
- **Server Components** giảm lượng JS ship xuống client → main thread rảnh hơn để phản hồi tương tác.
- **Code splitting tự động theo route** — user chỉ tải JS của trang đang xem.
- `next/dynamic` cho component nặng → loại khỏi initial bundle, hydrate ít hơn.

**Đo lường**: hook `useReportWebVitals` (từ `next/web-vitals`) gửi metric thực từ user về analytics; **Vercel Analytics/Speed Insights** đo field data tự động; **Lighthouse** cho lab data khi dev. Nguyên tắc: ưu tiên **field data** (user thật) hơn lab data.

**Pitfall**: chỉ chạy Lighthouse trên máy dev mạng nhanh rồi kết luận "đạt" — số thực từ user mobile 3G mới là cái Google dùng xếp hạng (CrUX).

### Code minh hoạ

```tsx
// app/page.tsx — tối ưu LCP + CLS bằng built-in
import Image from "next/image";

export default function Home() {
  return (
    // LCP: hero image preload bằng priority; CLS: width/height reserve chỗ
    <Image src="/hero.jpg" width={1200} height={600} alt="Hero" priority />
  );
}
```

```tsx
// app/components/web-vitals.tsx — đo metric thực từ user
"use client";
import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    // metric.name: "LCP" | "CLS" | "INP" | "FCP" | "TTFB"
    // Gửi về analytics — dùng sendBeacon để không block unload
    const body = JSON.stringify(metric);
    navigator.sendBeacon("/api/analytics", body);
  });
  return null;
}
// → đặt component này trong app/layout.tsx
```

```tsx
// Tối ưu INP: component nặng không vào initial bundle
import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("@/components/HeavyChart"), {
  loading: () => <p>Đang tải biểu đồ...</p>,
});

// Server Component: logic format/parse chạy trên server,
// thư viện không ship xuống client → main thread nhẹ → INP tốt hơn
import { marked } from "marked";

export default async function PostBody({ md }: { md: string }) {
  const html = marked(md);
  return (
    <>
      <article dangerouslySetInnerHTML={{ __html: html }} />
      <HeavyChart />
    </>
  );
}
```

### Đáp án mẫu

> "Core Web Vitals gồm 3 chỉ số: LCP đo thời điểm phần tử lớn nhất hiện ra, ngưỡng tốt là 2.5 giây; CLS đo layout nhảy, ngưỡng 0.1; và INP đo độ trễ phản hồi tương tác — thay cho FID, ngưỡng 200ms. Next.js tối ưu từng cái khá bài bản ạ. LCP: SSR/SSG cho HTML có content ngay, `next/image` với `priority` preload hero image, `next/font` preload font. CLS: `next/image` bắt buộc width/height để reserve chỗ, `next/font` dùng `size-adjust` cho fallback font nên swap font không nhảy layout. INP: Server Components giảm JS ship xuống client, code splitting tự động theo route, cộng `next/dynamic` cho component nặng. Để đo, em dùng `useReportWebVitals` gửi field data về analytics, kết hợp Vercel Speed Insights và Lighthouse. Em luôn tin field data từ user thật hơn lab data — vì đó mới là số Google dùng xếp hạng."

---

## Câu 41: Environment variables trong Next.js được xử lý như thế nào? `[Intermediate]`

### Câu hỏi

> Environment variables trong Next.js được xử lý như thế nào?

### Giải thích lý thuyết

Next.js load env từ các file `.env*` theo **thứ tự ưu tiên** (cao đè thấp): `process.env` của hệ thống → `.env.$(NODE_ENV).local` → `.env.local` (bị bỏ qua khi chạy test) → `.env.$(NODE_ENV)` (vd `.env.development`, `.env.production`) → `.env`. File `.local` chứa secret, **không commit**; file không `.local` chứa default, commit được.

Hai loại biến — khác nhau căn bản:

1. **Server-only (mặc định)**: biến không prefix chỉ đọc được trong code chạy server — Server Components, Route Handlers, Server Actions. Client bundle **không thấy** chúng → an toàn cho secret (DB URL, API key).
2. **`NEXT_PUBLIC_` prefix**: biến được **INLINE thẳng vào client bundle lúc BUILD** — Next thay `process.env.NEXT_PUBLIC_X` bằng giá trị literal khi bundle. Hai hệ quả quan trọng:
   - **Đổi env lúc runtime không có tác dụng** — giá trị đã "đóng băng" trong file JS từ lúc build. Muốn đổi phải rebuild.
   - **Là public** — ai mở DevTools cũng đọc được. **Pitfall chết người: đặt secret với prefix `NEXT_PUBLIC_` = leak secret cho cả thế giới.**

**Runtime env cho self-host** (1 image Docker chạy nhiều môi trường): không dùng `NEXT_PUBLIC_` cho giá trị cần đổi theo môi trường — thay vào đó **đọc env trong Server Component** rồi truyền xuống làm props, vì server đọc `process.env` lúc runtime thật. Lưu ý route đó phải dynamic (không bị prerender lúc build).

**Validate env lúc startup**: thiếu/sai env nên fail sớm lúc boot chứ không phải lúc user chạm vào feature. Pattern phổ biến: schema **Zod**, hoặc dùng sẵn **`@t3-oss/env-nextjs`** — phân tách server/client vars, build fail nếu lỡ import server var vào client.

Bảo vệ thêm: import package **`server-only`** vào module chứa secret — nếu module đó lỡ bị import vào Client Component, build fail ngay.

### Code minh hoạ

```bash
# .env (commit — default chung)
NEXT_PUBLIC_APP_NAME=MyShop

# .env.local (KHÔNG commit — secret, đè lên .env)
DATABASE_URL=postgresql://user:pass@localhost:5432/shop
STRIPE_SECRET_KEY=sk_live_xxx

# ❌ TUYỆT ĐỐI KHÔNG: secret với NEXT_PUBLIC_ → inline vào bundle, ai cũng đọc được
# NEXT_PUBLIC_STRIPE_SECRET_KEY=sk_live_xxx
```

```typescript
// env.ts — validate env lúc startup với Zod (@t3-oss/env-nextjs)
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    STRIPE_SECRET_KEY: z.string().min(1),
  },
  client: {
    // Client var BẮT BUỘC prefix NEXT_PUBLIC_ — lib enforce điều này
    NEXT_PUBLIC_APP_NAME: z.string().min(1),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  },
});
// Thiếu/sai env → fail ngay lúc build/boot, không đợi user chạm vào feature
```

```tsx
// app/page.tsx — runtime env cho self-host: đọc trong Server Component
import "server-only"; // lỡ import vào Client Component là build fail

export const dynamic = "force-dynamic"; // không prerender → đọc env lúc runtime

export default function Page() {
  // Server đọc process.env lúc RUNTIME thật → 1 Docker image chạy nhiều env
  const apiUrl = process.env.INTERNAL_API_URL!;
  return <ClientWidget apiUrl={apiUrl} />; // truyền xuống client qua props
}
```

```tsx
// ❌ Pitfall: tưởng đổi được lúc runtime
// docker run -e NEXT_PUBLIC_API_URL=https://staging... my-app
// → VÔ TÁC DỤNG: giá trị đã inline vào bundle từ lúc `next build`
"use client";
export function ApiBadge() {
  // Chuỗi này là literal trong file JS sau build, không phải lookup runtime
  return <span>{process.env.NEXT_PUBLIC_API_URL}</span>;
}
```

### Đáp án mẫu

> "Next.js load env từ các file `.env` theo thứ tự ưu tiên — `.env.local` đè `.env.development`/`.env.production`, rồi mới tới `.env`; file `.local` chứa secret và không commit. Có hai loại biến ạ: biến thường là server-only, chỉ đọc được trong Server Component, Route Handler, Server Action — an toàn cho secret. Còn biến prefix `NEXT_PUBLIC_` thì được inline thẳng vào client bundle lúc build — nghĩa là đổi env lúc runtime vô tác dụng, phải rebuild, và nó là public, ai mở DevTools cũng đọc được. Pitfall chết người là đặt secret với `NEXT_PUBLIC_` — coi như leak. Khi self-host một Docker image chạy nhiều môi trường, em không dùng `NEXT_PUBLIC_` cho giá trị đổi theo môi trường mà đọc env trong Server Component lúc runtime rồi truyền props xuống. Và em luôn validate env lúc startup bằng Zod — thường dùng `@t3-oss/env-nextjs` — để thiếu env là fail ngay lúc boot."

---

## Câu 59: Bundle analyzer trong Next.js được dùng như thế nào? `[Intermediate]`

### Câu hỏi

> Bundle analyzer trong Next.js được dùng như thế nào? Khi client bundle phình to, em chẩn đoán và xử lý theo quy trình nào?

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

## Câu 60: Turbopack là gì và lợi ích của nó trong Next.js? `[Intermediate]`

### Câu hỏi

> Turbopack là gì và lợi ích của nó trong Next.js? Vì sao nó nhanh hơn webpack, và tới Next.js 15 thì trạng thái production-ready đến đâu?

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
| "styled-components dùng được trong Server Component" | CSS-in-JS runtime cần JS + context → chỉ chạy trong Client Component; SSR còn cần registry `useServerInsertedHTML` |
| "CSS Modules/Tailwind cũng cần runtime như CSS-in-JS"| Chúng là build-time — output CSS tĩnh, Server Component dùng vô tư        |
| "`next/image` optimize ảnh lúc build"                | On-demand lúc request đầu tiên qua `/_next/image`, rồi cache              |
| "`next/font` chỉ là cách import font cho gọn"        | Self-host lúc build + size-adjust fallback → privacy + zero CLS           |
| "Core Web Vitals vẫn gồm FID"                        | INP đã thay FID từ 2024; đo bằng field data thật, không chỉ Lighthouse    |
| "Đổi `NEXT_PUBLIC_` env lúc runtime là app nhận"     | Bị inline vào bundle lúc BUILD — đổi runtime vô tác dụng, phải rebuild    |
| "Đặt secret với prefix `NEXT_PUBLIC_` cho tiện"      | = leak secret: ai mở DevTools cũng đọc được client bundle                 |
| "Turbopack đã thay webpack hoàn toàn ở Next 15"      | Chỉ `next dev --turbo` stable; production build mặc định vẫn webpack      |
| "Bundle to thì cứ dynamic import hết là xong"        | Phải đo bằng analyzer trước, fix theo thủ phạm thật, gắn check vào CI     |
