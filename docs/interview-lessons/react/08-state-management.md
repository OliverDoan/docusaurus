---
sidebar_position: 8
title: "8. State Management"
---

# 8. State Management

## 1. Context API

Bài học: [1. Context API](../../react/08-state-management/1_context-api.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Context API giải quyết vấn đề gì? Mô tả `prop drilling` và vì sao nó gây khó bảo trì khi cây component sâu.**

<details className="qa">
<summary>Xem đáp án</summary>

**Prop drilling** là việc truyền props qua nhiều tầng component trung gian chỉ để đưa dữ liệu tới một component nằm sâu, trong khi các tầng ở giữa **không hề dùng** dữ liệu đó:

```jsx
function App()    { return <Layout user={user} />; }   // Layout không dùng
function Layout({ user })  { return <Header user={user} />; }  // Header không dùng
function Header({ user })  { return <Nav user={user} />; }     // Nav không dùng
function Nav({ user })     { return <UserMenu user={user} />; } // mãi đây mới dùng
```

Vì sao khó bảo trì:

- Thêm một field mới phải sửa **mọi tầng** trên đường đi.
- Component trung gian bị "ô nhiễm" bởi prop không liên quan, khó tái sử dụng ở chỗ khác.
- Signature của component phình to, khó đọc, khó test.
- Refactor cấu trúc cây là phải đi lại toàn bộ chuỗi truyền.

**Context API** cắt đứt chuỗi đó: đặt một `Provider` ở trên cây, component nào cần thì gọi `useContext` đọc thẳng — các tầng trung gian không phải biết gì về dữ liệu.

</details>

**2. Kể ba bước để dùng Context: `createContext`, `Provider`, `useContext` — mỗi bước làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**Bước 1 — `createContext(defaultValue)`**: tạo đối tượng context, thường đặt ở module scope để import được nhiều nơi.

```jsx
const ThemeContext = createContext("light");
```

**Bước 2 — `Provider`**: bọc phần cây cần chia sẻ dữ liệu và truyền giá trị qua prop `value`. Phạm vi ảnh hưởng đúng bằng subtree bên trong.

```jsx
function App() {
  const [theme, setTheme] = useState("dark");
  return (
    <ThemeContext.Provider value={theme}>
      <Layout />
    </ThemeContext.Provider>
  );
}
```

**Bước 3 — `useContext`**: đọc giá trị ở bất kỳ component con nào, dù sâu bao nhiêu tầng.

```jsx
function Button() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>Click</button>;
}
```

Trong thực tế người ta gói cả ba vào **một file**, chỉ export `Provider` và một custom hook (`useTheme`) — phần còn lại giấu đi.

</details>

**3. Tham số `defaultValue` trong `createContext` được dùng khi nào? Nếu component không nằm trong `Provider` nào thì `useContext` trả về gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`defaultValue` **chỉ được dùng khi component gọi `useContext` mà phía trên nó không có bất kỳ `Provider` nào** của context đó. Nếu có Provider, giá trị của Provider luôn thắng — kể cả khi Provider truyền `undefined`.

```jsx
const ThemeContext = createContext("light");

function Button() {
  const theme = useContext(ThemeContext);
  return <button className={theme} />;
}

// Không có Provider → theme = "light" (defaultValue)
<Button />

// Có Provider → theme = "dark"
<ThemeContext.Provider value="dark"><Button /></ThemeContext.Provider>
```

Nếu không truyền gì cho `createContext()` thì `defaultValue` là `undefined`.

Điểm hay gây bug: quên bọc Provider sẽ **không báo lỗi** — component âm thầm dùng default value, UI hiện sai mà không ai biết. Đó là lý do có câu hỏi tiếp theo về việc cố ý đặt default là `null`.

`defaultValue` cũng rất tiện khi viết test hoặc render component độc lập trong Storybook mà không muốn dựng Provider.

</details>

**4. Vì sao nhiều team đặt `defaultValue` là `null` rồi cho custom hook `throw` error thay vì đưa một giá trị mặc định hợp lệ?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì một giá trị mặc định "hợp lệ" sẽ **che giấu lỗi**. Nếu ai đó quên bọc `AuthProvider`, component vẫn chạy với `user = null` giả và bạn phải đi truy tại sao màn hình trống — một **silent bug**. Đặt `null` + `throw` biến nó thành lỗi nổ ngay, kèm thông điệp chỉ đúng nguyên nhân:

```tsx
const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth phải dùng trong AuthProvider");
  }
  return ctx; // TypeScript hiểu đây là non-null
}
```

Hai lợi ích:

- **Defensive** — sai là biết ngay lúc dev, không lọt ra production.
- **Type-safe** — nhờ narrowing, hook trả về type non-null, nên mọi nơi gọi `useAuth()` không phải kiểm tra `if (!ctx)` hay viết `ctx?.user` nữa.

Ngoại lệ: với context thực sự có mặc định hợp lý và dùng được độc lập (theme mặc định `"light"`, locale `"vi"`) thì đưa giá trị thật lại tiện hơn.

</details>

**5. Giải thích cơ chế React quyết định component nào re-render khi `value` của `Provider` thay đổi. So sánh nó với cơ chế của `React.memo`.**

<details className="qa">
<summary>Xem đáp án</summary>

Khi `value` của Provider đổi, React so sánh giá trị mới và cũ bằng **`Object.is`**. Nếu khác, React đi tìm **mọi component trong subtree đang subscribe context đó** (gọi `useContext` hoặc dùng `Context.Consumer`) và **đánh dấu chúng cần re-render** — bất kể chúng dùng field nào trong value, bất kể props của chúng có đổi hay không.

Điểm khác biệt cốt lõi so với `React.memo`:

| | Luồng props thông thường | Context |
|---|---|---|
| Lan truyền | Cha render → con render, theo từng tầng | Nhảy thẳng tới consumer, bỏ qua tầng giữa |
| `React.memo` | Chặn được nếu props không đổi | **Không chặn được** |
| Độ chi tiết | Theo từng prop | Theo cả object `value`, không có selector |

`React.memo` chỉ so sánh **props**. Việc một component đọc context là một kênh subscribe riêng, nằm ngoài props — nên memo không biết gì để so sánh và không thể ngăn cập nhật này. Đây chính là lý do Context không phải công cụ tối ưu re-render, và vì sao các thư viện như Zustand/Jotai với selector lại tồn tại.

</details>

**6. Vì sao truyền object literal trực tiếp vào `value` lại gây re-render thừa? `useMemo` khắc phục điều đó ra sao và khi nào `useMemo` vẫn không cứu được?**

<details className="qa">
<summary>Xem đáp án</summary>

Object literal tạo **tham chiếu mới ở mỗi lần render** của component chứa Provider. React so sánh `value` bằng `Object.is` nên luôn thấy "đã đổi", dù nội dung y hệt → mọi consumer re-render, kể cả khi `user` và `theme` chẳng thay đổi gì.

```jsx
// Tệ — object mới mỗi render
<AppContext.Provider value={{ user, theme }}>

// Tốt — chỉ tạo object mới khi user hoặc theme đổi
const value = useMemo(() => ({ user, theme }), [user, theme]);
<AppContext.Provider value={value}>
```

**Khi `useMemo` vẫn không cứu được:**

- Một trong các dependency bản thân nó đã **không ổn định** — ví dụ hàm `login` định nghĩa inline mỗi render; phải bọc thêm `useCallback`.
- **Giá trị thật sự đổi thường xuyên** (mỗi keystroke, mỗi tick). Lúc này memo hoá vô nghĩa, vấn đề nằm ở thiết kế: phải **chia nhỏ context** theo tần suất cập nhật, hoặc chuyển sang store có selector.
- Consumer chỉ dùng một field nhưng field khác đổi — memo giữ nguyên tham chiếu cũ thì không sao, nhưng khi field kia đổi thật thì cả nhóm vẫn re-render.

</details>

**7. `React.memo` bọc component con có chặn được re-render do Context gây ra không? Giải thích tại sao.**

<details className="qa">
<summary>Xem đáp án</summary>

**Không**, nếu chính component đó gọi `useContext`.

`React.memo` hoạt động bằng cách so sánh **props** cũ và mới; props giống nhau thì bỏ qua render. Nhưng `useContext` là một **kênh subscribe độc lập với props**. Khi value đổi, React đánh dấu trực tiếp từng consumer là "cần cập nhật", và cờ này được kiểm tra **trước** phép so sánh props của memo.

```jsx
const Child = React.memo(function Child() {
  const { theme } = useContext(AppContext); // vẫn re-render khi value đổi
  return <button className={theme} />;
});
```

`memo` **có** tác dụng trong một trường hợp: nó chặn re-render lan xuống **con của consumer**. Tức là khi `Child` re-render vì context, các con của `Child` được bọc `memo` và nhận props không đổi vẫn được bỏ qua.

Muốn thực sự chặn, phải giảm phạm vi subscribe: tách context nhỏ hơn, tách phần đọc context ra một component riêng bọc quanh phần nội dung (`children` truyền từ ngoài vào), hoặc dùng store có selector.

</details>

**8. Context không có `selector`. Nêu ít nhất ba cách giải quyết khi chỉ muốn subscribe một phần của value.**

<details className="qa">
<summary>Xem đáp án</summary>

1. **Chia nhỏ context theo concern / tần suất đổi** — mỗi context một việc: `UserContext`, `ThemeContext`, `ToastContext`. Component chỉ subscribe cái nó cần, `toast` đổi liên tục không đụng tới consumer của `user`.

2. **Tách state và dispatch thành hai context** — `UserStateContext` và `UserDispatchContext`. Component chỉ gọi action (không đọc data) sẽ không bao giờ re-render vì dispatch ổn định.

3. **Truyền `children` từ ngoài vào** — component đọc context chỉ bọc quanh, phần cây con được tạo ở tầng trên nên giữ nguyên element reference và không render lại.

```jsx
function ThemeWrapper({ children }) {
  const theme = useContext(ThemeContext);
  return <div className={theme}>{children}</div>;
}
```

4. **Dùng thư viện có selector** — Zustand, Jotai, Redux Toolkit với `useSelector`: chỉ re-render khi đúng mảnh state được chọn thay đổi. Đây là giải pháp triệt để cho state đổi nhiều.

5. **`use-context-selector`** — thư viện cộng đồng thêm khả năng selector cho Context (React chưa có API chính thức).

</details>

**9. Vì sao nên tách `StateContext` và `DispatchContext` thành hai context riêng? Lợi ích cụ thể về re-render là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì hai thứ này có **vòng đời hoàn toàn khác nhau**: state đổi liên tục, còn hàm dispatch (từ `useReducer`) hoặc các setter của `useState` là **ổn định — React đảm bảo giữ nguyên tham chiếu suốt vòng đời component**.

Nếu nhồi chung một object `{ state, dispatch }`, component chỉ cần gọi action cũng bị kéo theo mỗi lần state đổi.

```jsx
const StateContext = createContext(null);
const DispatchContext = createContext(null);

function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);
  return (
    <DispatchContext.Provider value={dispatch}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
    </DispatchContext.Provider>
  );
}
```

**Lợi ích cụ thể:** một nút "Thêm vào giỏ" chỉ cần `useDispatch()` — nó **không bao giờ re-render** khi giỏ hàng thay đổi, vì `dispatch` không đổi tham chiếu. Chỉ những component thật sự hiển thị dữ liệu (`useCartState()`) mới render lại.

Lợi ích phụ: không cần `useMemo` cho value dispatch, và ranh giới "đọc" / "ghi" trong code rõ ràng hơn.

</details>

**10. Khi nào bạn kết hợp `useReducer` với Context thay vì `useState`? Mô hình này giống và khác Redux ở điểm nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng `useReducer` + Context khi:

- State có **nhiều field liên quan lẫn nhau** và các bước chuyển trạng thái phức tạp (wizard nhiều bước, giỏ hàng, bộ lọc nhiều tiêu chí).
- Cập nhật tiếp theo **phụ thuộc state trước**, có nhiều loại hành động khác nhau.
- Muốn logic cập nhật tập trung tại một chỗ, dễ test (reducer là hàm thuần).

```jsx
const [state, dispatch] = useReducer(cartReducer, initialCart);
dispatch({ type: "add_item", payload: item });
```

**Giống Redux:** cùng mô hình một store dữ liệu, action mô tả "chuyện gì xảy ra", reducer thuần tính state mới, component gửi action qua `dispatch`.

**Khác Redux:**

| | useReducer + Context | Redux Toolkit |
|---|---|---|
| Phạm vi | Theo subtree của Provider | Một store toàn cục |
| Selector | Không có → re-render toàn bộ consumer | `useSelector`, chỉ re-render khi mảnh đã chọn đổi |
| Middleware, async | Tự lo | Thunk, listener, RTK Query |
| DevTools | Không có time-travel | Có |
| Chi phí | 0 dependency | Thêm thư viện, thêm boilerplate |

</details>

**11. So sánh Context API và Redux: Context có phải là công cụ quản lý state không, hay chỉ là cơ chế truyền dữ liệu? Giải thích sự khác biệt.**

<details className="qa">
<summary>Xem đáp án</summary>

Context **không phải là công cụ quản lý state** — nó là một **cơ chế vận chuyển (dependency injection)**. Bản thân Context không lưu gì cả: state vẫn nằm trong `useState` / `useReducer` của component Provider; Context chỉ làm nhiệm vụ đưa giá trị đó xuống subtree mà không qua props.

Một công cụ quản lý state đúng nghĩa (Redux, Zustand) cung cấp thêm:

- Nơi lưu state **nằm ngoài cây React**.
- **Selector** để subscribe chọn lọc, tối ưu re-render.
- Quy ước cập nhật (action, reducer, immutability).
- Middleware cho async, logging, persist.
- DevTools, time-travel debugging.

Cách nói gọn: **Redux = Context (vận chuyển) + store + selector + middleware**. Thực tế `react-redux` cũng dùng Context để đưa store xuống cây, nhưng phần subscribe thì nó tự làm để có được selector.

Vì vậy câu "dùng Context thay Redux" chỉ đúng khi nhu cầu của bạn thực sự chỉ là vận chuyển vài giá trị ít đổi.

</details>

**12. Câu kinh điển: khi nào Context là đủ, khi nào bắt buộc phải chuyển sang Redux/Zustand/Jotai? Nêu tiêu chí cụ thể để ra quyết định.**

<details className="qa">
<summary>Xem đáp án</summary>

**Context là đủ khi:**

- Dữ liệu **ít thay đổi** — theme, user đăng nhập, locale, feature flag.
- Số lượng consumer vừa phải, không có vấn đề hiệu năng đo được.
- Logic cập nhật đơn giản, không cần middleware hay async phức tạp.
- Muốn tránh thêm dependency.

**Nên chuyển sang thư viện khi gặp ít nhất một trong các dấu hiệu:**

- State **đổi với tần suất cao** (mỗi keystroke, dữ liệu real-time, con trỏ chuột) và Profiler cho thấy re-render diện rộng.
- Cần **subscribe chọn lọc** — nhiều component đọc các mảnh khác nhau của cùng một khối state lớn.
- Cần **middleware / async** có tổ chức: cache, retry, optimistic update, undo/redo, persist.
- Cần **DevTools, time-travel** để debug luồng state phức tạp.
- Số provider phình to thành "provider hell" và bạn đã bắt đầu tự viết lại selector bằng tay.

Một lưu ý quan trọng: rất nhiều "global state" thực chất là **server state** — thứ đó nên giao cho TanStack Query chứ không phải Context lẫn Redux. Sau khi tách server state ra, phần client state còn lại thường nhỏ tới mức Context là đủ.

</details>

**13. Loại dữ liệu nào hợp với Context (theme, auth, locale, feature flag) và loại nào không (form state, real-time)? Nguyên tắc chung phía sau là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

**Hợp với Context:**

| Dữ liệu | Tần suất đổi |
|---|---|
| Theme sáng/tối | Vài lần mỗi phiên |
| User / auth | Khi login, logout |
| Locale (i18n) | Rất hiếm |
| Feature flag, cấu hình app | Gần như không đổi |

**Không hợp:**

- **Form state** — đổi mỗi lần gõ phím; dùng state cục bộ hoặc React Hook Form.
- **Real-time data** — giá cổ phiếu, chat, vị trí con trỏ; đổi liên tục.
- **App state phức tạp** với nhiều nhóm subscriber đọc các mảnh khác nhau.

**Nguyên tắc chung:** Context phát tán cập nhật tới **mọi** consumer và **không có selector**. Nên chi phí của một lần cập nhật tỉ lệ với số consumer. Công thức thô: *tần suất đổi × số consumer = chi phí*. Giữ tích số đó nhỏ thì Context rất tốt; tích số lớn thì phải chia nhỏ context hoặc chuyển sang store có selector.

Hệ quả thực tế: mỗi Context nên gói **một concern**, không nhồi nhiều thứ khác tần suất vào chung một object.

</details>

**14. `Provider hell` là gì? Bạn xử lý bằng cách nào — gộp provider, viết hàm `composeProviders`, hay chia lại context?**

<details className="qa">
<summary>Xem đáp án</summary>

**Provider hell** là tình trạng phần gốc của app bị lồng hàng chục tầng Provider, thụt lề sâu, khó đọc và khó thêm bớt:

```jsx
<AuthProvider>
  <ThemeProvider>
    <LocaleProvider>
      <ToastProvider>
        <ModalProvider>
          <App />
```

Các cách xử lý, theo thứ tự nên thử:

**Gom vào một component `Providers`** — vẫn lồng nhau nhưng giấu hết vào một file, phần `App` sạch sẽ:

```jsx
function Providers({ children }) {
  return <AuthProvider><ThemeProvider>{children}</ThemeProvider></AuthProvider>;
}
```

**Viết `composeProviders`** — gộp mảng provider thành một, phẳng và dễ thêm bớt:

```jsx
const Providers = composeProviders(
  AuthProvider, ThemeProvider, LocaleProvider, ToastProvider
);
```

**Chia lại context** — đây mới là cách trị gốc. Xem lại có provider nào thừa không, có thứ nào thực ra là server state (giao cho TanStack Query), có thứ nào chỉ dùng trong một nhánh nhỏ thì **đặt provider ngay tại nhánh đó** thay vì ở gốc app. Một số concern (toast, modal) có thể thay bằng store nhỏ ngoài React, không cần provider.

</details>

**15. Nếu có hai `Provider` cùng loại context lồng nhau, component con đọc được giá trị nào? Cơ chế nào quyết định điều đó?**

<details className="qa">
<summary>Xem đáp án</summary>

Component đọc giá trị của **Provider gần nhất phía trên nó** trong cây component. Provider bên trong **che** (shadow) Provider bên ngoài với toàn bộ subtree của nó.

```jsx
<ThemeContext.Provider value="light">
  <A />                                  {/* A đọc "light" */}
  <ThemeContext.Provider value="dark">
    <B />                                {/* B đọc "dark" */}
  </ThemeContext.Provider>
</ThemeContext.Provider>
```

Cơ chế: khi gặp `useContext`, React **đi ngược lên cây (fiber tree)** từ component hiện tại, dừng ở Provider đầu tiên của đúng context object đó và lấy `value`. Nếu không gặp Provider nào thì mới dùng `defaultValue` của `createContext`.

Lưu ý quan trọng: việc "gần nhất" tính theo **cây component lúc render**, không phải theo cấu trúc thư mục hay thứ tự import. Và hai context được tạo bởi hai lời gọi `createContext` khác nhau là **hai context hoàn toàn riêng biệt**, dù cùng tên biến.

Ứng dụng thực tế: ghi đè theme cho một khu vực (widget nhúng, modal nền tối), hay đổi locale cho một phần trang.

</details>

**16. Trong React 19, có thể viết `Context` trực tiếp làm component provider thay cho `Context.Provider` — thay đổi này ảnh hưởng gì tới code cũ?**

<details className="qa">
<summary>Xem đáp án</summary>

React 19 cho phép render thẳng chính context object làm provider, bỏ bớt `.Provider`:

```jsx
const ThemeContext = createContext("light");

// React 19
<ThemeContext value="dark">
  <App />
</ThemeContext>

// Cách cũ — vẫn chạy
<ThemeContext.Provider value="dark">
  <App />
</ThemeContext.Provider>
```

**Ảnh hưởng tới code cũ: gần như không có.** Đây là bổ sung cú pháp, không phải breaking change — `Context.Provider` vẫn hoạt động bình thường, chỉ bị đánh dấu là sẽ deprecated trong tương lai và React có codemod để chuyển đổi hàng loạt.

Cũng trong React 19: `Context.Consumer` (kiểu render props cũ) bị deprecated, khuyến khích dùng `useContext` — hoặc hook `use(Context)` mới, vốn còn gọi được trong điều kiện.

Hành vi thì **không đổi**: vẫn là Provider gần nhất thắng, vẫn so sánh `value` bằng `Object.is`, vẫn không có selector. Lưu ý dự án phải thực sự chạy React 19 mới dùng được cú pháp này.

</details>

**17. Context hoạt động thế nào với Server Components trong Next.js App Router? Vì sao provider thường phải đánh dấu `use client`?**

<details className="qa">
<summary>Xem đáp án</summary>

**Server Components không dùng được Context.** Chúng chạy một lần trên server, render ra kết quả rồi thôi — không có state, không có hook, không có vòng đời. Mà Context gắn chặt với cơ chế render và subscribe ở client.

Vì vậy mọi Provider phải là **Client Component**:

```jsx
"use client";

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext value={value}>{children}</ThemeContext>;
}
```

Điểm quan trọng và hay bị hiểu nhầm: đánh dấu `use client` cho Provider **không** biến toàn bộ cây con thành client. Nếu bạn truyền Server Component vào qua prop `children`, phần đó vẫn được render trên server rồi "cắm" vào chỗ `children` — đây chính là lý do nên bọc provider ở `layout.tsx` và truyền `children` xuống, thay vì import trực tiếp các trang vào trong provider.

Với dữ liệu lấy từ server, App Router khuyến khích fetch ngay trong Server Component hoặc truyền qua props, thay vì nhét vào Context.

</details>

**18. Bạn test một component phụ thuộc Context như thế nào? Cách nào để cung cấp giá trị giả trong unit test mà không dựng cả cây app?**

<details className="qa">
<summary>Xem đáp án</summary>

Cách đơn giản nhất: **bọc component cần test bằng chính Provider** và truyền value giả, dùng option `wrapper` của React Testing Library.

```jsx
function renderWithAuth(ui, value) {
  return render(
    <AuthContext value={value}>{ui}</AuthContext>
  );
}

test("hiện tên user", () => {
  renderWithAuth(<Profile />, { user: { name: "Thuan" }, logout: jest.fn() });
  expect(screen.getByText("Thuan")).toBeInTheDocument();
});
```

Vài lưu ý thực hành:

- Viết sẵn một helper `renderWithProviders` gom mọi provider hay dùng, nhận `overrides` cho từng test — tránh lặp lại setup.
- Nếu Provider thật có side effect (gọi API khi mount), hãy dùng context object trực tiếp với value giả thay vì dựng Provider thật, hoặc mock module chứa Provider.
- Test **custom hook** bằng `renderHook` kèm `wrapper` là Provider; nhớ test luôn nhánh `throw` khi dùng ngoài Provider.
- Ưu tiên test hành vi người dùng nhìn thấy, không test giá trị context trực tiếp.

</details>

**19. Một trang bị lag vì Context re-render diện rộng. Mô tả quy trình bạn dùng để chẩn đoán (React DevTools Profiler, `why-did-you-render`) và các bước tối ưu theo thứ tự ưu tiên.**

<details className="qa">
<summary>Xem đáp án</summary>

**Chẩn đoán trước, tối ưu sau** — đừng đoán.

1. **React DevTools Profiler** — ghi lại một tương tác bị lag, xem biểu đồ flamegraph: component nào render, render bao lâu, và quan trọng nhất là cột "Why did this render?" (bật trong Settings). Nếu lý do là *"Context changed"* thì đã xác định đúng thủ phạm.
2. **Bật "Highlight updates when components render"** để thấy trực quan vùng nào nhấp nháy mỗi lần gõ phím.
3. **`why-did-you-render`** (hoặc log trong dev) để bắt các re-render do tham chiếu đổi mà nội dung không đổi.

Thứ tự tối ưu:

1. **`useMemo` cho `value` của Provider** (kèm `useCallback` cho các hàm bên trong) — rẻ nhất, sửa ngay được lỗi object literal.
2. **Chia nhỏ context** theo concern và tần suất cập nhật; tách state/dispatch thành hai context.
3. **Thu hẹp phạm vi Provider** — đặt nó ở nhánh thật sự cần, không đặt ở gốc app.
4. **Truyền `children` từ ngoài vào** để phần cây con không render lại; dùng `React.memo` cho các nhánh con nặng.
5. **Đổi sang store có selector** (Zustand/Jotai) hoặc tách server state sang TanStack Query — khi các bước trên không đủ.

Sau mỗi bước, đo lại bằng Profiler để xác nhận có cải thiện thật.

</details>

---

## 2. State Management Libraries

Bài học: [2. State Management Libraries](../../react/08-state-management/2_libraries.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Vì sao cần thư viện quản lý state khi React đã có `useState` và Context? Nêu những hạn chế cụ thể mà thư viện giải quyết.**

<details className="qa">
<summary>Xem đáp án</summary>

Context sinh ra để **truyền dữ liệu xuyên cây** (tránh prop drilling), không phải để tối ưu re-render. Hạn chế cụ thể:

- **Re-render lan rộng** — Context so sánh `value` theo tham chiếu. Một object `{ user, cart, theme }` tạo mới mỗi render khiến *mọi* consumer re-render dù chỉ `cart` đổi.
- **Provider hell** — muốn tách nhỏ phải lồng nhiều Provider.
- **Thiếu hạ tầng** — không có DevTools, middleware, persist sẵn; logic cập nhật rải rác trong nhiều `useState` nên khó trace.
- **Khó dùng ngoài React** — không đọc/ghi state từ utility hay event handler toàn cục được.

Thư viện state giải đúng các điểm này: subscribe theo **selector/atom** nên chỉ component cần đúng mẩu dữ liệu mới re-render; store tập trung có kỷ luật cập nhật; kèm middleware (persist, devtools, immer); và có API kiểu `useStore.getState()` gọi được bên ngoài component.

</details>

**2. Phân biệt ba loại state: `server state`, `URL state`, `client state`. Mỗi loại nên dùng công cụ nào và vì sao lẫn lộn chúng lại sinh bug?**

<details className="qa">
<summary>Xem đáp án</summary>

| Loại | Mô tả | Công cụ |
|---|---|---|
| **Server state** | Dữ liệu thuộc sở hữu của server (user, posts, products) | **TanStack Query**, SWR, RTK Query |
| **URL state** | Filter, page, search — thứ cần chia sẻ được bằng link | `useSearchParams` của React Router |
| **Client state** | UI state: modal mở/đóng, theme, form nháp | `useState`, Zustand, Jotai |

Vì sao lẫn lộn sinh bug: server state vốn là **bản sao có thể lỗi thời** của dữ liệu ở nơi khác, nên nó cần cache key, refetch, stale time, retry, deduplicate request. Nhét nó vào Redux/Zustand nghĩa là bạn phải tự viết lại toàn bộ những thứ đó — kết quả thường là dữ liệu cũ hiển thị mãi, hai component fetch trùng, hoặc quên invalidate sau khi mutate. Ngược lại, nhét filter vào store thay vì URL làm mất khả năng share link, back/forward và F5 mất trạng thái.

</details>

**3. Câu kinh điển: khi nào Context là đủ, khi nào cần Redux hoặc Zustand? Nêu các dấu hiệu cho thấy đã đến lúc phải đổi.**

<details className="qa">
<summary>Xem đáp án</summary>

**Context là đủ** khi state đổi **hiếm** và **đọc nhiều**: theme, locale, thông tin user đã đăng nhập, giá trị cấu hình. Số consumer ít, cây không sâu.

**Cần state manager** khi xuất hiện các dấu hiệu:

- State đổi liên tục (mỗi phím gõ, mỗi tick) mà nhiều subtree cùng đọc → re-render lan rộng, phải nhét `memo` khắp nơi.
- Bạn bắt đầu tách Context thành 3–4 Provider lồng nhau chỉ để giảm re-render.
- Logic cập nhật phức tạp (cart, checkout, multi-step form) rải rác qua nhiều `useState` và khó trace.
- Cần persist vào `localStorage`, cần time-travel debug, cần middleware.
- Cần đọc/ghi state từ ngoài React.

Đi theo tiến trình tự nhiên: `useState` → lift state up → Context → state manager. Hầu hết app dừng ở bước 2–3; nhảy thẳng lên bước 4 từ ngày đầu là over-engineer.

</details>

**4. Mô tả luồng dữ liệu `Flux` trong Redux: `action` → `reducer` → `store` → `view`. Vì sao luồng một chiều giúp debug dễ hơn?**

<details className="qa">
<summary>Xem đáp án</summary>

Luồng khép kín một chiều:

1. **View** phát ra `dispatch(action)` — action chỉ là object mô tả *chuyện gì đã xảy ra*, ví dụ `{ type: "cart/addItem", payload: item }`.
2. **Reducer** nhận `(state cũ, action)` và trả về **state mới** — thuần, không sửa state cũ.
3. **Store** lưu state mới và thông báo cho các subscriber.
4. **View** đọc qua `useSelector` và re-render.

Vì sao dễ debug: chỉ có **một đường duy nhất** để state thay đổi. Muốn biết vì sao dữ liệu sai, bạn không phải truy ngược hàng chục `setState` rải rác — chỉ cần nhìn danh sách action theo thứ tự thời gian. Mỗi action là một điểm chụp ảnh, và vì state bất biến nên state cũ vẫn còn nguyên để so sánh. Đó cũng chính là nền móng cho time-travel debugging.

</details>

**5. Redux Toolkit khác Redux thuần ở những điểm nào? `createSlice`, `configureStore` và `Immer` loại bỏ được bao nhiêu boilerplate?**

<details className="qa">
<summary>Xem đáp án</summary>

Redux thuần bắt bạn tự viết: hằng số action type, action creator, reducer với `switch`, spread lồng nhau để giữ tính bất biến, rồi `createStore` + `applyMiddleware` + `composeWithDevTools` thủ công.

RTK gộp lại:

- `createSlice` sinh **cả action type, action creator lẫn reducer** từ một object duy nhất — ba file thường gộp còn một.
- `configureStore` bật sẵn `redux-thunk`, DevTools, và middleware cảnh báo khi bạn mutate state hoặc nhét giá trị không serialize được.
- **Immer** nhúng sẵn nên viết `state.count++` được, khỏi spread nhiều tầng.

```js
const slice = createSlice({
  name: "counter",
  initialState: { count: 0 },
  reducers: { increment: (s) => { s.count++; } },
});
// slice.actions.increment() và slice.reducer đều có sẵn
```

Thực tế cắt được khoảng 60–75% dòng code so với Redux thuần. RTK là cách viết Redux **chính thức được khuyến nghị** hiện nay.

</details>

**6. Reducer trong Redux phải là hàm thuần (`pure function`). Điều đó nghĩa là gì và vi phạm nó gây hậu quả gì cho time-travel debugging?**

<details className="qa">
<summary>Xem đáp án</summary>

**Hàm thuần** nghĩa là: cùng `(state, action)` đầu vào thì luôn cho cùng kết quả, và **không gây side effect** — không gọi API, không đọc `Date.now()`/`Math.random()`, không ghi `localStorage`, không sửa trực tiếp state cũ.

Hậu quả khi vi phạm:

- **Time-travel không còn đúng.** DevTools tua lại bằng cách **chạy lại** chuỗi action từ state khởi tạo. Nếu reducer dùng `Date.now()`, mỗi lần replay ra một state khác — ảnh chụp không khớp thực tế.
- **Mutate state cũ** khiến `useSelector` so sánh tham chiếu thấy "không đổi" → UI không cập nhật; đồng thời các snapshot cũ bị hỏng vì chúng trỏ chung một object.
- Side effect bị **chạy lại** mỗi lần replay (gửi request trùng, ghi đè storage).

Cách đúng: đẩy mọi thứ không thuần ra thunk/middleware, và truyền giá trị như timestamp vào qua `action.payload`.

</details>

**7. Immer cho phép viết code trông như `mutate` trực tiếp state. Cơ chế bên dưới hoạt động ra sao và có bẫy nào cần tránh?**

<details className="qa">
<summary>Xem đáp án</summary>

Immer bọc state gốc trong một **`Proxy`** gọi là `draft`. Mọi thao tác ghi lên draft đều bị chặn lại và ghi nhận, không chạm vào state gốc. Cuối hàm, Immer dựng state mới bằng **structural sharing**: chỉ những nhánh thật sự bị sửa mới được sao chép, phần còn lại tái sử dụng nguyên tham chiếu — nên vừa viết ngắn vừa giữ bất biến và giữ được tối ưu so sánh tham chiếu.

Các bẫy thường gặp:

- **Vừa mutate vừa `return`** trong cùng một reducer → Immer báo lỗi. Chọn một trong hai.
- **Giữ draft ra ngoài** phạm vi producer (gán vào biến toàn cục, dùng trong callback bất đồng bộ) — draft bị "revoke" sau khi xong.
- **Thay cả state** bằng `state = newValue` không có tác dụng; phải `return newValue`.
- State chứa `Map`/`Set` cần bật `enableMapSet()`; class instance hay object không phải plain object thì Immer không xử lý.

</details>

**8. Zustand không cần `Provider`. Điều đó khả thi nhờ cơ chế nào, và nó tạo ra vấn đề gì với `SSR` hoặc test cần state cô lập?**

<details className="qa">
<summary>Xem đáp án</summary>

`create()` tạo một store **ở cấp module** — một closure giữ state, kèm `setState`, `getState` và `subscribe`. Hook chỉ việc đăng ký vào store đó (qua `useSyncExternalStore`) rồi chạy selector. Vì store sống ngoài cây React nên không cần Provider để "bơm" giá trị xuống.

Cái giá là store thành **singleton toàn module**:

- **SSR** — trên server, module được chia sẻ giữa các request. Store singleton khiến dữ liệu của người dùng A có thể rò sang request của người dùng B, và state còn sót lại giữa các lần render.
- **Test** — các test case dùng chung một store, chạy theo thứ tự khác nhau là kết quả khác nhau.

Cách khắc phục: dùng **store factory** — viết `createStore()` trả về store mới, tạo một instance cho mỗi request rồi truyền xuống bằng Context; trong test thì reset về state ban đầu ở `beforeEach`.

</details>

**9. Zustand tối ưu re-render bằng `selector`. Vì sao `useStore(s => ({ a: s.a, b: s.b }))` có thể gây re-render vô hạn, và `shallow` giải quyết ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Zustand quyết định có re-render hay không bằng cách so sánh kết quả selector của lần trước và lần này, mặc định dùng `Object.is`. Selector trên **tạo một object mới mỗi lần chạy**, nên `Object.is(prev, next)` luôn `false` → luôn coi là "đã đổi". Với `useSyncExternalStore`, snapshot không ổn định như vậy khiến React render lại rồi lại thấy khác → vòng lặp không dừng (kèm cảnh báo "getSnapshot should be cached").

Cách xử lý:

```js
import { useShallow } from "zustand/react/shallow";

// Tách từng field — đơn giản và an toàn nhất
const a = useStore((s) => s.a);
const b = useStore((s) => s.b);

// Hoặc so sánh nông
const { a, b } = useStore(useShallow((s) => ({ a: s.a, b: s.b })));
```

`shallow` so sánh **từng key một cấp** thay vì so tham chiếu, nên object mới nhưng cùng nội dung được coi là không đổi.

</details>

**10. So sánh mô hình atomic của Jotai với mô hình store tập trung của Zustand. Kịch bản nào Jotai thắng rõ rệt?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Jotai (atomic) | Zustand (store tập trung) |
|---|---|---|
| Đơn vị state | Nhiều `atom` nhỏ, độc lập | Một object store, cắt bằng selector |
| Cách subscribe | Tự động theo atom được đọc | Thủ công qua selector |
| Derived state | `atom(get => ...)`, tự theo dõi phụ thuộc | Tự viết selector, tự memo |
| Tổ chức | Atom rải theo feature | Store + slices |
| Provider | Có (tùy chọn, dùng để cô lập scope) | Không cần |

Jotai thắng rõ khi state **phân mảnh và độc lập, đổi rất thường xuyên**:

- **Form lớn hàng chục field** — mỗi field một atom, gõ vào field này không đụng field kia.
- **Dữ liệu real-time** nhiều nguồn cập nhật liên tục.
- **Chuỗi giá trị dẫn xuất** nhiều tầng — derived atom tự tính lại đúng nhánh phụ thuộc, không phải tự quản memo.

Zustand hợp hơn khi state là một khối nghiệp vụ gắn kết (cart, auth) với các action rõ ràng.

</details>

**11. `derived atom` trong Jotai hoạt động thế nào? So sánh với `createSelector`/`reselect` của Redux về mặt memoization.**

<details className="qa">
<summary>Xem đáp án</summary>

Derived atom nhận một hàm đọc với tham số `get`:

```js
const countAtom = atom(0);
const doubleAtom = atom((get) => get(countAtom) * 2);
```

Jotai **tự ghi nhận** những atom nào được `get` trong lúc tính, dựng thành đồ thị phụ thuộc. Khi `countAtom` đổi, chỉ `doubleAtom` và các component đọc nó được tính lại; giá trị được cache trong store cho tới khi phụ thuộc đổi.

So với `reselect`:

| | Derived atom (Jotai) | `createSelector` (reselect) |
|---|---|---|
| Khai báo phụ thuộc | Ngầm, tự phát hiện khi chạy | Tường minh, liệt kê input selector |
| Phạm vi cache | Theo store/Provider | Mặc định cache kích thước 1 |
| Rủi ro | Phụ thuộc động khó nhìn ra bằng mắt | Dùng chung một selector cho nhiều component khác tham số → cache liên tục miss, phải tạo selector theo instance |

Về bản chất cả hai đều là memo hóa giá trị dẫn xuất; Jotai làm việc đó tự động, reselect làm thủ công nhưng minh bạch hơn.

</details>

**12. MobX theo dõi dependency tự động qua proxy. Ưu điểm và nhược điểm của cách tiếp cận ngầm này so với subscribe tường minh bằng selector?**

<details className="qa">
<summary>Xem đáp án</summary>

MobX bọc state bằng proxy: khi component `observer` render và đọc `counter.count`, MobX ghi lại "component này phụ thuộc field này". Ghi vào field đó sau này chỉ báo cho đúng những observer đã đọc nó.

**Ưu điểm**

- Viết JS/OOP bình thường, mutate trực tiếp, không cần action hay spread.
- Độ mịn rất cao và **miễn phí** — không phải tự nghĩ ra selector đúng, khó viết sai dẫn tới re-render thừa.
- Rất hợp state có quan hệ phức tạp: model, relationship, editor, game.

**Nhược điểm**

- **Ngầm nên khó suy luận** — nhìn code không biết ngay cái gì kích hoạt cái gì; quên bọc `observer` là component im lặng không cập nhật.
- Dễ mất tracking khi destructure giá trị ra khỏi observable, hoặc đọc trong hàm bất đồng bộ ngoài `reaction`.
- Không có dòng lịch sử action bất biến → khó time-travel, khó review luồng thay đổi.
- Proxy thêm một lớp ma thuật, khó debug với người mới.

</details>

**13. Redux DevTools cho time-travel. Cơ chế nào khiến điều đó khả thi, và vì sao Zustand hay MobX khó đạt mức tương đương?**

<details className="qa">
<summary>Xem đáp án</summary>

Time-travel dựa trên ba điều kiện mà Redux ép buộc:

- **Mọi thay đổi đều là một action tuần tự**, serialize được và có `type` mô tả rõ ràng.
- **Reducer thuần** — chạy lại cùng chuỗi action từ state khởi tạo luôn cho ra cùng state.
- **State bất biến** — mỗi bước là một snapshot riêng, state cũ không bị ghi đè nên giữ lại được cả lịch sử.

Có đủ ba thứ đó, DevTools chỉ cần lưu danh sách action và phát lại từ đầu tới bước bất kỳ.

Zustand có middleware `devtools` nên xem được state đổi, nhưng `set()` mặc định **không mang tên action** và không bị ràng buộc phải thuần, nên lịch sử kém ý nghĩa hơn (phải tự đặt tên cho từng lần set). MobX thì **mutate tại chỗ** observable — không có chuỗi action bất biến để replay; công cụ của MobX thiên về xem reaction/dependency hơn là tua lại lịch sử.

</details>

**14. `middleware` trong Redux là gì? Mô tả chữ ký hàm ba tầng và một ca dùng thực tế như logging hoặc retry.**

<details className="qa">
<summary>Xem đáp án</summary>

Middleware là lớp chen giữa `dispatch` và reducer, cho phép chặn, sửa, hoãn hay nhân bản action. Chữ ký ba tầng:

```js
const logger = (store) => (next) => (action) => {
  console.group(action.type);
  console.log("trước:", store.getState());
  const result = next(action); // chuyển tiếp cho middleware kế / reducer
  console.log("sau:", store.getState());
  console.groupEnd();
  return result;
};
```

Ba tầng tương ứng ba thứ cần đóng gói: `store` (truy cập `getState`/`dispatch`), `next` (mắt xích kế tiếp trong chuỗi), `action` (thứ đang đi qua). Các middleware nối thành chuỗi — gọi `next` là đi tiếp, không gọi là chặn đứng action đó.

Ca dùng thực tế: logging, gắn analytics, chặn action khi chưa đăng nhập, gộp (debounce) action gõ phím, và **retry** — bắt action thất bại rồi tự `dispatch` lại sau một khoảng chờ, tăng dần số lần thử.

</details>

**15. So sánh `redux-thunk`, `redux-saga` và `listener middleware` cho xử lý bất đồng bộ. Khi nào chi phí học saga là xứng đáng?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `redux-thunk` | `redux-saga` | `listener middleware` |
|---|---|---|---|
| Cách viết | Dispatch một hàm, viết `async/await` bình thường | Generator + hiệu ứng khai báo (`call`, `put`, `takeLatest`) | Đăng ký listener theo điều kiện/action |
| Học | Rất dễ | Khó nhất | Dễ vừa |
| Hủy tác vụ | Tự lo | Có sẵn, rất mạnh | Có (`AbortSignal`, `takeLatest` tương đương) |
| Test | Phải mock API | Rất dễ — generator trả về mô tả, so sánh trực tiếp | Trung bình |
| Kích thước | Siêu nhẹ, bật sẵn trong RTK | Nặng nhất | Nhẹ, nằm trong RTK |

Mặc định nên dùng thunk; khi cần phối hợp phức tạp thì dùng listener middleware — đây là thứ RTK khuyến nghị thay cho saga trong đa số trường hợp.

Saga xứng đáng khi bài toán thật sự là **luồng dài hạn**: chuỗi tác vụ nhiều bước có thể bị hủy giữa chừng, polling/websocket kèm backoff, race giữa nhiều nguồn sự kiện, hoặc khi đội đã có sẵn kinh nghiệm và một codebase saga lớn.

</details>

**16. `RTK Query` và `TanStack Query` chồng lấn nhau ở đâu? Nếu đã dùng Redux Toolkit, bạn chọn cái nào và vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Cả hai giải cùng một bài toán **server state**: cache theo key, dedupe request trùng, loading/error state, refetch khi stale hoặc khi focus lại cửa sổ, invalidate sau mutation, retry. Phần chồng lấn gần như hoàn toàn — dùng cả hai cùng lúc cho cùng một nguồn dữ liệu là dư thừa và dễ lệch cache.

Khác biệt chính:

- **RTK Query** nằm trong Redux Toolkit, cache sống trong Redux store nên thấy được trong Redux DevTools cùng chuỗi action; định nghĩa endpoint tập trung, sinh sẵn hook; `invalidatesTags`/`providesTags` khai báo quan hệ dữ liệu.
- **TanStack Query** độc lập với thư viện state, API linh hoạt hơn, hỗ trợ infinite query, optimistic update và devtools riêng tốt; không phụ thuộc Redux.

Nếu dự án **đã dùng RTK**, chọn **RTK Query** — không thêm dependency, chung một DevTools, chung một mô hình tư duy. Chọn TanStack Query khi không dùng Redux, hoặc khi cần các tính năng nâng cao và hệ sinh thái rộng hơn của nó.

</details>

**17. Bạn `persist` state vào `localStorage` như thế nào? Xử lý ra sao khi schema đổi giữa các phiên bản app (migration, versioning)?**

<details className="qa">
<summary>Xem đáp án</summary>

Zustand có middleware `persist` làm sẵn việc đọc/ghi và hydrate:

```js
const useStore = create(
  persist(
    (set) => ({ user: null, token: null, theme: "light" }),
    {
      name: "app-store",
      version: 2,
      partialize: (s) => ({ theme: s.theme }), // chỉ lưu phần cần
      migrate: (old, from) => (from < 2 ? { theme: old.mode } : old),
    }
  )
);
```

Những điểm phải lưu ý:

- **Chỉ persist thứ cần** — dùng `partialize`. Đừng lưu token hay dữ liệu nhạy cảm vào `localStorage`.
- **Versioning** — mỗi lần đổi hình dạng state thì tăng `version`; `migrate` nhận state cũ và số version cũ để chuyển đổi. Không có migration, người dùng cũ sẽ hydrate ra state lệch schema và app crash.
- **Validate dữ liệu đọc lên** — nội dung `localStorage` có thể bị sửa tay hoặc hỏng; parse lỗi thì bỏ qua và quay về giá trị mặc định.
- **SSR** — chờ hydrate xong mới render phần phụ thuộc, tránh lệch giữa HTML server và client.

</details>

**18. Store toàn cục và `SSR`/Next.js: vì sao store dạng singleton nguy hiểm trên server, và cách khắc phục là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Trên trình duyệt, mỗi người dùng có một tiến trình riêng nên store singleton ở cấp module là an toàn. Trên server thì ngược lại: **một tiến trình Node phục vụ mọi request**, module chỉ được nạp một lần. Store singleton do đó bị **chia sẻ giữa các request** — dữ liệu người dùng A còn sót lại và có thể lộ sang trang render cho người dùng B, hoặc state của request trước làm bẩn request sau. Đây là lỗi bảo mật thật sự, không chỉ là bug hiển thị.

Cách khắc phục: **tạo store mới cho mỗi request** bằng factory, rồi đưa xuống cây bằng Context:

```jsx
const createAppStore = (initState) => createStore(() => ({ ...initState }));

function StoreProvider({ initState, children }) {
  const storeRef = useRef(null);
  if (!storeRef.current) storeRef.current = createAppStore(initState);
  return <Ctx.Provider value={storeRef.current}>{children}</Ctx.Provider>;
}
```

Kèm theo: truyền state khởi tạo từ server xuống để hydrate, và đảm bảo lần render đầu ở client khớp HTML của server để tránh hydration mismatch.

</details>

**19. Bạn migrate dần từ Redux sang Zustand trong một codebase lớn đang chạy production như thế nào mà không phải dừng phát triển tính năng?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên tắc: **không big-bang rewrite**, cho hai hệ cùng tồn tại một thời gian.

1. **Đóng băng chiều mở rộng** — ra quy ước: tính năng mới viết bằng Zustand, Redux chỉ sửa lỗi.
2. **Tách server state ra trước** — phần lớn Redux trong dự án cũ thực ra là cache API. Chuyển sang TanStack Query/RTK Query thường xóa được nửa store mà không đụng tới Zustand.
3. **Migrate theo slice, không theo màn hình** — chọn slice ít phụ thuộc nhất (theme, UI flags) làm trước để chạy thử quy trình.
4. **Bọc bằng hook trung gian** — component chỉ gọi `useCart()`; bên trong hook đổi từ `useSelector` sang Zustand, component không phải sửa. Đây là chỗ giảm rủi ro nhiều nhất.
5. **Đồng bộ tạm thời nếu cần** — trong lúc giao thời, `subscribe` một chiều từ store nguồn sang store đích để hai bên không lệch; gỡ ngay khi slice cuối cùng chuyển xong.
6. **Có test bao quanh** trước khi đụng vào từng slice, và gỡ Redux Provider ở bước cuối.

</details>

**20. Đội bạn đề xuất đưa Redux vào một app CRUD nhỏ. Bạn phản biện hay đồng ý? Trình bày lập luận dựa trên chi phí và lợi ích cụ thể.**

<details className="qa">
<summary>Xem đáp án</summary>

Mặc định là **phản biện**, nhưng bằng câu hỏi chứ không bằng thành kiến: state chia sẻ thật sự là những gì? Có cần time-travel, middleware đặc biệt, hay RTK Query không? Đội đã quen Redux chưa?

**Chi phí** với một app CRUD nhỏ:

- Bundle lớn hơn (~10KB so với ~1KB của Zustand), thêm Provider và cấu trúc thư mục.
- Boilerplate và learning curve cho người mới.
- Nguy cơ lớn nhất: **nhét server state vào Redux** — tự viết lại cache, loading, refetch, invalidate, vốn là nguồn bug phổ biến nhất trong các dự án kiểu này.

**Lợi ích** chỉ thực sự xuất hiện khi app đủ lớn: kỷ luật cho nhiều người cùng làm, DevTools mạnh, hệ middleware phong phú.

**Đề xuất thay thế:** TanStack Query (hoặc RTK Query) cho dữ liệu API + `useState`/Context cho UI state — thường là xong. Nếu vẫn còn client state dùng chung, thêm Zustand. Và nếu đội đã thạo Redux, đã có sẵn quy ước thì RTK cũng là lựa chọn hợp lý — quan trọng là quyết định dựa trên nhu cầu thực tế, không phải theo thói quen.

</details>

---

## 3. Redux & Redux Toolkit

Bài học: [3. Redux & Redux Toolkit](../../react/08-state-management/3_redux.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Nêu ba nguyên tắc của Redux và giải thích vì sao reducer bắt buộc phải là hàm thuần.**

<details className="qa">
<summary>Xem đáp án</summary>

Ba nguyên tắc:

1. **Single source of truth** — state dùng chung nằm trong một store.
2. **State is read-only** — chỉ đổi được bằng cách dispatch action.
3. **Changes are made with pure functions** — reducer `(state, action) => newState`.

Reducer phải thuần (cùng input luôn ra cùng output, không side effect, không sửa input) vì:

- **So sánh tham chiếu**: `useSelector` và React phát hiện thay đổi bằng `===`. Nếu reducer sửa trực tiếp object cũ, tham chiếu không đổi, UI không cập nhật.
- **Time-travel và replay**: DevTools tính lại state bằng cách chạy lại chuỗi action. Reducer có `Date.now()` hay gọi API thì chạy lại sẽ ra kết quả khác.
- **Test dễ**: truyền state + action, kiểm tra output, không cần mock.

</details>

**2. Redux Toolkit giải quyết những vấn đề gì của Redux thuần?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Boilerplate**: `createSlice` sinh action type + action creator + reducer từ một khai báo, thay cho hằng string, hàm tạo action và switch-case viết tay.
- **Cập nhật bất biến khó viết**: Immer cho phép viết kiểu "mutate", tự sinh object mới.
- **Cấu hình store rườm rà**: `configureStore` gộp reducer, cài thunk, bật DevTools, thêm middleware bắt lỗi mutate và non-serializable ở dev.
- **Async**: `createAsyncThunk` tự dispatch `pending/fulfilled/rejected`.
- **Fetch dữ liệu**: RTK Query thay cho việc tự viết cache, loading, refetch trong slice.

</details>

**3. Trong `createSlice`, vì sao viết `state.count++` mà không vi phạm tính bất biến?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì `state` trong reducer của slice là **draft** của Immer, không phải state thật. Immer dùng Proxy để ghi lại mọi thao tác trên draft, sau khi reducer chạy xong thì tạo ra một object **mới** chứa thay đổi; các nhánh không đổi được giữ nguyên tham chiếu (structural sharing). State cũ không bị đụng tới.

Lưu ý: chỉ đúng bên trong reducer của `createSlice`/`createReducer`. Và không được vừa sửa draft vừa `return` giá trị mới trong cùng một reducer.

</details>

**4. `useSelector` quyết định re-render thế nào? Vì sao selector trả về `state.items.filter(...)` gây vấn đề hiệu năng và sửa ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Sau mỗi `dispatch`, `useSelector` chạy lại selector và so sánh kết quả mới với kết quả cũ bằng `===`. Khác thì re-render, giống thì bỏ qua.

`filter()` luôn trả về **mảng mới**, nên `===` luôn `false` → component re-render sau **mọi** action, kể cả action của slice không liên quan.

Cách sửa:

- Dùng `createSelector` để memo: chỉ tính lại khi đầu vào (`state.items`) đổi tham chiếu, ngược lại trả lại mảng cũ.
- Khi cần nhiều giá trị, tách thành nhiều `useSelector` thay vì trả về object literal.
- Truyền `shallowEqual` làm tham số thứ hai của `useSelector` khi kết quả là object phẳng.

</details>

**5. So sánh `useSelector` của Redux với `useContext` về cơ chế re-render.**

<details className="qa">
<summary>Xem đáp án</summary>

- **`useContext`**: khi `value` của Provider đổi tham chiếu, **mọi** component gọi `useContext` đó đều re-render, không có cách chỉ lấy một phần.
- **`useSelector`**: component đăng ký (subscribe) vào store và chỉ re-render khi **kết quả selector của chính nó** thay đổi.

Vì vậy với state đổi thường xuyên và nhiều nơi đọc các phần khác nhau, Redux hiệu quả hơn Context. Ngoài ra `react-redux` dùng `useSyncExternalStore` nên không bị lỗi "tearing" (các component đọc ra state lệch nhau) khi render đồng thời (concurrent rendering).

</details>

**6. `createAsyncThunk` hoạt động thế nào? Vì sao không gọi API trong reducer?**

<details className="qa">
<summary>Xem đáp án</summary>

`createAsyncThunk(type, payloadCreator)` trả về một thunk. Khi dispatch:

1. Dispatch `type/pending`.
2. Chạy `payloadCreator` (hàm async, thường gọi API).
3. Resolve → dispatch `type/fulfilled` với payload là kết quả. Reject hoặc `rejectWithValue` → dispatch `type/rejected`.

Slice xử lý ba action này trong `extraReducers` để cập nhật `status`, `data`, `error`.

Không gọi API trong reducer vì reducer phải **đồng bộ và thuần**: nó phải trả state mới ngay lập tức, và chạy lại cùng input phải ra cùng kết quả. Gọi API là side effect, bất đồng bộ, kết quả thay đổi theo thời gian.

</details>

**7. Khi nào dùng RTK Query thay vì `createAsyncThunk`?**

<details className="qa">
<summary>Xem đáp án</summary>

**RTK Query** cho **server state** kiểu đọc/ghi CRUD thông thường: danh sách, chi tiết, tạo/sửa/xoá. Nó tự lo cache theo tham số, dedupe request trùng, refetch khi focus lại hoặc reconnect, polling, invalidate theo tag sau mutation, xoá cache khi không còn component dùng.

**`createAsyncThunk`** cho luồng async **không phải "fetch và cache"**: quy trình nhiều bước (checkout: tạo đơn → thanh toán → cập nhật kho), logic cần đọc và ghi nhiều slice, hoặc tác vụ một lần như đăng nhập rồi lưu token.

Dùng thunk để tự viết cache API là làm lại những gì RTK Query đã có, và thường sinh bug dữ liệu cũ.

</details>

**8. Middleware trong Redux là gì? Cho ví dụ và so sánh listener middleware với redux-saga.**

<details className="qa">
<summary>Xem đáp án</summary>

Middleware là hàm dạng `store => next => action => {...}`, chen giữa `dispatch` và reducer. Nó có thể log, biến đổi, chặn action, hoặc chạy side effect. Ví dụ: `thunk` (cho phép dispatch hàm), logger, middleware của RTK Query, middleware đồng bộ localStorage.

**Listener middleware** (có sẵn trong RTK) cho phép "khi action X xảy ra thì chạy effect Y", hỗ trợ async/await, huỷ task, debounce. **redux-saga** dùng generator function, mạnh cho luồng rất phức tạp (race, fork, cancel lồng nhau) nhưng học khó và thêm dependency. Với đa số app hiện nay, listener middleware + RTK Query là đủ; saga chủ yếu còn trong dự án cũ.

</details>

**9. Cái gì nên và không nên đưa vào Redux store?**

<details className="qa">
<summary>Xem đáp án</summary>

**Nên:** client state dùng chung ở nhiều nơi xa nhau và cần tồn tại khi chuyển trang: user/session, giỏ hàng, cài đặt người dùng, trạng thái wizard nhiều bước.

**Không nên:**

- State chỉ một component dùng (input đang gõ, dropdown mở/đóng) → `useState`.
- Dữ liệu API → RTK Query/TanStack Query (vẫn nằm trong store nếu dùng RTK Query, nhưng do nó quản lý, bạn không viết tay).
- Filter, page, search cần share bằng link → URL.
- Giá trị không serialize được (Date, Map, Promise, DOM node, function).
- Dữ liệu dẫn xuất → tính bằng selector.

</details>

**10. Redux còn đáng dùng trong năm nay khi đã có Zustand, TanStack Query và Server Components không?**

<details className="qa">
<summary>Xem đáp án</summary>

Có, nhưng phạm vi hẹp hơn trước. Nhiều thứ trước đây nhét vào Redux giờ có công cụ chuyên biệt: dữ liệu server → TanStack Query hoặc fetch ở Server Components; state toàn cục đơn giản → Zustand.

Redux Toolkit vẫn hợp lý khi: codebase lớn và đội đông cần kỷ luật chặt; cần DevTools time-travel và middleware mạnh; muốn một bộ thống nhất cả client state lẫn server state (RTK + RTK Query); hoặc dự án đã dùng Redux, vì migrate tốn kém mà lợi ích không rõ.

Câu trả lời tốt trong phỏng vấn là không cực đoan: nêu được **đánh đổi** (bundle, boilerplate, learning curve với kỷ luật, DevTools, ecosystem) và chọn theo nhu cầu thực tế của dự án.

</details>
