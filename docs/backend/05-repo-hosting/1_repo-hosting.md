---
sidebar_position: 1
title: "1. Repo Hosting Services"
---

# Repo Hosting Services

---

## Mục lục

- [So sánh](#so-sánh)
- [GitHub (phổ biến nhất)](#github-phổ-biến-nhất)
- [GitLab](#gitlab)
- [Bitbucket](#bitbucket)
- [Self-hosted](#self-hosted)

---

## So sánh

| Service | Free tier | CI/CD | Container Registry | Vendor |
|---------|-----------|-------|---------------------|--------|
| **GitHub** | Unlimited private repo | GitHub Actions | GHCR | Microsoft |
| **GitLab** | Unlimited private repo | GitLab CI | Container Registry | GitLab Inc |
| **Bitbucket** | 5 users | Pipelines | Container Registry | Atlassian |
| **Gitea / Forgejo** | Self-host | Drone/Woodpecker | Optional | Open source |

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

:::tip[Mẹo]

**Lựa chọn năm 2026**:

```
Default: GitHub
├─ Free tier rộng cho mọi project.
├─ AI tooling (Copilot) tốt nhất.
├─ Community + integration ecosystem lớn nhất.
└─ Career: portfolio public dễ visibility.

Khi nào dùng khác?
├─ Self-host bắt buộc → GitLab / Gitea
├─ Team dùng Jira → Bitbucket
├─ Đã GitLab CI mature → giữ GitLab
└─ Edu / non-profit có free pro → tùy
```

Solo dev hoặc startup: **GitHub** không lý do để dùng khác.

:::

:::info[Phân tích]

**Tận dụng GitHub features cho backend project**:

- **Actions**: CI test + deploy.
- **Secrets**: store env vars securely.
- **Releases**: tag version + artifact.
- **Issues + Projects**: track work.
- **Pull Requests**: code review.
- **Discussions**: Q&A community.
- **Wiki**: documentation.
- **Pages**: static site / docs site.
- **Dependabot**: auto update dependency.
- **Code scanning**: detect vulnerability.
- **Sponsorship**: monetize OSS work.

Đa số free cho public repo, generous cho private. Pro plan $4/month
unlock GitHub Copilot Pro.

:::
