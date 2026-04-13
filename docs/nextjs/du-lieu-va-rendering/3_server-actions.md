---
sidebar_position: 3
title: "3. Server Actions"
---

# Server Actions

Server Actions là một trong những tính năng đột phá nhất của Next.js App Router. Nó cho phép bạn **gọi hàm trên server trực tiếp từ Client Component** mà không cần tạo API route. Hãy tưởng tượng bạn đang ngồi tại bàn trong nhà hàng và có thể gọi trực tiếp vào bếp để đặt món -- không cần gọi qua phục vụ. Đó là sức mạnh của Server Actions.

---

## 1. Server Actions là gì?

Server Actions là **các hàm async chạy trên server**, được đánh dấu bằng directive `"use server"`. Bạn có thể gọi chúng từ cả Server Components lẫn Client Components, và chúng tự động xử lý việc gửi request từ client đến server.

### Cách hoạt động

```
Client (Browser) --> Server Action --> Server (xử lý) --> Trả kết quả về Client
```

Phía sau, Next.js tự động:
1. Tạo một HTTP POST endpoint cho mỗi Server Action
2. Serialize tham số từ client sang server
3. Thực thi hàm trên server
4. Trả kết quả về client

---

## 2. Inline Server Actions vs Module-level

### Inline Server Actions (trong Server Component)

```tsx
// app/feedback/page.tsx
// Server Component -- định nghĩa Server Action ngay trong component

export default function TrangFeedback() {
  // Inline Server Action -- định nghĩa trong Server Component body
  async function guiFeedback(formData: FormData) {
    'use server'; // Directive đánh dấu đây là Server Action

    const ten = formData.get('ten') as string;
    const noiDung = formData.get('noiDung') as string;

    // Chạy trên server -- có thể truy cập database trực tiếp
    await prisma.feedback.create({
      data: { ten, noiDung },
    });

    // Revalidate trang để hiển thị feedback mới
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

### Module-level Server Actions (file riêng)

Khi bạn muốn **chia sẻ Server Actions giữa nhiều component**, định nghĩa chung trong file riêng:

```tsx
// app/actions/san-pham.ts
'use server'; // Tất cả hàm export trong file này đều là Server Actions

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Tạo sản phẩm mới
export async function taoSanPham(formData: FormData) {
  const ten = formData.get('ten') as string;
  const gia = Number(formData.get('gia'));
  const moTa = formData.get('moTa') as string;

  await prisma.sanPham.create({
    data: { ten, gia, moTa },
  });

  revalidatePath('/san-pham');
}

// Cập nhật sản phẩm
export async function capNhatSanPham(id: string, formData: FormData) {
  const ten = formData.get('ten') as string;
  const gia = Number(formData.get('gia'));

  await prisma.sanPham.update({
    where: { id },
    data: { ten, gia },
  });

  revalidatePath('/san-pham');
}

// Xóa sản phẩm
export async function xoaSanPham(id: string) {
  await prisma.sanPham.delete({
    where: { id },
  });

  revalidatePath('/san-pham');
}
```

Sử dụng trong component:

```tsx
// app/san-pham/tao-moi/page.tsx
import { taoSanPham } from '@/app/actions/san-pham';

export default function TaoSanPham() {
  return (
    <form action={taoSanPham}>
      <input name="ten" placeholder="Tên sản phẩm" required />
      <input name="gia" type="number" placeholder="Gia" required />
      <textarea name="moTa" placeholder="Mo ta san pham" />
      <button type="submit">Tạo sản phẩm</button>
    </form>
  );
}
```

---

## 3. Forms với Server Actions

Trong mô hình truyền thống, bạn cần tạo API route rồi gọi `fetch()` từ client. Với Server Actions, bạn chỉ cần truyền hàm trực tiếp vào `action` prop cua `<form>`:

### So sánh cũ vs mới

```tsx
// =============================
// CÁCH CŨ: Cần API route
// =============================

// app/api/lien-he/route.ts -- Phải tạo API route riêng
export async function POST(request: Request) {
  const data = await request.json();
  await luuLienHe(data);
  return Response.json({ success: true });
}

// app/lien-he/FormLienHe.tsx -- Client component gọi API
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
// CÁCH MỚI: Server Action (đơn giản hơn nhiều!)
// =============================

// app/lien-he/page.tsx -- Không cần API route
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

`useFormState` (từ React DOM) cho phép bạn **nhận kết quả từ Server Action** và hiển thị cho user. Rất hữu ích cho việc hiển thị thông báo thành công hoặc lỗi validation.

> **Lưu ý:** Từ React 19, `useFormState` được đổi tên thành `useActionState`. Xem mục 6 bên dưới.

```tsx
'use client';
// app/dang-ky/FormDangKy.tsx

import { useFormState } from 'react-dom';
import { dangKyTaiKhoan } from '@/app/actions/auth';

// Kiểu dữ liệu trả về từ Server Action
type TrangThai = {
  loiLoi?: string;
  thanhCong?: boolean;
};

const trangThaBanDau: TrangThai = {};

export default function FormDangKy() {
  // useFormState nhận Server Action và trạng thái ban đầu
  const [trangThai, formAction] = useFormState(
    dangKyTaiKhoan,
    trangThaBanDau
  );

  return (
    <form action={formAction}>
      {/* Hiển thị lỗi nếu có */}
      {trangThai.loiLoi && (
        <div className="loi">{trangThai.loiLoi}</div>
      )}

      {/* Hiển thị thông báo thành công */}
      {trangThai.thanhCong && (
        <div className="thanh-cong">Đăng ký thành công!</div>
      )}

      <input name="email" type="email" placeholder="Email" required />
      <input
        name="matKhau"
        type="password"
        placeholder="Mật khẩu"
        required
      />
      <button type="submit">Đăng ký</button>
    </form>
  );
}
```

Server Action trả về trạng thái:

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

  // Kiểm tra email đã tồn tại chưa
  const daTonTai = await prisma.user.findUnique({
    where: { email },
  });

  if (daTonTai) {
    return { loiLoi: 'Email này đã được đăng ký!' };
  }

  // Tạo tài khoản mới
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

`useFormStatus` cho phép bạn **biết form đang submit hay không**. Rất hữu ích để hiển thị trạng thái loading và vô hiệu hóa nút submit.

```tsx
'use client';
// app/components/NutSubmit.tsx

import { useFormStatus } from 'react-dom';

// QUAN TRỌNG: useFormStatus phải dùng TRONG component con của <form>
// Không dùng được trong cùng component chứa <form>

export default function NutSubmit({ text = 'Gui' }: { text?: string }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Đang xử lý...' : text}
    </button>
  );
}
```

Sử dụng:

```tsx
// app/lien-he/page.tsx
import NutSubmit from '@/app/components/NutSubmit';

export default function TrangLienHe() {
  async function guiLienHe(formData: FormData) {
    'use server';
    // Xử lý form...
    await new Promise((r) => setTimeout(r, 2000)); // Mô phỏng delay
  }

  return (
    <form action={guiLienHe}>
      <input name="ten" required />
      <input name="email" type="email" required />
      <textarea name="noiDung" required />

      {/* NutSubmit tự động biết form đang submit */}
      <NutSubmit text="Gửi liên hệ" />
    </form>
  );
}
```

### Lưu ý về useFormStatus

`useFormStatus` chỉ hoạt động khi component **là con của `<form>`**. Nó không hoạt động nếu bạn dùng trong cùng component chứa `<form>`:

```tsx
'use client';

import { useFormStatus } from 'react-dom';

// SAI -- useFormStatus trong cùng component với <form>
export default function FormSai() {
  const { pending } = useFormStatus(); // KHÔNG hoạt động!

  return (
    <form action={serverAction}>
      <button disabled={pending}>Gui</button>
    </form>
  );
}

// ĐÚNG -- useFormStatus trong component con
function NutGuiDung() {
  const { pending } = useFormStatus(); // Hoạt động!
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

React 19 giới thiệu `useActionState` thay thế `useFormState`, với các cải tiến:

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
      {trangThai.thanhCong && <p className="ok">Tạo thành công!</p>}

      <input name="ten" placeholder="Tên sản phẩm" required />
      <input name="gia" type="number" placeholder="Gia" required />

      {/* Không cần component con riêng -- có isPending trên sẵn */}
      <button type="submit" disabled={dangGui}>
        {dangGui ? 'Đang tạo...' : 'Tạo sản phẩm'}
      </button>
    </form>
  );
}
```

### So sánh useFormState vs useActionState

| Tính năng | `useFormState` | `useActionState` |
|---|---|---|
| Package | `react-dom` | `react` |
| Return | `[state, formAction]` | `[state, formAction, isPending]` |
| Pending state | Cần `useFormStatus` riêng | Có sẵn `isPending` |
| React version | 18+ | 19+ |

---

## 7. Validation với Server Actions (Zod)

**LUÔN validate dữ liệu trên server.** Không bao giờ tin tưởng dữ liệu từ client.

```tsx
// app/actions/san-pham.ts
'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Schema validation với Zod
const SanPhamSchema = z.object({
  ten: z
    .string()
    .min(1, 'Tên sản phẩm khong duoc de trong')
    .max(100, 'Tên sản phẩm qua dai (toi da 100 ky tu)'),
  gia: z
    .number()
    .positive('Giá phải lớn hơn 0')
    .max(999999999, 'Giá quá cao'),
  moTa: z
    .string()
    .max(1000, 'Mô tả quá dài (tối đa 1000 ký tự)')
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
  // Parse và validate dữ liệu
  const ketQuaValidate = SanPhamSchema.safeParse({
    ten: formData.get('ten'),
    gia: Number(formData.get('gia')),
    moTa: formData.get('moTa') || undefined,
  });

  // Nếu validation fail -- trả về lỗi chi tiết
  if (!ketQuaValidate.success) {
    return {
      loi: ketQuaValidate.error.flatten().fieldErrors,
    };
  }

  // Dữ liệu đã validate -- an toàn để lưu vào database
  try {
    await prisma.sanPham.create({
      data: ketQuaValidate.data,
    });

    revalidatePath('/san-pham');
    return { thanhCong: true };
  } catch (error) {
    return {
      loi: { chung: 'Có lỗi khi tạo sản phẩm. Vui lòng thử lại.' },
    };
  }
}
```

Hiển thị lỗi validation trong form:

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
        <label>Tên sản phẩm</label>
        <input name="ten" required />
        {/* Hiển thị lỗi validation cho từng trường */}
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

      {/* Lỗi chung */}
      {trangThai.loi?.chung && (
        <div className="loi">{trangThai.loi.chung}</div>
      )}

      {trangThai.thanhCong && (
        <div className="thanh-cong">Tạo sản phẩm thanh cong!</div>
      )}

      <button type="submit" disabled={dangGui}>
        {dangGui ? 'Đang tạo...' : 'Tạo sản phẩm'}
      </button>
    </form>
  );
}
```

---

## 8. Optimistic Updates với `useOptimistic`

`useOptimistic` cho phép bạn **cập nhật UI ngay lập tức** trước khi server trả kết quả. Nếu server action thất bại, UI tự động quay lại trạng thái cũ. Giống như bạn gửi tin nhắn -- tin nhắn hiện ngay trên màn hình, còn dấu tích "Đã gửi" sẽ xuất hiện sau khi server xác nhận.

```tsx
'use client';
// app/components/DanhSachBinhLuan.tsx

import { useOptimistic } from 'react';
import { themBinhLuan } from '@/app/actions/binh-luan';

type BinhLuan = {
  id: string;
  noiDung: string;
  nguoiViet: string;
  dangGui?: boolean; // Đánh dấu bình luận optimistic (chưa gửi xong)
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

    // Cập nhật UI ngay lập tức (optimistic)
    themBinhLuanOptimistic({
      id: 'temp-' + Date.now(),
      noiDung,
      nguoiViet: 'Ban',
    });

    // Gửi lên server (chạy ở background)
    await themBinhLuan(formData);
  }

  return (
    <div>
      <h2>Bình luận</h2>

      {/* Hiển thị danh sách bình luận (bao gồm optimistic) */}
      {binhLuanOptimistic.map((bl) => (
        <div
          key={bl.id}
          style={{ opacity: bl.dangGui ? 0.5 : 1 }}
        >
          <strong>{bl.nguoiViet}:</strong> {bl.noiDung}
          {bl.dangGui && <span> (đang gửi...)</span>}
        </div>
      ))}

      {/* Form thêm bình luận */}
      <form action={xuLyGuiBinhLuan}>
        <input name="noiDung" placeholder="Viết bình luận..." required />
        <button type="submit">Gui</button>
      </form>
    </div>
  );
}
```

---

## 9. Security: Bảo mật Server Actions

### Input Validation

**LUÔN validate mọi input** từ client. Không bao giờ tin tưởng `formData`:

```tsx
'use server';

import { z } from 'zod';

export async function capNhatProfile(formData: FormData) {
  // LUÔN validate -- user có thể sửa formData trong DevTools
  const schema = z.object({
    ten: z.string().min(1).max(100),
    email: z.string().email(),
  });

  const ketQua = schema.safeParse({
    ten: formData.get('ten'),
    email: formData.get('email'),
  });

  if (!ketQua.success) {
    return { loi: 'Dữ liệu không hợp lệ' };
  }

  // Dùng ketQua.data (đã validate) thay vì formData
  await prisma.user.update({
    where: { id: userId },
    data: ketQua.data,
  });
}
```

### Authentication Check

**LUÔN kiểm tra người dùng đã đăng nhập** trước khi thực hiện Server Action:

```tsx
'use server';

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function xoaBaiViet(baiVietId: string) {
  // Kiểm tra authentication
  const session = await auth();
  if (!session?.user) {
    redirect('/dang-nhap');
  }

  // Kiểm tra authorization -- chỉ chủ sở hữu mới được xóa
  const baiViet = await prisma.baiViet.findUnique({
    where: { id: baiVietId },
  });

  if (baiViet?.authorId !== session.user.id) {
    throw new Error('Bạn không có quyền xóa bài viết này');
  }

  // An toàn để xóa
  await prisma.baiViet.delete({
    where: { id: baiVietId },
  });

  revalidatePath('/bai-viet');
}
```

### Không trả về dữ liệu nhạy cảm

```tsx
'use server';

// SAI -- trả về toàn bộ user object (có thể chứa password hash, etc.)
export async function layUser(id: string) {
  return await prisma.user.findUnique({ where: { id } });
}

// ĐÚNG -- chỉ trả về các trường cần thiết
export async function layUser(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      ten: true,
      email: true,
      // KHÔNG select password, token, etc.
    },
  });
}
```

---

## 10. Lỗi thường gặp

### Lỗi 1: Gọi Server Action từ module không có `"use server"`

```tsx
// SAI -- thiếu "use server"
// app/actions/todo.ts
export async function taoTodo(formData: FormData) {
  // Hàm này không phải Server Action -- sẽ chạy trên client!
}

// ĐÚNG -- thêm "use server" ở đầu file hoặc trong hàm
// app/actions/todo.ts
'use server';

export async function taoTodo(formData: FormData) {
  // Bây giờ đây là Server Action thật sự
}
```

### Lỗi 2: Dùng useFormStatus ở sai vị trí

```tsx
// SAI -- useFormStatus trong component chứa form
'use client';
export default function Form() {
  const { pending } = useFormStatus(); // KHÔNG hoạt động!
  return (
    <form action={action}>
      <button disabled={pending}>Gui</button>
    </form>
  );
}

// ĐÚNG -- useFormStatus trong component con cua form
function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>Gui</button>;
}
```

### Lỗi 3: Không validate dữ liệu trên server

```tsx
// SAI -- tin tưởng dữ liệu từ client
'use server';
export async function taoUser(formData: FormData) {
  const email = formData.get('email') as string;
  // Trực tiếp insert không validate -- NGUY HIỂM!
  await db.insert(users).values({ email });
}

// ĐÚNG -- validate trước khi xử lý
'use server';
export async function taoUser(formData: FormData) {
  const email = formData.get('email') as string;
  if (!email || !email.includes('@')) {
    return { loi: 'Email không hợp lệ' };
  }
  await db.insert(users).values({ email });
}
```

### Lỗi 4: Truyền hàm không phải Server Action vào form action

```tsx
// SAI -- hàm thường không phải Server Action
function xuLy(formData: FormData) {
  console.log(formData); // Chạy trên client, không phải server!
}

<form action={xuLy}> {/* Không hoạt động như mong đợi */}
```

---

## Câu hỏi phỏng vấn

### Câu 1: Server Actions là gì và chúng hoạt động như thế nào?

**Trả lời:**

Server Actions là các hàm async được đánh dấu bằng directive `"use server"`, chạy trên server nhưng có thể được gọi từ client. Khi bạn truyền Server Action vào `<form action>` hoặc gọi nó từ event handler, Next.js tự động:

1. Serialize các tham số (FormData hoặc tham số thông thường)
2. Gửi HTTP POST request đến server
3. Thực thi hàm trên server
4. Trả kết quả về client
5. Tự động rehydrate UI với dữ liệu mới

Chúng thay thế nhu cầu tạo API routes riêng cho các thao tác như form submission, database mutations, etc.

### Câu 2: Sự khác nhau giữa Inline và Module-level Server Actions?

**Trả lời:**

- **Inline:** Định nghĩa trong body của Server Component với `"use server"` trong ham. Tiện cho action đơn giản, dùng 1 chỗ.

- **Module-level:** Định nghĩa trong file riêng với `"use server"` ở đầu file. Tất cả hàm export đều là Server Actions. Ưu điểm là có thể **tái sử dụng** ở nhiều component, tổ chức code sạch sẽ hơn.

Module-level là cách được khuyến nghị cho dự án thật vì dễ bảo trì và test.

### Câu 3: Làm sao bảo mật Server Actions?

**Trả lời:**

3 nguyên tắc bảo mật quan trọng:

1. **Validate input:** LUÔN validate mọi dữ liệu từ client bằng Zod hoặc Joi. Không bao giờ tin tưởng FormData -- user có thể sửa trong DevTools.

2. **Authentication:** Kiểm tra session/token trước khi thực hiện bất kỳ action nào. Dùng `auth()` hoặc tương tự.

3. **Authorization:** Kiểm tra quyền của user. Ví dụ: chỉ cho phép user xóa bài viết của chính họ.

Ngoài ra: không trả về dữ liệu nhạy cảm (password hash, tokens), dùng rate limiting, và log mọi action quan trọng.

### Câu 4: useOptimistic hoạt động như thế nào?

**Trả lời:**

`useOptimistic` cho phép cập nhật UI ngay lập tức (trước khi server trả kết quả):

1. User thực hiện hành động (ví dụ: gửi bình luận)
2. UI cập nhật ngay (hiện bình luận mới với trạng thái "đang gửi")
3. Server Action chạy ở background
4. Nếu thành công: Server trả dữ liệu thật, UI cập nhật lại với dữ liệu từ server
5. Nếu thất bại: UI tự động quay lại trạng thái trước đó

Điểm mạnh: UX mượt mà, không có cảm giác "đợi server". Điểm yếu: cần xử lý trường hợp rollback khi server thất bại.

### Câu 5: Tại sao Server Actions tốt hơn API Routes cho form handling?

**Trả lời:**

Server Actions ưu việt hơn API Routes ở nhiều điểm:

1. **Ít code hơn:** Không cần tạo file route riêng, không cần fetch(), không cần xử lý request/response
2. **Type-safe:** TypeScript hỗ trợ từ đầu đến cuối -- tham số và kết quả được type check
3. **Progressive Enhancement:** Form với Server Actions hoạt động cả khi JavaScript bị tắt (browser gửi POST request bình thường)
4. **Tích hợp tốt:** Tự động tích hợp với caching (`revalidatePath`, `revalidateTag`) và navigation (`redirect`)
5. **Colocation:** Logic xử lý đặt gần với UI sử dụng nó, dễ đọc và bảo trì hơn

Tuy nhiên, API Routes vẫn cần thiết cho: webhook, third-party integrations, hoặc API public cho mobile app.
