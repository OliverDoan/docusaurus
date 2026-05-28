---
sidebar_position: 2
title: "2. Hibernate (ORM)"
---

# Hibernate -- ORM phổ biến nhất Java

**Hibernate** là **ORM framework** (Object-Relational Mapping) phổ biến nhất Java. ORM = ánh xạ **bảng DB** thành **class Java**, biến **SQL** thành **method gọi object**. Hibernate là implementation phổ biến của **JPA** (Java Persistence API).

**Tương tự đơn giản:** Hãy tưởng tượng bạn nói tiếng Việt nhưng DB nói tiếng SQL. Hibernate giống **phiên dịch tự động** -- bạn cứ làm việc với object Java, Hibernate tự dịch thành SQL gửi DB và ngược lại.

---

## Mục lục

- [1. ORM là gì? Hibernate là gì?](#1-orm-là-gì-hibernate-là-gì)
- [2. Cấu hình Hibernate](#2-cấu-hình-hibernate)
- [3. Entity và Annotation](#3-entity-và-annotation)
- [4. Session và SessionFactory](#4-session-và-sessionfactory)
- [5. CRUD cơ bản](#5-crud-cơ-bản)
- [6. HQL và JPQL](#6-hql-và-jpql)
- [7. Relationships](#7-relationships)
- [8. Caching](#8-caching)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. ORM là gì? Hibernate là gì?

**ORM** ánh xạ:

- **Class Java** ↔ **Table DB**
- **Field** ↔ **Column**
- **Object** ↔ **Row**

```java
// Java
class User { Long id; String name; }

// DB
CREATE TABLE users (id BIGINT, name VARCHAR(100));
```

**Hibernate** là ORM phổ biến nhất, là implementation của **JPA spec**.

**JPA** (Jakarta Persistence API) = spec chuẩn. Hibernate = implementation. Còn EclipseLink, OpenJPA cũng implement JPA.

---

## 2. Cấu hình Hibernate

### Maven

```xml
<dependency>
    <groupId>org.hibernate.orm</groupId>
    <artifactId>hibernate-core</artifactId>
    <version>6.4.0.Final</version>
</dependency>
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.7.0</version>
</dependency>
```

### `hibernate.cfg.xml`

```xml
<hibernate-configuration>
    <session-factory>
        <property name="hibernate.connection.driver_class">org.postgresql.Driver</property>
        <property name="hibernate.connection.url">jdbc:postgresql://localhost:5432/mydb</property>
        <property name="hibernate.connection.username">postgres</property>
        <property name="hibernate.connection.password">secret</property>
        <property name="hibernate.dialect">org.hibernate.dialect.PostgreSQLDialect</property>
        <property name="hibernate.show_sql">true</property>
        <property name="hibernate.format_sql">true</property>
        <property name="hibernate.hbm2ddl.auto">update</property>
    </session-factory>
</hibernate-configuration>
```

---

## 3. Entity và Annotation

```java
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(unique = true)
    private String email;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Transient // khong luu DB
    private String tempField;

    // getter, setter
}

enum Role { USER, ADMIN }
```

### Các annotation chính

| Annotation                | Mô tả                                       |
| ------------------------- | ------------------------------------------- |
| `@Entity`                 | Đánh dấu class là entity                    |
| `@Table(name)`            | Map class -> table                          |
| `@Id`                     | Primary key                                 |
| `@GeneratedValue`         | Auto-gen ID (IDENTITY, SEQUENCE, AUTO, UUID)|
| `@Column`                 | Tùy chỉnh column                            |
| `@Enumerated(STRING)`     | Enum lưu thành string                       |
| `@Temporal`               | java.util.Date (deprecated -- dùng Instant) |
| `@Transient`              | Không persist                               |
| `@Lob`                    | Large Object (TEXT, BLOB)                   |
| `@Version`                | Optimistic locking                          |

---

## 4. Session và SessionFactory

```java
SessionFactory factory = new Configuration().configure().buildSessionFactory();

try (Session session = factory.openSession()) {
    Transaction tx = session.beginTransaction();
    // operations
    tx.commit();
}
```

**Hibernate dùng `Session`. JPA dùng `EntityManager` -- gần giống.**

---

## 5. CRUD cơ bản

```java
try (Session session = factory.openSession()) {
    Transaction tx = session.beginTransaction();

    // CREATE
    User user = new User();
    user.setName("Alice");
    user.setEmail("alice@example.com");
    session.persist(user);

    // READ
    User found = session.get(User.class, 1L);
    User maybe = session.find(User.class, 999L); // null neu khong co

    // UPDATE
    found.setName("Alice Updated");
    // Khong can goi save -- dirty checking tu update khi commit

    // DELETE
    session.remove(found);

    tx.commit();
}
```

---

## 6. HQL và JPQL

**HQL** (Hibernate Query Language) / **JPQL** (Jakarta Persistence Query Language) -- ngôn ngữ query trên **entity**, không phải table.

```java
// HQL/JPQL
List<User> users = session.createQuery(
    "FROM User u WHERE u.email LIKE :domain", User.class)
    .setParameter("domain", "%@gmail.com")
    .getResultList();

// Update
session.createQuery("UPDATE User u SET u.role = :role WHERE u.id = :id")
    .setParameter("role", Role.ADMIN)
    .setParameter("id", 1L)
    .executeUpdate();

// Aggregate
Long count = session.createQuery(
    "SELECT COUNT(u) FROM User u WHERE u.role = :role", Long.class)
    .setParameter("role", Role.ADMIN)
    .getSingleResult();
```

### Native SQL

```java
List<User> users = session.createNativeQuery(
    "SELECT * FROM users WHERE name = :name", User.class)
    .setParameter("name", "Alice")
    .getResultList();
```

### Criteria API (type-safe)

```java
CriteriaBuilder cb = session.getCriteriaBuilder();
CriteriaQuery<User> cq = cb.createQuery(User.class);
Root<User> root = cq.from(User.class);
cq.select(root).where(cb.equal(root.get("email"), "a@b.com"));

User user = session.createQuery(cq).getSingleResult();
```

---

## 7. Relationships

### One-to-Many / Many-to-One

```java
@Entity
public class User {
    @Id @GeneratedValue
    Long id;

    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Post> posts = new ArrayList<>();
}

@Entity
public class Post {
    @Id @GeneratedValue
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    User author;
}
```

### Many-to-Many

```java
@Entity
public class Student {
    @ManyToMany
    @JoinTable(
        name = "student_course",
        joinColumns = @JoinColumn(name = "student_id"),
        inverseJoinColumns = @JoinColumn(name = "course_id"))
    List<Course> courses = new ArrayList<>();
}
```

### One-to-One

```java
@Entity
public class User {
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "profile_id")
    Profile profile;
}
```

### Fetch Type

- `LAZY` (default cho `@OneToMany`, `@ManyToMany`): tải khi gọi
- `EAGER` (default cho `@ManyToOne`, `@OneToOne`): tải ngay

**Khuyến nghị:** Mọi quan hệ -> `LAZY`, dùng `JOIN FETCH` khi cần.

---

## 8. Caching

### First-level Cache (mặc định)

Cache trong Session -- cùng query trong cùng Session chỉ chạy 1 lần.

### Second-level Cache

Cache giữa Session -- cần config.

```xml
<property name="hibernate.cache.use_second_level_cache">true</property>
<property name="hibernate.cache.region.factory_class">org.hibernate.cache.jcache.JCacheRegionFactory</property>
```

```java
@Entity
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class Product { ... }
```

---

## Khi nào dùng?

- **Hibernate khi:**
  - CRUD nhiều, business logic phức tạp
  - Team biết JPA
  - Cần object graph traversal
- **NOT Hibernate khi:**
  - Query phức tạp, performance-critical (dùng JdbcTemplate/jOOQ)
  - Reporting, OLAP (dùng SQL trực tiếp)
  - Project nhỏ (JDBC + JdbcTemplate đủ)
- **Best practice:**
  - **LAZY** mọi quan hệ -- chỉ EAGER khi thực sự cần
  - **DTO** projection cho read -- không load full entity
  - `JOIN FETCH` chống N+1
  - **Pagination** với `setMaxResults` / `setFirstResult`
  - **HikariCP** connection pool
  - **Show SQL** trong dev để debug

---

## Lỗi thường gặp

### Lỗi 1: N+1 query

```java
// SAI -- list user, voi moi user load posts -> N+1
List<User> users = session.createQuery("FROM User", User.class).getResultList();
users.forEach(u -> u.getPosts().size()); // N query!

// DUNG -- JOIN FETCH
List<User> users = session.createQuery(
    "SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.posts", User.class)
    .getResultList();
```

### Lỗi 2: LazyInitializationException

```java
// SAI -- truy cap lazy field ngoai session
User u = session.get(User.class, 1L);
session.close();
u.getPosts().size(); // LazyInitializationException

// DUNG -- access trong session, hoac eager fetch khi can
```

### Lỗi 3: Cascade nhầm

```java
// CAN THAN -- cascade DELETE xoa ca con
@OneToMany(cascade = CascadeType.ALL)

// Neu chi muon save cascade
@OneToMany(cascade = CascadeType.PERSIST)
```

### Lỗi 4: Sửa entity ngoài transaction

```java
// SAI
User u = session.get(User.class, 1L);
session.close();
u.setName("New"); // khong save!

// DUNG -- trong session
try (Session session = factory.openSession()) {
    var tx = session.beginTransaction();
    User u = session.get(User.class, 1L);
    u.setName("New");
    tx.commit(); // dirty check tu update
}
```

### Lỗi 5: `equals/hashCode` dùng id

```java
// SAI -- id null truoc khi save -> equals broken
@Override
public boolean equals(Object o) {
    return id.equals(((User)o).id); // NPE neu id null
}

// DUNG -- dung business key hoac kiem tra null
```

---

## Câu hỏi phỏng vấn

### Câu 1: JPA và Hibernate khác gì?

**Trả lời:**

- **JPA** (Jakarta Persistence API): **specification** -- bộ interface chuẩn
- **Hibernate**: **implementation** của JPA -- thực thi cụ thể

Có thể viết code dùng JPA interface, đổi implementation (Hibernate ↔ EclipseLink) mà không sửa code. Thực tế Hibernate có thêm tính năng riêng (`@Cache`, `criteria builder` riêng).

### Câu 2: First-level vs Second-level cache?

**Trả lời:**

- **First-level**: trong Session -- mặc định, không tắt được. Cùng query trong cùng Session chỉ chạy 1 lần
- **Second-level**: giữa các Session (per SessionFactory) -- cần config (EhCache, Hazelcast, Redis). Tăng tốc nếu data ít thay đổi

### Câu 3: N+1 query là gì?

**Trả lời:** Load 1 query lấy N row, sau đó N query bổ sung load relation = **N+1 query**. Vấn đề lớn về performance. Giải pháp:

- `JOIN FETCH` trong JPQL
- `@BatchSize` trên association
- `@EntityGraph` -- specification khi load
- DTO projection thay vì load full entity

### Câu 4: LAZY và EAGER fetch?

**Trả lời:**

- `LAZY`: relation chỉ load khi truy cập -- tiết kiệm nếu không dùng
- `EAGER`: load ngay cùng entity -- nhanh nếu cần, lãng phí nếu không cần

Default `@ToMany` là LAZY, `@ToOne` là EAGER. Khuyến nghị **mọi quan hệ LAZY**, eager khi cần dùng `JOIN FETCH`.

### Câu 5: Dirty Checking là gì?

**Trả lời:** Hibernate **tự động theo dõi** thay đổi của entity trong Session. Khi commit, so sánh với snapshot ban đầu, **tự sinh UPDATE** chỉ cho field thay đổi. Không cần gọi `update()` thủ công. Tiện nhưng cẩn thận -- thay đổi ngoài ý muốn cũng được save.
