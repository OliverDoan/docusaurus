---
sidebar_position: 2
title: "2. OWASP Top 10"
---

# OWASP Top 10

**OWASP Top 10** là danh sách 10 nhóm rủi ro bảo mật web nghiêm trọng và phổ biến
nhất, do tổ chức **OWASP** (Open Worldwide Application Security Project) tổng hợp
và cập nhật định kỳ. Đây là "bản đồ" chuẩn để biết nên ưu tiên phòng thủ điều gì.
Bài này giới thiệu tổng quan 10 nhóm và chỉ ra bài học nào trong tài liệu xử lý
từng nhóm.

---

## Mục lục

- [OWASP là gì?](#owasp-là-gì)
- [Danh sách Top 10](#danh-sách-top-10)
- [Bản đồ tới các bài trong tài liệu](#bản-đồ-tới-các-bài-trong-tài-liệu)
- [Tóm tắt](#tóm-tắt)

---

## OWASP là gì?

**OWASP** là một cộng đồng phi lợi nhuận chuyên về bảo mật ứng dụng. Tài liệu nổi
tiếng nhất của họ là **OWASP Top 10** — được giới lập trình và bảo mật xem như
chuẩn tham chiếu cơ bản.

> Danh sách được cập nhật vài năm một lần (các phiên bản gần đây: 2017, 2021, và
> các bản mới hơn). Tên gọi/thứ tự có thể đổi theo phiên bản, nhưng **bản chất các
> rủi ro thì khá ổn định**. Hãy tra **owasp.org** để xem phiên bản mới nhất.

## Danh sách Top 10

Dưới đây là 10 nhóm rủi ro tiêu biểu (theo cách phân loại phổ biến của OWASP), kèm
giải thích ngắn:

| # | Nhóm rủi ro | Bản chất |
| --- | --- | --- |
| 1 | **Broken Access Control** (Kiểm soát truy cập hỏng) | Người dùng làm được việc ngoài quyền của họ — rủi ro đứng đầu hiện nay |
| 2 | **Cryptographic Failures** (Lỗi mã hoá) | Dữ liệu nhạy cảm không được mã hoá đúng (mật khẩu, thẻ, token) |
| 3 | **Injection** | Dữ liệu độc hại bị "tiêm" vào câu lệnh (SQL, OS command, v.v.) — gồm cả XSS |
| 4 | **Insecure Design** (Thiết kế thiếu an toàn) | Lỗ hổng nằm ngay ở khâu thiết kế, không phải lỗi code |
| 5 | **Security Misconfiguration** (Cấu hình sai) | Để mặc định không an toàn, lộ trang admin, header thiếu |
| 6 | **Vulnerable & Outdated Components** | Dùng thư viện/dependency có lỗ hổng đã biết |
| 7 | **Identification & Authentication Failures** | Xác thực yếu: mật khẩu yếu, session lỗi, thiếu chống brute-force |
| 8 | **Software & Data Integrity Failures** | Tin vào code/dữ liệu không kiểm chứng (gồm rủi ro chuỗi cung ứng) |
| 9 | **Security Logging & Monitoring Failures** | Thiếu log/giám sát → không phát hiện được tấn công |
| 10 | **Server-Side Request Forgery (SSRF)** | Server bị lừa gửi request tới đích do kẻ tấn công chỉ định |

:::note Đừng học thuộc số thứ tự
Quan trọng là **hiểu bản chất từng nhóm** và biết hệ thống của mình dính nhóm nào,
chứ không phải nhớ "cái nào số mấy". Thứ tự thay đổi theo từng phiên bản.
:::

## Bản đồ tới các bài trong tài liệu

Tài liệu này phủ phần lớn Top 10. Dùng bảng sau để biết học ở đâu:

| Nhóm OWASP | Học ở bài |
| --- | --- |
| Broken Access Control | **3. Xác thực & Phiên** → Authentication & Authorization |
| Cryptographic Failures | **3.** Lưu mật khẩu an toàn · **4.** HTTPS/TLS |
| Injection (SQL/command) | **2. Tấn công phổ biến** → Injection |
| Injection (XSS) | **2.** Cross-Site Scripting (XSS) |
| Insecure Design | **1. Nền tảng** → Tư duy bảo mật (mô hình đe doạ) |
| Security Misconfiguration | **4.** Security Headers & CSP |
| Vulnerable Components | **5.** Dependency & Supply Chain |
| Auth Failures | **3.** Session/Cookie/JWT · Lưu mật khẩu |
| Integrity / Supply Chain | **5.** Dependency & Supply Chain |
| SSRF | **2.** SSRF & Clickjacking |

> Ngoài ra **CSRF** (Cross-Site Request Forgery) tuy không còn là một mục riêng
> trong các bản Top 10 gần đây (vì framework hiện đại đã phòng sẵn), nhưng vẫn rất
> quan trọng — có bài riêng ở mục 2.

## Tóm tắt

- **OWASP Top 10** là danh sách 10 nhóm rủi ro web phổ biến & nghiêm trọng nhất,
  do OWASP duy trì — chuẩn tham chiếu cơ bản cho mọi lập trình viên.
- Các nhóm nổi bật: **Broken Access Control, Cryptographic Failures, Injection,
  Insecure Design, Misconfiguration, Vulnerable Components, Auth Failures,
  Integrity/Supply Chain, Logging Failures, SSRF**.
- **Hiểu bản chất** quan trọng hơn nhớ thứ tự; thứ tự đổi theo phiên bản.
- Tài liệu này phủ phần lớn Top 10 qua các mục 2–5; tra **owasp.org** cho bản mới
  nhất.

Hết mục Nền tảng. Mục tiếp theo: đi sâu vào **các tấn công phổ biến**, bắt đầu với
XSS.
