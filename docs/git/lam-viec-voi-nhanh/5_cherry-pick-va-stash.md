---
sidebar_position: 5
title: "5. Cherry-pick va Stash"
---

# Cherry-pick và Stash

Trong công việc hàng ngày với Git, bạn sẽ gặp hai tình huống rất thường xuyên: (1) cần **tạm cất thay đổi đang làm dở** để chuyển sang việc khác, và (2) cần **lấy một commit cụ thể** từ branch khác mà không merge toàn bộ. **Stash** và **Cherry-pick** là hai công cụ giúp bạn xử lý chính xác hai tình huống này.

---

## Phần 1: Git Stash -- Tạm cất thay đổi

## 1. Stash là gì và tại sao cần?

### 1.1. Tình huống thực tế

Bạn đang code tính năng mới trên `feature/dashboard`, viết được nửa chừng thì sếp bảo: "Có bug khẩn cấp trên production, sửa ngay!". Bạn cần:

1. Chuyển sang branch `hotfix/urgent`
2. Sửa bug
3. Quay lại `feature/dashboard` và tiếp tục

**Vấn đề:** Bạn chưa muốn commit code đang làm dở (chưa xong, chưa test). Nhưng Git không cho chuyển branch khi có uncommitted changes (trong một số trường hợp).

**Giải pháp:** `git stash` -- **tạm cất (chứa) thay đổi** vào một nơi an toàn, làm sạch working directory, để bạn chuyển branch tự do.

### 1.2. Stash hoạt động thế nào?

```
# Trước khi stash:
Working Directory: có thay đổi (modified files)
Staging Area: có thể có files đã staged

# Sau khi stash:
Working Directory: SẠCH (như vừa commit xong)
Staging Area: SẠCH
Stash stack: thay đổi của bạn được lưu ở đây

# Khi stash pop:
Working Directory: thay đổi được khôi phục
Stash stack: entry bị xóa
```

Stash hoạt động như một **ngăn xếp (stack)** -- Last In, First Out (LIFO):

```
+-------------------+
| stash@{0}: mới nhất |  <-- pop lấy cái này trước
+-------------------+
| stash@{1}: cũ hơn   |
+-------------------+
| stash@{2}: cũ nhất   |
+-------------------+
```

---

## 2. Các lệnh stash cơ bản

### 2.1. `git stash` -- Tạm cất thay đổi

```bash
# Đang làm việc trên feature/dashboard
echo "new feature code" >> dashboard.js
echo "new styles" >> dashboard.css
git add dashboard.js  # Stage 1 file

# Tạm cất tất cả thay đổi (cả staged và unstaged)
git stash
# Saved working directory and index state WIP on feature/dashboard: abc1234 Last commit message

# Kiểm tra: working directory sạch
git status
# On branch feature/dashboard
# nothing to commit, working tree clean

# Bây giờ có thể chuyển branch tự do
git switch hotfix/urgent
```

### 2.2. `git stash list` -- Xem danh sách stash

```bash
git stash list
# stash@{0}: WIP on feature/dashboard: abc1234 Thêm dashboard layout
# stash@{1}: WIP on feature/login: def5678 Tạo form login
# stash@{2}: WIP on main: ghi9012 Update README

# Mỗi entry có:
# stash@{n}  -- index (0 = mới nhất)
# WIP on <branch>  -- branch khi stash
# <hash> <message>  -- commit message gần nhất
```

### 2.3. `git stash pop` -- Lấy lại và xóa khỏi stash

```bash
# Lấy lại thay đổi mới nhất (stash@{0})
git stash pop
# On branch feature/dashboard
# Changes not staged for commit:
#         modified:   dashboard.js
#         modified:   dashboard.css
# Dropped refs/stash@{0} (abc1234...)

# stash@{0} đã bị XÓA khỏi stash list
git stash list
# stash@{1} bây giờ thành stash@{0}
# (các entry dịch lên 1 bậc)
```

### 2.4. `git stash apply` -- Lấy lại nhưng GIỮ trong stash

```bash
# Lấy lại thay đổi nhưng KHÔNG xóa khỏi stash
git stash apply
# Thay đổi được khôi phục
# Nhưng stash entry VẪN CÒN trong list

git stash list
# stash@{0}: WIP on feature/dashboard: abc1234 ...
# Vẫn còn!

# Hữu ích khi: muốn apply cùng stash vào nhiều branch
git stash apply           # Apply stash@{0}
git stash apply stash@{2} # Apply stash cụ thể
```

### 2.5. `git stash drop` và `git stash clear`

```bash
# Xóa 1 stash cụ thể
git stash drop stash@{1}
# Dropped stash@{1} (abc1234...)

# Xóa stash mới nhất
git stash drop
# Dropped refs/stash@{0} (def5678...)

# Xóa TẤT CẢ stash (cẩn thận!)
git stash clear
# Xóa sạch, không lấy lại được!
```

---

## 3. Stash nâng cao

### 3.1. Stash có message -- `git stash push -m`

```bash
# Mặc định: message là "WIP on <branch>: <commit>" -- không mô tả
# Tốt hơn: thêm message mô tả
git stash push -m "Dashboard: đang làm biểu đồ doanh thu"
git stash push -m "Login: thêm remember me checkbox"

# Bây giờ stash list rõ ràng hơn:
git stash list
# stash@{0}: On feature/login: Login: thêm remember me checkbox
# stash@{1}: On feature/dashboard: Dashboard: đang làm biểu đồ doanh thu

# Dễ tìm và apply đúng stash khi cần
```

### 3.2. Stash specific files

```bash
# Chỉ stash 1 hoặc vài file cụ thể
git stash push -m "Chỉ stash file CSS" style.css layout.css

# Các file khác KHÔNG bị stash (vẫn ở working directory)

# Hoặc dùng pattern:
git stash push -m "Stash tất cả JS" -- "*.js"
```

### 3.3. Stash untracked files -- `--include-untracked`

```bash
# Mặc định: git stash CHỈ cất file đã tracked (đã có trong Git)
# File mới tạo (untracked) sẽ KHÔNG được stash!

echo "new file" > brand-new.js
git stash
# brand-new.js VẪN CÒN trong working directory!

# Để stash cả untracked files:
git stash push --include-untracked -m "Cả file mới"
# Hoặc viết tắt:
git stash push -u -m "Cả file mới"

# Bây giờ brand-new.js cũng được stash
git status
# nothing to commit, working tree clean
```

### 3.4. Stash cả ignored files -- `--all`

```bash
# Stash tất cả, kể cả file trong .gitignore
git stash push --all -m "Tất cả kể cả node_modules"
# Hoặc:
git stash push -a -m "Tất cả"

# Hiếm khi cần, nhưng hữu ích khi muốn "reset" hoàn toàn
```

### 3.5. Xem nội dung stash

```bash
# Xem danh sách file trong stash
git stash show
# dashboard.js | 5 +++++
# dashboard.css | 3 +++
# 2 files changed, 8 insertions(+)

# Xem chi tiết diff
git stash show -p
# diff --git a/dashboard.js b/dashboard.js
# +new feature code
# ...

# Xem stash cụ thể
git stash show -p stash@{2}
```

### 3.6. Tạo branch từ stash

```bash
# Khi stash có conflict khi pop (vì branch đã thay đổi nhiều)
# Giải pháp: tạo branch mới từ stash
git stash branch feature/recovered-work stash@{0}
# Tạo branch mới từ commit khi stash
# Apply stash và xóa khỏi list
# Không bao giờ có conflict vì quay về đúng trạng thái cũ
```

---

## 4. Stash workflow thực tế

### 4.1. Workflow "sửa bug khẩn cấp"

```bash
# Đang làm feature/dashboard
# Có file đã sửa nhưng chưa muốn commit
git status
# modified: dashboard.js
# modified: chart.js
# new file: utils.js

# Bước 1: Stash thay đổi
git stash push -u -m "Dashboard: chart và utils đang làm"

# Bước 2: Chuyển sang hotfix
git switch main
git pull origin main
git switch -c hotfix/payment-bug

# Bước 3: Sửa bug
# ... sửa code ...
git add .
git commit -m "fix: sửa lỗi thanh toán null pointer"
git push -u origin hotfix/payment-bug

# Bước 4: Quay lại feature
git switch feature/dashboard

# Bước 5: Lấy lại thay đổi
git stash pop
# Tiếp tục làm việc như chưa có gì xảy ra!
```

### 4.2. Workflow "thử ý tưởng nhanh"

```bash
# Đang làm feature/A, nảy ra ý tưởng cho feature/B
# Không muốn trộn lẫn code

# Stash công việc hiện tại
git stash push -u -m "Feature A: đang làm UI"

# Thử ý tưởng trên branch mới
git switch -c experiment/idea-B
# ... viết code thử ...
# Không ok? Xóa branch
git switch feature/A
git branch -D experiment/idea-B

# Lấy lại công việc
git stash pop
```

---

## Phần 2: Git Cherry-pick -- Chọn commit cụ thể

## 5. Cherry-pick là gì?

### 5.1. Định nghĩa

Cherry-pick cho phép bạn **chọn một (hoặc vài) commit cụ thể** từ branch khác và **áp dụng vào branch hiện tại**. Không cần merge toàn bộ branch -- chỉ lấy những gì bạn cần.

```
# Branch develop có 5 commits:
develop: A---B---C---D---E

# Bạn chỉ cần commit C (sửa bug quan trọng)
# Cherry-pick C vào main:

main:    X---Y---Z---C'
                      ^
                      C' = bản sao của C (hash mới, nội dung giống)

# develop không bị ảnh hưởng
```

### 5.2. Tại sao gọi là "cherry-pick"?

Tưởng tượng một cây cherry có nhiều quả. Bạn không hái cả cây (merge), mà chỉ **nhặt (pick) những quả chín (cherry)** -- những commit cụ thể mà bạn cần.

### 5.3. ASCII diagram chi tiết

```
# Trước cherry-pick:
main:    A---B---C
                  \
develop:           D---E---F---G---H

# Cherry-pick commit F vào main:
main:    A---B---C---F'
                  \
develop:           D---E---F---G---H
#                          ^
#                     Commit gốc vẫn ở develop

# F' có nội dung giống F nhưng HASH KHÁC
# Vì F' có parent khác (C thay vì E)
```

---

## 6. Cherry-pick cơ bản

### 6.1. Cherry-pick một commit

```bash
# Bước 1: Tìm commit hash cần cherry-pick
git log --oneline develop
# ghi9012 (develop) Thêm feature H
# def5678 Sửa bug F          <-- Cần commit này!
# abc1234 Thêm feature E
# ...

# Bước 2: Chuyển sang branch đích
git switch main

# Bước 3: Cherry-pick
git cherry-pick def5678
# [main abc1111] Sửa bug F
#  1 file changed, 5 insertions(+)

# Commit mới trên main với nội dung giống F
# Nhưng hash khác (abc1111 thay vì def5678)
```

### 6.2. Cherry-pick nhiều commits

```bash
# Cherry-pick nhiều commit riêng lẻ
git cherry-pick abc1234 def5678 ghi9012
# Áp dụng 3 commit theo thứ tự

# Cherry-pick một RANGE (từ commit A đến commit B)
git cherry-pick abc1234..ghi9012
# Áp dụng tất cả commit SAU abc1234 đến ghi9012
# CHÚ Ý: KHÔNG bao gồm abc1234!

# Bao gồm cả commit đầu:
git cherry-pick abc1234^..ghi9012
# ^ nghĩa là "cha của abc1234" -> bao gồm abc1234
```

### 6.3. `--no-commit` flag

```bash
# Mặc định: cherry-pick tạo commit mới ngay lập tức
git cherry-pick def5678
# Commit mới được tạo

# Với --no-commit: chỉ áp dụng thay đổi, KHÔNG commit
git cherry-pick --no-commit def5678
# Thay đổi được staged nhưng CHƯA commit
# Bạn có thể:
# - Chỉnh sửa thêm trước khi commit
# - Gộp nhiều cherry-pick thành 1 commit
# - Review thay đổi trước khi commit

git cherry-pick --no-commit abc1234
git cherry-pick --no-commit def5678
# Gộp 2 cherry-pick thành 1 commit
git commit -m "Backport: sửa 2 bug từ develop"
```

### 6.4. Cherry-pick và conflict

```bash
git cherry-pick def5678
# CONFLICT: Merge conflict in app.js

# Giải quyết giống như merge conflict:
# 1. Mở file, sửa conflict markers
# 2. git add app.js
# 3. git cherry-pick --continue

# Hoặc hủy:
git cherry-pick --abort

# Bỏ qua commit này và tiếp tục:
git cherry-pick --skip
```

---

## 7. Khi nào dùng cherry-pick?

### 7.1. Hotfix -- Sửa bug khẩn cấp

```bash
# Bug được phát hiện và sửa trên develop
# Cần deploy fix ngay lên production (main)

# Trên develop:
git switch develop
# ... sửa bug ...
git commit -m "fix: sửa lỗi crash khi user chưa đăng nhập"
# Commit hash: abc1234

# Cherry-pick vào main (production)
git switch main
git cherry-pick abc1234
git push origin main
# Deploy ngay!

# Không cần merge toàn bộ develop (có thể có feature chưa sẵn sàng)
```

### 7.2. Backport -- Sửa bug cho phiên bản cũ

```bash
# Bug được sửa trên main (phiên bản 3.0)
# Cần sửa cho cả phiên bản 2.x (branch release/2.x)

git switch release/2.x
git cherry-pick abc1234  # Commit sửa bug từ main
# Bug được sửa cho cả phiên bản cũ
```

### 7.3. Lấy tính năng cụ thể

```bash
# Team B có một tiện ích (utility) hay trên branch của họ
# Bạn muốn lấy chỉ tiện ích đó, không phải toàn bộ branch

git log --oneline team-b/feature
# ... nhiều commit ...
# def5678 feat: thêm date formatter utility  <-- Chỉ cần cái này

git switch feature/my-feature
git cherry-pick def5678
```

---

## 8. Risks của cherry-pick

### 8.1. Duplicate commits

```
# Sau khi cherry-pick F vào main:
main:    A---B---C---F'
                  \
develop:           D---E---F---G---H

# Khi merge develop vào main sau đó:
main:    A---B---C---F'---M  (merge commit)
                  \      /
develop:           D---E---F---G---H

# F và F' có CÙNG NỘI DUNG nhưng KHÁC HASH
# Git thường xử lý tốt (không conflict)
# Nhưng lịch sử sẽ có 2 commit giống nhau -- confusing
```

### 8.2. Mất context

```bash
# Commit F trên develop phụ thuộc vào commit E (refactor trước đó)
# Cherry-pick chỉ F vào main -- không có E
# => Code có thể bị lỗi vì thiếu context từ E

# Cách phòng tránh:
# 1. Cherry-pick cả E và F
git cherry-pick E F

# 2. Hoặc kiểm tra kỹ commit có phụ thuộc gì không
git show def5678  # Xem nội dung commit trước khi cherry-pick
```

### 8.3. Khi nào KHÔNG nên dùng cherry-pick?

| Không nên | Nên dùng thay thế |
|-----------|-------------------|
| Lấy nhiều commit liên tiếp từ branch khác | `git merge` hoặc `git rebase` |
| "Sao chép" feature toàn bộ | `git merge feature-branch` |
| Thường xuyên cherry-pick giữa 2 branch | Xem lại branching strategy |
| Commit phụ thuộc nhiều commit khác | Merge cả nhóm commit |

---

## 9. So sánh Stash vs Branch cho việc tạm lưu

| Đặc điểm | `git stash` | Tạo branch mới |
|----------|------------|----------------|
| Tốc độ | Nhanh (1 lệnh) | Chậm hơn (3 lệnh: switch, add, commit) |
| Phạm vi | Tạm thời, ngắn hạn | Dài hạn, có tên rõ ràng |
| Chia sẻ | Không (chỉ local) | Có (push lên remote) |
| Lịch sử | Không hiển thị trong git log | Có commit, hiển thị trong log |
| Tìm lại | Khó (stash list không trực quan) | Dễ (git branch liệt kê) |
| Khi nào dùng | Chuyển việc nhanh (vài phút - vài giờ) | Tạm dừng lâu (vài ngày+) |

### Ví dụ so sánh

```bash
# Stash: chuyển việc nhanh
git stash push -u -m "Đang làm X"
git switch hotfix/urgent
# ... sửa bug (30 phút) ...
git switch feature/X
git stash pop

# Branch: tạm dừng lâu
git switch -c wip/feature-X-paused
git add .
git commit -m "WIP: tạm dừng feature X"
git switch hotfix/urgent
# ... sửa bug ...
# Vài ngày sau:
git switch wip/feature-X-paused
# Tiếp tục làm
```

---

## 10. ASCII diagrams cho cherry-pick flow

### 10.1. Hotfix flow

```
# 1. Bug phát hiện trên production (main)
main:     A---B---C              (production)
                   \
develop:            D---E---F    (development)

# 2. Sửa bug trên develop
develop:            D---E---F---G  (G = bug fix)

# 3. Cherry-pick G vào main
main:     A---B---C---G'         (G' = cherry-pick của G)
                   \
develop:            D---E---F---G

# 4. Deploy main (có fix)
# 5. Khi develop merge vào main sau đó, Git xử lý G và G' tự động
```

### 10.2. Backport flow

```
# Main đã ở phiên bản 3.0, cần fix cho 2.x
main (v3.0):      A---B---C---D---FIX---E---F
                                   ^
                                   |
release/2.x:  X---Y---Z---FIX'   (cherry-pick FIX)
```

### 10.3. Feature pick flow

```
# Team A cần 1 utility từ team B
team-B/feature:    P---Q---R---S---T
                               ^
                               | cherry-pick
team-A/feature:    X---Y---S'---Z
```

---

## 11. Thực hành tổng hợp

### Bài tập 1: Stash workflow

```bash
mkdir stash-lab && cd stash-lab
git init

# Tạo commit ban đầu
echo "version 1" > app.js
git add app.js
git commit -m "Initial commit"

# Bắt đầu làm feature
git switch -c feature/new-ui
echo "new ui code" >> app.js
echo "styles" > style.css

# Đột nhiên cần chuyển việc!
git stash push -u -m "New UI: đang làm"

# Kiểm tra
git status             # Clean
git stash list         # Thấy stash

# Chuyển sang sửa bug
git switch main
echo "bugfix" >> app.js
git add app.js
git commit -m "fix: sửa bug"

# Quay lại feature
git switch feature/new-ui
git stash pop
git status             # Thay đổi được khôi phục!
```

### Bài tập 2: Cherry-pick workflow

```bash
mkdir cherry-lab && cd cherry-lab
git init

# Setup main
echo "main v1" > app.js
git add app.js
git commit -m "A: initial"

# Tạo develop và thêm commits
git switch -c develop
echo "feature 1" > f1.js
git add f1.js
git commit -m "D: thêm feature 1"

echo "bugfix" >> app.js
git add app.js
git commit -m "E: sửa bug trong app.js"

echo "feature 2" > f2.js
git add f2.js
git commit -m "F: thêm feature 2"

# Chỉ cần commit E (bugfix) cho main
git log --oneline
# abc3 F: thêm feature 2
# abc2 E: sửa bug trong app.js    <-- Cần cái này
# abc1 D: thêm feature 1
# abc0 A: initial

# Cherry-pick vào main
git switch main
git cherry-pick abc2  # Thay abc2 bằng hash thực tế
# Chỉ commit bugfix được áp dụng, feature 1 và 2 không

git log --oneline
# def1 (HEAD -> main) E: sửa bug trong app.js
# abc0 A: initial
```

### Bài tập 3: Cherry-pick với --no-commit

```bash
# Tiếp tục từ bài tập 2
# Muốn lấy cả feature 1 và 2 nhưng gộp thành 1 commit

git cherry-pick --no-commit abc1  # Feature 1
git cherry-pick --no-commit abc3  # Feature 2

git status
# Thay đổi từ cả 2 commit được staged

git commit -m "feat: backport feature 1 và 2 từ develop"
# Chỉ 1 commit gọn gàng
```

---

## 12. Lỗi thường gặp

### Lỗi 1: Stash pop bị conflict

```bash
# Stash lúc trước, nhưng branch đã thay đổi nhiều
git stash pop
# CONFLICT: Merge conflict in app.js

# Cách 1: Giải quyết conflict
# Mở file, sửa conflict markers
git add app.js
# CHÚ Ý: stash KHÔNG bị xóa khi pop có conflict!
# Phải drop thủ công sau khi giải quyết:
git stash drop

# Cách 2: Tạo branch mới từ stash (không bao giờ conflict)
git stash branch feature/recovered stash@{0}
```

### Lỗi 2: Stash nhưng không thấy file mới

```bash
# Tạo file mới
echo "new" > new-file.js
git stash
# new-file.js VẪN CÒN! (untracked)

# Dùng -u để stash cả untracked files
git stash push -u -m "Cả file mới"
```

### Lỗi 3: Cherry-pick nhầm commit

```bash
# Cherry-pick nhầm
git cherry-pick wrong-hash
# Oh no!

# Hủy commit vừa tạo (chưa push):
git reset --hard HEAD~1
# Quay lại trạng thái trước cherry-pick
```

### Lỗi 4: Cherry-pick mà quên dependency

```bash
# Commit B phụ thuộc commit A (B dùng function tạo ở A)
# Chỉ cherry-pick B:
git cherry-pick B
# Code bị lỗi vì thiếu function từ A!

# Cách đúng:
git cherry-pick A B  # Cherry-pick cả hai, theo thứ tự
```

### Lỗi 5: Quên stash và làm mất

```bash
# Stash rồi quên mất
# Sau 1 thời gian, stash vẫn còn (không tự động hết hạn)
git stash list
# Nhưng nếu bạn làm git stash clear hoặc drop...

# Phòng tránh:
# 1. Luôn dùng message: git stash push -m "mô tả"
# 2. Kiểm tra stash list định kỳ
# 3. Nếu tạm dừng lâu -> dùng branch thay vì stash
```

---

## 13. Câu hỏi phỏng vấn

### Câu 1: Git stash là gì? Khi nào bạn sử dụng nó?

**Trả lời:** `git stash` tạm cất (lưu trữ) các thay đổi chưa commit (cả staged và unstaged) vào một ngăn xếp (stack), làm sạch working directory. Dùng khi: (1) cần chuyển branch nhưng chưa muốn commit (code chưa xong), (2) cần pull từ remote nhưng có local changes, (3) muốn thử nghiệm trên clean state. `git stash pop` lấy lại thay đổi và xóa khỏi stack. `git stash apply` lấy lại nhưng giữ trong stack. Mặc định, stash không bao gồm untracked files -- dùng `-u` để bao gồm.

### Câu 2: Phân biệt `git stash pop` và `git stash apply`.

**Trả lời:** Cả hai đều khôi phục thay đổi từ stash. Khác biệt: `pop` = apply + drop (lấy ra và xóa khỏi stack), `apply` = chỉ lấy ra (không xóa, stash vẫn còn trong stack). Dùng `apply` khi: muốn apply cùng stash vào nhiều branch, hoặc muốn giữ stash làm backup. Lưu ý: nếu `pop` gặp conflict, stash sẽ **không bị xóa** -- bạn phải giải quyết conflict rồi tự `git stash drop`.

### Câu 3: Cherry-pick là gì? Cho ví dụ tình huống thực tế.

**Trả lời:** Cherry-pick áp dụng một commit cụ thể từ branch này sang branch khác, tạo commit mới với cùng nội dung nhưng hash khác. Tình huống thực tế: team phát hiện bug trên production, bug đã được sửa trên branch develop (commit abc123). Thay vì merge toàn bộ develop (có thể có feature chưa sẵn sàng), dùng `git cherry-pick abc123` trên main để chỉ lấy commit sửa bug. Deploy ngay mà không ảnh hưởng các feature đang phát triển.

### Câu 4: Cherry-pick có những rủi ro gì?

**Trả lời:** (1) **Duplicate commits**: commit gốc và cherry-pick có cùng nội dung nhưng hash khác, gây nhầm lẫn khi đọc lịch sử và có thể conflict khi merge sau đó. (2) **Mất context**: commit có thể phụ thuộc commit khác (ví dụ: dùng function được tạo ở commit trước) -- cherry-pick chỉ 1 commit sẽ thiếu dependency. (3) **Conflict**: commit được tạo trên context khác nên dễ gây conflict khi áp dụng. Cách giảm rủi ro: chỉ cherry-pick khi thật sự cần thiết, ưu tiên merge/rebase, và luôn test sau khi cherry-pick.

### Câu 5: So sánh stash và tạo branch mới để tạm lưu code. Khi nào dùng cái nào?

**Trả lời:** **Stash** phù hợp cho tạm dừng ngắn (vài phút đến vài giờ): nhanh (1 lệnh), chỉ ở local, không tạo commit. **Branch** phù hợp cho tạm dừng dài (vài ngày+): có tên rõ ràng, có thể push lên remote chia sẻ, có commit trong lịch sử dễ tìm lại. Quy tắc: nếu bạn quay lại trong cùng ngày -> stash. Nếu không chắc bao giờ quay lại, hoặc cần chia sẻ với người khác -> branch. Không nên để stash quá nhiều (> 5 entries) vì khó quản lý.

---

## Tóm tắt

### Stash

| Lệnh | Chức năng |
|------|-----------|
| `git stash` | Tạm cất thay đổi (chỉ tracked files) |
| `git stash push -u -m "msg"` | Stash với message, cả untracked files |
| `git stash push file1 file2` | Stash chỉ định files |
| `git stash list` | Xem danh sách stash |
| `git stash show -p` | Xem nội dung stash (diff) |
| `git stash pop` | Lấy lại và xóa khỏi stack |
| `git stash apply` | Lấy lại nhưng giữ trong stack |
| `git stash drop stash@{n}` | Xóa 1 stash cụ thể |
| `git stash clear` | Xóa tất cả stash |
| `git stash branch <name>` | Tạo branch từ stash |

### Cherry-pick

| Lệnh | Chức năng |
|------|-----------|
| `git cherry-pick <hash>` | Áp dụng 1 commit |
| `git cherry-pick A B C` | Áp dụng nhiều commit |
| `git cherry-pick A..B` | Áp dụng range (không gồm A) |
| `git cherry-pick A^..B` | Áp dụng range (gồm cả A) |
| `git cherry-pick --no-commit <hash>` | Áp dụng nhưng không commit |
| `git cherry-pick --continue` | Tiếp tục sau khi resolve conflict |
| `git cherry-pick --abort` | Hủy cherry-pick |
| `git cherry-pick --skip` | Bỏ qua commit hiện tại |

**Ghi nhớ:** Stash để "tạm cất", cherry-pick để "nhặt chọn". Cả hai là công cụ không thể thiếu trong workflow hàng ngày của developer.
