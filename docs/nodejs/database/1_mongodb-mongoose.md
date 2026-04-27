---
sidebar_position: 1
title: "1. MongoDB & Mongoose"
---

# MongoDB & Mongoose


---

## Mục lục

- [MongoDB là gì?](#mongodb-là-gì)
- [Cài đặt](#cài-đặt)
- [Kết nối](#kết-nối)
- [Schema & Model](#schema-model)
- [CRUD Operations](#crud-operations)
- [Query helpers](#query-helpers)
- [Tóm tắt](#tóm-tắt)

---

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
