---
sidebar_position: 3
title: "3. Spring Data JPA"
---

# Spring Data JPA -- Repository tự sinh code

**Spring Data JPA** là module của Spring giúp **viết Repository cực ngắn**. Bạn chỉ cần **khai báo interface**, Spring **tự sinh implementation** -- thậm chí query phức tạp dựa vào **tên method**.

**Tương tự đơn giản:** Hibernate cho bạn các "công cụ" thợ mộc. Spring Data JPA giống **robot tự lắp ráp** -- bạn chỉ nói "muốn ghế gỗ có 4 chân", robot tự làm mọi việc.

---

## Mục lục

- [1. Spring Data JPA là gì?](#1-spring-data-jpa-là-gì)
- [2. JpaRepository](#2-jparepository)
- [3. Query methods (Derived)](#3-query-methods-derived)
- [4. `@Query` -- JPQL/Native](#4-query-jpqlnative)
- [5. Pagination và Sorting](#5-pagination-và-sorting)
- [6. Specifications -- query động](#6-specifications-query-động)
- [7. Projections (DTO)](#7-projections-dto)
- [8. Auditing](#8-auditing)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Spring Data JPA là gì?

Spring Data JPA = Spring Data + JPA. Built trên JPA (Hibernate) + abstraction Spring Data:

- **Repository pattern**: chỉ khai báo interface
- **Auto-generate**: implement basic CRUD
- **Query method**: tự sinh query từ tên method
- **Pagination, Specifications**: built-in
- **Auditing**: tự set `createdAt`, `updatedAt`

---

## 2. JpaRepository

```java
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    // KHONG CAN VIET GI -- Spring tu sinh:
    // save, findById, findAll, delete, count...
}

// Su dung
@Service
public class UserService {
    @Autowired UserRepository repo;

    public User get(Long id) {
        return repo.findById(id).orElseThrow();
    }

    public User create(User u) {
        return repo.save(u);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
```

### Cây kế thừa

```
Repository<T, ID>             <-- marker
   |
CrudRepository<T, ID>          <-- CRUD co ban
   |
PagingAndSortingRepository<T, ID> <-- + paging
   |
JpaRepository<T, ID>           <-- + JPA specific (flush, batch)
```

---

## 3. Query methods (Derived)

Spring **đọc tên method** và sinh JPQL.

```java
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    List<User> findByNameContaining(String keyword);
    List<User> findByAgeGreaterThan(int age);
    List<User> findByActiveTrueAndAgeGreaterThan(int age);
    List<User> findTop5ByOrderByCreatedAtDesc();
    long countByActiveTrue();
    boolean existsByEmail(String email);

    @Transactional
    void deleteByEmail(String email);
}
```

### Keywords

| Pattern              | SQL/JPQL                        |
| -------------------- | ------------------------------- |
| `findBy`             | SELECT                          |
| `Containing`         | LIKE %?%                        |
| `StartingWith`       | LIKE ?%                         |
| `EndingWith`         | LIKE %?                         |
| `GreaterThan`        | `>`                             |
| `LessThanEqual`      | `<=`                            |
| `Between`            | BETWEEN ? AND ?                 |
| `In`                 | IN (?)                          |
| `IsNull` / `IsNotNull` | IS NULL / IS NOT NULL         |
| `True` / `False`     | = true / = false                |
| `OrderBy<Field>Desc` | ORDER BY field DESC             |
| `Top5` / `First10`   | LIMIT 5 / LIMIT 10              |

---

## 4. `@Query` -- JPQL/Native

Khi tên method quá dài hoặc query phức tạp.

```java
public interface UserRepository extends JpaRepository<User, Long> {

    // JPQL
    @Query("SELECT u FROM User u WHERE u.email LIKE %:domain")
    List<User> findByEmailDomain(@Param("domain") String domain);

    // Named parameter
    @Query("SELECT u FROM User u WHERE u.age >= :min AND u.age <= :max")
    List<User> findByAgeRange(@Param("min") int min, @Param("max") int max);

    // Native SQL
    @Query(value = "SELECT * FROM users WHERE EXTRACT(YEAR FROM created_at) = :year",
           nativeQuery = true)
    List<User> findCreatedInYear(@Param("year") int year);

    // Modifying
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.role = :role WHERE u.id = :id")
    int updateRole(@Param("id") Long id, @Param("role") Role role);
}
```

---

## 5. Pagination và Sorting

```java
public interface UserRepository extends JpaRepository<User, Long> {
    Page<User> findByActiveTrue(Pageable pageable);
}

// Su dung
Pageable pageable = PageRequest.of(0, 10, Sort.by("name").ascending());
Page<User> page = repo.findByActiveTrue(pageable);

page.getContent();           // List<User>
page.getTotalElements();     // tong so
page.getTotalPages();
page.getNumber();            // page hien tai
page.hasNext();
```

### Sort

```java
Sort sort = Sort.by("name").ascending().and(Sort.by("createdAt").descending());
List<User> users = repo.findAll(sort);
```

### Controller dùng pagination

```java
@GetMapping("/users")
public Page<UserDto> list(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "10") int size,
    @RequestParam(defaultValue = "name,asc") String[] sort) {

    Pageable pageable = PageRequest.of(page, size, Sort.by(...));
    return repo.findAll(pageable).map(this::toDto);
}
```

---

## 6. Specifications -- query động

Khi cần filter có/không nhiều điều kiện tùy người dùng.

```java
public interface UserRepository extends JpaRepository<User, Long>,
                                          JpaSpecificationExecutor<User> { }

public class UserSpecs {
    public static Specification<User> hasName(String name) {
        return (root, query, cb) -> cb.like(root.get("name"), "%" + name + "%");
    }

    public static Specification<User> isActive() {
        return (root, query, cb) -> cb.isTrue(root.get("active"));
    }

    public static Specification<User> ageGreaterThan(int age) {
        return (root, query, cb) -> cb.greaterThan(root.get("age"), age);
    }
}

// Su dung
Specification<User> spec = Specification.where(UserSpecs.isActive())
    .and(UserSpecs.ageGreaterThan(18));
if (name != null) {
    spec = spec.and(UserSpecs.hasName(name));
}

List<User> result = repo.findAll(spec);
```

---

## 7. Projections (DTO)

Thay vì load full entity, lấy chỉ field cần.

### Interface-based

```java
public interface UserSummary {
    Long getId();
    String getName();
    String getEmail();
}

public interface UserRepository extends JpaRepository<User, Long> {
    List<UserSummary> findByActiveTrue();
}
```

### Class-based (DTO)

```java
public record UserDto(Long id, String name, String email) {}

@Query("SELECT new com.app.dto.UserDto(u.id, u.name, u.email) FROM User u")
List<UserDto> findAllAsDto();
```

---

## 8. Auditing

Tự động set `createdAt`, `updatedAt`, `createdBy`, `updatedBy`.

```java
@SpringBootApplication
@EnableJpaAuditing
public class App { ... }

@EntityListeners(AuditingEntityListener.class)
@MappedSuperclass
public abstract class BaseEntity {
    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    @CreatedBy
    private String createdBy;

    @LastModifiedBy
    private String updatedBy;
}

@Entity
public class User extends BaseEntity { ... }
```

---

## Khi nào dùng?

- **Spring Data JPA khi:**
  - CRUD pattern phổ biến
  - Project dùng Spring Boot
  - Cần tiết kiệm code Repository
- **Không nên khi:**
  - Query rất phức tạp -- dùng JdbcTemplate, jOOQ
  - Performance critical -- viết SQL trực tiếp
- **Best practice:**
  - **Constructor injection** Repository
  - DTO projection cho read -- không expose entity
  - Pagination cho list -- không `findAll` cho table lớn
  - `@Transactional` ở **Service**, không Repository
  - `JOIN FETCH` chống N+1

---

## Lỗi thường gặp

### Lỗi 1: `findAll` cho table lớn

```java
// SAI -- 1 trieu row -> OOM
List<User> all = repo.findAll();

// DUNG -- pagination
Page<User> page = repo.findAll(PageRequest.of(0, 100));
```

### Lỗi 2: N+1 với LAZY

```java
// SAI -- moi user load posts -> N+1
List<User> users = repo.findAll();
users.forEach(u -> u.getPosts().size()); // N query

// DUNG -- @EntityGraph hoac JOIN FETCH
@Query("SELECT u FROM User u LEFT JOIN FETCH u.posts")
List<User> findAllWithPosts();
```

### Lỗi 3: Quên `@Modifying`

```java
// SAI -- UPDATE/DELETE can @Modifying
@Query("UPDATE User u SET u.role = :role WHERE u.id = :id")
int updateRole(...);

// DUNG
@Modifying
@Transactional
@Query("UPDATE ...")
```

### Lỗi 4: Tên method sai

```java
// SAI -- typo "Activ" thay "Active"
List<User> findByActiv();
// PropertyReferenceException luc startup

// DUNG
List<User> findByActiveTrue();
```

### Lỗi 5: `@Transactional` ở Controller

```java
// SAI -- transaction nen o Service
@Transactional
@RestController
public class UserController { ... }

// DUNG -- Service
@Service
public class UserService {
    @Transactional
    public void doStuff() { ... }
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: Spring Data JPA hoạt động thế nào?

**Trả lời:** Spring Data tạo **proxy** implement interface Repository lúc app khởi động. Khi gọi method:

- Method có sẵn (`findById`, `save`): gọi implementation chuẩn
- Method custom: parse tên (`findByEmail` -> `WHERE email = ?`) hoặc dùng `@Query`

Tất cả qua JPA (Hibernate).

### Câu 2: Pageable và Sort?

**Trả lời:**

- `Pageable`: chứa page number, size, sort
- `Sort`: tách riêng, dùng khi không cần phân trang

Repository nhận `Pageable` parameter -> trả `Page<T>` chứa data + metadata (total, hasNext).

### Câu 3: `JpaRepository` vs `CrudRepository`?

**Trả lời:**

- `CrudRepository`: CRUD cơ bản (save, find, delete, count)
- `PagingAndSortingRepository`: thêm paging/sorting
- `JpaRepository`: thêm JPA-specific (`flush`, `saveAll`, `findAll(Sort)` trả List thay Iterable)

`JpaRepository` phổ biến nhất.

### Câu 4: Projection -- interface vs class?

**Trả lời:**

- **Interface projection**: Spring tự sinh proxy implement interface -- ngắn, type-safe
- **Class projection** (DTO): tự khai báo class -- linh hoạt, có constructor custom

Cả 2 đều giảm dữ liệu load. Class-based thường dùng với `@Query` JPQL constructor expression.

### Câu 5: Tại sao `@Transactional` ở Service?

**Trả lời:** Transaction nên **bao quanh business logic** -- có thể gọi nhiều Repository trong 1 transaction. Đặt ở Controller -> không đúng layer. Đặt ở Repository -> mỗi method 1 transaction nhỏ, không group được nhiều thao tác.
