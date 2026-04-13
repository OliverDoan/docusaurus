---
sidebar_position: 3
title: "3. Điều hướng title: "Điều hướng & Link" Link"
---

# Điều hướng & Link

## Tổng quan các cách điều hướng

Next.js cung cấp nhiều cách điều hướng (navigation), mỗi cách phù hợp với tình huống khác nhau:

| Cách | Loại | Khi nào dùng |
|------|------|-------------|
| `Link` component | Client | Điều hướng thông thường (click) |
| `useRouter` hook | Client | Điều hướng lập trình (programmatic) |
| `redirect()` | Server | Redirect trong Server Component / Server Action |
| `permanentRedirect()` | Server | Redirect vĩnh viễn (301) |
| `usePathname` | Client | Lấy URL path hiện tại |
| `useSearchParams` | Client | Lấy query string hiện tại |
| Native History API | Client | Thay đổi URL không reload |

## Link Component

`Link` từ `next/link` là cách **chính và phổ biến nhất** để điều hướng. Nó extends thẻ HTML `<a>` với prefetching và client-side navigation.

### Sử dụng cơ bản

```tsx
import Link from "next/link";

export default function Navigation() {
  return (
    <nav className="flex gap-4 p-4">
      {/* Link đơn giản */}
      <Link href="/">Trang chủ</Link>

      {/* Link đến trang con */}
      <Link href="/about">Giới thiệu</Link>

      {/* Link với dynamic segment */}
      <Link href="/blog/bai-viet-dau-tien">Bài viết</Link>

      {/* Link đến section cụ thể (anchor) */}
      <Link href="/docs#getting-started">Bắt đầu</Link>
    </nav>
  );
}
```

### Prefetching — Tải trước nội dung

Link tự động **prefetch** route mà nó trỏ đến khi link xuất hiện trong viewport. Điều này giúp navigation gần như **tức thì**.

```tsx
import Link from "next/link";

export default function BlogList() {
  return (
    <ul>
      {/* Prefetch tự động khi link hiện trong viewport */}
      <li>
        <Link href="/blog/post-1">Bài 1</Link>
      </li>

      {/* Tắt prefetch — hữu ích cho danh sách dài */}
      <li>
        <Link href="/blog/post-2" prefetch={false}>
          Bài 2
        </Link>
      </li>

      {/* Prefetch full page data (không chỉ layout) */}
      <li>
        <Link href="/blog/post-3" prefetch={true}>
          Bài 3 (tải đầy đủ)
        </Link>
      </li>
    </ul>
  );
}
```

Hành vi prefetch mặc định:
- **Static routes**: Prefetch toàn bộ route data
- **Dynamic routes**: Chỉ prefetch đến shared layout gần nhất (partial rendering)
- `prefetch={true}`: Luôn prefetch toàn bộ
- `prefetch={false}`: Không prefetch

### Link với dynamic routes

```tsx
import Link from "next/link";

type Product = {
  id: number;
  name: string;
  slug: string;
  category: string;
};

export default function ProductList({
  products,
}: {
  products: Product[];
}) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/shop/${product.category}/${product.slug}`}
          className="border rounded-lg p-4 hover:shadow-lg transition"
        >
          <h3>{product.name}</h3>
          <p>Xem chi tiết</p>
        </Link>
      ))}
    </div>
  );
}
```

### Link với query string

```tsx
import Link from "next/link";

export default function Pagination({
  currentPage,
  totalPages,
  category,
}: {
  currentPage: number;
  totalPages: number;
  category?: string;
}) {
  return (
    <div className="flex gap-2">
      {/* Trang trước */}
      {currentPage > 1 && (
        <Link
          href={{
            pathname: "/products",
            query: {
              ...(category && { category }),
              page: currentPage - 1,
            },
          }}
        >
          Trang trước
        </Link>
      )}

      {/* Số trang */}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
        (page) => (
          <Link
            key={page}
            href={{
              pathname: "/products",
              query: {
                ...(category && { category }),
                page,
              },
            }}
            className={
              page === currentPage
                ? "font-bold text-blue-600"
                : "text-gray-600"
            }
          >
            {page}
          </Link>
        )
      )}

      {/* Trang sau */}
      {currentPage < totalPages && (
        <Link
          href={{
            pathname: "/products",
            query: {
              ...(category && { category }),
              page: currentPage + 1,
            },
          }}
        >
          Trang sau
        </Link>
      )}
    </div>
  );
}
```

### replace — Không thêm vào history

```tsx
import Link from "next/link";

// replace={true}: Thay thế entry hiện tại trong browser history
// User bấm Back sẽ không quay lại trang này
<Link href="/dashboard" replace>
  Đi tới Dashboard (thay thế history)
</Link>
```

### scroll — Kiểm soát scroll behavior

```tsx
import Link from "next/link";

// Mặc định: scroll lên đầu trang khi navigate
<Link href="/about">Giới thiệu</Link>

// scroll={false}: Giữ nguyên vị trí scroll
<Link href="/about" scroll={false}>
  Giới thiệu (không scroll)
</Link>
```

## useRouter Hook

`useRouter` dùng cho **điều hướng lập trình** (programmatic navigation) — khi cần navigate dựa trên logic, không phải click.

**Lưu ý quan trọng:** `useRouter` chỉ dùng trong **Client Components** (có `"use client"`).

```tsx
"use client";

import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const response = await fetch("/api/login", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      // Navigate đến dashboard sau khi login thành công
      router.push("/dashboard");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" placeholder="Email" />
      <input name="password" type="password" placeholder="Mật khẩu" />
      <button type="submit">Đăng nhập</button>
    </form>
  );
}
```

### Các methods của useRouter

```tsx
"use client";

import { useRouter } from "next/navigation";

export default function NavigationDemo() {
  const router = useRouter();

  return (
    <div className="space-y-4">
      {/* push: Navigate đến URL mới (thêm vào history) */}
      <button onClick={() => router.push("/dashboard")}>
        Đi tới Dashboard
      </button>

      {/* replace: Navigate nhưng thay thế history entry hiện tại */}
      <button onClick={() => router.replace("/login")}>
        Đi tới Login (replace)
      </button>

      {/* back: Quay lại trang trước (giống nút Back) */}
      <button onClick={() => router.back()}>
        Quay lại
      </button>

      {/* forward: Đi tới trang tiếp theo (giống nút Forward) */}
      <button onClick={() => router.forward()}>
        Đi tới
      </button>

      {/* refresh: Refresh route hiện tại (re-fetch data từ server) */}
      <button onClick={() => router.refresh()}>
        Làm mới dữ liệu
      </button>

      {/* prefetch: Tải trước route (cải thiện tốc độ navigate) */}
      <button
        onMouseEnter={() => router.prefetch("/settings")}
        onClick={() => router.push("/settings")}
      >
        Cài đặt (prefetch khi hover)
      </button>
    </div>
  );
}
```

### Ví dụ thực tế: Redirect sau form submission

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreatePostForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        body: JSON.stringify({
          title: formData.get("title"),
          content: formData.get("content"),
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Tạo bài viết thất bại");
      }

      const post = await response.json();

      // Redirect đến bài viết vừa tạo
      router.push(`/blog/${post.slug}`);

      // Hoặc quay về danh sách và refresh data
      // router.push('/blog');
      // router.refresh(); // Re-fetch server data
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Có lỗi xảy ra"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        name="title"
        placeholder="Tiêu đề bài viết"
        required
        className="w-full p-2 border rounded"
      />
      <textarea
        name="content"
        placeholder="Nội dung..."
        rows={10}
        required
        className="w-full p-2 border rounded"
      />
      {error && <p className="text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {isSubmitting ? "Đang tạo..." : "Tạo bài viết"}
      </button>
    </form>
  );
}
```

## redirect() — Server-side Redirect

`redirect()` dùng trong **Server Components**, **Server Actions**, và **Route Handlers** để redirect user.

```tsx
// app/dashboard/page.tsx — Server Component
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getUser();

  // Redirect nếu chưa đăng nhập
  if (!user) {
    redirect("/login");
    // Code sau redirect() sẽ KHÔNG chạy
  }

  // Redirect nếu chưa hoàn thành onboarding
  if (!user.hasCompletedOnboarding) {
    redirect("/onboarding");
  }

  return (
    <div>
      <h1>Xin chào, {user.name}!</h1>
    </div>
  );
}
```

### redirect vs permanentRedirect

```tsx
import { redirect, permanentRedirect } from "next/navigation";

// redirect() — HTTP 307 (Temporary Redirect)
// Dùng khi: URL có thể thay đổi trong tương lai
redirect("/new-url");

// permanentRedirect() — HTTP 308 (Permanent Redirect)
// Dùng khi: URL đã đổi vĩnh viễn, SEO cần cập nhật
permanentRedirect("/new-permanent-url");
```

### redirect trong Server Action

```tsx
// app/actions.ts
"use server";

import { redirect } from "next/navigation";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  // Validate
  if (!title || !content) {
    throw new Error("Thiếu thông tin");
  }

  // Tạo bài viết trong database
  const post = await db.post.create({
    data: { title, content },
  });

  // Redirect đến bài viết vừa tạo
  redirect(`/blog/${post.slug}`);
}
```

## usePathname Hook

`usePathname` trả về **URL path hiện tại** — hữu ích cho active link styling và conditional rendering.

```tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

// URL: /dashboard/settings → pathname = "/dashboard/settings"

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Tổng quan", icon: "📊" },
    { href: "/dashboard/analytics", label: "Phân tích", icon: "📈" },
    { href: "/dashboard/settings", label: "Cài đặt", icon: "⚙️" },
    { href: "/dashboard/profile", label: "Hồ sơ", icon: "👤" },
  ];

  return (
    <aside className="w-64 bg-gray-50 p-4">
      <nav>
        <ul className="space-y-2">
          {links.map((link) => {
            // Kiểm tra link có active không
            const isActive =
              pathname === link.href ||
              (link.href !== "/dashboard" &&
                pathname.startsWith(link.href));

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-2 p-2 rounded ${
                    isActive
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
```

## useSearchParams Hook

`useSearchParams` trả về **query string** hiện tại dưới dạng `URLSearchParams`.

```tsx
"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

export default function ProductFilter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Đọc giá trị hiện tại
  const category = searchParams.get("category");
  const sortBy = searchParams.get("sort") || "newest";
  const minPrice = searchParams.get("min_price");
  const maxPrice = searchParams.get("max_price");

  // Hàm helper: tạo URL mới với query params cập nhật
  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) {
          params.delete(key); // Xóa param
        } else {
          params.set(key, value); // Cập nhật/thêm param
        }
      });

      return params.toString();
    },
    [searchParams]
  );

  // Cập nhật filter
  const handleCategoryChange = (newCategory: string) => {
    const queryString = createQueryString({
      category: newCategory,
      page: "1", // Reset về trang 1 khi đổi filter
    });
    router.push(`${pathname}?${queryString}`);
  };

  const handleSortChange = (newSort: string) => {
    const queryString = createQueryString({ sort: newSort });
    router.push(`${pathname}?${queryString}`);
  };

  const handleClearFilters = () => {
    router.push(pathname); // Xóa tất cả query params
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-bold">Bộ lọc</h3>

      {/* Danh mục */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Danh mục
        </label>
        <select
          value={category || ""}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Tất cả</option>
          <option value="ao-thun">Áo thun</option>
          <option value="quan-jean">Quần jean</option>
          <option value="giay-dep">Giày dép</option>
        </select>
      </div>

      {/* Sắp xếp */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Sắp xếp
        </label>
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="newest">Mới nhất</option>
          <option value="price-asc">Giá tăng dần</option>
          <option value="price-desc">Giá giảm dần</option>
          <option value="popular">Phổ biến nhất</option>
        </select>
      </div>

      {/* Nút xóa filter */}
      <button
        onClick={handleClearFilters}
        className="text-sm text-red-500 hover:underline"
      >
        Xóa tất cả bộ lọc
      </button>
    </div>
  );
}
```

## Programmatic Navigation Patterns

### Pattern 1: Conditional redirect sau authentication

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedPage({
  isAuthenticated,
  children,
}: {
  isAuthenticated: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      // Lưu URL hiện tại để redirect lại sau login
      const returnUrl = encodeURIComponent(window.location.pathname);
      router.replace(`/login?returnUrl=${returnUrl}`);
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <div>Đang chuyển hướng...</div>;
  }

  return <>{children}</>;
}
```

### Pattern 2: Navigate với scroll to section

```tsx
"use client";

import { useRouter } from "next/navigation";

export default function TableOfContents({
  headings,
}: {
  headings: { id: string; text: string }[];
}) {
  const router = useRouter();

  const scrollToSection = (id: string) => {
    // Cập nhật URL hash
    router.push(`#${id}`, { scroll: false });

    // Smooth scroll đến section
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <nav className="sticky top-4">
      <h3 className="font-bold mb-2">Mục lục</h3>
      <ul className="space-y-1">
        {headings.map((heading) => (
          <li key={heading.id}>
            <button
              onClick={() => scrollToSection(heading.id)}
              className="text-sm text-gray-600 hover:text-blue-600"
            >
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

### Pattern 3: URL state management (giữ state trong URL)

```tsx
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

// Custom hook quản lý state qua URL
function useUrlState<T extends string>(
  key: string,
  defaultValue: T
): [T, (value: T) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const value = (searchParams.get(key) as T) || defaultValue;

  const setValue = useCallback(
    (newValue: T) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newValue === defaultValue) {
        params.delete(key);
      } else {
        params.set(key, newValue);
      }
      const queryString = params.toString();
      router.push(
        queryString ? `${pathname}?${queryString}` : pathname
      );
    },
    [searchParams, router, pathname, key, defaultValue]
  );

  return [value, setValue];
}

// Sử dụng
export default function TabsPage() {
  const [activeTab, setActiveTab] = useUrlState("tab", "overview");

  return (
    <div>
      <div className="flex gap-2 border-b">
        {["overview", "analytics", "settings"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={
              activeTab === tab
                ? "border-b-2 border-blue-500 font-bold"
                : "text-gray-500"
            }
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="p-4">
        {activeTab === "overview" && <p>Nội dung tổng quan</p>}
        {activeTab === "analytics" && <p>Nội dung phân tích</p>}
        {activeTab === "settings" && <p>Nội dung cài đặt</p>}
      </div>
    </div>
  );
}
```

## Active Link Styling

### Component ActiveLink tái sử dụng

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type ActiveLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  exact?: boolean; // true = match chính xác, false = match prefix
};

export default function ActiveLink({
  href,
  children,
  className = "",
  activeClassName = "text-blue-600 font-bold",
  exact = false,
}: ActiveLinkProps) {
  const pathname = usePathname();

  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`${className} ${isActive ? activeClassName : ""}`}
    >
      {children}
    </Link>
  );
}
```

```tsx
// Sử dụng ActiveLink
import ActiveLink from "@/components/ActiveLink";

export default function MainNav() {
  return (
    <nav className="flex gap-4 p-4 border-b">
      <ActiveLink href="/" exact>
        Trang chủ
      </ActiveLink>
      <ActiveLink href="/blog">Blog</ActiveLink>
      <ActiveLink href="/products">Sản phẩm</ActiveLink>
      <ActiveLink href="/about" exact>
        Giới thiệu
      </ActiveLink>
    </nav>
  );
}
```

## Lỗi thường gặp

### 1. Import sai useRouter

```tsx
// SAI: Đây là useRouter của Pages Router (cũ)
import { useRouter } from "next/router";

// ĐÚNG: Dùng useRouter từ next/navigation (App Router)
import { useRouter } from "next/navigation";
```

### 2. Dùng useRouter trong Server Component

```tsx
// SAI: useRouter là Client hook
// app/page.tsx (Server Component)
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter(); // Lỗi!
}

// ĐÚNG: Dùng redirect() trong Server Component
import { redirect } from "next/navigation";

export default function Page() {
  redirect("/somewhere");
}
```

### 3. useSearchParams gây deopt toàn page

```tsx
// SAI: Dùng useSearchParams trong page chính
// Gây toàn bộ page thành Client Component
export default function ProductsPage() {
  const searchParams = useSearchParams(); // Cả page thành client!
}

// ĐÚNG: Tách thành component con, wrap trong Suspense
import { Suspense } from "react";
import FilterBar from "./FilterBar"; // Client Component dùng useSearchParams

export default function ProductsPage() {
  return (
    <div>
      <h1>Sản phẩm</h1>
      <Suspense fallback={<div>Đang tải bộ lọc...</div>}>
        <FilterBar />
      </Suspense>
      {/* Phần còn lại vẫn là Server Component */}
    </div>
  );
}
```

### 4. Quên wrap useSearchParams trong Suspense

```
Error: useSearchParams() should be wrapped in a suspense boundary
```

Kể từ Next.js 14, `useSearchParams` yêu cầu Suspense boundary ở component cha. Luôn wrap component dùng `useSearchParams` trong `Suspense`.

### 5. router.push không refresh server data

```tsx
// SAI: Sau khi tạo dữ liệu mới, push không refresh
await createPost(data);
router.push("/blog"); // Có thể hiện data cũ (cached)

// ĐÚNG: Dùng router.refresh() hoặc revalidatePath
await createPost(data);
router.push("/blog");
router.refresh(); // Force re-fetch server data
```

## Câu hỏi phỏng vấn

### Câu 1: Link component hoạt động khác gì so với thẻ `<a>` thông thường?

**Trả lời:** `Link` từ `next/link` có 3 điểm khác biệt chính so với thẻ `<a>`:

1. **Client-side navigation**: Khi click Link, Next.js chỉ fetch và render phần thay đổi (partial rendering), không reload toàn bộ trang. Thẻ `<a>` gây full page reload.
2. **Prefetching**: Link tự động prefetch route khi xuất hiện trong viewport. Khi user click, trang đã được tải sẵn nên navigation gần như tức thì.
3. **Code splitting tự động**: Next.js chỉ tải JavaScript cần thiết cho route đó, không phải toàn bộ app.

Kết quả: navigation nhanh hơn, UX mượt hơn, và bandwidth tiết kiệm hơn so với dùng `<a>`.

### Câu 2: Khi nào dùng `redirect()` vs `useRouter().push()`?

**Trả lời:**
- **`redirect()`**: Dùng trong **Server Components**, **Server Actions**, và **Route Handlers**. Thực hiện redirect ở server level (HTTP 307/308). Dùng khi: kiểm tra auth trước khi render, redirect sau server action, route không còn tồn tại.
- **`useRouter().push()`**: Dùng trong **Client Components**. Thực hiện client-side navigation. Dùng khi: redirect sau form submit (client-side), navigation dựa trên user interaction, conditional navigation dựa trên client state.

Ưu tiên `redirect()` khi có thể vì nó xử lý ở server, nhanh hơn và tốt cho SEO. Dùng `useRouter` khi cần tương tác với user trước khi navigate.

### Câu 3: Prefetching trong Next.js hoạt động thế nào? Có thể tắt không?

**Trả lời:** Prefetching trong Next.js tự động tải trước route data khi Link xuất hiện trong viewport (qua Intersection Observer). Có 2 mức:
- **Static routes**: Tải đầy đủ route data (layout + page)
- **Dynamic routes**: Chỉ tải shared layout gần nhất (tiết kiệm bandwidth)

Tắt prefetch: `<Link href="/page" prefetch={false}>`. Hữu ích khi có danh sách rất dài (hàng trăm link) hoặc route ít khi được truy cập.

Force full prefetch cho dynamic routes: `<Link href="/page" prefetch={true}>`.

### Câu 4: Giải thích usePathname và useSearchParams. Tại sao chúng cần là Client Components?

**Trả lời:**
- **usePathname**: Trả về URL path hiện tại (VD: `/dashboard/settings`). Dùng cho active link styling, conditional rendering dựa trên route.
- **useSearchParams**: Trả về query string dạng `URLSearchParams` (VD: `?page=2&sort=price`). Dùng cho filter, search, pagination.

Chúng **phải là Client Components** vì:
1. Chúng là **React hooks** — hooks chỉ chạy trong Client Components
2. Chúng cần **subscribe vào URL changes** — khi URL thay đổi client-side, component cần re-render
3. Server Components render 1 lần trên server, không biết URL sẽ thay đổi thế nào trên client

Best practice: Tách phần cần hooks thành Client Component nhỏ, giữ phần còn lại là Server Component.

### Câu 5: Làm sao quản lý state qua URL trong Next.js? Tại sao nên làm vậy?

**Trả lời:** Quản lý state qua URL bằng cách dùng `useSearchParams` + `useRouter` để đọc/ghi query params:

```tsx
// Đọc: searchParams.get('tab')
// Ghi: router.push('?tab=settings')
```

Lý do nên dùng URL state:
1. **Shareable**: Copy URL gửi cho đồng nghiệp, họ thấy cùng state (filter, tab, page)
2. **Bookmarkable**: User bookmark URL với filter đã chọn
3. **Back/Forward**: Browser history hoạt động tự nhiên
4. **SSR compatible**: Server có thể đọc searchParams và pre-render đúng state
5. **SEO**: Crawler có thể index các filter/page khác nhau

Các state nên đặt trong URL: filter, sort, pagination, active tab, search query, modal open state. Các state KHÔNG nên đặt trong URL: form input đang nhập, dropdown open/close, animation state.
