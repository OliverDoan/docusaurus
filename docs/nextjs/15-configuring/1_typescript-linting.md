---
sidebar_position: 1
title: "1. TypeScript, ESLint, Environment Variables"
---

# TypeScript, ESLint, Environment Variables

Bài này giới thiệu các công cụ cấu hình nền tảng cho dự án Next.js: **TypeScript** (ngôn ngữ thêm kiểu dữ liệu cho JavaScript để bắt lỗi sớm), **ESLint** (công cụ kiểm tra và cảnh báo lỗi/phong cách code) và **environment variables** (biến môi trường: giá trị cấu hình như khoá API tách khỏi mã nguồn). Nắm vững những thứ này giúp người mới viết code an toàn, nhất quán và dễ bảo trì hơn.

---

## Mục lục

- [TypeScript Setup](#typescript-setup)
- [Generated Types](#generated-types)
- [ESLint](#eslint)
- [Prettier](#prettier)
- [Environment Variables](#environment-variables)
- [Markdown / MDX](#markdown--mdx)

---

## TypeScript Setup

Next.js có TypeScript **first-class** — `create-next-app` setup sẵn.

```bash
npx create-next-app@latest --typescript
```

`tsconfig.json` mặc định:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Run type check:

```bash
npx tsc --noEmit
```

`npm run build` cũng chạy type check.

---

## Generated Types

Next.js generate types tự động:

- **`next-env.d.ts`** — global types cho Next.js.
- **`.next/types/`** — type cho page params, route segment.

```tsx
// app/blog/[slug]/page.tsx
import type { Metadata } from "next";

// Type được generate dựa folder structure
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
};

export default async function Page({ params, searchParams }: Props) {
  const { slug } = await params;
  const { q } = await searchParams;
  // ...
}
```

:::info[Phân tích]

**TypedRoutes** (experimental) — type-safe link:

```ts
// next.config.ts
export default {
  experimental: {
    typedRoutes: true,
  },
};
```

```tsx
import Link from "next/link";

<Link href="/dashboard" />              // OK
<Link href="/typo-dashboard" />         // Type error
<Link href={`/blog/${slug}`} />         // OK với dynamic route
<Link href="/blog/[slug]" />            // Type error (cần param thật)
```

Tương lai sẽ stable. Pair với TanStack Router → type-safe routing trong
toàn React ecosystem.

:::

---

## ESLint

Next.js đi kèm config:

```bash
npx create-next-app@latest --eslint
```

`eslint.config.mjs` (flat config Next.js 15+):

```js
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];
```

Rules quan trọng từ `next/core-web-vitals`:

- `@next/next/no-img-element` — dùng `<Image>` thay `<img>`.
- `@next/next/no-page-custom-font` — dùng `next/font`.
- `@next/next/no-html-link-for-pages` — dùng `<Link>`.
- `react-hooks/rules-of-hooks`.
- `react-hooks/exhaustive-deps`.

Run:

```bash
npm run lint
npm run lint -- --fix
```

---

## Prettier

```bash
npm install -D prettier eslint-config-prettier
```

`.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

`prettier-plugin-tailwindcss` — sort Tailwind class theo recommendation
order tự động.

VS Code setting:

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

---

## Environment Variables

`.env.local` — local dev (gitignored):

```env
DATABASE_URL=postgresql://localhost:5432/mydb
JWT_SECRET=...
STRIPE_SECRET_KEY=sk_test_...

NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_GA_ID=G-XXX
```

Priority:

```
.env.production.local
.env.local
.env.production / .env.development
.env
```

`.env.local` **chỉ load local** — không production. `.env.production.local`
cho production secret.

**Type-safe env** (khuyến nghị):

```ts
// env.ts
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),

  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
});
```

```ts
import { env } from "@/env";

const db = new Client(env.DATABASE_URL); // type-safe + validated
```

:::info[Phân tích]

**`@t3-oss/env-nextjs`** — package chuyên cho env validation Next.js:

```ts
// env.ts
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(32),
  },
  client: {
    NEXT_PUBLIC_API_URL: z.string().url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
});
```

Lợi ích:

- **Separation** server/client tường minh.
- **Build-time check** — fail build nếu env thiếu/sai.
- **Type-safe** — autocomplete.
- **Prevent leak** — server env không lộ client.

:::

:::warning[Cần lưu ý]

**`NEXT_PUBLIC_*` được inline vào client bundle tại build time**:

```env
NEXT_PUBLIC_API_URL=https://api.example.com
```

```tsx
// Code
const url = process.env.NEXT_PUBLIC_API_URL;

// Compiled
const url = "https://api.example.com";  // hardcoded
```

→ Đổi env value cần **rebuild**. Không thể đổi runtime.

Nếu cần config runtime cho client → fetch từ API route:

```ts
// app/api/config/route.ts
export async function GET() {
  return Response.json({
    apiUrl: process.env.API_URL,
    features: { newUI: true },
  });
}
```

```tsx
"use client";
const { data: config } = useQuery({
  queryKey: ["config"],
  queryFn: () => fetch("/api/config").then(r => r.json()),
});
```

:::

---

## Markdown / MDX

Next.js hỗ trợ MDX native:

```bash
npm install @next/mdx @mdx-js/loader @mdx-js/react @types/mdx
```

```ts
// next.config.ts
import withMDX from "@next/mdx";

export default withMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})({
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
});
```

```mdx
{/* app/about/page.mdx */}
import { Highlight } from "@/components/Highlight";

# About

This is **MDX** with <Highlight>React components</Highlight>.
```

`page.mdx` → render như `page.tsx`.

**Content-heavy site** thường dùng:

- **next-mdx-remote** — MDX runtime, dùng cho dynamic content (blog từ DB).
- **Contentlayer 2** — content + type-safe.
- **Velite** — successor của Contentlayer.

:::tip[Mẹo]

**Pattern blog site**:

```
content/
└── posts/
    ├── post-1.mdx
    └── post-2.mdx

app/
├── blog/
│   ├── page.tsx              # list posts
│   └── [slug]/page.tsx        # render MDX
└── lib/
    └── posts.ts               # parse MDX, frontmatter
```

```ts
// app/lib/posts.ts
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export async function getPosts() {
  const dir = path.join(process.cwd(), "content/posts");
  const files = await fs.readdir(dir);

  return Promise.all(files.map(async (file) => {
    const raw = await fs.readFile(path.join(dir, file), "utf-8");
    const { data, content } = matter(raw);
    return {
      slug: file.replace(".mdx", ""),
      title: data.title as string,
      date: data.date as string,
      content,
    };
  }));
}
```

Velite / Contentlayer auto handle phần này + type-safe schema.

:::
