---
sidebar_position: 2
title: "2. Mock và Stub"
---

# Mock và Stub

Code thật luôn có phụ thuộc bên ngoài: database, API thanh toán, dịch vụ gửi email, đồng hồ hệ thống. Unit test không nên gọi những thứ đó thật — chậm, tốn tiền, không ổn định và khó tạo tình huống lỗi. Bài này giải thích các loại "đồ giả" (test double) như stub, fake, spy, mock; cách thiết kế code qua **interface nhỏ** để dễ thay thế; cách tự viết đồ giả bằng tay (cách được cộng đồng Go ưa chuộng), dùng công cụ sinh mock (`gomock`, `testify/mock`, `mockery`), và khi nào nên test với database thật bằng `testcontainers-go`.

---

:::note[Ghi nhớ nhanh]

- ⭐ **Thiết kế trước, mock sau** — hàm phụ thuộc vào **interface nhỏ khai báo ở phía dùng** thì thay đồ giả rất dễ; phụ thuộc vào struct cụ thể thì không mock được.
- ⭐ **Ưu tiên fake/stub viết tay hơn mock sinh tự động** — test kiểm tra **kết quả** thay vì kiểm tra "đã gọi hàm nào với tham số gì", nên ít vỡ khi refactor.
- **Stub** trả về dữ liệu cố định; **fake** là hiện thực đơn giản chạy được (map thay DB); **spy** ghi lại lời gọi; **mock** kiểm tra kỳ vọng về lời gọi.
- **gomock (`go.uber.org/mock`)** và **testify/mock + mockery** là hai bộ công cụ sinh mock phổ biến — dùng khi interface lớn hoặc cần kiểm tra thứ tự/số lần gọi.
- **Logic truy vấn SQL thì test với DB thật** (testcontainers-go) — mock repository không phát hiện được câu SQL sai.

:::

---

## Mục lục

- [Vì sao cần mock và stub?](#vì-sao-cần-mock-và-stub)
- [Các loại test double](#các-loại-test-double)
- [Thiết kế qua interface nhỏ](#thiết-kế-qua-interface-nhỏ)
- [Viết fake và stub thủ công](#viết-fake-và-stub-thủ-công)
- [Mock với gomock](#mock-với-gomock)
- [Mock với testify/mock và mockery](#mock-với-testifymock-và-mockery)
- [Fake hay mock?](#fake-hay-mock)
- [Test với database thật: testcontainers-go](#test-với-database-thật-testcontainers-go)

---

## Vì sao cần mock và stub?

**Vấn đề:** Service phụ thuộc trực tiếp vào hiện thực cụ thể:

```go
type UserService struct {
	db     *sql.DB          // DB thật
	mailer *smtp.Client     // gửi email thật
}

func (s *UserService) Register(ctx context.Context, email, name string) (User, error) {
	// SELECT ... kiểm tra email trùng
	// INSERT ...
	// gửi email chào mừng qua SMTP
}
```

Muốn unit test `Register`:

- Phải có PostgreSQL chạy sẵn và SMTP server → test chậm, CI phức tạp.
- Mỗi lần chạy test lại **gửi email thật**.
- Không tạo được tình huống "SMTP sập" hay "DB mất kết nối" để kiểm tra nhánh xử lý lỗi.

**Giải pháp:** Phụ thuộc vào interface, test truyền đồ giả vào:

```go
type UserStore interface {
	GetByEmail(ctx context.Context, email string) (User, error)
	Create(ctx context.Context, u User) (User, error)
}

type Mailer interface {
	SendWelcome(ctx context.Context, to string) error
}

type UserService struct {
	store  UserStore
	mailer Mailer
}

func NewUserService(s UserStore, m Mailer) *UserService {
	return &UserService{store: s, mailer: m}
}

func (s *UserService) Register(ctx context.Context, email, name string) (User, error) {
	_, err := s.store.GetByEmail(ctx, email)
	if err == nil {
		return User{}, ErrEmailTaken
	}
	if !errors.Is(err, ErrNotFound) {
		return User{}, fmt.Errorf("kiểm tra email: %w", err)
	}
	u, err := s.store.Create(ctx, User{Email: email, Name: name})
	if err != nil {
		return User{}, fmt.Errorf("tạo user: %w", err)
	}
	if err := s.mailer.SendWelcome(ctx, email); err != nil {
		return User{}, fmt.Errorf("gửi email chào mừng: %w", err)
	}
	return u, nil
}
```

Production truyền `PostgresUserStore` và `SMTPMailer`; test truyền bản giả chạy trong bộ nhớ, mất vài micro giây.

:::tip[Dùng thực tế]

- **Cổng thanh toán** (VNPay, MoMo, Stripe): giả lập "thanh toán thành công", "thẻ bị từ chối", "timeout" mà không mất tiền thật.
- **Gửi SMS/email OTP**: kiểm tra đúng số điện thoại nhận được mã, không gửi tin thật.
- **Thời gian**: thay `time.Now()` bằng đồng hồ giả để test logic hết hạn token, khuyến mãi theo giờ.
- **Tình huống lỗi hiếm**: DB trả lỗi deadlock, API bên ngoài trả 503 — khó tái hiện với hệ thống thật.

:::

:::tip[Ví dụ đời thường]

Đóng phim hành động không ai cho diễn viên chính nhảy từ tầng 20 thật — dùng **diễn viên đóng thế** (stunt double). "Test double" chính là diễn viên đóng thế cho các phụ thuộc. Có loại chỉ cần đứng đúng vị trí đọc đúng câu thoại (stub), có loại diễn được cả cảnh đơn giản (fake), có loại kèm người giám sát ghi lại từng động tác để đối chiếu kịch bản (mock).

:::

---

## Các loại test double

| Loại | Làm gì | Ví dụ |
|------|--------|-------|
| **Dummy** | Chỉ để điền tham số, không bao giờ được dùng | Truyền `nil` hoặc struct rỗng cho logger không quan trọng |
| **Stub** | Trả về giá trị cố định đã định sẵn | `Mailer` luôn trả `errors.New("smtp down")` |
| **Fake** | Hiện thực thật nhưng đơn giản hoá | `UserStore` lưu trong `map` thay vì PostgreSQL |
| **Spy** | Stub + ghi lại lời gọi để kiểm tra sau | `Mailer` lưu danh sách email đã "gửi" |
| **Mock** | Được lập trình **kỳ vọng** trước: phải được gọi với tham số X, đúng N lần; sai thì test fail | `gomock`, `testify/mock` |

Trong giao tiếp hằng ngày, nhiều người gọi tất cả là "mock" — nhưng phân biệt được giúp chọn công cụ phù hợp.

---

## Thiết kế qua interface nhỏ

### Khai báo interface ở phía dùng

Khác Java (interface thường đặt cạnh class hiện thực), Go khuyến khích **package dùng** tự khai báo interface với đúng những method nó cần. Nhờ interface ngầm định, hiện thực không cần biết interface đó tồn tại:

```go
// package notification — chỉ cần gửi email, nên chỉ khai báo đúng một method
type emailSender interface {
	Send(ctx context.Context, to, subject, body string) error
}

type Notifier struct {
	sender emailSender
}
```

Struct `*sesclient.Client` của bên thứ ba có 40 method, nhưng chỉ cần có `Send` đúng chữ ký là thoả `emailSender` — và đồ giả trong test chỉ phải viết **một** method.

> **"Accept interfaces, return structs"** — hàm nhận interface (linh hoạt, dễ test), trả về kiểu cụ thể (người gọi dùng được đầy đủ).

:::warning[Interface khổng lồ]

`type Repository interface` với 30 method thì đồ giả nào cũng phải viết đủ 30 method — người ta sẽ chuyển sang sinh mock tự động, và test bắt đầu dính chặt vào chi tiết. Tách nhỏ theo nhu cầu: `UserGetter`, `UserCreator`... hoặc mỗi service khai báo interface riêng chỉ gồm method nó dùng.

:::

### Thay thế hàm và thời gian

Không phải phụ thuộc nào cũng cần interface. Với một hàm đơn lẻ, truyền **kiểu hàm** là đủ:

```go
type TokenService struct {
	now func() time.Time // production: time.Now
}

func (s *TokenService) IsExpired(tok Token) bool {
	return s.now().After(tok.ExpiresAt)
}

// Test: đồng hồ cố định
svc := &TokenService{now: func() time.Time {
	return time.Date(2026, 10, 15, 9, 0, 0, 0, time.UTC)
}}
```

Với code có goroutine và `time.Sleep`/timer, Go 1.25 có package `testing/synctest` chạy test trong "bong bóng" với đồng hồ ảo — thời gian chỉ trôi khi mọi goroutine đều đang chờ.

---

## Viết fake và stub thủ công

### Fake: store trong bộ nhớ

```go
type fakeStore struct {
	mu     sync.Mutex
	users  map[string]User
	nextID int64
}

func newFakeStore() *fakeStore {
	return &fakeStore{users: map[string]User{}}
}

func (f *fakeStore) GetByEmail(_ context.Context, email string) (User, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	u, ok := f.users[email]
	if !ok {
		return User{}, ErrNotFound
	}
	return u, nil
}

func (f *fakeStore) Create(_ context.Context, u User) (User, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.nextID++
	u.ID = f.nextID
	f.users[u.Email] = u
	return u, nil
}
```

Fake viết một lần, dùng lại cho mọi test của service. Có thể đặt trong package `xxxtest` (giống `net/http/httptest`, `testing/fstest`) để package khác dùng chung.

### Stub và spy

```go
// Stub: trả lỗi cố định
type stubMailer struct{ err error }

func (s stubMailer) SendWelcome(context.Context, string) error { return s.err }

// Spy: ghi lại ai đã nhận email
type spyMailer struct{ sent []string }

func (s *spyMailer) SendWelcome(_ context.Context, to string) error {
	s.sent = append(s.sent, to)
	return nil
}
```

### Test sử dụng

```go
func TestRegister(t *testing.T) {
	store := newFakeStore()
	mailer := &spyMailer{}
	svc := NewUserService(store, mailer)

	u, err := svc.Register(t.Context(), "an@example.com", "An")
	if err != nil {
		t.Fatalf("Register lỗi: %v", err)
	}
	if u.ID == 0 {
		t.Error("user mới phải có ID")
	}
	if len(mailer.sent) != 1 || mailer.sent[0] != "an@example.com" {
		t.Errorf("email đã gửi = %v; muốn [an@example.com]", mailer.sent)
	}

	// Đăng ký lại cùng email → phải báo trùng
	_, err = svc.Register(t.Context(), "an@example.com", "An 2")
	if !errors.Is(err, ErrEmailTaken) {
		t.Errorf("err = %v; muốn ErrEmailTaken", err)
	}
}

func TestRegister_MailerFails(t *testing.T) {
	svc := NewUserService(newFakeStore(), stubMailer{err: errors.New("smtp down")})
	if _, err := svc.Register(t.Context(), "b@example.com", "B"); err == nil {
		t.Fatal("muốn lỗi khi gửi email thất bại")
	}
}
```

### Mẹo: chỉ ghi đè một method

Embed interface vào struct giả — chỉ hiện thực method cần thay, các method khác "có mặt" nhưng sẽ panic nếu bị gọi (vì interface nhúng là `nil`) — tiện để khẳng định chúng **không được gọi**:

```go
type failingStore struct{ UserStore } // embed interface

func (failingStore) GetByEmail(context.Context, string) (User, error) {
	return User{}, errors.New("mất kết nối DB")
}
// Gọi Create trên failingStore{} → panic nil pointer: tốt, vì kịch bản này không được phép tới Create
```

### Mẹo: kiểu hàm hiện thực interface

Giống `http.HandlerFunc`, khai báo kiểu hàm có method để tạo đồ giả ngay trong test:

```go
type MailerFunc func(ctx context.Context, to string) error

func (f MailerFunc) SendWelcome(ctx context.Context, to string) error { return f(ctx, to) }

called := false
svc := NewUserService(failingStore{}, MailerFunc(func(context.Context, string) error {
	called = true
	return nil
}))
```

---

## Mock với gomock

`gomock` ban đầu do Google phát triển (`github.com/golang/mock`, nay đã ngừng bảo trì); bản tiếp nối được duy trì là **`go.uber.org/mock`**. Công cụ `mockgen` sinh code mock từ interface.

```bash
# Cài mockgen (cách truyền thống)
go install go.uber.org/mock/mockgen@latest

# Go 1.24+: quản lý tool qua go.mod, chạy bằng "go tool mockgen"
go get -tool go.uber.org/mock/mockgen
```

Đặt chỉ thị `go:generate` cạnh interface rồi chạy `go generate ./...`:

```go
//go:generate mockgen -source=store.go -destination=mocks/mock_store.go -package=mocks
type UserStore interface {
	GetByEmail(ctx context.Context, email string) (User, error)
	Create(ctx context.Context, u User) (User, error)
}
```

Sử dụng trong test:

```go
import (
	"testing"

	"go.uber.org/mock/gomock"

	"example.com/app/user/mocks"
)

func TestRegister_EmailTaken(t *testing.T) {
	ctrl := gomock.NewController(t) // tự kiểm tra kỳ vọng khi test kết thúc
	store := mocks.NewMockUserStore(ctrl)
	mailer := mocks.NewMockMailer(ctrl)

	store.EXPECT().
		GetByEmail(gomock.Any(), "an@example.com").
		Return(User{ID: 1, Email: "an@example.com"}, nil).
		Times(1)
	// Không khai báo EXPECT cho Create và SendWelcome → nếu bị gọi, test fail

	svc := NewUserService(store, mailer)
	_, err := svc.Register(t.Context(), "an@example.com", "An")
	if !errors.Is(err, ErrEmailTaken) {
		t.Errorf("err = %v; muốn ErrEmailTaken", err)
	}
}
```

Các tính năng hay dùng:

| API | Ý nghĩa |
|-----|---------|
| `gomock.Any()`, `gomock.Eq(x)`, `gomock.Nil()` | Matcher cho tham số |
| `.Return(...)` | Giá trị trả về |
| `.Times(n)`, `.AnyTimes()`, `.MinTimes(n)` | Số lần gọi mong đợi |
| `.DoAndReturn(func(...) ...)` | Chạy hàm tuỳ biến, tính giá trị trả về từ tham số |
| `gomock.InOrder(call1, call2)` | Bắt buộc thứ tự gọi |

Từ Go 1.14 / gomock 1.5 trở đi, `NewController(t)` tự đăng ký `ctrl.Finish()` qua `t.Cleanup` — không cần `defer ctrl.Finish()` như code cũ.

---

## Mock với testify/mock và mockery

`github.com/stretchr/testify/mock` cho phép viết mock bằng cách embed `mock.Mock`:

```go
type MockMailer struct {
	mock.Mock
}

func (m *MockMailer) SendWelcome(ctx context.Context, to string) error {
	args := m.Called(ctx, to) // ghi lại lời gọi, tìm kỳ vọng khớp
	return args.Error(0)
}

func TestRegister_SendsWelcome(t *testing.T) {
	mailer := new(MockMailer)
	mailer.On("SendWelcome", mock.Anything, "an@example.com").Return(nil).Once()

	svc := NewUserService(newFakeStore(), mailer) // kết hợp fake store + mock mailer
	_, err := svc.Register(t.Context(), "an@example.com", "An")
	require.NoError(t, err)

	mailer.AssertExpectations(t) // kiểm tra mọi kỳ vọng đã được đáp ứng
}
```

Viết tay method như `SendWelcome` ở trên với interface lớn rất mệt và dễ sai tên chuỗi `"SendWelcome"`. **mockery** (`github.com/vektra/mockery`) sinh các mock kiểu testify tự động, kèm API `EXPECT()` có kiểu (sai tên method hay sai kiểu tham số sẽ lỗi biên dịch):

```yaml
# .mockery.yml — cấu hình khác nhau giữa mockery v2 và v3, xem tài liệu của bản đang dùng
packages:
  example.com/app/user:
    interfaces:
      UserStore:
      Mailer:
```

```go
mailer := mocks.NewMockMailer(t) // tự AssertExpectations khi test kết thúc
mailer.EXPECT().SendWelcome(mock.Anything, "an@example.com").Return(nil).Once()
```

### So sánh nhanh

| Tiêu chí | Viết tay | gomock | testify/mock + mockery |
|----------|----------|--------|------------------------|
| Phụ thuộc ngoài | Không | `go.uber.org/mock` | testify + mockery |
| Sinh code | Không | `mockgen` | `mockery` |
| Kiểm tra kỳ vọng | Tự viết | Chặt (gọi ngoài kỳ vọng → fail) | `AssertExpectations` |
| Kiểu an toàn | ✅ | ✅ | ✅ với `EXPECT()` của mockery |
| Hợp với | Interface nhỏ, fake dùng lại nhiều | Dự án đã dùng gomock, cần thứ tự gọi | Dự án đã dùng testify |

---

## Fake hay mock?

Mock kiểm tra **cách** code làm việc (gọi hàm nào, tham số gì, mấy lần); fake/stub cho phép kiểm tra **kết quả** (state sau khi chạy). Test dựa trên kết quả bền hơn:

```go
// Test kiểu mock: vỡ ngay khi refactor Register dùng GetByEmailForUpdate
store.EXPECT().GetByEmail(gomock.Any(), "an@example.com").Return(User{}, ErrNotFound)
store.EXPECT().Create(gomock.Any(), User{Email: "an@example.com", Name: "An"}).Return(User{ID: 1}, nil)

// Test kiểu fake: chỉ quan tâm "sau khi đăng ký, user có tồn tại không"
store := newFakeStore()
svc.Register(ctx, "an@example.com", "An")
u, err := store.GetByEmail(ctx, "an@example.com") // kiểm tra trạng thái
```

**Dùng fake/stub khi:**

- Phụ thuộc là nơi lưu dữ liệu (repository, cache) — fake bằng map rất tự nhiên.
- Muốn test sống sót qua refactor.
- Interface nhỏ (1–3 method).

**Dùng mock khi:**

- **Bản thân lời gọi là kết quả** cần kiểm tra: "phải gửi đúng một email", "phải gọi API hoàn tiền với số tiền 50.000", "không được gọi cổng thanh toán khi giỏ hàng rỗng".
- Cần kiểm tra thứ tự gọi (mở transaction → ghi → commit).
- Interface lớn của bên thứ ba mà không thể tách nhỏ.

:::warning[Mock quá tay]

Dấu hiệu: mỗi test 20 dòng `EXPECT()` gần như chép lại thân hàm; đổi một chi tiết hiện thực làm vỡ 15 test dù hành vi không đổi. Lúc đó test đang **kiểm tra code được viết thế nào** chứ không phải **code làm đúng không**. Chuyển sang fake, hoặc test ở tầng cao hơn.

:::

---

## Test với database thật: testcontainers-go

Mock repository chỉ kiểm tra service gọi repository đúng; nó **không** kiểm tra câu SQL có đúng cú pháp, index có hoạt động, ràng buộc `UNIQUE` có bắt được email trùng không. Phần repository nên được test với **PostgreSQL thật** — `testcontainers-go` khởi động container Docker ngay trong test:

```go
import (
	"testing"

	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
)

func newTestDB(t *testing.T) *sql.DB {
	t.Helper()
	if testing.Short() {
		t.Skip("bỏ qua integration test khi chạy -short")
	}
	ctx := t.Context()

	ctr, err := postgres.Run(ctx, "postgres:16-alpine",
		postgres.WithDatabase("app_test"),
		postgres.WithUsername("test"),
		postgres.WithPassword("test"),
		postgres.BasicWaitStrategies(), // chờ DB sẵn sàng nhận kết nối
	)
	testcontainers.CleanupContainer(t, ctr) // tự xoá container khi test xong
	if err != nil {
		t.Fatal(err)
	}

	dsn, err := ctr.ConnectionString(ctx, "sslmode=disable")
	if err != nil {
		t.Fatal(err)
	}
	db, err := sql.Open("pgx", dsn)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })

	runMigrations(t, db) // tạo bảng
	return db
}

func TestPostgresUserStore_DuplicateEmail(t *testing.T) {
	store := NewPostgresUserStore(newTestDB(t))
	_, err := store.Create(t.Context(), User{Email: "an@example.com"})
	if err != nil {
		t.Fatal(err)
	}
	_, err = store.Create(t.Context(), User{Email: "an@example.com"})
	if !errors.Is(err, ErrEmailTaken) { // kiểm tra repo dịch lỗi unique violation đúng
		t.Errorf("err = %v; muốn ErrEmailTaken", err)
	}
}
```

Module có sẵn cho MySQL, Redis, Kafka, MongoDB, LocalStack (giả lập AWS)... Lưu ý chi phí: khởi động container mất vài giây — chia sẻ một container cho cả package (qua `TestMain` hoặc `sync.Once`) và tách dữ liệu giữa các test bằng transaction rollback hoặc schema riêng. CI cần có Docker.

**Chiến lược tổng thể** thường gặp: service/business logic → unit test với fake/stub (nhanh, nhiều); repository → integration test với DB thật (ít hơn, chậm hơn); một vài test end-to-end cho luồng quan trọng.
