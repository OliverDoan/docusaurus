---
sidebar_position: 7
title: "7. Công cụ nâng cao"
---

# Công cụ nâng cao

> *Nhóm câu này kiểm tra các công cụ Git nâng cao — stash, worktree, partial/shallow clone, submodule/subtree, LFS. Đây là ranh giới phân biệt dev dùng Git "đủ xài" (add/commit/push/pull) với dev thực sự thành thạo, biết chọn đúng công cụ cho từng tình huống quản lý mã nguồn và tối ưu pipeline.*

---

## Câu 44: git stash nâng cao `[Intermediate]`

### Câu hỏi
> "Bạn dùng `git stash` như thế nào trong thực tế? Hãy nói về `push`, `pop`, `apply`, `list`, `show`, `drop` và những pattern hữu ích khi cần cất việc đang dở."

### Giải thích lý thuyết

`git stash` cất tạm những thay đổi chưa commit (cả staged và unstaged) vào một "ngăn kéo" riêng, đưa working directory về trạng thái sạch (giống `HEAD`). Đây là cứu cánh kinh điển khi đang code dở mà cần **switch branch gấp** hoặc **pull về** nhưng không muốn tạo một commit "WIP" rác.

Stash hoạt động như một **stack** (ngăn xếp): `stash@{0}` là cái mới nhất, `stash@{1}` cũ hơn, v.v.

| Lệnh | Tác dụng |
|------|----------|
| `git stash push -m "msg"` | Cất thay đổi kèm mô tả (dễ tìm lại sau này) |
| `git stash push -u` | Cất **kèm cả file untracked** (mặc định stash bỏ qua untracked) |
| `git stash push -a` | Cất cả file untracked **và** ignored |
| `git stash push <path>` | Chỉ cất một phần — đường dẫn cụ thể |
| `git stash list` | Liệt kê toàn bộ các stash đang có |
| `git stash show -p stash@{0}` | Xem diff đầy đủ của một stash |
| `git stash apply` | Áp dụng lại stash nhưng **vẫn giữ** trong stack |
| `git stash pop` | Áp dụng lại stash **rồi xoá** khỏi stack |
| `git stash drop stash@{0}` | Xoá một stash cụ thể |
| `git stash clear` | Xoá sạch toàn bộ stash |
| `git stash branch <name>` | Tạo branch mới từ stash (hữu ích khi pop bị conflict) |

Điểm khác biệt quan trọng giữa `apply` và `pop`: `pop` = `apply` + `drop`. Nếu việc áp dụng gặp **conflict**, `pop` sẽ **không tự xoá** stash (để bạn không mất dữ liệu), nên đôi khi bạn phải `drop` thủ công sau khi giải quyết xong.

> **Insight phỏng vấn:** Nhiều người chỉ biết `git stash` và `git stash pop` không tham số. Nhà tuyển dụng đánh giá cao khi bạn nhắc đến `-u` (untracked thường bị quên gây mất file mới tạo), `-m` để đặt tên (vì `pop` mặc định lấy `stash@{0}` rất dễ nhầm khi có nhiều stash), và `git stash branch` để xử lý khi stash xung đột với code đã thay đổi nhiều.

### Code minh hoạ

```bash
# Cất việc đang dở kèm mô tả, gồm cả file mới tạo (untracked)
git stash push -u -m "dang lam form login, can switch branch gap"

# Working directory giờ đã sạch -> switch branch xử lý hotfix
git switch hotfix/critical-bug

# ... fix xong, commit, quay lại branch cu ...
git switch feature/login

# Xem có những stash nào
git stash list
# stash@{0}: On feature/login: dang lam form login, can switch branch gap

# Xem trước nội dung diff của stash trước khi áp dụng
git stash show -p stash@{0}

# Áp dụng lại và xoá khỏi stack
git stash pop

# Pattern: chỉ stash một file cụ thể
git stash push src/components/Header.tsx -m "tam cat header"

# Pattern: stash bị conflict khi pop -> tách ra branch riêng để xử lý
git stash branch feature/recover-stash stash@{0}

# Dọn dẹp các stash không còn cần
git stash drop stash@{1}
git stash clear   # xoá tất cả (cẩn thận, không hoàn tác được)
```

### Đáp án mẫu
> "Em dùng `git stash` chủ yếu khi đang code dở mà cần switch branch gấp hoặc pull về mà không muốn tạo commit rác. Em luôn dùng `git stash push -m` để đặt tên, và thêm `-u` để gồm cả file untracked vì đây là cái hay bị quên gây mất file. Khi quay lại em check `git stash list`, xem trước bằng `show -p`, rồi `pop` để áp dụng và xoá. Em phân biệt `apply` giữ stash còn `pop` thì xoá. Nếu pop bị conflict em hay dùng `git stash branch` tách ra một branch riêng để xử lý sạch sẽ."

---

## Câu 45: git worktree `[Senior]`

### Câu hỏi
> "`git worktree` là gì? Khi nào bạn chọn nó thay vì `git stash` hoặc clone repo lần thứ hai?"

### Giải thích lý thuyết

`git worktree` cho phép một repo có **nhiều working directory** cùng lúc, tất cả **chia sẻ chung một thư mục `.git`** (object database, refs, config). Mỗi worktree checkout một branch khác nhau và tồn tại độc lập trên ổ đĩa.

Nói cách khác: thay vì chỉ có một thư mục làm việc gắn với một branch, bạn có thể có `main` ở thư mục này, `hotfix` ở thư mục kia, `review-pr-123` ở thư mục thứ ba — tất cả dùng chung lịch sử Git.

So sánh ba cách "làm nhiều việc song song":

| Tiêu chí | `git stash` | Clone lần 2 | `git worktree` |
|----------|-------------|-------------|----------------|
| Số branch xử lý đồng thời | 1 (phải cất/lấy lại) | Nhiều | Nhiều |
| Dung lượng đĩa | Không tốn thêm | Tốn x2 (copy cả `.git`) | Chỉ tốn working files |
| Tốc độ thiết lập | Nhanh | Chậm (fetch lại toàn bộ) | Rất nhanh (không fetch lại) |
| Chia sẻ refs/objects | — | Không (2 repo tách biệt) | Có (chung `.git`) |
| Phù hợp cho | Cất việc ngắn hạn | Khi cần repo hoàn toàn độc lập | Review PR / hotfix khi đang dở việc |

Lý do worktree thắng cả stash lẫn clone: với **stash**, bạn vẫn chỉ ở một branch tại một thời điểm, phải cất rồi lấy lại, không build/chạy song song được. Với **clone lần 2**, bạn tốn gấp đôi dung lượng và mất thời gian fetch lại toàn bộ lịch sử. Worktree giải quyết cả hai: tạo gần như tức thì và chỉ tốn dung lượng cho working files.

**Lưu ý quan trọng:** một branch chỉ được checkout ở **một worktree** tại một thời điểm. Nếu thử checkout `main` ở hai worktree, Git sẽ báo lỗi — tránh việc hai nơi cùng sửa một branch gây loạn.

> **Insight phỏng vấn:** Worktree là dấu hiệu của dev senior. Tình huống "vàng" để kể: đang code dở một feature lớn (dependency đã cài, build cache đã nóng) thì sếp bảo review PR hoặc fix bug production. Thay vì stash làm mất context hay clone tốn thời gian, bạn `worktree add` một thư mục riêng, mở IDE thứ hai, xử lý xong rồi `worktree remove` — feature đang dở không hề bị động chạm.

### Code minh hoạ

```bash
# Đang code dở ở feature/big-refactor thì cần review PR
# Tạo worktree mới cho branch main ở thư mục cùng cấp
git worktree add ../myrepo-review main

# Hoặc tạo worktree kèm branch mới luôn (cho hotfix)
git worktree add -b hotfix/login ../myrepo-hotfix main

# Liệt kê tất cả worktree đang có
git worktree list
# /Users/me/myrepo          abc1234 [feature/big-refactor]
# /Users/me/myrepo-review   def5678 [main]
# /Users/me/myrepo-hotfix   def5678 [hotfix/login]

# Làm việc ở worktree mới (build/test song song, không đụng feature đang dở)
cd ../myrepo-hotfix
# ... fix, commit, push ...

# Xong việc, xoá worktree (lịch sử commit vẫn nằm trong .git chung)
git worktree remove ../myrepo-hotfix

# Dọn các worktree đã bị xoá thư mục thủ công
git worktree prune
```

### Đáp án mẫu
> "`git worktree` cho phép một repo có nhiều thư mục làm việc cùng lúc, mỗi cái checkout một branch khác nhau nhưng dùng chung một `.git`. Em chọn nó khi đang code dở một feature lớn — dependency đã cài, build cache đã nóng — mà phải review PR hay fix hotfix gấp. Stash thì làm em mất context và không chạy song song được, clone lần hai thì tốn gấp đôi dung lượng và phải fetch lại lịch sử. Worktree tạo gần như tức thì, chỉ tốn dung lượng cho file làm việc. Lưu ý là một branch chỉ checkout được ở một worktree thôi."

---

## Câu 46: Partial clone và shallow clone trong CI/CD `[Senior]`

### Câu hỏi
> "Partial clone và shallow clone khác nhau ra sao? Khi nào bạn dùng chúng trong CI/CD để tăng tốc pipeline?"

### Giải thích lý thuyết

Mặc định `git clone` tải về **toàn bộ lịch sử** của repo: mọi commit, mọi tree, mọi blob (nội dung file) ở mọi phiên bản. Với repo lớn lâu năm, đây là hàng trăm MB tới vài GB — lãng phí khủng khiếp khi CI chỉ cần build từ commit mới nhất.

**Shallow clone** — cắt bớt theo chiều sâu lịch sử:

```bash
git clone --depth=1 <url>
```

Chỉ lấy commit gần nhất (depth=1), bỏ qua toàn bộ lịch sử cũ. Nhanh và nhẹ nhất cho CI build.

**Partial clone** — cắt bớt theo nội dung (lazy fetch):

```bash
git clone --filter=blob:none <url>   # blobless: chưa tải blob
git clone --filter=tree:0 <url>      # treeless: chưa tải cả tree lẫn blob
```

Partial clone tải metadata (commit, có thể cả tree) nhưng **bỏ qua blob**, chỉ fetch nội dung file theo nhu cầu khi bạn thực sự checkout/diff. Khác với shallow, partial clone vẫn **giữ được toàn bộ lịch sử commit** — chỉ là nội dung file được tải lười.

| Tiêu chí | Shallow clone | Partial clone (blobless) |
|----------|---------------|--------------------------|
| Cắt theo | Chiều sâu lịch sử | Nội dung file (blob) |
| Lịch sử commit | Mất (chỉ N commit gần nhất) | Giữ đầy đủ |
| Cờ | `--depth=1` | `--filter=blob:none` |
| Lazy fetch | Không | Có (tải blob khi cần) |
| `git log` / `blame` lịch sử dài | Hạn chế | Vẫn dùng được (sẽ fetch thêm) |
| Phù hợp | CI build thuần | Khi vẫn cần lịch sử nhưng repo lớn |

**Trade-off cần nhớ:**
- Shallow clone **mất lịch sử** → `git bisect`, `git blame` sâu, `git log` đầy đủ sẽ không hoạt động đúng. Đừng dùng nếu pipeline cần phân tích lịch sử (ví dụ tính changelog, semantic versioning từ commit cũ).
- Partial clone giữ lịch sử nhưng các thao tác cần blob sẽ phát sinh network call ngầm — chậm bất ngờ nếu offline hoặc server LFS/promisor chậm.

> **Insight phỏng vấn:** Câu trả lời ăn điểm là biết **chọn theo nhu cầu pipeline**: nếu job CI chỉ build/test từ commit hiện tại thì `--depth=1` nhanh nhất; nếu job cần tính version/changelog từ tag cũ thì shallow sẽ hỏng → dùng partial clone (`--filter=blob:none`) để vẫn có lịch sử mà repo vẫn nhẹ. GitHub Actions `actions/checkout` mặc định `fetch-depth: 1` chính là shallow clone — biết điều này cho thấy bạn hiểu hệ thống mình đang chạy.

### Code minh hoạ

```bash
# Shallow clone: nhanh nhất cho CI chỉ cần build commit mới nhất
git clone --depth=1 https://github.com/org/repo.git
# -> chỉ lấy 1 commit, không có lịch sử cũ

# Partial clone blobless: giữ lịch sử commit, tải blob khi cần
git clone --filter=blob:none https://github.com/org/repo.git

# Partial clone treeless: nhẹ hơn nữa, bỏ cả tree
git clone --filter=tree:0 https://github.com/org/repo.git

# Kết hợp cả hai: shallow + partial cho CI cực nhanh
git clone --depth=1 --filter=blob:none https://github.com/org/repo.git

# Nếu lỡ dùng shallow mà cần thêm lịch sử, "đào sâu" thêm
git fetch --deepen=50
git fetch --unshallow   # lấy lại toàn bộ lịch sử

# Trong GitHub Actions: tắt shallow khi cần full history
# - uses: actions/checkout@v4
#   with:
#     fetch-depth: 0   # 0 = full clone, mặc định là 1 (shallow)
```

### Đáp án mẫu
> "Shallow clone cắt theo chiều sâu lịch sử — `--depth=1` chỉ lấy commit mới nhất, nhanh và nhẹ nhất cho CI build. Partial clone cắt theo nội dung — `--filter=blob:none` bỏ qua blob, tải lười khi cần, nhưng vẫn giữ đầy đủ lịch sử commit. Trong CI em dùng `--depth=1` cho job chỉ build và test từ commit hiện tại. Nhưng nếu pipeline cần tính version hay changelog từ tag cũ thì shallow sẽ hỏng `git log` và `bisect`, lúc đó em chuyển sang partial clone để vừa có lịch sử vừa giữ repo nhẹ. GitHub Actions checkout mặc định cũng là shallow `fetch-depth: 1`."

---

## Câu 47: Git submodules vs git subtrees `[Senior]`

### Câu hỏi
> "Submodules và subtrees khác nhau như thế nào? Tại sao phần lớn team lại tránh dùng cả hai?"

### Giải thích lý thuyết

Cả hai đều giải quyết bài toán: nhúng một repo Git vào trong một repo Git khác (ví dụ dùng chung thư viện nội bộ giữa nhiều dự án).

**Submodule** — repo cha lưu một **con trỏ tới một commit cụ thể** của repo con. Code của repo con **không** nằm trong lịch sử repo cha; chỉ có một tham chiếu (gitlink) trong file `.gitmodules`. Khi clone, phải `--recursive` mới kéo được code con về.

**Subtree** — code của repo con được **nhúng thẳng** (merge) vào cây thư mục và lịch sử của repo cha. Không có file metadata riêng; người clone không cần biết đây vốn là repo khác.

| Tiêu chí | Submodule | Subtree |
|----------|-----------|---------|
| Cách lưu | Con trỏ tới commit repo con | Nhúng code + history vào repo cha |
| Clone | Cần `--recursive` (hay quên) | Tự động đầy đủ, không cần gì thêm |
| Kích thước repo cha | Nhẹ (chỉ con trỏ) | Phình (gồm cả lịch sử repo con) |
| Cập nhật repo con | `git submodule update --remote` | `git subtree pull` (cú pháp dài, dễ sai) |
| Đóng góp ngược lên | Tương đối rõ ràng | `git subtree push` phức tạp |
| Learning curve | Cao (detached HEAD, sync lệch) | Cao (lệnh dài, khó nhớ) |
| Người clone cần học | Có | Không (trong suốt) |

**Tại sao team thường tránh cả hai:**

- **Submodule:** Cực dễ "quên" — dev mới clone không `--recursive` thì thiếu code, `git pull` ở cha không tự cập nhật con, hay rơi vào trạng thái **detached HEAD** trong submodule rồi commit mất. Mỗi lần đổi version repo con phải commit con trỏ mới ở cha → quy trình rườm rà, dễ lệch giữa các thành viên.
- **Subtree:** Lệnh dài và khó nhớ (`git subtree pull --prefix=... <remote> <branch> --squash`), làm **history phình to** và rối, việc push ngược thay đổi lên repo gốc rất khó. Khi có sự cố, debug lịch sử merge của subtree rất mệt.

**Lựa chọn thay thế (alternative)** mà các team hiện đại ưu tiên:
- **Package manager + package registry:** đóng gói thư viện dùng chung thành package có version (npm/private registry, Maven, PyPI, Go modules…) — phụ thuộc rõ ràng qua semantic versioning, không nhét repo vào repo.
- **Monorepo:** gom tất cả vào một repo lớn, quản lý bằng công cụ như Nx, Turborepo, Bazel — chia sẻ code mà không cần liên kết liên-repo phức tạp.

> **Insight phỏng vấn:** Đừng chỉ liệt kê khác biệt — hãy thể hiện **gu kiến trúc**: cả submodule lẫn subtree đều là cách "ghép repo vào repo" và đều có chi phí vận hành cao. Câu trả lời chín chắn là: "Nếu được chọn, em ưu tiên đóng gói thành package có version qua registry, hoặc dùng monorepo, thay vì submodule/subtree — trừ khi có ràng buộc đặc biệt như license tách biệt hay vendor code bắt buộc."

### Code minh hoạ

```bash
# === SUBMODULE ===
# Thêm submodule
git submodule add https://github.com/org/shared-lib.git libs/shared
git commit -m "feat: them shared-lib lam submodule"

# Clone repo có submodule (PHẢI nhớ --recursive, đây là chỗ hay quên)
git clone --recursive https://github.com/org/app.git
# Hoặc nếu đã clone rồi mà thiếu code con:
git submodule update --init --recursive

# Cập nhật submodule lên commit mới nhất của nhánh remote
git submodule update --remote libs/shared
git add libs/shared && git commit -m "chore: update shared-lib"

# === SUBTREE ===
# Thêm subtree (code con nhúng thẳng vào prefix)
git subtree add --prefix=libs/shared \
  https://github.com/org/shared-lib.git main --squash

# Kéo cập nhật từ repo con (cú pháp dài, dễ sai)
git subtree pull --prefix=libs/shared \
  https://github.com/org/shared-lib.git main --squash

# Đẩy ngược thay đổi lên repo con (phức tạp)
git subtree push --prefix=libs/shared \
  https://github.com/org/shared-lib.git main
```

### Đáp án mẫu
> "Submodule lưu một con trỏ tới commit của repo con, code con không nằm trong lịch sử repo cha nên clone phải `--recursive` — rất hay quên và dễ dính detached HEAD. Subtree thì nhúng thẳng code và lịch sử con vào cha, clone không cần gì thêm nhưng làm repo phình to và lệnh thì dài khó nhớ. Phần lớn team tránh cả hai vì chi phí vận hành cao và dễ sai. Nếu được chọn, em ưu tiên đóng gói thư viện dùng chung thành package có version qua registry, hoặc dùng monorepo với Nx/Turborepo — phụ thuộc rõ ràng hơn nhiều so với ghép repo vào repo."

---

## Câu 48: Git LFS `[Intermediate]`

### Câu hỏi
> "Git LFS là gì? Bạn setup nó như thế nào cho một dự án có nhiều file design lớn và build artifact?"

### Giải thích lý thuyết

**Git LFS (Large File Storage)** là extension giải quyết điểm yếu cốt lõi của Git: Git được thiết kế cho **file text nhỏ**, lưu mọi phiên bản của mọi file vào lịch sử. Với file binary lớn (PSD, video, dataset, model…), mỗi lần sửa Git lại lưu một bản copy đầy đủ → repo phình lên hàng GB, clone chậm kinh khủng, và **không thể xoá** vì nằm trong lịch sử.

LFS giải quyết bằng cách: file lớn được thay bằng một **pointer text nhỏ** (vài chục byte chứa hash + kích thước) lưu trong repo Git, còn **nội dung thật (blob) lưu ở server LFS riêng**. Khi checkout, LFS tự tải nội dung thật về thế chỗ pointer.

```
Repo Git (nhẹ)              Server LFS
┌──────────────┐          ┌──────────────┐
│ design.psd   │          │  blob thật   │
│ -> pointer   │ ───────► │  (200 MB)    │
│   (130 byte) │          │              │
└──────────────┘          └──────────────┘
```

Kết quả: repo Git nhẹ, clone nhanh, lịch sử không phình vì file binary.

**Setup thực tế:**

1. Cài LFS một lần cho máy: `git lfs install`
2. Khai báo loại file cần quản lý: `git lfs track "*.psd"` — lệnh này ghi rule vào file `.gitattributes`
3. **Commit `.gitattributes`** (cực quan trọng, nếu không các thành viên khác sẽ không áp dụng LFS)
4. Add/commit/push như bình thường — LFS tự xử lý phần upload blob

| Điểm cần lưu ý | Chi tiết |
|----------------|----------|
| `.gitattributes` | Phải commit, nếu quên thì file lớn lại bị Git lưu thường |
| Track trước khi add | File đã commit trước khi track sẽ không tự chuyển sang LFS |
| Quota / băng thông | GitHub LFS có giới hạn dung lượng & bandwidth, vượt phải trả phí |
| Không lý tưởng cho artifact | Build artifact (jar, apk, zip) nên dùng **artifact registry** chứ không phải LFS |

> **Insight phỏng vấn:** Sai lầm phổ biến mà phỏng vấn muốn bạn nhận ra: dùng LFS cho **build artifact** là chống chỉ định. Artifact là output có thể tái tạo từ source, không cần version theo Git — chúng nên nằm ở **artifact registry** (Nexus, Artifactory, GitHub Packages, S3). LFS chỉ hợp với **source asset** không tái tạo được như file design, mockup, dataset gốc. Biết ranh giới này cho thấy bạn hiểu LFS là công cụ chứ không phải "thùng rác cho file lớn".

### Code minh hoạ

```bash
# Cài Git LFS (một lần cho mỗi máy)
git lfs install

# Track các loại file design lớn
git lfs track "*.psd"
git lfs track "*.ai"
git lfs track "*.sketch"
git lfs track "assets/videos/**"

# Lệnh trên ghi rule vào .gitattributes -> PHẢI commit file này
git add .gitattributes
git commit -m "chore: cau hinh git lfs cho file design"

# Giờ add file lớn như bình thường, LFS tự xử lý
git add design/homepage.psd
git commit -m "feat: them thiet ke trang chu"
git push origin main

# Kiểm tra những file nào đang được LFS quản lý
git lfs ls-files

# Xem trạng thái LFS (file nào pending upload)
git lfs status

# Nếu file lớn ĐÃ commit trước khi track -> phải migrate lịch sử
git lfs migrate import --include="*.psd" --everything

# Clone repo có LFS: chỉ tải pointer trước, blob tải khi cần
GIT_LFS_SKIP_SMUDGE=1 git clone https://github.com/org/repo.git
git lfs pull   # tải nội dung thật về sau
```

### Đáp án mẫu
> "Git LFS thay file lớn bằng một pointer text nhỏ trong repo, còn nội dung thật thì lưu ở server LFS riêng — nhờ vậy repo Git nhẹ và clone nhanh dù có nhiều file binary. Setup thì em chạy `git lfs install` một lần, rồi `git lfs track` cho từng loại như `*.psd`, lệnh đó ghi rule vào `.gitattributes` và em phải commit file này để cả team cùng áp dụng. Sau đó add commit push bình thường. Lưu ý là LFS có quota và băng thông giới hạn, và quan trọng là em không dùng LFS cho build artifact — artifact nên đẩy lên artifact registry vì chúng tái tạo được, LFS chỉ hợp cho source asset như file design không tái tạo được."
