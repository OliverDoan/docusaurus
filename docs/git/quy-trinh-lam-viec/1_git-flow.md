---
sidebar_position: 1
title: "1. Git Flow — Mô hình phân nhánh kinh điển"
---

# Git Flow — Mô hình phân nhánh kinh điển

Khi làm việc trong một team lớn, bạn sẽ gặp câu hỏi: "Ai làm nhánh nào? Merge vào đâu? Release lúc nào?" Git Flow ra đời để trả lời tất cả những câu hỏi đó. Đây là **mô hình phân nhánh (branching model)** nổi tiếng nhất trong lịch sử Git, được hàng nghìn team trên thế giới áp dụng. Bài này sẽ giúp bạn hiểu chi tiết Git Flow là gì, cách hoạt động, và khi nào nên (hoặc không nên) dùng nó.

---

## Mục lục

- [1. Git Flow là gì?](#1-git-flow-là-gì)
- [2. Các nhánh chính (Main Branches)](#2-các-nhánh-chính-main-branches)
- [3. Các nhánh hỗ trợ (Supporting Branches)](#3-các-nhánh-hỗ-trợ-supporting-branches)
- [4. Git Flow CLI Tool](#4-git-flow-cli-tool)
- [5. Ưu điểm và Nhược điểm](#5-ưu-điểm-và-nhược-điểm)
- [6. Khi nào nên dùng Git Flow?](#6-khi-nào-nên-dùng-git-flow)
- [7. Tổng quan quy trình đầy đủ](#7-tổng-quan-quy-trình-đầy-đủ)
- [8. Lỗi thường gặp](#8-lỗi-thường-gặp)
- [9. Câu hỏi phỏng vấn](#9-câu-hỏi-phỏng-vấn)
- [10. Tóm tắt](#10-tóm-tắt)

---

## 1. Git Flow là gì?

Git Flow là mô hình phân nhánh được **Vincent Driessen** giới thiệu năm 2010 trong bài blog kinh điển "A successful Git branching model". Mô hình này định nghĩa rõ ràng:

- **Nhánh nào** dùng cho **mục đích nào**
- **Merge từ đâu** vào **đâu**
- **Quy trình** từ lúc bắt đầu code đến lúc release

```
+------------------------------------------------------------------+
|                     GIT FLOW OVERVIEW                            |
+------------------------------------------------------------------+
|                                                                  |
|  main      ---*-----------*-----------*--------> (production)    |
|                \         / \         /                            |
|  hotfix         \--*--*-/   \       /                            |
|                              \     /                             |
|  release                      *---*                              |
|                              /     \                             |
|  develop   ---*---*---*---*-*-------*---*---*---> (integration)  |
|                \     / \     /                                   |
|  feature        *---*   *---*                                    |
|                                                                  |
+------------------------------------------------------------------+
```

**Ý tưởng cốt lõi:** Tách biệt hoàn toàn giữa code đang phát triển (develop), code đã sẵn sàng (release), và code đang chạy trên production (main).

---

## 2. Các nhánh chính (Main Branches)

Git Flow có **2 nhánh song song vĩnh viễn** — chúng tồn tại suốt vòng đời dự án:

### 2.1. Nhánh `main` (hoặc `master`)

```bash
# Nhánh main luôn phản ánh trạng thái PRODUCTION
# Mỗi commit trên main = 1 phiên bản đã release
git log --oneline main
# a1b2c3d (tag: v2.1.0) Release 2.1.0
# d4e5f6g (tag: v2.0.0) Release 2.0.0
# h7i8j9k (tag: v1.0.0) Release 1.0.0
```

| Đặc điểm                 | Mô tả                                           |
| ------------------------ | ----------------------------------------------- |
| Mục đích                 | Chứa code production, đã được test kỹ           |
| Ai được merge vào        | Chỉ `release/*` và `hotfix/*`                   |
| Ai được commit trực tiếp | **KHÔNG AI** — tuyệt đối không commit trực tiếp |
| Tag                      | Mỗi merge vào main đều được tag version         |

### 2.2. Nhánh `develop`

```bash
# Nhánh develop là "trung tâm tích hợp"
# Nơi tất cả feature branches merge vào
git checkout develop
git log --oneline
# f1a2b3c feat: add payment module
# c4d5e6f feat: add user profile page
# g7h8i9j fix: correct email validation
```

| Đặc điểm          | Mô tả                                      |
| ----------------- | ------------------------------------------ |
| Mục đích          | Tích hợp tất cả feature mới                |
| Ai được merge vào | `feature/*` branches                       |
| Trạng thái        | Luôn có code mới nhất, có thể chưa ổn định |
| Tạo từ            | Được tạo từ `main` khi khởi tạo dự án      |

---

## 3. Các nhánh hỗ trợ (Supporting Branches)

Ngoài 2 nhánh chính, Git Flow có **3 loại nhánh tạm thời** — được tạo ra rồi xóa đi sau khi hoàn thành:

### 3.1. Feature Branches (`feature/*`)

Mỗi tính năng mới = 1 feature branch.

```
Workflow:
  develop ----*--------*--------*----> develop (updated)
               \      /
  feature/      *----*
  login         |    |
              start finish
```

```bash
# Bước 1: Tạo feature branch từ develop
git checkout develop
git pull origin develop
git checkout -b feature/login

# Bước 2: Code bình thường, commit nhiều lần
git add .
git commit -m "feat: add login form UI"

git add .
git commit -m "feat: add login API integration"

git add .
git commit -m "test: add login unit tests"

# Bước 3: Merge lại vào develop khi hoàn thành
git checkout develop
git pull origin develop
git merge --no-ff feature/login
# --no-ff: tạo merge commit, giữ lại lịch sử nhánh

# Bước 4: Xóa feature branch
git branch -d feature/login
git push origin --delete feature/login
```

**Tại sao dùng `--no-ff`?** Vì nó tạo một merge commit riêng, giúp bạn thấy rõ ràng "feature này được merge vào lúc nào" trong git log. Nếu dùng fast-forward, các commit sẽ nằm trên 1 đường thẳng và bạn không phân biệt được feature nào với feature nào.

```
# Với --no-ff (Git Flow khuyên dùng)
*   Merge feature/login into develop   <-- thấy rõ ràng
|\
| * feat: add login tests
| * feat: add login API
| * feat: add login form
|/
*   Previous develop commit

# Không có --no-ff (fast-forward) — khó theo dõi
* feat: add login tests
* feat: add login API
* feat: add login form
* Previous develop commit
```

### 3.2. Release Branches (`release/*`)

Khi develop đã có đủ feature cho phiên bản mới, tạo release branch để "đóng băng" và chuẩn bị release.

```
Workflow:
  main    --------*------------------*------> (tag v1.0)
                                    /
  release/                   *---*-*
  1.0                       /     \
  develop ---*---*---*---*-*-------*---*---> (continue developing)
```

```bash
# Bước 1: Tạo release branch từ develop
git checkout develop
git checkout -b release/1.0.0

# Bước 2: Chỉ fix bug, cập nhật version, documentation
# KHÔNG thêm feature mới trên release branch!
git commit -m "chore: bump version to 1.0.0"
git commit -m "fix: correct typo in error message"
git commit -m "docs: update changelog for v1.0.0"

# Bước 3: Merge vào MAIN và tag
git checkout main
git merge --no-ff release/1.0.0
git tag -a v1.0.0 -m "Release version 1.0.0"

# Bước 4: Merge ngược lại vào DEVELOP (để giữ các bug fix)
git checkout develop
git merge --no-ff release/1.0.0

# Bước 5: Xóa release branch
git branch -d release/1.0.0
```

**Lưu ý quan trọng:** Trong khi release branch đang tồn tại, team vẫn có thể tiếp tục code feature mới trên develop. Đây là ưu điểm lớn của Git Flow — phát triển song song!

### 3.3. Hotfix Branches (`hotfix/*`)

Bug khẩn cấp trên production! Không thể đợi đến release tiếp theo.

```
Workflow:
  main    ---*-----------*----> (tag v1.0.1)
              \         /
  hotfix/      *---*---*
  fix-crash   (sửa bug khẩn cấp)
              \         \
  develop      *---------*----> (nhận được hotfix)
```

```bash
# Bước 1: Tạo hotfix branch từ MAIN (không phải develop!)
git checkout main
git checkout -b hotfix/fix-payment-crash

# Bước 2: Sửa bug khẩn cấp
git commit -m "fix: resolve payment gateway crash on null response"

# Bước 3: Merge vào MAIN và tag
git checkout main
git merge --no-ff hotfix/fix-payment-crash
git tag -a v1.0.1 -m "Hotfix: payment crash resolved"

# Bước 4: Merge vào DEVELOP (để develop cũng có bản sửa)
git checkout develop
git merge --no-ff hotfix/fix-payment-crash

# Bước 5: Xóa hotfix branch
git branch -d hotfix/fix-payment-crash
```

**Chú ý:** Nếu đang có release branch tồn tại, hotfix nên merge vào release branch thay vì develop (vì release branch sẽ merge vào develop sau).

---

## 4. Git Flow CLI Tool

Thay vì nhớ tất cả các bước trên, bạn có thể dùng tool `git-flow` để tự động hóa:

```bash
# Cài đặt (macOS)
brew install git-flow-avh

# Cài đặt (Ubuntu/Debian)
apt-get install git-flow

# Cài đặt (Windows) — có sẵn trong Git for Windows
```

### 4.1. Khởi tạo Git Flow

```bash
git flow init

# Tool sẽ hỏi bạn đặt tên cho các nhánh:
# Branch name for production releases: [main]
# Branch name for "next release" development: [develop]
# Feature branches prefix: [feature/]
# Release branches prefix: [release/]
# Hotfix branches prefix: [hotfix/]
# Version tag prefix: [v]

# Kết quả: tự động tạo nhánh develop từ main
```

### 4.2. Feature workflow với git-flow CLI

```bash
# Bắt đầu feature mới (tự động tạo branch từ develop)
git flow feature start login
# Tương đương: git checkout -b feature/login develop

# Làm việc bình thường...
git add .
git commit -m "feat: implement login"

# Publish feature lên remote (để team khác thấy)
git flow feature publish login
# Tương đương: git push -u origin feature/login

# Kết thúc feature (tự động merge vào develop và xóa branch)
git flow feature finish login
# Tương đương:
#   git checkout develop
#   git merge --no-ff feature/login
#   git branch -d feature/login
```

### 4.3. Release và Hotfix với git-flow CLI

```bash
# === RELEASE ===
git flow release start 1.0.0
# ... fix bugs, update version ...
git flow release finish 1.0.0
# Tự động: merge vào main + develop, tag v1.0.0, xóa branch

# === HOTFIX ===
git flow hotfix start fix-crash
# ... fix bug khẩn cấp ...
git flow hotfix finish fix-crash
# Tự động: merge vào main + develop, tag, xóa branch
```

---

## 5. Ưu điểm và Nhược điểm

### Ưu điểm

| Ưu điểm                       | Giải thích                                               |
| ----------------------------- | -------------------------------------------------------- |
| **Rõ ràng, có cấu trúc**      | Mọi người biết chính xác code ở đâu, merge vào đâu       |
| **Parallel development**      | Team có thể làm nhiều feature cùng lúc                   |
| **Release có kiểm soát**      | Release branch cho phép test kỹ trước khi lên production |
| **Hotfix độc lập**            | Sửa bug khẩn cấp mà không ảnh hưởng development          |
| **Lịch sử sạch**              | `--no-ff` giữ lại lịch sử merge rõ ràng                  |
| **Phù hợp versioned release** | Lý tưởng cho phần mềm có version (v1.0, v2.0, v3.0)      |

### Nhược điểm

| Nhược điểm              | Giải thích                                                                |
| ----------------------- | ------------------------------------------------------------------------- |
| **Phức tạp**            | Nhiều loại nhánh, nhiều bước merge, dễ nhầm                               |
| **Overhead**            | Quá nặng nề cho dự án nhỏ hoặc 1-2 người                                  |
| **Merge conflicts**     | Càng nhiều nhánh song song -> càng nhiều conflict                         |
| **Không hợp CI/CD**     | Git Flow thiết kế cho scheduled release, không phải continuous deployment |
| **Long-lived branches** | Feature branch tồn tại lâu -> drift xa khỏi develop -> merge khó          |
| **Chậm**                | Quá trình release mất nhiều bước manual                                   |

---

## 6. Khi nào nên dùng Git Flow?

### Nên dùng khi:

```
+---------------------------------------------------+
|  Dùng Git Flow khi:                               |
|  [x] Team >= 5 người                              |
|  [x] Release theo lịch trình (2 tuần, 1 tháng)    |
|  [x] Sản phẩm có version rõ ràng (v1.0, v2.0)     |
|  [x] Cần hỗ trợ nhiều version cùng lúc            |
|  [x] Môi trường production riêng biệt             |
|  [x] Quy trình QA nghiêm ngặt                     |
+---------------------------------------------------+
```

**Ví dụ thực tế:**

- Ứng dụng mobile (iOS/Android) — phải submit review, release theo version
- Phần mềm enterprise (ERP, CRM) — khách hàng dùng version cũ, cần hotfix
- Library/SDK — phải duy trì nhiều version (v1.x, v2.x)

### Không nên dùng khi:

```
+---------------------------------------------------+
|  KHÔNG dùng Git Flow khi:                         |
|  [ ] Team 1-3 người                               |
|  [ ] Deploy liên tục (nhiều lần/ngày)             |
|  [ ] Web app deploy tự động (CI/CD hoàn chỉnh)    |
|  [ ] Dự án nhỏ, prototype, MVP                    |
|  [ ] Không cần hỗ trợ nhiều version               |
+---------------------------------------------------+
```

---

## 7. Tổng quan quy trình đầy đủ

```
                            Git Flow - Toàn cảnh
                            ====================

  Tag:   v1.0          v1.1      v1.1.1        v2.0
          |             |          |             |
  main:  -o-------------o----------o-------------o---------->
          |            / \          |            /
          |           /   \         |           /
  hotfix: |          /     ---------o----------/
          |         /               |
  release:|        o---o---o        |
          |       /         \       |
  develop:o--o---o---o---o---o---o--o---o---o---o---o------->
             |  / \     /           |  / \     /
  feature:   o-o   o---o            o-o   o---o
             login  profile        search  dashboard
```

**Bước theo bước:**

1. Dự án bắt đầu: tạo `main` và `develop`
2. Developer A: `feature/login` từ develop -> code -> merge lại develop
3. Developer B: `feature/profile` từ develop -> code -> merge lại develop
4. PM quyết định release: `release/1.0` từ develop
5. QA test trên release branch, fix bug trên release branch
6. Release xong: merge vào main (tag v1.0) + merge ngược develop
7. Bug khẩn cấp trên production: `hotfix/fix-crash` từ main
8. Hotfix xong: merge vào main (tag v1.0.1) + merge ngược develop
9. Lặp lại từ bước 2

---

## 8. Lỗi thường gặp

### Lỗi 1: Commit trực tiếp vào main hoặc develop

```bash
# SAI: commit trực tiếp vào develop
git checkout develop
git commit -m "feat: add new feature"  # KHÔNG được làm!

# ĐÚNG: luôn tạo branch riêng
git checkout -b feature/new-feature develop
git commit -m "feat: add new feature"
```

### Lỗi 2: Không merge hotfix vào develop

```bash
# Sau khi merge hotfix vào main, nhiều người QUÊN merge vào develop
# Hậu quả: develop không có bản sửa bug -> bug xuất hiện lại ở release sau

# LUÔN LUÔN merge hotfix vào cả main VÀ develop
git checkout main
git merge --no-ff hotfix/fix-crash
git checkout develop
git merge --no-ff hotfix/fix-crash  # ĐỪNG quên bước này!
```

### Lỗi 3: Thêm feature mới trên release branch

```bash
# Release branch chỉ để fix bug và chuẩn bị release
# KHÔNG thêm feature mới trên release branch!

# SAI
git checkout release/1.0
git commit -m "feat: add cool new button"  # KHÔNG!

# ĐÚNG — feature mới phải trên feature branch, merge vào develop
git checkout -b feature/cool-button develop
```

### Lỗi 4: Dùng fast-forward merge

```bash
# SAI: fast-forward làm mất lịch sử nhánh
git checkout develop
git merge feature/login  # Fast-forward nếu có thể

# ĐÚNG: luôn dùng --no-ff
git checkout develop
git merge --no-ff feature/login  # Tạo merge commit
```

### Lỗi 5: Feature branch sống quá lâu

```bash
# Feature branch tồn tại > 1-2 tuần -> drift xa khỏi develop
# Merge sẽ rất đau đầu với conflicts

# Giải pháp: thường xuyên merge develop vào feature branch
git checkout feature/long-feature
git merge develop  # Cập nhật code mới nhất từ develop
# Hoặc dùng rebase (nhưng cần hiểu rõ rebase trước khi dùng)
```

---

## 9. Câu hỏi phỏng vấn

### Câu 1: Git Flow là gì? Giải thích các nhánh chính.

**Trả lời:** Git Flow là mô hình branching được Vincent Driessen giới thiệu năm 2010. Nó định nghĩa 5 loại nhánh: 2 nhánh vĩnh viễn (main cho production, develop cho tích hợp) và 3 nhánh tạm thời (feature cho tính năng mới, release cho chuẩn bị phát hành, hotfix cho sửa lỗi khẩn cấp trên production). Mỗi loại nhánh có quy tắc rõ ràng về việc tạo từ đâu và merge vào đâu.

### Câu 2: Tại sao Git Flow dùng `--no-ff` khi merge?

**Trả lời:** Flag `--no-ff` (no fast-forward) buộc Git tạo một merge commit riêng biệt, ngay cả khi có thể fast-forward. Điều này giữ lại lịch sử của feature branch trong git log — bạn có thể thấy rõ ràng feature nào được merge vào lúc nào, bao gồm tất cả các commit của nó. Nếu dùng fast-forward, các commit sẽ "phẳng" trên 1 dòng và bạn không phân biệt được boundary giữa các feature.

### Câu 3: Khi nào tạo hotfix branch? Nó khác gì với feature branch?

**Trả lời:** Hotfix branch được tạo khi có bug khẩn cấp trên production cần sửa ngay lập tức, không thể đợi đến release tiếp theo. Khác biệt lớn nhất: hotfix tạo từ `main` (code production) và merge vào cả `main` lẫn `develop`. Feature branch tạo từ `develop` và chỉ merge vào `develop`. Hotfix cũng được tag version (patch increment, ví dụ v1.0.0 -> v1.0.1).

### Câu 4: Git Flow có nhược điểm gì? Khi nào không nên dùng?

**Trả lời:** Git Flow phức tạp với nhiều loại nhánh và bước merge, tạo overhead lớn cho team nhỏ. Nó không phù hợp với CI/CD continuous deployment vì được thiết kế cho scheduled release. Long-lived feature branches có thể drift xa khỏi develop gây merge conflict lớn. Nên cân nhắc GitHub Flow (đơn giản hơn) cho web app deploy liên tục, hoặc Trunk-Based Development cho team có CI/CD hoàn chỉnh.

### Câu 5: Trong Git Flow, nếu đang có release branch và phát hiện bug trên production thì xử lý thế nào?

**Trả lời:** Tạo hotfix branch từ main như bình thường. Sau khi fix xong, merge hotfix vào main (tag version mới) và merge vào **release branch** (thay vì develop). Lý do: release branch cuối cùng sẽ merge vào develop, nên bug fix sẽ được truyền xuống develop thông qua release branch. Nếu merge hotfix trực tiếp vào develop mà không qua release branch, có thể gây conflict khi release branch merge vào develop sau đó.

---

## 10. Tóm tắt

```
+----------------------------------------------------------+
|  Git Flow — Tóm tắt nhanh                                |
+----------------------------------------------------------+
|  main       = production (chỉ release và hotfix)         |
|  develop    = integration (nơi feature hợp nhất)         |
|  feature/*  = tính năng mới (từ develop, vào develop)    |
|  release/*  = chuẩn bị release (từ develop, vào main)    |
|  hotfix/*   = sửa khẩn cấp (từ main, vào main+develop)   |
+----------------------------------------------------------+
|  CLI tool: git flow init / feature / release / hotfix    |
|  Luôn dùng: --no-ff khi merge                            |
|  Phù hợp: team lớn, scheduled release, versioned product |
+----------------------------------------------------------+
```
