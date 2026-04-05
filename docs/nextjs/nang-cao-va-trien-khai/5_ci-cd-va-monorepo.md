---
sidebar_position: 5
title: "CI/CD & Monorepo"
---

# CI/CD & Monorepo

## Tổng quan

Khi dự án Next.js phát triển lớn hơn, bạn cần:
- **CI/CD** (Continuous Integration / Continuous Deployment) để tự động test và deploy
- **Monorepo** để quản lý nhiều packages/apps trong cùng repository

## GitHub Actions cho Next.js

### Workflow cơ bản: Build & Test

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      # Checkout code
      - uses: actions/checkout@v4

      # Setup Node.js
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      # Cài đặt dependencies
      - run: npm ci

      # Kiểm tra TypeScript
      - run: npm run typecheck

      # Chạy linter
      - run: npm run lint

      # Chạy unit tests
      - run: npm test -- --coverage

      # Build production
      - run: npm run build

      # Upload coverage report
      - uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
```

### Workflow: Deploy to Vercel

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run build
      - run: npm test

      # Deploy bằng Vercel CLI
      - name: Deploy to Vercel
        run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Preview Deployment cho Pull Requests

```yaml
# .github/workflows/preview.yml
name: Preview Deployment

on:
  pull_request:
    branches: [main]

jobs:
  preview:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run build

      # Deploy preview
      - name: Deploy Preview
        id: deploy
        run: |
          url=$(npx vercel --token=${{ secrets.VERCEL_TOKEN }})
          echo "preview_url=$url" >> $GITHUB_OUTPUT
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

      # Comment preview URL lên PR
      - name: Comment on PR
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `Preview deployed: ${{ steps.deploy.outputs.preview_url }}`
            })
```

### E2E Testing trong CI

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  e2e:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      # Cài Playwright browsers
      - run: npx playwright install --with-deps

      # Build app
      - run: npm run build

      # Chạy E2E tests
      - run: npx playwright test

      # Upload test results nếu fail
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

## Caching trong CI

### Cache node_modules

```yaml
# Cách 1: Built-in cache của setup-node
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm' # Tự động cache ~/.npm

# Cách 2: Cache thủ công (kiểm soát nhiều hơn)
- uses: actions/cache@v3
  with:
    path: |
      ~/.npm
      .next/cache
    key: ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-${{ hashFiles('**/*.ts', '**/*.tsx') }}
    restore-keys: |
      ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-
      ${{ runner.os }}-nextjs-
```

### Cache Next.js build

```yaml
# Cache .next/cache để tăng tốc build
- uses: actions/cache@v3
  with:
    path: .next/cache
    key: nextjs-cache-${{ hashFiles('**/package-lock.json') }}-${{ hashFiles('**/*.ts', '**/*.tsx') }}
    restore-keys: |
      nextjs-cache-${{ hashFiles('**/package-lock.json') }}-
      nextjs-cache-
```

## Turborepo cho Monorepo

### Turborepo là gì?

Turborepo (by Vercel) là build system cho JavaScript/TypeScript monorepos. Nó tối ưu hóa bằng:
- **Caching**: Cache build output, không build lại nếu code không đổi
- **Parallel execution**: Chạy tasks song song khi có thể
- **Pipeline**: Định nghĩa thứ tự tasks (build trước, test sau)

### Setup Turborepo với Next.js

```bash
# Tạo monorepo mới
npx create-turbo@latest my-monorepo

# Hoặc thêm vào project hiện tại
npm install turbo --save-dev
```

### Cấu trúc Monorepo

```
my-monorepo/
├── apps/
│   ├── web/                    # Next.js app chính
│   │   ├── app/
│   │   ├── next.config.js
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── admin/                  # Next.js admin panel
│   │   ├── app/
│   │   ├── next.config.js
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── docs/                   # Documentation site
│       └── package.json
├── packages/
│   ├── ui/                     # Shared UI components
│   │   ├── src/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── utils/                  # Shared utilities
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── database/               # Prisma schema & client
│   │   ├── prisma/
│   │   ├── src/
│   │   └── package.json
│   ├── eslint-config/          # Shared ESLint config
│   │   ├── next.js
│   │   ├── library.js
│   │   └── package.json
│   └── typescript-config/      # Shared tsconfig
│       ├── base.json
│       ├── nextjs.json
│       └── package.json
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

### turbo.json — Pipeline Configuration

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["build"],
      "inputs": ["src/**/*.tsx", "src/**/*.ts", "test/**/*.ts"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

### Giải thích pipeline

| Key | Ý nghĩa |
|-----|---------|
| `dependsOn: ["^build"]` | Build packages phụ thuộc trước (ký hiệu `^` = dependencies) |
| `outputs` | Files cần cache (kết quả build) |
| `inputs` | Files theo dõi thay đổi (invalidate cache) |
| `cache: false` | Không cache task này (dev server) |
| `persistent: true` | Task chạy liên tục (dev server) |

## pnpm Workspaces

### Setup

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### Root package.json

```json
{
  "name": "my-monorepo",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "test": "turbo test",
    "typecheck": "turbo typecheck"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

### Package references

```json
// apps/web/package.json
{
  "name": "@myorg/web",
  "dependencies": {
    "@myorg/ui": "workspace:*",
    "@myorg/utils": "workspace:*",
    "@myorg/database": "workspace:*",
    "next": "^14.0.0",
    "react": "^18.0.0"
  }
}
```

```json
// packages/ui/package.json
{
  "name": "@myorg/ui",
  "version": "0.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "react": "^18.0.0"
  },
  "devDependencies": {
    "@myorg/typescript-config": "workspace:*"
  }
}
```

## Shared Packages

### Shared UI Components

```tsx
// packages/ui/src/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-lg transition-colors';

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

```tsx
// packages/ui/src/index.ts — Export tất cả components
export { Button } from './Button';
export { Card } from './Card';
export { Input } from './Input';
export { Modal } from './Modal';
```

### Sử dụng trong app

```tsx
// apps/web/app/page.tsx
import { Button, Card } from '@myorg/ui';

export default function Home() {
  return (
    <Card>
      <h1>Welcome</h1>
      <Button variant="primary">Bắt đầu</Button>
    </Card>
  );
}
```

### Shared TypeScript Config

```json
// packages/typescript-config/base.json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "incremental": true
  },
  "exclude": ["node_modules"]
}
```

```json
// packages/typescript-config/nextjs.json
{
  "extends": "./base.json",
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "noEmit": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "plugins": [{ "name": "next" }]
  }
}
```

```json
// apps/web/tsconfig.json
{
  "extends": "@myorg/typescript-config/nextjs.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## CI/CD cho Monorepo

### GitHub Actions với Turborepo

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      # Setup pnpm
      - uses: pnpm/action-setup@v2
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install

      # Turborepo remote caching (tùy chọn)
      - name: Build
        run: pnpm turbo build
        env:
          TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
          TURBO_TEAM: ${{ vars.TURBO_TEAM }}

      - name: Lint
        run: pnpm turbo lint

      - name: Test
        run: pnpm turbo test

      - name: Typecheck
        run: pnpm turbo typecheck
```

### Filtered builds (chỉ build packages bị thay đổi)

```yaml
# Chỉ build app web nếu code thay đổi
- name: Build Web
  run: pnpm turbo build --filter=@myorg/web...

# Build tất cả packages bị ảnh hưởng bởi changes
- name: Build Affected
  run: pnpm turbo build --filter=...[HEAD^1]
```

## Environment Management

### Quản lý env vars trong monorepo

```
my-monorepo/
├── .env                    # Shared env vars (committed, non-secret)
├── .env.local              # Local overrides (gitignored)
├── apps/
│   ├── web/
│   │   ├── .env            # Web-specific defaults
│   │   └── .env.local      # Web-specific local overrides
│   └── admin/
│       ├── .env
│       └── .env.local
```

```bash
# turbo.json — khai báo env vars cho caching
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "env": ["DATABASE_URL", "NEXT_PUBLIC_API_URL"],
      "outputs": [".next/**"]
    }
  }
}
```

### Vercel Environment Variables

```bash
# Set env var cho project trên Vercel
vercel env add DATABASE_URL production
vercel env add DATABASE_URL preview
vercel env add DATABASE_URL development

# Pull env vars xuống local
vercel env pull .env.local
```

## Lỗi thường gặp

### 1. Quên cache .next trong CI

```yaml
# BAD: Build lại từ đầu mỗi lần
- run: npm run build

# GOOD: Cache .next/cache
- uses: actions/cache@v3
  with:
    path: .next/cache
    key: nextjs-${{ hashFiles('package-lock.json') }}
- run: npm run build
```

### 2. Import trực tiếp từ package source

```tsx
// BAD: Import file cụ thể (dễ vỡ khi refactor)
import { Button } from '@myorg/ui/src/components/Button';

// GOOD: Import từ package entry point
import { Button } from '@myorg/ui';
```

### 3. Không khai báo env vars trong turbo.json

```json
// BAD: Turbo không biết env var ảnh hưởng build → cache sai
{
  "pipeline": {
    "build": {
      "outputs": [".next/**"]
    }
  }
}

// GOOD: Khai báo env vars để invalidate cache đúng
{
  "pipeline": {
    "build": {
      "env": ["DATABASE_URL", "NEXT_PUBLIC_*"],
      "outputs": [".next/**"]
    }
  }
}
```

### 4. Dependency version mismatch trong monorepo

```json
// BAD: Các apps dùng version React khác nhau
// apps/web/package.json: "react": "^18.0.0"
// apps/admin/package.json: "react": "^17.0.0"

// GOOD: Dùng pnpm catalog hoặc syncpack
// pnpm-workspace.yaml
// catalog:
//   react: ^18.0.0
//   react-dom: ^18.0.0
```

## Monorepo Best Practices

| Practice | Mô tả |
|----------|--------|
| Shared configs | TypeScript, ESLint, Prettier configs dùng chung |
| Package boundaries | Mỗi package có API rõ ràng qua exports |
| Workspace protocol | Dùng `workspace:*` cho internal dependencies |
| Incremental builds | Turborepo cache và chỉ build phần thay đổi |
| Consistent versions | Giữ dependency versions đồng nhất giữa packages |
| CI caching | Cache node_modules, .next/cache, và Turborepo cache |

## Tổng kết

```
CI/CD Pipeline:
  Push code → Lint → Typecheck → Test → Build → Deploy
                                                  ↓
                                          [Vercel / Self-host]

Monorepo Structure:
  apps/     → Next.js applications
  packages/ → Shared code (UI, utils, configs)
  turbo.json → Build pipeline & caching
```

## Câu hỏi phỏng vấn

### Câu 1: CI/CD là gì? Tại sao cần cho Next.js project?

**Trả lời:**

CI (Continuous Integration) là quy trình tự động chạy tests, linting, và build mỗi khi có code mới. CD (Continuous Deployment) tự động deploy code đã pass CI lên production.

Cần CI/CD cho Next.js vì:
- Đảm bảo code luôn build được trước khi merge
- Phát hiện lỗi TypeScript, lint errors sớm
- Chạy tests tự động, không bỏ sót
- Deploy tự động, giảm rủi ro human error
- Preview deployments cho PR review

### Câu 2: Turborepo cache hoạt động thế nào?

**Trả lời:**

Turborepo tạo hash từ inputs (source files, env vars, dependencies) cho mỗi task. Nếu hash giống lần build trước, Turborepo replay cached output thay vì chạy lại task.

Cache levels:
1. **Local cache** (`.turbo/`): Cache trên máy local
2. **Remote cache** (Vercel): Chia sẻ cache giữa CI runs và team members

Pipeline `dependsOn` xác định thứ tự task, đảm bảo dependencies được build trước.

### Câu 3: Monorepo vs Polyrepo — khi nào chọn cái nào?

**Trả lời:**

**Monorepo** khi:
- Nhiều apps chia sẻ code chung (UI, utils, types)
- Team nhỏ-trung bình, cần collaboration chặt chẽ
- Muốn atomic changes across packages
- Ví dụ: web app + admin panel + shared component library

**Polyrepo** khi:
- Các projects độc lập, ít chia sẻ code
- Teams lớn, mỗi team own một service
- Cần deploy cycle riêng biệt
- Ví dụ: microservices architecture

### Câu 4: Làm sao chia sẻ code giữa các Next.js apps trong monorepo?

**Trả lời:**

1. Tạo packages trong `packages/` directory (UI components, utilities, types)
2. Export qua `package.json` entry points
3. Reference bằng `workspace:*` protocol trong dependencies
4. Cấu hình `transpilePackages` trong `next.config.js` nếu package chưa được build
5. Dùng shared TypeScript config để đảm bảo consistency

### Câu 5: GitHub Actions workflow nào là tối thiểu cho Next.js project?

**Trả lời:**

Workflow tối thiểu cần:
1. **Trigger**: push to main + pull_request
2. **Setup**: checkout, setup-node, install dependencies
3. **Quality**: lint + typecheck
4. **Test**: unit tests
5. **Build**: `npm run build` (sẽ catch broken links, import errors)
6. **Cache**: node_modules và `.next/cache` để tăng tốc

Nâng cao thêm: E2E tests, preview deployments, coverage reports.
