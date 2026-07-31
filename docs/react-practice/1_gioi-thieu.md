---
sidebar_position: 1
title: "1. Giới thiệu & Chuẩn bị"
---

# Giới thiệu & Chuẩn bị

Đọc lý thuyết React mãi cũng không giỏi — bạn phải **tự tay làm project**. Topic này dẫn bạn qua 4 project nhỏ tăng dần độ khó, mỗi project là một bài hướng dẫn từng bước: viết tới đâu giải thích kiến thức tới đó, kèm lỗi thường gặp. Bài này chuẩn bị môi trường và cách học hiệu quả trước khi bắt tay vào project đầu tiên.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Học React phải tự tay làm project** — đọc lý thuyết suông không đủ, phải gõ code và tự sửa lỗi mới giỏi.
- ⭐ **Tạo project bằng Vite** — `npm create vite@latest` → `npm install` → `npm run dev`, thay cho `create-react-app` đã lỗi thời.
- **Cài đủ 2 thứ** — Node.js (>= 20) và VS Code là đủ để bắt đầu.
- **File khởi động** — `src/main.jsx` gắn React vào `<div id="root">`, `src/App.jsx` là component gốc.
- **JSX là JavaScript** — chỉ `return` một thẻ gốc, dùng `className` thay `class`, và `{ }` để chèn biểu thức JS.
- **Học tuần tự 4 project** — gõ tay thay vì copy, luôn mở Console và làm phần thử thách mở rộng.

:::

---

## Mục lục

- [Vì sao học qua project?](#vì-sao-học-qua-project)
- [Lộ trình 4 project](#lộ-trình-4-project)
- [Chuẩn bị môi trường](#chuẩn-bị-môi-trường)
- [Tạo project React đầu tiên với Vite](#tạo-project-react-đầu-tiên-với-vite)
- [Hiểu cấu trúc thư mục](#hiểu-cấu-trúc-thư-mục)
- [JSX — thứ trông giống HTML nhưng là JavaScript](#jsx--thứ-trông-giống-html-nhưng-là-javascript)
- [Cách học hiệu quả với topic này](#cách-học-hiệu-quả-với-topic-này)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao học qua project?

**Vấn đề:** Khi học từng khái niệm rời rạc (component, props, state, hook…), bạn biết từng "viên gạch" nhưng không biết **ghép chúng lại** thành một ứng dụng chạy được. Đây là khoảng cách lớn nhất giữa "đọc hiểu" và "tự viết được".

**Giải pháp:** Làm project buộc bạn phải:

- **Kết hợp nhiều kiến thức** cùng lúc (component + props + state + sự kiện) để giải một bài toán thật.
- **Gặp lỗi và tự sửa** — kỹ năng quan trọng nhất của lập trình viên, không sách nào dạy thay được.
- **Nhìn thấy kết quả** hiển thị ngay trên trình duyệt → tạo động lực học tiếp.

Mỗi project ở đây đều **nhỏ, gọn trong một vài file**, để bạn tập trung vào tư duy React thay vì rối với công cụ.

---

## Lộ trình 4 project

Các project được xếp theo độ khó tăng dần — **làm tuần tự** sẽ học tốt nhất vì project sau dùng lại kiến thức project trước:

| # | Project | Kiến thức cốt lõi học được |
|---|---------|----------------------------|
| 2 | **Counter & Profile Card** | Component, `props`, `useState`, xử lý sự kiện, render có điều kiện |
| 3 | **To-Do List** | Render danh sách + `key`, cập nhật state bất biến, form controlled, `useEffect` + localStorage |
| 4 | **App Thời tiết** | Gọi API với `fetch`, trạng thái loading/error, custom hook |
| 5 | **Tìm kiếm phim** | React Router (nhiều trang), Context (state toàn cục), `useMemo`, debounce |

:::tip Lời khuyên
Đừng copy-paste cả khối code. Hãy **gõ lại từng dòng** và đọc phần giải thích bên cạnh. Gõ tay giúp não ghi nhớ cú pháp gấp nhiều lần so với copy.
:::

---

## Chuẩn bị môi trường

Bạn cần 2 thứ:

**1. Node.js** — môi trường chạy JavaScript ngoài trình duyệt, kèm theo `npm` để cài thư viện. Kiểm tra đã cài chưa:

```bash
node -v
npm -v
```

Nếu hiện số phiên bản (khuyến nghị Node **>= 20**) là đã có. Nếu báo "command not found", tải bản LTS tại [nodejs.org](https://nodejs.org/).

**2. Trình soạn thảo code** — khuyến nghị **VS Code** kèm 2 extension:

- **ES7+ React/Redux snippets** — gõ tắt nhanh code React.
- **Prettier** — tự động format code cho gọn gàng.

:::info Vì sao dùng Vite chứ không phải Create React App?
Trước đây mọi người dùng `create-react-app` (CRA) để tạo project React. Nhưng CRA đã **ngừng được khuyến nghị** vì khởi động chậm. **Vite** là công cụ mới, khởi động gần như tức thì và là lựa chọn tiêu chuẩn hiện nay.
:::

---

## Tạo project React đầu tiên với Vite

Mở terminal tại thư mục bạn muốn lưu code, chạy:

```bash
npm create vite@latest my-first-app -- --template react
```

Giải thích lệnh:

- **`npm create vite@latest`** — gọi công cụ tạo project của Vite (bản mới nhất).
- **`my-first-app`** — tên thư mục project sẽ được tạo.
- **`-- --template react`** — chọn khuôn mẫu React (dùng JavaScript). Nếu muốn TypeScript thì đổi thành `react-ts`.

Sau đó cài thư viện và khởi động:

```bash
cd my-first-app
npm install      # tải các thư viện cần thiết (tạo thư mục node_modules)
npm run dev      # khởi động server phát triển
```

Terminal sẽ hiện một địa chỉ kiểu `http://localhost:5173/`. Mở nó trên trình duyệt — bạn sẽ thấy trang React mặc định. **Server có hot reload**: cứ sửa code và lưu, trình duyệt tự cập nhật ngay không cần tải lại.

:::warning Lỗi hay gặp ngay từ đầu
- `command not found: npm` → chưa cài Node.js.
- Cổng `5173` bị chiếm → Vite tự đổi sang cổng khác (ví dụ `5174`), đọc kỹ địa chỉ trên terminal.
- Quên chạy `npm install` trước `npm run dev` → báo lỗi thiếu module.
:::

---

## Hiểu cấu trúc thư mục

Sau khi tạo, project có dạng (lược bỏ file phụ):

```
my-first-app/
├── index.html          ← trang HTML gốc, có <div id="root">
├── package.json        ← khai báo thư viện & lệnh chạy (npm run dev...)
├── vite.config.js      ← cấu hình Vite
└── src/
    ├── main.jsx        ← điểm bắt đầu: "gắn" React vào <div id="root">
    ├── App.jsx         ← component gốc của ứng dụng
    └── App.css         ← style cho App
```

Hai file quan trọng nhất:

**`src/main.jsx`** — điểm khởi động. Đây là nơi React tìm thẻ `<div id="root">` trong `index.html` và "vẽ" component `App` vào đó:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**`src/App.jsx`** — component gốc, nơi bạn bắt đầu viết giao diện. Hãy xoá hết nội dung mẫu và thay bằng:

```jsx
function App() {
  return <h1>Xin chào React!</h1>
}

export default App
```

Lưu lại, nhìn trình duyệt — dòng chữ đã đổi ngay. Đó là toàn bộ "vòng đời" cơ bản: bạn sửa component → React vẽ lại giao diện.

---

## JSX — thứ trông giống HTML nhưng là JavaScript

Đoạn `return <h1>...</h1>` ở trên gọi là **JSX**. Nó cho phép bạn viết giao diện trông giống HTML ngay trong file JavaScript. Có vài khác biệt quan trọng so với HTML cần nhớ:

```jsx
function Demo() {
  const ten = "Thuận"          // biến JavaScript bình thường

  return (
    <div className="box">       {/* dùng className, KHÔNG phải class */}
      <h2>Chào {ten}</h2>        {/* {ten} chèn giá trị biến vào giao diện */}
      <p>1 + 2 = {1 + 2}</p>     {/* trong {} viết được mọi biểu thức JS */}
    </div>
  )
}
```

Ba quy tắc JSX phải thuộc lòng:

1. **Một component chỉ được `return` một thẻ gốc duy nhất.** Nếu cần nhiều thẻ ngang hàng, bọc chúng trong `<div>` hoặc Fragment rỗng `<>...</>`.
2. **Dùng `className` thay cho `class`**, `htmlFor` thay cho `for` (vì `class` và `for` là từ khoá của JavaScript).
3. **Dấu `{ }` là cửa sổ về JavaScript** — mọi thứ trong ngoặc nhọn được tính như biểu thức JS rồi chèn vào giao diện.

:::warning Lỗi JSX kinh điển
`Adjacent JSX elements must be wrapped in an enclosing tag` — bạn return 2 thẻ ngang hàng mà quên bọc lại. Sửa bằng cách bọc trong `<>...</>`.
:::

---

## Cách học hiệu quả với topic này

1. **Đọc hết phần "Phân tích bài toán"** trước khi viết — hiểu mình sắp làm gì.
2. **Gõ code theo từng bước**, lưu file và xem trình duyệt sau mỗi bước để thấy nó hoạt động dần.
3. **Mở Console của trình duyệt** (phím F12 → tab Console) để đọc lỗi và `console.log` — đây là công cụ debug số một.
4. **Cố ý làm sai** một chút (đổi `className` thành `class`, bỏ `key`) để xem cảnh báo trông thế nào — học cách đọc lỗi.
5. **Làm phần "Thử thách mở rộng"** ở cuối mỗi bài — đây là lúc bạn thực sự tự lập trình.

---

## Tóm tắt

- Học React giỏi cần **tự tay làm project**, không chỉ đọc lý thuyết.
- Cài **Node.js (>= 20)** + **VS Code** là đủ để bắt đầu.
- Tạo project bằng **Vite**: `npm create vite@latest` → `npm install` → `npm run dev`.
- File khởi động là `src/main.jsx`, component gốc là `src/App.jsx`.
- **JSX** trông giống HTML nhưng là JavaScript: một thẻ gốc, dùng `className`, và `{ }` để chèn biểu thức JS.
- Làm **tuần tự 4 project** từ dễ đến khó, **gõ tay** thay vì copy, luôn mở Console và làm phần thử thách.

Sẵn sàng chưa? Bắt đầu với [Counter & Profile Card](./2_counter-profile.md) ngay nào!
