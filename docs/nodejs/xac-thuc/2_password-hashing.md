---
sidebar_position: 2
title: "2. Password Hashing"
---

# Password Hashing

Password hashing là việc biến mật khẩu thành một chuỗi mã hoá một chiều trước khi lưu vào database, để không ai đọc được mật khẩu gốc kể cả khi dữ liệu bị lộ. Bài này hướng dẫn dùng bcrypt để hash và so sánh mật khẩu, chọn salt rounds phù hợp, tích hợp với Mongoose và kiểm tra độ mạnh mật khẩu. Đây là bước bắt buộc để bảo vệ tài khoản người dùng.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Không bao giờ lưu mật khẩu dạng thô** — luôn hash một chiều bằng `bcrypt` trước khi lưu để bảo vệ khi database bị lộ.
- **bcrypt có salt + cố ý chậm** — salt ngẫu nhiên chống rainbow table, cost factor chống brute-force (MD5/SHA nhanh nên không an toàn).
- **Salt rounds >= 12** — cân bằng bảo mật và tốc độ (~300ms), nâng dần theo thời gian khi phần cứng mạnh hơn.
- **`bcrypt.compare` khi đăng nhập** — so sánh mật khẩu với hash, không tự giải mã.
- **Tích hợp Mongoose** — dùng hook `pre('save')` để tự hash và `toJSON` để không trả `password` trong response.

:::

---

## Mục lục

- [Vì sao phải hash mật khẩu?](#vì-sao-phải-hash-mật-khẩu)
- [Tại sao cần hash password?](#tại-sao-cần-hash-password)
- [bcrypt](#bcrypt)
- [Salt Rounds](#salt-rounds)
- [Tích hợp với Mongoose](#tích-hợp-với-mongoose)
- [Password Validation Rules](#password-validation-rules)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao phải hash mật khẩu?

**Vấn đề:**

```js
// Lưu mật khẩu dạng thô (plaintext) — KHÔNG BAO GIỜ làm thế này
await db.users.insert({
  email: 'user@example.com',
  password: 'myPassword123', // Lưu nguyên văn vào database
});

// Nếu database bị lộ → lộ TOÀN BỘ mật khẩu của mọi tài khoản.
// Người dùng thường dùng lại mật khẩu này ở nơi khác → lộ luôn cả các tài khoản khác.
// MD5/SHA-256 cũng không cứu được: hash nhanh nên bị bẻ bằng
// brute-force hoặc rainbow table với tốc độ rất cao.
```

**Giải pháp:**

```js
const bcrypt = require('bcryptjs');

// Hash chuyên dụng cho mật khẩu (bcrypt / argon2):
// - Có SALT ngẫu nhiên → chống rainbow table
// - CỐ Ý CHẬM theo cost factor → chống brute-force
const hashed = await bcrypt.hash('myPassword123', 12);
await db.users.insert({ email: 'user@example.com', password: hashed });

// Chỉ lưu hash. Khi đăng nhập, so sánh bằng compare:
const isMatch = await bcrypt.compare('myPassword123', hashed); // true
```

:::tip[Dùng thực tế]

- **Đăng ký**: hash mật khẩu với `bcrypt.hash` trước khi lưu, không bao giờ lưu dạng thô.
- **Đăng nhập**: dùng `bcrypt.compare` để xác thực, không tự giải mã hash.
- **Tăng cost theo thời gian**: máy tính ngày càng mạnh, nâng dần salt rounds (12 → 14).
- **Không lộ mật khẩu**: không bao giờ log hay trả mật khẩu / hash trong response API.

:::

## Tại sao cần hash password?

- **Không bao giờ** lưu password dạng plain text
- Nếu database bị leak, hacker không đọc được password
- Hash là one-way function — không thể reverse

## bcrypt

```bash
npm install bcryptjs
```

```js
const bcrypt = require('bcryptjs');

// Hash password
const salt = await bcrypt.genSalt(12); // Cost factor = 12
const hashed = await bcrypt.hash('myPassword123', salt);
// Output: $2a$12$LJ3m4ys3...

// So sánh password
const isMatch = await bcrypt.compare('myPassword123', hashed);
console.log(isMatch); // true

const isWrong = await bcrypt.compare('wrongPassword', hashed);
console.log(isWrong); // false
```

## Salt Rounds

| Rounds | Thời gian hash | Khuyến nghị |
|--------|---------------|-------------|
| 10 | ~100ms | Tối thiểu |
| 12 | ~300ms | Khuyến nghị |
| 14 | ~1s | Bảo mật cao |

## Tích hợp với Mongoose

```js
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 8 },
});

// Hash trước khi save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method so sánh password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Không trả password trong JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};
```

## Password Validation Rules

```js
const Joi = require('joi');

const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(/[a-z]/, 'lowercase')
  .pattern(/[A-Z]/, 'uppercase')
  .pattern(/[0-9]/, 'number')
  .messages({
    'string.min': 'Password must be at least 8 characters',
    'string.pattern.name': 'Password must contain at least one {#name}',
  });
```

## Tóm tắt

- Luôn hash password với bcrypt, salt rounds >= 12
- Dùng Mongoose pre-save hook để auto-hash
- Không bao giờ trả password trong API response
- Validate password strength trước khi hash
