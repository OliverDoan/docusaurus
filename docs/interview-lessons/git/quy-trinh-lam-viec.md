---
sidebar_position: 4
title: "Quy trình & Best Practices"
---

# Quy trình & Best Practices

## 1. Git Flow — Mô hình phân nhánh kinh điển

Bài học: [1. Git Flow — Mô hình phân nhánh kinh điển](../../git/quy-trinh-lam-viec/1_git-flow.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Git Flow là gì? Giải thích các nhánh chính.**

<details className="qa">
<summary>Xem đáp án</summary>

Git Flow là mô hình branching được Vincent Driessen giới thiệu năm 2010. Nó định nghĩa 5 loại nhánh: 2 nhánh vĩnh viễn (main cho production, develop cho tích hợp) và 3 nhánh tạm thời (feature cho tính năng mới, release cho chuẩn bị phát hành, hotfix cho sửa lỗi khẩn cấp trên production). Mỗi loại nhánh có quy tắc rõ ràng về việc tạo từ đâu và merge vào đâu.

</details>

**2. Tại sao Git Flow dùng `--no-ff` khi merge?**

<details className="qa">
<summary>Xem đáp án</summary>

Flag `--no-ff` (no fast-forward) buộc Git tạo một merge commit riêng biệt, ngay cả khi có thể fast-forward. Điều này giữ lại lịch sử của feature branch trong git log — bạn có thể thấy rõ ràng feature nào được merge vào lúc nào, bao gồm tất cả các commit của nó. Nếu dùng fast-forward, các commit sẽ "phẳng" trên 1 dòng và bạn không phân biệt được boundary giữa các feature.

</details>

**3. Khi nào tạo hotfix branch? Nó khác gì với feature branch?**

<details className="qa">
<summary>Xem đáp án</summary>

Hotfix branch được tạo khi có bug khẩn cấp trên production cần sửa ngay lập tức, không thể đợi đến release tiếp theo. Khác biệt lớn nhất: hotfix tạo từ `main` (code production) và merge vào cả `main` lẫn `develop`. Feature branch tạo từ `develop` và chỉ merge vào `develop`. Hotfix cũng được tag version (patch increment, ví dụ v1.0.0 -> v1.0.1).

</details>

**4. Git Flow có nhược điểm gì? Khi nào không nên dùng?**

<details className="qa">
<summary>Xem đáp án</summary>

Git Flow phức tạp với nhiều loại nhánh và bước merge, tạo overhead lớn cho team nhỏ. Nó không phù hợp với CI/CD continuous deployment vì được thiết kế cho scheduled release. Long-lived feature branches có thể drift xa khỏi develop gây merge conflict lớn. Nên cân nhắc GitHub Flow (đơn giản hơn) cho web app deploy liên tục, hoặc Trunk-Based Development cho team có CI/CD hoàn chỉnh.

</details>

**5. Trong Git Flow, nếu đang có release branch và phát hiện bug trên production thì xử lý thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Tạo hotfix branch từ main như bình thường. Sau khi fix xong, merge hotfix vào main (tag version mới) và merge vào **release branch** (thay vì develop). Lý do: release branch cuối cùng sẽ merge vào develop, nên bug fix sẽ được truyền xuống develop thông qua release branch. Nếu merge hotfix trực tiếp vào develop mà không qua release branch, có thể gây conflict khi release branch merge vào develop sau đó.

</details>

---

## 2. GitHub Flow và Trunk-Based Development

Bài học: [2. GitHub Flow và Trunk-Based Development](../../git/quy-trinh-lam-viec/2_github-flow-va-trunk-based.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. So sánh GitHub Flow và Git Flow. Khi nào chọn cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

GitHub Flow chỉ có 1 nhánh chính (main) và feature branches ngắn hạn, phù hợp cho CI/CD continuous deployment, team trung bình, web app. Git Flow có 5 loại nhánh (main, develop, feature, release, hotfix), phù hợp cho scheduled release, team lớn, sản phẩm có version. Chọn GitHub Flow khi cần ship nhanh và đơn giản. Chọn Git Flow khi cần kiểm soát release chặt và hỗ trợ nhiều version.

</details>

**2. Trunk-Based Development là gì? Tại sao Google và Facebook dùng?**

<details className="qa">
<summary>Xem đáp án</summary>

TBD là mô hình mà tất cả developer commit trực tiếp vào 1 nhánh chính (trunk/main), không có long-lived branches. Google và Facebook dùng vì: (1) Loại bỏ merge conflict từ long-lived branches, (2) CI liên tục cho mọi commit đảm bảo chất lượng, (3) Deploy nhanh — main luôn deployable, (4) Feature Flags cho phép code chưa hoàn thành vẫn merge được an toàn. TBD yêu cầu CI/CD cực mạnh, test coverage cao, và feature flag infrastructure.

</details>

**3. Feature Flag là gì? Tại sao cần trong TBD?**

<details className="qa">
<summary>Xem đáp án</summary>

Feature Flag là cờ điều khiển bật/tắt tính năng trong code mà không cần deploy lại. Trong TBD, vì không có feature branches, code chưa hoàn thành vẫn merge vào main. Feature Flag giấu tính năng chưa sẵn sàng khỏi end user. Ưu điểm khác: canary release (bật cho 10% user trước), A/B testing, kill switch (tắt tính năng lỗi ngay lập tức). Cần chú ý dọn dẹp flag sau khi feature ổn định để tránh "flag debt".

</details>

**4. Nếu team bạn đang dùng Git Flow và muốn chuyển sang GitHub Flow thì làm thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Chuyển đổi dần dần: (1) Đảm bảo CI/CD pipeline hoàn chỉnh cho nhánh main, (2) Thiết lập branch protection cho main (require PR, require CI pass), (3) Merge develop vào main để đồng bộ, (4) Ngừng tạo release branches — deploy trực tiếp từ main sau khi merge PR, (5) Ngừng tạo develop branch cho dự án mới, (6) Training team về quy trình mới, (7) Sau vài sprint, xóa nhánh develop cũ.

</details>

**5. So sánh ưu nhược điểm của Squash Merge, Merge Commit và Rebase Merge khi merge PR?**

<details className="qa">
<summary>Xem đáp án</summary>

**Merge Commit** giữ toàn bộ lịch sử của feature branch trong 1 merge commit — lịch sử đầy đủ nhưng có thể phức tạp. **Squash Merge** gộp tất cả commits thành 1 — lịch sử sạch nhưng mất chi tiết. **Rebase Merge** đặt lại từng commit lên đầu main — lịch sử tuyến tính nhưng viết lại history (nguy hiểm nếu không hiểu rõ). Phổ biến nhất là Squash Merge cho feature nhỏ và Merge Commit cho feature lớn cần giữ lịch sử chi tiết.

</details>

---

## 3. Commit Message chuẩn — Conventional Commits

Bài học: [3. Commit Message chuẩn — Conventional Commits](../../git/quy-trinh-lam-viec/3_commit-message-chuan.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Conventional Commits là gì? Tại sao nên dùng?**

<details className="qa">
<summary>Xem đáp án</summary>

Conventional Commits là quy ước viết commit message theo format `type(scope): description`. Nên dùng vì: (1) Git log dễ đọc và hiểu, (2) Có thể tự động tạo CHANGELOG, (3) Tự động xác định version mới (SemVer) dựa trên commit types, (4) Giúp team thống nhất cách viết, (5) Dễ tìm kiếm và lọc commits theo type/scope.

</details>

**2. Commit types nào tăng version SemVer?**

<details className="qa">
<summary>Xem đáp án</summary>

`fix` tăng PATCH (1.0.0 -> 1.0.1), `feat` tăng MINOR (1.0.0 -> 1.1.0), commit có `BREAKING CHANGE` hoặc dấu `!` tăng MAJOR (1.0.0 -> 2.0.0). Các types khác như docs, style, refactor, test, chore không tăng version vì không ảnh hưởng đến end user.

</details>

**3. Giải thích cách thiết lập commit message validation cho dự án?**

<details className="qa">
<summary>Xem đáp án</summary>

Sử dụng 3 tools: (1) **commitlint** để validate format — cài đặt `@commitlint/cli` và `@commitlint/config-conventional`, tạo file config định nghĩa rules. (2) **Husky** để chạy commitlint tự động — tạo commit-msg hook gọi commitlint. (3) **Commitizen** (optional) để hỗ trợ viết commit tương tác — người dùng chọn type, nhập scope và description qua menu. Tất cả cài đặt như dev dependencies và commit vào repo để tất cả team members dùng chung.

</details>

**4. Viết commit message cho tình huống: bạn fix bug khiến app crash khi user upload file > 5MB trên trang profile.**

<details className="qa">
<summary>Xem đáp án</summary>

```
fix(profile): handle file upload exceeding 5MB size limit

The profile image upload crashed when file size exceeded 5MB due to
missing size validation before upload initiation. Added client-side
file size check with user-friendly error message. Server-side
validation was already in place but the client crash prevented the
request from reaching it.

Closes #1234
```

</details>

**5. Sự khác nhau giữa `refactor` và `fix`? Giữa `style` và `refactor`?**

<details className="qa">
<summary>Xem đáp án</summary>

`refactor` thay đổi cấu trúc code nhưng **không đổi behavior** — input và output vẫn giống nhau (ví dụ: đổi tên biến, tách function, thay đổi design pattern). `fix` sửa **behavior sai** — trước khi fix thì output sai, sau khi fix thì output đúng. Còn `style` chỉ thay đổi **format** code (indentation, spacing, semicolons) mà **không đổi logic** — ngay cả không thay đổi cấu trúc. `refactor` có thể đổi cấu trúc nhưng không đổi behavior; `style` không đổi cả cấu trúc lẫn behavior.

</details>

---

## 4. Tag và Release

Bài học: [4. Tag và Release](../../git/quy-trinh-lam-viec/4_tag-va-release.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Lightweight tag khác annotated tag như thế nào? Khi nào dùng loại nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Lightweight tag chỉ là một pointer đến commit, không lưu thêm thông tin nào. Annotated tag là một Git object riêng biệt, lưu tên người tạo (tagger), ngày tạo, message, và có thể ký GPG. Dùng annotated tag cho release chính thức vì cần ghi lại ai tạo, khi nào, và tại sao. Lightweight tag dùng cho tag tạm thời hoặc nội bộ.

</details>

**2. Semantic Versioning là gì? Khi nào tăng MAJOR, MINOR, PATCH?**

<details className="qa">
<summary>Xem đáp án</summary>

SemVer là quy ước đặt tên version theo format MAJOR.MINOR.PATCH. Tăng PATCH khi sửa lỗi mà không đổi API (backward compatible). Tăng MINOR khi thêm tính năng mới mà vẫn backward compatible. Tăng MAJOR khi có breaking changes — thay đổi không tương thích ngược. Khi tăng MINOR thì PATCH reset về 0, khi tăng MAJOR thì cả MINOR và PATCH reset về 0.

</details>

**3. Làm sao để tự động tạo release mới khi push tag?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng GitHub Actions với trigger `on: push: tags`. Khi push tag mới, workflow sẽ tự động: (1) Build ứng dụng, (2) Chạy tests, (3) Tạo artifacts (binaries), (4) Tạo GitHub Release với `gh release create` hoặc action như `softprops/action-gh-release`, (5) Upload artifacts vào release. Kết hợp với Conventional Commits và standard-version, toàn bộ quy trình từ commit -> tag -> release -> deploy có thể tự động hóa.

</details>

**4. Pre-release version dùng như thế nào? Cho ví dụ.**

<details className="qa">
<summary>Xem đáp án</summary>

Pre-release version sử dụng dash sau version chính: `v2.0.0-alpha.1`, `v2.0.0-beta.1`, `v2.0.0-rc.1`. Thứ tự: alpha (phát triển sớm, nhiều bug) -> beta (feature complete, còn bug) -> rc (Release Candidate, gần sẵn sàng) -> stable release. Trên GitHub, tạo pre-release với flag `--prerelease` để hiển thị bằng màu vàng và không được coi là "latest release". Điều này cho phép early adopters test trước mà không ảnh hưởng người dùng bình thường.

</details>

**5. Team bạn dùng monorepo với 3 packages. Làm sao quản lý versioning?**

<details className="qa">
<summary>Xem đáp án</summary>

Có 2 cách: (1) **Independent versioning** — mỗi package có version riêng, tag dạng `@package-name@1.2.0`. Dùng khi các packages phát triển độc lập, ví dụ `@mylib/core@1.2.0` và `@mylib/ui@3.0.0`. (2) **Fixed versioning** — tất cả packages dùng chung 1 version, tag dạng `v1.2.0`. Đơn giản hơn nhưng bắt buộc tất cả packages release cùng lúc. Tools như Lerna, Changesets, hoặc Nx hỗ trợ cả 2 cách. Phổ biến nhất là independent versioning vì linh hoạt hơn.

</details>

---

## 5. CI/CD cơ bản với GitHub Actions

Bài học: [5. CI/CD cơ bản với GitHub Actions](../../git/quy-trinh-lam-viec/5_ci-cd-co-ban-voi-github-actions.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. CI/CD là gì? Phân biệt Continuous Integration, Continuous Delivery và Continuous Deployment.**

<details className="qa">
<summary>Xem đáp án</summary>

**CI (Continuous Integration)** là quy trình tự động kiểm tra code (lint, test, build) mỗi khi developer push code, đảm bảo code base luôn ở trạng thái hoạt động. **Continuous Delivery** là tự động hóa toàn bộ quy trình từ code đến sẵn sàng deploy, nhưng cần người bấm nút để deploy lên production. **Continuous Deployment** tiến xa hơn — tự động deploy lên production mỗi khi code pass tất cả tests, không cần sự can thiệp của con người.

</details>

**2. Giải thích cấu trúc của 1 GitHub Actions workflow.**

<details className="qa">
<summary>Xem đáp án</summary>

Một workflow gồm: (1) **name** — tên workflow, (2) **on** — trigger events (push, pull_request, schedule), (3) **jobs** — các công việc cần thực hiện, mỗi job chạy trên 1 runner (máy ảo) độc lập. Mỗi job gồm nhiều **steps** — các bước thực hiện tuần tự. Step có thể **uses** (dùng action có sẵn từ Marketplace) hoặc **run** (chạy lệnh shell trực tiếp). Jobs mặc định chạy song song; dùng **needs** để định nghĩa thứ tự phụ thuộc.

</details>

**3. Matrix strategy là gì? Cho ví dụ.**

<details className="qa">
<summary>Xem đáp án</summary>

Matrix strategy cho phép chạy cùng 1 job trên nhiều cấu hình đồng thời. Ví dụ: test ứng dụng trên 3 phiên bản Node.js (18, 20, 22) và 2 OS (Ubuntu, Windows) — tạo ra 6 jobs song song. Định nghĩa bằng `strategy.matrix` trong workflow. Có thể dùng `exclude` để loại bỏ cấu hình cụ thể và `include` để thêm cấu hình đặc biệt. `fail-fast: false` đảm bảo các job khác vẫn chạy khi 1 job fail.

</details>

**4. Làm sao bảo vệ nhánh main bằng GitHub Actions?**

<details className="qa">
<summary>Xem đáp án</summary>

Kết hợp **branch protection rules** với **required status checks**: (1) Trong repo Settings, tạo branch protection rule cho main, (2) Bật "Require status checks to pass before merging" và chọn các CI jobs cần pass (ví dụ "Lint & Test", "Build"), (3) Bật "Require pull request reviews" để bắt buộc ít nhất 1 người review, (4) Bật "Require branches to be up to date" để đảm bảo PR đã cập nhật với main mới nhất. Kết quả: không ai có thể merge PR khi CI đỏ hoặc chưa có approval.

</details>

**5. So sánh GitHub Actions với Jenkins. Khi nào chọn cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**GitHub Actions** là CI/CD native của GitHub, YAML config, hosted runners (không cần quản lý server), marketplace nhiều actions sẵn, miễn phí cho repo public. **Jenkins** là self-hosted, Groovy Jenkinsfile, cần quản lý server riêng, nhiều plugins, linh hoạt hơn nhưng phức tạp hơn. Chọn GitHub Actions khi: dự án trên GitHub, muốn đơn giản và nhanh, không muốn quản lý infrastructure. Chọn Jenkins khi: cần chạy on-premise (không dùng cloud), cần tùy biến cao, đã có Jenkins infrastructure, hoặc cần chạy trên nhiều Git platforms (GitLab, Bitbucket).

</details>
