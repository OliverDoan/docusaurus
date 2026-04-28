---
sidebar_position: 3
title: "3. TypeScript Patterns"
---

# TypeScript Patterns

---

## Mục lục

- [Singleton Pattern](#singleton-pattern)
- [Factory Pattern](#factory-pattern)
- [Observer Pattern](#observer-pattern)
- [Dependency Injection](#dependency-injection)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Singleton Pattern

```typescript
class Logger {
  private static instance: Logger;
  private logs: string[] = [];

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  log(message: string): void {
    this.logs.push(message);
    console.log(message);
  }
}

const logger1 = Logger.getInstance();
const logger2 = Logger.getInstance();
console.log(logger1 === logger2); // true
```

---

## Factory Pattern

```typescript
interface Database {
  connect(): void;
  query(sql: string): any;
}

class MySQLDatabase implements Database {
  connect() { console.log("Connected to MySQL"); }
  query(sql: string) { return []; }
}

class PostgresDatabase implements Database {
  connect() { console.log("Connected to Postgres"); }
  query(sql: string) { return []; }
}

class DatabaseFactory {
  static create(type: "mysql" | "postgres"): Database {
    switch (type) {
      case "mysql": return new MySQLDatabase();
      case "postgres": return new PostgresDatabase();
    }
  }
}

const db = DatabaseFactory.create("mysql");
db.connect();
```

---

## Observer Pattern

```typescript
interface Observer<T> {
  update(data: T): void;
}

class Subject<T> {
  private observers: Observer<T>[] = [];

  subscribe(observer: Observer<T>): void {
    this.observers.push(observer);
  }

  notify(data: T): void {
    this.observers.forEach(observer => observer.update(data));
  }
}

class Logger<T> implements Observer<T> {
  update(data: T): void {
    console.log("Logger:", data);
  }
}

const subject = new Subject<string>();
subject.subscribe(new Logger());
subject.notify("Hello");
```

---

## Dependency Injection

```typescript
interface UserRepository {
  findById(id: number): Promise<User>;
}

class SqlUserRepository implements UserRepository {
  async findById(id: number): Promise<User> {
    // Query database...
    return { id, name: "Minh", email: "..." };
  }
}

class UserService {
  constructor(private repository: UserRepository) {}

  async getUser(id: number): Promise<User> {
    return this.repository.findById(id);
  }
}

// Usage
const repo = new SqlUserRepository();
const service = new UserService(repo);
service.getUser(1);
```

---

## Câu hỏi phỏng vấn

### Câu 1: Singleton TypeScript implementation?

**Đáp án:** Private constructor, static instance variable, static `getInstance()` method. Kiểm tra nếu instance không tồn tại, tạo mới, return. Đảm bảo chỉ 1 instance toàn bộ app.

### Câu 2: Dependency Injection lợi ích?

**Đáp án:** (1) Loose coupling — class không tạo dependencies, nhận qua constructor, (2) Testability — inject mock dependencies trong tests, (3) Flexibility — swap implementations dễ, (4) Explicit dependencies — constructor signature rõ dependencies nào cần.
