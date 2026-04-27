---
sidebar_position: 5
title: "5. TypeScript & Cấu hình"
---

# TypeScript & Cấu hình


---

## Mục lục

- [TypeScript trong Next.js](#typescript-trong-nextjs)
- [tsconfig.json giải thích chi tiết](#tsconfigjson-giải-thích-chi-tiết)
- [next.config.ts — Cấu hình Next.js](#nextconfigts-cấu-hình-nextjs)
- [Environment Variables](#environment-variables)
- [Path Aliases — Import gọn gàng](#path-aliases-import-gọn-gàng)
- [ESLint — Kiểm tra chất lượng code](#eslint-kiểm-tra-chất-lượng-code)
- [Prettier — Format code tự động](#prettier-format-code-tự-động)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tổng kết](#tổng-kết)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## TypeScript trong Next.js

Next.js có **built-in TypeScript support** — không cần cấu hình phức tạp. Khi tạo dự án với `create-next-app`, TypeScript đã sẵn sàng.

### Tại sao dùng TypeScript?

```
JavaScript:  → Lỗi phát hiện lúc CHẠY (runtime) → crash trên production
TypeScript:  → Lỗi phát hiện lúc VIẾT (compile time) → fix trước khi deploy
```

```tsx
// JavaScript — Không biết lỗi cho đến khi chạy
function getUser(id) {
  return fetch(`/api/users/${id}`); // id là gì? string? number?
}
getUser(true); // Lỗi, nhưng JS không báo!

// TypeScript — Lỗi phát hiện ngay lúc viết code
function getUser(id: number): Promise<User> {
  return fetch(`/api/users/${id}`).then(res => res.json());
}
getUser(true); // ❌ Type 'boolean' is not assignable to type 'number'
getUser(123);  // ✅ Đúng kiểu
```

### TypeScript với Next.js Components

```tsx
// Kiểu cho page props (App Router)
interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { page, sort } = await searchParams;

  return <div>Product {id}</div>;
}
```

```tsx
// Kiểu cho layout props
interface LayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: LayoutProps) {
  return (
    <div className="flex">
      <aside>Sidebar</aside>
      <main>{children}</main>
    </div>
  );
}
```

```tsx
// Kiểu cho API route
import { NextRequest, NextResponse } from 'next/server';

// Kiểu cho request body
interface CreateProductBody {
  name: string;
  price: number;
  description?: string; // optional
}

// Kiểu cho response
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateProductBody = await request.json();

    // TypeScript báo lỗi nếu thiếu field bắt buộc
    if (!body.name || !body.price) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }

    // Xử lý logic...
    const product = { id: '1', ...body };

    return NextResponse.json<ApiResponse<typeof product>>(
      { success: true, data: product },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Lỗi server' },
      { status: 500 }
    );
  }
}
```

### Kiểu dữ liệu thường dùng

```tsx
// types/index.ts — Tập trung các kiểu dùng chung

// Kiểu cho User
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;        // Optional field
  role: 'admin' | 'user'; // Union type (chỉ 2 giá trị)
  createdAt: string;       // ISO date string
}

// Kiểu cho Product
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];        // Array of URLs
  category: Category;      // Nested type
  inStock: boolean;
}

// Kiểu cho Category
export interface Category {
  id: string;
  name: string;
  slug: string;
}

// Kiểu cho paginated response
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Sử dụng
async function getProducts(): Promise<PaginatedResponse<Product>> {
  const res = await fetch('/api/products?page=1&limit=10');
  return res.json();
}
```

## tsconfig.json giải thích chi tiết

File `tsconfig.json` được `create-next-app` tạo sẵn. Dưới đây là giải thích từng option:

```json
{
  "compilerOptions": {
    // === Output ===
    "target": "ES2017",
    // Target JavaScript version. Next.js tự handle, không cần thay đổi.

    "lib": ["dom", "dom.iterable", "esnext"],
    // Thư viện TypeScript sử dụng:
    // "dom": Browser APIs (window, document, ...)
    // "esnext": Tính năng JS mới nhất

    // === Module ===
    "module": "esnext",
    // Hệ thống module: ES modules (import/export)

    "moduleResolution": "bundler",
    // Cách tìm module: theo kiểu bundler (Webpack/Turbopack)

    "resolveJsonModule": true,
    // Cho phép import file .json
    // import data from './data.json';

    // === Type Checking ===
    "strict": true,
    // Bật TẤT CẢ strict checks:
    // - noImplicitAny: Không cho dùng 'any' ngầm
    // - strictNullChecks: Bắt buộc xử lý null/undefined
    // - strictFunctionTypes: Kiểm tra kiểu function nghiêm ngặt

    "noEmit": true,
    // Không tạo file .js output (Next.js tự xử lý compilation)

    "noUnusedLocals": false,
    // Không báo lỗi khi có biến không dùng (đặt true nếu muốn nghiêm ngặt hơn)

    "noUnusedParameters": false,
    // Không báo lỗi khi có parameter không dùng

    // === Interop ===
    "allowJs": true,
    // Cho phép dùng file .js cùng .ts (hữu ích khi migrate dần)

    "esModuleInterop": true,
    // Cho phép import CommonJS modules như ES modules
    // import fs from 'fs'; thay vì import * as fs from 'fs';

    "isolatedModules": true,
    // Mỗi file được compile độc lập (yêu cầu của Next.js)

    "jsx": "preserve",
    // Giữ nguyên JSX, để Next.js compiler xử lý

    "incremental": true,
    // Build nhanh hơn bằng cách cache kết quả lần trước

    "skipLibCheck": true,
    // Bỏ qua type checking cho node_modules (build nhanh hơn)

    // === Path Aliases ===
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
      // Import alias: @/components/Button → src/components/Button
    },

    // === Next.js Plugin ===
    "plugins": [
      {
        "name": "next"
        // Next.js TypeScript plugin — cung cấp autocompletion cho
        // metadata, generateStaticParams, và các API Next.js
      }
    ]
  },

  "include": [
    "next-env.d.ts",     // Type declarations cho Next.js
    "**/*.ts",           // Tất cả file .ts
    "**/*.tsx",          // Tất cả file .tsx
    ".next/types/**/*.ts" // Types tự động từ Next.js
  ],

  "exclude": [
    "node_modules"       // Bỏ qua thư viện bên thứ ba
  ]
}
```

### Tùy chỉnh khuyến nghị

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

## next.config.ts — Cấu hình Next.js

File `next.config.ts` (hoặc `next.config.js`) là nơi cấu hình toàn bộ hành vi của Next.js.

### Cấu hình cơ bản

```tsx
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // === Cấu hình phổ biến ===

  // Cho phép tải ảnh từ domain bên ngoài
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.example.com',
        pathname: '/images/**', // Chỉ cho phép path cụ thể
      },
    ],
  },

  // Redirect URL
  async redirects() {
    return [
      {
        source: '/old-blog/:slug',  // URL cũ
        destination: '/blog/:slug', // URL mới
        permanent: true,            // 301 redirect (SEO-friendly)
      },
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Rewrite URL (ẩn URL thực)
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',              // URL người dùng thấy
        destination: 'https://api.example.com/:path*', // URL thực tế
      },
    ];
  },

  // Custom headers
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### Cấu hình nâng cao

```tsx
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Experimental features
  experimental: {
    // Server Actions (stable từ Next.js 14)
    serverActions: {
      bodySizeLimit: '2mb', // Giới hạn body size cho Server Actions
    },
  },

  // Output mode cho deployment
  output: 'standalone',
  // 'standalone': Tạo bản build độc lập (tốt cho Docker)
  // Mặc định: production build thông thường

  // Bật/tắt React Strict Mode
  reactStrictMode: true,

  // Bỏ qua lỗi TypeScript khi build (KHÔNG khuyến nghị)
  // typescript: {
  //   ignoreBuildErrors: true,
  // },

  // Bỏ qua lỗi ESLint khi build (KHÔNG khuyến nghị)
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },

  // Tắt x-powered-by header (bảo mật)
  poweredByHeader: false,

  // Trailing slash: /about/ thay vì /about
  trailingSlash: false,

  // Base path (khi app không ở root domain)
  // basePath: '/my-app', // Truy cập: example.com/my-app

  // Webpack configuration tùy chỉnh
  webpack: (config, { isServer }) => {
    // Thêm SVG loader
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
};

export default nextConfig;
```

## Environment Variables

Next.js hỗ trợ environment variables qua file `.env*` — quản lý cấu hình theo môi trường.

### Các file .env

```bash
# Thứ tự ưu tiên (cao → thấp):
# 1. .env.local         ← Override cho máy cá nhân (KHÔNG commit)
# 2. .env.development   ← Dùng khi npm run dev
# 3. .env.production    ← Dùng khi npm run build/start
# 4. .env               ← Mặc định cho mọi môi trường
```

### Quy tắc quan trọng: NEXT_PUBLIC_ prefix

```bash
# .env.local

# === Biến BÍ MẬT — chỉ server truy cập được ===
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
SECRET_API_KEY=sk-1234567890
JWT_SECRET=my-super-secret-jwt-key
STRIPE_SECRET_KEY=sk_test_abc123

# === Biến CÔNG KHAI — client cũng truy cập được ===
# Phải có prefix NEXT_PUBLIC_
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=GA-123456789
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_abc123
NEXT_PUBLIC_APP_NAME=My App
```

### Sử dụng trong code

```tsx
// === Server Component — truy cập TẤT CẢ biến ===
// app/page.tsx

export default async function HomePage() {
  // ✅ Biến bí mật — chỉ server mới truy cập được
  const dbUrl = process.env.DATABASE_URL;
  const apiKey = process.env.SECRET_API_KEY;

  // ✅ Biến công khai — cũng truy cập được trên server
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const res = await fetch(`${apiUrl}/products`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const products = await res.json();

  return <div>{products.length} sản phẩm</div>;
}
```

```tsx
// === Client Component — chỉ truy cập NEXT_PUBLIC_ ===
'use client';

export default function AnalyticsTracker() {
  // ✅ Biến công khai — client truy cập được
  const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

  // ❌ Biến bí mật — client KHÔNG truy cập được (undefined)
  const secret = process.env.SECRET_API_KEY; // undefined!

  return <div>GA ID: {gaId}</div>;
}
```

### Validate biến môi trường

```tsx
// lib/env.ts — Validate tất cả biến môi trường khi startup

// Kiểu cho biến môi trường server
interface ServerEnv {
  DATABASE_URL: string;
  JWT_SECRET: string;
  SECRET_API_KEY: string;
}

// Kiểu cho biến môi trường public
interface PublicEnv {
  NEXT_PUBLIC_API_URL: string;
  NEXT_PUBLIC_APP_NAME: string;
}

// Validate server env
function getServerEnv(): ServerEnv {
  const env = {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    SECRET_API_KEY: process.env.SECRET_API_KEY,
  };

  // Kiểm tra tất cả biến bắt buộc
  for (const [key, value] of Object.entries(env)) {
    if (!value) {
      throw new Error(`Thiếu biến môi trường: ${key}`);
    }
  }

  return env as ServerEnv;
}

// Validate public env
function getPublicEnv(): PublicEnv {
  const env = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  };

  for (const [key, value] of Object.entries(env)) {
    if (!value) {
      throw new Error(`Thiếu biến môi trường: ${key}`);
    }
  }

  return env as PublicEnv;
}

export const serverEnv = getServerEnv();
export const publicEnv = getPublicEnv();
```

## Path Aliases — Import gọn gàng

Path aliases giúp import code ngắn gọn, không cần đếm dấu `../`.

### Cấu hình trong tsconfig.json

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"],
      "@/hooks/*": ["./src/hooks/*"]
    }
  }
}
```

### So sánh trước và sau

```tsx
// SAI: Relative imports — khó đọc, dễ sai khi move file
import { Button } from '../../../components/ui/Button';
import { formatPrice } from '../../../../lib/utils';
import { Product } from '../../../types/product';

// ĐÚNG: Path aliases — gọn gàng, rõ ràng
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { Product } from '@/types/product';
```

## ESLint — Kiểm tra chất lượng code

Next.js đi kèm ESLint với cấu hình `next/core-web-vitals`.

### Cấu hình cơ bản

```json
// .eslintrc.json
{
  "extends": ["next/core-web-vitals", "next/typescript"]
}
```

`next/core-web-vitals` bao gồm:
- `eslint-plugin-react`: Rules cho React
- `eslint-plugin-react-hooks`: Kiểm tra hooks usage
- `eslint-plugin-next`: Rules riêng cho Next.js (Image, Link, Script, ...)
- Core Web Vitals: Cảnh báo các pattern ảnh hưởng performance

### Mở rộng cấu hình ESLint

```json
// .eslintrc.json — Cấu hình nâng cao
{
  "extends": [
    "next/core-web-vitals",
    "next/typescript"
  ],
  "rules": {
    // Cảnh báo khi dùng console.log (nên xóa trước khi deploy)
    "no-console": ["warn", { "allow": ["warn", "error"] }],

    // Bắt buộc dùng === thay vì ==
    "eqeqeq": "error",

    // Không cho dùng var (dùng const/let)
    "no-var": "error",

    // Ưu tiên const khi không cần reassign
    "prefer-const": "error",

    // Cảnh báo biến không dùng
    "@typescript-eslint/no-unused-vars": ["warn", {
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_"
    }],

    // Không cho dùng any (TypeScript)
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

### Chạy ESLint

```bash
# Kiểm tra code
npm run lint

# Tự động sửa lỗi có thể fix
npm run lint -- --fix

# Kiểm tra file cụ thể
npx next lint --file src/app/page.tsx
```

### ESLint rules quan trọng của Next.js

```tsx
// Rule: @next/next/no-html-link-for-pages
// SAI: Dùng thẻ <a> cho internal links
<a href="/about">About</a> // ❌ Mất client-side navigation

// ĐÚNG: Dùng Link component
import Link from 'next/link';
<Link href="/about">About</Link> // ✅ Client-side navigation


// Rule: @next/next/no-img-element
// SAI: Dùng thẻ <img> thông thường
<img src="/photo.jpg" alt="Photo" /> // ❌ Không tối ưu

// ĐÚNG: Dùng Image component
import Image from 'next/image';
<Image src="/photo.jpg" alt="Photo" width={800} height={600} /> // ✅ Tự tối ưu
```

## Prettier — Format code tự động

Prettier giúp code formatting thống nhất trong team.

### Cài đặt

```bash
npm install -D prettier eslint-config-prettier
```

### Cấu hình Prettier

```json
// .prettierrc (tạo ở root dự án)
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### Prettier ignore

```
// .prettierignore
node_modules
.next
out
build
coverage
public
```

### Tích hợp Prettier với ESLint

```json
// .eslintrc.json — Thêm prettier vào extends (CUỐI CÙNG)
{
  "extends": [
    "next/core-web-vitals",
    "next/typescript",
    "prettier"
  ]
}
```

`eslint-config-prettier` tắt các ESLint rules conflict với Prettier, tránh lỗi format chồng chéo.

### Scripts tiện lợi

```json
// package.json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "lint": "next lint",
    "lint:fix": "next lint --fix"
  }
}
```

```bash
# Format toàn bộ dự án
npm run format

# Kiểm tra format (CI/CD)
npm run format:check
```

## Lỗi thường gặp

### 1. Quên NEXT_PUBLIC_ prefix

```bash
# SAI: Biến không có prefix → client không truy cập được
# .env.local
API_URL=https://api.example.com

# Client Component
const url = process.env.API_URL; // undefined! ❌

# ĐÚNG: Thêm NEXT_PUBLIC_ prefix
NEXT_PUBLIC_API_URL=https://api.example.com

# Client Component
const url = process.env.NEXT_PUBLIC_API_URL; // "https://api.example.com" ✅
```

### 2. Commit file .env.local

```bash
# SAI: Commit bí mật vào git
git add .env.local  # ❌ NGUY HIỂM!

# ĐÚNG: Đảm bảo .gitignore có
# .env*.local
# .env.local
# .env.development.local
# .env.test.local
# .env.production.local
```

### 3. Dùng any quá nhiều

```tsx
// SAI: any everywhere — mất ý nghĩa TypeScript
const data: any = await fetch('/api/users').then(r => r.json());
data.forEach((item: any) => {
  console.log(item.whatever); // Không biết kiểu gì
});

// ĐÚNG: Định nghĩa kiểu rõ ràng
interface User {
  id: string;
  name: string;
  email: string;
}

const data: User[] = await fetch('/api/users').then(r => r.json());
data.forEach((user) => {
  console.log(user.name); // Autocomplete + type-safe
  console.log(user.whatever); // ❌ TypeScript báo lỗi ngay
});
```

### 4. Không dùng path aliases

```tsx
// SAI: Relative imports dài dòng
import { Button } from '../../../../components/ui/Button';
// Nếu move file → phải sửa lại tất cả import

// ĐÚNG: Path aliases
import { Button } from '@/components/ui/Button';
// Move file → import không thay đổi
```

### 5. Quên restart dev server sau khi thay đổi .env

```bash
# Thay đổi .env.local KHÔNG tự động cập nhật
# Phải restart dev server:
# Ctrl+C để dừng
npm run dev  # Chạy lại
```

### 6. ESLint và Prettier conflict

```json
// SAI: Không có eslint-config-prettier
// ESLint muốn dấu ; nhưng Prettier không muốn → conflict

// ĐÚNG: Thêm "prettier" vào cuối extends
{
  "extends": [
    "next/core-web-vitals",
    "prettier"   // ← PHẢI ở cuối cùng
  ]
}
```

## Tổng kết

| Khai niem | Mo ta |
|---|---|
| TypeScript | Built-in, type-safe, autocompletion |
| `tsconfig.json` | Cau hinh TypeScript (strict, paths, ...) |
| `next.config.ts` | Cau hinh Next.js (images, redirects, headers) |
| `.env` files | Bien moi truong theo environment |
| `NEXT_PUBLIC_` | Prefix cho bien client truy cap duoc |
| Path aliases (`@/`) | Import ngan gon thay vi `../../` |
| ESLint | Kiem tra chat luong code |
| Prettier | Tu dong format code |

## Câu hỏi phỏng vấn

### Câu 1: Giải thích cách environment variables hoạt động trong Next.js?

**Trả lời:**

Next.js hỗ trợ environment variables qua file `.env*`:

- **`.env`**: Mặc định cho mọi môi trường
- **`.env.local`**: Override cho máy cá nhân (không commit)
- **`.env.development`**: Dùng khi `npm run dev`
- **`.env.production`**: Dùng khi `npm run build/start`

Quy tắc quan trọng:
- Biến **không có** `NEXT_PUBLIC_` prefix chỉ server truy cập được (database URL, API keys bí mật)
- Biến **có** `NEXT_PUBLIC_` prefix cả server và client đều truy cập được (API URL công khai, Google Analytics ID)
- Thay đổi `.env` cần restart dev server

### Câu 2: Tại sao cần `NEXT_PUBLIC_` prefix? Chuyện gì xảy ra nếu không có?

**Trả lời:**

`NEXT_PUBLIC_` prefix là cơ chế bảo mật. Next.js **inline** (nhúng trực tiếp) giá trị biến có prefix này vào JavaScript bundle gửi cho client. Biến không có prefix bị **loại bỏ** khỏi client bundle.

Nếu không có prefix: biến có giá trị trên server nhưng `undefined` trên client. Đây là thiết kế có chủ đích để ngăn lộ bí mật (database password, API secret keys) cho browser.

### Câu 3: Path aliases là gì và cách cấu hình trong Next.js?

**Trả lời:**

Path aliases cho phép import module bằng đường dẫn ngắn gọn thay vì relative path:

```tsx
// Thay vì: import { Button } from '../../../components/Button'
// Viết:    import { Button } from '@/components/Button'
```

Cấu hình trong `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

`create-next-app` tự động cấu hình `@/` alias. Lợi ích: code dễ đọc, không bị hỏng khi di chuyển file, và IDE autocomplete hoạt động tốt.

### Câu 4: Giải thích `next.config.ts` và các options quan trọng?

**Trả lời:**

`next.config.ts` là file cấu hình trung tâm của Next.js:

- **`images.remotePatterns`**: Cho phép tải ảnh từ domain bên ngoài qua Image component
- **`redirects()`**: Chuyển hướng URL (301/302)
- **`rewrites()`**: Ẩn URL thực tế (proxy pattern)
- **`headers()`**: Thêm custom HTTP headers (CORS, security)
- **`output: 'standalone'`**: Tạo bản build độc lập cho Docker
- **`reactStrictMode`**: Bật React Strict Mode (phát hiện lỗi sớm)
- **`poweredByHeader: false`**: Ẩn header `X-Powered-By` (bảo mật)

### Câu 5: Làm thế nào để cấu hình ESLint và Prettier cùng nhau trong Next.js?

**Trả lời:**

1. Cài đặt: `npm install -D prettier eslint-config-prettier`
2. ESLint extends `next/core-web-vitals` (rules cho Next.js + React)
3. Thêm `"prettier"` vào **cuối** array `extends` trong `.eslintrc.json` — điều này tắt các ESLint rules conflict với Prettier
4. Tạo `.prettierrc` cho format rules (semi, quotes, tab width, ...)
5. Scripts: `lint` cho ESLint, `format` cho Prettier

Nguyên tắc: ESLint lo **logic** (unused variables, hooks rules), Prettier lo **formatting** (indentation, line length, quotes). Không để hai tool conflict nhau.
