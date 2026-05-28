---
sidebar_position: 2
title: "2. Gradle"
---

# Gradle -- Build tool linh hoạt

**Gradle** là build tool **thế hệ mới** -- script bằng **Groovy** hoặc **Kotlin DSL** thay vì XML. Linh hoạt, nhanh hơn Maven, là **chuẩn** cho Android development.

**Tương tự đơn giản:** Maven giống **bộ Lego có sẵn mẫu** -- ghép theo hướng dẫn cố định. Gradle giống **đất sét** -- nhào nặn tự do theo ý mình. Linh hoạt hơn nhưng cần kỹ năng.

---

## Mục lục

- [1. Gradle là gì?](#1-gradle-là-gì)
- [2. Cấu trúc dự án](#2-cấu-trúc-dự-án)
- [3. build.gradle (Groovy DSL)](#3-buildgradle-groovy-dsl)
- [4. build.gradle.kts (Kotlin DSL)](#4-buildgradlekts-kotlin-dsl)
- [5. Task và Plugin](#5-task-và-plugin)
- [6. Dependency Management](#6-dependency-management)
- [7. Lệnh thường dùng](#7-lệnh-thường-dùng)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Gradle là gì?

Gradle:

- Script bằng **Groovy** (cũ) hoặc **Kotlin** (mới, khuyến nghị)
- **Incremental build** -- chỉ chạy lại task có input thay đổi
- **Build cache** -- chia sẻ kết quả giữa máy/CI
- **Daemon** -- giữ process chạy giữa các lần build
- Hỗ trợ **multi-project**, **multi-language**

**Cài đặt:**

```bash
brew install gradle      # macOS
sdk install gradle       # SDKMAN (khuyến nghị)
gradle --version
```

---

## 2. Cấu trúc dự án

```
my-app/
├── build.gradle.kts          (hoac build.gradle)
├── settings.gradle.kts        (ten project, sub-project)
├── gradle.properties          (config build)
├── gradlew                    (wrapper script Unix)
├── gradlew.bat                (wrapper script Windows)
├── gradle/wrapper/
│   ├── gradle-wrapper.jar
│   └── gradle-wrapper.properties
├── src/
│   ├── main/
│   │   ├── java/
│   │   └── resources/
│   └── test/
│       ├── java/
│       └── resources/
└── build/                     (output)
```

Tạo project mới:

```bash
gradle init --type java-application --dsl kotlin
```

---

## 3. build.gradle (Groovy DSL)

```groovy
plugins {
    id 'java'
    id 'application'
    id 'org.springframework.boot' version '3.2.0'
}

group = 'com.example'
version = '1.0.0'

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(17)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'com.fasterxml.jackson.core:jackson-databind:2.16.0'

    testImplementation 'org.junit.jupiter:junit-jupiter:5.10.0'
    testImplementation 'org.mockito:mockito-core:5.7.0'
}

tasks.test {
    useJUnitPlatform()
}

application {
    mainClass = 'com.example.App'
}
```

---

## 4. build.gradle.kts (Kotlin DSL)

Type-safe, IDE autocomplete tốt hơn.

```kotlin
plugins {
    java
    application
    id("org.springframework.boot") version "3.2.0"
}

group = "com.example"
version = "1.0.0"

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(17))
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("com.fasterxml.jackson.core:jackson-databind:2.16.0")

    testImplementation("org.junit.jupiter:junit-jupiter:5.10.0")
}

tasks.test {
    useJUnitPlatform()
}

application {
    mainClass.set("com.example.App")
}
```

---

## 5. Task và Plugin

### Task -- đơn vị build

```kotlin
tasks.register("hello") {
    doLast {
        println("Hello from Gradle!")
    }
}
```

```bash
./gradlew hello
# Hello from Gradle!
```

### Phụ thuộc giữa task

```kotlin
tasks.register("compile") { ... }
tasks.register("package_") {
    dependsOn("compile")
    doLast { println("Packaging") }
}
```

### Plugin -- gói task có sẵn

| Plugin               | Cung cấp                             |
| -------------------- | ------------------------------------ |
| `java`               | compileJava, test, jar               |
| `application`        | run, distZip                         |
| `java-library`       | API/implementation distinction       |
| `org.springframework.boot` | bootRun, bootJar, bootBuildImage |

---

## 6. Dependency Management

### Configuration

| Configuration              | Tương đương Maven                  |
| -------------------------- | ---------------------------------- |
| `implementation`           | `compile` (không expose transitively) |
| `api`                      | `compile` (expose) -- với java-library |
| `runtimeOnly`              | `runtime`                          |
| `compileOnly`              | `provided`                         |
| `testImplementation`       | `test`                             |
| `annotationProcessor`      | Lombok, MapStruct                  |

```kotlin
dependencies {
    implementation("com.x:lib:1.0")     // dung trong project, khong leak ra ngoai
    api("com.y:lib:1.0")                // expose cho consumer
    runtimeOnly("com.mysql:driver:8.0") // chi runtime
    testImplementation("junit:junit:4.13.2")
    annotationProcessor("org.projectlombok:lombok:1.18.30")
    compileOnly("org.projectlombok:lombok:1.18.30")
}
```

### Exclude transitive

```kotlin
implementation("com.x:a:1.0") {
    exclude(group = "com.y", module = "unwanted")
}
```

### Version Catalog (Gradle 7+)

`gradle/libs.versions.toml`:

```toml
[versions]
spring-boot = "3.2.0"
jackson = "2.16.0"

[libraries]
spring-boot-starter-web = { module = "org.springframework.boot:spring-boot-starter-web", version.ref = "spring-boot" }
jackson-databind = { module = "com.fasterxml.jackson.core:jackson-databind", version.ref = "jackson" }

[plugins]
spring-boot = { id = "org.springframework.boot", version.ref = "spring-boot" }
```

```kotlin
dependencies {
    implementation(libs.spring.boot.starter.web)
    implementation(libs.jackson.databind)
}
```

---

## 7. Lệnh thường dùng

```bash
./gradlew tasks               # Liet ke task
./gradlew build               # Compile + test + jar
./gradlew clean               # Xoa build/
./gradlew test                # Chay test
./gradlew run                 # Chay (neu co application plugin)
./gradlew jar                 # Tao jar

./gradlew dependencies        # Cay phu thuoc
./gradlew dependencyUpdates   # Check update (plugin com.github.ben-manes.versions)

./gradlew bootRun             # Spring Boot
./gradlew bootJar             # Fat jar

./gradlew -x test build       # Bo qua test
./gradlew --offline build     # Offline mode
./gradlew --refresh-dependencies build # Tai lai dep
./gradlew --build-cache build # Dung cache

# Multi-project
./gradlew :sub-project:build
```

---

## Khi nào dùng?

- **Gradle khi:**
  - Android (chuẩn)
  - Build phức tạp (multi-module, multi-language)
  - Cần custom build logic
  - Cần performance build cao
- **Maven khi:**
  - Team quen, ổn định
  - Project enterprise Java EE truyền thống
  - Ít custom
- **Best practice:**
  - **Kotlin DSL** thay vì Groovy -- type-safe, IDE tốt
  - Dùng **wrapper** (`./gradlew`) -- pin version
  - Version Catalog -- quản lý version tập trung
  - `implementation` thay `api` trừ khi cần expose
  - Bật **build cache** và **parallel** trong `gradle.properties`

---

## Lỗi thường gặp

### Lỗi 1: Dùng `compile` (deprecated)

```kotlin
// SAI
compile("com.x:y:1.0")

// DUNG
implementation("com.x:y:1.0")
```

### Lỗi 2: `api` lạm dụng

```kotlin
// SAI -- moi transitive leak ra ngoai
api("com.x:y:1.0")

// DUNG -- chi api khi lib la phan cua API cua module
implementation("com.x:y:1.0")
```

### Lỗi 3: Version conflict

```bash
./gradlew dependencies | grep lib
# Xem conflict -> dung resolutionStrategy
```

```kotlin
configurations.all {
    resolutionStrategy {
        force("com.x:y:2.0")
    }
}
```

### Lỗi 4: Daemon ngốn RAM

```properties
# gradle.properties
org.gradle.jvmargs=-Xmx4g
org.gradle.daemon=true
org.gradle.parallel=true
org.gradle.caching=true
```

---

## Câu hỏi phỏng vấn

### Câu 1: Gradle khác Maven thế nào?

**Trả lời:**

- **Script**: Gradle dùng Groovy/Kotlin, Maven dùng XML
- **Performance**: Gradle nhanh hơn (incremental, daemon, cache)
- **Flexibility**: Gradle linh hoạt -- code logic build; Maven cứng -- chỉ config
- **Learning curve**: Maven dễ hơn, Gradle phức tạp

Gradle chuẩn cho Android, Maven phổ biến trong Java enterprise.

### Câu 2: `implementation` và `api` khác gì?

**Trả lời:**

- `implementation`: dependency dùng nội bộ, **không leak** ra consumer
- `api`: dependency là phần của API, **expose** cho consumer

Ví dụ module A `implementation("lib")` -- module B dùng A **không nhận lib**. Nếu A `api("lib")` -- B nhận lib. Ưu tiên `implementation` để tránh tight coupling.

### Câu 3: Gradle Daemon là gì?

**Trả lời:** Long-running JVM process giữ giữa các lần build. Tiết kiệm thời gian khởi động JVM, cache class, AST -- build sau nhanh hơn build đầu **đáng kể**. Bật/tắt qua `org.gradle.daemon`.

### Câu 4: Build cache khác Daemon cache?

**Trả lời:**

- **Daemon cache**: in-memory, theo session daemon -- mất khi daemon chết
- **Build cache**: trên disk (local) hoặc remote (CI shared) -- persistent. Cache task outputs theo input hash -- task không chạy lại nếu input không đổi.

### Câu 5: Version Catalog dùng để làm gì?

**Trả lời:** Quản lý version dependency **tập trung** trong file TOML. Tránh duplicate, dễ update. Khai báo 1 lần, reference từ mọi `build.gradle.kts`. Tương đương BOM của Maven nhưng linh hoạt hơn.
