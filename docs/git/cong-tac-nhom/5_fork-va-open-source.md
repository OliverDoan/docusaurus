---
sidebar_position: 5
title: "5. Fork và đóng góp Open Source"
---

# Fork và đóng góp Open Source

Đóng góp vào dự án open source là một trong những cách **tốt nhất** để nâng cao kỹ năng lập trình, xây dựng portfolio, và kết nối với cộng đồng developer toàn cầu. Bài này sẽ giúp bạn hiểu Fork là gì, quy trình đóng góp open source từ A đến Z, cách sync fork với repo gốc, và những quy tắc ứng xử quan trọng khi tham gia cộng đồng.

---


---

## Mục lục

- [1. Fork là gì?](#1-fork-là-gì)
- [2. Fork vs Clone — Khác nhau cơ bản](#2-fork-vs-clone-khác-nhau-cơ-bản)
- [3. Workflow đóng góp Open Source — Từng bước chi tiết](#3-workflow-đóng-góp-open-source-từng-bước-chi-tiết)
- [4. Sync Fork với Upstream](#4-sync-fork-với-upstream)
- [5. CONTRIBUTING.md — Đọc trước khi đóng góp](#5-contributingmd-đọc-trước-khi-đóng-góp)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Code of Conduct](#code-of-conduct)
- [6. Code of Conduct — Quy tắc ứng xử](#6-code-of-conduct-quy-tắc-ứng-xử)
- [7. Good First Issues — Bắt đầu từ đâu?](#7-good-first-issues-bắt-đầu-từ-đâu)
- [8. Etiquette — Quy tắc ứng xử khi đóng góp](#8-etiquette-quy-tắc-ứng-xử-khi-đóng-góp)
- [9. Lợi ích đóng góp Open Source](#9-lợi-ích-đóng-góp-open-source)
- [10. Lỗi thường gặp](#10-lỗi-thường-gặp)
- [11. Ví dụ thực hành đầy đủ](#11-ví-dụ-thực-hành-đầy-đủ)
- [12. Câu hỏi phỏng vấn](#12-câu-hỏi-phỏng-vấn)

---

## 1. Fork là gì?

**Fork** là tạo một **bản sao hoàn chỉnh** của repository dưới **tài khoản GitHub của bạn**. Bản sao này hoàn toàn độc lập — bạn có toàn quyền push code, tạo branch, xóa branch mà không ảnh hưởng đến repo gốc.

```
+------------------------------------------+
|       Repo gốc (Original)               |
|       github.com/facebook/react          |
|                                          |
|  Bạn KHÔNG có quyền push ở đây          |
+-------------------+----------------------+
                    |
                    | Fork (click nút Fork trên GitHub)
                    |
+-------------------v----------------------+
|       Fork của bạn                       |
|       github.com/your-name/react         |
|                                          |
|  Bạn CÓ TOÀN QUYỀN ở đây              |
+------------------------------------------+
```

**Tại sao cần fork?**

Bạn không thể push code trực tiếp vào repo của người khác (trừ khi được thêm làm collaborator). Fork cho phép bạn:
1. Có bản sao để thoải mái thử nghiệm
2. Code tính năng mới hoặc fix bug
3. Tạo Pull Request từ fork về repo gốc
4. Duy trì phiên bản riêng (custom fork)

---

## 2. Fork vs Clone — Khác nhau cơ bản

Đây là câu hỏi nhiều người mới nhầm lẫn:

| Tiêu chí | Fork | Clone |
|-----------|------|-------|
| **Hành động** | Sao chép repo trên GitHub (server → server) | Tải repo về máy local (server → local) |
| **Ở đâu** | Trên GitHub (tạo repo mới dưới account bạn) | Trên máy tính local |
| **Quyền push** | Có (vào fork của bạn) | Phụ thuộc quyền trên remote |
| **Liên kết với gốc** | GitHub ghi nhận fork relationship | Chỉ là remote URL |
| **Dùng khi** | Đóng góp open source (không có quyền push) | Làm việc hàng ngày (có quyền push) |
| **Tạo bằng** | Nút "Fork" trên GitHub | `git clone <url>` |
| **Số lượng** | Mỗi người 1 fork per repo | Clone bao nhiêu lần cũng được |
| **Nhìn thấy trên GitHub** | Có (repo mới trong account) | Không (chỉ có trên local) |

### Khi nào dùng cái nào?

```
Bạn là collaborator (có quyền push):
  → Clone trực tiếp, tạo branch, push, tạo PR
  → KHÔNG cần fork

Bạn KHÔNG phải collaborator (open source, repo người khác):
  → Fork trước → Clone fork về local → Code → Push lên fork → Tạo PR về repo gốc
```

---

## 3. Workflow đóng góp Open Source — Từng bước chi tiết

Đây là quy trình chuẩn mà **mọi contributor** trên thế giới đều dùng:

### Sơ đồ tổng quan

```
+-------------------+     +-------------------+     +-------------------+
|   Repo gốc        |     |   Fork (GitHub)   |     |   Local (máy bạn) |
|   (upstream)      |     |   (origin)        |     |                   |
+-------------------+     +-------------------+     +-------------------+
        |                         |                         |
        |   1. Fork               |                         |
        |------------------------>|                         |
        |                         |   2. Clone              |
        |                         |------------------------>|
        |                         |                         |
        |                         |   3. Add upstream       |
        |<--------------------------------------------------|
        |                         |                         |
        |                         |   4. Create branch      |
        |                         |                         |
        |                         |   5. Code + Commit      |
        |                         |                         |
        |                         |   6. Push to fork       |
        |                         |<------------------------|
        |                         |                         |
        |   7. Create PR          |                         |
        |<------------------------|                         |
        |                         |                         |
```

### Bước 1: Fork repo gốc

1. Vào repo gốc trên GitHub (ví dụ: `https://github.com/facebook/react`)
2. Click nút **"Fork"** ở góc trên phải
3. Chọn account của bạn
4. Đợi vài giây — fork xuất hiện tại `https://github.com/your-name/react`

### Bước 2: Clone fork về local

```bash
# Clone FORK (không phải repo gốc!)
git clone https://github.com/your-name/react.git
cd react

# Kiểm tra remote — chỉ có origin trỏ đến fork
git remote -v
# origin  https://github.com/your-name/react.git (fetch)
# origin  https://github.com/your-name/react.git (push)
```

### Bước 3: Thêm upstream remote

```bash
# Thêm remote "upstream" trỏ đến repo gốc
git remote add upstream https://github.com/facebook/react.git

# Kiểm tra — bây giờ có 2 remote
git remote -v
# origin    https://github.com/your-name/react.git (fetch)
# origin    https://github.com/your-name/react.git (push)
# upstream  https://github.com/facebook/react.git (fetch)
# upstream  https://github.com/facebook/react.git (push)
```

**Tại sao cần upstream?**
- Repo gốc tiếp tục phát triển (người khác merge code mới)
- Bạn cần cập nhật fork để không bị lỗi thời
- `upstream` cho phép bạn fetch code mới nhất từ repo gốc

### Bước 4: Tạo feature branch

```bash
# QUAN TRỌNG: Luôn tạo branch mới từ main/develop
# KHÔNG bao giờ code trực tiếp trên main

# Cập nhật main từ upstream trước
git checkout main
git fetch upstream
git merge upstream/main

# Tạo nhánh feature
git checkout -b fix/typo-in-readme

# Hoặc cho feature mới
git checkout -b feat/add-dark-mode
```

**Quy tắc đặt tên branch:**
- `fix/mô-tả-ngắn` — sửa bug
- `feat/mô-tả-ngắn` — tính năng mới
- `docs/mô-tả-ngắn` — cập nhật tài liệu
- `refactor/mô-tả-ngắn` — refactor code

### Bước 5: Code và commit

```bash
# Code... sửa file...

# Kiểm tra thay đổi
git status
git diff

# Stage và commit
git add README.md
git commit -m "docs: fix typo in installation guide"

# Có thể có nhiều commit
git add src/utils.js
git commit -m "fix: handle null input in parseDate"
```

**Lưu ý khi commit:**
- Mỗi commit nên có 1 mục đích rõ ràng
- Commit message theo conventional commits format
- Đọc CONTRIBUTING.md xem dự án có yêu cầu gì đặc biệt không

### Bước 6: Push lên fork

```bash
# Push nhánh feature lên fork (origin), KHÔNG phải upstream
git push -u origin fix/typo-in-readme
```

### Bước 7: Tạo Pull Request về repo gốc

1. Vào GitHub, bạn sẽ thấy banner: **"Compare & pull request"**
2. Hoặc vào repo gốc > tab **Pull requests** > **New pull request**
3. Chọn:
   - **base repository:** `facebook/react` (repo gốc)
   - **base branch:** `main`
   - **head repository:** `your-name/react` (fork của bạn)
   - **compare branch:** `fix/typo-in-readme` (nhánh của bạn)
4. Viết title và description
5. Click **"Create pull request"**

---

## 4. Sync Fork với Upstream

Repo gốc tiếp tục phát triển — bạn cần cập nhật fork thường xuyên:

### Cách 1: Command line (khuyên dùng)

```bash
# Bước 1: Fetch code mới nhất từ repo gốc
git fetch upstream
# remote: Enumerating objects: 50, done.
# remote: Counting objects: 100% (50/50), done.
# From https://github.com/facebook/react
#    abc1234..def5678  main -> upstream/main

# Bước 2: Checkout nhánh main local
git checkout main

# Bước 3: Merge upstream/main vào local main
git merge upstream/main
# Updating abc1234..def5678
# Fast-forward
#  src/new-file.js | 50 +++++++++
#  2 files changed, 55 insertions(+)

# Bước 4: Push cập nhật lên fork (origin)
git push origin main
```

### Cách 2: Trên GitHub (nhanh hơn)

GitHub cung cấp nút **"Sync fork"** trên trang fork:

```
Trang fork: github.com/your-name/react

Nếu fork bị lỗi thời, bạn sẽ thấy:
"This branch is 15 commits behind facebook:main."

Click "Sync fork" → "Update branch"
Done! Fork đã cập nhật.
```

### Cập nhật branch feature đang code

```bash
# Nếu main đã được cập nhật, rebase feature branch
git checkout fix/typo-in-readme
git rebase main

# Nếu có conflict, giải quyết rồi tiếp tục
git add <file-conflict>
git rebase --continue

# Force push vì đã rebase (hash thay đổi)
git push --force-with-lease origin fix/typo-in-readme
```

### Sơ đồ sync workflow

```
Thời gian ----->

Upstream (repo gốc):
  A---B---C---D---E---F---G---H

Fork (origin):
  A---B---C                       <-- lỗi thời!

  Sau sync:
  A---B---C---D---E---F---G---H   <-- cập nhật!

Local:
  A---B---C (main)
           \
            X---Y (feature)       <-- feature branch

  Sau fetch + merge + rebase:
  A---B---C---D---E---F---G---H (main)
                                \
                                 X'---Y' (feature)
```

---

## 5. CONTRIBUTING.md — Đọc trước khi đóng góp

Hầu hết dự án open source đều có file **CONTRIBUTING.md** hướng dẫn cách đóng góp. **ĐỌC FILE NÀY TRƯỚC KHI LÀM BẤT CỨ ĐIỀU GÌ.**

### Nội dung thường gặp trong CONTRIBUTING.md

```markdown
# Contributing to Project XYZ

## Getting Started
- Fork the repository
- Clone your fork
- Install dependencies: npm install
- Run tests: npm test

## Development Workflow
1. Create a branch from `main`
2. Make changes
3. Run tests locally
4. Commit with conventional format
5. Push and create PR

## Coding Standards
- Use ESLint + Prettier
- TypeScript strict mode
- 80% test coverage minimum
- No console.log in production code

## Commit Convention
- feat: New feature
- fix: Bug fix
- docs: Documentation only
- style: Code style (formatting, semicolons)
- refactor: Code change that neither fixes a bug nor adds a feature
- test: Adding or updating tests

## Pull Request Process
1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Get at least 1 approval from maintainer
5. Squash commits before merge

## Code of Conduct
Please read our CODE_OF_CONDUCT.md
```

**Tại sao quan trọng:**
- Mỗi dự án có quy tắc riêng
- Không đọc = PR bị reject = lãng phí thời gian
- Maintainers đánh giá cao contributor đọc kỹ guidelines

---

## 6. Code of Conduct — Quy tắc ứng xử

**Code of Conduct** là bộ quy tắc ứng xử trong cộng đồng open source. Hầu hết dự án lớn đều có file `CODE_OF_CONDUCT.md`.

### Nguyên tắc chung

| Nên | Không nên |
|-----|-----------|
| Tôn trọng mọi người | Xúc phạm, quấy rối |
| Ngôn ngữ lịch sự, chuyên nghiệp | Ngôn ngữ thô tục, mỉa mai |
| Chấp nhận feedback xây dựng | Phản ứng defensive |
| Focus vào vấn đề, không phải con người | Tấn công cá nhân |
| Kiên nhẫn với người mới | Coi thường người mới |

### Contributor Covenant

Đa số dự án open source dùng [Contributor Covenant](https://www.contributor-covenant.org/), một bộ code of conduct chuẩn. Nội dung chính:

- **Tôn trọng** sự đa dạng (quốc tịch, giới tính, kinh nghiệm...)
- **Xây dựng** môi trường an toàn, thân thiện
- **Không chấp nhận** quấy rối, phân biệt đối xử
- **Báo cáo** vi phạm cho maintainers

---

## 7. Good First Issues — Bắt đầu từ đâu?

Nếu bạn mới bắt đầu đóng góp open source, đừng ngay lập tức cố sửa bug phức tạp. Hãy tìm **"good first issues"** — những issues được đánh dấu phù hợp cho người mới.

### Cách tìm Good First Issues

```
1. Trên GitHub:
   - Vào repo → tab Issues
   - Lọc theo label: "good first issue" hoặc "help wanted"
   - URL: github.com/<owner>/<repo>/issues?q=label:"good first issue"

2. Trang web chuyên biệt:
   - goodfirstissue.dev — tổng hợp good first issues
   - firsttimersonly.com — hướng dẫn cho người mới
   - up-for-grabs.net — danh sách dự án cần giúp
   - github.com/explore — khám phá dự án trending

3. GitHub Search:
   - Tìm: "good first issue" language:javascript
   - Tìm: "help wanted" language:python stars:>100
```

### Các loại đóng góp dễ bắt đầu

| Loại | Mô tả | Khó? |
|------|--------|------|
| **Fix typo** | Sửa lỗi chính tả trong docs | Dễ nhất |
| **Update docs** | Cải thiện hướng dẫn sử dụng | Dễ |
| **Add tests** | Viết thêm test cases | Vừa |
| **Fix small bug** | Sửa bug đã được mô tả rõ | Vừa |
| **Translation** | Dịch docs sang ngôn ngữ khác | Dễ-Vừa |
| **Code cleanup** | Refactor, remove deprecated code | Vừa |
| **New feature** | Thêm tính năng mới | Khó |

### Quy trình chọn issue

```bash
# 1. Tìm issue phù hợp
# 2. ĐỌC KỸ issue description
# 3. Đọc comments xem ai đang làm chưa
# 4. Comment: "Hi, I'd like to work on this issue. Can I be assigned?"
# 5. Đợi maintainer assign hoặc đồng ý
# 6. BẮT ĐẦU CODE (sau khi được assign)

# KHÔNG: Clone repo, code xong rồi mới hỏi
# KHÔNG: Claim issue rồi bỏ không làm
```

---

## 8. Etiquette — Quy tắc ứng xử khi đóng góp

### Tôn trọng Maintainers

Maintainers thường là **tình nguyện viên**, làm open source trong thời gian rảnh. Hãy:

```
ĐÚNG:
  "Thank you for reviewing my PR!"
  "I understand this needs more work. I'll update it this weekend."
  "Could you point me in the right direction?"

SAI:
  "Why haven't you reviewed my PR yet?!"
  "This is urgent, merge it now!"
  "Your project has a bug, fix it immediately!"
```

### Follow Guidelines

```
Trước khi tạo PR, kiểm tra:

☐ Đã đọc CONTRIBUTING.md?
☐ Đã đọc CODE_OF_CONDUCT.md?
☐ Issue đã được tạo/assign?
☐ Branch đúng naming convention?
☐ Tests đã pass?
☐ Code style đúng (lint pass)?
☐ Commit messages đúng format?
☐ PR description đầy đủ?
☐ Không có thay đổi không liên quan?
```

### Giao tiếp hiệu quả

```markdown
# Comment mẫu khi muốn nhận issue:
"Hi @maintainer, I'd like to work on this issue.
I've read the contributing guide and I think the approach would be:
1. Update the validation logic in `src/utils.js`
2. Add test cases for edge cases
3. Update the docs

Is this the right approach? Happy to discuss before starting."

# Comment mẫu khi submit PR:
"This PR fixes #123 by adding input validation to the search form.

Changes:
- Added email format validation
- Added error messages for invalid inputs
- Added 5 test cases

I tested this locally and all tests pass. Screenshots attached.
Let me know if any changes are needed. Thank you for your time!"
```

### Xử lý feedback

```
Maintainer nói: "This looks good but could you add tests?"

ĐÚNG: "Sure! I'll add tests and push an update by tomorrow."
       (Sau đó thực sự làm đúng hẹn)

SAI:   "I don't think tests are necessary for this small change."
       (Đừng tranh cãi — maintainer biết dự án hơn bạn)
```

---

## 9. Lợi ích đóng góp Open Source

### Cho sự nghiệp

| Lợi ích | Giải thích |
|---------|------------|
| **Portfolio** | GitHub profile là CV sống — nhà tuyển dụng xem contributions |
| **Kinh nghiệm thực tế** | Làm việc với codebase lớn, code review, CI/CD |
| **Networking** | Kết nối với developer giỏi trên toàn cầu |
| **References** | Maintainers có thể viết recommendation |
| **Job opportunities** | Nhiều công ty tuyển dụng từ open source contributors |

### Cho kỹ năng

```
1. ĐỌC CODE NGƯỜI KHÁC
   - Học patterns mới
   - Hiểu cách dự án lớn được tổ chức
   - Thấy các best practices trong thực tế

2. VIẾT CODE CHẤT LƯỢNG
   - Code phải pass review từ developer giỏi
   - Phải viết tests
   - Phải follow coding standards

3. GIAO TIẾP BẰNG TIẾNG ANH
   - Issues, PRs, discussions đều bằng tiếng Anh
   - Cải thiện kỹ năng viết kỹ thuật

4. GIT WORKFLOW CHUYÊN NGHIỆP
   - Fork, branch, rebase, squash
   - Conflict resolution
   - CI/CD integration

5. TEAMWORK
   - Làm việc với người từ nhiều quốc gia
   - Múi giờ khác nhau
   - Async communication
```

### Cho cộng đồng

- Phần mềm mà hàng triệu người dùng trở nên tốt hơn
- Người mới có thêm tài liệu, tutorials
- Bugs được sửa nhanh hơn
- Tính năng mới được phát triển nhanh hơn

---

## 10. Lỗi thường gặp

### Lỗi 1: Code trực tiếp trên main của fork

```bash
# SAI: Code trên main
git checkout main
# code... commit... push...
# Tạo PR từ main

# Vấn đề: main của fork sẽ bị diverge khỏi upstream
# Khó sync, khó tạo PR sạch

# ĐÚNG: Luôn tạo feature branch
git checkout main
git fetch upstream
git merge upstream/main
git checkout -b fix/my-fix
# code... commit... push...
# Tạo PR từ fix/my-fix
```

### Lỗi 2: Quên sync fork trước khi code

```bash
# SAI: Fork đã lỗi thời 100 commit
# Code dựa trên code cũ → conflict khi tạo PR

# ĐÚNG: Luôn sync trước khi bắt đầu
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
git checkout -b feat/new-feature  # Branch từ main đã cập nhật
```

### Lỗi 3: Push lên upstream thay vì origin

```bash
# SAI: Push lên repo gốc (sẽ bị rejected vì không có quyền)
git push upstream fix/my-fix
# remote: Permission denied

# ĐÚNG: Push lên fork (origin)
git push origin fix/my-fix
```

### Lỗi 4: Claim issue rồi bỏ không làm

```
Vấn đề: Comment "I'll work on this" rồi biến mất 2 tuần
Hậu quả: Không ai khác dám nhận issue, dự án bị chậm

Cách đúng:
- Chỉ claim khi có thời gian thực sự
- Nếu bận, comment: "Sorry, I won't be able to finish this.
  Feel free to assign to someone else."
- Cập nhật tiến độ hàng tuần
```

### Lỗi 5: PR chứa thay đổi không liên quan

```bash
# SAI: PR sửa 1 bug nhưng kèm theo refactor 10 files khác
# Maintainer không biết đâu là fix bug, đâu là refactor

# ĐÚNG: 1 PR = 1 mục đích
# PR 1: fix bug
# PR 2: refactor (tách riêng)
```

### Lỗi 6: Không đọc CONTRIBUTING.md

```
Vấn đề: Dùng sai commit format, sai coding style, thiếu tests
Hậu quả: PR bị reject, phải sửa nhiều lần

Cách phòng: ĐỌC CONTRIBUTING.md trước khi code dòng đầu tiên
```

---

## 11. Ví dụ thực hành đầy đủ

Giả sử bạn muốn đóng góp vào dự án `awesome-project`:

```bash
# === BƯỚC 1: Fork trên GitHub ===
# Vào github.com/owner/awesome-project → Click "Fork"

# === BƯỚC 2: Clone fork ===
git clone https://github.com/your-name/awesome-project.git
cd awesome-project

# === BƯỚC 3: Thêm upstream ===
git remote add upstream https://github.com/owner/awesome-project.git
git remote -v
# origin    https://github.com/your-name/awesome-project.git (fetch)
# origin    https://github.com/your-name/awesome-project.git (push)
# upstream  https://github.com/owner/awesome-project.git (fetch)
# upstream  https://github.com/owner/awesome-project.git (push)

# === BƯỚC 4: Sync với upstream ===
git fetch upstream
git checkout main
git merge upstream/main

# === BƯỚC 5: Tạo feature branch ===
git checkout -b docs/fix-installation-guide

# === BƯỚC 6: Code ===
# Sửa file README.md...

# === BƯỚC 7: Commit ===
git add README.md
git commit -m "docs: fix incorrect npm command in installation guide"

# === BƯỚC 8: Push lên fork ===
git push -u origin docs/fix-installation-guide

# === BƯỚC 9: Tạo PR trên GitHub ===
# Vào GitHub → "Compare & pull request"
# Base: owner/awesome-project main
# Compare: your-name/awesome-project docs/fix-installation-guide
# Viết description → Create PR

# === BƯỚC 10: Đợi review và phản hồi ===
# Maintainer review → Có thể yêu cầu thay đổi
# Sửa → Commit → Push (PR tự cập nhật)
# Approve → Merge!

# === BƯỚC 11: Dọn dẹp sau khi merge ===
git checkout main
git fetch upstream
git merge upstream/main
git push origin main
git branch -d docs/fix-installation-guide
git push origin --delete docs/fix-installation-guide
```

---

## 12. Câu hỏi phỏng vấn

### Câu 1: Fork và Clone khác nhau thế nào?

**Trả lời:** Fork tạo bản sao repository trên GitHub server (server-to-server), xuất hiện dưới account của bạn, bạn có toàn quyền push. Clone tải repository về máy local (server-to-local). Fork dùng khi muốn đóng góp vào dự án mà bạn không có quyền push (open source). Clone dùng khi bạn đã có quyền push (collaborator) hoặc sau khi fork để tải fork về local.

### Câu 2: Mô tả quy trình đóng góp vào một dự án open source.

**Trả lời:** (1) Fork repo gốc trên GitHub, (2) Clone fork về local, (3) Thêm remote `upstream` trỏ đến repo gốc, (4) Fetch và merge `upstream/main` để cập nhật, (5) Tạo feature branch từ main, (6) Code, commit với conventional commits format, (7) Push nhánh lên fork (origin), (8) Tạo Pull Request từ fork về repo gốc, (9) Đợi review, phản hồi feedback, (10) Sau khi merge, sync fork và dọn dẹp branch. Trước tất cả, phải đọc CONTRIBUTING.md và CODE_OF_CONDUCT.md.

### Câu 3: Làm thế nào để sync fork với repo gốc (upstream)?

**Trả lời:** Có 2 cách: (1) Command line: `git fetch upstream` rồi `git checkout main` rồi `git merge upstream/main` rồi `git push origin main`. (2) Trên GitHub: click nút "Sync fork" > "Update branch" trên trang fork. Cần sync thường xuyên để tránh fork bị lỗi thời quá nhiều, gây conflict lớn khi tạo PR.

### Câu 4: Tại sao nên tạo feature branch thay vì code trực tiếp trên main khi đóng góp?

**Trả lời:** Code trên main của fork gây nhiều vấn đề: (1) Main bị diverge khỏi upstream, khó sync, (2) Không thể làm nhiều PR cùng lúc (mỗi PR cần branch riêng), (3) PR bị lẫn lộn code từ nhiều thay đổi, (4) Khó rollback nếu PR bị reject. Feature branch giúp: mỗi PR độc lập, main luôn sạch và đồng bộ với upstream, dễ quản lý nhiều contributions cùng lúc.

### Câu 5: "Good first issue" là gì? Tại sao nên bắt đầu với nó?

**Trả lời:** "Good first issue" là label trên GitHub đánh dấu những issues phù hợp cho người mới bắt đầu đóng góp. Thường là bug nhỏ, fix typo, thêm tests, hoặc cải thiện docs. Nên bắt đầu với nó vì: (1) Độ phức tạp vừa phải, (2) Thường có hướng dẫn chi tiết từ maintainer, (3) Giúp làm quen với codebase và workflow, (4) Xây dựng confidence trước khi tackle issues lớn hơn, (5) Maintainers thường hỗ trợ nhiều hơn cho good first issues.

### Câu 6: Đóng góp open source mang lại lợi ích gì cho sự nghiệp?

**Trả lời:** Lợi ích bao gồm: (1) Portfolio mạnh — GitHub contributions là CV sống, nhà tuyển dụng xem được, (2) Kinh nghiệm thực tế — làm việc với codebase lớn, CI/CD, code review, (3) Networking — kết nối với developer giỏi toàn cầu, (4) Cải thiện kỹ năng — đọc code người khác, viết code pass review từ experts, (5) Kỹ năng tiếng Anh — giao tiếp kỹ thuật bằng tiếng Anh, (6) Job opportunities — nhiều công ty tuyển trực tiếp từ open source contributors.
