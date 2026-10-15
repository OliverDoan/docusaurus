---
sidebar_position: 2
title: "Làm việc với nhánh"
---

# Làm việc với nhánh

## 1. Branch là gì? Tạo và quản lý nhánh

Bài học: [1. Branch là gì? Tạo và quản lý nhánh](../../git/lam-viec-voi-nhanh/1_branch-la-gi.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Branch trong Git hoạt động như thế nào? Tại sao tạo branch trong Git nhanh hơn SVN?**

<details className="qa">
<summary>Xem đáp án</summary>

Trong Git, branch chỉ là một **pointer (con trỏ) nhẹ** trỏ đến một commit cụ thể. Tạo branch chỉ cần tạo một file 41 bytes chứa commit hash -- thao tác O(1). Trong SVN, tạo branch nghĩa là **sao chép toàn bộ thư mục** dự án -- thao tác O(n) với n là kích thước dự án. Đây là lý do Git khuyến khích sử dụng branch nhiều, trong khi SVN coi branch là thao tác "nặng".

</details>

**2. HEAD là gì? Detached HEAD là gì và khi nào xảy ra?**

<details className="qa">
<summary>Xem đáp án</summary>

`HEAD` là pointer trỏ đến branch hiện tại. Bình thường: `HEAD -> main -> commit-C`. **Detached HEAD** xảy ra khi HEAD trỏ trực tiếp vào một commit thay vì một branch (ví dụ: `git checkout abc1234`). Trong trạng thái này, các commit mới sẽ không thuộc branch nào và có thể bị mất khi chuyển branch. Cách xử lý: tạo branch mới từ vị trí đó bằng `git switch -c branch-name`.

</details>

**3. Sự khác nhau giữa `git switch` và `git checkout` là gì?**

<details className="qa">
<summary>Xem đáp án</summary>

`git checkout` là lệnh cũ, làm nhiều việc cùng lúc: chuyển branch, khôi phục file, tạo branch. Từ Git 2.23, lệnh này được tách thành hai lệnh riêng biệt: `git switch` (chuyển/tạo branch) và `git restore` (khôi phục file). `git switch` an toàn hơn vì nó **chỉ làm một việc** -- chuyển branch, tránh nhầm lẫn giữa chuyển branch và khôi phục file.

</details>

**4. Làm thế nào để biết branch nào đã merge và có thể xoá an toàn?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng `git branch --merged main` để liệt kê các branch đã merge vào main. Những branch này có thể xoá an toàn bằng `git branch -d`. Dùng `git branch --no-merged main` để xem các branch chưa merge -- cẩn thận khi xoá những branch này. Trong teamwork, thường dọn dẹp branch sau khi PR đã merge trên GitHub/GitLab.

</details>

**5. Giải thích sự khác nhau giữa local branch, remote branch và remote-tracking branch.**

<details className="qa">
<summary>Xem đáp án</summary>

- **Local branch** (`main`): tồn tại trên máy bạn, bạn có thể commit trực tiếp
- **Remote branch** (`origin/main` trên server): tồn tại trên server (GitHub/GitLab)
- **Remote-tracking branch** (`origin/main` trên máy bạn): bản sao local của remote branch, được cập nhật khi `git fetch`. Đây là "ảnh chụp" trạng thái của remote, giúp bạn so sánh local với remote mà không cần kết nối mạng

Lệnh `git fetch` cập nhật remote-tracking branches. Lệnh `git pull` = `git fetch` + `git merge`.

</details>

---

## 2. Merge — Gộp nhánh trong Git

Bài học: [2. Merge — Gộp nhánh trong Git](../../git/lam-viec-voi-nhanh/2_merge-co-ban.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Giải thích sự khác nhau giữa fast-forward merge và 3-way merge.**

<details className="qa">
<summary>Xem đáp án</summary>

**Fast-forward** xảy ra khi branch đích không có commit mới nào kể từ khi tạo branch nguồn -- Git chỉ di chuyển pointer, không tạo merge commit. **3-way merge** xảy ra khi cả hai branch đều có commit mới -- Git phải so sánh 3 điểm (merge base, tip của mỗi branch), kết hợp thay đổi và tạo merge commit có 2 parent. Fast-forward cho lịch sử phẳng nhưng mất thông tin branch; 3-way merge giữ lại lịch sử branch nhưng phức tạp hơn.

</details>

**2. `--no-ff` flag làm gì và tại sao nhiều team bắt buộc dùng nó?**

<details className="qa">
<summary>Xem đáp án</summary>

`--no-ff` (no fast-forward) ép Git **luôn tạo merge commit**, kể cả khi có thể fast-forward. Nhiều team dùng nó vì: (1) merge commit là "mốc" đánh dấu một feature hoàn thành, (2) dễ rollback cả feature bằng `git revert`, (3) `git log --graph` hiển thị rõ cấu trúc branch, (4) biết ai merge và khi nào. Đây là cấu hình mặc định trong nhiều Git workflow (Git Flow, GitHub Flow).

</details>

**3. Squash merge là gì? Khi nào nên dùng và không nên dùng?**

<details className="qa">
<summary>Xem đáp án</summary>

Squash merge gộp tất cả commit từ branch nguồn thành một thay đổi duy nhất trên branch đích, rồi bạn tự commit. **Nên dùng** khi feature branch có nhiều commit nhỏ không có ý nghĩa (wip, fix typo, test), muốn main có lịch sử sạch. **Không nên dùng** khi mỗi commit trong branch đều quan trọng và cần truy vết, hoặc khi nhiều người cùng làm trên một branch (mất thông tin ai làm gì). Lưu ý: sau squash merge, Git không biết branch đã merge, cần xóa branch thủ công bằng `-D`.

</details>

**4. Bạn đang ở main và merge nhầm branch. Chưa push. Làm sao khắc phục?**

<details className="qa">
<summary>Xem đáp án</summary>

Dùng `git reset --hard HEAD~1` để quay lại commit trước merge commit (vì merge commit là commit mới nhất). Nếu là squash merge (bạn đã commit), tương tự dùng `git reset --hard HEAD~1`. Nếu đã push lên remote, dùng `git revert -m 1 <merge-commit-hash>` để tạo commit mới đảo ngược thay đổi -- KHÔNG dùng `reset --hard` trên branch đã push vì sẽ gây conflict cho đồng nghiệp.

</details>

**5. Giải thích `-s ours` và `-X ours` khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

`-s ours` là **merge strategy** -- nó bỏ **toàn bộ** thay đổi từ branch kia, chỉ giữ nội dung của branch hiện tại, nhưng vẫn tạo merge commit (đánh dấu là đã merge). Dùng khi muốn "đóng" một branch cũ mà không lấy code. `-X ours` là **strategy option** cho recursive merge -- nó chỉ áp dụng khi có **conflict**: chọn phiên bản của branch hiện tại cho những dòng conflict, còn những thay đổi không conflict vẫn được merge bình thường. Tương tự, `-X theirs` chọn phiên bản của branch kia khi conflict.

</details>

---

## 3. Rebase — Viết lại lịch sử commit

Bài học: [3. Rebase — Viết lại lịch sử commit](../../git/lam-viec-voi-nhanh/3_rebase-co-ban.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Giải thích sự khác nhau giữa merge và rebase. Khi nào dùng cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Merge** giữ nguyên lịch sử và tạo merge commit -- an toàn, không thay đổi commit đã tồn tại. **Rebase** viết lại lịch sử bằng cách tạo commit mới trên base mới -- lịch sử sạch nhưng thay đổi commit hash. Dùng merge khi gộp branch vào main (shared branch). Dùng rebase khi cập nhật feature branch cá nhân với thay đổi mới từ main. Workflow phổ biến: rebase feature lên main (cập nhật), rồi merge vào main với `--no-ff` (ghi nhận).

</details>

**2. "Golden Rule of Rebasing" là gì? Tại sao quan trọng?**

<details className="qa">
<summary>Xem đáp án</summary>

Golden Rule: **Không bao giờ rebase branch public/shared** -- tức là branch mà người khác đang làm việc trên đó. Lý do: rebase tạo commit mới với hash mới. Nếu bạn rebase và force push, đồng nghiệp đã có commit cũ trên máy họ. Khi họ pull, Git thấy 2 bộ commit khác nhau (cũ và mới) cho cùng nội dung -> duplicate commits, conflict, lịch sử hỗn độn. Chỉ rebase branch cá nhân mà chỉ mình bạn làm việc.

</details>

**3. Interactive rebase dùng để làm gì? Cho ví dụ cụ thể.**

<details className="qa">
<summary>Xem đáp án</summary>

Interactive rebase (`git rebase -i`) cho phép chỉnh sửa lịch sử commit: gộp commit (squash/fixup), sửa message (reword), xóa commit (drop), đổi thứ tự, tách commit (edit). Ví dụ: trước khi tạo PR, bạn có 5 commit nhỏ ("wip", "fix typo", "test", "update", "final"). Dùng `git rebase -i HEAD~5` và `fixup` 4 commit cuối vào commit đầu tiên, `reword` commit đầu để có message rõ ràng. Kết quả: 1 commit sạch, dễ review.

</details>

**4. Đang rebase mà gặp conflict. Bạn làm gì?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi rebase gặp conflict: (1) Git dừng lại ở commit gây conflict, (2) Mở file có conflict, đọc conflict markers và sửa, (3) `git add <file>` các file đã sửa, (4) `git rebase --continue` để tiếp tục. Nếu conflict quá phức tạp, dùng `git rebase --abort` để hủy toàn bộ và quay lại trạng thái ban đầu. Khác với merge (giải quyết 1 lần), rebase có thể yêu cầu giải quyết conflict nhiều lần (mỗi commit áp dụng có thể có conflict riêng).

</details>

**5. `git rebase --onto` dùng để làm gì? Cho ví dụ.**

<details className="qa">
<summary>Xem đáp án</summary>

`git rebase --onto new-base old-base branch` di chuyển một nhóm commit từ base cũ sang base mới. Ví dụ: bạn tạo feature-B từ feature-A, nhưng feature-A đã merge vào main và bị xóa. Bây giờ feature-B vẫn dựa trên feature-A (cũ). Dùng `git rebase --onto main feature-A feature-B` để di chuyển các commit của feature-B (những commit sau feature-A) lên main. Kết quả: feature-B dựa trên main thay vì feature-A.

</details>

---

## 4. Giải quyết conflict trong Git

Bài học: [4. Giải quyết conflict trong Git](../../git/lam-viec-voi-nhanh/4_giai-quyet-conflict.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Conflict trong Git xảy ra khi nào? Cho ví dụ cụ thể.**

<details className="qa">
<summary>Xem đáp án</summary>

Conflict xảy ra khi hai branch cùng thay đổi **cùng dòng** trong **cùng file**. Ví dụ: developer A sửa dòng 10 của `app.js` thành `color: blue`, developer B cũng sửa dòng 10 thành `color: green`. Khi merge, Git không biết chọn phiên bản nào nên đánh dấu conflict. Conflict KHÔNG xảy ra khi: sửa khác file, sửa khác dòng trong cùng file, hoặc chỉ một phía sửa.

</details>

**2. Mô tả quy trình giải quyết merge conflict.**

<details className="qa">
<summary>Xem đáp án</summary>

(1) Chạy `git merge` và nhận thông báo conflict, (2) dùng `git status` để xem file nào conflict, (3) mở từng file, tìm conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`), (4) quyết định giữ code nào (ours, theirs, hoặc kết hợp), (5) xóa tất cả conflict markers, (6) `git add` các file đã sửa, (7) `git commit` để hoàn tất merge. Trước khi commit, nên kiểm tra bằng `grep "<<<<<<< "` để đảm bảo không còn markers.

</details>

**3. `--ours` và `--theirs` trong merge và rebase có gì khác nhau?**

<details className="qa">
<summary>Xem đáp án</summary>

Trong **merge**: `--ours` = branch hiện tại (đang đứng trên), `--theirs` = branch đang merge vào. Trong **rebase**: bị **đảo ngược** -- `--ours` = branch base (main), `--theirs` = branch của bạn (feature). Lý do: khi rebase, Git tạm thời "bỏ bạn sang một bên" và áp dụng commit của bạn lên base, nên base trở thành "ours". Đây là điểm gây nhầm lẫn nhất và thường bị hỏi trong phỏng vấn.

</details>

**4. Làm sao phòng tránh conflict khi làm việc nhóm?**

<details className="qa">
<summary>Xem đáp án</summary>

(1) **Pull thường xuyên** -- cập nhật main mỗi ngày và merge/rebase vào feature branch, (2) **Chia nhỏ PR** -- PR nhỏ ít conflict hơn và merge nhanh hơn, (3) **Phân chia công việc rõ** -- tránh 2 người cùng sửa 1 file, (4) **Giao tiếp** -- thông báo khi sửa file quan trọng, (5) **Merge PR sớm** -- không để branch tồn đọng quá lâu, (6) dùng `.gitattributes` cho file đặc biệt như lock files.

</details>

**5. Giải quyết conflict khi merge và khi rebase khác nhau thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Khi **merge**, bạn giải quyết **tất cả conflict 1 lần** rồi commit (merge commit). Khi **rebase**, Git áp dụng **từng commit một**, nên bạn có thể phải giải quyết conflict **nhiều lần** (mỗi commit có thể gây conflict riêng). Sau khi resolve conflict khi merge, dùng `git commit`. Sau khi resolve conflict khi rebase, dùng `git rebase --continue` (không dùng `git commit`). Cả hai đều có thể hủy bằng `--abort`.

</details>

---

## 5. Cherry-pick và Stash

Bài học: [5. Cherry-pick và Stash](../../git/lam-viec-voi-nhanh/5_cherry-pick-va-stash.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Git stash là gì? Khi nào bạn sử dụng nó?**

<details className="qa">
<summary>Xem đáp án</summary>

`git stash` tạm cất (lưu trữ) các thay đổi chưa commit (cả staged và unstaged) vào một ngăn xếp (stack), làm sạch working directory. Dùng khi: (1) cần chuyển branch nhưng chưa muốn commit (code chưa xong), (2) cần pull từ remote nhưng có local changes, (3) muốn thử nghiệm trên clean state. `git stash pop` lấy lại thay đổi và xóa khỏi stack. `git stash apply` lấy lại nhưng giữ trong stack. Mặc định, stash không bao gồm untracked files -- dùng `-u` để bao gồm.

</details>

**2. Phân biệt `git stash pop` và `git stash apply`.**

<details className="qa">
<summary>Xem đáp án</summary>

Cả hai đều khôi phục thay đổi từ stash. Khác biệt: `pop` = apply + drop (lấy ra và xóa khỏi stack), `apply` = chỉ lấy ra (không xóa, stash vẫn còn trong stack). Dùng `apply` khi: muốn apply cùng stash vào nhiều branch, hoặc muốn giữ stash làm backup. Lưu ý: nếu `pop` gặp conflict, stash sẽ **không bị xóa** -- bạn phải giải quyết conflict rồi tự `git stash drop`.

</details>

**3. Cherry-pick là gì? Cho ví dụ tình huống thực tế.**

<details className="qa">
<summary>Xem đáp án</summary>

Cherry-pick áp dụng một commit cụ thể từ branch này sang branch khác, tạo commit mới với cùng nội dung nhưng hash khác. Tình huống thực tế: team phát hiện bug trên production, bug đã được sửa trên branch develop (commit abc123). Thay vì merge toàn bộ develop (có thể có feature chưa sẵn sàng), dùng `git cherry-pick abc123` trên main để chỉ lấy commit sửa bug. Deploy ngay mà không ảnh hưởng các feature đang phát triển.

</details>

**4. Cherry-pick có những rủi ro gì?**

<details className="qa">
<summary>Xem đáp án</summary>

(1) **Duplicate commits**: commit gốc và cherry-pick có cùng nội dung nhưng hash khác, gây nhầm lẫn khi đọc lịch sử và có thể conflict khi merge sau đó. (2) **Mất context**: commit có thể phụ thuộc commit khác (ví dụ: dùng function được tạo ở commit trước) -- cherry-pick chỉ 1 commit sẽ thiếu dependency. (3) **Conflict**: commit được tạo trên context khác nên dễ gây conflict khi áp dụng. Cách giảm rủi ro: chỉ cherry-pick khi thật sự cần thiết, ưu tiên merge/rebase, và luôn test sau khi cherry-pick.

</details>

**5. So sánh stash và tạo branch mới để tạm lưu code. Khi nào dùng cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

**Stash** phù hợp cho tạm dừng ngắn (vài phút đến vài giờ): nhanh (1 lệnh), chỉ ở local, không tạo commit. **Branch** phù hợp cho tạm dừng dài (vài ngày+): có tên rõ ràng, có thể push lên remote chia sẻ, có commit trong lịch sử dễ tìm lại. Quy tắc: nếu bạn quay lại trong cùng ngày -> stash. Nếu không chắc bao giờ quay lại, hoặc cần chia sẻ với người khác -> branch. Không nên để stash quá nhiều (> 5 entries) vì khó quản lý.

</details>
