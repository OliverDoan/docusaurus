---
sidebar_position: 14
title: "14. Tình huống thực chiến"
---

# Tình huống thực chiến

> _Những tình huống thường gặp trong dự án React thực tế — từ lỗi CORS, hydration mismatch, cho đến thiết kế authentication và đa ngôn ngữ._

---

## Câu 1: CORS error khi gọi API từ React — nguyên nhân và cách xử lý? `[Intermediate]`

### Câu hỏi

> Khi phát triển ứng dụng React, bạn gặp lỗi `"Access to XMLHttpRequest … has been blocked by CORS policy"`. Nguyên nhân do đâu? Có những cách nào để xử lý?

### Giải thích lý thuyết

**CORS (Cross-Origin Resource Sharing)** là cơ chế bảo mật của trình duyệt. Khi React app chạy ở `http://localhost:3000` gọi API ở `http://localhost:8080` (khác port = khác origin), trình duyệt sẽ chặn request nếu server không trả về header `Access-Control-Allow-Origin`.

**Nguyên nhân phổ biến:**

| Tình huống | Nguyên nhân |
|---|---|
| Dev local | Frontend và backend chạy trên port khác nhau |
| Production | Frontend và API ở domain / subdomain khác nhau |
| Third-party API | API không cho phép trình duyệt gọi trực tiếp |

**Các cách xử lý:**

1. **Cấu hình CORS ở server (chuẩn nhất):** Server thêm header `Access-Control-Allow-Origin` cho phép origin của frontend.
2. **Dùng proxy trong CRA / Vite (môi trường dev):** Cấu hình dev server proxy — trình duyệt gọi cùng origin, dev server chuyển tiếp đến API thật.
3. **Dùng proxy server trung gian (production):** Nginx hoặc một service riêng đứng giữa frontend và API.
4. **Gọi API từ server-side (Next.js API route):** Tránh hoàn toàn vấn đề CORS vì server-to-server không bị trình duyệt chặn.

> **Lưu ý:** Không bao giờ dùng extension "Disable CORS" hay cờ `--disable-web-security` trong Chrome như một giải pháp — đây chỉ là cách test tạm thời và cực kỳ nguy hiểm khi dùng thật.

### Code minh hoạ

```ts
// ── Cách 1: Cấu hình CORS ở Express server ──
import cors from 'cors'

app.use(
  cors({
    origin: 'http://localhost:3000', // chỉ cho phép origin này
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,              // nếu cần gửi cookie
  })
)
```

```ts
// ── Cách 2: Proxy trong Vite (vite.config.ts) ──
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // API thật
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
```

```tsx
// ── Cách 3: Gọi qua proxy — React không cần thay đổi gì ──
const fetchUsers = async () => {
  // Trình duyệt gọi /api/users → Vite proxy chuyển đến http://localhost:8080/users
  const res = await fetch('/api/users')
  return res.json()
}
```

### Đáp án mẫu

> CORS xảy ra khi trình duyệt chặn request tới khác origin. Giải pháp đúng đắn nhất là **cấu hình header CORS ở phía server**. Trong môi trường dev, dùng **proxy của Vite/CRA** để tránh phải thay đổi server. Trong production, dùng Nginx reverse proxy hoặc gọi API từ server-side để loại bỏ hoàn toàn vấn đề cross-origin.

---

## Câu 2: SSR/SSG content khác client-side gây hydration mismatch — nguyên nhân và cách khắc phục? `[Advanced]`

### Câu hỏi

> Khi dùng Next.js (hoặc framework SSR/SSG khác), bạn gặp warning `"Text content does not match server-rendered HTML"`. Đây là hydration mismatch. Nguyên nhân và cách khắc phục?

### Giải thích lý thuyết

**Hydration** là quá trình React "gắn" event listener và state vào HTML tĩnh do server render. Nếu HTML từ server **khác** với những gì React render ở client, hydration mismatch xảy ra.

**Nguyên nhân phổ biến:**

| Nguyên nhân | Ví dụ |
|---|---|
| Dùng `Math.random()` / `Date.now()` | Giá trị khác nhau mỗi lần render |
| Đọc `window` / `localStorage` trong render | Không tồn tại ở server |
| Timezone khác nhau giữa server và client | `new Date().toLocaleDateString()` cho kết quả khác |
| Dữ liệu từ cookie / user agent | Server không có thông tin người dùng |
| Extension trình duyệt thêm DOM | Không thể kiểm soát |

**Cách khắc phục:**

1. **`useEffect` để chạy code chỉ ở client:** Dữ liệu phụ thuộc client chỉ được set sau khi mount.
2. **`suppressHydrationWarning`:** Dùng cho các trường hợp không thể tránh (timestamp, …).
3. **Dynamic import với `ssr: false` (Next.js):** Không render component ở server.
4. **Đảm bảo dữ liệu nhất quán:** Truyền timezone / locale từ server xuống, không tự suy ra ở client.

### Code minh hoạ

```tsx
// ── Sai: đọc localStorage trong render → crash ở server ──
const BadComponent = () => {
  const theme = localStorage.getItem('theme') // ReferenceError ở server!
  return <div className={theme}>...</div>
}
```

```tsx
// ── Đúng: dùng useEffect để chạy sau khi mount ──
import { useState, useEffect } from 'react'

const GoodComponent = () => {
  const [theme, setTheme] = useState<string | null>(null)

  useEffect(() => {
    // Chỉ chạy ở client, sau khi hydration hoàn tất
    setTheme(localStorage.getItem('theme'))
  }, [])

  // Render null hoặc fallback ở server / lần render đầu
  if (theme === null) return <div>Loading...</div>

  return <div className={theme}>...</div>
}
```

```tsx
// ── Next.js: dynamic import không SSR ──
import dynamic from 'next/dynamic'

const ChartComponent = dynamic(() => import('./ChartComponent'), {
  ssr: false,      // Không render ở server
  loading: () => <p>Đang tải biểu đồ...</p>,
})

const Page = () => (
  <main>
    <ChartComponent />
  </main>
)
```

```tsx
// ── suppressHydrationWarning: khi không thể tránh mismatch ──
const Timestamp = () => (
  <time suppressHydrationWarning>
    {new Date().toLocaleTimeString()}
  </time>
)
```

### Đáp án mẫu

> Hydration mismatch xảy ra khi HTML server render khác với những gì React render ở client — thường do dùng `window`, `localStorage`, `Math.random()` hoặc thời gian trong render. Cách khắc phục: **chuyển code phụ thuộc client vào `useEffect`**, dùng `dynamic import` với `ssr: false` cho component không cần SEO, hoặc đảm bảo server và client dùng cùng dữ liệu nguồn (locale, timezone truyền từ server).

---

## Câu 3: Thiết kế authentication flow (luồng đăng nhập) cho một SPA (React)? `[Advanced]`

### Câu hỏi

> Hãy trình bày cách thiết kế luồng đăng nhập (login / logout / refresh token) cho một Single Page Application dùng React. Nên lưu token ở đâu? Xử lý token hết hạn như thế nào?

### Giải thích lý thuyết

**Luồng cơ bản (JWT + Refresh Token):**

```
1. User nhập credentials → POST /auth/login
2. Server trả về { accessToken, refreshToken }
3. Client lưu token → gọi API tiếp theo kèm Authorization header
4. accessToken hết hạn → dùng refreshToken gọi POST /auth/refresh
5. Server trả accessToken mới
6. Logout → xóa token + gọi POST /auth/logout (blacklist refresh token)
```

**Nên lưu token ở đâu?**

| Nơi lưu | Ưu điểm | Nhược điểm |
|---|---|---|
| `localStorage` | Đơn giản, persist | Dễ bị XSS đánh cắp |
| `sessionStorage` | Mất khi đóng tab | Vẫn dễ bị XSS |
| `httpOnly Cookie` | JS không đọc được → an toàn hơn | Cần CSRF protection |
| Memory (biến JS) | An toàn nhất với XSS | Mất khi reload trang |

**Khuyến nghị:** `accessToken` lưu trong memory (React state / context), `refreshToken` lưu trong `httpOnly cookie`.

**Xử lý token hết hạn:** Dùng Axios interceptor hoặc fetch wrapper — khi nhận `401`, tự động gọi refresh, rồi retry request gốc.

### Code minh hoạ

```tsx
// ── AuthContext: lưu accessToken trong memory ──
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface AuthContextValue {
  accessToken: string | null
  login: (credentials: { email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null)

  const login = useCallback(async (credentials: { email: string; password: string }) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      credentials: 'include', // gửi/nhận httpOnly cookie
    })
    if (!res.ok) throw new Error('Đăng nhập thất bại')
    const { accessToken } = await res.json()
    setAccessToken(accessToken)
  }, [])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setAccessToken(null)
  }, [])

  return (
    <AuthContext.Provider value={{ accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth phải dùng bên trong AuthProvider')
  return ctx
}
```

```ts
// ── Axios interceptor: tự động refresh khi nhận 401 ──
import axios from 'axios'

let isRefreshing = false
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token!)
  })
  failedQueue = []
}

export const setupAxiosInterceptors = (
  getToken: () => string | null,
  setToken: (t: string) => void,
  onLogout: () => void
) => {
  axios.interceptors.request.use((config) => {
    const token = getToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })

  axios.interceptors.response.use(
    (res) => res,
    async (error) => {
      const originalRequest = error.config
      if (error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return axios(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await axios.post('/api/auth/refresh', {}, { withCredentials: true })
        setToken(data.accessToken)
        processQueue(null, data.accessToken)
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return axios(originalRequest)
      } catch (err) {
        processQueue(err, null)
        onLogout()
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
  )
}
```

```tsx
// ── PrivateRoute: bảo vệ route cần đăng nhập ──
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

const PrivateRoute = () => {
  const { accessToken } = useAuth()
  return accessToken ? <Outlet /> : <Navigate to="/login" replace />
}

export default PrivateRoute
```

### Đáp án mẫu

> Luồng chuẩn: đăng nhập → nhận `accessToken` (lưu trong memory) và `refreshToken` (lưu trong `httpOnly cookie`) → mỗi request gắn `Authorization: Bearer <token>` → khi nhận `401` dùng Axios interceptor tự động refresh và retry. Logout xóa token ở client và blacklist refresh token ở server. Tuyệt đối không lưu `accessToken` trong `localStorage` vì dễ bị XSS.

---

## Câu 4: i18n (đa ngôn ngữ) là gì? Triển khai multi-language trong dự án React như thế nào? `[Intermediate]`

### Câu hỏi

> i18n là gì? Hãy trình bày cách tích hợp đa ngôn ngữ vào một dự án React, bao gồm cấu trúc file, cách đổi ngôn ngữ và lazy load bản dịch.

### Giải thích lý thuyết

**i18n** là viết tắt của *internationalization* (chữ "i", 18 ký tự, chữ "n") — quá trình thiết kế phần mềm để dễ dàng thích nghi với nhiều ngôn ngữ và vùng địa lý khác nhau. **l10n** (localization) là bước cụ thể hóa cho từng locale (dịch văn bản, định dạng ngày/tiền tệ, …).

**Thư viện phổ biến trong React:**

| Thư viện | Đặc điểm |
|---|---|
| `react-i18next` | Phổ biến nhất, hỗ trợ lazy load, TypeScript tốt |
| `react-intl` (FormatJS) | Chuẩn ICU message, tích hợp sẵn format số/ngày |
| `lingui` | Compile-time, bundle nhỏ hơn |

**Quy trình triển khai với `react-i18next`:**

1. Cài đặt `i18next` và `react-i18next`.
2. Tạo file bản dịch JSON theo namespace và locale.
3. Cấu hình `i18n` instance (lazy load qua `import()`).
4. Bọc app bằng `I18nextProvider` (hoặc dùng trực tiếp vì i18next là singleton).
5. Dùng hook `useTranslation` trong component.
6. Đổi ngôn ngữ bằng `i18n.changeLanguage()`.

### Code minh hoạ

```
// ── Cấu trúc thư mục bản dịch ──
src/
  locales/
    vi/
      common.json
      auth.json
    en/
      common.json
      auth.json
```

```json
// src/locales/vi/common.json
{
  "welcome": "Chào mừng, {{name}}!",
  "logout": "Đăng xuất",
  "save": "Lưu",
  "cancel": "Hủy"
}
```

```json
// src/locales/en/common.json
{
  "welcome": "Welcome, {{name}}!",
  "logout": "Log out",
  "save": "Save",
  "cancel": "Cancel"
}
```

```ts
// src/i18n.ts — cấu hình i18next với lazy load
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import HttpBackend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'

i18n
  .use(HttpBackend)           // tải bản dịch qua HTTP (lazy load)
  .use(LanguageDetector)      // tự phát hiện ngôn ngữ từ browser/localStorage
  .use(initReactI18next)
  .init({
    fallbackLng: 'vi',
    defaultNS: 'common',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    interpolation: {
      escapeValue: false, // React đã tự escape
    },
  })

export default i18n
```

```tsx
// src/main.tsx — import i18n trước khi render
import './i18n'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

```tsx
// ── Dùng trong component ──
import { useTranslation } from 'react-i18next'

interface Props {
  userName: string
}

const Header = ({ userName }: Props) => {
  const { t, i18n } = useTranslation('common')

  const toggleLanguage = () => {
    const next = i18n.language === 'vi' ? 'en' : 'vi'
    i18n.changeLanguage(next)
  }

  return (
    <header>
      <h1>{t('welcome', { name: userName })}</h1>
      <button onClick={toggleLanguage}>
        {i18n.language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
      </button>
      <button>{t('logout')}</button>
    </header>
  )
}

export default Header
```

```tsx
// ── Lazy load namespace: tải bản dịch khi cần ──
import { useTranslation } from 'react-i18next'
import { Suspense } from 'react'

// Chỉ tải auth.json khi component này được render
const LoginForm = () => {
  const { t } = useTranslation('auth') // namespace riêng

  return (
    <form>
      <h2>{t('loginTitle')}</h2>
      <button type="submit">{t('loginButton')}</button>
    </form>
  )
}

// Bọc bằng Suspense để hiển thị loading khi chưa tải xong bản dịch
const LoginPage = () => (
  <Suspense fallback={<p>Đang tải...</p>}>
    <LoginForm />
  </Suspense>
)
```

### Đáp án mẫu

> i18n (internationalization) là quá trình chuẩn bị app để hỗ trợ nhiều ngôn ngữ. Trong React, `react-i18next` là lựa chọn phổ biến nhất: tổ chức bản dịch theo file JSON (locale + namespace), dùng `useTranslation` trong component, đổi ngôn ngữ bằng `i18n.changeLanguage()`. Để tối ưu performance, dùng `i18next-http-backend` để lazy load từng namespace — chỉ tải bản dịch khi cần, kết hợp `Suspense` để xử lý trạng thái chờ.

---
