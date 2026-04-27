---
sidebar_position: 12
title: "12. Portals"
---

# Portals


---

## Mục lục

- [Portal là gì?](#portal-là-gì)
- [Tại sao cần Portal?](#tại-sao-cần-portal)
- [Ví dụ: Modal](#ví-dụ-modal)
- [Ví dụ: Tooltip](#ví-dụ-tooltip)
- [Event Bubbling với Portal](#event-bubbling-với-portal)
- [Các use case phổ biến](#các-use-case-phổ-biến)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Portal là gì?

Portal cho phép render children vào một DOM node **nằm ngoài** parent component trong DOM tree. Component vẫn nằm trong React tree (nhận context, events bubble), nhưng DOM node nằm ở nơi khác.

```tsx
import { createPortal } from 'react-dom';

function Modal({ children, isOpen }: { children: ReactNode; isOpen: boolean }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        {children}
      </div>
    </div>,
    document.body // Render vào body, không phải parent component
  );
}
```

## Tại sao cần Portal?

### Vấn đề CSS

Khi một component nằm trong parent có `overflow: hidden` hoặc `z-index` thấp, modal/tooltip/dropdown sẽ bị cắt:

```tsx
// ❌ Modal bị cắt bởi overflow: hidden của parent
<div style={{ overflow: 'hidden' }}>
  <Modal>Content</Modal> {/* Bị cắt! */}
</div>

// ✅ Portal render ra ngoài body → không bị cắt
<div style={{ overflow: 'hidden' }}>
  <Modal>Content</Modal> {/* Portal: render ở document.body */}
</div>
```

## Ví dụ: Modal

```tsx
import { createPortal } from 'react-dom';
import { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Đóng khi nhấn Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Ngăn scroll
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="modal-overlay"
      onClick={(e) => {
        // Đóng khi click overlay (không phải content)
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="modal-content" role="dialog" aria-modal="true">
        <header>
          <h2>{title}</h2>
          <button onClick={onClose} aria-label="Close">&times;</button>
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body
  );
}

// Sử dụng
function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirmation"
      >
        <p>Are you sure?</p>
        <button onClick={() => setIsOpen(false)}>Confirm</button>
      </Modal>
    </div>
  );
}
```

## Ví dụ: Tooltip

```tsx
function Tooltip({
  children,
  text,
}: {
  children: ReactNode;
  text: string;
}) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX + rect.width / 2,
      });
    }
    setShow(true);
  };

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </span>

      {show &&
        createPortal(
          <div
            className="tooltip"
            style={{ position: 'absolute', top: position.top, left: position.left }}
          >
            {text}
          </div>,
          document.body
        )}
    </>
  );
}
```

## Event Bubbling với Portal

Portal vẫn nằm trong **React tree** → events bubble theo React tree, KHÔNG phải DOM tree:

```tsx
function Parent() {
  // Event từ Modal VẪN bubble lên Parent trong React tree
  // dù Modal render ở document.body trong DOM
  return (
    <div onClick={() => console.log('Parent clicked!')}>
      <Modal isOpen={true} onClose={() => {}}>
        <button>Click me</button>
        {/* Click → "Parent clicked!" vẫn log */}
      </Modal>
    </div>
  );
}
```

## Các use case phổ biến

- **Modal/Dialog** — tránh overflow, z-index issues
- **Tooltip/Popover** — position chính xác relative to viewport
- **Dropdown menu** — tránh bị cắt bởi parent container
- **Toast/Notification** — hiển thị ở góc màn hình
- **Fullscreen overlay** — loading screen, image viewer

---

## Câu hỏi phỏng vấn

### Câu 1: Portal là gì và khi nào nên dùng?
**Đáp án:**
Portal cho phép render children vào một DOM node **nằm ngoài** parent component trong DOM tree, trong khi vẫn giữ nguyên vị trí trong React component tree.

```tsx
import { createPortal } from 'react-dom';

function Modal({ children, isOpen }: { children: ReactNode; isOpen: boolean }) {
  if (!isOpen) return null;

  // Render vào document.body thay vì parent DOM node
  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">{children}</div>
    </div>,
    document.body
  );
}
```

**Khi nào dùng:** Khi component nằm trong parent có `overflow: hidden`, `z-index` thấp, hoặc `transform` khiến modal/tooltip/dropdown bị cắt hoặc hiển thị sai vị trí. Portal render DOM node ra ngoài parent nên không bị ảnh hưởng bởi CSS của parent.

### Câu 2: Event bubbling hoạt động thế nào với Portal?
**Đáp án:**
Mặc dù Portal render DOM node ở nơi khác (ví dụ `document.body`), events vẫn **bubble theo React component tree**, không phải DOM tree. Đây là điểm khác biệt quan trọng.

```tsx
function Parent() {
  return (
    // onClick ở đây VẪN bắt được event từ Modal
    <div onClick={() => console.log('Parent clicked!')}>
      <Modal isOpen={true} onClose={() => {}}>
        <button onClick={() => console.log('Button clicked!')}>
          Click me
        </button>
      </Modal>
    </div>
  );
}

// Click button:
// 1. "Button clicked!" (từ button)
// 2. "Parent clicked!" (event bubble lên Parent trong React tree)
// Dù Modal DOM node nằm ở document.body, KHÔNG phải con của div trong DOM
```

Điều này có nghĩa: Context, event handlers, và tất cả React features hoạt động bình thường với Portal vì React tree không thay đổi.

### Câu 3: Kể các use cases phổ biến của Portal và giải thích tại sao cần dùng Portal cho mỗi trường hợp.
**Đáp án:**

1. **Modal/Dialog** — Parent có thể có `overflow: hidden` hoặc `z-index` thấp. Portal render modal ở `document.body` nên modal luôn hiển thị trên cùng.

2. **Tooltip/Popover** — Cần position chính xác relative to viewport. Nếu nằm trong parent có `transform` hoặc `position: relative`, tooltip sẽ bị lệch vị trí.

3. **Toast/Notification** — Cần hiển thị ở góc cố định trên màn hình, không phụ thuộc vào component nào trigger nó.

```tsx
// Toast system dùng Portal
function ToastContainer() {
  const { toasts } = useToast();

  return createPortal(
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div key={toast.id} className="rounded bg-gray-800 px-4 py-2 text-white">
          {toast.message}
        </div>
      ))}
    </div>,
    document.body
  );
}
```

4. **Dropdown menu** — Parent container có `overflow: hidden` sẽ cắt dropdown. Portal cho phép dropdown hiển thị đầy đủ bên ngoài container.

5. **Fullscreen overlay** — Loading screen, image lightbox cần phủ toàn màn hình, không bị giới hạn bởi parent layout.
