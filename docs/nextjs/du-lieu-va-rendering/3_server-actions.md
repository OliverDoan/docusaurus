---
sidebar_position: 3
title: "Server Actions"
---

# Server Actions

Server Actions la mot trong nhung tinh nang dot pha nhat cua Next.js App Router. No cho phep ban **goi ham tren server truc tiep tu Client Component** ma khong can tao API route. Hay tuong tuong ban dang ngoi tai ban trong nha hang va co the goi truc tiep vao bep de dat mon -- khong can goi qua phuc vu. Do la suc manh cua Server Actions.

---

## 1. Server Actions la gi?

Server Actions la **cac ham async chay tren server**, duoc danh dau bang directive `"use server"`. Ban co the goi chung tu ca Server Components lan Client Components, va chung tu dong xu ly viec gui request tu client den server.

### Cach hoat dong

```
Client (Browser) --> Server Action --> Server (xu ly) --> Tra ket qua ve Client
```

Phia sau, Next.js tu dong:
1. Tao mot HTTP POST endpoint cho moi Server Action
2. Serialize tham so tu client sang server
3. Thuc thi ham tren server
4. Tra ket qua ve client

---

## 2. Inline Server Actions vs Module-level

### Inline Server Actions (trong Server Component)

```tsx
// app/feedback/page.tsx
// Server Component -- dinh nghia Server Action ngay trong component

export default function TrangFeedback() {
  // Inline Server Action -- dinh nghia trong Server Component body
  async function guiFeedback(formData: FormData) {
    'use server'; // Directive danh dau day la Server Action

    const ten = formData.get('ten') as string;
    const noiDung = formData.get('noiDung') as string;

    // Chay tren server -- co the truy cap database truc tiep
    await prisma.feedback.create({
      data: { ten, noiDung },
    });

    // Revalidate trang de hien thi feedback moi
    revalidatePath('/feedback');
  }

  return (
    <form action={guiFeedback}>
      <input name="ten" placeholder="Ten cua ban" required />
      <textarea name="noiDung" placeholder="Noi dung feedback" required />
      <button type="submit">Gui feedback</button>
    </form>
  );
}
```

### Module-level Server Actions (file rieng)

Khi ban muon **chia se Server Actions giua nhieu component**, dinh nghia chung trong file rieng:

```tsx
// app/actions/san-pham.ts
'use server'; // Tat ca ham export trong file nay deu la Server Actions

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Tao san pham moi
export async function taoSanPham(formData: FormData) {
  const ten = formData.get('ten') as string;
  const gia = Number(formData.get('gia'));
  const moTa = formData.get('moTa') as string;

  await prisma.sanPham.create({
    data: { ten, gia, moTa },
  });

  revalidatePath('/san-pham');
}

// Cap nhat san pham
export async function capNhatSanPham(id: string, formData: FormData) {
  const ten = formData.get('ten') as string;
  const gia = Number(formData.get('gia'));

  await prisma.sanPham.update({
    where: { id },
    data: { ten, gia },
  });

  revalidatePath('/san-pham');
}

// Xoa san pham
export async function xoaSanPham(id: string) {
  await prisma.sanPham.delete({
    where: { id },
  });

  revalidatePath('/san-pham');
}
```

Su dung trong component:

```tsx
// app/san-pham/tao-moi/page.tsx
import { taoSanPham } from '@/app/actions/san-pham';

export default function TaoSanPham() {
  return (
    <form action={taoSanPham}>
      <input name="ten" placeholder="Ten san pham" required />
      <input name="gia" type="number" placeholder="Gia" required />
      <textarea name="moTa" placeholder="Mo ta san pham" />
      <button type="submit">Tao san pham</button>
    </form>
  );
}
```

---

## 3. Forms voi Server Actions

Trong mo hinh truyen thong, ban can tao API route rồi goi `fetch()` tu client. Voi Server Actions, ban chi can truyen ham truc tiep vao `action` prop cua `<form>`:

### So sanh cu vs moi

```tsx
// =============================
// CACH CU: Can API route
// =============================

// app/api/lien-he/route.ts -- Phai tao API route rieng
export async function POST(request: Request) {
  const data = await request.json();
  await luuLienHe(data);
  return Response.json({ success: true });
}

// app/lien-he/FormLienHe.tsx -- Client component goi API
'use client';
export default function FormLienHe() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/lien-he', {
      method: 'POST',
      body: JSON.stringify({ ten, email, noiDung }),
    });
  };
  // ...
}
```

```tsx
// =============================
// CACH MOI: Server Action (don gian hon nhieu!)
// =============================

// app/lien-he/page.tsx -- Khong can API route
export default function TrangLienHe() {
  async function guiLienHe(formData: FormData) {
    'use server';
    const ten = formData.get('ten') as string;
    const email = formData.get('email') as string;
    const noiDung = formData.get('noiDung') as string;

    await prisma.lienHe.create({
      data: { ten, email, noiDung },
    });

    redirect('/lien-he/cam-on');
  }

  return (
    <form action={guiLienHe}>
      <input name="ten" required />
      <input name="email" type="email" required />
      <textarea name="noiDung" required />
      <button type="submit">Gui</button>
    </form>
  );
}
```

---

## 4. `useFormState` Hook

`useFormState` (tu React DOM) cho phep ban **nhan ket qua tu Server Action** va hien thi cho user. Rat huu ich cho viec hien thi thong bao thanh cong hoac loi validation.

> **Luu y:** Tu React 19, `useFormState` duoc doi ten thanh `useActionState`. Xem muc 6 ben duoi.

```tsx
'use client';
// app/dang-ky/FormDangKy.tsx

import { useFormState } from 'react-dom';
import { dangKyTaiKhoan } from '@/app/actions/auth';

// Kieu du lieu tra ve tu Server Action
type TrangThai = {
  loiLoi?: string;
  thanhCong?: boolean;
};

const trangThaBanDau: TrangThai = {};

export default function FormDangKy() {
  // useFormState nhan Server Action va trang thai ban dau
  const [trangThai, formAction] = useFormState(
    dangKyTaiKhoan,
    trangThaBanDau
  );

  return (
    <form action={formAction}>
      {/* Hien thi loi neu co */}
      {trangThai.loiLoi && (
        <div className="loi">{trangThai.loiLoi}</div>
      )}

      {/* Hien thi thong bao thanh cong */}
      {trangThai.thanhCong && (
        <div className="thanh-cong">Dang ky thanh cong!</div>
      )}

      <input name="email" type="email" placeholder="Email" required />
      <input
        name="matKhau"
        type="password"
        placeholder="Mat khau"
        required
      />
      <button type="submit">Dang ky</button>
    </form>
  );
}
```

Server Action tra ve trang thai:

```tsx
// app/actions/auth.ts
'use server';

type TrangThai = {
  loiLoi?: string;
  thanhCong?: boolean;
};

export async function dangKyTaiKhoan(
  trangThaiTruoc: TrangThai,
  formData: FormData
): Promise<TrangThai> {
  const email = formData.get('email') as string;
  const matKhau = formData.get('matKhau') as string;

  // Kiem tra email da ton tai chua
  const daTonTai = await prisma.user.findUnique({
    where: { email },
  });

  if (daTonTai) {
    return { loiLoi: 'Email nay da duoc dang ky!' };
  }

  // Tao tai khoan moi
  await prisma.user.create({
    data: {
      email,
      matKhau: await hashPassword(matKhau),
    },
  });

  return { thanhCong: true };
}
```

---

## 5. `useFormStatus` Hook -- Pending State

`useFormStatus` cho phep ban **biet form dang submit hay khong**. Rat huu ich de hien thi trang thai loading va vo hieu hoa nut submit.

```tsx
'use client';
// app/components/NutSubmit.tsx

import { useFormStatus } from 'react-dom';

// QUAN TRONG: useFormStatus phai dung TRONG component con cua <form>
// Khong dung duoc trong cung component chua <form>

export default function NutSubmit({ text = 'Gui' }: { text?: string }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Dang xu ly...' : text}
    </button>
  );
}
```

Su dung:

```tsx
// app/lien-he/page.tsx
import NutSubmit from '@/app/components/NutSubmit';

export default function TrangLienHe() {
  async function guiLienHe(formData: FormData) {
    'use server';
    // Xu ly form...
    await new Promise((r) => setTimeout(r, 2000)); // Mo phong delay
  }

  return (
    <form action={guiLienHe}>
      <input name="ten" required />
      <input name="email" type="email" required />
      <textarea name="noiDung" required />

      {/* NutSubmit tu dong biet form dang submit */}
      <NutSubmit text="Gui lien he" />
    </form>
  );
}
```

### Luu y ve useFormStatus

`useFormStatus` chi hoat dong khi component **la con cua `<form>`**. No khong hoat dong neu ban dung trong cung component chua `<form>`:

```tsx
'use client';

import { useFormStatus } from 'react-dom';

// SAI -- useFormStatus trong cung component voi <form>
export default function FormSai() {
  const { pending } = useFormStatus(); // KHONG hoat dong!

  return (
    <form action={serverAction}>
      <button disabled={pending}>Gui</button>
    </form>
  );
}

// DUNG -- useFormStatus trong component con
function NutGuiDung() {
  const { pending } = useFormStatus(); // Hoat dong!
  return <button disabled={pending}>Gui</button>;
}

export default function FormDung() {
  return (
    <form action={serverAction}>
      <NutGuiDung />
    </form>
  );
}
```

---

## 6. `useActionState` (React 19)

React 19 gioi thieu `useActionState` thay the `useFormState`, voi cac cai tien:

```tsx
'use client';
// app/san-pham/FormTaoSanPham.tsx

import { useActionState } from 'react';

type TrangThai = {
  loi?: string;
  thanhCong?: boolean;
};

export default function FormTaoSanPham() {
  // useActionState: (action, initialState) => [state, formAction, isPending]
  const [trangThai, formAction, dangGui] = useActionState(
    taoSanPhamAction,
    { loi: undefined, thanhCong: false } as TrangThai
  );

  return (
    <form action={formAction}>
      {trangThai.loi && <p className="loi">{trangThai.loi}</p>}
      {trangThai.thanhCong && <p className="ok">Tao thanh cong!</p>}

      <input name="ten" placeholder="Ten san pham" required />
      <input name="gia" type="number" placeholder="Gia" required />

      {/* Khong can component con rieng -- co isPending tren san */}
      <button type="submit" disabled={dangGui}>
        {dangGui ? 'Dang tao...' : 'Tao san pham'}
      </button>
    </form>
  );
}
```

### So sanh useFormState vs useActionState

| Tinh nang | `useFormState` | `useActionState` |
|---|---|---|
| Package | `react-dom` | `react` |
| Return | `[state, formAction]` | `[state, formAction, isPending]` |
| Pending state | Can `useFormStatus` rieng | Co san `isPending` |
| React version | 18+ | 19+ |

---

## 7. Validation voi Server Actions (Zod)

**LUON validate du lieu tren server.** Khong bao gio tin tuong du lieu tu client.

```tsx
// app/actions/san-pham.ts
'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Schema validation voi Zod
const SanPhamSchema = z.object({
  ten: z
    .string()
    .min(1, 'Ten san pham khong duoc de trong')
    .max(100, 'Ten san pham qua dai (toi da 100 ky tu)'),
  gia: z
    .number()
    .positive('Gia phai lon hon 0')
    .max(999999999, 'Gia qua cao'),
  moTa: z
    .string()
    .max(1000, 'Mo ta qua dai (toi da 1000 ky tu)')
    .optional(),
});

type TrangThai = {
  loi?: {
    ten?: string[];
    gia?: string[];
    moTa?: string[];
    chung?: string;
  };
  thanhCong?: boolean;
};

export async function taoSanPham(
  trangThaiTruoc: TrangThai,
  formData: FormData
): Promise<TrangThai> {
  // Parse va validate du lieu
  const ketQuaValidate = SanPhamSchema.safeParse({
    ten: formData.get('ten'),
    gia: Number(formData.get('gia')),
    moTa: formData.get('moTa') || undefined,
  });

  // Neu validation fail -- tra ve loi chi tiet
  if (!ketQuaValidate.success) {
    return {
      loi: ketQuaValidate.error.flatten().fieldErrors,
    };
  }

  // Du lieu da validate -- an toan de luu vao database
  try {
    await prisma.sanPham.create({
      data: ketQuaValidate.data,
    });

    revalidatePath('/san-pham');
    return { thanhCong: true };
  } catch (error) {
    return {
      loi: { chung: 'Co loi khi tao san pham. Vui long thu lai.' },
    };
  }
}
```

Hien thi loi validation trong form:

```tsx
'use client';
// app/san-pham/tao-moi/FormTao.tsx

import { useActionState } from 'react';
import { taoSanPham } from '@/app/actions/san-pham';

export default function FormTaoSanPham() {
  const [trangThai, formAction, dangGui] = useActionState(taoSanPham, {});

  return (
    <form action={formAction}>
      <div>
        <label>Ten san pham</label>
        <input name="ten" required />
        {/* Hien thi loi validation cho tung truong */}
        {trangThai.loi?.ten && (
          <span className="loi">{trangThai.loi.ten[0]}</span>
        )}
      </div>

      <div>
        <label>Gia</label>
        <input name="gia" type="number" required />
        {trangThai.loi?.gia && (
          <span className="loi">{trangThai.loi.gia[0]}</span>
        )}
      </div>

      <div>
        <label>Mo ta</label>
        <textarea name="moTa" />
        {trangThai.loi?.moTa && (
          <span className="loi">{trangThai.loi.moTa[0]}</span>
        )}
      </div>

      {/* Loi chung */}
      {trangThai.loi?.chung && (
        <div className="loi">{trangThai.loi.chung}</div>
      )}

      {trangThai.thanhCong && (
        <div className="thanh-cong">Tao san pham thanh cong!</div>
      )}

      <button type="submit" disabled={dangGui}>
        {dangGui ? 'Dang tao...' : 'Tao san pham'}
      </button>
    </form>
  );
}
```

---

## 8. Optimistic Updates voi `useOptimistic`

`useOptimistic` cho phep ban **cap nhat UI ngay lap tuc** truoc khi server tra ket qua. Neu server action that bai, UI tu dong quay lai trang thai cu. Giong nhu ban gui tin nhan -- tin nhan hien ngay tren man hinh, con dau tich "Da gui" se xuat hien sau khi server xac nhan.

```tsx
'use client';
// app/components/DanhSachBinhLuan.tsx

import { useOptimistic } from 'react';
import { themBinhLuan } from '@/app/actions/binh-luan';

type BinhLuan = {
  id: string;
  noiDung: string;
  nguoiViet: string;
  dangGui?: boolean; // Danh dau binh luan optimistic (chua gui xong)
};

export default function DanhSachBinhLuan({
  binhLuans,
}: {
  binhLuans: BinhLuan[];
}) {
  // useOptimistic: (currentState, updateFn) => [optimisticState, addOptimistic]
  const [binhLuanOptimistic, themBinhLuanOptimistic] = useOptimistic(
    binhLuans,
    (danhSachHienTai: BinhLuan[], binhLuanMoi: BinhLuan) => [
      ...danhSachHienTai,
      { ...binhLuanMoi, dangGui: true },
    ]
  );

  async function xuLyGuiBinhLuan(formData: FormData) {
    const noiDung = formData.get('noiDung') as string;

    // Cap nhat UI ngay lap tuc (optimistic)
    themBinhLuanOptimistic({
      id: 'temp-' + Date.now(),
      noiDung,
      nguoiViet: 'Ban',
    });

    // Gui len server (chay o background)
    await themBinhLuan(formData);
  }

  return (
    <div>
      <h2>Binh luan</h2>

      {/* Hien thi danh sach binh luan (bao gom optimistic) */}
      {binhLuanOptimistic.map((bl) => (
        <div
          key={bl.id}
          style={{ opacity: bl.dangGui ? 0.5 : 1 }}
        >
          <strong>{bl.nguoiViet}:</strong> {bl.noiDung}
          {bl.dangGui && <span> (dang gui...)</span>}
        </div>
      ))}

      {/* Form them binh luan */}
      <form action={xuLyGuiBinhLuan}>
        <input name="noiDung" placeholder="Viet binh luan..." required />
        <button type="submit">Gui</button>
      </form>
    </div>
  );
}
```

---

## 9. Security: Bao mat Server Actions

### Input Validation

**LUON validate moi input** tu client. Khong bao gio tin tuong `formData`:

```tsx
'use server';

import { z } from 'zod';

export async function capNhatProfile(formData: FormData) {
  // LUON validate -- user co the sua formData trong DevTools
  const schema = z.object({
    ten: z.string().min(1).max(100),
    email: z.string().email(),
  });

  const ketQua = schema.safeParse({
    ten: formData.get('ten'),
    email: formData.get('email'),
  });

  if (!ketQua.success) {
    return { loi: 'Du lieu khong hop le' };
  }

  // Dung ketQua.data (da validate) thay vi formData
  await prisma.user.update({
    where: { id: userId },
    data: ketQua.data,
  });
}
```

### Authentication Check

**LUON kiem tra nguoi dung da dang nhap** truoc khi thuc hien Server Action:

```tsx
'use server';

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function xoaBaiViet(baiVietId: string) {
  // Kiem tra authentication
  const session = await auth();
  if (!session?.user) {
    redirect('/dang-nhap');
  }

  // Kiem tra authorization -- chi chu so huu moi duoc xoa
  const baiViet = await prisma.baiViet.findUnique({
    where: { id: baiVietId },
  });

  if (baiViet?.authorId !== session.user.id) {
    throw new Error('Ban khong co quyen xoa bai viet nay');
  }

  // An toan de xoa
  await prisma.baiViet.delete({
    where: { id: baiVietId },
  });

  revalidatePath('/bai-viet');
}
```

### Khong tra ve du lieu nhay cam

```tsx
'use server';

// SAI -- tra ve toan bo user object (co the chua password hash, etc.)
export async function layUser(id: string) {
  return await prisma.user.findUnique({ where: { id } });
}

// DUNG -- chi tra ve cac truong can thiet
export async function layUser(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      ten: true,
      email: true,
      // KHONG select password, token, etc.
    },
  });
}
```

---

## 10. Loi thuong gap

### Loi 1: Goi Server Action tu module khong co `"use server"`

```tsx
// SAI -- thieu "use server"
// app/actions/todo.ts
export async function taoTodo(formData: FormData) {
  // Ham nay khong phai Server Action -- se chay tren client!
}

// DUNG -- them "use server" o dau file hoac trong ham
// app/actions/todo.ts
'use server';

export async function taoTodo(formData: FormData) {
  // Bay gio day la Server Action that su
}
```

### Loi 2: Dung useFormStatus o sai vi tri

```tsx
// SAI -- useFormStatus trong component chua form
'use client';
export default function Form() {
  const { pending } = useFormStatus(); // KHONG hoat dong!
  return (
    <form action={action}>
      <button disabled={pending}>Gui</button>
    </form>
  );
}

// DUNG -- useFormStatus trong component con cua form
function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>Gui</button>;
}
```

### Loi 3: Khong validate du lieu tren server

```tsx
// SAI -- tin tuong du lieu tu client
'use server';
export async function taoUser(formData: FormData) {
  const email = formData.get('email') as string;
  // Truc tiep insert khong validate -- NGUY HIEM!
  await db.insert(users).values({ email });
}

// DUNG -- validate truoc khi xu ly
'use server';
export async function taoUser(formData: FormData) {
  const email = formData.get('email') as string;
  if (!email || !email.includes('@')) {
    return { loi: 'Email khong hop le' };
  }
  await db.insert(users).values({ email });
}
```

### Loi 4: Truyen ham khong phai Server Action vao form action

```tsx
// SAI -- ham thuong khong phai Server Action
function xuLy(formData: FormData) {
  console.log(formData); // Chay tren client, khong phai server!
}

<form action={xuLy}> {/* Khong hoat dong nhu mong doi */}
```

---

## Cau hoi phong van

### Cau 1: Server Actions la gi va chung hoat dong nhu the nao?

**Tra loi:**

Server Actions la cac ham async duoc danh dau bang directive `"use server"`, chay tren server nhung co the duoc goi tu client. Khi ban truyen Server Action vao `<form action>` hoac goi no tu event handler, Next.js tu dong:

1. Serialize cac tham so (FormData hoac tham so thong thuong)
2. Gui HTTP POST request den server
3. Thuc thi ham tren server
4. Tra ket qua ve client
5. Tu dong rehydrate UI voi du lieu moi

Chung thay the nhu cau tao API routes rieng cho cac thao tac nhu form submission, database mutations, etc.

### Cau 2: Su khac nhau giua Inline va Module-level Server Actions?

**Tra loi:**

- **Inline:** Dinh nghia trong body cua Server Component voi `"use server"` trong ham. Tien cho action don gian, dung 1 cho.

- **Module-level:** Dinh nghia trong file rieng voi `"use server"` o dau file. Tat ca ham export deu la Server Actions. Uu diem la co the **tai su dung** o nhieu component, to chuc code sach se hon.

Module-level la cach duoc khuyen nghi cho du an that vi de bao tri va test.

### Cau 3: Lam sao bao mat Server Actions?

**Tra loi:**

3 nguyen tac bao mat quan trong:

1. **Validate input:** LUON validate moi du lieu tu client bang Zod hoac Joi. Khong bao gio tin tuong FormData -- user co the sua trong DevTools.

2. **Authentication:** Kiem tra session/token truoc khi thuc hien bat ky action nao. Dung `auth()` hoac tuong tu.

3. **Authorization:** Kiem tra quyen cua user. Vi du: chi cho phep user xoa bai viet cua chinh ho.

Ngoai ra: khong tra ve du lieu nhay cam (password hash, tokens), dung rate limiting, va log moi action quan trong.

### Cau 4: useOptimistic hoat dong nhu the nao?

**Tra loi:**

`useOptimistic` cho phep cap nhat UI ngay lap tuc (truoc khi server tra ket qua):

1. User thuc hien hanh dong (vi du: gui binh luan)
2. UI cap nhat ngay (hien binh luan moi voi trang thai "dang gui")
3. Server Action chay o background
4. Neu thanh cong: Server tra du lieu that, UI cap nhat lai voi du lieu tu server
5. Neu that bai: UI tu dong quay lai trang thai truoc do

Diem manh: UX muot ma, khong co cam giac "doi server". Diem yeu: can xu ly truong hop rollback khi server that bai.

### Cau 5: Tai sao Server Actions tot hon API Routes cho form handling?

**Tra loi:**

Server Actions uu viet hon API Routes o nhieu diem:

1. **It code hon:** Khong can tao file route rieng, khong can fetch(), khong can xu ly request/response
2. **Type-safe:** TypeScript ho tro tu dau den cuoi -- tham so va ket qua duoc type check
3. **Progressive Enhancement:** Form voi Server Actions hoat dong ca khi JavaScript bi tat (browser gui POST request binh thuong)
4. **Tich hop tot:** Tu dong tich hop voi caching (`revalidatePath`, `revalidateTag`) va navigation (`redirect`)
5. **Colocation:** Logic xu ly dat gan voi UI su dung no, de doc va bao tri hon

Tuy nhien, API Routes van can thiet cho: webhook, third-party integrations, hoac API public cho mobile app.
