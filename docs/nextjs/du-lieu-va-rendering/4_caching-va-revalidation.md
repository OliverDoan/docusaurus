---
sidebar_position: 4
title: "Caching & Revalidation"
---

# Caching & Revalidation

Caching la mot trong nhung khai niem quan trong nhat khi lam viec voi Next.js, nhung cung la khai niem **kho hieu nhat** voi nhieu nguoi. Next.js co **4 tang caching khac nhau**, moi tang phuc vu mot muc dich rieng. Hay tuong tuong he thong caching nhu viec luu tru thuc an: ban co tu lanh o nha (Router Cache), tu dong o cua hang (Data Cache), kho lanh o nha may (Full Route Cache), va so tay ghi nho cong thuc (Request Memoization).

---

## 1. 4 Layers of Caching trong Next.js

### Tong quan

```
Browser (Client)
  └── Router Cache (Layer 4 -- cache RSC payload tren client)

Server
  ├── Request Memoization (Layer 1 -- deduplicate fetch trong 1 render)
  ├── Data Cache (Layer 2 -- cache response cua fetch)
  └── Full Route Cache (Layer 3 -- cache HTML + RSC payload)
```

### Layer 1: Request Memoization (React Cache)

**Muc dich:** Neu nhieu component trong **cung mot request** goi `fetch()` voi cung URL, React chi gui **mot request thuc su** va chia se ket qua cho tat ca.

**Thoi gian song:** Chi trong **mot server render** (mot request duy nhat). Khong persistent giua cac request.

```tsx
// app/layout.tsx
async function layUser() {
  // Goi API nay
  const res = await fetch('https://api.example.com/user/me');
  return res.json();
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await layUser(); // Request 1 -- gui request that
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
  // Cung URL -- React KHONG gui request moi!
  const res = await fetch('https://api.example.com/user/me');
  return res.json();
}

export default async function TrangChu() {
  const user = await layUser(); // Request 2 -- dung ket qua da memo!
  return <h1>Dashboard cua {user.ten}</h1>;
}
```

Ket qua: Chi **1 HTTP request** duoc gui di, du `layUser()` duoc goi o 2 noi.

### Cach hoat dong

```
Component A goi fetch(url)
  --> Kiem tra: co ai da fetch url nay chua?
  --> Chua: Gui request that, luu ket qua vao memo
  --> Da co: Tra lai ket qua tu memo

Component B goi fetch(url)
  --> Kiem tra: co ai da fetch url nay chua?
  --> Da co: Tra lai ket qua tu memo (KHONG gui request)
```

**Dieu kien de memoize:**
- Cung URL va cung options
- Cung server render pass
- Phai la `GET` request (POST khong duoc memoize)

---

### Layer 2: Data Cache (Fetch Cache)

**Muc dich:** Cache response cua `fetch()` **across requests va deployments**. Khac voi Request Memoization (chi trong 1 render), Data Cache ton tai **lau dai** cho den khi bi revalidate.

**Thoi gian song:** Persistent (vinh vien) cho den khi revalidate hoac opt out.

```tsx
// Fetch nay duoc cache vinh vien (mac dinh Next.js 14)
const res = await fetch('https://api.example.com/danh-muc', {
  cache: 'force-cache',
});
// Request dau tien: goi API that --> luu vao Data Cache
// Request thu 2, 3, ...: lay tu Data Cache, KHONG goi API

// Fetch nay cache 60 giay
const res = await fetch('https://api.example.com/san-pham', {
  next: { revalidate: 60 },
});
// Trong 60 giay: lay tu Data Cache
// Sau 60 giay: request tiep theo trigger revalidation

// Fetch nay KHONG cache
const res = await fetch('https://api.example.com/gia-vang', {
  cache: 'no-store',
});
// Moi request deu goi API that
```

### So sanh Request Memoization vs Data Cache

| Tinh nang | Request Memoization | Data Cache |
|---|---|---|
| Ton tai trong | 1 server render | Across requests |
| Dieu khien boi | React | Next.js |
| Ap dung cho | fetch GET trong render | fetch voi cache options |
| Persistent | Khong | Co |
| Opt out | Khong can | `cache: 'no-store'` |

---

### Layer 3: Full Route Cache (RSC Payload + HTML)

**Muc dich:** Cache **toan bo ket qua render** cua mot route -- bao gom HTML va RSC (React Server Component) Payload. Khi user truy cap route, Next.js tra trang da render san tu cache thay vi render lai.

**Thoi gian song:** Persistent cho den khi revalidate. Chi ap dung cho **static routes** (khong co dynamic data).

```tsx
// Route nay duoc Full Route Cache vi khong co dynamic data
// app/gioi-thieu/page.tsx
export default function GioiThieu() {
  return (
    <div>
      <h1>Gioi thieu cong ty</h1>
      <p>Noi dung tinh -- cache toan bo trang</p>
    </div>
  );
}
// --> HTML va RSC Payload duoc cache luc build time
```

```tsx
// Route nay KHONG duoc Full Route Cache vi co dynamic data
// app/dashboard/page.tsx
export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const data = await fetch('https://api.example.com/stats', {
    cache: 'no-store',
  });
  // ...
}
// --> Render moi moi request
```

**Cac yeu to khien route tro nen dynamic (khong duoc Full Route Cache):**
- Su dung `cookies()`, `headers()`, `searchParams`
- `fetch()` voi `cache: 'no-store'`
- Route segment config: `export const dynamic = 'force-dynamic'`
- Bat ky dynamic function nao khac

---

### Layer 4: Router Cache (Client-side)

**Muc dich:** Cache RSC Payload **tren browser cua user**. Khi user navigate giua cac trang, Next.js luu trang da visit vao Router Cache. Khi quay lai trang do, hien thi tu cache ngay lap tuc ma khong can request server.

**Thoi gian song:**
- **Static routes:** 5 phut
- **Dynamic routes:** 30 giay
- Reset khi reload trang (hard refresh)

```
User truy cap /san-pham
  --> Request server, nhan RSC Payload
  --> Luu vao Router Cache

User navigate sang /gioi-thieu
  --> Request server, nhan RSC Payload
  --> Luu vao Router Cache

User quay lai /san-pham
  --> Lay tu Router Cache (KHONG request server)
  --> Hien thi ngay lap tuc (tuong nhu instant)
```

**Luu y quan trong (Next.js 15+):** Tu Next.js 15, Router Cache **khong cache dynamic routes mac dinh** nua. Ban can opt-in neu muon cache:

```tsx
// next.config.js (Next.js 15+)
module.exports = {
  experimental: {
    staleTimes: {
      dynamic: 30, // Cache dynamic routes 30 giay
      static: 300, // Cache static routes 5 phut
    },
  },
};
```

---

## 2. Time-based Revalidation

Time-based revalidation la cach don gian nhat -- tu dong revalidate cache sau **N giay**.

### Cach 1: Trong fetch options

```tsx
// Revalidate moi 60 giay
const res = await fetch('https://api.example.com/san-pham', {
  next: { revalidate: 60 },
});
```

### Cach 2: Route segment config

```tsx
// app/tin-tuc/page.tsx
// Ap dung revalidate cho TOAN BO route
export const revalidate = 300; // 5 phut

export default async function TinTuc() {
  const res = await fetch('https://api.example.com/tin-tuc');
  // Fetch nay se duoc revalidate moi 5 phut
  // ...
}
```

### Stale-While-Revalidate behavior

```
T=0s:   Build --> Cache HTML (version 1)
T=1-59s: Request --> Tra HTML tu cache (version 1) [NHANH]
T=60s:   Request --> Tra HTML cu (version 1) [NHANH]
                 --> Trigger re-render o background
T=61s:   Re-render xong --> Cap nhat cache (version 2)
T=62s+:  Request --> Tra HTML moi (version 2) [NHANH]
```

### Quy tac khi nhieu fetch co revalidate khac nhau

Neu mot route co nhieu fetch voi revalidate khac nhau, **gia tri nho nhat duoc dung** cho toan bo route:

```tsx
// Route nay se revalidate moi 30 giay (gia tri nho nhat)
export default async function TrangTongHop() {
  // Fetch 1: revalidate 30 giay
  const giaCoin = await fetch('https://api.example.com/gia-coin', {
    next: { revalidate: 30 },
  });

  // Fetch 2: revalidate 3600 giay (1 gio)
  const tinTuc = await fetch('https://api.example.com/tin-tuc', {
    next: { revalidate: 3600 },
  });

  // Toan bo route se revalidate moi 30 giay
}
```

---

## 3. On-demand Revalidation

Thay vi doi het thoi gian, ban co the **chu dong revalidate** khi biet du lieu da thay doi. Giong nhu viec ban tu thay doi mon an tren thuc don khi co nguyen lieu moi -- khong can doi het ngay.

### `revalidatePath()` -- Revalidate theo duong dan

```tsx
// app/actions/san-pham.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function taoSanPham(formData: FormData) {
  // Luu san pham moi vao database
  await prisma.sanPham.create({
    data: {
      ten: formData.get('ten') as string,
      gia: Number(formData.get('gia')),
    },
  });

  // Revalidate trang danh sach san pham
  revalidatePath('/san-pham');

  // Revalidate toan bo route group
  revalidatePath('/san-pham', 'layout'); // Revalidate layout + tat ca trang con
}
```

### `revalidateTag()` -- Revalidate theo tag

Tag cho phep ban **nhom cac fetch request** va revalidate tat ca cung luc:

```tsx
// app/san-pham/page.tsx
// Gan tag cho fetch request
async function laySanPham() {
  const res = await fetch('https://api.example.com/san-pham', {
    next: {
      tags: ['san-pham'], // Tag nay de revalidate sau
    },
  });
  return res.json();
}

async function layDanhMuc() {
  const res = await fetch('https://api.example.com/danh-muc', {
    next: {
      tags: ['san-pham', 'danh-muc'], // Nhieu tag
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

  // Revalidate tat ca fetch co tag 'san-pham'
  // Ca laySanPham() va layDanhMuc() deu bi revalidate
  revalidateTag('san-pham');
}
```

### Revalidate tu API Route (Webhook)

Huu ich khi nhan webhook tu CMS hoac he thong khac:

```tsx
// app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  // Kiem tra secret de bao mat
  const secret = request.headers.get('x-revalidate-secret');
  if (secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const tag = body.tag;

  if (!tag) {
    return Response.json({ error: 'Missing tag' }, { status: 400 });
  }

  // Revalidate tag duoc chi dinh
  revalidateTag(tag);

  return Response.json({ revalidated: true, tag });
}
```

### So sanh revalidatePath vs revalidateTag

| Tinh nang | `revalidatePath` | `revalidateTag` |
|---|---|---|
| Revalidate theo | Duong dan URL | Tag duoc gan cho fetch |
| Pham vi | 1 route cu the | Tat ca fetch co tag do |
| Dung khi | Biet chinh xac route nao can cap nhat | Nhieu route dung chung du lieu |
| Vi du | Sua bai viet `/bai-viet/hello` | Sua danh muc --> tat ca trang dung danh muc |

---

## 4. Opting Out of Caching

Doi khi ban can **tat caching hoan toan**. Day la cac cach:

### Cap do fetch

```tsx
// Tat cache cho 1 fetch cu the
const res = await fetch(url, { cache: 'no-store' });
```

### Cap do route

```tsx
// app/dashboard/page.tsx
// Tat cache cho toan bo route
export const dynamic = 'force-dynamic';
// HOAC
export const revalidate = 0;
```

### Cap do toan ung dung

```tsx
// next.config.js -- KHONG khuyen nghi, nhung co the
module.exports = {
  experimental: {
    // Tat Data Cache mac dinh (Next.js 15 da lam dieu nay)
  },
};
```

### Cap do function

Su dung dynamic functions se tu dong opt out:

```tsx
import { cookies, headers } from 'next/headers';

export default async function TrangCanh() {
  // Bat ky ham nao trong so nay se khien route tro thanh dynamic
  const cookieStore = cookies();
  const headerList = headers();
  // Route nay se khong duoc Full Route Cache
}
```

---

## 5. Cache Tags -- Chien luoc dat ten

Mot he thong tag tot giup ban revalidate chinh xac nhung gi can thiet:

```tsx
// Chien luoc dat ten tag: [entity]-[scope]-[id]

// Tag chung cho entity
fetch(url, { next: { tags: ['san-pham'] } }); // Tat ca san pham
fetch(url, { next: { tags: ['bai-viet'] } }); // Tat ca bai viet

// Tag cu the
fetch(url, { next: { tags: ['san-pham-123'] } }); // San pham co ID 123
fetch(url, { next: { tags: ['bai-viet-hello-world'] } }); // 1 bai viet cu the

// Nhieu tag cho 1 fetch
fetch(url, {
  next: {
    tags: [
      'san-pham',           // Revalidate khi bat ky san pham nao thay doi
      'san-pham-123',       // Revalidate khi san pham 123 thay doi
      'danh-muc-dien-thoai', // Revalidate khi danh muc thay doi
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

  // Revalidate cu the san pham nay
  revalidateTag(`san-pham-${id}`);

  // Va revalidate danh sach san pham (vi danh sach cung can cap nhat)
  revalidateTag('san-pham');
}

export async function xoaSanPham(id: string) {
  await prisma.sanPham.delete({ where: { id } });

  // Revalidate toan bo san pham vi danh sach da thay doi
  revalidateTag('san-pham');
}
```

---

## 6. Debugging Cache Behavior

### Kiem tra header response

```bash
# Kiem tra cache status qua headers
curl -I https://your-site.com/san-pham

# Tim cac headers nay:
# x-nextjs-cache: HIT    --> Trang duoc lay tu cache
# x-nextjs-cache: MISS   --> Trang duoc render moi
# x-nextjs-cache: STALE  --> Trang cu dang duoc revalidate
```

### Logging trong development

```tsx
// next.config.js
module.exports = {
  logging: {
    fetches: {
      fullUrl: true, // Hien thi URL day du cua moi fetch trong console
    },
  },
};
```

Khi chay `npm run dev`, ban se thay trong terminal:

```bash
# Output mau:
GET https://api.example.com/san-pham 200 in 45ms (cache: HIT)
GET https://api.example.com/gia-vang 200 in 120ms (cache: SKIP)
```

### Debug trong code

```tsx
// Them log de debug caching
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

Khi cache khong hoat dong nhu mong doi:

1. Kiem tra route co dynamic khong: `cookies()`, `headers()`, `searchParams`
2. Kiem tra fetch options: `cache: 'no-store'` se tat cache
3. Kiem tra route segment config: `dynamic = 'force-dynamic'`
4. Kiem tra revalidate value: `revalidate = 0` nghia la khong cache
5. Trong dev mode (`npm run dev`), caching behavior co the khac production

---

## 7. Loi thuong gap

### Loi 1: Tuong rang dev mode co cache giong production

```bash
# Development mode (npm run dev):
# - Data Cache: KHONG hoat dong mac dinh
# - Full Route Cache: KHONG hoat dong
# - Router Cache: Hoat dong binh thuong

# Production mode (npm run build && npm run start):
# - Tat ca cache hoat dong day du

# De test cache, LUON test voi production build
npm run build && npm run start
```

### Loi 2: Quen revalidate sau khi mutation

```tsx
// SAI -- cap nhat database nhung quen revalidate
'use server';
export async function capNhatSanPham(id: string, data: any) {
  await prisma.sanPham.update({ where: { id }, data });
  // Quen revalidate --> trang van hien du lieu cu!
}

// DUNG -- luon revalidate sau mutation
'use server';
export async function capNhatSanPham(id: string, data: any) {
  await prisma.sanPham.update({ where: { id }, data });
  revalidatePath('/san-pham');       // Revalidate danh sach
  revalidatePath(`/san-pham/${id}`); // Revalidate trang chi tiet
}
```

### Loi 3: Nham revalidate va redirect

```tsx
// revalidate va redirect la 2 viec KHAC NHAU:

// revalidate: Xoa cache, request tiep theo se render moi
revalidatePath('/san-pham'); // Khong chuyen trang

// redirect: Chuyen user sang trang khac
redirect('/san-pham'); // Chuyen trang ngay lap tuc

// Thuong dung ca hai:
'use server';
export async function taoSanPham(formData: FormData) {
  await prisma.sanPham.create({ data: { /* ... */ } });
  revalidatePath('/san-pham');  // Xoa cache truoc
  redirect('/san-pham');        // Roi chuyen trang
}
```

### Loi 4: Dung Router Cache cu

```tsx
'use client';
import { useRouter } from 'next/navigation';

export default function NutCapNhat() {
  const router = useRouter();

  const capNhat = () => {
    // router.refresh() xoa Router Cache cho trang hien tai
    // va re-fetch du lieu tu server
    router.refresh();
  };

  return <button onClick={capNhat}>Cap nhat du lieu</button>;
}
```

---

## Cau hoi phong van

### Cau 1: Mo ta 4 tang caching trong Next.js App Router?

**Tra loi:**

1. **Request Memoization:** Tu dong deduplicate fetch() giong nhau trong cung mot server render. Vi du: layout va page goi cung API --> chi 1 request that su. Dieu khien boi React, chi ton tai trong 1 render pass.

2. **Data Cache:** Cache response cua fetch() across requests. Persistent cho den khi revalidate (time-based hoac on-demand). Dieu khien qua `cache` va `next.revalidate` options cua fetch.

3. **Full Route Cache:** Cache toan bo HTML va RSC Payload cua static routes. Tao luc build time. Route voi dynamic data (cookies, no-store fetch) khong duoc Full Route Cache.

4. **Router Cache:** Cache RSC Payload tren browser (client-side). Khi user navigate giua cac trang, trang da visit duoc luu lai. Quay lai trang do se load tu cache (tuong nhu instant). Reset khi hard refresh.

### Cau 2: Su khac nhau giua revalidatePath va revalidateTag?

**Tra loi:**

- `revalidatePath('/san-pham')`: Revalidate **mot route cu the**. Tat ca data cache lien quan den route do se bi xoa. Phu hop khi biet chinh xac route nao anh huong.

- `revalidateTag('san-pham')`: Revalidate **tat ca fetch co tag do**, bat ke o route nao. Phu hop khi mot loai du lieu duoc su dung o nhieu route khac nhau. Vi du: thay doi danh muc san pham anh huong ca trang danh sach, trang chi tiet, va trang tim kiem.

Best practice: Dung tag cho du lieu dung chung, dung path cho mutations chi anh huong 1 route.

### Cau 3: Tai sao trang cua toi khong cap nhat du lieu moi du da goi revalidatePath?

**Tra loi:**

Co the do:
1. **Router Cache:** Browser van cache trang cu. Dung `router.refresh()` hoac hard refresh (Ctrl+Shift+R).
2. **Sai path:** Kiem tra path truyen vao co dung khong (phai khop voi route structure).
3. **Dev mode:** Caching behavior trong dev khac production. Test voi `npm run build && npm run start`.
4. **Timing:** revalidatePath chi danh dau cache la stale. Request **tiep theo** moi nhan du lieu moi.
5. **CDN Cache:** Neu deploy tren Vercel hay CDN khac, co the CDN van cache response cu.

### Cau 4: Lam sao tat hoan toan caching cho mot route?

**Tra loi:**

Co nhieu cap do:

```tsx
// Cap do route (khuyen nghi)
export const dynamic = 'force-dynamic';

// Cap do fetch
fetch(url, { cache: 'no-store' });

// Cap do route (alternative)
export const revalidate = 0;
```

Hoac su dung dynamic functions (`cookies()`, `headers()`) se tu dong opt out khoi caching.

**Luu y:** Tat cache nghia la moi request deu render moi --> tang tai server va cham hon. Chi tat khi that su can thiet.

### Cau 5: Giải thich Stale-While-Revalidate pattern trong ISR?

**Tra loi:**

Stale-While-Revalidate la pattern trong do:

1. **Stale:** Khi cache het han, request van nhan du lieu cu (stale) ngay lap tuc -- user khong phai doi.
2. **While-Revalidate:** Dong thoi, Next.js render lai trang o background voi du lieu moi.
3. **Update:** Khi render xong, cache duoc cap nhat. Request tiep theo nhan du lieu moi.

Uu diem: User luon nhan response nhanh (tu cache), trong khi du lieu van duoc cap nhat o background. Khong ai phai doi "loading" nhu SSR truyen thong.

Nhuoc diem: Co the co 1 request nhan du lieu cu (giua luc cache het han va luc re-render xong). Chap nhan duoc cho hau het truong hop (tin tuc, san pham), khong phu hop cho du lieu can chinh xac tuyet doi (tai chinh, y te).
