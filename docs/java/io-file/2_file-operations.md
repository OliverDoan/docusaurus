---
sidebar_position: 2
title: "2. File Operations (NIO Files)"
---

# File Operations -- Thao tác file với NIO

Từ **Java 7**, package `java.nio.file` (NIO.2) cung cấp API hiện đại để làm việc với file/folder: ngắn gọn, an toàn, hỗ trợ symbolic link, watch service. Đây là **API khuyến nghị** thay thế `java.io.File` cũ.

**Tương tự đơn giản:** `java.io.File` giống **bản đồ giấy** -- xem được đường, nhưng làm gì với địa điểm phải tự xoay sở. `java.nio.file` giống **GPS hiện đại** -- xem đường + chỉ đường + tự lái -- mọi thứ trong một bộ công cụ.

---

## Mục lục

- [1. Path và Paths](#1-path-và-paths)
- [2. Files utility class](#2-files-utility-class)
- [3. Đọc/ghi file](#3-đọcghi-file)
- [4. Thao tác thư mục](#4-thao-tác-thư-mục)
- [5. File attributes](#5-file-attributes)
- [6. WatchService](#6-watchservice)
- [Khi nào dùng?](#khi-nào-dùng)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## 1. Path và Paths

`Path` đại diện cho một **đường dẫn** (file/folder).

```java
import java.nio.file.*;

Path p1 = Path.of("/Users/alice/file.txt");          // absolute
Path p2 = Path.of("docs", "java", "intro.md");       // relative
Path p3 = Paths.get("/var/log");                     // alias

// Lay phan tu
p1.getFileName();   // file.txt
p1.getParent();     // /Users/alice
p1.getRoot();       // /
p1.getNameCount();  // so phan tu

// Resolve / Relativize
Path base = Path.of("/home/alice");
Path resolved = base.resolve("docs/file.txt"); // /home/alice/docs/file.txt
Path relative = base.relativize(Path.of("/home/alice/docs/file.txt")); // docs/file.txt

// Normalize -- bo . va ..
Path.of("/a/b/../c/./d").normalize(); // /a/c/d

// Tuyet doi
p2.toAbsolutePath();
p1.toRealPath(); // resolve symlink
```

---

## 2. Files utility class

`java.nio.file.Files` -- class **utility tĩnh** đầy đủ method.

```java
Path file = Path.of("test.txt");

Files.exists(file);
Files.notExists(file);
Files.isDirectory(file);
Files.isRegularFile(file);
Files.isReadable(file);
Files.isWritable(file);
Files.size(file);
```

---

## 3. Đọc/ghi file

### Đọc text

```java
// Tat ca thanh String (file nho)
String content = Files.readString(file);

// Tat ca thanh List<String>
List<String> lines = Files.readAllLines(file, StandardCharsets.UTF_8);

// Stream theo dong (file lon, lazy)
try (Stream<String> stream = Files.lines(file, StandardCharsets.UTF_8)) {
    stream.filter(line -> line.contains("ERROR"))
          .forEach(System.out::println);
}
```

### Ghi text

```java
// Ghi de
Files.writeString(file, "Noi dung");
Files.write(file, List.of("Dong 1", "Dong 2"), StandardCharsets.UTF_8);

// Them vao cuoi
Files.writeString(file, "\nThem dong", StandardOpenOption.APPEND);
```

### Đọc byte

```java
byte[] data = Files.readAllBytes(file);
```

### Stream-based (file lớn)

```java
try (BufferedReader br = Files.newBufferedReader(file)) {
    String line;
    while ((line = br.readLine()) != null) ...
}

try (InputStream in = Files.newInputStream(file)) { ... }
try (OutputStream out = Files.newOutputStream(file)) { ... }
```

---

## 4. Thao tác thư mục

### Tạo thư mục

```java
Files.createDirectory(Path.of("newdir"));         // 1 cap
Files.createDirectories(Path.of("a/b/c/d"));      // nhieu cap
```

### Tạo file

```java
Files.createFile(Path.of("new.txt"));
Files.createTempFile("prefix", ".tmp");           // /tmp/prefix12345.tmp
Files.createTempDirectory("mydir");
```

### Sao chép / Di chuyển / Xóa

```java
Files.copy(src, dst, StandardCopyOption.REPLACE_EXISTING);
Files.move(src, dst, StandardCopyOption.ATOMIC_MOVE);
Files.delete(file);
Files.deleteIfExists(file);
```

### Liệt kê thư mục

```java
// Truc tiep -- chi cap 1
try (Stream<Path> stream = Files.list(Path.of("/var/log"))) {
    stream.forEach(System.out::println);
}

// De quy -- tat ca cac cap
try (Stream<Path> stream = Files.walk(Path.of("/src"))) {
    stream.filter(p -> p.toString().endsWith(".java"))
          .forEach(System.out::println);
}

// Tim theo pattern
try (Stream<Path> stream = Files.find(
        Path.of("/src"), 5,
        (path, attrs) -> path.toString().endsWith(".java"))) {
    stream.forEach(System.out::println);
}
```

### Xóa cây thư mục

```java
Path dir = Path.of("to-delete");
try (Stream<Path> stream = Files.walk(dir)) {
    stream.sorted(Comparator.reverseOrder())  // xoa con truoc, cha sau
          .forEach(p -> {
              try { Files.delete(p); }
              catch (IOException e) { throw new RuntimeException(e); }
          });
}
```

---

## 5. File attributes

```java
BasicFileAttributes attrs = Files.readAttributes(file, BasicFileAttributes.class);
attrs.size();
attrs.creationTime();
attrs.lastModifiedTime();
attrs.lastAccessTime();
attrs.isDirectory();
attrs.isRegularFile();
attrs.isSymbolicLink();

// POSIX permissions
PosixFileAttributes posix = Files.readAttributes(file, PosixFileAttributes.class);
posix.owner();
posix.group();
posix.permissions();

// Doi quyen
Files.setPosixFilePermissions(file, PosixFilePermissions.fromString("rwxr--r--"));
```

---

## 6. WatchService

Theo dõi thay đổi file/folder real-time.

```java
WatchService watcher = FileSystems.getDefault().newWatchService();
Path dir = Path.of("/var/log");
dir.register(watcher,
    StandardWatchEventKinds.ENTRY_CREATE,
    StandardWatchEventKinds.ENTRY_MODIFY,
    StandardWatchEventKinds.ENTRY_DELETE);

while (true) {
    WatchKey key = watcher.take(); // block
    for (WatchEvent<?> event : key.pollEvents()) {
        WatchEvent.Kind<?> kind = event.kind();
        Path fileName = (Path) event.context();
        System.out.println(kind + ": " + fileName);
    }
    if (!key.reset()) break;
}
```

---

## Khi nào dùng?

- **`Files.readString` / `Files.writeString`**: File text nhỏ
- **`Files.lines`**: File text lớn, xử lý từng dòng
- **`Files.readAllBytes`**: File binary nhỏ
- **`Files.newInputStream`**: File lớn, streaming
- **`Files.walk`**: Duyệt cây thư mục
- **WatchService**: Theo dõi thay đổi (live reload, sync)
- **Best practice:**
  - Ưu tiên `java.nio.file` -- KHÔNG dùng `java.io.File`
  - Luôn chỉ định **charset** (`StandardCharsets.UTF_8`)
  - Try-with-resources cho `Stream<Path>` (`Files.list`, `Files.walk`)
  - Check `Files.exists` trước thao tác (hoặc handle exception)

---

## Lỗi thường gặp

### Lỗi 1: Đọc file lớn vào memory

```java
// SAI -- file 10GB se OOM
String content = Files.readString(Path.of("huge.txt"));

// DUNG -- stream
try (Stream<String> lines = Files.lines(Path.of("huge.txt"))) {
    lines.forEach(...);
}
```

### Lỗi 2: Quên charset

```java
// SAI
Files.readString(file); // mac dinh UTF-8 (Java 18+), truoc do la platform default

// DUNG -- ro rang
Files.readString(file, StandardCharsets.UTF_8);
```

### Lỗi 3: Không close Stream

```java
// SAI -- file handle leak
Files.list(dir).forEach(...);

// DUNG
try (Stream<Path> stream = Files.list(dir)) {
    stream.forEach(...);
}
```

### Lỗi 4: Path Traversal

```java
// SAI -- user input duoi dang "..\\..\\etc\\passwd"
Path file = uploadDir.resolve(userInput);

// DUNG -- check normalize trong uploadDir
Path file = uploadDir.resolve(userInput).normalize();
if (!file.startsWith(uploadDir)) {
    throw new SecurityException("Path traversal");
}
```

### Lỗi 5: `delete` không kiểm tra

```java
// SAI -- NoSuchFileException neu khong ton tai
Files.delete(file);

// DUNG
Files.deleteIfExists(file);
```

---

## Câu hỏi phỏng vấn

### Câu 1: `java.io.File` vs `java.nio.file.Path`?

**Trả lời:**

- `File` (Java 1.0): Cũ, ít method, không phân biệt file/folder rõ ràng, lỗi không rõ
- `Path` + `Files` (Java 7+): Hiện đại, đầy đủ method, hỗ trợ symbolic link, attributes, watch service

Khuyến nghị **dùng NIO** cho code mới. `File` chỉ để tương thích cũ.

### Câu 2: `Files.lines` khác `Files.readAllLines` thế nào?

**Trả lời:**

- `readAllLines`: đọc **hết** file vào `List<String>` -- file lớn OOM
- `lines`: trả **Stream lazy** -- đọc từng dòng, file lớn không OOM

Khi file nhỏ -> `readAllLines` tiện. File lớn -> phải dùng `lines`.

### Câu 3: WatchService dùng để làm gì?

**Trả lời:** Theo dõi thay đổi file/folder real-time. Use case:

- Hot reload config khi file thay đổi
- File sync (Dropbox-like)
- Tự động re-compile khi source thay đổi
- Backup khi có file mới

Hoạt động qua kernel API (inotify trên Linux, FSEvents trên macOS).

### Câu 4: Cách xóa thư mục có file bên trong?

**Trả lời:** Không có `deleteDirectory(recursive)` sẵn. Dùng `Files.walk` + sort ngược + delete từng phần tử (xóa file/folder con trước, folder cha sau). Hoặc dùng Apache Commons IO `FileUtils.deleteDirectory()`.

### Câu 5: Cách bảo vệ chống Path Traversal?

**Trả lời:** User upload có thể đặt path `../../etc/passwd`. Cách phòng:

1. `path.normalize()` -- loại `..`
2. Check `resolved.startsWith(baseDir)` sau normalize
3. Whitelist filename (chỉ a-zA-Z0-9_.-)
4. Không trust user input -- dùng UUID làm filename
