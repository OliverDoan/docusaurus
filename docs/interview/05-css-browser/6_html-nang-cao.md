---
sidebar_position: 6
title: "6. HTML nâng cao: Form, Media & Web APIs"
---

# HTML nâng cao: Form, Media & Web APIs

> *Rất nhiều thứ team đang cài thư viện để làm — modal, tooltip, accordion, validate form, lazy-load ảnh — HTML hiện đại đã làm sẵn, đúng accessibility và nhanh hơn. Interviewer Senior muốn biết bạn có biết "nền tảng làm được gì" trước khi `npm install`.*

:::note[Ghi nhớ nhanh]

- ⭐ **`<button>` trong `<form>` mặc định là `type="submit"`** — luôn ghi rõ `type="button"` cho nút không gửi form.
- ⭐ **Constraint Validation API** — `required`, `pattern`, `min`/`max`, `type="email"`; JS dùng `checkValidity()`, `reportValidity()`, `setCustomValidity()`, `validity.*`; CSS dùng `:user-invalid` thay `:invalid` để không báo lỗi khi user chưa nhập.
- ⭐ **Ảnh chống CLS** — luôn có `width`/`height` (trình duyệt suy ra `aspect-ratio`); ảnh LCP: **không** `loading="lazy"`, thêm `fetchpriority="high"`; ảnh dưới fold: `loading="lazy"`.
- **`<dialog>` + `showModal()`** — top layer, focus trap, Esc đóng, `::backdrop`, phần còn lại tự `inert`; **`popover`** cho tooltip/menu không modal, light dismiss, không cần JS.
- **`iframe sandbox`** — rỗng là khoá hết; **không** kết hợp `allow-scripts` + `allow-same-origin` cho nội dung cùng origin (iframe tự gỡ sandbox được).
- **Shadow DOM** — đóng gói DOM + CSS; `slot` để chiếu light DOM vào; style xuyên qua bằng CSS custom properties và `::part()`; Declarative Shadow DOM cho SSR.
- **SEO head** — `title`, `meta description`, `link rel="canonical"` (URL tuyệt đối), Open Graph `og:*` (dùng `property`), `robots`.

:::

---

## Câu 1: Form và validation built-in — Constraint Validation API `[Intermediate]`

### Câu hỏi

> Form đăng ký gồm email, số điện thoại, mật khẩu, xác nhận mật khẩu. Em có cần thư viện validate không? Hãy tận dụng tối đa HTML và giải thích `name`, `label`, `autocomplete`, `novalidate`.

### Giải thích lý thuyết

**Những thứ cơ bản nhưng hay sai:**
- `name` — **chỉ field có `name` mới được gửi** trong form submission và có mặt trong `FormData`. `id` không thay thế được.
- `<label for="id">` (hoặc bọc input trong label) — tăng vùng click, screen reader đọc nhãn. Placeholder **không** phải label.
- `type` đúng → bàn phím mobile đúng: `email`, `tel`, `url`, `number`, `search`, `date`, `datetime-local`, `color`, `range`, `file`. `inputmode` khi chỉ muốn đổi bàn phím mà không đổi kiểu dữ liệu (ví dụ mã OTP: `inputmode="numeric"` thay vì `type="number"` vì number bỏ số 0 đầu và có spinner).
- `autocomplete` — giá trị chuẩn: `email`, `tel`, `name`, `given-name`, `street-address`, `postal-code`, `cc-number`, `current-password`, `new-password`, `one-time-code`… Giúp password manager và autofill; WCAG 1.3.5 yêu cầu.

**Validation built-in:**

| Thuộc tính | Kiểm tra | Cờ trong `validity` |
| ---------- | -------- | ------------------- |
| `required` | Không rỗng | `valueMissing` |
| `type="email"`/`url` | Đúng định dạng | `typeMismatch` |
| `pattern` | Regex khớp **toàn bộ** giá trị (ngầm có `^…$`, flag `v`) | `patternMismatch` |
| `minlength`/`maxlength` | Độ dài | `tooShort`/`tooLong` |
| `min`/`max`/`step` | Khoảng số/ngày | `rangeUnderflow`/`rangeOverflow`/`stepMismatch` |
| `setCustomValidity(msg)` | Logic tuỳ ý | `customError` |

API JS: `el.checkValidity()` (trả boolean, bắn sự kiện `invalid`), `el.reportValidity()` (hiện bubble lỗi), `el.validationMessage`, `form.checkValidity()`.

**`novalidate`** trên form: tắt bubble/chặn submit mặc định nhưng **vẫn** tính validity → bạn tự hiển thị lỗi theo design system mà vẫn dùng `validity.*`. `formnovalidate` trên nút ("Lưu nháp") tắt validate cho riêng lần submit đó.

**CSS**: `:invalid` match ngay khi load (form trống đã đỏ) → dùng **`:user-invalid`** / `:user-valid` (match sau khi user tương tác) — đã hỗ trợ ở mọi trình duyệt chính.

**Luôn validate lại ở server** — validation client chỉ là UX.

### Code minh hoạ

```html
<form id="signup" action="/api/signup" method="post" novalidate>
  <label for="email">Email</label>
  <input id="email" name="email" type="email" autocomplete="email" required />
  <p class="error" id="email-error" aria-live="polite"></p>

  <label for="phone">Số điện thoại</label>
  <input
    id="phone"
    name="phone"
    type="tel"
    autocomplete="tel"
    pattern="0[0-9]{9}"
    title="10 chữ số, bắt đầu bằng 0"
    required
  />

  <label for="password">Mật khẩu</label>
  <input
    id="password"
    name="password"
    type="password"
    autocomplete="new-password"
    minlength="8"
    required
  />

  <label for="confirm">Nhập lại mật khẩu</label>
  <input id="confirm" name="confirm" type="password" autocomplete="new-password" required />

  <label for="otp">Mã OTP</label>
  <input id="otp" name="otp" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" />

  <button type="submit">Đăng ký</button>
  <button type="submit" formnovalidate formaction="/api/draft">Lưu nháp</button>
</form>
```

```js
const form = document.getElementById("signup");
const password = form.elements.password;
const confirm = form.elements.confirm;

// Rule tuỳ chỉnh: hai mật khẩu phải khớp
confirm.addEventListener("input", () => {
  confirm.setCustomValidity(
    confirm.value === password.value ? "" : "Mật khẩu không khớp"
  ); // chuỗi rỗng = hợp lệ; quên reset → field kẹt invalid mãi
});

form.addEventListener("submit", (event) => {
  if (!form.checkValidity()) {
    event.preventDefault();
    const firstInvalid = form.querySelector(":invalid");
    showError(firstInvalid);
    firstInvalid.focus();
    return;
  }
  // FormData chỉ chứa field có name
  const data = Object.fromEntries(new FormData(form));
});

function showError(input) {
  const message = input.validity.valueMissing ? "Trường này bắt buộc" : input.validationMessage;
  input.setAttribute("aria-invalid", "true");
  document.getElementById(`${input.id}-error`)?.replaceChildren(message);
}
```

```css
/* Chỉ báo lỗi sau khi user đã tương tác */
input:user-invalid { border-color: #dc2626; }
input:user-valid { border-color: #16a34a; }
```

### Đáp án mẫu

> "Với form này em dùng HTML trước: `type="email"`, `type="tel"` với `pattern`, `minlength` cho mật khẩu, `required` — trình duyệt đã kiểm tra và expose kết quả qua `validity`. Rule đặc thù như 'nhập lại mật khẩu' em dùng `setCustomValidity`, nhớ reset về chuỗi rỗng khi hợp lệ. Vì design system có UI lỗi riêng nên em đặt `novalidate` trên form — tắt bubble mặc định nhưng `checkValidity()` vẫn chạy — rồi tự render lỗi với `aria-invalid` và `aria-live`. CSS dùng `:user-invalid` để không đỏ form ngay lúc load. Mấy thứ hay bị quên: field **thiếu `name` thì không được gửi**, `label for` thay vì placeholder, `autocomplete="new-password"`/`one-time-code` cho password manager và autofill OTP. Form phức tạp nhiều bước thì em mới thêm React Hook Form + Zod, và server luôn validate lại."

---

## Câu 2: `<button>` mặc định là submit — và các thuộc tính `form*` `[Intermediate]`

### Câu hỏi

> Trong form chỉnh sửa hồ sơ có nút "Hiện mật khẩu". Bấm vào thì trang reload và dữ liệu gửi lên server. Bug ở đâu? Nhân tiện, làm sao một nút nằm **ngoài** form vẫn submit được form đó?

### Giải thích lý thuyết

`<button>` có `type` mặc định là **`submit`** (với button nằm trong form hoặc gắn với form). Mọi nút không ghi `type` trong form đều submit form khi click — kể cả nút "Hiện mật khẩu", "Thêm dòng", "Huỷ".

Các giá trị `type`: `submit`, `reset`, `button`. (`reset` gần như không bao giờ nên dùng — user lỡ bấm mất hết dữ liệu.)

**Implicit submission**: nhấn Enter trong một text input sẽ kích hoạt **nút submit đầu tiên** của form. Nếu nút đầu tiên là "Xoá" không ghi type → Enter = xoá. Form chỉ có một text input và không có nút submit vẫn submit khi Enter.

**Thuộc tính override trên nút submit** (cũng có trên `input type="submit"`):

| Thuộc tính | Override |
| ---------- | -------- |
| `form="formId"` | Gắn nút (hoặc input) với form ở **chỗ khác** trong DOM |
| `formaction` | URL gửi tới |
| `formmethod` | `get`/`post`/`dialog` |
| `formenctype` | Ví dụ `multipart/form-data` |
| `formnovalidate` | Bỏ validate cho lần submit này |
| `formtarget` | `_blank`… |

`event.submitter` trong sự kiện `submit` cho biết **nút nào** gây ra submit. `form.requestSubmit(button)` submit bằng JS **có chạy validation và sự kiện `submit`** — khác `form.submit()` bỏ qua cả hai.

React 19: `<button formAction={fn}>` dựa trên chính thuộc tính `formaction` này để gọi Server Action khác nhau cho từng nút.

### Code minh hoạ

```html
<form id="profile" action="/api/profile" method="post">
  <input name="password" type="password" id="pw" />

  <!-- ❌ Không ghi type → submit form, trang reload -->
  <button onclick="togglePassword()">Hiện mật khẩu</button>

  <!-- ✅ -->
  <button type="button" onclick="togglePassword()">Hiện mật khẩu</button>

  <!-- Nhiều hành động trong một form -->
  <button type="submit" name="intent" value="save">Lưu</button>
  <button type="submit" name="intent" value="publish" formaction="/api/profile/publish">
    Lưu và công khai
  </button>
</form>

<!-- Nút nằm ở footer cố định, ngoài form -->
<footer class="sticky-actions">
  <button type="submit" form="profile">Lưu</button>
</footer>
```

```js
const form = document.getElementById("profile");

form.addEventListener("submit", (event) => {
  // Nút nào đã submit? name/value của nút cũng có trong FormData
  console.log(event.submitter?.value); // "save" | "publish"
  const data = new FormData(form, event.submitter);
});

// ✅ Submit bằng JS mà vẫn validate + bắn sự kiện submit
form.requestSubmit();

// ❌ Bỏ qua validation VÀ không bắn sự kiện submit
form.submit();
```

### Đáp án mẫu

> "Bug là nút không ghi `type`: `<button>` trong form mặc định là **submit**, nên bấm 'Hiện mật khẩu' là submit và reload. Fix là `type="button"`; ở cấp design system em cho component Button mặc định `type="button"` để chặn cả loạt bug này. Liên quan còn có implicit submission — Enter trong input kích hoạt **nút submit đầu tiên**, nên thứ tự nút quan trọng. Nút nằm ngoài form thì dùng thuộc tính `form="profile"` trỏ tới id của form, không cần JS. Muốn một form có nhiều hành động, em dùng `formaction`, `formnovalidate` cho 'Lưu nháp', hoặc `name`/`value` trên nút rồi đọc `event.submitter`. Submit bằng JS em dùng `requestSubmit()` vì nó chạy validation và sự kiện submit, còn `form.submit()` bỏ qua cả hai."

---

## Câu 3: Ảnh responsive — `srcset`, `sizes`, `picture`, lazy loading và CLS `[Senior]`

### Câu hỏi

> Trang danh sách sản phẩm có LCP 4.2s và CLS 0.25. Ảnh hero rộng 100% màn hình, ảnh sản phẩm là grid 4 cột trên desktop, 2 cột trên mobile. Em viết lại markup ảnh thế nào?

### Giải thích lý thuyết

**`srcset` + `sizes` (resolution switching)** — cùng một ảnh, nhiều kích thước:
- `srcset="a-400.jpg 400w, a-800.jpg 800w"` — khai báo **chiều rộng thật** của từng file.
- `sizes` — cho trình duyệt biết ảnh sẽ **hiển thị rộng bao nhiêu** ở từng điều kiện (trình duyệt cần biết trước khi tải CSS).
- Trình duyệt tự chọn file theo `sizes × devicePixelRatio`, có thể tính cả điều kiện mạng.
- Thiếu `sizes` → mặc định `100vw` → grid 4 cột tải ảnh to gấp 4 lần cần thiết.
- `sizes="auto"` (chỉ khi `loading="lazy"`) để trình duyệt tự lấy kích thước layout — hỗ trợ trên Chromium, chưa đồng đều.
- Descriptor `x` (`1x, 2x`) cho ảnh kích thước cố định như avatar, logo.

**`<picture>`** — khi cần **art direction** (crop khác nhau theo màn hình) hoặc **chọn định dạng** (AVIF → WebP → JPEG). `<source>` đầu tiên khớp `media`/`type` được dùng; `<img>` bên trong là bắt buộc và mang `alt`, `width`, `height`, `loading`.

**Chống CLS:** luôn có `width` và `height` (số pixel nội tại). Trình duyệt dùng tỉ lệ đó làm `aspect-ratio` mặc định để giữ chỗ trước khi ảnh tải; CSS `width: 100%; height: auto` vẫn responsive. Với `<picture>` art direction khác tỉ lệ, đặt `width`/`height` trên từng `<source>`.

**Ưu tiên tải:**
- `loading="lazy"` — trì hoãn tới khi gần viewport. **Không** dùng cho ảnh LCP/above-the-fold (trì hoãn nó làm LCP chậm).
- `fetchpriority="high"` — nâng ưu tiên ảnh LCP (mặc định ảnh bắt đầu ở ưu tiên thấp tới khi layout xác định nó trong viewport). `low` cho ảnh carousel ẩn.
- `decoding="async"` — gợi ý decode không chặn main thread; tác dụng nhỏ, không thay thế được các điểm trên.

### Code minh hoạ

```html
<!-- Hero (LCP): art direction + định dạng hiện đại, ưu tiên cao, KHÔNG lazy -->
<picture>
  <source
    media="(max-width: 640px)"
    type="image/avif"
    srcset="/hero-mobile-640.avif 640w, /hero-mobile-1280.avif 1280w"
    sizes="100vw"
    width="640"
    height="800"
  />
  <source
    type="image/avif"
    srcset="/hero-1280.avif 1280w, /hero-1920.avif 1920w, /hero-2560.avif 2560w"
    sizes="100vw"
  />
  <img
    src="/hero-1920.jpg"
    srcset="/hero-1280.jpg 1280w, /hero-1920.jpg 1920w"
    sizes="100vw"
    width="1920"
    height="800"
    alt="Bộ sưu tập thu đông 2026"
    fetchpriority="high"
  />
</picture>

<!-- Ảnh sản phẩm trong grid: sizes khớp layout, lazy -->
<img
  src="/p/42-400.webp"
  srcset="/p/42-200.webp 200w, /p/42-400.webp 400w, /p/42-800.webp 800w"
  sizes="(min-width: 1024px) 25vw, 50vw"
  width="400"
  height="400"
  alt="Áo khoác dạ màu be"
  loading="lazy"
  decoding="async"
/>
```

```css
img { max-width: 100%; height: auto; } /* giữ tỉ lệ từ width/height attribute */
```

### Đáp án mẫu

> "CLS 0.25 gần như chắc chắn do ảnh **thiếu `width`/`height`** — em thêm lại, trình duyệt suy ra `aspect-ratio` và giữ chỗ trước khi ảnh về, CSS `height: auto` vẫn giữ responsive. Với LCP: ảnh hero em bỏ `loading="lazy"` nếu có, thêm `fetchpriority="high"`, dùng `<picture>` để phục vụ AVIF và crop riêng cho mobile. Ảnh sản phẩm em dùng `srcset` theo `w` cùng `sizes="(min-width: 1024px) 25vw, 50vw"` khớp đúng grid — thiếu `sizes` thì trình duyệt coi là `100vw` và tải ảnh to gấp bốn lần. Ảnh dưới fold thì `loading="lazy"` và `decoding="async"`. Sau đó em đo lại bằng field data, kiểm tra LCP element trong DevTools Performance. Nếu dùng Next.js thì `next/image` sinh hầu hết những thứ này, nhưng `sizes` và `priority` vẫn phải tự khai báo."

---

## Câu 4: `iframe` và bảo mật — `sandbox`, `allow`, clickjacking `[Senior]`

### Câu hỏi

> Sản phẩm cho phép khách hàng nhúng widget HTML tuỳ biến (do họ tự viết) vào trang dashboard của mình. Em nhúng thế nào cho an toàn? Ngược lại, làm sao chặn site khác nhúng trang của mình?

### Giải thích lý thuyết

**`sandbox`** — có mặt là áp **toàn bộ** hạn chế; mỗi token nới lỏng một quyền:

| Token | Cho phép |
| ----- | -------- |
| (rỗng) | Không script, không form, không popup, origin bị coi là **opaque** (khác mọi origin), không điều hướng top |
| `allow-scripts` | Chạy JS |
| `allow-same-origin` | Giữ origin thật (đọc cookie/storage của origin đó) |
| `allow-forms` | Submit form |
| `allow-popups` | `window.open`, `target="_blank"` |
| `allow-modals` | `alert`, `confirm` |
| `allow-top-navigation-by-user-activation` | Điều hướng trang cha khi user click |
| `allow-downloads` | Tải file |

⚠️ **`allow-scripts` + `allow-same-origin` với nội dung cùng origin** = sandbox vô nghĩa: script trong iframe truy cập `parent`, gỡ thuộc tính `sandbox` và tải lại chính nó.

**Nguyên tắc nhúng nội dung không tin cậy:**
1. Phục vụ từ **origin riêng** (ví dụ `usercontent.example-cdn.com`) — giống cách Google dùng `googleusercontent.com`, CodePen dùng `cdpn.io`.
2. `sandbox="allow-scripts"` **không** có `allow-same-origin` → origin opaque, không đọc được cookie/storage.
3. Giao tiếp chỉ qua `postMessage`, **luôn kiểm tra `event.origin`** và `event.source`; với origin opaque, `event.origin` là chuỗi `"null"` → kiểm tra `event.source === iframe.contentWindow`.
4. `allow` (Permissions Policy) — chỉ cấp quyền cần thiết: `camera`, `geolocation`, `fullscreen`, `clipboard-write`… Mặc định iframe cross-origin không có các quyền mạnh.
5. `srcdoc` để nhúng HTML inline; vẫn phải dùng cùng `sandbox`.
6. `referrerpolicy`, `loading="lazy"` cho iframe dưới fold (YouTube, map).
7. `credentialless` (Chromium) — tải iframe không kèm cookie, giúp nhúng nội dung bên thứ ba trong trang có COEP.

**Chống bị nhúng (clickjacking):** server gửi header
- `Content-Security-Policy: frame-ancestors 'self' https://partner.com` (chuẩn hiện đại),
- `X-Frame-Options: DENY` / `SAMEORIGIN` (cũ, giữ cho tương thích).

Không thể chặn bằng thẻ `meta` — `frame-ancestors` bị bỏ qua trong `meta` CSP.

### Code minh hoạ

```html
<!-- Widget khách hàng: origin riêng + sandbox chặt -->
<iframe
  id="widget"
  src="https://usercontent.example-cdn.com/widgets/123"
  sandbox="allow-scripts allow-forms"
  allow="clipboard-write"
  referrerpolicy="no-referrer"
  loading="lazy"
  title="Widget tuỳ chỉnh của khách hàng"
  width="400"
  height="300"
></iframe>

<!-- ❌ Vô hiệu hoá sandbox với nội dung cùng origin -->
<iframe src="/user-html/123" sandbox="allow-scripts allow-same-origin"></iframe>
```

```js
// Trang cha: chỉ nhận message từ đúng iframe
const iframe = document.getElementById("widget");
const WIDGET_ORIGIN = "https://usercontent.example-cdn.com";

window.addEventListener("message", (event) => {
  if (event.origin !== WIDGET_ORIGIN) return;
  if (event.source !== iframe.contentWindow) return;
  if (typeof event.data?.type !== "string") return;

  if (event.data.type === "resize") {
    iframe.height = String(Math.min(Number(event.data.height) || 0, 2000));
  }
});

// Gửi xuống: luôn chỉ định targetOrigin, không dùng "*"
iframe.contentWindow.postMessage({ type: "theme", value: "dark" }, WIDGET_ORIGIN);
```

### Đáp án mẫu

> "Code do khách viết em coi là không tin cậy hoàn toàn. Em phục vụ nó từ **một origin riêng** chỉ để chứa user content, nhúng bằng `sandbox="allow-scripts"` cùng vài token tối thiểu và **không bao giờ** thêm `allow-same-origin` — gộp hai cái đó trên nội dung cùng origin thì script gỡ được sandbox. Không có `allow-same-origin`, iframe có origin opaque, không đọc được cookie hay storage. Quyền như camera, clipboard thì cấp qua `allow` từng cái. Giao tiếp chỉ qua `postMessage`: bên nhận kiểm tra `origin`, `source` và validate shape của data; bên gửi luôn chỉ rõ `targetOrigin`. Chiều ngược lại, chặn trang mình bị nhúng là việc của server: `CSP frame-ancestors`, kèm `X-Frame-Options` cho trình duyệt cũ — đặt trong thẻ meta thì không có tác dụng."

---

## Câu 5: `<dialog>`, Popover API và `inert` `[Senior]`

### Câu hỏi

> Team đang dùng thư viện modal 30KB và tự viết focus trap, z-index 9999 vẫn bị đè. Em đề xuất chuyển sang `<dialog>` và `popover` — giải thích chúng giải quyết những vấn đề gì, khác nhau ra sao.

### Giải thích lý thuyết

**Top layer** — lớp hiển thị đặc biệt của trình duyệt, nằm **trên mọi stacking context**, không bị `overflow: hidden` hay `transform` của tổ tiên cắt. Hết chuyện z-index war. Cả modal dialog và popover đều vào top layer.

**`<dialog>`:**

| | `dialog.show()` | `dialog.showModal()` |
| -- | --------------- | -------------------- |
| Top layer | Không | **Có** |
| `::backdrop` | Không | Có |
| Phần còn lại của trang | Tương tác được | **Tự động inert** (không click, không focus, screen reader bỏ qua) |
| Esc để đóng | Không | Có (bắn sự kiện `cancel` trước, rồi `close`) |

- `<form method="dialog">` bên trong: submit sẽ đóng dialog, `dialog.returnValue` = `value` của nút submit.
- Focus tự chuyển vào trong khi mở (phần tử có `autofocus` hoặc phần tử focusable đầu tiên), và **trả về** phần tử trước đó khi đóng.
- `closedby="any"` để click backdrop đóng dialog (light dismiss) — mới, kiểm tra hỗ trợ; fallback là bắt click lên chính phần tử dialog.
- Không đặt `tabindex` lên dialog; không dùng thuộc tính `open` để mở modal (sẽ thành non-modal).
- Invoker Commands (`commandfor` + `command="show-modal"`) cho phép mở dialog từ nút không cần JS — mới có ở các trình duyệt gần đây, cần fallback.

**Popover API** — cho UI **không modal**: menu, tooltip, dropdown, toast.
- `popover` (= `auto`): light dismiss (click ra ngoài, Esc), chỉ một popover `auto` mở tại một thời điểm (trừ lồng nhau).
- `popover="manual"`: không light dismiss, nhiều cái mở cùng lúc — hợp với toast.
- `popover="hint"`: cho tooltip, không đóng popover `auto` đang mở (hỗ trợ chưa đồng đều).
- Nút `popovertarget="id"` + `popovertargetaction="toggle|show|hide"` — không cần JS, tự gắn quan hệ accessibility (`aria-expanded`).
- JS: `showPopover()`, `hidePopover()`, `togglePopover()`, sự kiện `beforetoggle`/`toggle`.
- Popover **không** làm phần còn lại inert và không trap focus — đúng với bản chất non-modal.
- Kết hợp **CSS anchor positioning** (`anchor-name`, `position-anchor`, `position-area`) để đặt popover cạnh nút.

**`inert`** — global attribute, làm cả subtree không tương tác: không click, không focus, ẩn khỏi accessibility tree. Dùng cho off-canvas drawer, phần nội dung phía sau khi tự làm overlay, slide carousel đang ẩn. Thay cho combo `aria-hidden` + `tabindex="-1"` thủ công.

### Code minh hoạ

```html
<button type="button" id="open-delete">Xoá tài khoản</button>

<dialog id="confirm-delete" aria-labelledby="confirm-title" closedby="any">
  <form method="dialog">
    <h2 id="confirm-title">Xoá tài khoản?</h2>
    <p>Hành động này không thể hoàn tác.</p>
    <button value="cancel" autofocus>Huỷ</button>
    <button value="confirm">Xoá</button>
  </form>
</dialog>

<!-- Popover: menu không cần JS -->
<button type="button" popovertarget="user-menu">Tài khoản</button>
<div id="user-menu" popover>
  <a href="/settings">Cài đặt</a>
  <a href="/logout">Đăng xuất</a>
</div>

<!-- Toast: manual, không light dismiss -->
<div id="toast" popover="manual" role="status">Đã lưu</div>

<!-- Drawer đóng: inert để không Tab vào được -->
<nav id="drawer" class="drawer" inert>…</nav>
```

```js
const dialog = document.getElementById("confirm-delete");

document.getElementById("open-delete").addEventListener("click", () => {
  dialog.showModal(); // top layer + backdrop + trang phía sau inert
});

dialog.addEventListener("close", () => {
  if (dialog.returnValue === "confirm") {
    deleteAccount();
  }
});

// Toast: hiện 3 giây
function showToast() {
  const toast = document.getElementById("toast");
  toast.showPopover();
  setTimeout(() => toast.hidePopover(), 3000);
}

// Drawer
function toggleDrawer(open) {
  document.getElementById("drawer").inert = !open;
  document.querySelector("main").inert = open;
}
```

```css
dialog::backdrop { background: rgb(0 0 0 / 0.5); }

/* Fade-in khi vào top layer */
dialog[open] { animation: fade-in 0.2s ease-out; }
@keyframes fade-in { from { opacity: 0; } }
```

### Đáp án mẫu

> "Hai vấn đề lớn của modal tự viết là z-index và focus. `showModal()` đưa dialog vào **top layer** — trên mọi stacking context, không bị `overflow` hay `transform` của cha cắt — nên hết z-index war. Nó còn tự làm phần còn lại của trang **inert**, Esc đóng, focus vào trong và trả focus về nút mở khi đóng, có `::backdrop` để style. `<form method="dialog">` đóng dialog và trả `returnValue`, rất gọn cho confirm. Còn **popover** dành cho UI không modal như menu, tooltip, toast: `popovertarget` trên nút là chạy, không cần JS, có light dismiss, kết hợp CSS anchor positioning để đặt vị trí. Quy tắc của em: chặn tương tác với trang thì dùng `dialog` + `showModal`, không chặn thì dùng popover. Thuộc tính `inert` em dùng cho drawer và slide ẩn. Các API mới hơn như `closedby` hay invoker commands thì em feature-detect và giữ fallback JS."

---

## Câu 6: `<template>`, `<slot>`, Web Components và Shadow DOM `[Senior]`

### Câu hỏi

> Công ty có nhiều app React, Vue và cả trang server-render thuần. Em được giao làm một design system dùng chung. Web Components có phải lựa chọn tốt không? Giải thích `template`, `slot`, Shadow DOM và cách style xuyên qua shadow boundary.

### Giải thích lý thuyết

Web Components gồm ba spec:
1. **Custom Elements** — `customElements.define("x-tag", Class)`; tên **bắt buộc có dấu gạch ngang**. Lifecycle: `connectedCallback`, `disconnectedCallback`, `attributeChangedCallback` (với `static observedAttributes`), `adoptedCallback`.
2. **Shadow DOM** — `attachShadow({ mode: "open" })` tạo cây DOM riêng: CSS bên trong không rò ra ngoài, CSS bên ngoài không lọt vào (trừ thuộc tính kế thừa như `color`, `font` và **CSS custom properties**).
3. **`<template>`** — markup **inert**: không render, không tải ảnh, không chạy script; nhân bản bằng `template.content.cloneNode(true)`.

**`<slot>`** — "lỗ" trong shadow tree để chiếu light DOM (con mà người dùng truyền vào) vào. `slot="name"` trên con ↔ `<slot name="name">` trong shadow. Nội dung không có tên vào slot mặc định. Phần tử vẫn thuộc light DOM — style của trang vẫn áp lên nó; bên trong shadow style bằng `::slotted()`.

**Style xuyên shadow boundary:**
- **CSS custom properties** — cách chính để theme (`--btn-bg`).
- **`::part(name)`** — component expose phần tử qua `part="name"`, bên ngoài style được.
- `:host`, `:host([variant="primary"])`, `:host-context()` (không có ở Firefox — tránh) trong shadow.
- Constructable Stylesheets + `adoptedStyleSheets` để chia sẻ stylesheet giữa nhiều instance.

**Declarative Shadow DOM** — `<template shadowrootmode="open">` cho phép **SSR** shadow tree, không cần JS để hiển thị. Hỗ trợ ở mọi trình duyệt chính.

**Form và accessibility:** custom element mặc định **không tham gia form**. Cần `static formAssociated = true` + `attachInternals()` để `setFormValue`, `setValidity`, gán ARIA mặc định qua `ElementInternals`. ID reference (`aria-labelledby`) **không xuyên** qua shadow boundary — một hạn chế a11y lớn.

**Trade-off cho design system:**
- ✅ Framework-agnostic, chuẩn nền tảng, sống lâu hơn framework.
- ⚠️ SSR phức tạp hơn, React 19 mới hỗ trợ đầy đủ property/event cho custom element; ID reference qua shadow; form cần `ElementInternals`.
- Thực tế: dùng Lit để giảm boilerplate; nhiều công ty (Adobe Spectrum, Shoelace/Web Awesome, Salesforce Lightning) đi theo hướng này.

### Code minh hoạ

```html
<template id="card-template">
  <style>
    :host {
      display: block;
      border: 1px solid var(--card-border, #e5e7eb);
      border-radius: 8px;
      padding: 16px;
    }
    :host([variant="highlight"]) { border-color: var(--card-accent, #3b82f6); }
    ::slotted(h3) { margin: 0 0 8px; }
  </style>
  <slot name="title"></slot>
  <div part="body"><slot></slot></div>
  <footer part="footer"><slot name="actions"></slot></footer>
</template>

<!-- Sử dụng: light DOM được chiếu vào slot -->
<ui-card variant="highlight">
  <h3 slot="title">Gói Pro</h3>
  <p>Không giới hạn dự án.</p>
  <button slot="actions" type="button">Nâng cấp</button>
</ui-card>
```

```js
class UiCard extends HTMLElement {
  static observedAttributes = ["variant"];

  constructor() {
    super();
    const template = document.getElementById("card-template");
    this.attachShadow({ mode: "open" }).append(template.content.cloneNode(true));
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.dispatchEvent(
      new CustomEvent("variant-change", { detail: newValue, bubbles: true, composed: true })
    ); // composed: true để event vượt shadow boundary
  }
}

customElements.define("ui-card", UiCard);
```

```css
/* Trang bên ngoài: theme qua custom properties và ::part */
ui-card { --card-accent: #9333ea; }
ui-card::part(footer) { display: flex; justify-content: flex-end; }
```

```html
<!-- Declarative Shadow DOM: SSR được, hiển thị trước khi JS tải -->
<ui-badge>
  <template shadowrootmode="open">
    <style>span { font-weight: 600; }</style>
    <span><slot></slot></span>
  </template>
  Mới
</ui-badge>
```

### Đáp án mẫu

> "Với bối cảnh nhiều framework thì Web Components là ứng viên hợp lý cho **lớp primitive** của design system. `<template>` chứa markup inert để clone; Shadow DOM đóng gói DOM và CSS nên style app không phá component và ngược lại; `<slot>` chiếu nội dung người dùng truyền vào, style từ bên trong bằng `::slotted`. Theming em làm qua **CSS custom properties** vì chúng xuyên shadow boundary, và expose `part` để style tuỳ biến qua `::part()`. SSR thì dùng Declarative Shadow DOM với `shadowrootmode`. Nhưng em sẽ nói rõ cái giá: input tự viết phải dùng `formAssociated` + `ElementInternals` mới tham gia form; `aria-labelledby` không xuyên shadow; event phải `composed: true`. Em sẽ dùng Lit để giảm boilerplate, và cân nhắc cung cấp thêm wrapper React mỏng cho DX tốt hơn."

---

## Câu 7: Meta cho SEO, Open Graph và `canonical` `[Intermediate]`

### Câu hỏi

> Trang sản phẩm của em share lên Facebook/Zalo không hiện ảnh, và Google Search Console báo "Duplicate without user-selected canonical" cho các URL có `?utm_source=` và `?sort=`. Em sửa phần `<head>` thế nào?

### Giải thích lý thuyết

**Thẻ quan trọng cho SEO:**
- `<title>` — tín hiệu mạnh, hiển thị trên kết quả tìm kiếm; khoảng 50–60 ký tự, mỗi trang một title riêng.
- `<meta name="description">` — không ảnh hưởng ranking trực tiếp nhưng ảnh hưởng snippet và CTR. Google có thể tự viết lại.
- `<meta name="keywords">` — Google **bỏ qua** từ lâu.
- `<meta name="robots" content="noindex, nofollow">` — chặn index; khác `robots.txt` (chặn crawl). Trang bị chặn trong `robots.txt` thì Google **không đọc được** thẻ `noindex`.
- `<link rel="canonical" href="...">` — chỉ định URL "chính" khi nhiều URL trả cùng nội dung (tham số tracking, sort, http/https, có/không `www`, trailing slash). Dùng **URL tuyệt đối**; mỗi trang một canonical; trang phân trang trỏ canonical về **chính nó**, không về trang 1. Canonical là **gợi ý**, Google có thể không theo nếu tín hiệu mâu thuẫn.
- `<link rel="alternate" hreflang="en" href="...">` — phiên bản ngôn ngữ khác, kèm `x-default`.

**Open Graph** (Facebook, Zalo, LinkedIn, Slack, Discord…):
- Dùng **`property`**, không phải `name`: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `og:site_name`, `og:locale`.
- `og:image` phải là **URL tuyệt đối**, truy cập công khai, khuyến nghị 1200×630, khai báo `og:image:width`/`height`/`alt`.
- Crawler **không chạy JavaScript** (hầu hết) — meta phải có trong HTML server trả về. SPA render meta bằng JS phía client → share không có ảnh. Đây là lý do chính cần SSR/SSG hoặc prerender cho trang public.
- Facebook cache kết quả — dùng Sharing Debugger để scrape lại.
- Twitter/X: `twitter:card` = `summary_large_image`; nếu thiếu `twitter:*`, X fallback về OG.

**Structured data** — JSON-LD `<script type="application/ld+json">` với schema.org (`Product`, `Offer`, `BreadcrumbList`, `Article`) để có rich result.

### Code minh hoạ

```html
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <title>Áo khoác dạ màu be — Shop ABC</title>
  <meta
    name="description"
    content="Áo khoác dạ lông cừu, form oversize, 4 size. Freeship đơn từ 500K."
  />

  <!-- Canonical: URL tuyệt đối, bỏ tham số tracking/sort -->
  <link rel="canonical" href="https://shop.example.com/p/ao-khoac-da-be" />

  <!-- Open Graph: dùng property -->
  <meta property="og:type" content="product" />
  <meta property="og:site_name" content="Shop ABC" />
  <meta property="og:title" content="Áo khoác dạ màu be" />
  <meta property="og:description" content="Form oversize, lông cừu 70%." />
  <meta property="og:url" content="https://shop.example.com/p/ao-khoac-da-be" />
  <meta property="og:image" content="https://cdn.example.com/og/ao-khoac-da-be.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:locale" content="vi_VN" />

  <meta name="twitter:card" content="summary_large_image" />

  <!-- Structured data (JSON-LD schema.org Product) cho rich result -->
  <script type="application/ld+json">
    { "@context": "https://schema.org", "@type": "Product", "name": "Áo khoác dạ màu be",
      "offers": { "@type": "Offer", "price": "1290000", "priceCurrency": "VND" } }
  </script>
</head>
```

```html
<!-- Trang tìm kiếm nội bộ / giỏ hàng: không index -->
<meta name="robots" content="noindex, follow" />
```

### Đáp án mẫu

> "Lỗi share không có ảnh, em kiểm tra đầu tiên là **meta có trong HTML server trả về không** — crawler của Facebook, Zalo không chạy JS, nên SPA set meta phía client sẽ trắng. Sau đó kiểm tra `og:image` là URL tuyệt đối, public, khoảng 1200×630, dùng `property` chứ không phải `name`, rồi dùng Sharing Debugger để scrape lại cache. Còn duplicate content: em thêm `<link rel="canonical">` URL tuyệt đối, sạch tham số `utm` và `sort`, mỗi trang trỏ về chính phiên bản chuẩn của nó; trang phân trang canonical về chính nó chứ không về trang 1. Trang tìm kiếm nội bộ, giỏ hàng thì `noindex`. Em nói thêm là chặn bằng `robots.txt` thì Google không đọc được `noindex`, nên không dùng lẫn lộn. Cuối cùng em thêm JSON-LD `Product` để có rich result giá và tình trạng hàng."

---

## Câu 8: `<details>`/`<summary>` — accordion không cần JavaScript `[Intermediate]`

### Câu hỏi

> Trang FAQ có 20 câu hỏi dạng accordion, đang dùng một component React với `useState` cho từng item và yêu cầu "mở câu này thì đóng câu khác". Có cách nào làm bằng HTML thuần không? Có hạn chế gì?

### Giải thích lý thuyết

`<details>` là disclosure widget gốc của HTML:
- `<summary>` là phần tử con **đầu tiên** — nút bật/tắt, tự focusable, Enter/Space hoạt động, screen reader thông báo trạng thái expanded/collapsed.
- Thuộc tính `open` (boolean) phản ánh trạng thái; sự kiện **`toggle`** bắn sau khi đổi (không bubble).
- Thiếu `<summary>` → trình duyệt tự hiển thị nhãn "Details"/"Chi tiết".

**Exclusive accordion** — thuộc tính `name`: các `<details>` cùng `name` hoạt động như nhóm radio, mở một cái thì cái khác tự đóng. Đã hỗ trợ ở mọi trình duyệt chính.

**Tìm trong trang**: Chrome và các trình duyệt hiện đại **tự mở** `<details>` khi Ctrl+F tìm thấy text bên trong (auto-expand) — thứ mà accordion bằng `display: none` không làm được. Tương tự cho nội dung tự ẩn: `hidden="until-found"` + sự kiện `beforematch`.

**Styling:**
- Marker (tam giác): `summary::marker` hoặc `list-style: none` trên `summary` (Safari cũ dùng `::-webkit-details-marker`).
- `::details-content` — pseudo-element cho phần nội dung, kết hợp `interpolate-size: allow-keywords` để animate `height: auto` (Chromium; trình duyệt khác đóng/mở tức thì — progressive enhancement).

**Hạn chế:**
- Không phải đúng ARIA pattern "accordion" (heading + button + region) — nhưng ngữ nghĩa disclosure đã đủ cho phần lớn FAQ; nếu cần heading thì đặt heading **bên trong** `<summary>` (screen reader một số có thể đọc khác nhau, test thực tế).
- Không đặt interactive content (link, button) trong `<summary>`.
- Không thích hợp cho tabs hay UI cần trạng thái điều khiển phức tạp.

**React**: `open` + `onToggle` — nếu kiểm soát bằng state, đọc `event.currentTarget.open` trong `onToggle` để đồng bộ, tránh vòng lặp.

### Code minh hoạ

```html
<section aria-labelledby="faq-title">
  <h2 id="faq-title">Câu hỏi thường gặp</h2>

  <!-- name giống nhau → chỉ một item mở tại một thời điểm -->
  <details name="faq" open>
    <summary>Bao lâu thì nhận được hàng?</summary>
    <p>Nội thành 1–2 ngày, tỉnh 3–5 ngày làm việc.</p>
  </details>

  <details name="faq">
    <summary>Tôi có được đổi trả không?</summary>
    <p>Đổi trả miễn phí trong 30 ngày nếu còn tem mác.</p>
  </details>
</section>
```

```css
summary {
  cursor: pointer;
  list-style: none; /* ẩn marker mặc định */
  padding: 12px 0;
  font-weight: 600;
}
summary::after { content: "+"; float: inline-end; }
details[open] > summary::after { content: "−"; }

/* Animate mở/đóng (progressive enhancement) */
:root {
  interpolate-size: allow-keywords;
}
details::details-content {
  block-size: 0;
  overflow: hidden;
  transition: block-size 0.25s, content-visibility 0.25s allow-discrete;
}
details[open]::details-content {
  block-size: auto;
}
```

### Đáp án mẫu

> "Em sẽ thay bằng `<details>`/`<summary>` — nút bật/tắt, keyboard, trạng thái expanded cho screen reader đều có sẵn, không cần state. Yêu cầu 'mở câu này đóng câu khác' giờ chỉ cần thuộc tính `name` giống nhau trên các `<details>`, hoạt động như nhóm radio, đã hỗ trợ ở mọi trình duyệt chính. Lợi ích ít người để ý: Ctrl+F tìm thấy text trong câu trả lời đang đóng thì trình duyệt **tự mở** nó, accordion `display: none` không làm được; và nội dung có sẵn trong HTML nên tốt cho SEO. Animation dùng `::details-content` với `interpolate-size`, trình duyệt chưa hỗ trợ thì chỉ đóng mở tức thì. Hạn chế: không đặt link hay button trong `summary`, và với UI kiểu tabs hay accordion cần điều khiển phức tạp thì em vẫn dùng component có ARIA pattern đầy đủ."

---

## Bẫy thường gặp khi trả lời

| Sai lầm | Đúng là |
| ------- | ------- |
| "Có `id` là field được gửi lên server" | Chỉ field có `name` (và không `disabled`) mới có trong form submission |
| "Placeholder thay được label" | Placeholder biến mất khi gõ, contrast thấp; luôn có `label` |
| "Dùng `:invalid` để tô đỏ field lỗi" | Form trống đã đỏ ngay khi load; dùng `:user-invalid` |
| "`form.submit()` sẽ chạy validation" | `submit()` bỏ qua validation và sự kiện `submit`; dùng `requestSubmit()` |
| "`<button>` mặc định là `type="button"`" | Trong form, mặc định là `submit` |
| "Thêm `loading="lazy"` cho mọi ảnh" | Ảnh LCP lazy làm LCP chậm hơn; dùng `fetchpriority="high"` |
| "`width`/`height` trên `img` làm ảnh không responsive" | CSS `height: auto` vẫn responsive; attribute dùng để giữ tỉ lệ, chống CLS |
| "`sandbox="allow-scripts allow-same-origin"` vẫn an toàn" | Với nội dung cùng origin, script gỡ được sandbox |
| "Chặn clickjacking bằng meta CSP" | `frame-ancestors` chỉ có tác dụng qua HTTP header |
| "Modal chỉ cần `z-index: 9999`" | `showModal()` dùng top layer, tự inert phần còn lại, quản lý focus |
| "Shadow DOM chặn hoàn toàn CSS bên ngoài" | Thuộc tính kế thừa và CSS custom properties vẫn xuyên qua |
| "SPA set `og:image` bằng JS là đủ" | Crawler social không chạy JS; meta phải có trong HTML từ server |
| "Canonical trang 2, 3 trỏ về trang 1" | Mỗi trang phân trang canonical về chính nó |
