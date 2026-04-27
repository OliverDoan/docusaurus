---
sidebar_position: 2
title: "2. Data Fetching"
---

# Data Fetching

Data fetching (lấy dữ liệu) là một trong những việc quan trọng nhất khi xây dựng ứng dụng web. Trong Next.js App Router, cách tiếp cận đã thay đổi hoàn toàn so với Pages Router trước đây. Thay vì dùng `getServerSideProps` hay `getStaticProps`, bạn giờ **fetch dữ liệu trực tiếp trong Server Components** bằng `fetch()` API được mở rộng. Hãy tưởng tượng như việc đi chợ -- trước đây bạn phải nhờ người khác mua hộ (getServerSideProps), còn bây giờ bạn tự đi mua trực tiếp (fetch trong component).

---


---

## Mục lục

- [1. fetch() trong Server Components](#1-fetch-trong-server-components)
- [2. Caching Behavior Mặc Định](#2-caching-behavior-mặc-định)
- [3. `cache: 'no-store'` vs `cache: 'force-cache'`](#3-cache-no-store-vs-cache-force-cache)
- [4. `next: { revalidate: N }` Option](#4-next-revalidate-n-option)
- [5. Fetching Data trong Layouts vs Pages](#5-fetching-data-trong-layouts-vs-pages)
- [6. Sequential vs Parallel Data Fetching](#6-sequential-vs-parallel-data-fetching)
- [7. Dùng Database Trực Tiếp trong Server Components](#7-dùng-database-trực-tiếp-trong-server-components)
- [8. Error Handling Khi Fetch](#8-error-handling-khi-fetch)
- [9. Lỗi thường gặp](#9-lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. fetch() trong Server Components

### Extended Fetch API

Next.js mở rộng `fetch()` API gốc của Web với các options bổ sung để kiểm soát **caching** và **revalidation**. Điều này có nghĩa là bạn dùng cùng cú pháp `fetch()` quen thuộc, nhưng thêm được các option đặc biệt của Next.js.

```tsx
// app/bai-viet/page.tsx
// Server Component -- fetch data trực tiếp, không cần "use client"

async function layBaiViet() {
  // fetch() được Next.js mở rộng với các option đặc biệt
  const res = await fetch('https://api.example.com/bai-viet', {
    // Options cua Next.js
    next: {
      revalidate: 3600, // Revalidate mỗi 1 giờ (3600 giây)
      tags: ['bai-viet'], // Tag để revalidate theo yêu cầu
    },
  });

  if (!res.ok) {
    throw new Error('Không thể tải bài viết');
  }

  return res.json();
}

export default async function TrangBaiViet() {
  // Gọi hàm async trực tiếp -- chỉ làm được trong Server Component
  const baiViets = await layBaiViet();

  return (
    <div>
      <h1>Danh sách bài viết</h1>
      {baiViets.map((bv: { id: number; tieuDe: string }) => (
        <article key={bv.id}>
          <h2>{bv.tieuDe}</h2>
        </article>
      ))}
    </div>
  );
}
```

### Đặc điểm quan trọng

- **Không cần `useEffect` hay `useState`** -- fetch trực tiếp trong component body
- **Không cần API route trung gian** -- Server Component gọi API trực tiếp
- **Tự động deduplicate** -- nếu nhiều component fetch cùng URL, Next.js chỉ gọi 1 lần
- **Chạy trên server** -- API keys, database credentials không bị lộ ra client

---

## 2. Caching Behavior Mặc Định

### Next.js 14 vs Next.js 15

**Quan trọng:** Behavior mặc định đã thay đổi giữa các phiên bản:

```tsx
// Next.js 14: Mặc định là cache (force-cache)
const res = await fetch('https://api.example.com/data');
// Tương đương với: fetch(url, { cache: 'force-cache' })

// Next.js 15+: Mặc định là KHÔNG cache (no-store)
const res = await fetch('https://api.example.com/data');
// Tương đương với: fetch(url, { cache: 'no-store' })
```

### Cách kiểm soát cache rõ ràng

Luôn **chỉ định rõ ràng** caching behavior để code rõ ràng, tránh bị ảnh hưởng bởi thay đổi mặc định giữa các phiên bản:

```tsx
// 1. Không cache -- lấy dữ liệu mới mỗi request
const freshData = await fetch('https://api.example.com/data', {
  cache: 'no-store',
});

// 2. Cache vĩnh viễn -- chỉ fetch 1 lần (lúc build hoặc request đầu)
const cachedData = await fetch('https://api.example.com/data', {
  cache: 'force-cache',
});

// 3. Cache với thời gian -- tự động refresh sau N giây
const timedData = await fetch('https://api.example.com/data', {
  next: { revalidate: 60 }, // Refresh sau 60 giây
});
```

---

## 3. `cache: 'no-store'` vs `cache: 'force-cache'`

### `cache: 'no-store'` -- Không cache

Mỗi request đều gọi API thật sự. Phù hợp cho dữ liệu thay đổi liên tục.

```tsx
// app/gia-vang/page.tsx
// Giá vàng thay đổi liên tục -- không nên cache

async function layGiaVang() {
  const res = await fetch('https://api.example.com/gia-vang', {
    cache: 'no-store', // Luôn lấy dữ liệu mới nhất
  });
  return res.json();
}

export default async function TrangGiaVang() {
  const giaVang = await layGiaVang();

  return (
    <div>
      <h1>Giá vàng hôm nay</h1>
      <p>SJC mua vao: {giaVang.sjc.mua.toLocaleString('vi-VN')}d/luong</p>
      <p>SJC ban ra: {giaVang.sjc.ban.toLocaleString('vi-VN')}d/luong</p>
      <p>Cập nhật: {new Date().toLocaleString('vi-VN')}</p>
    </div>
  );
}
```

### `cache: 'force-cache'` -- Cache vĩnh viễn

Dữ liệu chỉ fetch **một lần duy nhất** và được cache. Phù hợp cho dữ liệu ít thay đổi.

```tsx
// app/danh-muc/page.tsx
// Danh mục sản phẩm ít thay đổi -- cache vĩnh viễn

async function layDanhMuc() {
  const res = await fetch('https://api.example.com/danh-muc', {
    cache: 'force-cache', // Cache vĩnh viễn (đến khi redeploy)
  });
  return res.json();
}

export default async function TrangDanhMuc() {
  const danhMucs = await layDanhMuc();

  return (
    <nav>
      <h2>Danh mục</h2>
      <ul>
        {danhMucs.map((dm: { id: number; ten: string }) => (
          <li key={dm.id}>{dm.ten}</li>
        ))}
      </ul>
    </nav>
  );
}
```

---

## 4. `next: { revalidate: N }` Option

Revalidate cho phép bạn **cache dữ liệu nhưng tự động làm mới** sau N giây. Đây là cách triển khai ISR trong App Router.

```tsx
// app/thoi-tiet/page.tsx
// Thời tiết cập nhật mỗi 10 phút (600 giây)

async function layThoiTiet(thanhPho: string) {
  const res = await fetch(
    `https://api.example.com/thoi-tiet?tp=${thanhPho}`,
    {
      next: {
        revalidate: 600, // Revalidate sau 10 phút
        tags: ['thoi-tiet', `thoi-tiet-${thanhPho}`], // Tags để on-demand revalidate
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Không thể tải thời tiết cho ${thanhPho}`);
  }

  return res.json();
}

export default async function TrangThoiTiet() {
  // Fetch song song nhiều thành phố
  const [hanoi, hcm, danang] = await Promise.all([
    layThoiTiet('hanoi'),
    layThoiTiet('hochiminh'),
    layThoiTiet('danang'),
  ]);

  return (
    <div>
      <h1>Thời tiết Việt Nam</h1>
      <div>
        <h2>Hà Nội: {hanoi.nhietDo}°C</h2>
        <h2>TP.HCM: {hcm.nhietDo}°C</h2>
        <h2>Đà Nẵng: {danang.nhietDo}°C</h2>
      </div>
    </div>
  );
}
```

### Các giá trị revalidate thường dùng

| Giá trị | Thời gian | Phù hợp cho |
|---|---|---|
| `0` | Không cache | Dữ liệu real-time |
| `60` | 1 phút | Giá sản phẩm, tỷ giá |
| `300` | 5 phút | Danh sách bài viết |
| `3600` | 1 giờ | Trang danh mục |
| `86400` | 1 ngày | Trang giới thiệu |
| `false` | Vĩnh viễn | Nội dung tĩnh |

---

## 5. Fetching Data trong Layouts vs Pages

### Fetch trong Layout

Layout được chia sẻ giữa nhiều trang con. Dữ liệu fetch trong layout **được cache và chia sẻ** cho tất cả trang con.

```tsx
// app/dashboard/layout.tsx
// Layout của dashboard -- fetch thông tin user 1 lần, chia sẻ cho mọi trang con

async function layThongTinUser() {
  const res = await fetch('https://api.example.com/user/me', {
    cache: 'no-store', // Luôn lấy thông tin mới nhất
  });
  return res.json();
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await layThongTinUser();

  return (
    <div className="dashboard">
      {/* Sidebar hiển thị ở mọi trang dashboard */}
      <aside>
        <p>Xin chào, {user.ten}!</p>
        <nav>
          <a href="/dashboard">Tổng quan</a>
          <a href="/dashboard/don-hang">Đơn hàng</a>
          <a href="/dashboard/cai-dat">Cài đặt</a>
        </nav>
      </aside>

      {/* Nội dung trang con */}
      <main>{children}</main>
    </div>
  );
}
```

### Fetch trong Page

Page là nội dung cụ thể cho từng route. Dữ liệu chỉ cần cho trang đó.

```tsx
// app/dashboard/don-hang/page.tsx
// Trang đơn hàng -- chỉ fetch đơn hàng, không cần fetch lại user info

async function layDonHang() {
  const res = await fetch('https://api.example.com/don-hang', {
    cache: 'no-store',
  });
  return res.json();
}

export default async function TrangDonHang() {
  const donHangs = await layDonHang();

  return (
    <div>
      <h1>Đơn hàng của bạn</h1>
      {donHangs.map(
        (dh: { id: string; ngay: string; tongTien: number }) => (
          <div key={dh.id}>
            <p>Mã đơn: {dh.id}</p>
            <p>Ngày: {dh.ngay}</p>
            <p>Tổng tiền: {dh.tongTien.toLocaleString('vi-VN')}d</p>
          </div>
        )
      )}
    </div>
  );
}
```

### Lưu ý quan trọng

- Layout **không re-render** khi navigate giữa các trang con -- dữ liệu fetch trong layout được giữ lại.
- Nếu cả layout và page fetch **cùng một URL**, Next.js **tự động deduplicate** -- chỉ gọi API 1 lần.
- Không thể truyền dữ liệu từ layout xuống page qua props. Thay vào đó, fetch trong page hoặc dùng React Context.

---

## 6. Sequential vs Parallel Data Fetching

### Sequential Fetching (Tuần tự)

Request phụ thuộc nhau -- phải đợi request trước xong mới chạy request sau. Giống như xếp hàng mua vé -- người trước mua xong mới đến lượt người sau.

```tsx
// app/user/[id]/page.tsx
// SEQUENTIAL -- request 2 phụ thuộc kết quả request 1

async function layUser(id: string) {
  const res = await fetch(`https://api.example.com/users/${id}`);
  return res.json();
}

async function layDonHangCuaUser(userId: string) {
  // Phải có userId trước mới fetch được đơn hàng
  const res = await fetch(
    `https://api.example.com/users/${userId}/don-hang`
  );
  return res.json();
}

export default async function TrangUser({
  params,
}: {
  params: { id: string };
}) {
  // Request 1: Lấy thông tin user trước
  const user = await layUser(params.id);

  // Request 2: Dùng user.id để lấy đơn hàng (phụ thuộc request 1)
  const donHangs = await layDonHangCuaUser(user.id);

  return (
    <div>
      <h1>{user.ten}</h1>
      <h2>Đơn hàng: {donHangs.length}</h2>
    </div>
  );
}
```

### Parallel Fetching (Song song)

Các request **độc lập với nhau** -- chạy đồng thời bằng `Promise.all`. Giống như nhiều nhân viên phục vụ nhiều khách cùng lúc.

```tsx
// app/dashboard/page.tsx
// PARALLEL -- 3 request độc lập, chạy đồng thời

async function layThongKe() {
  const res = await fetch('https://api.example.com/thong-ke', {
    cache: 'no-store',
  });
  return res.json();
}

async function layDonHangGanDay() {
  const res = await fetch('https://api.example.com/don-hang?limit=5', {
    cache: 'no-store',
  });
  return res.json();
}

async function layThongBao() {
  const res = await fetch('https://api.example.com/thong-bao', {
    cache: 'no-store',
  });
  return res.json();
}

export default async function Dashboard() {
  // Chạy 3 request SONG SONG -- nhanh gấp 3 lần so với tuần tự!
  const [thongKe, donHangs, thongBao] = await Promise.all([
    layThongKe(),
    layDonHangGanDay(),
    layThongBao(),
  ]);

  return (
    <div>
      <h1>Dashboard</h1>
      <div>
        <p>Tổng doanh thu: {thongKe.doanhThu.toLocaleString('vi-VN')}d</p>
        <p>Đơn hàng gần đây: {donHangs.length}</p>
        <p>Thông báo mới: {thongBao.length}</p>
      </div>
    </div>
  );
}
```

### So sánh thời gian

```
Sequential (Tuần tự):
  Request 1 (200ms) --> Request 2 (300ms) --> Request 3 (150ms)
  Tổng: 650ms

Parallel (Song song):
  Request 1 (200ms) --|
  Request 2 (300ms) --|-->  Tổng: 300ms (bằng request chậm nhất)
  Request 3 (150ms) --|
```

**Quy tắc:** Luôn dùng `Promise.all()` khi các request **không phụ thuộc nhau**.

---

## 7. Dùng Database Trực Tiếp trong Server Components

Một ưu điểm lớn của Server Components là bạn có thể **truy vấn database trực tiếp** mà không cần API route trung gian.

```tsx
// app/san-pham/page.tsx
// Truy vấn database trực tiếp -- không cần API route!
import { prisma } from '@/lib/prisma';

export default async function TrangSanPham() {
  // Query Prisma trực tiếp trong Server Component
  const sanPhams = await prisma.sanPham.findMany({
    where: { conHang: true },
    orderBy: { ngayTao: 'desc' },
    take: 20,
  });

  return (
    <div>
      <h1>Sản phẩm</h1>
      {sanPhams.map((sp) => (
        <div key={sp.id}>
          <h2>{sp.ten}</h2>
          <p>{sp.gia.toLocaleString('vi-VN')}d</p>
        </div>
      ))}
    </div>
  );
}
```

```tsx
// app/bai-viet/[slug]/page.tsx
// Dùng Drizzle ORM trực tiếp
import { db } from '@/lib/db';
import { baiViet } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export default async function TrangBaiViet({
  params,
}: {
  params: { slug: string };
}) {
  // Query database trực tiếp
  const bv = await db
    .select()
    .from(baiViet)
    .where(eq(baiViet.slug, params.slug))
    .limit(1);

  if (bv.length === 0) {
    return <div>Bài viết không tồn tại</div>;
  }

  return (
    <article>
      <h1>{bv[0].tieuDe}</h1>
      <p>{bv[0].noiDung}</p>
    </article>
  );
}
```

### Lưu ý bảo mật

- Database credentials **chỉ tồn tại trên server** -- không bao giờ lộ ra client
- **Không import** database client trong Client Components (`"use client"`)
- Validate input trước khi đưa vào query để tránh SQL injection

---

## 8. Error Handling Khi Fetch

### Dùng `error.tsx` cho Route-level Errors

```tsx
// app/san-pham/error.tsx
'use client'; // error.tsx BẮT BUỘC phải là Client Component

export default function LỗiSanPham({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Có lỗi xảy ra!</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Thử lại</button>
    </div>
  );
}
```

### Dùng `notFound()` cho 404

```tsx
// app/san-pham/[id]/page.tsx
import { notFound } from 'next/navigation';

async function laySanPham(id: string) {
  const res = await fetch(`https://api.example.com/san-pham/${id}`, {
    next: { revalidate: 60 },
  });

  if (res.status === 404) {
    return null; // Sản phẩm không tồn tại
  }

  if (!res.ok) {
    throw new Error('Lỗi khi tải sản phẩm');
  }

  return res.json();
}

export default async function ChiTietSanPham({
  params,
}: {
  params: { id: string };
}) {
  const sp = await laySanPham(params.id);

  if (!sp) {
    notFound(); // Hiển thị trang 404 (not-found.tsx)
  }

  return (
    <div>
      <h1>{sp.ten}</h1>
      <p>{sp.moTa}</p>
    </div>
  );
}
```

### Try-Catch cho lỗi cụ thể

```tsx
// app/dashboard/page.tsx
// Xử lý lỗi cho từng phần dữ liệu độc lập

async function fetchAnToan<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`Lỗi khi fetch ${url}:`, error);
    return fallback; // Trả về giá trị mặc định thay vì crash
  }
}

export default async function Dashboard() {
  // Mỗi phần có thể fail độc lập mà không ảnh hưởng phần khác
  const [thongKe, donHangs] = await Promise.all([
    fetchAnToan('https://api.example.com/thong-ke', {
      doanhThu: 0,
      tongDon: 0,
    }),
    fetchAnToan('https://api.example.com/don-hang', []),
  ]);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Doanh thu: {thongKe.doanhThu.toLocaleString('vi-VN')}đ</p>
      <p>Đơn hàng: {donHangs.length}</p>
    </div>
  );
}
```

---

## 9. Lỗi thường gặp

### Lỗi 1: Fetch data trong Client Component thay vì Server Component

```tsx
'use client';
// SAI -- Fetch bằng useEffect trong Client Component (chậm hơn, waterfall)
import { useState, useEffect } from 'react';

export default function SanPham() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/api/san-pham')
      .then((res) => res.json())
      .then(setData);
  }, []);

  return <div>{/* render data */}</div>;
}
```

```tsx
// ĐÚNG -- Fetch trực tiếp trong Server Component (nhanh hơn, SEO tốt)
export default async function SanPham() {
  const res = await fetch('https://api.example.com/san-pham');
  const data = await res.json();

  return <div>{/* render data */}</div>;
}
```

### Lỗi 2: Không xử lý lỗi khi fetch

```tsx
// SAI -- Không kiểm tra response status
const data = await fetch(url).then((r) => r.json()); // Crash neu 500!

// ĐÚNG -- Luôn kiểm tra res.ok
const res = await fetch(url);
if (!res.ok) {
  throw new Error(`Lỗi: ${res.status} ${res.statusText}`);
}
const data = await res.json();
```

### Lỗi 3: Waterfall khi có thể chạy song song

```tsx
// SAI -- 3 request chạy tuần tự (chậm!)
const users = await fetch('/api/users').then((r) => r.json());
const posts = await fetch('/api/posts').then((r) => r.json());
const comments = await fetch('/api/comments').then((r) => r.json());

// ĐÚNG -- 3 request chạy song song (nhanh!)
const [users, posts, comments] = await Promise.all([
  fetch('/api/users').then((r) => r.json()),
  fetch('/api/posts').then((r) => r.json()),
  fetch('/api/comments').then((r) => r.json()),
]);
```

### Lỗi 4: Quên rằng fetch trong layout không re-fetch khi navigate

Layout không re-render khi navigate giữa các trang con. Nếu bạn cần dữ liệu mới ở mỗi trang, hãy fetch trong page thay vì layout.

---

## Câu hỏi phỏng vấn

### Câu 1: Next.js mở rộng fetch() API như thế nào?

**Trả lời:**

Next.js mở rộng native `fetch()` với 2 option chính:
- `cache`: Kiểm soát caching behavior (`'no-store'` hoặc `'force-cache'`)
- `next.revalidate`: Thời gian (giây) để tự động revalidate cache
- `next.tags`: Mảng các tag để hỗ trợ on-demand revalidation với `revalidateTag()`

Ngoài ra, Next.js tự động **deduplicate** các fetch request giống nhau trong cùng một render pass -- nếu nhiều component fetch cùng URL thì chỉ có 1 request thực sự được gửi đi.

### Câu 2: Sự khác nhau giữa fetch trong Layout và fetch trong Page là gì?

**Trả lời:**

- **Layout:** Dữ liệu được fetch khi layout render lần đầu. Khi user navigate giữa các trang con (cùng layout parent), layout **không re-render** nên dữ liệu không được fetch lại. Phù hợp cho dữ liệu dùng chung như thông tin user, navigation.

- **Page:** Dữ liệu được fetch mỗi lần user truy cập trang đó. Phù hợp cho dữ liệu cụ thể của từng trang.

Điểm quan trọng: Không thể truyền dữ liệu từ layout xuống page qua props. Nếu cả hai cần cùng dữ liệu, Next.js sẽ tự động deduplicate request.

### Câu 3: Khi nào dùng Sequential vs Parallel data fetching?

**Trả lời:**

- **Sequential:** Khi request sau **phụ thuộc kết quả** của request trước. Ví dụ: fetch user trước, rồi dùng userId để fetch đơn hàng của user đó.

- **Parallel:** Khi các request **độc lập với nhau**. Dùng `Promise.all()` để chạy đồng thời. Ví dụ: fetch thống kê, đơn hàng, và thông báo cho dashboard -- 3 API không liên quan.

**Nguyên tắc:** Mặc định luôn ưu tiên parallel. Chỉ dùng sequential khi thực sự có dependency.

### Câu 4: Tại sao fetch data trực tiếp trong Server Component tốt hơn useEffect?

**Trả lời:**

5 lý do chính:

1. **Không waterfall:** Server Component fetch trước khi gửi HTML -- user nhận được trang đã có data. Với useEffect, user nhận HTML trống trước, rồi mới fetch data (2 round-trips).

2. **SEO:** Dữ liệu đã có trong HTML response -- search engine đọc được. useEffect render trên client nên search engine thấy HTML trống.

3. **Bảo mật:** API keys và database credentials không lộ ra client.

4. **Không bundle JS:** Fetch logic không được gửi xuống client -- giảm bundle size.

5. **Tối ưu server:** Server thường có mạng nhanh hơn và gần API server hơn -- fetch nhanh hơn browser của user.

### Câu 5: Làm sao xử lý lỗi khi data fetching trong Next.js App Router?

**Trả lời:**

Có 3 cấp độ xử lý lỗi:

1. **Route-level:** Tạo file `error.tsx` trong route folder. Đây là Error Boundary tự động bắt mọi lỗi trong route đó. Phải là Client Component.

2. **Not Found:** Gọi `notFound()` từ `next/navigation` khi dữ liệu không tồn tại. Next.js sẽ render file `not-found.tsx`.

3. **Granular:** Dùng try-catch trong component để xử lý lỗi cho từng phần dữ liệu. Kết hợp với fallback data để trang không bị crash hoàn toàn khi một API fail.

Best practice là kết hợp cả 3: try-catch cho từng fetch, `notFound()` cho 404, và `error.tsx` làm safety net cho mọi lỗi không dự đoán được.
