---
sidebar_position: 1
title: "1. MongoDB & Mongoose"
---

# MongoDB & Mongoose

MongoDB là cơ sở dữ liệu NoSQL lưu dữ liệu dưới dạng document giống JSON, rất linh hoạt và dễ thay đổi cấu trúc. Mongoose là thư viện ODM giúp bạn định nghĩa schema, kiểm tra dữ liệu và thao tác CRUD với MongoDB trong Node.js một cách gọn gàng. Bài này hướng dẫn cách cài đặt, kết nối, định nghĩa Schema/Model và thực hiện các thao tác cơ bản.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Mongoose là ODM cho MongoDB** — áp schema/validation lên NoSQL schemaless, chặn dữ liệu sai kiểu/thiếu field ngay tại tầng model.
- **Schema định nghĩa cấu trúc** — dùng `type`, `required`, `unique`, `min`/`max`, `enum`, `default` để ràng buộc dữ liệu.
- **CRUD qua Model** — `create`, `find`, `findById`, `findByIdAndUpdate` (nhớ `runValidators: true` khi update), `findByIdAndDelete`.
- **`populate()`** — join theo tham chiếu để lấy dữ liệu quan hệ (ví dụ bài viết kèm tác giả) chỉ với một dòng.
- **Hook `pre('save')`** — tự động xử lý trước khi lưu, ví dụ hash mật khẩu; dùng `.select()` để chỉ lấy field cần thiết.

:::

---

## Mục lục

- [Vì sao dùng Mongoose?](#vì-sao-dùng-mongoose)
- [MongoDB là gì?](#mongodb-là-gì)
- [Cài đặt](#cài-đặt)
- [Kết nối](#kết-nối)
- [Schema & Model](#schema-model)
- [CRUD Operations](#crud-operations)
- [Query helpers](#query-helpers)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao dùng Mongoose?

**Vấn đề:** MongoDB là NoSQL schemaless — driver thuần cho phép ghi **bất kỳ hình dạng** document nào. Hậu quả là dữ liệu dễ lộn xộn (thiếu field, sai kiểu), không có validation, và bạn phải tự viết nhiều code cho truy vấn lẫn quan hệ.

```js
const { MongoClient } = require('mongodb');
const db = (await MongoClient.connect(process.env.MONGODB_URI)).db('app');

// Không ai chặn dữ liệu sai: thiếu email, age là chuỗi, field thừa
await db.collection('users').insertOne({ name: 'Alice', age: 'hai mươi' });
await db.collection('users').insertOne({ email: 'bob@example.com', extra: true });

// Muốn lấy bài viết kèm tác giả? Phải tự query 2 lần rồi tự ghép tay
const post = await db.collection('posts').findOne({ _id: postId });
const author = await db.collection('users').findOne({ _id: post.authorId });
post.author = author;
```

**Giải pháp:** Mongoose là ODM — bạn định nghĩa Schema/Model áp **kỷ luật** lên collection (kiểu, required, default), validation tích hợp, middleware (hook pre/post save), populate (join tham chiếu) và query helper.

```js
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  age: { type: Number, min: 0, max: 150 },
  password: { type: String, required: true },
});

// Hash password tự động trước khi lưu
userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

const User = mongoose.model('User', userSchema);

// Sai kiểu / thiếu field bị chặn ngay, không lọt vào DB
await User.create({ name: 'Alice', age: 'hai mươi' }); // ValidationError

// Populate quan hệ: lấy post kèm author chỉ với một dòng
const post = await Post.findById(postId).populate('author');
```

:::tip[Dùng thực tế]

- **Đăng ký user:** schema validate `email`/`password`, hook pre-save tự hash mật khẩu trước khi lưu.
- **Blog/diễn đàn:** `populate('author')` để lấy bài viết kèm thông tin tác giả mà không query thủ công.
- **Form nhập liệu:** `enum`, `min`, `max`, `required` đảm bảo dữ liệu nhất quán ngay tại tầng model.
- **API có default:** field `role` mặc định `'user'`, `createdAt` tự gán `Date.now`, giảm code lặp ở controller.

:::

## MongoDB là gì?

MongoDB là **NoSQL database** lưu trữ dữ liệu dạng document (JSON-like). Mongoose là ODM (Object Data Modeling) giúp làm việc với MongoDB trong Node.js.

## Cài đặt

```bash
npm install mongoose
```

## Kết nối

```js
const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

connectDB();
```

## Schema & Model

```js
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  age: {
    type: Number,
    min: 0,
    max: 150,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
```

## CRUD Operations

```js
// Create
const user = await User.create({ name: 'Alice', email: 'alice@example.com' });

// Read
const allUsers = await User.find();
const admins = await User.find({ role: 'admin' });
const user = await User.findById('64a1b2c3d4e5f6g7h8i9j0');
const user = await User.findOne({ email: 'alice@example.com' });

// Update
const updated = await User.findByIdAndUpdate(
  id,
  { name: 'Alice Updated' },
  { new: true, runValidators: true }
);

// Delete
await User.findByIdAndDelete(id);
```

## Query helpers

```js
// Pagination
const page = 2;
const limit = 10;
const users = await User.find()
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(limit)
  .select('name email');     // Chỉ lấy fields cần thiết

const total = await User.countDocuments();
```

## Tóm tắt

- Mongoose cung cấp schema validation cho MongoDB
- Schema định nghĩa cấu trúc và constraints
- Luôn dùng `runValidators: true` khi update
- Dùng `.select()` để chỉ lấy fields cần thiết
