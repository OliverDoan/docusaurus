---
sidebar_position: 1
title: "Git la gi? Tai sao phai hoc Git?"
---

# Git la gi? Tai sao phai hoc Git?

Ban da bao gio gap tinh huong nay chua:

```
bao-cao-final.docx
bao-cao-final-v2.docx
bao-cao-final-v2-sua-lai.docx
bao-cao-final-THIET-LA-CUOI-CUNG.docx
bao-cao-final-CUOI-CUNG-THAT-SU.docx
```

Neu co, chuc mung ban — ban dang "quan ly phien ban" bang tay. Va do chinh la ly do Git ra doi.

---

## 1. Version Control System (VCS) la gi?

**Version Control System** (He thong quan ly phien ban) la cong cu giup ban:

- **Luu lai lich su** moi thay doi cua du an
- **Quay lai** bat ky thoi diem nao trong qua khu
- **Lam viec nhom** ma khong ghi de len code cua nhau
- **Theo doi** ai da thay doi gi, khi nao, va tai sao

### Tai sao can quan ly phien ban?

Hay tuong tuong ban dang viet mot ung dung. Hom nay code chay tot, nhung sang mai ban sua mot tinh nang va bat ngo... moi thu hong het. Khong co VCS, ban phai nho "minh da sua gi" va co gang undo bang tri nho. Voi VCS, ban chi can:

```bash
# Quay lai phien ban hom qua — don gian nhu vay
git checkout abc1234
```

### Khong chi danh cho code

VCS khong chi dung cho lap trinh. Bat ky ai lam viec voi file thay doi theo thoi gian deu can:

| Linh vuc | Dung VCS de lam gi |
|----------|-------------------|
| Developer | Quan ly source code, lam viec nhom |
| Designer | Theo doi thay doi file thiet ke |
| Data Scientist | Version data pipelines, notebooks |
| DevOps | Quan ly infrastructure as code |
| Technical Writer | Theo doi thay doi tai lieu |

---

## 2. Lich su phat trien: Tu copy thu cong den Git

### Giai doan 1: Copy thu cong (truoc 1990s)

```
project/
project-backup/
project-backup-2/
project-cu-dung-xoa/
```

**Van de:** Khong biet phien ban nao moi nhat, khong the so sanh su khac biet, mat file la mat luon.

### Giai doan 2: Centralized VCS — CVS, SVN (1990s-2000s)

CVS (1990) va SVN/Subversion (2000) ra doi voi y tuong: **mot server trung tam** luu toan bo lich su.

```
               +------------------+
               |   SVN Server     |
               |  (Central Repo)  |
               +--------+---------+
                       |
          +------------+------------+
          |            |            |
     Developer A  Developer B  Developer C
     (working     (working     (working
      copy)        copy)        copy)
```

**Uu diem:** Tot hon copy thu cong nhieu.
**Nhuoc diem:** Server chet = ca team dung lam viec. Khong co mang = khong commit duoc.

### Giai doan 3: Distributed VCS — Git (2005)

**Linus Torvalds** — nguoi tao ra Linux — da tao Git vao nam 2005 vi bat man voi cac VCS hien tai. Ong can mot he thong:

- **Cuc nhanh** (Linux kernel co hang trieu dong code)
- **Phan tan** (hang ngan developer tren toan the gioi)
- **Ho tro branching** manh me
- **Dam bao toan ven du lieu**

Ket qua: Git ra doi va nhanh chong tro thanh **VCS pho bien nhat the gioi**.

```
Thoi gian:  1990      2000      2005      Hien tai
            |---------|---------|---------|
            CVS       SVN       Git       Git thong tri
            (Centralized)       (Distributed)
```

---

## 3. Centralized vs Distributed VCS

Day la su khac biet cot loi giua SVN va Git:

### ASCII Diagram: Centralized VCS

```
                +------------------+
                |   CENTRAL SERVER |
                |   (toan bo       |
                |    lich su)      |
                +--------+---------+
                         |
           +-------------+-------------+
           |             |             |
      +----+----+   +----+----+   +----+----+
      |  Dev A  |   |  Dev B  |   |  Dev C  |
      | (chi co |   | (chi co |   | (chi co |
      |  ban    |   |  ban    |   |  ban    |
      |  moi    |   |  moi    |   |  moi    |
      |  nhat)  |   |  nhat)  |   |  nhat)  |
      +---------+   +---------+   +---------+

      --> Moi thao tac deu can ket noi server
      --> Server chet = team dung hoat dong
```

### ASCII Diagram: Distributed VCS (Git)

```
      +---------+        +---------+        +---------+
      |  Dev A  |        |  Dev B  |        |  Dev C  |
      | (FULL   |<------>| (FULL   |<------>| (FULL   |
      |  REPO   |        |  REPO   |        |  REPO   |
      |  + lich |        |  + lich |        |  + lich |
      |  su)    |        |  su)    |        |  su)    |
      +----+----+        +----+----+        +----+----+
           |                  |                  |
           +------------------+------------------+
                              |
                    +---------+---------+
                    |   REMOTE SERVER   |
                    |   (GitHub, etc.)  |
                    |   (tuy chon,      |
                    |    khong bat buoc)|
                    +-------------------+

      --> Moi developer co BAN SAO DAY DU
      --> Lam viec offline hoan toan duoc
      --> Server chet? Van lam viec binh thuong
```

### Bang so sanh chi tiet

| Tieu chi | Centralized (SVN) | Distributed (Git) |
|----------|-------------------|-------------------|
| Noi luu lich su | Chi tren server | Moi may deu co full history |
| Lam viec offline | Khong the | Hoan toan duoc |
| Toc do commit | Cham (qua mang) | Cuc nhanh (local) |
| Branching | Cham, nang ne | Nhanh, nhe |
| Single point of failure | Co (server) | Khong |
| Backup tu nhien | Khong | Co (moi clone la 1 backup) |
| Hoc su dung | De hon | Kho hon mot chut |
| Phu hop | Team nho, du an don gian | Moi quy mo du an |

---

## 4. Git vs SVN — So sanh cu the

### Toc do

```bash
# SVN: Moi commit phai gui qua mang den server
svn commit -m "sua loi"  # Mat vai giay den vai phut

# Git: Commit ngay tren may local
git commit -m "sua loi"  # Gan nhu tuc thi (< 1 giay)
```

### Branching

```bash
# SVN: Tao branch = copy toan bo thu muc (cham)
svn copy trunk branches/feature-login  # Copy that su tren server

# Git: Tao branch = tao 1 pointer 41 bytes (cuc nhanh)
git branch feature-login  # Tuc thi, chi tao 1 file nho
```

### Lam viec offline

```bash
# SVN: Khong co mang? Khong lam duoc gi nhieu
svn commit  # LOI: khong ket noi duoc server
svn log     # LOI: khong ket noi duoc server

# Git: Khong co mang? Van lam viec binh thuong
git commit -m "feature moi"  # OK — commit local
git log                       # OK — doc lich su local
git branch feature-x          # OK — tao branch local
git diff                      # OK — so sanh thay doi
# Chi can mang khi push/pull voi remote
```

### Bang so sanh tong hop

| Tieu chi | SVN | Git |
|----------|-----|-----|
| Mo hinh | Centralized | Distributed |
| Toc do | Cham (mang) | Nhanh (local) |
| Branch | Nang, copy thu muc | Nhe, chi la pointer |
| Merge | Kho, hay conflict | Thong minh hon |
| Offline | Rat han che | Day du |
| Hoc | De hon | Kho hon ban dau |
| Disk | It hon (chi co latest) | Nhieu hon (full history) |
| Phuc hoi | Phu thuoc server | Moi clone la backup |

---

## 5. Tai sao Git thong tri?

### 5.1 Toc do vuot troi

Git lam hau het moi thu tren may local, nen:
- **Commit:** tuc thi
- **Xem log:** tuc thi
- **Tao branch:** tuc thi
- **So sanh diff:** tuc thi

Chi co `push` va `pull` la can mang.

### 5.2 Branching va Merging manh me

Git duoc thiet ke tu dau de branching re va nhanh:

```bash
# Tao branch moi va chuyen sang
git checkout -b feature/login

# Lam viec, commit nhieu lan...
git commit -m "them form login"
git commit -m "them validation"

# Merge ve main
git checkout main
git merge feature/login

# Xoa branch da merge
git branch -d feature/login
```

Trong SVN, branching la "viec lon" — can suy nghi truoc khi lam.
Trong Git, branching la "viec nho" — tao branch cho moi tinh nang, moi bug fix.

### 5.3 Lam viec offline

Tren may bay? Trong quan cafe mat mang? Van commit, tao branch, xem log binh thuong.

### 5.4 Cong dong va he sinh thai khong lo

- **GitHub:** 100+ trieu developer
- **GitLab, Bitbucket:** Cac nen tang lon khac
- **CI/CD:** Hau het pipeline deu tich hop Git
- **Moi ngon ngu/framework** deu co `.gitignore` template

### 5.5 Mien phi va open source

Git la phan mem **mien phi**, **ma nguon mo**, phat trien boi cong dong toan cau.

---

## 6. Git KHONG PHAI la GitHub

Day la nham lan **pho bien nhat** cua nguoi moi:

```
+-------------------+        +-------------------+
|       GIT         |        |      GITHUB       |
+-------------------+        +-------------------+
| Phan mem          |        | Dich vu web       |
| Cai tren may      |        | Truy cap qua      |
|   cua ban         |        |   trinh duyet     |
| Quan ly phien ban |        | Luu tru remote    |
|   LOCAL           |        |   repository      |
| Mien phi, open    |        | Co ban mien phi,  |
|   source          |        |   co goi tra phi  |
| Chay bang dong    |        | Giao dien web +   |
|   lenh (CLI)      |        |   nhieu tinh nang |
| Khong can mang    |        | Can mang de truy  |
|                   |        |   cap             |
+-------------------+        +-------------------+
        |                            |
        | Git la CONG CU             | GitHub la DICH VU
        | (nhu Word)                 | (nhu Google Docs)
        +----------------------------+
```

### Cac dich vu tuong tu GitHub

| Dich vu | Dac diem |
|---------|----------|
| **GitHub** | Pho bien nhat, cong dong lon, GitHub Actions |
| **GitLab** | Self-hosted, CI/CD tich hop, DevOps platform |
| **Bitbucket** | Tich hop Jira/Atlassian, free private repos |
| **Azure DevOps** | Tich hop he sinh thai Microsoft |

**Luu y:** Ban co the dung Git ma **khong can bat ky dich vu nao** o tren. Git hoat dong hoan toan tren may local cua ban.

---

## 7. Ai can hoc Git?

### Developer (bat buoc)

```
99% cong viec lap trinh yeu cau Git.
Khong biet Git = Khong di lam duoc.
```

Dung, khong phai noi qua. Hau het moi cong ty, tu startup den tap doan, deu dung Git.

### Cac vai tro khac

| Vai tro | Tai sao can Git |
|---------|-----------------|
| **Frontend Dev** | Quan ly code React/Vue/Angular, lam viec nhom |
| **Backend Dev** | Quan ly API code, database migrations |
| **DevOps** | Infrastructure as Code (Terraform, K8s) |
| **Data Scientist** | Version notebooks, data pipelines |
| **Mobile Dev** | Quan ly code iOS/Android |
| **Designer** | Version design tokens, design systems |
| **Technical Writer** | Quan ly documentation (nhu trang nay!) |
| **QA Engineer** | Quan ly test scripts, test data |

---

## 8. Cach Git luu du lieu

Mot diem quan trong ma nhieu nguoi hieu sai: **Git luu snapshot, khong phai diff**.

### Cach khac (SVN): Luu su thay doi (delta)

```
Version 1:  [File A v1] [File B v1] [File C v1]
                |            |
Version 2:  [delta A2]   [delta B2]  (chi luu phan thay doi)
                |
Version 3:  [delta A3]               (chi luu phan thay doi)
```

### Cach cua Git: Luu snapshot

```
Commit 1:  [File A v1] [File B v1] [File C v1]
                                        |
Commit 2:  [File A v2] [File B v2] [File C v1] <-- link den v1 (khong copy lai)
                |                       |
Commit 3:  [File A v3] [File B v2] [File C v1] <-- link den cac version cu
```

Neu file khong doi, Git **khong copy lai** ma chi tao mot **link** den phien ban truoc. Nen Git vua nhanh vua tiet kiem dung luong.

---

## 9. Loi thuong gap khi moi bat dau

### Loi 1: Nghi Git va GitHub la mot thu

```
SAI:  "Em push code len Git"
DUNG: "Em push code len GitHub" (hoac GitLab, Bitbucket...)

Git = cong cu tren may local
GitHub = dich vu luu tru tren cloud
```

### Loi 2: So Git vi "kho hoc"

Git co nhieu lenh, nhung ban chi can ~10 lenh cho cong viec hang ngay:

```bash
git init          # Tao repo
git clone         # Clone repo
git add           # Them file vao staging
git commit        # Luu thay doi
git push          # Day len remote
git pull          # Keo ve tu remote
git branch        # Quan ly branch
git checkout      # Chuyen branch
git merge         # Gop branch
git status        # Xem trang thai
```

### Loi 3: Khong hoc Git som

Nhieu nguoi hoc lap trinh 6 thang roi moi bat dau hoc Git. Sai lam! Nen hoc Git **ngay khi bat dau code** — du la hello world.

### Loi 4: Chi dung GUI ma khong hieu CLI

GUI tools (VS Code Git, Sourcetree, GitKraken) rat tien, nhung:
- Khong giup ban hieu ban chat
- Khi gap loi, ban khong biet sua
- Phong van luc nao cung hoi lenh Git

**Khuyen nghi:** Hoc CLI truoc, dung GUI sau.

---

## 10. Cau hoi phong van

### Cau 1: Git la gi? Giai thich ngan gon.

**Tra loi mau:**

> Git la mot Distributed Version Control System (he thong quan ly phien ban phan tan). No cho phep nhieu nguoi lam viec tren cung mot du an, theo doi moi thay doi, va quay lai bat ky phien ban nao truoc do. Git luu tru toan bo lich su tren may moi developer, cho phep lam viec offline va khong phu thuoc vao server trung tam.

### Cau 2: Phan biet Git va GitHub.

**Tra loi mau:**

> Git la phan mem cai tren may local, quan ly phien ban code. GitHub la dich vu web cho phep luu tru Git repository tren cloud, kem theo cac tinh nang cong tac nhu Pull Request, Issues, Actions. Git co the hoat dong doc lap ma khong can GitHub.

### Cau 3: Tai sao Git dung mo hinh distributed thay vi centralized?

**Tra loi mau:**

> Distributed model cho phep moi developer co ban sao day du cua repository, bao gom toan bo lich su. Dieu nay mang lai: (1) Lam viec offline, (2) Toc do nhanh vi thao tac tren local, (3) Khong co single point of failure, (4) Moi clone la mot backup tu nhien. Day la ly do Git duoc thiet ke boi Linus Torvalds de phuc vu hang ngan developer cua Linux kernel.

### Cau 4: Git luu du lieu nhu the nao — snapshot hay diff?

**Tra loi mau:**

> Git luu du lieu dang snapshot. Moi commit la mot anh chup toan bo trang thai cua project tai thoi diem do. Neu file khong thay doi, Git khong copy lai ma tao mot link den phien ban truoc. Dieu nay khac voi SVN luu theo dang delta (chi luu phan thay doi). Cach luu snapshot giup Git nhanh hon khi chuyen branch va xem lich su.

### Cau 5: Ke ten cac VCS khac ngoai Git va so sanh.

**Tra loi mau:**

> - **SVN (Subversion):** Centralized, pho bien truoc Git, van dung o mot so cong ty lon.
> - **Mercurial:** Distributed nhu Git, cu phap de hon nhung it pho bien hon.
> - **Perforce:** Centralized, manh ve file lon (game development, media).
> - **CVS:** The he dau cua centralized VCS, hien da loi thoi.
> Git thong tri nho toc do, branching manh, cong dong lon, va su tich hop voi GitHub/GitLab.

---

## Tong ket

| Khai niem | Ghi nho |
|-----------|---------|
| VCS | He thong theo doi thay doi theo thoi gian |
| Git | Distributed VCS, nhanh, manh, mien phi |
| GitHub | Dich vu web luu tru Git repo (khong phai Git) |
| Centralized | 1 server, client chi co ban moi nhat |
| Distributed | Moi may co full repo + lich su |
| Snapshot | Git luu anh chup, khong phai diff |

**Buoc tiep theo:** Cai dat Git tren may va cau hinh co ban.
