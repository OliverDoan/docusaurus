---
sidebar_position: 4
title: "Deployment & Vercel"
---

# Deployment & Vercel

## Gioi thieu

Sau khi xay dung xong ung dung Next.js, buoc tiep theo la **deploy** len production. Next.js ho tro nhieu cach deploy:

| Phuong phap | Uu diem | Phu hop |
|-------------|---------|---------|
| Vercel | Zero config, toi uu nhat cho Next.js | Phan lon du an |
| Self-hosting (Node.js) | Toan quyen kiem soat | Du an can custom server |
| Docker | Di dong, nhat quan moi truong | Microservices, cloud |
| Static Export | Don gian, re, nhanh | Trang tinh, khong can SSR |

---

## Noi dung

1. [Vercel Deployment](#1-vercel-deployment)
2. [Self-hosting voi Node.js](#2-self-hosting-voi-nodejs)
3. [Docker Deployment](#3-docker-deployment)
4. [Static Export](#4-static-export)
5. [Build Output Analysis](#5-build-output-analysis)
6. [Environment-specific Config](#6-environment-specific-config)
7. [Monitoring va Analytics](#7-monitoring-va-analytics)
8. [Loi thuong gap](#8-loi-thuong-gap)
9. [Cau hoi phong van](#cau-hoi-phong-van)

---

## 1. Vercel Deployment

Vercel la nen tang do chinh doi ngu Next.js xay dung, nen ho tro **tot nhat** cho Next.js.

### 1.1 Connect Git Repository

**Buoc 1:** Dang ky tai khoan tai [vercel.com](https://vercel.com)

**Buoc 2:** Import repository

```bash
# Dam bao code da duoc push len GitHub/GitLab/Bitbucket
git add .
git commit -m "feat: ready for deployment"
git push origin main
```

**Buoc 3:** Tren Vercel Dashboard:
1. Click **"Add New Project"**
2. Chon Git provider (GitHub, GitLab, Bitbucket)
3. Chon repository
4. Vercel tu dong detect Next.js va cau hinh build command
5. Click **"Deploy"**

Vercel se tu dong:
- Cai dat dependencies
- Chay `npm run build`
- Deploy len CDN toan cau

### 1.2 Environment Variables

Cau hinh environment variables tren Vercel Dashboard:

```bash
# Vercel Dashboard -> Settings -> Environment Variables
# Them tung variable:
DATABASE_URL=postgresql://user:pass@host/db
JWT_SECRET=my-super-secret-key
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

Co the cau hinh khac nhau cho tung moi truong:
- **Production** - branch main
- **Preview** - cac branch khac (PR previews)
- **Development** - local development

```bash
# Hoac dung Vercel CLI
npm install -g vercel

# Pull env variables ve local
vercel env pull .env.local
```

### 1.3 Custom Domains

```bash
# Buoc 1: Them domain tren Vercel Dashboard
# Settings -> Domains -> Add Domain

# Buoc 2: Cau hinh DNS records tai nha dang ky domain
# Type: CNAME
# Name: www
# Value: cname.vercel-dns.com

# Type: A
# Name: @
# Value: 76.76.21.21
```

Vercel tu dong:
- Tao va gia han **SSL certificate** (HTTPS)
- Redirect www sang non-www (hoac nguoc lai)
- Cau hinh **CDN** toan cau

### 1.4 Preview Deployments

Moi khi tao Pull Request, Vercel tu dong deploy **preview version**:

```bash
# Tao branch moi va push
git checkout -b feature/new-homepage
# ... lam thay doi ...
git add .
git commit -m "feat: redesign homepage"
git push -u origin feature/new-homepage

# Tao Pull Request tren GitHub
# -> Vercel tu dong tao preview URL: https://project-abc123.vercel.app
# -> Comment tren PR voi link preview
```

Loi ich cua Preview Deployments:
- Team review giao dien truoc khi merge
- Test tren moi truong giong production
- Moi commit moi tren PR tao preview moi

### 1.5 Edge Functions

Vercel Edge Functions chay tren edge network (gan nguoi dung), cuc nhanh:

```tsx
// app/api/geo/route.ts
import { NextRequest, NextResponse } from "next/server";

// Khai bao chay tren Edge runtime
export const runtime = "edge";

export async function GET(request: NextRequest) {
  // Vercel tu dong cung cap thong tin vi tri
  const country = request.headers.get("x-vercel-ip-country") ?? "unknown";
  const city = request.headers.get("x-vercel-ip-city") ?? "unknown";

  return NextResponse.json({
    message: `Xin chao tu ${city}, ${country}!`,
    timestamp: new Date().toISOString(),
  });
}
```

```tsx
// middleware.ts - chay tren Edge mac dinh
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Redirect nguoi dung Viet Nam den trang tieng Viet
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

Khi can toan quyen kiem soat server:

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
  // Tao output doc lap, khong can node_modules
  output: "standalone",
};

export default nextConfig;
```

Sau khi build, thu muc `.next/standalone` chua:
- `server.js` - file server chinh
- `node_modules/` - chi cac dependencies can thiet (nho hon nhieu)
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

### 3.1 Dockerfile toi uu

```bash
# Dockerfile
# Buoc 1: Cai dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Buoc 2: Build ung dung
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js
RUN npm run build

# Buoc 3: Production image (nho gon nhat)
FROM node:20-alpine AS runner
WORKDIR /app

# Tao user khong phai root (bao mat)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy chi nhung gi can thiet
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Chay voi user khong phai root
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

Export thanh trang HTML tinh, host tren bat ky CDN nao:

### 4.1 Cau hinh

```tsx
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Export thanh HTML/CSS/JS tinh
  output: "export",

  // Neu host tren sub-path (vd: github.io/my-app)
  // basePath: "/my-app",

  // Tat Image Optimization (khong co server xu ly)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

### 4.2 Gioi han cua Static Export

Khi dung `output: "export"`, cac tinh nang sau **KHONG** hoat dong:
- Server Components voi dynamic data
- Route Handlers (API routes)
- Middleware
- Incremental Static Regeneration (ISR)
- Image Optimization (tru khi dung external loader)

### 4.3 Build va deploy

```bash
# Build
npm run build

# Output trong thu muc "out/"
ls out/
# index.html, about.html, 404.html, _next/, ...

# Deploy len bat ky static hosting nao:
# - GitHub Pages
# - Netlify
# - Cloudflare Pages
# - AWS S3 + CloudFront
```

---

## 5. Build Output Analysis

Sau khi build, Next.js hien thi thong tin huu ich:

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

**Doc ket qua:**
- **Size**: JavaScript rieng cua route do
- **First Load JS**: Tong JS nguoi dung tai khi truy cap (shared + route)
- **Bieu tuong**: cho biet route duoc render nhu the nao

**Muc tieu:** First Load JS duoi 100kB cho trai nghiem tot.

---

## 6. Environment-specific Config

### 6.1 Nhieu file .env

```bash
# .env                 - Mac dinh cho moi moi truong
# .env.local           - Override local (KHONG commit)
# .env.development     - Chi cho npm run dev
# .env.production      - Chi cho npm run build/start
# .env.test            - Chi cho testing

# Thu tu uu tien (cao -> thap):
# 1. .env.development.local (hoac .env.production.local)
# 2. .env.local
# 3. .env.development (hoac .env.production)
# 4. .env
```

### 6.2 Config theo moi truong trong next.config.ts

```tsx
// next.config.ts
import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // Bat React Strict Mode trong development
  reactStrictMode: true,

  // Cau hinh khac nhau theo moi truong
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
  // Bat theo doi performance
  tracesSampleRate: 1.0,
  // Bat theo doi session replay
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

## 8. Loi thuong gap

### Loi 1: Build thanh cong local nhung fail tren Vercel

```bash
# Nguyen nhan pho bien:
# 1. Node version khong khop
# Giai phap: them vao package.json
# "engines": { "node": ">=20.0.0" }

# 2. Thieu environment variables tren Vercel
# Giai phap: kiem tra Vercel Dashboard -> Settings -> Environment Variables

# 3. Case-sensitive file names (Linux vs macOS)
# macOS: "Component.tsx" va "component.tsx" la mot
# Linux (Vercel): hai file khac nhau!
# Giai phap: kiem tra import paths chinh xac
```

### Loi 2: Environment variables khong co gia tri

```tsx
// Nguyen nhan: bien thieu NEXT_PUBLIC_ prefix cho client-side
// hoac chua them vao Vercel dashboard

// Kiem tra:
// 1. Server-side: truy cap binh thuong
console.log(process.env.DATABASE_URL); // OK

// 2. Client-side: phai co NEXT_PUBLIC_
console.log(process.env.NEXT_PUBLIC_API_URL); // OK
console.log(process.env.DATABASE_URL); // undefined tren client!
```

### Loi 3: Docker image qua lon

```bash
# Nguyen nhan: khong dung multi-stage build
# Giai phap: dung Dockerfile multi-stage nhu phan 3.1
# Va dung output: "standalone" trong next.config.ts

# Kiem tra kich thuoc image:
docker images nextjs-app
# Muc tieu: duoi 200MB voi multi-stage + standalone
```

### Loi 4: Static export thieu trang

```tsx
// Nguyen nhan: dynamic routes can generateStaticParams

// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  // Phai khai bao tat ca slug co the co
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}
```

---

## Cau hoi phong van

### Cau 1: So sanh cac phuong phap deploy Next.js?

**Tra loi:**

| Phuong phap | SSR | ISR | Edge | Uu diem | Nhuoc diem |
|-------------|-----|-----|------|---------|------------|
| Vercel | Co | Co | Co | Zero config, toi uu nhat | Cost cao khi scale |
| Node.js | Co | Co | Khong | Toan quyen kiem soat | Tu quan ly infra |
| Docker | Co | Co | Khong | Di dong, nhat quan | Phuc tap hon |
| Static Export | Khong | Khong | Khong | Re, nhanh, don gian | Han che tinh nang |

Chon **Vercel** khi can deploy nhanh, full features. Chon **Docker** khi can tich hop voi he thong co san. Chon **Static Export** khi ung dung khong can server rendering.

### Cau 2: Lam sao toi uu Docker image cho Next.js?

**Tra loi:**

3 ky thuat chinh:

1. **Multi-stage build**: Tach build va runtime stage, chi copy output can thiet
2. **`output: "standalone"`**: Next.js chi copy nhung dependencies thuc su dung, giam kich thuoc tu hang tram MB xuong vai chuc MB
3. **Alpine base image**: Dung `node:20-alpine` thay vi `node:20` (nho hon ~5x)

Ket qua: image tu 1GB+ giam xuong con 100-200MB.

### Cau 3: Preview Deployments hoat dong nhu the nao?

**Tra loi:**

Khi ban push code len mot branch va tao Pull Request:

1. Vercel tu dong detect PR moi
2. Build va deploy branch do len mot **URL rieng** (vd: `project-abc123.vercel.app`)
3. Comment tren PR voi link preview
4. Moi commit moi tren PR tao deploy moi
5. Khi merge PR, preview URL bi xoa

Loi ich: team review giao dien tren moi truong giong production ma khong anh huong den site chinh.

### Cau 4: Khi nao nen dung Static Export?

**Tra loi:**

Dung Static Export khi:
- Trang web **hoan toan tinh** (blog, portfolio, documentation)
- Khong can **server-side rendering** hay **API routes**
- Muon host tren **CDN re tien** (GitHub Pages, S3, Cloudflare Pages)
- Khong can **authentication** phia server

Khong dung khi can: SSR, ISR, middleware, route handlers, image optimization tren server.

### Cau 5: Lam sao quan ly environment variables an toan khi deploy?

**Tra loi:**

1. **KHONG commit** `.env.local` (them vao `.gitignore`)
2. **Phan biet** bien server vs client: chi dung `NEXT_PUBLIC_` cho du lieu cong khai
3. **Vercel**: cau hinh tren Dashboard, tach rieng cho Production/Preview/Development
4. **Self-hosting**: dung secret manager (AWS Secrets Manager, HashiCorp Vault)
5. **Docker**: truyen qua `--env-file` hoac Docker secrets
6. **Validate**: dung Zod de kiem tra tat ca env variables can thiet khi startup
