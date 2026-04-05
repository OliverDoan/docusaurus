---
sidebar_position: 3
title: "Authorization & Roles"
---

# Authorization & Roles

## Authentication vs Authorization

- **Authentication** — Xác minh "Bạn là ai?" (login)
- **Authorization** — Xác minh "Bạn được phép làm gì?" (permissions)

## Role-Based Access Control (RBAC)

```js
// Middleware kiểm tra role
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

// Chỉ admin mới xoá được user
router.delete('/users/:id',
  requireAuth,
  requireRole('admin'),
  userController.delete
);

// Admin hoặc moderator
router.put('/posts/:id',
  requireAuth,
  requireRole('admin', 'moderator'),
  postController.update
);
```

## Resource Ownership

```js
// Chỉ owner hoặc admin mới sửa được resource
function requireOwnerOrAdmin(resourceField = 'userId') {
  return async (req, res, next) => {
    const resource = await getResource(req.params.id);

    if (!resource) {
      return res.status(404).json({ error: 'Not found' });
    }

    const isOwner = resource[resourceField].toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    req.resource = resource;
    next();
  };
}

router.put('/posts/:id',
  requireAuth,
  requireOwnerOrAdmin('authorId'),
  postController.update
);
```

## Phân biệt HTTP Status Codes

| Code | Ý nghĩa | Khi nào dùng |
|------|---------|-------------|
| 401 | Unauthorized | Chưa đăng nhập / token hết hạn |
| 403 | Forbidden | Đã đăng nhập nhưng không có quyền |

## Tóm tắt

- Authentication = "Bạn là ai?", Authorization = "Bạn được làm gì?"
- RBAC kiểm tra role qua middleware
- Kiểm tra resource ownership cho user-specific data
- 401 cho authentication, 403 cho authorization
