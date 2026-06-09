---
sidebar_position: 1
title: "Git và Workflow"
---

# Git và Workflow

Git là công cụ quản lý phiên bản (version control) gần như bắt buộc với mọi lập trình viên, giúp lưu lại lịch sử thay đổi code và làm việc nhóm mà không giẫm chân nhau. Bài này hướng dẫn các lệnh Git cơ bản, cách dùng branch, merge và rebase, xử lý conflict cùng những workflow phổ biến để bạn quản lý dự án gọn gàng và chuyên nghiệp.

---

## Mục lục

- [Git command cơ bản](#git-command-cơ-bản)
- [Branching](#branching)
- [Merge vs Rebase](#merge-vs-rebase)
- [Resolving Conflicts](#resolving-conflicts)
- [Git Workflows](#git-workflows)

---

## Git command cơ bản

```bash
# Setup
git init
git clone <url>
git config --global user.name "Tên"
git config --global user.email "email@example.com"

# Daily
git status
git add .
git add file.ts
git commit -m "feat: add user login"
git push
git pull

# History
git log
git log --oneline --graph
git diff
git diff HEAD
git diff origin/main

# Undo
git reset HEAD file       # unstage
git restore file          # discard local change
git revert <commit>       # tạo commit mới undo
git reset --hard <commit> # XÓA, cẩn thận
```

---

## Branching

```bash
# Tạo + chuyển
git branch feature/login
git checkout feature/login
git checkout -b feature/login    # shortcut

# List
git branch        # local
git branch -a     # all

# Delete
git branch -d feature/login      # safe
git branch -D feature/login      # force

# Push branch mới
git push -u origin feature/login
```

---

## Merge vs Rebase

**Merge** — gộp branch, **giữ history**:

```bash
git checkout main
git merge feature/login
# Tạo merge commit
```

```
main:      A --- B --- C ----- M
                       \     /
feature:                D - E
```

**Rebase** — replay commit lên top, **history thẳng**:

```bash
git checkout feature/login
git rebase main
git checkout main
git merge feature/login  # fast-forward
```

```
main:      A --- B --- C --- D' --- E'
```

:::info[Phân tích]

**Khi nào merge, khi nào rebase?**

| Tình huống | Dùng |
|-----------|------|
| Branch dài, nhiều người làm | **Merge** (giữ context) |
| Branch ngắn 1 người | **Rebase** (sạch history) |
| Branch đã push lên remote | **Merge** (không rewrite history shared) |
| Trước khi merge → main | **Rebase** main vào branch để clean |

**Golden rule**: **không rebase commit đã push public**. Rewrite history
shared = ai pull rồi gặp conflict.

Pattern phổ biến:

```bash
# Trên feature branch
git fetch origin
git rebase origin/main    # update branch lên top main

# Sau khi PR approved
git checkout main
git merge feature/login   # fast-forward
git push
```

:::

---

## Resolving Conflicts

Conflict xảy ra khi 2 branch sửa cùng dòng:

```
<<<<<<< HEAD
const greeting = "Hello";
=======
const greeting = "Hi";
>>>>>>> feature/branch
```

Resolve:

1. Edit file → chọn version đúng (hoặc combine).
2. Xóa marker `<<<<<<<`, `=======`, `>>>>>>>`.
3. `git add file`.
4. `git commit` (nếu merge) hoặc `git rebase --continue`.

**Abort** nếu rối:

```bash
git merge --abort
git rebase --abort
```

VS Code, JetBrains có UI hỗ trợ resolve conflict trực quan.

---

## Git Workflows

**1. Git Flow** (truyền thống, phức tạp):

```
main         → production
develop      → integration
feature/*    → từng feature
release/*    → chuẩn bị release
hotfix/*     → fix urgent production
```

Phù hợp project release theo version (mobile app, software).

**2. GitHub Flow** (đơn giản, phổ biến):

```
main         → always deployable
feature/*    → tạo từ main, merge về main qua PR
```

Phù hợp app web, deploy continuous.

**3. Trunk-based** (modern, scale):

```
main         → main branch duy nhất
short-lived feature branch → merge trong < 1 ngày
```

Phù hợp team lớn, CI/CD strong, feature flag.

:::tip[Mẹo]

**Conventional Commits** — chuẩn message:

```
feat: add user login
fix: handle null token
docs: update README
chore: bump dependencies
refactor: extract auth service
test: add unit test for login
perf: optimize query
ci: update workflow
```

Lợi ích:

- **Changelog tự động** (tools: `standard-version`, `semantic-release`).
- **Semver auto bump** (`fix` → patch, `feat` → minor, `BREAKING CHANGE` → major).
- **Easier to read** PR history.

Bật **husky + commitlint** để enforce convention:

```bash
npm install -D husky @commitlint/cli @commitlint/config-conventional
npx husky init
```

:::

:::info[Phân tích]

**Git workflow cho team Vietnam 2026**:

- **Solo project / startup nhỏ**: **GitHub Flow** + Conventional Commits.
- **Team 5-20 người**: **GitHub Flow** + PR review + CI required.
- **Enterprise**: **Git Flow** hoặc **Trunk-based** + feature flags.
- **Mobile / có release cycle**: **Git Flow**.

Quy tắc thực dụng:

1. **PR review bắt buộc** trước merge main.
2. **CI pass** (test + lint) trước merge.
3. **Branch protection** — không direct push main.
4. **Squash merge** PR thành 1 commit cho main clean (optional).
5. **Tag release** sau mỗi deploy.

GitHub có UI cho hầu hết — không cần command line cho daily.

:::

Chi tiết hơn xem [Git docs](https://git-scm.com/doc) hoặc roadmap Git riêng.
