---
sidebar_position: 2
title: "2. Dependency & Supply Chain"
---

# Dependency & Supply Chain

Một ứng dụng web hiện đại dùng **hàng trăm thư viện bên thứ ba**. Mỗi thư viện là
một cánh cửa rủi ro: lỗ hổng đã biết, gói độc hại, hoặc gói bị chiếm quyền. Bài
cuối này trình bày **rủi ro chuỗi cung ứng** (supply chain) và cách phòng thủ thực
tế trong hệ sinh thái npm — kèm checklist tổng kết toàn bộ tài liệu.

---

## Mục lục

- [Rủi ro chuỗi cung ứng là gì?](#rủi-ro-chuỗi-cung-ứng-là-gì)
- [Quét lỗ hổng đã biết: npm audit](#quét-lỗ-hổng-đã-biết-npm-audit)
- [Khoá phiên bản: lockfile](#khoá-phiên-bản-lockfile)
- [Các kiểu tấn công supply chain](#các-kiểu-tấn-công-supply-chain)
- [Best practices chọn & dùng dependency](#best-practices-chọn--dùng-dependency)
- [Checklist bảo mật tổng kết](#checklist-bảo-mật-tổng-kết)
- [Tóm tắt](#tóm-tắt)

---

## Rủi ro chuỗi cung ứng là gì?

**Supply chain attack** (tấn công chuỗi cung ứng) là khi kẻ tấn công không đánh
thẳng vào bạn, mà **đánh vào thứ bạn phụ thuộc** — một thư viện, một công cụ build,
một CI/CD. Khi bạn cài/chạy nó, mã độc chạy theo với chính quyền của bạn.

> Vì bạn **tin** dependency (và cả dependency của dependency — *transitive*), một
> gói bị nhiễm có thể ảnh hưởng tới rất nhiều dự án. Đây là nhóm **Software & Data
> Integrity Failures** trong OWASP.

## Quét lỗ hổng đã biết: npm audit

Công cụ đầu tiên và dễ nhất: **`npm audit`** rà các lỗ hổng *đã được công bố*
trong cây dependency của bạn.

```bash
npm audit              # liệt kê lỗ hổng đã biết + mức độ
npm audit fix          # tự nâng cấp các bản vá an toàn (không phá vỡ)
npm audit --production # chỉ xét dependency chạy thật (bỏ devDependencies)
```

- Tích hợp `npm audit` vào **CI** để chặn lỗ hổng nghiêm trọng trước khi merge.
- Cân nhắc công cụ chuyên sâu hơn: **Dependabot/Renovate** (tự mở PR nâng cấp),
  **Snyk**, **GitHub security alerts**.

:::tip Vá lỗ hổng đã biết là "quả ngọt dễ hái"
Phần lớn sự cố supply chain thực ra đến từ **lỗ hổng đã biết mà không ai vá**.
Chạy `npm audit` đều đặn + tự động hoá nâng cấp là biện pháp hiệu quả/chi phí cao
nhất.
:::

## Khoá phiên bản: lockfile

File **lockfile** (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`) ghi lại
**chính xác phiên bản** của mọi dependency (kể cả transitive). Tác dụng:

- **Tái lập build** giống hệt nhau giữa các máy/lần cài → tránh "máy tôi chạy được".
- **Chống đổi ngầm**: không bị tự kéo một bản mới (có thể đã bị nhiễm).

```bash
# CI: cài đúng theo lockfile, KHÔNG tự cập nhật — quan trọng cho build sạch
npm ci
```

> Luôn **commit lockfile**. Trong CI dùng `npm ci` (cài đúng lockfile) thay vì
> `npm install` (có thể đổi lockfile).

## Các kiểu tấn công supply chain

| Kiểu | Mô tả |
| --- | --- |
| **Typosquatting** | Đặt tên gói gần giống gói thật (`react` thay `react`) để bạn cài nhầm |
| **Dependency confusion** | Đẩy gói trùng tên gói nội bộ lên registry công khai với version cao hơn |
| **Account takeover** | Chiếm tài khoản maintainer rồi phát hành bản nhiễm mã độc |
| **Malicious update** | Một bản cập nhật của gói hợp pháp bị cài cắm mã độc |
| **Install scripts** | Mã độc chạy ngay khi `npm install` qua script `postinstall` |

## Best practices chọn & dùng dependency

- **Cân nhắc trước khi thêm** — mỗi dependency là rủi ro + gánh nặng bảo trì. Hỏi:
  "tự viết vài dòng có hơn không?"
- **Ưu tiên gói uy tín** — nhiều người dùng, bảo trì tích cực, ít dependency con.
- **Kiểm tra tên kỹ** trước khi cài (chống typosquatting).
- **Giảm tối thiểu số dependency** — bề mặt tấn công nhỏ hơn.
- **Cẩn trọng install script** — cân nhắc `npm install --ignore-scripts` cho môi
  trường nhạy cảm.
- **Theo dõi & nâng cấp đều** — đừng để dependency mục ruỗng nhiều năm.
- Cân nhắc **SBOM** (Software Bill of Materials — bản kê thành phần phần mềm) để
  biết chính xác mình đang dùng gì.

## Checklist bảo mật tổng kết

:::tip Checklist trước khi lên production (toàn tài liệu)
**Input & Output**
- [ ] Validate **mọi input** ở phía server (không chỉ client)
- [ ] Escape/sanitize output chống **XSS**; cẩn thận `dangerouslySetInnerHTML`
- [ ] Truy vấn **tham số hoá** chống **SQL injection**; tránh shell injection

**Xác thực & Phân quyền**
- [ ] Kiểm tra quyền ở **server**, mỗi endpoint; chống **IDOR**, mặc định từ chối
- [ ] Mật khẩu hash bằng **bcrypt/argon2**; có **MFA** cho tài khoản quan trọng
- [ ] Cookie phiên: `httpOnly` + `secure` + `sameSite`; JWT hạn ngắn

**Transport & Headers**
- [ ] **HTTPS** ở mọi nơi + **HSTS**
- [ ] **CSP** chống XSS; `X-Frame-Options`/`frame-ancestors` chống clickjacking
- [ ] **CORS** danh sách trắng, không `*` cho API có dữ liệu

**Vận hành**
- [ ] Không hardcode **secret**; `.env` không commit; xoay khoá khi lộ
- [ ] **Rate limiting** cho endpoint nhạy cảm (login, OTP...)
- [ ] `npm audit` trong CI + **lockfile** committed + nâng cấp định kỳ
- [ ] **Logging & monitoring** đủ để phát hiện tấn công; lỗi không lộ thông tin
:::

## Tóm tắt

- **Supply chain attack**: kẻ tấn công nhắm vào **thứ bạn phụ thuộc** (thư viện,
  tooling) — gồm cả dependency *transitive*.
- **`npm audit`** (trong CI) + **Dependabot/Renovate/Snyk** vá lỗ hổng đã biết —
  biện pháp hiệu quả nhất.
- **Lockfile** (committed) + **`npm ci`** đảm bảo build tái lập và chống đổi ngầm.
- Cảnh giác **typosquatting, dependency confusion, account takeover, malicious
  update, install script**.
- **Giảm tối thiểu dependency**, ưu tiên gói uy tín, nâng cấp đều, cân nhắc SBOM.

🎉 Đây là bài cuối của topic **Bảo mật web**. Bạn đã đi qua: tư duy nền tảng &
OWASP → tấn công phổ biến → xác thực & phiên → transport & headers → secrets &
chuỗi cung ứng. Hãy nhớ nguyên tắc xuyên suốt: **không tin input, phòng thủ nhiều
lớp, và bảo mật là việc làm liên tục — không phải bước cuối.**
