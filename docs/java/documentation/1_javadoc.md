---
sidebar_position: 1
title: "1. Javadoc"
---

# Javadoc -- Tài liệu API trong Java

**Javadoc** là công cụ Java **chính thức** để **sinh tài liệu API** từ comment đặc biệt trong source code. Mọi thư viện Java chuẩn (JDK, Spring, Hibernate...) đều có Javadoc -- và bạn cũng nên viết Javadoc cho code public của mình.

**Tương tự đơn giản:** Javadoc giống **manual sử dụng** đi kèm sản phẩm. Người dùng (developer khác) đọc Javadoc để biết "class này làm gì, dùng thế nào" -- không cần đọc source code.

---

## Mục lục

- [1. Javadoc là gì?](#1-javadoc-là-gì)
- [2. Cú pháp Javadoc](#2-cú-pháp-javadoc)
- [3. Tag thường dùng](#3-tag-thường-dùng)
- [4. Format và Style](#4-format-và-style)
- [5. Sinh HTML từ Javadoc](#5-sinh-html-từ-javadoc)
- [6. Maven/Gradle tích hợp](#6-mavengradle-tích-hợp)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Javadoc là gì?

Javadoc là:

1. **Cú pháp comment đặc biệt** -- `/** ... */`
2. **Tool sinh HTML** -- `javadoc` command
3. **API documentation** -- file HTML tham khảo

Javadoc đọc comment `/** */` (3 dấu sao) phía trên class/method/field, parse các tag, sinh tài liệu.

---

## 2. Cú pháp Javadoc

```java
/**
 * Lop UserService quan ly nghiep vu lien quan den User.
 *
 * <p>Cung cap cac thao tac CRUD va tim kiem.
 *
 * <p>Vi du:
 * <pre>{@code
 * UserService service = new UserService(repo);
 * User user = service.findById(1L);
 * }</pre>
 *
 * @author Nguyen Van A
 * @since 1.0
 */
public class UserService {

    /**
     * So luong user toi da co the cache.
     */
    public static final int MAX_CACHE_SIZE = 1000;

    /**
     * Tao moi UserService voi repository cho truoc.
     *
     * @param repo repository de truy cap database, khong duoc null
     * @throws NullPointerException neu repo la null
     */
    public UserService(UserRepository repo) {
        Objects.requireNonNull(repo, "repo khong duoc null");
        this.repo = repo;
    }

    /**
     * Tim user theo id.
     *
     * @param id id cua user can tim
     * @return user neu ton tai, {@code Optional.empty()} neu khong
     * @throws IllegalArgumentException neu id < 0
     */
    public Optional<User> findById(Long id) {
        if (id < 0) throw new IllegalArgumentException();
        return repo.findById(id);
    }
}
```

---

## 3. Tag thường dùng

| Tag                | Vị trí              | Mô tả                                  |
| ------------------ | ------------------- | -------------------------------------- |
| `@param`           | Method, constructor | Mô tả tham số                          |
| `@return`          | Method              | Mô tả giá trị trả về                   |
| `@throws` / `@exception` | Method        | Exception có thể ném                   |
| `@author`          | Class               | Tác giả                                |
| `@since`           | Class, method       | Phiên bản đầu xuất hiện                |
| `@version`         | Class               | Phiên bản hiện tại                     |
| `@deprecated`      | Class, method       | Đánh dấu deprecated + lý do            |
| `@see`             | Class, method       | Tham khảo khác                         |
| `@link` / `@linkplain` | Inline           | Link tới class/method                  |
| `@code`            | Inline              | Code inline (monospace)                |
| `@literal`         | Inline              | Text thô (giữ ký tự đặc biệt)          |

### Inline tag

```java
/**
 * Doi mot {@code int} thanh {@code String}.
 *
 * @see #parseInt(String)
 * @see java.lang.Integer
 */
```

### `@deprecated`

```java
/**
 * @deprecated Tu phien ban 2.0, dung {@link #newMethod()} thay the.
 */
@Deprecated
public void oldMethod() { ... }
```

---

## 4. Format và Style

### HTML tag được hỗ trợ

```java
/**
 * <p>Paragraph thuong</p>
 *
 * <ul>
 *   <li>List item 1</li>
 *   <li>List item 2</li>
 * </ul>
 *
 * <pre>{@code
 * Code block giu format
 * int x = 5;
 * }</pre>
 *
 * <strong>Strong</strong>, <em>italic</em>, <code>code</code>
 */
```

### Convention

- **Dòng đầu** = mô tả ngắn (kết thúc bằng dấu chấm)
- **Đoạn sau** = mô tả chi tiết
- **Câu mệnh lệnh**: "Tính tổng" hơn "Phương thức này tính tổng"
- **Hậu tố `@param`/`@return` không có dấu chấm** (theo style chuẩn)

```java
/**
 * Tinh tong hai so nguyen.
 *
 * <p>Khong overflow check, dung cho so nho.
 *
 * @param a so thu nhat
 * @param b so thu hai
 * @return tong cua a va b
 */
int add(int a, int b) { return a + b; }
```

---

## 5. Sinh HTML từ Javadoc

### Command line

```bash
# Sinh javadoc cho package com.example
javadoc -d docs -sourcepath src/main/java com.example

# Voi options
javadoc -d docs \
    -sourcepath src/main/java \
    -subpackages com.example \
    -windowtitle "My API" \
    -doctitle "My API v1.0" \
    -author -version \
    -encoding UTF-8 \
    -charset UTF-8
```

Sinh ra file HTML trong `docs/`. Mở `docs/index.html`.

---

## 6. Maven/Gradle tích hợp

### Maven

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-javadoc-plugin</artifactId>
            <version>3.6.0</version>
            <executions>
                <execution>
                    <id>attach-javadocs</id>
                    <goals>
                        <goal>jar</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

```bash
mvn javadoc:javadoc      # sinh trong target/site/apidocs/
mvn javadoc:jar          # tao jar javadoc
mvn install              # tu attach javadoc jar (neu config)
```

### Gradle

```kotlin
tasks.javadoc {
    options {
        encoding = "UTF-8"
        (this as StandardJavadocDocletOptions).apply {
            charSet("UTF-8")
            addBooleanOption("author", true)
            addBooleanOption("version", true)
        }
    }
}

tasks.named<Jar>("jar") {
    finalizedBy("javadocJar")
}
```

```bash
./gradlew javadoc        # sinh trong build/docs/javadoc/
./gradlew javadocJar     # jar javadoc
```

---

## Khi nào dùng?

- **Viết Javadoc bắt buộc cho:**
  - Class/method **public** trong library
  - API exposed ra ngoài
  - Constructor, factory method
- **Không cần Javadoc cho:**
  - Private method (code self-explanatory đủ)
  - Getter/setter đơn giản
  - Override method (kế thừa Javadoc)
- **Best practice:**
  - **Câu mệnh lệnh**, ngắn gọn, súc tích
  - Mô tả **WHAT**, không phải **HOW**
  - Ghi **constraint** -- "null không được", "phải > 0"
  - Ghi **edge case** -- "trả Optional.empty() nếu..."
  - Dùng `{@code}` cho code inline
  - Có **ví dụ** cho method phức tạp
  - Không lặp lại tên method/param

---

## Lỗi thường gặp

### Lỗi 1: Comment thường thay Javadoc

```java
// SAI -- comment thuong, khong sinh tai lieu
// Tinh tong hai so
int add(int a, int b) { ... }

// DUNG
/**
 * Tinh tong hai so.
 */
int add(int a, int b) { ... }
```

### Lỗi 2: Lặp lại thông tin từ tên

```java
// SAI -- voi vat
/**
 * Lay user.
 * @param id id cua user
 * @return user
 */
User getUser(Long id);

// DUNG -- them thong tin huu ich
/**
 * Tim user theo id, throw {@link UserNotFoundException} neu khong ton tai.
 *
 * @param id id duy nhat cua user
 * @return user tuong ung
 * @throws UserNotFoundException khi khong tim thay user
 */
User getUser(Long id);
```

### Lỗi 3: Quên `@throws`

```java
// SAI -- khong ghi exception
public void parse(String s) {
    if (s == null) throw new NullPointerException();
    // ...
}

// DUNG
/**
 * @throws NullPointerException neu {@code s} la null
 */
```

### Lỗi 4: HTML không hợp lệ

```java
/**
 * Mo ta < trong code  <- loi
 */
// Phai escape
/**
 * Mo ta &lt; trong code
 */

// Hoac dung @literal
/**
 * Mo ta {@literal <} trong code
 */
```

### Lỗi 5: `@param` sai tên

```java
/**
 * @param id id user
 */
public void delete(Long userId) { ... }  // ten thuc la userId, khong phai id
```

---

## Câu hỏi phỏng vấn

### Câu 1: Javadoc khác comment thường thế nào?

**Trả lời:** Javadoc dùng `/** ... */` (3 sao), được tool `javadoc` parse để sinh HTML documentation. Comment thường `//` hoặc `/* */` chỉ tồn tại trong source code. Javadoc hỗ trợ tag (`@param`, `@return`) và HTML.

### Câu 2: Tag `@param` và `@return` bắt buộc không?

**Trả lời:** **Không bắt buộc** technically, nhưng best practice nên có cho method public. Tool linter (checkstyle, errorprone) có thể bắt buộc. JDK code style yêu cầu `@param`/`@return` cho mọi public method.

### Câu 3: Javadoc tự kế thừa khi override?

**Trả lời:** **Có**. Override method không có Javadoc kế thừa từ method gốc (`@inheritDoc`). Có thể override hoặc thêm chi tiết:

```java
@Override
public String toString() {
    return "...";  // ke thua Javadoc tu Object.toString()
}

// Hoac
/**
 * {@inheritDoc}
 *
 * <p>Them thong tin moi cua subclass.
 */
@Override
public String toString() { ... }
```

### Câu 4: Khi nào nên publish Javadoc?

**Trả lời:**

- **Open-source library**: bắt buộc -- người dùng cần documentation
- **Internal library** dùng nhiều team: nên có
- **App private**: không cần, focus code rõ ràng

Publish lên Maven Central yêu cầu javadoc jar.

### Câu 5: Tool nào kiểm tra Javadoc?

**Trả lời:**

- **Checkstyle**: check format, missing tag
- **Error Prone**: detect bug pattern
- **IDE warning**: IntelliJ/Eclipse báo missing/incorrect tag
- **doclint** (built-in javadoc): tự check HTML hợp lệ, tag đúng
