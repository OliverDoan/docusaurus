---
sidebar_position: 5
title: "A/B Testing và đo lường SEO"
---

# A/B Testing và đo lường SEO

## A/B testing landing pages mà không ảnh hưởng SEO

A/B testing là cách khoa học nhất để cải thiện conversion rate. Nhưng nếu làm sai, bạn có thể phá hỏng SEO ranking. Cùng tìm hiểu cách test đúng.

### Nguyên tắc Google về A/B testing

Google chính thức cho phép A/B testing và xác nhận nó KHÔNG vi phạm guidelines, miễn là tuân thủ:

1. **Không cloaking:** Hiển thị cùng nội dung cho Googlebot và users
2. **Dùng `rel="canonical"`** trỏ về trang gốc
3. **Không redirect Googlebot** về variant khác
4. **Thời gian test hợp lý:** Không chạy test quá lâu (thường 2-4 tuần)

### Server-side A/B testing (SEO-safe)

Server-side testing là cách an toàn nhất cho SEO vì HTML được modify trước khi gửi đến client.

```javascript
// middleware.ts (Next.js Edge Middleware)
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request) {
  // Chỉ test trên landing page
  if (request.nextUrl.pathname !== '/landing') {
    return NextResponse.next()
  }

  // Kiểm tra cookie variant hiện tại
  const existingVariant = request.cookies.get('ab-variant')?.value

  if (existingVariant) {
    // User đã được assign variant, giữ nguyên
    const response = NextResponse.rewrite(
      new URL(`/landing/${existingVariant}`, request.url)
    )
    return response
  }

  // Assign variant mới (50/50 split)
  const variant = Math.random() < 0.5 ? 'control' : 'variant-a'

  const response = NextResponse.rewrite(
    new URL(`/landing/${variant}`, request.url)
  )

  // Set cookie để user luôn thấy cùng variant
  response.cookies.set('ab-variant', variant, {
    maxAge: 60 * 60 * 24 * 30, // 30 ngày
    httpOnly: true,
    sameSite: 'lax',
  })

  return response
}

export const config = {
  matcher: '/landing',
}
```

### SEO-safe variant pages

```tsx
// app/landing/control/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tạo Landing Page chuẩn SEO',
  description: 'Công cụ tạo landing page...',
  alternates: {
    // Canonical LUÔN trỏ về URL gốc, không phải variant
    canonical: 'https://example.com/landing',
  },
  robots: {
    index: false, // Variant pages không nên được index
  },
}

export default function ControlVariant() {
  return (
    <main>
      <h1>Tạo Landing Page chuẩn SEO trong 30 phút</h1>
      <p>Công cụ kéo thả dễ dùng cho mọi người.</p>
      <a href="/signup" className="cta-blue">Bắt đầu miễn phí</a>
    </main>
  )
}
```

```tsx
// app/landing/variant-a/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tạo Landing Page chuẩn SEO',
  description: 'Công cụ tạo landing page...',
  alternates: {
    canonical: 'https://example.com/landing',
  },
  robots: {
    index: false,
  },
}

export default function VariantA() {
  return (
    <main>
      {/* Test: khác headline và CTA color */}
      <h1>Landing Page Builder - Tối ưu SEO tự động</h1>
      <p>10,000+ developers đã tin dùng. Bạn tiếp theo?</p>
      <a href="/signup" className="cta-green">Dùng thử ngay - Miễn phí</a>
    </main>
  )
}
```

### Client-side A/B testing (cẩn thận hơn)

Client-side testing modify DOM bằng JavaScript sau khi page load. Đây là cách nhiều tools (Google Optimize, VWO) hoạt động.

**Vấn đề SEO tiềm ẩn:**
- Flash of Original Content (FOOC): user thấy original rồi nhấp nháy sang variant
- Nếu test thay đổi H1, meta tags -> Google có thể thấy version khác nhau mỗi lần crawl
- JavaScript execution delay ảnh hưởng CLS

```javascript
// Client-side A/B test (cách an toàn hơn)
// Chỉ test visual elements, KHÔNG test H1, title, meta tags

(function() {
  // Xác định variant
  const storedVariant = localStorage.getItem('ab-cta-test')
  const variant = storedVariant || (Math.random() < 0.5 ? 'blue' : 'green')

  if (!storedVariant) {
    localStorage.setItem('ab-cta-test', variant)
  }

  // Apply variant (chỉ style changes, không thay đổi content)
  document.addEventListener('DOMContentLoaded', function() {
    const cta = document.querySelector('.cta-primary')
    if (!cta) return

    if (variant === 'green') {
      cta.style.backgroundColor = '#10b981'
      cta.textContent = 'Dùng thử ngay'
    }

    // Track impression
    trackEvent('ab_test_impression', {
      test_name: 'cta-color-test',
      variant: variant,
    })
  })
})()
```

### So sánh approaches

| Approach | SEO Risk | Flash/Flicker | Implementation | Testing Scope |
|----------|----------|---------------|----------------|---------------|
| Server-side (middleware) | Thấp nhất | Không | Phức tạp | Mọi thứ |
| Edge Config (Vercel) | Thấp | Không | Trung bình | Mọi thứ |
| Client-side (safe) | Thấp | Có thể | Dễ | Chỉ visual/style |
| Client-side (H1/meta) | Cao | Có | Dễ | Nguy hiểm |

## Google Analytics 4 setup cho SEO tracking

GA4 là công cụ không thể thiếu để đo lường hiệu quả SEO landing page.

### Cài đặt GA4 với Next.js

```tsx
// components/GoogleAnalytics.tsx
'use client'

import Script from 'next/script'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_title: document.title,
            page_location: window.location.href,
            send_page_view: true,
          });
        `}
      </Script>
    </>
  )
}
```

```tsx
// app/layout.tsx
import { GoogleAnalytics } from '@/components/GoogleAnalytics'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  )
}
```

### Performance-friendly GA4 setup

```tsx
// Cách tốt hơn: Load GA4 sau khi trang render xong
// components/DeferredAnalytics.tsx
'use client'

import { useEffect } from 'react'

export function DeferredAnalytics() {
  useEffect(() => {
    // Đợi page load xong + idle time
    const loadGA = () => {
      const script = document.createElement('script')
      script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`
      script.async = true
      document.head.appendChild(script)

      script.onload = () => {
        window.dataLayer = window.dataLayer || []
        function gtag(...args: unknown[]) {
          window.dataLayer.push(args)
        }
        gtag('js', new Date())
        gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID)
      }
    }

    // Load sau khi trang interactive
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadGA)
    } else {
      setTimeout(loadGA, 2000)
    }
  }, [])

  return null
}
```

## Conversion tracking và attribution

### Track CTA clicks

```javascript
// utils/analytics.ts
export function trackEvent(eventName, params = {}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params)
  }
}

// Track CTA click
export function trackCTAClick(ctaLocation, ctaText) {
  trackEvent('cta_click', {
    cta_location: ctaLocation,    // 'hero', 'features', 'footer'
    cta_text: ctaText,            // 'Bắt đầu miễn phí'
    page_path: window.location.pathname,
  })
}

// Track signup conversion
export function trackSignupConversion(method) {
  trackEvent('sign_up', {
    method: method,               // 'email', 'google', 'github'
  })

  // Google Ads conversion tracking (nếu chạy ads)
  if (window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: 'AW-XXXXXXXXX/XXXXXXXX',
      value: 1.0,
      currency: 'USD',
    })
  }
}
```

### Implement tracking trong components

```tsx
// components/Hero.tsx
'use client'

import { trackCTAClick } from '@/utils/analytics'

export function Hero() {
  const handleCTAClick = () => {
    trackCTAClick('hero', 'Bắt đầu miễn phí')
  }

  return (
    <section className="hero">
      <h1>Tạo Landing Page chuẩn SEO</h1>
      <a
        href="/signup"
        className="cta-primary"
        onClick={handleCTAClick}
      >
        Bắt đầu miễn phí
      </a>
    </section>
  )
}
```

### Scroll depth tracking

```javascript
// utils/scroll-tracking.ts
export function initScrollTracking() {
  const thresholds = [25, 50, 75, 90]
  const tracked = new Set()

  const handleScroll = () => {
    const scrollPercent = Math.round(
      (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
    )

    thresholds.forEach((threshold) => {
      if (scrollPercent >= threshold && !tracked.has(threshold)) {
        tracked.add(threshold)
        trackEvent('scroll_depth', {
          percent: threshold,
          page_path: window.location.pathname,
        })
      }
    })
  }

  // Throttle scroll events
  let ticking = false
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScroll()
        ticking = false
      })
      ticking = true
    }
  })
}
```

## SEO KPIs cho landing page

### KPIs quan trọng nhất

| KPI | Đo ở đâu | Target | Ý nghĩa |
|-----|-----------|--------|----------|
| Organic Traffic | GA4 | Tăng MoM | Số visitors từ search |
| Organic CTR | GSC | trên 3% | % click / impressions |
| Average Position | GSC | Top 10 | Vị trí trung bình trên SERP |
| Bounce Rate | GA4 | dưới 50% | % users rời đi ngay |
| Avg. Engagement Time | GA4 | trên 1 phút | Thời gian tương tác |
| Conversion Rate | GA4 | trên 2% | % visitors thực hiện action |
| Pages per Session | GA4 | trên 1.5 | Số trang xem mỗi session |
| Core Web Vitals | GSC / CrUX | All "Good" | LCP, INP, CLS |

### Setup GA4 Explorations cho SEO

```
Bước 1: GA4 > Explore > Free Form
Bước 2: Dimensions:
  - Session source/medium (filter: google / organic)
  - Landing page
  - Device category
Bước 3: Metrics:
  - Sessions
  - Engaged sessions
  - Average engagement time
  - Conversions
  - Bounce rate
Bước 4: Filter: Source = google, Medium = organic
```

### Custom SEO Dashboard trong GA4

Tạo custom report để theo dõi SEO landing page:

```
Report 1: Landing Page Performance
- Metric: Sessions, Users, Engagement rate
- Dimension: Page path
- Filter: Session default channel = Organic Search

Report 2: Keyword to Conversion
- Kết hợp GSC data (queries) + GA4 data (conversions)
- Xem keyword nào mang lại conversion cao nhất

Report 3: Device Breakdown
- So sánh mobile vs desktop performance
- Landing page mobile thường có bounce rate cao hơn
```

## Google Search Console performance data

GSC cung cấp data mà GA4 không có: search queries, impressions, average position.

### Kết nối GSC với GA4

```
Bước 1: GA4 Admin > Product Links > Search Console Links
Bước 2: Chọn GSC property
Bước 3: Liên kết
Bước 4: GA4 > Reports > Search Console > Queries
```

### GSC API integration

```javascript
// scripts/gsc-report.js
// Lấy data từ GSC API để tạo custom reports

const { google } = require('googleapis')

async function getSearchConsoleData() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  })

  const searchconsole = google.searchconsole({ version: 'v1', auth })

  // Query performance data cho landing page
  const response = await searchconsole.searchanalytics.query({
    siteUrl: 'https://example.com',
    requestBody: {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      dimensions: ['query', 'page'],
      dimensionFilterGroups: [
        {
          filters: [
            {
              dimension: 'page',
              operator: 'contains',
              expression: '/landing',
            },
          ],
        },
      ],
      rowLimit: 100,
      startRow: 0,
    },
  })

  const rows = response.data.rows || []

  // Phân tích data
  rows.forEach((row) => {
    const query = row.keys[0]
    const page = row.keys[1]
    const { clicks, impressions, ctr, position } = row

    console.log(`Query: ${query}`)
    console.log(`  Page: ${page}`)
    console.log(`  Clicks: ${clicks}, Impressions: ${impressions}`)
    console.log(`  CTR: ${(ctr * 100).toFixed(2)}%, Position: ${position.toFixed(1)}`)
    console.log('')
  })

  return rows
}

// Tìm keyword opportunities
async function findKeywordOpportunities() {
  const data = await getSearchConsoleData()

  // Keyword có impressions cao nhưng CTR thấp
  // -> Cải thiện title/description có thể tăng clicks
  const opportunities = data
    .filter((row) => row.impressions > 100 && row.ctr < 0.03)
    .sort((a, b) => b.impressions - a.impressions)

  console.log('\n--- KEYWORD OPPORTUNITIES ---')
  console.log('High impressions, low CTR (< 3%):')
  opportunities.forEach((row) => {
    console.log(`  "${row.keys[0]}" - ${row.impressions} impr, ${(row.ctr * 100).toFixed(1)}% CTR, pos ${row.position.toFixed(1)}`)
  })

  // Keyword ở position 5-20 (trang 1-2)
  // -> Tối ưu content có thể đẩy lên top 3
  const almostThere = data
    .filter((row) => row.position >= 5 && row.position <= 20)
    .sort((a, b) => a.position - b.position)

  console.log('\n--- ALMOST TOP 5 ---')
  console.log('Position 5-20 (potential for improvement):')
  almostThere.forEach((row) => {
    console.log(`  "${row.keys[0]}" - pos ${row.position.toFixed(1)}, ${row.clicks} clicks`)
  })
}

findKeywordOpportunities()
```

## Tools cho A/B testing và đo lường

### Google Optimize (đã sunset tháng 9/2023)

Google Optimize đã ngừng hoạt động. Các alternatives:

### Vercel Edge Config + Feature Flags

```typescript
// Dùng Vercel Edge Config cho feature flags
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { get } from '@vercel/edge-config'

export async function middleware(request: NextRequest) {
  // Đọc flag từ Edge Config (ultra-low latency)
  const landingVariant = await get('landing-page-variant')

  // Assign user to variant
  const userVariant = request.cookies.get('variant')?.value

  if (!userVariant) {
    const variant = Math.random() < 0.5 ? 'control' : 'treatment'
    const response = NextResponse.next()
    response.cookies.set('variant', variant, { maxAge: 86400 * 30 })

    // Pass variant to page via header
    response.headers.set('x-variant', variant)
    return response
  }

  const response = NextResponse.next()
  response.headers.set('x-variant', userVariant)
  return response
}
```

### PostHog (open-source alternative)

```bash
npm install posthog-js
```

```tsx
// components/PostHogProvider.tsx
'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      capture_pageview: true,
      capture_pageleave: true,
    })
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
```

```tsx
// Feature flag A/B test với PostHog
'use client'

import { useFeatureFlagVariantKey } from 'posthog-js/react'

export function HeroSection() {
  const variant = useFeatureFlagVariantKey('landing-hero-test')

  if (variant === 'short-headline') {
    return (
      <section>
        <h1>Landing Page Builder</h1>
        <p>Tối ưu SEO tự động.</p>
        <a href="/signup">Bắt đầu ngay</a>
      </section>
    )
  }

  // Control variant (mặc định)
  return (
    <section>
      <h1>Tạo Landing Page chuẩn SEO trong 30 phút</h1>
      <p>Công cụ kéo thả dễ dùng. Tối ưu tốc độ và SEO tự động.</p>
      <a href="/signup">Bắt đầu miễn phí</a>
    </section>
  )
}
```

### So sánh tools

| Tool | Loại | Giá | SEO Impact | Setup |
|------|------|-----|------------|-------|
| Vercel Edge Config | Server-side | Free tier | Không ảnh hưởng | Dễ (Vercel only) |
| PostHog | Client + Server | Free (self-host) | Thấp | Trung bình |
| LaunchDarkly | Server-side | Trả phí | Không ảnh hưởng | Trung bình |
| Statsig | Server + Client | Free tier | Thấp | Trung bình |
| VWO | Client-side | Trả phí | Có thể ảnh hưởng | Dễ |
| Optimizely | Server + Client | Trả phí | Tùy setup | Phức tạp |

## Custom event tracking patterns

### Ecommerce-style tracking cho SaaS landing page

```javascript
// Track marketing funnel
const FUNNEL_EVENTS = {
  PAGE_VIEW: 'landing_page_view',
  CTA_CLICK: 'landing_cta_click',
  SIGNUP_START: 'signup_start',
  SIGNUP_COMPLETE: 'signup_complete',
  FIRST_ACTION: 'first_meaningful_action',
}

// Track complete funnel
export function trackFunnelStep(step, metadata = {}) {
  trackEvent(step, {
    ...metadata,
    funnel: 'landing_to_signup',
    timestamp: new Date().toISOString(),
    referrer: document.referrer,
    utm_source: new URLSearchParams(window.location.search).get('utm_source'),
    utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
    utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
  })
}

// Usage
trackFunnelStep(FUNNEL_EVENTS.PAGE_VIEW, { variant: 'control' })
trackFunnelStep(FUNNEL_EVENTS.CTA_CLICK, { cta_location: 'hero' })
trackFunnelStep(FUNNEL_EVENTS.SIGNUP_START, { method: 'email' })
trackFunnelStep(FUNNEL_EVENTS.SIGNUP_COMPLETE, { method: 'email', time_to_signup: '45s' })
```

### UTM parameter tracking

```javascript
// utils/utm.ts
export function captureUTMParams() {
  const params = new URLSearchParams(window.location.search)
  const utmParams = {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_term: params.get('utm_term'),
    utm_content: params.get('utm_content'),
  }

  // Lưu UTM params cho attribution
  const filtered = Object.fromEntries(
    Object.entries(utmParams).filter(([, v]) => v !== null)
  )

  if (Object.keys(filtered).length > 0) {
    sessionStorage.setItem('utm_params', JSON.stringify(filtered))
  }

  return filtered
}

// Attach UTM params vào mọi conversion event
export function getStoredUTMParams() {
  try {
    const stored = sessionStorage.getItem('utm_params')
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}
```

## Lỗi thường gặp

### 1. A/B test thay đổi H1 bằng client-side JavaScript

```javascript
// SAI: Google crawl lần này thấy H1 gốc, lần sau thấy H1 variant
document.querySelector('h1').textContent = 'New Headline'

// ĐÚNG: Server-side test, Google luôn thấy canonical version
// Dùng middleware để rewrite URL, giữ canonical tag
```

### 2. Không set canonical cho variant pages

```html
<!-- SAI: Variant page không có canonical -->
<!-- Google có thể index cả 2 versions -> duplicate content -->

<!-- ĐÚNG: Canonical trỏ về trang gốc -->
<link rel="canonical" href="https://example.com/landing">
```

### 3. GA4 script block rendering

```html
<!-- SAI: GA4 trong head, block rendering -->
<head>
  <script src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
</head>

<!-- ĐÚNG: Async + afterInteractive -->
<Script
  src="https://www.googletagmanager.com/gtag/js?id=GA_ID"
  strategy="afterInteractive"
/>
```

### 4. Track quá nhiều events

Mỗi event gửi một network request. Quá nhiều events ảnh hưởng performance.

```javascript
// SAI: Track mọi mouse move
document.addEventListener('mousemove', () => trackEvent('mouse_move'))

// ĐÚNG: Track meaningful interactions only
// CTA clicks, form submissions, scroll milestones
```

### 5. Không segment organic vs paid traffic

Khi phân tích conversion rate, phải tách riêng organic vs paid traffic vì intent khác nhau.

```
GA4 > Explore > Free Form
Dimension: Session default channel group
Filter: Organic Search
-> So sánh riêng với Paid Search
```

## Câu hỏi phỏng vấn

### Câu 1: Làm sao A/B test landing page mà không ảnh hưởng SEO ranking?

**Trả lời:** (1) Ưu tiên server-side testing: dùng middleware/edge function để serve different variants, Google luôn thấy canonical version. (2) Set `rel="canonical"` trên tất cả variant pages trỏ về URL gốc. (3) Variant pages set `noindex` để Google không index chúng. (4) Không dùng client-side JS để thay đổi H1, title, meta tags vì Google có thể thấy các version khác nhau. (5) Giới hạn thời gian test (2-4 tuần). (6) Chỉ test visual elements (CTA color, layout, images) ở client-side, content changes phải server-side.

### Câu 2: GA4 khác Universal Analytics như thế nào trong việc đo lường SEO?

**Trả lời:** GA4 dùng event-based model thay vì session-based. Mỗi interaction là một event, không còn khái niệm "pageview" cũ. Bounce rate được thay bằng "Engagement rate" (% sessions có engaged session). GA4 có "Engagement time" thay vì "Time on page" (chính xác hơn). GA4 tích hợp GSC data trực tiếp trong reports. Attribution model linh hoạt hơn (data-driven thay vì last-click mặc định). Explorations cho phép tạo custom reports mạnh hơn. Tuy nhiên GA4 mất một số reports quen thuộc và learning curve cao hơn.

### Câu 3: Làm sao đo lường ROI của SEO cho landing page?

**Trả lời:** Bước 1: Xác định conversion value (ví dụ: mỗi signup trị giá $10 dựa trên LTV). Bước 2: Track organic conversions trong GA4 (filter source = google, medium = organic). Bước 3: Tính organic conversion value = số conversions x conversion value. Bước 4: So sánh với chi phí SEO (content creation, tools, developer time). Bước 5: ROI = (Revenue from organic - SEO cost) / SEO cost x 100%. Ngoài ra theo dõi: organic traffic growth, keyword rankings improvement, branded vs non-branded search ratio.

### Câu 4: Google Search Console API có thể giúp gì cho SEO landing page?

**Trả lời:** GSC API cung cấp data không có trong GA4: (1) Search queries - biết user tìm keyword gì để đến trang, dùng để optimize content. (2) Impressions - biết trang hiển thị bao nhiêu lần trên SERP, kể cả khi không có clicks. (3) Average position - theo dõi ranking trend. (4) CTR per query - xác định keyword nào cần cải thiện title/description. Tự động hóa: build script lấy data định kỳ, tìm keyword opportunities (high impressions, low CTR), monitor ranking drops, generate weekly SEO reports.

### Câu 5: So sánh PostHog và Google Analytics 4 cho SEO tracking. Khi nào dùng cái nào?

**Trả lời:** GA4 là standard cho SEO tracking vì tích hợp với Google Search Console, Google Ads, có CrUX data. Miễn phí nhưng data thuộc về Google, sampling ở high volume. PostHog là open-source, có thể self-host (full data ownership, GDPR friendly), có feature flags, session recordings, và A/B testing tích hợp. Không có GSC integration. Recommendation: dùng GA4 cho SEO metrics core (organic traffic, GSC data, attribution). Dùng PostHog bổ sung cho product analytics (feature flags, A/B testing, session recordings). Nhiều teams dùng cả hai: GA4 cho marketing/SEO team, PostHog cho product/engineering team.
