---
sidebar_position: 4
title: "4. JavaScript SEO"
---

# JavaScript SEO

## Vấn đề cốt lõi

JavaScript frameworks hiện đại (React, Vue, Angular) render nội dung phía client. Khi Googlebot truy cập trang, nó nhận được một file HTML gần như trống rỗng:

```html
<!-- Điều Googlebot thấy ban đầu từ một React SPA -->
<!DOCTYPE html>
<html>
<head>
  <title>My App</title>
</head>
<body>
  <div id="root"></div>
  <script src="/bundle.js"></script>
</body>
</html>
```

Không có nội dung nào trong `<body>` để index. Googlebot phải tải và chạy JavaScript để thấy nội dung thật sự. Đây chính là thách thức lớn nhất của JavaScript SEO.

## CSR vs SSR vs SSG vs ISR

### Bảng so sánh chi tiết

| Tiêu chí | CSR | SSR | SSG | ISR |
|----------|-----|-----|-----|-----|
| **Render ở đâu** | Browser (client) | Server (mỗi request) | Build time | Build time + revalidate |
| **TTFB** | Nhanh (HTML nhỏ) | Chậm hơn (server render) | Rất nhanh (CDN) | Rất nhanh (CDN) |
| **FCP/LCP** | Chậm (đợi JS) | Nhanh (HTML có nội dung) | Rất nhanh | Rất nhanh |
| **SEO** | Kém | Tốt | Rất tốt | Rất tốt |
| **Nội dung động** | Real-time | Real-time | Phải rebuild | Tự động cập nhật |
| **Server cost** | Thấp (static hosting) | Cao (mỗi request render) | Rất thấp (CDN) | Thấp (CDN + rebuild) |
| **Phù hợp** | Dashboard, admin panel | E-commerce, news | Blog, docs, landing page | Blog, catalog lớn |

### CSR — Client-Side Rendering

```
Browser request → Server trả HTML trống → Browser tải JS → JS render nội dung
```

```javascript
// Ví dụ: React SPA thuần (Create React App)
// Server chỉ phục vụ index.html + bundle.js
// Toàn bộ nội dung render bằng JavaScript phía client

import React, { useEffect, useState } from 'react';

function ProductPage() {
  const [product, setProduct] = useState(null);

  useEffect(() => {
    // Nội dung chỉ xuất hiện SAU KHI JS chạy xong
    fetch('/api/products/1')
      .then(res => res.json())
      .then(data => setProduct(data));
  }, []);

  if (!product) return <div>Loading...</div>;

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
    </div>
  );
}
```

**Vấn đề SEO**: Googlebot phải chạy JS để thấy nội dung. Nếu JS lỗi, fetch API thất bại, hoặc render quá chậm — Googlebot chỉ thấy "Loading..." và index trang trống.

### SSR — Server-Side Rendering

```
Browser request → Server render HTML đầy đủ → Browser hiển thị ngay → JS hydrate
```

```javascript
// Next.js SSR với getServerSideProps
// pages/products/[id].js

export async function getServerSideProps(context) {
  const { id } = context.params;
  const res = await fetch(`https://api.example.com/products/${id}`);
  const product = await res.json();

  if (!product) {
    return { notFound: true };
  }

  return {
    props: { product }, // Truyền vào component dưới dạng props
  };
}

export default function ProductPage({ product }) {
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <span>Giá: {product.price.toLocaleString('vi-VN')} VND</span>
    </div>
  );
}
```

**Ưu điểm SEO**: HTML trả về đã có đầy đủ nội dung, Googlebot không cần chạy JS.

### SSG — Static Site Generation

```
Build time: Fetch data → Render HTML → Deploy lên CDN
User request → CDN trả HTML tĩnh (cực nhanh)
```

```javascript
// Next.js SSG với getStaticProps + getStaticPaths
// pages/blog/[slug].js

export async function getStaticPaths() {
  const res = await fetch('https://api.example.com/posts');
  const posts = await res.json();

  const paths = posts.map((post) => ({
    params: { slug: post.slug },
  }));

  return {
    paths,
    fallback: 'blocking', // Render on-demand cho path mới
  };
}

export async function getStaticProps({ params }) {
  const res = await fetch(`https://api.example.com/posts/${params.slug}`);
  const post = await res.json();

  return {
    props: { post },
    revalidate: 3600, // ISR: regenerate mỗi 1 giờ
  };
}

export default function BlogPost({ post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
```

### ISR — Incremental Static Regeneration

ISR kết hợp tốc độ của SSG với khả năng cập nhật của SSR:

```javascript
// Next.js ISR — trang tĩnh tự động cập nhật
export async function getStaticProps() {
  const res = await fetch('https://api.example.com/products');
  const products = await res.json();

  return {
    props: { products },
    revalidate: 60, // Regenerate trang mỗi 60 giây
  };
}

// Next.js 13+ App Router: revalidate trong route
// app/products/page.js
export const revalidate = 60; // ISR: 60 giây

export default async function ProductsPage() {
  const res = await fetch('https://api.example.com/products', {
    next: { revalidate: 60 },
  });
  const products = await res.json();

  return (
    <div>
      {products.map((p) => (
        <div key={p.id}>{p.name}</div>
      ))}
    </div>
  );
}
```

## Google render JavaScript như thế nào?

### Two-Wave Indexing

```
Wave 1 (Nhanh — vài giây):
  Googlebot tải HTML → Parse HTML → Index nội dung có sẵn trong HTML
  → Discover links trong HTML

Wave 2 (Chậm — vài giờ đến vài ngày):
  Googlebot chạy JavaScript → Render trang → Index nội dung JS-rendered
  → Discover links trong JS-rendered content
```

**Vấn đề**: Giữa Wave 1 và Wave 2 có thể mất từ vài giây đến vài ngày. Nếu nội dung quan trọng chỉ xuất hiện sau khi JS render (Wave 2), nó sẽ bị delay trong index.

### Những gì Googlebot render được và không được

| Render được | Không render / rủi ro |
|------------|----------------------|
| React, Vue, Angular (hiện đại) | IntersectionObserver lazy loading (nội dung chỉ load khi scroll) |
| Fetch API, XMLHttpRequest | WebSocket real-time data |
| CSS Grid, Flexbox | Service Worker cache |
| `<canvas>` (không index nội dung bên trong) | IndexedDB, localStorage |
| ES6+ syntax | Trang cần đăng nhập (behind auth) |
| Dynamic import | Request bị timeout (trên 5 giây) |

## Vấn đề SEO của SPA

### Single Page Application — Những cạm bẫy

**1. Meta tags không cập nhật khi chuyển trang:**

```javascript
// SAI: SPA chuyển route nhưng title/meta không đổi
// User vào /about nhưng title vẫn là "Home - My App"

// ĐÚNG: Cập nhật meta tags khi route thay đổi
// React Helmet (react-helmet-async)
import { Helmet } from 'react-helmet-async';

function AboutPage() {
  return (
    <>
      <Helmet>
        <title>Về chúng tôi - My App</title>
        <meta name="description" content="Tìm hiểu về đội ngũ My App" />
        <link rel="canonical" href="https://example.com/about" />
      </Helmet>
      <h1>Về chúng tôi</h1>
    </>
  );
}
```

**2. URL không thay đổi hoặc dùng hash routing:**

```javascript
// SAI: Hash routing — Google coi tất cả là cùng 1 URL
// example.com/#/about
// example.com/#/contact
// Google chỉ index example.com/

// ĐÚNG: HTML5 History API (browser routing)
// example.com/about
// example.com/contact
// Google index mỗi URL riêng biệt

import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter> {/* Dùng BrowserRouter, KHÔNG dùng HashRouter */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
```

**3. Nội dung tải bằng infinite scroll:**

```javascript
// SAI: Nội dung chỉ xuất hiện khi user scroll
// Googlebot không scroll — nội dung dưới cùng không được index

// ĐÚNG: Dùng pagination với URL riêng cho mỗi trang
// /products?page=1, /products?page=2, ...
// Hoặc dùng "Load More" button với nội dung có sẵn trong HTML
```

## Solutions: Framework có hỗ trợ SEO

### Next.js — App Router (khuyến nghị)

```javascript
// app/products/[id]/page.js
import { Metadata } from 'next';

// Dynamic metadata cho SEO
export async function generateMetadata({ params }) {
  const product = await getProduct(params.id);

  return {
    title: product.name + ' | My Store',
    description: product.description.substring(0, 160),
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.image, width: 1200, height: 630 }],
    },
    alternates: {
      canonical: `https://example.com/products/${params.id}`,
    },
  };
}

// Structured data
function ProductJsonLd({ product }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'VND',
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// Server Component — render trên server, HTML có nội dung sẵn
export default async function ProductPage({ params }) {
  const product = await getProduct(params.id);

  return (
    <div>
      <ProductJsonLd product={product} />
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <span>{product.price.toLocaleString('vi-VN')} VND</span>
    </div>
  );
}
```

### Next.js — Static Generation cho nhiều trang

```javascript
// app/blog/[slug]/page.js

// Generate static pages tại build time
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

// Sitemap tự động
// app/sitemap.js
export default async function sitemap() {
  const posts = await getAllPosts();
  const products = await getAllProducts();

  const blogUrls = posts.map((post) => ({
    url: `https://example.com/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const productUrls = products.map((product) => ({
    url: `https://example.com/products/${product.id}`,
    lastModified: product.updatedAt,
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  return [
    { url: 'https://example.com', lastModified: new Date(), priority: 1.0 },
    ...blogUrls,
    ...productUrls,
  ];
}
```

## Dynamic Rendering

### Dynamic rendering là gì?

Dynamic rendering là kỹ thuật trả về nội dung khác nhau dựa trên User-Agent: CSR cho người dùng thật, pre-rendered HTML cho bot.

```
User thường → Server trả SPA (CSR)
Googlebot   → Server trả pre-rendered HTML (đầy đủ nội dung)
```

**Lưu ý**: Google chấp nhận dynamic rendering như giải pháp tạm thời (workaround), nhưng khuyến nghị chuyển sang SSR/SSG lâu dài.

### Cấu hình với Rendertron (Google)

```javascript
// Express middleware cho dynamic rendering
const express = require('express');
const app = express();

const BOT_USER_AGENTS = [
  'googlebot',
  'bingbot',
  'yandexbot',
  'duckduckbot',
  'slurp',       // Yahoo
  'baiduspider',
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
];

function isBot(userAgent) {
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot));
}

app.use(async (req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';

  if (isBot(userAgent)) {
    // Bot: trả pre-rendered HTML từ Rendertron
    try {
      const rendertronUrl = `https://render-tron.appspot.com/render/${req.protocol}://${req.hostname}${req.originalUrl}`;
      const response = await fetch(rendertronUrl);
      const html = await response.text();
      res.send(html);
    } catch (error) {
      // Fallback: trả SPA bình thường nếu Rendertron lỗi
      next();
    }
  } else {
    // User thường: trả SPA
    next();
  }
});
```

## Prerendering Strategies

### Prerender tại build time

```javascript
// react-snap: prerender React SPA thành static HTML
// package.json
{
  "scripts": {
    "build": "react-scripts build",
    "postbuild": "react-snap"
  },
  "reactSnap": {
    "source": "build",
    "minifyHtml": { "collapseWhitespace": false },
    "puppeteerArgs": ["--no-sandbox"],
    "include": ["/", "/about", "/products", "/blog"],
    "skipThirdPartyRequests": true
  }
}
```

### Docusaurus — SSG mặc định (lý tưởng cho SEO)

```javascript
// docusaurus.config.ts
const config = {
  title: 'My Site',
  url: 'https://example.com',
  baseUrl: '/',

  // SEO metadata mặc định
  themeConfig: {
    metadata: [
      { name: 'keywords', content: 'seo, web development, javascript' },
      { name: 'robots', content: 'index, follow' },
    ],
  },

  // Sitemap tự động
  plugins: [
    [
      '@docusaurus/plugin-sitemap',
      {
        changefreq: 'weekly',
        priority: 0.5,
        filename: 'sitemap.xml',
      },
    ],
  ],
};
```

## Kiểm tra JavaScript SEO

### Xem trang như Googlebot thấy

```bash
# Dùng Google Search Console: URL Inspection tool
# Nhập URL → "Test Live URL" → "View Tested Page" → "Screenshot"

# Hoặc dùng Google Rich Results Test
# https://search.google.com/test/rich-results
```

### Kiểm tra meta tags render đúng

```javascript
// Script kiểm tra meta tags sau khi JS render
async function checkRenderedMeta(url) {
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle0' });

  const meta = await page.evaluate(() => ({
    title: document.title,
    description: document
      .querySelector('meta[name="description"]')
      ?.getAttribute('content'),
    canonical: document
      .querySelector('link[rel="canonical"]')
      ?.getAttribute('href'),
    ogTitle: document
      .querySelector('meta[property="og:title"]')
      ?.getAttribute('content'),
    robots: document
      .querySelector('meta[name="robots"]')
      ?.getAttribute('content'),
  }));

  console.log('Rendered Meta Tags:', meta);
  await browser.close();
}
```

## Lỗi thường gặp

1. **Dùng CSR cho landing page/blog** — Nội dung marketing cần SEO nhưng render bằng JS, Googlebot thấy trang trống hoặc "Loading..."
2. **Hash routing (`/#/page`)** — Google không phân biệt hash fragments, tất cả URL đều được coi là 1 trang
3. **Không update meta tags khi chuyển route** — SPA chuyển từ Home sang About nhưng title/description vẫn là của Home
4. **Lazy load nội dung chính** — Nội dung quan trọng nằm sau IntersectionObserver, Googlebot không scroll nên không thấy
5. **API call timeout** — Googlebot chờ tối đa 5 giây, nếu API chậm hơn thì nội dung không được render
6. **Quên `rel="canonical"` cho SPA** — Cùng nội dung nhưng có nhiều URL variant (query params, fragments), gây duplicate content
7. **Cloaking (trả nội dung khác cho bot)** — Dynamic rendering chấp nhận được, nhưng cố tình trả nội dung hoàn toàn khác cho Googlebot là vi phạm Google guidelines

## Câu hỏi phỏng vấn

### Câu 1: So sánh CSR, SSR, SSG, ISR về SEO. Khi nào dùng cái nào?

**Trả lời:**
- **CSR**: Render phía client, SEO kém vì Googlebot phải chạy JS. Dùng cho: admin panel, dashboard, app behind auth
- **SSR**: Server render HTML mỗi request, SEO tốt, nội dung luôn mới. Dùng cho: e-commerce (giá thay đổi), news feed, trang cần personalization
- **SSG**: Render tại build time, SEO rất tốt, tốc độ cực nhanh (CDN). Dùng cho: blog, docs, landing page, marketing site
- **ISR**: SSG + tự động regenerate, SEO rất tốt, nội dung cập nhật mà không cần rebuild. Dùng cho: catalog sản phẩm lớn, blog có update thường xuyên

### Câu 2: Giải thích Two-Wave Indexing của Google. Tại sao nó gây vấn đề cho SPA?

**Trả lời:**
Google indexing có 2 giai đoạn: Wave 1 — parse HTML thô, index nội dung có sẵn ngay. Wave 2 — chạy JavaScript, render trang, index nội dung JS-generated. Khoảng cách giữa 2 wave có thể từ vài giây đến vài ngày tùy crawl budget. SPA trả về HTML trống, nên Wave 1 không thấy nội dung gì. Phải đợi Wave 2 mới có nội dung để index. Trong thời gian chờ, trang không xuất hiện trong kết quả tìm kiếm hoặc xuất hiện với snippet rỗng.

### Câu 3: Trang React SPA hiện tại không được Google index. Bạn sẽ debug và fix như thế nào?

**Trả lời:**
Debug: (1) Dùng Google Search Console URL Inspection để xem Google render trang thế nào; (2) Kiểm tra View Source (Ctrl+U) — nếu HTML trống thì đúng là vấn đề CSR; (3) Kiểm tra Console errors trong Inspect tool; (4) Kiểm tra robots.txt có chặn JS/CSS files không. Fix: (1) Ngắn hạn: dùng dynamic rendering (prerender cho bot); (2) Dài hạn: chuyển sang Next.js SSR/SSG; (3) Đảm bảo meta tags được render đúng cho mỗi route; (4) Chuyển từ HashRouter sang BrowserRouter; (5) Submit URL lại qua Search Console sau khi fix.

### Câu 4: Dynamic rendering có vi phạm Google guidelines không?

**Trả lời:**
Không, Google chính thức chấp nhận dynamic rendering như một giải pháp hợp lệ. Điều kiện: nội dung trả về cho bot phải giống nội dung user thấy (chỉ khác về cách render, không khác về nội dung). Nếu cố tình trả nội dung khác cho bot (ví dụ nhồi keyword chỉ cho Googlebot thấy) — đó là cloaking và bị phạt. Google khuyến nghị dùng dynamic rendering như workaround tạm thời, và chuyển sang SSR/SSG lâu dài.

### Câu 5: Next.js App Router vs Pages Router — cái nào tốt hơn cho SEO?

**Trả lời:**
Cả hai đều hỗ trợ SSR/SSG tốt cho SEO. App Router (từ Next.js 13+) có lợi thế: (1) Server Components mặc định — render trên server không cần cấu hình thêm; (2) `generateMetadata` function cho dynamic SEO metadata; (3) Streaming SSR — gửi HTML từng phần, cải thiện TTFB; (4) Built-in `sitemap.js` và `robots.js`; (5) Parallel Routes và Intercepting Routes giúp UX tốt hơn mà vẫn SEO-friendly. Pages Router vẫn hoạt động tốt nhưng App Router là hướng đi tương lai và có nhiều tính năng SEO built-in hơn.
