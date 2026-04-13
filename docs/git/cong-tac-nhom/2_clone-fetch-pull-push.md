---
sidebar_position: 2
title: "2. Clone, Fetch, Pull, Push — 4 lệnh remote cốt lõi"
---

# Clone, Fetch, Pull, Push — 4 lệnh remote cốt lõi

Trong Git, có 4 lệnh chính để tương tác với remote repository: **clone**, **fetch**, **pull**, và **push**. Đây là 4 lệnh bạn sẽ dùng **hàng ngày** khi làm việc nhóm. Hiểu rõ từng lệnh, sự khác biệt giữa chúng, và khi nào dùng lệnh nào sẽ giúp bạn tránh được rất nhiều rắc rối.

---

## 1. `git clone` — Tải repo từ remote về local

`git clone` là lệnh bạn dùng **đúng một lần** khi bắt đầu làm việc với một dự án. Nó tải toàn bộ repository (code, lịch sử commit, branches, tags) từ remote về máy tính của bạn.

### Cú pháp cơ bản

```bash
# Clone qua HTTPS
git clone https://github.com/username/project.git

# Clone qua SSH
git clone git@github.com:username/project.git

# Clone vào thư mục khác tên
git clone https://github.com/username/project.git my-folder
```

### Các options hữu ích

#### `--depth` — Shallow clone (clone nông)

Khi repo có lịch sử commit rất dài (hàng nghìn commit), clone toàn bộ sẽ rất chậm. `--depth` giúp bạn chỉ tải N commit gần nhất:

```bash
# Chỉ tải 1 commit gần nhất (nhanh nhất)
git clone --depth 1 https://github.com/torvalds/linux.git

# Tải 10 commit gần nhất
git clone --depth 10 https://github.com/username/project.git
```

**Khi nào dùng:**
- CI/CD pipeline — chỉ cần code mới nhất, không cần lịch sử
- Repo rất lớn (Linux kernel, Chromium...)
- Chỉ muốn xem code nhanh, không cần đóng góp

**Nhược điểm:** Không thể xem toàn bộ lịch sử, không thể blame đầy đủ.

#### `--branch` — Clone một nhánh cụ thể

```bash
# Clone và checkout nhánh "develop" thay vì "main"
git clone --branch develop https://github.com/username/project.git
# Viết tắt:
git clone -b develop https://github.com/username/project.git
```

#### `--single-branch` — Chỉ clone một nhánh

Mặc định, `git clone` tải **tất cả** branches. Dùng `--single-branch` để chỉ tải một nhánh:

```bash
# Chỉ clone nhánh main
git clone --single-branch https://github.com/username/project.git

# Kết hợp với --branch để clone nhánh khác
git clone --single-branch --branch develop https://github.com/username/project.git
```

#### Kết hợp options cho tốc độ nhanh nhất

```bash
# Clone nhanh nhất có thể: 1 commit, 1 nhánh
git clone --depth 1 --single-branch https://github.com/username/project.git
```

### Clone tạo ra những gì?

```bash
git clone https://github.com/username/project.git
cd project

# Cấu trúc sau khi clone:
# project/
# ├── .git/              <-- thư mục Git (lịch sử, config, remotes)
# ├── src/               <-- code nguồn
# ├── tests/             <-- tests
# ├── README.md
# └── ...

# Remote "origin" được tự động tạo
git remote -v
# origin  https://github.com/username/project.git (fetch)
# origin  https://github.com/username/project.git (push)

# Nhánh hiện tại là nhánh mặc định của remote (thường là main)
git branch
# * main
```

---

## 2. `git fetch` — Tải thay đổi, KHÔNG merge

`git fetch` tải những thay đổi mới nhất từ remote về local, nhưng **KHÔNG tự động merge** vào code của bạn. Nó chỉ cập nhật **remote-tracking branches** (ví dụ: `origin/main`).

### Tại sao fetch an toàn?

```
Trước khi fetch:
  Local:   A---B---C (main)
  Remote:  A---B---C---D---E (main)

Sau khi fetch:
  Local:   A---B---C (main)            <-- code của bạn KHÔNG thay đổi
           A---B---C---D---E (origin/main) <-- chỉ cập nhật tracking branch
```

Code trong working directory của bạn **hoàn toàn không bị ảnh hưởng**. Bạn có thể xem thay đổi trước khi quyết định merge.

### Cú pháp

```bash
# Fetch tất cả branches từ origin
git fetch origin

# Fetch một nhánh cụ thể
git fetch origin main

# Fetch từ tất cả remotes
git fetch --all

# Fetch và xóa remote-tracking branches đã bị xóa trên remote
git fetch --prune
# Viết tắt:
git fetch -p
```

### Workflow an toàn với fetch

```bash
# Bước 1: Tải thay đổi mới nhất
git fetch origin

# Bước 2: Xem có gì mới
git log main..origin/main --oneline
# abc1234 feat: add search feature
# def5678 fix: login bug
# ghi9012 refactor: database queries

# Bước 3: Xem chi tiết thay đổi
git diff main..origin/main

# Bước 4: Nếu ổn, merge vào local
git merge origin/main

# Hoặc rebase (giữ lịch sử sạch hơn)
git rebase origin/main
```

### `git fetch --prune` — Dọn dẹp remote-tracking branches

Khi ai đó xóa nhánh trên remote, remote-tracking branch trong local của bạn vẫn còn. Dùng `--prune` để dọn dẹp:

```bash
# Trước khi prune
git branch -r
# origin/main
# origin/develop
# origin/feature/old-feature   <-- nhánh này đã bị xóa trên remote

# Fetch với prune
git fetch --prune

# Sau khi prune
git branch -r
# origin/main
# origin/develop
# (origin/feature/old-feature đã bị xóa)
```

---

## 3. `git pull` — Fetch + Merge (tất cả trong 1 lệnh)

`git pull` = `git fetch` + `git merge`. Nó tải thay đổi từ remote và **tự động merge** vào nhánh hiện tại.

### Cú pháp

```bash
# Pull từ remote tracking branch (thường dùng nhất)
git pull

# Pull từ nhánh cụ thể
git pull origin main

# Pull với rebase thay vì merge
git pull --rebase
# Viết tắt:
git pull -r
```

### `git pull` vs `git pull --rebase`

Đây là sự khác biệt **RẤT QUAN TRỌNG**:

#### `git pull` (merge — mặc định)

```
Trước pull:
  Local:   A---B---C (main)
  Remote:  A---B---D---E (origin/main)

Sau git pull (merge):
  Local:   A---B---C-------M (main)
                \         /
                 D---E---+

  M = merge commit (commit tự động tạo)
```

**Kết quả:** Tạo ra **merge commit** — lịch sử commit có nhánh rẽ, nhìn phức tạp.

#### `git pull --rebase`

```
Trước pull:
  Local:   A---B---C (main)
  Remote:  A---B---D---E (origin/main)

Sau git pull --rebase:
  Local:   A---B---D---E---C' (main)

  C' = commit C được "đặt lại" trên đầu E
```

**Kết quả:** Lịch sử commit **thẳng một đường**, sạch sẽ và dễ đọc hơn.

### Tại sao `pull --rebase` thường tốt hơn?

| Tiêu chí | `git pull` (merge) | `git pull --rebase` |
|-----------|-------------------|-------------------|
| **Lịch sử** | Nhiều merge commit, rối | Thẳng, sạch |
| **Đọc log** | Khó theo dõi | Dễ theo dõi |
| **Conflict** | Giải quyết 1 lần | Giải quyết từng commit |
| **An toàn** | Không thay đổi commit | Tạo lại commit (hash mới) |
| **Khi nào dùng** | Merge nhánh feature | Cập nhật nhánh đang làm |

**Khuyên dùng:** Cấu hình `pull --rebase` làm mặc định:

```bash
# Cấu hình toàn cục: pull luôn dùng rebase
git config --global pull.rebase true
```

### Pull conflict resolution

Khi pull mà code trên remote **xung đột** với code local:

```bash
git pull origin main
# Auto-merging src/app.js
# CONFLICT (content): Merge conflict in src/app.js
# Automatic merge failed; fix conflicts and then commit the result.

# Bước 1: Mở file bị conflict
# Bạn sẽ thấy:
# <<<<<<< HEAD
# const title = "My App";     <-- code của bạn (local)
# =======
# const title = "Our App";    <-- code trên remote
# >>>>>>> origin/main

# Bước 2: Sửa conflict — chọn code đúng, xóa markers
# const title = "Our App";

# Bước 3: Đánh dấu đã giải quyết
git add src/app.js

# Bước 4: Hoàn tất merge
git commit -m "fix: resolve merge conflict in app.js"
```

Nếu dùng `pull --rebase` và gặp conflict:

```bash
git pull --rebase origin main
# CONFLICT...

# Sửa conflict
git add src/app.js

# Tiếp tục rebase (KHÔNG commit)
git rebase --continue

# Nếu muốn hủy rebase và quay lại trạng thái trước
git rebase --abort
```

---

## 4. `git push` — Đẩy commit lên remote

`git push` gửi các commit từ local repo lên remote repo.

### Cú pháp

```bash
# Push nhánh hiện tại lên remote tracking branch
git push

# Push nhánh cụ thể lên remote
git push origin main

# Push và thiết lập upstream tracking (-u flag)
git push -u origin feature/login
# Sau lần đầu dùng -u, chỉ cần: git push
```

### `-u` flag — Thiết lập upstream tracking

Khi bạn tạo nhánh local mới và push lần đầu, Git không biết push đi đâu:

```bash
# Tạo nhánh mới
git checkout -b feature/login

# Push lần đầu — cần -u để thiết lập tracking
git push -u origin feature/login
# Branch 'feature/login' set up to track remote branch 'feature/login' from 'origin'.

# Từ lần sau, chỉ cần:
git push
git pull
# Git tự biết push/pull từ origin/feature/login
```

### Push specific branch

```bash
# Push nhánh "develop" lên remote (dù đang ở nhánh khác)
git push origin develop

# Push tất cả branches
git push --all

# Push tất cả tags
git push --tags
```

### Xóa remote branch

```bash
# Xóa nhánh "feature/old" trên remote
git push origin --delete feature/old
# Viết tắt:
git push origin :feature/old

# Xóa nhánh local tương ứng
git branch -d feature/old
```

---

## 5. So sánh chi tiết: Fetch vs Pull

| Tiêu chí | `git fetch` | `git pull` |
|-----------|------------|-----------|
| **Hành động** | Chỉ tải dữ liệu | Tải + merge |
| **Thay đổi code?** | KHÔNG | CÓ |
| **An toàn** | Rất an toàn | Có thể gây conflict |
| **Merge tự động?** | Không | Có |
| **Dùng khi** | Muốn xem trước | Muốn cập nhật nhanh |
| **Tương đương** | `git fetch` | `git fetch` + `git merge` |
| **Working dir** | Không thay đổi | Có thể thay đổi |
| **Khi conflict** | Không xảy ra | Cần giải quyết ngay |
| **Khuyên dùng** | Khi cần cẩn thận | Khi tin chắc an toàn |

**Quy tắc ngón tay cái:**
- **Đang code dở** -> dùng `git fetch` rồi xem trước
- **Vừa bắt đầu ngày mới** -> dùng `git pull --rebase`
- **Nhánh chung nhiều người** -> dùng `git fetch` + review + `git merge`

---

## 6. `git push --force` và `--force-with-lease`

### `git push --force` — Nguy hiểm!

`--force` ép remote chấp nhận lịch sử commit của bạn, **ghi đè** lịch sử trên remote:

```bash
# NGUY HIỂM: Ghi đè toàn bộ remote branch
git push --force origin main
# Viết tắt:
git push -f origin main
```

```
Trước force push:
  Remote:  A---B---C---D---E (main)
  Local:   A---B---X---Y (main)  <-- lịch sử khác remote

Sau force push:
  Remote:  A---B---X---Y (main)
  # Commit C, D, E đã BỊ MẤT trên remote!
```

**Khi nào dùng `--force`:**
- Sau khi rebase nhánh feature CÁ NHÂN (chỉ mình bạn dùng)
- Sau khi amend commit chưa ai pull
- **KHÔNG BAO GIỜ** dùng trên nhánh `main` hoặc nhánh chung

### `git push --force-with-lease` — An toàn hơn

`--force-with-lease` kiểm tra trước: nếu ai đó đã push commit mới lên remote mà bạn chưa fetch, lệnh sẽ **bị từ chối** thay vì ghi đè:

```bash
# An toàn hơn: kiểm tra trước khi force push
git push --force-with-lease origin feature/login
```

```
Tình huống: Bạn rebase xong, muốn force push

Nếu không ai push thêm commit:
  -> --force-with-lease cho phép push -> OK

Nếu đồng đội đã push commit mới:
  -> --force-with-lease TỪ CHỐI push
  -> Bạn cần fetch, rebase lại, rồi thử lại
  -> Code của đồng đội được bảo toàn!
```

**So sánh:**

| Lệnh | Kiểm tra trước? | Rủi ro mất code | Khuyên dùng? |
|-------|-----------------|-----------------|--------------|
| `git push --force` | KHÔNG | CAO | Tránh |
| `git push --force-with-lease` | CÓ | THẤP | Dùng thay --force |

---

## 7. Push Rejected — Tại sao và cách xử lý

### Lỗi phổ biến nhất

```bash
git push origin main
# ! [rejected]        main -> main (fetch first)
# error: failed to push some refs to 'origin'
# hint: Updates were rejected because the remote contains work that you do
# not have locally. Integrate the remote changes before pushing again.
```

### Tại sao bị rejected?

```
Remote:  A---B---C---D (main)   <-- có commit D mà bạn chưa có
Local:   A---B---C---E (main)   <-- bạn có commit E

Git từ chối push vì nếu cho phép, commit D sẽ bị mất!
```

### Cách xử lý (đúng)

```bash
# Cách 1: Pull rebase rồi push lại (khuyên dùng)
git pull --rebase origin main
# Giải quyết conflict nếu có
git push origin main

# Kết quả:
# Remote:  A---B---C---D---E' (main)
# Lịch sử thẳng, sạch

# Cách 2: Pull merge rồi push lại
git pull origin main
# Giải quyết conflict nếu có
git push origin main

# Kết quả:
# Remote:  A---B---C---D
#                   \    \
#                    E---M (main)  <-- merge commit
```

### Cách xử lý (SAI — tránh làm)

```bash
# SAI: Force push khi bị rejected (mất code của người khác!)
git push --force origin main  # KHÔNG LÀM ĐIỀU NÀY!
```

---

## 8. Workflow thực tế hàng ngày

### Buổi sáng bắt đầu ngày làm việc

```bash
# Bước 1: Cập nhật nhánh main
git checkout main
git pull --rebase origin main

# Bước 2: Cập nhật nhánh feature đang làm
git checkout feature/login
git rebase main
# (Giải quyết conflict nếu có)
```

### Trong ngày: Code → Commit → Push

```bash
# Code...
# Kiểm tra thay đổi
git status
git diff

# Commit
git add src/login.js src/auth.js
git commit -m "feat: add login form validation"

# Push lên remote
git push origin feature/login
# Lần đầu: git push -u origin feature/login
```

### Trước khi tạo Pull Request

```bash
# Cập nhật main mới nhất
git checkout main
git pull --rebase origin main

# Rebase feature lên main mới nhất
git checkout feature/login
git rebase main

# Force push feature branch (vì đã rebase)
git push --force-with-lease origin feature/login

# Tạo Pull Request trên GitHub
```

### Sơ đồ workflow đầy đủ

```
  clone                code              commit           push
  (1 lần)             (hàng ngày)       (nhiều lần)      (khi xong)
    |                    |                  |               |
    v                    v                  v               v
+--------+    +-------------+    +-----------+    +----------+
| Remote | -> | Working Dir | -> | Staging   | -> | Local    | -> Remote
| (GitHub)|   | (code)      |    | (git add) |    | (commit) |    (push)
+--------+    +-------------+    +-----------+    +----------+
    |                                                   ^
    |              fetch (xem trước)                     |
    +---------------------------------------------------+
    |              pull  (cập nhật ngay)                 |
    +---------------------------------------------------+
```

---

## 9. Mẹo hữu ích

### Cấu hình mặc định cho pull rebase

```bash
# Toàn cục: pull luôn dùng rebase
git config --global pull.rebase true

# Cấu hình cho repo cụ thể
git config pull.rebase true
```

### Alias cho các lệnh hay dùng

```bash
# Fetch + prune (dọn dẹp nhánh đã xóa)
git config --global alias.fp 'fetch --prune'

# Pull rebase
git config --global alias.pr 'pull --rebase'

# Push force with lease
git config --global alias.pf 'push --force-with-lease'
```

### Xem sự khác biệt trước khi pull

```bash
# Fetch trước
git fetch origin

# Xem commit mới
git log HEAD..origin/main --oneline

# Xem diff
git diff HEAD..origin/main

# Nếu ổn, merge
git merge origin/main
```

---

## 10. Lỗi thường gặp

### Lỗi 1: `fatal: No configured push destination`

```bash
# Lỗi: nhánh chưa có upstream
git push
# fatal: No configured push destination.

# Cách sửa: thiết lập upstream
git push -u origin feature/login
```

### Lỗi 2: `error: src refspec main does not match any`

```bash
# Lỗi: nhánh "main" không tồn tại trong local
git push origin main
# error: src refspec main does not match any

# Nguyên nhân: có thể nhánh mặc định là "master", không phải "main"
git branch  # Xem tên nhánh hiện tại
# * master

# Cách sửa: đổi tên nhánh hoặc push đúng tên
git branch -m master main  # Đổi tên
git push -u origin main
```

### Lỗi 3: Pull conflict khi có uncommitted changes

```bash
# Lỗi: đang có thay đổi chưa commit
git pull origin main
# error: Your local changes to 'src/app.js' would be overwritten by merge.

# Cách sửa 1: Commit trước rồi pull
git add .
git commit -m "wip: save current work"
git pull --rebase origin main

# Cách sửa 2: Stash (cất tạm) rồi pull
git stash
git pull --rebase origin main
git stash pop  # Lấy lại thay đổi đã cất
```

### Lỗi 4: Clone quá chậm (repo lớn)

```bash
# Repo rất lớn, clone chậm
git clone https://github.com/chromium/chromium.git
# ... (mất hàng giờ)

# Cách sửa: shallow clone
git clone --depth 1 --single-branch https://github.com/chromium/chromium.git
```

### Lỗi 5: Quên -u khi push nhánh mới

```bash
# Sau khi push không có -u
git push origin feature/login

# Lần sau chạy git push không đối số sẽ lỗi
git push
# fatal: The current branch feature/login has no upstream branch.

# Cách sửa: thiết lập upstream
git push -u origin feature/login
# Hoặc:
git branch -u origin/feature/login
```

---

## 11. Câu hỏi phỏng vấn

### Câu 1: Phân biệt `git fetch` và `git pull`. Khi nào dùng lệnh nào?

**Trả lời:** `git fetch` chỉ tải dữ liệu từ remote về local và cập nhật remote-tracking branches (ví dụ `origin/main`), nhưng KHÔNG thay đổi code trong working directory. `git pull` = `git fetch` + `git merge`, tức là tải dữ liệu VÀ tự động merge vào nhánh hiện tại. Dùng `fetch` khi muốn xem trước thay đổi, dùng `pull` khi tin chắc muốn cập nhật ngay. Trong thực tế, `git pull --rebase` được khuyến khích vì giữ lịch sử commit sạch sẽ.

### Câu 2: `git pull --rebase` khác gì `git pull`? Tại sao nhiều team ưa thích rebase?

**Trả lời:** `git pull` mặc định dùng merge, tạo ra merge commit mỗi khi remote có commit mới. `git pull --rebase` đặt lại các commit local lên đầu commit mới từ remote, tạo lịch sử thẳng (linear history). Nhiều team ưa thích rebase vì: (1) lịch sử commit dễ đọc, (2) không có merge commit thừa, (3) dễ debug bằng `git bisect`, (4) git log nhìn sạch sẽ hơn.

### Câu 3: Khi nào bạn dùng `git push --force-with-lease` thay vì `git push --force`?

**Trả lời:** Luôn dùng `--force-with-lease` thay vì `--force` khi cần force push. `--force` ghi đè remote không kiểm tra, có thể mất code của người khác. `--force-with-lease` kiểm tra xem remote có commit mới nào mà bạn chưa fetch không — nếu có, lệnh bị từ chối, bảo vệ code của đồng đội. Tình huống cần force push: sau khi rebase hoặc amend commit trên nhánh feature cá nhân.

### Câu 4: Push bị rejected — nguyên nhân và cách xử lý?

**Trả lời:** Push bị rejected khi remote có commit mà local chưa có, tức là lịch sử bị phân kỳ (diverge). Cách xử lý: (1) `git pull --rebase origin <branch>` để tải commit mới và đặt commit local lên trên, (2) giải quyết conflict nếu có, (3) push lại. Cách sai: dùng `--force` vì sẽ ghi đè commit của người khác.

### Câu 5: Giải thích quy trình hoàn chỉnh từ clone đến push.

**Trả lời:** (1) `git clone <url>` — tải repo từ remote về local, tạo remote `origin` tự động. (2) Tạo nhánh feature: `git checkout -b feature/xyz`. (3) Code và commit: `git add` + `git commit`. (4) Push nhánh lên remote: `git push -u origin feature/xyz`. (5) Tạo Pull Request trên GitHub. (6) Sau khi merge, cập nhật local: `git checkout main && git pull --rebase origin main`. (7) Xóa nhánh feature: `git branch -d feature/xyz`.

### Câu 6: `--depth 1` khi clone có ý nghĩa gì? Ưu và nhược điểm?

**Trả lời:** `--depth 1` tạo shallow clone, chỉ tải commit mới nhất thay vì toàn bộ lịch sử. Ưu điểm: tốc độ clone nhanh hơn nhiều, tiết kiệm dung lượng, phù hợp cho CI/CD pipeline. Nhược điểm: không có đầy đủ lịch sử commit, không thể dùng `git log` hoặc `git blame` đầy đủ, không thể tạo PR đúng cách trong một số trường hợp. Có thể "unshallow" sau bằng `git fetch --unshallow`.
