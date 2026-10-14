---
sidebar_position: 4
title: "4. View: JSP và Thymeleaf"
---

# View: JSP và Thymeleaf

Không phải ứng dụng Spring nào cũng chỉ trả JSON. Trang quản trị nội bộ, email HTML, trang landing render phía server vẫn cần một **template engine** để ghép dữ liệu vào HTML. Bài này giới thiệu JSP — công nghệ view truyền thống của Java web — vì sao Spring Boot không khuyến khích nó, và Thymeleaf, lựa chọn mặc định hiện nay, qua ví dụ `Model` + template hoàn chỉnh có form và validation.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Spring Boot khuyên tránh JSP** — JSP không chạy được khi đóng gói jar thực thi với server nhúng, chỉ hoạt động với war.
- ⭐ **Thymeleaf là "natural template"** — file `.html` mở trực tiếp bằng trình duyệt vẫn hiển thị được, thuộc tính `th:*` chỉ có tác dụng khi render.
- **Controller đổ dữ liệu vào `Model`**, trả về tên view; `ThymeleafViewResolver` tìm `templates/<tên>.html`.
- **`th:text` tự escape HTML** để chống XSS; `th:utext` thì không — chỉ dùng với nội dung tin cậy.
- **Mẫu Post/Redirect/Get** — sau khi submit form thành công, redirect để tránh gửi lại khi F5.

:::

---

## Mục lục

- [Vì sao cần template engine?](#vì-sao-cần-template-engine)
- [JSP là gì?](#jsp-là-gì)
- [Vì sao Spring Boot không khuyến khích JSP?](#vì-sao-spring-boot-không-khuyến-khích-jsp)
- [Thymeleaf thay thế JSP](#thymeleaf-thay-thế-jsp)
- [Ví dụ Model và template](#ví-dụ-model-và-template)
- [Form và validation với Thymeleaf](#form-và-validation-với-thymeleaf)
- [Layout dùng chung với fragment](#layout-dùng-chung-với-fragment)
- [So sánh các lựa chọn view](#so-sánh-các-lựa-chọn-view)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Vì sao cần template engine?

**Vấn đề:** Nếu không có template engine, servlet phải tự ghép HTML bằng chuỗi:

```java
protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    List<Product> products = productService.findAll();
    PrintWriter out = resp.getWriter();
    out.println("<html><body><h1>Sản phẩm</h1><ul>");
    for (Product p : products) {
        out.println("<li>" + p.getName() + " - " + p.getPrice() + "</li>"); // quên escape → XSS
    }
    out.println("</ul></body></html>");
}
```

Designer không sửa được giao diện, lập trình viên phải đọc HTML lẫn trong Java, và quên escape một chỗ là lỗ hổng XSS.

**Giải pháp:** Tách HTML ra file template, controller chỉ chuẩn bị dữ liệu:

```java
@GetMapping("/products")
public String list(Model model) {
    model.addAttribute("products", productService.findAll());
    return "products/list";
}
```

```html
<ul>
  <li th:each="p : ${products}" th:text="${p.name}">Tên mẫu</li>
</ul>
```

:::tip[Dùng thực tế]

- Trang admin nội bộ (quản lý đơn hàng, duyệt bài) không cần dựng SPA riêng.
- Email HTML (xác nhận đơn, quên mật khẩu) render bằng Thymeleaf rồi gửi qua `JavaMailSender`.
- Xuất hoá đơn HTML để chuyển thành PDF.
- Trang cần SEO tốt mà đội không muốn vận hành thêm Node.js.

:::

---

## JSP là gì?

**JSP** (JavaServer Pages, 1999) là file HTML chèn được code Java và thẻ đặc biệt. Khi được gọi lần đầu, container **dịch JSP thành một servlet** (file `.java`), biên dịch rồi chạy servlet đó. Nói cách khác, JSP chỉ là cách viết servlet "ngược": HTML là chính, Java là phụ.

```jsp
<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<html>
<body>
  <h1>Sản phẩm</h1>
  <ul>
    <c:forEach var="p" items="${products}">
      <li><c:out value="${p.name}"/> - ${p.price}</li>
    </c:forEach>
  </ul>
  <%-- scriptlet: code Java trộn trong HTML, đã lỗi thời --%>
  <% if (request.getAttribute("promo") != null) { %>
    <p>Đang khuyến mãi!</p>
  <% } %>
</body>
</html>
```

- `${...}` là **EL** (Expression Language), đọc attribute trong request/session.
- `c:forEach`, `c:out` là thẻ **JSTL** (thư viện thẻ chuẩn).
- Scriptlet `<% %>` cho phép viết Java tuỳ ý — nguồn gốc của nhiều code "mì Ý" thời trước.

:::tip[Ví dụ đời thường]

JSP giống **mẫu đơn viết tay được photo ra rồi mới điền**: bạn soạn mẫu (file .jsp), nhưng trước khi dùng, văn phòng phải đem đi **đánh máy lại thành văn bản chính thức** (dịch sang servlet và biên dịch). Thymeleaf giống **mẫu đơn điện tử**: mở ra là đọc được ngay, ô trống được điền tự động khi in.

:::

---

## Vì sao Spring Boot không khuyến khích JSP?

Tài liệu chính thức của Spring Boot liệt kê hạn chế khi dùng JSP với server nhúng:

1. **Không chạy với jar thực thi** — JSP chỉ hoạt động nếu đóng gói **war** (chạy bằng `java -jar` file war hoặc deploy lên Tomcat ngoài). Với jar thực thi, Tomcat nhúng không tìm thấy file JSP do cách bố trí tài nguyên trong jar lồng nhau.
2. **Undertow không hỗ trợ JSP.**
3. **Cần thêm dependency và cấu hình riêng** — `tomcat-embed-jasper` (trình biên dịch JSP), JSTL, prefix/suffix cho view resolver.
4. **Không có "natural template"** — file JSP mở bằng trình duyệt chỉ ra một mớ thẻ lạ, designer khó làm việc.
5. **Dễ trộn logic vào view** qua scriptlet.

Nếu vẫn phải duy trì dự án JSP cũ:

```xml
<packaging>war</packaging>

<dependency>
    <groupId>org.apache.tomcat.embed</groupId>
    <artifactId>tomcat-embed-jasper</artifactId>
    <scope>provided</scope>
</dependency>
<dependency>
    <groupId>jakarta.servlet.jsp.jstl</groupId>
    <artifactId>jakarta.servlet.jsp.jstl-api</artifactId>
</dependency>
<dependency>
    <groupId>org.glassfish.web</groupId>
    <artifactId>jakarta.servlet.jsp.jstl</artifactId>
</dependency>
```

```yaml
spring:
  mvc:
    view:
      prefix: /WEB-INF/views/   # file đặt ở src/main/webapp/WEB-INF/views
      suffix: .jsp
```

:::warning[Lỗi hay gặp]

Đặt file JSP trong `src/main/resources/templates` rồi chạy bằng jar → luôn 404 hoặc hiện mã nguồn JSP. JSP phải nằm dưới `src/main/webapp` và ứng dụng phải đóng gói war. Với dự án mới, chọn Thymeleaf ngay từ đầu.

:::

---

## Thymeleaf thay thế JSP

**Thymeleaf** là template engine Java hiện đại, tích hợp sẵn trong Spring Boot qua `spring-boot-starter-thymeleaf`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
```

Auto-configuration tạo `ThymeleafViewResolver` với mặc định:

```yaml
spring:
  thymeleaf:
    prefix: classpath:/templates/
    suffix: .html
    cache: true        # tắt (false) khi phát triển để sửa template thấy ngay; DevTools tự tắt
```

Ưu điểm chính:

- **Natural template** — các thuộc tính `th:*` được trình duyệt bỏ qua, nên file mở trực tiếp vẫn là HTML hợp lệ với dữ liệu mẫu.
- **Tự escape** đầu ra với `th:text`, giảm nguy cơ XSS.
- **Chạy được trong jar**, không cần biên dịch sang servlet.
- Tích hợp Spring: biểu thức SpEL, binding form, thông báo lỗi validation, i18n, Spring Security dialect.

Cú pháp biểu thức cơ bản:

| Biểu thức | Ý nghĩa | Ví dụ |
|-----------|---------|-------|
| `${...}` | Biến trong model | `${product.name}` |
| `*{...}` | Thuộc tính của object đang chọn (`th:object`) | `*{price}` |
| `#{...}` | Message i18n từ `messages.properties` | `#{product.title}` |
| `@{...}` | URL (tự thêm context path) | `@{/products/{id}(id=${p.id})}` |
| `~{...}` | Tham chiếu fragment | `~{fragments/layout :: header}` |

---

## Ví dụ Model và template

Controller:

```java
@Controller
@RequestMapping("/admin/products")
public class ProductPageController {
    private final ProductService productService;

    public ProductPageController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public String list(@RequestParam(defaultValue = "") String q, Model model) {
        model.addAttribute("products", productService.search(q));
        model.addAttribute("q", q);
        return "products/list";      // → templates/products/list.html
    }
}
```

Template `src/main/resources/templates/products/list.html`:

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Sản phẩm</title>
</head>
<body>
  <h1>Danh sách sản phẩm</h1>

  <form th:action="@{/admin/products}" method="get">
    <input type="text" name="q" th:value="${q}" placeholder="Tìm theo tên">
    <button type="submit">Tìm</button>
  </form>

  <p th:if="${#lists.isEmpty(products)}">Chưa có sản phẩm nào.</p>

  <table th:unless="${#lists.isEmpty(products)}">
    <tr><th>#</th><th>Tên</th><th>Giá</th><th>Trạng thái</th></tr>
    <tr th:each="p, stat : ${products}">
      <td th:text="${stat.count}">1</td>
      <td><a th:href="@{/admin/products/{id}(id=${p.id})}" th:text="${p.name}">Bàn phím</a></td>
      <td th:text="${#numbers.formatDecimal(p.price, 0, 'POINT', 0, 'COMMA')} + ' đ'">1.290.000 đ</td>
      <td>
        <span th:if="${p.stock > 0}" th:text="'Còn ' + ${p.stock}">Còn 15</span>
        <span th:unless="${p.stock > 0}" class="out">Hết hàng</span>
      </td>
    </tr>
  </table>
</body>
</html>
```

Mở file này trực tiếp bằng trình duyệt, bạn thấy bảng với dữ liệu mẫu "Bàn phím", "1.290.000 đ". Khi chạy qua Spring, các giá trị đó được thay bằng dữ liệu thật.

---

## Form và validation với Thymeleaf

Dùng mẫu **Post/Redirect/Get (PRG)**: GET hiển thị form → POST xử lý → thành công thì redirect sang trang khác.

```java
@GetMapping("/new")
public String createForm(Model model) {
    model.addAttribute("form", new ProductForm());
    return "products/form";
}

@PostMapping
public String create(@Valid @ModelAttribute("form") ProductForm form,
                     BindingResult bindingResult,
                     RedirectAttributes redirect) {
    if (bindingResult.hasErrors()) {
        return "products/form";                    // hiện lại form kèm lỗi
    }
    productService.create(form);
    redirect.addFlashAttribute("message", "Đã thêm sản phẩm");
    return "redirect:/admin/products";             // PRG
}
```

```java
// Form object cần setter để Spring bind field từ request
public class ProductForm {
    @NotBlank(message = "Nhập tên sản phẩm")
    private String name;

    @NotNull(message = "Nhập giá") @Positive(message = "Giá phải lớn hơn 0")
    private BigDecimal price;

    // getter, setter
}
```

```html
<form th:action="@{/admin/products}" th:object="${form}" method="post">
  <label>Tên
    <input type="text" th:field="*{name}">
  </label>
  <p class="error" th:if="${#fields.hasErrors('name')}" th:errors="*{name}">Lỗi tên</p>

  <label>Giá
    <input type="number" th:field="*{price}">
  </label>
  <p class="error" th:if="${#fields.hasErrors('price')}" th:errors="*{price}">Lỗi giá</p>

  <button type="submit">Lưu</button>
</form>
```

`th:field` tự sinh `id`, `name`, `value` và giữ lại giá trị người dùng đã nhập khi form hiện lại do lỗi. Nếu có Spring Security, `th:action` còn tự chèn input ẩn chứa **CSRF token**.

:::warning[Lỗi hay gặp]

- `BindingResult` phải đứng **ngay sau** tham số `@Valid` mà nó mô tả; đặt sai vị trí thì Spring ném exception (400) thay vì cho bạn xử lý lỗi.
- Dùng `th:utext` để hiện nội dung người dùng nhập (bình luận, mô tả) → lỗ hổng XSS. Chỉ dùng `th:utext` với HTML bạn kiểm soát hoặc đã được làm sạch.
- Trả về `"products/list"` sau POST thay vì `"redirect:..."` → người dùng nhấn F5 sẽ gửi lại form, tạo bản ghi trùng.

:::

---

## Layout dùng chung với fragment

Header, footer lặp lại ở nhiều trang được tách thành **fragment**:

```html
<!-- templates/fragments/layout.html -->
<header th:fragment="header">
  <nav>
    <a th:href="@{/admin/products}">Sản phẩm</a>
    <a th:href="@{/admin/orders}">Đơn hàng</a>
  </nav>
</header>

<footer th:fragment="footer">
  <small>© 2026 Shop VN</small>
</footer>
```

```html
<!-- dùng trong trang khác -->
<body>
  <div th:replace="~{fragments/layout :: header}"></div>
  <main>...</main>
  <div th:replace="~{fragments/layout :: footer}"></div>
</body>
```

---

## So sánh các lựa chọn view

| Tiêu chí | JSP | Thymeleaf | FreeMarker | SPA (React/Vue) + REST |
|----------|-----|-----------|------------|------------------------|
| Chạy với jar nhúng | Không | Có | Có | Có (API) |
| Natural template | Không | Có | Không | Không áp dụng |
| Escape mặc định | Không (`${}` thô, cần `c:out`) | Có | Tuỳ cấu hình | Framework tự escape |
| Hỗ trợ trong Spring Boot | Hạn chế | Starter chính thức | Starter chính thức | `@RestController` |
| Phù hợp | Bảo trì hệ thống cũ | Admin, email, trang server-render | Email, sinh file | Ứng dụng tương tác nhiều |

---

## Câu hỏi phỏng vấn

**1. JSP được xử lý như thế nào khi chạy?**

<details className="qa">
<summary>Xem đáp án</summary>

Lần đầu được gọi (hoặc khi file thay đổi), container dịch file JSP thành mã nguồn một servlet, biên dịch thành class rồi nạp và chạy như servlet bình thường. Các request sau dùng lại servlet đã biên dịch. Vì vậy JSP thực chất là một servlet viết theo dạng template.

</details>

**2. Vì sao Spring Boot không khuyến khích JSP?**

<details className="qa">
<summary>Xem đáp án</summary>

Với server nhúng, JSP chỉ chạy khi đóng gói war, không chạy với jar thực thi; Undertow không hỗ trợ JSP; cần thêm Jasper và JSTL; không phải natural template; dễ trộn logic Java vào view qua scriptlet. Spring Boot khuyên dùng Thymeleaf, FreeMarker hoặc Mustache.

</details>

**3. Natural template trong Thymeleaf nghĩa là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Template là file HTML hợp lệ: các thuộc tính `th:*` bị trình duyệt bỏ qua, nội dung tĩnh bên trong thẻ đóng vai trò dữ liệu mẫu. Designer có thể mở trực tiếp file để xem giao diện, còn khi render qua Thymeleaf thì nội dung mẫu được thay bằng dữ liệu thật.

</details>

**4. th:text và th:utext khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`th:text` escape ký tự đặc biệt HTML (dấu nhỏ hơn, lớn hơn, nháy, ampersand) nên an toàn với dữ liệu người dùng. `th:utext` (unescaped) chèn nguyên văn, cho phép HTML chạy — chỉ dùng với nội dung tin cậy, nếu không sẽ gây XSS.

</details>

**5. Model, ModelMap, ModelAndView khác nhau ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

`Model` là interface chứa attribute cho view, khai báo làm tham số method. `ModelMap` là hiện thực dạng `LinkedHashMap` với API tương tự. `ModelAndView` gói cả model lẫn tên view vào một object để trả về. Cách hiện đại phổ biến: nhận `Model` làm tham số và trả về chuỗi tên view.

</details>

**6. Mẫu Post/Redirect/Get là gì và vì sao cần?**

<details className="qa">
<summary>Xem đáp án</summary>

Sau khi xử lý POST thành công, server trả redirect (302/303) tới một URL GET thay vì render trang trực tiếp. Trình duyệt khi đó nằm ở trang GET, nên nhấn F5 không gửi lại form, tránh tạo bản ghi trùng. Dữ liệu cần hiển thị một lần (thông báo thành công) truyền qua flash attribute.

</details>
