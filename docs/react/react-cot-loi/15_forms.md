---
sidebar_position: 15
title: "Forms"
---

# Forms

## Controlled Components

React kiểm soát giá trị input thông qua state — đây là cách chuẩn:

```tsx
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

### Tại sao dùng Controlled?

- React là **single source of truth** cho giá trị input
- Dễ validate, format, transform giá trị realtime
- Dễ reset form, pre-fill data

## Quản lý form phức tạp với object state

```tsx
interface FormData {
  name: string;
  email: string;
  role: string;
  newsletter: boolean;
}

function RegistrationForm() {
  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    role: 'user',
    newsletter: false,
  });

  // Một handler cho tất cả fields
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : value,
    }));
  };

  return (
    <form>
      <input name="name" value={form.name} onChange={handleChange} />
      <input name="email" value={form.email} onChange={handleChange} />
      <select name="role" value={form.role} onChange={handleChange}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <label>
        <input
          name="newsletter"
          type="checkbox"
          checked={form.newsletter}
          onChange={handleChange}
        />
        Subscribe to newsletter
      </label>
    </form>
  );
}
```

## Uncontrolled Components

Dùng `useRef` để đọc giá trị DOM trực tiếp — ít dùng hơn:

```tsx
function SearchForm() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = inputRef.current?.value;
    console.log('Search:', value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} defaultValue="" />
      <button type="submit">Search</button>
    </form>
  );
}
```

### Khi nào dùng Uncontrolled?

- File input (`<input type="file" />`) — luôn là uncontrolled
- Form đơn giản chỉ cần giá trị khi submit
- Tích hợp thư viện non-React

### Controlled vs Uncontrolled

| | Controlled | Uncontrolled |
|---|---|---|
| Giá trị | `value` + `onChange` | `defaultValue` + `ref` |
| Source of truth | React state | DOM |
| Validate realtime | ✅ | ❌ |
| Format/transform | ✅ | ❌ |
| Performance | Re-render mỗi keystroke | Không re-render |
| Khi nào dùng | **Hầu hết trường hợp** | File input, form đơn giản |

## Form Validation

### Validation cơ bản

```tsx
interface Errors {
  name?: string;
  email?: string;
}

function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState<Errors>({});

  const validate = (): boolean => {
    const newErrors: Errors = {};

    if (!form.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Submit form
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>
      <div>
        <input
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Thư viện form nên dùng

Với form phức tạp, nên dùng thư viện chuyên dụng:

- **React Hook Form** — performance tốt, ít re-render, API dễ dùng
- **Formik** — phổ biến, nhiều tính năng
- **Zod / Yup** — schema validation, kết hợp với form library

```tsx
// React Hook Form + Zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  age: z.number().min(18, 'Must be 18+'),
});

type FormData = z.infer<typeof schema>;

function MyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log(data); // Type-safe, validated data
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}

      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="number" {...register('age', { valueAsNumber: true })} />
      {errors.age && <span>{errors.age.message}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

## Textarea và Select

```tsx
// Textarea — dùng value thay vì children
<textarea value={bio} onChange={(e) => setBio(e.target.value)} />

// Select
<select value={country} onChange={(e) => setCountry(e.target.value)}>
  <option value="">-- Select --</option>
  <option value="vn">Vietnam</option>
  <option value="us">USA</option>
</select>

// Multiple select
<select
  multiple
  value={selectedLanguages}
  onChange={(e) => {
    const values = Array.from(e.target.selectedOptions, (o) => o.value);
    setSelectedLanguages(values);
  }}
>
  <option value="js">JavaScript</option>
  <option value="ts">TypeScript</option>
  <option value="py">Python</option>
</select>
```

---

## Câu hỏi phỏng vấn

### Câu 1: Controlled và Uncontrolled components khác nhau thế nào?
**Đáp án:**
- **Controlled component**: React state là source of truth. Input nhận `value` từ state và cập nhật qua `onChange`.
- **Uncontrolled component**: DOM là source of truth. Dùng `defaultValue` và `ref` để đọc giá trị khi cần.

```tsx
// Controlled — React kiểm soát giá trị
function ControlledInput() {
  const [value, setValue] = useState('');
  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

// Uncontrolled — DOM giữ giá trị
function UncontrolledInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleSubmit = () => {
    console.log(inputRef.current?.value); // Đọc từ DOM
  };
  return <input ref={inputRef} defaultValue="" />;
}
```

**Controlled** phù hợp hầu hết trường hợp vì: validate realtime, format input, dễ reset/pre-fill. **Uncontrolled** dùng cho file input (luôn uncontrolled), form đơn giản, hoặc tích hợp thư viện non-React.

### Câu 2: React Hook Form có ưu điểm gì so với quản lý form bằng useState?
**Đáp án:**
React Hook Form dùng **uncontrolled components** bên trong nên có nhiều ưu điểm:

1. **Ít re-render** — Không re-render component mỗi keystroke như `useState`.
2. **API đơn giản** — `register`, `handleSubmit`, `formState` thay vì viết handler cho mỗi field.
3. **Validation tích hợp** — Kết hợp Zod/Yup cho schema validation type-safe.
4. **Performance tốt** — Form 50+ fields vẫn mượt.

```tsx
// useState: mỗi keystroke → re-render toàn bộ form
function WithState() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  // 10 fields = 10 useState + 10 onChange handlers...
}

// React Hook Form: không re-render mỗi keystroke
function WithRHF() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}

      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

### Câu 3: Có những chiến lược validation form nào trong React?
**Đáp án:**

1. **Validate on submit** — Kiểm tra tất cả fields khi submit. Đơn giản nhưng user không biết lỗi cho đến khi submit.

2. **Validate on change** — Kiểm tra mỗi khi giá trị thay đổi. Feedback nhanh nhưng có thể annoying khi mới bắt đầu gõ.

3. **Validate on blur** — Kiểm tra khi user rời khỏi field. Cân bằng tốt giữa UX và feedback.

4. **Schema validation** — Dùng Zod/Yup định nghĩa schema, validate toàn bộ form cùng lúc.

```tsx
// Schema validation với Zod
const schema = z.object({
  name: z.string().min(1, 'Required').max(100),
  email: z.string().email('Invalid email'),
  age: z.number().min(18, 'Must be 18+'),
  password: z.string().min(8, 'At least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// React Hook Form với validate on blur
const { register } = useForm<FormData>({
  resolver: zodResolver(schema),
  mode: 'onBlur', // validate khi blur
});
```

**Best practice:** Dùng `onBlur` cho hầu hết forms, kết hợp schema validation (Zod) để đảm bảo type-safe và reusable validation logic.

### Câu 4: Làm sao quản lý form phức tạp với nhiều fields và nested data?
**Đáp án:**
Có 3 cách tiếp cận:

**Cách 1: Object state** — gom tất cả fields vào 1 state object:

```tsx
const [form, setForm] = useState({
  name: '',
  email: '',
  address: { street: '', city: '', zip: '' },
});

// Cập nhật nested field (immutable)
const updateAddress = (field: string, value: string) => {
  setForm((prev) => ({
    ...prev,
    address: { ...prev.address, [field]: value },
  }));
};
```

**Cách 2: useReducer** — cho logic cập nhật phức tạp:

```tsx
type Action =
  | { type: 'SET_FIELD'; field: string; value: string }
  | { type: 'RESET' };

function formReducer(state: FormState, action: Action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return initialState;
  }
}
```

**Cách 3: React Hook Form** (recommended) — xử lý nested data, arrays, validation tự động:

```tsx
const { register, control } = useForm<OrderForm>();
const { fields, append, remove } = useFieldArray({
  control,
  name: 'items', // Quản lý dynamic array of items
});

return (
  <form>
    {fields.map((field, index) => (
      <div key={field.id}>
        <input {...register(`items.${index}.name`)} />
        <input {...register(`items.${index}.quantity`, { valueAsNumber: true })} />
        <button onClick={() => remove(index)}>Remove</button>
      </div>
    ))}
    <button onClick={() => append({ name: '', quantity: 1 })}>Add Item</button>
  </form>
);
```
