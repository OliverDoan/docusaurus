---
sidebar_position: 1
title: "Remote Repository — Kho lưu trữ từ xa"
---

# Remote Repository — Kho lưu trữ từ xa

Khi bạn làm việc một mình trên máy tính, Git hoạt động hoàn toàn cục bộ (local). Nhưng khi bạn muốn **chia sẻ code với đồng đội**, **sao lưu code lên cloud**, hoặc **cộng tác với người khác trên toàn thế giới**, bạn cần một **remote repository**. Bài này sẽ giúp bạn hiểu remote là gì, cách quản lý remote, và sự khác nhau giữa HTTPS và SSH khi kết nối.

---

## 1. Remote là gì?

**Remote repository** (repo từ xa) là một bản sao của repository được lưu trữ trên một **server** (máy chủ), thường là các dịch vụ như GitHub, GitLab, hoặc Bitbucket.

Hãy tưởng tượng thế này:

```
+-------------------+         Internet          +-------------------+
|   Local Repo      | <======================> |   Remote Repo     |
|   (máy của bạn)   |    push / pull / fetch    |   (GitHub server) |
|                   |                           |                   |
|  - working dir    |                           |  - branches       |
|  - staging area   |                           |  - commits        |
|  - .git/          |                           |  - tags           |
+-------------------+                           +-------------------+
```

**Tại sao cần remote?**

| Lý do | Giải thích |
|-------|------------|
| **Sao lưu** | Code không bị mất nếu máy tính hỏng |
| **Cộng tác** | Nhiều người cùng làm việc trên 1 dự án |
| **Chia sẻ** | Người khác có thể xem và sử dụng code |
| **CI/CD** | Tự động kiểm tra và triển khai code |
| **Code review** | Đồng đội review code trước khi merge |

---

## 2. `origin` — Remote mặc định

Khi bạn **clone** một repository từ GitHub, Git tự động tạo một remote có tên là **`origin`**. Đây là quy ước đặt tên, không phải bắt buộc, nhưng hầu như mọi dự án đều dùng tên này.

```bash
# Clone một repo từ GitHub
git clone https://github.com/username/my-project.git

# Vào thư mục dự án
cd my-project

# Xem danh sách remote — sẽ thấy "origin"
git remote
# Kết quả:
# origin
```

**"origin" không phải tên đặc biệt** — nó chỉ là quy ước. Bạn hoàn toàn có thể đặt tên khác, nhưng tất cả developer trên thế giới đều quen với tên `origin`, nên hãy giữ nguyên để tránh nhầm lẫn.

---

## 3. Quản lý Remote

### 3.1. Xem danh sách remote: `git remote -v`

Lệnh `git remote -v` hiển thị tất cả remote kèm theo URL (verbose mode):

```bash
git remote -v
# Kết quả:
# origin  https://github.com/username/my-project.git (fetch)
# origin  https://github.com/username/my-project.git (push)
```

Bạn sẽ thấy **2 dòng** cho mỗi remote:
- **(fetch)** — URL dùng để tải dữ liệu về (download)
- **(push)** — URL dùng để đẩy dữ liệu lên (upload)

Thông thường, 2 URL này giống nhau. Nhưng trong một số trường hợp đặc biệt, bạn có thể cấu hình URL khác nhau cho fetch và push.

### 3.2. Thêm remote: `git remote add`

Nếu bạn tạo repo local trước rồi mới muốn kết nối với remote:

```bash
# Khởi tạo repo local
git init my-project
cd my-project

# Thêm remote với tên "origin"
git remote add origin https://github.com/username/my-project.git

# Kiểm tra
git remote -v
# origin  https://github.com/username/my-project.git (fetch)
# origin  https://github.com/username/my-project.git (push)
```

**Cú pháp:**

```bash
git remote add <tên-remote> <url>
```

### 3.3. Xóa remote: `git remote remove`

Khi bạn không cần kết nối đến remote nào đó nữa:

```bash
# Xóa remote có tên "old-server"
git remote remove old-server

# Hoặc viết tắt
git remote rm old-server
```

**Lưu ý:** Xóa remote chỉ xóa **tham chiếu** (reference) trong cấu hình Git local. Code trên server vẫn còn nguyên, và code local của bạn cũng không bị ảnh hưởng.

### 3.4. Đổi tên remote: `git remote rename`

```bash
# Đổi tên remote từ "origin" thành "github"
git remote rename origin github

# Kiểm tra
git remote -v
# github  https://github.com/username/my-project.git (fetch)
# github  https://github.com/username/my-project.git (push)
```

### 3.5. Xem chi tiết remote: `git remote show`

Lệnh này cho bạn **rất nhiều thông tin hữu ích** về một remote:

```bash
git remote show origin

# Kết quả mẫu:
# * remote origin
#   Fetch URL: https://github.com/username/my-project.git
#   Push  URL: https://github.com/username/my-project.git
#   HEAD branch: main
#   Remote branches:
#     main     tracked
#     develop  tracked
#     feature  tracked
#   Local branches configured for 'git pull':
#     main    merges with remote main
#     develop merges with remote develop
#   Local refs configured for 'git push':
#     main    pushes to main    (up to date)
#     develop pushes to develop (local out of date)
```

Thông tin bao gồm:
- **URL** fetch và push
- **HEAD branch** — nhánh mặc định trên remote
- **Remote branches** — các nhánh trên remote và trạng thái tracking
- **Local branches** — nhánh local nào liên kết với nhánh remote nào
- **Trạng thái** — up to date, local out of date, fast-forwardable...

---

## 4. Multiple Remotes — Khi nào cần nhiều remote?

Một repo local có thể kết nối đến **nhiều remote** cùng lúc. Đây là tình huống rất phổ biến:

### Tình huống 1: Fork workflow (đóng góp open source)

```
+-------------------+
|   upstream        |  <-- Repo gốc (của tác giả)
|   (repo gốc)     |
+--------^----------+
         |
         | fork
         |
+--------v----------+
|   origin          |  <-- Fork của bạn trên GitHub
|   (fork của bạn)  |
+--------^----------+
         |
         | clone
         |
+--------v----------+
|   Local Repo      |  <-- Máy tính của bạn
|   (máy của bạn)   |
+-------------------+
```

```bash
# Clone fork của bạn (tự động tạo "origin")
git clone https://github.com/your-username/project.git
cd project

# Thêm remote "upstream" trỏ đến repo gốc
git remote add upstream https://github.com/original-author/project.git

# Kiểm tra — bây giờ có 2 remote
git remote -v
# origin    https://github.com/your-username/project.git (fetch)
# origin    https://github.com/your-username/project.git (push)
# upstream  https://github.com/original-author/project.git (fetch)
# upstream  https://github.com/original-author/project.git (push)
```

### Tình huống 2: Deploy đến nhiều server

```bash
# Remote cho GitHub (code review + CI/CD)
git remote add github https://github.com/company/project.git

# Remote cho server production (deploy)
git remote add production ssh://deploy@server.com/project.git

# Push code review lên GitHub
git push github main

# Deploy lên production
git push production main
```

### Tình huống 3: Backup đến nhiều nơi

```bash
# Remote chính (GitHub)
git remote add origin https://github.com/username/project.git

# Backup lên GitLab
git remote add backup https://gitlab.com/username/project.git

# Push đến cả 2 nơi
git push origin main
git push backup main
```

---

## 5. Tracking Branches — Nhánh theo dõi

Khi bạn clone một repo hoặc fetch từ remote, Git tạo ra các **remote-tracking branches**. Đây là các bản sao read-only (chỉ đọc) của nhánh trên remote, lưu trong local của bạn.

### Cách nhận biết

Remote-tracking branches có dạng `<remote>/<branch>`:

```bash
# Xem tất cả branches (bao gồm remote-tracking)
git branch -a

# Kết quả:
# * main                        <-- nhánh local
#   develop                     <-- nhánh local
#   remotes/origin/main         <-- remote-tracking branch
#   remotes/origin/develop      <-- remote-tracking branch
#   remotes/origin/feature/auth <-- remote-tracking branch
```

### Cách hoạt động

```
Local branches          Remote-tracking branches       Remote (GitHub)
                        (read-only snapshots)

  main      --------->  origin/main      <---------    main
  develop   --------->  origin/develop   <---------    develop
                        origin/feature   <---------    feature
```

**Quy trình cập nhật:**

1. Ai đó push code mới lên remote
2. Bạn chạy `git fetch` — Git cập nhật remote-tracking branches
3. `origin/main` giờ đã có commit mới
4. Bạn chạy `git merge origin/main` — merge vào nhánh local

```bash
# Xem trạng thái so sánh local vs remote
git status

# Kết quả (nếu remote có commit mới):
# On branch main
# Your branch is behind 'origin/main' by 3 commits,
#   and can be fast-forwarded.

# Xem sự khác biệt giữa local và remote
git log main..origin/main --oneline
# abc1234 feat: add login page
# def5678 fix: button alignment
# ghi9012 docs: update README
```

### Thiết lập tracking

Khi bạn tạo nhánh local từ remote-tracking branch, Git tự động thiết lập tracking:

```bash
# Tạo nhánh local "feature" tracking "origin/feature"
git checkout -b feature origin/feature
# Hoặc ngắn gọn hơn:
git checkout feature  # Git tự tìm origin/feature nếu tên trùng

# Thiết lập tracking thủ công
git branch --set-upstream-to=origin/main main
# Hoặc viết tắt:
git branch -u origin/main main
```

---

## 6. HTTPS vs SSH — So sánh chi tiết

Khi kết nối đến remote, bạn có 2 cách: **HTTPS** và **SSH**.

### HTTPS

```bash
# URL dạng HTTPS
git remote add origin https://github.com/username/project.git
```

### SSH

```bash
# URL dạng SSH
git remote add origin git@github.com:username/project.git
```

### Bảng so sánh

| Tiêu chí | HTTPS | SSH |
|-----------|-------|-----|
| **URL format** | `https://github.com/user/repo.git` | `git@github.com:user/repo.git` |
| **Xác thực** | Username + PAT (Personal Access Token) | SSH key pair (public + private) |
| **Cài đặt ban đầu** | Dễ, chỉ cần tạo PAT | Phức tạp hơn, cần tạo SSH key |
| **Bảo mật** | Tốt (token-based) | Rất tốt (key-based) |
| **Firewall** | Ít bị chặn (port 443) | Có thể bị chặn (port 22) |
| **Tiện lợi** | Cần nhập token (hoặc cache) | Không cần nhập gì sau khi setup |
| **Phù hợp** | Người mới, môi trường corporate | Developer có kinh nghiệm |
| **Đổi máy** | Cần tạo PAT mới hoặc copy token | Cần copy SSH key hoặc tạo mới |

### Thiết lập SSH key (từng bước)

```bash
# Bước 1: Tạo SSH key pair
ssh-keygen -t ed25519 -C "your-email@example.com"
# Nhấn Enter để chấp nhận đường dẫn mặc định (~/.ssh/id_ed25519)
# Nhập passphrase (khuyên dùng) hoặc Enter để bỏ qua

# Bước 2: Khởi động ssh-agent
eval "$(ssh-agent -s)"

# Bước 3: Thêm SSH key vào agent
ssh-add ~/.ssh/id_ed25519

# Bước 4: Copy public key
cat ~/.ssh/id_ed25519.pub
# Copy toàn bộ nội dung hiển thị

# Bước 5: Thêm public key vào GitHub
# GitHub → Settings → SSH and GPG keys → New SSH key → Dán public key

# Bước 6: Kiểm tra kết nối
ssh -T git@github.com
# Hi username! You've successfully authenticated...
```

### Chuyển đổi giữa HTTPS và SSH

```bash
# Xem URL hiện tại
git remote -v
# origin  https://github.com/username/project.git (fetch)

# Chuyển sang SSH
git remote set-url origin git@github.com:username/project.git

# Chuyển ngược lại HTTPS
git remote set-url origin https://github.com/username/project.git
```

---

## 7. Personal Access Token (PAT) cho HTTPS

Từ năm 2021, GitHub không còn cho phép dùng **password** để xác thực qua HTTPS. Thay vào đó, bạn phải dùng **Personal Access Token (PAT)**.

### Tạo PAT trên GitHub

1. Vào **GitHub** > **Settings** > **Developer settings** > **Personal access tokens** > **Tokens (classic)**
2. Click **Generate new token**
3. Đặt tên mô tả (ví dụ: "My laptop token")
4. Chọn thời hạn (khuyên: 90 ngày)
5. Chọn scopes (quyền hạn):
   - `repo` — truy cập repositories (bắt buộc)
   - `workflow` — chạy GitHub Actions (nếu cần)
   - `read:org` — đọc thông tin organization (nếu cần)
6. Click **Generate token**
7. **Copy token ngay** — bạn sẽ không thấy lại nó

### Sử dụng PAT

```bash
# Khi push lần đầu, Git sẽ hỏi credentials
git push origin main
# Username: your-github-username
# Password: <paste-PAT-ở-đây>  (KHÔNG phải password GitHub)
```

### Lưu PAT để không phải nhập lại

```bash
# Cách 1: Lưu vào credential helper (khuyên dùng trên macOS)
git config --global credential.helper osxkeychain

# Cách 2: Lưu vào credential helper (Linux)
git config --global credential.helper store
# Lưu ý: lưu dạng plaintext trong ~/.git-credentials

# Cách 3: Cache tạm thời (15 phút mặc định)
git config --global credential.helper cache

# Cache với thời gian dài hơn (1 giờ = 3600 giây)
git config --global credential.helper 'cache --timeout=3600'
```

**Bảo mật PAT:**

| Nên | Không nên |
|-----|-----------|
| Đặt thời hạn ngắn (30-90 ngày) | Tạo token vĩnh viễn |
| Chọn ít quyền nhất cần thiết | Chọn tất cả scopes |
| Dùng credential helper | Lưu token trong file text |
| Tạo token riêng cho mỗi thiết bị | Dùng chung 1 token |
| Xóa token khi không dùng | Để token cũ tồn tại |

---

## 8. Sơ đồ tổng quan: Local vs Remote

```
                        +------------------------------------------+
                        |           REMOTE (GitHub Server)         |
                        |                                          |
                        |  main ----o----o----o                    |
                        |                \                         |
                        |  develop -------o----o                   |
                        |                                          |
                        +----------^-----------|-----------+-------+
                                   |           |           |
                              push |     fetch |     clone |
                                   |           |           |
                        +----------|-----------v-----------v-------+
                        |          LOCAL REPOSITORY                |
                        |                                          |
                        |  +-- Working Directory --+               |
                        |  |  (code bạn đang sửa)  |               |
                        |  +-----------|-----------+               |
                        |              | git add                   |
                        |  +-----------v-----------+               |
                        |  |   Staging Area        |               |
                        |  |   (chuẩn bị commit)   |               |
                        |  +-----------|-----------+               |
                        |              | git commit                |
                        |  +-----------v-----------+               |
                        |  |   Local Repository    |               |
                        |  |   (.git/ directory)   |               |
                        |  |                       |               |
                        |  |  main                 |               |
                        |  |  origin/main (track)  |               |
                        |  |  origin/develop       |               |
                        |  +-----------------------+               |
                        +------------------------------------------+
```

---

## 9. Lỗi thường gặp

### Lỗi 1: `fatal: remote origin already exists`

```bash
# Lỗi khi thêm remote trùng tên
git remote add origin https://github.com/username/project.git
# fatal: remote origin already exists.

# Cách sửa: đổi URL thay vì thêm mới
git remote set-url origin https://github.com/username/new-project.git

# Hoặc xóa rồi thêm lại
git remote remove origin
git remote add origin https://github.com/username/new-project.git
```

### Lỗi 2: `fatal: 'origin' does not appear to be a git repository`

```bash
# Lỗi: chưa thêm remote
git push origin main
# fatal: 'origin' does not appear to be a git repository

# Cách sửa: thêm remote
git remote add origin https://github.com/username/project.git
```

### Lỗi 3: `Permission denied (publickey)`

```bash
# Lỗi: SSH key chưa được cấu hình đúng
git push origin main
# Permission denied (publickey).

# Kiểm tra SSH key
ssh -T git@github.com

# Nếu lỗi, kiểm tra:
# 1. SSH key đã được tạo chưa?
ls ~/.ssh/id_ed25519.pub

# 2. SSH key đã thêm vào agent chưa?
ssh-add -l

# 3. Public key đã thêm vào GitHub chưa?
# Vào GitHub → Settings → SSH keys
```

### Lỗi 4: `remote: Repository not found`

```bash
# Lỗi: URL sai hoặc không có quyền truy cập
git push origin main
# remote: Repository not found.

# Kiểm tra URL
git remote -v

# Kiểm tra:
# 1. URL có đúng không? (username, repo name)
# 2. Repo có tồn tại trên GitHub không?
# 3. Bạn có quyền truy cập không? (private repo)
# 4. PAT có đủ quyền "repo" không?
```

### Lỗi 5: Nhầm lẫn HTTPS và SSH URL

```bash
# Dùng HTTPS nhưng paste SSH URL hoặc ngược lại
# HTTPS: https://github.com/username/project.git
# SSH:   git@github.com:username/project.git

# Kiểm tra và sửa
git remote -v
git remote set-url origin <url-đúng>
```

---

## 10. Câu hỏi phỏng vấn

### Câu 1: Remote repository là gì? Tại sao cần remote?

**Trả lời:** Remote repository là bản sao của repository được lưu trữ trên server (GitHub, GitLab, Bitbucket...). Cần remote để: (1) sao lưu code an toàn, (2) cộng tác với nhiều người, (3) chia sẻ code, (4) tích hợp CI/CD để kiểm tra và triển khai tự động, (5) hỗ trợ code review qua Pull Request.

### Câu 2: `origin` trong Git là gì? Nó có phải là từ khóa đặc biệt không?

**Trả lời:** `origin` là tên mặc định mà Git đặt cho remote repository khi bạn clone. Nó KHÔNG phải từ khóa đặc biệt hay bắt buộc — chỉ là quy ước đặt tên được sử dụng rộng rãi. Bạn hoàn toàn có thể đổi tên nó bằng `git remote rename origin <tên-mới>`.

### Câu 3: Phân biệt `origin` và `upstream` trong fork workflow?

**Trả lời:** Trong fork workflow: `origin` trỏ đến fork của bạn trên GitHub (nơi bạn có quyền push), còn `upstream` trỏ đến repo gốc (repo mà bạn fork). Bạn fetch từ `upstream` để cập nhật code mới nhất từ repo gốc, và push lên `origin` (fork của bạn) trước khi tạo Pull Request.

### Câu 4: Remote-tracking branch là gì? Cho ví dụ.

**Trả lời:** Remote-tracking branch là bản sao read-only (chỉ đọc) của nhánh trên remote, được lưu trong local repo. Ví dụ: `origin/main` là remote-tracking branch theo dõi nhánh `main` trên remote `origin`. Nó được cập nhật khi bạn chạy `git fetch` hoặc `git pull`. Bạn không thể commit trực tiếp lên remote-tracking branch — phải merge hoặc rebase vào nhánh local trước.

### Câu 5: So sánh HTTPS và SSH khi kết nối đến remote. Khi nào dùng cái nào?

**Trả lời:** HTTPS dùng token-based authentication (PAT), dễ cài đặt, ít bị firewall chặn (port 443), phù hợp người mới và môi trường corporate. SSH dùng key-based authentication (public/private key pair), bảo mật cao hơn, tiện lợi hơn sau khi setup (không cần nhập credentials), nhưng có thể bị firewall chặn port 22. Trong thực tế, SSH được ưa chuộng hơn vì tiện lợi khi đã cấu hình xong.

### Câu 6: Một repo local có thể kết nối đến nhiều remote không? Cho ví dụ thực tế.

**Trả lời:** Có, một repo local có thể kết nối đến nhiều remote bằng `git remote add`. Ví dụ thực tế: (1) Fork workflow — `origin` cho fork, `upstream` cho repo gốc; (2) Backup — `origin` cho GitHub, `backup` cho GitLab; (3) Deploy — `github` cho code review, `production` cho deploy. Dùng `git push <tên-remote> <branch>` để push đến remote cụ thể.
