---
sidebar_position: 5
title: "TS Patterns: Branded Types, Discriminated Unions, infer"
---

# TS Patterns: Branded Types, Discriminated Unions, infer

Bài này tổng hợp những advanced patterns mà các TypeScript developer có kinh nghiệm sử dụng trong production. Đây là nhóm câu hỏi "độ chiều sâu" -- interviewer muốn biết bạn không chỉ hiểu lý thuyết mà còn áp dụng được vào code thật.

---

## Câu 1: Branded types (nominal types) là gì và tại sao cần dùng? `[Senior]`

### Giải thích lý thuyết

TypeScript dùng **structural typing** -- hai types được coi là tương thích nếu chúng có cùng cấu trúc, bất kể tên gọi. Điều này đôi khi gây ra vấn đề khi bạn muốn phân biệt giữa các type có cùng cấu trúc nhưng ý nghĩa khác nhau.

**Branded types** (hay nominal types) là pattern thêm một **phantom property** (property chỉ tồn tại ở type level, không có tại runtime) để tạo ra sự khác biệt giữa các type có cùng underlying type.

### Code ví dụ

```typescript
// === VẤN ĐỀ: STRUCTURAL TYPING ===
type UserId = string;
type OrderId = string;

function getUser(id: UserId): User {
  return db.findUser(id);
}

const orderId: OrderId = "order_123";
getUser(orderId); // KHÔNG LỖI! Vì cả hai đều là string
// Nhưng đây là BUG -- truyền OrderId vào cho cần UserId

// === GIẢI PHÁP: BRANDED TYPES ===
type Brand<T, B extends string> = T & { readonly __brand: B };

type BrandedUserId = Brand<string, "UserId">;
type BrandedOrderId = Brand<string, "OrderId">;

// Factory functions
function createUserId(id: string): BrandedUserId {
  // Có thể validate trước khi tạo
  if (!id.startsWith("user_")) {
    throw new Error("UserId must start with user_");
  }
  return id as BrandedUserId;
}

function createOrderId(id: string): BrandedOrderId {
  if (!id.startsWith("order_")) {
    throw new Error("OrderId must start with order_");
  }
  return id as BrandedOrderId;
}

function getUserBranded(id: BrandedUserId): User {
  return db.findUser(id); // id vẫn là string tại runtime
}

const userId = createUserId("user_456");
const orderId2 = createOrderId("order_789");

getUserBranded(userId);    // OK
// getUserBranded(orderId2); // Error! Type 'BrandedOrderId' is not assignable to 'BrandedUserId'

// === THỰC TẾ: TYPE-SAFE UNITS ===
type Meters = Brand<number, "Meters">;
type Kilometers = Brand<number, "Kilometers">;
type Seconds = Brand<number, "Seconds">;

function metersToKm(m: Meters): Kilometers {
  return (m / 1000) as Kilometers;
}

function calculateSpeed(distance: Kilometers, time: Seconds): number {
  return (distance as number) / (time as number);
}

const distance = 5000 as Meters;
const km = metersToKm(distance); // OK
// metersToKm(42 as Kilometers); // Error! Không thể truyền Km vào cho Meters

// === THỰC TẾ: VALIDATED TYPES ===
type Email = Brand<string, "Email">;
type PhoneNumber = Brand<string, "PhoneNumber">;

function validateEmail(input: string): Email {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(input)) {
    throw new Error(`Invalid email: ${input}`);
  }
  return input as Email;
}

function validatePhone(input: string): PhoneNumber {
  const phoneRegex = /^\+?\d{10,15}$/;
  if (!phoneRegex.test(input)) {
    throw new Error(`Invalid phone: ${input}`);
  }
  return input as PhoneNumber;
}

function sendEmail(to: Email, subject: string): void {
  // TypeScript đảm bảo `to` đã được validate
  // Không thể truyền raw string vào đây
}

const email = validateEmail("thuan@dev.com");
sendEmail(email, "Hello"); // OK
// sendEmail("raw@string.com", "Hello"); // Error! string không phải Email
```

### Đáp án mẫu

> "Branded types giải quyết vấn đề của structural typing -- khi hai type có cùng cấu trúc nhưng ý nghĩa khác nhau. Bằng cách thêm phantom property __brand, ta tạo ra sự phân biệt ở type level mà không ảnh hưởng runtime. Pattern này cực kỳ hữu ích cho IDs (UserId vs OrderId), units (Meters vs Kilometers), và validated values (Email, PhoneNumber). Giá trị vẫn là string/number tại runtime, nhưng TypeScript ngăn không cho truyền nhầm type."

---

## Câu 2: Builder pattern với TypeScript `[Senior]`

### Giải thích lý thuyết

**Builder pattern** cho phép xây dựng object phức tạp từng bước một. Trong TypeScript, ta có thể dùng **generics và method chaining** để đảm bảo type safety -- compiler sẽ biết những field nào đã được set và không cho build() nếu thiếu field bắt buộc.

### Code ví dụ

```typescript
// === BASIC BUILDER ===
interface RequestConfig {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers: Record<string, string>;
  body?: unknown;
  timeout: number;
}

class RequestBuilder {
  private config: Partial<RequestConfig> = {};

  setUrl(url: string): this {
    this.config.url = url;
    return this;
  }

  setMethod(method: RequestConfig["method"]): this {
    this.config.method = method;
    return this;
  }

  setHeader(key: string, value: string): this {
    this.config.headers = {
      ...this.config.headers,
      [key]: value,
    };
    return this;
  }

  setBody(body: unknown): this {
    this.config.body = body;
    return this;
  }

  setTimeout(ms: number): this {
    this.config.timeout = ms;
    return this;
  }

  build(): RequestConfig {
    if (!this.config.url) throw new Error("URL is required");
    if (!this.config.method) throw new Error("Method is required");
    return {
      url: this.config.url,
      method: this.config.method,
      headers: this.config.headers ?? {},
      body: this.config.body,
      timeout: this.config.timeout ?? 30000,
    };
  }
}

const request = new RequestBuilder()
  .setUrl("https://api.example.com/users")
  .setMethod("POST")
  .setHeader("Content-Type", "application/json")
  .setBody({ name: "Thuan" })
  .build();

// === TYPE-SAFE BUILDER (COMPILE-TIME CHECK) ===

// Track những field đã được set qua generic
type BuilderState = {
  hasUrl: boolean;
  hasMethod: boolean;
};

class TypeSafeBuilder<State extends BuilderState = { hasUrl: false; hasMethod: false }> {
  private config: Partial<RequestConfig> = {};

  setUrl(url: string): TypeSafeBuilder<State & { hasUrl: true }> {
    this.config.url = url;
    return this as any;
  }

  setMethod(
    method: RequestConfig["method"]
  ): TypeSafeBuilder<State & { hasMethod: true }> {
    this.config.method = method;
    return this as any;
  }

  // build() chỉ available khi cả url và method đã được set
  build(
    this: TypeSafeBuilder<{ hasUrl: true; hasMethod: true }>
  ): RequestConfig {
    return this.config as RequestConfig;
  }
}

const valid = new TypeSafeBuilder()
  .setUrl("https://api.com")
  .setMethod("GET")
  .build(); // OK -- cả hai đã được set

// const invalid = new TypeSafeBuilder()
//   .setUrl("https://api.com")
//   .build(); // Error! hasMethod là false

// === FLUENT INTERFACE VỚI GENERICS ===
type QueryBuilder<T> = {
  select<K extends keyof T>(...keys: K[]): QueryBuilder<Pick<T, K>>;
  where(condition: Partial<T>): QueryBuilder<T>;
  orderBy(key: keyof T, direction?: "asc" | "desc"): QueryBuilder<T>;
  execute(): Promise<T[]>;
};

// Usage (minh họa type flow)
declare function from<T>(table: string): QueryBuilder<T>;

// const users = await from<User>("users")
//   .select("name", "email")       // QueryBuilder<Pick<User, "name" | "email">>
//   .where({ name: "Thuan" })       // OK -- name exists
//   .orderBy("email")               // OK -- email exists
//   // .orderBy("age")              // Error! "age" đã bị loại bỏ bởi select
//   .execute();                     // Promise<Pick<User, "name" | "email">[]>
```

### Đáp án mẫu

> "Builder pattern trong TypeScript có thể được implement với hai mức độ type safety. Basic builder dùng method chaining với Partial và validate tại runtime trong build(). Advanced builder dùng generics để track state -- mỗi method setter trả về builder với updated type, và build() chỉ available khi tất cả required fields đã được set. Pattern này cho phép bắt lỗi thiếu field tại compile time thay vì runtime."

---

## Câu 3: Discriminated unions trong state management `[Intermediate]`

### Giải thích lý thuyết

Discriminated unions không chỉ là pattern TypeScript -- đó là cách tốt nhất để model trạng thái ứng dụng. Thay vì dùng nhiều boolean flags (`isLoading`, `isError`, `hasData`), bạn model mỗi trạng thái như một variant riêng biệt với đúng data cho trạng thái đó.

### Code ví dụ

```typescript
// === SAI: BOOLEAN FLAGS ===
interface BadState {
  isLoading: boolean;
  isError: boolean;
  data: User[] | null;
  error: string | null;
}

// Vấn đề: có trạng thái không hợp lệ
const impossible: BadState = {
  isLoading: true,
  isError: true,     // Vừa loading vừa error?!
  data: [],           // Có data mà vẫn loading?!
  error: "Oops",     // Có error mà vẫn có data?!
};

// === ĐÚNG: DISCRIMINATED UNIONS ===
type UserListState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: User[]; lastUpdated: Date }
  | { status: "error"; error: string; retryCount: number };

// Không thể tạo trạng thái không hợp lệ
function renderUserList(state: UserListState) {
  switch (state.status) {
    case "idle":
      return "Chưa bắt đầu tải dữ liệu";

    case "loading":
      return "Đang tải...";
      // state.data; // Error! không có data khi loading

    case "success":
      return state.data.map((u) => u.name).join(", ");
      // state.error; // Error! không có error khi success

    case "error":
      return `Lỗi: ${state.error} (thử lại lần ${state.retryCount})`;
      // state.data; // Error! không có data khi error
  }
}

// === THỰC TẾ: AUTH STATE ===
type AuthState =
  | { status: "unauthenticated" }
  | { status: "authenticating"; provider: "google" | "github" | "email" }
  | { status: "authenticated"; user: User; token: string; expiresAt: Date }
  | { status: "error"; error: string; lastAttempt: Date };

function getAuthHeader(state: AuthState): string | null {
  if (state.status === "authenticated") {
    // TypeScript biết có token
    return `Bearer ${state.token}`;
  }
  return null;
}

// === THỰC TẾ: PAYMENT FLOW ===
type PaymentState =
  | { step: "select_method"; methods: PaymentMethod[] }
  | { step: "enter_details"; method: PaymentMethod; formData: Partial<PaymentDetails> }
  | { step: "confirming"; method: PaymentMethod; details: PaymentDetails }
  | { step: "processing"; transactionId: string }
  | { step: "completed"; transactionId: string; receipt: Receipt }
  | { step: "failed"; error: string; canRetry: boolean };

type PaymentAction =
  | { type: "SELECT_METHOD"; method: PaymentMethod }
  | { type: "UPDATE_FORM"; field: string; value: string }
  | { type: "CONFIRM" }
  | { type: "PAYMENT_SUCCESS"; transactionId: string; receipt: Receipt }
  | { type: "PAYMENT_FAILED"; error: string; canRetry: boolean }
  | { type: "RETRY" };

function paymentReducer(state: PaymentState, action: PaymentAction): PaymentState {
  switch (action.type) {
    case "SELECT_METHOD":
      return {
        step: "enter_details",
        method: action.method,
        formData: {},
      };

    case "CONFIRM":
      if (state.step !== "enter_details") return state;
      return {
        step: "confirming",
        method: state.method,
        details: state.formData as PaymentDetails,
      };

    case "PAYMENT_SUCCESS":
      return {
        step: "completed",
        transactionId: action.transactionId,
        receipt: action.receipt,
      };

    case "PAYMENT_FAILED":
      return {
        step: "failed",
        error: action.error,
        canRetry: action.canRetry,
      };

    default:
      return state;
  }
}
```

### Đáp án mẫu

> "Discriminated unions là cách model state tốt nhất vì chúng làm cho trạng thái không hợp lệ không thể biểu diễn được. Thay vì nhiều boolean flags có thể conflict nhau, mỗi variant chỉ chứa đúng data cho trạng thái đó. TypeScript tự động narrow trong switch/if nên bạn luôn truy cập đúng property. Tôi dùng pattern này cho tất cả state management -- từ async loading state đến complex multi-step flows như payment."

---

## Câu 4: Advanced infer usage `[Senior]`

### Giải thích lý thuyết

`infer` không chỉ để lấy return type hay element type đơn giản. Ở mức advanced, `infer` được dùng để **phân tích cấu trúc của type** -- trích xuất parts từ template literals, tuple positions, function overloads, và hơn nữa.

### Code ví dụ

```typescript
// === INFER TỪ TEMPLATE LITERAL ===

// Trích xuất parts của URL path
type ExtractParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof ExtractParams<`/${Rest}`>]: string }
    : T extends `${string}:${infer Param}`
      ? { [K in Param]: string }
      : {};

type UserPostParams = ExtractParams<"/users/:userId/posts/:postId">;
// { userId: string; postId: string }

type UserParams = ExtractParams<"/users/:id">;
// { id: string }

// === INFER TỪ FUNCTION OVERLOADS ===
// Khi function có nhiều overloads, infer lấy last overload
type OverloadReturnType<T> = T extends {
  (...args: any[]): infer R1;
  (...args: any[]): infer R2;
}
  ? R1 | R2
  : T extends (...args: any[]) => infer R
    ? R
    : never;

// === INFER ĐỂ UNWRAP NESTED TYPES ===
type UnwrapArray<T> = T extends Array<infer E>
  ? UnwrapArray<E> // Recursive: tiếp tục unwrap nếu vẫn là array
  : T;

type T1 = UnwrapArray<string[][][]>;  // string
type T2 = UnwrapArray<number[]>;       // number
type T3 = UnwrapArray<boolean>;        // boolean (không phải array)

// === INFER ĐỂ TRÍCH XUẤT GENERIC TYPE ARGUMENT ===
type UnwrapPromise<T> = T extends Promise<infer U> ? UnwrapPromise<U> : T;
type UnwrapSet<T> = T extends Set<infer U> ? U : T;
type UnwrapMap<T> = T extends Map<infer K, infer V> ? [K, V] : T;

type A = UnwrapPromise<Promise<Promise<string>>>; // string
type B = UnwrapSet<Set<number>>;                   // number
type C = UnwrapMap<Map<string, User>>;             // [string, User]

// === INFER TRONG TUPLE MANIPULATION ===
type Push<T extends any[], V> = [...T, V];
type Pop<T extends any[]> = T extends [...infer Rest, any] ? Rest : never;
type Shift<T extends any[]> = T extends [any, ...infer Rest] ? Rest : never;
type Unshift<T extends any[], V> = [V, ...T];

type Arr = [1, 2, 3];
type Pushed = Push<Arr, 4>;    // [1, 2, 3, 4]
type Popped = Pop<Arr>;        // [1, 2]
type Shifted = Shift<Arr>;     // [2, 3]
type Unshifted = Unshift<Arr, 0>; // [0, 1, 2, 3]

// === THỰC TẾ: TYPE-SAFE EVENT SYSTEM ===
type EventMap = {
  "user:login": { userId: string; timestamp: Date };
  "user:logout": { userId: string };
  "order:created": { orderId: string; items: string[] };
  "order:completed": { orderId: string; total: number };
};

type EventName = keyof EventMap;

// Trích xuất namespace từ event name
type EventNamespace<T extends string> =
  T extends `${infer NS}:${string}` ? NS : never;

type Namespaces = EventNamespace<EventName>;
// "user" | "order"

// Lấy tất cả events trong một namespace
type EventsInNamespace<
  NS extends string,
  T extends string = EventName
> = T extends `${NS}:${infer Name}` ? `${NS}:${Name}` : never;

type UserEvents = EventsInNamespace<"user", EventName>;
// "user:login" | "user:logout"
```

### Đáp án mẫu

> "infer là công cụ de-structuring ở type level. Ngoài những use case cơ bản như ReturnType, infer có thể trích xuất params từ URL patterns, manipulate tuples, unwrap nested generics, và parse template literal types. Điểm mạnh là infer cho phép 'pattern matching' trên types -- bạn định nghĩa shape cần match và infer tự động suy ra phần còn thiếu. Trong thực tế, tôi dùng infer nhiều nhất cho route params extraction và event system typing."

---

## Câu 5: Type-safe event emitter pattern `[Senior]`

### Giải thích lý thuyết

Event emitter là pattern phổ biến trong JavaScript nhưng thường thiếu type safety. Với TypeScript generics, ta có thể đảm bảo: mỗi event name chỉ chấp nhận đúng payload type, và listeners nhận đúng type của data.

### Code ví dụ

```typescript
// === TYPE-SAFE EVENT EMITTER ===
type Listener<T> = (data: T) => void;

class TypedEventEmitter<TEvents extends Record<string, any>> {
  private listeners = new Map<string, Set<Function>>();

  on<K extends keyof TEvents>(
    event: K,
    listener: Listener<TEvents[K]>
  ): () => void {
    const key = event as string;
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(listener);

    // Trả về unsubscribe function
    return () => {
      this.listeners.get(key)?.delete(listener);
    };
  }

  emit<K extends keyof TEvents>(event: K, data: TEvents[K]): void {
    const key = event as string;
    this.listeners.get(key)?.forEach((fn) => fn(data));
  }

  once<K extends keyof TEvents>(
    event: K,
    listener: Listener<TEvents[K]>
  ): void {
    const unsubscribe = this.on(event, (data) => {
      listener(data);
      unsubscribe();
    });
  }

  removeAllListeners<K extends keyof TEvents>(event?: K): void {
    if (event) {
      this.listeners.delete(event as string);
    } else {
      this.listeners.clear();
    }
  }
}

// === SỬ DỤNG ===
interface AppEvents {
  "auth:login": { userId: string; email: string };
  "auth:logout": { userId: string };
  "notification:new": { title: string; body: string; priority: "low" | "high" };
  "error": { code: number; message: string };
}

const emitter = new TypedEventEmitter<AppEvents>();

// Type-safe: listener nhận đúng type
emitter.on("auth:login", (data) => {
  console.log(data.userId);  // string -- TypeScript biết!
  console.log(data.email);   // string
  // data.title;              // Error! không có property title
});

// Type-safe: emit phải truyền đúng data
emitter.emit("auth:login", {
  userId: "user_123",
  email: "thuan@dev.com",
});

// emitter.emit("auth:login", { wrong: true }); // Error!

// Type-safe: event name phải hợp lệ
// emitter.on("invalid:event", () => {}); // Error!

// === MỞ RỘNG: WILDCARD LISTENER ===
class ExtendedEmitter<TEvents extends Record<string, any>> extends TypedEventEmitter<TEvents> {
  private wildcardListeners = new Set<(event: string, data: any) => void>();

  onAny(listener: <K extends keyof TEvents>(event: K, data: TEvents[K]) => void): () => void {
    this.wildcardListeners.add(listener as any);
    return () => {
      this.wildcardListeners.delete(listener as any);
    };
  }

  override emit<K extends keyof TEvents>(event: K, data: TEvents[K]): void {
    super.emit(event, data);
    this.wildcardListeners.forEach((fn) => fn(event as string, data));
  }
}
```

### Đáp án mẫu

> "Type-safe event emitter dùng generic parameter `TEvents extends Record<string, any>` để định nghĩa mapping giữa event names và payload types. Methods `on()` và `emit()` dùng `K extends keyof TEvents` để đảm bảo chỉ chấp nhận event names hợp lệ và payload đúng type. Pattern này loại bỏ hoàn toàn lỗi sai event name hoặc sai payload tại compile time. Trong dự án lớn, tôi tách event types thành file riêng để mỗi module có thể import và sử dụng."

---

## Câu 6: Declaration merging `[Intermediate]`

### Giải thích lý thuyết

**Declaration merging** là cơ chế TypeScript tự động **gộp nhiều khai báo** cùng tên thành một. Hoạt động với interfaces, namespaces, và enums. Đây là pattern dùng để **mở rộng type của thư viện bên thứ ba** mà không cần sửa source code.

### Code ví dụ

```typescript
// === INTERFACE MERGING ===
interface Window {
  myCustomProperty: string;
}

// TypeScript gộp vào interface Window sẵn có
// Bây giờ window.myCustomProperty là hợp lệ

// === MỞ RỘNG THƯ VIỆN ===

// Mở rộng Express Request
declare namespace Express {
  interface Request {
    user?: {
      id: string;
      role: "admin" | "user";
    };
    requestId: string;
  }
}

// Bây giờ trong Express handler:
// app.get("/", (req, res) => {
//   req.user?.role; // TypeScript biết!
//   req.requestId;  // TypeScript biết!
// });

// === MODULE AUGMENTATION ===
// Mở rộng module của thư viện
declare module "express-session" {
  interface SessionData {
    userId: string;
    cart: CartItem[];
  }
}

// === ENUM MERGING ===
enum Color {
  Red = "RED",
  Green = "GREEN",
}

enum Color {
  Blue = "BLUE",
  Yellow = "YELLOW",
}

// Kết quả: Color có Red, Green, Blue, Yellow

// === NAMESPACE MERGING VỚI CLASS ===
class Album {
  label: Album.AlbumLabel;

  constructor(label: Album.AlbumLabel) {
    this.label = label;
  }
}

namespace Album {
  export interface AlbumLabel {
    name: string;
    color: string;
  }
}

// Album vừa là class vừa có namespace chứa AlbumLabel interface
const album = new Album({ name: "Thriller", color: "gold" });

// === THỰC TẾ: GLOBAL TYPE EXTENSIONS ===

// Thêm vào globalThis
declare global {
  interface Array<T> {
    customGroupBy(fn: (item: T) => string): Record<string, T[]>;
  }

  // Thêm environment variable types
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      API_KEY: string;
      NODE_ENV: "development" | "production" | "test";
    }
  }
}

// Bây giờ process.env.DATABASE_URL là string (không phải string | undefined)
// và Array có method customGroupBy
```

### Đáp án mẫu

> "Declaration merging cho phép nhiều khai báo cùng tên được gộp thành một. Interfaces được merge tự động -- khai báo cùng interface nhiều lần sẽ cộng dồn tất cả properties. Pattern này cực kỳ hữu ích để mở rộng types của thư viện bên thứ ba: ví dụ thêm user property vào Express Request, thêm custom fields vào session, hoặc định nghĩa environment variables type. Lưu ý: type aliases không hỗ trợ merging -- đây là một lý do chính để chọn interface khi cần extensibility."

---

## Bảng so sánh patterns và khi nào dùng

| Pattern | Bài toán giải quyết | Khi nào dùng | Độ phức tạp |
|---------|---------------------|-------------|-------------|
| Branded Types | Nhầm lẫn types có cùng cấu trúc | IDs, units, validated values | Trung bình |
| Builder Pattern | Xây dựng object phức tạp | Config objects, queries, requests | Cao |
| Discriminated Unions | State có nhiều variants | State management, API responses | Thấp-Trung bình |
| Type-safe Events | Event system thiếu type safety | Event emitters, pub/sub | Trung bình |
| Declaration Merging | Mở rộng type thư viện | Express, session, env vars | Thấp |
| Exhaustive Check | Bỏ sót case trong union | Switch/case, reducers | Thấp |
| Conditional + infer | Trích xuất type từ structure | URL params, unwrap generics | Cao |
| Mapped + Template Literal | Tạo type từ type khác | Getters/setters, validators | Cao |

### Khi nào nên dùng và khi nào nên tránh

**Nên dùng:**
- Branded types: Khi có nhiều IDs hoặc values cùng primitive type trong domain
- Discriminated unions: Luôn luôn cho state management
- Declaration merging: Khi cần extend thư viện types

**Nên tránh:**
- Branded types cho mọi string/number -- chỉ dùng khi có nguy cơ nhầm lẫn thật sự
- Builder pattern cho simple objects -- overkill nếu object chỉ có 2-3 fields
- Quá nhiều conditional + infer -- làm code khó đọc và maintain

---

## Lỗi thường gặp khi trả lời

1. **Không giải thích được tại sao cần branded types**: Nếu bạn chỉ nói "thêm __brand property" mà không giải thích vấn đề của structural typing trước, câu trả lời thiếu context. Luôn bắt đầu từ vấn đề (UserId vs OrderId) rồi mới đến giải pháp.

2. **Nhầm declaration merging với type intersection**: Merging gộp nhiều khai báo thành một tại compile time. Intersection (`&`) tạo type mới tại type level. Hai cái này khác nhau về cơ chế hoạt động.

3. **Builder pattern không return `this`**: Nếu method trong builder không return `this`, không thể method chain. Nhiều người quên điều này khi implement.

4. **Dùng boolean flags thay vì discriminated unions**: Khi interviewer hỏi về state management mà bạn dùng `{ isLoading: boolean; isError: boolean; data: T | null }`, đó là red flag. Luôn dùng discriminated unions với status field.

5. **Không biết giới hạn của declaration merging**: Chỉ hoạt động với interface, namespace, và enum. Type alias KHÔNG hỗ trợ merging. Class KHÔNG hỗ trợ merging với class khác.

6. **Event emitter không type-safe**: Nếu bạn implement event emitter mà `on("anyString", ...)` không báo lỗi, đó không phải type-safe. Phải dùng generic constraint `K extends keyof TEvents`.
