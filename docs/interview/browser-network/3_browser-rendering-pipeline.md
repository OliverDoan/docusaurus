---
sidebar_position: 3
title: "DOM, CSSOM, Render Tree, Repaint, Reflow"
---

# DOM, CSSOM, Render Tree, Repaint, Reflow

Hiểu được browser rendering pipeline là cách bạn "level up" từ một frontend developer bình thường thành người thực sự biết tối ưu performance. Interviewer hỏi phần này để xem bạn có hiểu **tại sao** một số thao tác DOM chậm, và **làm sao** để tránh.

---

## Câu 1: Mô tả Critical Rendering Path -- từ khi browser nhận HTML đến khi user thấy pixels trên màn hình `[Senior]`

### Giải thích lý thuyết

**Critical Rendering Path (CRP)** là chuỗi bước browser thực hiện để chuyển HTML/CSS/JS thành pixels:

```
HTML → DOM → |
              |→ Render Tree → Layout → Paint → Composite → Pixels
CSS  → CSSOM → |
```

**Các bước chi tiết:**

| Bước | Input | Output | Blocking? |
|---|---|---|---|
| 1. **Parse HTML** | HTML bytes | DOM tree | - |
| 2. **Parse CSS** | CSS bytes | CSSOM tree | Render-blocking |
| 3. **Execute JS** | Script tags | Modified DOM/CSSOM | Parser-blocking |
| 4. **Render Tree** | DOM + CSSOM | Visible elements + styles | - |
| 5. **Layout** | Render tree | Kích thước + vị trí mỗi element | - |
| 6. **Paint** | Layout info | Pixels cho mỗi layer | - |
| 7. **Composite** | Painted layers | Final image trên màn hình | GPU-accelerated |

**Hai khái niệm blocking quan trọng:**
- **CSS là render-blocking**: Browser không render gì cho đến khi CSSOM xây xong (tránh FOUC -- Flash of Unstyled Content)
- **JS là parser-blocking**: Browser dừng parse HTML khi gặp `<script>` (trừ khi có `async`/`defer`)

### Code ví dụ

```html
<!-- Thứ tự resources ảnh hưởng CRP -->
<html>
<head>
  <!-- CSS render-blocking: phải load xong trước khi render -->
  <link rel="stylesheet" href="critical.css" />

  <!-- Non-critical CSS: load async -->
  <link rel="stylesheet" href="non-critical.css" media="print" onload="this.media='all'" />

  <!-- Preload font (tránh layout shift) -->
  <link rel="preload" href="/fonts/Inter.woff2" as="font" type="font/woff2" crossorigin />

  <!-- JS parser-blocking: dừng HTML parsing -->
  <script src="blocking.js"></script>

  <!-- JS async: download song song, execute khi ready (không đảm bảo thứ tự) -->
  <script async src="analytics.js"></script>

  <!-- JS defer: download song song, execute sau khi HTML parse xong (đảm bảo thứ tự) -->
  <script defer src="app.js"></script>
</head>
<body>
  <!-- Content render SAU khi CSS load + JS blocking execute -->
  <h1>Hello World</h1>
</body>
</html>
```

```
Timeline minh họa:

HTML parsing:   |████████░░░░░████████████|
CSS download:   |████████████|
CSS parsing:              |██|
JS download:    |████████████████|
JS execute:                     |███|
Render Tree:                        |██|
Layout:                               |█|
Paint:                                  |█|
Composite:                               |█|
Pixels:                                   ✓

░ = HTML parsing bị block bởi JS
```

### Dap an mau

> "Critical Rendering Path gồm: parse HTML thành DOM, parse CSS thành CSSOM, kết hợp thành Render Tree, rồi Layout (tính kích thước/vị trí), Paint (vẽ pixels), và Composite (ghép layers). CSS là render-blocking vì browser cần CSSOM trước khi render. JS là parser-blocking vì có thể modify DOM. Để tối ưu CRP: inline critical CSS, dùng `defer`/`async` cho JS, preload fonts, và giảm critical resources."

---

## Câu 2: DOM construction hoạt động thế nào? Parse HTML thành DOM tree có các bước gì? `[Intermediate]`

### Giải thích lý thuyết

Browser chuyển HTML bytes thành DOM tree qua 4 bước:

```
Bytes → Characters → Tokens → Nodes → DOM Tree
```

| Bước | Ví dụ |
|---|---|
| **Bytes** | `3C 68 74 6D 6C 3E` |
| **Characters** | `<html><head>...` |
| **Tokens** | StartTag: html, StartTag: head, EndTag: head... |
| **Nodes** | HTMLHtmlElement, HTMLHeadElement... |
| **DOM Tree** | Cây phân cấp các nodes |

**Đặc điểm quan trọng:**
- DOM construction là **incremental** -- browser bắt đầu render ngay khi có đủ nodes, không đợi toàn bộ HTML
- Khi gặp `<script>` (không có async/defer), parser **dừng lại** và đợi script download + execute
- Khi gặp `<link rel="stylesheet">`, parser tiếp tục nhưng **rendering bị block**

### Code ví dụ

```javascript
// DOM là một object model -- mỗi node là một object
// Browser xây dựng cây từ HTML

// HTML: <div id="app"><p>Hello</p></div>
// DOM Tree:
// Document
//   └── HTMLHtmlElement
//       └── HTMLBodyElement
//           └── HTMLDivElement (id="app")
//               └── HTMLParagraphElement
//                   └── Text ("Hello")

// Truy cập DOM tree
const div = document.getElementById('app');
console.log(div.nodeType);     // 1 (ELEMENT_NODE)
console.log(div.nodeName);     // "DIV"
console.log(div.childNodes);   // NodeList [p]
console.log(div.parentNode);   // body

// DOM API thao tác tree
const newP = document.createElement('p');     // Tạo node mới
newP.textContent = 'New paragraph';            // Set content
div.appendChild(newP);                         // Thêm vào tree

// Mỗi thao tác DOM đều có thể trigger reflow/repaint
// Nên batch DOM operations:

// WRONG: Trigger reflow mỗi lần append
for (let i = 0; i < 100; i++) {
  const li = document.createElement('li');
  li.textContent = `Item ${i}`;
  document.querySelector('ul').appendChild(li); // 100 lần reflow!
}

// CORRECT: Dùng DocumentFragment
const fragment = document.createDocumentFragment();
for (let i = 0; i < 100; i++) {
  const li = document.createElement('li');
  li.textContent = `Item ${i}`;
  fragment.appendChild(li); // Không trigger reflow
}
document.querySelector('ul').appendChild(fragment); // 1 lần reflow
```

### Dap an mau

> "Browser parse HTML thành DOM qua các bước: bytes -> characters -> tokens -> nodes -> DOM tree. Quá trình này là incremental, browser render dần khi có đủ nodes. Khi gặp script tag (không defer/async), parser dừng lại đợi script execute xong mới tiếp tục -- đó là lý do ta đặt script ở cuối body hoặc dùng defer. DOM là object model nơi mỗi HTML element trở thành một JavaScript object có thể thao tác được."

---

## Câu 3: CSSOM là gì? Tại sao CSS được gọi là "render-blocking"? `[Intermediate]`

### Giải thích lý thuyết

**CSSOM (CSS Object Model)** là phiên bản "DOM" của CSS -- một tree structure chứa tất cả style rules đã được parse.

**Quá trình xây CSSOM:**
```
CSS Bytes → Characters → Tokens → Nodes → CSSOM Tree
```

**Tại sao CSS là render-blocking:**
1. Browser cần CSSOM để tạo Render Tree
2. Không có CSSOM = không biết element nào visible, kích thước bao nhiêu
3. Render mà không có CSS = **FOUC** (Flash of Unstyled Content) -- rất xấu UX
4. Vì vậy browser **chờ** CSSOM xong mới render

**CSSOM khác DOM:**
- DOM xây incremental (parse dần)
- CSSOM phải xây **hoàn chỉnh** trước khi dùng (vì CSS cascade -- rule sau có thể override rule trước)

### Code ví dụ

```html
<!-- CSS render-blocking: browser đợi load xong mới render -->
<head>
  <!-- File này block rendering của toàn bộ page -->
  <link rel="stylesheet" href="styles.css" />

  <!-- Optimization: chỉ block khi media match -->
  <link rel="stylesheet" href="print.css" media="print" />
  <!-- print.css chỉ block rendering khi in, không block trên screen -->

  <!-- Optimization: critical CSS inline -->
  <style>
    /* Inline CSS quan trọng nhất để render above-the-fold content */
    body { margin: 0; font-family: system-ui; }
    .hero { height: 100vh; display: flex; align-items: center; }
  </style>

  <!-- Non-critical CSS load async -->
  <link
    rel="stylesheet"
    href="non-critical.css"
    media="print"
    onload="this.media='all'"
  />
  <noscript>
    <link rel="stylesheet" href="non-critical.css" />
  </noscript>
</head>
```

```javascript
// CSSOM API -- ít dùng trực tiếp nhưng cần hiểu
// Browser xây CSSOM tree từ CSS:

// CSS Input:
// body { font-size: 16px; }
// .container { width: 80%; margin: 0 auto; }
// .container p { color: #333; line-height: 1.6; }

// CSSOM Tree:
// body
//   ├── font-size: 16px
//   └── .container
//       ├── width: 80%
//       ├── margin: 0 auto
//       └── p
//           ├── color: #333
//           ├── line-height: 1.6
//           └── font-size: 16px (inherited from body)

// Truy cập CSSOM qua JavaScript
const styles = window.getComputedStyle(document.querySelector('.container'));
console.log(styles.width);      // "800px" (computed value, không phải 80%)
console.log(styles.fontSize);   // "16px" (inherited)

// Mỗi lần gọi getComputedStyle có thể trigger style recalculation
// Nên cache kết quả nếu đọc nhiều lần
```

### Dap an mau

> "CSSOM là CSS Object Model -- cây style rules tương tự DOM. CSS là render-blocking vì browser cần CSSOM để tạo Render Tree -- nếu render mà chưa có CSS sẽ gây FOUC. Khác với DOM xây incremental, CSSOM phải xây xong hoàn toàn vì CSS cascade có thể override bất cứ lúc nào. Để tối ưu: inline critical CSS, load non-critical CSS async, dùng media attribute để giảm render-blocking."

---

## Câu 4: Phân biệt Layout (Reflow) và Paint (Repaint). Cái nào "đắt" hơn? `[Senior]`

### Giải thích lý thuyết

| | Layout (Reflow) | Paint (Repaint) |
|---|---|---|
| **Trigger** | Thay đổi kích thước/vị trí element | Thay đổi visual appearance (không thay đổi layout) |
| **Tính toán** | Kích thước + vị trí **tất cả** element bị ảnh hưởng | Vẽ pixels cho element bị thay đổi |
| **Chi phí** | **Rất đắt** (cascade effect) | Đắt nhưng ít hơn reflow |
| **Cascade** | Reflow 1 element có thể trigger reflow toàn bộ page | Chỉ ảnh hưởng element bị thay đổi |
| **Ví dụ trigger** | width, height, margin, padding, font-size, display | color, background, visibility, box-shadow |

**Mối quan hệ:**
```
Reflow → luôn kèm Repaint (vì vị trí thay đổi thì phải vẽ lại)
Repaint → KHÔNG trigger Reflow (chỉ vẽ lại, không tính layout)
```

**Thuộc tính CSS và chi phí:**

| Chỉ Composite (rẻ nhất) | Chỉ Repaint | Trigger Reflow (đắt nhất) |
|---|---|---|
| `transform` | `color` | `width`, `height` |
| `opacity` | `background` | `margin`, `padding` |
| `will-change` | `border-color` | `font-size` |
| | `box-shadow` | `display` |
| | `visibility` | `position` |
| | | `top`, `left`, `right`, `bottom` |

### Code ví dụ

```javascript
// WRONG: Layout thrashing -- đọc rồi ghi liên tục
function resizeAllBoxes() {
  const boxes = document.querySelectorAll('.box');
  boxes.forEach(box => {
    const width = box.offsetWidth; // Đọc -> trigger reflow để lấy giá trị mới nhất
    box.style.width = (width * 1.1) + 'px'; // Ghi -> invalidate layout
    // Lần đọc tiếp theo sẽ trigger reflow LẠI!
  });
}
// N elements = N lần reflow!

// CORRECT: Batch đọc trước, ghi sau
function resizeAllBoxesBetter() {
  const boxes = document.querySelectorAll('.box');

  // Bước 1: Đọc hết (1 lần reflow)
  const widths = Array.from(boxes).map(box => box.offsetWidth);

  // Bước 2: Ghi hết (1 lần reflow cuối)
  boxes.forEach((box, i) => {
    box.style.width = (widths[i] * 1.1) + 'px';
  });
}

// CORRECT: Dùng requestAnimationFrame
function animateBox(box, targetX) {
  // WRONG: dùng left (trigger reflow mỗi frame)
  // box.style.left = targetX + 'px';

  // CORRECT: dùng transform (chỉ composite, không reflow)
  box.style.transform = `translateX(${targetX}px)`;
}

// CORRECT: Dùng CSS class thay vì inline styles
function showElement(el) {
  // WRONG: nhiều style changes = nhiều reflow
  el.style.display = 'block';
  el.style.width = '200px';
  el.style.height = '200px';
  el.style.margin = '16px';

  // CORRECT: 1 class change = 1 reflow
  el.classList.add('visible');
}
```

```css
/* CSS tương ứng */
.visible {
  display: block;
  width: 200px;
  height: 200px;
  margin: 16px;
}

/* Animation performance: transform + opacity = chỉ composite */
.animate-good {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.animate-good:hover {
  transform: scale(1.05) translateY(-4px); /* Không trigger reflow */
  opacity: 0.9;                            /* Không trigger reflow */
}

/* Animation anti-pattern: width/height/top/left */
.animate-bad {
  transition: width 0.3s ease, top 0.3s ease;
}

.animate-bad:hover {
  width: 110%;  /* Trigger REFLOW mỗi frame! */
  top: -4px;    /* Trigger REFLOW mỗi frame! */
}
```

### Dap an mau

> "Layout (reflow) tính kích thước và vị trí elements -- rất đắt vì thay đổi 1 element có thể cascade ảnh hưởng toàn bộ page. Paint (repaint) vẽ pixels -- đắt nhưng ít hơn reflow. Reflow luôn kèm repaint nhưng repaint không trigger reflow. Để tối ưu: dùng `transform`/`opacity` cho animation (chỉ composite, không reflow), tránh layout thrashing (đọc-ghi-đọc-ghi DOM), batch DOM operations, và dùng CSS class thay vì inline styles."

---

## Câu 5: Composite layers là gì? Khi nào browser tạo layer mới? `[Senior]`

### Giải thích lý thuyết

**Compositing** là bước cuối cùng trong rendering pipeline. Browser chia page thành nhiều **layers** (lớp), paint mỗi layer riêng biệt, rồi **ghép** (composite) chúng lại trên GPU.

**Tại sao layers quan trọng:**
- Khi 1 layer thay đổi, chỉ cần repaint layer đó, không ảnh hưởng layer khác
- GPU composite nhanh hơn CPU paint
- Animation trên separate layer = **smooth 60fps**

**Khi nào browser tạo layer mới:**

| Trigger | Ví dụ |
|---|---|
| `transform` (3D hoặc animated) | `transform: translateZ(0)` |
| `opacity` (animated) | `opacity: 0.99` |
| `will-change` | `will-change: transform` |
| `position: fixed` | Fixed elements |
| `video`, `canvas`, `iframe` | Media elements |
| Overlap với layer có composited | Element chồng lên animated element |

**Cẩn thận: Layer explosion!** Quá nhiều layers = tốn memory GPU. Không nên promote tất cả elements lên layer riêng.

### Code ví dụ

```css
/* Promote element lên composite layer */
.animated-card {
  /* Cách 1: will-change (khuyến khích) */
  will-change: transform;
  /* Browser biết trước element sẽ animate -> tạo layer sẵn */

  /* Cách 2: translateZ hack (cũ, vẫn hoạt động) */
  /* transform: translateZ(0); */

  transition: transform 0.3s ease;
}

.animated-card:hover {
  transform: scale(1.05);
  /* Animation chỉ xảy ra trên composite layer -> smooth 60fps */
}

/* will-change best practices */
.card {
  /* WRONG: will-change on everything */
  /* will-change: transform, opacity, width, height; */

  /* WRONG: will-change on too many elements */
  /* .card { will-change: transform; } -- nếu có 1000 cards = 1000 layers! */

  /* CORRECT: chỉ dùng khi biết chắc sẽ animate */
  transition: transform 0.3s ease;
}

.card:hover {
  /* CORRECT: promote layer khi cần */
  will-change: transform;
  transform: translateY(-4px);
}

/* Sau khi animation xong, remove will-change */
.card {
  transition: transform 0.3s ease;
}

/* Performance: so sánh animation approaches */

/* Approach 1: CHẬM -- reflow mỗi frame */
@keyframes move-bad {
  from { left: 0; }
  to { left: 100px; }
}

/* Approach 2: NHANH -- chỉ composite */
@keyframes move-good {
  from { transform: translateX(0); }
  to { transform: translateX(100px); }
}

.moving-element {
  animation: move-good 1s ease infinite;
  /* Chạy trên GPU, không ảnh hưởng layout các element khác */
}
```

```javascript
// Kiểm tra layers trong Chrome DevTools:
// 1. Mở DevTools -> More tools -> Layers
// 2. Hoặc: Rendering tab -> check "Layer borders"
// Viền cam = composite layer

// Debug paint với Chrome DevTools:
// Rendering tab -> check "Paint flashing"
// Vùng xanh lá = đang được repaint

// requestAnimationFrame: đồng bộ với browser refresh rate
function animate(element, start, end, duration) {
  const startTime = performance.now();

  function frame(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Dùng transform thay vì left/top
    const current = start + (end - start) * progress;
    element.style.transform = `translateX(${current}px)`;

    if (progress < 1) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}

// Web Animations API (modern, declarative)
const element = document.querySelector('.box');
element.animate(
  [
    { transform: 'translateX(0)' },
    { transform: 'translateX(100px)' }
  ],
  {
    duration: 1000,
    easing: 'ease-in-out',
    fill: 'forwards'
  }
);
```

### Dap an mau

> "Compositing là bước cuối -- browser chia page thành layers, paint riêng từng layer, rồi GPU ghép chúng lại. Elements được promote lên composite layer riêng khi dùng `transform`, `opacity`, `will-change`, hoặc `position: fixed`. Lợi ích: khi layer thay đổi chỉ cần repaint layer đó, GPU composite nhanh hơn CPU. Nhưng cẩn thận layer explosion -- quá nhiều layers tốn GPU memory. Best practice: chỉ promote elements thực sự cần animate."

---

## Câu 6: Layout thrashing là gì? Cách phòng tránh? `[Senior]`

### Giải thích lý thuyết

**Layout thrashing** (forced synchronous layout) xảy ra khi JavaScript **đọc layout property** (offsetWidth, clientHeight, getBoundingClientRect...) ngay sau khi **ghi DOM** (thay đổi style). Browser phải **tính toán layout ngay lập tức** thay vì batch lại.

```
Bình thường: Ghi, Ghi, Ghi -> 1 Layout
Thrashing:   Ghi, Đọc, Ghi, Đọc, Ghi, Đọc -> Layout, Layout, Layout
```

**Các property trigger forced layout khi đọc:**

| Category | Properties |
|---|---|
| **Element** | `offsetTop/Left/Width/Height`, `clientTop/Left/Width/Height` |
| **Element** | `scrollTop/Left/Width/Height` |
| **Element** | `getBoundingClientRect()`, `getComputedStyle()` |
| **Window** | `scrollX/Y`, `innerWidth/Height` |

### Code ví dụ

```javascript
// WRONG: Layout thrashing
function resizeCards() {
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    // Đọc (trigger layout vì DOM vừa thay đổi ở iteration trước)
    const height = card.offsetHeight;
    // Ghi (invalidate layout)
    card.style.height = (height + 20) + 'px';
    // Vòng lặp tiếp: đọc lại -> layout lại -> O(n) forced layouts!
  });
}

// CORRECT: Tách đọc và ghi
function resizeCardsOptimized() {
  const cards = document.querySelectorAll('.card');

  // Phase 1: Đọc tất cả (1 lần layout)
  const heights = Array.from(cards).map(card => card.offsetHeight);

  // Phase 2: Ghi tất cả (1 lần layout khi browser cần)
  cards.forEach((card, i) => {
    card.style.height = (heights[i] + 20) + 'px';
  });
}

// CORRECT: Dùng requestAnimationFrame
function updateLayout() {
  // Đọc trong frame hiện tại
  const width = element.offsetWidth;

  // Ghi trong frame tiếp theo
  requestAnimationFrame(() => {
    element.style.width = (width * 2) + 'px';
  });
}

// CORRECT: Dùng ResizeObserver thay vì poll layout
const observer = new ResizeObserver(entries => {
  for (const entry of entries) {
    const { width, height } = entry.contentRect;
    // Không trigger forced layout vì ResizeObserver
    // được gọi async, sau layout phase
    console.log(`Size: ${width} x ${height}`);
  }
});

observer.observe(document.querySelector('.responsive-element'));

// CORRECT: CSS containment để giới hạn scope reflow
// contain: layout -- reflow trong element không ảnh hưởng ngoài
// contain: paint -- repaint không tràn ra ngoài
// contain: size -- element size không phụ thuộc children
```

```css
/* CSS Containment: giới hạn scope của reflow/repaint */
.card {
  contain: layout style; /* Reflow trong card không ảnh hưởng bên ngoài */
}

/* content-visibility: skip rendering off-screen content */
.long-list-item {
  content-visibility: auto;
  contain-intrinsic-size: 0 200px; /* Estimated size khi hidden */
  /* Browser skip rendering items off-screen -> huge perf win */
}
```

### Dap an mau

> "Layout thrashing xảy ra khi JS đọc layout property (offsetWidth, getBoundingClientRect) ngay sau khi ghi DOM, buộc browser tính layout synchronous. Ví dụ: vòng lặp đọc-ghi-đọc-ghi gây N lần forced layout thay vì 1 lần. Cách fix: tách phase đọc và ghi riêng biệt, dùng requestAnimationFrame, dùng ResizeObserver thay vì polling, và CSS containment để giới hạn scope reflow."

---

## Loi thuong gap khi tra loi

1. **Nói DOM construction đợi hết HTML mới bắt đầu**: Sai -- DOM construction là incremental. Browser parse và render dần, đó là lý do bạn thấy page load từ trên xuống.

2. **Nhầm "JS blocking" và "CSS blocking"**: JS **parser-blocking** (dừng HTML parsing). CSS **render-blocking** (dừng rendering, nhưng HTML parsing vẫn tiếp tục). Hai khái niệm khác nhau.

3. **Nói "reflow chỉ ảnh hưởng 1 element"**: Reflow có **cascade effect**. Thay đổi width của 1 element có thể trigger reflow toàn bộ page vì layout của elements xung quanh thay đổi theo.

4. **Không biết `will-change` có side effects**: `will-change` promote element lên composite layer riêng = tốn GPU memory. Dùng cho 1000 elements = crash trên mobile. Chỉ dùng cho elements thực sự cần animate.

5. **Quên `content-visibility: auto`**: Đây là optimization đơn giản nhất cho long lists/pages. Browser skip rendering off-screen content, có thể cải thiện initial render time đáng kể.

6. **Chỉ biết "dùng transform thay vì top/left" mà không giải thích được tại sao**: Cần giải thích rendering pipeline -- transform chỉ trigger composite (GPU), trong khi top/left trigger layout + paint + composite (CPU). Đó là lý do transform mượt hơn ở 60fps.
