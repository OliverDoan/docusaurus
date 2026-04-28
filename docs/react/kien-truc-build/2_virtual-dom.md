---
sidebar_position: 2
title: "2. Virtual DOM"
---

# Virtual DOM


---

## Mục lục

- [Virtual DOM là gì?](#virtual-dom-là-gì)
- [Tại sao Virtual DOM ra đời?](#tại-sao-virtual-dom-ra-đời)
- [Reconciliation — Thuật toán đồng bộ](#reconciliation--thuật-toán-đồng-bộ)
- [Diffing Algorithm](#diffing-algorithm)
- [React Fiber — Render optimization](#react-fiber--render-optimization)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Virtual DOM là gì?

**Virtual DOM** là **bản sao in-memory của actual DOM** — React tạo cấu trúc object mô tả UI, sau đó **sync** với actual DOM.

```
React State thay đổi
    ↓
React tạo Virtual DOM mới
    ↓
So sánh (diff) Virtual DOM cũ vs mới
    ↓
Chỉ update phần thay đổi lên actual DOM
    ↓
Browser render
```

```javascript
// Virtual DOM representation
const vdom = {
  type: 'div',
  props: { className: 'container' },
  children: [
    {
      type: 'h1',
      props: {},
      children: ['Hello World']
    }
  ]
};

// Tương ứng với:
// <div className="container">
//   <h1>Hello World</h1>
// </div>
```

---

## Tại sao Virtual DOM ra đời?

**Actual DOM manipulation chậm:**
- DOM API (appendChild, setAttribute, etc.) tốn CPU
- Mỗi DOM change → browser relayout/repaint (expensive)
- Thay đổi 100 element = 100 DOM API calls → chậm

**Virtual DOM giải pháp:**
- Thay đổi VDOM trong memory (siêu nhanh)
- Batch updates → 1 DOM update thay vì 100
- Browser chỉ render 1 lần

```javascript
// ❌ Chậm — 100 actual DOM calls
for (let i = 0; i < 100; i++) {
  document.body.appendChild(createElement(i)); // trigger 100 reflows!
}

// ✅ Nhanh — React batch qua VDOM
const items = [];
for (let i = 0; i < 100; i++) {
  items.push(<Item key={i} />);
}
// React tạo VDOM, diff, update DOM 1 lần
```

---

## Reconciliation — Thuật toán đồng bộ

**Reconciliation** là quá trình React **update actual DOM** dựa vào VDOM.

```
Old VDOM:                New VDOM:
<ul>                     <ul>
  <li>A</li>               <li>B</li>
  <li>B</li>               <li>C</li>
  <li>C</li>               <li>A</li>
</ul>                    </ul>

React so sánh → phát hiện items reordered
→ update thứ tự mà không recreate elements
```

---

## Diffing Algorithm

React dùng **heuristic algorithm** (không phải perfect diff):

1. **Khác element type** → reconstruct (từ `<div>` → `<span>` = recreate)
2. **Cùng type, khác props** → update props
3. **Cùng type, children khác** → recursive diff

```javascript
// Case 1: Type khác → recreate
<div /> → <span /> // recreate

// Case 2: Props khác → update
<div className="a" /> → <div className="b" /> // update className

// Case 3: Children khác → diff children
<div>A B C</div> → <div>A B C D</div> // add D
```

### Keys — Critical for diffing

```javascript
// ❌ Sai — không có key
{items.map((item, index) => (
  <div>{item.name}</div> // React không track item → lose state!
))}

// ✅ Đúng — key helps React track
{items.map(item => (
  <div key={item.id}>{item.name}</div> // React knows which div is which
))}
```

---

## React Fiber — Render optimization

**React Fiber** (React 16+) là re-architecture cho reconciliation — cho phép **interruptible renders**.

```
Fiber tree:
  FiberNode: App
    └─ FiberNode: List
        ├─ FiberNode: Item(1)
        ├─ FiberNode: Item(2)
        └─ FiberNode: Item(3)

React xử lý fiber by fiber (interruptible)
→ chia render thành small tasks
→ browser có thể handle user input giữa tasks
```

---

## Lỗi thường gặp

### 1. Không hiểu Virtual DOM != DOM Performance

```javascript
// ❌ Sai — tưởng VDOM giải quyết tất cả performance
function BadList({ items }) {
  return items.map(item => <ComplexComponent key={item.id} />);
  // Mỗi item = complex component → rerender = expensive!
  // VDOM giúp, nhưng vẫn chậm nếu component logic tệ
}

// ✅ Đúng — VDOM + component optimization
function GoodList({ items }) {
  return items.map(item =>
    <memo(ComplexComponent) key={item.id} item={item} />
  );
  // VDOM + React.memo = nhanh
}
```

### 2. Không dùng keys hoặc dùng index làm key

```javascript
// ❌ Sai
{items.map((item, index) => <Item key={index} />)}

// ✅ Đúng
{items.map(item => <Item key={item.id} />)}
```

---

## Câu hỏi phỏng vấn

### Câu 1: Virtual DOM là gì? Tại sao React dùng?

**Đáp án:** Virtual DOM là in-memory representation của actual DOM. React tạo VDOM, diff với VDOM cũ, update chỉ phần thay đổi lên actual DOM. Lợi ích: (1) Batch updates → fewer DOM calls, (2) Developers không cần manage DOM, (3) Performance improvement.

### Câu 2: Reconciliation hoạt động như thế nào?

**Đáp án:** React so sánh (diff) old VDOM vs new VDOM, xác định changes, update actual DOM. Algorithm: (1) Khác element type → recreate, (2) Cùng type, khác props → update props, (3) Children khác → recursive diff. **Keys** critical — help React track elements.

### Câu 3: Virtual DOM có nghĩa là React luôn nhanh không?

**Đáp án:** Không. Virtual DOM giúp, nhưng nếu component logic tệ (render lặp lại, complex calculations) vẫn chậm. Virtual DOM tối ưu hóa DOM updates, không phải component logic. Cần kết hợp với React.memo, useMemo, lazy loading để truly optimize.
