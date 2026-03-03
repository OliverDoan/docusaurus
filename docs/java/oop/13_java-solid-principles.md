# SOLID


---

## Mục lục
1. Single Responsibility Principle (SRP)
2. Open–Closed Principle (OCP)
3. Liskov Substitution Principle (LSP)
4. Interface Segregation Principle (ISP)
5. Dependency Inversion Principle (DIP)
6. Lời kết

---

## 1. Single Responsibility Principle (SRP)
**Một class chỉ nên có một lý do duy nhất để thay đổi.**

> A class should have one and only one reason to change.

### Ý nghĩa
- Mỗi class chỉ đảm nhiệm **một trách nhiệm**
- Dễ bảo trì, test, mở rộng
- Tránh class phình to, khó kiểm soát

### Ví dụ vi phạm
```java
class UserService {
    public User getUser() {}
    public boolean isValid() {}
    public void showNotification() {}
    public void logging() {}
    public User parseJson(String json) {}
}
```

### Cách sửa
Tách thành các class:
- UserRepository
- UserValidator
- Logger
- JsonParser

---

## 2. Open–Closed Principle (OCP)
**Mở rộng được nhưng không sửa code cũ.**

> Open for extension, closed for modification.

### Ý nghĩa
- Tránh sửa code đang chạy ổn định
- Mở rộng bằng kế thừa hoặc composition
- Thường kết hợp với Interface + Dependency Injection

### Ví dụ
```java
interface Validator {
    boolean isValid();
}

class UserService {
    private Validator validator;
    public UserService(Validator validator) {
        this.validator = validator;
    }
}
```

---

## 3. Liskov Substitution Principle (LSP)
**Class con phải thay thế được class cha mà không làm sai logic.**

> Subtypes must be substitutable for their base types.

### Dấu hiệu vi phạm
- Override làm thay đổi hành vi
- Throw exception không hợp lý
- Method không dùng được ở class con

### Ví dụ kinh điển (Rectangle – Square)
→ Giải pháp: tạo class cha `Shape`, không cho Square kế thừa Rectangle.

---

## 4. Interface Segregation Principle (ISP)
**Nhiều interface nhỏ tốt hơn một interface lớn.**

> Many client-specific interfaces are better than one general-purpose interface.

### Ý nghĩa
- Tránh ép class implement method không dùng
- Interface gọn, đúng mục đích

### Ví dụ
```java
interface CrudRepository {
    save();
    delete();
}

interface PagingRepository {
    findAll(Pageable pageable);
}
```

---

## 5. Dependency Inversion Principle (DIP)
**Module cấp cao không phụ thuộc module cấp thấp.**

> Both should depend on abstractions.

### Ý nghĩa
- Giảm coupling
- Dễ thay thế implementation
- Nền tảng của Spring DI

### Ví dụ
```java
interface DBConnection {
    void connect();
}

class MySQLConnection implements DBConnection {}
class OracleConnection implements DBConnection {}
```

---

## 6. Lời kết
- SOLID giúp code:
  - Dễ đọc
  - Dễ test
  - Dễ mở rộng
- Là nền tảng cho Design Patterns
- Không phải luật cứng, mà là **kim chỉ nam thiết kế**

---

