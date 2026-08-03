---
sidebar_position: 6
title: "6. Growth, SEO & Traffic Engineering"
---

# Growth, SEO & Traffic Engineering

> *FE Senior ở startup/scale-up đều bị hỏi câu này. Company growth = traffic + conversion. Em không cần là marketer, nhưng em phải hiểu **technical lever** ảnh hưởng growth metric.*

:::note[Ghi nhớ nhanh]

- ⭐ **Technical SEO là việc của engineer** — crawlability (`robots`/`sitemap`), indexability (canonical/meta robots), render SSR/SSG, metadata + `JSON-LD` schema, `hreflang`, Core Web Vitals.
- ⭐ **CWV là ranking factor yếu** — Google rank dùng field data (`CrUX`), lab (Lighthouse) chỉ là proxy; impact lớn hơn là gián tiếp qua bounce rate.
- **CRO qua technical lever** — page speed, giảm friction form (`autoComplete`/`inputMode`/real-time validation), funnel analytics, A/B test, trust signals.
- **Analytics** — event taxonomy Subject-Verb-Object, type-safe event system, UTM first/last-touch attribution, GDPR consent; track theo câu hỏi business cần trả lời.
- **International SEO** — chọn subdirectory `/vi/`, `hreflang` reciprocal + `x-default`, localize currency/date, CDN edge theo region.
- **Chuẩn bị 10x traffic spike** — load test (k6), cache aggressive, connection pool + read replica, rate limit, circuit breaker, graceful degradation, auto-scaling.

:::

---

## Câu 1: SEO technical — em check những gì? `[Senior]`

### Câu hỏi

> Em được giao improve SEO cho website em. Đi qua technical checklist em sẽ check.

### Giải thích lý thuyết

SEO chia 3 nhóm:

1. **On-page technical** — code FE.
2. **Content & UX** — copy, structure.
3. **Off-page** — backlink, authority.

FE chịu trách nhiệm chính nhóm 1. Checklist:

| Item                          | Tool check                                |
| ----------------------------- | ----------------------------------------- |
| Crawlability                  | robots.txt, sitemap.xml, internal linking |
| Indexability                  | meta robots, canonical tags                |
| Render strategy               | SSR vs CSR, JS rendering issues           |
| Page speed (Core Web Vitals)  | PageSpeed Insights, Search Console        |
| Structured data               | Schema.org, JSON-LD                       |
| Mobile-friendliness           | Responsive, viewport, touch target        |
| Meta tags                     | title, description, OG, Twitter card     |
| URL structure                 | Clean URL, hierarchy                      |
| HTTPS                         | SSL cert, HSTS                            |
| International SEO             | hreflang, region-specific                 |

### Code minh hoạ

```typescript
// 1. Robots & Sitemap (Next.js App Router)
// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/private"] },
      { userAgent: "GPTBot", disallow: "/" },  // block AI training
    ],
    sitemap: "https://example.com/sitemap.xml",
    host: "https://example.com",
  };
}

// app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await db.post.findMany({ where: { published: true } });
  const products = await db.product.findMany({ where: { active: true } });

  return [
    {
      url: "https://example.com",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...posts.map((p) => ({
      url: `https://example.com/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `https://example.com/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}

// Sitemap index cho site lớn (50k+ URL)
// app/sitemap.ts
export async function generateSitemaps() {
  return [{ id: 0 }, { id: 1 }, { id: 2 }];  // chia sitemap
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const items = await db.post.findMany({
    skip: id * 50000,
    take: 50000,
  });
  return items.map((p) => ({ url: `https://example.com/blog/${p.slug}` }));
}

// 2. Metadata API
import type { Metadata } from "next";

export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await fetchPost(params.slug);

  return {
    title: post.title,
    description: post.excerpt.slice(0, 160),  // 150-160 chars sweet spot
    keywords: post.tags,
    authors: [{ name: post.author.name }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://example.com/blog/${post.slug}`,
      siteName: "My Blog",
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      locale: "vi_VN",
      type: "article",
      publishedTime: post.publishedAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author.name],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
      creator: "@username",
    },
    alternates: {
      canonical: `https://example.com/blog/${post.slug}`,
      languages: {
        "vi-VN": `https://example.com/vi/blog/${post.slug}`,
        "en-US": `https://example.com/en/blog/${post.slug}`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

// 3. Structured data (JSON-LD)
function ArticleSchema({ post }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.author.name,
      url: `https://example.com/authors/${post.author.slug}`,
    },
    publisher: {
      "@type": "Organization",
      name: "My Blog",
      logo: { "@type": "ImageObject", url: "https://example.com/logo.png" },
    },
    description: post.excerpt,
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://example.com/blog/${post.slug}` },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Product page schema
const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: product.name,
  image: product.images,
  description: product.description,
  brand: { "@type": "Brand", name: product.brand },
  offers: {
    "@type": "Offer",
    price: product.price,
    priceCurrency: "VND",
    availability: "https://schema.org/InStock",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: product.rating,
    reviewCount: product.reviewCount,
  },
};

// FAQ schema cho rich snippet
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((q) => ({
    "@type": "Question",
    name: q.question,
    acceptedAnswer: { "@type": "Answer", text: q.answer },
  })),
};
```

```typescript
// 4. Canonical & duplicate content
// Different URL → same content → canonical
export const metadata: Metadata = {
  alternates: { canonical: "https://example.com/blog/main-post" },
};

// 5. International (hreflang)
// app/[locale]/blog/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  return {
    alternates: {
      canonical: `https://example.com/${params.locale}/blog/${params.slug}`,
      languages: {
        "vi-VN": `https://example.com/vi/blog/${params.slug}`,
        "en-US": `https://example.com/en/blog/${params.slug}`,
        "x-default": `https://example.com/en/blog/${params.slug}`,
      },
    },
  };
}
```

### Đáp án mẫu

> "Em đi qua checklist 8 nhóm. **Crawlability**: `robots.ts` + `sitemap.ts` qua Next.js convention, sitemap index nếu site dưới 50k URL. **Indexability**: meta `robots` per page, canonical tag chống duplicate content. **Render strategy**: dùng SSR/SSG/RSC để Googlebot crawl được HTML — KHÔNG CSR-only cho content quan trọng (Googlebot JS support nhưng delay + flaky). **Metadata**: title 50-60 char, description 150-160 char, Open Graph cho social, Twitter Card. **Structured data** (JSON-LD): Article, Product, FAQ, Breadcrumb, Organization — eligible cho rich snippet. **International SEO**: hreflang cho multi-language, `x-default` cho fallback. **Core Web Vitals**: Google rank factor — LCP/INP/CLS phải good. **URL structure**: clean, semantic — `/blog/topic-name` không `/p?id=123`. **Mobile-friendly**: responsive viewport, touch target ≥ 48px. **HTTPS** + HSTS. Search Console + Bing Webmaster để monitor index status, crawl error, performance. Submit sitemap, request indexing cho page quan trọng. Em verify với Lighthouse SEO score + Rich Results Test tool."

---

## Câu 2: Core Web Vitals và SEO ranking `[Senior]`

### Câu hỏi

> Google nói Core Web Vitals là ranking factor. Em hiểu impact thực tế thế nào? Em prioritize fix gì?

### Giải thích lý thuyết

CWV là **một trong nhiều** ranking factor, không phải dominant. Google clarify:

- CWV affect ranking khi page về relevance gần ngang nhau.
- Page có CWV "good" được boost subtle, không phải 10x.
- CWV impact **user behavior** (bounce rate, time on site) → indirect SEO impact lớn hơn direct ranking.

Threshold (Google):
- **LCP** ≤ 2.5s.
- **INP** ≤ 200ms (replace FID từ 2024).
- **CLS** ≤ 0.1.

Đo cả **lab** (Lighthouse) và **field** (real user qua Chrome UX Report). Google rank dùng **field data**.

### Code minh hoạ

```typescript
// Track CWV trong production để analyze impact SEO
import { onLCP, onINP, onCLS } from "web-vitals";

function reportToGoogleAnalytics(metric: any) {
  // GA4 event
  gtag("event", metric.name, {
    value: Math.round(metric.value),
    metric_id: metric.id,
    metric_value: metric.value,
    metric_delta: metric.delta,
    metric_rating: metric.rating,  // "good" | "needs-improvement" | "poor"
    page_path: location.pathname,
  });
}

onLCP(reportToGoogleAnalytics);
onINP(reportToGoogleAnalytics);
onCLS(reportToGoogleAnalytics);

// Custom: report kèm landing source để correlate với SEO
function reportWithContext(metric) {
  const referrer = document.referrer;
  const source = referrer.includes("google.com") ? "organic"
              : referrer.includes("facebook") ? "social"
              : referrer ? "referral"
              : "direct";

  fetch("/api/analytics/vitals", {
    method: "POST",
    body: JSON.stringify({ ...metric, source, page: location.pathname }),
    keepalive: true,
  });
}
```

```typescript
// Audit: lấy real data từ Chrome UX Report (CrUX)
// API: https://chromeuxreport.googleapis.com/v1/records:queryRecord
const response = await fetch(
  "https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=" + apiKey,
  {
    method: "POST",
    body: JSON.stringify({
      origin: "https://example.com",
      metrics: ["largest_contentful_paint", "interaction_to_next_paint", "cumulative_layout_shift"],
    }),
  }
);

const data = await response.json();
// data.record.metrics.largest_contentful_paint.percentiles.p75 → real user p75
```

### Đáp án mẫu

> "CWV là ranking factor **nhưng signal weak** — Google clarify đây là tiebreaker khi relevance ngang nhau, không phải dominant. Impact lớn hơn thực ra **indirect**: page load chậm → bounce rate cao → engagement thấp → Google demote. Em prioritize: **LCP** trước (perceived load, ảnh hưởng bounce nhiều nhất). **CLS** sau (UX, user click nhầm). **INP** cuối (responsiveness, ít visible với user landing). Em track **field data** không chỉ lab — Google rank dùng **CrUX** (Chrome UX Report) data từ real user. Truy CrUX API hoặc Search Console > Core Web Vitals report. Pattern em làm: gửi CWV về GA4 kèm `source` (organic/direct/social) — biết page nào landing page có CWV poor → priority fix. Mantra: 'lab catch regression sớm, field decide priority'. Bonus: Page Experience update của Google đã include CWV nhưng còn nhiều factor khác (HTTPS, mobile-friendly, no intrusive interstitial) — đừng chỉ focus CWV."

---

## Câu 3: Conversion Rate Optimization (CRO) `[Senior]`

### Câu hỏi

> Landing page em 2% conversion. Em muốn lên 4%. Em làm gì về technical?

### Giải thích lý thuyết

CRO không phải job marketer riêng — FE đóng góp:

1. **Page speed** — mỗi 1s chậm giảm conversion 7-12%.
2. **Friction reduction** — form đơn giản, autofocus, validation real-time.
3. **A/B testing infrastructure** — experiment platform.
4. **Funnel analytics** — biết user drop ở đâu.
5. **Form abandonment** — track field cuối user touch.
6. **Trust signals** — testimonial, security badge, social proof.
7. **Mobile optimization** — 60%+ traffic mobile.
8. **Personalization** — content theo segment user.

### Code minh hoạ

```typescript
// 1. Funnel tracking
function trackFunnelStep(step: string, metadata?: any) {
  gtag("event", "funnel_step", {
    step,
    ...metadata,
    page: location.pathname,
  });

  // Custom analytics
  fetch("/api/analytics/funnel", {
    method: "POST",
    body: JSON.stringify({ step, metadata, sessionId: getSessionId() }),
    keepalive: true,
  });
}

// Track form interaction
function SignupForm() {
  const [touched, setTouched] = useState(new Set());

  return (
    <form onSubmit={handleSubmit}>
      {/* Track field focus = user start form */}
      <input
        name="email"
        autoFocus
        onFocus={() => {
          if (!touched.has("form_start")) {
            trackFunnelStep("form_start");
            setTouched(prev => new Set(prev).add("form_start"));
          }
        }}
        onBlur={(e) => {
          if (e.target.value) trackFunnelStep("email_filled");
        }}
      />

      <input name="password" onBlur={(e) => {
        if (e.target.value) trackFunnelStep("password_filled");
      }} />

      <button type="submit" onClick={() => trackFunnelStep("submit_click")}>
        Sign up
      </button>
    </form>
  );
}

// Track abandonment
useEffect(() => {
  const handleUnload = () => {
    const lastField = document.activeElement;
    if (lastField?.tagName === "INPUT") {
      navigator.sendBeacon("/api/analytics/abandon", JSON.stringify({
        field: lastField.name,
        page: location.pathname,
      }));
    }
  };
  window.addEventListener("beforeunload", handleUnload);
  return () => window.removeEventListener("beforeunload", handleUnload);
}, []);

// 2. Friction reduction — autofill optimization
<form>
  <input
    type="email"
    name="email"
    autoComplete="email"          // browser autofill
    inputMode="email"
    placeholder="you@example.com"
  />

  <input
    type="tel"
    name="phone"
    autoComplete="tel"
    inputMode="tel"
  />

  <input
    type="text"
    name="cardNumber"
    autoComplete="cc-number"
    inputMode="numeric"
    pattern="[0-9\s]{13,19}"
  />

  {/* OTP autofill từ SMS */}
  <input
    type="text"
    name="otp"
    autoComplete="one-time-code"
    inputMode="numeric"
    pattern="[0-9]{6}"
    maxLength={6}
  />
</form>

// 3. Real-time validation (debounced)
function EmailField() {
  const [email, setEmail] = useState("");
  const debouncedEmail = useDebounce(email, 500);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!debouncedEmail) return;

    if (!emailSchema.safeParse(debouncedEmail).success) {
      setError("Email không hợp lệ");
      trackFunnelStep("email_invalid");
      return;
    }

    // Check email exists (giúp user biết sớm)
    fetch(`/api/check-email?email=${debouncedEmail}`)
      .then(r => r.json())
      .then(data => {
        if (data.exists) {
          setError("Email đã đăng ký. Đăng nhập?");
          trackFunnelStep("email_exists");
        } else {
          setError("");
        }
      });
  }, [debouncedEmail]);

  return (
    <>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />
      {error && <span className="error">{error}</span>}
    </>
  );
}

// 4. Trust signals (social proof)
function SignupCTA() {
  const { data: count } = useSWR("/api/stats/signups-today", fetcher);

  return (
    <section>
      <h1>Sign up</h1>
      <p>
        <strong>{count}+</strong> người đã đăng ký hôm nay
      </p>
      <TestimonialCarousel />
      <SecurityBadges />
    </section>
  );
}

// 5. Exit intent (last-ditch CTA)
function ExitIntentModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !sessionStorage.getItem("exit_shown")) {
        setShow(true);
        sessionStorage.setItem("exit_shown", "1");
        trackFunnelStep("exit_intent");
      }
    };
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, []);

  if (!show) return null;
  return (
    <Modal onClose={() => setShow(false)}>
      <h2>Khoan đã!</h2>
      <p>Đăng ký ngay để được giảm 20% lần đầu</p>
      <button>Lấy ưu đãi</button>
    </Modal>
  );
}
```

```typescript
// 6. A/B test với GrowthBook
import { useFeatureValue, useExperiment } from "@growthbook/growthbook-react";

function PricingPage() {
  const ctaText = useFeatureValue("pricing-cta", "Đăng ký miễn phí");
  const showAnnualDefault = useFeatureValue("annual-default", false);

  // Track variation impact
  useEffect(() => {
    trackFunnelStep("page_view", { variant: ctaText });
  }, []);

  return (
    <section>
      <PriceCard defaultBilling={showAnnualDefault ? "annual" : "monthly"} />
      <button>{ctaText}</button>
    </section>
  );
}
```

### Đáp án mẫu

> "Em tấn công 5 lever technical. **Lever 1 — Speed**: optimize Core Web Vitals — mỗi giây chậm giảm conversion 7-12% (Google data). LCP ≤ 2s là target. **Lever 2 — Friction reduction**: form đơn giản (chỉ field bắt buộc), `autoComplete` attribute đúng (browser autofill), `inputMode` đúng (mobile keyboard chuẩn), `autocomplete='one-time-code'` cho OTP autofill từ SMS, real-time validation debounce 500ms để user biết error sớm thay vì sau khi submit. **Lever 3 — Funnel analytics**: track từng step (form_start, email_filled, submit_click) + abandonment field cuối user touch. Phân tích biết user drop ở field nào → fix targeted. **Lever 4 — A/B testing infrastructure**: GrowthBook self-hosted, test CTA text, button color, layout — base trên data không guess. **Lever 5 — Trust signals**: testimonial dynamic, signup count live, security badge, security review badge. **Bonus**: exit intent modal cho user chuẩn rời (giảm bounce 5-10%). Tracking em đặt event cho mỗi micro-conversion (CTA click, scroll 50%, video play) — biết engagement pattern. Real story: project em apply tất cả → 2% → 3.5% (1.75x). Speed contribute 30%, form friction reduction 40%, A/B test variations 30%."

---

## Câu 4: Analytics setup — em track gì? `[Senior]`

### Câu hỏi

> Em set up analytics cho product mới. Event nào critical track? Tool gì?

### Giải thích lý thuyết

Event taxonomy framework — **Subject Verb Object**:

| Layer            | Event                       |
| ---------------- | --------------------------- |
| Page             | `page_view`, `page_exit`    |
| Engagement       | `scroll_50`, `time_on_page` |
| Interaction      | `button_click`, `form_focus`|
| Conversion       | `signup`, `purchase`        |
| Error            | `form_error`, `api_error`   |

Tool 2024-2025:
- **GA4** — free, robust, integrate Google Ads.
- **PostHog** — open-source, product analytics + feature flag + replay.
- **Mixpanel** — funnel/cohort analytics, expensive.
- **Amplitude** — similar Mixpanel.
- **Plausible/Fathom** — privacy-friendly, lightweight.

### Code minh hoạ

```typescript
// 1. Type-safe event system
// lib/analytics.ts
type AnalyticsEvent =
  | { name: "page_view"; properties: { path: string; title: string; referrer: string } }
  | { name: "signup_start"; properties: { source: string } }
  | { name: "signup_complete"; properties: { method: "email" | "google" | "github"; plan: string } }
  | { name: "purchase"; properties: { value: number; currency: string; productId: string; quantity: number } }
  | { name: "form_error"; properties: { form: string; field: string; error: string } }
  | { name: "experiment_view"; properties: { experiment: string; variant: string } };

function track<E extends AnalyticsEvent>(event: E) {
  // Send to multiple platforms
  if (typeof window === "undefined") return;

  // GA4
  window.gtag?.("event", event.name, event.properties);

  // PostHog
  window.posthog?.capture(event.name, event.properties);

  // Custom backend (for product team)
  navigator.sendBeacon("/api/events", JSON.stringify({
    ...event,
    timestamp: Date.now(),
    sessionId: getSessionId(),
    userId: getUserId(),
  }));
}

// Usage type-safe
track({ name: "signup_complete", properties: { method: "email", plan: "free" } });
// ✅ Auto-complete + type check
// track({ name: "signup_complete", properties: { foo: "bar" } });
// ❌ Type error

// 2. Auto page tracking (Next.js App Router)
"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

function AnalyticsProvider({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    track({
      name: "page_view",
      properties: {
        path: pathname,
        title: document.title,
        referrer: document.referrer,
      },
    });
  }, [pathname, searchParams]);

  return children;
}

// 3. Scroll depth tracking
function useScrollDepth() {
  useEffect(() => {
    const milestones = [25, 50, 75, 100];
    const reached = new Set<number>();

    function handleScroll() {
      const scrollPercent = (window.scrollY + window.innerHeight) / document.body.scrollHeight * 100;
      milestones.forEach((m) => {
        if (scrollPercent >= m && !reached.has(m)) {
          reached.add(m);
          track({ name: "scroll_depth" as any, properties: { depth: m } });
        }
      });
    }

    const throttled = throttle(handleScroll, 500);
    window.addEventListener("scroll", throttled);
    return () => window.removeEventListener("scroll", throttled);
  }, []);
}

// 4. UTM tracking
function captureUTM() {
  const params = new URLSearchParams(location.search);
  const utm = {
    source: params.get("utm_source"),
    medium: params.get("utm_medium"),
    campaign: params.get("utm_campaign"),
    term: params.get("utm_term"),
    content: params.get("utm_content"),
  };

  if (Object.values(utm).some(Boolean)) {
    // Lưu first-touch UTM cho attribution
    if (!localStorage.getItem("first_touch_utm")) {
      localStorage.setItem("first_touch_utm", JSON.stringify({ ...utm, timestamp: Date.now() }));
    }
    sessionStorage.setItem("last_touch_utm", JSON.stringify({ ...utm, timestamp: Date.now() }));
  }
}

// Khi user signup → attribute conversion
function trackSignup() {
  const firstTouch = JSON.parse(localStorage.getItem("first_touch_utm") || "null");
  const lastTouch = JSON.parse(sessionStorage.getItem("last_touch_utm") || "null");

  track({
    name: "signup_complete",
    properties: {
      method: "email",
      plan: "free",
      first_touch_source: firstTouch?.source,
      last_touch_source: lastTouch?.source,
    } as any,
  });
}

// 5. Consent-aware tracking (GDPR)
function trackWithConsent(event: AnalyticsEvent) {
  const consent = JSON.parse(localStorage.getItem("consent") || "{}");

  // Always send essential analytics
  navigator.sendBeacon("/api/events", JSON.stringify(event));

  // Send to 3rd party chỉ khi consent
  if (consent.analytics) {
    window.gtag?.("event", event.name, event.properties);
  }
  if (consent.marketing) {
    window.fbq?.("trackCustom", event.name, event.properties);
  }
}
```

```typescript
// 6. Conversion tracking với Google Ads / Facebook Pixel
// Google Ads conversion
function trackPurchase(orderId: string, value: number) {
  window.gtag?.("event", "conversion", {
    send_to: "AW-XXXXXX/AbC-DeFgHiJkLmN",
    value,
    currency: "VND",
    transaction_id: orderId,
  });
}

// Facebook Pixel — Conversion API (server-side, more reliable)
// app/api/fb-conversion/route.ts
export async function POST(req) {
  const { event, userData, customData } = await req.json();

  await fetch(`https://graph.facebook.com/v18.0/${PIXEL_ID}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: [{
        event_name: event,
        event_time: Math.floor(Date.now() / 1000),
        action_source: "website",
        user_data: hashUserData(userData),  // hash email, phone
        custom_data: customData,
      }],
      access_token: process.env.FB_CAPI_TOKEN,
    }),
  });

  return Response.json({ ok: true });
}
```

### Đáp án mẫu

> "Em design **type-safe event system** thay vì truyền string. Define union type cho event + properties → autocomplete + type check ở caller. **Event taxonomy** theo Subject-Verb-Object: `page_view`, `signup_start`, `signup_complete`, `purchase`, `form_error`, `experiment_view`. **Stack**: GA4 cho marketing team (free, integrate Google Ads), **PostHog** cho product team (open-source, có feature flag + session replay + funnel analytics built-in), custom backend cho event raw (data team query SQL). **UTM tracking**: first-touch lưu localStorage (cho long attribution window), last-touch lưu sessionStorage. Khi user convert → attribute cả 2. **Scroll depth + time on page** track engagement. **Form abandonment** — beforeunload event với sendBeacon. **Conversion attribution**: Google Ads conversion + Facebook **Conversion API** server-side (CAPI thay vì pixel client) — accurate hơn vì không bị ad blocker. **GDPR consent**: split essential analytics (always send to own backend) vs 3rd-party (cần consent). **Avoid**: track too much (analysis paralysis); track without taxonomy (data unusable); chỉ track conversion (miss funnel insight). Quy tắc: track event đủ để **trả lời câu hỏi business**, không tracking-for-tracking-sake."

---

## Câu 5: International SEO & multi-region `[Senior]`

### Câu hỏi

> Site em launch ở VN, US, JP. Technical setup gì để SEO mỗi region tốt?

### Giải thích lý thuyết

International SEO decision tree:

1. **URL strategy**:
   - ccTLD: `example.vn`, `example.com.jp` — strongest signal nhưng setup phức tạp.
   - Subdomain: `vn.example.com` — geo-target qua Search Console.
   - Subdirectory: `example.com/vn/` — easiest, recommended cho hầu hết case.
   - URL parameter: `example.com?lang=vn` — KHÔNG recommend.

2. **hreflang** — tell Google variant ngôn ngữ/region nào của page.
3. **Content localization** — không chỉ translation, còn currency, date format, image relevant culture.
4. **Hosting** — CDN edge gần user, hoặc server riêng per region.
5. **Search Console geo-targeting**.

### Code minh hoạ

```typescript
// 1. URL strategy với subdirectory (Next.js App Router)
// app/[locale]/page.tsx — locale param

// middleware.ts — detect locale
import { NextResponse } from "next/server";

const SUPPORTED_LOCALES = ["en", "vi", "ja"];
const DEFAULT_LOCALE = "en";

export function middleware(req) {
  const pathname = req.nextUrl.pathname;
  const pathLocale = SUPPORTED_LOCALES.find(l =>
    pathname.startsWith(`/${l}/`) || pathname === `/${l}`
  );

  if (pathLocale) return NextResponse.next();

  // Detect from header / cookie / geo
  const cookieLocale = req.cookies.get("locale")?.value;
  const acceptLang = req.headers.get("accept-language")?.split(",")[0].split("-")[0];
  const country = req.geo?.country;

  const geoLocaleMap = { VN: "vi", JP: "ja", US: "en" };
  const detectedLocale =
    cookieLocale ??
    (SUPPORTED_LOCALES.includes(acceptLang) ? acceptLang : null) ??
    geoLocaleMap[country] ??
    DEFAULT_LOCALE;

  return NextResponse.redirect(new URL(`/${detectedLocale}${pathname}`, req.url));
}

// 2. hreflang tags
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }): Promise<Metadata> {
  const post = await fetchPost(params.slug, params.locale);

  return {
    title: post.title,
    alternates: {
      canonical: `https://example.com/${params.locale}/blog/${params.slug}`,
      languages: {
        "en": `https://example.com/en/blog/${params.slug}`,
        "vi": `https://example.com/vi/blog/${params.slug}`,
        "ja": `https://example.com/ja/blog/${params.slug}`,
        "x-default": `https://example.com/en/blog/${params.slug}`,
      },
    },
  };
}

// Output HTML
// <link rel="alternate" hreflang="en" href="https://example.com/en/blog/..." />
// <link rel="alternate" hreflang="vi" href="https://example.com/vi/blog/..." />
// <link rel="alternate" hreflang="ja" href="https://example.com/ja/blog/..." />
// <link rel="alternate" hreflang="x-default" href="https://example.com/en/blog/..." />

// hreflang reciprocal — page A trỏ B thì B phải trỏ A
// hreflang code chuẩn: ISO 639-1 (language) + ISO 3166-1 (country)
// "vi-VN" — Vietnamese in Vietnam
// "en-US" — English in US
// "en-GB" — English in UK
// "x-default" — fallback

// 3. Sitemap riêng per locale
// app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await db.post.findMany();

  return posts.flatMap((post) =>
    SUPPORTED_LOCALES.map((locale) => ({
      url: `https://example.com/${locale}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      alternates: {
        languages: Object.fromEntries(
          SUPPORTED_LOCALES.map((l) => [l, `https://example.com/${l}/blog/${post.slug}`])
        ),
      },
    }))
  );
}

// 4. Content localization (next-intl)
// messages/vi.json
{
  "home.title": "Chào mừng",
  "home.cta": "Đăng ký ngay",
  "currency": "{amount, number, ::currency/VND}",
  "date": "{date, date, long}"
}

// Component
import { useTranslations, useFormatter } from "next-intl";

function HomePage() {
  const t = useTranslations();
  const format = useFormatter();

  return (
    <>
      <h1>{t("home.title")}</h1>
      <p>{format.dateTime(new Date(), { dateStyle: "long" })}</p>
      <p>{format.number(150000, { style: "currency", currency: "VND" })}</p>
    </>
  );
}

// 5. Region-specific config
const REGION_CONFIG = {
  vi: { currency: "VND", phoneFormat: "+84", timeZone: "Asia/Ho_Chi_Minh" },
  ja: { currency: "JPY", phoneFormat: "+81", timeZone: "Asia/Tokyo" },
  en: { currency: "USD", phoneFormat: "+1", timeZone: "America/New_York" },
};

// 6. CDN edge gần user (Vercel/Cloudflare auto handle)
// Hoặc tự config:
// - VN traffic → Singapore edge
// - JP traffic → Tokyo edge
// - US traffic → US edge

// 7. Schema.org với localized data
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "My Company",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "VN",
    "addressLocality": "Hồ Chí Minh"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+84-123-456-789",
    "areaServed": "VN"
  }
}
```

### Đáp án mẫu

> "Em đi từ URL strategy. Chọn **subdirectory** `example.com/vi/...` cho hầu hết case — easier setup, domain authority share, ccTLD chỉ chọn khi có legal/branding reason riêng. **hreflang tags** bắt buộc — tell Google variant nào dành cho region/ngôn ngữ nào. Reciprocal (A trỏ B, B trỏ A). Format ISO 639-1 + 3166-1 (`vi-VN`, `en-US`), thêm `x-default` fallback. Setup qua Next.js Metadata API. **Middleware detect locale**: cookie > accept-language > geo (Cloudflare/Vercel header) > default. Set cookie sau detect để user không bị redirect mỗi lần. **Sitemap multilingual**: mỗi URL có `xhtml:link` cho variant ngôn ngữ. **Content localization** với next-intl: không chỉ translate, format date/number/currency theo locale (`Intl.DateTimeFormat`, `Intl.NumberFormat`). **CDN edge** gần user: VN traffic Singapore edge, JP Tokyo, US dual-coast. **Search Console** setup property cho mỗi locale subdirectory, geo-targeting per subdirectory. **Schema.org** localize: address country, currency, contact phone per region. Bẫy em từng dính: forget hreflang reciprocal → Google không respect; địa chỉ business hardcode 1 country trong schema → confusing cho region khác."

---

## Câu 6: Growth engineering — gì khác Marketing tech? `[Senior]`

### Câu hỏi

> Em là "Growth Engineer" — vai trò khác Software Engineer thường thế nào?

### Giải thích lý thuyết

Growth engineering = engineer chuyên build infrastructure cho growth team:

1. **Experimentation platform** — A/B test infrastructure.
2. **Analytics pipeline** — event collection, ETL, dashboarding.
3. **Personalization** — segment user, content/CTA cá nhân hoá.
4. **Onboarding optimization** — friction reduction, retention.
5. **Email/Push marketing tech** — transactional, drip campaign.
6. **Attribution** — multi-touch attribution, marketing channel ROI.
7. **Referral programs** — viral loop.

Khác với SWE:
- **Less feature, more iteration** — ship variant, measure, kill loser.
- **Data-driven** — every decision có metric back.
- **Marketing fluent** — hiểu CAC, LTV, churn, cohort.
- **Speed > perfection** — A/B test loser sẽ chết, no need over-engineer.

### Code minh hoạ

```typescript
// 1. Experimentation platform — tự build minimal
// db schema
model Experiment {
  id          String   @id @default(cuid())
  name        String   @unique
  status      String   // draft | running | concluded
  variants    Json     // [{ name: "A", weight: 0.5 }, { name: "B", weight: 0.5 }]
  targeting   Json     // [{ field: "country", op: "in", value: ["VN", "TH"] }]
  startedAt   DateTime?
  endedAt     DateTime?
}

model Assignment {
  userId       String
  experimentId String
  variant      String
  assignedAt   DateTime @default(now())
  @@unique([userId, experimentId])
}

// Server-side variant assignment
async function getVariant(userId: string, experimentName: string): Promise<string> {
  const cached = await redis.get(`exp:${experimentName}:${userId}`);
  if (cached) return cached;

  const experiment = await db.experiment.findUnique({ where: { name: experimentName } });
  if (!experiment || experiment.status !== "running") return "control";

  // Check targeting
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!matchesTargeting(user, experiment.targeting)) return "control";

  // Stable hash assignment
  const hash = murmurHash(`${experimentName}-${userId}`);
  let cumulative = 0;
  let assignedVariant = "control";
  for (const variant of experiment.variants) {
    cumulative += variant.weight;
    if (hash / 0xffffffff < cumulative) {
      assignedVariant = variant.name;
      break;
    }
  }

  await db.assignment.create({ data: { userId, experimentId: experiment.id, variant: assignedVariant } });
  await redis.setex(`exp:${experimentName}:${userId}`, 3600, assignedVariant);

  return assignedVariant;
}

// 2. Drip email campaign (n8n / Customer.io / Braze)
// Trigger event-based email
async function onUserSignup(user: User) {
  // Day 0: Welcome
  await sendEmail({ to: user.email, template: "welcome", data: { name: user.name } });

  // Schedule next emails
  await scheduleEmail({ userId: user.id, template: "day-3-tips", scheduledAt: addDays(new Date(), 3) });
  await scheduleEmail({ userId: user.id, template: "day-7-case-study", scheduledAt: addDays(new Date(), 7) });
  await scheduleEmail({ userId: user.id, template: "day-14-upgrade", scheduledAt: addDays(new Date(), 14) });
}

// Conditional drip — cancel nếu user đã action
async function onUserUpgrade(user: User) {
  await cancelScheduledEmails(user.id, "day-14-upgrade");
}

// 3. Referral program
async function generateReferralCode(userId: string): Promise<string> {
  const code = generateUniqueCode(); // base62 short

  await db.referralCode.create({
    data: { code, ownerId: userId, expiresAt: addDays(new Date(), 90) },
  });

  return code;
}

async function handleReferralSignup(newUserId: string, referralCode: string) {
  const referral = await db.referralCode.findUnique({ where: { code: referralCode } });
  if (!referral || referral.expiresAt < new Date()) return;

  await db.referral.create({
    data: { codeId: referral.id, referrerId: referral.ownerId, refereeId: newUserId },
  });

  // Reward khi referee complete purchase
  // Implement webhook
}

// 4. Cohort retention tracking
// SQL query (analytics DB)
/*
WITH cohorts AS (
  SELECT
    user_id,
    DATE_TRUNC('week', signup_date) AS cohort_week,
    DATE_TRUNC('week', activity_date) AS activity_week,
    EXTRACT(WEEK FROM activity_date - signup_date) AS week_number
  FROM user_activity
)
SELECT
  cohort_week,
  week_number,
  COUNT(DISTINCT user_id) AS active_users
FROM cohorts
GROUP BY cohort_week, week_number
ORDER BY cohort_week, week_number;
*/

// 5. Personalization
async function getPersonalizedContent(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId } });
  const segment = await classifyUser(user); // ML model / rule-based

  return {
    heroTitle: HERO_BY_SEGMENT[segment.persona] ?? HERO_DEFAULT,
    ctaText: CTA_BY_LIFECYCLE[segment.lifecycle] ?? "Sign up",
    products: await getRecommendedProducts(user, segment),
  };
}
```

### Đáp án mẫu

> "Growth Engineer ≠ SWE thường ở **mindset + scope**. SWE build feature stable; Growth build **experiment infrastructure** + **growth loops**. Cụ thể: **experimentation platform** — em build hoặc setup GrowthBook/Statsig, mọi feature mới ship qua experiment với metric tracking ngay. **Analytics pipeline** — event collection, ETL vào warehouse, dashboard cho growth team self-serve query. **Personalization** — segment user theo behavior/demographics, content/CTA cá nhân hoá per segment. **Onboarding optimization** — track funnel granular, fix friction từng step. **Drip email/push** infrastructure — event-triggered transactional + scheduled campaign. **Attribution** — multi-touch attribution model (first-touch, last-touch, linear, time-decay), connect marketing channel cost với revenue. **Referral loop** — invite code, reward tracking, viral coefficient measure. **Mindset khác**: Less perfectionism, more iteration speed — ship experiment, measure, kill loser. Code không cần beautiful nếu test failure → throw away. Em phải fluent với metric: CAC, LTV, churn, cohort retention, NDR — không chỉ technical. Em phải pair với marketer/PM thay vì PM hand-off spec. **Career path** Growth Engineer thường ở startup Series A-C — sau growth → có thể senior Product Engineer hoặc Founder track."

---

## Câu 7: Risks khi tăng traffic — em prepare gì? `[Senior]`

### Câu hỏi

> Marketing planned campaign sẽ đẩy 10x traffic tuần tới. Em prepare gì để app không sập?

### Giải thích lý thuyết

10x traffic spike attack points:

1. **CDN** — handle static asset OK, nhưng cache miss vẫn hit origin.
2. **Server compute** — function/container scale.
3. **Database** — connection pool, query performance.
4. **3rd-party API** — rate limit external.
5. **Real-time service** — WebSocket connection limit.
6. **Storage** — read amplification.

### Code minh hoạ

```typescript
// 1. Load test trước launch
// k6 script
import http from "k6/http";
import { check } from "k6";

export const options = {
  stages: [
    { duration: "2m", target: 100 },    // ramp up
    { duration: "5m", target: 1000 },   // sustained
    { duration: "2m", target: 5000 },   // spike
    { duration: "5m", target: 5000 },
    { duration: "2m", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<500", "p(99)<1000"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const res = http.get("https://staging.example.com/");
  check(res, {
    "status is 200": (r) => r.status === 200,
    "duration < 500ms": (r) => r.timings.duration < 500,
  });
}

// Run: k6 run loadtest.js

// 2. Caching aggressive
// app/page.tsx
export default async function HomePage() {
  // Cache 5 phút edge, stale-while-revalidate 1h
  const data = await fetch("https://api.example.com/homepage", {
    next: { revalidate: 300, tags: ["homepage"] },
  }).then(r => r.json());

  return <Home data={data} />;
}

// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=300, stale-while-revalidate=3600",
          },
        ],
      },
    ];
  },
};

// 3. Connection pooling DB
// lib/db.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ["error", "warn"],
  datasources: { db: { url: process.env.DATABASE_URL } },
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// PgBouncer in front of Postgres — pool 1000 client → 50 backend connection
// Connection string: ?pgbouncer=true&pool_timeout=20

// 4. Read replica
// For read-heavy workload, route SELECT to replica
const dbWrite = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
const dbRead = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_READ_URL } } });

async function getProducts() {
  return dbRead.product.findMany();  // read replica
}

async function createProduct(data) {
  return dbWrite.product.create({ data });  // primary
}

// 5. Rate limit own API (prevent abuse)
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const limiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "1 m"),  // 100/min per IP
  analytics: true,
});

export async function middleware(req) {
  const ip = req.ip ?? req.headers.get("x-forwarded-for") ?? "anonymous";
  const { success, limit, remaining } = await limiter.limit(ip);

  if (!success) {
    return new Response("Too many requests", {
      status: 429,
      headers: {
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": String(remaining),
        "Retry-After": "60",
      },
    });
  }
}

// 6. Circuit breaker cho 3rd-party API
class CircuitBreaker {
  private failures = 0;
  private nextAttempt = Date.now();
  private threshold = 5;
  private timeout = 60000;  // 1 min

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.failures >= this.threshold && Date.now() < this.nextAttempt) {
      throw new Error("Circuit breaker OPEN");
    }

    try {
      const result = await fn();
      this.failures = 0;
      return result;
    } catch (e) {
      this.failures++;
      if (this.failures >= this.threshold) {
        this.nextAttempt = Date.now() + this.timeout;
      }
      throw e;
    }
  }
}

const stripeBreaker = new CircuitBreaker();
async function charge(amount: number) {
  return stripeBreaker.call(() => stripe.charges.create({ amount }));
}

// 7. Graceful degradation
// Khi service nào fail → degrade thay vì error toàn page
async function HomePage() {
  let recommendations = [];
  try {
    recommendations = await fetchRecommendations();
  } catch {
    // Fallback static popular items
    recommendations = STATIC_POPULAR;
  }

  return (
    <>
      <Hero />  {/* critical, không skip */}
      <Recommendations items={recommendations} />
      <Suspense fallback={<div>Loading...</div>}>
        <PersonalizedFeed />  {/* nice-to-have, fallback skeleton OK */}
      </Suspense>
    </>
  );
}
```

```bash
# 8. Auto-scaling config
# Vercel — tự handle, không cần config
# Kubernetes HPA
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-app
spec:
  scaleTargetRef: { kind: Deployment, name: web-app }
  minReplicas: 3
  maxReplicas: 50
  metrics:
    - type: Resource
      resource:
        name: cpu
        target: { type: Utilization, averageUtilization: 70 }
```

### Đáp án mẫu

> "Em prepare 7 layer. **Layer 1 — Load test**: k6 simulate 10x sustained + 20x spike trên staging mirror prod. Identify bottleneck trước, không after. **Layer 2 — Caching**: cache aggressive ở mỗi layer — browser, CDN edge (s-maxage), origin Data Cache, Redis. Static asset immutable 1 năm. HTML với `stale-while-revalidate` để CDN serve stale + refresh background. **Layer 3 — Database**: connection pool (PgBouncer) trước Postgres để hold nhiều client với ít backend connection. Read replica cho query đọc, primary chỉ write. Query optimization — index thiếu trên hot path là disaster. **Layer 4 — Rate limit own API**: ngăn 1 user abuse, đảm bảo fair share. Upstash sliding window per IP. **Layer 5 — Circuit breaker** cho 3rd-party (Stripe, email service) — nếu external down, fail fast thay vì wait timeout, degrade graceful. **Layer 6 — Graceful degradation**: critical path (homepage, signup) phải work; nice-to-have (recommendations, personalized) có fallback skeleton hoặc static. Suspense boundary tách critical từ optional. **Layer 7 — Auto-scaling**: Vercel auto, hoặc K8s HPA threshold 70% CPU + custom metric (request/s). **Bonus — Pre-warm cache**: ngay trước launch, em chạy script hit top page để CDN populate cache, không có cold start cho 10x user đầu. **Observability**: Sentry alert threshold low hơn bình thường để catch sớm, Datadog dashboard riêng cho campaign. **Runbook chuẩn bị**: rollback plan, feature flag để disable feature ăn nhiều resource, hot fix process. Em coi 10x spike như mini-incident — phải có IC, war room, comm channel pre-setup."

---

## Câu 8: Tăng traffic organic — engineer làm gì? `[Senior]`

### Câu hỏi

> Em được giao mission tăng organic traffic 50% trong 6 tháng. Mission của em (engineer) là gì?

### Giải thích lý thuyết

Organic traffic = SEO + content + UX. Engineer ảnh hưởng:

1. **Programmatic SEO** — generate 100k+ landing page từ data.
2. **Content infrastructure** — CMS, editing flow, publish workflow.
3. **Internal linking** — cross-link related content automated.
4. **Page speed** — CWV ranking factor.
5. **Schema.org** — rich snippet → CTR cao hơn từ SERP.
6. **Multilingual** — tăng addressable market.
7. **AMP / mobile-friendly** — mobile-first index.
8. **Crawl budget** — fix duplicate, dead link, infinite scroll trap.

### Code minh hoạ

```typescript
// 1. Programmatic SEO — generate landing per city/topic
// app/[city]/restaurants/page.tsx
export async function generateStaticParams() {
  const cities = await db.city.findMany();
  return cities.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({ params }) {
  const city = await db.city.findUnique({ where: { slug: params.city } });
  return {
    title: `Nhà hàng ngon ở ${city.name} - Top 50 quán 2026`,
    description: `Khám phá ${city.restaurantCount}+ nhà hàng ở ${city.name}...`,
  };
}

export default async function CityRestaurants({ params }) {
  const city = await db.city.findUnique({
    where: { slug: params.city },
    include: { restaurants: { take: 50 } },
  });

  return (
    <>
      <h1>Nhà hàng ngon ở {city.name}</h1>
      <RestaurantList restaurants={city.restaurants} />
      <NeighborhoodLinks city={city} />  {/* internal linking */}
      <RelatedCities city={city} />
    </>
  );
}

// → 64 city × 100 topic = 6400 SEO landing tự động generated
// Lưu ý: content phải value, không thin/duplicate

// 2. Internal linking automation
// Khi publish blog post, tự tìm related post và inject cross-link
async function postProcessContent(html: string, postId: string) {
  const relatedKeywords = await extractKeywords(html); // NLP

  for (const keyword of relatedKeywords) {
    const relatedPost = await db.post.findFirst({
      where: {
        keywords: { has: keyword },
        id: { not: postId },
        published: true,
      },
      orderBy: { authority: "desc" },
    });

    if (relatedPost) {
      // Replace first occurrence của keyword với link
      html = html.replace(
        new RegExp(`\\b${keyword}\\b`, "i"),
        `<a href="/blog/${relatedPost.slug}">${keyword}</a>`,
      );
    }
  }

  return html;
}

// 3. Breadcrumb schema (cải thiện CTR từ SERP)
function BreadcrumbSchema({ items }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

// 4. FAQ schema (eligible for rich snippet)
function FAQSection({ faqs }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: { "@type": "Answer", text: q.answer },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <section>
        <h2>Câu hỏi thường gặp</h2>
        {faqs.map((q) => (
          <details key={q.id}>
            <summary>{q.question}</summary>
            <p>{q.answer}</p>
          </details>
        ))}
      </section>
    </>
  );
}

// 5. Crawl budget optimization
// - Block useless URL crawling
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/_next/",
          "/admin/",
          "/*?utm_*",       // URL với UTM (duplicate)
          "/*?fbclid=*",    // Facebook click ID
          "/*?ref=*",       // Referral param
          "/search?*",      // Internal search
          "/login",
          "/cart",
        ],
      },
    ],
    sitemap: "https://example.com/sitemap.xml",
  };
}

// Canonical cho URL với param
export async function generateMetadata({ params, searchParams }) {
  return {
    alternates: {
      canonical: `https://example.com${pathname}`,  // không kèm searchParams
    },
  };
}

// 6. Image alt + lazy load
<Image
  src="/restaurant.jpg"
  width={800}
  height={600}
  alt="Nhà hàng XYZ ở Quận 1, TP.HCM"  // descriptive alt cho image SEO
  loading="lazy"
/>

// 7. RSS feed (build inbound link + AI training visibility)
// app/feed.xml/route.ts
export async function GET() {
  const posts = await db.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: 50,
  });

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>My Blog</title>
        <link>https://example.com</link>
        <description>...</description>
        ${posts.map(p => `
          <item>
            <title>${p.title}</title>
            <link>https://example.com/blog/${p.slug}</link>
            <pubDate>${p.publishedAt.toUTCString()}</pubDate>
            <description>${p.excerpt}</description>
          </item>
        `).join("")}
      </channel>
    </rss>`;

  return new Response(feed, { headers: { "Content-Type": "application/xml" } });
}
```

### Đáp án mẫu

> "Engineer's 7 lever cho organic growth. **Lever 1 — Programmatic SEO**: generate landing page từ data — 64 city × 100 topic = 6400 page. Content value (data thật, không thin/duplicate) + Next.js SSG → Google index nhiều page = traffic long-tail. Pattern Airbnb, Yelp, TripAdvisor đều dùng. **Lever 2 — Internal linking**: viết script post-process content, tự inject cross-link tới related post — tăng dwell time + crawl depth. **Lever 3 — Schema markup**: Article, FAQ, Breadcrumb, Product, HowTo — eligible cho rich snippet → CTR từ SERP tăng 30-100%. **Lever 4 — Core Web Vitals**: LCP dưới 2.5s, INP dưới 200ms — ranking factor + reduce bounce. **Lever 5 — Crawl budget**: block useless URL (search result, UTM tracking, admin), canonical tag chống duplicate, sitemap clean — Googlebot focus pages quan trọng. **Lever 6 — Multilingual**: hreflang setup + content localize → tăng addressable market 3-5x với cùng content. **Lever 7 — Content infrastructure**: CMS tốt, publish workflow nhanh — content team output 3-5x. RSS feed cho inbound link + AI training visibility (ChatGPT cite source có RSS thường xuyên). **Measure**: Search Console weekly check — Coverage (page indexed), Performance (impression, click, CTR, position), CWV. Em không chỉ ship — em **review report Search Console** với content team để biết keyword nào ranking gần top → optimize đẩy lên page 1. Mission 50% trong 6 tháng achievable với programmatic SEO + CWV fix + schema markup. Quan trọng: **mọi page generated phải có content value thực** — Google penalty thin content rất nặng."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                                | Đúng là                                                              |
| ------------------------------------------------------ | -------------------------------------------------------------------- |
| "SEO chỉ là job của marketer"                          | Technical SEO là engineer's job — render, metadata, schema, speed    |
| "Google rank dựa Lighthouse score"                     | Dựa real user data (CrUX), lab metric chỉ là proxy                   |
| "Track mọi event để có data"                           | Track theo question business cần trả lời; data noise hại hơn lợi    |
| "Cache hit cao là thắng"                               | Cache stale gây bug; phải invalidate đúng                            |
| "10x traffic = scale server 10x là OK"                 | Bottleneck thường ở DB connection, 3rd-party API rate limit         |
| "Programmatic SEO = generate page nhanh"               | Content phải value; thin content = Google penalty                    |
| "International SEO = thêm hreflang là xong"            | Còn URL strategy, content localize, hosting region, currency        |
