---
sidebar_position: 5
title: "Nâng cao"
---

# Nâng cao

## 1. Reset, Revert, Amend — Sửa lỗi trong Git

Bài học: [1. Reset, Revert, Amend — Sửa lỗi trong Git](../../git/nang-cao/1_git-reset-revert-amend.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Sự khác nhau giữa `git reset` và `git revert`?**

<details className="qa">
<summary>Xem đáp án</summary>

- `git reset` thay đổi history bằng cách di chuyển HEAD về commit trước. Commits bị "xóa" khỏi branch. Nguy hiểm trên shared branches vì thay đổi history mà người khác đã có.
- `git revert` tạo một commit MỚI chứa nội dung đảo ngược. History được giữ nguyên, chỉ thêm commit. An toàn cho shared branches.
- Nguyên tắc: dùng `reset` cho local, `revert` cho shared branches.

</details>

**2. Giải thích 3 mode của `git reset`.**

<details className="qa">
<summary>Xem đáp án</summary>

- `--soft`: Chỉ di chuyển HEAD. Staging area và working directory giữ nguyên. Thay đổi nằm ở staged.
- `--mixed` (mặc định): Di chuyển HEAD + reset staging area. Working directory giữ nguyên. Thay đổi nằm ở unstaged.
- `--hard`: Di chuyển HEAD + reset staging area + reset working directory. Mọi thay đổi bị xóa. Nguy hiểm nhất.

</details>

**3. Làm sao undo commit cuối mà không mất code?**

<details className="qa">
<summary>Xem đáp án</summary>

```bash
git reset --soft HEAD~1
```

Commit cuối bị undo, nhưng mọi thay đổi vẫn nằm trong staging area, sẵn sàng commit lại. Đây là cách an toàn nhất để undo commit trên local.

</details>

**4. `git commit --amend` có tạo commit mới không?**

<details className="qa">
<summary>Xem đáp án</summary>

Có. `--amend` thực chất tạo một commit hoàn toàn mới (SHA khác) thay thế commit cuối. Commit cũ vẫn tồn tại trong reflog nhưng không còn được branch nào trỏ tới. Đó là lý do amend sau khi push sẽ gây conflict.

</details>

**5. Khi nào dùng `--force-with-lease` thay vì `--force`?**

<details className="qa">
<summary>Xem đáp án</summary>

`--force-with-lease` an toàn hơn `--force` vì nó kiểm tra xem remote branch có commit mới (từ người khác) hay không trước khi force push. Nếu có, lệnh sẽ bị từ chối thay vì ghi đè code đồng nghiệp. Luôn ưu tiên `--force-with-lease` khi cần force push.

</details>

---

## 2. Git Reflog — Khôi phục dữ liệu đã mất

Bài học: [2. Git Reflog — Khôi phục dữ liệu đã mất](../../git/nang-cao/2_git-reflog-va-khu-phuc-du-lieu.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Git reflog là gì? Khác gì với git log?**

<details className="qa">
<summary>Xem đáp án</summary>

`git reflog` ghi lại mọi lần HEAD thay đổi trên local — bao gồm commit, reset, checkout, merge, rebase. Nó khác `git log` ở chỗ:

- `git log` chỉ hiển thị commits reachable từ HEAD hiện tại. Nếu bạn reset xóa commits, `log` không thấy chúng nữa.
- `git reflog` hiển thị TẤT CẢ thay đổi, kể cả commits đã bị "xóa" bởi reset. Nó hoạt động như undo history.
- Reflog chỉ tồn tại local (không push), trong khi log là shared.

</details>

**2. Làm sao khôi phục commit sau git reset --hard?**

<details className="qa">
<summary>Xem đáp án</summary>

1. Chạy `git reflog` để tìm SHA của commit trước khi reset
2. Dùng `git reset --hard <SHA>` để khôi phục
3. Hoặc `git switch -c recovery-branch <SHA>` để tạo branch mới
4. Điều này hoạt động vì `reset --hard` chỉ di chuyển HEAD, không xóa object. Object chỉ bị xóa khi garbage collection chạy (sau 30-90 ngày).

</details>

**3. Reflog entries được lưu bao lâu?**

<details className="qa">
<summary>Xem đáp án</summary>

Mặc định:

- **Reachable entries** (commits vẫn trên branch): 90 ngày (`gc.reflogExpire`)
- **Unreachable entries** (commits mồ côi): 30 ngày (`gc.reflogExpireUnreachable`)
- Có thể cấu hình thay đổi hoặc set `never` để không bao giờ hết hạn.
- Entries chỉ bị xóa khi `git gc` chạy, không phải tự động.

</details>

**4. Dangling object là gì? Làm sao tìm?**

<details className="qa">
<summary>Xem đáp án</summary>

Dangling object là Git object (commit, blob, tree) không còn reference nào trỏ tới — không thuộc branch, tag, hay reflog entry nào. Tìm bằng `git fsck --lost-found`. Dangling objects vẫn tồn tại trên disk cho đến khi garbage collection xóa chúng. Đây là lý do Git "gần như không bao giờ mất dữ liệu" — ngay cả objects bị "xóa" vẫn còn một thời gian.

</details>

**5. Giải thích sự khác nhau giữa `HEAD~n` và `HEAD@{n}`.**

<details className="qa">
<summary>Xem đáp án</summary>

- `HEAD~n`: Đi ngược **n commits** theo parent chain trong commit graph. `HEAD~2` = ông nội của commit hiện tại.
- HEAD@&#123;n&#125;: Đi ngược **n entries** trong reflog — tức n hành động trước đó theo thời gian. HEAD@&#123;2&#125; = HEAD ở thời điểm 2 hành động trước.
- Hai cái này thường cho kết quả khác nhau, đặc biệt khi bạn checkout giữa các branches hoặc dùng reset.

</details>

---

## 3. Git Bisect và Debug — Tìm commit gây bug

Bài học: [3. Git Bisect và Debug — Tìm commit gây bug](../../git/nang-cao/3_git-bisect-va-debug.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Git bisect là gì? Tại sao nó hiệu quả?**

<details className="qa">
<summary>Xem đáp án</summary>

`git bisect` dùng thuật toán binary search để tìm commit đầu tiên gây ra bug. Bạn đánh dấu một commit "good" (không bug) và một commit "bad" (có bug), Git sẽ tự chọn commit ở giữa để bạn test. Mỗi bước loại bỏ một nửa số commits cần kiểm tra.

Hiệu quả vì độ phức tạp O(log n): với 1000 commits chỉ cần ~10 bước thay vì 1000 bước kiểm tra tuần tự. Có thể tự động hóa hoàn toàn bằng `git bisect run <script>`.

</details>

**2. Sự khác nhau giữa `git log -S` và `git log -G`?**

<details className="qa">
<summary>Xem đáp án</summary>

- `-S "string"` (pickaxe): Tìm commits mà **số lần xuất hiện** của chuỗi thay đổi. Nghĩa là chuỗi được thêm mới hoặc xóa đi. Nếu chuỗi chỉ bị di chuyển (refactor) mà số lần xuất hiện không đổi, `-S` sẽ bỏ qua.
- `-G "regex"`: Tìm commits mà **diff** chứa dòng match regex. Bất kỳ thay đổi nào có dòng match đều được hiển thị, kể cả khi chỉ sửa nhỏ trong dòng đó.

Tóm lại: `-S` tìm khi chuỗi xuất hiện/biến mất, `-G` tìm khi dòng chứa pattern bị sửa.

</details>

**3. Làm sao dùng git blame hiệu quả khi team hay format code?**

<details className="qa">
<summary>Xem đáp án</summary>

Tạo file `.git-blame-ignore-revs` chứa SHA của các formatting commits, rồi cấu hình:

```bash
git config blame.ignoreRevsFile .git-blame-ignore-revs
```

Git blame sẽ bỏ qua các commits đó và hiển thị commit logic thực sự. Commit file `.git-blame-ignore-revs` vào repo để cả team dùng được. GitHub cũng hỗ trợ file này trên web UI.

</details>

**4. Giải thích quy trình git bisect từ đầu đến cuối.**

<details className="qa">
<summary>Xem đáp án</summary>

1. `git bisect start` — bắt đầu session
2. `git bisect bad` — đánh dấu commit hiện tại (hoặc chỉ định SHA) là có bug
3. `git bisect good <ref>` — đánh dấu commit không có bug
4. Git checkout commit giữa → bạn test → đánh dấu `good` hoặc `bad`
5. Lặp lại bước 4 cho đến khi Git tìm ra commit đầu tiên gây bug
6. `git bisect reset` — kết thúc, quay về branch ban đầu
7. Có thể tự động hóa bước 4 bằng `git bisect run <script>`

</details>

**5. Làm sao tìm lịch sử của file đã bị xóa?**

<details className="qa">
<summary>Xem đáp án</summary>

```bash
# Xem toàn bộ lịch sử file (kể cả sau khi bị xóa)
git log --all --full-history -- path/to/deleted-file

# Tìm commit xóa file
git log --diff-filter=D -- path/to/deleted-file

# Khôi phục file từ commit trước khi xóa
git checkout <sha-commit-xoa>~1 -- path/to/deleted-file
```

Dùng `--all` để tìm trên tất cả branches, `--full-history` để không bỏ qua history simplification.

</details>

---

## 4. Submodule và Monorepo

Bài học: [4. Submodule và Monorepo](../../git/nang-cao/4_submodule-va-monorepo.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Git Submodule là gì? Hoạt động thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

Git Submodule cho phép nhúng một Git repo bên trong repo khác. Repo chính lưu một con trỏ (SHA commit) đến version cụ thể của submodule, KHÔNG lưu code thực tế. Khi `git submodule update`, Git checkout submodule ở đúng commit được pin.

Cơ chế: file `.gitmodules` chứa URL và path, repo chính track SHA commit của submodule. Mỗi khi update submodule, bạn cần commit con trỏ mới trong repo chính.

</details>

**2. So sánh Monorepo và Polyrepo. Khi nào dùng cái nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Monorepo**: 1 repo chứa tất cả projects. Ưu điểm: code sharing dễ, atomic changes, dependency luôn đồng bộ. Nhược điểm: repo lớn, CI phức tạp, khó phân quyền. Dùng khi: nhiều apps liên quan chặt, shared code nhiều, cùng team phát triển.
- **Polyrepo**: mỗi project 1 repo. Ưu điểm: đơn giản, repo nhỏ, phân quyền rõ ràng, CI đơn giản. Nhược điểm: code sharing khó (publish package), dependency dễ lệch version, cross-repo changes phức tạp. Dùng khi: projects độc lập, team khác nhau, security cần phân quyền.

</details>

**3. Subtree khác Submodule thế nào?**

<details className="qa">
<summary>Xem đáp án</summary>

- **Submodule**: Repo chính chứa con trỏ (reference) đến commit cụ thể của repo con. Clone cần `--recurse-submodules`. Lịch sử tách biệt.
- **Subtree**: Code từ repo con được copy thẳng vào repo chính, trở thành một phần của repo. Clone bình thường. Lịch sử gộp.

Subtree đơn giản hơn cho team (không cần biết gì đặc biệt), nhưng repo lớn hơn. Submodule giữ repo nhỏ nhưng phức tạp hơn.

</details>

**4. Sparse checkout là gì? Tại sao cần?**

<details className="qa">
<summary>Xem đáp án</summary>

Sparse checkout cho phép bạn chỉ checkout một phần thư mục trong repo, thay vì toàn bộ. Rất hữu ích cho monorepo lớn khi developer chỉ cần làm việc với 1-2 packages.

Cách dùng: `git sparse-checkout set apps/web packages/utils`. Git chỉ hiển thị các thư mục được chọn trên disk, nhưng vẫn tracking toàn bộ history. Kết hợp với `--filter=blob:none` (partial clone) để clone siêu nhanh.

</details>

**5. Làm sao xóa Git Submodule đúng cách?**

<details className="qa">
<summary>Xem đáp án</summary>

Xóa submodule cần nhiều bước:

1. `git rm <path>` — xóa submodule khỏi working tree và index
2. `rm -rf .git/modules/<path>` — xóa cached metadata
3. Commit thay đổi

Trong Git cũ hơn, cần thêm: xóa entry trong `.gitmodules`, xóa entry trong `.git/config`, `git rm --cached`. Đây là một trong những điểm phức tạp nhất của submodules.

</details>

---

## 5. Git Hooks và Tự động hóa

Bài học: [5. Git Hooks và Tự động hóa](../../git/nang-cao/5_git-hooks-va-tu-dong-hoa.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Git hooks là gì? Kể tên một vài hooks phổ biến.**

<details className="qa">
<summary>Xem đáp án</summary>

Git hooks là scripts tự động chạy tại các sự kiện Git. Hooks phổ biến:

- `pre-commit`: chạy trước commit, dùng để lint/format code
- `commit-msg`: validate format commit message
- `pre-push`: chạy trước push, dùng để chạy tests
- `pre-receive` (server): chạy trên server trước khi nhận push, dùng để enforce policies

Client hooks nằm trong `.git/hooks/`, server hooks trên Git server.

</details>

**2. Tại sao cần Husky? Vấn đề gì hooks thủ công gặp phải?**

<details className="qa">
<summary>Xem đáp án</summary>

Hooks thủ công nằm trong `.git/hooks/` - thư mục này KHÔNG được Git track, nên không thể share qua `git clone`. Mỗi developer phải tự cài hooks, dẫn đến không ai làm.

Husky giải quyết bằng cách lưu hooks trong `.husky/` (tracked bởi Git) và tự động cài đặt khi chạy `npm install` (nhờ `prepare` script). Toàn team có cùng hooks.

</details>

**3. lint-staged là gì? Tại sao không lint toàn bộ project?**

<details className="qa">
<summary>Xem đáp án</summary>

lint-staged chỉ chạy linter/formatter trên files đã được `git add` (staged), không phải toàn bộ project. Lý do:

- **Tốc độ**: Project lớn có hàng nghìn files, lint tất cả mỗi commit rất chậm
- **Phạm vi**: Chỉ cần kiểm tra code bạn đang commit, không phải code cũ
- **Tránh noise**: Không muốn fix lint errors trong files mình không sửa

</details>

**4. Conventional Commits là gì? Cho ví dụ.**

<details className="qa">
<summary>Xem đáp án</summary>

Conventional Commits là quy ước format commit message: `<type>(<scope>): <description>`. Ví dụ:

- `feat: thêm chức năng tìm kiếm`
- `fix(auth): sửa lỗi token hết hạn`
- `docs: cập nhật README`
- `refactor(api): tách route handlers`

Lợi ích: git log dễ đọc, tự động tạo changelog, dễ tìm commit theo loại. Enforce bằng commitlint + Husky commit-msg hook.

</details>

**5. `--no-verify` dùng khi nào? Tại sao không nên lạm dụng?**

<details className="qa">
<summary>Xem đáp án</summary>

`--no-verify` bỏ qua tất cả hooks (pre-commit, commit-msg). Nên dùng khi:

- WIP commits trên branch cá nhân (sẽ squash/amend sau)
- Hotfix khẩn cấp cần deploy ngay
- Hook bị lỗi cần fix

Không nên lạm dụng vì: hooks tồn tại để đảm bảo chất lượng code. Nếu ai cũng bypass hooks, mục đích cài hooks trở nên vô nghĩa. Code chất lượng kém sẽ lọt vào codebase.

</details>
