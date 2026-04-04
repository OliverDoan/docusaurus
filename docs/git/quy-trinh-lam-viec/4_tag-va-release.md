---
sidebar_position: 4
title: "Tag va Release"
---

# Tag va Release

Khi du an cua ban dat den mot moc quan trong — phien ban dau tien, ban sua loi lon, hoac tinh nang moi — ban can **danh dau** thoi diem do trong lich su Git. Day la luc **tag** phat huy tac dung. Ket hop voi **GitHub Releases**, ban co the dong goi phan mem, viet release notes, va phan phoi den nguoi dung. Bai nay se huong dan ban moi thu tu tag co ban den quy trinh release chuyen nghiep.

---

## 1. Tag la gi?

Tag la mot **"nhan dan" (label)** tren mot commit cu the trong lich su Git. Khac voi branch (thay doi theo thoi gian), tag la **co dinh** — no luon tro den cung mot commit.

```
  main:  --o---o---o---o---o---o---o---o--->
              |         |              |
            v1.0.0    v1.1.0         v2.0.0
              |         |              |
           Tag nay luon tro den commit nay, khong bao gio thay doi
```

**Tai sao can tag?**

| Muc dich | Giai thich |
|----------|-----------|
| **Danh dau release** | "Day la code cua version 1.0.0" |
| **Diem tham chieu** | Quay lai xem code tai bat ky version nao |
| **Trigger CI/CD** | Push tag → tu dong build va deploy |
| **Tao GitHub Release** | Release notes, download binaries |
| **Debugging** | "Bug nay xuat hien tu version nao?" |

---

## 2. Hai loai Tag

Git co 2 loai tag, khac nhau ve luong thong tin luu tru:

### 2.1. Lightweight Tag — Don gian

Lightweight tag chi la **mot con tro** den commit, khong co them thong tin gi.

```bash
# Tao lightweight tag
git tag v1.0.0

# Tag tren 1 commit cu the (khong phai HEAD)
git tag v0.9.0 abc1234
# abc1234 la hash cua commit ban muon tag

# Xem thong tin — chi co hash
git show v1.0.0
# commit abc1234...
# Author: ...
# Date: ...
# (khong co them thong tin gi ngoai commit)
```

### 2.2. Annotated Tag — Day du thong tin

Annotated tag la mot **Git object** rieng biet, chua day du thong tin:

```bash
# Tao annotated tag voi message
git tag -a v1.0.0 -m "Release version 1.0.0 - First stable release"

# Xem thong tin — co nhieu hon
git show v1.0.0
# tag v1.0.0
# Tagger: Alice <alice@example.com>       ← ai tao tag
# Date:   Sat Mar 15 10:30:00 2024        ← tao luc nao
#
# Release version 1.0.0 - First stable release  ← message
#
# commit abc1234...
# Author: ...
```

### 2.3. So sanh

| Dac diem | Lightweight | Annotated |
|----------|------------|-----------|
| **Tagger (nguoi tao)** | Khong luu | Co luu |
| **Ngay tao** | Khong luu | Co luu |
| **Message** | Khong co | Co |
| **Co the ky GPG** | Khong | Co (`git tag -s`) |
| **La Git object** | Khong (chi la pointer) | Co |
| **Khi nao dung** | Tag tam, noi bo | Release chinh thuc |

```bash
# Quy tac chung:
# - Release tags (v1.0.0, v2.0.0) → LUON dung Annotated
# - Tag tam (test, debug) → Co the dung Lightweight
# - Co the ky GPG → Chi Annotated

# Tao annotated tag voi GPG signature (bao mat cao)
git tag -s v1.0.0 -m "Signed release v1.0.0"
# Can co GPG key da cau hinh
```

---

## 3. Cac thao tac voi Tag

### 3.1. Tao tag

```bash
# --- Lightweight tag ---
git tag v1.0.0                          # Tag tai HEAD hien tai
git tag v0.9.0 abc1234                  # Tag tai commit cu the

# --- Annotated tag ---
git tag -a v1.0.0 -m "First release"   # Tag tai HEAD voi message
git tag -a v1.0.0 abc1234 -m "Release" # Tag tai commit cu the

# --- Tag voi nhieu dong message ---
git tag -a v2.0.0 -m "Release v2.0.0

Major changes:
- Redesigned API
- New authentication system
- Improved performance by 50%

Breaking changes:
- API v1 endpoints removed
- Old auth tokens invalidated"
```

### 3.2. Liet ke tags

```bash
# Liet ke tat ca tags
git tag
# v1.0.0
# v1.0.1
# v1.1.0
# v2.0.0

# Loc theo pattern
git tag -l "v1.*"
# v1.0.0
# v1.0.1
# v1.1.0

git tag -l "v2.*"
# v2.0.0

# Sap xep theo version (khong phai alphabet)
git tag -l --sort=-version:refname
# v2.0.0
# v1.1.0
# v1.0.1
# v1.0.0

# Xem tag voi thong tin commit
git tag -l -n1
# v1.0.0   First stable release
# v1.0.1   Hotfix: payment crash
# v1.1.0   Add dark mode feature
# v2.0.0   Major redesign
```

### 3.3. Push tags len remote

```bash
# QUAN TRONG: git push KHONG tu dong push tags!
# Ban phai push tags rieng:

# Push 1 tag cu the
git push origin v1.0.0

# Push TAT CA tags cung luc
git push origin --tags

# Push chi annotated tags (bo qua lightweight)
git push origin --follow-tags
```

**Meo:** Cau hinh Git tu dong push annotated tags:

```bash
# Tu dong push annotated tags khi git push
git config --global push.followTags true

# Sau do chi can:
git push
# Se push ca commits VA annotated tags
```

### 3.4. Xoa tag

```bash
# Xoa tag local
git tag -d v1.0.0
# Deleted tag 'v1.0.0'

# Xoa tag tren remote
git push origin --delete v1.0.0
# Hoac:
git push origin :refs/tags/v1.0.0

# Xoa va tao lai tag (point den commit khac)
git tag -d v1.0.0
git tag -a v1.0.0 new-commit-hash -m "Corrected release"
git push origin --delete v1.0.0
git push origin v1.0.0
```

**Canh bao:** Xoa tag da public la **rat nguy hiem**! Neu nguoi khac da pull tag do, ho se co tag cu tro den commit cu. Chi xoa tag khi thuc su can thiet va thong bao team.

### 3.5. Checkout code tai 1 tag

```bash
# Xem code tai version cu the
git checkout v1.0.0
# Luu y: ban dang o "detached HEAD" state
# Khong nen commit truc tiep o day

# Neu muon lam viec tu 1 tag cu, tao branch moi
git checkout -b hotfix/v1.0.1 v1.0.0
# Bay gio ban co branch moi bat dau tu v1.0.0

# So sanh 2 tags
git diff v1.0.0 v2.0.0
git diff v1.0.0 v2.0.0 --stat  # Chi xem ten file thay doi

# Log giua 2 tags
git log v1.0.0..v2.0.0 --oneline
# Thay tat ca commits giua 2 versions
```

---

## 4. Semantic Versioning (SemVer)

### 4.1. Format

```
MAJOR.MINOR.PATCH
  |     |     |
  |     |     +-- Sua loi, khong doi API     (backward compatible bug fix)
  |     +-- Them tinh nang moi, khong doi API (backward compatible feature)
  +-- Thay doi khong tuong thich nguoc        (breaking changes)

Vi du: 2.4.1
       | | |
       | | +-- Patch: lan sua loi thu 1
       | +-- Minor: lan them tinh nang thu 4
       +-- Major: lan breaking change thu 2
```

### 4.2. Khi nao tang version nao?

| Thay doi | Tang | Vi du | Giai thich |
|----------|------|-------|-----------|
| Sua loi nho | PATCH | 1.0.0 → 1.0.1 | Fix bug, khong doi API |
| Them tinh nang moi | MINOR | 1.0.0 → 1.1.0 | Them endpoint moi, them option moi |
| Thay doi breaking | MAJOR | 1.0.0 → 2.0.0 | Xoa endpoint, doi format response |
| Sua nhieu loi | PATCH | 1.2.3 → 1.2.4 | Van la patch du sua nhieu bug |
| Them tinh nang + sua loi | MINOR | 1.2.3 → 1.3.0 | MINOR "thang" PATCH, reset PATCH ve 0 |
| Breaking + tinh nang moi | MAJOR | 1.2.3 → 2.0.0 | MAJOR "thang" tat ca, reset MINOR va PATCH ve 0 |

### 4.3. Pre-release versions

Truoc khi release chinh thuc, ban co the phat hanh ban pre-release:

```bash
# Alpha — giai doan phat trien som, nhieu bug
git tag -a v2.0.0-alpha.1 -m "Alpha 1 of version 2.0"
git tag -a v2.0.0-alpha.2 -m "Alpha 2 — fixed major crashes"

# Beta — tinh nang co ban hoan thanh, con bug
git tag -a v2.0.0-beta.1 -m "Beta 1 — feature complete"
git tag -a v2.0.0-beta.2 -m "Beta 2 — performance improvements"

# Release Candidate (RC) — gan nhu san sang, chi fix bug
git tag -a v2.0.0-rc.1 -m "Release candidate 1"
git tag -a v2.0.0-rc.2 -m "Release candidate 2 — final fixes"

# Release chinh thuc
git tag -a v2.0.0 -m "Version 2.0.0 — stable release"
```

```
Thu tu pre-release:
alpha.1 < alpha.2 < beta.1 < beta.2 < rc.1 < rc.2 < release

Vong doi day du:
v2.0.0-alpha.1 → v2.0.0-alpha.2 → v2.0.0-beta.1 →
v2.0.0-beta.2 → v2.0.0-rc.1 → v2.0.0-rc.2 → v2.0.0
```

### 4.4. Build metadata

```bash
# Them thong tin build (khong anh huong version ordering)
git tag -a v1.0.0+build.123 -m "Build 123"
git tag -a v1.0.0+20240315 -m "Build date March 15"

# v1.0.0+build.123 == v1.0.0 (cung version, khac build)
```

---

## 5. GitHub Releases

### 5.1. Release la gi?

GitHub Release = Tag + Release Notes + Download Files. No la cach de **phan phoi phan mem** den nguoi dung.

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

### 5.2. Tao Release bang GitHub CLI

```bash
# Buoc 1: Tao tag (neu chua co)
git tag -a v2.0.0 -m "Version 2.0.0"
git push origin v2.0.0

# Buoc 2: Tao release tu tag
gh release create v2.0.0 \
  --title "Version 2.0.0" \
  --notes "## What's New
- Redesigned API
- New auth system
- Dark mode

## Bug Fixes
- Fixed login crash
- Fixed image upload on Safari"

# Buoc 3: Upload assets (binaries, archives)
gh release upload v2.0.0 ./dist/app-linux.tar.gz
gh release upload v2.0.0 ./dist/app-macos.dmg
gh release upload v2.0.0 ./dist/app-windows.exe
```

### 5.3. Auto-generate Release Notes

GitHub co the tu dong tao release notes tu cac PR da merge:

```bash
# Tu dong tao release notes tu PRs
gh release create v2.0.0 --generate-notes

# Ket qua tu dong:
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

**Cau hinh auto-generate** voi file `.github/release.yml`:

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

### 5.4. Pre-release va Draft

```bash
# Tao pre-release (hien thi bang mau vang, khong phai latest)
gh release create v2.0.0-beta.1 \
  --title "v2.0.0 Beta 1" \
  --prerelease \
  --notes "Beta release for testing"

# Tao draft release (chi team thay, chua public)
gh release create v2.0.0 \
  --title "Version 2.0.0" \
  --draft \
  --notes "Draft — do not publish yet"

# Publish draft khi san sang
gh release edit v2.0.0 --draft=false
```

### 5.5. Cac thao tac khac voi GitHub CLI

```bash
# Liet ke tat ca releases
gh release list

# Xem chi tiet 1 release
gh release view v2.0.0

# Xoa release (giu lai tag)
gh release delete v2.0.0

# Xoa release VA tag
gh release delete v2.0.0 --cleanup-tag

# Download assets tu release
gh release download v2.0.0

# Sua release notes
gh release edit v2.0.0 --notes "Updated release notes"
```

---

## 6. Workflow day du: Tu commit den Release

```
  Developer workflow:
  ==================

  1. Code & commit
     git add .
     git commit -m "feat: add new feature"
         |
  2. Merge vao main (qua PR)
     git checkout main
     git merge feature/xxx
         |
  3. Tao tag
     git tag -a v1.2.0 -m "Release v1.2.0"
         |
  4. Push tag
     git push origin v1.2.0
         |
  5. CI/CD triggered (tu dong)
     - Build
     - Test
     - Create artifacts
         |
  6. GitHub Release
     gh release create v1.2.0 --generate-notes
     gh release upload v1.2.0 ./dist/*
         |
  7. Deploy (tu dong hoac thu cong)
     - Staging → Production
```

**Script tu dong hoa:**

```bash
#!/bin/bash
# release.sh — Script tao release

# Kiem tra tham so
VERSION=$1
if [ -z "$VERSION" ]; then
  echo "Su dung: ./release.sh v1.2.0"
  exit 1
fi

echo "Tao release $VERSION..."

# Dam bao dang o main va cap nhat
git checkout main
git pull origin main

# Tao annotated tag
git tag -a "$VERSION" -m "Release $VERSION"

# Push tag
git push origin "$VERSION"

# Tao GitHub Release voi auto-generated notes
gh release create "$VERSION" \
  --title "Release $VERSION" \
  --generate-notes

echo "Release $VERSION da duoc tao thanh cong!"
echo "Xem tai: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/releases/tag/$VERSION"
```

---

## 7. Versioning strategies cho different project types

| Loai du an | Strategy | Vi du |
|-----------|----------|-------|
| **Library/SDK** | Strict SemVer | v1.0.0, v1.1.0, v2.0.0 |
| **Web App (SaaS)** | Date-based hoac SemVer | v2024.03.15 hoac v3.2.1 |
| **Mobile App** | SemVer + build number | v2.1.0 (build 142) |
| **API** | URL versioning + SemVer | /api/v2/ + tag v2.3.1 |
| **Monorepo** | Per-package versioning | @mylib/core@1.2.0, @mylib/ui@3.0.0 |
| **Game** | Marketing version | v1.0 "Season 3 Update" |

```bash
# Date-based versioning (CalVer)
git tag -a v2024.03.15 -m "Release March 15, 2024"
git tag -a v2024.03.15.2 -m "Second release of the day"

# Mobile app voi build number
git tag -a v2.1.0-build.142 -m "Build 142 submitted to App Store"

# Monorepo — tag per package
git tag -a core@1.2.0 -m "Core package v1.2.0"
git tag -a ui@3.0.0 -m "UI package v3.0.0"
```

---

## 8. Loi thuong gap

### Loi 1: Quen push tags

```bash
# Tao tag nhung quen push → tag chi o local, team khong thay
git tag -a v1.0.0 -m "Release"
git push origin main  # Chi push commits, KHONG push tag!

# DUNG: push tag rieng
git push origin v1.0.0
# Hoac push tat ca tags
git push origin --tags

# Tot nhat: cau hinh auto push
git config --global push.followTags true
```

### Loi 2: Tag sai commit

```bash
# Tag nhung nhan ra sai commit → can sua

# Buoc 1: Xoa tag cu (local + remote)
git tag -d v1.0.0
git push origin --delete v1.0.0

# Buoc 2: Tao tag moi tai commit dung
git tag -a v1.0.0 correct-commit-hash -m "Release v1.0.0"
git push origin v1.0.0

# CANH BAO: Neu nguoi khac da pull tag cu, ho can:
git fetch --tags --force
```

### Loi 3: Khong dung annotated tag cho release

```bash
# SAI: dung lightweight tag cho release
git tag v1.0.0  # Khong co thong tin ai tao, khi nao

# DUNG: dung annotated tag cho release
git tag -a v1.0.0 -m "Release v1.0.0 — first stable release"
# Co: tagger, date, message, co the GPG sign
```

### Loi 4: Version numbering khong nhat quan

```bash
# SAI: nhay lung tung
v1.0.0 → v1.0.2 → v1.0.5 → v1.1.3 → v3.0.0

# DUNG: tang tuan tu theo SemVer
v1.0.0 → v1.0.1 → v1.0.2 → v1.1.0 → v1.2.0 → v2.0.0

# Luu y: MINOR tang thi PATCH reset ve 0
# v1.2.3 + feat moi = v1.3.0 (KHONG PHAI v1.3.3)
```

### Loi 5: Khong tao release notes

```bash
# Tag ma khong co release notes → nguoi dung khong biet thay doi gi

# LUON tao release notes, it nhat voi --generate-notes
gh release create v1.0.0 --generate-notes

# Tot hon: viet release notes cu the voi:
# - What's New (tinh nang moi)
# - Bug Fixes (loi da sua)
# - Breaking Changes (thay doi khong tuong thich)
# - Migration Guide (huong dan nang cap)
```

---

## 9. Cau hoi phong van

### Cau 1: Lightweight tag khac annotated tag nhu the nao? Khi nao dung loai nao?

**Tra loi:** Lightweight tag chi la mot pointer den commit, khong luu them thong tin nao. Annotated tag la mot Git object rieng biet, luu ten nguoi tao (tagger), ngay tao, message, va co the ky GPG. Dung annotated tag cho release chinh thuc vi can ghi lai ai tao, khi nao, va tai sao. Lightweight tag dung cho tag tam thoi hoac noi bo.

### Cau 2: Semantic Versioning la gi? Khi nao tang MAJOR, MINOR, PATCH?

**Tra loi:** SemVer la quy uoc dat ten version theo format MAJOR.MINOR.PATCH. Tang PATCH khi sua loi ma khong doi API (backward compatible). Tang MINOR khi them tinh nang moi ma van backward compatible. Tang MAJOR khi co breaking changes — thay doi khong tuong thich nguoc. Khi tang MINOR thi PATCH reset ve 0, khi tang MAJOR thi ca MINOR va PATCH reset ve 0.

### Cau 3: Lam sao de tu dong tao release moi khi push tag?

**Tra loi:** Dung GitHub Actions voi trigger `on: push: tags`. Khi push tag moi, workflow se tu dong: (1) Build ung dung, (2) Chay tests, (3) Tao artifacts (binaries), (4) Tao GitHub Release voi `gh release create` hoac action nhu `softprops/action-gh-release`, (5) Upload artifacts vao release. Ket hop voi Conventional Commits va standard-version, toan bo quy trinh tu commit → tag → release → deploy co the tu dong hoa.

### Cau 4: Pre-release version dung nhu the nao? Cho vi du.

**Tra loi:** Pre-release version su dung dash sau version chinh: `v2.0.0-alpha.1`, `v2.0.0-beta.1`, `v2.0.0-rc.1`. Thu tu: alpha (phat trien som, nhieu bug) → beta (feature complete, con bug) → rc (Release Candidate, gan san sang) → stable release. Tren GitHub, tao pre-release voi flag `--prerelease` de hien thi bang mau vang va khong duoc coi la "latest release". Dieu nay cho phep early adopters test truoc ma khong anh huong nguoi dung binh thuong.

### Cau 5: Team ban dung monorepo voi 3 packages. Lam sao quan ly versioning?

**Tra loi:** Co 2 cach: (1) **Independent versioning** — moi package co version rieng, tag dang `@package-name@1.2.0`. Dung khi cac packages phat trien doc lap, vi du `@mylib/core@1.2.0` va `@mylib/ui@3.0.0`. (2) **Fixed versioning** — tat ca packages dung chung 1 version, tag dang `v1.2.0`. Don gian hon nhung bat buoc tat ca packages release cung luc. Tools nhu Lerna, Changesets, hoac Nx ho tro ca 2 cach. Pho bien nhat la independent versioning vi linh hoat hon.

---

## 10. Tom tat

```
+--------------------------------------------------------------+
|  Git Tag — Danh dau diem quan trong trong lich su            |
|  - Lightweight: chi la pointer (dung cho tag tam)            |
|  - Annotated: day du thong tin (dung cho release)            |
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
