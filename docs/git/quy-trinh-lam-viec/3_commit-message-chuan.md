---
sidebar_position: 3
title: "3. Commit Message chuan — Conventional Commits"
---

# Commit Message chuẩn — Conventional Commits

Commit message là "nhật ký" của dự án. Một commit message tốt giúp bạn (và đồng nghiệp) hiểu **tại sao** thay đổi được thực hiện, không chỉ **thay đổi gì**. Bài này sẽ giúp bạn viết commit message chuyên nghiệp theo chuẩn Conventional Commits — chuẩn được sử dụng bởi hàng nghìn dự án open source và enterprise trên thế giới.

---

## 1. Tại sao commit message quan trọng?

Trước khi học cách viết, hãy hiểu **tại sao** commit message tốt lại quan trọng đến vậy:

### 1.1. Git log — Lịch sử dự án

```bash
# Commit message xấu — đọc không hiểu gì
git log --oneline
# a1b2c3d fix
# d4e5f6g update
# g7h8i9j change stuff
# j0k1l2m WIP
# m3n4o5p done

# Commit message tốt — hiểu ngay dự án đang làm gì
git log --oneline
# a1b2c3d fix: resolve login timeout on slow networks
# d4e5f6g feat: add dark mode toggle to settings page
# g7h8i9j refactor: extract validation logic to shared utils
# j0k1l2m docs: add API authentication guide
# m3n4o5p perf: optimize image loading with lazy load
```

### 1.2. Git blame — Ai viết dòng này và tại sao?

```bash
# git blame cho bạn thấy ai thay đổi dòng code nào, và commit message giải thích tại sao
git blame src/auth/login.ts

# Kết quả:
# a1b2c3d (Alice 2024-01-15) const TIMEOUT = 30000;
#   → Commit: "fix: increase login timeout from 5s to 30s for slow networks"
#   → Bạn hiểu NGAY tại sao timeout là 30000 mà không phải 5000
```

### 1.3. Git bisect — Tìm bug nhanh

```bash
# git bisect dùng binary search để tìm commit gây ra bug
git bisect start
git bisect bad          # Commit hiện tại có bug
git bisect good v1.0.0  # Version 1.0 không có bug

# Git sẽ checkout từng commit — bạn test và báo good/bad
# Nếu commit message rõ ràng, bạn biết ngay commit nào gây bug:
# "feat: add new payment gateway" ← A ha! Bug ở đây!
```

### 1.4. Changelog tự động

```bash
# Với commit message theo chuẩn, tools có thể tự động tạo changelog:
# CHANGELOG.md
# ## v2.1.0 (2024-03-15)
# ### Features
# - Add dark mode toggle to settings page
# - Add export to PDF feature
# ### Bug Fixes
# - Resolve login timeout on slow networks
# - Fix broken image upload on Safari
```

---

## 2. 7 Quy tắc viết commit message tốt (Chris Beams)

Chris Beams tổng hợp 7 quy tắc mà hầu hết developer chuyên nghiệp đều đồng ý:

### Quy tắc 1: Tách subject và body bằng dòng trống

```bash
# SAI: trộn lẫn subject và chi tiết
git commit -m "Fix login bug that happened when user enters wrong password 3 times and the system locks the account but doesnt show error message to user"

# ĐÚNG: tách rõ ràng
git commit -m "fix: show error message when account is locked

When a user enters wrong password 3 times, the account gets locked.
Previously, no error message was shown. Now we display a clear
message explaining the lockout duration."
```

### Quy tắc 2: Giới hạn subject line ~ 50 ký tự (tối đa 72)

```bash
# SAI: quá dài
git commit -m "fix: resolve the issue where the login page crashes when the user enters a very long email address that exceeds 255 characters"

# ĐÚNG: ngắn gọn, đủ ý
git commit -m "fix: prevent crash on oversized email input"
```

### Quy tắc 3: Viết hoa chữ cái đầu (cho style truyền thống)

```bash
# Style truyền thống (viết hoa)
git commit -m "Add search functionality"

# Style Conventional Commits (không viết hoa sau type)
git commit -m "feat: add search functionality"
# ← "add" viết thường vì đã có prefix "feat:"
```

### Quy tắc 4: Không kết thúc subject bằng dấu chấm

```bash
# SAI
git commit -m "feat: add login page."

# ĐÚNG
git commit -m "feat: add login page"
```

### Quy tắc 5: Dùng thể mệnh lệnh (imperative mood)

```bash
# SAI: quá khứ hoặc hiện tại tiến trình
git commit -m "feat: added login page"
git commit -m "feat: adding login page"
git commit -m "fix: fixed the bug"
git commit -m "fix: fixes the bug"

# ĐÚNG: thể mệnh lệnh — như ra lệnh cho code
git commit -m "feat: add login page"
git commit -m "fix: resolve the crash on login"

# Mẹo nhớ: commit message nên hoàn thành câu:
# "If applied, this commit will ___"
# "If applied, this commit will ADD LOGIN PAGE" ← ok!
# "If applied, this commit will ADDED LOGIN PAGE" ← sai ngữ pháp!
```

### Quy tắc 6: Body giải thích WHAT và WHY (không phải HOW)

```bash
# SAI: giải thích HOW (đọc code cũng thấy)
git commit -m "fix: change timeout from 5000 to 30000

Changed the TIMEOUT constant in login.ts from 5000 to 30000.
Also updated the config file."

# ĐÚNG: giải thích WHY
git commit -m "fix: increase login timeout for slow networks

Users on 3G networks reported frequent timeout errors during
login. The previous 5-second timeout was too short for slow
connections. Increased to 30 seconds based on P95 latency data
from production monitoring.

Reported in issue #1234."
```

### Quy tắc 7: Mỗi commit là 1 thay đổi logic

```bash
# SAI: 1 commit làm quá nhiều thứ
git commit -m "fix login, add dark mode, update readme, fix typo"

# ĐÚNG: tách thành nhiều commit
git commit -m "fix: resolve login timeout on slow networks"
git commit -m "feat: add dark mode toggle to settings"
git commit -m "docs: update API authentication guide"
git commit -m "fix: correct typo in error message"
```

---

## 3. Conventional Commits — Chuẩn công nghiệp

### 3.1. Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Chi tiết:**

```
feat(auth): add two-factor authentication
  |    |              |
  |    |              +-- description: mô tả ngắn gọn (imperative mood)
  |    +-- scope: phạm vi thay đổi (optional)
  +-- type: loại thay đổi

Multi-factor authentication is now required for all admin
accounts. Users can choose between TOTP app or SMS.
  |
  +-- body: giải thích chi tiết (optional)

BREAKING CHANGE: Admin accounts must set up 2FA within 7 days
Closes #456
  |
  +-- footer: breaking changes, issue references (optional)
```

### 3.2. Các types

| Type | Mục đích | Ví dụ |
|------|---------|-------|
| **feat** | Tính năng mới | `feat: add user search` |
| **fix** | Sửa lỗi | `fix: resolve login crash` |
| **docs** | Tài liệu | `docs: add API guide` |
| **style** | Format code (không đổi logic) | `style: fix indentation` |
| **refactor** | Tái cấu trúc (không đổi behavior) | `refactor: extract auth utils` |
| **perf** | Cải thiện hiệu năng | `perf: optimize image loading` |
| **test** | Thêm/sửa test | `test: add login unit tests` |
| **build** | Thay đổi build system | `build: update webpack config` |
| **ci** | Thay đổi CI config | `ci: add GitHub Actions workflow` |
| **chore** | Công việc bảo trì | `chore: update dependencies` |
| **revert** | Revert commit trước | `revert: revert "feat: add search"` |

### 3.3. Scope (phạm vi)

Scope là optional nhưng rất hữu ích cho dự án lớn:

```bash
# Không có scope — ok cho dự án nhỏ
git commit -m "feat: add dark mode"

# Có scope — tốt cho dự án lớn
git commit -m "feat(ui): add dark mode toggle"
git commit -m "fix(auth): resolve token refresh issue"
git commit -m "refactor(api): extract common error handler"
git commit -m "test(payment): add integration tests for Stripe"
git commit -m "ci(deploy): add staging environment workflow"

# Scope giúp lọc commit theo module
git log --oneline --grep="auth"
# Chỉ thấy các commit liên quan đến auth
```

### 3.4. Breaking Changes

Khi thay đổi không tương thích ngược (backward incompatible):

```bash
# Cách 1: Dùng dấu ! sau type/scope
git commit -m "feat(api)!: change response format from XML to JSON"

# Cách 2: Dùng BREAKING CHANGE footer
git commit -m "feat(api): change response format to JSON

BREAKING CHANGE: All API responses now return JSON instead of XML.
Clients using XML parsing must update their code.
Migration guide: https://docs.example.com/migrate-to-json"

# Cách 3: Kết hợp cả 2 (không bắt buộc nhưng rõ ràng)
git commit -m "feat(api)!: change response format to JSON

BREAKING CHANGE: API responses are now JSON only. XML deprecated."
```

---

## 4. Ví dụ commit message tốt vs xấu

### Xấu — Không ai hiểu

```bash
git commit -m "fix"
git commit -m "update"
git commit -m "WIP"
git commit -m "done"
git commit -m "changes"
git commit -m "stuff"
git commit -m "asdfgh"
git commit -m "fix bug"
git commit -m "please work"
git commit -m "final fix (for real this time)"
git commit -m "Monday morning commit"
```

### Tốt — Chuyên nghiệp và rõ ràng

```bash
# Feature mới
git commit -m "feat(search): add full-text search with Elasticsearch"
git commit -m "feat(auth): implement OAuth2 login with Google"
git commit -m "feat(export): add CSV export for transaction history"

# Sửa lỗi
git commit -m "fix(cart): prevent duplicate items when clicking fast"
git commit -m "fix(upload): handle file size > 10MB gracefully"
git commit -m "fix(email): correct template rendering on Outlook"

# Refactor
git commit -m "refactor(db): migrate from callbacks to async/await"
git commit -m "refactor(auth): extract JWT logic to shared middleware"

# Performance
git commit -m "perf(images): add WebP conversion and lazy loading"
git commit -m "perf(api): add Redis caching for product listing"

# Tests
git commit -m "test(checkout): add e2e tests for payment flow"
git commit -m "test(auth): increase coverage from 65% to 90%"

# Với body giải thích chi tiết
git commit -m "fix(payment): retry failed transactions up to 3 times

Payment gateway occasionally returns timeout errors during peak
hours. Added exponential backoff retry (1s, 2s, 4s) to handle
transient failures. After 3 retries, show user-friendly error.

Closes #789"
```

---

## 5. Semantic Versioning và Conventional Commits

Conventional Commits liên kết trực tiếp với **Semantic Versioning (SemVer)**:

```
Version: MAJOR.MINOR.PATCH
         |     |     |
         |     |     +-- fix: sửa lỗi → tăng PATCH (1.0.0 → 1.0.1)
         |     +-- feat: tính năng mới → tăng MINOR (1.0.0 → 1.1.0)
         +-- BREAKING CHANGE → tăng MAJOR (1.0.0 → 2.0.0)
```

| Commit type | SemVer | Ví dụ |
|------------|--------|-------|
| `fix:` | PATCH (x.x.1 → x.x.2) | Bug fix, không đổi API |
| `feat:` | MINOR (x.1.x → x.2.0) | Tính năng mới, backward compatible |
| `feat!:` hoặc `BREAKING CHANGE:` | MAJOR (1.x.x → 2.0.0) | Thay đổi không tương thích ngược |
| `docs:`, `style:`, `refactor:`, etc. | Không tăng version | Không ảnh hưởng end user |

```bash
# Ví dụ vòng đời version
v1.0.0   # Release đầu tiên
v1.0.1   # fix: resolve login crash
v1.0.2   # fix: correct date formatting
v1.1.0   # feat: add dark mode
v1.1.1   # fix: dark mode flickering
v1.2.0   # feat: add export to PDF
v2.0.0   # feat!: redesign entire API (breaking change)
```

---

## 6. Tools tự động hóa

### 6.1. Commitlint — Validate commit message

Commitlint kiểm tra commit message có đúng format hay không. Nếu sai -> reject commit.

```bash
# Cài đặt
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

Tạo file cấu hình `commitlint.config.js`:

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type phải là 1 trong các giá trị này
    'type-enum': [
      2,          // 2 = error (0 = disabled, 1 = warning)
      'always',
      [
        'feat', 'fix', 'docs', 'style', 'refactor',
        'perf', 'test', 'build', 'ci', 'chore', 'revert',
      ],
    ],
    // Subject không được trống
    'subject-empty': [2, 'never'],
    // Subject tối đa 72 ký tự
    'subject-max-length': [2, 'always', 72],
    // Type không được trống
    'type-empty': [2, 'never'],
    // Type phải viết thường
    'type-case': [2, 'always', 'lower-case'],
    // Subject không kết thúc bằng dấu chấm
    'subject-full-stop': [2, 'never', '.'],
  },
};
```

### 6.2. Husky — Git Hooks tự động

Husky tự động chạy commitlint (và các tool khác) mỗi khi commit.

```bash
# Cài đặt Husky
npm install --save-dev husky

# Khởi tạo Husky
npx husky init

# Tạo commit-msg hook
# File .husky/commit-msg sẽ được tạo
```

Nội dung file `.husky/commit-msg`:

```bash
#!/usr/bin/env sh

# Chạy commitlint để validate commit message
npx --no -- commitlint --edit "$1"
```

**Kết quả khi commit sai format:**

```bash
git commit -m "fix bug"
# => ERROR: subject may not be empty [subject-empty]
# => ERROR: type may not be empty [type-empty]
# => Commit bị reject!

git commit -m "fix: resolve login crash"
# => Commit thành công!
```

### 6.3. Commitizen — Commit tương tác

Commitizen hướng dẫn bạn viết commit message đúng format qua các bước tương tác.

```bash
# Cài đặt
npm install --save-dev commitizen cz-conventional-changelog

# Cấu hình trong package.json
# "config": {
#   "commitizen": {
#     "path": "cz-conventional-changelog"
#   }
# }
```

```bash
# Thay vì git commit, dùng:
npx cz
# Hoặc nếu cài global: git cz

# Sẽ hiện menu tương tác:
# ? Select the type of change:
#   feat:     A new feature
#   fix:      A bug fix
#   docs:     Documentation only changes
#   ...
#
# ? What is the scope? (optional): auth
# ? Short description: add two-factor authentication
# ? Longer description? (optional): ...
# ? Breaking changes? (optional): ...
# ? Issues closed? (optional): #456
#
# => Commit: "feat(auth): add two-factor authentication"
```

### 6.4. Thiết lập đầy đủ (step-by-step)

```bash
# Bước 1: Cài đặt tất cả packages
npm install --save-dev \
  @commitlint/cli \
  @commitlint/config-conventional \
  husky \
  commitizen \
  cz-conventional-changelog

# Bước 2: Khởi tạo Husky
npx husky init

# Bước 3: Tạo commitlint config
# Tạo file commitlint.config.js (như trên)

# Bước 4: Tạo commit-msg hook
# Nội dung .husky/commit-msg:
# npx --no -- commitlint --edit "$1"

# Bước 5: Cấu hình commitizen trong package.json
# "config": {
#   "commitizen": {
#     "path": "cz-conventional-changelog"
#   }
# }

# Bước 6: Thêm script vào package.json
# "scripts": {
#   "commit": "cz",
#   "prepare": "husky"
# }

# Sử dụng:
npm run commit    # Commit tương tác với commitizen
git commit -m "feat: ..." # Commit thủ công (vẫn được validate)
```

---

## 7. Auto-generate CHANGELOG

Với commit message theo chuẩn, bạn có thể tự động tạo CHANGELOG:

```bash
# Cài đặt standard-version (hoặc release-please)
npm install --save-dev standard-version

# Thêm script
# "scripts": {
#   "release": "standard-version"
# }

# Chạy
npm run release
```

**Kết quả CHANGELOG.md:**

```markdown
# Changelog

## [2.1.0] - 2024-03-15

### Features

* **search:** add full-text search with Elasticsearch ([a1b2c3d])
* **auth:** implement OAuth2 login with Google ([d4e5f6g])

### Bug Fixes

* **cart:** prevent duplicate items when clicking fast ([g7h8i9j])
* **email:** correct template rendering on Outlook ([j0k1l2m])

### Performance Improvements

* **images:** add WebP conversion and lazy loading ([m3n4o5p])

## [2.0.0] - 2024-02-01

### BREAKING CHANGES

* **api:** change response format from XML to JSON ([p6q7r8s])
```

---

## 8. Bảng tóm tắt Types với Emoji (optional)

Nhiều team thích dùng emoji để commit message dễ đọc hơn:

| Type | Emoji | Ví dụ |
|------|-------|-------|
| feat | :sparkles: | `feat: add user search` |
| fix | :bug: | `fix: resolve login crash` |
| docs | :memo: | `docs: update API guide` |
| style | :art: | `style: format code` |
| refactor | :recycle: | `refactor: extract utils` |
| perf | :zap: | `perf: optimize queries` |
| test | :white_check_mark: | `test: add unit tests` |
| build | :package: | `build: update webpack` |
| ci | :construction_worker: | `ci: add deploy pipeline` |
| chore | :wrench: | `chore: update deps` |
| revert | :rewind: | `revert: undo last feat` |

**Lưu ý:** Emoji là optional và tùy team. Nhiều dự án open source lớn KHÔNG dùng emoji vì commitlint mặc định không cho phép. Nếu muốn dùng, cần cấu hình thêm.

---

## 9. Lỗi thường gặp

### Lỗi 1: Commit message quá chung chung

```bash
# SAI — đọc không hiểu gì
git commit -m "fix: fix bug"
git commit -m "feat: add feature"
git commit -m "update: update code"

# ĐÚNG — cụ thể và rõ ràng
git commit -m "fix: prevent crash when email field is empty"
git commit -m "feat: add password strength indicator"
git commit -m "refactor: simplify date formatting logic"
```

### Lỗi 2: 1 commit làm quá nhiều thứ

```bash
# SAI — commit khổng lồ
git add .
git commit -m "feat: add login, register, forgot password, and refactor database"

# ĐÚNG — tách thành nhiều commit nhỏ
git add src/auth/login.ts tests/login.test.ts
git commit -m "feat(auth): add login page"

git add src/auth/register.ts tests/register.test.ts
git commit -m "feat(auth): add registration page"

git add src/auth/forgot-password.ts
git commit -m "feat(auth): add forgot password flow"

git add src/db/
git commit -m "refactor(db): simplify connection pooling"
```

### Lỗi 3: Dùng sai type

```bash
# SAI: dùng feat cho việc sửa lỗi
git commit -m "feat: fix login crash"  # Đây là fix, không phải feat!

# SAI: dùng fix cho refactor
git commit -m "fix: rename variables for clarity"  # Đây là refactor!

# ĐÚNG: chọn type chính xác
git commit -m "fix: resolve login crash on empty password"
git commit -m "refactor: rename variables for clarity"
```

### Lỗi 4: Không thiết lập validation

```bash
# Không có commitlint/husky → team viết tùy ý → CHANGELOG lỗi → khổ sở

# Giải pháp: LUÔN thiết lập commitlint + husky ngay từ đầu dự án
# Chỉ mất 5 phút setup nhưng tiết kiệm hàng trăm giờ về sau
```

### Lỗi 5: Body giải thích HOW thay vì WHY

```bash
# SAI: giải thích HOW (đọc diff cũng thấy)
git commit -m "fix: change MAX_RETRIES from 1 to 3

Changed the constant MAX_RETRIES from 1 to 3 in config.ts line 42."

# ĐÚNG: giải thích WHY
git commit -m "fix: increase payment retry count to 3

Payment gateway has ~2% transient failure rate during peak hours.
Single retry was insufficient — increasing to 3 with exponential
backoff reduces user-visible errors by 95% based on staging tests."
```

---

## 10. Câu hỏi phỏng vấn

### Câu 1: Conventional Commits là gì? Tại sao nên dùng?

**Trả lời:** Conventional Commits là quy ước viết commit message theo format `type(scope): description`. Nên dùng vì: (1) Git log dễ đọc và hiểu, (2) Có thể tự động tạo CHANGELOG, (3) Tự động xác định version mới (SemVer) dựa trên commit types, (4) Giúp team thống nhất cách viết, (5) Dễ tìm kiếm và lọc commits theo type/scope.

### Câu 2: Commit types nào tăng version SemVer?

**Trả lời:** `fix` tăng PATCH (1.0.0 -> 1.0.1), `feat` tăng MINOR (1.0.0 -> 1.1.0), commit có `BREAKING CHANGE` hoặc dấu `!` tăng MAJOR (1.0.0 -> 2.0.0). Các types khác như docs, style, refactor, test, chore không tăng version vì không ảnh hưởng đến end user.

### Câu 3: Giải thích cách thiết lập commit message validation cho dự án?

**Trả lời:** Sử dụng 3 tools: (1) **commitlint** để validate format — cài đặt `@commitlint/cli` và `@commitlint/config-conventional`, tạo file config định nghĩa rules. (2) **Husky** để chạy commitlint tự động — tạo commit-msg hook gọi commitlint. (3) **Commitizen** (optional) để hỗ trợ viết commit tương tác — người dùng chọn type, nhập scope và description qua menu. Tất cả cài đặt như dev dependencies và commit vào repo để tất cả team members dùng chung.

### Câu 4: Viết commit message cho tình huống: bạn fix bug khiến app crash khi user upload file > 5MB trên trang profile.

**Trả lời mẫu:**

```
fix(profile): handle file upload exceeding 5MB size limit

The profile image upload crashed when file size exceeded 5MB due to
missing size validation before upload initiation. Added client-side
file size check with user-friendly error message. Server-side
validation was already in place but the client crash prevented the
request from reaching it.

Closes #1234
```

### Câu 5: Sự khác nhau giữa `refactor` và `fix`? Giữa `style` và `refactor`?

**Trả lời:** `refactor` thay đổi cấu trúc code nhưng **không đổi behavior** — input và output vẫn giống nhau (ví dụ: đổi tên biến, tách function, thay đổi design pattern). `fix` sửa **behavior sai** — trước khi fix thì output sai, sau khi fix thì output đúng. Còn `style` chỉ thay đổi **format** code (indentation, spacing, semicolons) mà **không đổi logic** — ngay cả không thay đổi cấu trúc. `refactor` có thể đổi cấu trúc nhưng không đổi behavior; `style` không đổi cả cấu trúc lẫn behavior.

---

## 11. Tóm tắt

```
+--------------------------------------------------------------+
|  Conventional Commits Format                                 |
|  <type>[scope]: <description>                                |
|                                                              |
|  Types: feat, fix, docs, style, refactor, perf, test,       |
|         build, ci, chore, revert                             |
|                                                              |
|  Breaking: feat!: ... hoặc BREAKING CHANGE: footer           |
|                                                              |
|  SemVer: fix→PATCH, feat→MINOR, breaking→MAJOR              |
|                                                              |
|  Tools: commitlint (validate) + Husky (hooks) +             |
|         Commitizen (interactive) + standard-version          |
|         (auto CHANGELOG)                                     |
+--------------------------------------------------------------+
```
