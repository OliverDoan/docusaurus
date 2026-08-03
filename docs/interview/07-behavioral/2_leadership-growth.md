---
sidebar_position: 2
title: "2. Leadership & Growth (Senior+)"
---

# Leadership & Growth (Senior+)

> *Phần này dành cho Senior / Tech Lead phỏng vấn. Kỹ năng kỹ thuật là điều kiện cần — leadership và growth là điều kiện đủ để được offer Senior level.*

:::note[Ghi nhớ nhanh]

- ⭐ **Trả lời theo khung `STAR`** (Situation → Task → Action → Result) — luôn đóng bằng kết quả đo được và bài học tự rút ra.
- **Mentoring cần có process + outcome** — dạy người ta cách tự solve bug (chỉ đường: docs → grep code → AI → đồng nghiệp), không làm hộ; nêu rõ mentee phát triển thế nào.
- **Lead cross-team khi không có authority** — nhấn mạnh align stakeholder, communication, biết khi nào escalate, và ownership từ idea đến delivery.
- **Self-aware** — chủ động nói điểm bản thân cần cải thiện (vd "bite tongue", slow down), tránh kể chuyện tự tô hồng.

:::

---

## Câu 1: Em đã mentor junior chưa? `[Senior]`

### Câu hỏi

> Em đã từng mentor/onboard junior dev chưa? Kể cụ thể một trường hợp.

### Interviewer đang test gì

- Có biết cách teach không (giải thích vs làm hộ).
- Có patience không.
- Có structure mentoring không hay ad-hoc.
- Có quan tâm growth của người khác hay chỉ focus task mình.

### Đáp án mẫu (STAR)

> **S**: "Năm trước, team em onboard 2 junior fresh ra trường. Em được giao primary mentor cho 1 bạn — tên Hiếu, biết React căn bản nhưng chưa làm production."
>
> **T**: "Em có ~3 tháng probation period để giúp Hiếu trở thành productive contributor — ship được feature độc lập."
>
> **A**: "Em chia 3 phase. **Phase 1 — Setup (tuần 1-2)**: em không giao task code ngay. Em sit-down 2 buổi tổng cộng 4h: walk-through architecture, conventions của team, làm sao tự debug, ai hỏi cái gì khi stuck (ưu tiên: docs → grep code → ChatGPT/Cursor → đồng nghiệp). Em pair với Hiếu setup local environment — quan trọng vì stuck ở setup là kill morale của fresher. **Phase 2 — Guided contribution (tuần 3-6)**: em assign task small — bug fix, copy change, feature thật nhỏ. Mỗi task có acceptance criteria rõ. Hiếu submit PR, em review CẢ technical lẫn process — comment dạng 'Em thử nghĩ alternative này, lý do em prefer là...' thay vì 'Sai rồi, sửa thành ...'. Pair programming 2 lần/tuần — em chia sẻ màn hình debug bug, Hiếu watch và hỏi. **Phase 3 — Independent (tuần 7-12)**: feature medium-size, em chỉ guide ở design review + final review. Em encourage Hiếu tự propose design qua RFC nhỏ. Lúc này em pull back — Hiếu cần học fail và debug độc lập."
>
> **R**: "Sau 3 tháng, Hiếu ship được 4 feature production, viết được test, review được PR của junior khác đến sau. Probation pass. 1 năm sau Hiếu được promote Senior. Anh ấy email em sau khi nghỉ chuyển công ty: 'Em luôn nhớ 3 tháng đầu anh dạy em làm sao học hiệu quả, không phải dạy code.' Bài học của em: **mentor không phải giải bug hộ — là dạy người ta solve bug**. Em phải bite lưỡi rất nhiều lần khi muốn just-fix-it cho nhanh."

### Tips

- Mentor không phải "em chỉ Hiếu code" — phải có **process** rõ.
- Phải có **outcome** của mentee — họ phát triển thế nào.
- **Self-aware** về điểm em improve được (bite tongue, slow down).

---

## Câu 2: Lead một initiative cross-team `[Senior]`

### Câu hỏi

> Kể về một initiative em đã lead mà có nhiều team liên quan.

### Interviewer đang test gì

- Em có khả năng align stakeholder không.
- Communication skill khi không có authority (lead nhưng không phải sếp).
- Có biết khi nào escalate không.
- Có ownership từ idea đến delivery không.

### Đáp án mẫu (STAR)

> **S**: "Q2 năm ngoái, em nhận ra company có vấn đề: design system bị fork ở 4 product khác nhau. Mỗi team có version Button riêng, color riêng. Maintenance cost cao, brand không consistent."
>
> **T**: "Em không được sếp giao — em tự propose. Stakeholder: 4 FE team (10 dev), 2 designer, 1 PM design. Không có ai 'sếp chung'."
>
> **A**: "Em không gọi meeting trước. Em research 3 tuần: audit codebase 4 product, list duplicate component, đo bundle bloat từ fork, đếm hours design fix inconsistency. Số liệu: 40% component duplicate, 18 màu primary, 5 button variant 'gần giống'. Em viết 1 RFC: 'Centralize design system v2'. Em gửi cho 4 lead FE trước (không send broadcast). Có pushback: 'Team em đang ship feature, không có resource', 'Component em đã custom cho UX cụ thể'. Em không argue — em listen. Sau đó em refine RFC: phase 1 chỉ centralize Button + Input + Card (3 component dùng nhiều nhất), không migrate hết một lần. Phase 1 do 1 dev em (em volunteer 30% time) + 1 designer drive, các team chỉ adopt khi sẵn sàng. Em present RFC ở design + eng all-hands. Đặt câu hỏi cho team: 'Mỗi PR mới em đề xuất check 1 question: thay vì copy component này từ product khác, có thể contribute lên DS package được không?' Pilot 2 tháng phase 1 — Button, Input, Card centralized. 3 team adopt, 1 team chậm — em không ép, em help họ async khi rảnh. Em report progress hàng tháng ở all-hands."
>
> **R**: "6 tháng sau, 4 product đều dùng DS v2 cho core component. Bundle giảm 15% trung bình. Designer chỉ phải design 1 lần thay vì 4 lần variant. Em được promote Tech Lead. Bài học: **không có authority thì phải có credibility + data + small wins**. Không big bang. Bring stakeholder along, không push."

### Tips

- Initiative phải tự em propose (không phải sếp giao).
- Có data để justify, không chỉ "em nghĩ đây là tốt".
- Phải kể được **trade-off và pushback** — không có pushback = không real.
- Outcome có **business + people** impact.

---

## Câu 3: Em có productive feedback cho team chưa? `[Senior]`

### Câu hỏi

> Kể về một lần em đưa feedback khó (negative) cho teammate. Em handle thế nào?

### Interviewer đang test gì

- Có courage để give feedback không.
- Có biết cách deliver không (sandwich vs direct).
- Có theo dõi follow-up không.
- Có self-awareness về bias không.

### Đáp án mẫu (STAR)

> **S**: "Senior dev cùng team em (gọi là A) có habit submit PR rất to — 1000-3000 dòng, gộp nhiều unrelated change. Em review rất khó, hay miss bug. Junior dev trong team không dám review PR của A vì không hiểu nổi. Code review queue ngày càng chậm vì PR A backlog."
>
> **T**: "Em là tech lead. Em phải có conversation với A — nhưng A senior hơn em, lâu năm hơn em ở công ty."
>
> **A**: "Em không gửi feedback qua Slack — em request 1-1 30 phút. Em prepare: list 5 PR gần nhất của A, mỗi PR em note 'PR này gom feature X + refactor Y + fix Z' — fact, không subjective. Trong meeting em mở: 'Em muốn share observation và muốn nghe quan điểm anh.' Em present data — không phán xét. 'Em thấy PR anh gần đây trung bình 1500 dòng, mix nhiều concern. Em personal review rất khó tách changes. Junior trong team em hỏi em xem có thể review giúp.' Em im. A defensive ban đầu: 'Anh viết feature complete trong 1 PR cho atomicity'. Em không argue — em ask: 'Em hiểu — anh có concern gì nếu split PR? Em hỗ trợ được gì?' A nói thực ra anh không biết split PR như thế nào với feature lớn. Đây là gap kỹ năng, không phải intentional. Em propose: tuần tới em pair với A 1 buổi 1h, show technique split: stack PR theo dependency, base PR refactor trước rồi feature, feature flag để merge incremental. A nhận. Sau 2 tuần A bắt đầu submit PR ~300-500 dòng. Review queue cải thiện."
>
> **R**: "3 tháng sau, A là người split PR tốt nhất team. Anh ấy mentor junior khác về habit này. Quan hệ em + A không tổn hại — A thank em sau retro 'Em assertive nhưng không attack ego anh.' Bài học: **feedback dạng observation + curiosity tốt hơn judgement**. 'Em quan sát X, anh thấy thế nào?' mở dialogue; 'PR anh quá to' đóng dialogue."

### Tips

- Câu chuyện phải có **escalation thật** — feedback nho nhỏ không impressive.
- Highlight **process**: chuẩn bị, deliver, follow-up.
- Result phải có **relationship preservation** — không win at cost of relationship.

---

## Câu 4: Em handle thế nào khi không đồng ý với manager? `[Senior]`

### Câu hỏi

> Manager giao task em nghĩ không nên làm. Em xử lý sao?

### Interviewer đang test gì

- Disagree-and-commit vs blind compliance.
- Communicate up effectively.
- Politics awareness — em có biết khi nào fight vs let go.

### Đáp án mẫu (STAR)

> **S**: "Manager em (gọi là M) yêu cầu rebuild homepage trong 2 tuần — design hoàn toàn mới, không có spec rõ. Lý do: CEO xem competitor và 'thích layout đó'. Em được giao tech lead."
>
> **T**: "Em phải react với decision này."
>
> **A**: "Em không reject ngay — không phải vai trò em. Em request 30 phút 1-1 với M. Em chuẩn bị: cost-benefit, risk. Em không nói 'CEO sai' — em frame: 'Em muốn ensure mình align về goal và risk.' Em present: thứ nhất, current homepage có conversion data tốt (3.2%) — rebuild có thể hurt conversion. Em đề xuất A/B test thay vì replace 100%. Thứ hai, 2 tuần với scope như vậy gây tech debt — không có time test, không design system. Thứ ba, đề xuất alternative: launch competitor-inspired homepage ở '/new' route, A/B test 50/50, có data sau 2 tuần decide. M listen, push back: 'CEO muốn ngay'. Em ask: 'Anh có muốn em explain trade-off này với CEO không? Em sẵn sàng support anh present.' M agreed. Em prepare 1-page summary: option A — full replace (2 tuần, risk conversion), option B — A/B test (3 tuần, low risk, data-driven). M present CEO. CEO chọn option B."
>
> **R**: "A/B test sau 2 tuần: new design conversion thấp hơn 12%. Decision dựa data: tweak design cũ + adopt 2 element từ new. Em save ~3-4 tuần bù lại nếu rebuild rồi rollback. M sau đó include em vào meeting strategy ngay từ đầu — trust grow. Bài học: **disagree đúng cách = present alternative + offer support**, không là argue 'em không làm'."

### Tips

- Không kể câu chuyện em 'refuse' task — đó là red flag.
- Em phải tôn trọng decision-making authority — nhưng raise concern intelligently.
- Outcome phải có **business value** — không phải em "thắng" manager.

---

## Câu 5: Failure / Burnout — em xử lý ra sao? `[Senior]`

### Câu hỏi

> Em đã từng burn-out hoặc thất bại lớn trong sự nghiệp chưa? Cách em hồi phục?

### Interviewer đang test gì

- Self-awareness về sustainable pace.
- Resilience.
- Có healthy boundary với công việc không.

### Đáp án mẫu (STAR)

> **S**: "2 năm trước, em bị burnout. Project deadline gấp, em làm 12h/day trong 3 tháng. Tới cuối em ship được, nhưng sau đó em nghỉ phép 2 tuần và vẫn cảm thấy mệt — không có hứng code, ngại open laptop. Em coi mình failed vì 'không sustainable'."
>
> **T**: "Em recover và quay lại productive."
>
> **A**: "Em đi gặp doctor — diagnose burnout level mild. Đăng ký therapy 6 sessions. Em nhận ra root cause không phải workload — là **boundary**: em accept every meeting, em reply Slack 11pm, em check email weekend. Workload bình thường nhưng không có time recovery. Action em đã làm: thứ nhất, set explicit working hour 9-6, sau 7pm không Slack/email, weekend laptop off. Communicate với team — manager support. Thứ hai, batch communication: chỉ check Slack 3 times/day (10am, 1pm, 4pm) thay vì notification on. Thứ ba, sleep 7-8h non-negotiable. Thứ tư, hobby ngoài tech: em pick lại guitar và climbing 2-3 lần/tuần. Productivity ban đầu giảm — em prepare team về việc này, transparent. Sau 6 tuần, em quay lại baseline. 3 tháng sau em productive hơn trước burnout — vì recovery thật sự + focus hour quality cao hơn."
>
> **R**: "Em không bao giờ burn-out lại trong 2 năm sau. Em vẫn ship được những project lớn, nhưng không sacrifice health. Em viết blog internal về experience — nhiều người DM thank em vì 'em normalize chuyện burnout, em không pretend strong'. Bài học: **sustainable pace là technical skill**. Tốc độ 80% mỗi ngày bền hơn 120% 3 tháng + 0% 2 tháng sau."

### Tips

- Câu chuyện này nhạy cảm — chỉ kể nếu interviewer trông open-minded (startup, công ty modern).
- Không brag về burnout ("em làm 100h/tuần") — pattern xấu.
- Focus **lesson learned** + **system change** chứ không lament.

---

## Câu 6: 5-năm-tới em định làm gì? `[Senior]`

### Câu hỏi

> Em có goal sự nghiệp 5 năm tới là gì? Em muốn vai trò gì?

### Interviewer đang test gì

- Em có self-direction không.
- Career goal có align với company opportunity không.
- Em có thinking dài hạn hay chỉ tactical.

### Đáp án mẫu

> "Em đã suy nghĩ về cái này. **Ngắn hạn (1-2 năm)**: em muốn deepen Senior FE — focus performance engineering và design system ở scale. Em chưa bao giờ làm app trên 1M MAU, đó là gap em muốn close. **Trung hạn (3 năm)**: em muốn move sang Staff Engineer track — không phải people manager. Em enjoy mentoring nhưng không phù hợp full-time manager. Staff Engineer cho phép em vẫn deep technical, đồng thời có impact wider qua RFC, cross-team initiative, mentor multiple team. Em đã observe Staff em hiện tại — họ define technical direction, không phải code mỗi ngày. **Dài hạn (5 năm)**: em chưa chắc chắn 100% — có thể Principal Engineer hoặc startup co-founder. Em đang khám phá entrepreneurship qua side project (em đang build app ngôn ngữ với 5k user). Em không panic về uncertainty 5 năm — em focus skill building giúp em flexible. Specifically em đang invest vào: system design ở scale, technical leadership communication, product sense — 3 cái sẽ valuable cho cả 2 path. Về company này: em thấy fit ngắn hạn — team có Staff level em có thể học từ, codebase scale em chưa từng làm. Trung hạn em muốn discuss path Staff với manager khi đến lúc đó."

### Tips

- **Concrete** — không vague "em muốn learn".
- **Aligned** với company opportunity — nếu công ty không có Staff track, đừng nói goal đó.
- **Honest** về uncertainty — fake "em chắc chắn 100% sẽ ở đây 10 năm" không tin được.
- Highlight **skill building**, không title chase.

---

## Bonus: Câu hỏi nhạy cảm

### "Em đã từng bị fire không?"

> Câu này hiếm. Trả lời: nếu đã, honest — context, lesson. Không đổ lỗi. Nếu chưa, trả lời ngắn.

### "Em đang offers từ công ty khác không?"

> Không khoe. Nếu có, share honestly nhưng không là leverage. "Em đang phỏng vấn 2 nơi khác. Em ưu tiên fit + opportunity, không phải highest offer."

### "Tại sao em rời công ty hiện tại?"

> Không bao giờ nói xấu công ty/sếp cũ. Frame positive: "Em đã học rất nhiều ở X. Em đang tìm opportunity về [growth/scale/specific challenge] mà X không có ở pipeline."

### "Em ngại gì khi join company này?"

> Có concern là OK — sign of due diligence. Concrete + invite discussion: "Em đọc Glassdoor thấy có complaint về work-life balance. Anh có insight gì cho em?"

---

## Closing thought

Behavioral interview test 3 thứ:

1. **Self-awareness** — em hiểu mình strength + weakness.
2. **Collaboration** — em work tốt với team thực sự, không lý thuyết.
3. **Growth mindset** — em học từ mistake và evolve.

Câu trả lời tốt: STAR + concrete number/example + lesson learned. Câu trả lời tệ: abstract adjective ("em hard worker"), blame others, no introspection.

**Phỏng vấn behavioral là conversation, không exam.** Listen interviewer cẩn thận, hỏi lại nếu cần clarify, và phản hồi như đang chat với senior trong team thay vì đang trả bài.
