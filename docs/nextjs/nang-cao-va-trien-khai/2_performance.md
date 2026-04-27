---
sidebar_position: 2
title: "2. Performance Optimization"
---

# Performance Optimization


---

## Mục lục

- [Giới thiệu](#giới-thiệu)
- [Nội dung](#nội-dung)
- [1. Next.js Built-in Optimizations](#1-nextjs-built-in-optimizations)
- [2. Bundle Analysis](#2-bundle-analysis)
- [3. Dynamic Imports va Lazy Loading](#3-dynamic-imports-va-lazy-loading)
- [4. Image Optimization](#4-image-optimization)
- [5. Font Optimization](#5-font-optimization)
- [6. Script Optimization](#6-script-optimization)
- [7. Code Splitting](#7-code-splitting)
- [8. Prefetching Strategies](#8-prefetching-strategies)
- [9. Core Web Vitals](#9-core-web-vitals)
- [10. next/third-parties](#10-nextthird-parties)
- [11. Do luông Performance](#11-do-luông-performance)
- [12. Lỗi thường gặp](#12-lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Giới thiệu

Hieu suat (performance) ảnh hưởng truc tiep den trải nghiệm người dùng va thứ hạng SEO. Next.js đã tích hợp san rat nhieu tối ưu hoa, nhung hieu ro va tan dứng dụng cach se giup ứng dụng của bạn nhanh hơn đáng kể.

Bai nay se di qua tất cả các kỹ thuật tối ưu hoa trong Next.js:

- Built-in optimizations
- Bundle analysis
- Dynamic imports
- Image, Font, Script optimization
- Code splitting
- Core Web Vitals
- Do luông hiệu suất

---

## Nội dung

1. [Next.js Built-in Optimizations](#1-nextjs-built-in-optimizations)
2. [Bundle Analysis](#2-bundle-analysis)
3. [Dynamic Imports va Lazy Loading](#3-dynamic-imports-va-lazy-loading)
4. [Image Optimization](#4-image-optimization)
5. [Font Optimization](#5-font-optimization)
6. [Script Optimization](#6-script-optimization)
7. [Code Splitting](#7-code-splitting)
8. [Prefetching Strategies](#8-prefetching-strategies)
9. [Core Web Vitals](#9-core-web-vitals)
10. [next/third-parties](#10-nextthird-parties)
11. [Do luông Performance](#11-do-luông-performance)
12. [Lỗi thường gặp](#12-loi-thuong-gap)
13. [Câu hỏi phỏng vấn](#cau-hoi-phong-van)

---

## 1. Next.js Built-in Optimizations

Next.js tự động tối ưu hoa nhiều thứ ma ban không cần cấu hình gi:

| Tính năng | Mô tả |
|-----------|-------|
| Server Components | Giam JavaScript gửi xuống client |
| Automatic Code Splitting | Tach code theo route |
| Prefetching | Tu dong tai truoc các trang lien ket |
| Image Optimization | Nen va resize anh tự động |
| Font Optimization | Tu dong host font, khong layout shift |
| Script Loading | Kiem soat khi nào script được tải |
| Tree Shaking | Loại bỏ code khong sử dụng |
| Minification | Nen code JavaScript va CSS |

---

## 2. Bundle Analysis

De biet dung lượng JavaScript cua ứng dụng, dung `@next/bundle-analyzer`:

### 2.1 Cai dat

```bash
npm install @next/bundle-analyzer
```

### 2.2 Cau hinh

```tsx
// next.config.ts
import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  // ...cấu hình khac
};

// Bọc config với bundle analyzer
const config = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})(nextConfig);

export default config;
```

### 2.3 Su dung

```bash
# Chạy build với analyzer
ANALYZE=true npm run build
```

Lệnh này se mo trinh duyet hiển thị **treemap** cho thay tung package chiem bao nhiêu dung lượng. Tu do ban biet can tối ưu cho nao.

**Meo đọc kết quả:**
- Mau do lon = package chiem nhieu dung lượng
- Tim các package lon ma ban it dung
- Xem xet thay the hoac lazy load các package lon

---

## 3. Dynamic Imports va Lazy Loading

`next/dynamic` giup tai component chi khi can thiet, giảm bundle size ban đầu.

### 3.1 Dynamic import co ban

```tsx
// Thay vi import bình thường:
// import HeavyChart from "@/components/HeavyChart";

// Dung dynamic import:
import dynamic from "next/dynamic";

// Component chi được tải khi render
const HeavyChart = dynamic(() => import("@/components/HeavyChart"), {
  // Hien thi khi đang tải component
  loading: () => <p>Dang tai bieu do...</p>,
});

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      {/* HeavyChart chi duoc download khi component nay render */}
      <HeavyChart data={chartData} />
    </div>
  );
}
```

### 3.2 Tat SSR cho client-only components

Mot so components chỉ chạy duoc trên client (dung window, document, v.v.):

```tsx
// Component nay dung thư viện chỉ chạy trên browser
const MapComponent = dynamic(() => import("@/components/Map"), {
  // Không render trên server
  ssr: false,
  loading: () => <div style={{ height: 400 }}>Dang tai ban do...</div>,
});
```

### 3.3 Dynamic import voi named exports

```tsx
// Nếu component la named export (không phải default)
const SpecificComponent = dynamic(() =>
  import("@/components/MyLib").then((mod) => mod.SpecificComponent)
);
```

---

## 4. Image Optimization

Component `next/image` tự động tối ưu hoa hinh anh.

### 4.1 Su dung co ban

```tsx
import Image from "next/image";

export function ProductCard() {
  return (
    <div>
      {/* Next.js tu dong: resize, nen, chuyen sang WebP/AVIF */}
      <Image
        src="/products/ao-thun.jpg"
        alt="Ao thun trang"
        width={400}
        height={300}
        // Lazy load mặc định - chi tai khi vao viewport
      />
    </div>
  );
}
```

### 4.2 Priority cho anh LCP

Anh quan trọng nhat (hero image, banner) can load ngay:

```tsx
<Image
  src="/hero-banner.jpg"
  alt="Banner chinh"
  width={1200}
  height={600}
  // priority=true tat lazy loading, preload anh nay
  priority
  // placeholder="blur" hiển thị anh mo trước khi load xong
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQ..."
/>
```

### 4.3 Responsive images

```tsx
// fill prop cho anh responsive theo container
<div style={{ position: "relative", width: "100%", height: "300px" }}>
  <Image
    src="/banner.jpg"
    alt="Banner"
    fill
    // sizes giup browser chon dung kích thước anh
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    style={{ objectFit: "cover" }}
  />
</div>
```

### 4.4 Cau hinh remote images

```tsx
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    // Cho phep tai anh tu các domain nay
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.example.com",
        pathname: "/images/**",
      },
    ],
    // Dinh dang anh ưu tiên
    formats: ["image/avif", "image/webp"],
  },
};
```

---

## 5. Font Optimization

`next/font` tự động host fonts, khong layout shift (CLS = 0).

### 5.1 Google Fonts

```tsx
// app/layout.tsx
import { Inter, Roboto_Mono } from "next/font/google";

// Font chinh cho body
const inter = Inter({
  subsets: ["latin", "vietnamese"], // Ho tro tieng Viet
  display: "swap", // Hien thi text ngay, doi font load
  variable: "--font-inter", // CSS variable
});

// Font cho code blocks
const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-mono",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${inter.variable} ${robotoMono.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

### 5.2 Local Fonts

```tsx
import localFont from "next/font/local";

const myFont = localFont({
  src: [
    {
      path: "./fonts/MyFont-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/MyFont-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-my-font",
});
```

---

## 6. Script Optimization

`next/script` kiem soat khi nào script bên thứ 3 được tải.

```tsx
import Script from "next/script";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        {children}

        {/* afterInteractive (mac dinh): tai sau khi trang interactive */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXX"
          strategy="afterInteractive"
        />

        {/* lazyOnload: tai khi browser ranh (idle) */}
        <Script
          src="https://connect.facebook.net/en_US/sdk.js"
          strategy="lazyOnload"
        />

        {/* beforeInteractive: tai truoc khi hydrate (can than!) */}
        <Script
          src="/scripts/critical-polyfill.js"
          strategy="beforeInteractive"
        />

        {/* Inline script */}
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXX');
          `}
        </Script>
      </body>
    </html>
  );
}
```

**Khi nào dùng strategy nao:**

| Strategy | Khi nào dùng |
|----------|-------------|
| `beforeInteractive` | Polyfills, bot detection (rat it khi can) |
| `afterInteractive` | Analytics, tag managers (phổ biến nhat) |
| `lazyOnload` | Chat widgets, social media embeds |
| `worker` | Offload script sang web worker (thuc nghiem) |

---

## 7. Code Splitting

Next.js tự động thực hiện code splitting:

### 7.1 Route-based splitting

Moi route (`page.tsx`) là một chunk riêng biet. Khi truy cập `/about`, chi JavaScript cua trang `/about` được tải.

### 7.2 Component-based splitting

Dung `next/dynamic` nhu da trinh bay o phan 3.

### 7.3 Package imports optimization

```tsx
// next.config.ts
const nextConfig: NextConfig = {
  // Chi import nhung function can dung tu package lon
  // Thay vi import toàn bộ lodash
  experimental: {
    optimizePackageImports: [
      "lodash",
      "@heroicons/react",
      "date-fns",
      "lucide-react",
    ],
  },
};
```

```tsx
// Voi optimizePackageImports, Next.js tự động tree-shake:
// Ban viet như bình thường:
import { debounce, throttle } from "lodash";
// Next.js chỉ bundle debounce va throttle, không phải toàn bộ lodash
```

---

## 8. Prefetching Strategies

### 8.1 Link prefetching

```tsx
import Link from "next/link";

export function Navigation() {
  return (
    <nav>
      {/* Mac dinh: prefetch khi link vao viewport */}
      <Link href="/products">San pham</Link>

      {/* Tat prefetch cho link it khi duoc click */}
      <Link href="/terms" prefetch={false}>
        Dieu khoan
      </Link>
    </nav>
  );
}
```

### 8.2 Router prefetch

```tsx
"use client";
import { useRouter } from "next/navigation";

export function SmartNavigation() {
  const router = useRouter();

  // Prefetch khi hover (trước khi click)
  const handleMouseEnter = () => {
    router.prefetch("/dashboard");
  };

  return (
    <button
      onMouseEnter={handleMouseEnter}
      onClick={() => router.push("/dashboard")}
    >
      Di den Dashboard
    </button>
  );
}
```

---

## 9. Core Web Vitals

Google đánh giá hiệu suất trang web qua 3 chi so Core Web Vitals:

### 9.1 LCP - Largest Contentful Paint

**Mục tiêu:** dưới 2.5 giay

LCP do thời gian hiển thị phan tu lon nhat trên màn hình (thuong la hero image hoac heading chinh).

**Cach tối ưu:**
- Dung `priority` cho hero image
- Preload font quan trọng
- Su dung Server Components de giảm JavaScript
- Tranh render blocking resources

### 9.2 INP - Interaction to Next Paint

**Mục tiêu:** dưới 200ms

INP (thay the FID tu thang 3/2024) do độ trễ tu khi người dùng tương tác den khi UI cập nhật.

**Cach tối ưu:**
- Giam JavaScript tren main thread
- Dung `useTransition` cho state updates lon
- Offload heavy computation sang Web Workers

```tsx
"use client";
import { useTransition, useState } from "react";

export function FilterList({ items }: { items: string[] }) {
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState(items);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (value: string) => {
    setQuery(value); // Cap nhat input ngay lập tức

    // Danh dau filter la low-priority update
    startTransition(() => {
      const result = items.filter((item) =>
        item.toLowerCase().includes(value.toLowerCase())
      );
      setFiltered(result);
    });
  };

  return (
    <div>
      <input
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Tim kiem..."
      />
      {isPending && <p>Dang loc...</p>}
      <ul>
        {filtered.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 9.3 CLS - Cumulative Layout Shift

**Mục tiêu:** dưới 0.1

CLS đo mức độ nhảy cua layout khi trang dang tai.

**Cach tối ưu:**
- Luon định nghĩa `width` va `height` cho images
- Dung `next/font` (tự động chong layout shift)
- Tranh inject nội dung dong phia tren fold
- Dat placeholder cho nội dung async

---

## 10. next/third-parties

Next.js cung cap package `@next/third-parties` de tích hợp an toàn cac dich vu phổ biến:

```bash
npm install @next/third-parties
```

```tsx
// app/layout.tsx
import { GoogleAnalytics } from "@next/third-parties/google";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        {children}
        {/* Tu dong toi uu cach tai Google Analytics */}
        <GoogleAnalytics gaId="G-XXXXX" />
      </body>
    </html>
  );
}
```

```tsx
// Trang cụ thể can YouTube embed
import { YouTubeEmbed } from "@next/third-parties/google";

export default function VideoPage() {
  return (
    <div>
      <h1>Video huong dan</h1>
      {/* Lazy load YouTube player */}
      <YouTubeEmbed videoid="dQw4w9WgXcQ" />
    </div>
  );
}
```

---

## 11. Do luông Performance

### 11.1 Next.js Speed Insights

```tsx
// app/layout.tsx
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### 11.2 Custom performance tracking

```tsx
// lib/performance.ts
export function reportWebVitals(metric: {
  name: string;
  value: number;
  id: string;
}) {
  // Gửi metric den analytics service
  console.log(`${metric.name}: ${metric.value}`);

  // Gửi den endpoint của bạn
  fetch("/api/analytics", {
    method: "POST",
    body: JSON.stringify({
      name: metric.name,
      value: metric.value,
      id: metric.id,
    }),
  });
}
```

### 11.3 Lighthouse CI

```bash
# Cai dat Lighthouse CI
npm install -g @lhci/cli

# Chay Lighthouse tren build
lhci autorun --collect.url=http://localhost:3000
```

---

## 12. Lỗi thường gặp

### Lỗi 1: Bundle size lon bat thuong

```tsx
// Nguyen nhan: import toàn bộ thư viện thay vi chi function can dung

// SAI: import toàn bộ lodash (~70KB)
import _ from "lodash";
const result = _.debounce(fn, 300);

// DUNG: chi import function can dung
import debounce from "lodash/debounce";
const result = debounce(fn, 300);

// HOAC: dung optimizePackageImports trong next.config.ts
```

### Lỗi 2: CLS cao do hinh anh

```tsx
// SAI: khong định nghĩa kích thước
<img src="/photo.jpg" alt="Photo" />

// DUNG: dung next/image voi width va height
<Image src="/photo.jpg" alt="Photo" width={800} height={600} />
```

### Lỗi 3: LCP cham vi anh hero

```tsx
// SAI: anh hero bi lazy load (mặc định)
<Image src="/hero.jpg" alt="Hero" width={1200} height={600} />

// DUNG: them priority cho anh hero
<Image src="/hero.jpg" alt="Hero" width={1200} height={600} priority />
```

### Lỗi 4: Client Component quá lớn

```tsx
// SAI: đánh dấu "use client" cho toàn bộ page
"use client"; // Tat ca component con se la client components!

// DUNG: chi đánh dấu "use client" cho phan can interactivity
// page.tsx (Server Component - không có "use client")
import { InteractiveButton } from "./InteractiveButton"; // nay la client

export default function Page() {
  return (
    <div>
      <h1>Tieu de (Server Component - 0 JS)</h1>
      <p>Noi dung tinh (Server Component - 0 JS)</p>
      <InteractiveButton /> {/* Chi phan nay gui JS xuong client */}
    </div>
  );
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: Next.js tự động tối ưu hoa nhung gi?

**Trả lời:**

Next.js tích hợp san cac tối ưu hoa:
- **Server Components**: Giam JS gửi xuống client, chi gui HTML
- **Automatic code splitting**: Moi route là một JS chunk riêng
- **Prefetching**: Tu dong tai truoc trang lien ket khi vao viewport
- **Image optimization**: Tu dong resize, nen, chuyển sang WebP/AVIF
- **Font optimization**: Self-host fonts, khong layout shift
- **Tree shaking**: Loại bỏ code khong dung
- **Minification**: Nen JS va CSS cho production

### Câu 2: Core Web Vitals là gì? Lam sao tối ưu?

**Trả lời:**

Core Web Vitals la 3 chi so Google dung de đánh giá trải nghiệm người dùng:

- **LCP** (Largest Contentful Paint) dưới 2.5s: Toi uu bang priority images, Server Components, preload fonts
- **INP** (Interaction to Next Paint) dưới 200ms: Giam JS tren main thread, dung `useTransition`
- **CLS** (Cumulative Layout Shift) dưới 0.1: Dinh nghia kích thước images, dung `next/font`

### Câu 3: Khi nao nen dung dynamic import?

**Trả lời:**

Dung `next/dynamic` khi:
- Component **lon** ma không cần hiển thị ngay (chart, editor, map)
- Component **chỉ chạy trên client** (dung window, document)
- Component **it khi duoc hiển thị** (modal, dialog)
- **Thu vien lon** chỉ dùng o mot vai noi

Không nen dung cho:
- Component nho, nhe
- Component luôn hiển thị tren trang
- Content quan trọng cho SEO (can SSR)

### Câu 4: Server Components giup tối ưu hiệu suất nhu thế nào?

**Trả lời:**

Server Components giup giảm đáng kể luông JavaScript gửi xuống client:

- Render trên server, chi gui **HTML** xuong client
- Thu vien nhu `date-fns`, `lodash` chỉ chạy trên server, **khong nam trong client bundle**
- Data fetching trên server - gan voi data source hon, nhanh hơn
- Chi nhung component co `"use client"` moi gui JavaScript xuong browser

Ket qua: **smaller bundle size, faster page loads, better SEO**.

### Câu 5: Lam sao phan tich va giảm bundle size?

**Trả lời:**

1. Dung `@next/bundle-analyzer` để xem treemap cua bundle
2. Tim các package lon va thay the hoac lazy load
3. Dung `optimizePackageImports` trong next.config.ts
4. Import chi function can dung thay vi toàn bộ thư viện
5. Di chuyển heavy libraries sang Server Components
6. Dung `next/dynamic` cho components lon không cần thiet ngay
