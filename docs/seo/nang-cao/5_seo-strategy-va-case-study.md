---
sidebar_position: 5
title: "5. Chiến lược SEO tổng thể"
---

# Chiến lược SEO tổng thể — Audit, Roadmap và Case Studies

## Mục lục

- [Giới thiệu](#giới-thiệu)
- [1. SEO Audit Checklist](#1-seo-audit-checklist)
- [2. SEO Roadmap cho Website Mới](#2-seo-roadmap-cho-website-mới)
- [3. Case Study 1: Tối ưu Next.js Landing Page từ Score 40 lên 95](#3-case-study-1-tối-ưu-nextjs-landing-page-từ-score-40-lên-95)
- [4. Case Study 2: SPA sang SSR Migration — Ảnh hưởng Traffic](#4-case-study-2-spa-sang-ssr-migration-ảnh-hưởng-traffic)
- [5. SEO cho Developer — Career Implications](#5-seo-cho-developer-career-implications)
- [6. Tools và Resources cho Continuous Learning](#6-tools-và-resources-cho-continuous-learning)
- [7. Lỗi thường gặp](#7-lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Giới thiệu

Biết kỹ thuật SEO riêng lẻ là chưa đủ. Bạn cần biết cách kết hợp chúng thành một chiến lược tổng thể: audit hiện trạng, lập roadmap thực hiện, đo lường kết quả, và điều chỉnh liên tục. Bài này tổng hợp mọi thứ từ các bài trước thành framework hành động, kèm case studies thực tế để bạn thấy quá trình từ lý thuyết đến kết quả.

---

## 1. SEO Audit Checklist

### Technical SEO Checklist

| STT | Hạng mục | Kiểm tra | Tool |
|---|---|---|---|
| 1 | Crawlability | `robots.txt` không block trang quan trọng | Google Search Console |
| 2 | Indexability | Không có `noindex` trên trang cần index | Screaming Frog |
| 3 | Sitemap | `sitemap.xml` tồn tại và updated | Manual check |
| 4 | HTTPS | Toàn bộ site chạy HTTPS, không mixed content | Lighthouse |
| 5 | Mobile-friendly | Responsive, no horizontal scroll | Mobile-Friendly Test |
| 6 | Core Web Vitals | LCP < 2.5s, FID < 100ms, CLS < 0.1 | PageSpeed Insights |
| 7 | Canonical tags | Mỗi trang có canonical, không conflict | Screaming Frog |
| 8 | Redirect chains | Không có redirect chains > 2 hops | Screaming Frog |
| 9 | 404 pages | Không có broken internal links | Custom script |
| 10 | Structured data | JSON-LD valid, không có errors | Rich Results Test |

### On-Page SEO Checklist

| STT | Hạng mục | Kiểm tra | Ghi chú |
|---|---|---|---|
| 1 | Title tag | 30-60 chars, chứa primary keyword | Unique mỗi trang |
| 2 | Meta description | 120-160 chars, có CTA | Unique mỗi trang |
| 3 | H1 tag | Chính xác 1 H1/trang, chứa keyword | Khác title tag |
| 4 | Heading hierarchy | H2, H3 logic, không skip levels | |
| 5 | Image alt text | Mọi image có alt mô tả | Chứa keyword khi phù hợp |
| 6 | Internal linking | Mỗi trang có >= 3 internal links | Anchor text đa dạng |
| 7 | Content quality | >= 300 words, unique, có giá trị | Không thin content |
| 8 | URL structure | Clean, descriptive, có keyword | Không query params |
| 9 | Open Graph | og:title, og:description, og:image | Kiểm tra share preview |
| 10 | Schema markup | Article, Product, FAQ khi phù hợp | Validate bằng Rich Results Test |

### Off-Page SEO Checklist

| STT | Hạng mục | Kiểm tra | Tool |
|---|---|---|---|
| 1 | Backlink profile | Đa dạng domains, quality > quantity | Ahrefs/Moz |
| 2 | Toxic backlinks | Disavow spam backlinks | Google Disavow Tool |
| 3 | NAP consistency | Cho local businesses | Manual audit |
| 4 | Social signals | Profiles linked, active | Manual check |
| 5 | Brand mentions | Monitor unlinked mentions | Google Alerts |

### Script audit tự động

```javascript
// scripts/seo-audit.js
const cheerio = require('cheerio');

async function fullAudit(url) {
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);

  const report = {
    url,
    timestamp: new Date().toISOString(),
    technical: {},
    onPage: {},
    score: 0,
  };

  let totalChecks = 0;
  let passedChecks = 0;

  // === TECHNICAL CHECKS ===

  // HTTPS
  totalChecks++;
  report.technical.https = url.startsWith('https');
  if (report.technical.https) passedChecks++;

  // Canonical
  totalChecks++;
  const canonical = $('link[rel="canonical"]').attr('href');
  report.technical.canonical = {
    exists: !!canonical,
    value: canonical || null,
    selfReferencing: canonical === url,
  };
  if (report.technical.canonical.exists) passedChecks++;

  // Robots meta
  totalChecks++;
  const robotsMeta = $('meta[name="robots"]').attr('content') || '';
  report.technical.robotsMeta = {
    value: robotsMeta,
    indexable: !robotsMeta.includes('noindex'),
  };
  if (report.technical.robotsMeta.indexable) passedChecks++;

  // === ON-PAGE CHECKS ===

  // Title
  totalChecks++;
  const title = $('title').text().trim();
  report.onPage.title = {
    value: title,
    length: title.length,
    optimal: title.length >= 30 && title.length <= 60,
  };
  if (report.onPage.title.optimal) passedChecks++;

  // Meta description
  totalChecks++;
  const description = $('meta[name="description"]').attr('content') || '';
  report.onPage.description = {
    value: description,
    length: description.length,
    optimal: description.length >= 120 && description.length <= 160,
  };
  if (report.onPage.description.optimal) passedChecks++;

  // H1
  totalChecks++;
  const h1s = $('h1').map((_, el) => $(el).text()).get();
  report.onPage.h1 = {
    count: h1s.length,
    values: h1s,
    optimal: h1s.length === 1,
  };
  if (report.onPage.h1.optimal) passedChecks++;

  // Images
  totalChecks++;
  const totalImages = $('img').length;
  const imagesWithAlt = $('img[alt]:not([alt=""])').length;
  report.onPage.images = {
    total: totalImages,
    withAlt: imagesWithAlt,
    missingAlt: totalImages - imagesWithAlt,
    allHaveAlt: totalImages === imagesWithAlt,
  };
  if (report.onPage.images.allHaveAlt) passedChecks++;

  // Open Graph
  totalChecks++;
  report.onPage.openGraph = {
    title: !!$('meta[property="og:title"]').attr('content'),
    description: !!$('meta[property="og:description"]').attr('content'),
    image: !!$('meta[property="og:image"]').attr('content'),
  };
  const ogComplete =
    report.onPage.openGraph.title &&
    report.onPage.openGraph.description &&
    report.onPage.openGraph.image;
  if (ogComplete) passedChecks++;

  // Internal links
  totalChecks++;
  const internalLinks = $(`a[href^="/"], a[href^="${url}"]`).length;
  report.onPage.internalLinks = {
    count: internalLinks,
    sufficient: internalLinks >= 3,
  };
  if (report.onPage.internalLinks.sufficient) passedChecks++;

  // Structured data
  totalChecks++;
  const jsonLdScripts = $('script[type="application/ld+json"]');
  const schemas = [];
  jsonLdScripts.each((_, el) => {
    try {
      const data = JSON.parse($(el).html());
      schemas.push(data['@type'] || 'unknown');
    } catch (e) {
      schemas.push('invalid JSON');
    }
  });
  report.onPage.structuredData = {
    count: schemas.length,
    types: schemas,
    hasStructuredData: schemas.length > 0,
  };
  if (report.onPage.structuredData.hasStructuredData) passedChecks++;

  // Score
  report.score = Math.round((passedChecks / totalChecks) * 100);

  return report;
}

async function main() {
  const url = process.argv[2] || 'https://example.com';
  const report = await fullAudit(url);

  console.log('\n=== SEO AUDIT REPORT ===');
  console.log(`URL: ${report.url}`);
  console.log(`Score: ${report.score}/100`);
  console.log(`Date: ${report.timestamp}`);
  console.log('\n--- Technical ---');
  console.log(JSON.stringify(report.technical, null, 2));
  console.log('\n--- On-Page ---');
  console.log(JSON.stringify(report.onPage, null, 2));
}

main();
```

---

## 2. SEO Roadmap cho Website Mới

### Tháng 1-2: Foundation (Technical SEO)

| Tuần | Task | Chi tiết |
|---|---|---|
| 1-2 | Setup infrastructure | HTTPS, CDN, proper hosting |
| 2-3 | Technical SEO | robots.txt, sitemap.xml, canonical tags |
| 3-4 | Core Web Vitals | Image optimization, code splitting, lazy loading |
| 4-5 | Structured data | JSON-LD cho Organization, BreadcrumbList |
| 5-6 | Analytics setup | Google Analytics 4, Search Console verified |
| 7-8 | Mobile optimization | Responsive design, touch targets |

### Tháng 3-4: Content Foundation (On-Page SEO)

| Tuần | Task | Chi tiết |
|---|---|---|
| 9-10 | Keyword research | Identify 50-100 target keywords |
| 10-11 | Content architecture | URL structure, category hierarchy |
| 11-12 | Core pages | Homepage, About, Contact optimized |
| 12-13 | Blog setup | 10 pillar articles planned |
| 13-14 | Internal linking | Strategy cho content clusters |
| 15-16 | First content batch | 10 articles published |

### Tháng 5-6: Growth (Off-Page + Scaling)

| Tuần | Task | Chi tiết |
|---|---|---|
| 17-18 | Link building | Guest posts, resource page outreach |
| 19-20 | Content scaling | 5 articles/week |
| 21-22 | Social presence | Profile setup, content sharing |
| 23-24 | Local SEO | GBP setup (nếu applicable) |

### Tháng 7-12: Optimization Loop

```
Mỗi tháng:
1. Analyze GSC data → Tìm keyword opportunities
2. Update existing content → Cải thiện trang underperforming
3. Create new content → Target new keywords
4. Technical audit → Fix issues phát sinh
5. Backlink outreach → 5-10 quality backlinks/tháng
```

---

## 3. Case Study 1: Tối ưu Next.js Landing Page từ Score 40 lên 95

### Bối cảnh

- Website: SaaS landing page xây bằng Next.js
- Lighthouse SEO score ban đầu: **40/100**
- Vấn đề chính: Client-side rendering, thiếu meta tags, images chưa optimize

### Phân tích ban đầu

```bash
# Chạy Lighthouse audit ban đầu
npx lighthouse https://example.com --output json --output-path=./baseline.json
```

Kết quả ban đầu:

| Metric | Score | Vấn đề |
|---|---|---|
| SEO | 40 | Missing meta tags, no structured data |
| Performance | 35 | Large images, no code splitting |
| Accessibility | 55 | Missing alt text, low contrast |
| Best Practices | 60 | Console errors, HTTP images |

### Giai đoạn 1: Fix Critical SEO Issues (Tuần 1)

**Before** - Thiếu meta tags hoàn toàn:

```html
<!-- BEFORE: Không có SEO tags nào -->
<head>
  <title>My App</title>
  <link rel="stylesheet" href="/styles.css" />
</head>
```

**After** - Meta tags đầy đủ:

```tsx
// components/SEOHead.tsx
import Head from 'next/head';

interface SEOHeadProps {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
}

export function SEOHead({ title, description, canonical, ogImage }: SEOHeadProps) {
  const fullTitle = `${title} | SaaS Platform`;
  const defaultOgImage = 'https://example.com/og-default.jpg';

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage || defaultOgImage} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage || defaultOgImage} />

      {/* Robots */}
      <meta name="robots" content="index, follow" />
    </Head>
  );
}
```

**Kết quả sau giai đoạn 1**: SEO score 40 -> **65**

### Giai đoạn 2: Chuyển CSR sang SSR/SSG (Tuần 2-3)

**Before** - Client-side rendering:

```javascript
// pages/index.js — BEFORE: CSR, Google không thấy content
import { useEffect, useState } from 'react';

export default function Home() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/landing-data')
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h1>{data.title}</h1>
      <p>{data.description}</p>
    </div>
  );
}
```

**After** - Static generation:

```javascript
// pages/index.js — AFTER: SSG, content có sẵn khi Google crawl
export async function getStaticProps() {
  const data = await fetchLandingData();

  return {
    props: { data },
    revalidate: 3600, // ISR: revalidate mỗi giờ
  };
}

export default function Home({ data }) {
  return (
    <div>
      <SEOHead
        title="Quản lý dự án thông minh"
        description="Nền tảng quản lý dự án AI-powered. Tự động phân công task, tracking tiến độ, báo cáo real-time."
        canonical="https://example.com"
      />
      <h1>{data.title}</h1>
      <p>{data.description}</p>
    </div>
  );
}
```

**Kết quả sau giai đoạn 2**: SEO score 65 -> **78**

### Giai đoạn 3: Structured Data + Performance (Tuần 3-4)

```html
<!-- Thêm Organization + WebSite schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "SaaS Platform",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "sameAs": [
    "https://twitter.com/saasplatform",
    "https://linkedin.com/company/saasplatform"
  ]
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "SaaS Platform",
  "url": "https://example.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://example.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
</script>
```

Image optimization:

```javascript
// BEFORE: Unoptimized images
// <img src="/hero.png" /> — 2.5MB PNG, no dimensions

// AFTER: Next.js Image component
import Image from 'next/image';

<Image
  src="/hero.png"
  alt="Dashboard quản lý dự án với biểu đồ tiến độ và task board"
  width={1200}
  height={630}
  priority // Preload hero image
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZ..."
/>
```

**Kết quả cuối cùng**:

| Metric | Before | After | Thay đổi |
|---|---|---|---|
| SEO | 40 | **95** | +55 |
| Performance | 35 | **88** | +53 |
| Accessibility | 55 | **92** | +37 |
| Best Practices | 60 | **95** | +35 |

---

## 4. Case Study 2: SPA sang SSR Migration — Ảnh hưởng Traffic

### Bối cảnh

- Website: React SPA (Create React App) cho blog công nghệ
- 150 bài viết, organic traffic: ~500 sessions/tháng
- Vấn đề: Google index rất ít trang vì CSR

### Phân tích trước migration

```bash
# Kiểm tra index coverage trong GSC
# Kết quả: Chỉ 20/150 trang được index
# Lý do: Googlebot thấy empty HTML shell, JS render không hoàn chỉnh
```

```html
<!-- View source của SPA — đây là tất cả Google thấy -->
<!DOCTYPE html>
<html>
<head>
  <title>Tech Blog</title>
</head>
<body>
  <div id="root"></div>
  <script src="/static/js/bundle.js"></script>
</body>
</html>
<!-- Không có content, meta tags, hay structured data -->
```

### Migration Plan

| Giai đoạn | Thời gian | Task |
|---|---|---|
| 1. Setup Next.js | Tuần 1-2 | Migrate routing, setup SSR |
| 2. Migrate components | Tuần 2-3 | Convert React components |
| 3. Add SEO layer | Tuần 3-4 | Meta tags, schema, sitemap |
| 4. Redirect setup | Tuần 4 | 301 redirects từ old URLs |
| 5. Launch + Monitor | Tuần 5+ | Deploy, monitor GSC |

### Cấu hình redirect

```javascript
// next.config.js
const nextConfig = {
  async redirects() {
    return [
      // SPA dùng hash routing, chuyển sang clean URLs
      {
        source: '/#/blog/:slug',
        destination: '/blog/:slug',
        permanent: true,
      },
      {
        source: '/#/category/:cat',
        destination: '/category/:cat',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      // Backward compatibility
      {
        source: '/post/:id',
        destination: '/blog/:id',
      },
    ];
  },
};

module.exports = nextConfig;
```

### Blog page sau migration

```javascript
// pages/blog/[slug].js
import { serialize } from 'next-mdx-remote/serialize';

export async function getStaticPaths() {
  const posts = await getAllPosts();
  return {
    paths: posts.map((post) => ({ params: { slug: post.slug } })),
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return { notFound: true };
  }

  const mdxSource = await serialize(post.content);

  return {
    props: {
      post: {
        ...post,
        content: mdxSource,
      },
    },
    revalidate: 86400, // 24 giờ
  };
}

export default function BlogPost({ post }) {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    image: post.coverImage,
  };

  return (
    <>
      <SEOHead
        title={post.title}
        description={post.excerpt}
        canonical={`https://example.com/blog/${post.slug}`}
        ogImage={post.coverImage}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <article>
        <h1>{post.title}</h1>
        <MDXRemote {...post.content} />
      </article>
    </>
  );
}
```

### Kết quả sau 6 tháng

| Metric | Trước migration | Sau 3 tháng | Sau 6 tháng |
|---|---|---|---|
| Indexed pages | 20/150 | 120/150 | 148/150 |
| Organic sessions/tháng | 500 | 2,800 | 8,500 |
| Avg. position | 42 | 18 | 11 |
| Keywords ranking | 35 | 280 | 650 |
| Organic traffic share | 15% | 45% | 72% |

**Key takeaway**: Chuyển từ SPA sang SSR/SSG không chỉ giúp Google index nhiều trang hơn, mà content quality score cũng tăng vì Google có thể "đọc" full content ngay lập tức thay vì chờ JS render.

---

## 5. SEO cho Developer — Career Implications

### Tại sao developer cần biết SEO

| Lý do | Chi tiết |
|---|---|
| Code trực tiếp ảnh hưởng SEO | Rendering strategy, meta tags, performance đều do developer quyết định |
| Tăng giá trị cá nhân | Developer hiểu SEO = hiếm, được trả cao hơn |
| Startup advantage | Founder kỹ thuật biết SEO tiết kiệm chi phí thuê agency |
| Interview differentiator | Hỏi về SSR, performance, structured data = câu hỏi phổ biến |

### Skill tree cho developer muốn giỏi SEO

```
Level 1: Basics
├── HTML meta tags
├── Semantic HTML
├── Image optimization
└── robots.txt & sitemap.xml

Level 2: Technical
├── SSR vs CSR vs SSG
├── Core Web Vitals optimization
├── Canonical & hreflang
└── Structured data (JSON-LD)

Level 3: Advanced
├── Crawl budget optimization
├── Log file analysis
├── JavaScript SEO
└── International SEO

Level 4: Strategy
├── Keyword research
├── Content architecture
├── SEO automation (CI/CD)
└── GSC API & data analysis
```

---

## 6. Tools và Resources cho Continuous Learning

### Free Tools

| Tool | Mục đích | Link |
|---|---|---|
| Google Search Console | Monitor search performance | `search.google.com/search-console` |
| Google PageSpeed Insights | Performance + Core Web Vitals | `pagespeed.web.dev` |
| Rich Results Test | Validate structured data | `search.google.com/test/rich-results` |
| Lighthouse | Comprehensive audit | Built into Chrome DevTools |
| Schema.org Markup Validator | Validate JSON-LD | `validator.schema.org` |
| Mobile-Friendly Test | Mobile usability | `search.google.com/test/mobile-friendly` |

### Paid Tools (có free tier)

| Tool | Mục đích | Free tier |
|---|---|---|
| Ahrefs Webmaster Tools | Backlink analysis | Free cho verified sites |
| Screaming Frog | Technical crawl audit | Free cho < 500 URLs |
| Semrush | Keyword research | 10 queries/ngày |
| Ubersuggest | Keyword ideas | 3 searches/ngày |

### Learning Resources

| Resource | Type | Ghi chú |
|---|---|---|
| Google Search Central Blog | Official updates | Primary source cho algorithm updates |
| web.dev | Google tutorials | Technical SEO + performance |
| Ahrefs Blog/YouTube | Comprehensive guides | Practical, data-driven |
| MDN Web Docs | HTML/meta reference | Technical accuracy |
| Next.js Docs - SEO | Framework-specific | `nextjs.org/learn/seo` |

### Node.js packages hữu ích cho SEO automation

```json
{
  "dependencies": {
    "cheerio": "^1.0.0",
    "next-sitemap": "^4.2.0",
    "next-seo": "^6.4.0",
    "schema-dts": "^1.1.0",
    "googleapis": "^130.0.0"
  },
  "devDependencies": {
    "@lhci/cli": "^0.13.0",
    "broken-link-checker": "^0.7.8",
    "gray-matter": "^4.0.3",
    "xmllint": "^0.1.0"
  }
}
```

---

## 7. Lỗi thường gặp

### Lỗi 1: Audit một lần rồi quên

SEO audit không phải one-time task. Website thay đổi liên tục, Google cập nhật algorithm thường xuyên. Nên chạy audit ít nhất hàng tháng, và tích hợp automated checks vào CI/CD.

### Lỗi 2: Tập trung vào new content mà quên optimize existing

80% effort nên dành cho optimize 20% trang hiện có đang gần top 10. Đẩy trang từ position 11 lên position 5 hiệu quả hơn nhiều so với viết bài mới chưa rank.

### Lỗi 3: Copy chiến lược SEO của người khác

Mỗi website có bối cảnh khác nhau: domain authority, competition, niche. Chiến lược SEO phải dựa trên audit data của chính bạn, không phải "best practices" chung chung.

### Lỗi 4: Bỏ qua redirect khi migration

Migrate website mà không setup 301 redirects sẽ mất toàn bộ link equity và ranking đã xây dựng. Mỗi old URL phải có 301 tương ứng đến new URL.

### Lỗi 5: Kỳ vọng kết quả nhanh

SEO là long game. Kỳ vọng thực tế: 3-6 tháng để thấy kết quả đầu tiên, 6-12 tháng để đạt sustainable traffic. Nếu cần traffic ngay, kết hợp SEO với paid channels.

---

## Câu hỏi phỏng vấn

### Câu 1: Khi migrate website từ SPA sang SSR, những bước SEO nào là bắt buộc?

**Trả lời**: (1) Map tất cả old URLs sang new URLs và setup 301 redirects, (2) Giữ nguyên URL structure nếu có thể, (3) Verify tất cả meta tags, canonical tags render đúng phía server, (4) Submit new sitemap.xml lên Google Search Console, (5) Monitor index coverage trong GSC hàng ngày trong 2-4 tuần đầu, (6) Check Core Web Vitals không bị regression, (7) Validate structured data vẫn hoạt động. Quan trọng nhất là redirect mapping — mất 1 URL có backlinks = mất link equity vĩnh viễn.

### Câu 2: SEO roadmap cho website mới nên ưu tiên gì trong 3 tháng đầu?

**Trả lời**: Tháng 1: Technical foundation — HTTPS, mobile-friendly, Core Web Vitals, robots.txt, sitemap.xml, GSC setup. Tháng 2: On-page basics — keyword research, title/meta optimization cho core pages, heading structure, internal linking strategy. Tháng 3: Content — publish 10-15 quality articles targeting long-tail keywords ít competition. Không nên tập trung vào link building trong 3 tháng đầu vì chưa có content đáng link đến.

### Câu 3: Làm sao đo lường ROI của SEO?

**Trả lời**: Track metrics theo thứ tự: (1) **Technical**: Index coverage, crawl errors (GSC), Lighthouse scores, (2) **Visibility**: Impressions, average position cho target keywords (GSC), (3) **Traffic**: Organic sessions, new users from organic (GA4), (4) **Engagement**: Bounce rate, pages/session, avg. session duration cho organic traffic, (5) **Conversion**: Goal completions, revenue from organic channel. So sánh tháng-over-tháng và year-over-year. ROI = (Revenue from organic - SEO investment) / SEO investment.

### Câu 4: CSR, SSR, SSG khác nhau thế nào về SEO?

**Trả lời**: **CSR** (Client-Side Rendering): HTML trống, JS render content phía client. Google có thể render nhưng không reliable, delay index, không thấy meta tags dynamic. Worst cho SEO. **SSR** (Server-Side Rendering): Server render full HTML mỗi request. Google thấy content ngay. Tốt cho SEO, nhưng TTFB cao hơn. **SSG** (Static Site Generation): HTML được generate lúc build. Tốt nhất cho SEO: fast TTFB, full content sẵn, cacheable. Best cho content không thay đổi thường xuyên. **ISR** (Incremental Static Regeneration): Hybrid SSG + SSR, revalidate theo thời gian. Best of both worlds cho dynamic content.

### Câu 5: Nếu organic traffic tụt đột ngột 50%, bạn sẽ debug thế nào?

**Trả lời**: (1) Check GSC Manual Actions — có bị Google penalty không, (2) Check GSC Index Coverage — số trang indexed có giảm không, (3) Check deployment history — có code change nào gần đây ảnh hưởng SEO không (thêm noindex, robots block, broken redirects), (4) Check Google Algorithm Update calendar — có core update gần đây không, (5) So sánh GSC data: pages và queries nào mất traffic cụ thể, (6) Check competitors — họ cũng tụt hay chỉ mình bạn, (7) Check technical: site vẫn accessible, SSL valid, server response time bình thường. Thường thì nguyên nhân nằm ở code deployment hoặc algorithm update.
