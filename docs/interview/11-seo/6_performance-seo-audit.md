---
sidebar_position: 6
title: "6. Performance SEO & Audit Checklist"
---

# Performance SEO & Audit Checklist

> *Performance và SEO gặp nhau ở Core Web Vitals. Nhóm câu cuối này tổng hợp: CWV ảnh hưởng ranking thế nào, tối ưu LCP trong React/Next.js, và checklist audit hoàn chỉnh — câu "chốt hạ" thường gặp cuối buổi phỏng vấn.*

:::note[Ghi nhớ nhanh]

- ⭐ **3 Core Web Vitals** — `LCP` (tải, tốt ≤ 2.5s), `INP` (phản hồi, thay FID, tốt ≤ 200ms), `CLS` (ổn định layout, tốt ≤ 0.1).
- ⭐ **CWV là ranking signal nhẹ** — thuộc nhóm "page experience" nhưng relevance của content vẫn áp đảo; CWV đóng vai trò tie-breaker.
- **Đánh giá bằng field data (CrUX)** — user Chrome thật ở percentile 75, không phải điểm Lighthouse chạy local.
- **Ảnh hưởng gián tiếp thường lớn hơn** — trang chậm → bounce cao, engagement kém, tốn crawl budget nhiều hơn.
- **Cách theo dõi** — Search Console CWV report, PageSpeed Insights, và tự đo RUM bằng thư viện `web-vitals`.

:::

---

## Câu 8: Core Web Vitals là gì? Ảnh hưởng thế nào đến SEO ranking? `[Intermediate]`

### Câu hỏi

> Core Web Vitals gồm những metric nào? Chúng ảnh hưởng đến SEO ranking ở mức độ nào?

### Giải thích lý thuyết

**Core Web Vitals** là 3 metrics Google dùng đo trải nghiệm user thật (chi tiết từng metric xem topic [Performance](../10-performance/1_core-web-vitals.md)):

| Metric | Đo | Ngưỡng tốt |
| --- | --- | --- |
| **LCP** (Largest Contentful Paint) | Tốc độ tải | ≤ 2.5s |
| **INP** (Interaction to Next Paint) | Độ phản hồi (thay FID từ 3/2024) | ≤ 200ms |
| **CLS** (Cumulative Layout Shift) | Độ ổn định layout | ≤ 0.1 |

**Ảnh hưởng đến ranking — cần trả lời có chừng mực, đây là điểm phân biệt người hiểu thật:**

- CWV là **ranking signal chính thức** (thuộc nhóm "page experience"), nhưng là signal **nhẹ** — nội dung liên quan (relevance) vẫn áp đảo. Trang content tốt nhưng CWV kém vẫn có thể rank cao.
- CWV đóng vai trò **tie-breaker**: khi nhiều trang có content tương đương, trang trải nghiệm tốt hơn được ưu tiên.
- Đánh giá dựa trên **field data** (CrUX — user Chrome thật, percentile 75), **không phải** điểm Lighthouse chạy local.
- Ảnh hưởng **gián tiếp** thường lớn hơn trực tiếp: trang chậm → bounce rate cao, user quay lại SERP → engagement kém; trang chậm còn ăn **crawl budget** nhiều hơn (Googlebot crawl ít trang hơn mỗi phiên).

Cách theo dõi: Search Console → Core Web Vitals report (field data theo nhóm URL), PageSpeed Insights (cả field + lab), tự đo RUM bằng thư viện `web-vitals`.

### Code minh hoạ

```js
// Theo dõi CWV bằng RUM — field data của chính site mình
import { onLCP, onINP, onCLS } from "web-vitals";

function report(metric) {
  navigator.sendBeacon(
    "/api/vitals",
    JSON.stringify({ name: metric.name, value: metric.value, rating: metric.rating })
  );
}

onLCP(report);
onINP(report);
onCLS(report);
```

### Đáp án mẫu

> "Core Web Vitals gồm LCP đo tốc độ tải với ngưỡng tốt 2.5 giây, INP đo độ phản hồi với ngưỡng 200ms — đã thay FID từ 2024, và CLS đo độ ổn định layout với ngưỡng 0.1. Về ranking, em trả lời có chừng mực: nó là ranking signal chính thức nhưng là signal nhẹ, đóng vai trò tie-breaker khi content tương đương — content relevance vẫn quan trọng nhất. Google đánh giá bằng field data từ CrUX ở percentile 75, không phải điểm Lighthouse local — nhiều người nhầm chỗ này. Tác động gián tiếp thường lớn hơn: trang chậm làm bounce rate cao và tốn crawl budget khiến Googlebot crawl được ít trang hơn. Em theo dõi qua Core Web Vitals report trong Search Console và RUM tự đo bằng thư viện web-vitals."

---

## Câu 21: Cách tối ưu Largest Contentful Paint (LCP) trong React/Next.js? `[Advanced]`

### Câu hỏi

> Trang Next.js của em có LCP 4.5s. Em trình bày quy trình chẩn đoán và các kỹ thuật tối ưu cụ thể trong React/Next.js?

### Giải thích lý thuyết

**Bước 1 — chẩn đoán, không đoán mò.** LCP gồm 4 sub-part, đo bằng Chrome DevTools Performance panel hoặc PageSpeed Insights để biết phần nào chiếm nhiều nhất:

1. **TTFB** — server chậm.
2. **Resource load delay** — browser phát hiện resource LCP muộn.
3. **Resource load time** — resource nặng/network chậm.
4. **Element render delay** — resource về rồi nhưng chưa render được.

**Bước 2 — fix theo từng phần, công cụ cụ thể trong Next.js:**

**Giảm TTFB:**

- Chuyển trang từ SSR sang **SSG/ISR** (serve từ CDN) — đòn lớn nhất.
- SSR thì dùng **streaming** (`loading.tsx`, `<Suspense>`): shell trả về ngay, data chậm stream sau.
- Cache data fetch (fetch cache, `unstable_cache`), tối ưu query, đặt region server gần user.

**Giảm load delay của ảnh LCP:**

- `next/image` với **`priority`** → tự preload + `fetchpriority="high"`, tắt lazy load.
- **Không bao giờ lazy-load ảnh LCP** — lỗi số một thực tế.
- Ảnh phải có trong HTML thô (SSR/SSG), không inject bằng JS sau khi mount.

**Giảm load time:**

- `next/image` tự convert **AVIF/WebP** + serve đúng size qua `srcset`/`sizes`.
- `placeholder="blur"`, preconnect tới CDN/image host.

**Giảm render delay:**

- Nếu LCP là text: tránh chờ client-side JS — content trong Server Component; tối ưu font với **`next/font`** (self-host, `font-display: swap`, không chặn render).
- Giảm JS blocking: bớt `use client` không cần thiết, dynamic import cho component nặng dưới fold, bỏ third-party script khỏi critical path (`next/script` với `strategy="lazyOnload"`/`afterInteractive`).

### Code minh hoạ

```tsx
// 1. Ảnh hero: priority + đúng size
import Image from "next/image";
<Image src="/hero.jpg" alt="..." width={1200} height={600} priority />;

// 2. Font không chặn render
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], display: "swap" });

// 3. Streaming: shell + LCP element trả ngay, phần chậm stream sau
export default function Page() {
  return (
    <>
      <Hero />                         {/* LCP element — render ngay */}
      <Suspense fallback={<Skeleton />}>
        <SlowRecommendations />         {/* data chậm không chặn LCP */}
      </Suspense>
    </>
  );
}

// 4. Component nặng dưới fold: không cho vào bundle đầu
const HeavyChart = dynamic(() => import("./HeavyChart"));

// 5. Third-party script ra khỏi critical path
import Script from "next/script";
<Script src="https://analytics.example.com/script.js" strategy="lazyOnload" />;
```

### Đáp án mẫu

> "Đầu tiên em chẩn đoán chứ không đoán: LCP có 4 sub-part — TTFB, load delay, load time, render delay — DevTools Performance panel cho biết phần nào chiếm nhiều nhất. Nếu TTFB cao, đòn lớn nhất là chuyển trang sang SSG hoặc ISR để serve từ CDN; phải SSR thì dùng streaming với Suspense để shell và LCP element trả về ngay. Nếu là load delay — thường gặp nhất — ảnh hero bị lazy load nhầm hoặc inject bằng JS: fix bằng `next/image` với `priority` để được preload và fetchpriority high. Load time thì next/image đã lo AVIF/WebP và srcset đúng size. Render delay thì tối ưu font bằng `next/font` với display swap, giảm `use client` không cần thiết, dynamic import component nặng dưới fold và đẩy third-party script ra khỏi critical path bằng `next/script`. Sau khi fix em verify lại bằng field data chứ không chỉ Lighthouse, vì ranking dùng dữ liệu user thật."

---

## Câu 22: SEO audit checklist cho frontend developer: cần kiểm tra những gì? `[Advanced]`

### Câu hỏi

> Em được giao audit SEO cho một website đang chạy. Em trình bày checklist và quy trình kiểm tra của mình?

### Giải thích lý thuyết

Audit theo thứ tự "Google có thấy trang không → hiểu trang không → trang có tốt không":

**1. Crawlability & Indexability (quan trọng nhất — sai ở đây thì mọi thứ sau vô nghĩa)**

- [ ] robots.txt không chặn nhầm trang/resource quan trọng (đặc biệt sót `Disallow: /` từ staging)
- [ ] Không có `noindex` sót lại trên trang cần index
- [ ] Sitemap tồn tại, được submit, chỉ chứa URL canonical trả 200
- [ ] Search Console → Index coverage: trang quan trọng được index, check lý do các trang bị loại
- [ ] Content có trong **HTML thô** (curl/View Source) hay phụ thuộc JS — nếu CSR, test render bằng URL Inspection
- [ ] Không có soft 404, redirect chain/loop; trang 404 trả đúng HTTP 404

**2. On-page & Metadata**

- [ ] Title unique từng trang, 50–60 ký tự; description unique 150–160 ký tự
- [ ] Đúng **một `<h1>`** mỗi trang, heading hierarchy không nhảy cấp
- [ ] Canonical đúng trên trang có query params/duplicate
- [ ] Ảnh có alt text; ảnh trang trí dùng `alt=""`
- [ ] Internal link là `<a href>` thật, anchor text mô tả; không có orphan page, link gãy
- [ ] Structured data hợp lệ (Rich Results Test), khớp nội dung trang

**3. Social & International (nếu áp dụng)**

- [ ] OG tags + og:image 1200×630 trong HTML thô (test Facebook Sharing Debugger)
- [ ] hreflang bidirectional + self-reference + x-default

**4. Performance & Mobile**

- [ ] Core Web Vitals đạt "good" theo **field data** (Search Console CWV report, PSI)
- [ ] Ảnh LCP không bị lazy load, có preload/priority
- [ ] Mobile-friendly: viewport meta, không content tràn ngang (Google index mobile-first)
- [ ] HTTPS toàn site, không mixed content

**Công cụ theo từng nhóm:**

| Nhóm | Công cụ |
| --- | --- |
| Index/crawl | Google Search Console (URL Inspection, Coverage), `curl`, `site:domain.com` |
| Crawl toàn site | Screaming Frog (bật JS rendering), Ahrefs/Semrush Site Audit |
| Performance | PageSpeed Insights (field + lab), Lighthouse CI, web-vitals RUM |
| Structured data / Social | Rich Results Test, Facebook Sharing Debugger |

**Quy trình báo cáo**: xếp issue theo **impact × effort** — fix trước những lỗi chặn index (ảnh hưởng toàn site, effort thấp như robots.txt sai), sau đó mới đến tối ưu từng trang.

### Code minh hoạ

```bash
# Kiểm tra nhanh "Google thấy gì" không cần tool
curl -s https://example.com/robots.txt                 # có chặn nhầm không?
curl -sI https://example.com/page-cu                   # status? redirect mấy lần?
curl -s https://example.com | grep -iE "<title>|noindex|canonical"
curl -s https://example.com/products/ao-thun | grep -i "ao thun"  # content trong HTML thô?

# Số trang đã index (ước lượng)
# Google: site:example.com
```

```js
// Script audit nhanh trong console: heading hierarchy + ảnh thiếu alt
console.log([...document.querySelectorAll("h1")].length); // phải = 1
console.log(
  [...document.images].filter((img) => !img.hasAttribute("alt")).map((i) => i.src)
); // ảnh thiếu alt
```

### Đáp án mẫu

> "Em audit theo thứ tự ưu tiên: Google có thấy trang không, hiểu trang không, rồi mới đến trang có tốt không. Bước một là crawlability và indexability — quan trọng nhất vì sai ở đây thì mọi thứ sau vô nghĩa: check robots.txt có chặn nhầm không, có noindex sót từ staging không, sitemap sạch không, và content có nằm trong HTML thô không hay phụ thuộc JS — em verify bằng curl và URL Inspection trong Search Console. Bước hai là on-page: title và description unique từng trang, một h1 mỗi trang, canonical đúng, alt text, internal link là thẻ a thật và structured data hợp lệ. Bước ba là social và hreflang nếu site đa ngôn ngữ. Bước bốn là Core Web Vitals theo field data và mobile-friendly vì Google index mobile-first. Tool chính: Search Console, Screaming Frog có bật JS rendering để crawl toàn site, PageSpeed Insights, Rich Results Test. Cuối cùng em xếp issue theo impact nhân effort — lỗi chặn index toàn site mà fix nhanh như robots.txt sai luôn đứng đầu danh sách."
