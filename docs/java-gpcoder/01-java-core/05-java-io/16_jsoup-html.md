---
sidebar_position: 16
title: "Phân tích nội dung HTML với thư viện Jsoup"
---

# Phân tích nội dung HTML với thư viện Jsoup

Khi cần lấy dữ liệu từ trang web hoặc xử lý nội dung HTML trong Java, Jsoup là thư viện được dùng nhiều nhất. Nó giúp bạn phân tích HTML, tìm phần tử bằng CSS selector, thu thập dữ liệu (scraping) và làm sạch HTML để chống tấn công XSS. Bài này hướng dẫn cách dùng Jsoup từ cơ bản đến thực tế qua các ví dụ minh họa.

## Jsoup là gì?

**Jsoup** (Java HTML parser — thư viện Java để phân tích cú pháp, trích xuất và thao tác với HTML) là thư viện mã nguồn mở phổ biến nhất trong Java để:
- **Parse** (phân tích cú pháp) HTML từ URL, file hoặc chuỗi
- **Scraping** (thu thập dữ liệu — tự động lấy dữ liệu từ trang web)
- Tìm kiếm phần tử bằng **CSS selector** (bộ chọn CSS)
- **Sanitize** (làm sạch HTML — loại bỏ thẻ/thuộc tính nguy hiểm) để chống XSS

---

## Dependency Maven

```xml
<dependency>
    <groupId>org.jsoup</groupId>
    <artifactId>jsoup</artifactId>
    <version>1.18.3</version>
</dependency>
```

---

## Parse HTML từ chuỗi String

```java
import org.jsoup.*;
import org.jsoup.nodes.*;
import org.jsoup.select.*;

public class ParseHtmlChuoi {
    public static void main(String[] args) {
        String html = """
            <!DOCTYPE html>
            <html>
            <head><title>Danh sách sản phẩm</title></head>
            <body>
                <h1 class="tieu-de">Cửa hàng điện tử</h1>
                <ul id="danh-sach">
                    <li class="san-pham" data-id="1">
                        <span class="ten">Laptop Dell XPS</span>
                        <span class="gia">25.000.000 VNĐ</span>
                    </li>
                    <li class="san-pham" data-id="2">
                        <span class="ten">iPhone 16 Pro</span>
                        <span class="gia">30.000.000 VNĐ</span>
                    </li>
                </ul>
                <a href="https://example.com/more">Xem thêm</a>
            </body>
            </html>
            """;

        // Document: đối tượng đại diện cho toàn bộ trang HTML đã được parse
        Document doc = Jsoup.parse(html);

        // Lấy tiêu đề trang
        System.out.println("Tiêu đề: " + doc.title());

        // Tìm phần tử theo tag
        Element h1 = doc.selectFirst("h1");
        System.out.println("H1: " + h1.text());

        // Tìm nhiều phần tử bằng CSS selector
        // Elements: danh sách các Element
        Elements sanPhams = doc.select("li.san-pham");
        System.out.println("\nDanh sách sản phẩm (" + sanPhams.size() + " sản phẩm):");

        for (Element sp : sanPhams) {
            String id  = sp.attr("data-id"); // Lấy thuộc tính data-id
            String ten = sp.selectFirst(".ten").text();
            String gia = sp.selectFirst(".gia").text();
            System.out.printf("  ID: %s | Tên: %-20s | Giá: %s%n", id, ten, gia);
        }

        // Lấy href của thẻ <a>
        Element link = doc.selectFirst("a");
        System.out.println("\nLink: " + link.attr("href"));
        System.out.println("Văn bản link: " + link.text());
    }
}
```

---

## Tải và parse HTML từ URL

```java
import org.jsoup.*;
import org.jsoup.nodes.*;
import org.jsoup.select.*;
import java.io.IOException;

public class TaiTrangWeb {
    public static void main(String[] args) {
        try {
            // Jsoup.connect(): tạo kết nối HTTP đến URL
            Document doc = Jsoup.connect("https://example.com")
                .userAgent("Mozilla/5.0") // Giả lập trình duyệt
                .timeout(5000)            // Timeout 5 giây
                .get();                   // Thực hiện GET request

            System.out.println("Tiêu đề trang: " + doc.title());
            System.out.println("Độ dài HTML: " + doc.html().length() + " ký tự");

            // Lấy tất cả thẻ <a>
            Elements links = doc.select("a[href]");
            System.out.println("\nSố link: " + links.size());
            links.stream()
                 .limit(5)
                 .forEach(a -> System.out.println("  " + a.attr("abs:href")));
            // abs:href: đường dẫn tuyệt đối (absolute href — chuyển đường dẫn tương đối thành tuyệt đối)

            // Lấy tất cả ảnh
            Elements imgs = doc.select("img[src]");
            System.out.println("\nSố ảnh: " + imgs.size());
            imgs.stream()
                .limit(3)
                .forEach(img -> System.out.println("  " + img.attr("abs:src")));

        } catch (IOException e) {
            System.err.println("Lỗi kết nối: " + e.getMessage());
        }
    }
}
```

---

## CSS Selector phổ biến trong Jsoup

```java
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

public class CSSSelector {
    public static void main(String[] args) {
        String html = "<div id='main'>"
            + "<p class='note'>Ghi chú 1</p>"
            + "<p class='note highlight'>Ghi chú 2</p>"
            + "<table><tr><td>A</td><td>B</td></tr>"
            + "<tr><td>C</td><td>D</td></tr></table>"
            + "<input type='text' name='email' value='test@test.com'/>"
            + "</div>";

        Document doc = Jsoup.parse(html);

        // Selector theo tag
        System.out.println("Các thẻ p: " + doc.select("p").size());

        // Selector theo class
        System.out.println(".note: " + doc.select(".note").eachText());

        // Selector theo ID
        System.out.println("#main p: " + doc.select("#main p").size());

        // Selector kết hợp (có cả hai class)
        System.out.println(".note.highlight: " + doc.select(".note.highlight").text());

        // Selector lấy ô td thứ nhất của mỗi hàng tr
        System.out.println("td:first-child: " + doc.select("td:first-child").eachText());

        // Selector theo thuộc tính
        System.out.println("[type=text]: " + doc.select("[type=text]").attr("value"));

        // Selector con trực tiếp (>)
        System.out.println("div > p: " + doc.select("div > p").size());

        // Chứa văn bản cụ thể
        System.out.println(":contains(Ghi chú): " + doc.select("p:contains(Ghi chú)").size());
    }
}
```

---

## Scraping dữ liệu thực tế

```java
import org.jsoup.*;
import org.jsoup.nodes.*;
import org.jsoup.select.*;
import java.io.*;
import java.util.*;

public class ScrapingDuLieu {
    record TinTuc(String tieuDe, String tomTat, String link) {}

    public static List<TinTuc> layTinTuc(String url) throws IOException {
        List<TinTuc> danhSach = new ArrayList<>();

        Document doc = Jsoup.connect(url)
            .userAgent("Mozilla/5.0 (compatible)")
            .timeout(10_000)
            .get();

        // Ví dụ selector — thay đổi tùy theo cấu trúc trang thực tế
        Elements articles = doc.select("article.post");

        for (Element article : articles) {
            Element titleEl = article.selectFirst("h2 a, h3 a");
            Element summaryEl = article.selectFirst("p.excerpt, .summary");

            if (titleEl != null) {
                String tieuDe = titleEl.text();
                String link = titleEl.attr("abs:href");
                String tomTat = summaryEl != null ? summaryEl.text() : "";

                danhSach.add(new TinTuc(tieuDe, tomTat, link));
            }
        }

        return danhSach;
    }

    public static void main(String[] args) {
        try {
            // Ví dụ - thay bằng URL thực tế
            List<TinTuc> tinTucs = layTinTuc("https://vnexpress.net/kinh-doanh");

            System.out.println("Thu thập được " + tinTucs.size() + " tin tức:");
            tinTucs.stream().limit(5).forEach(t -> {
                System.out.println("\nTiêu đề: " + t.tieuDe());
                System.out.println("Tóm tắt: " + t.tomTat());
                System.out.println("Link: " + t.link());
            });
        } catch (IOException e) {
            System.err.println("Lỗi: " + e.getMessage());
        }
    }
}
```

---

## Làm sạch HTML (Sanitize) chống XSS

**XSS** (Cross-Site Scripting — tấn công chèn script độc hại):

```java
import org.jsoup.*;
import org.jsoup.safety.*;

public class LamSachHTML {
    public static void main(String[] args) {
        // HTML nguy hiểm từ người dùng nhập vào
        String htmlNguyHiem =
            "<p>Nội dung bình thường</p>"
            + "<script>alert('XSS Attack!');</script>"
            + "<img src=x onerror='stealCookies()'>"
            + "<a href='javascript:void(0)' onclick='evil()'>Click me</a>"
            + "<b>In đậm hợp lệ</b>";

        // Safelist.none(): loại bỏ TẤT CẢ thẻ HTML
        String thuanVanBan = Jsoup.clean(htmlNguyHiem, Safelist.none());
        System.out.println("Thuần văn bản:\n" + thuanVanBan);

        // Safelist.basic(): chỉ giữ thẻ an toàn cơ bản (a, b, i, p, ...)
        String htmlAnToan = Jsoup.clean(htmlNguyHiem, Safelist.basic());
        System.out.println("\nHTML an toàn (basic):\n" + htmlAnToan);

        // Safelist.basicWithImages(): cho phép thêm thẻ <img>
        String htmlVoiAnh = Jsoup.clean(htmlNguyHiem, Safelist.basicWithImages());
        System.out.println("\nHTML với ảnh:\n" + htmlVoiAnh);

        // Safelist tùy chỉnh
        Safelist safelistTuyChinh = Safelist.relaxed()
            .addAttributes("div", "class", "id")
            .addAttributes("span", "class")
            .removeTags("script", "iframe");

        String htmlTuyChinh = Jsoup.clean(htmlNguyHiem, safelistTuyChinh);
        System.out.println("\nHTML tùy chỉnh:\n" + htmlTuyChinh);
    }
}
```

---

## Parse từ file HTML

```java
import org.jsoup.*;
import org.jsoup.nodes.*;
import java.io.*;
import java.nio.charset.StandardCharsets;

public class ParseTuFile {
    public static void main(String[] args) throws IOException {
        // Parse từ file
        File fileHtml = new File("trang-web.html");
        Document doc = Jsoup.parse(fileHtml, StandardCharsets.UTF_8.name());

        System.out.println("Tiêu đề: " + doc.title());

        // Trích xuất toàn bộ văn bản (không có thẻ HTML)
        String vanBanThuan = doc.body().text();
        System.out.println("Văn bản: " + vanBanThuan.substring(0, Math.min(200, vanBanThuan.length())));
    }
}
```

---

## Tóm tắt

| Tính năng | API |
|-----------|-----|
| Parse từ String | `Jsoup.parse(html)` |
| Tải từ URL | `Jsoup.connect(url).get()` |
| Parse từ file | `Jsoup.parse(file, charset)` |
| Tìm một phần tử | `doc.selectFirst("css-selector")` |
| Tìm nhiều phần tử | `doc.select("css-selector")` |
| Lấy văn bản | `element.text()` |
| Lấy thuộc tính | `element.attr("name")` |
| Làm sạch HTML | `Jsoup.clean(html, safelist)` |

Jsoup là công cụ mạnh cho **web scraping** và **xử lý HTML**. Khi scraping, cần tuân thủ `robots.txt` và điều khoản sử dụng của trang web.
