---
sidebar_position: 3
title: "3. Merge, Rebase & Conflict"
---

# Merge, Rebase & Conflict

> *Nhóm câu này kiểm tra mức độ bạn thực sự hiểu cách Git "hợp nhất" lịch sử — bạn chọn merge hay rebase theo nguyên tắc nào, có nắm được golden rule, và quan trọng nhất là khả năng giữ bình tĩnh khi conflict nổ ra trong một codebase thật với nhiều người cùng làm. Người phỏng vấn ít quan tâm bạn thuộc lệnh, mà quan tâm bạn ra quyết định an toàn dưới áp lực thế nào.*

:::note[Ghi nhớ nhanh]

- ⭐ **Golden rule of rebasing** — KHÔNG bao giờ rebase các commit đã push lên nhánh chung/mà người khác đã dựa vào, vì nó viết lại lịch sử (đổi hash).
- **`merge`** — giữ nguyên lịch sử thật, tạo một merge commit hai cha; an toàn, không viết lại history.
- **`rebase`** — dời commit của bạn lên đầu nhánh đích, cho lịch sử tuyến tính sạch nhưng đổi hash → chỉ dùng trên nhánh cá nhân.
- **Conflict là bình thường** — Git đánh dấu `<<<<<<<` / `=======` / `>>>>>>>`; sửa xong `git add` rồi `git rebase --continue` (hoặc commit nếu đang merge).
- **`git rerere`** — bật để Git nhớ cách bạn giải conflict lặp lại; `git merge --abort` / `rebase --abort` để rút lui an toàn.

:::

---

## Câu 14: Rebase vs Merge & Golden Rule `[Intermediate]`

### Câu hỏi
> "Git rebase và git merge khác nhau như thế nào? Khi nào em dùng cái nào? Em giải thích giúp anh 'golden rule of rebasing' là gì."

### Giải thích lý thuyết

Cả `merge` và `rebase` đều giải quyết cùng một bài toán: **đưa các thay đổi từ một nhánh này vào một nhánh khác**. Khác biệt nằm ở *cách chúng viết lại lịch sử*.

**Merge** giữ nguyên lịch sử thật. Khi nhánh đã rẽ nhánh, `git merge` tạo ra một **merge commit** mới có hai cha (two parents), nối hai dòng lịch sử lại với nhau.

```text
Trước merge:                Sau git merge main (trên feature):

main:    A---B---C          main:    A---B---C
              \                            \   \
feature:       D---E        feature:        D---E---M   ← merge commit (2 cha: E và C)
```

**Rebase** viết lại lịch sử. Nó lấy từng commit của nhánh feature, "nhấc" chúng ra, rồi **phát lại (replay) lần lượt lên trên đỉnh của base mới**. Kết quả là một đường thẳng tuyến tính, không có merge commit.

```text
Trước rebase:               Sau git rebase main (trên feature):

main:    A---B---C          main:    A---B---C
              \                                \
feature:       D---E        feature:            D'---E'   ← commit MỚI (hash khác D, E)
```

Điểm cốt lõi cần nói rõ trong phỏng vấn: `D'` và `E'` là **commit hoàn toàn mới**, có SHA khác `D` và `E`. Rebase không "di chuyển" commit, nó **tạo bản sao** rồi vứt bản gốc đi.

| Tiêu chí | Merge | Rebase |
|----------|-------|--------|
| Lịch sử | Giữ nguyên, có nhánh & merge commit | Tuyến tính, phẳng |
| Commit hash | Không đổi | Bị viết lại (mới) |
| Truy vết "khi nào nhánh hợp nhất" | Có (qua merge commit) | Mất |
| `git log` đọc | Rối hơn khi nhiều nhánh | Sạch, dễ đọc |
| An toàn với commit đã share | An toàn | NGUY HIỂM |

**Golden Rule of Rebasing:** *Không bao giờ rebase những commit đã được push/chia sẻ lên nhánh chung mà người khác có thể đã pull về.*

Lý do: rebase tạo commit mới và bỏ commit cũ. Nếu đồng nghiệp đã pull commit cũ về, lịch sử của họ và của bạn sẽ phân kỳ. Khi họ pull lại, Git thấy hai dòng lịch sử khác nhau cho "cùng một việc" → conflict hỗn loạn, hoặc tệ hơn là commit bị nhân đôi.

> **Insight phỏng vấn:** Câu trả lời "đỉnh" không phải là "rebase cho đẹp, merge cho an toàn". Mà là: **rebase nhánh riêng tư của em lên main để cập nhật, merge khi đưa feature vào nhánh chung**. Rebase để dọn dẹp *trước khi* chia sẻ; merge để *ghi lại* việc tích hợp.

### Code minh hoạ
```bash
# === Dùng REBASE: cập nhật nhánh feature riêng theo main mới nhất ===
git checkout feature/login
git fetch origin
git rebase origin/main          # phát lại commit của feature lên đỉnh main
# -> lịch sử tuyến tính, sạch, sẵn sàng để mở PR

# === Dùng MERGE: đưa feature đã xong vào main (nhánh chung) ===
git checkout main
git merge --no-ff feature/login # tạo merge commit, ghi dấu việc tích hợp

# === VI PHẠM golden rule (KHÔNG làm) ===
git push origin feature/login   # đã share lên remote
git rebase main                 # viết lại commit ĐÃ share -> đồng đội sẽ khổ
git push --force                # buộc phải force -> dấu hiệu nguy hiểm
```

### Đáp án mẫu
> "Merge giữ nguyên lịch sử và tạo một merge commit nối hai nhánh lại, nên history có dạng phân nhánh. Rebase thì viết lại — nó phát lại các commit của nhánh em lên đỉnh nhánh base, cho ra lịch sử tuyến tính phẳng, nhưng commit là commit mới với hash khác. Em thường rebase nhánh riêng của mình lên main để cập nhật cho sạch trước khi mở PR, còn khi gộp feature vào nhánh chung thì em dùng merge để ghi lại điểm tích hợp. Golden rule là không bao giờ rebase những commit đã push/share, vì rebase tạo commit mới và bỏ commit cũ — nếu đồng đội đã pull về thì lịch sử sẽ phân kỳ và gây loạn conflict."

---

## Câu 15: Fast-forward vs No-ff Merge `[Intermediate]`

### Câu hỏi
> "Fast-forward merge và --no-ff merge khác nhau gì? GitHub mặc định dùng cái nào, và tại sao team nên chủ động chọn chứ không để mặc định?"

### Giải thích lý thuyết

**Fast-forward (ff):** Khi nhánh đích (ví dụ `main`) **không có commit mới nào** kể từ lúc nhánh feature tách ra, Git không cần tạo merge commit. Nó chỉ đơn giản "đẩy con trỏ `main` tiến lên" tới commit cuối của feature. Lịch sử phẳng tuyệt đối, như thể chưa từng có nhánh.

```text
Trước (ff được):            Sau git merge feature (fast-forward):

main:    A---B              main:    A---B---C---D
              \                                    ↑ main giờ trỏ tới đây
feature:       C---D        (không có merge commit, không còn dấu vết nhánh)
```

**No-ff (`--no-ff`):** Buộc Git **luôn tạo merge commit**, kể cả khi ff được. Điều này giữ lại "bong bóng" (bubble) của nhánh feature trong lịch sử — ta nhìn được rõ "nhóm commit này thuộc về cùng một feature".

```text
Sau git merge --no-ff feature:

main:    A---B-----------M   ← merge commit
              \         /
feature:       C---D---'     ← bong bóng feature vẫn nhìn thấy được
```

| | Fast-forward | --no-ff |
|---|---|---|
| Merge commit | Không tạo | Luôn tạo |
| History | Phẳng | Có bong bóng nhánh |
| Biết feature gồm commit nào | Khó (lẫn vào nhau) | Dễ (gom trong bubble) |
| `git revert` cả feature | Khó | Dễ (revert 1 merge commit) |

GitHub khi bấm nút "Merge pull request" mặc định là **merge commit (tương đương --no-ff)** — luôn tạo merge commit để ghi dấu PR. Ngoài ra GitHub còn cho hai lựa chọn khác: "Squash and merge" và "Rebase and merge".

> **Insight phỏng vấn:** Lý do nên *chủ động chọn*: nếu để ff trên nhánh chia sẻ, một feature gồm nhiều commit sẽ "tan" vào lịch sử main, mất khả năng truy vết "feature X gồm những commit nào" và khó revert cả cụm. Trade-off là: ff cho history sạch nhưng mất ngữ cảnh nhóm; --no-ff giữ ngữ cảnh & dễ revert nhưng history nhiều merge commit hơn. Team trưởng thành thường chọn `--no-ff` cho nhánh chính để truy vết, và dùng rebase/squash để dọn commit *bên trong* feature trước khi merge.

### Code minh hoạ
```bash
# Fast-forward (mặc định khi có thể): không tạo merge commit
git checkout main
git merge feature/cart          # nếu main chưa đi trước -> ff, history phẳng

# Buộc luôn tạo merge commit để giữ bong bóng feature
git merge --no-ff feature/cart  # luôn có merge commit

# Chỉ cho phép ff, từ chối nếu phải tạo merge commit (dùng cho pull an toàn)
git merge --ff-only feature/cart

# Đặt mặc định --no-ff cho cả repo
git config merge.ff false

# Revert toàn bộ một feature đã merge bằng --no-ff (chỉ 1 lệnh, nhờ có merge commit)
git revert -m 1 <merge_commit_sha>
```

### Đáp án mẫu
> "Fast-forward xảy ra khi nhánh đích chưa có commit mới nào kể từ lúc tách — Git chỉ đẩy con trỏ tiến lên, không tạo merge commit, history phẳng nhưng feature tan vào main. Còn `--no-ff` buộc luôn tạo merge commit, giữ lại 'bong bóng' của feature nên em nhìn được nhóm commit nào thuộc feature nào và revert cả cụm bằng một lệnh. GitHub mặc định nút Merge tạo merge commit. Em nghĩ team nên chủ động chọn `--no-ff` cho nhánh chính để giữ khả năng truy vết và revert, đồng thời dọn commit bên trong feature bằng squash hoặc rebase trước khi merge — vừa sạch vừa có ngữ cảnh."

---

## Câu 16: 3-way Merge & Auto vs Manual Resolve `[Intermediate]`

### Câu hỏi
> "3-way merge là gì? Git tự động resolve như thế nào, và khi nào thì em buộc phải resolve thủ công?"

### Giải thích lý thuyết

Khi merge hai nhánh đã rẽ, Git **không** chỉ so sánh hai phiên bản hiện tại. Nó dùng **ba điểm**:

1. **base (merge-base):** commit tổ tiên chung gần nhất của hai nhánh — "điểm xuất phát".
2. **ours:** phiên bản trên nhánh hiện tại (nhánh em đang đứng).
3. **theirs:** phiên bản trên nhánh được merge vào.

```text
            ┌─ ours   (HEAD, nhánh hiện tại)
   base ───┤
            └─ theirs (nhánh đang merge vào)

Git so sánh: base↔ours và base↔theirs
```

Gọi là "3-way" vì Git so sánh **mỗi nhánh với base**, chứ không so trực tiếp hai nhánh. Nhờ base, Git biết được *bên nào đã thay đổi cái gì*.

**Khi Git tự động resolve được:** nếu hai nhánh sửa ở **những vùng khác nhau** (khác dòng, khác file), Git tự động gộp cả hai thay đổi mà không cần hỏi.

- base có dòng X. ours đổi X, theirs **không động** vào X → lấy của ours.
- base có dòng Y. theirs đổi Y, ours không động → lấy của theirs.

**Khi buộc phải resolve thủ công (conflict):** khi **cả hai bên cùng sửa cùng một vùng** (overlapping). Git không thể tự đoán ý định ai đúng → đánh dấu conflict bằng marker:

```text
<<<<<<< HEAD            ← bắt đầu phần của OURS
const timeout = 3000;
=======                 ← ranh giới
const timeout = 5000;
>>>>>>> feature/api     ← kết thúc, phần của THEIRS
```

| Tình huống | Kết quả |
|------------|---------|
| Hai bên sửa file khác nhau | Auto merge |
| Hai bên sửa vùng khác nhau trong cùng file | Auto merge |
| Hai bên sửa cùng dòng/vùng chồng nhau | **CONFLICT** → thủ công |
| Một bên xoá file, bên kia sửa file đó | CONFLICT (modify/delete) |

> **Insight phỏng vấn:** Nhiều bạn tưởng conflict xảy ra khi "hai bên cùng đụng vào một file". Sai. Conflict chỉ xảy ra khi **cùng đụng vào một vùng chồng lấn**. Hai người sửa hai hàm khác nhau trong cùng file vẫn auto-merge ngon lành. Hiểu điều này giúp em không sợ chạm chung file, mà sợ đúng cái cần sợ: chạm chung dòng.

### Code minh hoạ
```bash
# Xem merge-base (tổ tiên chung) mà Git dùng làm điểm tham chiếu
git merge-base main feature/api
# -> in ra SHA của base

# So sánh để hiểu ai đổi gì so với base
git diff $(git merge-base main feature/api) main        # ours đổi gì
git diff $(git merge-base main feature/api) feature/api # theirs đổi gì

# Khi merge gặp conflict, file sẽ chứa marker:
git merge feature/api
# Auto-merging src/config.ts
# CONFLICT (content): Merge conflict in src/config.ts

# Xem trực tiếp ba phiên bản của một file đang conflict
git show :1:src/config.ts   # base
git show :2:src/config.ts   # ours
git show :3:src/config.ts   # theirs
```

### Đáp án mẫu
> "3-way merge nghĩa là Git không so trực tiếp hai nhánh, mà dùng ba điểm: base là tổ tiên chung gần nhất, ours là nhánh hiện tại, theirs là nhánh được merge vào. Nhờ so mỗi bên với base, Git biết bên nào đã đổi cái gì. Nếu hai bên đổi ở vùng khác nhau — khác file hoặc khác dòng — Git tự động gộp. Em chỉ phải resolve thủ công khi cả hai bên cùng sửa một vùng chồng lấn, lúc đó Git đặt marker `<<<<<<<`, `=======`, `>>>>>>>` và để em quyết định giữ phần nào. Ngoài ra modify/delete cũng gây conflict cần xử lý tay."

---

## Câu 17: Quy trình Resolve Conflict an toàn `[Intermediate]`

### Câu hỏi
> "Em đang merge feature branch vào main thì gặp conflict trong một file mà cả hai phía đều refactor. Mô tả quy trình resolve an toàn của em."

### Giải thích lý thuyết

Conflict khi hai bên cùng refactor là loại "khó nhằn" vì không phải đổi một dòng, mà đổi cả cấu trúc. Quy trình an toàn gồm các bước kỷ luật:

**Bước 1 — Dừng lại và chụp toàn cảnh.** Đừng vội sửa. Chạy `git status` để biết *chính xác* file nào conflict (Unmerged paths).

**Bước 2 — Hiểu ours vs theirs.** Trước khi gõ phím, đọc xem mỗi bên *cố làm gì*. Dùng `git log`, `git diff` để hiểu ý đồ refactor của cả hai. Conflict không phải lúc nào cũng "chọn một bỏ một" — nhiều khi phải **kết hợp** cả hai ý đồ.

**Bước 3 — Resolve.** Mở file, xử lý từng khối marker. Có thể dùng `git mergetool` (mở công cụ 3 cửa sổ base/ours/theirs) hoặc sửa tay. Xoá sạch các marker `<<<<<<<`, `=======`, `>>>>>>>`.

**Bước 4 — Chạy test.** Đây là bước hay bị bỏ qua nhất. Resolve xong code có thể *compile được nhưng sai logic*. Phải chạy test/build để chắc chắn việc gộp không phá vỡ hành vi.

**Bước 5 — Đánh dấu đã xong và hoàn tất.** `git add` file đã resolve, rồi `git commit` (với merge) hoặc `git rebase --continue` (với rebase).

**Lối thoát hiểm — abort.** Nếu càng làm càng rối, đừng cố đấm ăn xôi. `git merge --abort` đưa về trạng thái sạch trước merge, rồi làm lại với chiến lược tốt hơn.

```text
git status ──> hiểu ours/theirs ──> resolve ──> CHẠY TEST ──> git add ──> commit/--continue
     │                                                                          
     └──────────────── git merge --abort (nếu loạn, về trạng thái sạch) ───────┘
```

> **Insight phỏng vấn:** Điểm khiến câu trả lời nổi bật là **"chạy test sau khi resolve"** và **biết đường lùi (`--abort`)**. Rất nhiều ứng viên kể quy trình tới bước `git add` rồi dừng — người phỏng vấn đang chờ nghe bạn nhắc tới việc *xác minh tính đúng đắn sau gộp*, vì resolve sai là nguồn bug âm thầm nguy hiểm nhất.

### Code minh hoạ
```bash
# B1: chụp toàn cảnh - file nào đang conflict?
git status
# Unmerged paths:
#   both modified:   src/services/user.service.ts

# B2: hiểu mỗi bên đang làm gì
git log --oneline --left-right main...feature/refactor   # commit khác nhau hai bên
git diff src/services/user.service.ts                     # xem khối conflict

# B3: resolve - dùng mergetool hoặc sửa tay rồi xoá marker
git mergetool                          # hoặc mở editor sửa trực tiếp

# B4: XÁC MINH - bắt buộc chạy test/build
npm test
npm run build

# B5: đánh dấu đã xong + hoàn tất
git add src/services/user.service.ts
git commit                             # với merge
# git rebase --continue                # nếu đang rebase

# Lối thoát: nếu loạn, về trạng thái sạch
git merge --abort                      # hoặc git rebase --abort
```

### Đáp án mẫu
> "Đầu tiên em không vội sửa mà chạy `git status` để biết chính xác file nào conflict. Sau đó em đọc kỹ ý đồ refactor của cả hai phía bằng `git log` và `git diff`, vì nhiều khi phải kết hợp cả hai chứ không chỉ chọn một. Rồi em resolve, có thể dùng `git mergetool` hoặc sửa tay, xoá sạch marker. Quan trọng nhất là sau khi resolve em luôn chạy test và build để chắc việc gộp không làm sai logic — resolve sai mà vẫn compile được là bug nguy hiểm. Cuối cùng `git add` rồi commit hoặc `--continue`. Nếu càng làm càng rối thì em `git merge --abort` để về trạng thái sạch và làm lại đàng hoàng."

---

## Câu 18: git pull tạo merge commit rác & --rebase `[Intermediate]`

### Câu hỏi
> "Tại sao git pull thường tạo ra những merge commit không cần thiết, và em fix bằng --rebase như thế nào?"

### Giải thích lý thuyết

`git pull` thực chất là **hai lệnh ghép lại**: `git fetch` + `git merge`.

```text
git pull  ≡  git fetch origin   (tải commit mới về)
           + git merge origin/main  (merge vào nhánh hiện tại)
```

Vấn đề: nếu **cả em và đồng đội đều có commit local mới** trên cùng nhánh, lúc pull Git thấy hai dòng lịch sử phân kỳ → nó tạo một merge commit kiểu *"Merge branch 'main' of github.com:..."*. Những merge commit này:

- Không mang ý nghĩa gì (không phải tích hợp feature thật sự).
- Làm `git log` rối với hàng loạt "Merge branch main" rác.
- Tạo lịch sử zig-zag khó đọc.

```text
git pull (merge - rác):          git pull --rebase (sạch):

A---B---C---M  ← merge rác        A---B---C
     \     /                               \
      D---'  (commit local)                 D'  ← commit local phát lại lên trên
```

**Cách fix:** `git pull --rebase`. Thay vì merge, Git **phát lại commit local của em lên trên các commit vừa fetch về**, cho ra lịch sử tuyến tính không có merge commit rác.

Để khỏi gõ `--rebase` mỗi lần, cấu hình một lần:

> **Insight phỏng vấn:** Nói thêm về `pull.ff = only` (hoặc `--ff-only`) để thể hiện chiều sâu: nó *từ chối* pull nếu phải tạo merge commit, buộc bạn phải chủ động rebase — an toàn nhất vì không bao giờ tạo merge bất ngờ. Còn `branch.autosetuprebase = always` đảm bảo mọi nhánh mới tạo ra đều mặc định rebase khi pull. Lưu ý: `--rebase` vẫn tuân golden rule — chỉ rebase commit local *chưa* push.

### Code minh hoạ
```bash
# Pull bằng rebase một lần: phát lại commit local lên trên, không tạo merge rác
git pull --rebase origin main

# === Cấu hình để mặc định luôn rebase khi pull ===
git config --global pull.rebase true           # mọi pull đều rebase
git config --global branch.autosetuprebase always  # nhánh mới: pull tự rebase

# === An toàn nhất: chỉ cho ff, từ chối nếu phải merge ===
git config --global pull.ff only
# git pull -> nếu cần merge sẽ báo lỗi, buộc em chủ động:
git pull --rebase

# Kiểm tra cấu hình hiện tại
git config --get pull.rebase
```

### Đáp án mẫu
> "Vì `git pull` thực chất là `git fetch` cộng `git merge`. Khi cả em và đồng đội cùng có commit local mới trên một nhánh, Git thấy lịch sử phân kỳ nên tự tạo một merge commit kiểu 'Merge branch main' — những commit này vô nghĩa và làm log rối zig-zag. Em fix bằng `git pull --rebase`, nó phát lại commit local của em lên trên các commit vừa fetch về nên lịch sử tuyến tính, sạch. Em thường set sẵn `pull.rebase = true` toàn cục, hoặc thậm chí `pull.ff = only` để Git từ chối pull khi cần merge, buộc em chủ động rebase. Tất nhiên vẫn tuân golden rule, chỉ rebase commit local chưa push."

---

## Câu 19: Long-lived Branch — Chiến lược Merge an toàn `[Senior]`

### Câu hỏi
> "Một feature branch sống được 2 tuần và giờ đã cách main tới 50 commit. Em sẽ merge nó vào như thế nào để không gây sự cố nghiêm trọng?"

### Giải thích lý thuyết

Đây là bài toán **long-lived branch** — một trong những nguồn rủi ro lớn nhất trong teamwork. Vấn đề cốt lõi:

- Nhánh càng cách xa main, **bề mặt conflict càng lớn**. 50 commit nghĩa là 50 cơ hội ai đó đã đụng vào file em đang sửa.
- Conflict tích luỹ dồn vào một lần merge cuối → một "merge khổng lồ" nguy hiểm, dễ resolve sai, khó review.
- "Big bang integration": tích hợp một cục lớn vào cuối luôn rủi ro hơn tích hợp liên tục.

**Nếu đang ở giữa tình huống (đã lỡ rồi):**

1. **Đừng merge thẳng cục 50 commit.** Trước hết kéo main về và **rebase/merge main vào nhánh feature từng phần**, resolve dần thay vì một phát. Bật `git rerere` (xem câu 21) để không phải resolve lặp.
2. **Chia nhỏ PR.** Nếu feature lớn, tách thành nhiều PR nhỏ merge dần, thay vì một PR khổng lồ.
3. Sau khi nhánh đã đồng bộ với main và test xanh, mới merge vào main.

**Phòng bệnh hơn chữa bệnh (cách đúng từ đầu):**

```text
Sai (big bang):                    Đúng (integrate often):

main  ────────────────●  ← merge   main ──●──●──●──●──●
        \            /  khổng lồ           ↑  ↑  ↑  ↑
feature  ●●●●●●●●●●●●  (50 commit)    feature đồng bộ với main liên tục
```

- **Integrate often:** thường xuyên kéo main vào nhánh feature (rebase hoặc merge) — vài ngày một lần, không để dồn.
- **Chia nhỏ feature** thành các PR nhỏ, mỗi PR sống vài ngày là cùng.
- **Feature flags:** merge code chưa hoàn thiện vào main *sau cờ tắt*, để không cần giữ nhánh dài. Trunk-based development dựa nhiều vào kỹ thuật này.

> **Insight phỏng vấn:** Câu trả lời cấp senior phải **chuyển trọng tâm từ "cách merge" sang "tại sao branch không nên sống lâu"**. Người phỏng vấn muốn nghe bạn nhận diện đây là một anti-pattern về quy trình, và đề xuất phòng ngừa (integrate-often, feature flags, PR nhỏ), không chỉ chữa cháy. Nhắc tới `rerere` và rebase từng phần để chứng minh bạn biết cách chữa cháy tốt khi đã lỡ.

### Code minh hoạ
```bash
# === CHỮA CHÁY: nhánh đã cách main 50 commit ===
git checkout feature/big
git fetch origin

# Bật rerere để không phải resolve lặp cùng conflict
git config rerere.enabled true

# Đồng bộ main vào nhánh feature TRƯỚC (resolve dần), test sau mỗi lần
git rebase origin/main      # hoặc: git merge origin/main nếu nhánh đã share
npm test                    # xác minh sau mỗi đợt resolve

# Sau khi nhánh đã đồng bộ & xanh, mới đưa vào main
git checkout main
git merge --no-ff feature/big

# === PHÒNG NGỪA: integrate-often (làm vài ngày một lần) ===
git checkout feature/x
git fetch origin
git rebase origin/main      # kéo main về liên tục, conflict nhỏ & dễ
```

### Đáp án mẫu
> "Vấn đề gốc là nhánh sống quá lâu — cách main 50 commit nghĩa là bề mặt conflict rất lớn và merge một phát sẽ thành 'big bang' nguy hiểm. Nếu đã lỡ rồi, em không merge thẳng cục đó vào main. Em bật `git rerere`, rồi kéo main vào nhánh feature để resolve dần, chạy test sau mỗi đợt; nếu feature lớn em tách thành nhiều PR nhỏ. Khi nhánh đã đồng bộ với main và test xanh mới merge vào. Nhưng quan trọng hơn là phòng ngừa: lần sau em sẽ integrate-often — kéo main về nhánh vài ngày một lần để conflict luôn nhỏ, chia feature thành PR nhỏ, và dùng feature flag để merge code chưa xong vào main sau cờ tắt thay vì giữ nhánh dài."

---

## Câu 20: Rebase Hell — Conflict phức tạp nhiều commit `[Senior]`

### Câu hỏi
> "Em đang rebase thì gặp conflict phức tạp ở nhiều commit liên tiếp. Làm sao xử lý mà không rơi vào 'rebase hell'?"

### Giải thích lý thuyết

"Rebase hell" xảy ra vì rebase **phát lại từng commit một**. Nếu một thay đổi xung đột nằm ở vùng mà *nhiều commit* trong nhánh đều đụng tới, em sẽ phải **resolve cùng một conflict lặp đi lặp lại** ở từng commit — mệt mỏi và dễ sai.

```text
rebase 5 commit lên base mới:
  apply D' -> CONFLICT (resolve)
  apply E' -> CONFLICT lại ở cùng vùng (resolve lại!)
  apply F' -> CONFLICT lại...
  ... rebase hell
```

Chiến lược thoát hiểm, theo thứ tự cân nhắc:

1. **Bật `git rerere`** (reuse recorded resolution): Git ghi nhớ cách em resolve một conflict và **tự áp lại** khi gặp đúng conflict đó ở commit sau. Đây là vũ khí số một chống rebase hell.

2. **Squash trước khi rebase:** nếu nhiều commit nhỏ cùng đụng một vùng, gộp chúng thành một commit *trước* khi rebase → chỉ phải resolve một lần thay vì nhiều lần.

3. **Cân nhắc merge thay vì rebase:** khi conflict quá phức tạp và lan rộng, một merge commit chỉ bắt em resolve **một lần duy nhất** cho toàn bộ. Đôi khi lịch sử "kém đẹp" mà đúng còn hơn rebase hoàn hảo mà sai.

4. **`git rebase --onto`:** rebase chính xác một đoạn commit lên một base khác, tránh kéo theo những commit không liên quan gây thêm conflict.

5. **Rebase từng đoạn nhỏ:** thay vì rebase 50 commit một lần, rebase theo từng chặng (rebase tới một commit trung gian, ổn định, rồi rebase tiếp).

6. **`git rebase --abort`:** khi đã thật sự loạn, hủy về trạng thái trước rebase và chọn chiến lược khác. Không có gì đáng xấu hổ.

> **Insight phỏng vấn:** Điểm senior là **biết khi nào KHÔNG nên rebase**. Ứng viên junior cố rebase bằng mọi giá. Senior nhận ra rằng với conflict lan rộng nhiều commit, `merge` (resolve một lần) thường là lựa chọn đúng đắn hơn rebase (resolve N lần). Kết hợp `rerere` + biết đường lùi `--abort` là dấu hiệu của người đã thực chiến.

### Code minh hoạ
```bash
# Vũ khí số 1: bật rerere để tự áp lại cách resolve đã ghi nhớ
git config --global rerere.enabled true

# Squash các commit nhỏ cùng đụng một vùng TRƯỚC khi rebase (resolve 1 lần)
git rebase -i HEAD~5            # đánh dấu squash/fixup các commit liên quan
# rồi mới:
git rebase origin/main

# Khi conflict quá phức tạp -> dùng MERGE (resolve một lần duy nhất)
git merge origin/main          # thay vì rebase, đỡ rebase hell

# rebase --onto: chỉ phát lại đoạn commit cần, bỏ phần gây nhiễu
git rebase --onto main old-base feature

# Đã loạn -> hủy về trạng thái trước rebase
git rebase --abort

# Trong lúc rebase, nếu một commit không còn cần thiết:
git rebase --skip
```

### Đáp án mẫu
> "Rebase hell xảy ra vì rebase phát lại từng commit, nên một conflict ở vùng mà nhiều commit cùng đụng sẽ bắt em resolve lặp đi lặp lại. Đầu tiên em luôn bật `git rerere` để Git nhớ cách em resolve và tự áp lại cho các commit sau. Nếu nhiều commit nhỏ cùng đụng một chỗ, em squash chúng lại trước khi rebase để chỉ phải resolve một lần. Nhưng quan trọng nhất ở mức senior: nếu conflict quá phức tạp và lan rộng, em chọn merge thay vì rebase — merge chỉ bắt resolve một lần cho toàn bộ, lịch sử kém đẹp nhưng đúng và an toàn hơn. Em cũng dùng `rebase --onto` để chỉ phát lại đúng đoạn cần, và nếu đã thật sự loạn thì `git rebase --abort` về trạng thái sạch rồi đổi chiến lược."

---

## Câu 21: git rerere `[Senior]`

### Câu hỏi
> "git rerere là gì? Khi nào nó cứu em khỏi việc phải resolve cùng một conflict nhiều lần?"

### Giải thích lý thuyết

`rerere` = **Reuse Recorded Resolution** (tái sử dụng cách giải quyết đã ghi lại).

Cơ chế: khi bật, mỗi lần em resolve một conflict, Git **ghi lại "vân tay" của conflict đó cùng với cách em đã giải quyết**. Lần sau gặp lại *đúng conflict giống hệt*, Git **tự động áp lại** cách resolve cũ — em không phải gõ lại gì.

```text
Lần 1: gặp conflict X  -> em resolve thủ công -> Git GHI LẠI (X -> giải pháp)
Lần 2: gặp conflict X  -> Git TỰ ÁP giải pháp đã ghi -> em chỉ cần kiểm tra & add
```

Bật một lần là dùng mãi:
```bash
git config --global rerere.enabled true
```

**Khi nào rerere cứu em:**

1. **Rebase lặp:** như câu 20, rebase phát lại nhiều commit gặp cùng conflict — rerere áp lại tự động cho các commit sau.
2. **Long-lived branch:** nhánh sống lâu, em kéo main về nhiều lần, mỗi lần lại gặp lại conflict cũ — rerere nhớ cho em.
3. **Merge-back nhiều lần / nhánh release:** khi phải merge cùng một thay đổi qua lại giữa nhiều nhánh, conflict lặp lại — rerere giải quyết một lần dùng nhiều lần.
4. **Thử rồi abort rồi thử lại:** em resolve thử, abort để làm cách khác, nhưng lần sau gặp lại conflict đó rerere vẫn nhớ — không mất công.

| Lệnh rerere | Tác dụng |
|-------------|----------|
| `git config rerere.enabled true` | Bật tính năng |
| `git rerere status` | Xem conflict nào đang được theo dõi |
| `git rerere diff` | Xem cách resolve đã ghi |
| `git rerere forget <path>` | Quên cách resolve đã ghi (khi resolve sai) |

> **Insight phỏng vấn:** Biết `rerere` là dấu hiệu rõ ràng của người *thực sự* dùng Git nhiều, vì nó tắt mặc định và đa số người không biết. Điểm cộng lớn: nhắc rằng nếu lỡ ghi nhớ một resolve *sai*, dùng `git rerere forget` để xoá — cho thấy bạn hiểu cả mặt trái của nó.

### Code minh hoạ
```bash
# Bật một lần, dùng mãi mãi
git config --global rerere.enabled true

# === Kịch bản: rebase nhánh feature, gặp cùng conflict ở nhiều commit ===
git rebase origin/main
# commit D': CONFLICT -> em resolve thủ công 1 lần
git add .
git rebase --continue
# commit E': cùng conflict đó -> rerere TỰ ÁP -> chỉ cần:
git add .
git rebase --continue       # đỡ resolve lại

# Kiểm tra rerere đang theo dõi gì
git rerere status
git rerere diff

# Lỡ ghi nhớ một resolve SAI -> bắt Git quên đi
git rerere forget src/config.ts
```

### Đáp án mẫu
> "rerere là viết tắt của Reuse Recorded Resolution. Khi bật, mỗi lần em resolve một conflict, Git ghi lại vân tay của conflict đó cùng cách em giải quyết; lần sau gặp đúng conflict giống hệt nó tự áp lại, em không phải gõ lại. Nó cứu em rõ nhất trong ba tình huống: rebase phát lại nhiều commit gặp cùng conflict, nhánh sống lâu phải kéo main về nhiều lần, và merge-back qua lại giữa các nhánh release. Em bật nó toàn cục bằng `rerere.enabled true`. Một lưu ý là nếu lỡ ghi nhớ một cách resolve sai thì dùng `git rerere forget` để Git quên đi và resolve lại."

---

## Câu 22: git cherry-pick — Đúng lúc & Dấu hiệu sai branching `[Senior]`

### Câu hỏi
> "Trong thực tế, khi nào git cherry-pick là công cụ đúng, và khi nào nó là dấu hiệu cho thấy branching strategy của team đang có vấn đề?"

### Giải thích lý thuyết

`git cherry-pick` lấy **một (hoặc vài) commit cụ thể** từ nhánh này và **áp một bản sao** của nó lên nhánh hiện tại — không merge cả nhánh, chỉ "hái" đúng commit cần.

```text
main:     A---B---C---D
                       \
release:  A---B         X   ← cherry-pick commit D sang release (D thành commit X, hash mới)
```

**Khi cherry-pick là công cụ ĐÚNG:**

1. **Backport hotfix sang release branch:** sửa bug khẩn trên `main`, cần đưa *đúng* commit fix đó sang nhánh `release/1.x` đang chạy production — mà không kéo theo các feature chưa release. Đây là use case kinh điển và hợp lệ nhất.
2. **Lấy một commit cụ thể** từ nhánh khác mà chưa muốn merge cả nhánh.
3. **Khôi phục một thay đổi** đã bị mất/revert nhầm.

Luôn dùng `-x` khi cherry-pick giữa các nhánh chung: nó ghi thêm dòng *"(cherry picked from commit ...)"* vào message để truy nguồn.

**Khi cherry-pick là MÙI XẤU (code smell về branching):**

1. **Cherry-pick liên tục giữa các feature branch** thay vì merge đàng hoàng → dấu hiệu nhánh không được tổ chức theo dòng tích hợp rõ ràng.
2. **Dùng cherry-pick để né conflict của merge** → chỉ trì hoãn vấn đề.
3. Cherry-pick tạo **commit trùng nội dung nhưng khác hash**. Khi sau này merge hai nhánh đó lại, Git có thể coi chúng là khác nhau → **conflict hoặc commit nhân đôi**. Cherry-pick nhiều = gieo mầm conflict tương lai.

```text
main:     A---B---C---D
                       \
feature:  A---B    D'   ← cherry-pick D (D' khác hash)
              \   /
               (sau này merge feature vào main: D và D' "đụng nhau" -> conflict)
```

| Cherry-pick | Đánh giá |
|-------------|----------|
| Backport hotfix sang release | ✅ Đúng |
| Lấy 1 commit lẻ chưa muốn merge cả nhánh | ✅ Đúng |
| Thường xuyên cherry-pick giữa feature branch | ❌ Branching sai |
| Dùng để né merge conflict | ❌ Trì hoãn vấn đề |

> **Insight phỏng vấn:** Câu trả lời senior phải nêu được **mặt trái**: cherry-pick tạo commit trùng-nội-dung-khác-hash, gieo mầm conflict/nhân đôi khi merge về sau. Người phỏng vấn muốn nghe bạn xem cherry-pick là *dao mổ chính xác* cho backport, chứ không phải *công cụ thay thế cho một quy trình branching mạch lạc*. Nếu team phải cherry-pick suốt ngày, vấn đề nằm ở branching strategy, không phải ở việc thiếu cherry-pick.

### Code minh hoạ
```bash
# === ĐÚNG: backport một hotfix từ main sang release branch ===
git checkout release/1.x
git cherry-pick -x <sha_cua_commit_fix>
# -x ghi "(cherry picked from commit <sha>)" vào message -> truy nguồn

# Cherry-pick nhiều commit liền nhau
git cherry-pick A^..C          # các commit từ A đến C

# Cherry-pick nhưng chưa commit (để gộp/sửa trước)
git cherry-pick -n <sha>

# Gặp conflict khi cherry-pick:
git cherry-pick <sha>
# CONFLICT -> resolve -> git add -> git cherry-pick --continue
# hoặc thoát: git cherry-pick --abort

# === MÙI XẤU: cherry-pick D từ main sang feature thay vì merge ===
git checkout feature/x
git cherry-pick <sha_D>        # tạo D' khác hash -> dễ conflict khi merge sau này
```

### Đáp án mẫu
> "Cherry-pick lấy một commit cụ thể và áp bản sao của nó lên nhánh hiện tại, chứ không merge cả nhánh. Use case đúng nhất là backport hotfix: em sửa bug khẩn trên main rồi cherry-pick đúng commit đó sang nhánh release đang chạy production mà không kéo theo feature chưa release — và em luôn dùng `-x` để ghi nguồn. Nó là công cụ đúng khi cần lấy một commit lẻ. Nhưng nếu team phải cherry-pick liên tục giữa các feature branch hay dùng nó để né merge conflict thì đó là dấu hiệu branching strategy có vấn đề. Lý do kỹ thuật là cherry-pick tạo commit trùng nội dung nhưng khác hash, nên khi sau này merge hai nhánh đó lại, Git dễ coi chúng là khác nhau và gây conflict hoặc nhân đôi commit. Em coi cherry-pick là dao mổ chính xác cho backport, không phải thứ thay thế cho quy trình branching mạch lạc."
