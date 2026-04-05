---
sidebar_position: 2
title: "Data Fetching"
---

# Data Fetching

Data fetching (lay du lieu) la mot trong nhung viec quan trong nhat khi xay dung ung dung web. Trong Next.js App Router, cach tiep can da thay doi hoan toan so voi Pages Router truoc day. Thay vi dung `getServerSideProps` hay `getStaticProps`, ban giờ **fetch du lieu truc tiep trong Server Components** bang `fetch()` API duoc mo rong. Hay tuong tuong nhu viec di cho -- truoc day ban phai nho nguoi khac mua ho (getServerSideProps), con bay gio ban tu di mua truc tiep (fetch trong component).

---

## 1. fetch() trong Server Components

### Extended Fetch API

Next.js mo rong `fetch()` API goc cua Web voi cac options bo sung de kiem soat **caching** va **revalidation**. Dieu nay co nghia la ban dung cung cu phap `fetch()` quen thuoc, nhung them duoc cac option dac biet cua Next.js.

```tsx
// app/bai-viet/page.tsx
// Server Component -- fetch data truc tiep, khong can "use client"

async function layBaiViet() {
  // fetch() duoc Next.js mo rong voi cac option dac biet
  const res = await fetch('https://api.example.com/bai-viet', {
    // Options cua Next.js
    next: {
      revalidate: 3600, // Revalidate moi 1 gio (3600 giay)
      tags: ['bai-viet'], // Tag de revalidate theo yeu cau
    },
  });

  if (!res.ok) {
    throw new Error('Khong the tai bai viet');
  }

  return res.json();
}

export default async function TrangBaiViet() {
  // Goi ham async truc tiep -- chi lam duoc trong Server Component
  const baiViets = await layBaiViet();

  return (
    <div>
      <h1>Danh sach bai viet</h1>
      {baiViets.map((bv: { id: number; tieuDe: string }) => (
        <article key={bv.id}>
          <h2>{bv.tieuDe}</h2>
        </article>
      ))}
    </div>
  );
}
```

### Dac diem quan trong

- **Khong can `useEffect` hay `useState`** -- fetch truc tiep trong component body
- **Khong can API route trung gian** -- Server Component goi API truc tiep
- **Tu dong deduplicate** -- neu nhieu component fetch cung URL, Next.js chi goi 1 lan
- **Chay tren server** -- API keys, database credentials khong bi lo ra client

---

## 2. Caching Behavior Mac Dinh

### Next.js 14 vs Next.js 15

**Quan trong:** Behavior mac dinh da thay doi giua cac phien ban:

```tsx
// Next.js 14: Mac dinh la cache (force-cache)
const res = await fetch('https://api.example.com/data');
// Tuong duong voi: fetch(url, { cache: 'force-cache' })

// Next.js 15+: Mac dinh la KHONG cache (no-store)
const res = await fetch('https://api.example.com/data');
// Tuong duong voi: fetch(url, { cache: 'no-store' })
```

### Cach kiem soat cache ro rang

Luon **chi dinh ro rang** caching behavior de code ro rang, tranh bi anh huong boi thay doi mac dinh giua cac phien ban:

```tsx
// 1. Khong cache -- lay du lieu moi moi request
const freshData = await fetch('https://api.example.com/data', {
  cache: 'no-store',
});

// 2. Cache vinh vien -- chi fetch 1 lan (luc build hoac request dau)
const cachedData = await fetch('https://api.example.com/data', {
  cache: 'force-cache',
});

// 3. Cache voi thoi gian -- tu dong refresh sau N giay
const timedData = await fetch('https://api.example.com/data', {
  next: { revalidate: 60 }, // Refresh sau 60 giay
});
```

---

## 3. `cache: 'no-store'` vs `cache: 'force-cache'`

### `cache: 'no-store'` -- Khong cache

Moi request deu goi API that su. Phu hop cho du lieu thay doi lien tuc.

```tsx
// app/gia-vang/page.tsx
// Gia vang thay doi lien tuc -- khong nen cache

async function layGiaVang() {
  const res = await fetch('https://api.example.com/gia-vang', {
    cache: 'no-store', // Luon lay du lieu moi nhat
  });
  return res.json();
}

export default async function TrangGiaVang() {
  const giaVang = await layGiaVang();

  return (
    <div>
      <h1>Gia vang hom nay</h1>
      <p>SJC mua vao: {giaVang.sjc.mua.toLocaleString('vi-VN')}d/luong</p>
      <p>SJC ban ra: {giaVang.sjc.ban.toLocaleString('vi-VN')}d/luong</p>
      <p>Cap nhat: {new Date().toLocaleString('vi-VN')}</p>
    </div>
  );
}
```

### `cache: 'force-cache'` -- Cache vinh vien

Du lieu chi fetch **mot lan duy nhat** va duoc cache. Phu hop cho du lieu it thay doi.

```tsx
// app/danh-muc/page.tsx
// Danh muc san pham it thay doi -- cache vinh vien

async function layDanhMuc() {
  const res = await fetch('https://api.example.com/danh-muc', {
    cache: 'force-cache', // Cache vinh vien (den khi redeploy)
  });
  return res.json();
}

export default async function TrangDanhMuc() {
  const danhMucs = await layDanhMuc();

  return (
    <nav>
      <h2>Danh muc</h2>
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

Revalidate cho phep ban **cache du lieu nhung tu dong lam moi** sau N giay. Day la cach trien khai ISR trong App Router.

```tsx
// app/thoi-tiet/page.tsx
// Thoi tiet cap nhat moi 10 phut (600 giay)

async function layThoiTiet(thanhPho: string) {
  const res = await fetch(
    `https://api.example.com/thoi-tiet?tp=${thanhPho}`,
    {
      next: {
        revalidate: 600, // Revalidate sau 10 phut
        tags: ['thoi-tiet', `thoi-tiet-${thanhPho}`], // Tags de on-demand revalidate
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Khong the tai thoi tiet cho ${thanhPho}`);
  }

  return res.json();
}

export default async function TrangThoiTiet() {
  // Fetch song song nhieu thanh pho
  const [hanoi, hcm, danang] = await Promise.all([
    layThoiTiet('hanoi'),
    layThoiTiet('hochiminh'),
    layThoiTiet('danang'),
  ]);

  return (
    <div>
      <h1>Thoi tiet Viet Nam</h1>
      <div>
        <h2>Ha Noi: {hanoi.nhietDo}°C</h2>
        <h2>TP.HCM: {hcm.nhietDo}°C</h2>
        <h2>Da Nang: {danang.nhietDo}°C</h2>
      </div>
    </div>
  );
}
```

### Cac gia tri revalidate thuong dung

| Gia tri | Thoi gian | Phu hop cho |
|---|---|---|
| `0` | Khong cache | Du lieu real-time |
| `60` | 1 phut | Gia san pham, ty gia |
| `300` | 5 phut | Danh sach bai viet |
| `3600` | 1 gio | Trang danh muc |
| `86400` | 1 ngay | Trang gioi thieu |
| `false` | Vinh vien | Noi dung tinh |

---

## 5. Fetching Data trong Layouts vs Pages

### Fetch trong Layout

Layout duoc chia se giua nhieu trang con. Du lieu fetch trong layout **duoc cache va chia se** cho tat ca trang con.

```tsx
// app/dashboard/layout.tsx
// Layout cua dashboard -- fetch thong tin user 1 lan, chia se cho moi trang con

async function layThongTinUser() {
  const res = await fetch('https://api.example.com/user/me', {
    cache: 'no-store', // Luon lay thong tin moi nhat
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
      {/* Sidebar hien thi o moi trang dashboard */}
      <aside>
        <p>Xin chao, {user.ten}!</p>
        <nav>
          <a href="/dashboard">Tong quan</a>
          <a href="/dashboard/don-hang">Don hang</a>
          <a href="/dashboard/cai-dat">Cai dat</a>
        </nav>
      </aside>

      {/* Noi dung trang con */}
      <main>{children}</main>
    </div>
  );
}
```

### Fetch trong Page

Page la noi dung cu the cho tung route. Du lieu chi can cho trang do.

```tsx
// app/dashboard/don-hang/page.tsx
// Trang don hang -- chi fetch don hang, khong can fetch lai user info

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
      <h1>Don hang cua ban</h1>
      {donHangs.map(
        (dh: { id: string; ngay: string; tongTien: number }) => (
          <div key={dh.id}>
            <p>Ma don: {dh.id}</p>
            <p>Ngay: {dh.ngay}</p>
            <p>Tong tien: {dh.tongTien.toLocaleString('vi-VN')}d</p>
          </div>
        )
      )}
    </div>
  );
}
```

### Luu y quan trong

- Layout **khong re-render** khi navigate giua cac trang con -- du lieu fetch trong layout duoc giu lai.
- Neu ca layout va page fetch **cung mot URL**, Next.js **tu dong deduplicate** -- chi goi API 1 lan.
- Khong the truyen du lieu tu layout xuong page qua props. Thay vao do, fetch trong page hoac dung React Context.

---

## 6. Sequential vs Parallel Data Fetching

### Sequential Fetching (Tuần tu)

Request phu thuoc nhau -- phai doi request truoc xong moi chay request sau. Giong nhu xep hang mua ve -- nguoi truoc mua xong moi den luot nguoi sau.

```tsx
// app/user/[id]/page.tsx
// SEQUENTIAL -- request 2 phu thuoc ket qua request 1

async function layUser(id: string) {
  const res = await fetch(`https://api.example.com/users/${id}`);
  return res.json();
}

async function layDonHangCuaUser(userId: string) {
  // Phai co userId truoc moi fetch duoc don hang
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
  // Request 1: Lay thong tin user truoc
  const user = await layUser(params.id);

  // Request 2: Dung user.id de lay don hang (phu thuoc request 1)
  const donHangs = await layDonHangCuaUser(user.id);

  return (
    <div>
      <h1>{user.ten}</h1>
      <h2>Don hang: {donHangs.length}</h2>
    </div>
  );
}
```

### Parallel Fetching (Song song)

Cac request **doc lap voi nhau** -- chay dong thoi bang `Promise.all`. Giong nhu nhieu nhan vien phuc vu nhieu khach cung luc.

```tsx
// app/dashboard/page.tsx
// PARALLEL -- 3 request doc lap, chay dong thoi

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
  // Chay 3 request SONG SONG -- nhanh gap 3 lan so voi tuan tu!
  const [thongKe, donHangs, thongBao] = await Promise.all([
    layThongKe(),
    layDonHangGanDay(),
    layThongBao(),
  ]);

  return (
    <div>
      <h1>Dashboard</h1>
      <div>
        <p>Tong doanh thu: {thongKe.doanhThu.toLocaleString('vi-VN')}d</p>
        <p>Don hang gan day: {donHangs.length}</p>
        <p>Thong bao moi: {thongBao.length}</p>
      </div>
    </div>
  );
}
```

### So sanh thoi gian

```
Sequential (Tuần tự):
  Request 1 (200ms) --> Request 2 (300ms) --> Request 3 (150ms)
  Tong: 650ms

Parallel (Song song):
  Request 1 (200ms) --|
  Request 2 (300ms) --|-->  Tong: 300ms (bang request cham nhat)
  Request 3 (150ms) --|
```

**Quy tac:** Luon dung `Promise.all()` khi cac request **khong phu thuoc nhau**.

---

## 7. Dung Database Truc Tiep trong Server Components

Mot uu diem lon cua Server Components la ban co the **truy van database truc tiep** ma khong can API route trung gian.

```tsx
// app/san-pham/page.tsx
// Truy van database truc tiep -- khong can API route!
import { prisma } from '@/lib/prisma';

export default async function TrangSanPham() {
  // Query Prisma truc tiep trong Server Component
  const sanPhams = await prisma.sanPham.findMany({
    where: { conHang: true },
    orderBy: { ngayTao: 'desc' },
    take: 20,
  });

  return (
    <div>
      <h1>San pham</h1>
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
// Dung Drizzle ORM truc tiep
import { db } from '@/lib/db';
import { baiViet } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export default async function TrangBaiViet({
  params,
}: {
  params: { slug: string };
}) {
  // Query database truc tiep
  const bv = await db
    .select()
    .from(baiViet)
    .where(eq(baiViet.slug, params.slug))
    .limit(1);

  if (bv.length === 0) {
    return <div>Bai viet khong ton tai</div>;
  }

  return (
    <article>
      <h1>{bv[0].tieuDe}</h1>
      <p>{bv[0].noiDung}</p>
    </article>
  );
}
```

### Luu y bao mat

- Database credentials **chi ton tai tren server** -- khong bao gio lo ra client
- **Khong import** database client trong Client Components (`"use client"`)
- Validate input truoc khi dua vao query de tranh SQL injection

---

## 8. Error Handling Khi Fetch

### Dung `error.tsx` cho Route-level Errors

```tsx
// app/san-pham/error.tsx
'use client'; // error.tsx BAT BUOC phai la Client Component

export default function LỗiSanPham({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Co loi xay ra!</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Thu lai</button>
    </div>
  );
}
```

### Dung `notFound()` cho 404

```tsx
// app/san-pham/[id]/page.tsx
import { notFound } from 'next/navigation';

async function laySanPham(id: string) {
  const res = await fetch(`https://api.example.com/san-pham/${id}`, {
    next: { revalidate: 60 },
  });

  if (res.status === 404) {
    return null; // San pham khong ton tai
  }

  if (!res.ok) {
    throw new Error('Loi khi tai san pham');
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
    notFound(); // Hien thi trang 404 (not-found.tsx)
  }

  return (
    <div>
      <h1>{sp.ten}</h1>
      <p>{sp.moTa}</p>
    </div>
  );
}
```

### Try-Catch cho loi cu the

```tsx
// app/dashboard/page.tsx
// Xu ly loi cho tung phan du lieu doc lap

async function fetchAnToan<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`Loi khi fetch ${url}:`, error);
    return fallback; // Tra ve gia tri mac dinh thay vi crash
  }
}

export default async function Dashboard() {
  // Moi phan co the fail doc lap ma khong anh huong phan khac
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
      <p>Doanh thu: {thongKe.doanhThu.toLocaleString('vi-VN')}d</p>
      <p>Don hang: {donHangs.length}</p>
    </div>
  );
}
```

---

## 9. Loi thuong gap

### Loi 1: Fetch data trong Client Component thay vi Server Component

```tsx
'use client';
// SAI -- Fetch bang useEffect trong Client Component (cham hon, waterfall)
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
// DUNG -- Fetch truc tiep trong Server Component (nhanh hon, SEO tot)
export default async function SanPham() {
  const res = await fetch('https://api.example.com/san-pham');
  const data = await res.json();

  return <div>{/* render data */}</div>;
}
```

### Loi 2: Khong xu ly loi khi fetch

```tsx
// SAI -- Khong kiem tra response status
const data = await fetch(url).then((r) => r.json()); // Crash neu 500!

// DUNG -- Luon kiem tra res.ok
const res = await fetch(url);
if (!res.ok) {
  throw new Error(`Loi: ${res.status} ${res.statusText}`);
}
const data = await res.json();
```

### Loi 3: Waterfall khi co the chay song song

```tsx
// SAI -- 3 request chay tuan tu (cham!)
const users = await fetch('/api/users').then((r) => r.json());
const posts = await fetch('/api/posts').then((r) => r.json());
const comments = await fetch('/api/comments').then((r) => r.json());

// DUNG -- 3 request chay song song (nhanh!)
const [users, posts, comments] = await Promise.all([
  fetch('/api/users').then((r) => r.json()),
  fetch('/api/posts').then((r) => r.json()),
  fetch('/api/comments').then((r) => r.json()),
]);
```

### Loi 4: Quen rang fetch trong layout khong re-fetch khi navigate

Layout khong re-render khi navigate giua cac trang con. Neu ban can du lieu moi o moi trang, hay fetch trong page thay vi layout.

---

## Cau hoi phong van

### Cau 1: Next.js mo rong fetch() API nhu the nao?

**Tra loi:**

Next.js mo rong native `fetch()` voi 2 option chinh:
- `cache`: Kiem soat caching behavior (`'no-store'` hoac `'force-cache'`)
- `next.revalidate`: Thoi gian (giay) de tu dong revalidate cache
- `next.tags`: Mang cac tag de ho tro on-demand revalidation voi `revalidateTag()`

Ngoai ra, Next.js tu dong **deduplicate** cac fetch request giong nhau trong cung mot render pass -- neu nhieu component fetch cung URL thi chi co 1 request thuc su duoc gui di.

### Cau 2: Su khac nhau giua fetch trong Layout va fetch trong Page la gi?

**Tra loi:**

- **Layout:** Du lieu duoc fetch khi layout render lan dau. Khi user navigate giua cac trang con (cung layout parent), layout **khong re-render** nen du lieu khong duoc fetch lai. Phu hop cho du lieu dung chung nhu thong tin user, navigation.

- **Page:** Du lieu duoc fetch moi lan user truy cap trang do. Phu hop cho du lieu cu the cua tung trang.

Diem quan trong: Khong the truyen du lieu tu layout xuong page qua props. Neu ca hai can cung du lieu, Next.js se tu dong deduplicate request.

### Cau 3: Khi nao dung Sequential vs Parallel data fetching?

**Tra loi:**

- **Sequential:** Khi request sau **phu thuoc ket qua** cua request truoc. Vi du: fetch user truoc, roi dung userId de fetch don hang cua user do.

- **Parallel:** Khi cac request **doc lap voi nhau**. Dung `Promise.all()` de chay dong thoi. Vi du: fetch thong ke, don hang, va thong bao cho dashboard -- 3 API khong lien quan.

**Nguyen tac:** Mac dinh luon uu tien parallel. Chi dung sequential khi thuc su co dependency.

### Cau 4: Tai sao fetch data truc tiep trong Server Component tot hon useEffect?

**Tra loi:**

5 ly do chinh:

1. **Khong waterfall:** Server Component fetch truoc khi gui HTML -- user nhan duoc trang da co data. Voi useEffect, user nhan HTML trong truoc, roi moi fetch data (2 round-trips).

2. **SEO:** Du lieu da co trong HTML response -- search engine doc duoc. useEffect render tren client nen search engine thay HTML trong.

3. **Bao mat:** API keys va database credentials khong lo ra client.

4. **Khong bundle JS:** Fetch logic khong duoc gui xuong client -- giam bundle size.

5. **Toi uu server:** Server thuong co mang nhanh hon va gan API server hon -- fetch nhanh hon browser cua user.

### Cau 5: Lam sao xu ly loi khi data fetching trong Next.js App Router?

**Tra loi:**

Co 3 cap do xu ly loi:

1. **Route-level:** Tao file `error.tsx` trong route folder. Day la Error Boundary tu dong bat moi loi trong route do. Phai la Client Component.

2. **Not Found:** Goi `notFound()` tu `next/navigation` khi du lieu khong ton tai. Next.js se render file `not-found.tsx`.

3. **Granular:** Dung try-catch trong component de xu ly loi cho tung phan du lieu. Ket hop voi fallback data de trang khong bi crash hoan toan khi mot API fail.

Best practice la ket hop ca 3: try-catch cho tung fetch, `notFound()` cho 404, va `error.tsx` lam safety net cho moi loi khong du doan duoc.
