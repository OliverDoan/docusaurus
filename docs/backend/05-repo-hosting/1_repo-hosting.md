---
sidebar_position: 1
title: "Repo Hosting Services"
---

# Repo Hosting Services

Sau khi biết Git, bạn cần một nơi trên mạng để lưu trữ và chia sẻ code, gọi là dịch vụ repo hosting. Bài này so sánh các lựa chọn phổ biến như GitHub, GitLab, Bitbucket và giải pháp tự host (Gitea/Forgejo), kèm ưu điểm và trường hợp dùng phù hợp, giúp bạn chọn được nền tảng hợp lý cho dự án và làm việc nhóm.

---

## Mục lục

- [So sánh](#so-sánh)
- [GitHub (phổ biến nhất)](#github-phổ-biến-nhất)
- [GitLab](#gitlab)
- [Bitbucket](#bitbucket)
- [Self-hosted](#self-hosted)

---

## So sánh

| Service             | Free tier              | CI/CD            | Container Registry | Vendor      |
| ------------------- | ---------------------- | ---------------- | ------------------ | ----------- |
| **GitHub**          | Unlimited private repo | GitHub Actions   | GHCR               | Microsoft   |
| **GitLab**          | Unlimited private repo | GitLab CI        | Container Registry | GitLab Inc  |
| **Bitbucket**       | 5 users                | Pipelines        | Container Registry | Atlassian   |
| **Gitea / Forgejo** | Self-host              | Drone/Woodpecker | Optional           | Open source |

---

## GitHub (phổ biến nhất)

**Lựa chọn mặc định 2026**.

Lợi ích:

- **Cộng đồng huge** — phần lớn open source ở đây.
- **GitHub Actions** — CI/CD built-in, free 2000 min/month.
- **GitHub Copilot** — AI code assistant.
- **GitHub Pages** — host static site free.
- **Codespaces** — dev environment trên cloud.
- **GHCR** — container registry.
- **Security**: Dependabot, secret scanning, code scanning.

Workflow:

```bash
# Tạo repo qua web hoặc CLI
gh repo create my-app --private
git remote add origin https://github.com/user/my-app.git
git push -u origin main
```

`gh` CLI handle PR, issue, release từ terminal.

---

## GitLab

Cạnh tranh chính với GitHub.

Đặc biệt:

- **Self-hostable** — Community Edition miễn phí.
- **GitLab CI** — pipeline mạnh, mature.
- **Issue tracking** + **wiki** + **container registry** + **registry packages** all-in-one.
- **DevOps platform** — full lifecycle.

Phù hợp:

- Team muốn self-host (control data).
- Enterprise cần on-premise.
- Đã dùng GitLab CI từ trước.

---

## Bitbucket

Atlassian — tích hợp **Jira**, **Confluence**.

Phù hợp:

- Team dùng Jira sâu.
- Workflow Atlassian-centric.
- Doanh nghiệp đã trong Atlassian ecosystem.

Job market nhỏ hơn GitHub đáng kể.

---

## Self-hosted

**Gitea** / **Forgejo** (fork community-led):

- Lightweight, dễ cài.
- Open source, miễn phí.
- Tương thích Git protocol.

Phù hợp:

- Privacy / compliance bắt buộc on-premise.
- Cost-saving với team lớn.
- Air-gapped environment.

Trade-off: phải tự maintain — security update, backup, scaling.
