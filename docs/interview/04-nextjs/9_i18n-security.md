---
sidebar_position: 9
title: "9. i18n & Security"
---

# i18n & Security

> *Nhóm câu hỏi senior-level: đa ngôn ngữ, preview nội dung CMS và bảo mật production. Interviewer dùng những câu này để xem bạn đã từng "sống" với một app Next.js thật — có user quốc tế, có audit security, có hạ tầng serverless — hay chưa.*

---

## Câu 61: Internationalization (i18n) trong Next.js `[Intermediate]`

### Câu hỏi

> Internationalization trong Next.js được implement như thế nào? App Router có hỗ trợ i18n built-in không?

### Giải thích lý thuyết

Đây là điểm hay gây nhầm giữa hai router:

- **Pages Router**: có i18n routing **built-in** — khai báo `i18n: { locales, defaultLocale }` trong `next.config.js`, Next tự handle sub-path (`/vi/about`) hoặc domain routing, tự detect `Accept-Language`.
- **App Router**: **KHÔNG có i18n config built-in**. Bạn tự dựng từ 3 mảnh:
  1. **Dynamic segment `[locale]`** — toàn bộ route nằm dưới `app/[locale]/...`, locale trở thành param.
  2. **Middleware** — detect locale từ cookie (`NEXT_LOCALE`) hoặc header `Accept-Language` (dùng `Negotiator` + `@formatjs/intl-localematcher`), redirect `/about` → `/vi/about` nếu URL thiếu locale.
  3. **Dictionary pattern** — file JSON per locale, load **trên server** bằng dynamic import → bản dịch không ship xuống client bundle (lợi thế lớn của Server Components so với i18n client-side truyền thống).

Thứ tự ưu tiên detect chuẩn: cookie người dùng đã chọn → `Accept-Language` → default locale. Pitfall thường gặp: quên loại trừ `_next`, asset tĩnh và API route khỏi matcher của middleware → redirect loop hoặc hỏng static file.

Với SSG: khai báo `generateStaticParams` trả về danh sách locale để Next prerender từng phiên bản ngôn ngữ.

### Code minh hoạ

```typescript
// middleware.ts — detect locale và redirect
import { NextResponse, type NextRequest } from "next/server";
import Negotiator from "negotiator";
import { match } from "@formatjs/intl-localematcher";

const locales = ["vi", "en", "ja"] as const;
const defaultLocale = "vi";

function getLocale(request: NextRequest): string {
  // Ưu tiên 1: cookie user đã chọn
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && locales.includes(cookieLocale as any)) return cookieLocale;

  // Ưu tiên 2: header Accept-Language của browser
  const headers = { "accept-language": request.headers.get("accept-language") ?? "" };
  const languages = new Negotiator({ headers }).languages();
  return match(languages, locales, defaultLocale);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = locales.some(
    (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
  );
  if (hasLocale) return; // URL đã có locale → cho qua

  // Thiếu locale → redirect /about → /vi/about
  const locale = getLocale(request);
  return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
}

export const config = {
  // Loại trừ asset, _next, api — nếu không sẽ redirect loop
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};
```

```typescript
// dictionaries.ts — dictionary pattern, load trên server
import "server-only"; // đảm bảo không bị import vào client bundle

const dictionaries = {
  vi: () => import("./dictionaries/vi.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  ja: () => import("./dictionaries/ja.json").then((m) => m.default),
};

export const getDictionary = (locale: keyof typeof dictionaries) =>
  dictionaries[locale]();
```

```tsx
// app/[locale]/page.tsx — Server Component dùng dictionary
import { getDictionary } from "@/dictionaries";

// Next.js 15: params là Promise → phải await
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: "vi" | "en" | "ja" }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale); // bản dịch ở server, không ship xuống client
  return <h1>{dict.home.title}</h1>;
}

// Prerender sẵn từng locale khi build
export function generateStaticParams() {
  return [{ locale: "vi" }, { locale: "en" }, { locale: "ja" }];
}
```

### Đáp án mẫu

> "Em phân biệt rõ hai router: Pages Router có i18n routing built-in — chỉ cần khai báo `locales` và `defaultLocale` trong `next.config.js` là Next tự handle sub-path và detect ngôn ngữ. Còn App Router thì **không có built-in**, mình tự dựng từ ba mảnh: thứ nhất, đặt toàn bộ route dưới dynamic segment `app/[locale]/`; thứ hai, viết middleware detect locale theo thứ tự cookie → header `Accept-Language` (dùng Negotiator và intl-localematcher) rồi redirect URL thiếu locale; thứ ba, dictionary pattern — file JSON per locale load bằng dynamic import trong Server Component, nên bản dịch không ship xuống client bundle. Với trang static em thêm `generateStaticParams` trả về danh sách locale để prerender từng ngôn ngữ. Pitfall em từng dính là matcher middleware không loại trừ `_next` và asset tĩnh, gây redirect loop. Thực tế dự án lớn em thường dùng next-intl thay vì tự dựng hết."

---

## Câu 49: i18n routing App Router và giá trị của next-intl `[Advanced]`

### Câu hỏi

> Đào sâu hơn: i18n routing trong App Router hoạt động ra sao về mặt rendering, và thư viện next-intl thêm giá trị gì so với việc tự dựng bằng `[locale]` + middleware?

### Giải thích lý thuyết

Về **rendering**, khi dùng `app/[locale]/...`:

- Mỗi locale là một **tập route riêng** — `/vi/blog/abc` và `/en/blog/abc` là hai entry cache độc lập, ISR/revalidate hoạt động per-locale.
- `generateStaticParams` ở layout `[locale]` cho phép prerender toàn bộ locale lúc build; thiếu nó (và không có `dynamicParams = false`) thì locale render on-demand.
- Middleware negotiation chỉ chạy lúc URL **thiếu** locale; navigation nội bộ luôn mang locale trong path nên không tốn negotiation lại.

**Tự dựng** đáp ứng được routing cơ bản, nhưng nhanh chóng lộ ra việc còn thiếu — và đây chính là giá trị của **next-intl**:

| Vấn đề | Tự dựng | next-intl |
| --- | --- | --- |
| Lấy bản dịch | Tự viết `getDictionary`, truyền props xuyên tree | `useTranslations` (client) / `getTranslations` (server), namespace-based |
| Type-safety | Tự khai báo type cho JSON | Augment type từ file message → key sai là TS báo lỗi |
| Plural / select | Tự viết if-else (vỡ ngay với tiếng Nga, Ả Rập có 3-6 dạng plural) | **ICU message format**: `{count, plural, one {...} other {...}}`, `select` cho gender |
| Date/number/currency | Tự gọi `Intl.*` rải rác, dễ lệch locale | `format.dateTime`, `format.number` đồng bộ locale + timezone |
| Link/redirect giữ locale | Tự nối prefix vào mọi `href` — rất dễ quên | `createNavigation` export sẵn `Link`, `redirect`, `useRouter` đã wrap locale |
| Middleware | Tự viết negotiation, alternate links | `createMiddleware(routing)` có sẵn, kèm header `Link` hreflang cho SEO |

Insight phỏng vấn: tự dựng phù hợp app 2 locale, content ít; còn app có plural phức tạp, format tiền tệ/ngày giờ nhiều nơi, team đông dev — chi phí maintain bản tự dựng vượt xa việc học next-intl. Câu này interviewer muốn nghe bạn **biết khi nào dừng tự chế**.

### Code minh hoạ

```typescript
// i18n/routing.ts — định nghĩa routing tập trung
import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["vi", "en"],
  defaultLocale: "vi",
});

// Link/redirect/useRouter đã tự gắn locale — hết cảnh quên prefix
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
```

```typescript
// middleware.ts — 3 dòng thay cho cả file negotiation tự viết
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);
export const config = { matcher: ["/((?!_next|api|.*\\..*).*)"] };
```

```tsx
// app/[locale]/layout.tsx
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  // Prerender từng locale lúc build
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params; // Next 15: params là Promise
  setRequestLocale(locale); // cho phép static rendering với next-intl
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
```

```tsx
// messages/vi.json
// { "Cart": { "items": "{count, plural, =0 {Giỏ hàng trống} other {# sản phẩm}}" } }

// Server Component — getTranslations
import { getTranslations, getFormatter } from "next-intl/server";

export default async function Cart({ count }: { count: number }) {
  const t = await getTranslations("Cart");
  const format = await getFormatter();
  return (
    <div>
      {/* ICU plural — tự chọn dạng đúng theo ngữ pháp từng ngôn ngữ */}
      <p>{t("items", { count })}</p>
      {/* Format tiền tệ theo locale hiện tại */}
      <p>{format.number(1990000, { style: "currency", currency: "VND" })}</p>
    </div>
  );
}

// Client Component — useTranslations, key sai là TypeScript bắt ngay
"use client";
import { useTranslations } from "next-intl";
function AddButton() {
  const t = useTranslations("Cart");
  return <button>{t("addToCart")}</button>;
}
```

### Đáp án mẫu

> "Về cơ chế, mỗi locale dưới `app/[locale]` là một tập route độc lập — cache và ISR tách riêng per-locale, và em dùng `generateStaticParams` để prerender hết locale lúc build; middleware chỉ negotiate khi URL thiếu locale. Còn next-intl thêm giá trị ở những chỗ tự dựng rất tốn công: `useTranslations`/`getTranslations` type-safe — key sai là TS báo ngay; ICU message format xử lý plural và select đúng ngữ pháp từng ngôn ngữ, chứ if-else tự viết vỡ ngay với tiếng có nhiều dạng plural; formatter date/number/currency đồng bộ locale; và đặc biệt là navigation API — `Link`, `redirect`, `useRouter` đã wrap sẵn locale nên hết bug quên prefix. Middleware cũng có sẵn kèm hreflang cho SEO. Quan điểm của em: app hai locale đơn giản thì tự dựng được, nhưng app thật nhiều plural, nhiều format và team đông thì chi phí maintain bản tự chế vượt xa việc dùng next-intl."

---

## Câu 51: Draft Mode cho preview nội dung CMS `[Advanced]`

### Câu hỏi

> Draft Mode trong Next.js dùng để làm gì? Mô tả flow hoàn chỉnh để editor preview bài viết draft từ headless CMS trên một trang vốn được render static.

### Giải thích lý thuyết

Bài toán: trang blog dùng SSG/ISR — content được "đóng băng" lúc build hoặc lúc revalidate. Editor sửa draft trong CMS (Contentful, Sanity...) muốn **xem trước** trên site thật, nhưng draft chưa publish nên bản static không có.

**Draft Mode** giải quyết bằng một cookie bypass (`__prerender_bypass`):

- Khi cookie được bật, route static **chuyển sang dynamic render mỗi request** — bỏ qua prerendered HTML và Data Cache.
- Trong page, gọi `draftMode()` để biết đang ở chế độ draft → đổi query/API sang **draft API** của CMS (kèm preview token).
- User thường không có cookie → vẫn nhận bản static, **không ảnh hưởng performance** của site công khai.

Flow chuẩn:

1. Editor bấm "Preview" trong CMS → CMS mở URL route handler, ví dụ `/api/draft?secret=...&slug=/blog/abc`.
2. Route handler **verify secret** (chống người lạ bật draft), verify slug tồn tại, gọi `(await draftMode()).enable()` → Next set cookie bypass, rồi `redirect(slug)`.
3. Page đọc `draftMode().isEnabled` → fetch draft content từ CMS.
4. Tắt bằng route `/api/disable-draft` gọi `.disable()` → quay về static.

**Next.js 15**: `draftMode()` là **async** — phải `await draftMode()` (giống `cookies()`, `headers()`). Đây là breaking change so với Next 14, interviewer hay gài đúng chỗ này.

Pitfalls: quên verify secret (ai cũng bật được draft → lộ content chưa publish); fetch draft mà vẫn để cache (`force-cache`) → editor thấy bản cũ, nên kèm `cache: "no-store"` cho nhánh draft; cookie bypass là `httpOnly` + `secure` nên không fake được từ JS.

### Code minh hoạ

```typescript
// app/api/draft/route.ts — CMS gọi vào đây khi editor bấm Preview
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug");

  // BẮT BUỘC verify secret — nếu không ai cũng xem được content chưa publish
  if (secret !== process.env.CMS_PREVIEW_SECRET || !slug) {
    return new Response("Invalid token", { status: 401 });
  }

  // Verify slug tồn tại trong CMS trước khi redirect (tránh open redirect)
  const post = await fetchPostFromCms(slug, { draft: true });
  if (!post) return new Response("Not found", { status: 404 });

  // Next 15: draftMode() là async → phải await
  const draft = await draftMode();
  draft.enable(); // set cookie __prerender_bypass

  redirect(`/blog/${post.slug}`); // sang trang preview
}
```

```typescript
// app/api/disable-draft/route.ts — tắt preview, quay về static
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

export async function GET() {
  (await draftMode()).disable();
  redirect("/");
}
```

```tsx
// app/blog/[slug]/page.tsx — page static, tự "biến hình" khi có cookie draft
import { draftMode } from "next/headers";

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { isEnabled } = await draftMode(); // Next 15: async

  // Draft → gọi draft API của CMS, không cache
  // Published → gọi API thường, cache + ISR như bình thường
  const post = isEnabled
    ? await fetch(`${CMS_URL}/posts/${slug}?status=draft`, {
        headers: { Authorization: `Bearer ${process.env.CMS_PREVIEW_TOKEN}` },
        cache: "no-store", // draft phải luôn fresh
      }).then((r) => r.json())
    : await fetch(`${CMS_URL}/posts/${slug}`, {
        next: { revalidate: 3600 }, // ISR cho bản published
      }).then((r) => r.json());

  return (
    <article>
      {isEnabled && (
        <p>
          Đang xem bản draft — <a href="/api/disable-draft">thoát preview</a>
        </p>
      )}
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
    </article>
  );
}
```

### Đáp án mẫu

> "Draft Mode giải bài toán preview content CMS trên trang static. Bình thường trang SSG/ISR serve HTML đã prerender, editor không thấy được draft chưa publish. Khi bật Draft Mode, Next set cookie bypass — request mang cookie đó sẽ bỏ qua bản static và **dynamic render mỗi request**, còn user thường vẫn nhận bản static nên performance không đổi. Flow em làm: CMS có nút Preview trỏ về route handler `/api/draft?secret=...&slug=...`; handler verify secret — bước này bắt buộc, không thì ai cũng xem được content chưa publish — rồi gọi `draftMode().enable()` và redirect sang trang bài viết. Trong page, em đọc `isEnabled` để chuyển sang draft API của CMS kèm `cache: 'no-store'`. Tắt thì gọi `.disable()` là về lại static. Lưu ý Next 15: `draftMode()` đã thành async giống `cookies()` và `headers()`, phải await."

---

## Câu 62: Content-Security-Policy với nonce `[Advanced]`

### Câu hỏi

> Implement Content-Security-Policy với nonce trong Next.js như thế nào? Tại sao nonce phải được tạo mới ở mỗi request thay vì hardcode một giá trị?

### Giải thích lý thuyết

CSP chặn XSS bằng cách chỉ cho phép script từ nguồn được khai báo. Vấn đề: Next.js (hydration, RSC payload) cần **inline script** — mà mở `'unsafe-inline'` thì CSP gần như vô dụng vì script attacker inject cũng là inline. **Nonce** là lời giải: chỉ inline script mang đúng `nonce` mới được chạy.

Cơ chế trong Next.js (App Router):

1. **Middleware** tạo nonce mỗi request: `Buffer.from(crypto.randomUUID()).toString("base64")`.
2. Build chuỗi CSP chứa `script-src 'nonce-<X>' 'strict-dynamic'`, set vào **response header** `Content-Security-Policy`.
3. Đồng thời truyền nonce qua **request header** `x-nonce` xuống render pipeline — khi Next thấy header CSP có nonce, nó **tự gắn nonce vào các script/style tag** nó generate. Component cần script bên thứ ba thì đọc nonce qua `(await headers()).get("x-nonce")` và gắn thủ công vào `<Script nonce={...}>`.

**Tại sao nonce phải mới mỗi request?** Nonce = "number used once". Nếu hardcode, attacker chỉ cần view-source một lần là biết giá trị, từ đó payload XSS của họ chỉ việc gắn `nonce="giá-trị-đó"` → browser cho chạy → CSP thành vô dụng. Nonce chỉ có tác dụng khi **unpredictable per-request** — attacker inject payload trước khi response sinh ra nên không thể đoán nonce của response đó.

`'strict-dynamic'`: script đã được trust qua nonce được phép load thêm script con (cần cho chunk loading của Next), đồng thời browser hiện đại sẽ bỏ qua whitelist domain — policy gọn hơn.

**Trade-off quan trọng** (insight senior): mỗi response cần nonce riêng → HTML không thể cache/prerender → **CSP nonce buộc toàn bộ route render dynamic**, mất SSG/ISR. App nặng static có thể cân nhắc hash-based CSP hoặc chỉ áp nonce cho route nhạy cảm.

### Code minh hoạ

```typescript
// middleware.ts — tạo nonce mới mỗi request
import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Nonce phải unpredictable per-request — KHÔNG BAO GIỜ hardcode
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const csp = [
    `default-src 'self'`,
    // strict-dynamic: script được trust qua nonce được load thêm chunk
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'nonce-${nonce}'`,
    `img-src 'self' blob: data:`,
    `font-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");

  // Truyền nonce xuống render pipeline qua request header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  // Set CSP lên response để browser enforce
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  // Bỏ qua asset tĩnh — chúng không cần CSP nonce
  matcher: [
    { source: "/((?!_next/static|_next/image|favicon.ico).*)" },
  ],
};
```

```tsx
// app/page.tsx — đọc nonce cho script bên thứ ba
import { headers } from "next/headers";
import Script from "next/script";

export default async function Page() {
  // Next 15: headers() là async → phải await
  // Việc đọc headers() cũng khiến route này dynamic — đúng yêu cầu của CSP nonce
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <>
      <h1>Trang có CSP nonce</h1>
      {/* Script bên thứ ba phải mang nonce mới được browser chạy */}
      <Script
        src="https://www.googletagmanager.com/gtag/js"
        strategy="afterInteractive"
        nonce={nonce}
      />
      {/* Script do Next tự sinh (hydration, chunks) được tự động gắn nonce
          vì Next đọc header Content-Security-Policy của request */}
    </>
  );
}
```

```typescript
// ❌ PHẢN VÍ DỤ — nonce hardcode trong next.config:
// script-src 'nonce-abc123'
// Attacker view-source → biết "abc123" → inject:
// <script nonce="abc123">stealCookies()</script>  → browser CHO CHẠY
// CSP lúc này hoàn toàn vô dụng.
```

### Đáp án mẫu

> "Em implement trong middleware: mỗi request tạo nonce mới bằng `crypto.randomUUID()` encode base64, build chuỗi CSP `script-src 'nonce-X' 'strict-dynamic'`, set vào response header để browser enforce, đồng thời truyền nonce qua request header `x-nonce` xuống render — Next thấy CSP header có nonce sẽ tự gắn nonce vào các script tag nó sinh ra; script bên thứ ba thì em đọc nonce qua `headers()` — Next 15 là async — và gắn vào `next/script`. Lý do nonce phải mới mỗi request: nonce nghĩa là 'number used once' — nếu hardcode, attacker view-source biết giá trị, payload XSS của họ chỉ cần gắn đúng nonce đó là browser cho chạy, CSP vô dụng. Nonce chỉ an toàn khi unpredictable per-request, vì attacker inject payload trước khi response sinh ra nên không đoán được. Trade-off em luôn nêu: nonce per-request nghĩa là HTML không cache được — toàn route thành dynamic rendering, mất SSG/ISR — nên với site nặng static em cân nhắc hash-based CSP."

---

## Câu 64: Database connection pooling trong môi trường serverless `[Advanced]`

### Câu hỏi

> Tại sao kết nối database từ Next.js chạy trên serverless cần connection pooling đặc biệt? Prisma/Drizzle và các managed database giải quyết vấn đề này ra sao?

### Giải thích lý thuyết

Trên server Node truyền thống, một process sống lâu giữ **một pool** (ví dụ 10 connection) dùng chung cho mọi request — ổn. Serverless phá vỡ mô hình này:

- Mỗi **function instance** là một process riêng, có pool/connection **riêng**, không chia sẻ với instance khác.
- Traffic spike → platform scale ra **hàng trăm instance đồng thời** → hàng trăm connection cùng mở.
- Postgres mặc định `max_connections` ~100 (mỗi connection tốn vài MB RAM ở server DB) → cạn limit → lỗi `too many connections`, request mới fail hàng loạt đúng lúc traffic cao nhất.
- Instance "freeze" sau khi xong request nhưng connection có thể vẫn bị giữ → connection zombie chiếm slot.

Các lớp giải pháp:

| Giải pháp | Cơ chế | Ví dụ |
| --- | --- | --- |
| **External pooler** | Một tầng đứng giữa app và DB, nhận hàng nghìn client connection nhưng chỉ giữ vài chục connection thật tới Postgres (transaction mode) | PgBouncer, Supavisor (Supabase), RDS Proxy, Prisma Accelerate |
| **Serverless/HTTP driver** | Query qua HTTP/WebSocket thay vì TCP connection bền — không có khái niệm "connection mở sẵn" | Neon serverless driver, PlanetScale database-js |
| **Giới hạn phía app** | `connection_limit=1` trong connection string — mỗi instance chỉ mở đúng 1 connection | Prisma trên serverless |
| **Global singleton** | Tránh tạo client mới mỗi lần module evaluate | Pattern `globalThis.prisma` |

Pattern **global singleton** giải quyết một bug khác nhưng liên quan: ở dev, hot-reload re-evaluate module liên tục → mỗi lần `new PrismaClient()` là một pool mới → vài phút dev là cạn connection local. Cache client lên `globalThis` để tái sử dụng qua các lần reload (và qua các invocation trên cùng warm instance ở production).

Lưu ý khi đi qua PgBouncer transaction mode: prepared statements không dùng được — Prisma cần `pgbouncer=true` trong URL, và migration nên chạy qua `directUrl` (connection thẳng, không qua pooler).

### Code minh hoạ

```typescript
// lib/prisma.ts — global singleton pattern
import { PrismaClient } from "@prisma/client";

// Tránh tạo PrismaClient mới mỗi hot-reload (dev) / mỗi lần module evaluate
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma; // cache lên globalThis ở dev
}
```

```bash
# .env.example — qua pooler + giới hạn 1 connection mỗi instance
# Runtime: đi qua PgBouncer/Supavisor (port 6543), transaction mode
DATABASE_URL="postgresql://user:pass@pooler.example.com:6543/db?pgbouncer=true&connection_limit=1"
# Migration: connection thẳng tới Postgres (port 5432), không qua pooler
DIRECT_URL="postgresql://user:pass@db.example.com:5432/db"
```

```prisma
// schema.prisma — tách URL runtime và URL migration
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")   // qua pooler cho runtime
  directUrl = env("DIRECT_URL")     // thẳng DB cho prisma migrate
}
```

```typescript
// lib/db.ts — Drizzle với Neon serverless driver (query qua HTTP)
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// Không có TCP connection bền — mỗi query là một HTTP call
// → không bao giờ cạn connection limit, hợp serverless/edge
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);
```

```tsx
// app/users/page.tsx — dùng trong Server Component
import { prisma } from "@/lib/prisma";

export default async function UsersPage() {
  const users = await prisma.user.findMany({ take: 20 });
  return (
    <ul>
      {users.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}
```

### Đáp án mẫu

> "Vấn đề nằm ở mô hình scale: server truyền thống là một process giữ một pool dùng chung, còn serverless thì mỗi instance là một process riêng mở connection riêng. Traffic spike khiến platform scale ra hàng trăm instance đồng thời — hàng trăm connection — trong khi Postgres mặc định chỉ chịu khoảng 100, thế là `too many connections` đúng lúc cao điểm. Em giải bằng nhiều lớp: thứ nhất, external pooler như PgBouncer, Supavisor hay Prisma Accelerate — nhận nghìn client nhưng chỉ giữ vài chục connection thật tới DB; thứ hai, hoặc dùng serverless HTTP driver như Neon, PlanetScale — query qua HTTP, không có connection bền; thứ ba, set `connection_limit=1` để mỗi instance chỉ mở một connection; và thứ tư, pattern global singleton — cache PrismaClient lên `globalThis` để hot-reload và warm invocation tái sử dụng client thay vì tạo pool mới. Lưu ý nhỏ: migration phải chạy qua `directUrl` thẳng tới DB chứ không qua pooler transaction mode."

---

## Bẫy thường gặp khi trả lời

| Sai lầm | Đúng là |
| --- | --- |
| "App Router có i18n config built-in như Pages Router" | Không — phải tự dựng `[locale]` + middleware, hoặc dùng next-intl |
| "`draftMode()`/`headers()` gọi sync như Next 14" | Next 15: tất cả là async — phải `await` |
| "CSP nonce có thể set một lần trong next.config" | Nonce phải mới mỗi request, và buộc route render dynamic |
| "Serverless cứ tăng pool size là hết lỗi connection" | Ngược lại — phải pooler external hoặc `connection_limit=1` per instance |
