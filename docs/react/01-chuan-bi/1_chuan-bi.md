---
sidebar_position: 1
title: "1. Chuẩn bị trước khi học React"
---

# Chuẩn bị trước khi học React

React là một **thư viện JavaScript** (bộ công cụ viết sẵn để dựng giao diện) giúp xây dựng giao diện web theo từng khối nhỏ tái sử dụng. Trước khi học React, bạn cần một nền tảng vững về JavaScript, HTML và CSS, vì React được xây dựng hoàn toàn dựa trên những kiến thức này. Bài này liệt kê những gì bạn nên nắm chắc và bộ công cụ (**tooling**) nên làm quen trước khi bắt đầu.

---

## Mục lục

- [Yêu cầu nền tảng](#yêu-cầu-nền-tảng)
- [JavaScript checklist](#javascript-checklist)
- [TypeScript checklist](#typescript-checklist)
- [HTML và CSS checklist](#html-và-css-checklist)
- [Tooling cần biết](#tooling-cần-biết)

---

## Yêu cầu nền tảng

React **không phải** là điểm bắt đầu của hành trình frontend. Trước khi
học React, bạn cần nắm chắc các kiến thức nền:

| Kiến thức | Tại sao? |
|-----------|----------|
| **JavaScript** | React là JS — không qua được JS thì học React rất khổ |
| **HTML / CSS** | JSX là syntax HTML-like, styling vẫn dùng CSS |
| **ES6+** | Arrow, destructuring, spread, module — dùng mọi lúc |
| **Promise / async** | Mọi data fetching đều async |
| **npm** | Cài thư viện, chạy script |

---

## JavaScript checklist

Tham khảo [roadmap JavaScript](/docs/javascript/01-gioi-thieu/1_javascript-la-gi):

- [ ] Variables: `let`, `const`, scope, hoisting
- [ ] Data types & immutability
- [ ] Functions: arrow, default params, rest/spread, closures
- [ ] Array methods: `map`, `filter`, `reduce`, `find`, `forEach`
- [ ] Destructuring (array + object)
- [ ] Spread / Rest operator
- [ ] Template literals
- [ ] ES Modules (`import` / `export`)
- [ ] Promise, `async`/`await`, `fetch`
- [ ] DOM events, event bubbling
- [ ] `this` keyword (chỉ cần để đọc code cũ)

:::tip[Mẹo]

Không cần **thuộc lòng**, nhưng phải đủ **nhận biết** khi gặp trong code.
React code điển hình:

```jsx
function UserList({ users, onSelect }) {
  return (
    <ul>
      {users.map(user => (
        <li key={user.id} onClick={() => onSelect(user.id)}>
          {user.name}
        </li>
      ))}
    </ul>
  );
}
```

Trong 5 dòng có: destructuring, arrow, callback, `map`, template-like
(`{user.name}`), spread (key prop), event handler. Nếu chưa quen các
khái niệm này → quay lại JS trước.

:::

---

## TypeScript checklist

TypeScript **không bắt buộc** nhưng **rất khuyến nghị** với React. Tham
khảo [roadmap TypeScript](/docs/typescript/01-gioi-thieu/1_typescript-la-gi).

Tối thiểu cần biết:

- [ ] Primitive types, union, intersection
- [ ] Interface vs type alias
- [ ] Generic cơ bản (`<T>`)
- [ ] Utility types: `Partial`, `Pick`, `Omit`, `Record`
- [ ] Type assertion (`as`, `satisfies`)
- [ ] Type cho props component, event handler

---

## HTML và CSS checklist

- [ ] Semantic HTML (header, nav, main, section, article, footer)
- [ ] Form elements và `<label>` đúng cách
- [ ] Box model, Flexbox, Grid
- [ ] CSS selectors, specificity
- [ ] Responsive: media query, mobile-first
- [ ] CSS Variables (`--var`, `var()`)
- [ ] Pseudo-class, pseudo-element

:::info[Phân tích]

**JSX khác HTML ở vài điểm**:

- `class` → `className` (vì `class` là từ khoá JS).
- `for` → `htmlFor`.
- Inline style là object: `style={{ color: "red" }}`.
- Self-closing bắt buộc cho thẻ không có content: `<img />`, `<br />`.
- Attribute camelCase: `onclick` → `onClick`, `tabindex` → `tabIndex`.

Khi chuyển từ HTML thuần sang JSX, nhớ những điểm này. Tools (Tailwind
IntelliSense, Prettier) sẽ tự động nhắc.

:::

---

## Tooling cần biết

- [ ] **npm / pnpm / yarn / bun** — cài package, chạy script.
- [ ] **Git** — version control cơ bản.
- [ ] **VSCode** — extension cần thiết:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense (nếu dùng Tailwind)
  - Error Lens
  - GitLens
- [ ] **Browser DevTools** — Elements, Console, Network, React DevTools extension.
- [ ] **Terminal** — chạy command, navigation cơ bản.

:::warning[Cần lưu ý]

**Đừng dồn học cùng lúc React + TypeScript + Tailwind + Redux + Next.js**
— quá tải sẽ làm bạn nản. Lộ trình hợp lý:

1. **JS thuần** → vững nền.
2. **React cơ bản** (Vite + JSX + props/state + hooks) → 2-3 tuần.
3. **TypeScript** đan vào React → 1-2 tuần.
4. **Routing + data fetching** → 1 tuần.
5. **Styling solution** (Tailwind) → vài ngày.
6. **State management** chỉ khi thực sự cần → vài ngày.
7. **Framework (Next.js)** khi đã quen React → 2-3 tuần.

Mỗi bước **build dự án thật** — không phải xem video. Học bằng cách
gặp bug và sửa, không phải bằng cách đọc.

:::
