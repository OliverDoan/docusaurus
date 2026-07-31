---
sidebar_position: 5
title: "5. Git Hooks và Tự động hóa"
---

# Git Hooks và Tự động hóa

Bạn có bao giờ quên chạy lint trước khi commit? Hoặc đồng nghiệp commit message lung tung không theo quy ước? **Git Hooks** cho phép bạn tự động hóa các kiểm tra tại mỗi bước trong workflow Git — từ trước khi commit đến sau khi push. Kết hợp với **Husky**, **lint-staged**, và **commitlint**, bạn có thể xây dựng một pipeline tự động đảm bảo chất lượng code cho cả team.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Git hooks tự động kiểm tra** — `pre-commit` (lint/format), `commit-msg` (validate message), `pre-push` (test) giúp bắt lỗi sớm ngay trên máy dev ("shift left").
- ⭐ **Hooks trong `.git/hooks/` KHÔNG được share** — dùng Husky (lưu trong `.husky/`) để chia sẻ hook cho cả team, tự cài khi `npm install` nhờ script `prepare`.
- **lint-staged** — chỉ chạy linter/formatter trên file đã stage, nhanh hơn nhiều so với lint toàn project.
- **commitlint** — ép commit message theo Conventional Commits để lịch sử rõ ràng, tự sinh changelog.
- **`--no-verify`** — bỏ qua hooks, chỉ dùng khi khẩn cấp; branch protection (server-side) thì không bypass được.

:::

---

## Mục lục

- [Vì sao có Git hooks?](#vì-sao-có-git-hooks)
- [1. Git Hooks là gì?](#1-git-hooks-là-gì)
- [2. Các loại hooks](#2-các-loại-hooks)
- [3. Tạo hook thủ công](#3-tạo-hook-thủ-công)
- [4. Husky — Chia sẻ hooks cho cả team](#4-husky-chia-sẻ-hooks-cho-cả-team)
- [5. lint-staged — Chỉ lint files đã stage](#5-lint-staged-chỉ-lint-files-đã-stage)
- [6. commitlint — Validate commit message](#6-commitlint-validate-commit-message)
- [7. Setup hoàn chỉnh: Husky + lint-staged + commitlint + Prettier](#7-setup-hoàn-chỉnh-husky-lint-staged-commitlint-prettier)
- [8. Pre-push hook: Chạy tests trước khi push](#8-pre-push-hook-chạy-tests-trước-khi-push)
- [9. --no-verify: Bypass hooks](#9-no-verify-bypass-hooks)
- [10. Server-side hooks](#10-server-side-hooks)
- [11. Bảng tổng hợp hooks và use cases](#11-bảng-tổng-hợp-hooks-và-use-cases)
- [12. Lỗi thường gặp](#12-lỗi-thường-gặp)
- [13. Câu hỏi phỏng vấn](#13-câu-hỏi-phỏng-vấn)
- [Tóm tắt](#tóm-tắt)

---

## Vì sao có Git hooks?

**Vấn đề:** Mỗi dự án có nhiều quy tắc chất lượng — chạy linter, format code, chạy test, kiểm tra commit message đúng chuẩn, không để lọt secret vào repo. Nếu tất cả phụ thuộc vào việc mỗi người **tự nhớ làm thủ công**, thì sớm muộn cũng có người quên.

```bash
# Developer vội vàng commit, quên chạy lint/format/test
git add .
git commit -m "fix bug"   # message không theo chuẩn
git push                  # đẩy luôn lên remote

# Hậu quả:
#  - Code bẩn, sai format lọt vào repo
#  - Commit message lung tung, khó đọc lịch sử
#  - Có khi đẩy nhầm cả API key vào source
#  - CI fail TẬN trên server → biết lỗi muộn, mất thời gian sửa lại
```

**Giải pháp:** Dùng **Git hooks** — script Git **tự chạy** tại các thời điểm nhất định trong workflow (pre-commit, commit-msg, pre-push...) để tự động kiểm tra và **chặn** trước khi commit/push. Đây là tư duy **"dịch chuyển trái" (shift left)**: bắt lỗi sớm ngay trên máy dev thay vì đợi CI báo lỗi. Dùng **Husky** + **lint-staged** để chia sẻ hook cho cả team qua repo.

```bash
git add .
git commit -m "fix bug"
#  → [pre-commit]  chạy lint + format trên file đã stage
#  → [commit-msg]  message không đúng chuẩn → CHẶN commit
#
git commit -m "fix: sửa lỗi tính tổng giỏ hàng"
#  → các hook PASS → commit thành công
git push
#  → [pre-push]   chạy test, fail thì CHẶN push
```

:::tip[Dùng thực tế]

- **pre-commit chạy lint + format:** tự ESLint/Prettier trên file đã stage, code bẩn không lọt vào repo.
- **commit-msg ép chuẩn:** dùng commitlint để bắt buộc `feat:`, `fix:`... giúp lịch sử rõ ràng, tự sinh changelog.
- **pre-push chạy test:** chạy unit test trước khi push, fail thì chặn — không làm vỡ branch chung.
- **Chặn commit chứa secret:** quét API key/token/password trong diff, phát hiện thì dừng commit ngay.

:::

---

## 1. Git Hooks là gì?

Git Hooks là **scripts tự động chạy** khi một sự kiện Git xảy ra. Ví dụ: trước khi commit, Git có thể chạy linter; trước khi push, Git có thể chạy tests.

```
Workflow Git với hooks:

  git add .
      │
  git commit -m "feat: ..."
      │
      ▼
  [pre-commit hook]        ← Chạy lint, format, check
      │ pass?
      ├── Không → ABORT commit, hiện lỗi
      ▼ Có
  [prepare-commit-msg]     ← Tự động sửa commit message
      │
  [commit-msg hook]        ← Validate commit message format
      │ pass?
      ├── Không → ABORT commit, hiện lỗi
      ▼ Có
  Commit thành công!
      │
  [post-commit hook]       ← Thông báo, log, etc.
      │
  git push
      │
  [pre-push hook]          ← Chạy tests trước khi push
      │ pass?
      ├── Không → ABORT push
      ▼ Có
  Push thành công!
```

---

## 2. Các loại hooks

### Client-side hooks (chạy trên máy developer)

| Hook                 | Khi nào chạy                 | Dùng để                           |
| -------------------- | ---------------------------- | --------------------------------- |
| `pre-commit`         | Trước khi tạo commit         | Lint, format, chạy tests nhanh    |
| `prepare-commit-msg` | Sau khi tạo message mặc định | Tự thêm ticket ID, template       |
| `commit-msg`         | Sau khi user nhập message    | Validate format commit message    |
| `post-commit`        | Sau khi commit thành công    | Thông báo, trigger build          |
| `pre-push`           | Trước khi push               | Chạy full tests, type check       |
| `post-checkout`      | Sau khi checkout branch      | Install dependencies              |
| `pre-rebase`         | Trước khi rebase             | Cảnh báo nếu rebase shared branch |
| `post-merge`         | Sau khi merge                | Install dependencies mới          |

### Server-side hooks (chạy trên Git server)

| Hook           | Khi nào chạy           | Dùng để                       |
| -------------- | ---------------------- | ----------------------------- |
| `pre-receive`  | Trước khi nhận push    | Reject push vi phạm policy    |
| `update`       | Mỗi branch được update | Kiểm tra từng branch          |
| `post-receive` | Sau khi nhận push      | Deploy, thông báo, CI trigger |

---

## 3. Tạo hook thủ công

Hooks nằm trong `.git/hooks/`. Git tạo sẵn samples khi init repo:

```bash
ls .git/hooks/
# applypatch-msg.sample
# commit-msg.sample
# pre-commit.sample
# pre-push.sample
# prepare-commit-msg.sample
# ...
```

### Ví dụ: Tạo pre-commit hook

```bash
# Tạo file hook (bỏ .sample)
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
# Pre-commit hook: Kiểm tra console.log trước khi commit

# Tìm console.log trong staged files
FILES=$(git diff --cached --name-only --diff-filter=ACM -- '*.js' '*.ts' '*.tsx')

if [ -z "$FILES" ]; then
    exit 0  # Không có file JS/TS → pass
fi

# Kiểm tra console.log
if grep -n "console\.log" $FILES; then
    echo ""
    echo "CẢNH BÁO: Phát hiện console.log trong code!"
    echo "Vui lòng xóa trước khi commit."
    echo "Dùng --no-verify để bỏ qua (KHÔNG khuyến khích)"
    exit 1  # Abort commit
fi

exit 0  # Pass
EOF

# Cho phép thực thi
chmod +x .git/hooks/pre-commit
```

```bash
# Test hook
echo "console.log('debug')" >> src/app.js
git add src/app.js
git commit -m "test"
# CẢNH BÁO: Phát hiện console.log trong code!
# commit bị abort!
```

### Vấn đề lớn: Hooks KHÔNG được share qua Git

```
.git/hooks/ là thư mục LOCAL, không được track bởi Git.
=> Đồng nghiệp clone repo → KHÔNG có hooks!
=> Mỗi người phải tự cài hooks → không ai làm!

Giải pháp: Dùng Husky (hoặc tool tương tự)
=> Hooks nằm trong .husky/ (tracked bởi Git)
=> Đồng nghiệp clone + npm install → tự động có hooks
```

---

## 4. Husky — Chia sẻ hooks cho cả team

### Husky là gì?

**Husky** là tool giúp quản lý Git hooks trong project JavaScript/TypeScript. Hooks được lưu trong thư mục `.husky/` (tracked bởi Git), tự động cài đặt khi chạy `npm install`.

### Cài đặt Husky

```bash
# Bước 1: Cài Husky
npm install --save-dev husky

# Bước 2: Khởi tạo Husky (tạo thư mục .husky/)
npx husky init
```

Lệnh `npx husky init` tạo:

```
.husky/
├── _/
│   └── husky.sh          ← Script nội bộ của Husky
└── pre-commit             ← Hook mẫu
```

Và thêm `prepare` script vào `package.json`:

```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

Script `prepare` chạy tự động sau `npm install` -> tất cả đồng nghiệp sẽ có hooks khi cài dependencies.

### Tạo hooks với Husky

```bash
# Tạo pre-commit hook: chạy lint
echo "npm run lint" > .husky/pre-commit

# Tạo commit-msg hook: validate commit message
echo "npx --no -- commitlint --edit \$1" > .husky/commit-msg

# Tạo pre-push hook: chạy tests
echo "npm test" > .husky/pre-push
```

Nội dung file `.husky/pre-commit`:

```bash
npm run lint
```

Khi bạn `git commit`, Husky tự động chạy `npm run lint`. Nếu lint fail -> commit bị abort.

---

## 5. lint-staged — Chỉ lint files đã stage

### Vấn đề

Chạy lint toàn bộ project mỗi lần commit rất chậm. Nếu project có 1000 files, chỉ sửa 2 files nhưng phải lint cả 1000?

### Giải pháp: lint-staged

`lint-staged` chỉ chạy linter/formatter trên **files đã được git add** (staged files):

```bash
# Cài đặt
npm install --save-dev lint-staged
```

### Cấu hình lint-staged

**Cách 1: Trong `package.json`**

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,scss}": ["prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

**Cách 2: File `.lintstagedrc.json` riêng**

```json
{
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.css": ["stylelint --fix", "prettier --write"],
  "*.md": ["prettier --write"]
}
```

### Kết hợp Husky + lint-staged

```bash
# Cập nhật pre-commit hook để chạy lint-staged
echo "npx lint-staged" > .husky/pre-commit
```

Giờ khi bạn commit:

```bash
git add src/app.js src/utils.js     # Stage 2 files
git commit -m "feat: thêm tính năng"

# Husky chạy pre-commit hook
# → lint-staged chạy eslint + prettier CHỈ trên src/app.js và src/utils.js
# → Nếu pass → commit thành công
# → Nếu fail → commit abort, hiện lỗi
```

```
Workflow:
  git commit
      │
  Husky: pre-commit hook
      │
  lint-staged:
      ├── src/app.js     → eslint --fix → prettier --write
      ├── src/utils.js   → eslint --fix → prettier --write
      └── (1000 files khác → BỎ QUA, không cần lint)
      │
  Tất cả pass? → Commit thành công!
```

---

## 6. commitlint — Validate commit message

### Tại sao cần?

Commit messages không theo quy ước gây khó khăn khi:

- Đọc lịch sử (`git log`)
- Tạo changelog tự động
- Tìm commit liên quan

```bash
# Commit messages TỆ:
git log --oneline
# abc1234 fix bug
# def5678 update stuff
# 9876543 wip
# 1111111 asdfasdf

# Commit messages TỐT (Conventional Commits):
git log --oneline
# abc1234 fix: sửa lỗi validation form đăng nhập
# def5678 feat: thêm chức năng tìm kiếm sản phẩm
# 9876543 docs: cập nhật README hướng dẫn cài đặt
# 1111111 refactor: tách module thanh toán thành service riêng
```

### Cài đặt commitlint

```bash
# Cài commitlint + config conventional commits
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

### Cấu hình commitlint

Tạo file `commitlint.config.js`:

```javascript
// commitlint.config.js
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Type phải là một trong các giá trị sau
    "type-enum": [
      2, // 2 = error (bắt buộc)
      "always",
      [
        "feat", // Tính năng mới
        "fix", // Sửa bug
        "docs", // Documentation
        "style", // Formatting, không ảnh hưởng logic
        "refactor", // Refactor code
        "perf", // Cải thiện performance
        "test", // Thêm/sửa tests
        "chore", // Maintenance tasks
        "ci", // CI/CD changes
        "build", // Build system
        "revert", // Revert commit trước
      ],
    ],
    // Subject không được trống
    "subject-empty": [2, "never"],
    // Subject tối đa 100 ký tự
    "subject-max-length": [2, "always", 100],
    // Type không được trống
    "type-empty": [2, "never"],
    // Type phải viết thường
    "type-case": [2, "always", "lower-case"],
  },
};
```

### Kết hợp commitlint + Husky

```bash
# Tạo commit-msg hook
echo "npx --no -- commitlint --edit \$1" > .husky/commit-msg
```

Giờ khi commit:

```bash
# Message SAI format → bị reject
git commit -m "fixed the bug"
# ✖ subject may not be empty [subject-empty]
# ✖ type may not be empty [type-empty]

git commit -m "Fix: sửa lỗi"
# ✖ type must be lower-case [type-case]

# Message ĐÚNG format → pass
git commit -m "fix: sửa lỗi validation form đăng nhập"
# ✔ Commit thành công!
```

---

## 7. Setup hoàn chỉnh: Husky + lint-staged + commitlint + Prettier

Đây là setup phổ biến nhất cho dự án JavaScript/TypeScript:

### Bước 1: Cài đặt tất cả dependencies

```bash
npm install --save-dev \
  husky \
  lint-staged \
  @commitlint/cli \
  @commitlint/config-conventional \
  prettier \
  eslint
```

### Bước 2: Khởi tạo Husky

```bash
npx husky init
```

### Bước 3: Cấu hình package.json

```json
{
  "scripts": {
    "prepare": "husky",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "format": "prettier --write .",
    "test": "jest"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,scss,md,json}": ["prettier --write"]
  }
}
```

### Bước 4: Tạo commitlint config

```javascript
// commitlint.config.js
module.exports = {
  extends: ["@commitlint/config-conventional"],
};
```

### Bước 5: Tạo hooks

```bash
# Pre-commit: lint + format staged files
echo "npx lint-staged" > .husky/pre-commit

# Commit-msg: validate commit message format
echo "npx --no -- commitlint --edit \$1" > .husky/commit-msg

# Pre-push: chạy tests trước khi push
echo "npm test" > .husky/pre-push
```

### Bước 6: Tạo Prettier config

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100
}
```

### Kết quả

```bash
# Khi commit:
git add src/app.js
git commit -m "feat: thêm trang dashboard"

# 1. Husky chạy pre-commit → lint-staged
#    → eslint --fix src/app.js (auto-fix lỗi lint)
#    → prettier --write src/app.js (auto-format)
#
# 2. Husky chạy commit-msg → commitlint
#    → Validate "feat: thêm trang dashboard" → PASS
#
# 3. Commit thành công!

# Khi push:
git push

# 1. Husky chạy pre-push → npm test
#    → Chạy tất cả tests
#    → Nếu fail → push bị abort
#    → Nếu pass → push thành công!
```

---

## 8. Pre-push hook: Chạy tests trước khi push

### Tại sao cần pre-push?

- Pre-commit chạy nhanh (lint, format) → chạy mỗi commit
- Tests có thể chậm (30 giây - vài phút) → không nên chạy mỗi commit
- Pre-push chạy trước khi push → đảm bảo code push lên đã pass tests

```bash
# .husky/pre-push
npm test
```

### Pre-push nâng cao

```bash
#!/bin/sh
# .husky/pre-push — Kiểm tra kỹ trước khi push

echo "Đang chạy kiểm tra trước khi push..."

# Type check TypeScript
echo "→ Type checking..."
npm run typecheck || {
    echo "Type check FAILED! Fix lỗi TypeScript trước khi push."
    exit 1
}

# Chạy tests
echo "→ Running tests..."
npm test || {
    echo "Tests FAILED! Fix tests trước khi push."
    exit 1
}

# Kiểm tra build
echo "→ Build check..."
npm run build || {
    echo "Build FAILED! Fix build trước khi push."
    exit 1
}

echo "Tất cả kiểm tra PASSED! Đang push..."
```

---

## 9. --no-verify: Bypass hooks

```bash
# Bỏ qua pre-commit hook
git commit --no-verify -m "wip: work in progress"
# Hoặc viết tắt:
git commit -n -m "wip: work in progress"

# Bỏ qua pre-push hook
git push --no-verify
```

### Khi nào NÊN dùng --no-verify?

```
NÊN:
- WIP commits trên branch cá nhân (sẽ squash sau)
- Hotfix khẩn cấp (fix production ngay)
- Hook bị lỗi do config (đang fix hook)

KHÔNG NÊN:
- Commit lên main/develop (shared branches)
- Thói quen dùng thường xuyên (hook mất ý nghĩa)
- Để bypass test failures (fix test đi!)
```

---

## 10. Server-side hooks

### Protect main branch

Server-side hooks chạy trên Git server (GitHub, GitLab, Bitbucket), không phụ thuộc client. Developer KHÔNG thể bypass.

```bash
#!/bin/bash
# hooks/pre-receive — Server-side hook (ví dụ minh họa)

while read oldrev newrev refname; do
    # Chặn push trực tiếp lên main
    if [ "$refname" = "refs/heads/main" ]; then
        echo "ERROR: Push trực tiếp lên main bị cấm!"
        echo "Hãy tạo Pull Request để merge."
        exit 1
    fi

    # Chặn force push
    if [ "$oldrev" != "0000000000000000000000000000000000000000" ]; then
        MERGE_BASE=$(git merge-base $oldrev $newrev 2>/dev/null)
        if [ "$MERGE_BASE" != "$oldrev" ]; then
            echo "ERROR: Force push không được phép!"
            exit 1
        fi
    fi
done
```

### Trên GitHub/GitLab

Thực tế, bạn thường dùng **Branch Protection Rules** thay vì server hooks:

```
GitHub Branch Protection Rules:
├── Require pull request reviews (bắt buộc review)
├── Require status checks to pass (CI phải pass)
├── Require signed commits (commit phải signed)
├── Require linear history (no merge commits)
├── Restrict who can push (giới hạn quyền push)
└── Do not allow force pushes (cấm force push)

GitLab Protected Branches:
├── No one can push directly
├── Merge requests required
├── Pipeline must succeed
└── Code owner approval required
```

---

## 11. Bảng tổng hợp hooks và use cases

| Hook                 | Loại   | Khi nào chạy     | Use case phổ biến                  |
| -------------------- | ------ | ---------------- | ---------------------------------- |
| `pre-commit`         | Client | Trước commit     | lint-staged, format, spell check   |
| `prepare-commit-msg` | Client | Tạo message      | Tự thêm ticket ID từ branch name   |
| `commit-msg`         | Client | Validate message | commitlint, enforce format         |
| `post-commit`        | Client | Sau commit       | Thông báo Slack, log               |
| `pre-push`           | Client | Trước push       | Tests, type check, build check     |
| `post-checkout`      | Client | Sau checkout     | `npm install` nếu package.json đổi |
| `post-merge`         | Client | Sau merge        | `npm install` nếu package.json đổi |
| `pre-rebase`         | Client | Trước rebase     | Cảnh báo rebase shared branch      |
| `pre-receive`        | Server | Trước nhận push  | Reject push vi phạm policy         |
| `update`             | Server | Update mỗi ref   | Branch protection                  |
| `post-receive`       | Server | Sau nhận push    | Deploy, CI trigger, notification   |

---

## 12. Lỗi thường gặp

### Lỗi 1: Hooks không chạy sau khi clone

```bash
git clone https://github.com/team/project.git
cd project
npm install          # Husky tự cài nhờ "prepare" script
git commit -m "test"
# Hook không chạy!

# NGUYÊN NHÂN: Có thể npm install bị skip prepare script
# FIX:
npx husky install    # Cài đặt hooks thủ công

# HOẶC kiểm tra .husky/ có được tạo chưa
ls .husky/
```

### Lỗi 2: lint-staged fix file nhưng không stage lại

```bash
# lint-staged chạy eslint --fix → sửa file
# Nhưng file CHƯA được git add lại!
# Commit chứa code CHƯA được fix

# FIX: lint-staged v10+ tự động stage lại files đã fix
# Đảm bảo dùng version mới nhất:
npm install --save-dev lint-staged@latest
```

### Lỗi 3: commitlint reject message đúng format

```bash
git commit -m "Feat: thêm tính năng"
# ✖ type must be lower-case [type-case]

# NGUYÊN NHÂN: "Feat" viết hoa chữ F
# FIX: viết thường
git commit -m "feat: thêm tính năng"
```

### Lỗi 4: Pre-push hook quá chậm

```bash
# npm test chạy 5 phút mỗi lần push → phiền!

# FIX 1: Chỉ chạy tests liên quan
# .husky/pre-push
npx jest --changedSince=origin/main

# FIX 2: Chạy tests nhanh, để CI chạy full
# .husky/pre-push
npx jest --bail --onlyChanged
# --bail: dừng ngay khi 1 test fail
# --onlyChanged: chỉ test files đã thay đổi
```

### Lỗi 5: Husky không hoạt động trong monorepo

```bash
# Monorepo: husky ở root, nhưng commit từ subdirectory
cd apps/web
git commit -m "feat: ..."
# Husky không chạy!

# FIX: Husky phải cài ở root monorepo
# Trong root package.json:
{
  "scripts": {
    "prepare": "husky"
  }
}

# Đảm bảo .husky/ nằm ở root, không phải subdirectory
```

---

## 13. Câu hỏi phỏng vấn

### Câu 1: Git hooks là gì? Kể tên một vài hooks phổ biến.

**Trả lời:**
Git hooks là scripts tự động chạy tại các sự kiện Git. Hooks phổ biến:

- `pre-commit`: chạy trước commit, dùng để lint/format code
- `commit-msg`: validate format commit message
- `pre-push`: chạy trước push, dùng để chạy tests
- `pre-receive` (server): chạy trên server trước khi nhận push, dùng để enforce policies

Client hooks nằm trong `.git/hooks/`, server hooks trên Git server.

### Câu 2: Tại sao cần Husky? Vấn đề gì hooks thủ công gặp phải?

**Trả lời:**
Hooks thủ công nằm trong `.git/hooks/` - thư mục này KHÔNG được Git track, nên không thể share qua `git clone`. Mỗi developer phải tự cài hooks, dẫn đến không ai làm.

Husky giải quyết bằng cách lưu hooks trong `.husky/` (tracked bởi Git) và tự động cài đặt khi chạy `npm install` (nhờ `prepare` script). Toàn team có cùng hooks.

### Câu 3: lint-staged là gì? Tại sao không lint toàn bộ project?

**Trả lời:**
lint-staged chỉ chạy linter/formatter trên files đã được `git add` (staged), không phải toàn bộ project. Lý do:

- **Tốc độ**: Project lớn có hàng nghìn files, lint tất cả mỗi commit rất chậm
- **Phạm vi**: Chỉ cần kiểm tra code bạn đang commit, không phải code cũ
- **Tránh noise**: Không muốn fix lint errors trong files mình không sửa

### Câu 4: Conventional Commits là gì? Cho ví dụ.

**Trả lời:**
Conventional Commits là quy ước format commit message: `<type>(<scope>): <description>`. Ví dụ:

- `feat: thêm chức năng tìm kiếm`
- `fix(auth): sửa lỗi token hết hạn`
- `docs: cập nhật README`
- `refactor(api): tách route handlers`

Lợi ích: git log dễ đọc, tự động tạo changelog, dễ tìm commit theo loại. Enforce bằng commitlint + Husky commit-msg hook.

### Câu 5: `--no-verify` dùng khi nào? Tại sao không nên lạm dụng?

**Trả lời:**
`--no-verify` bỏ qua tất cả hooks (pre-commit, commit-msg). Nên dùng khi:

- WIP commits trên branch cá nhân (sẽ squash/amend sau)
- Hotfix khẩn cấp cần deploy ngay
- Hook bị lỗi cần fix

Không nên lạm dụng vì: hooks tồn tại để đảm bảo chất lượng code. Nếu ai cũng bypass hooks, mục đích cài hooks trở nên vô nghĩa. Code chất lượng kém sẽ lọt vào codebase.

---

## Tóm tắt

```
Tạo hook thủ công:    .git/hooks/pre-commit (KHÔNG shared)
Dùng Husky:           npx husky init → .husky/pre-commit (SHARED)
lint-staged:          Chỉ lint files đã stage (nhanh)
commitlint:           Validate commit message format
Kết hợp:              Husky + lint-staged + commitlint = setup hoàn chỉnh
Pre-push:             Chạy tests trước khi push
Bypass hooks:         --no-verify (dùng cẩn thận)
Server hooks:         Branch protection rules (không bypass được)
```
