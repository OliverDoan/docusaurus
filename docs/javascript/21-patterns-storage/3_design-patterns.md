---
sidebar_position: 3
title: "3. Design Patterns"
---

# Design Patterns


---

## Mục lục

- [Design Pattern là gì?](#design-pattern-là-gì)
- [Module Pattern](#module-pattern)
- [Singleton Pattern](#singleton-pattern)
- [Factory Pattern](#factory-pattern)
- [Observer Pattern](#observer-pattern)
- [Decorator Pattern](#decorator-pattern)
- [Ứng dụng trong JavaScript/React](#ứng-dụng-trong-javascriptreact)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Design Pattern là gì?

**Design Pattern** (mẫu thiết kế) là các **giải pháp đã được chứng minh** cho những vấn đề phổ biến trong lập trình. Chúng không phải code cụ thể, mà là **bản thiết kế** có thể áp dụng vào nhiều tình huống.

> **Ví dụ thực tế:** Design pattern giống như **công thức nấu ăn** — bạn không phát minh lại cách nấu phở mỗi lần muốn ăn. Bạn dùng công thức đã được nhiều đầu bếp kiểm chứng, rồi tùy chỉnh theo khẩu vị.

### 3 nhóm Design Pattern

| Nhóm | Mục đích | Patterns phổ biến |
|:---:|:---|:---|
| **Creational** | Cách tạo object | Singleton, Factory, Builder |
| **Structural** | Cách tổ chức object | Module, Decorator, Facade |
| **Behavioral** | Cách object giao tiếp | Observer, Mediator, Strategy |

---

## Module Pattern

**Module Pattern** đóng gói code vào một đơn vị **độc lập**, giấu chi tiết bên trong và chỉ expose những gì cần thiết.

### IIFE Module (Cách cổ điển)

```javascript
// IIFE — Immediately Invoked Function Expression
const Calculator = (function() {
  // Private — không thể truy cập từ bên ngoài
  let lichSu = [];

  function luuKetQua(phepTinh, ketQua) {
    lichSu.push({ phepTinh, ketQua });
  }

  // Public — API được expose ra ngoài
  return {
    cong: function(a, b) {
      const ketQua = a + b;
      luuKetQua(`${a} + ${b}`, ketQua);
      return ketQua;
    },

    tru: function(a, b) {
      const ketQua = a - b;
      luuKetQua(`${a} - ${b}`, ketQua);
      return ketQua;
    },

    xemLichSu: function() {
      return [...lichSu]; // Trả về bản copy, không phải reference
    }
  };
})();

console.log(Calculator.cong(5, 3));    // 8
console.log(Calculator.tru(10, 4));    // 6
console.log(Calculator.xemLichSu());   // [{...}, {...}]
// Calculator.lichSu;                  // undefined — private!
```

### ES Module (Cách hiện đại)

```javascript
// math.js — module file
let lichSu = []; // Private (không export)

function luuKetQua(phepTinh, ketQua) {
  lichSu.push({ phepTinh, ketQua });
}

// Chỉ export những gì cần thiết
export function cong(a, b) {
  const ketQua = a + b;
  luuKetQua(`${a} + ${b}`, ketQua);
  return ketQua;
}

export function xemLichSu() {
  return [...lichSu];
}

// app.js — sử dụng module
import { cong, xemLichSu } from "./math.js";

cong(5, 3);
console.log(xemLichSu()); // [{ phepTinh: "5 + 3", ketQua: 8 }]
```

---

## Singleton Pattern

**Singleton** đảm bảo một class chỉ có **DUY NHẤT một instance** trong toàn bộ ứng dụng.

> **Ví dụ thực tế:** Database connection pool — cả app chỉ cần **một** pool duy nhất, tạo nhiều pool sẽ lãng phí tài nguyên.

### Cách 1: Class Singleton

```javascript
class Database {
  constructor(connectionString) {
    if (Database.instance) {
      return Database.instance; // Trả về instance đã tồn tại
    }

    this.connectionString = connectionString;
    this.connected = false;
    Database.instance = this; // Lưu instance
  }

  connect() {
    this.connected = true;
    console.log(`Đã kết nối: ${this.connectionString}`);
  }

  query(sql) {
    if (!this.connected) throw new Error("Chưa kết nối!");
    console.log(`Thực thi: ${sql}`);
  }
}

const db1 = new Database("mongodb://localhost:27017");
const db2 = new Database("postgresql://localhost:5432"); // Bị bỏ qua!

console.log(db1 === db2); // true — CÙNG MỘT instance
console.log(db2.connectionString); // "mongodb://localhost:27017" — vẫn là db1
```

### Cách 2: Module Singleton (Phổ biến nhất)

```javascript
// config.js — Trong ES Module, mỗi file chỉ chạy 1 lần
class AppConfig {
  constructor() {
    this.settings = {
      apiUrl: "https://api.example.com",
      timeout: 5000,
      theme: "light"
    };
  }

  get(key) {
    return this.settings[key];
  }

  set(key, value) {
    this.settings[key] = value;
  }
}

// Export instance duy nhất — module tự động singleton!
export const config = new AppConfig();

// app.js
import { config } from "./config.js";
config.set("theme", "dark");

// header.js — import cùng file → cùng instance
import { config } from "./config.js";
console.log(config.get("theme")); // "dark" — đã bị thay đổi bởi app.js
```

### Cách 3: Closure Singleton

```javascript
const Logger = (function() {
  let instance;

  function createInstance() {
    const logs = [];

    return {
      log(message) {
        const entry = { time: new Date(), message };
        logs.push(entry);
        console.log(`[LOG] ${message}`);
      },
      getLogs() {
        return [...logs];
      }
    };
  }

  return {
    getInstance() {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    }
  };
})();

const logger1 = Logger.getInstance();
const logger2 = Logger.getInstance();

logger1.log("Hello");
console.log(logger1 === logger2); // true
console.log(logger2.getLogs().length); // 1 — chia sẻ cùng data
```

---

## Factory Pattern

**Factory** tạo object mà **không cần biết class cụ thể** — quyết định loại object dựa trên input.

> **Ví dụ thực tế:** Nhà máy sản xuất ô tô — bạn nói "tôi muốn xe SUV", nhà máy tự biết phải dùng quy trình nào, bạn không cần quan tâm chi tiết.

```javascript
// Các loại thông báo
class EmailNotification {
  constructor(to, message) {
    this.to = to;
    this.message = message;
    this.type = "email";
  }

  send() {
    console.log(`📧 Gửi email đến ${this.to}: ${this.message}`);
  }
}

class SMSNotification {
  constructor(to, message) {
    this.to = to;
    this.message = message;
    this.type = "sms";
  }

  send() {
    console.log(`📱 Gửi SMS đến ${this.to}: ${this.message}`);
  }
}

class PushNotification {
  constructor(to, message) {
    this.to = to;
    this.message = message;
    this.type = "push";
  }

  send() {
    console.log(`🔔 Gửi push đến ${this.to}: ${this.message}`);
  }
}

// Factory — tạo đúng loại dựa trên input
class NotificationFactory {
  static create(type, to, message) {
    switch (type) {
      case "email": return new EmailNotification(to, message);
      case "sms":   return new SMSNotification(to, message);
      case "push":  return new PushNotification(to, message);
      default:
        throw new Error(`Loại thông báo "${type}" không hợp lệ`);
    }
  }
}

// Sử dụng — không cần biết class cụ thể
const thongBao1 = NotificationFactory.create("email", "minh@gmail.com", "Xin chào!");
const thongBao2 = NotificationFactory.create("sms", "0912345678", "Mã OTP: 1234");
const thongBao3 = NotificationFactory.create("push", "user123", "Bạn có tin nhắn mới");

thongBao1.send(); // 📧 Gửi email đến minh@gmail.com: Xin chào!
thongBao2.send(); // 📱 Gửi SMS đến 0912345678: Mã OTP: 1234
thongBao3.send(); // 🔔 Gửi push đến user123: Bạn có tin nhắn mới
```

### Factory với Function (Đơn giản hơn)

```javascript
function createUser(role) {
  const baseUser = {
    createdAt: new Date(),
    isActive: true
  };

  const permissions = {
    admin: { canEdit: true, canDelete: true, canManageUsers: true },
    editor: { canEdit: true, canDelete: false, canManageUsers: false },
    viewer: { canEdit: false, canDelete: false, canManageUsers: false }
  };

  if (!permissions[role]) {
    throw new Error(`Role "${role}" không tồn tại`);
  }

  return { ...baseUser, role, ...permissions[role] };
}

const admin = createUser("admin");
const viewer = createUser("viewer");
console.log(admin.canDelete);  // true
console.log(viewer.canDelete); // false
```

---

## Observer Pattern

**Observer** (hay Pub/Sub) cho phép một object **thông báo** cho nhiều object khác khi có sự thay đổi, mà không cần biết cụ thể ai đang lắng nghe.

> **Ví dụ thực tế:** YouTube subscription — khi YouTuber đăng video mới, tất cả subscribers đều được **thông báo tự động**, YouTuber không cần nhắn tin riêng cho từng người.

```javascript
class EventEmitter {
  constructor() {
    this.listeners = {}; // { eventName: [callback1, callback2, ...] }
  }

  // Đăng ký lắng nghe
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return this; // Cho phép chaining
  }

  // Hủy đăng ký
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
    return this;
  }

  // Phát sự kiện — thông báo cho tất cả listeners
  emit(event, ...args) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(...args));
    }
    return this;
  }

  // Lắng nghe chỉ 1 lần
  once(event, callback) {
    const wrapper = (...args) => {
      callback(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
    return this;
  }
}

// === Sử dụng ===
const emitter = new EventEmitter();

// Subscriber 1
emitter.on("newVideo", (title) => {
  console.log(`📧 Email: Video mới "${title}" đã lên!`);
});

// Subscriber 2
emitter.on("newVideo", (title) => {
  console.log(`🔔 Push: Xem ngay "${title}"!`);
});

// Publisher — phát sự kiện
emitter.emit("newVideo", "JavaScript Design Patterns");
// 📧 Email: Video mới "JavaScript Design Patterns" đã lên!
// 🔔 Push: Xem ngay "JavaScript Design Patterns"!
```

### Ứng dụng: Shopping Cart

```javascript
const cart = new EventEmitter();

// UI listener — cập nhật giao diện
cart.on("itemAdded", (item) => {
  console.log(`🛒 UI: Đã thêm ${item.name} vào giỏ`);
});

// Analytics listener — theo dõi hành vi
cart.on("itemAdded", (item) => {
  console.log(`📊 Analytics: track add_to_cart(${item.id})`);
});

// Inventory listener — kiểm tra tồn kho
cart.on("itemAdded", (item) => {
  console.log(`📦 Inventory: Còn ${item.stock - 1} sản phẩm`);
});

// Thêm sản phẩm → tất cả listeners được thông báo
cart.emit("itemAdded", { id: 1, name: "iPhone 16", stock: 10 });
```

---

## Decorator Pattern

**Decorator** thêm **hành vi mới** vào một object mà **không thay đổi object gốc**. Nó "bao quanh" (wrap) object gốc và mở rộng tính năng.

> **Ví dụ thực tế:** Trang trí nhà — bạn có một căn nhà (object gốc), bạn có thể dán hình dán tường, treo tranh, đặt đèn (decorators) mà không phá hủy nhà. Mỗi trang trí thêm một tính năng mới nhưng nhà vẫn là nhà.

### Cách 1: Function Wrapper

```javascript
// Object gốc
function makeEspresso() {
  return { name: "Espresso", gia: 20000 };
}

// Decorators — thêm tính năng
function themSua(caphe) {
  return {
    ...caphe,
    name: caphe.name + " + Sữa",
    gia: caphe.gia + 5000
  };
}

function themCaramel(caphe) {
  return {
    ...caphe,
    name: caphe.name + " + Caramel",
    gia: caphe.gia + 3000
  };
}

function themChocolate(caphe) {
  return {
    ...caphe,
    name: caphe.name + " + Chocolate",
    gia: caphe.gia + 4000
  };
}

// Áp dụng decorators — có thể kết hợp linh hoạt
let caphe = makeEspresso();
console.log(caphe); // { name: "Espresso", gia: 20000 }

caphe = themSua(caphe);
console.log(caphe); // { name: "Espresso + Sữa", gia: 25000 }

caphe = themCaramel(caphe);
console.log(caphe); // { name: "Espresso + Sữa + Caramel", gia: 28000 }

caphe = themChocolate(caphe);
console.log(caphe); // { name: "Espresso + Sữa + Caramel + Chocolate", gia: 32000 }
```

### Cách 2: Class Decorator (Higher-Order Function)

```javascript
// Class gốc
class User {
  constructor(name) {
    this.name = name;
  }

  info() {
    return `Người dùng: ${this.name}`;
  }
}

// Decorator — thêm logging
function withLogging(UserClass) {
  return class extends UserClass {
    info() {
      console.log(`[LOG] Lấy thông tin user...`);
      return super.info();
    }
  };
}

// Decorator — thêm caching
function withCaching(UserClass) {
  return class extends UserClass {
    constructor(...args) {
      super(...args);
      this.cache = {};
    }

    info() {
      if (this.cache.info) {
        console.log(`[CACHE] Trả về từ cache`);
        return this.cache.info;
      }
      const result = super.info();
      this.cache.info = result;
      return result;
    }
  };
}

// Áp dụng decorators — thứ tự quan trọng!
const DecoratedUser = withLogging(withCaching(User));
const user = new DecoratedUser("Minh");

console.log(user.info()); // [LOG] Lấy thông tin user... → Người dùng: Minh
console.log(user.info()); // [CACHE] Trả về từ cache → Người dùng: Minh
```

### Cách 3: Logging Decorator (use case thực tế)

```javascript
// Tạo decorator ghi log
function logExecutionTime(fn, methodName) {
  return function(...args) {
    const start = Date.now();
    const result = fn.apply(this, args);
    const duration = Date.now() - start;
    console.log(`[${methodName}] Thực thi mất ${duration}ms`);
    return result;
  };
}

class Calculator {
  constructor() {
    this.add = logExecutionTime(this.add, "add");
    this.fibonacci = logExecutionTime(this.fibonacci, "fibonacci");
  }

  add(a, b) {
    return a + b;
  }

  fibonacci(n) {
    if (n <= 1) return n;
    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }
}

const calc = new Calculator();
console.log(calc.add(5, 3));       // [add] Thực thi mất 0ms → 8
console.log(calc.fibonacci(10));   // [fibonacci] Thực thi mất 5ms → 55
```

### Cách 4: Permission/Validation Decorator

```javascript
// Decorator — kiểm tra quyền
function requireAdmin(target, propertyKey, descriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function(userId, ...args) {
    if (!this.isAdmin(userId)) {
      throw new Error("❌ Không có quyền!");
    }
    console.log("✅ Kiểm tra quyền thành công");
    return originalMethod.apply(this, [userId, ...args]);
  };

  return descriptor;
}

class Database {
  constructor() {
    this.admins = [1, 2]; // User 1 và 2 là admin
  }

  isAdmin(userId) {
    return this.admins.includes(userId);
  }

  deleteUser(userId, targetId) {
    console.log(`Đang xóa user ${targetId}...`);
    return { success: true };
  }

  deleteAdmin(userId, adminId) {
    // Có thể thêm @requireAdmin decorator ở đây
    if (!this.isAdmin(userId)) {
      throw new Error("❌ Không có quyền xóa admin!");
    }
    console.log(`Đang xóa admin ${adminId}...`);
    return { success: true };
  }
}

const db = new Database();

// User 1 là admin → được phép
db.deleteAdmin(1, 3); // ✅ Đang xóa admin 3...

// User 5 không là admin → bị từ chối
try {
  db.deleteAdmin(5, 2); // ❌ Không có quyền xóa admin!
} catch (error) {
  console.error(error.message);
}
```

### So sánh Decorator vs Inheritance

```javascript
// ❌ Inheritance — phải tạo class mới cho mỗi tổ hợp
class BasicUser {}
class LoggingUser extends BasicUser {}
class CachingLoggingUser extends LoggingUser {}
class CachingLoggingValidatingUser extends CachingLoggingUser {}
// ... lâu dài, rigid

// ✅ Decorator — linh hoạt, tổ hợp được
const user = withValidation(withCaching(withLogging(BasicUser)));
// Có thể thay đổi thứ tự, thêm/bớt bất cứ lúc nào
```

---

## Ứng dụng trong JavaScript/React

### Observer trong DOM Events

```javascript
// DOM Events chính là Observer Pattern!
const button = document.querySelector("#btn");

// addEventListener = subscribe (on)
button.addEventListener("click", () => console.log("Click 1!"));
button.addEventListener("click", () => console.log("Click 2!"));

// dispatchEvent = publish (emit)
button.dispatchEvent(new Event("click"));
// removeEventListener = unsubscribe (off)
```

### Singleton trong React — Context / Store

```javascript
// React Context = Singleton pattern
// Một Provider duy nhất, nhiều Consumer

import { createContext, useContext, useState } from "react";

const ThemeContext = createContext(); // "Singleton" theme

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Bất kỳ component nào cũng truy cập CÙNG MỘT theme
function Header() {
  const { theme } = useContext(ThemeContext);
  return <h1 className={theme}>Header</h1>;
}
```

### Factory trong React — Render Props / HOC

```javascript
// Factory pattern — tạo component khác nhau dựa trên type
function createField(type, props) {
  switch (type) {
    case "text":
      return <input type="text" {...props} />;
    case "select":
      return (
        <select {...props}>
          {props.options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    case "textarea":
      return <textarea {...props} />;
    default:
      return <input type="text" {...props} />;
  }
}

// Sử dụng
function Form({ fields }) {
  return (
    <form>
      {fields.map(field => (
        <div key={field.name}>
          <label>{field.label}</label>
          {createField(field.type, field.props)}
        </div>
      ))}
    </form>
  );
}
```

### Observer trong React — Custom Hook

```javascript
// Observer pattern qua custom hook
function useEventBus() {
  const listeners = useRef({});

  const on = useCallback((event, callback) => {
    if (!listeners.current[event]) {
      listeners.current[event] = [];
    }
    listeners.current[event].push(callback);

    return () => {
      listeners.current[event] = listeners.current[event].filter(
        cb => cb !== callback
      );
    };
  }, []);

  const emit = useCallback((event, data) => {
    listeners.current[event]?.forEach(cb => cb(data));
  }, []);

  return { on, emit };
}
```

### Decorator trong React — HOC (Higher-Order Component)

```javascript
// HOC = Decorator pattern trong React
// Thêm tính năng vào component mà không thay đổi component gốc

// Component gốc
function UserCard({ user }) {
  return (
    <div className="card">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}

// Decorator HOC — thêm loading + error handling
function withDataFetching(WrappedComponent) {
  return function DataFetchingComponent({ userId, ...props }) {
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
      fetch(`/api/users/${userId}`)
        .then(res => res.json())
        .then(data => {
          setData(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }, [userId]);

    if (loading) return <p>Đang tải...</p>;
    if (error) return <p>Lỗi: {error}</p>;

    return <WrappedComponent user={data} {...props} />;
  };
}

// Decorator HOC — thêm theme
function withTheme(WrappedComponent) {
  return function ThemedComponent(props) {
    const { theme } = useContext(ThemeContext);
    return (
      <div className={`theme-${theme}`}>
        <WrappedComponent {...props} theme={theme} />
      </div>
    );
  };
}

// Áp dụng nhiều decorators — tạo nên component cuối cùng
const EnhancedUserCard = withTheme(withDataFetching(UserCard));

// Sử dụng
function App() {
  return <EnhancedUserCard userId={1} />;
}
```

### Decorator trong React — Custom Hook Wrapper

```javascript
// Custom hook = Decorator pattern
function useLogger(hookName) {
  React.useEffect(() => {
    console.log(`[${hookName}] Component mounted`);
    return () => console.log(`[${hookName}] Component unmounted`);
  }, [hookName]);
}

function useAsync(fn, deps) {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    fn().then(result => {
      if (isMounted) {
        setData(result);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, deps);

  return { data, loading };
}

// Decorator — kết hợp hooks
function useAsyncWithLogging(fn, deps, name) {
  useLogger(name); // Ghi log mount/unmount
  return useAsync(fn, deps); // Xử lý async
}

function MyComponent() {
  const { data, loading } = useAsyncWithLogging(
    () => fetch("/api/data").then(r => r.json()),
    [],
    "MyComponent"
  );

  return loading ? <p>Loading...</p> : <p>{data}</p>;
}
```

---

## Lỗi thường gặp

### 1. Singleton bị tạo nhiều instance khi test

```javascript
// ❌ Singleton khó test — state chia sẻ giữa các test
class DB {
  static instance;
  constructor() {
    if (DB.instance) return DB.instance;
    this.data = [];
    DB.instance = this;
  }
}

// Test 1 thêm dữ liệu → Test 2 bị ảnh hưởng!
// ✅ Giải pháp: thêm method reset() cho testing
class DB {
  static instance;
  constructor() {
    if (DB.instance) return DB.instance;
    this.data = [];
    DB.instance = this;
  }
  static resetForTesting() {
    DB.instance = null;
  }
}
```

### 2. Observer: Memory Leak do quên unsubscribe

```javascript
// ❌ Sai — listener không bao giờ được gỡ bỏ
function initFeature() {
  emitter.on("update", handleUpdate);
  // Nếu initFeature gọi nhiều lần → nhiều listener trùng lặp!
}

// ✅ Đúng — lưu và gỡ listener khi không cần
function initFeature() {
  const unsubscribe = emitter.on("update", handleUpdate);
  return unsubscribe; // Gọi khi cleanup
}

// Trong React:
useEffect(() => {
  const unsub = emitter.on("update", handleUpdate);
  return () => unsub(); // Cleanup khi unmount
}, []);
```

### 3. Factory phình to khi có nhiều loại

```javascript
// ❌ Switch case dài khi có 20+ loại
function createWidget(type) {
  switch (type) {
    case "chart": // ...
    case "table": // ...
    case "form": // ...
    // ... 20 case nữa
  }
}

// ✅ Dùng registry object
const widgetRegistry = {
  chart: ChartWidget,
  table: TableWidget,
  form: FormWidget
};

function createWidget(type, props) {
  const Widget = widgetRegistry[type];
  if (!Widget) throw new Error(`Unknown widget: ${type}`);
  return new Widget(props);
}

// Dễ dàng thêm loại mới
widgetRegistry.calendar = CalendarWidget;
```

---

## Câu hỏi phỏng vấn

### Câu 1: Design Pattern là gì? Tại sao cần học?

**Đáp án:** Design Pattern là giải pháp tái sử dụng cho các vấn đề thiết kế phổ biến. Lợi ích: (1) Không phải "phát minh lại bánh xe", (2) Code dễ đọc vì team dùng ngôn ngữ chung, (3) Dễ bảo trì và mở rộng, (4) Giảm coupling giữa các thành phần. Tuy nhiên, không nên lạm dụng — chỉ áp dụng khi pattern giải quyết vấn đề thực sự.

### Câu 2: Giải thích Observer Pattern và cho ví dụ trong JavaScript

**Đáp án:** Observer cho phép object (Subject) thông báo tự động cho danh sách các object phụ thuộc (Observers) khi có thay đổi. Trong JavaScript: DOM events (`addEventListener`/`removeEventListener`), Node.js EventEmitter, React Context/Redux (khi state thay đổi → re-render subscribers), RxJS Observables. Ưu điểm: loose coupling — Subject không cần biết chi tiết về Observers.

### Câu 3: Module Pattern giải quyết vấn đề gì?

**Đáp án:** Module Pattern giải quyết 3 vấn đề: (1) **Encapsulation** — ẩn chi tiết implementation, chỉ expose public API, (2) **Namespace pollution** — tránh biến global xung đột (đặc biệt quan trọng trước ES6 modules), (3) **Dependency management** — rõ ràng module nào phụ thuộc module nào. ES6 `import/export` là implementation hiện đại của Module Pattern.

### Câu 4: Singleton có nhược điểm gì?

**Đáp án:** (1) **Khó test** — global state chia sẻ giữa tests gây side effects, (2) **Hidden dependencies** — code phụ thuộc singleton mà không hiển thị qua parameters, (3) **Tight coupling** — thay đổi singleton ảnh hưởng toàn bộ app, (4) **Khó mở rộng** — vi phạm Open/Closed Principle. Thay thế: Dependency Injection — truyền dependency qua constructor thay vì truy cập global.

### Câu 5: Implement một EventEmitter đơn giản

**Đáp án:**

```javascript
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, fn) {
    (this.events[event] ||= []).push(fn);
    return () => this.off(event, fn);
  }

  off(event, fn) {
    this.events[event] = this.events[event]?.filter(cb => cb !== fn);
  }

  emit(event, ...args) {
    this.events[event]?.forEach(fn => fn(...args));
  }

  once(event, fn) {
    const wrapper = (...args) => { fn(...args); this.off(event, wrapper); };
    this.on(event, wrapper);
  }
}
```

Cần có: `on` (subscribe), `off` (unsubscribe), `emit` (publish), và `once` (subscribe 1 lần).
