---
sidebar_position: 5
title: "TS Patterns: Branded Types, Discriminated Unions, infer"
---

# TS Patterns: Branded Types, Discriminated Unions, infer

Bai nay tong hop nhung advanced patterns ma cac TypeScript developer co kinh nghiem su dung trong production. Day la nhom cau hoi "do chieu sau" -- interviewer muon biet ban khong chi hieu ly thuyet ma con ap dung duoc vao code that.

---

## Cau 1: Branded types (nominal types) la gi va tai sao can dung? `[Senior]`

### Giai thich ly thuyet

TypeScript dung **structural typing** -- hai types duoc coi la tuong thich neu chung co cung cau truc, bat ke ten goi. Dieu nay doi khi gay ra van de khi ban muon phan biet giua cac type co cung cau truc nhung y nghia khac nhau.

**Branded types** (hay nominal types) la pattern them mot **phantom property** (property chi ton tai o type level, khong co tai runtime) de tao ra su khac biet giua cac type co cung underlying type.

### Code vi du

```typescript
// === VAN DE: STRUCTURAL TYPING ===
type UserId = string;
type OrderId = string;

function getUser(id: UserId): User {
  return db.findUser(id);
}

const orderId: OrderId = "order_123";
getUser(orderId); // KHONG LOI! Vi ca hai deu la string
// Nhung day la BUG -- truyen OrderId vao cho can UserId

// === GIAI PHAP: BRANDED TYPES ===
type Brand<T, B extends string> = T & { readonly __brand: B };

type BrandedUserId = Brand<string, "UserId">;
type BrandedOrderId = Brand<string, "OrderId">;

// Factory functions
function createUserId(id: string): BrandedUserId {
  // Co the validate truoc khi tao
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
  return db.findUser(id); // id van la string tai runtime
}

const userId = createUserId("user_456");
const orderId2 = createOrderId("order_789");

getUserBranded(userId);    // OK
// getUserBranded(orderId2); // Error! Type 'BrandedOrderId' is not assignable to 'BrandedUserId'

// === THUC TE: TYPE-SAFE UNITS ===
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
// metersToKm(42 as Kilometers); // Error! Khong the truyen Km vao cho Meters

// === THUC TE: VALIDATED TYPES ===
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
  // TypeScript dam bao `to` da duoc validate
  // Khong the truyen raw string vao day
}

const email = validateEmail("thuan@dev.com");
sendEmail(email, "Hello"); // OK
// sendEmail("raw@string.com", "Hello"); // Error! string khong phai Email
```

### Dap an mau

> "Branded types giai quyet van de cua structural typing -- khi hai type co cung cau truc nhung y nghia khac nhau. Bang cach them phantom property __brand, ta tao ra su phan biet o type level ma khong anh huong runtime. Pattern nay cuc ky huu ich cho IDs (UserId vs OrderId), units (Meters vs Kilometers), va validated values (Email, PhoneNumber). Gia tri van la string/number tai runtime, nhung TypeScript ngan khong cho truyen nham type."

---

## Cau 2: Builder pattern voi TypeScript `[Senior]`

### Giai thich ly thuyet

**Builder pattern** cho phep xay dung object phuc tap tung buoc mot. Trong TypeScript, ta co the dung **generics va method chaining** de dam bao type safety -- compiler se biet nhung field nao da duoc set va khong cho build() neu thieu field bat buoc.

### Code vi du

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

// Track nhung field da duoc set qua generic
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

  // build() chi available khi ca url va method da duoc set
  build(
    this: TypeSafeBuilder<{ hasUrl: true; hasMethod: true }>
  ): RequestConfig {
    return this.config as RequestConfig;
  }
}

const valid = new TypeSafeBuilder()
  .setUrl("https://api.com")
  .setMethod("GET")
  .build(); // OK -- ca hai da duoc set

// const invalid = new TypeSafeBuilder()
//   .setUrl("https://api.com")
//   .build(); // Error! hasMethod la false

// === FLUENT INTERFACE VOI GENERICS ===
type QueryBuilder<T> = {
  select<K extends keyof T>(...keys: K[]): QueryBuilder<Pick<T, K>>;
  where(condition: Partial<T>): QueryBuilder<T>;
  orderBy(key: keyof T, direction?: "asc" | "desc"): QueryBuilder<T>;
  execute(): Promise<T[]>;
};

// Usage (minh hoa type flow)
declare function from<T>(table: string): QueryBuilder<T>;

// const users = await from<User>("users")
//   .select("name", "email")       // QueryBuilder<Pick<User, "name" | "email">>
//   .where({ name: "Thuan" })       // OK -- name exists
//   .orderBy("email")               // OK -- email exists
//   // .orderBy("age")              // Error! "age" da bi loai boi select
//   .execute();                     // Promise<Pick<User, "name" | "email">[]>
```

### Dap an mau

> "Builder pattern trong TypeScript co the duoc implement voi hai muc do type safety. Basic builder dung method chaining voi Partial va validate tai runtime trong build(). Advanced builder dung generics de track state -- moi method setter tra ve builder voi updated type, va build() chi available khi tat ca required fields da duoc set. Pattern nay cho phep bat loi thieu field tai compile time thay vi runtime."

---

## Cau 3: Discriminated unions trong state management `[Intermediate]`

### Giai thich ly thuyet

Discriminated unions khong chi la pattern TypeScript -- do la cach tot nhat de model trang thai ung dung. Thay vi dung nhieu boolean flags (`isLoading`, `isError`, `hasData`), ban model moi trang thai nhu mot variant rieng biet voi dung data cho trang thai do.

### Code vi du

```typescript
// === SAI: BOOLEAN FLAGS ===
interface BadState {
  isLoading: boolean;
  isError: boolean;
  data: User[] | null;
  error: string | null;
}

// Van de: co trang thai khong hop le
const impossible: BadState = {
  isLoading: true,
  isError: true,     // Vua loading vua error?!
  data: [],           // Co data ma van loading?!
  error: "Oops",     // Co error ma van co data?!
};

// === DUNG: DISCRIMINATED UNIONS ===
type UserListState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: User[]; lastUpdated: Date }
  | { status: "error"; error: string; retryCount: number };

// Khong the tao trang thai khong hop le
function renderUserList(state: UserListState) {
  switch (state.status) {
    case "idle":
      return "Chua bat dau tai du lieu";

    case "loading":
      return "Dang tai...";
      // state.data; // Error! khong co data khi loading

    case "success":
      return state.data.map((u) => u.name).join(", ");
      // state.error; // Error! khong co error khi success

    case "error":
      return `Loi: ${state.error} (thu lai lan ${state.retryCount})`;
      // state.data; // Error! khong co data khi error
  }
}

// === THUC TE: AUTH STATE ===
type AuthState =
  | { status: "unauthenticated" }
  | { status: "authenticating"; provider: "google" | "github" | "email" }
  | { status: "authenticated"; user: User; token: string; expiresAt: Date }
  | { status: "error"; error: string; lastAttempt: Date };

function getAuthHeader(state: AuthState): string | null {
  if (state.status === "authenticated") {
    // TypeScript biet co token
    return `Bearer ${state.token}`;
  }
  return null;
}

// === THUC TE: PAYMENT FLOW ===
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

### Dap an mau

> "Discriminated unions la cach model state tot nhat vi chung lam cho trang thai khong hop le khong the bieu dien duoc. Thay vi nhieu boolean flags co the conflict nhau, moi variant chi chua dung data cho trang thai do. TypeScript tu dong narrow trong switch/if nen ban luon truy cap dung property. Toi dung pattern nay cho tat ca state management -- tu async loading state den complex multi-step flows nhu payment."

---

## Cau 4: Advanced infer usage `[Senior]`

### Giai thich ly thuyet

`infer` khong chi de lay return type hay element type don gian. O muc advanced, `infer` duoc dung de **phan tich cau truc cua type** -- trich xuat parts tu template literals, tuple positions, function overloads, va hon nua.

### Code vi du

```typescript
// === INFER TU TEMPLATE LITERAL ===

// Trich xuat parts cua URL path
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

// === INFER TU FUNCTION OVERLOADS ===
// Khi function co nhieu overloads, infer lay last overload
type OverloadReturnType<T> = T extends {
  (...args: any[]): infer R1;
  (...args: any[]): infer R2;
}
  ? R1 | R2
  : T extends (...args: any[]) => infer R
    ? R
    : never;

// === INFER DE UNWRAP NESTED TYPES ===
type UnwrapArray<T> = T extends Array<infer E>
  ? UnwrapArray<E> // Recursive: tiep tuc unwrap neu van la array
  : T;

type T1 = UnwrapArray<string[][][]>;  // string
type T2 = UnwrapArray<number[]>;       // number
type T3 = UnwrapArray<boolean>;        // boolean (khong phai array)

// === INFER DE TRICH XUAT GENERIC TYPE ARGUMENT ===
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

// === THUC TE: TYPE-SAFE EVENT SYSTEM ===
type EventMap = {
  "user:login": { userId: string; timestamp: Date };
  "user:logout": { userId: string };
  "order:created": { orderId: string; items: string[] };
  "order:completed": { orderId: string; total: number };
};

type EventName = keyof EventMap;

// Trich xuat namespace tu event name
type EventNamespace<T extends string> =
  T extends `${infer NS}:${string}` ? NS : never;

type Namespaces = EventNamespace<EventName>;
// "user" | "order"

// Lay tat ca events trong mot namespace
type EventsInNamespace<
  NS extends string,
  T extends string = EventName
> = T extends `${NS}:${infer Name}` ? `${NS}:${Name}` : never;

type UserEvents = EventsInNamespace<"user", EventName>;
// "user:login" | "user:logout"
```

### Dap an mau

> "infer la cong cu de-structuring o type level. Ngoai nhung use case co ban nhu ReturnType, infer co the trich xuat params tu URL patterns, manipulate tuples, unwrap nested generics, va parse template literal types. Diem manh la infer cho phep 'pattern matching' tren types -- ban dinh nghia shape can match va infer tu dong suy ra phan con thieu. Trong thuc te, toi dung infer nhieu nhat cho route params extraction va event system typing."

---

## Cau 5: Type-safe event emitter pattern `[Senior]`

### Giai thich ly thuyet

Event emitter la pattern pho bien trong JavaScript nhung thuong thieu type safety. Voi TypeScript generics, ta co the dam bao: moi event name chi chap nhan dung payload type, va listeners nhan dung type cua data.

### Code vi du

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

    // Tra ve unsubscribe function
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

// === SU DUNG ===
interface AppEvents {
  "auth:login": { userId: string; email: string };
  "auth:logout": { userId: string };
  "notification:new": { title: string; body: string; priority: "low" | "high" };
  "error": { code: number; message: string };
}

const emitter = new TypedEventEmitter<AppEvents>();

// Type-safe: listener nhan dung type
emitter.on("auth:login", (data) => {
  console.log(data.userId);  // string -- TypeScript biet!
  console.log(data.email);   // string
  // data.title;              // Error! khong co property title
});

// Type-safe: emit phai truyen dung data
emitter.emit("auth:login", {
  userId: "user_123",
  email: "thuan@dev.com",
});

// emitter.emit("auth:login", { wrong: true }); // Error!

// Type-safe: event name phai hop le
// emitter.on("invalid:event", () => {}); // Error!

// === MO RONG: WILDCARD LISTENER ===
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

### Dap an mau

> "Type-safe event emitter dung generic parameter `TEvents extends Record<string, any>` de dinh nghia mapping giua event names va payload types. Methods `on()` va `emit()` dung `K extends keyof TEvents` de dam bao chi chap nhan event names hop le va payload dung type. Pattern nay loai bo hoan toan loi sai event name hoac sai payload tai compile time. Trong du an lon, toi tach event types thanh file rieng de moi module co the import va su dung."

---

## Cau 6: Declaration merging `[Intermediate]`

### Giai thich ly thuyet

**Declaration merging** la co che TypeScript tu dong **gop nhieu khai bao** cung ten thanh mot. Hoat dong voi interfaces, namespaces, va enums. Day la pattern dung de **mo rong type cua thu vien ben thu ba** ma khong can sua source code.

### Code vi du

```typescript
// === INTERFACE MERGING ===
interface Window {
  myCustomProperty: string;
}

// TypeScript gop vao interface Window san co
// Bay gio window.myCustomProperty la hop le

// === MO RONG THU VIEN ===

// Mo rong Express Request
declare namespace Express {
  interface Request {
    user?: {
      id: string;
      role: "admin" | "user";
    };
    requestId: string;
  }
}

// Bay gio trong Express handler:
// app.get("/", (req, res) => {
//   req.user?.role; // TypeScript biet!
//   req.requestId;  // TypeScript biet!
// });

// === MODULE AUGMENTATION ===
// Mo rong module cua thu vien
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

// Ket qua: Color co Red, Green, Blue, Yellow

// === NAMESPACE MERGING VOI CLASS ===
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

// Album vua la class vua co namespace chua AlbumLabel interface
const album = new Album({ name: "Thriller", color: "gold" });

// === THUC TE: GLOBAL TYPE EXTENSIONS ===

// Them vao globalThis
declare global {
  interface Array<T> {
    customGroupBy(fn: (item: T) => string): Record<string, T[]>;
  }

  // Them environment variable types
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      API_KEY: string;
      NODE_ENV: "development" | "production" | "test";
    }
  }
}

// Bay gio process.env.DATABASE_URL la string (khong phai string | undefined)
// va Array co method customGroupBy
```

### Dap an mau

> "Declaration merging cho phep nhieu khai bao cung ten duoc gop thanh mot. Interfaces duoc merge tu dong -- khai bao cung interface nhieu lan se cong don tat ca properties. Pattern nay cuc ky huu ich de mo rong types cua thu vien ben thu ba: vi du them user property vao Express Request, them custom fields vao session, hoac dinh nghia environment variables type. Luu y: type aliases khong ho tro merging -- day la mot ly do chinh de chon interface khi can extensibility."

---

## Bang so sanh patterns va khi nao dung

| Pattern | Bai toan giai quyet | Khi nao dung | Do phuc tap |
|---------|---------------------|-------------|-------------|
| Branded Types | Nham lan types co cung cau truc | IDs, units, validated values | Trung binh |
| Builder Pattern | Xay dung object phuc tap | Config objects, queries, requests | Cao |
| Discriminated Unions | State co nhieu variants | State management, API responses | Thap-Trung binh |
| Type-safe Events | Event system thieu type safety | Event emitters, pub/sub | Trung binh |
| Declaration Merging | Mo rong type thu vien | Express, session, env vars | Thap |
| Exhaustive Check | Bo sot case trong union | Switch/case, reducers | Thap |
| Conditional + infer | Trich xuat type tu structure | URL params, unwrap generics | Cao |
| Mapped + Template Literal | Tao type tu type khac | Getters/setters, validators | Cao |

### Khi nao nen dung va khi nao nen tranh

**Nen dung:**
- Branded types: Khi co nhieu IDs hoac values cung primitive type trong domain
- Discriminated unions: Luon luon cho state management
- Declaration merging: Khi can extend thu vien types

**Nen tranh:**
- Branded types cho moi string/number -- chi dung khi co nguy co nham lan that su
- Builder pattern cho simple objects -- overkill neu object chi co 2-3 fields
- Qua nhieu conditional + infer -- lam code kho doc va maintain

---

## Loi thuong gap khi tra loi

1. **Khong giai thich duoc tai sao can branded types**: Neu ban chi noi "them __brand property" ma khong giai thich van de cua structural typing truoc, cau tra loi thieu context. Luon bat dau tu van de (UserId vs OrderId) roi moi den giai phap.

2. **Nham declaration merging voi type intersection**: Merging gop nhieu khai bao thanh mot tai compile time. Intersection (`&`) tao type moi tai type level. Hai cai nay khac nhau ve co che hoat dong.

3. **Builder pattern khong return `this`**: Neu method trong builder khong return `this`, khong the method chain. Nhieu nguoi quen dieu nay khi implement.

4. **Dung boolean flags thay vi discriminated unions**: Khi interviewer hoi ve state management ma ban dung `{ isLoading: boolean; isError: boolean; data: T | null }`, do la red flag. Luon dung discriminated unions voi status field.

5. **Khong biet gioi han cua declaration merging**: Chi hoat dong voi interface, namespace, va enum. Type alias KHONG ho tro merging. Class KHONG ho tro merging voi class khac.

6. **Event emitter khong type-safe**: Neu ban implement event emitter ma `on("anyString", ...)` khong bao loi, do khong phai type-safe. Phai dung generic constraint `K extends keyof TEvents`.
