---
sidebar_position: 4
title: "4. Tự động hóa SEO"
---

# Tự động hóa SEO — Monitoring, Scripting và CI/CD

SEO không phải "làm xong rồi quên" — mỗi lần deploy code, thêm trang hay đổi URL đều có thể phá hỏng SEO mà bạn không hay biết cho đến khi traffic tụt. Bài này hướng dẫn developer tự động hóa các kiểm tra SEO bằng script, tích hợp vào CI/CD và thiết lập monitoring, biến SEO thành một phần của quy trình phát triển.

:::note[Ghi nhớ nhanh]

- ⭐ **Biến SEO check thành một phần CI/CD** — chạy tự động mỗi PR (Lighthouse CI + script) để bắt lỗi ngay thay vì audit thủ công hàng tháng.
- ⭐ **`Lighthouse CI` với assertions** — đặt `error` (chặn PR) cho `meta-description`, `document-title`, `canonical`, `image-alt`, `categories:seo >= 0.9`; `warn` cho phần còn lại.
- **Tự động hóa script Node.js** — kiểm tra meta tag (title/description/H1/OG/alt), tìm broken link, validate `sitemap.xml` và `robots.txt`.
- **Generate `sitemap` tự động trong build** — sitemap viết tay nhanh outdated, khiến Google bỏ sót trang mới và `lastmod` sai.
- **Monitor `Google Search Console API`** — lấy clicks/impressions/CTR/position định kỳ, cảnh báo khi trang tụt traffic để xử lý sớm.

:::

## Mục lục

- [Giới thiệu](#giới-thiệu)
- [1. SEO Monitoring với Node.js Scripts](#1-seo-monitoring-với-nodejs-scripts)
- [2. Automated Sitemap Generation](#2-automated-sitemap-generation)
- [3. Broken Link Checking Automation](#3-broken-link-checking-automation)
- [4. Google Search Console API Integration](#4-google-search-console-api-integration)
- [5. Lighthouse CI trong GitHub Actions](#5-lighthouse-ci-trong-github-actions)
- [6. Automated Meta Tag Validation](#6-automated-meta-tag-validation)
- [7. Lỗi thường gặp](#7-lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Giới thiệu

SEO không phải là "setup xong rồi quên". Website thay đổi liên tục — deploy code mới, thêm trang, sửa URL — và mỗi thay đổi đều có thể phá hỏng SEO mà bạn không biết cho đến khi traffic tụt. Giải pháp là tự động hóa: viết scripts kiểm tra SEO, tích hợp vào CI/CD, và setup monitoring tự động.

Bài này dành cho developer muốn biến SEO checks thành phần tự động của development workflow, thay vì dựa vào manual audit.

---

## 1. SEO Monitoring với Node.js Scripts

### Script kiểm tra meta tags

```javascript
// scripts/seo-check-meta.js
const cheerio = require('cheerio');

const SEO_RULES = {
  title: { minLength: 30, maxLength: 60 },
  description: { minLength: 120, maxLength: 160 },
};

async function checkPageSEO(url) {
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);

  const issues = [];

  // Kiểm tra title
  const title = $('title').text().trim();
  if (!title) {
    issues.push({ severity: 'critical', message: 'Missing title tag' });
  } else if (title.length < SEO_RULES.title.minLength) {
    issues.push({
      severity: 'warning',
      message: `Title too short: ${title.length} chars (min ${SEO_RULES.title.minLength})`,
      value: title,
    });
  } else if (title.length > SEO_RULES.title.maxLength) {
    issues.push({
      severity: 'warning',
      message: `Title too long: ${title.length} chars (max ${SEO_RULES.title.maxLength})`,
      value: title,
    });
  }

  // Kiểm tra meta description
  const description = $('meta[name="description"]').attr('content') || '';
  if (!description) {
    issues.push({ severity: 'critical', message: 'Missing meta description' });
  } else if (description.length < SEO_RULES.description.minLength) {
    issues.push({
      severity: 'warning',
      message: `Description too short: ${description.length} chars`,
      value: description,
    });
  } else if (description.length > SEO_RULES.description.maxLength) {
    issues.push({
      severity: 'warning',
      message: `Description too long: ${description.length} chars`,
      value: description,
    });
  }

  // Kiểm tra canonical
  const canonical = $('link[rel="canonical"]').attr('href');
  if (!canonical) {
    issues.push({ severity: 'high', message: 'Missing canonical tag' });
  }

  // Kiểm tra H1
  const h1Count = $('h1').length;
  if (h1Count === 0) {
    issues.push({ severity: 'high', message: 'Missing H1 tag' });
  } else if (h1Count > 1) {
    issues.push({
      severity: 'warning',
      message: `Multiple H1 tags found: ${h1Count}`,
    });
  }

  // Kiểm tra Open Graph
  const ogTitle = $('meta[property="og:title"]').attr('content');
  const ogDescription = $('meta[property="og:description"]').attr('content');
  const ogImage = $('meta[property="og:image"]').attr('content');

  if (!ogTitle) issues.push({ severity: 'medium', message: 'Missing og:title' });
  if (!ogDescription) issues.push({ severity: 'medium', message: 'Missing og:description' });
  if (!ogImage) issues.push({ severity: 'medium', message: 'Missing og:image' });

  // Kiểm tra images thiếu alt
  const imagesWithoutAlt = $('img:not([alt]), img[alt=""]').length;
  if (imagesWithoutAlt > 0) {
    issues.push({
      severity: 'high',
      message: `${imagesWithoutAlt} images missing alt text`,
    });
  }

  return { url, issues };
}

// Chạy kiểm tra nhiều trang
async function auditSite(urls) {
  console.log('Starting SEO audit...\n');

  for (const url of urls) {
    const result = await checkPageSEO(url);
    const criticalCount = result.issues.filter(
      (i) => i.severity === 'critical'
    ).length;
    const highCount = result.issues.filter(
      (i) => i.severity === 'high'
    ).length;

    console.log(`\n${result.url}`);
    console.log(`  Critical: ${criticalCount} | High: ${highCount} | Total: ${result.issues.length}`);

    for (const issue of result.issues) {
      const icon =
        issue.severity === 'critical'
          ? '[CRIT]'
          : issue.severity === 'high'
            ? '[HIGH]'
            : '[WARN]';
      console.log(`  ${icon} ${issue.message}`);
    }
  }
}

auditSite([
  'https://example.com',
  'https://example.com/san-pham',
  'https://example.com/lien-he',
]);
```

---

## 2. Automated Sitemap Generation

### Sitemap generator cho Docusaurus/Static sites

```javascript
// scripts/generate-sitemap.js
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const SITE_URL = 'https://example.com';
const BUILD_DIR = path.resolve(__dirname, '../build');

function generateSitemap() {
  // Tìm tất cả HTML files trong build directory
  const htmlFiles = glob.sync('**/*.html', { cwd: BUILD_DIR });

  const urls = htmlFiles
    .map((file) => {
      const urlPath = file
        .replace(/index\.html$/, '')
        .replace(/\.html$/, '');

      // Loại bỏ 404 và các trang không cần index
      if (urlPath.includes('404') || urlPath.includes('search')) {
        return null;
      }

      const fullUrl = `${SITE_URL}/${urlPath}`;
      const filePath = path.join(BUILD_DIR, file);
      const stats = fs.statSync(filePath);

      return {
        loc: fullUrl,
        lastmod: stats.mtime.toISOString().split('T')[0],
        changefreq: urlPath === '' ? 'daily' : 'weekly',
        priority: urlPath === '' ? '1.0' : urlPath.split('/').length <= 2 ? '0.8' : '0.6',
      };
    })
    .filter(Boolean);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  const outputPath = path.join(BUILD_DIR, 'sitemap.xml');
  fs.writeFileSync(outputPath, xml);
  console.log(`Sitemap generated: ${outputPath}`);
  console.log(`Total URLs: ${urls.length}`);

  return urls;
}

generateSitemap();
```

### Sitemap cho dynamic sites (Next.js API route)

```javascript
// pages/api/sitemap.js (hoặc app/sitemap.xml/route.js)
export default async function handler(req, res) {
  const baseUrl = 'https://example.com';

  // Lấy danh sách trang từ database/CMS
  const products = await fetchAllProducts();
  const categories = await fetchAllCategories();
  const blogPosts = await fetchAllBlogPosts();

  const staticPages = [
    { url: '/', changefreq: 'daily', priority: '1.0' },
    { url: '/gioi-thieu', changefreq: 'monthly', priority: '0.5' },
    { url: '/lien-he', changefreq: 'monthly', priority: '0.5' },
  ];

  const productUrls = products.map((p) => ({
    url: `/san-pham/${p.slug}`,
    changefreq: 'weekly',
    priority: '0.8',
    lastmod: p.updatedAt,
  }));

  const categoryUrls = categories.map((c) => ({
    url: `/danh-muc/${c.slug}`,
    changefreq: 'daily',
    priority: '0.9',
  }));

  const blogUrls = blogPosts.map((post) => ({
    url: `/blog/${post.slug}`,
    changefreq: 'monthly',
    priority: '0.6',
    lastmod: post.updatedAt,
  }));

  const allUrls = [...staticPages, ...productUrls, ...categoryUrls, ...blogUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    ${page.lastmod ? `<lastmod>${new Date(page.lastmod).toISOString().split('T')[0]}</lastmod>` : ''}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate');
  res.status(200).send(xml);
}
```

---

## 3. Broken Link Checking Automation

### Script tìm broken links

```javascript
// scripts/check-broken-links.js
const cheerio = require('cheerio');

const visited = new Set();
const brokenLinks = [];
const MAX_DEPTH = 3;

async function checkUrl(url, referrer = null) {
  if (visited.has(url)) return;
  visited.add(url);

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      brokenLinks.push({
        url,
        status: response.status,
        referrer,
      });
    }
  } catch (error) {
    brokenLinks.push({
      url,
      status: 'ERROR',
      error: error.message,
      referrer,
    });
  }
}

async function crawlPage(url, baseUrl, depth = 0) {
  if (depth > MAX_DEPTH) return;
  if (visited.has(`crawl:${url}`)) return;
  visited.add(`crawl:${url}`);

  try {
    const response = await fetch(url);
    if (!response.ok) return;

    const html = await response.text();
    const $ = cheerio.load(html);

    const links = [];
    $('a[href]').each((_, el) => {
      let href = $(el).attr('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }
      // Resolve relative URLs
      if (href.startsWith('/')) {
        href = `${baseUrl}${href}`;
      }
      links.push(href);
    });

    // Kiểm tra tất cả links trên trang
    const checkPromises = links.map((link) => checkUrl(link, url));
    await Promise.allSettled(checkPromises);

    // Crawl internal links sâu hơn
    const internalLinks = links.filter((link) => link.startsWith(baseUrl));
    for (const link of internalLinks) {
      await crawlPage(link, baseUrl, depth + 1);
    }
  } catch (error) {
    console.error(`Error crawling ${url}: ${error.message}`);
  }
}

async function main() {
  const baseUrl = 'https://example.com';
  console.log(`Starting broken link check for ${baseUrl}...\n`);

  await crawlPage(baseUrl, baseUrl);

  if (brokenLinks.length > 0) {
    console.log(`\nFound ${brokenLinks.length} broken links:\n`);
    console.table(brokenLinks);
    process.exit(1); // Fail CI nếu có broken links
  } else {
    console.log('\nNo broken links found!');
  }
}

main();
```

---

## 4. Google Search Console API Integration

### Setup GSC API access

```bash
# 1. Enable Search Console API trong Google Cloud Console
# 2. Tạo Service Account và download JSON key
# 3. Thêm service account email vào GSC property as user

npm install googleapis
```

### Script lấy performance data

```javascript
// scripts/gsc-report.js
const { google } = require('googleapis');
const path = require('path');

const KEY_FILE = path.resolve(__dirname, '../credentials/gsc-service-account.json');
const SITE_URL = 'https://example.com';

async function getSearchConsoleData() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });

  const searchconsole = google.searchconsole({ version: 'v1', auth });

  // Lấy performance data 28 ngày gần nhất
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  // Top pages by clicks
  const pagesResponse = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['page'],
      rowLimit: 20,
      dataState: 'final',
    },
  });

  console.log('\n=== Top 20 Pages by Clicks ===\n');
  console.table(
    pagesResponse.data.rows?.map((row) => ({
      page: row.keys[0].replace(SITE_URL, ''),
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: `${(row.ctr * 100).toFixed(1)}%`,
      position: row.position.toFixed(1),
    }))
  );

  // Top queries
  const queriesResponse = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['query'],
      rowLimit: 20,
      dataState: 'final',
    },
  });

  console.log('\n=== Top 20 Queries by Clicks ===\n');
  console.table(
    queriesResponse.data.rows?.map((row) => ({
      query: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: `${(row.ctr * 100).toFixed(1)}%`,
      position: row.position.toFixed(1),
    }))
  );

  // Pages mất traffic (so sánh 2 giai đoạn)
  const prevStartDate = new Date(Date.now() - 56 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
  const prevEndDate = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const prevResponse = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: prevStartDate,
      endDate: prevEndDate,
      dimensions: ['page'],
      rowLimit: 100,
    },
  });

  const currentPages = new Map(
    pagesResponse.data.rows?.map((r) => [r.keys[0], r.clicks]) || []
  );
  const prevPages = new Map(
    prevResponse.data.rows?.map((r) => [r.keys[0], r.clicks]) || []
  );

  const declining = [];
  for (const [page, prevClicks] of prevPages) {
    const currentClicks = currentPages.get(page) || 0;
    const change = currentClicks - prevClicks;
    if (change < -5) {
      declining.push({
        page: page.replace(SITE_URL, ''),
        previousClicks: prevClicks,
        currentClicks,
        change,
      });
    }
  }

  if (declining.length > 0) {
    declining.sort((a, b) => a.change - b.change);
    console.log('\n=== Pages Losing Traffic ===\n');
    console.table(declining.slice(0, 10));
  }
}

getSearchConsoleData().catch(console.error);
```

---

## 5. Lighthouse CI trong GitHub Actions

### Setup Lighthouse CI

```bash
npm install -D @lhci/cli
```

### Cấu hình Lighthouse CI

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/san-pham',
        'http://localhost:3000/blog',
      ],
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'ready on',
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
      },
    },
    assert: {
      assertions: {
        // SEO score tối thiểu 90
        'categories:seo': ['error', { minScore: 0.9 }],
        // Performance score tối thiểu 80
        'categories:performance': ['warn', { minScore: 0.8 }],
        // Accessibility score tối thiểu 90
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        // Best practices
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        // Specific SEO checks
        'meta-description': 'error',
        'document-title': 'error',
        'link-text': 'warn',
        'crawlable-anchors': 'error',
        'is-crawlable': 'error',
        'robots-txt': 'warn',
        'hreflang': 'warn',
        'canonical': 'error',
        'image-alt': 'error',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

### GitHub Actions Workflow

```yaml
# .github/workflows/lighthouse-seo.yml
name: Lighthouse SEO Check

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

      - name: Upload Lighthouse results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: lighthouse-results
          path: .lighthouseci/
          retention-days: 14

      - name: Comment PR with results
        uses: marocchino/sticky-pull-request-comment@v2
        if: github.event_name == 'pull_request'
        with:
          header: lighthouse
          message: |
            ## Lighthouse SEO Report
            Check the [Lighthouse CI results](${{ steps.lhci.outputs.resultsUrl }}) for detailed SEO scores.
```

### Workflow nâng cao: SEO regression test

```yaml
# .github/workflows/seo-regression.yml
name: SEO Regression Test

on:
  pull_request:
    branches: [main]

jobs:
  seo-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Check meta tags
        run: node scripts/seo-check-meta.js

      - name: Check broken links
        run: node scripts/check-broken-links.js

      - name: Validate sitemap
        run: |
          # Kiểm tra sitemap.xml tồn tại và valid
          if [ ! -f build/sitemap.xml ]; then
            echo "ERROR: sitemap.xml not found in build/"
            exit 1
          fi

          # Kiểm tra XML syntax
          xmllint --noout build/sitemap.xml

          # Đếm số URLs
          URL_COUNT=$(grep -c '<loc>' build/sitemap.xml)
          echo "Sitemap contains $URL_COUNT URLs"

          if [ "$URL_COUNT" -lt 1 ]; then
            echo "ERROR: Sitemap is empty"
            exit 1
          fi

      - name: Validate robots.txt
        run: |
          if [ ! -f build/robots.txt ]; then
            echo "ERROR: robots.txt not found"
            exit 1
          fi

          # Kiểm tra sitemap reference trong robots.txt
          if ! grep -q "Sitemap:" build/robots.txt; then
            echo "WARNING: robots.txt does not reference sitemap"
          fi

          echo "robots.txt content:"
          cat build/robots.txt
```

---

## 6. Automated Meta Tag Validation

### Pre-commit hook kiểm tra SEO

```javascript
// scripts/validate-meta-tags.js
// Chạy trong pre-commit hook để validate markdown frontmatter

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const matter = require('gray-matter');

function validateMarkdownSEO(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const { data: frontmatter } = matter(content);
  const issues = [];

  // Kiểm tra title
  if (!frontmatter.title) {
    issues.push('Missing title in frontmatter');
  } else if (frontmatter.title.length > 60) {
    issues.push(`Title too long: ${frontmatter.title.length} chars (max 60)`);
  }

  // Kiểm tra description
  if (!frontmatter.description) {
    issues.push('Missing description in frontmatter');
  } else if (frontmatter.description.length > 160) {
    issues.push(
      `Description too long: ${frontmatter.description.length} chars (max 160)`
    );
  } else if (frontmatter.description.length < 50) {
    issues.push(
      `Description too short: ${frontmatter.description.length} chars (min 50)`
    );
  }

  // Kiểm tra H1 trong content (phải có chính xác 1)
  const h1Matches = content.match(/^# .+$/gm);
  if (!h1Matches || h1Matches.length === 0) {
    issues.push('Missing H1 heading in content');
  } else if (h1Matches.length > 1) {
    issues.push(`Multiple H1 headings found: ${h1Matches.length}`);
  }

  // Kiểm tra images có alt text
  const imgWithoutAlt = content.match(/!\[\]\(/g);
  if (imgWithoutAlt) {
    issues.push(`${imgWithoutAlt.length} images without alt text`);
  }

  return issues;
}

function main() {
  const docsDir = path.resolve(__dirname, '../docs');
  const mdFiles = glob.sync('**/*.md', { cwd: docsDir });

  let hasErrors = false;

  for (const file of mdFiles) {
    const filePath = path.join(docsDir, file);
    const issues = validateMarkdownSEO(filePath);

    if (issues.length > 0) {
      hasErrors = true;
      console.log(`\n${file}:`);
      issues.forEach((issue) => console.log(`  - ${issue}`));
    }
  }

  if (hasErrors) {
    console.log('\nSEO validation failed. Fix issues above before committing.');
    process.exit(1);
  } else {
    console.log('All markdown files pass SEO validation.');
  }
}

main();
```

### Package.json scripts

```json
{
  "scripts": {
    "seo:audit": "node scripts/seo-check-meta.js",
    "seo:sitemap": "node scripts/generate-sitemap.js",
    "seo:broken-links": "node scripts/check-broken-links.js",
    "seo:gsc-report": "node scripts/gsc-report.js",
    "seo:validate": "node scripts/validate-meta-tags.js",
    "seo:all": "npm run seo:validate && npm run build && npm run seo:sitemap && npm run seo:broken-links"
  }
}
```

---

## 7. Lỗi thường gặp

### Lỗi 1: Chỉ chạy SEO check thủ công

Manual audit 1 lần/tháng nghĩa là bugs có thể sống trên production hàng tuần trước khi bị phát hiện. Tích hợp SEO checks vào CI/CD để phát hiện ngay khi PR được tạo.

### Lỗi 2: Lighthouse score chỉ chạy trên localhost

Kết quả Lighthouse trên localhost không phản ánh production (không có CDN, SSL, real server latency). Nên chạy cả trên staging/production URLs.

### Lỗi 3: Không monitor GSC data tự động

Traffic tụt 30% có thể xảy ra âm thầm nếu không có alerting. Setup weekly script lấy GSC data và gửi alert khi có biến động lớn.

### Lỗi 4: Sitemap không cập nhật tự động

Deploy trang mới nhưng sitemap vẫn cũ. Google không biết trang mới tồn tại. Sitemap phải được generate lại mỗi lần build.

### Lỗi 5: Broken link check chỉ check internal links

External links cũng bị broken (website partner đóng, URL thay đổi). Script cần check cả internal và external links, nhưng rate-limit external checks để tránh bị block.

---

## Câu hỏi phỏng vấn

### Câu 1: Làm sao tích hợp SEO checks vào CI/CD pipeline?

**Trả lời**: Sử dụng Lighthouse CI trong GitHub Actions: (1) Build project, (2) Chạy Lighthouse CI với assertions cho SEO score tối thiểu (ví dụ >= 90), (3) Check meta tags bằng custom script, (4) Validate sitemap.xml và robots.txt tồn tại, (5) Check broken links. Nếu bất kỳ check nào fail, PR bị block. Config trong `lighthouserc.js` cho assertions cụ thể như `meta-description: 'error'`, `canonical: 'error'`.

### Câu 2: Google Search Console API có thể lấy những data gì?

**Trả lời**: GSC API (Search Analytics) cung cấp: clicks, impressions, CTR, average position cho từng query và page. Có thể filter theo date range, country, device, search type. Dùng để monitor traffic trends, phát hiện pages mất ranking, tìm keyword opportunities (impressions cao nhưng CTR thấp). API cũng có URL Inspection endpoint để kiểm tra index status của URL cụ thể.

### Câu 3: Tại sao sitemap cần được generate tự động?

**Trả lời**: Website thay đổi liên tục — thêm trang, xóa trang, cập nhật nội dung. Sitemap static (viết tay) nhanh chóng outdated, dẫn đến: (1) Google không biết trang mới, (2) Google cố crawl trang đã xóa (wasted crawl budget), (3) `lastmod` dates không chính xác khiến Google không re-crawl trang đã cập nhật. Giải pháp: generate sitemap trong build step, dựa trên files/pages thực tế trong build output.

### Câu 4: Broken links ảnh hưởng thế nào đến SEO?

**Trả lời**: Broken internal links (404) lãng phí crawl budget và cắt đứt link equity flow. User gặp 404 tăng bounce rate. Google coi broken links là tín hiệu website được maintain kém. Broken external links (outbound) ảnh hưởng ít hơn nhưng vẫn gây UX xấu. Nên chạy broken link check tự động weekly, và trong CI/CD cho internal links.

### Câu 5: Lighthouse CI assertions nên set thế nào cho SEO?

**Trả lời**: Chia thành 2 levels: `error` (block PR) và `warn` (cảnh báo nhưng không block). **Error-level**: `meta-description`, `document-title`, `canonical`, `is-crawlable`, `crawlable-anchors`, `image-alt`, `categories:seo >= 0.9`. **Warn-level**: `hreflang`, `link-text`, `robots-txt`, `categories:performance >= 0.8`. Tùy project mà điều chỉnh — site mới có thể bắt đầu với threshold thấp hơn rồi nâng dần.
