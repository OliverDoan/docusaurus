---
sidebar_position: 1
title: "1. Branching Strategies"
---

# Branching Strategies

> *Nhóm câu này kiểm tra xem ứng viên có hiểu bản chất của từng branching strategy, biết chọn đúng chiến lược theo quy mô team và tần suất deploy, và quan trọng nhất là biết khi nào nên thay đổi chiến lược thay vì áp dụng máy móc theo "best practice" trên mạng.*

:::note[Ghi nhớ nhanh]

- ⭐ **Chọn chiến lược theo tần suất deploy và quy mô team** — không có chiến lược "đúng tuyệt đối", deploy càng thường xuyên thì nhánh càng nên ngắn.
- **Git Flow** — nhiều nhánh dài hạn (`main`, `develop`) + `feature/*`, `release/*`, `hotfix/*`; hợp release theo phiên bản, nặng nề với team CI/CD liên tục.
- **GitHub Flow** — chỉ `main` + nhánh feature ngắn, merge qua PR rồi deploy ngay; đơn giản, hợp continuous deployment.
- **Trunk-based development** — commit thẳng/nhánh rất ngắn vào một trunk, dựa vào feature flag; tối ưu cho deploy nhiều lần/ngày.
- **Nhánh dài hạn = nợ merge** — nhánh sống càng lâu càng dễ conflict và trôi xa `main`.

:::

---

## Câu 1: Tổng quan branching strategies phổ biến `[Basic]`

### Câu hỏi

> "Git Flow là gì? Em biết những branching strategy phổ biến nào? So sánh giúp anh."

### Giải thích lý thuyết

Branching strategy là quy ước về cách team tạo, đặt tên và merge các nhánh để phối hợp công việc và phát hành phần mềm. Có 4 chiến lược phổ biến nhất:

**1. Git Flow** (Vincent Driessen, 2010): Mô hình nhiều nhánh dài hạn (long-lived) và nhánh hỗ trợ.

| Loại nhánh | Vai trò | Vòng đời |
|---|---|---|
| `main` (master) | Code production, mỗi commit là 1 release đã tag | Vĩnh viễn |
| `develop` | Nhánh tích hợp, chứa code cho release tiếp theo | Vĩnh viễn |
| `feature/*` | Phát triển tính năng mới, branch từ `develop` | Ngắn-trung hạn |
| `release/*` | Stabilize trước khi phát hành, branch từ `develop` | Ngắn hạn |
| `hotfix/*` | Sửa lỗi khẩn cấp trên production, branch từ `main` | Rất ngắn |

**2. GitHub Flow**: Cực kỳ đơn giản. Chỉ có `main` luôn deployable, mọi thay đổi đi qua feature branch ngắn hạn → Pull Request → review → merge → deploy ngay.

**3. GitLab Flow**: Bổ sung cho GitHub Flow các nhánh môi trường (`staging`, `production`) hoặc nhánh release theo version, dùng để kiểm soát promote code qua từng môi trường.

**4. Trunk-based Development**: Mọi người commit trực tiếp (hoặc qua branch sống dưới 1-2 ngày) vào một nhánh chung (`trunk`/`main`). Tính năng chưa xong được giấu sau feature flags. Là nền tảng của CI/CD và DevOps hiện đại.

| Tiêu chí | Git Flow | GitHub Flow | GitLab Flow | Trunk-based |
|---|---|---|---|---|
| Số nhánh dài hạn | 2 (`main`+`develop`) | 1 (`main`) | 1-3 (môi trường) | 1 (`trunk`) |
| Độ phức tạp | Cao | Thấp | Trung bình | Thấp (về nhánh) cao (về tooling) |
| Tần suất deploy | Theo chu kỳ release | Liên tục | Liên tục/có gate | Nhiều lần/ngày |
| Hợp với team | Lớn, nhiều version song song | Nhỏ-vừa, web/SaaS | Vừa, cần kiểm soát môi trường | Mọi quy mô nếu CI mạnh |
| Rủi ro merge conflict | Cao (nhánh sống lâu) | Thấp | Thấp | Rất thấp |

> **Insight phỏng vấn:** Đừng chỉ liệt kê. Người phỏng vấn muốn nghe bạn nói rằng "không có chiến lược nào tốt nhất tuyệt đối — nó phụ thuộc vào tần suất deploy và độ chín của CI/CD". Git Flow ra đời thời còn release đóng gói theo phiên bản (desktop app), còn xu hướng hiện đại nghiêng về Trunk-based vì deploy liên tục.

### Code minh hoạ

```bash
# Git Flow: tạo feature từ develop, hoàn tất rồi merge lại develop
git checkout develop
git checkout -b feature/login
# ... code ...
git checkout develop
git merge --no-ff feature/login

# Git Flow: hotfix branch từ main, merge cả vào main và develop
git checkout main
git checkout -b hotfix/critical-bug
# ... fix ...
git checkout main && git merge --no-ff hotfix/critical-bug && git tag v1.0.1
git checkout develop && git merge --no-ff hotfix/critical-bug

# GitHub Flow: cực gọn
git checkout main && git pull
git checkout -b fix/typo
# ... code ... -> mở PR -> review -> merge -> deploy ngay
```

```text
Git Flow:
  main     ───●─────────────────●──────●──  (tag v1.0, v1.1)
              \                 / \    /
  release      \         ●──●──●   \  /
                \       /           \/
  develop  ──●───●──●──●─────────●──●────────
              \  /         \    /
  feature      ●●           ●●●

GitHub Flow:
  main  ──●──●──●──●──●──  (luôn deployable)
           \   \   \
  feature   ●   ●   ●  (PR ngắn, merge nhanh)
```

### Đáp án mẫu

> "Dạ branching strategy là quy ước team dùng để quản lý nhánh khi phối hợp và phát hành. Em biết 4 cái phổ biến: Git Flow có hai nhánh dài hạn là main và develop, cùng feature, release, hotfix — phù hợp team lớn release theo version nhưng khá nặng. GitHub Flow đơn giản nhất, chỉ một nhánh main luôn deployable, mọi thay đổi qua feature branch ngắn và PR. GitLab Flow thêm nhánh môi trường để kiểm soát promote. Trunk-based thì mọi người merge nhanh vào một nhánh chung, giấu tính năng chưa xong sau feature flag, hợp với deploy liên tục. Theo em không có cái nào tốt nhất tuyệt đối, chọn cái nào phụ thuộc tần suất deploy và độ chín của CI/CD."

---

## Câu 2: GitHub Flow vs Git Flow cho startup nhỏ `[Intermediate]`

### Câu hỏi

> "Dự án startup 5 người, deploy gần như hàng ngày. Theo em nên chọn GitHub Flow hay Git Flow? Vì sao?"

### Giải thích lý thuyết

Với startup nhỏ deploy liên tục, **GitHub Flow (hoặc Trunk-based) gần như luôn là lựa chọn đúng**, còn Git Flow là overhead không cần thiết. Lý do nằm ở sự lệch pha giữa cấu trúc nhánh và nhịp độ phát hành.

| Tiêu chí | Git Flow | GitHub Flow / Trunk-based |
|---|---|---|
| Số nhánh phải quản lý | main + develop + release + hotfix | chỉ main + feature ngắn |
| Overhead mỗi lần ship | Merge feature→develop→release→main, nhiều bước | Merge thẳng PR vào main |
| Tốc độ feedback | Chậm (code "ngủ" trong develop chờ release) | Nhanh (deploy ngay sau merge) |
| Phù hợp CI/CD | Khó: phải build/deploy nhánh nào? | Tự nhiên: mỗi merge vào main = 1 deploy |
| Rủi ro với team nhỏ | `develop` thành nhánh sống lâu → conflict, code ít người review | Branch ngắn, review nhanh, ít conflict |
| Nhiều version song song | Hỗ trợ tốt | Không, nhưng startup hiếm khi cần |

Bản chất Git Flow được thiết kế cho phần mềm **phát hành theo phiên bản đóng gói** (desktop, library, mobile cần qua app store), nơi cần "đóng băng" một bản release để stabilize, và phải support nhiều version cũ. Startup web/SaaS deploy hàng ngày thì không có nhu cầu đó — nhánh `develop` và `release` chỉ tạo thêm bước trung gian, làm code lâu lên production hơn, vi phạm tinh thần "ship nhanh, học nhanh" của startup.

> **Insight phỏng vấn:** Câu trả lời ăn điểm là chỉ ra Git Flow giải quyết bài toán *versioning và stabilization* mà startup deploy liên tục **không có**. Áp Git Flow vào đây là dùng dao mổ trâu giết gà. Đề cập thêm: với 5 người, một nhánh `develop` sống lâu sẽ tích tụ conflict và làm code review dồn cục.

### Code minh hoạ

```bash
# GitHub Flow cho startup: vòng đời 1 tính năng cực ngắn
git checkout main && git pull --rebase
git checkout -b feat/checkout-coupon

# code nhỏ gọn, commit thường xuyên
git add . && git commit -m "feat: add coupon validation"
git push -u origin feat/checkout-coupon

# Mở PR -> CI chạy test -> 1 đồng nghiệp review -> merge squash
# Merge vào main TỰ ĐỘNG trigger pipeline deploy production
```

```text
Startup 5 người, deploy hàng ngày:

GitHub Flow (gọn, hợp):
  main  ──●──●──●──●──●── deploy mỗi merge
           \  \  \
            ●  ●  ●   feature 1-2 ngày

Git Flow (thừa bước, code lên prod chậm):
  feature -> develop -> release -> main -> deploy
   (ship 1 dòng code phải qua 3 lần merge)
```

### Đáp án mẫu

> "Dạ em chọn GitHub Flow, hoặc Trunk-based nếu CI đủ mạnh. Git Flow sinh ra cho phần mềm release theo version đóng gói, cần nhánh develop và release để stabilize và support nhiều phiên bản — startup deploy hàng ngày thì không có nhu cầu đó. Với 5 người, thêm nhánh develop sống lâu chỉ làm tích tụ conflict và dồn cục code review, đồng thời code lên production chậm hơn vì phải qua nhiều lần merge. GitHub Flow chỉ có main luôn deployable, feature branch ngắn 1-2 ngày, merge PR là deploy luôn — khớp với nhịp ship nhanh và pipeline CI/CD của startup. Git Flow ở đây là overhead không tạo ra giá trị."

---

## Câu 3: Khi nào chuyển từ Git Flow sang Trunk-based `[Senior]`

### Câu hỏi

> "Team anh đang dùng Git Flow nhưng deploy ngày càng chậm và suốt ngày dính conflict khi merge. Theo em khi nào nên chuyển sang Trunk-based development, và chuyển thế nào để không vỡ trận?"

### Giải thích lý thuyết

**Dấu hiệu Git Flow đang gây hại (cần cân nhắc chuyển):**

- Feature branch sống quá lâu (nhiều ngày tới vài tuần) → khi merge phát sinh "merge hell".
- `develop` lệch xa `main`, mỗi lần release là một cuộc "big bang merge" đầy rủi ro.
- Deploy thưa và đáng sợ — vì mỗi lần deploy gom quá nhiều thay đổi.
- Code review dồn cục vì PR quá to.
- Conflict lặp đi lặp lại trên cùng vùng code do nhiều nhánh dài chạy song song.

Đây chính là các triệu chứng của **batch size lớn**: gom nhiều thay đổi rồi merge một lần. Trunk-based chữa tận gốc bằng cách giảm batch size — merge nhỏ, thường xuyên, vào một nhánh chung.

**Điều kiện tiên quyết của Trunk-based (không có thì chuyển sẽ vỡ):**

| Điều kiện | Vì sao bắt buộc |
|---|---|
| Feature flags | Cho phép merge code chưa hoàn thiện vào trunk mà không lộ ra user |
| CI mạnh, nhanh | Mỗi commit phải được build + test tự động trong vài phút |
| Test tự động độ phủ cao | Trunk luôn phải release-ready; thiếu test thì merge nhanh = release bug nhanh |
| Review nhanh / merge queue | Branch phải sống ngắn (dưới 1-2 ngày); review chậm sẽ ép branch sống lâu |
| Văn hóa commit nhỏ | Vỡ tính năng to thành các lát nhỏ, merge được độc lập |

**Lộ trình migrate dần (không big-bang):**

1. Đặt mục tiêu rút ngắn tuổi thọ branch (ví dụ tối đa 2 ngày) và giới hạn kích thước PR.
2. Củng cố CI: bắt buộc test pass mới merge, rút thời gian pipeline.
3. Đưa feature flags vào để tách "deploy" khỏi "release".
4. Bỏ nhánh `release` trước — chuyển sang release từ `main` bằng tag.
5. Cuối cùng gộp `develop` vào `main`, mọi người làm việc trên short-lived branch từ `main`.

> **Insight phỏng vấn:** Câu này test sự chín chắn. Trả lời sai phổ biến là "Trunk-based tốt hơn nên chuyển luôn". Senior phải nhấn mạnh: **Trunk-based không phải nguyên nhân giúp deploy nhanh, nó là hệ quả của CI/test/feature-flag tốt.** Chuyển sang Trunk-based mà thiếu nền tảng đó thì chỉ đổi "merge hell" thành "production hell". Phải migrate dần, không big-bang.

### Code minh hoạ

```text
TRƯỚC (Git Flow, batch lớn -> merge hell):
  develop ──●────────────────────●  big-bang merge (đau)
             \                  /
  feature     ●──●──●──●──●──●──●   nhánh sống 3 tuần, lệch xa

SAU (Trunk-based, batch nhỏ -> merge êm):
  main ──●─●─●─●─●─●─●─●──  merge nhiều lần/ngày
          \ \ \ \ \ \
           ● ● ● ● ● ●   nhánh sống < 1 ngày
           (code chưa xong giấu sau feature flag)
```

```javascript
// Feature flag: merge code chưa xong vào trunk mà không lộ cho user
if (featureFlags.isEnabled("new-checkout", user)) {
  renderNewCheckout()   // code mới, đang merge dần vào main
} else {
  renderLegacyCheckout()
}
```

```bash
# Sau migrate: làm việc trên short-lived branch, rebase thường xuyên để gần main
git checkout main && git pull --rebase
git checkout -b feat/small-slice
# ... commit nhỏ, push, mở PR, merge trong ngày ...
git checkout main && git pull --rebase   # kéo về liên tục để không lệch
```

### Đáp án mẫu

> "Dạ dấu hiệu rõ nhất là feature branch sống quá lâu, develop lệch xa main, mỗi lần release là một big-bang merge đầy conflict và deploy thì thưa, đáng sợ — đó là triệu chứng của batch size quá lớn. Trunk-based chữa tận gốc bằng cách merge nhỏ và thường xuyên. Nhưng em sẽ không chuyển ngay, vì Trunk-based không phải nguyên nhân giúp deploy nhanh, nó là hệ quả của CI mạnh, test tự động độ phủ cao và feature flags. Thiếu mấy thứ đó mà chuyển thì chỉ đổi merge hell thành production hell. Lộ trình của em là làm dần: rút ngắn tuổi thọ branch và giới hạn size PR trước, củng cố CI bắt buộc test pass mới merge, đưa feature flag vào để tách deploy khỏi release, bỏ nhánh release chuyển sang tag từ main, cuối cùng mới gộp develop vào main."

---

## Câu 4: Branching strategy cho monorepo nhiều team `[Senior]`

### Câu hỏi

> "Một monorepo có nhiều team cùng làm việc. Theo em nên dùng branching strategy nào, và làm sao để các team không block lẫn nhau?"

### Giải thích lý thuyết

Với monorepo nhiều team, lựa chọn gần như mặc định là **Trunk-based với short-lived branch**. Nhánh dài hạn trong monorepo cực kỳ độc hại vì code base lớn, nhiều người chạm — nhánh sống lâu sẽ lệch và gây conflict trên diện rộng. Vấn đề thật sự không phải "chọn nhánh nào" mà là **làm sao nhiều team chia sẻ một trunk mà không dẫm chân nhau**. Các cơ chế:

| Cơ chế | Giải quyết vấn đề gì |
|---|---|
| **CODEOWNERS theo path** | Mỗi team chỉ review/approve thư mục của mình → review không bị một nhóm làm nghẽn toàn repo |
| **Affected build / CI theo package** | Chỉ build + test phần bị ảnh hưởng (Nx, Turborepo, Bazel) → CI không phình theo kích thước repo |
| **Sparse-checkout / partial clone** | Dev chỉ checkout phần liên quan → repo khổng lồ vẫn nhẹ trên máy |
| **Feature flags** | Team merge code chưa xong vào trunk mà không ảnh hưởng team/feature khác |
| **Merge queue** | Tuần tự hoá merge, test lại trên trạng thái main mới nhất → tránh "semantic conflict" khi nhiều PR merge gần nhau |
| **Short-lived branch** | Giảm batch size, giảm bề mặt conflict |

Điểm tinh tế là **isolation bằng path và flag, không phải bằng nhánh**. Trong monorepo, dùng nhánh dài để cô lập team là phản mô hình — cô lập đúng cách là theo ownership của thư mục (CODEOWNERS) và theo runtime (feature flags), còn về Git thì mọi người vẫn dùng chung một trunk.

> **Insight phỏng vấn:** Người phỏng vấn muốn thấy bạn phân biệt "isolation về source control" (nhánh — nên tối thiểu) với "isolation về ownership và runtime" (CODEOWNERS + feature flags — nên tối đa). Nêu được merge queue và affected-build là tín hiệu bạn đã làm monorepo quy mô thật, không chỉ đọc lý thuyết.

### Code minh hoạ

```text
# .github/CODEOWNERS — mỗi team gác cổng path của mình
/apps/web/          @org/web-team
/apps/mobile/       @org/mobile-team
/packages/payments/ @org/payments-team
/packages/shared/   @org/platform-team   # vùng chung, cần review kỹ
```

```bash
# Sparse-checkout: chỉ lấy phần cần, repo khổng lồ vẫn nhẹ
git clone --filter=blob:none --sparse git@org/monorepo.git
cd monorepo
git sparse-checkout set apps/web packages/shared

# Affected-build: chỉ test phần ảnh hưởng bởi thay đổi
npx nx affected --target=test --base=origin/main
npx turbo run build --filter=...[origin/main]
```

```text
Monorepo + Trunk-based + merge queue:

  main ──●──●──●──●──●──  (1 trunk chung cho mọi team)
          \  \  \  \
  PR queue: [web] -> [payments] -> [mobile]
            test lại trên main mới nhất từng cái
            -> không có semantic conflict khi merge sát nhau
```

### Đáp án mẫu

> "Dạ em chọn Trunk-based với short-lived branch, vì trong monorepo nhánh dài hạn rất độc hại — code base lớn, nhiều người chạm, nhánh sống lâu sẽ lệch và gây conflict diện rộng. Chốt quan trọng là cô lập team không phải bằng nhánh mà bằng path và runtime: dùng CODEOWNERS để mỗi team chỉ gác cổng thư mục của mình nên review không bị nghẽn, dùng affected-build kiểu Nx hoặc Turborepo để CI chỉ chạy phần bị ảnh hưởng thay vì build cả repo, dùng sparse-checkout cho dev khỏi phải tải toàn bộ, và feature flags để team merge code chưa xong mà không ảnh hưởng feature khác. Cuối cùng em đặt merge queue để tuần tự hoá merge và test lại trên main mới nhất, tránh semantic conflict khi nhiều PR merge gần nhau."

---

## Câu 5: Vai trò của release branch `[Intermediate]`

### Câu hỏi

> "Release branch có tác dụng gì? Khi nào team cần nó và khi nào nó chỉ là overhead không cần thiết?"

### Giải thích lý thuyết

Release branch là nhánh được tách ra để **đóng băng phạm vi một bản phát hành** và stabilize nó, trong khi development vẫn tiếp tục trên nhánh chính. Công dụng chính:

| Công dụng | Mô tả |
|---|---|
| Stabilize trước release | Tách ra để chỉ nhận bug fix và tài liệu, không nhận feature mới → "đóng băng" phạm vi |
| Cherry-pick fix | Sửa lỗi trên main rồi cherry-pick vào release branch (hoặc ngược lại) để vá bản sắp ra |
| Song song dev và release | Team vẫn phát triển feature cho version sau trên main, không phải chờ release xong |
| Support nhiều version | Giữ nhánh `release/1.x`, `release/2.x` để vá lỗi cho khách hàng còn dùng version cũ |

**Khi nào cần release branch:**

- Phần mềm phát hành theo phiên bản đóng gói: mobile app (chờ duyệt store), desktop, on-premise, library/SDK.
- Phải support nhiều version song song cho nhiều khách hàng (enterprise).
- Có giai đoạn QA/stabilization rõ rệt, code freeze trước khi ra mắt.

**Khi nào là overhead không cần thiết:**

- Continuous delivery / deploy liên tục cho web/SaaS: mỗi merge vào main là deploy luôn, không có khái niệm "đóng băng phạm vi" → release branch chỉ thêm bước trung gian.
- Team nhỏ, một version duy nhất chạy production → không cần nhánh để stabilize riêng.

> **Insight phỏng vấn:** Đừng trả lời "release branch luôn tốt vì giúp ổn định". Senior nhìn ra nó giải quyết bài toán **nhiều version song song và code freeze**. Nếu bạn deploy liên tục và chỉ có một version chạy thì release branch chỉ làm code lên production chậm hơn. Câu chốt đắt giá: "release branch cần khi bạn không thể vá nhanh được production, ví dụ phải chờ app store duyệt."

### Code minh hoạ

```bash
# Tách release branch để stabilize, đóng băng phạm vi v2.3
git checkout main
git checkout -b release/2.3
# Từ đây release/2.3 CHỈ nhận bug fix, không feature mới

# Fix lỗi trên main rồi cherry-pick sang nhánh release sắp phát hành
git checkout main
git commit -m "fix: null pointer in cart total"   # giả sử hash abc123
git checkout release/2.3
git cherry-pick abc123

# Phát hành: tag và (nếu Git Flow) merge ngược về main
git tag v2.3.0
```

```text
Có release branch (hợp với release theo version):
  main      ──●──●──●──●──●──●──   (vẫn dev v2.4)
               \           /
  release/2.3   ●──●──●──●      chỉ nhận fix -> tag v2.3.0

Continuous delivery (release branch = overhead):
  main ──●──●──●──●──  mỗi merge deploy luôn, KHÔNG cần đóng băng
```

### Đáp án mẫu

> "Dạ release branch dùng để đóng băng phạm vi của một bản phát hành và stabilize nó, trong khi team vẫn tiếp tục dev feature cho version sau trên main. Nó cho phép cherry-pick bug fix vào bản sắp ra mà không kéo theo feature mới, và giữ nhiều nhánh release song song để support các version cũ cho khách hàng. Em cần nó khi phần mềm phát hành theo phiên bản — như mobile app phải chờ store duyệt, desktop, hoặc enterprise on-premise phải support nhiều version. Còn nếu là web SaaS deploy liên tục, mỗi merge vào main là deploy luôn, thì release branch chỉ là overhead làm code lên production chậm hơn vì không có khái niệm đóng băng phạm vi nữa. Nói gọn, release branch cần khi mình không thể vá production nhanh được."

---

## Câu 6: Polyrepo vs Monorepo và git workflow `[Senior]`

### Câu hỏi

> "Polyrepo và Monorepo khác nhau thế nào về git workflow? Khi nào em khuyên team nên migrate từ polyrepo sang monorepo, và chi phí của việc đó là gì?"

### Giải thích lý thuyết

**Polyrepo**: mỗi project/service một repo riêng. **Monorepo**: nhiều project sống chung trong một repo.

| Tiêu chí | Polyrepo | Monorepo |
|---|---|---|
| Versioning | Mỗi repo version độc lập (semver per package) | Một version/commit duy nhất cho cả repo |
| Atomic change cross-project | Không thể — đổi API phải tạo nhiều PR ở nhiều repo, theo thứ tự | Có — đổi API + tất cả caller trong 1 PR, 1 commit |
| CI | Đơn giản: mỗi repo build độc lập | Phức tạp: cần affected-build để khỏi build cả repo |
| Tooling | Nhẹ, Git mặc định đủ dùng | Cần Nx/Turborepo/Bazel, sparse-checkout, có thể VFS |
| Quyền truy cập | Phân quyền tự nhiên theo repo | Phải dùng CODEOWNERS, phân quyền trong 1 repo khó hơn |
| Chia sẻ code | Qua package đã publish (npm, artifact) | Import trực tiếp, không cần publish |
| Khám phá & refactor toàn cục | Khó, code rải rác | Dễ, grep/refactor một phát toàn bộ |

**Khác biệt cốt lõi về workflow:** Polyrepo đẩy độ phức tạp ra **versioning và phối hợp giữa các repo** (đổi một interface dùng chung là một vũ điệu merge nhiều repo theo thứ tự, dễ lệch version). Monorepo đẩy độ phức tạp vào **tooling và CI** (cần affected-build, merge queue, sparse-checkout), đổi lại được atomic commit cho thay đổi cross-project.

**Tín hiệu nên migrate sang monorepo:**

- Thay đổi cross-repo xảy ra thường xuyên và đau đớn (đổi shared lib là cả ngày đồng bộ version).
- "Dependency hell": các repo dùng version lệch nhau của shared package.
- Khó tái sử dụng code, copy-paste lan tràn giữa các repo.
- Muốn refactor/visibility toàn cục mà không làm được vì code rải rác.

**Tín hiệu KHÔNG nên migrate (giữ polyrepo):**

- Các project thật sự độc lập, ít chia sẻ code.
- Team/quyền truy cập tách bạch rõ (ví dụ open-source + closed-source).
- Chưa có năng lực đầu tư tooling monorepo.

**Chi phí migrate:**

- Bảo toàn lịch sử git khi gộp (dùng `git subtree` / `git filter-repo`) — tốn công, dễ mất history nếu làm ẩu.
- Phải dựng tooling: affected-build, sparse-checkout, merge queue, CODEOWNERS.
- CI ban đầu có thể chậm/đắt nếu chưa có affected-build.
- Thay đổi quy trình và đào tạo team; rủi ro "big-bang migration".

> **Insight phỏng vấn:** Câu chốt ăn điểm: **chọn monorepo hay polyrepo là chọn nơi đặt độ phức tạp** — versioning/coordination (polyrepo) hay tooling/CI (monorepo). Không có cái nào miễn phí. Migrate là quyết định kiến trúc tốn kém, chỉ làm khi nỗi đau cross-repo đủ lớn và team đủ năng lực dựng tooling. Nhắc `git filter-repo` để giữ history là tín hiệu thực chiến.

### Code minh hoạ

```text
Polyrepo: thay đổi shared API = nhiều PR, nhiều repo, theo thứ tự
  repo-shared   ──●  (bump v2, publish)
  repo-service-a ───●  (update dep -> v2)   <- phải đợi shared publish
  repo-service-b ────●  (update dep -> v2)  <- dễ lệch version

Monorepo: cùng thay đổi = 1 PR atomic
  monorepo ──●  (đổi shared API + sửa service-a + service-b cùng commit)
```

```bash
# Migrate polyrepo -> monorepo, GIỮ lịch sử git của từng repo
# Cách hiện đại, an toàn hơn subtree, dùng git-filter-repo
git clone git@org/service-a.git
cd service-a
git filter-repo --to-subdirectory-filter apps/service-a

# Sau đó add làm remote vào monorepo và merge giữ history
cd ../monorepo
git remote add service-a ../service-a
git fetch service-a
git merge --allow-unrelated-histories service-a/main

# Sau migrate: bật affected-build để CI không phình
npx nx affected --target=build --base=origin/main
```

### Đáp án mẫu

> "Dạ khác biệt cốt lõi là nơi đặt độ phức tạp. Polyrepo mỗi service một repo, version độc lập, CI đơn giản, nhưng thay đổi cross-project thì đau: đổi một shared API phải tạo nhiều PR ở nhiều repo theo thứ tự và rất dễ lệch version, dependency hell. Monorepo gộp tất cả vào một repo nên đổi API và sửa hết caller trong một commit atomic, refactor toàn cục dễ, nhưng đổi lại CI và tooling phức tạp hơn, phải có affected-build, sparse-checkout, merge queue, CODEOWNERS. Em khuyên migrate sang monorepo khi thay đổi cross-repo xảy ra thường xuyên và đau, code chia sẻ nhiều mà bị copy-paste hoặc lệch version. Còn nếu các project thật sự độc lập thì giữ polyrepo. Chi phí migrate không nhỏ: phải giữ history bằng git filter-repo, dựng nguyên bộ tooling monorepo và đào tạo team, nên đây là quyết định kiến trúc chỉ làm khi nỗi đau đủ lớn."

---
