---
sidebar_position: 1
title: "1. I/O Operations (Stream nhập xuất)"
---

# I/O Operations -- Nhập xuất dữ liệu trong Java

**I/O** (Input/Output) là quá trình đọc/ghi dữ liệu giữa chương trình và **nguồn bên ngoài** (file, console, network, memory). Java có 2 hệ thống I/O:

- **Byte Stream** (`InputStream`, `OutputStream`) -- xử lý **byte** (binary)
- **Character Stream** (`Reader`, `Writer`) -- xử lý **char** (text, có encoding)

**Tương tự đơn giản:** Hãy tưởng tượng I/O như **đường ống nước**. Một đầu là nguồn (file), đầu kia là chương trình. Bạn mở van (open stream), nước chảy, đóng van (close). Có ống **bằng kim loại** (byte stream) và ống **đặc biệt cho nước ngọt** (character stream).

---

## Mục lục

- [1. Hệ thống I/O của Java](#1-hệ-thống-io-của-java)
- [2. Byte Stream](#2-byte-stream)
- [3. Character Stream](#3-character-stream)
- [4. Buffered I/O](#4-buffered-io)
- [5. Standard I/O (System.in/out/err)](#5-standard-io-systeminouterr)
- [6. Serialization](#6-serialization)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Hệ thống I/O của Java

```
java.io (cu)                 java.nio (moi, Java 7+)
- InputStream/OutputStream   - Channel, Buffer
- Reader/Writer              - Path, Files
- File                       - Async I/O
```

| Đặc điểm     | java.io                | java.nio              |
| ------------ | ---------------------- | --------------------- |
| Model        | Stream-based, blocking | Buffer-based, non-blocking |
| API          | Cũ, dài                | Mới, ngắn (Files)     |
| Performance  | OK                     | Tốt hơn cho lớn       |

Bài này tập trung vào **java.io**. File operations chi tiết hơn ở bài sau.

---

## 2. Byte Stream

Xử lý dữ liệu **byte** -- phù hợp file binary (image, video, zip).

### `InputStream` -- đọc byte

```java
import java.io.*;

try (InputStream in = new FileInputStream("data.bin")) {
    int b;
    while ((b = in.read()) != -1) {
        // b la 1 byte (0-255)
        System.out.print((char) b);
    }
}
```

### `OutputStream` -- ghi byte

```java
try (OutputStream out = new FileOutputStream("output.bin")) {
    byte[] data = {65, 66, 67}; // A, B, C
    out.write(data);
}
```

### `read(byte[])` -- đọc theo block

```java
try (InputStream in = new FileInputStream("big.bin")) {
    byte[] buffer = new byte[4096];
    int n;
    while ((n = in.read(buffer)) != -1) {
        // Xu ly buffer[0..n]
    }
}
```

---

## 3. Character Stream

Xử lý dữ liệu **text** -- tự động decode/encode theo charset.

### `Reader` -- đọc char

```java
try (Reader reader = new FileReader("text.txt", StandardCharsets.UTF_8)) {
    int c;
    while ((c = reader.read()) != -1) {
        System.out.print((char) c);
    }
}
```

### `Writer` -- ghi char

```java
try (Writer writer = new FileWriter("output.txt", StandardCharsets.UTF_8)) {
    writer.write("Xin chao Viet Nam!");
}
```

**Charset (encoding):**

- `UTF-8` -- mặc định, khuyên dùng
- `UTF-16`, `ISO-8859-1`...
- Quên charset -> chữ tiếng Việt bị lỗi

---

## 4. Buffered I/O

Đọc/ghi từng byte chậm vì mỗi lần gọi tới OS. **Buffered** đọc/ghi theo **block** -- nhanh hơn nhiều.

### Đọc text theo dòng

```java
try (BufferedReader br = new BufferedReader(
        new FileReader("file.txt", StandardCharsets.UTF_8))) {
    String line;
    while ((line = br.readLine()) != null) {
        System.out.println(line);
    }
}
```

### Ghi text

```java
try (BufferedWriter bw = new BufferedWriter(
        new FileWriter("out.txt", StandardCharsets.UTF_8))) {
    bw.write("Dong 1");
    bw.newLine();
    bw.write("Dong 2");
}
```

### Buffered byte

```java
try (InputStream in = new BufferedInputStream(new FileInputStream("file.bin"));
     OutputStream out = new BufferedOutputStream(new FileOutputStream("copy.bin"))) {
    byte[] buf = new byte[8192];
    int n;
    while ((n = in.read(buf)) != -1) {
        out.write(buf, 0, n);
    }
}
```

---

## 5. Standard I/O (System.in/out/err)

```java
// System.out -- PrintStream
System.out.println("Hello");
System.out.printf("Name: %s, Age: %d%n", "Alice", 25);

// System.err -- error stream
System.err.println("Loi roi");

// System.in -- InputStream
Scanner scanner = new Scanner(System.in);
System.out.print("Ten ban: ");
String name = scanner.nextLine();

// Doc nhieu kieu
int age = scanner.nextInt();
double salary = scanner.nextDouble();
scanner.close();
```

### Console (Java 6+)

```java
Console console = System.console();
if (console != null) {
    String name = console.readLine("Ten: ");
    char[] password = console.readPassword("Mat khau: "); // an
}
```

---

## 6. Serialization

Lưu/đọc object xuống/lên byte stream.

```java
import java.io.*;

class User implements Serializable {
    private static final long serialVersionUID = 1L;
    String name;
    int age;
    transient String tempField; // khong serialize

    User(String name, int age) {
        this.name = name;
        this.age = age;
    }
}

// Ghi
try (ObjectOutputStream oos = new ObjectOutputStream(
        new FileOutputStream("user.dat"))) {
    oos.writeObject(new User("Alice", 25));
}

// Doc
try (ObjectInputStream ois = new ObjectInputStream(
        new FileInputStream("user.dat"))) {
    User u = (User) ois.readObject();
    System.out.println(u.name);
}
```

**Lưu ý:**

- Class phải `implements Serializable`
- `serialVersionUID` -- version, đổi khi class thay đổi
- `transient` -- field bỏ qua khi serialize
- Serialization Java **có rủi ro bảo mật** -- không deserialize data không tin cậy

**Khuyến nghị:** Dùng **JSON** (Jackson, Gson) thay thế cho Serializable.

---

## Khi nào dùng?

- **Byte Stream**: File binary (image, video, zip), network protocol
- **Character Stream**: File text (UTF-8, log, CSV)
- **Buffered**: Hầu hết case -- nhanh hơn
- **Scanner**: Input đơn giản từ console
- **Files (NIO)**: Java 8+ khuyến nghị cho file đơn giản
- **Best practice:**
  - **LUÔN** dùng try-with-resources
  - **LUÔN** chỉ định charset (UTF-8)
  - Dùng **Buffered** cho hiệu năng
  - Tránh `Object Serialization` -- dùng JSON

---

## Lỗi thường gặp

### Lỗi 1: Quên close resource

```java
// SAI -- resource leak
FileInputStream fis = new FileInputStream("file");
// quen close

// DUNG -- try-with-resources
try (FileInputStream fis = new FileInputStream("file")) {
    // ...
}
```

### Lỗi 2: Quên charset

```java
// SAI -- charset mac dinh OS (co the khac nhau)
Reader r = new FileReader("file.txt");

// DUNG
Reader r = new FileReader("file.txt", StandardCharsets.UTF_8);
```

### Lỗi 3: Không buffered

```java
// CHAM -- moi read 1 byte 1 syscall
FileInputStream in = new FileInputStream("big.bin");
int b;
while ((b = in.read()) != -1) ...

// NHANH
BufferedInputStream in = new BufferedInputStream(
    new FileInputStream("big.bin"));
```

### Lỗi 4: `read()` trả `int` không phải `byte`

```java
// SAI
byte b = in.read(); // byte chi -128..127, mat thong tin

// DUNG -- giu int de check -1
int b;
while ((b = in.read()) != -1) {
    process((byte) b);
}
```

### Lỗi 5: Deserialize untrusted data

```java
// SAI -- co the RCE
ObjectInputStream ois = new ObjectInputStream(networkInput);
Object obj = ois.readObject(); // VULN

// DUNG -- dung JSON
ObjectMapper mapper = new ObjectMapper();
User u = mapper.readValue(networkInput, User.class);
```

---

## Câu hỏi phỏng vấn

### Câu 1: Byte Stream vs Character Stream?

**Trả lời:**

- **Byte Stream** (`InputStream`, `OutputStream`): xử lý byte, dùng cho **binary** (image, video). Không biết encoding.
- **Character Stream** (`Reader`, `Writer`): xử lý char, dùng cho **text**, có encoding (UTF-8...). Tự động decode/encode.

Có thể chuyển byte stream sang character stream bằng `InputStreamReader`.

### Câu 2: Tại sao cần Buffered I/O?

**Trả lời:** Mỗi lần `read()` gọi xuống OS = **syscall** rất tốn. Buffered đọc 1 lần 4KB-8KB vào buffer nội bộ, sau đó trả từng byte/char từ buffer -- nhanh hơn **hàng chục lần**. Tương tự cho write.

### Câu 3: try-with-resources hoạt động thế nào?

**Trả lời:** Java 7+. Resource implement `AutoCloseable` được tự động `close()` ở cuối block, **ngay cả khi có exception**. Tránh resource leak, gọn hơn try-finally thủ công.

```java
try (FileInputStream in = ...; FileOutputStream out = ...) {
    // use
} // tu dong close in, out theo thu tu nguoc
```

### Câu 4: Serialization là gì và sao nên tránh?

**Trả lời:** Cơ chế convert object thành byte stream để lưu/truyền. **Vấn đề:**

- **Bảo mật**: deserialize untrusted data có thể RCE
- **Versioning** khó: thay class -> phá compatibility
- **Format không phổ biến**: chỉ Java đọc được

Khuyến nghị **JSON** (Jackson, Gson) -- chuẩn, an toàn, cross-language.

### Câu 5: `System.in` đọc gì?

**Trả lời:** `System.in` là `InputStream` từ stdin -- thường là bàn phím (console) hoặc pipe. Đọc raw byte. Để đọc text dễ hơn dùng `Scanner` hoặc wrap với `InputStreamReader` + `BufferedReader`.
