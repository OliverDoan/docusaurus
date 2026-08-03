---
sidebar_position: 8
title: "8. State, Props & Data Flow"
---

# State, Props & Data Flow

> *Hiểu rõ cách React quản lý dữ liệu qua props và state, cùng nguyên tắc luồng dữ liệu một chiều là nền tảng để xây dựng ứng dụng dễ bảo trì và dự đoán được.*

:::note[Ghi nhớ nhanh]

- ⭐ **Props read-only, state tự quản** — props do cha truyền xuống (không sửa), state do chính component giữ và thay đổi qua `useState`.
- **Immutability** — luôn tạo object/array mới khi cập nhật state (spread), không mutate trực tiếp, để React phát hiện thay đổi.
- **Lifting state up** — đẩy state lên parent chung khi nhiều component cần chia sẻ cùng dữ liệu.
- **Unidirectional data flow** — dữ liệu chảy một chiều từ cha xuống con, dễ dự đoán và debug.
- **Tránh derived state & khởi tạo state từ props** — nên tính toán trực tiếp khi render thay vì lưu bản sao dễ lệch.
- **Không định nghĩa component lồng trong component** — mỗi lần render tạo type mới, làm mất state và re-mount con.

:::

---

## Câu 1: Sự khác nhau cơ bản giữa props và state trong React là gì? `[Basic]`

### Câu hỏi

> Props và state đều lưu dữ liệu trong React, nhưng chúng khác nhau ở điểm nào? Khi nào dùng props, khi nào dùng state?

### Giải thích lý thuyết

**Props** (properties) là dữ liệu được truyền từ component cha xuống component con. Props là **read-only** — component nhận props không được phép tự thay đổi chúng.

**State** là dữ liệu nội bộ của component, do chính component đó quản lý và có thể thay đổi theo thời gian thông qua `setState` hoặc `useState`.

| Tiêu chí | Props | State |
|---|---|---|
| Nguồn gốc | Component cha truyền xuống | Nội bộ component tự quản lý |
| Khả năng thay đổi | Không thể (read-only) | Có thể thay đổi |
| Ai kiểm soát | Component cha | Chính component đó |
| Mục đích | Cấu hình, truyền dữ liệu | Theo dõi trạng thái thay đổi theo thời gian |

**Quy tắc chọn:**
- Dùng **props** khi dữ liệu đến từ bên ngoài hoặc không thay đổi trong component hiện tại.
- Dùng **state** khi dữ liệu cần thay đổi theo tương tác người dùng hoặc sự kiện.

### Code minh hoạ

```jsx
// Props: component cha kiểm soát
function Button({ label, onClick, disabled }) {
  // label, onClick, disabled là read-only — không được thay đổi
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  )
}

// State: component tự kiểm soát
function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Đếm: {count}</p>
      <Button
        label="Tăng"
        onClick={() => setCount(count + 1)}
        disabled={count >= 10}
      />
    </div>
  )
}
```

### Đáp án mẫu

> Props là dữ liệu chỉ đọc được truyền từ cha xuống con, component con không được phép thay đổi. State là dữ liệu nội bộ mà component tự quản lý và có thể cập nhật. Khi một giá trị cần thay đổi theo tương tác người dùng thì dùng state; khi chỉ nhận dữ liệu từ bên ngoài để hiển thị thì dùng props.

---

## Câu 2: Tại sao mỗi component React chỉ có thể return một element duy nhất ở cấp cao nhất? `[Basic]`

### Câu hỏi

> React yêu cầu JSX phải có một root element duy nhất. Lý do kỹ thuật là gì và có cách nào tránh thêm thẻ `div` thừa không?

### Giải thích lý thuyết

JSX được biên dịch thành `React.createElement(...)`, mỗi lời gọi chỉ trả về **một object duy nhất**. JavaScript không cho phép một hàm `return` hai giá trị riêng lẻ cùng lúc, do đó JSX cũng phải có một root element.

Nếu return nhiều element, JavaScript sẽ báo lỗi cú pháp vì đó tương đương với:

```
return React.createElement('h1', ...), React.createElement('p', ...)
// ↑ Lỗi: biểu thức dư thừa sau dấu phẩy
```

**Cách tránh thêm `div` thừa:**

| Cách | Mô tả |
|---|---|
| `React.Fragment` | Wrapper ảo, không tạo DOM node |
| `<>...</>` | Cú pháp rút gọn của Fragment |
| Array | Return mảng element (cần `key`) |

### Code minh hoạ

```jsx
// SAI: return nhiều element song song
function Wrong() {
  return (
    <h1>Tiêu đề</h1>
    <p>Nội dung</p>  // Lỗi cú pháp
  )
}

// ĐÚNG: dùng Fragment
function Correct() {
  return (
    <>
      <h1>Tiêu đề</h1>
      <p>Nội dung</p>
    </>
  )
}

// ĐÚNG: dùng Fragment với key (khi cần)
function List({ items }) {
  return (
    <>
      {items.map((item) => (
        <React.Fragment key={item.id}>
          <dt>{item.term}</dt>
          <dd>{item.description}</dd>
        </React.Fragment>
      ))}
    </>
  )
}
```

### Đáp án mẫu

> Vì JSX biên dịch thành `React.createElement()` trả về một object JavaScript — một hàm không thể return hai giá trị riêng lẻ. Để tránh thêm thẻ `div` thừa vào DOM, ta dùng `React.Fragment` hoặc cú pháp `<>...</>`, cho phép nhóm nhiều element mà không tạo node DOM thật.

---

## Câu 3: Lifting state up (đẩy state lên trên) là gì và khi nào cần thực hiện? `[Intermediate]`

### Câu hỏi

> Giải thích kỹ thuật "lifting state up". Khi nào cần áp dụng và có những hạn chế gì?

### Giải thích lý thuyết

**Lifting state up** là kỹ thuật di chuyển state lên component cha chung gần nhất khi nhiều component con cần chia sẻ hoặc đồng bộ cùng một dữ liệu.

**Khi nào cần:**
- Hai hoặc nhiều component anh em (sibling) cần đọc cùng một state.
- Một component cần thay đổi state mà component khác cần phản ánh.
- Cần đồng bộ dữ liệu giữa các component không có quan hệ cha-con trực tiếp.

**Hạn chế:**
- Có thể dẫn đến **prop drilling** nếu cây component sâu.
- Component cha phải re-render khi bất kỳ state con thay đổi.
- Giải pháp thay thế: Context API, Zustand, Redux cho state toàn cục.

### Code minh hoạ

```jsx
// TRƯỚC: Mỗi input tự quản lý state — không đồng bộ được
function TemperatureInput({ scale }) {
  const [temperature, setTemperature] = useState('')
  return (
    <input
      value={temperature}
      onChange={(e) => setTemperature(e.target.value)}
    />
  )
}

// SAU: Lift state lên cha để đồng bộ
function TemperatureInput({ scale, temperature, onTemperatureChange }) {
  // State không còn ở đây — nhận từ props
  return (
    <input
      value={temperature}
      onChange={(e) => onTemperatureChange(e.target.value)}
    />
  )
}

function TemperatureConverter() {
  // State được đẩy lên component cha
  const [celsius, setCelsius] = useState('')

  const fahrenheit = celsius ? (parseFloat(celsius) * 9) / 5 + 32 : ''

  return (
    <div>
      <TemperatureInput
        scale="celsius"
        temperature={celsius}
        onTemperatureChange={setCelsius}
      />
      <TemperatureInput
        scale="fahrenheit"
        temperature={String(fahrenheit)}
        onTemperatureChange={(f) => setCelsius(String((parseFloat(f) - 32) * 5 / 9))}
      />
      <p>Nhiệt độ: {celsius}°C = {fahrenheit}°F</p>
    </div>
  )
}
```

### Đáp án mẫu

> Lifting state up là kỹ thuật di chuyển state lên component cha chung khi nhiều component cần chia sẻ cùng dữ liệu. Thay vì mỗi component tự quản lý, cha giữ state và truyền xuống con qua props kèm hàm callback để con có thể yêu cầu thay đổi. Hạn chế là có thể gây prop drilling khi cây component sâu — lúc đó nên xem xét Context API hoặc state manager.

---

## Câu 4: Immutability trong React state là gì và tại sao quan trọng? `[Intermediate]`

### Câu hỏi

> Tại sao React yêu cầu không được mutate state trực tiếp? Điều gì xảy ra nếu vi phạm nguyên tắc này?

### Giải thích lý thuyết

**Immutability** (tính bất biến) nghĩa là không thay đổi object/array gốc mà luôn tạo bản sao mới với dữ liệu đã cập nhật.

**Tại sao React yêu cầu immutability:**

1. **Phát hiện thay đổi:** React so sánh state cũ và mới bằng **shallow comparison** (`===`). Nếu mutate trực tiếp, reference không đổi → React không biết có thay đổi → không re-render.
2. **Time-travel debugging:** Giữ lịch sử state để debug hoặc undo/redo.
3. **Pure rendering:** Đảm bảo component là pure function — cùng input → cùng output.
4. **Concurrent Mode:** React có thể tạm dừng và tiếp tục render — mutation gây race condition.

### Code minh hoạ

```jsx
function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Học React', done: false },
    { id: 2, text: 'Luyện TypeScript', done: false },
  ])

  // SAI: Mutate trực tiếp — React không phát hiện thay đổi
  const toggleWrong = (id) => {
    const todo = todos.find((t) => t.id === id)
    todo.done = !todo.done // MUTATION! Reference không đổi
    setTodos(todos) // React thấy cùng reference → không re-render
  }

  // ĐÚNG: Tạo mảng mới với object mới
  const toggleCorrect = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id
          ? { ...todo, done: !todo.done } // Tạo object mới
          : todo
      )
    )
  }

  // ĐÚNG: Thêm phần tử mới
  const addTodo = (text) => {
    setTodos([...todos, { id: Date.now(), text, done: false }])
  }

  // ĐÚNG: Xoá phần tử
  const removeTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>
          <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>
            {todo.text}
          </span>
          <button onClick={() => toggleCorrect(todo.id)}>Toggle</button>
          <button onClick={() => removeTodo(todo.id)}>Xoá</button>
        </li>
      ))}
    </ul>
  )
}
```

### Đáp án mẫu

> React dùng shallow comparison để phát hiện thay đổi state. Nếu mutate trực tiếp, reference của object/array không đổi, React nghĩ state chưa thay đổi và bỏ qua re-render. Ngoài ra, mutation gây bug khó tìm trong Concurrent Mode và phá vỡ khả năng debug. Luôn tạo bản sao mới: dùng spread operator, `map`, `filter`, hoặc `Array.from` thay vì sửa trực tiếp.

---

## Câu 5: Làm thế nào để cập nhật nested state objects (object lồng nhau) một cách đúng đắn? `[Intermediate]`

### Câu hỏi

> Khi state là object lồng nhiều cấp, cách cập nhật đúng chuẩn là gì? Có công cụ nào hỗ trợ không?

### Giải thích lý thuyết

Spread operator (`...`) chỉ thực hiện **shallow copy** — chỉ copy một cấp. Với object lồng nhau, cần spread từng cấp hoặc dùng thư viện hỗ trợ.

**Các cách tiếp cận:**

| Cách | Ưu điểm | Nhược điểm |
|---|---|---|
| Spread thủ công từng cấp | Không phụ thuộc thư viện | Dài dòng với object sâu nhiều cấp |
| Immer (`produce`) | Cú pháp tự nhiên, dễ đọc | Thêm dependency |
| `structuredClone` | Native, deep copy hoàn toàn | Không xử lý được Function, Date edge cases |

### Code minh hoạ

```jsx
function UserProfile() {
  const [user, setUser] = useState({
    name: 'Nguyễn Văn A',
    address: {
      city: 'Hà Nội',
      district: 'Cầu Giấy',
    },
    preferences: {
      theme: 'dark',
      language: 'vi',
    },
  })

  // SAI: Shallow copy không đủ
  const updateCityWrong = (newCity) => {
    setUser({
      ...user,
      address: user.address, // Vẫn là reference cũ!
    })
    user.address.city = newCity // Mutation
  }

  // ĐÚNG: Spread từng cấp
  const updateCity = (newCity) => {
    setUser({
      ...user,
      address: {
        ...user.address,
        city: newCity,
      },
    })
  }

  // ĐÚNG: Dùng Immer (cú pháp tự nhiên hơn)
  // import { useImmer } from 'use-immer'
  // const [user, updateUser] = useImmer(initialState)
  const updateCityWithImmer = () => {
    updateUser((draft) => {
      draft.address.city = 'TP. Hồ Chí Minh' // Immer xử lý immutability
    })
  }

  // ĐÚNG: Dùng functional update để tránh stale closure
  const updateTheme = (newTheme) => {
    setUser((prevUser) => ({
      ...prevUser,
      preferences: {
        ...prevUser.preferences,
        theme: newTheme,
      },
    }))
  }

  return (
    <div>
      <p>{user.name} - {user.address.city}</p>
      <button onClick={() => updateCity('TP. Hồ Chí Minh')}>
        Chuyển đến HCM
      </button>
    </div>
  )
}
```

### Đáp án mẫu

> Với nested state, cần spread từng cấp của object để đảm bảo immutability — spread nông chỉ copy cấp ngoài cùng. Với object sâu nhiều cấp, nên dùng thư viện Immer cho phép viết code theo kiểu mutation nhưng thực ra tạo bản sao bất biến bên dưới. Luôn dùng functional update `setState(prev => ...)` để tránh đọc state cũ (stale closure).

---

## Câu 6: Derived state là gì và những vấn đề thường gặp? `[Intermediate]`

### Câu hỏi

> Derived state là gì? Tại sao React docs khuyến cáo hạn chế dùng nó và thay thế bằng cách nào?

### Giải thích lý thuyết

**Derived state** là state được tính từ props hoặc state khác và được lưu vào state bằng `useState` hoặc `getDerivedStateFromProps`.

**Vấn đề thường gặp:**

1. **Desync (mất đồng bộ):** State nội bộ và props trở nên không nhất quán sau khi component cập nhật.
2. **Khó debug:** Logic cập nhật rải rác ở nhiều nơi.
3. **Bug với `key` reset:** Phải reset state thủ công khi props thay đổi — dễ bỏ sót.

**Nguyên tắc:** Nếu một giá trị có thể tính được từ state hoặc props hiện có, đừng lưu nó vào state — tính trực tiếp trong render.

### Code minh hoạ

```jsx
// SAI: Lưu derived value vào state — gây desync
function SearchList({ items }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredItems, setFilteredItems] = useState(items) // Không cần thiết!

  const handleSearch = (term) => {
    setSearchTerm(term)
    setFilteredItems(items.filter((item) => item.includes(term)))
    // Nếu `items` thay đổi từ props, filteredItems sẽ không tự cập nhật
  }

  return (
    <>
      <input value={searchTerm} onChange={(e) => handleSearch(e.target.value)} />
      <ul>{filteredItems.map((item) => <li key={item}>{item}</li>)}</ul>
    </>
  )
}

// ĐÚNG: Tính derived value trực tiếp trong render
function SearchListCorrect({ items }) {
  const [searchTerm, setSearchTerm] = useState('')

  // filteredItems được tính mỗi lần render — luôn đồng bộ
  const filteredItems = items.filter((item) =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Tìm kiếm..."
      />
      <ul>{filteredItems.map((item) => <li key={item}>{item}</li>)}</ul>
    </>
  )
}

// ĐÚNG: Dùng useMemo nếu tính toán nặng
function SearchListMemo({ items }) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredItems = useMemo(
    () => items.filter((item) =>
      item.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [items, searchTerm]
  )

  return (
    <>
      <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      <ul>{filteredItems.map((item) => <li key={item}>{item}</li>)}</ul>
    </>
  )
}
```

### Đáp án mẫu

> Derived state là giá trị được lưu vào state dù có thể tính trực tiếp từ props hoặc state khác. Vấn đề là nó dễ bị mất đồng bộ khi props thay đổi vì phải cập nhật thủ công. React khuyến cáo tính derived value trực tiếp trong render — nếu phép tính nặng thì dùng `useMemo` để cache. Chỉ lưu vào state những gì thực sự không thể suy ra từ dữ liệu đã có.

---

## Câu 7: Unidirectional data flow (luồng dữ liệu một chiều) trong React nghĩa là gì? `[Basic]`

### Câu hỏi

> React được biết đến với "unidirectional data flow". Điều này nghĩa là gì trong thực tế và lợi ích của nó là gì?

### Giải thích lý thuyết

**Unidirectional data flow** (luồng dữ liệu một chiều) nghĩa là dữ liệu chỉ chảy theo **một hướng duy nhất**: từ cha xuống con qua props. Con không được phép tự thay đổi props hay cập nhật state của cha trực tiếp.

**Cách hoạt động:**
```
State/Props → Component (render) → UI
     ↑                                |
     |←←← Callback (event handler) ←←←|
```

Để con ảnh hưởng đến cha, cha phải truyền xuống một **callback function** — con gọi callback để thông báo, cha quyết định có cập nhật state hay không.

**Lợi ích:**
- Dễ dự đoán: biết nguồn gốc của mọi thay đổi.
- Dễ debug: trace ngược từ UI lên state.
- Ít bug hơn so với two-way binding của Angular/Vue (mặc định).

### Code minh hoạ

```jsx
// Dữ liệu chảy từ cha → con qua props
// Sự kiện chảy từ con → cha qua callback

function ParentForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
  })

  // Cha quyết định cách cập nhật state
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    console.log('Submit:', formData)
  }

  return (
    <div>
      {/* Dữ liệu chảy xuống, callback chảy xuống */}
      <UsernameInput
        value={formData.username}
        onChange={(val) => handleChange('username', val)}
      />
      <EmailInput
        value={formData.email}
        onChange={(val) => handleChange('email', val)}
      />
      <SubmitButton
        disabled={!formData.username || !formData.email}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

// Con chỉ hiển thị và thông báo — không tự thay đổi dữ liệu
function UsernameInput({ value, onChange }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)} // Gọi callback của cha
      placeholder="Tên đăng nhập"
    />
  )
}
```

### Đáp án mẫu

> Unidirectional data flow nghĩa là dữ liệu chỉ chảy theo một chiều từ cha xuống con qua props. Con muốn thay đổi dữ liệu phải thông qua callback được cha truyền xuống — cha mới là người quyết định cập nhật state. Cách tiếp cận này giúp dễ dự đoán luồng dữ liệu, dễ debug, và tránh các bug phức tạp từ two-way binding.

---

## Câu 8: Tại sao không nên định nghĩa component bên trong component khác (inline component)? `[Intermediate]`

### Câu hỏi

> Nhiều lập trình viên hay viết component con ngay bên trong render của component cha. Vấn đề kỹ thuật là gì?

### Giải thích lý thuyết

Khi định nghĩa component bên trong component khác, **mỗi lần component cha re-render** sẽ tạo ra một **hàm/class mới hoàn toàn**. React so sánh component type bằng reference — type mới → unmount component cũ và mount lại từ đầu.

**Hệ quả:**
1. **Mất state:** Component con bị unmount và mount lại → mất toàn bộ state nội bộ.
2. **Mất focus:** Input mất focus sau mỗi lần cha re-render.
3. **Hiệu năng kém:** DOM bị hủy và tạo lại không cần thiết.
4. **Effect chạy lại:** Mọi `useEffect` trong con chạy lại dù không cần.

### Code minh hoạ

```jsx
// SAI: Định nghĩa component bên trong — tạo type mới mỗi render
function ParentBad() {
  const [count, setCount] = useState(0)

  // Hàm này được tạo lại MỖI LẦN ParentBad re-render
  function InlineInput() {
    const [text, setText] = useState('')
    return (
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Nhập vào đây..."
      />
    )
  }

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        Click: {count}
      </button>
      {/* Mỗi lần click → InlineInput unmount + mount lại → mất text đã nhập */}
      <InlineInput />
    </div>
  )
}

// ĐÚNG: Định nghĩa component ở ngoài — type ổn định giữa các render
function StandaloneInput() {
  const [text, setText] = useState('')
  return (
    <input
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder="Nhập vào đây..."
    />
  )
}

function ParentGood() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        Click: {count}
      </button>
      {/* StandaloneInput giữ nguyên type → React tái sử dụng instance */}
      <StandaloneInput />
    </div>
  )
}
```

### Đáp án mẫu

> Khi định nghĩa component bên trong component khác, mỗi lần cha re-render tạo ra một function reference mới. React nhận thấy component type thay đổi và unmount component cũ, mount lại component mới — làm mất toàn bộ state, mất focus của input, và gây hiệu năng kém. Luôn định nghĩa component ở cấp module, bên ngoài component khác.

---

## Câu 9: Cấu trúc thư mục một dự án React thường được tổ chức như thế nào? `[Basic]`

### Câu hỏi

> Không có chuẩn tuyệt đối, nhưng có những mô hình tổ chức thư mục phổ biến nào cho dự án React? Ưu nhược điểm của từng mô hình?

### Giải thích lý thuyết

Có hai triết lý chính:

**1. Group by type (theo loại file):** Tổ chức theo chức năng kỹ thuật — tất cả components vào một thư mục, tất cả hooks vào một thư mục khác.

**2. Group by feature (theo tính năng):** Tổ chức theo domain/feature — tất cả file liên quan đến một tính năng nằm cùng nhau.

| Tiêu chí | Group by Type | Group by Feature |
|---|---|---|
| Phù hợp | Dự án nhỏ, ít feature | Dự án lớn, nhiều feature |
| Tìm file | Biết loại file, tìm trong folder đó | Biết feature, tìm trong folder đó |
| Khi xoá feature | Phải dọn nhiều thư mục | Xoá một thư mục là xong |
| Coupling | Dễ phụ thuộc chéo | Khuyến khích high cohesion |

### Code minh hoạ

```jsx
// Cấu trúc Group by Type (đơn giản, cho dự án nhỏ)
// src/
//   components/
//     Button.tsx
//     Modal.tsx
//     UserCard.tsx
//   hooks/
//     useAuth.ts
//     useFetch.ts
//   pages/
//     HomePage.tsx
//     ProfilePage.tsx
//   utils/
//     formatDate.ts
//     validators.ts

// Cấu trúc Group by Feature (khuyến nghị cho dự án lớn)
// src/
//   features/
//     auth/
//       components/
//         LoginForm.tsx
//         RegisterForm.tsx
//       hooks/
//         useAuth.ts
//       services/
//         authApi.ts
//       store/
//         authSlice.ts
//       index.ts          ← Public API của feature
//     products/
//       components/
//         ProductCard.tsx
//         ProductList.tsx
//       hooks/
//         useProducts.ts
//       index.ts
//   shared/
//     components/         ← Component dùng chung giữa features
//       Button.tsx
//       Modal.tsx
//     hooks/
//       useDebounce.ts
//   pages/
//     HomePage.tsx        ← Kết hợp các features
//     ProfilePage.tsx

// Ví dụ file index.ts để kiểm soát public API
// features/auth/index.ts
export { LoginForm } from './components/LoginForm'
export { useAuth } from './hooks/useAuth'
export type { AuthUser } from './types'
// Các file nội bộ khác không export ra ngoài
```

### Đáp án mẫu

> Hai mô hình phổ biến: "group by type" nhóm file theo loại kỹ thuật (components, hooks, utils) — phù hợp dự án nhỏ; và "group by feature" nhóm tất cả file liên quan một tính năng vào cùng thư mục — phù hợp dự án lớn vì dễ maintain và xoá feature. Dự án lớn thường kết hợp: thư mục `features/` cho domain-specific code và `shared/` cho code dùng chung, mỗi feature có file `index.ts` kiểm soát public API.

---

## Câu 10: Tại sao không nên khởi tạo state từ props trực tiếp? `[Intermediate]`

### Câu hỏi

> Việc viết `useState(props.value)` để khởi tạo state từ props có vấn đề gì không? Khi nào được phép làm vậy?

### Giải thích lý thuyết

`useState(initialValue)` chỉ dùng giá trị khởi tạo **một lần duy nhất** khi component được mount lần đầu. Nếu props thay đổi sau đó, state **không tự động cập nhật** — tạo ra sự mất đồng bộ.

**Khi nào được phép:**
- Khi props chỉ là **giá trị khởi tạo ban đầu** và component được thiết kế để tự quản lý sau đó (uncontrolled component với initial value). Thường đặt tên prop là `initialXxx` để rõ ý định.
- Khi biết chắc prop sẽ không thay đổi sau mount.

**Khi không được phép:**
- Khi component cần phản ánh mọi thay đổi của prop — lúc này phải là controlled component.

### Code minh hoạu

```jsx
// SAI: Khởi tạo state từ prop có thể thay đổi
function EditableTitle({ title }) {
  // Khi `title` prop thay đổi từ bên ngoài, state này KHÔNG cập nhật
  const [editedTitle, setEditedTitle] = useState(title)

  return (
    <input
      value={editedTitle}
      onChange={(e) => setEditedTitle(e.target.value)}
    />
  )
}

// ĐÚNG: Controlled component — cha kiểm soát hoàn toàn
function EditableTitleControlled({ title, onTitleChange }) {
  return (
    <input
      value={title}
      onChange={(e) => onTitleChange(e.target.value)}
    />
  )
}

// ĐÚNG: Uncontrolled với initial value — đặt tên rõ ràng
function EditableTitleUncontrolled({ initialTitle }) {
  // Prop tên "initialTitle" — rõ ràng chỉ dùng lần đầu
  const [title, setTitle] = useState(initialTitle)

  return (
    <input
      value={title}
      onChange={(e) => setTitle(e.target.value)}
    />
  )
}

// ĐÚNG: Nếu cần reset khi prop thay đổi — dùng key
function ParentComponent() {
  const [selectedId, setSelectedId] = useState(1)

  return (
    // key thay đổi → React unmount + mount lại → state reset về initialTitle mới
    <EditableTitleUncontrolled
      key={selectedId}
      initialTitle={`Tiêu đề ${selectedId}`}
    />
  )
}

// ĐÚNG: Nếu cần đồng bộ với prop — dùng useEffect (nhưng thường là code smell)
function EditableTitleWithSync({ title }) {
  const [editedTitle, setEditedTitle] = useState(title)

  useEffect(() => {
    setEditedTitle(title) // Reset khi title prop thay đổi
  }, [title])

  return (
    <input
      value={editedTitle}
      onChange={(e) => setEditedTitle(e.target.value)}
    />
  )
}
```

### Đáp án mẫu

> `useState(props.value)` chỉ sử dụng giá trị đó một lần khi mount — sau đó state và prop sống độc lập. Nếu prop thay đổi, state không tự cập nhật gây mất đồng bộ. Được phép dùng khi prop chỉ là giá trị khởi tạo ban đầu — đặt tên `initialXxx` để rõ ý định và dùng prop `key` để reset khi cần. Nếu component phải phản ánh mọi thay đổi của prop, hãy làm controlled component thay vì lưu vào state.

---
