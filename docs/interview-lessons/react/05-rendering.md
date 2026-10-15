---
sidebar_position: 5
title: "5. Rendering"
---

# 5. Rendering

## 1. Component Lifecycle

Bài học: [1. Component Lifecycle](../../react/05-rendering/1_lifecycle.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Một component React đi qua những giai đoạn nào trong vòng đời của nó?**

<details className="qa">
<summary>Xem đáp án</summary>

Ba giai đoạn:

- **Mount** — component được tạo và gắn vào DOM lần đầu. React gọi hàm component, dựng virtual DOM, commit lên DOM thật, rồi chạy effect. Hook tương ứng: `useEffect(() => {}, [])`.
- **Update** — props hoặc state đổi (hoặc parent re-render, hoặc context value đổi). React gọi lại hàm component, diff virtual DOM cũ/mới, chỉ commit phần khác biệt. Hook tương ứng: `useEffect(() => {}, [deps])` — chạy lại khi deps đổi.
- **Unmount** — component bị gỡ khỏi UI. React chạy **cleanup function** (phần `return` trong effect) để huỷ timer, gỡ listener, đóng subscription.

Component có thể update nhiều lần trước khi unmount. Với component dạng hàm, ta không có ba hook riêng biệt như class (`componentDidMount`/`componentDidUpdate`/`componentWillUnmount`) mà dùng chung `useEffect` — và nên tư duy nó là công cụ **đồng bộ với hệ thống ngoài**, không phải ánh xạ 1-1 với ba giai đoạn trên.

</details>

**2. Phân biệt `render phase` và `commit phase`. React được phép làm gì và không được làm gì ở mỗi phase?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Render phase | Commit phase |
|---|---|---|
| Việc làm | Gọi hàm component, trả JSX, diff virtual DOM (reconciliation) | Apply thay đổi lên DOM thật, rồi chạy effect |
| Tính chất | **Pure**, không side effect | Được phép side effect |
| Có thể bị huỷ / chạy lại? | Có (Strict Mode chạy 2 lần, concurrent có thể bỏ dở) | Không — chạy một lần, đồng bộ |
| Truy cập DOM thật? | Không (ref chưa gắn) | Có (ref đã gắn) |

Trong render phase **không được** gọi API, ghi vào biến ngoài, mutate props/state, `console.log` gây hiệu ứng phụ, hay đọc/ghi DOM — vì React có thể gọi lại hàm component nhiều lần hoặc vứt bỏ kết quả. Mọi side effect phải nằm ở commit phase: trong `useEffect` / `useLayoutEffect`, hoặc trong event handler.

</details>

**3. Vì sao hàm component phải là `pure` — không được gọi API hay sửa biến bên ngoài ngay trong thân hàm?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì React coi hàm component là một **hàm thuần**: cùng props + state phải cho ra cùng JSX, không để lại dấu vết gì bên ngoài. React tự quyết định gọi hàm đó lúc nào và bao nhiêu lần — Strict Mode gọi 2 lần ở dev, concurrent rendering có thể render dở rồi bỏ, React Compiler có thể memo hoá kết quả.

```jsx
// Sai: fetch chạy lại MỖI lần render → gọi API thừa
function Profile({ userId }) {
  const data = fetch(`/api/users/${userId}`);
  setInterval(() => console.log("tick"), 1000); // leak, không có chỗ dọn
  return <p>{data}</p>;
}
```

Hậu quả khi không pure: gọi API thừa, timer chồng chất không được dọn, kết quả khác nhau giữa các lần render, bug chỉ hiện ở dev (do Strict Mode) hoặc chỉ hiện ở production. Giải pháp: đẩy side effect vào `useEffect` (đồng bộ với hệ thống ngoài, kèm cleanup) hoặc vào event handler (phản ứng với hành động người dùng).

</details>

**4. Những nguyên nhân nào khiến một component `re-render`? Đổi `props` có phải nguyên nhân duy nhất không?**

<details className="qa">
<summary>Xem đáp án</summary>

Không — props chỉ là một trong bốn nguyên nhân:

1. **State đổi** — gọi `setState` / setter của `useState` / dispatch của `useReducer` với giá trị mới.
2. **Props đổi** — parent render ra JSX với prop mới.
3. **Parent re-render** — mặc định mọi child cũng render lại, **kể cả khi không nhận prop nào**, trừ khi được bọc `React.memo`.
4. **Context value đổi** — mọi component đang `useContext` cho context đó re-render, bất kể memo.

```jsx
function Parent() {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>+</button>
      <Child />  {/* Child re-render dù không nhận prop */}
    </>
  );
}
```

Lưu ý: re-render **không đồng nghĩa với update DOM**. React diff virtual DOM và chỉ commit phần thực sự khác — nên re-render thường rất rẻ. Chỉ tối ưu khi đo được vấn đề bằng React DevTools Profiler.

</details>

**5. Component cha re-render thì con có bắt buộc re-render theo không? Làm sao để chặn?**

<details className="qa">
<summary>Xem đáp án</summary>

Mặc định **có** — React render lại toàn bộ subtree bên dưới, kể cả child không nhận prop nào. Cách chặn:

- **`React.memo(Child)`** — so sánh props nông (shallow) giữa hai lần render; giống nhau thì bỏ qua render.
- Nhưng memo chỉ hiệu quả khi **props ổn định về tham chiếu**. Object/array/function tạo mới mỗi render sẽ phá vỡ memo:

```jsx
<Child opts={{ a: 1 }} onClick={() => fn()} />
// mỗi render tạo object và function mới → memo luôn thấy "props đổi"
```

Do đó memo thường phải đi kèm `useMemo` (cho object/array) và `useCallback` (cho function).

- **Đưa state xuống thấp hơn** hoặc **dùng `children` làm prop** — phần JSX truyền qua `children` được tạo ở parent của parent nên không bị render lại.

Quan trọng: đừng memo hoá mặc định. Re-render thường rẻ; chỉ tối ưu component render lâu (> 16ms), render rất thường xuyên, hoặc là gốc của một subtree lớn.

</details>

**6. `useEffect` với mảng dependency rỗng `[]`, có dependency, và không truyền dependency — khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

```jsx
// 1. Không có deps → chạy sau MỖI lần render
useEffect(() => { /* ... */ });

// 2. [] → chỉ chạy 1 lần sau mount, cleanup khi unmount
useEffect(() => { /* ... */ }, []);

// 3. [a, b] → chạy khi mount và mỗi khi a hoặc b đổi
useEffect(() => { /* ... */ }, [a, b]);
```

| Dạng | Chạy khi | Cleanup chạy khi |
|---|---|---|
| Không deps | Sau mọi render | Trước mỗi lần chạy lại + unmount |
| `[]` | Sau render đầu tiên | Unmount |
| `[a, b]` | Mount + khi `a`/`b` đổi (so sánh `Object.is`) | Trước lần chạy tiếp + unmount |

React so sánh từng phần tử deps bằng `Object.is`, nên object/array/function tạo mới mỗi render sẽ luôn được coi là "đổi". Đừng nghĩ `[]` là "componentDidMount" — hãy hỏi *effect này đồng bộ với cái gì*, rồi deps tự nhiên là những giá trị mà việc đồng bộ phụ thuộc vào.

</details>

**7. Hàm `return` bên trong `useEffect` chạy vào lúc nào? Nêu một trường hợp quên viết nó sẽ gây rò rỉ bộ nhớ.**

<details className="qa">
<summary>Xem đáp án</summary>

Cleanup function chạy ở hai thời điểm: **trước khi effect chạy lại** (khi dependency đổi) và **khi component unmount**. Trong Strict Mode ở dev, nó còn chạy thêm một lần giữa hai lần mount giả lập.

```jsx
useEffect(() => {
  const id = setInterval(() => setCount(c => c + 1), 1000);
  return () => clearInterval(id); // thiếu dòng này → leak
}, []);
```

Nếu quên `clearInterval`, component unmount nhưng timer vẫn chạy: nó giữ tham chiếu tới closure (và cả state setter) nên bộ nhớ không được giải phóng, đồng thời gọi `setState` trên component đã chết. Điều hướng qua lại vài lần là có hàng loạt interval chạy song song.

Các trường hợp tương tự: `addEventListener` mà không `removeEventListener`, websocket/subscription không `unsubscribe`, `AbortController` không `abort`. Đây là lý do React khuyên **luôn viết cleanup** — production cũng có thể remount component (fast refresh, offscreen rendering).

</details>

**8. `useEffect` và `useLayoutEffect` chạy ở thời điểm khác nhau ra sao? Khi nào buộc phải dùng `useLayoutEffect`?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `useEffect` | `useLayoutEffect` |
|---|---|---|
| Thời điểm | **Sau** khi browser đã paint | **Sau** commit DOM, **trước** khi browser paint |
| Tính chất | Bất đồng bộ, không chặn paint | Đồng bộ, chặn paint |
| Ảnh hưởng hiệu năng | Không làm chậm hiển thị | Chậm sẽ làm giật/đứng hình |
| SSR | Bỏ qua trên server | Cảnh báo trên server |

Dùng `useLayoutEffect` khi bạn cần **đo DOM rồi chỉnh lại ngay** mà không muốn người dùng thấy nhấp nháy: đo kích thước phần tử để đặt vị trí tooltip/popover, đồng bộ scroll position, đo chiều cao để tính layout. Vì nó chạy trước paint nên người dùng chỉ thấy kết quả cuối.

Mặc định vẫn nên dùng `useEffect` — gọi API, subscription, analytics, timer đều thuộc nhóm này. Chỉ đổi sang `useLayoutEffect` khi thấy hiện tượng nhấp nháy do đo-rồi-sửa DOM.

</details>

**9. Ánh xạ `componentDidMount`, `componentDidUpdate`, `componentWillUnmount` sang hook tương đương. Chỗ nào không ánh xạ được 1-1?**

<details className="qa">
<summary>Xem đáp án</summary>

```jsx
// componentDidMount
useEffect(() => { /* ... */ }, []);

// componentDidUpdate (khi deps đổi)
useEffect(() => { /* ... */ }, [deps]);

// componentWillUnmount
useEffect(() => {
  return () => { /* dọn dẹp */ };
}, []);
```

Những chỗ **không** ánh xạ 1-1:

- `componentDidUpdate` nhận `prevProps` / `prevState`; `useEffect` không có. Muốn so sánh với giá trị cũ phải tự lưu bằng `useRef`.
- `componentDidUpdate` **không** chạy ở lần mount, còn `useEffect(..., [deps])` **có** chạy ở mount.
- Class tách rõ mount/update/unmount, còn một `useEffect` gộp cả ba theo trục "đồng bộ / ngừng đồng bộ". Ngược lại, hooks cho phép chia nhiều effect theo *mối quan tâm* thay vì theo *thời điểm* — điều class không làm được.
- `componentWillUnmount` chỉ chạy một lần khi huỷ, còn cleanup của `useEffect` chạy cả giữa các lần deps đổi.

Kết luận: đừng cố dịch từng hàm class sang hook, hãy nghĩ theo "effect này đồng bộ với hệ thống nào".

</details>

**10. Vì sao `StrictMode` cố tình gọi hàm component và chạy effect hai lần ở môi trường development? Nó giúp phát hiện loại bug nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Strict Mode (chỉ ở dev) gọi hàm component, `useState` initializer và effect **hai lần**, với chu trình `mount → cleanup → mount lại`. Mục đích là mô phỏng việc component có thể bị mount/unmount nhiều lần trong React 18+ (offscreen rendering, fast refresh, tương lai là các tính năng như state khôi phục), để lộ bug ngay trên máy dev thay vì trên production.

Nó phát hiện hai nhóm bug:

- **Hàm component không pure** — nếu thân hàm sửa biến ngoài, đẩy phần tử vào mảng dùng chung, hay gọi API, chạy 2 lần sẽ cho kết quả sai rõ ràng.
- **Effect thiếu cleanup:**

```jsx
useEffect(() => {
  const sub = api.subscribe(); // quên unsubscribe
}, []);
// mount(1) → unmount (không cleanup) → mount(2)
// ⇒ 2 subscription chạy song song
```

Viết cleanup đúng thì subscription đầu bị huỷ, chỉ còn một cái sống. Tắt Strict Mode là sai cách — nó đang bảo vệ bạn khỏi bug production.

</details>

**11. Code chạy đúng ở production nhưng ở dev thì gọi API hai lần — bạn xử lý thế nào, và có nên tắt `StrictMode` không?**

<details className="qa">
<summary>Xem đáp án</summary>

Không tắt `StrictMode`. Gọi hai lần ở dev là **hành vi cố ý** để kiểm tra effect có chịu được remount hay không. Nếu hai lần gọi gây ra lỗi thật (dữ liệu sai, ghi trùng), thì bug nằm ở effect chứ không ở Strict Mode.

Cách xử lý đúng là viết effect chịu được việc chạy lại:

```jsx
useEffect(() => {
  const ctrl = new AbortController();
  fetch(`/api/users/${userId}`, { signal: ctrl.signal })
    .then(r => r.json())
    .then(setData)
    .catch(e => { if (e.name !== "AbortError") throw e; });
  return () => ctrl.abort(); // request đầu bị huỷ khi remount
}, [userId]);
```

Hoặc dùng cờ `ignore` để bỏ qua kết quả của lần gọi cũ. Với các side effect **không idempotent** (thanh toán, gửi email, ghi log đơn hàng) thì chúng không nên nằm trong `useEffect` ngay từ đầu — hãy đặt trong event handler. Thực tế, dùng thư viện data-fetching (React Query, SWR, RTK Query) sẽ tự dedupe request và giải quyết luôn vấn đề này.

</details>

**12. `setState` bên trong `useEffect` không có dependency array dẫn tới hậu quả gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Vòng lặp vô hạn. Effect không có deps chạy sau **mọi** render; `setState` bên trong lại kích hoạt render mới; render mới lại chạy effect — chu trình `render → effect → setState → render` lặp mãi cho tới khi React ném lỗi "Too many re-renders" hoặc tab bị treo.

```jsx
// Sai: lặp vô hạn
useEffect(() => {
  setCount(count + 1);
});
```

Cách xử lý, theo thứ tự ưu tiên:

- **Không cần effect** — nếu giá trị tính được từ props/state hiện có thì tính thẳng trong lúc render (derived state), đừng lưu vào state.
- Thêm **dependency array** đúng để effect chỉ chạy khi thứ nó đồng bộ thực sự đổi.
- Nếu buộc phải set trong effect, dùng **updater function** (`setCount(c => c + 1)`) để không phụ thuộc giá trị cũ, và đặt điều kiện thoát.

Lưu ý: React sẽ bỏ qua re-render nếu `setState` nhận đúng giá trị cũ (so sánh `Object.is`), nên đôi khi vòng lặp "tự dừng" — che giấu lỗi cho tới khi giá trị là object mới mỗi lần.

</details>

**13. Vì sao đổi `key` của một component lại khiến nó bị `unmount` rồi `mount` lại, và state cũ mất sạch? Khi nào nên tận dụng điều này?**

<details className="qa">
<summary>Xem đáp án</summary>

Trong reconciliation, React so khớp phần tử cũ và mới theo **vị trí + type + key**. Key khác nghĩa là "đây là một phần tử khác" — React không tái sử dụng instance cũ mà huỷ nó (chạy cleanup của effect) rồi tạo instance mới. State và ref sống trong instance nên biến mất theo.

```jsx
// Đổi userId → Profile bị reset hoàn toàn, form nhập dở bị xoá
<Profile key={userId} userId={userId} />
```

Khi nào nên tận dụng: khi bạn muốn **reset state theo một định danh**, thay vì viết `useEffect` để tự dọn state mỗi khi prop đổi.

- Form chỉnh sửa hồ sơ: đổi sang user khác thì mọi input phải trống trở lại.
- Reset một widget bên thứ ba, một canvas, một chat panel khi đổi phòng.
- Buộc remount để chạy lại animation vào (mount animation).

Nhưng đừng lạm dụng: remount tốn hơn re-render, và trong danh sách thì key phải **ổn định và duy nhất** — dùng index làm key rồi sắp xếp lại danh sách sẽ gây remount ngoài ý muốn.

</details>

**14. Fetch dữ liệu trong `useEffect` có thể gặp `race condition` ra sao? Nêu cách xử lý bằng cờ `ignore` hoặc `AbortController`.**

<details className="qa">
<summary>Xem đáp án</summary>

Race condition xảy ra khi deps đổi nhanh: effect chạy lần 1 cho `userId = 1`, chưa kịp về thì deps đổi thành `2` và effect chạy lần 2. Nếu response của request 1 về **sau** request 2, `setData` của nó sẽ ghi đè dữ liệu đúng — UI hiện thông tin của user 1 trong khi đang xem user 2.

Cách 1 — cờ `ignore` (bỏ qua kết quả cũ):

```jsx
useEffect(() => {
  let active = true;
  fetch(`/api/users/${userId}`)
    .then(r => r.json())
    .then(d => { if (active) setData(d); });
  return () => { active = false; };
}, [userId]);
```

Cách 2 — `AbortController` (huỷ hẳn request, tiết kiệm băng thông):

```jsx
useEffect(() => {
  const ctrl = new AbortController();
  fetch(url, { signal: ctrl.signal })
    .then(r => r.json())
    .then(setData)
    .catch(e => { if (e.name !== "AbortError") setError(e); });
  return () => ctrl.abort();
}, [url]);
```

Cả hai đều dựa vào cleanup function. Trong dự án thật, dùng React Query/SWR sẽ xử lý sẵn race condition, cache và dedupe.

</details>

**15. `stale closure` là gì? Cho một ví dụ với `setInterval` bên trong `useEffect` và cách khắc phục.**

<details className="qa">
<summary>Xem đáp án</summary>

`Stale closure` là khi một hàm được tạo ở lần render cũ vẫn "nhớ" giá trị props/state của **lần render đó**, nên đọc ra dữ liệu đã cũ khi chạy về sau.

```jsx
const [count, setCount] = useState(0);

useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1); // count luôn là 0 — closure của render đầu
  }, 1000);
  return () => clearInterval(id);
}, []); // deps rỗng → callback không bao giờ được tạo lại
```

Kết quả: count đứng ở 1 mãi mãi, vì mỗi giây đều tính `0 + 1`.

Cách khắc phục:

- **Updater function** — không đọc state từ closure nữa:

```jsx
setCount(c => c + 1); // luôn nhận giá trị mới nhất
```

- **Khai báo đủ dependency** (`[count]`) để effect tạo lại interval với closure mới — nhưng interval bị reset mỗi lần.
- **`useRef`** giữ giá trị/callback mới nhất, effect đọc qua `ref.current`.

Bật ESLint rule `react-hooks/exhaustive-deps` là cách phòng bug này hiệu quả nhất.

</details>

**16. React 18 gộp nhiều `setState` thành một lần re-render (`automatic batching`). Điều này khác gì so với React 17?**

<details className="qa">
<summary>Xem đáp án</summary>

**Batching** là gộp nhiều lần cập nhật state thành **một** lần re-render để tránh render thừa.

| | React 17 | React 18 |
|---|---|---|
| Trong React event handler | Có batching | Có batching |
| Trong `setTimeout` / `Promise.then` | **Không** — mỗi `setState` một render | Có |
| Trong callback của `fetch`, native event listener | **Không** | Có |

```jsx
function handleClick() {
  setCount(c => c + 1);
  setFlag(f => !f);
  // React 17 & 18: 1 lần re-render
}

setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // React 17: 2 lần re-render — React 18: 1 lần
}, 0);
```

React 18 gọi đây là **automatic batching** vì nó áp dụng cho mọi nơi, không chỉ trong event handler của React. Điều kiện: dùng `createRoot` (root API mới); dùng `ReactDOM.render` cũ thì vẫn giữ hành vi React 17. Nếu cần render ngay lập tức sau một update (hiếm, thường để đo DOM), có thể bọc bằng `flushSync`.

</details>

---

## 2. Lists and Keys

Bài học: [2. Lists and Keys](../../react/05-rendering/2_lists-keys.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `key` trong React dùng để làm gì, và vì sao khi render danh sách lại bắt buộc phải có nó?**

<details className="qa">
<summary>Xem đáp án</summary>

`key` là định danh giúp React **nhận diện từng phần tử qua các lần render**. Khi so sánh mảng element cũ và mới trong reconciliation, React dùng key để biết phần tử nào được giữ lại, phần tử nào mới thêm, phần tử nào đã bị xoá:

- Key giống nhau → **giữ nguyên** component instance (state, focus, scroll, DOM node).
- Key mới xuất hiện → **mount** component mới.
- Key biến mất → **unmount** component cũ.

Không có key, React chỉ có thể so khớp theo **vị trí** trong mảng. Khi list thêm, xoá hoặc đảo thứ tự, phần tử ở vị trí cũ sẽ bị gán dữ liệu của phần tử khác — mất state input, checkbox tick nhầm dòng, animation chạy lại sai chỗ.

```jsx
{todos.map(todo => (
  <li key={todo.id}>
    <input defaultValue={todo.text} />
  </li>
))}
```

Vì vậy key không phải chuyện làm cho đẹp mà là điều kiện để React cập nhật UI **đúng**.

</details>

**2. `key` có phải là một prop bình thường không — component con có đọc được `props.key` không?**

<details className="qa">
<summary>Xem đáp án</summary>

Không. `key` (cùng với `ref`) là **thuộc tính đặc biệt do React giữ lại**, không được truyền xuống component con. Bên trong `MyItem`, `props.key` sẽ là `undefined` và React còn cảnh báo khi bạn cố đọc nó.

```jsx
// Sai: con không nhận được key
<Item key={item.id} />

// Đúng: muốn con dùng id thì truyền thêm prop riêng
<Item key={item.id} id={item.id} />
```

Lý do: key phục vụ **React** trong quá trình reconciliation, ở tầng cao hơn component — React đọc key từ React element rồi loại khỏi props trước khi gọi hàm component. Nếu key là prop bình thường thì việc component đọc/sửa nó sẽ phá vỡ cơ chế so khớp.

Hệ quả thực tế: mỗi khi cần chính giá trị đó trong component, phải truyền nó thêm một lần dưới tên khác (`id`, `itemId`...).

</details>

**3. `key` cần duy nhất trong phạm vi nào: toàn ứng dụng, toàn component, hay chỉ giữa các phần tử anh em (`sibling`)?**

<details className="qa">
<summary>Xem đáp án</summary>

Chỉ cần duy nhất **giữa các phần tử anh em** — tức trong cùng một mảng / cùng một `.map`. Không cần duy nhất toàn ứng dụng, cũng không cần duy nhất toàn component.

```jsx
function App() {
  return (
    <>
      {usersA.map(u => <UserCard key={u.id} user={u} />)}
      {usersB.map(u => <UserCard key={u.id} user={u} />)}
    </>
  );
}
```

Hai danh sách trên có thể trùng `id` mà React vẫn không nhầm, vì chúng là hai tập anh em riêng biệt.

Nhưng nếu **gộp** chúng lại thành một mảng thì key phải duy nhất trong mảng gộp đó:

```jsx
{[...usersA, ...usersB].map(u => <UserCard key={u.id} user={u} />)}
// id trùng giữa hai nguồn → bug
```

Cách xử lý: thêm prefix theo nguồn, ví dụ ``key={`a-${u.id}`}`` cho list A và ``key={`b-${u.id}`}`` cho list B.

</details>

**4. Điều gì xảy ra nếu render một mảng mà không truyền `key`? React cảnh báo gì và fallback theo cơ chế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

React in cảnh báo trong console: *"Warning: Each child in a list should have a unique key prop"*, kèm tên component để bạn lần ra chỗ thiếu. App vẫn chạy — đây là warning chứ không phải lỗi.

Về cơ chế, React **fallback sang so khớp theo index** trong mảng: phần tử thứ 0 của lần render cũ được ghép với phần tử thứ 0 của lần render mới, thứ 1 với thứ 1... Nói cách khác, không truyền key tương đương ngầm dùng `key={index}`, kèm theo mọi bug của nó.

Hậu quả khi list thay đổi thứ tự hoặc chèn/xoá ở giữa:

- React coi các item như "vẫn là instance cũ", chỉ update props → dữ liệu bị gán nhầm dòng.
- DOM node được tái sử dụng → state của uncontrolled input, focus, caret, trạng thái IME ở lại sai chỗ.
- Component state (`useState` bên trong item) bị lệch; effect không chạy lại như mong đợi.

Vì vậy cảnh báo này không nên bỏ qua.

</details>

**5. Giải thích cơ chế `reconciliation`: React so khớp element cũ và mới trong một list dựa trên cái gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Reconciliation là quá trình React so sánh cây element của lần render trước với lần render mới để tính ra tập thay đổi tối thiểu cần commit lên DOM thật. Với các phần tử anh em, React so khớp theo bộ ba:

- **Vị trí** trong cây (element đứng ở đâu).
- **Type** của element (`li`, `div`, hay component `UserCard`).
- **Key**, nếu có — key được ưu tiên hơn vị trí.

Quy tắc kết quả:

| Trường hợp | React làm gì |
|---|---|
| Cùng key, cùng type | Giữ instance cũ, chỉ cập nhật props |
| Cùng key, khác type | Unmount cũ, mount mới |
| Key mới | Mount component mới |
| Key cũ không còn | Unmount, chạy cleanup effect |

Không có key thì vị trí quyết định tất cả. Có key ổn định thì dù item nhảy từ vị trí 3 lên vị trí 0, React vẫn biết đó là cùng một item và chỉ di chuyển DOM node, giữ nguyên state.

</details>

**6. Vì sao KHÔNG nên dùng `index` của mảng làm `key`? Hãy mô tả một bug cụ thể sinh ra từ việc này.**

<details className="qa">
<summary>Xem đáp án</summary>

Vì index **gắn với vị trí chứ không gắn với dữ liệu**. Khi list đảo thứ tự hoặc chèn/xoá ở giữa, cùng một index lại trỏ vào một item khác, nên React tưởng "vẫn là phần tử cũ" và chỉ cập nhật props trên instance cũ.

Ví dụ prepend một item:

```jsx
const [items, setItems] = useState(["a", "b", "c"]);
items.map((item, i) => <input key={i} defaultValue={item} />);

setItems(["NEW", "a", "b", "c"]);
```

Với `key={index}`:

- Input key `0`: trước là "a", giờ là "NEW" — nhưng đây là `defaultValue`, DOM node cũ được tái sử dụng nên **text user đã gõ vẫn còn nguyên**, giờ đứng cạnh nhãn sai.
- Input key `1`: "b" → "a"; key `2`: "c" → "b"; và một input mới được thêm ở cuối.
- Kết quả: mọi giá trị người dùng nhập bị lệch một dòng.

Với `key={item.id}` ổn định, React chỉ mount thêm một input cho item "NEW" và giữ nguyên ba input cũ cùng state của chúng.

</details>

**7. Dùng `index` làm `key` là vấn đề `correctness` hay chỉ là vấn đề `performance`? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Là vấn đề **correctness** — hiệu năng chỉ là hệ quả phụ.

Nhiều người tưởng key chỉ giúp React diff nhanh hơn, nên dùng index thì "chỉ chậm hơn chút". Thực tế, key quyết định React **giữ instance nào**, mà instance mang theo state. Khi key sai, React giữ nhầm instance và ghép nó với dữ liệu khác:

- `useState` bên trong item giữ giá trị của item cũ.
- Uncontrolled input (`defaultValue`), checkbox, focus, vị trí scroll, trạng thái animation đi theo DOM node cũ.
- Effect có `[item.id]` trong deps không chạy lại đúng lúc.

Đây là **hiển thị sai dữ liệu**, không phải chậm. Người dùng tick checkbox dòng 3 rồi xoá dòng 1, tick nhảy sang dòng khác — lỗi nghiệp vụ thật sự.

Về hiệu năng, index sai còn khiến React update nội dung của gần như mọi DOM node thay vì chỉ move node, nhưng đó là vấn đề nhỏ hơn nhiều.

</details>

**8. Trong trường hợp nào thì dùng `index` làm `key` vẫn chấp nhận được? Nêu đủ các điều kiện.**

<details className="qa">
<summary>Xem đáp án</summary>

Chấp nhận được khi **cả ba** điều kiện sau đồng thời đúng:

1. **Danh sách không bao giờ đổi thứ tự** — không sort, không filter làm đổi vị trí, không drag-drop.
2. **Không chèn/xoá ở giữa** — chỉ append hoặc pop ở cuối, hoặc danh sách hoàn toàn tĩnh.
3. **Item không có state nội bộ** — không chứa uncontrolled input, checkbox, focus, animation, `useState` riêng.

```jsx
// Chấp nhận được: menu tĩnh, render một lần, item thuần text
{["Trang chủ", "Sản phẩm", "Liên hệ"].map((label, i) => (
  <li key={i}>{label}</li>
))}
```

Ngoài ra còn một điều kiện ngầm: dữ liệu **thật sự không có id ổn định** để dùng. Nếu data có `id` thì cứ dùng `id`, không có lý do gì chọn index.

Quy tắc ghi nhớ: *nếu thứ tự item có thể đổi → tuyệt đối không dùng index*. Khi phân vân, chọn id — dùng id không bao giờ sai, dùng index thì có thể sai.

</details>

**9. Cho một todo list có checkbox và `key={index}`: khi xoá item đầu tiên, trạng thái checkbox bị sai như thế nào? Giải thích từng bước.**

<details className="qa">
<summary>Xem đáp án</summary>

Giả sử list là A, B, C; người dùng tick checkbox của **C**. Checkbox là uncontrolled (state nằm trong DOM node), key lần lượt là `0`, `1`, `2`.

Xoá A, list mới còn B, C với key `0`, `1`:

1. React so khớp theo key. Key `0` cũ (A) ghép với key `0` mới (B) — cùng type `li` nên **tái sử dụng DOM node của A**, chỉ đổi text thành "B".
2. Key `1` cũ (B) ghép với key `1` mới (C) — tái sử dụng DOM node của B, đổi text thành "C".
3. Key `2` (C) không còn trong list mới → React **unmount** node của C, kèm theo checkbox đang được tick.

Kết quả: dấu tick biến mất khỏi C, còn B/C hiển thị với node của A/B vốn chưa tick. Trạng thái tick "trôi" sai hoàn toàn so với dữ liệu.

Với `key={todo.id}`, React thấy key của A biến mất → chỉ unmount A; B và C giữ nguyên instance và dấu tick ở đúng chỗ.

</details>

**10. Vì sao dùng `Math.random()` hay `Date.now()` làm `key` là anti-pattern? Hậu quả cụ thể với focus và animation là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì chúng sinh **giá trị mới ở mỗi lần render**, nên không có key nào của lần render trước khớp với lần render sau.

```jsx
// SAI — key đổi mỗi render → toàn bộ list remount
{items.map(item => <li key={Math.random()}>{item.name}</li>)}
```

React kết luận: mọi item cũ đã bị xoá, mọi item mới vừa được thêm. Hệ quả ở mỗi lần render:

- **Unmount toàn bộ** DOM node cũ, chạy cleanup mọi effect, rồi **mount lại** từ đầu → chi phí cao nhất có thể, đúng thứ mà key sinh ra để tránh.
- **Focus**: input đang được gõ bị huỷ node → con trỏ nhảy ra ngoài, người dùng không gõ tiếp được; bộ gõ tiếng Việt/IME đứt giữa chừng.
- **Animation / transition**: node mới luôn bắt đầu lại từ trạng thái ban đầu, nên animation vào bị lặp vô hạn hoặc nhấp nháy; CSS transition không chạy vì không có trạng thái cũ để nội suy.
- State bên trong item, vị trí scroll, giá trị uncontrolled input đều bị reset.

Key phải **ổn định, duy nhất và suy ra được từ dữ liệu**, không phải sinh ngẫu nhiên lúc render.

</details>

**11. `useId` có dùng làm `key` cho item của một danh sách data được không? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Không. `useId` sinh ra một chuỗi định danh duy nhất **cho một component instance**, mục đích là nối nhãn với input trong accessibility (`htmlFor` / `aria-describedby`) và giữ id khớp nhau giữa server và client khi hydrate.

Nó không hợp làm key vì:

- Là hook, nên phải gọi ở thân component — không gọi được bên trong callback của `.map`.
- Id được cấp theo **vị trí của component trong cây**, không gắn với dữ liệu. Item đổi chỗ thì id đổi theo vị trí, đúng y vấn đề của `key={index}`.
- Nó không giúp React nhận diện *dữ liệu nào là dữ liệu nào* — điều duy nhất key cần làm.

```jsx
// Đúng mục đích của useId
function Field({ label }) {
  const id = useId();
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input id={id} />
    </>
  );
}
```

Với key, hãy đảm bảo dữ liệu có id ổn định từ nguồn (DB autoincrement, UUID sinh lúc tạo record, hoặc hash nội dung).

</details>

**12. Đặt `key` sai vị trí — trên element con thay vì element ngoài cùng trả về từ `.map` — thì có tác dụng không? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Không có tác dụng. React đọc key của các phần tử **trực tiếp nằm trong mảng** mà `.map` trả về. Key đặt sâu bên trong chỉ là key của phần tử con trong phạm vi anh em của nó — nơi vốn chỉ có một phần tử, nên vô nghĩa.

```jsx
// Sai — React vẫn cảnh báo thiếu key, vẫn fallback theo index
{items.map(item => (
  <li>
    <div key={item.id}>{item.name}</div>
  </li>
))}

// Đúng — key trên element trả thẳng từ map
{items.map(item => (
  <li key={item.id}>
    <div>{item.name}</div>
  </li>
))}
```

Dấu hiệu nhận biết: console vẫn in cảnh báo "Each child in a list should have a unique key prop" dù bạn thấy chữ `key` trong code.

Trường hợp hay gặp là khi tách component: nếu `.map` trả về `<Row item={item} />` thì key phải đặt trên `<Row>` tại chỗ gọi, không phải trên thẻ gốc bên trong `Row`.

</details>

**13. Khi render danh sách bằng `Fragment`, vì sao không dùng được cú pháp rút gọn mà phải dùng dạng đầy đủ `Fragment`?**

<details className="qa">
<summary>Xem đáp án</summary>

Cú pháp rút gọn `<>...</>` là đường cú pháp không nhận **bất kỳ thuộc tính nào** — kể cả `key`. Muốn gắn key thì phải import và dùng dạng đầy đủ:

```jsx
import { Fragment } from "react";

{items.map(item => (
  <Fragment key={item.id}>
    <dt>{item.term}</dt>
    <dd>{item.desc}</dd>
  </Fragment>
))}
```

Tình huống này xuất hiện khi mỗi item cần trả về **nhiều thẻ anh em** mà không được bọc thêm thẻ cha — ví dụ `dt`/`dd` trong `dl`, hay `td` trong một hàng bảng, vì chèn `div` vào giữa sẽ phá cấu trúc HTML hợp lệ và cả CSS Grid/Flex của cha.

Cần nhớ `Fragment` chỉ nhận đúng hai thuộc tính: `key` và `children`. Nó không tạo DOM node nào, chỉ tồn tại trong cây React để React có chỗ gắn key.

</details>

**14. Điều gì xảy ra khi hai phần tử anh em có `key` trùng nhau?**

<details className="qa">
<summary>Xem đáp án</summary>

React in cảnh báo *"Encountered two children with the same key"* và cho biết hành vi sau đó là không đảm bảo — chỉ phần tử đầu tiên mang key đó được xử lý đáng tin cậy.

```jsx
{items.map(item => (
  <li key={item.category}>{item.name}</li>
))}
// Nhiều item cùng category → key trùng
```

Hậu quả thường gặp:

- Có item **bị bỏ qua**, không hiển thị, hoặc hiển thị rồi biến mất khi list cập nhật.
- React so khớp nhầm instance giữa các lần render → state, focus, giá trị input dính sai phần tử.
- Xoá một item lại làm item khác biến mất theo.

Nguyên nhân phổ biến: lấy một trường không duy nhất làm key (category, tên, email), hoặc merge hai danh sách từ hai nguồn có id trùng nhau.

Cách xử lý: chọn trường thực sự duy nhất, hoặc ghép nhiều trường thành composite key, ví dụ ``key={`${item.category}-${item.name}`}``. Đừng bỏ qua cảnh báo này — nó luôn báo hiệu một bug đang chờ xảy ra.

</details>

**15. Khi merge hai mảng từ hai nguồn khác nhau thành một list, làm sao tránh trùng `key`?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi để riêng, hai danh sách có thể trùng id mà không sao vì chúng thuộc hai tập anh em khác nhau. Nhưng khi gộp, chúng thành anh em với nhau nên key phải duy nhất trong mảng gộp.

Cách phổ biến nhất là **thêm prefix theo nguồn**:

```jsx
{[
  ...usersA.map(u => ({ ...u, key: `a-${u.id}` })),
  ...usersB.map(u => ({ ...u, key: `b-${u.id}` })),
].map(u => <UserCard key={u.key} user={u} />)}
```

Hoặc gắn prefix ngay lúc render nếu vẫn map riêng từng nguồn. Các hướng khác:

- Dùng một trường **đã duy nhất toàn cục** nếu có, ví dụ UUID thay cho id autoincrement của từng bảng.
- Ghép id với `type`/`source` sẵn có trong dữ liệu: ``key={`${u.type}-${u.id}`}``.

Điều cần tránh: dùng index của mảng gộp làm key — vì mảng gộp thường chính là thứ hay thay đổi thứ tự (sort, filter theo nguồn), đúng kịch bản sinh bug của index.

</details>

**16. Nếu data không có id duy nhất, có những chiến lược nào để sinh `key` ổn định? Đánh đổi của từng cách là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

| Chiến lược | Ví dụ | Đánh đổi |
|---|---|---|
| Dùng chính nội dung nếu nó duy nhất | `key={tag}` cho danh sách tag | Đơn giản, nhưng sửa nội dung = đổi key → remount; nội dung trùng thì vỡ |
| Composite key ghép nhiều trường | ``key={`${item.category}-${item.name}`}`` | Giảm rủi ro trùng, nhưng vẫn không đảm bảo tuyệt đối và dài dòng |
| Hash nội dung | `key={hash(JSON.stringify(item))}` | Ổn định theo dữ liệu, nhưng tốn CPU và vẫn remount khi nội dung đổi |
| Sinh id một lần khi nạp dữ liệu | Gắn `crypto.randomUUID()` lúc fetch xong, lưu vào state | Ổn định qua các lần render, chuẩn nhất khi không sửa được backend |
| Index | `key={i}` | Chỉ chấp nhận với list tĩnh, không reorder, item không có state |

Điểm mấu chốt: key phải **được sinh từ dữ liệu, không sinh trong lúc render**. Sinh id ngay tại chỗ (`Math.random()` trong `.map`) luôn sai vì mỗi render lại ra giá trị khác.

Giải pháp tốt nhất vẫn là sửa từ gốc: **đảm bảo API/DB trả về id** (autoincrement, UUID). Mọi cách trên chỉ là phương án chữa cháy ở phía client.

</details>

**17. Đổi `key` của một component (dù giữ nguyên kiểu component) dẫn tới điều gì? Có thể tận dụng để reset state không, và khi nào nên hoặc không nên?**

<details className="qa">
<summary>Xem đáp án</summary>

React coi đó là **một component khác**: unmount instance cũ (chạy cleanup của mọi effect, huỷ DOM node) rồi mount instance mới. Toàn bộ state, ref, giá trị uncontrolled input, vị trí scroll đều mất sạch.

Đây là kỹ thuật reset state được React khuyến nghị:

```jsx
// Đổi user → form được làm mới hoàn toàn
<ProfileForm key={userId} userId={userId} />
```

Nên dùng khi:

- Form chỉnh sửa theo một đối tượng — đổi đối tượng thì mọi input phải trống trở lại.
- Reset widget bên thứ ba, canvas, chat panel khi đổi ngữ cảnh (đổi phòng, đổi tab).
- Muốn chạy lại animation vào của component.

Cách này gọn hơn nhiều so với viết `useEffect` theo dõi prop rồi tự set lại từng state.

Không nên dùng khi:

- Component nặng (biểu đồ lớn, bảng nhiều nghìn dòng) — remount đắt hơn re-render rất nhiều.
- Chỉ cần reset **một phần** state, hoặc muốn giữ dữ liệu đã fetch.
- Trong danh sách: đừng cố tình đổi key để "làm mới" — đó chính là bug của `key={index}`.

</details>

**18. So sánh chi phí thao tác DOM khi reorder một list với `key` ổn định so với `key={index}`.**

<details className="qa">
<summary>Xem đáp án</summary>

Giả sử đảo ngược một list `n` phần tử, mỗi phần tử là một subtree có nội dung.

Với **key ổn định**: React nhận ra tất cả key cũ vẫn còn, chỉ khác vị trí. Nó giữ nguyên mọi DOM node và component instance, chỉ phát ra các thao tác **move** (`insertBefore`) để sắp xếp lại. Props không đổi thì nội dung bên trong không phải đụng tới; state, focus, scroll giữ nguyên.

Với **`key={index}`**: key `0..n-1` vẫn khớp nhau nên React tưởng không có gì bị di chuyển — nhưng **props của mọi item đều đổi**. Nó phải render lại toàn bộ `n` component và cập nhật nội dung của gần như mọi DOM node trong subtree (text, thuộc tính, ảnh...).

| | Key ổn định | `key={index}` |
|---|---|---|
| Thao tác DOM | `n` lần move node | Cập nhật nội dung `n` subtree |
| Render lại component con | Có thể bỏ qua nếu props không đổi | Luôn render lại tất cả |
| State / focus / scroll | Giữ đúng theo item | Ở lại theo vị trí → sai |

Move node thường rẻ hơn ghi lại nội dung, nhưng khác biệt lớn nhất vẫn là **tính đúng đắn**, không phải tốc độ.

</details>

**19. `key` ảnh hưởng thế nào tới việc React giữ hay huỷ DOM node, focus, vị trí scroll và giá trị của `uncontrolled input`?**

<details className="qa">
<summary>Xem đáp án</summary>

Key quyết định React **tái sử dụng hay huỷ** DOM node. Mà những thứ dưới đây sống trong chính DOM node chứ không nằm trong React state, nên chúng đi theo node:

- **Focus**: trình duyệt giữ focus trên một element cụ thể. Node bị huỷ → focus mất, con trỏ nhảy về `body`, bộ gõ IME đứt giữa chừng. Node được tái sử dụng nhưng gán sai dữ liệu → người dùng đang gõ vào "đúng ô, sai dòng".
- **Vị trí scroll** của phần tử cuộn được: giữ nguyên nếu node được tái sử dụng, về `0` nếu node bị mount lại.
- **Uncontrolled input** (`defaultValue`, `defaultChecked`): giá trị do DOM giữ, React không quản. Đây là lý do bug với `key={index}` hiện rõ nhất ở nhóm này — text đã gõ ở lại theo vị trí chứ không theo dữ liệu.
- **Animation / transition**: node mới bắt đầu lại từ đầu; node cũ tiếp tục trạng thái đang có.

Tóm lại: key ổn định → node đi theo **dữ liệu**; key theo index hoặc ngẫu nhiên → node đi theo **vị trí** hoặc bị huỷ hết. Controlled input thì an toàn hơn vì giá trị nằm trong React state, nhưng focus và scroll vẫn bị ảnh hưởng.

</details>

**20. Với danh sách rất lớn, ngoài việc chọn `key` đúng còn kỹ thuật nào để tối ưu render (ví dụ `virtualization`)?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Virtualization (windowing)** — chỉ render các dòng đang nằm trong viewport (cộng thêm một ít overscan), phần còn lại thay bằng khoảng trống có chiều cao tương ứng. Danh sách 10.000 dòng chỉ còn vài chục DOM node. Thư viện phổ biến: TanStack Virtual, `react-window`, `react-virtuoso`. Đây là kỹ thuật hiệu quả nhất và nên áp dụng đầu tiên.
- **Phân trang hoặc infinite scroll** — không nạp hết dữ liệu về client ngay từ đầu, giảm cả thời gian mạng lẫn thời gian render.
- **`React.memo` cho component dòng**, kết hợp `useCallback` cho handler và `useMemo` cho object prop, để khi list re-render thì các dòng không đổi được bỏ qua.
- **Đẩy việc nặng ra khỏi render**: sort/filter/tính toán bằng `useMemo`, hoặc làm sẵn ở server.
- **Tách state cục bộ xuống từng dòng** để gõ vào một input không kéo theo re-render cả danh sách.
- **`useDeferredValue` / `startTransition`** cho ô tìm kiếm trên danh sách lớn, giữ input mượt trong khi kết quả cập nhật ở mức ưu tiên thấp.
- **Giữ DOM mỗi dòng đơn giản** — số node trên mỗi dòng nhân với số dòng mới là chi phí thật.

</details>

---

## 3. Render Props

Bài học: [3. Render Props](../../react/05-rendering/3_render-props.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `Render props` là gì? Hãy mô tả pattern này bằng lời và bằng một ví dụ tối giản.**

<details className="qa">
<summary>Xem đáp án</summary>

Là pattern truyền một **function làm prop**, function đó trả về JSX. Component chứa logic không tự quyết định giao diện mà **gọi ngược** function này kèm dữ liệu; nơi sử dụng dựa vào dữ liệu để render theo ý mình. Nhờ vậy một component logic phục vụ được nhiều giao diện khác nhau.

```jsx
function MouseTracker({ children }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const h = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);
  return children(pos); // đưa data ra, nơi dùng tự render
}

<MouseTracker>{({ x, y }) => <p>A: {x}, {y}</p>}</MouseTracker>
<MouseTracker>{({ x, y }) => <Dot left={x} top={y} />}</MouseTracker>
```

Điểm mấu chốt: **logic tách khỏi render**. Cùng một `MouseTracker`, nơi thì hiện toạ độ bằng chữ, nơi thì vẽ một chấm tròn.

</details>

**2. Pattern này ra đời để giải quyết vấn đề gì trong thời kỳ trước khi có Hooks?**

<details className="qa">
<summary>Xem đáp án</summary>

Trước React 16.8, **logic stateful** (state + lifecycle) chỉ tồn tại được bên trong class component, mà class thì không có cách nào chia sẻ phần logic đó cho class khác. Muốn dùng lại logic theo dõi chuột, fetch dữ liệu, đo kích thước cửa sổ... bạn chỉ có ba lựa chọn:

- **Copy-paste** logic vào từng component — lặp code, sửa một chỗ quên chỗ khác.
- **Mixins** — bị React bỏ vì xung đột tên và khó truy vết nguồn gốc state.
- **HOC** — bọc component, nhưng gây "wrapper hell", va chạm tên prop và mất kiểu dữ liệu.

Render props là lời giải thứ tư: gom logic vào một component, rồi **đưa kết quả ra ngoài qua một function** thay vì tự render. Nó giải quyết được chia sẻ logic mà vẫn giữ nguồn gốc dữ liệu rõ ràng (nhìn JSX là biết data đến từ đâu).

Hooks ra đời năm 2019 giải đúng bài toán này một cách gọn hơn, nên ngày nay render props chỉ còn dùng cho các tình huống đặc thù.

</details>

**3. Tên prop có bắt buộc phải là `render` không? Cách dùng `children` như một function khác gì về cú pháp và về trải nghiệm đọc code?**

<details className="qa">
<summary>Xem đáp án</summary>

Không bắt buộc. "Render props" là tên **pattern**, không phải tên prop. Prop có thể tên gì cũng được: `render`, `renderRow`, `renderItem`, `renderField`, hoặc chính `children`.

```jsx
// Dạng prop có tên
<DataLoader render={data => <div>{data}</div>} />

// Dạng children-as-function
<DataLoader>
  {data => <div>{data}</div>}
</DataLoader>
```

| | Prop có tên | `children` là function |
|---|---|---|
| Nhiều slot | Dễ — mỗi slot một prop (`renderHeader`, `renderRow`) | Chỉ có một slot |
| Đọc code | Rõ vai trò từng slot, nhưng JSX nằm trong thuộc tính nên khó nhìn khi dài | Tự nhiên hơn, JSX nằm đúng chỗ thân component |
| Nhược điểm | Hàm dài nhét trong attribute gây rối | Người mới dễ bất ngờ vì `children` không phải JSX |

Thực tế: cần **một** vùng tuỳ biến thì dùng `children`; cần **nhiều** vùng thì đặt tên rõ ràng cho từng prop.

</details>

**4. So sánh `render props` với `HOC`: ưu và nhược của từng cách khi cần chia sẻ logic?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Render props | HOC |
|---|---|---|
| Cách hoạt động | Truyền function vào, component logic gọi ngược | Hàm nhận component, trả về component mới đã bọc |
| Nguồn gốc dữ liệu | Rõ ràng — nhìn JSX là biết prop đến từ đâu | Ẩn — props "từ trên trời rơi xuống" |
| Va chạm tên prop | Không, vì tham số do bạn đặt tên | Có — hai HOC cùng inject `data` là đè nhau |
| Thời điểm quyết định | Runtime, linh hoạt theo dữ liệu | Lúc định nghĩa component (tĩnh) |
| Cây component | Lồng JSX sâu | Nhiều lớp wrapper trong DevTools |
| TypeScript | Khai báo type cho render function hơi dài | Khó, phải xử lý generic + `Omit` props |

Cả hai đều mắc chung một bệnh: **lồng nhiều tầng** khi cần gộp nhiều logic. HOC lồng theo chiều ngang (`withA(withB(withC(X)))`), render props lồng theo chiều dọc trong JSX.

Ngày nay cả hai đều nhường chỗ cho **custom hook** trong việc chia sẻ logic stateful. HOC vẫn còn giá trị cho các việc mang tính cross-cutting như bọc error boundary hay gắn theming.

</details>

**5. So sánh `render props` với `custom hook` — vì sao React hiện đại ưu tiên hook cho việc chia sẻ logic stateful?**

<details className="qa">
<summary>Xem đáp án</summary>

```jsx
// Render props
<MouseTracker>
  {({ x, y }) => <p>{x}, {y}</p>}
</MouseTracker>

// Custom hook
function MyComponent() {
  const { x, y } = useMousePosition();
  return <p>{x}, {y}</p>;
}
```

| | Render Props | Custom Hook |
|---|---|---|
| Cú pháp | Lồng JSX | Gọi như một function thường |
| Type inference (TS) | Khá — phải khai báo type render function | **Tốt hơn**, TS suy ra trực tiếp |
| Dùng nhiều logic cùng lúc | Phải nesting nhiều tầng | Gọi nối tiếp nhiều dòng |
| Test | Phải mount cả component | `renderHook` của Testing Library |
| DevTools | Ẩn trong cây component | Hiện rõ tên hook và state |
| Chia sẻ cho class component | Được | Không (chỉ function component) |

Lý do cốt lõi: hook tách logic ra khỏi **cấu trúc cây UI**. Render props phải tạo thêm một component và một tầng JSX chỉ để lấy dữ liệu — vừa làm cây sâu thêm vừa khiến việc kết hợp nhiều nguồn dữ liệu trở nên rối. Hook không đụng gì tới cây, nên kết hợp bao nhiêu cũng chỉ là thêm dòng code.

</details>

**6. "Wrapper hell" khi lồng nhiều `render props` là gì, và nó gây khó khăn gì khi đọc code cũng như khi debug?**

<details className="qa">
<summary>Xem đáp án</summary>

Là tình trạng JSX thụt lề ngày càng sâu khi mỗi nguồn dữ liệu lại thêm một tầng render props:

```jsx
<UserData>
  {user => (
    <OrderData userId={user.id}>
      {orders => (
        <PaymentData orderId={orders[0].id}>
          {payments => /* ... */}
        </PaymentData>
      )}
    </OrderData>
  )}
</UserData>
```

So với hook:

```jsx
function Page() {
  const user = useUser();
  const orders = useOrders(user.id);
  const payments = usePayments(orders[0]?.id);
  return /* ... */;
}
```

Khó khăn khi đọc: nội dung thật nằm ở tầng sâu nhất, thụt lề mạnh; thêm một nguồn dữ liệu phải sửa cả khối; khó tách hàm con vì mọi thứ dính vào closure lồng nhau.

Khó khăn khi debug: React DevTools hiện một chuỗi wrapper không mang ý nghĩa nghiệp vụ; stack trace dài và giống nhau; đặt breakpoint phải lần qua nhiều tầng; sửa thứ tự phụ thuộc giữa các nguồn dữ liệu đồng nghĩa với việc viết lại toàn bộ khối JSX.

</details>

**7. `Render props` ảnh hưởng thế nào tới khả năng suy luận kiểu (`type inference`) của TypeScript so với custom hook?**

<details className="qa">
<summary>Xem đáp án</summary>

Với **custom hook**, TS suy ra kiểu trả về trực tiếp từ thân hàm — không cần khai báo gì thêm:

```ts
function useMousePosition() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  return pos; // TS tự biết: { x: number; y: number }
}

const { x, y } = useMousePosition(); // x, y là number
```

Với **render props**, bạn phải khai báo kiểu cho chính function đó trong props của component:

```ts
type MouseTrackerProps = {
  children: (pos: { x: number; y: number }) => React.ReactNode;
};
```

Vấn đề phát sinh khi component logic là **generic** (ví dụ `DataLoader<T>`): TS phải suy ra `T` từ prop khác rồi truyền vào tham số của render function. Việc này hay thất bại ở các trường hợp lồng nhau, khiến tham số rơi về `any` hoặc `unknown`, và lỗi báo ra thường rất khó đọc.

Ngoài ra, khi lồng nhiều tầng render props, mỗi tầng lại là một callback mới nên TS không thể "nối" kiểu xuyên tầng gọn như khi gọi hook tuần tự.

</details>

**8. Truyền một arrow function inline làm render prop có gây vấn đề performance không? Vì sao, và `React.memo` hay `useCallback` giúp được gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Về nguyên tắc có, nhưng thực tế thường **không đáng kể**. Arrow function inline tạo một tham chiếu mới ở mỗi lần render của component cha:

```jsx
<DataLoader render={data => <div>{data}</div>} />
// mỗi render của cha → prop `render` là function mới
```

Hệ quả: nếu `DataLoader` được bọc `React.memo`, phép so sánh nông luôn thấy prop đổi nên memo trở nên vô nghĩa, và `DataLoader` render lại mỗi lần.

Cách xử lý: bọc render function bằng `useCallback` (nhớ khai báo đủ deps) rồi mới memo component logic. Nhưng nên cân nhắc:

- Bản thân việc tạo một function là cực rẻ; chi phí thật nằm ở việc render lại subtree bên dưới.
- `useCallback` cũng có chi phí và làm code rườm rà hơn.
- Nếu render function phụ thuộc vào nhiều giá trị hay đổi thì `useCallback` cũng không giữ được tham chiếu ổn định.

Nguyên tắc chung vẫn là: **chỉ tối ưu khi đo được vấn đề** bằng React DevTools Profiler, thường là với danh sách lớn hoặc component render nặng.

</details>

**9. Trong React DevTools, một component dùng `render props` hiện ra như thế nào so với một component dùng hook?**

<details className="qa">
<summary>Xem đáp án</summary>

Với **render props**, cây component có thêm một node cho component logic (`MouseTracker`, `DataLoader`), và phần UI thật nằm bên dưới nó. State hiển thị trên node wrapper chứ không phải trên component nghiệp vụ mà bạn quan tâm. Lồng ba tầng render props thì cây sâu thêm ba tầng toàn wrapper — đọc rất rối, và tên hiển thị có thể là `Anonymous` nếu component không được đặt tên.

Với **custom hook**, cây giữ nguyên độ sâu. Chọn component trong DevTools, panel bên phải liệt kê từng hook theo đúng thứ tự gọi, kèm giá trị state; DevTools còn hiển thị **tên custom hook** (ví dụ `MousePosition` cho `useMousePosition`) nên bạn nhìn ra ngay logic nào đang chạy và state của nó bằng bao nhiêu.

Nói gọn: render props đẩy thông tin ra **cấu trúc cây**, hook giữ thông tin **ngay tại component** — cách thứ hai dễ debug hơn nhiều, nhất là khi kết hợp nhiều logic.

</details>

**10. Test một component dùng `render props` khác gì test một custom hook bằng `renderHook`?**

<details className="qa">
<summary>Xem đáp án</summary>

Với **custom hook**, bạn test logic trực tiếp, không cần UI:

```jsx
const { result } = renderHook(() => useMousePosition());
act(() => {
  window.dispatchEvent(new MouseEvent("mousemove", { clientX: 10, clientY: 20 }));
});
expect(result.current).toEqual({ x: 10, y: 20 });
```

Với **render props**, bạn buộc phải mount cả component và dựng một render function giả chỉ để "bắt" dữ liệu:

```jsx
const spy = jest.fn(() => null);
render(<MouseTracker>{spy}</MouseTracker>);
// rồi kiểm tra spy được gọi với tham số nào
```

Khác biệt chính:

- Hook cho phép **test đơn vị đúng nghĩa** — chỉ logic, không phụ thuộc DOM hay JSX.
- Render props buộc test đi qua tầng render, nên chậm hơn và lẫn lộn giữa lỗi logic với lỗi UI.
- Kiểm tra kết quả của hook đọc thẳng từ `result.current`; với render props phải suy ra qua tham số của mock hoặc qua nội dung đã render.
- Hook dễ test các trạng thái trung gian (loading, error) hơn vì không phải render từng biến thể giao diện.

</details>

**11. Kể vài thư viện thực tế dùng `render props` (ví dụ `react-window`, `Formik`, `Downshift`) và lý do chúng chọn pattern này.**

<details className="qa">
<summary>Xem đáp án</summary>

- **React Window / React Virtuoso** (virtualization): nhận prop kiểu `renderRow` / `children` là function nhận `index` và `style`. Thư viện quản lý việc tính toán dòng nào cần render, còn nội dung mỗi dòng hoàn toàn do bạn quyết định — thư viện không thể biết trước UI của bạn.
- **Formik**: `<Formik>{({ values, errors, handleChange }) => ...}</Formik>` — thư viện giữ state form, validation, trạng thái submit; giao diện input thì mỗi dự án một khác.
- **Downshift**: headless combobox/autocomplete, trả về một bộ prop getter (`getInputProps`, `getItemProps`) để bạn gắn vào thẻ của mình. Thư viện lo logic bàn phím và accessibility, không áp đặt markup.
- **React Query (bản cũ)** từng có `<Query>` với children-as-function trước khi chuyển hẳn sang `useQuery`.

Điểm chung: đây đều là **headless component** — phần khó là logic (virtualization, quản lý form, ARIA), còn phần UI phải mở hoàn toàn cho người dùng thư viện. Render props là cách tự nhiên để trao quyền render ra ngoài. Đáng chú ý là Formik, Downshift và React Query đều đã bổ sung hoặc chuyển sang hook về sau.

</details>

**12. Khi nào `render props` vẫn tốt hơn custom hook? Cho ví dụ với `headless component` hoặc `virtualization`.**

<details className="qa">
<summary>Xem đáp án</summary>

Khi component không chỉ **cung cấp dữ liệu** mà còn **kiểm soát việc render**: quyết định render bao nhiêu lần, lúc nào, với tham số gì. Hook không làm được vì hook chạy một lần cho mỗi lần render của component gọi nó.

Virtualization là ví dụ điển hình — thư viện quyết định dòng nào đang trong viewport và render đúng những dòng đó:

```jsx
<DataTable
  data={users}
  renderRow={(user) => (
    <tr>
      <td>{user.name}</td>
      <td><Button onClick={() => edit(user)}>Edit</Button></td>
    </tr>
  )}
/>
```

Các trường hợp còn lại:

- **Function-as-child cho trạng thái tải dữ liệu** — `<DataLoader>` gọi children với `{ data, loading, error }` để nơi dùng tự chọn hiển thị spinner, lỗi hay danh sách.
- **Component cần nhiều slot tuỳ biến** — `renderHeader`, `renderRow`, `renderEmpty` trên cùng một bảng.
- **Cần chia sẻ logic cho class component** trong codebase cũ.

Ngược lại, nếu chỉ cần lấy dữ liệu rồi tự render, hook luôn là lựa chọn tốt hơn.

</details>

**13. `Render props` và `compound component` khác nhau ở điểm nào? Với tình huống nào thì chọn cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Render props | Compound component |
|---|---|---|
| Cách truyền dữ liệu | Gọi function kèm tham số | Chia sẻ ngầm qua Context giữa cha và các con |
| Cú pháp nơi dùng | Một function trả JSX | Nhiều component con khai báo như JSX thường |
| Ví dụ | `<DataLoader>{({data}) => ...}</DataLoader>` | `<Tabs><Tabs.List/><Tabs.Panel/></Tabs>` |
| Tuỳ biến | Rất cao — bạn viết toàn bộ markup | Vừa phải — ghép các mảnh có sẵn |
| Dễ đọc | Kém khi lồng sâu | Tốt, JSX phẳng và khai báo |

Chọn **compound component** khi bộ phận UI đã có hình hài rõ ràng và người dùng chỉ cần sắp xếp, bỏ bớt hoặc thêm phần: tabs, accordion, modal, select, menu. Đây cũng là lựa chọn dễ đọc hơn nên thường ưu tiên.

Chọn **render props** khi markup không thể đoán trước: mỗi dòng trong bảng ảo hoá, mỗi ô của lịch, mỗi item trong danh sách kéo thả — nơi thư viện chỉ biết *khi nào* render chứ không biết *render cái gì*.

Hai pattern không loại trừ nhau: nhiều thư viện dùng compound component cho khung và render props cho phần nội dung bên trong.

</details>

**14. `Render props` có chia sẻ được logic cho `class component` không? Custom hook thì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

**Render props: được.** Vì nó chỉ là truyền một prop và render JSX — cả class lẫn function component đều làm được cả hai đầu. Một class có thể dùng render props, và bản thân component chứa logic cũng có thể là class:

```jsx
class Page extends React.Component {
  render() {
    return <MouseTracker>{({ x, y }) => <p>{x}, {y}</p>}</MouseTracker>;
  }
}
```

**Custom hook: không.** Quy tắc của Hooks quy định hook chỉ được gọi ở cấp cao nhất của **function component** hoặc trong một hook khác. Class không có chỗ để React gắn danh sách hook, nên gọi hook trong `render()` sẽ lỗi.

Nếu bắt buộc phải dùng logic dạng hook trong class, cách làm là **bọc**: viết một function component nhỏ gọi hook rồi truyền kết quả xuống class qua prop (thực chất chính là dựng lại một HOC hoặc render props quanh hook).

Đây cũng là lý do render props và HOC vẫn còn tồn tại trong các codebase cũ chưa migrate hết sang function component.

</details>

**15. Nếu render function trả về `null`, hoặc component logic quên gọi nó, thì chuyện gì xảy ra và làm sao phòng ngừa?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Trả về `null`**: hợp lệ — React hiểu là "không render gì". Giao diện trống nhưng không lỗi. Đây là cách chính thống để ẩn nội dung có điều kiện.
- **Quên gọi function**: nếu component logic `return children` thay vì `children(data)`, React nhận được một **function** làm children. React không render được function và ném lỗi kiểu *"Functions are not valid as a React child"*, thường kèm màn hình trắng.
- **Không truyền render function**: `children` là `undefined`, gọi nó sẽ ném `TypeError: children is not a function`.

Cách phòng ngừa:

```jsx
function DataLoader({ children, render }) {
  const fn = children ?? render;
  if (typeof fn !== "function") {
    throw new Error("DataLoader cần children hoặc render là một function");
  }
  return fn(data);
}
```

Kèm theo: khai báo kiểu chặt trong TypeScript (`children: (data: T) => React.ReactNode`) để bắt lỗi ngay lúc viết code; bọc `ErrorBoundary` để một lỗi render không làm sập cả trang; và viết test cho các nhánh loading/error/empty.

</details>

**16. Khi thiết kế API cho một component tái sử dụng, thứ tự cân nhắc nên là hook, rồi `children`/compound, cuối cùng mới `render props`. Giải thích lý do của thứ tự này.**

<details className="qa">
<summary>Xem đáp án</summary>

Thứ tự này đi từ **ít ràng buộc nhất** đến **nhiều ràng buộc nhất** với người dùng API.

- **Custom hook trước**: chỉ trả dữ liệu và hành vi, không áp đặt bất kỳ cấu trúc JSX nào. Người dùng render sao cũng được, kết hợp nhiều hook thoải mái, TypeScript suy kiểu tốt, test bằng `renderHook`, DevTools hiện rõ. Không làm cây component sâu thêm.
- **`children` / compound component tiếp theo**: khi bạn thật sự cần *bọc* UI — tức component phải render khung, layout, hoặc quản lý quan hệ cha-con (tabs, modal, accordion). Cú pháp JSX vẫn phẳng và khai báo, dễ đọc với mọi người.
- **Render props cuối cùng**: khi component cần **kiểm soát thời điểm và số lần render** phần nội dung, ví dụ virtualization hay bảng có slot tuỳ biến. Đổi lại là JSX lồng sâu, dễ rơi vào wrapper hell và TypeScript khó suy kiểu hơn.

Nói cách khác: chỉ leo lên nấc phức tạp hơn khi nấc dưới không giải quyết được. Nhiều component tốt nhất cung cấp **cả hai**: một hook cho người muốn tự do hoàn toàn, và một component tiện dụng dựng sẵn trên hook đó.

</details>

---

## 4. Refs

Bài học: [4. Refs](../../react/05-rendering/4_refs.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `Ref` là gì trong React, và khác `state` ở những điểm nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`Ref` là một "ô nhớ" tồn tại xuyên suốt các lần render của một component, dùng để tham chiếu tới DOM node thật hoặc lưu một giá trị mà UI không cần hiển thị.

| | `state` | `ref` |
|---|---|---|
| Gây re-render khi đổi | Có | **Không** |
| Cách cập nhật | Qua setter (`setCount`) | Gán thẳng `ref.current = ...` |
| Thời điểm giá trị mới có hiệu lực | Ở lần render kế tiếp | Ngay lập tức |
| Tính chất | Bất biến trong một lần render | Mutable |
| Dùng cho | Dữ liệu hiển thị lên UI | Dữ liệu "hậu trường", DOM node |

Điểm chung: cả hai đều được React giữ lại qua các lần render (khác với biến thường, vốn bị khởi tạo lại mỗi lần hàm component chạy).

Quy tắc: **giá trị có xuất hiện trong UI → dùng state; chỉ phục vụ hậu trường → dùng ref.**

</details>

**2. `useRef` trả về cái gì? Vì sao sửa `ref.current` lại không gây re-render?**

<details className="qa">
<summary>Xem đáp án</summary>

`useRef(initialValue)` trả về một **object cố định** dạng `{ current: initialValue }`. React tạo object này một lần khi mount và trả về **đúng object đó** ở mọi lần render sau — tham chiếu không bao giờ đổi.

```jsx
function Counter() {
  const renderCount = useRef(0);
  renderCount.current++;          // sửa thoải mái, không re-render
  console.log("Render", renderCount.current);
  return <p>...</p>;
}
```

Lý do không re-render: React chỉ lên lịch render lại khi bạn gọi **setter của state** hoặc `dispatch` của reducer — đó là những API báo cho React biết "có gì đó đổi". Gán `ref.current = x` chỉ là ghi vào một thuộc tính của một object JavaScript bình thường; React không theo dõi, không hay biết, nên không làm gì cả.

Hệ quả cần nhớ: nếu bạn hiển thị `ref.current` trong JSX, con số trên màn hình sẽ không cập nhật cho tới khi có nguyên nhân khác khiến component render lại.

</details>

**3. Khi nào nên dùng `useRef` thay vì `useState`, và ngược lại? Nêu quy tắc quyết định.**

<details className="qa">
<summary>Xem đáp án</summary>

Quy tắc một câu: **giá trị đó có cần vẽ ra màn hình không?** Có → `useState`. Không → `useRef`.

Dùng `useRef` khi:

- Giữ tham chiếu tới DOM node (focus, scroll, đo, play video).
- Lưu id của `setInterval` / `setTimeout` để clear sau này.
- Nhớ giá trị của lần render trước để so sánh.
- Giữ một instance của thư viện non-React (chart, map, editor).
- Đánh dấu cờ nội bộ như "đã submit rồi" mà UI không hiển thị.

Dùng `useState` khi giá trị ảnh hưởng tới những gì người dùng nhìn thấy: nội dung, trạng thái loading, mở/đóng modal, dữ liệu form controlled.

```jsx
// SAI — UI không bao giờ cập nhật
const count = useRef(0);
<button onClick={() => count.current++}>Count: {count.current}</button>

// ĐÚNG
const [count, setCount] = useState(0);
<button onClick={() => setCount(c => c + 1)}>{count}</button>
```

Dùng ref để "né" re-render cho dữ liệu hiển thị là bug chứ không phải tối ưu.

</details>

**4. Kể các use case hợp lệ của ref: focus, scroll, đo kích thước, lưu id timer, tích hợp thư viện non-React.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Focus**: đưa con trỏ vào ô input khi mở form hay modal — `inputRef.current.focus()` trong `useEffect`.
- **Scroll**: cuộn tới một phần tử bằng `sectionRef.current.scrollIntoView({ behavior: "smooth" })`, hoặc lưu/khôi phục vị trí scroll của một danh sách.
- **Đo kích thước**: đọc `offsetWidth`, `getBoundingClientRect()` để tính vị trí tooltip, dropdown, hoặc layout phụ thuộc kích thước thật.
- **Điều khiển media**: gọi `videoRef.current.play()` / `pause()` — những hành động mệnh lệnh mà DOM API cung cấp chứ React không mô tả được bằng state.
- **Lưu id timer**: giữ kết quả của `setInterval` để `clearInterval` trong cleanup mà không làm component render lại.
- **Tích hợp thư viện non-React**: Chart.js, Leaflet, CodeMirror, video player... cần một DOM node để gắn vào; ref cung cấp node đó, còn instance của thư viện cũng lưu trong một ref khác.
- **Nhớ giá trị render trước** để so sánh trong effect.

Điểm chung: tất cả đều là việc **hậu trường** hoặc **mệnh lệnh**, không thuộc phần "UI = f(state)".

</details>

**5. Vì sao không nên đọc hoặc ghi `ref.current` ngay trong lúc render?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì hàm component phải **pure**, còn đọc/ghi ref trong render phá vỡ điều đó.

Về mặt đọc: ở lần render đầu, DOM chưa được commit nên `ref.current` vẫn là `null`. Kết quả tính ra sẽ sai hoặc gây lỗi:

```jsx
function Bad() {
  const ref = useRef(null);
  const width = ref.current?.offsetWidth; // luôn undefined ở render đầu
  return <div ref={ref}>{width}</div>;
}
```

Về mặt ghi: React có thể gọi hàm component nhiều lần (Strict Mode gọi hai lần), render dở rồi bỏ, hoặc render ở mức ưu tiên thấp. Ghi vào ref trong render khiến kết quả phụ thuộc vào số lần React gọi hàm — bug rất khó lần.

Cách đúng: đọc/ghi ref trong `useEffect` (sau commit), trong `useLayoutEffect` (sau commit, trước paint — dùng khi cần đo rồi chỉnh để tránh nhấp nháy), hoặc trong event handler.

</details>

**6. Tại thời điểm nào `ref.current` mới thực sự trỏ tới DOM node? Giải thích theo vòng đời render và commit.**

<details className="qa">
<summary>Xem đáp án</summary>

Trình tự:

1. `useRef(null)` tạo object, `ref.current` là `null`.
2. **Render phase**: React gọi hàm component, nhận JSX có `ref={inputRef}`. Đây mới chỉ là mô tả — chưa có DOM node nào, `ref.current` vẫn `null`.
3. **Commit phase**: React tạo/cập nhật DOM thật, rồi **gán** `ref.current = node`. Việc gán này xảy ra trước khi effect chạy.
4. `useLayoutEffect` chạy — ref đã sẵn sàng, đọc được kích thước, chỉnh DOM trước khi browser paint.
5. Browser paint, rồi `useEffect` chạy — ref cũng đã sẵn sàng.

Khi element bị gỡ, React gán lại `ref.current = null` trong commit phase của lần cập nhật đó.

```jsx
useEffect(() => {
  inputRef.current.focus(); // an toàn: chạy sau commit
}, []);
```

Tóm lại: ref có giá trị **từ commit phase trở đi**, nên mọi thao tác với DOM node phải nằm trong effect hoặc event handler, không bao giờ trong thân hàm component.

</details>

**7. `useEffect` và `useLayoutEffect` khác nhau thế nào khi cần đo kích thước element qua ref? Khi nào bị flicker?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `useEffect` | `useLayoutEffect` |
|---|---|---|
| Chạy khi | Sau khi browser đã paint | Sau commit DOM, **trước** paint |
| Chặn hiển thị | Không | Có (đồng bộ) |
| Rủi ro nhấp nháy khi đo-rồi-sửa | Có | Không |

Flicker xảy ra theo kịch bản: render lần 1 vẽ phần tử ở vị trí/kích thước mặc định → browser **paint** (người dùng đã thấy) → `useEffect` đo rồi `setState` → render lần 2 vẽ lại đúng chỗ. Giữa hai lần paint đó là một khung hình sai — mắt thường thấy như một cú giật hoặc nhảy vị trí.

```jsx
useLayoutEffect(() => {
  setWidth(ref.current.offsetWidth); // đo và sửa trước khi paint
}, []);
```

Với `useLayoutEffect`, cả đo lẫn cập nhật diễn ra trước paint nên người dùng chỉ thấy kết quả cuối.

Chọn thế nào: mặc định dùng `useEffect` (không chặn paint, không cảnh báo khi SSR). Chuyển sang `useLayoutEffect` khi và chỉ khi bạn **đo DOM rồi chỉnh ngay** — tooltip, popover, đồng bộ scroll. Với việc chỉ theo dõi kích thước liên tục, `ResizeObserver` là lựa chọn tốt hơn.

</details>

**8. `forwardRef` giải quyết vấn đề gì? Vì sao trước React 19 function component không nhận `ref` như một prop thường?**

<details className="qa">
<summary>Xem đáp án</summary>

`ref` (giống `key`) là thuộc tính **đặc biệt** được React giữ lại, không nằm trong `props`. Với thẻ DOM như `input`, React hiểu ngay là phải gắn node vào ref. Nhưng với một function component, React không biết nên gắn cái gì — component có thể render nhiều thẻ, hoặc không thẻ nào.

Trước React 19, viết `<MyInput ref={inputRef} />` sẽ khiến ref không tới được đâu cả và React cảnh báo "Function components cannot be given refs". `forwardRef` là cách nói rõ với React: hãy đưa ref vào **tham số thứ hai** để component tự quyết định gắn vào đâu.

```jsx
const MyInput = forwardRef(function MyInput(props, ref) {
  return <input ref={ref} {...props} />;
});
```

Nhu cầu này xuất hiện thường xuyên ở thư viện component: parent muốn focus, scroll hay đo một input/button đã được bọc trong component riêng.

Lý do React tách `ref` khỏi props ngay từ đầu là để việc gắn ref diễn ra ở tầng reconciliation, đồng thời tránh việc component vô tình truyền tiếp `ref` khi spread props.

</details>

**9. React 19 thay đổi gì về `ref` cho function component, và migrate từ `forwardRef` như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

React 19 cho phép function component nhận `ref` **như một prop bình thường**, nên `forwardRef` không còn cần thiết cho code mới:

```jsx
// React 18
const Button = forwardRef(({ children, ...props }, ref) => (
  <button ref={ref} {...props}>{children}</button>
));

// React 19
function Button({ children, ref, ...props }) {
  return <button ref={ref} {...props}>{children}</button>;
}
```

Cách migrate:

- Chạy codemod `react-codemod forward-refs-to-refs` cho toàn bộ codebase, hoặc sửa tay dần mỗi khi mở lại file.
- Bỏ lớp bọc `forwardRef`, đưa `ref` vào phần destructure props, giữ nguyên phần thân.
- Với TypeScript, khai báo `ref` trong type props (`ref?: React.Ref<HTMLInputElement>`) thay cho generic của `forwardRef`.

Lưu ý: `forwardRef` vẫn hoạt động (chỉ bị đánh dấu là sẽ deprecated), nên có thể migrate từ từ. Class component **không đổi** — vẫn dùng `React.createRef()` và `ref={this.myRef}` như cũ.

</details>

**10. `Callback ref` là gì? React gọi nó vào những thời điểm nào và truyền vào giá trị gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Thay vì truyền một object ref, bạn truyền thẳng một **function** vào prop `ref`. React sẽ gọi function đó và đưa DOM node vào làm tham số.

```jsx
function Component() {
  const measureRef = (node) => {
    if (node) {
      console.log("Mounted, width:", node.offsetWidth);
    }
  };
  return <div ref={measureRef}>...</div>;
}
```

React gọi callback ref ở hai thời điểm, đều trong commit phase:

- **Khi element được gắn vào DOM** — tham số là **DOM node**.
- **Khi element bị gỡ** — tham số là **`null`**.

Ngoài ra nếu chính function truyền vào thay đổi tham chiếu giữa hai lần render, React sẽ gọi function cũ với `null` rồi gọi function mới với node.

Từ React 19, callback ref có thể **return một cleanup function**; khi đó React gọi cleanup thay vì gọi lại callback với `null` — viết giống mô hình của `useEffect`, gọn và ít nhầm hơn.

</details>

**11. Vì sao một callback ref định nghĩa inline có thể bị gọi lại (với `null` rồi với node) sau mỗi lần re-render? Cách tránh?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì hàm inline được **tạo mới ở mỗi lần render**, nên tham chiếu khác với lần trước. React so sánh tham chiếu và kết luận "ref đã đổi", nên phải gỡ ref cũ rồi gắn ref mới:

```jsx
// Mỗi render: gọi callback cũ với null, rồi callback mới với node
<div ref={(node) => setWidth(node?.offsetWidth)}>
```

Hậu quả: logic đo/khởi tạo chạy lại liên tục; nếu callback gọi `setState` thì rất dễ rơi vào vòng lặp render vô tận; thư viện non-React bị huỷ và khởi tạo lại mỗi render.

Cách tránh:

- Bọc callback bằng `useCallback` với dependency ổn định:

```jsx
const measureRef = useCallback((node) => {
  if (node) setWidth(node.offsetWidth);
}, []);
```

- Hoặc dùng ref object (`useRef`) khi không cần phản ứng ngay lúc gắn node — object ref có tham chiếu cố định nên React không bao giờ gọi lại.
- Trong React 19, tận dụng cleanup function trả về từ callback ref để dọn dẹp đúng cách thay vì kiểm tra `node === null`.

</details>

**12. Khi nào chọn `callback ref` thay vì ref object tạo bởi `useRef`?**

<details className="qa">
<summary>Xem đáp án</summary>

Chọn callback ref khi bạn cần **biết chính xác lúc node được gắn hoặc gỡ**, chứ không chỉ cần cầm node.

- **Đo ngay khi mount** mà không muốn đợi effect — callback chạy ngay trong commit, hữu ích khi node xuất hiện muộn (render có điều kiện) vì effect có `[]` sẽ không chạy lại.
- **Node thay đổi theo điều kiện** — `<div ref={isMounted ? measureRef : null}>`; với ref object bạn khó biết lúc nào nó vừa đổi.
- **Gắn/gỡ observer hoặc thư viện non-React** — khởi tạo `ResizeObserver`, `IntersectionObserver`, Chart.js khi có node và huỷ khi node biến mất. React 19 còn cho return cleanup nên rất hợp.
- **Gộp nhiều ref** vào một element — hàm merge nhận node rồi gán cho nhiều ref.
- **Ref cho từng item trong danh sách động** — callback gán node vào một `Map` theo id.

Ngược lại, dùng ref object khi chỉ cần "cầm node để dùng sau" (focus khi bấm nút, play video) — đơn giản và không có rủi ro gọi lại.

Nhiều thư viện đo kích thước như `react-use-measure` chính là callback ref đóng gói sẵn.

</details>

**13. `useImperativeHandle` dùng để làm gì? Vì sao React khuyên hạn chế dùng nó?**

<details className="qa">
<summary>Xem đáp án</summary>

Nó cho phép component con **tuỳ biến giá trị mà ref của cha nhận được** — thay vì trả DOM node thô, con trả ra một object chứa đúng những method muốn công khai:

```jsx
function FancyInput({ ref }) {
  const inputRef = useRef(null);
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    clear: () => { inputRef.current.value = ""; },
  }));
  return <input ref={inputRef} />;
}
```

Cha chỉ gọi được `focus()` và `clear()`, không chạm được vào toàn bộ DOM node — đóng gói tốt hơn.

Vì sao nên hạn chế: nó là lối lập trình **mệnh lệnh**, ngược với mô hình khai báo "UI = f(state)" của React. Cha điều khiển con bằng lời gọi method khiến luồng dữ liệu khó lần, khó test, dễ lệch trạng thái giữa hai bên, và làm component khó tái sử dụng.

Thứ tự ưu tiên: dùng **prop/state** trước (ví dụ `autoFocus`, `value`), rồi mới tới ref mệnh lệnh như phương án cuối. `useImperativeHandle` chỉ thực sự xứng đáng với các hành động không mô tả được bằng state: focus, scroll, play/pause, mở dialog.

</details>

**14. Có thể truyền cùng một ref cho nhiều element không? Làm sao gộp nhiều ref vào cùng một element (`merge refs`)?**

<details className="qa">
<summary>Xem đáp án</summary>

Truyền cùng một ref object cho nhiều element thì **không có lỗi nhưng vô nghĩa**: mỗi lần commit React gán đè `ref.current`, nên cuối cùng chỉ còn node được gắn sau cùng. Không có cách nào lấy lại các node kia.

Ngược lại, gộp **nhiều ref vào một element** là nhu cầu có thật — ví dụ component vừa cần ref nội bộ để đo, vừa phải chuyển ref của cha xuống. Cách làm là dùng một callback ref phân phối node cho từng ref:

```jsx
function mergeRefs(...refs) {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    }
  };
}

function Field({ ref }) {
  const innerRef = useRef(null);
  return <input ref={mergeRefs(innerRef, ref)} />;
}
```

Lưu ý bọc kết quả trong `useCallback` (hoặc `useMemo`) để hàm không đổi tham chiếu mỗi render, tránh việc React gỡ rồi gắn lại ref liên tục. Các thư viện như `react-merge-refs` cung cấp sẵn tiện ích này.

</details>

**15. Với một danh sách động, làm sao giữ ref cho từng item để có thể scroll hay focus đúng phần tử?**

<details className="qa">
<summary>Xem đáp án</summary>

Không gọi `useRef` trong `.map` được, vì vi phạm quy tắc Hooks (số lượng hook phải cố định giữa các lần render). Cách chuẩn là giữ **một ref chứa `Map`**, rồi dùng callback ref để đăng ký từng node theo id:

```jsx
function List({ items }) {
  const nodesRef = useRef(new Map());

  const scrollTo = (id) => {
    nodesRef.current.get(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return items.map(item => (
    <li
      key={item.id}
      ref={(node) => {
        if (node) nodesRef.current.set(item.id, node);
        else nodesRef.current.delete(item.id); // dọn khi unmount
      }}
    >
      {item.name}
    </li>
  ));
}
```

Điểm quan trọng: **xoá khỏi `Map` khi node là `null`**, nếu không danh sách sẽ giữ tham chiếu tới các DOM node đã bị gỡ và gây rò rỉ bộ nhớ.

Tránh dùng mảng theo index (`refs.current[i]`) vì khi list sắp xếp lại hoặc xoá phần tử ở giữa, index trỏ nhầm node — đúng loại bug của `key={index}`.

</details>

**16. `createRef` khác `useRef` thế nào? Điều gì xảy ra nếu gọi `createRef` bên trong function component?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `createRef` | `useRef` |
|---|---|---|
| Dùng cho | Class component | Function component |
| Tạo object | **Mới mỗi lần gọi** | Một lần, giữ nguyên qua mọi render |
| Nơi gọi | Trong `constructor` | Trong thân component (là hook) |

Trong class, `createRef()` được gọi ở constructor — chỉ chạy một lần cho mỗi instance — nên object ref bền vững suốt vòng đời component.

Nếu gọi `createRef()` trong thân một function component, nó chạy lại ở **mỗi lần render** và tạo một object mới toanh với `current` là `null`. Giá trị bạn lưu ở lần render trước biến mất, còn DOM node vừa gán cũng thuộc về object của lần render cũ:

```jsx
// SAI — ref bị tạo mới mỗi render, giá trị luôn mất
function Bad() {
  const ref = createRef();
  useEffect(() => console.log(ref.current), []); // dễ thành null
  return <input ref={ref} />;
}
```

Chính tính chất "tạo mới mỗi lần gọi" là lý do React cần một hook riêng: `useRef` lưu object vào bộ nhớ của component và trả lại đúng nó ở mọi lần render.

</details>

**17. Ref được gọi là "escape hatch" — khi nào việc phải dùng ref là dấu hiệu của một thiết kế state chưa tốt?**

<details className="qa">
<summary>Xem đáp án</summary>

Ref là "cửa thoát hiểm" khỏi mô hình khai báo: dùng khi React không mô tả được việc bạn cần làm. Nhưng nếu việc đó **mô tả được bằng state**, dùng ref là dấu hiệu thiết kế sai.

Các dấu hiệu:

- **Sửa DOM trực tiếp** để đổi nội dung, class, style — những thứ React sẽ ghi đè ở lần render sau. Hãy đưa vào state và render có điều kiện.
- **Đọc giá trị input qua `ref.current.value`** ở mọi nơi thay vì dùng controlled input, rồi phải tự đồng bộ validate và hiển thị lỗi.
- **Cha gọi method của con** (`childRef.current.reset()`) để điều khiển trạng thái con — thường nên nâng state lên cha (lifting state up) hoặc truyền prop `key` để reset.
- **Dùng ref để lưu giá trị hiển thị** nhằm né re-render — UI sẽ lệch dữ liệu.
- **Ref để chống vòng lặp effect** — thường che giấu một dependency array sai.

Ngược lại, ref là lựa chọn đúng cho focus, scroll, đo kích thước, play/pause media, tích hợp thư viện non-React — những hành động mệnh lệnh mà DOM cung cấp chứ state không biểu diễn được.

</details>

**18. `Strict Mode` ở môi trường dev gọi mount hai lần, điều đó ảnh hưởng thế nào tới callback ref và phần cleanup của nó?**

<details className="qa">
<summary>Xem đáp án</summary>

Ở dev, Strict Mode mô phỏng chu trình `mount → unmount → mount lại`. Với callback ref, nó thể hiện thành chuỗi: gọi với `node` → gọi với `null` (hoặc chạy cleanup, nếu callback trả về cleanup ở React 19) → gọi lại với `node`.

Điều này làm lộ ngay các callback ref viết ẩu:

- Callback đăng ký `ResizeObserver` / `IntersectionObserver` hoặc khởi tạo thư viện non-React mà **không huỷ** khi nhận `null` → sau hai lần mount có hai observer chạy song song.
- Callback đẩy node vào một mảng dùng chung mà không xoá → mảng có phần tử trùng, hoặc giữ tham chiếu tới node đã chết (rò rỉ bộ nhớ).
- Với danh sách dùng `Map`, quên `delete` khi node là `null` → `Map` phình lên với node cũ.

```jsx
ref={(node) => {
  if (node) map.current.set(id, node);
  else map.current.delete(id); // bắt buộc
}}
```

Cách xử lý đúng là viết callback ref **đối xứng**: mọi thứ tạo ra khi có node đều phải được huỷ khi nhận `null`. Không nên tắt Strict Mode — nó đang chỉ ra bug sẽ xuất hiện ở production khi component thực sự remount.

</details>

---

## 5. Events

Bài học: [5. Events](../../react/05-rendering/5_events.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `Synthetic Event` là gì và vì sao React phải bọc event gốc của trình duyệt lại?**

<details className="qa">
<summary>Xem đáp án</summary>

`SyntheticEvent` là lớp bọc (wrapper) của React quanh event gốc DOM, giữ nguyên bộ API quen thuộc: `type`, `target`, `preventDefault()`, `stopPropagation()`.

Lý do React bọc lại:

- **Chuẩn hoá cross-browser** — thời React ra đời, các trình duyệt có khác biệt nhỏ về tên thuộc tính và hành vi event. Synthetic Event cho một API đồng nhất, viết một lần chạy ở Chrome, Firefox, Safari như nhau.
- **Phục vụ event delegation** — React gắn listener thật ở root container rồi tự dựng lại luồng event theo cây React, nên cần một đối tượng event riêng do React kiểm soát.
- **Tích hợp với cơ chế của React** — gộp nhiều lệnh cập nhật state trong cùng handler (batching), phối hợp với priority của concurrent rendering.

Handler luôn nhận đúng một tham số là synthetic event:

```jsx
<button onClick={(e) => console.log(e.type)}>Save</button>
```

</details>

**2. Làm sao truy cập event gốc của DOM từ một synthetic event, và khi nào bạn thực sự cần tới nó?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng thuộc tính `e.nativeEvent`:

```jsx
function handleClick(e) {
  console.log(e);             // SyntheticEvent
  console.log(e.nativeEvent); // DOM event thật
}
```

Khi nào thực sự cần:

- Truy cập thuộc tính mà synthetic event không phơi ra, ví dụ `inputType` của `InputEvent` (phân biệt gõ phím với paste hay undo), hoặc `submitter` của `SubmitEvent`.
- Gọi `e.nativeEvent.stopImmediatePropagation()` để chặn luôn các listener DOM khác gắn trên cùng node.
- Phối hợp với thư viện bên ngoài đang làm việc trực tiếp với DOM event.
- Debug để xem event gốc trình duyệt phát ra trông thế nào.

Đa số trường hợp bạn không cần tới `nativeEvent` — synthetic event đã đủ. Nên coi việc phải chạm vào nó là dấu hiệu đang làm việc "ngoài luồng" React, cần cẩn thận về thứ tự và timing.

</details>

**3. `Event delegation` trong React hoạt động ra sao? React gắn listener thật ở đâu?**

<details className="qa">
<summary>Xem đáp án</summary>

React **không gọi `addEventListener` cho từng DOM node** ứng với mỗi prop `onClick` bạn viết. Thay vào đó nó gắn một bộ listener ở **root container** — element bạn truyền cho `createRoot` (thường là `#root`). Đây là hành vi từ React 17; trước đó listener nằm ở `document`.

Luồng xử lý một cú click:

1. Event gốc bubble từ node bị click lên tới root container.
2. Listener của React ở root bắt được event gốc.
3. React nhìn `event.target`, dò ngược cây Fiber để lấy danh sách component tổ tiên.
4. React tạo `SyntheticEvent` rồi gọi lần lượt các handler theo đúng thứ tự capture → target → bubble, mô phỏng lại luồng event của DOM nhưng theo **cây React**.

Lợi ích: số listener thật rất ít dù render hàng nghìn phần tử, React tự đăng ký và gỡ nên không rò rỉ bộ nhớ, đồng thời gộp được với cơ chế batching.

</details>

**4. React 17 chuyển nơi gắn listener từ `document` sang `root container` — thay đổi này gây ảnh hưởng thực tế gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Những ảnh hưởng đáng nhớ:

- **Nhiều React app trên cùng một trang** sống chung được. Trước đây mọi app đều gắn ở `document` nên event có thể lọt chéo giữa các app; nay mỗi root có hệ event riêng. Đây cũng là điều kiện để nâng cấp dần từng phần của trang.
- **Tích hợp với code không phải React dễ đoán hơn** — khi nhúng widget jQuery hay thư viện DOM thuần, event của React dừng ở root, không "cướp" mất event của phần bên ngoài.
- **`e.stopPropagation()` trong React không chặn được** listener gắn ngoài root, ví dụ script analytics trên `document`. Lúc handler React chạy, event gốc mới ở tầng root và vẫn còn bubble tiếp.
- Vài hành vi biên thay đổi: `onScroll` không còn bubble, `onFocus`/`onBlur` chuyển sang dùng `focusin`/`focusout` ở bên dưới.

</details>

**5. `Event pooling` là gì, vì sao React từng dùng nó và vì sao React 17 loại bỏ?**

<details className="qa">
<summary>Xem đáp án</summary>

**Event pooling** là cơ chế của React cũ (từ 16 trở về trước): sau khi handler chạy xong, React xoá sạch mọi thuộc tính của `SyntheticEvent` rồi cất object vào một "hồ" để tái sử dụng cho event kế tiếp. Mục đích là **giảm áp lực cho garbage collector**, vì mỗi lần di chuột có thể sinh hàng trăm object event.

Hệ quả khó chịu: không dùng được event một cách bất đồng bộ.

```jsx
// React 16 — sai
const handle = (e) => {
  setTimeout(() => console.log(e.target), 0); // null
};
// Phải gọi e.persist() hoặc copy giá trị ra biến trước
```

React 17 **bỏ hẳn pooling** vì các engine JavaScript hiện đại đã tối ưu rất tốt việc cấp phát object nhỏ — lợi ích hiệu năng gần như không còn, trong khi đây lại là nguồn bug và nhầm lẫn phổ biến. Từ React 17, `e.persist()` chỉ còn là hàm rỗng giữ lại cho tương thích.

</details>

**6. `e.target` và `e.currentTarget` khác nhau thế nào? Cho một ví dụ mà chúng trả về hai element khác nhau.**

<details className="qa">
<summary>Xem đáp án</summary>

| Thuộc tính | Ý nghĩa |
|---|---|
| `e.target` | Element **thực sự gây ra** event — nơi người dùng bấm trúng |
| `e.currentTarget` | Element **đang gắn handler** đang chạy — luôn khớp với thẻ viết prop `onClick` |

Khi handler gắn ở cha còn người dùng bấm vào con, hai giá trị khác nhau:

```jsx
<div onClick={(e) => {
  console.log(e.currentTarget); // luôn là div — nơi gắn handler
  console.log(e.target);        // span nếu bấm trúng chữ bên trong
}}>
  <span>Bấm vào tôi</span>
</div>
```

Ứng dụng quen thuộc: chỉ đóng modal khi bấm đúng vùng nền, không phải bấm vào nội dung.

```jsx
<div onClick={(e) => {
  if (e.target === e.currentTarget) closeModal();
}}>
  <ModalContent />
</div>
```

Cách này an toàn hơn `stopPropagation()` vì không giấu event khỏi listener khác. Lưu ý với TypeScript: `e.currentTarget` có kiểu chính xác theo element, còn `e.target` chỉ là `EventTarget` nên thường phải ép kiểu.

</details>

**7. `preventDefault()` và `stopPropagation()` khác nhau ra sao? Khi nào dùng cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai hàm giải quyết hai vấn đề hoàn toàn khác nhau:

| | `preventDefault()` | `stopPropagation()` |
|---|---|---|
| Chặn cái gì | Hành vi mặc định của trình duyệt | Việc event lan tiếp lên element cha |
| Không ảnh hưởng tới | Event vẫn bubble bình thường | Hành vi mặc định vẫn xảy ra |
| Ví dụ dùng | Form không reload trang, thẻ liên kết không điều hướng | Bấm nút bên trong card mà không kích hoạt handler của card |

```jsx
<form onSubmit={(e) => {
  e.preventDefault(); // không reload page
  submitData();
}}>
```

Kinh nghiệm: `preventDefault()` dùng thoải mái — đó là cách chuẩn để tự quản lý hành vi. Còn `stopPropagation()` nên hạn chế, vì nó "ẩn" event khỏi component cha, khỏi thư viện (modal đóng khi click ra ngoài) và khỏi analytics gắn ở root. Ưu tiên kiểm tra `e.target === e.currentTarget`, hoặc dùng `e.target.closest(".specific")` để biết click xuất phát từ đâu rồi mới quyết định xử lý.

</details>

**8. Vì sao trong React, `return false` trong handler không chặn được hành vi mặc định như trong HTML hay jQuery?**

<details className="qa">
<summary>Xem đáp án</summary>

`return false` chưa bao giờ là tính năng của chuẩn DOM. Nó chỉ mang ý nghĩa ở hai nơi:

- **Inline HTML attribute** — với `onclick="return false"`, trình duyệt tự dịch giá trị trả về thành lệnh gọi `preventDefault()`.
- **jQuery** — jQuery cố tình quy ước `return false` nghĩa là gọi cả `preventDefault()` lẫn `stopPropagation()`.

React không theo quy ước nào trong hai cái đó. Handler của React là một function JavaScript bình thường, được hệ synthetic event gọi, và giá trị trả về bị **bỏ qua hoàn toàn**. Muốn chặn hành vi mặc định thì phải gọi tường minh:

```jsx
// Không có tác dụng
<form onSubmit={() => false}>

// Đúng
<form onSubmit={(e) => { e.preventDefault(); save(); }}>
```

Cách tường minh thực ra tốt hơn: đọc code là biết ngay bạn đang chặn hành vi mặc định, chặn bubbling, hay cả hai — thay vì phải đoán ý nghĩa của một giá trị `false` mơ hồ.

</details>

**9. `stopPropagation()` trong React có chặn được listener gắn bằng `addEventListener` ở `document` không? Giải thích theo cơ chế delegation.**

<details className="qa">
<summary>Xem đáp án</summary>

**Không** — với React 17 trở lên. Lý do nằm ở chỗ React gắn listener thật tại **root container**, còn `document` nằm **cao hơn** root trên cây DOM.

Diễn biến khi bạn click:

1. Event gốc bubble từ node bị click lên tới root container.
2. Listener của React ở root bắt được, dựng `SyntheticEvent` và chạy các handler theo cây React.
3. Bạn gọi `e.stopPropagation()` — việc này chỉ dừng React gọi tiếp handler của các **component cha trong cây React**.
4. Nhưng event gốc vẫn đang ở tầng root và **tiếp tục bubble lên `document`**, nên listener analytics ở đó vẫn chạy.

Muốn chặn thật sự phải can thiệp vào event gốc:

```jsx
const handle = (e) => {
  e.nativeEvent.stopImmediatePropagation();
};
```

Với React 16 thì tình huống ngược lại: listener của React nằm ngay ở `document`, nên thứ tự chạy phụ thuộc listener nào đăng ký trước — một nguồn bug rất khó lần.

</details>

**10. `Bubbling` và `capturing` khác nhau thế nào, và React cho đăng ký phase capture bằng cú pháp nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Một event DOM đi qua ba giai đoạn:

- **Capturing** — đi từ trên xuống, từ gốc tài liệu tới element đích (cha chạy trước con).
- **Target** — tới đúng element bị tác động.
- **Bubbling** — quay ngược từ element đích lên các cha (con chạy trước cha).

Mặc định handler chạy ở phase bubble. React mô phỏng đủ cả hai phase và cho đăng ký capture bằng hậu tố `Capture` trong tên prop:

```jsx
<div
  onClickCapture={() => console.log("cha - capture")}
  onClick={() => console.log("cha - bubble")}
>
  <button onClick={() => console.log("con - bubble")}>Click</button>
</div>
// Output: "cha - capture" → "con - bubble" → "cha - bubble"
```

Mọi event đều có bản capture tương ứng: `onMouseDownCapture`, `onKeyDownCapture`, `onFocusCapture`...

Phase capture hữu ích khi cha cần chặn hoặc ghi nhận event **trước khi** con kịp xử lý — ví dụ khoá toàn bộ tương tác lúc đang loading, hoặc log mọi click để phân tích hành vi.

</details>

**11. Vì sao viết `onClick={handleClick()}` là sai còn `onClick={handleClick}` là đúng?**

<details className="qa">
<summary>Xem đáp án</summary>

Prop event của React cần **một function để gọi sau**, không phải kết quả của một lời gọi hàm.

- `onClick={handleClick}` — truyền chính function đó. React giữ tham chiếu và gọi khi người dùng click.
- `onClick={handleClick()}` — JavaScript **thực thi ngay lúc render**, rồi gán *giá trị trả về* cho `onClick`. Hàm chạy sai thời điểm (ngay khi component render), còn `onClick` thường nhận `undefined` nên click không có tác dụng gì.

```jsx
// Sai: chạy ngay khi render, click không làm gì
<button onClick={alert("Hi")}>Click</button>

// Đúng: truyền tham chiếu function
<button onClick={handleClick}>Click</button>

// Đúng: cần truyền tham số thì bọc trong arrow function
<button onClick={() => doSomething(item.id)}>Edit</button>
```

Triệu chứng kinh điển của lỗi này: alert hiện ngay khi trang vừa load, hoặc gọi API lặp vô hạn vì hàm `setState` chạy lúc render kéo theo render lại.

</details>

**12. Cách truyền tham số cho handler mà không sinh bug? So sánh arrow function inline với `bind`.**

<details className="qa">
<summary>Xem đáp án</summary>

Hai cách phổ biến:

```jsx
// Arrow function inline — cách dùng phổ biến nhất hiện nay
<button onClick={() => deleteItem(item.id)}>Xoá</button>

// bind — di sản từ thời class component
<button onClick={this.deleteItem.bind(this, item.id)}>Xoá</button>
```

| | Arrow inline | `bind` |
|---|---|---|
| Dễ đọc | Cao, thấy rõ tham số | Thấp hơn, tham số nối sau `this` |
| Nhận event | Có, thêm `(e)` vào arrow | Event bị đẩy xuống tham số cuối |
| Tạo function mới mỗi render | Có | Có |
| Ngữ cảnh dùng | Function component | Class component cũ |

Lỗi hay gặp là quên bọc và viết `onClick={deleteItem(item.id)}` — hàm chạy ngay lúc render. Nếu vừa cần tham số vừa cần event thì viết `onClick={(e) => deleteItem(e, item.id)}`.

Cả hai cách đều sinh function mới mỗi lần render. Với component thường thì không đáng lo; chỉ cần cân nhắc khi truyền xuống component đã bọc `React.memo` hoặc render danh sách rất lớn.

</details>

**13. Arrow function inline trong JSX có làm component con re-render thừa không? Khi nào cần `useCallback` kết hợp `React.memo`?**

<details className="qa">
<summary>Xem đáp án</summary>

Mỗi lần render, arrow function inline tạo ra một object function **mới**, khác tham chiếu với lần trước. Hệ quả tuỳ vào con:

- **Component con bình thường** — vốn đã render lại mỗi khi cha render, nên prop function mới không gây thêm chi phí gì đáng kể. Trường hợp này inline là lựa chọn tốt: ngắn, dễ đọc.
- **Component con bọc `React.memo`** — memo so sánh props nông (`Object.is`). Function mới luôn khác tham chiếu cũ nên phép so sánh thất bại, memo mất tác dụng hoàn toàn.

Chỉ khi rơi vào trường hợp thứ hai mới cần `useCallback`:

```jsx
const Row = React.memo(function Row({ onSelect }) { /* ... */ });

function List({ items }) {
  const handleSelect = useCallback((id) => select(id), []);
  return items.map((it) => <Row key={it.id} onSelect={handleSelect} />);
}
```

Nguyên tắc: `useCallback` chỉ có giá trị khi đi **cặp** với `React.memo` (hoặc khi function là dependency của `useEffect`). Dùng rải rác khắp nơi chỉ thêm code và thêm chi phí so sánh dependency mà không đổi lại được gì.

</details>

**14. Nhiều lệnh cập nhật state trong cùng một handler được gộp (`batching`) như thế nào? React 18 `automatic batching` thay đổi gì so với trước?**

<details className="qa">
<summary>Xem đáp án</summary>

**Batching** là việc React gom nhiều lệnh `setState` trong cùng một lượt xử lý thành **một lần render duy nhất**, thay vì render lại sau mỗi lệnh.

```jsx
const handleClick = () => {
  setCount((c) => c + 1);
  setFlag(true);
  setName("A");
  // Chỉ một lần re-render, không phải ba
};
```

Khác biệt giữa hai thời kỳ:

| | React 17 và trước | React 18 |
|---|---|---|
| Trong event handler của React | Có gộp | Có gộp |
| Trong `setTimeout`, `Promise.then`, callback của `fetch` | **Không** gộp, render mỗi lệnh | **Có** gộp |
| Trong listener DOM gắn tay | Không gộp | Có gộp |

React 18 gọi đây là **automatic batching**: gộp ở mọi nơi, không chỉ trong synthetic event. Kết quả là ít lần render thừa hơn, giao diện ít nhấp nháy trạng thái trung gian.

Khi thực sự cần đọc DOM ngay sau khi state đổi, có thể thoát batching bằng `flushSync` từ `react-dom` — nhưng đây là ngoại lệ hiếm, dùng nhiều sẽ mất lợi ích hiệu năng.

</details>

**15. `onChange` của React khác `onchange` của DOM thuần ở chỗ nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Khác nhau ở **thời điểm kích hoạt**:

- **`onchange` của DOM thuần** chỉ bắn khi giá trị đã thay đổi **và** input mất focus (hoặc người dùng nhấn Enter). Gõ 5 ký tự rồi bấm ra ngoài chỉ nhận đúng 1 event.
- **`onChange` của React** bắn **sau mỗi keystroke**, tức là ánh xạ sang event `input` của DOM chứ không phải `change`.

```jsx
<input value={text} onChange={(e) => setText(e.target.value)} />
// Gõ "abc" → onChange chạy 3 lần
```

React cố ý thiết kế như vậy để pattern controlled input hoạt động mượt: state luôn đồng bộ với những gì người dùng đang gõ, cho phép validate tức thời, format khi nhập, hay bật/tắt nút submit theo thời gian thực.

Hệ quả cần nhớ: React cũng có prop `onInput`, và trên thực tế hai prop này gần như trùng hành vi. Nếu cần đúng ngữ nghĩa "xong mới báo" của `change` gốc, hãy dùng `onBlur` — ví dụ khi muốn chỉ validate hoặc gọi API sau khi người dùng nhập xong.

</details>

**16. `Controlled` và `uncontrolled input` khác nhau ra sao trong cách xử lý `onChange`? Ưu nhược của từng loại?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Controlled | Uncontrolled |
|---|---|---|
| Nguồn sự thật | React state | Chính DOM node |
| Cú pháp | `value` + `onChange` | `defaultValue` + `ref` |
| Mỗi keystroke | Gọi `setState` → re-render | Không đụng tới React |
| Đọc giá trị | Đọc thẳng biến state | `inputRef.current.value` |

```jsx
// Controlled
const [email, setEmail] = useState("");
<input value={email} onChange={(e) => setEmail(e.target.value)} />

// Uncontrolled
const ref = useRef(null);
<input defaultValue="" ref={ref} />
```

**Controlled** — ưu: dễ validate tức thời, format khi nhập, đồng bộ nhiều field, bật/tắt nút submit theo state. Nhược: re-render mỗi keystroke, form rất lớn có thể chậm nếu không chia nhỏ component.

**Uncontrolled** — ưu: ít code, không re-render, hợp với form đơn giản hoặc `input type="file"` (bắt buộc uncontrolled). Nhược: khó kiểm soát và validate liên tục, giá trị nằm ngoài luồng dữ liệu của React.

Lưu ý: đừng truyền `value` mà thiếu `onChange` — React sẽ cảnh báo vì input trở thành read-only. Thực tế nhiều team dùng thư viện form (React Hook Form) theo hướng uncontrolled để tối ưu hiệu năng.

</details>

**17. Khi nào buộc phải dùng `addEventListener` thủ công thay vì prop event của React (ví dụ với `window`, `document`, `passive listener`, hay node ngoài React)?**

<details className="qa">
<summary>Xem đáp án</summary>

Prop event của React chỉ gắn được lên element do React render. Những trường hợp phải tự gọi `addEventListener` trong `useEffect`:

- **Nghe event ở `window` / `document`** — resize, scroll toàn trang, phím tắt toàn cục, `online`/`offline`, `visibilitychange`.
- **Cần `passive: true`** để trình duyệt không phải chờ handler trước khi cuộn — prop React không cho truyền option này.
- **Cần `capture` với option đầy đủ**, `once`, hoặc `AbortSignal` để gỡ listener.
- **Node nằm ngoài cây React** — widget của bên thứ ba, element tạo bằng portal sang vùng DOM khác, hoặc code legacy.
- **Custom event** do web component phát ra, vì React không có prop tương ứng.

```jsx
useEffect(() => {
  const onKey = (e) => { if (e.key === "Escape") close(); };
  document.addEventListener("keydown", onKey);
  return () => document.removeEventListener("keydown", onKey);
}, []);
```

Điểm sống còn: luôn gỡ listener trong hàm cleanup, nếu không sẽ rò rỉ bộ nhớ và handler cũ vẫn chạy với state cũ.

</details>

**18. `Pointer events` so với `mouse` và `touch events` có lợi ích gì? Khi nào vẫn cần tách riêng?**

<details className="qa">
<summary>Xem đáp án</summary>

**Pointer events** hợp nhất chuột, cảm ứng và bút stylus vào một bộ API duy nhất, nên viết một lần là chạy trên mọi thiết bị:

```jsx
// Tệ — viết hai lần
<div onMouseDown={handle} onTouchStart={handle} />

// Tốt — pointer unified
<div onPointerDown={handle} />
```

Thông tin bổ sung mà pointer event mang theo:

- `pointerType` — `"mouse"`, `"pen"` hay `"touch"`, muốn phân biệt vẫn phân biệt được.
- `pressure` — áp lực của bút stylus, dùng cho ứng dụng vẽ.
- `pointerId` — theo dõi nhiều điểm chạm cùng lúc.
- `setPointerCapture()` — giữ nguyên mục tiêu khi kéo ra ngoài element, rất tiện cho drag.

Safari hỗ trợ từ phiên bản 13, các app hiện đại như Figma hay Notion đều dùng pointer events.

Khi nào vẫn cần tách riêng: cần cử chỉ đa chạm đặc thù của `touch` (pinch-zoom với `touches`), hoặc các event chỉ có ở chuột như `onMouseEnter`/`onMouseLeave` khi làm hover, `onWheel` khi xử lý cuộn.

</details>

**19. Về accessibility, vì sao chỉ gắn `onClick` lên một `div` là chưa đủ? Cần bổ sung những gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Một `div` không có ngữ nghĩa nút bấm, nên chỉ gắn `onClick` sẽ loại bỏ toàn bộ người dùng bàn phím và trình đọc màn hình:

- Không nhận được focus khi nhấn Tab.
- Nhấn Enter hay Space không kích hoạt.
- Trình đọc màn hình đọc là "group" chứ không báo "button".
- Không có trạng thái `disabled`, không có focus ring mặc định.

Bù lại phải tự thêm khá nhiều thứ:

```jsx
<div
  role="button"
  tabIndex={0}
  onClick={handle}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handle();
    }
  }}
>
  Lưu
</div>
```

Giải pháp đúng đắn hơn: **dùng thẻ `button` thật** rồi xoá style mặc định bằng CSS. Trình duyệt tặng sẵn focus, hỗ trợ bàn phím, ngữ nghĩa cho trình đọc màn hình và thuộc tính `disabled`. Quy tắc chung: chỉ mô phỏng bằng `role` khi thật sự không có thẻ HTML tương ứng.

</details>

**20. React 19 Actions (`form action`, `useFormStatus`, `useOptimistic`) thay đổi cách xử lý submit form như thế nào so với `onSubmit` truyền thống?**

<details className="qa">
<summary>Xem đáp án</summary>

Cách truyền thống: bạn tự làm mọi thứ trong `onSubmit` — gọi `preventDefault()`, tự giữ state `loading`, state `error`, tự đọc giá trị từ các controlled input.

React 19 chuyển sang mô hình **Actions**: truyền thẳng một hàm async vào prop `action` của form.

```jsx
async function submit(formData) {
  "use server";
  await db.save({ email: formData.get("email") });
}

<form action={submit}>
  <input name="email" />
  <button type="submit">Send</button>
</form>
```

Những gì React lo hộ:

- Tự chặn hành vi mặc định và gom dữ liệu thành `FormData` theo thuộc tính `name`.
- **`useFormStatus`** cho component con biết form cha có đang gửi hay không, không cần truyền prop `loading` xuyên nhiều tầng.
- **`useOptimistic`** cập nhật giao diện ngay theo kết quả kỳ vọng rồi tự hoàn tác nếu thất bại.
- Lỗi ném ra trong action được đưa tới Error Boundary.

Hàm action có thể là Server Action (`"use server"`) chạy trên server. Mô hình này rất phổ biến trong Next.js App Router.

</details>

---

## 6. Higher Order Components (HOC)

Bài học: [6. Higher Order Components (HOC)](../../react/05-rendering/6_hoc.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `HOC` là gì? Mô tả signature của nó bằng lời.**

<details className="qa">
<summary>Xem đáp án</summary>

**Higher-Order Component (HOC)** là một **hàm nhận vào một component và trả về một component mới** đã được bổ sung thêm tính năng. Nó không phải là component, không xuất hiện trong JSX — nó là một phép biến đổi chạy lúc định nghĩa module.

Signature nói bằng lời: "nhận một component, trả về một component" — tức là `Component → HOC → Enhanced Component`.

```jsx
function withLogger(Component) {
  return function LoggedComponent(props) {
    console.log("Render", Component.name, props);
    return <Component {...props} />;
  };
}

const LoggedButton = withLogger(Button);
```

Component trả về thường làm ba việc: chạy logic bổ sung (đọc context, gọi hook, kiểm tra điều kiện), truyền tiếp toàn bộ props gốc bằng `{...props}`, và có thể tiêm thêm props mới.

Mục đích: tái sử dụng **logic cross-cutting** (xác thực, logging, inject theme) cho nhiều component mà không lặp code. Theo quy ước, tên HOC bắt đầu bằng `with`.

</details>

**2. `HOC` khác một component bọc thông thường và khác `custom hook` ở những điểm nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| | HOC | Wrapper component | Custom hook |
|---|---|---|---|
| Bản chất | Hàm nhận component, trả component | Component nhận `children` | Hàm gọi các hook khác |
| Cách dùng | `withAuth(Page)` — lúc định nghĩa | Viết trong JSX như thẻ thường | Gọi trong thân component |
| Chia sẻ cái gì | Cả logic lẫn cấu trúc render | Chủ yếu cấu trúc render | Chỉ logic và state |
| Nhiều tính năng | Lồng nhau `withA(withB(...))` | Lồng thẻ trong JSX | Gọi liên tiếp, phẳng |
| TypeScript | Khó suy luận kiểu | Dễ | Dễ (kiểu trả về tự suy ra) |
| DevTools | Thêm nhiều tầng bọc | Thêm một tầng rõ ràng | Không thêm tầng nào |

Wrapper component bọc **nội dung** — quyết định render gì quanh `children`. HOC bọc **chính component** — nó biết cả component đó là ai để tiêm props vào. Custom hook không đụng tới cây component: nó chỉ trả về dữ liệu, còn component tự quyết định render thế nào — nên linh hoạt nhất và là lựa chọn mặc định hiện nay.

</details>

**3. Kể các use case kinh điển của `HOC`: xác thực, logging, theme, data fetching.**

<details className="qa">
<summary>Xem đáp án</summary>

- **`withAuth`** — kiểm tra người dùng đã đăng nhập chưa, chưa thì render `Login`, rồi tiêm `user` xuống props. Có thể nhận thêm tham số vai trò để chặn theo quyền.
- **Logging / analytics** — ghi log mỗi lần render hoặc tracking sự kiện mà không phải sửa từng component.
- **`withTheme`** — đọc theme hiện tại từ context và tiêm xuống props, để component không cần biết context nằm ở đâu.
- **Data fetching** — HOC tự gọi API, quản lý trạng thái loading/error rồi tiêm dữ liệu xuống. Đây là mô hình của `connect` trong Redux.

```jsx
function withAuth(Component, requiredRole) {
  return function AuthGated(props) {
    const user = useUser();
    if (!user) return <Login />;
    if (user.role !== requiredRole) return <NoPermission />;
    return <Component {...props} user={user} />;
  };
}
```

Điểm chung: đây đều là logic **cross-cutting** — không thuộc về nghiệp vụ riêng của component nào, mà cần áp dụng lặp lại cho nhiều component. Hiện nay phần lớn các use case này được viết bằng custom hook.

</details>

**4. Vì sao `HOC` không được phép mutate component gốc? Hậu quả nếu vi phạm là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

HOC phải là một **phép biến đổi thuần** (pure transformation): nhận component vào, trả component mới ra, **không sửa gì trên component đầu vào**.

Ví dụ vi phạm:

```jsx
// Sai — sửa thẳng component gốc
function withLogger(Component) {
  Component.prototype.componentDidMount = function () {
    console.log("mounted");
  };
  return Component; // trả về chính nó
}
```

Hậu quả:

- **Ô nhiễm toàn cục** — mọi nơi import component gốc đều bị ảnh hưởng, kể cả nơi không hề dùng HOC. Bug xuất hiện ở chỗ không ai ngờ tới.
- **Ghi đè lẫn nhau** — bọc bằng hai HOC cùng sửa một method thì cái sau xoá mất cái trước.
- **Mất khả năng composition** — HOC "sạch" có thể ghép tuỳ ý; HOC mutate thì kết quả phụ thuộc thứ tự và số lần gọi.
- **Không dự đoán được khi test** — thứ tự import ảnh hưởng tới kết quả test.

Cách đúng luôn là bọc: tạo component mới, render component gốc bên trong và truyền tiếp props bằng `{...props}`.

</details>

**5. Vì sao không được tạo `HOC` bên trong render (hoặc bên trong thân một component)? Điều gì xảy ra với state và DOM của cây con?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì mỗi lần render, lời gọi HOC tạo ra một **kiểu component hoàn toàn mới** (một tham chiếu function khác). React so sánh kiểu component để quyết định cập nhật hay dựng lại; thấy kiểu khác, nó coi đây là component khác hẳn.

```jsx
// Sai
function Page(props) {
  const Enhanced = withAuth(Content); // tạo lại mỗi render
  return <Enhanced {...props} />;
}

// Đúng — tạo một lần ở module scope
const Enhanced = withAuth(Content);
function Page(props) {
  return <Enhanced {...props} />;
}
```

Hậu quả ở mỗi lần render cha:

- Toàn bộ cây con bị **unmount rồi mount lại**: state trong đó mất sạch, quay về giá trị khởi tạo.
- DOM thật bị **huỷ và dựng lại** — mất focus, mất vị trí cuộn, animation chạy lại từ đầu.
- Mọi `useEffect` chạy cleanup rồi chạy lại, kéo theo gọi API lặp.
- Hiệu năng tệ vì không tái sử dụng được gì.

Quy tắc: luôn áp dụng HOC ở cấp module, ngoài mọi component.

</details>

**6. `displayName` trong `HOC` dùng để làm gì, và đặt theo convention nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`displayName` là tên mà React DevTools và các thông báo lỗi dùng để hiển thị component. Nếu HOC trả về một arrow function ẩn danh, DevTools chỉ hiện `Anonymous` hoặc `Unknown` — cây component thành một dãy hộp đen, rất khó debug.

Convention là `WithX(BaseName)`:

```jsx
function withAuth(Component) {
  function AuthGated(props) {
    const user = useUser();
    if (!user) return <Login />;
    return <Component {...props} user={user} />;
  }

  AuthGated.displayName =
    `WithAuth(${Component.displayName || Component.name || "Component"})`;

  return AuthGated;
}
```

Kết quả trong DevTools: `WithAuth(Dashboard)` — nhìn là biết ngay component nào đang bị bọc bởi HOC nào. Chuỗi fallback ba tầng là cần thiết vì component có thể đã được HOC khác đặt `displayName`, hoặc là function ẩn danh không có `name`.

Với các thư viện phổ biến, đây là thực hành chuẩn — bạn sẽ thấy `Connect(TodoList)` của Redux hay `withRouter(Page)` trong DevTools.

</details>

**7. Các `static method` của component gốc có tự động đi qua `HOC` không? Xử lý thế nào (ví dụ `hoist-non-react-statics`)?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không.** HOC trả về một function mới hoàn toàn, nên mọi thuộc tính tĩnh gắn trên component gốc đều **biến mất** trên component đã bọc.

```jsx
Page.getInitialProps = async () => ({ data: 1 });

const Wrapped = withAuth(Page);
Wrapped.getInitialProps; // undefined — đã mất
```

Đây là vấn đề thật trong các framework dựa vào static, ví dụ `getInitialProps` của Next.js pages router hay các quy ước kiểu `Component.Layout`.

Cách xử lý:

- **Copy tay** từng static nếu chỉ có vài cái: `Wrapped.getInitialProps = Page.getInitialProps`.
- **Dùng `hoist-non-react-statics`** — thư viện nhỏ tự sao chép mọi static của component gốc sang component bọc, đồng thời **bỏ qua** các thuộc tính riêng của React (`propTypes`, `defaultProps`, `contextType`...) vì chúng có ý nghĩa khác trên lớp bọc.

```jsx
import hoistNonReactStatics from "hoist-non-react-statics";

function withAuth(Component) {
  function Wrapped(props) { /* ... */ }
  return hoistNonReactStatics(Wrapped, Component);
}
```

Custom hook không gặp vấn đề này vì nó không tạo ra component mới.

</details>

**8. `ref` có xuyên qua `HOC` tới component gốc được không? Vì sao, và cách khắc phục?**

<details className="qa">
<summary>Xem đáp án</summary>

Trong React 18 trở về trước thì **không**. `ref` không phải prop thường — nó bị React lấy ra khỏi object props, nên `{...props}` không mang theo `ref`. Kết quả là `ref` gắn vào component bọc, còn component gốc bên trong thì không nhận được gì.

Cách khắc phục cổ điển là `React.forwardRef`:

```jsx
function withLogger(Component) {
  const Wrapped = React.forwardRef((props, ref) => {
    console.log("render");
    return <Component {...props} ref={ref} />;
  });
  Wrapped.displayName = `WithLogger(${Component.name})`;
  return Wrapped;
}
```

Một cách khác từng phổ biến là đổi tên: truyền `forwardedRef` như một prop thường rồi gán lại bên trong — dùng khi không muốn phụ thuộc `forwardRef`.

Từ **React 19**, `ref` đã trở thành một prop bình thường của function component, nên nó đi theo `{...props}` một cách tự nhiên và `forwardRef` không còn cần thiết cho hầu hết trường hợp. Dù vậy, đọc code cũ vẫn thấy `forwardRef` rất nhiều, nên cần hiểu lý do nó tồn tại.

</details>

**9. `Prop collision` là gì? Có những chiến lược đặt tên hay namespacing nào để tránh?**

<details className="qa">
<summary>Xem đáp án</summary>

**Prop collision** là khi HOC tiêm một prop trùng tên với prop mà người dùng truyền vào, khiến một trong hai bị ghi đè một cách âm thầm.

```jsx
const Enhanced = withRouter(MyComponent);

<Enhanced navigate={myCustomNavigate} />
// HOC tiêm navigate đè lên giá trị của người dùng
```

Thứ tự trong JSX quyết định ai thắng — viết `<Component {...props} navigate={navigate} />` thì HOC thắng; đảo lại thì người dùng thắng. Cả hai đều là bug tiềm ẩn vì không ai đọc code mà đoán được.

Các chiến lược giảm thiểu:

- **Đặt tiền tố riêng** cho prop do HOC tiêm, ví dụ `routerNavigate`, `authUser` — giảm xác suất trùng.
- **Gom vào một namespace duy nhất**: tiêm `router={{ navigate, location }}` thay vì rải nhiều prop phẳng.
- **Cho phép đổi tên qua config**: `withRouter(Page, { propName: "myRouter" })`.
- **Ưu tiên props của người dùng**: đặt `{...props}` sau cùng để người dùng luôn ghi đè được.
- **Cảnh báo trong môi trường dev** khi phát hiện tên trùng.

Custom hook triệt tiêu vấn đề này hoàn toàn: bạn tự đặt tên biến khi hứng giá trị trả về.

</details>

**10. Vì sao `HOC` khó type với TypeScript, đặc biệt khi compose nhiều tầng?**

<details className="qa">
<summary>Xem đáp án</summary>

Vấn đề cốt lõi: HOC phải diễn tả được rằng "component bọc nhận đúng những props của component gốc **trừ đi** những props HOC tự tiêm vào". Phép "trừ" này phải viết bằng generic và các utility type:

```tsx
function withUser<P extends { user: User }>(
  Component: React.ComponentType<P>
): React.FC<Omit<P, "user">> {
  return function Wrapped(props) {
    const user = useUser();
    return <Component {...(props as P)} user={user} />;
  };
}
```

Ngay ví dụ đơn giản này đã cần `Omit` và một lần ép kiểu, vì TypeScript không chứng minh được `Omit<P, "user">` cộng `user` bằng đúng `P`.

Khi compose nhiều tầng thì tệ hơn hẳn:

```tsx
const Enhanced = withAuth(withRouter(withLogger(Base)));
// Kiểu phải lan truyền và trừ dần qua ba tầng — thường phải khai báo tay
```

Ngoài ra còn mất static, mất kiểu của `ref`, khó giữ generic của component gốc. Custom hook thì ngược lại: kiểu trả về được suy ra tự động, không có phép trừ props nào cả. Đây là một trong những lý do mạnh nhất khiến hook thay thế HOC.

</details>

**11. Compose nhiều `HOC` gây "wrapper hell" — ảnh hưởng thế nào tới DevTools và tới performance?**

<details className="qa">
<summary>Xem đáp án</summary>

Mỗi HOC thêm một tầng component thật vào cây React:

```
<WithAuth>
  <WithRouter>
    <WithLogger>
      <BaseComponent />
    </WithLogger>
  </WithRouter>
</WithAuth>
```

Ảnh hưởng tới DevTools:

- Cây component phình ra, phải bấm mở nhiều tầng mới tới component thật.
- Props bị "rải" qua nhiều tầng, khó biết prop nào do HOC nào tiêm vào.
- Nếu quên đặt `displayName`, các tầng hiện là `Anonymous` — gần như không debug được.
- Stack trace lỗi dài và nhiễu.

Ảnh hưởng tới hiệu năng: mỗi tầng là một component phải render, so sánh props và giữ Fiber node riêng. Với một component thì không đáng kể, nhưng nếu component bị bọc nằm trong danh sách render hàng nghìn dòng thì chi phí nhân lên theo số tầng.

Đáng lo hơn là hiệu ứng dây chuyền: một tầng render lại thì mọi tầng dưới render theo, và việc `React.memo` đặt ở tầng nào cũng trở nên khó suy luận. Gọi ba custom hook trong cùng một component thì không thêm tầng nào cả.

</details>

**12. So sánh `HOC`, `render props` và `custom hook`: ưu nhược và tiêu chí chọn trong từng tình huống.**

<details className="qa">
<summary>Xem đáp án</summary>

| | HOC | Render props | Custom hook |
|---|---|---|---|
| Cách dùng | `withX(Component)` | Truyền function làm `children` | `const x = useX()` |
| Thêm tầng trong cây | Có | Có | Không |
| Kết hợp nhiều tính năng | Lồng hàm | Lồng JSX sâu | Gọi liên tiếp, phẳng |
| TypeScript | Khó | Trung bình | Dễ |
| Prop collision | Có | Không | Không |
| Dùng trong class | Được | Được | Không |

```jsx
// Render props
<DataProvider render={(data) => <Chart data={data} />} />

// Custom hook
const data = useData();
```

Tiêu chí chọn:

- **Custom hook** — mặc định cho mọi logic tái sử dụng trong function component. Phẳng, dễ type, không đụng cây component.
- **HOC** — khi buộc phải hỗ trợ class component, hoặc khi tích hợp thư viện đã thiết kế theo hướng đó.
- **Render props** — khi cần chia sẻ cả logic lẫn quyền quyết định render, ví dụ component đo kích thước hay list ảo hoá. Nhiều trường hợp có thể thay bằng hook trả về dữ liệu.

</details>

**13. Vì sao `HOC` vẫn cần thiết cho `class component` trong khi hook thì không dùng được ở đó?**

<details className="qa">
<summary>Xem đáp án</summary>

Hook chỉ chạy được bên trong thân của function component (hoặc bên trong hook khác). React theo dõi hook bằng thứ tự gọi trong quá trình render function; class component không có "thân render dạng function" như vậy — nó có các lifecycle method và `this`, nên không có chỗ cho hook bám vào.

```jsx
class Old extends Component {
  render() {
    const user = useAuth(); // lỗi — không gọi hook trong class
  }
}
```

HOC thì không vướng gì, vì nó chỉ là một hàm bọc bên ngoài. Bản thân component bọc là function component, được phép gọi hook thoải mái, rồi tiêm kết quả xuống class bằng props:

```jsx
function withAuth(Component) {
  return function Wrapped(props) {
    const user = useAuth();        // hook chạy ở function component
    return <Component {...props} user={user} />;
  };
}

const OldWithAuth = withAuth(Old); // class nhận user qua props
```

Đây chính là lý do HOC vẫn sống trong các codebase còn class: nó là cầu nối cho phép code cũ hưởng logic viết bằng hook mà không phải viết lại toàn bộ component sang function.

</details>

**14. Kể vài thư viện thực tế còn dùng `HOC` (`connect` của Redux, `observer` của MobX, `withRouter` của React Router v5) và hướng migrate hiện nay.**

<details className="qa">
<summary>Xem đáp án</summary>

| Thư viện | HOC | Hướng thay thế hiện nay |
|---|---|---|
| React-Redux | `connect(mapState, mapDispatch)` | `useSelector` / `useDispatch` |
| React Router v5 | `withRouter` | Hook của v6: `useNavigate`, `useLocation`, `useParams` |
| Material UI v4 | `withStyles` | `styled` và prop `sx` của v5 |
| MobX | `observer(Component)` | Vẫn dùng `observer` — đây là HOC còn sống khoẻ |
| Sentry | `withSentry`, error boundary bọc app | Vẫn dùng HOC |
| Storybook | Decorator bọc story | Vẫn dùng dạng bọc |

Nhận xét: nhóm HOC **tiêm dữ liệu** vào props (`connect`, `withRouter`, `withStyles`) gần như đã bị hook thay thế hết, vì hook làm đúng việc đó mà gọn hơn. Nhóm HOC **thay đổi hành vi render** của chính component (`observer` của MobX theo dõi dependency để render lại, `withSentry` bọc error boundary) thì hook không làm thay được, nên vẫn tồn tại hợp lý.

Với code legacy: không cần đập đi làm lại, hãy migrate dần từng component, ưu tiên những chỗ đang phải lồng nhiều tầng HOC nhất.

</details>

**15. `HOC` có ảnh hưởng tới cách `React.memo` hay `shouldComponentUpdate` hoạt động không? Giải thích.**

<details className="qa">
<summary>Xem đáp án</summary>

Có, và điểm mấu chốt là **vị trí đặt việc tối ưu**. Sau khi bọc, cây có hai tầng: component bọc ở ngoài, component gốc ở trong. `React.memo` hay `shouldComponentUpdate` chỉ chặn render lại ở **đúng tầng nó được đặt**.

- Memo đặt ở **component gốc** — component bọc vẫn render lại mỗi lần, chỉ dừng lại ở tầng dưới. Vẫn đúng, nhưng phần công việc của HOC vẫn chạy.
- Memo đặt ở **component bọc** — chặn sớm hơn, nhưng chỉ so sánh những props đi từ ngoài vào, không thấy được props do HOC tiêm.

Nguy hiểm nhất là HOC tiêm props **không ổn định tham chiếu**:

```jsx
function withHandlers(Component) {
  return function Wrapped(props) {
    // object/function mới mỗi lần render → memo bên trong luôn thất bại
    return <Component {...props} actions={{ save: () => {} }} />;
  };
}
```

Khi đó `React.memo` ở component gốc mất tác dụng hoàn toàn dù props bên ngoài không đổi. Cách xử lý: trong HOC dùng `useMemo`/`useCallback` cho các giá trị tiêm xuống. Vấn đề này khó phát hiện vì nguyên nhân nằm trong HOC, còn triệu chứng lại lộ ra ở component gốc.

</details>

**16. Nêu các bước migrate an toàn một `HOC` sang `custom hook` mà không đổi behavior.**

<details className="qa">
<summary>Xem đáp án</summary>

Quy trình từng bước:

1. **Đảm bảo có test bao phủ** hành vi hiện tại của HOC trước khi động vào bất cứ thứ gì — đây là lưới an toàn để đối chiếu sau này.
2. **Viết custom hook tương đương**, chỉ chứa phần logic: state, effect, giá trị trả về. Phần render điều kiện (ví dụ trả về `Login`) để component tự xử lý.
3. **Giữ HOC chạy song song**, và viết lại HOC cũ thành lớp mỏng gọi hook mới — hai đường dùng chung một nguồn logic, tránh phân nhánh hành vi.
4. **Migrate từng component một**, không đổi hàng loạt. Mỗi lần đổi thì chạy test và kiểm tra thủ công màn hình liên quan.
5. **Đối chiếu các điểm dễ lệch**: prop do HOC tiêm bị ghi đè, static bị mất, `ref`, `displayName`, thứ tự chạy effect.
6. **Cập nhật test** theo cách dùng mới.
7. **Xoá HOC** khi không còn ai import, và dọn cả dependency chỉ phục vụ nó.

Lưu ý quan trọng: HOC có thể đang âm thầm ghi đè prop của người dùng; sau khi chuyển sang hook thì việc ghi đè đó biến mất, nên phải kiểm tra lại hành vi chứ không chỉ kiểm tra biên dịch được.

</details>

**17. `HOC` là ứng dụng của khái niệm nào trong lập trình hàm? "Pure transformation component sang component" nghĩa là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

HOC là ứng dụng trực tiếp của **higher-order function** — hàm nhận hàm làm tham số hoặc trả về hàm. Vì trong React, component chính là function, nên "hàm bậc cao áp dụng cho component" ra đúng định nghĩa HOC. Quan hệ này giống hệt `map` hay `filter` với hàm thường.

**"Pure transformation component → component"** nghĩa là:

- HOC **không sửa đổi** component đầu vào, chỉ đọc nó.
- Cùng một đầu vào luôn cho ra kết quả hành vi giống nhau, không phụ thuộc trạng thái bên ngoài.
- Không gây tác dụng phụ lúc gọi (không ghi biến toàn cục, không gắn thứ gì vào prototype).

Nhờ tính thuần đó, HOC **composable** — ghép được như ghép hàm:

```jsx
const enhance = compose(withAuth, withRouter, withLogger);
const Enhanced = enhance(BaseComponent);
```

Tư duy này không mất đi khi chuyển sang hook: custom hook cũng là hàm tổ hợp từ các hàm nhỏ hơn, cũng nên thuần và không tác dụng phụ ngoài ý muốn. Hiểu HOC vì thế vẫn giá trị — vừa để đọc code cũ, vừa để giữ nếp tư duy functional.

</details>

**18. Khi nào một wrapper component nhận `children` sẽ rõ ràng hơn là viết một `HOC`?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi việc bạn cần làm là **bọc quanh nội dung** chứ không phải **biến đổi chính component**. Điển hình là bảo vệ route, error boundary, layout, khung theme:

```jsx
// Wrapper component — đọc là hiểu ngay
function ProtectedRoute({ children }) {
  const user = useAuth();
  if (!user) return <Login />;
  return children;
}

<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

So với HOC, wrapper rõ hơn ở chỗ:

- Cấu trúc hiện ngay trong JSX, không phải lần ngược lên nơi gọi `withX()`.
- Không có prop collision, không mất static, không vướng `ref`.
- TypeScript chỉ cần kiểu `children`, không phải phép trừ props.
- DevTools hiện đúng một tầng có tên rõ ràng.

Ngược lại, HOC vẫn hợp lý khi bạn cần **tiêm props** dựa trên chính component được bọc, hoặc khi phải áp dụng cho class component. Nguyên tắc chọn: cần thêm dữ liệu thì ưu tiên hook; cần thêm khung bao quanh thì dùng wrapper component; chỉ chọn HOC khi hai cách kia không làm được.

</details>
