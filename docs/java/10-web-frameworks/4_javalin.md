---
sidebar_position: 4
title: "4. Javalin"
---

# 4. Javalin

Javalin là framework web Java cực kỳ nhẹ và đơn giản, theo triết lý "đơn giản nhất có thể, ít phép thuật nhất có thể". Bài này giới thiệu cách tạo server chỉ với vài dòng code, định nghĩa route, đọc dữ liệu từ request, trả về JSON và so sánh với Spring Boot. Đây là lựa chọn lý tưởng cho người mới học, app nhỏ hoặc làm prototype nhanh.

---

## Mục lục

- [Vì sao có Javalin?](#vì-sao-có-javalin)
- [Javalin là gì?](#javalin-là-gì)
- [Vì sao Javalin "siêu nhẹ"?](#vì-sao-javalin-siêu-nhẹ)
- [Tạo ứng dụng Javalin đầu tiên](#tạo-ứng-dụng-javalin-đầu-tiên)
- [Định nghĩa các route](#định-nghĩa-các-route)
- [Đọc dữ liệu từ request](#đọc-dữ-liệu-từ-request)
- [Trả về JSON](#trả-về-json)
- [Ví dụ API quản lý ghi chú](#ví-dụ-api-quản-lý-ghi-chú)
- [So sánh Javalin với Spring Boot](#so-sánh-javalin-với-spring-boot)
- [Khi nào nên dùng Javalin?](#khi-nào-nên-dùng-javalin)
- [Lỗi thường gặp](#lỗi-thường-gặp)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao có Javalin?

**Vấn đề:** Với một API hay dịch vụ **nhỏ**, dùng framework lớn như Spring là **quá
mức cần thiết**. Bạn phải học nhiều khái niệm, viết nhiều cấu hình, và đối mặt với
"ma thuật" auto-config khó hiểu (mọi thứ tự chạy ngầm, lỗi thì khó dò). Khởi động
cũng nặng và chậm. Tốn công học và vận hành cho thứ lẽ ra chỉ cần vài dòng code.

**Giải pháp:** **Javalin** — web framework **siêu nhẹ** với API tường minh, đơn giản:

```java
import io.javalin.Javalin;

public class App {
    public static void main(String[] args) {
        // Vài dòng là có server: API rõ ràng, không "ma thuật", khởi động nhanh
        Javalin app = Javalin.create().start(7070);
        app.get("/path", ctx -> ctx.result("Xin chào!"));
    }
}
```

Mọi thứ đều rõ ràng (`app.get("/path", ctx -> ...)`), rất ít "ma thuật", khởi động
nhanh, không ép bạn theo cấu trúc cố định, và chạy được cả Java lẫn Kotlin. Phù hợp
khi bạn muốn đơn giản và **tự kiểm soát** mọi thứ.

:::tip[Dùng thực tế]

- **Microservice / API nhỏ**: một dịch vụ chỉ làm vài việc, không cần cả bộ Spring.
- **Prototype nhanh**: dựng bản mẫu thử ý tưởng trong vài phút.
- **Học viết web server cơ bản**: hiểu rõ request/response mà không bị che bởi annotation.
- **Dịch vụ cần nhẹ và rõ ràng**: ít phụ thuộc, khởi động nhanh, dễ bảo trì.

:::

## Javalin là gì?

**Javalin** là một framework web Java cực kỳ nhẹ và đơn giản. Triết lý của nó là:
"đơn giản nhất có thể, ít phép thuật nhất có thể". Nghĩa là mọi thứ đều rõ ràng,
không có quá nhiều annotation hay cấu hình ẩn sau hậu trường.

Javalin chạy được cho cả Java và Kotlin (một ngôn ngữ khác cũng chạy trên JVM).

Điểm hấp dẫn nhất với người mới: bạn chỉ cần vài dòng code là đã có một server web
chạy được, không phải tạo dự án phức tạp, không phải học hàng chục annotation.

## Vì sao Javalin "siêu nhẹ"?

So với Spring Boot — vốn rất to và đầy tính năng — Javalin nhỏ gọn hơn nhiều:

- **Ít phụ thuộc** (dependency — thư viện cần kéo về): dự án nhẹ, khởi động nhanh.
- **Không dùng annotation phức tạp**: bạn định nghĩa route (đường dẫn xử lý) bằng
  cách gọi hàm trực tiếp, dễ đọc dễ hiểu.
- **Học rất nhanh**: gần như nhìn code là hiểu ngay nó làm gì.

Đổi lại, Javalin không có sẵn nhiều tính năng "đồ sộ" như Spring (bảo mật, truy cập
database tích hợp...). Bạn tự ghép thêm khi cần.

## Tạo ứng dụng Javalin đầu tiên

Với Javalin, toàn bộ ứng dụng có thể nằm gọn trong hàm `main`:

```java
import io.javalin.Javalin;

public class App {
    public static void main(String[] args) {
        // Tạo và khởi động server ở cổng 7070
        Javalin app = Javalin.create().start(7070);

        // Khi có request GET tới "/", trả về dòng chữ
        // ctx (context) chứa toàn bộ thông tin request và cách trả response
        app.get("/", ctx -> ctx.result("Xin chào từ Javalin!"));
    }
}
```

Chạy hàm `main`, mở trình duyệt vào `http://localhost:7070`, bạn sẽ thấy
"Xin chào từ Javalin!". Cực kỳ đơn giản, không cần class controller riêng.

Giải thích thêm: `ctx ->  ...` là một **lambda** (hàm ẩn danh — viết hàm ngắn gọn
không cần đặt tên). Phần `ctx` là tham số tên là **context** (ngữ cảnh — đối tượng
chứa thông tin về request hiện tại và công cụ để tạo response).

## Định nghĩa các route

**Route** (tuyến đường — sự kết hợp giữa một method và một đường dẫn cùng cách xử
lý) trong Javalin được định nghĩa bằng cách gọi hàm tương ứng với method:

```java
import io.javalin.Javalin;

public class App {
    public static void main(String[] args) {
        Javalin app = Javalin.create().start(7070);

        // GET: lấy dữ liệu
        app.get("/products", ctx -> ctx.result("Danh sách sản phẩm"));

        // POST: tạo mới
        app.post("/products", ctx -> ctx.result("Đã tạo sản phẩm"));

        // PUT: cập nhật
        app.put("/products/{id}", ctx -> ctx.result("Đã cập nhật"));

        // DELETE: xóa
        app.delete("/products/{id}", ctx -> ctx.result("Đã xóa"));
    }
}
```

Dễ thấy: mỗi route là một dòng, rất rõ ràng method nào ứng với đường dẫn nào.

## Đọc dữ liệu từ request

Đối tượng `ctx` (context) cung cấp nhiều hàm để đọc dữ liệu người dùng gửi lên:

```java
import io.javalin.Javalin;

public class App {
    public static void main(String[] args) {
        Javalin app = Javalin.create().start(7070);

        // Lấy giá trị từ đường dẫn: GET /users/5 -> id = "5"
        app.get("/users/{id}", ctx -> {
            String id = ctx.pathParam("id"); // Lấy phần {id} trong đường dẫn
            ctx.result("Người dùng số " + id);
        });

        // Lấy giá trị sau dấu ?: GET /search?keyword=java
        app.get("/search", ctx -> {
            String keyword = ctx.queryParam("keyword"); // Lấy tham số keyword
            ctx.result("Bạn tìm: " + keyword);
        });
    }
}
```

- `ctx.pathParam("id")`: lấy giá trị từ đường dẫn (chỗ `{id}`).
- `ctx.queryParam("keyword")`: lấy tham số sau dấu `?`.
- `ctx.body()`: lấy toàn bộ phần body (thường là JSON khi POST).

## Trả về JSON

Trong API thực tế, ta thường trả về **JSON** (định dạng dữ liệu dạng văn bản) thay
vì chữ thường. Javalin có hàm `ctx.json(...)` tự động chuyển đối tượng Java thành
JSON:

```java
import io.javalin.Javalin;

public class App {

    // Một class đơn giản đại diện cho người dùng
    record User(int id, String name) {} // record: kiểu dữ liệu gọn để chứa dữ liệu

    public static void main(String[] args) {
        Javalin app = Javalin.create().start(7070);

        app.get("/users/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id")); // Chuyển "5" thành số 5
            User user = new User(id, "An");                  // Tạo đối tượng người dùng
            ctx.json(user); // Tự chuyển thành JSON: {"id":5,"name":"An"}
        });
    }
}
```

## Ví dụ API quản lý ghi chú

Ghép tất cả lại thành một API nhỏ quản lý ghi chú (note), lưu tạm trong bộ nhớ:

```java
import io.javalin.Javalin;
import java.util.ArrayList;
import java.util.List;

public class NoteApp {

    // Một ghi chú gồm id và nội dung
    record Note(int id, String content) {}

    public static void main(String[] args) {
        Javalin app = Javalin.create().start(7070);

        // Danh sách ghi chú lưu tạm trong bộ nhớ (mất khi tắt app)
        List<Note> notes = new ArrayList<>();

        // GET /notes -> lấy tất cả ghi chú
        app.get("/notes", ctx -> ctx.json(notes));

        // POST /notes -> tạo ghi chú mới từ body JSON
        app.post("/notes", ctx -> {
            // Đọc body JSON và chuyển thành đối tượng Note
            Note input = ctx.bodyAsClass(Note.class);
            // Tạo ghi chú mới với id tự tăng
            Note newNote = new Note(notes.size() + 1, input.content());
            notes.add(newNote);
            ctx.status(201);   // 201: đã tạo thành công
            ctx.json(newNote); // Trả về ghi chú vừa tạo
        });
    }
}
```

Với API này:

- `GET /notes` trả về danh sách ghi chú dạng JSON.
- `POST /notes` với body `{"content": "Học Java"}` sẽ tạo ghi chú mới và trả về nó
  kèm status `201`.

Toàn bộ ứng dụng gọn trong một file, rất dễ hiểu — đó là sức mạnh của Javalin cho
việc học.

## So sánh Javalin với Spring Boot

| Tiêu chí | Javalin | Spring Boot |
|----------|---------|-------------|
| Độ phức tạp | Rất đơn giản | Phức tạp hơn |
| Lượng code khởi đầu | Vài dòng | Nhiều file, nhiều annotation |
| Tính năng có sẵn | Ít, tự ghép thêm | Rất nhiều (bảo mật, database...) |
| Tốc độ học | Rất nhanh | Chậm hơn |
| Phù hợp dự án lớn | Hạn chế | Rất tốt |
| Độ phổ biến đi làm | Thấp | Rất cao |

## Khi nào nên dùng Javalin?

Nên dùng Javalin khi:

- Bạn **mới học** và muốn hiểu nhanh khái niệm request/response mà không bị rối.
- Bạn làm **app nhỏ**, công cụ nội bộ, hoặc **prototype** (bản mẫu để thử nghiệm
  nhanh ý tưởng).
- Bạn muốn một server gọn nhẹ, khởi động nhanh, ít phụ thuộc.

Nên dùng Spring Boot thay vì Javalin khi:

- Dự án lớn, nhiều tính năng, cần bảo mật, kết nối database phức tạp.
- Bạn đi làm và công ty dùng Spring Boot.

## Lỗi thường gặp

- **Quên `.start(port)`**: nếu chỉ `Javalin.create()` mà không `.start()`, server
  không chạy.
- **Cổng đã bị dùng**: nếu cổng (như 7070) đang bị chiếm, đổi sang cổng khác.
- **Quên chuyển kiểu pathParam**: `ctx.pathParam("id")` luôn trả về chuỗi (String).
  Muốn dùng làm số phải `Integer.parseInt(...)`.
- **Trả về `ctx.result()` cho dữ liệu phức tạp**: `result` chỉ trả văn bản thuần.
  Muốn trả đối tượng dạng JSON thì dùng `ctx.json(...)`.
- **Tưởng Javalin thay thế được Spring Boot ở mọi nơi**: Javalin tuyệt cho app nhỏ
  và học, nhưng dự án lớn vẫn thường cần Spring Boot.

## Tóm tắt

- **Javalin** là framework web Java siêu nhẹ, siêu đơn giản, học rất nhanh — lý
  tưởng cho người mới.
- Toàn bộ ứng dụng có thể nằm trong hàm `main`; route được định nghĩa bằng các hàm
  như `app.get(...)`, `app.post(...)`.
- Đối tượng **context (`ctx`)** chứa thông tin request và công cụ trả response:
  `ctx.pathParam`, `ctx.queryParam`, `ctx.body`, `ctx.json`, `ctx.status`.
- Javalin có ít tính năng sẵn hơn Spring Boot nhưng đổi lại cực kỳ gọn nhẹ.
- Dùng Javalin cho app nhỏ, prototype và học; dùng Spring Boot cho dự án lớn và
  khi đi làm.
