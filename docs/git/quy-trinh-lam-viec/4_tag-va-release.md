---
sidebar_position: 4
title: "4. Tag va Release"
---

# Tag và Release

Khi dự án của bạn đạt đến một mốc quan trọng — phiên bản đầu tiên, bản sửa lỗi lớn, hoặc tính năng mới — bạn cần **đánh dấu** thời điểm đó trong lịch sử Git. Đây là lúc **tag** phát huy tác dụng. Kết hợp với **GitHub Releases**, bạn có thể đóng gói phần mềm, viết release notes, và phân phối đến người dùng. Bài này sẽ hướng dẫn bạn mọi thứ từ tag cơ bản đến quy trình release chuyên nghiệp.

---


---

## Mục lục

- [1. Tag là gì?](#1-tag-là-gì)
- [2. Hai loại Tag](#2-hai-loại-tag)
- [3. Các thao tác với Tag](#3-các-thao-tác-với-tag)
- [4. Semantic Versioning (SemVer)](#4-semantic-versioning-semver)
- [5. GitHub Releases](#5-github-releases)
- [Bug Fixes](#bug-fixes)
- [6. Workflow đầy đủ: Từ commit đến Release](#6-workflow-đầy-đủ-từ-commit-đến-release)
- [7. Versioning strategies cho different project types](#7-versioning-strategies-cho-different-project-types)
- [8. Lỗi thường gặp](#8-lỗi-thường-gặp)
- [9. Câu hỏi phỏng vấn](#9-câu-hỏi-phỏng-vấn)
- [10. Tóm tắt](#10-tóm-tắt)

---

## 1. Tag là gì?

Tag là một **"nhãn dán" (label)** trên một commit cụ thể trong lịch sử Git. Khác với branch (thay đổi theo thời gian), tag là **cố định** — nó luôn trỏ đến cùng một commit.

```
  main:  --o---o---o---o---o---o---o---o--->
              |         |              |
            v1.0.0    v1.1.0         v2.0.0
              |         |              |
           Tag này luôn trỏ đến commit này, không bao giờ thay đổi
```

**Tại sao cần tag?**

| Mục đích | Giải thích |
|----------|-----------|
| **Đánh dấu release** | "Đây là code của version 1.0.0" |
| **Điểm tham chiếu** | Quay lại xem code tại bất kỳ version nào |
| **Trigger CI/CD** | Push tag -> tự động build và deploy |
| **Tạo GitHub Release** | Release notes, download binaries |
| **Debugging** | "Bug này xuất hiện từ version nào?" |

---

## 2. Hai loại Tag

Git có 2 loại tag, khác nhau về lượng thông tin lưu trữ:

### 2.1. Lightweight Tag — Đơn giản

Lightweight tag chỉ là **một con trỏ** đến commit, không có thêm thông tin gì.

```bash
# Tạo lightweight tag
git tag v1.0.0

# Tag trên 1 commit cụ thể (không phải HEAD)
git tag v0.9.0 abc1234
# abc1234 là hash của commit bạn muốn tag

# Xem thông tin — chỉ có hash
git show v1.0.0
# commit abc1234...
# Author: ...
# Date: ...
# (không có thêm thông tin gì ngoài commit)
```

### 2.2. Annotated Tag — Đầy đủ thông tin

Annotated tag là một **Git object** riêng biệt, chứa đầy đủ thông tin:

```bash
# Tạo annotated tag với message
git tag -a v1.0.0 -m "Release version 1.0.0 - First stable release"

# Xem thông tin — có nhiều hơn
git show v1.0.0
# tag v1.0.0
# Tagger: Alice <alice@example.com>       ← ai tạo tag
# Date:   Sat Mar 15 10:30:00 2024        ← tạo lúc nào
#
# Release version 1.0.0 - First stable release  ← message
#
# commit abc1234...
# Author: ...
```

### 2.3. So sánh

| Đặc điểm | Lightweight | Annotated |
|----------|------------|-----------|
| **Tagger (người tạo)** | Không lưu | Có lưu |
| **Ngày tạo** | Không lưu | Có lưu |
| **Message** | Không có | Có |
| **Có thể ký GPG** | Không | Có (`git tag -s`) |
| **Là Git object** | Không (chỉ là pointer) | Có |
| **Khi nào dùng** | Tag tạm, nội bộ | Release chính thức |

```bash
# Quy tắc chung:
# - Release tags (v1.0.0, v2.0.0) → LUÔN dùng Annotated
# - Tag tạm (test, debug) → Có thể dùng Lightweight
# - Có thể ký GPG → Chỉ Annotated

# Tạo annotated tag với GPG signature (bảo mật cao)
git tag -s v1.0.0 -m "Signed release v1.0.0"
# Cần có GPG key đã cấu hình
```

---

## 3. Các thao tác với Tag

### 3.1. Tạo tag

```bash
# --- Lightweight tag ---
git tag v1.0.0                          # Tag tại HEAD hiện tại
git tag v0.9.0 abc1234                  # Tag tại commit cụ thể

# --- Annotated tag ---
git tag -a v1.0.0 -m "First release"   # Tag tại HEAD với message
git tag -a v1.0.0 abc1234 -m "Release" # Tag tại commit cụ thể

# --- Tag với nhiều dòng message ---
git tag -a v2.0.0 -m "Release v2.0.0

Major changes:
- Redesigned API
- New authentication system
- Improved performance by 50%

Breaking changes:
- API v1 endpoints removed
- Old auth tokens invalidated"
```

### 3.2. Liệt kê tags

```bash
# Liệt kê tất cả tags
git tag
# v1.0.0
# v1.0.1
# v1.1.0
# v2.0.0

# Lọc theo pattern
git tag -l "v1.*"
# v1.0.0
# v1.0.1
# v1.1.0

git tag -l "v2.*"
# v2.0.0

# Sắp xếp theo version (không phải alphabet)
git tag -l --sort=-version:refname
# v2.0.0
# v1.1.0
# v1.0.1
# v1.0.0

# Xem tag với thông tin commit
git tag -l -n1
# v1.0.0   First stable release
# v1.0.1   Hotfix: payment crash
# v1.1.0   Add dark mode feature
# v2.0.0   Major redesign
```

### 3.3. Push tags lên remote

```bash
# QUAN TRỌNG: git push KHÔNG tự động push tags!
# Bạn phải push tags riêng:

# Push 1 tag cụ thể
git push origin v1.0.0

# Push TẤT CẢ tags cùng lúc
git push origin --tags

# Push chỉ annotated tags (bỏ qua lightweight)
git push origin --follow-tags
```

**Mẹo:** Cấu hình Git tự động push annotated tags:

```bash
# Tự động push annotated tags khi git push
git config --global push.followTags true

# Sau đó chỉ cần:
git push
# Sẽ push cả commits VÀ annotated tags
```

### 3.4. Xóa tag

```bash
# Xóa tag local
git tag -d v1.0.0
# Deleted tag 'v1.0.0'

# Xóa tag trên remote
git push origin --delete v1.0.0
# Hoặc:
git push origin :refs/tags/v1.0.0

# Xóa và tạo lại tag (point đến commit khác)
git tag -d v1.0.0
git tag -a v1.0.0 new-commit-hash -m "Corrected release"
git push origin --delete v1.0.0
git push origin v1.0.0
```

**Cảnh báo:** Xóa tag đã public là **rất nguy hiểm**! Nếu người khác đã pull tag đó, họ sẽ có tag cũ trỏ đến commit cũ. Chỉ xóa tag khi thực sự cần thiết và thông báo team.

### 3.5. Checkout code tại 1 tag

```bash
# Xem code tại version cụ thể
git checkout v1.0.0
# Lưu ý: bạn đang ở "detached HEAD" state
# Không nên commit trực tiếp ở đây

# Nếu muốn làm việc từ 1 tag cũ, tạo branch mới
git checkout -b hotfix/v1.0.1 v1.0.0
# Bây giờ bạn có branch mới bắt đầu từ v1.0.0

# So sánh 2 tags
git diff v1.0.0 v2.0.0
git diff v1.0.0 v2.0.0 --stat  # Chỉ xem tên file thay đổi

# Log giữa 2 tags
git log v1.0.0..v2.0.0 --oneline
# Thấy tất cả commits giữa 2 versions
```

---

## 4. Semantic Versioning (SemVer)

### 4.1. Format

```
MAJOR.MINOR.PATCH
  |     |     |
  |     |     +-- Sửa lỗi, không đổi API     (backward compatible bug fix)
  |     +-- Thêm tính năng mới, không đổi API (backward compatible feature)
  +-- Thay đổi không tương thích ngược        (breaking changes)

Ví dụ: 2.4.1
       | | |
       | | +-- Patch: lần sửa lỗi thứ 1
       | +-- Minor: lần thêm tính năng thứ 4
       +-- Major: lần breaking change thứ 2
```

### 4.2. Khi nào tăng version nào?

| Thay đổi | Tăng | Ví dụ | Giải thích |
|----------|------|-------|-----------|
| Sửa lỗi nhỏ | PATCH | 1.0.0 → 1.0.1 | Fix bug, không đổi API |
| Thêm tính năng mới | MINOR | 1.0.0 → 1.1.0 | Thêm endpoint mới, thêm option mới |
| Thay đổi breaking | MAJOR | 1.0.0 → 2.0.0 | Xóa endpoint, đổi format response |
| Sửa nhiều lỗi | PATCH | 1.2.3 → 1.2.4 | Vẫn là patch dù sửa nhiều bug |
| Thêm tính năng + sửa lỗi | MINOR | 1.2.3 → 1.3.0 | MINOR "thắng" PATCH, reset PATCH về 0 |
| Breaking + tính năng mới | MAJOR | 1.2.3 → 2.0.0 | MAJOR "thắng" tất cả, reset MINOR và PATCH về 0 |

### 4.3. Pre-release versions

Trước khi release chính thức, bạn có thể phát hành bản pre-release:

```bash
# Alpha — giai đoạn phát triển sớm, nhiều bug
git tag -a v2.0.0-alpha.1 -m "Alpha 1 of version 2.0"
git tag -a v2.0.0-alpha.2 -m "Alpha 2 — fixed major crashes"

# Beta — tính năng cơ bản hoàn thành, còn bug
git tag -a v2.0.0-beta.1 -m "Beta 1 — feature complete"
git tag -a v2.0.0-beta.2 -m "Beta 2 — performance improvements"

# Release Candidate (RC) — gần như sẵn sàng, chỉ fix bug
git tag -a v2.0.0-rc.1 -m "Release candidate 1"
git tag -a v2.0.0-rc.2 -m "Release candidate 2 — final fixes"

# Release chính thức
git tag -a v2.0.0 -m "Version 2.0.0 — stable release"
```

```
Thứ tự pre-release:
alpha.1 < alpha.2 < beta.1 < beta.2 < rc.1 < rc.2 < release

Vòng đời đầy đủ:
v2.0.0-alpha.1 → v2.0.0-alpha.2 → v2.0.0-beta.1 →
v2.0.0-beta.2 → v2.0.0-rc.1 → v2.0.0-rc.2 → v2.0.0
```

### 4.4. Build metadata

```bash
# Thêm thông tin build (không ảnh hưởng version ordering)
git tag -a v1.0.0+build.123 -m "Build 123"
git tag -a v1.0.0+20240315 -m "Build date March 15"

# v1.0.0+build.123 == v1.0.0 (cùng version, khác build)
```

---

## 5. GitHub Releases

### 5.1. Release là gì?

GitHub Release = Tag + Release Notes + Download Files. Nó là cách để **phân phối phần mềm** đến người dùng.

```
+----------------------------------------------+
|  GitHub Release v2.0.0                       |
+----------------------------------------------+
|  Tag: v2.0.0                                 |
|  Date: March 15, 2024                        |
|  Author: alice                               |
|                                              |
|  ## What's New                               |
|  - Redesigned API for better performance     |
|  - New authentication system                 |
|  - Dark mode support                         |
|                                              |
|  ## Breaking Changes                         |
|  - API v1 endpoints removed                  |
|                                              |
|  ## Assets                                   |
|  - app-v2.0.0-linux.tar.gz  (15 MB)        |
|  - app-v2.0.0-macos.dmg     (20 MB)        |
|  - app-v2.0.0-windows.exe   (18 MB)        |
|  - Source code (zip)                         |
|  - Source code (tar.gz)                      |
+----------------------------------------------+
```

### 5.2. Tạo Release bằng GitHub CLI

```bash
# Bước 1: Tạo tag (nếu chưa có)
git tag -a v2.0.0 -m "Version 2.0.0"
git push origin v2.0.0

# Bước 2: Tạo release từ tag
gh release create v2.0.0 \
  --title "Version 2.0.0" \
  --notes "## What's New
- Redesigned API
- New auth system
- Dark mode

## Bug Fixes
- Fixed login crash
- Fixed image upload on Safari"

# Bước 3: Upload assets (binaries, archives)
gh release upload v2.0.0 ./dist/app-linux.tar.gz
gh release upload v2.0.0 ./dist/app-macos.dmg
gh release upload v2.0.0 ./dist/app-windows.exe
```

### 5.3. Auto-generate Release Notes

GitHub có thể tự động tạo release notes từ các PR đã merge:

```bash
# Tự động tạo release notes từ PRs
gh release create v2.0.0 --generate-notes

# Kết quả tự động:
# ## What's Changed
# * feat: add dark mode by @alice in #42
# * fix: resolve login crash by @bob in #43
# * feat: redesign API by @charlie in #44
#
# ## New Contributors
# * @charlie made their first contribution in #44
#
# **Full Changelog**: v1.0.0...v2.0.0
```

**Cấu hình auto-generate** với file `.github/release.yml`:

```yaml
# .github/release.yml
changelog:
  categories:
    - title: "New Features"
      labels:
        - "enhancement"
        - "feature"
    - title: "Bug Fixes"
      labels:
        - "bug"
        - "bugfix"
    - title: "Performance"
      labels:
        - "performance"
    - title: "Documentation"
      labels:
        - "documentation"
    - title: "Other Changes"
      labels:
        - "*"
  exclude:
    labels:
      - "skip-changelog"
```

### 5.4. Pre-release và Draft

```bash
# Tạo pre-release (hiển thị bằng màu vàng, không phải latest)
gh release create v2.0.0-beta.1 \
  --title "v2.0.0 Beta 1" \
  --prerelease \
  --notes "Beta release for testing"

# Tạo draft release (chỉ team thấy, chưa public)
gh release create v2.0.0 \
  --title "Version 2.0.0" \
  --draft \
  --notes "Draft — do not publish yet"

# Publish draft khi sẵn sàng
gh release edit v2.0.0 --draft=false
```

### 5.5. Các thao tác khác với GitHub CLI

```bash
# Liệt kê tất cả releases
gh release list

# Xem chi tiết 1 release
gh release view v2.0.0

# Xóa release (giữ lại tag)
gh release delete v2.0.0

# Xóa release VÀ tag
gh release delete v2.0.0 --cleanup-tag

# Download assets từ release
gh release download v2.0.0

# Sửa release notes
gh release edit v2.0.0 --notes "Updated release notes"
```

---

## 6. Workflow đầy đủ: Từ commit đến Release

```
  Developer workflow:
  ==================

  1. Code & commit
     git add .
     git commit -m "feat: add new feature"
         |
  2. Merge vào main (qua PR)
     git checkout main
     git merge feature/xxx
         |
  3. Tạo tag
     git tag -a v1.2.0 -m "Release v1.2.0"
         |
  4. Push tag
     git push origin v1.2.0
         |
  5. CI/CD triggered (tự động)
     - Build
     - Test
     - Create artifacts
         |
  6. GitHub Release
     gh release create v1.2.0 --generate-notes
     gh release upload v1.2.0 ./dist/*
         |
  7. Deploy (tự động hoặc thủ công)
     - Staging → Production
```

**Script tự động hóa:**

```bash
#!/bin/bash
# release.sh — Script tạo release

# Kiểm tra tham số
VERSION=$1
if [ -z "$VERSION" ]; then
  echo "Sử dụng: ./release.sh v1.2.0"
  exit 1
fi

echo "Tạo release $VERSION..."

# Đảm bảo đang ở main và cập nhật
git checkout main
git pull origin main

# Tạo annotated tag
git tag -a "$VERSION" -m "Release $VERSION"

# Push tag
git push origin "$VERSION"

# Tạo GitHub Release với auto-generated notes
gh release create "$VERSION" \
  --title "Release $VERSION" \
  --generate-notes

echo "Release $VERSION đã được tạo thành công!"
echo "Xem tại: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/releases/tag/$VERSION"
```

---

## 7. Versioning strategies cho different project types

| Loại dự án | Strategy | Ví dụ |
|-----------|----------|-------|
| **Library/SDK** | Strict SemVer | v1.0.0, v1.1.0, v2.0.0 |
| **Web App (SaaS)** | Date-based hoặc SemVer | v2024.03.15 hoặc v3.2.1 |
| **Mobile App** | SemVer + build number | v2.1.0 (build 142) |
| **API** | URL versioning + SemVer | /api/v2/ + tag v2.3.1 |
| **Monorepo** | Per-package versioning | @mylib/core@1.2.0, @mylib/ui@3.0.0 |
| **Game** | Marketing version | v1.0 "Season 3 Update" |

```bash
# Date-based versioning (CalVer)
git tag -a v2024.03.15 -m "Release March 15, 2024"
git tag -a v2024.03.15.2 -m "Second release of the day"

# Mobile app với build number
git tag -a v2.1.0-build.142 -m "Build 142 submitted to App Store"

# Monorepo — tag per package
git tag -a core@1.2.0 -m "Core package v1.2.0"
git tag -a ui@3.0.0 -m "UI package v3.0.0"
```

---

## 8. Lỗi thường gặp

### Lỗi 1: Quên push tags

```bash
# Tạo tag nhưng quên push → tag chỉ ở local, team không thấy
git tag -a v1.0.0 -m "Release"
git push origin main  # Chỉ push commits, KHÔNG push tag!

# ĐÚNG: push tag riêng
git push origin v1.0.0
# Hoặc push tất cả tags
git push origin --tags

# Tốt nhất: cấu hình auto push
git config --global push.followTags true
```

### Lỗi 2: Tag sai commit

```bash
# Tag nhưng nhận ra sai commit → cần sửa

# Bước 1: Xóa tag cũ (local + remote)
git tag -d v1.0.0
git push origin --delete v1.0.0

# Bước 2: Tạo tag mới tại commit đúng
git tag -a v1.0.0 correct-commit-hash -m "Release v1.0.0"
git push origin v1.0.0

# CẢNH BÁO: Nếu người khác đã pull tag cũ, họ cần:
git fetch --tags --force
```

### Lỗi 3: Không dùng annotated tag cho release

```bash
# SAI: dùng lightweight tag cho release
git tag v1.0.0  # Không có thông tin ai tạo, khi nào

# ĐÚNG: dùng annotated tag cho release
git tag -a v1.0.0 -m "Release v1.0.0 — first stable release"
# Có: tagger, date, message, có thể GPG sign
```

### Lỗi 4: Version numbering không nhất quán

```bash
# SAI: nhảy lung tung
v1.0.0 → v1.0.2 → v1.0.5 → v1.1.3 → v3.0.0

# ĐÚNG: tăng tuần tự theo SemVer
v1.0.0 → v1.0.1 → v1.0.2 → v1.1.0 → v1.2.0 → v2.0.0

# Lưu ý: MINOR tăng thì PATCH reset về 0
# v1.2.3 + feat mới = v1.3.0 (KHÔNG PHẢI v1.3.3)
```

### Lỗi 5: Không tạo release notes

```bash
# Tag mà không có release notes → người dùng không biết thay đổi gì

# LUÔN tạo release notes, ít nhất với --generate-notes
gh release create v1.0.0 --generate-notes

# Tốt hơn: viết release notes cụ thể với:
# - What's New (tính năng mới)
# - Bug Fixes (lỗi đã sửa)
# - Breaking Changes (thay đổi không tương thích)
# - Migration Guide (hướng dẫn nâng cấp)
```

---

## 9. Câu hỏi phỏng vấn

### Câu 1: Lightweight tag khác annotated tag như thế nào? Khi nào dùng loại nào?

**Trả lời:** Lightweight tag chỉ là một pointer đến commit, không lưu thêm thông tin nào. Annotated tag là một Git object riêng biệt, lưu tên người tạo (tagger), ngày tạo, message, và có thể ký GPG. Dùng annotated tag cho release chính thức vì cần ghi lại ai tạo, khi nào, và tại sao. Lightweight tag dùng cho tag tạm thời hoặc nội bộ.

### Câu 2: Semantic Versioning là gì? Khi nào tăng MAJOR, MINOR, PATCH?

**Trả lời:** SemVer là quy ước đặt tên version theo format MAJOR.MINOR.PATCH. Tăng PATCH khi sửa lỗi mà không đổi API (backward compatible). Tăng MINOR khi thêm tính năng mới mà vẫn backward compatible. Tăng MAJOR khi có breaking changes — thay đổi không tương thích ngược. Khi tăng MINOR thì PATCH reset về 0, khi tăng MAJOR thì cả MINOR và PATCH reset về 0.

### Câu 3: Làm sao để tự động tạo release mới khi push tag?

**Trả lời:** Dùng GitHub Actions với trigger `on: push: tags`. Khi push tag mới, workflow sẽ tự động: (1) Build ứng dụng, (2) Chạy tests, (3) Tạo artifacts (binaries), (4) Tạo GitHub Release với `gh release create` hoặc action như `softprops/action-gh-release`, (5) Upload artifacts vào release. Kết hợp với Conventional Commits và standard-version, toàn bộ quy trình từ commit -> tag -> release -> deploy có thể tự động hóa.

### Câu 4: Pre-release version dùng như thế nào? Cho ví dụ.

**Trả lời:** Pre-release version sử dụng dash sau version chính: `v2.0.0-alpha.1`, `v2.0.0-beta.1`, `v2.0.0-rc.1`. Thứ tự: alpha (phát triển sớm, nhiều bug) -> beta (feature complete, còn bug) -> rc (Release Candidate, gần sẵn sàng) -> stable release. Trên GitHub, tạo pre-release với flag `--prerelease` để hiển thị bằng màu vàng và không được coi là "latest release". Điều này cho phép early adopters test trước mà không ảnh hưởng người dùng bình thường.

### Câu 5: Team bạn dùng monorepo với 3 packages. Làm sao quản lý versioning?

**Trả lời:** Có 2 cách: (1) **Independent versioning** — mỗi package có version riêng, tag dạng `@package-name@1.2.0`. Dùng khi các packages phát triển độc lập, ví dụ `@mylib/core@1.2.0` và `@mylib/ui@3.0.0`. (2) **Fixed versioning** — tất cả packages dùng chung 1 version, tag dạng `v1.2.0`. Đơn giản hơn nhưng bắt buộc tất cả packages release cùng lúc. Tools như Lerna, Changesets, hoặc Nx hỗ trợ cả 2 cách. Phổ biến nhất là independent versioning vì linh hoạt hơn.

---

## 10. Tóm tắt

```
+--------------------------------------------------------------+
|  Git Tag — Đánh dấu điểm quan trọng trong lịch sử            |
|  - Lightweight: chỉ là pointer (dùng cho tag tạm)            |
|  - Annotated: đầy đủ thông tin (dùng cho release)            |
+--------------------------------------------------------------+
|  SemVer: MAJOR.MINOR.PATCH                                  |
|  - fix → PATCH, feat → MINOR, breaking → MAJOR              |
|  - Pre-release: alpha → beta → rc → stable                  |
+--------------------------------------------------------------+
|  GitHub Release = Tag + Release Notes + Assets               |
|  - gh release create v1.0.0 --generate-notes                |
|  - Upload binaries, archives                                 |
+--------------------------------------------------------------+
|  Workflow: commit → tag → push → CI/CD → release → deploy   |
+--------------------------------------------------------------+
```
