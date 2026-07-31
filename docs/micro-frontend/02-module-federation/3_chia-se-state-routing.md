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
