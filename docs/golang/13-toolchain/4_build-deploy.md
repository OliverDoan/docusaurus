---
sidebar_position: 4
title: "4. Build và triển khai"
---

# Build và triển khai

Một trong những lý do lớn nhất khiến Go được chọn cho backend và công cụ DevOps là **triển khai cực đơn giản**: kết quả build là **một file binary** chứa cả runtime, không cần cài JVM, Node hay thư viện hệ thống. Bài này đi qua cross-compile (biên dịch chéo) bằng `GOOS`/`GOARCH`, binary tĩnh với `CGO_ENABLED=0`, các cờ `-ldflags` để thu nhỏ binary và nhúng phiên bản, `-trimpath`, đọc thông tin build lúc chạy bằng `debug.ReadBuildInfo`, Dockerfile multi-stage với distroless/scratch, tự động phát hành bằng GoReleaser và các cách kiểm soát kích thước binary.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Cross-compile chỉ cần biến môi trường**: `GOOS=linux GOARCH=arm64 go build` — không cần cài toolchain riêng (khi không dùng cgo).
- ⭐ **`CGO_ENABLED=0` → binary tĩnh hoàn toàn**, chạy được trên image `scratch`/distroless; bật cgo thì phải có libc tương thích ở máy đích.
- **`-ldflags "-s -w"`** bỏ bảng symbol và thông tin debug DWARF → binary nhỏ hơn khoảng 25–35%, nhưng không debug bằng Delve được.
- **`-ldflags "-X main.version=v1.2.3"`** gán giá trị cho biến `string` ở package-level lúc link — cách chuẩn để nhúng version, commit, thời gian build.
- **`-trimpath`** xoá đường dẫn tuyệt đối trên máy build khỏi binary → build tái lập được (reproducible), không lộ cấu trúc thư mục.
- **Docker multi-stage**: stage `golang` để build, stage cuối `gcr.io/distroless/static` hoặc `scratch` → image vài MB.

:::

---

## Mục lục

- [Vì sao triển khai Go đơn giản?](#vì-sao-triển-khai-go-đơn-giản)
- [Cross-compile với GOOS và GOARCH](#cross-compile-với-goos-và-goarch)
- [CGO_ENABLED và binary tĩnh](#cgo_enabled-và-binary-tĩnh)
- [ldflags: thu nhỏ binary và nhúng version](#ldflags-thu-nhỏ-binary-và-nhúng-version)
- [trimpath và build tái lập](#trimpath-và-build-tái-lập)
- [Đọc thông tin build lúc chạy](#đọc-thông-tin-build-lúc-chạy)
- [Build constraint khi triển khai](#build-constraint-khi-triển-khai)
- [Dockerfile multi-stage](#dockerfile-multi-stage)
- [GoReleaser](#goreleaser)
- [Kích thước binary](#kích-thước-binary)

---

## Vì sao triển khai Go đơn giản?

**Vấn đề:** Triển khai một ứng dụng thông thường kéo theo cả môi trường chạy:

```bash
# Server cần đúng phiên bản runtime + thư viện
apt install openjdk-21-jre        # hoặc nodejs 20, python 3.12 + venv...
scp app.jar server:/opt/app/
scp -r node_modules server:/opt/app/   # hàng trăm MB, phụ thuộc nền tảng
# Image Docker 300–800 MB, nhiều lỗ hổng từ package hệ điều hành
```

**Giải pháp:** Go biên dịch ra **mã máy native**, runtime (GC, scheduler) được link sẵn vào binary:

```bash
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -ldflags "-s -w" -o api ./cmd/api
scp api server:/usr/local/bin/      # một file, chạy luôn
```

```text
$ file api
api: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), statically linked, stripped
```

:::tip[Dùng thực tế]

- **Phát hành CLI cho mọi hệ điều hành** — từ một máy macOS build ra binary cho Linux, Windows, ARM (Raspberry Pi) trong vài giây.
- **Container siêu nhỏ** — image `distroless/static` chứa binary Go chỉ khoảng 10–20 MB, ít bề mặt tấn công.
- **Endpoint `/version`** — trả về version, commit, thời gian build để biết chính xác bản nào đang chạy.
- **Sidecar, agent, operator Kubernetes** — Docker, Kubernetes, Terraform, Prometheus đều là binary Go.

:::

:::tip[Ví dụ đời thường]

Triển khai Java/Node giống **đặt món phở ở quán xa**: phải gửi kèm nồi nước dùng, bếp, gia vị (runtime, thư viện) đúng loại mới nấu được. Triển khai Go giống **phở ăn liền đóng hộp tự sôi**: mọi thứ trong một hộp, đến đâu mở ra ăn được đó. Cross-compile là nhà máy đóng gói cùng lúc phiên bản cho thị trường Nhật, Mỹ, Hàn chỉ bằng cách đổi nhãn.

:::

---

## Cross-compile với GOOS và GOARCH

`GOOS` chọn hệ điều hành đích, `GOARCH` chọn kiến trúc CPU:

```bash
GOOS=linux   GOARCH=amd64 go build -o dist/api-linux-amd64 ./cmd/api
GOOS=linux   GOARCH=arm64 go build -o dist/api-linux-arm64 ./cmd/api    # AWS Graviton, Raspberry Pi 4
GOOS=darwin  GOARCH=arm64 go build -o dist/api-darwin-arm64 ./cmd/api   # Mac Apple Silicon
GOOS=windows GOARCH=amd64 go build -o dist/api-windows-amd64.exe ./cmd/api

go tool dist list          # mọi cặp GOOS/GOARCH được hỗ trợ
go env GOOS GOARCH         # nền tảng hiện tại
```

Một số biến tinh chỉnh thêm:

| Biến | Ví dụ | Ý nghĩa |
|------|-------|---------|
| `GOAMD64` | `v1` (mặc định), `v2`, `v3`, `v4` | Mức tập lệnh x86-64; `v3` dùng AVX2, nhanh hơn nhưng không chạy trên CPU cũ |
| `GOARM64` | `v8.0` (mặc định) | Mức tính năng ARM64 |
| `GOARM` | `6`, `7` | Phiên bản ARM 32-bit |

Script build nhiều nền tảng:

```bash
#!/bin/sh
set -e
for target in linux/amd64 linux/arm64 darwin/arm64 windows/amd64; do
  os=${target%/*}; arch=${target#*/}
  ext=""; [ "$os" = "windows" ] && ext=".exe"
  CGO_ENABLED=0 GOOS=$os GOARCH=$arch \
    go build -trimpath -ldflags "-s -w" -o "dist/api-$os-$arch$ext" ./cmd/api
done
```

---

## CGO_ENABLED và binary tĩnh

**cgo** cho phép Go gọi code C. Khi cgo bật, binary có thể link **động** với libc của hệ điều hành (glibc trên Ubuntu/Debian), nghĩa là máy đích phải có libc tương thích.

Một số package chuẩn có hai hiện thực — bản cgo (dùng thư viện hệ thống) và bản Go thuần:

- `net`: DNS resolver (cgo dùng `getaddrinfo` của libc, Go thuần tự đọc `/etc/resolv.conf`).
- `os/user`: tra user (cgo đọc qua NSS, Go thuần đọc `/etc/passwd`).

| | `CGO_ENABLED=1` | `CGO_ENABLED=0` |
|--|----------------|-----------------|
| Liên kết | Có thể động với libc | Tĩnh hoàn toàn |
| Cross-compile | Cần C cross-compiler cho nền tảng đích | Chỉ cần đặt GOOS/GOARCH |
| Chạy trên `scratch`/alpine | Thường lỗi (thiếu glibc) | Chạy được |
| Dùng thư viện C (SQLite cgo, librdkafka) | Được | Không |

Mặc định `CGO_ENABLED=1` khi build cho chính máy mình và có C compiler; khi cross-compile thì mặc định tắt. Để chắc chắn ra binary tĩnh, **luôn đặt tường minh**:

```bash
CGO_ENABLED=0 go build -o api ./cmd/api
ldd api           # Linux: "not a dynamic executable" nghĩa là tĩnh
```

:::warning[Lỗi hay gặp]

- **`exec ./api: no such file or directory` trên Alpine/scratch dù file tồn tại** — binary link động tới glibc (`/lib64/ld-linux-x86-64.so.2`) không có trong image. Build lại với `CGO_ENABLED=0`.
- **Dùng driver SQLite bản cgo (`mattn/go-sqlite3`) rồi đặt `CGO_ENABLED=0`** — build lỗi hoặc driver báo lỗi lúc chạy. Dùng bản Go thuần như `modernc.org/sqlite` nếu cần binary tĩnh.
- **Image `scratch` thiếu chứng chỉ CA và timezone** — gọi HTTPS lỗi `x509: certificate signed by unknown authority`. Copy `/etc/ssl/certs/ca-certificates.crt` vào image, hoặc dùng distroless; timezone thì `import _ "time/tzdata"` để nhúng dữ liệu múi giờ.

:::

---

## ldflags: thu nhỏ binary và nhúng version

`-ldflags` truyền cờ cho linker (`go tool link`).

### `-s -w`: bỏ thông tin debug

- `-s`: bỏ bảng symbol.
- `-w`: bỏ thông tin debug DWARF.

Binary nhỏ hơn đáng kể; stack trace khi panic **vẫn có** tên hàm và số dòng (thông tin này nằm ở bảng riêng mà runtime cần), nhưng Delve và profiler kém hữu ích hơn.

### `-X`: gán giá trị biến lúc link

```go
package main

import (
	"fmt"
	"runtime/debug"
)

// Giá trị mặc định khi build không truyền -X (vd chạy go run lúc dev)
var (
	version = "dev"
	commit  = "none"
	date    = "unknown"
)

func main() {
	fmt.Printf("version=%s commit=%s date=%s\n", version, commit, date)

	info, ok := debug.ReadBuildInfo()
	if !ok {
		fmt.Println("binary không có build info")
		return
	}
	fmt.Println("go:", info.GoVersion)
	fmt.Println("module:", info.Main.Path, info.Main.Version)
	for _, s := range info.Settings {
		switch s.Key {
		case "vcs.revision", "vcs.time", "vcs.modified", "GOOS", "GOARCH", "CGO_ENABLED":
			fmt.Printf("  %s=%s\n", s.Key, s.Value)
		}
	}
}
```

```bash
VERSION=$(git describe --tags --always --dirty)
COMMIT=$(git rev-parse --short HEAD)
DATE=$(date -u +%Y-%m-%dT%H:%M:%SZ)

go build -trimpath \
  -ldflags "-s -w -X main.version=$VERSION -X main.commit=$COMMIT -X main.date=$DATE" \
  -o bin/api ./cmd/api
```

```text
$ ./bin/api
version=v1.2.3 commit=a1b2c3d date=2026-10-15T04:00:00Z
go: go1.26.5
module: example.com/shop v1.2.3
  CGO_ENABLED=0
  GOARCH=arm64
  GOOS=darwin
  vcs.revision=a1b2c3d4e5f6...
  vcs.time=2026-10-14T09:12:00Z
  vcs.modified=false
```

Với biến ở package khác, dùng **đường dẫn import đầy đủ**: `-X example.com/shop/internal/buildinfo.Version=v1.2.3`.

:::warning[Lỗi hay gặp]

- **`-X` không có tác dụng và không báo lỗi** — sai đường dẫn package, biến là `const`, biến không phải kiểu `string`, hoặc biến được khởi tạo bằng lời gọi hàm (`var version = getVersion()`). `-X` chỉ ghi đè biến `string` khởi tạo bằng hằng hoặc không khởi tạo.
- **Giá trị có dấu cách** — bọc trong nháy đơn bên trong: `-ldflags "-X 'main.date=15 Oct 2026'"`.

:::

---

## trimpath và build tái lập

Mặc định binary chứa đường dẫn tuyệt đối của file nguồn trên máy build (`/home/an/projects/shop/internal/order/service.go`) — xuất hiện trong stack trace khi panic.

```bash
go build -trimpath -o bin/api ./cmd/api
```

Với `-trimpath`, đường dẫn thành dạng `example.com/shop/internal/order/service.go` (module path) hoặc `net/http/server.go` (thư viện chuẩn). Lợi ích:

- **Không lộ** tên user, cấu trúc thư mục máy build.
- **Build tái lập** (reproducible build): cùng source + cùng phiên bản Go + cùng cờ → binary giống hệt từng byte, dù build ở máy nào. Cộng đồng Go đã làm toolchain tái lập hoàn toàn từ Go 1.21.

---

## Đọc thông tin build lúc chạy

Từ Go 1.18, binary tự nhúng thông tin build, đọc bằng `runtime/debug.ReadBuildInfo()` (như ví dụ ở trên) hoặc từ bên ngoài:

```bash
go version -m ./bin/api
```

```text
./bin/api: go1.26.5
	path	example.com/shop/cmd/api
	mod	example.com/shop	v1.2.3
	dep	github.com/jackc/pgx/v5	v5.7.1	h1:...
	build	-trimpath=true
	build	CGO_ENABLED=0
	build	GOARCH=amd64
	build	GOOS=linux
	build	vcs=git
	build	vcs.revision=a1b2c3d4e5f6...
	build	vcs.time=2026-10-14T09:12:00Z
	build	vcs.modified=false
```

Các điểm cần biết:

- **`vcs.*`** chỉ có khi build trong thư mục git và có lệnh `git`; kiểm soát bằng `-buildvcs=auto|true|false`. Trong Docker build thường **không có** thư mục `.git` → không có `vcs.revision`, nên vẫn cần `-X`.
- **`Main.Version`**: khi cài bằng `go install module@v1.2.3` sẽ là `v1.2.3`. Từ Go 1.24, `go build` trong repo git cũng điền version theo tag/commit (dạng `v1.2.3` hoặc pseudo-version, thêm `+dirty` nếu có thay đổi chưa commit); trước đó luôn là `(devel)`.
- Danh sách `Deps` dùng cho quét lỗ hổng binary (`govulncheck -mode=binary`) và tạo SBOM.

---

## Build constraint khi triển khai

Build tag (xem bài Các lệnh go cốt lõi) thường dùng khi triển khai để:

```go
//go:build !prod

package debugroutes

import "net/http"

// Chỉ có trong bản build không phải production: endpoint giả lập dữ liệu
func Register(mux *http.ServeMux) {
	mux.HandleFunc("POST /debug/seed", seedHandler)
}
```

```go
//go:build prod

package debugroutes

import "net/http"

// Bản production: không đăng ký gì cả
func Register(mux *http.ServeMux) {}
```

```bash
go build -tags=prod -o bin/api ./cmd/api
```

Code debug **không tồn tại** trong binary production — an toàn hơn kiểm tra cờ cấu hình lúc chạy.

---

## Dockerfile multi-stage

Stage đầu có đủ toolchain để build; stage cuối chỉ chứa binary.

```dockerfile
# syntax=docker/dockerfile:1

# ---------- Stage 1: build ----------
FROM golang:1.26 AS build
WORKDIR /src

# Tải dependency trước để tận dụng cache layer (chỉ chạy lại khi go.mod/go.sum đổi)
COPY go.mod go.sum ./
RUN go mod download

COPY . .
ARG VERSION=dev
ARG COMMIT=none
# Cache build Go giữa các lần docker build (BuildKit)
RUN --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=linux go build -trimpath \
      -ldflags "-s -w -X main.version=${VERSION} -X main.commit=${COMMIT}" \
      -o /out/api ./cmd/api

# ---------- Stage 2: runtime ----------
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/api /api
USER nonroot:nonroot
EXPOSE 8080
ENTRYPOINT ["/api"]
```

```bash
docker build --build-arg VERSION=$(git describe --tags) --build-arg COMMIT=$(git rev-parse --short HEAD) -t shop/api:1.2.3 .
```

So sánh image nền cho stage cuối:

| Image | Kích thước | Có gì | Ghi chú |
|-------|-----------|-------|---------|
| `scratch` | 0 MB | Không gì cả | Phải tự copy CA cert, tzdata; không shell |
| `gcr.io/distroless/static` | ~2 MB | CA cert, tzdata, `/etc/passwd`, user `nonroot` | Lựa chọn mặc định tốt cho Go tĩnh |
| `alpine` | ~8 MB | Shell, `apk` | Tiện debug; musl libc |
| `debian:bookworm-slim` | ~75 MB | Shell, glibc | Khi binary cần cgo/glibc |

Phiên bản dùng `scratch`:

```dockerfile
FROM golang:1.26 AS build
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags "-s -w" -o /out/api ./cmd/api

FROM scratch
COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=build /out/api /api
USER 65532:65532
ENTRYPOINT ["/api"]
```

:::tip[Build đa kiến trúc]

Với `docker buildx build --platform linux/amd64,linux/arm64`, khai báo `FROM --platform=$BUILDPLATFORM golang:1.26 AS build` và truyền `GOOS=$TARGETOS GOARCH=$TARGETARCH` cho `go build`. Stage build chạy native trên máy build (nhanh), Go tự cross-compile — không cần giả lập QEMU.

:::

---

## GoReleaser

**GoReleaser** tự động hoá phát hành: build nhiều nền tảng, đóng gói `.tar.gz`/`.zip`, tạo checksum, build/push Docker image, tạo GitHub Release với changelog, Homebrew tap, gói `.deb`/`.rpm`.

```yaml
# .goreleaser.yaml
version: 2

before:
  hooks:
    - go mod tidy

builds:
  - id: api
    main: ./cmd/api
    binary: api
    env:
      - CGO_ENABLED=0
    goos: [linux, darwin, windows]
    goarch: [amd64, arm64]
    flags:
      - -trimpath
    ldflags:
      - -s -w
      - -X main.version={{.Version}}
      - -X main.commit={{.Commit}}
      - -X main.date={{.Date}}

archives:
  - formats: [tar.gz]
    format_overrides:
      - goos: windows
        formats: [zip]

checksum:
  name_template: checksums.txt

changelog:
  sort: asc
  filters:
    exclude:
      - "^docs:"
      - "^test:"
```

```bash
goreleaser check                       # kiểm tra cấu hình
goreleaser release --snapshot --clean  # build thử cục bộ, không publish
git tag v1.2.3 && git push origin v1.2.3
goreleaser release --clean             # phát hành thật (thường chạy trong CI khi push tag)
```

---

## Kích thước binary

Binary "Hello world" Go khoảng 1.5–2.5 MB vì chứa runtime. Service thực tế thường 10–40 MB. Các cách giảm:

| Cách | Hiệu quả | Đánh đổi |
|------|---------|----------|
| `-ldflags "-s -w"` | Giảm khoảng 25–35% | Khó debug bằng Delve |
| `-trimpath` | Giảm chút ít | Không |
| Bỏ dependency nặng | Có thể rất lớn | Phải đổi thư viện |
| Tránh `reflect.Value.Method`/`MethodByName` với tên động | Linker giữ được dead code elimination | Hạn chế thiết kế |
| Nén bằng UPX | Giảm 50–70% | Khởi động chậm hơn, tốn RAM giải nén, một số antivirus báo nhầm |

Tìm xem ai chiếm dung lượng:

```bash
go tool nm -size -sort size ./bin/api | head -20     # symbol lớn nhất
go version -m ./bin/api | grep dep                    # danh sách dependency được link
```

Công cụ cộng đồng như `goweight`, `go-size-analyzer` cho báo cáo trực quan theo package.
