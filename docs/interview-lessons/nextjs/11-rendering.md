---
sidebar_position: 11
title: "11. Rendering"
---

# 11. Rendering

## 1. Server vs Client Components

Bài học: [1. Server vs Client Components](../../nextjs/11-rendering/1_rendering-modes.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Trong App Router, một component không có directive nào thì mặc định là loại gì, và điều đó ảnh hưởng thế nào tới lượng JS gửi xuống trình duyệt?**

<details className="qa">
<summary>Xem đáp án</summary>

Mặc định là **Server Component** — không cần khai báo gì, chính vì vậy Server Component không có directive riêng, chỉ Client Component mới phải đánh dấu `"use client"`.

Ảnh hưởng tới bundle rất lớn: code của Server Component **không đi vào client bundle**. Nó chạy trên server, và những gì gửi xuống trình duyệt chỉ là HTML cho lần sơn đầu tiên cùng RSC payload mô tả kết quả render. Thư viện chỉ dùng trong Server Component — thư viện markdown, SDK database, thư viện format ngày tháng nặng nề — cũng ở lại server luôn.

```tsx
// app/page.tsx — Server Component, không directive
export default async function HomePage() {
  const users = await db.user.findMany(); // chạy trên server
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

Đây là lý do "mặc định Server, chỉ chuyển sang Client khi thật sự cần" là quy tắc thực dụng nhất trong App Router.

</details>

**2. Kể ra những thứ `Server Component` KHÔNG làm được (hook, event handler, browser API) và giải thích vì sao lại có giới hạn đó.**

<details className="qa">
<summary>Xem đáp án</summary>

Server Component không dùng được:

- **Hook trạng thái và vòng đời**: `useState`, `useEffect`, `useContext`, `useRef`.
- **Event handler**: `onClick`, `onChange`.
- **Browser API**: `window`, `document`, `localStorage`.

Lý do chung: nó chạy **một lần trên server rồi kết thúc**. Không có gì tồn tại sau đó để giữ state hay chạy lại khi state đổi, nên `useState` vô nghĩa. Event handler là hàm, mà hàm không serialize được để gửi qua mạng, nên không thể gắn vào HTML. Và browser API đơn giản là không tồn tại trong môi trường Node.

Đổi lại, Server Component được những thứ Client không có: là **async function** nên `await` thẳng vào database, đọc được biến môi trường bí mật, dùng được API của Node. Đây là một sự đánh đổi có chủ đích: mất tính tương tác, lấy về quyền truy cập dữ liệu và bundle nhẹ.

</details>

**3. `"use client"` thực chất đánh dấu điều gì — component đó chỉ chạy trong trình duyệt, hay nó là ranh giới của một nhánh trong cây component?**

<details className="qa">
<summary>Xem đáp án</summary>

Nó đánh dấu **ranh giới (boundary)**, không phải "chỉ chạy ở trình duyệt". Đây là hiểu lầm phổ biến nhất về directive này.

Client Component vẫn được server pre-render ra HTML cho lần tải đầu, giống hệt SSR truyền thống. Cái mà `"use client"` thật sự nói là: từ file này trở xuống, code phải được đóng gói gửi xuống trình duyệt để React còn hydrate và làm cho nó tương tác được.

Vì là ranh giới nên nó **lan xuống**: mọi component được import từ trong nhánh đó cũng trở thành Client, dù bản thân chúng không khai báo gì.

```tsx
// Counter.tsx có "use client"
// Sub.tsx KHÔNG khai báo gì — vẫn được coi là Client
function Sub() {
  return <div>Sub</div>;
}
```

Hệ quả thực tế: đặt `"use client"` càng gần gốc cây thì càng nhiều code bị kéo vào bundle. Chỉ cần khai báo ở đúng file mở đầu ranh giới, các con tự kế thừa.

</details>

**4. Một `Client Component` có được server render HTML lần đầu không? Mô tả các bước từ HTML đầu tiên tới lúc trang tương tác được (`hydration`).**

<details className="qa">
<summary>Xem đáp án</summary>

Có. Client Component vẫn được render trên server ở lần tải đầu — đó là lý do trang không bị trắng và vẫn tốt cho SEO.

Các bước:

- Server render cây component, bao gồm cả Client Component, thành **HTML** và gửi xuống. Người dùng đã nhìn thấy giao diện nhưng bấm chưa ăn.
- Trình duyệt tải **JS bundle** chứa code của các Client Component.
- React chạy **hydration**: duyệt lại cây, gắn event handler vào DOM có sẵn, khởi tạo state và chạy effect.
- Sau bước này trang mới thật sự tương tác được.

Vì vậy tên gọi "Client Component" hơi gây nhầm — chính xác hơn là component **chạy ở cả hai nơi**. Hai hệ quả cần nhớ: có một khoảng thời gian giao diện đã hiện mà chưa bấm được (càng nhiều Client Component thì khoảng này càng dài); và code trong thân component chạy cả trên server, nên đụng thẳng vào `window` ở đó sẽ lỗi — phải đưa vào `useEffect`.

</details>

**5. File A có `"use client"` và import file B (B không khai báo gì) — B là Server hay Client? Giải thích cơ chế kế thừa boundary.**

<details className="qa">
<summary>Xem đáp án</summary>

B là **Client Component**. Không khai báo gì chỉ có nghĩa "mặc định Server" khi module đó được kéo vào từ phía server; còn một khi đã nằm trong nhánh client thì nó được bundle cùng và chạy ở trình duyệt.

Cơ chế: `"use client"` đánh dấu điểm **bắt đầu** của ranh giới trong đồ thị module. Mọi thứ import từ điểm đó trở xuống đều thuộc phía client, nên chỉ cần khai báo ở file gốc của ranh giới, không phải rải directive vào từng file con.

```tsx
// Counter.tsx có "use client"
// Sub.tsx không cần khai báo — vẫn là Client vì được Counter import
```

Điểm dễ vấp: một module tiện ích dùng chung có thể vừa bị Server Component import, vừa bị Client Component import — khi đó nó được gói vào cả hai phía. Nếu module đó đụng tới database hay secret thì phải chặn bằng `import "server-only"` để build báo lỗi ngay thay vì âm thầm đẩy code xuống trình duyệt.

</details>

**6. So sánh `SSG`, `SSR`, `ISR` và `CSR`: mỗi chế độ đánh đổi gì giữa tốc độ, `SEO` và độ tươi của dữ liệu?**

<details className="qa">
<summary>Xem đáp án</summary>

| Chế độ | Render khi nào | Tốc độ | SEO | Độ tươi |
|---|---|---|---|---|
| SSG | Lúc build | Nhanh nhất, phục vụ qua CDN | Tốt | Chỉ đổi khi rebuild |
| ISR | Lúc build, rồi làm mới định kỳ | Gần bằng SSG | Tốt | Cũ tối đa bằng khoảng `revalidate` |
| SSR | Mỗi request | Chậm hơn, phụ thuộc server | Tốt | Luôn mới |
| CSR | Trong trình duyệt sau khi tải JS | Sơn đầu nhanh nhưng nội dung đến muộn | Yếu nhất | Mới, nhưng phải chờ fetch |

Cách chọn theo bài: landing và marketing dùng SSG; dashboard cá nhân hoá dùng SSR; trang sản phẩm dùng ISR để vừa nhanh vừa cập nhật giá; phần tương tác thuần như bộ lọc hay counter thì để CSR bằng `"use client"`.

Điểm cần nhấn: trong App Router đây không phải bốn ô loại trừ nhau — một trang có thể có phần tĩnh và phần động cùng lúc.

</details>

**7. `export const dynamic = "force-static"`, `"force-dynamic"` và `export const revalidate` khác nhau ra sao? Cho ví dụ trang nên dùng từng loại.**

<details className="qa">
<summary>Xem đáp án</summary>

Ba cách khai báo ở cấp route, đều ghi đè suy luận tự động của Next.js:

```ts
export const dynamic = "force-static";  // luôn dựng sẵn
export const dynamic = "force-dynamic"; // luôn render mỗi request
export const revalidate = 60;           // dựng sẵn nhưng làm mới sau 60 giây
```

- `force-static` cho trang chắc chắn không phụ thuộc request: trang giới thiệu, điều khoản sử dụng, landing page.
- `force-dynamic` cho trang gắn với phiên đăng nhập: dashboard, giỏ hàng, trang tài khoản.
- `revalidate` cho trang chấp nhận cũ một chút để đổi lấy tốc độ: danh sách bài viết, trang sản phẩm.

Lưu ý quan trọng: `force-static` mà trang lại gọi `cookies()` hay `headers()` thì các API đó không có dữ liệu thật của request, trang sẽ render như với khách vãng lai — mất trạng thái đăng nhập. Chỉ ép static khi chắc chắn nội dung giống nhau với mọi người.

</details>

**8. Với trang chi tiết sản phẩm e-commerce (giá và tồn kho đổi liên tục nhưng vẫn cần `SEO`), bạn chọn chế độ render nào và lập luận thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Chọn **ISR làm nền, kết hợp revalidate theo yêu cầu**, và tách riêng phần biến động mạnh.

Lập luận từng lớp:

- Phần khung có giá trị SEO — tên, mô tả, ảnh, đánh giá — đổi rất ít, nên dựng sẵn để bot và người dùng nhận HTML đầy đủ ngay lập tức.
- Đặt `revalidate` như một lưới an toàn để nội dung không bao giờ kẹt cũ quá lâu.
- Khi admin sửa giá, gọi `revalidateTag` cho đúng sản phẩm để trang cập nhật ngay mà không phải rebuild cả site.
- Riêng tồn kho thời gian thực — thứ thay đổi từng giây và không quan trọng với SEO — tách thành một Client Component tự gọi API sau khi mount.

Vì sao không chọn SSR thuần: mỗi lượt xem đều phải render và truy vấn, với catalog lớn và lưu lượng cao là lãng phí, trong khi 95% nội dung trang chẳng đổi. Vì sao không CSR thuần: nội dung chính đến sau JS, hại SEO — đúng thứ trang sản phẩm cần nhất.

</details>

**9. Vì sao `Client Component` không import trực tiếp được `Server Component`? Cách đúng để đặt một `Server Component` bên trong cây Client là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì import là quan hệ ở tầng module: hễ một file client import file khác, file đó bị kéo vào **bundle client**. Mà Server Component thường chứa truy vấn database, secret, API của Node — những thứ không thể và không được chạy ở trình duyệt. Nên bundler báo lỗi ngay thay vì để lọt.

```tsx
// SAI — Client import Server component
"use client";
import ServerComp from "./ServerComp";
export function ClientWrapper() {
  return <ServerComp />; // build error
}
```

Cách đúng là đảo chiều quan hệ: đừng để Client import Server, hãy để **Server truyền phần tử đã render xuống Client** qua `children` hoặc qua một prop kiểu JSX.

```tsx
// page.tsx (Server)
function Page() {
  return <ClientWrapper serverContent={<ServerComp />} />;
}
```

Lúc này Client Component không hề biết gì về code của Server Component — nó chỉ nhận một phần tử đã dựng sẵn và quyết định đặt ở đâu.

</details>

**10. Giải thích pattern "Server in Client" — truyền qua `children` hoặc JSX element làm prop. Lúc đó phần Server được render ở đâu và khi nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Pattern này cho phép một Client Component bọc ngoài nội dung do Server dựng:

```tsx
// page.tsx (Server)
<ClientWrapper>
  <UserCard user={user} />  {/* Server render bên trong wrapper */}
</ClientWrapper>
```

```tsx
// ClientWrapper.tsx
"use client";
export function ClientWrapper({ children }) {
  const [isOpen, setOpen] = useState(false);
  return <div>{isOpen && children}</div>;
}
```

Phần Server được render **trên server, trong cùng lượt render của trang cha**, rồi kết quả đi xuống client như một phần của payload. Client Component chỉ nhận một slot đã dựng sẵn và quyết định đặt nó ở đâu, hiện hay ẩn.

Hai điểm hay bị hỏi thêm: code của `UserCard` **không** vào bundle client, nên vẫn giữ được lợi ích Server Component. Và vì nó đã render sẵn nên không thể render lại theo state của wrapper — ở ví dụ trên, dù ban đầu bị ẩn, nội dung vẫn được dựng từ trước chứ không chờ tới lúc mở.

</details>

**11. Props truyền từ Server sang Client phải thoả điều kiện gì? Chuyện gì xảy ra nếu bạn truyền một function làm prop?**

<details className="qa">
<summary>Xem đáp án</summary>

Props phải **serialize được**, vì chúng đi qua mạng trong payload RSC. Chấp nhận: chuỗi, số, boolean, `null`, mảng, object thuần, `Date`, `Map`, `Set`, và phần tử JSX. Không chấp nhận: function, class instance, `Symbol`, và các object mang hành vi như client của ORM.

Truyền một function thường sẽ báo lỗi ngay khi render, kèm thông điệp nói rõ prop đó không serialize được.

Ngoại lệ quan trọng: **Server Action** vẫn truyền xuống được, vì nó không được gửi nguyên hàm mà chỉ là một tham chiếu để client gọi ngược về server.

```tsx
// SAI
<ClientComp onSave={() => db.save()} />
// ĐÚNG — action đã đánh dấu "use server"
<ClientComp action={saveAction} />
```

Kèm theo là lưu ý bảo mật đã nói ở bài trước: mọi props qua ranh giới đều lộ ra trình duyệt, nên chỉ truyền DTO đã lọc field, không truyền nguyên bản ghi từ database.

</details>

**12. Vì sao nên đẩy `"use client"` xuống càng sâu (component lá) càng tốt? Nếu đặt ngay đầu `page.tsx` thì bạn mất những lợi ích nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì ranh giới lan xuống: đặt ở đâu thì từ đó trở xuống đều thành Client. Đặt ngay đầu `page.tsx` là biến cả trang thành Client và mất gần hết lợi ích của App Router:

- Toàn bộ code component và thư viện chúng dùng bị gói vào bundle — tải lâu hơn, hydrate lâu hơn.
- Không còn `await` thẳng vào database trong component; phải dựng thêm API route và gọi từ `useEffect`, tức thêm một vòng round-trip và mất dữ liệu ở lần sơn đầu.
- Không đọc được biến môi trường bí mật ở đó.

```tsx
// Tệ — cả trang là Client chỉ vì cần một ô lọc
"use client";
function Page() { const [filter, setFilter] = useState(""); /* ... */ }

// Tốt — giữ trang là Server, chỉ phần tương tác là Client
async function ProductsSection() {
  const products = await fetchProducts();
  return <ProductListInteractive products={products} />;
}
```

Nguyên tắc: tìm đúng component lá thật sự cần state hay event, chỉ đánh dấu ở đó.

</details>

**13. Phân biệt ba directive: `"use client"` đầu file, `"use server"` đầu file, và `"use server"` bên trong function. Chúng có đối lập nhau không?**

<details className="qa">
<summary>Xem đáp án</summary>

| Directive | Vị trí | Ý nghĩa |
|---|---|---|
| `"use client"` | Đầu file | File này và mọi thứ nó import thuộc phía Client |
| `"use server"` | Đầu file | Mọi export của file là Server Action |
| `"use server"` | Trong thân function | Riêng function đó là Server Action |

Chúng **không đối lập nhau** — đây là câu hỏi bẫy hay gặp. `"use client"` đánh dấu ranh giới của **component**; `"use server"` đánh dấu **hàm có thể gọi từ client nhưng chạy trên server**. Hai khái niệm khác trục.

Bằng chứng là chúng dùng chung được: một file `"use client"` vẫn có thể import Server Action từ file `"use server"`, hoặc chứa function đánh dấu `"use server"` bên trong.

Cũng lưu ý: Server Component **không có directive** — đó là mặc định. Và viết hai directive chồng nhau ở đầu một file là vô nghĩa, không phải cách để có "cả hai".

</details>

**14. `Server Action` là gì, khác `route handler` (`API route`) ở điểm nào, và khi nào bạn chọn cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Server Action là function đánh dấu `"use server"`, chạy trên server nhưng gọi được từ client như một hàm bình thường — không phải tự viết endpoint, tự khai báo kiểu hay tự gọi `fetch`.

| | Route Handler | Server Action |
|---|---|---|
| URL công khai | Có | Không có URL do mình đặt |
| Method | GET, POST, PUT, DELETE | POST |
| Type safety | Khai báo thủ công | Tự động từ TypeScript |
| Gắn vào form | Không | Có, qua prop `action` |
| Hoạt động khi chưa có JS | Không | Có |

Chọn Server Action cho mutation nội bộ: submit form, CRUD trong ứng dụng của mình. Chọn Route Handler khi bên ngoài cần một URL ổn định hoặc method khác POST: webhook, OAuth callback, API cho app mobile hay bên thứ ba.

Lưu ý bảo mật: Server Action tuy không lộ URL nhưng vẫn là endpoint public, nên phải xác thực và validate input ngay đầu function.

</details>

**15. `RSC payload` là gì? Nó khác HTML và khác JS bundle ra sao, và được dùng ở lần tải đầu hay lúc điều hướng sau đó?**

<details className="qa">
<summary>Xem đáp án</summary>

RSC payload là **định dạng dữ liệu mô tả kết quả render** của cây Server Component — gần giống JSON, gồm phần tử đã dựng, props, và các chỗ đánh dấu vị trí của Client Component.

Phân biệt ba thứ trình duyệt nhận được:

- **HTML** — dùng cho lần sơn đầu tiên và cho bot tìm kiếm đọc.
- **RSC payload** — để React dựng lại cây trong bộ nhớ, và dùng cho các lần điều hướng sau.
- **JS bundle** — code của Client Component, cần để hydrate.

Nó được dùng ở **cả hai giai đoạn**: lần tải đầu gửi kèm HTML, và mỗi lần điều hướng sau đó thì server chỉ gửi payload chứ không gửi cả trang HTML mới.

Điểm quan trọng: khi nội dung Server Component đổi, trình duyệt chỉ cần payload mới — **không phải tải thêm JS**, vì code đó vốn không nằm ở client. Đây là lý do gốc khiến App Router tiết kiệm bundle.

</details>

**16. Vì sao bundle của App Router thường nhỏ hơn Pages Router với cùng tính năng?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì ở Pages Router, mọi component đều phải gửi xuống client để hydrate — kể cả những component thuần hiển thị, không có một dòng tương tác nào. Toàn bộ thư viện chúng dùng cũng đi theo.

App Router đảo ngược mặc định: component là Server trừ khi được đánh dấu. Code Server Component **không hề vào bundle**, và những thư viện nặng chỉ dùng ở đó — bộ phân tích markdown, thư viện xử lý ngày tháng, SDK database, thư viện cú pháp highlight — ở lại server luôn.

Thêm nữa, việc cập nhật nội dung diễn ra qua RSC payload, tức chỉ dữ liệu, thay vì phải ship code component.

Cần nói rõ giới hạn khi trả lời: lợi ích này không tự động. Nếu dự án rải `"use client"` ngay đầu các trang thì gần như quay lại mô hình cũ và bundle chẳng nhỏ hơn bao nhiêu. Nó đến từ kỷ luật giữ ranh giới client ở đúng các component lá.

</details>

**17. Bạn cần `useState` cho phần lọc, nhưng dữ liệu lại lấy từ DB bằng secret key — thiết kế cây component thế nào cho đúng?**

<details className="qa">
<summary>Xem đáp án</summary>

Tách làm hai tầng: Server lấy dữ liệu, Client lo tương tác.

```tsx
// Server — đọc DB bằng secret, lọc field trước khi truyền
async function ProductsSection() {
  const products = await fetchProducts(); // secret ở lại server
  return <ProductListInteractive products={products} />;
}

// ProductListInteractive.tsx
"use client";
function ProductListInteractive({ products }) {
  const [filter, setFilter] = useState("");
  // lọc và render phía client
}
```

Những điểm cần nêu khi trả lời:

- Secret và kết nối database chỉ tồn tại ở nhánh Server, không bao giờ đi xuống props.
- Props truyền xuống phải là DTO đã chọn field, vì mọi props qua ranh giới đều lộ trong payload.
- Nếu tập dữ liệu quá lớn để đẩy hết xuống trình duyệt, đổi cách: cho bộ lọc đẩy trạng thái lên URL qua `searchParams` rồi để Server lọc và render lại — vừa đỡ bundle vừa có link chia sẻ được.

</details>

**18. Một thư viện UI bên thứ ba dùng hook nhưng không khai báo `"use client"`, import vào Server Component thì lỗi. Bạn xử lý ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Không sửa được thư viện thì tự dựng ranh giới cho nó: tạo một file trung gian có `"use client"` rồi export lại.

```tsx
// components/ui.tsx
"use client";
export { Carousel, Modal } from "some-ui-lib";
```

Sau đó Server Component import từ file trung gian này thay vì import thẳng từ thư viện. Ranh giới nằm ở file của mình, còn thư viện thì nằm trọn trong nhánh client.

Vài lưu ý kèm theo:

- Chỉ export lại những thành phần thật sự cần, đừng gom cả thư viện, kẻo kéo theo cả đống code vào bundle.
- Nếu chỉ vài chỗ dùng và chúng khá nặng, cân nhắc nạp động để không chặn lần tải đầu.
- Thư viện đụng tới `window` ngay lúc import có thể vẫn lỗi khi server pre-render — khi đó phải nạp động và tắt render phía server cho nó.
- Trước khi làm, kiểm tra xem thư viện có bản cập nhật hỗ trợ App Router không; nhiều thư viện đã bổ sung directive ở các phiên bản mới.

</details>

**19. `Context Provider` (theme, auth, react-query) nên đặt ở đâu trong App Router để không biến cả cây thành Client?**

<details className="qa">
<summary>Xem đáp án</summary>

Gom các provider vào một Client Component riêng, rồi cho nó bọc `children` trong layout gốc.

```tsx
// app/providers.tsx
"use client";
export function Providers({ children }) {
  return <ThemeProvider><QueryClientProvider client={qc}>{children}</QueryClientProvider></ThemeProvider>;
}
```

```tsx
// app/layout.tsx — vẫn là Server Component
import { Providers } from "./providers";
export default function RootLayout({ children }) {
  return <html><body><Providers>{children}</Providers></body></html>;
}
```

Mấu chốt nằm ở chỗ `children` được truyền **từ phía Server xuống**, chứ không phải được provider import. Vì ranh giới client chỉ lan theo quan hệ import, các trang nằm trong `children` vẫn là Server Component bình thường, vẫn `await` database được.

Bổ sung: cố gắng đặt provider ở phạm vi hẹp nhất đủ dùng — chỉ nhánh nào cần thì bọc nhánh đó. Và dữ liệu chỉ đọc, không đổi theo tương tác thì truyền bằng props hoặc lấy trực tiếp ở Server Component, không cần context.

</details>

**20. Làm sao đảm bảo code chứa secret không vô tình lọt vào client bundle? Nêu vai trò của `server-only` và quy ước `NEXT_PUBLIC_`.**

<details className="qa">
<summary>Xem đáp án</summary>

Ba lớp bổ trợ nhau:

- **`server-only`**: thêm `import "server-only"` vào đầu mọi module chạm database hay secret. Nếu một nhánh client lỡ import module đó, build **lỗi ngay** thay vì âm thầm gói code vào bundle. Đây là lớp ép buộc ở mức compile, khác hẳn quy ước đặt tên thư mục vốn không ràng buộc gì.
- **Quy ước `NEXT_PUBLIC_`**: chỉ biến có tiền tố này mới đọc được ở client, và giá trị của nó bị **inline tĩnh** vào bundle lúc build. Secret để tên trần, không tiền tố — Client Component đọc sẽ nhận `undefined`. Hệ quả kèm theo: đổi giá trị biến công khai thì phải build lại.
- **Kỷ luật ở ranh giới props**: chỉ truyền DTO đã lọc field, không truyền nguyên bản ghi; có thể dùng `taint` để React chặn khi lỡ tay.

Chốt chặn cuối: build production rồi grep chuỗi nhạy cảm trong thư mục output, và đưa bước đó cùng một secret scanner vào CI.

</details>

---

## 2. Boundaries và Streaming

Bài học: [2. Boundaries và Streaming](../../nextjs/11-rendering/2_boundaries-streaming.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `Streaming` trong Next.js là gì và nó giải quyết vấn đề gì so với cách chờ đủ toàn bộ dữ liệu rồi mới gửi HTML?**

<details className="qa">
<summary>Xem đáp án</summary>

Streaming là gửi HTML **theo từng phần ngay khi phần đó sẵn sàng**, thay vì chờ mọi dữ liệu xong rồi mới gửi một cục.

Vấn đề của cách cũ: một khối chậm kéo cả trang xuống theo.

```tsx
async function Page() {
  const main = await fetchMain();             // 0.2s
  const recos = await fetchRecommendations();  // 2s — chậm nhất
  // → user nhìn màn hình trắng ~2s dù nội dung chính xong từ 0.2s
}
```

Với streaming, phần nhanh đi trước, phần chậm được bọc trong `<Suspense>` và hiện skeleton, rồi nội dung thật được đẩy xuống sau:

```tsx
<MainContent />
<Suspense fallback={<RecoSkeleton />}>
  <Recommendations />
</Suspense>
```

Lợi ích không chỉ là cảm giác nhanh hơn: nó **cô lập rủi ro**. Một API chậm hay lỗi chỉ ảnh hưởng đúng vùng của nó, phần còn lại của trang vẫn hiển thị và dùng được bình thường.

</details>

**2. `Suspense boundary` hoạt động thế nào phía server — server gửi gì trước, gửi gì sau, và trình duyệt ráp lại bằng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Server render cây component và khi gặp một component đang chờ dữ liệu, nó **không dừng lại**: nó gửi ngay phần khung cùng nội dung `fallback` của boundary đó, đánh dấu vị trí bằng một placeholder, rồi tiếp tục render phần khác.

Khi dữ liệu của vùng đó xong, server gửi thêm một chunk chứa nội dung thật kèm chỉ dẫn "chỗ này thay vào placeholder kia". Tất cả đi trên **cùng một kết nối HTTP** theo kiểu chunked transfer, không phải request mới.

Phía trình duyệt, React đọc các chunk đến dần và tráo skeleton bằng nội dung thật, giữ nguyên phần đã hiển thị.

```
t=0: HTML shell + 2 skeleton
t=1: chunk Stats → thay skeleton thứ nhất
t=2: chunk Chart → thay skeleton thứ hai
```

Điểm đáng nhớ: thứ tự các vùng về đích phụ thuộc tốc độ dữ liệu, không theo thứ tự trong code — vùng nào xong trước hiện trước.

</details>

**3. Giải thích vì sao streaming cải thiện rõ `TTFB` và `FCP`, nhưng chưa chắc cải thiện `LCP`.**

<details className="qa">
<summary>Xem đáp án</summary>

- **TTFB** đo lúc byte đầu tiên về tới trình duyệt. Streaming cho phép gửi header và phần shell ngay, không chờ dữ liệu, nên chỉ số này cải thiện gần như chắc chắn.
- **FCP** đo lúc có nội dung đầu tiên được vẽ. Skeleton cũng tính là nội dung, nên FCP cũng tốt lên rõ rệt.
- **LCP** lại đo thời điểm **phần tử lớn nhất** trong khung nhìn hiện ra. Nếu phần tử đó — ảnh banner, khối nội dung chính — nằm trong một `Suspense` chờ API chậm, thì nó vẫn xuất hiện muộn y như cũ. Skeleton không được tính thay.

Bài học thực dụng: đừng bọc nội dung chính vào Suspense chỉ vì thấy streaming có vẻ hay. Hãy để phần lớn nhất và quan trọng nhất render thẳng, chỉ stream những khối phụ như "gợi ý cho bạn" hay "sản phẩm liên quan". Streaming cải thiện **cảm nhận** về tốc độ, nhưng nếu đặt boundary sai chỗ thì chỉ số LCP có thể không nhúc nhích.

</details>

**4. Bạn bọc `Suspense` quanh một component nhưng component cha vẫn `await` — vì sao vẫn bị `waterfall`? Sửa thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì `await` ở component cha **chặn toàn bộ việc render** của nó. Chừng nào lời gọi đó chưa xong, React còn chưa đi tới cây con, nên `Suspense` bên trong chưa hề được xử lý và component con cũng chưa bắt đầu lấy dữ liệu.

```tsx
// Tệ — vẫn waterfall
async function Page() {
  const user = await fetchUser(); // chặn ở đây
  return (
    <Suspense fallback={<Skeleton />}>
      <Orders /> {/* chỉ khởi động sau khi fetchUser xong */}
    </Suspense>
  );
}
```

Cách sửa: **bỏ `await` ở cha**, để mỗi component con tự lấy dữ liệu của mình trong boundary riêng.

```tsx
function Page() {
  return (
    <>
      <Suspense fallback={<UserSkeleton />}><User /></Suspense>
      <Suspense fallback={<OrderSkeleton />}><Orders /></Suspense>
    </>
  );
}
```

Lúc này hai lời gọi chạy **song song**, tổng thời gian bằng lời gọi chậm nhất chứ không phải tổng cộng. Quy tắc: component cha chỉ nên bố cục, việc chờ dữ liệu đẩy xuống lá.

</details>

**5. Nêu ít nhất hai cách để hai lời gọi dữ liệu độc lập chạy song song thay vì tuần tự trong một Server Component.**

<details className="qa">
<summary>Xem đáp án</summary>

**Cách một — tách thành hai component con, mỗi cái một `Suspense`.** Mỗi con tự `await` phần của mình nên hai lời gọi khởi động cùng lúc, và vùng nào xong trước hiện trước.

**Cách hai — khởi tạo promise trước rồi `await` chung một lần** khi bắt buộc phải lấy cả hai trong cùng component:

```tsx
async function Page() {
  const userPromise = fetchUser();   // khởi động ngay
  const ordersPromise = fetchOrders();
  const [user, orders] = await Promise.all([userPromise, ordersPromise]);
}
```

Điểm mấu chốt là gọi hàm **trước**, `await` **sau** — viết `await fetchUser()` rồi mới `await fetchOrders()` là tuần tự.

Lưu ý thêm: `Promise.all` sẽ hỏng cả cụm nếu một lời gọi lỗi; cần chịu lỗi từng phần thì dùng `Promise.allSettled`, hoặc quay về cách một để mỗi vùng có `error.tsx` riêng. Cách một thường tốt hơn cho trải nghiệm vì không phải chờ cái chậm nhất mới hiện được gì.

</details>

**6. `loading.tsx` tương đương với cấu trúc nào viết tay? Nó bọc `Suspense` ở phạm vi nào của route?**

<details className="qa">
<summary>Xem đáp án</summary>

`loading.tsx` là đường tắt: Next.js tự bọc một `Suspense` quanh nội dung của route, lấy chính component đó làm `fallback`.

```tsx
// app/dashboard/loading.tsx  ⇔  viết tay:
<Suspense fallback={<PageSkeleton />}>
  <Dashboard />
</Suspense>
```

Phạm vi của nó là **cấp segment route nơi đặt file**: nó bao cả `page.tsx` của segment đó và mọi route con bên dưới, nằm bên trong `layout.tsx` cùng cấp. Nghĩa là khi điều hướng, layout và nav vẫn hiện bình thường, chỉ phần nội dung được thay bằng skeleton.

Hệ quả cần nắm: nó là một boundary **thô, tất cả hoặc không gì** — chỉ cần một phần của trang còn chờ là cả vùng nội dung hiện skeleton. Muốn từng khối tự hiện khi sẵn sàng thì phải đặt thêm `Suspense` thủ công bên trong page. Hai thứ này lồng nhau được và thường dùng chung.

</details>

**7. Khi nào dùng `loading.tsx`, khi nào cần `Suspense` thủ công bên trong page? Kết hợp cả hai thì luồng hiển thị diễn ra ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`loading.tsx`** cho phản hồi tức thì khi điều hướng: người dùng bấm link là thấy ngay skeleton của cả trang, không bị cảm giác treo.
- **`Suspense` thủ công** để chia trang thành nhiều vùng, mỗi vùng hiện độc lập khi dữ liệu của nó xong.

Kết hợp cả hai là bố cục phổ biến nhất:

```
app/dashboard/
├── loading.tsx   # hiện khi điều hướng tới /dashboard
└── page.tsx      # bên trong dùng Suspense cho từng khối
```

Luồng hiển thị:

1. Người dùng bấm link — `loading.tsx` hiện ngay lập tức.
2. Trang bắt đầu render — phần không chờ dữ liệu như `PageHeader` hiện liền, kèm skeleton cho từng khối.
3. `UserCard`, `StatsCard` lần lượt stream xuống khi mỗi cái sẵn sàng.

Kết quả là luôn có phản hồi ở mọi thời điểm, không bao giờ có khoảng trắng. Điều kiện để bước 2 và 3 đúng như mô tả: `page.tsx` **không** được `await` ở cấp ngoài cùng.

</details>

**8. `error.tsx` phối hợp với `Suspense` thế nào khi một vùng đang stream thì gặp lỗi? Phần còn lại của trang có bị ảnh hưởng không?**

<details className="qa">
<summary>Xem đáp án</summary>

`error.tsx` tạo một error boundary cho segment route, và nó bao lấy các vùng bên trong tương tự như `loading.tsx`. Khi một component đang stream ném lỗi, React bắt tại boundary gần nhất và thay vùng đó bằng giao diện lỗi, **không phá phần đã gửi xuống trước đó**.

Vì vậy phần còn lại của trang vẫn hiển thị và dùng được — đây chính là giá trị lớn của việc chia boundary: lỗi được cô lập theo vùng.

Vài điểm hay bị hỏi thêm:

- Muốn mỗi khối có thông báo lỗi riêng, đặt error boundary quanh từng khối chứ đừng dựa vào một `error.tsx` duy nhất ở cấp trang.
- `error.tsx` là Client Component, nhận `reset` để thử lại vùng đó mà không tải lại cả trang.
- Không hiển thị message lỗi thô ra người dùng; log chi tiết ở server, phía client chỉ hiện thông điệp chung.
- Lỗi xảy ra **trước** khi stream bắt đầu thì xử lý dễ hơn; lỗi xảy ra giữa chừng chỉ còn cách thay nội dung vùng, vì header đã gửi đi rồi.

</details>

**9. Mô tả `RSC wire format` và HTTP chunked transfer: các chunk được gửi và parse thế nào trên client?**

<details className="qa">
<summary>Xem đáp án</summary>

Server không trả một file HTML hoàn chỉnh mà mở một response **chunked transfer**: header đi ngay, phần thân được đẩy dần theo nhiều mảnh trên cùng kết nối.

```
HTTP/1.1 200 OK
Content-Type: text/x-component

[chunk 1] HTML shell
[chunk 2] placeholder của Suspense
[chunk 3 — sau khi resolve] nội dung thật
```

Nội dung các chunk theo **RSC wire format**: một định dạng dòng lệnh dạng văn bản mô tả cây đã render — phần tử, props, tham chiếu tới Client Component và các placeholder chờ hoàn thiện. Nó không phải HTML và cũng không phải code JavaScript của component.

Phía client, React đọc luồng này và dựng dần cây trong bộ nhớ, tráo placeholder khi chunk tương ứng về tới. Vì là luồng liên tục nên giao diện cập nhật tăng dần chứ không đợi kết thúc response.

Điểm đáng nói: cùng định dạng đó được dùng lại cho các lần điều hướng sau, khi đó chỉ gửi payload chứ không gửi HTML mới.

</details>

**10. `Selective hydration` là gì và `Suspense` giúp nó ra sao? Một bundle JS nặng ở một vùng có chặn cả trang trở nên tương tác không?**

<details className="qa">
<summary>Xem đáp án</summary>

Selective hydration là việc React hydrate **từng vùng độc lập** thay vì phải hoàn tất cả cây mới cho phép tương tác. Mỗi `Suspense` là một đơn vị hydrate riêng: vùng nào có đủ HTML và JS thì hydrate luôn, không chờ hàng xóm.

Nên câu trả lời cho vế sau là **không**: một khối nặng — chẳng hạn biểu đồ kéo theo thư viện lớn — chỉ làm chậm chính vùng của nó. Nav, form tìm kiếm, nút bấm ở nơi khác đã tương tác được từ trước.

Thêm nữa, React ưu tiên theo hành vi người dùng: nếu ai đó tương tác với một vùng chưa hydrate, vùng đó được đẩy lên đầu hàng đợi.

Hệ quả khi thiết kế: chia boundary quanh những khối nặng về JS, không chỉ quanh khối chậm về dữ liệu. Và kết hợp với việc nạp động cho thư viện lớn để vùng đó không chiếm băng thông của phần quan trọng hơn.

</details>

**11. Nếu người dùng click vào một vùng chưa `hydrate` xong thì React xử lý sự kiện đó thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

React **không để rơi** sự kiện đó. Nó ghi lại tương tác, ưu tiên hydrate ngay vùng vừa được chạm vào — chen lên trước những vùng khác đang xếp hàng — rồi phát lại sự kiện khi vùng đó đã sẵn sàng. Với người dùng, cảm giác là nút bấm hơi trễ một nhịp chứ không phải bấm vào hư không.

Có giới hạn cần nói rõ khi trả lời:

- Cơ chế này áp dụng cho các sự kiện rời rạc như click; không cứu được mọi loại tương tác, ví dụ gõ liên tục vào ô nhập liệu vẫn có thể rơi mất ký tự.
- Nó chỉ giảm nhẹ hậu quả chứ không thay thế việc giảm lượng JS. Vùng càng nặng thì độ trễ càng rõ.

Hệ quả thực hành: với các điều khiển quan trọng, ưu tiên giữ chúng nhẹ và đặt trong boundary riêng để hydrate sớm; tránh dồn cả trang vào một khối client khổng lồ.

</details>

**12. Kể các kiểu dữ liệu truyền được và KHÔNG truyền được qua boundary Server sang Client. Vì sao lại có ràng buộc serialize?**

<details className="qa">
<summary>Xem đáp án</summary>

| Truyền được | Không truyền được |
|---|---|
| Chuỗi, số, boolean, `null` | Function thường |
| Object thuần, mảng | Instance của class tự định nghĩa |
| `Date` | `Symbol` |
| `Map`, `Set` | DOM node |
| Phần tử JSX | Kết nối database, client của thư viện |

Lý do của ràng buộc: props phải **vượt qua mạng**. Server và trình duyệt là hai tiến trình khác nhau, thứ duy nhất đi giữa chúng là dữ liệu đã mã hoá thành văn bản. Function mang theo closure và tham chiếu tới môi trường của nó — không có cách nào gói lại rồi dựng lại y nguyên ở đầu kia.

```tsx
<ClientComp data={data} onClick={() => {}} /> // onClick báo lỗi
```

Hai lưu ý đi kèm: Server Action là ngoại lệ vì nó chỉ gửi một tham chiếu để gọi ngược về server. Và mọi props qua ranh giới đều lộ ra trình duyệt, nên chỉ truyền DTO đã lọc field.

</details>

**13. Muốn `Client Component` gọi được logic phía server trong khi function không serialize được thì làm cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng **Server Action**. Nó là lời giải trực tiếp cho đúng bài toán này: hàm được đánh dấu `"use server"`, và cái đi xuống client không phải thân hàm mà chỉ là một tham chiếu để gọi ngược về server.

```ts
// actions.ts
"use server";
export async function handleClick(id: string) { /* ... */ }
```

```tsx
// page.tsx (Server)
import { handleClick } from "./actions";
return <ClientButton onClick={handleClick} />;
```

Client Component nhận prop đó và gọi như hàm bình thường; Next.js lo phần gửi request về server. Không phải tự dựng API route, không phải tự khai báo kiểu — kiểu suy ra thẳng từ TypeScript.

Cách còn lại là viết Route Handler rồi `fetch` từ client; chọn nó khi cần URL công khai hoặc method khác POST.

Nhắc lại điểm bảo mật: action tuy không lộ URL nhưng vẫn là endpoint public, nên phải xác thực và validate input ngay đầu function, đừng tin rằng chỉ UI của mình gọi nó.

</details>

**14. `server-only` và `client-only` dùng để làm gì, và chúng bắt lỗi ở thời điểm nào — build time hay runtime?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai package nhỏ dựng **hàng rào ở mức module**, và chúng báo lỗi ngay lúc **build**, không phải đợi tới runtime.

```ts
// lib/secret.ts
import "server-only";
export const secret = process.env.SECRET;
```

```ts
// lib/browser.ts
import "client-only";
export function getViewport() { return { w: window.innerWidth }; }
```

- `server-only` chặn module bị kéo vào nhánh client — dùng cho file đụng database, secret, API của Node.
- `client-only` chặn module bị render trên server — dùng cho code đụng `window`, `document`, `localStorage`.

Cơ chế: mỗi package có hai bản export theo điều kiện môi trường, bản dành cho phía "sai" cố tình gây lỗi, nên bundler dừng lại ngay.

Giá trị lớn nhất là biến một **quy ước mềm** — kiểu "nhớ đừng import file này vào client" — thành lỗi cứng bị CI chặn, thay vì một sự cố rò rỉ phát hiện trên production.

</details>

**15. Streaming ảnh hưởng thế nào tới `SEO`? Bot tìm kiếm có đọc được nội dung được stream về sau không?**

<details className="qa">
<summary>Xem đáp án</summary>

Nội dung stream vẫn là **HTML do server sinh ra** trên cùng một response, chỉ là đến muộn hơn vài trăm mili giây. Các công cụ tìm kiếm hiện đại đọc hết response nên nhìn thấy đầy đủ — khác hẳn nội dung do JS ở client dựng sau khi tải xong, vốn phụ thuộc vào việc bot có chịu chạy JS hay không.

Dù vậy vẫn nên thận trọng, và đây là phần ghi điểm khi trả lời:

- Đặt nội dung quan trọng nhất cho SEO — tiêu đề, mô tả, nội dung chính — **ngoài** Suspense, để nó nằm ngay trong shell đầu tiên.
- `metadata` và thẻ head được xử lý sớm, đừng để chúng phụ thuộc vào dữ liệu chậm.
- Vùng stream chậm bất thường có rủi ro bot bỏ ngang; đặt thời gian chờ hợp lý cho các lời gọi dữ liệu.
- Kiểm chứng bằng công cụ xem HTML thực tế mà bot nhận được, đừng đoán.

Chỉ nên stream những khối phụ: gợi ý, đánh giá, sản phẩm liên quan.

</details>

**16. Khi header HTTP đã gửi đi rồi (streaming đã bắt đầu) thì còn đổi được status code hay `redirect` không? Hệ quả với xử lý lỗi là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Không. Status code và header nằm ở phần đầu response, đã rời server ngay từ chunk đầu tiên. Sau đó có lỗi gì thì response vẫn mang mã 200, và chuyển hướng cũng không còn thực hiện được bằng header nữa — chỉ còn cách xử lý ở phía client sau khi trang đã tải.

Hệ quả khi thiết kế:

- Mọi quyết định về **status và điều hướng** phải xảy ra **trước khi streaming bắt đầu**: kiểm tra đăng nhập và phân quyền ở middleware hoặc ở ngay đầu cây render, trước mọi `await` nằm trong Suspense.
- Kiểm tra sự tồn tại của tài nguyên sớm để còn trả về trang 404 đúng nghĩa; phát hiện muộn thì chỉ hiện được thông báo trong một vùng, trong khi mã trạng thái vẫn là 200 — điều này ảnh hưởng tới SEO.
- Lỗi phát sinh giữa chừng chỉ còn cách thay nội dung vùng đó bằng giao diện lỗi qua error boundary.

Tóm lại: xác thực và điều hướng đặt sớm, chỉ stream phần hiển thị.

</details>

**17. Đặt quá nhiều hoặc quá ít `Suspense boundary` gây hệ quả gì? Bạn chọn mức granularity dựa trên tiêu chí nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Quá ít**: cả trang chờ theo khối chậm nhất, gần như quay lại cách không streaming; một lỗi cũng kéo sập phạm vi rộng.

**Quá nhiều**: giao diện nhấp nháy vì hàng chục vùng lần lượt tráo chỗ, dễ gây dịch chuyển bố cục, và mỗi boundary còn thêm một chút chi phí cho việc quản lý chunk. Người dùng thấy rối hơn là thấy nhanh.

Tiêu chí chọn mức phù hợp:

- Bọc theo **khối có nghĩa với người dùng** — một thẻ thống kê, một biểu đồ, một danh sách đánh giá — chứ không bọc từng phần tử nhỏ.
- Bọc quanh phần **thật sự chậm hoặc nặng JS**; phần nhanh cứ để render thẳng.
- Giữ nội dung quan trọng nhất và phần tử lớn nhất **ngoài** boundary, vì lý do LCP và SEO.
- Gộp những khối có thời gian tải xấp xỉ nhau vào chung một boundary để đỡ nhấp nháy.

Cách kiểm chứng: xem thời điểm từng vùng về đích trên tab network và đo lại chỉ số trước sau.

</details>

**18. Thiết kế skeleton `fallback` thế nào để tránh `CLS` khi nội dung thật thay chỗ?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên tắc duy nhất: skeleton phải **chiếm đúng chỗ** mà nội dung thật sẽ chiếm.

Cách làm cụ thể:

- Cho vùng chứa một chiều cao xác định, hoặc dựng skeleton mô phỏng đúng số dòng, số thẻ, khoảng cách của nội dung thật.
- Đặt tỷ lệ khung hình cho ảnh và video ngay ở skeleton để không bị đẩy nội dung khi ảnh tải xong.
- Dùng cùng hệ thống bố cục — cùng lưới, cùng khoảng đệm — giữa skeleton và nội dung thật, tốt nhất là dùng chung một component khung.
- Với danh sách dài không đoán được số dòng, cố định số dòng skeleton và giữ chiều cao vùng chứa, chấp nhận cuộn thêm còn hơn để trang giật.

Đo lường: xem chỉ số CLS trong công cụ đo hiệu năng của trình duyệt và ghi lại các thay đổi bố cục trong lúc vùng stream về.

Điểm cộng khi trả lời: skeleton nhại đúng hình dáng nội dung không chỉ đẹp mà còn giúp người dùng đoán trước cái sắp hiện, giảm cảm giác chờ.

</details>

**19. `PPR` (Partial Prerendering) liên quan gì tới `Suspense` và streaming? Nó khác gì so với `SSR` thuần có streaming?**

<details className="qa">
<summary>Xem đáp án</summary>

PPR là ý tưởng kết hợp tĩnh và động **trên cùng một trang**: phần khung tĩnh — header, bố cục, nội dung không đổi — được dựng sẵn từ trước và phục vụ ngay như một trang tĩnh, còn những vùng phụ thuộc request được để trống và stream vào sau.

`Suspense` chính là thứ đánh dấu ranh giới giữa hai phần đó: cái gì nằm trong boundary thì được coi là phần động, cái gì ngoài boundary thuộc về shell tĩnh.

Khác biệt với SSR có streaming:

| | SSR + streaming | PPR |
|---|---|---|
| Shell được dựng khi nào | Mỗi request | Trước, từ lúc build |
| Byte đầu tiên đến từ đâu | Server phải render | Có thể phục vụ từ biên, gần như tức thì |
| Phần động | Stream trong cùng request | Stream vào chỗ trống của shell |

Nói ngắn: SSR streaming giúp trang hiện dần, PPR giúp phần khung hiện **ngay lập tức** như trang tĩnh. Đây là tính năng còn ở giai đoạn thử nghiệm, nên khi trả lời nên nêu rõ điều đó.

</details>

**20. Một trang streaming vẫn chậm — bạn dùng chỉ số và công cụ nào để xác định boundary nào đang nghẽn?**

<details className="qa">
<summary>Xem đáp án</summary>

Quy trình từ ngoài vào trong:

- Xem **TTFB, FCP, LCP** trước để biết nghẽn ở đâu. TTFB cao nghĩa là có thứ chặn ngay trước khi stream bắt đầu — thường là một `await` ở component cha, hoặc middleware chậm. TTFB tốt nhưng LCP xấu nghĩa là phần tử lớn nhất đang nằm trong một boundary chậm.
- Mở tab network, xem response của trang: các chunk về ở mốc thời gian nào cho biết vùng nào tới muộn.
- Đo ngay trong code: ghi lại thời gian trước và sau mỗi lời gọi dữ liệu trong từng async component, hoặc dùng cơ chế instrumentation để xuất trace cho từng đoạn.
- Kiểm tra waterfall: hai lời gọi lẽ ra song song mà lại nối đuôi nhau là dấu hiệu `await` đặt sai chỗ.
- Nhìn cả phía cache: một vùng chậm bất thường có thể chỉ đơn giản là đang miss cache.

Sau khi tìm ra thủ phạm, hướng xử lý thường là bỏ `await` ở cha, cho chạy song song, thêm cache, hoặc chuyển khối đó xuống component client.

</details>
