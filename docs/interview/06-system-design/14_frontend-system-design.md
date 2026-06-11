---
sidebar_position: 14
title: "14. Frontend System Design"
---

# Frontend System Design

> *Frontend system design là vòng phỏng vấn tách senior khỏi mid-level. Interviewer không cần bạn vẽ ra hệ thống hoàn hảo — họ cần thấy framework tư duy: clarify requirements → high-level architecture → deep dive vào component khó nhất → nói rõ trade-offs. Tài liệu này đi qua các bài design kinh điển nhất từ góc nhìn frontend.*

---

## Câu 9: Caching strategies cho frontend app? `[Intermediate]`

### Câu hỏi

> Trình bày các caching strategies cho một frontend app. Có những lớp cache nào, mỗi lớp dùng cho loại resource gì, và những pitfall thường gặp?

### Giải thích lý thuyết

Caching trong frontend là **hệ thống nhiều lớp** — mỗi lớp giải quyết một bài toán khác nhau. Trả lời tốt là đi từ gần network nhất đến gần UI nhất:

**1. HTTP cache (browser cache)** — lớp nền tảng, điều khiển bằng response headers:

- `Cache-Control: max-age=31536000, immutable` cho **static assets có content hash trong tên file** (`app.a3f8b2.js`). Vì nội dung đổi → tên file đổi → URL mới, nên cache 1 năm an toàn tuyệt đối. Đây là pattern quan trọng nhất: **cache busting bằng content hash**.
- `Cache-Control: no-cache` + `ETag`/`Last-Modified` cho resource có thể đổi: browser vẫn cache nhưng phải **revalidate** với server (request kèm `If-None-Match`, server trả `304 Not Modified` nếu không đổi — tiết kiệm bandwidth, vẫn tốn round-trip).
- **Pitfall lớn nhất: đừng cache HTML** với `max-age` dài. HTML là entry point trỏ đến bundle có hash — nếu HTML bị cache cũ, user load bundle cũ mãi không nhận deploy mới. HTML nên `no-cache` (revalidate mỗi lần).

**2. CDN cache** — cache ở edge, gần user. Static assets (JS/CSS/images/fonts) đẩy hết lên CDN. Khi deploy, file mới có hash mới nên không cần purge; chỉ cần purge HTML/API response nếu CDN có cache chúng.

**3. Service Worker cache** — programmable cache, nền tảng của PWA/offline. Ba strategy chính:

- **Cache-first**: trả từ cache, không có mới ra network — cho assets bất biến.
- **Network-first**: thử network, fail thì fallback cache — cho API data cần tươi nhưng muốn offline fallback.
- **Stale-while-revalidate**: trả cache ngay lập tức (nhanh), đồng thời fetch nền để update cache cho lần sau — cân bằng tốt nhất cho đa số resource.

**4. In-memory cache của data library (TanStack Query / SWR)** — cache **server state** ở tầng application:

- `staleTime`: data còn "tươi" bao lâu — trong khoảng này không refetch.
- `gcTime`: giữ cache bao lâu sau khi không còn component nào dùng.
- **Invalidation**: sau mutation gọi `invalidateQueries` để đánh dấu stale và refetch. Đây là phần interviewer hay đào: cache mà không có chiến lược invalidation là cache hỏng.

**5. localStorage / IndexedDB persist** — cache sống qua reload/tab close. localStorage cho data nhỏ đồng bộ (theme, token metadata); IndexedDB cho data lớn, async (offline data, persist cache của TanStack Query qua `persistQueryClient`).

**Insight phỏng vấn**: framework trả lời là *đi theo vòng đời request* — request rời browser đi qua SW cache → HTTP cache → CDN → origin; còn data về thì sống trong memory cache → persist xuống IndexedDB. Nói được "lớp nào own loại resource nào" và pitfall cache HTML là điểm cộng lớn.

### Thiết kế minh hoạ

```text
        Request ──▶ [Service Worker] ──▶ [HTTP cache] ──▶ [CDN edge] ──▶ [Origin]
                      (programmable)      (Cache-Control)   (static)
        Data về  ──▶ [TanStack Query in-memory] ──▶ [IndexedDB persist]

   ┌─────────────────────────┬──────────────────────────────────────────────┐
   │ Loại resource           │ Lớp cache + strategy                         │
   ├─────────────────────────┼──────────────────────────────────────────────┤
   │ JS/CSS có content hash  │ HTTP: max-age=1y, immutable + CDN            │
   │ HTML (entry point)      │ no-cache + ETag — KHÔNG cache dài            │
   │ Images/fonts            │ CDN + SW cache-first                         │
   │ API data đọc nhiều      │ TanStack Query (staleTime) + SWR strategy    │
   │ API data realtime       │ Network-first / không cache                  │
   │ Offline data            │ IndexedDB + SW network-first fallback        │
   └─────────────────────────┴──────────────────────────────────────────────┘
```

```typescript
// 1. Service Worker: stale-while-revalidate cho assets
self.addEventListener("fetch", (event: FetchEvent) => {
  if (event.request.destination === "image") {
    event.respondWith(
      caches.open("img-v1").then(async (cache) => {
        const cached = await cache.match(event.request);
        // Fetch nền để update cache cho lần sau
        const networkFetch = fetch(event.request).then((res) => {
          cache.put(event.request, res.clone());
          return res;
        });
        return cached ?? networkFetch; // trả cache ngay nếu có
      })
    );
  }
});

// 2. TanStack Query: staleTime + invalidation sau mutation
const { data } = useQuery({
  queryKey: ["products", filters],
  queryFn: () => fetchProducts(filters),
  staleTime: 60_000, // 1 phút không refetch — giảm request trùng
});

const mutation = useMutation({
  mutationFn: updateProduct,
  onSuccess: () => {
    // Invalidation: đánh dấu stale → refetch — KHÔNG tự sửa cache bằng tay nếu không cần
    queryClient.invalidateQueries({ queryKey: ["products"] });
  },
});
```

### Đáp án mẫu

> "Em chia caching thành nhiều lớp theo vòng đời request. Lớp HTTP cache: static assets có content hash trong tên file thì em set `max-age` 1 năm kèm `immutable` — deploy mới ra tên file mới nên không bao giờ stale; còn HTML em tuyệt đối không cache dài, chỉ `no-cache` kèm ETag để revalidate, vì HTML là entry point trỏ đến bundle. Static assets đẩy lên CDN. Lớp Service Worker em dùng cho PWA/offline với ba strategy: cache-first cho assets bất biến, network-first cho data cần tươi, stale-while-revalidate cho phần còn lại. Lớp application em dùng TanStack Query: `staleTime` để giảm refetch trùng, và sau mutation thì `invalidateQueries` — cache không có chiến lược invalidation là cache hỏng. Data cần sống qua reload thì persist xuống IndexedDB. Pitfall em hay gặp nhất là team cache nhầm HTML làm user kẹt ở version cũ sau deploy."

---

## Câu 35: Thiết kế hệ thống upload file lớn từ browser? `[Advanced]`

### Câu hỏi

> Thiết kế hệ thống upload file lớn (hàng GB) từ browser: hỗ trợ resumable, nhiều file song song, có progress chính xác. Trình bày kiến trúc và trade-offs.

### Giải thích lý thuyết

**Bước 1 — Clarify requirements** (luôn làm trước khi design):

- File size: hàng GB → không thể upload một request duy nhất (timeout, fail là mất hết).
- **Resumable**: mất mạng/đóng tab giữa chừng phải tiếp tục được, không upload lại từ đầu.
- Nhiều file đồng thời, progress chính xác, integrity (file đến nơi không corrupt).

**Bước 2 — High-level: chunked upload.** Ý tưởng cốt lõi: dùng `File.slice()` cắt file thành **chunk 5–10MB**, upload từng chunk độc lập:

- Chunk fail → **retry chỉ chunk đó** (với exponential backoff), không mất cả file.
- Upload **song song nhưng giới hạn concurrency** (3–5 chunk cùng lúc): quá ít thì chậm, quá nhiều thì nghẽn băng thông và bị server rate limit. Implement bằng một promise pool đơn giản.
- Chunk size là trade-off: chunk nhỏ → retry rẻ, progress mịn, nhưng nhiều request overhead; chunk lớn → ngược lại. 5–10MB là sweet spot (và là minimum part size của S3 multipart).

**Bước 3 — Resumable.** Quy trình: client gọi `POST /uploads` khởi tạo session, server trả `uploadId`. Mỗi chunk upload kèm `uploadId + chunkIndex`. Khi resume (sau mất mạng/reload), client gọi `GET /uploads/:id/status` — **server trả danh sách chunk đã nhận**, client chỉ upload phần thiếu. Để resume sống qua reload, lưu `uploadId` + fingerprint file (name + size + lastModified) vào localStorage.

**Bước 4 — Presigned URL + S3 multipart (kiến trúc production).** Thay vì file đi qua application server (tốn bandwidth, server thành bottleneck), server chỉ làm **control plane**: tạo S3 multipart upload, cấp **presigned URL cho từng part** — browser upload **thẳng lên S3**. Upload xong client gửi danh sách ETag để server gọi `CompleteMultipartUpload`. Server không bao giờ chạm vào bytes của file.

**Bước 5 — Progress & integrity:**

- Progress tổng = `(bytes các chunk đã xong + loaded của chunk đang chạy) / tổng size`. Dùng `XMLHttpRequest.upload.onprogress` (fetch không có upload progress ổn định ở mọi browser).
- **Checksum**: tính hash từng chunk (SHA-256 qua `crypto.subtle`, hoặc CRC32) gửi kèm để server verify — phát hiện corrupt sớm ở mức chunk.

**Đừng tự viết từ đầu trong production**: nhắc đến **tus protocol** (chuẩn mở cho resumable upload) và **Uppy** (client library hỗ trợ tus + S3 multipart sẵn) là điểm cộng — chứng tỏ biết hệ sinh thái.

### Thiết kế minh hoạ

```text
   Browser                         API Server (control plane)        S3
   ┌──────────────┐   1. init      ┌─────────────────────┐
   │ File (4GB)   │ ─────────────▶ │ CreateMultipart     │ ────▶  uploadId
   │  slice 8MB   │ ◀───────────── │ + presigned URLs    │
   │ ┌──┬──┬──┐   │   2. upload    └─────────────────────┘
   │ │c1│c2│c3│...│ ══════════════════════ PUT chunk ═══════════▶ ┌────────┐
   │ └──┴──┴──┘   │   (song song, max 4, thẳng lên S3)            │ parts  │
   │              │   3. complete  ┌─────────────────────┐        └────────┘
   │ ETags[]      │ ─────────────▶ │ CompleteMultipart   │ ────▶  ghép file
   └──────────────┘                └─────────────────────┘
   Resume: GET /uploads/:id/status → server trả [c1✓, c2✓] → chỉ upload c3...
```

```typescript
const CHUNK_SIZE = 8 * 1024 * 1024; // 8MB
const MAX_CONCURRENCY = 4;

async function uploadFile(file: File, uploadId: string) {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  // Resume: hỏi server những chunk đã nhận
  const received: Set<number> = new Set(await fetchReceivedChunks(uploadId));
  const pending = Array.from({ length: totalChunks }, (_, i) => i)
    .filter((i) => !received.has(i)); // chỉ upload phần thiếu

  const uploadedBytes = { value: received.size * CHUNK_SIZE };

  // Promise pool: giới hạn concurrency
  const workers = Array.from({ length: MAX_CONCURRENCY }, async () => {
    while (pending.length > 0) {
      const index = pending.shift()!;
      const chunk = file.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE);
      await uploadChunkWithRetry(uploadId, index, chunk, 3); // retry từng chunk
      uploadedBytes.value += chunk.size;
      reportProgress(uploadedBytes.value / file.size); // progress tổng
    }
  });
  await Promise.all(workers);
  await completeUpload(uploadId); // server gọi CompleteMultipartUpload
}

async function uploadChunkWithRetry(
  uploadId: string, index: number, chunk: Blob, retries: number
): Promise<void> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const checksum = await sha256(chunk); // integrity từng chunk
      return await putChunk(uploadId, index, chunk, checksum);
    } catch (error) {
      if (attempt === retries) throw error;
      // Exponential backoff: 1s, 2s, 4s...
      await sleep(2 ** attempt * 1000);
    }
  }
}
```

### Đáp án mẫu

> "Đầu tiên em clarify: file hàng GB nên không thể upload một request — timeout là mất hết. Core design của em là chunked upload: dùng `File.slice` cắt thành chunk 8MB, upload song song với promise pool giới hạn 4 concurrent, mỗi chunk retry độc lập với exponential backoff. Resumable thì server lưu danh sách chunk đã nhận theo `uploadId`; khi resume client hỏi status rồi chỉ upload phần thiếu — em lưu `uploadId` kèm fingerprint file vào localStorage để sống qua reload. Production em không cho file đi qua app server mà dùng S3 multipart với presigned URL từng part — browser upload thẳng S3, server chỉ là control plane cấp URL và gọi complete. Progress tính theo tổng bytes uploaded, integrity thì checksum từng chunk. Thực tế em sẽ cân nhắc tus protocol với Uppy thay vì tự viết, vì họ đã giải các edge case này rồi."

---

## Câu 36: Thiết kế hệ thống chat real-time — góc nhìn frontend? `[Advanced]`

### Câu hỏi

> Thiết kế frontend cho một hệ thống chat real-time (như Slack/Messenger): connection management, optimistic UI, ordering, lịch sử message, offline. Trình bày kiến trúc và trade-offs.

### Giải thích lý thuyết

**Requirements**: nhận message real-time độ trễ thấp, gửi message cảm giác tức thì, sống sót qua mất mạng (mobile network), load lịch sử hàng nghìn message mượt, typing indicator, hoạt động offline cơ bản.

**1. WebSocket client — phần khó nhất là connection lifecycle, không phải happy path:**

- **Reconnect với exponential backoff + jitter**: mất kết nối thì retry 1s, 2s, 4s... cộng random jitter. Jitter rất quan trọng: server restart làm hàng nghìn client mất kết nối cùng lúc — không có jitter thì tất cả reconnect đồng loạt tạo **thundering herd** đánh sập server lần nữa.
- **Heartbeat (ping/pong)**: TCP có thể chết im lặng (mobile đổi mạng) mà `onclose` không fire. Client gửi ping mỗi 30s, không nhận pong trong timeout → coi connection chết, chủ động close và reconnect.
- **Resume sau reconnect**: client lưu `lastMessageId` đã nhận; khi reconnect gửi kèm ID này, server trả các **missed messages** trong khoảng mất kết nối — không thì có gap trong conversation. Đây là điểm interviewer hay đào nhất.

**2. Optimistic UI cho việc gửi:** render message **ngay lập tức** với `clientId` tự sinh và status `sending`. Server ack → update thành `sent` (map bằng `clientId`). Fail/timeout → status `failed` kèm nút retry. Trade-off: UI phức tạp hơn (phải xử lý reconciliation) nhưng UX tức thì — chat mà chờ round-trip mới hiện message là không chấp nhận được.

**3. Message ordering:** đồng hồ client không tin được (lệch giờ, timezone) → sắp xếp theo **server timestamp hoặc sequence number do server cấp**. Optimistic message tạm dùng client time, khi ack thì thay bằng server time và re-sort — có thể message "nhảy" vị trí nhẹ, chấp nhận được.

**4. Lịch sử — cursor-based pagination load ngược:** mở conversation load 30 message mới nhất, scroll lên đỉnh thì load trang cũ hơn với cursor = ID message cũ nhất đang có. Không dùng offset vì message mới liên tục chèn vào làm offset lệch (duplicate/missing). Lưu ý UX: sau khi prepend trang cũ phải **giữ nguyên vị trí scroll** (đo `scrollHeight` trước/sau).

**5. Virtualized list:** conversation hàng nghìn message mà render hết là DOM phình, scroll giật. Dùng react-virtuoso (xử lý tốt dynamic height + reverse scroll — bài toán khó hơn list thường vì anchor ở đáy).

**6. Phụ trợ:** typing indicator **debounce/throttle** (gõ liên tục chỉ gửi event mỗi 2–3s, kèm TTL tự tắt); **offline queue** — gửi khi offline thì message vào queue (persist IndexedDB), `online` event hoặc reconnect thành công thì flush queue theo thứ tự.

**Insight phỏng vấn**: đa số candidate chỉ nói "dùng WebSocket". Người senior nói về **những lúc WebSocket chết**: backoff + jitter, heartbeat, resume với lastMessageId — đó mới là phần ăn điểm.

### Thiết kế minh hoạ

```text
   ┌────────────────────────── Frontend ──────────────────────────┐
   │  [WS Manager]──reconnect(backoff+jitter)──heartbeat──resume   │
   │       │ incoming                  ▲ outgoing                  │
   │       ▼                           │                           │
   │  [Message Store] ◀── optimistic insert ── [Composer]          │
   │   sort by server seq              │ offline? → [Queue/IDB]    │
   │       ▼                           │                           │
   │  [Virtualized List] ── scroll top → cursor pagination (cũ hơn)│
   └───────────────────────────────────────────────────────────────┘
   Message status: sending ──ack──▶ sent        ──fail──▶ failed (retry)
```

```typescript
class ChatSocket {
  private attempt = 0;
  private lastMessageId: string | null = null;

  connect() {
    this.ws = new WebSocket(`${WS_URL}?resumeFrom=${this.lastMessageId ?? ""}`);
    this.ws.onopen = () => { this.attempt = 0; this.startHeartbeat(); };
    this.ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      this.lastMessageId = msg.id; // dùng để resume — nhận missed messages
      store.upsertMessage(msg);
    };
    this.ws.onclose = () => this.scheduleReconnect();
  }

  private scheduleReconnect() {
    // Exponential backoff + jitter — tránh thundering herd
    const base = Math.min(1000 * 2 ** this.attempt, 30_000);
    const delay = base + Math.random() * 1000;
    this.attempt++;
    setTimeout(() => this.connect(), delay);
  }

  private startHeartbeat() {
    // Ping mỗi 30s — không có pong trong 10s thì coi connection chết
    this.pingTimer = setInterval(() => {
      this.ws.send(JSON.stringify({ type: "ping" }));
      this.pongTimeout = setTimeout(() => this.ws.close(), 10_000);
    }, 30_000);
  }
}

// Optimistic send: hiện ngay với status "sending"
function sendMessage(text: string) {
  const clientId = crypto.randomUUID();
  store.addMessage({ clientId, text, status: "sending", ts: Date.now() });
  if (!navigator.onLine) return offlineQueue.push({ clientId, text }); // offline queue

  socket.send({ type: "message", clientId, text });
  // Server ack { clientId, id, serverTs } → update status "sent",
  // thay client time bằng server time rồi re-sort theo server sequence
}
```

### Đáp án mẫu

> "Phần khó nhất của chat frontend không phải happy path mà là connection lifecycle, nên em bắt đầu từ đó. WebSocket client của em reconnect với exponential backoff cộng jitter — jitter để tránh thundering herd khi server restart làm vạn client reconnect cùng lúc. Em thêm heartbeat ping/pong vì TCP có thể chết im lặng trên mobile mà onclose không fire. Khi reconnect, client gửi lastMessageId để server trả missed messages — không thì conversation bị gap. Gửi message thì optimistic UI: hiện ngay với status sending, server ack thì thành sent, fail thì hiện retry; ordering em tin server timestamp chứ không tin đồng hồ client. Lịch sử em load bằng cursor-based pagination ngược, render qua virtualized list vì hàng nghìn message mà render hết là DOM phình. Typing indicator em throttle, và có offline queue persist IndexedDB, flush khi online lại."

---

## Câu 37: Thiết kế infinite scroll feed (như Facebook/Twitter)? `[Advanced]`

### Câu hỏi

> Thiết kế một infinite scroll feed như Facebook/Twitter: load trigger, pagination, virtualization, scroll restoration, xử lý content mới. Trình bày kiến trúc và trade-offs.

### Giải thích lý thuyết

**Requirements**: scroll vô hạn mượt 60fps, feed thay đổi liên tục (bài mới chèn lên đầu), navigate sang detail rồi back phải về đúng vị trí, media nặng, hàng nghìn item.

**1. Load trigger — IntersectionObserver, không phải scroll event.** Đặt một **sentinel element** ở cuối list; observer fire khi sentinel vào viewport → load trang sau. Ưu điểm so với `onscroll`: chạy ngoài main thread hot path, không cần throttle, không gây layout thrashing do đọc `scrollTop`/`offsetHeight` liên tục. Set `rootMargin: "800px"` để **prefetch trước khi user chạm đáy** — user không bao giờ thấy đáy feed.

**2. Cursor-based pagination — và tại sao offset hỏng.** Với `?offset=20&limit=20`: nếu giữa hai lần fetch có 3 bài mới chèn lên đầu, mọi item dịch xuống 3 vị trí → trang sau bị **duplicate 3 bài** (hoặc miss nếu có bài bị xóa). Feed thay đổi liên tục nên offset hỏng gần như chắc chắn. Cursor-based: `?cursor=<id/timestamp của item cuối>&limit=20` — "lấy 20 bài cũ hơn bài này", ổn định bất kể đầu feed thay đổi thế nào.

**3. Virtualization — DOM không được phình.** Scroll 1000 bài mà giữ 1000 node (mỗi bài là cây DOM phức tạp + ảnh) là memory tăng vô hạn, scroll giật. Chỉ render item trong viewport + overscan buffer, phần còn lại là khoảng trống có chiều cao tương ứng. Feed có **dynamic height** (text ngắn/dài, ảnh) nên dùng react-virtuoso hoặc `@tanstack/react-virtual` với dynamic measurement, không dùng react-window fixed-size.

**4. Scroll restoration khi navigate đi và quay lại.** Bấm vào bài → trang detail → back: nếu feed bị unmount mất data thì user về đầu trang — UX phá sản. Giải pháp: **cache feed data** (TanStack Query với `staleTime` hợp lý — back thì đọc cache, không refetch ngay) + **lưu scroll position / index item đầu viewport** vào sessionStorage hoặc in-memory store theo location key, restore khi mount lại. Với virtualization thì restore theo `initialTopMostItemIndex` ổn hơn pixel offset.

**5. New items — banner thay vì tự chèn.** Feed đang đọc mà bài mới tự chèn lên đầu làm **nội dung nhảy** (layout shift) — tội UX nặng. Pattern chuẩn: bài mới giữ trong buffer, hiện banner "5 bài viết mới" ở đỉnh; user bấm mới merge vào feed và scroll lên. Twitter/Facebook đều làm vậy.

**6. Media & loading**: ảnh `loading="lazy"` + đặt sẵn `width/height` hoặc `aspect-ratio` để **giữ chỗ tránh CLS**; skeleton loading cho trang mới thay vì spinner (giữ layout ổn định); video chỉ play khi vào viewport (cũng bằng IntersectionObserver).

**Insight phỏng vấn**: hai câu đào sâu kinh điển là *"tại sao không dùng offset?"* và *"user back lại thì sao?"* — chuẩn bị kỹ hai câu này. Nói thêm trade-off của virtualization (mất Ctrl+F của browser, SEO cần SSR trang đầu) là điểm cộng.

### Thiết kế minh hoạ

```text
   ┌─ Viewport ──────────────┐      Feed data (TanStack Query infinite)
   │  [Post 41]              │      pages: [p1, p2, p3...] — cursor-based
   │  [Post 42]  ◀── chỉ     │
   │  [Post 43]      render  │      "5 bài mới" ─▶ buffer, KHÔNG tự chèn
   │  [Post 44]      vùng    │       (banner, bấm mới merge — tránh nhảy scroll)
   ├─────────────────────────┤
   │  overscan (buffer)      │      Back navigation:
   │  ...khoảng trống ảo...  │      cache data + restore topMostItemIndex
   │  [sentinel] ◀── IO,     │
   └───  rootMargin 800px ───┘      → prefetch trang sau trước khi chạm đáy
```

```tsx
function Feed() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["feed"],
      queryFn: ({ pageParam }) => fetchFeed({ cursor: pageParam, limit: 20 }),
      initialPageParam: null as string | null,
      // Cursor-based: server trả nextCursor = id bài cũ nhất của trang
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: 5 * 60_000, // back lại đọc cache — không refetch làm mất vị trí
    });

  const posts = data?.pages.flatMap((p) => p.items) ?? [];

  // Sentinel với IntersectionObserver — prefetch trước khi chạm đáy
  const sentinelRef = useIntersection(
    () => hasNextPage && !isFetchingNextPage && fetchNextPage(),
    { rootMargin: "800px" }
  );

  return (
    <>
      <NewItemsBanner /> {/* "X bài mới" — bấm mới merge vào feed */}
      <Virtuoso
        data={posts}
        // Restore vị trí khi back (đã lưu vào sessionStorage khi rời trang)
        initialTopMostItemIndex={restoreScrollIndex("feed")}
        itemContent={(_, post) => <PostCard post={post} />}
        components={{
          Footer: () => <div ref={sentinelRef}>{isFetchingNextPage && <Skeleton />}</div>,
        }}
      />
    </>
  );
}

// PostCard: media giữ chỗ tránh layout shift
const PostCard = ({ post }: { post: Post }) => (
  <article>
    <p>{post.text}</p>
    {post.image && (
      // width/height đặt sẵn → browser giữ chỗ, lazy load khi gần viewport
      <img src={post.image.url} width={post.image.w} height={post.image.h} loading="lazy" />
    )}
  </article>
);
```

### Đáp án mẫu

> "Em thiết kế quanh bốn vấn đề chính. Load trigger em dùng IntersectionObserver với sentinel ở cuối list thay vì scroll event — không tốn main thread, và set rootMargin 800px để prefetch trước khi user chạm đáy. Pagination bắt buộc cursor-based: feed có bài mới chèn lên đầu liên tục nên offset sẽ trả duplicate — cursor 'lấy 20 bài cũ hơn id này' thì ổn định. Rendering em dùng virtualization với react-virtuoso vì item dynamic height — hàng nghìn bài mà giữ hết DOM là scroll giật, memory phình. Navigate sang detail rồi back, em cache feed data bằng TanStack Query và lưu index item đầu viewport để restore đúng vị trí — đây là chỗ nhiều app làm hỏng. Bài mới em không tự chèn vào feed vì làm nhảy scroll, mà hiện banner 'X bài mới' như Twitter. Cuối cùng ảnh đặt sẵn aspect-ratio để lazy load không gây layout shift, và dùng skeleton thay spinner."

---

## Câu 38: Thiết kế form builder (drag & drop)? `[Advanced]`

### Câu hỏi

> Thiết kế một form builder dạng drag & drop (như Google Forms/Typeform builder): data model, render engine, state management, undo/redo, validation. Trình bày kiến trúc và trade-offs.

### Giải thích lý thuyết

**Requirements**: kéo thả field từ palette vào canvas, reorder, sửa config từng field, conditional logic ("hiện field B nếu A = x"), undo/redo, lưu form lên backend, và render lại form cho end-user điền.

**1. Data model — schema JSON là trái tim của hệ thống.** Form là **một cây các field node**: `{ id, type, label, validation, conditional, children? }`. Schema là **single source of truth**: builder chỉnh sửa schema, preview render từ schema, submission validate theo schema. Mọi thứ khác là derived. Field `type` là string key (`"text"`, `"select"`, `"section"`...) — section/group có `children` tạo cấu trúc cây.

**2. Render engine — registry pattern + đệ quy.** Một **registry map `type → component`**: render engine duyệt schema, gặp node thì tra registry lấy component, gặp `children` thì đệ quy. Lợi ích: thêm field type mới chỉ là thêm entry vào registry — **open/closed**, không sửa engine. Engine nhận prop `mode`: cùng một schema render ra **ba mode** — `builder` (có drag handle, nút xóa, click để chọn), `preview` (form thật nhưng không submit), `submission` (form thật cho end-user, chạy validation).

**3. State — normalized store, không nested.** Đây là quyết định quan trọng nhất và interviewer hay đào: **không lưu state dạng cây nested** mà normalize thành `entities: Record<id, FieldNode>` + `order/children: id[]`. Lý do: update một field sâu trong cây nested phải clone cả path (tốn, dễ sai); reorder trong nested phải đụng nhiều nhánh; còn normalized thì update field = thay một entry, reorder = thay một mảng id, và component subscribe theo `id` nên **chỉ field đó re-render**. Cây nested chỉ được **derive ra khi render/serialize**.

**4. Drag & drop — dnd-kit.** Hai loại tương tác: kéo từ **palette** vào canvas (tạo node mới tại drop index) và **reorder** trong canvas (`SortableContext` — chỉ là di chuyển id trong mảng `order`, rất rẻ nhờ normalized state). Drag overlay/preview để UX rõ ràng; drop zone giữa các field có placeholder.

**5. Undo/redo — hai hướng:**

- **Command pattern**: mỗi thao tác là command có `do/undo` (AddField/MoveField/UpdateField), push vào stack. Chính xác, semantic, nhưng phải viết undo cho từng loại thao tác.
- **Immer patches**: `produceWithPatches` cho patches + inversePatches tự động cho *mọi* mutation — ít code hơn nhiều. Trade-off: history là diff thô, không có semantic ("undo cái gì?"). Với builder nhiều loại thao tác, **immer patches thực dụng hơn**; nhớ batch các thao tác liên tục (gõ label) thành một history entry.

**6. Validation, persistence, versioning:** validation là **rule engine khai báo trong schema** (`{ type: "minLength", value: 3, message }`) — submission mode dịch rules thành validate function (hoặc build Zod schema động). Conditional logic cũng khai báo: `{ when: fieldId, operator: "eq", value }`. Lưu backend: serialize schema JSON kèm **`version`** — schema format sẽ tiến hóa, cần migration function `v1 → v2` để form cũ vẫn mở được; đồng thời form đã publish nên snapshot version để submission cũ không vỡ khi form sửa tiếp.

**Insight phỏng vấn**: ba điểm ăn điểm nhất là *normalized state (giải thích được tại sao)*, *registry pattern cho extensibility*, và *schema versioning* — đa số candidate quên hẳn chuyện schema sẽ thay đổi format theo thời gian.

### Thiết kế minh hoạ

```text
   [Palette]──drag──▶ ┌── Canvas (builder mode) ──┐   ┌─ Config Panel ─┐
    text               │ ☰ [Họ tên     ] ✎ ✕      │   │ label, required │
    select             │ ☰ [Email      ] ✎ ✕      │◀─▶│ validation rules│
    section            │ ☰ ▸ Section ──┐          │   │ conditional     │
                       │   └ [Tuổi]    │ (đệ quy) │   └─────────────────┘
                       └───────────────────────────┘
   Schema JSON (source of truth) ──▶ render engine ──▶ builder | preview | submission
   Normalized store: entities{id→node} + order[id]    Undo/redo: immer patches stack
```

```typescript
// ===== 1. Data model: schema = cây field node =====
interface FieldNode {
  id: string;
  type: "text" | "select" | "checkbox" | "section"; // key tra registry
  label: string;
  validation: ValidationRule[];          // rule engine khai báo
  conditional?: { when: string; operator: "eq" | "neq"; value: unknown };
  children?: string[];                   // section chứa id con (normalized)
}

// ===== 2. Normalized store — KHÔNG nested =====
interface BuilderState {
  entities: Record<string, FieldNode>;   // tra cứu O(1), update 1 entry
  rootOrder: string[];                   // reorder = thay 1 mảng id
  selectedId: string | null;
}

// Update field: chỉ thay một entry — immutable, không clone cả cây
const updateField = (state: BuilderState, id: string, patch: Partial<FieldNode>): BuilderState => ({
  ...state,
  entities: { ...state.entities, [id]: { ...state.entities[id], ...patch } },
});

// ===== 3. Render engine: registry + đệ quy =====
const registry: Record<FieldNode["type"], React.FC<FieldProps>> = {
  text: TextField,
  select: SelectField,
  checkbox: CheckboxField,
  section: SectionField, // section tự đệ quy render children
};

function RenderNode({ id, mode }: { id: string; mode: "builder" | "preview" | "submission" }) {
  const node = useBuilderStore((s) => s.entities[id]); // subscribe theo id → re-render tối thiểu
  if (mode === "submission" && !evaluateCondition(node.conditional)) return null;

  const Component = registry[node.type]; // thêm field type mới = thêm entry registry
  return (
    <FieldChrome mode={mode} id={id}>   {/* builder mode: drag handle, nút xóa */}
      <Component node={node} mode={mode} />
      {node.children?.map((childId) => (
        <RenderNode key={childId} id={childId} mode={mode} /> // đệ quy
      ))}
    </FieldChrome>
  );
}

// ===== 4. Undo/redo bằng immer patches =====
import { produceWithPatches, applyPatches, type Patch } from "immer";

function dispatch(recipe: (draft: BuilderState) => void) {
  const [next, patches, inverse] = produceWithPatches(store.state, recipe);
  history.push({ patches, inverse }); // inverse patches = undo tự động
  redoStack.length = 0;
  store.setState(next);
}
const undo = () => {
  const entry = history.pop();
  if (entry) store.setState(applyPatches(store.state, entry.inverse));
};
```

### Đáp án mẫu

> "Trái tim của form builder là schema JSON — một cây field node gồm id, type, label, validation rules và conditional logic. Schema là single source of truth: builder sửa schema, còn render engine dùng registry pattern map type sang component rồi đệ quy render — thêm field type mới chỉ là thêm entry registry, không sửa engine. Cùng một schema render ba mode: builder, preview và submission. State em normalize thành entities map cộng mảng order chứ không lưu nested — vì update field sâu trong cây nested phải clone cả path, còn normalized thì update là thay một entry, reorder chỉ là đổi mảng id, và component subscribe theo id nên re-render tối thiểu. Drag & drop em dùng dnd-kit. Undo/redo em chọn immer patches thay vì command pattern vì inverse patches tự động cho mọi thao tác, ít code hơn. Cuối cùng schema serialize lưu backend kèm version — format sẽ tiến hóa nên cần migration để form cũ vẫn mở được."

---

## Bẫy thường gặp khi trả lời

| Bẫy | Tại sao mất điểm | Cách tránh |
| --- | --- | --- |
| Nhảy thẳng vào solution, không clarify requirements | System design chấm framework tư duy trước nội dung | Luôn mở đầu: requirements → high-level → deep dive → trade-offs |
| Caching: chỉ nói "dùng cache" chung chung, cache cả HTML | Không phân biệt được các lớp cache và pitfall thực tế | Đi theo lớp: HTTP (hash + immutable) → CDN → SW → in-memory → persist; HTML luôn `no-cache` |
| Upload: cho file GB đi qua application server | Server thành bottleneck bandwidth — thiếu kinh nghiệm production | Presigned URL + S3 multipart, server chỉ là control plane |
| Chat: chỉ nói "dùng WebSocket", bỏ qua lúc connection chết | Happy path ai cũng nói được | Backoff + jitter, heartbeat, resume với lastMessageId — đây mới là phần ăn điểm |
| Feed: dùng offset pagination | Feed thay đổi liên tục → duplicate/missing items | Cursor-based, và giải thích được *tại sao* offset hỏng |
| Feed: quên scroll restoration khi user back lại | Đây là câu follow-up gần như chắc chắn | Cache data + lưu index item đầu viewport, restore khi mount |
| Form builder: lưu state dạng cây nested | Update/reorder tốn kém, re-render lan rộng | Normalized store (entities + order), derive cây khi render |
| Form builder: quên schema versioning | Schema format sẽ đổi, form cũ vỡ | Lưu `version` kèm schema + migration function |
| Không nói trade-offs, chỉ kể một solution duy nhất | Senior được chấm ở khả năng cân nhắc lựa chọn | Mỗi quyết định nêu ít nhất 1 alternative và lý do chọn/bỏ |
| Tự viết mọi thứ từ đầu, không nhắc thư viện chuẩn | Production không ai tự viết resumable upload/virtual list | Nhắc tus/Uppy, react-virtuoso, dnd-kit, TanStack Query đúng chỗ |
