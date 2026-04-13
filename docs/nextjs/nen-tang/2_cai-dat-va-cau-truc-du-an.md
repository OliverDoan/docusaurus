---
sidebar_position: 2
title: "2. Cài đặt title: "Cài đặt & Cấu trúc dự án" Cấu trúc dự án"
---

# Cài đặt & Cấu trúc dự án

## Yêu cầu hệ thống

Trước khi bắt đầu, đảm bảo máy bạn đã cài:

```bash
# Kiểm tra Node.js (cần >= 18.17)
node -v
# v20.x.x hoặc cao hơn

# Kiểm tra npm (đi kèm Node.js)
npm -v
# 10.x.x

# Kiểm tra npx (đi kèm npm)
npx -v
# 10.x.x
```

Nếu chưa có Node.js, tải tại [nodejs.org](https://nodejs.org) — chọn phiên bản **LTS** (Long Term Support).

## Cài đặt với create-next-app

### Cách 1: Interactive mode (được hỏi từng bước)

```bash
npx create-next-app@latest
```

Terminal sẽ hỏi bạn:

```
What is your project named? my-app
Would you like to use TypeScript? Yes
Would you like to use ESLint? Yes
Would you like to use Tailwind CSS? Yes
Would you like your code inside a `src/` directory? Yes
Would you like to use App Router? (recommended) Yes
Would you like to use Turbopack for next dev? Yes
Would you like to customize the import alias (@/* by default)? No
```

**Khuyến nghị cho người mới**: Chọn Yes cho tất cả, đây là cấu hình tối ưu nhất.

### Cách 2: Một lệnh duy nhất (skip interactive)

```bash
# Tạo dự án với tất cả options được bật
npx create-next-app@latest my-app \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --turbopack \
  --import-alias "@/*"
```

### Cách 3: Dùng template có sẵn

```bash
# Template từ GitHub repository
npx create-next-app@latest my-app --example https://github.com/vercel/next.js/tree/canary/examples/with-docker

# Template từ examples chính thức
npx create-next-app@latest my-app --example blog-starter
```

### Sau khi tạo xong

```bash
# Di chuyển vào thư mục dự án
cd my-app

# Chạy development server
npm run dev

# Mở trình duyệt: http://localhost:3000
```

## Cấu trúc thư mục chi tiết

Sau khi chạy `create-next-app`, bạn sẽ có cấu trúc thư mục như sau:

```
my-app/
├── .next/                  # Thư mục build (tự động tạo, KHÔNG commit)
├── node_modules/           # Dependencies (tự động tạo, KHÔNG commit)
├── public/                 # File tĩnh (ảnh, favicon, fonts, ...)
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/                    # Source code chính
│   └── app/                # App Router — nơi viết code chính
│       ├── fonts/          # Custom fonts
│       ├── favicon.ico     # Icon tab trình duyệt
│       ├── globals.css     # CSS toàn cục
│       ├── layout.tsx      # Root layout (bắt buộc)
│       └── page.tsx        # Trang chủ (route "/")
├── .eslintrc.json          # Cấu hình ESLint
├── .gitignore              # File không commit vào git
├── next-env.d.ts           # TypeScript declarations cho Next.js
├── next.config.ts          # Cấu hình Next.js
├── package.json            # Dependencies và scripts
├── postcss.config.mjs      # Cấu hình PostCSS (cho Tailwind)
├── README.md               # Tài liệu dự án
├── tailwind.config.ts      # Cấu hình Tailwind CSS
└── tsconfig.json           # Cấu hình TypeScript
```

### Giải thích từng thư mục quan trọng

### Thư mục `public/`

Chứa file tĩnh được serve trực tiếp. Không qua quá trình build.

```
public/
├── images/
│   ├── logo.png         # Truy cập: /images/logo.png
│   └── banner.jpg       # Truy cập: /images/banner.jpg
├── fonts/
│   └── custom-font.woff2
├── favicon.ico           # Icon tab trình duyệt
└── robots.txt            # Hướng dẫn cho search engine crawler
```

```tsx
// Sử dụng file trong public/ — đường dẫn bắt đầu từ "/"
import Image from 'next/image';

function Logo() {
  return (
    <Image
      src="/images/logo.png"  // Tự động trỏ đến public/images/logo.png
      alt="Logo công ty"
      width={150}
      height={50}
    />
  );
}
```

### Thư mục `src/app/` (App Router)

Đây là nơi chứa toàn bộ code chính của ứng dụng:

```
src/app/
├── layout.tsx          # Root layout — bọc TẤT CẢ các trang
├── page.tsx            # Trang chủ — route "/"
├── globals.css         # CSS toàn cục
├── not-found.tsx       # Trang 404 tùy chỉnh
├── loading.tsx         # Loading UI cho trang chủ
├── error.tsx           # Error UI cho trang chủ
├── about/
│   └── page.tsx        # Route "/about"
├── blog/
│   ├── page.tsx        # Route "/blog"
│   ├── layout.tsx      # Layout riêng cho blog
│   └── [slug]/
│       └── page.tsx    # Route "/blog/bai-viet-1", "/blog/bai-viet-2", ...
├── api/
│   └── users/
│       └── route.ts    # API endpoint: GET/POST /api/users
└── (auth)/             # Route group — không ảnh hưởng URL
    ├── login/
    │   └── page.tsx    # Route "/login" (không phải "/(auth)/login")
    └── register/
        └── page.tsx    # Route "/register"
```

### Thư mục `.next/`

Thư mục build tự động tạo khi chạy `npm run dev` hoặc `npm run build`. **Không bao giờ commit** thư mục này.

```bash
# .gitignore đã tự động bao gồm
.next
```

## Scripts trong package.json

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### Giải thích từng script

```bash
# 1. Development server (dùng khi code)
npm run dev
# - Chạy ở http://localhost:3000
# - Hot reload: thay đổi code → tự động cập nhật trình duyệt
# - Turbopack: bundler mới, nhanh hơn webpack
# - Hiển thị lỗi trực tiếp trên trình duyệt

# 2. Build cho production (trước khi deploy)
npm run build
# - Tạo bản build tối ưu trong thư mục .next/
# - Minify code, tree-shake, tối ưu hình ảnh
# - Kiểm tra lỗi TypeScript và ESLint
# - Tạo static pages cho SSG routes

# 3. Start production server (sau khi build)
npm run start
# - Chạy bản build production
# - PHẢI chạy npm run build trước
# - Không có hot reload
# - Dùng để test production trước khi deploy

# 4. Lint (kiểm tra code style)
npm run lint
# - Chạy ESLint với cấu hình Next.js
# - Kiểm tra lỗi code, best practices
# - Tự động fix được một số lỗi: npm run lint -- --fix
```

### Custom scripts hữu ích

Bạn có thể thêm scripts sau vào `package.json`:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "clean": "rm -rf .next node_modules",
    "analyze": "ANALYZE=true next build"
  }
}
```

## Dependencies trong package.json

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next": "15.1.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "eslint": "^8",
    "eslint-config-next": "15.1.0"
  }
}
```

### Giải thích dependencies

```
dependencies (cần cho production):
├── react          → Thư viện UI core
├── react-dom      → React cho môi trường browser
└── next           → Framework Next.js

devDependencies (chỉ cần khi phát triển):
├── typescript         → Ngôn ngữ TypeScript
├── @types/node        → Type definitions cho Node.js
├── @types/react       → Type definitions cho React
├── @types/react-dom   → Type definitions cho React DOM
├── postcss            → CSS processor (cho Tailwind)
├── tailwindcss        → Utility-first CSS framework
├── eslint             → Linter kiểm tra code
└── eslint-config-next → ESLint rules cho Next.js
```

## Quy ước đặt tên file trong Next.js

Next.js dùng **convention-over-configuration** — tên file quyết định chức năng:

### Các file đặc biệt trong App Router

| File | Chuc nang | Bat buoc? |
|---|---|---|
| `page.tsx` | Nội dung trang, tạo route truy cập được | Co (de tao route) |
| `layout.tsx` | Layout bọc xung quanh page và children | Co (root layout) |
| `loading.tsx` | Loading UI hiển thị khi trang đang tải | Khong |
| `error.tsx` | Error UI hiển thị khi có lỗi | Khong |
| `not-found.tsx` | Trang 404 tùy chỉnh | Khong |
| `template.tsx` | Giống layout nhưng re-render mỗi lần navigate | Khong |
| `route.ts` | API endpoint (GET, POST, PUT, DELETE) | Khong |
| `default.tsx` | Fallback cho parallel routes | Khong |
| `global-error.tsx` | Error UI cho root layout | Khong |
| `middleware.ts` | Chạy code trước mỗi request (ở root) | Khong |

### Ví dụ từng file đặc biệt

#### `page.tsx` — Nội dung trang

```tsx
// app/about/page.tsx
// Route: /about

export default function AboutPage() {
  return (
    <div>
      <h1>Về chúng tôi</h1>
      <p>Đây là trang giới thiệu công ty.</p>
    </div>
  );
}
```

#### `layout.tsx` — Layout dùng chung

```tsx
// app/layout.tsx — Root layout (BẮT BUỘC)
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My App',
  description: 'Ứng dụng Next.js của tôi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <header>
          <nav>Thanh điều hướng</nav>
        </header>
        <main>{children}</main>
        <footer>Footer</footer>
      </body>
    </html>
  );
}
```

#### `loading.tsx` — Loading UI

```tsx
// app/dashboard/loading.tsx
// Hiển thị tự động khi dashboard đang tải

export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      <p className="ml-4">Đang tải dữ liệu...</p>
    </div>
  );
}
```

#### `error.tsx` — Error UI

```tsx
// app/dashboard/error.tsx
'use client'; // Error component BẮT BUỘC là Client Component

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="text-center py-10">
      <h2>Đã xảy ra lỗi!</h2>
      <p className="text-red-500">{error.message}</p>
      <button
        onClick={() => reset()} // Thử render lại
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Thử lại
      </button>
    </div>
  );
}
```

#### `not-found.tsx` — Trang 404

```tsx
// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-xl mt-4">Trang bạn tìm không tồn tại</p>
      <Link
        href="/"
        className="mt-6 inline-block px-6 py-3 bg-blue-500 text-white rounded"
      >
        Về trang chủ
      </Link>
    </div>
  );
}
```

#### `route.ts` — API Route

```tsx
// app/api/products/route.ts
import { NextResponse } from 'next/server';

// Danh sách sản phẩm mẫu
const products = [
  { id: 1, name: 'iPhone 15', price: 25000000 },
  { id: 2, name: 'MacBook Pro', price: 55000000 },
];

// GET /api/products
export async function GET() {
  return NextResponse.json({ data: products });
}

// POST /api/products
export async function POST(request: Request) {
  const body = await request.json();

  // Validate input
  if (!body.name || !body.price) {
    return NextResponse.json(
      { error: 'Thiếu tên hoặc giá sản phẩm' },
      { status: 400 }
    );
  }

  const newProduct = {
    id: products.length + 1,
    name: body.name,
    price: body.price,
  };

  return NextResponse.json({ data: newProduct }, { status: 201 });
}
```

## Cấu trúc dự án thực tế (khuyến nghị)

Khi dự án lớn lên, bạn nên tổ chức theo feature:

```
src/
├── app/                    # Routes và pages
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (marketing)/        # Route group: landing, pricing, ...
│   │   ├── page.tsx
│   │   └── pricing/
│   │       └── page.tsx
│   ├── (shop)/             # Route group: products, cart, ...
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── cart/
│   │       └── page.tsx
│   └── api/
│       └── products/
│           └── route.ts
├── components/             # Shared components
│   ├── ui/                 # UI primitives (Button, Input, Modal, ...)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   ├── layout/             # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   └── features/           # Feature-specific components
│       ├── ProductCard.tsx
│       └── CartItem.tsx
├── lib/                    # Utility functions, API clients
│   ├── utils.ts
│   ├── api.ts
│   └── constants.ts
├── hooks/                  # Custom React hooks
│   ├── useDebounce.ts
│   └── useLocalStorage.ts
├── types/                  # TypeScript type definitions
│   ├── product.ts
│   └── user.ts
└── styles/                 # Global styles
    └── globals.css
```

## Lỗi thường gặp

### 1. Quên cài Node.js đúng phiên bản

```bash
# SAI: Node.js cũ
node -v
# v16.x.x  ← Quá cũ cho Next.js 15!

# ĐÚNG: Cần Node.js >= 18.17
# Dùng nvm để quản lý nhiều phiên bản Node.js
nvm install 20
nvm use 20
node -v
# v20.x.x ✓
```

### 2. Chạy npm start mà chưa build

```bash
# SAI: Chưa build mà chạy production
npm run start
# Error: Could not find a production build

# ĐÚNG: Build trước, rồi start
npm run build
npm run start
```

### 3. Đặt file sai vị trí

```
# SAI: Đặt page.tsx ở root app/ nhưng muốn route /about
src/app/about.tsx          ← Không tạo route /about!

# ĐÚNG: Tạo thư mục about/ chứa page.tsx
src/app/about/page.tsx     ← Route /about ✓
```

### 4. Nhầm lẫn src/ và không src/

```
# Nếu chọn src/ directory khi tạo dự án:
src/app/page.tsx           ← Đúng

# Nếu KHÔNG chọn src/ directory:
app/page.tsx               ← Đúng

# SAI: Tạo cả hai
src/app/page.tsx           ← Next.js dùng cái này
app/page.tsx               ← Bị bỏ qua! Gây nhầm lẫn
```

### 5. Commit thư mục .next và node_modules

```bash
# Kiểm tra .gitignore có đầy đủ:
cat .gitignore

# Phải có:
# .next
# node_modules
# .env*.local

# Nếu đã lỡ commit, xóa khỏi git:
git rm -r --cached .next node_modules
git commit -m "chore: remove build artifacts from git"
```

### 6. Port 3000 đã bị chiếm

```bash
# SAI: Cố chạy khi port 3000 đang được dùng
npm run dev
# Error: Port 3000 is already in use

# ĐÚNG: Dùng port khác
npm run dev -- --port 3001

# Hoặc tìm và tắt process đang dùng port 3000
# macOS/Linux:
lsof -i :3000
kill -9 <PID>
```

## Tổng kết

| Khai niem | Mo ta |
|---|---|
| `create-next-app` | CLI tool tạo dự án Next.js |
| `app/` directory | Thư mục chứa routes (App Router) |
| `public/` | File tĩnh serve trực tiếp |
| `page.tsx` | Entry point cho mỗi route |
| `layout.tsx` | Layout bọc xung quanh page |
| `loading.tsx` | Loading UI tự động |
| `error.tsx` | Error handling UI |
| `route.ts` | API endpoint |
| `npm run dev` | Chạy development server |
| `npm run build` | Build cho production |

## Câu hỏi phỏng vấn

### Câu 1: Giải thích cấu trúc thư mục của một dự án Next.js App Router?

**Trả lời:**

Một dự án Next.js App Router có cấu trúc chính:

- **`app/`**: Chứa routes và pages. Mỗi thư mục con với `page.tsx` tạo thành một route.
- **`public/`**: File tĩnh (ảnh, fonts, favicon) — truy cập trực tiếp qua URL.
- **`components/`** (tự tạo): Shared components dùng chung.
- **`lib/`** (tự tạo): Utility functions, API clients.
- **`next.config.ts`**: Cấu hình Next.js (redirects, images, env, ...).
- **`tsconfig.json`**: Cấu hình TypeScript.
- **`package.json`**: Dependencies và scripts.

Các file đặc biệt trong `app/`: `page.tsx` (nội dung trang), `layout.tsx` (layout chung), `loading.tsx` (loading UI), `error.tsx` (error UI), `not-found.tsx` (404), `route.ts` (API).

### Câu 2: Sự khác nhau giữa `page.tsx`, `layout.tsx`, và `template.tsx`?

**Trả lời:**

- **`page.tsx`**: Nội dung chính của route. Mỗi route cần đúng một `page.tsx`. Là leaf node trong route tree.
- **`layout.tsx`**: Layout bọc xung quanh page và các child routes. **Giữ state khi navigate** giữa các child routes (không re-render). Root layout bắt buộc có.
- **`template.tsx`**: Giống layout nhưng **re-render mỗi lần navigate**. Dùng khi cần animation enter/exit hoặc reset state khi chuyển trang.

### Câu 3: File nào trong thư mục `public/` không cần import?

**Trả lời:**

Tất cả file trong `public/` đều không cần import — chúng được serve trực tiếp qua URL. Ví dụ:
- `public/logo.png` truy cập qua `/logo.png`
- `public/images/banner.jpg` truy cập qua `/images/banner.jpg`

Tuy nhiên, khi dùng component `Image` của Next.js, vẫn nên dùng vì nó tự động tối ưu hình ảnh (resize, lazy load, WebP format).

### Câu 4: Giải thích sự khác nhau giữa `npm run dev` và `npm run start`?

**Trả lời:**

- **`npm run dev`**: Chạy development server với hot reload, error overlay trên trình duyệt, không tối ưu performance. Dùng khi đang phát triển.
- **`npm run start`**: Chạy production server từ bản build đã tối ưu. **Phải chạy `npm run build` trước**. Dùng khi deploy hoặc test production.

Sự khác biệt chính: dev mode có hot reload và error messages chi tiết, production mode được minify và tối ưu tốc độ.

### Câu 5: Làm thế nào để thêm một route mới trong Next.js App Router?

**Trả lời:**

Chỉ cần tạo thư mục mới trong `app/` với file `page.tsx`:

```bash
# Tạo route /products
mkdir -p src/app/products
# Tạo file page.tsx trong thư mục products/
```

```tsx
// src/app/products/page.tsx
export default function ProductsPage() {
  return <h1>Danh sách sản phẩm</h1>;
}
```

Không cần cấu hình routing, không cần import vào file nào. Next.js tự động nhận diện và tạo route `/products`.
