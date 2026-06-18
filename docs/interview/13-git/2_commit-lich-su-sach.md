---
sidebar_position: 2
title: "2. Commit & Lịch sử sạch"
---

# Commit & Lịch sử sạch

> *Nhóm câu này kiểm tra kỹ năng tạo ra một lịch sử Git "có thể đọc được": sửa commit lỗi, viết message theo chuẩn, tách thay đổi thành các đơn vị nhỏ, và dọn dẹp history trước khi merge. Người phỏng vấn muốn xem bạn coi commit là tài liệu cho người sau, chứ không phải nơi "đổ" code.*

---

## Câu 7: Sửa commit vừa tạo mà không tạo commit mới `[Basic]`

### Câu hỏi
> "Bạn vừa commit nhưng phát hiện message viết sai, hoặc quên thêm một file vào commit đó. Làm sao sửa lại mà không phải tạo thêm một commit 'fix typo' rác?"

### Giải thích lý thuyết

Lệnh chủ lực ở đây là `git commit --amend`. Nó **không** sửa commit cũ tại chỗ — Git là immutable, mọi commit đều bất biến. Thay vào đó, `--amend` **tạo ra một commit mới** thay thế commit cũ ở vị trí `HEAD`, gộp luôn những gì đang stage. Hệ quả quan trọng: commit mới có **hash khác** commit cũ.

Có hai tình huống phổ biến:

| Tình huống | Lệnh | Ghi chú |
|---|---|---|
| Sửa message sai | `git commit --amend` | Mở editor để sửa message |
| Sửa message ngay trên dòng lệnh | `git commit --amend -m "message mới"` | Không mở editor |
| Quên thêm file (không muốn đổi message) | `git add file && git commit --amend --no-edit` | `--no-edit` giữ nguyên message cũ |

> **Insight phỏng vấn:** Điểm khiến ứng viên "rớt" hay "đậu" ở câu này là phần **cảnh báo về hash**. Vì `--amend` đổi hash, nếu commit đó **đã push** lên nhánh chung, lần push sau sẽ bị từ chối (non-fast-forward). Lúc đó bắt buộc phải `git push --force-with-lease`, và **chỉ nên làm trên nhánh cá nhân của bạn**, không bao giờ trên `main`/`develop`. `--force-with-lease` an toàn hơn `--force` vì nó từ chối push nếu remote đã có commit mới mà bạn chưa thấy (tránh ghi đè công sức người khác).

Quy tắc vàng: **amend thoải mái khi CHƯA push; cực kỳ thận trọng khi ĐÃ push.**

### Code minh hoạ
```bash
# 1. Sửa message của commit vừa tạo (mở editor)
git commit --amend

# 2. Sửa message ngay trên dòng lệnh, không mở editor
git commit --amend -m "feat: thêm endpoint đăng nhập"

# 3. Quên thêm file -> stage rồi amend, GIỮ NGUYÊN message cũ
git add src/auth/login.ts
git commit --amend --no-edit

# 4. Nếu commit đã được push lên NHÁNH CÁ NHÂN -> đẩy lại an toàn
git push --force-with-lease origin feature/login
```

### Đáp án mẫu
> "Nếu chỉ sai message, em chạy `git commit --amend` để sửa lại message. Nếu quên file, em `git add` file đó rồi `git commit --amend --no-edit` để gộp vào commit cũ mà giữ nguyên message. Điều quan trọng em luôn nhớ là `--amend` tạo commit mới với hash khác, nên em chỉ amend thoải mái khi chưa push. Nếu commit đã push lên nhánh cá nhân của em, em phải `git push --force-with-lease`, và tuyệt đối không amend rồi force lên nhánh chung như main."

---

## Câu 8: Conventional Commits và vì sao phải enforce bằng commitlint `[Intermediate]`

### Câu hỏi
> "Conventional Commits là gì? Team mình đã 'thống nhất' viết commit theo chuẩn rồi, tại sao bạn vẫn đề xuất cài commitlint?"

### Giải thích lý thuyết

**Conventional Commits** là một quy ước đặt tên commit message theo cấu trúc cố định:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Các `type` thông dụng:

| Type | Ý nghĩa | Ảnh hưởng semver |
|---|---|---|
| `feat` | Thêm tính năng mới | MINOR (1.**2**.0) |
| `fix` | Sửa lỗi | PATCH (1.0.**1**) |
| `docs` | Chỉ sửa tài liệu | Không |
| `refactor` | Cấu trúc lại code, không đổi behavior | Không |
| `test` | Thêm/sửa test | Không |
| `chore` | Việc lặt vặt (deps, config) | Không |
| `perf` | Tối ưu hiệu năng | PATCH |

`scope` là phạm vi tuỳ chọn (ví dụ `feat(auth):`). Khi có thay đổi phá vỡ tương thích, ta dùng `!` sau type hoặc footer `BREAKING CHANGE:` — điều này đẩy version lên MAJOR.

**Lợi ích cốt lõi:**
- **Tự sinh CHANGELOG**: công cụ như `standard-version` / `semantic-release` quét message để dựng changelog tự động.
- **Tự tính semver**: `feat` → minor, `fix` → patch, `BREAKING CHANGE` → major. Không phải bump version thủ công.
- **History đọc được**: nhìn message biết ngay loại thay đổi.

> **Insight phỏng vấn:** Mấu chốt của câu này là câu "tại sao không chỉ agree là đủ?". Câu trả lời: **"agree" là một thoả thuận bằng miệng, không scale.** Người mới vào quên, ai đó vội vàng gõ "update code", và sau 200 commit thì changelog tự động vỡ. **Convention chỉ có giá trị khi được enforce bằng máy.** Cài `commitlint` chạy ở `commit-msg` hook (qua Husky) để chặn commit sai ngay tại máy dev, và chạy lại trên **CI** để chặn cả những người bypass hook local (`--no-verify`). Hai lớp: local cho UX nhanh, CI cho tính bắt buộc.

### Code minh hoạ
```bash
# Commit đúng chuẩn
git commit -m "feat(auth): thêm đăng nhập bằng Google"
git commit -m "fix(cart): sửa lỗi tính sai tổng tiền khi có voucher"

# Commit có breaking change -> sẽ bump MAJOR version
git commit -m "feat(api)!: đổi response format của /users sang dạng phân trang"

# Cài đặt enforce trong team (Node)
npm install --save-dev @commitlint/cli @commitlint/config-conventional husky
echo "module.exports = { extends: ['@commitlint/config-conventional'] };" > commitlint.config.js
npx husky init
echo 'npx --no -- commitlint --edit "$1"' > .husky/commit-msg

# Commit sai chuẩn sẽ BỊ CHẶN ngay
git commit -m "update code"   # -> commitlint báo lỗi, commit thất bại
```

### Đáp án mẫu
> "Conventional Commits là quy ước message dạng `type(scope): subject`, với các type như feat, fix, docs, refactor. Nhờ chuẩn này em có thể tự sinh changelog và tự tính version theo semver: feat lên minor, fix lên patch, BREAKING CHANGE lên major. Còn lý do phải dùng commitlint thay vì chỉ thống nhất miệng là vì thoả thuận miệng không scale — chỉ cần một người gõ 'update code' là changelog tự động hỏng. Em sẽ enforce bằng commitlint ở commit-msg hook qua Husky để chặn tại máy dev, và chạy lại trên CI để chặn cả những người bypass hook local."

---

## Câu 9: Atomic commits và vì sao gộp nhiều việc vào một commit là anti-pattern `[Intermediate]`

### Câu hỏi
> "Atomic commit là gì? Tại sao commit `feat: add user auth + fix navbar + update deps` lại là một thói quen xấu?"

### Giải thích lý thuyết

**Atomic commit** = một commit chỉ chứa **một thay đổi logic độc lập, hoàn chỉnh và tự đứng vững được**. "Atomic" theo nghĩa nguyên tử: không thể chia nhỏ hơn nữa mà vẫn còn ý nghĩa, và không nên gộp với việc khác.

Commit `feat: add user auth + fix navbar + update deps` gộp **ba mối quan tâm khác nhau** vào một đơn vị. Điều này phá vỡ gần như mọi công cụ điều tra lịch sử của Git:

| Thao tác | Vấn đề khi commit không atomic |
|---|---|
| `git revert` | Muốn gỡ lỗi navbar nhưng buộc phải gỡ luôn cả auth và deps |
| `git cherry-pick` | Muốn mang bản vá navbar sang nhánh khác nhưng kéo theo cả auth chưa muốn |
| `git bisect` | Tìm commit gây bug, nhưng commit khả nghi chứa 3 thứ → không biết thứ nào gây ra |
| Code review | Reviewer phải nhảy giữa 3 ngữ cảnh trong một diff, dễ bỏ sót |

> **Insight phỏng vấn:** Người phỏng vấn muốn nghe bạn nối atomic commit với **khả năng truy vết và phục hồi**. Một history gồm các commit atomic là một history mà bạn có thể **revert chính xác, cherry-pick chọn lọc, và bisect hiệu quả**. Đây không phải vấn đề thẩm mỹ — nó là vấn đề vận hành khi sự cố xảy ra lúc 2 giờ sáng.

Công cụ để đạt atomic khi đã lỡ sửa nhiều thứ trong working tree: **`git add -p`** (patch mode). Nó cho bạn chọn **từng hunk** để stage, nhờ đó tách các thay đổi nằm chung file thành nhiều commit riêng biệt.

### Code minh hoạ
```bash
# ANTI-PATTERN: gộp 3 việc vào 1 commit
git add .
git commit -m "feat: add user auth + fix navbar + update deps"

# ĐÚNG: tách thành 3 commit atomic, dùng add -p để chọn từng phần
git add -p            # chọn các hunk thuộc về phần auth
git commit -m "feat(auth): thêm luồng đăng nhập người dùng"

git add src/components/Navbar.tsx
git commit -m "fix(navbar): sửa lỗi menu không đóng trên mobile"

git add package.json package-lock.json
git commit -m "chore(deps): nâng cấp react lên 19"
```

### Đáp án mẫu
> "Atomic commit là một commit chỉ chứa một thay đổi logic độc lập và hoàn chỉnh. Commit gộp auth + navbar + deps là anti-pattern vì nó phá các công cụ điều tra của Git: muốn revert riêng navbar thì buộc gỡ luôn auth, muốn cherry-pick navbar sang nhánh khác thì kéo theo cả phần chưa muốn, và khi bisect tìm bug thì không biết trong ba thứ đó cái nào gây ra. Khi em lỡ sửa nhiều thứ cùng lúc, em dùng `git add -p` để stage từng hunk và tách ra thành các commit riêng. History atomic giúp em revert chính xác và truy vết nhanh khi có sự cố."

---

## Câu 10: Interactive rebase để dọn history trước khi merge PR `[Intermediate]`

### Câu hỏi
> "Trước khi merge PR, bạn dọn dẹp lịch sử commit bằng interactive rebase như thế nào? Giải thích squash, fixup, reword, drop."

### Giải thích lý thuyết

`git rebase -i HEAD~n` mở một **todo list** liệt kê `n` commit gần nhất (cũ ở trên, mới ở dưới). Bạn sửa "lệnh" ở đầu mỗi dòng để chỉ cho Git biết phải làm gì với từng commit khi viết lại history.

| Lệnh | Tác dụng |
|---|---|
| `pick` | Giữ nguyên commit (mặc định) |
| `reword` | Giữ commit nhưng sửa lại message |
| `edit` | Dừng tại commit đó để sửa nội dung (xem Câu 11) |
| `squash` | Gộp commit này vào commit phía trên, **giữ và gộp cả message** |
| `fixup` | Gộp như squash nhưng **vứt bỏ message** của commit này |
| `drop` | Xoá hẳn commit khỏi history |

Quy trình điển hình: bạn có một chuỗi commit lộn xộn ("wip", "fix typo", "address review") và muốn biến thành vài commit gọn gàng, message rõ ràng trước khi reviewer xem.

Ví dụ một todo list sau khi chỉnh:

```
pick   a1b2c3d feat(auth): thêm form đăng nhập
reword e4f5g6h feat(auth): thm validate emai   # sửa lại message bị gõ sai
fixup  i7j8k9l wip
squash m0n1o2p address review comments
drop   q3r4s5t debug console.log tạm thời
```

> **Insight phỏng vấn:** Phải nêu được **Golden Rule of Rebasing**: *không bao giờ rebase một nhánh đã được chia sẻ / đã push cho người khác.* Rebase viết lại history (đổi hash), nên nếu đồng nghiệp đã pull nhánh đó, history của họ và bạn sẽ phân kỳ, gây xung đột rối loạn. Interactive rebase chỉ an toàn trên **nhánh feature cá nhân của bạn**, dọn dẹp **trước khi** mở/merge PR.

### Code minh hoạ
```bash
# Mở todo list cho 5 commit gần nhất
git rebase -i HEAD~5

# Trong editor, đổi 'pick' thành reword/squash/fixup/drop tuỳ ý, lưu & đóng.
# Git lần lượt áp dụng; với reword/squash sẽ mở editor cho bạn sửa message.

# Nếu giữa chừng gặp conflict:
git status                 # xem file conflict
# ... sửa conflict ...
git add <file>
git rebase --continue

# Lỡ tay, muốn huỷ toàn bộ rebase:
git rebase --abort
```

### Đáp án mẫu
> "Em chạy `git rebase -i HEAD~n` để mở todo list các commit gần nhất, rồi đổi lệnh đầu mỗi dòng: `reword` để sửa message, `squash` để gộp commit và giữ cả message, `fixup` để gộp nhưng bỏ message rác, `drop` để xoá commit thừa như console.log debug. Mục tiêu là biến chuỗi commit 'wip', 'fix typo' thành vài commit atomic message rõ ràng trước khi reviewer xem. Em luôn nhớ golden rule: chỉ rebase trên nhánh feature cá nhân chưa share, không bao giờ rebase nhánh người khác đã pull vì nó viết lại hash và làm history của họ phân kỳ."

---

## Câu 11: Chế độ `edit` trong interactive rebase làm được gì mà squash không làm được `[Senior]`

### Câu hỏi
> "Trong interactive rebase, chế độ `edit` cho phép bạn làm những gì mà `squash` không làm được?"

### Giải thích lý thuyết

`squash`/`fixup` chỉ **gộp** các commit lại — tức đi theo hướng "giảm số commit". Chúng không cho bạn can thiệp vào **nội dung bên trong** một commit hay **tăng** số commit.

`edit` mạnh hơn hẳn: khi rebase chạy tới commit đánh dấu `edit`, nó **dừng lại NGAY TẠI commit đó** (sau khi đã apply commit, với `HEAD` trỏ vào nó) và trả quyền điều khiển cho bạn. Lúc này bạn có thể:

| Khả năng | Cách làm | Tại sao squash không làm được |
|---|---|---|
| **Tách 1 commit thành nhiều commit** | `git reset HEAD^` để bỏ stage nội dung commit, rồi `git add -p` chia thành nhiều commit nhỏ | squash chỉ gộp, không chia |
| **Sửa nội dung file của commit cũ** | Sửa file trực tiếp → `git add` → `git commit --amend` | squash không cho sửa diff bên trong |
| **Chèn commit mới vào giữa history** | Tạo file/sửa code → `git add` → `git commit` (commit mới) rồi `--continue` | squash không tạo commit mới |

Đây là điểm phân biệt cấp Senior: `edit` cho phép **viết lại nội dung và cấu trúc** của lịch sử, không chỉ gộp.

> **Insight phỏng vấn:** Tình huống kinh điển: một commit khổng lồ lỡ trộn hai tính năng. Với `edit` bạn `git reset HEAD^` để "mở" commit ra thành các thay đổi chưa stage, rồi dùng `git add -p` để tái cấu trúc thành nhiều commit atomic — đúng tinh thần Câu 9 nhưng áp dụng **hồi tố** lên history cũ. Đây là thứ squash hoàn toàn bất lực.

### Code minh hoạ
```bash
git rebase -i HEAD~4
# Đổi commit cần xử lý từ 'pick' thành 'edit', lưu & đóng.
# Rebase dừng lại tại commit đó.

# --- TÁCH 1 commit thành nhiều commit atomic ---
git reset HEAD^          # bỏ commit nhưng giữ thay đổi ở working tree (unstaged)
git add -p               # chọn nhóm hunk thứ nhất
git commit -m "feat(auth): thêm form đăng nhập"
git add -p               # chọn nhóm hunk thứ hai
git commit -m "feat(auth): thêm validate email"

# --- HOẶC sửa nội dung file của commit cũ ---
# (sửa file...) 
git add src/foo.ts
git commit --amend       # vá thẳng vào commit đang dừng

# --- HOẶC chèn một commit hoàn toàn mới vào giữa ---
git add new-file.ts
git commit -m "chore: thêm file config còn thiếu"

# Xong, tiếp tục rebase
git rebase --continue
```

### Đáp án mẫu
> "`squash` và `fixup` chỉ gộp commit lại, đi theo hướng giảm số commit và không động được vào nội dung bên trong. `edit` thì dừng rebase ngay tại commit đó và trao quyền cho em làm ba việc squash không làm được: thứ nhất là tách một commit thành nhiều commit atomic bằng `git reset HEAD^` rồi `git add -p`; thứ hai là sửa nội dung file của một commit cũ rồi `git commit --amend`; thứ ba là chèn một commit hoàn toàn mới vào giữa history. Nói cách khác, squash chỉ gộp, còn edit cho em viết lại cả nội dung lẫn cấu trúc của lịch sử."

---

## Câu 12: Khi nào dùng squash merge thay vì merge commit `[Intermediate]`

### Câu hỏi
> "Khi merge một PR, khi nào bạn chọn squash merge thay vì merge commit? Trade-off của mỗi cách là gì?"

### Giải thích lý thuyết

Có ba chiến lược hợp nhất một PR vào nhánh đích, mỗi cách tạo ra một hình dạng history khác nhau:

| Chiến lược | History tạo ra | Ưu điểm | Nhược điểm |
|---|---|---|---|
| **Merge commit** (`--no-ff`) | Giữ nguyên mọi commit của nhánh + 1 merge commit | Giữ đầy đủ ngữ cảnh, biết PR nào gồm những commit nào | Noisy: kèm cả commit "wip", "fix typo"; đồ thị nhánh rối |
| **Squash merge** | Gộp toàn bộ PR thành **1 commit** trên nhánh đích | History tuyến tính, sạch; mỗi PR = 1 dòng | Mất chi tiết từng commit; khó bisect bên trong PR; "đè" tác giả các commit nhỏ |
| **Rebase merge** | Phát lại từng commit của PR lên đầu nhánh đích, **không** tạo merge commit | Tuyến tính mà vẫn giữ từng commit | Viết lại hash; chỉ tốt khi commit trong PR đã atomic sẵn |

**Khi nào nên squash:**
- Nhánh feature có nhiều commit lộn xộn ("wip", "lint", "address review") mà bạn không muốn dọn thủ công bằng rebase.
- Team coi **mỗi PR là một đơn vị thay đổi**; bạn muốn `main` đọc như một danh sách feature gọn gàng, dễ revert nguyên PR.

**Khi nào nên merge commit:**
- PR lớn, các commit bên trong **đã atomic và có ý nghĩa độc lập** (muốn giữ để bisect/revert từng phần).
- Team cần truy vết đầy đủ ngữ cảnh quá trình phát triển.

> **Insight phỏng vấn:** Đừng trả lời "cái nào tốt hơn" một cách tuyệt đối — đó là bẫy. Câu trả lời cấp cao là: **chọn một chiến lược nhất quán cho cả repo** rồi cấu hình branch protection để enforce. Khuyến nghị thực dụng phổ biến: **squash merge** cho phần lớn team sản phẩm (history `main` sạch, mỗi PR một commit, revert dễ), kết hợp với commit message của squash tuân theo Conventional Commits để vẫn sinh được changelog. Giữ merge commit cho các trường hợp đặc biệt cần bảo toàn từng commit.

### Code minh hoạ
```bash
# Merge commit (giữ mọi commit + tạo merge commit)
git checkout main
git merge --no-ff feature/login

# Squash merge thủ công (gộp toàn bộ feature thành 1 commit chưa commit)
git checkout main
git merge --squash feature/login
git commit -m "feat(auth): thêm luồng đăng nhập (#142)"

# Rebase merge (phát lại từng commit, history tuyến tính, không merge commit)
git checkout feature/login
git rebase main
git checkout main
git merge --ff-only feature/login

# Trên GitHub: cấu hình ở Settings > General > Pull Requests
# chỉ bật đúng một loại nút merge (vd: Allow squash merging) để team nhất quán.
```

### Đáp án mẫu
> "Em chọn squash merge khi nhánh feature có nhiều commit lộn xộn như 'wip' hay 'fix typo' và em muốn `main` đọc tuyến tính, mỗi PR đúng một commit, dễ revert nguyên PR. Trade-off là mất chi tiết từng commit nên khó bisect bên trong PR. Em chọn merge commit khi PR lớn mà các commit bên trong đã atomic, có ý nghĩa độc lập và muốn giữ để truy vết. Quan điểm của em là không có cái nào tuyệt đối tốt hơn — quan trọng là cả team thống nhất một chiến lược và enforce bằng branch protection. Thực tế em hay đề xuất squash merge với message theo Conventional Commits để history sạch mà vẫn auto sinh changelog."

---

## Câu 13: Signed commits với GPG/SSH và khi nào enterprise cần enforce `[Senior]`

### Câu hỏi
> "Signed commits với GPG hoặc SSH là gì? Khi nào một team enterprise cần bắt buộc ký commit?"

### Giải thích lý thuyết

Trường `author` và `committer` trong một commit Git **chỉ là text tự khai báo** qua `git config user.name`/`user.email`. Bất kỳ ai cũng có thể đặt `user.email` thành email của CEO rồi commit — Git không xác thực gì cả. Đây là lỗ hổng **impersonation / author spoofing**.

**Signed commits** giải quyết điều này: bạn dùng khoá riêng (GPG hoặc SSH) để **ký mật mã** lên commit. Người khác (và GitHub) dùng khoá công khai tương ứng để xác minh rằng commit thực sự do chủ khoá đó tạo ra và **nội dung không bị sửa**. Trên GitHub, commit hợp lệ hiển thị badge **"Verified"**.

| Cơ chế ký | Đặc điểm |
|---|---|
| **GPG** | Chuẩn lâu đời, web-of-trust; setup phức tạp hơn, cần quản lý keyring |
| **SSH signing** | Dùng lại chính SSH key sẵn có (Git 2.34+); setup đơn giản hơn, ngày càng phổ biến |

**Khi nào enterprise cần enforce:**
- **Compliance / kiểm toán**: các chuẩn như SOC 2, ISO 27001 yêu cầu chứng minh ai thực sự thay đổi code.
- **Supply-chain security**: chống tấn công kiểu chèn commit giả mạo dưới danh nghĩa maintainer; đảm bảo mọi thay đổi vào nhánh release đều truy nguyên được tới một danh tính đã xác thực.
- **Repo có giá trị cao**: thanh toán, hạ tầng, mã nguồn lõi sản phẩm.

> **Insight phỏng vấn:** Hai ý "ăn điểm" Senior: (1) ký commit **không** mã hoá code và **không** chống được code dở — nó chỉ xác thực **danh tính tác giả** và **tính toàn vẹn**; đừng nói quá tác dụng. (2) Convention chỉ thực sự bắt buộc khi được **enforce ở server**: bật **branch protection rule "Require signed commits"** trên nhánh `main`/release, để mọi commit/PR không ký sẽ bị **từ chối merge**. Ký ở máy dev mà không enforce server thì chỉ là tự nguyện.

### Code minh hoạ
```bash
# --- Cấu hình ký bằng SSH (Git >= 2.34, đơn giản) ---
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true     # tự động ký mọi commit

# --- Hoặc ký bằng GPG ---
gpg --list-secret-keys --keyid-format=long  # lấy key id
git config --global user.signingkey <GPG_KEY_ID>
git config --global commit.gpgsign true

# Ký thủ công một commit lẻ
git commit -S -m "feat(payment): thêm xác thực 3D Secure"

# Kiểm tra chữ ký của lịch sử
git log --show-signature

# (Phía server) Trên GitHub: Settings > Branches > Branch protection rule
#   -> bật "Require signed commits" cho nhánh main
#   -> commit/PR không ký sẽ bị chặn merge.
```

### Đáp án mẫu
> "Signed commit là dùng khoá riêng GPG hoặc SSH để ký mật mã lên commit, nhờ đó GitHub và người khác xác minh được commit thật sự do chủ khoá tạo và nội dung không bị sửa — commit hợp lệ sẽ có badge Verified. Nó giải quyết vấn đề author spoofing, vì mặc định trường author chỉ là text tự khai, ai cũng giả được. Em sẽ dùng SSH signing vì tận dụng được key sẵn có và setup đơn giản. Enterprise cần enforce khi có yêu cầu compliance như SOC 2, hoặc lo supply-chain cho repo giá trị cao như thanh toán, hạ tầng. Quan trọng là phải enforce ở server bằng branch protection 'Require signed commits' để chặn merge commit không ký, chứ ký ở local mà không bắt buộc thì chỉ là tự nguyện. Em cũng lưu ý ký chỉ xác thực danh tính và toàn vẹn, không mã hoá code."
