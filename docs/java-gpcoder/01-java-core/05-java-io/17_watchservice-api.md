---
sidebar_position: 17
title: "Giới thiệu WatchService API trong Java"
---

# Giới thiệu WatchService API trong Java

## WatchService API là gì?

**WatchService API** (dịch vụ theo dõi — API theo dõi sự kiện thay đổi trên hệ thống file) là một phần của Java NIO.2 (gói `java.nio.file`), được giới thiệu từ Java 7. API này cho phép ứng dụng **lắng nghe các sự kiện** xảy ra trên thư mục mà không cần polling (kiểm tra liên tục).

### Các sự kiện có thể theo dõi

| Sự kiện | Ý nghĩa |
|---------|---------|
| `ENTRY_CREATE` | File/thư mục mới được tạo |
| `ENTRY_DELETE` | File/thư mục bị xóa |
| `ENTRY_MODIFY` | File/thư mục bị thay đổi nội dung |
| `OVERFLOW` | Sự kiện bị bỏ lỡ do quá nhiều (bộ đệm đầy) |

---

## Ứng dụng thực tế

- **Hot reload** (tải lại nóng — tự động áp dụng thay đổi mà không cần khởi động lại) cho file cấu hình
- Theo dõi thư mục upload file
- Đồng bộ file giữa các thư mục
- Log monitoring (giám sát log — theo dõi file log trong thời gian thực)
- IDE theo dõi thay đổi source code

---

## Ví dụ cơ bản

```java
import java.io.*;
import java.nio.file.*;

public class TheoDoiCoBan {
    public static void main(String[] args) throws IOException, InterruptedException {
        // Thư mục cần theo dõi
        Path thuMucTheoMục = Paths.get("thu-muc-theo-doi");
        Files.createDirectories(thuMucTheoMục);

        // WatchService: dịch vụ theo dõi được tạo từ hệ thống file
        WatchService watchService = FileSystems.getDefault().newWatchService();

        // Đăng ký thư mục với WatchService, theo dõi 3 loại sự kiện
        // WatchKey: khóa đại diện cho đăng ký theo dõi của một thư mục
        WatchKey key = thuMucTheoMục.register(
            watchService,
            StandardWatchEventKinds.ENTRY_CREATE,
            StandardWatchEventKinds.ENTRY_DELETE,
            StandardWatchEventKinds.ENTRY_MODIFY
        );

        System.out.println("Bắt đầu theo dõi thư mục: " + thuMucTheoMục.toAbsolutePath());
        System.out.println("Nhấn Ctrl+C để dừng.");

        // Vòng lặp chờ sự kiện
        while (true) {
            // take(): chặn (block) cho đến khi có sự kiện xảy ra
            WatchKey watchKey = watchService.take();

            // pollEvents(): lấy tất cả sự kiện đang chờ
            for (WatchEvent<?> event : watchKey.pollEvents()) {
                // WatchEvent.Kind: loại sự kiện
                WatchEvent.Kind<?> kind = event.kind();

                // OVERFLOW: sự kiện bị bỏ lỡ, bỏ qua
                if (kind == StandardWatchEventKinds.OVERFLOW) continue;

                // Tên file/thư mục liên quan đến sự kiện
                @SuppressWarnings("unchecked")
                WatchEvent<Path> pathEvent = (WatchEvent<Path>) event;
                Path tenFile = pathEvent.context();

                String tenSuKien;
                if (kind == StandardWatchEventKinds.ENTRY_CREATE) {
                    tenSuKien = "TẠO MỚI";
                } else if (kind == StandardWatchEventKinds.ENTRY_DELETE) {
                    tenSuKien = "XÓA";
                } else {
                    tenSuKien = "THAY ĐỔI";
                }

                System.out.printf("[%s] %s/%s%n", tenSuKien,
                    thuMucTheoMục.getFileName(), tenFile);
            }

            // reset(): bắt buộc phải gọi sau khi xử lý để nhận sự kiện tiếp theo
            boolean con_hop_le = watchKey.reset();
            if (!con_hop_le) {
                System.out.println("Thư mục không còn truy cập được. Dừng theo dõi.");
                break;
            }
        }
    }
}
```

---

## Theo dõi với thời gian chờ (poll với timeout)

```java
import java.io.*;
import java.nio.file.*;
import java.util.concurrent.TimeUnit;

public class TheoDoiVoiTimeout {
    public static void main(String[] args) throws IOException, InterruptedException {
        Path thuMuc = Paths.get("hot-reload");
        Files.createDirectories(thuMuc);

        try (WatchService ws = FileSystems.getDefault().newWatchService()) {
            thuMuc.register(ws,
                StandardWatchEventKinds.ENTRY_CREATE,
                StandardWatchEventKinds.ENTRY_MODIFY);

            System.out.println("Theo dõi với timeout 3 giây...");

            WatchKey key;
            // poll(timeout, unit): chờ sự kiện trong khoảng thời gian, không chặn vĩnh viễn
            while ((key = ws.poll(3, TimeUnit.SECONDS)) != null) {
                for (WatchEvent<?> event : key.pollEvents()) {
                    System.out.println("Sự kiện: " + event.kind()
                        + " | File: " + event.context());
                }
                key.reset();
            }
            System.out.println("Không có sự kiện trong 3 giây. Kết thúc.");
        }
    }
}
```

---

## Hot Reload file cấu hình

```java
import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.*;

public class HotReloadConfig {
    private volatile Properties cauHinh = new Properties();
    private final Path fileCauHinh;

    public HotReloadConfig(String duongDan) throws IOException {
        this.fileCauHinh = Paths.get(duongDan);
        taiLaiCauHinh(); // Nạp lần đầu
    }

    // volatile: đảm bảo các luồng khác thấy giá trị mới nhất
    private synchronized void taiLaiCauHinh() {
        try (InputStream is = Files.newInputStream(fileCauHinh)) {
            Properties cauHinhMoi = new Properties();
            cauHinhMoi.load(is);
            cauHinh = cauHinhMoi;
            System.out.println("[" + java.time.LocalTime.now() + "] Nạp lại cấu hình thành công.");
            System.out.println("  database.url = " + cauHinh.getProperty("database.url", "N/A"));
        } catch (IOException e) {
            System.err.println("Lỗi nạp cấu hình: " + e.getMessage());
        }
    }

    public String layGiaTri(String khoa) {
        return cauHinh.getProperty(khoa);
    }

    // Chạy theo dõi trong luồng nền (background thread)
    public void batDauTheoMật() {
        Thread luong = new Thread(() -> {
            try (WatchService ws = FileSystems.getDefault().newWatchService()) {
                fileCauHinh.getParent().register(ws, StandardWatchEventKinds.ENTRY_MODIFY);

                while (!Thread.currentThread().isInterrupted()) {
                    WatchKey key = ws.take();
                    for (WatchEvent<?> event : key.pollEvents()) {
                        Path tenFile = (Path) event.context();
                        if (tenFile.equals(fileCauHinh.getFileName())) {
                            System.out.println("Phát hiện thay đổi: " + tenFile);
                            taiLaiCauHinh();
                        }
                    }
                    key.reset();
                }
            } catch (IOException | InterruptedException e) {
                System.err.println("Luồng theo dõi dừng: " + e.getMessage());
            }
        }, "config-watcher");

        luong.setDaemon(true); // Daemon thread: tự kết thúc khi main thread kết thúc
        luong.start();
        System.out.println("Bắt đầu theo dõi cấu hình: " + fileCauHinh);
    }

    public static void main(String[] args) throws Exception {
        // Tạo file cấu hình mẫu
        Path config = Paths.get("app.properties");
        Files.writeString(config, "database.url=jdbc:mysql://localhost/mydb\napp.name=TestApp\n");

        HotReloadConfig hr = new HotReloadConfig("app.properties");
        hr.batDauTheoMật();

        System.out.println("Ứng dụng đang chạy. Hãy sửa app.properties...");
        System.out.println("app.name = " + hr.layGiaTri("app.name"));

        // Mô phỏng thay đổi file cấu hình sau 2 giây
        Thread.sleep(2000);
        Files.writeString(config, "database.url=jdbc:postgresql://localhost/mydb\napp.name=UpdatedApp\n");

        Thread.sleep(1000); // Chờ hot reload
        System.out.println("Sau cập nhật - app.name = " + hr.layGiaTri("app.name"));

        Files.deleteIfExists(config);
    }
}
```

---

## Theo dõi đệ quy (thư mục con)

WatchService mặc định **không theo dõi thư mục con**. Cần đăng ký từng thư mục con:

```java
import java.io.*;
import java.nio.file.*;
import java.util.*;

public class TheoDoiDuQui {
    private final WatchService watchService;
    private final Map<WatchKey, Path> bangKey = new HashMap<>();

    public TheoDoiDuQui(Path goc) throws IOException {
        watchService = FileSystems.getDefault().newWatchService();
        dangKyDuQui(goc); // Đăng ký thư mục gốc và tất cả thư mục con
    }

    private void dangKyDuQui(Path thuMuc) throws IOException {
        Files.walk(thuMuc)
             .filter(Files::isDirectory)
             .forEach(dir -> {
                 try {
                     WatchKey key = dir.register(watchService,
                         StandardWatchEventKinds.ENTRY_CREATE,
                         StandardWatchEventKinds.ENTRY_DELETE,
                         StandardWatchEventKinds.ENTRY_MODIFY);
                     bangKey.put(key, dir);
                     System.out.println("Đăng ký: " + dir);
                 } catch (IOException e) {
                     System.err.println("Không đăng ký được: " + dir);
                 }
             });
    }

    public void chayVongLap() throws InterruptedException, IOException {
        while (true) {
            WatchKey key = watchService.take();
            Path thuMuc = bangKey.get(key);

            for (WatchEvent<?> event : key.pollEvents()) {
                WatchEvent.Kind<?> kind = event.kind();
                Path tenFile = thuMuc.resolve((Path) event.context());

                System.out.printf("[%s] %s%n", kind.name(), tenFile);

                // Nếu thư mục mới được tạo, đăng ký theo dõi nó
                if (kind == StandardWatchEventKinds.ENTRY_CREATE
                        && Files.isDirectory(tenFile)) {
                    dangKyDuQui(tenFile);
                }
            }

            if (!key.reset()) {
                bangKey.remove(key);
                if (bangKey.isEmpty()) break;
            }
        }
    }

    public static void main(String[] args) throws Exception {
        Path goc = Paths.get("du-an");
        Files.createDirectories(goc);

        TheoDoiDuQui watcher = new TheoDoiDuQui(goc);
        System.out.println("Theo dõi đệ quy thư mục: " + goc.toAbsolutePath());
        watcher.chayVongLap();
    }
}
```

---

## Tóm tắt

| Khái niệm | Ý nghĩa |
|-----------|---------|
| `WatchService` | Dịch vụ theo dõi sự kiện hệ thống file |
| `WatchKey` | Khóa đại diện cho đăng ký theo dõi của một thư mục |
| `WatchEvent` | Một sự kiện cụ thể (tạo/xóa/sửa) |
| `take()` | Chặn chờ sự kiện tiếp theo |
| `poll(timeout)` | Chờ sự kiện với thời gian giới hạn |
| `key.reset()` | Bắt buộc sau mỗi lần xử lý để nhận sự kiện tiếp theo |
| Daemon thread | Luồng nền tự kết thúc khi ứng dụng thoát |

WatchService API hiệu quả hơn polling vì sử dụng cơ chế OS-level notification (thông báo cấp hệ điều hành — inotify trên Linux, FSEvents trên macOS, ReadDirectoryChangesW trên Windows) thay vì kiểm tra liên tục.
