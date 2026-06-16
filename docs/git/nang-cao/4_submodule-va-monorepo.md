---
sidebar_position: 4
title: "4. Submodule và Monorepo"
---

# Submodule và Monorepo

Khi dự án lớn lên, bạn sẽ gặp câu hỏi: "Nên tổ chức code thành nhiều repo nhỏ hay một repo lớn?" Bài này sẽ đi sâu vào **Git Submodules** (repo lồng trong repo), **Monorepo** (một repo cho tất cả), và **Subtree** (alternative cho submodule). Mỗi cách có ưu nhược điểm riêng, và việc chọn đúng sẽ ảnh hưởng lớn đến workflow cả team.

---

## Mục lục

- [Vì sao có submodule & monorepo?](#vì-sao-có-submodule--monorepo)
- [1. Git Submodules](#1-git-submodules)
- [2. Monorepo](#2-monorepo)
- [3. Git Subtree — Alternative cho Submodule](#3-git-subtree-alternative-cho-submodule)
- [4. Khi nào dùng gì?](#4-khi-nào-dùng-gì)
- [5. Lỗi thường gặp](#5-lỗi-thường-gặp)
- [6. Câu hỏi phỏng vấn](#6-câu-hỏi-phỏng-vấn)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao có submodule & monorepo?

**Vấn đề:**

```bash
# Dự án lớn cần dùng chung code giữa nhiều repo

# Hướng 1: copy-paste thư viện chung vào từng repo
repo-web/     → có bản sao auth-lib (đã vá bug X)
repo-mobile/  → có bản sao auth-lib (CHƯA vá bug X)
repo-admin/   → có bản sao auth-lib (bản cũ hơn nữa)
# → vá 1 chỗ, phải sửa thủ công ở mọi nơi → dễ lệch, dễ sót

# Hướng 2: tách ra quá nhiều repo nhỏ
repo-api/  repo-web/  repo-shared/  repo-utils/ ...
# Sửa 1 tính năng đụng 3 repo → 3 PR, 3 review, version lệch nhau
# → khó phối hợp thay đổi xuyên repo
```

**Giải pháp:**

```bash
# Hai hướng quản lý code dùng chung, mỗi cách một đánh đổi

# SUBMODULE: nhúng một repo Git khác vào trong repo, ghim đúng commit
main-project/
└── libs/shared/   → con trỏ tới commit cụ thể của repo shared
# Chia sẻ code chung, mỗi phần vẫn version độc lập

# MONOREPO: gom nhiều project vào MỘT repo
company-monorepo/
├── apps/web   apps/mobile
└── packages/shared
# Thay đổi xuyên project trong 1 commit, dùng chung tooling, dễ refactor toàn cục
```

:::tip[Dùng thực tế]

- **Thư viện/SDK dùng chung**: dùng submodule để ghim đúng version cho từng repo tiêu thụ.
- **Frontend + backend + shared**: gom vào monorepo, import trực tiếp, không cần publish package.
- **Thay đổi xuyên package**: monorepo cho phép sửa shared + app trong 1 PR, không bao giờ version mismatch.
- **Dùng chung CI/cấu hình**: monorepo dùng chung pipeline, lint, format cho toàn bộ project.

:::

---

## 1. Git Submodules

### Submodule là gì?

Submodule cho phép bạn nhúng một Git repo bên trong một Git repo khác. Repo con (submodule) giữ nguyên lịch sử riêng, version riêng, remote riêng.

```
main-project/           ← repo chính
├── src/
├── package.json
├── .gitmodules          ← file cấu hình submodules
└── shared-lib/          ← submodule (repo riêng biệt)
    ├── src/
    ├── package.json
    └── .git             ← Git riêng của submodule
```

**Tại sao dùng submodule?**

- Chia sẻ thư viện chung giữa nhiều dự án
- Quản lý phiên bản thư viện chung (pin version cụ thể)
- Giữ repo chính nhẹ (không chứa code thư viện)

### Thêm submodule

```bash
# Thêm submodule vào thư mục "libs/shared"
git submodule add https://github.com/team/shared-lib.git libs/shared
```

Lệnh này tạo ra:

1. Clone repo `shared-lib` vào `libs/shared/`
2. Tạo file `.gitmodules` (hoặc thêm entry)
3. Stage cả hai thay đổi

```bash
# File .gitmodules được tạo:
[submodule "libs/shared"]
    path = libs/shared
    url = https://github.com/team/shared-lib.git
```

```bash
# Commit thêm submodule
git add .gitmodules libs/shared
git commit -m "chore: thêm shared-lib submodule"
```

### Clone repo có submodules

```bash
# Cách 1: Clone rồi init submodules (2 bước)
git clone https://github.com/team/main-project.git
cd main-project
git submodule init      # đăng ký submodules từ .gitmodules
git submodule update    # clone/checkout submodules

# Cách 2: Clone kèm submodules luôn (1 bước, khuyến khích)
git clone --recurse-submodules https://github.com/team/main-project.git

# Cách 3: Nếu đã clone rồi, init + update gộp lại
git submodule update --init --recursive
# --recursive: xử lý cả submodule lồng trong submodule
```

### Cơ chế hoạt động

Repo chính **không chứa code** của submodule. Thay vào đó, nó lưu một **con trỏ** (SHA commit) đến version cụ thể của submodule:

```
main-project git log:
  commit abc1234
  - .gitmodules: [submodule "libs/shared"] url=...
  - libs/shared: commit pointer → def5678
                                     ↑
                            SHA cụ thể trong repo shared-lib

Khi bạn "git submodule update":
  Git checkout shared-lib ở commit def5678
  (KHÔNG phải branch mới nhất, mà đúng commit được pin)
```

### Update submodule lên version mới

```bash
# Bước 1: Vào thư mục submodule
cd libs/shared

# Bước 2: Pull version mới
git fetch origin
git checkout main
git pull

# Bước 3: Quay về repo chính
cd ../..

# Bước 4: Stage thay đổi (con trỏ commit mới)
git add libs/shared
git commit -m "chore: update shared-lib to latest"
```

```bash
# Cách nhanh hơn: update tất cả submodules
git submodule update --remote
# Fetch + checkout commit mới nhất trên branch tracking

# Sau đó commit con trỏ mới
git add libs/shared
git commit -m "chore: update shared-lib to latest"
```

### Xóa submodule (quy trình phức tạp)

Xóa submodule KHÔNG đơn giản như `git rm`. Cần làm nhiều bước:

```bash
# Bước 1: Xóa entry trong .gitmodules
git config -f .gitmodules --remove-section submodule.libs/shared

# Bước 2: Xóa entry trong .git/config
git config --remove-section submodule.libs/shared

# Bước 3: Xóa thư mục submodule khỏi staging
git rm --cached libs/shared

# Bước 4: Xóa thư mục submodule trên disk
rm -rf libs/shared

# Bước 5: Xóa metadata trong .git/modules
rm -rf .git/modules/libs/shared

# Bước 6: Commit
git add .gitmodules
git commit -m "chore: xóa shared-lib submodule"
```

Hoặc dùng cách gọn hơn (Git 2.12+):

```bash
# Cách nhanh hơn
git rm libs/shared
rm -rf .git/modules/libs/shared
git commit -m "chore: xóa shared-lib submodule"
```

### Ưu nhược điểm Submodules

| Ưu điểm                      | Nhược điểm                             |
| ---------------------------- | -------------------------------------- |
| Pin version cụ thể           | Phức tạp cho người mới                 |
| Mỗi repo có lịch sử riêng    | Clone phải thêm `--recurse-submodules` |
| Quản lý quyền truy cập riêng | Xóa submodule rất rườm rà              |
| Phù hợp thư viện ít thay đổi | Detached HEAD gây nhầm lẫn             |
| CI/CD riêng cho từng module  | Dễ quên update submodule               |

---

## 2. Monorepo

### Monorepo là gì?

**Monorepo** (monolithic repository) là cách tổ chức tất cả code của tổ chức/dự án trong MỘT repo duy nhất:

```
company-monorepo/
├── apps/
│   ├── web/                 ← Frontend web app
│   │   ├── src/
│   │   └── package.json
│   ├── mobile/              ← Mobile app
│   │   ├── src/
│   │   └── package.json
│   └── admin/               ← Admin dashboard
│       ├── src/
│       └── package.json
├── packages/
│   ├── shared-ui/           ← UI components chung
│   │   ├── src/
│   │   └── package.json
│   ├── utils/               ← Utilities chung
│   │   ├── src/
│   │   └── package.json
│   └── api-client/          ← API client chung
│       ├── src/
│       └── package.json
├── package.json             ← Root package.json
└── turbo.json               ← Turborepo config (hoặc nx.json)
```

### Monorepo vs Polyrepo — So sánh

| Tiêu chí       | Monorepo                   | Polyrepo (nhiều repo)     |
| -------------- | -------------------------- | ------------------------- |
| Cấu trúc       | 1 repo chứa mọi thứ        | Mỗi project 1 repo        |
| Code sharing   | Import trực tiếp           | Publish package, version  |
| Atomic changes | 1 PR sửa nhiều packages    | Nhiều PR across repos     |
| CI/CD          | Phức tạp (cần biết sửa gì) | Đơn giản (mỗi repo riêng) |
| Dependency     | Luôn đồng bộ version       | Có thể version mismatch   |
| Repo size      | Lớn theo thời gian         | Mỗi repo nhỏ gọn          |
| Onboarding     | Clone 1 lần, có mọi thứ    | Cần biết clone repo nào   |
| Quyền truy cập | Khó giới hạn (1 repo)      | Dễ (mỗi repo riêng)       |
| Tooling cần    | Nx, Turborepo, Bazel...    | Git cơ bản là đủ          |

### Ưu điểm Monorepo

**1. Code sharing dễ dàng:**

```
# Polyrepo: phải publish package, install, version...
npm publish @company/utils
npm install @company/utils@1.2.3

# Monorepo: import trực tiếp
import { formatDate } from '@company/utils'
# Luôn dùng version mới nhất, không cần publish
```

**2. Atomic changes (thay đổi đồng thời nhiều package):**

```bash
# Sửa API client + cập nhật web app + cập nhật mobile app
# Tất cả trong 1 PR, 1 review, 1 merge
# Không bao giờ bị "version mismatch"
```

**3. Single CI pipeline:**

```
# 1 pipeline build/test tất cả packages affected
# Turborepo/Nx biết package nào bị ảnh hưởng → chỉ build đó
```

### Nhược điểm Monorepo

**1. Repo lớn dần:**

```bash
# Repo có thể lên GB sau vài năm
git clone company-monorepo
# Downloading... 2.3 GB... rất chậm!
```

**2. CI complexity:**

```
# Mỗi PR cần biết affected packages để chạy đúng tests
# Cần tool chuyên dụng: Nx, Turborepo
```

**3. Khó phân quyền:**

```
# Frontend team chỉ cần sửa apps/web/
# Nhưng họ có thể xem + sửa tất cả code trong repo
# GitHub CODEOWNERS giúp phần nào nhưng không hoàn hảo
```

### Tools phổ biến cho Monorepo

| Tool          | Ngôn ngữ              | Đặc điểm                                |
| ------------- | --------------------- | --------------------------------------- |
| **Turborepo** | JavaScript/TypeScript | Nhanh, dễ setup, caching                |
| **Nx**        | JavaScript/TypeScript | Mạnh, nhiều tính năng, plugin ecosystem |
| **Lerna**     | JavaScript/TypeScript | Quản lý versioning, publishing          |
| **Rush**      | JavaScript/TypeScript | Microsoft, enterprise-grade             |
| **Bazel**     | Đa ngôn ngữ           | Google, scale lớn, phức tạp             |
| **Pants**     | Python, Go, Java      | Build system cho backend                |

### Sparse Checkout — Chỉ clone phần cần thiết

Khi monorepo quá lớn, bạn không cần clone toàn bộ:

```bash
# Bước 1: Clone không checkout files
git clone --no-checkout https://github.com/company/monorepo.git
cd monorepo

# Bước 2: Bật sparse checkout
git sparse-checkout init --cone

# Bước 3: Chọn thư mục cần
git sparse-checkout set apps/web packages/shared-ui packages/utils

# Bước 4: Checkout
git checkout main

# Kết quả: Chỉ có thư mục bạn chọn
ls apps/
# web/   (chỉ có web, không có mobile hay admin)
ls packages/
# shared-ui/  utils/   (chỉ có 2 packages bạn chọn)
```

```bash
# Thêm thư mục sau
git sparse-checkout add apps/mobile

# Xem danh sách thư mục đang checkout
git sparse-checkout list
# apps/web
# apps/mobile
# packages/shared-ui
# packages/utils

# Tắt sparse checkout (checkout toàn bộ)
git sparse-checkout disable
```

### Partial Clone — Clone nhẹ hơn nữa

```bash
# Clone không tải blobs (file content) — chỉ tải khi cần
git clone --filter=blob:none https://github.com/company/monorepo.git

# Clone không tải trees (directory listings) — nhẹ nhất
git clone --filter=tree:0 https://github.com/company/monorepo.git

# Kết hợp với sparse checkout
git clone --filter=blob:none --sparse https://github.com/company/monorepo.git
cd monorepo
git sparse-checkout set apps/web

# Kết quả: Clone siêu nhanh, chỉ tải file khi bạn thực sự mở
```

---

## 3. Git Subtree — Alternative cho Submodule

### Subtree là gì?

`git subtree` cho phép nhúng code từ repo khác VÀO repo chính, trở thành một phần của repo chính (không phải con trỏ như submodule):

```
Submodule: repo chính chứa CON TRỎ đến repo con
Subtree:   repo chính chứa TOÀN BỘ CODE của repo con
```

### Thêm subtree

```bash
# Thêm remote cho repo bên ngoài
git remote add shared-lib https://github.com/team/shared-lib.git

# Thêm subtree vào thư mục libs/shared
git subtree add --prefix=libs/shared shared-lib main --squash
# --prefix: thư mục đích
# shared-lib: remote name
# main: branch
# --squash: gộp lịch sử thành 1 commit (khuyến khích)
```

### Pull update từ subtree

```bash
# Kéo thay đổi mới từ repo bên ngoài
git subtree pull --prefix=libs/shared shared-lib main --squash
```

### Push thay đổi ngược lại subtree

```bash
# Nếu bạn sửa code trong libs/shared và muốn push ngược về repo gốc
git subtree push --prefix=libs/shared shared-lib main
```

### Subtree vs Submodule — So sánh

| Tiêu chí    | Submodule                   | Subtree                     |
| ----------- | --------------------------- | --------------------------- |
| Cơ chế      | Con trỏ (SHA)               | Copy code vào repo          |
| Clone       | Cần `--recurse-submodules`  | Clone bình thường           |
| Lịch sử     | Tách biệt hoàn toàn         | Gộp vào repo chính          |
| Update      | `git submodule update`      | `git subtree pull`          |
| Đồng nghiệp | Phải biết về submodules     | Không cần biết gì đặc biệt  |
| Repo size   | Nhỏ (chỉ chứa con trỏ)      | Lớn hơn (chứa toàn bộ code) |
| Phức tạp    | Cao (nhiều bước, dễ nhầm)   | Thấp hơn                    |
| Push ngược  | Vào submodule, commit riêng | `git subtree push`          |

---

## 4. Khi nào dùng gì?

### Decision Tree

```
Bạn cần chia sẻ code giữa nhiều repos?
│
├── Có, thư viện nhỏ, ít thay đổi
│   └── Git Submodule
│       (Pin version, mỗi repo quản lý riêng)
│
├── Có, nhưng muốn đơn giản cho team
│   └── Git Subtree
│       (Code nằm trong repo chính, clone dễ)
│
├── Có, nhiều apps share code, cùng team
│   └── Monorepo
│       (1 repo, atomic changes, easy sharing)
│
└── Không, mỗi project độc lập
    └── Polyrepo
        (Mỗi project 1 repo, đơn giản nhất)
```

### Tóm tắt theo quy mô

| Quy mô                            | Đề xuất                         |
| --------------------------------- | ------------------------------- |
| Solo/nhóm nhỏ, vài projects       | Polyrepo hoặc Monorepo đơn giản |
| Team 5-20, shared libraries       | Submodule hoặc Subtree          |
| Team 20-100, nhiều apps liên quan | Monorepo + Turborepo/Nx         |
| Enterprise, 100+, đa ngôn ngữ     | Monorepo + Bazel/Pants          |

---

## 5. Lỗi thường gặp

### Lỗi 1: Clone repo mà quên init submodules

```bash
git clone https://github.com/team/project.git
cd project
ls libs/shared/
# (trống! submodule chưa được init)

# FIX:
git submodule update --init --recursive

# PHÒNG TRÁNH: Luôn dùng --recurse-submodules
git clone --recurse-submodules https://github.com/team/project.git
```

### Lỗi 2: Commit trong submodule mà quên commit pointer ở repo chính

```bash
cd libs/shared
# ... sửa code, commit ...
git add .
git commit -m "fix: sửa bug"
git push

cd ../..
git status
# modified: libs/shared (new commits)  ← CHƯA COMMIT!

# Nếu quên git add + commit → đồng nghiệp không thấy update
git add libs/shared
git commit -m "chore: update shared-lib pointer"
git push
```

### Lỗi 3: Submodule ở trạng thái detached HEAD

```bash
cd libs/shared
git status
# HEAD detached at abc1234   ← Bình thường cho submodule!

# Submodule luôn ở detached HEAD (checkout commit cụ thể)
# Nếu muốn commit thay đổi, phải checkout branch trước:
git checkout main
# Giờ mới commit được
```

### Lỗi 4: Monorepo CI chạy test tất cả packages mỗi PR

```bash
# SAI: Chạy test toàn bộ monorepo mỗi PR
npm run test   # 30 phút! Dù chỉ sửa 1 file

# ĐÚNG: Chỉ test packages bị ảnh hưởng
# Turborepo:
npx turbo run test --filter=...[origin/main]

# Nx:
npx nx affected --target=test --base=origin/main
```

### Lỗi 5: Sparse checkout nhưng PR diff hiển thị file ngoài scope

```bash
# Bạn sparse checkout apps/web, nhưng merge conflict ở apps/mobile
# Git vẫn tracking mọi thứ, chỉ không hiển thị trên disk

# FIX: Đừng sửa files ngoài sparse checkout scope
# Nếu conflict, hãy disable sparse checkout tạm thời:
git sparse-checkout disable
# Giải quyết conflict
git sparse-checkout set apps/web packages/shared-ui
```

---

## 6. Câu hỏi phỏng vấn

### Câu 1: Git Submodule là gì? Hoạt động thế nào?

**Trả lời:**
Git Submodule cho phép nhúng một Git repo bên trong repo khác. Repo chính lưu một con trỏ (SHA commit) đến version cụ thể của submodule, KHÔNG lưu code thực tế. Khi `git submodule update`, Git checkout submodule ở đúng commit được pin.

Cơ chế: file `.gitmodules` chứa URL và path, repo chính track SHA commit của submodule. Mỗi khi update submodule, bạn cần commit con trỏ mới trong repo chính.

### Câu 2: So sánh Monorepo và Polyrepo. Khi nào dùng cái nào?

**Trả lời:**

- **Monorepo**: 1 repo chứa tất cả projects. Ưu điểm: code sharing dễ, atomic changes, dependency luôn đồng bộ. Nhược điểm: repo lớn, CI phức tạp, khó phân quyền. Dùng khi: nhiều apps liên quan chặt, shared code nhiều, cùng team phát triển.
- **Polyrepo**: mỗi project 1 repo. Ưu điểm: đơn giản, repo nhỏ, phân quyền rõ ràng, CI đơn giản. Nhược điểm: code sharing khó (publish package), dependency dễ lệch version, cross-repo changes phức tạp. Dùng khi: projects độc lập, team khác nhau, security cần phân quyền.

### Câu 3: Subtree khác Submodule thế nào?

**Trả lời:**

- **Submodule**: Repo chính chứa con trỏ (reference) đến commit cụ thể của repo con. Clone cần `--recurse-submodules`. Lịch sử tách biệt.
- **Subtree**: Code từ repo con được copy thẳng vào repo chính, trở thành một phần của repo. Clone bình thường. Lịch sử gộp.

Subtree đơn giản hơn cho team (không cần biết gì đặc biệt), nhưng repo lớn hơn. Submodule giữ repo nhỏ nhưng phức tạp hơn.

### Câu 4: Sparse checkout là gì? Tại sao cần?

**Trả lời:**
Sparse checkout cho phép bạn chỉ checkout một phần thư mục trong repo, thay vì toàn bộ. Rất hữu ích cho monorepo lớn khi developer chỉ cần làm việc với 1-2 packages.

Cách dùng: `git sparse-checkout set apps/web packages/utils`. Git chỉ hiển thị các thư mục được chọn trên disk, nhưng vẫn tracking toàn bộ history. Kết hợp với `--filter=blob:none` (partial clone) để clone siêu nhanh.

### Câu 5: Làm sao xóa Git Submodule đúng cách?

**Trả lời:**
Xóa submodule cần nhiều bước:

1. `git rm <path>` — xóa submodule khỏi working tree và index
2. `rm -rf .git/modules/<path>` — xóa cached metadata
3. Commit thay đổi

Trong Git cũ hơn, cần thêm: xóa entry trong `.gitmodules`, xóa entry trong `.git/config`, `git rm --cached`. Đây là một trong những điểm phức tạp nhất của submodules.

---

## Tóm tắt

```
Submodule:   git submodule add <url> <path>     (repo lồng repo)
Subtree:     git subtree add --prefix=<p> <remote> <branch>  (copy code)
Monorepo:    1 repo, dùng Turborepo/Nx quản lý
Polyrepo:    Mỗi project 1 repo (đơn giản nhất)
Sparse:      git sparse-checkout set <dirs>      (checkout 1 phần)
Partial:     git clone --filter=blob:none        (clone nhẹ)
```
