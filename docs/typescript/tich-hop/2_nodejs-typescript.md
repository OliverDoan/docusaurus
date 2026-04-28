---
sidebar_position: 2
title: "2. Node.js + TypeScript"
---

# Node.js + TypeScript

---

## Mục lục

- [Express TypeScript](#express-typescript)
- [Request/Response Types](#requestresponse-types)
- [Middleware TypeScript](#middleware-typescript)
- [Error Handling](#error-handling)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Express TypeScript

```typescript
import express, { Express } from "express";

const app: Express = express();

// Route
app.get("/hello", (req, res) => {
  res.json({ message: "Hello, World!" });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

---

## Request/Response Types

```typescript
import { Request, Response } from "express";

interface User {
  id: number;
  name: string;
  email: string;
}

app.get("/users/:id", (req: Request, res: Response) => {
  const id: number = parseInt(req.params.id);
  // Fetch user...
  const user: User = { id: 1, name: "Minh", email: "minh@gmail.com" };
  res.json(user);
});

app.post("/users", (req: Request<{}, {}, User>, res: Response<User>) => {
  const newUser: User = req.body;
  res.status(201).json(newUser);
});
```

---

## Middleware TypeScript

```typescript
import { NextFunction } from "express";

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  // Verify token...
  next();
}

app.use(authMiddleware);
```

---

## Error Handling

```typescript
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

app.get("/users/:id", (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) throw new ApiError(400, "Invalid ID");
    // Fetch user...
  } catch (error) {
    next(error);
  }
});

app.use((error: ApiError, req: Request, res: Response) => {
  res.status(error.status || 500).json({ error: error.message });
});
```

---

## Câu hỏi phỏng vấn

### Câu 1: Express route type annotation cách nào?

**Đáp án:** Use `Request<Params, Response, Body>` generic types. VD: `Request<{ id: string }, {}, { name: string }>` = route params có `id`, response type, body có `name`. Hoặc `(req: Request, res: Response)` simplified khi types obvious.

### Câu 2: Error handling middleware TypeScript?

**Đáp án:** Error handler middleware là function cuối cùng, nhận 4 params: `(error, req, res, next)`. Type: `error: Error | ApiError`, `req: Request`, `res: Response`, `next: NextFunction`. Express match arity (4 params) để recognize error handler.
