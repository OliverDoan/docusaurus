---
sidebar_position: 1
title: "1. Khái niệm & Trade-off"
---

# Khái niệm & Trade-off

> *Nhóm câu hỏi này kiểm tra xem bạn hiểu micro-frontend là một quyết định về tổ chức và kiến trúc hay chỉ là một "buzzword kỹ thuật" — và quan trọng hơn, biết khi nào KHÔNG nên dùng.*

---

## Câu 1: Micro-frontend là gì? `[Basic]`

### Câu hỏi

> "Bạn hiểu micro-frontend là gì? Nó khác gì với việc tách component ra thành thư viện dùng chung?"

### Giải thích lý thuyết

**Micro-frontend (MFE)** là kiến trúc chia một frontend monolith thành nhiều ứng dụng nhỏ, độc lập, **tách theo business domain** (ví dụ: catalog, checkout, account). Ý tưởng cốt lõi mượn từ microservices ở backend: mỗi mảnh do **một team own end-to-end** — từ code, build, test cho tới deploy — và được tích hợp lại thành một sản phẩm hoàn chỉnh ở phía người dùng.

Điểm mấu chốt là **độc lập về vận hành** chứ không chỉ độc lập về code:

- Mỗi MFE có thể **build và deploy riêng**, không cần redeploy cả site.
- Mỗi MFE có thể (về lý thuyết) dùng tech stack riêng.
- Ranh giới chia theo **domain nghiệp vụ**, không theo layer kỹ thuật.

Phân biệt với các khái niệm hay bị nhầm:

| Khái niệm | Bản chất | Deploy độc lập? | Chia theo |
| --- | --- | --- | --- |
| **Micro-frontend** | App độc lập, runtime integration | Có | Business domain |
| **Component library** | Package UI dùng chung (npm) | Không — consumer phải build lại | Tái sử dụng UI |
| **Monorepo thuần** | Nhiều package trong 1 repo, vẫn build/deploy chung | Thường không | Tổ chức source code |

> **Insight phỏng vấn:** Component library và monorepo là về **chia sẻ code**; micro-frontend là về **chia sẻ quyền tự chủ vận hành (deploy độc lập)**. Nếu redeploy một phần vẫn phải build lại toàn site thì đó chưa phải micro-frontend.

### Code minh hoạ

```text
Frontend monolith (1 SPA, 1 team, 1 deploy):
┌─────────────────────────────────────┐
│  app/                               │
│   ├─ catalog/   checkout/  account/ │  → build chung → deploy chung
└─────────────────────────────────────┘

Micro-frontend (3 app, 3 team, 3 deploy):
┌──────────┐  ┌──────────┐  ┌──────────┐
│ catalog  │  │ checkout │  │ account  │   mỗi app:
│ team A   │  │ team B   │  │ team C   │   build riêng + deploy riêng
└──────────┘  └──────────┘  └──────────┘
       \           |           /
        └──── Shell / Container ────┘   (tích hợp ở runtime)
```

### Đáp án mẫu

> "Micro-frontend là kiến trúc tách frontend monolith thành nhiều app nhỏ, độc lập, chia theo business domain như catalog, checkout, account. Điểm cốt lõi là mỗi mảnh do một team own end-to-end và **deploy được độc lập** mà không cần redeploy cả site, giống tư tưởng microservices ở backend. Nó khác component library hay monorepo ở chỗ đó: component library chỉ là chia sẻ code và consumer vẫn phải build lại, còn micro-frontend là chia sẻ quyền tự chủ về vận hành. Em coi nó là một quyết định về tổ chức team nhiều hơn là một thủ thuật kỹ thuật."

---

## Câu 2: Micro-frontend khác monolith frontend (SPA lớn) ở đâu? Khi nào nên dùng? `[Intermediate]`

### Câu hỏi

> "So sánh micro-frontend với một SPA monolith lớn. Theo bạn khi nào nên chọn micro-frontend, khi nào thì không?"

### Giải thích lý thuyết

Sự khác biệt không nằm ở "nhiều file hơn" mà nằm ở **đường biên build/deploy và quyền sở hữu**:

| Tiêu chí | SPA monolith | Micro-frontend |
| --- | --- | --- |
| **Build / deploy** | Một pipeline, deploy nguyên khối | Nhiều pipeline, deploy độc lập từng MFE |
| **Team ownership** | Nhiều team chạm chung 1 codebase | Mỗi team own trọn một MFE |
| **Tech stack** | Đồng nhất, một version framework | Có thể khác nhau (đánh đổi bằng overhead) |
| **Codebase** | Một repo/app duy nhất | Tách thành nhiều app + một shell |
| **Runtime** | Một bundle nạp một lần | Nhiều bundle ghép lúc runtime |
| **Bán kính rủi ro (blast radius)** | Một lỗi build chặn cả site | Lỗi cô lập trong một MFE |

**NÊN dùng khi:**

- Có **nhiều team lớn** (thường > 3–4 team) cần làm song song mà không giẫm chân nhau.
- **Domain tách biệt rõ** — checkout, search, account ít phụ thuộc lẫn nhau.
- Cần **independent deploy** vì các phần có nhịp release khác nhau.
- App đủ lớn để build monolith trở thành nút thắt cổ chai.

**KHÔNG nên dùng khi:**

- App nhỏ hoặc chỉ **1–2 team** — overhead vận hành lớn hơn lợi ích.
- Domain dính chặt vào nhau, chia ra sẽ phải "nói chuyện" qua MFE liên tục.
- Team chưa có nền tảng CI/CD, design system, observability tốt.

> **Insight phỏng vấn:** Câu chốt ăn điểm là *"micro-frontend giải quyết bài toán scaling tổ chức, không phải bài toán kỹ thuật"*. Với app nhỏ thì module hóa tốt + monorepo gần như luôn thắng.

### Code minh hoạ

```text
Cây quyết định nhanh:

App nhỏ / 1–2 team?
   └─ Có  → Monolith + module hóa tốt (ĐỪNG dùng MFE)
   └─ Không
        Nhiều team độc lập, domain tách rõ, cần deploy riêng?
           └─ Có  → Cân nhắc Micro-frontend
           └─ Không → Monolith vẫn ổn
```

### Đáp án mẫu

> "Khác biệt cốt lõi là đường biên deploy và quyền sở hữu: SPA monolith build và deploy nguyên khối, nhiều team chạm chung một codebase; còn micro-frontend tách thành nhiều app, mỗi team own trọn một mảnh và deploy độc lập. Em sẽ chọn micro-frontend khi có nhiều team lớn cần chạy song song, domain tách biệt rõ và các phần có nhịp release khác nhau. Ngược lại, với app nhỏ hay chỉ một hai team, em sẽ không dùng vì overhead vận hành sẽ vượt lợi ích — lúc đó module hóa tốt cộng monorepo là đủ. Em luôn nhớ micro-frontend giải bài toán scaling tổ chức chứ không phải bài toán kỹ thuật."

---

## Câu 3: Ưu và nhược điểm của micro-frontend là gì? `[Intermediate]`

### Câu hỏi

> "Liệt kê cho tôi những ưu điểm và nhược điểm chính của micro-frontend. Bạn đánh giá trade-off thế nào?"

### Giải thích lý thuyết

Một câu trả lời tốt phải **cân đối** chứ không chỉ tô hồng:

| Ưu điểm | Nhược điểm |
| --- | --- |
| **Team autonomy** — mỗi team tự chủ, ít block lẫn nhau | **Trùng dependency / bundle** — mỗi MFE kéo riêng React, lib → payload phình to |
| **Independent deploy** — release nhanh, nhỏ, ít rủi ro | **Complexity vận hành** — nhiều pipeline, nhiều version, nhiều thứ phải orchestrate |
| **Scale team** — onboard team mới dễ, codebase nhỏ gọn | **Consistency UX** — khó giữ giao diện và trải nghiệm đồng nhất giữa các MFE |
| **Tech flexibility** — có thể nâng cấp/đổi stack từng phần | **Performance overhead** — nhiều bundle, nhiều lần tải runtime, ghép lúc chạy |
| **Fault isolation** — lỗi một MFE không nhất thiết sập cả site | **Khó debug xuyên app** — lỗi đi qua nhiều MFE khó truy vết |

Trọng tâm trade-off: **đổi đơn giản kỹ thuật lấy tự chủ tổ chức**. Hầu hết nhược điểm có thể giảm thiểu (shared dependencies, design system dùng chung, lazy load) nhưng không bao giờ về 0 — chúng là chi phí cố hữu của kiến trúc phân tán ở frontend.

> **Insight phỏng vấn:** Đừng quên nhược điểm **performance**. Nhiều ứng viên chỉ khen autonomy mà bỏ qua việc duplicate React/lib làm bundle phình và làm hỏng Core Web Vitals.

### Code minh hoạ

```text
Trade-off một dòng:
  Tự chủ tổ chức (deploy/team/stack riêng)
        ⇅ đánh đổi với ⇅
  Đơn giản kỹ thuật (1 bundle, 1 version, UX nhất quán, dễ debug)
```

### Đáp án mẫu

> "Ưu điểm lớn nhất là tự chủ: mỗi team own một MFE, deploy độc lập, scale team dễ, nâng cấp tech stack từng phần, và lỗi được cô lập. Đổi lại, nhược điểm là dependency hay bị trùng làm bundle phình và ảnh hưởng performance, độ phức tạp vận hành tăng vì nhiều pipeline và nhiều version, khó giữ UX nhất quán, và debug xuyên app khó hơn. Em nhìn nó như đánh đổi: lấy tự chủ tổ chức bằng cách hy sinh sự đơn giản kỹ thuật. Phần lớn nhược điểm giảm được nhờ shared dependencies và design system chung, nhưng không bao giờ triệt tiêu hoàn toàn nên phải cân nhắc kỹ trước khi áp dụng."

---

## Câu 4: Micro-frontend có những nhược điểm & thách thức gì cần lưu ý khi vận hành thực tế? `[Intermediate]`

### Câu hỏi

> "Giả sử công ty đã quyết định đi micro-frontend. Theo bạn những thách thức thực tế khi vận hành lâu dài là gì?"

### Giải thích lý thuyết

Câu này đào sâu **góc vận hành & tổ chức** — khác Câu 3 vốn liệt kê trade-off ở mức cân đối. Những thách thức thực chiến đáng nói:

- **Payload & duplicate dependencies:** Nếu không cấu hình shared/singleton, mỗi MFE tự kéo React, router, lib → tải trùng, tăng payload, hại Core Web Vitals.
- **Version skew của shared lib:** MFE A dùng React 18, MFE B dùng 17; hoặc design system khác version → vỡ runtime hoặc UI lệch. Đây là **lớp khó nhất** khi share singleton.
- **Consistency của design system:** Đảm bảo mọi MFE dùng cùng token, cùng component version để UX không "chắp vá".
- **Observability / debug cross-app:** Một luồng đi qua nhiều MFE; cần correlation id, error boundary, distributed logging để truy vết.
- **Governance:** Ai quyết định version chung, quy ước contract giữa các MFE, breaking change được thông báo thế nào.
- **Integration testing khó:** Mỗi MFE test riêng dễ, nhưng test khi ghép tất cả lại (E2E xuyên MFE) tốn công và hay vỡ.
- **Ai own shell/container:** Shell là điểm tích hợp chung — cần một team chịu trách nhiệm rõ ràng, tránh "no man's land".

| Thách thức | Cách giảm thiểu thường dùng |
| --- | --- |
| Duplicate deps | `shared` + `singleton` trong Module Federation |
| Version skew | Pin version, contract test, semantic versioning chặt |
| UX không nhất quán | Design system + token dùng chung, versioned |
| Debug cross-app | Correlation id, error boundary mỗi MFE, central logging |
| Integration vỡ | E2E xuyên MFE + contract test giữa shell và MFE |

> **Insight phỏng vấn:** Nhắc tới **version skew của shared singleton** và **ai own shell** sẽ cho thấy bạn đã thực sự vận hành chứ không chỉ đọc lý thuyết.

### Code minh hoạ

```js
// webpack.config.js — khai báo shared singleton để tránh trùng & version skew
new ModuleFederationPlugin({
  name: "checkout",
  shared: {
    // singleton: true → toàn site dùng CHUNG một instance React
    react: { singleton: true, requiredVersion: "^18.2.0" },
    "react-dom": { singleton: true, requiredVersion: "^18.2.0" },
    // strictVersion: true → version lệch sẽ báo lỗi rõ thay vì lỗi runtime mơ hồ
    "@company/design-system": { singleton: true, strictVersion: true },
  },
});
```

### Đáp án mẫu

> "Thách thức lớn nhất khi vận hành thực tế là duplicate dependencies làm payload phình và version skew của shared lib — ví dụ hai MFE chạy React khác version sẽ vỡ runtime, nên em luôn cấu hình shared singleton và pin version chặt. Tiếp theo là giữ design system nhất quán để UX không chắp vá, và observability: một luồng đi qua nhiều MFE nên cần correlation id, error boundary và central logging để debug. Về tổ chức, phải làm rõ governance ai quyết định version chung và đặc biệt là ai own shell, vì shell là điểm tích hợp dễ thành no man's land. Integration test xuyên MFE cũng khó nên em ưu tiên contract test giữa shell và từng MFE."

---

## Câu 5: Hãy chia sẻ về micro-frontend ở công ty bạn đang làm (nếu có)? `[Senior]`

### Câu hỏi

> "Kể cho tôi nghe về một dự án micro-frontend bạn từng tham gia: bối cảnh, quyết định kỹ thuật, kết quả và bài học."

### Giải thích lý thuyết

Đây là câu **behavioral** — đánh giá khả năng kể chuyện kỹ thuật có chiều sâu. Dùng khung **STAR**:

- **S (Situation):** bối cảnh, vấn đề tổ chức/kỹ thuật.
- **T (Task):** mục tiêu, vai trò của bạn.
- **A (Action):** quyết định kiến trúc cụ thể, công nghệ, cách xử lý trade-off.
- **R (Result):** kết quả đo được + bài học rút ra.

**Nếu bạn chưa từng làm thật:** đừng bịa. Hãy nói thẳng là chưa triển khai production nhưng đã làm POC hoặc nghiên cứu kỹ, rồi trình bày bạn *sẽ* thiết kế thế nào và lý do. Sự trung thực cộng tư duy kiến trúc được đánh giá cao hơn một câu chuyện giả vờ.

> **Insight phỏng vấn:** Điểm cộng lớn nhất là nêu được **con số** (giảm thời gian deploy, giảm xung đột giữa team) và **bài học** — kể cả bài học "lẽ ra nên giữ monolith lâu hơn".

### Code minh hoạ

```text
Khung STAR cho câu chuyện MFE:

S  E-commerce, 1 SPA monolith ~40 dev / 4 team, deploy chung 1 lần/tuần,
   một team release bị chặn vì team khác đang dở dang.
T  Tách monolith để các team deploy độc lập, vai trò em: dẫn dắt mảng checkout.
A  Tách 3 MFE theo domain: catalog / checkout / account, dùng
   Webpack Module Federation, shell mỏng route giữa các MFE,
   React + design system làm shared singleton, contract test giữa shell-MFE.
R  Deploy độc lập: từ 1 lần/tuần → mỗi team deploy hằng ngày;
   xung đột merge giảm rõ. Bài học: phải đầu tư design system & shell
    owner TRƯỚC, không thì UX lệch và shell thành no man's land.
```

### Đáp án mẫu

> "Ở dự án e-commerce gần nhất, bọn em có một SPA monolith với khoảng 40 dev chia 4 team, deploy chung một lần mỗi tuần. Vấn đề là một team muốn release thường bị chặn vì team khác đang làm dở trong cùng codebase. Em tham gia dẫn dắt việc tách checkout. Bọn em chia thành ba micro-frontend theo domain — catalog, checkout, account — dùng Webpack Module Federation, một shell mỏng lo routing, còn React và design system thì khai báo shared singleton để tránh trùng và lệch version. Bọn em cũng thêm contract test giữa shell và từng MFE. Kết quả là mỗi team chuyển từ deploy tuần một lần sang deploy gần như hằng ngày, xung đột merge giảm hẳn. Bài học lớn nhất của em là phải đầu tư design system và chỉ định team own shell ngay từ đầu, nếu không UX sẽ lệch và shell dễ thành no man's land."

---

## Bẫy thường gặp khi trả lời

| Sai lầm | Đúng là |
| --- | --- |
| Coi micro-frontend chỉ là "tách nhiều component/repo" | Là kiến trúc cho phép **deploy độc lập** và **team own end-to-end** theo domain |
| Nhầm micro-frontend với component library hoặc monorepo | Library/monorepo là chia sẻ code; MFE là chia sẻ **tự chủ vận hành** |
| Nói micro-frontend "luôn tốt hơn" monolith | Chỉ hợp khi **nhiều team lớn, domain tách rõ**; app nhỏ thì monolith thắng |
| Chỉ kể ưu điểm, bỏ qua nhược điểm | Phải nêu cả **duplicate deps, performance, complexity, UX không nhất quán** |
| Quên nói về performance overhead | Duplicate React/lib làm phình bundle, hại Core Web Vitals — phải shared singleton |
| Bỏ qua version skew của shared lib | Lệch version React/design-system gây vỡ runtime — phải pin & strictVersion |
| Không nói ai own shell/container | Shell là điểm tích hợp chung, cần một team chịu trách nhiệm rõ ràng |
| Bịa câu chuyện MFE khi chưa từng làm | Nói thật về POC/hiểu biết và trình bày cách bạn **sẽ** thiết kế + lý do |
| Câu chuyện STAR thiếu kết quả đo được | Nêu **con số** (tần suất deploy, giảm xung đột) và **bài học** cụ thể |
