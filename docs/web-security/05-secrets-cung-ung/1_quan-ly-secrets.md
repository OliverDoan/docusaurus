---
sidebar_position: 1
title: "1. Quản lý Secrets & Rate Limiting"
---

# Quản lý Secrets & Rate Limiting

Bài này gộp hai chủ đề vận hành quan trọng: **quản lý secret** (khoá API, mật
khẩu DB, token...) — đừng để chúng lọt vào mã nguồn; và **rate limiting** (giới
hạn tần suất) — chống brute-force, lạm dụng và một phần DoS. Cả hai đều là biện
pháp đơn giản nhưng cứu bạn khỏi nhiều sự cố lớn.

---

## Mục lục

- [Secret là gì và rủi ro khi lộ](#secret-là-gì-và-rủi-ro-khi-lộ)
- [Quy tắc quản lý secret](#quy-tắc-quản-lý-secret)
- [Biến môi trường & file .env](#biến-môi-trường--file-env)
- [Khi secret lỡ bị commit](#khi-secret-lỡ-bị-commit)
- [Rate limiting](#rate-limiting)
- [Tóm tắt](#tóm-tắt)

---

## Secret là gì và rủi ro khi lộ

**Secret** là bất kỳ giá trị nhạy cảm nào dùng để truy cập tài nguyên: khoá API,
mật khẩu DB, JWT secret, token bên thứ ba, khoá riêng (private key)...

Lộ secret = kẻ tấn công có thể truy cập trực tiếp tài nguyên của bạn (đọc DB, gọi
API tính phí, giả mạo token). Nguồn rò rỉ phổ biến nhất: **hardcode secret vào mã
nguồn rồi đẩy lên Git** — bot quét GitHub tìm thấy chỉ trong vài phút.

## Quy tắc quản lý secret

:::danger Không bao giờ hardcode secret
```js
// SAI: secret nằm thẳng trong code → lọt vào Git → lộ
const apiKey = 'sk-proj-abc123...'
const dbUrl = 'postgres://user:password@host/db'
```
:::

```js
// ĐÚNG: đọc từ biến môi trường, và kiểm tra tồn tại lúc khởi động
const apiKey = process.env.OPENAI_API_KEY
if (!apiKey) {
  throw new Error('Thiếu biến môi trường OPENAI_API_KEY')
}
```

Nguyên tắc cốt lõi:

- **Không hardcode** secret trong mã nguồn — dùng **biến môi trường** hoặc **trình
  quản lý secret** (AWS Secrets Manager, Vault, Doppler...).
- **Không commit** file chứa secret — luôn thêm `.env` vào `.gitignore`.
- **Validate khi khởi động** — thiếu secret bắt buộc thì dừng sớm, đừng chạy nửa
  vời.
- **Phân tách theo môi trường** — secret dev/staging/production khác nhau.
- **Xoay (rotate) secret định kỳ** và ngay khi nghi ngờ bị lộ.
- **Đặc quyền tối thiểu** — mỗi khoá chỉ có đúng quyền cần thiết.

## Biến môi trường & file .env

Mẫu phổ biến: lưu giá trị thật trong `.env` (chỉ ở máy local/server, **không**
commit), và commit một `.env.example` làm mẫu (không chứa giá trị thật).

```bash
# .gitignore — luôn loại trừ file env thật
.env
.env.local
.env.*.local
```

```bash
# .env.example — commit được, chỉ là mẫu rỗng
DATABASE_URL=
JWT_SECRET=
OPENAI_API_KEY=
```

:::warning Biến môi trường ở frontend KHÔNG bí mật
Mọi giá trị nhúng vào bundle frontend (vd `NEXT_PUBLIC_*` trong Next.js,
`VITE_*` trong Vite) đều **gửi tới trình duyệt** → ai cũng xem được. **Không bao
giờ** đặt secret thật vào biến môi trường phía client. Secret nhạy cảm chỉ được
dùng ở **server**.
:::

## Khi secret lỡ bị commit

Nếu secret đã bị đẩy lên Git, **xoá dòng code thôi là chưa đủ** — nó vẫn nằm trong
lịch sử commit và mọi bản clone.

Việc cần làm ngay:

1. **Xoay (rotate) secret ngay lập tức** — coi như đã bị lộ; tạo khoá mới, vô hiệu
   khoá cũ. *Đây là bước quan trọng nhất.*
2. Gỡ secret khỏi lịch sử Git (vd `git filter-repo`, BFG) nếu cần.
3. Rà soát log truy cập xem khoá cũ có bị lạm dụng chưa.
4. Bổ sung quét secret tự động (xem bài sau) để ngừa tái diễn.

> Nhớ: lịch sử Git là vĩnh viễn và dễ sao chép. **Xoay khoá** mới thực sự giải
> quyết, chứ không phải xoá file.

## Rate limiting

**Rate limiting** (giới hạn tần suất) giới hạn số request mỗi client được gửi
trong một khoảng thời gian. Tác dụng bảo mật:

- Chống **brute-force** mật khẩu/OTP (xem bài Authentication).
- Chống **lạm dụng API** (cào dữ liệu, spam).
- Giảm nhẹ một phần **DoS** (làm quá tải dịch vụ).

```js
// express-rate-limit: giới hạn endpoint đăng nhập
const rateLimit = require('express-rate-limit')

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // cửa sổ 15 phút
  max: 5,                   // tối đa 5 lần thử / IP / cửa sổ
  message: 'Quá nhiều lần thử. Vui lòng thử lại sau.',
  standardHeaders: true,
})

app.post('/login', loginLimiter, loginHandler)
```

Lưu ý thực tế:

- **Siết mạnh** các endpoint nhạy cảm (đăng nhập, quên mật khẩu, OTP, gửi email).
- Giới hạn theo **IP và/hoặc tài khoản**; cân nhắc người dùng sau **proxy/NAT**
  dùng chung IP.
- Khi chạy nhiều máy, dùng **store chung** (Redis) để đếm chính xác.
- Trả mã **429 Too Many Requests** và header cho client biết khi nào thử lại.

> Rate limiting thường đi kèm **khoá tạm** sau nhiều lần sai và **MFA** để tạo
> phòng thủ nhiều lớp cho khâu đăng nhập.

## Tóm tắt

- **Secret** (khoá API, mật khẩu DB, token) lộ ra là thảm hoạ; nguồn rò rỉ số một
  là **hardcode rồi đẩy lên Git**.
- Quy tắc: **không hardcode**, dùng **biến môi trường / secret manager**, không
  commit `.env`, validate khi khởi động, **xoay secret** định kỳ, đặc quyền tối
  thiểu.
- **Biến môi trường frontend KHÔNG bí mật** — secret thật chỉ ở server.
- Lỡ commit secret → **xoay khoá ngay** (xoá file là chưa đủ vì lịch sử Git tồn
  tại mãi).
- **Rate limiting** chống brute-force/lạm dụng/DoS; siết mạnh endpoint nhạy cảm,
  dùng Redis khi scale, trả **429**.

Bài tiếp theo: **Dependency & Supply Chain** — rủi ro từ thư viện bên thứ ba.
