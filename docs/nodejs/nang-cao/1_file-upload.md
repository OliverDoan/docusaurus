---
sidebar_position: 1
title: "1. File Upload"
---

# File Upload

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
