---
sidebar_position: 1
title: "Frontend Basics cho Backend Dev"
---

# Frontend Basics cho Backend Dev

---

## Mục lục

- [Tại sao cần biết frontend?](#tại-sao-cần-biết-frontend)
- [HTML](#html)
- [CSS](#css)
- [JavaScript](#javascript)
- [Tài liệu chi tiết](#tài-liệu-chi-tiết)

---

## Tại sao cần biết frontend?

Backend không tồn tại độc lập — luôn serve cho **client** nào đó (web,
mobile, third-party). Hiểu frontend giúp:

- Thiết kế **API đúng** với cách client dùng.
- Debug được khi UI hiển thị sai.
- Phối hợp tốt với frontend dev.
- Biết khi nào nên handle ở server vs client.

Không cần master, chỉ cần đọc/sửa được.

---

## HTML

Cấu trúc trang web — semantic tags:

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>My App</title>
</head>
<body>
  <header>
    <nav>...</nav>
  </header>
  <main>
    <article>
      <h1>Title</h1>
      <p>Content</p>
    </article>
  </main>
  <footer>...</footer>
</body>
</html>
```

Form — backend tương tác qua đây:

```html
<form action="/api/users" method="POST">
  <label for="name">Name</label>
  <input type="text" id="name" name="name" required />
  <button type="submit">Save</button>
</form>
```

→ Server nhận POST với body `name=...`.

---

## CSS

Style HTML. Cơ bản:

```css
.button {
  padding: 8px 16px;
  background: blue;
  color: white;
}

.button:hover {
  opacity: 0.8;
}
```

Backend dev không viết CSS phức tạp — chỉ cần đọc được.

---

## JavaScript

Tương tác client. Cơ bản:

```js
document.querySelector("button").addEventListener("click", async () => {
  const res = await fetch("/api/users");
  const data = await res.json();
  console.log(data);
});
```

→ Client gửi request đến backend, nhận response.

:::tip[Mẹo]

**Đủ kiến thức frontend cho backend dev:**

- HTML semantic tags + form.
- CSS basic + flexbox.
- JavaScript: variables, function, fetch, async/await.
- Hiểu cách client gọi API.
- Biết DevTools Network tab debug request.

Không cần học React/Vue trừ khi muốn full-stack.

:::

---

## Tài liệu chi tiết

Cần học sâu hơn? Tham khảo:

- [JavaScript roadmap](/docs/javascript/01-gioi-thieu/1_javascript-la-gi) — JS toàn diện.
- [TypeScript roadmap](/docs/typescript/01-gioi-thieu/1_typescript-la-gi) — TS cho project lớn.
- [React roadmap](/docs/react/01-chuan-bi/1_chuan-bi) — UI library.
- [Next.js roadmap](/docs/nextjs/01-introduction/1_why-nextjs) — full-stack React.

Backend dev không cần học hết — đọc lướt để hiểu khái niệm là đủ.
