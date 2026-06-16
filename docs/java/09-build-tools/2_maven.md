---
sidebar_position: 2
title: "2. Maven"
---

# 2. Maven

Maven là công cụ build phổ biến nhất cho Java, hoạt động theo nguyên tắc "quy ước hơn cấu hình" nên rất dễ học cho người mới. Bài này giới thiệu file `pom.xml`, cách khai báo thư viện, kho Maven Central, các lệnh `mvn` cơ bản và vòng đời build. Nắm vững Maven giúp bạn quản lý dự án Java truyền thống một cách gọn gàng và chuẩn mực.

---

## Mục lục

- [Vì sao dùng Maven?](#vì-sao-dùng-maven)
- [Maven là gì?](#maven-là-gì)
- [File pom.xml](#file-pomxml)
- [groupId, artifactId, version](#groupid-artifactid-version)
- [Khai báo dependencies](#khai-báo-dependencies)
- [Repository và Maven Central](#repository-và-maven-central)
- [Các lệnh mvn cơ bản](#các-lệnh-mvn-cơ-bản)
- [Vòng đời build của Maven](#vòng-đời-build-của-maven)
- [Plugin](#plugin)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao dùng Maven?

**Vấn đề:** Một dự án Java thực tế cần rất nhiều thư viện. Nếu làm thủ công, bạn phải tự lên mạng tải từng file `.jar`, đặt vào classpath, rồi tự tay giải quyết **phụ thuộc chuyền tiếp (transitive dependencies)** — lib A cần lib B, B lại cần C — và xử lý xung đột phiên bản giữa chúng. Đó là một cơn ác mộng: mỗi người trong nhóm build một kiểu, rất khó tái lập kết quả giống nhau.

```bash
# Tải tay từng JAR rồi nhồi hết vào classpath
javac -cp "libs/gson-2.10.1.jar:libs/junit-5.10.0.jar:libs/..." src/...

# Còn các lib mà những lib trên cần? Phải tự đi tìm và tải tiếp.
# Lib nào cần bản nào? Bản nào xung đột? Tự dò bằng tay.
```

**Giải pháp:** **Maven** giải quyết trọn gói. Bạn chỉ cần **khai báo dependency trong `pom.xml`**, Maven sẽ **tự tải** từ repository (kể cả các phụ thuộc chuyền tiếp) và tự quản lý phiên bản. Maven cũng **chuẩn hoá vòng đời build** (compile → test → package → install) theo nguyên tắc "convention over configuration" và áp một cấu trúc thư mục chuẩn.

```xml
<dependencies>
    <!-- Khai báo 1 dependency, Maven tự lo phần còn lại -->
    <dependency>
        <groupId>com.google.code.gson</groupId>
        <artifactId>gson</artifactId>
        <version>2.10.1</version>
    </dependency>
</dependencies>
```

:::tip[Dùng thực tế]

- **Thêm thư viện trong vài giây:** chỉ cần copy vài dòng `<dependency>` vào `pom.xml`, không phải tải JAR thủ công.
- **Build chuẩn cho mọi người:** cả nhóm dùng chung lệnh `mvn clean package`, ai chạy cũng ra kết quả giống nhau.
- **Quản lý phiên bản tập trung:** đổi version thư viện tại một chỗ trong `pom.xml`, áp dụng cho toàn dự án.
- **Tái lập build trên CI:** máy chủ tích hợp liên tục (CI) chạy cùng `pom.xml` nên build giống hệt máy của bạn.

:::

---

## Maven là gì?

**Maven** (đọc là "mây-vừn") là công cụ build phổ biến nhất cho Java. Nó hoạt động theo nguyên tắc **"convention over configuration" (quy ước hơn cấu hình)**: nếu bạn đặt file đúng vị trí quy ước, Maven tự biết phải làm gì mà không cần khai báo dài dòng.

> **Ví dụ đời thường:** Maven giống một căn bếp mẫu được thiết kế sẵn: dao để ngăn này, gia vị để ngăn kia. Vì mọi căn bếp đều bố trí giống nhau, đầu bếp nào vào cũng làm việc được ngay mà không cần hỏi.

Cấu trúc thư mục quy ước của Maven:

```text
my-project/
├── pom.xml                          # File cấu hình chính
└── src/
    ├── main/
    │   ├── java/                    # Mã nguồn chính (.java)
    │   └── resources/               # File tài nguyên (cấu hình, ảnh...)
    └── test/
        ├── java/                    # Mã nguồn cho test
        └── resources/               # Tài nguyên cho test
```

---

## File pom.xml

**POM** là viết tắt của **Project Object Model (mô hình đối tượng dự án)**. File `pom.xml` là "trái tim" của một dự án Maven — nơi khai báo mọi thứ về dự án.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                             http://maven.apache.org/xsd/maven-4.0.0.xsd">

    <!-- Phiên bản chuẩn của file POM, hầu như luôn là 4.0.0 -->
    <modelVersion>4.0.0</modelVersion>

    <!-- Định danh của chính dự án này -->
    <groupId>com.example</groupId>
    <artifactId>my-app</artifactId>
    <version>1.0.0</version>

    <!-- Cấu hình chung cho dự án -->
    <properties>
        <!-- Dùng Java 17 để biên dịch -->
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <!-- Mã hóa file là UTF-8 để hỗ trợ tiếng Việt -->
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

</project>
```

---

## groupId, artifactId, version

Ba thẻ này (gọi tắt là **GAV**) là "căn cước công dân" của dự án, giúp phân biệt nó với mọi dự án khác trên thế giới.

```xml
<!-- groupId: tên tổ chức/công ty, thường viết ngược tên miền -->
<groupId>com.example</groupId>

<!-- artifactId: tên riêng của dự án/thư viện -->
<artifactId>my-app</artifactId>

<!-- version: phiên bản. SNAPSHOT nghĩa là bản đang phát triển -->
<version>1.0.0</version>
```

> **Ví dụ đời thường:** `groupId` giống họ (Nguyễn, Trần...), `artifactId` giống tên riêng, còn `version` giống "phiên bản tuổi" của bạn năm nay. Kết hợp cả ba thì xác định được duy nhất một người.

> **Lưu ý:** Đuôi `-SNAPSHOT` (ví dụ `1.0.0-SNAPSHOT`) báo cho Maven biết đây là bản đang phát triển, chưa ổn định, có thể thay đổi liên tục.

---

## Khai báo dependencies

Để dùng thư viện ngoài, bạn khai báo trong thẻ `<dependencies>`:

```xml
<dependencies>
    <!-- Thư viện Gson để đọc/ghi JSON -->
    <dependency>
        <groupId>com.google.code.gson</groupId>
        <artifactId>gson</artifactId>
        <version>2.10.1</version>
    </dependency>

    <!-- JUnit 5 để viết unit test -->
    <dependency>
        <groupId>org.junit.jupiter</groupId>
        <artifactId>junit-jupiter</artifactId>
        <version>5.10.0</version>
        <!-- scope = test: chỉ dùng khi chạy test, không đóng gói vào sản phẩm -->
        <scope>test</scope>
    </dependency>
</dependencies>
```

Thẻ `<scope>` cho biết phạm vi sử dụng của thư viện:

- `compile` (mặc định): dùng ở mọi nơi.
- `test`: chỉ dùng khi chạy test.
- `provided`: máy chủ sẽ cung cấp, không đóng gói kèm.
- `runtime`: chỉ cần khi chạy, không cần khi biên dịch.

---

## Repository và Maven Central

**Repository (kho chứa)** là nơi lưu trữ các thư viện. Có hai loại chính:

- **Maven Central**: kho công khai khổng lồ trên Internet, chứa gần như mọi thư viện Java. Đây là nơi Maven tự động tải thư viện về.
- **Local repository (kho cục bộ)**: thư mục `~/.m2/repository` trên máy bạn, nơi Maven lưu lại các thư viện đã tải để lần sau dùng không phải tải lại.

> **Ví dụ đời thường:** Maven Central giống siêu thị lớn ngoài thành phố — có đủ mọi thứ. Local repository giống tủ lạnh nhà bạn — lần đầu phải ra siêu thị mua, nhưng mua rồi thì cất vào tủ, lần sau lấy ra dùng ngay khỏi đi mua nữa.

---

## Các lệnh mvn cơ bản

Bạn chạy Maven bằng lệnh `mvn` trong terminal:

```bash
# Xóa thư mục target/ (sản phẩm build cũ)
mvn clean

# Biên dịch mã nguồn chính
mvn compile

# Chạy toàn bộ unit test
mvn test

# Đóng gói thành file .jar (tự chạy compile + test trước)
mvn package

# Cài file .jar vào kho cục bộ ~/.m2 để dự án khác dùng được
mvn install

# Kết hợp: dọn sạch rồi đóng gói lại từ đầu (rất hay dùng)
mvn clean package
```

---

## Vòng đời build của Maven

Maven có một **vòng đời (lifecycle)** với các giai đoạn (phase) chạy theo thứ tự cố định. Khi bạn gọi một phase, Maven **tự động chạy tất cả phase đứng trước nó**.

```text
validate → compile → test → package → verify → install → deploy
```

Ví dụ: khi bạn gõ `mvn package`, Maven sẽ tự chạy lần lượt `validate`, `compile`, `test` rồi mới `package`.

> **Ví dụ đời thường:** Giống thang cuốn đi lên: bạn muốn lên tầng 4 (package) thì bắt buộc phải đi qua tầng 1, 2, 3. Không thể nhảy thẳng lên tầng 4 mà bỏ qua các tầng dưới.

---

## Plugin

**Plugin (phần mở rộng)** là thứ thực sự làm công việc trong Maven. Mỗi phase được thực thi bởi một plugin nào đó. Bạn cũng có thể thêm plugin để làm việc đặc biệt.

```xml
<build>
    <plugins>
        <!-- Plugin tạo file .jar có thể chạy trực tiếp bằng java -jar -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-jar-plugin</artifactId>
            <version>3.4.1</version>
            <configuration>
                <archive>
                    <manifest>
                        <!-- Chỉ định class chứa hàm main -->
                        <mainClass>com.example.Main</mainClass>
                    </manifest>
                </archive>
            </configuration>
        </plugin>
    </plugins>
</build>
```

> **Ví dụ đời thường:** Maven là một chiếc máy khoan, còn plugin là các đầu khoan khác nhau. Muốn khoan tường thì lắp đầu này, muốn vặn vít thì lắp đầu khác. Bản thân Maven không làm gì cả — plugin mới làm việc.

---

## Lỗi thường gặp

- **`mvn` không phải là lệnh nội bộ.** Bạn chưa cài Maven hoặc chưa thêm vào biến môi trường `PATH`. Kiểm tra bằng `mvn -version`.
- **Sai groupId/artifactId/version của dependency.** Maven sẽ báo `Could not find artifact`. Hãy copy chính xác từ trang [search.maven.org](https://search.maven.org).
- **Đặt file Java sai thư mục.** Maven chỉ tìm code trong `src/main/java`. Để code chỗ khác sẽ không được biên dịch.
- **Quên thẻ `<scope>test</scope>` cho thư viện test.** Khiến thư viện test bị đóng gói nhầm vào sản phẩm cuối, làm file `.jar` nặng hơn cần thiết.
- **Không chạy `mvn clean` trước khi build lại.** Đôi khi file cũ trong `target/` gây kết quả sai. Thói quen tốt là dùng `mvn clean package`.

---

## Tóm tắt

- **Maven** là công cụ build Java phổ biến nhất, theo nguyên tắc "quy ước hơn cấu hình".
- File **`pom.xml`** là trái tim của dự án, khai báo `groupId`, `artifactId`, `version` (GAV).
- **Dependencies** được khai báo trong thẻ `<dependencies>`, với `<scope>` xác định phạm vi dùng.
- **Maven Central** là kho thư viện công khai; **local repository** (`~/.m2`) lưu thư viện đã tải.
- Các lệnh chính: `mvn clean`, `compile`, `test`, `package`, `install`.
- **Vòng đời** chạy tuần tự; gọi một phase sẽ tự chạy các phase trước nó.
- **Plugin** là thứ thực sự thực thi công việc trong từng phase.
