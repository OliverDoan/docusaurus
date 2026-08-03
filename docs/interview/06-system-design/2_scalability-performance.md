---
sidebar_position: 2
title: "2. Scalability & Performance"
---

# Scalability & Performance

> *Hỏi về scale là cách interviewer test bạn có suy nghĩ "nhiều user, nhiều data" hay không. Câu trả lời thực sự cần ví dụ và con số.*

:::note[Ghi nhớ nhanh]

- ⭐ **`Virtualization` cho list lớn** — chỉ render viewport (`@tanstack/react-virtual`) + `useInfiniteQuery` + `React.memo` + lazy nested; 10k post nhưng DOM chỉ ~30 node.
- ⭐ **`Optimistic UI` cần đường rollback** — `useMutation` với `onMutate` (snapshot + setQueryData), `onError` (rollback), `onSettled` (invalidate sync server total/discount).
- **Real-time collab dùng `CRDT` (Yjs) hơn `OT`** — state tự converge, `WebSocket` sync, `Awareness` cho presence; managed như Liveblocks cho POC.
- **`Offline-first`: Service Worker + IndexedDB + sync queue** — local-first save, retry với exponential backoff, Background Sync API.
- **`A/B testing` assign ở server (middleware + cookie)** — tránh hydration mismatch; outsource phân tích cho GrowthBook/Statsig.
- **Design system scale: `token-based theming` + `composition over configuration`** — CSS variable override per product, Slot pattern, versioning bằng changesets + codemod.

:::

---

## Câu 1: Design Facebook News Feed scrolling `[Senior]`

### Câu hỏi

> Em thiết kế component News Feed scroll infinite với 10k+ post. UI yêu cầu: smooth scroll, không lag, comment section expand được trong từng post. Em làm gì?

### Giải thích lý thuyết

Vấn đề:
- Render 10k DOM node → slow scroll, drain RAM.
- Mỗi post có image, video, comment thread — paint cost cao.
- User scroll xuống → load thêm data — race condition, dedupe.
- Expand comment trong 1 post không nên re-render toàn feed.

Solution stack:
- **Virtualization** với `@tanstack/react-virtual` — render chỉ visible viewport.
- **`useInfiniteQuery`** từ TanStack Query — pagination + dedupe.
- **IntersectionObserver** sentinel để trigger load next page.
- **React.memo** cho post item — không re-render khi sibling đổi.
- **Lazy image** với `loading="lazy"` và `next/image`.
- **Code-split** comment section (modal hoặc inline với dynamic import).

### Code minh hoạ

```jsx
import { useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, useEffect, memo } from "react";

function NewsFeed() {
  const parentRef = useRef(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam = 0 }) => fetchFeed({ offset: pageParam, limit: 20 }),
    getNextPageParam: (last) => last.nextOffset,
    initialPageParam: 0,
  });

  const posts = data?.pages.flatMap((p) => p.items) ?? [];

  const virtualizer = useVirtualizer({
    count: hasNextPage ? posts.length + 1 : posts.length, // +1 for loader
    getScrollElement: () => parentRef.current,
    estimateSize: (i) => (posts[i]?.hasImage ? 600 : 400), // estimate per post
    overscan: 5,
  });

  // Load more khi cuối list visible
  useEffect(() => {
    const lastItem = virtualizer.getVirtualItems().at(-1);
    if (!lastItem) return;
    if (lastItem.index >= posts.length - 1 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [virtualizer.getVirtualItems(), hasNextPage, isFetchingNextPage]);

  return (
    <div ref={parentRef} style={{ height: "100vh", overflow: "auto" }}>
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const post = posts[virtualRow.index];
          const isLoader = !post;

          return (
            <div
              key={virtualRow.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement} // measure thực tế
            >
              {isLoader ? <Loader /> : <PostItem post={post} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Memo post item — chỉ re-render khi post thay đổi
const PostItem = memo(function PostItem({ post }) {
  return (
    <article className="post">
      <PostHeader user={post.user} />
      {post.image && (
        <Image src={post.image} width={600} height={400} alt="" loading="lazy" />
      )}
      <PostContent text={post.text} />
      <PostActions postId={post.id} likes={post.likes} />
      <CommentSection postId={post.id} count={post.commentCount} />
    </article>
  );
}, (prev, next) => prev.post.id === next.post.id && prev.post.updatedAt === next.post.updatedAt);

// Comment section lazy
function CommentSection({ postId, count }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <button onClick={() => setExpanded(true)}>
        Xem {count} bình luận
      </button>
      {expanded && <CommentsLazy postId={postId} />}
    </>
  );
}

const CommentsLazy = dynamic(() => import("./Comments"), {
  loading: () => <CommentsSkeleton />,
});
```

### Đáp án mẫu

> "Em design với 4 layer optimization. **Layer 1 — Virtualization** với `@tanstack/react-virtual`: chỉ render ~20-30 post trong viewport, dù feed có 10k post DOM chỉ chứa visible. Dùng `measureElement` để chính xác height variable (post có image cao hơn post text-only). **Layer 2 — Infinite query** với TanStack Query: `useInfiniteQuery` + IntersectionObserver sentinel ở cuối list trigger `fetchNextPage`. Pagination dedupe + cache built-in. **Layer 3 — Memoization**: `React.memo` post item với custom equality `post.id + post.updatedAt` — sibling re-render không kéo theo. **Layer 4 — Lazy load nested**: comment section thì collapsed default, click expand mới render. Image dùng `next/image` với `loading='lazy'`. Bonus: prefetch next page khi user scroll qua 70% — UX feel instant. Performance metric: với 10k post + scroll continuous, DOM node ~30 thay vì 10k, memory dưới 100MB. INP dưới 100ms vì re-render scope nhỏ. Em từng triển khai pattern này cho dashboard 50k row, hoạt động smooth trên cả phone Android cũ."

---

## Câu 2: Optimistic UI cho cart shopping `[Senior]`

### Câu hỏi

> User click "Add to cart". Cart count update instant ở header. Nếu server fail thì sao? Em xử lý thế nào?

### Giải thích lý thuyết

Optimistic UI flow:
1. Update UI ngay (assume success).
2. Fire request.
3. Success → giữ UI, có thể sync với data thật từ server.
4. Fail → rollback UI + show error.

Edge cases:
- User add nhiều item liên tiếp (race condition).
- User navigate đi trước khi response về.
- Cart total tính client vs server có thể khác (discount, tax) → sync sau success.

### Code minh hoạ

```typescript
// Với TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

function AddToCartButton({ product }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ productId, qty }) => api.addToCart({ productId, qty }),

    onMutate: async ({ productId, qty }) => {
      // Cancel pending queries
      await queryClient.cancelQueries({ queryKey: ["cart"] });

      // Snapshot previous
      const previous = queryClient.getQueryData(["cart"]);

      // Optimistic update
      queryClient.setQueryData(["cart"], (old: Cart) => ({
        ...old,
        items: [...old.items, { productId, qty, optimistic: true }],
        total: old.total + product.price * qty,
      }));

      return { previous };
    },

    onError: (err, vars, context) => {
      // Rollback
      queryClient.setQueryData(["cart"], context.previous);
      toast.error("Không thêm được vào giỏ. Thử lại?");
    },

    onSettled: () => {
      // Refetch để sync với server (đặc biệt total, discount)
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  return (
    <button
      onClick={() => mutation.mutate({ productId: product.id, qty: 1 })}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? "Đang thêm..." : "Thêm vào giỏ"}
    </button>
  );
}

// React 19: useOptimistic
function CartHeader() {
  const { data: cart } = useQuery({ queryKey: ["cart"], queryFn: fetchCart });
  const [optimisticCount, addOptimisticItem] = useOptimistic(
    cart?.itemCount ?? 0,
    (current) => current + 1
  );

  return (
    <button>
      Cart ({optimisticCount})
    </button>
  );
}

// Race condition: spam click
// Pattern: queue/debounce
function AddToCartDebounced() {
  const pendingRef = useRef<Map<string, number>>(new Map());

  const flush = useDebouncedCallback(async () => {
    const updates = Array.from(pendingRef.current);
    pendingRef.current.clear();
    await api.batchAddToCart(updates);
  }, 500);

  const add = (productId: string) => {
    pendingRef.current.set(productId, (pendingRef.current.get(productId) ?? 0) + 1);
    flush();
  };
}

// Offline support: persist cart vào localStorage + sync khi online
import { persistQueryClient } from "@tanstack/react-query-persist-client";

persistQueryClient({
  queryClient,
  persister: createSyncStoragePersister({ storage: window.localStorage }),
});

// Navigator online event để sync
useEffect(() => {
  const handler = () => queryClient.invalidateQueries();
  window.addEventListener("online", handler);
  return () => window.removeEventListener("online", handler);
}, []);
```

### Đáp án mẫu

> "Em dùng `useMutation` của TanStack Query với 4 callbacks: **onMutate** snapshot cart hiện tại + setQueryData optimistic (cart count + 1, total + price). Quan trọng: `cancelQueries` trước update để pending fetch không overwrite optimistic. **onError**: rollback bằng snapshot, show toast. **onSettled** (chạy cả success và fail): invalidate cart query → refetch sync với server — quan trọng vì server có thể tính discount/tax khác client. Edge case em handle: **spam click** — disable button khi pending, hoặc batch debounce 500ms gửi nhiều add cùng lúc. **Race condition**: nhiều mutation đồng thời — TanStack Query có `mutationKey` để serialize, hoặc dùng `useMutation` với optimistic update phải maintain queue. **Navigate đi giữa chừng**: mutation tiếp tục background, toast notify khi xong. **Offline**: persist query state vào localStorage, sync khi `window.online`. React 19 có `useOptimistic` API gọn hơn — sẽ dùng khi compatible. Pattern này em đã ship cho 2 e-commerce, conversion rate tăng vì UI responsive hơn rõ."

---

## Câu 3: Real-time collaboration — design như Figma `[Senior]`

### Câu hỏi

> Em design feature "multiple user edit document đồng thời" như Figma/Google Docs. Cần xử lý gì?

### Giải thích lý thuyết

Concepts:
- **CRDT** (Conflict-free Replicated Data Type) hoặc **OT** (Operational Transformation).
- **WebSocket** connection để sync real-time.
- **Presence** (cursor, selection của user khác).
- **Offline + sync** khi online.
- **Conflict resolution** — last-write-wins, merge, version vector.

Libraries:
- **Yjs** — CRDT mature, work với Tiptap, Slate, ProseMirror.
- **Liveblocks** — managed service, hide complexity.
- **Y-Sweet** — Cloudflare-based.
- **Replicache** — sync engine với conflict resolution.

### Code minh hoạ

```javascript
// Yjs với React
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { useYjsAwareness, useYjsValue } from "@y-sweet/react";

function CollaborativeEditor({ docId }) {
  const ydoc = new Y.Doc();
  const provider = new WebsocketProvider("wss://ws.example.com", docId, ydoc);
  const yText = ydoc.getText("content");

  // Sync với React state
  const [content, setContent] = useState(yText.toString());

  useEffect(() => {
    const handler = () => setContent(yText.toString());
    yText.observe(handler);
    return () => yText.unobserve(handler);
  }, []);

  const handleChange = (newContent) => {
    yText.delete(0, yText.length);
    yText.insert(0, newContent);
  };

  return <textarea value={content} onChange={(e) => handleChange(e.target.value)} />;
}

// Presence — cursor của user khác
function Cursor({ user }) {
  return (
    <div style={{ position: "absolute", left: user.x, top: user.y, color: user.color }}>
      <CursorIcon />
      <span>{user.name}</span>
    </div>
  );
}

function Presence({ awareness }) {
  const [states, setStates] = useState([]);

  useEffect(() => {
    const handler = () => setStates(Array.from(awareness.getStates().values()));
    awareness.on("change", handler);
    return () => awareness.off("change", handler);
  }, [awareness]);

  // Update own cursor
  useEffect(() => {
    const move = (e) => {
      awareness.setLocalStateField("cursor", { x: e.clientX, y: e.clientY });
    };
    document.addEventListener("mousemove", move);
    return () => document.removeEventListener("mousemove", move);
  }, [awareness]);

  return states.map((s) => <Cursor key={s.user.id} user={s} />);
}

// Liveblocks (managed) — đơn giản hơn nhiều
import { LiveblocksProvider, RoomProvider, useStorage, useMutation } from "@liveblocks/react";

function Editor() {
  const text = useStorage((root) => root.text);
  const updateText = useMutation(({ storage }, newText) => {
    storage.set("text", newText);
  }, []);

  return <textarea value={text} onChange={(e) => updateText(e.target.value)} />;
}

<LiveblocksProvider publicApiKey={...}>
  <RoomProvider id={docId} initialStorage={{ text: "" }}>
    <Editor />
  </RoomProvider>
</LiveblocksProvider>
```

### Đáp án mẫu

> "Em sẽ dùng **CRDT** với **Yjs** (mature, open-source) hoặc **managed service** như Liveblocks (cho POC nhanh). Lý do CRDT thay OT: dễ implement đúng — không cần central server resolve conflict, document state converge tự động dù sync order khác nhau. **Architecture**: client edit local Yjs document, send Y-update binary qua WebSocket, server broadcast cho clients khác. Clients apply update — merge tự động qua CRDT algorithm. **Presence** (cursor, selection của user khác) qua Yjs Awareness API — ephemeral state không lưu document, broadcast realtime. **Offline + sync**: Yjs lưu local IndexedDB, khi online sync diff. **Editor integration**: với rich text dùng Tiptap (Yjs binding sẵn), với canvas Figma-like phải tự build. **Production concerns**: scale — WebSocket connection per user, cần infrastructure (Liveblocks, Y-Sweet/Cloudflare Durable Objects, hoặc tự host Yjs với Hocuspocus). Persistence — periodic snapshot document vào DB. Access control — JWT trên WebSocket handshake. Em ưu tiên Liveblocks/Y-Sweet cho startup vì complexity quá cao tự build. Hocuspocus self-host khi cần own infrastructure."

---

## Câu 4: PWA và Offline-first `[Senior]`

### Câu hỏi

> Em làm app cho field worker (vùng mạng kém). Em thiết kế offline-first thế nào?

### Giải thích lý thuyết

Offline-first principles:

1. **Service Worker** cache app shell + asset.
2. **IndexedDB** lưu data lớn, structured.
3. **Background Sync** queue mutation, retry khi online.
4. **CRDT hoặc operational sync** để merge conflict.
5. **UI clear** về state (offline indicator, sync status).

Stack:
- Workbox cho SW.
- Dexie (IndexedDB wrapper) hoặc RxDB cho data layer.
- Replicache hoặc Powersync cho sync engine.
- TanStack Query persist cho cache.

### Code minh hoạ

```javascript
// next.config.js — enable PWA với next-pwa
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.example\.com/,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        expiration: { maxAgeSeconds: 60 * 60 * 24 },
        networkTimeoutSeconds: 10,
      },
    },
    {
      urlPattern: /\.(jpg|jpeg|png|webp|avif|svg)$/,
      handler: "CacheFirst",
      options: { cacheName: "images" },
    },
  ],
});

module.exports = withPWA({});

// IndexedDB với Dexie
import Dexie from "dexie";

class AppDB extends Dexie {
  reports!: Dexie.Table<Report>;
  pendingMutations!: Dexie.Table<PendingMutation>;

  constructor() {
    super("AppDB");
    this.version(1).stores({
      reports: "id, status, createdAt",
      pendingMutations: "++id, entity, action, payload, retryCount",
    });
  }
}

const db = new AppDB();

// Offline-aware data layer
async function saveReport(report: Report) {
  // 1. Lưu local IndexedDB ngay
  await db.reports.put({ ...report, status: "pending-sync" });

  // 2. Queue mutation cho sync
  await db.pendingMutations.add({
    entity: "report",
    action: "create",
    payload: report,
    retryCount: 0,
  });

  // 3. Trigger sync nếu online
  if (navigator.onLine) {
    syncPending();
  }
}

// Sync engine
async function syncPending() {
  const pending = await db.pendingMutations.toArray();

  for (const mutation of pending) {
    try {
      await api.send(mutation);
      await db.pendingMutations.delete(mutation.id);

      // Update local state
      if (mutation.action === "create") {
        await db.reports.update(mutation.payload.id, { status: "synced" });
      }
    } catch (e) {
      // Increment retry, exponential backoff
      await db.pendingMutations.update(mutation.id, {
        retryCount: mutation.retryCount + 1,
      });
      // Stop if retry too high
      if (mutation.retryCount > 10) {
        await db.pendingMutations.update(mutation.id, { status: "failed" });
      }
    }
  }
}

// Listen online event để auto sync
window.addEventListener("online", () => {
  console.log("Back online, syncing...");
  syncPending();
});

// Background Sync API — sync ngay cả khi user đóng app
if ("serviceWorker" in navigator && "SyncManager" in window) {
  navigator.serviceWorker.ready.then((registration) => {
    registration.sync.register("sync-reports");
  });
}

// Trong SW
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-reports") {
    event.waitUntil(syncPending());
  }
});

// UI indicate state
function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  if (online) return null;
  return <div className="offline">Bạn đang offline. Dữ liệu sẽ sync khi có mạng.</div>;
}
```

### Đáp án mẫu

> "App field worker em design 4 layer. **Layer 1 — Service Worker** với Workbox: cache app shell (HTML, CSS, JS) NetworkFirst + image CacheFirst → app load OK offline. **Layer 2 — IndexedDB** với Dexie wrapper: lưu data lớn (reports, photos) structured, query nhanh. **Layer 3 — Optimistic local-first**: user save report → lưu IndexedDB ngay với status 'pending-sync', UI hiển thị thành công ngay, không chờ network. **Layer 4 — Sync engine**: queue mutations vào IndexedDB table riêng, retry với exponential backoff khi online. Background Sync API cho phép sync khi user đã đóng app. **UX**: banner 'offline mode', indicator pending sync count, conflict resolution UI nếu server đã có version khác. Trade-off em accept: data có thể stale (đến khi sync), conflict cần handle (em chọn last-write-wins cho simple, hoặc CRDT cho text). Lib em đã thử: **PowerSync** và **Replicache** — managed sync engine với CRDT built-in, đáng khi phức tạp. Cho simple use case, em viết tay với Dexie + retry queue — 200-300 dòng là đủ."

---

## Câu 5: A/B testing infrastructure cho FE `[Senior]`

### Câu hỏi

> Em build A/B test framework cho FE. Test variant của button color, layout, copy. Em design như thế nào?

### Giải thích lý thuyết

Components:

1. **Assignment**: user nào vào variant nào (random, sticky, weighted).
2. **Storage**: persist assignment (cookie) để user không bị flip.
3. **Render**: render khác nhau theo variant.
4. **Track**: log impression + conversion event.
5. **Analyze**: statistical significance, sample size.

Common pitfalls:
- **Hydration mismatch**: server pick variant A, client pick B → React error.
- **Layout shift**: variant size khác nhau, swap gây CLS.
- **Performance**: tải code cả 2 variant cho mọi user.

### Code minh hoạ

```typescript
// Middleware: assign variant + set cookie
// middleware.ts
import { NextResponse } from "next/server";

export function middleware(req) {
  let variant = req.cookies.get("ab-checkout-cta")?.value;

  if (!variant) {
    // 50/50 split
    variant = Math.random() < 0.5 ? "A" : "B";
  }

  const res = NextResponse.next();
  res.cookies.set("ab-checkout-cta", variant, { maxAge: 60 * 60 * 24 * 30 });

  // Inject variant vào header để Server Component đọc
  res.headers.set("x-ab-checkout-cta", variant);

  return res;
}

// Server Component đọc variant
import { headers } from "next/headers";

async function CheckoutButton() {
  const h = await headers();
  const variant = h.get("x-ab-checkout-cta");

  return (
    <>
      <ImpressionTracker experiment="checkout-cta" variant={variant} />
      {variant === "A" ? (
        <button className="bg-blue-600">Thanh toán</button>
      ) : (
        <button className="bg-green-600">Đặt hàng ngay</button>
      )}
    </>
  );
}

// Client tracker
"use client";
function ImpressionTracker({ experiment, variant }) {
  useEffect(() => {
    analytics.track("experiment_viewed", { experiment, variant });
  }, [experiment, variant]);
  return null;
}

// Conversion tracking
function CheckoutPage() {
  const handlePay = async () => {
    await api.checkout();
    analytics.track("conversion", {
      experiment: "checkout-cta",
      variant: getCookie("ab-checkout-cta"),
    });
  };
}

// Production: dùng platform như Statsig, Optimizely, GrowthBook
import { useFeatureFlag, useExperiment } from "@statsig/react-bindings";

function MyComponent() {
  const { value } = useExperiment("checkout-cta");
  const buttonColor = value.get("buttonColor", "blue");

  return <button style={{ background: buttonColor }}>Pay</button>;
}

// GrowthBook (open-source)
import { useFeatureValue } from "@growthbook/growthbook-react";

const cta = useFeatureValue("checkout-cta", "Thanh toán");
return <button>{cta}</button>;

// Avoid hydration mismatch — set variant qua middleware (server) thay vì random client
```

### Đáp án mẫu

> "Em design 5 phần. **Assignment**: middleware Next.js random variant (50/50 hoặc weighted), set cookie sticky 30 ngày để user không flip giữa session. **Storage**: cookie + inject vào header để Server Component đọc — server pick variant trước render, không hydration mismatch. **Render**: Server Component đọc variant từ header, render JSX khác nhau. Tránh client-side random — sẽ gây mismatch với SSR. **Tracking**: impression event log khi component mount (`ImpressionTracker` client component); conversion event log khi user action target (click checkout, complete order). Stitch qua experiment_id + variant. **Analyze**: thường outsource cho platform — Statsig, GrowthBook (open-source), PostHog, Optimizely — họ lo statistical significance, sample size calculator. Em không tự viết. **Avoid pitfalls**: tránh variant size khác nhau gây layout shift; tránh tải code cả 2 variant cho mọi user (dùng dynamic import nếu variant lớn). Production em recommend **GrowthBook self-hosted** cho team có budget hạn chế nhưng cần ownership data, hoặc **Statsig** managed cho team muốn tập trung làm feature."

---

## Câu 6: Component library: scale cho 100+ products `[Senior]`

### Câu hỏi

> Em build design system dùng cho 5 product khác nhau trong công ty. Em xử lý theme override, version, breaking change thế nào?

### Giải thích lý thuyết

Challenges:
- Mỗi product có brand khác (color, font, radius).
- Component dùng chung nhưng UX cụ thể khác (button có icon ở product A, không có ở B).
- Breaking change phải coordinate version.
- Documentation, Storybook, dev experience.

Strategy:
- **Token-based theming** với CSS variables.
- **Composition over configuration** — Slot, render props thay vì prop bloat.
- **Semver chặt** + changelog automated.
- **Storybook** + visual regression test.
- **Co-located doc**, MDX trong cùng component file.

### Code minh hoạ

```typescript
// packages/design-system/
├── tokens/
│   ├── base.css           # Base tokens
│   ├── product-a.css      # Override cho product A
│   └── product-b.css
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.stories.tsx
│   │   ├── Button.test.tsx
│   │   └── index.ts
│   ├── Card/
│   └── Modal/
├── package.json
└── tsconfig.json

// tokens/base.css
:root {
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-bg: #ffffff;
  --color-text: #1f2937;
  --radius-sm: 4px;
  --radius-md: 8px;
  --space-1: 4px;
  --space-2: 8px;
  --space-4: 16px;
  --font-sans: "Inter", system-ui;
}

// tokens/product-a.css — override
[data-product="product-a"] {
  --color-primary: #ef4444;  /* Red brand */
  --radius-md: 0;             /* Sharp corners */
  --font-sans: "Roboto";
}

// Product app
<html data-product="product-a">
  ...
</html>

// Component sử dụng token
function Button({ children, variant = "primary" }) {
  return (
    <button className={cn(
      "px-[var(--space-4)] py-[var(--space-2)] rounded-[var(--radius-md)] font-[var(--font-sans)]",
      variant === "primary" && "bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]"
    )}>
      {children}
    </button>
  );
}

// Composition: Slot cho icon
import { Slot } from "@radix-ui/react-slot";

function Button({ asChild, leftIcon, rightIcon, children }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp>
      {leftIcon}
      {children}
      {rightIcon}
    </Comp>
  );
}

// Product A custom usage
<Button leftIcon={<HeartIcon />}>Like</Button>

// Product B
<Button asChild>
  <Link href="/profile">Profile</Link> {/* render as link nhưng style button */}
</Button>

// Storybook
// Button.stories.tsx
export default {
  title: "Components/Button",
  component: Button,
};

export const Primary = { args: { children: "Click" } };
export const WithIcon = {
  args: { leftIcon: <Icon />, children: "Like" },
};

// Visual regression
// chromatic publish — detect visual diff

// Versioning: semver + changesets
// .changeset/
//   - cool-button-icon.md (file mỗi PR)
// npx changeset version → bump package.json + CHANGELOG

// Migration helper cho breaking change
// v1: <Button color="red"> → v2: <Button variant="danger">
import { Button as ButtonV2 } from "@my-org/design-system";

// codemod
// jscodeshift -t transforms/button-color-to-variant.js src/
```

### Đáp án mẫu

> "Em design 4 trụ. **Tokens với CSS variable**: define base tokens (color, spacing, radius, font), product override qua `[data-product='x']` selector. Component dùng `var(--color-primary)` — không hardcode. Switch theme = đổi 1 attribute trên html. **Composition over configuration**: thay vì prop bloat (`hasIcon`, `iconPosition`, `iconSize`), em dùng Slot pattern (Radix) cho phép caller compose tự do. `<Button leftIcon={...}>` hoặc `<Button asChild><Link></Button>` cho polymorphic. **Storybook + visual regression**: mỗi component có stories file, Chromatic detect visual diff trong PR — không let UI drift. **Versioning với changesets**: mỗi PR có file changeset mô tả change + bump semver level. Tự generate CHANGELOG, publish npm. Breaking change phải có **codemod** (jscodeshift) — consumer chạy migration script auto-update. Documentation: MDX co-located với component, generate site qua Docusaurus hoặc Storybook docs page. **Monorepo Turborepo**: design system là package riêng, consumer apps depend. Version conflict tránh được vì pnpm hoist. Cho 5 product trong company, em set governance: 1 maintainer team owns DS, product team contribute qua RFC + PR. Không cho product fork DS — control consistency."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                                | Đúng là                                                              |
| ------------------------------------------------------ | -------------------------------------------------------------------- |
| "Render 10k row OK với React"                          | DOM browser slow > 5k node; cần virtualization                       |
| "Optimistic UI luôn an toàn"                           | Cần rollback path + sync server total/discount                       |
| "WebSocket = realtime"                                 | Còn cần CRDT/OT cho conflict, presence, offline                      |
| "PWA chỉ là install icon"                              | Core là Service Worker + offline; install là bonus                   |
| "Design system 1 lib cho mọi product"                  | Theming + composition; không fork; governance rõ                     |
