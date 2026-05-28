---
sidebar_position: 1
title: "1. Maven"
---

# Maven -- Build tool và quản lý dependency

**Maven** là **build tool** phổ biến nhất trong Java (cùng với Gradle). Giúp quản lý dependency, biên dịch, đóng gói, deploy ứng dụng theo **convention chuẩn**.

**Tương tự đơn giản:** Maven giống **siêu thị bán linh kiện máy tính** -- có **catalog** (Maven Central) liệt kê hàng triệu thư viện. Bạn chỉ ghi cần "thứ X version Y" trong danh sách (pom.xml), Maven tự đi mua, lắp ráp, đóng gói.

---

## Mục lục

- [1. Maven là gì?](#1-maven-là-gì)
- [2. Cấu trúc dự án](#2-cấu-trúc-dự-án)
- [3. pom.xml](#3-pomxml)
- [4. Lifecycle và Phase](#4-lifecycle-và-phase)
- [5. Dependency Management](#5-dependency-management)
- [6. Plugin](#6-plugin)
- [7. Lệnh thường dùng](#7-lệnh-thường-dùng)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Maven là gì?

Maven cung cấp:

- **Convention over Configuration**: Cấu trúc thư mục chuẩn -- ít config
- **Dependency Management**: Tự tải dependency từ **Maven Central**
- **Build Lifecycle**: Các giai đoạn build chuẩn (compile, test, package, install)
- **Plugin System**: Mở rộng tính năng

**Cài đặt:**

```bash
brew install maven       # macOS
sudo apt install maven   # Ubuntu

mvn --version
```

---

## 2. Cấu trúc dự án

```
my-app/
├── pom.xml                           <-- file cau hinh Maven
├── src/
│   ├── main/
│   │   ├── java/                     <-- source code chinh
│   │   │   └── com/app/App.java
│   │   └── resources/                <-- properties, yaml, xml
│   │       └── application.properties
│   └── test/
│       ├── java/                     <-- unit test
│       │   └── com/app/AppTest.java
│       └── resources/                <-- test resources
└── target/                            <-- output (build artifacts)
    ├── classes/
    ├── test-classes/
    └── my-app-1.0.jar
```

Tạo project mới:

```bash
mvn archetype:generate -DgroupId=com.example -DartifactId=my-app \
    -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
```

---

## 3. pom.xml

`pom.xml` (Project Object Model) là **trái tim** của Maven.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>

    <!-- Toa do nhan dien (coordinates) -->
    <groupId>com.example</groupId>
    <artifactId>my-app</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging> <!-- jar, war, pom -->

    <name>My Application</name>
    <description>Mo ta app</description>

    <!-- Properties -->
    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <junit.version>5.10.0</junit.version>
    </properties>

    <!-- Dependencies -->
    <dependencies>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>${junit.version}</version>
            <scope>test</scope>
        </dependency>

        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
            <version>2.16.0</version>
        </dependency>
    </dependencies>

    <!-- Build configuration -->
    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.11.0</version>
            </plugin>
        </plugins>
    </build>
</project>
```

### Coordinates

Mỗi thư viện có **3 thành phần**:

- **groupId**: organization/domain (`com.fasterxml.jackson.core`)
- **artifactId**: tên project (`jackson-databind`)
- **version**: phiên bản (`2.16.0`)

---

## 4. Lifecycle và Phase

Maven có 3 **lifecycle**: `default`, `clean`, `site`. Mỗi lifecycle gồm nhiều **phase** chạy tuần tự.

### Default lifecycle (phổ biến)

```
validate    -> check pom.xml hop le
compile     -> bien dich src/main/java -> target/classes
test        -> chay unit test
package     -> dong goi -> target/my-app.jar
verify      -> chay integration test
install     -> copy jar vao ~/.m2/repository (local)
deploy      -> upload jar len remote repo
```

### Clean lifecycle

```
clean       -> xoa thu muc target/
```

Chạy phase nào, các phase **trước** đều chạy. `mvn install` = validate + compile + test + package + verify + install.

---

## 5. Dependency Management

### Scope

| Scope     | Có trong          | Khi nào dùng                            |
| --------- | ----------------- | --------------------------------------- |
| `compile` | Mọi nơi (default) | Phụ thuộc chính                          |
| `provided` | Compile + test   | Sẵn có ở runtime (servlet-api)           |
| `runtime` | Test + runtime    | Không cần compile (JDBC driver)          |
| `test`    | Chỉ test          | JUnit, Mockito                           |
| `system`  | Local file        | Tránh dùng                               |
| `import`  | BOM               | Import từ BOM trong dependencyManagement |

### Transitive dependency

A depends on B, B depends on C -> A tự có C.

```xml
<!-- Loai tru transitive -->
<dependency>
    <groupId>com.x</groupId>
    <artifactId>a</artifactId>
    <exclusions>
        <exclusion>
            <groupId>com.y</groupId>
            <artifactId>unwanted</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

### BOM (Bill of Materials)

Quản lý version đồng nhất.

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>3.2.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<!-- Sau do dependency khong can version -->
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

---

## 6. Plugin

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <version>3.2.0</version>
    <configuration>
        <skipTests>false</skipTests>
    </configuration>
</plugin>

<!-- Spring Boot plugin -- chay/dong goi -->
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
</plugin>

<!-- Shade plugin -- fat jar -->
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-shade-plugin</artifactId>
    <executions>
        <execution>
            <phase>package</phase>
            <goals>
                <goal>shade</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

---

## 7. Lệnh thường dùng

```bash
mvn clean                     # Xoa target/
mvn compile                   # Bien dich
mvn test                      # Chay test
mvn package                   # Dong goi jar
mvn install                   # Cai vao ~/.m2
mvn clean install             # Clean + install
mvn clean install -DskipTests # Bo qua test

mvn dependency:tree           # Hien cay phu thuoc
mvn dependency:analyze        # Phan tich unused dep
mvn versions:display-dependency-updates # Check update

mvn -P prod package           # Active profile "prod"

# Spring Boot
mvn spring-boot:run
```

---

## Khi nào dùng?

- **Maven khi:**
  - Project enterprise truyền thống
  - Team quen XML, ổn định
  - Spring Boot, Java EE
  - Dùng nhiều plugin có sẵn
- **Gradle khi:**
  - Cần custom build script (Groovy/Kotlin)
  - Build performance quan trọng
  - Android (Gradle là chuẩn)
- **Best practice:**
  - Định nghĩa version trong `<properties>` -- dễ update
  - Dùng **BOM** thay vì duplicate version
  - Commit `mvnw` (Maven wrapper) -- không bắt team cài Maven
  - Chạy `mvn dependency:tree` trước khi exclude

---

## Lỗi thường gặp

### Lỗi 1: Dependency conflict (version)

```bash
mvn dependency:tree | grep "logging"
# A -> logback 1.2.3
# B -> logback 1.4.0
```

**Giải pháp:** Khai báo version trong `<dependencyManagement>` để bắt đồng nhất.

### Lỗi 2: Quên scope test

```xml
<!-- SAI -- JUnit chui ra production jar -->
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter</artifactId>
</dependency>

<!-- DUNG -->
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter</artifactId>
    <scope>test</scope>
</dependency>
```

### Lỗi 3: Build slow do test

```bash
mvn install -DskipTests       # Bo qua chay test
mvn install -Dmaven.test.skip # Bo qua build test
```

### Lỗi 4: Maven Central down

```xml
<!-- Mirror -->
<settings>
    <mirrors>
        <mirror>
            <id>aliyun</id>
            <mirrorOf>central</mirrorOf>
            <url>https://maven.aliyun.com/repository/public</url>
        </mirror>
    </mirrors>
</settings>
```

---

## Câu hỏi phỏng vấn

### Câu 1: Maven hoạt động thế nào?

**Trả lời:** Đọc `pom.xml`, tải dependency từ Maven Central về `~/.m2/repository` (cache local). Chạy theo **lifecycle** -- mỗi phase có goal cụ thể. Plugin thực thi các goal -- ví dụ `maven-compiler-plugin` thực hiện goal `compile`.

### Câu 2: Scope `compile` vs `provided` vs `runtime`?

**Trả lời:**

- `compile` (default): có ở compile + runtime + test
- `provided`: có ở compile + test, **không** đóng vào jar (server cung cấp -- servlet-api)
- `runtime`: có ở runtime + test, không cần compile (JDBC driver)
- `test`: chỉ test (JUnit)

### Câu 3: `mvn install` khác `mvn deploy`?

**Trả lời:**

- `install`: copy artifact vào **local repository** (`~/.m2/repository`) -- chỉ máy bạn
- `deploy`: upload lên **remote repository** (Nexus, Artifactory) -- team/world dùng được

### Câu 4: Transitive dependency là gì?

**Trả lời:** Khi A depends B, B depends C, project có **B + C tự động**. Tiện nhưng có thể gây conflict version. Resolution: nearest definition wins (gần root nhất thắng). Có thể `<exclusions>` hoặc khai báo version mong muốn.

### Câu 5: BOM là gì?

**Trả lời:** Bill of Materials -- file pom đặc biệt **chỉ định version** cho nhiều artifact. Import qua `<scope>import</scope>` trong `<dependencyManagement>`. Spring Boot BOM quản lý ~200 lib -- không lo version conflict. Đảm bảo đồng nhất giữa các module.
