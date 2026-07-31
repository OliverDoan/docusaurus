---
sidebar_position: 8
title: "8. Kết nối Frontend với API"
---

# Project 5 (tiếp): Kết nối Frontend với API

API đã chạy và test được bằng curl. Bước cuối cùng — và là mục tiêu của cả chuỗi bài — là cho một **ứng dụng Frontend** (web React, hoặc trang HTML thuần) **gọi tới API** để hiển thị và thao tác dữ liệu sinh viên. Bài này giải thích vì sao trình duyệt chặn gọi API khác cổng (**CORS**), cách bật CORS ở backend, và viết Frontend gọi đủ bộ CRUD bằng `fetch`. Hoàn thành bài này là bạn đã đi trọn vòng **Frontend ↔ Backend**.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Frontend và Backend là hai chương trình riêng** — chạy ở hai cổng khác nhau, nói chuyện qua HTTP + JSON.
- ⭐ **CORS phải bật cho phép ở phía backend (Spring Boot)**, không phải ở Frontend — khai báo `allowedOrigins` đúng cổng của FE.
- **`fetch` gửi request** — khi POST/PUT nhớ `headers: {'Content-Type': 'application/json'}` và `JSON.stringify(body)`; đọc kết quả bằng `await res.json()`.
- **Trong React: gọi API trong `useEffect`, lưu vào `useState`** — xử lý đủ bộ ba `loading` / `error` / `data`.
- **Sau mỗi thao tác thay đổi (POST/PUT/DELETE), tải lại dữ liệu** để giao diện đồng bộ với server.

:::

---

## Mục lục

- [Bức tranh tổng thể FE ↔ BE](#bức-tranh-tổng-thể-fe--be)
- [Bước 1: Hiểu lỗi CORS](#bước-1-hiểu-lỗi-cors)
- [Bước 2: Bật CORS ở backend](#bước-2-bật-cors-ở-backend)
- [Bước 3: Gọi API bằng fetch (JavaScript thuần)](#bước-3-gọi-api-bằng-fetch-javascript-thuần)
- [Bước 4: Trang HTML hoàn chỉnh](#bước-4-trang-html-hoàn-chỉnh)
- [Bước 5: Gọi API trong React](#bước-5-gọi-api-trong-react)
- [Bước 6: Thêm và xoá từ React](#bước-6-thêm-và-xoá-từ-react)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Thử thách mở rộng](#thử-thách-mở-rộng)
- [Tóm tắt](#tóm-tắt)

---

## Bức tranh tổng thể FE ↔ BE

```
┌─────────────────────┐         HTTP request           ┌──────────────────────┐
│   Frontend          │   GET /api/students            │   Backend            │
│   React / HTML      │ ─────────────────────────────► │   Spring Boot        │
│   (localhost:5173)  │                                │   (localhost:8080)   │
│                     │ ◄───────────────────────────── │                      │
└─────────────────────┘         JSON response          └──────────────────────┘
       hiển thị                 [ {id,ten,diem}, ... ]        đọc từ H2
```

Hai bên là **hai chương trình riêng biệt**, chạy ở **hai cổng khác nhau**, nói chuyện qua HTTP + JSON. Frontend không biết Java, Backend không biết React — chúng chỉ thống nhất "thực đơn" API.

---

## Bước 1: Hiểu lỗi CORS

Khi mở Frontend ở `localhost:5173` và gọi API ở `localhost:8080`, trình duyệt sẽ chặn và báo lỗi đỏ trong Console:

```
Access to fetch at 'http://localhost:8080/api/students' from origin
'http://localhost:5173' has been blocked by CORS policy
```

**Vì sao?** Đây là cơ chế bảo mật **Same-Origin Policy** của trình duyệt: mặc định, một trang web **không được** gọi sang server khác "origin" (khác tên miền/cổng/giao thức) để tránh trang độc hại đánh cắp dữ liệu. `5173` và `8080` khác cổng → khác origin → bị chặn.

**CORS** (Cross-Origin Resource Sharing) là cách **backend chủ động cho phép** một số origin được gọi tới. Việc cho phép phải làm **ở phía server** (Spring Boot), không phải ở Frontend.

:::info CORS không phải "lỗi của bạn"
Nhiều người mới hoảng khi thấy lỗi CORS. Nó hoàn toàn bình thường — chỉ là backend chưa khai báo "tôi cho phép origin này gọi". Sửa vài dòng ở backend là xong.
:::

---

## Bước 2: Bật CORS ở backend

Có nhiều cách; với người mới, đơn giản nhất là thêm cấu hình toàn cục. Tạo file `CorsConfig.java` trong project Spring Boot:

```java
package com.example.quanlysinhvien;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")                  // áp cho mọi endpoint /api
                        .allowedOrigins("http://localhost:5173") // origin của FE được phép
                        .allowedMethods("GET", "POST", "PUT", "DELETE");
            }
        };
    }
}
```

Giải thích:

- **`@Configuration`** — đánh dấu class chứa cấu hình cho Spring.
- **`@Bean`** — báo Spring tạo và quản lý object trả về (ở đây là cấu hình CORS).
- **`addMapping("/api/**")`** — áp dụng cho mọi đường dẫn bắt đầu bằng `/api`.
- **`allowedOrigins(...)`** — danh sách origin Frontend được phép gọi. Dev React (Vite) thường chạy ở `5173`; Create React App ở `3000` — đổi cho khớp.
- **`allowedMethods(...)`** — các phương thức HTTP được phép.

:::warning Đừng để `allowedOrigins("*")` lên production
Cho phép mọi origin (`*`) tiện khi học nhưng **rủi ro bảo mật** khi lên thật. Production phải liệt kê đúng tên miền Frontend thật của bạn.
:::

Có cách nhanh hơn cho từng controller bằng annotation `@CrossOrigin("http://localhost:5173")` đặt trên class `StudentController` — nhưng cấu hình toàn cục ở trên gọn hơn khi có nhiều controller.

---

## Bước 3: Gọi API bằng fetch (JavaScript thuần)

`fetch` là hàm có sẵn của trình duyệt để gửi HTTP request. Lấy danh sách sinh viên:

```javascript
const API = 'http://localhost:8080/api/students'

// GET - lấy tất cả
async function layDanhSach() {
  const res = await fetch(API)
  if (!res.ok) throw new Error('Lỗi tải dữ liệu: ' + res.status)
  const data = await res.json()   // chuyển JSON → object JS
  return data
}
```

Giải thích:

- **`await fetch(API)`** — gửi request `GET` (mặc định) và **đợi** phản hồi. `await` chỉ dùng được trong hàm `async`.
- **`res.ok`** — `true` nếu mã trạng thái 200-299. Luôn kiểm tra trước khi đọc dữ liệu.
- **`await res.json()`** — đọc body và **chuyển JSON thành object JavaScript** để dùng.

Gửi dữ liệu (POST) phức tạp hơn một chút:

```javascript
// POST - thêm mới
async function themSinhVien(sv) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },   // báo body là JSON
    body: JSON.stringify(sv),                            // object JS → chuỗi JSON
  })
  return res.json()
}

// DELETE - xoá theo id
async function xoaSinhVien(id) {
  await fetch(`${API}/${id}`, { method: 'DELETE' })
}
```

Điểm mấu chốt:

- Phải đặt **`headers: { 'Content-Type': 'application/json' }`** để backend hiểu body là JSON (khớp `@RequestBody`).
- **`JSON.stringify(sv)`** — chuyển object JS thành chuỗi JSON để gửi đi. Đây là chiều ngược của `res.json()`.

---

## Bước 4: Trang HTML hoàn chỉnh

Để test nhanh không cần React, tạo file `index.html` và mở trực tiếp bằng trình duyệt:

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Quản lý sinh viên</title>
</head>
<body>
  <h1>Danh sách sinh viên</h1>

  <form id="form">
    <input id="maSV" placeholder="Mã SV" required />
    <input id="ten" placeholder="Tên" required />
    <input id="diem" type="number" step="0.1" placeholder="Điểm" required />
    <button type="submit">Thêm</button>
  </form>

  <ul id="ds"></ul>

  <script>
    const API = 'http://localhost:8080/api/students'

    async function render() {
      const res = await fetch(API)
      const list = await res.json()
      document.getElementById('ds').innerHTML = list
        .map(sv => `<li>${sv.ten} - ${sv.diem}đ
           <button onclick="xoa(${sv.id})">Xoá</button></li>`)
        .join('')
    }

    async function xoa(id) {
      await fetch(`${API}/${id}`, { method: 'DELETE' })
      render()
    }

    document.getElementById('form').addEventListener('submit', async (e) => {
      e.preventDefault()   // chặn trình duyệt tải lại trang
      const sv = {
        maSV: document.getElementById('maSV').value,
        ten: document.getElementById('ten').value,
        diem: parseFloat(document.getElementById('diem').value),
      }
      await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sv),
      })
      e.target.reset()
      render()
    })

    render()   // tải danh sách lần đầu
  </script>
</body>
</html>
```

Mở file này, thêm vài sinh viên — bạn sẽ thấy dữ liệu hiện ra, lưu xuống database H2, và xoá được. **Đây là một ứng dụng full-stack hoàn chỉnh!**

:::tip Mở HTML qua server nhỏ
Mở `file://` đôi khi gây vấn đề CORS khác. Nếu gặp, chạy một server tĩnh: `npx serve` rồi truy cập qua `http://localhost:3000`, và nhớ thêm origin đó vào `allowedOrigins`.
:::

---

## Bước 5: Gọi API trong React

Trong React, ta gọi API bên trong `useEffect` (chạy khi component hiện ra) và lưu kết quả vào `useState`:

```jsx
import { useEffect, useState } from 'react'

const API = 'http://localhost:8080/api/students'

function DanhSachSinhVien() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // tải danh sách
  async function taiDuLieu() {
    try {
      setLoading(true)
      const res = await fetch(API)
      if (!res.ok) throw new Error('HTTP ' + res.status)
      setList(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    taiDuLieu()
  }, [])   // [] = chỉ chạy 1 lần khi component xuất hiện

  if (loading) return <p>Đang tải...</p>
  if (error) return <p>Lỗi: {error}</p>

  return (
    <ul>
      {list.map((sv) => (
        <li key={sv.id}>{sv.ten} — {sv.diem}đ</li>
      ))}
    </ul>
  )
}

export default DanhSachSinhVien
```

Giải thích:

- **`useState`** giữ 3 trạng thái: dữ liệu (`list`), đang tải (`loading`), lỗi (`error`) — bộ ba kinh điển khi gọi API.
- **`useEffect(() => {...}, [])`** — chạy `taiDuLieu` **một lần** sau khi component render lần đầu. Mảng phụ thuộc `[]` rỗng nghĩa là "không chạy lại".
- **`try/catch/finally`** — bắt lỗi mạng và **luôn** tắt `loading` ở `finally`.
- **`key={sv.id}`** — React cần `key` duy nhất cho mỗi phần tử trong danh sách để cập nhật hiệu quả.

---

## Bước 6: Thêm và xoá từ React

Bổ sung form thêm và nút xoá, gọi lại `taiDuLieu()` sau mỗi thay đổi để làm mới danh sách:

```jsx
const [ten, setTen] = useState('')
const [diem, setDiem] = useState('')

async function themSinhVien(e) {
  e.preventDefault()
  await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ten, diem: parseFloat(diem) }),
  })
  setTen('')
  setDiem('')
  taiDuLieu()   // tải lại để thấy SV mới
}

async function xoa(id) {
  await fetch(`${API}/${id}`, { method: 'DELETE' })
  taiDuLieu()
}

// JSX:
// <form onSubmit={themSinhVien}>
//   <input value={ten} onChange={e => setTen(e.target.value)} placeholder="Tên" />
//   <input value={diem} onChange={e => setDiem(e.target.value)} placeholder="Điểm" />
//   <button>Thêm</button>
// </form>
// ... trong <li>: <button onClick={() => xoa(sv.id)}>Xoá</button>
```

Mẫu hình chung: **thao tác thay đổi dữ liệu (POST/PUT/DELETE) xong → gọi lại hàm tải để đồng bộ giao diện với server**. Đơn giản và đáng tin cho người mới (các cách tối ưu hơn như cập nhật state cục bộ hoặc dùng React Query sẽ học sau).

---

## Lỗi thường gặp

| Lỗi | Nguyên nhân | Cách sửa |
|-----|-------------|----------|
| `blocked by CORS policy` | Backend chưa cho phép origin của FE | Cấu hình CORS, thêm đúng origin (cổng) của FE |
| POST gửi lên nhưng dữ liệu `null` | Quên header `Content-Type: application/json` | Thêm header và `JSON.stringify(body)` |
| `Failed to fetch` | Backend chưa chạy hoặc sai URL/cổng | Bật Spring Boot, kiểm tra `http://localhost:8080` |
| Form làm tải lại trang | Quên `e.preventDefault()` | Gọi `e.preventDefault()` đầu hàm submit |
| Danh sách không cập nhật sau khi thêm | Quên gọi lại hàm tải dữ liệu | Gọi `taiDuLieu()` sau POST/DELETE |
| Cảnh báo React thiếu `key` | List item không có `key` duy nhất | Thêm `key={sv.id}` |

---

## Thử thách mở rộng

1. **Sửa sinh viên:** thêm nút "Sửa" mở form điền sẵn dữ liệu, gọi `PUT /api/students/{id}`.
2. **Hiển thị thông báo:** báo "Thêm thành công" / "Xoá thành công" bằng toast hoặc dòng chữ.
3. **Tìm kiếm trực tiếp:** ô input gọi endpoint search ở backend, hiển thị kết quả khi gõ (kết hợp `useDebounce`).
4. **Tách lớp gọi API:** gom các hàm `fetch` vào một file `studentApi.js` riêng — luyện tách bạch tầng giao tiếp.
5. **Deploy:** đóng gói backend thành `.jar` (`./mvnw package`) và tìm hiểu cách triển khai FE + BE lên server thật.

---

## Tóm tắt

- Frontend và Backend là **hai chương trình riêng**, nói chuyện qua **HTTP + JSON**.
- **CORS** là cơ chế bảo mật của trình duyệt; phải **bật cho phép ở phía backend** (Spring Boot), không phải ở Frontend.
- **`fetch`** gửi request: nhớ `headers: {'Content-Type': 'application/json'}` và `JSON.stringify(body)` khi POST/PUT; đọc kết quả bằng `await res.json()`.
- Trong React, gọi API trong **`useEffect`**, lưu vào **`useState`**, và xử lý đủ **loading / error / data**.
- Sau mỗi thao tác thay đổi, **tải lại dữ liệu** để giao diện đồng bộ với server.

🎉 **Hoàn thành!** Bạn đã đi trọn vòng từ chương trình console đến một ứng dụng full-stack: Java + Spring Boot + JPA + H2 ở backend, React/HTML ở frontend, giao tiếp qua REST API. Đây chính là kiến trúc của hầu hết phần mềm web hiện đại.
