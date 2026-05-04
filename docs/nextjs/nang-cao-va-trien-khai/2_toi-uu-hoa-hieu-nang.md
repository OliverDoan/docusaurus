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

Hiệu suất (performance) ảnh hưởng trực tiếp đến trải nghiệm người dùng và thứ hạng SEO. Next.js đã tích hợp sẵn rất nhiều tối ưu hóa, nhưng hiểu rõ và tận dụng cách sẽ giúp ứng dụng của bạn nhanh hơn đáng kể.

Bài này sẽ đi qua tất cả các kỹ thuật tối ưu hóa trong Next.js:

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

Next.js tự động tối ưu hóa nhiều thứ mà bạn không cần cấu hình gì:

| Tính năng | Mô tả |
|-----------|-------|
| Server Components | Giảm JavaScript gửi xuống client |
| Automatic Code Splitting | Tách code theo route |
| Prefetching | Tự động tải trước các trang liên kết |
| Image Optimization | Nén và resize ảnh tự động |
| Font Optimization | Tự động host font, không layout shift |
| Script Loading | Kiểm soát khi nào script được tải |
| Tree Shaking | Loại bỏ code không sử dụng |
| Minification | Nén code JavaScript và CSS |

---

## 2. Bundle Analysis

Để biết dung lượng JavaScript của ứng dụng, dùng `@next/bundle-analyzer`:

### 2.1 Cài đặt

```bash
npm install @next/bundle-analyzer
```

### 2.2 Cấu hình

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

### 2.3 Sử dụng

```bash
# Chạy build với analyzer
ANALYZE=true npm run build
```

Lệnh này sẽ mở trình duyệt hiển thị **treemap** cho thấy từng package chiếm bao nhiêu dung lượng. Từ đó bạn biết cần tối ưu cho nào.

**Mẹo đọc kết quả:**
- Màu đỏ lớn = package chiếm nhiều dung lượng
- Tìm các package lớn mà bạn ít dùng
- Xem xét thay thế hoặc lazy load các package lớn

---

## 3. Dynamic Imports và Lazy Loading

`next/dynamic` giúp tải component chỉ khi cần thiết, giảm bundle size ban đầu.

### 3.1 Dynamic import cơ bản

```tsx
// Thay vì import bình thường:
// import HeavyChart from "@/components/HeavyChart";

// Dung dynamic import:
import dynamic from "next/dynamic";

// Component chỉ được tải khi render
const HeavyChart = dynamic(() => import("@/components/HeavyChart"), {
  // Hiển thị khi đang tải component
  loading: () => <p>Đang tải biểu đồ...</p>,
});

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      {/* HeavyChart chỉ được download khi component này render */}
      <HeavyChart data={chartData} />
    </div>
  );
}
```

### 3.2 Tắt SSR cho client-only components

Một số components chỉ chạy được trên client (dùng window, document, v.v.):

```tsx
// Component này dùng thư viện chỉ chạy trên browser
const MapComponent = dynamic(() => import("@/components/Map"), {
  // Không render trên server
  ssr: false,
  loading: () => <div style={{ height: 400 }}>Đang tải bản đồ...</div>,
});
```

### 3.3 Dynamic import với named exports

```tsx
// Nếu component là named export (không phải default)
const SpecificComponent = dynamic(() =>
  import("@/components/MyLib").then((mod) => mod.SpecificComponent)
);
```

---

## 4. Image Optimization

Component `next/image` tự động tối ưu hóa hình ảnh.

### 4.1 Sử dụng cơ bản

```tsx
import Image from "next/image";

export function ProductCard() {
  return (
    <div>
      {/* Next.js tự động: resize, nén, chuyển sang WebP/AVIF */}
      <Image
        src="/products/ao-thun.jpg"
        alt="Áo thun trắng"
        width={400}
        height={300}
        // Lazy load mặc định - chỉ tải khi vào viewport
      />
    </div>
  );
}
```

### 4.2 Priority cho ảnh LCP

Ảnh quan trọng nhất (hero image, banner) cần load ngay:

```tsx
<Image
  src="/hero-banner.jpg"
  alt="Banner chính"
  width={1200}
  height={600}
  // priority=true tắt lazy loading, preload ảnh này
  priority
  // placeholder="blur" hiển thị ảnh mờ trước khi load xong
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQ..."
/>
```

### 4.3 Responsive images

```tsx
// fill prop cho ảnh responsive theo container
<div style={{ position: "relative", width: "100%", height: "300px" }}>
  <Image
    src="/banner.jpg"
    alt="Banner"
    fill
    // sizes giúp browser chọn đúng kích thước ảnh
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    style={{ objectFit: "cover" }}
  />
</div>
```

### 4.4 Cấu hình remote images

```tsx
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    // Cho phép tải ảnh từ các domain này
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
    // Định dạng ảnh ưu tiên
    formats: ["image/avif", "image/webp"],
  },
};
```

---

## 5. Font Optimization

`next/font` tự động host fonts, không layout shift (CLS = 0).

### 5.1 Google Fonts

```tsx
// app/layout.tsx
import { Inter, Roboto_Mono } from "next/font/google";

// Font chính cho body
const inter = Inter({
  subsets: ["latin", "vietnamese"], // Hỗ trợ tiếng Việt
  display: "swap", // Hiển thị text ngay, đợi font load
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

`next/script` kiểm soát khi nào script bên thứ 3 được tải.

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

        {/* afterInteractive (mặc định): tải sau khi trang interactive */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXX"
          strategy="afterInteractive"
        />

        {/* lazyOnload: tải khi browser rảnh (idle) */}
        <Script
          src="https://connect.facebook.net/en_US/sdk.js"
          strategy="lazyOnload"
        />

        {/* beforeInteractive: tải trước khi hydrate (cẩn thận!) */}
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

**Khi nào dùng strategy nào:**

| Strategy | Khi nào dùng |
|----------|-------------|
| `beforeInteractive` | Polyfills, bot detection (rất ít khi cần) |
| `afterInteractive` | Analytics, tag managers (phổ biến nhất) |
| `lazyOnload` | Chat widgets, social media embeds |
| `worker` | Offload script sang web worker (thực nghiệm) |

---

## 7. Code Splitting

Next.js tự động thực hiện code splitting:

### 7.1 Route-based splitting

Mỗi route (`page.tsx`) là một chunk riêng biệt. Khi truy cập `/about`, chỉ JavaScript của trang `/about` được tải.

### 7.2 Component-based splitting

Dùng `next/dynamic` như đã trình bày ở phần 3.

### 7.3 Package imports optimization

```tsx
// next.config.ts
const nextConfig: NextConfig = {
  // Chỉ import những function cần dùng từ package lớn
  // Thay vì import toàn bộ lodash
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
// Với optimizePackageImports, Next.js tự động tree-shake:
// Bạn viết như bình thường:
import { debounce, throttle } from "lodash";
// Next.js chỉ bundle debounce và throttle, không phải toàn bộ lodash
```

---

## 8. Prefetching Strategies

### 8.1 Link prefetching

```tsx
import Link from "next/link";

export function Navigation() {
  return (
    <nav>
      {/* Mặc định: prefetch khi link vào viewport */}
      <Link href="/products">Sản phẩm</Link>

      {/* Tắt prefetch cho link ít khi được click */}
      <Link href="/terms" prefetch={false}>
        Điều khoản
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
      Đi đến Dashboard
    </button>
  );
}
```

---

## 9. Core Web Vitals

Google đánh giá hiệu suất trang web qua 3 chỉ số Core Web Vitals:

### 9.1 LCP - Largest Contentful Paint

**Mục tiêu:** dưới 2.5 giây

LCP đo thời gian hiển thị phần tử lớn nhất trên màn hình (thường là hero image hoặc heading chính).

**Cách tối ưu:**
- Dùng `priority` cho hero image
- Preload font quan trọng
- Sử dụng Server Components để giảm JavaScript
- Tránh render blocking resources

### 9.2 INP - Interaction to Next Paint

**Mục tiêu:** dưới 200ms

INP (thay thế FID từ tháng 3/2024) đo độ trễ từ khi người dùng tương tác đến khi UI cập nhật.

**Cách tối ưu:**
- Giảm JavaScript trên main thread
- Dùng `useTransition` cho state updates lớn
- Offload heavy computation sang Web Workers

```tsx
"use client";
import { useTransition, useState } from "react";

export function FilterList({ items }: { items: string[] }) {
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState(items);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (value: string) => {
    setQuery(value); // Cập nhật input ngay lập tức

    // Đánh dấu filter là low-priority update
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
        placeholder="Tìm kiếm..."
      />
      {isPending && <p>Đang lọc...</p>}
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

CLS đo mức độ nhảy của layout khi trang đang tải.

**Cách tối ưu:**
- Luôn định nghĩa `width` và `height` cho images
- Dùng `next/font` (tự động chống layout shift)
- Tránh inject nội dung động phía trên fold
- Đặt placeholder cho nội dung async

---

## 10. next/third-parties

Next.js cung cấp package `@next/third-parties` để tích hợp an toàn các dịch vụ phổ biến:

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
        {/* Tự động tối ưu cách tải Google Analytics */}
        <GoogleAnalytics gaId="G-XXXXX" />
      </body>
    </html>
  );
}
```

```tsx
// Trang cụ thể cần YouTube embed
import { YouTubeEmbed } from "@next/third-parties/google";

export default function VideoPage() {
  return (
    <div>
      <h1>Video hướng dẫn</h1>
      {/* Lazy load YouTube player */}
      <YouTubeEmbed videoid="dQw4w9WgXcQ" />
    </div>
  );
}
```

---

## 11. Đo lường Performance

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
  // Gửi metric đến analytics service
  console.log(`${metric.name}: ${metric.value}`);

  // Gửi đến endpoint của bạn
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
# Cài đặt Lighthouse CI
npm install -g @lhci/cli

# Chạy Lighthouse trên build
lhci autorun --collect.url=http://localhost:3000
```

---

## 12. Lỗi thường gặp

### Lỗi 1: Bundle size lớn bất thường

```tsx
// Nguyên nhân: import toàn bộ thư viện thay vì chỉ function cần dùng

// SAI: import toàn bộ lodash (~70KB)
import _ from "lodash";
const result = _.debounce(fn, 300);

// ĐÚNG: chỉ import function cần dùng
import debounce from "lodash/debounce";
const result = debounce(fn, 300);

// HOẶC: dùng optimizePackageImports trong next.config.ts
```

### Lỗi 2: CLS cao do hình ảnh

```tsx
// SAI: không định nghĩa kích thước
<img src="/photo.jpg" alt="Photo" />

// ĐÚNG: dùng next/image với width và height
<Image src="/photo.jpg" alt="Photo" width={800} height={600} />
```

### Lỗi 3: LCP chậm vì ảnh hero

```tsx
// SAI: ảnh hero bị lazy load (mặc định)
<Image src="/hero.jpg" alt="Hero" width={1200} height={600} />

// ĐÚNG: thêm priority cho ảnh hero
<Image src="/hero.jpg" alt="Hero" width={1200} height={600} priority />
```

### Lỗi 4: Client Component quá lớn

```tsx
// SAI: đánh dấu "use client" cho toàn bộ page
"use client"; // Tất cả component con sẽ là client components!

// ĐÚNG: chỉ đánh dấu "use client" cho phần cần interactivity
// page.tsx (Server Component - không có "use client")
import { InteractiveButton } from "./InteractiveButton"; // này là client

export default function Page() {
  return (
    <div>
      <h1>Tiêu đề (Server Component - 0 JS)</h1>
      <p>Nội dung tĩnh (Server Component - 0 JS)</p>
      <InteractiveButton /> {/* Chỉ phần này gửi JS xuống client */}
    </div>
  );
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: Next.js tự động tối ưu hóa những gì?

**Trả lời:**

Next.js tích hợp sẵn các tối ưu hóa:
- **Server Components**: Giảm JS gửi xuống client, chỉ gửi HTML
- **Automatic code splitting**: Mỗi route là một JS chunk riêng
- **Prefetching**: Tự động tải trước trang liên kết khi vào viewport
- **Image optimization**: Tự động resize, nén, chuyển sang WebP/AVIF
- **Font optimization**: Self-host fonts, không layout shift
- **Tree shaking**: Loại bỏ code không dùng
- **Minification**: Nén JS và CSS cho production

### Câu 2: Core Web Vitals là gì? Làm sao tối ưu?

**Trả lời:**

Core Web Vitals là 3 chỉ số Google dùng để đánh giá trải nghiệm người dùng:

- **LCP** (Largest Contentful Paint) dưới 2.5s: Tối ưu bằng priority images, Server Components, preload fonts
- **INP** (Interaction to Next Paint) dưới 200ms: Giảm JS trên main thread, dùng `useTransition`
- **CLS** (Cumulative Layout Shift) dưới 0.1: Định nghĩa kích thước images, dùng `next/font`

### Câu 3: Khi nào nên dùng dynamic import?

**Trả lời:**

Dùng `next/dynamic` khi:
- Component **lớn** mà không cần hiển thị ngay (chart, editor, map)
- Component **chỉ chạy trên client** (dùng window, document)
- Component **ít khi được hiển thị** (modal, dialog)
- **Thư viện lớn** chỉ dùng ở một vài nơi

Không nên dùng cho:
- Component nhỏ, nhẹ
- Component luôn hiển thị trên trang
- Content quan trọng cho SEO (cần SSR)

### Câu 4: Server Components giúp tối ưu hiệu suất như thế nào?

**Trả lời:**

Server Components giúp giảm đáng kể lượng JavaScript gửi xuống client:

- Render trên server, chỉ gửi **HTML** xuống client
- Thư viện như `date-fns`, `lodash` chỉ chạy trên server, **không nằm trong client bundle**
- Data fetching trên server - gần với data source hơn, nhanh hơn
- Chỉ những component có `"use client"` mới gửi JavaScript xuống browser

Kết quả: **smaller bundle size, faster page loads, better SEO**.

### Câu 5: Làm sao phân tích và giảm bundle size?

**Trả lời:**

1. Dùng `@next/bundle-analyzer` để xem treemap của bundle
2. Tìm các package lớn và thay thế hoặc lazy load
3. Dùng `optimizePackageImports` trong next.config.ts
4. Import chỉ function cần dùng thay vì toàn bộ thư viện
5. Dịch chuyển heavy libraries sang Server Components
6. Dùng `next/dynamic` cho components lớn không cần thiết ngay
