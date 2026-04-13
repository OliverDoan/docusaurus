---
sidebar_position: 2
title: "2. Component API Design, Design System, Storybook"
---

# Component API Design, Design System, Storybook

Thiết kế component tốt là kỹ năng phân biệt một frontend developer "code được" với một người "thiết kế được hệ thống UI". Bài này cover những câu hỏi phỏng vấn về cách xây dựng component library, design system, và documentation.

---

## Câu 1: Nguyên tắc thiết kế Component API tốt là gì? `[Intermediate]`

### Giải thích lý thuyết

Component API chính là **props interface** -- đây là "hợp đồng" giữa component và người dùng nó. Một API tốt phải **dễ dùng đúng, khó dùng sai**.

**5 nguyên tắc vàng:**

1. **Minimal API surface**: Ít props nhất có thể. Mỗi prop thêm vào là thêm complexity.
2. **Sensible defaults**: Props nên có default value hợp lý. User chỉ pass những gì khác default.
3. **Consistent naming**: `onX` cho events, `isX`/`hasX` cho booleans, `xRef` cho refs.
4. **Composable**: Ưu tiên composition (children, render props) hơn configuration (nhiều boolean props).
5. **Type-safe**: TypeScript types rõ ràng, dùng union types thay vì `string`.

### Code ví dụ

**API xấu -- quá nhiều boolean props (configuration hell):**

```typescript
// Component API xấu -- 10 boolean props
interface BadButtonProps {
  label: string;
  isPrimary?: boolean;
  isSecondary?: boolean;
  isOutline?: boolean;
  isGhost?: boolean;
  isSmall?: boolean;
  isMedium?: boolean;
  isLarge?: boolean;
  isLoading?: boolean;
  isDisabled?: boolean;
  hasIcon?: boolean;
  iconPosition?: 'left' | 'right';
  iconName?: string;
}

// Dùng: khó đọc, dễ conflict
<BadButton
  label="Submit"
  isPrimary
  isLarge
  isLoading
  hasIcon
  iconPosition="left"
  iconName="check"
/>
```

**API tốt -- dùng union types và composition:**

```typescript
// Component API tốt
interface ButtonProps {
  children: React.ReactNode;           // Composition thay vì label prop
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';  // Union thay vì nhiều boolean
  size?: 'sm' | 'md' | 'lg';          // Union thay vì nhiều boolean
  loading?: boolean;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent) => void;
}

// Defaults hợp lý
function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? <Spinner size={size} /> : children}
    </button>
  );
}

// Dùng: rõ ràng, dễ đọc
<Button variant="primary" size="lg" loading>
  <CheckIcon /> Submit
</Button>
```

### Đáp án mẫu

> "Component API tốt tuân theo nguyên tắc 'pit of success' -- dễ dùng đúng, khó dùng sai. Tôi luôn bắt đầu với minimal props, dùng union types thay boolean flags (variant='primary' thay vì isPrimary), cung cấp sensible defaults, và ưu tiên children/composition. Khi thiết kế, tôi hỏi: 'Nếu 1 junior dev dùng component này mà không đọc docs, họ có viết đúng không?' Nếu không, API cần đơn giản hơn."

---

## Câu 2: Composition vs Configuration -- khi nào dùng pattern nào? `[Senior]`

### Giải thích lý thuyết

Đây là trade-off cốt lõi khi thiết kế component:

- **Configuration**: Component nhận data qua props, tự render mọi thứ bên trong. User không kiểm soát layout bên trong.
- **Composition**: Component nhận `children` hoặc render props, user tự quyết định render gì bên trong.

### Code ví dụ

**Configuration approach:**

```typescript
// Configuration: component kiểm soát mọi thứ
interface SelectProps {
  options: Array<{ value: string; label: string; icon?: string }>;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  clearable?: boolean;
  groupBy?: string;
  renderOption?: (option: Option) => React.ReactNode; // escape hatch
}

<Select
  options={[
    { value: 'vn', label: 'Vietnam', icon: '🇻🇳' },
    { value: 'us', label: 'USA', icon: '🇺🇸' },
  ]}
  value={selected}
  onChange={setSelected}
  searchable
  clearable
/>
```

**Composition approach:**

```typescript
// Composition: user kiểm soát layout
interface SelectRootProps {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}

function SelectRoot({ value, onChange, children }: SelectRootProps) {
  return (
    <SelectContext.Provider value={{ value, onChange }}>
      <div className="select-root">{children}</div>
    </SelectContext.Provider>
  );
}

function SelectTrigger({ children }: { children: React.ReactNode }) {
  const { value } = useSelectContext();
  return <button className="select-trigger">{children}</button>;
}

function SelectContent({ children }: { children: React.ReactNode }) {
  return <div className="select-content">{children}</div>;
}

function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  const { onChange } = useSelectContext();
  return (
    <div className="select-item" onClick={() => onChange(value)}>
      {children}
    </div>
  );
}

// Sử dụng -- user tự quyết layout
<SelectRoot value={selected} onChange={setSelected}>
  <SelectTrigger>
    <span>Choose country</span>
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="vn">Vietnam</SelectItem>
    <SelectItem value="us">USA</SelectItem>
  </SelectContent>
</SelectRoot>
```

### Bảng so sánh

| Tiêu chí | Configuration | Composition |
|----------|---------------|-------------|
| **Dễ dùng** | Nhanh, ít code | Cần hiểu pattern |
| **Flexibility** | Thấp (cần escape hatches) | Cao (tự quyết layout) |
| **Bundle size** | Lớn hơn (tất cả features) | Nhỏ hơn (chỉ import cần) |
| **Phù hợp** | Internal tools, simple use cases | Design system, public libraries |
| **Ví dụ thực tế** | Ant Design, Material UI v4 | Radix UI, Headless UI, shadcn/ui |

### Đáp án mẫu

> "Tôi chọn composition cho design system vì nó cho phép customize mà không cần escape hatches. Pattern compound component (Select.Root, Select.Item) giống Radix UI rất powerful -- user control layout, component control behavior. Configuration phù hợp cho internal tools nơi cần ship nhanh và ít customize. Trong thực tế, tôi thường mix: compound component cho complex widgets (Select, Dialog, Tabs), simple props cho atomic elements (Button, Badge, Input)."

---

## Câu 3: Design System bao gồm những gì? Cách xây dựng? `[Senior]`

### Giải thích lý thuyết

Design System không chỉ là component library. Nó là **hệ thống hoàn chỉnh** bao gồm:

1. **Design Tokens**: Các giá trị nguyên tử (colors, spacing, typography, shadows...)
2. **Components**: UI building blocks (Button, Input, Card, Modal...)
3. **Patterns**: Cách kết hợp components (Form layouts, Navigation patterns...)
4. **Documentation**: Hướng dẫn sử dụng, best practices, do/don't
5. **Tooling**: Storybook, visual regression testing, publishing pipeline

### Code ví dụ

**Design Tokens:**

```typescript
// tokens/colors.ts
export const colors = {
  // Primitive tokens (raw values)
  blue50: '#eff6ff',
  blue100: '#dbeafe',
  blue500: '#3b82f6',
  blue600: '#2563eb',
  blue700: '#1d4ed8',

  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray900: '#111827',

  red500: '#ef4444',
  green500: '#22c55e',
} as const;

// Semantic tokens (meaningful names)
export const semanticColors = {
  // Background
  bgPrimary: colors.blue600,
  bgSecondary: colors.gray100,
  bgDanger: colors.red500,
  bgSuccess: colors.green500,

  // Text
  textPrimary: colors.gray900,
  textSecondary: colors.gray100,
  textOnPrimary: '#ffffff',

  // Border
  borderDefault: colors.gray100,
  borderFocus: colors.blue500,
} as const;

// tokens/spacing.ts
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
} as const;

// tokens/typography.ts
export const typography = {
  fontFamily: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;
```

**Component sử dụng tokens:**

```typescript
// components/Button/Button.tsx
import { semanticColors, spacing, typography } from '@mycompany/tokens';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        outline: 'border border-gray-300 bg-transparent hover:bg-gray-50',
        ghost: 'bg-transparent hover:bg-gray-100',
        danger: 'bg-red-500 text-white hover:bg-red-600',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}
```

### Đáp án mẫu

> "Design System gồm 3 tầng: tokens (primitive values), components (UI building blocks), và patterns (cách kết hợp components). Tôi bắt đầu bằng audit UI hiện tại, extract tokens (colors, spacing, typography), rồi build atomic components trước (Button, Input, Badge). Dùng CVA (class-variance-authority) để manage variants, Storybook để document, và Chromatic để visual regression testing. Quan trọng nhất là semantic tokens -- không dùng `blue-500` mà dùng `bgPrimary`, để khi đổi theme chỉ cần đổi mapping."

---

## Câu 4: Storybook dùng để làm gì? Visual testing hoạt động ra sao? `[Intermediate]`

### Giải thích lý thuyết

**Storybook** là tool để phát triển UI components trong môi trường **isolated** -- không cần chạy cả app, không cần fake data từ API. Mỗi "story" là một state cụ thể của component.

Storybook phục vụ 3 mục đích:
1. **Development**: Develop component isolated, nhanh hơn
2. **Documentation**: Living docs, luôn up-to-date
3. **Testing**: Visual regression, interaction testing, accessibility

### Code ví dụ

**Story file:**

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
    },
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Mỗi export là 1 story (1 state của component)
export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
};

export const Loading: Story = {
  args: {
    children: 'Loading...',
    loading: true,
  },
};

// Interaction testing
export const WithInteraction: Story = {
  args: {
    children: 'Click me',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await userEvent.click(button);
    await expect(button).toHaveFocus();
  },
};
```

**Visual testing với Chromatic:**

```bash
# Install
npm install --save-dev chromatic

# Run visual tests (chụp screenshot mỗi story, so sánh với baseline)
npx chromatic --project-token=<your-token>
```

```json
{
  "scripts": {
    "chromatic": "chromatic --exit-zero-on-changes",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

### Đáp án mẫu

> "Storybook là isolated dev environment cho UI components. Mỗi story represent 1 state -- Primary button, Loading state, Error state... Nó giải quyết 3 vấn đề: develop nhanh hơn (không cần spin up cả app), documentation tự động (autodocs từ props), và visual regression testing (Chromatic chụp screenshot mỗi story, alert khi UI thay đổi). Trong team tôi, Storybook là PR requirement -- mỗi component mới phải có stories trước khi merge."

---

## Câu 5: Atomic Design là gì? Áp dụng vào React như thế nào? `[Intermediate]`

### Giải thích lý thuyết

**Atomic Design** là methodology của Brad Frost, chia UI thành 5 levels dựa trên analogy hóa học:

1. **Atoms**: Elements cơ bản nhất -- Button, Input, Label, Icon, Badge
2. **Molecules**: Nhóm atoms tạo thành unit có chức năng -- SearchBar (Input + Button), FormField (Label + Input + ErrorMessage)
3. **Organisms**: Nhóm molecules tạo thành section -- Header (Logo + Nav + SearchBar + UserMenu), ProductCard (Image + Title + Price + AddToCart)
4. **Templates**: Page layout không có real data -- ProductListTemplate, DashboardTemplate
5. **Pages**: Templates với real data -- ProductListPage, DashboardPage

### Code ví dụ

**Cấu trúc thư mục:**

```
src/
├── components/
│   ├── atoms/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.stories.tsx
│   │   │   └── Button.test.tsx
│   │   ├── Input/
│   │   ├── Label/
│   │   ├── Badge/
│   │   └── Icon/
│   ├── molecules/
│   │   ├── FormField/
│   │   ├── SearchBar/
│   │   └── NavItem/
│   ├── organisms/
│   │   ├── Header/
│   │   ├── ProductCard/
│   │   └── Sidebar/
│   └── templates/
│       ├── DashboardLayout/
│       └── ProductListLayout/
└── pages/
    ├── Dashboard/
    └── ProductList/
```

**Atom -- Input:**

```typescript
// components/atoms/Input/Input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error, className, ...props }: InputProps) {
  return (
    <input
      className={`input ${error ? 'input-error' : ''} ${className || ''}`}
      {...props}
    />
  );
}
```

**Molecule -- FormField (kết hợp Label + Input + Error):**

```typescript
// components/molecules/FormField/FormField.tsx
import { Label } from '../../atoms/Label/Label';
import { Input } from '../../atoms/Input/Input';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
}

export function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required,
}: FormFieldProps) {
  return (
    <div className="form-field">
      <Label htmlFor={name} required={required}>
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        error={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {error && (
        <span id={`${name}-error`} className="form-field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
```

**Organism -- LoginForm:**

```typescript
// components/organisms/LoginForm/LoginForm.tsx
import { FormField } from '../../molecules/FormField/FormField';
import { Button } from '../../atoms/Button/Button';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  loading?: boolean;
}

export function LoginForm({ onSubmit, loading }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(email, password);
  }

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <FormField
        label="Email"
        name="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        required
      />
      <FormField
        label="Password"
        name="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        required
      />
      <Button type="submit" loading={loading}>
        Login
      </Button>
    </form>
  );
}
```

### Đáp án mẫu

> "Atomic Design giúp tổ chức component theo abstraction level: atoms (Button, Input), molecules (FormField = Label + Input + Error), organisms (LoginForm = nhiều FormField + Button). Trong thực tế, tôi không theo strict 5 levels -- thường gộp templates và pages. Quan trọng là nguyên tắc: atoms không biết context, molecules combine atoms cho 1 function, organisms là standalone sections. Khi review PR, tôi check: component này đang ở level nào? Có import đúng level không? Atom không nên import organism."

---

## Câu 6: Headless UI pattern là gì? Tại sao ngày càng phổ biến? `[Senior]`

### Giải thích lý thuyết

**Headless UI** là pattern tách biệt **logic/behavior** khỏi **visual/styling**. Component cung cấp functionality (state management, keyboard navigation, accessibility) nhưng **không render UI** -- người dùng tự quyết render gì.

Các thư viện headless phổ biến: Radix UI, Headless UI (Tailwind Labs), React Aria (Adobe), Downshift, TanStack Table.

### Code ví dụ

**Custom headless hook -- useToggle:**

```typescript
// hooks/useToggle.ts
interface UseToggleReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  triggerProps: {
    onClick: () => void;
    'aria-expanded': boolean;
  };
  contentProps: {
    role: string;
    hidden: boolean;
  };
}

export function useToggle(defaultOpen = false): UseToggleReturn {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
    triggerProps: {
      onClick: toggle,
      'aria-expanded': isOpen,
    },
    contentProps: {
      role: 'region',
      hidden: !isOpen,
    },
  };
}

// Sử dụng -- user tự quyết UI
function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const { isOpen, triggerProps, contentProps } = useToggle();

  return (
    <div className="accordion">
      <button className="accordion-trigger" {...triggerProps}>
        {title}
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>
      <div className="accordion-content" {...contentProps}>
        {children}
      </div>
    </div>
  );
}
```

**So sánh styled vs headless:**

```typescript
// Styled library (Material UI) -- có sẵn UI, khó customize
import { Select, MenuItem } from '@mui/material';

<Select value={value} onChange={handleChange}>
  <MenuItem value="vn">Vietnam</MenuItem>
  <MenuItem value="us">USA</MenuItem>
</Select>

// Headless library (Radix UI) -- không có UI, tự style
import * as Select from '@radix-ui/react-select';

<Select.Root value={value} onValueChange={handleChange}>
  <Select.Trigger className="my-custom-trigger">
    <Select.Value placeholder="Select country" />
  </Select.Trigger>
  <Select.Content className="my-custom-dropdown">
    <Select.Item value="vn" className="my-custom-item">
      <Select.ItemText>Vietnam</Select.ItemText>
    </Select.Item>
    <Select.Item value="us" className="my-custom-item">
      <Select.ItemText>USA</Select.ItemText>
    </Select.Item>
  </Select.Content>
</Select.Root>
```

### Bảng so sánh Component Library Approaches

| Tiêu chí | Styled (MUI, Ant Design) | Headless (Radix, React Aria) | Copy-paste (shadcn/ui) |
|----------|--------------------------|------------------------------|------------------------|
| **Setup speed** | Nhanh nhất | Trung bình | Trung bình |
| **Customization** | Khó (override theme) | Cao (tự style) | Cao nhất (own code) |
| **Bundle size** | Lớn | Nhỏ | Nhỏ nhất (chỉ copy cần) |
| **Accessibility** | Built-in | Built-in | Built-in (từ Radix) |
| **Consistency** | Cao (có sẵn theme) | Tự quản lý | Tự quản lý |
| **Upgrade** | npm update | npm update | Manual (own code) |
| **Ownership** | Thấp (vendor lock-in) | Trung bình | Cao nhất |
| **Phù hợp** | Internal tools, MVP | Design system, custom brand | Custom design, full control |

### Đáp án mẫu

> "Headless UI tách behavior khỏi presentation -- component handle state, keyboard nav, accessibility, nhưng user tự render UI. Phổ biến vì giải quyết pain point lớn nhất của styled libraries: customization. Với MUI, override design thường đau đớn hơn build từ đầu. Với Radix UI headless, tôi có sẵn accessibility và keyboard support, chỉ cần add Tailwind classes. Xu hướng hiện tại là shadcn/ui -- copy-paste approach dựa trên Radix, cho ownership tuyệt đối. Tôi dùng headless khi cần custom design, styled library khi cần ship nhanh internal tools."

---

## Lỗi thường gặp khi trả lời

1. **Chỉ nói về component mà quên design tokens.** Design system bắt đầu từ tokens (colors, spacing, typography), không phải components. Components consume tokens.

2. **Nhầm Storybook với testing tool.** Storybook chủ yếu là development + documentation tool. Visual testing cần thêm Chromatic hoặc Loki. Interaction testing trong Storybook dùng play functions.

3. **Nói Atomic Design phải follow đúng 5 levels.** Trong thực tế, hầu hết team chỉ dùng 3 levels (atoms, molecules, organisms). Templates và pages thường overlap với routing.

4. **Không biết headless UI trend.** Nếu được hỏi "nên chọn component library nào", mà chỉ biết MUI/Ant Design, sẽ bị đánh giá thiếu cập nhật. Radix UI, shadcn/ui, React Aria là các lựa chọn hiện đại.

5. **Thiết kế component API quá phức tạp.** Nếu component có hơn 10 props, đó là code smell. Nên tách thành compound components hoặc dùng composition pattern.
