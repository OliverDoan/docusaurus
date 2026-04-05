---
sidebar_position: 2
title: "Performance Optimization"
---

# Performance Optimization

## Gioi thieu

Hieu suat (performance) anh huong truc tiep den trai nghiem nguoi dung va thu hang SEO. Next.js da tich hop san rat nhieu toi uu hoa, nhung hieu ro va tan dung dung cach se giup ung dung cua ban nhanh hon dang ke.

Bai nay se di qua tat ca cac ky thuat toi uu hoa trong Next.js:

- Built-in optimizations
- Bundle analysis
- Dynamic imports
- Image, Font, Script optimization
- Code splitting
- Core Web Vitals
- Do luong hieu suat

---

## Noi dung

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
11. [Do luong Performance](#11-do-luong-performance)
12. [Loi thuong gap](#12-loi-thuong-gap)
13. [Cau hoi phong van](#cau-hoi-phong-van)

---

## 1. Next.js Built-in Optimizations

Next.js tu dong toi uu hoa nhieu thu ma ban khong can cau hinh gi:

| Tinh nang | Mo ta |
|-----------|-------|
| Server Components | Giam JavaScript gui xuong client |
| Automatic Code Splitting | Tach code theo route |
| Prefetching | Tu dong tai truoc cac trang lien ket |
| Image Optimization | Nen va resize anh tu dong |
| Font Optimization | Tu dong host font, khong layout shift |
| Script Loading | Kiem soat khi nao script duoc tai |
| Tree Shaking | Loai bo code khong su dung |
| Minification | Nen code JavaScript va CSS |

---

## 2. Bundle Analysis

De biet dung luong JavaScript cua ung dung, dung `@next/bundle-analyzer`:

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
  // ...cau hinh khac
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

Lenh nay se mo trinh duyet hien thi **treemap** cho thay tung package chiem bao nhieu dung luong. Tu do ban biet can toi uu cho nao.

**Meo doc ket qua:**
- Mau do lon = package chiem nhieu dung luong
- Tim cac package lon ma ban it dung
- Xem xet thay the hoac lazy load cac package lon

---

## 3. Dynamic Imports va Lazy Loading

`next/dynamic` giup tai component chi khi can thiet, giam bundle size ban dau.

### 3.1 Dynamic import co ban

```tsx
// Thay vi import binh thuong:
// import HeavyChart from "@/components/HeavyChart";

// Dung dynamic import:
import dynamic from "next/dynamic";

// Component chi duoc tai khi render
const HeavyChart = dynamic(() => import("@/components/HeavyChart"), {
  // Hien thi khi dang tai component
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

Mot so components chi chay duoc tren client (dung window, document, v.v.):

```tsx
// Component nay dung thu vien chi chay tren browser
const MapComponent = dynamic(() => import("@/components/Map"), {
  // Khong render tren server
  ssr: false,
  loading: () => <div style={{ height: 400 }}>Dang tai ban do...</div>,
});
```

### 3.3 Dynamic import voi named exports

```tsx
// Neu component la named export (khong phai default)
const SpecificComponent = dynamic(() =>
  import("@/components/MyLib").then((mod) => mod.SpecificComponent)
);
```

---

## 4. Image Optimization

Component `next/image` tu dong toi uu hoa hinh anh.

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
        // Lazy load mac dinh - chi tai khi vao viewport
      />
    </div>
  );
}
```

### 4.2 Priority cho anh LCP

Anh quan trong nhat (hero image, banner) can load ngay:

```tsx
<Image
  src="/hero-banner.jpg"
  alt="Banner chinh"
  width={1200}
  height={600}
  // priority=true tat lazy loading, preload anh nay
  priority
  // placeholder="blur" hien thi anh mo truoc khi load xong
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
    // sizes giup browser chon dung kich thuoc anh
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
    // Cho phep tai anh tu cac domain nay
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
    // Dinh dang anh uu tien
    formats: ["image/avif", "image/webp"],
  },
};
```

---

## 5. Font Optimization

`next/font` tu dong host fonts, khong layout shift (CLS = 0).

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

`next/script` kiem soat khi nao script ben thu 3 duoc tai.

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

**Khi nao dung strategy nao:**

| Strategy | Khi nao dung |
|----------|-------------|
| `beforeInteractive` | Polyfills, bot detection (rat it khi can) |
| `afterInteractive` | Analytics, tag managers (pho bien nhat) |
| `lazyOnload` | Chat widgets, social media embeds |
| `worker` | Offload script sang web worker (thuc nghiem) |

---

## 7. Code Splitting

Next.js tu dong thuc hien code splitting:

### 7.1 Route-based splitting

Moi route (`page.tsx`) la mot chunk rieng biet. Khi truy cap `/about`, chi JavaScript cua trang `/about` duoc tai.

### 7.2 Component-based splitting

Dung `next/dynamic` nhu da trinh bay o phan 3.

### 7.3 Package imports optimization

```tsx
// next.config.ts
const nextConfig: NextConfig = {
  // Chi import nhung function can dung tu package lon
  // Thay vi import toan bo lodash
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
// Voi optimizePackageImports, Next.js tu dong tree-shake:
// Ban viet nhu binh thuong:
import { debounce, throttle } from "lodash";
// Next.js chi bundle debounce va throttle, khong phai toan bo lodash
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

  // Prefetch khi hover (truoc khi click)
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

Google danh gia hieu suat trang web qua 3 chi so Core Web Vitals:

### 9.1 LCP - Largest Contentful Paint

**Muc tieu:** duoi 2.5 giay

LCP do thoi gian hien thi phan tu lon nhat tren man hinh (thuong la hero image hoac heading chinh).

**Cach toi uu:**
- Dung `priority` cho hero image
- Preload font quan trong
- Su dung Server Components de giam JavaScript
- Tranh render blocking resources

### 9.2 INP - Interaction to Next Paint

**Muc tieu:** duoi 200ms

INP (thay the FID tu thang 3/2024) do do tre tu khi nguoi dung tuong tac den khi UI cap nhat.

**Cach toi uu:**
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
    setQuery(value); // Cap nhat input ngay lap tuc

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

**Muc tieu:** duoi 0.1

CLS do muc do nay nhay cua layout khi trang dang tai.

**Cach toi uu:**
- Luon dinh nghia `width` va `height` cho images
- Dung `next/font` (tu dong chong layout shift)
- Tranh inject noi dung dong phia tren fold
- Dat placeholder cho noi dung async

---

## 10. next/third-parties

Next.js cung cap package `@next/third-parties` de tich hop an toan cac dich vu pho bien:

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
// Trang cu the can YouTube embed
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

## 11. Do luong Performance

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
  // Gui metric den analytics service
  console.log(`${metric.name}: ${metric.value}`);

  // Gui den endpoint cua ban
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

## 12. Loi thuong gap

### Loi 1: Bundle size lon bat thuong

```tsx
// Nguyen nhan: import toan bo thu vien thay vi chi function can dung

// SAI: import toan bo lodash (~70KB)
import _ from "lodash";
const result = _.debounce(fn, 300);

// DUNG: chi import function can dung
import debounce from "lodash/debounce";
const result = debounce(fn, 300);

// HOAC: dung optimizePackageImports trong next.config.ts
```

### Loi 2: CLS cao do hinh anh

```tsx
// SAI: khong dinh nghia kich thuoc
<img src="/photo.jpg" alt="Photo" />

// DUNG: dung next/image voi width va height
<Image src="/photo.jpg" alt="Photo" width={800} height={600} />
```

### Loi 3: LCP cham vi anh hero

```tsx
// SAI: anh hero bi lazy load (mac dinh)
<Image src="/hero.jpg" alt="Hero" width={1200} height={600} />

// DUNG: them priority cho anh hero
<Image src="/hero.jpg" alt="Hero" width={1200} height={600} priority />
```

### Loi 4: Client Component qua lon

```tsx
// SAI: danh dau "use client" cho toan bo page
"use client"; // Tat ca component con se la client components!

// DUNG: chi danh dau "use client" cho phan can interactivity
// page.tsx (Server Component - khong co "use client")
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

## Cau hoi phong van

### Cau 1: Next.js tu dong toi uu hoa nhung gi?

**Tra loi:**

Next.js tich hop san cac toi uu hoa:
- **Server Components**: Giam JS gui xuong client, chi gui HTML
- **Automatic code splitting**: Moi route la mot JS chunk rieng
- **Prefetching**: Tu dong tai truoc trang lien ket khi vao viewport
- **Image optimization**: Tu dong resize, nen, chuyen sang WebP/AVIF
- **Font optimization**: Self-host fonts, khong layout shift
- **Tree shaking**: Loai bo code khong dung
- **Minification**: Nen JS va CSS cho production

### Cau 2: Core Web Vitals la gi? Lam sao toi uu?

**Tra loi:**

Core Web Vitals la 3 chi so Google dung de danh gia trai nghiem nguoi dung:

- **LCP** (Largest Contentful Paint) duoi 2.5s: Toi uu bang priority images, Server Components, preload fonts
- **INP** (Interaction to Next Paint) duoi 200ms: Giam JS tren main thread, dung `useTransition`
- **CLS** (Cumulative Layout Shift) duoi 0.1: Dinh nghia kich thuoc images, dung `next/font`

### Cau 3: Khi nao nen dung dynamic import?

**Tra loi:**

Dung `next/dynamic` khi:
- Component **lon** ma khong can hien thi ngay (chart, editor, map)
- Component **chi chay tren client** (dung window, document)
- Component **it khi duoc hien thi** (modal, dialog)
- **Thu vien lon** chi dung o mot vai noi

Khong nen dung cho:
- Component nho, nhe
- Component luon hien thi tren trang
- Content quan trong cho SEO (can SSR)

### Cau 4: Server Components giup toi uu hieu suat nhu the nao?

**Tra loi:**

Server Components giup giam dang ke luong JavaScript gui xuong client:

- Render tren server, chi gui **HTML** xuong client
- Thu vien nhu `date-fns`, `lodash` chi chay tren server, **khong nam trong client bundle**
- Data fetching tren server - gan voi data source hon, nhanh hon
- Chi nhung component co `"use client"` moi gui JavaScript xuong browser

Ket qua: **smaller bundle size, faster page loads, better SEO**.

### Cau 5: Lam sao phan tich va giam bundle size?

**Tra loi:**

1. Dung `@next/bundle-analyzer` de xem treemap cua bundle
2. Tim cac package lon va thay the hoac lazy load
3. Dung `optimizePackageImports` trong next.config.ts
4. Import chi function can dung thay vi toan bo thu vien
5. Di chuyen heavy libraries sang Server Components
6. Dung `next/dynamic` cho components lon khong can thiet ngay
