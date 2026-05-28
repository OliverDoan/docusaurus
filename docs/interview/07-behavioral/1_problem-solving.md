---
sidebar_position: 1
title: "1. Problem Solving & Technical Judgement"
---

# Problem Solving & Technical Judgement

> *Phỏng vấn behavioral không phải để test kiến thức — là để xem bạn ra quyết định thế nào dưới áp lực thực tế. Trả lời lý thuyết suông sẽ bị trừ điểm. Phải có câu chuyện cụ thể.*

---

## Cấu trúc STAR — em phải nhớ

Mọi câu trả lời behavioral nên theo **STAR**:

- **S**ituation — Context, bối cảnh.
- **T**ask — Em được giao gì, vai trò.
- **A**ction — Em làm gì cụ thể (đây là phần dài nhất).
- **R**esult — Kết quả + bài học.

Tránh:
- Trả lời lý thuyết ("Em sẽ debug bằng cách...") — interviewer hỏi **đã làm gì**, không phải sẽ làm gì.
- Đổ lỗi cho team/sếp/khách hàng.
- Câu trả lời quá ngắn (dưới 30 giây) hoặc quá dài (trên 3 phút).

---

## Câu 1: Kể về một bug khó em đã debug `[Senior]`

### Câu hỏi

> Kể anh nghe về một bug em từng debug mà em nhớ nhất. Khó ở đâu, em giải quyết thế nào?

### Interviewer đang test gì

- Quá trình debug có **systematic** không (random click ≠ engineer).
- Có đo lường, hypothesis-driven không.
- Có học gì từ bug đó cho lần sau không.
- Có giao tiếp với team/stakeholder trong lúc debug không.

### Đáp án mẫu (STAR)

> **S** (Situation): "Quý 3 năm ngoái, app production của em bị bug intermittent — cứ 100 user thì có 2-3 user báo cart bị mất sản phẩm sau khi navigate đi rồi quay lại. Không reproduce được local, không reproduce được staging. Tester chạy 50 lần OK, user vẫn báo. Đã 2 tuần, support tickets tăng dần."
>
> **T** (Task): "Em được team lead giao lead investigation vì em vừa làm xong feature cart 3 tháng trước, được coi là expert nhất."
>
> **A** (Action): "Em không guess. Step 1: gom data — kéo Sentry filter user bị bug, xem device/browser pattern. Phát hiện 90% là iOS Safari, đặc biệt iPad. Step 2: hypothesis 1 — Safari ITP (Intelligent Tracking Prevention) clear localStorage. Em add Sentry custom event log mỗi action liên quan cart, deploy. 24h sau có data: localStorage không bị clear, vẫn còn cart data ở storage. Hypothesis 1 sai. Step 3: hypothesis 2 — race condition. Em đọc lại code, thấy `setCart` của Zustand store gọi từ effect, và navigation event cũng trigger sync. Trên iOS Safari, BFCache (back/forward cache) restore page giữ React tree cũ nhưng storage có thể đã update từ tab khác → state mismatch. Step 4: viết test reproduce: open app → cart có item → mở tab mới cùng URL → empty cart trong tab mới → quay lại tab cũ → BFCache restore → cart hiển thị empty. Bingo, reproduce được. Step 5: fix bằng `pageshow` event listener — khi BFCache restore, force re-read storage và hydrate Zustand. Test, deploy. Step 6: theo dõi 1 tuần — support ticket về cart drop về 0."
>
> **R** (Result): "Bug fix thành công, em viết postmortem doc cho team về BFCache pitfalls — không ai biết cái này trước đó. Sau đó em update CI test setup thêm iOS Safari + BFCache scenarios. Bài học: **measure before guess**. Em đã suýt fix sai (clear ITP storage) nếu không nhìn data."

### Tips

- Bug phải có **độ khó kỹ thuật rõ** — không phải "em không nhớ commit, lý do lỗi merge conflict".
- Process phải **systematic** — hypothesis, measure, eliminate.
- Có **takeaway** cho team (postmortem, test update).

---

## Câu 2: Em đã từng làm wrong decision technical chưa? `[Senior]`

### Câu hỏi

> Kể một lần em đưa quyết định technical mà sau đó nhận ra sai. Em xử lý thế nào?

### Interviewer đang test gì

- Em có **own** decision sai không, hay đổ lỗi.
- Em **học** được gì.
- Em có **revert/refactor** được không, hay double-down.
- Em có communicate với team về mistake không.

### Đáp án mẫu (STAR)

> **S**: "Đầu năm ngoái, em propose chuyển toàn bộ form từ react-hook-form sang Formik. Lý do em đưa ra: API Formik 'declarative hơn', team em quen Formik từ project trước, ecosystem nhiều plugin."
>
> **T**: "Em là tech lead front-end, được team trust với decision. Em viết RFC, lead 3 dev migrate trong 6 tuần — ~40 form."
>
> **A**: "Migration xong, em phát hiện vấn đề: Formik re-render toàn bộ form mỗi keystroke (do design state ở context). Form lớn (15+ field) lag thấy rõ trên device yếu. Validation async cũng có race condition. Em first response là cố optimize: useMemo cho field, debounce validation, split form thành sub-component. Sau 2 tuần workaround, em nhận ra root cause là architectural difference — react-hook-form dùng uncontrolled input + ref, Formik dùng controlled. Em không thể fix architecturally mà không rewrite tương đương revert. **Em quyết định revert**. Em viết doc honest cho team: 'Lựa chọn của em sai vì em chưa benchmark performance trên real device, chưa research deep enough trade-off architectural. Em propose revert.' Có pushback — team đã đầu tư 6 tuần. Em present số liệu: render time với Formik 230ms p75 vs react-hook-form 60ms, INP cũng worse. Đồng ý revert."
>
> **R**: "Revert mất thêm 4 tuần. Total ~10 tuần lost productivity. Em viết postmortem cho engineering blog nội bộ, key learning: 'Benchmark before commit to library migration', 'Optimize for performance trên real device, không Macbook M1'. Sau đó em đề xuất template RFC mới có section 'performance benchmark' bắt buộc. Em vẫn được team trust — sếp comment lúc review: 'Em recover mistake đúng cách thay vì hide.' Bài học: own mistake fast, revert sớm chứ đừng cố cứu."

### Tips

- Không trả lời "Em chưa bao giờ wrong" — fake và mất tin tưởng ngay.
- Câu chuyện phải có **scope đủ lớn** — bug nhỏ revert là không impressive.
- Phải có **takeaway hệ thống** (process change, template, doc) — không chỉ "em sẽ cẩn thận hơn".

---

## Câu 3: Disagreement với teammate `[Senior]`

### Câu hỏi

> Kể về một lần em bất đồng technical với senior/colleague. Em xử lý thế nào?

### Interviewer đang test gì

- Em có ego control được không.
- Disagree-and-commit hay stubborn.
- Có data-driven khi argue không.
- Sau cùng có gắn kết với decision team chưa.

### Đáp án mẫu (STAR)

> **S**: "Project trước, một senior dev propose dùng Redux Toolkit cho toàn bộ state — bao gồm cả server state (data từ API). Em — Mid-level lúc đó — không đồng ý."
>
> **T**: "Em phải convince team trong design review."
>
> **A**: "Em không argue trực tiếp 'Redux server state là anti-pattern'. Thay vào đó em chuẩn bị: thứ nhất, document hiện trạng — codebase đang có ~30 slice quản lý API data, mỗi slice ~150 dòng boilerplate (action, reducer, thunk, selector). Đếm thử số dòng quản lý server state: ~4500 dòng. Thứ hai, em prototype side-by-side: cùng feature (user list với filter, pagination, refresh), 1 phiên bản Redux + thunk, 1 phiên bản TanStack Query. Redux ~200 dòng, TanStack Query ~30 dòng + cache + dedupe + background refetch free. Thứ ba, em chuẩn bị data Kent C. Dodds và Dan Abramov (creator Redux) đều khuyên không dùng Redux cho server state — references uy tín. Trong meeting em present: 'Em có concern về proposal. Đây là data + prototype.' Senior pushback: 'Team đã quen Redux, train lại tốn thời gian.' Em respond: 'Em đề xuất hybrid — Redux Toolkit cho client state (UI, auth), TanStack Query cho server state. Em đứng ra hỗ trợ team 1 tháng đầu, viết training doc.' Sau debate, team agree thử pilot 2 feature."
>
> **R**: "Pilot thành công, server state code giảm 70%. Sau 3 tháng migrate hết. Senior dev em disagree với, sau này feedback positive về cách em handle: 'Em không attack ego anh, em present data. Đó là cách argue đúng.' Em vẫn coi anh ấy là mentor. Bài học: **disagree với data + alternative concrete, không vibes**."

### Tips

- Đừng kể câu chuyện em **thắng** colleague — câu chuyện em **collaborate** và team chọn được giải pháp tốt mới impressive.
- Nếu kết quả là em sai, đó cũng OK — interviewer thích nghe "em disagree, em đưa data, team chọn cái khác, em commit và sau đó realize team đúng".
- Không bao giờ nói xấu colleague trong câu chuyện.

---

## Câu 4: Học công nghệ mới — em làm sao? `[Intermediate]`

### Câu hỏi

> Lần gần nhất em phải học công nghệ mới cho công việc — kể quá trình.

### Interviewer đang test gì

- Có self-learning capability không.
- Có pattern hiệu quả không hay random Googling.
- Có biết khi nào stop learning + ship được không.

### Đáp án mẫu (STAR)

> **S**: "Tháng trước, team em decide migrate từ Pages Router sang App Router trong Next.js. Em chưa từng làm App Router production."
>
> **T**: "Em được assign lead migration — research, propose plan, kick off."
>
> **A**: "Em chia thành 4 stages. **Stage 1 — Core concept** (3 ngày): em đọc Next.js docs từ đầu, không skip. Take notes (mental model) về RSC vs Client Component boundary, file convention (page/layout/loading/error), data fetching pattern. Em build mini todo app demo để cảm nhận. **Stage 2 — Compare** (2 ngày): em đọc migration guide chính thức, list breaking change. Em chạy thử migrate 1 page nhỏ trong codebase nội bộ để biết pain point — ví dụ `getServerSideProps` không tương đương 1-1 với async component. **Stage 3 — Deep dive** (3 ngày): em focus pain point cụ thể của codebase — caching behavior (Next 14 default), Server Action vs API Route, hydration mismatch. Đọc blog Vercel team, Dan Abramov twitter. Stack Overflow + GitHub issues cho real-world bug. **Stage 4 — Apply** (1 tuần): em viết RFC migration plan cho team, kèm trade-off và rủi ro. Lead migration 1 sprint cho 5 page pilot. Document gotcha gặp phải. Sau pilot, em viết internal guide cho team migrate sprint sau."
>
> **R**: "Migration 30+ page xong sau 5 sprint, không major bug production. Em viết blog internal được teammate dùng tham khảo. Bài học của em: **học pattern 'breadth first, then depth on pain points'** — không cố master mọi feature trước khi apply. Apply early, học pain point ngay khi gặp."

### Tips

- Cụ thể về **resource** (docs, blog, twitter accounts) — không vague "em Google".
- Có **timeline** rõ — chứng tỏ em manage learning có discipline.
- Kết quả phải tangible — ship được, write doc, train team.

---

## Câu 5: Stress / pressure deadline `[Intermediate]`

### Câu hỏi

> Kể về một lúc em chịu pressure cao — deadline gấp, vấn đề khó. Em xử lý ra sao?

### Interviewer đang test gì

- Em có panic không hay structured.
- Có communicate với stakeholder không.
- Có ưu tiên đúng không.
- Có nhận support khi cần không.

### Đáp án mẫu (STAR)

> **S**: "Q4 năm ngoái, công ty em làm campaign Black Friday. 3 ngày trước launch, QA phát hiện checkout flow bị bug — payment gateway integration không handle case timeout, một số user pay xong nhưng order không recorded. Risk cực cao: nếu launch với bug này, có thể mất tiền user."
>
> **T**: "Em là FE lead, được giao lead fix + coordinate với BE team."
>
> **A**: "Em chia 2 hour đầu: **triage** thay vì rush code. Em call meeting 30 phút với PM, BE lead, QA lead. List ra: severity (high), reproduce rate (~5%), business impact (mất tiền + customer trust). Quyết định cùng PM: option 1 = delay launch 1 tuần; option 2 = launch với manual ops backup (BE team có người monitor + manual reconcile failed payment). Chọn option 2 vì campaign deadline marketing không di chuyển được. Em break work: BE team — add idempotency key + retry logic; FE em — UI clear nếu payment pending (loading state cụ thể, không misleading); QA — extended test scenario; em coordinate hourly checkpoint. Em không cố lead all alone — em ask BE lead làm phần BE, em focus FE. Em ngủ đủ — không hùng dũng overnight code, vì code lúc mệt là bug source. 3 ngày: ngày 1 implementation, ngày 2 test + edge case, ngày 3 buffer + UAT. Em chủ động report tiến độ với CTO mỗi sáng — không để sếp lo và hỏi."
>
> **R**: "Launch on time. Trong 72h sau launch, gặp 12 failed payment được manual reconcile thành công bởi BE ops, không mất xu nào cho user. Sau campaign, em đề xuất add E2E test cho payment flow vào CI nightly + sentry alert cho payment timeout — không để bug giống lặp lại. Bài học: **pressure không có nghĩa skip process**. Triage + communicate vẫn quan trọng hơn 'cày như trâu'."

### Tips

- Không brag về work overtime / không ngủ — pattern xấu, interviewer thấy ngay.
- Highlight **communication** — proactive update stakeholder, không hide problem.
- Có **system improvement** sau crisis — không chỉ 'em đã survive'.

---

## Câu 6: Em ngại nhất kỹ thuật gì? `[Senior]`

### Câu hỏi

> Có lĩnh vực kỹ thuật nào em thấy khó với mình hoặc lo lắng không?

### Interviewer đang test gì

- Em có self-awareness không.
- Có growth mindset không.
- Có plan để improve không.

### Đáp án mẫu

> "Em thẳng thắn: **system design ở scale lớn** là weak spot. Em đã làm app vài chục nghìn DAU OK, nhưng scale ở mức Facebook/Netflix em chỉ học qua đọc — chưa thực sự ship. Mock interview System Design em vẫn miss nhiều detail như sharding strategy, eventual consistency trade-off. Cách em improve: thứ nhất, em đọc System Design Interview của Alex Xu — book có structured approach. Thứ hai, em theo blog engineering của Discord, Netflix, Cloudflare — case study real. Thứ ba, em đăng ký mock interview Pramp + chat với senior ở công ty hiện tại để feedback. Em đã có plan: 6 tháng tới em apply nội bộ vào platform team chuyên về infrastructure để build hands-on experience. Em nghĩ honesty về gap quan trọng hơn pretend strong everywhere — interviewer Senior đều biết không ai master mọi thứ. Quan trọng là em **biết** gap và có plan close gap."

### Tips

- **Honest** — không trả lời "em không có weakness", "em quá perfectionist" — clichéd và fake.
- Weakness phải có **plan improve** rõ ràng, không chỉ thừa nhận.
- Không pick weakness là core requirement của job — ví dụ phỏng vấn FE mà bảo "em yếu HTML/CSS" là kill mình.

---

## Bonus: Câu hỏi nên hỏi ngược interviewer

Cuối phỏng vấn thường có "Em có câu hỏi gì cho anh không?" — **đừng bao giờ trả lời không có**. Chuẩn bị 3-5 câu hỏi.

Câu hỏi tốt:

1. **Process**: "Một feature điển hình từ idea tới production mất bao lâu? Process gồm những bước nào?"
2. **Team & growth**: "Team em sẽ join hiện đang focus vào challenge gì? Roadmap technical 6 tháng tới là gì?"
3. **Engineer culture**: "Team có code review mandatory không? Cách team handle disagreement technical?"
4. **Bug & quality**: "Lần gần nhất team có production incident là gì? Cách handle như thế nào?"
5. **About interviewer**: "Anh/chị join công ty này được bao lâu, điều gì giữ anh/chị lại?"

Tránh:

- Salary/benefits ở vòng technical đầu — để cuối với HR.
- Câu trả lời được trên website công ty ("Công ty này làm gì?").
- "Em có cần biết gì thêm về company không?" — passive, không thể hiện em engaged.

---

## Bẫy chung khi trả lời behavioral

| Sai lầm                                                | Đúng là                                                              |
| ------------------------------------------------------ | -------------------------------------------------------------------- |
| Câu trả lời lý thuyết "em sẽ..."                       | STAR — câu chuyện cụ thể đã xảy ra                                   |
| Đổ lỗi cho colleague/sếp                               | Own decision, focus solution                                          |
| "Em chưa bao giờ wrong"                                | Honest mistake + learning = trust                                    |
| Câu trả lời 5 giây hoặc 10 phút                        | 1.5-2.5 phút là sweet spot                                            |
| Không có "result" cuối                                 | Luôn đóng với impact + bài học                                        |
| Trả lời generic ("em communicate tốt", "em hard worker") | Concrete example tốt hơn 100 lần adjective                          |
