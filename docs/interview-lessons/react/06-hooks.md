---
sidebar_position: 6
title: "6. Hooks"
---

# 6. Hooks

## 1. useState và useEffect

Bài học: [1. useState và useEffect](../../react/06-hooks/1_basic-hooks.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `useState` trả về gì? Vì sao phải cập nhật qua hàm `set...` chứ không gán thẳng vào biến state?**

<details className="qa">
<summary>Xem đáp án</summary>

`useState(initialValue)` trả về một mảng hai phần tử: **giá trị state hiện tại** và **hàm cập nhật** nó.

```jsx
const [count, setCount] = useState(0);
```

Biến `count` chỉ là một giá trị cục bộ của lần render này — gán `count = 5` không làm gì cả:

- Nó chỉ đổi biến JavaScript trong phạm vi lần render hiện tại, React hoàn toàn không biết.
- Không có gì kích hoạt render lại, nên giao diện đứng yên.
- Lần render sau, `useState` vẫn trả về giá trị React đang giữ, mọi thay đổi bị mất.

Hàm `setCount` mới là cầu nối với React: nó lưu giá trị mới vào Fiber của component và **đánh dấu component cần render lại**. Sau lần render đó, `useState` trả về giá trị mới.

Nói cách khác, state không nằm trong biến của bạn — nó nằm trong React, còn biến chỉ là ảnh chụp của lần render hiện tại.

</details>

**2. Đoán output: trong một event handler gọi `setCount(count + 1)` rồi `console.log(count)` ngay dòng dưới thì in ra số nào? Vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

In ra **giá trị cũ**, chưa tăng.

```jsx
const [count, setCount] = useState(0);

const handleClick = () => {
  setCount(count + 1);
  console.log(count); // 0, không phải 1
};
```

Lý do: `count` là một **hằng số của lần render hiện tại**. Trong suốt handler này, `count` luôn bằng `0` — nó được "đóng băng" từ lúc component render ra hàm handler đó. `setCount` không gán lại biến `count`; nó chỉ báo cho React biết giá trị mới cho lần render **tiếp theo**.

Đây là điều nhiều người gọi nhầm là "setState bất đồng bộ". Thực chất không phải chuyện chờ đợi, mà là mỗi lần render có một bộ biến riêng — React gọi đây là snapshot của render.

Muốn dùng giá trị mới ngay trong handler thì tự tính ra biến:

```jsx
const next = count + 1;
setCount(next);
console.log(next); // 1
```

</details>

**3. Phân biệt `setCount(count + 1)` và `setCount(c => c + 1)`. Gọi `setCount(count + 1)` ba lần liên tiếp trong cùng một handler thì `count` tăng thêm mấy?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `setCount(count + 1)` | `setCount(c => c + 1)` |
|---|---|---|
| Dựa trên | Biến `count` của lần render hiện tại | Giá trị mới nhất trong hàng đợi cập nhật |
| Gọi nhiều lần liên tiếp | Các lệnh ghi đè nhau | Các lệnh cộng dồn |
| Nên dùng khi | Giá trị mới không phụ thuộc giá trị cũ | Giá trị mới tính từ giá trị cũ |

Gọi ba lần dạng thứ nhất thì `count` chỉ **tăng thêm 1**:

```jsx
// count đang là 0
setCount(count + 1); // xếp hàng: gán 1
setCount(count + 1); // xếp hàng: gán 1 (count vẫn là 0)
setCount(count + 1); // xếp hàng: gán 1
// Kết quả: 1

setCount(c => c + 1); // 0 → 1
setCount(c => c + 1); // 1 → 2
setCount(c => c + 1); // 2 → 3
// Kết quả: 3
```

**Updater function** nhận tham số là giá trị mới nhất sau các cập nhật đã xếp hàng trước nó, nên luôn đúng kể cả khi React gộp nhiều lệnh. Quy tắc: hễ giá trị mới được tính từ giá trị cũ thì dùng dạng updater.

</details>

**4. Batching là gì? React 18 thay đổi gì về automatic batching so với React 17 (trong `setTimeout`, trong promise, trong native event listener)?**

<details className="qa">
<summary>Xem đáp án</summary>

**Batching** là việc React gom nhiều lệnh cập nhật state trong cùng một lượt xử lý thành **một lần render duy nhất**, thay vì render lại sau từng lệnh.

```jsx
const handleClick = () => {
  setCount(c => c + 1);
  setFlag(true);
  setName("A");
  // Chỉ một lần re-render
};
```

| Bối cảnh | React 17 và trước | React 18 |
|---|---|---|
| Event handler của React | Có gộp | Có gộp |
| Trong `setTimeout` | Không — render mỗi lệnh | Có gộp |
| Trong `.then()` của promise, callback `fetch` | Không | Có gộp |
| Trong listener DOM gắn tay | Không | Có gộp |

React 18 gọi đây là **automatic batching**: gộp ở mọi nơi, không chỉ trong synthetic event. Lợi ích là ít render thừa, giao diện không nhấp nháy qua các trạng thái trung gian — rất dễ thấy khi một hàm async gọi liên tiếp `setLoading(false)` và `setData(...)`.

Khi thực sự cần React render và cập nhật DOM ngay lập tức, có thể thoát batching bằng `flushSync` từ `react-dom`. Đây là ngoại lệ hiếm, dùng nhiều sẽ mất luôn lợi ích hiệu năng.

</details>

**5. Vì sao không được mutate state trực tiếp kiểu `arr.push(x)` rồi `setArr(arr)`? React so sánh state cũ và mới bằng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

React so sánh state cũ và mới bằng **`Object.is`** — tức so sánh **tham chiếu** với object và array, chứ không duyệt vào bên trong.

```jsx
// Sai — cùng một object, React thấy "không đổi"
arr.push(4);
setArr(arr);

// Đúng — tạo mảng mới
setArr([...arr, 4]);
```

`push` sửa ngay trên mảng cũ nên tham chiếu không đổi. React so sánh thấy bằng nhau, bỏ qua lệnh render — giao diện đứng yên dù dữ liệu đã đổi. Tệ hơn, đôi khi nó vẫn "chạy đúng" nhờ một lần render vì lý do khác, tạo ra bug lúc có lúc không, rất khó lần.

Lý do React chọn so sánh nông: kiểm tra `===` nhanh hơn rất nhiều so với so sánh sâu từng thuộc tính, giúp render dự đoán được và tối ưu được. Cái giá là lập trình viên phải giữ tính bất biến.

Với object lồng sâu, phải spread từng cấp:

```jsx
setUser(prev => ({ ...prev, address: { ...prev.address, city: "HCM" } }));
```

Nếu boilerplate quá nhiều thì dùng **Immer** (hoặc Redux Toolkit vốn dùng Immer bên dưới) để viết theo cú pháp "mutate" mà vẫn sinh ra object mới.

</details>

**6. `useState(() => expensiveInit())` khác `useState(expensiveInit())` ở điểm nào? Kỹ thuật này tên là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Kỹ thuật này gọi là **lazy initial state**.

```jsx
// Tệ — expensiveInit() chạy ở MỌI lần render
const [data, setData] = useState(loadFromLocalStorage());

// Tốt — chỉ chạy đúng một lần lúc mount
const [data, setData] = useState(() => loadFromLocalStorage());
```

Điểm khác biệt nằm ở chỗ JavaScript đánh giá tham số trước khi gọi hàm. Ở dạng thứ nhất, `loadFromLocalStorage()` được thực thi mỗi lần component render; React chỉ dùng kết quả ở lần đầu rồi vứt đi những lần sau — lãng phí hoàn toàn.

Ở dạng thứ hai, bạn truyền vào **một function chưa chạy**. React tự nhận ra đây là initializer và chỉ gọi nó ở lần render đầu tiên.

Khi nào nên dùng: đọc `localStorage`, parse JSON lớn, tính toán nặng, tạo cấu trúc dữ liệu lớn. Với giá trị rẻ như `useState(0)` hay `useState("")` thì không cần, viết thẳng cho gọn.

Lưu ý phân biệt với updater function của `setState`: cùng là truyền hàm, nhưng một bên khởi tạo (không nhận tham số), một bên cập nhật (nhận giá trị cũ).

</details>

**7. Vì sao khởi tạo state từ props (`useState(props.value)`) thì state không tự cập nhật khi props đổi? Nêu các cách xử lý đúng.**

<details className="qa">
<summary>Xem đáp án</summary>

Vì tham số của `useState` chỉ được dùng ở **lần render đầu tiên**. Từ lần thứ hai trở đi React bỏ qua nó hoàn toàn và trả về giá trị đang giữ. Props đổi thì component render lại, nhưng state vẫn là giá trị cũ đã chốt lúc mount.

Các cách xử lý, theo thứ tự ưu tiên:

- **Đừng copy props vào state** nếu không cần. Dùng thẳng `props.value` khi nó chỉ là dữ liệu hiển thị hoặc derive được.
- **Dùng prop `key` để reset component** — cách được React khuyến nghị. Khi `key` đổi, React unmount component cũ và mount mới, toàn bộ state khởi tạo lại sạch sẽ.

```jsx
<ProfileForm key={userId} userId={userId} />
```

- **Đưa state lên component cha** (lifting state up) nếu cha mới là nơi sở hữu dữ liệu thật.
- **Điều chỉnh state ngay trong lúc render** khi chỉ cần reset một phần: lưu giá trị prop trước đó vào một state phụ, so sánh và gọi `setState` ngay trong thân component.

Cách hay bị lạm dụng nhất là `useEffect(() => setValue(props.value), [props.value])` — nó thêm một lần render thừa và dễ sinh vòng lặp, nên coi là phương án cuối.

</details>

**8. `useEffect` chạy vào thời điểm nào trong chu trình render? So sánh với `useLayoutEffect` về thời điểm chạy và trường hợp nên dùng.**

<details className="qa">
<summary>Xem đáp án</summary>

Thứ tự trong một lượt cập nhật: React chạy hàm component → tạo cây mới → commit thay đổi vào DOM → chạy `useLayoutEffect` (đồng bộ, **trước** khi trình duyệt vẽ) → trình duyệt vẽ → chạy `useEffect` (bất đồng bộ, **sau** khi vẽ).

| | `useEffect` | `useLayoutEffect` |
|---|---|---|
| Thời điểm | Sau khi trình duyệt vẽ xong | Sau khi commit DOM, trước khi vẽ |
| Chặn hiển thị | Không | Có — chạy lâu là giật khung hình |
| Dùng cho | Fetch, subscribe, timer, analytics, log | Đo kích thước/vị trí DOM rồi chỉnh ngay |
| Chạy trên server (SSR) | Không | Không, và còn cảnh báo |

Nguyên tắc: **mặc định dùng `useEffect`**. Chỉ chuyển sang `useLayoutEffect` khi hiệu ứng của bạn làm người dùng thấy giao diện nhấp nháy — ví dụ đo chiều cao tooltip rồi đặt vị trí, hoặc khôi phục vị trí cuộn. Vì `useLayoutEffect` chạy đồng bộ và chặn việc vẽ, dùng bừa sẽ làm chậm cảm giác phản hồi của trang.

</details>

**9. Ba dạng dependency array — không truyền array, truyền `[]`, truyền `[a, b]` — khác nhau ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

```jsx
useEffect(() => { /* ... */ });          // sau MỌI lần render
useEffect(() => { /* ... */ }, []);      // chỉ một lần khi mount
useEffect(() => { /* ... */ }, [a, b]);  // khi a hoặc b đổi
```

- **Không truyền array** — effect chạy sau mọi lần render. Rất dễ tạo vòng lặp vô hạn nếu bên trong có `setState`. Hiếm khi là thứ bạn thực sự muốn.
- **Truyền `[]`** — chạy một lần lúc mount, cleanup chạy lúc unmount. Hợp với việc đăng ký một lần: listener toàn cục, khởi tạo thư viện bên thứ ba, gửi sự kiện analytics. Cẩn thận: nếu bên trong dùng biến thay đổi được thì sẽ dính stale closure.
- **Truyền `[a, b]`** — React so sánh từng phần tử với lần trước; khác thì chạy cleanup cũ rồi chạy effect mới.

Cách nghĩ đúng không phải là "chọn lúc nào chạy", mà là: effect **đồng bộ component với hệ thống bên ngoài**, và deps là danh sách mọi giá trị mà việc đồng bộ đó phụ thuộc vào. Liệt kê đủ thì React tự biết khi nào cần đồng bộ lại.

</details>

**10. React so sánh dependency bằng thuật toán nào? Vì sao truyền một object hoặc array literal vào deps khiến effect chạy lại sau mọi render?**

<details className="qa">
<summary>Xem đáp án</summary>

React so sánh từng phần tử của deps bằng **`Object.is`** — tương đương `===` với vài khác biệt nhỏ ở `NaN` và `-0`. Đây là so sánh **nông theo tham chiếu**, không nhìn vào bên trong object.

Vì thế object hay array viết thẳng trong thân component là một tham chiếu **mới** ở mỗi lần render:

```jsx
function Chart({ userId }) {
  const options = { userId, theme: "dark" }; // object mới mỗi render

  useEffect(() => {
    load(options);
  }, [options]); // luôn "khác" → chạy lại mọi render
}
```

Cùng nội dung nhưng khác tham chiếu, nên `Object.is` trả về `false`. Nếu trong effect có `setState` thì thành vòng lặp vô hạn.

Các cách xử lý:

- **Liệt kê giá trị nguyên thuỷ** thay vì cả object: `}, [userId])`.
- **Bọc bằng `useMemo`** khi thật sự cần cả object: `const options = useMemo(() => ({ userId }), [userId])`.
- **Đưa việc tạo object vào trong effect**, để nó không phải là dependency.

Cùng lý do đó, function khai báo trong thân component cũng là tham chiếu mới mỗi render — cần `useCallback` nếu bắt buộc đưa vào deps.

</details>

**11. Cleanup function là gì và chạy vào những thời điểm nào? Kể các trường hợp bắt buộc phải cleanup.**

<details className="qa">
<summary>Xem đáp án</summary>

Cleanup là **hàm được return ra từ effect**, dùng để dọn dẹp những gì effect đã tạo ra.

```jsx
useEffect(() => {
  const id = setInterval(() => tick(), 1000);
  return () => clearInterval(id);
}, []);
```

Nó chạy ở hai thời điểm:

- **Trước mỗi lần effect chạy lại** (khi có dependency thay đổi) — dọn lần chạy cũ rồi mới thiết lập lần mới.
- **Khi component unmount**.

Các trường hợp bắt buộc:

- **Timer** — `setInterval`, `setTimeout`, `requestAnimationFrame`.
- **Subscription** — WebSocket, EventSource, observable, store bên ngoài.
- **Event listener** gắn tay lên `window`, `document` hay node DOM.
- **Request đang bay** — huỷ bằng `AbortController` hoặc cờ `ignore` để tránh ghi state sau khi component đã chết.
- **Tài nguyên của thư viện bên thứ ba** — instance chart, map, editor cần gọi `destroy()`.

Thiếu cleanup dẫn tới rò rỉ bộ nhớ, nhiều kết nối chồng lên nhau, timer chạy song song và cảnh báo cập nhật state trên component đã unmount. Mẹo tự kiểm: mỗi lệnh "tạo/đăng ký" trong effect phải có một lệnh "huỷ/gỡ" tương ứng trong cleanup.

</details>

**12. Vì sao ở môi trường development bật `StrictMode` thì `useEffect` chạy 2 lần khi mount? Nó giúp phát hiện loại bug nào, và điều đó có xảy ra trên production không?**

<details className="qa">
<summary>Xem đáp án</summary>

Trong StrictMode (chỉ ở development), React cố tình mô phỏng một vòng mount → unmount → mount lại:

```
1. Mount     → effect chạy
2. Unmount   → cleanup chạy
3. Mount lại → effect chạy lần nữa
```

Mục đích là **bắt lỗi thiếu cleanup**. Effect viết đúng thì hai lần chạy cho kết quả giống hệt một lần; effect thiếu cleanup thì lộ ngay:

```jsx
useEffect(() => {
  socket.connect();          // StrictMode: 2 socket cùng sống
}, []);

useEffect(() => {
  socket.connect();
  return () => socket.disconnect(); // connect → disconnect → connect: chỉ 1 socket
}, []);
```

Trên production, React **không** chạy đôi như vậy. Nhưng đừng coi đó là lý do để bỏ qua: component hoàn toàn có thể bị unmount rồi mount lại nhiều lần trong đời thật — điều hướng qua lại, offscreen rendering, fast refresh lúc phát triển. Effect chỉ đúng khi chạy một lần duy nhất là một quả bom hẹn giờ.

Vì vậy StrictMode chạy đôi không phải là bug cần "tắt đi", mà là công cụ giúp bạn phát hiện effect chưa idempotent.

</details>

**13. Stale closure là gì? Giải thích vì sao `setInterval` đặt trong `useEffect` với deps `[]` luôn đọc `count` bằng giá trị lúc mount.**

<details className="qa">
<summary>Xem đáp án</summary>

**Stale closure** là tình huống một hàm "ghi nhớ" biến của lần render cũ và tiếp tục dùng giá trị đã lỗi thời đó.

```jsx
const [count, setCount] = useState(0);

useEffect(() => {
  const id = setInterval(() => {
    console.log(count);      // luôn in 0
    setCount(count + 1);     // luôn đặt về 1
  }, 1000);
  return () => clearInterval(id);
}, []); // deps rỗng
```

Cơ chế: mỗi lần render tạo ra một phiên bản mới của hàm component, với một biến `count` riêng. Callback truyền cho `setInterval` được tạo trong lần render đầu tiên, nên nó **đóng gói** (closure) đúng biến `count` của lần đó — tức là `0`.

Vì deps là `[]`, effect không bao giờ chạy lại, `setInterval` cũ vẫn sống cùng callback cũ. Các lần render sau có `count` mới, nhưng callback đó không hề biết tới chúng — nó nhìn vào một biến đã bị "đóng băng".

Đây là bug kinh điển của hook, và đáng chú ý là ESLint đã cảnh báo sẵn: `count` được dùng trong effect nhưng không có trong deps.

</details>

**14. Nêu ít nhất ba cách sửa bug stale closure ở câu trên (updater function, thêm dependency, dùng `useRef`) và đánh đổi của từng cách.**

<details className="qa">
<summary>Xem đáp án</summary>

**Cách 1 — updater function** (thường tốt nhất):

```jsx
useEffect(() => {
  const id = setInterval(() => setCount(c => c + 1), 1000);
  return () => clearInterval(id);
}, []);
```

Không cần đọc `count` nữa nên không còn closure cũ. Interval chỉ tạo một lần. Hạn chế: chỉ dùng được khi bạn chỉ cần **ghi** state, không cần đọc giá trị để làm việc khác.

**Cách 2 — thêm `count` vào deps:**

```jsx
useEffect(() => {
  const id = setInterval(() => setCount(count + 1), 1000);
  return () => clearInterval(id);
}, [count]);
```

Luôn đọc đúng giá trị mới. Đánh đổi: mỗi lần `count` đổi thì clear và tạo lại interval — đồng hồ bị "đặt lại" liên tục, không phù hợp nếu cần nhịp chính xác.

**Cách 3 — `useRef` giữ giá trị mới nhất:**

```jsx
const countRef = useRef(count);
useEffect(() => { countRef.current = count; }, [count]);

useEffect(() => {
  const id = setInterval(() => console.log(countRef.current), 1000);
  return () => clearInterval(id);
}, []);
```

Đọc được giá trị mới mà không tạo lại interval. Đánh đổi: thêm code, và ref không kích hoạt render nên dễ khiến giao diện lệch với dữ liệu nếu dùng sai chỗ.

</details>

**15. Đoán hành vi: effect có deps `[]` mà bên trong gọi `setCount(count + 1)` thì chuyện gì xảy ra? Còn nếu deps là `[count]`?**

<details className="qa">
<summary>Xem đáp án</summary>

**Với deps `[]`:** effect chạy đúng một lần sau khi mount, `count` tăng từ `0` lên `1`, component render lại, rồi **dừng**. Effect không chạy lại vì deps rỗng. Không có vòng lặp.

```jsx
useEffect(() => {
  setCount(count + 1); // chạy 1 lần: 0 → 1
}, []);
```

(Ở StrictMode dev, effect chạy đôi nên có thể thấy `count` nhảy tới `2` — thêm một lý do để không viết kiểu này.)

**Với deps `[count]`:** **vòng lặp vô hạn**.

```jsx
useEffect(() => {
  setCount(count + 1);
}, [count]);
// render → effect → setCount → count đổi → render → effect → ...
```

Mỗi lần effect chạy lại đổi `count`, `count` đổi lại kích hoạt effect. React sẽ dừng lại và báo lỗi "Maximum update depth exceeded".

Bài học rút ra: đặt `setState` trong effect mà state đó cũng nằm trong deps là công thức của vòng lặp. Trước khi viết, hãy hỏi giá trị này có **derive** thẳng từ state khác được không — phần lớn trường hợp là có, và khi đó không cần effect lẫn state phụ.

</details>

**16. Race condition khi fetch dữ liệu trong `useEffect` xảy ra như thế nào? Trình bày cách xử lý bằng biến cờ `ignore` và bằng `AbortController`.**

<details className="qa">
<summary>Xem đáp án</summary>

Kịch bản: `userId` đổi nhanh từ 1 sang 2. Hai request cùng bay. Nếu request của user 1 về **sau**, nó ghi đè dữ liệu của user 2 — màn hình hiện sai người dùng. Mạng không đảm bảo thứ tự trả về theo thứ tự gửi đi.

**Cách 1 — biến cờ, bỏ qua kết quả cũ:**

```jsx
useEffect(() => {
  let ignore = false;

  fetch(`/api/users/${userId}`)
    .then(r => r.json())
    .then(data => { if (!ignore) setUser(data); });

  return () => { ignore = true; };
}, [userId]);
```

Cleanup chạy trước lần effect sau, bật cờ lên, nên kết quả về muộn bị bỏ qua. Đơn giản, luôn đúng, nhưng request vẫn chạy tới cùng.

**Cách 2 — `AbortController`, huỷ hẳn request:**

```jsx
useEffect(() => {
  const ctrl = new AbortController();

  fetch(url, { signal: ctrl.signal })
    .then(r => r.json())
    .then(setData)
    .catch(err => { if (err.name !== "AbortError") console.error(err); });

  return () => ctrl.abort();
}, [url]);
```

Tiết kiệm băng thông và tài nguyên server, nhưng phải nhớ lọc `AbortError` để không báo lỗi giả. Trong dự án thật, các thư viện như TanStack Query đã xử lý sẵn toàn bộ chuyện này.

</details>

**17. Khi nào KHÔNG nên dùng `useEffect`? Cho ví dụ một giá trị derive được trực tiếp từ state mà nhiều người viết nhầm thành effect kèm state phụ.**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên tắc: `useEffect` dùng để **đồng bộ với hệ thống bên ngoài React** (API, DOM thật, subscription, timer). Nếu việc bạn làm chỉ liên quan tới dữ liệu bên trong React thì gần như chắc chắn không cần effect.

Ví dụ kinh điển — tính số lượng từ mảng:

```jsx
// Sai — thừa state, thừa effect, thừa một lần render
const [items, setItems] = useState([]);
const [count, setCount] = useState(0);

useEffect(() => {
  setCount(items.length);
}, [items]);

// Đúng — tính thẳng lúc render
const count = items.length;
```

Các trường hợp khác cũng không cần effect:

- **Lọc, sắp xếp, tính tổng** từ state có sẵn — tính thẳng, nặng thì bọc `useMemo`.
- **Đồng bộ state theo prop** — dùng prop `key` để reset component.
- **Phản ứng với hành động của người dùng** — viết trong event handler, không viết trong effect.
- **Truyền dữ liệu lên cha khi state đổi** — gọi callback ngay trong handler.

Effect thừa gây thêm một lượt render, dễ sinh vòng lặp, và khiến luồng dữ liệu khó lần. Trang `react.dev/learn/you-might-not-need-an-effect` liệt kê đầy đủ các anti-pattern này.

</details>

**18. Rule `react-hooks/exhaustive-deps` cảnh báo điều gì? Vì sao việc thêm `eslint-disable` cho nó thường là che giấu bug thay vì sửa bug?**

<details className="qa">
<summary>Xem đáp án</summary>

Rule này cảnh báo khi effect (hoặc `useMemo`, `useCallback`) **dùng một giá trị phản ứng mà không khai báo trong deps** — biến props, state, hoặc hàm/biến khai báo trong thân component.

```jsx
useEffect(() => {
  fetch(`/api/users/${userId}`).then(r => r.json()).then(setData);
}, []); // cảnh báo: thiếu userId
```

Tại sao tắt cảnh báo là nguy hiểm: thiếu dependency nghĩa là effect vẫn đang dùng **giá trị của lần render cũ** — chính là stale closure. Ở ví dụ trên, `userId` đổi nhưng effect không chạy lại, dữ liệu hiển thị lỗi thời. Thêm `eslint-disable` không sửa gì, nó chỉ làm tắt tiếng chuông báo cháy.

Hướng xử lý đúng khi cảnh báo "phiền":

- Dùng **updater function** để không cần đọc state cũ.
- Bọc hàm bằng **`useCallback`**, giá trị bằng **`useMemo`** để tham chiếu ổn định.
- **Đưa việc tạo hàm/object vào trong effect** nếu chỉ effect đó dùng.
- **Tách effect** ra nhiều effect nhỏ, mỗi cái một mối quan tâm và bộ deps riêng.

Có trường hợp tắt là hợp lý — ví dụ gửi analytics đúng một lần lúc mount — nhưng phải kèm comment giải thích lý do.

</details>

**19. Vì sao không nên đưa thẳng một function khai báo trong thân component vào dependency array? Có những cách nào để giữ ổn định reference của nó?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì function khai báo trong thân component được **tạo mới ở mỗi lần render**, nên tham chiếu luôn khác lần trước. React so sánh deps bằng `Object.is`, thấy khác, và chạy lại effect sau mọi lần render:

```jsx
function Room({ roomId }) {
  const connect = () => createConnection(roomId); // hàm mới mỗi render

  useEffect(() => {
    const conn = connect();
    return () => conn.disconnect();
  }, [connect]); // chạy lại liên tục → kết nối lại liên tục
}
```

Các cách xử lý:

- **Đưa hàm vào trong effect** — gọn nhất khi chỉ effect đó dùng. Lúc này deps chỉ còn các giá trị nguyên thuỷ như `roomId`.
- **Đưa hàm ra ngoài component** nếu nó không dùng props hay state — khi đó nó là hằng số, không cần vào deps.
- **Bọc bằng `useCallback`** với deps riêng của nó — dùng khi hàm phải chia sẻ cho nhiều nơi hoặc truyền xuống component đã `React.memo`.
- **Lưu vào `useRef`** để giữ phiên bản mới nhất mà không làm effect chạy lại — hợp với callback kiểu event, nhưng phải cẩn thận vì ref không kích hoạt render.

Nguyên tắc chung: ưu tiên **giảm số dependency** thay vì tìm cách "ổn định hoá" mọi thứ.

</details>

**20. Nên tách nhiều `useState` riêng lẻ hay gộp thành một object state? Đánh đổi là gì, và dấu hiệu nào cho thấy đã đến lúc chuyển sang `useReducer`?**

<details className="qa">
<summary>Xem đáp án</summary>

| | Nhiều `useState` riêng | Một object state |
|---|---|---|
| Cập nhật | Gọn: `setName(v)` | Phải spread: `setForm(p => ({ ...p, name: v }))` |
| Cập nhật nhiều field cùng lúc | Nhiều lệnh (React vẫn gộp render) | Một lệnh duy nhất |
| Nguy cơ mất field | Không | Có, nếu quên spread |
| Hợp với | Các giá trị độc lập | Các giá trị luôn đổi cùng nhau |

Nguyên tắc: **tách riêng theo mặc định**, gộp lại khi các giá trị thực sự luôn thay đổi cùng nhau (ví dụ toạ độ `x` và `y` của con trỏ).

Dấu hiệu nên chuyển sang `useReducer`:

- Các state **phụ thuộc lẫn nhau** — đổi cái này bắt buộc phải đổi cái kia để giữ dữ liệu hợp lệ.
- Một hành động của người dùng kéo theo **nhiều lệnh `setState`** lặp đi lặp lại ở nhiều chỗ.
- State có dạng **máy trạng thái** rõ rệt: `idle → loading → success | error`.
- Logic cập nhật phức tạp, muốn **tách khỏi component** để test riêng dễ dàng.
- Cần truyền hàm cập nhật xuống sâu — `dispatch` có tham chiếu ổn định, tiện hơn nhiều callback.

Với form đơn giản vài field thì `useState` vẫn dễ đọc hơn; đừng chuyển sang reducer chỉ vì thấy nó "chuyên nghiệp".

</details>

**21. Hai component anh em cùng cần một state thì đặt state ở đâu? Giải thích lifting state up và cái giá phải trả về re-render.**

<details className="qa">
<summary>Xem đáp án</summary>

Đặt state ở **component cha chung gần nhất** của hai anh em. Đây gọi là **lifting state up**: cha giữ state, truyền giá trị xuống qua props và truyền hàm cập nhật xuống cho con nào cần thay đổi.

```jsx
function Parent() {
  const [query, setQuery] = useState("");
  return (
    <>
      <SearchInput value={query} onChange={setQuery} />
      <ResultList query={query} />
    </>
  );
}
```

Dữ liệu chảy một chiều từ trên xuống, chỉ có một nguồn sự thật — hai con không bao giờ lệch nhau.

Cái giá phải trả: state nằm ở cha, nên **mỗi lần state đổi thì cha render lại, kéo theo toàn bộ cây con** render theo, kể cả các con không liên quan. Càng đẩy state lên cao thì vùng bị ảnh hưởng càng lớn.

Cách giảm nhẹ:

- Đặt state ở **cha chung gần nhất**, đừng đẩy lên cao hơn mức cần thiết.
- **Tách component** để cô lập phần thay đổi thường xuyên.
- Dùng **`children`** để phần không phụ thuộc state không bị render lại.
- Bọc `React.memo` cho con nặng, kèm `useCallback` cho callback truyền xuống.
- Khi phải truyền props qua quá nhiều tầng (prop drilling), cân nhắc Context hoặc thư viện quản lý state.

</details>

---

## 2. useRef, useCallback, useMemo, useReducer, useContext

Bài học: [2. useRef, useCallback, useMemo, useReducer, useContext](../../react/06-hooks/2_common-hooks.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `useRef` trả về gì? Vì sao gán lại `ref.current` không làm component re-render?**

<details className="qa">
<summary>Xem đáp án</summary>

`useRef(initial)` trả về một **object duy nhất** dạng `{ current: initial }`. React giữ chính object đó qua mọi lần render — bạn luôn nhận lại đúng một tham chiếu, không bao giờ là object mới.

```jsx
const renderCount = useRef(0);
renderCount.current++; // không gây render lại
```

Lý do không re-render: React chỉ lên lịch render khi bạn gọi hàm `set` của `useState` hoặc `dispatch` của `useReducer`. Ghi vào `ref.current` chỉ là một phép gán JavaScript thông thường trên một object bình thường — React hoàn toàn không theo dõi, không có cơ chế nào báo cho nó biết.

Đây vừa là điểm mạnh vừa là bẫy:

- **Mạnh** — giữ được giá trị bền qua các render mà không tốn một lượt render nào.
- **Bẫy** — nếu hiển thị `ref.current` trong JSX, giá trị trên màn hình sẽ lỗi thời cho tới khi có thứ khác kích hoạt render.

Quy tắc: thứ gì người dùng cần nhìn thấy thì để trong state; thứ gì chỉ code cần nhớ thì để trong ref.

</details>

**2. Khi nào dùng `useRef` thay cho `useState`? Cho ví dụ các giá trị nên nằm trong ref (id của timer, giá trị của render trước, cờ đã mount).**

<details className="qa">
<summary>Xem đáp án</summary>

Tiêu chí duy nhất: **giá trị này có cần hiển thị ra giao diện không?** Có thì dùng state, không thì dùng ref.

Các giá trị điển hình nên nằm trong ref:

- **Id của timer** — để cleanup, người dùng không bao giờ thấy nó.

```jsx
const timerRef = useRef(null);
timerRef.current = setInterval(tick, 1000);
useEffect(() => () => clearInterval(timerRef.current), []);
```

- **Giá trị của render trước** — để so sánh với giá trị hiện tại.

```jsx
const prevCount = useRef(count);
useEffect(() => { prevCount.current = count; }, [count]);
```

- **Cờ đã mount** — tránh cập nhật state sau khi component đã chết.
- **Tham chiếu tới DOM node** — để gọi `focus()`, `scrollIntoView()`, đo kích thước.
- **Instance của thư viện bên thứ ba** — chart, map, editor.
- **Giá trị mới nhất cho callback dài hạn**, dùng để phá stale closure.

Ngược lại, đừng dùng ref cho dữ liệu hiển thị: đổi ref mà giao diện không cập nhật là loại bug rất khó nhận ra vì đôi khi nó "tự đúng" nhờ một lần render vì lý do khác.

</details>

**3. Đoán khác biệt: một biến thường `let x = 0` khai báo trong thân component so với `useRef(0)` — sau nhiều lần render giá trị của chúng khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Biến thường **bị khởi tạo lại ở mọi lần render**, còn ref **giữ nguyên giá trị**.

```jsx
function Counter() {
  let plain = 0;
  const refCount = useRef(0);

  plain++;
  refCount.current++;

  console.log(plain, refCount.current);
  // Render 1: 1 1
  // Render 2: 1 2
  // Render 3: 1 3
}
```

Lý do: mỗi lần render là một lần **gọi lại hàm component**. Toàn bộ biến cục bộ được tạo mới từ đầu, nên `plain` luôn quay về `0` rồi tăng lên `1`. Trong khi đó `useRef` trả về đúng một object mà React cất giữ trong Fiber của component, nên `refCount.current` tích luỹ qua các lần render.

Điểm giống nhau: cả hai đều **không kích hoạt render lại** khi thay đổi.

Cách nhớ: biến thường sống trong **một lần render**; ref sống suốt **đời component**; state cũng sống suốt đời component nhưng thêm khả năng kích hoạt render.

</details>

**4. Vì sao đọc `ref.current` của một DOM node ngay trong thân render là sai? Thời điểm nào mới đọc được?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì React chỉ gán DOM node vào `ref.current` **sau khi commit** cây vào DOM thật. Trong lúc thân component đang chạy, DOM tương ứng chưa tồn tại, nên ở lần render đầu tiên `ref.current` vẫn là `null`.

```jsx
function Input() {
  const inputRef = useRef(null);

  console.log(inputRef.current); // null ở lần render đầu
  // inputRef.current.focus();   // lỗi: đọc thuộc tính của null

  return <input ref={inputRef} />;
}
```

Ngoài ra, đọc hoặc ghi DOM trong lúc render vi phạm yêu cầu component phải thuần — nó là một side effect, và với concurrent rendering, React có thể render rồi bỏ dở một lượt mà không commit.

Thời điểm đọc được:

- Trong **`useEffect`** — sau khi DOM đã commit và trình duyệt đã vẽ. Đây là lựa chọn mặc định.
- Trong **`useLayoutEffect`** — sau commit nhưng trước khi vẽ, dùng khi cần đo kích thước rồi chỉnh vị trí ngay để tránh nhấp nháy.
- Trong **event handler** — lúc đó DOM chắc chắn đã có.

```jsx
useEffect(() => { inputRef.current.focus(); }, []);
```

</details>

**5. `useCallback(fn, deps)` tương đương cách viết nào bằng `useMemo`?**

<details className="qa">
<summary>Xem đáp án</summary>

Tương đương với một `useMemo` **trả về chính function đó**:

```jsx
useCallback(fn, deps);
// tương đương
useMemo(() => fn, deps);
```

Ví dụ cụ thể:

```jsx
const handler = useCallback(() => doSomething(a), [a]);
const handler = useMemo(() => () => doSomething(a), [a]);
```

Chú ý hai tầng arrow function ở dạng `useMemo`: tầng ngoài là hàm khởi tạo mà React gọi để lấy giá trị, tầng trong mới là function bạn muốn ghi nhớ. Đây chính là nguồn nhầm lẫn phổ biến — viết `useMemo(() => doSomething(a), [a])` là ghi nhớ **kết quả** của lời gọi, hoàn toàn khác.

`useCallback` sinh ra chỉ để tránh cú pháp lủng củng đó. Trong mã nguồn React, nó thực chất dùng cùng cơ chế với `useMemo`.

Quy tắc chọn: ghi nhớ một **function** thì dùng `useCallback`; ghi nhớ **giá trị** (object, array, kết quả tính toán) thì dùng `useMemo`.

</details>

**6. Phân biệt `useMemo` và `useCallback` — cái nào ghi nhớ giá trị, cái nào ghi nhớ chính function?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `useMemo` | `useCallback` |
|---|---|---|
| Ghi nhớ | **Giá trị trả về** của hàm khởi tạo | **Chính function** được truyền vào |
| Tham số đầu | Hàm tính toán, React sẽ gọi | Function cần giữ ổn định, React không gọi |
| Dùng cho | Kết quả tính nặng, object, array | Event handler, callback truyền xuống con |

```jsx
// useMemo — React GỌI hàm và nhớ kết quả
const filtered = useMemo(
  () => products.filter(p => p.name.includes(filter)),
  [products, filter]
);

// useCallback — React KHÔNG gọi, chỉ giữ nguyên tham chiếu
const onSelect = useCallback((p) => console.log(p), []);
```

Điểm chung: cả hai đều chỉ tính/tạo lại khi dependency đổi (so sánh bằng `Object.is`), và cả hai đều có **hai mục đích** — tiết kiệm tính toán, và giữ **ổn định tham chiếu** để `React.memo` hoặc dependency array của effect hoạt động đúng.

Trên thực tế, mục đích thứ hai mới hay gặp hơn: phần lớn phép tính trong component đều rẻ, còn việc tham chiếu đổi mỗi render mới là thứ phá vỡ memoization.

</details>

**7. Vì sao bọc `useCallback` quanh callback truyền xuống child KHÔNG có tác dụng nếu child chưa được bọc `React.memo`?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì component con **không bọc `React.memo` thì luôn render lại** mỗi khi cha render — bất kể props có đổi hay không. React không hề so sánh props trong trường hợp này.

```jsx
function Child({ onClick }) { /* không memo → luôn render lại */ }

function Parent() {
  const onClick = useCallback(() => {}, []); // vô ích ở đây
  return <Child onClick={onClick} />;
}
```

Kết quả là `useCallback` không tiết kiệm được gì, mà còn **thêm chi phí**: React phải lưu function cũ, so sánh mảng deps mỗi lần render, và closure cũ bị giữ lại trong bộ nhớ. Code cũng dài và khó đọc hơn.

`useCallback` chỉ có giá trị khi function đó đi vào một phép **so sánh tham chiếu**:

- Truyền xuống component đã bọc `React.memo`.
- Là dependency của `useEffect`, `useMemo` hay `useCallback` khác.
- Truyền vào một hook tuỳ biến có so sánh deps bên trong.

Ngoài ba trường hợp đó thì bỏ qua. Đây là ví dụ điển hình của tối ưu hoá sớm: trông có vẻ "cẩn thận" nhưng thực chất chỉ làm code nặng thêm.

</details>

**8. `React.memo` so sánh props bằng cách nào? Vì sao truyền một object literal làm props khiến `React.memo` gần như vô hiệu?**

<details className="qa">
<summary>Xem đáp án</summary>

`React.memo` so sánh **nông** (shallow): duyệt từng key của props và so bằng `Object.is`. Nó không nhìn vào bên trong object hay array.

Vì thế object literal viết thẳng trong JSX là tham chiếu **mới** ở mỗi lần render:

```jsx
// Mỗi render tạo object mới → memo luôn thất bại
<Child opts={{ ...config }} />

// Sửa — giữ ổn định tham chiếu
const opts = useMemo(() => ({ ...config }), [config]);
<Child opts={opts} />
```

Cùng nội dung nhưng khác tham chiếu, `Object.is` trả về `false`, memo cho rằng props đã đổi và render lại — công sức bọc memo thành vô nghĩa.

Các dạng props hay phá memo: object literal, array literal, arrow function inline, và giá trị JSX truyền qua prop.

Cách xử lý:

- Bọc `useMemo` cho object/array, `useCallback` cho function.
- Truyền **giá trị nguyên thuỷ** thay vì cả object khi được: `<Child id={user.id} name={user.name} />`.
- Truyền hàm so sánh tuỳ biến làm tham số thứ hai của `React.memo` — nhưng cẩn thận, so sánh sâu có thể đắt hơn cả việc render lại.

</details>

**9. Memoize có chi phí gì (bộ nhớ, thời gian so sánh deps)? Vì sao memoize mọi thứ là anti-pattern?**

<details className="qa">
<summary>Xem đáp án</summary>

Chi phí của mỗi lần memoize:

- **Bộ nhớ** — phải lưu giá trị cũ, mảng deps cũ, và giữ nguyên closure cũ cùng mọi biến nó tham chiếu. Với danh sách hàng nghìn dòng, chi phí này cộng dồn đáng kể.
- **Thời gian** — mỗi lần render vẫn phải tạo mảng deps và so sánh từng phần tử. Với phép tính rẻ, chi phí so sánh có thể còn lớn hơn chi phí tính lại.
- **Độ phức tạp** — thêm một mảng deps cần bảo trì, dễ viết thiếu và sinh stale closure, code khó đọc hơn.

Vì sao memoize mọi thứ là anti-pattern:

- Phần lớn tính toán trong component vốn đã rẻ; memoize chúng là lỗ vốn.
- Che giấu vấn đề thật — component chậm thường do render quá nhiều DOM hoặc cây con quá lớn, chứ không phải do tính toán.
- Một mắt xích hỏng là cả chuỗi hỏng: chỉ cần một prop không ổn định là toàn bộ memo phía dưới vô hiệu, nhưng chi phí vẫn phải trả.

Quy trình đúng: **đo trước bằng React DevTools Profiler**, tìm đúng component chậm, rồi mới tối ưu đúng chỗ đó.

</details>

**10. React Compiler ở React 19 thay đổi gì với `useMemo` và `useCallback`? Có nên gỡ hết memoize thủ công khi đã bật compiler không?**

<details className="qa">
<summary>Xem đáp án</summary>

**React Compiler** là một trình biên dịch chạy lúc build: nó phân tích component, hiểu giá trị nào phụ thuộc giá trị nào, rồi **tự chèn memoization** vào mã sinh ra. Mục tiêu là bạn viết code React thuần, không phải rải `useMemo`/`useCallback` khắp nơi mà vẫn có hiệu năng tốt — thậm chí tốt hơn, vì compiler memo hoá ở mức chi tiết hơn con người làm tay.

Điều kiện để compiler làm việc được: code phải tuân thủ **Rules of React** — component thuần, không mutate props/state, hook gọi đúng vị trí. Compiler sẽ bỏ qua (không tối ưu) những component nó thấy không an toàn.

Có nên gỡ hết memoize thủ công không? **Không nên gỡ ồ ạt.** Hướng hợp lý:

- **Code mới** — viết tự nhiên, không memo thủ công nữa.
- **Code cũ** — cứ để nguyên. `useMemo`/`useCallback` sẵn có không gây hại, chỉ là dư thừa.
- Gỡ dần **khi có lý do** (đang sửa file đó, code khó đọc), và **đo lại** sau khi gỡ.

Một số chỗ vẫn cần memo thủ công vì lý do ngữ nghĩa chứ không phải hiệu năng — ví dụ giá trị bắt buộc phải ổn định tham chiếu cho một thư viện bên ngoài.

</details>

**11. `useMemo` có đảm bảo giữ giá trị cache mãi mãi không? React được phép vứt bỏ cache trong trường hợp nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không.** Tài liệu React nói rõ `useMemo` là một **tối ưu hoá hiệu năng**, không phải một đảm bảo về mặt ngữ nghĩa. React có quyền quên giá trị đã ghi nhớ và tính lại.

Các trường hợp cache bị bỏ:

- Component **unmount** — toàn bộ state, ref và memo biến mất.
- React quyết định **giải phóng bộ nhớ** cho cây nằm ngoài màn hình (offscreen), một hướng đang phát triển cùng các tính năng concurrent.
- Component bị **remount** vì `key` đổi, hoặc vì StrictMode chạy đôi lúc phát triển.
- Cơ chế nội bộ của React thay đổi trong tương lai.

Hệ quả thực tiễn, và đây là điểm phỏng vấn hay hỏi: **không được đặt logic bắt buộc phải chạy đúng một lần vào trong `useMemo`**.

```jsx
// Sai — side effect trong useMemo, có thể chạy lại bất cứ lúc nào
const id = useMemo(() => registerOnServer(), []);

// Đúng — side effect thuộc về effect
useEffect(() => { registerOnServer(); }, []);
```

Hãy viết code sao cho nó vẫn chạy đúng khi mọi `useMemo` bị bỏ và tính lại — memo chỉ được phép làm nó **nhanh hơn**, không được làm nó **đúng hơn**.

</details>

**12. `useReducer` gồm những thành phần nào? Mô tả chữ ký của một reducer và giải thích vì sao reducer bắt buộc phải pure.**

<details className="qa">
<summary>Xem đáp án</summary>

Ba thành phần: **state hiện tại**, hàm **reducer**, và hàm **dispatch**.

```jsx
const [state, dispatch] = useReducer(reducer, initialState);
```

Chữ ký reducer: `(state, action) => newState` — nhận state cũ và một object action mô tả "việc gì vừa xảy ra", trả về state mới.

```jsx
function reducer(state, action) {
  switch (action.type) {
    case "INCREMENT":
      return { ...state, count: state.count + 1 };
    case "RESET":
      return initialState;
    default:
      throw new Error(`Unknown: ${action.type}`);
  }
}
```

Reducer bắt buộc phải **thuần** (pure): cùng đầu vào luôn cho cùng đầu ra, không mutate `state`, không gọi API, không đọc `Date.now()` hay `Math.random()`, không chạm vào DOM.

Lý do:

- React có thể **gọi reducer nhiều lần** cho cùng một action — trong StrictMode ở chế độ phát triển, hoặc khi phải tính lại trong concurrent rendering. Reducer không thuần sẽ sinh ra kết quả khác nhau hoặc side effect nhân đôi.
- Mutate state khiến React so sánh tham chiếu thấy không đổi và bỏ qua render.
- Reducer thuần thì **test được như một hàm thường** — đây chính là lợi ích lớn nhất của `useReducer`.

Side effect thuộc về event handler hoặc `useEffect`, không bao giờ nằm trong reducer.

</details>

**13. Nêu tiêu chí cụ thể để quyết định chuyển từ `useState` sang `useReducer`.**

<details className="qa">
<summary>Xem đáp án</summary>

Các dấu hiệu rõ ràng:

- **Nhiều field liên quan chặt chẽ** — đổi cái này bắt buộc phải đổi cái kia để dữ liệu còn hợp lệ. Ví dụ `loading`, `data`, `error` phải luôn nhất quán với nhau.
- **Một hành động kéo theo nhiều lệnh `setState`**, và cụm lệnh đó lặp lại ở nhiều chỗ. Reducer gom chúng thành một `dispatch` duy nhất.
- **State có dạng máy trạng thái** — `idle → loading → success | error`, mỗi chuyển trạng thái có quy tắc riêng.
- **Nhiều loại action** khác nhau tác động lên cùng một khối dữ liệu.
- **Logic cập nhật phức tạp**, muốn tách khỏi component để viết unit test riêng — reducer là hàm thuần nên test rất dễ.
- **Phải truyền hàm cập nhật xuống sâu** — `dispatch` có tham chiếu ổn định, tiện hơn nhiều callback rời rạc.

Ngược lại, hãy giữ `useState` khi các giá trị **độc lập với nhau** và logic cập nhật đơn giản. Một form ba ô nhập dùng reducer chỉ khiến code dài ra mà không đổi lại lợi ích gì.

Có thể dùng cả hai trong một component: reducer cho cụm state nghiệp vụ phức tạp, `useState` cho các cờ giao diện lặt vặt.

</details>

**14. Hàm `dispatch` do `useReducer` trả về có ổn định reference qua các render không? Điều đó có ý nghĩa gì khi đưa nó vào dependency array?**

<details className="qa">
<summary>Xem đáp án</summary>

**Có** — React đảm bảo `dispatch` giữ nguyên tham chiếu suốt đời component, giống như hàm `set` của `useState`.

Ý nghĩa thực tiễn:

- Đưa `dispatch` vào deps là **vô hại** — nó không bao giờ đổi nên effect không chạy lại vì nó. ESLint có thể yêu cầu khai báo, cứ khai báo cho đúng.

```jsx
useEffect(() => {
  dispatch({ type: "INIT" });
}, [dispatch]); // an toàn, chỉ chạy một lần
```

- **Không cần bọc `useCallback`** cho các hàm chỉ gọi `dispatch`.
- Truyền `dispatch` xuống component đã bọc `React.memo` thì memo vẫn hoạt động, khác hẳn với việc truyền callback tạo mới mỗi render.
- Kết hợp với Context rất tốt: tách thành hai context — một cho state (đổi thường xuyên), một cho `dispatch` (không bao giờ đổi). Component chỉ cần gửi action thì đọc context `dispatch` và sẽ không render lại khi state đổi.

Đây là một trong những lý do khiến `useReducer` hợp với state dùng chung ở phạm vi rộng hơn là `useState` kèm nhiều callback.

</details>

**15. `useContext` giải quyết vấn đề gì? Prop drilling là gì và vì sao nó gây khó bảo trì?**

<details className="qa">
<summary>Xem đáp án</summary>

**Prop drilling** là việc truyền một prop qua nhiều tầng component trung gian chỉ để đưa nó xuống tầng sâu nhất, trong khi các tầng ở giữa hoàn toàn không dùng tới nó.

```jsx
<App theme={theme}>
  <Layout theme={theme}>       {/* không dùng, chỉ chuyển tiếp */}
    <Sidebar theme={theme}>    {/* không dùng, chỉ chuyển tiếp */}
      <Button theme={theme} /> {/* nơi thực sự cần */}
```

Vì sao khó bảo trì:

- Thêm hay đổi một prop phải sửa toàn bộ các tầng trung gian.
- Các component trung gian bị "ô nhiễm" bởi dữ liệu không thuộc về chúng, khó tái sử dụng ở nơi khác.
- Chữ ký props phình to, đọc code khó biết prop nào thực sự được dùng.
- Refactor cấu trúc cây là phải sửa lại cả chuỗi truyền.

`useContext` cắt đứt chuỗi đó: Provider đặt giá trị ở một tầng trên, mọi component con ở bất kỳ độ sâu nào đọc thẳng bằng `useContext(ThemeContext)`.

Lưu ý: không phải cứ truyền props hai ba tầng là phải dùng Context. Nhiều trường hợp chỉ cần tái cấu trúc bằng `children` để component cha dựng sẵn nội dung, là hết prop drilling mà không cần thêm Context.

</details>

**16. Vì sao mọi consumer của một Context đều re-render khi value đổi, kể cả khi component đó chỉ đọc một field nhỏ? Nêu các cách giảm thiểu (tách nhiều context, memo value, selector).**

<details className="qa">
<summary>Xem đáp án</summary>

Vì Context **không có cơ chế selector**. React chỉ theo dõi ở mức "giá trị của Provider này có đổi không" bằng `Object.is`. Đổi thì mọi component đang gọi `useContext` với context đó đều bị đánh dấu render lại — React không biết component nào đọc field nào.

```jsx
<AppContext.Provider value={{ user, theme, settings, notifications }}>
// Chỉ đổi notifications → mọi consumer đều render lại
```

Các cách giảm thiểu:

- **Tách nhiều context nhỏ** theo mối quan tâm — `UserContext`, `ThemeContext`, `SettingsContext`. Đây là cách đơn giản và hiệu quả nhất.
- **Tách state và dispatch thành hai context**: phần `dispatch` không bao giờ đổi nên các component chỉ gửi action sẽ không render lại.
- **Bọc value bằng `useMemo`** để không tạo object mới ở mỗi lần render của Provider.
- **Dùng `children`** để phần cây không phụ thuộc context không bị kéo theo render.
- **Chuyển sang Zustand hoặc Jotai** khi state đổi thường xuyên — các thư viện này có selector tự nhiên, component chỉ render lại khi đúng phần dữ liệu nó chọn thay đổi.

Kết luận: Context hợp với dữ liệu **ít thay đổi** như theme, người dùng đăng nhập, ngôn ngữ, feature flag.

</details>

**17. Vì sao truyền `value={{ user, setUser }}` trực tiếp vào Provider là bug hiệu năng? Sửa như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì object literal đó được **tạo mới ở mỗi lần render của Provider**. React so sánh value bằng `Object.is`, thấy khác tham chiếu, và bắt **toàn bộ consumer render lại** — kể cả khi `user` và `setUser` không hề đổi.

```jsx
// Bug — object mới mỗi render, mọi consumer render theo
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
```

Tệ hơn nữa, component cha của Provider render vì bất kỳ lý do gì cũng kéo theo toàn bộ cây consumer render lại.

Sửa bằng `useMemo`:

```jsx
const value = useMemo(() => ({ user, setUser }), [user]);
return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
```

`setUser` do `useState` trả về đã ổn định sẵn nên không cần đưa vào deps (đưa vào cũng không sao).

Hai kỹ thuật bổ trợ:

- Nhận `children` làm prop để phần cây đó không bị render lại theo Provider.
- Nếu value có cả dữ liệu hay đổi lẫn hàm không đổi, tách hẳn thành hai context riêng.

</details>

**18. Context có phải là state manager không? So sánh với Redux hoặc Zustand và cho biết khi nào nên chọn cái nào.**

<details className="qa">
<summary>Xem đáp án</summary>

**Không.** Context là cơ chế **truyền dữ liệu xuống cây component**, không phải công cụ quản lý state. Bản thân nó không lưu state (state vẫn nằm ở `useState`/`useReducer` trong Provider), không có selector, không có middleware, không có devtools.

| | Context + `useReducer` | Redux Toolkit | Zustand |
|---|---|---|---|
| Selector | Không có | Có (`useSelector`) | Có |
| Devtools | Không | Đầy đủ, có time-travel | Có qua middleware |
| Boilerplate | Ít | Nhiều hơn | Rất ít |
| Kích thước thêm vào bundle | 0 | Lớn nhất | Nhỏ |
| Dùng ngoài React | Không | Được | Được |

Khi nào chọn gì:

- **Context** — dữ liệu ít đổi và phạm vi rõ ràng: theme, người dùng đăng nhập, ngôn ngữ, feature flag.
- **Zustand / Jotai** — state dùng chung đổi thường xuyên, muốn selector mà không muốn nhiều boilerplate. Lựa chọn mặc định hợp lý cho phần lớn dự án mới.
- **Redux Toolkit** — ứng dụng lớn, nhiều người, cần quy ước chặt, devtools mạnh, middleware phức tạp.
- **TanStack Query** — với dữ liệu lấy từ server. Đây là điểm hay bị bỏ qua: rất nhiều "state toàn cục" thực chất chỉ là cache của server, và dùng đúng công cụ sẽ xoá bớt phần lớn nhu cầu state manager.

</details>

**19. Kết hợp `useContext` với `useReducer` tạo thành pattern gì? Ưu và nhược điểm so với dùng thư viện state chuyên dụng?**

<details className="qa">
<summary>Xem đáp án</summary>

Kết hợp này tạo ra một **store toàn cục thu nhỏ theo phong cách Redux**, viết hoàn toàn bằng React thuần: `useReducer` giữ state và logic cập nhật, Context đưa state cùng `dispatch` xuống toàn bộ cây.

```jsx
const StateContext = createContext(null);
const DispatchContext = createContext(null);

function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}
```

**Ưu điểm:** không thêm dependency, không tăng kích thước bundle, dùng khái niệm React sẵn có nên ai đọc cũng hiểu, reducer là hàm thuần nên test dễ. Tách hai context giúp component chỉ gửi action không bị render lại khi state đổi.

**Nhược điểm:** không có selector nên mọi consumer của context state đều render lại khi bất kỳ field nào đổi; không có devtools hay time-travel; không có middleware sẵn cho tác vụ bất đồng bộ; state không truy cập được từ ngoài React.

Chọn pattern này khi state toàn cục **vừa phải và ít đổi**. Khi thấy phải tự viết selector hoặc tối ưu render liên miên, đó là lúc chuyển sang Zustand hoặc Redux Toolkit.

</details>

**20. Hook `use` của React 19 khác `useContext` ở điểm nào, và vì sao nó được phép gọi bên trong `if`?**

<details className="qa">
<summary>Xem đáp án</summary>

`use` là một API mới của React 19, đọc được **cả Context lẫn Promise**:

```jsx
import { use } from "react";

function Item({ id }) {
  if (id) {
    const ctx = use(MyContext); // hợp lệ bên trong if
    return <p>{ctx.value}</p>;
  }
  return null;
}

function Page() {
  const data = use(fetchPromise); // suspend cho tới khi resolve
  return <div>{data.title}</div>;
}
```

Khác biệt so với `useContext`:

- `useContext` chỉ đọc Context; `use` đọc được cả Promise, kết hợp với Suspense để làm data fetching.
- `useContext` phải gọi ở cấp cao nhất của component; `use` gọi được trong `if`, trong vòng lặp.

Vì sao được phép: Rules of Hooks tồn tại do các hook **có state** được React nhận diện theo **thứ tự gọi** — gọi có điều kiện sẽ làm lệch thứ tự và lẫn state giữa các hook. `use` thì khác: nó **không giữ state nội bộ theo vị trí**, chỉ đọc một giá trị đang có sẵn (giá trị của Provider gần nhất, hoặc kết quả của Promise). Không có ô state nào để lệch, nên ràng buộc thứ tự không cần thiết.

</details>

**21. `useSyncExternalStore` sinh ra để giải quyết vấn đề gì? Tearing trong concurrent rendering là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`useSyncExternalStore` là API chuẩn để **đăng ký vào một kho dữ liệu nằm ngoài React** — Redux, Zustand, `localStorage`, `window.matchMedia`, trạng thái online/offline của trình duyệt.

```jsx
const isOnline = useSyncExternalStore(
  (callback) => {
    window.addEventListener("online", callback);
    window.addEventListener("offline", callback);
    return () => {
      window.removeEventListener("online", callback);
      window.removeEventListener("offline", callback);
    };
  },
  () => navigator.onLine,        // đọc giá trị ở client
  () => true                     // giá trị dùng khi render trên server
);
```

**Tearing** (rách hình) là lỗi khi **các phần khác nhau của cùng một lần render hiển thị hai giá trị khác nhau** của cùng một nguồn dữ liệu. Với concurrent rendering, React có thể tạm dừng giữa chừng một lượt render để xử lý việc gấp hơn; nếu kho dữ liệu bên ngoài thay đổi đúng lúc đó, các component render trước thấy giá trị cũ, component render sau thấy giá trị mới — màn hình hiện dữ liệu không nhất quán.

`useSyncExternalStore` chặn điều này bằng cách buộc React đọc lại giá trị và, nếu phát hiện đã đổi, render lại đồng bộ để cả cây cùng thấy một giá trị. Trong ứng dụng thường bạn hiếm khi gọi trực tiếp — các thư viện state đã dùng nó bên dưới.

</details>

**22. Phân biệt `useTransition` và `useDeferredValue` — mỗi hook nhận đầu vào gì và phù hợp với tình huống nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Cả hai đều đánh dấu một phần cập nhật là **không khẩn cấp**, để React ưu tiên giữ giao diện phản hồi mượt. Khác nhau ở chỗ bạn nắm quyền điều khiển phần nào.

| | `useTransition` | `useDeferredValue` |
|---|---|---|
| Đầu vào | Không có; trả về `[isPending, startTransition]` | Một **giá trị**, trả về bản "trễ" của nó |
| Bạn đánh dấu | Đoạn code cập nhật state | Giá trị đã có sẵn |
| Dùng khi | Bạn sở hữu lệnh `setState` | Giá trị đến từ props, không sửa được nơi tạo |
| Cờ chờ | Có `isPending` sẵn | Tự so sánh giá trị gốc với giá trị trễ |

```jsx
// useTransition — bạn kiểm soát setState
const [isPending, startTransition] = useTransition();
const onChange = (e) => {
  setQuery(e.target.value);                  // gấp: ô nhập phải mượt
  startTransition(() => setResults(find(e.target.value))); // không gấp
};

// useDeferredValue — chỉ có giá trị trong tay
function Results({ query }) {
  const deferred = useDeferredValue(query);
  const list = useMemo(() => find(deferred), [deferred]);
}
```

Chọn: sửa được chỗ gọi `setState` thì dùng `useTransition`; chỉ nhận được giá trị qua props thì dùng `useDeferredValue`.

</details>

**23. `useImperativeHandle` dùng để làm gì và vì sao nên hạn chế dùng?**

<details className="qa">
<summary>Xem đáp án</summary>

`useImperativeHandle` cho phép component con **tự quyết định ref của nó phơi ra cái gì** cho component cha, thay vì phơi thẳng DOM node.

```jsx
function FancyInput({ ref }) {
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    clear: () => { inputRef.current.value = ""; },
  }), []);

  return <input ref={inputRef} />;
}

// Cha chỉ dùng được focus() và clear(), không chạm được vào DOM
```

Lợi ích: thu hẹp bề mặt API, cha không thể sửa style hay thuộc tính tuỳ tiện của DOM bên trong.

Vì sao nên hạn chế:

- Nó là **lập trình mệnh lệnh** trong một thư viện vốn khai báo. React thích "mô tả trạng thái mong muốn" hơn là "ra lệnh làm việc này".
- Tạo ràng buộc chặt giữa cha và con — con đổi cấu trúc là cha hỏng theo.
- Khó theo dõi luồng dữ liệu: trạng thái bị thay đổi từ bên ngoài, không đi qua props hay state.
- Phần lớn trường hợp **dùng prop là đủ**: thay vì gọi `ref.current.open()`, hãy truyền `isOpen`.

Chỉ dùng cho các hành động thực sự mang tính mệnh lệnh mà props diễn tả không tự nhiên: `focus()`, `scrollIntoView()`, `play()` của video, `reset()` của form.

</details>

**24. Cho một component render chậm khi gõ input: bạn sẽ chẩn đoán và tối ưu theo thứ tự nào (đo trước hay memo trước)?**

<details className="qa">
<summary>Xem đáp án</summary>

**Luôn đo trước.** Rải `useMemo` theo cảm tính thường không giải quyết được gì mà còn làm code khó đọc.

Thứ tự làm việc:

1. **Đo bằng React DevTools Profiler** — bật "Highlight updates", ghi lại một phiên gõ phím, xem component nào render và mỗi lần mất bao lâu. Câu hỏi cần trả lời: chậm vì **render quá nhiều component**, hay vì **một component tính toán nặng**?
2. **Kiểm tra đã bật bản production chưa** — bản development chậm hơn nhiều, dễ dẫn tới kết luận sai.
3. **Thu hẹp phạm vi render trước khi nghĩ tới memo** — đưa state của ô nhập xuống một component nhỏ chỉ chứa ô nhập, hoặc dùng `children` để phần cây không liên quan không render lại. Đây thường là cách hiệu quả nhất.
4. **Memo hoá đúng điểm nóng** — `useMemo` cho phép tính nặng đã đo được, `React.memo` kèm `useCallback` cho component con nặng.
5. **Giảm tần suất cập nhật** — `useDeferredValue` cho danh sách kết quả, hoặc debounce khi gọi API.
6. **Giảm số node phải render** — ảo hoá danh sách dài, phân trang.
7. **Đo lại** để xác nhận thay đổi có tác dụng thật; nếu không, hoàn tác.

Nếu dự án đã bật React Compiler thì bước 4 phần lớn là thừa — hãy tập trung vào bước 3 và 6.

</details>

---

## 3. Custom Hooks

Bài học: [3. Custom Hooks](../../react/06-hooks/3_custom-hooks.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Custom hook là gì? Vì sao tên bắt buộc phải bắt đầu bằng `use`, và chuyện gì xảy ra nếu đặt tên là `getSomething`?**

<details className="qa">
<summary>Xem đáp án</summary>

**Custom hook** là một function JavaScript bình thường, tên bắt đầu bằng `use`, bên trong có gọi các hook có sẵn của React (`useState`, `useEffect`, `useRef`...). Mục đích là gom **logic stateful** bị lặp lại vào một chỗ để tái sử dụng, mà **không thêm tầng component bọc** như HOC hay render props.

Tiền tố `use` là **quy ước** để công cụ nhận diện: plugin `eslint-plugin-react-hooks` dựa vào tên để biết đây là hook và áp **Rules of Hooks** cho nó (không gọi trong điều kiện/vòng lặp, chỉ gọi từ component hoặc hook khác).

Nếu đặt tên `getSomething` mà bên trong vẫn gọi `useState`:

```jsx
function getUser() {
  const [user, setUser] = useState(null); // ESLint không kiểm tra
  return user;
}
```

React **vẫn chạy** (React không đọc tên hàm), nhưng ESLint mất khả năng cảnh báo — bạn có thể vô tình gọi `getUser()` trong `if` và làm lệch thứ tự hook, gây bug rất khó truy.

</details>

**2. Custom hook khác util function thuần ở điểm nào? Khi nào chỉ cần hàm thường là đủ?**

<details className="qa">
<summary>Xem đáp án</summary>

Bài đã phân ba loại rõ ràng:

| | Util function | Custom hook |
|---|---|---|
| Có gọi hook React bên trong? | Không | Có (`useState`, `useEffect`...) |
| Có state / side effect? | Không, pure | Có |
| Ràng buộc Rules of Hooks | Không | Có |
| Gọi ở đâu cũng được? | Được (cả ngoài React) | Chỉ trong component hoặc hook khác |
| Test | Gọi trực tiếp | Cần `renderHook` |

**Chỉ cần hàm thường khi** logic là *pure* — vào cái gì ra cái đó, không giữ trạng thái, không đụng tới vòng đời component: format ngày, validate email, sort mảng, tính tổng giỏ hàng.

```js
// Util — không cần là hook
export function formatPrice(v) {
  return v.toLocaleString("vi-VN") + "đ";
}
```

Biến nó thành hook chỉ làm nó khó dùng lại hơn (không gọi được ngoài component). Nguyên tắc: **pure → util, stateful → hook, có UI → component**.

</details>

**3. Hai component cùng gọi `useCounter()` có dùng chung state không? Giải thích cơ chế isolation của state trong custom hook.**

<details className="qa">
<summary>Xem đáp án</summary>

**Không.** Mỗi component gọi hook là một **instance độc lập**:

```jsx
function useCounter() {
  const [count, setCount] = useState(0);
  return { count, setCount };
}

function A() { const { count } = useCounter(); } // count riêng của A
function B() { const { count } = useCounter(); } // count riêng của B
```

Lý do: custom hook chỉ là **code được nội suy vào** component gọi nó. State thực ra không nằm trong hook, mà nằm trong **fiber node của component** — React lưu một danh sách hook cho mỗi instance component và duyệt theo thứ tự gọi. Gọi `useCounter()` trong `A` nghĩa là `useState(0)` bên trong đăng ký một ô nhớ trên fiber của `A`; gọi trong `B` thì đăng ký ô nhớ trên fiber của `B`.

Vậy custom hook chia sẻ **logic**, không chia sẻ **state**. Ngay cả khi cùng một component gọi `useCounter()` hai lần cũng ra hai state tách biệt.

</details>

**4. Muốn chia sẻ THẬT sự cùng một state giữa nhiều component thì làm thế nào? Custom hook một mình có đủ không?**

<details className="qa">
<summary>Xem đáp án</summary>

Custom hook **một mình không đủ** — nó chỉ tái sử dụng logic, mỗi nơi gọi vẫn có state riêng. Muốn nhiều component nhìn thấy **cùng một giá trị**, state phải nằm ở một chỗ duy nhất bên ngoài các component đó:

- **Lift state up** — đưa state lên component cha chung, truyền xuống qua props. Đơn giản nhất, hợp khi cây component nông.
- **Context** — đặt state trong một Provider, các con đọc bằng `useContext`. Thường bọc lại thành custom hook cho gọn:

```jsx
const CounterContext = createContext();

function CounterProvider({ children }) {
  const [count, setCount] = useState(0);
  return (
    <CounterContext.Provider value={{ count, setCount }}>
      {children}
    </CounterContext.Provider>
  );
}

function useCounter() { return useContext(CounterContext); }
```

- **State library** (Zustand, Redux, Jotai) — store nằm ngoài React, component subscribe vào; không cần Provider bọc, và chọn lọc được phần state cần đọc nên ít re-render thừa.

Mẫu phổ biến: store/Context ở dưới, custom hook làm lớp API sạch ở trên.

</details>

**5. Custom hook nên trả về array hay object? Tiêu chí chọn là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Tiêu chí chính là **số lượng giá trị trả về và nhu cầu đặt lại tên**.

**Tuple (array)** — dùng khi có **≤ 2 giá trị cố định**, và người dùng thường muốn tự đặt tên. Giống `useState`:

```jsx
function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue(v => !v), []);
  return [value, toggle, setValue];
}

const [isOpen, toggleOpen] = useToggle();
const [isDark, toggleDark] = useToggle(); // đổi tên thoải mái
```

**Object** — dùng khi có **nhiều hơn 2 giá trị**, hoặc một số giá trị là tùy chọn:

```jsx
function useFetch(url) {
  return { data, error, loading, refetch };
}
const { data, loading } = useFetch("/api/users"); // lấy đúng cái cần
```

Ưu điểm object: không phụ thuộc thứ tự, bỏ qua được field không dùng, thêm field mới không phá code cũ. Nhược: tên cố định, muốn đổi phải `const { data: users } = ...`.

</details>

**6. So sánh custom hook với HOC và render props — hooks giải quyết được vấn đề gì mà hai pattern kia gặp phải?**

<details className="qa">
<summary>Xem đáp án</summary>

Cả ba đều để **tái sử dụng logic stateful**, nhưng hai pattern cũ phải mượn *component* làm phương tiện:

| | HOC | Render props | Custom hook |
|---|---|---|---|
| Cách dùng | `withAuth(Component)` | `<Fetch render={...} />` | `const x = useAuth()` |
| Thêm tầng component? | Có | Có | Không |
| Lồng nhiều logic | Bọc chồng nhau | JSX lồng sâu | Gọi nhiều dòng liên tiếp |
| Nguồn gốc props/giá trị | Khó lần ra | Rõ hơn | Rõ ràng, tường minh |
| Xung đột tên | Props dễ đè nhau | Ít | Tự đặt tên khi destructure |

Vấn đề kinh điển của HOC là **"wrapper hell"** — React DevTools đầy `withRouter(withTheme(withAuth(Page)))`, và props từ đâu ra thì không rõ; render props thì gây **"pyramid of doom"** JSX lồng nhiều tầng.

Hook gộp ba logic chỉ là ba dòng phẳng:

```jsx
const user = useAuth();
const theme = useTheme();
const { data } = useFetch("/api/x");
```

Không thêm node nào vào cây, dễ đọc, dễ compose.

</details>

**7. Thiết kế `useDebounce(value, delay)`: cần state gì, effect gì, cleanup gì? Nếu thiếu cleanup thì bug ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Cần một state giữ **giá trị đã trì hoãn**, một effect đặt `setTimeout`, và cleanup `clearTimeout`:

```jsx
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer); // huỷ timer cũ
  }, [value, delay]);

  return debounced;
}
```

Cơ chế: mỗi khi `value` đổi, React chạy cleanup của lần trước (huỷ timer đang chờ) rồi mới đặt timer mới. Chỉ khi người dùng **ngừng gõ** đủ `delay` ms thì timer mới sống sót và `setDebounced` chạy.

**Thiếu cleanup:** gõ "hello" 5 ký tự sẽ tạo 5 timer, không cái nào bị huỷ → sau `delay` ms cả 5 lần lượt bắn ra, `debounced` nhảy qua "h", "he", "hel"... Tức là **debounce mất tác dụng hoàn toàn**, vẫn gọi API 5 lần. Thêm nữa, timer còn treo sau khi component unmount sẽ set state lên component đã chết.

</details>

**8. Thiết kế `usePrevious(value)`: vì sao phải dùng `useRef` chứ không phải `useState`, và cập nhật ref ở chỗ nào?**

<details className="qa">
<summary>Xem đáp án</summary>

```jsx
function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value; // cập nhật SAU khi render xong
  }, [value]);

  return ref.current; // giá trị của lần render trước
}
```

**Vì sao `useRef` chứ không `useState`:** gán `ref.current` **không trigger re-render**. Nếu dùng `useState` thì mỗi lần lưu giá trị cũ lại kích hoạt một render mới, render đó lại lưu tiếp → **vòng lặp vô tận** (hoặc ít nhất là render thừa gấp đôi). Ref chính là "ô nhớ bền qua các lần render mà không tham gia vào render".

**Cập nhật ở đâu:** phải đặt trong `useEffect`, tức **sau khi render đã commit**. Trong lượt render hiện tại, `ref.current` vẫn giữ giá trị từ lượt trước — đó chính là thứ ta cần trả về. Nếu gán thẳng trong thân component (`ref.current = value` rồi `return ref.current`) thì luôn nhận lại giá trị hiện tại, hook mất ý nghĩa.

</details>

**9. Thiết kế `useLocalStorage(key, initial)`: cần xử lý những edge case nào (JSON parse lỗi, SSR không có `window`, đồng bộ giữa nhiều tab)?**

<details className="qa">
<summary>Xem đáp án</summary>

Các edge case chính:

- **JSON hỏng / giá trị rác** — `JSON.parse` ném lỗi, phải bọc `try/catch` và fallback về `initial`.
- **SSR** — trên server không có `window`, đọc thẳng sẽ crash. Phải kiểm tra `typeof window === "undefined"` và trả `initial`; lưu ý điều này có thể gây hydration mismatch, nên nhiều hook chỉ đọc localStorage trong `useEffect` sau khi mount.
- **Lazy initializer** — truyền hàm vào `useState(() => ...)` để chỉ đọc localStorage một lần, không đọc lại mỗi render.
- **Quota / chế độ riêng tư** — `setItem` có thể ném `QuotaExceededError`, cần `try/catch`.
- **Nhiều tab** — localStorage dùng chung giữa các tab nhưng React không tự biết. Lắng nghe sự kiện `storage` để đồng bộ.

```jsx
useEffect(() => {
  const onStorage = (e) => {
    if (e.key === key) setValue(JSON.parse(e.newValue));
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}, [key]);
```

Lưu ý sự kiện `storage` chỉ bắn ở **tab khác**, không bắn ở tab vừa ghi.

</details>

**10. Thiết kế `useFetch(url)`: làm sao tránh race condition và tránh set state sau khi component đã unmount?**

<details className="qa">
<summary>Xem đáp án</summary>

**Race condition** xảy ra khi `url` đổi nhanh: request cũ trả về *sau* request mới, ghi đè dữ liệu đúng bằng dữ liệu cũ. Hai cách xử lý, đều đặt trong cleanup của effect:

```jsx
useEffect(() => {
  const ctrl = new AbortController();
  setLoading(true);
  setError(null);

  fetch(url, { signal: ctrl.signal })
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then(setData)
    .catch(err => { if (err.name !== "AbortError") setError(err); })
    .finally(() => setLoading(false));

  return () => ctrl.abort(); // huỷ request cũ khi url đổi / unmount
}, [url]);
```

- **`AbortController`** — huỷ hẳn request cũ; nhớ bỏ qua `AbortError` để không hiện lỗi giả.
- **Cờ `ignore`** — biến cục bộ `let ignore = false`, cleanup đặt `ignore = true`, callback chỉ set state khi `!ignore`. Cách này chính React docs khuyến nghị và cũng chặn luôn việc set state sau unmount.

Production nên dùng TanStack Query — đã lo sẵn cache, dedupe, retry.

</details>

**11. Custom hook có được gọi có điều kiện không? Rules of Hooks áp dụng cho custom hook như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không.** Custom hook phải tuân thủ Rules of Hooks **y hệt hook built-in**, vì bên trong nó cũng gọi `useState`/`useEffect`:

- Chỉ gọi ở **top level** — không trong `if`, vòng lặp, hàm lồng, sau câu lệnh `return` sớm.
- Chỉ gọi từ **function component** hoặc **custom hook khác**, không gọi trong hàm thường hay event handler.

```jsx
// Sai — số hook thay đổi giữa các render
if (isLoggedIn) {
  const user = useUser(); // 💥
}

// Đúng — luôn gọi, xử lý điều kiện bên trong hook
const user = useUser(isLoggedIn);
```

Lý do: React nhận diện hook theo **thứ tự gọi** trên mỗi lần render, không theo tên. Gọi có điều kiện làm thứ tự lệch, state của hook này bị gán nhầm sang hook khác.

Đây cũng chính là lý do tên phải bắt đầu bằng `use` — ESLint dựa vào tên để biết `useUser()` là hook và bắt lỗi khi nó nằm trong `if`.

</details>

**12. Làm sao viết test cho một custom hook? Vai trò của `renderHook` và `act` trong React Testing Library.**

<details className="qa">
<summary>Xem đáp án</summary>

Hook không gọi trực tiếp được ngoài component, nên cần `renderHook` — nó dựng một component rỗng chỉ để chạy hook và trả về `result` chứa giá trị hook trả ra.

```jsx
import { renderHook, act } from "@testing-library/react";

test("useCounter tăng được", () => {
  const { result } = renderHook(() => useCounter(10));
  expect(result.current.count).toBe(10);

  act(() => { result.current.increment(); });
  expect(result.current.count).toBe(11);
});
```

- **`renderHook`** — mount hook, trả về `result.current` (giá trị mới nhất), `rerender` (render lại với props khác, để test khi dependency đổi) và `unmount` (test cleanup).
- **`act`** — bọc mọi thao tác gây cập nhật state, đảm bảo React xử lý xong update và chạy effect trước khi assert. Không bọc `act` thì `result.current` có thể còn là giá trị cũ, và React sẽ cảnh báo.

Với hook gọi API, `fetch` nên được mock; với hook cần Context, truyền `wrapper` là Provider.

</details>

**13. Đoán hành vi: một custom hook nhận object `options` được tạo mới ở mỗi render và dùng nó làm dependency của effect bên trong — chuyện gì xảy ra và sửa thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Effect chạy lại **sau mỗi lần render** — và nếu effect có set state thì thành **vòng lặp vô tận**. Nguyên nhân: dependency được so sánh bằng `Object.is` (so sánh tham chiếu). Object literal tạo mới mỗi render luôn khác tham chiếu cũ, dù nội dung y hệt.

```jsx
function Search() {
  // object mới mỗi render → dep luôn "đổi"
  const data = useFetchWithOptions("/api", { retry: 3 });
}

function useFetchWithOptions(url, options) {
  useEffect(() => { fetch(url, options); }, [url, options]); // 💥 chạy mãi
}
```

Cách sửa:

- **Memo hoá ở phía người gọi**: ``const options = useMemo(() => ({ retry: 3 }), [])``.
- **Đưa hằng số ra ngoài component** nếu nó không phụ thuộc props/state.
- **Tách dep thành primitive** trong hook: `[url, options.retry, options.timeout]` — số/chuỗi so sánh theo giá trị nên ổn định.
- **Giữ trong ref** khi options chỉ cần đọc lúc effect chạy, không cần trigger lại.

Cách bền nhất là thiết kế API hook nhận primitive thay vì object.

</details>

**14. Dấu hiệu nào cho thấy một custom hook đã quá to và cần tách nhỏ? Nguyên tắc chia là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Dấu hiệu nhận biết:

- Tên hook mơ hồ, phải dùng "và" để mô tả (`useUserAndThemeAndForm`).
- Trả về quá nhiều giá trị không liên quan tới nhau.
- Chứa nhiều `useEffect` với các mảng dependency hoàn toàn khác nhau, mỗi effect lo một chuyện.
- Nhận cờ điều kiện (`useData(type)` rồi bên trong `if` rẽ nhánh xử lý khác hẳn).
- Component chỉ dùng 2 trong 8 thứ hook trả về.
- Test phải mock rất nhiều thứ mới chạy được.

**Nguyên tắc chia:** mỗi hook **một trách nhiệm rõ ràng** — đúng như bài đã nêu:

```jsx
// Tệ
function useEverything() { /* fetch + form + theme + auth */ }

// Tốt
function useUser() { /* auth */ }
function useTheme() { /* theme */ }
function useForm() { /* form */ }
```

Chia theo **mối quan tâm (concern)**, không chia theo số dòng. Sau khi tách, có thể compose lại: một hook cấp cao gọi nhiều hook nhỏ — vẫn gọn cho người dùng mà từng mảnh vẫn test được độc lập.

</details>

**15. Khi nào nên tự viết custom hook, khi nào nên dùng thư viện sẵn có như usehooks-ts, react-use hay TanStack Query?**

<details className="qa">
<summary>Xem đáp án</summary>

**Dùng thư viện khi** bài toán là **phổ biến và đã được giải kỹ**:

- `useDebounce`, `useLocalStorage`, `useMediaQuery`, `useOnClickOutside`... → usehooks-ts, `@uidotdev/usehooks`, react-use, ahooks. Chúng đã xử lý sẵn SSR, cleanup, edge case mà hook tự viết hay bỏ sót.
- **Data fetching** → TanStack Query (hoặc SWR). `useFetch` tự viết chỉ đủ dùng cho ví dụ; production cần cache, dedupe request trùng, retry, refetch on focus, pagination, optimistic update, invalidation — viết lại đủ những thứ này là viết lại cả một thư viện.

**Tự viết khi:**

- Logic gắn với **nghiệp vụ riêng** của dự án (`useCart`, `usePermission`, `useCheckoutFlow`) — không thư viện nào có.
- Cần hành vi **tuỳ biến** mà thư viện không hỗ trợ.
- Hook cực ngắn (`useToggle` vài dòng) mà không muốn thêm dependency.

Cân nhắc thêm: kích thước bundle, mức độ bảo trì của thư viện, và khả năng tree-shaking.

</details>

---

## 4. Rules of Hooks

Bài học: [4. Rules of Hooks](../../react/06-hooks/4_rules-of-hooks.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Hai quy tắc của Rules of Hooks là gì? Phát biểu chính xác từng quy tắc.**

<details className="qa">
<summary>Xem đáp án</summary>

**Quy tắc 1 — Chỉ gọi hook ở top level.** Không gọi hook bên trong `if`, `for`, `while`, `switch`, hàm lồng nhau, hay sau một câu lệnh `return` sớm. Mọi lần render phải gọi **cùng số lượng hook, theo cùng thứ tự**.

**Quy tắc 2 — Chỉ gọi hook từ code React.** Cụ thể là từ **function component** (tên PascalCase) hoặc từ **custom hook** (tên bắt đầu bằng `use`). Không gọi từ function JS thường, event handler, class component, hay callback truyền cho thư viện ngoài.

```jsx
// Sai
function Component({ cond }) {
  if (cond) { const [a] = useState(1); }
  const [b] = useState(2);
}

// Đúng — hook luôn ở top, điều kiện xử lý bên trong
function Component({ cond }) {
  const [a] = useState(1);
  const [b] = useState(2);
  if (cond) { /* logic ở đây */ }
}
```

Cả hai đều phục vụ một mục đích: giữ **thứ tự gọi hook ổn định** qua mọi lần render.

</details>

**2. React lưu state của hook theo tên biến hay theo thứ tự gọi? Bên trong React dùng cấu trúc dữ liệu nào để lưu?**

<details className="qa">
<summary>Xem đáp án</summary>

Theo **thứ tự gọi (index)**, hoàn toàn không theo tên biến. React không hề biết bạn đặt tên là `count` hay `x` — nó chỉ đếm: lần gọi hook thứ nhất, thứ hai, thứ ba...

Bên trong, mỗi component instance có một **fiber node**, và fiber giữ một **linked list các hook** (trường `memoizedState`). Mỗi node trong danh sách lưu state/deps của một hook, trỏ tới node kế tiếp bằng `next`.

```jsx
function Component() {
  const a = useState(1);  // node 1
  const b = useState(2);  // node 1 → node 2
  useEffect(() => {}, []); // node 2 → node 3
}
```

- **Lần mount**: React *tạo* node mới cho mỗi lần gọi hook và nối vào danh sách.
- **Các lần render sau**: React *duyệt lại* danh sách theo đúng thứ tự, lấy node thứ N cho lần gọi hook thứ N.

Vì cơ chế là "đếm theo thứ tự" nên chỉ cần một lần render gọi thiếu/thừa hook là toàn bộ danh sách lệch.

</details>

**3. Đoán bug: gọi `useState` bên trong `if (cond)` rồi mới gọi một `useState` khác ở ngoài — chuyện gì xảy ra khi `cond` đổi từ đúng sang sai giữa hai lần render?**

<details className="qa">
<summary>Xem đáp án</summary>

```jsx
function Component({ cond }) {
  if (cond) {
    const [a, setA] = useState("A"); // slot 1 (đôi khi)
  }
  const [b, setB] = useState("B");   // slot 2 (luôn)
}
```

- **Render 1 (`cond = true`)**: gọi 2 hook → slot 1 giữ `"A"`, slot 2 giữ `"B"`.
- **Render 2 (`cond = false`)**: chỉ gọi 1 hook. React khớp theo **thứ tự**, nên lần gọi `useState("B")` này nhận **slot 1** — tức nhận lại giá trị `"A"`. Biến `b` đột nhiên bằng `"A"`, và `setB` giờ ghi vào ô nhớ của `a`.

Ngoài ra React thấy số hook giảm từ 2 xuống 1 nên thường ném luôn lỗi **`Rendered fewer hooks than expected. This may be caused by an accidental early return statement.`**

Nguy hiểm nhất là trường hợp *không* crash — ví dụ đổi từ `useState` sang `useState` cùng kiểu — lúc đó state chỉ đơn giản bị trộn lẫn, tạo ra bug ngẫu nhiên rất khó truy nguồn.

</details>

**4. Vì sao gọi hook sau một early return cũng vi phạm quy tắc, dù nhìn thì vẫn ở top level?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì "top level" không phải chuyện **thụt lề**, mà là chuyện **hook có luôn được chạy hay không**. Early return biến đoạn code phía sau thành *có điều kiện*:

```jsx
function Page({ id }) {
  if (!id) return null;                    // render này dừng ở đây
  const [data, setData] = useState(null);  // SAI — bị skip khi !id
}
```

Khi `id` rỗng, React chạy 0 hook; khi có `id`, chạy 1 hook. Thứ tự và số lượng hook đổi giữa các render → đúng vi phạm Quy tắc 1, thường kèm lỗi `Rendered fewer hooks than expected`.

Hai cách sửa:

```jsx
// Cách 1 — đưa hook lên trước early return
function Page({ id }) {
  const [data, setData] = useState(null);
  if (!id) return null;
  return <div>{data?.title}</div>;
}

// Cách 2 — tách component con
function Page({ id }) {
  if (!id) return null;
  return <PageContent id={id} />;
}
```

Cách 2 hợp lệ vì `PageContent` là một component riêng — khi nó render thì luôn chạy đủ hook của nó.

</details>

**5. Gọi hook trong vòng lặp `for` sai ở chỗ nào? Nếu số lần lặp luôn cố định thì có an toàn không, và vì sao vẫn không nên làm?**

<details className="qa">
<summary>Xem đáp án</summary>

Sai vì **số lần lặp thường phụ thuộc dữ liệu**, mà dữ liệu thì đổi:

```jsx
function List({ items }) {
  for (let i = 0; i < items.length; i++) {
    const [open, setOpen] = useState(false); // SAI
  }
}
```

Mảng 3 phần tử → 3 hook; mảng 5 phần tử → 5 hook. Thứ tự hook lệch ngay khi danh sách thay đổi.

**Nếu số lần lặp cố định** (ví dụ luôn `i < 3`) thì về mặt kỹ thuật React vẫn chạy đúng, vì số lượng và thứ tự hook không đổi. Nhưng vẫn không nên:

- ESLint `rules-of-hooks` báo lỗi (nó phân tích cú pháp, không chứng minh được hằng số) — bạn sẽ phải disable rule.
- Rất mong manh: một ngày ai đó đổi `3` thành `items.length` là vỡ, mà lỗi lại xuất hiện ở chỗ khác.
- Khó đọc, khó suy luận về state.

Cách đúng: **tách mỗi phần tử thành một component con**, mỗi component tự giữ state của mình.

</details>

**6. Muốn chạy một effect có điều kiện thì đặt điều kiện ở đâu cho đúng?**

<details className="qa">
<summary>Xem đáp án</summary>

Đặt điều kiện **bên trong** hook, không bao quanh hook — hook luôn được gọi, chỉ phần việc bên trong mới có điều kiện:

```jsx
// Sai — bọc quanh hook
if (user) {
  useEffect(() => { fetchData(user.id); }, [user]);
}

// Đúng — hook luôn gọi, if nằm trong body
useEffect(() => {
  if (!user) return;
  fetchData(user.id);
}, [user]);
```

Nguyên tắc: `useEffect` vẫn "chạy" mỗi khi dependency đổi, nhưng thân effect tự quyết định có làm gì không. Dùng `return` sớm ngay đầu effect là cách viết gọn và phổ biến nhất.

Tương tự với `useMemo` / `useCallback`: luôn gọi hook, điều kiện nằm trong hàm tính toán. Với `useEffect`, dependency array chỉ kiểm soát **khi nào chạy lại**, không kiểm soát **có chạy hay không** — việc đó thuộc về logic bên trong.

</details>

**7. Vì sao không được gọi hook trong event handler, hay trong callback của `map`?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì cả hai đều **không chạy trong pha render** theo thứ tự cố định.

**Event handler** chạy *sau khi* render xong, khi người dùng click. Lúc đó React không còn ở trong ngữ cảnh render của component nào, không có fiber "đang xử lý" để gắn hook vào — gọi hook sẽ ném lỗi `Invalid hook call`. Thêm nữa, handler chạy bao nhiêu lần là do người dùng quyết định, không thể ổn định thứ tự.

```jsx
<button onClick={() => {
  const [x, setX] = useState(0); // SAI
}}>
```

**Callback của `map`** thì chạy trong render, nhưng số lần chạy bằng độ dài mảng — y hệt vấn đề của vòng lặp `for`: mảng dài ngắn khác nhau → số hook khác nhau. Ngoài ra nó là **hàm lồng nhau**, ESLint chặn thẳng.

Cách đúng: với `map`, tách phần tử thành component con có state riêng; với event handler, gọi hook ở top level rồi dùng hàm setter (`setX`) bên trong handler.

</details>

**8. Liệt kê đầy đủ những nơi được phép gọi hook.**

<details className="qa">
<summary>Xem đáp án</summary>

Chỉ có **hai** nơi:

1. **Thân của một React function component** — hàm trả về JSX, tên viết PascalCase (`MyComponent`), gọi ở top level trước mọi early return.
2. **Thân của một custom hook** — hàm tên bắt đầu bằng `use` (`useCounter`, `useFetch`), cũng ở top level.

```jsx
function MyComponent() { useState(0); } // OK — component
function useMyHook()   { useState(0); } // OK — custom hook
```

Những nơi **không** được phép:

- Function JS thường (`fetchData`, `handleClick`, helper util).
- Class component — hook chỉ dành cho function component.
- Event handler, callback của `setTimeout`, `then`, `map`, `forEach`.
- Bên trong `useMemo`, `useCallback`, thân `useEffect` — đây là hàm lồng nhau.
- Code ở module scope, ngoài mọi component.
- Sau một `return` sớm, trong `if` / `for` / `try-catch`.

ESLint phân biệt component và hook bằng **chữ cái đầu**: PascalCase → component, `use` + camelCase → hook, còn lại → function thường.

</details>

**9. Class component có dùng được hook không? Vì sao? Muốn tái sử dụng logic hook trong class thì làm thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không.** Hook được thiết kế riêng cho function component:

- React xác định hook thuộc về component nào bằng **fiber đang render**, và cơ chế "dispatcher" này chỉ được kích hoạt khi React gọi một function component. Trong `render()` của class, dispatcher là `null` → ném `Invalid hook call`.
- Về mặt khái niệm, class đã có sẵn cơ chế riêng: `this.state`, `setState`, các lifecycle method. Hook chính là bản thay thế cho những thứ đó, không phải bổ sung.

**Tái sử dụng logic hook trong class** — bọc hook lại bằng một function component rồi cho class dùng:

```jsx
// Bọc bằng HOC
function withUser(Wrapped) {
  return function (props) {
    const user = useUser();          // hook chạy trong function component
    return <Wrapped {...props} user={user} />;
  };
}

class Profile extends React.Component {
  render() { return <p>{this.props.user.name}</p>; }
}
export default withUser(Profile);
```

Cách khác: dùng **render props** — một function component gọi hook rồi truyền kết quả xuống qua children. Về lâu dài, giải pháp tốt nhất vẫn là chuyển class sang function component.

</details>

**10. `eslint-plugin-react-hooks` có những rule nào, mỗi rule bắt lỗi gì? Vì sao nên đặt mức error và chạy trong CI?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai rule chính:

- **`react-hooks/rules-of-hooks`** — bắt vi phạm hai quy tắc: hook trong `if`/`for`/hàm lồng nhau/sau early return, và hook gọi từ nơi không phải component hay custom hook.
- **`react-hooks/exhaustive-deps`** — bắt **thiếu hoặc thừa dependency** trong `useEffect`, `useCallback`, `useMemo`, `useLayoutEffect`.

```js
rules: {
  "react-hooks/rules-of-hooks": "error",
  "react-hooks/exhaustive-deps": "warn",
}
```

`rules-of-hooks` để **error** vì vi phạm gần như luôn là bug thật, không có ngoại lệ hợp lệ. `exhaustive-deps` thường để **warn** vì đôi khi có lý do chính đáng để bỏ dep, nhưng phải kèm comment giải thích.

**Chạy trong CI** với `--max-warnings 0` để warning không tích luỹ rồi bị phớt lờ. Loại bug do hook gây ra (state nhầm lẫn, stale closure, effect không chạy lại) rất khó tái hiện và thường chỉ lộ trên production — chặn ngay ở PR là rẻ nhất.

</details>

**11. Vì sao hook `use` của React 19 được phép gọi trong `if` hoặc vòng lặp mà không phá vỡ thứ tự hook?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì `use` **không chiếm một ô nhớ (slot) trong danh sách hook**. Hai lý do như bài đã nêu:

- Nó **không có state riêng** — chỉ *đọc* giá trị từ một Promise hoặc Context, không lưu gì giữa các lần render.
- React theo dõi nó qua **Suspense boundary** (khi Promise chưa resolve thì component suspend rồi render lại), chứ không qua call order.

```jsx
import { use } from "react";

function Item({ promise, cond }) {
  if (cond) {
    const data = use(promise); // hợp lệ trong if
    return <div>{data.title}</div>;
  }
  return null;
}
```

Vì không tham gia vào linked list hook, gọi `use` nhiều lần hay bỏ qua hoàn toàn đều không làm lệch index của các hook khác.

Đây là **ngoại lệ duy nhất**. Mọi hook còn lại (`useState`, `useEffect`, `useRef`, `useMemo`...) vẫn phải tuân thủ Rules of Hooks đầy đủ.

</details>

**12. Nếu component đặt tên viết thường như `myComponent` thì ESLint có kiểm tra Rules of Hooks cho nó không? Quy ước đặt tên ảnh hưởng thế nào tới linter?**

<details className="qa">
<summary>Xem đáp án</summary>

**Không** — tệ hơn, ESLint sẽ coi đó là **function thường** và báo lỗi ngay khi bạn gọi hook trong đó ("React Hook is called in function `myComponent` that is neither a React function component nor a custom React Hook function").

Linter không chạy code, không biết hàm nào trả về JSX một cách chắc chắn. Nó dựa hoàn toàn vào **chữ cái đầu của tên hàm**:

| Tên hàm | Linter hiểu là | Gọi hook được? |
|---|---|---|
| `MyComponent` (PascalCase) | Function component | Có, và được kiểm tra Rules of Hooks |
| `useMyHook` (`use` + camelCase) | Custom hook | Có, và được kiểm tra |
| `myComponent`, `fetchData` | Function thường | Không — báo lỗi |

Hệ quả thực tế: đặt tên sai quy ước là **mất lưới an toàn**. Custom hook tên `getUser()` chứa `useState` vẫn chạy được (React không đọc tên), nhưng ESLint không kiểm tra nữa — bạn có thể vô tình gọi nó trong `if` mà không ai cảnh báo. Vì vậy quy ước đặt tên trong React không chỉ là thẩm mỹ, nó là **hợp đồng với tooling**.

</details>

**13. Gặp lỗi runtime `Rendered fewer hooks than expected` thì nguyên nhân thường là gì và debug theo hướng nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Lỗi này nghĩa là: lần render trước component gọi N hook, lần này chỉ gọi ít hơn N. Nguyên nhân phổ biến nhất chính là thông điệp React gợi ý — **early return nằm trước một hook**:

```jsx
function Page({ id }) {
  if (!id) return null;      // render sau chỉ chạy tới đây
  const [data] = useState(); // hook bị bỏ qua → lỗi
}
```

Các nguyên nhân khác: hook nằm trong `if`, trong `try/catch` có thể ném lỗi giữa chừng, trong vòng lặp có số vòng thay đổi, hoặc một `throw` xảy ra giữa chừng thân component.

Hướng debug:

1. Đọc stack trace để biết **component nào** đang render lỗi.
2. Quét toàn bộ thân component tìm mọi `return`, `throw`, `if`, `for` nằm **phía trên** một lời gọi hook.
3. Kiểm tra cả các custom hook mà component gọi — vi phạm có thể nằm trong đó.
4. Bật `eslint-plugin-react-hooks` và chạy lint; rule `rules-of-hooks` gần như luôn chỉ đúng chỗ.

Cách sửa: đưa mọi hook lên trên cùng, hoặc tách phần "có điều kiện" thành component con.

</details>

**14. Có cách nào để đạt hiệu quả gọi hook có điều kiện mà vẫn hợp lệ không? Vì sao tách thành component con hoặc custom hook riêng lại không vi phạm quy tắc?**

<details className="qa">
<summary>Xem đáp án</summary>

Có — bằng cách **đẩy điều kiện lên một cấp**, sang việc *component nào được render*, thay vì *hook nào được gọi*:

```jsx
function Page({ id }) {
  if (!id) return <Empty />;
  return <PageContent id={id} />; // chỉ render khi có id
}

function PageContent({ id }) {
  const { data } = useFetch(id);  // luôn chạy trong component này
  return <div>{data?.title}</div>;
}
```

**Vì sao hợp lệ:** Rules of Hooks áp dụng cho **từng component instance**, không cho cả cây. Mỗi instance có danh sách hook riêng. `PageContent` khi được render thì luôn gọi đủ hook theo đúng thứ tự; khi không được render, nó bị unmount và React vứt luôn cả danh sách hook của nó — không có chuyện "lệch index". Việc mount/unmount là chuyện bình thường, không phải vi phạm.

Các cách khác cùng tinh thần: truyền cờ điều kiện *vào* hook (`useFetch(url, { enabled })` — cách TanStack Query dùng), hoặc `return` sớm ngay trong thân `useEffect`.

</details>

**15. Rules of Hooks liên quan gì tới việc React có thể render lại, huỷ bỏ hoặc render đồng thời (concurrent) một component?**

<details className="qa">
<summary>Xem đáp án</summary>

Rất chặt chẽ. Cơ chế của React dựa trên giả định **render là thuần khiết và lặp lại được**: với cùng props/state, gọi component bao nhiêu lần cũng cho ra cùng kết quả và **cùng chuỗi hook**.

Với Concurrent React, giả định đó bị khai thác mạnh hơn:

- React có thể **bắt đầu render rồi bỏ dở** (khi có update ưu tiên cao hơn) và **render lại từ đầu** sau đó.
- **Transition** cho phép giữ giao diện cũ trong lúc chuẩn bị giao diện mới — component bị render nhiều lần với input khác nhau.
- **Suspense** làm component bị gián đoạn rồi tiếp tục.
- **StrictMode** trong dev cố tình render hai lần để phơi bày vi phạm.

Nếu số lượng/thứ tự hook thay đổi giữa các lần render, React không thể khớp lại danh sách hook sau khi huỷ và chạy lại — state gán nhầm, effect chạy sai. Rules of Hooks chính là **điều kiện để React được phép làm những việc đó một cách an toàn**. Đây cũng là lý do cùng nhóm với các quy tắc khác: không mutate props/state, không side effect trong thân render.

</details>
