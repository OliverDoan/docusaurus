---
sidebar_position: 4
title: "4. Caching title: "Caching & Revalidation" Revalidation"
---

# Caching & Revalidation

Caching là một trong những khái niệm quan trọng nhất khi làm việc với Next.js, nhưng cũng là khái niệm **khó hiểu nhất** với nhiều người. Next.js có **4 tầng caching khác nhau**, mỗi tầng phục vụ một mục đích riêng. Hãy tưởng tượng hệ thống caching như việc lưu trữ thức ăn: bạn có tủ lạnh ở nhà (Router Cache), tự động ở cửa hàng (Data Cache), kho lạnh ở nhà máy (Full Route Cache), và sổ tay ghi nhớ công thức (Request Memoization).

---

## 1. 4 Layers of Caching trong Next.js

### Tổng quan

```
Browser (Client)
  └── Router Cache (Layer 4 -- cache RSC payload tren client)

Server
  ├── Request Memoization (Layer 1 -- deduplicate fetch trong 1 render)
  ├── Data Cache (Layer 2 -- cache response cua fetch)
  └── Full Route Cache (Layer 3 -- cache HTML + RSC payload)
```

### Layer 1: Request Memoization (React Cache)

**Mục đích:** Nếu nhiều component trong **cùng một request** gọi `fetch()` với cùng URL, React chỉ gửi **một request thực sự** và chia sẻ kết quả cho tất cả.

**Thời gian sống:** Chỉ trong **một server render** (một request duy nhat). Không persistent giữa các request.

```tsx
// app/layout.tsx
async function layUser() {
  // Gọi API này
  const res = await fetch('https://api.example.com/user/me');
  return res.json();
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await layUser(); // Request 1 -- gửi request thật
  return (
    <html>
      <body>
        <nav>Xin chao, {user.ten}!</nav>
        {children}
      </body>
    </html>
  );
}
```

```tsx
// app/page.tsx
async function layUser() {
  // Cùng URL -- React KHÔNG gửi request mới!
  const res = await fetch('https://api.example.com/user/me');
  return res.json();
}

export default async function TrangChu() {
  const user = await layUser(); // Request 2 -- dùng kết quả đã memo!
  return <h1>Dashboard cua {user.ten}</h1>;
}
```

Kết quả: Chỉ **1 HTTP request** được gửi đi, dù `layUser()` được gọi ở 2 nơi.

### Cách hoạt động

```
Component A goi fetch(url)
  --> Kiểm tra: có ai đã fetch url này chưa?
  --> Chưa: Gửi request thật, lưu kết quả vào memo
  --> Đã có: Trả lại kết quả từ memo

Component B goi fetch(url)
  --> Kiểm tra: có ai đã fetch url này chưa?
  --> Đã có: Trả lại kết quả từ memo (KHONG gui request)
```

**Điều kiện để memoize:**
- Cùng URL và cùng options
- Cùng server render pass
- Phải là `GET` request (POST không được memoize)

---

### Layer 2: Data Cache (Fetch Cache)

**Mục đích:** Cache response của `fetch()` **across requests và deployments**. Khác với Request Memoization (chỉ trong 1 render), Data Cache tồn tại **lâu dài** cho đến khi bị revalidate.

**Thời gian sống:** Persistent (vĩnh viễn) cho đến khi revalidate hoặc opt out.

```tsx
// Fetch nay được cache vĩnh viễn (mặc định Next.js 14)
const res = await fetch('https://api.example.com/danh-muc', {
  cache: 'force-cache',
});
// Request đầu tiên: gọi API thật --> lưu vào Data Cache
// Request thứ 2, 3, ...: lấy từ Data Cache, KHÔNG gọi API

// Fetch này cache 60 giây
const res = await fetch('https://api.example.com/san-pham', {
  next: { revalidate: 60 },
});
// Trong 60 giây: lấy từ Data Cache
// Sau 60 giây: request tiếp theo trigger revalidation

// Fetch này KHÔNG cache
const res = await fetch('https://api.example.com/gia-vang', {
  cache: 'no-store',
});
// Mọi request đều gọi API thật
```

### So sánh Request Memoization vs Data Cache

| Tính năng | Request Memoization | Data Cache |
|---|---|---|
| Tồn tại trong | 1 server render | Across requests |
| Điều khiển bởi | React | Next.js |
| Áp dụng cho | fetch GET trong render | fetch với cache options |
| Persistent | Không | Co |
| Opt out | Không can | `cache: 'no-store'` |

---

### Layer 3: Full Route Cache (RSC Payload + HTML)

**Mục đích:** Cache **toàn bộ kết quả render** của một route -- bao gồm HTML và RSC (React Server Component) Payload. Khi user truy cập route, Next.js trả trang đã render sẵn từ cache thay vì render lại.

**Thời gian sống:** Persistent cho đến khi revalidate. Chỉ áp dụng cho **static routes** (không có dynamic data).

```tsx
// Route này được Full Route Cache vì không có dynamic data
// app/gioi-thiếu/page.tsx
export default function GioiThieu() {
  return (
    <div>
      <h1>Giới thiệu công ty</h1>
      <p>Nội dung tĩnh -- cache toàn bộ trang</p>
    </div>
  );
}
// --> HTML và RSC Payload được cache luc build time
```

```tsx
// Route này KHÔNG được Full Route Cache vì có dynamic data
// app/dashboard/page.tsx
export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const data = await fetch('https://api.example.com/stats', {
    cache: 'no-store',
  });
  // ...
}
// --> Render mới mỗi request
```

**Các yếu tố khiến route trở nên dynamic (không được Full Route Cache):**
- Sử dụng `cookies()`, `headers()`, `searchParams`
- `fetch()` voi `cache: 'no-store'`
- Route segment config: `export const dynamic = 'force-dynamic'`
- Bất kỳ dynamic function nào khác

---

### Layer 4: Router Cache (Client-side)

**Mục đích:** Cache RSC Payload **trên browser của user**. Khi user navigate giữa các trang, Next.js lưu trang đã visit vào Router Cache. Khi quay lại trang đó, hiển thị từ cache ngay lập tức mà không cần request server.

**Thời gian sống:**
- **Static routes:** 5 phút
- **Dynamic routes:** 30 giây
- Reset khi reload trang (hard refresh)

```
User truy cập /san-pham
  --> Request server, nhận RSC Payload
  --> Lưu vào Router Cache

User navigate sang /gioi-thieu
  --> Request server, nhận RSC Payload
  --> Lưu vào Router Cache

User quay lai /san-pham
  --> Lấy từ Router Cache (KHÔNG request server)
  --> Hiển thị ngay lập tức (tưởng như instant)
```

**Lưu ý quan trọng (Next.js 15+):** Từ Next.js 15, Router Cache **không cache dynamic routes mặc định** nữa. Bạn cần opt-in nếu muốn cache:

```tsx
// next.config.js (Next.js 15+)
module.exports = {
  experimental: {
    staleTimes: {
      dynamic: 30, // Cache dynamic routes 30 giây
      static: 300, // Cache static routes 5 phút
    },
  },
};
```

---

## 2. Time-based Revalidation

Time-based revalidation là cách đơn giản nhất -- tự động revalidate cache sau **N giây**.

### Cách 1: Trong fetch options

```tsx
// Revalidate mỗi 60 giây
const res = await fetch('https://api.example.com/san-pham', {
  next: { revalidate: 60 },
});
```

### Cách 2: Route segment config

```tsx
// app/tin-tuc/page.tsx
// Áp dụng revalidate cho TOÀN BỘ route
export const revalidate = 300; // 5 phut

export default async function TinTuc() {
  const res = await fetch('https://api.example.com/tin-tuc');
  // Fetch này sẽ được revalidate mỗi 5 phút
  // ...
}
```

### Stale-While-Revalidate behavior

```
T=0s:   Build --> Cache HTML (version 1)
T=1-59s: Request --> Trả HTML từ cache (version 1) [NHANH]
T=60s:   Request --> Trả HTML cũ (version 1) [NHANH]
                 --> Trigger re-render ở background
T=61s:   Re-render xong --> Cập nhật cache (version 2)
T=62s+:  Request --> Trả HTML mới (version 2) [NHANH]
```

### Quy tắc khi nhiều fetch có revalidate khác nhau

Nếu một route có nhiều fetch với revalidate khác nhau, **giá trị nhỏ nhất được dùng** cho toàn bộ route:

```tsx
// Route này sẽ revalidate mỗi 30 giây (giá trị nhỏ nhất)
export default async function TrangTongHop() {
  // Fetch 1: revalidate 30 giây
  const giaCoin = await fetch('https://api.example.com/gia-coin', {
    next: { revalidate: 30 },
  });

  // Fetch 2: revalidate 3600 giây (1 giờ)
  const tinTuc = await fetch('https://api.example.com/tin-tuc', {
    next: { revalidate: 3600 },
  });

  // Toàn bộ route sẽ revalidate mỗi 30 giây
}
```

---

## 3. On-demand Revalidation

Thay vì đợi hết thời gian, bạn có thể **chủ động revalidate** khi biết dữ liệu đã thay đổi. Giống như việc bạn tự thay đổi món ăn trên thực đơn khi có nguyên liệu mới -- không cần đợi hết ngày.

### `revalidatePath()` -- Revalidate theo đường dẫn

```tsx
// app/actions/san-pham.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function taoSanPham(formData: FormData) {
  // Lưu sản phẩm mới vào database
  await prisma.sanPham.create({
    data: {
      ten: formData.get('ten') as string,
      gia: Number(formData.get('gia')),
    },
  });

  // Revalidate trang danh sách sản phẩm
  revalidatePath('/san-pham');

  // Revalidate toàn bộ route group
  revalidatePath('/san-pham', 'layout'); // Revalidate layout + tất cả trang con
}
```

### `revalidateTag()` -- Revalidate theo tag

Tag cho phép bạn **nhóm các fetch request** và revalidate tất cả cùng lúc:

```tsx
// app/san-pham/page.tsx
// Gán tag cho fetch request
async function laySanPham() {
  const res = await fetch('https://api.example.com/san-pham', {
    next: {
      tags: ['san-pham'], // Tag này để revalidate sau
    },
  });
  return res.json();
}

async function layDanhMuc() {
  const res = await fetch('https://api.example.com/danh-muc', {
    next: {
      tags: ['san-pham', 'danh-muc'], // Nhiều tag
    },
  });
  return res.json();
}
```

```tsx
// app/actions/san-pham.ts
'use server';

import { revalidateTag } from 'next/cache';

export async function capNhatSanPham(id: string, formData: FormData) {
  await prisma.sanPham.update({
    where: { id },
    data: { ten: formData.get('ten') as string },
  });

  // Revalidate tất cả fetch có tag 'san-pham'
  // Cả laySanPham() và layDanhMuc() đều bị revalidate
  revalidateTag('san-pham');
}
```

### Revalidate tu API Route (Webhook)

Hữu ích khi nhận webhook từ CMS hoặc hệ thống khác:

```tsx
// app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  // Kiểm tra secret để bảo mật
  const secret = request.headers.get('x-revalidate-secret');
  if (secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const tag = body.tag;

  if (!tag) {
    return Response.json({ error: 'Missing tag' }, { status: 400 });
  }

  // Revalidate tag được chỉ định
  revalidateTag(tag);

  return Response.json({ revalidated: true, tag });
}
```

### So sánh revalidatePath vs revalidateTag

| Tính năng | `revalidatePath` | `revalidateTag` |
|---|---|---|
| Revalidate theo | Đường dẫn URL | Tag được gán cho fetch |
| Phạm vi | 1 route cụ thể | Tất cả fetch có tag đó |
| Dùng khi | Biết chính xác route nào cần cập nhật | Nhiều route dùng chung dữ liệu |
| Ví dụ | Sửa bài viết `/bai-viet/hello` | Sửa danh mục --> tất cả trang dùng danh mục |

---

## 4. Opting Out of Caching

Đôi khi bạn cần **tắt caching hoàn toàn**. Đây là các cách:

### Cấp độ fetch

```tsx
// Tắt cache cho 1 fetch cụ thể
const res = await fetch(url, { cache: 'no-store' });
```

### Cấp độ route

```tsx
// app/dashboard/page.tsx
// Tắt cache cho toàn bộ route
export const dynamic = 'force-dynamic';
// HOAC
export const revalidate = 0;
```

### Cấp độ toàn ứng dụng

```tsx
// next.config.js -- KHÔNG khuyến nghị, nhưng có thể
module.exports = {
  experimental: {
    // Tắt Data Cache mặc định (Next.js 15 đã làm điều này)
  },
};
```

### Cấp độ function

Sử dụng dynamic functions sẽ tự động opt out:

```tsx
import { cookies, headers } from 'next/headers';

export default async function TrangCanh() {
  // Bất kỳ hàm nào trong số này sẽ khiến route trở thành dynamic
  const cookieStore = cookies();
  const headerList = headers();
  // Route này sẽ không được Full Route Cache
}
```

---

## 5. Cache Tags -- Chiến lược đặt tên

Một hệ thống tag tốt giúp bạn revalidate chính xác những gì cần thiết:

```tsx
// Chiến lược đặt tên tag: [entity]-[scope]-[id]

// Tag chung cho entity
fetch(url, { next: { tags: ['san-pham'] } }); // Tất cả sản phẩm
fetch(url, { next: { tags: ['bai-viet'] } }); // Tất cả bài viết

// Tag cụ thể
fetch(url, { next: { tags: ['san-pham-123'] } }); // Sản phẩm có ID 123
fetch(url, { next: { tags: ['bai-viet-hello-world'] } }); // 1 bài viết cụ thể

// Nhiều tag cho 1 fetch
fetch(url, {
  next: {
    tags: [
      'san-pham',           // Revalidate khi bất kỳ sản phẩm nào thay đổi
      'san-pham-123',       // Revalidate khi sản phẩm 123 thay đổi
      'danh-muc-dien-thoai', // Revalidate khi danh mục thay đổi
    ],
  },
});
```

```tsx
// app/actions/san-pham.ts
'use server';

import { revalidateTag } from 'next/cache';

export async function capNhatSanPham(id: string) {
  await prisma.sanPham.update({ where: { id }, data: { /* ... */ } });

  // Revalidate cụ thể sản phẩm này
  revalidateTag(`san-pham-${id}`);

  // Và revalidate danh sách sản phẩm (vì danh sách cũng cần cập nhật)
  revalidateTag('san-pham');
}

export async function xoaSanPham(id: string) {
  await prisma.sanPham.delete({ where: { id } });

  // Revalidate toàn bộ sản phẩm vì danh sách đã thay đổi
  revalidateTag('san-pham');
}
```

---

## 6. Debugging Cache Behavior

### Kiem tra header response

```bash
# Kiểm tra cache status qua headers
curl -I https://your-site.com/san-pham

# Tìm các headers này:
# x-nextjs-cache: HIT    --> Trang được lấy từ cache
# x-nextjs-cache: MISS   --> Trang được render mới
# x-nextjs-cache: STALE  --> Trang cũ đang được revalidate
```

### Logging trong development

```tsx
// next.config.js
module.exports = {
  logging: {
    fetches: {
      fullUrl: true, // Hiển thị URL đầy đủ của mỗi fetch trong console
    },
  },
};
```

Khi chạy `npm run dev`, bạn sẽ thấy trong terminal:

```bash
# Output mau:
GET https://api.example.com/san-pham 200 in 45ms (cache: HIT)
GET https://api.example.com/gia-vang 200 in 120ms (cache: SKIP)
```

### Debug trong code

```tsx
// Thêm log để debug caching
async function layData() {
  console.log('layData() duoc goi luc:', new Date().toISOString());

  const res = await fetch('https://api.example.com/data', {
    next: { revalidate: 60, tags: ['data'] },
  });

  console.log('Response status:', res.status);
  console.log('Cache status:', res.headers.get('x-cache'));

  return res.json();
}
```

### Checklist debug caching

Khi cache không hoạt động như mong đợi:

1. Kiểm tra route có dynamic không: `cookies()`, `headers()`, `searchParams`
2. Kiểm tra fetch options: `cache: 'no-store'` se tất cảche
3. Kiểm tra route segment config: `dynamic = 'force-dynamic'`
4. Kiểm tra revalidate value: `revalidate = 0` nghĩa là không cache
5. Trong dev mode (`npm run dev`), caching behavior có thể khác production

---

## 7. Lỗi thường gặp

### Lỗi 1: Tưởng rằng dev mode có cache giống production

```bash
# Development mode (npm run dev):
# - Data Cache: KHÔNG hoạt động mặc định
# - Full Route Cache: KHONG hoạt động
# - Router Cache: Hoạt động bình thường

# Production mode (npm run build && npm run start):
# - Tất cả cache hoạt động đầy đủ

# Để test cache, LUÔN test với production build
npm run build && npm run start
```

### Lỗi 2: Quên revalidate sau khi mutation

```tsx
// SAI -- cập nhật database nhưng quên revalidate
'use server';
export async function capNhatSanPham(id: string, data: any) {
  await prisma.sanPham.update({ where: { id }, data });
  // Quên revalidate --> trang vẫn hiển thị dữ liệu cũ!
}

// ĐÚNG -- luôn revalidate sau mutation
'use server';
export async function capNhatSanPham(id: string, data: any) {
  await prisma.sanPham.update({ where: { id }, data });
  revalidatePath('/san-pham');       // Revalidate danh sách
  revalidatePath(`/san-pham/${id}`); // Revalidate trang chi tiet
}
```

### Lỗi 3: Nhầm revalidate và redirect

```tsx
// revalidate và redirect là 2 việc KHÁC NHAU:

// revalidate: Xóa cache, request tiếp theo sẽ render mới
revalidatePath('/san-pham'); // Không chuyển trang

// redirect: Chuyển user sang trang khác
redirect('/san-pham'); // Chuyển trang ngay lập tức

// Thường dùng cả hai:
'use server';
export async function taoSanPham(formData: FormData) {
  await prisma.sanPham.create({ data: { /* ... */ } });
  revalidatePath('/san-pham');  // Xóa cache trước
  redirect('/san-pham');        // Rồi chuyển trang
}
```

### Lỗi 4: Dùng Router Cache cũ

```tsx
'use client';
import { useRouter } from 'next/navigation';

export default function NutCapNhat() {
  const router = useRouter();

  const capNhat = () => {
    // router.refresh() xóa Router Cache cho trang hiện tại
    // và re-fetch dữ liệu từ server
    router.refresh();
  };

  return <button onClick={capNhat}>Cập nhật dữ liệu</button>;
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: Mô tả 4 tầng caching trong Next.js App Router?

**Trả lời:**

1. **Request Memoization:** Tự động deduplicate fetch() giống nhau trong cùng một server render. Ví dụ: layout và page gọi cùng API --> chỉ 1 request thật sự. Điều khiển bởi React, chỉ tồn tại trong 1 render pass.

2. **Data Cache:** Cache response của fetch() across requests. Persistent cho đến khi revalidate (time-based hoac on-demand). Điều khiển qua `cache` và `next.revalidate` options của fetch.

3. **Full Route Cache:** Cache toàn bộ HTML và RSC Payload của static routes. Tạo lúc build time. Route với dynamic data (cookies, no-store fetch) không được Full Route Cache.

4. **Router Cache:** Cache RSC Payload trên browser (client-side). Khi user navigate giữa các trang, trang da visit được lưu lai. Quay lại trang đó sẽ load từ cache (tưởng như instant). Reset khi hard refresh.

### Câu 2: Sự khác nhau giữa revalidatePath và revalidateTag?

**Trả lời:**

- `revalidatePath('/san-pham')`: Revalidate **một route cụ thể**. Tất cả data cache liên quan đến route đó sẽ bị xóa. Phù hợp khi biết chính xác route nào ảnh hưởng.

- `revalidateTag('san-pham')`: Revalidate **tất cả fetch có tag đó**, bất kể ở route nào. Phù hợp khi một loại dữ liệu được sử dụng ở nhiều route khác nhau. Ví dụ: thay đổi danh mục sản phẩm ảnh hưởng cả trang danh sách, trang chi tiết, và trang tìm kiếm.

Best practice: Dùng tag cho dữ liệu dùng chung, dùng path cho mutations chỉ ảnh hưởng 1 route.

### Câu 3: Tại sao trang của tôi không cập nhật dữ liệu mới dù đã gọi revalidatePath?

**Trả lời:**

Có thể do:
1. **Router Cache:** Browser vẫn cache trang cũ. Dùng `router.refresh()` hoặc hard refresh (Ctrl+Shift+R).
2. **Sai path:** Kiểm tra path truyền vào có đúng không (phải khớp với route structure).
3. **Dev mode:** Caching behavior trong dev khác production. Test với `npm run build && npm run start`.
4. **Timing:** revalidatePath chỉ đánh dấu cache là stale. Request **tiếp theo** mới nhận dữ liệu mới.
5. **CDN Cache:** Nếu deploy trên Vercel hay CDN khác, có thể CDN vẫn cache response cũ.

### Câu 4: Làm sao tắt hoàn toàn caching cho một route?

**Trả lời:**

Có nhiều cấp độ:

```tsx
// Cấp độ route (khuyen nghi)
export const dynamic = 'force-dynamic';

// Cấp độ fetch
fetch(url, { cache: 'no-store' });

// Cấp độ route (alternative)
export const revalidate = 0;
```

Hoặc sử dụng dynamic functions (`cookies()`, `headers()`) sẽ tự động opt out khỏi caching.

**Lưu ý:** Tắt cache nghĩa là mỗi request đều render mới --> tăng tải server và chậm hơn. Chỉ tắt khi thật sự cần thiết.

### Câu 5: Giải thích Stale-While-Revalidate pattern trong ISR?

**Trả lời:**

Stale-While-Revalidate là pattern trong đó:

1. **Stale:** Khi cache hết hạn, request vẫn nhận dữ liệu cũ (stale) ngay lập tức -- user không phải đợi.
2. **While-Revalidate:** Đồng thời, Next.js render lại trang ở background với dữ liệu mới.
3. **Update:** Khi render xong, cache được cập nhật. Request tiếp theo nhận dữ liệu mới.

Ưu điểm: User luôn nhận response nhanh (từ cache), trong khi dữ liệu vẫn được cập nhật ở background. Không ai phải đợi "loading" như SSR truyền thống.

Nhược điểm: Có thể có 1 request nhận dữ liệu cũ (giữa lúc cache hết hạn và lúc re-render xong). Chấp nhận được cho hầu hết trường hợp (tin tức, sản phẩm), không phù hợp cho dữ liệu cần chính xác tuyệt đối (tài chính, y tế).
