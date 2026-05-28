---
sidebar_position: 3
title: "3. Bazel"
---

# Bazel -- Build tool của Google

**Bazel** là build tool **mã nguồn mở** của Google (phiên bản nội bộ là Blaze). Thiết kế cho **monorepo lớn**, nhiều ngôn ngữ, build **chính xác và nhanh**. Phù hợp khi project có hàng triệu file, dùng C++/Go/Python/Java cùng lúc.

**Tương tự đơn giản:** Maven/Gradle giống **thợ thủ công** -- mỗi project một loại, mỗi ngôn ngữ một workflow. Bazel giống **dây chuyền lắp ráp ô tô** -- tự động, song song, đảm bảo output **giống nhau** ở mọi máy. Phù hợp **nhà máy lớn**, không phù hợp **shop nhỏ**.

---

## Mục lục

- [1. Bazel là gì?](#1-bazel-là-gì)
- [2. WORKSPACE và BUILD](#2-workspace-và-build)
- [3. Target và Rule](#3-target-và-rule)
- [4. Java với Bazel](#4-java-với-bazel)
- [5. Lệnh thường dùng](#5-lệnh-thường-dùng)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Bazel là gì?

Đặc điểm:

- **Hermetic build**: build trong sandbox, kết quả **deterministic** -- cùng input ra cùng output
- **Incremental**: chỉ build phần thay đổi (graph dependency)
- **Distributed cache**: chia sẻ build artifacts qua mạng
- **Multi-language**: Java, C++, Python, Go, JS, Swift, Rust...
- **Scale**: dùng cho codebase **triệu file** (Google, Uber, Dropbox, Stripe)

**Cài đặt:**

```bash
brew install bazel       # macOS
# Hoac dung Bazelisk -- auto-update Bazel
brew install bazelisk

bazel --version
```

---

## 2. WORKSPACE và BUILD

### WORKSPACE (gốc project)

Khai báo external dependencies.

```python
# WORKSPACE
load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

http_archive(
    name = "rules_jvm_external",
    sha256 = "...",
    strip_prefix = "rules_jvm_external-5.3",
    url = "https://github.com/bazelbuild/rules_jvm_external/archive/5.3.tar.gz",
)

load("@rules_jvm_external//:defs.bzl", "maven_install")

maven_install(
    artifacts = [
        "com.google.guava:guava:32.1.3-jre",
        "junit:junit:4.13.2",
    ],
    repositories = [
        "https://repo1.maven.org/maven2",
    ],
)
```

### BUILD (mỗi package)

Khai báo target trong package.

```python
# src/main/java/com/example/BUILD
java_library(
    name = "user",
    srcs = ["User.java"],
    deps = [
        "@maven//:com_google_guava_guava",
    ],
    visibility = ["//visibility:public"],
)

java_binary(
    name = "app",
    main_class = "com.example.App",
    srcs = ["App.java"],
    deps = [":user"],
)
```

---

## 3. Target và Rule

- **Target**: đơn vị build (jar, executable, test) -- định danh bằng `//path:name`
- **Rule**: định nghĩa cách build target (`java_library`, `java_binary`, `cc_binary`)

### Label

```
//src/main/java/com/example:user
       ^                      ^
    package                target_name
```

### Rule Java phổ biến

| Rule              | Mô tả                          |
| ----------------- | ------------------------------ |
| `java_library`    | Tạo .jar library               |
| `java_binary`     | Tạo executable jar             |
| `java_test`       | Đơn vị test                    |
| `java_import`     | Import jar có sẵn              |
| `java_proto_library` | Generate code từ .proto      |

---

## 4. Java với Bazel

### Project structure

```
my-app/
├── WORKSPACE
├── BUILD
├── src/
│   ├── main/java/com/example/
│   │   ├── BUILD
│   │   ├── App.java
│   │   └── User.java
│   └── test/java/com/example/
│       ├── BUILD
│       └── UserTest.java
```

### `src/main/java/com/example/BUILD`

```python
load("@rules_java//java:defs.bzl", "java_binary", "java_library")

java_library(
    name = "lib",
    srcs = glob(["*.java"]),
    deps = [
        "@maven//:com_google_guava_guava",
    ],
    visibility = ["//src/test/java/com/example:__pkg__"],
)

java_binary(
    name = "App",
    main_class = "com.example.App",
    runtime_deps = [":lib"],
)
```

### `src/test/java/com/example/BUILD`

```python
load("@rules_java//java:defs.bzl", "java_test")

java_test(
    name = "UserTest",
    srcs = ["UserTest.java"],
    test_class = "com.example.UserTest",
    deps = [
        "//src/main/java/com/example:lib",
        "@maven//:junit_junit",
    ],
)
```

---

## 5. Lệnh thường dùng

```bash
bazel build //...                          # build tat ca target
bazel build //src/main/java/com/example:App
bazel run //src/main/java/com/example:App  # build + chay
bazel test //src/test/...                  # chay test
bazel clean                                 # xoa cache

# Truy van
bazel query //...                          # liet ke target
bazel query 'deps(//src/...:App)'          # cay phu thuoc
bazel query 'rdeps(//..., //src/...:lib)' # ai dung lib nay

# Cache
bazel build --disk_cache=/tmp/bazel-cache //...

# Build voi remote cache
bazel build --remote_cache=grpc://... //...
```

---

## Khi nào dùng?

- **Bazel khi:**
  - Monorepo lớn (hàng nghìn module trở lên)
  - Nhiều ngôn ngữ (Java + C++ + Python + Go)
  - Cần hermetic build (CI/CD chính xác)
  - Cần distributed cache (team lớn)
  - Build time là bottleneck
- **KHÔNG nên Bazel khi:**
  - Project nhỏ-vừa (Maven/Gradle đủ)
  - Team chưa quen
  - Ecosystem Java thuần (Maven nhiều plugin hơn)
- **Best practice:**
  - Dùng **Bazelisk** thay vì cài Bazel trực tiếp -- auto version
  - Khai báo `visibility` rõ ràng -- module hóa
  - Granular target -- nhiều `java_library` nhỏ thay vì 1 lớn
  - Tận dụng **remote cache** trong CI

---

## Lỗi thường gặp

### Lỗi 1: Visibility quá rộng

```python
# SAI -- public toan bo
visibility = ["//visibility:public"]

# DUNG -- chi expose cho cai can
visibility = ["//src/test/java/com/example:__pkg__"]
```

### Lỗi 2: Missing dependency

```
ERROR: /path/BUILD:5:13: ... cannot find symbol
```

Cần thêm vào `deps`. Bazel **strict** -- không cho transitive dùng tự nhiên như Maven.

### Lỗi 3: Non-hermetic

```python
# SAI -- dung file ngoai workspace
genrule(
    cmd = "cp /etc/passwd $@", # KHONG hermetic
)

# DUNG -- chi dung input declared
```

### Lỗi 4: Glob bừa

```python
# SAI -- glob xa, recursive
srcs = glob(["**/*.java"])

# DUNG -- glob chinh xac
srcs = glob(["*.java"])
```

---

## Câu hỏi phỏng vấn

### Câu 1: Bazel khác Maven/Gradle thế nào?

**Trả lời:**

- **Hermetic**: Bazel sandbox build, kết quả deterministic -- Maven/Gradle có thể phụ thuộc env
- **Multi-language**: Bazel hỗ trợ nhiều ngôn ngữ native -- Maven/Gradle Java-centric
- **Scale**: Bazel cho monorepo triệu file -- Maven/Gradle khó scale ở mức đó
- **Trade-off**: Setup phức tạp, learning curve dốc

### Câu 2: Hermetic build là gì?

**Trả lời:** Build chạy trong **môi trường cô lập** -- chỉ dùng input declared, không phụ thuộc env (PATH, env vars). Kết quả **deterministic** -- cùng commit + cùng input = cùng output bytewise. Quan trọng cho reproducible builds, security.

### Câu 3: Tại sao Bazel nhanh trên monorepo lớn?

**Trả lời:**

- **Incremental**: chỉ build target ảnh hưởng
- **Caching**: action cache (local), remote cache (CI)
- **Parallel**: chạy task độc lập song song
- **Distributed execution**: chạy build trên cluster (RBE)

Build 1M files: Bazel < 1 phút (cache hit), Maven/Gradle > 10 phút.

### Câu 4: Khi nào KHÔNG nên dùng Bazel?

**Trả lời:**

- Project nhỏ -- setup phức tạp không đáng
- Team quen Maven/Gradle -- chi phí học cao
- Java thuần -- Maven plugin nhiều hơn
- Chưa có CI/cache infrastructure -- không tận dụng được lợi thế

### Câu 5: Visibility trong Bazel là gì?

**Trả lời:** Cơ chế module hóa -- target chỉ dùng được bởi target có quyền. Giá trị:

- `["//visibility:private"]`: chỉ trong cùng package
- `["//visibility:public"]`: ai cũng dùng
- `["//some/package:__pkg__"]`: 1 package cụ thể
- `["//some/package:__subpackages__"]`: bao gồm subpackage

Buộc dependency tường minh -- tránh tight coupling.
