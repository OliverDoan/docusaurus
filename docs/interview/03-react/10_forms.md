---
sidebar_position: 10
title: "10. Forms & Validation"
---

# Forms & Validation

> *Quản lý form và validation là một trong những tác vụ phổ biến nhất trong phát triển React — hiểu rõ các thư viện và kỹ thuật giúp bạn xây dựng form mạnh mẽ, dễ bảo trì.*

:::note[Ghi nhớ nhanh]

- ⭐ **`react-hook-form` vs `Formik`** — `react-hook-form` dùng uncontrolled + ref nên ít re-render, hiệu năng tốt hơn `Formik` (controlled, re-render mỗi lần gõ).
- **`Formik`** — chuẩn hóa state form, submission và validation, thay cho `useState` thuần khi form phức tạp.
- **Validation bằng schema** — tích hợp `Zod` (hoặc Yup) với `react-hook-form` để validate type-safe.
- **Dynamic fields** — dùng `useFieldArray` để thêm/xóa input động.
- **Client vs server validation** — client cho UX nhanh, server là lớp bảo vệ bắt buộc (không tin dữ liệu client).

:::

---

## Câu 1: Formik là gì và tại sao sử dụng nó? `[Intermediate]`

### Câu hỏi

> Formik là gì? Nó giải quyết vấn đề gì trong quản lý form React? Khi nào bạn nên chọn Formik?

### Giải thích lý thuyết

**Formik** là thư viện quản lý form phổ biến cho React, ra đời để giải quyết ba vấn đề cốt lõi:

1. **Quản lý state form** — theo dõi giá trị, trạng thái touched, lỗi validation cho từng field.
2. **Xử lý submission** — chuẩn hóa luồng submit, ngăn double-submit, quản lý `isSubmitting`.
3. **Validation** — tích hợp sẵn với Yup schema hoặc hàm validate tùy chỉnh.

**Vì sao không dùng `useState` thuần?**

Với form phức tạp, `useState` thuần nhanh chóng trở nên verbose: mỗi field cần handler riêng, logic touched/error phải tự viết, và việc reset form sau submit cũng tốn code. Formik trừu tượng hóa tất cả những việc này.

**Khi nào dùng Formik:**
- Form có nhiều field với validation phức tạp.
- Cần tích hợp Yup schema validation.
- Team đã quen Formik và muốn nhất quán.

**Khi KHÔNG nên dùng Formik:**
- Form đơn giản 1-2 field — overkill.
- Yêu cầu hiệu năng cao (re-render nhiều) — React Hook Form là lựa chọn tốt hơn.

### Code minh hoạ

```tsx
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// Schema validation với Yup
const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Email không hợp lệ').required('Bắt buộc'),
  password: Yup.string().min(6, 'Tối thiểu 6 ký tự').required('Bắt buộc'),
});

interface LoginValues {
  email: string;
  password: string;
}

function LoginForm() {
  const initialValues: LoginValues = { email: '', password: '' };

  const handleSubmit = async (
    values: LoginValues,
    { setSubmitting, resetForm }: { setSubmitting: (v: boolean) => void; resetForm: () => void }
  ) => {
    try {
      await fakeLoginApi(values);
      resetForm();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={LoginSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting }) => (
        <Form>
          <div>
            <label htmlFor="email">Email</label>
            {/* Field tự bind value + onChange + onBlur */}
            <Field id="email" name="email" type="email" />
            <ErrorMessage name="email" component="span" />
          </div>

          <div>
            <label htmlFor="password">Mật khẩu</label>
            <Field id="password" name="password" type="password" />
            <ErrorMessage name="password" component="span" />
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </Form>
      )}
    </Formik>
  );
}

async function fakeLoginApi(values: LoginValues) {
  return new Promise((res) => setTimeout(res, 1000));
}
```

### Đáp án mẫu

> Formik là thư viện quản lý state form cho React, giải quyết ba vấn đề chính: theo dõi giá trị/touched/lỗi của từng field, chuẩn hóa luồng submit, và tích hợp validation (thường dùng Yup). Nên chọn Formik khi form có logic phức tạp và cần tích hợp Yup; với form đơn giản hoặc yêu cầu hiệu năng cao hơn thì React Hook Form là lựa chọn tốt hơn.

---

## Câu 2: React Hook Form khác Formik như thế nào? `[Intermediate]`

### Câu hỏi

> So sánh React Hook Form (RHF) và Formik về hiệu năng, API, và trường hợp sử dụng. Bạn sẽ chọn cái nào và khi nào?

### Giải thích lý thuyết

**React Hook Form (RHF)** sử dụng cơ chế **uncontrolled inputs** + `ref` thay vì controlled state, giúp giảm đáng kể số lần re-render.

| Tiêu chí | Formik | React Hook Form |
|---|---|---|
| Cơ chế | Controlled (state) | Uncontrolled (ref) |
| Re-render | Mỗi keystroke re-render | Rất ít re-render |
| Bundle size | ~13 KB | ~9 KB |
| API | Component-based (`Field`, `Form`) | Hook-based (`register`, `handleSubmit`) |
| Validation tích hợp | Yup (phổ biến) | Zod, Yup, Joi, tùy chỉnh |
| Learning curve | Trung bình | Thấp hơn |
| DevTools | Không chính thức | `@hookform/devtools` |

**Khi chọn React Hook Form:**
- Form cần hiệu năng cao (danh sách field lớn, re-render nhạy cảm).
- Muốn tích hợp Zod (TypeScript-first validation).
- Ưu tiên API hook đơn giản hơn component JSX.

**Khi chọn Formik:**
- Team đã có codebase Formik lớn.
- Cần `FieldArray` với API quen thuộc.
- Ưu tiên component pattern hơn hook pattern.

### Code minh hoạ

```tsx
import { useForm } from 'react-hook-form';

interface LoginValues {
  email: string;
  password: string;
}

function LoginFormRHF() {
  const {
    register,       // kết nối input với form (dùng ref, không tạo state)
    handleSubmit,   // wrapper xử lý submit + validation
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginValues>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginValues) => {
    await fakeLoginApi(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          // register trả về { ref, name, onChange, onBlur }
          {...register('email', {
            required: 'Bắt buộc',
            pattern: { value: /^\S+@\S+$/i, message: 'Email không hợp lệ' },
          })}
        />
        {errors.email && <span>{errors.email.message}</span>}
      </div>

      <div>
        <label htmlFor="password">Mật khẩu</label>
        <input
          id="password"
          type="password"
          {...register('password', {
            required: 'Bắt buộc',
            minLength: { value: 6, message: 'Tối thiểu 6 ký tự' },
          })}
        />
        {errors.password && <span>{errors.password.message}</span>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
      </button>
    </form>
  );
}

async function fakeLoginApi(values: LoginValues) {
  return new Promise((res) => setTimeout(res, 1000));
}
```

### Đáp án mẫu

> React Hook Form dùng uncontrolled inputs qua `ref` nên ít re-render hơn Formik — phù hợp khi hiệu năng quan trọng. Formik dùng controlled state, API component-based quen thuộc hơn với developer từ class component. Hiện tại tôi ưu tiên React Hook Form vì hiệu năng tốt hơn, tích hợp Zod tự nhiên, và API hook đơn giản.

---

## Câu 3: Dynamic form fields (thêm/xóa input động) được implement như thế nào? `[Intermediate]`

### Câu hỏi

> Làm thế nào để implement form có danh sách field động (ví dụ: thêm/xóa dòng địa chỉ)? Trình bày cách làm với React Hook Form.

### Giải thích lý thuyết

Dynamic fields (hay còn gọi là **field arrays**) là danh sách input có thể tăng giảm số lượng tại runtime. Thách thức chính là:

1. **Quản lý state** — mỗi item trong mảng có nhiều field con.
2. **Key ổn định** — tránh mất giá trị khi reorder; không dùng index làm key.
3. **Validation từng item** — lỗi phải gắn đúng với item tương ứng.

**React Hook Form** cung cấp hook `useFieldArray` xử lý toàn bộ những vấn đề trên, mỗi item được gán `id` ổn định từ thư viện.

**Formik** có `FieldArray` component tương đương.

**Lưu ý quan trọng:**
- Luôn dùng `field.id` (từ `useFieldArray`) làm `key`, KHÔNG dùng `index`.
- `append` thêm vào cuối, `prepend` thêm vào đầu, `remove(index)` xóa theo vị trí.
- `move`, `swap`, `insert` cho phép sắp xếp lại.

### Code minh hoạ

```tsx
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';

interface Address {
  street: string;
  city: string;
}

interface FormValues {
  name: string;
  addresses: Address[];
}

function DynamicAddressForm() {
  const {
    register,
    control,   // cần truyền vào useFieldArray
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      addresses: [{ street: '', city: '' }], // bắt đầu với 1 địa chỉ
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'addresses', // tên mảng trong form values
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Họ tên</label>
        <input {...register('name', { required: 'Bắt buộc' })} />
        {errors.name && <span>{errors.name.message}</span>}
      </div>

      <h3>Danh sách địa chỉ</h3>

      {fields.map((field, index) => (
        // Dùng field.id (ổn định) thay vì index làm key
        <div key={field.id} style={{ border: '1px solid #ccc', padding: 8, marginBottom: 8 }}>
          <div>
            <label>Đường</label>
            <input
              {...register(`addresses.${index}.street`, { required: 'Bắt buộc' })}
            />
            {errors.addresses?.[index]?.street && (
              <span>{errors.addresses[index]?.street?.message}</span>
            )}
          </div>

          <div>
            <label>Thành phố</label>
            <input
              {...register(`addresses.${index}.city`, { required: 'Bắt buộc' })}
            />
            {errors.addresses?.[index]?.city && (
              <span>{errors.addresses[index]?.city?.message}</span>
            )}
          </div>

          {/* Không cho xóa nếu chỉ còn 1 địa chỉ */}
          <button
            type="button"
            onClick={() => remove(index)}
            disabled={fields.length === 1}
          >
            Xóa địa chỉ
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => append({ street: '', city: '' })}
      >
        + Thêm địa chỉ
      </button>

      <br />
      <button type="submit">Lưu</button>
    </form>
  );
}
```

### Đáp án mẫu

> Dynamic fields được implement bằng `useFieldArray` trong React Hook Form (hoặc `FieldArray` trong Formik). Hook này quản lý mảng field với các thao tác `append`, `remove`, `move`. Điểm quan trọng là dùng `field.id` — không dùng `index` — làm `key` để React nhận diện đúng item khi reorder, tránh mất giá trị input.

---

## Câu 4: Zod integration với React Hook Form như thế nào? `[Intermediate]`

### Câu hỏi

> Zod là gì và tại sao nên dùng nó với React Hook Form thay vì validation nội tuyến? Trình bày cách tích hợp.

### Giải thích lý thuyết

**Zod** là thư viện schema validation TypeScript-first — schema vừa là runtime validator, vừa tự động sinh ra TypeScript types.

**Tại sao dùng Zod thay vì validation nội tuyến trong `register`:**

| Tiêu chí | Validation nội tuyến | Zod schema |
|---|---|---|
| Type safety | Thủ công | Tự động suy ra từ schema |
| Tái sử dụng | Khó | Schema dùng lại ở cả FE lẫn BE |
| Độ phức tạp | Đơn giản là tốt | Tốt cho logic phức tạp |
| Readability | Rải rác trong JSX | Tập trung, dễ đọc |
| Tích hợp BE | Không | Có (chia sẻ schema) |

**Luồng tích hợp:**
1. Định nghĩa Zod schema.
2. Dùng `z.infer` để suy ra type — không cần viết interface riêng.
3. Dùng `@hookform/resolvers/zod` làm cầu nối giữa RHF và Zod.
4. Truyền `zodResolver(schema)` vào `useForm`.

### Code minh hoạ

```tsx
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Bước 1: Định nghĩa schema Zod
const RegisterSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Tên đăng nhập tối thiểu 3 ký tự')
      .max(20, 'Tối đa 20 ký tự')
      .regex(/^[a-zA-Z0-9_]+$/, 'Chỉ chứa chữ, số, dấu gạch dưới'),
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
    confirmPassword: z.string(),
    age: z.number({ invalid_type_error: 'Tuổi phải là số' }).min(18, 'Phải từ 18 tuổi trở lên'),
  })
  // Bước 2: Validation liên field (cross-field)
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'], // lỗi gắn vào field này
  });

// Bước 3: Suy ra type từ schema — không cần viết interface riêng
type RegisterValues = z.infer<typeof RegisterSchema>;

function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    // Bước 4: Kết nối Zod với RHF qua zodResolver
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      age: undefined,
    },
  });

  const onSubmit: SubmitHandler<RegisterValues> = async (data) => {
    // data đã được validate và có type đúng
    console.log('Dữ liệu hợp lệ:', data);
    await fakeRegisterApi(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Tên đăng nhập</label>
        <input {...register('username')} />
        {errors.username && <span>{errors.username.message}</span>}
      </div>

      <div>
        <label>Email</label>
        <input type="email" {...register('email')} />
        {errors.email && <span>{errors.email.message}</span>}
      </div>

      <div>
        <label>Mật khẩu</label>
        <input type="password" {...register('password')} />
        {errors.password && <span>{errors.password.message}</span>}
      </div>

      <div>
        <label>Xác nhận mật khẩu</label>
        <input type="password" {...register('confirmPassword')} />
        {errors.confirmPassword && <span>{errors.confirmPassword.message}</span>}
      </div>

      <div>
        <label>Tuổi</label>
        {/* valueAsNumber chuyển string input thành number trước khi validate */}
        <input type="number" {...register('age', { valueAsNumber: true })} />
        {errors.age && <span>{errors.age.message}</span>}
      </div>

      <button type="submit" disabled={isSubmitting}>Đăng ký</button>
    </form>
  );
}

async function fakeRegisterApi(data: RegisterValues) {
  return new Promise((res) => setTimeout(res, 800));
}
```

### Đáp án mẫu

> Zod là thư viện schema validation TypeScript-first; schema vừa validate runtime vừa suy ra static type qua `z.infer`. Tích hợp với React Hook Form qua `@hookform/resolvers/zod` — truyền `zodResolver(schema)` vào `useForm`. Lợi ích chính: type safety tự động, logic validation tập trung dễ đọc, và schema có thể tái sử dụng ở cả frontend lẫn backend.

---

## Câu 5: Server-side validation và client-side validation — khi nào dùng cái nào? `[Intermediate]`

### Câu hỏi

> Phân biệt client-side validation và server-side validation. Khi nào nên dùng cái nào? Làm thế nào để hiển thị lỗi server trong React Hook Form?

### Giải thích lý thuyết

**Client-side validation** chạy trực tiếp trên trình duyệt, trước khi gửi request.

**Server-side validation** chạy trên server sau khi nhận request.

| Tiêu chí | Client-side | Server-side |
|---|---|---|
| Tốc độ phản hồi | Tức thì, không cần network | Chậm hơn (round trip) |
| Bảo mật | Có thể bị bypass | Không thể bị bypass |
| Truy cập DB | Không thể | Có thể (kiểm tra trùng email) |
| UX | Tốt (feedback nhanh) | Chỉ sau submit |
| Bắt buộc có? | Không (nhưng nên có) | BẮT BUỘC |

**Nguyên tắc vàng:**
- Client-side validation chỉ là **UX enhancement** — không bao giờ là lớp bảo mật duy nhất.
- Server-side validation là **bắt buộc** vì client-side có thể bị vô hiệu hóa hoặc bypass.
- Dùng **cả hai** trong hầu hết trường hợp thực tế.

**Các loại validation chỉ server mới làm được:**
- Kiểm tra email/username đã tồn tại chưa (truy cập DB).
- Xác thực business rule phức tạp liên quan nhiều bảng.
- Kiểm tra quyền truy cập (authorization).

**Hiển thị lỗi server trong RHF:**
Dùng `setError` để gắn lỗi thủ công vào field sau khi nhận response từ API.

### Code minh hoạ

```tsx
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const RegisterSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Tối thiểu 8 ký tự'),
});

type RegisterValues = z.infer<typeof RegisterSchema>;

// Giả lập response lỗi từ server
interface ApiError {
  field: keyof RegisterValues;
  message: string;
}

async function registerApi(data: RegisterValues): Promise<{ errors?: ApiError[] }> {
  // Giả lập: email đã tồn tại
  if (data.email === 'taken@example.com') {
    return { errors: [{ field: 'email', message: 'Email này đã được đăng ký' }] };
  }
  return {};
}

function RegisterForm() {
  const {
    register,
    handleSubmit,
    setError,   // dùng để gắn lỗi server vào field
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(RegisterSchema),
  });

  const onSubmit: SubmitHandler<RegisterValues> = async (data) => {
    const response = await registerApi(data);

    if (response.errors && response.errors.length > 0) {
      // Gắn từng lỗi server vào đúng field
      response.errors.forEach(({ field, message }) => {
        setError(field, {
          type: 'server', // type tùy đặt, dùng để phân biệt nguồn lỗi
          message,
        });
      });
      return; // không tiếp tục
    }

    console.log('Đăng ký thành công!', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Email</label>
        <input type="email" {...register('email')} />
        {errors.email && (
          <span style={{ color: errors.email.type === 'server' ? 'orange' : 'red' }}>
            {/* Phân biệt lỗi client và server để hiển thị khác nhau nếu muốn */}
            {errors.email.message}
          </span>
        )}
      </div>

      <div>
        <label>Mật khẩu</label>
        <input type="password" {...register('password')} />
        {errors.password && <span>{errors.password.message}</span>}
      </div>

      {/* Hiển thị lỗi chung không gắn với field cụ thể */}
      {errors.root && (
        <div style={{ color: 'red', padding: 8, background: '#fff0f0' }}>
          {errors.root.message}
        </div>
      )}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
      </button>
    </form>
  );
}
```

### Đáp án mẫu

> Client-side validation cải thiện UX bằng feedback tức thì nhưng có thể bị bypass — không được dùng làm lớp bảo mật duy nhất. Server-side validation là bắt buộc vì nó không thể bị bypass và có thể truy cập database (ví dụ kiểm tra email trùng). Trong thực tế luôn dùng cả hai. Với React Hook Form, lỗi server được hiển thị bằng `setError(fieldName, { type: 'server', message })` sau khi nhận response từ API.

---
