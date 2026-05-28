---
sidebar_position: 3
title: "3. State Management"
---

# State Management

> *Đây là câu "không có đáp án đúng tuyệt đối" — interviewer muốn nghe bạn lý luận trade-off, không phải đọc tên thư viện.*

---

## Câu 1: Phân loại state — em phân biệt thế nào? `[Intermediate]`

### Câu hỏi

> Trong một React app, có nhiều loại state. Em phân loại thế nào, và mỗi loại em chọn công cụ gì?

### Giải thích lý thuyết

Phân loại state phổ biến (theo Kent C. Dodds):

| Loại                   | Đặc điểm                                              | Công cụ phù hợp                                  |
| ---------------------- | ----------------------------------------------------- | ------------------------------------------------ |
| **Local UI state**     | Chỉ component đó cần (modal open, input value)       | `useState`, `useReducer`                         |
| **Shared UI state**    | Vài component liên quan (theme, sidebar open)        | `useContext`, lifted state                       |
| **Server state**       | Data từ API (user list, posts, comments)             | TanStack Query, SWR, RTK Query                   |
| **Global app state**   | Auth, cart, settings — cross route                    | Zustand, Jotai, Redux Toolkit                    |
| **URL state**          | Query params, route params (filter, page)            | React Router, Next.js router, nuqs               |
| **Form state**         | Field values, errors, dirty                           | react-hook-form, Formik                          |
| **Persisted state**    | localStorage, IndexedDB, cookies                     | Custom hook, persist middleware                  |

### Code minh hoạ

```javascript
// 1. Local UI
function Modal() {
  const [open, setOpen] = useState(false);
}

// 2. Shared UI — Context cho theme
const ThemeContext = createContext("light");
function App() {
  const [theme, setTheme] = useState("light");
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Children />
    </ThemeContext.Provider>
  );
}

// 3. Server state — TanStack Query (KHÔNG nên đẩy vào Redux)
function UserList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.get("/users"),
    staleTime: 60_000,
  });
}

// 4. Global app state — Zustand
import { create } from "zustand";

const useCart = create((set) => ({
  items: [],
  add: (item) => set((s) => ({ items: [...s.items, item] })),
  clear: () => set({ items: [] }),
}));

// 5. URL state — search params
function ProductFilter() {
  const [params, setParams] = useSearchParams();
  const category = params.get("category");
}

// 6. Form state
const { register, handleSubmit } = useForm();

// 7. Persisted
function usePersisted(key, initial) {
  const [v, setV] = useState(() => JSON.parse(localStorage.getItem(key) ?? "null") ?? initial);
  useEffect(() => { localStorage.setItem(key, JSON.stringify(v)); }, [key, v]);
  return [v, setV];
}
```

### Đáp án mẫu

> "Em phân thành 4-5 loại chính. **Local UI state** (modal open, input) — `useState` đủ. **Server state** (data từ API) — em **luôn** dùng TanStack Query, không đẩy vào Redux nữa. Lý do: server state có đặc tính riêng (cache, stale, refetch, optimistic update) mà Redux không giải tốt — viết tay rất nhiều boilerplate. **Global client state** (auth, cart, theme) — em chọn Zustand cho dự án nhỏ-vừa, Redux Toolkit nếu team lớn cần convention chặt. **URL state** (filter, page, tab active) — em đẩy lên URL bằng search params để share-able link. **Form state** — react-hook-form, không lift form vào global. Trade-off chính: ai cũng muốn 1 công cụ làm tất cả, nhưng thực tế chia đúng thì code đơn giản hơn nhiều."

---

## Câu 2: Context API — limitations và cách dùng đúng `[Intermediate]`

### Câu hỏi

> Em có dùng Context cho global state không? Có vấn đề gì? Cho ví dụ Context được dùng đúng và sai.

### Giải thích lý thuyết

Limitations của Context:

1. **Mọi consumer re-render khi value đổi** — không có "subscribe by selector". Update field nhỏ → toàn bộ subtree re-render.
2. Value mới mỗi render parent → trigger consumers (cần memo value).
3. Khó tách state đọc/ghi → mọi consumer biết cả 2.
4. Không có middleware/devtools mạnh như Redux/Zustand.

Khi nào Context **OK**:
- Value ít đổi (theme, locale, current user).
- Cần truyền value qua nhiều layer (avoid props drilling).

Khi nào Context **KHÔNG OK**:
- Update thường xuyên (cart, real-time data) → re-render lan tràn.
- State phức tạp với nhiều slice.

### Code minh hoạ

```javascript
// ❌ Anti-pattern: Context cho high-frequency state
const CartContext = createContext();
function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  return <CartContext.Provider value={{ items, setItems }}>{children}</CartContext.Provider>;
}

function Header() {
  const { items } = useContext(CartContext);
  return <span>{items.length}</span>; // re-render mỗi khi cart đổi
}

function PageBody() {
  const { items } = useContext(CartContext);
  // Re-render kể cả khi PageBody không quan tâm cart count
}

// ❌ Bug: value object mới mỗi render → all consumers re-render
function BadProvider({ children }) {
  const [theme, setTheme] = useState("light");
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
    // {} mới mỗi render → tất cả consumers re-render dù theme không đổi
  );
}

// ✅ Fix với useMemo
function GoodProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// ✅ Split context — đọc và ghi tách riêng
const ThemeStateContext = createContext();    // value
const ThemeDispatchContext = createContext(); // setter

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  return (
    <ThemeDispatchContext.Provider value={setTheme}>
      <ThemeStateContext.Provider value={theme}>
        {children}
      </ThemeStateContext.Provider>
    </ThemeDispatchContext.Provider>
  );
}
// Component chỉ dùng setTheme không re-render khi theme đổi

// ✅ Pattern dùng đúng: low-frequency state
const UserContext = createContext(null);
const LocaleContext = createContext("en");
const ThemeContext = createContext("light");
// User, locale, theme ít đổi → Context phù hợp

// React 19: Context.Provider không cần `.Provider` nữa
// <ThemeContext value={...}>...</ThemeContext>
```

### Đáp án mẫu

> "Em dùng Context cho **low-frequency state** — theme, locale, current user, feature flags — những thứ đổi vài lần một session. Không dùng cho cart, real-time data, hoặc state update thường xuyên vì mọi consumer re-render khi value đổi (không có selector subscription). Bẫy phổ biến: forget useMemo cho value — `value={{a, setA}}` tạo object mới mỗi render → tất cả consumer re-render dù `a` không đổi. Pattern em hay dùng: **split context** thành state context và dispatch context — component chỉ cần setter không bị re-render khi value đổi. Khi state phức tạp em chọn Zustand/Jotai — selector-based, nhanh hơn nhiều. Quy tắc: Context cho 'configuration', không cho 'application data'."

---

## Câu 3: Redux vs Zustand vs Jotai — chọn cái nào? `[Senior]`

### Câu hỏi

> Em làm dự án mới, team 5 người, app cỡ trung. Em chọn library state management nào và lý do?

### Giải thích lý thuyết

| Lib            | Mental model          | Boilerplate | Bundle | Đặc điểm                                |
| -------------- | --------------------- | ----------- | ------ | --------------------------------------- |
| Redux Toolkit  | Single store + reducers | Vừa        | ~12kb  | Convention chặt, devtools mạnh, time-travel debug |
| Zustand        | Multiple small stores | Rất thấp    | ~1kb   | API như hook bình thường                |
| Jotai          | Atomic, bottom-up     | Thấp        | ~3kb   | Mỗi piece state = atom, compose         |
| Recoil         | Atomic                | Vừa         | ~14kb  | Tương tự Jotai nhưng Facebook-backed (giờ ít active) |
| Valtio         | Proxy-based mutable   | Thấp        | ~3kb   | Viết mutate được, library track changes |
| Signal-based (Preact, Solid) | Fine-grained reactive | Thấp | ~1kb | Khác paradigm với React          |

### Code minh hoạ

```javascript
// Redux Toolkit
import { createSlice, configureStore } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [] },
  reducers: {
    add: (state, action) => { state.items.push(action.payload); },
    clear: (state) => { state.items = []; },
  },
});
const store = configureStore({ reducer: { cart: cartSlice.reducer } });

// Component
const items = useSelector((s) => s.cart.items);
const dispatch = useDispatch();
dispatch(cartSlice.actions.add(item));

// Zustand
import { create } from "zustand";

const useCart = create((set) => ({
  items: [],
  add: (item) => set((s) => ({ items: [...s.items, item] })),
  clear: () => set({ items: [] }),
}));

// Component — không cần Provider
const items = useCart((s) => s.items);
const add = useCart((s) => s.add);

// Jotai
import { atom, useAtom } from "jotai";

const itemsAtom = atom([]);
const cartCountAtom = atom((get) => get(itemsAtom).length); // derived

function Cart() {
  const [items, setItems] = useAtom(itemsAtom);
  const [count] = useAtom(cartCountAtom);
}
```

### Đáp án mẫu

> "Team 5 người, app trung — em chọn **Zustand + TanStack Query**. Lý do: Zustand boilerplate cực thấp (vài dòng tạo store, không cần Provider, không reducer), tree-shake tốt nên dễ chia nhỏ store theo feature. API như hook nên không phải onboard pattern mới cho dev. Pair với TanStack Query xử lý server state riêng — Zustand chỉ lo client state (UI, auth, cart). Redux Toolkit em chọn khi: team trên 10 người cần convention chặt; cần time-travel devtools mạnh (debugging phức tạp); hoặc đã có pattern Redux trong codebase. Jotai em chưa dùng production nhưng atomic model phù hợp khi state derive lẫn nhau nhiều. Quyết định cuối cùng phụ thuộc team — chọn cái mọi người maintain được, không chọn cái 'fancy nhất'."

---

## Câu 4: Server state vs Client state — tại sao tách? `[Senior]`

### Câu hỏi

> Em nói "server state nên dùng TanStack Query, không đẩy vào Redux". Giải thích kỹ tại sao. Cho ví dụ bug cụ thể nếu trộn lẫn.

### Giải thích lý thuyết

Server state có đặc tính riêng client state không có:

| Đặc tính            | Client state                | Server state                                |
| ------------------- | --------------------------- | ------------------------------------------- |
| Source of truth     | App                         | Server (eventual consistency)               |
| Stale               | Không                       | Có — data có thể outdated                   |
| Caching             | N/A                         | Cần                                         |
| Background refetch  | N/A                         | Cần (window focus, interval, reconnect)     |
| Multiple subscribers | Đơn giản                   | Cần dedupe request                          |
| Optimistic update   | Không                       | Cần (cho UX)                                |
| Garbage collection  | Không                       | Cần (data không dùng → evict cache)         |

Cố nhồi server state vào Redux → viết tay tất cả những thứ trên = thousands of lines boilerplate, dễ bug.

### Code minh hoạ

```javascript
// ❌ Server state trong Redux — boilerplate khổng lồ
const userSlice = createSlice({
  name: "user",
  initialState: { data: null, loading: false, error: null, fetchedAt: 0 },
  reducers: {
    fetchStart: (s) => { s.loading = true; s.error = null; },
    fetchSuccess: (s, a) => { s.data = a.payload; s.loading = false; s.fetchedAt = Date.now(); },
    fetchError: (s, a) => { s.error = a.payload; s.loading = false; },
  },
});

// Thunk — manual cache, refetch, dedupe
const fetchUser = (id) => async (dispatch, getState) => {
  const cached = getState().user.fetchedAt;
  if (Date.now() - cached < 60000) return; // manual stale check
  dispatch(userSlice.actions.fetchStart());
  try {
    const data = await api.get(`/users/${id}`);
    dispatch(userSlice.actions.fetchSuccess(data));
  } catch (e) {
    dispatch(userSlice.actions.fetchError(e.message));
  }
};

// Component: 2 component cùng request → 2 lần fetch (không dedupe)
// Window focus → không refetch (không có logic)
// Update post → manual invalidate user.posts...

// ✅ TanStack Query — tất cả built-in
function UserProfile({ id }) {
  const { data, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => api.get(`/users/${id}`),
    staleTime: 60_000,
  });
}

// Dedupe: 10 component cùng queryKey ["user", id] → 1 request
// Window focus / reconnect → tự refetch
// Cache: tự GC sau 5 phút không dùng
// Invalidate khi mutate:
const queryClient = useQueryClient();
const mutation = useMutation({
  mutationFn: (data) => api.post("/users", data),
  onSuccess: () => queryClient.invalidateQueries(["users"]),
});

// Bug khi trộn: user data trong Redux, posts trong Redux nhưng đường khác
// Component A update user → quên invalidate Redux posts → posts hiển thị stale
// TanStack Query: 1 invalidate ["users"] sẽ refetch tất cả query liên quan
```

### Đáp án mẫu

> "Server state có đặc tính riêng client state không có: stale (data có thể outdated), cần caching, cần background refetch (focus/reconnect/interval), cần dedupe (2 component cùng query không tạo 2 request), cần optimistic update, và cần garbage collection. Nhồi vào Redux thì phải viết tay tất cả — nghìn dòng boilerplate. TanStack Query/SWR đã solve sẵn. Bug em từng debug: codebase cũ trộn — user data trong Redux, sau khi update profile component A dispatch action update Redux, nhưng component B subscribe khác key → hiển thị stale name 5 phút sau mới đúng. Với TanStack Query, `queryClient.invalidateQueries(['user'])` là 1 dòng — mọi component dùng query đó tự refetch. Quy tắc: client state = Zustand/Redux/Context; server state = TanStack Query/SWR. Tách rõ thì code đơn giản hẳn."

---

## Câu 5: Optimistic update — pattern và bẫy `[Senior]`

### Câu hỏi

> User click "Like". Em làm sao để UI update ngay không chờ server, nhưng vẫn rollback nếu API fail?

### Giải thích lý thuyết

Optimistic update flow:
1. Update UI ngay với giá trị giả định success.
2. Gửi request lên server.
3. Nếu thành công → giữ UI, có thể sync với data thực từ server.
4. Nếu fail → rollback UI về trạng thái cũ, hiển thị error.

Bẫy thường gặp:
- Quên snapshot trạng thái cũ → không rollback được.
- User trigger lần 2 trong khi request 1 đang chạy → race condition.
- Server trả error nhưng client đã update server state cache → cache stale.
- UI flash khi rollback gây "jumpy".

### Code minh hoạ

```javascript
// TanStack Query — optimistic update với built-in pattern
function LikeButton({ postId }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => api.post(`/posts/${postId}/like`),

    onMutate: async () => {
      // 1. Cancel pending refetch để không overwrite optimistic
      await queryClient.cancelQueries({ queryKey: ["post", postId] });

      // 2. Snapshot previous
      const previous = queryClient.getQueryData(["post", postId]);

      // 3. Optimistic update
      queryClient.setQueryData(["post", postId], (old) => ({
        ...old,
        likes: old.likes + 1,
        liked: true,
      }));

      // 4. Trả context để onError rollback
      return { previous };
    },

    onError: (err, _vars, context) => {
      // 5. Rollback
      queryClient.setQueryData(["post", postId], context.previous);
      toast.error("Like thất bại");
    },

    onSettled: () => {
      // 6. Refetch để sync với server (tránh drift)
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });

  return <button onClick={() => mutation.mutate()}>Like</button>;
}

// Manual với Zustand
function useLike() {
  const setLikes = useStore((s) => s.setLikes);
  return async (postId) => {
    const previous = useStore.getState().posts[postId].likes;
    setLikes(postId, previous + 1); // optimistic
    try {
      await api.post(`/posts/${postId}/like`);
    } catch {
      setLikes(postId, previous); // rollback
      toast.error("Failed");
    }
  };
}

// Bẫy: rapid double-click
// User click 2 lần nhanh → 2 request → race
// Fix: disable button khi pending, hoặc abort previous request
```

### Đáp án mẫu

> "Pattern em dùng với TanStack Query: trong `useMutation`, `onMutate` snapshot data hiện tại rồi setQueryData optimistic luôn — UI update ngay. Quan trọng: `cancelQueries` trước khi mutate để pending refetch không overwrite optimistic value. `onError` rollback bằng snapshot đã lưu. `onSettled` (chạy cả success/fail) invalidate query để refetch và sync với server — phòng case server trả về data khác client tính (ví dụ counter chính xác). Bẫy em từng dính: user spam click → nhiều request đồng thời, response cuối có thể đè lên optimistic của request mới hơn. Fix: disable button khi mutation pending, hoặc dùng `useMutation` với `mutationKey` + cancel pending. Không phải mọi action đều nên optimistic — chỉ những action mà 99% thành công (like, follow); với action quan trọng (payment, delete) thì show loading rồi mới update."

---

## Câu 6: State Machine — XState hoặc tự viết `useReducer` `[Senior]`

### Câu hỏi

> Em có flow phức tạp: payment với các state idle/validating/processing/3DS-challenge/success/failed/retrying. Em modeling thế nào?

### Giải thích lý thuyết

Flow phức tạp với nhiều state + transition rõ ràng = state machine.

Options:

1. **`useReducer` + discriminated union** — không thêm dependency, đủ cho 80% case.
2. **XState** — formal FSM, có visualizer, statecharts (nested state, parallel state), guards, services. Phù hợp khi flow rất phức tạp.

Lợi ích state machine:
- Mọi transition explicit → không có "state lạ" không hợp lệ.
- Test riêng được khỏi UI.
- Có thể visualize, giúp PM/QA hiểu.

### Code minh hoạ

```typescript
// Cách 1: useReducer + discriminated union
type PaymentState =
  | { status: "idle" }
  | { status: "validating"; cardInfo: CardInfo }
  | { status: "processing"; cardInfo: CardInfo }
  | { status: "3ds-challenge"; redirectUrl: string }
  | { status: "success"; transactionId: string }
  | { status: "failed"; error: string; canRetry: boolean };

type Action =
  | { type: "SUBMIT"; cardInfo: CardInfo }
  | { type: "VALIDATED" }
  | { type: "VALIDATION_FAILED"; error: string }
  | { type: "NEEDS_3DS"; redirectUrl: string }
  | { type: "PROCESSING_DONE"; transactionId: string }
  | { type: "PROCESSING_FAILED"; error: string }
  | { type: "RETRY" };

function reducer(state: PaymentState, action: Action): PaymentState {
  switch (state.status) {
    case "idle":
      if (action.type === "SUBMIT") return { status: "validating", cardInfo: action.cardInfo };
      return state;
    case "validating":
      if (action.type === "VALIDATED") return { status: "processing", cardInfo: state.cardInfo };
      if (action.type === "VALIDATION_FAILED") return { status: "failed", error: action.error, canRetry: true };
      return state;
    case "processing":
      if (action.type === "NEEDS_3DS") return { status: "3ds-challenge", redirectUrl: action.redirectUrl };
      if (action.type === "PROCESSING_DONE") return { status: "success", transactionId: action.transactionId };
      if (action.type === "PROCESSING_FAILED") return { status: "failed", error: action.error, canRetry: false };
      return state;
    // ...
    default:
      return state;
  }
}

// Cách 2: XState
import { createMachine } from "xstate";

const paymentMachine = createMachine({
  id: "payment",
  initial: "idle",
  states: {
    idle: {
      on: { SUBMIT: "validating" },
    },
    validating: {
      invoke: {
        src: "validateCard",
        onDone: "processing",
        onError: { target: "failed", actions: "setError" },
      },
    },
    processing: {
      invoke: {
        src: "processPayment",
        onDone: [
          { target: "3dsChallenge", cond: "needs3DS" },
          { target: "success" },
        ],
        onError: "failed",
      },
    },
    "3dsChallenge": {
      on: { CHALLENGE_DONE: "processing" },
    },
    success: { type: "final" },
    failed: {
      on: { RETRY: "validating" },
    },
  },
});
```

### Đáp án mẫu

> "Em chọn dựa trên độ phức tạp. 5-7 state với transition đơn giản — em dùng `useReducer` + discriminated union, đủ tốt và không thêm dependency. Khi flow có nested state (3DS challenge có sub-state riêng), parallel state (validate card + check fraud song song), guards phức tạp, hoặc cần visualize cho team → **XState**. XState có visualizer cực mạnh — PM/QA xem flow như diagram, fix bug team nhanh hơn 10 lần vì 'sai ở transition nào' rõ ràng. Trade-off: XState bundle ~40kb và learning curve. Em đã dùng XState cho onboarding flow và payment — đáng vì giảm bug rất nhiều. Cho dashboard CRUD bình thường thì reducer là đủ. Quy tắc: thấy code đang viết 5 boolean flag để track state → đó là dấu hiệu cần state machine."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                                | Đúng là                                                              |
| ------------------------------------------------------ | -------------------------------------------------------------------- |
| "Redux solve mọi state problem"                        | Server state cần TanStack Query/SWR — Redux không phù hợp            |
| "Context = state management"                           | Context là DI cho state, không có selector subscription              |
| "Zustand chỉ phù hợp dự án nhỏ"                        | Zustand scale được; Redux Toolkit phù hợp khi cần convention team    |
| "Optimistic update luôn nên dùng"                      | Chỉ với action 99% thành công; payment/delete nên show loading       |
| "State machine là overkill"                            | Với flow nhiều mode, viết flag boolean dễ bug hơn nhiều              |
