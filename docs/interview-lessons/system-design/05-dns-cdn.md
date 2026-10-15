---
sidebar_position: 5
title: "DNS & CDN"
---

# DNS & CDN

## 9. Domain Name System (DNS)

Bài học: [9. Domain Name System (DNS)](../../system-design/05-dns-cdn/1_dns.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Điều gì xảy ra khi bạn gõ `www.example.com` vào trình duyệt (phần DNS)?**

<details className="qa">
<summary>Xem đáp án</summary>

Trình duyệt kiểm tra cache của nó → cache OS / file hosts → gửi truy vấn đệ quy tới recursive resolver (ISP, `8.8.8.8`...). Nếu resolver chưa cache, nó hỏi lặp: root server → TLD server `.com` → authoritative name server của `example.com`, nhận record `A`/`AAAA` kèm TTL, cache lại và trả về. Sau đó trình duyệt mới mở kết nối TCP/TLS tới IP đó.

</details>

**2. Phân biệt record A, AAAA, CNAME, NS, MX, TXT.**

<details className="qa">
<summary>Xem đáp án</summary>

- **A:** tên → IPv4. **AAAA:** tên → IPv6.
- **CNAME:** tên này là bí danh của tên khác; không dùng ở apex, không đi kèm record khác cùng tên.
- **NS:** chỉ ra name server có thẩm quyền của zone (dùng để uỷ quyền).
- **MX:** máy chủ nhận mail, kèm độ ưu tiên.
- **TXT:** văn bản tuỳ ý — SPF, DKIM, DMARC, xác minh domain.

</details>

**3. TTL ảnh hưởng gì đến hệ thống? Bạn chọn TTL thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

TTL là thời gian record được cache. TTL ngắn → thay đổi/failover nhanh nhưng nhiều truy vấn hơn và latency trung bình tăng. TTL dài → ít truy vấn, nhanh, nhưng thay đổi lan truyền chậm. Thường: 300s mặc định, 60s cho record cần failover, 1 ngày cho NS/MX ít đổi. Trước khi migration thì hạ TTL trước một khoảng bằng TTL cũ.

</details>

**4. Làm sao đưa user tới data center gần nhất? Hạn chế của cách dùng DNS?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng DNS **latency-based** hoặc **geolocation routing** (Route 53, Cloudflare, Traffic Manager) kèm health check; hoặc dùng **Anycast** (cùng một IP quảng bá từ nhiều nơi, BGP đưa gói tin tới điểm gần nhất). Hạn chế của DNS: chỉ thấy IP của resolver (trừ khi có ECS), bị cache nên failover chậm ít nhất bằng TTL, tỷ lệ phân tải không chính xác. Vì vậy DNS dùng để chọn region, còn load balancer phân tải bên trong region.

</details>

**5. Nêu các rủi ro/nhược điểm của DNS và cách giảm thiểu.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Độ trễ phân giải** → cache, TTL hợp lý, `dns-prefetch`, keep-alive.
- **Lan truyền chậm** → hạ TTL trước khi đổi, giữ hạ tầng cũ chạy song song.
- **DDoS vào DNS provider** (Dyn 2016) → dùng nhiều provider, provider có Anycast.
- **Spoofing / cache poisoning** → DNSSEC; DoH/DoT để mã hoá.
- **Cấu hình sai** → quản lý bằng code, review, có rollback.

</details>

**6. Vì sao không thể đặt CNAME ở root domain và giải pháp là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Theo chuẩn DNS, một tên có CNAME thì không được có record nào khác. Apex domain bắt buộc có `SOA` và `NS`, nên không thể đặt CNAME ở đó. Giải pháp: dùng record **ALIAS / ANAME / CNAME flattening** (Cloudflare) hoặc **Alias record** (Route 53) — provider tự phân giải đích rồi trả về `A`/`AAAA`; hoặc đặt `A` trỏ tới IP tĩnh/Anycast của dịch vụ.

</details>

---

## 10. Content Delivery Networks (CDN)

Bài học: [10. Content Delivery Networks (CDN)](../../system-design/05-dns-cdn/2_cdn.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. CDN giúp cải thiện hiệu năng như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Giảm latency:** user kết nối tới PoP gần, bắt tay TCP/TLS ngắn hơn, nội dung trả từ cache.
- **Giảm tải origin:** phần lớn request trúng cache ở edge, origin chỉ xử lý cache miss.
- **Băng thông lớn, chịu đỉnh tốt:** mạng CDN phân tán hấp thụ traffic tăng đột biến và DDoS.
- **Tối ưu ở edge:** nén, HTTP/2–3, resize ảnh.

</details>

**2. Push CDN và Pull CDN khác nhau thế nào? Khi nào chọn cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Pull:** CDN tự kéo nội dung từ origin khi có request đầu tiên, cache theo TTL. Dễ cấu hình, chỉ lưu nội dung được xem; nhược điểm là request đầu chậm và có request về origin khi hết hạn. Hợp với site traffic lớn, nội dung đa dạng.
- **Push:** bạn upload nội dung lên CDN chủ động. Không có cache miss lần đầu, origin gần như không bị gọi; nhưng phải tự quản lý upload/xoá, tốn dung lượng. Hợp với site ít traffic, nội dung ít đổi hoặc phát hành theo đợt.

</details>

**3. Làm sao để deploy phiên bản frontend mới mà user không bị dính bản cũ trong cache?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng **tên file có hash nội dung** cho JS/CSS/ảnh và cache chúng 1 năm với `immutable`. `index.html` đặt `Cache-Control: no-cache` để luôn revalidate, nhờ đó luôn trỏ tới hash mới. Giữ asset cũ một thời gian để tab đang mở không lỗi tải chunk. Không cần purge CDN cho asset.

</details>

**4. Giải thích `max-age`, `s-maxage`, `no-cache`, `no-store`, `stale-while-revalidate`.**

<details className="qa">
<summary>Xem đáp án</summary>

- `max-age`: thời gian tươi cho mọi cache.
- `s-maxage`: thời gian tươi chỉ cho shared cache (CDN), ghi đè `max-age` ở CDN.
- `no-cache`: được lưu nhưng phải hỏi lại origin trước khi dùng (thường nhận `304`).
- `no-store`: không được lưu ở bất kỳ đâu.
- `stale-while-revalidate`: được trả bản cũ trong một khoảng thời gian trong khi làm mới ở nền — giảm latency và tránh dồn request về origin.

</details>

**5. Rủi ro bảo mật khi dùng CDN là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Cache nhầm dữ liệu cá nhân** → trả cho người khác (thiếu `private`/`no-store`, cache key không gồm thông tin phiên). Biến thể tấn công: **web cache deception** (lừa CDN cache `/account/profile.css`) và **cache poisoning** (header không nằm trong cache key làm thay đổi response).
- **Origin lộ IP** → bị tấn công trực tiếp bỏ qua WAF.
- **Phụ thuộc bên thứ ba** — sự cố của CDN ảnh hưởng toàn site.

Cách giảm: cấu hình cache key và `Cache-Control` chặt, không cache khi có cookie/Authorization, khoá origin chỉ nhận IP CDN.

</details>

**6. Hit ratio của CDN thấp, bạn sẽ điều tra những gì?**

<details className="qa">
<summary>Xem đáp án</summary>

- Header origin trả về: có `no-cache`/`private`/`Set-Cookie` khiến CDN không cache không?
- **Cache key**: có chứa query vô nghĩa (utm, fbclid), cookie, hoặc `Vary` quá rộng (`Vary: User-Agent`) không?
- **TTL** quá ngắn?
- Nội dung dạng "đuôi dài" (nhiều URL ít người xem) → cân nhắc origin shield / tiered cache.
- Có purge quá thường xuyên không?

</details>
