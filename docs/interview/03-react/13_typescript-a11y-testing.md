---
sidebar_position: 13
title: "13. TypeScript, A11y & Testing"
---

# TypeScript, A11y & Testing

> *"Viết được component là bước một. Viết component đúng kiểu, ai cũng dùng được, và test được — đó mới là senior."*

---

## Câu 1: Làm thế nào để viết component React accessible (a11y)? Vai trò của semantic HTML, ARIA, focus management và `useId` là gì? `[Intermediate]`

### Câu hỏi

> Bạn có một modal dialog và một custom dropdown tự xây. Làm thế nào để đảm bảo chúng accessible cho người dùng screen reader và keyboard-only?

### Giải thích lý thuyết

**Accessibility (a11y)** là khả năng sản phẩm dùng được bởi mọi người — kể cả người dùng screen reader, bàn phím, hay thiết bị hỗ trợ khác. Có 4 trụ cột chính:

| Trụ cột | Mục đích | Ví dụ |
|---------|----------|-------|
| Semantic HTML | Browser và AT hiểu cấu trúc mà không cần ARIA | Dùng `<button>` thay `<div>` |
| ARIA attributes | Bổ sung ngữ nghĩa khi HTML không đủ | `role="dialog"`, `aria-expanded` |
| Focus management | Điều hướng bàn phím nhất quán | Trap focus trong modal, restore focus khi đóng |
| `useId` | Tạo id duy nhất để liên kết label và input | Tránh id trùng khi render nhiều instance |

**Quy tắc vàng:** Dùng semantic HTML trước — ARIA chỉ là cứu cánh khi HTML không đủ. ARIA sai còn tệ hơn không có ARIA.

**Focus management trong modal:**
- Khi mở: chuyển focus vào phần tử đầu tiên có thể focus trong modal
- Khi đóng: trả focus về phần tử đã mở modal
- Trong modal: trap focus (Tab/Shift+Tab chỉ đi trong modal)

### Code minh hoạ

```tsx
import { useId, useEffect, useRef } from "react";

// ─── useId: tránh id trùng khi dùng nhiều lần ───
function FormField({ label, type = "text" }: { label: string; type?: string }) {
  const id = useId(); // React tự sinh id duy nhất: ":r0:", ":r1:", ...

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} />
    </div>
  );
}

// ─── Accessible Modal với focus trap ───
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // Trap focus bên trong modal
  useEffect(() => {
    if (!isOpen) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    // Focus phần tử đầu tiên có thể focus
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable[0]?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    // role="dialog" + aria-modal báo cho screen reader đây là dialog
    // aria-labelledby trỏ đến tiêu đề → screen reader đọc tiêu đề khi focus vào
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <h2 id={titleId}>{title}</h2>
      {children}
      <button onClick={onClose}>Đóng</button>
    </div>
  );
}

// ─── Accessible custom Dropdown ───
function Dropdown({ options, value, onChange, label }: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const buttonId = useId();
  const listId = useId();

  return (
    <div>
      <button
        id={buttonId}
        aria-haspopup="listbox"
        aria-expanded={open}       // screen reader biết trạng thái mở/đóng
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
      >
        {label}: {value}
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={buttonId}
        >
          {options.map((opt) => (
            <li
              key={opt}
              role="option"
              aria-selected={opt === value}
              onClick={() => { onChange(opt); setOpen(false); }}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onChange(opt)}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Đáp án mẫu

> Tôi ưu tiên semantic HTML để tận dụng behavior sẵn có của browser. Khi cần ARIA, tôi dùng `role`, `aria-labelledby`, `aria-expanded` đúng spec. Với modal, tôi trap focus bằng cách lọc focusable elements và xử lý Tab/Shift-Tab, đồng thời đóng khi nhấn Escape. `useId` giúp liên kết `label` và `input` đúng cách kể cả khi render nhiều component cùng loại trên một trang.

---

## Câu 2: Cách type event handler và ref trong React với TypeScript? Lấy đúng kiểu event và element ở đâu? `[Intermediate]`

### Câu hỏi

> Khi dùng TypeScript với React, bạn type `onChange`, `onClick`, và `useRef` như thế nào? Lấy kiểu `MouseEvent` hay `ChangeEvent` từ đâu?

### Giải thích lý thuyết

React cung cấp các kiểu riêng trong namespace `React.*` — **không** dùng kiểu DOM thuần (`MouseEvent`, `Event`) vì chúng là synthetic event wrappers.

**Quy tắc chọn kiểu:**

| Tình huống | Kiểu đúng |
|-----------|-----------|
| `onClick` trên button | `React.MouseEvent<HTMLButtonElement>` |
| `onChange` trên input | `React.ChangeEvent<HTMLInputElement>` |
| `onSubmit` trên form | `React.FormEvent<HTMLFormElement>` |
| `onKeyDown` | `React.KeyboardEvent<HTMLElement>` |
| ref cho input | `useRef<HTMLInputElement>(null)` |
| ref cho div | `useRef<HTMLDivElement>(null)` |

**Nguồn tra kiểu:** Hover vào prop trong VSCode — TypeScript inference sẽ hiện kiểu. Hoặc xem `@types/react` — tất cả event types đều ở đó.

**Type parameter của event** = kiểu element phát sinh event, cho phép truy cập `event.currentTarget` với đúng kiểu.

### Code minh hoạ

```tsx
import { useRef, useState } from "react";

// ─── Event handler với kiểu tường minh ───
function SearchForm() {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null); // ref cho input element

  // React.ChangeEvent<HTMLInputElement> → event.target.value có kiểu string
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  // React.FormEvent<HTMLFormElement> → preventDefault() available
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Search:", query);
    inputRef.current?.focus(); // .current là HTMLInputElement | null
  };

  // React.MouseEvent<HTMLButtonElement> → event.currentTarget là HTMLButtonElement
  const handleClear = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.blur(); // blur button sau khi click
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={handleChange}
        placeholder="Tìm kiếm..."
      />
      <button type="button" onClick={handleClear}>
        Xoá
      </button>
      <button type="submit">Tìm</button>
    </form>
  );
}

// ─── useCallback với event handler để tối ưu re-render ───
import { useCallback } from "react";

function OptimizedInput({ onSearch }: { onSearch: (q: string) => void }) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearch(e.target.value);
    },
    [onSearch]
  );

  return <input onChange={handleChange} />;
}

// ─── Inline handler: TypeScript tự infer kiểu ───
function InlineExample() {
  // TypeScript infer e là React.ChangeEvent<HTMLInputElement> — không cần ghi tường minh
  return <input onChange={(e) => console.log(e.target.value)} />;
}

// ─── useRef để trỏ đến DOM element ───
function AutoFocusInput() {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus(); // optional chaining vì ref.current có thể null ban đầu
  }, []);

  return <input ref={ref} />;
}

// ─── Callback ref: khi cần chạy code ngay lúc element mount ───
function MeasureDiv() {
  const [height, setHeight] = useState(0);

  const measuredRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      setHeight(node.getBoundingClientRect().height);
    }
  }, []);

  return (
    <>
      <div ref={measuredRef}>Nội dung cần đo</div>
      <p>Chiều cao: {height}px</p>
    </>
  );
}
```

### Đáp án mẫu

> Tôi luôn dùng kiểu từ namespace `React.*` — ví dụ `React.ChangeEvent<HTMLInputElement>` cho input onChange, `React.MouseEvent<HTMLButtonElement>` cho button onClick. Type parameter là kiểu element, giúp truy cập `event.currentTarget` với đúng kiểu. Với ref, tôi khai báo `useRef<HTMLInputElement>(null)` và dùng optional chaining `ref.current?.focus()` vì ref có thể null trước khi mount. Trong thực tế tôi thường để TypeScript tự infer với inline handler — chỉ khai báo tường minh khi tách handler ra ngoài.

---

## Câu 3: Test component với React Testing Library nên theo nguyên tắc nào? Thứ tự ưu tiên query, vai trò của `user-event`, vì sao tránh test implementation details? `[Intermediate]`

### Câu hỏi

> Bạn test component React như thế nào? Tại sao không nên dùng `querySelector` hay kiểm tra state trực tiếp? Khi nào dùng `getBy` vs `queryBy` vs `findBy`?

### Giải thích lý thuyết

**Triết lý RTL:** "The more your tests resemble the way your software is used, the more confidence they can give you." — Test từ góc độ người dùng, không từ góc độ implementation.

**Tránh test implementation details** vì:
- Test kiểm tra tên state/variable → khi refactor (rename biến) test bị đỏ dù behavior không đổi
- Test kiểm tra className/style → fragile với UI changes không liên quan
- Test đúng theo behavior → refactor thoải mái, test chỉ đỏ khi behavior thực sự thay đổi

**Thứ tự ưu tiên query (từ cao đến thấp):**

| Ưu tiên | Query | Dùng khi |
|---------|-------|----------|
| 1 | `getByRole` | Element có role ngầm định hoặc ARIA role |
| 2 | `getByLabelText` | Input được liên kết với label |
| 3 | `getByPlaceholderText` | Input có placeholder |
| 4 | `getByText` | Element chứa text |
| 5 | `getByDisplayValue` | Input/select có giá trị hiện tại |
| 6 | `getByAltText` | Image với alt text |
| 7 | `getByTitle` | Element với title attribute |
| 8 | `getByTestId` | Fallback cuối cùng — thêm `data-testid` |

**Phân biệt variant:**
- `getBy*` — phải tồn tại, throw nếu không có → dùng cho element luôn hiển thị
- `queryBy*` — trả `null` nếu không có → dùng để assert element **không** tồn tại
- `findBy*` — async, chờ element xuất hiện → dùng cho async data/loading

**`user-event` vs `fireEvent`:** `user-event` mô phỏng toàn bộ chuỗi event thực tế (mousedown → mouseup → click → focus), còn `fireEvent` chỉ bắn một event đơn lẻ. Luôn ưu tiên `user-event`.

### Code minh hoạ

```tsx
// component cần test
// LoginForm.tsx
import { useState } from "react";

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit(email, password);
    } catch {
      setError("Email hoặc mật khẩu không đúng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label>
        Mật khẩu
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
    </form>
  );
}
```

```tsx
// LoginForm.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./LoginForm";

describe("LoginForm", () => {
  // ─── Test happy path ───
  it("gọi onSubmit với email và password khi submit form", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn().mockResolvedValue(undefined);

    render(<LoginForm onSubmit={mockOnSubmit} />);

    // getByRole: ưu tiên cao nhất — query theo ARIA role
    // getByLabelText: liên kết với label "Email"
    await user.type(screen.getByLabelText("Email"), "user@example.com");
    await user.type(screen.getByLabelText("Mật khẩu"), "secret123");

    // getByRole("button", { name }) — query button theo accessible name
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    expect(mockOnSubmit).toHaveBeenCalledWith("user@example.com", "secret123");
  });

  // ─── Test loading state ───
  it("hiện 'Đang đăng nhập...' trong khi submit", async () => {
    const user = userEvent.setup();
    // Mock promise không resolve ngay
    const mockOnSubmit = jest.fn(
      () => new Promise<void>((resolve) => setTimeout(resolve, 1000))
    );

    render(<LoginForm onSubmit={mockOnSubmit} />);
    await user.type(screen.getByLabelText("Email"), "a@b.com");
    await user.type(screen.getByLabelText("Mật khẩu"), "pass");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    // Button đổi text trong khi loading
    expect(screen.getByRole("button", { name: "Đang đăng nhập..." })).toBeDisabled();
  });

  // ─── Test error state ───
  it("hiện thông báo lỗi khi onSubmit throw", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn().mockRejectedValue(new Error("Unauthorized"));

    render(<LoginForm onSubmit={mockOnSubmit} />);
    await user.type(screen.getByLabelText("Email"), "bad@test.com");
    await user.type(screen.getByLabelText("Mật khẩu"), "wrong");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    // findBy* — chờ async (error xuất hiện sau khi promise reject)
    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("Email hoặc mật khẩu không đúng");
  });

  // ─── Test element không tồn tại ───
  it("không hiện lỗi lúc mới render", () => {
    render(<LoginForm onSubmit={jest.fn()} />);

    // queryBy* trả null thay vì throw → dùng để assert KHÔNG tồn tại
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
```

### Đáp án mẫu

> Tôi theo triết lý RTL: test theo cách người dùng dùng, không test implementation. Thứ tự query tôi ưu tiên là `getByRole` → `getByLabelText` → `getByText` → `getByTestId` (chỉ khi không còn cách nào). Tôi dùng `user-event` thay `fireEvent` vì nó mô phỏng toàn bộ chuỗi event thực tế. Về variant: `getBy*` khi element phải tồn tại, `queryBy*` khi cần assert không tồn tại, `findBy*` khi phải chờ async. Tránh assert vào class names, state variables, hay DOM structure nội bộ — những thứ đó là implementation detail, refactor là test đỏ dù behavior không đổi.

---

## Câu 4: Cách type props của component với TypeScript dùng generics và discriminated-union? Khi nào cần mỗi cái? `[Advanced]`

### Câu hỏi

> Bạn cần xây một component `List` có thể nhận bất kỳ loại item nào, và một component `Button` có hai variant là link và button với props khác nhau. Bạn type chúng như thế nào?

### Giải thích lý thuyết

**Generics** và **discriminated union** giải quyết hai bài toán khác nhau:

| Kỹ thuật | Bài toán | Ví dụ |
|----------|----------|-------|
| Generics | Component làm việc với nhiều kiểu data, nhưng type-safe | `List<T>` nhận `T[]` và render mỗi item |
| Discriminated union | Component có nhiều variant với props tập hợp khác nhau | `Button` là button thường hoặc link |

**Generics** phù hợp khi:
- Component là "container" / "template" không quan tâm kiểu cụ thể
- Cần TypeScript suy ra kiểu từ prop được truyền vào
- Pattern: `Table<User>`, `Select<Option>`, `Pagination<Item>`

**Discriminated union** phù hợp khi:
- Component có các "chế độ" loại trừ nhau với props riêng
- Cần TypeScript bắt lỗi khi truyền prop sai chế độ
- Pattern: `Button` là `"button" | "link"`, `Input` là `"text" | "select" | "checkbox"`

**Kỹ thuật nâng cao:** Kết hợp cả hai — generic discriminated union component.

### Code minh hoạ

```tsx
// ─── Generic Component ───
// List nhận bất kỳ kiểu item nào, type-safe từ đầu đến cuối

interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
  emptyState?: React.ReactNode;
}

// Dùng function declaration (không phải arrow function) để TypeScript
// nhận dạng đúng generic trong .tsx file
function List<T>({ items, renderItem, keyExtractor, emptyState }: ListProps<T>) {
  if (items.length === 0) {
    return <>{emptyState ?? <p>Không có dữ liệu</p>}</>;
  }

  return (
    <ul>
      {items.map((item, index) => (
        <li key={keyExtractor(item)}>{renderItem(item, index)}</li>
      ))}
    </ul>
  );
}

// TypeScript infer T = User từ prop items
interface User { id: number; name: string; email: string }

function UserList({ users }: { users: User[] }) {
  return (
    <List
      items={users}
      keyExtractor={(user) => user.id}     // user được infer là User
      renderItem={(user) => (              // user được infer là User
        <span>{user.name} — {user.email}</span>
      )}
    />
  );
}

// ─── Discriminated Union Component ───
// Button có 2 variant: button thường và link

// Discriminant: prop "as" (hoặc "variant", "type"...)
type ButtonBaseProps = {
  children: React.ReactNode;
  className?: string;
};

type ButtonAsButton = ButtonBaseProps & {
  as?: "button";                           // discriminant
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  href?: never;                            // never: cấm truyền href khi as="button"
};

type ButtonAsLink = ButtonBaseProps & {
  as: "link";                              // discriminant
  href: string;                            // bắt buộc khi as="link"
  target?: "_blank" | "_self";
  onClick?: never;                         // never: cấm truyền onClick khi as="link"
  disabled?: never;
};

type ButtonProps = ButtonAsButton | ButtonAsLink;

function Button(props: ButtonProps) {
  if (props.as === "link") {
    // TypeScript biết đây là ButtonAsLink → href có sẵn, onClick không có
    return (
      <a
        href={props.href}
        target={props.target}
        className={props.className}
      >
        {props.children}
      </a>
    );
  }

  // TypeScript biết đây là ButtonAsButton → onClick, disabled có sẵn
  return (
    <button
      type={props.type ?? "button"}
      onClick={props.onClick}
      disabled={props.disabled}
      className={props.className}
    >
      {props.children}
    </button>
  );
}

// ✅ TypeScript chấp nhận
const ok1 = <Button onClick={() => {}}>Bấm đây</Button>;
const ok2 = <Button as="link" href="/about">Về chúng tôi</Button>;

// ❌ TypeScript báo lỗi — href không hợp lệ khi as="button"
// const bad = <Button href="/about">Bấm đây</Button>;

// ─── Generic + Discriminated Union kết hợp ───
// Select component hỗ trợ single và multi select

type SelectSingle<T> = {
  mode: "single";
  value: T | null;
  onChange: (value: T) => void;
};

type SelectMulti<T> = {
  mode: "multi";
  value: T[];
  onChange: (values: T[]) => void;
};

type SelectProps<T> = {
  options: T[];
  getLabel: (option: T) => string;
  getValue: (option: T) => string | number;
} & (SelectSingle<T> | SelectMulti<T>);

function Select<T>(props: SelectProps<T>) {
  const { options, getLabel, getValue, mode } = props;

  const isSelected = (option: T): boolean => {
    if (mode === "single") {
      return props.value !== null && getValue(props.value) === getValue(option);
    }
    return props.value.some((v) => getValue(v) === getValue(option));
  };

  const handleClick = (option: T) => {
    if (mode === "single") {
      props.onChange(option);
    } else {
      const current = props.value;
      const idx = current.findIndex((v) => getValue(v) === getValue(option));
      if (idx >= 0) {
        props.onChange(current.filter((_, i) => i !== idx));
      } else {
        props.onChange([...current, option]);
      }
    }
  };

  return (
    <ul role="listbox" aria-multiselectable={mode === "multi"}>
      {options.map((option) => (
        <li
          key={getValue(option)}
          role="option"
          aria-selected={isSelected(option)}
          onClick={() => handleClick(option)}
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleClick(option)}
        >
          {getLabel(option)}
        </li>
      ))}
    </ul>
  );
}

// Dùng — TypeScript infer T = User
function UserSelect({ users }: { users: User[] }) {
  const [selected, setSelected] = useState<User[]>([]);

  return (
    <Select
      mode="multi"
      options={users}
      value={selected}
      onChange={setSelected}               // onChange infer là (values: User[]) => void
      getLabel={(u) => u.name}
      getValue={(u) => u.id}
    />
  );
}
```

### Đáp án mẫu

> Tôi dùng **generics** khi component là container/template cần type-safe với nhiều kiểu data — ví dụ `List<T>`, `Table<T>`, `Select<T>`. TypeScript sẽ infer `T` từ prop được truyền vào, không cần khai báo tường minh. Tôi dùng **discriminated union** khi component có nhiều variant loại trừ nhau, mỗi variant có set props riêng — ví dụ `Button` là link hoặc button thường. Dùng `never` để cấm prop của variant này xuất hiện ở variant kia — TypeScript sẽ báo lỗi compile-time. Hai kỹ thuật có thể kết hợp: `Select<T>` generic với `mode: "single" | "multi"` discriminated union.

---
