---
sidebar_position: 4
title: "4. Rules of Hooks"
---

# Rules of Hooks

**Rules of Hooks** (các quy tắc dùng hook) là những nguyên tắc bắt buộc khi sử dụng **hook** (hàm đặc biệt cho phép dùng state và tính năng React trong functional component) để React hoạt động đúng. Hai quy tắc chính là: chỉ gọi hook ở **top level** (cấp ngoài cùng, không đặt trong vòng lặp, điều kiện hay hàm lồng nhau) và chỉ gọi hook từ component hoặc custom hook. Tuân thủ các quy tắc này giúp React giữ đúng thứ tự các hook qua mỗi lần render và tránh lỗi khó tìm.

---

## Mục lục

- [Tổng quan 2 quy tắc](#tổng-quan-2-quy-tắc)
- [Rule 1: Chỉ gọi ở top level](#rule-1-chỉ-gọi-ở-top-level)
- [Rule 2: Chỉ gọi từ component/hook](#rule-2-chỉ-gọi-từ-componenthook)
- [Tại sao có quy tắc này?](#tại-sao-có-quy-tắc-này)
- [ESLint plugin](#eslint-plugin)

---

## Tổng quan 2 quy tắc

React Hooks có **2 quy tắc bắt buộc**:

1. **Chỉ gọi hook ở top level** — không trong `if`, `for`, `while`,
   nested function, sau `return`.
2. **Chỉ gọi hook từ** function component hoặc custom hook — không từ
   function thường, event handler, class.

Vi phạm → bug khó debug, code có thể không lỗi ngay nhưng sai logic.

---

## Rule 1: Chỉ gọi ở top level

**Sai**:

```jsx
function Component({ user }) {
  if (user) {
    const [data, setData] = useState(null); // SAI — trong if
  }

  for (let i = 0; i < 10; i++) {
    const ref = useRef(null); // SAI — trong loop
  }

  useEffect(() => {
    const [x, setX] = useState(0); // SAI — trong nested function
  }, []);
}
```

**Đúng**:

```jsx
function Component({ user }) {
  // Mọi hook ở top, không condition
  const [data, setData] = useState(null);

  useEffect(() => {
    // Logic conditional Ở TRONG hook, không bao quanh hook
    if (user) {
      fetchData(user.id);
    }
  }, [user]);
}
```

:::info[Phân tích]

**Tại sao quy tắc này?**

React **track hook bằng thứ tự gọi** trong mỗi render — không có ID hay
key cho hook. React Fiber dùng linked list:

```jsx
function Component() {
  const a = useState(1);  // hook 1
  const b = useState(2);  // hook 2
  const c = useEffect();  // hook 3
}
```

Mỗi render, React khớp hook theo **index**: lần 1 là useState, lần 2
là useState, lần 3 là useEffect.

Nếu hook bị skip:

```jsx
function Component({ cond }) {
  if (cond) {
    const a = useState(1); // hook 1 (đôi khi)
  }
  const b = useState(2);   // hook 2 (luôn)
}
```

- Khi `cond = true`: hook order = [useState, useState] ✓
- Khi `cond = false`: hook order = [useState] — React tưởng `b` là `a` cũ!

→ State bị nhầm lẫn, bug random.

Giải pháp: **luôn gọi cùng số lượng hook, theo cùng thứ tự, mỗi render**.

:::

---

## Rule 2: Chỉ gọi từ component/hook

**Sai**:

```jsx
// Function thường — không phải component
function fetchData() {
  const [data, setData] = useState(null); // SAI
}

// Class component
class Old extends Component {
  render() {
    useState(0); // SAI — class không gọi hook được
  }
}

// Event handler
<button onClick={() => {
  useState(0); // SAI — không trong render
}}>
```

**Đúng**:

```jsx
// Function component (PascalCase)
function MyComponent() {
  useState(0); // OK
}

// Custom hook (bắt đầu use*)
function useMyHook() {
  useState(0); // OK
}
```

ESLint dùng **chữ cái đầu** để phân biệt:

- PascalCase `MyComponent` → component.
- camelCase `useX` → custom hook.
- Khác → function thường, không cho gọi hook.

:::warning[Cần lưu ý]

**Pattern "conditional hook" sai trong khi tưởng đúng**:

```jsx
function Page({ id }) {
  if (!id) return null; // early return

  const [data, setData] = useState(null); // SAI — sau early return
  // ...
}
```

Hooks ở dưới early return = hook bị skip khi `!id` → vi phạm rule 1.

Fix — đặt hook lên trước early return:

```jsx
function Page({ id }) {
  const [data, setData] = useState(null);

  if (!id) return null; // OK — đã gọi hook xong

  return <div>{data?.title}</div>;
}
```

Hoặc tách component:

```jsx
function Page({ id }) {
  if (!id) return null;
  return <PageContent id={id} />;
}

function PageContent({ id }) {
  const [data, setData] = useState(null);
  // ...
}
```

:::

---

## Tại sao có quy tắc này?

Trade-off của design hooks dựa vào **call order**:

**Ưu điểm:**

- Cú pháp gọn — không cần API verbose như `useState("counter", 0)`.
- Composition tự nhiên — gọi hook giống gọi function.
- Tooling đơn giản — không cần map ID.

**Nhược điểm:**

- Phải tuân quy tắc nghiêm ngặt.
- Không cho conditional hook → đôi khi gây dài dòng.

React team đã cân nhắc API "named hook" (như `useState("count", 0)`)
nhưng thấy phức tạp hơn, không đáng.

:::info[Phân tích]

**React 19 + use hook — "ngoại lệ" có điều kiện:**

```jsx
import { use } from "react";

function Item({ promise, cond }) {
  if (cond) {
    const data = use(promise); // OK trong if!
    return <div>{data.title}</div>;
  }
  return null;
}
```

`use` **được phép** trong condition vì:

- Nó không có state riêng — chỉ đọc value (Promise/Context).
- React track theo Suspense boundary, không phải call order.

Các hook khác (`useState`, `useEffect`, `useRef`...) **vẫn phải tuân
Rules of Hooks**. `use` là exception duy nhất.

:::

---

## ESLint plugin

Cài plugin chính thức:

```bash
npm install --save-dev eslint-plugin-react-hooks
```

Bật rules:

```js
// eslint.config.js
import reactHooks from "eslint-plugin-react-hooks";

export default [
  {
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];
```

2 rule chính:

- **`rules-of-hooks`** — bắt vi phạm Rule 1 + 2.
- **`exhaustive-deps`** — bắt thiếu/thừa dep trong `useEffect`,
  `useCallback`, `useMemo`.

:::tip[Mẹo]

**Bật rule này trong CI** — fail PR nếu vi phạm:

```yaml
# .github/workflows/ci.yml
- name: Lint
  run: npm run lint -- --max-warnings 0
```

Sửa warning ngay khi viết, không tích lũy. Rule này cứu rất nhiều bug
production — không bỏ qua.

:::

:::warning[Cần lưu ý]

**Đừng dùng `// eslint-disable-line react-hooks/...`** trừ khi:

- Có lý do cực kỳ rõ.
- Comment giải thích tại sao.
- Đã thử mọi cách khác.

```jsx
// Hợp lý — track event chỉ 1 lần khi mount
useEffect(() => {
  trackEvent("page_view");
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

// Không hợp lý — lười fix
useEffect(() => {
  // dùng `data` nhưng không khai báo dep
  console.log(data);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

Đa số trường hợp **"không muốn re-run effect khi dep đổi"** thực ra là
**design effect sai**. Nên refactor — không silence rule.

:::
