---
sidebar_position: 2
title: "2. Getting Started"
---

# 2. Getting Started

## 1. Tạo project Next.js

Bài học: [1. Tạo project Next.js](../../nextjs/02-getting-started/1_create-next-app.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `create-next-app` làm những gì? Các lựa chọn trong wizard ảnh hưởng thế nào tới project về sau?**

<details className="qa">
<summary>Xem đáp án</summary>

`create-next-app` là CLI chính thức tạo project mới: `npx create-next-app@latest my-app`. Nó dựng sẵn cấu trúc thư mục, cài dependency, sinh file cấu hình và script trong `package.json` — cài xong là `npm run dev` chạy được ngay.

Wizard hỏi những lựa chọn để lại dấu vết lâu dài:

- **TypeScript** — sinh `tsconfig.json`, file `.tsx`; thêm sau được nhưng phải chuyển đổi cả codebase.
- **ESLint** — cấu hình lint mặc định.
- **Tailwind CSS** — cài PostCSS và `globals.css`; đổi hướng styling về sau khá tốn công.
- **Thư mục `src/`** — quyết định nơi đặt toàn bộ code, đổi giữa chừng phải sửa đường dẫn hàng loạt.
- **App Router** — quyết định lớn nhất, kéo theo Server Components và toàn bộ model dữ liệu.
- **Turbopack** — bundler cho dev.
- **Import alias** `@/*` — ghi vào `tsconfig.json`.

Dùng flag tương ứng nếu muốn bỏ qua wizard.

</details>

**2. Dùng thư mục `src/` hay không: đánh đổi là gì, và vì sao nên quyết định một lần ngay từ đầu?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai cách đều hợp lệ, khác nhau ở chỗ đặt code:

- **Có `src/`** — code nằm gọn trong `src/app`, tách bạch với file cấu hình ở root (`next.config.ts`, `tsconfig.json`, `package.json`). Hợp với monorepo hoặc team đã quen pattern này từ project khác.
- **Không có `src/`** — `app/` nằm thẳng ở root, đường dẫn ngắn hơn, ít một tầng lồng. Đa số project chọn cách này cho gọn.

Nên **quyết định một lần ngay từ đầu** vì đổi giữa chừng phải di chuyển toàn bộ cây thư mục, sửa lại import alias, đường dẫn trong cấu hình, script và cả các quy ước nội bộ của team. Git history cũng bị nhiễu bởi một commit "move file" khổng lồ, khiến review và truy vết thay đổi về sau khó hơn hẳn. Đây là loại chi phí thuần tuý không đổi lại lợi ích gì.

</details>

**3. `import alias` kiểu `@/*` được cấu hình ở đâu và giải quyết vấn đề gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`import alias` được cấu hình trong `tsconfig.json` (hoặc `jsconfig.json`), ở mục `paths` — `create-next-app` sinh sẵn khi bạn chọn `@/*` trong wizard.

Nó giải quyết vấn đề **đường dẫn tương đối dài và dễ vỡ**:

```ts
// Không alias: đếm dấu chấm mỏi mắt, đổi thư mục là gãy
import { Button } from "../../../components/ui/button";

// Có alias: đường dẫn tuyệt đối tính từ gốc project
import { Button } from "@/components/ui/button";
```

Lợi ích cụ thể: di chuyển file không phải sửa lại import, đọc code biết ngay module nằm ở đâu trong cây thư mục, và copy một dòng import giữa các file không bị sai tầng. Nếu chọn `src/` thì alias trỏ vào `src/`, còn không thì trỏ vào root — nhưng cách viết trong code vẫn y hệt.

</details>

**4. File-based routing trong thư mục `app/` hoạt động ra sao? URL tương ứng của `app/blog/[slug]/page.tsx` là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Trong App Router, **cấu trúc thư mục chính là URL**. Mỗi thư mục con trong `app/` là một đoạn đường dẫn, và file `page.tsx` bên trong nó biến đoạn đó thành một route truy cập được:

```
app/page.tsx                 → /
app/about/page.tsx           → /about
app/blog/page.tsx            → /blog
app/blog/[slug]/page.tsx     → /blog/:slug
app/api/users/route.ts       → /api/users
```

Thư mục đặt tên trong ngoặc vuông là **dynamic segment** — nó khớp với bất kỳ giá trị nào và truyền giá trị đó vào component qua `params`.

Vậy `app/blog/[slug]/page.tsx` ứng với URL `/blog/:slug` — ví dụ `/blog/hoc-nextjs` sẽ cho `slug` bằng `"hoc-nextjs"`. Thư mục không chứa `page.tsx` thì không tạo ra route, chỉ dùng để nhóm file hoặc chứa layout.

</details>

**5. Phân biệt vai trò của `page.tsx`, `layout.tsx` và `route.ts`. Root layout bắt buộc phải có những gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Ba file, ba vai trò khác nhau:

- **`page.tsx`** — UI của một route cụ thể, và là thứ khiến thư mục đó trở thành URL truy cập được. Không có nó thì thư mục chỉ là nơi chứa file.
- **`layout.tsx`** — khung bao quanh các route con, **lồng nhau** theo cây thư mục và **giữ nguyên state khi điều hướng** giữa các route cùng layout (thanh nav, sidebar không bị dựng lại).
- **`route.ts`** — không render UI mà xử lý HTTP, export handler theo method (`GET`, `POST`...) và trả về `Response`. Một thư mục đã có `route.ts` thì không đặt `page.tsx` cùng chỗ.

**Root layout** (`app/layout.tsx`) là bắt buộc và đặc biệt: nó phải tự render thẻ `html` và `body`, vì đây là layout ngoài cùng bao cả ứng dụng. Đây cũng là nơi khai báo metadata gốc và nạp CSS toàn cục.

</details>

**6. Các file đặc biệt `loading.tsx`, `error.tsx`, `not-found.tsx` hoạt động thế nào, và liên quan ra sao tới `Suspense` / `Error Boundary`?**

<details className="qa">
<summary>Xem đáp án</summary>

Ba file đặc biệt cho phép khai báo trạng thái của route bằng file thay vì viết tay boilerplate:

- **`loading.tsx`** — Next.js tự bọc nội dung route trong một `Suspense` boundary và dùng file này làm fallback. Trong lúc Server Component còn đang lấy dữ liệu, người dùng thấy skeleton ngay thay vì màn hình trắng.
- **`error.tsx`** — được bọc thành **Error Boundary** cho nhánh route đó. Nó phải là Client Component, nhận `error` và `reset` để cho phép thử lại mà không reload cả trang.
- **`not-found.tsx`** — UI hiển thị khi route không tồn tại hoặc khi code chủ động báo không tìm thấy dữ liệu.

Điểm quan trọng: chúng đặt ở **cấp thư mục nào thì áp dụng cho nhánh đó**, nên có thể có loading/error riêng cho từng khu vực. Lỗi ở một nhánh không làm sập cả app, và phần còn lại của layout vẫn hiển thị bình thường.

</details>

**7. Vì sao từ Next.js 15, `params` và `searchParams` là `Promise`? Điều đó ảnh hưởng thế nào tới code cũ?**

<details className="qa">
<summary>Xem đáp án</summary>

Từ Next.js 15, `params` và `searchParams` là **`Promise`** thay vì object đồng bộ:

```tsx
export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <p>{slug}</p>;
}
```

Lý do: đọc chúng khiến route trở thành dynamic. Biến thành Promise cho phép Next.js **không chặn việc render** ở phần không phụ thuộc vào chúng — phần tĩnh vẫn được chuẩn bị trước, phần cần request mới chờ. Điều này ăn khớp với mô hình streaming và render theo từng phần.

Ảnh hưởng tới code cũ: mọi chỗ truy cập thẳng `params.slug` đều phải đổi thành `await params` trước, kéo theo component phải là `async`. Đây là breaking change khi nâng cấp, nhưng có codemod hỗ trợ chuyển đổi hàng loạt.

</details>

**8. `npm run dev` khác `npm run build` cộng `npm run start` ở điểm nào? Vì sao không được chạy dev server cho production?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`npm run dev`** chạy dev server: biên dịch theo yêu cầu, giữ source map đầy đủ, bật Fast Refresh, HMR và error overlay hiện stack trace ngay trên trình duyệt. Mục tiêu là vòng lặp sửa–xem thật nhanh.
- **`npm run build`** biên dịch toàn bộ ra `.next/`: minify, code splitting, pre-render các route tĩnh, sinh build report. **`npm run start`** chỉ phục vụ kết quả đã build đó — nó không compile gì thêm, nên phải build trước rồi mới start.

Không dùng dev server cho production vì nó **chậm hơn nhiều lần** (compile lúc chạy, không minify, bundle lớn), tốn bộ nhớ, và **để lộ thông tin nội bộ** qua error overlay cùng source map. Ngoài ra hành vi cache, ISR và static generation ở dev khác production, nên phải `npm run build && npm run start` để kiểm thử đúng thứ sẽ chạy thật.

</details>

**9. Fast Refresh và `HMR` khác nhau ra sao? Khi nào Fast Refresh làm mất state của component?**

<details className="qa">
<summary>Xem đáp án</summary>

**HMR** (Hot Module Replacement) là cơ chế chung của bundler: thay module đã đổi ngay trong trang đang chạy, không reload cả app. Nó không biết gì về React.

**Fast Refresh** là lớp bên trên HMR, hiểu React: khi bạn sửa một component, nó render lại đúng component đó và **giữ nguyên state** — đang gõ dở form hay mở dở modal thì vẫn nguyên.

Fast Refresh **mất state** trong các trường hợp:

- File không chỉ export component mà còn export giá trị khác, hoặc export không phải component thuần.
- Sửa file nằm ngoài component: hook dùng chung, module util, file cấu hình.
- Đổi vị trí/thứ tự hook, làm cấu trúc component thay đổi bản chất.
- Lỗi runtime khiến component bị unmount, hoặc sửa root layout.

Khi đó nó tự hạ cấp thành full reload — đó là hành vi có chủ đích để tránh state sai lệch.

</details>

**10. Turbopack khác Webpack ở đâu? Vì sao lần compile đầu chậm rồi sau đó lại rất nhanh?**

<details className="qa">
<summary>Xem đáp án</summary>

**Webpack** viết bằng JavaScript, đã rất chín và ecosystem plugin khổng lồ. **Turbopack** viết bằng Rust, thiết kế quanh việc biên dịch **incremental** và tận dụng đa luồng — nhanh hơn Webpack rất nhiều trong vòng lặp dev, và là lựa chọn mặc định khi tạo project mới.

Lần compile đầu chậm vì chưa có gì để tái sử dụng: phải đọc, phân giải và biên dịch toàn bộ module trong phạm vi cần thiết, đồng thời **dựng cache** ánh xạ từng đơn vị công việc.

Những lần sau nhanh vì Turbopack chỉ làm lại **đúng phần bị ảnh hưởng** bởi thay đổi, phần còn lại lấy thẳng từ cache. Nó cũng biên dịch theo nhu cầu — route nào bạn mở thì mới biên dịch route đó, thay vì dựng cả app. Vì vậy dự án càng lớn thì khác biệt càng rõ.

</details>

**11. Đọc build report: các ký hiệu `○`, `ƒ`, `●` nghĩa là gì? Vì sao một route bạn tưởng là static lại thành dynamic?**

<details className="qa">
<summary>Xem đáp án</summary>

Ký hiệu trong build report cho biết route được render lúc nào:

- **`○` Static** — pre-render tại build time (SSG), phục vụ như file tĩnh.
- **`ƒ` Dynamic** — render ở server **mỗi request** (SSR).
- **`●` ISR** — pre-render sẵn nhưng revalidate định kỳ.

Route tưởng static mà thành dynamic thường vì trong cây component có thứ **phụ thuộc vào request**, khiến Next.js buộc phải render lúc chạy:

- Đọc `cookies()`, `headers()`, hoặc `searchParams`.
- `fetch` được khai báo là không cache, hoặc dùng option buộc lấy dữ liệu tươi.
- Route khai báo tường minh là dynamic.
- Dùng API chỉ có ý nghĩa trong ngữ cảnh một request cụ thể.

Chỉ cần một component sâu trong cây đụng vào những thứ đó là **cả route** chuyển sang dynamic. Cách xử lý: cô lập phần cần dữ liệu tươi vào một nhánh riêng bọc trong `Suspense`, giữ phần còn lại tĩnh.

</details>

**12. `First Load JS` trong báo cáo build đo cái gì, và khác gì với cột Size?**

<details className="qa">
<summary>Xem đáp án</summary>

Trong build report có hai cột dễ nhầm:

- **Size** — phần JS **của riêng route đó**, tức những chunk chỉ route này dùng.
- **First Load JS** — **tổng** JS mà trình duyệt phải tải để hiển thị route đó lần đầu: phần riêng của route **cộng** các chunk dùng chung (framework React, runtime Next.js, code trong root layout, shared chunk giữa các route).

Vì vậy First Load JS luôn lớn hơn Size, và trong ví dụ của bài, một route chỉ 2.1 kB vẫn có First Load JS 82 kB — gần như toàn bộ đến từ phần dùng chung.

Con số đáng quan tâm khi tối ưu là **First Load JS**, vì đó mới là thứ người dùng thực sự phải tải trước khi trang trở nên interactive. Muốn giảm nó thì phải nhắm vào phần dùng chung: bớt thư viện nặng ở root layout, thu hẹp Client Component, import động những gì không cần ngay.

</details>

**13. Bạn dùng `@next/bundle-analyzer` thế nào để tìm dependency làm phình bundle, và xử lý tiếp ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Cài và bật analyzer qua biến môi trường:

```bash
npm install -D @next/bundle-analyzer
ANALYZE=true npm run build
```

Trong `next.config.ts`, bọc config bằng `withBundleAnalyzer` với `enabled` phụ thuộc `process.env.ANALYZE`. Build xong mở file HTML report — treemap hiển thị mỗi ô là một module, diện tích tỉ lệ với dung lượng, nên dependency phình to lộ ra ngay.

Xử lý tiếp theo, theo thứ tự ưu tiên:

- Thư viện chỉ dùng ở server → đẩy vào Server Component để nó không vào bundle client.
- Thư viện nặng nhưng dùng muộn (chart, editor, modal) → import động, tải khi cần.
- Import cả package chỉ để lấy một hàm → import đúng phần cần, hoặc thay bằng thư viện nhẹ hơn.
- Trùng lặp nhiều phiên bản của cùng một package → thống nhất version.

Sau mỗi thay đổi, build lại và đối chiếu First Load JS để biết có thực sự cải thiện.

</details>

**14. Thư mục `.next/` chứa những gì? Cái nào nên đưa vào Docker image và cái nào không nên commit?**

<details className="qa">
<summary>Xem đáp án</summary>

`.next/` là **kết quả build**, gồm:

- `server/` — bundle dùng cho SSR và các hàm chạy ở server.
- `static/` — asset tĩnh và chunk JS/CSS có hash trong tên.
- `cache/` — cache của build và của dữ liệu.
- `BUILD_ID` — định danh của lần build.

**Không commit `.next/`** — đây là artifact sinh ra tự động, thay đổi mỗi lần build, làm phình repo và gây conflict vô nghĩa. `create-next-app` đã đưa nó vào `.gitignore` sẵn.

Với **Docker**: không copy `.next/` từ máy cá nhân vào image. Hãy build bên trong image theo dạng multi-stage — stage build sinh ra `.next/`, stage chạy chỉ nhận phần cần thiết (output standalone cùng `.next/static` và `public/`). Riêng `.next/cache` thì không nên đưa vào image cuối, nhưng nên lưu lại giữa các lần chạy CI để build nhanh hơn.

</details>

**15. Thư mục `public/` khác gì với việc import asset trực tiếp trong code?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai cách phục vụ asset khác nhau về bản chất:

- **`public/`** — file được copy nguyên vẹn ra gốc web. `public/logo.png` truy cập bằng `/logo.png`. Tên file **không đổi**, không qua xử lý, không có hash. Bundler không biết gì về nó nên sai đường dẫn chỉ phát hiện lúc chạy.
- **Import trực tiếp trong code** — file đi qua bundler: được hash vào tên nên cache vĩnh viễn an toàn, sai đường dẫn báo lỗi ngay lúc build, và với ảnh thì import còn mang theo kích thước để tránh layout shift khi dùng với thành phần Image.

Chọn thế nào: `public/` cho những file cần URL cố định và có thể đoán trước — `favicon`, `robots.txt`, `sitemap`, ảnh chia sẻ mạng xã hội, file tải về. Import trực tiếp cho asset thuộc về giao diện — icon, ảnh minh hoạ, font — vì được tối ưu và kiểm tra tự động.

</details>

**16. So sánh `Pages Router` và `App Router`. Khi nào một dự án vẫn nên ở lại `Pages Router`?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Pages Router (cũ) | App Router (mới) |
|--|------------------|-----------------|
| Thư mục | `pages/` | `app/` |
| Lấy dữ liệu | `getServerSideProps`, `getStaticProps` | Component `async`, `fetch()` |
| Layout | `_app.tsx`, `_document.tsx` | `layout.tsx` lồng nhau |
| Server Components | Không | Có, và là mặc định |
| Streaming | Hạn chế | Suspense + RSC |
| Loading / Error | Tự viết | `loading.tsx` / `error.tsx` |

Năm 2026 **App Router là mặc định**, và project mới nên luôn chọn nó. Pages Router vẫn được hỗ trợ **vô thời hạn**, nên vẫn hợp lý khi:

- Codebase cũ đang chạy ổn định, migrate dần từng route thay vì viết lại.
- Còn dependency chưa tương thích với App Router.
- Team chưa sẵn sàng đầu tư học model Server Components.

Hai router chạy song song được trong cùng một project, nên chiến lược an toàn là giữ phần cũ và viết route mới bằng App Router.

</details>

---

## 2. Rendering Strategies

Bài học: [2. Rendering Strategies](../../nextjs/02-getting-started/2_rendering-strategies.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Giải thích sự khác nhau giữa `SSR`, `SSG`, `ISR` và `CSR` — mỗi cách tạo HTML ở thời điểm nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| Chiến lược | HTML tạo ra lúc nào | Đặc điểm |
|---|---|---|
| **SSG** | Build time | Serve như file tĩnh từ CDN, nhanh nhất, dữ liệu đóng băng tại lúc build |
| **ISR** | Build time, rồi tái sinh nền sau N giây | Nhanh như SSG nhưng tự làm mới |
| **SSR** | Mỗi request, ở server | Luôn tươi, đọc được cookie/header, TTFB chậm hơn |
| **CSR** | Trong browser, sau khi tải JS | HTML ban đầu gần như rỗng, SEO kém |

Trục phân biệt chỉ có hai: **render ở đâu** (server hay browser) và **render lúc nào** (build hay request). SSG và ISR trả lời trước; SSR trả lời đúng lúc được hỏi; CSR đẩy toàn bộ việc dựng nội dung sang máy người dùng. Trong Next.js, các chiến lược này chọn theo **từng route** chứ không phải cho cả ứng dụng.

</details>

**2. Cho ba trang: blog marketing, dashboard sau đăng nhập, trang chi tiết sản phẩm e-commerce — bạn chọn chiến lược nào cho từng trang và lập luận ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Blog marketing** → **SSG**. Nội dung hiếm khi đổi và ai xem cũng thấy giống nhau, nên build sẵn một lần rồi phục vụ từ CDN: nhanh nhất, rẻ nhất, SEO tốt nhất. Có sửa bài thì deploy lại hoặc thêm revalidate dài.
- **Dashboard sau đăng nhập** → **SSR** hoặc CSR. Dữ liệu phụ thuộc đúng người dùng đang đăng nhập nên không thể cache chung; phải đọc cookie/session mỗi request. Không cần SEO vì bot không vào được sau đăng nhập.
- **Trang chi tiết sản phẩm e-commerce** → **ISR**. Cần SEO và tốc độ như trang tĩnh, nhưng giá và tồn kho thỉnh thoảng đổi. Build sẵn rồi `revalidate` định kỳ; khi admin sửa sản phẩm thì `revalidateTag` để cập nhật ngay không phải chờ hết TTL.

Lập luận chung: hỏi **dữ liệu có phụ thuộc người dùng không** và **đổi nhanh cỡ nào**, câu trả lời sẽ tự ra chiến lược.

</details>

**3. Trong `App Router`, `getStaticProps` và `getServerSideProps` đi đâu mất? Giờ khai báo chiến lược render bằng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Trong App Router chúng **không còn tồn tại** — đó là API của Pages Router. Thay vì khai báo chiến lược ở cấp trang bằng một hàm export, giờ chiến lược được **suy ra từ cách bạn lấy dữ liệu**:

```tsx
// Static (mặc định) — tương đương getStaticProps
const a = await fetch(url);

// ISR
const b = await fetch(url, { next: { revalidate: 60 } });

// Dynamic / SSR — tương đương getServerSideProps
const c = await fetch(url, { cache: "no-store" });
```

Ngoài ra, chạm vào `cookies()`, `headers()` hoặc `searchParams` cũng đẩy route sang Dynamic. `generateStaticParams` thay cho `getStaticPaths` để liệt kê các param cần pre-render.

Mental model đổi hẳn: bạn mô tả **dữ liệu** là tĩnh hay động, Next.js tự quyết rendering mode và in kết quả ra trong build output.

</details>

**4. Những yếu tố nào khiến Next.js tự chuyển một route từ Static sang Dynamic?**

<details className="qa">
<summary>Xem đáp án</summary>

Một route mặc định là Static; nó chuyển sang Dynamic khi trong cây component có thứ phụ thuộc vào request cụ thể:

- `fetch` với `cache: "no-store"` — ép lấy dữ liệu tươi mỗi lần.
- Gọi **dynamic API**: `cookies()`, `headers()`.
- Đọc prop `searchParams` của page.
- Khai báo tường minh route là dynamic trong file.

Điểm hay bị bỏ sót: chỉ cần **một component nằm sâu trong cây** đụng vào những thứ đó là **cả route** chuyển sang Dynamic — kể cả khi 90% nội dung trang hoàn toàn tĩnh. Ví dụ một thanh header đọc cookie để hiện tên người dùng cũng đủ làm cả trang mất tính tĩnh.

Cách kiểm soát: cô lập phần phụ thuộc request vào một nhánh riêng bọc trong `Suspense`, để phần còn lại vẫn được pre-render.

</details>

**5. `cache: "no-store"` và `next: { revalidate: N }` khác nhau ra sao về hành vi cache và độ tươi dữ liệu?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `cache: "no-store"` | `next: { revalidate: N }` |
|---|---|---|
| Cache | Không cache gì cả | Cache kết quả, coi là còn tươi trong N giây |
| Thời điểm lấy dữ liệu | Mỗi request | Khi bản cache quá N giây thì tái sinh ở nền |
| Route thành | Dynamic (SSR) | ISR |
| Độ tươi | Luôn mới tuyệt đối | Trễ tối đa khoảng N giây |
| Tải lên backend | Mỗi request một lần gọi | Nhiều nhất một lần gọi mỗi N giây |

Chọn `no-store` khi dữ liệu **không được phép cũ dù chỉ một giây** hoặc riêng theo từng người dùng — số dư tài khoản, giỏ hàng, dashboard cá nhân.

Chọn `revalidate` khi chấp nhận một khoảng trễ nhỏ để đổi lấy tốc độ và giảm tải backend — giá sản phẩm, danh sách bài viết, trang tin. Đây cũng là lựa chọn mặc định nên cân nhắc trước, vì `no-store` đẩy toàn bộ chi phí render về phía server.

</details>

**6. Mô tả từng bước luồng của `ISR`: người dùng request ngay sau khi hết hạn revalidate sẽ nhận HTML cũ hay mới, và vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Luồng ISR theo từng bước:

1. **Build**: render `/products/123` và lưu HTML vào cache.
2. **User 1 request lúc t = 0**: nhận ngay HTML từ cache — rất nhanh.
3. **User 2 request lúc t > 60s** (đã quá hạn revalidate): **vẫn nhận HTML cũ**, đồng thời request này **kích hoạt việc render lại ở nền**.
4. **Render nền xong**: HTML mới thay vào cache.
5. **Request tiếp theo**: nhận HTML mới.

Vậy người dùng request ngay sau khi hết hạn nhận **HTML cũ**. Lý do là mô hình *stale-while-revalidate*: ưu tiên trả lời tức thì thay vì bắt người dùng đứng chờ render. Nếu chặn để render mới, request đó sẽ chậm đúng bằng SSR — mất luôn lợi thế của ISR.

Hệ quả cần nhớ: người "xui" nhất chỉ thấy dữ liệu cũ thêm **một lượt** chứ không phải mãi mãi.

</details>

**7. Vì sao `ISR` được coi là điểm cân bằng giữa `SSG` và `SSR`? Đánh đổi phải chấp nhận là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

ISR đứng giữa vì nó lấy điểm mạnh của cả hai:

- **Tốc độ như SSG** — phục vụ HTML đã cache, đi qua CDN, TTFB rất thấp.
- **Độ tươi gần như SSR** — dữ liệu tự làm mới theo chu kỳ, hoặc làm mới ngay bằng `revalidatePath` / `revalidateTag`.
- **Scale tốt** — mỗi chu kỳ chỉ render lại một lần, không tạo tải theo từng request.

Đánh đổi phải chấp nhận:

- Dữ liệu có thể **cũ** trong khoảng tối đa N giây, và request đầu tiên sau khi hết hạn chắc chắn nhận bản cũ.
- **Không cá nhân hoá được** — cache dùng chung cho mọi người, nên không dùng cho trang phụ thuộc người dùng.
- Cần hạ tầng hỗ trợ cache dùng chung; self-host nhiều instance thì cache dễ lệch nhau.
- Thêm một tầng cache phải suy luận, dễ sinh bug dữ liệu cũ nếu quên revalidate sau khi mutation.

</details>

**8. `revalidatePath` và `revalidateTag` khác nhau thế nào? Tình huống nào bắt buộc phải dùng `revalidateTag`?**

<details className="qa">
<summary>Xem đáp án</summary>

Cả hai đều dùng để làm mới cache theo yêu cầu, khác ở **đơn vị nhắm tới**:

- **`revalidatePath("/products/123")`** — làm mới theo **đường dẫn**. Biết chính xác URL nào bị ảnh hưởng thì dùng cách này.
- **`revalidateTag("products")`** — làm mới theo **nhãn** gắn vào các lần fetch. Mọi dữ liệu mang nhãn đó, dù nằm ở bao nhiêu route, đều được đánh dấu cũ cùng lúc.

Bắt buộc dùng `revalidateTag` khi **một mẩu dữ liệu xuất hiện ở nhiều trang không đoán trước được**: sửa một sản phẩm thì ngoài trang chi tiết còn có trang danh mục, trang tìm kiếm, trang khuyến mãi, widget "sản phẩm liên quan" trên vô số trang khác. Liệt kê hết path là bất khả thi và rất dễ sót.

Cách dùng: khi fetch thì gắn `tags`, khi mutation xong thì gọi `revalidateTag` với đúng nhãn đó.

</details>

**9. `generateStaticParams` giải quyết vấn đề gì? Nếu người dùng truy cập một `slug` không nằm trong danh sách trả về thì điều gì xảy ra?**

<details className="qa">
<summary>Xem đáp án</summary>

`generateStaticParams` trả lời câu hỏi: với route động như `app/blog/[slug]/page.tsx`, **lúc build Next.js phải render sẵn những giá trị `slug` nào?** Không có nó thì Next.js không thể biết danh sách bài viết để pre-render.

```tsx
export async function generateStaticParams() {
  const posts = await fetchPosts();
  return posts.map((p) => ({ slug: p.slug }));
}
```

Mỗi phần tử trả về sinh ra một trang HTML tĩnh lúc build.

Nếu người dùng vào một `slug` **không** nằm trong danh sách, hành vi mặc định là Next.js **render trang đó theo yêu cầu** rồi cache lại cho các lần sau — tức là ISR theo nhu cầu. Nếu dữ liệu thực sự không tồn tại, code nên chủ động báo không tìm thấy để trả về trang 404. Ngoài ra có thể cấu hình để **chỉ** chấp nhận các param đã liệt kê, mọi giá trị khác trả 404 ngay.

</details>

**10. Server Component và Client Component khác nhau ở những điểm nào? Cái nào là mặc định trong `App Router`?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Server Component | Client Component |
|---|---|---|
| Nơi chạy | Server | Server (lần đầu) rồi hydrate ở browser |
| Vào bundle client | Không | Có |
| Lấy dữ liệu | `await` trực tiếp, đọc DB, đọc file | Qua API, thường trong `useEffect` |
| Hook state/effect | Không | Có |
| Event handler | Không | Có |
| Truy cập secret | Được | Không |
| Đánh dấu | Mặc định | `"use client"` ở đầu file |

**Server Component là mặc định** trong App Router — bạn không phải viết gì thêm.

Cách phối hợp đúng: dùng Server Component làm khung ngoài (lấy dữ liệu, render nội dung), và chỉ tách những mảnh thực sự cần tương tác thành Client Component rồi lồng vào. Ranh giới `"use client"` nên nằm càng thấp trong cây càng tốt.

</details>

**11. Vì sao Server Component không dùng được `useState`, `useEffect` hay `onClick`? Giới hạn này đến từ đâu?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì Server Component chạy **một lần duy nhất ở server** rồi sinh ra kết quả gửi về client — nó **không tồn tại** trong trình duyệt.

- `useState` vô nghĩa vì không có chu kỳ re-render trên client để state tồn tại qua đó.
- `useEffect` vô nghĩa vì không có DOM, không có thời điểm "sau khi mount".
- `onClick` không gửi được về client: hàm không serialize được thành HTML, và không có JS của component đó trong bundle để gắn listener.

Giới hạn này đến trực tiếp từ thiết kế: đổi lấy việc **không gửi JS của component xuống client** — bundle nhỏ hơn, hydration nhẹ hơn, và truy cập được DB hay secret an toàn. Không thể vừa muốn không gửi JS vừa muốn có tương tác trong cùng một component.

Cần tương tác thì tách ra Client Component và lồng nó vào Server Component.

</details>

**12. Vì sao đặt `"use client"` ở component gốc của cả app là một lựa chọn tồi? Hậu quả cụ thể là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Đặt `"use client"` ở gốc khiến **toàn bộ cây bên dưới** trở thành Client Component — vì tính chất này lan xuống mọi component con. Kết quả là bạn quay về mô hình SPA cũ và mất sạch lợi ích của App Router:

- **Bundle phình to** — mọi component, cùng mọi thư viện chúng import, đều vào bundle client.
- **Hydration nặng** — React phải dựng lại toàn bộ cây trên trình duyệt, TTI chậm.
- **Mất quyền truy cập trực tiếp dữ liệu** — không `await` DB được nữa, phải dựng API route rồi `useEffect` + `fetch`, sinh ra loading spinner và waterfall.
- **Rủi ro lộ secret** — code chạy ở client nên không được đụng vào khoá bí mật.

Cách làm đúng: giữ Server Component ở lớp ngoài, đẩy `"use client"` xuống đúng những lá cần state hoặc event handler — nút, form, filter, modal.

</details>

**13. `SSR` ảnh hưởng thế nào tới `TTFB` và khả năng scale khi traffic tăng? Bạn giảm tải bằng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Với SSR, mỗi request đều phải chờ server lấy dữ liệu và render trước khi gửi byte đầu tiên, nên **TTFB cao hơn** SSG/ISR và phụ thuộc trực tiếp vào tốc độ backend. Về scale, mỗi request tiêu CPU và bộ nhớ thật, nên traffic tăng gấp đôi thì tải server cũng tăng gấp đôi — không có CDN nào đỡ hộ.

Cách giảm tải, theo thứ tự hiệu quả:

- Chuyển sang **ISR** nếu dữ liệu không cần tươi tuyệt đối — đây là đòn bẩy lớn nhất.
- **Thu hẹp phạm vi dynamic**: giữ phần lớn trang tĩnh, chỉ bọc mảnh cá nhân hoá trong `Suspense` và stream về sau.
- **Cache ở tầng dữ liệu** thay vì gọi backend mỗi lần; gọi song song bằng `Promise.all` để tránh waterfall.
- Đặt **CDN** phía trước để phục vụ asset tĩnh, và cache những response dùng chung.

</details>

**14. `streaming` với `Suspense` cải thiện trải nghiệm ra sao khi một phần dữ liệu trong trang tải rất chậm?**

<details className="qa">
<summary>Xem đáp án</summary>

Không có streaming, server phải chờ **mọi** dữ liệu xong mới gửi HTML — một API chậm kéo cả trang đứng im, người dùng nhìn màn hình trắng.

Với `Suspense`, bạn bọc riêng phần chậm lại. Server gửi ngay phần HTML đã sẵn sàng (header, nav, nội dung chính) cùng với fallback của phần chậm; khi dữ liệu về, nó được **stream tiếp** xuống và thay chỗ fallback mà không cần reload.

```tsx
<Suspense fallback={<ReviewsSkeleton />}>
  <Reviews productId={id} />
</Suspense>
```

Lợi ích cụ thể: FCP và LCP không còn bị mẩu chậm nhất quyết định, người dùng thấy bố cục ngay nên cảm giác nhanh hơn hẳn, và phần chậm có skeleton rõ ràng thay vì trang trắng. Trong App Router, đặt file `loading.tsx` chính là cách khai báo một `Suspense` boundary cho cả route.

</details>

**15. Build output hiển thị các ký hiệu như `○`, `ƒ`, `●` — mỗi ký hiệu nghĩa là gì và bạn dùng chúng để debug rendering mode thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Ký hiệu trong build output cho biết mode của từng route:

- **`○` Static** — pre-render tại build time.
- **`ƒ` Dynamic** — render ở server mỗi request.
- **`●` ISR** — pre-render và revalidate định kỳ, thường in kèm khoảng thời gian.

```
○ /                    Static
ƒ /dashboard           Dynamic
● /products/[id]       ISR (3600s)
```

Cách dùng để debug: sau mỗi lần `npm run build`, đối chiếu output với **ý định** của bạn. Route tưởng tĩnh mà hiện `ƒ` nghĩa là đâu đó trong cây có thứ phụ thuộc request. Route tưởng ISR mà hiện `○` nghĩa là `revalidate` chưa có tác dụng.

Đây là cách kiểm chứng rẻ nhất, vì mental model của App Router là suy diễn ngầm — build output là nơi duy nhất cho bạn thấy Next.js đã suy ra điều gì.

</details>

**16. Một trang lẽ ra phải static nhưng build ra Dynamic — bạn điều tra nguyên nhân theo trình tự nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Điều tra theo trình tự từ rộng đến hẹp:

1. **Xác nhận hiện trạng** — chạy `npm run build`, xem route đó đúng là `ƒ` thay vì `○`.
2. **Rà dynamic API** — tìm trong toàn nhánh route xem có gọi `cookies()` hay `headers()` không, kể cả trong component dùng chung hay layout cha.
3. **Rà prop của page** — có nhận và đọc `searchParams` không.
4. **Rà các lần fetch** — có chỗ nào đặt `cache: "no-store"` hoặc khai báo route là dynamic không.
5. **Đi ngược cây component** — nhớ rằng chỉ một component lá cũng đủ làm cả route thành dynamic; bisect bằng cách tạm thay component nghi ngờ bằng nội dung tĩnh để khoanh vùng.
6. **Xử lý** — nếu phần dynamic là thật sự cần, cô lập nó vào một nhánh bọc `Suspense` để phần còn lại được pre-render; nếu là vô tình, bỏ hoặc thay bằng dữ liệu truyền từ trên xuống.

</details>

**17. Trang cần vừa cá nhân hoá vừa SEO tốt — bạn kết hợp các chiến lược ra sao để đạt cả hai?**

<details className="qa">
<summary>Xem đáp án</summary>

Ý tưởng là **tách trang thành hai phần** theo tính chất dữ liệu, thay vì ép cả trang vào một chiến lược:

- **Phần công khai, giống nhau với mọi người** — tiêu đề, mô tả, nội dung chính, dữ liệu có cấu trúc cho SEO: để **static hoặc ISR**. Đây chính là phần crawler đọc, nên nó phải có sẵn trong HTML.
- **Phần cá nhân hoá** — tên người dùng, giỏ hàng, giá riêng, gợi ý: tách thành nhánh riêng, bọc `Suspense` và **stream** về sau, hoặc để Client Component tự lấy sau khi mount.

Nhờ vậy bot nhận HTML đầy đủ nội dung cần index, còn người dùng vẫn thấy phần riêng của mình xuất hiện ngay sau đó.

Ngoài ra, không đặt dữ liệu cá nhân hoá ở layout cấp cao, vì nó sẽ kéo toàn bộ nhánh bên dưới sang dynamic. Nguyên tắc: **để nội dung SEO càng tĩnh càng tốt, đẩy phần cá nhân hoá xuống càng sâu càng tốt.**

</details>

**18. `output: "export"` đánh đổi những tính năng nào? Khi nào chấp nhận được và khi nào là sai lầm?**

<details className="qa">
<summary>Xem đáp án</summary>

`output: "export"` xuất toàn bộ site thành HTML tĩnh, nên mọi thứ cần server đều mất:

- Không Server Actions.
- Không Image Optimization (phải bật `unoptimized`).
- Không Middleware.
- Không API routes / route handlers.
- Không dynamic API như `cookies()`, `headers()`.
- Không SSR và không ISR — mọi trang phải static.

**Chấp nhận được** khi site thuần nội dung và phải deploy lên hạ tầng chỉ phục vụ file tĩnh: GitHub Pages, S3, Cloudflare Pages. Docs, blog, landing page rơi vào nhóm này, và đổi lại là chi phí gần bằng không cùng độ ổn định rất cao.

**Là sai lầm** khi sản phẩm có đăng nhập, form gửi dữ liệu, nội dung cá nhân hoá hoặc dữ liệu cần tươi. Chọn `export` trong những trường hợp đó nghĩa là sẽ phải dựng backend riêng cho từng tính năng bị thiếu — cuối cùng tốn hơn là chạy một Node server ngay từ đầu.

</details>

**19. `hydration` là gì trong bối cảnh Next.js, và lỗi hydration mismatch thường xuất phát từ đâu?**

<details className="qa">
<summary>Xem đáp án</summary>

Trong Next.js, **hydration** là bước React gắn tương tác vào HTML mà server đã render sẵn: browser hiển thị HTML ngay (FCP nhanh), rồi JS tải về, React dựng lại cây component ở client và gắn event listener vào đúng các node có sẵn — lúc đó trang mới thực sự bấm được.

**Hydration mismatch** xảy ra khi HTML từ server khác với những gì client render ở lần đầu. Nguồn gốc thường gặp:

- Giá trị không tất định: `Date.now()`, `Math.random()`.
- Kiểm tra `typeof window === "undefined"` rồi render hai nhánh khác nhau.
- Định dạng theo locale hoặc timezone — server chạy UTC, client chạy giờ local.
- Browser extension chèn thêm DOM vào trang.

Phòng tránh: giữ render đầu tiên tất định, đẩy phần phụ thuộc trình duyệt xuống `useEffect`, và truyền thời gian/locale xuống như props thay vì tính lại ở hai phía.

</details>

**20. Nếu API backend chậm và không ổn định, bạn chọn chiến lược rendering + caching nào để trang vẫn phục vụ được người dùng?**

<details className="qa">
<summary>Xem đáp án</summary>

Mục tiêu là **tách sự sống của trang khỏi sự ổn định của backend**:

- **Ưu tiên ISR** thay vì SSR. Trang phục vụ từ cache nên backend chậm không kéo TTFB xuống, và mỗi chu kỳ chỉ gọi API một lần thay vì mỗi request một lần.
- **Tăng thời gian revalidate** và dùng `revalidateTag` để làm mới chủ động khi có thay đổi thật — vừa tươi vừa không phụ thuộc vào TTL ngắn.
- **Stream phần rủi ro**: bọc mảnh phụ thuộc API chậm trong `Suspense` để phần còn lại của trang hiện ngay.
- **Phòng thủ khi gọi API**: đặt timeout, `Promise.all` cho các lời gọi độc lập để tránh waterfall, và bắt lỗi ở từng mảnh bằng `error.tsx` riêng cho nhánh đó thay vì để sập cả trang.
- **Có phương án dự phòng**: khi API lỗi thì tiếp tục phục vụ bản cache cũ và hiển thị dữ liệu cũ còn hơn hiện trang trắng.

</details>
