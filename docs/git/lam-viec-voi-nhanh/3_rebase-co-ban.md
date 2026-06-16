---
sidebar_position: 3
title: "3. Rebase — Viết lại lịch sử commit"
---

# Rebase — Viết lại lịch sử commit

Nếu merge là cách "an toàn và trung thực" để gộp nhánh, thì rebase là cách "sạch sẽ và tinh tế". Rebase viết lại lịch sử commit để tạo ra một **dòng thời gian thẳng tắp**, như thể bạn làm mọi thứ theo trình tự hoàn hảo. Đây là công cụ mạnh mẽ nhưng cũng là **con dao hai lưỡi** -- dùng đúng thì tuyệt vời, dùng sai thì thảm họa.

---

## Mục lục

- [Vì sao có rebase?](#vì-sao-có-rebase)
- [1. Rebase là gì?](#1-rebase-là-gì)
- [2. Rebase cơ bản](#2-rebase-cơ-bản)
- [3. Rebase vs Merge -- So sánh chi tiết](#3-rebase-vs-merge-so-sánh-chi-tiết)
- [4. Golden Rule -- Quy tắc vàng](#4-golden-rule-quy-tắc-vàng)
- [5. Interactive rebase -- Sức mạnh thực sự](#5-interactive-rebase-sức-mạnh-thực-sự)
- [6. `git rebase --onto` -- Rebase nâng cao](#6-git-rebase-onto-rebase-nâng-cao)
- [7. Xử lý conflict trong rebase](#7-xử-lý-conflict-trong-rebase)
- [8. Workflow thực tế: Feature branch + Rebase](#8-workflow-thực-tế-feature-branch-rebase)
- [9. Risks và cách phòng tránh](#9-risks-và-cách-phòng-tránh)
- [10. Lỗi thường gặp](#10-lỗi-thường-gặp)
- [11. Câu hỏi phỏng vấn](#11-câu-hỏi-phỏng-vấn)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao có rebase?

**Vấn đề:**

```bash
# Nhánh feature sống lâu, main liên tục có commit mới
# Mỗi lần cập nhật bạn lại merge main vào feature -> sinh merge commit
git switch feature/login
git merge main   # merge commit #1
# ...vài ngày sau, main lại đổi
git merge main   # merge commit #2
git merge main   # merge commit #3

# Lịch sử rối như "mạng nhện": nhiều merge commit đan xen
git log --oneline --graph
# *   M3 Merge branch 'main' into feature/login
# |\
# | * ...
# *   M2 Merge branch 'main' into feature/login
# |\
# | * ...
# *   M1 Merge branch 'main' into feature/login
# => Khó đọc, khó review, lịch sử commit lộn xộn lúc gửi PR
```

**Giải pháp:**

```bash
# git rebase: ĐẶT LẠI các commit của nhánh lên trên đỉnh nhánh khác
git switch feature/login
git rebase main
# Lịch sử THẲNG, gọn, không còn merge commit đan xen
git log --oneline --graph
# * H' Kết nối API
# * G' Thêm validation
# * F' Tạo form login
# * E  (main) commit mới nhất của main
# => Một đường thẳng dễ đọc

# rebase -i: sửa/gộp/sắp xếp commit trước khi gửi PR
git rebase -i HEAD~3
```

:::tip[Dùng thực tế]

- Cập nhật feature theo main mà vẫn giữ lịch sử phẳng (thay merge lặp đi lặp lại bằng `git rebase main`).
- Dọn commit trước PR: gộp các commit "wip", "fix typo" bằng `git rebase -i` (squash/fixup) cho lịch sử sạch, dễ review.
- Lịch sử tuyến tính giúp `git bisect` dò lỗi nhanh và chính xác hơn.
- LƯU Ý QUAN TRỌNG: KHÔNG rebase nhánh đã chia sẻ/đã push chung (rebase viết lại lịch sử) -- chỉ rebase nhánh của riêng bạn.

:::

---

## 1. Rebase là gì?

### 1.1. Định nghĩa đơn giản

Rebase = **di chuyển base (gốc) của branch** đến một vị trí mới. Thay vì gộp 2 dòng lịch sử lại (như merge), rebase **đặt lại các commit của bạn lên đầu** branch đích.

### 1.2. ASCII diagram -- Trước và sau rebase

```
# TRƯỚC REBASE:
# feature/login được tạo từ commit C của main
# Sau đó, main có thêm commit D, E

main:          A---B---C---D---E
                        \
feature/login:           F---G---H

# Base của feature/login là commit C
# Nhưng main đã đi xa hơn (D, E)
```

```
# SAU REBASE (git rebase main):
# Các commit F, G, H được "nhổ ra" và "đặt lại" sau E

main:          A---B---C---D---E
                                \
feature/login:                   F'---G'---H'

# F', G', H' là các commit MỚI (hash mới, nội dung tương tự)
# Base mới của feature/login là commit E (tip của main)
# Lịch sử là một đường thẳng -- như thể bạn làm F, G, H sau E
```

**Điều quan trọng:** F', G', H' là các commit **hoàn toàn mới** -- chúng có hash khác với F, G, H gốc. Git đã tạo lại chúng trên nền tảng mới (E thay vì C).

### 1.3. Tại sao gọi là "rebase"?

- **Base** = điểm gốc mà branch của bạn bắt đầu (commit C)
- **Rebase** = thay đổi base đó (từ C sang E)
- Nói cách khác: "đặt lại nền tảng" cho branch của bạn

---

## 2. Rebase cơ bản

### 2.1. Lệnh cơ bản

```bash
# Đang ở feature/login
git switch feature/login

# Rebase lên main (đặt lại base là tip của main)
git rebase main

# Kết quả: các commit của feature/login được đặt lại sau main
# Applying: F - Tạo form login
# Applying: G - Thêm validation
# Applying: H - Kết nối API
```

### 2.2. Quy trình chi tiết

```bash
# Bước 1: Cập nhật main mới nhất
git switch main
git pull origin main

# Bước 2: Chuyển sang feature branch
git switch feature/login

# Bước 3: Rebase lên main
git rebase main
# Nếu không có conflict -> Xong!
# Nếu có conflict -> Giải quyết từng commit một

# Bước 4: Kiểm tra kết quả
git log --oneline --graph
# Lịch sử là một đường thẳng đẹp
```

### 2.3. Ví dụ thực tế

```bash
# Setup
mkdir rebase-lab && cd rebase-lab
git init

echo "line 1" > file.txt
git add file.txt
git commit -m "A: initial"

echo "line 2" >> file.txt
git add file.txt
git commit -m "B: thêm dòng 2"

# Tạo feature branch
git switch -c feature/update
echo "feature line" >> file.txt
git add file.txt
git commit -m "F: thêm dòng feature"

# Quay lại main, thêm commit mới
git switch main
echo "main line" > main.txt
git add main.txt
git commit -m "C: thêm file main.txt"

# Bây giờ: main có commit C, feature có commit F
# Rebase feature lên main
git switch feature/update
git rebase main
# Applying: F: thêm dòng feature

# Kiểm tra
git log --oneline --graph --all
# * F' (HEAD -> feature/update) thêm dòng feature
# * C (main) thêm file main.txt
# * B thêm dòng 2
# * A initial
# => Một đường thẳng đẹp!
```

---

## 3. Rebase vs Merge -- So sánh chi tiết

### 3.1. Bảng so sánh

| Đặc điểm         | Merge                                | Rebase                                    |
| ---------------- | ------------------------------------ | ----------------------------------------- |
| **Lịch sử**      | Giữ nguyên, có nhánh rẽ              | Viết lại, một đường thẳng                 |
| **Merge commit** | Có (với 3-way merge)                 | Không                                     |
| **Commit gốc**   | Giữ nguyên hash                      | Tạo commit mới (hash mới)                 |
| **An toàn**      | An toàn hơn (không thay đổi lịch sử) | Nguy hiểm nếu dùng trên shared branch     |
| **Conflict**     | Giải quyết 1 lần                     | Có thể giải quyết nhiều lần (từng commit) |
| **Git log**      | Phức tạp, nhiều nhánh                | Sạch, dễ đọc                              |
| **Rollback**     | Dễ (revert merge commit)             | Khó hơn (commits đã bị viết lại)          |
| **Thông tin**    | Giữ đầy đủ (ai, khi nào, branch nào) | Mất thông tin về branch gốc               |

### 3.2. Minh họa trực quan

```
# MERGE: Giữ nguyên lịch sử, có merge commit
main: A---B---C---D---E---M
               \         /
feature:        F---G---H

# REBASE: Viết lại lịch sử, một đường thẳng
main: A---B---C---D---E
                        \
feature:                 F'---G'---H'

# Sau khi merge feature vào main (fast-forward vì rebase):
main: A---B---C---D---E---F'---G'---H'
# Một đường thẳng hoàn hảo!
```

### 3.3. Khi nào dùng merge, khi nào dùng rebase?

**Dùng MERGE khi:**

- Gộp feature vào main/develop (shared branch)
- Muốn giữ lại lịch sử đầy đủ
- Làm việc nhóm và branch đã push lên remote
- Cần rollback dễ dàng

**Dùng REBASE khi:**

- Cập nhật feature branch với thay đổi mới từ main
- Dọn dẹp lịch sử trước khi tạo PR
- Branch chỉ có mình bạn làm việc (chưa push hoặc chỉ mình bạn push)
- Muốn lịch sử sạch trước khi merge vào main

**Workflow phổ biến nhất:**

```bash
# 1. Rebase feature branch lên main (cập nhật và dọn dẹp)
git switch feature/login
git rebase main

# 2. Merge vào main với --no-ff (giữ dấu vết)
git switch main
git merge --no-ff feature/login
# Kết quả: lịch sử sạch + biết feature nào đã merge
```

---

## 4. Golden Rule -- Quy tắc vàng

:::danger KHÔNG BAO GIỜ REBASE NHÁNH PUBLIC/SHARED

Nếu branch của bạn đã được push lên remote và **người khác đang làm việc trên đó**, TUYỆT ĐỐI KHÔNG REBASE.

:::

### 4.1. Tại sao?

```
# Bạn và đồng nghiệp cùng làm trên feature/login:

# Trước khi bạn rebase:
origin:        A---B---C
                        \
feature/login:           F---G---H   (đồng nghiệp có F, G, H)

# Bạn rebase:
origin:        A---B---C---D---E
                                \
feature/login:                   F'---G'---H'  (hash MỚI!)

# Bạn force push lên remote
# Đồng nghiệp pull về:
# - Git thấy F, G, H (cũ) và F', G', H' (mới) là các commit KHÁC NHAU
# - Xảy ra conflict, duplicate commits, lịch sử hỗn độn
# - Đồng nghiệp rất khó chịu với bạn!
```

### 4.2. Quy tắc đơn giản

- **Branch chỉ mình bạn dùng** -> Rebase thoải mái
- **Branch nhiều người dùng** -> Chỉ dùng merge, KHÔNG rebase
- **Đã push lên remote?** -> Rebase chỉ khi bạn là người duy nhất làm việc trên branch đó (và bạn hiểu hậu quả của force push)

```bash
# Sau khi rebase branch đã push, bạn PHẢI force push:
git push --force-with-lease origin feature/login
# --force-with-lease an toàn hơn --force
# Nó kiểm tra: remote có thay đổi không từ lần push cuối?
# Nếu có -> Từ chối (có thể người khác đã push)
# Nếu không -> Force push
```

---

## 5. Interactive rebase -- Sức mạnh thực sự

### 5.1. Interactive rebase là gì?

Interactive rebase (`git rebase -i`) cho phép bạn **chỉnh sửa lịch sử commit** -- đổi thứ tự, gộp commit, sửa message, xóa commit, và nhiều hơn.

```bash
# Rebase 3 commit gần nhất
git rebase -i HEAD~3
```

Git sẽ mở editor với danh sách commit:

```
pick abc1234 Tạo form login
pick def5678 fix typo
pick ghi9012 Thêm validation

# Rebase abc1234..ghi9012 onto xyz7890 (3 commands)
#
# Commands:
# p, pick   = sử dụng commit này
# r, reword = sử dụng commit, nhưng sửa message
# e, edit   = sử dụng commit, dừng lại để bạn chỉnh sửa
# s, squash = gộp vào commit trước, giữ cả 2 message
# f, fixup  = gộp vào commit trước, bỏ message của commit này
# d, drop   = xóa commit này
```

### 5.2. Các lệnh trong interactive rebase

| Lệnh         | Chức năng                        | Khi nào dùng                           |
| ------------ | -------------------------------- | -------------------------------------- |
| `pick` (p)   | Giữ commit như cũ                | Mặc định, không thay đổi gì            |
| `reword` (r) | Sửa commit message               | Sửa typo trong message, thêm chi tiết  |
| `edit` (e)   | Dừng lại để bạn sửa commit       | Tách 1 commit thành nhiều commit       |
| `squash` (s) | Gộp vào commit trước             | Gộp nhiều commit nhỏ thành 1           |
| `fixup` (f)  | Gộp vào commit trước, bỏ message | Gộp commit "fix typo" vào commit chính |
| `drop` (d)   | Xóa commit                       | Bỏ commit không cần thiết              |

### 5.3. Ví dụ 1: Gộp 3 commit thành 1

```bash
# Lịch sử hiện tại:
git log --oneline -4
# ghi9012 fix: sửa lỗi validation
# def5678 fix: sửa typo
# abc1234 feat: tạo form login
# xyz7890 initial commit

# Muốn gộp 3 commit thành 1:
git rebase -i HEAD~3
```

Editor hiển thị:

```
pick abc1234 feat: tạo form login
pick def5678 fix: sửa typo
pick ghi9012 fix: sửa lỗi validation
```

Sửa thành:

```
pick abc1234 feat: tạo form login
fixup def5678 fix: sửa typo
fixup ghi9012 fix: sửa lỗi validation
```

Kết quả: Chỉ còn **1 commit** "feat: tạo form login" chứa tất cả thay đổi.

### 5.4. Ví dụ 2: Sửa commit message

```bash
git rebase -i HEAD~2
```

Editor:

```
pick abc1234 feat: tạo form logn    <-- có typo!
pick def5678 thêm validation
```

Sửa thành:

```
reword abc1234 feat: tạo form logn
pick def5678 thêm validation
```

Lưu lại. Git sẽ mở editor lần nữa để bạn sửa message:

```
feat: tạo form login
# Sửa typo: logn -> login
```

### 5.5. Ví dụ 3: Đổi thứ tự commit

```bash
git rebase -i HEAD~3
```

Editor:

```
pick abc1234 Thêm footer
pick def5678 Thêm header
pick ghi9012 Thêm navigation
```

Đổi thứ tự (header trước, navigation, rồi footer):

```
pick def5678 Thêm header
pick ghi9012 Thêm navigation
pick abc1234 Thêm footer
```

**Lưu ý:** Đổi thứ tự có thể gây conflict nếu các commit phụ thuộc nhau.

### 5.6. Ví dụ 4: Xóa commit

```bash
git rebase -i HEAD~3
```

```
pick abc1234 Thêm tính năng A
pick def5678 debug: thêm console.log     <-- Muốn xóa!
pick ghi9012 Thêm tính năng B
```

Sửa thành:

```
pick abc1234 Thêm tính năng A
drop def5678 debug: thêm console.log
pick ghi9012 Thêm tính năng B
```

Hoặc đơn giản xóa dòng đó:

```
pick abc1234 Thêm tính năng A
pick ghi9012 Thêm tính năng B
```

---

## 6. `git rebase --onto` -- Rebase nâng cao

### 6.1. Khi nào cần `--onto`?

Khi bạn muốn **di chuyển một nhóm commit** từ base này sang base khác.

```
# Tình huống: Bạn tạo feature-B từ feature-A (không phải từ main)
main:       A---B---C
                 \
feature-A:        D---E
                       \
feature-B:              F---G

# feature-A đã merge vào main.
# Bạn muốn feature-B dựa trên main thay vì feature-A

# Dùng --onto:
git rebase --onto main feature-A feature-B
```

### 6.2. Cú pháp

```bash
git rebase --onto <new-base> <old-base> <branch>
# Di chuyển các commit từ <old-base> đến <branch>
# Đặt chúng lên <new-base>
```

### 6.3. Ví dụ thực tế

```bash
# Trước:
# main:       A---B---C---D
#                  \
# feature-A:       E---F
#                        \
# feature-B:              G---H

# Muốn di chuyển feature-B (G, H) lên main
git rebase --onto main feature-A feature-B

# Sau:
# main:       A---B---C---D
#                  \        \
# feature-A:       E---F    G'---H'  (feature-B)
```

```
# Một trường hợp khác: bỏ một số commit ở giữa

# Trước:
# feature: A---B---C---D---E---F
#              (bỏ C và D, chỉ giữ A, B, E, F)

git rebase --onto B D feature
# "Lấy các commit sau D trên feature, đặt lên sau B"

# Sau:
# feature: A---B---E'---F'
```

---

## 7. Xử lý conflict trong rebase

### 7.1. Conflict trong rebase khác merge

Khi rebase, Git áp dụng **từng commit một**. Nên bạn có thể phải giải quyết conflict **nhiều lần** (mỗi commit có thể có conflict riêng).

```bash
git rebase main
# CONFLICT: file.txt
# error: could not apply abc1234... Thêm header

# Bước 1: Giải quyết conflict trong file
# Mở file.txt, sửa conflict markers

# Bước 2: Stage file đã sửa
git add file.txt

# Bước 3: Tiếp tục rebase
git rebase --continue
# Git áp dụng commit tiếp theo
# Có thể có conflict nữa...

# Lặp lại cho đến khi xong
```

### 7.2. Các lệnh trong quá trình rebase

```bash
# Tiếp tục sau khi giải quyết conflict
git rebase --continue

# Bỏ qua commit hiện tại (không áp dụng commit này)
git rebase --skip

# HỦY TOÀN BỘ rebase -- quay lại trạng thái ban đầu
git rebase --abort
# An toàn 100% -- như chưa bao giờ rebase
```

### 7.3. Khi nào nên abort?

- Conflict quá phức tạp, cần thời gian phân tích
- Nhận ra rebase là sai lầm (ví dụ: rebase nhầm branch)
- Muốn thảo luận với team trước

---

## 8. Workflow thực tế: Feature branch + Rebase

### 8.1. Quy trình hoàn chỉnh

```bash
# 1. Tạo feature branch từ main
git switch main
git pull origin main
git switch -c feature/user-profile

# 2. Làm việc và commit trên feature branch
echo "<div>Profile</div>" > profile.html
git add profile.html
git commit -m "Tạo trang profile"

echo "<form>Edit</form>" > edit-profile.html
git add edit-profile.html
git commit -m "Thêm form chỉnh sửa profile"

# 3. Trước khi tạo PR, cập nhật với main
git switch main
git pull origin main
git switch feature/user-profile

# Rebase lên main (cập nhật base)
git rebase main
# Giải quyết conflict nếu có

# 4. Dọn dẹp commit (interactive rebase)
git rebase -i HEAD~2
# Gộp commit nếu cần, sửa message cho rõ ràng

# 5. Push lên remote
git push -u origin feature/user-profile
# Hoặc nếu đã push trước đó:
git push --force-with-lease origin feature/user-profile

# 6. Tạo Pull Request trên GitHub

# 7. Sau khi PR được approve, merge vào main
# (Thường làm trên GitHub UI)
```

### 8.2. Cập nhật feature branch hàng ngày

```bash
# Mỗi sáng, cập nhật feature branch với main mới nhất
git switch main
git pull origin main
git switch feature/user-profile
git rebase main

# Nếu có conflict -> giải quyết ngay
# Việc này giúp conflict nhỏ và dễ giải quyết
# Thay vì đợi đến cuối rồi conflict lớn
```

---

## 9. Risks và cách phòng tránh

### 9.1. Risk 1: Mất commit

```bash
# Sau khi rebase, commit gốc (F, G, H) vẫn tồn tại
# nhưng không thuộc branch nào
# Chúng sẽ bị garbage collected sau ~30 ngày

# Phòng tránh: dùng reflog để phục hồi
git reflog
# Tìm commit trước khi rebase
# abc1234 HEAD@{5}: rebase (start): checkout main

git switch -c recovery abc1234
# Phục hồi thành công!
```

### 9.2. Risk 2: Force push đè lên code của người khác

```bash
# SAI: dùng --force (nguy hiểm)
git push --force origin feature/shared
# Nếu người khác đã push commit mới -> mất commit đó!

# ĐÚNG: dùng --force-with-lease (an toàn hơn)
git push --force-with-lease origin feature/shared
# Kiểm tra trước: có ai push gì mới không?
# Nếu có -> từ chối, bạn phải pull trước
```

### 9.3. Risk 3: Rebase nhầm branch

```bash
# Đang ở main, vô tình rebase
git rebase feature/experiment
# OH NO! Lịch sử main bị thay đổi!

# Cứu bằng reflog:
git reflog
# Tìm vị trí main trước khi rebase
git reset --hard HEAD@{n}
```

---

## 10. Lỗi thường gặp

### Lỗi 1: Rebase branch đã push và nhiều người dùng

```bash
# Bạn rebase và force push
git push --force origin develop
# Đồng nghiệp pull:
# error: Your local changes would be overwritten

# Cách xử lý cho đồng nghiệp:
git fetch origin
git reset --hard origin/develop
# Mất các thay đổi chưa push của đồng nghiệp!

# Bài học: KHÔNG rebase branch chung
```

### Lỗi 2: Conflict liên tục khi rebase nhiều commit

```bash
# Rebase 10 commit, phải giải quyết conflict 10 lần!
# Mỗi commit có thể có conflict khác

# Giải pháp 1: Dùng rerere (reuse recorded resolution)
git config --global rerere.enabled true
# Git nhớ cách bạn giải quyết conflict và tự động áp dụng

# Giải pháp 2: Squash commit trước khi rebase
git rebase -i HEAD~10  # Gộp thành 1-2 commit
git rebase main         # Rebase chỉ 1-2 commit -> ít conflict hơn
```

### Lỗi 3: Nhầm lẫn giữa rebase và merge

```bash
# Muốn cập nhật feature với main mới nhất

# Dùng MERGE (an toàn hơn, tạo merge commit):
git switch feature/login
git merge main

# Dùng REBASE (lịch sử sạch hơn, viết lại commit):
git switch feature/login
git rebase main

# Cả hai đều cập nhật feature với main
# Khác nhau ở lịch sử commit
```

### Lỗi 4: Quên `--continue` sau khi resolve conflict

```bash
# Sau khi sửa conflict và git add
# KHÔNG DÙNG git commit (như merge)!
# ĐÚNG: git rebase --continue

git add file.txt
git rebase --continue   # ĐÚNG!
# Không phải:
git commit              # SAI! (với rebase)
```

---

## 11. Câu hỏi phỏng vấn

### Câu 1: Giải thích sự khác nhau giữa merge và rebase. Khi nào dùng cái nào?

**Trả lời:** **Merge** giữ nguyên lịch sử và tạo merge commit -- an toàn, không thay đổi commit đã tồn tại. **Rebase** viết lại lịch sử bằng cách tạo commit mới trên base mới -- lịch sử sạch nhưng thay đổi commit hash. Dùng merge khi gộp branch vào main (shared branch). Dùng rebase khi cập nhật feature branch cá nhân với thay đổi mới từ main. Workflow phổ biến: rebase feature lên main (cập nhật), rồi merge vào main với `--no-ff` (ghi nhận).

### Câu 2: "Golden Rule of Rebasing" là gì? Tại sao quan trọng?

**Trả lời:** Golden Rule: **Không bao giờ rebase branch public/shared** -- tức là branch mà người khác đang làm việc trên đó. Lý do: rebase tạo commit mới với hash mới. Nếu bạn rebase và force push, đồng nghiệp đã có commit cũ trên máy họ. Khi họ pull, Git thấy 2 bộ commit khác nhau (cũ và mới) cho cùng nội dung -> duplicate commits, conflict, lịch sử hỗn độn. Chỉ rebase branch cá nhân mà chỉ mình bạn làm việc.

### Câu 3: Interactive rebase dùng để làm gì? Cho ví dụ cụ thể.

**Trả lời:** Interactive rebase (`git rebase -i`) cho phép chỉnh sửa lịch sử commit: gộp commit (squash/fixup), sửa message (reword), xóa commit (drop), đổi thứ tự, tách commit (edit). Ví dụ: trước khi tạo PR, bạn có 5 commit nhỏ ("wip", "fix typo", "test", "update", "final"). Dùng `git rebase -i HEAD~5` và `fixup` 4 commit cuối vào commit đầu tiên, `reword` commit đầu để có message rõ ràng. Kết quả: 1 commit sạch, dễ review.

### Câu 4: Đang rebase mà gặp conflict. Bạn làm gì?

**Trả lời:** Khi rebase gặp conflict: (1) Git dừng lại ở commit gây conflict, (2) Mở file có conflict, đọc conflict markers và sửa, (3) `git add <file>` các file đã sửa, (4) `git rebase --continue` để tiếp tục. Nếu conflict quá phức tạp, dùng `git rebase --abort` để hủy toàn bộ và quay lại trạng thái ban đầu. Khác với merge (giải quyết 1 lần), rebase có thể yêu cầu giải quyết conflict nhiều lần (mỗi commit áp dụng có thể có conflict riêng).

### Câu 5: `git rebase --onto` dùng để làm gì? Cho ví dụ.

**Trả lời:** `git rebase --onto new-base old-base branch` di chuyển một nhóm commit từ base cũ sang base mới. Ví dụ: bạn tạo feature-B từ feature-A, nhưng feature-A đã merge vào main và bị xóa. Bây giờ feature-B vẫn dựa trên feature-A (cũ). Dùng `git rebase --onto main feature-A feature-B` để di chuyển các commit của feature-B (những commit sau feature-A) lên main. Kết quả: feature-B dựa trên main thay vì feature-A.

---

## Tóm tắt

| Lệnh                          | Chức năng                            |
| ----------------------------- | ------------------------------------ |
| `git rebase main`             | Rebase branch hiện tại lên main      |
| `git rebase -i HEAD~n`        | Interactive rebase n commit gần nhất |
| `git rebase --continue`       | Tiếp tục sau khi giải quyết conflict |
| `git rebase --skip`           | Bỏ qua commit hiện tại               |
| `git rebase --abort`          | Hủy toàn bộ rebase                   |
| `git rebase --onto A B C`     | Di chuyển commit từ B..C lên A       |
| `git push --force-with-lease` | Force push an toàn (sau rebase)      |

**Ghi nhớ:** Rebase là công cụ mạnh mẽ để giữ lịch sử sạch. Nhưng luôn nhớ Golden Rule -- chỉ rebase branch của riêng bạn. Khi nghi ngờ, dùng merge.
