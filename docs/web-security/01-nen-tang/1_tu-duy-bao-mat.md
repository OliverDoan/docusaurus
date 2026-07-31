---
sidebar_position: 1
title: "1. Tư duy bảo mật"
---

# Tư duy bảo mật

Bài này xây nền tảng tư duy trước khi đi vào kỹ thuật cụ thể: **bộ ba CIA** (ba
mục tiêu bảo mật), **mô hình đe doạ** (cách nghĩ như kẻ tấn công), và các **nguyên
tắc phòng thủ** cốt lõi. Nắm được tư duy này, bạn sẽ hiểu *vì sao* mỗi biện pháp ở
các bài sau tồn tại, chứ không chỉ học thuộc.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Không tin dữ liệu vượt ranh giới tin cậy** — mọi input phải được kiểm tra, và validate phía `server` là bắt buộc (client chỉ phụ trợ).
- ⭐ **Bộ ba `CIA`** — Confidentiality (bảo mật), Integrity (toàn vẹn), Availability (sẵn sàng) là ba mục tiêu của mọi biện pháp bảo mật.
- **Mô hình đe doạ (`threat modeling`)** — liệt kê tài sản, điểm vào, kẻ tấn công, đe doạ, biện pháp; nghĩ như kẻ tấn công trước khi họ ra tay.
- **Nguyên tắc phòng thủ** — `defense in depth`, `least privilege`, `secure by default`, `fail securely`, không tự chế crypto.
- **Phân biệt validate / sanitize / escape** — luôn `escape` theo đúng ngữ cảnh đích (HTML, SQL, URL...).

:::

---

## Mục lục

- [Bộ ba CIA](#bộ-ba-cia)
- [Mô hình đe doạ: nghĩ như kẻ tấn công](#mô-hình-đe-doạ-nghĩ-như-kẻ-tấn-công)
- [Ranh giới tin cậy: không tin input](#ranh-giới-tin-cậy-không-tin-input)
- [Các nguyên tắc phòng thủ](#các-nguyên-tắc-phòng-thủ)
- [Validate vs Sanitize vs Escape](#validate-vs-sanitize-vs-escape)
- [Tóm tắt](#tóm-tắt)

---

## Bộ ba CIA

Mọi mục tiêu bảo mật quy về ba thuộc tính, gọi tắt là **CIA**:

| Thuộc tính | Nghĩa | Ví dụ khi bị phá |
| --- | --- | --- |
| **Confidentiality** (Bảo mật) | Chỉ người được phép xem được dữ liệu | Rò rỉ mật khẩu, lộ thông tin cá nhân |
| **Integrity** (Toàn vẹn) | Dữ liệu không bị sửa trái phép | Kẻ tấn công đổi số dư tài khoản |
| **Availability** (Sẵn sàng) | Hệ thống luôn truy cập được khi cần | Tấn công DoS làm sập dịch vụ |

> Khi đánh giá một tính năng, hãy tự hỏi: *điều gì xảy ra nếu kẻ xấu đọc được
> (C), sửa được (I), hoặc làm sập (A) phần này?*

## Mô hình đe doạ: nghĩ như kẻ tấn công

**Threat modeling** (mô hình hoá đe doạ) là việc chủ động liệt kê *ai có thể tấn
công, tấn công cái gì, bằng cách nào* — trước khi họ làm thật. Một cách đơn giản:

1. **Tài sản (assets)** — cái gì đáng giá? (dữ liệu người dùng, tiền, token...)
2. **Điểm vào (entry points)** — dữ liệu ngoài đi vào hệ thống ở đâu? (form, URL,
   API, upload file, header...)
3. **Kẻ tấn công (actors)** — ai? (người dùng ác ý, bot, người trong nội bộ...)
4. **Đe doạ (threats)** — họ làm gì được ở mỗi điểm vào?
5. **Biện pháp (mitigations)** — ta chặn bằng cách nào?

> Mỗi **điểm vào** là một chỗ kẻ tấn công có thể "đẩy" dữ liệu độc hại. Phần lớn
> lỗ hổng web nằm ở việc xử lý sai dữ liệu tại các điểm vào này.

## Ranh giới tin cậy: không tin input

**Ranh giới tin cậy (trust boundary)** là lằn ranh giữa phần bạn kiểm soát (server
của bạn) và phần bạn *không* kiểm soát (trình duyệt, mạng, API bên thứ ba).

> **Quy tắc số một:** *Không bao giờ tin dữ liệu vượt qua ranh giới tin cậy.* Mọi
> input người dùng, phản hồi từ API ngoài, nội dung file tải lên — đều phải coi là
> **có thể độc hại** cho tới khi được kiểm tra.

Hệ quả quan trọng:

- **Kiểm tra phía server là bắt buộc.** Validate ở client (JavaScript trên trình
  duyệt) chỉ để **trải nghiệm tốt hơn** — kẻ tấn công bỏ qua trình duyệt và gọi
  thẳng API được.

```js
// SAI: chỉ tin vào validate phía client
// Client đã check email rồi → server lưu thẳng. Kẻ tấn công gọi thẳng API thì sao?

// ĐÚNG: server LUÔN validate lại, bất kể client đã làm gì
import { z } from 'zod'

const UserSchema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150),
})

function createUser(body: unknown) {
  const data = UserSchema.parse(body) // ném lỗi nếu dữ liệu không hợp lệ
  // data giờ đã an toàn về kiểu & ràng buộc
}
```

## Các nguyên tắc phòng thủ

| Nguyên tắc | Ý nghĩa |
| --- | --- |
| **Defense in depth** (phòng thủ nhiều lớp) | Nhiều lớp bảo vệ; một lớp thủng vẫn còn lớp khác |
| **Least privilege** (đặc quyền tối thiểu) | Mỗi thành phần chỉ có đúng quyền cần thiết, không hơn |
| **Secure by default** (an toàn mặc định) | Mặc định khoá; chỉ mở thứ thực sự cần |
| **Fail securely** (lỗi an toàn) | Khi có lỗi, nghiêng về *từ chối* chứ không *cho qua* |
| **Don't roll your own crypto** | Dùng thư viện kiểm chứng, đừng tự chế thuật toán bảo mật |
| **Minimize attack surface** | Càng ít điểm vào / tính năng lộ ra, càng ít chỗ để tấn công |

:::tip "Fail securely" trong thực tế
Nếu hệ thống kiểm tra quyền bị lỗi/đứt kết nối, hãy **từ chối truy cập** (mặc định
deny), đừng "vì lỗi nên cho qua". Mặc định mở là một trong những sai lầm nguy hiểm
nhất.
:::

## Validate vs Sanitize vs Escape

Ba thao tác hay bị nhầm, nhưng khác nhau:

| Thao tác | Làm gì | Khi nào |
| --- | --- | --- |
| **Validate** (kiểm tra) | Chấp nhận/từ chối dữ liệu theo quy tắc | Ngay khi nhận input (vd email đúng định dạng) |
| **Sanitize** (làm sạch) | Loại bỏ phần nguy hiểm khỏi dữ liệu | Vd lọc HTML độc hại trước khi lưu/hiển thị |
| **Escape** (thoát ký tự) | Biến dữ liệu thành "vô hại" cho ngữ cảnh đích | Khi *xuất* dữ liệu ra HTML, SQL, shell... |

> Điểm mấu chốt: **escape theo đúng ngữ cảnh đích**. Cùng một chuỗi, escape cho
> HTML khác với escape cho SQL hay cho URL. Ta sẽ thấy điều này rõ ở bài XSS và
> Injection.

## Tóm tắt

- Mọi mục tiêu bảo mật quy về **CIA**: Bảo mật, Toàn vẹn, Sẵn sàng.
- **Mô hình đe doạ**: liệt kê tài sản, điểm vào, kẻ tấn công, đe doạ, biện pháp —
  nghĩ như kẻ tấn công trước khi họ ra tay.
- **Không tin dữ liệu vượt ranh giới tin cậy**; validate phía **server** là bắt
  buộc, client chỉ là phụ trợ.
- Áp dụng các nguyên tắc: **phòng thủ nhiều lớp, đặc quyền tối thiểu, an toàn mặc
  định, lỗi an toàn, không tự chế crypto**.
- Phân biệt **validate / sanitize / escape**; luôn **escape theo ngữ cảnh đích**.

Bài tiếp theo: **OWASP Top 10** — danh sách rủi ro web quan trọng nhất.
