---
sidebar_position: 4
title: "4. Deployment title: "Deployment & Vercel" Vercel"
---

# Deployment & Vercel

## Giới thiệu

Sau khi xây dựng xong ứng dụng Next.js, bước tiếp theo la **deploy** len production. Next.js hỗ trợ nhiều cách deploy:

| Phương pháp | Ưu điểm | Phu hop |
|-------------|---------|---------|
| Vercel | Zero config, tối ưu nhat cho Next.js | Phan lon dự án |
| Self-hosting (Node.js) | Toan quyền kiem soat | Du an can custom server |
| Docker | Di dong, nhất quán môi trường | Microservices, cloud |
| Static Export | Don gian, re, nhanh | Trang tinh, không cần SSR |

---

## Nội dung

1. [Vercel Deployment](#1-vercel-deployment)
2. [Self-hosting voi Node.js](#2-self-hosting-voi-nodejs)
3. [Docker Deployment](#3-docker-deployment)
4. [Static Export](#4-static-export)
5. [Build Output Analysis](#5-build-output-analysis)
6. [Environment-specific Config](#6-environment-specific-config)
7. [Monitoring va Analytics](#7-monitoring-va-analytics)
8. [Lỗi thường gặp](#8-loi-thuong-gap)
9. [Câu hỏi phỏng vấn](#cau-hoi-phong-van)

---

## 1. Vercel Deployment

Vercel là nền tảng do chính doi ngu Next.js xây dựng, nen hỗ trợ **tot nhat** cho Next.js.

### 1.1 Connect Git Repository

**Bước 1:** Đăng ký tài khoản tai [vercel.com](https://vercel.com)

**Bước 2:** Import repository

```bash
# Dam bao code da được push len GitHub/GitLab/Bitbucket
git add .
git commit -m "feat: ready for deployment"
git push origin main
```

**Bước 3:** Tren Vercel Dashboard:
1. Click **"Add New Project"**
2. Chon Git provider (GitHub, GitLab, Bitbucket)
3. Chon repository
4. Vercel tự động detect Next.js va cấu hình build command
5. Click **"Deploy"**

Vercel se tự động:
- Cai dat dependencies
- Chay `npm run build`
- Deploy len CDN toàn cầu

### 1.2 Environment Variables

Cau hinh environment variables trên Vercel Dashboard:

```bash
# Vercel Dashboard -> Settings -> Environment Variables
# Them tung variable:
DATABASE_URL=postgresql://user:pass@host/db
JWT_SECRET=my-super-secret-key
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

Co the cấu hình khac nhau cho tung môi trường:
- **Production** - branch main
- **Preview** - các branch khac (PR previews)
- **Development** - local development

```bash
# Hoac dung Vercel CLI
npm install -g vercel

# Pull env variables ve local
vercel env pull .env.local
```

### 1.3 Custom Domains

```bash
# Bước 1: Them domain trên Vercel Dashboard
# Settings -> Domains -> Add Domain

# Bước 2: Cau hinh DNS records tai nha đăng ký domain
# Type: CNAME
# Name: www
# Value: cname.vercel-dns.com

# Type: A
# Name: @
# Value: 76.76.21.21
```

Vercel tự động:
- Tạo va gia hạn **SSL certificate** (HTTPS)
- Redirect www sang non-www (hoac nguoc lai)
- Cau hinh **CDN** toàn cầu

### 1.4 Preview Deployments

Moi khi tao Pull Request, Vercel tự động deploy **preview version**:

```bash
# Tạo branch moi va push
git checkout -b feature/new-homepage
# ... lam thay đổi ...
git add .
git commit -m "feat: redesign homepage"
git push -u origin feature/new-homepage

# Tạo Pull Request tren GitHub
# -> Vercel tu dong tao preview URL: https://project-abc123.vercel.app
# -> Comment tren PR voi link preview
```

Lợi ích cua Preview Deployments:
- Team review giao diện trước khi merge
- Test tren môi trường giong production
- Moi commit moi tren PR tao preview moi

### 1.5 Edge Functions

Vercel Edge Functions chay trên edge network (gan người dùng), cực nhanh:

```tsx
// app/api/geo/route.ts
import { NextRequest, NextResponse } from "next/server";

// Khai bao chạy trên Edge runtime
export const runtime = "edge";

export async function GET(request: NextRequest) {
  // Vercel tự động cung cap thông tin vị trí
  const country = request.headers.get("x-vercel-ip-country") ?? "unknown";
  const city = request.headers.get("x-vercel-ip-city") ?? "unknown";

  return NextResponse.json({
    message: `Xin chao tu ${city}, ${country}!`,
    timestamp: new Date().toISOString(),
  });
}
```

```tsx
// middleware.ts - chạy trên Edge mặc định
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Redirect người dùng Viet Nam den trang tieng Viet
  const country = request.geo?.country;

  if (country === "VN" && !request.nextUrl.pathname.startsWith("/vi")) {
    return NextResponse.redirect(new URL("/vi", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
```

---

## 2. Self-hosting voi Node.js

Khi can toàn quyền kiem soat server:

### 2.1 Build va chay

```bash
# Build production
npm run build

# Chay production server
npm run start
# Hoac:
node .next/standalone/server.js
```

### 2.2 Cau hinh standalone output

```tsx
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tạo output độc lập, không cần node_modules
  output: "standalone",
};

export default nextConfig;
```

Sau khi build, thư mục `.next/standalone` chua:
- `server.js` - file server chinh
- `node_modules/` - chi cac dependencies can thiet (nhỏ hơn nhieu)
- `.next/` - build output

```bash
# Copy static files (next/image, public assets)
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public

# Chay server
cd .next/standalone
PORT=3000 node server.js
```

### 2.3 Process manager voi PM2

```bash
# Cai dat PM2
npm install -g pm2

# Chay voi PM2
pm2 start .next/standalone/server.js --name "nextjs-app"

# Xem logs
pm2 logs nextjs-app

# Restart khi crash
pm2 startup
pm2 save
```

---

## 3. Docker Deployment

### 3.1 Dockerfile tối ưu

```bash
# Dockerfile
# Bước 1: Cai dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Bước 2: Build ứng dụng
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js
RUN npm run build

# Bước 3: Production image (nho gon nhat)
FROM node:20-alpine AS runner
WORKDIR /app

# Tạo user không phải root (bảo mật)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy chi nhung gi can thiet
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Chay voi user không phải root
USER nextjs

# Port va environment
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Chay server
CMD ["node", "server.js"]
```

### 3.2 Docker Compose

```bash
# docker-compose.yml
version: "3.8"

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/mydb
      - JWT_SECRET=my-secret
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=mydb
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### 3.3 Build va chay Docker

```bash
# Build image
docker build -t nextjs-app .

# Chay container
docker run -p 3000:3000 --env-file .env.local nextjs-app

# Hoac voi Docker Compose
docker compose up -d
```

---

## 4. Static Export

Export thanh trang HTML tinh, host tren bất kỳ CDN nao:

### 4.1 Cau hinh

```tsx
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Export thanh HTML/CSS/JS tinh
  output: "export",

  // Nếu host tren sub-path (vd: github.io/my-app)
  // basePath: "/my-app",

  // Tat Image Optimization (không có server xu ly)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

### 4.2 Gioi han cua Static Export

Khi dung `output: "export"`, các tính năng sau **KHONG** hoạt động:
- Server Components voi dynamic data
- Route Handlers (API routes)
- Middleware
- Incremental Static Regeneration (ISR)
- Image Optimization (tru khi dung external loader)

### 4.3 Build và deploy

```bash
# Build
npm run build

# Output trong thư mục "out/"
ls out/
# index.html, about.html, 404.html, _next/, ...

# Deploy len bất kỳ static hosting nao:
# - GitHub Pages
# - Netlify
# - Cloudflare Pages
# - AWS S3 + CloudFront
```

---

## 5. Build Output Analysis

Sau khi build, Next.js hiển thị thông tin hữu ích:

```bash
npm run build

# Output:
# Route (app)                    Size     First Load JS
# ┌ ○ /                          5.2 kB        89 kB
# ├ ○ /about                     1.8 kB        85 kB
# ├ ● /blog/[slug]               3.1 kB        87 kB
# ├ λ /api/users                 0 B            0 B
# └ ○ /contact                   2.4 kB        86 kB
#
# ○ (Static)   prerendered at build time
# ● (SSG)      prerendered with getStaticProps
# λ (Dynamic)  server-rendered on demand

# First Load JS shared by all: 83.6 kB
```

**Doc kết quả:**
- **Size**: JavaScript riêng cua route do
- **First Load JS**: Tong JS người dùng tai khi truy cập (shared + route)
- **Bieu tuong**: cho biet route được render nhu thế nào

**Mục tiêu:** First Load JS dưới 100kB cho trải nghiệm tot.

---

## 6. Environment-specific Config

### 6.1 Nhieu file .env

```bash
# .env                 - Mac dinh cho moi môi trường
# .env.local           - Override local (KHONG commit)
# .env.development     - Chi cho npm run dev
# .env.production      - Chi cho npm run build/start
# .env.test            - Chi cho testing

# Thu tu ưu tiên (cao -> thap):
# 1. .env.development.local (hoac .env.production.local)
# 2. .env.local
# 3. .env.development (hoac .env.production)
# 4. .env
```

### 6.2 Config theo môi trường trong next.config.ts

```tsx
// next.config.ts
import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // Bat React Strict Mođể trống development
  reactStrictMode: true,

  // Cau hinh khac nhau theo môi trường
  images: {
    remotePatterns: isProd
      ? [{ protocol: "https", hostname: "cdn.production.com" }]
      : [{ protocol: "http", hostname: "localhost" }],
  },

  // Redirect chi tren production
  async redirects() {
    return isProd
      ? [{ source: "/old-page", destination: "/new-page", permanent: true }]
      : [];
  },
};

export default nextConfig;
```

---

## 7. Monitoring va Analytics

### 7.1 Vercel Analytics

```bash
npm install @vercel/analytics
```

```tsx
// app/layout.tsx
import { Analytics } from "@vercel/analytics/react";
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
        {/* Web Analytics - theo doi page views, visitors */}
        <Analytics />
        {/* Speed Insights - theo doi Core Web Vitals */}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### 7.2 Error tracking voi Sentry

```bash
npx @sentry/wizard@latest -i nextjs
```

```tsx
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Bat theo dõi performance
  tracesSampleRate: 1.0,
  // Bat theo dõi session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### 7.3 Custom health check endpoint

```tsx
// app/api/health/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.APP_VERSION ?? "unknown",
  };

  // Kiem tra database connection
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ ...health, database: "connected" });
  } catch {
    return NextResponse.json(
      { ...health, database: "disconnected", status: "degraded" },
      { status: 503 }
    );
  }
}
```

---

## 8. Lỗi thường gặp

### Lỗi 1: Build thành công local nhung fail trên Vercel

```bash
# Nguyen nhan phổ biến:
# 1. Node version khong khop
# Giai phap: thêm vào package.json
# "engines": { "node": ">=20.0.0" }

# 2. Thieu environment variables trên Vercel
# Giai phap: kiểm tra Vercel Dashboard -> Settings -> Environment Variables

# 3. Case-sensitive file names (Linux vs macOS)
# macOS: "Component.tsx" va "component.tsx" là một
# Linux (Vercel): hai file khac nhau!
# Giai phap: kiểm tra import paths chính xác
```

### Lỗi 2: Environment variables không có giá trị

```tsx
// Nguyen nhan: bien thiếu NEXT_PUBLIC_ prefix cho client-side
// hoac chua thêm vào Vercel dashboard

// Kiem tra:
// 1. Server-side: truy cập bình thường
console.log(process.env.DATABASE_URL); // OK

// 2. Client-side: phải có NEXT_PUBLIC_
console.log(process.env.NEXT_PUBLIC_API_URL); // OK
console.log(process.env.DATABASE_URL); // undefined trên client!
```

### Lỗi 3: Docker image quá lớn

```bash
# Nguyen nhan: khong dung multi-stage build
# Giai phap: dung Dockerfile multi-stage nhu phan 3.1
# Va dung output: "standalone" trong next.config.ts

# Kiem tra kích thước image:
docker images nextjs-app
# Mục tiêu: dưới 200MB voi multi-stage + standalone
```

### Lỗi 4: Static export thiếu trang

```tsx
// Nguyen nhan: dynamic routes can generateStaticParams

// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  // Phai khai báo tất cả slug có thể co
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: So sánh cac phương pháp deploy Next.js?

**Trả lời:**

| Phương pháp | SSR | ISR | Edge | Ưu điểm | Nhược điểm |
|-------------|-----|-----|------|---------|------------|
| Vercel | Co | Co | Co | Zero config, tối ưu nhat | Cost cao khi scale |
| Node.js | Co | Co | Không | Toan quyền kiem soat | Tu quan ly infra |
| Docker | Co | Co | Không | Di dong, nhất quán | Phuc tap hon |
| Static Export | Không | Không | Không | Re, nhanh, don gian | Han che tính năng |

Chon **Vercel** khi can deploy nhanh, full features. Chon **Docker** khi can tích hợp voi hệ thống có sẵn. Chon **Static Export** khi ứng dụng không cần server rendering.

### Câu 2: Lam sao tối ưu Docker image cho Next.js?

**Trả lời:**

3 ky thuat chinh:

1. **Multi-stage build**: Tach build va runtime stage, chỉ cópy output can thiet
2. **`output: "standalone"`**: Next.js chỉ cópy nhung dependencies thực sự dung, giảm kích thước tu hang tram MB xuong vai chuc MB
3. **Alpine base image**: Dung `node:20-alpine` thay vi `node:20` (nhỏ hơn ~5x)

Ket qua: image tu 1GB+ giảm xuong con 100-200MB.

### Câu 3: Preview Deployments hoạt động nhu thế nào?

**Trả lời:**

Khi ban push code len mot branch va tao Pull Request:

1. Vercel tự động detect PR moi
2. Build và deploy branch do len mot **URL riêng** (vd: `project-abc123.vercel.app`)
3. Comment tren PR voi link preview
4. Moi commit moi tren PR tao deploy moi
5. Khi merge PR, preview URL bi xoa

Lợi ích: team review giao diện tren môi trường giong production ma khong ảnh hưởng den site chinh.

### Câu 4: Khi nao nen dung Static Export?

**Trả lời:**

Dung Static Export khi:
- Trang web **hoàn toàn tinh** (blog, portfolio, documentation)
- Không can **server-side rendering** hay **API routes**
- Muon host tren **CDN rẻ tiền** (GitHub Pages, S3, Cloudflare Pages)
- Không can **authentication** phia server

Không dung khi can: SSR, ISR, middleware, route handlers, image optimization trên server.

### Câu 5: Lam sao quan ly environment variables an toàn khi deploy?

**Trả lời:**

1. **KHONG commit** `.env.local` (thêm vào `.gitignore`)
2. **Phan biet** bien server vs client: chỉ dùng `NEXT_PUBLIC_` cho dữ liệu cong khai
3. **Vercel**: cấu hình tren Dashboard, tach riêng cho Production/Preview/Development
4. **Self-hosting**: dung secret manager (AWS Secrets Manager, HashiCorp Vault)
5. **Docker**: truyền qua `--env-file` hoac Docker secrets
6. **Validate**: dung Zod de kiểm tra tất cả env variables can thiet khi startup
