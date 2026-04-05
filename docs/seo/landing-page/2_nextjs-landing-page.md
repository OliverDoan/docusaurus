---
sidebar_position: 2
title: "Landing Page với Next.js"
---

# Landing Page với Next.js

## Tại sao Next.js là lựa chọn hàng đầu cho landing page SEO?

Next.js giải quyết gần như mọi vấn đề SEO mà React thuần gặp phải. Với App Router, bạn có server-side rendering mặc định, static generation cho landing page, và API tối ưu metadata mạnh mẽ.

**Lợi ích SEO của Next.js:**
- Server Components render HTML trên server -> Google crawl được ngay
- Static Generation (SSG) cho landing page: tốc độ tải cực nhanh
- Metadata API tích hợp sẵn: không cần thư viện bên ngoài
- Image optimization tự động với `next/image`
- Font optimization với `next/font`
- Automatic code splitting: chỉ load JavaScript cần thiết

## Next.js App Router cho landing page

App Router (từ Next.js 13+) sử dụng React Server Components mặc định. Đây là thay đổi lớn cho SEO vì nội dung được render trên server.

### Cấu trúc thư mục

```bash
app/
├── layout.tsx          # Root layout (metadata chung)
├── page.tsx            # Homepage / Landing page
├── landing/
│   └── [slug]/
│       └── page.tsx    # Dynamic landing pages
├── components/
│   ├── Hero.tsx        # Hero section (Server Component)
│   ├── Features.tsx    # Features grid
│   ├── Testimonials.tsx
│   ├── FAQ.tsx
│   ├── CTA.tsx
│   └── PricingTable.tsx
└── globals.css
```

### Root layout với metadata mặc định

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://example.com'),
  title: {
    default: 'TenSanPham - Tạo Landing Page chuẩn SEO',
    template: '%s | TenSanPham',
  },
  description: 'Công cụ tạo landing page chuẩn SEO, tốc độ tải nhanh, tối ưu chuyển đổi.',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: 'TenSanPham',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://example.com',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
```

## Metadata API cho SEO

Next.js App Router cung cấp hai cách khai báo metadata: static và dynamic.

### Static Metadata

Dùng cho landing page có nội dung cố định:

```tsx
// app/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tạo Landing Page chuẩn SEO trong 30 phút',
  description: 'Công cụ kéo thả tạo landing page. Tối ưu SEO tự động, tốc độ tải dưới 1 giây. Bắt đầu miễn phí.',
  keywords: ['landing page', 'SEO', 'tạo landing page', 'tối ưu SEO'],
  openGraph: {
    title: 'Tạo Landing Page chuẩn SEO trong 30 phút',
    description: 'Công cụ kéo thả tạo landing page. Tối ưu SEO tự động.',
    images: [
      {
        url: '/og-landing-page.jpg',
        width: 1200,
        height: 630,
        alt: 'Landing Page chuẩn SEO',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tạo Landing Page chuẩn SEO trong 30 phút',
    description: 'Công cụ kéo thả tạo landing page. Tối ưu SEO tự động.',
    images: ['/og-landing-page.jpg'],
  },
}
```

### Dynamic Metadata với generateMetadata

Dùng cho landing page động (ví dụ: landing page cho từng thành phố, ngành nghề):

```tsx
// app/landing/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface LandingPageData {
  title: string
  description: string
  heroTitle: string
  heroSubtitle: string
  ogImage: string
}

async function getLandingPageData(slug: string): Promise<LandingPageData | null> {
  // Fetch từ CMS hoặc database
  const res = await fetch(`https://api.example.com/landing/${slug}`, {
    next: { revalidate: 3600 }, // ISR: revalidate mỗi 1 giờ
  })

  if (!res.ok) return null
  return res.json()
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const data = await getLandingPageData(params.slug)

  if (!data) {
    return {
      title: 'Không tìm thấy trang',
    }
  }

  return {
    title: data.title,
    description: data.description,
    openGraph: {
      title: data.title,
      description: data.description,
      images: [{ url: data.ogImage }],
    },
    alternates: {
      canonical: `https://example.com/landing/${params.slug}`,
    },
  }
}

export default async function LandingPage({
  params,
}: {
  params: { slug: string }
}) {
  const data = await getLandingPageData(params.slug)

  if (!data) {
    notFound()
  }

  return (
    <main>
      <section className="hero">
        <h1>{data.heroTitle}</h1>
        <p>{data.heroSubtitle}</p>
      </section>
    </main>
  )
}
```

### generateStaticParams cho pre-rendering

```tsx
// app/landing/[slug]/page.tsx
export async function generateStaticParams() {
  const slugs = await fetch('https://api.example.com/landing/slugs')
    .then(res => res.json())

  return slugs.map((slug: string) => ({ slug }))
}
```

Khi dùng `generateStaticParams`, Next.js sẽ pre-render tất cả các trang tại build time, cho tốc độ tải tối đa.

## Static Generation cho landing page

Landing page là ứng viên hoàn hảo cho Static Generation vì nội dung ít thay đổi.

### So sánh rendering strategies

| Strategy | Khi nào render | Tốc độ | SEO | Use case |
|----------|---------------|--------|-----|----------|
| SSG (Static) | Build time | Nhanh nhất | Tốt nhất | Landing page, blog |
| ISR | Build + revalidate | Rất nhanh | Rất tốt | Landing page cập nhật định kỳ |
| SSR | Mỗi request | Chậm hơn | Tốt | Nội dung cá nhân hóa |
| CSR | Client-side | Chậm nhất | Kém nhất | Dashboard, app nội bộ |

### Force static generation

```tsx
// app/page.tsx
// Cách 1: Mặc định nếu không có dynamic data
export default function LandingPage() {
  // Server Component không có dynamic data = static
  return <main>...</main>
}

// Cách 2: Khai báo tường minh
export const dynamic = 'force-static'
export const revalidate = false // Không revalidate, hoàn toàn static
```

### ISR cho landing page cập nhật từ CMS

```tsx
// app/page.tsx
export const revalidate = 3600 // Revalidate mỗi 1 giờ

async function getContent() {
  const res = await fetch('https://cms.example.com/landing', {
    next: { revalidate: 3600 },
  })
  return res.json()
}
```

## Image optimization với next/image

Hero image thường là LCP element. Tối ưu image là bắt buộc.

```tsx
// components/Hero.tsx
import Image from 'next/image'

export function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Tạo Landing Page chuẩn SEO trong 30 phút</h1>
        <p>Công cụ kéo thả dễ dùng. Tối ưu tốc độ và SEO tự động.</p>
        <a href="/signup" className="cta-primary">Bắt đầu miễn phí</a>
      </div>
      <div className="hero-image">
        <Image
          src="/images/hero-landing.webp"
          alt="Giao diện tạo landing page với editor kéo thả"
          width={1200}
          height={600}
          priority  // Preload hero image (critical for LCP)
          sizes="(max-width: 768px) 100vw, 50vw"
          quality={85}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
        />
      </div>
    </section>
  )
}
```

### Props quan trọng của `next/image` cho SEO

| Prop | Mục đích | Khi nào dùng |
|------|----------|-------------|
| `priority` | Preload image, tắt lazy loading | Hero image, LCP element |
| `sizes` | Responsive image sizes | Mọi responsive image |
| `quality` | Chất lượng nén (1-100) | Mặc định 75, hero nên 80-90 |
| `placeholder="blur"` | Hiển thị blur placeholder khi loading | Image lớn |
| `alt` | Mô tả hình ảnh cho SEO và accessibility | BẮT BUỘC mọi image |
| `loading="eager"` | Load ngay, không lazy | Tự động khi dùng `priority` |

### Lưu ý quan trọng

- Chỉ dùng `priority` cho 1-2 image above-the-fold
- Image below-the-fold nên để mặc định (lazy loading)
- Luôn khai báo `width` và `height` để tránh layout shift (CLS)
- Dùng `sizes` prop để Next.js generate đúng srcset

## Font optimization với next/font

Font loading ảnh hưởng CLS (Cumulative Layout Shift) và FCP.

```tsx
// app/layout.tsx
import { Inter, Noto_Sans } from 'next/font/google'

// Font chính cho tiếng Anh
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

// Font hỗ trợ tiếng Việt tốt
const notoSans = Noto_Sans({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-noto',
  weight: ['400', '500', '600', '700'],
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className={`${inter.variable} ${notoSans.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

```css
/* globals.css */
body {
  font-family: var(--font-noto), var(--font-inter), system-ui, sans-serif;
}

h1, h2, h3 {
  font-family: var(--font-inter), var(--font-noto), system-ui, sans-serif;
}
```

### Tại sao `next/font` tốt cho SEO?

1. **Self-hosted fonts:** Không cần request đến Google Fonts CDN (giảm DNS lookup)
2. **font-display: swap:** Text hiển thị ngay với fallback font, không bị invisible text
3. **Automatic subsetting:** Chỉ load ký tự cần thiết
4. **Zero layout shift:** CSS size-adjust tự động, tránh CLS

## Component structure cho landing page SEO-friendly

### Complete landing page với structured data

```tsx
// app/page.tsx
import type { Metadata } from 'next'
import { Hero } from '@/components/Hero'
import { Features } from '@/components/Features'
import { HowItWorks } from '@/components/HowItWorks'
import { Testimonials } from '@/components/Testimonials'
import { FAQ } from '@/components/FAQ'
import { FinalCTA } from '@/components/FinalCTA'

export const metadata: Metadata = {
  title: 'Tạo Landing Page chuẩn SEO trong 30 phút',
  description: 'Công cụ kéo thả tạo landing page. Tối ưu SEO tự động, tốc độ tải dưới 1 giây.',
}

// FAQ data cho cả component lẫn structured data
const faqItems = [
  {
    question: 'Landing page chuẩn SEO là gì?',
    answer: 'Landing page chuẩn SEO là trang đích được tối ưu cả nội dung, cấu trúc HTML, tốc độ tải và UX để ranking tốt trên Google.',
  },
  {
    question: 'Tạo landing page mất bao lâu?',
    answer: 'Với công cụ kéo thả, bạn có thể tạo landing page hoàn chỉnh trong 30 phút mà không cần biết code.',
  },
  {
    question: 'Landing page có miễn phí không?',
    answer: 'Có. Gói miễn phí cho phép tạo 3 landing page với đầy đủ tính năng SEO cơ bản.',
  },
]

// JSON-LD Structured Data
function JsonLd() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TenSanPham',
    url: 'https://example.com',
    logo: 'https://example.com/logo.png',
    sameAs: [
      'https://twitter.com/tensanpham',
      'https://github.com/tensanpham',
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
    </>
  )
}

export default function LandingPage() {
  return (
    <>
      <JsonLd />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <FAQ items={faqItems} />
        <FinalCTA />
      </main>
    </>
  )
}
```

### FAQ component

```tsx
// components/FAQ.tsx
interface FAQItem {
  question: string
  answer: string
}

export function FAQ({ items }: { items: FAQItem[] }) {
  return (
    <section id="faq" aria-labelledby="faq-heading">
      <h2 id="faq-heading">Câu hỏi thường gặp</h2>
      <div className="faq-list">
        {items.map((item, index) => (
          <details key={index}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
```

## Lỗi thường gặp

### 1. Dùng Client Component cho toàn bộ landing page

```tsx
// SAI: "use client" ở page level -> Google phải chạy JavaScript để thấy content
'use client'
export default function LandingPage() {
  return <main>...</main>
}

// ĐÚNG: Page là Server Component, chỉ interactive parts dùng Client Component
// page.tsx (Server Component - mặc định)
export default function LandingPage() {
  return (
    <main>
      <Hero />           {/* Server Component */}
      <Features />       {/* Server Component */}
      <ContactForm />    {/* Client Component - chỉ form cần interactivity */}
    </main>
  )
}
```

### 2. Quên canonical URL

Nếu landing page có thể truy cập qua nhiều URL (ví dụ: có và không có trailing slash), Google coi đây là duplicate content.

```tsx
// LUÔN khai báo canonical
export const metadata: Metadata = {
  alternates: {
    canonical: 'https://example.com/landing-page',
  },
}
```

### 3. Không set priority cho hero image

```tsx
// SAI: Hero image lazy-loaded -> LCP chậm
<Image src="/hero.webp" alt="Hero" width={1200} height={600} />

// ĐÚNG: Hero image preloaded
<Image src="/hero.webp" alt="Hero" width={1200} height={600} priority />
```

### 4. Metadata trùng nhau giữa các trang

Mỗi landing page phải có title và description **duy nhất**. Google sẽ chọn ngẫu nhiên nếu trùng.

### 5. Không dùng generateStaticParams

Nếu có dynamic landing pages mà không dùng `generateStaticParams`, trang sẽ SSR thay vì SSG, chậm hơn đáng kể.

## Câu hỏi phỏng vấn

### Câu 1: Next.js App Router xử lý metadata cho SEO như thế nào?

**Trả lời:** App Router cung cấp 2 cách: (1) Export `metadata` object từ `layout.tsx` hoặc `page.tsx` cho static metadata, (2) Export `generateMetadata` async function cho dynamic metadata dựa trên params hoặc data fetch. Metadata tự động merge từ root layout đến page, với page-level metadata override layout-level. Template pattern (ví dụ `title.template: '%s | Brand'`) cho phép tự động format title ở mọi trang con.

### Câu 2: Tại sao Server Components tốt cho SEO hơn Client Components?

**Trả lời:** Server Components render HTML trên server và gửi HTML hoàn chỉnh cho client. Search engine crawlers nhận được nội dung đầy đủ mà không cần chạy JavaScript. Client Components cần hydration trên browser, crawler có thể không thấy nội dung nếu không chạy JS. Ngoài ra, Server Components giảm JavaScript bundle size vì code không gửi xuống client, cải thiện tốc độ tải.

### Câu 3: Khi nào nên dùng SSG vs ISR vs SSR cho landing page?

**Trả lời:** SSG (Static Site Generation) cho landing page nội dung cố định, hiếm khi thay đổi - tốc độ nhanh nhất, SEO tốt nhất. ISR (Incremental Static Regeneration) cho landing page nội dung từ CMS, cần cập nhật định kỳ nhưng không real-time - set `revalidate` để cân bằng freshness và performance. SSR (Server-Side Rendering) cho landing page cá nhân hóa theo user/location - chậm hơn nhưng cần thiết khi nội dung thay đổi theo context.

### Câu 4: `next/image` cải thiện Core Web Vitals như thế nào?

**Trả lời:** `next/image` tự động optimize ảnh: convert sang WebP/AVIF (giảm size), generate responsive srcset (đúng size cho mỗi viewport), lazy loading mặc định (giảm initial load), width/height bắt buộc (tránh CLS), blur placeholder (cải thiện perceived performance). Prop `priority` preload hero image, giảm LCP. Props `sizes` giúp browser chọn đúng image size từ srcset.

### Câu 5: Giải thích cách `next/font` loại bỏ layout shift do font loading?

**Trả lời:** `next/font` self-host font files tại build time, loại bỏ network request đến Google Fonts. Sử dụng `font-display: swap` để text hiển thị ngay với fallback font. Quan trọng nhất là tự động tính `size-adjust` cho fallback font, giúp fallback font có cùng kích thước với custom font, nên khi swap font không gây layout shift (CLS = 0). Font files được inline trong HTML, không cần thêm request.
