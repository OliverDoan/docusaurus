---
sidebar_position: 1
title: "1. Git la gi? Tai sao phai hoc Git?"
---

# Git là gì? Tại sao phải học Git?

Bạn đã bao giờ gặp tình huống này chưa:

```
bao-cao-final.docx
bao-cao-final-v2.docx
bao-cao-final-v2-sua-lai.docx
bao-cao-final-THIET-LA-CUOI-CUNG.docx
bao-cao-final-CUOI-CUNG-THAT-SU.docx
```

Nếu có, chúc mừng bạn — bạn đang "quản lý phiên bản" bằng tay. Và đó chính là lý do Git ra đời.

---

## 1. Version Control System (VCS) là gì?

**Version Control System** (Hệ thống quản lý phiên bản) là công cụ giúp bạn:

- **Lưu lại lịch sử** mọi thay đổi của dự án
- **Quay lại** bất kỳ thời điểm nào trong quá khứ
- **Làm việc nhóm** mà không ghi đè lên code của nhau
- **Theo dõi** ai đã thay đổi gì, khi nào, và tại sao

### Tại sao cần quản lý phiên bản?

Hãy tưởng tượng bạn đang viết một ứng dụng. Hôm nay code chạy tốt, nhưng sáng mai bạn sửa một tính năng và bất ngờ... mọi thứ hỏng hết. Không có VCS, bạn phải nhớ "mình đã sửa gì" và cố gắng undo bằng trí nhớ. Với VCS, bạn chỉ cần:

```bash
# Quay lại phiên bản hôm qua — đơn giản như vậy
git checkout abc1234
```

### Không chỉ dành cho code

VCS không chỉ dùng cho lập trình. Bất kỳ ai làm việc với file thay đổi theo thời gian đều cần:

| Lĩnh vực | Dùng VCS để làm gì |
|----------|-------------------|
| Developer | Quản lý source code, làm việc nhóm |
| Designer | Theo dõi thay đổi file thiết kế |
| Data Scientist | Version data pipelines, notebooks |
| DevOps | Quản lý infrastructure as code |
| Technical Writer | Theo dõi thay đổi tài liệu |

---

## 2. Lịch sử phát triển: Từ copy thủ công đến Git

### Giai đoạn 1: Copy thủ công (trước 1990s)

```
project/
project-backup/
project-backup-2/
project-cu-dung-xoa/
```

**Vấn đề:** Không biết phiên bản nào mới nhất, không thể so sánh sự khác biệt, mất file là mất luôn.

### Giai đoạn 2: Centralized VCS — CVS, SVN (1990s-2000s)

CVS (1990) và SVN/Subversion (2000) ra đời với ý tưởng: **một server trung tâm** lưu toàn bộ lịch sử.

```
               +------------------+
               |   SVN Server     |
               |  (Central Repo)  |
               +--------+---------+
                       |
          +------------+------------+
          |            |            |
     Developer A  Developer B  Developer C
     (working     (working     (working
      copy)        copy)        copy)
```

**Ưu điểm:** Tốt hơn copy thủ công nhiều.
**Nhược điểm:** Server chết = cả team dừng làm việc. Không có mạng = không commit được.

### Giai đoạn 3: Distributed VCS — Git (2005)

**Linus Torvalds** — người tạo ra Linux — đã tạo Git vào năm 2005 vì bất mãn với các VCS hiện tại. Ông cần một hệ thống:

- **Cực nhanh** (Linux kernel có hàng triệu dòng code)
- **Phân tán** (hàng ngàn developer trên toàn thế giới)
- **Hỗ trợ branching** mạnh mẽ
- **Đảm bảo toàn vẹn dữ liệu**

Kết quả: Git ra đời và nhanh chóng trở thành **VCS phổ biến nhất thế giới**.

```
Thời gian:  1990      2000      2005      Hiện tại
            |---------|---------|---------|
            CVS       SVN       Git       Git thống trị
            (Centralized)       (Distributed)
```

---

## 3. Centralized vs Distributed VCS

Đây là sự khác biệt cốt lõi giữa SVN và Git:

### ASCII Diagram: Centralized VCS

```
                +------------------+
                |   CENTRAL SERVER |
                |   (toàn bộ      |
                |    lịch sử)     |
                +--------+---------+
                         |
           +-------------+-------------+
           |             |             |
      +----+----+   +----+----+   +----+----+
      |  Dev A  |   |  Dev B  |   |  Dev C  |
      | (chỉ có |   | (chỉ có |   | (chỉ có |
      |  bản    |   |  bản    |   |  bản    |
      |  mới    |   |  mới    |   |  mới    |
      |  nhất)  |   |  nhất)  |   |  nhất)  |
      +---------+   +---------+   +---------+

      --> Mọi thao tác đều cần kết nối server
      --> Server chết = team dừng hoạt động
```

### ASCII Diagram: Distributed VCS (Git)

```
      +---------+        +---------+        +---------+
      |  Dev A  |        |  Dev B  |        |  Dev C  |
      | (FULL   |<------>| (FULL   |<------>| (FULL   |
      |  REPO   |        |  REPO   |        |  REPO   |
      |  + lịch |        |  + lịch |        |  + lịch |
      |  sử)    |        |  sử)    |        |  sử)    |
      +----+----+        +----+----+        +----+----+
           |                  |                  |
           +------------------+------------------+
                              |
                    +---------+---------+
                    |   REMOTE SERVER   |
                    |   (GitHub, etc.)  |
                    |   (tùy chọn,     |
                    |    không bắt buộc)|
                    +-------------------+

      --> Mỗi developer có BẢN SAO ĐẦY ĐỦ
      --> Làm việc offline hoàn toàn được
      --> Server chết? Vẫn làm việc bình thường
```

### Bảng so sánh chi tiết

| Tiêu chí | Centralized (SVN) | Distributed (Git) |
|----------|-------------------|-------------------|
| Nơi lưu lịch sử | Chỉ trên server | Mỗi máy đều có full history |
| Làm việc offline | Không thể | Hoàn toàn được |
| Tốc độ commit | Chậm (qua mạng) | Cực nhanh (local) |
| Branching | Chậm, nặng nề | Nhanh, nhẹ |
| Single point of failure | Có (server) | Không |
| Backup tự nhiên | Không | Có (mỗi clone là 1 backup) |
| Học sử dụng | Dễ hơn | Khó hơn một chút |
| Phù hợp | Team nhỏ, dự án đơn giản | Mọi quy mô dự án |

---

## 4. Git vs SVN — So sánh cụ thể

### Tốc độ

```bash
# SVN: Mỗi commit phải gửi qua mạng đến server
svn commit -m "sua loi"  # Mất vài giây đến vài phút

# Git: Commit ngay trên máy local
git commit -m "sua loi"  # Gần như tức thì (< 1 giây)
```

### Branching

```bash
# SVN: Tạo branch = copy toàn bộ thư mục (chậm)
svn copy trunk branches/feature-login  # Copy thật sự trên server

# Git: Tạo branch = tạo 1 pointer 41 bytes (cực nhanh)
git branch feature-login  # Tức thì, chỉ tạo 1 file nhỏ
```

### Làm việc offline

```bash
# SVN: Không có mạng? Không làm được gì nhiều
svn commit  # LỖI: không kết nối được server
svn log     # LỖI: không kết nối được server

# Git: Không có mạng? Vẫn làm việc bình thường
git commit -m "feature moi"  # OK — commit local
git log                       # OK — đọc lịch sử local
git branch feature-x          # OK — tạo branch local
git diff                      # OK — so sánh thay đổi
# Chỉ cần mạng khi push/pull với remote
```

### Bảng so sánh tổng hợp

| Tiêu chí | SVN | Git |
|----------|-----|-----|
| Mô hình | Centralized | Distributed |
| Tốc độ | Chậm (mạng) | Nhanh (local) |
| Branch | Nặng, copy thư mục | Nhẹ, chỉ là pointer |
| Merge | Khó, hay conflict | Thông minh hơn |
| Offline | Rất hạn chế | Đầy đủ |
| Học | Dễ hơn | Khó hơn ban đầu |
| Disk | Ít hơn (chỉ có latest) | Nhiều hơn (full history) |
| Phục hồi | Phụ thuộc server | Mỗi clone là backup |

---

## 5. Tại sao Git thống trị?

### 5.1 Tốc độ vượt trội

Git làm hầu hết mọi thứ trên máy local, nên:
- **Commit:** tức thì
- **Xem log:** tức thì
- **Tạo branch:** tức thì
- **So sánh diff:** tức thì

Chỉ có `push` và `pull` là cần mạng.

### 5.2 Branching và Merging mạnh mẽ

Git được thiết kế từ đầu để branching rẻ và nhanh:

```bash
# Tạo branch mới và chuyển sang
git checkout -b feature/login

# Làm việc, commit nhiều lần...
git commit -m "them form login"
git commit -m "them validation"

# Merge về main
git checkout main
git merge feature/login

# Xóa branch đã merge
git branch -d feature/login
```

Trong SVN, branching là "việc lớn" — cần suy nghĩ trước khi làm.
Trong Git, branching là "việc nhỏ" — tạo branch cho mỗi tính năng, mỗi bug fix.

### 5.3 Làm việc offline

Trên máy bay? Trong quán cafe mất mạng? Vẫn commit, tạo branch, xem log bình thường.

### 5.4 Cộng đồng và hệ sinh thái khổng lồ

- **GitHub:** 100+ triệu developer
- **GitLab, Bitbucket:** Các nền tảng lớn khác
- **CI/CD:** Hầu hết pipeline đều tích hợp Git
- **Mọi ngôn ngữ/framework** đều có `.gitignore` template

### 5.5 Miễn phí và open source

Git là phần mềm **miễn phí**, **mã nguồn mở**, phát triển bởi cộng đồng toàn cầu.

---

## 6. Git KHÔNG PHẢI là GitHub

Đây là nhầm lẫn **phổ biến nhất** của người mới:

```
+-------------------+        +-------------------+
|       GIT         |        |      GITHUB       |
+-------------------+        +-------------------+
| Phần mềm         |        | Dịch vụ web       |
| Cài trên máy     |        | Truy cập qua      |
|   của bạn        |        |   trình duyệt     |
| Quản lý phiên bản|        | Lưu trữ remote    |
|   LOCAL          |        |   repository      |
| Miễn phí, open   |        | Cơ bản miễn phí,  |
|   source         |        |   có gói trả phí  |
| Chạy bằng dòng   |        | Giao diện web +   |
|   lệnh (CLI)     |        |   nhiều tính năng |
| Không cần mạng   |        | Cần mạng để truy  |
|                   |        |   cập             |
+-------------------+        +-------------------+
        |                            |
        | Git là CÔNG CỤ            | GitHub là DỊCH VỤ
        | (như Word)                 | (như Google Docs)
        +----------------------------+
```

### Các dịch vụ tương tự GitHub

| Dịch vụ | Đặc điểm |
|---------|----------|
| **GitHub** | Phổ biến nhất, cộng đồng lớn, GitHub Actions |
| **GitLab** | Self-hosted, CI/CD tích hợp, DevOps platform |
| **Bitbucket** | Tích hợp Jira/Atlassian, free private repos |
| **Azure DevOps** | Tích hợp hệ sinh thái Microsoft |

**Lưu ý:** Bạn có thể dùng Git mà **không cần bất kỳ dịch vụ nào** ở trên. Git hoạt động hoàn toàn trên máy local của bạn.

---

## 7. Ai cần học Git?

### Developer (bắt buộc)

```
99% công việc lập trình yêu cầu Git.
Không biết Git = Không đi làm được.
```

Đúng, không phải nói quá. Hầu hết mọi công ty, từ startup đến tập đoàn, đều dùng Git.

### Các vai trò khác

| Vai trò | Tại sao cần Git |
|---------|-----------------|
| **Frontend Dev** | Quản lý code React/Vue/Angular, làm việc nhóm |
| **Backend Dev** | Quản lý API code, database migrations |
| **DevOps** | Infrastructure as Code (Terraform, K8s) |
| **Data Scientist** | Version notebooks, data pipelines |
| **Mobile Dev** | Quản lý code iOS/Android |
| **Designer** | Version design tokens, design systems |
| **Technical Writer** | Quản lý documentation (như trang này!) |
| **QA Engineer** | Quản lý test scripts, test data |

---

## 8. Cách Git lưu dữ liệu

Một điểm quan trọng mà nhiều người hiểu sai: **Git lưu snapshot, không phải diff**.

### Cách khác (SVN): Lưu sự thay đổi (delta)

```
Version 1:  [File A v1] [File B v1] [File C v1]
                |            |
Version 2:  [delta A2]   [delta B2]  (chỉ lưu phần thay đổi)
                |
Version 3:  [delta A3]               (chỉ lưu phần thay đổi)
```

### Cách của Git: Lưu snapshot

```
Commit 1:  [File A v1] [File B v1] [File C v1]
                                        |
Commit 2:  [File A v2] [File B v2] [File C v1] <-- link đến v1 (không copy lại)
                |                       |
Commit 3:  [File A v3] [File B v2] [File C v1] <-- link đến các version cũ
```

Nếu file không đổi, Git **không copy lại** mà chỉ tạo một **link** đến phiên bản trước. Nên Git vừa nhanh vừa tiết kiệm dung lượng.

---

## 9. Lỗi thường gặp khi mới bắt đầu

### Lỗi 1: Nghĩ Git và GitHub là một thứ

```
SAI:  "Em push code lên Git"
ĐÚNG: "Em push code lên GitHub" (hoặc GitLab, Bitbucket...)

Git = công cụ trên máy local
GitHub = dịch vụ lưu trữ trên cloud
```

### Lỗi 2: Sợ Git vì "khó học"

Git có nhiều lệnh, nhưng bạn chỉ cần ~10 lệnh cho công việc hàng ngày:

```bash
git init          # Tạo repo
git clone         # Clone repo
git add           # Thêm file vào staging
git commit        # Lưu thay đổi
git push          # Đẩy lên remote
git pull          # Kéo về từ remote
git branch        # Quản lý branch
git checkout      # Chuyển branch
git merge         # Gộp branch
git status        # Xem trạng thái
```

### Lỗi 3: Không học Git sớm

Nhiều người học lập trình 6 tháng rồi mới bắt đầu học Git. Sai lầm! Nên học Git **ngay khi bắt đầu code** — dù là hello world.

### Lỗi 4: Chỉ dùng GUI mà không hiểu CLI

GUI tools (VS Code Git, Sourcetree, GitKraken) rất tiện, nhưng:
- Không giúp bạn hiểu bản chất
- Khi gặp lỗi, bạn không biết sửa
- Phỏng vấn lúc nào cũng hỏi lệnh Git

**Khuyến nghị:** Học CLI trước, dùng GUI sau.

---

## 10. Câu hỏi phỏng vấn

### Câu 1: Git là gì? Giải thích ngắn gọn.

**Trả lời mẫu:**

> Git là một Distributed Version Control System (hệ thống quản lý phiên bản phân tán). Nó cho phép nhiều người làm việc trên cùng một dự án, theo dõi mọi thay đổi, và quay lại bất kỳ phiên bản nào trước đó. Git lưu trữ toàn bộ lịch sử trên máy mỗi developer, cho phép làm việc offline và không phụ thuộc vào server trung tâm.

### Câu 2: Phân biệt Git và GitHub.

**Trả lời mẫu:**

> Git là phần mềm cài trên máy local, quản lý phiên bản code. GitHub là dịch vụ web cho phép lưu trữ Git repository trên cloud, kèm theo các tính năng cộng tác như Pull Request, Issues, Actions. Git có thể hoạt động độc lập mà không cần GitHub.

### Câu 3: Tại sao Git dùng mô hình distributed thay vì centralized?

**Trả lời mẫu:**

> Distributed model cho phép mỗi developer có bản sao đầy đủ của repository, bao gồm toàn bộ lịch sử. Điều này mang lại: (1) Làm việc offline, (2) Tốc độ nhanh vì thao tác trên local, (3) Không có single point of failure, (4) Mỗi clone là một backup tự nhiên. Đây là lý do Git được thiết kế bởi Linus Torvalds để phục vụ hàng ngàn developer của Linux kernel.

### Câu 4: Git lưu dữ liệu như thế nào — snapshot hay diff?

**Trả lời mẫu:**

> Git lưu dữ liệu dạng snapshot. Mỗi commit là một ảnh chụp toàn bộ trạng thái của project tại thời điểm đó. Nếu file không thay đổi, Git không copy lại mà tạo một link đến phiên bản trước. Điều này khác với SVN lưu theo dạng delta (chỉ lưu phần thay đổi). Cách lưu snapshot giúp Git nhanh hơn khi chuyển branch và xem lịch sử.

### Câu 5: Kể tên các VCS khác ngoài Git và so sánh.

**Trả lời mẫu:**

> - **SVN (Subversion):** Centralized, phổ biến trước Git, vẫn dùng ở một số công ty lớn.
> - **Mercurial:** Distributed như Git, cú pháp dễ hơn nhưng ít phổ biến hơn.
> - **Perforce:** Centralized, mạnh về file lớn (game development, media).
> - **CVS:** Thế hệ đầu của centralized VCS, hiện đã lỗi thời.
> Git thống trị nhờ tốc độ, branching mạnh, cộng đồng lớn, và sự tích hợp với GitHub/GitLab.

---

## Tổng kết

| Khái niệm | Ghi nhớ |
|-----------|---------|
| VCS | Hệ thống theo dõi thay đổi theo thời gian |
| Git | Distributed VCS, nhanh, mạnh, miễn phí |
| GitHub | Dịch vụ web lưu trữ Git repo (không phải Git) |
| Centralized | 1 server, client chỉ có bản mới nhất |
| Distributed | Mỗi máy có full repo + lịch sử |
| Snapshot | Git lưu ảnh chụp, không phải diff |

**Bước tiếp theo:** Cài đặt Git trên máy và cấu hình cơ bản.
