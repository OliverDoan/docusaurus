---
sidebar_position: 17
title: "17. Advanced Topics"
---

# 17. Advanced Topics

## 1. Error Boundaries và Suspense

Bài học: [1. Error Boundaries và Suspense](../../react/17-advanced-topics/1_error-boundaries-suspense.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Error Boundary là gì và nó giải quyết vấn đề gì mà `try/catch` thông thường không làm được?**

<details className="qa">
<summary>Xem đáp án</summary>

**Error Boundary** là component (class) bắt lỗi xảy ra **khi render** của cả cây con bên dưới nó, rồi hiển thị fallback UI thay vì để React unmount toàn bộ app thành màn hình trắng.

`try/catch` không thay thế được vì:

- Render trong React là **khai báo**. Bạn viết `<Profile user={user} />`, chứ không gọi trực tiếp hàm render của nó — không có chỗ nào để đặt `try/catch` bao quanh việc React dựng cây con.
- `try/catch` chỉ bao được một đoạn code **đồng bộ trong cùng một hàm**, còn lỗi ở đây có thể nằm ở bất kỳ component nào sâu vài chục tầng.
- Ngay cả khi bắt được, `try/catch` cũng không biết phải **thay thế phần UI nào**; Error Boundary thì có state riêng nên biết đúng vùng nào cần chuyển sang fallback.

Từ React 16, lỗi render không được bắt sẽ làm React unmount cả cây — vì vậy Error Boundary gần như là bắt buộc trong app production.

</details>

**2. Vì sao đến nay Error Boundary vẫn phải viết bằng class component? `getDerivedStateFromError` và `componentDidCatch` khác nhau ra sao về vai trò?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì React **chưa cung cấp hook tương đương**: cơ chế bắt lỗi dựa vào hai lifecycle chỉ tồn tại ở class. Trong function component không có chỗ nào để React "chen vào" giữa lúc con throw và lúc cha render lại. Thực tế thì hầu như không ai tự viết nữa — dùng `react-error-boundary` là xong.

| | `getDerivedStateFromError` | `componentDidCatch` |
|---|---|---|
| Kiểu | `static`, thuần khiết | method của instance |
| Giai đoạn | Render phase | Commit phase (sau khi đã render fallback) |
| Việc làm | Trả về state mới, ví dụ `{ hasError: true }` để chuyển sang fallback | Chạy side effect: log lỗi về server/monitoring |
| Side effect | Không được phép | Được phép |

```tsx
static getDerivedStateFromError() {
  return { hasError: true };
}

componentDidCatch(error: Error, info: React.ErrorInfo) {
  logErrorToService(error, info);
}
```

Chia đôi như vậy vì render phase có thể bị React chạy lại nhiều lần, nên phải thuần khiết; việc gửi log chỉ được làm một lần ở commit phase.

</details>

**3. Liệt kê các loại lỗi mà Error Boundary không bắt được và giải thích vì sao lại có giới hạn đó.**

<details className="qa">
<summary>Xem đáp án</summary>

Error Boundary **không bắt được**:

- **Lỗi trong event handler** (`onClick`, `onSubmit`...) — handler chạy *sau* khi render xong, ngoài luồng render mà React theo dõi. Dùng `try/catch` hoặc `showBoundary`.
- **Lỗi async**: callback của `setTimeout`, `.then()`, promise bị reject — cũng chạy ngoài call stack của render.
- **Lỗi của chính Error Boundary** (trong `render` hoặc trong fallback của nó) — nó không tự bắt mình được, lỗi sẽ nổi lên boundary cha.
- **Lỗi khi server-side rendering** — trên server không có cơ chế mount fallback theo kiểu client; SSR phải xử lý theo cách riêng của framework.

Lý do chung: cơ chế này gắn với **render phase của React trên client**. Mọi thứ nằm ngoài giai đoạn đó, React không quan sát được, nên không thể chuyển sang fallback.

</details>

**4. Lỗi ném ra trong event handler `onClick` xử lý thế nào? Nêu hai cách đưa lỗi đó vào Error Boundary.**

<details className="qa">
<summary>Xem đáp án</summary>

Trước hết phải tự `try/catch` trong handler, vì Error Boundary không thấy lỗi này. Sau đó, nếu muốn hiển thị fallback, có hai cách:

**Cách 1 — dùng `useErrorBoundary` của `react-error-boundary`:**

```jsx
const { showBoundary } = useErrorBoundary();

const handleSubmit = async (data) => {
  try {
    await api.send(data);
  } catch (error) {
    showBoundary(error); // đẩy lên boundary gần nhất
  }
};
```

**Cách 2 — đưa lỗi vào state rồi throw trong lúc render:**

```jsx
const [error, setError] = useState(null);
if (error) throw error; // lúc này đang ở render phase → boundary bắt được

const handleClick = () => {
  try { risky(); } catch (e) { setError(e); }
};
```

Bản chất cách 2 chính là thứ `showBoundary` làm bên trong. Lưu ý không phải lỗi nào cũng nên đẩy lên boundary — lỗi nghiệp vụ (sai mật khẩu, validate thất bại) nên hiển thị tại chỗ, chỉ lỗi thật sự bất thường mới dùng fallback.

</details>

**5. Nên đặt Error Boundary ở đâu trong cây component? So sánh chiến lược một boundary ở gốc với nhiều boundary theo từng vùng UI.**

<details className="qa">
<summary>Xem đáp án</summary>

| | Một boundary ở gốc | Nhiều boundary theo vùng |
|---|---|---|
| Phạm vi ảnh hưởng khi lỗi | Cả trang chuyển sang fallback | Chỉ vùng đó hỏng, phần còn lại vẫn dùng được |
| Công sức | Ít, đặt một lần | Phải nghĩ vùng nào rủi ro |
| Phục hồi | Thường phải reload trang | Nút "Thử lại" cho riêng widget |
| Vai trò | Lưới an toàn cuối cùng | Cô lập lỗi |

Thực tế nên **kết hợp cả hai** — boundary lồng nhau:

```jsx
<ErrorBoundary fallback={<FullPageError />}>   {/* outer */}
  <Header />
  <ErrorBoundary fallback={<SectionError />}>  {/* inner */}
    <DangerousFeature />
  </ErrorBoundary>
  <Footer />
</ErrorBoundary>
```

Lỗi trong `DangerousFeature` chỉ ảnh hưởng section đó, Header/Footer vẫn render. Boundary ngoài cùng lo những gì lọt lưới.

Ưu tiên đặt boundary quanh: mỗi route, mỗi widget độc lập (chart, feed, quảng cáo), và phần render dữ liệu từ bên thứ ba. Lưu ý boundary không bắt được lỗi của **chính parent** nó.

</details>

**6. Khi một Error Boundary bắt lỗi, React làm gì với cây con bên dưới? State của cây con còn giữ được không?**

<details className="qa">
<summary>Xem đáp án</summary>

React **unmount toàn bộ cây con** của boundary rồi render fallback vào chỗ đó. Vì vậy:

- **State của cây con mất sạch** — mọi `useState`, `useReducer`, ref, và cả state của thư viện nằm trong đó.
- `useEffect` cleanup được chạy, subscription/timer được huỷ.
- Khi bạn reset boundary, cây con được **mount lại từ đầu**, effect chạy lại, dữ liệu phải fetch lại (trừ phần nằm trong cache ở ngoài boundary).

React chọn cách "thà xoá còn hơn giữ" vì một cây UI đã lỗi giữa chừng thì trạng thái của nó không còn đáng tin — hiển thị tiếp có thể dẫn tới hành vi sai hoặc rò rỉ dữ liệu.

Hệ quả thực dụng: state nào cần sống sót qua lỗi thì phải đặt **ngoài** boundary — ở context cha, ở store (Zustand, Redux), ở cache của TanStack Query, hoặc ở URL.

</details>

**7. Trong môi trường development, vì sao lỗi vẫn hiện overlay đỏ dù đã có Error Boundary bao ngoài?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì đó **không phải React**, mà là **overlay của dev server/bundler** (Vite, Next.js, webpack dev server). Ở chế độ development, React cố tình ném lại lỗi ra ngoài để nó tới được `window.onerror`, nhờ vậy DevTools, source map và overlay đều nhìn thấy được lỗi gốc kèm stack trace đẹp. Overlay bắt sự kiện đó và vẽ màn hình đỏ đè lên app.

Điều đó **không có nghĩa là Error Boundary không chạy**: fallback vẫn đã được render bên dưới — bấm Esc hoặc đóng overlay là thấy. Ngoài ra, ở dev React còn in thêm log lỗi kèm component stack ra console.

Trên **production build**, overlay không tồn tại, người dùng chỉ thấy fallback UI. Vì vậy muốn kiểm tra trải nghiệm lỗi thật thì nên chạy bản production (`npm run build` rồi `preview`/`serve`), đừng kết luận từ màn hình đỏ ở dev.

</details>

**8. Thư viện `react-error-boundary` bổ sung những gì so với tự viết class? `resetErrorBoundary` và `resetKeys` hoạt động thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Nó gói sẵn class boundary và thêm những thứ mà tự viết sẽ phải làm lại từ đầu:

- Ba cách khai báo fallback: `fallback`, `fallbackRender`, `FallbackComponent` (nhận `error` và `resetErrorBoundary`).
- Callback `onError` (log tập trung) và `onReset`.
- Hook `useErrorBoundary` để đẩy lỗi từ event handler/async lên boundary.
- Hàm bao `withErrorBoundary` cho HOC.

```jsx
<ErrorBoundary
  FallbackComponent={FallbackRender}
  onError={(error, info) => logErrorToService(error, info)}
  onReset={() => resetState()}
  resetKeys={[userId]}
>
  <MyComponent />
</ErrorBoundary>
```

- **`resetErrorBoundary()`**: hàm truyền vào fallback, gọi khi người dùng bấm "Thử lại" — boundary xoá state lỗi và mount lại cây con, đồng thời chạy `onReset`.
- **`resetKeys`**: mảng giá trị được theo dõi; chỉ cần một phần tử đổi là boundary **tự** reset. Rất hợp cho trường hợp "đổi `userId` thì thử lại", để người dùng không phải bấm gì cả.

Nhớ rằng reset đồng nghĩa mount lại — nếu nguyên nhân lỗi chưa được xử lý thì nó sẽ lỗi lại ngay.

</details>

**9. Hook `useErrorBoundary` dùng để làm gì? Nó lấp khoảng trống nào của Error Boundary truyền thống?**

<details className="qa">
<summary>Xem đáp án</summary>

Nó lấp đúng hai lỗ hổng lớn nhất: **event handler** và **code async** — hai nơi Error Boundary không với tới được vì chúng chạy ngoài render phase.

```jsx
import { useErrorBoundary } from "react-error-boundary";

function Form() {
  const { showBoundary } = useErrorBoundary();

  const handleSubmit = async (data) => {
    try {
      await api.send(data);
    } catch (error) {
      showBoundary(error); // throw lên boundary gần nhất
    }
  };
}
```

`showBoundary(error)` lưu lỗi vào state rồi throw lại **trong lúc render**, nhờ vậy boundary gần nhất bắt được và hiển thị fallback như với lỗi render bình thường. Hook còn trả về `resetBoundary()` để tự reset từ trong component.

Khoảng trống được lấp: giờ toàn bộ lỗi — render, sự kiện, promise — đều có thể đi về **một chỗ xử lý thống nhất**, thay vì mỗi nơi một kiểu hiển thị.

</details>

**10. `Suspense` hoạt động dựa trên cơ chế nào? Mô tả việc một component 'throw' ra Promise và React phản ứng ra sao.**

<details className="qa">
<summary>Xem đáp án</summary>

Cơ chế cốt lõi: khi render, nếu component chưa có dữ liệu, nó **throw ra một Promise** thay vì throw Error. React coi đây là tín hiệu "tôi chưa sẵn sàng" chứ không phải lỗi.

Các bước:

1. React đang render cây con, gặp một component throw Promise.
2. React **dừng** việc render nhánh đó, đi ngược lên tìm `Suspense` gần nhất và render `fallback` của nó.
3. React **subscribe** vào Promise đó.
4. Khi Promise resolve, React **render lại** nhánh đó; lần này dữ liệu đã có trong cache nên component trả về UI thật, và fallback được thay bằng nội dung.
5. Nếu Promise **reject**, nó trở thành lỗi và **Error Boundary** gần nhất tiếp quản.

Ở React 19, cách viết được chuẩn hoá bằng hook `use(promise)` và bởi Server Components — bạn không tự throw Promise nữa, nhưng bên dưới vẫn là cơ chế này. Điểm mấu chốt là Promise phải đến từ **cache ổn định**, nếu không mỗi lần render lại tạo Promise mới sẽ gây vòng lặp vô tận.

</details>

**11. `React.lazy` kết hợp `Suspense` giúp code splitting thế nào? Điều gì xảy ra nếu quên bọc `Suspense`?**

<details className="qa">
<summary>Xem đáp án</summary>

`lazy(() => import("./HeavyChart"))` khiến bundler tách `HeavyChart` thành một **chunk riêng**. Chunk chỉ được tải khi component thật sự được render, nên bundle khởi động nhỏ đi và trang mở nhanh hơn:

```jsx
const HeavyChart = lazy(() => import("./HeavyChart"));

<Suspense fallback={<Spinner />}>
  <HeavyChart />
</Suspense>
```

Trong lúc chunk đang tải, component lazy suspend và `Suspense` hiện fallback; tải xong thì swap sang nội dung thật.

**Quên bọc `Suspense`** thì React không tìm được ranh giới nào để hiện fallback, và ném lỗi đại ý "A component suspended while responding to synchronous input..." / yêu cầu phải có `Suspense` bao ngoài. Trong nhiều setup, lỗi này sẽ rơi lên Error Boundary hoặc làm sập vùng đó.

Áp dụng phổ biến nhất là chia theo **route**: mỗi trang một chunk, bọc chung một `Suspense` với màn hình loading của trang.

</details>

**12. Lồng nhiều `Suspense` ở nhiều cấp mang lại lợi ích gì so với một `Suspense` duy nhất ở gốc?**

<details className="qa">
<summary>Xem đáp án</summary>

Một `Suspense` ở gốc nghĩa là **phần chậm nhất quyết định tất cả**: chỉ cần một widget chưa xong, cả trang vẫn là spinner.

Nhiều `Suspense` cho phép **streaming** — từng mảnh hiện ra ngay khi sẵn sàng:

```jsx
<>
  <Header />
  <Suspense fallback={<Skeleton />}>
    <UserCard />
  </Suspense>
  <Suspense fallback={<Skeleton />}>
    <OrderList />
  </Suspense>
</>
```

Header hiện ngay lập tức; `UserCard` và `OrderList` tải song song và đổ vào độc lập.

Lợi ích:

- **Perceived performance tốt hơn nhiều** — người dùng thấy nội dung sớm thay vì màn hình trắng.
- **Skeleton sát với layout thật** ở từng vùng, hạn chế nhảy layout.
- **Cô lập vùng chậm**: một API chậm không giữ toàn bộ trang làm con tin.

Đánh đổi: quá nhiều ranh giới nhỏ sẽ khiến trang "nhấp nháy" nhiều chỗ. Nên chia theo khối nội dung có nghĩa, không chia theo từng component lẻ.

</details>

**13. Nếu chunk của `React.lazy` tải thất bại (mất mạng, vừa deploy bản mới) thì chuyện gì xảy ra? Xử lý ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

`import()` trả về Promise bị **reject**, và với Suspense thì promise reject trở thành lỗi → **Error Boundary** gần nhất bắt và hiện fallback. Không có boundary thì vùng đó (hoặc cả app) sập.

Trường hợp hay gặp trong thực tế là **vừa deploy bản mới**: trình duyệt người dùng vẫn giữ HTML/JS cũ, nhưng file chunk cũ trên CDN đã bị thay tên hash → tải 404.

Cách xử lý:

- **Luôn bọc Error Boundary** quanh vùng lazy, fallback có nút "Tải lại".
- **Retry rồi reload**: bọc `import()` trong hàm thử lại vài lần; nếu vẫn hỏng và nghi là phiên bản cũ thì `window.location.reload()` để lấy bản mới.

```js
const retry = (fn, n = 2) =>
  fn().catch((e) => (n > 0 ? retry(fn, n - 1) : Promise.reject(e)));

const Home = lazy(() => retry(() => import("./pages/Home")));
```

- Về phía hạ tầng: **giữ lại chunk của bản cũ** trên CDN một thời gian sau deploy để người đang mở tab cũ không bị 404.

</details>

**14. Kết hợp Error Boundary và `Suspense`: thứ tự lồng nào là đúng và vì sao thứ tự đó quan trọng?**

<details className="qa">
<summary>Xem đáp án</summary>

Thứ tự tiêu chuẩn là **Error Boundary ở ngoài, `Suspense` ở trong**:

```jsx
<ErrorBoundary FallbackComponent={ErrorView}>
  <Suspense fallback={<Skeleton />}>
    <UserCard id={1} />
  </Suspense>
</ErrorBoundary>
```

Lý do:

- Hai thứ này lo **hai trạng thái khác nhau**: `Suspense` lo *pending*, Error Boundary lo *rejected*. Khi promise reject, lỗi ném ra từ cây con phải đi ngược lên tới boundary.
- Đặt boundary ở ngoài thì khi lỗi xảy ra, **cả vùng loading lẫn nội dung** được thay bằng giao diện lỗi — người dùng không bị kẹt ở spinner quay mãi.
- Nếu đảo ngược (`Suspense` ngoài, boundary trong), giao diện lỗi sẽ nằm lọt bên trong vùng đang chờ, dễ dẫn tới trạng thái lẫn lộn "vừa loading vừa lỗi", và fallback lỗi không thay thế được skeleton bao quanh.

Với boundary lồng nhiều tầng, quy tắc vẫn vậy ở mỗi tầng: boundary bao ngoài `Suspense` của tầng đó, để mỗi vùng tự lo đủ ba trạng thái loading / lỗi / thành công.

</details>

**15. Vì sao không thể gọi `fetch` trực tiếp trong component rồi kỳ vọng `Suspense` tự chờ? Data fetching cần điều kiện gì để 'suspend' được?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì `Suspense` không hề "theo dõi mạng". Nó chỉ phản ứng khi có thứ gì đó **throw ra Promise trong lúc render**. Gọi `fetch(...)` trong thân component chỉ tạo ra một promise rồi bỏ đấy — React không biết gì, vẫn render tiếp và bạn nhận `undefined`.

Điều kiện để suspend được:

- Nguồn dữ liệu phải **tích hợp với Suspense**: `use(promise)` của React 19, Server Components, hoặc thư viện như `useSuspenseQuery` của TanStack Query.
- Promise phải đến từ **cache ổn định theo key**. Nếu mỗi lần render lại tạo promise mới thì React suspend → render lại → tạo promise mới → suspend... thành vòng lặp vô tận. Đây chính là lý do phải có lớp cache ở giữa.
- Kết quả phải đọc được **đồng bộ** ở lần render sau (đã có trong cache).

```jsx
// Sai: promise mới mỗi lần render
const user = use(fetchUser(id));

// Đúng: cache theo key trả về cùng một promise
const { data } = useSuspenseQuery({ queryKey: ["user", id], queryFn: () => fetchUser(id) });
```

</details>

**16. So sánh dùng `Suspense` fallback với tự quản `isLoading` bằng `useState`. Ưu và nhược của từng cách?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `Suspense` | Tự quản `isLoading` |
|---|---|---|
| Nơi khai báo loading | Ở component cha, một chỗ | Trong từng component |
| Code trong component | Chỉ lo happy path | Rải `if (isLoading)`, `if (error)` |
| Nhiều nguồn dữ liệu | Một fallback chung cho cả vùng | Phải tự gộp nhiều cờ loading |
| Waterfall | Dễ tải song song, streaming SSR | Dễ vô tình tuần tự |
| Điều kiện dùng | Cần nguồn dữ liệu hỗ trợ Suspense | Chạy với mọi cách fetch |
| Kiểm soát chi tiết | Ít hơn (all-or-nothing trong vùng) | Toàn quyền, ví dụ hiện dữ liệu cũ mờ đi |

```jsx
// Cũ
const { data, isLoading, error } = useQuery(...);
if (isLoading) return <Spinner />;
if (error) return <Error />;
return <div>{data.name}</div>;

// Mới
const { data } = useSuspenseQuery(...);
return <div>{data.name}</div>; // Suspense ở ngoài lo loading
```

Thực tế thường trộn: `Suspense` cho lần tải đầu của một vùng, còn cờ trạng thái thủ công (hoặc `isFetching`) cho các lần refetch nhỏ để tránh nhấp nháy.

</details>

**17. `useTransition` ảnh hưởng thế nào tới việc `Suspense` có hiện fallback hay không khi cập nhật dữ liệu đã hiển thị?**

<details className="qa">
<summary>Xem đáp án</summary>

Cập nhật được đánh dấu là **transition** sẽ **không bắt `Suspense` hiện lại fallback** cho nội dung đã hiển thị. React giữ nguyên UI cũ trên màn hình, chuẩn bị UI mới ở chế độ nền, và chỉ swap khi đã sẵn sàng.

```jsx
const [isPending, startTransition] = useTransition();

const onTabChange = (tab) => {
  startTransition(() => setTab(tab)); // giữ nội dung cũ, không nháy skeleton
};

<button disabled={isPending}>{isPending ? "Đang tải..." : "Đổi tab"}</button>
```

Không có transition, một `setState` khiến cây con suspend sẽ làm cả vùng rơi về `fallback` — đang có nội dung đẹp bỗng nhảy về skeleton, cảm giác giật và mất ngữ cảnh (mất cả vị trí cuộn).

Cách dùng đúng: `isPending` để làm mờ nội dung cũ hoặc khoá nút, báo cho người dùng biết đang cập nhật. Lưu ý điều này chỉ áp dụng khi nội dung **đã từng hiển thị**; lần mount đầu tiên vẫn hiện fallback bình thường.

</details>

**18. `createPortal` render node ra ngoài DOM cha — vậy event bubbling và context đi theo DOM tree hay React tree? Giải thích vì sao.**

<details className="qa">
<summary>Xem đáp án</summary>

Cả hai đều đi theo **React tree** (cây JSX), không theo DOM tree:

```jsx
<ThemeContext.Provider value="dark">
  <Modal>              {/* render vào document.body */}
    <ThemedButton />   {/* vẫn đọc được theme = "dark" */}
  </Modal>
</ThemeContext.Provider>
```

Vì sao:

- **Context** được truyền dọc theo cây component mà React tự quản lý. `createPortal` chỉ đổi *đích DOM* của node, còn vị trí của nó trong cây React thì không đổi — nên provider cha vẫn phủ tới.
- **Event**: React dùng hệ thống sự kiện tổng hợp, gắn listener ở gốc rồi tự cho sự kiện "nổi bọt" theo cây React. Nên `onClick` đặt ở component cha vẫn bắt được click phát ra từ nội dung của portal, dù node nằm trong `document.body`.

Nhờ đặc điểm này, modal/tooltip thoát được `overflow: hidden` và các rắc rối z-index của parent nhưng vẫn dùng chung context và handler như một component bình thường. Cần nhớ khi đặt handler chung: click trong portal có thể vô tình kích hoạt "click ra ngoài" tính theo DOM.

</details>

**19. Portal kết hợp SSR thường gặp lỗi gì? Cách xử lý phổ biến là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Trên server **không có `document`**, nên gọi `createPortal(<Modal />, document.body)` khi render phía server sẽ ném lỗi kiểu `document is not defined`. Ngay cả khi vượt qua được, việc HTML server không có node còn client lại có dễ gây **hydration mismatch**.

Cách xử lý phổ biến là chỉ render portal sau khi đã mount ở client:

```jsx
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);

if (!mounted) return null;
return createPortal(<Modal />, document.body);
```

`useEffect` không chạy trên server, nên lần render đầu (cả server lẫn hydration) đều trả `null` — khớp nhau, sau đó portal mới xuất hiện.

Các cách khác: dùng `typeof document !== "undefined"` để kiểm tra, dùng `dynamic import` với `ssr: false` (Next.js), hoặc gói phần logic portal vào một Client Component riêng. Với nội dung cần SEO thì đừng đặt trong portal client-only, vì nó không có trong HTML ban đầu.

</details>

**20. Trong production, làm sao gửi lỗi mà Error Boundary bắt được về hệ thống monitoring (Sentry, Datadog)? `componentDidCatch` cung cấp những thông tin gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`componentDidCatch(error, info)` cho bạn:

- **`error`** — đối tượng lỗi: `message`, `name`, `stack` (cần source map để đọc được trên bản đã minify).
- **`info.componentStack`** — chuỗi mô tả đường đi qua các component tới chỗ lỗi. Đây là thông tin quý nhất, vì stack trace JS đã minify thường vô nghĩa còn component stack thì chỉ thẳng ra component nào hỏng.

```jsx
componentDidCatch(error, info) {
  Sentry.captureException(error, {
    contexts: { react: { componentStack: info.componentStack } },
  });
}
```

Với `react-error-boundary` thì dùng prop `onError={(error, info) => ...}` cho gọn. Sentry còn có sẵn `Sentry.ErrorBoundary` bọc luôn việc này.

Vài lưu ý khi triển khai: **upload source map** lên monitoring để đọc được stack; **gắn thêm ngữ cảnh** (user id, route, release version) để lần ra nguyên nhân; và **đừng log dữ liệu nhạy cảm** trong props. Nhớ rằng lỗi event handler/async không đi qua đây, nên vẫn cần bắt lỗi toàn cục riêng.

</details>

---

## 2. React 19 Features

Bài học: [2. React 19 Features](../../react/17-advanced-topics/2_react-19-features.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Server Component khác Client Component ở những điểm nào? Nêu ít nhất bốn khác biệt.**

<details className="qa">
<summary>Xem đáp án</summary>

| | Server Component | Client Component |
|--|-----------------|------------------|
| Chạy ở | Server | Browser |
| Bundle size | **0** (không vào client) | Có |
| Hook (`useState`, `useEffect`) | **Không** | Có |
| Truy cập DB, `fs`, env | **Có** | Không |
| Tương tác (`onClick`) | Không | **Có** |
| Đánh dấu | Mặc định | `"use client"` đầu file |

```tsx
// Server Component (mặc định)
async function UsersPage() {
  const users = await db.user.findMany(); // truy cập DB trực tiếp
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

Pattern chuẩn: **Server Component lo dữ liệu, Client Component lo tương tác**. Server Component được phép bọc Client Component và truyền dữ liệu xuống như props, nhưng chiều ngược lại thì không — Client Component chỉ nhận Server Component qua `children`.

</details>

**2. Vì sao nói Server Component có bundle '0 KB' phía client? Cái gì thực sự được gửi xuống trình duyệt?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì **mã nguồn** của Server Component không bao giờ được đóng gói vào bundle client. Nó chạy xong trên server và bị "bốc hơi" — mọi thư viện mà nó import (ORM, SDK, thư viện markdown nặng vài trăm KB) cũng không theo xuống trình duyệt.

Thứ được gửi xuống là **kết quả render**:

- **HTML** cho lần tải đầu, để hiện nội dung ngay.
- **RSC payload** — mô tả đã được serialize của cây React sau khi render: các node, text, props, và các "chỗ trống" trỏ tới Client Component cần hydrate.
- **JS của các Client Component** được tham chiếu trong payload.

Nhờ payload là mô tả cây React chứ không phải HTML thô, React có thể ghép nó với cây hiện có khi điều hướng mà không mất state của client — điều mà trả HTML thuần không làm được.

Hệ quả thực tế: thêm logic vào Server Component gần như không làm tăng bundle; ngược lại, mỗi lần đẩy một component xuống client là phải trả giá bằng KB.

</details>

**3. Khi nào bắt buộc phải thêm `"use client"`? Đánh dấu ở một file có ảnh hưởng gì tới các module nó import?**

<details className="qa">
<summary>Xem đáp án</summary>

Bắt buộc khi component cần thứ chỉ tồn tại ở trình duyệt:

- State và lifecycle: `useState`, `useReducer`, `useEffect`, `useRef`.
- Event handler: `onClick`, `onChange`, `onSubmit`.
- Web API: `window`, `document`, `localStorage`, `IntersectionObserver`.
- Custom hook hoặc thư viện dùng những thứ trên (nhiều thư viện UI).

Quan trọng: `"use client"` không đánh dấu một component, mà đánh dấu **một ranh giới (boundary)**. Từ file đó trở đi, **mọi module nó import cũng bị kéo vào bundle client** và trở thành code client. Đó là lý do đặt `"use client"` ở ngay `layout` gốc sẽ vô hiệu hoá gần như toàn bộ lợi ích của RSC.

Nguyên tắc thực hành: **đẩy ranh giới xuống càng sâu càng tốt**. Thay vì đánh dấu cả trang, chỉ tách riêng cái nút hoặc cái form cần tương tác thành một Client Component nhỏ, phần còn lại giữ nguyên ở server.

</details>

**4. Server Component dùng được `useState`, `useEffect`, `onClick` không? Giải thích lý do kỹ thuật.**

<details className="qa">
<summary>Xem đáp án</summary>

Không. Lý do nằm ở vòng đời: Server Component **chỉ render một lần trên server** rồi kết thúc. Nó không tồn tại trong trình duyệt, không có instance nào sống tiếp để mà cập nhật.

- **`useState`** vô nghĩa vì không có lần render thứ hai: không có gì trên client giữ giá trị state, cũng không có cơ chế re-render.
- **`useEffect`** là API chạy sau khi commit vào DOM — trên server không có DOM và không có bước commit.
- **`onClick`** là một **hàm**, mà hàm thì không serialize được để gửi qua mạng. Đưa `onClick` xuống Client Component sẽ bị báo lỗi ngay. Ngoại lệ duy nhất là Server Action (`"use server"`), vì React thay nó bằng một tham chiếu chứ không gửi code.

Cách xử lý: giữ phần lấy dữ liệu ở Server Component, tách riêng phần tương tác thành Client Component nhỏ (`"use client"`) rồi truyền dữ liệu xuống làm props.

</details>

**5. Có thể truyền những loại props nào từ Server Component xuống Client Component? Ràng buộc serialize là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Ranh giới server–client đi qua mạng, nên mọi props phải **serialize được**.

Truyền được:

- Kiểu nguyên thuỷ: `string`, `number`, `boolean`, `null`, `undefined`, `BigInt`.
- Object thuần và mảng chứa các giá trị serialize được.
- `Date`, `Map`, `Set`, `TypedArray`.
- **JSX/React element** — rất quan trọng, đây là cách truyền Server Component vào trong Client Component qua `children`.
- **Promise** (cho `use()`), và **Server Action** đã đánh dấu `"use server"`.

Không truyền được: **hàm thường**, class và instance của class, đối tượng có method, `Symbol` không đăng ký, và các object đặc thù runtime server (connection, stream).

```tsx
<Counter initial={data.count} />        {/* OK */}
<Counter onDone={() => save()} />       {/* ❌ không serialize được hàm */}
```

Một mẹo quan trọng: Client Component **không import được** Server Component, nhưng **nhận được** qua `children` — nhờ vậy vẫn đặt được nội dung server bên trong một khung client.

</details>

**6. Phân biệt directive `"use client"` và `"use server"` — hai cái này rất hay bị nhầm, khác nhau ở đâu?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai directive **không đối xứng** như tên gọi khiến người ta tưởng:

| | `"use client"` | `"use server"` |
|---|---|---|
| Đánh dấu cái gì | Ranh giới bắt đầu code **client** | Các **hàm** chỉ chạy trên server, được phép gọi từ client |
| Tác dụng | Module và mọi thứ nó import vào bundle client | Tạo endpoint ẩn; client gọi hàm qua network |
| Vị trí | Đầu file component | Đầu file, hoặc đầu thân một hàm async |
| Mặc định | Không có directive = Server Component | Không liên quan đến việc là Server Component |

Nhầm lẫn phổ biến nhất: nghĩ rằng phải viết `"use server"` để tạo Server Component. Sai — Server Component là **mặc định**, không cần directive gì cả. `"use server"` dành riêng cho **Server Function / Server Action**, ví dụ hàm xử lý form.

```tsx
"use server";
async function createUser(formData: FormData) {
  await db.user.create({ data: { name: formData.get("name") as string } });
}
```

Vì Server Action là endpoint thật sự truy cập được từ ngoài, luôn phải **tự kiểm tra quyền và validate input** ngay trong hàm.

</details>

**7. Hook `use()` khác `useContext` và `useEffect` ở chỗ nào? Vì sao `use()` được phép gọi trong `if` hoặc trong vòng lặp?**

<details className="qa">
<summary>Xem đáp án</summary>

`use()` không phải hook thông thường mà là một **API đặc biệt** của React, đọc được cả Promise lẫn Context:

```jsx
function Component({ shouldLoad }) {
  if (shouldLoad) {
    const data = use(dataPromise); // ✅ hợp lệ
    return <div>{data}</div>;
  }
  return null;
}
```

Khác biệt:

- **So với `useContext`**: cùng đọc được context, nhưng `useContext` phải gọi ở cấp cao nhất, còn `use` gọi có điều kiện được.
- **So với `useEffect`**: `useEffect` chạy *sau* render và không trả dữ liệu; `use` chạy *trong* render và **suspend** component cho tới khi Promise resolve — nên phải có `Suspense` bao ngoài, và Error Boundary cho trường hợp reject.

Sở dĩ gọi có điều kiện được là vì `use` **không dựa vào thứ tự hook** để tìm lại state như `useState`/`useEffect`. Nó chỉ đọc giá trị từ chính đối tượng được truyền vào. Dù vậy `use` vẫn phải được gọi **trong lúc render** — không dùng trong event handler hay callback.

</details>

**8. Dùng `use()` với một Promise tạo ngay trong thân Client Component có vấn đề gì? Promise nên được tạo ở đâu?**

<details className="qa">
<summary>Xem đáp án</summary>

Vấn đề là **vòng lặp vô tận**: mỗi lần render tạo ra một Promise **mới**, `use` thấy nó chưa resolve nên suspend; khi resolve xong React render lại, thân hàm lại tạo Promise mới, lại suspend... Ngoài ra API bị gọi lặp không kiểm soát.

```jsx
// Sai
function UserDetail({ id }) {
  const user = use(fetchUser(id)); // promise mới mỗi lần render
}
```

Promise nên được tạo ở nơi **ổn định giữa các lần render**:

- **Trong Server Component**, rồi truyền xuống làm prop — cách khuyến nghị:

```jsx
function Page() {
  const userPromise = fetchUser(1); // tạo ở cha
  return (
    <Suspense fallback={<Spinner />}>
      <UserDetail promise={userPromise} />
    </Suspense>
  );
}
```

- Hoặc từ một **cache theo key** (thư viện data fetching như TanStack Query), để cùng một key luôn trả về cùng một Promise.

Nói cách khác: `use` chỉ *đọc*, việc quản lý vòng đời Promise phải do lớp khác lo.

</details>

**9. Actions là gì? Cơ chế này thay đổi cách xử lý form so với `onSubmit` truyền thống ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Action** là một hàm (thường async) truyền thẳng vào thuộc tính `action` của `form`. React tự gọi nó khi submit, tự gom dữ liệu thành `FormData`, và tự quản trạng thái pending trong một transition.

```jsx
<form action={formAction}>
  <input name="email" />
  <button disabled={isPending}>{isPending ? "..." : "Login"}</button>
</form>
```

So với `onSubmit` truyền thống:

- **Không phải `e.preventDefault()`**, không phải tự đọc từng ô input.
- **Không còn `useState` rải rác** cho `isPending` và `error` — trước đây mỗi form phải tự viết `setIsPending(true)` / `finally { setIsPending(false) }`.
- **Form tự reset** sau khi action thành công (với action truyền trực tiếp).
- **Tiến gần lại nền tảng web**: form hoạt động theo mô hình gửi dữ liệu quen thuộc, và với Server Action thì còn chạy được cả trước khi JS hydrate xong.
- **Ghép được với `useOptimistic` và `useFormStatus`** vì cả hệ thống cùng biết "đang có một action chạy".

</details>

**10. `useActionState` trả về những gì? Giải thích vai trò của từng phần tử trong mảng kết quả.**

<details className="qa">
<summary>Xem đáp án</summary>

```tsx
const [state, formAction, isPending] = useActionState(loginAction, {});
```

- **`state`** — giá trị **trả về từ lần chạy action gần nhất**, khởi đầu bằng initial state truyền ở tham số thứ hai. Đây là chỗ để action trả về kết quả hoặc thông báo lỗi, ví dụ `{ error: "Sai mật khẩu" }`.
- **`formAction`** — hàm để gắn vào `action` của form (hoặc `formAction` của nút). Gọi nó sẽ chạy action của bạn và cập nhật `state`.
- **`isPending`** — `true` trong lúc action đang chạy, dùng để khoá nút và hiện chữ "Đang gửi...".

Điểm cần nhớ là chữ ký của action: React gọi nó với **`(prevState, formData)`** — tham số đầu là state trước đó chứ không phải form data:

```tsx
async function loginAction(prevState, formData) {
  try {
    await login(formData.get("email"));
    return { success: true };
  } catch (err) {
    return { error: err.message };
  }
}
```

Nên **trả về** lỗi thay vì throw, để lỗi hiện ngay trong form thay vì rơi lên Error Boundary.

</details>

**11. `useFormStatus` lấy trạng thái từ đâu? Vì sao nó chỉ hoạt động ở component con của `form`?**

<details className="qa">
<summary>Xem đáp án</summary>

`useFormStatus` (import từ `react-dom`) đọc trạng thái của **`form` cha gần nhất** thông qua context mà React tự gắn vào form khi nó đang submit:

```tsx
function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? "..." : "Save"}</button>;
}
```

Nó trả về `pending`, cùng `data` (FormData đang gửi), `method` và `action`.

Chỉ hoạt động ở component **con** vì nó đọc context đi lên trên. Nếu gọi trong chính component đang render thẻ `form`, component đó nằm **ngang hàng hoặc bên trên** provider nên luôn nhận `pending === false`. Đây là lỗi hay gặp nhất khi mới dùng.

Lợi ích của thiết kế này: nút submit tự biết trạng thái mà **không cần truyền prop** qua nhiều tầng — rất hợp với design system, nơi `SubmitButton` là component dùng chung cho mọi form.

</details>

**12. So sánh `useActionState` và `useFormStatus` — tình huống nào dùng cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `useActionState` | `useFormStatus` |
|---|---|---|
| Import từ | `react` | `react-dom` |
| Gọi ở đâu | Component **chứa** form | Component **con** của form |
| Cho gì | `state` (kết quả/lỗi), `formAction`, `isPending` | `pending`, `data`, `method`, `action` |
| Có bọc action không | Có — nó tạo ra `formAction` | Không — chỉ đọc trạng thái |

- Dùng **`useActionState`** khi cần **kết quả** của action: thông báo lỗi validate, dữ liệu trả về, giữ lại giá trị người dùng đã nhập khi submit thất bại.
- Dùng **`useFormStatus`** khi chỉ cần biết "form có đang gửi không" ở một component con dùng chung, ví dụ `SubmitButton`, thanh tiến trình, hay lớp phủ vô hiệu hoá form.

Hai cái thường đi cùng nhau: cha dùng `useActionState` để hiện lỗi, còn nút submit dùng `useFormStatus` để tự khoá — không phải truyền `isPending` xuống qua props.

</details>

**13. `useOptimistic` hoạt động thế nào? React rollback giá trị optimistic tại thời điểm nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`useOptimistic` nhận state thật cùng một hàm reducer, và trả về một state "tạm" để hiển thị trong lúc action đang chạy:

```tsx
const [optimisticTodos, addOptimistic] = useOptimistic(
  todos,
  (state, newTodo) => [...state, { ...newTodo, pending: true }]
);

async function formAction(formData) {
  addOptimistic({ id: Math.random(), text: formData.get("text") }); // UI đổi ngay
  await addTodo(formData.get("text")); // gọi server
}
```

Gọi `addOptimistic` xong, UI hiển thị ngay giá trị mới — người dùng không phải chờ server.

**Thời điểm rollback:** khi **transition/action kết thúc**, React vứt bỏ giá trị optimistic và quay về đúng giá trị của state thật (`todos`) tại thời điểm đó.

- Nếu server thành công và dữ liệu đã được revalidate, state thật đã chứa item mới → người dùng không thấy gì thay đổi.
- Nếu server lỗi, state thật vẫn như cũ → item biến mất, tức là **tự rollback**.

Vì vậy nên gắn cờ như `pending: true` để làm mờ item tạm, cho người dùng biết nó chưa được xác nhận.

</details>

**14. Optimistic update thất bại vì server trả lỗi — ngoài rollback, UX nên xử lý thêm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Rollback trần trụi là trải nghiệm tệ: item vừa hiện ra bỗng biến mất mà người dùng không hiểu vì sao, và mất luôn nội dung vừa gõ.

Nên bổ sung:

- **Báo lỗi rõ ràng** — toast hoặc dòng chữ ngay cạnh chỗ thao tác, nói được chuyện gì đã xảy ra ("Mất kết nối", "Bạn không có quyền").
- **Giữ lại dữ liệu người dùng nhập** để họ không phải gõ lại; với `useActionState` thì trả lại giá trị đã nhập trong `state`.
- **Nút "Thử lại"** ngay tại chỗ, tốt hơn là buộc làm lại từ đầu.
- **Phân biệt loại lỗi**: lỗi mạng thì retry được; lỗi nghiệp vụ (validate, hết quyền) thì retry vô ích, phải sửa dữ liệu.
- **Chống nhân đôi** khi retry: gửi kèm một khoá idempotency để server không tạo hai bản ghi.
- **Chỉ optimistic khi khả năng thành công cao**. Với thao tác nguy hiểm hoặc khó hoàn tác (thanh toán, xoá vĩnh viễn), hãy chờ server xác nhận.

</details>

**15. React 19 bỏ `forwardRef` — `ref` giờ hoạt động ra sao? Code cũ dùng `forwardRef` có vỡ không?**

<details className="qa">
<summary>Xem đáp án</summary>

Từ React 19, **`ref` là một prop bình thường** của function component. Không cần bọc gì nữa:

```jsx
// React 18
const Input = forwardRef((props, ref) => <input ref={ref} {...props} />);

// React 19
function Input({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}
```

Nhờ vậy `ref` được destructure, đặt tên lại, truyền tiếp xuống như mọi prop khác, và định kiểu trong TypeScript cũng đơn giản hơn nhiều.

**Code cũ không vỡ**: `forwardRef` vẫn chạy bình thường trong React 19, chỉ bị đánh dấu là sẽ gỡ ở phiên bản sau. React cung cấp codemod (`react-codemod`) để chuyển hàng loạt, nên có thể migrate dần.

Lưu ý thêm: cách viết mới chỉ áp dụng cho **function component** — class component vẫn nhận `ref` trỏ tới instance như trước. Và khi bung props bằng `{...props}`, giờ `ref` cũng nằm trong đó, cần để ý để không vô tình truyền nhầm.

</details>

**16. Cơ chế tự hoist `title` và `meta` trong React 19 giải quyết vấn đề gì? Nó có thay thế hoàn toàn thư viện quản lý head/SEO không?**

<details className="qa">
<summary>Xem đáp án</summary>

Trước đây, thẻ `title`/`meta`/`link` chỉ hợp lệ trong `head`, mà component thì render ở giữa cây — nên phải dùng `react-helmet` hoặc API riêng của framework. React 19 cho phép render các thẻ này **ở bất kỳ đâu** và tự nâng chúng lên `head`:

```jsx
function BlogPost({ post }) {
  return (
    <article>
      <title>{post.title} - Blog</title>
      <meta name="description" content={post.summary} />
      <h1>{post.title}</h1>
    </article>
  );
}
```

Lợi ích: metadata nằm **ngay cạnh** component sở hữu dữ liệu, không phải đồng bộ hai chỗ; bớt được một dependency.

**Không thay thế hoàn toàn.** Các framework vẫn có lý do tồn tại:

- **Dedup và thứ tự ưu tiên** khi nhiều tầng layout cùng khai báo — React không giải quyết trọn vẹn việc gộp/ghi đè.
- **Metadata cho SSR/SSG** cần có sẵn trong HTML trước khi stream tới phần thân; Next.js dùng `metadata` export chính vì thế.
- Các tiện ích như template tiêu đề, sinh ảnh Open Graph, canonical URL, `robots`.

Trong Next.js App Router, vẫn nên ưu tiên API `metadata` của framework; dùng thẻ trực tiếp cho các trường hợp thật sự động.

</details>

**17. React Compiler làm gì? Có nó rồi thì `useMemo`/`useCallback` còn cần không, và compiler dựa vào giả định nào để memo hoá an toàn?**

<details className="qa">
<summary>Xem đáp án</summary>

React Compiler là một bước biên dịch (babel plugin hoặc SWC transform) **tự chèn memo hoá** vào code của bạn. Nó phân tích xem giá trị nào phụ thuộc vào cái gì, rồi tự cache lại các giá trị và hàm giữa các lần render:

```jsx
// Bạn viết
const value = compute(props);
const handler = () => doSomething(value);

// Compiler tự sinh phần ghi nhớ tương đương useMemo/useCallback
```

Khi compiler bật, **phần lớn `useMemo`/`useCallback`/`React.memo` viết tay là thừa** — thậm chí nên gỡ đi cho code sạch. Vẫn còn vài trường hợp phải làm thủ công: giữ một tham chiếu ổn định vì lý do ngoài React (ví dụ làm key cho cache bên ngoài), hoặc chỗ compiler cố tình bỏ qua.

**Giả định nền tảng: code phải tuân thủ Rules of React** — render là hàm thuần, không mutate props/state hay giá trị đã dùng để render, không side effect trong thân component, hook gọi đúng quy tắc. Nếu vi phạm, memo hoá có thể khiến UI không cập nhật.

Vì vậy hãy bật `eslint-plugin-react-compiler` trước: nó chỉ ra chỗ nào không tương thích, và compiler cũng tự bỏ qua những component mà nó không chắc.

</details>

**18. React 19 thay đổi gì với `ref` callback cleanup và với việc dùng Context trực tiếp làm provider?**

<details className="qa">
<summary>Xem đáp án</summary>

**Ref callback trả về hàm dọn dẹp.** Trước đây React gọi callback với `null` lúc unmount, nên phải viết kiểu `if (node) { ... } else { ... }`. React 19 cho phép trả về một hàm cleanup, chạy khi node bị gỡ:

```jsx
<input ref={(node) => {
  const observer = new ResizeObserver(onResize);
  observer.observe(node);
  return () => observer.disconnect(); // cleanup
}} />
```

Gọn và đối xứng như `useEffect`. Lưu ý kèm theo: ref callback **không được trả về giá trị khác** hàm cleanup, nên arrow function một dòng kiểu `ref={(node) => (ref.current = node)}` phải thêm ngoặc nhọn.

**Context dùng trực tiếp làm provider.** React 19 cho viết `<ThemeContext value="dark">` thay cho `<ThemeContext.Provider value="dark">`:

```jsx
const ThemeContext = createContext("light");

<ThemeContext value="dark">
  <App />
</ThemeContext>
```

Bớt một tầng chữ nghĩa, dễ đọc hơn. Cách viết `.Provider` cũ vẫn chạy nhưng sẽ bị gỡ ở phiên bản sau (đã có codemod). Cùng đợt này, `Context.Consumer` cũng bị coi là lỗi thời — hãy dùng `useContext` hoặc `use`.

</details>

**19. Vì sao Server Components chỉ chạy trong framework hỗ trợ (Next.js App Router...) còn Vite SPA thuần thì không?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì RSC không phải một tính năng dùng được một mình — nó là **giao thức giữa bundler, server runtime và router**. Để chạy được, cần có:

- **Bundler hiểu ranh giới**: nhận diện `"use client"` / `"use server"`, tách thành hai đồ thị module, sinh bảng ánh xạ "module reference" để client biết tải chunk nào.
- **Một server runtime** để thực sự render Server Component theo từng request và sinh ra RSC payload.
- **Router tích hợp**: khi điều hướng, phải gọi về server lấy payload cho nhánh mới rồi ghép vào cây hiện tại — không phải chỉ đổi component ở client.
- **Cơ chế cho Server Action**: tạo endpoint ẩn, serialize tham số, xử lý revalidate.

React chỉ cung cấp phần nhân, còn việc lắp ráp bốn thứ trên là của framework.

**Vite SPA thuần** không có bước server render theo request, nên không dùng được RSC hay `"use server"`. Nhưng vẫn dùng bình thường được các hook mới ở client: `use`, `useActionState`, `useOptimistic`, `useFormStatus`, `ref` là prop.

</details>

**20. Migrate một dự án React 18 lên React 19 cần rà soát những breaking change nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Các điểm chính cần rà:

- **API render cũ bị gỡ**: `ReactDOM.render` và `ReactDOM.hydrate` phải đổi sang `createRoot`/`hydrateRoot`; `unmountComponentAtNode` đổi thành `root.unmount()`.
- **`ReactDOM.findDOMNode`** bị gỡ — thay bằng `ref`.
- **String ref** (`ref="input"`) và **legacy context** (`contextTypes`) bị gỡ.
- **`propTypes` và `defaultProps` của function component** không còn tác dụng — chuyển sang TypeScript và tham số mặc định.
- **`forwardRef`** tuy còn chạy nhưng nên chạy codemod để chuyển `ref` thành prop.
- **Cách xử lý lỗi ở gốc thay đổi**: lỗi không còn bị ném lại thành uncaught error như trước; dùng tuỳ chọn `onUncaughtError` / `onCaughtError` khi tạo root nếu đang bắt lỗi toàn cục.
- **Dependency phải tương thích**: kiểm tra các thư viện lớn (router, UI, state) đã hỗ trợ React 19 chưa, và `@types/react` phải lên bản mới.
- **Chạy thử với Strict Mode** để lộ các effect thiếu cleanup.

Thực tế đa số app React 18 nâng cấp khá êm — phần tốn công nhất thường là chờ thư viện bên thứ ba.

</details>

---

## 3. Performance Optimization

Bài học: [3. Performance Optimization](../../react/17-advanced-topics/3_performance.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Nguyên tắc 'đo trước, tối ưu sau' nghĩa là gì? Vì sao tối ưu sớm (premature optimization) lại có hại?**

<details className="qa">
<summary>Xem đáp án</summary>

Nghĩa là luôn đi theo vòng lặp: **đo** (React DevTools Profiler, Performance tab) → **xác định** component nào render lâu hoặc render thừa → **sửa** bằng kỹ thuật phù hợp → **đo lại** để xác nhận có cải thiện thật.

Tối ưu sớm có hại vì:

- **Trực giác của lập trình viên về điểm nghẽn thường sai.** Chỗ ta nghi ngờ hiếm khi là chỗ thật sự chậm; công sức đổ vào đó không đổi lấy được gì.
- **Mọi tối ưu đều có giá**: `useMemo`/`useCallback` tốn bộ nhớ và chi phí so sánh deps, code dài và khó đọc hơn, deps sai thì sinh bug stale.
- **Che mất vấn đề thật** — thường là thuật toán tồi, gọi API kiểu waterfall, hoặc bundle quá to, chứ không phải vài lần re-render.

Như Donald Knuth nói: *"Premature optimization is the root of all evil"*. Viết code rõ ràng trước, đo, rồi mới tối ưu đúng chỗ có số liệu chứng minh.

</details>

**2. React DevTools Profiler cho biết những thông tin gì? Đọc flamegraph thế nào để tìm đúng điểm nghẽn?**

<details className="qa">
<summary>Xem đáp án</summary>

Profiler ghi lại từng **commit** trong phiên đo và cho biết:

- Mỗi commit mất bao lâu (biểu đồ cột phía trên — cột càng cao càng chậm).
- Trong commit đó, **component nào render**, mỗi component mất bao nhiêu ms.
- Component nào **không render** (hiện màu xám) — bằng chứng cho thấy `memo` đang có tác dụng.
- Nếu bật tuỳ chọn "Record why each component rendered": lý do render (props đổi, state đổi, hook đổi, cha render).

Cách đọc **flamegraph**: mỗi thanh là một component, **chiều ngang biểu thị thời gian** render của nó và các con. Đi từ trên xuống, tìm thanh dài bất thường; nếu thanh cha dài mà các con ngắn thì chính component đó chậm, còn nếu độ dài đến từ một nhánh con thì đào tiếp vào nhánh đó.

Chế độ **Ranked** xếp component theo thời gian giảm dần — nhanh hơn khi chỉ cần biết "ai tốn nhất". Nhớ đo trên **production build** và bật CPU throttling để giống máy người dùng.

</details>

**3. Một component re-render vì những nguyên nhân nào? Liệt kê đầy đủ các trường hợp.**

<details className="qa">
<summary>Xem đáp án</summary>

Một component render lại khi:

1. **State của chính nó đổi** — `useState` / `useReducer` set giá trị mới (React so sánh bằng `Object.is`; set giá trị y hệt thì có thể bỏ qua).
2. **Cha render lại** — mặc định mọi con đều render theo, *kể cả khi props không đổi*. Đây là nguyên nhân phổ biến nhất và là lý do `React.memo` tồn tại.
3. **Giá trị Context mà nó tiêu thụ đổi** — mọi consumer render lại, dù chỉ dùng một phần nhỏ của value.
4. **Store bên ngoài phát tín hiệu** qua `useSyncExternalStore` (Redux, Zustand...).
5. **`key` đổi** — thực ra đây là unmount rồi mount lại, state bị xoá sạch.
6. **Force update** ở class component, hoặc hiệu ứng của Strict Mode ở dev (render đôi để lộ side effect).

Lưu ý một hiểu lầm kinh điển: **props đổi không phải nguyên nhân độc lập**. Props chỉ đổi khi cha render lại, tức trường hợp 2.

</details>

**4. Re-render có đồng nghĩa với thao tác DOM thật không? Giải thích vai trò của reconciliation và commit phase.**

<details className="qa">
<summary>Xem đáp án</summary>

**Không.** Re-render chỉ nghĩa là React gọi lại hàm component để lấy mô tả UI mới. Việc chạm vào DOM thật là chuyện khác.

Hai giai đoạn:

- **Render phase (reconciliation)**: React gọi component, nhận về cây element mới, rồi **so sánh** với cây trước đó. Giai đoạn này thuần tính toán trong bộ nhớ, có thể bị ngắt hoặc bỏ đi (với concurrent features). Việc so sánh dựa trên `type` và `key`: khác type thì huỷ cả nhánh, cùng type thì giữ node và chỉ cập nhật thuộc tính khác biệt.
- **Commit phase**: React áp **đúng phần khác biệt** vào DOM thật, rồi chạy các effect của layout và `useEffect`. Giai đoạn này đồng bộ, không ngắt được.

Hệ quả thực tế: nếu kết quả render giống hệt lần trước, commit phase gần như không làm gì — DOM không bị đụng tới. Chi phí của một re-render "thừa" chủ yếu là JavaScript (chạy hàm + so sánh), thường rẻ. Vì vậy đừng săn lùng mọi re-render, chỉ xử lý những chỗ Profiler chỉ ra là đắt.

</details>

**5. `React.memo` so sánh props theo kiểu gì? Vì sao truyền object, array hay function inline làm `memo` mất tác dụng?**

<details className="qa">
<summary>Xem đáp án</summary>

`React.memo` so sánh **nông (shallow)**: duyệt từng prop và so bằng `Object.is`. Với chuỗi/số/boolean thì so giá trị, nhưng với object/array/function thì so **tham chiếu**.

Mà object, array và function viết inline được **tạo mới ở mỗi lần render của cha**:

```jsx
const Row = React.memo(function Row({ item, style, onClick }) { /* ... */ });

// Cha render lại → style và onClick luôn là tham chiếu mới
<Row item={item} style={{ color: "red" }} onClick={() => select(item.id)} />
// → memo so sánh thấy "khác" → vẫn render lại, memo thành vô dụng
```

Cách sửa:

- `useCallback` cho hàm, `useMemo` cho object/array.
- Đưa object hằng ra **ngoài component** (module scope) nếu nó không đổi.
- Tốt nhất là **truyền props nguyên thuỷ**: thay vì truyền cả object, truyền `id` rồi để con tự lấy.

Một `memo` đi kèm props không ổn định thì chỉ tốn thêm chi phí so sánh mà chẳng cứu được lần render nào.

</details>

**6. Khi nào `React.memo` gây hại nhiều hơn lợi?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Khi props đổi gần như mọi lần render**: mỗi lần lại tốn thêm một vòng so sánh rồi vẫn phải render — chi phí cộng thêm mà không bỏ được lần nào.
- **Khi component vốn rất rẻ** (vài thẻ, ít node): việc so sánh props có thể đắt ngang hoặc hơn việc render lại.
- **Khi props là object lớn**: so sánh nông vẫn phải duyệt qua tất cả khoá, còn giá trị bên trong đổi mà tham chiếu giữ nguyên thì lại gây bug hiển thị sai.
- **Khi nó kéo theo một chuỗi `useMemo`/`useCallback`** ở component cha chỉ để phục vụ nó — code phình ra, deps dễ sai, dễ sinh bug stale.
- **Khi `memo` được bọc mặc định khắp nơi** ("memo blanket"): tốn bộ nhớ giữ kết quả cũ, khó đọc, và che mất vấn đề thật.

Chỉ nên bọc `memo` khi Profiler cho thấy component đó render **chậm (> 16ms)** hoặc nằm trong danh sách lặp lại nhiều lần, và props của nó thật sự ổn định. Với React Compiler bật lên thì phần lớn việc này không cần làm tay nữa.

</details>

**7. Phân biệt `useMemo` và `useCallback`. `useCallback(fn, deps)` tương đương cách viết nào bằng `useMemo`?**

<details className="qa">
<summary>Xem đáp án</summary>

- **`useMemo(factory, deps)`** — nhớ **giá trị** mà `factory` trả về. Dùng cho kết quả tính toán nặng, hoặc để giữ tham chiếu ổn định cho object/array.
- **`useCallback(fn, deps)`** — nhớ **chính hàm đó**, để tham chiếu không đổi giữa các lần render.

Tương đương chính xác:

```jsx
useCallback(fn, deps)
// giống hệt
useMemo(() => fn, deps)
```

Khác biệt duy nhất là `useMemo` **gọi** hàm bạn truyền vào rồi nhớ kết quả, còn `useCallback` **không gọi** mà nhớ luôn hàm đó. `useCallback` chỉ là đường cú pháp cho trường hợp giá trị cần nhớ lại chính là một hàm.

```jsx
const filtered = useMemo(() => items.filter(i => i.includes(query)), [items, query]);
const handleClick = useCallback(() => doSomething(id), [id]);
```

Cả hai chỉ có ích khi giá trị được **truyền cho component đã `memo`**, hoặc là **dep của một `useEffect`**, hoặc việc tính toán thật sự tốn thời gian.

</details>

**8. `useMemo` có đảm bảo React không bao giờ tính lại giá trị đó không? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Không. React docs nói rõ `useMemo` là **gợi ý tối ưu hoá, không phải bảo đảm ngữ nghĩa**. React có quyền vứt bỏ giá trị đã nhớ và tính lại, ví dụ để giải phóng bộ nhớ hoặc trong các tình huống nội bộ của cơ chế concurrent.

Ngoài ra, giá trị chắc chắn bị tính lại khi:

- **Deps đổi** (so sánh nông bằng `Object.is`).
- **Component unmount rồi mount lại** — cache gắn với instance, không sống sót qua vòng đời.
- **`key` đổi** — bản chất là mount lại.
- Ở **Strict Mode** trong dev, React cố tình gọi thêm một lần để lộ side effect.

Hệ quả thực hành quan trọng: **không được đặt logic bắt buộc chạy đúng một lần vào `useMemo`** — khởi tạo kết nối, gọi API, ghi log, tạo id "duy nhất". Những việc đó thuộc về `useEffect`, `useRef` hoặc `useState` với hàm khởi tạo. Hàm truyền cho `useMemo` phải thuần khiết: chạy lại bao nhiêu lần cũng cho cùng kết quả và không có tác dụng phụ.

</details>

**9. Tự viết hàm so sánh `areEqual` cho `React.memo` có những rủi ro gì thường gặp?**

<details className="qa">
<summary>Xem đáp án</summary>

```jsx
const Row = React.memo(RowBase, (prev, next) => prev.item.id === next.item.id);
// trả về true = "coi như bằng nhau" = BỎ QUA render
```

Rủi ro:

- **Nhầm quy ước**: `areEqual` trả `true` nghĩa là *bỏ qua* render — ngược với `shouldComponentUpdate` (trả `true` là *cho* render). Nhầm chỗ này là component đứng im hoặc render mọi lúc.
- **Bỏ sót prop**: so sánh dựa trên vài field, hôm sau ai đó thêm prop mới → UI **stale**, hiển thị dữ liệu cũ mà không ai hiểu vì sao. Đây là lỗi nguy hiểm nhất vì rất khó lần ra.
- **So sánh sâu tốn kém**: `JSON.stringify` hay deep equal trên object lớn có thể đắt hơn cả việc render lại.
- **Prop là hàm**: hàm inline luôn khác nhau, nên hoặc bạn bỏ qua nó (dễ giữ closure cũ, gọi nhầm dữ liệu cũ) hoặc `memo` mất tác dụng.

Kết luận: chỉ viết `areEqual` khi đã đo và thật sự cần; ưu tiên làm props ổn định và đơn giản để so sánh nông mặc định là đủ.

</details>

**10. Kỹ thuật đẩy state xuống thấp nhất có thể và truyền `children` như props giúp giảm re-render ra sao mà không cần `memo`?**

<details className="qa">
<summary>Xem đáp án</summary>

**Đẩy state xuống thấp**: state chỉ làm render lại từ component sở hữu nó trở xuống. Nếu chỉ một ô input cần `value`, hãy đặt state trong component nhỏ bao quanh ô đó thay vì để ở trang cha — cả cây anh em phía trên không còn bị kéo theo.

**Truyền `children` như props** tận dụng một điểm tinh tế: element được **tạo ở component cha** rồi truyền xuống dưới dạng prop, nên khi component ở giữa render lại, `props.children` vẫn là **cùng một tham chiếu** → React bỏ qua việc render nhánh đó.

```jsx
// Thay vì để ExpensiveTree bên trong component có state
function Counter({ children }) {
  const [count, setCount] = useState(0);
  return (
    <div onClick={() => setCount(c => c + 1)}>
      <p>{count}</p>
      {children}          {/* không render lại khi count đổi */}
    </div>
  );
}

<Counter><ExpensiveTree /></Counter>  {/* element tạo ở đây */}
```

Ưu điểm so với `memo`: không tốn chi phí so sánh, không phải bọc `useCallback`/`useMemo`, và không hỏng khi ai đó thêm prop mới. Nên thử cách này **trước** khi nghĩ tới memo hoá.

</details>

**11. Vì sao thay đổi giá trị Context làm re-render toàn bộ consumer? Nêu các cách giảm tác động.**

<details className="qa">
<summary>Xem đáp án</summary>

Vì Context **không có cơ chế chọn lọc**: React chỉ so sánh `value` của provider bằng `Object.is`, thấy khác là báo cho **mọi** consumer render lại — dù component đó chỉ dùng một field trong value. Với value là object thì gần như lần nào cũng "khác".

Các cách giảm tác động:

- **Tách nhỏ context theo tần suất đổi**: ví dụ `ThemeContext` (hiếm đổi) tách khỏi `UserContext`; tách `state` khỏi `dispatch` — phần `dispatch` ổn định nên consumer chỉ dùng nó sẽ không bao giờ render lại.
- **`useMemo` cho value** của provider để tham chiếu ổn định khi dữ liệu không đổi.
- **Đặt provider càng gần nơi cần càng tốt**, đừng bọc tất cả ở gốc.
- **Bọc `React.memo`** cho các component con nặng nằm dưới consumer.
- **Dùng thư viện có selector** khi state đổi liên tục: Zustand, Redux với `useSelector`, hoặc `use-context-selector` — chỉ component đọc đúng mẩu dữ liệu đó mới render lại.

Nguyên tắc: Context hợp với dữ liệu **ít thay đổi**; state thay đổi liên tục nên để ở store có selector.

</details>

**12. Bọc `useMemo` cho value của Context Provider có ý nghĩa gì? Nếu quên thì hậu quả là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

```jsx
// Thiếu memo: object mới mỗi lần Provider render
<AuthContext value={{ user, login, logout }}>

// Có memo: tham chiếu ổn định khi user không đổi
const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);
<AuthContext value={value}>
```

Object literal được tạo mới ở mỗi lần render của component chứa provider. React so sánh `value` bằng `Object.is`, thấy tham chiếu mới nên coi là đã đổi.

**Hậu quả khi quên**: mỗi lần component cha render lại vì **bất kỳ lý do gì** — kể cả một state hoàn toàn không liên quan — thì **toàn bộ consumer** trong cây render lại theo. Trong app lớn, đây là một trong những nguyên nhân chậm âm thầm và khó phát hiện nhất, vì Profiler chỉ cho thấy "rất nhiều component render" mà không lộ nguyên nhân ngay.

Nhớ kèm theo: các hàm trong value (`login`, `logout`) cũng phải ổn định bằng `useCallback`, nếu không `useMemo` vẫn vô nghĩa. Khi bật React Compiler, phần lớn việc này được tự động xử lý.

</details>

**13. Code splitting theo route và theo component khác nhau thế nào? Chia quá nhỏ gây vấn đề gì?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Theo route | Theo component |
|---|---|---|
| Ranh giới | Mỗi trang một chunk | Một component/thư viện nặng |
| Khi nào tải | Khi điều hướng tới trang | Khi component thực sự hiển thị |
| Độ phổ biến | Mặc định nên làm | Dùng có chọn lọc |
| Ví dụ | `/dashboard`, `/settings` | Chart, editor văn bản, modal hiếm mở |

```jsx
const Dashboard = lazy(() => import("./pages/Dashboard"));     // route
const HeavyChart = lazy(() => import("./HeavyChart"));          // component
```

**Chia quá nhỏ** thì phản tác dụng:

- **Nhiều request nhỏ** — mỗi chunk có chi phí cố định về header, latency, và nén kém hiệu quả hơn so với gộp chung.
- **Waterfall**: chunk A tải xong mới biết cần chunk B, người dùng chờ nhiều nhịp.
- **Nhấp nháy fallback** ở khắp nơi, cảm giác trang giật.
- Khó debug, khó cache vì bản đồ chunk thay đổi liên tục.

Nguyên tắc: tách theo **route trước**, rồi mới tách những component nặng nhưng ít dùng. Dùng bundle analyzer để quyết định, đừng tách theo cảm tính.

</details>

**14. `React.lazy` kết hợp preload/prefetch ra sao để người dùng không phải nhìn spinner khi chuyển trang?**

<details className="qa">
<summary>Xem đáp án</summary>

Ý tưởng: **gọi `import()` sớm hơn thời điểm render**, vì module đã tải sẽ nằm trong cache nên khi chuyển trang là hiển thị ngay.

```jsx
const loadSettings = () => import("./pages/Settings");
const Settings = lazy(loadSettings);

<Link to="/settings" onMouseEnter={loadSettings} onFocus={loadSettings}>
  Settings
</Link>
```

Các thời điểm preload hợp lý:

- **Hover/focus vào link** — người dùng thường mất vài trăm ms trước khi bấm, đủ để tải xong.
- **Khi link lọt vào viewport** (dùng `IntersectionObserver`).
- **Sau khi trang hiện tại đã rảnh** — gọi trong `requestIdleCallback` để tải trước các route hay dùng.

Có thể nhờ trình duyệt qua thẻ `<link rel="prefetch">` (ưu tiên thấp, cho điều hướng tương lai) hoặc `<link rel="preload">` (ưu tiên cao, cho tài nguyên cần ngay). Framework như Next.js tự prefetch các `Link` trong viewport.

Lưu ý: preload quá tay sẽ ăn băng thông của người dùng mạng yếu — hãy ưu tiên vài route quan trọng nhất.

</details>

**15. Virtualization giải quyết vấn đề gì? Từ khoảng bao nhiêu item nên dùng và nó đánh đổi những gì (tìm kiếm trong trang, SEO, accessibility)?**

<details className="qa">
<summary>Xem đáp án</summary>

Nó giải quyết chuyện render **hàng nghìn node DOM** cùng lúc: trình duyệt tốn bộ nhớ, layout và paint chậm, cuộn giật. Virtualization chỉ render những item **đang nhìn thấy** cộng một vùng đệm — 10.000 item nhưng chỉ khoảng 20 node tồn tại thật.

**Ngưỡng**: thường từ khoảng **100+ item**, hoặc sớm hơn nếu mỗi dòng phức tạp (ảnh, nhiều cột, biểu đồ nhỏ). Dưới ngưỡng đó, chi phí phức tạp không đáng.

Đánh đổi:

- **Ctrl+F của trình duyệt không tìm được** nội dung chưa render → phải tự làm ô tìm kiếm trong app.
- **SEO**: bot không thấy nội dung ngoài màn hình — đừng virtualize nội dung cần index.
- **Accessibility**: trình đọc màn hình mất ngữ cảnh "dòng mấy trên tổng bao nhiêu"; phải khai báo `aria-rowcount`, `aria-rowindex`, giữ thứ tự tiêu điểm khi cuộn.
- **Chiều cao động** khó ước lượng, dễ nhảy thanh cuộn; anchor link và chức năng in trang cũng khó.

Thư viện: TanStack Virtual, react-window (react-virtualized là bản cũ).

</details>

**16. Vì sao dùng index làm `key` vừa gây sai logic vừa gây tốn hiệu năng khi danh sách đổi thứ tự?**

<details className="qa">
<summary>Xem đáp án</summary>

`key` là cách React nhận diện "vẫn là item đó" giữa hai lần render. Dùng index thì key gắn với **vị trí**, không gắn với **dữ liệu**.

**Sai logic:** xoá item đầu danh sách, mọi item dịch lên một bậc nhưng key `0, 1, 2...` giữ nguyên. React tưởng item ở vị trí 0 chỉ "đổi nội dung", nên **giữ nguyên state và DOM cũ** ở đó:

```jsx
{items.map((item, i) => <Row key={i} item={item} />)}
// Xoá item đầu → chữ đã gõ trong input của dòng 2 nhảy lên dòng 1,
// checkbox tick sai dòng, animation nhấp nháy
```

**Tốn hiệu năng:** khi danh sách đảo thứ tự, lẽ ra React chỉ cần **di chuyển** node DOM (thao tác rẻ). Với key theo index, nó thấy mọi dòng đều "đổi props" nên phải render lại và cập nhật nội dung của gần như toàn bộ danh sách.

Cách đúng: dùng **id ổn định từ dữ liệu**. Index chỉ chấp nhận được khi danh sách tĩnh, không sắp xếp, không thêm/xoá, và item không có state riêng.

</details>

**17. `useTransition` và `useDeferredValue` khác nhau ở đâu? Cho một tình huống chỉ dùng được `useDeferredValue`.**

<details className="qa">
<summary>Xem đáp án</summary>

| | `useTransition` | `useDeferredValue` |
|---|---|---|
| Bạn đánh dấu cái gì | **Hành động cập nhật** (`startTransition`) | **Một giá trị** |
| Điều kiện | Phải kiểm soát được setter | Chỉ cần có giá trị trong tay |
| Trả về | `[isPending, startTransition]` | Bản "trễ" của giá trị |
| Trong lúc chờ | Giữ UI cũ, `isPending` để hiện dấu hiệu | Trả về giá trị **cũ** cho tới khi render mới xong |

```jsx
// useTransition — bạn sở hữu setFilter
startTransition(() => setFilter(value));

// useDeferredValue — value đến từ nơi khác
function Search({ value }) {
  const deferred = useDeferredValue(value);
  return <HeavyList filter={deferred} />;
}
```

**Tình huống chỉ dùng được `useDeferredValue`**: giá trị đến từ **prop hoặc nguồn ngoài tầm kiểm soát** — một component thư viện truyền `value` xuống, dữ liệu lấy từ context hay từ store, hoặc `searchParams` trên URL do router quản lý. Bạn không có setter để bọc trong `startTransition`, nhưng vẫn muốn phần render nặng chạy ở mức ưu tiên thấp.

Mẹo UX: kết hợp với `opacity` giảm nhẹ khi `deferred !== value` để báo dữ liệu đang cũ.

</details>

**18. Update 'urgent' và 'non-urgent' là gì? React quyết định thứ tự ưu tiên dựa trên điều gì?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Urgent (khẩn)**: những cập nhật người dùng mong thấy kết quả **ngay lập tức** — gõ phím, bấm chuột, tick checkbox, kéo thanh trượt. Trễ dù vài chục ms cũng cảm nhận được là "lag".
- **Non-urgent (transition)**: hệ quả nặng của thao tác đó — lọc danh sách 10.000 dòng, vẽ lại biểu đồ, chuyển trang. Chậm hơn một chút vẫn chấp nhận được.

React quyết định ưu tiên dựa trên:

- **Loại sự kiện phát sinh cập nhật**: sự kiện rời rạc (click, keydown, input) được xếp ưu tiên cao nhất; sự kiện liên tục (scroll, mousemove) thấp hơn.
- **Đánh dấu tường minh của bạn**: `startTransition` và `useDeferredValue` hạ cập nhật xuống mức thấp.

Với mức ưu tiên thấp, React render ở chế độ nền và **cho phép ngắt giữa chừng**: đang lọc dở mà người dùng gõ tiếp thì React bỏ công việc đang làm, xử lý phím vừa gõ, rồi mới làm lại. Nhờ vậy ô input luôn mượt dù danh sách phía dưới rất nặng. Đây là nền tảng của concurrent rendering từ React 18.

</details>

**19. Debounce/throttle cho ô input so với `useDeferredValue` — chọn cái nào trong tình huống nào và vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai thứ giải quyết hai bài toán khác nhau:

- **Debounce/throttle** *giảm số lần* thao tác xảy ra — bỏ bớt công việc. Bắt buộc dùng khi mỗi lần gõ kéo theo **chi phí ngoài React**: gọi API, ghi `localStorage`, gửi analytics. Không debounce thì gõ 10 chữ là 10 request.
- **`useDeferredValue`** *không bỏ* lần nào, nó chỉ hạ **mức ưu tiên** của việc render nặng và cho phép React ngắt giữa chừng. Phù hợp khi chi phí nằm ở **render phía client**: lọc, sắp xếp, vẽ danh sách lớn.

Ưu điểm của `useDeferredValue` so với debounce cho việc render: không phải chọn con số "300ms" tuỳ hứng — máy nhanh thì cập nhật gần như tức thì, máy chậm React tự giãn ra. Debounce thì máy nào cũng đợi đủ 300ms.

```jsx
const deferredQuery = useDeferredValue(query);   // lọc tại client
const debounced = useDebounce(query, 300);       // rồi mới gọi API
useEffect(() => { searchApi(debounced); }, [debounced]);
```

Thực tế thường **dùng cả hai**: debounce cho phần gọi mạng, `useDeferredValue` cho phần render.

</details>

**20. Web Vitals LCP, INP, CLS đo cái gì? Ngưỡng 'good' của từng chỉ số là bao nhiêu?**

<details className="qa">
<summary>Xem đáp án</summary>

| Chỉ số | Đo cái gì | Ngưỡng "good" |
|---|---|---|
| **LCP** (Largest Contentful Paint) | Thời điểm phần tử nội dung lớn nhất trong viewport hiển thị xong — thường là ảnh hero hoặc khối tiêu đề | **< 2.5s** |
| **INP** (Interaction to Next Paint) | Độ trễ từ lúc người dùng tương tác tới lúc màn hình vẽ xong phản hồi, tính trên toàn phiên | **< 200ms** |
| **CLS** (Cumulative Layout Shift) | Mức độ nội dung nhảy vị trí ngoài ý muốn trong lúc tải | **< 0.1** |

Cách cải thiện trong React:

| Chỉ số | Hướng xử lý |
|---|---|
| LCP | Tối ưu ảnh, preload font, server-side render / streaming |
| INP | Code splitting, `useTransition`, virtualization, hoãn JS không quan trọng |
| CLS | Đặt sẵn width/height cho ảnh, skeleton đúng kích thước, `font-display` |

Ngưỡng được đánh giá ở **phân vị 75** của người dùng thật. Vì vậy số liệu **Field Data** (PageSpeed Insights, thư viện `web-vitals` gửi về analytics) quan trọng hơn kết quả lab của Lighthouse trên máy dev.

</details>

**21. INP thay thế FID — vì sao chỉ số mới phản ánh trải nghiệm tương tác chính xác hơn?**

<details className="qa">
<summary>Xem đáp án</summary>

**FID (First Input Delay)** chỉ đo **độ trễ đầu vào** của **tương tác đầu tiên** — tức khoảng thời gian từ khi người dùng bấm tới khi trình duyệt bắt đầu chạy handler. Nó dừng lại ở đó.

Vì thế FID dễ "đẹp giả": một trang có thể đạt FID rất tốt trong khi handler chạy 2 giây rồi mới cập nhật giao diện, và mọi tương tác sau đó đều chậm — FID không nhìn tới.

**INP (Interaction to Next Paint)** đo **trọn vòng**:

1. Input delay — chờ luồng chính rảnh.
2. Processing time — thời gian chạy event handler.
3. Presentation delay — thời gian render và vẽ khung hình phản hồi.

Và nó tính trên **mọi tương tác trong cả phiên**, rồi lấy giá trị gần mức tệ nhất làm đại diện, thay vì chỉ lần đầu.

Với React, điều này nghĩa là: render nặng sau khi bấm nút giờ đã bị tính vào điểm số. Các kỹ thuật giúp INP chính là những thứ trong bài — chia nhỏ công việc, `useTransition`, virtualization, giảm JS phải chạy.

</details>

**22. Những kỹ thuật nào giúp giảm CLS trong ứng dụng React?**

<details className="qa">
<summary>Xem đáp án</summary>

CLS sinh ra khi nội dung đã hiển thị bị **đẩy đi chỗ khác**. Cách phòng:

- **Luôn đặt trước kích thước cho ảnh và video**: `width`/`height` hoặc `aspect-ratio`, để trình duyệt giữ chỗ trước khi ảnh tải xong. Component `Image` của Next.js làm sẵn việc này.
- **Skeleton đúng kích thước** với nội dung thật. Skeleton nhỏ hơn nội dung là nguồn CLS rất phổ biến khi dùng Suspense.
- **Font**: preload file `woff2`, dùng `font-display: swap` kèm `size-adjust`/`ascent-override` để font dự phòng có kích thước gần với font thật, tránh cú nhảy khi đổi font.
- **Chừa chỗ cho nội dung tải sau**: banner, quảng cáo, thông báo — đặt container có chiều cao cố định thay vì chèn vào đầu trang.
- **Đừng chèn nội dung phía trên phần người dùng đang đọc**; nếu phải, hãy dùng overlay hoặc chèn xuống dưới.
- **Animation bằng `transform`/`opacity`**, không animate `width`, `height`, `top` — vì chúng gây layout lại.
- Với dữ liệu động, **cố định chiều cao vùng chứa** rồi cho cuộn bên trong.

</details>

**23. React Compiler tự memo hoá — vậy còn nên viết `useMemo`/`useCallback` thủ công nữa không? Compiler không cứu được trường hợp nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi compiler được bật, **phần lớn `useMemo`/`useCallback`/`React.memo` viết tay là thừa** — nó tự phân tích phụ thuộc và chèn memo hoá, đều tay hơn con người và không bỏ sót. Code sạch hơn rõ rệt.

Compiler **không cứu được**:

- **Code vi phạm Rules of React** — mutate props/state, side effect trong render, hook gọi sai chỗ. Gặp những chỗ này compiler sẽ **bỏ qua** component đó, nên bật `eslint-plugin-react-compiler` để biết mình đang mất gì.
- **Vấn đề thuật toán**: vòng lặp `O(n²)`, sắp xếp lại 10.000 phần tử mỗi lần. Memo chỉ tránh tính *lại*, không làm phép tính nhanh hơn.
- **Vấn đề kiến trúc dữ liệu**: waterfall gọi API, over-fetching, thiếu cache, bundle quá to.
- **Danh sách khổng lồ** — vẫn cần virtualization.
- **Tham chiếu ổn định cho hệ thống ngoài React**: khoá cache bên ngoài, so sánh trong thư viện bên thứ ba, dependency của hệ thống không phải React.
- **Giá trị cần ổn định cả khi unmount/mount** — đó là việc của `useRef` hoặc module scope.

</details>

**24. Làm sao phát hiện thư viện làm phình bundle? Nêu các chiến lược giảm kích thước bundle theo thứ tự ưu tiên.**

<details className="qa">
<summary>Xem đáp án</summary>

**Phát hiện**: chạy bundle analyzer để thấy biểu đồ treemap từng module — `vite-bundle-visualizer` / `rollup-plugin-visualizer` (Vite), `webpack-bundle-analyzer`, `@next/bundle-analyzer`, hoặc `source-map-explorer` cho bản đã build. Kiểm tra trước khi cài thư viện mới bằng bundlephobia, và theo dõi kích thước trong CI để phát hiện lúc nó phình lên.

Thứ tự ưu tiên xử lý:

1. **Bỏ hoặc thay thư viện nặng** — hiệu quả nhất. Ví dụ `moment` (nặng, kéo theo locale) thay bằng `date-fns`/`dayjs` hoặc API ngày tháng có sẵn; một hàm tiện ích nhỏ thì tự viết thay vì kéo cả gói.
2. **Import đúng phần cần** — dùng ES module và import lẻ từng hàm để tree-shaking phát huy tác dụng, tránh `import * as`.
3. **Code splitting theo route**, rồi tới các component nặng ít dùng (chart, editor, map).
4. **Lazy load thư viện chỉ dùng khi tương tác**, ví dụ thư viện xuất PDF chỉ tải khi bấm nút.
5. **Đẩy lên server** — Server Components hoặc xử lý ở API để code không xuống client.
6. **Hạ tầng**: nén Brotli, target trình duyệt hiện đại, CDN, HTTP/2 hoặc HTTP/3.

</details>

**25. Danh sách dài kèm filter/search bị chậm: mô tả quy trình chẩn đoán và các phương án tối ưu theo thứ tự bạn sẽ thử.**

<details className="qa">
<summary>Xem đáp án</summary>

**Chẩn đoán trước:** bật Profiler, gõ vài chữ và xem mỗi lần gõ mất bao nhiêu ms, bao nhiêu component render. Cần xác định chậm ở đâu:

- Ô input chậm ngay khi gõ → vấn đề render.
- Chậm sau khi dữ liệu về → vấn đề mạng.
- Một dòng render lâu → vấn đề ở component `Row`.

**Thứ tự thử:**

1. **Sửa `key`** — dùng id thay vì index. Rẻ và thường có tác dụng ngay.
2. **`useMemo` cho kết quả lọc/sắp xếp**, để nó không chạy lại khi state khác đổi.
3. **`React.memo` cho `Row`**, kèm props ổn định (tránh object/hàm inline).
4. **Tách state của ô input** xuống component riêng, để mỗi lần gõ không render cả trang.
5. **`useDeferredValue`** cho giá trị lọc, giữ ô input mượt; nếu có gọi API thì thêm debounce.
6. **Virtualization** khi danh sách vượt vài trăm dòng — thường đây mới là bước tạo khác biệt lớn nhất.
7. **Đẩy việc sang server**: phân trang, tìm kiếm phía server, hoặc đánh index — bắt buộc khi dữ liệu lên hàng chục nghìn bản ghi.

Sau mỗi bước phải **đo lại**; dừng khi đã đạt mục tiêu.

</details>

**26. Ảnh và font ảnh hưởng thế nào tới LCP? Nêu các cách tối ưu cụ thể.**

<details className="qa">
<summary>Xem đáp án</summary>

Phần tử LCP của đa số trang chính là **ảnh hero** hoặc **khối văn bản lớn** — mà văn bản lại phải chờ **font** tải xong mới vẽ. Vì vậy hai thứ này quyết định phần lớn điểm LCP.

**Với ảnh:**

- Dùng định dạng hiện đại: **AVIF** hoặc **WebP** thay JPEG/PNG.
- Phục vụ đúng kích thước theo thiết bị bằng `srcset`/`sizes`, không gửi ảnh 2000px cho màn hình điện thoại.
- **Không lazy-load ảnh LCP** — đây là lỗi rất hay gặp. Ngược lại, hãy đánh dấu ưu tiên cao (`fetchpriority="high"` hoặc `priority` của Next.js Image) và cân nhắc `<link rel="preload">`.
- Lazy-load mọi ảnh **bên dưới** màn hình đầu.
- Dùng CDN ảnh có tự chuyển định dạng và thay đổi kích thước.

**Với font:**

- **Self-host** và preload file `woff2` quan trọng nhất, tránh thêm một vòng kết nối tới domain khác.
- `font-display: swap` để chữ hiện ngay bằng font dự phòng.
- **Subset** bộ ký tự thật sự dùng (rất đáng kể với tiếng Việt).
- Giới hạn số family và số weight.

Ngoài ra: giảm JS chặn render, dùng SSR/streaming để HTML tới sớm.

</details>
