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
