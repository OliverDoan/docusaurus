---
sidebar_position: 4
title: "4. Undo, Recovery & Sự cố"
---

# Undo, Recovery & Sự cố

> *Nhóm câu này không kiểm tra bạn thuộc cú pháp Git, mà kiểm tra bạn xử lý khủng hoảng thế nào: lúc 2 giờ sáng production sập, lúc lỡ tay `reset --hard`, lúc commit nhầm `.env`. Người phỏng vấn muốn thấy một người bình tĩnh, có quy trình từng bước, biết "cái gì recover được — cái gì không", và quan trọng nhất là biết phòng để không tái diễn.*

:::note[Ghi nhớ nhanh]

- ⭐ **`git reflog` là phao cứu sinh** — ghi lại mọi vị trí `HEAD` từng trỏ tới, giúp khôi phục commit sau khi lỡ `reset --hard`, xóa nhánh hay rebase hỏng.
- ⭐ **Hotfix phải xuất phát từ trạng thái đang chạy production** (tag đã deploy hoặc `main`), KHÔNG từ `develop` đang dở — nếu không sẽ kéo code chưa test lên prod.
- **`git revert`** — undo an toàn trên nhánh chung: tạo commit đảo ngược, không viết lại lịch sử (khác với `reset`).
- **`reset --soft/--mixed/--hard`** — chỉ dùng trên nhánh cá nhân; `--hard` xóa cả working directory nên nguy hiểm nhất.
- **Commit nhầm secret (`.env`)** — coi như đã lộ: phải rotate key ngay, rồi mới xóa khỏi lịch sử (`filter-repo`/BFG).

:::

---

## Câu 23: Quy trình hotfix production chuẩn lúc 2 giờ sáng `[Senior]`

### Câu hỏi
> "Production đang có một bug nghiêm trọng lúc 2 giờ sáng, nhưng team đang ở giữa sprint, branch `develop` đang dở dang đủ thứ tính năng chưa test. Quy trình hotfix đúng chuẩn của em là gì?"

### Giải thích lý thuyết

Cốt lõi của câu này: **hotfix phải xuất phát từ trạng thái đang chạy trên production, KHÔNG từ `develop`**. Nếu bạn nhánh ra từ `develop` đang dở, bạn sẽ kéo theo cả đống code chưa test lên production — biến một sự cố thành hai.

Mỏ neo cho "trạng thái đang chạy production" là **tag version đã deploy** (ví dụ `v2.4.1`) hoặc nhánh `main`. Đây là lý do vì sao mỗi lần deploy phải tag.

Checklist từng bước (Git Flow):

| Bước | Hành động | Lý do |
|------|-----------|-------|
| 1 | `git checkout v2.4.1` (tag prod) hoặc `main` | Xuất phát từ đúng trạng thái đang chạy, không dính code dở |
| 2 | Tạo `hotfix/cve-login-bypass` từ điểm đó | Cô lập việc fix |
| 3 | Fix **tối thiểu** — chỉ đúng cái bug | Càng nhỏ càng ít rủi ro hồi quy |
| 4 | Test (unit + thủ công kịch bản lỗi) | Đừng deploy mù lúc 2h sáng |
| 5 | Merge vào `main`, tag `v2.4.2` | `main` là source-of-truth của production |
| 6 | Deploy `v2.4.2` | Đưa fix lên |
| 7 | Merge `main` (hoặc hotfix) **ngược lại** `develop` | Nếu không, sprint tiếp theo sẽ làm bug sống lại |
| 8 | Postmortem hôm sau | Tại sao lọt? Thiếu test gì? |

> **Insight phỏng vấn:** Điểm chết người mà ứng viên hay quên là **bước 7 — merge ngược về `develop`**. Nếu quên, bug sẽ "tái sinh" ở lần release sau vì code sửa chỉ nằm trên `main`. Nói được điều này là điểm cộng lớn.

Khác biệt Git Flow vs Trunk-based:

- **Git Flow:** hotfix là một loại nhánh riêng, phải merge cả `main` lẫn `develop` (double-merge).
- **Trunk-based:** chỉ có một nhánh `main`. Hotfix = commit fix nhỏ thẳng lên `main` qua PR nhanh, rồi deploy. Không có chuyện "merge ngược" vì không có nhánh dài sống song song. Đơn giản hơn nhưng đòi hỏi CI/CD và feature flag tốt.

### Code minh hoạ
```bash
# Git Flow: xuất phát từ tag production, KHÔNG từ develop
git fetch --tags
git checkout -b hotfix/login-bypass v2.4.1

# Fix tối thiểu, commit
git add src/auth/login.ts
git commit -m "fix: chặn bypass đăng nhập khi token rỗng"

# Test trước khi deploy
npm test -- auth

# Merge vào main + tag version mới
git checkout main
git merge --no-ff hotfix/login-bypass
git tag -a v2.4.2 -m "Hotfix: login bypass"
git push origin main --tags
# -> deploy v2.4.2

# QUAN TRỌNG: merge ngược về develop để bug không tái sinh
git checkout develop
git merge --no-ff hotfix/login-bypass
git push origin develop

# Dọn nhánh
git branch -d hotfix/login-bypass
```

### Đáp án mẫu
> "Đầu tiên em không nhánh ra từ `develop` vì nó đang dở. Em checkout đúng tag đang chạy trên prod, ví dụ `v2.4.1`, tạo `hotfix/...` từ đó. Em fix tối thiểu đúng cái bug, test kịch bản lỗi, rồi merge vào `main`, tag `v2.4.2` và deploy. Bước em luôn nhớ là merge ngược hotfix về `develop`, nếu không lần release sau bug sẽ sống lại. Hôm sau em viết postmortem. Nếu team dùng trunk-based thì đơn giản hơn: fix nhỏ qua PR nhanh thẳng vào `main` rồi deploy, không cần double-merge."

---

## Câu 24: Undo một public commit đã merge — revert vs reset `[Intermediate]`

### Câu hỏi
> "Một commit đã được merge vào `main` và mọi người đã pull về. Giờ cần undo nó. Em dùng `git revert` hay `git reset`, và khi nào dùng cái nào?"

### Giải thích lý thuyết

Nguyên tắc vàng: **history đã share thì không viết lại**.

- `git revert` tạo ra một **commit mới** có nội dung đảo ngược commit cũ. History cũ vẫn còn nguyên, chỉ thêm một commit "hủy". An toàn tuyệt đối cho nhánh đã share.
- `git reset` **dịch con trỏ nhánh về quá khứ**, tức là viết lại history. Các commit sau điểm reset "biến mất" khỏi nhánh. Chỉ an toàn khi commit **chưa được push / chưa ai pull**.

| Tiêu chí | `git revert` | `git reset` |
|----------|-------------|-------------|
| Cơ chế | Thêm commit đảo ngược | Dời con trỏ về quá khứ |
| History | Giữ nguyên, có dấu vết | Bị viết lại |
| An toàn cho nhánh đã share? | Có | Không |
| Cần force push? | Không | Có (nếu đã push) |
| Dùng khi | Commit đã public | Commit cục bộ chưa share |

> **Insight phỏng vấn:** Câu trả lời "đúng" gần như luôn là **revert** cho commit đã merge vào `main`. Ai nói "reset rồi force push lên main" là cờ đỏ — vì sẽ phá history của tất cả mọi người đang dựa vào nhánh đó.

**Bẫy đặc biệt — revert một merge commit:** merge commit có hai cha. Git không biết bạn muốn giữ lại "đường" nào, nên bạn phải chỉ rõ mainline bằng `-m 1` (cha thứ nhất, thường là nhánh đích).

### Code minh hoạ
```bash
# Commit thường đã public -> revert (an toàn)
git revert a1b2c3d
git push origin main   # chỉ là push thường, không cần force

# Revert một MERGE commit: phải chỉ -m (parent number)
git log --oneline --merges
git revert -m 1 <merge_sha>   # giữ mainline là cha thứ 1
git push origin main

# (Chỉ khi commit CHƯA push) reset cục bộ
git reset --hard HEAD~1   # an toàn vì chưa ai thấy
```

### Đáp án mẫu
> "Nếu commit đã merge vào `main` và mọi người đã pull, em dùng `git revert` — nó tạo một commit đảo ngược, giữ nguyên history nên không phá của ai và chỉ cần push thường. Em chỉ dùng `git reset` cho commit còn cục bộ, chưa push. Một lưu ý: nếu cần revert một merge commit thì phải thêm `-m 1` để Git biết giữ mainline nào, vì merge commit có hai cha."

---

## Câu 25: Branch bị xóa nhầm, chưa merge vào đâu `[Intermediate]`

### Câu hỏi
> "Em lỡ tay `git branch -D feature/payment` mà nhánh đó chưa merge vào đâu cả. Mất hết công sức. Recover thế nào?"

### Giải thích lý thuyết

Tin tốt: xóa một nhánh **không xóa các commit**. Xóa nhánh chỉ xóa cái **con trỏ** trỏ tới commit cuối. Các commit vẫn nằm trong object database của Git, chỉ là tạm thời "mồ côi" (dangling) cho tới khi bị garbage collect (mặc định ~30–90 ngày tùy loại).

Việc cần làm: tìm lại SHA của commit cuối cùng của nhánh đó, rồi tạo lại con trỏ.

Các bước:

| Bước | Lệnh | Mục đích |
|------|------|----------|
| 1 | `git reflog` | Tìm dòng có tên nhánh / commit cuối |
| 2 | (nếu không thấy) `git reflog --all` | Quét reflog của mọi ref |
| 3 | `git branch feature/payment <sha>` | Tạo lại nhánh trỏ vào đúng commit |
| 4 | (nếu reflog đã hết hạn) `git fsck --lost-found` | Tìm dangling commit |

> **Insight phỏng vấn:** `git reflog` là "máy thời gian" của Git và là vũ khí số một trong mọi tình huống recovery. Khi `-D` xóa nhánh, Git còn in ra dòng `Deleted branch ... (was a1b2c3d)` — chính cái SHA đó là thứ bạn cần.

### Code minh hoạ
```bash
# Lúc xóa, Git thường in: "Deleted branch feature/payment (was a1b2c3d)"
# Nếu lỡ mất dòng đó, dùng reflog:
git reflog --all | grep -i payment

# Tạo lại nhánh từ SHA tìm được
git branch feature/payment a1b2c3d

# Trường hợp reflog không còn -> tìm dangling commit
git fsck --lost-found --no-reflogs
# Xem nội dung commit nghi ngờ rồi tạo lại nhánh từ nó
git show <dangling_sha>
git branch feature/payment <dangling_sha>
```

### Đáp án mẫu
> "Em bình tĩnh vì xóa nhánh chỉ xóa con trỏ, các commit vẫn còn. Em chạy `git reflog --all` để tìm SHA của commit cuối nhánh đó — lúc `-D` Git cũng in luôn dòng `(was a1b2c3d)`. Có SHA rồi em tạo lại nhánh bằng `git branch feature/payment a1b2c3d`. Nếu reflog đã hết hạn, em dùng `git fsck --lost-found` để tìm dangling commit rồi khôi phục từ đó."

---

## Câu 26: `git reset --hard` xóa mất 3 commit chưa push `[Intermediate]`

### Câu hỏi
> "Em vô tình `git reset --hard HEAD~3` và mất 3 commit chưa push. Code đã biến mất khỏi working directory luôn. Làm sao recover?"

### Giải thích lý thuyết

`reset --hard` dời `HEAD` về quá khứ và đồng thời ghi đè working directory — nên cảm giác như "mất sạch". Nhưng **các commit cũ vẫn còn** trong object database, và quan trọng hơn, **reflog đã ghi lại vị trí `HEAD` ngay trước khi reset**.

Reflog ghi mọi lần `HEAD` di chuyển và giữ con trỏ này mặc định khoảng **90 ngày** (`gc.reflogExpire`). Đây chính là cứu cánh.

Các bước:

| Bước | Lệnh | Mục đích |
|------|------|----------|
| 1 | `git reflog` | Tìm `HEAD@{n}` ngay trước lệnh reset |
| 2 | `git reset --hard <sha>` | Quay HEAD về đúng commit trước khi reset |
| 2b | hoặc `git cherry-pick <sha>...` | Lấy lại từng commit nếu không muốn dời cả HEAD |

> **Insight phỏng vấn:** Phải phân biệt: commit đã được tạo (đã `git commit`) thì reflog cứu được gần như chắc chắn. Nhưng thay đổi **chưa từng commit** (chỉ ở working dir / staging) mà bị `reset --hard` thì **mất thật** — vì chưa bao giờ thành object. Bài học: commit sớm, commit thường xuyên.

### Code minh hoạ
```bash
# Xem lịch sử di chuyển HEAD
git reflog
# Ví dụ output:
#   a1b2c3d HEAD@{0}: reset: moving to HEAD~3   <- lệnh gây ra sự cố
#   9f8e7d6 HEAD@{1}: commit: thêm validate form  <- commit thứ 3 (muốn lấy lại)
#   ...

# Cách 1: đưa nhánh về đúng trạng thái trước khi reset
git reset --hard 9f8e7d6

# Cách 2: giữ HEAD hiện tại, chỉ nhặt lại các commit
git cherry-pick 7c6b5a4 8d7c6b5 9f8e7d6

# Reflog mặc định giữ ~90 ngày, kiểm tra:
git config --get gc.reflogExpire   # mặc định "90 days"
```

### Đáp án mẫu
> "Em không hoảng vì các commit đã tạo vẫn còn trong reflog. Em chạy `git reflog`, tìm dòng `HEAD@{1}` — vị trí ngay trước lệnh reset — lấy SHA của nó rồi `git reset --hard <sha>` để quay về. Nếu chỉ muốn nhặt lại vài commit thì dùng `cherry-pick`. Reflog giữ con trỏ khoảng 90 ngày nên rất an toàn. Lưu ý duy nhất: thay đổi chưa bao giờ commit thì reflog không cứu được."

---

## Câu 27: Teammate force push làm mất commit của bạn `[Senior]`

### Câu hỏi
> "Một teammate vừa force push lên một shared branch và đè mất mấy commit của em đã push lên đó. Trên remote không còn nữa. Recover thế nào, và làm sao để không tái diễn?"

### Giải thích lý thuyết

Khi remote bị force-push đè, commit của bạn biến mất **trên remote** — nhưng nếu máy của bạn từng có chúng (bạn là người tạo, hoặc từng fetch), thì **reflog cục bộ của bạn vẫn giữ SHA**, kể cả reflog của `origin/branch`.

Quy trình recover:

| Bước | Lệnh | Mục đích |
|------|------|----------|
| 1 | `git reflog` (hoặc `git reflog show origin/feature`) | Tìm SHA commit cũ của bạn |
| 2 | Tạo nhánh tạm từ SHA đó | Bảo toàn công sức |
| 3 | Merge / rebase nối lại với state hiện tại của remote | Hợp nhất với cái teammate vừa push |
| 4 | Push lại (cẩn thận, dùng `--force-with-lease` nếu buộc) | Khôi phục commit |

> **Insight phỏng vấn:** Mấu chốt là biết rằng reflog là **cục bộ trên từng máy** — remote bị đè nhưng máy bạn vẫn nhớ. Và `git reflog show origin/<branch>` cho thấy cả lịch sử mà remote-tracking ref từng trỏ tới, kể cả trước khi bị force-push.

**Phòng ngừa** (phần ghi điểm Senior):

- Bật **branch protection** cho shared branch → cấm force push hẳn ở phía server (GitHub/GitLab).
- Quy ước team: **không bao giờ force push lên shared branch**; nếu buộc rewrite branch cá nhân thì dùng `--force-with-lease`.
- Bật require PR review để không ai push thẳng.

### Code minh hoạ
```bash
# Tìm commit cũ của mình trong reflog cục bộ
git reflog
# hoặc xem lịch sử remote-tracking ref từng trỏ tới
git reflog show origin/feature-x

# Bảo toàn vào nhánh tạm
git branch rescue-mywork <sha_cu_cua_minh>

# Cập nhật state mới nhất của remote rồi nối lại công sức
git fetch origin
git checkout feature-x
git rebase origin/feature-x rescue-mywork   # đưa commit của mình lên trên

# Push lại an toàn (chỉ ghi nếu remote đúng như mình biết)
git push --force-with-lease origin feature-x
```

### Đáp án mẫu
> "Em không lo mất hẳn vì reflog cục bộ trên máy em vẫn nhớ SHA các commit đó, kể cả `git reflog show origin/feature`. Em tạo một nhánh cứu hộ từ SHA cũ, fetch state mới của remote, rebase công sức của em lên trên rồi push lại bằng `--force-with-lease`. Sau đó, để không tái diễn, em đề xuất bật branch protection cấm force push trên shared branch ở phía server, và team thống nhất nguyên tắc không bao giờ force push nhánh chung."

---

## Câu 28: Lỡ force push lên `main`, history bị overwrite `[Senior]`

### Câu hỏi
> "Em vừa force push nhầm lên `main`, history bị ghi đè. Đây là nhánh chính cả team dùng. Quy trình khôi phục khẩn cấp của em là gì?"

### Giải thích lý thuyết

Đây là tình huống "cháy nhà" thật sự. Quy tắc số một: **bình tĩnh và ĐỪNG push thêm gì nữa** — mỗi thao tác sai tiếp theo càng làm khó truy ngược.

Việc cần làm là tìm lại SHA của `main` cũ. May mắn là có **rất nhiều nguồn** giữ lại nó:

| Nguồn tìm SHA cũ | Khi nào dùng |
|------------------|--------------|
| `git reflog` trên máy em | Nếu máy em từng có state cũ |
| Reflog / clone của bất kỳ đồng đội nào từng fetch | Họ chưa pull cái force-push mới |
| **GitHub Events API** / Activity feed | Ghi lại `before` SHA của mỗi push |
| Log CI/CD (commit SHA mỗi lần build) | CI thường log SHA đã build |
| `origin/main` trong reflog người khác | Remote-tracking cũ |

Sau khi có `<old_sha>`:

```
git reset --hard <old_sha>   # đưa main local về đúng history cũ
git push --force-with-lease origin main   # khôi phục lên remote
```

> **Insight phỏng vấn:** Câu trả lời tốt phải nhấn 3 ý: (1) bình tĩnh, không push thêm; (2) liệt kê **nhiều nguồn** tìm SHA cũ — đặc biệt GitHub Events API và CI log là điểm mà ít người biết; (3) sau khi cứu xong phải **bật branch protection** để force push lên `main` không bao giờ xảy ra lần nữa. Một sự cố không kết thúc bằng "phòng ngừa" là một sự cố chưa được xử lý xong.

### Code minh hoạ
```bash
# 1. Bình tĩnh — KHÔNG push thêm

# 2. Tìm SHA của main cũ — thử reflog máy mình trước
git reflog show main

# Nhờ đồng đội chưa pull lấy SHA:
#   git rev-parse origin/main   (trên máy họ, trước khi họ fetch lại)

# Hoặc lấy "before" SHA từ GitHub Events API:
#   gh api repos/<org>/<repo>/events --jq '.[] | select(.type=="PushEvent") | .payload.before'

# 3. Khôi phục
git checkout main
git reset --hard <old_sha>
git push --force-with-lease origin main

# 4. PHÒNG NGỪA: bật branch protection cấm force push
gh api -X PUT repos/<org>/<repo>/branches/main/protection \
  -F allow_force_pushes=false -F enforce_admins=true \
  --input protection-rules.json
```

### Đáp án mẫu
> "Trước hết em dừng lại, không push thêm gì để khỏi làm rối thêm. Sau đó em đi tìm SHA của `main` cũ — em thử `git reflog` trên máy em, hỏi đồng đội nào chưa pull lấy `origin/main` của họ, và quan trọng là lấy `before` SHA từ GitHub Events API hoặc log CI. Có SHA rồi em `git reset --hard` rồi `push --force-with-lease` để khôi phục. Cuối cùng em bật branch protection cấm force push trên `main` để chuyện này không bao giờ tái diễn."

---

## Câu 29: `--force` vs `--force-with-lease` `[Intermediate]`

### Câu hỏi
> "Khác nhau giữa `git push --force` và `--force-with-lease` là gì? Vì sao force-with-lease an toàn hơn và team nên enforce nó thế nào?"

### Giải thích lý thuyết

- `git push --force`: **ghi đè mù**. Nó đè state trên remote bất kể remote đang ở đâu. Nếu trong lúc bạn rebase, có người khác vừa push commit lên cùng nhánh, `--force` sẽ **xóa thẳng commit của họ** mà không cảnh báo.
- `git push --force-with-lease`: ghi đè **có điều kiện**. Git chỉ ghi nếu remote vẫn đúng như **bản local của bạn đang biết** (remote-tracking ref `origin/branch`). Nếu ai đó đã push thêm trong lúc đó, remote đã "khác" → lease thất bại → push bị từ chối → bạn không vô tình đè mất commit của người khác.

| | `--force` | `--force-with-lease` |
|---|-----------|----------------------|
| Kiểm tra remote trước khi ghi? | Không | Có (so với ref local biết) |
| Đè mất commit người khác? | Có thể, âm thầm | Bị chặn, push fail |
| An toàn cho nhánh đang cộng tác | Nguy hiểm | An toàn hơn nhiều |

> **Insight phỏng vấn:** Hiểu lầm phổ biến: nghĩ `--force-with-lease` an toàn tuyệt đối. Không. Nó dựa vào remote-tracking ref local — nếu bạn vừa chạy `git fetch` (hoặc dùng tool tự fetch ngầm) thì ref local đã được cập nhật, lease lại "tin" rằng bạn đã thấy commit mới và vẫn cho đè. Vì vậy: dùng force-with-lease và **đừng fetch ngay trước khi force**, nhưng trên protected branch thì vẫn cấm tuyệt đối — không có force nào là đủ an toàn cho `main`.

### Code minh hoạ
```bash
# Thay vì --force, mặc định dùng force-with-lease
git push --force-with-lease origin feature-x

# Đặt alias để cả team quen tay
git config --global alias.pushf 'push --force-with-lease'
# dùng: git pushf origin feature-x

# (Tùy chọn) ép push mặc định an toàn hơn
git config --global push.useForceIfIncludes true

# Trên server vẫn phải cấm force ở protected branch:
#   GitHub: Settings -> Branches -> Protect 'main' -> tắt "Allow force pushes"
```

### Đáp án mẫu
> "`--force` ghi đè mù — nếu ai vừa push lên nhánh đó, nó xóa luôn commit của họ mà không cảnh báo. `--force-with-lease` chỉ ghi khi remote vẫn đúng như bản local của em biết; nếu có người push thêm thì lease fail và push bị chặn, nên em không vô tình đè mất việc của ai. Team em set alias `pushf` trỏ tới `--force-with-lease` để mặc định dùng nó. Còn trên các nhánh protected như `main` thì em vẫn cấm force hoàn toàn ở phía server, vì không có force nào đủ an toàn cho nhánh chính."

---

## Câu 30: Khi nào force push được phép, khi nào tuyệt đối không `[Intermediate]`

### Câu hỏi
> "Theo em, khi nào force push là chấp nhận được và khi nào tuyệt đối không được phép?"

### Giải thích lý thuyết

Ranh giới rất rõ: **force push được phép trên nhánh bạn sở hữu một mình; tuyệt đối cấm trên nhánh nhiều người dựa vào.**

Lý do: force push viết lại history. Nếu chỉ mình bạn dùng nhánh, viết lại không hại ai. Nếu nhiều người đã pull, viết lại làm history của họ phân kỳ, gây xung đột và có thể làm mất commit.

Bảng quy tắc:

| Tình huống | Force push? | Ghi chú |
|-----------|-------------|---------|
| Nhánh feature/PR cá nhân, chỉ mình em dùng, sau `rebase`/`amend` | OK | Luôn dùng `--force-with-lease` |
| Dọn lịch sử PR trước khi review | OK | Báo reviewer nếu họ đã pull |
| Nhánh feature nhiều người cùng làm | Cẩn trọng | Phải thống nhất, ưu tiên không force |
| `main` / `develop` / `release` | TUYỆT ĐỐI KHÔNG | Bật branch protection chặn ở server |
| Bất kỳ nhánh nào người khác đang dựa vào | Không | Dùng `revert` thay thế |

> **Insight phỏng vấn:** Test thực sự là bạn có nói được câu **"force push chỉ là vấn đề khi history đã được share"** hay không. Một feature branch cá nhân force push thoải mái — đó là cách rebase/squash bình thường. Vấn đề duy nhất là khi nhánh đó là chung. Trả lời được sắc thái này cho thấy bạn hiểu bản chất chứ không học vẹt "force push là xấu".

### Code minh hoạ
```bash
# OK: nhánh PR cá nhân, sau khi rebase/squash để dọn lịch sử
git rebase -i HEAD~5
git push --force-with-lease origin feature/my-pr

# OK: sửa commit message commit cuối của nhánh riêng
git commit --amend -m "fix: message rõ hơn"
git push --force-with-lease origin feature/my-pr

# CẤM: không bao giờ làm thế này với main
# git push --force origin main   <-- KHÔNG

# Thay vào đó, undo trên main bằng revert (không viết lại history)
git revert <sha>
git push origin main
```

### Đáp án mẫu
> "Nguyên tắc của em: force push chỉ là vấn đề khi history đã được share. Trên nhánh feature hay PR của riêng em, sau khi rebase hay amend để dọn lịch sử thì force push hoàn toàn ổn — em chỉ luôn dùng `--force-with-lease`. Còn với `main`, `develop`, `release` hay bất kỳ nhánh nào người khác đang dựa vào thì em tuyệt đối không force; muốn undo thì em dùng `revert`. Và những nhánh đó nên bật branch protection để chặn force ngay ở server."

---

## Câu 31: Rollback production — `git revert` hay deploy lại previous tag `[Senior]`

### Câu hỏi
> "Vừa deploy production xong thì phát hiện bug, cần rollback ngay. Em chọn `git revert` hay deploy lại từ previous tag? Vì sao?"

### Giải thích lý thuyết

Đây là câu phân biệt **rollback runtime** với **sửa source-of-truth** — hai việc khác nhau, và khi đang cháy phải làm đúng thứ tự.

| Phương án | Bản chất | Tốc độ | Khi nào ưu tiên |
|-----------|----------|--------|-----------------|
| **Deploy lại previous tag/artifact** | Đưa runtime về phiên bản đã biết là chạy được | Nhanh nhất (chỉ là deploy lại bản đã build) | Khi đang cháy — cứu hoả trước |
| **`git revert` rồi build & deploy** | Sửa lại source code, đảo ngược commit lỗi | Chậm hơn (phải build, test, deploy mới) | Sửa lâu dài, để code phản ánh sự thật |

Quy trình đúng khi đang cháy:

1. **Rollback artifact trước** — deploy lại `v2.4.1` (bản trước) để dịch vụ trở lại bình thường ngay lập tức. Đây là ưu tiên số một: cầm máu trước.
2. **Revert code sau** — khi đã hạ nhiệt, tạo commit `revert` trên `main` để source-of-truth phản ánh đúng "phiên bản lỗi đã bị gỡ", rồi mới tính cách fix đúng.

Vai trò của **immutable tag / artifact**: vì mỗi bản build được tag và artifact bất biến (Docker image, JAR, bundle có version cố định), bạn luôn có một "điểm cứu hộ" đã được kiểm chứng để quay về tức thì mà không cần build lại — chính điều này khiến deploy-lại-tag nhanh và an toàn hơn build-từ-revert lúc khẩn cấp.

> **Insight phỏng vấn:** Ứng viên xoàng sẽ chỉ nói "git revert". Ứng viên Senior tách bạch: **cầm máu bằng cách deploy lại artifact cũ (nhanh, runtime), rồi mới revert source code (đúng đắn, lâu dài)**. Hiểu rằng "rollback deployment" và "revert code" là hai lớp khác nhau chính là điểm phân biệt level.

### Code minh hoạ
```bash
# BƯỚC 1 — cầm máu: deploy lại artifact/tag đã biết là ổn (nhanh nhất)
# Ví dụ với container đã tag bất biến:
kubectl set image deploy/api api=registry/api:v2.4.1
# hoặc rollback bằng cơ chế của platform
kubectl rollout undo deploy/api

# BƯỚC 2 — sau khi hạ nhiệt: sửa source-of-truth bằng revert
git checkout main
git revert <sha_commit_loi>
git push origin main
# -> CI build v2.4.3 đã loại bỏ code lỗi, deploy bản này khi sẵn sàng
```

### Đáp án mẫu
> "Khi đang cháy, ưu tiên của em là cầm máu nhanh nhất: deploy lại artifact của phiên bản trước, ví dụ `v2.4.1`, vì nó là bản đã biết chắc chạy được và không cần build lại. Sau khi dịch vụ ổn định, em mới `git revert` commit lỗi trên `main` để source code phản ánh đúng trạng thái, rồi build bản mới. Em phân biệt rõ rollback runtime và revert source là hai việc khác nhau — và immutable tag/artifact chính là thứ cho phép em quay về tức thì lúc khẩn cấp."

---

## Câu 32: Lỡ commit `.env` chứa credentials lên remote `[Senior]`

### Câu hỏi
> "Em vô tình commit file `.env` chứa credentials thật và đã push lên remote. Em xử lý thế nào?"

### Giải thích lý thuyết

**BƯỚC QUAN TRỌNG NHẤT, làm ngay đầu tiên: COI NHƯ SECRET ĐÃ BỊ LỘ → rotate (thay mới) toàn bộ secret đó ngay lập tức.**

Lý do tuyệt đối phải rotate trước: một khi đã push lên remote, secret có thể đã bị clone, cache, fork, hoặc bị bot crawl trong vài giây. Xóa khỏi history KHÔNG đảm bảo an toàn vì bạn không kiểm soát được ai đã đọc. Rotate làm cho secret cũ trở nên vô giá trị — đó mới là biện pháp thật sự bảo vệ.

Quy trình đầy đủ, đúng thứ tự:

| Bước | Hành động | Vì sao |
|------|-----------|--------|
| 1 (số 1) | **Rotate toàn bộ secret ngay** (API key, DB password, token...) | Secret coi như đã lộ; rotate vô hiệu hoá bản cũ |
| 2 | Xoá file khỏi toàn bộ history: `git filter-repo` (hoặc BFG) | Gỡ secret khỏi mọi commit |
| 3 | Force push history đã làm sạch | Đẩy history mới lên remote |
| 4 | Thông báo team **re-clone** (không pull) | Pull sẽ kéo lại history cũ; phải clone mới |
| 5 | Thêm `.env` vào `.gitignore` | Chặn tái phạm |
| 6 | Quét lại repo (gitleaks) tìm secret khác | Phòng còn sót |

> **Insight phỏng vấn:** Ứng viên hay nhảy thẳng vào "dùng BFG xoá khỏi history" — đó là **sai thứ tự**. Câu trả lời ăn điểm tuyệt đối phải đặt **rotate secret là việc số 1**, và nói rõ "xoá history là cần thiết nhưng KHÔNG đủ, vì secret có thể đã bị crawl/clone rồi". Bảo mật ở đây là về vô hiệu hoá giá trị của secret, không phải về che giấu dấu vết.

### Code minh hoạ
```bash
# ===== BƯỚC 1 (QUAN TRỌNG NHẤT): ROTATE NGAY =====
# - Tạo API key / DB password / token MỚI ở provider
# - Vô hiệu hoá (revoke) key cũ
# - Cập nhật secret manager / biến môi trường server
# (làm việc này TRƯỚC khi đụng vào history)

# ===== BƯỚC 2: xoá file khỏi toàn bộ history =====
# Cài: pip install git-filter-repo
git filter-repo --path .env --invert-paths
# (hoặc dùng BFG: java -jar bfg.jar --delete-files .env)

# ===== BƯỚC 3: force push history đã sạch =====
git push origin --force --all
git push origin --force --tags

# ===== BƯỚC 4: chặn tái phạm =====
echo ".env" >> .gitignore
git add .gitignore && git commit -m "chore: ignore .env"
git push origin main

# ===== BƯỚC 5: quét lại tìm secret còn sót =====
gitleaks detect --source . -v

# ===== BƯỚC 6: báo team RE-CLONE (không pull) =====
```

### Đáp án mẫu
> "Việc số một, làm ngay trước mọi thứ khác, là coi như secret đã bị lộ và rotate toàn bộ — tạo key mới, revoke key cũ, cập nhật secret manager. Lý do là khi đã push, secret có thể đã bị bot crawl hoặc bị clone trong vài giây, nên xoá history là cần thiết nhưng không đủ để an toàn. Sau khi rotate xong, em mới dùng `git filter-repo` để gỡ `.env` khỏi toàn bộ history, force push, và báo team re-clone chứ không pull. Cuối cùng em thêm `.env` vào `.gitignore` và quét lại bằng gitleaks. Mấu chốt: rotate là số 1, xoá history chỉ là dọn dẹp."

---

## Câu 33: Large file lỡ commit làm repo nặng — xoá khỏi history `[Senior]`

### Câu hỏi
> "Một file lớn (ví dụ video 500MB hoặc dump database) bị commit nhầm vào history làm repo nặng và clone chậm. Làm sao xoá nó khỏi history mà không phá vỡ cộng tác của cả team?"

### Giải thích lý thuyết

Xoá file ở commit mới nhất **không làm repo nhẹ đi** — blob của nó vẫn nằm trong history và mỗi lần clone vẫn tải về. Phải **purge blob khỏi toàn bộ history**, tức rewrite history.

Mà rewrite history là thao tác phá vỡ cộng tác (mọi SHA sau điểm sửa đều đổi). Nên đây vừa là vấn đề kỹ thuật vừa là vấn đề **phối hợp con người**.

Các bước:

| Bước | Hành động | Lưu ý |
|------|-----------|-------|
| 1 | Hẹn thời điểm với cả team (freeze ngắn) | Vì sắp rewrite history |
| 2 | Merge/đẩy hết PR đang mở | Tránh xung đột sau rewrite |
| 3 | `git filter-repo --strip-blobs-bigger-than 50M` (hoặc BFG) | Purge blob lớn khỏi mọi commit |
| 4 | Force push | Đẩy history đã gọn |
| 5 | Team **re-clone** (hoặc reset cứng theo remote) | Pull thường sẽ hỏng |
| 6 | Chuyển file lớn sang **Git LFS** | Để lần sau không tái diễn |

> **Insight phỏng vấn:** Senior phải nhấn hai điều ngoài lệnh: (1) **phối hợp thời điểm với cả team** vì rewrite history đụng đến mọi người — không tự ý làm giữa giờ làm việc; (2) **giải pháp dài hạn là Git LFS** (hoặc artifact storage / object storage) để file nhị phân lớn không bao giờ vào history nữa. Chỉ nói "dùng BFG xoá" là chưa đủ tầm.

### Code minh hoạ
```bash
# (Sau khi đã hẹn freeze với team và merge hết PR)

# Cách 1: git-filter-repo — purge mọi blob lớn hơn 50MB
git filter-repo --strip-blobs-bigger-than 50M

# Hoặc xoá đúng 1 file cụ thể khỏi toàn history
git filter-repo --path assets/demo.mp4 --invert-paths

# Cách 2: BFG (thường nhanh hơn cho file lớn)
# java -jar bfg.jar --strip-blobs-bigger-than 50M
git reflog expire --expire=now --all && git gc --prune=now --aggressive

# Force push history đã gọn
git push origin --force --all
git push origin --force --tags

# ===== GIẢI PHÁP DÀI HẠN: chuyển sang Git LFS =====
git lfs install
git lfs track "*.mp4" "*.zip" "*.psd"
git add .gitattributes
git commit -m "chore: dùng Git LFS cho file nhị phân lớn"
git push origin main

# Team RE-CLONE (hoặc: git fetch && git reset --hard origin/main)
```

### Đáp án mẫu
> "Xoá file ở commit mới nhất không làm repo nhẹ vì blob vẫn nằm trong history, nên em phải purge nó khỏi toàn bộ history bằng `git filter-repo` hoặc BFG — đây là rewrite history. Vì rewrite đụng đến mọi người, em hẹn trước một khung giờ freeze với cả team, merge hết PR đang mở rồi mới làm, force push xong báo mọi người re-clone chứ đừng pull. Quan trọng nhất là giải pháp dài hạn: em chuyển các file nhị phân lớn sang Git LFS để chúng không bao giờ vào history bình thường nữa."
