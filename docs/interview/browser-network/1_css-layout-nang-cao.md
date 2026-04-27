---
sidebar_position: 1
title: "1. Flexbox, Grid, Stacking Context, BFC"
---

# Flexbox, Grid, Stacking Context, BFC

Phần này tập trung vào các câu hỏi phỏng vấn về CSS layout nâng cao -- từ Flexbox, Grid cho đến những khái niệm "trừu tượng" hơn như Stacking Context và Block Formatting Context. Đây là những kiến thức mà interviewer rất hay hỏi để đánh giá bạn có thực sự hiểu CSS hay chỉ dừng ở mức copy-paste.

---


---

## Mục lục

- [Câu 1: Giải thích main axis và cross axis trong Flexbox. Khi nào chúng thay đổi? `[Intermediate]`](#câu-1-giải-thích-main-axis-và-cross-axis-trong-flexbox-khi-nào-chúng-thay-đổi-intermediate)
- [Câu 2: Phân biệt flex-grow, flex-shrink, flex-basis. Viết shorthand `flex: 1` nghĩa là gì? `[Intermediate]`](#câu-2-phân-biệt-flex-grow-flex-shrink-flex-basis-viết-shorthand-flex-1-nghĩa-là-gì-intermediate)
- [Câu 3: CSS Grid -- giải thích grid-template, fr unit, và sự khác nhau giữa auto-fill và auto-fit `[Intermediate]`](#câu-3-css-grid-giải-thích-grid-template-fr-unit-và-sự-khác-nhau-giữa-auto-fill-và-auto-fit-intermediate)
- [Câu 4: Stacking Context là gì? Khi nào một stacking context mới được tạo ra? `[Senior]`](#câu-4-stacking-context-là-gì-khi-nào-một-stacking-context-mới-được-tạo-ra-senior)
- [Câu 5: Block Formatting Context (BFC) là gì? Nó giải quyết vấn đề gì? `[Senior]`](#câu-5-block-formatting-context-bfc-là-gì-nó-giải-quyết-vấn-đề-gì-senior)
- [Câu 6: So sánh Flexbox và Grid. Khi nào dùng cái nào? `[Intermediate]`](#câu-6-so-sánh-flexbox-và-grid-khi-nào-dùng-cái-nào-intermediate)
- [Câu bonus: Box model -- content-box vs border-box `[Intermediate]`](#câu-bonus-box-model-content-box-vs-border-box-intermediate)
- [Lỗi thường gặp khi trả lời](#lỗi-thường-gặp-khi-trả-lời)

---

## Câu 1: Giải thích main axis và cross axis trong Flexbox. Khi nào chúng thay đổi? `[Intermediate]`

### Giải thích lý thuyết

Flexbox hoạt động trên hai trục:

- **Main axis** (trục chính): hướng mà các flex item được xếp theo. Mặc định là **hàng ngang** (từ trái sang phải).
- **Cross axis** (trục phụ): vuông góc với main axis. Mặc định là **cột dọc** (từ trên xuống dưới).

Khi bạn thay đổi `flex-direction`, hai trục này **hoán đổi** cho nhau:

| `flex-direction` | Main axis | Cross axis |
|---|---|---|
| `row` (mặc định) | Ngang (trái -> phải) | Dọc (trên -> dưới) |
| `row-reverse` | Ngang (phải -> trái) | Dọc (trên -> dưới) |
| `column` | Dọc (trên -> dưới) | Ngang (trái -> phải) |
| `column-reverse` | Dọc (dưới -> trên) | Ngang (trái -> phải) |

Điều quan trọng: `justify-content` luôn điều khiển **main axis**, còn `align-items` luôn điều khiển **cross axis**. Vì vậy khi `flex-direction: column`, `justify-content` sẽ căn theo **chiều dọc**.

### Code ví dụ

```css
/* Mặc định: main axis = ngang */
.container-row {
  display: flex;
  flex-direction: row;
  justify-content: center;    /* Căn giữa theo chiều ngang */
  align-items: center;        /* Căn giữa theo chiều dọc */
}

/* Đổi sang column: main axis = dọc */
.container-column {
  display: flex;
  flex-direction: column;
  justify-content: center;    /* Bây giờ căn giữa theo chiều DỌC */
  align-items: center;        /* Bây giờ căn giữa theo chiều NGANG */
}

/* Trick căn giữa hoàn hảo */
.perfect-center {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
```

### Đáp án mẫu

> "Flexbox hoạt động trên hai trục: main axis là hướng xếp item, cross axis vuông góc với nó. Mặc định main axis là ngang nhưng khi đổi `flex-direction: column` thì main axis chuyển thành dọc. Điều này cũng thay đổi hành vi của `justify-content` và `align-items` -- `justify-content` luôn theo main axis, `align-items` luôn theo cross axis."

---

## Câu 2: Phân biệt flex-grow, flex-shrink, flex-basis. Viết shorthand `flex: 1` nghĩa là gì? `[Intermediate]`

### Giải thích lý thuyết

Ba thuộc tính này quyết định cách flex item **chia sẻ không gian** trong container:

| Thuộc tính | Mặc định | Ý nghĩa |
|---|---|---|
| `flex-grow` | `0` | Tỷ lệ **giãn ra** khi container còn thừa chỗ |
| `flex-shrink` | `1` | Tỷ lệ **co lại** khi container thiếu chỗ |
| `flex-basis` | `auto` | Kích thước **ban đầu** trước khi grow/shrink |

Shorthand `flex`:
- `flex: 1` tương đương `flex: 1 1 0%` (grow=1, shrink=1, basis=0%)
- `flex: auto` tương đương `flex: 1 1 auto`
- `flex: none` tương đương `flex: 0 0 auto`
- `flex: 0 1 auto` là **giá trị mặc định** (initial)

### Code ví dụ

```css
.container {
  display: flex;
  width: 600px;
}

/* Item A: chiếm gấp đôi phần thừa so với B */
.item-a {
  flex-grow: 2;
  flex-basis: 100px;
}

/* Item B: chiếm 1 phần thừa */
.item-b {
  flex-grow: 1;
  flex-basis: 100px;
}

/*
  Container: 600px
  Tổng basis: 100 + 100 = 200px
  Phần thừa: 600 - 200 = 400px
  Item A nhận: 400 * (2/3) = 266.67px -> tổng = 366.67px
  Item B nhận: 400 * (1/3) = 133.33px -> tổng = 233.33px
*/

/* Chia đều hoàn hảo */
.equal-columns {
  flex: 1; /* Tất cả item bằng nhau */
}

/* Sidebar cố định + content linh hoạt */
.sidebar {
  flex: 0 0 250px; /* Không grow, không shrink, cố định 250px */
}
.content {
  flex: 1; /* Chiếm hết phần còn lại */
}
```

### Đáp án mẫu

> "`flex-grow` quyết định item giãn ra bao nhiêu khi thừa chỗ, `flex-shrink` quyết định co lại bao nhiêu khi thiếu chỗ, `flex-basis` là kích thước khởi điểm trước khi tính grow/shrink. `flex: 1` là shorthand cho `flex-grow: 1, flex-shrink: 1, flex-basis: 0%` -- nghĩa là item sẽ chia đều không gian với các item khác cũng có `flex: 1`."

---

## Câu 3: CSS Grid -- giải thích grid-template, fr unit, và sự khác nhau giữa auto-fill và auto-fit `[Intermediate]`

### Giải thích lý thuyết

**CSS Grid** cho phép bạn chia layout thành **hàng và cột** cùng lúc (2 chiều), khác với Flexbox chỉ xử lý 1 chiều.

**`fr` unit** (fraction): đơn vị chia phần trong Grid. `1fr` nghĩa là "1 phần của không gian còn lại sau khi trừ các giá trị cố định".

**`auto-fill` vs `auto-fit`**: cả hai đều dùng trong `repeat()` để tạo responsive grid mà **không cần media query**, nhưng khác nhau khi container rộng hơn nội dung:

| | `auto-fill` | `auto-fit` |
|---|---|---|
| Khi thừa chỗ | Tạo **cột trống** (invisible) | **Collapse** cột trống, item giãn ra |
| Khi đủ item | Giống nhau | Giống nhau |
| Use case | Grid cần giữ cấu trúc cố định | Grid cần item lấp đầy container |

### Code ví dụ

```css
/* Grid cơ bản 3 cột */
.grid-basic {
  display: grid;
  grid-template-columns: 200px 1fr 1fr;
  grid-template-rows: auto 1fr auto;
  gap: 16px;
}

/* Fr unit: sidebar cố định + 2 cột content bằng nhau */
.layout {
  display: grid;
  grid-template-columns: 250px 1fr 1fr;
  /* 250px cố định, phần còn lại chia đều cho 2 cột */
}

/* Responsive grid KHÔNG cần media query */

/* auto-fill: tạo cột trống nếu thừa chỗ */
.grid-auto-fill {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

/* auto-fit: item giãn ra lấp đầy nếu thừa chỗ */
.grid-auto-fit {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

/* Grid areas -- đặt tên vùng */
.page-layout {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main aside"
    "footer footer footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.aside   { grid-area: aside; }
.footer  { grid-area: footer; }
```

### Đáp án mẫu

> "CSS Grid dùng `grid-template-columns` và `grid-template-rows` để định nghĩa lưới. `fr` là đơn vị chia phần không gian còn lại -- `1fr 2fr` nghĩa là cột 2 rộng gấp đôi cột 1. `auto-fill` tạo nhiều cột nhất có thể và giữ cột trống, `auto-fit` cũng tạo nhiều cột nhưng collapse cột trống để item giãn ra lấp đầy container. Trong thực tế, `auto-fit` với `minmax()` là combo phổ biến nhất để làm responsive grid không cần media query."

---

## Câu 4: Stacking Context là gì? Khi nào một stacking context mới được tạo ra? `[Senior]`

### Giải thích lý thuyết

**Stacking Context** là một lớp (layer) 3D ảo quyết định thứ tự hiển thị chồng lên nhau của các element. Mỗi stacking context là một **thế giới riêng** -- `z-index` bên trong nó chỉ so sánh với nhau, không "nhảy" ra ngoài được.

Đây là lý do **phổ biến nhất** khiến `z-index: 9999` không hoạt động: element nằm trong một stacking context có thứ tự thấp hơn stacking context khác.

**Khi nào tạo stacking context mới:**

| Điều kiện | Ví dụ |
|---|---|
| Root element | `<html>` |
| `position` khác `static` + có `z-index` | `position: relative; z-index: 1` |
| `position: fixed` hoặc `sticky` | Luôn tạo stacking context |
| `opacity` nhỏ hơn 1 | `opacity: 0.99` |
| `transform` khác `none` | `transform: translateZ(0)` |
| `filter` khác `none` | `filter: blur(0)` |
| `isolation: isolate` | Tạo stacking context "có chủ đích" |
| Flex/Grid item có `z-index` | Không cần `position` |
| `will-change` với một số giá trị | `will-change: transform` |

### Code ví dụ

```html
<!-- Ví dụ: z-index: 9999 nhưng vẫn bị che -->
<div class="parent-a" style="position: relative; z-index: 1;">
  <!-- Stacking context A (z-index: 1) -->
  <div class="child" style="position: absolute; z-index: 9999;">
    Tôi có z-index 9999 nhưng vẫn bị che!
  </div>
</div>

<div class="parent-b" style="position: relative; z-index: 2;">
  <!-- Stacking context B (z-index: 2) -->
  <div class="overlay" style="position: absolute; z-index: 1;">
    Tôi chỉ có z-index 1 nhưng che được 9999 ở trên!
  </div>
</div>
```

```css
/* Cách debug: dùng isolation để tạo stacking context có chủ đích */
.modal-wrapper {
  isolation: isolate; /* Tạo stacking context mới, sạch sẽ */
}

.modal-backdrop {
  position: fixed;
  z-index: 1;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: fixed;
  z-index: 2;
}

/* Cẩn thận: opacity tạo stacking context */
.card {
  opacity: 0.99; /* Tạo stacking context mới! */
}

.card .tooltip {
  z-index: 9999; /* Chỉ có tác dụng TRONG stacking context của .card */
}
```

### Đáp án mẫu

> "Stacking context là một lớp 3D ảo xác định thứ tự chồng nhau của elements. `z-index` chỉ so sánh được giữa các element cùng stacking context. Stacking context mới được tạo bởi nhiều thuộc tính CSS như `position` + `z-index`, `opacity` nhỏ hơn 1, `transform`, `filter`... Đây là lý do phổ biến khiến `z-index: 9999` không hoạt động -- vì parent element nằm trong stacking context có thứ tự thấp. Tôi thường dùng `isolation: isolate` để tạo stacking context có chủ đích, tránh side effect."

---

## Câu 5: Block Formatting Context (BFC) là gì? Nó giải quyết vấn đề gì? `[Senior]`

### Giải thích lý thuyết

**Block Formatting Context (BFC)** là một vùng trong layout mà các element bên trong **không ảnh hưởng** đến layout bên ngoài, và ngược lại. BFC như một "hộp kín" cô lập layout.

**BFC giải quyết 3 vấn đề kinh điển:**

1. **Margin collapsing**: Margin trên/dưới của 2 block element liền kề sẽ bị "sập" (collapse) thành 1. BFC ngăn điều này.
2. **Float containment**: Parent không bao được child float (chiều cao parent = 0). BFC khiến parent "nhìn thấy" float children.
3. **Float exclusion**: Text/content bên cạnh float element bị "chui vào" dưới float. BFC ngăn element chồng lên float.

**Cách tạo BFC:**

| Cách | Code |
|---|---|
| `overflow` khác `visible` | `overflow: hidden` hoặc `overflow: auto` |
| `display: flow-root` | Cách hiện đại, rõ ràng nhất |
| `display: flex` hoặc `grid` | Flex/Grid container tạo BFC |
| `float` khác `none` | `float: left` |
| `position: absolute/fixed` | Element ra khỏi flow |

### Code ví dụ

```css
/* Vấn đề 1: Margin collapsing */
.parent {
  background: lightblue;
  /* Margin của child "tràn ra" ngoài parent */
}
.child {
  margin-top: 50px; /* Margin này collapse với parent! */
}

/* Giải pháp: BFC cho parent */
.parent-fixed {
  display: flow-root; /* Tạo BFC -> margin child bị chặn */
  background: lightblue;
}

/* Vấn đề 2: Float containment (clearfix) */
.container {
  background: lightgreen;
  /* Chiều cao = 0 vì children đều float! */
}
.float-child {
  float: left;
  width: 200px;
  height: 200px;
}

/* Giải pháp cũ: clearfix hack */
.container-old::after {
  content: "";
  display: table;
  clear: both;
}

/* Giải pháp hiện đại: BFC */
.container-modern {
  display: flow-root; /* Parent bao được float children */
  background: lightgreen;
}

/* Vấn đề 3: Text chui vào dưới float */
.sidebar {
  float: left;
  width: 200px;
}
.main-content {
  /* Text sẽ wrap quanh sidebar, có thể chui vào dưới */
}

/* Giải pháp: BFC cho main-content */
.main-content-fixed {
  overflow: hidden; /* Tạo BFC -> không chồng lên float */
}
```

### Đáp án mẫu

> "BFC là một vùng layout độc lập, nơi mà các element bên trong không ảnh hưởng đến bên ngoài. Nó giải quyết 3 vấn đề chính: margin collapsing giữa parent-child, float containment (parent không bao được float children), và ngăn content chồng lên float element. Cách tạo BFC hiện đại nhất là `display: flow-root`, trước đây thường dùng `overflow: hidden` hoặc clearfix hack."

---

## Câu 6: So sánh Flexbox và Grid. Khi nào dùng cái nào? `[Intermediate]`

### Giải thích lý thuyết

| Tiêu chí | Flexbox | Grid |
|---|---|---|
| **Chiều** | 1 chiều (hàng HOẶC cột) | 2 chiều (hàng VÀ cột) |
| **Điều khiển** | Từ content ra (content-first) | Từ layout vào (layout-first) |
| **Alignment** | Dọc theo 1 trục | Cả 2 trục cùng lúc |
| **Item sizing** | Dựa vào nội dung + flex rules | Dựa vào grid track definitions |
| **Overlap** | Không hỗ trợ | Hỗ trợ (grid items chồng nhau) |
| **Use case chính** | Navbar, card row, centering | Page layout, dashboard, gallery |
| **Responsive** | Cần media queries hoặc `flex-wrap` | `auto-fit` + `minmax()` |
| **Browser support** | Rất tốt | Rất tốt (IE không hỗ trợ đầy đủ) |

**Nguyên tắc chọn:**
- Layout **1 chiều** (hàng button, navbar, card list) -> **Flexbox**
- Layout **2 chiều** (page layout, dashboard grid) -> **Grid**
- Khi item size phụ thuộc **nội dung** -> **Flexbox**
- Khi cần **vùng đặt tên** (grid areas) -> **Grid**
- Thực tế: **dùng cả hai kết hợp** -- Grid cho layout tổng thể, Flexbox cho component bên trong

### Code ví dụ

```css
/* Flexbox: navbar */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 64px;
}

.nav-links {
  display: flex;
  gap: 16px;
}

/* Grid: page layout */
.page {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: 64px 1fr auto;
  grid-template-areas:
    "header header"
    "sidebar main"
    "sidebar footer";
  min-height: 100vh;
}

/* Kết hợp: Grid layout + Flexbox component */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto; /* Push to bottom */
}
```

### Đáp án mẫu

> "Flexbox xử lý layout 1 chiều -- hàng hoặc cột, phù hợp cho component-level layout như navbar, card row. Grid xử lý 2 chiều -- hàng và cột cùng lúc, phù hợp cho page-level layout. Trong thực tế tôi thường kết hợp cả hai: Grid cho bố cục tổng thể của trang, Flexbox cho các component nhỏ bên trong. Grid cũng hỗ trợ responsive tốt hơn nhờ `auto-fit` + `minmax()` mà không cần media query."

---

## Câu bonus: Box model -- content-box vs border-box `[Intermediate]`

### Giải thích lý thuyết

**Box model** quyết định cách tính kích thước element:

| | `content-box` (mặc định) | `border-box` |
|---|---|---|
| `width` bao gồm | Chỉ content | Content + padding + border |
| Tổng kích thước | width + padding + border | width (đã bao gồm tất cả) |
| Dễ tính toán? | Khó (phải cộng thêm) | Dễ (what you set is what you get) |

### Code ví dụ

```css
/* Reset phổ biến: đặt tất cả về border-box */
*,
*::before,
*::after {
  box-sizing: border-box;
}

/* content-box (mặc định): width = 200px nhưng element thực tế = 242px */
.content-box-example {
  box-sizing: content-box;
  width: 200px;
  padding: 16px;     /* +32px */
  border: 5px solid; /* +10px */
  /* Tổng thực tế: 200 + 32 + 10 = 242px */
}

/* border-box: width = 200px và element thực tế = 200px */
.border-box-example {
  box-sizing: border-box;
  width: 200px;
  padding: 16px;
  border: 5px solid;
  /* Content thực tế: 200 - 32 - 10 = 158px */
  /* Nhưng element trên trang = đúng 200px */
}
```

### Đáp án mẫu

> "CSS box model có 2 chế độ: `content-box` (mặc định) chỉ tính content vào width/height nên tổng kích thước thực tế = width + padding + border. `border-box` bao gồm cả padding và border vào width/height nên kích thước thực tế đúng bằng width bạn set. Trong thực tế, gần như 100% dự án đều dùng `box-sizing: border-box` reset cho tất cả element vì nó trực quan hơn nhiều."

---

## Lỗi thường gặp khi trả lời

1. **Nhầm lẫn justify-content và align-items khi đổi flex-direction**: Nhiều bạn quên rằng `justify-content` luôn theo main axis. Khi `flex-direction: column`, `justify-content` căn theo chiều dọc chứ không phải ngang.

2. **Nghĩ rằng z-index luôn hoạt động**: `z-index` chỉ có tác dụng khi element có `position` khác `static` (hoặc là flex/grid item). Và quan trọng hơn, nó chỉ so sánh **trong cùng stacking context**.

3. **Không biết `display: flow-root`**: Nhiều bạn vẫn dùng clearfix hack hoặc `overflow: hidden` để chứa float. `display: flow-root` là cách hiện đại và rõ ý đồ nhất để tạo BFC.

4. **Nói "Flexbox cho component, Grid cho page layout" một cách tuyệt đối**: Đây chỉ là heuristic, không phải quy tắc cứng. Grid hoàn toàn có thể dùng cho component nhỏ (ví dụ: form layout), và Flexbox cũng dùng tốt cho page layout đơn giản.

5. **Quên `flex: 1` khác `flex-grow: 1`**: `flex: 1` set cả basis về 0%, trong khi `flex-grow: 1` giữ basis ở auto. Kết quả phân chia không gian khác nhau đáng kể.

6. **Không biết `auto-fill` vs `auto-fit`**: Khi được hỏi thường chỉ nói "dùng `repeat(auto-fit, minmax(...))` cho responsive" mà không giải thích được sự khác biệt với `auto-fill`.
