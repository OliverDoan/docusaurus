---
sidebar_position: 6
title: "6. Web Security"
---

# 6. Web Security

## 1. Hashing và Network Security

Bài học: [1. Hashing và Network Security](../../backend/06-security/1_hashing-network.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `Hashing`, `encryption` và `encoding` khác nhau ở chỗ nào? Cho ví dụ dùng sai mỗi loại.**

<details className="qa">
<summary>Xem đáp án</summary>

| | Mục đích | Đảo ngược được? | Cần key? |
|---|---|---|---|
| **Hashing** | Toàn vẹn, xác thực password | Không (one-way) | Không |
| **Encryption** | Giữ bí mật nội dung | Có, nếu có key | Có |
| **Encoding** | Đổi định dạng cho dễ truyền | Có, ai cũng làm được | Không |

Ví dụ dùng sai:

- **Encoding thay cho encryption:** lưu password dạng `Base64` rồi tưởng là an toàn — bất kỳ ai cũng decode trong một dòng lệnh.
- **Encryption thay cho hashing:** mã hoá password bằng AES để "lúc cần lấy lại". Key rò rỉ là toàn bộ password về plaintext; đúng ra phải hash một chiều.
- **Hashing thay cho encryption:** hash số thẻ tín dụng rồi cần đọc lại để đối soát — không bao giờ khôi phục được.

Mẹo nhớ: encoding không liên quan gì tới bảo mật, encryption bảo vệ bí mật, hashing chứng minh mà không cần biết.

</details>

**2. Một hàm hash tốt cần những tính chất gì? Giải thích `avalanche effect` và `collision resistance`.**

<details className="qa">
<summary>Xem đáp án</summary>

Năm tính chất bài đã nêu:

- **Deterministic** — cùng input luôn ra cùng output, nếu không thì không verify được.
- **Nhanh** (hash thường) hoặc **chậm có chủ đích** (password hash).
- **One-way** — từ output không suy ngược ra input.
- **Avalanche effect** — đổi một bit ở input thì output thay đổi hoàn toàn, khoảng một nửa số bit lật. Nhờ vậy không thể "dò dần" bằng cách nhìn xem hash gần giống nhau tới đâu.
- **Collision resistance** — khó tìm hai input khác nhau cho ra cùng một hash.

```
"hello" → SHA256 → 2cf24dba5fb0a30e...
"helo"  → SHA256 → b3a8e0e1f9ab1bfe...
```

Hai chuỗi chỉ khác một ký tự nhưng hash không có điểm chung nào — đó chính là avalanche. Mất collision resistance thì chữ ký số và checksum vô nghĩa: kẻ tấn công tạo được file độc có cùng hash với file sạch, đúng như chuyện đã xảy ra với `MD5` và `SHA-1`.

</details>

**3. Vì sao tuyệt đối không lưu password dạng plaintext, và cũng không lưu dạng mã hoá có thể giải ngược?**

<details className="qa">
<summary>Xem đáp án</summary>

Lý do cốt lõi: **server không cần biết password của user**, nó chỉ cần chứng minh được user biết password. Bài ví hash như cái cối xay thịt — server xay lại rồi so hai mớ, thế là đủ.

- **Plaintext:** một lần rò rỉ database là mất toàn bộ tài khoản. Tệ hơn, người dùng hay xài chung mật khẩu nên kẻ tấn công lấy được luôn email, ngân hàng của họ (credential stuffing).
- **Encryption reversible:** an toàn của toàn bộ password phụ thuộc vào một key duy nhất. Key nằm trong env, trong code, trong backup, trong KMS — chỉ cần một chỗ rò là hỏng tất. Nhân viên có quyền truy cập cũng đọc được.
- Hash một chiều thì kẻ trộm cầm được DB vẫn phải brute force từng account, và nếu dùng slow hash thì chi phí đó là không khả thi.

Ngoại lệ: những thứ *cần* đọc lại như API key của bên thứ ba thì mới encrypt, còn password người dùng thì luôn hash.

</details>

**4. `MD5` và `SHA-256` đều là one-way, vậy vì sao vẫn không được dùng để hash password?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì chúng **quá nhanh** — đúng cái ưu điểm khiến chúng hợp cho checksum lại là tử huyệt khi làm password hash. Bài đã đưa con số:

- `MD5`/`SHA`: khoảng 5 tỷ hash mỗi giây trên GPU → password 8 ký tự dò hết trong vài giờ.
- `bcrypt` cost 12: khoảng 5 hash mỗi giây → cùng password đó mất hàng nghìn năm.

Kẻ tấn công steal được DB sẽ brute force **offline**, không bị rate limit, không bị khoá tài khoản, chạy song song trên hàng chục GPU. Với hash nhanh thì rainbow table và wordlist quét sạch phần lớn mật khẩu thật.

Password hash được thiết kế **chậm có chủ đích**, và `Argon2` còn **memory-hard** để GPU/ASIC không nhân bản được hàng nghìn lõi rẻ tiền. Cái giá là login chậm vài trăm ms — user đăng nhập vài lần một ngày nên không cảm nhận được, còn kẻ dò hàng tỉ lần thì phá sản.

Kết luận: `SHA-256` để checksum, HMAC, fingerprint — không bao giờ cho password.

</details>

**5. `salt` giải quyết vấn đề gì (`rainbow table`, hai user cùng đặt một mật khẩu)? Salt có cần giữ bí mật không, lưu ở đâu?**

<details className="qa">
<summary>Xem đáp án</summary>

`salt` là chuỗi ngẫu nhiên **riêng cho từng user**, nối vào password trước khi hash. Bài ví nó như nhúm gia vị riêng của mỗi người.

Nó giải quyết hai vấn đề:

- **Rainbow table** — bảng tra sẵn hash của hàng tỉ mật khẩu phổ biến. Salt ngẫu nhiên khiến bảng dựng sẵn vô dụng, vì kẻ tấn công phải dựng lại bảng riêng cho từng salt.
- **Hai user cùng mật khẩu** — không salt thì hai người cùng đặt "123456" sẽ có hash giống hệt nhau, lộ ngay là ai xài mật khẩu yếu và crack một lần trúng nhiều account. Có salt thì hash khác nhau hoàn toàn.

Salt **không cần bí mật** — nó chỉ cần *duy nhất và ngẫu nhiên*. Với `bcrypt` và `Argon2` bạn không phải quản lý gì cả: chúng tự sinh salt và nhúng thẳng vào chuỗi hash lưu trong DB, lúc verify tự đọc ra dùng lại. Thứ cần giữ bí mật là `pepper`, không phải salt.

</details>

**6. `pepper` khác `salt` thế nào và vì sao phải để pepper ngoài database?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `salt` | `pepper` |
|---|---|---|
| Phạm vi | Riêng từng user | Chung toàn hệ thống |
| Bí mật? | Không | **Có** |
| Lưu ở đâu | Trong chuỗi hash, cùng DB | Env var / secret manager, **ngoài DB** |
| Chống gì | Rainbow table, trùng mật khẩu | Brute force khi DB bị rò |

Cách dùng như bài trình bày:

```ts
const peppered = password + process.env.PEPPER;
const hash = await bcrypt.hash(peppered, 12);
```

Toàn bộ giá trị của pepper nằm ở chỗ nó **không nằm cùng nơi với dữ liệu bị đánh cắp**. Kịch bản rò rỉ phổ biến nhất là SQL injection hay backup DB lọt ra ngoài — lúc đó kẻ tấn công có hash nhưng thiếu pepper thì không brute force được gì cả. Nếu bạn lưu pepper vào một bảng trong chính DB đó, nó thoái hoá thành salt và mất sạch tác dụng.

Đổi lại, xoay vòng pepper rất phiền vì phải re-hash; thường người ta version pepper và migrate dần lúc user login.

</details>

**7. `bcrypt` lưu salt ở đâu? Bóc tách chuỗi `$2b$12$...` xem gồm những thành phần gì.**

<details className="qa">
<summary>Xem đáp án</summary>

`bcrypt` lưu salt **ngay trong chuỗi hash**, nên bạn chỉ cần một cột trong DB, không cần cột salt riêng.

```
$2b$12$abcdefghijklmnopqrstuv.XyZ...
 │  │  └──────────┬──────────┘└──┬──┘
 │  │         salt (22 ký tự)  hash (31 ký tự)
 │  └── cost factor = 12 → 2^12 vòng lặp
 └── version của thuật toán (2a / 2b / 2y)
```

Chuỗi đầy đủ dài 60 ký tự, các phần ngăn nhau bằng `$`, dùng bảng mã base64 riêng của bcrypt.

Nhờ cấu trúc này, `bcrypt.compare(input, stored)` tự đọc version + cost + salt từ chuỗi đã lưu, hash lại input theo đúng tham số đó rồi so sánh. Đó cũng là lý do bạn **đổi cost được mà không hỏng dữ liệu cũ**: hash cũ cost 10 và hash mới cost 12 sống chung trong một bảng, mỗi dòng tự mang tham số của nó. `Argon2` cũng theo ý tưởng tương tự, chuỗi `$argon2id$v=19$m=...,t=...,p=...$salt$hash` còn ghi rõ cả memory và parallelism.

</details>

**8. `cost factor` / `work factor` là gì? Chọn cost bao nhiêu, và vì sao phải tăng dần theo thời gian?**

<details className="qa">
<summary>Xem đáp án</summary>

`cost factor` là tham số điều chỉnh **độ chậm** của hàm hash. Với `bcrypt`, cost là số mũ: cost 12 nghĩa là `2^12` vòng lặp, tăng cost thêm 1 là thời gian gấp đôi. Với `Argon2` thì có ba núm vặn: `memoryCost`, `timeCost`, `parallelism`.

Khuyến nghị trong bài:

- `bcrypt`: **12 rounds** là chuẩn hiện nay, 10 chỉ để tương thích hệ thống cũ.
- `Argon2id`: `memoryCost` khoảng 19 MB, `timeCost` 2, `parallelism` 1.

Cách chọn thực tế: đo trên chính phần cứng production, chỉnh sao cho một lần hash tốn **khoảng 200–500 ms**. Chậm hơn nữa thì endpoint login dễ thành điểm nghẽn và thành cửa ngõ cho DoS.

Phải tăng dần vì phần cứng của kẻ tấn công mỗi năm một mạnh, trong khi hash cũ nằm im trong DB với cost cũ. Cứ vài năm nên nâng một nấc, và nâng **transparent**: lúc user login thành công, bạn đã có password plaintext trong tay, cứ re-hash bằng cost mới rồi ghi đè.

</details>

**9. So sánh `bcrypt`, `scrypt`, `Argon2id`, `PBKDF2`. "Memory-hard" nghĩa là gì và nó vô hiệu hoá loại phần cứng tấn công nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| Thuật toán | Khuyến nghị | Đặc điểm |
|---|---|---|
| **Argon2id** | Tốt nhất hiện nay | Thắng Password Hashing Competition, chỉnh được cả memory lẫn time |
| **bcrypt** | Có | Đã chinh chiến 25+ năm, thư viện có ở mọi ngôn ngữ |
| **scrypt** | Được | Memory-hard, ít phổ biến hơn |
| **PBKDF2** | Tạm chấp nhận | Chuẩn NIST, dùng khi bị ràng buộc compliance/FIPS |
| **MD5, SHA-256** | **Không** | Quá nhanh |

**Memory-hard** nghĩa là thuật toán cố tình đòi một lượng RAM lớn cho mỗi lần tính hash (ví dụ 19 MB). CPU thường thì thoải mái, nhưng kẻ tấn công muốn chạy song song hàng nghìn phép tính lại phải nhân số RAM đó lên — và RAM thì đắt, khó nhồi vào chip.

Nó vô hiệu hoá chính **GPU, FPGA và ASIC**: sức mạnh của các phần cứng này nằm ở hàng nghìn lõi tính toán nhỏ dùng chung bộ nhớ ít ỏi. `PBKDF2` chỉ tốn CPU nên bị GPU bẻ rất hiệu quả; `bcrypt` cần khoảng 4 KB nên kháng GPU ở mức vừa; `Argon2id`/`scrypt` kháng mạnh nhất.

</details>

**10. Bạn muốn nâng cost cho toàn bộ user cũ nhưng không biết password của họ — làm cách nào để migrate mà user không phải đổi mật khẩu?**

<details className="qa">
<summary>Xem đáp án</summary>

Bạn không thể re-hash hàng loạt vì trong DB chỉ có hash, không có password. Cách chuẩn là **re-hash lazy lúc login** — thời điểm duy nhất bạn cầm được plaintext:

```ts
const valid = await bcrypt.compare(input, user.passwordHash);
if (!valid) throw new Error("Sai mật khẩu");

// Hash cũ yếu hơn chuẩn hiện tại → nâng cấp ngay, user không hay biết
if (bcrypt.getRounds(user.passwordHash) < 12) {
  const newHash = await bcrypt.hash(input, 12);
  await db.user.update(user.id, { passwordHash: newHash });
}
```

Cách này chạy được vì mỗi chuỗi hash tự mang cost của nó, nên hash cũ và mới sống chung thoải mái.

Cách này cũng dùng được khi **đổi hẳn thuật toán** (bcrypt sang Argon2id): lưu thêm cột đánh dấu thuật toán, verify theo thuật toán cũ rồi ghi lại bằng thuật toán mới.

Phần còn lại là những account không bao giờ login nữa. Sau vài tháng, thống kê xem còn bao nhiêu hash cũ; với nhóm tồn đọng thì gửi email mời đổi mật khẩu, hoặc force reset nếu thuật toán cũ thực sự nguy hiểm.

</details>

**11. `Timing attack` là gì? Vì sao mọi thao tác so sánh password/token/HMAC phải `constant-time`?**

<details className="qa">
<summary>Xem đáp án</summary>

`Timing attack` khai thác chỗ **thời gian phản hồi tiết lộ thông tin**. So sánh chuỗi thông thường dừng ngay tại byte đầu tiên khác nhau, nên đoán đúng ký tự đầu sẽ chậm hơn đoán sai một chút xíu. Kẻ tấn công gửi hàng nghìn request, đo thống kê và dò dần từng ký tự — biến bài toán mũ thành bài toán tuyến tính.

```ts
// SAI — thoát sớm, thời gian phụ thuộc vào số ký tự khớp
if (input === storedToken) { ... }

// ĐÚNG — luôn duyệt hết, thời gian không đổi
crypto.timingSafeEqual(Buffer.from(input), Buffer.from(storedToken));

// bcrypt.compare cũng đã constant-time sẵn
await bcrypt.compare(input, user.passwordHash);
```

`constant-time` nghĩa là thời gian chỉ phụ thuộc độ dài, không phụ thuộc nội dung — thường cài bằng cách XOR toàn bộ byte rồi OR kết quả lại.

Áp dụng cho mọi thứ bí mật đem đi so sánh: password, session token, API key, chữ ký HMAC của webhook, mã OTP. Lưu ý `timingSafeEqual` ném lỗi nếu hai buffer khác độ dài, nên hãy hash cả hai về cùng độ dài trước khi so.

</details>

**12. Khi nào dùng `HMAC` thay vì hash thường? Verify chữ ký webhook của Stripe/GitHub hoạt động ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Hash thường chỉ chứng minh **toàn vẹn**: ai cũng tính được nên ai cũng sửa nội dung rồi tính lại hash mới. `HMAC` thêm một **secret key** vào công thức, nên nó chứng minh cả toàn vẹn lẫn **nguồn gốc** — chỉ người biết key mới tạo được chữ ký hợp lệ.

Dùng HMAC khi dữ liệu đi qua kênh không tin cậy và bạn cần biết ai gửi: webhook, signed URL, signed cookie, JWT với thuật toán `HS256`.

Luồng verify webhook:

```ts
const expected = crypto
  .createHmac("sha256", process.env.WEBHOOK_SECRET)
  .update(rawBody)          // body thô, chưa qua JSON.parse
  .digest("hex");

const ok = crypto.timingSafeEqual(
  Buffer.from(expected),
  Buffer.from(signatureFromHeader),
);
```

Ba chỗ hay sai: dùng body đã parse rồi serialize lại (thừa/thiếu khoảng trắng là sai chữ ký), so sánh bằng `===` thay vì constant-time, và quên kiểm timestamp trong header — thiếu bước này thì kẻ tấn công phát lại đúng request cũ (replay attack) vẫn qua.

</details>

**13. `MD5` và `SHA-1` bị coi là "broken" nghĩa là gì cụ thể? Chúng còn dùng được cho việc gì?**

<details className="qa">
<summary>Xem đáp án</summary>

"Broken" ở đây nói về **collision resistance**, không phải về tính one-way. Người ta đã tạo được hai file khác nhau cho ra cùng một hash: `MD5` gãy từ những năm 2000 và giờ tạo collision chỉ tốn vài giây, `SHA-1` bị phá bằng tấn công SHAttered năm 2017 với hai file PDF cùng hash.

Hậu quả thực tế: không được dùng chúng ở chỗ nào mà kẻ tấn công **kiểm soát được nội dung** — chữ ký số, certificate, verify bản cài đặt tải về, content addressing chống giả mạo. Kẻ tấn công chuẩn bị sẵn một file sạch để bạn ký và một file độc cùng hash.

Chúng vẫn còn chỗ dùng ở những việc **không mang tính bảo mật**:

- Checksum phát hiện lỗi truyền/lưu trữ ngẫu nhiên.
- Khoá cache, dedupe file, chia shard.
- Etag, fingerprint nội bộ.
- `SHA-1` trong Git vì lý do lịch sử (Git đã thêm lớp phát hiện collision).

Mặc định cho việc mới: `SHA-256`, hoặc Blake2/Blake3 nếu cần nhanh.

</details>

**14. HTTPS khác HTTP ở điểm nào? Mô tả `TLS handshake`: hai bên trao đổi những gì và khoá phiên được sinh ra thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

HTTPS chính là HTTP chạy bên trên TLS. Nó thêm ba bảo đảm mà HTTP trần không có: **bí mật** (nghe lén không đọc được), **toàn vẹn** (sửa gói tin giữa đường sẽ bị phát hiện) và **xác thực** (bạn chắc đang nói chuyện đúng server).

Handshake rút gọn như bài mô tả:

```
1. Client: ClientHello (danh sách cipher suite, random)
2. Server: ServerHello + certificate + random
3. Client verify cert chain tới CA gốc
4. Key exchange (ECDHE) → derive shared secret
5. Traffic mã hoá bằng AES-GCM
```

Điểm hay nhất nằm ở bước 4: khoá phiên **không hề được gửi qua mạng**. Hai bên mỗi người sinh một cặp khoá tạm, chỉ trao đổi phần public, rồi mỗi bên tự tính ra cùng một secret chung — kẻ nghe lén thấy đủ mọi thứ bay qua vẫn không tính ra được. Secret đó trộn với hai giá trị random rồi dẫn xuất thành khoá đối xứng cho phiên.

Bài ví như hai bên cùng nghĩ ra một ổ khóa chung. Handshake tốn công một lần, sau đó dùng mã hoá đối xứng nên nhanh gần như HTTP thường.

</details>

**15. Chứng chỉ do `CA` cấp giải quyết vấn đề gì? Trình duyệt verify `certificate chain` theo trình tự nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Vấn đề: mã hoá thôi chưa đủ. Nếu bạn bắt tay với kẻ đứng giữa mà không biết, mọi thứ vẫn được mã hoá — chỉ là mã hoá với **nhầm người** (man-in-the-middle). Certificate giải bài toán "làm sao tin server đúng là chủ của domain này", bằng cách nhờ một bên thứ ba mà cả hai cùng tin: **CA** — đúng như hình ảnh văn phòng công chứng trong bài.

Trình duyệt verify theo trình tự:

1. Cert này có đúng cho domain đang truy cập không (kiểm trường SAN, không phải CN nữa).
2. Còn hạn không — kiểm `notBefore` / `notAfter`.
3. Chữ ký của cert có khớp với public key của **intermediate CA** cấp nó không.
4. Lặp lên trên theo chuỗi cho tới khi chạm một **root CA** nằm trong trust store của hệ điều hành/trình duyệt.
5. Kiểm cert có bị thu hồi chưa (OCSP stapling / CRL).

Chỉ cần một mắt xích gãy là báo lỗi. Đó cũng là lý do cert self-signed bị cảnh báo: không có mắt xích nào dẫn về root được tin sẵn. Lỗi triển khai thường gặp nhất là **quên gửi kèm intermediate cert**, khiến chuỗi đứt giữa chừng.

</details>

**16. `TLS 1.3` cải thiện gì so với `TLS 1.2` (số round-trip, những cipher suite bị loại bỏ)?**

<details className="qa">
<summary>Xem đáp án</summary>

| | TLS 1.2 | TLS 1.3 |
|---|---|---|
| Handshake | 2 round-trip | **1 round-trip** |
| Kết nối lại | Session resumption 1-RTT | **0-RTT** (có điều kiện) |
| Cipher suite | Hàng trăm tổ hợp, nhiều cái yếu | 5 tổ hợp, chỉ AEAD |
| Forward secrecy | Tuỳ chọn | **Bắt buộc** |

TLS 1.3 dọn sạch những thứ đã gây ra hàng loạt lỗ hổng: RSA key exchange (không có forward secrecy), static Diffie-Hellman, chế độ CBC, RC4, 3DES, MD5/SHA-1 làm chữ ký, nén TLS, và renegotiation. Chỉ còn AEAD như AES-GCM và ChaCha20-Poly1305.

Nhanh hơn vì client **đoán trước** tham số key exchange và gửi ngay trong ClientHello thay vì chờ thoả thuận xong mới trao đổi khoá. Bớt một vòng đi-về là bớt vài chục tới vài trăm ms cho mỗi kết nối mới — rất đáng kể trên mạng di động.

Lưu ý về 0-RTT: dữ liệu gửi trong 0-RTT có thể bị replay, nên chỉ dùng cho request idempotent, không dùng cho POST thay đổi dữ liệu.

Khuyến nghị của bài: tối thiểu TLS 1.2, ưu tiên 1.3.

</details>

**17. `Forward secrecy` là gì? `ECDHE` mang lại điều đó bằng cách nào, và vì sao key exchange kiểu RSA cũ thì không?**

<details className="qa">
<summary>Xem đáp án</summary>

`Forward secrecy` (PFS): kẻ tấn công ghi lại toàn bộ traffic mã hoá hôm nay, mai mốt lấy được private key của server thì **vẫn không giải mã được** những phiên đã ghi. Mỗi phiên có khoá riêng, lộ khoá dài hạn không kéo theo lộ lịch sử.

Với **RSA key exchange kiểu cũ**, client tự sinh pre-master secret rồi mã hoá bằng public key trong certificate và gửi đi. Nghĩa là secret của phiên *nằm ngay trong gói tin đã ghi lại*, chỉ khoá bởi private key dài hạn của server. Ai có private key đó — hacker, hay toà án yêu cầu — giải mã được mọi phiên từ trước tới nay. Đây chính là kịch bản "harvest now, decrypt later".

Với **ECDHE**, mỗi phiên hai bên sinh một cặp khoá elliptic curve **tạm thời** (chữ E cuối là ephemeral), chỉ trao đổi phần public rồi mỗi bên tự tính ra shared secret. Private key của server chỉ dùng để **ký** vào phần trao đổi đó nhằm chống MITM, chứ không tham gia tạo khoá phiên. Khoá tạm bị xoá khi phiên kết thúc, nên không còn gì để giải mã ngược.

TLS 1.3 vì vậy bỏ hẳn RSA key exchange, chỉ giữ ECDHE.

</details>

**18. `HSTS` chặn được tấn công nào? `preload` list dùng làm gì và rủi ro khi lỡ bật là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

HSTS bảo trình duyệt: từ nay tới hết `max-age`, với domain này **chỉ được đi HTTPS**, gõ `http://` cũng tự đổi, và gặp lỗi certificate thì chặn thẳng chứ không cho bấm "tôi vẫn vào".

Nó chặn **SSL stripping / downgrade attack**: người dùng gõ `example.com` thì request đầu tiên đi bằng HTTP, kẻ ngồi cùng WiFi chặn ngay redirect đó và giữ nạn nhân ở HTTP suốt phiên.

Nhưng HSTS có lỗ hổng "lần đầu": trình duyệt chưa từng vào site thì chưa có header, nên vẫn dính đúng phát đầu tiên. `preload` list vá chỗ đó — danh sách domain được nhúng sẵn trong bản build của Chrome, Firefox, Safari, nên trình duyệt biết phải dùng HTTPS ngay cả trước lần truy cập đầu.

Rủi ro: vào list thì dễ, **ra thì rất lâu** — phải đăng ký gỡ rồi chờ nhiều tháng cho các bản trình duyệt mới lan ra. Nếu có subdomain nội bộ chưa có cert mà bạn lỡ bật `includeSubDomains; preload`, các subdomain đó chết cứng. Cách an toàn: bắt đầu `max-age` nhỏ, xác nhận mọi subdomain đều chạy HTTPS, rồi mới nâng lên một năm và đăng ký preload.

</details>

**19. Đội bạn dùng cert Let's Encrypt hạn 90 ngày. Bạn thiết kế quy trình renew và cảnh báo hết hạn ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên tắc: **renew phải tự động**, việc của con người chỉ là nhận cảnh báo khi tự động hỏng.

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d example.com -d www.example.com
# Certbot tự cài timer renew; kiểm thử trước khi tin
sudo certbot renew --dry-run
```

Thiết kế đầy đủ:

- **Renew sớm** — chạy thử hai lần mỗi ngày, certbot chỉ thực sự gia hạn khi cert còn dưới 30 ngày. Còn nguyên một tháng để xử lý nếu có trục trặc.
- **Reload service sau renew** — dùng `--deploy-hook` để `nginx -s reload`. Lỗi kinh điển là cert đã mới nhưng process vẫn giữ cert cũ trong bộ nhớ.
- **Giám sát từ ngoài** — một job độc lập mở TLS tới domain thật, đọc ngày hết hạn, cảnh báo ở mốc 21 và 7 ngày. Phải đo từ bên ngoài vì nó bắt được cả trường hợp file mới mà server chưa nạp.
- **Cảnh báo cả khi renew fail** — job renew im lặng cũng là một dạng hỏng.
- **Kiểm luôn wildcard/DNS challenge** nếu có, vì nó phụ thuộc API của nhà cung cấp DNS.

Cách rẻ nhất là đẩy TLS ra tầng trước: Cloudflare hoặc AWS ACM lo hết phần gia hạn.

</details>

**20. `Same-origin policy` định nghĩa "origin" bằng những thành phần nào? `https://app.com` và `https://api.app.com` có cùng origin không?**

<details className="qa">
<summary>Xem đáp án</summary>

Origin gồm **ba thành phần**, phải khớp cả ba: **protocol + host + port**.

`https://app.com` và `https://api.app.com` **không cùng origin** — host khác nhau, dù chung domain gốc. Bài nói rõ: subdomain khác là origin khác.

Vài cặp khác để đối chiếu với `https://app.com`:

| URL | Cùng origin? | Vì sao |
|---|---|---|
| `https://app.com/users` | Có | Path không tính vào origin |
| `http://app.com` | Không | Khác protocol |
| `https://app.com:8443` | Không | Khác port |
| `https://api.app.com` | Không | Khác host |

Lưu ý dễ nhầm: cookie **không** theo luật này — cookie tính theo domain và path, nên cookie đặt cho `.app.com` vẫn gửi sang `api.app.com` dù hai bên khác origin. Vì vậy same-origin policy và phạm vi cookie là hai chuyện tách biệt, và đó là lý do vẫn cần chống CSRF dù đã có CORS.

</details>

**21. `CORS` bảo vệ ai? Vì sao nói CORS không phải cơ chế bảo mật phía server — gọi bằng `curl`/Postman thì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

CORS bảo vệ **người dùng của bạn**, không bảo vệ API của bạn. Nó ngăn một trang độc hại mà nạn nhân lỡ mở dùng phiên đăng nhập sẵn của họ để gọi API của bạn rồi **đọc kết quả**.

Điểm mấu chốt: **chỉ trình duyệt thi hành CORS**. Bài ví nó như ông bảo vệ đứng ở phía trình duyệt chứ không phải phía server. Request vẫn được gửi đi và server vẫn xử lý bình thường; trình duyệt chỉ chặn *đoạn JavaScript của trang kia đọc response* khi thiếu header cho phép.

Gọi bằng `curl` hay Postman thì không có ai hỏi han gì cả — chúng không phải trình duyệt, không có khái niệm origin, không quan tâm header `Access-Control-Allow-Origin`. Response trả về đầy đủ.

Hệ quả thực tế:

- Đừng bao giờ coi CORS là lớp phân quyền. Server vẫn phải verify token và kiểm quyền trên từng request.
- CORS chặt cũng không giấu được endpoint khỏi kẻ tấn công.
- Và CORS **không** chống CSRF, vì request ghi vẫn đi tới server dù response bị chặn.

</details>

**22. Khi nào browser gửi `preflight OPTIONS`? Thế nào là một "simple request" không cần preflight? `Access-Control-Max-Age` giúp gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Bài ví preflight như cú điện thoại hỏi kho trước khi chở hàng tới. Trình duyệt gửi `OPTIONS` trước để hỏi server có chấp nhận method và header sắp dùng không.

**Simple request** — không cần preflight khi thoả đủ:

- Method là `GET`, `HEAD` hoặc `POST`.
- `Content-Type` thuộc `application/x-www-form-urlencoded`, `multipart/form-data` hoặc `text/plain`.
- Không có header tuỳ chỉnh (`Authorization`, `X-Api-Key`... đều làm mất tư cách simple).

Nghĩa là đa số API thật đều cần preflight: chỉ riêng `Content-Type: application/json` là đã đủ kích hoạt.

```
OPTIONS /api/users
Origin: https://app.example.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type
```

Server trả OK thì trình duyệt mới gửi POST thật.

`Access-Control-Max-Age: 86400` bảo trình duyệt **cache kết quả preflight** trong một ngày, khỏi hỏi lại cho mỗi request — tránh nhân đôi số round-trip. Lưu ý các trình duyệt có trần riêng (Chrome giới hạn khoảng 2 giờ), nên đặt số lớn hơn cũng bị cắt.

</details>

**23. Vì sao `Access-Control-Allow-Origin: *` không đi chung được với `Access-Control-Allow-Credentials: true`?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì tổ hợp đó sẽ biến mọi API có đăng nhập thành API công khai cho bất kỳ website nào. `*` nghĩa là "origin nào cũng được", `credentials: true` nghĩa là "cứ kèm cookie và header `Authorization` của user". Ghép lại: một trang độc hại bất kỳ gọi API của bạn bằng phiên đăng nhập của nạn nhân và **đọc được response**. Đúng nghĩa CSRF có kèm khả năng đọc dữ liệu.

Nên chuẩn CORS cấm thẳng: khi request có credentials, trình duyệt **từ chối** response nào có `Access-Control-Allow-Origin: *`, bắt buộc phải echo lại đúng một origin cụ thể.

```ts
// SAI — browser reject
app.use(cors({ origin: "*", credentials: true }));

// ĐÚNG — whitelist rồi echo đúng origin đang gọi
const allowed = ["https://app.example.com", "https://admin.example.com"];
app.use(cors({
  origin: (origin, cb) =>
    !origin || allowed.includes(origin)
      ? cb(null, true)
      : cb(new Error("Not allowed by CORS")),
  credentials: true,
}));
```

Nhớ thêm `Vary: Origin` khi echo động, nếu không CDN có thể cache nhầm header của origin này cho origin khác.

</details>

**24. Server reflect thẳng header `Origin` của request vào `Access-Control-Allow-Origin` — cách này sai ở đâu và bị khai thác thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Reflect vô điều kiện tương đương với `*` nhưng còn tệ hơn, vì nó **vượt được cả ràng buộc credentials**:

```ts
// RẤT SAI
res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
res.setHeader("Access-Control-Allow-Credentials", "true");
```

Khai thác: kẻ tấn công dựng `https://evil.com`, dụ nạn nhân đang đăng nhập mở trang đó. JavaScript trên trang gọi `fetch` tới API của bạn kèm cookie. Server thấy `Origin: https://evil.com` và phản chiếu lại y nguyên, trình duyệt tưởng bạn cho phép, thế là `evil.com` đọc trọn dữ liệu riêng tư của nạn nhân.

Biến thể tinh vi của cùng lỗi này là whitelist kiểm bằng so chuỗi lỏng lẻo:

- `origin.endsWith("example.com")` → `evil-example.com` lọt.
- `origin.includes("example.com")` → `example.com.evil.com` lọt.
- Quên chuẩn hoá protocol → `http://app.example.com` lọt.

Cách đúng là **so khớp chính xác** với một danh sách cố định, như pattern `allowed.includes(origin)` trong bài, và luôn kèm `Vary: Origin`.

</details>

**25. Frontend báo lỗi CORS khi gọi API. Bạn debug theo trình tự nào để biết lỗi ở preflight, ở header thiếu, hay thực ra là lỗi 500 của server?**

<details className="qa">
<summary>Xem đáp án</summary>

Trình tự thực dụng:

1. **Mở tab Network, tìm request `OPTIONS`.** Có `OPTIONS` và nó fail thì lỗi ở preflight; không có `OPTIONS` mà request thật vẫn đỏ thì lỗi ở header của response chính.
2. **Đọc status của request thật.** Trình duyệt hay che lỗi server thành "CORS error", vì response 500 do exception thường đi ra ngoài middleware CORS nên mất luôn header. Thấy 500 thì đó là bug server, không phải chuyện CORS.
3. **Gọi lại bằng `curl` kèm `-H "Origin: https://app.example.com" -i`** và xem server trả về header gì. `curl` không thi hành CORS nên phân tách rõ hai chuyện: server có chạy không, và server có gửi đúng header không.
4. **Đối chiếu từng header** — `Access-Control-Allow-Origin` khớp chính xác origin (không thừa dấu `/`), `Allow-Methods` có method đang dùng, `Allow-Headers` có `Content-Type` và `Authorization`.
5. **Kiểm `credentials`** — nếu frontend gửi cookie mà server trả `*` thì trình duyệt sẽ reject.
6. **Kiểm thứ tự middleware và tầng proxy** — middleware CORS phải đăng ký trước route, và Nginx/CDN ở trước có thể nuốt hoặc ghi đè header.

</details>

**26. `CSP` chặn `XSS` bằng cơ chế nào? So sánh `nonce`, `hash` và `'unsafe-inline'`.**

<details className="qa">
<summary>Xem đáp án</summary>

CSP là danh sách khách mời đưa cho trình duyệt: script chỉ được chạy nếu **nguồn của nó nằm trong allowlist**. Kẻ tấn công có chèn được thẻ script vào HTML thì trình duyệt cũng từ chối thực thi — tức CSP không ngăn việc chèn, nó ngăn việc chèn đó có tác dụng. Đây là lớp phòng thủ thứ hai, không thay thế việc escape output.

| Cách cho phép inline script | Mức an toàn | Ghi chú |
|---|---|---|
| `nonce` | Tốt | Mã ngẫu nhiên sinh mới **mỗi request**, phải khớp giữa header và thẻ script |
| `hash` | Tốt | Băm nội dung script; hợp với script tĩnh không đổi, đổi một ký tự là phải tính lại |
| `'unsafe-inline'` | Tệ | Cho phép mọi inline script, xoá sạch tác dụng chống XSS của CSP |

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-abc123';
  frame-ancestors 'none';
```

Nonce **bắt buộc phải ngẫu nhiên theo từng request** — nonce cố định thì kẻ tấn công đọc HTML là biết và dùng lại được. Cũng nên tránh `'unsafe-eval'`, và cẩn thận với `'unsafe-inline'` ở `style-src` vì nó vẫn cho phép vài kiểu tấn công rò rỉ dữ liệu.

</details>

**27. Vì sao nên chạy `Content-Security-Policy-Report-Only` một thời gian trước khi enforce? Quy trình siết CSP dần gồm những bước nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì CSP siết quá tay thì **khách quen cũng bị chặn**: analytics, widget chat, font bên ngoài, script của bộ phận marketing gắn qua tag manager, ảnh từ CDN. Enforce ngay là nguy cơ vỡ trang trên production mà có khi chỉ một nhóm người dùng gặp. `Report-Only` cho bạn thấy trước đúng những gì *sẽ* bị chặn mà không chặn thật.

Quy trình bốn bước như bài hướng dẫn:

1. **Bắt đầu lỏng** — `default-src 'self' 'unsafe-inline'`, đủ để không vỡ gì.
2. **Bật Report-Only vài tuần** và thu thập violation qua endpoint báo cáo.

```
Content-Security-Policy-Report-Only: <policy>
Report-To: { "group": "csp", "endpoints": [{ "url": "/csp-report" }] }
```

3. **Siết dần** — phân loại báo cáo, bỏ `'unsafe-inline'`, thêm nonce cho inline script còn lại, đưa domain thật sự cần vào allowlist.
4. **Enforce** khi luồng báo cáo đã sạch false positive, và giữ endpoint báo cáo chạy tiếp để theo dõi.

Lưu ý: nhiều violation đến từ extension của trình duyệt chứ không phải site của bạn, nên đừng vội nới policy theo mọi báo cáo.

</details>

**28. `frame-ancestors` khác `X-Frame-Options` thế nào và chặn được loại tấn công gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Cả hai cùng chống **clickjacking**: kẻ tấn công nhúng site của bạn vào một iframe trong suốt, đặt lên trên giao diện mồi, người dùng tưởng đang bấm nút của trang kia nhưng thực ra bấm vào nút "Chuyển tiền" hay "Cấp quyền" trên site bạn.

| | `X-Frame-Options` | `frame-ancestors` |
|---|---|---|
| Thuộc về | Header riêng, chuẩn cũ | Directive của CSP, chuẩn hiện hành |
| Giá trị | `DENY`, `SAMEORIGIN` | Danh sách origin, hỗ trợ wildcard |
| Nhiều domain cha | Không làm được | Liệt kê thoải mái |
| Ưu tiên | Bị bỏ qua nếu có `frame-ancestors` | Thắng khi cả hai cùng có mặt |

```
Content-Security-Policy: frame-ancestors 'none';
X-Frame-Options: DENY
```

Thực tế nên đặt cả hai: `frame-ancestors` cho trình duyệt hiện đại, `X-Frame-Options` để phòng client cũ. Nếu có đối tác thật sự cần nhúng, dùng `frame-ancestors https://partner.example.com` thay vì mở toang. Lưu ý `X-Frame-Options: ALLOW-FROM` đã bị khai tử, nên nhu cầu nhiều domain bắt buộc phải dùng `frame-ancestors`.

</details>

**29. Ngoài CSP và HSTS, bạn còn bật những security header nào ở production và mỗi cái chống gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Bộ header thường dùng:

- `X-Content-Type-Options: nosniff` — cấm trình duyệt tự đoán kiểu nội dung. Chặn kiểu tấn công upload file "ảnh" nhưng chứa HTML/JS rồi được thực thi.
- `Referrer-Policy: strict-origin-when-cross-origin` — không rò URL đầy đủ (kèm token, id) sang site khác qua header `Referer`.
- `Permissions-Policy` — tắt sẵn camera, micro, geolocation, thanh toán nếu site không dùng, giới hạn cả iframe con.
- `X-Frame-Options: DENY` — chống clickjacking cho client cũ, đi kèm `frame-ancestors`.
- `Cross-Origin-Opener-Policy` và `Cross-Origin-Resource-Policy` — cô lập trang khỏi cửa sổ khác và chặn site lạ nhúng tài nguyên của bạn.
- `Cache-Control: no-store` cho response chứa dữ liệu nhạy cảm.

Kèm theo là cấu hình cookie: `HttpOnly`, `Secure`, `SameSite=Lax` hoặc `Strict`.

Cách làm gọn nhất là dùng thư viện như `helmet` cho Express, hoặc đặt ở tầng Nginx/CDN để áp cho toàn bộ ứng dụng, rồi kiểm lại bằng công cụ chấm điểm header trực tuyến.

</details>

---

## 2. Application Security: SQL Injection, XSS, CSRF

Bài học: [2. Application Security: SQL Injection, XSS, CSRF](../../backend/06-security/2_application-security.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. `OWASP Top 10` là gì và dùng để làm gì? Vì sao `Broken Access Control` đứng đầu bảng?**

<details className="qa">
<summary>Xem đáp án</summary>

`OWASP Top 10` là danh sách mười nhóm rủi ro bảo mật web phổ biến và nghiêm trọng nhất, do tổ chức phi lợi nhuận OWASP tổng hợp từ dữ liệu thực tế và cập nhật vài năm một lần. Nó không phải tiêu chuẩn tuân thủ mà là **danh sách ưu tiên**: dùng làm checklist review code, làm khung đào tạo cho đội, và làm cơ sở cho kiểm thử trước khi deploy.

Bản 2021 xếp `Broken Access Control` đứng đầu, với con số đáng chú ý là 94% ứng dụng được kiểm có dạng lỗi này. Lý do nó phổ biến:

- Phân quyền là logic **riêng của từng nghiệp vụ**, không có thư viện nào làm hộ như cách ORM làm hộ chuyện SQL injection.
- Mỗi endpoint mới là một cơ hội quên kiểm, và số endpoint thì tăng liên tục.
- Lỗi rất khó phát hiện bằng công cụ tự động, vì request vẫn hợp lệ về cú pháp — chỉ là sai người.
- Hậu quả trực tiếp: đổi một con số trên URL là đọc được dữ liệu người khác (IDOR).

</details>

**2. Giải thích `SQL Injection` bằng một ví dụ cụ thể. Vì sao việc ghép chuỗi input vào câu SQL lại nguy hiểm đến vậy?**

<details className="qa">
<summary>Xem đáp án</summary>

SQL Injection xảy ra khi dữ liệu người dùng được ghép thẳng vào câu SQL, khiến database **hiểu dữ liệu đó thành lệnh**:

```js
const id = req.query.id;
db.execute(`SELECT * FROM users WHERE id = ${id}`);

// User gửi: id=1; DROP TABLE users; --
// Câu chạy thật: SELECT * FROM users WHERE id = 1; DROP TABLE users; --
```

Bài ví như tờ giấy rút tiền để chỗ trống: khách điền thêm cả một mệnh lệnh, mà nhân viên lại đọc cả tờ như một câu liền mạch.

Nguy hiểm vì ranh giới giữa **code và data bị xoá**. Database không có cách nào biết đoạn nào là câu lệnh do lập trình viên viết, đoạn nào là chuỗi do người lạ gửi lên. Từ một lỗ nhỏ, kẻ tấn công có thể đọc toàn bộ bảng bằng `UNION SELECT`, bỏ qua đăng nhập bằng một mệnh đề luôn đúng, sửa hoặc xoá dữ liệu, thậm chí đọc file và chạy lệnh hệ thống nếu DB user có quyền cao.

</details>

**3. `Parameterized query` chặn SQL injection bằng cơ chế nào? Nó khác việc "escape ký tự đặc biệt" ở chỗ nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Parameterized query gửi **câu lệnh và dữ liệu đi riêng**. Driver gửi trước phần khung có placeholder, database phân tích và lập kế hoạch thực thi cho khung đó; sau đó giá trị mới được gửi tới và gắn vào như **một giá trị đơn thuần**, không bao giờ được parse lại thành SQL.

```js
await db.query("SELECT * FROM users WHERE id = $1", [req.query.id]);
```

Người dùng có gửi `1; DROP TABLE users; --` thì cả chuỗi đó chỉ được so sánh như một giá trị của cột `id` — đúng như hình ảnh tờ giấy có ô vuông riêng trong bài.

Khác với escape ở chỗ căn bản:

| | Escape thủ công | Parameterized |
|---|---|---|
| Nguyên lý | Vẫn ghép chuỗi, chỉ thêm dấu thoát | Không ghép, tách hẳn code và data |
| Rủi ro | Sót một ký tự, sai charset, sai context là thủng | Không có ranh giới để phá |
| Ai chịu trách nhiệm | Lập trình viên nhớ đúng mọi trường hợp | Driver và database |

Escape là vá triệu chứng, parameterize là loại bỏ nguyên nhân.

</details>

**4. Dùng ORM thì có miễn nhiễm SQL injection không? Chỉ ra những chỗ ORM vẫn dính.**

<details className="qa">
<summary>Xem đáp án</summary>

Không miễn nhiễm. ORM hiện đại như Prisma hay Drizzle **tự parameterize** cho các truy vấn thông thường, nên phần lớn code an toàn mặc định — nhưng vẫn còn những lối thoát hiểm:

```ts
// Vulnerable — interpolate vào raw query
await prisma.$queryRawUnsafe(`SELECT * FROM users WHERE id = ${id}`);

// An toàn — template tag, Prisma tự tách tham số
await prisma.$queryRaw`SELECT * FROM users WHERE id = ${id}`;
```

Những chỗ hay dính:

- **Raw query** — `$queryRawUnsafe`, `sequelize.query`, `db.execute` với chuỗi ghép.
- **Tên cột, tên bảng, hướng sắp xếp động** — không parameterize được, buộc phải whitelist.
- **Fragment SQL thô** nhét vào mệnh đề `where`, `having`, hoặc hàm `sql.raw`.
- **`LIMIT` / `OFFSET`** nhận thẳng query param ở một số driver cũ.
- **NoSQL injection** ở tầng ODM khi nhận nguyên object từ `req.body`.

Nguyên tắc: hễ thấy dấu ghép chuỗi hoặc chữ `raw`/`unsafe` trong tên hàm thì đó là chỗ cần soi kỹ.

</details>

**5. Tên cột / tên bảng động (ví dụ `ORDER BY` theo query param) không parameterize được — bạn xử lý thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Placeholder chỉ thay được **giá trị**, không thay được định danh, vì database phải biết tên cột ngay lúc lập kế hoạch truy vấn. Cách duy nhất an toàn là **whitelist**: không lọc cái xấu, mà chỉ chấp nhận đúng những giá trị đã biết trước.

```js
const ALLOWED_SORT = ["name", "email", "created_at"];
const ALLOWED_DIR = ["ASC", "DESC"];

const sort = ALLOWED_SORT.includes(req.query.sort) ? req.query.sort : "created_at";
const dir = ALLOWED_DIR.includes(req.query.dir?.toUpperCase()) ? req.query.dir : "ASC";

db.query(`SELECT * FROM users ORDER BY ${sort} ${dir}`);
```

Vài lưu ý khi làm thật:

- Nên **map** từ khoá do client gửi sang tên cột thật, thay vì để client biết trực tiếp tên cột trong DB.
- Có giá trị mặc định an toàn khi input không hợp lệ, hoặc trả lỗi 400 — đừng ném luôn chuỗi lạ vào SQL.
- Đừng thay whitelist bằng regex kiểu "chỉ cho chữ và gạch dưới"; nó chặn được cú pháp nhưng vẫn cho phép sắp xếp theo cột nhạy cảm.
- Nếu ORM có API xây dựng định danh an toàn, ưu tiên dùng API đó.

</details>

**6. `Blind SQL injection` là gì? Attacker moi dữ liệu ra sao khi ứng dụng không in kết quả hay lỗi ra màn hình?**

<details className="qa">
<summary>Xem đáp án</summary>

`Blind SQL injection` là khi lỗ hổng vẫn tồn tại nhưng ứng dụng **không trả kết quả truy vấn hay thông báo lỗi** ra cho kẻ tấn công. Không đọc được dữ liệu trực tiếp, họ chuyển sang hỏi database từng câu đúng/sai và quan sát phản ứng.

Hai kỹ thuật chính:

- **Boolean-based** — chèn điều kiện rồi so sánh phản hồi. Trang trả về bình thường nghĩa là điều kiện đúng, trả về trống nghĩa là sai. Hỏi kiểu "ký tự đầu của mật khẩu admin có lớn hơn `m` không" rồi tìm nhị phân, mỗi ký tự chỉ tốn vài request.
- **Time-based** — khi phản hồi không khác gì nhau, chèn hàm làm database ngủ và đo thời gian đáp. Chậm 5 giây nghĩa là điều kiện đúng.

Còn biến thể **out-of-band**: ép database tự gửi một truy vấn DNS hoặc HTTP mang theo dữ liệu tới máy chủ của kẻ tấn công.

Bài học: **giấu lỗi không phải là bản vá**. Không hiện lỗi SQL ra client là điều nên làm, nhưng lỗ hổng vẫn bị khai thác trọn vẹn, chỉ chậm hơn. Cách chữa vẫn là parameterized query.

</details>

**7. `NoSQL injection` xảy ra thế nào với MongoDB (ví dụ `{"$ne": ""}` ở field password)? Vì sao validate kiểu dữ liệu lại chặn được?**

<details className="qa">
<summary>Xem đáp án</summary>

Ở MongoDB, truy vấn là **object** chứ không phải chuỗi, nên kẻ tấn công không chèn cú pháp mà chèn **toán tử**:

```js
db.users.find({ email: req.body.email, password: req.body.password });

// Client gửi JSON: { "email": "a@b.c", "password": { "$ne": "" } }
// Điều kiện thành: password khác rỗng → luôn đúng → đăng nhập lọt
```

Body parser nhận JSON và dựng ra object lồng nhau, ứng dụng nhét thẳng vào query, thế là `$ne` được MongoDB hiểu như toán tử thật. Các toán tử hay bị lạm dụng khác gồm `$gt`, `$regex` (dò từng ký tự mật khẩu), `$where` (chạy được JS).

Validate kiểu dữ liệu chặn được vì nó khôi phục đúng giả định mà code đang ngầm dựa vào — rằng `password` là một chuỗi:

```ts
const schema = z.object({
  email: z.string().email(),
  password: z.string(),  // object bị reject ngay
});
const { email, password } = schema.parse(req.body);
```

Chỉ cần giá trị không còn là object thì không có cách nào biến nó thành toán tử.

</details>

**8. Ngoài parameterized query, còn tầng phòng thủ nào cho database (least privilege cho DB user, tách read/write, không trả lỗi SQL ra client)?**

<details className="qa">
<summary>Xem đáp án</summary>

Parameterized query là tầng chính, nhưng theo tinh thần **defense in depth** thì vẫn cần các tầng phía sau để giảm thiệt hại nếu tầng đầu thủng:

- **Least privilege** — DB user của ứng dụng chỉ có `SELECT`, `INSERT`, `UPDATE`, `DELETE` trên đúng schema cần thiết. Không `DROP`, không `SUPERUSER`, không quyền đọc file. Injection thành công cũng không wipe được database.
- **Tách read/write** — chức năng chỉ đọc dùng connection tới replica với tài khoản read-only.
- **Không trả lỗi SQL ra client** — thông điệp lỗi chi tiết giúp kẻ tấn công vẽ lại cấu trúc bảng; production chỉ trả mã lỗi chung, chi tiết ghi vào log.
- **Row Level Security** ở PostgreSQL cho ứng dụng multi-tenant.
- **Validate input bằng schema** trước khi chạm tới tầng DB.
- **Giới hạn kết quả trả về** và timeout truy vấn, tránh bị rút cả bảng trong một request.
- **Log và cảnh báo** truy vấn bất thường, kèm rate limit trên endpoint tìm kiếm.
- **Mã hoá cột nhạy cảm** và hash password, để dữ liệu lấy được vẫn ít giá trị.

</details>

**9. `XSS` là gì? Phân biệt `Reflected`, `Stored`, `DOM-based` — loại nào nguy hiểm nhất và vì sao?**

<details className="qa">
<summary>Xem đáp án</summary>

`XSS` là việc chèn được script của kẻ tấn công vào trang, để nó chạy trong trình duyệt của người dùng khác **dưới danh nghĩa website của bạn** — nên trình duyệt tin tưởng và giao cả cookie lẫn session cho nó, đúng như hình ảnh tờ giấy giả dán trên bảng thông báo chung cư.

| Loại | Payload nằm ở đâu | Cách phát tán |
|---|---|---|
| **Reflected** | Trong URL, server echo lại ngay | Phải dụ nạn nhân bấm link |
| **Stored** | Lưu trong database | Tự động hiện với mọi người xem |
| **DOM-based** | Không qua server, do JS client xử lý sai | Qua link hoặc fragment `#` |

**Stored nguy hiểm nhất**: payload nằm sẵn trong nội dung hợp lệ của site, tự lây tới mọi người mở trang mà không cần lừa ai bấm gì. Nếu nó nằm ở trang mà admin hay xem thì kẻ tấn công chiếm được tài khoản quyền cao; vài trường hợp còn lan theo cấp số nhân như sâu.

DOM-based khó phát hiện vì payload có thể nằm sau dấu `#` nên **không bao giờ tới server**, log server sạch bong.

</details>

**10. Vì sao chống XSS phải `escape` ở lúc render output chứ không chỉ lọc lúc nhận input?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì một chuỗi chỉ **nguy hiểm trong một ngữ cảnh cụ thể**, mà lúc nhận input bạn chưa biết nó sẽ được hiển thị ở đâu. Cùng dữ liệu đó có thể đi vào HTML body, vào attribute, vào URL, vào JSON cho app mobile, hay ra file CSV — mỗi nơi cần một cách thoát khác nhau.

Các lý do khác:

- **Dữ liệu vào hệ thống từ nhiều cửa**: import file, job nền, message queue, migration, API nội bộ. Lọc ở một endpoint không phủ hết.
- **Lọc input làm hỏng dữ liệu thật** — người tên "O'Brien", bình luận về toán học có dấu nhỏ hơn, tất cả bị cắt xén không khôi phục lại được.
- **Blacklist luôn thiếu**. Bộ lọc gỡ chữ `script` thì kẻ tấn công dùng `onerror` trên thẻ `img`.
- **Escape lúc render thì luôn đúng thời điểm**: bạn biết chính xác đang render vào đâu.

Nguyên tắc thực hành: **lưu dữ liệu thô, escape khi xuất**. Validate input vẫn cần, nhưng để đảm bảo dữ liệu đúng nghiệp vụ, không phải để chống XSS.

</details>

**11. Escape trong HTML body, trong attribute, trong URL và trong JS context khác nhau ra sao? Giải thích context-aware escaping.**

<details className="qa">
<summary>Xem đáp án</summary>

`Context-aware escaping` nghĩa là chọn cách thoát **theo đúng nơi dữ liệu được chèn vào**, vì mỗi ngữ cảnh có bộ ký tự phá vỡ cú pháp riêng.

| Ngữ cảnh | Cần xử lý | Ví dụ thủng nếu sai |
|---|---|---|
| HTML body | Đổi `&`, `<`, `>` thành entity | Chèn được thẻ mới |
| Attribute | Thêm `"` và `'`; luôn bọc giá trị trong nháy | Thoát khỏi nháy rồi thêm `onerror=` |
| URL / query | `encodeURIComponent`, kiểm cả scheme | `javascript:` chạy khi bấm link |
| Trong thẻ script | Không nhét dữ liệu vào code; dùng `JSON.stringify` và thoát `<` | Đóng sớm thẻ script |
| CSS | Tránh hẳn dữ liệu người dùng trong style | `url()` gọi ra ngoài |

Hàm `escapeHtml` trong bài đủ cho HTML body và attribute có nháy, nhưng **không** cứu được attribute `href`: giá trị `javascript:alert(1)` chẳng có ký tự đặc biệt nào để escape. Chỗ đó phải validate scheme bằng `new URL` như ví dụ `safeUrl`.

Vì vậy trong thực tế nên để template engine có auto-escape theo ngữ cảnh lo phần này, thay vì tự nối chuỗi HTML.

</details>

**12. React/Vue đã auto-escape thì XSS còn lọt ở đâu? Kể các trường hợp `dangerouslySetInnerHTML`, `v-html`, `innerHTML`, `href="javascript:"`.**

<details className="qa">
<summary>Xem đáp án</summary>

React, Vue, Svelte escape mặc định mọi giá trị nội suy, nên `<p>Hello, {user.name}</p>` là an toàn. XSS còn lọt ở những chỗ bạn **chủ động bước ra khỏi cơ chế đó**:

- **`dangerouslySetInnerHTML` và `v-html`** — nhận HTML thô. Chỉ dùng với nội dung đã qua sanitize.
- **DOM thủ công** — `el.innerHTML = userInput`, `document.write`, hoặc thư viện bên thứ ba tự chèn HTML.
- **URL không kiểm scheme**:

```jsx
<a href={user.website}>Website</a>
// user.website = "javascript:alert(1)" → bấm vào là dính
```

Cách chữa là hàm `safeUrl` trong bài: parse bằng `new URL` rồi chỉ chấp nhận `http:` và `https:`.

- **Template phía server không escape** — EJS, Pug dùng sai cú pháp là in HTML thô.
- **Trải object vào props** hoặc gán thuộc tính động không kiểm soát.
- **Dữ liệu server nhúng vào HTML** để hydrate, nếu serialize không thoát `<`.

Ngoài ra, sanitize bằng `DOMPurify` và bật CSP để còn lớp chắn cuối cùng khi một trong những chỗ trên lỡ lọt.

</details>

**13. Sản phẩm cần cho user nhập rich text (bình luận có định dạng). Bạn làm gì để vừa giữ được HTML vừa an toàn?**

<details className="qa">
<summary>Xem đáp án</summary>

Không tự viết bộ lọc HTML — đây là bài toán đã có thư viện chuyên trách, và mọi bộ lọc tự chế đều bị bypass. Dùng `DOMPurify` với **allowlist** thẻ và thuộc tính:

```ts
import DOMPurify from "isomorphic-dompurify";

const safe = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: ["p", "b", "i", "a", "ul", "li"],
  ALLOWED_ATTR: ["href"],
});
```

Những điểm cần lưu ý:

- **Sanitize ở server**, không chỉ ở client — client hoàn toàn bỏ qua được.
- **Allowlist chứ không blocklist**: liệt kê thẻ được phép, mặc định từ chối phần còn lại.
- **Kiểm scheme của `href`** để chặn `javascript:` và `data:`; thêm `rel="noopener noreferrer"` cho link ra ngoài.
- Cân nhắc lưu **Markdown hoặc JSON có cấu trúc** thay vì HTML thô, rồi render sang HTML ở phía mình — an toàn hơn hẳn vì bạn kiểm soát đầu ra.
- Sanitize lại **lúc render** chứ không chỉ lúc lưu, phòng khi dữ liệu cũ được lưu bằng phiên bản luật lỏng hơn.
- Bật **CSP** làm lớp chắn cuối.

</details>

**14. Cookie `HttpOnly` có "chống được XSS" không, hay chỉ giảm thiệt hại? Khi attacker đã chạy được JS trên trang, họ còn làm được gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Chỉ **giảm thiệt hại**, không chống XSS. `HttpOnly` khiến JavaScript không đọc được cookie qua `document.cookie`, nên token không bị gửi thẳng về máy chủ của kẻ tấn công. Nhưng lỗ hổng vẫn nguyên, script vẫn chạy.

Khi đã chạy được JS trong trang, kẻ tấn công còn làm được rất nhiều:

- **Gửi request thay người dùng** ngay trong phiên đó — trình duyệt tự đính kèm cookie, nên đọc cookie hay không cũng chẳng quan trọng. Chuyển tiền, đổi email, tạo API key đều làm được.
- **Đọc mọi nội dung trên trang**: dữ liệu cá nhân, danh sách đơn hàng, kể cả CSRF token.
- **Keylogger** — gắn listener đọc những gì người dùng gõ, kể cả mật khẩu và OTP.
- **Vẽ lại giao diện** để lừa đăng nhập lại (phishing ngay trên đúng domain thật).
- **Đọc `localStorage`**, nơi nhiều app lỡ lưu JWT — đây là lý do cookie `HttpOnly` vẫn hơn `localStorage`.

Vì vậy `HttpOnly` là một lớp trong defense in depth, còn cách chữa gốc vẫn là escape output, sanitize và CSP.

</details>

**15. `CSRF` hoạt động thế nào? Vì sao attacker gây hại được mà không cần đọc được response trả về?**

<details className="qa">
<summary>Xem đáp án</summary>

CSRF lợi dụng việc trình duyệt **tự động đính kèm cookie** theo đích đến, bất kể request được phát ra từ trang nào:

```html
<!-- Trang của kẻ tấn công -->
<img src="https://bank.com/transfer?to=attacker&amount=1000000" />
```

Người dùng đang đăng nhập `bank.com` mà mở trang này thì trình duyệt gửi request kèm cookie phiên, server thấy cookie hợp lệ và tưởng chính chủ chủ động thao tác. Bài ví như con dấu để sẵn trong túi: kẻ xấu không cần trộm dấu, chỉ cần dúi cho bạn tờ giấy để bạn đóng lên.

Không cần đọc response vì **tác hại nằm ở tác dụng phụ của request, không nằm ở dữ liệu trả về**. Tiền đã chuyển, email đã đổi, quyền admin đã cấp — kẻ tấn công không cần nhìn thấy trang xác nhận. Chính vì vậy CORS không cứu được: CORS chỉ chặn việc *đọc* response, còn request thì vẫn tới server và vẫn được xử lý.

Hệ quả: mọi endpoint làm thay đổi trạng thái đều cần phòng CSRF, và không bao giờ dùng `GET` cho hành động gây tác dụng phụ.

</details>

**16. `CSRF token` chặn tấn công bằng nguyên lý gì? So sánh `synchronizer token` với `double-submit cookie`.**

<details className="qa">
<summary>Xem đáp án</summary>

Nguyên lý: yêu cầu request mang theo một **bí mật mà chỉ trang thật mới biết**. Trình duyệt tự gửi cookie, nhưng không tự gửi token nằm trong HTML; trang của kẻ tấn công lại không đọc được nội dung trang bạn vì bị same-origin policy chặn. Đó là hình ảnh mã số chỉ in trên đơn do chính ngân hàng phát ra.

| | `Synchronizer token` | `Double-submit cookie` |
|---|---|---|
| Server lưu gì | Token gắn với session ở server | Không lưu gì (stateless) |
| So khớp | Token trong form với token trong session | Token trong cookie với token trong form/header |
| Độ an toàn | Cao hơn | Yếu hơn nếu có subdomain bị chiếm |
| Chi phí | Cần session store | Nhẹ, hợp hệ thống phân tán |

```html
<form action="/transfer" method="POST">
  <input type="hidden" name="csrf_token" value="random-token-from-session" />
</form>
```

Điểm yếu của double-submit: kẻ tấn công chiếm được một subdomain có thể ghi cookie cho domain cha rồi tự đặt cả hai vế khớp nhau. Khắc phục bằng cách ký token gắn với session (signed double-submit) và dùng tiền tố `__Host-` cho cookie.

</details>

**17. `SameSite=Strict|Lax|None` mỗi giá trị chặn được gì? Vì sao chỉ dựa vào `SameSite` vẫn chưa đủ?**

<details className="qa">
<summary>Xem đáp án</summary>

| Giá trị | Hành vi | Đánh đổi |
|---|---|---|
| `Strict` | Không gửi cookie trong mọi request cross-site | Từ link ngoài vào là thấy như chưa đăng nhập |
| `Lax` | Gửi cho điều hướng cấp cao bằng `GET`, không gửi cho `POST` cross-site | Mặc định của trình duyệt hiện nay, chặn phần lớn CSRF |
| `None` | Gửi trong mọi trường hợp, bắt buộc kèm `Secure` | Cần cho SSO, widget nhúng — mở lại nguy cơ CSRF |

Chỉ dựa vào `SameSite` chưa đủ vì:

- **`Lax` vẫn cho `GET` cross-site đi kèm cookie**. Endpoint nào lỡ thay đổi trạng thái bằng `GET` là vẫn dính nguyên.
- **Phụ thuộc trình duyệt** — client cũ, một số WebView hoặc app trong ứng dụng khác không xử lý đúng.
- **Same-site rộng hơn same-origin**: các subdomain được coi là cùng site, nên một subdomain bị chiếm là tấn công được.
- Nhiều hệ thống buộc phải đặt `None` cho luồng tích hợp.

Nên `SameSite` là lớp bổ trợ rất tốt, nhưng endpoint quan trọng vẫn cần CSRF token hoặc kiểm `Origin`.

</details>

**18. Vì sao API dùng `JWT` trong header `Authorization` thường không cần CSRF token, còn dùng cookie thì cần?**

<details className="qa">
<summary>Xem đáp án</summary>

Vì gốc rễ của CSRF là **trình duyệt tự động đính kèm thông tin xác thực**. Cookie thuộc loại đó: cứ đúng domain là gửi, không quan tâm ai phát ra request. Header `Authorization` thì ngược lại — nó phải do JavaScript **chủ động gắn vào** từng request.

Trang của kẻ tấn công không thể gắn header đó vào request tới API của bạn theo cách hữu ích, vì:

- Form HTML không đặt được header tuỳ chỉnh.
- `fetch` có đặt được, nhưng header tuỳ chỉnh làm request mất tư cách "simple" nên trình duyệt bắt buộc gửi **preflight**, và server không cho phép origin lạ thì dừng ngay ở đó.
- Quan trọng nhất: kẻ tấn công **không đọc được token** của nạn nhân, vì token nằm trong bộ nhớ hoặc storage của origin khác.

Đây cũng là lý do bài nói API-only backend ít phải lo CSRF, chỉ web form dùng session cookie mới cần token.

Lưu ý ngược lại: lưu JWT trong `localStorage` giúp tránh CSRF nhưng lại phơi token ra XSS. Combo bài khuyên là cookie `HttpOnly` + `SameSite=Lax` + CSRF token.

</details>

**19. Kiểm `Origin` / `Referer` có đủ chống CSRF không? Những tình huống nào hai header này vắng mặt hoặc không tin được?**

<details className="qa">
<summary>Xem đáp án</summary>

Đây là một lớp phòng thủ tốt và rẻ, nhưng không nên là lớp **duy nhất**:

```ts
if (req.headers.origin !== "https://app.example.com") {
  return res.status(403).send("CSRF check failed");
}
```

Những tình huống header vắng hoặc không đáng tin:

- **`Origin` vắng** ở một số request `GET` và điều hướng cùng site. Code từ chối khi thiếu thì hỏng chức năng, mà cho qua khi thiếu thì thủng — đó chính là chỗ khó.
- **`Referer` bị lược** bởi `Referrer-Policy`, bởi proxy doanh nghiệp, phần mềm diệt virus, hoặc khi đi từ HTTPS sang HTTP.
- **So khớp lỏng** — dùng `startsWith` hay `includes` khiến `app.example.com.evil.com` lọt.
- **Client không phải trình duyệt** tự đặt header gì cũng được; nhưng lúc đó không còn là CSRF vì không có cookie của nạn nhân.
- **Subdomain bị chiếm** vẫn gửi origin trông có vẻ hợp lệ nếu whitelist quá rộng.

Cách dùng đúng: so khớp chính xác, **từ chối khi thiếu** trên các endpoint thay đổi trạng thái, và vẫn giữ CSRF token cùng `SameSite` làm các lớp song song.

</details>

**20. So sánh `XSS` và `CSRF`: mục tiêu tấn công, hướng tấn công, và cách phòng thủ khác nhau ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

| | `XSS` | `CSRF` |
|---|---|---|
| Bản chất | Chạy code của kẻ tấn công trong trang của bạn | Mượn phiên đăng nhập để gửi request thay người dùng |
| Lợi dụng | Site tin dữ liệu người dùng | Site tin cookie mà trình duyệt tự gửi |
| Đọc được response? | Có — toàn quyền trong trang | Không cần, chỉ cần tác dụng phụ |
| Phòng thủ chính | Escape output, sanitize HTML, CSP | CSRF token, `SameSite`, kiểm `Origin` |
| Mức nguy hiểm | Cao hơn | Thấp hơn, phạm vi hẹp hơn |

Điểm quan trọng nhất về quan hệ giữa hai lỗi: **có XSS thì mọi biện pháp chống CSRF đều vô nghĩa**. Script chạy ngay trong origin của bạn nên nó đọc được CSRF token trên trang, gửi được request same-site nên `SameSite` không chặn, và header `Origin` thì hoàn toàn hợp lệ.

Vì vậy thứ tự ưu tiên khi sửa là diệt XSS trước. Ngược lại, chống CSRF tốt không giúp gì cho XSS — hai cơ chế phòng thủ hoàn toàn độc lập và đều phải có.

</details>

**21. `IDOR` / `Broken Access Control` là gì? Bạn test endpoint `GET /orders/:id` như thế nào để phát hiện lỗi này?**

<details className="qa">
<summary>Xem đáp án</summary>

`IDOR` (Insecure Direct Object Reference) là khi endpoint nhận định danh của một tài nguyên rồi trả về luôn mà **không kiểm người gọi có quyền với tài nguyên đó không**. Server chỉ xác thực (bạn là ai) mà quên phân quyền (bạn được xem cái gì) — nhánh phổ biến nhất của `Broken Access Control`.

Cách test `GET /orders/:id`:

1. Đăng nhập tài khoản A, tạo đơn hàng, ghi lại `id`.
2. Đăng nhập tài khoản B, gọi thẳng đơn của A. Kỳ vọng 403 hoặc 404, nhận 200 là thủng.
3. Thử **không gửi token** và thử token đã hết hạn.
4. Thử tài khoản thường gọi **endpoint admin** với cùng `id`.
5. Thử đổi method: đọc thì chặn nhưng `PUT` và `DELETE` có khi quên kiểm.
6. Thử **id lân cận** nếu là số tăng dần, và thử id ở tenant khác.
7. Soi cả response xem có lộ trường nội bộ không.

Phòng thủ: luôn truy vấn kèm ràng buộc chủ sở hữu, đặt kiểm quyền ở tầng service chứ không rải rác ở controller, dùng UUID thay số tăng dần, và viết test tự động cho các luồng trên.

</details>

**22. So sánh `fixed window`, `sliding window`, `token bucket`, `leaky bucket`. Fixed window bị burst gấp đôi ở ranh giới cửa sổ như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

| Thuật toán | Cách hoạt động | Điểm yếu |
|---|---|---|
| **Fixed window** | Đếm trong mỗi khung thời gian cố định, hết khung reset về 0 | Burst gấp đôi ở ranh giới |
| **Sliding window** | Luôn nhìn lại N giây gần nhất | Tốn bộ nhớ vì phải nhớ mốc từng request |
| **Token bucket** | Xô vé được nạp đều, mỗi request tiêu một vé | Cho phép xả một cục khi xô đầy |
| **Leaky bucket** | Xử lý với tốc độ cố định, request xếp hàng | Không chịu được burst, tăng độ trễ |

Vấn đề ranh giới của fixed window: giả sử giới hạn 10 request mỗi phút. Kẻ gọi dồn 10 request vào giây 59 của phút thứ nhất, rồi 10 request nữa vào giây 01 của phút thứ hai. Mỗi cửa sổ đều hợp lệ, nhưng trong **khoảng hai giây thực tế server nhận 20 request** — gấp đôi giới hạn mong muốn.

Sliding window sinh ra để trị đúng chỗ này, đổi lại tốn bộ nhớ hơn. Trong thực tế hay dùng **sliding window counter** (nội suy giữa hai cửa sổ kề) vì rẻ gần bằng fixed mà mượt gần bằng sliding, đúng như `Ratelimit.slidingWindow` trong ví dụ của bài.

</details>

**23. Rate limit theo IP có vấn đề gì (NAT, mobile carrier, proxy, `X-Forwarded-For` giả mạo)? Bạn chọn khoá để đếm ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Vấn đề của khoá theo IP:

- **NAT và mạng carrier** — cả một văn phòng hay hàng nghìn thuê bao di động dùng chung một IP công cộng. Siết chặt là chặn nhầm người dùng thật.
- **IPv6** — một người dùng có sẵn cả khối địa chỉ, đổi IP mỗi request là thoát; nên tính theo prefix chứ không theo địa chỉ đơn.
- **`X-Forwarded-For` giả mạo** — header do client đặt được. Đọc mù quáng phần tử đầu tiên thì ai cũng vượt giới hạn bằng cách bịa IP.
- **Cloud proxy** — lượng lớn traffic hợp lệ đi qua một dải IP chung.

Cách chọn khoá thực tế:

- Đã đăng nhập thì đếm theo **user id** hoặc **API key** — chính xác nhất.
- Chưa đăng nhập thì đếm theo IP, nhưng phải lấy IP đáng tin: chỉ tin phần `X-Forwarded-For` do proxy của chính bạn thêm vào, cấu hình đúng số hop tin cậy.
- Kết hợp nhiều tầng: theo tài khoản, theo IP, theo endpoint. Ví dụ login siết theo cả tài khoản (chống dò mật khẩu) lẫn IP (chống credential stuffing).
- Chọn ngưỡng theo endpoint như bảng trong bài: login 5 lần mỗi 15 phút, API thường 100 lần mỗi phút.

</details>

**24. Hệ thống chạy nhiều instance thì implement rate limit phân tán thế nào? Trả về status code và header gì cho client?**

<details className="qa">
<summary>Xem đáp án</summary>

Đếm trong bộ nhớ từng instance là sai, vì N instance sẽ cho qua gấp N lần giới hạn. Cần một **kho đếm dùng chung**, phổ biến nhất là Redis với thao tác nguyên tử (`INCR` kèm `EXPIRE`, hoặc một Lua script cho sliding window):

```ts
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

const { success } = await ratelimit.limit(ip);
if (!success) return res.status(429).json({ error: "Too many requests" });
```

Vài lưu ý vận hành: đẩy rate limit ra tầng gateway/CDN cho traffic lớn; quyết định trước hành vi khi Redis chết (thường là cho qua để không sập dịch vụ, nhưng vẫn giữ giới hạn cục bộ làm chặn thô).

Phản hồi cho client:

- **`429 Too Many Requests`** cho vượt giới hạn; đừng dùng `403`.
- **`Retry-After`** — số giây client nên chờ.
- **`RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`** để client tự điều tiết.
- Body lỗi rõ ràng, và khuyến nghị client retry có `exponential backoff` kèm jitter.

</details>

**25. `SSRF` là gì? Vì sao endpoint metadata `169.254.169.254` lại nguy hiểm, và chặn thế nào cho đủ (whitelist, chặn private IP, chặn redirect, DNS rebinding)?**

<details className="qa">
<summary>Xem đáp án</summary>

`SSRF` là khi ứng dụng gọi một URL do **người dùng kiểm soát**, biến server thành cầu nối để kẻ tấn công chạm tới những nơi họ không tự tới được:

```ts
const data = await fetch(req.query.url); // URL do user đưa
```

`169.254.169.254` là endpoint metadata của máy ảo trên cloud. Nó nguy hiểm vì nằm trong mạng nội bộ, **không đòi xác thực** (bản IMDSv1), và trả về cả thông tin cấu hình lẫn **IAM credentials tạm thời** của instance. Lấy được credentials đó là kẻ tấn công thao tác được trên tài khoản cloud.

Chặn cho đủ cần nhiều lớp, vì mỗi lớp đều có cách lách:

- **Whitelist domain** được phép gọi — mạnh nhất, nên ưu tiên.
- **Chặn dải private và loopback** (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16`) và chỉ cho `http`/`https`.
- **Kiểm lại sau mỗi redirect**, không chỉ kiểm URL ban đầu.
- **Chống DNS rebinding** — resolve DNS trước, kiểm IP, rồi kết nối tới đúng IP đó để domain không kịp đổi sang IP nội bộ giữa hai bước.
- **Tách mạng**: đẩy request ra qua egress proxy, bật IMDSv2.

</details>

**26. Chức năng nào trong sản phẩm dễ dính SSRF nhất (webhook do user cấu hình, URL preview, sinh PDF/ảnh từ URL) và bạn thiết kế phòng thủ ra sao?**

<details className="qa">
<summary>Xem đáp án</summary>

Bài liệt kê đúng ba nhóm rủi ro nhất, đều có chung đặc điểm: **người dùng đưa URL, server đi gọi**.

- **Webhook do user cấu hình** — hệ thống gọi ra định kỳ, lại thường mang theo payload.
- **URL preview** kiểu Slack — dán link là server fetch ngay.
- **Sinh PDF/ảnh từ URL** — nguy hiểm nhất vì headless browser còn chạy JS, đọc được cả `file://` nếu cấu hình lỏng.

Ngoài ra còn import từ URL, avatar theo link, và tích hợp "kết nối server của bạn".

Thiết kế phòng thủ theo lớp:

- **Validate lúc cấu hình**: chỉ `https`, chặn IP nội bộ và tên miền nội bộ, chặn cổng lạ.
- **Validate lại lúc gọi** — DNS có thể đã đổi từ lúc lưu tới lúc dùng.
- **Gọi ra từ worker cô lập**, không có quyền vào mạng nội bộ, đi qua egress proxy có allowlist.
- **Không đi theo redirect**, hoặc kiểm lại từng chặng.
- **Giới hạn timeout, kích thước và kiểu nội dung** trả về.
- **Không trả body thô về cho người dùng** — chỉ trả trạng thái, tránh biến nó thành cổng đọc dữ liệu nội bộ.
- Với webhook, ký payload bằng HMAC và ghi log đầy đủ.

</details>

**27. `Mass assignment` / over-posting là gì? Gán thẳng `req.body` vào model gây hậu quả gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`Mass assignment` là khi code lấy nguyên object từ client rồi gán thẳng vào model hoặc câu update. Người dùng gửi thêm những trường mà giao diện không hề có, và chúng vẫn được ghi vào database:

```ts
// SAI — client gửi gì cũng ghi
await db.user.update({ where: { id }, data: req.body });

// Client gửi: { "name": "A", "role": "admin", "emailVerified": true }
// → tự nâng mình lên admin
```

Hậu quả điển hình: tự cấp quyền admin, đổi `userId` của bản ghi sang người khác, bỏ qua xác minh email, sửa giá hoặc số dư, đổi trạng thái đơn hàng sang "đã thanh toán".

Cách chữa:

```ts
const schema = z.object({ name: z.string(), avatarUrl: z.string().url() });
const data = schema.parse(req.body);  // trường lạ bị loại
await db.user.update({ where: { id }, data });
```

Nguyên tắc: **allowlist trường được phép ghi**, đừng blacklist. Tách DTO cho từng thao tác thay vì dùng chung một model, và tách hẳn endpoint cho những thao tác nhạy cảm như đổi vai trò, đổi mật khẩu — kèm kiểm quyền riêng.

</details>

**28. Thông báo lỗi và log phải viết thế nào để không rò rỉ thông tin nhạy cảm mà vẫn đủ để debug production?**

<details className="qa">
<summary>Xem đáp án</summary>

Ý tưởng chính: **tách hai kênh**. Client nhận thông điệp chung chung, hệ thống log giữ chi tiết đầy đủ, nối hai bên bằng một mã định danh.

Phía client:

- Thông điệp chung, không stack trace, không câu SQL, không tên bảng, không đường dẫn file, không phiên bản thư viện.
- Kèm một `requestId` để người dùng báo lại cho support.
- **Không phân biệt** "email không tồn tại" với "sai mật khẩu" — chỉ nói "thông tin đăng nhập không đúng", tránh cho phép dò danh sách tài khoản. Tương tự với chức năng quên mật khẩu và đăng ký.
- Lỗi phân quyền nên cân nhắc trả `404` thay vì `403` để không xác nhận tài nguyên có tồn tại.

Phía log:

- Ghi đủ ngữ cảnh: `requestId`, user id, endpoint, tham số đã lọc, stack trace.
- **Che dữ liệu nhạy cảm**: mật khẩu, token, số thẻ, OTP, thông tin cá nhân. Đặt danh sách trường bị che ngay trong logger.
- Log có cấu trúc để truy vấn được, đặt thời hạn lưu trữ và giới hạn quyền truy cập.
- Ghi riêng **audit log** cho hành động nhạy cảm như đăng nhập và thanh toán.

</details>

**29. Bạn kiểm soát rủi ro từ dependency bên thứ ba ra sao (`Dependabot`, `Snyk`, lockfile, supply chain attack)?**

<details className="qa">
<summary>Xem đáp án</summary>

Dependency không patch nằm hẳn trong OWASP Top 10, và phần lớn code chạy trên production là code người khác viết. Cách kiểm soát:

- **Lockfile bắt buộc commit**, và CI cài bằng `npm ci` để build tái lập được đúng cây phụ thuộc.
- **Quét tự động** — `Dependabot` hoặc `Snyk` mở PR khi có CVE; `npm audit` chạy trong CI.
- **Chốt phiên bản** cho dependency quan trọng, tránh dải phiên bản quá rộng khiến một bản vá nhỏ tự vào production.
- **Giảm số lượng phụ thuộc** — cân nhắc trước khi thêm package cho một hàm vài dòng; ưu tiên thư viện có người duy trì thật, cập nhật đều.
- **Chống supply chain attack**: bật `ignore-scripts` để chặn script cài đặt, để một khoảng trễ trước khi nâng lên bản vừa phát hành, cảnh giác với typosquatting, dùng đăng ký nội bộ hoặc mirror.
- **Ký và kiểm tra provenance**, sinh SBOM để biết mình đang chạy những gì.
- **Quy trình phản ứng**: có người trực, có SLA vá theo mức nghiêm trọng, và khả năng deploy nhanh khi lỗ hổng nghiêm trọng xuất hiện.

</details>

**30. `Defense in depth` nghĩa là gì với một request đi qua middleware → service → database? Kể các tầng kiểm tra và lý do không được bỏ tầng nào.**

<details className="qa">
<summary>Xem đáp án</summary>

`Defense in depth` là **xếp nhiều lớp phòng thủ độc lập**, chấp nhận rằng lớp nào cũng có thể hỏng, nên kẻ tấn công phải phá được tất cả mới thành công.

Với một request:

- **Tầng biên** — HTTPS, security header, CORS, rate limit, chặn payload quá lớn.
- **Middleware** — xác thực token, gắn danh tính vào request, kiểm CSRF.
- **Validate input** bằng schema, chỉ nhận đúng các trường cho phép.
- **Service** — phân quyền theo nghiệp vụ: user này có được động vào tài nguyên này không. Đây là tầng không công cụ nào làm hộ.
- **Truy cập dữ liệu** — parameterized query, truy vấn kèm ràng buộc chủ sở hữu, DB user quyền tối thiểu.
- **Đầu ra** — chỉ trả trường cần thiết, escape khi render.
- **Quan sát** — audit log và cảnh báo cho hành động nhạy cảm.

Không bỏ được tầng nào vì mỗi tầng chặn một kiểu thất bại khác nhau: middleware bị bỏ qua khi có route đăng ký sai thứ tự, validate ở biên không phủ được job nền và message queue, còn quyền tối thiểu ở DB chính là thứ giữ lại thiệt hại khi mọi tầng trên đã thủng. Như bài nhấn mạnh: đừng over-trust framework.

</details>
