---
sidebar_position: 1
title: "Các phương pháp Rendering"
---

# Các phương pháp Rendering

Khi bạn xây dựng một ứng dụng web với Next.js, một trong những quyết định quan trọng nhất là **chọn phương pháp rendering phù hợp**. Hãy tưởng tượng bạn mở một quán phở -- bạn có thể nấu sẵn từ sáng sớm (Static), nấu theo từng order (Server-Side), hoặc để khách tự pha mì gói tại bàn (Client-Side). Mỗi cách có ưu nhược điểm riêng, và Next.js cho phép bạn **kết hợp tất cả** trong cùng một ứng dụng.

---

## 1. SSR -- Server-Side Rendering

### SSR là gì?

SSR có nghĩa là **mỗi khi người dùng gửi request, server sẽ render HTML mới hoàn toàn** rồi gửi về browser. Giống như đầu bếp nấu món ăn theo từng order -- mỗi khách đến đều nhận được món vừa nấu xong, nóng hổi và tươi mới.

### Khi nào dùng SSR?

- Trang cần dữ liệu **luôn mới nhất** (realtime dashboard, trang giá cổ phiếu)
- Trang cần **SEO tốt** nhưng dữ liệu thay đổi liên tục
- Trang có dữ liệu phụ thuộc vào **thông tin user** (session, cookies)

### Code ví dụ

Trong Next.js App Router, bạn chỉ cần fetch data mà **không cache** là đã có SSR:

```tsx
// app/san-pham/page.tsx
// Trang danh sách sản phẩm -- render mới mỗi request

async function laySanPham() {
  // cache: 'no-store' = không cache = render mỗi request (SSR)
  const res = await fetch('https://api.example.com/san-pham', {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Không thể tải danh sách sản phẩm');
  }

  return res.json();
}

export default async function TrangSanPham() {
  const sanPhams = await laySanPham();

  return (
    <div>
      <h1>Danh sách sản phẩm</h1>
      <p>Cập nhật lúc: {new Date().toLocaleString('vi-VN')}</p>
      <ul>
        {sanPhams.map((sp: { id: number; ten: string; gia: number }) => (
          <li key={sp.id}>
            {sp.ten} - {sp.gia.toLocaleString('vi-VN')}đ
          </li>
        ))}
      </ul>
    </div>
  );
}
```

Bạn cũng có thể dùng `export const dynamic = 'force-dynamic'` ở đầu file để ép toàn bộ trang render động:

```tsx
// app/dashboard/page.tsx
// Ép toàn bộ trang thành SSR
export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const data = await fetch('https://api.example.com/dashboard');
  const thongKe = await data.json();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Tổng đơn hàng hôm nay: {thongKe.tongDon}</p>
      <p>Doanh thu: {thongKe.doanhThu.toLocaleString('vi-VN')}đ</p>
    </div>
  );
}
```

---

## 2. SSG -- Static Site Generation

### SSG là gì?

SSG có nghĩa là **HTML được tạo sẵn lúc build time** (khi chạy `next build`). Sau đó mọi request đều nhận được file HTML tĩnh đã có sẵn. Giống như in sách -- một lần in xong, mỗi người đều nhận bản giống nhau, siêu nhanh vì không cần chờ "viết".

### Khi nào dùng SSG?

- Trang **ít thay đổi**: blog, tài liệu (docs), landing page
- Trang **không phụ thuộc vào user cụ thể**
- Muốn **hiệu suất tối đa** và **chi phí hosting thấp**

### Code ví dụ

Trong App Router, mặc định Server Components đã là static nếu không có dynamic data:

```tsx
// app/gioi-thieu/page.tsx
// Trang giới thiệu -- nội dung tĩnh, tự động SSG

export default function TrangGioiThieu() {
  return (
    <div>
      <h1>Giới thiệu công ty</h1>
      <p>Chúng tôi là công ty phần mềm hàng đầu Việt Nam.</p>
      <p>Thành lập năm 2020, với hơn 100 nhân viên.</p>
    </div>
  );
}
```

Với trang có dynamic routes, dùng `generateStaticParams` để Next.js biết cần generate những trang nào lúc build:

```tsx
// app/bai-viet/[slug]/page.tsx
// Tạo sẵn trang cho mỗi bài viết lúc build

// Hàm này chạy lúc build -- trả về danh sách slug cần generate
export async function generateStaticParams() {
  const res = await fetch('https://api.example.com/bai-viet');
  const baiViets = await res.json();

  // Trả về mảng các params cho từng trang
  return baiViets.map((bv: { slug: string }) => ({
    slug: bv.slug,
  }));
}

// Component hiển thị bài viết
export default async function TrangBaiViet({
  params,
}: {
  params: { slug: string };
}) {
  const res = await fetch(
    `https://api.example.com/bai-viet/${params.slug}`,
    { cache: 'force-cache' } // Cache vĩnh viễn (SSG behavior)
  );
  const baiViet = await res.json();

  return (
    <article>
      <h1>{baiViet.tieuDe}</h1>
      <p>Tác giả: {baiViet.tacGia}</p>
      <div dangerouslySetInnerHTML={{ __html: baiViet.noiDung }} />
    </article>
  );
}
```

---

## 3. ISR -- Incremental Static Regeneration

### ISR là gì?

ISR là **sự kết hợp giữa SSG và SSR**. Trang được generate tĩnh lúc build, nhưng sẽ **tự động cập nhật lại** sau một khoảng thời gian (revalidate). Giống như quán bánh mì -- làm sẵn một mẻ bánh, nhưng cứ mỗi 30 phút lại nướng mẻ mới để đảm bảo bánh luôn tươi.

### Khi nào dùng ISR?

- Trang cần **performance tốt** nhưng dữ liệu **thỉnh thoảng thay đổi**
- Blog, trang sản phẩm e-commerce, trang tin tức
- Muốn **cân bằng giữa tốc độ và độ tươi** của dữ liệu

### Code ví dụ

```tsx
// app/tin-tuc/page.tsx
// Trang tin tức -- revalidate mỗi 60 giây

async function layTinTuc() {
  const res = await fetch('https://api.example.com/tin-tuc', {
    next: { revalidate: 60 }, // Tự động cập nhật mỗi 60 giây
  });
  return res.json();
}

export default async function TrangTinTuc() {
  const tinTucs = await layTinTuc();

  return (
    <div>
      <h1>Tin tức mới nhất</h1>
      {tinTucs.map((tin: { id: number; tieuDe: string; tomTat: string }) => (
        <article key={tin.id}>
          <h2>{tin.tieuDe}</h2>
          <p>{tin.tomTat}</p>
        </article>
      ))}
    </div>
  );
}
```

Bạn cũng có thể set revalidate cho toàn bộ route:

```tsx
// app/san-pham/page.tsx
// Revalidate toàn bộ route mỗi 5 phút (300 giây)
export const revalidate = 300;

export default async function TrangSanPham() {
  const res = await fetch('https://api.example.com/san-pham');
  const sanPhams = await res.json();

  return (
    <div>
      <h1>Sản phẩm</h1>
      {/* Render danh sách sản phẩm */}
    </div>
  );
}
```

---

## 4. CSR -- Client-Side Rendering

### CSR là gì?

CSR có nghĩa là **browser tải về JavaScript, rồi tự render nội dung** trên máy người dùng. Server chỉ gửi một file HTML gần như trống, rồi JavaScript sẽ "vẽ" giao diện lên. Giống như gửi nguyên liệu và công thức cho khách, để khách tự nấu tại nhà.

### Khi nào dùng CSR?

- Phần giao diện **tương tác nhiều** (modal, form phức tạp, real-time chat)
- Dữ liệu **chỉ người dùng cụ thể mới thấy** (không cần SEO)
- Dashboard nội bộ, ứng dụng sau khi đăng nhập

### Code ví dụ

Trong Next.js App Router, CSR được dùng qua `"use client"` directive:

```tsx
'use client';
// app/components/TimKiemSanPham.tsx
// Component tìm kiếm -- render hoàn toàn trên browser

import { useState, useEffect } from 'react';

interface SanPham {
  id: number;
  ten: string;
  gia: number;
}

export default function TimKiemSanPham() {
  const [tuKhoa, setTuKhoa] = useState('');
  const [ketQua, setKetQua] = useState<SanPham[]>([]);
  const [dangTai, setDangTai] = useState(false);

  useEffect(() => {
    // Không tìm nếu từ khóa quá ngắn
    if (tuKhoa.length < 2) {
      setKetQua([]);
      return;
    }

    const timKiem = async () => {
      setDangTai(true);
      try {
        const res = await fetch(`/api/tim-kiem?q=${tuKhoa}`);
        const data = await res.json();
        setKetQua(data);
      } catch (error) {
        console.error('Lỗi tìm kiếm:', error);
      } finally {
        setDangTai(false);
      }
    };

    // Debounce: chờ 300ms sau khi user ngừng gõ
    const timer = setTimeout(timKiem, 300);
    return () => clearTimeout(timer);
  }, [tuKhoa]);

  return (
    <div>
      <input
        type="text"
        value={tuKhoa}
        onChange={(e) => setTuKhoa(e.target.value)}
        placeholder="Tìm kiếm sản phẩm..."
      />
      {dangTai && <p>Đang tìm kiếm...</p>}
      <ul>
        {ketQua.map((sp) => (
          <li key={sp.id}>
            {sp.ten} - {sp.gia.toLocaleString('vi-VN')}đ
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 5. Bảng so sánh: SSR vs SSG vs ISR vs CSR

| Tiêu chí | SSR | SSG | ISR | CSR |
|---|---|---|---|---|
| **Thời điểm render** | Mỗi request | Lúc build | Lúc build + revalidate | Trên browser |
| **Tốc độ (TTFB)** | Chậm hơn | Nhanh nhất | Nhanh (như SSG) | Nhanh (HTML trống) |
| **SEO** | Tot | Tot | Tot | Kem |
| **Dữ liệu** | Luôn mới nhất | Cũ (từ lúc build) | Tương đối mới | Luôn mới nhất |
| **Tải server** | Cao | Thấp nhất | Thấp | Thấp |
| **Phù hợp cho** | Dashboard, real-time | Blog, docs, landing | E-commerce, tin tức | SPA, form, chat |
| **Caching** | Không cache HTML | Cache trên CDN | Cache + auto-refresh | Cache trên client |

### Tóm tắt trực quan

```
SSG:  Build --> HTML tĩnh --> CDN --> User (NHANH nhất)
ISR:  Build --> HTML tĩnh --> CDN --> User (revalidate sau N giây)
SSR:  Request --> Server render --> User (luôn mới nhất)
CSR:  Request --> HTML trống + JS --> Browser render (tương tác tốt)
```

---

## 6. Khi nào dùng phương pháp nào?

### Cây quyết định đơn giản

```
Dữ liệu có thay đổi theo từng user không?
├── CÓ --> Dữ liệu cần SEO?
│   ├── CÓ --> SSR
│   └── KHÔNG --> CSR
└── KHÔNG --> Dữ liệu có thay đổi thường xuyên không?
    ├── CÓ --> ISR (set revalidate phù hợp)
    └── KHÔNG --> SSG
```

### Ví dụ thực tế

| Loại trang | Phương pháp | Lý do |
|---|---|---|
| Trang chủ công ty | SSG | Nội dung ít thay đổi, cần tốc độ |
| Blog cá nhân | SSG / ISR | Bài viết ít thay đổi |
| Trang sản phẩm e-commerce | ISR (60s) | Giá và tồn kho thỉnh thoảng thay đổi |
| Feed mạng xã hội | SSR | Dữ liệu khác nhau theo user, cần SEO |
| Dashboard admin | CSR | Không cần SEO, tương tác nhiều |
| Trang thanh toán | CSR | Không cần SEO, logic phức tạp |

---

## 7. Hybrid Rendering trong Next.js

Sức mạnh thực sự của Next.js nằm ở khả năng **kết hợp nhiều phương pháp rendering trong cùng một ứng dụng**. Mỗi route có thể chọn phương pháp khác nhau:

```tsx
// app/page.tsx -- SSG (trang chủ tĩnh)
export default function TrangChu() {
  return <h1>Chào mừng đến với website</h1>;
}
```

```tsx
// app/san-pham/page.tsx -- ISR (revalidate 5 phút)
export const revalidate = 300;

export default async function SanPham() {
  const data = await fetch('https://api.example.com/san-pham');
  // ...
}
```

```tsx
// app/dashboard/page.tsx -- SSR (luôn mới nhất)
export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const data = await fetch('https://api.example.com/stats');
  // ...
}
```

```tsx
'use client';
// app/components/Chat.tsx -- CSR (tương tác real-time)
export default function Chat() {
  // WebSocket, useState, useEffect...
}
```

### Kết hợp trong cùng một trang

Bạn có thể mix Server Components (SSR/SSG) với Client Components (CSR) trong cùng một trang:

```tsx
// app/san-pham/[id]/page.tsx
// Server Component -- render trên server (SSR hoặc ISR)
import ThemVaoGio from '@/components/ThemVaoGio';

export default async function ChiTietSanPham({
  params,
}: {
  params: { id: string };
}) {
  // Phần này render trên server -- tốt cho SEO
  const res = await fetch(`https://api.example.com/san-pham/${params.id}`, {
    next: { revalidate: 60 },
  });
  const sp = await res.json();

  return (
    <div>
      {/* Nội dung tĩnh -- render server, SEO tốt */}
      <h1>{sp.ten}</h1>
      <p>{sp.moTa}</p>
      <p>Giá: {sp.gia.toLocaleString('vi-VN')}đ</p>

      {/* Component tương tác -- render client */}
      <ThemVaoGio sanPhamId={sp.id} />
    </div>
  );
}
```

```tsx
'use client';
// app/components/ThemVaoGio.tsx
// Client Component -- xử lý tương tác

import { useState } from 'react';

export default function ThemVaoGio({ sanPhamId }: { sanPhamId: number }) {
  const [soLuong, setSoLuong] = useState(1);
  const [daThemVaoGio, setDaThemVaoGio] = useState(false);

  const xuLyThemVaoGio = () => {
    // Logic thêm vào giỏ hàng
    setDaThemVaoGio(true);
  };

  return (
    <div>
      <input
        type="number"
        value={soLuong}
        onChange={(e) => setSoLuong(Number(e.target.value))}
        min={1}
        max={10}
      />
      <button onClick={xuLyThemVaoGio}>
        {daThemVaoGio ? 'Da them vao gio!' : 'Them vao gio hang'}
      </button>
    </div>
  );
}
```

---

## 8. Loi thuong gap

### Loi 1: Dung `useState` hoac `useEffect` trong Server Component

```tsx
// SAI -- Server Component khong ho tro hooks
export default async function TrangSanPham() {
  const [data, setData] = useState([]); // LOI!
  // ...
}

// DUNG -- Fetch truc tiep trong Server Component
export default async function TrangSanPham() {
  const res = await fetch('https://api.example.com/san-pham', {
    cache: 'no-store',
  });
  const data = await res.json();
  // ...
}
```

### Loi 2: Quen `"use client"` khi dung hooks

```tsx
// SAI -- Thieu "use client"
import { useState } from 'react';

export default function BoiDem() {
  const [dem, setDem] = useState(0); // LOI runtime!
  return <button onClick={() => setDem(dem + 1)}>{dem}</button>;
}

// DUNG -- Them "use client" o dong dau tien
'use client';

import { useState } from 'react';

export default function BoiDem() {
  const [dem, setDem] = useState(0);
  return <button onClick={() => setDem(dem + 1)}>{dem}</button>;
}
```

### Loi 3: Nham lan giua `cache: 'no-store'` va `revalidate: 0`

```tsx
// Ca hai deu co nghia la "khong cache" nhung cach dung khac nhau:

// Cach 1: Dung option cache
fetch(url, { cache: 'no-store' });

// Cach 2: Dung next.revalidate = 0
fetch(url, { next: { revalidate: 0 } });

// Cach 3: Dung route segment config
export const revalidate = 0; // Ap dung cho toan bo route
```

### Loi 4: Nghi SSG khong can server

SSG tao HTML tinh luc build, nhung **van can server de chay `next build`**. Sau khi build xong, ban co the deploy len bat ky static hosting nao (Vercel, Netlify, S3...).

---

## Cau hoi phong van

### Cau 1: Giai thich su khac nhau giua SSR, SSG, ISR va CSR trong Next.js?

**Tra loi:**

- **SSR (Server-Side Rendering):** HTML duoc render tren server **moi request**. Server nhan request, fetch data, render HTML roi gui ve client. Uu diem la du lieu luon moi nhat va SEO tot. Nhuoc diem la TTFB cham hon vi server phai lam viec moi request.

- **SSG (Static Site Generation):** HTML duoc tao san **luc build time**. Moi request nhan cung mot file HTML tinh tu CDN. Nhanh nhat ve TTFB, tot cho SEO, nhung du lieu co the bi cu.

- **ISR (Incremental Static Regeneration):** Ket hop SSG va SSR. Trang duoc generate tinh luc build, nhung tu dong **revalidate sau N giay**. Request dau tien sau thoi gian revalidate se trigger viec re-generate trang o background.

- **CSR (Client-Side Rendering):** Server gui HTML trong (shell), JavaScript tai ve va render noi dung tren browser. Tot cho tuong tac, nhung kem SEO vi search engine thay HTML trong.

### Cau 2: Trong Next.js App Router, lam sao de mot trang su dung SSR thay vi SSG?

**Tra loi:**

Co 3 cach chinh:

1. Dung `cache: 'no-store'` trong fetch:
```tsx
fetch(url, { cache: 'no-store' });
```

2. Dung route segment config:
```tsx
export const dynamic = 'force-dynamic';
```

3. Su dung dynamic functions nhu `cookies()`, `headers()`, hoac `searchParams` -- Next.js tu dong chuyen sang SSR.

### Cau 3: ISR hoat dong nhu the nao trong Next.js?

**Tra loi:**

ISR hoat dong theo mo hinh **stale-while-revalidate**:

1. Luc build, Next.js generate HTML tinh va cache lai.
2. Moi request trong khoang `revalidate` se nhan HTML da cache (nhanh nhu SSG).
3. Request dau tien **sau khi het thoi gian revalidate** van nhan HTML cu (stale), nhung trigger Next.js **re-generate trang o background**.
4. Khi re-generate xong, request tiep theo se nhan HTML moi.

Vi du voi `revalidate: 60`:
- Giay 0-59: Moi request nhan HTML da cache
- Giay 60: Request nay nhan HTML cu, nhung trigger re-generate
- Giay 61+: Cac request tiep theo nhan HTML moi (neu re-generate xong)

### Cau 4: Khi nao ban KHONG nen dung CSR?

**Tra loi:**

Khong nen dung CSR khi:
- Trang can **SEO tot** (search engine kho doc noi dung CSR)
- Trang can **hien thi noi dung nhanh** (FCP, LCP) -- CSR phai doi tai JS truoc khi render
- Nguoi dung co **ket noi mang cham** hoac **thiet bi yeu** -- render tren client ton tai nguyen cua thiet bi
- Noi dung trang **khong can tuong tac** -- dung SSG/SSR se nhanh hon nhieu

### Cau 5: Hybrid rendering la gi? Cho vi du thuc te.

**Tra loi:**

Hybrid rendering la kha nang **ket hop nhieu phuong phap rendering trong cung mot ung dung**. Day la diem manh cot loi cua Next.js.

Vi du mot trang e-commerce:
- **Trang chu**: SSG (noi dung tinh, toc do cao)
- **Trang danh muc san pham**: ISR voi `revalidate: 300` (cap nhat moi 5 phut)
- **Trang chi tiet san pham**: ISR voi `revalidate: 60` (gia co the thay doi)
- **Gio hang**: CSR (tuong tac nhieu, khong can SEO)
- **Trang tim kiem**: SSR (ket qua phu thuoc vao tu khoa, can SEO)
- **Dashboard admin**: CSR (chi noi bo, khong can SEO)

Trong cung mot trang, ban cung co the mix Server Components (render tren server) voi Client Components (render tren browser) de toi uu hoa tung phan cua giao dien.
