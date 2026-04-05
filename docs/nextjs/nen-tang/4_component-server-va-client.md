---
sidebar_position: 4
title: "Server & Client Components"
---

# Server & Client Components

## Tổng quan

Đây là một trong những khái niệm **quan trọng nhất** trong Next.js App Router. Hiểu rõ Server Components và Client Components sẽ giúp bạn viết code hiệu quả, tránh lỗi, và tối ưu performance.

### Trước App Router (React truyền thống)

```
Trước đây: TẤT CẢ components đều chạy trên CLIENT
→ Tải toàn bộ JavaScript về browser
→ Browser render giao diện
→ Nặng cho client, chậm tải lần đầu

Bây giờ (App Router): Mặc định chạy trên SERVER
→ Server render HTML, gửi cho browser
→ Ít JavaScript hơn trên client
→ Nhanh hơn, nhẹ hơn cho user
```

## Server Components là gì?

Server Components là components **chỉ chạy trên server**. Chúng không bao giờ chạy trên browser. Đây là **mặc định** trong App Router — mọi component bạn viết đều là Server Component trừ khi bạn thêm `"use client"`.

### Đặc điểm của Server Components

```
Server Components CÓ THỂ:
✅ Truy cập database trực tiếp
✅ Đọc file trên server (fs module)
✅ Fetch data với API keys bí mật
✅ Dùng async/await trong component
✅ Giảm bundle size (code không gửi cho client)

Server Components KHÔNG THỂ:
❌ Dùng useState, useEffect, useRef, ...
❌ Dùng event handlers (onClick, onChange, ...)
❌ Dùng Browser APIs (window, document, localStorage, ...)
❌ Dùng React context (useContext)
```

### Ví dụ Server Component

```tsx
// app/products/page.tsx
// Đây là Server Component (mặc định, không cần khai báo gì)

// Có thể import trực tiếp thư viện server-side
import { db } from '@/lib/database';

async function ProductsPage() {
  // ✅ Truy cập database trực tiếp — KHÔNG LỘ cho client
  const products = await db.product.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // ✅ Dùng biến môi trường bí mật
  const apiKey = process.env.SECRET_API_KEY; // Chỉ server mới truy cập được

  return (
    <div>
      <h1>Sản phẩm ({products.length})</h1>
      <div className="grid grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="border rounded p-4">
            <h2>{product.name}</h2>
            <p className="text-lg font-bold">
              {product.price.toLocaleString('vi-VN')} VND
            </p>
            <p className="text-gray-500">{product.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductsPage;
```

### Lợi ích của Server Components

```tsx
// Server Component — code này KHÔNG bao giờ gửi cho client
import { marked } from 'marked';        // 35KB
import { format } from 'date-fns';      // 20KB
import { sanitize } from 'dompurify';   // 15KB
// Tổng: 70KB thư viện KHÔNG nằm trong client bundle!

async function BlogPost({ slug }: { slug: string }) {
  const post = await fetch(`https://api.example.com/posts/${slug}`);
  const data = await post.json();

  // Xử lý markdown trên server
  const htmlContent = marked(data.content);
  const safeHtml = sanitize(htmlContent);
  const formattedDate = format(new Date(data.createdAt), 'dd/MM/yyyy');

  return (
    <article>
      <h1>{data.title}</h1>
      <time>{formattedDate}</time>
      <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
    </article>
  );
}
```

Nếu đây là Client Component, user phải tải thêm **70KB** JavaScript. Với Server Component, user tải **0KB** thêm — tất cả xử lý diễn ra trên server.

## Client Components là gì?

Client Components là components chạy trên **browser** (và cũng được pre-render trên server cho SSR). Bạn khai báo bằng directive `"use client"` ở đầu file.

### Khi nào cần Client Component?

```
Cần Client Component khi:
✅ Dùng useState, useEffect, useRef, useContext
✅ Dùng event handlers (onClick, onChange, onSubmit, ...)
✅ Dùng Browser APIs (window, document, localStorage, ...)
✅ Dùng third-party libraries chỉ chạy trên browser
✅ Cần tương tác với user (forms, modals, dropdowns, ...)
```

### Ví dụ Client Component

```tsx
// components/Counter.tsx
'use client'; // ← Directive bắt buộc để biến thành Client Component

import { useState } from 'react';

export default function Counter() {
  // ✅ Dùng useState — chỉ Client Component mới được
  const [count, setCount] = useState(0);

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => setCount(count - 1)} // ✅ Event handler
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        -
      </button>
      <span className="text-2xl font-bold">{count}</span>
      <button
        onClick={() => setCount(count + 1)} // ✅ Event handler
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        +
      </button>
    </div>
  );
}
```

### Ví dụ Client Component với form

```tsx
// components/SearchBar.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Client-side navigation

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const router = useRouter();

  // ✅ useEffect — chỉ Client Component mới được
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    // Debounce search
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${query}`);
      const data = await res.json();
      setSuggestions(data.suggestions);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${query}`);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)} // ✅ onChange event
        placeholder="Tìm kiếm sản phẩm..."
        className="w-full px-4 py-2 border rounded"
      />
      {suggestions.length > 0 && (
        <ul className="absolute top-full left-0 right-0 bg-white border rounded mt-1">
          {suggestions.map((s, i) => (
            <li
              key={i}
              onClick={() => {
                setQuery(s);
                router.push(`/search?q=${s}`);
              }}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
```

## Bảng so sánh: Server vs Client Components

| Tieu chi | Server Component | Client Component |
|---|---|---|
| Directive | Khong can (mac dinh) | `"use client"` |
| Chay o dau | Chi tren server | Browser (va pre-render tren server) |
| useState/useEffect | Khong | Co |
| Event handlers | Khong | Co |
| Browser APIs | Khong | Co |
| Fetch data | `async/await` truc tiep | useEffect hoac SWR/React Query |
| Database access | Co (truc tiep) | Khong (phai qua API) |
| Bundle size | 0 KB (khong gui cho client) | Them vao JS bundle |
| SEO | Tot (HTML co san) | Phu thuoc vao SSR |
| Env variables | Tat ca (bao gom bi mat) | Chi `NEXT_PUBLIC_*` |

## Composition Patterns

Đây là phần quan trọng nhất — cách kết hợp Server và Client Components đúng cách.

### Pattern 1: Client Component bọc ngoài Server Component (qua children)

```tsx
// components/ClientWrapper.tsx
'use client';

import { useState } from 'react';

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      <button onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? 'Thu gọn' : 'Mở rộng'}
      </button>
      {isExpanded && (
        <div className="mt-4">
          {children} {/* ← Server Component được truyền vào đây */}
        </div>
      )}
    </div>
  );
}
```

```tsx
// app/page.tsx (Server Component)
import ClientWrapper from '@/components/ClientWrapper';
import ProductList from '@/components/ProductList'; // Server Component

export default function HomePage() {
  return (
    <div>
      <h1>Trang chủ</h1>
      <ClientWrapper>
        {/* ProductList là Server Component — vẫn render trên server! */}
        <ProductList />
      </ClientWrapper>
    </div>
  );
}
```

```tsx
// components/ProductList.tsx (Server Component)
// KHÔNG có "use client" → đây là Server Component

import { db } from '@/lib/database';

export default async function ProductList() {
  const products = await db.product.findMany();

  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>{p.name} — {p.price.toLocaleString('vi-VN')} VND</li>
      ))}
    </ul>
  );
}
```

**Tại sao pattern này hoạt động?** Vì `children` là **prop** — React render Server Component trên server trước, rồi truyền kết quả (HTML) cho Client Component. Client Component nhận HTML đã render sẵn, không cần chạy code của Server Component.

### Pattern 2: Truyền Server Component data cho Client Component

```tsx
// app/dashboard/page.tsx (Server Component)
import { db } from '@/lib/database';
import DashboardChart from '@/components/DashboardChart'; // Client Component

export default async function DashboardPage() {
  // Fetch data trên server
  const stats = await db.stats.findMany({
    orderBy: { date: 'asc' },
    take: 30,
  });

  // Serialize data rồi truyền cho Client Component
  const chartData = stats.map((s) => ({
    date: s.date.toISOString(),
    revenue: s.revenue,
    orders: s.orders,
  }));

  return (
    <div>
      <h1>Dashboard</h1>
      {/* Truyền data đã fetch trên server cho Client Component */}
      <DashboardChart data={chartData} />
    </div>
  );
}
```

```tsx
// components/DashboardChart.tsx
'use client';

import { useState } from 'react';

interface ChartData {
  date: string;
  revenue: number;
  orders: number;
}

export default function DashboardChart({ data }: { data: ChartData[] }) {
  const [metric, setMetric] = useState<'revenue' | 'orders'>('revenue');

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMetric('revenue')}
          className={metric === 'revenue' ? 'font-bold' : ''}
        >
          Doanh thu
        </button>
        <button
          onClick={() => setMetric('orders')}
          className={metric === 'orders' ? 'font-bold' : ''}
        >
          Đơn hàng
        </button>
      </div>
      {/* Render chart với data từ server */}
      <div className="border rounded p-4">
        {data.map((d) => (
          <div key={d.date} className="flex justify-between py-1">
            <span>{new Date(d.date).toLocaleDateString('vi-VN')}</span>
            <span className="font-bold">
              {metric === 'revenue'
                ? `${d.revenue.toLocaleString('vi-VN')} VND`
                : `${d.orders} đơn`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Pattern 3: Tách phần interactive thành Client Component nhỏ

```tsx
// app/products/[id]/page.tsx (Server Component)
import { db } from '@/lib/database';
import AddToCartButton from '@/components/AddToCartButton';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } });

  if (!product) {
    return <p>Sản phẩm không tồn tại</p>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Phần tĩnh — Server Component (không gửi JS cho client) */}
      <h1 className="text-3xl font-bold">{product.name}</h1>
      <p className="text-2xl text-red-500 mt-2">
        {product.price.toLocaleString('vi-VN')} VND
      </p>
      <p className="mt-4 text-gray-600">{product.description}</p>

      {/* Phần tương tác — Client Component (chỉ phần này gửi JS) */}
      <AddToCartButton productId={product.id} productName={product.name} />
    </div>
  );
}
```

```tsx
// components/AddToCartButton.tsx
'use client';

import { useState } from 'react';

interface Props {
  productId: string;
  productName: string;
}

export default function AddToCartButton({ productId, productName }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await fetch('/api/cart', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      });
      alert(`Đã thêm ${quantity} ${productName} vào giỏ hàng!`);
    } catch (error) {
      alert('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="mt-6 flex items-center gap-4">
      <div className="flex items-center border rounded">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="px-3 py-2"
        >
          -
        </button>
        <span className="px-4 py-2">{quantity}</span>
        <button
          onClick={() => setQuantity(quantity + 1)}
          className="px-3 py-2"
        >
          +
        </button>
      </div>
      <button
        onClick={handleAddToCart}
        disabled={isAdding}
        className="px-6 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {isAdding ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
      </button>
    </div>
  );
}
```

**Nguyên tắc vàng**: Giữ Server Component ở mức cao nhất có thể, chỉ "đẩy xuống" Client Component cho phần cần tương tác.

## Data Flow giữa Server và Client

```
Server Component                    Client Component
┌──────────────────┐               ┌──────────────────┐
│ Fetch data       │               │ Nhận data qua    │
│ từ DB/API        │──── props ───→│ props             │
│                  │               │                  │
│ KHÔNG gửi code   │               │ Gửi JS cho       │
│ cho client       │               │ client            │
└──────────────────┘               └──────────────────┘
        │                                    │
        │ HTML đã render                     │ JavaScript + HTML
        ▼                                    ▼
    ┌────────────────────────────────────────────┐
    │              Browser                        │
    │  HTML từ Server + JS từ Client Components   │
    └────────────────────────────────────────────┘
```

### Quy tắc truyền data

```tsx
// ✅ ĐÚNG: Truyền serializable data từ Server → Client
// Serializable: string, number, boolean, array, plain object, Date, null

// Server Component
async function Page() {
  const user = await getUser();
  return <UserCard name={user.name} email={user.email} />;
}

// ❌ SAI: Truyền function từ Server → Client
async function Page() {
  const handleClick = () => console.log('click'); // Function không serialize được!
  return <Button onClick={handleClick} />; // LỖI!
}

// ❌ SAI: Truyền class instance từ Server → Client
async function Page() {
  const date = new Date(); // Date serialize thành string
  const map = new Map();   // Map KHÔNG serialize được!
  return <MyComponent data={map} />; // LỖI!
}
```

## Lỗi thường gặp

### 1. Dùng hooks trong Server Component

```tsx
// SAI: Dùng useState trong Server Component
// app/page.tsx (Server Component mặc định)
import { useState } from 'react'; // ❌ LỖI!

export default function HomePage() {
  const [count, setCount] = useState(0); // ❌ LỖI!
  return <div>{count}</div>;
}
// Error: useState can only be used in Client Components.

// ĐÚNG: Thêm "use client" hoặc tách component
'use client'; // ← Thêm directive này

import { useState } from 'react';

export default function HomePage() {
  const [count, setCount] = useState(0); // ✅ Hoạt động
  return <div>{count}</div>;
}
```

### 2. Import Server Component vào Client Component

```tsx
// SAI: Import Server Component trực tiếp vào Client Component
// components/ClientWrapper.tsx
'use client';

import ServerComponent from './ServerComponent'; // ❌
// ServerComponent sẽ bị biến thành Client Component!

export default function ClientWrapper() {
  return <ServerComponent />; // Mất lợi ích của Server Component
}

// ĐÚNG: Truyền qua children prop
// components/ClientWrapper.tsx
'use client';

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="wrapper">{children}</div>;
}

// app/page.tsx (Server Component)
import ClientWrapper from '@/components/ClientWrapper';
import ServerComponent from '@/components/ServerComponent';

export default function Page() {
  return (
    <ClientWrapper>
      <ServerComponent /> {/* ✅ Vẫn là Server Component */}
    </ClientWrapper>
  );
}
```

### 3. Dùng "use client" cho toàn bộ app

```tsx
// SAI: Thêm "use client" ở mọi nơi vì "cho an toàn"
// Kết quả: Mất hết lợi ích của Server Components
// → Bundle size lớn
// → Không fetch data trực tiếp
// → Giống React truyền thống (CRA)

// ĐÚNG: Chỉ thêm "use client" khi CẦN
// Guideline:
// 1. Mặc định KHÔNG thêm "use client"
// 2. Nếu cần hooks/events → thêm "use client"
// 3. Nếu cần hooks/events cho một phần nhỏ → tách phần đó thành Client Component riêng
```

### 4. Truyền non-serializable props

```tsx
// SAI: Truyền function từ Server → Client Component
// app/page.tsx (Server Component)
import Button from '@/components/Button'; // Client Component

export default function Page() {
  // Function không thể serialize qua network
  const handleClick = () => {
    console.log('Clicked!');
  };

  return <Button onClick={handleClick} />; // ❌ LỖI!
}

// ĐÚNG: Định nghĩa event handler trong Client Component
// components/Button.tsx
'use client';

export default function Button() {
  const handleClick = () => {
    console.log('Clicked!');
  };

  return <button onClick={handleClick}>Click me</button>; // ✅
}
```

### 5. Dùng async trong Client Component

```tsx
// SAI: Client Component không thể là async
'use client';

export default async function UserProfile() { // ❌ LỖI!
  const user = await fetch('/api/user');
  return <div>{user.name}</div>;
}

// ĐÚNG Cách 1: Fetch trong useEffect
'use client';

import { useState, useEffect } from 'react';

export default function UserProfile() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/user')
      .then((res) => res.json())
      .then(setUser);
  }, []);

  if (!user) return <p>Đang tải...</p>;
  return <div>{user.name}</div>;
}

// ĐÚNG Cách 2: Fetch ở Server Component, truyền data xuống
// app/profile/page.tsx (Server Component)
import UserProfile from '@/components/UserProfile';

export default async function ProfilePage() {
  const res = await fetch('https://api.example.com/user');
  const user = await res.json();

  return <UserProfile name={user.name} email={user.email} />;
}
```

### 6. Context Provider ở sai vị trí

```tsx
// SAI: Dùng Provider trong Server Component
// app/layout.tsx
import { ThemeProvider } from '@/contexts/ThemeContext'; // Client-only

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <ThemeProvider>{children}</ThemeProvider> {/* ❌ LỖI nếu ThemeProvider không có "use client" */}
      </body>
    </html>
  );
}

// ĐÚNG: Tạo wrapper Client Component cho providers
// components/Providers.tsx
'use client';

import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </AuthProvider>
  );
}

// app/layout.tsx (Server Component)
import Providers from '@/components/Providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## Quy tắc quyết định: Server hay Client?

```
Bắt đầu → Cần hooks (useState, useEffect, ...)?
                │
            Có  │  Không
                ▼      ▼
        Client    Cần event handlers (onClick, onChange)?
        Component       │
                    Có  │  Không
                        ▼      ▼
                Client    Cần Browser APIs (window, localStorage)?
                Component       │
                            Có  │  Không
                                ▼      ▼
                        Client    → SERVER Component ✅
                        Component
```

**Nguyên tắc đơn giản**: Nếu không chắc, bắt đầu với Server Component. Next.js sẽ báo lỗi nếu bạn dùng tính năng client-only trong Server Component, lúc đó mới chuyển sang Client Component.

## Tổng kết

| Khai niem | Mo ta |
|---|---|
| Server Component | Mac dinh, chay tren server, khong gui JS cho client |
| Client Component | Khai bao `"use client"`, chay tren browser |
| Composition | Truyen Server Component qua `children` prop |
| Data flow | Server fetch data → truyen qua props → Client nhan |
| Bundle size | Server Components = 0 KB them vao bundle |
| Nguyen tac | Mac dinh Server, chi Client khi can tuong tac |

## Câu hỏi phỏng vấn

### Câu 1: Server Components và Client Components khác nhau thế nào?

**Trả lời:**

**Server Components** (mặc định trong App Router):
- Chạy trên server, không gửi JavaScript cho client
- Có thể truy cập database, file system, biến môi trường bí mật
- Có thể dùng `async/await` trực tiếp
- Không thể dùng hooks, event handlers, Browser APIs

**Client Components** (khai báo `"use client"`):
- Chạy trên browser (và pre-render trên server)
- Có thể dùng hooks (`useState`, `useEffect`), event handlers, Browser APIs
- Code được gửi cho client (tăng bundle size)
- Fetch data qua `useEffect` hoặc thư viện (SWR, React Query)

### Câu 2: Làm thế nào để truyền Server Component vào Client Component?

**Trả lời:**

Không thể import trực tiếp Server Component vào Client Component. Thay vào đó, dùng **children pattern**:

```tsx
// Client Component nhận children
'use client';
function ClientWrapper({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

// Server Component truyền qua children
function Page() {
  return (
    <ClientWrapper>
      <ServerComponent /> {/* Vẫn render trên server */}
    </ClientWrapper>
  );
}
```

React render Server Component trên server trước, biến thành HTML, rồi truyền kết quả cho Client Component qua props.

### Câu 3: Tại sao nên dùng Server Components mặc định?

**Trả lời:**

1. **Giảm bundle size**: Server Components không gửi JavaScript cho client. Ứng dụng tải nhanh hơn.
2. **Bảo mật**: Database queries, API keys chạy trên server, không lộ cho client.
3. **Performance**: Fetch data gần data source hơn (server ↔ database cùng network).
4. **SEO**: HTML render sẵn trên server, search engines crawl dễ dàng.
5. **Streaming**: Server có thể gửi HTML theo từng phần, không cần đợi tất cả.

### Câu 4: Khi nào bắt buộc phải dùng Client Component?

**Trả lời:**

Bắt buộc dùng Client Component khi cần:
1. **React hooks**: `useState`, `useEffect`, `useRef`, `useContext`, custom hooks
2. **Event handlers**: `onClick`, `onChange`, `onSubmit`, ...
3. **Browser APIs**: `window`, `document`, `localStorage`, `navigator`
4. **Third-party libraries** yêu cầu browser: thư viện animation, chart, drag-and-drop

### Câu 5: Giải thích "use client" boundary trong Next.js?

**Trả lời:**

`"use client"` tạo ra một **boundary** (ranh giới) giữa server và client code:

- Khi một file có `"use client"`, file đó và **tất cả modules nó import** đều trở thành Client Components.
- Đây là lý do không nên import Server Component vào Client Component — nó sẽ bị "kéo" sang client side.
- `children` prop không bị ảnh hưởng bởi boundary này — Server Component truyền qua children vẫn render trên server.

Best practice: Đặt `"use client"` boundary **càng thấp càng tốt** trong component tree, chỉ bao gồm phần thực sự cần client-side interactivity.
