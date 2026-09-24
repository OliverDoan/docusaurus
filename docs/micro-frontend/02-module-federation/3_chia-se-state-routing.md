---
sidebar_position: 3
title: "3. Chia sẻ State & Routing"
---

# Chia sẻ State & Routing giữa các mảnh

Khi đã ghép được nhiều mảnh, bài toán tiếp theo là: làm sao chúng **giao tiếp** và
**điều hướng** mà vẫn giữ được tính độc lập? Bài này trình bày các mẫu chia sẻ
**state** (trạng thái) và **routing** (định tuyến) giữa host và remote — kèm
nguyên tắc giữ ràng buộc (coupling) ở mức thấp nhất.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Mục tiêu là `coupling` lỏng** — các mảnh giao tiếp qua hợp đồng rõ ràng, không thò tay vào ruột nhau.
- **Ưu tiên `props` & `callback`** (lỏng & rõ nhất); dùng `CustomEvent` cho giao tiếp ngang hàng, framework-agnostic.
- **`Shared store` chỉ cho dữ liệu toàn cục tối thiểu** (user, theme), để `singleton`, kẻo biến thành "monolith trá hình".
- ⭐ **Routing: host sở hữu router chính, gắn mỗi nhánh URL cho một remote** — chia sẻ `react-router-dom` dạng `singleton`, quy ước tiền tố URL cho từng mảnh.

:::

---

## Mục lục

- [Nguyên tắc vàng: ràng buộc lỏng](#nguyên-tắc-vàng-ràng-buộc-lỏng)
- [Truyền dữ liệu xuống: props & callback](#truyền-dữ-liệu-xuống-props--callback)
- [Giao tiếp ngang: custom events](#giao-tiếp-ngang-custom-events)
- [State dùng chung: shared store (thận trọng)](#state-dùng-chung-shared-store-thận-trọng)
- [Routing giữa các mảnh](#routing-giữa-các-mảnh)
- [Bảng chọn nhanh](#bảng-chọn-nhanh)
- [Tóm tắt](#tóm-tắt)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Nguyên tắc vàng: ràng buộc lỏng

> **Coupling** (ràng buộc): mức độ các mảnh phụ thuộc vào ruột của nhau. Mục tiêu
> của micro-frontend là **coupling lỏng** — các mảnh chỉ giao tiếp qua **hợp đồng
> rõ ràng**, không thò tay vào nội bộ nhau.

Thứ tự ưu tiên (từ lỏng → chặt):

1. **Props & callback** — host truyền dữ liệu/hàm xuống remote. *Ưu tiên nhất.*
2. **Custom events** — các mảnh phát/nghe sự kiện, không biết nhau trực tiếp.
3. **Shared store** — kho state dùng chung. *Dùng dè dặt vì tạo coupling chặt.*

:::tip Chọn cách lỏng nhất đủ dùng
Càng chia sẻ nhiều state trực tiếp, các mảnh càng dính nhau → mất luôn lợi ích
"độc lập deploy". Hãy chọn cơ chế **lỏng nhất mà vẫn đủ giải quyết bài toán**.
:::

## Truyền dữ liệu xuống: props & callback

Cách đơn giản và an toàn nhất: host coi remote như một component bình thường,
**truyền props xuống** và nhận kết quả qua **callback**.

```jsx
// HOST truyền dữ liệu + hàm xử lý xuống remote
const RemoteCart = React.lazy(() => import('remote_app/Cart'))

<Suspense fallback={<span>Đang tải giỏ hàng…</span>}>
  <RemoteCart
    userId={currentUser.id}                  // dữ liệu truyền xuống
    onCheckout={(items) => handleCheckout(items)}  // remote gọi ngược lên
  />
</Suspense>
```

```jsx
// REMOTE chỉ nhận qua props — không cần biết host là ai
export default function Cart({ userId, onCheckout }) {
  // ... dùng userId, gọi onCheckout(items) khi cần
}
```

> Đây là **hợp đồng** rõ ràng: remote chỉ phụ thuộc vào *hình dạng props*, không
> phụ thuộc vào host cụ thể. Đổi host khác vẫn chạy.

## Giao tiếp ngang: custom events

Khi hai mảnh **ngang hàng** cần báo tin cho nhau (vd thêm sản phẩm ở mảnh A, giỏ
hàng ở mảnh B cập nhật), dùng **CustomEvent** của trình duyệt — bên phát và bên
nghe **không cần biết nhau**:

```js
// Mảnh A — phát sự kiện khi thêm vào giỏ
window.dispatchEvent(
  new CustomEvent('cart:add', { detail: { productId: 'sku-123', qty: 1 } })
)
```

```js
// Mảnh B — lắng nghe và cập nhật
function onAdd(e) {
  updateCart(e.detail)
}
window.addEventListener('cart:add', onAdd)
// Nhớ gỡ listener khi unmount để tránh rò rỉ bộ nhớ
// return () => window.removeEventListener('cart:add', onAdd)
```

- ✅ Ràng buộc rất lỏng; framework-agnostic (mảnh React, Vue đều dùng được).
- ❌ Cần **quy ước tên sự kiện + cấu trúc `detail`** rõ ràng (nên ghi vào tài
  liệu chung); khó truy vết hơn props.

> Quy ước đặt tên theo `mien:hanh-dong` (vd `cart:add`, `auth:logout`) giúp tránh
> trùng và dễ đọc.

## State dùng chung: shared store (thận trọng)

Đôi khi nhiều mảnh cần cùng một state (vd thông tin đăng nhập). Có thể chia sẻ một
**store** (kho state, vd Redux/Zustand) qua `shared`, nhưng đây là **coupling
chặt nhất** — dùng dè dặt.

Cách an toàn hơn: chia sẻ một **store nhỏ, chỉ-đọc cho dữ liệu thực sự toàn cục**
(như user hiện tại, theme), còn state riêng để mỗi mảnh tự quản:

```js
// shared trong cả host & remote (giống cách shared react)
shared: {
  zustand: { singleton: true },           // 1 bản store duy nhất
  react: { singleton: true },
  'react-dom': { singleton: true },
}
```

:::warning Đừng biến shared store thành "monolith trá hình"
Nếu mọi mảnh đọc/ghi chung một store khổng lồ, bạn đã tái tạo lại monolith — chỉ
khác là khó debug hơn. Giới hạn shared store ở **dữ liệu toàn cục tối thiểu**.
:::

## Routing giữa các mảnh

Có hai tầng định tuyến:

- **Routing cấp shell** — host quyết định *mảnh nào* hiển thị ở URL nào (vd
  `/cart` → mảnh giỏ hàng).
- **Routing nội bộ mảnh** — mỗi mảnh tự định tuyến bên trong nó (vd `/cart/coupon`).

Mẫu phổ biến: **host sở hữu router chính**, gắn mỗi đường dẫn gốc với một remote;
remote nhận "basename" (tiền tố URL) để định tuyến nội bộ không đụng nhau.

```jsx
// HOST: mỗi route gốc trỏ tới một remote
<Routes>
  <Route path="/cart/*" element={<RemoteCart />} />
  <Route path="/profile/*" element={<RemoteProfile />} />
</Routes>
```

Lưu ý quan trọng:

- **Một bản router duy nhất** — chia sẻ `react-router-dom` dạng `singleton` để
  tránh hai router đánh nhau trên cùng thanh địa chỉ.
- **Quy ước tiền tố URL** — mỗi mảnh "sở hữu" một nhánh đường dẫn (`/cart/*`), để
  routing nội bộ của nó không chồng lấn mảnh khác.

```js
shared: {
  'react-router-dom': { singleton: true },
}
```

## Bảng chọn nhanh

| Nhu cầu | Cơ chế nên dùng | Mức ràng buộc |
| --- | --- | --- |
| Host đưa dữ liệu xuống mảnh | **Props & callback** | Lỏng ✅ |
| Hai mảnh ngang hàng báo tin | **Custom events** | Lỏng ✅ |
| Dữ liệu toàn cục tối thiểu (user, theme) | **Shared store nhỏ, singleton** | Trung bình |
| Mọi mảnh đọc/ghi state lớn chung | *(tránh)* | Chặt ❌ |
| Điều hướng giữa các mảnh | **Router ở shell + `singleton`** | Trung bình |

## Tóm tắt

- Mục tiêu là **coupling lỏng**: các mảnh giao tiếp qua hợp đồng, không thò vào
  ruột nhau.
- **Props & callback** là cách ưu tiên (lỏng & rõ ràng); **custom events** cho
  giao tiếp ngang hàng framework-agnostic.
- **Shared store** chỉ dùng cho **dữ liệu toàn cục tối thiểu**, để `singleton`,
  tránh biến thành monolith trá hình.
- **Routing**: host sở hữu router chính và gắn mỗi nhánh URL cho một remote; chia
  sẻ `react-router-dom` dạng `singleton`, quy ước tiền tố URL cho từng mảnh.

Hết mục Module Federation. Mục tiếp theo: **tích hợp với Next.js** và những lưu ý
đặc thù.

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Vì sao `coupling` lỏng là mục tiêu số một khi cho các mảnh giao tiếp với nhau?**

<details className="qa">
<summary>Xem đáp án</summary>

Coupling là mức độ các mảnh phụ thuộc vào **ruột** của nhau. Càng chia sẻ nhiều state trực tiếp, các mảnh càng dính nhau — và khi đã dính thì một thay đổi ở mảnh này buộc mảnh kia phải sửa và deploy theo, tức là **mất luôn lợi ích độc lập deploy**, thứ duy nhất biện minh cho toàn bộ chi phí của kiến trúc này.

Coupling lỏng nghĩa là các mảnh chỉ giao tiếp qua **hợp đồng rõ ràng** — hình dạng props, tên và payload của sự kiện — chứ không thò tay vào nội bộ nhau. Khi đó mỗi nhóm được tự do đổi cách cài đặt bên trong miễn là giữ đúng hợp đồng.

Nguyên tắc thực dụng đi kèm: chọn **cơ chế lỏng nhất mà vẫn đủ giải quyết bài toán**, đừng chọn cơ chế mạnh hơn mức cần thiết chỉ vì nó tiện.

</details>

**2. Xếp các cơ chế giao tiếp từ lỏng đến chặt và nêu tiêu chí bạn dùng để chọn cơ chế cho một tình huống cụ thể.**

<details className="qa">
<summary>Xem đáp án</summary>

Thứ tự từ lỏng tới chặt:

1. **Props & callback** — host truyền dữ liệu và hàm xuống remote. Ưu tiên nhất.
2. **Custom events** — các mảnh phát/nghe sự kiện, không biết nhau trực tiếp.
3. **Shared store** — kho state dùng chung. Dùng dè dặt vì tạo coupling chặt.

| Nhu cầu | Cơ chế nên dùng | Mức ràng buộc |
| --- | --- | --- |
| Host đưa dữ liệu xuống mảnh | Props & callback | Lỏng |
| Hai mảnh ngang hàng báo tin | Custom events | Lỏng |
| Dữ liệu toàn cục tối thiểu (user, theme) | Shared store nhỏ, singleton | Trung bình |
| Mọi mảnh đọc/ghi state lớn chung | *(tránh)* | Chặt |
| Điều hướng giữa các mảnh | Router ở shell + singleton | Trung bình |

Tiêu chí chọn: quan hệ là **cha–con hay ngang hàng**, dữ liệu là **một chiều hay hai chiều**, phạm vi là **cục bộ hay thật sự toàn cục**, và các mảnh có **cùng framework** hay không.

</details>

**3. Vì sao `props` và `callback` được ưu tiên nhất? "Hợp đồng" giữa host và remote ở đây gồm những gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì đây là cách vừa đơn giản vừa an toàn nhất: host coi remote như một component bình thường, truyền dữ liệu xuống và nhận kết quả qua callback. Luồng dữ liệu một chiều, rõ ràng, dễ debug và kiểm tra được bằng kiểu.

```jsx
<RemoteCart
  userId={currentUser.id}
  onCheckout={(items) => handleCheckout(items)}
/>
```

Remote chỉ phụ thuộc vào **hình dạng props**, không phụ thuộc vào host cụ thể — đổi sang host khác vẫn chạy, và test remote độc lập rất dễ vì chỉ cần truyền props giả.

Hợp đồng ở đây gồm:

- **Tên và kiểu của từng prop**, cái nào bắt buộc, cái nào tuỳ chọn.
- **Chữ ký các callback** — nhận tham số gì, được gọi khi nào.
- **Hành vi mong đợi** khi thiếu dữ liệu hoặc khi đang tải.
- Ngầm định về **quyền sở hữu**: remote không tự ý đọc thêm gì ngoài props.

</details>

**4. Khi host và remote dùng framework khác nhau, props/callback còn dùng được không? Bạn thay bằng cơ chế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Không dùng trực tiếp được, vì props là khái niệm nội bộ của từng framework — host React không thể render component Vue bằng cách truyền props như thường.

Cách thay thế:

- **Hàm mount/unmount tường minh** — remote phơi ra một hàm nhận phần tử DOM và một object cấu hình, bên trong nó tự khởi tạo framework của mình. Đây là cách phổ biến nhất và chính là mẫu mà single-spa dùng.
- **Web Component làm bao bì** — remote đóng gói thành custom element; host đặt thẻ vào DOM, truyền dữ liệu phức tạp qua property và nhận phản hồi qua `CustomEvent`.
- **Custom events** cho giao tiếp ngang hàng, vì chúng thuộc về trình duyệt nên framework nào cũng dùng được.

Về bản chất, cả ba đều giữ nguyên tinh thần của props/callback — dữ liệu đi xuống, sự kiện đi lên — chỉ đổi phương tiện từ cơ chế của framework sang cơ chế của trình duyệt. Và như bài trước đã nói, trộn framework nên là lựa chọn có lý do, không phải mặc định.

</details>

**5. `CustomEvent` của trình duyệt hoạt động thế nào? So sánh với một event bus tập trung kiểu `RxJS Subject`.**

<details className="qa">
<summary>Xem đáp án</summary>

`CustomEvent` là cơ chế sẵn có của trình duyệt: một mảnh phát sự kiện lên `window`, các mảnh khác lắng nghe tên sự kiện đó và đọc dữ liệu trong `detail`.

```js
window.dispatchEvent(
  new CustomEvent('cart:add', { detail: { productId: 'sku-123', qty: 1 } })
)
```

| | `CustomEvent` | Event bus (`RxJS Subject`) |
| --- | --- | --- |
| Phụ thuộc | Không, có sẵn trong trình duyệt | Thêm thư viện, phải `shared`/singleton |
| Framework | Dùng được với mọi framework | Cũng được, nhưng phải cùng bản thư viện |
| Khả năng | Phát/nghe cơ bản | Toán tử mạnh: lọc, gộp, debounce, replay |
| Trạng thái trước đó | Ai nghe muộn thì mất tin | Có thể phát lại giá trị gần nhất |
| Coupling | Rất lỏng | Chặt hơn — mọi mảnh chung một thư viện |
| Truy vết | Xem được ở devtools | Cần công cụ riêng |

Với micro-frontend, `CustomEvent` thường là lựa chọn đúng vì nó lỏng nhất và không bắt các mảnh phải đồng ý về một thư viện chung.

</details>

**6. Nên quy ước tên sự kiện và cấu trúc `detail` ra sao? Khi payload sự kiện cần đổi thì versioning thế nào để không vỡ mảnh khác?**

<details className="qa">
<summary>Xem đáp án</summary>

Quy ước đặt tên theo dạng `mien:hanh-dong` — ví dụ `cart:add`, `auth:logout` — giúp tránh trùng tên toàn cục và đọc là hiểu ngay ai phát. Miền nên trùng với mảnh sở hữu sự kiện đó.

Về `detail`, nên:

- Luôn là một **object**, không phải giá trị trần, để sau này thêm field mà không vỡ.
- Chỉ chứa **định danh và dữ liệu tối thiểu**, để bên nghe tự đi lấy chi tiết — payload càng to càng dễ lệch.
- Được ghi vào **tài liệu chung**, vì đây là API công khai giữa các nhóm chứ không phải chi tiết nội bộ.

Về versioning, nguyên tắc là **chỉ thay đổi theo hướng cộng thêm**:

- Thêm field mới, giữ field cũ cho tới khi mọi bên đã chuyển.
- Khi buộc phải đổi phá vỡ, **phát thêm một sự kiện tên mới** (ví dụ thêm hậu tố phiên bản) và phát song song cả hai trong giai đoạn chuyển tiếp, rồi mới gỡ sự kiện cũ.
- Bên nghe nên bỏ qua an toàn những payload không hiểu thay vì ném lỗi.

</details>

**7. Rò rỉ bộ nhớ do `addEventListener` giữa các mảnh xảy ra thế nào và phòng tránh ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Listener được đăng ký trên `window` — một đối tượng sống suốt vòng đời trang — trong khi component của mảnh thì mount rồi unmount liên tục. Nếu không gỡ listener lúc unmount, hàm xử lý vẫn nằm lại và giữ tham chiếu tới toàn bộ closure của component: state, dữ liệu đã tải, thậm chí cả cây DOM cũ.

Hậu quả không chỉ là tốn bộ nhớ: mỗi lần mount lại, mảnh đăng ký thêm một listener, nên một sự kiện sẽ kích hoạt hàm xử lý nhiều lần, gây cập nhật trùng lặp và những lỗi rất khó tái hiện.

Phòng tránh:

```js
useEffect(() => {
  const onAdd = (e) => updateCart(e.detail)
  window.addEventListener('cart:add', onAdd)
  return () => window.removeEventListener('cart:add', onAdd)
}, [])
```

Vài lưu ý: phải gỡ đúng **cùng một tham chiếu hàm** đã đăng ký, nên không dùng hàm ẩn danh viết trực tiếp ở hai chỗ. Với mảnh có nhiều listener, dùng `AbortController` để gỡ tất cả một lần. Và nếu remote có hàm unmount riêng, hàm đó phải dọn cả listener, timer lẫn subscription.

</details>

**8. Khi nào chấp nhận dùng `shared store`? Vì sao lạm dụng nó bị gọi là "monolith trá hình"?**

<details className="qa">
<summary>Xem đáp án</summary>

Chấp nhận được khi dữ liệu **thực sự toàn cục và ổn định**: người dùng đang đăng nhập, theme, ngôn ngữ, quyền hạn. Đặc điểm chung là ít thay đổi hình dạng, nhiều mảnh cần, và không mảnh nào "sở hữu" riêng. Cách an toàn là giữ một store **nhỏ, chủ yếu chỉ đọc**, còn state riêng thì mỗi mảnh tự quản.

Gọi là "monolith trá hình" khi mọi mảnh cùng đọc/ghi một store khổng lồ. Lúc đó:

- Đổi hình dạng state buộc **mọi mảnh phải sửa và deploy cùng lúc** — hết độc lập deploy.
- Không ai biết mảnh nào đã ghi giá trị sai, debug khó hơn hẳn monolith thật.
- Các mảnh phải dùng chung một thư viện state và một phiên bản.
- Thứ tự khởi tạo giữa các mảnh trở thành yếu tố quyết định, sinh ra lỗi chỉ xuất hiện lúc chạy.

Nói cách khác, bạn trả đủ chi phí của kiến trúc phân tán nhưng vẫn giữ nguyên ràng buộc của monolith.

</details>

**9. Chia sẻ Redux hay Zustand qua `shared: singleton` gặp vấn đề gì nếu hai mảnh build với hai phiên bản khác nhau?**

<details className="qa">
<summary>Xem đáp án</summary>

Với `singleton`, toàn trang chỉ dùng **một thực thể duy nhất** — nên bản được nạp trước hoặc bản cao hơn sẽ phục vụ tất cả, còn mảnh yêu cầu bản khác chỉ nhận được một cảnh báo lệch phiên bản rồi vẫn chạy tiếp.

Vấn đề nảy sinh:

- Mảnh build với bản mới có thể gọi **API chưa tồn tại** trong bản đang chạy, lỗi chỉ lộ ra lúc runtime ở đúng nhánh code đó.
- Nếu đổi giữa hai bản major, hành vi có thể khác âm thầm — không ném lỗi nhưng kết quả sai.
- Bỏ `singleton` để mỗi mảnh dùng bản riêng thì lại có **hai store độc lập**: mảnh này ghi, mảnh kia không thấy — còn khó phát hiện hơn.

Cách xử lý: khai `requiredVersion` rõ ràng, bật `strictVersion` ở môi trường phát triển để lỗi lộ sớm, và quan trọng nhất là **thống nhất lịch nâng cấp** thư viện state cho cả tổ chức. Đây cũng chính là lý do nên giữ shared store ở mức tối thiểu — càng ít phụ thuộc chung thì càng ít ràng buộc phiên bản.

</details>

**10. Đặt state dùng chung vào URL hoặc query param có ưu điểm gì? Khi nào cách này phù hợp hơn shared store?**

<details className="qa">
<summary>Xem đáp án</summary>

Ưu điểm:

- **Không tạo coupling giữa các mảnh** — URL là thứ trình duyệt đã có sẵn, không mảnh nào phải phụ thuộc thư viện hay hình dạng store của mảnh khác.
- **Chia sẻ và lưu lại được** — người dùng copy link gửi cho nhau, đánh dấu trang, mở lại đúng trạng thái.
- **Nút back/forward hoạt động đúng** một cách tự nhiên.
- **Sống sót qua reload** mà không cần lưu trữ gì thêm.
- Dễ debug: nhìn thanh địa chỉ là biết trạng thái.

Phù hợp hơn shared store khi state **mô tả "người dùng đang xem gì"**: bộ lọc, từ khoá tìm kiếm, trang hiện tại, tab đang mở, khoảng thời gian của báo cáo.

Không phù hợp khi dữ liệu **nhạy cảm** (token, thông tin cá nhân), **quá lớn** để nhét vào URL, hoặc thay đổi liên tục từng mili giây. Dữ liệu kiểu người dùng đăng nhập và theme vẫn nên nằm ở shared store nhỏ.

</details>

**11. Thông tin xác thực và `token` nên chia sẻ giữa các mảnh theo cách nào cho an toàn? Ai chịu trách nhiệm làm mới token?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên tắc: **một nơi duy nhất sở hữu phiên đăng nhập**, thường là shell. Các mảnh không tự đăng nhập, không tự lưu token, không tự làm mới.

Cách chia sẻ an toàn hơn cả là **không chia sẻ token dạng chuỗi**:

- Shell truyền xuống **thông tin người dùng đã lọc** (id, tên, quyền) cùng một **hàm gọi API đã kèm sẵn xác thực**, để mảnh dùng mà không bao giờ chạm vào token.
- An toàn nhất là dùng **cookie `HttpOnly`** do server đặt — token không tồn tại trong JavaScript, nên một mảnh bị lỗi cũng không đọc được.
- Tránh nhét token vào `localStorage` hay biến toàn cục, vì mọi mảnh đều đọc được và mọi script chèn vào trang cũng vậy.

**Làm mới token là việc của shell** — nếu mỗi mảnh tự làm, nhiều mảnh sẽ cùng gọi làm mới một lúc và có thể vô hiệu hoá token của nhau. Shell nên gom các lời gọi trùng, và khi phiên hết hạn thì phát một sự kiện kiểu `auth:logout` để mọi mảnh dọn dẹp cùng lúc.

Cần nhớ: mọi mảnh chạy chung một origin, nên ranh giới ở đây là **kỷ luật thiết kế**, không phải rào chắn kỹ thuật.

</details>

**12. Phân biệt routing cấp shell và routing nội bộ của một mảnh. Ai nên sở hữu đối tượng `history`?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Routing cấp shell** — host quyết định *mảnh nào* hiển thị ở URL nào, ví dụ `/cart` thuộc mảnh giỏ hàng.
- **Routing nội bộ mảnh** — mỗi mảnh tự định tuyến bên trong nhánh của mình, ví dụ `/cart/coupon`.

```jsx
<Routes>
  <Route path="/cart/*" element={<RemoteCart />} />
  <Route path="/profile/*" element={<RemoteProfile />} />
</Routes>
```

Dấu `*` ở cuối là chỗ shell "nhường quyền" phần còn lại của đường dẫn cho mảnh.

**Shell nên sở hữu đối tượng `history`** — nó là bên khởi động trang, tồn tại suốt phiên và biết toàn cảnh bản đồ URL. Các mảnh thì mount/unmount liên tục nên không thể giữ một trạng thái điều hướng bền vững. Mảnh chỉ *dùng* history do shell cung cấp thông qua router dùng chung, chứ không tự tạo history riêng — nếu hai bên cùng ghi vào thanh địa chỉ, back/forward sẽ hoạt động sai.

</details>

**13. Vì sao `react-router-dom` phải để `singleton`? Hai bản router cùng chạy trên một thanh địa chỉ sẽ hỏng thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Router giữ trạng thái điều hướng trong bộ nhớ và đồng bộ nó với một tài nguyên **toàn cục duy nhất**: thanh địa chỉ và ngăn xếp history của trình duyệt. Chỉ có một thanh địa chỉ, nên chỉ được có một bên cầm trịch.

```js
shared: {
  'react-router-dom': { singleton: true },
}
```

Nếu có hai bản cùng chạy:

- Mỗi bản giữ một bản sao vị trí hiện tại, nên chúng **lệch nhau** — một bên đã chuyển trang, bên kia vẫn nghĩ đang ở trang cũ.
- Cả hai cùng đẩy mục vào history, nên **một lần điều hướng sinh hai mục**: người dùng phải bấm back hai lần mới thoát.
- Context của router bị "thủng": component của remote gọi hook điều hướng nhưng không tìm thấy Provider thuộc cùng bản, gây lỗi kiểu "phải dùng bên trong Router".
- `Link` của mảnh có thể khiến trình duyệt tải lại cả trang thay vì chuyển mềm.

Đây cũng là lý do `singleton` cần cho mọi thư viện giữ trạng thái toàn cục, không riêng React.

</details>

**14. `basename` và quy ước tiền tố URL dùng để làm gì? Xử lý deep-link thẳng vào một route sâu bên trong remote ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

`basename` là tiền tố URL mà mảnh được cấp. Nhờ nó, mảnh định tuyến nội bộ bằng đường dẫn tương đối và **không cần biết mình đang được gắn ở đâu** — cùng một mảnh có thể nằm ở `/cart` trong trang này và `/gio-hang` trong trang khác mà không sửa code.

Quy ước tiền tố cũng chính là cách phân chia quyền sở hữu: mỗi mảnh "sở hữu" một nhánh đường dẫn, nên routing nội bộ của nó không bao giờ chồng lấn mảnh khác.

Với deep-link thẳng vào route sâu, ví dụ người dùng mở trực tiếp `/cart/coupon/abc`:

- Shell đọc URL, khớp tiền tố `/cart/*`, và **tải remote tương ứng** — cần hiển thị trạng thái chờ vì bước này đi qua mạng.
- Truyền `basename` cùng phần đường dẫn còn lại xuống mảnh để nó tự khớp route nội bộ.
- Nếu remote tải thất bại, phải có fallback thay vì trang trắng.
- Nếu URL không khớp tiền tố nào, shell hiển thị trang không tìm thấy — đây là trách nhiệm của shell, không phải của mảnh.

</details>

**15. Một remote cần điều hướng sang mảnh khác (vd giỏ hàng sang thanh toán). Thiết kế cơ chế nào để nó không phụ thuộc cứng vào mảnh kia?**

<details className="qa">
<summary>Xem đáp án</summary>

Điểm mấu chốt: mảnh giỏ hàng **không được biết mảnh thanh toán tồn tại**. Nó chỉ biết ý định "người dùng muốn thanh toán", còn việc ý định đó dẫn tới đâu là chuyện của shell.

Các cách thiết kế, từ ưu tiên cao xuống:

- **Callback từ shell** — shell truyền xuống một hàm kiểu `onCheckout`, mảnh gọi khi cần. Rõ ràng nhất, hợp với quan hệ cha–con, và shell toàn quyền quyết định đích đến.
- **Custom event** — mảnh phát `cart:checkout`, shell lắng nghe và điều hướng. Hợp khi mảnh nằm sâu hoặc không có quan hệ cha–con trực tiếp.
- **Điều hướng bằng URL** qua router dùng chung — chấp nhận được, nhưng đường dẫn bị viết cứng trong mảnh, nên nếu đổi cấu trúc URL là phải sửa nhiều nơi.

Thứ nên tránh tuyệt đối: `import` trực tiếp module của mảnh kia, hoặc gọi hàm mà mảnh kia gắn lên biến toàn cục. Cả hai biến hai mảnh thành một khối phải deploy cùng nhau, và nếu mảnh kia chưa tải thì hỏng ngay.

</details>

**16. Làm sao giữ lại trạng thái người dùng khi họ chuyển qua lại giữa các mảnh khiến remote bị unmount rồi mount lại?**

<details className="qa">
<summary>Xem đáp án</summary>

Trước hết cần phân loại trạng thái, vì mỗi loại có chỗ ở khác nhau:

- **Trạng thái mô tả "đang xem gì"** (bộ lọc, từ khoá, trang, tab) — đặt vào **URL**. Đây là cách sạch nhất: sống sót qua unmount, qua reload, qua cả việc chia sẻ link.
- **Dữ liệu lấy từ server** — dùng **cache theo khoá** ở tầng lấy dữ liệu, để mount lại thì hiện ngay dữ liệu cũ rồi mới làm mới ngầm. Không cần giữ component sống.
- **Dữ liệu toàn cục** (người dùng, theme, giỏ hàng) — để ở **shared store nhỏ, singleton** nằm ngoài vòng đời của mảnh.
- **Bản nháp người dùng đang gõ dở** — lưu tạm vào `sessionStorage` theo khoá riêng của mảnh, và dọn khi đã gửi.

Cách cuối cùng là **giữ mảnh mount nhưng ẩn đi** thay vì unmount. Nó giữ được mọi thứ nhưng tốn bộ nhớ và dễ sinh listener chạy ngầm, nên chỉ dùng cho một hai mảnh người dùng chuyển qua lại liên tục.

Điều quan trọng: đừng dựa vào việc mảnh không bao giờ bị unmount — hãy thiết kế để mount lại luôn là chuyện bình thường.

</details>
