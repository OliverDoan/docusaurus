---
sidebar_position: 3
title: "3. Components"
---

# 3. Components

## 1. Functional Components

Bài học: [1. Functional Components](../../react/03-components/1_functional-components.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Component là gì? Vì sao chia UI thành nhiều component nhỏ lại tốt hơn một component lớn?**

<details className="qa">
<summary>Xem đáp án</summary>

**Component** là khối UI tái sử dụng, nhận **input (props)** và trả về **JSX (mô tả UI)**. Nó có thể là cả một page, một layout, một section, hay chỉ là một UI element nhỏ như Button, Card, Input.

Vì sao chia nhỏ tốt hơn:

- **Dễ đọc** — mỗi hàm gọn, tên nói rõ nó làm gì; đọc component cha là thấy ngay cấu trúc màn hình.
- **Tái sử dụng** — một `Button` viết một lần, dùng khắp nơi.
- **Dễ test** — hàm nhỏ với props rõ ràng viết unit test đơn giản hơn nhiều so với một khối trăm dòng.
- **Tối ưu render** — React chỉ render lại nhánh thay đổi; component to thì mọi thay đổi nhỏ đều kéo theo cả khối.
- **Dễ chia việc** — nhiều người sửa nhiều file khác nhau, ít đụng độ khi merge.

Nhưng đừng cực đoan: tách ra chỉ để tách sẽ tạo ra hàng chục file bé xíu phải nhảy qua lại mới hiểu được một màn hình.

</details>

**2. `Functional component` là gì và khác `class component` ở những điểm nào về cú pháp, state và lifecycle?**

<details className="qa">
<summary>Xem đáp án</summary>

**Functional component** chỉ là một hàm JavaScript nhận props và trả về JSX.

| | Functional component | Class component |
|---|---|---|
| Cú pháp | Một hàm thuần | `class` kế thừa `React.Component`, có `render()` |
| `this` | Không dùng | Dùng khắp nơi, phải bind khi truyền method |
| State | `useState`, `useReducer` | `this.state` + `this.setState` |
| Side effect | `useEffect` gom theo mối quan tâm | Rải rác qua `componentDidMount`, `componentDidUpdate`, `componentWillUnmount` |
| Tái dùng logic stateful | Custom hook | HOC hoặc render props, dễ lồng nhau rối rắm |
| Độ dài | Ngắn hơn hẳn | Nhiều boilerplate: constructor, `super(props)`, bind |

Ví dụ điển hình trong bài: bộ đếm viết bằng class cần constructor, bind `this`, và lặp lại đúng một dòng cập nhật `document.title` ở cả `componentDidMount` lẫn `componentDidUpdate`; bản functional gom hết vào một `useEffect` với dependency `[count]`.

</details>

**3. Vì sao từ React 16.8 cộng đồng chuyển hẳn sang functional component + Hooks? Hooks giải quyết được vấn đề gì mà class không giải quyết nổi?**

<details className="qa">
<summary>Xem đáp án</summary>

Ba vấn đề cố hữu của class mà Hooks giải quyết:

- **Khó tái sử dụng logic stateful**. Trước Hooks, muốn chia sẻ logic có state (theo dõi kích thước cửa sổ, fetch dữ liệu, kiểm tra đăng nhập) chỉ có HOC và render props — cả hai đều bọc thêm tầng component, tạo ra "wrapper hell" trong DevTools và làm luồng props khó lần. **Custom hook** chia sẻ logic mà không đẻ thêm component nào.
- **Logic bị xé lẻ theo lifecycle**. Một mối quan tâm duy nhất (ví dụ đăng ký và hủy đăng ký một subscription) nằm ở hai method cách xa nhau, trong khi hai mối quan tâm chẳng liên quan lại bị nhét chung vào `componentDidMount`. `useEffect` gom theo **mối quan tâm**, kèm hàm cleanup ngay bên cạnh.
- **`this` gây nhầm lẫn**. Phải nhớ bind, dễ quên, và là rào cản với người mới.

Ngoài ra hàm dễ tối ưu và minify hơn class, và React đang phát triển các tính năng mới (Server Components, hook mới) tập trung cho function component.

</details>

**4. `props` là gì? Vì sao props chỉ đọc, và điều gì xảy ra nếu bạn gán lại giá trị cho props bên trong component?**

<details className="qa">
<summary>Xem đáp án</summary>

**Props** là tham số của component — một object chứa dữ liệu do component cha truyền xuống.

Props **chỉ đọc** vì React xây trên nguyên tắc component phải là **hàm thuần**: cùng props thì luôn cho cùng kết quả. Nếu component được phép sửa props, kết quả render sẽ phụ thuộc vào lịch sử chạy, việc suy luận luồng dữ liệu trở nên bất khả thi, và React không còn cách nào so sánh props cũ với mới để quyết định render.

Nếu bạn gán lại: với biến đã destructure, bạn chỉ đổi **biến cục bộ** — component cha không biết gì, và lần render tới giá trị bị ghi đè lại từ đầu, nên thay đổi "biến mất" một cách khó hiểu. Nguy hiểm hơn là **mutate** object/array trong props: bạn sửa luôn dữ liệu của cha, gây bug rất khó truy vết.

```jsx
// Sai
function Greeting({ name }) {
  name = name.toUpperCase();
  return <p>Hi {name}</p>;
}

// Đúng — tạo biến mới
function Greeting({ name }) {
  const displayName = name.toUpperCase();
  return <p>Hi {displayName}</p>;
}
```

</details>

**5. Dữ liệu trong React chảy một chiều từ trên xuống. Vậy khi component con cần báo thay đổi ngược lên cha thì làm thế nào? Cho ví dụ với `onChange`.**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng **callback prop**: cha truyền xuống một **hàm**, con gọi hàm đó khi có sự kiện. Dữ liệu vẫn đi một chiều xuống dưới, chỉ có *tín hiệu* đi ngược lên — cha là người thực sự cập nhật state.

```jsx
function SearchInput({ value, onChange }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} />;
}

function Page() {
  const [query, setQuery] = useState("");
  return (
    <>
      <SearchInput value={query} onChange={setQuery} />
      <p>Đang tìm: {query}</p>
    </>
  );
}
```

Đây chính là pattern **controlled component**: state nằm ở cha (nguồn sự thật duy nhất), con chỉ hiển thị `value` và báo lên qua `onChange`. Quy ước đặt tên là tiền tố `on` cho prop (`onChange`, `onSelect`, `onSubmit`) và `handle` cho hàm xử lý bên trong.

Khi state cần dùng chung ở nhiều nhánh xa nhau, kỹ thuật tương ứng là **lifting state up** — đẩy state lên tổ tiên chung gần nhất.

</details>

**6. Giá trị mặc định qua destructuring khác `defaultProps` ra sao? Vì sao `defaultProps` không còn được khuyến nghị cho function component?**

<details className="qa">
<summary>Xem đáp án</summary>

Default qua destructuring là cơ chế **của JavaScript**, xử lý ngay trong chữ ký hàm:

```jsx
function Greeting({ name = "bạn", size = "md" }) {
  return <p>Xin chào {name}</p>;
}
```

`defaultProps` là cơ chế **của React**, gán vào thuộc tính tĩnh của component và được React áp dụng trước khi gọi hàm render.

Vì sao `defaultProps` không còn được khuyến nghị cho function component:

- React đã chính thức **deprecate** nó cho function component; console cảnh báo và tương lai sẽ gỡ bỏ. Nó vẫn còn hiệu lực cho class component.
- Nó tách giá trị mặc định ra khỏi chỗ khai báo props, đọc code phải nhảy xuống cuối file mới biết mặc định là gì.
- Nó cần thêm một bước xử lý lúc chạy, trong khi cú pháp JS không tốn gì.
- Tích hợp với TypeScript kém mượt hơn hẳn.

Điểm chung cần nhớ: cả hai chỉ kích hoạt khi giá trị là `undefined`, còn `null` được truyền vào thì giữ nguyên `null`.

</details>

**7. `children` là gì và nó có phải một prop bình thường không? Có thể truyền nó dưới dạng thuộc tính tường minh được không?**

<details className="qa">
<summary>Xem đáp án</summary>

`children` là nội dung nằm **giữa thẻ mở và thẻ đóng** của component. Nó **là một prop hoàn toàn bình thường** — chỉ đặc biệt ở chỗ JSX có cú pháp riêng để truyền nó, giúp code trông giống HTML.

```jsx
function Card({ children }) {
  return <div className="card">{children}</div>;
}
```

Và **có**, truyền tường minh được, hai cách dưới đây tương đương:

```jsx
<Card>Nội dung</Card>
<Card children="Nội dung" />
```

Trên thực tế không ai viết cách thứ hai vì nó khó đọc và mất đi lợi thế lồng nhau. Lưu ý nếu viết cả hai cùng lúc, nội dung giữa thẻ sẽ **ghi đè** thuộc tính `children`.

Vài điểm cần biết thêm: `children` có thể là một phần tử, một mảng, một chuỗi, `null`, hay thậm chí là một **hàm** (nền tảng của render prop). Kiểu TypeScript thường dùng là `ReactNode`.

</details>

**8. "Composition over configuration" nghĩa là gì? So sánh một `Card` nhận mười prop cấu hình với một `Card` dùng `children` — mỗi cách gãy ở đâu?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên tắc: thay vì cố nhồi mọi biến thể vào **cờ cấu hình**, hãy để người dùng **ghép** các mảnh UI lại với nhau.

```jsx
// Configuration — mọi thứ qua prop
<Card title="Hello" showHeader showFooter headerStyle="big" bodyText="..." footerButton="Save" />

// Composition — người dùng tự ghép
<Card>
  <Card.Header>Hello</Card.Header>
  <Card.Body>...</Card.Body>
  <Card.Footer><Button>Save</Button></Card.Footer>
</Card>
```

**Cách cấu hình gãy ở đâu:** bạn phải đoán trước mọi tình huống sử dụng. Mỗi yêu cầu mới lại đẻ thêm một prop, đến lúc cần một nút thứ hai trong footer hoặc một icon cạnh tiêu đề thì API không đỡ nổi. Danh sách prop phình ra, nhiều tổ hợp mâu thuẫn nhau, bên trong đầy điều kiện lồng nhau.

**Cách composition gãy ở đâu:** người dùng có thể ghép sai cấu trúc hoặc quên một phần bắt buộc; kiểu dữ liệu khó ràng buộc chặt; nếu cần chia sẻ state giữa các phần con thì phải thêm Context nội bộ. Bù lại nó linh hoạt hơn nhiều — đó là lý do Radix UI, shadcn/ui, Mantine đều xây theo hướng này.

</details>

**9. Ngoài `children`, còn cách nào truyền JSX vào component (slot prop, `render prop`)? Khi nào render prop hợp hơn children?**

<details className="qa">
<summary>Xem đáp án</summary>

Ba cách chính:

- **`children`** — nội dung giữa hai thẻ, dùng cho "một khoảng trống" duy nhất.
- **Slot prop** — truyền JSX qua prop có tên, dùng khi component có **nhiều vị trí** cần lấp: `<Modal header={<Title />} footer={<Actions />} />`.
- **Render prop** — truyền một **hàm** trả về JSX; component gọi hàm đó và truyền dữ liệu nội bộ vào.

```jsx
function List({ items, renderItem }) {
  return <ul>{items.map((it) => <li key={it.id}>{renderItem(it)}</li>)}</ul>;
}

<List items={users} renderItem={(u) => <b>{u.name}</b>} />
```

**Render prop hợp hơn khi component cha cần *nhận dữ liệu từ bên trong* con mới quyết định được render gì** — ví dụ từng phần tử của danh sách, trạng thái đóng/mở của một dropdown, kết quả đo kích thước. `children` thuần là JSX tĩnh, không nhận được dữ liệu đó. (Cũng có thể viết `children` dưới dạng hàm để đạt hiệu quả tương tự.)

Lưu ý: từ khi có Hooks, phần lớn nhu cầu **chia sẻ logic** nên chuyển sang custom hook; render prop giờ chủ yếu dành cho việc tùy biến **hiển thị**.

</details>

**10. Vì sao React chọn composition thay vì kế thừa (`inheritance`) để tái sử dụng? Logic dùng chung giữa các component thì tái sử dụng bằng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

React docs nói thẳng: họ **chưa từng gặp** trường hợp nào nên dùng kế thừa giữa các component. Lý do:

- Kế thừa tạo **ràng buộc cứng** giữa cha và con; sửa lớp cha có thể làm vỡ mọi lớp con mà không ai lường trước.
- Nó chỉ mô hình hóa được quan hệ "là một", trong khi UI thường là quan hệ "chứa" và "kết hợp".
- Phân cấp sâu rất khó lần dấu: một hành vi đến từ tầng nào trong chuỗi kế thừa?
- Composition linh hoạt hơn — ghép hai ba mảnh lại dễ hơn nhiều so với đẻ ra một lớp con mới cho từng tổ hợp.

Còn **tái sử dụng logic** thì dùng:

- **Custom hook** — cách chuẩn hiện nay cho logic có state hoặc side effect (`useAuth`, `useFetch`, `useDebounce`).
- **Hàm tiện ích thuần** — cho logic không liên quan tới React.
- **Context** — cho dữ liệu dùng chung xuyên nhiều tầng.
- **HOC / render prop** — vẫn còn trong codebase cũ, nhưng custom hook thay thế gần hết.

Nguyên tắc: **ghép UI bằng composition, ghép logic bằng hook**.

</details>

**11. Vì sao tên component bắt buộc phải `PascalCase`? JSX phân biệt `button` và `Button` dựa vào đâu, và nếu đặt tên thường thì React render ra cái gì?**

<details className="qa">
<summary>Xem đáp án</summary>

JSX phân biệt hoàn toàn dựa vào **chữ cái đầu tiên**:

- Bắt đầu bằng **chữ thường** → biên dịch thành **chuỗi**, coi là thẻ HTML gốc: `<button />` thành `createElement("button")`.
- Bắt đầu bằng **chữ hoa** → biên dịch thành **tham chiếu biến**, coi là component: `<Button />` thành `createElement(Button)`.

Quy ước này tồn tại vì JSX cần một cách rõ ràng, không mơ hồ để biết bạn đang nói tới thẻ HTML hay component của mình, mà không phải giữ một danh sách mọi tên thẻ HTML.

Nếu đặt tên component viết thường:

```jsx
function userCard() { return <div /> }

<userCard /> // React hiểu là thẻ HTML tên "usercard"
```

Kết quả: React tạo ra một phần tử DOM lạ tên `usercard` — trang không hiển thị gì như mong đợi, và thường kèm cảnh báo về thẻ không hợp lệ. Hàm `userCard` không bao giờ được gọi.

ESLint rule `react/jsx-pascal-case` giúp chặn lỗi này từ sớm.

</details>

**12. Component phải là hàm thuần (`pure`) nghĩa là gì? Cho một ví dụ vi phạm tính thuần và hậu quả của nó khi React render lại.**

<details className="qa">
<summary>Xem đáp án</summary>

**Thuần** nghĩa là: với cùng một bộ props, state và context, component luôn trả về cùng một kết quả JSX, và **không gây tác động phụ trong lúc render** — không sửa biến bên ngoài, không mutate props, không ghi vào DOM, không gọi API.

Ví dụ vi phạm:

```jsx
let total = 0;

function Item({ price }) {
  total += price;          // mutate biến ngoài ngay trong render
  return <li>{price} — cộng dồn: {total}</li>;
}
```

Hậu quả: React có quyền render lại bất cứ lúc nào, render nhiều lần rồi bỏ kết quả đi, hoặc render trước rồi mới commit. Trong **Strict Mode** ở môi trường dev, React cố tình gọi hàm component hai lần để phơi bày đúng loại bug này — `total` sẽ cộng gấp đôi. Với các tính năng concurrent, kết quả còn khó đoán hơn: cùng dữ liệu nhưng hiển thị khác nhau giữa các lần render.

Cách đúng: mọi tác động phụ đưa vào `useEffect` hoặc event handler; giá trị tính toán thì derive từ props/state ngay trong render, hoặc lưu bằng `useState` / `useRef` nếu cần bền vững.

</details>

**13. Vì sao không nên định nghĩa một component bên trong thân của component khác? Bug biểu hiện ra sao khi làm vậy?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì mỗi lần component cha render, thân hàm chạy lại và tạo ra một **hàm component hoàn toàn mới** — một tham chiếu khác với lần trước.

```jsx
function Parent() {
  const [n, setN] = useState(0);

  function Child() {          // hàm mới mỗi lần Parent render
    const [text, setText] = useState("");
    return <input value={text} onChange={(e) => setText(e.target.value)} />;
  }

  return <><button onClick={() => setN(n + 1)}>{n}</button><Child /></>;
}
```

React so sánh cây theo **kiểu (type)** của element. Vì `Child` lần này khác `Child` lần trước, React kết luận đây là component khác loại nên **hủy toàn bộ cây con cũ và mount lại từ đầu**.

Biểu hiện bug:

- **State bên trong bị reset** mỗi lần cha render — chữ đang gõ dở biến mất, checkbox tự bỏ chọn.
- **Mất focus** khỏi ô input đang nhập.
- `useEffect` chạy lại liên tục vì component unmount rồi mount lại.
- Hiệu năng kém và animation bị giật.

Cách sửa: đưa component ra **ngoài**, ở cấp module, rồi truyền dữ liệu qua props.

</details>

**14. Vì sao React khuyên tránh `React.FC` trong code mới? Hai nhược điểm cụ thể của nó là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

```tsx
// Tránh
const Button: React.FC<Props> = ({ children }) => <button>{children}</button>;

// Khuyến nghị
function Button({ children }: Props) {
  return <button>{children}</button>;
}
```

Hai nhược điểm chính:

- **Ngầm thêm `children` vào kiểu props**. Một component không hề nhận children vẫn qua được type-check khi ai đó truyền children vào — đúng cái lỗi mà TypeScript đáng lẽ phải bắt. (Từ React 18 và `@types/react` mới, hành vi ngầm này đã bị gỡ, nhưng nhiều codebase vẫn mang thói quen cũ.)
- **Hỗ trợ generic component kém**. Viết một component nhận kiểu tổng quát, ví dụ một `List<T>`, bằng `React.FC` rất vụng; khai báo hàm bình thường thì tự nhiên.

Ngoài ra nó còn dài dòng hơn mà chẳng đem lại lợi ích gì — kiểu trả về đã được TypeScript suy luận sẵn. React docs cũng đã bỏ `React.FC` khỏi mọi ví dụ. Cách hiện đại là khai báo props qua `interface` hoặc `type` rồi chú thích thẳng vào tham số.

</details>

**15. Khai báo kiểu cho `children`: `ReactNode`, `ReactElement` và `JSX.Element` khác nhau thế nào? Khi nào bắt buộc phải dùng loại hẹp hơn?**

<details className="qa">
<summary>Xem đáp án</summary>

| Kiểu | Bao gồm những gì |
|---|---|
| `ReactNode` | Rộng nhất: element, chuỗi, số, mảng, `null`, `undefined`, `boolean`, Fragment |
| `ReactElement` | Chỉ object element do JSX hoặc `createElement` tạo ra; có generic cho props |
| `JSX.Element` | Gần như `ReactElement<any, any>` — dạng cụ thể nằm trong namespace `JSX` |

Thực tế `JSX.Element` là trường hợp riêng hẹp hơn của `ReactElement`, còn `ReactNode` bao trùm cả hai cộng thêm mọi thứ React render được.

**Mặc định dùng `ReactNode` cho `children`** vì người dùng có thể truyền chuỗi, số, mảng hoặc `null`:

```tsx
interface CardProps {
  title: string;
  children: ReactNode;
}
```

**Khi nào cần hẹp hơn:** khi component thực sự thao tác trên element — ví dụ dùng `React.Children.map` kèm `cloneElement` để chèn thêm props vào từng con, hoặc đọc `child.props`. Lúc đó nhận vào một chuỗi sẽ vỡ ở runtime, nên khai báo `ReactElement` để TypeScript chặn từ đầu. Với trường hợp chỉ có đúng một phần tử con, cũng nên khai báo hẹp lại thay vì `ReactNode`.

</details>

**16. Component muốn trả về nhiều phần tử ngang cấp thì làm sao? `Fragment` giải quyết vấn đề gì và khi nào phải viết dạng đầy đủ thay vì cú pháp rút gọn?**

<details className="qa">
<summary>Xem đáp án</summary>

JSX yêu cầu mỗi biểu thức chỉ có **một node gốc**, vì nó biên dịch thành một lời gọi hàm và hàm chỉ trả về được một giá trị. Muốn trả nhiều phần tử ngang cấp thì bọc chúng trong **Fragment**.

Fragment gom các phần tử lại về mặt cú pháp nhưng **không tạo thêm node DOM nào**. Điều này quan trọng khi thẻ bọc thừa sẽ phá layout — đặc biệt với Flexbox, Grid, hoặc cấu trúc bắt buộc như `table`, `tr`, `ul`.

```jsx
function Row() {
  return (
    <>
      <td>A</td>
      <td>B</td>
    </>
  );
}
```

**Khi nào phải viết dạng đầy đủ `<React.Fragment>`:** khi cần truyền prop `key` — điển hình là lúc render danh sách mà mỗi mục gồm nhiều phần tử ngang cấp. Cú pháp rút gọn không nhận được thuộc tính nào.

```jsx
items.map((it) => (
  <React.Fragment key={it.id}>
    <dt>{it.term}</dt>
    <dd>{it.desc}</dd>
  </React.Fragment>
))
```

Component cũng có thể trả về một mảng phần tử (mỗi phần tử cần `key`), nhưng Fragment dễ đọc hơn.

</details>

**17. Dấu hiệu nào cho thấy một component đã quá to và cần tách? Bạn tách theo tiêu chí nào — theo UI hay theo trách nhiệm?**

<details className="qa">
<summary>Xem đáp án</summary>

Dấu hiệu cần tách:

- Phải cuộn nhiều lần mới đọc hết một hàm; JSX lồng sâu hơn bốn năm tầng.
- Quá nhiều `useState` rời rạc, hoặc một `useEffect` làm nhiều việc chẳng liên quan.
- Khó đặt tên cho component vì nó làm quá nhiều thứ.
- Có những khối JSX lặp lại gần giống nhau.
- Đổi một chi tiết nhỏ khiến cả màn hình render lại.
- Viết test phải dựng quá nhiều thứ mới chạy được một trường hợp.

Tiêu chí tách: **ưu tiên theo trách nhiệm**, UI chỉ là dấu hiệu bề mặt. Hỏi "phần này thay đổi vì lý do gì?" — những mảnh thay đổi vì cùng một lý do thì ở chung, khác lý do thì tách. Tách theo UI thuần túy dễ đẻ ra component chỉ là cái vỏ, phải xuyên hàng chục prop qua nhiều tầng.

Cách chia hiệu quả trong thực tế: **component hiển thị** (nhận props, không biết dữ liệu từ đâu) tách khỏi **component có logic** (nắm state, gọi API); còn logic thuần thì bóc sang **custom hook** để component chỉ còn phần JSX.

</details>

**18. Một component nhận quá nhiều props, có nhiều prop dạng cờ bật/tắt. Bạn tái cấu trúc thế nào cho gọn?**

<details className="qa">
<summary>Xem đáp án</summary>

Nhiều cờ boolean là mùi code điển hình: `n` cờ tạo ra `2^n` tổ hợp, phần lớn vô nghĩa hoặc mâu thuẫn, và chỗ gọi đọc như một câu đố.

Các hướng xử lý:

- **Gộp cờ loại trừ nhau thành một prop dạng union**: thay `isPrimary`, `isDanger`, `isGhost` bằng `variant: "primary" | "danger" | "ghost"`. Không thể bật hai cái cùng lúc, TypeScript gợi ý sẵn.
- **Chuyển sang composition**: cờ `showHeader`, `showFooter` biến mất khi người dùng tự đặt `<Card.Header>` và `<Card.Footer>`.
- **Nhóm props liên quan thành object**: mọi thứ về phân trang gom vào `pagination`.
- **Tách thành nhiều component riêng** khi các nhánh cờ dẫn tới hành vi khác hẳn nhau — hai component rõ ràng tốt hơn một component đầy `if`.
- **Dùng discriminated union** cho các tổ hợp hợp lệ, để TypeScript cấm luôn trạng thái không hợp lệ.
- **Spread props gốc của thẻ HTML** thay vì khai báo lại từng cái.

Tiêu chí kiểm tra nhanh: nhìn một chỗ gọi component, có hiểu ngay nó hiển thị cái gì không?

</details>

**19. Khi render danh sách bằng `map`, `key` dùng để làm gì? Vì sao dùng chỉ số mảng làm key là nguy hiểm, và component con có đọc được `key` như một prop không?**

<details className="qa">
<summary>Xem đáp án</summary>

`key` giúp React **nhận diện** từng phần tử qua các lần render, để biết mục nào được giữ, thêm, xóa hay đổi chỗ — thay vì so sánh mù theo vị trí. Nhờ đó React tái sử dụng đúng DOM node và giữ đúng state của từng mục.

**Vì sao chỉ số mảng nguy hiểm:** chỉ số mô tả *vị trí*, không mô tả *danh tính*. Khi chèn vào đầu danh sách, xóa giữa, sắp xếp hay lọc, cùng một chỉ số giờ trỏ vào dữ liệu khác. React tưởng "mục số 0 chỉ đổi nội dung" nên giữ nguyên DOM và state cũ — kết quả là checkbox tích nhầm dòng, chữ đang gõ nhảy sang ô khác, animation sai.

```jsx
// Nguy hiểm nếu danh sách có thể thêm/xóa/sắp xếp
{todos.map((t, i) => <TodoItem key={i} todo={t} />)}

// An toàn — dùng id ổn định từ dữ liệu
{todos.map((t) => <TodoItem key={t.id} todo={t} />)}
```

Chỉ số chấp nhận được khi danh sách tĩnh, không bao giờ đổi thứ tự và các mục không có state riêng.

**Con không đọc được `key` như prop.** `key` là thuộc tính React giữ riêng, không nằm trong `props`. Cần dùng giá trị đó bên trong thì truyền thêm một prop khác, ví dụ `id={t.id}`.

</details>

**20. Truyền một arrow function inline làm prop sẽ tạo tham chiếu mới mỗi lần render — điều đó ảnh hưởng thế nào tới `React.memo` và bạn xử lý ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

`React.memo` bỏ qua việc render lại khi props **nông bằng nhau** với lần trước. Hàm là object, mà mỗi lần render cha lại tạo một hàm mới nên so sánh luôn cho ra "khác" — component con render lại mọi lúc, memo trở nên vô dụng.

```jsx
const Child = React.memo(function Child({ onClick }) { /* ... */ });

function Parent() {
  const [n, setN] = useState(0);
  // onClick là hàm mới mỗi lần render → Child luôn render lại
  return <Child onClick={() => doSomething(n)} />;
}
```

Cách xử lý:

- Bọc hàm trong `useCallback` với dependency đúng; object/array inline thì dùng `useMemo`.
- Nếu hàm không phụ thuộc gì trong component, khai báo nó **ngoài** component.
- Dùng dạng updater (`setN(c => c + 1)`) để giảm dependency.
- Đưa state xuống gần nơi dùng, hoặc chèn `children` để cha render mà con không đổi.

Quan trọng: **đừng tối ưu sớm**. Với component nhẹ, render lại rẻ hơn chi phí so sánh và ghi nhớ. Chỉ áp dụng khi Profiler chỉ ra đúng chỗ nghẽn. Trình biên dịch React (React Compiler) đang hướng tới việc tự lo phần này.

</details>

---

## 2. Class Components (Legacy)

Bài học: [2. Class Components (Legacy)](../../react/03-components/2_class-components.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Class component là gì? Tối thiểu cần những gì để một class trở thành component React hợp lệ?**

<details className="qa">
<summary>Xem đáp án</summary>

**Class component** là component viết dưới dạng lớp ES6, cách làm chuẩn của React trước khi Hooks ra đời năm 2019. Nó cho component một nơi giữ state riêng (`this.state`) và bộ lifecycle method để chạy logic theo từng giai đoạn vòng đời.

Tối thiểu cần đúng hai thứ:

- **Kế thừa `React.Component`** (hoặc `React.PureComponent`).
- **Có method `render()`** trả về JSX, chuỗi, mảng, hay `null`.

```jsx
import { Component } from "react";

class Welcome extends Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

Constructor, state, lifecycle đều là **tùy chọn**. Tên class vẫn phải PascalCase như mọi component. Props nhận qua `this.props` và **chỉ đọc** — y hệt function component.

</details>

**2. Vì sao `render()` phải thuần và không có side effect? Điều gì xảy ra nếu gọi `setState` ngay trong `render()`?**

<details className="qa">
<summary>Xem đáp án</summary>

`render()` chỉ được phép **mô tả UI dựa trên props và state hiện tại**. React có quyền gọi nó nhiều lần, hoãn lại, hoặc bỏ kết quả đi mà không commit — đặc biệt với các tính năng concurrent. Nếu `render()` gây tác động phụ (gọi API, ghi vào DOM, sửa biến ngoài), số lần tác động đó xảy ra trở nên không đoán được, và ứng dụng cho ra kết quả khác nhau giữa các lần chạy.

Gọi `setState` ngay trong `render()` tạo **vòng lặp vô hạn**: `setState` lên lịch render lại, render lại gọi `setState`, cứ thế. React phát hiện và ném lỗi "Maximum update depth exceeded", trang treo hoặc crash.

```jsx
render() {
  this.setState({ n: 1 }); // SAI — vòng lặp vô hạn
  return <p>{this.state.n}</p>;
}
```

Side effect phải đặt ở `componentDidMount`, `componentDidUpdate`, `componentWillUnmount` hoặc trong event handler — tức là **sau khi** React đã commit kết quả render.

</details>

**3. Vì sao trong class phải viết `this.props.name` chứ không phải `props.name` như function component?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì hai mô hình nhận dữ liệu khác nhau về bản chất.

Function component nhận props làm **tham số của hàm**, nên bên trong nó `props` là một biến cục bộ bình thường:

```jsx
function Welcome(props) {
  return <h1>{props.name}</h1>;
}
```

Class component thì React tạo ra một **instance** và gán props vào **thuộc tính của instance** — chính lời gọi `super(props)` trong constructor làm việc đó. `render()` là method của instance, không nhận tham số nào, nên muốn đọc props phải đi qua `this`.

Hệ quả thực tế rất đáng chú ý: props trong function component được "đóng băng" theo từng lần render (nhờ closure), còn `this.props` trong class **luôn trỏ tới giá trị mới nhất**. Vì vậy một callback bất đồng bộ trong class có thể đọc được props đã đổi sau đó, dẫn tới hành vi khó lường — đây là một trong những lý do Hooks được đánh giá dễ suy luận hơn. Trong class, muốn "chốt" giá trị thì phải destructure ra biến cục bộ ngay từ đầu.

</details>

**4. Khởi tạo state bằng `constructor` khác bằng class field ra sao? `super(props)` dùng để làm gì và quên nó thì lỗi gì xảy ra?**

<details className="qa">
<summary>Xem đáp án</summary>

Hai cách cho kết quả tương đương, class field chỉ là cú pháp gọn hơn (được Babel/TypeScript biên dịch về đúng constructor):

```jsx
// Constructor
class A extends Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }
}

// Class field — gọn hơn, phổ biến hơn
class B extends Component {
  state = { count: 0 };
}
```

Dùng constructor khi cần đọc props để tính state ban đầu, hoặc cần bind method. Ngoài ra thì dùng class field.

`super(props)` gọi constructor của lớp cha `React.Component`, làm hai việc: khởi tạo phần nội tại của lớp cha, và **gán `this.props`**.

Quên gọi `super()` hoàn toàn: JavaScript ném `ReferenceError` — không được phép chạm vào `this` trước khi gọi `super` trong lớp dẫn xuất.

Gọi `super()` nhưng **quên truyền `props`**: không lỗi ngay, nhưng `this.props` là `undefined` **bên trong constructor** — rất khó lần ra. Sau khi constructor chạy xong thì React tự gán props nên các method khác vẫn dùng bình thường.

</details>

**5. Vì sao method của class bị mất `this` khi truyền làm event handler? Kể ba cách khắc phục và ưu nhược của từng cách.**

<details className="qa">
<summary>Xem đáp án</summary>

Trong JavaScript, `this` của một function thường được xác định theo **cách gọi**, không theo nơi định nghĩa. Viết `onClick={this.handleClick}` là bạn lấy **tham chiếu hàm** ra khỏi object rồi đưa cho React gọi sau — lúc gọi không còn ngữ cảnh object, và thân class luôn ở strict mode nên `this` là `undefined`.

Ba cách khắc phục:

| Cách | Ưu | Nhược |
|---|---|---|
| Bind trong constructor: `this.f = this.f.bind(this)` | Chỉ tạo hàm một lần, tham chiếu ổn định | Dài dòng, phải nhớ thêm dòng cho mỗi method |
| Class field arrow: `f = () => {}` | Gọn nhất, `this` chốt sẵn theo lexical scope | Method nằm trên từng instance thay vì prototype, khó gọi từ lớp con qua `super` |
| Arrow inline trong JSX: `onClick={() => this.f()}` | Tiện khi cần truyền tham số | Tạo hàm mới mỗi lần render, phá `PureComponent` / `React.memo` của con |

Trong thực tế class field arrow là lựa chọn phổ biến nhất. Function component không gặp vấn đề này vì không dùng `this`.

</details>

**6. `setState` là bất đồng bộ và được gộp lô (`batched`) nghĩa là gì? Vì sao gọi `this.setState({count: this.state.count + 1})` hai lần liên tiếp chỉ tăng một?**

<details className="qa">
<summary>Xem đáp án</summary>

`setState` **không** cập nhật `this.state` ngay lập tức. Nó **xếp hàng** một yêu cầu cập nhật; React gom nhiều `setState` trong cùng một lượt xử lý lại (**batching**), rồi áp dụng một lần và render một lần duy nhất. Làm vậy để tránh render lại nhiều lần liên tiếp một cách vô ích.

Vì thế:

```jsx
this.setState({ count: this.state.count + 1 });
this.setState({ count: this.state.count + 1 });
// this.state.count vẫn là giá trị cũ ở cả hai dòng
// Giả sử đang là 0 → cả hai đều xếp hàng { count: 1 } → kết quả 1, không phải 2
```

Cả hai lời gọi đều đọc `this.state.count` **trước khi** bất kỳ cập nhật nào được áp dụng, nên cùng tính ra một giá trị; lời gọi sau ghi đè lời gọi trước.

Cách đúng là dùng dạng updater, mỗi hàm nhận state của bước ngay trước nó:

```jsx
this.setState(prev => ({ count: prev.count + 1 }));
this.setState(prev => ({ count: prev.count + 1 })); // +2
```

Từ React 18, batching được áp dụng tự động cho mọi ngữ cảnh, kể cả trong `setTimeout` hay callback của promise.

</details>

**7. Khi nào bắt buộc phải dùng dạng updater `setState(prev => ...)`? Nguyên tắc này có áp dụng cho `useState` không?**

<details className="qa">
<summary>Xem đáp án</summary>

Bắt buộc dùng updater khi **giá trị mới phụ thuộc vào giá trị cũ**. Những tình huống điển hình:

- Tăng/giảm bộ đếm, cộng dồn.
- Bật/tắt một cờ: `setState(p => ({ open: !p.open }))`.
- Thêm/bớt phần tử trong mảng hoặc object trong state.
- Gọi nhiều lần cập nhật liên tiếp trong cùng một handler.
- Cập nhật từ trong callback bất đồng bộ, timer, hoặc event listener sống lâu — nơi giá trị bắt được có thể đã cũ.

Ngược lại, khi giá trị mới **độc lập** với giá trị cũ (gán thẳng dữ liệu vừa fetch về, đặt lại form về rỗng) thì dạng object bình thường là đủ.

**Có, nguyên tắc y hệt với `useState`** — thậm chí còn quan trọng hơn, vì function component còn dính thêm closure: callback giữ lại giá trị state của đúng lần render tạo ra nó.

```jsx
setCount(c => c + 1); // an toàn trong mọi ngữ cảnh
```

Lợi ích kèm theo: hàm updater không cần state trong dependency, nên `useCallback` bọc quanh nó giữ được tham chiếu ổn định.

</details>

**8. `setState` nhận thêm một callback thứ hai — dùng để làm gì và tương đương với cái gì trong thế giới Hooks?**

<details className="qa">
<summary>Xem đáp án</summary>

Tham số thứ hai là hàm chạy **sau khi state đã được áp dụng và component đã render lại xong**. Nó tồn tại chính vì `setState` bất đồng bộ — đọc `this.state` ngay dòng sau sẽ thấy giá trị cũ.

```jsx
this.setState({ query: value }, () => {
  this.search(this.state.query); // chắc chắn dùng state mới
});
```

Dùng cho: gọi API sau khi state đã cập nhật, đo kích thước DOM sau khi render, ghi log, cuộn tới vị trí mới.

Trong thế giới Hooks **không có tham số tương đương** — `setCount` chỉ nhận một đối số. Cách làm tương ứng là `useEffect` với dependency là state đó:

```jsx
useEffect(() => {
  search(query);
}, [query]);
```

Khác biệt về tư duy đáng chú ý: callback của `setState` là "làm việc này **sau khi** tôi vừa set", còn `useEffect` là "đồng bộ với giá trị này **mỗi khi** nó đổi" — nên effect chạy cả khi giá trị thay đổi từ nguồn khác. Cần chạy ngay sau khi commit và trước khi trình duyệt vẽ thì dùng `useLayoutEffect`.

</details>

**9. `setState` gộp nông (`shallow merge`) state cũ với state mới, còn `useState` thì thay thế hoàn toàn. Sự khác biệt này gây bug thế nào khi migrate?**

<details className="qa">
<summary>Xem đáp án</summary>

`setState` trong class **trộn** object bạn truyền vào với state hiện tại ở **tầng một**: các key không nhắc tới vẫn được giữ nguyên. `useState` thì **thay thế** trọn vẹn giá trị.

```jsx
// Class — các field khác được giữ
this.state = { name: "A", age: 20, city: "HN" };
this.setState({ age: 21 }); // → { name: "A", age: 21, city: "HN" }

// Hook — mất sạch các field khác
const [user, setUser] = useState({ name: "A", age: 20, city: "HN" });
setUser({ age: 21 }); // → { age: 21 }  — name và city biến mất!
```

Bug khi migrate rất hiểm vì nó **im lặng**: không lỗi, không cảnh báo, chỉ là vài trường bỗng thành `undefined` — giao diện hiện ô trống, hoặc gửi lên server một payload thiếu field.

Cách xử lý: luôn spread state cũ khi cập nhật một phần.

```jsx
setUser(prev => ({ ...prev, age: 21 }));
```

Lưu ý: cả hai đều **nông**, nên object lồng nhau vẫn phải spread từng tầng. Tốt nhất là tách state to thành nhiều `useState` nhỏ độc lập, hoặc dùng `useReducer` khi các field liên quan chặt với nhau.

</details>

**10. Kể ba giai đoạn của vòng đời class component và các method thuộc từng giai đoạn theo đúng thứ tự chạy.**

<details className="qa">
<summary>Xem đáp án</summary>

| Giai đoạn | Thứ tự các method |
|---|---|
| **Mounting** | `constructor` → `getDerivedStateFromProps` → `render` → `componentDidMount` |
| **Updating** | `getDerivedStateFromProps` → `shouldComponentUpdate` → `render` → `getSnapshotBeforeUpdate` → `componentDidUpdate` |
| **Unmounting** | `componentWillUnmount` |

Bản rút gọn hay dùng trong thực tế, đúng như bài nêu: `constructor` → `render` → `componentDidMount` cho mounting; `shouldComponentUpdate` → `render` → `componentDidUpdate` cho updating; `componentWillUnmount` cho unmounting.

Điểm cần nắm: các method trước `render` thuộc **render phase** — phải thuần, có thể bị React gọi lại hoặc hủy bỏ. Các method sau `render` thuộc **commit phase** — DOM đã cập nhật, là nơi hợp lệ để gây side effect và gọi `setState` (có điều kiện).

Ngoài ba giai đoạn trên còn có nhóm xử lý lỗi: `getDerivedStateFromError` và `componentDidCatch`, chạy khi một component con ném lỗi.

</details>

**11. `componentDidMount` dùng để làm gì? Vì sao nên gọi API ở đây thay vì trong `constructor` hay `render`?**

<details className="qa">
<summary>Xem đáp án</summary>

`componentDidMount` chạy **một lần duy nhất**, ngay sau khi component được chèn vào DOM thật. Đây là chỗ dành cho: gọi API lấy dữ liệu, đăng ký event listener hoặc subscription, khởi tạo timer, thao tác DOM cần đo đạc thật, tích hợp thư viện bên thứ ba.

Vì sao không đặt trong `constructor`:

- Constructor chạy **trước khi** component có mặt trên màn hình; dữ liệu về sớm cũng chẳng hiển thị được gì, mà `setState` lúc này là sai cách.
- Constructor nên chỉ làm đúng việc khởi tạo, giữ cho mount nhanh.
- Nếu request thất bại, chưa có gì trên màn hình để hiển thị lỗi.

Vì sao không đặt trong `render`:

- `render` phải **thuần**, và có thể bị gọi nhiều lần — mỗi lần một request, dẫn tới vòng lặp vô hạn khi response gọi `setState`.

Tại `componentDidMount`, DOM đã sẵn sàng nên bạn có thể hiển thị trạng thái loading trước, rồi `setState` khi dữ liệu về để render lại. Bản tương đương trong Hooks là `useEffect(() => {}, [])`.

</details>

**12. Trong `componentDidUpdate(prevProps)`, vì sao phải so sánh `prevProps` trước khi gọi `setState`? Không so sánh thì hiện tượng gì xảy ra?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì `componentDidUpdate` chạy **sau mỗi lần render lại**, mà `setState` lại **kích hoạt một lần render lại**. Gọi thẳng không điều kiện sẽ tạo **vòng lặp vô hạn**: update → `componentDidUpdate` → `setState` → update → ...

Biểu hiện: CPU tăng vọt, tab đơ, React ném lỗi "Maximum update depth exceeded". Với trường hợp gọi API thì còn tệ hơn — bắn request liên tục, có thể bị rate-limit hoặc sập backend.

Cách đúng là chỉ hành động khi thứ mình quan tâm thực sự đổi:

```jsx
componentDidUpdate(prevProps) {
  if (this.props.id !== prevProps.id) {
    this.reload();
  }
}
```

Điều này tương ứng chính xác với **mảng dependency** của `useEffect` — React tự so sánh giúp bạn, thay vì phải viết tay:

```jsx
useEffect(() => { reload(id); }, [id]);
```

Lưu ý so sánh là **tham chiếu**: props dạng object hoặc mảng được tạo mới mỗi lần render sẽ luôn "khác", nên hãy so sánh theo field cụ thể hoặc bảo đảm tham chiếu ổn định từ phía cha.

</details>

**13. `componentWillUnmount` thường phải dọn những thứ gì? Không dọn thì hậu quả cụ thể là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Những thứ cần dọn:

- `setInterval` / `setTimeout` — hủy bằng `clearInterval` / `clearTimeout`.
- Event listener gắn thủ công lên `window` hoặc `document`.
- Subscription: WebSocket, EventSource, observable, store bên ngoài.
- Request đang bay — hủy bằng `AbortController`.
- Tài nguyên của thư viện bên thứ ba: instance biểu đồ, bản đồ, editor.
- `ResizeObserver`, `IntersectionObserver`.

Hậu quả nếu quên:

- **Rò rỉ bộ nhớ**: listener và timer còn giữ tham chiếu tới component đã chết, nên nó không được thu hồi; ứng dụng chạy lâu càng ngày càng chậm.
- **Cảnh báo cập nhật state trên component đã unmount**: callback về muộn gọi `setState` vào chỗ trống.
- **Hành vi sai**: interval vẫn bắn API sau khi người dùng rời trang; điều hướng qua lại nhiều lần thì có bao nhiêu interval cùng chạy song song.

Bản tương đương trong Hooks là hàm **cleanup** trả về từ `useEffect` — nằm ngay cạnh phần thiết lập nên rất khó quên:

```jsx
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, []);
```

</details>

**14. `shouldComponentUpdate` và `PureComponent` hoạt động ra sao? So sánh nông có cạm bẫy gì với props dạng object hay function?**

<details className="qa">
<summary>Xem đáp án</summary>

`shouldComponentUpdate(nextProps, nextState)` cho bạn tự quyết định có render lại hay không — trả `false` thì React bỏ qua `render` và `componentDidUpdate` của component đó.

`PureComponent` cài sẵn logic đó: nó tự **so sánh nông** props và state (so sánh từng key ở tầng một bằng `Object.is`), trả `false` khi mọi thứ bằng nhau. Bản tương đương cho function component là `React.memo`.

Cạm bẫy của so sánh nông:

- **Object/mảng/hàm tạo mới mỗi lần render** luôn khác tham chiếu, dù nội dung y hệt. `<Child style={{ m: 4 }} onClick={() => f()} />` khiến mọi tối ưu mất tác dụng.
- **Ngược lại — mutate tại chỗ**: sửa `this.state.items.push(x)` rồi set lại cùng tham chiếu thì so sánh nông thấy "không đổi" và **bỏ qua render**, giao diện đứng im dù dữ liệu đã đổi. Đây là lỗi nguy hiểm hơn vì nó im lặng.
- `children` là JSX nên gần như luôn là tham chiếu mới.

Cách xử lý: giữ dữ liệu bất biến, dùng `useCallback` / `useMemo` hoặc bind sẵn trong constructor, và chỉ tối ưu khi Profiler chỉ ra chỗ nghẽn thật.

</details>

**15. Vì sao các method `componentWillMount`, `componentWillReceiveProps`, `componentWillUpdate` bị đánh dấu unsafe? Chúng xung đột với cơ chế render bất đồng bộ ở điểm nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Ba method này thuộc **render phase** — chạy trước khi React commit thay đổi lên DOM. Chúng bị đổi tên thành `UNSAFE_componentWillMount` và tương tự từ React 16.3.

Xung đột với render bất đồng bộ: với concurrent rendering, React có thể **tạm dừng, hủy bỏ, hoặc chạy lại** quá trình render để ưu tiên việc gấp hơn. Nghĩa là các method trong render phase có thể bị gọi **nhiều lần cho cùng một lần cập nhật**, hoặc gọi rồi kết quả bị vứt đi.

Hệ quả thực tế của việc lạm dụng chúng:

- Đặt `fetch` hoặc `subscribe` trong `componentWillMount` — request bắn đi nhiều lần, subscription đăng ký mà không bao giờ hủy (vì `componentWillUnmount` không chạy cho lần render bị hủy) → rò rỉ bộ nhớ.
- Thao tác DOM trong `componentWillUpdate` — DOM lúc đó chưa được cập nhật, dữ liệu đọc ra không khớp.
- `componentWillReceiveProps` hay bị dùng để đồng bộ state theo props, dẫn tới state trùng lặp và lệch nguồn sự thật.

Thay thế: `componentDidMount` cho khởi tạo, `getDerivedStateFromProps` hoặc tính thẳng trong render cho việc dẫn xuất, `getSnapshotBeforeUpdate` cho việc đọc DOM trước commit.

</details>

**16. `getDerivedStateFromProps` vì sao là `static` và không truy cập được `this`? Khi nào thật sự cần tới nó, và vì sao đa số trường hợp là dùng sai?**

<details className="qa">
<summary>Xem đáp án</summary>

Nó là `static` một cách **có chủ đích**: không có `this` nghĩa là không đụng được tới instance, không gọi được `setState`, không gây được side effect. React ép nó thành một hàm thuần nhận `(props, state)` và trả về object cập nhật state hoặc `null` — đúng tinh thần an toàn cho render bất đồng bộ, nơi method này có thể bị gọi nhiều lần.

Trường hợp thật sự cần: khi state phải **thay đổi theo props mà vẫn giữ được thay đổi nội bộ của chính nó** — ví dụ một component chuyển cảnh so sánh prop hướng đi trước/sau, hoặc reset một phần state khi prop định danh đổi mà không muốn mount lại.

Vì sao đa số là dùng sai: người ta dùng nó để **sao chép props vào state** rồi coi đó là nguồn sự thật. Hệ quả là hai nguồn dữ liệu lệch nhau, cập nhật từ cha bị nuốt mất, và bug rất khó lần.

Thay thế tốt hơn:

- Cần giá trị dẫn xuất → **tính thẳng trong `render`**, không lưu vào state.
- Cần reset toàn bộ state khi props đổi → đổi prop `key` của component, React sẽ mount lại instance mới.

</details>

**17. `getSnapshotBeforeUpdate` giải quyết bài toán gì? Cho một tình huống thực tế như giữ vị trí cuộn trong khung chat.**

<details className="qa">
<summary>Xem đáp án</summary>

Nó chạy **sau `render` nhưng ngay trước khi React ghi thay đổi lên DOM**, cho bạn cơ hội cuối cùng đọc trạng thái DOM **cũ**. Giá trị nó trả về được truyền vào `componentDidUpdate` làm **tham số thứ ba**.

Bài toán: khi DOM đã cập nhật xong rồi mới đọc thì thông tin cũ (vị trí cuộn, kích thước, vùng chọn văn bản) đã mất.

Tình huống khung chat — tin nhắn mới chèn vào **đầu** danh sách. Nếu không xử lý, nội dung bị đẩy xuống và người dùng đang đọc lịch sử bỗng nhảy mất chỗ:

```jsx
getSnapshotBeforeUpdate(prevProps) {
  if (prevProps.messages.length < this.props.messages.length) {
    const el = this.listRef.current;
    return el.scrollHeight - el.scrollTop; // khoảng cách tới đáy
  }
  return null;
}

componentDidUpdate(prevProps, prevState, snapshot) {
  if (snapshot !== null) {
    const el = this.listRef.current;
    el.scrollTop = el.scrollHeight - snapshot; // giữ nguyên chỗ đang đọc
  }
}
```

Trong Hooks **không có bản tương đương một-một**; cách gần nhất là `useLayoutEffect` kết hợp `useRef` để tự lưu giá trị trước khi trình duyệt vẽ.

</details>

**18. Ánh xạ vòng đời sang Hooks: một `useEffect` thay thế được cả mount, update và unmount như thế nào? Có lifecycle nào KHÔNG có bản tương đương một-một không?**

<details className="qa">
<summary>Xem đáp án</summary>

Một `useEffect` gom cả ba giai đoạn: thân hàm chạy **sau mount** và **sau mỗi lần dependency đổi**, còn hàm **trả về** là cleanup, chạy trước lần chạy kế tiếp và khi **unmount**.

```jsx
// Class — 3 chỗ rời rạc
componentDidMount()    { this.fetch(); }
componentDidUpdate(p)  { if (p.id !== this.props.id) this.fetch(); }
componentWillUnmount() { this.controller.abort(); }

// Hook — 1 chỗ
useEffect(() => {
  const ctrl = new AbortController();
  fetchData(id, ctrl.signal);
  return () => ctrl.abort();
}, [id]);
```

Bảng ánh xạ chính: `constructor` → giá trị khởi tạo của `useState`; `componentDidMount` → `useEffect(() => {}, [])`; `componentDidUpdate` → `useEffect(() => {}, [deps])`; `componentWillUnmount` → cleanup; `shouldComponentUpdate` → `React.memo` kèm `useMemo` / `useCallback`; `getDerivedStateFromProps` → tính từ props ngay trong render; `getSnapshotBeforeUpdate` → `useLayoutEffect`.

**Không có bản tương đương một-một:** `getSnapshotBeforeUpdate` (chỉ mô phỏng gần đúng) và đặc biệt là `getDerivedStateFromError` cùng `componentDidCatch` — Error Boundary đến nay vẫn buộc phải viết bằng class.

</details>

**19. `Error Boundary` là gì? `getDerivedStateFromError` khác `componentDidCatch` ở vai trò nào, và nên đặt chúng ở đâu trong cây component?**

<details className="qa">
<summary>Xem đáp án</summary>

**Error Boundary** là component bắt lỗi JavaScript xảy ra trong **cây con** của nó lúc render, trong lifecycle và trong constructor, rồi hiển thị giao diện dự phòng thay vì để cả ứng dụng trắng trang.

| | `getDerivedStateFromError` | `componentDidCatch` |
|---|---|---|
| Loại | `static`, thuộc render phase | Method thường, thuộc commit phase |
| Vai trò | Trả về state mới để render fallback | Gây side effect: ghi log, gửi lỗi về Sentry |
| Nhận gì | `error` | `error` và `info` (kèm component stack) |

```jsx
class ErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { logErrorToSentry(error, info); }
  render() {
    if (this.state.hasError) return <p>Đã có lỗi</p>;
    return this.props.children;
  }
}
```

Đặt ở đâu: nên **nhiều tầng**. Một boundary ở gốc để không bao giờ trắng trang; thêm boundary bao quanh từng khu vực độc lập (mỗi route, mỗi widget của dashboard, mỗi panel) để một phần hỏng không kéo sập phần còn lại — người dùng vẫn dùng được chỗ khác.

</details>

**20. Error Boundary KHÔNG bắt được những loại lỗi nào (event handler, code bất đồng bộ, lỗi trong chính boundary)? Với những loại đó bạn xử lý ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Bốn nhóm nằm ngoài tầm với:

- **Lỗi trong event handler** — chúng chạy ngoài chu trình render nên React không bao bọc.
- **Code bất đồng bộ** — callback của `setTimeout`, `.then`, `async` function.
- **Lỗi khi render phía server (SSR)**.
- **Lỗi ném ra từ chính error boundary đó** — phải do một boundary ở tầng trên bắt.

Cách xử lý từng nhóm:

- Event handler và code bất đồng bộ: bọc `try`/`catch` ngay tại chỗ, đưa lỗi vào state rồi hiển thị thông báo, hoặc dùng `setState` để kích hoạt một boundary một cách chủ động (thư viện `react-error-boundary` có sẵn `useErrorHandler` cho việc này).
- Lưới an toàn toàn cục: lắng nghe sự kiện `error` và `unhandledrejection` trên `window` để ghi log những gì lọt lưới.
- Lỗi khi fetch dữ liệu: xử lý như **trạng thái** (loading / error / success) thay vì như ngoại lệ — hiển thị thông báo kèm nút thử lại.
- SSR: bọc `try`/`catch` ở tầng server và trả về trang lỗi phù hợp.

Nguyên tắc chung: boundary là lưới cuối cùng chống trắng trang, không phải cơ chế xử lý lỗi chính.

</details>

**21. Vì sao tới nay Error Boundary vẫn buộc phải viết bằng class? Thư viện `react-error-boundary` giúp gì cho bạn?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì React **chưa cung cấp hook tương đương** cho `getDerivedStateFromError` và `componentDidCatch`. Cơ chế bắt lỗi nằm sâu trong quá trình reconcile: khi một component con ném lỗi, React phải tìm ngược lên tổ tiên gần nhất **có khai báo các method đó trên class** rồi render lại nhánh đó với state lỗi. Đây là hành vi gắn với instance của class, không phải thứ mà một hook gọi bên trong hàm render có thể biểu đạt. React team đã ghi nhận nhu cầu này nhưng chưa chốt được API.

Thư viện `react-error-boundary` không thay đổi điều đó — bên trong nó vẫn là một class — nhưng gói lại thành API dễ dùng hơn nhiều:

- Component `ErrorBoundary` nhận prop `fallback` hoặc `FallbackComponent`, không phải tự viết class mỗi lần.
- Hàm `resetErrorBoundary` để người dùng bấm "Thử lại" mà không cần tải lại trang, cùng `resetKeys` để tự reset khi dữ liệu đổi.
- `onError` để nối thẳng vào Sentry hay hệ thống log.
- Hook `useErrorBoundary` cho phép ném lỗi từ event handler hoặc code bất đồng bộ vào boundary — vốn là những chỗ boundary không tự bắt được.

</details>

**22. Trước khi có Hooks, người ta chia sẻ logic bằng `HOC` và `render props`. Hai cách đó gặp vấn đề gì (`wrapper hell`, va chạm tên prop) mà custom hook giải quyết được?**

<details className="qa">
<summary>Xem đáp án</summary>

**HOC** là hàm nhận component và trả về component mới đã bọc thêm logic; **render props** truyền một hàm để component gọi lại kèm dữ liệu nội bộ. Cả hai đều chia sẻ logic bằng cách **thêm tầng component**, và từ đó sinh ra vấn đề:

- **Wrapper hell**: mỗi logic là một lớp bọc. Dùng năm thứ là cây DevTools sâu thêm năm tầng toàn `withRouter(withTheme(withAuth(...)))`, rất khó lần. Với render props thì code JSX lồng nhau hình bậc thang.
- **Va chạm tên prop**: hai HOC cùng bơm xuống một prop tên `data` — cái sau ghi đè cái trước, im lặng, không cảnh báo.
- **Không rõ nguồn gốc prop**: nhìn component không biết prop nào từ cha, prop nào do HOC chèn.
- **Kiểu TypeScript rất khó viết** cho HOC.

**Custom hook** giải quyết gọn: nó chỉ là một hàm JavaScript, **không tạo component nào**, nên cây component phẳng như cũ. Bạn **tự đặt tên** giá trị nhận về nên không bao giờ va chạm; và nhìn dòng gọi hook là biết ngay dữ liệu đến từ đâu:

```jsx
const { user } = useAuth();
const theme = useTheme();
```

Ghép bao nhiêu hook cũng được mà không thêm một tầng nào.

</details>

**23. Bạn lập kế hoạch migrate một codebase đầy class component sang Hooks thế nào? Component nào làm trước, component nào để cuối, và bạn bảo đảm không hỏng bằng cách nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên tắc đầu tiên: **làm dần từng component, không đập đi xây lại**. Class component vẫn được React hỗ trợ vô thời hạn, nên không có áp lực phải xong trong một đợt.

Thứ tự ưu tiên:

1. **Làm trước** — component logic đơn giản: chỉ có state cục bộ, chỉ dùng `componentDidMount` và `componentWillUnmount`, component lá không có con phức tạp.
2. **Làm giữa** — component có data fetching theo pattern quen thuộc; nhân dịp này bóc logic ra custom hook dùng lại được.
3. **Để cuối hoặc giữ nguyên class** — component có `shouldComponentUpdate`, `getSnapshotBeforeUpdate`, `getDerivedStateFromProps`; và **Error Boundary thì giữ class** vì chưa có hook tương đương.

Thêm một quy tắc vàng: **mọi component mới viết bằng function + Hooks** ngay từ hôm nay, để đống class không phình thêm.

Bảo đảm không hỏng:

- Có **test** bao phủ trước khi sửa; nếu chưa có thì viết test cho hành vi hiện tại trước.
- Mỗi PR chỉ một hoặc vài component, dễ review và dễ revert.
- Cẩn thận hai bẫy kinh điển: `setState` gộp nông còn `useState` thay thế hoàn toàn, và stale closure trong `useEffect` — khai báo đủ dependency, bật ESLint rule `react-hooks/exhaustive-deps`.
- Có thể dùng **react-codemod** để tự động hóa phần thô, nhưng vẫn phải đọc lại tay.

</details>
