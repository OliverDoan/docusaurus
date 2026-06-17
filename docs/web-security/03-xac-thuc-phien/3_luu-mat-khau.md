---
sidebar_position: 3
title: "3. Lưu mật khẩu an toàn"
---

# Lưu mật khẩu an toàn

Một trong những sai lầm bảo mật tệ nhất là **lưu mật khẩu sai cách**. Khi cơ sở
dữ liệu bị rò rỉ (chuyện xảy ra thường xuyên), cách bạn lưu mật khẩu quyết định
toàn bộ tài khoản có bị chiếm hay không. Bài này giải thích **hashing** đúng cách
với thuật toán chuyên dụng (bcrypt, argon2), khái niệm **salt**, và những điều
tuyệt đối tránh.

---

## Mục lục

- [Tuyệt đối không làm](#tuyệt-đối-không-làm)
- [Hashing vs Mã hoá](#hashing-vs-mã-hoá)
- [Vì sao không dùng MD5/SHA-256?](#vì-sao-không-dùng-md5sha-256)
- [Salt — chống bảng tra cứu](#salt--chống-bảng-tra-cứu)
- [Dùng bcrypt / argon2](#dùng-bcrypt--argon2)
- [Chính sách mật khẩu](#chính-sách-mật-khẩu)
- [Tóm tắt](#tóm-tắt)

---

## Tuyệt đối không làm

:::danger Ba điều cấm kỵ
1. **Lưu mật khẩu dạng plaintext** (văn bản thường) — DB rò rỉ là lộ hết tài
   khoản, và người dùng thường dùng chung mật khẩu cho nhiều nơi.
2. **Mã hoá mật khẩu** (encrypt) — vì mã hoá *giải ngược được*; ai có khoá là đọc
   được. Mật khẩu phải **hash**, không phải encrypt.
3. **Hash bằng MD5/SHA-1/SHA-256 trần** — quá nhanh, dễ bị bẻ (xem bên dưới).
:::

## Hashing vs Mã hoá

| | Hashing (băm) | Encryption (mã hoá) |
| --- | --- | --- |
| Chiều | **Một chiều** — không giải ngược | Hai chiều — giải ngược được bằng khoá |
| Dùng cho mật khẩu? | ✅ Đúng | ❌ Sai |
| Kiểm tra ra sao | Hash lại input rồi so sánh | Giải mã rồi so sánh |

Cơ chế đúng cho mật khẩu:

```text
Đăng ký:   mật khẩu → hash → lưu HASH vào DB (không lưu mật khẩu)
Đăng nhập: mật khẩu nhập → hash lại → so với HASH đã lưu → khớp thì đúng
```

> Server **không bao giờ cần biết mật khẩu thật**. Nó chỉ cần biết "hash của mật
> khẩu nhập vào có khớp hash đã lưu không".

## Vì sao không dùng MD5/SHA-256?

MD5, SHA-1, SHA-256 là hàm băm **đa dụng**, thiết kế để **chạy cực nhanh**. Đó
chính là vấn đề: kẻ tấn công có thể thử **hàng tỷ mật khẩu mỗi giây** trên GPU để
dò ngược (brute-force), cộng thêm **rainbow table** (bảng tra cứu hash dựng sẵn).

Mật khẩu cần thuật toán **cố tình chậm** và tốn tài nguyên, để mỗi lần thử đắt đỏ
với kẻ tấn công — đó là **bcrypt, scrypt, argon2**.

## Salt — chống bảng tra cứu

**Salt** là một chuỗi ngẫu nhiên **duy nhất cho mỗi mật khẩu**, được trộn vào
trước khi hash. Tác dụng:

- Hai người dùng cùng mật khẩu sẽ có **hash khác nhau** → không nhận ra trùng.
- Vô hiệu hoá **rainbow table** (bảng dựng sẵn không tính tới salt ngẫu nhiên).

> Tin tốt: các thư viện như **bcrypt/argon2 tự sinh salt** và **nhúng salt vào
> chuỗi hash** kết quả. Bạn **không cần tự quản salt** — chỉ cần dùng đúng thư
> viện.

## Dùng bcrypt / argon2

```js
// bcrypt — phổ biến, dễ dùng
import bcrypt from 'bcrypt'

// Đăng ký: hash mật khẩu (số "vòng" càng cao càng chậm/an toàn; 10–12 là hợp lý)
const passwordHash = await bcrypt.hash(plainPassword, 12)
// → lưu passwordHash vào DB (salt đã nằm sẵn trong chuỗi này)

// Đăng nhập: so sánh an toàn (không tự so chuỗi)
const ok = await bcrypt.compare(plainPassword, passwordHash)
if (!ok) throw new Error('Email hoặc mật khẩu sai')
```

```js
// argon2 — hiện đại, thắng giải Password Hashing Competition; được khuyến nghị
import argon2 from 'argon2'

const passwordHash = await argon2.hash(plainPassword) // tự lo salt + tham số mạnh
const ok = await argon2.verify(passwordHash, plainPassword)
```

:::tip Chọn cái nào?
**argon2** (cụ thể `argon2id`) là khuyến nghị hiện đại nhất. **bcrypt** vẫn an
toàn và rất phổ biến, dễ tích hợp. Cả hai đều tốt hơn nhiều so với SHA. Điều quan
trọng nhất: **dùng một thuật toán chuyên dụng cho mật khẩu**, đừng tự chế.
:::

## Chính sách mật khẩu

Theo hướng dẫn hiện đại (NIST):

- **Ưu tiên độ dài** hơn quy tắc phức tạp — câu mật khẩu (passphrase) dài tốt hơn
  "P@ss1!" ngắn. Đặt tối thiểu ~8–12 ký tự.
- **Kiểm tra mật khẩu lộ** — chặn các mật khẩu phổ biến / đã xuất hiện trong các
  vụ rò rỉ.
- **Không bắt đổi mật khẩu định kỳ vô cớ** — chỉ buộc đổi khi nghi ngờ bị lộ.
- **Cho phép dán & hiển thị mật khẩu** — hỗ trợ trình quản lý mật khẩu.
- **Khuyến khích/bắt buộc MFA** cho tài khoản quan trọng (xem bài Authentication).

## Tóm tắt

- **Không** lưu plaintext, **không** mã hoá (encrypt), **không** dùng MD5/SHA trần
  cho mật khẩu.
- Mật khẩu phải được **hash một chiều** bằng thuật toán **cố tình chậm**:
  **argon2** (khuyến nghị) hoặc **bcrypt**.
- **Salt** (ngẫu nhiên, mỗi mật khẩu một salt) chống rainbow table — bcrypt/argon2
  **tự lo salt** cho bạn.
- Đăng nhập: **hash lại rồi so sánh** bằng hàm `compare`/`verify` của thư viện.
- Chính sách: ưu tiên **độ dài**, chặn mật khẩu đã lộ, không ép đổi vô cớ, khuyến
  khích **MFA**.

Hết mục Xác thực & Phiên. Mục tiếp theo: **Transport & Headers** (HTTPS, CORS,
security headers, CSP).
