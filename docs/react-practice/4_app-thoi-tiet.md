---
sidebar_position: 4
title: "4. App Thời tiết"
---

# Project 3: App Thời tiết

Ứng dụng thật gần như luôn phải **lấy dữ liệu từ internet**. Project này dạy bạn gọi API với `fetch`, xử lý đầy đủ **3 trạng thái** (đang tải / thành công / lỗi), và đóng gói logic thành **custom hook** để tái sử dụng. Ta dùng API thời tiết miễn phí **Open-Meteo** (không cần API key).

---

:::note[Ghi nhớ nhanh]

- ⭐ **Gọi API luôn quản lý 3 state** — `data`, `loading`, `error`; render `loading`/`error` trước khi chạm vào `data` để tránh crash "Cannot read properties of null".
- ⭐ **Đặt fetch đúng chỗ** — gọi lúc mở trang/khi giá trị đổi thì dùng `useEffect`; do người dùng kích hoạt (click, submit) thì gọi trong hàm xử lý sự kiện.
- **Không gắn `async` thẳng lên hàm `useEffect`** — định nghĩa hàm `async` bên trong rồi gọi nó.
- **`fetch` không tự ném lỗi 4xx/5xx** — phải tự kiểm tra `res.ok` và `throw`; dùng `try/catch/finally`.
- **Custom hook (`useXxx`)** — gói logic tái sử dụng, tách khỏi giao diện; tên bắt buộc bắt đầu bằng `use`.
- **Cleanup function** — hàm `return` trong `useEffect` chống race condition và dọn tài nguyên (timer, subscription).

:::

---

## Mục lục

- [Phân tích bài toán](#phân-tích-bài-toán)
- [Bước 1: Gọi API khi mở trang với useEffect](#bước-1-gọi-api-khi-mở-trang-với-useeffect)
- [Bước 2: Ba trạng thái — loading, error, data](#bước-2-ba-trạng-thái--loading-error-data)
- [Bước 3: Hiển thị dữ liệu thời tiết](#bước-3-hiển-thị-dữ-liệu-thời-tiết)
- [Bước 4: Tìm kiếm theo thành phố](#bước-4-tìm-kiếm-theo-thành-phố)
- [Bước 5: Đóng gói thành custom hook](#bước-5-đóng-gói-thành-custom-hook)
- [Bước 6: Dọn dẹp với cleanup function](#bước-6-dọn-dẹp-với-cleanup-function)
- [Thử thách mở rộng](#thử-thách-mở-rộng)
- [Tóm tắt](#tóm-tắt)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Phân tích bài toán

Sản phẩm: nhập tên thành phố → hiển thị nhiệt độ hiện tại.

Gọi API là việc **bất đồng bộ** (asynchronous): ta gửi yêu cầu rồi **phải chờ** mạng phản hồi, có thể mất vài giây và có thể **thất bại** (mất mạng, sai địa chỉ). Vì vậy giao diện luôn cần thể hiện 3 trạng thái:

- **Loading** — đang chờ phản hồi (hiện "Đang tải...").
- **Success** — có dữ liệu (hiện kết quả).
- **Error** — thất bại (hiện thông báo lỗi).

Khái niệm cốt lõi: gọi API là **side effect** → đặt trong `useEffect`; quản lý 3 state riêng (`data`, `loading`, `error`).

API ta dùng gồm 2 bước: đổi tên thành phố → toạ độ (Geocoding), rồi toạ độ → thời tiết.

---

## Bước 1: Gọi API khi mở trang với useEffect

Vì sao gọi API phải đặt trong `useEffect`? Vì nếu gọi thẳng trong thân component, mỗi lần render sẽ gọi lại → khi `setData` làm component render lại → lại gọi API → **vòng lặp vô tận**. `useEffect` với `[]` đảm bảo chỉ gọi **một lần** sau lần render đầu.

Tạo `src/Weather.jsx`, thử lấy thời tiết Hà Nội (toạ độ cố định trước):

```jsx
import { useState, useEffect } from 'react'

function Weather() {
  const [data, setData] = useState(null)

  useEffect(() => {
    const url =
      'https://api.open-meteo.com/v1/forecast?latitude=21.02&longitude=105.84&current=temperature_2m'

    fetch(url)
      .then((res) => res.json())
      .then((json) => setData(json))
  }, [])   // [] → chỉ chạy 1 lần khi mở trang

  return <pre>{JSON.stringify(data, null, 2)}</pre>
}

export default Weather
```

Giải thích chuỗi `fetch`:

- **`fetch(url)`** gửi yêu cầu HTTP, trả về một **Promise** (lời hứa sẽ có kết quả trong tương lai).
- **`.then(res => res.json())`** — khi có phản hồi, đọc và phân tích nội dung JSON (cũng là bất đồng bộ nên trả Promise tiếp).
- **`.then(json => setData(json))`** — khi đã có object JSON, lưu vào state.

`<pre>{JSON.stringify(data, null, 2)}</pre>` chỉ để xem thô dữ liệu trả về — luôn làm bước này để biết cấu trúc dữ liệu trước khi hiển thị đẹp.

---

## Bước 2: Ba trạng thái — loading, error, data

Code trên chưa xử lý chờ và lỗi. Ta dùng `async/await` cho dễ đọc và thêm `loading`, `error`:

```jsx
import { useState, useEffect } from 'react'

function Weather() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const layThoiTiet = async () => {
      setLoading(true)
      setError(null)
      try {
        const url =
          'https://api.open-meteo.com/v1/forecast?latitude=21.02&longitude=105.84&current=temperature_2m'
        const res = await fetch(url)

        if (!res.ok) {
          throw new Error('Không lấy được dữ liệu (mã ' + res.status + ')')
        }

        const json = await res.json()
        setData(json)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    layThoiTiet()
  }, [])

  if (loading) return <p>Đang tải...</p>
  if (error) return <p style={{ color: 'red' }}>Lỗi: {error}</p>
  return <pre>{JSON.stringify(data, null, 2)}</pre>
}

export default Weather
```

Những điểm quan trọng:

- **`async/await`** là cách viết bất đồng bộ gọn hơn `.then()`. `await fetch(...)` nghĩa là "chờ có kết quả rồi mới chạy tiếp".
- **Không đặt `async` trực tiếp lên hàm của `useEffect`.** Hàm effect không được trả về Promise. Vì vậy ta định nghĩa hàm `async` *bên trong* (`layThoiTiet`) rồi gọi nó.
- **`if (!res.ok)`** — `fetch` **không tự coi lỗi 404/500 là lỗi**; nó chỉ ném lỗi khi mất mạng. Phải tự kiểm tra `res.ok` và `throw` thủ công.
- **`try/catch/finally`**: lỗi rơi vào `catch` để lưu `error`; `finally` luôn chạy để tắt `loading` dù thành công hay thất bại.
- **Thứ tự render quan trọng**: kiểm tra `loading` và `error` *trước*, chỉ khi qua hết mới hiển thị `data`. Tránh lỗi "đọc thuộc tính của null" khi data chưa về.

:::warning Bẫy "Cannot read properties of null"
Vì `data` ban đầu là `null`, nếu bạn render `data.current.temperature_2m` ngay sẽ crash. Luôn xử lý `loading`/`error`/`null` trước khi chạm vào dữ liệu.
:::

---

## Bước 3: Hiển thị dữ liệu thời tiết

Sau khi xem cấu trúc JSON, ta biết nhiệt độ nằm ở `data.current.temperature_2m`. Hiển thị đẹp:

```jsx
return (
  <div className="weather-card">
    <h2>Thời tiết hiện tại</h2>
    <p className="temp">{data.current.temperature_2m}°C</p>
  </div>
)
```

Giờ giao diện đã có ý nghĩa thay vì JSON thô.

---

## Bước 4: Tìm kiếm theo thành phố

Thêm ô nhập tên thành phố. Ta cần 2 lần gọi API: tên → toạ độ, rồi toạ độ → thời tiết.

```jsx
import { useState } from 'react'

function Weather() {
  const [city, setCity] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const timKiem = async (e) => {
    e.preventDefault()
    if (!city.trim()) return

    setLoading(true)
    setError(null)
    setData(null)
    try {
      // 1) Tên thành phố -> toạ độ
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
      )
      const geo = await geoRes.json()
      if (!geo.results || geo.results.length === 0) {
        throw new Error('Không tìm thấy thành phố này')
      }
      const { latitude, longitude, name } = geo.results[0]

      // 2) Toạ độ -> thời tiết
      const wRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`
      )
      if (!wRes.ok) throw new Error('Không lấy được thời tiết')
      const w = await wRes.json()

      setData({ name, temp: w.current.temperature_2m })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={timKiem}>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Nhập tên thành phố..."
        />
        <button type="submit">Tìm</button>
      </form>

      {loading && <p>Đang tải...</p>}
      {error && <p style={{ color: 'red' }}>Lỗi: {error}</p>}
      {data && (
        <div className="weather-card">
          <h2>{data.name}</h2>
          <p>{data.temp}°C</p>
        </div>
      )}
    </div>
  )
}

export default Weather
```

Lần này gọi API **khi submit** (do người dùng kích hoạt), không phải khi mở trang, nên ta đặt logic trong hàm `timKiem` thay vì `useEffect`. Đây là khác biệt quan trọng:

- **Gọi API lúc mở trang / khi một giá trị đổi** → dùng `useEffect`.
- **Gọi API do hành động người dùng** (click, submit) → gọi thẳng trong hàm xử lý sự kiện.

**`encodeURIComponent(city)`** mã hoá tên thành phố cho an toàn trên URL (xử lý dấu cách, ký tự đặc biệt).

---

## Bước 5: Đóng gói thành custom hook

Logic gọi API khá dài và lặp lại ở nhiều nơi. React cho phép **tự tạo Hook** để gói logic tái sử dụng — đó chỉ là một hàm tên bắt đầu bằng `use` và dùng được các hook khác bên trong.

Tạo `src/useWeather.js`:

```jsx
import { useState } from 'react'

export function useWeather() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchWeather = async (city) => {
    if (!city.trim()) return
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
      )
      const geo = await geoRes.json()
      if (!geo.results?.length) throw new Error('Không tìm thấy thành phố này')

      const { latitude, longitude, name } = geo.results[0]
      const wRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`
      )
      if (!wRes.ok) throw new Error('Không lấy được thời tiết')
      const w = await wRes.json()

      setData({ name, temp: w.current.temperature_2m })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, fetchWeather }
}
```

Giờ component trở nên **rất gọn** — chỉ lo giao diện, mọi logic giao cho hook:

```jsx
import { useState } from 'react'
import { useWeather } from './useWeather'

function Weather() {
  const [city, setCity] = useState('')
  const { data, loading, error, fetchWeather } = useWeather()

  const onSubmit = (e) => {
    e.preventDefault()
    fetchWeather(city)
  }

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input value={city} onChange={(e) => setCity(e.target.value)} />
        <button type="submit">Tìm</button>
      </form>
      {loading && <p>Đang tải...</p>}
      {error && <p style={{ color: 'red' }}>Lỗi: {error}</p>}
      {data && <p>{data.name}: {data.temp}°C</p>}
    </div>
  )
}

export default Weather
```

Lợi ích của custom hook:
- **Tách logic khỏi giao diện** → component dễ đọc, dễ kiểm thử.
- **Tái sử dụng**: bất kỳ component nào cần thời tiết chỉ việc `useWeather()`.

:::info Quy tắc đặt tên hook
Custom hook **bắt buộc** bắt đầu bằng `use` (`useWeather`, `useFetch`...). Đây không chỉ là quy ước — công cụ lint của React dựa vào tiền tố `use` để kiểm tra bạn dùng hook đúng luật.
:::

---

## Bước 6: Dọn dẹp với cleanup function

Một vấn đề thực tế: nếu người dùng tìm liên tục nhiều thành phố, các yêu cầu cũ có thể trả về **sau** yêu cầu mới và ghi đè kết quả sai (gọi là *race condition*). Khi gọi API trong `useEffect` theo một giá trị đổi, ta xử lý bằng **hàm dọn dẹp (cleanup)**.

Ví dụ tự động lấy thời tiết mỗi khi `city` đổi:

```jsx
useEffect(() => {
  let huy = false                       // cờ đánh dấu effect này đã bị thay thế

  const layDuLieu = async () => {
    const res = await fetch(url)
    const json = await res.json()
    if (!huy) {                         // chỉ cập nhật nếu effect chưa bị huỷ
      setData(json)
    }
  }
  layDuLieu()

  return () => {
    huy = true                          // cleanup: chạy khi city đổi hoặc unmount
  }
}, [city])
```

Giải thích **cleanup function** — hàm bạn `return` bên trong `useEffect`:

- React gọi nó **trước khi chạy effect lần tiếp theo** (khi `city` đổi) và khi component **bị gỡ khỏi màn hình** (unmount).
- Ở đây ta đặt cờ `huy = true`, nên khi kết quả của một yêu cầu cũ trả về muộn, điều kiện `if (!huy)` chặn không cho nó ghi đè dữ liệu mới.

Cleanup function cũng là nơi **gỡ timer, huỷ subscription, đóng kết nối** — bất cứ thứ gì effect đã mở ra cần được dọn để tránh rò rỉ bộ nhớ.

:::tip AbortController (nâng cao)
Cách "xịn" hơn để thực sự **huỷ** yêu cầu mạng đang chạy là dùng `AbortController` và gọi `controller.abort()` trong cleanup. Cờ boolean ở trên đủ dùng cho người mới; ghi nhớ `AbortController` để tìm hiểu sau.
:::

---

## Thử thách mở rộng

1. **Thêm thông tin**: hiển thị thêm độ ẩm, tốc độ gió (thêm `relative_humidity_2m,wind_speed_10m` vào tham số `current`).
2. **Lịch sử tìm kiếm**: lưu các thành phố đã tra vào state mảng và hiển thị bên dưới.
3. **Nút tìm lại**: thêm nút "Làm mới" gọi lại API cho thành phố hiện tại.
4. **Icon theo thời tiết**: dùng `weather_code` từ API để hiện emoji ☀️ 🌧️ ⛅.
5. **Generic `useFetch`**: viết hook tổng quát `useFetch(url)` nhận URL bất kỳ, trả về `{ data, loading, error }`.

---

## Tóm tắt

- Gọi API là **bất đồng bộ** → luôn quản lý đủ **3 state**: `data`, `loading`, `error`.
- Gọi API **lúc mở trang/khi giá trị đổi** → đặt trong `useEffect`; **do người dùng kích hoạt** → gọi trong hàm xử lý sự kiện.
- Không gắn `async` thẳng lên hàm `useEffect`; định nghĩa hàm `async` bên trong rồi gọi.
- `fetch` **không tự ném lỗi** với mã 4xx/5xx → tự kiểm tra `res.ok` và `throw`.
- Dùng `try/catch/finally`; render `loading`/`error` **trước** khi chạm vào `data`.
- **Custom hook** (`useXxx`) gói logic tái sử dụng, tách khỏi giao diện.
- **Cleanup function** trong `useEffect` chống race condition và dọn tài nguyên (timer, subscription).

Project cuối kết hợp tất cả với nhiều trang và state toàn cục: [Tìm kiếm phim](./5_tim-kiem-phim.md).

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi đối chiếu lại với nội dung phía trên.

1. Vì sao không gọi `fetch` thẳng trong thân component? Mô tả vòng lặp vô tận xảy ra như thế nào.
2. Khi nào đặt lệnh gọi API trong `useEffect`, khi nào gọi trong hàm xử lý sự kiện? Cho ví dụ cho mỗi trường hợp.
3. Vì sao không viết `useEffect(async () => ...)`? Hàm truyền vào `useEffect` được phép trả về cái gì?
4. `fetch` có tự ném lỗi khi server trả 404 hay 500 không? Xử lý đúng gồm những bước nào?
5. Vì sao cần đủ ba state `data`, `loading`, `error`? Điều gì xảy ra nếu render `data` trước khi kiểm tra `loading`?
6. Vai trò của khối `finally` trong `try/catch/finally` khi tắt trạng thái loading là gì? Nếu đặt `setLoading(false)` trong `try` thì hỏng ở đâu?
7. `Race condition` khi gọi API là gì? Mô tả kịch bản người dùng gõ nhanh hai từ khoá và kết quả hiển thị bị sai.
8. Cleanup function của `useEffect` chạy vào những thời điểm nào? Nó chống race condition bằng cơ chế nào (cờ `ignore` / `isActive`)?
9. `AbortController` khác gì với cách dùng cờ bỏ qua kết quả? Khi nào nên dùng cái nào, và cái nào thực sự huỷ được request?
10. Mảng dependency của `useEffect` gọi API nên chứa những gì? Nếu để trống trong khi effect đọc một biến state thì bug gì xảy ra?
11. `StrictMode` gọi effect hai lần ở môi trường dev khiến API bị gọi đôi — bạn giải thích hiện tượng này thế nào và có nên "sửa" bằng cách bỏ `StrictMode` không?
12. `Custom hook` là gì? Quy tắc tên bắt đầu bằng `use` phục vụ điều gì về mặt lint và Rules of Hooks?
13. Tách logic fetch vào `useWeather` mang lại lợi ích gì? Hai component cùng gọi hook đó có dùng chung state không?
14. Rules of Hooks: vì sao không được gọi hook bên trong `if` hay vòng lặp? Điều gì hỏng bên trong React nếu vi phạm?
15. Khi nào nên chuyển sang thư viện như TanStack Query hay SWR thay vì tự viết `useFetch`? Chúng giải quyết thêm những vấn đề gì (cache, dedupe, retry, revalidate)?
16. Nếu API cần key bí mật thì để key ở đâu? Vì sao nhúng thẳng vào code React chạy trên trình duyệt là sai?
17. Xử lý ra sao khi người dùng tìm một thành phố không tồn tại và API trả về kết quả rỗng chứ không phải lỗi HTTP?
18. Bài này gọi hai API nối tiếp (geocoding rồi thời tiết) — điều đó tạo ra `request waterfall` thế nào, và có cách nào giảm độ trễ?
19. Người dùng bấm nút tìm liên tục nhiều lần thì sao? `debounce` và huỷ request cũ giúp gì ở đây?
