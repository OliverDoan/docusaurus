---
sidebar_position: 1
title: "1. File Upload"
---

# File Upload

File upload là chức năng cho phép người dùng tải file (ảnh, tài liệu...) lên server. Bài này hướng dẫn dùng thư viện Multer để nhận file qua form, kiểm tra loại và kích thước file, rồi cho phép truy cập lại các file đã lưu. Đây là tính năng gần như app web nào cũng cần đến.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Dùng `multer` cho upload** — `express.json()` không parse được `multipart/form-data`, phải có middleware chuyên xử lý file.
- ⭐ **Luôn validate `fileFilter` và `limits`** — chặn MIME type lạ và giới hạn `fileSize` để tránh mã độc, file khổng lồ làm sập server.
- **Đặt tên file duy nhất** — kết hợp `Date.now()` với số ngẫu nhiên và `path.extname` để tránh trùng, ghi đè.
- **`upload.single` vs `upload.array`** — một file dùng `single('avatar')`, nhiều file dùng `array('photos', 10)`.
- **Serve file tĩnh** — dùng `express.static('uploads')` để cho phép truy cập lại file đã lưu.

:::

---

## Mục lục

- [Vì sao cần xử lý riêng file upload?](#vì-sao-cần-xử-lý-riêng-file-upload)
- [Multer](#multer)
- [Sử dụng](#sử-dụng)
- [Serve static files](#serve-static-files)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao cần xử lý riêng file upload?

**Vấn đề:**

```js
// File upload gửi dạng multipart/form-data, KHÁC với JSON
// => express.json() KHÔNG parse được body chứa file
app.use(express.json());

app.post('/avatar', (req, res) => {
  console.log(req.body); // {} hoặc undefined - không có file!
});

// Nếu tự đọc cả file lớn vào RAM => dễ tràn bộ nhớ
// Không kiểm soát loại/kích thước file => rủi ro bảo mật:
// upload mã độc, file khổng lồ làm sập server
```

**Giải pháp:**

```js
// Dùng middleware chuyên cho upload: multer
// - Parse multipart/form-data theo STREAM (không nuốt cả file vào RAM)
// - Lưu ra disk hoặc bộ nhớ tạm, rồi đẩy lên cloud (S3) nếu cần
// - Giới hạn size và MIME type, đổi tên file an toàn
const upload = multer({
  storage: multer.diskStorage({ /* lưu ra disk theo stream */ }),
  fileFilter,                          // chặn MIME type lạ
  limits: { fileSize: 5 * 1024 * 1024 }, // chặn file quá lớn
});

app.post('/avatar', upload.single('avatar'), (req, res) => {
  console.log(req.file); // đã có thông tin file an toàn
});
```

:::tip[Dùng thực tế]

- Upload avatar người dùng hoặc ảnh sản phẩm qua form.
- Giới hạn dung lượng và định dạng (chỉ JPEG/PNG/WebP) để tránh file rác, mã độc.
- Lưu file lên S3 / Cloudinary thay vì giữ trên server.
- Nhận nhiều file một lúc (gallery, album ảnh) với `upload.array`.

:::

## Multer

```bash
npm install multer
```

```js
const multer = require('multer');
const path = require('path');

// Cấu hình storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueName}${path.extname(file.originalname)}`);
  },
});

// Filter file type
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});
```

## Sử dụng

```js
// Upload 1 file
router.post('/avatar', upload.single('avatar'), (req, res) => {
  res.json({
    message: 'Uploaded',
    file: {
      filename: req.file.filename,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
    },
  });
});

// Upload nhiều files
router.post('/photos', upload.array('photos', 10), (req, res) => {
  const files = req.files.map(f => ({
    filename: f.filename,
    url: `/uploads/${f.filename}`,
  }));
  res.json({ files });
});
```

## Serve static files

```js
app.use('/uploads', express.static('uploads'));
```

## Tóm tắt

- Multer xử lý multipart/form-data upload
- Luôn validate file type và size
- Tạo unique filename để tránh trùng
- Serve files qua `express.static`
