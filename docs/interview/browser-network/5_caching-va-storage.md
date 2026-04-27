---
sidebar_position: 5
title: "5. Cache-Control, ETag, Service Worker, localStorage, IndexedDB"
---

# Cache-Control, ETag, Service Worker, localStorage, IndexedDB

Caching và storage là vũ khí tối thượng để tối ưu performance. Interviewer hỏi phần này để xem bạn có biết "tầng nào cache gì" -- từ HTTP caching ở network layer, browser storage ở application layer, cho đến Service Worker ở giữa. Hiểu đúng caching strategy giúp app nhanh hơn gấp nhiều lần.

---


---

## Mục lục

- [Câu 1: HTTP Caching -- giải thích Cache-Control headers, ETag, và Last-Modified `[Intermediate]`](#câu-1-http-caching-giải-thích-cache-control-headers-etag-và-last-modified-intermediate)
- [Câu 2: So sánh localStorage, sessionStorage, và cookies. Khi nào dùng cái nào? `[Intermediate]`](#câu-2-so-sánh-localstorage-sessionstorage-và-cookies-khi-nào-dùng-cái-nào-intermediate)
- [Câu 3: IndexedDB là gì? Khi nào nên dùng thay vì localStorage? `[Intermediate]`](#câu-3-indexeddb-là-gì-khi-nào-nên-dùng-thay-vì-localstorage-intermediate)
- [Câu 4: Service Worker lifecycle -- install, activate, fetch. Giải thích caching strategies `[Senior]`](#câu-4-service-worker-lifecycle-install-activate-fetch-giải-thích-caching-strategies-senior)
- [Câu 5: Cache API là gì? Khác gì HTTP cache? `[Senior]`](#câu-5-cache-api-là-gì-khác-gì-http-cache-senior)
- [Câu 6: Offline-first patterns -- làm sao xây dựng app hoạt động khi mất mạng? `[Senior]`](#câu-6-offline-first-patterns-làm-sao-xây-dựng-app-hoạt-động-khi-mất-mạng-senior)
- [Bảng so sánh storage options](#bảng-so-sánh-storage-options)
- [Lỗi thường gặp khi trả lời](#lỗi-thường-gặp-khi-trả-lời)

---

## Câu 1: HTTP Caching -- giải thích Cache-Control headers, ETag, và Last-Modified `[Intermediate]`

### Giải thích lý thuyết

HTTP caching hoạt động ở **2 tầng:**

**1. Strong caching (Cache-Control / Expires):** Browser không gửi request đến server, dùng cache luôn.

**2. Conditional caching (ETag / Last-Modified):** Browser gửi request hỏi server "resource có thay đổi không?", server trả `304 Not Modified` nếu không đổi.

**Cache-Control directives quan trọng:**

| Directive | Ý nghĩa |
|---|---|
| `max-age=3600` | Cache trong 3600 giây |
| `no-cache` | Phải revalidate với server trước khi dùng cache |
| `no-store` | Không cache gì cả (sensitive data) |
| `public` | CDN/proxy có thể cache |
| `private` | Chỉ browser cache (không CDN) |
| `immutable` | Resource không bao giờ thay đổi (hashed filenames) |
| `stale-while-revalidate=60` | Dùng cache cũ trong khi revalidate ngầm |
| `must-revalidate` | Khi hết hạn, BẮT BUỘC revalidate (không dùng stale) |

**Flow chi tiết:**

```
Request 1 (chưa có cache):
  Browser -> Server: GET /app.js
  Server -> Browser: 200 OK
    Cache-Control: max-age=3600
    ETag: "abc123"
    Last-Modified: Mon, 01 Jan 2024 00:00:00 GMT

Request 2 (trong 3600s -- strong cache):
  Browser: Có cache + chưa hết hạn -> dùng luôn, KHÔNG gửi request
  (Status: 200 from disk cache)

Request 3 (sau 3600s -- conditional request):
  Browser -> Server: GET /app.js
    If-None-Match: "abc123"
    If-Modified-Since: Mon, 01 Jan 2024 00:00:00 GMT

  Nếu không đổi:
    Server -> Browser: 304 Not Modified (body trống, tiết kiệm bandwidth)

  Nếu đổi rồi:
    Server -> Browser: 200 OK (body mới + headers mới)
```

### Code ví dụ

```
# Caching strategy phổ biến cho web app

# HTML files: không cache strong, luôn revalidate
# (vì HTML chứa references đến JS/CSS files mới)
Cache-Control: no-cache
# Hoặc: Cache-Control: max-age=0, must-revalidate

# JS/CSS với hashed filename (app.a1b2c3.js):
# Cache mãi mãi vì filename thay đổi khi content thay đổi
Cache-Control: public, max-age=31536000, immutable

# API responses: không cache hoặc cache ngắn
Cache-Control: private, no-cache
# Hoặc: Cache-Control: private, max-age=60

# Images/fonts: cache dài
Cache-Control: public, max-age=2592000

# Sensitive data: KHÔNG cache
Cache-Control: no-store, no-cache, must-revalidate
Pragma: no-cache
```

```javascript
// Fetch API với cache control
// Mặc định: browser tự xử lý cache theo headers

// Force no cache (bypass cache)
fetch('/api/data', {
  cache: 'no-store', // Không dùng cache, không lưu cache
});

// Dùng cache nếu có, revalidate ngầm
fetch('/api/data', {
  cache: 'no-cache', // Luôn revalidate với server
});

// Chỉ dùng cache (offline mode)
fetch('/api/data', {
  cache: 'force-cache', // Dùng cache bất kể hết hạn hay chưa
});

// Dùng cache cũ nếu có, nếu không mới fetch
fetch('/api/data', {
  cache: 'only-if-cached', // Chỉ dùng cache, error nếu không có
  mode: 'same-origin',     // Bắt buộc với only-if-cached
});

// Versioned URLs (cache busting)
// Webpack/Vite output: app.a1b2c3.js, styles.d4e5f6.css
// Khi code thay đổi -> hash thay đổi -> URL mới -> browser fetch mới
// File cũ vẫn còn trong cache -> user quay lại trang cũ vẫn OK

// ETag validation manually (thường không cần vì browser tự làm)
// Server gửi: ETag: "abc123"
// Browser tự gửi: If-None-Match: "abc123" khi revalidate
```

### Đáp án mẫu

> "HTTP caching có 2 tầng: strong caching (`Cache-Control: max-age`) -- browser dùng cache luôn không hỏi server, và conditional caching (`ETag`/`Last-Modified`) -- browser hỏi server 'có đổi không?', server trả 304 nếu không đổi. Strategy phổ biến: HTML dùng `no-cache` để luôn revalidate, JS/CSS có hashed filename dùng `max-age=31536000, immutable` vì filename thay đổi khi content thay đổi. Sensitive data dùng `no-store` để không cache gì cả."

---

## Câu 2: So sánh localStorage, sessionStorage, và cookies. Khi nào dùng cái nào? `[Intermediate]`

### Giải thích lý thuyết

| Tiêu chí | Cookie | localStorage | sessionStorage |
|---|---|---|---|
| **Dung lượng** | ~4KB | ~5-10MB | ~5-10MB |
| **Gửi lên server?** | Tự động mỗi request | Không | Không |
| **Expires** | Set được (Max-Age/Expires) | Không hết hạn | Khi đóng tab |
| **Scope** | Per domain + path | Per origin | Per origin + per tab |
| **API** | `document.cookie` (string) | `getItem`/`setItem` (clean) | `getItem`/`setItem` (clean) |
| **HttpOnly** | Có (JS không đọc được) | Không (luôn đọc được JS) | Không |
| **Server access** | Có (tự gửi kèm request) | Không | Không |

**Khi nào dùng cái nào:**

| Storage | Use case |
|---|---|
| **Cookie** | Auth tokens (HttpOnly), CSRF tokens, user preferences cần server biết |
| **localStorage** | Theme, language, non-sensitive settings, cache data nhỏ |
| **sessionStorage** | Form data tạm thời, one-time tokens, wizard state |

### Code ví dụ

```javascript
// localStorage API
localStorage.setItem('theme', 'dark');
localStorage.getItem('theme');     // "dark"
localStorage.removeItem('theme');
localStorage.clear();              // Xóa tất cả

// Lưu object (phải JSON.stringify)
const user = { name: 'John', preferences: { theme: 'dark' } };
localStorage.setItem('user', JSON.stringify(user));

const stored = JSON.parse(localStorage.getItem('user'));
console.log(stored.name); // "John"

// sessionStorage API (giống localStorage nhưng per-tab)
sessionStorage.setItem('formData', JSON.stringify({
  step: 2,
  email: 'john@example.com',
}));
// Đóng tab -> mất dữ liệu
// Mở tab mới -> sessionStorage trống

// Wrapper với error handling + expiry
const storage = {
  set(key, value, ttlMs) {
    const item = {
      value,
      timestamp: Date.now(),
      ttl: ttlMs || null,
    };
    try {
      localStorage.setItem(key, JSON.stringify(item));
    } catch (e) {
      // QuotaExceededError: storage đầy
      console.error('Storage full, clearing old data');
      localStorage.clear();
      localStorage.setItem(key, JSON.stringify(item));
    }
  },

  get(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      const item = JSON.parse(raw);

      // Kiểm tra TTL
      if (item.ttl && Date.now() - item.timestamp > item.ttl) {
        localStorage.removeItem(key);
        return null;
      }

      return item.value;
    } catch {
      return null;
    }
  },

  remove(key) {
    localStorage.removeItem(key);
  },
};

// Sử dụng
storage.set('cached_data', { users: [] }, 5 * 60 * 1000); // TTL 5 phút
const data = storage.get('cached_data'); // null nếu hết hạn

// Storage event: lắng nghe thay đổi từ tab KHÁC
window.addEventListener('storage', (event) => {
  console.log('Key changed:', event.key);
  console.log('Old value:', event.oldValue);
  console.log('New value:', event.newValue);
  console.log('From URL:', event.url);

  // Use case: đồng bộ theme giữa các tabs
  if (event.key === 'theme') {
    document.body.className = event.newValue;
  }
});
```

### Đáp án mẫu

> "Cookies nhỏ (4KB), tự gửi lên server mỗi request, hỗ trợ HttpOnly -- dùng cho auth tokens. localStorage lớn (5-10MB), không hết hạn, không gửi lên server -- dùng cho theme, settings, cached data. sessionStorage giống localStorage nhưng mất khi đóng tab -- dùng cho form data tạm thời. Cẩn thận: localStorage/sessionStorage là synchronous API, block main thread khi đọc/ghi dữ liệu lớn. Dùng storage event để đồng bộ giữa các tabs."

---

## Câu 3: IndexedDB là gì? Khi nào nên dùng thay vì localStorage? `[Intermediate]`

### Giải thích lý thuyết

**IndexedDB** là database NoSQL trong browser, hỗ trợ:
- Lưu trữ lượng lớn dữ liệu (hàng trăm MB)
- API **asynchronous** (không block main thread)
- **Structured data** với indexes để query nhanh
- **Transactions** đảm bảo data integrity
- Lưu được **binary data** (Blob, File, ArrayBuffer)

**So sánh localStorage vs IndexedDB:**

| Tiêu chí | localStorage | IndexedDB |
|---|---|---|
| **Dung lượng** | 5-10MB | Hàng trăm MB (browser cho phép) |
| **API** | Synchronous | Asynchronous |
| **Data type** | Chỉ string | Bất kỳ (object, blob, file...) |
| **Query** | Chỉ key-based | Indexes, ranges, cursors |
| **Transactions** | Không | Có |
| **Performance** | Chậm với data lớn | Nhanh với data lớn |
| **Complexity** | Đơn giản | Phức tạp (nên dùng wrapper) |

**Khi nào dùng IndexedDB:**
- Lưu offline data (email client, note app)
- Cache API responses lớn
- Lưu files/images offline
- Full-text search trong browser
- Dữ liệu cần query phức tạp

### Code ví dụ

```javascript
// IndexedDB raw API (phức tạp -- nên dùng wrapper)
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MyApp', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      // Tạo object store (giống table)
      if (!db.objectStoreNames.contains('articles')) {
        const store = db.createObjectStore('articles', { keyPath: 'id' });
        store.createIndex('by_date', 'publishedAt');
        store.createIndex('by_category', 'category');
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveArticle(article) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('articles', 'readwrite');
    const store = tx.objectStore('articles');
    const request = store.put(article);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Dùng wrapper library: idb (khuyến khích)
// npm install idb
import { openDB as openIDB } from 'idb';

const dbPromise = openIDB('MyApp', 1, {
  upgrade(db) {
    const store = db.createObjectStore('articles', { keyPath: 'id' });
    store.createIndex('by_date', 'publishedAt');
    store.createIndex('by_category', 'category');
  },
});

// CRUD operations (clean async/await)
async function addArticle(article) {
  const db = await dbPromise;
  await db.put('articles', article);
}

async function getArticle(id) {
  const db = await dbPromise;
  return db.get('articles', id);
}

async function getAllArticles() {
  const db = await dbPromise;
  return db.getAll('articles');
}

async function getArticlesByCategory(category) {
  const db = await dbPromise;
  return db.getAllFromIndex('articles', 'by_category', category);
}

async function deleteArticle(id) {
  const db = await dbPromise;
  await db.delete('articles', id);
}

// Use case: Offline-first data sync
async function fetchArticlesWithCache() {
  const db = await dbPromise;

  // 1. Trả về cached data ngay (fast)
  const cached = await db.getAll('articles');
  if (cached.length > 0) {
    renderArticles(cached); // Hiển thị ngay từ cache
  }

  // 2. Fetch fresh data (background)
  try {
    const response = await fetch('/api/articles');
    const fresh = await response.json();

    // 3. Update cache
    const tx = db.transaction('articles', 'readwrite');
    const store = tx.objectStore('articles');
    for (const article of fresh) {
      await store.put(article);
    }
    await tx.done;

    // 4. Re-render với data mới
    renderArticles(fresh);
  } catch (error) {
    // Offline: cached data đã hiển thị rồi
    console.log('Offline mode, using cached data');
  }
}
```

### Đáp án mẫu

> "IndexedDB là NoSQL database trong browser -- async API, lưu hàng trăm MB, hỗ trợ indexes và transactions. Dùng IndexedDB thay localStorage khi: dữ liệu lớn (vượt 5MB), cần query phức tạp (by index, range), cần lưu binary data (files, images), hoặc cần offline-first architecture. Raw API phức tạp nên thực tế hay dùng wrapper library như idb. Pattern phổ biến: hiển thị từ IndexedDB cache trước, fetch fresh data ngầm, update cache + re-render."

---

## Câu 4: Service Worker lifecycle -- install, activate, fetch. Giải thích caching strategies `[Senior]`

### Giải thích lý thuyết

**Service Worker** là JavaScript chạy **ngoài main thread**, đứng giữa browser và network (proxy layer). Nó intercept requests và quyết định trả response từ cache hay network.

**Lifecycle:**

```
1. Register -> 2. Install -> 3. Wait -> 4. Activate -> 5. Fetch/Message
```

| Phase | Xảy ra khi | Làm gì |
|---|---|---|
| **Register** | Page load | Browser download SW file |
| **Install** | Lần đầu hoặc SW file thay đổi | Pre-cache static assets |
| **Wait** | SW cũ vẫn đang control pages | Đợi tất cả tabs đóng |
| **Activate** | SW cũ releases control | Dọn cache cũ |
| **Fetch** | Mỗi network request | Intercept + quyết định response |

**Caching strategies:**

| Strategy | Mô tả | Use case |
|---|---|---|
| **Cache First** | Check cache trước, fallback network | Static assets (JS, CSS, images) |
| **Network First** | Check network trước, fallback cache | API data (cần fresh) |
| **Stale While Revalidate** | Trả cache ngay + fetch update ngầm | News feeds, profiles |
| **Cache Only** | Chỉ cache, không network | Offline-only resources |
| **Network Only** | Chỉ network, không cache | Auth, real-time data |

### Code ví dụ

```javascript
// service-worker.js

const CACHE_NAME = 'my-app-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/offline.html',
];

// 1. Install: pre-cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting()) // Activate ngay, không đợi
  );
});

// 2. Activate: dọn cache cũ
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim()) // Control pages ngay
  );
});

// 3. Fetch: intercept requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Strategy 1: Cache First (static assets)
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // Strategy 2: Network First (API)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Strategy 3: Stale While Revalidate (other pages)
  event.respondWith(staleWhileRevalidate(event.request));
});

// Cache First implementation
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

// Network First implementation
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(
      JSON.stringify({ error: 'Offline' }),
      { headers: { 'Content-Type': 'application/json' }, status: 503 }
    );
  }
}

// Stale While Revalidate implementation
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  // Fetch update in background
  const fetchPromise = fetch(request)
    .then(response => {
      cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached); // Nếu offline, trả cache

  // Trả cached ngay nếu có, nếu không đợi fetch
  return cached || fetchPromise;
}

function isStaticAsset(url) {
  return /\.(js|css|woff2?|png|jpg|svg|ico)$/.test(url.pathname);
}
```

```javascript
// Register Service Worker từ main app
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('SW registered:', registration.scope);

      // Kiểm tra update
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New version available
              showUpdateBanner();
            }
          }
        });
      });
    } catch (error) {
      console.error('SW registration failed:', error);
    }
  });
}

// Notify user about updates
function showUpdateBanner() {
  const banner = document.createElement('div');
  banner.innerHTML = `
    New version available!
    <button onclick="updateApp()">Update</button>
  `;
  document.body.appendChild(banner);
}

function updateApp() {
  navigator.serviceWorker.getRegistration()
    .then(reg => {
      if (reg && reg.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    });
  window.location.reload();
}
```

### Đáp án mẫu

> "Service Worker chạy giữa browser và network, intercept requests để quyết định trả từ cache hay network. Lifecycle: register -> install (pre-cache assets) -> activate (dọn cache cũ) -> fetch (intercept requests). 5 caching strategies: Cache First cho static assets, Network First cho API data cần fresh, Stale While Revalidate trả cache ngay và fetch update ngầm, Cache Only cho offline resources, Network Only cho real-time data. Trong thực tế, tôi thường dùng Workbox library vì nó abstract hóa những patterns này."

---

## Câu 5: Cache API là gì? Khác gì HTTP cache? `[Senior]`

### Giải thích lý thuyết

**Cache API** là programmatic storage cho Request/Response pairs, thường dùng cùng Service Worker.

| | HTTP Cache | Cache API |
|---|---|---|
| **Kiểm soát bởi** | Server (headers) | Developer (JavaScript) |
| **Granularity** | Per-resource (URL) | Per-request (method + URL + vary) |
| **Invalidation** | TTL + ETag + max-age | Manual (developer xóa) |
| **Access** | Browser tự quản lý | `caches.open()`, `cache.match()` |
| **Dùng trong** | Tất cả requests | Chủ yếu Service Worker |
| **Multiple caches** | 1 HTTP cache | Nhiều named caches |
| **Offline** | Không | Có (chính mục đích chính) |

**Cache API flow:**
```
Request -> Service Worker -> Cache API -> có? -> trả response
                                      -> không? -> fetch từ network -> lưu vào Cache API -> trả response
```

### Code ví dụ

```javascript
// Cache API có thể dùng ngoài Service Worker (main thread)
// Nhưng chủ yếu dùng trong SW

// Mở hoặc tạo cache mới
const cache = await caches.open('api-cache-v1');

// Thêm response vào cache
await cache.put(
  new Request('/api/articles'),
  new Response(JSON.stringify(articles), {
    headers: { 'Content-Type': 'application/json' },
  })
);

// Tìm trong cache
const response = await caches.match(new Request('/api/articles'));
if (response) {
  const data = await response.json();
  console.log('From cache:', data);
}

// Cache addAll (fetch + cache nhiều URLs)
const staticCache = await caches.open('static-v1');
await staticCache.addAll([
  '/index.html',
  '/styles.css',
  '/app.js',
  '/logo.png',
]);

// Xóa cache cũ
const keys = await caches.keys();
for (const key of keys) {
  if (key !== 'api-cache-v2') {
    await caches.delete(key);
  }
}

// Pattern: Runtime caching với versioning
const RUNTIME_CACHE = 'runtime-v1';
const MAX_ENTRIES = 50;

async function runtimeCache(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);

  // Chỉ cache successful responses
  if (response.ok) {
    // Clone response vì body chỉ đọc được 1 lần
    cache.put(request, response.clone());

    // Cleanup: giới hạn số entries
    const keys = await cache.keys();
    if (keys.length > MAX_ENTRIES) {
      await cache.delete(keys[0]); // Xóa entry cũ nhất
    }
  }

  return response;
}
```

### Đáp án mẫu

> "Cache API là programmatic storage cho Request/Response pairs, developer kiểm soát hoàn toàn qua JavaScript. Khác HTTP cache ở chỗ: HTTP cache do server kiểm soát qua headers (Cache-Control, ETag), còn Cache API do developer kiểm soát (mở, thêm, xóa, match). Cache API chủ yếu dùng trong Service Worker cho offline-first caching -- developer quyết định cache gì, khi nào invalidate, strategy nào cho từng loại request."

---

## Câu 6: Offline-first patterns -- làm sao xây dựng app hoạt động khi mất mạng? `[Senior]`

### Giải thích lý thuyết

**Offline-first** nghĩa là app được thiết kế để **hoạt động tốt offline**, online là bonus. Ngược với cách truyền thống: online-first, offline là error.

**3 tầng offline-first:**

| Tầng | Công nghệ | Cache gì |
|---|---|---|
| **App Shell** | Service Worker + Cache API | HTML, CSS, JS (UI framework) |
| **Static Data** | Cache API + IndexedDB | Images, fonts, static content |
| **Dynamic Data** | IndexedDB + Background Sync | API responses, user data |

**Sync strategies:**

| Strategy | Mô tả | Use case |
|---|---|---|
| **Background Sync** | Queue actions offline, sync khi online | Send message, submit form |
| **Periodic Background Sync** | Fetch data định kỳ khi online | News feed, email |
| **Conflict resolution** | Last-write-wins, merge, manual | Collaborative editing |

### Code ví dụ

```javascript
// Offline-first architecture

// 1. App Shell: Service Worker cache UI
// (Xem câu 4 cho SW implementation)

// 2. Offline data sync với Background Sync API
// service-worker.js
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

async function syncMessages() {
  // Đọc queued messages từ IndexedDB
  const db = await openDB();
  const messages = await db.getAll('outbox');

  for (const message of messages) {
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });
      // Xóa khỏi outbox sau khi gửi thành công
      await db.delete('outbox', message.id);
    } catch {
      // Vẫn offline, sync sẽ retry
      break;
    }
  }
}

// main.js -- Queue message khi offline
async function sendMessage(content) {
  // 1. Lưu vào local DB ngay (optimistic UI)
  const message = {
    id: crypto.randomUUID(),
    content,
    status: 'pending',
    timestamp: Date.now(),
  };

  const db = await openDB();
  await db.put('messages', message);    // Hiển thị trong UI
  await db.put('outbox', message);      // Queue để sync

  // 2. Hiển thị ngay trong UI (optimistic)
  renderMessage(message);

  // 3. Register background sync
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const reg = await navigator.serviceWorker.ready;
    await reg.sync.register('sync-messages');
  } else {
    // Fallback: thử gửi ngay
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });
      await db.delete('outbox', message.id);
    } catch {
      // Sẽ retry khi online
    }
  }
}

// 3. Online/offline detection
window.addEventListener('online', () => {
  console.log('Back online! Syncing...');
  showStatusBar('Online - Syncing data...');
  syncPendingData();
});

window.addEventListener('offline', () => {
  console.log('Gone offline');
  showStatusBar('Offline - Changes will sync when online');
});

// Reliable online check (navigator.onLine không đáng tin)
async function isReallyOnline() {
  try {
    const response = await fetch('/api/health', {
      method: 'HEAD',
      cache: 'no-store',
    });
    return response.ok;
  } catch {
    return false;
  }
}

// 4. Workbox (Google library - production recommended)
// workbox-config.js
// module.exports = {
//   globDirectory: 'dist/',
//   globPatterns: ['**/*.{html,js,css,png,svg,woff2}'],
//   swDest: 'dist/sw.js',
//   runtimeCaching: [
//     {
//       urlPattern: /^https:\/\/api\.example\.com\/.*/,
//       handler: 'NetworkFirst',
//       options: {
//         cacheName: 'api-cache',
//         expiration: { maxEntries: 50, maxAgeSeconds: 300 },
//       },
//     },
//     {
//       urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
//       handler: 'CacheFirst',
//       options: {
//         cacheName: 'image-cache',
//         expiration: { maxEntries: 100, maxAgeSeconds: 2592000 },
//       },
//     },
//   ],
// };
```

### Đáp án mẫu

> "Offline-first có 3 tầng: App Shell (SW cache HTML/CSS/JS), Static Data (Cache API cho images/fonts), Dynamic Data (IndexedDB + Background Sync). Pattern chính: lưu data vào local DB ngay (optimistic UI), queue changes trong outbox, Background Sync API gửi khi online. Cần xử lý conflict resolution khi multiple devices offline cùng lúc. Trong production, nên dùng Workbox library vì nó abstract hóa Service Worker + caching strategies."

---

## Bảng so sánh storage options

| Storage | Max Size | Persistence | Async | Data Type | Server Access | Indexed | Use Case |
|---|---|---|---|---|---|---|---|
| **Cookie** | ~4KB | Configurable | No | String | Yes (auto-send) | No | Auth, preferences |
| **localStorage** | 5-10MB | Permanent | No | String | No | No | Settings, small cache |
| **sessionStorage** | 5-10MB | Tab lifetime | No | String | No | No | Form state, temp data |
| **IndexedDB** | 100MB+ | Permanent | Yes | Any (object, blob) | No | Yes | Large data, offline |
| **Cache API** | 100MB+ | Permanent | Yes | Request/Response | No | No | HTTP responses, SW |
| **HTTP Cache** | Varies | TTL-based | N/A | HTTP responses | N/A | No | All HTTP resources |

---

## Lỗi thường gặp khi trả lời

1. **Nhầm `no-cache` với `no-store`**: `no-cache` vẫn lưu cache nhưng **bắt buộc revalidate** với server trước khi dùng. `no-store` hoàn toàn **không lưu** gì cả. Nhiều bạn nghĩ `no-cache` = không cache.

2. **Không biết Cache-Control priority**: Khi có cả `max-age` và `Expires`, `max-age` **thắng**. Khi có cả `ETag` và `Last-Modified`, `ETag` **ưu tiên** hơn.

3. **Nói "localStorage đủ cho mọi trường hợp"**: localStorage đồng bộ (block main thread), chỉ lưu string, giới hạn 5-10MB. Với data lớn hoặc cần query, IndexedDB là lựa chọn đúng.

4. **Quên response.clone() khi cache**: Response body chỉ đọc được **1 lần**. Nếu muốn vừa cache vừa trả về client, phải `response.clone()` -- một bản cho cache, một bản cho client.

5. **Không hiểu Service Worker lifecycle**: SW mới không activate ngay -- phải đợi tất cả tabs dùng SW cũ đóng hết. `skipWaiting()` + `clients.claim()` bỏ qua bước chờ nhưng cẩn thận vì có thể gây inconsistency.

6. **Chỉ biết cache mà quên invalidation**: "There are only two hard things in Computer Science: cache invalidation and naming things." Cần strategy rõ ràng để invalidate cache: versioned cache names, hashed filenames, hoặc manual purge.
