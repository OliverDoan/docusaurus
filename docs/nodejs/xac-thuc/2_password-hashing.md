---
sidebar_position: 2
title: "2. Password Hashing"
---

# Password Hashing

Password hashing là việc biến mật khẩu thành một chuỗi mã hoá một chiều trước khi lưu vào database, để không ai đọc được mật khẩu gốc kể cả khi dữ liệu bị lộ. Bài này hướng dẫn dùng bcrypt để hash và so sánh mật khẩu, chọn salt rounds phù hợp, tích hợp với Mongoose và kiểm tra độ mạnh mật khẩu. Đây là bước bắt buộc để bảo vệ tài khoản người dùng.

---

## Mục lục

- [Tại sao cần hash password?](#tại-sao-cần-hash-password)
- [bcrypt](#bcrypt)
- [Salt Rounds](#salt-rounds)
- [Tích hợp với Mongoose](#tích-hợp-với-mongoose)
- [Password Validation Rules](#password-validation-rules)
- [Tóm tắt](#tóm-tắt)

---

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
