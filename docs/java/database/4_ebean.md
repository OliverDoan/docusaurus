---
sidebar_position: 4
title: "4. EBean ORM"
---

# EBean -- ORM thay thế Hibernate

**EBean** là ORM Java đặc biệt -- **đơn giản hơn Hibernate**, không cần Session/EntityManager, dùng pattern **Active Record** hoặc Finder. Phổ biến với Play Framework và các dự án ưa "ít magic hơn".

**Tương tự đơn giản:** Hibernate giống **xe ô tô tự lái** -- nhiều tính năng nhưng phức tạp. EBean giống **xe đạp điện** -- ít chức năng hơn nhưng đơn giản, dễ sử dụng.

---

## Mục lục

- [1. EBean là gì?](#1-ebean-là-gì)
- [2. Cài đặt và setup](#2-cài-đặt-và-setup)
- [3. Entity với Active Record](#3-entity-với-active-record)
- [4. Finder pattern](#4-finder-pattern)
- [5. Query (Fluent API)](#5-query-fluent-api)
- [6. Relationships](#6-relationships)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. EBean là gì?

Đặc điểm:

- **Không Session/EntityManager** -- gọi method tĩnh từ Entity
- **Fluent query builder** -- query SQL-like trong Java
- **Bytecode enhancement** -- entity được modify lúc compile
- **Less lazy loading magic** -- bạn control fetch
- **Tích hợp Play Framework** -- chính thức ORM của Play (Java)

---

## 2. Cài đặt và setup

### Maven

```xml
<dependency>
    <groupId>io.ebean</groupId>
    <artifactId>ebean</artifactId>
    <version>13.27.0</version>
</dependency>
<dependency>
    <groupId>io.ebean</groupId>
    <artifactId>ebean-postgres</artifactId>
    <version>13.27.0</version>
</dependency>
```

### Bytecode enhancement (Maven plugin)

```xml
<plugin>
    <groupId>io.ebean</groupId>
    <artifactId>ebean-maven-plugin</artifactId>
    <version>13.27.0</version>
    <executions>
        <execution>
            <goals><goal>enhance</goal></goals>
        </execution>
    </executions>
</plugin>
```

### Config `application.yml`

```yaml
datasource:
  db:
    username: postgres
    password: secret
    databaseUrl: jdbc:postgresql://localhost:5432/mydb
    databaseDriver: org.postgresql.Driver

ebean:
  defaultServer: db
  ddl.generate: true
```

---

## 3. Entity với Active Record

```java
import io.ebean.Model;
import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User extends Model {

    @Id
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String email;

    // getter, setter
}

// Su dung -- goi method tu Model
User user = new User();
user.setName("Alice");
user.setEmail("alice@example.com");
user.save();         // INSERT

user.setName("Bob");
user.update();       // UPDATE

user.delete();       // DELETE

User found = new User();
found.setId(1L);
found.refresh();     // load tu DB
```

---

## 4. Finder pattern

Tách query khỏi entity -> sạch hơn Active Record.

```java
import io.ebean.Finder;

@Entity
public class User extends Model {
    @Id Long id;
    String name;
    String email;

    public static final Finder<Long, User> find = new Finder<>(User.class);
}

// Su dung
User u = User.find.byId(1L);
List<User> all = User.find.all();
List<User> byName = User.find.query()
    .where()
    .eq("active", true)
    .ilike("name", "%alice%")
    .findList();
```

---

## 5. Query (Fluent API)

```java
List<User> users = DB.find(User.class)
    .where()
        .eq("active", true)
        .gt("age", 18)
        .ilike("name", "%alice%")
    .orderBy("createdAt desc")
    .setMaxRows(10)
    .findList();

// Count
int count = DB.find(User.class)
    .where().eq("active", true)
    .findCount();

// Exist
boolean exists = DB.find(User.class)
    .where().eq("email", "a@b.com")
    .exists();

// Single
User user = DB.find(User.class)
    .where().eq("email", "a@b.com")
    .findOne();

// Pagination
PagedList<User> paged = DB.find(User.class)
    .setMaxRows(20).setFirstRow(0)
    .findPagedList();
```

### Update / Delete batch

```java
// Update
DB.update(User.class)
    .set("active", false)
    .where().lt("lastLogin", lastWeek)
    .update();

// Delete
DB.delete(User.class)
    .where().eq("active", false)
    .delete();
```

---

## 6. Relationships

```java
@Entity
public class User extends Model {
    @Id Long id;
    String name;

    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL)
    List<Post> posts;
}

@Entity
public class Post extends Model {
    @Id Long id;
    String title;

    @ManyToOne
    User author;
}

// Query voi fetch
User u = DB.find(User.class)
    .fetch("posts")            // join + fetch
    .where().eq("id", 1L)
    .findOne();

// Fetch only specific fields
User u = DB.find(User.class)
    .select("id, name")
    .fetch("posts", "title")
    .where().eq("id", 1L)
    .findOne();
```

---

## Khi nào dùng?

- **EBean khi:**
  - Play Framework (chuẩn cho Java)
  - Team thích Active Record style
  - Muốn ít magic hơn Hibernate
  - Cần fluent query builder
- **Hibernate/JPA khi:**
  - Project Spring (chuẩn)
  - Cần ecosystem JPA rộng
  - Cần `criteria builder` chuẩn
- **Best practice:**
  - Finder pattern thay vì Active Record cho project lớn
  - Fluent query + explicit `fetch` -- tránh N+1
  - `setMaxRows` cho list lớn
  - Test với in-memory H2

---

## Lỗi thường gặp

### Lỗi 1: Quên enhance

```
EBean Enhancement not done -- entity behaves normal POJO
```

Cần Maven plugin `ebean-maven-plugin` hoặc agent `-javaagent:ebean-agent.jar`.

### Lỗi 2: N+1 vì lazy

```java
// SAI -- forEach goi posts -> N+1
List<User> users = DB.find(User.class).findList();
users.forEach(u -> u.getPosts().size());

// DUNG -- fetch
List<User> users = DB.find(User.class).fetch("posts").findList();
```

### Lỗi 3: Active Record với singleton service

```java
// SAI -- thread-safety issue khi shared
user.save(); // global state

// DUNG -- Finder pattern + DI
```

---

## Câu hỏi phỏng vấn

### Câu 1: EBean khác Hibernate thế nào?

**Trả lời:**

- **EBean**: API "more explicit" -- không Session, query builder fluent rõ, ít magic lazy loading
- **Hibernate**: JPA standard, ecosystem rộng, lazy loading mạnh, Session pattern

EBean dễ học hơn nhưng ít phổ biến ngoài Play Framework.

### Câu 2: Active Record và Finder pattern?

**Trả lời:**

- **Active Record**: method query trên entity (`user.save()`, `User.find.all()`) -- ngắn
- **Finder**: static field `Finder` trong entity, gọi method từ đó (`User.find.byId(1L)`)

Cả 2 đều EBean idiom. Finder tách query khỏi entity logic, sạch hơn cho project lớn.

### Câu 3: Bytecode enhancement nghĩa là gì?

**Trả lời:** Lúc compile, EBean **modify bytecode** của entity -- thêm code tracking changes, lazy loading. Khác Hibernate dùng proxy/reflection. Enhancement nhanh hơn runtime nhưng cần plugin Maven/Gradle hoặc Java agent.

### Câu 4: EBean có support JPA annotation không?

**Trả lời:** **Có**. EBean đọc `@Entity`, `@Table`, `@Column`, `@Id`, relationship annotation chuẩn JPA. Nhưng API là EBean-specific (không phải `EntityManager`). Hybrid -- annotation chuẩn + API riêng.

### Câu 5: Khi nào KHÔNG nên dùng EBean?

**Trả lời:**

- Project Spring -- không hợp ecosystem
- Team đã quen JPA/Hibernate -- chi phí học
- Cần chuẩn JPA portable (đổi implementation dễ)
- Ít người support, community nhỏ hơn Hibernate
