---
sidebar_position: 16
title: "16. Case Studies: Advanced"
---

# Case Studies: Advanced

> *Case study advanced là nơi interviewer phân loại Senior thật và Senior "thuộc bài". Không có đáp án đúng duy nhất — điểm số nằm ở cách bạn đi theo framework: làm rõ requirements + ước lượng capacity, vẽ high-level design, chọn đúng chỗ deep dive, và chốt bằng trade-offs có chủ đích.*

:::note[Ghi nhớ nhanh]

- ⭐ **Điểm nằm ở framework, không phải đáp án** — requirements + capacity → high-level design → chọn đúng chỗ deep dive → trade-offs có chủ đích.
- **Autocomplete/Typeahead** — latency budget `<100ms` quyết định kiến trúc; dùng **trie với top-K precompute tại mỗi node** để lookup chỉ còn O(độ dài prefix).
- **Scale trie** — shard theo prefix range + cache prefix ngắn tại CDN/edge; client `debounce` + `AbortController` chống race condition.
- ⭐ **Precompute đổi freshness lấy latency** — suggestion mới phải chờ pipeline rebuild trie; cần real-time thì thêm stream layer cập nhật delta.

:::

---

## Câu 49: Thiết kế Search Autocomplete (Typeahead) `[Advanced]`

### Câu hỏi

> Thiết kế hệ thống Search Autocomplete (Typeahead) như thanh tìm kiếm của Google: user gõ từng ký tự, hệ thống gợi ý top suggestions. Làm sao tối ưu latency và ranking?

### Giải thích lý thuyết

**Bước 1 — Requirements + capacity.** Functional: với mỗi prefix user gõ, trả về top 5-10 suggestions, có ranking theo độ phổ biến. Non-functional: **latency budget &lt;100ms end-to-end** (đây là con số quyết định toàn bộ kiến trúc — user gõ liên tục, chậm là vô dụng); availability cao; suggestions không cần real-time tuyệt đối (trễ vài giờ chấp nhận được). Capacity ước lượng nhanh: 10M DAU, mỗi user 10 search/ngày, mỗi search gõ ~4 ký tự sinh request → ~400M request/ngày ≈ **~5K QPS trung bình, peak ~15K QPS**. Read-heavy gần như tuyệt đối — đây là bài toán đọc.

**Bước 2 — High-level design.** Tách 2 phần độc lập: (1) **Serving path**: client → CDN/edge cache → API gateway → suggestion service đọc từ data structure in-memory; (2) **Data pipeline (offline)**: search log → aggregation (đếm frequency theo query) → tính trending/decay → **rebuild trie định kỳ** (mỗi giờ/ngày) → deploy bản trie mới sang serving fleet.

**Bước 3 — Deep dive: Trie với top-K precomputed.** Nếu mỗi request phải duyệt subtree để tìm top-K thì không kịp budget. Giải pháp: **precompute top-K suggestions tại MỖI node** của trie — lookup chỉ còn O(độ dài prefix) + đọc list có sẵn, đổi memory lấy speed. Trie quá lớn cho 1 máy → **shard theo prefix** (ví dụ theo ký tự đầu hoặc range prefix 2 ký tự, có weighted sharding vì 'a' nhiều hơn 'x'). Prefix ngắn phổ biến (1-2 ký tự) chiếm phần lớn traffic → **cache tại CDN/edge** với TTL ngắn. Phía **client** cũng là một tầng tối ưu: debounce 150-300ms để không bắn request mỗi keystroke, **cancel request cũ bằng AbortController** tránh race condition kết quả cũ đè kết quả mới, cache local các prefix đã hỏi.

**Bước 4 — Trade-offs.** Ranking = frequency + recency (time-decay cho trending) + personalization (lịch sử user — nhưng personalization phá cache, thường chỉ re-rank ở client hoặc layer riêng). Precompute đổi freshness lấy latency: suggestion mới phải chờ pipeline rebuild — chấp nhận được với search, không chấp nhận được nếu yêu cầu real-time trending (khi đó thêm stream layer cập nhật delta). Cuối cùng phải có **filter nội dung nhạy cảm/độc hại** trong pipeline trước khi build trie.

### Thiết kế minh hoạ

```text
[Client]                         SERVING PATH (đọc, <100ms)
debounce 150-300ms ──► [CDN/Edge cache] ──► [API Gateway / LB]
cancel request cũ        (prefix ngắn          │
cache local               phổ biến)            ▼
                                   [Suggestion Service x N]
                                   shard theo prefix range:
                                   ┌──────────┬──────────┬──────────┐
                                   │ Trie a-f │ Trie g-p │ Trie q-z │  (in-memory)
                                   └──────────┴──────────┴──────────┘
                                              ▲ swap trie mới (atomic)
DATA PIPELINE (offline, định kỳ)              │
[Search logs] ─► [Aggregator: đếm frequency,  │
                  time-decay, lọc nội dung    │
                  nhạy cảm] ─► [Trie Builder] ┘
```

```text
Trie với top-K precomputed tại mỗi node:

        (root)
          │ b
         (b)  topK: ["bánh mì", "bóng đá", "bitcoin"]   ← đọc thẳng, O(1)
          │ á
         (bá) topK: ["bánh mì", "bánh kem", "bán nhà"]
          │ n
        (bán) topK: ["bánh mì", "bán nhà", "bánh tráng"]

Lookup "bán" = đi 3 cạnh + trả list có sẵn — KHÔNG duyệt subtree.
```

```typescript
// Client: debounce + hủy request cũ — phần interviewer hay hỏi xoáy
function useTypeahead() {
  let controller: AbortController | null = null;

  const fetchSuggestions = debounce(async (prefix: string) => {
    controller?.abort();            // hủy request cũ → kết quả cũ không đè kết quả mới
    controller = new AbortController();
    const res = await fetch(`/api/suggest?q=${encodeURIComponent(prefix)}`, {
      signal: controller.signal,    // gắn signal để cancel được
    });
    return res.json();              // [{ text, score }]
  }, 200);                          // debounce 200ms — không bắn mỗi keystroke
  return fetchSuggestions;
}
```

### Đáp án mẫu

> "Em bắt đầu từ latency budget dưới 100ms — nó quyết định mọi thứ. Hệ thống read-heavy tuyệt đối nên em tách hai phần: serving path và data pipeline offline. Serving dùng **trie in-memory với top-K suggestions precompute sẵn tại mỗi node** — lookup chỉ là đi theo prefix rồi đọc list có sẵn, đổi memory lấy speed thay vì duyệt subtree lúc query. Trie lớn thì shard theo prefix range, và prefix ngắn phổ biến em cache luôn ở CDN/edge. Pipeline offline aggregate search log, tính frequency cộng time-decay cho trending, lọc nội dung nhạy cảm, rồi rebuild trie định kỳ và swap atomic vào serving fleet. Phía client em debounce 150-300ms, dùng AbortController hủy request cũ tránh kết quả cũ đè kết quả mới, và cache local. Trade-off chính là freshness: suggestion mới chờ pipeline rebuild — chấp nhận được; ranking có personalization thì em re-rank nhẹ ở client để không phá cache."

---

## Câu 50: Thiết kế hệ thống Payment như Stripe `[Advanced]`

### Câu hỏi

> Thiết kế hệ thống Payment như Stripe. Làm sao đảm bảo tính chính xác tuyệt đối của tiền (không mất, không double-charge) và idempotency?

### Giải thích lý thuyết

**Bước 1 — Requirements + capacity.** Functional: nhận payment request từ merchant, charge qua card network/bank, notify kết quả qua webhook, đối soát. Non-functional: **correctness > availability** — đây là hệ thống hiếm hoi chọn consistency trước; không bao giờ mất tiền hoặc double-charge; audit được mọi đồng. Capacity: payment QPS thường không khủng (Stripe đỉnh ~vài chục nghìn TPS) — **bài toán không phải scale, mà là đúng tuyệt đối**. Nói rõ điều này với interviewer là điểm cộng.

**Bước 2 — High-level design.** Merchant → API Gateway → Payment Service (state machine) → PSP/bank adapter; Ledger Service ghi sổ; Webhook Service notify merchant; Reconciliation Job đối soát với bank. Mọi service nói chuyện qua event (outbox pattern) để không mất event khi crash.

**Bước 3 — Deep dive: 3 trụ cột.**
1. **Double-entry ledger**: mọi giao dịch ghi **2 chiều** (debit một account, credit account khác, tổng luôn = 0), bảng ledger **immutable append-only** — sai thì ghi bút toán đảo, **không bao giờ UPDATE/DELETE**, không bao giờ lưu "số dư" như một cột update trực tiếp (số dư = SUM các entry, có snapshot để đọc nhanh). Số tiền dùng **integer đơn vị nhỏ nhất (cents)** — tuyệt đối không float vì sai số nhị phân.
2. **Idempotency key**: mọi POST từ merchant kèm `Idempotency-Key`; server lưu key + response, retry cùng key trả lại response cũ — network timeout không gây double-charge. Key có TTL (Stripe: 24h), và phải xử lý race 2 request cùng key đến đồng thời (unique constraint + lock).
3. **State machine** cho payment status: `created → pending → succeeded | failed`, chỉ cho phép transition hợp lệ (CAS/optimistic lock khi update) — chặn bug kiểu "failed nhảy ngược về succeeded".

**Bước 4 — Trade-offs & vận hành.** Bank/PSP là hệ thống ngoài, không tin tưởng hoàn toàn → **reconciliation job** chạy định kỳ đối soát settlement file của bank với ledger, lệch thì alert + sửa bằng bút toán điều chỉnh. Outbox pattern: ghi event vào bảng outbox cùng transaction với ledger, relay publish sau — đảm bảo at-least-once, consumer phải idempotent. **PCI DSS**: không bao giờ lưu PAN (số thẻ) trong hệ thống chính — tokenization qua vault tách biệt, giảm scope compliance. Webhook notify merchant phải có retry + exponential backoff và merchant verify signature.

### Thiết kế minh hoạ

```text
[Merchant] ──POST /charge (Idempotency-Key)──► [API Gateway]
                                                    │
                                          [Payment Service]
                                          state machine + idempotency store
                                          │            │
                              ┌───────────┘            └──────────┐
                              ▼                                   ▼
                      [PSP/Bank Adapter]                  [Ledger Service]
                      (Visa/Master/bank)                  double-entry, append-only
                              │                                   │ (cùng DB txn)
                              │                           [Outbox table] ─► relay ─► [Event bus]
                              │                                                  │
        [Reconciliation Job] ◄── settlement file (bank)            [Webhook Service] ─► merchant
        đối soát ledger vs bank, lệch → alert                      retry + signature
```

```sql
-- Ledger: double-entry, append-only — KHÔNG BAO GIỜ UPDATE
CREATE TABLE ledger_entries (
  id            BIGSERIAL PRIMARY KEY,
  transaction_id UUID NOT NULL,        -- 2 entry cùng transaction_id
  account_id    UUID NOT NULL,
  direction     TEXT NOT NULL CHECK (direction IN ('debit','credit')),
  amount_cents  BIGINT NOT NULL CHECK (amount_cents > 0),  -- integer cents, KHÔNG float
  currency      CHAR(3) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Bất biến: SUM(debit) = SUM(credit) theo từng transaction_id

-- Idempotency: retry cùng key → trả response cũ, không charge lần 2
CREATE TABLE idempotency_keys (
  key           TEXT PRIMARY KEY,      -- unique constraint chặn race 2 request cùng key
  request_hash  TEXT NOT NULL,         -- cùng key nhưng body khác → reject 422
  response_body JSONB,
  status        TEXT NOT NULL,         -- processing | completed
  expires_at    TIMESTAMPTZ NOT NULL   -- TTL 24h
);
```

```python
# State machine: chỉ cho transition hợp lệ — đọc dễ, chặn bug trạng thái
VALID_TRANSITIONS = {
    "created":  {"pending"},
    "pending":  {"succeeded", "failed"},
    "succeeded": set(),   # trạng thái cuối — bất biến
    "failed":    set(),
}

def transition(payment_id: str, from_status: str, to_status: str) -> bool:
    if to_status not in VALID_TRANSITIONS[from_status]:
        raise InvalidTransitionError(f"{from_status} → {to_status} không hợp lệ")
    # Optimistic lock: WHERE status = from_status — thua race thì 0 row, retry/đọc lại
    rows = db.execute(
        "UPDATE payments SET status = %s WHERE id = %s AND status = %s",
        (to_status, payment_id, from_status),
    )
    return rows == 1
```

### Đáp án mẫu

> "Với payment, em nói rõ ngay: bài toán không phải scale mà là **đúng tuyệt đối** — correctness trước availability. Ba trụ cột của em: thứ nhất, **double-entry ledger** — mọi giao dịch ghi hai chiều debit/credit tổng bằng 0, bảng append-only immutable, sai thì ghi bút toán đảo chứ không bao giờ UPDATE, và số tiền là integer cents chứ không float. Thứ hai, **idempotency key** trên mọi POST: server lưu key kèm response, merchant retry vì timeout thì nhận lại response cũ — không double-charge; race hai request cùng key chặn bằng unique constraint. Thứ ba, **state machine** cho payment status với transition hợp lệ duy nhất, update bằng optimistic lock. Vì bank là hệ ngoài nên em có **reconciliation job** đối soát settlement file với ledger hàng ngày. Event publish qua **outbox pattern** để không mất event khi crash, webhook cho merchant có retry và signature. Về PCI DSS, em không lưu PAN — tokenization qua vault riêng để thu hẹp compliance scope."

---

## Câu 51: Thiết kế hệ thống xác thực OAuth2/OIDC + JWT `[Advanced]`

### Câu hỏi

> Thiết kế hệ thống xác thực dùng OAuth2/OIDC + JWT: access token khác ID token thế nào, vì sao chọn Authorization Code Flow + PKCE, và xử lý revoke token ra sao khi JWT vốn stateless?

### Giải thích lý thuyết

**Bước 1 — Requirements.** Functional: user login qua identity provider, client (SPA/mobile) gọi API thay mặt user, hỗ trợ logout/revoke, SSO nhiều app. Non-functional: bảo mật là số 1 (token leak = chiếm tài khoản); latency verify token thấp (mọi request đều qua); revoke phải có hiệu lực trong thời gian chấp nhận được. Capacity: verify token là hot path — hàng chục nghìn QPS — nên muốn **stateless verify** (chữ ký JWT) thay vì query DB mỗi request.

**Bước 2 — High-level: phân biệt 2 loại token (OIDC).** **Access token** dành cho **resource server** (API) — trả lời "client được phép làm gì" (*authorization*); API verify signature + scope. **ID token** dành cho **client** — trả lời "user là ai" (*authentication*), chứa claims như `sub`, `email`. Quy tắc vàng: **KHÔNG bao giờ gửi ID token tới API** làm credential — nó không có scope/audience cho API, audience của nó là client. Nhầm hai token này là red flag lớn trong phỏng vấn.

**Bước 3 — Deep dive: vì sao Authorization Code Flow + PKCE.** Implicit Flow cũ trả token **thẳng trên URL fragment** → lộ vào browser history, log, referrer — đã bị deprecated. Authorization Code Flow: browser chỉ nhận **code dùng-một-lần**, client đổi code lấy token qua **back-channel** (server-to-server POST) — token không bao giờ chạm URL. Nhưng public client (SPA, mobile) không giữ được client secret → code bị chặn (interception) là đổi được token. **PKCE** vá lỗ này: client sinh `code_verifier` random, gửi `code_challenge = SHA256(verifier)` lúc authorize; lúc đổi token phải nộp verifier gốc — kẻ chặn code không có verifier nên code vô dụng. Chuẩn hiện nay: **Authorization Code + PKCE cho mọi client**, kể cả confidential.

**Bước 4 — Trade-offs: revoke với JWT stateless.** JWT verify bằng chữ ký, không query server → không thể "xoá" một JWT đã phát. Giải pháp tầng lớp: (1) **access token short-lived 5-15 phút** — cửa sổ thiệt hại khi leak rất ngắn; (2) **refresh token lưu server-side** (DB/Redis) — revoke được thật sự, logout/đổi mật khẩu thì xoá refresh token, access token tự chết sau ít phút; (3) **refresh token rotation**: mỗi lần refresh phát token mới và vô hiệu token cũ — nếu token cũ bị dùng lại nghĩa là **bị đánh cắp** → revoke cả family; (4) cần **immediate revoke** (ban user, lộ key) thì thêm blacklist `jti` trong Redis, chỉ chứa token bị revoke chưa hết hạn — nhỏ và rẻ. So với session truyền thống: session revoke tức thì nhưng mọi request query store; JWT verify local nhanh nhưng revoke trễ — hybrid (JWT ngắn hạn + refresh stateful) lấy ưu của cả hai.

### Thiết kế minh hoạ

```text
Authorization Code Flow + PKCE:

[SPA/Mobile]                [Authorization Server]              [API/Resource Server]
     │ 1. sinh code_verifier (random)
     │ 2. /authorize?code_challenge=SHA256(verifier) ──►
     │                       │ user login + consent
     │ ◄── 3. redirect kèm code (dùng 1 lần, qua browser)
     │ 4. POST /token {code, code_verifier} ──►  (back-channel, không qua URL)
     │                       │ verify SHA256(verifier) == challenge
     │ ◄── 5. {access_token (5-15ph), id_token, refresh_token}
     │
     │ 6. gọi API: Authorization: Bearer <access_token> ──────►│ verify chữ ký (JWKS,
     │    (ID token KHÔNG BAO GIỜ gửi tới API)                │  local, không query DB)
```

```text
Revoke strategy nhiều tầng:
┌──────────────────────────────┬───────────────────────────────────────────┐
│ Access token 5-15 phút       │ leak chỉ sống vài phút, verify stateless  │
│ Refresh token server-side    │ logout/ban → xoá khỏi store, revoke thật  │
│ Refresh token rotation       │ token cũ bị dùng lại = bị cắp → revoke    │
│                              │ cả token family                           │
│ Blacklist jti (Redis, TTL)   │ immediate revoke khi khẩn cấp             │
└──────────────────────────────┴───────────────────────────────────────────┘
```

```typescript
// Refresh token rotation — phát hiện token bị đánh cắp
async function refresh(oldToken: string) {
  const record = await store.findRefreshToken(hash(oldToken));

  if (!record) throw new UnauthorizedError("token không tồn tại");

  if (record.rotatedAt) {
    // Token này ĐÃ được dùng để rotate trước đó mà giờ lại xuất hiện
    // → một trong hai bên (user thật / kẻ cắp) đang giữ token cũ
    await store.revokeFamily(record.familyId); // revoke cả chuỗi, bắt login lại
    throw new UnauthorizedError("nghi ngờ token bị đánh cắp");
  }

  const next = await store.rotate(record);     // tạo token mới, đánh dấu token cũ
  return {
    accessToken: signJwt({ sub: record.userId, exp: now() + 15 * 60 }), // 15 phút
    refreshToken: next.token,
  };
}
```

### Đáp án mẫu

> "Em phân biệt trước hai token của OIDC: **access token cho resource server** — nói client được làm gì, API verify chữ ký và scope; **ID token cho client** — nói user là ai, và tuyệt đối không gửi nó tới API vì audience của nó là client. Em chọn **Authorization Code Flow** vì token không bao giờ lộ ra URL hay browser history — browser chỉ thấy code dùng một lần, đổi token qua back-channel. SPA và mobile không giữ được secret nên thêm **PKCE**: challenge là hash của verifier, kẻ chặn được code cũng không đổi được token. Về revoke với JWT stateless, em dùng chiến lược nhiều tầng: access token chỉ sống 5-15 phút để verify stateless ở hot path; **refresh token lưu server-side** nên revoke được thật khi logout hay ban user; bật **refresh token rotation** — token cũ bị dùng lại là dấu hiệu bị đánh cắp, em revoke cả family; trường hợp khẩn cấp thì blacklist jti trong Redis với TTL. Đây là hybrid lấy ưu của cả session lẫn JWT."

---

## Câu 52: Kiến trúc multi-region active-active `[Advanced]`

### Câu hỏi

> Kiến trúc multi-region active-active là gì? Nó khác active-passive ra sao, và thách thức lớn nhất khi triển khai là gì?

### Giải thích lý thuyết

**Bước 1 — Requirements: vì sao cần multi-region.** Hai động lực: (1) **disaster recovery** — một region sập (hiếm nhưng có thật) vẫn sống, đo bằng **RTO** (thời gian khôi phục) và **RPO** (lượng data chấp nhận mất); (2) **latency theo geo** — user châu Á gọi server Mỹ tốn 150-250ms round-trip chỉ riêng network. Phải hỏi interviewer mục tiêu là DR hay latency — câu trả lời khác nhau.

**Bước 2 — High-level: hai mô hình.** **Active-passive**: một region serve toàn bộ traffic, region kia standby nhận replication; khi primary sập thì failover. Ưu: đơn giản, một nguồn ghi duy nhất — không conflict. Nhược: failover có RTO/RPO (replication lag = data mất), passive **lãng phí tài nguyên**, và nguy hiểm nhất là passive có thể **"rỉ sét"** — không nhận traffic thật nên config drift, capacity thiếu, đến lúc failover thật mới phát hiện không chạy nổi (vì vậy phải failover drill định kỳ). **Active-active**: mọi region đều serve read **và write**; user route tới region gần nhất qua **GeoDNS/anycast**. Ưu: latency thấp theo geo, HA cao hơn (mất 1 region chỉ mất 1 phần capacity, không có "khoảnh khắc failover"). Nhược: phức tạp gấp nhiều lần.

**Bước 3 — Deep dive: thách thức lớn nhất là DATA.** Stateless service nhân bản dễ; **write vào DB từ nhiều region** mới khó. **Bidirectional replication conflict**: user A sửa record ở region US, user B sửa cùng record ở region EU trong cùng cửa sổ replication lag → conflict. Các hướng giải: (1) **last-write-wins** theo timestamp — đơn giản nhưng **lặng lẽ mất data** (và clock giữa region không tin được); (2) **CRDT** — data structure tự merge không conflict, nhưng chỉ hợp một số kiểu dữ liệu (counter, set, …); (3) **conflict-free by design** — tốt nhất: partition write sao cho một mảnh data chỉ ghi ở một region. Cách phổ biến: **home region per user** — mỗi user gán một region "chủ", mọi write của user route về đó, region khác chỉ đọc replica; so với **global table** kiểu DynamoDB (ghi đâu cũng được, conflict resolve last-write-wins ngầm). Ngoài data còn: **data residency** (GDPR — data user EU phải nằm ở EU, vô tình thành lý do bắt buộc kiến trúc theo region), routing user "dính" về đúng region giữa các request, và deploy/observability nhân đôi.

**Bước 4 — Trade-offs.** Active-active đắt cả tiền lẫn complexity — chi phí vận hành, test conflict, on-call đa region. Câu chốt thể hiện độ chín: **đa số công ty chỉ cần active-passive** với failover drill nghiêm túc; active-active xứng đáng khi latency toàn cầu hoặc yêu cầu availability cực cao thực sự là bài toán kinh doanh.

### Thiết kế minh hoạ

```text
ACTIVE-PASSIVE                          ACTIVE-ACTIVE
                                        [GeoDNS / Anycast]
[users] ──► Region A (primary)           │            │
              │ async replication        ▼            ▼
              ▼                       Region US     Region EU
            Region B (standby,        read+write    read+write
            "rỉ sét" nếu không          │   ◄─ bidirectional ─►  │
            drill thường xuyên)         │      replication       │
                                        └── conflict khi 2 bên ──┘
Failover: RTO (downtime) +                  ghi cùng record
RPO (mất data = replication lag)            trong replication lag
```

```text
Hướng xử lý write conflict (từ đơn giản → tốt):

1. Last-write-wins      : timestamp lớn hơn thắng → LẶNG LẼ MẤT DATA,
                          clock giữa region không đáng tin
2. CRDT                 : tự merge (counter, set...) — chỉ hợp 1 số kiểu data
3. Conflict-free design : "home region per user" — write của user luôn về
                          region chủ, nơi khác chỉ đọc → KHÔNG BAO GIỜ conflict

   user_id → hash/lookup → home_region
   ┌─────────────────────────────────────────────┐
   │ user EU:  write → EU (home), US đọc replica │  + thoả GDPR data residency
   │ user US:  write → US (home), EU đọc replica │
   └─────────────────────────────────────────────┘
```

### Đáp án mẫu

> "Active-passive là một region serve toàn bộ, region kia standby nhận replication — đơn giản, không conflict vì chỉ một nguồn ghi, nhưng failover có RTO/RPO, tài nguyên standby lãng phí, và passive dễ 'rỉ sét' — không chịu traffic thật nên đến lúc failover mới lộ ra không chạy nổi, vì vậy phải drill định kỳ. Active-active thì mọi region đều serve cả read lẫn write, route bằng GeoDNS hoặc anycast — latency thấp theo geo và không có khoảnh khắc failover. Thách thức lớn nhất theo em là **data**: bidirectional replication sinh write conflict khi hai region sửa cùng record trong cửa sổ lag. Last-write-wins thì lặng lẽ mất data, CRDT chỉ hợp vài kiểu dữ liệu, nên em ưu tiên **conflict-free by design** — home region per user, write của mỗi user luôn về region chủ, cách này còn thoả luôn GDPR data residency. Em cũng thẳng thắn: active-active đắt và phức tạp — đa số hệ thống chỉ cần active-passive làm tử tế, em chỉ đề xuất active-active khi latency toàn cầu thực sự là bài toán kinh doanh."

---

## Câu 55: Thiết kế News Feed kiểu Twitter `[Advanced]`

### Câu hỏi

> Thiết kế News Feed kiểu Twitter: so sánh fan-out on write và fan-out on read, vì sao phải dùng hybrid cho celebrity?

### Giải thích lý thuyết

**Bước 1 — Requirements + capacity.** Functional: user post tweet; user mở app thấy feed gồm bài của người mình follow, mới nhất/ranked trước; pagination. Non-functional: đọc feed phải nhanh (&lt;200ms) vì là hành vi chính; eventual consistency chấp nhận được (tweet xuất hiện trễ vài giây không sao). Capacity: giả sử 200M DAU, mỗi user mở feed 10 lần/ngày → **~25K QPS đọc feed**; post chỉ ~1-2K QPS → **read/write ratio cực lệch về read**, và đặc thù chí mạng: phân phối follower theo power law — đa số user vài trăm follower, **celebrity có hàng chục triệu**.

**Bước 2 — High-level: hai chiến lược nền tảng.** **Fan-out on write (push)**: khi user post → service lấy danh sách follower → **đẩy tweet ID vào feed cache của từng follower** (Redis list/sorted set per user). Đọc feed = đọc thẳng list của mình, O(1), cực nhanh. **Fan-out on read (pull)**: không precompute gì; khi user mở feed → query tweet mới nhất của **mọi người đang follow** rồi merge + sort lúc đọc. Không tốn write nhưng đọc chậm (N query + merge) và tải dồn vào thời điểm đọc.

**Bước 3 — Deep dive: vì sao hybrid.** Fan-out on write sụp đổ với celebrity: **1 tweet của tài khoản 100M follower = 100M write** vào 100M list — bão write, trễ hàng phút, tốn tài nguyên cho cả follower không bao giờ mở app. Fan-out on read thì bắt mọi user trả giá đọc chậm chỉ vì số ít celebrity. **Hybrid**: user thường (dưới ngưỡng follower, ví dụ 10K-100K) → fan-out on write; **celebrity → fan-out on read** — tweet chỉ ghi vào timeline của chính họ; khi follower mở feed, hệ thống lấy precomputed feed (phần push) **merge với tweet mới của các celebrity đang follow** (phần pull) ngay lúc đọc. Mỗi user chỉ follow vài chục celebrity nên phần pull rẻ. Trên merged feed có **ranking layer** (relevance: affinity, recency, engagement dự đoán) thay vì thuần chronological.

**Bước 4 — Trade-offs & chi tiết vận hành.** Feed cache trong Redis chỉ giữ **tweet ID + metadata nhỏ** (vài trăm entry/user), content hydrate từ tweet store lúc đọc; có **TTL** — user inactive lâu thì cache bị evict, lần mở lại rebuild bằng pull (chấp nhận lần đầu chậm, tiết kiệm RAM khổng lồ). **Pagination dùng cursor** (theo tweet ID/timestamp) chứ không offset — feed thay đổi liên tục, offset gây trùng/sót bài. Trade-off tổng: hybrid đổi sự đơn giản lấy hiệu quả — phải duy trì 2 code path và ngưỡng celebrity cần tune.

### Thiết kế minh hoạ

```text
WRITE PATH                                    READ PATH
[User post] ─► [Tweet Service] ─► tweet store [User mở feed] ─► [Feed Service]
                  │                                │
                  ▼                                ├─ 1. đọc feed cache (phần PUSH)
           [Fan-out Service]                       │     Redis: feed:{user_id}
           follower count?                         ├─ 2. pull tweet mới của các
           ├─ user thường ──► đẩy tweet_id vào     │     CELEBRITY đang follow
           │   (push)         Redis list của       ├─ 3. merge + ranking layer
           │                  TỪNG follower        │     (affinity, recency, engagement)
           └─ celebrity ───► KHÔNG fan-out         └─ 4. hydrate content, trả về
               (pull)        (chỉ ghi timeline          cursor pagination
                              của chính họ)
```

```python
# Đọc feed hybrid: merge phần push (precomputed) + phần pull (celebrity)
def get_feed(user_id: str, cursor: str | None, limit: int = 20) -> FeedPage:
    # 1. Phần PUSH: feed cache đã được fan-out on write
    pushed_ids = redis.zrevrangebyscore(
        f"feed:{user_id}", max=cursor or "+inf", min="-inf", num=limit * 2
    )

    # 2. Phần PULL: tweet mới của celebrity mà user follow (thường chỉ vài chục)
    celeb_ids = follow_store.get_followed_celebrities(user_id)
    pulled = tweet_store.recent_by_authors(celeb_ids, before=cursor, limit=limit)

    # 3. Merge + ranking — tạo list MỚI, không mutate input
    candidates = merge_by_time(pushed_ids, pulled)
    ranked = ranking_service.rank(user_id, candidates)[:limit]

    # 4. Cursor = id bài cuối → feed đổi liên tục vẫn không trùng/sót (offset thì có)
    return FeedPage(items=hydrate(ranked), next_cursor=ranked[-1].id if ranked else None)
```

### Đáp án mẫu

> "Hệ này read lệch hẳn so với write, nên câu hỏi trung tâm là precompute feed ở đâu. **Fan-out on write**: khi post, em đẩy tweet ID vào Redis list của từng follower — đọc feed là O(1), cực nhanh. Nhưng nó sụp với celebrity: một tweet của tài khoản 100 triệu follower là 100 triệu write — bão write và trễ hàng phút. **Fan-out on read** thì ngược lại: không tốn write, nhưng mỗi lần mở feed phải query mọi người đang follow rồi merge — đọc chậm. Nên em dùng **hybrid**: user thường fan-out on write; celebrity không fan-out — khi follower mở feed, em merge feed cache có sẵn với tweet mới của vài chục celebrity họ follow ngay lúc đọc, phần pull này rẻ. Trên merged feed em đặt ranking layer theo affinity và engagement. Feed cache chỉ giữ ID với TTL — user inactive thì evict, mở lại rebuild bằng pull. Pagination em dùng cursor chứ không offset, vì feed thay đổi liên tục, offset sẽ trùng hoặc sót bài."

---

## Câu 56: Thiết kế hệ thống gọi xe kiểu Uber `[Advanced]`

### Câu hỏi

> Thiết kế hệ thống gọi xe kiểu Uber: dùng geospatial index nào để tìm tài xế gần nhất, và xử lý cập nhật vị trí real-time của hàng trăm nghìn tài xế ra sao?

### Giải thích lý thuyết

**Bước 1 — Requirements + capacity.** Functional: rider request xe → match tài xế gần phù hợp; track vị trí real-time; quản lý vòng đời chuyến đi; surge pricing. Non-functional: matching nhanh (&lt;vài giây), location update gần real-time. Capacity — con số đáng sợ nhất là **location update**: 500K tài xế online, mỗi người gửi vị trí mỗi 4 giây → **~125K update/giây**. Write-heavy khốc liệt, và đây là dữ liệu **ephemeral** — vị trí 30 giây trước gần như vô giá trị.

**Bước 2 — High-level: vì sao cần geospatial index.** Query cốt lõi: "tài xế nào trong bán kính X quanh điểm này?". Index B-tree thường trên `(lat, long)` **không hiệu quả**: range query 2 chiều phải scan range lat rồi lọc long (hoặc ngược lại) — index chỉ tốt cho 1 chiều. Cần cấu trúc map không gian 2D về 1D hoặc chia ô: (1) **Geohash** — chia đất thành grid, encode thành string, **prefix chung = gần nhau** nên query bằng prefix matching rất rẻ; nhược điểm: **vấn đề biên ô** — 2 điểm sát nhau nhưng nằm 2 ô khác nhau có geohash khác hẳn → luôn phải query cả ô lân cận. (2) **H3 (Uber dùng)** — grid **hexagon**: mọi neighbor cách tâm **đều nhau** (square grid thì neighbor chéo xa hơn neighbor cạnh) → tính bán kính và smooth surge pricing theo ô đẹp hơn, có phân cấp resolution. (3) **Quadtree** — chia ô thích ứng theo mật độ, hợp khi mật độ chênh lệch lớn, nhưng là cấu trúc cây in-memory khó phân tán hơn grid-encoding.

**Bước 3 — Deep dive: pipeline location + matching.** Driver app gửi vị trí mỗi 3-5s qua **WebSocket/gRPC stream** (connection bền — không tốn handshake HTTP mỗi update). Update ghi vào **in-memory store** (Redis GEO hoặc store tự viết theo H3 cell) — **tuyệt đối không ghi DB disk mỗi update** (125K write/s giết DB vô ích cho data sống vài giây); chỉ **persist định kỳ/sample** vào storage lâu dài cho analytics và lịch sử chuyến. Matching: từ vị trí rider → tính cell → **query cell đó + các cell lân cận** (giải quyết vấn đề biên) → lấy ứng viên → **rank theo ETA thực tế** (routing trên đồ thị đường) **chứ không phải khoảng cách đường chim bay** — tài xế bên kia sông gần hơn về mét nhưng xa hơn về phút.

**Bước 4 — Trade-offs & phần còn lại.** **Surge pricing per cell**: đếm supply/demand theo từng H3 cell, hexagon giúp surge chuyển mượt giữa ô. **Trip state machine**: `requested → matched → driver_arriving → in_progress → completed/cancelled`, transition hợp lệ only — chống bug trạng thái và double-assign tài xế (lock/CAS khi gán tài xế cho chuyến). Trade-off chính: độ tươi vị trí vs chi phí — gửi mỗi 1s chính xác hơn nhưng gấp 4 lần tải; in-memory store nhanh nhưng mất data khi crash — chấp nhận được vì tài xế gửi lại sau vài giây.

### Thiết kế minh hoạ

```text
[Driver app] ══ WebSocket/gRPC stream, vị trí mỗi 3-5s ══► [Location Service]
   500K driver ≈ 125K update/s                                  │
                                              ┌─────────────────┤
                                              ▼                 ▼ (sample/định kỳ)
                                   [In-memory store]      [Persistent store]
                                   Redis GEO / H3 cell →  analytics, trip history
                                   danh sách driver       (KHÔNG ghi mỗi update)
                                              ▲
[Rider request] ─► [Matching Service] ────────┘
                   1. vị trí rider → H3 cell
                   2. query cell + neighbor cells (vấn đề biên!)
                   3. rank theo ETA (routing engine) — không phải đường chim bay
                   4. offer tài xế (lock chống double-assign)

[Surge Service]: đếm supply/demand per H3 cell → hệ số giá per cell
```

```text
Geohash (square)  vs  H3 (hexagon — Uber):

  ┌───┬───┐         neighbor square: 4 cạnh GẦN, 4 chéo XA hơn √2 lần
  │ A │ B │   ⬡⬡⬡   neighbor hexagon: cả 6 đều CÁCH ĐỀU tâm
  ├───┼───┤   ⬡●⬡   → tính bán kính & surge mượt hơn
  │ C │ D │   ⬡⬡⬡
  └───┴───┘
  Vấn đề biên: 2 xe sát nhau ở mép A|B → ô khác nhau
  → matching LUÔN query cell + neighbors
```

```python
# Matching: query theo cell + neighbors, rank theo ETA
def find_drivers(rider_lat: float, rider_lng: float, k: int = 5) -> list[Candidate]:
    cell = h3.latlng_to_cell(rider_lat, rider_lng, RES)   # resolution ~ô vài trăm mét
    cells = [cell, *h3.grid_ring(cell, 1)]                # + 6 ô lân cận: fix biên ô

    candidates = []
    for c in cells:
        candidates.extend(location_store.drivers_in_cell(c))  # đọc in-memory, rất rẻ

    # ETA thật từ routing engine — KHÔNG dùng khoảng cách thẳng
    # (tài xế bên kia sông: gần về mét, xa về phút)
    with_eta = [(d, routing.eta(d.position, (rider_lat, rider_lng))) for d in candidates]
    return sorted(with_eta, key=lambda x: x[1])[:k]
```

### Đáp án mẫu

> "Con số quyết định thiết kế là location update: 500K tài xế gửi vị trí mỗi 4 giây là ~125K update/giây, và dữ liệu này sống có vài giây. Nên driver app giữ **WebSocket/gRPC stream** gửi vị trí mỗi 3-5s, ghi vào **in-memory store** như Redis GEO theo cell — tuyệt đối không ghi DB disk mỗi update, chỉ persist sample định kỳ cho analytics. Về tìm tài xế gần nhất: range query lat/long trên B-tree không hiệu quả vì index chỉ tốt một chiều, nên cần geospatial index. **Geohash** rẻ nhờ prefix matching nhưng có vấn đề biên ô; **H3 hexagon** — chính Uber dùng — thì mọi neighbor cách đều tâm, tính bán kính và surge pricing per cell mượt hơn. Matching em query cell của rider cộng các cell lân cận để xử lý biên, rồi **rank theo ETA từ routing engine chứ không phải khoảng cách đường chim bay** — tài xế bên kia sông gần về mét nhưng xa về phút. Cuối cùng vòng đời chuyến đi em quản bằng state machine với transition hợp lệ, kèm lock khi gán tài xế để chống double-assign."

---

## Câu 57: Thiết kế hệ thống đặt vé (Ticketmaster) `[Advanced]`

### Câu hỏi

> Thiết kế hệ thống đặt vé sự kiện kiểu Ticketmaster: làm sao chống double-booking khi hàng nghìn người cùng tranh một ghế, và xử lý flash sale (vé concert mở bán) ra sao?

### Giải thích lý thuyết

**Bước 1 — Requirements + capacity.** Functional: xem sơ đồ ghế, chọn ghế, giữ ghế trong lúc thanh toán, confirm sau khi payment thành công. Non-functional: **tuyệt đối không bán 1 ghế cho 2 người** (consistency là số 1), không oversell tổng inventory; chịu được traffic spike kinh hoàng — concert hot mở bán là hàng trăm nghìn người đổ vào **cùng một giây** tranh vài chục nghìn ghế. Đặc thù: traffic không đều mà là **đỉnh nhọn** — thiết kế cho flash sale, không phải cho trung bình.

**Bước 2 — High-level + vấn đề lõi.** Race condition kinh điển: 2 user cùng load sơ đồ, **cùng thấy ghế A1 trống**, cùng bấm đặt — nếu xử lý ngây thơ (`SELECT` thấy trống rồi `UPDATE`) cả 2 đều thành công → double-booking. Mọi thiết kế xoay quanh việc biến "chọn ghế" thành thao tác **atomic**.

**Bước 3 — Deep dive: seat hold với TTL.** Flow chuẩn: chọn ghế → **hold ghế ~10 phút** (đủ thời gian checkout) → thanh toán → **payment thành công mới confirm**; hold hết hạn **tự release** ghế về pool. Hai cách hiện thực hold: (1) **Redis `SET key NX EX 600`** — atomic, chỉ 1 request thắng, TTL tự hết hạn, cực nhanh chịu được spike; nhưng Redis với DB là 2 hệ — cần xử lý khi lệch nhau; (2) **DB row lock `SELECT ... FOR UPDATE`** + cột `hold_expires_at` — một nguồn sự thật, transaction chặt, nhưng lock contention cao khi nghìn người tranh cùng row. Phân tích **optimistic vs pessimistic locking**: pessimistic (FOR UPDATE) chặn trước — hợp khi contention chắc chắn cao (ghế hot); optimistic (version column, update kèm `WHERE version = ?`) không chặn, thua thì retry — hợp khi conflict hiếm; với flash sale ghế cụ thể, contention cực cao → pessimistic hoặc atomic Redis hợp lý hơn (optimistic sẽ retry-storm). **Confirm cuối cùng vẫn phải là transaction trong DB** kiểm tra hold hợp lệ — Redis chỉ là tầng giảm tải.

**Bước 4 — Trade-offs & flash sale.** Chống sập khi mở bán: **virtual waiting queue** — user vào hàng đợi (có token + vị trí), hệ thống **admission control** chỉ nhả từng đợt N user vào trang chọn ghế khớp capacity backend; công bằng, chống bot (kèm CAPTCHA/rate limit), backend không bao giờ nhận quá tải thiết kế. **Payment phải idempotent** (idempotency key — như Câu 50): user bấm Pay 2 lần hay retry timeout không charge đôi. **Inventory consistency với vé không gán ghế** (GA — general admission): decrement counter phải atomic (`UPDATE ... SET remaining = remaining - 1 WHERE remaining > 0`) — không đọc-rồi-ghi. Trade-off của hold TTL: dài quá thì ghế bị "giam" bởi người không mua, ngắn quá thì user thật không kịp thanh toán — 5-10 phút là điểm cân bằng phổ biến.

### Thiết kế minh hoạ

```text
FLASH SALE FLOW:
[300K users] ─► [Virtual Waiting Queue]      ← admission control:
                token + vị trí hàng đợi         nhả N user/đợt khớp capacity
                      │ (được nhả vào)
                      ▼
              [Seat Selection] ─► [Hold Service] ─► [Checkout/Payment] ─► [Confirm]
              sơ đồ ghế real-time   hold 10 phút      idempotency key      DB transaction
                                    (Redis SETNX       payment provider     verify hold
                                     hoặc row lock)         │               → ghế SOLD
                                    hết hạn → tự release ◄──┘ fail/timeout
```

```sql
-- Cách 1: Pessimistic lock trong DB — một nguồn sự thật
BEGIN;
SELECT status FROM seats
WHERE event_id = :event AND seat_id = 'A1'
FOR UPDATE;                      -- khoá row: request thứ 2 phải CHỜ, không cùng thấy "trống"

UPDATE seats SET status = 'held',
       held_by = :user, hold_expires_at = now() + interval '10 minutes'
WHERE event_id = :event AND seat_id = 'A1' AND status = 'available';
-- 0 row affected = thua race → báo "ghế vừa có người giữ"
COMMIT;

-- Inventory GA (không gán ghế): decrement atomic, KHÔNG đọc-rồi-ghi
UPDATE ticket_pools SET remaining = remaining - 1
WHERE event_id = :event AND remaining > 0;   -- 0 row = hết vé, không bao giờ âm
```

```python
# Cách 2: Hold bằng Redis — atomic, TTL tự release, chịu spike tốt
def try_hold_seat(event_id: str, seat_id: str, user_id: str) -> bool:
    key = f"hold:{event_id}:{seat_id}"
    # SET NX EX: atomic "nếu chưa ai giữ thì tôi giữ, hạn 600s" — chỉ 1 người thắng
    acquired = redis.set(key, user_id, nx=True, ex=600)
    return bool(acquired)  # False → ghế đang bị giữ, hiển thị cho user ngay

def confirm_booking(event_id: str, seat_id: str, user_id: str, payment_id: str):
    # Payment THÀNH CÔNG mới gọi hàm này; confirm cuối vẫn là DB transaction
    if redis.get(f"hold:{event_id}:{seat_id}") != user_id:
        raise HoldExpiredError("hold đã hết hạn — ghế trở về pool")
    db.confirm_seat(event_id, seat_id, user_id, payment_id)  # txn: held → sold
    redis.delete(f"hold:{event_id}:{seat_id}")
```

### Đáp án mẫu

> "Vấn đề lõi là race condition: hai user cùng thấy ghế trống rồi cùng đặt — nên 'chọn ghế' phải là thao tác atomic. Flow của em: chọn ghế → **hold 10 phút** trong lúc checkout → **payment thành công mới confirm**, hold hết hạn tự release ghế về pool. Hold hiện thực bằng Redis `SET NX EX` — atomic, chỉ một người thắng, TTL tự hết — hoặc DB row lock `SELECT FOR UPDATE` nếu muốn một nguồn sự thật. Về optimistic vs pessimistic: ghế hot contention cực cao nên optimistic sẽ retry-storm, em chọn pessimistic hoặc atomic Redis, và confirm cuối cùng luôn là DB transaction verify hold hợp lệ. Với flash sale, em đặt **virtual waiting queue** trước: user nhận token xếp hàng, admission control nhả từng đợt khớp capacity backend — vừa công bằng vừa chống sập, kết hợp CAPTCHA chống bot. Payment có idempotency key nên bấm Pay hai lần không charge đôi. Vé GA không gán ghế thì decrement counter atomic với điều kiện `remaining > 0` — không bao giờ oversell."

---

## Câu 58: Thiết kế dịch vụ streaming video (YouTube/Netflix) `[Advanced]`

### Câu hỏi

> Thiết kế dịch vụ streaming video kiểu YouTube/Netflix: pipeline transcoding hoạt động thế nào, adaptive bitrate với HLS là gì, và CDN đóng vai trò gì?

### Giải thích lý thuyết

**Bước 1 — Requirements + capacity.** Functional: creator upload video; viewer xem mượt trên mọi thiết bị/mạng — từ điện thoại 3G đến TV 4K; seek, resume. Non-functional: startup nhanh (&lt;2s), **không rebuffer** (chỉ số ảnh hưởng retention nhất), chịu được scale đọc khổng lồ. Capacity insight quan trọng nhất: **video chiếm 90%+ băng thông** của hệ thống — chi phí và kiến trúc xoay quanh việc đẩy bytes ra rìa mạng; tỉ lệ xem/upload cực lệch về xem.

**Bước 2 — High-level: upload → transcoding pipeline.** Video gốc upload lên object storage (multipart/resumable upload cho file lớn) → message vào **queue** → fleet **transcoding workers** xử lý. Một file gốc duy nhất không thể serve mọi thiết bị/băng thông, nên transcode thành **bitrate ladder**: nhiều rendition từ 240p (~300kbps) đến 4K (~15Mbps), codec H.264 (tương thích rộng) và AV1/HEVC (nén tốt hơn ~30-50%, tiết kiệm băng thông khổng lồ ở scale lớn — đáng tiền compute encode). Pipeline **song song hoá per resolution** (mỗi rendition một job độc lập) và có thể chia video thành chunk encode song song rồi ghép — rút thời gian publish. Mỗi rendition bị **chia thành segment 2-10 giây**, kèm file **manifest** (HLS `.m3u8`: master playlist liệt kê các rendition, mỗi rendition có playlist liệt kê segment).

**Bước 3 — Deep dive: adaptive bitrate (ABR).** Đây là trái tim của trải nghiệm: **player phía client** liên tục đo **bandwidth thực tế** (tốc độ tải segment vừa rồi) và **mức buffer** đang có → **tự quyết định quality cho segment tiếp theo**. Mạng khoẻ + buffer đầy → leo lên 1080p; mạng tụt → rớt xuống 480p **thay vì dừng hình rebuffer**. Toàn bộ logic ở client, server chỉ serve file tĩnh — đó là vẻ đẹp của HLS/DASH: chạy trên HTTP thường, cache được mọi nơi. Segment ngắn (2-4s) thì switch quality và latency tốt hơn; dài (6-10s) thì nén hiệu quả và ít request hơn.

**Bước 4 — CDN + trade-offs.** Vì video là 90%+ băng thông, **CDN là bắt buộc, không phải tối ưu thêm**: segment là file tĩnh bất biến → cache hoàn hảo tại edge gần user; **origin shield** (tầng cache trung gian) gom request từ các edge để origin không bị dập khi cache miss đồng loạt; nội dung phổ biến (top trending) gần như không bao giờ chạm origin. Netflix đi xa nhất với **Open Connect**: đặt hẳn cache server **bên trong datacenter của ISP** — traffic không ra khỏi mạng ISP, vừa rẻ vừa nhanh. **DRM** (Widevine/FairPlay/PlayReady) cho nội dung bản quyền: segment encrypt, license server phát key — nói ngắn gọn là đủ. **Live vs VOD** khác gì: live không có sẵn toàn bộ segment — encode real-time, manifest cập nhật liên tục, player bám sát "live edge", trade-off latency (chunk nhỏ, LL-HLS) vs ổn định; VOD thì precompute hết, cache trọn đời.

### Thiết kế minh hoạ

```text
UPLOAD PATH (write — ít)                    WATCH PATH (read — khổng lồ, 90%+ bandwidth)
[Creator] ─► [Upload Svc] ─► [Object        [Player/Client]
              resumable      Storage raw]     │ 1. GET master.m3u8 (manifest)
                  │                           │ 2. đo bandwidth + buffer
                  ▼                           │ 3. CHỌN quality segment tiếp theo
            [Queue] ─► [Transcoding Workers]  ▼
                       song song per       [CDN Edge] ◄─ cache segment (file tĩnh bất biến)
                       resolution:            │ miss
                       240p│480p│720p│        ▼
                       1080p│4K + AV1      [Origin Shield] ─► [Object Storage segments]
                       → segment 2-10s        (gom miss, chắn origin)
                       → manifest .m3u8    Netflix Open Connect: cache đặt TRONG ISP
```

```text
HLS manifest — adaptive bitrate ladder:

# master.m3u8 — player chọn rendition theo bandwidth đo được
#EXT-X-STREAM-INF:BANDWIDTH=400000,RESOLUTION=426x240
240p/playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720
720p/playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=8000000,RESOLUTION=1920x1080
1080p/playlist.m3u8

# 720p/playlist.m3u8 — danh sách segment của rendition 720p
#EXTINF:4.0,
segment_000.ts        ← mỗi segment 4s, file tĩnh, cache trọn đời tại CDN
#EXTINF:4.0,
segment_001.ts
```

```typescript
// Logic ABR phía player (rút gọn) — server không tham gia quyết định
function pickNextQuality(measuredKbps: number, bufferSec: number, ladder: Rendition[]) {
  // Buffer thấp → ưu tiên SỐNG SÓT: rớt quality thay vì dừng hình rebuffer
  if (bufferSec < 5) return ladder[0]; // thấp nhất, nạp buffer nhanh

  // Chọn rendition cao nhất mà bandwidth gánh được (chừa hệ số an toàn 0.8)
  const affordable = ladder.filter((r) => r.bandwidthKbps < measuredKbps * 0.8);
  return affordable.at(-1) ?? ladder[0]; // mạng khoẻ + buffer đầy → leo dần lên 4K
}
```

### Đáp án mẫu

> "Insight đầu tiên của em: video chiếm hơn 90% băng thông, nên kiến trúc xoay quanh việc đẩy bytes ra rìa mạng. Upload path: file gốc vào object storage, queue đẩy job cho **transcoding workers chạy song song per resolution** — encode bitrate ladder từ 240p tới 4K bằng H.264 cho tương thích và AV1 để tiết kiệm băng thông, rồi **chia segment 2-10 giây kèm manifest HLS `.m3u8`**. Trái tim trải nghiệm là **adaptive bitrate**: player liên tục đo bandwidth và mức buffer rồi tự chọn quality cho segment tiếp theo — mạng tụt thì rớt xuống 480p thay vì đứng hình rebuffer; toàn bộ logic ở client, server chỉ serve file tĩnh. Vì segment bất biến nên **CDN cache hoàn hảo**: edge gần user, origin shield gom cache miss chắn cho origin; Netflix còn đặt hẳn **Open Connect server trong ISP** để traffic không ra khỏi mạng nhà mạng. Nội dung bản quyền thì DRM — segment encrypt, license server phát key. Live khác VOD ở chỗ encode real-time, manifest cập nhật liên tục và phải đánh đổi latency với độ ổn định."

---

## Bẫy thường gặp khi trả lời

| Sai lầm                                                          | Đúng là                                                                                          |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Lao thẳng vào vẽ kiến trúc khi chưa hỏi requirements              | Luôn chốt functional/non-functional + ước lượng capacity trước — con số quyết định thiết kế        |
| Autocomplete: query DB `LIKE 'prefix%'` mỗi keystroke             | Trie in-memory với top-K precompute tại mỗi node + pipeline offline rebuild — đổi memory lấy speed |
| Payment: lưu số dư trong 1 cột rồi UPDATE, tiền dùng float        | Double-entry ledger append-only, số dư = SUM entries; số tiền là integer cents                     |
| "Retry payment thì check xem đã charge chưa rồi mới charge"       | Check-rồi-charge vẫn race — phải có idempotency key với unique constraint, trả lại response cũ     |
| Gửi ID token tới API làm credential                               | ID token cho client (authentication); API chỉ nhận access token (authorization)                    |
| "JWT stateless nên không revoke được, đành chịu"                  | Access token ngắn 5-15 phút + refresh token server-side + rotation + blacklist jti khi khẩn cấp    |
| "Active-active chỉ là chạy service ở 2 region"                    | Stateless dễ — khó nhất là DATA: write conflict, home region per user, data residency              |
| News feed: chọn cứng push hoặc pull cho mọi user                  | Hybrid theo phân phối power law — user thường push, celebrity pull merge lúc đọc                   |
| Uber: index B-tree trên (lat, long) rồi range query               | B-tree kém với query 2 chiều — dùng geohash/H3/quadtree; query luôn kèm neighbor cells             |
| Match tài xế theo khoảng cách đường chim bay                      | Rank theo ETA từ routing engine — bên kia sông gần về mét nhưng xa về phút                         |
| Đặt vé: `SELECT` thấy ghế trống rồi `UPDATE` thành booked         | Race condition — phải atomic: Redis SETNX TTL hoặc `SELECT FOR UPDATE`, payment xong mới confirm   |
| Streaming: "server chọn quality cho user theo thiết bị"           | ABR do PLAYER quyết định theo bandwidth + buffer đo được; server chỉ serve segment tĩnh            |
| Kết thúc thiết kế mà không nêu trade-off                          | Mỗi lựa chọn phải kèm cái giá: freshness vs latency, consistency vs availability, cost vs đơn giản |
