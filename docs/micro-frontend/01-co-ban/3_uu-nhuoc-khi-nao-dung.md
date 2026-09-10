---
sidebar_position: 3
title: "3. Ưu/nhược & khi nào nên dùng"
---

# Ưu, nhược điểm & khi nào nên dùng

Micro-frontend rất hấp dẫn trên slide, nhưng đi kèm **cái giá thật sự**. Bài này
liệt kê thẳng thắn ưu/nhược điểm và đưa ra tiêu chí quyết định *có nên dùng hay
không* — phần quan trọng nhất để tránh "đu trend" rồi trả giá đắt.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Ưu điểm lớn nhất: nhóm tự chủ + `deploy` độc lập** — kèm nâng cấp dần, cô lập lỗi, scale theo tổ chức.
- ⭐ **Micro-frontend trị vấn đề *tổ chức*, không phải kỹ thuật** — code rối thì nên `refactor`, đừng chẻ nhỏ thành nhiều app.
- **Cái giá phải trả** — phức tạp vận hành, trùng `dependency`, khó nhất quán UI, chia sẻ state/routing và debug đều khó hơn.
- **Nên dùng khi** nhiều nhóm (≥ 3–4), app thực sự lớn, cần deploy độc lập và chấp nhận đầu tư hạ tầng.
- **Không nên khi** nhóm nhỏ, app vừa/nhỏ, hoặc chỉ muốn "chia code cho gọn" — hãy cân nhắc `modular monolith` trước.

:::

---

## Mục lục

- [Ưu điểm](#ưu-điểm)
- [Cái giá phải trả](#cái-giá-phải-trả)
- [Khi nào NÊN dùng](#khi-nào-nên-dùng)
- [Khi nào KHÔNG nên dùng](#khi-nào-không-nên-dùng)
- [Giải pháp thay thế: modular monolith](#giải-pháp-thay-thế-modular-monolith)
- [Tóm tắt](#tóm-tắt)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Ưu điểm

- **Nhóm tự chủ & deploy độc lập** — mỗi nhóm release theo nhịp riêng, không chờ
  nhau. Đây là lợi ích lớn nhất.
- **Nâng cấp dần dần** — đổi framework hay phiên bản *từng mảnh một*, không cần
  viết lại toàn bộ ("big bang rewrite").
- **Cô lập lỗi** — một mảnh hỏng (lý tưởng là) không làm sập cả trang.
- **Scale theo tổ chức** — dễ chia việc cho nhiều nhóm song song khi công ty lớn.
- **Build/test nhanh hơn theo mảnh** — mỗi mảnh nhỏ build nhanh hơn cả khối.

## Cái giá phải trả

:::warning Những chi phí thường bị xem nhẹ
- **Phức tạp vận hành** — nhiều pipeline build/deploy, nhiều nơi để theo dõi và
  gỡ lỗi. DevOps nặng hơn hẳn.
- **Trùng lặp dependency** — nếu không chia sẻ tốt, mỗi mảnh tự tải React của
  riêng nó → trang **nặng và chậm**. (Module Federation sinh ra để giảm việc này,
  xem mục 2.)
- **Khó nhất quán UI/UX** — mỗi nhóm làm một kiểu; cần **design system chung** +
  kỷ luật.
- **Chia sẻ state & routing phức tạp** — truyền dữ liệu và điều hướng xuyên các
  mảnh không hề tầm thường.
- **Khó debug xuyên mảnh** — một luồng đi qua nhiều ứng dụng khó truy vết.
- **Phiên bản & hợp đồng** — phải quản lý "mảnh A bản nào hợp với shell bản nào".
:::

## Khi nào NÊN dùng

Cân nhắc micro-frontend khi **đa số** các điều sau đúng:

- ✅ **Nhiều nhóm** (thường ≥ 3–4) cùng làm trên một sản phẩm và đang giẫm chân
  nhau.
- ✅ Ứng dụng **thực sự lớn**, nhiều mảng tính năng tách bạch rõ ràng.
- ✅ Cần **deploy độc lập** vì các mảng có nhịp phát hành rất khác nhau.
- ✅ Cần **tích hợp app cũ** (legacy) với phần mới mà không viết lại tất cả.
- ✅ Tổ chức **chấp nhận đầu tư** hạ tầng/DevOps tương xứng.

## Khi nào KHÔNG nên dùng

- ❌ **Nhóm nhỏ** (1–2 nhóm) — chi phí phức tạp lớn hơn lợi ích rất nhiều.
- ❌ App **vừa và nhỏ**, hoặc còn đang tìm hướng đi (chưa ổn định).
- ❌ Chỉ muốn "chia code cho gọn" — việc đó dùng **module/thư mục** là đủ.
- ❌ Đội chưa vững về build tooling, CI/CD — micro-frontend sẽ nhân đôi nỗi đau.

:::danger Sai lầm phổ biến nhất
Dùng micro-frontend để giải quyết **vấn đề kỹ thuật** (vd "code rối quá"). Nó là
giải pháp cho **vấn đề tổ chức/quy mô**. Code rối thì nên *refactor*, không phải
*chẻ nhỏ thành nhiều app* — làm vậy chỉ biến mớ rối trong một app thành mớ rối
trải khắp nhiều app.
:::

## Giải pháp thay thế: modular monolith

Trước khi nhảy sang micro-frontend, hãy cân nhắc **modular monolith** (khối nguyên
có module hoá tốt): vẫn một codebase / một deploy, nhưng chia **ranh giới module
rõ ràng** bên trong.

| | Modular monolith | Micro-frontend |
| --- | --- | --- |
| Codebase | Một | Nhiều |
| Deploy | Một lần | Độc lập từng mảnh |
| Độ phức tạp | Thấp | Cao |
| Phù hợp | Đa số dự án | Tổ chức lớn, nhiều nhóm |

> Quy tắc thực dụng: **bắt đầu bằng modular monolith**, chỉ tách sang
> micro-frontend khi *nỗi đau tổ chức* thực sự xuất hiện — đừng làm sớm.

## Tóm tắt

- **Ưu điểm chính**: nhóm tự chủ, deploy độc lập, nâng cấp dần, cô lập lỗi, scale
  tổ chức.
- **Cái giá**: phức tạp vận hành, trùng dependency, khó nhất quán UI, chia sẻ
  state/routing và debug đều khó hơn.
- **Nên dùng** khi: nhiều nhóm, app lớn, cần deploy độc lập, có đầu tư hạ tầng.
- **Không nên** khi: nhóm nhỏ, app vừa, hoặc chỉ muốn "chia code cho gọn".
- Micro-frontend trị **vấn đề tổ chức**, không phải vấn đề kỹ thuật. Cân nhắc
  **modular monolith** trước.

Hết mục Cơ bản. Mục tiếp theo: **Module Federation** — kỹ thuật runtime phổ biến
nhất, kèm demo React thực hành.

---

## Câu hỏi phỏng vấn

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi đối chiếu lại với nội dung phía trên.

1. Lợi ích lớn nhất của micro-frontend là gì, và vì sao nói nó giải quyết vấn đề *tổ chức* chứ không phải vấn đề kỹ thuật?
2. "Độc lập deploy" cụ thể nghĩa là gì? Cần những điều kiện kỹ thuật nào để thực sự đạt được nó?
3. Micro-frontend hỗ trợ nâng cấp framework dần dần ra sao? Hãy phác một lộ trình kiểu `strangler` cho một app cũ.
4. "Cô lập lỗi" đạt được nhờ cơ chế nào? Nó có tuyệt đối không, và trường hợp nào một mảnh vẫn kéo sập cả trang?
5. Chi phí hiệu năng lớn nhất của micro-frontend là gì? Bạn đo và giảm trùng lặp `dependency` bằng cách nào?
6. Làm sao giữ nhất quán UI/UX khi mỗi nhóm tự làm một mảnh? Vai trò và cách quản lý phiên bản của `design system` chung?
7. Vì sao chia sẻ state và routing xuyên mảnh lại khó? Nêu vài rủi ro cụ thể bạn từng gặp hoặc lường trước.
8. Debug và `observability` một luồng nghiệp vụ đi qua nhiều mảnh khó ở chỗ nào? Bạn dựng gì để truy vết đầu–cuối?
9. Bạn quản lý hợp đồng và tương thích phiên bản giữa shell và các mảnh ra sao? Có nên có contract test không?
10. Nêu các tiêu chí bạn dùng để quyết định *có* áp dụng micro-frontend. Quy mô bao nhiêu nhóm thì bắt đầu hợp lý?
11. Khi nào KHÔNG nên dùng micro-frontend? Dấu hiệu nào cho thấy một đội đang chọn nó vì trào lưu?
12. `Modular monolith` khác micro-frontend ở những điểm nào? Vì sao thường nên bắt đầu từ đó?
13. Quản lý yêu cầu chẻ app thành micro-frontend vì "code rối quá" — bạn phản biện và đề xuất phương án thay thế thế nào?
14. Nên chia mảnh theo miền nghiệp vụ hay theo tầng kỹ thuật? Vì sao cách chia sai lại phá hỏng lợi ích của kiến trúc?
15. Nếu một thay đổi ở model dùng chung buộc mọi mảnh phải deploy lại cùng lúc thì kiến trúc đang sai ở đâu, và sửa theo hướng nào?
