---
sidebar_position: 1
title: "1. SPA/MPA/SSR/SSG"
---

# SPA/MPA/SSR/SSG


---

## Mục lục

- [SPA — Single Page Application](#spa--single-page-application)
- [MPA — Multi Page Application](#mpa--multi-page-application)
- [SSR — Server Side Rendering](#ssr--server-side-rendering)
- [SSG — Static Site Generation](#ssg--static-site-generation)
- [CSR — Client Side Rendering](#csr--client-side-rendering)
- [So sánh SPA vs MPA vs SSR vs SSG](#so-sánh-spa-vs-mpa-vs-ssr-vs-ssg)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## SPA — Single Page Application

**SPA** tải **một HTML file duy nhất** từ server, sau đó tất cả navigation/state management xảy ra **phía client (browser)** bằng JavaScript.

```
User clicks link
    ↓
JavaScript handles routing (NO page reload)
    ↓
Browser renders new UI
```

### Đặc điểm

- ✅ Navigation **nhanh** (không reload)
- ✅ UX mượt như native app
- ✅ Offline có thể hoạt động (nếu cache)
- ❌ SEO tệ (content load động)
- ❌ First load chậm (bundle JS lớn)

### Ví dụ

```javascript
// React Router SPA
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

// Khi click link → JavaScript thay đổi URL + render component
// Không có HTTP request mới tới server!
```

---

## MPA — Multi Page Application

**MPA** có **nhiều HTML files** — mỗi page là file HTML riêng. Khi user navigate, browser **request HTML mới từ server**.

```
User clicks link
    ↓
Browser requests HTML từ server
    ↓
Server responds với HTML
    ↓
Browser reload page
```

### Đặc điểm

- ✅ **SEO tốt** (HTML có content sẵn)
- ✅ Mỗi page load độc lập
- ✅ Server-side rendering tự nhiên
- ❌ Navigation **chậm** (full page reload)
- ❌ UX không mượt (blink, flicker)

### Ví dụ

```
pages/
├── index.html (Home page)
├── about.html (About page)
├── contact.html (Contact page)

Khi user click link from Home → browser request about.html
```

---

## SSR — Server Side Rendering

**SSR** render React component **trên server**, gửi **HTML string** cho browser (chứ không phải JS bundle).

```
User requests /page
    ↓
Server: React.renderToString(<Page />) → HTML
    ↓
Server gửi HTML + JS bundle
    ↓
Browser displays HTML ngay
    ↓
JS "hydrate" (attach event listeners)
```

### Lợi ích

- ✅ **SEO tốt** (HTML có content)
- ✅ **First Contentful Paint nhanh** (HTML load trước JS)
- ✅ Social media meta tags có content
- ❌ Server phải render (overhead CPU)
- ❌ Complexity tăng

### Ví dụ (Next.js)

```typescript
// pages/users/[id].tsx
export async function getServerSideProps({ params }) {
  const user = await fetch(`/api/users/${params.id}`).then(r => r.json());
  return { props: { user } };
}

export default function UserPage({ user }) {
  return <h1>{user.name}</h1>;
}

// Mỗi request → server render → send HTML + data
```

---

## SSG — Static Site Generation

**SSG** build-time render — tất cả pages render **sẵn thành HTML static** khi build, serve static files (rất nhanh).

```
Build time:
    React components → HTML static files

Runtime:
    User requests page → serve HTML file (từ CDN)
    ↓ (instantaneous!)
```

### Lợi ích

- ✅ **Siêu nhanh** (static files, can CDN)
- ✅ **SEO tốt** (HTML có content)
- ✅ **Cheap hosting** (just static files)
- ✅ **High availability** (CDN global)
- ❌ Content phải **rebuild** khi update
- ❌ Không phù hợp dynamic content

### Ví dụ (Next.js)

```typescript
// pages/users/[id].tsx
export async function getStaticPaths() {
  const users = await fetch('/api/users').then(r => r.json());
  return {
    paths: users.map(u => ({ params: { id: u.id } })),
    fallback: false // hoặc 'blocking' hoặc true
  };
}

export async function getStaticProps({ params }) {
  const user = await fetch(`/api/users/${params.id}`).then(r => r.json());
  return {
    props: { user },
    revalidate: 3600 // ISR: rebuild every hour
  };
}

// Build time: sinh /users/1.html, /users/2.html, ... tất cả
// Runtime: serve HTML tĩnh siêu nhanh
```

---

## CSR — Client Side Rendering

**CSR** — JavaScript xử lý **toàn bộ rendering ở browser**. Server chỉ gửi JS bundle + API endpoints.

```
User requests /
    ↓
Server sends: <div id="root"></div> + app.js
    ↓
Browser loads JS
    ↓
JS renders UI
```

### Đặc điểm

- ✅ Development đơn giản
- ✅ Offline-first possible
- ❌ **SEO tệ** (HTML trống, content load sau)
- ❌ **First load chậm** (JS lớn + render thời gian)
- ❌ Blink of unstyled content (FOUC)

---

## So sánh SPA vs MPA vs SSR vs SSG

| Tiêu chí | SPA | MPA | SSR | SSG |
|:---:|:---|:---|:---|:---|
| Navigation | Nhanh ✅ | Chậm ❌ | Trung bình | Siêu nhanh ✅ |
| SEO | Tệ ❌ | Tốt ✅ | Tốt ✅ | Tốt ✅ |
| First Load | Chậm ❌ | Nhanh ✅ | Nhanh ✅ | Siêu nhanh ✅ |
| Server cost | Thấp | Trung | Cao ❌ | Thấp |
| Dynamic content | ✅ | ✅ | ✅ | ❌ |
| Build complexity | Thấp | Thấp | Cao | Cao |
| Use case | Dashboard | Blog | News site | Static blog |

---

## Câu hỏi phỏng vấn

### Câu 1: SPA khác MPA như thế nào?

**Đáp án:** **SPA** tải 1 HTML, navigation = JS routing (no reload). **MPA** nhiều HTML, navigation = new HTTP request + reload. SPA nhanh nhưng SEO tệ. MPA SEO tốt nhưng navigation chậm.

### Câu 2: SSR vs SSG khác gì?

**Đáp án:** **SSR** render **mỗi request** (server-side, dynamic). **SSG** render **build-time** (static, fast). SSR: dynamic content, SSG: static content, fast. Next.js support cả 2.

### Câu 3: Khi nào dùng SPA vs SSR vs SSG?

**Đáp án:**
- **SPA**: Internal tools, dashboards (không cần SEO)
- **SSR**: News, dynamic pages, user-specific content
- **SSG**: Blog, documentation, static sites
- **MPA**: Legacy apps, simple sites
