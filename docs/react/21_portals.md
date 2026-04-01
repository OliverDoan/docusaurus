---
sidebar_position: 21
title: "Portals"
---

# Portals

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
