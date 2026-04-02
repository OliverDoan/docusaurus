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
