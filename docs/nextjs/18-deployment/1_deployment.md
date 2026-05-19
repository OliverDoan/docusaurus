---
sidebar_position: 1
title: "1. Deployment Options"
---

# Deployment Options

---

## Mục lục

- [Vercel (khuyến nghị)](#vercel-khuyến-nghị)
- [Netlify](#netlify)
- [Cloudflare Pages](#cloudflare-pages)
- [AWS Amplify](#aws-amplify)
- [Self-hosted Node.js](#self-hosted-nodejs)
- [Docker](#docker)
- [Static Export](#static-export)

---

## Vercel (khuyến nghị)

[Vercel](https://vercel.com) — từ team Next.js, **hỗ trợ đầy đủ nhất**.

**Deploy 1 click**:

```bash
npm install -g vercel
vercel
```

Hoặc connect GitHub → auto deploy mỗi push.

Tính năng built-in:

- **Edge Network** — CDN global.
- **Serverless Functions** — API routes auto deploy.
- **Edge Functions** — middleware + edge runtime.
- **Image Optimization** — built-in.
- **Web Analytics** + Speed Insights.
- **Preview Deployment** — mỗi PR có URL riêng.
- **ISR** + on-demand revalidation.
- **Cron jobs**, **Logs**, **Monitoring**.

```ts
// vercel.json
{
  "crons": [{
    "path": "/api/cron/cleanup",
    "schedule": "0 0 * * *"
  }]
}
```

:::info[Phân tích]

**Free tier Vercel đủ cho hầu hết hobby project**:

- 100GB bandwidth / month.
- 100GB-Hours Function execution.
- 1000 Image Optimization.
- Edge Functions: 500k execution.

Production app cần Pro ($20/user/month):

- Bandwidth unlimited (fair use).
- Function execution lớn hơn.
- Password protection.
- Team collaboration.

Vercel **deeply integrated** với Next.js — feature Next.js mới luôn ra
Vercel trước.

Trade-off:

- **Vendor lock-in** mức độ — một số feature (ISR cache, Edge Config)
  Vercel-specific.
- **Cost scale** — traffic lớn có thể đắt hơn AWS/Cloudflare.
- **Cold start** vẫn có (mạnh hơn Lambda nhưng không zero).

:::

---

## Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

Hỗ trợ Next.js qua **`@netlify/plugin-nextjs`** — auto setup.

Tính năng:

- Edge Functions.
- Image CDN.
- Forms (no code backend).
- Identity (auth).
- Split Testing.

So với Vercel: **support Next.js đầy đủ** nhưng có thể lag 1-2 phiên bản.
Trade-off: ecosystem rộng hơn cho non-Next.js (Astro, Hugo, Eleventy).

---

## Cloudflare Pages

Triển khai qua **Cloudflare Pages + Workers**:

```bash
npx wrangler pages deploy
```

Hoặc connect GitHub trong dashboard.

Đặc biệt:

- **Edge-first** — chạy gần user (300+ location).
- **Free tier rất rộng** — 100k req/day, không cap bandwidth.
- **Native Web Standards** — phù hợp Next.js Edge Runtime.
- **R2 storage** — S3-compat, không egress fee.

Limitation:

- Next.js Image Optimization cần config.
- Một số feature Node-only không work.
- ISR có support nhưng khác Vercel.

Phù hợp **edge-heavy app** hoặc **cost-conscious** project.

---

## AWS Amplify

```bash
npm install -g @aws-amplify/cli
amplify init
amplify hosting add
amplify publish
```

Hosting trên AWS với Next.js support full.

Phù hợp:

- App đã trong AWS ecosystem.
- Cần tích hợp Cognito, AppSync, S3.
- Enterprise compliance (SOC2, HIPAA).

Trade-off: setup phức tạp hơn Vercel, UI/UX kém hơn.

Alternative AWS:

- **SST.dev** — IaC framework cho Next.js trên AWS.
- **OpenNext.js** — adapter cho Lambda/CloudFront.

---

## Self-hosted Node.js

Chạy `npm start` trên bất kỳ Node server:

```bash
npm run build
npm start
# Mặc định port 3000
```

PM2 process manager:

```bash
npm install -g pm2
pm2 start npm --name "my-app" -- start
pm2 save
pm2 startup
```

Reverse proxy với Nginx:

```nginx
server {
  listen 80;
  server_name example.com;

  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

Phù hợp:

- Control hoàn toàn hosting.
- Đã có infrastructure (VPS, K8s).
- Cost-sensitive — VPS $5/month không cap traffic.

Trade-off:

- Tự handle: SSL, CDN, scaling, monitoring, backup.
- Image Optimization không built-in — phải tự setup hoặc `unoptimized`.
- ISR cache local, không distributed.

---

## Docker

```dockerfile
# Dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

`next.config.ts`:

```ts
export default {
  output: "standalone", // tạo .next/standalone tự contained
};
```

Build + run:

```bash
docker build -t my-app .
docker run -p 3000:3000 my-app
```

Phù hợp:

- Deploy Kubernetes.
- CI/CD pipeline có Docker.
- Cần reproducibility.
- Multi-cloud strategy.

---

## Static Export

Export site thành **HTML/CSS/JS tĩnh** — host bất kỳ CDN:

```ts
// next.config.ts
export default {
  output: "export",
};
```

```bash
npm run build
# Tạo folder ./out với HTML tĩnh
```

Deploy lên:

- **GitHub Pages**.
- **Cloudflare Pages** (static mode).
- **Netlify** (static).
- **S3 + CloudFront**.
- **Surge, Render**.

:::warning[Cần lưu ý]

**Static export bỏ qua nhiều feature Next.js:**

- ❌ Server Components data fetching.
- ❌ Server Actions.
- ❌ API routes.
- ❌ Middleware.
- ❌ Dynamic routes runtime.
- ❌ ISR.
- ❌ `Image` optimization (cần `unoptimized: true`).
- ❌ `cookies()`, `headers()`, `searchParams`.

Phù hợp **content site tĩnh**: blog, docs, portfolio.

Không phù hợp **app có auth, mutation, real-time** — phải dùng deploy mode
khác.

:::

:::info[Phân tích]

**Lựa chọn deployment 2026**:

```
SaaS / Internal app / có Server Actions?
├─ Vercel (default, easiest)
├─ Netlify (alternative similar)
└─ Self-host Docker (control max)

Edge-heavy / global?
├─ Vercel (Edge Functions)
└─ Cloudflare Pages

AWS ecosystem?
├─ Amplify (managed)
└─ SST/OpenNext (self-managed)

Static content (blog, docs)?
├─ Static Export → CDN
└─ Vercel (vẫn OK, free tier rộng)

Cost-conscious / hobby?
├─ Vercel Free
├─ Cloudflare Pages Free
└─ Self-host VPS $5/month
```

**Vercel** là default cho phần lớn project — DX tốt nhất, support Next.js
đầy đủ. Migrate sang option khác khi cost hoặc compliance buộc.

:::

:::tip[Mẹo]

**Production deployment workflow**:

1. **Branch protection** — main không direct push.
2. **PR workflow**:
   - CI: lint, type-check, test.
   - Preview deploy (Vercel auto).
   - Review.
   - Merge.
3. **Auto deploy** từ main → production.
4. **Smoke test** sau deploy:
   - Health check endpoint.
   - Critical flow (login, checkout).
5. **Rollback ready**:
   - Vercel: 1-click revert deploy.
   - Self-host: git revert + redeploy.

Pattern này cover **fast iteration + safety**. Mỗi PR test isolated, main
luôn deployable.

:::
