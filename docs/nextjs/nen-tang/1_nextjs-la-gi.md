---
sidebar_position: 1
title: "1. Next.js là gì?"
---

# Next.js là gì?


---

## Mục lục

- [Giới thiệu Next.js](#giới-thiệu-nextjs)
- [Tại sao chọn Next.js?](#tại-sao-chọn-nextjs)
- [Các tính năng chính của Next.js](#các-tính-năng-chính-của-nextjs)
- [Lịch sử phát triển Next.js](#lịch-sử-phát-triển-nextjs)
- [Khi nào nên dùng Next.js?](#khi-nào-nên-dùng-nextjs)
- [Hello World với Next.js](#hello-world-với-nextjs)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tổng kết](#tổng-kết)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Giới thiệu Next.js

Next.js là một **React framework** dành cho production, được phát triển bởi **Vercel**. Nếu bạn đã biết React, hãy nghĩ Next.js như một "bản nâng cấp" giúp bạn xây dựng ứng dụng web hoàn chỉnh mà không cần tự cấu hình hàng loạt công cụ.

```
React = Thư viện UI (chỉ lo phần giao diện)
Next.js = Framework đầy đủ (routing, SSR, API, tối ưu hóa, ...)
```

Tưởng tượng React như **động cơ xe**, còn Next.js là **chiếc xe hoàn chỉnh** — có sẵn vô lăng (routing), hệ thống phanh (error handling), đèn pha (SEO), và nhiều hơn nữa.

### Next.js giải quyết vấn đề gì?

Khi dùng React thuần (Create React App), bạn phải tự lo:

```
- Routing → Cài react-router-dom, tự cấu hình
- SEO → React render phía client, Google khó crawl
- API → Cần server riêng (Express, Fastify, ...)
- Tối ưu hình ảnh → Tự xử lý lazy loading, resize
- Code splitting → Tự cấu hình webpack
- TypeScript → Tự setup tsconfig
```

Next.js giải quyết **tất cả** những vấn đề trên ngay từ đầu (zero-config).

## Tại sao chọn Next.js?

### So sánh với các công cụ khác

| Tiêu chí | Next.js | Create React App | Vite + React | Remix |
|---|---|---|---|---|
| **Server-Side Rendering** | Co san | Khong | Khong (can plugin) | Co san |
| **Static Site Generation** | Co san | Khong | Khong | Co san |
| **File-based Routing** | Co san | Khong (can react-router) | Khong | Co san |
| **API Routes** | Co san | Khong | Khong | Co san |
| **Image Optimization** | Co san | Khong | Khong | Khong |
| **TypeScript** | Co san | Co san | Co san | Co san |
| **Hot Reload** | Nhanh (Turbopack) | Cham | Rat nhanh | Nhanh |
| **SEO** | Tot (SSR/SSG) | Kem (CSR) | Kem (CSR) | Tot (SSR) |
| **Learning Curve** | Trung binh | Thap | Thap | Trung binh - Cao |
| **Community** | Rat lon | Lon (nhung da deprecated) | Lon | Dang phat trien |
| **Deploy** | Vercel (1 click) | Bat ky hosting | Bat ky hosting | Bat ky hosting |

### Next.js vs Create React App (CRA)

CRA đã chính thức bị **deprecated** (ngừng phát triển) từ năm 2023. React team khuyến nghị dùng framework như Next.js thay thế.

```bash
# CRA - Đã deprecated, không nên dùng cho dự án mới
npx create-react-app my-app

# Next.js - Được React team khuyến nghị
npx create-next-app@latest my-app
```

### Next.js vs Vite

Vite rất nhanh và nhẹ, nhưng nó chỉ là **build tool**, không phải framework:

```tsx
// Vite + React: Phải tự cài và cấu hình routing
// npm install react-router-dom
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}

// Next.js: Chỉ cần tạo file trong thư mục app/
// app/page.tsx → route "/"
// app/about/page.tsx → route "/about"
// Không cần cài thêm gì, không cần cấu hình!
```

### Next.js vs Remix

Remix cũng là React framework tốt, nhưng Next.js có lợi thế:

- **Cộng đồng lớn hơn** nhiều lần (GitHub stars, npm downloads)
- **Vercel** deploy cực dễ (1 click)
- **Tài liệu** phong phú hơn, nhiều tutorial tiếng Việt
- **Ecosystem** rộng hơn (thư viện hỗ trợ nhiều hơn)

## Các tính năng chính của Next.js

### 1. Server-Side Rendering (SSR)

HTML được tạo trên server mỗi khi có request. Tốt cho SEO và nội dung thay đổi thường xuyên.

```tsx
// app/products/page.tsx
// Mặc định trong App Router, component này chạy trên SERVER
async function ProductsPage() {
  // Fetch dữ liệu trên server — không lộ API key cho client
  const res = await fetch('https://api.example.com/products', {
    cache: 'no-store', // Luôn lấy dữ liệu mới nhất
  });
  const products = await res.json();

  return (
    <div>
      <h1>Sản phẩm</h1>
      {products.map((product: any) => (
        <div key={product.id}>
          <h2>{product.name}</h2>
          <p>{product.price} VND</p>
        </div>
      ))}
    </div>
  );
}

export default ProductsPage;
```

### 2. Static Site Generation (SSG)

HTML được tạo sẵn lúc build. Tốt cho nội dung ít thay đổi (blog, docs).

```tsx
// app/blog/page.tsx
// Dữ liệu được fetch lúc build và cache lại
async function BlogPage() {
  const res = await fetch('https://api.example.com/posts', {
    cache: 'force-cache', // Cache kết quả (mặc định)
  });
  const posts = await res.json();

  return (
    <div>
      <h1>Blog</h1>
      {posts.map((post: any) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  );
}

export default BlogPage;
```

### 3. File-based Routing

Không cần cấu hình routing. Tạo file = tạo route.

```
app/
├── page.tsx            → /
├── about/
│   └── page.tsx        → /about
├── blog/
│   ├── page.tsx        → /blog
│   └── [slug]/
│       └── page.tsx    → /blog/hello-world, /blog/my-post, ...
├── dashboard/
│   ├── layout.tsx      → Layout chung cho dashboard
│   ├── page.tsx        → /dashboard
│   └── settings/
│       └── page.tsx    → /dashboard/settings
```

### 4. API Routes

Viết backend API ngay trong dự án Next.js, không cần server riêng.

```tsx
// app/api/hello/route.ts
import { NextResponse } from 'next/server';

// GET /api/hello
export async function GET() {
  return NextResponse.json({
    message: 'Xin chào từ Next.js API!',
    timestamp: new Date().toISOString(),
  });
}

// POST /api/hello
export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({
    message: `Xin chào, ${body.name}!`,
  });
}
```

### 5. Image Optimization

Component `Image` tự động tối ưu hình ảnh (resize, lazy load, WebP).

```tsx
import Image from 'next/image';

function Avatar() {
  return (
    <Image
      src="/avatar.jpg"
      alt="Ảnh đại diện"
      width={200}
      height={200}
      priority // Tải ngay, không lazy load (dùng cho above-the-fold)
    />
  );
}
```

### 6. Middleware

Chạy code trước khi request đến page (authentication, redirect, ...).

```tsx
// middleware.ts (đặt ở root)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Kiểm tra token authentication
  const token = request.cookies.get('auth-token');

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    // Chưa đăng nhập → redirect về login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// Chỉ áp dụng middleware cho các route cụ thể
export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*'],
};
```

## Lịch sử phát triển Next.js

| Phien ban | Nam | Tinh nang noi bat |
|---|---|---|
| Next.js 1 | 2016 | Ra mắt với SSR cơ bản |
| Next.js 9 | 2019 | API Routes, Dynamic Routing |
| Next.js 10 | 2020 | Image Optimization, i18n |
| Next.js 12 | 2021 | Middleware, SWC compiler (thay Babel) |
| Next.js 13 | 2022 | **App Router**, Server Components, Turbopack |
| Next.js 14 | 2023 | Server Actions stable, Partial Prerendering |
| Next.js 15 | 2024 | React 19, Turbopack stable, cải thiện caching |

**Vercel** — công ty đứng sau Next.js — cũng cung cấp nền tảng deploy. Đội ngũ phát triển bao gồm nhiều thành viên core của React team.

## Khi nào nên dùng Next.js?

### Nên dùng

- **Website cần SEO**: Landing page, blog, e-commerce, trang tin tức
- **Ứng dụng full-stack**: Cần cả frontend và API backend
- **Dự án lớn**: Cần structure rõ ràng, dễ scale
- **Dự án team**: Convention rõ ràng, dễ onboard thành viên mới
- **Cần tốc độ**: Image optimization, code splitting tự động

### Không nên dùng

- **Ứng dụng mobile**: Dùng React Native thay thế
- **Dashboard nội bộ đơn giản**: Vite + React có thể đủ (không cần SEO)
- **Widget nhúng vào trang khác**: React thuần phù hợp hơn
- **Prototype nhanh**: Vite khởi tạo nhanh hơn cho demo đơn giản
- **Ứng dụng real-time thuần**: Socket.io + Express có thể linh hoạt hơn

## Hello World với Next.js

### Bước 1: Tạo dự án

```bash
# Tạo dự án mới với TypeScript
npx create-next-app@latest hello-nextjs --typescript --tailwind --app --eslint

# Di chuyển vào thư mục dự án
cd hello-nextjs

# Chạy development server
npm run dev
```

### Bước 2: Tạo trang đầu tiên

```tsx
// app/page.tsx
export default function HomePage() {
  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Xin chào Next.js!</h1>
      <p>Đây là trang web đầu tiên của tôi với Next.js</p>
      <p>Server-rendered, SEO-friendly, và cực kỳ nhanh!</p>
    </main>
  );
}
```

### Bước 3: Mở trình duyệt

Truy cập `http://localhost:3000` — bạn sẽ thấy trang Hello World!

```
Terminal sẽ hiển thị:
  ▲ Next.js 15.x
  - Local:    http://localhost:3000
  - Network:  http://192.168.x.x:3000

 ✓ Ready in 2.5s
```

## Lỗi thường gặp

### 1. Nhầm lẫn giữa React và Next.js

```tsx
// SAI: Nghĩ Next.js là thư viện khác React
// Next.js VẪN LÀ React — nó chỉ bổ sung thêm tính năng

// SAI: Import react-router-dom trong Next.js
import { BrowserRouter } from 'react-router-dom'; // KHÔNG CẦN!
// Next.js đã có hệ thống routing riêng

// ĐÚNG: Dùng Link của Next.js
import Link from 'next/link';

function Nav() {
  return (
    <nav>
      <Link href="/about">Về chúng tôi</Link>
    </nav>
  );
}
```

### 2. Chạy Next.js không có Node.js

```bash
# SAI: Chưa cài Node.js
npx create-next-app@latest my-app
# Error: command not found: npx

# ĐÚNG: Cài Node.js >= 18.17 trước
# Tải tại: https://nodejs.org
node -v  # Kiểm tra phiên bản
# v20.x.x
```

### 3. Dùng Pages Router trong dự án App Router

```
# SAI: Tạo file trong pages/ khi đang dùng App Router
pages/
└── index.tsx  ← Không hoạt động nếu đã có app/

# ĐÚNG: Dùng app/ directory
app/
└── page.tsx   ← Entry point cho route "/"
```

### 4. Quên export default

```tsx
// SAI: Named export — Next.js không nhận diện được page
export function HomePage() {
  return <h1>Home</h1>;
}

// ĐÚNG: Default export — bắt buộc cho page component
export default function HomePage() {
  return <h1>Home</h1>;
}
```

### 5. Dùng Create React App cho dự án mới

```bash
# SAI: CRA đã deprecated
npx create-react-app my-app
# Warning: Create React App is deprecated.

# ĐÚNG: Dùng Next.js hoặc Vite
npx create-next-app@latest my-app    # Full-stack framework
npm create vite@latest my-app -- --template react-ts  # SPA đơn giản
```

## Tổng kết

| Khai niem | Mo ta |
|---|---|
| Next.js | React framework cho production, bởi Vercel |
| SSR | Server-Side Rendering — tạo HTML trên server |
| SSG | Static Site Generation — tạo HTML lúc build |
| App Router | Hệ thống routing mới dùng thư mục `app/` |
| API Routes | Viết backend API trong cùng dự án Next.js |
| File-based Routing | Tạo file = tạo route, không cần cấu hình |

## Câu hỏi phỏng vấn

### Câu 1: Next.js là gì? Tại sao cần Next.js khi đã có React?

**Trả lời:**

Next.js là một React framework cho production, cung cấp sẵn các tính năng mà React thuần không có:

- **Server-Side Rendering (SSR)**: Tạo HTML trên server, tốt cho SEO
- **Static Site Generation (SSG)**: Tạo HTML lúc build, tối ưu performance
- **File-based Routing**: Không cần cài thêm thư viện routing
- **API Routes**: Viết backend trong cùng dự án
- **Image Optimization**: Tự động tối ưu hình ảnh
- **Zero Config**: TypeScript, ESLint, code splitting sẵn có

React chỉ là thư viện UI, còn Next.js là framework hoàn chỉnh để xây dựng ứng dụng web.

### Câu 2: Giải thích sự khác nhau giữa SSR, SSG, và CSR?

**Trả lời:**

```
CSR (Client-Side Rendering):
- HTML trống gửi cho client
- JavaScript download → render giao diện
- Chậm lần đầu, SEO kém
- Ví dụ: Create React App

SSR (Server-Side Rendering):
- Server tạo HTML cho MỖI request
- Client nhận HTML đầy đủ ngay lập tức
- SEO tốt, dữ liệu luôn mới
- Ví dụ: Next.js với cache: 'no-store'

SSG (Static Site Generation):
- HTML được tạo MỘT LẦN lúc build
- Serve file tĩnh — cực nhanh
- SEO tốt, nhưng dữ liệu có thể cũ
- Ví dụ: Next.js với cache: 'force-cache'
```

### Câu 3: So sánh Next.js App Router và Pages Router?

**Trả lời:**

| Tieu chi | App Router | Pages Router |
|---|---|---|
| Thu muc | `app/` | `pages/` |
| Component mac dinh | Server Components | Client Components |
| Layout | Nested layouts (`layout.tsx`) | `_app.tsx` (mot layout duy nhat) |
| Data fetching | `async/await` trong component | `getServerSideProps`, `getStaticProps` |
| Loading UI | `loading.tsx` tu dong | Tu code loading state |
| Error handling | `error.tsx` tu dong | Tu code error boundary |
| Streaming | Ho tro | Khong |

App Router là hướng đi tương lai của Next.js, được khuyến nghị cho dự án mới.

### Câu 4: Khi nào nên dùng Next.js, khi nào không?

**Trả lời:**

**Nên dùng khi:**
- Cần SEO (blog, e-commerce, landing page)
- Cần full-stack (frontend + API)
- Dự án lớn, cần structure rõ ràng
- Cần tối ưu performance (image, code splitting)

**Không nên khi:**
- Dashboard nội bộ không cần SEO (Vite đủ dùng)
- Ứng dụng mobile (dùng React Native)
- Widget nhúng vào trang khác
- Cần tự do cấu hình tuyệt đối (Next.js có nhiều convention)

### Câu 5: Vercel là gì? Có bắt buộc deploy Next.js trên Vercel không?

**Trả lời:**

Vercel là công ty tạo ra Next.js, đồng thời cung cấp nền tảng cloud để deploy. Tuy nhiên, bạn **không bắt buộc** phải dùng Vercel:

- **Vercel**: Deploy dễ nhất (1 click), tối ưu cho Next.js
- **AWS (Amplify, EC2)**: Phù hợp doanh nghiệp lớn
- **Docker**: Deploy trên bất kỳ server nào
- **Cloudflare Pages**: Edge runtime, miễn phí generous
- **Railway, Render**: Thay thế Vercel với pricing khác

Vercel có lợi thế vì họ hiểu Next.js sâu nhất, nhưng Next.js là open-source và chạy được mọi nơi.
