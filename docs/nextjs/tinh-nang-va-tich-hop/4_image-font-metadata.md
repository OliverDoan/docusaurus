---
sidebar_position: 4
title: "4. Image, Font title: "Image, Font & Metadata" Metadata"
---

# Image, Font & Metadata

## next/image — Tối ưu hình ảnh tự động

Component `next/image` (thường import với tên `Image`) là giải pháp built-in của Next.js để tối ưu hình ảnh. Nó tự động:

- **Resize** theo kích thước hiển thị thực tế
- **Lazy load** — chỉ tải khi hình ảnh sắp xuất hiện trong viewport
- **Chuyển đổi format** sang WebP/AVIF (nhẹ hơn 30-50% so với JPEG/PNG)
- **Prevent layout shift** — giữ chỗ cho hình ảnh trước khi tải xong

### Sử dụng cơ bản

```tsx
// app/page.tsx

import Image from "next/image";

// ===== Hình ảnh local (import trực tiếp) =====
import heroImage from "@/public/images/hero.jpg";

export default function HomePage() {
  return (
    <div>
      {/* Hình local — Next.js tự biết width/height */}
      <Image
        src={heroImage}
        alt="Banner trang chủ"
        placeholder="blur"       // Hiển thị blur placeholder khi đang tải
        priority                  // Tải ngay (cho hình ảnh above the fold)
      />

      {/* Hình remote — PHẢI chỉ định width và height */}
      <Image
        src="https://example.com/photo.jpg"
        alt="Ảnh từ server"
        width={800}
        height={600}
        quality={85}             // Chất lượng 0-100 (mặc định 75)
      />
    </div>
  );
}
```

### Width, Height và Fill props

Ba cách để Next.js biết kích thước hình ảnh:

```tsx
// Cách 1: Import trực tiếp (Next.js tự detect kích thước)
import avatar from "@/public/avatar.png";
<Image src={avatar} alt="Avatar" />

// Cách 2: Chỉ định width và height (pixel)
<Image
  src="https://example.com/photo.jpg"
  alt="Photo"
  width={400}     // Chiều rộng hiển thị (px)
  height={300}    // Chiều cao hiển thị (px)
/>

// Cách 3: Dùng fill — hình ảnh lấp đầy parent container
// Parent PHẢI có position: relative
<div style={{ position: "relative", width: "100%", height: "400px" }}>
  <Image
    src="https://example.com/banner.jpg"
    alt="Banner"
    fill                        // Lấp đầy parent
    style={{ objectFit: "cover" }}  // Cắt để lấp đầy (giống background-size: cover)
    sizes="100vw"               // Gợi ý kích thước cho responsive
  />
</div>
```

### Responsive images với `sizes`

Prop `sizes` cho trình duyệt biết hình ảnh sẽ hiển thị ở kích thước nào tại các breakpoint khác nhau. Điều này giúp tải đúng kích thước hình ảnh.

```tsx
// Hình ảnh full-width trên mobile, 50% trên tablet, 33% trên desktop
<Image
  src="/photos/landscape.jpg"
  alt="Phong cảnh"
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  style={{ objectFit: "cover" }}
/>

// Hình ảnh cố định kích thước
<Image
  src="/photos/thumbnail.jpg"
  alt="Thumbnail"
  width={200}
  height={200}
  sizes="200px"    // Luôn hiển thị 200px
/>
```

### Cấu hình remote images

Mặc định, Next.js chỉ tối ưu hình ảnh local. Muốn dùng hình ảnh remote, phải khai báo domain.

```tsx
// next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cách 1: remotePatterns (khuyến nghị — linh hoạt hơn)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.amazonaws.com",  // Wildcard cho S3
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google avatar
      },
    ],

    // Tùy chỉnh formats (mặc định: image/webp)
    formats: ["image/avif", "image/webp"],

    // Kích thước ảnh sẽ generate
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
```

### Blur Placeholder

Blur placeholder hiển thị ảnh mờ trong khi ảnh chính đang tải — giúp UX mượt hơn.

```tsx
// Hình local — blur tự động (Next.js generate blur data khi build)
import photo from "@/public/photo.jpg";

<Image
  src={photo}
  alt="Photo"
  placeholder="blur"    // Tự động dùng blur data từ import
/>

// Hình remote — phải cung cấp blurDataURL
<Image
  src="https://example.com/photo.jpg"
  alt="Photo"
  width={800}
  height={600}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQ..."  // Base64 tiny image
/>

// Tạo blurDataURL dynamically
// Có thể dùng package "plaiceholder" để generate
```

### Best practices cho Image

```tsx
// 1. LUÔN có alt text mô tả nội dung hình ảnh
<Image src={photo} alt="Nhóm sinh viên đang thảo luận trong phòng họp" />

// 2. Dùng priority cho hình ảnh above the fold (LCP)
<Image src={hero} alt="Hero banner" priority />

// 3. Dùng sizes cho responsive images
<Image src={photo} alt="Photo" fill sizes="(max-width: 768px) 100vw, 50vw" />

// 4. Tránh layout shift — luôn có width/height hoặc fill
// SAI: thiếu dimensions
// <img src="/photo.jpg" alt="Photo" />

// 5. Dùng quality hợp lý (75-85 cho photos, 90-100 cho text/logos)
<Image src={logo} alt="Logo" width={200} height={50} quality={95} />
```

## next/font — Zero Layout Shift

`next/font` tải font **tại build time** và self-host — không cần request đến Google Fonts lúc runtime. Kết quả: zero layout shift (CLS = 0) và tải trang nhanh hơn.

### Google Fonts

```tsx
// app/layout.tsx

import { Inter, Roboto_Mono, Noto_Sans } from "next/font/google";

// Khai báo font — Next.js tải font tại build time
const inter = Inter({
  subsets: ["latin", "vietnamese"],  // Subset cho tiếng Việt!
  display: "swap",                    // Hiển thị text ngay, swap font khi tải xong
  variable: "--font-inter",           // CSS variable (tùy chọn)
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-mono",
  weight: ["400", "700"],            // Chỉ tải weights cần thiết
});

// Font hỗ trợ tiếng Việt tốt
const notoSans = Noto_Sans({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-noto-sans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} ${robotoMono.variable} ${notoSans.variable}`}
    >
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
```

### Sử dụng font trong CSS

```css
/* app/globals.css */

/* Dùng CSS variable */
body {
  font-family: var(--font-inter), system-ui, sans-serif;
}

code, pre {
  font-family: var(--font-roboto-mono), monospace;
}

/* Dùng với Tailwind CSS */
/* tailwind.config.ts */
```

```tsx
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-roboto-mono)", "monospace"],
      },
    },
  },
};

export default config;
```

### Local Fonts

Khi bạn có file font riêng (mua license, font custom...).

```tsx
// app/layout.tsx

import localFont from "next/font/local";

const myFont = localFont({
  src: [
    {
      path: "../public/fonts/MyFont-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/MyFont-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/MyFont-Italic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--font-my-font",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={myFont.variable}>
      <body className={myFont.className}>
        {children}
      </body>
    </html>
  );
}
```

### Variable Fonts (khuyến nghị)

Variable fonts chứa tất cả weight/style trong 1 file — nhẹ hơn và linh hoạt hơn.

```tsx
import localFont from "next/font/local";

// 1 file chứa tất cả weights
const geist = localFont({
  src: "../public/fonts/GeistVF.woff2",
  variable: "--font-geist",
  display: "swap",
});

// Dùng bất kỳ weight nào
// <p style={{ fontWeight: 350 }}>Semi-light text</p>
// <p style={{ fontWeight: 650 }}>Semi-bold text</p>
```

## Metadata API — SEO và Social Sharing

Metadata API cho phép bạn định nghĩa `<head>` tags (title, description, OG tags...) cho từng trang. Next.js tự động merge metadata từ layout đến page.

### Static Metadata

```tsx
// app/layout.tsx — Metadata mặc định cho toàn site

import type { Metadata } from "next";

export const metadata: Metadata = {
  // === Cơ bản ===
  title: {
    default: "My App",                    // Title mặc định
    template: "%s | My App",              // Template cho các trang con
    // Trang con có title "About" → hiển thị "About | My App"
  },
  description: "Ứng dụng Next.js tuyệt vời",

  // === Favicon & Icons ===
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },

  // === Open Graph (Facebook, LinkedIn) ===
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://myapp.com",
    siteName: "My App",
    title: "My App — Ứng dụng Next.js",
    description: "Ứng dụng Next.js tuyệt vời",
    images: [
      {
        url: "https://myapp.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "My App Preview",
      },
    ],
  },

  // === Twitter Card ===
  twitter: {
    card: "summary_large_image",
    title: "My App",
    description: "Ứng dụng Next.js tuyệt vời",
    creator: "@myhandle",
    images: ["https://myapp.com/twitter-image.jpg"],
  },

  // === Robots ===
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // === Verification ===
  verification: {
    google: "google-site-verification-code",
  },

  // === Manifest ===
  manifest: "/site.webmanifest",
};
```

### Static Metadata cho từng trang

```tsx
// app/about/page.tsx

import type { Metadata } from "next";

// Metadata cụ thể cho trang About
export const metadata: Metadata = {
  title: "Giới thiệu",           // Sẽ hiển thị "Giới thiệu | My App" (nhờ template)
  description: "Tìm hiểu về chúng tôi và sứ mệnh của My App",
};

export default function AboutPage() {
  return <h1>Giới thiệu</h1>;
}
```

### Dynamic Metadata — `generateMetadata()`

Khi metadata phụ thuộc vào data dynamic (ID sản phẩm, slug bài viết...).

```tsx
// app/posts/[slug]/page.tsx

import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

// Params type
type Props = {
  params: Promise<{ slug: string }>;
};

// Hàm generateMetadata — Next.js gọi hàm này để lấy metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug },
    select: {
      title: true,
      content: true,
      author: { select: { name: true } },
    },
  });

  if (!post) {
    return {
      title: "Không tìm thấy bài viết",
    };
  }

  // Tạo description từ content (150 ký tự đầu)
  const description = post.content.substring(0, 150) + "...";

  return {
    title: post.title,
    description,
    authors: [{ name: post.author.name }],
    openGraph: {
      title: post.title,
      description,
      type: "article",
      url: `https://myapp.com/posts/${slug}`,
      images: [
        {
          url: `https://myapp.com/api/og?title=${encodeURIComponent(post.title)}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
    },
  };
}

// Page component
export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
  });

  if (!post) notFound();

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

### Favicon và Icons

Next.js hỗ trợ đặt file favicon trực tiếp trong thư mục `app/`:

```
app/
├── favicon.ico          ← Favicon (tự động nhận)
├── icon.svg             ← SVG icon (tự động nhận)
├── icon.png             ← PNG icon
├── apple-icon.png       ← Apple touch icon
├── opengraph-image.jpg  ← OG image mặc định
└── twitter-image.jpg    ← Twitter card image mặc định
```

Bạn cũng có thể generate OG images dynamically:

```tsx
// app/api/og/route.tsx — Dynamic OG Image

import { ImageResponse } from "next/og";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "My App";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0f172a",
          color: "white",
          fontSize: 60,
          fontWeight: "bold",
          padding: "40px",
        }}
      >
        {title}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
```

## SEO Best Practices

### Sitemap

```tsx
// app/sitemap.ts — Next.js tự generate /sitemap.xml

import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Lấy tất cả posts từ database
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  });

  const postUrls = posts.map((post) => ({
    url: `https://myapp.com/posts/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: "https://myapp.com",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://myapp.com/about",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...postUrls,
  ];
}
```

### Robots.txt

```tsx
// app/robots.ts — Next.js tự generate /robots.txt

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/private/"],
      },
    ],
    sitemap: "https://myapp.com/sitemap.xml",
  };
}
```

## Lỗi thường gặp

### 1. Quên cấu hình remote images

```tsx
// Lỗi: Invalid src prop on next/image, hostname "example.com" is not configured
// Giải pháp: thêm hostname vào next.config.ts remotePatterns
```

### 2. Dùng `next/image` thiếu width/height cho remote images

```tsx
// SAI — remote image không có width/height
<Image src="https://example.com/photo.jpg" alt="Photo" />

// ĐÚNG — option 1: chỉ định width/height
<Image src="https://example.com/photo.jpg" alt="Photo" width={800} height={600} />

// ĐÚNG — option 2: dùng fill (parent phải có position relative)
<div style={{ position: "relative", width: "100%", height: "300px" }}>
  <Image src="https://example.com/photo.jpg" alt="Photo" fill />
</div>
```

### 3. Font không hỗ trợ tiếng Việt

```tsx
// SAI — thiếu Vietnamese subset
const inter = Inter({ subsets: ["latin"] }); // Tiếng Việt hiển thị sai!

// ĐÚNG — thêm Vietnamese subset
const inter = Inter({ subsets: ["latin", "vietnamese"] });

// Hoặc dùng font hỗ trợ tiếng Việt tốt
const notoSans = Noto_Sans({ subsets: ["latin", "vietnamese"] });
```

### 4. Layout shift do font chưa tải

```tsx
// SAI — không dùng display: swap
const myFont = localFont({ src: "./font.woff2" });
// Text bị ẩn cho đến khi font tải xong → layout shift!

// ĐÚNG — dùng display: swap
const myFont = localFont({
  src: "./font.woff2",
  display: "swap",   // Hiển thị text với font fallback, swap khi font sẵn sàng
});
```

### 5. Metadata không hiển thị trên social media

```tsx
// Kiểm tra:
// 1. OG image phải là absolute URL (có domain)
// SAI
openGraph: { images: [{ url: "/og-image.jpg" }] }
// ĐÚNG
openGraph: { images: [{ url: "https://myapp.com/og-image.jpg" }] }

// 2. OG image nên có kích thước 1200x630 pixels
// 3. Dùng công cụ debug:
//    - Facebook: https://developers.facebook.com/tools/debug/
//    - Twitter: https://cards-dev.twitter.com/validator
```

## Câu hỏi phỏng vấn

### Câu 1: `next/image` tối ưu hình ảnh như thế nào?

**Trả lời:**

`next/image` tối ưu ở nhiều cấp:
1. **Automatic resizing** — generate nhiều kích thước ảnh, serve đúng size cho từng device.
2. **Format conversion** — tự động chuyển sang WebP/AVIF (nhẹ hơn 30-50%).
3. **Lazy loading** — mặc định chỉ tải ảnh khi gần viewport (dùng Intersection Observer).
4. **Blur placeholder** — hiển thị ảnh mờ khi đang tải, tránh layout shift.
5. **Caching** — ảnh được cache ở server, không cần optimize lại mỗi request.
6. **Responsive** — dùng `srcset` và `sizes` để trình duyệt chọn ảnh phù hợp.

### Câu 2: `next/font` giải quyết vấn đề gì? Tại sao nên dùng thay vì link Google Fonts thông thường?

**Trả lời:**

Vấn đề khi dùng `<link>` Google Fonts thông thường:
- **Layout shift (CLS)** — text hiển thị bằng font fallback, sau đó nhảy sang custom font.
- **Privacy** — request gửi đến Google, lộ IP user.
- **Performance** — thêm DNS lookup + connection đến fonts.googleapis.com.

`next/font` giải quyết bằng cách:
- Tải font **tại build time**, tự host trên cùng domain.
- Dùng CSS `size-adjust` để font fallback có cùng kích thước → zero layout shift.
- Không có external request lúc runtime → nhanh hơn, bảo mật hơn.

### Câu 3: Static metadata và dynamic metadata khác nhau thế nào?

**Trả lời:**

- **Static metadata**: export `const metadata` object — giá trị cố định, xác định tại build time. Dùng cho trang không phụ thuộc data (About, Contact, Home).
- **Dynamic metadata**: export `async function generateMetadata()` — fetch data rồi tạo metadata. Dùng cho trang phụ thuộc data (blog post, product detail). Next.js deduplicate fetch requests nếu `generateMetadata` và page component cùng fetch data.

### Câu 4: Prop `priority` trong `next/image` nên dùng khi nào?

**Trả lời:**

`priority` tắt lazy loading và preload hình ảnh (thêm `<link rel="preload">`). Nên dùng cho:
- Hình ảnh **above the fold** — hình đầu tiên user thấy khi vào trang.
- **LCP element** (Largest Contentful Paint) — hình ảnh lớn nhất trong viewport ban đầu.
- Hero banners, product main image.

Không nên dùng `priority` cho tất cả hình ảnh — sẽ làm chậm tải trang vì tải quá nhiều hình cùng lúc.

### Câu 5: Cách tối ưu SEO trong Next.js App Router?

**Trả lời:**

1. **Metadata API** — dùng `generateMetadata()` cho dynamic pages, static `metadata` cho static pages.
2. **Structured data** — thêm JSON-LD schema (Product, Article, FAQ...).
3. **Sitemap** — tạo `app/sitemap.ts` để generate `/sitemap.xml` tự động.
4. **Robots** — tạo `app/robots.ts` để kiểm soát crawling.
5. **OG Images** — tạo dynamic OG images bằng `ImageResponse` API.
6. **Semantic HTML** — dùng đúng thẻ (`h1`-`h6`, `article`, `nav`, `main`...).
7. **Performance** — Core Web Vitals (LCP, FID, CLS) ảnh hưởng trực tiếp đến SEO ranking.
8. **Server Components** — HTML render sẵn trên server, crawler đọc được nội dung ngay.
