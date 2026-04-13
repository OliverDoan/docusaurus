---
sidebar_position: 1
title: "1. Monorepo, Micro-frontends, Module Federation"
---

# Monorepo, Micro-frontends, Module Federation

Khi dự án frontend lớn dần, một trong những quyết định quan trọng nhất là **tổ chức codebase như thế nào**. Bạn sẽ dùng monorepo hay polyrepo? Tách thành micro-frontends hay giữ monolith? Bài này sẽ giúp bạn trả lời những câu hỏi phỏng vấn thực tế về kiến trúc frontend ở level Senior.

---

## Câu 1: Monorepo vs Polyrepo -- khi nào dùng cái nào? `[Senior]`

### Giải thích lý thuyết

**Monorepo** là cách tổ chức toàn bộ code của nhiều project/package vào **một repository duy nhất**. Ngược lại, **Polyrepo** tách mỗi project/package thành **một repository riêng biệt**.

Nghe đơn giản, nhưng quyết định này ảnh hưởng đến mọi thứ: CI/CD pipeline, dependency management, code sharing, developer experience...

**Monorepo không có nghĩa là monolith.** Trong monorepo, bạn vẫn có nhiều package/app độc lập, chỉ là chúng nằm chung một repo.

### Bảng so sánh Monorepo vs Polyrepo

| Tiêu chí | Monorepo | Polyrepo |
|----------|----------|----------|
| **Code sharing** | Dễ dàng, import trực tiếp | Phải publish npm package |
| **Dependency management** | Thống nhất version | Mỗi repo tự quản lý |
| **CI/CD** | Phức tạp hơn (cần affected detection) | Đơn giản, mỗi repo có pipeline riêng |
| **Refactoring** | Atomic changes across packages | Phải coordinate nhiều PRs |
| **Onboarding** | Clone 1 repo là có hết | Phải biết repo nào làm gì |
| **Git history** | Lớn, cần sparse checkout | Gọn, focused |
| **Team autonomy** | Thấp hơn (shared rules) | Cao (mỗi team tự quyết) |
| **Tooling** | Cần Nx/Turborepo/Lerna | Standard git workflow |
| **Phù hợp** | 1 team hoặc nhiều team làm chung product | Nhiều team độc lập, ít share code |

### Code ví dụ

Cấu trúc monorepo với Nx:

```
my-workspace/
├── apps/
│   ├── web-app/           # React app chính
│   ├── admin-dashboard/   # Admin app
│   └── mobile-app/        # React Native app
├── packages/
│   ├── ui/                # Shared UI components
│   ├── utils/             # Shared utilities
│   ├── api-client/        # Shared API layer
│   └── types/             # Shared TypeScript types
├── nx.json
├── package.json
└── tsconfig.base.json
```

Config Turborepo (`turbo.json`):

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {},
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

Config Nx (`nx.json`):

```json
{
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "cache": true
    },
    "test": {
      "cache": true
    }
  },
  "affected": {
    "defaultBase": "main"
  }
}
```

### Bảng so sánh Monorepo Tools

| Tool | Ưu điểm | Nhược điểm | Phù hợp |
|------|---------|------------|---------|
| **Nx** | Full-featured, computation caching, generators | Learning curve cao, opinionated | Enterprise, large teams |
| **Turborepo** | Đơn giản, nhanh, remote caching | Ít features hơn Nx | Small-medium teams |
| **Lerna** | Mature, flexible | Chậm hơn, ít maintain (nay thuộc Nx) | Legacy projects |
| **pnpm workspaces** | Lightweight, built-in | Chỉ là package manager, không có task runner | Minimal setup |

### Đáp án mẫu

> "Monorepo phù hợp khi team cần share nhiều code giữa các app -- ví dụ shared UI library, API client, TypeScript types. Tôi đã dùng Turborepo cho dự án có 3 app (web, admin, docs) cùng share 1 design system. Lợi ích lớn nhất là atomic refactoring -- khi đổi API của shared component, tôi update tất cả consumers trong 1 PR. Tuy nhiên, nếu các team hoàn toàn độc lập và ít share code, polyrepo cho team autonomy tốt hơn. Quan trọng là phải có affected detection (Nx/Turborepo) để CI không build lại toàn bộ monorepo mỗi lần commit."

---

## Câu 2: Micro-frontends là gì? Khi nào nên dùng? `[Senior]`

### Giải thích lý thuyết

**Micro-frontends** là pattern chia một ứng dụng frontend lớn thành nhiều ứng dụng nhỏ độc lập, mỗi cái do **một team sở hữu và deploy riêng**. Ý tưởng tương tự microservices ở backend.

Mỗi micro-frontend có thể:
- Dùng **framework khác nhau** (team A dùng React, team B dùng Vue)
- **Deploy độc lập** mà không ảnh hưởng team khác
- Có **lifecycle riêng** (build, test, release)

### Các cách triển khai Micro-frontends

**1. Build-time integration (npm packages):**

```typescript
// Package: @company/header
export function Header() {
  return <header>Company Header</header>;
}

// App shell: import từ npm
import { Header } from '@company/header';
import { ProductList } from '@company/product-catalog';

function App() {
  return (
    <div>
      <Header />
      <ProductList />
    </div>
  );
}
```

**2. Runtime integration (iframe):**

```html
<iframe src="https://team-a.company.com/header"></iframe>
<iframe src="https://team-b.company.com/products"></iframe>
```

**3. Runtime integration (JavaScript):**

```html
<!-- App shell loads micro-frontends at runtime -->
<div id="header-container"></div>
<div id="product-container"></div>

<script src="https://team-a.cdn.com/header/bundle.js"></script>
<script src="https://team-b.cdn.com/products/bundle.js"></script>

<script>
  // Mỗi micro-frontend tự mount vào container
  window.headerApp.mount(document.getElementById('header-container'));
  window.productApp.mount(document.getElementById('product-container'));
</script>
```

**4. Module Federation (Webpack 5) -- phổ biến nhất:**

```javascript
// webpack.config.js của Host App
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        headerApp: 'headerApp@https://team-a.cdn.com/remoteEntry.js',
        productApp: 'productApp@https://team-b.cdn.com/remoteEntry.js',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
};
```

### Đáp án mẫu

> "Micro-frontends giải quyết vấn đề scaling teams -- khi bạn có 5-10 team cùng contribute vào 1 frontend monolith, bottleneck không phải kỹ thuật mà là coordination. Tôi sẽ chọn micro-frontends khi: (1) có nhiều team độc lập, (2) cần deploy riêng từng phần, (3) app đủ lớn để justify overhead. Tuy nhiên, micro-frontends có trade-offs: bundle size tăng do duplicate dependencies, UX consistency khó hơn, và debugging cross-boundary phức tạp. Với team nhỏ (dưới 20 dev), monolith hoặc monorepo thường là lựa chọn tốt hơn."

---

## Câu 3: Module Federation hoạt động như thế nào? `[Senior]`

### Giải thích lý thuyết

**Module Federation** là tính năng của Webpack 5 cho phép một ứng dụng JavaScript **load code từ ứng dụng khác tại runtime**. Không cần npm publish, không cần build lại -- cứ deploy là app kia tự nhận code mới.

Các khái niệm chính:
- **Host**: App tiêu thụ (consume) remote modules
- **Remote**: App cung cấp (expose) modules cho host
- **Shared**: Dependencies dùng chung (React, lodash...)
- **remoteEntry.js**: File manifest của remote, chứa metadata về các modules exposed

### Code ví dụ

**Remote App (team-header)** -- expose `Header` component:

```javascript
// webpack.config.js
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  output: {
    publicPath: 'https://team-header.cdn.com/',
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'headerApp',
      filename: 'remoteEntry.js',
      exposes: {
        './Header': './src/components/Header',
        './UserMenu': './src/components/UserMenu',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
      },
    }),
  ],
};
```

**Host App (shell)** -- consume remote modules:

```javascript
// webpack.config.js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        headerApp: 'headerApp@https://team-header.cdn.com/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
      },
    }),
  ],
};
```

**Sử dụng trong React:**

```typescript
// Lazy load remote component
const RemoteHeader = React.lazy(() => import('headerApp/Header'));
const RemoteUserMenu = React.lazy(() => import('headerApp/UserMenu'));

function App() {
  return (
    <div>
      <React.Suspense fallback={<div>Loading header...</div>}>
        <RemoteHeader />
      </React.Suspense>

      <main>
        <h1>Main App Content</h1>
      </main>

      <React.Suspense fallback={<div>Loading menu...</div>}>
        <RemoteUserMenu />
      </React.Suspense>
    </div>
  );
}
```

**Type declarations cho remote modules:**

```typescript
// src/types/remotes.d.ts
declare module 'headerApp/Header' {
  const Header: React.ComponentType<{
    title?: string;
    showLogo?: boolean;
  }>;
  export default Header;
}

declare module 'headerApp/UserMenu' {
  const UserMenu: React.ComponentType<{
    userId: string;
  }>;
  export default UserMenu;
}
```

### Đáp án mẫu

> "Module Federation cho phép load JavaScript modules từ app khác tại runtime qua file remoteEntry.js. Khi host app cần một remote module, Webpack fetch remoteEntry.js để biết module nằm ở đâu, rồi download chunk tương ứng. Shared dependencies (như React) được negotiate giữa host và remote -- nếu cả hai dùng cùng version, chỉ load 1 lần. Điểm mạnh là deploy independent: team header deploy version mới, shell app tự nhận mà không cần rebuild. Tuy nhiên cần cẩn thận với version mismatch của shared deps và cần fallback UI khi remote không available."

---

## Câu 4: Quản lý packages trong monorepo như thế nào? `[Intermediate]`

### Giải thích lý thuyết

Package management trong monorepo phức tạp hơn single repo vì bạn phải xử lý **internal dependencies** (package A depend on package B trong cùng repo) và **external dependencies** (npm packages).

Hai vấn đề chính:
1. **Hoisting**: Dependencies được pull lên root `node_modules` để tránh duplicate
2. **Workspaces**: Cơ chế để package manager hiểu cấu trúc monorepo

### Code ví dụ

**pnpm workspaces** (`pnpm-workspace.yaml`):

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**Package.json của shared UI package:**

```json
{
  "name": "@mycompany/ui",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

**Sử dụng internal package trong app:**

```json
{
  "name": "@mycompany/web-app",
  "dependencies": {
    "@mycompany/ui": "workspace:*",
    "@mycompany/utils": "workspace:*",
    "@mycompany/api-client": "workspace:*"
  }
}
```

**TypeScript path aliases** (`tsconfig.base.json` ở root):

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@mycompany/ui": ["packages/ui/src/index.ts"],
      "@mycompany/utils": ["packages/utils/src/index.ts"],
      "@mycompany/api-client": ["packages/api-client/src/index.ts"]
    }
  }
}
```

**Versioning với Changesets:**

```bash
# Developer tạo changeset mô tả thay đổi
npx changeset

# CI tự động bump version và publish
npx changeset version
npx changeset publish
```

### Đáp án mẫu

> "Tôi dùng pnpm workspaces vì strict mode của nó ngăn phantom dependencies -- package chỉ access được dependency mà nó khai báo. Internal packages reference nhau qua `workspace:*` protocol, TypeScript hiểu qua path aliases trong tsconfig.base.json. Để versioning, tôi dùng Changesets -- developer tạo changeset file mô tả thay đổi, CI tự bump version. Quan trọng là phải dùng `peerDependencies` cho shared libs như React để tránh bundle duplicate."

---

## Câu 5: Code sharing strategies giữa các app? `[Intermediate]`

### Giải thích lý thuyết

Khi có nhiều app (web, mobile, admin...), bạn muốn share code nhưng phải cân nhắc **share cái gì** và **share như thế nào**. Share quá nhiều tạo coupling, share quá ít tạo duplication.

### Các tầng code sharing

```
┌─────────────────────────────────────┐
│         App-specific code           │  ← Không share
├─────────────────────────────────────┤
│     Feature modules (optional)      │  ← Share nếu cùng domain
├─────────────────────────────────────┤
│     UI Components (design system)   │  ← Share UI
├─────────────────────────────────────┤
│     Business logic / hooks          │  ← Share logic
├─────────────────────────────────────┤
│     Utilities / helpers             │  ← Share utils
├─────────────────────────────────────┤
│     Types / interfaces              │  ← Luôn share
└─────────────────────────────────────┘
```

### Code ví dụ

**Shared types package:**

```typescript
// packages/types/src/user.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'editor';
  createdAt: Date;
}

export interface CreateUserDTO {
  email: string;
  name: string;
  role: User['role'];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

**Shared API client:**

```typescript
// packages/api-client/src/user-api.ts
import type { User, CreateUserDTO, ApiResponse } from '@mycompany/types';

const BASE_URL = process.env.API_URL || 'https://api.mycompany.com';

export async function fetchUser(id: string): Promise<ApiResponse<User>> {
  const response = await fetch(`${BASE_URL}/users/${id}`);
  return response.json();
}

export async function createUser(
  data: CreateUserDTO
): Promise<ApiResponse<User>> {
  const response = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}
```

**Shared React hook (dùng ở cả web và mobile):**

```typescript
// packages/hooks/src/useUser.ts
import { useState, useEffect } from 'react';
import { fetchUser } from '@mycompany/api-client';
import type { User } from '@mycompany/types';

export function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const result = await fetchUser(userId);

      if (cancelled) return;

      if (result.success && result.data) {
        setUser(result.data);
      } else {
        setError(result.error || 'Failed to fetch user');
      }
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [userId]);

  return { user, loading, error };
}
```

### Đáp án mẫu

> "Tôi chia code sharing thành layers: types luôn share (zero runtime cost), utils/helpers share khi logic thực sự chung, UI components share qua design system package. Nguyên tắc là share interface chứ không share implementation -- ví dụ shared types + API client, nhưng UI rendering khác nhau giữa web và mobile. Để tránh coupling, mỗi shared package phải có API boundary rõ ràng, export qua barrel file, và dùng peerDependencies cho framework deps."

---

## Câu 6: Làm sao quyết định kiến trúc frontend cho dự án mới? `[Senior]`

### Giải thích lý thuyết

Đây là câu hỏi "system design" điển hình. Interviewer muốn xem bạn **tư duy về trade-offs** chứ không phải nhớ thuộc lòng kiến trúc nào đó.

### Framework ra quyết định

```
Team size?
├── 1-5 devs → Monolith (Next.js/Remix)
├── 5-15 devs → Monorepo (Nx/Turborepo)
└── 15+ devs → Micro-frontends (nếu cần team autonomy)

Bao nhiêu apps?
├── 1 app → Monolith
├── 2-5 apps share code → Monorepo
└── 5+ apps, teams độc lập → Micro-frontends

Deploy frequency?
├── 1 team, cùng deploy → Monolith/Monorepo
└── Nhiều team, deploy riêng → Micro-frontends
```

### Bảng Decision Matrix

| Yếu tố | Monolith | Monorepo | Micro-frontends |
|---------|----------|----------|-----------------|
| Team 1-5 | Tốt nhất | OK | Overkill |
| Team 5-15 | Khó scale | Tốt nhất | OK |
| Team 15+ | Bottleneck | OK | Tốt nhất |
| Setup cost | Thấp | Trung bình | Cao |
| Maintenance | Thấp | Trung bình | Cao |
| Performance | Tốt nhất | Tốt | Cần optimize |
| DX | Đơn giản | Tốt | Phức tạp |

### Đáp án mẫu

> "Tôi sẽ hỏi ngược lại: team size bao nhiêu, bao nhiêu apps, deploy frequency ra sao. Với startup 5 dev và 1 product, Next.js monolith là đủ -- đừng over-engineer. Khi grow lên 10-15 dev và cần admin dashboard + docs site, chuyển sang Turborepo monorepo. Chỉ khi có 20+ dev, 4-5 teams independent mới cần micro-frontends. Nguyên tắc: start simple, evolve when needed. Kiến trúc tốt nhất là kiến trúc phù hợp với team hiện tại, không phải team bạn hy vọng sẽ có."

---

## Lỗi thường gặp khi trả lời

1. **Nhầm monorepo với monolith.** Monorepo là cách tổ chức repository, monolith là cách tổ chức application. Bạn có thể có monorepo chứa nhiều microservices.

2. **Recommend micro-frontends cho mọi dự án.** Micro-frontends có overhead lớn (bundle size, complexity, debugging). Chỉ dùng khi team scale justify nó.

3. **Không nhắc đến trade-offs.** Mỗi approach đều có pros/cons. Nếu chỉ nói ưu điểm mà không nhắc nhược điểm, interviewer sẽ đánh giá bạn thiếu kinh nghiệm thực tế.

4. **Quên shared dependencies trong Module Federation.** Nếu không config `shared` đúng, host và remote load 2 bản React khác nhau, gây lỗi hooks và tăng bundle size.

5. **Nói "monorepo dùng Lerna" mà không biết Lerna gần như deprecated** (nay thuộc Nx ecosystem). Tools hiện đại là Nx, Turborepo, hoặc pnpm workspaces.
