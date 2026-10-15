---
sidebar_position: 3
title: "Cộng tác nhóm & Remote"
---

# Cộng tác nhóm & Remote

## 1. Remote Repository — Kho lưu trữ từ xa

Bài học: [1. Remote Repository — Kho lưu trữ từ xa](../../git/cong-tac-nhom/1_remote-repository.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Remote repository là gì? Tại sao cần remote?**

<details className="qa">
<summary>Xem đáp án</summary>

Remote repository là bản sao của repository được lưu trữ trên server (GitHub, GitLab, Bitbucket...). Cần remote để: (1) sao lưu code an toàn, (2) cộng tác với nhiều người, (3) chia sẻ code, (4) tích hợp CI/CD để kiểm tra và triển khai tự động, (5) hỗ trợ code review qua Pull Request.

</details>

**2. `origin` trong Git là gì? Nó có phải là từ khóa đặc biệt không?**

<details className="qa">
<summary>Xem đáp án</summary>

`origin` là tên mặc định mà Git đặt cho remote repository khi bạn clone. Nó KHÔNG phải từ khóa đặc biệt hay bắt buộc — chỉ là quy ước đặt tên được sử dụng rộng rãi. Bạn hoàn toàn có thể đổi tên nó bằng `git remote rename origin <tên-mới>`.

</details>

**3. Phân biệt `origin` và `upstream` trong fork workflow?**

<details className="qa">
<summary>Xem đáp án</summary>

Trong fork workflow: `origin` trỏ đến fork của bạn trên GitHub (nơi bạn có quyền push), còn `upstream` trỏ đến repo gốc (repo mà bạn fork). Bạn fetch từ `upstream` để cập nhật code mới nhất từ repo gốc, và push lên `origin` (fork của bạn) trước khi tạo Pull Request.

</details>

**4. Remote-tracking branch là gì? Cho ví dụ.**

<details className="qa">
<summary>Xem đáp án</summary>

Remote-tracking branch là bản sao read-only (chỉ đọc) của nhánh trên remote, được lưu trong local repo. Ví dụ: `origin/main` là remote-tracking branch theo dõi nhánh `main` trên remote `origin`. Nó được cập nhật khi bạn chạy `git fetch` hoặc `git pull`. Bạn không thể commit trực tiếp lên remote-tracking branch — phải merge hoặc rebase vào nhánh local trước.

</details>

**5. So sánh HTTPS và SSH khi kết nối đến remote. Khi nào dùng cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

HTTPS dùng token-based authentication (PAT), dễ cài đặt, ít bị firewall chặn (port 443), phù hợp người mới và môi trường corporate. SSH dùng key-based authentication (public/private key pair), bảo mật cao hơn, tiện lợi hơn sau khi setup (không cần nhập credentials), nhưng có thể bị firewall chặn port 22. Trong thực tế, SSH được ưa chuộng hơn vì tiện lợi khi đã cấu hình xong.

</details>

**6. Một repo local có thể kết nối đến nhiều remote không? Cho ví dụ thực tế.**

<details className="qa">
<summary>Xem đáp án</summary>

Có, một repo local có thể kết nối đến nhiều remote bằng `git remote add`. Ví dụ thực tế: (1) Fork workflow — `origin` cho fork, `upstream` cho repo gốc; (2) Backup — `origin` cho GitHub, `backup` cho GitLab; (3) Deploy — `github` cho code review, `production` cho deploy. Dùng `git push <tên-remote> <branch>` để push đến remote cụ thể.

</details>

---

## 2. Clone, Fetch, Pull, Push — 4 lệnh remote cốt lõi

Bài học: [2. Clone, Fetch, Pull, Push — 4 lệnh remote cốt lõi](../../git/cong-tac-nhom/2_clone-fetch-pull-push.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Phân biệt `git fetch` và `git pull`. Khi nào dùng lệnh nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`git fetch` chỉ tải dữ liệu từ remote về local và cập nhật remote-tracking branches (ví dụ `origin/main`), nhưng KHÔNG thay đổi code trong working directory. `git pull` = `git fetch` + `git merge`, tức là tải dữ liệu VÀ tự động merge vào nhánh hiện tại. Dùng `fetch` khi muốn xem trước thay đổi, dùng `pull` khi tin chắc muốn cập nhật ngay. Trong thực tế, `git pull --rebase` được khuyến khích vì giữ lịch sử commit sạch sẽ.

</details>

**2. `git pull --rebase` khác gì `git pull`? Tại sao nhiều team ưa thích rebase?**

<details className="qa">
<summary>Xem đáp án</summary>

`git pull` mặc định dùng merge, tạo ra merge commit mỗi khi remote có commit mới. `git pull --rebase` đặt lại các commit local lên đầu commit mới từ remote, tạo lịch sử thẳng (linear history). Nhiều team ưa thích rebase vì: (1) lịch sử commit dễ đọc, (2) không có merge commit thừa, (3) dễ debug bằng `git bisect`, (4) git log nhìn sạch sẽ hơn.

</details>

**3. Khi nào bạn dùng `git push --force-with-lease` thay vì `git push --force`?**

<details className="qa">
<summary>Xem đáp án</summary>

Luôn dùng `--force-with-lease` thay vì `--force` khi cần force push. `--force` ghi đè remote không kiểm tra, có thể mất code của người khác. `--force-with-lease` kiểm tra xem remote có commit mới nào mà bạn chưa fetch không — nếu có, lệnh bị từ chối, bảo vệ code của đồng đội. Tình huống cần force push: sau khi rebase hoặc amend commit trên nhánh feature cá nhân.

</details>

**4. Push bị rejected — nguyên nhân và cách xử lý?**

<details className="qa">
<summary>Xem đáp án</summary>

Push bị rejected khi remote có commit mà local chưa có, tức là lịch sử bị phân kỳ (diverge). Cách xử lý: (1) `git pull --rebase origin <branch>` để tải commit mới và đặt commit local lên trên, (2) giải quyết conflict nếu có, (3) push lại. Cách sai: dùng `--force` vì sẽ ghi đè commit của người khác.

</details>

**5. Giải thích quy trình hoàn chỉnh từ clone đến push.**

<details className="qa">
<summary>Xem đáp án</summary>

(1) `git clone <url>` — tải repo từ remote về local, tạo remote `origin` tự động. (2) Tạo nhánh feature: `git checkout -b feature/xyz`. (3) Code và commit: `git add` + `git commit`. (4) Push nhánh lên remote: `git push -u origin feature/xyz`. (5) Tạo Pull Request trên GitHub. (6) Sau khi merge, cập nhật local: `git checkout main && git pull --rebase origin main`. (7) Xóa nhánh feature: `git branch -d feature/xyz`.

</details>

**6. `--depth 1` khi clone có ý nghĩa gì? Ưu và nhược điểm?**

<details className="qa">
<summary>Xem đáp án</summary>

`--depth 1` tạo shallow clone, chỉ tải commit mới nhất thay vì toàn bộ lịch sử. Ưu điểm: tốc độ clone nhanh hơn nhiều, tiết kiệm dung lượng, phù hợp cho CI/CD pipeline. Nhược điểm: không có đầy đủ lịch sử commit, không thể dùng `git log` hoặc `git blame` đầy đủ, không thể tạo PR đúng cách trong một số trường hợp. Có thể "unshallow" sau bằng `git fetch --unshallow`.

</details>

---

## 3. GitHub cơ bản

Bài học: [3. GitHub cơ bản](../../git/cong-tac-nhom/3_github-co-ban.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. GitHub là gì? Git và GitHub khác nhau như thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Git là hệ thống quản lý phiên bản phân tán (DVCS) — công cụ chạy trên máy local để theo dõi thay đổi code. GitHub là nền tảng hosting trên cloud, cung cấp nơi lưu trữ Git repository cùng các tính năng cộng tác như Pull Request, Issues, Actions, Projects. Git hoạt động offline được, GitHub cần internet. Git miễn phí mã nguồn mở, GitHub là dịch vụ thương mại (có gói miễn phí). Có thể dùng Git mà không cần GitHub (dùng GitLab, Bitbucket, hoặc self-hosted), nhưng không thể dùng GitHub mà không có Git.

</details>

**2. Branch protection rules là gì? Tại sao quan trọng?**

<details className="qa">
<summary>Xem đáp án</summary>

Branch protection rules là các quy tắc bảo vệ nhánh quan trọng (thường là main/develop) trên GitHub. Có thể cấu hình: bắt buộc tạo PR (không push trực tiếp), yêu cầu approval từ reviewer, bắt buộc CI checks pass, yêu cầu conversation resolved. Quan trọng vì: ngăn chặn code lỗi vào production, đảm bảo code được review, tạo quy trình phát triển chuyên nghiệp, giảm rủi ro.

</details>

**3. Giải thích file CODEOWNERS trong GitHub.**

<details className="qa">
<summary>Xem đáp án</summary>

CODEOWNERS là file nằm trong `.github/CODEOWNERS`, định nghĩa ai là "owner" (người chịu trách nhiệm) cho từng phần code. Khi có PR thay đổi file, GitHub tự động thêm owner tương ứng làm reviewer. Ví dụ: `*.js @frontend-team` nghĩa là mọi file JS cần frontend team review. Giúp đảm bảo đúng người review đúng code, tránh thay đổi không được review bởi chuyên gia phù hợp.

</details>

**4. Public repo và private repo khác nhau thế nào? Khi nào dùng cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Public repo ai cũng xem được code, fork được, phù hợp cho open source, portfolio, học tập. Private repo chỉ owner và collaborators truy cập được, phù hợp cho code công ty, dự án thương mại, code có thông tin nhạy cảm. Cả hai đều miễn phí trên GitHub. Lưu ý: public repo không nên chứa API keys, passwords, hay thông tin bí mật. GitHub Pages miễn phí cho public repos, cần GitHub Pro cho private repos.

</details>

**5. GitHub Actions là gì? Cho một ví dụ use case.**

<details className="qa">
<summary>Xem đáp án</summary>

GitHub Actions là hệ thống CI/CD tích hợp trong GitHub, cho phép tự động hóa workflow khi có sự kiện xảy ra (push, PR, schedule...). Ví dụ: khi developer tạo PR, Actions tự động chạy test, lint, build. Nếu tất cả pass (xanh), reviewer mới được merge. Nếu fail (đỏ), developer phải sửa lỗi trước. Workflow được định nghĩa bằng file YAML trong `.github/workflows/`. Điều này đảm bảo code quality và giảm lỗi khi deploy.

</details>

**6. README.md tốt cần có những gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Một README.md tốt cần: (1) Tên và mô tả ngắn gọn dự án, (2) Badges hiển thị trạng thái (build, coverage, license), (3) Features chính, (4) Demo hoặc screenshots, (5) Tech stack, (6) Hướng dẫn cài đặt (Getting Started), (7) Hướng dẫn sử dụng, (8) Hướng dẫn đóng góp (Contributing), (9) License. README là "bộ mặt" của dự án, là thứ đầu tiên nhà tuyển dụng hoặc người dùng nhìn thấy.

</details>

---

## 4. Pull Request và Code Review

Bài học: [4. Pull Request và Code Review](../../git/cong-tac-nhom/4_pull-request-va-code-review.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Pull Request là gì? Tại sao team nên dùng PR thay vì push thẳng vào main?**

<details className="qa">
<summary>Xem đáp án</summary>

Pull Request là đề xuất merge code từ nhánh feature vào nhánh chính (main/develop). Team nên dùng PR vì: (1) Code được review trước khi merge, giảm bug, (2) CI/CD tự động chạy tests, (3) Tạo tài liệu về thay đổi code, (4) Chia sẻ kiến thức trong team khi review, (5) Dễ rollback nếu có vấn đề. Push thẳng vào main nguy hiểm vì không ai kiểm tra code, có thể đưa bug lên production.

</details>

**2. So sánh 3 merge options: Merge Commit, Squash, và Rebase.**

<details className="qa">
<summary>Xem đáp án</summary>

Merge Commit giữ nguyên tất cả commit và tạo thêm merge commit, lịch sử đầy đủ nhưng phức tạp. Squash gộp tất cả commit thành 1, lịch sử main sạch nhất, phù hợp khi commit trong PR không có ý nghĩa riêng lẻ. Rebase đặt lại commit lên đầu target branch, lịch sử linear, không tạo merge commit. Squash phổ biến nhất trong team hiện đại vì giữ main branch clean (1 commit = 1 feature/fix).

</details>

**3. Bạn review code thế nào? Checklist review gồm những gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Tôi review theo các khía cạnh: (1) Correctness — code có làm đúng yêu cầu, edge cases đã xử lý chưa, (2) Security — input validation, không hardcode secrets, SQL injection/XSS prevention, (3) Performance — query N+1, vòng lặp không cần thiết, cần caching không, (4) Readability — naming rõ ràng, hàm nhỏ, nesting không quá sâu, (5) Testing — tests đủ, logic test đúng, (6) Style — theo conventions dự án. Tôi phân loại feedback thành MUST FIX (bug, security), SHOULD FIX (performance), và NIT (style).

</details>

**4. Khi nào dùng Draft PR?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng Draft PR khi: (1) Code chưa hoàn thành nhưng muốn nhận feedback sớm về hướng tiếp cận, (2) Muốn chạy CI trên code WIP, (3) Muốn thảo luận design trước khi code xong, (4) Feature lớn cần nhiều ngày, muốn cho team biết đang làm gì. Draft PR không thể merge, không gửi thông báo cho reviewer (tránh spam). Khi xong, chuyển sang "Ready for review".

</details>

**5. PR tốt có những đặc điểm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

PR tốt cần: (1) Nhỏ (< 400 dòng) — dễ review, ít bug, (2) 1 mục đích duy nhất — không trộn feature + refactor, (3) Mô tả rõ ràng — what, why, how, test plan, (4) Tests đi kèm — code mới có tests, (5) Self-review trước — tác giả đọc lại trước khi assign reviewer, (6) Cập nhật với main — không có conflict, (7) CI pass — build và tests đều pass.

</details>

**6. Làm thế nào để giải quyết conflict trong Pull Request?**

<details className="qa">
<summary>Xem đáp án</summary>

Có 2 cách: (1) Command line (khuyên dùng) — checkout nhánh feature, merge/rebase main vào, giải quyết conflict thủ công, commit và push. PR tự cập nhật. (2) GitHub web editor — cho conflict đơn giản, click "Resolve conflicts", sửa trực tiếp trên web. Cách 1 được khuyên dùng vì linh hoạt hơn, có thể chạy tests local trước khi push. Best practice: rebase/merge main vào feature branch thường xuyên để tránh conflict lớn.

</details>

---

## 5. Fork và đóng góp Open Source

Bài học: [5. Fork và đóng góp Open Source](../../git/cong-tac-nhom/5_fork-va-open-source.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Fork và Clone khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Fork tạo bản sao repository trên GitHub server (server-to-server), xuất hiện dưới account của bạn, bạn có toàn quyền push. Clone tải repository về máy local (server-to-local). Fork dùng khi muốn đóng góp vào dự án mà bạn không có quyền push (open source). Clone dùng khi bạn đã có quyền push (collaborator) hoặc sau khi fork để tải fork về local.

</details>

**2. Mô tả quy trình đóng góp vào một dự án open source.**

<details className="qa">
<summary>Xem đáp án</summary>

(1) Fork repo gốc trên GitHub, (2) Clone fork về local, (3) Thêm remote `upstream` trỏ đến repo gốc, (4) Fetch và merge `upstream/main` để cập nhật, (5) Tạo feature branch từ main, (6) Code, commit với conventional commits format, (7) Push nhánh lên fork (origin), (8) Tạo Pull Request từ fork về repo gốc, (9) Đợi review, phản hồi feedback, (10) Sau khi merge, sync fork và dọn dẹp branch. Trước tất cả, phải đọc CONTRIBUTING.md và CODE_OF_CONDUCT.md.

</details>

**3. Làm thế nào để sync fork với repo gốc (upstream)?**

<details className="qa">
<summary>Xem đáp án</summary>

Có 2 cách: (1) Command line: `git fetch upstream` rồi `git checkout main` rồi `git merge upstream/main` rồi `git push origin main`. (2) Trên GitHub: click nút "Sync fork" > "Update branch" trên trang fork. Cần sync thường xuyên để tránh fork bị lỗi thời quá nhiều, gây conflict lớn khi tạo PR.

</details>

**4. Tại sao nên tạo feature branch thay vì code trực tiếp trên main khi đóng góp?**

<details className="qa">
<summary>Xem đáp án</summary>

Code trên main của fork gây nhiều vấn đề: (1) Main bị diverge khỏi upstream, khó sync, (2) Không thể làm nhiều PR cùng lúc (mỗi PR cần branch riêng), (3) PR bị lẫn lộn code từ nhiều thay đổi, (4) Khó rollback nếu PR bị reject. Feature branch giúp: mỗi PR độc lập, main luôn sạch và đồng bộ với upstream, dễ quản lý nhiều contributions cùng lúc.

</details>

**5. "Good first issue" là gì? Tại sao nên bắt đầu với nó?**

<details className="qa">
<summary>Xem đáp án</summary>

"Good first issue" là label trên GitHub đánh dấu những issues phù hợp cho người mới bắt đầu đóng góp. Thường là bug nhỏ, fix typo, thêm tests, hoặc cải thiện docs. Nên bắt đầu với nó vì: (1) Độ phức tạp vừa phải, (2) Thường có hướng dẫn chi tiết từ maintainer, (3) Giúp làm quen với codebase và workflow, (4) Xây dựng confidence trước khi tackle issues lớn hơn, (5) Maintainers thường hỗ trợ nhiều hơn cho good first issues.

</details>

**6. Đóng góp open source mang lại lợi ích gì cho sự nghiệp?**

<details className="qa">
<summary>Xem đáp án</summary>

Lợi ích bao gồm: (1) Portfolio mạnh — GitHub contributions là CV sống, nhà tuyển dụng xem được, (2) Kinh nghiệm thực tế — làm việc với codebase lớn, CI/CD, code review, (3) Networking — kết nối với developer giỏi toàn cầu, (4) Cải thiện kỹ năng — đọc code người khác, viết code pass review từ experts, (5) Kỹ năng tiếng Anh — giao tiếp kỹ thuật bằng tiếng Anh, (6) Job opportunities — nhiều công ty tuyển trực tiếp từ open source contributors.

</details>
