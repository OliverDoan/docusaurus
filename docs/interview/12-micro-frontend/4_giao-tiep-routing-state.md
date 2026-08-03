---
sidebar_position: 4
title: "4. Giao tiếp, Routing & State"
---

# Giao tiếp, Routing & Chia sẻ State

> *Đây là phần "lộ trình độ chín" của ứng viên micro-frontend. Ai cũng biết chia nhỏ app, nhưng làm sao các mảnh nói chuyện với nhau mà không dính chặt vào nhau mới là thứ phân biệt Intermediate với Senior.*

:::note[Ghi nhớ nhanh]

- ⭐ **Nguyên tắc số một là loose coupling** — ưu tiên giao tiếp bằng message/event, tránh `shared mutable state` (nhiều MFE cùng ghi vào một store) vì tạo ràng buộc ngầm khó debug.
- **Custom events / pub-sub bus** — `window.dispatchEvent(new CustomEvent(...))` hoặc event bus nhỏ; nhớ đặt tên event theo namespace để tránh trùng.
- **Props / callbacks** — dùng khi host trực tiếp mount remote (quan hệ cha–con); chặt hơn nhưng rõ ràng.
- **`postMessage`** — cho MFE chạy trong iframe; bắt buộc kiểm tra `origin` và dữ liệu phải serialize được.
- **Routing** — thường có một shell/host giữ router gốc, mỗi MFE quản route con của mình; tránh hai router tranh nhau history.

:::

---

## Câu 15: Các micro-frontend giao tiếp với nhau như thế nào? `[Intermediate]`

### Câu hỏi

> Em có 3 micro-frontend trên cùng một trang: header, product list, cart. Khi user thêm hàng vào cart, header phải cập nhật số lượng. Em cho các MFE này nói chuyện với nhau bằng cách nào?

### Giải thích lý thuyết

Nguyên tắc số một: **loose coupling**. Các MFE thường do team khác nhau, codebase khác nhau, deploy độc lập — nên tránh `shared mutable state` (cùng import và ghi vào một object/store) vì nó tạo ràng buộc ngầm, khó debug và phá vỡ tính độc lập.

Các cách giao tiếp phổ biến:

| Cách | Cơ chế | Khi nào dùng | Lưu ý |
|------|--------|--------------|-------|
| **Browser custom events** | `window.dispatchEvent(new CustomEvent(...))` + `addEventListener` | Giao tiếp lỏng giữa MFE độc lập | Không cần thư viện, nhưng cần đặt tên event theo namespace |
| **Pub/Sub bus chia sẻ** | Một event bus nhỏ (`publish`/`subscribe`) shell expose ra | Cần nhiều event, muốn API gọn hơn `window` | Vẫn là message-based, không phải state mutable |
| **Props / callbacks** | Host render remote và truyền `props`/hàm callback | Khi host trực tiếp mount remote (Module Federation, host orchestration) | Chặt hơn (host biết remote), phù hợp quan hệ cha–con |
| **postMessage** | `iframe.contentWindow.postMessage` | MFE chạy trong iframe (cách ly mạnh) | Phải kiểm tra `origin`, serialize được dữ liệu |
| **Shared state lib** | Cùng một store (Redux/RxJS) | Khi thực sự cần đồng bộ state phức tạp | Tạo coupling — dùng thận trọng, expose contract rõ |
| **URL / query params** | Đẩy state lên URL | State cần shareable/bookmarkable | Chỉ hợp dữ liệu nhỏ, không nhạy cảm |

**Khuyến nghị thực chiến:** ưu tiên **event-based** (custom events hoặc pub/sub) cho giao tiếp ngang hàng, kèm một **contract rõ ràng** về tên event và shape payload (versioned). Dùng props/callbacks khi quan hệ là cha–con. Chỉ rơi vào shared store khi không còn cách nào gọn hơn.

> 💡 **Insight phỏng vấn:** Câu trả lời "em dùng Redux chung cho tất cả" thường bị trừ điểm — interviewer muốn nghe em nhận ra shared mutable store tạo coupling và phá vỡ tính deploy độc lập của micro-frontend.

### Code minh hoạ

```ts
// event-bus.ts — một pub/sub nhỏ dựa trên CustomEvent của browser
// Không có shared mutable state: các MFE chỉ gửi/nhận "message".

type Handler<T> = (payload: T) => void;

// Đặt prefix để tránh đụng tên event với code bên thứ ba
const PREFIX = "mfe:";

export function publish<T>(event: string, payload: T): void {
  // CustomEvent cho phép đính kèm dữ liệu qua thuộc tính detail
  window.dispatchEvent(new CustomEvent(PREFIX + event, { detail: payload }));
}

export function subscribe<T>(event: string, handler: Handler<T>): () => void {
  // Bọc lại để lấy detail ra cho gọn
  const listener = (e: Event) => handler((e as CustomEvent<T>).detail);
  window.addEventListener(PREFIX + event, listener);
  // Trả về hàm hủy đăng ký — quan trọng để tránh memory leak khi MFE unmount
  return () => window.removeEventListener(PREFIX + event, listener);
}
```

```ts
// cart-mfe.ts — MFE Cart PHÁT event khi có thay đổi (không biết ai nghe)
import { publish } from "./event-bus";

interface CartChangedPayload {
  count: number;   // tổng số item
  total: number;   // tổng tiền
}

function addToCart(item: { id: string; price: number }) {
  // ... cập nhật state nội bộ của Cart MFE ...
  const next: CartChangedPayload = { count: 3, total: 540000 };

  // Phát event theo contract đã thống nhất, không gọi trực tiếp Header
  publish<CartChangedPayload>("cart:changed", next);
}
```

```ts
// header-mfe.ts — MFE Header LẮNG NGHE event (không biết ai phát)
import { subscribe } from "./event-bus";

interface CartChangedPayload {
  count: number;
  total: number;
}

// Đăng ký nghe; giữ unsubscribe để gọi khi component unmount
const unsubscribe = subscribe<CartChangedPayload>("cart:changed", (payload) => {
  updateBadge(payload.count); // chỉ cập nhật UI của riêng Header
});

function updateBadge(count: number) {
  // ... render lại badge số lượng ...
}

// Khi Header bị gỡ khỏi DOM:
// unsubscribe();
```

### Đáp án mẫu

> "Em ưu tiên giao tiếp lỏng bằng event để giữ các MFE độc lập. Trong tình huống này em dùng một event bus nhỏ trên `CustomEvent`: Cart phát `cart:changed` với payload `{ count, total }`, còn Header chỉ subscribe và cập nhật badge — hai bên không import nhau, không biết nhau tồn tại. Em luôn định nghĩa một contract rõ ràng về tên event và shape payload, có version, để team có thể đổi nội bộ mà không vỡ giao tiếp. Em tránh dùng shared Redux store chung cho mọi MFE vì nó tạo coupling và phá vỡ tính deploy độc lập; chỉ khi quan hệ là cha–con, host mount trực tiếp remote thì em mới truyền props/callback. Một điểm em luôn nhớ là return hàm unsubscribe để dọn listener khi MFE unmount, tránh leak."

---

## Câu 16: Routing hoạt động ra sao trong kiến trúc micro-frontend? `[Intermediate]`

### Câu hỏi

> Mỗi MFE đều có router riêng. Vậy ai quyết định URL `/products/123` thì hiển thị MFE nào? Và làm sao tránh việc nhiều router cùng tranh nhau ghi vào lịch sử trình duyệt?

### Giải thích lý thuyết

Routing trong micro-frontend chia thành **2 cấp**:

| Cấp | Trách nhiệm | Ví dụ |
|-----|-------------|-------|
| **Shell / top-level routing** | Quyết định MFE nào được active theo URL | single-spa `activeWhen: "/products"`, hoặc host router map prefix → mount remote |
| **Child routing** | Routing nội bộ bên trong một MFE | `/products` → list, `/products/123` → detail (router riêng của Products MFE) |

Điểm mấu chốt là **chỉ có MỘT History API dùng chung** cho cả tab trình duyệt (`window.history`). Nếu nhiều router (mỗi MFE một `BrowserRouter`) cùng ghi `window.history`, chúng sẽ ghi đè lẫn nhau, gây nhảy URL, mất state, hoặc loop.

Cách xử lý:

- **Một nguồn điều phối:** shell sở hữu cấp định tuyến trên cùng; quyết định mount/unmount MFE nào dựa trên path.
- **Basename / prefix path cho mỗi MFE:** Products MFE chạy dưới `/products`, dùng `basename="/products"` để router con chỉ quản lý phần đuôi, không đụng phần đầu của các MFE khác.
- **Tránh nhiều router cùng ghi history:** các MFE con nên dùng cùng một history instance được shell cấp, hoặc dùng `basename` để cô lập không gian path. Không khởi tạo nhiều `BrowserRouter` độc lập cùng nắm toàn bộ history.
- **Cross-MFE navigation đi qua shell:** muốn nhảy từ MFE A sang MFE B thì điều hướng qua API điều hướng của shell (hoặc phát event), thay vì MFE A tự `push` vào route thuộc B.

> 💡 **Insight phỏng vấn:** Hỏi sâu thường xoáy vào "nhiều `BrowserRouter` thì sao". Câu trả lời tốt nêu đúng nguyên nhân — chỉ có một `window.history`, nhiều router sẽ tranh nhau — và giải pháp là `basename`/shared history.

### Code minh hoạ

```tsx
// shell.tsx — Top-level routing: shell quyết định mount MFE nào theo prefix path
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Mỗi remote là một MFE riêng (Module Federation / dynamic import)
const ProductsMfe = lazy(() => import("products/App"));
const CheckoutMfe = lazy(() => import("checkout/App"));

export function Shell() {
  return (
    // CHỈ MỘT BrowserRouter ở shell — sở hữu window.history dùng chung
    <BrowserRouter>
      <Routes>
        {/* "/*" để route con của MFE tự xử lý phần đuôi */}
        <Route path="/products/*" element={
          <Suspense fallback={<div>Đang tải...</div>}>
            <ProductsMfe />
          </Suspense>
        } />
        <Route path="/checkout/*" element={
          <Suspense fallback={<div>Đang tải...</div>}>
            <CheckoutMfe />
          </Suspense>
        } />
      </Routes>
    </BrowserRouter>
  );
}
```

```tsx
// products/App.tsx — Child routing nội bộ của Products MFE
// KHÔNG tạo BrowserRouter mới (tránh tranh history). Dùng basename để cô lập path.
import { Routes, Route } from "react-router-dom";

export default function ProductsApp() {
  // basename="/products" được shell cấp ngữ cảnh; router con chỉ thấy phần sau /products
  return (
    <Routes>
      {/* Thực tế khớp với /products */}
      <Route index element={<ProductList />} />
      {/* Thực tế khớp với /products/123 */}
      <Route path=":id" element={<ProductDetail />} />
    </Routes>
  );
}

function ProductList() { return <div>Danh sách sản phẩm</div>; }
function ProductDetail() { return <div>Chi tiết sản phẩm</div>; }
```

```ts
// Cross-MFE navigation: Products muốn sang Checkout thì đi qua shell, không tự push route của Checkout
import { publish } from "./event-bus";

function goToCheckout() {
  // Shell lắng nghe "navigate" và thực hiện điều hướng tập trung
  publish("navigate", { to: "/checkout" });
}
```

### Đáp án mẫu

> "Em tách routing thành 2 cấp. Shell giữ top-level routing và quyết định theo prefix path là mount MFE nào — ví dụ `/products/*` thì mount Products MFE. Bên trong, mỗi MFE có child routing riêng để xử lý phần đuôi như `/products/123`. Điểm em luôn nhấn mạnh là cả tab chỉ có một `window.history`, nên em không để mỗi MFE dựng một `BrowserRouter` độc lập tranh nhau ghi history — em dùng `basename`/prefix để cô lập không gian path, hoặc chia sẻ một history instance từ shell. Khi cần nhảy chéo từ MFE này sang MFE khác, em điều hướng qua shell hoặc phát event `navigate`, chứ không để MFE A trực tiếp push vào route thuộc MFE B — như vậy mỗi MFE chỉ biết phần URL của riêng nó."

---

## Câu 17: Làm sao chia sẻ state toàn cục giữa các micro-frontend một cách an toàn? `[Senior]`

### Câu hỏi

> Em có thông tin user/token cần dùng ở nhiều MFE. Em chia sẻ state toàn cục đó thế nào để không biến nó thành một global mutable object ai cũng sửa được?

### Giải thích lý thuyết

Nguyên tắc đầu tiên: **tối thiểu hóa shared state**. State càng chia sẻ nhiều thì coupling càng cao, và một MFE đổi shape state có thể làm vỡ các MFE khác. Phần lớn state nên giữ cục bộ trong từng MFE.

Khi buộc phải chia sẻ, các cách an toàn theo thứ tự ưu tiên:

1. **Chia sẻ qua sự kiện / observable thay vì store mutable.** Thay vì cho mọi MFE ghi trực tiếp vào một object, dùng dòng dữ liệu một chiều: một nguồn phát thay đổi, các MFE subscribe và tự giữ bản sao của riêng mình.
2. **Nếu cần store, expose API read-only + actions.** Không lộ object gốc cho phép gán bừa; chỉ cho phép đọc qua `getState()`/subscribe và ghi qua `dispatch(action)`. Ví dụ `RxJS BehaviorSubject` (luôn có giá trị hiện tại, phát cho subscriber mới) hoặc một thin shared store tự viết.
3. **Versioned contract.** Định nghĩa rõ shape của shared state và version nó; tránh để MFE phụ thuộc vào internal shape của nhau.
4. **Quyền sở hữu rõ ràng.** Auth/token/user thường để **shell sở hữu** rồi broadcast xuống các MFE — vì shell là nơi duy nhất biết toàn cảnh đăng nhập.

**Trade-off:** observable/store chia sẻ giúp đồng bộ tốt nhưng làm tăng coupling. Phải cân nhắc: nếu chỉ là vài thông tin (user, theme, locale) thì broadcast đủ; nếu là state nghiệp vụ phức tạp thì nên xem lại ranh giới chia MFE.

> 💡 **Insight phỏng vấn:** Senior được kỳ vọng nói về quyền sở hữu state (ai own) và contract có version, chứ không chỉ "dùng BehaviorSubject". Nói được trade-off coupling là điểm cộng lớn.

### Code minh hoạ

```ts
// shared-store.ts — store dạng observable tối giản, shell sở hữu và expose API read-only + actions
// Tư tưởng: ngoài store không ai gán state trực tiếp; chỉ đọc qua getState/subscribe, ghi qua dispatch.

interface AppState {
  user: { id: string; name: string } | null;
  token: string | null;
}

type Listener = (state: AppState) => void;

function createSharedStore(initial: AppState) {
  // state là biến nội bộ (closure) — KHÔNG export ra ngoài để tránh mutate trực tiếp
  let state: AppState = initial;
  const listeners = new Set<Listener>();

  return {
    // Read-only: trả về snapshot, không trả tham chiếu cho phép sửa
    getState(): Readonly<AppState> {
      return Object.freeze({ ...state });
    },

    // Subscribe theo kiểu BehaviorSubject: phát ngay giá trị hiện tại cho subscriber mới
    subscribe(listener: Listener): () => void {
      listener(this.getState());
      listeners.add(listener);
      return () => listeners.delete(listener); // hàm hủy đăng ký
    },

    // Ghi DUY NHẤT qua action — kiểm soát được mọi thay đổi
    dispatch(action: { type: "SET_USER"; payload: AppState["user"] }
                    | { type: "SET_TOKEN"; payload: string | null }): void {
      switch (action.type) {
        case "SET_USER":
          state = { ...state, user: action.payload };
          break;
        case "SET_TOKEN":
          state = { ...state, token: action.payload };
          break;
      }
      // Bất biến: tạo state mới rồi thông báo, không sửa tại chỗ
      const snapshot = this.getState();
      listeners.forEach((l) => l(snapshot));
    },
  };
}

// Shell sở hữu store auth và broadcast xuống các MFE
export const authStore = createSharedStore({ user: null, token: null });
```

```ts
// mfe-consumer.ts — một MFE chỉ ĐỌC và LẮNG NGHE, không tự ý ghi state auth
import { authStore } from "./shared-store";

// Đọc giá trị hiện tại (read-only snapshot)
const current = authStore.getState();
console.log(current.user?.name);

// Lắng nghe thay đổi auth do shell phát ra
const unsubscribe = authStore.subscribe((state) => {
  if (!state.token) {
    redirectToLogin(); // ví dụ: shell xóa token thì MFE phản ứng
  }
});

// Khi MFE unmount thì dọn để tránh leak
// unsubscribe();

function redirectToLogin() { /* ... */ }
```

```ts
// shell-auth.ts — chỉ SHELL được dispatch để thay đổi auth (quyền sở hữu rõ ràng)
import { authStore } from "./shared-store";

async function onLoginSuccess(user: { id: string; name: string }, token: string) {
  // Mọi MFE đang subscribe sẽ tự cập nhật — không MFE nào ghi trực tiếp
  authStore.dispatch({ type: "SET_USER", payload: user });
  authStore.dispatch({ type: "SET_TOKEN", payload: token });
}
```

### Đáp án mẫu

> "Trước hết em cố gắng giảm tối đa shared state vì nó là nguồn coupling lớn nhất giữa các MFE; phần lớn state em giữ cục bộ. Với thứ thực sự toàn cục như user/token, em để shell sở hữu và broadcast xuống — vì shell là nơi duy nhất biết toàn cảnh đăng nhập. Em không expose một object mutable cho ai cũng gán được, mà dùng một observable kiểu BehaviorSubject hoặc một thin store chỉ cho đọc qua `getState`/`subscribe` và ghi qua `dispatch(action)`. Em định nghĩa contract cho shape của shared state và version nó, để MFE không phụ thuộc internal của nhau. Em luôn ý thức trade-off: cách này đồng bộ tốt nhưng tăng coupling, nên nếu thấy phải chia sẻ state nghiệp vụ phức tạp thì em xem lại ranh giới chia MFE thay vì cố nhồi vào store chung."

---

## Bẫy thường gặp khi trả lời

| Sai lầm | Đúng là |
|---------|---------|
| "Em dùng một Redux store chung cho tất cả MFE" | Shared mutable store tạo coupling và phá vỡ deploy độc lập; ưu tiên event-based, chỉ dùng store chung khi thật cần và expose read-only + actions |
| Để MFE import trực tiếp lẫn nhau để gọi hàm | Giao tiếp lỏng qua custom events / pub/sub; bên phát và bên nghe không cần biết nhau |
| Quên return/gọi unsubscribe khi MFE unmount | Luôn dọn listener/subscription để tránh memory leak và xử lý trùng |
| Mỗi MFE dựng một `BrowserRouter` độc lập | Cả tab chỉ có một `window.history`; dùng `basename`/prefix hoặc shared history, shell giữ top-level routing |
| MFE A tự push thẳng vào route của MFE B | Cross-MFE navigation đi qua shell hoặc phát event `navigate` để điều phối tập trung |
| Coi `default value` / shape payload là cố định mãi mãi | Định nghĩa contract có version cho tên event và shape payload để đổi nội bộ không vỡ giao tiếp |
| Để bất kỳ MFE nào cũng ghi được token/user | Auth thuộc shell sở hữu; MFE chỉ đọc và lắng nghe, ghi qua action tập trung |
