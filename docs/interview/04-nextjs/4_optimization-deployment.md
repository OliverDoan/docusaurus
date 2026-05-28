---
sidebar_position: 4
title: "4. Optimization & Deployment"
---

# Optimization & Deployment

> *Câu hỏi loại này phân biệt "đã deploy production" và "chỉ chạy local". Interviewer muốn nghe bạn biết platform khác nhau và trade-off thực tế.*

---

## Câu 1: Next/Image — em config thế nào cho production `[Intermediate]`

### Câu hỏi

> `next/image` ngon nhưng em cần config gì? Có gì khác với `<img>` thường?

### Giải thích lý thuyết

`next/image` lo:

- **Optimization**: serve WebP/AVIF cho browser support, resize on-demand.
- **Lazy loading**: native `loading="lazy"` cho image dưới fold.
- **Layout shift**: yêu cầu `width`/`height` hoặc `fill` → reserve space, tránh CLS.
- **Priority**: `priority` cho LCP image (preload).
- **Placeholder**: blur, empty, hoặc custom data URL.

Cần config:
- `remotePatterns` trong `next.config.js` để allow external domain.
- `deviceSizes` và `imageSizes` để control srcset.
- Có thể dùng Vercel image optimization hoặc custom loader (Cloudinary, Imgix).

### Code minh hoạ

```typescript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.example.com" },
      { protocol: "https", hostname: "cdn.example.com", pathname: "/uploads/**" },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // breakpoints cho srcset
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // sizes khi dùng prop sizes
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24, // 1 day cache
  },
};
```

```jsx
import Image from "next/image";

// LCP image — priority + reserved size
<Image
  src="/hero.jpg"
  width={1200}
  height={600}
  alt="Hero"
  priority
  sizes="(max-width: 768px) 100vw, 1200px"
/>

// Background hoặc parent quyết định size — dùng fill
<div style={{ position: "relative", width: "100%", aspectRatio: "16/9" }}>
  <Image src="/photo.jpg" alt="" fill sizes="100vw" />
</div>

// Blur placeholder dynamic (Next tự generate khi import local)
import hero from "@/public/hero.jpg";
<Image src={hero} alt="Hero" placeholder="blur" />

// External với blur placeholder
<Image
  src="https://cdn.example.com/photo.jpg"
  width={800}
  height={600}
  alt=""
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// Custom loader cho Cloudinary
<Image
  loader={({ src, width, quality }) =>
    `https://res.cloudinary.com/demo/image/upload/w_${width},q_${quality ?? 75}/${src}`
  }
  src="sample.jpg"
  width={800}
  height={600}
  alt=""
/>

// Tránh: missing width/height → CLS (Cumulative Layout Shift)
// <img src="..."> mà không khai báo size, image load → push content xuống → user bị layout shift
```

### Đáp án mẫu

> "Em config `remotePatterns` cho image external, set `deviceSizes` phù hợp breakpoint design (mobile 640, tablet 1024, desktop 1920), `formats: ['image/avif', 'image/webp']` để serve format hiện đại. Dùng `next/image` thay `<img>` cho 3 lợi: auto WebP/AVIF + responsive srcset, lazy load mặc định (trừ `priority`), và **bắt buộc width/height** → không CLS. LCP image em đánh dấu `priority` để preload, set `sizes` chính xác để browser pick variant đúng. Cho background image, dùng `fill` + parent có `position: relative` + `aspectRatio`. Tránh `next/image` cho icon nhỏ — overhead optimization không xứng, dùng SVG inline tốt hơn. Pitfall em từng gặp: dev quên set `width`/`height` cho image external → page bị CLS dữ, Lighthouse score tụt."

---

## Câu 2: Font optimization — `next/font` `[Intermediate]`

### Câu hỏi

> Em load Google Fonts như thế nào? `next/font` giải quyết vấn đề gì?

### Giải thích lý thuyết

Vấn đề loading font truyền thống:
- **FOUT** (Flash of Unstyled Text) — text hiển thị với fallback font trước, đổi sang web font sau.
- **FOIT** (Flash of Invisible Text) — text invisible cho đến khi font load.
- Request external (Google Fonts) → privacy + 1 thêm DNS lookup.
- Layout shift khi font load (CLS).

`next/font` (Next 13+) giải:
- **Self-host** font tại build time → 1 request domain duy nhất.
- **Inline** font CSS để no flash.
- **size-adjust** với fallback font → giảm CLS.
- **Preload** tự động cho font dùng trên page.

### Code minh hoạ

```typescript
// app/layout.tsx
import { Inter, Roboto_Mono } from "next/font/google";
import localFont from "next/font/local";

const inter = Inter({
  subsets: ["latin", "vietnamese"], // chỉ load subset cần
  display: "swap",                   // FOUT thay vì FOIT
  variable: "--font-inter",          // CSS variable
});

const mono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

// Local font
const myFont = localFont({
  src: [
    { path: "./fonts/Custom-Regular.woff2", weight: "400" },
    { path: "./fonts/Custom-Bold.woff2", weight: "700" },
  ],
  variable: "--font-custom",
});

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={`${inter.variable} ${mono.variable}`}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}

// Tailwind config — dùng CSS variable
// tailwind.config.ts
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
};

// Hoặc dùng className trực tiếp
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

function Page() {
  return (
    <p className={inter.className}>
      Text với Inter font
    </p>
  );
}
```

### Đáp án mẫu

> "`next/font` self-host font ở build time — không gọi Google Fonts runtime nữa. Lợi: privacy (không request domain Google), tốc độ (1 origin), no flash (font inline CSS). Quan trọng: **size-adjust** + fallback font — Next tự tính metric của web font và set CSS `size-adjust` cho fallback font sao cho dimension gần khớp, giảm CLS rõ rệt khi font swap. Em set `display: 'swap'` (FOUT — fallback font hiển thị ngay, swap khi web font load) thay vì 'block' (FOIT — text invisible đến khi font load). Subset `['latin', 'vietnamese']` chỉ load glyph cần, giảm 70% size font. Dùng CSS variable `variable: '--font-inter'` để Tailwind reference được — pattern modern. Local font tương tự với `localFont`. Một detail: chỉ apply `font` ở root layout, không apply scattered — Next sẽ preload đúng."

---

## Câu 3: Bundle analysis và optimization `[Intermediate]`

### Câu hỏi

> Bundle Next.js đang to. Em làm gì?

### Giải thích lý thuyết

Tools:
- **`@next/bundle-analyzer`** — visualization size của chunks.
- **Lighthouse / Chrome Coverage** — JS không dùng.

Common fixes:
- **Dynamic import** cho heavy component.
- **Tree-shake** thư viện (cherry-pick import).
- **Server Component** thay vì Client cho non-interactive.
- **Bỏ lib không cần** (`moment`, `lodash` full).
- **Modularize imports** với `optimizePackageImports`.

### Code minh hoạ

```typescript
// next.config.js — enable bundle analyzer
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({
  experimental: {
    // Tự tree-shake các lib hay dùng
    optimizePackageImports: [
      "@mui/material",
      "@mui/icons-material",
      "lucide-react",
      "lodash",
      "date-fns",
    ],
  },
});

// Run: ANALYZE=true npm run build
// → mở report HTML, xem ai chiếm chỗ
```

```jsx
// Dynamic import — chỉ load khi cần
import dynamic from "next/dynamic";

const HeavyEditor = dynamic(() => import("./HeavyEditor"), {
  loading: () => <EditorSkeleton />,
  ssr: false, // không SSR nếu client-only
});

function Page() {
  const [showEditor, setShowEditor] = useState(false);
  return (
    <>
      <button onClick={() => setShowEditor(true)}>Open editor</button>
      {showEditor && <HeavyEditor />}
    </>
  );
}

// Server Component thay Client → loại JS khỏi client bundle
// Trước:
"use client";
import { formatDate } from "date-fns";

function PostDate({ date }) {
  return <span>{formatDate(date, "PPP")}</span>;
  // date-fns ship xuống client
}

// Sau:
async function PostDate({ date }) {
  // Server Component — format trên server
  const { formatDate } = await import("date-fns");
  return <span>{formatDate(date, "PPP")}</span>;
}

// Cherry-pick lodash
// ❌ import _ from "lodash";  → 70kb
// ✅ import debounce from "lodash/debounce";  → 5kb

// Modularize imports — config cho lib không tree-shake tốt
// next.config.js
modularizeImports: {
  "lodash": {
    transform: "lodash/{{member}}",
  },
  "@mui/icons-material": {
    transform: "@mui/icons-material/{{member}}",
  },
},
// Sau đó import _ from "lodash" tự transform thành cherry-pick
```

### Đáp án mẫu

> "Em chạy `ANALYZE=true npm run build` với `@next/bundle-analyzer` để biết ai chiếm chỗ thực sự. Hành động theo thứ tự ROI: thứ nhất, **dynamic import** heavy component (Editor, Chart, PDF viewer) — load khi user trigger. Thứ hai, chuyển Client Component sang **Server Component** cho phần không interactive — toàn bộ lib (date-fns, marked, dompurify) không ship xuống client. Thứ ba, cherry-pick import — `import debounce from 'lodash/debounce'` thay vì `import _ from 'lodash'`. Thứ tư, config `optimizePackageImports` trong next.config.js cho lib lớn hay dùng (MUI, lucide-react) — Next auto-tree-shake. Thứ năm, thay lib nặng: `moment` (90kb) → `date-fns` (5kb thực dùng), `axios` → native fetch, `uuid` → `crypto.randomUUID()`. Một dự án em từng tham gia, áp dụng tất cả giảm initial JS từ 600kb xuống 180kb gzipped."

---

## Câu 4: Deploy Next.js — Vercel vs self-host `[Senior]`

### Câu hỏi

> Em deploy Next.js production. Chọn Vercel hay self-host (AWS, GCP, Docker)?

### Giải thích lý thuyết

| Yếu tố               | Vercel                              | Self-host                              |
| -------------------- | ----------------------------------- | -------------------------------------- |
| Setup                | 5 phút (Git push)                   | Vài giờ → ngày                         |
| Cost                 | Free tier hào phóng, scale tốn      | VPS rẻ ($5/mo), scale phải tự lo       |
| Edge runtime         | Native global                       | Cần custom (Cloudflare Workers...)     |
| ISR/Image Opt        | Built-in                            | Cần config Sharp, custom invalidation  |
| Logs/Analytics       | Built-in                            | Tự setup (Sentry, Datadog, Grafana)    |
| Lock-in              | Có (Vercel APIs, KV, Postgres)      | Standard Node.js                       |
| Bandwidth            | $40/100GB sau free tier             | Tự lo                                  |
| Compliance/Region    | Region cố định, không VN data center | Tự chọn                               |

Khi nào Vercel:
- Startup, MVP, side project.
- Team nhỏ, không muốn ops.
- App standard (không cần WebSocket persistent, không cần specific region).

Khi nào self-host:
- Cost-sensitive ở scale lớn.
- Cần data ở region cụ thể (compliance).
- Đã có ops team, infra Kubernetes.
- App cần WebSocket persistent (Vercel functions stateless, tốn nhiều).

### Code minh hoạ

```dockerfile
# Dockerfile — multi-stage build cho self-host
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# next.config.js output: 'standalone' tạo bundle tối ưu
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

```javascript
// next.config.js — chuẩn bị self-host
module.exports = {
  output: "standalone", // tạo standalone bundle độc lập, nhỏ gọn
  images: {
    // Cần Sharp loader cho image opt khi self-host
  },
};
```

```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://...
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7
    # cache + rate limit storage

volumes:
  pgdata:
```

### Đáp án mẫu

> "Phụ thuộc 3 yếu tố. Quy mô — startup/MVP/team nhỏ: **Vercel** vô địch (deploy 5 phút, global CDN, ISR/Image Opt built-in, không cần ops). Scale lớn (10M+ visit/month) — Vercel cost đắt nhanh, đặc biệt bandwidth ($40/100GB sau free tier) và serverless function. Compliance/region — Vercel cố định region, nếu data phải ở VN/EU strict thì self-host. WebSocket — Vercel function stateless, ngắt sau 25s, không phù hợp; self-host với Node server giữ connection. Em chọn self-host khi: dùng `output: 'standalone'` để build Docker image gọn ~150MB, deploy lên Kubernetes hoặc đơn giản hơn là VPS + nginx reverse proxy. Cần config thêm: Sharp cho image opt, Redis cho cache (ISR cần shared storage), webhook revalidation. Trade-off lớn nhất self-host: ops effort — alert, log aggregation, scaling — đáng nếu team đủ size."

---

## Câu 5: Monitoring và observability cho Next.js production `[Senior]`

### Câu hỏi

> App em đã lên production. Em monitor gì? Tooling nào?

### Giải thích lý thuyết

3 trụ cột observability:

1. **Real User Monitoring (RUM)** — đo Core Web Vitals từ real user (không phải lab).
2. **Error tracking** — Sentry, Bugsnag, Rollbar — capture error frontend + backend.
3. **Performance / APM** — log, trace, metric (Datadog, New Relic, Grafana).

Next.js cụ thể:
- **Vercel Analytics** — RUM tích hợp.
- **Sentry Next.js SDK** — auto instrument App Router.
- **OpenTelemetry** — chuẩn open, plug nhiều backend.

### Code minh hoạ

```typescript
// 1. Web Vitals — RUM
// app/layout.tsx
"use client";
import { onLCP, onINP, onCLS, onFCP, onTTFB } from "web-vitals";

function reportMetric(metric) {
  // Gửi đến analytics
  fetch("/api/vitals", {
    method: "POST",
    body: JSON.stringify(metric),
    keepalive: true,
  });
}

useEffect(() => {
  onLCP(reportMetric);
  onINP(reportMetric);
  onCLS(reportMetric);
  onFCP(reportMetric);
  onTTFB(reportMetric);
}, []);

// Hoặc dùng Next.js built-in
// app/layout.tsx
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

// 2. Sentry
// instrumentation.ts (Next.js convention)
import * as Sentry from "@sentry/nextjs";

export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" || process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.1,
      profilesSampleRate: 0.1,
    });
  }
}

// app/global-error.tsx
"use client";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({ error }) {
  useEffect(() => { Sentry.captureException(error); }, [error]);
  return (
    <html>
      <body>
        <h2>Something went wrong</h2>
      </body>
    </html>
  );
}

// 3. OpenTelemetry
// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation-node");
  }
}

// instrumentation-node.ts
import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: "https://otel.honeycomb.io/v1/traces",
    headers: { "x-honeycomb-team": process.env.HONEYCOMB_KEY },
  }),
});
sdk.start();

// 4. Structured logging
import pino from "pino";

const log = pino({
  level: process.env.LOG_LEVEL ?? "info",
  formatters: {
    level: (label) => ({ level: label }),
  },
});

log.info({ userId: "u1", action: "login" }, "User logged in");
log.error({ err: error }, "Failed to process payment");
```

### Đáp án mẫu

> "Em monitor 3 layer. **RUM**: `@vercel/speed-insights` hoặc `web-vitals` lib gửi LCP/INP/CLS từ real user lên analytics. Đo ở field rất khác lab — user mạng chậm, device yếu mới là majority. **Error tracking**: Sentry với Next.js SDK, config qua `instrumentation.ts` (convention mới). Sentry auto-capture unhandled errors cả server + client + edge, source map upload tự động khi deploy → stack trace readable. Em set `tracesSampleRate: 0.1` (10% trace) để không tốn quá. **APM / Tracing**: OpenTelemetry là chuẩn em chọn — vendor-neutral, plug được Honeycomb/Datadog/Grafana. Custom span cho slow query, external API call. Structured logging với pino (JSON), Pretty print local, ship JSON production cho Datadog/Loki parse. Một metric ít người watch nhưng quan trọng: build time + bundle size trend — push tăng dần là dấu hiệu cần refactor."

---

## Câu 6: Security checklist cho Next.js production `[Senior]`

### Câu hỏi

> Trước khi deploy production, em check những item security nào?

### Giải thích lý thuyết

Checklist quan trọng:

1. **Environment variables** — không expose secret lên client (chỉ `NEXT_PUBLIC_*`).
2. **CSP** (Content Security Policy) — chặn XSS.
3. **HTTPS only** — HSTS header.
4. **Authentication** — secure cookie, CSRF cho mutations.
5. **Input validation** — Zod ở mọi boundary (API, Server Action).
6. **Rate limiting** — chống brute force, abuse.
7. **Dependency audit** — `npm audit`, Snyk, Dependabot.
8. **Image upload** — validate type, size, scan malware.
9. **Server Action authorization** — verify user mỗi action.

### Code minh hoạ

```typescript
// 1. Env variables — không expose secret
// .env
DATABASE_URL=postgres://...           // server-only
STRIPE_SECRET_KEY=sk_live_...         // server-only
NEXT_PUBLIC_STRIPE_PUBLISHABLE=pk_... // client-visible (chỉ public key)

// Trong code
process.env.DATABASE_URL              // chỉ server
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE // client + server

// 2. CSP header
// next.config.js
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.example.com;
  font-src 'self';
  frame-ancestors 'none';
`;

module.exports = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: ContentSecurityPolicy.replace(/\n/g, "") },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

// 3. Secure cookie cho session
"use server";
import { cookies } from "next/headers";

const cookieStore = await cookies();
cookieStore.set("session", token, {
  httpOnly: true,    // không đọc qua document.cookie
  secure: true,      // chỉ gửi qua HTTPS
  sameSite: "lax",   // CSRF protection
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
});

// 4. Validate input ở Server Action
"use server";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  message: z.string().max(1000),
});

export async function submitContact(prev, formData) {
  const result = schema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { error: result.error.flatten() };
  }

  // Authorization — check ai gửi
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  await db.message.create({ data: { ...result.data, userId: session.userId } });
}

// 5. Rate limit
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
});

// In Server Action
const { success } = await ratelimit.limit(`contact:${session.userId}`);
if (!success) return { error: "Too many requests" };

// 6. SQL injection — luôn dùng ORM/parameterized
// ❌ raw query với string interpolation
await db.$queryRawUnsafe(`SELECT * FROM users WHERE id = ${id}`);
// ✅ parameterized
await db.$queryRaw`SELECT * FROM users WHERE id = ${id}`;
// ✅ ORM
await db.user.findUnique({ where: { id } });

// 7. XSS — không trust user content
import DOMPurify from "isomorphic-dompurify";

function SafeHtml({ html }) {
  const clean = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}
```

### Đáp án mẫu

> "Em đi qua checklist: **env vars** — secret không có prefix `NEXT_PUBLIC_` (anything có prefix sẽ ship xuống client); audit không có secret hardcode trong code. **Security headers** — config trong `next.config.js`: CSP (chặn XSS), X-Frame-Options DENY (chặn clickjacking), HSTS, Referrer-Policy, Permissions-Policy. **Cookie session** — httpOnly + secure + sameSite=lax. **Input validation** — Zod schema ở mọi Server Action và Route Handler, không trust formData/body. **Authorization** — mỗi Server Action check session + permission, không rely trên client check. **Rate limiting** — Upstash sliding window cho login, contact form, expensive endpoint. **SQL injection** — luôn dùng Prisma/Drizzle ORM hoặc parameterized query. **XSS** — DOMPurify cho content user (markdown, comment). **Dependency** — Dependabot bật, `npm audit` trong CI. Vercel có thêm Firewall + DDoS protection — em enable nếu dùng. Cuối cùng: regular pen-test hoặc dùng Snyk scan."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                                | Đúng là                                                              |
| ------------------------------------------------------ | -------------------------------------------------------------------- |
| "`next/image` luôn nhanh hơn `<img>`"                  | Có overhead optimization; icon nhỏ dùng SVG inline                   |
| "Vercel free tier dùng được mãi"                       | Bandwidth + build time tốn nhanh sau free tier                       |
| "CSP làm app vỡ"                                       | Cần config kỹ inline script; nhưng làm đúng chặn XSS rất hiệu quả    |
| "Self-host rẻ hơn Vercel"                              | Server cost rẻ nhưng ops time + risk khá đắt                         |
| "Server Action không cần validate input"               | Vẫn boundary — user có thể craft request giả; phải validate          |
