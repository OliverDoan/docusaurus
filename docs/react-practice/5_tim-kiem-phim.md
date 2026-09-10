---
sidebar_position: 5
title: "5. Tìm kiếm phim"
---

# Project 4: Tìm kiếm phim

Project cuối là một ứng dụng **nhiều trang** hoàn chỉnh, kết hợp mọi thứ đã học và thêm 3 kỹ thuật quan trọng của ứng dụng thật: **React Router** (điều hướng nhiều trang), **Context** (state toàn cục, không phải "truyền props qua nhiều tầng"), và tối ưu với **`useMemo`** + **debounce**. Ta xây app tìm phim với danh sách yêu thích lưu lại được.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Context giải quyết prop drilling** — `createContext` → `<Provider value>` bọc ngoài → `useContext` lấy ra; gói thành custom hook cho gọn, hợp cho dữ liệu toàn cục ít đổi.
- ⭐ **React Router quản lý nhiều trang** — `<BrowserRouter>` bọc app, `<Routes>`/`<Route>` khai báo tuyến; `path="/movie/:id"` là tham số động.
- **Chuyển trang không reload** — dùng `<Link to>` hoặc `useNavigate()` (bằng code), đừng dùng `<a href>` kẻo mất state.
- **`useParams()`** — đọc tham số động từ URL; nhớ giá trị luôn là **chuỗi** (cần `Number(id)` khi so sánh số).
- **`useMemo(fn, [deps])`** — ghi nhớ kết quả tính toán nặng, chỉ tính lại khi `deps` đổi.
- **Debounce** — timeout + cleanup (`clearTimeout`) hoãn xử lý tốn kém đến khi người dùng ngừng gõ.

:::

---

## Mục lục

- [Phân tích bài toán](#phân-tích-bài-toán)
- [Bước 1: Cài và cấu hình React Router](#bước-1-cài-và-cấu-hình-react-router)
- [Bước 2: Điều hướng giữa các trang](#bước-2-điều-hướng-giữa-các-trang)
- [Bước 3: Trang chi tiết với tham số động](#bước-3-trang-chi-tiết-với-tham-số-động)
- [Bước 4: State toàn cục với Context](#bước-4-state-toàn-cục-với-context)
- [Bước 5: Dùng Context để lưu phim yêu thích](#bước-5-dùng-context-để-lưu-phim-yêu-thích)
- [Bước 6: Tìm kiếm với debounce và useMemo](#bước-6-tìm-kiếm-với-debounce-và-usememo)
- [Thử thách mở rộng](#thử-thách-mở-rộng)
- [Tóm tắt](#tóm-tắt)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Phân tích bài toán

Sản phẩm có **3 trang**:

- **Trang chủ** (`/`) — ô tìm kiếm + lưới kết quả phim.
- **Trang chi tiết** (`/movie/:id`) — thông tin một phim cụ thể.
- **Trang yêu thích** (`/favorites`) — các phim đã lưu.

Hai vấn đề mới so với các project trước:

1. **Nhiều trang**: trang web thật có nhiều "màn hình", URL đổi theo. Tự xử lý rất rối → dùng thư viện **React Router**.
2. **State dùng chung nhiều trang**: danh sách "yêu thích" cần truy cập được ở cả trang chủ lẫn trang yêu thích. Truyền props qua nhiều tầng component rất cực ("prop drilling") → dùng **Context**.

Để tập trung vào React, ta dùng **dữ liệu phim giả** (mảng cứng) thay vì API thật. Bạn có thể thay bằng API (như project trước) ở phần thử thách.

---

## Bước 1: Cài và cấu hình React Router

Cài thư viện:

```bash
npm install react-router-dom
```

Cấu hình ở `main.jsx` — bọc toàn bộ app trong `<BrowserRouter>`:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```

`<BrowserRouter>` bật khả năng định tuyến dựa trên URL cho mọi component bên trong.

Khai báo các tuyến (route) trong `App.jsx`:

```jsx
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import MovieDetail from './pages/MovieDetail.jsx'
import Favorites from './pages/Favorites.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/movie/:id" element={<MovieDetail />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="*" element={<h1>404 - Không tìm thấy trang</h1>} />
    </Routes>
  )
}

export default App
```

Giải thích:

- **`<Routes>`** là vùng chứa mọi tuyến; nó tìm `<Route>` **khớp với URL hiện tại** và render `element` tương ứng.
- **`path="/movie/:id"`** — dấu `:id` là **tham số động**: khớp với `/movie/1`, `/movie/42`... và lấy được giá trị `id`.
- **`path="*"`** khớp mọi URL còn lại → trang 404.

Tạo trước 3 file trong `src/pages/` với nội dung tối thiểu (ví dụ `function Home() { return <h1>Trang chủ</h1> }`) để app chạy được.

---

## Bước 2: Điều hướng giữa các trang

Để chuyển trang, **không dùng thẻ `<a href>`** (sẽ tải lại cả trang, mất hết state). React Router cung cấp `<Link>`:

```jsx
import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav>
      <Link to="/">Trang chủ</Link>
      <Link to="/favorites">Yêu thích</Link>
    </nav>
  )
}
```

**`<Link to="/...">`** đổi URL và chỉ vẽ lại phần nội dung cần thiết — không tải lại trang, nên app chạy mượt như ứng dụng desktop. Đây chính là ý nghĩa của **SPA (Single Page Application)**.

Đôi khi cần chuyển trang **bằng code** (sau khi submit, sau khi đăng nhập...) thì dùng hook `useNavigate`:

```jsx
import { useNavigate } from 'react-router-dom'

function SearchBox() {
  const navigate = useNavigate()
  // ... sau khi xử lý xong:
  navigate('/favorites')   // chuyển trang bằng code
}
```

---

## Bước 3: Trang chi tiết với tham số động

Trang `/movie/:id` cần đọc `id` từ URL để biết hiển thị phim nào. Dùng hook `useParams`:

```jsx
import { useParams, Link } from 'react-router-dom'

const PHIM = [
  { id: 1, title: 'Inception', year: 2010, desc: 'Giấc mơ trong giấc mơ.' },
  { id: 2, title: 'Interstellar', year: 2014, desc: 'Hành trình xuyên không gian.' },
]

function MovieDetail() {
  const { id } = useParams()                       // lấy ":id" từ URL (là chuỗi)
  const phim = PHIM.find((p) => p.id === Number(id))

  if (!phim) return <p>Không tìm thấy phim. <Link to="/">Về trang chủ</Link></p>

  return (
    <div>
      <h1>{phim.title} ({phim.year})</h1>
      <p>{phim.desc}</p>
      <Link to="/">← Quay lại</Link>
    </div>
  )
}

export default MovieDetail
```

Hai điểm dễ sai:

- **`useParams()`** trả về object chứa các tham số động; `id` ở đây luôn là **chuỗi** (`"1"`), nên phải `Number(id)` khi so sánh với id kiểu số.
- Luôn xử lý trường hợp **không tìm thấy** (URL gõ sai id) để tránh crash.

Ở trang chủ, mỗi phim trỏ tới trang chi tiết bằng `<Link to={`/movie/${phim.id}`}>`.

---

## Bước 4: State toàn cục với Context

**Vấn đề prop drilling:** danh sách yêu thích cần dùng ở `Home` (để bấm tim) và `Favorites` (để hiển thị). Nếu để state ở `App` rồi truyền props xuống, ta phải xuyên qua nhiều tầng component trung gian *chẳng dùng tới nó* chỉ để chuyển tiếp. Càng sâu càng rối.

**Context** giải quyết bằng cách tạo một "kho dữ liệu chung" mà bất kỳ component con nào cũng lấy trực tiếp được, không cần truyền tay.

Tạo `src/FavoritesContext.jsx`:

```jsx
import { createContext, useContext, useState, useEffect } from 'react'

// 1) Tạo context
const FavoritesContext = createContext(null)

// 2) Provider: component bọc ngoài, chứa state thật và cung cấp xuống dưới
export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites))
  }, [favorites])

  const toggleFavorite = (movie) => {
    setFavorites((prev) =>
      prev.some((m) => m.id === movie.id)
        ? prev.filter((m) => m.id !== movie.id)   // đã có → bỏ
        : [...prev, movie]                         // chưa có → thêm
    )
  }

  const isFavorite = (id) => favorites.some((m) => m.id === id)

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}

// 3) Custom hook để dùng context cho gọn
export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites phải nằm trong <FavoritesProvider>')
  return ctx
}
```

Ba phần của một Context:

1. **`createContext(null)`** — tạo "đường ống" dữ liệu (giá trị mặc định `null`).
2. **`<Context.Provider value={...}>`** — component bọc ngoài, đặt giá trị chung vào `value`. Mọi component bên trong (`children`) đều đọc được giá trị này.
3. **`useContext(Context)`** — hook để component con **lấy** giá trị từ Provider gần nhất.

Ta gói thêm `useFavorites` để chỗ dùng chỉ cần gọi một hàm và có kiểm tra lỗi rõ ràng.

---

## Bước 5: Dùng Context để lưu phim yêu thích

Bọc `<App />` (hoặc toàn bộ trong `BrowserRouter`) bằng Provider để cả app dùng chung:

```jsx
// main.jsx
<BrowserRouter>
  <FavoritesProvider>
    <App />
  </FavoritesProvider>
</BrowserRouter>
```

Giờ **bất kỳ trang nào** cũng truy cập được, không cần truyền props. Ở trang chủ, nút tim:

```jsx
import { useFavorites } from '../FavoritesContext.jsx'

function MovieCard({ movie }) {
  const { toggleFavorite, isFavorite } = useFavorites()

  return (
    <div className="movie-card">
      <h3>{movie.title}</h3>
      <button onClick={() => toggleFavorite(movie)}>
        {isFavorite(movie.id) ? '❤️ Bỏ thích' : '🤍 Yêu thích'}
      </button>
    </div>
  )
}
```

Và trang yêu thích chỉ việc đọc:

```jsx
import { useFavorites } from '../FavoritesContext.jsx'

function Favorites() {
  const { favorites } = useFavorites()

  if (favorites.length === 0) return <p>Chưa có phim yêu thích nào.</p>

  return (
    <ul>
      {favorites.map((m) => <li key={m.id}>{m.title}</li>)}
    </ul>
  )
}
```

Không một dòng props nào được truyền tay giữa các trang — đó là sức mạnh của Context.

:::warning Đừng lạm dụng Context
Context hợp cho dữ liệu **toàn cục, ít đổi**: thông tin đăng nhập, theme sáng/tối, ngôn ngữ, giỏ hàng. Với state cục bộ của một component, cứ dùng `useState` bình thường. Mọi component đọc context sẽ **render lại khi value đổi**, nên nhồi quá nhiều thứ hay đổi vào một context sẽ gây chậm.
:::

---

## Bước 6: Tìm kiếm với debounce và useMemo

Thêm ô tìm kiếm lọc phim theo tên. Hai tối ưu quan trọng:

**`useMemo` — ghi nhớ kết quả tính toán nặng.** Lọc/sắp xếp danh sách lớn mỗi lần render là lãng phí nếu dữ liệu đầu vào không đổi:

```jsx
import { useState, useMemo } from 'react'

function Home() {
  const [keyword, setKeyword] = useState('')

  const ketQua = useMemo(() => {
    return PHIM.filter((p) =>
      p.title.toLowerCase().includes(keyword.toLowerCase())
    )
  }, [keyword])      // chỉ tính lại khi keyword đổi

  return (
    <div>
      <input value={keyword} onChange={(e) => setKeyword(e.target.value)} />
      {ketQua.map((p) => <MovieCard key={p.id} movie={p} />)}
    </div>
  )
}
```

`useMemo(fn, [deps])` **ghi nhớ** kết quả của `fn`; chỉ tính lại khi `deps` đổi. Nếu component render lại vì lý do khác (ví dụ Context đổi), kết quả lọc cũ được tái dùng → tiết kiệm.

**Debounce — chờ người dùng gõ xong mới xử lý.** Nếu mỗi phím gõ đều gọi API tìm kiếm thì gõ 10 chữ là 10 lần gọi. Debounce hoãn xử lý đến khi ngừng gõ một khoảng (ví dụ 400ms). Ta tạo state `keyword` "trễ" bằng `useEffect` + `setTimeout`:

```jsx
const [input, setInput] = useState('')        // gõ vào đây ngay lập tức
const [keyword, setKeyword] = useState('')     // bản trễ, dùng để lọc/gọi API

useEffect(() => {
  const timer = setTimeout(() => setKeyword(input), 400)
  return () => clearTimeout(timer)            // gõ tiếp -> huỷ timer cũ
}, [input])
```

Cơ chế: mỗi lần `input` đổi, ta hẹn giờ 400ms để cập nhật `keyword`. Nếu người dùng gõ tiếp trước khi hết giờ, **cleanup function `clearTimeout` huỷ timer cũ** và đặt timer mới. Chỉ khi ngừng gõ đủ 400ms, `keyword` mới cập nhật → việc lọc/gọi API chỉ chạy một lần. Đây là ứng dụng thực tế của cleanup đã học ở bài trước.

:::tip useMemo và debounce — khi nào cần?
Đừng tối ưu sớm. Với danh sách nhỏ, lọc trực tiếp là đủ. Chỉ dùng `useMemo` khi tính toán **thật sự nặng** hoặc dữ liệu lớn, và dùng **debounce** khi mỗi lần gõ kích hoạt việc tốn kém (gọi API, lọc hàng nghìn phần tử).
:::

---

## Thử thách mở rộng

1. **Dùng API thật**: thay mảng `PHIM` bằng API phim (ví dụ OMDb hoặc TMDB) — kết hợp `useEffect` + 3 trạng thái của bài 4.
2. **Layout chung**: tạo component layout chứa Navbar dùng `<Outlet />` của React Router để mọi trang có chung thanh điều hướng.
3. **Đếm số yêu thích trên Navbar**: hiện badge số lượng từ Context.
4. **Sắp xếp**: thêm tuỳ chọn sắp xếp theo năm/tên, bọc trong `useMemo`.
5. **Theme sáng/tối**: tạo thêm một `ThemeContext` để luyện nhiều context cùng lúc.

---

## Tóm tắt

- **React Router** quản lý nhiều trang: `<BrowserRouter>` bọc app, `<Routes>`/`<Route>` khai báo tuyến.
- Chuyển trang bằng **`<Link to>`** (không reload) hoặc **`useNavigate()`** (bằng code), đừng dùng `<a href>`.
- **`useParams()`** đọc tham số động (`:id`) từ URL — nhớ nó là **chuỗi**.
- **Context** giải quyết prop drilling: `createContext` → `<Provider value>` bọc ngoài → `useContext` lấy ra; gói thành custom hook cho gọn.
- Context hợp cho dữ liệu **toàn cục, ít đổi**; đừng lạm dụng.
- **`useMemo`** ghi nhớ kết quả tính toán nặng; **debounce** (timeout + cleanup) hoãn xử lý tốn kém đến khi người dùng ngừng gõ.

Bạn đã đi hết 4 project! Giờ bạn nắm được component, props, state, hiệu ứng, gọi API, định tuyến và state toàn cục — đủ nền tảng để tự xây ứng dụng React thật. Hãy chọn một ý tưởng của riêng mình và bắt tay làm. 🎉

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi đối chiếu lại với nội dung phía trên.

1. `SPA` (Single Page Application) là gì? Vì sao chuyển trang bằng `<Link to>` lại khác hẳn thẻ `<a href>` truyền thống?
2. React Router làm cách nào để URL trên thanh địa chỉ đổi mà trình duyệt không tải lại trang? (`History API`)
3. `<BrowserRouter>` khác `<HashRouter>` ở điểm nào? Khi deploy lên hosting tĩnh mà refresh trang con bị 404 thì nguyên nhân là gì và sửa ra sao?
4. Route `path="*"` dùng để làm gì? Thứ tự khai báo các `<Route>` có ảnh hưởng tới việc khớp URL không?
5. `useParams()` trả về cái gì và kiểu dữ liệu của tham số động là gì? Vì sao phải `Number(id)` trước khi so sánh?
6. Khi nào dùng `<Link>`, khi nào dùng `useNavigate()`? Cho một tình huống mà `<Link>` không đáp ứng được.
7. `prop drilling` là gì? Kể ít nhất ba cách khắc phục và đánh đổi của từng cách.
8. Ba thành phần của một Context là gì? Giải thích luồng dữ liệu từ `createContext` tới `useContext`.
9. Vì sao nên gói `useContext` vào một custom hook và `throw` lỗi khi giá trị là `null`? Nếu không làm vậy thì bug sẽ biểu hiện thế nào?
10. Context có thay thế được `Redux` / `Zustand` không? Context giải quyết bài toán gì và KHÔNG giải quyết bài toán gì?
11. Vì sao mọi component đọc context đều render lại khi `value` đổi? Truyền object literal trực tiếp vào `value` gây hậu quả gì và khắc phục ra sao (`useMemo`, tách nhỏ context)?
12. So sánh `useMemo`, `useCallback` và `React.memo`: mỗi cái ghi nhớ thứ gì và phối hợp với nhau thế nào?
13. Khi nào `useMemo` là vô ích hoặc thậm chí gây hại? Chi phí ẩn của việc memo hoá là gì?
14. `debounce` khác `throttle` ra sao? Với ô tìm kiếm, nút submit chống double-click, và sự kiện `scroll` — bạn chọn cái nào cho từng trường hợp?
15. Giải thích cơ chế debounce bằng `useEffect` + `setTimeout`: vì sao bắt buộc phải `clearTimeout` trong hàm cleanup? Bỏ cleanup đi thì hành vi sai thế nào?
16. Vì sao lưu `timer id` bằng `useState` là sai, và vì sao React khuyên dùng `useRef` cho mục đích này?
17. Nếu debounce dùng để gọi API thật, làm sao xử lý `race condition` khi phản hồi về không đúng thứ tự? (`AbortController`, cờ `ignore`)
18. Vì sao cần hai state `input` và `keyword` riêng biệt? Dùng một state duy nhất thì hỏng ở chỗ nào?
19. Đọc `localStorage` bằng lazy initializer `useState(() => ...)` khác gì đọc trực tiếp `useState(JSON.parse(...))`? Đoạn code này chạy trên môi trường `SSR` sẽ gặp vấn đề gì?
20. `StrictMode` khiến effect chạy hai lần ở môi trường dev — điều đó ảnh hưởng thế nào tới debounce và tới việc gọi API, và vì sao React cố tình làm vậy?
