---
sidebar_position: 5
title: "5. Git workflow voi Claude Code"
---

# Git workflow với Claude Code

Claude Code tích hợp git trực tiếp. Commit, tạo PR, review code — tất cả bằng prompt.

---

## 1. Commit

```
> Commit những thay đổi vừa rồi
```

Claude Code sẽ:
1. Chạy `git status` / `git diff`
2. Phân tích thay đổi
3. Viết commit message phù hợp
4. Stage files liên quan
5. Tạo commit

**Tip**: Claude Code viết commit message theo Conventional Commits (`feat:`, `fix:`, `refactor:`...).

### Commit với message cụ thể

```
> Commit với message "fix: handle null user in dashboard"
```

---

## 2. Tạo Pull Request

```
> Tạo PR cho branch hiện tại
```

Claude Code sẽ:
1. Push branch lên remote
2. Phân tích tất cả commits
3. Viết title + description
4. Tạo PR bằng `gh pr create`
5. Trả về link PR

### PR với yêu cầu cụ thể

```
> Tạo PR. Title ngắn gọn.
  Description liệt kê thay đổi chính và cách test.
```

---

## 3. Review PR

```
> Review PR #42, chỉ ra vấn đề về code quality và security
```

```bash
# Hoặc pipe PR diff
gh pr diff 42 | claude "review PR này, liệt kê vấn đề"
```

---

## 4. Xem thay đổi trước khi commit

```
> Show git status và diff, giải thích những gì đã thay đổi

> Có thay đổi nào nên chia thành commits riêng không?
```

---

## 5. Quản lý branch

```
> Tạo branch mới "feature/search-products" và switch sang

> Branch hiện tại khác main những gì?

> Rebase branch hiện tại lên main
```

---

## 6. Workflow đầy đủ

```
# 1. Tạo branch
> Tạo branch feature/add-search

# 2. Implement feature (nhiều prompts)
> Thêm search bar vào trang Products...
> Thêm API endpoint search...

# 3. Test
> Chạy test và fix lỗi

# 4. Commit
> Commit thay đổi

# 5. Tạo PR
> Tạo PR cho feature này
```

---

## Tips

| Tip | Giải thích |
|-----|-----------|
| Commit thường xuyên | Sau mỗi task nhỏ hoàn thành |
| Review diff trước commit | "Show diff" trước khi "commit" |
| 1 PR = 1 feature | Đừng gộp nhiều feature |
| Để Claude viết message | Nó viết Conventional Commits tốt |
| Review PR bằng Claude | Nhanh hơn đọc thủ công |
