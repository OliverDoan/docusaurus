---
sidebar_position: 5
title: "5. CSS, Deploy, SSR, Test & Fault isolation"
---

# CSS, Deployment, SSR, Testing & Fault Isolation

> *Nhóm câu hỏi "vận hành thực tế" của micro-frontend: cô lập style, deploy độc lập, render phía server, kiểm thử nhiều mảnh và đảm bảo một mảnh lỗi không kéo sập cả trang. Đây là chỗ phân biệt người đã từng chạy MFE trên production với người chỉ đọc lý thuyết Module Federation.*

:::note[Ghi nhớ nhanh]

- ⭐ **Cô lập CSS đi từ nhẹ tới triệt để** — prefix/BEM (theo quy ước, yếu) → CSS Modules (build-time) → CSS-in-JS scoped (runtime) → Shadow DOM (tuyệt đối).
- **Gốc vấn đề CSS** — global namespace và cascade; một selector `.button` hay reset `* { margin: 0 }` rò rỉ ra cả document và đè MFE khác.
- **Fault isolation** — bọc mỗi MFE trong Error Boundary + fallback UI để một mảnh lỗi không kéo sập cả trang.
- **Deploy độc lập** — mỗi MFE có pipeline và version riêng; host trỏ tới `remoteEntry.js` mới nhất qua manifest.
- **SSR MFE khó hơn** — cần render từng mảnh phía server rồi hydrate; cân nhắc trước khi chọn client-side runtime integration.

:::

---

## Câu 18: Làm sao tách biệt CSS để các micro-frontend không ghi đè style của nhau? `[Intermediate]`

### Câu hỏi

> Khi nhiều micro-frontend cùng render trên một trang, CSS của team A dễ ghi đè lên team B. Em có những kỹ thuật nào để cô lập style, và mức độ cô lập của từng kỹ thuật ra sao?

### Giải thích lý thuyết

Vấn đề gốc: CSS có **global namespace** và cascade. Một selector `.button` hay một global reset (`* { margin: 0 }`) trong MFE-A sẽ rò rỉ ra toàn document và đè lên MFE-B. Các kỹ thuật cô lập đi từ nhẹ tới triệt để:

| Kỹ thuật | Mức cô lập | Cơ chế | Đánh đổi |
| --- | --- | --- | --- |
| **Namespace / prefix class** (BEM + team prefix) | Theo quy ước (yếu) | Đặt tên class theo `teamA-card__title` để tránh trùng | Phụ thuộc kỷ luật, không chặn global selector / reset |
| **CSS Modules** | Build-time (tốt) | Bundler tự hash class → `card_x7f2a`, scope theo file | Vẫn cùng một CSSOM; selector toàn cục viết tay vẫn rò rỉ |
| **CSS-in-JS scoped** (styled-components, emotion) | Runtime (tốt) | Sinh class hash động lúc render | Chi phí runtime, cần đồng bộ version thư viện giữa MFE |
| **Shadow DOM** | Tuyệt đối | Style đóng kín trong shadow root, không vào/ra | Khó share design token, một số thư viện không hoạt động trong shadow |

Nguyên tắc thực chiến:

- **Tránh global selector và reset toàn cục** trong từng MFE — đây là nguồn rò rỉ số một. Reset chỉ nên đặt một lần ở shell.
- **Chia sẻ nhất quán qua design tokens** bằng CSS variables (`--color-primary`) khai báo ở `:root` của shell. Token là biến toàn cục *cố ý*, còn style triển khai thì cô lза theo MFE.
- **Shadow DOM** cho cô lập tuyệt đối, nhưng phải bơm token xuyên qua biên (CSS custom properties *kế thừa* được vào shadow tree, nên token vẫn dùng được).
- Kết hợp: prefix + CSS Modules cho phần lớn trường hợp; Shadow DOM khi nhúng widget của bên thứ ba không kiểm soát được CSS.

> **Insight phỏng vấn:** Nói được "CSS variables xuyên thủng được Shadow DOM nhờ inheritance" cho thấy em hiểu vì sao token vẫn share được trong khi style thì bị cô lập — điểm mà nhiều ứng viên trả lời sai.

### Code minh hoạ

```css
/* shell: chỉ shell mới được đặt reset + design token toàn cục */
:root {
  --color-primary: #2563eb;
  --space-md: 16px;
  --radius: 8px;
}

/* MFE: KHÔNG đặt reset toàn cục như dưới đây — sẽ rò rỉ sang MFE khác
* { margin: 0; box-sizing: border-box; }  <-- TRÁNH */
```

```css
/* Kỹ thuật 1 — Namespace/prefix theo BEM + team prefix (quy ước) */
.teamA-card { padding: var(--space-md); border-radius: var(--radius); }
.teamA-card__title { color: var(--color-primary); }
```

```tsx
// Kỹ thuật 2 — CSS Modules: bundler tự hash class, scope theo file
import styles from "./Card.module.css"; // .title -> "Card_title__x7f2a"

export function Card() {
  // class đã được hash, không thể trùng với MFE khác
  return <div className={styles.title}>Sản phẩm</div>;
}
```

```ts
// Kỹ thuật 3 — Shadow DOM: cô lập style tuyệt đối, nhưng vẫn nhận được token
class MfeWidget extends HTMLElement {
  connectedCallback() {
    // mode "open" để debug được; "closed" nếu muốn ẩn hoàn toàn
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        /* style này KHÔNG rò ra ngoài, và CSS ngoài KHÔNG lọt vào */
        .btn {
          background: var(--color-primary); /* token từ :root kế thừa xuyên shadow */
          padding: var(--space-md);
        }
      </style>
      <button class="btn">Mua ngay</button>
    `;
  }
}
customElements.define("mfe-widget", MfeWidget);
```

### Đáp án mẫu

> "Gốc rễ là CSS có namespace toàn cục, nên em đi theo nhiều lớp. Lớp nền là kỷ luật: cấm global selector và reset trong từng MFE, reset chỉ đặt một lần ở shell; đặt tên class theo BEM kèm prefix của team. Mạnh hơn thì dùng CSS Modules hoặc CSS-in-JS để bundler tự hash class theo file, gần như loại bỏ trùng tên. Khi cần cô lập tuyệt đối — ví dụ nhúng widget bên thứ ba — em dùng Shadow DOM, style đóng kín trong shadow root. Điểm quan trọng là phần *cố ý* share thì em làm qua design token bằng CSS variables khai báo ở `:root` của shell; token kế thừa xuyên được cả Shadow DOM nên giao diện vẫn đồng nhất trong khi style triển khai vẫn bị cô lập. Quy tắc của em: prefix + CSS Modules cho 90% trường hợp, Shadow DOM cho phần không kiểm soát được."

---

## Câu 19: Independent deployment trong micro-frontend đạt được bằng cách nào? `[Intermediate]`

### Câu hỏi

> Một trong những lời hứa lớn nhất của micro-frontend là deploy độc lập từng team. Về kỹ thuật, điều đó đạt được nhờ cơ chế gì, và khác gì so với tích hợp ở build-time?

### Giải thích lý thuyết

"Independent deployment" = team A đẩy phiên bản mới của MFE-A lên production mà **không cần rebuild hay redeploy shell** và các MFE khác. Điều này chỉ đạt được khi tích hợp xảy ra ở **runtime**, không phải build-time.

| | Build-time integration | Runtime integration |
| --- | --- | --- |
| Cách nhúng | MFE là npm package, host `import` rồi bundle chung | Host tải remote lúc chạy (`remoteEntry.js` / import map) |
| Đổi 1 MFE | Phải **rebuild + redeploy host** | Chỉ deploy MFE đó, host không đổi |
| Coupling | Chặt (cùng một bundle) | Lỏng (chỉ phụ thuộc contract) |
| Tốc độ release | Theo nhịp của host | Độc lập từng team |

Cơ chế runtime cốt lõi:

- **Manifest / version resolution:** host không hardcode URL mà đọc một manifest (hoặc import map) để biết "MFE-A đang ở version nào, URL nào". Deploy = cập nhật manifest → host trỏ sang artifact mới ở lần load kế tiếp.
- **Versioning artifact trên CDN:** mỗi build đẩy lên CDN với URL bất biến (`.../mfe-a/v2.3.1/remoteEntry.js`), bật cache vĩnh viễn. Rollback chỉ là trỏ manifest về version cũ.
- **Blue-green / canary per MFE:** vì mỗi MFE deploy riêng, có thể canary 5% traffic sang version mới của riêng MFE-A bằng cách cho manifest trả version khác nhau theo cohort.
- **Contract / integration test:** rủi ro của independent deploy là **vỡ contract** — MFE-A đổi shape props mà shell không biết. Phải có contract test trong CI để chặn deploy nếu phá vỡ interface đã thoả thuận.

> **Insight phỏng vấn:** Nói rõ "deploy = cập nhật manifest, rollback = trỏ manifest về version cũ" cho thấy em hiểu deploy độc lập là bài toán *resolution + versioning*, không chỉ là "có Module Federation là xong".

### Code minh hoạ

```yaml
# manifest.json trên CDN — nguồn sự thật về version đang chạy của từng MFE
# Deploy MFE = cập nhật entry này, KHÔNG cần build lại host
{
  "products": "https://cdn.example.com/mfe-products/v2.3.1/remoteEntry.js",
  "cart":     "https://cdn.example.com/mfe-cart/v1.8.0/remoteEntry.js"
}
```

```ts
// host: resolve URL remote tại runtime từ manifest thay vì hardcode
async function loadManifest(): Promise<Record<string, string>> {
  // manifest có thể canary: trả version khác nhau theo cohort user
  const res = await fetch("https://cdn.example.com/manifest.json", {
    cache: "no-store", // luôn lấy bản mới nhất
  });
  if (!res.ok) throw new Error(`Không tải được manifest: ${res.status}`);
  return res.json();
}

// nạp script remoteEntry động theo URL lấy từ manifest
async function loadRemoteEntry(url: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Lỗi tải remote: ${url}`));
    document.head.appendChild(script);
  });
}
```

```ts
// Cách runtime injection khác: cập nhật import map khi deploy (chuẩn web)
// Khi deploy MFE-cart v1.9.0, chỉ cần sửa "cart" trỏ URL mới — host bất biến
const importMap = {
  imports: {
    cart: "https://cdn.example.com/mfe-cart/v1.9.0/cart.js",
  },
};
const el = document.createElement("script");
el.type = "importmap";
el.textContent = JSON.stringify(importMap);
document.head.appendChild(el);
```

### Đáp án mẫu

> "Deploy độc lập đạt được nhờ tích hợp ở runtime chứ không phải build-time. Nếu MFE là npm package được host bundle chung thì đổi gì cũng phải rebuild và redeploy host — coupling chặt. Ngược lại, host tải remote lúc chạy qua `remoteEntry.js` hoặc import map, và không hardcode URL mà đọc một manifest để biết mỗi MFE đang ở version nào. Mỗi build đẩy lên CDN với URL bất biến theo version và cache vĩnh viễn; deploy nghĩa là cập nhật manifest trỏ sang artifact mới, rollback chỉ là trỏ ngược lại — không động đến host. Vì độc lập từng MFE nên em làm được canary hay blue-green riêng cho một team bằng cách cho manifest trả version khác nhau theo cohort. Cái giá phải trả là rủi ro vỡ contract giữa host và remote, nên em luôn gắn contract test trong CI để chặn deploy nếu phá interface đã thoả thuận."

---

## Câu 20: Server-side rendering (SSR) với micro-frontend khác gì so với tích hợp ở client? `[Advanced]`

### Câu hỏi

> Phần lớn ví dụ micro-frontend là tích hợp ở client. Khi cần SSR cho SEO và TTFB, bài toán thay đổi thế nào? Những thách thức kỹ thuật nào xuất hiện?

### Giải thích lý thuyết

**Client integration:** shell tải HTML rỗng, JS chạy rồi mới fetch và mount từng MFE. Đơn giản, deploy độc lập dễ, nhưng **TTFB tốt mà FCP/SEO kém** — crawler và lần paint đầu thấy trang trống cho tới khi JS chạy.

**SSR integration:** mỗi MFE phải render ra HTML **ở phía server**, rồi **compose** các mảnh HTML lại trước khi gửi về client. Có vài cách compose:

| Cách compose | Cơ chế | Đặc điểm |
| --- | --- | --- |
| **Server-side composition (template)** | Một orchestrator gọi từng MFE service, ghép HTML | Linh hoạt, tự kiểm soát; phải tự lo hydration/asset |
| **SSI / ESI** | Web server / CDN ghép fragment qua `<esi:include>` | Compose ở tầng edge, không cần app code |
| **Streaming composition** (Tailor, Podium) | Stream từng fragment ngay khi sẵn sàng | TTFB tốt, mảnh chậm không chặn mảnh nhanh |
| **Next.js Multi-Zones / RSC, Piral** | Framework lo composition + hydration | Ít boilerplate, gắn với framework |

Thách thức riêng của SSR MFE:

- **Hydration nhiều mảnh:** mỗi fragment cần JS bundle riêng để "hydrate"; phải đảm bảo HTML server khớp client của *đúng* MFE, nếu lệch sẽ hydration mismatch.
- **Phối hợp `<head>` và assets:** mỗi MFE có CSS/JS/meta riêng — phải gom và dedupe vào `<head>` chung, tránh nạp trùng React/thư viện share.
- **Chia sẻ dữ liệu / streaming:** dữ liệu fetch ở server cần truyền xuống client để tránh fetch lại; với streaming phải quyết định mảnh nào chặn mảnh nào.
- **Độ trễ:** orchestrator chờ tất cả MFE render xong → mảnh chậm nhất quyết định TTFB; vì vậy streaming hoặc timeout + fallback rất quan trọng.

> **Insight phỏng vấn:** Phân biệt được "TTFB" (server trả byte đầu) với "FCP/SEO" (nội dung nhìn thấy / crawl được) là cách thuyết phục nhất để giải thích vì sao chọn SSR dù phức tạp hơn.

### Code minh hoạ

```ts
// Server-side composition đơn giản: orchestrator gọi từng MFE rồi ghép HTML.
// Mỗi MFE là một endpoint trả về fragment HTML đã render.
import express from "express";

const app = express();

// gọi 1 MFE với timeout + fallback để mảnh lỗi/chậm không treo cả trang
async function fetchFragment(url: string, fallback: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 300); // budget 300ms
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`Fragment lỗi: ${res.status}`);
    return await res.text();
  } catch (err) {
    console.error(`Fallback cho ${url}:`, err);
    return fallback; // trả HTML dự phòng thay vì làm hỏng trang
  }
}

app.get("/", async (_req, res) => {
  // gọi song song để TTFB = mảnh chậm nhất, không phải tổng
  const [products, cart] = await Promise.all([
    fetchFragment("http://mfe-products/render", "<div>Sản phẩm tạm thời trống</div>"),
    fetchFragment("http://mfe-cart/render", "<div>Giỏ hàng tạm thời trống</div>"),
  ]);

  // compose: ghép fragment + gom asset cho hydration phía client
  res.send(`
    <!DOCTYPE html>
    <html>
      <head><link rel="stylesheet" href="/assets/shared.css" /></head>
      <body>
        <main>${products}${cart}</main>
        <script src="/assets/products.client.js" defer></script>
        <script src="/assets/cart.client.js" defer></script>
      </body>
    </html>
  `);
});
```

```js
// Next.js Multi-Zones: mỗi zone là một app Next độc lập, deploy riêng,
// được ghép dưới cùng một domain qua rewrites ở app "shell".
// next.config.js của shell
module.exports = {
  async rewrites() {
    return [
      // /products/* được phục vụ bởi app Next khác (SSR độc lập)
      { source: "/products", destination: "https://products.example.com/products" },
      { source: "/products/:path*", destination: "https://products.example.com/products/:path*" },
    ];
  },
};
```

### Đáp án mẫu

> "Ở client integration, shell trả HTML rỗng rồi JS mới fetch và mount từng MFE — đơn giản và deploy độc lập dễ, nhưng lần paint đầu và SEO kém vì crawler thấy trang trống. SSR thì mỗi MFE phải render HTML ngay ở server và một orchestrator compose các mảnh lại trước khi gửi về — có thể làm bằng server-side composition tự viết, SSI/ESI ở tầng edge, streaming như Tailor/Podium, hoặc framework như Next.js Multi-Zones và RSC. Thách thức là: hydration nhiều mảnh và phải khớp HTML server với client của đúng MFE kẻo mismatch; gom và dedupe `<head>`, CSS, JS share để không nạp trùng React; truyền dữ liệu fetch ở server xuống client để khỏi fetch lại; và độ trễ — vì TTFB bị quyết bởi mảnh chậm nhất nên em gọi song song, đặt timeout kèm fallback, ưu tiên streaming để mảnh nhanh hiển thị trước. Đổi lại sự phức tạp đó là SEO và FCP tốt hơn hẳn client integration."

---

## Câu 21: Test micro-frontend như thế nào? `[Intermediate]`

### Câu hỏi

> Kiến trúc micro-frontend có nhiều mảnh deploy độc lập. Em xây dựng chiến lược test theo những tầng nào, và tầng nào là quan trọng nhất để bảo vệ khả năng deploy độc lập?

### Giải thích lý thuyết

Chiến lược test cho MFE là một "pyramid mở rộng" qua biên giữa các team:

| Tầng | Phạm vi | Công cụ điển hình | Mục đích |
| --- | --- | --- | --- |
| **Unit / component** | Trong từng MFE | Jest + RTL, Vitest | Logic và UI của riêng team, chạy nhanh trong CI của MFE |
| **Contract test** | Biên host ↔ remote | Pact, hoặc test interface tự định nghĩa | Đảm bảo remote vẫn cung cấp đúng shape mà host mong đợi |
| **Integration** | Compose vài MFE | Jest + mock remote / test harness | Các mảnh ghép lại có hoạt động cùng nhau không |
| **E2E** | Toàn flow qua shell | Playwright, Cypress | Hành vi thật end-to-end trên môi trường tích hợp |
| **Visual regression** | Giao diện | Playwright snapshot, Chromatic | Giữ nhất quán UI, bắt lệch style giữa các MFE |

Điểm mấu chốt: **contract test là chìa khoá cho independent deploy.** Vì mỗi MFE deploy riêng, không ai chạy lại toàn bộ E2E cho mọi deploy nhỏ; contract test (chạy nhanh, không cần dựng cả hệ thống) chặn được việc một team đổi interface làm vỡ team khác *trước khi* lên production. E2E xác nhận lần cuối trên môi trường integration, nhưng nó chậm và đắt nên không thay thế contract test.

> **Insight phỏng vấn:** Nhấn mạnh "contract test bảo vệ independent deploy, E2E chỉ là lưới an toàn cuối" cho thấy em hiểu vì sao kiến trúc phân tán cần dịch chuyển trọng tâm test sang biên contract chứ không dồn hết vào E2E.

### Code minh hoạ

```ts
// Contract test: định nghĩa interface mà host mong đợi ở remote, chạy
// trong CI của remote để chặn deploy nếu phá vỡ shape đã thoả thuận.
import { mount } from "mfe-products"; // hàm mount mà host sẽ gọi

describe("contract: mfe-products", () => {
  it("export đúng hàm mount với chữ ký host mong đợi", () => {
    expect(typeof mount).toBe("function");
  });

  it("mount render vào container và trả về hàm unmount", () => {
    const container = document.createElement("div");
    const unmount = mount(container, { userId: "u1", locale: "vi" });
    expect(container.children.length).toBeGreaterThan(0);
    expect(typeof unmount).toBe("function"); // host cần unmount khi điều hướng
  });
});
```

```ts
// Integration test: mock remote trong host để kiểm tra compose,
// không cần dựng remote thật.
jest.mock("products/Widget", () => ({
  __esModule: true,
  default: () => <div data-testid="products-widget">Mock products</div>,
}));

import { render, screen } from "@testing-library/react";
import { Shell } from "./Shell";

it("shell compose được remote products", () => {
  render(<Shell />);
  expect(screen.getByTestId("products-widget")).toBeInTheDocument();
});
```

```ts
// E2E qua shell trên môi trường tích hợp (Playwright)
import { test, expect } from "@playwright/test";

test("thêm sản phẩm từ MFE-products vào MFE-cart", async ({ page }) => {
  await page.goto("https://staging.example.com");
  await page.getByRole("button", { name: "Thêm vào giỏ" }).first().click();
  // kiểm tra giao tiếp giữa hai MFE phản ánh đúng trên UI
  await expect(page.getByTestId("cart-count")).toHaveText("1");
});
```

### Đáp án mẫu

> "Em chia theo tầng. Trong từng MFE là unit và component test bằng Jest hoặc Vitest, chạy nhanh trong CI riêng của team. Ở biên giữa host và remote là contract test — đây là tầng quan trọng nhất với MFE, vì mỗi mảnh deploy độc lập nên em cần một test nhanh chặn việc một team đổi shape props hay đổi chữ ký hàm mount làm vỡ team khác trước khi lên production, có thể dùng Pact hoặc một interface contract tự định nghĩa. Tiếp đến là integration test khi compose vài MFE, thường mock remote để khỏi dựng cả hệ thống. Trên cùng là E2E qua shell bằng Playwright hoặc Cypress trên môi trường tích hợp, cộng visual regression để giữ nhất quán giao diện. Triết lý của em là dồn trọng tâm vào contract test để bảo vệ deploy độc lập, còn E2E là lưới an toàn cuối — chậm và đắt nên không lạm dụng."

---

## Câu 22: Làm sao để một micro-frontend lỗi không làm sập cả trang (fault isolation)? `[Senior]`

### Câu hỏi

> Trong MFE, một remote có thể tải lỗi, render lỗi runtime, hoặc CDN down. Em thiết kế thế nào để một mảnh hỏng không kéo theo cả ứng dụng trắng trang?

### Giải thích lý thuyết

Mục tiêu fault isolation: lỗi của một MFE phải được **chặn lại trong biên của nó** và thay bằng fallback, phần còn lại của trang vẫn dùng được. Các lớp phòng thủ:

| Lớp | Chặn loại lỗi gì | Cơ chế |
| --- | --- | --- |
| **Error Boundary** (React) | Lỗi render / lifecycle runtime | Bao mỗi MFE bằng boundary riêng, hiển thị fallback UI thay vì văng cả cây |
| **try/catch khi load remote** | Lỗi tải `remoteEntry.js` (CDN down, 404) | Bắt lỗi dynamic import, render fallback |
| **Timeout + retry** | Remote tải quá lâu | `AbortController` cắt sau N ms, retry có giới hạn |
| **Suspense fallback** | Trạng thái đang lazy load | Hiện skeleton trong khi chờ |
| **iframe / Shadow DOM** | Cô lập runtime / CSS / global | Mảnh chạy trong sandbox riêng |
| **single-spa error handling** | Lỗi lifecycle (mount/unmount) | Đăng ký error handler, unmount app lỗi, giữ app khác sống |
| **Monitoring / log per MFE** | Quan sát sau sự cố | Gắn tag MFE + version vào log/metric |

Lưu ý kỹ thuật quan trọng: **Error Boundary của React chỉ bắt lỗi trong lúc render/lifecycle**, không bắt lỗi trong promise của dynamic import — nên cần **kết hợp** try/catch (hoặc `.catch()` của lazy) cho lỗi *tải* remote, và Error Boundary cho lỗi *chạy* remote. Mỗi MFE phải có boundary của *riêng* nó: nếu chỉ bọc một boundary ở gốc cây thì một MFE lỗi vẫn làm trắng toàn bộ vùng con.

> **Insight phỏng vấn:** Phân biệt rõ "Error Boundary bắt lỗi render, không bắt lỗi load" là điểm rất hay quên — nói được nó cho thấy em đã thực sự xử lý sự cố remote trên production.

### Code minh hoạ

```tsx
// Error Boundary bao quanh TỪNG MFE: lỗi render trong MFE-A không lan ra MFE-B
import { Component, type ReactNode } from "react";

type Props = { name: string; children: ReactNode };
type State = { hasError: boolean };

class MfeErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    // log kèm tên MFE để truy vết theo từng mảnh
    console.error(`[MFE ${this.props.name}] lỗi render:`, error);
    // gửi về monitoring với tag MFE + version ở đây
  }

  render() {
    if (this.state.hasError) {
      // fallback UI: phần còn lại của trang vẫn sống
      return <div className="mfe-fallback">Khu vực "{this.props.name}" tạm thời gián đoạn.</div>;
    }
    return this.props.children;
  }
}
```

```tsx
// Load remote động có fallback khi tải lỗi + timeout + Suspense
import { lazy, Suspense } from "react";

// lazy bắt được lỗi TẢI module qua Error Boundary phía ngoài,
// nhưng ta vẫn tự bọc timeout để CDN chậm không treo vô hạn.
function lazyWithTimeout(factory: () => Promise<{ default: React.ComponentType }>, ms = 5000) {
  return lazy(() =>
    Promise.race([
      factory(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Tải remote quá thời gian")), ms)
      ),
    ]).catch((err) => {
      console.error("Không tải được remote:", err);
      // trả về component fallback thay vì để promise reject làm vỡ cây
      return { default: () => <div className="mfe-fallback">Không tải được module.</div> };
    })
  );
}

const RemoteProducts = lazyWithTimeout(() => import("products/Widget"));

export function ProductsSlot() {
  return (
    // Boundary bắt lỗi RENDER của remote; lazyWithTimeout xử lý lỗi TẢI
    <MfeErrorBoundary name="products">
      <Suspense fallback={<div className="skeleton">Đang tải sản phẩm…</div>}>
        <RemoteProducts />
      </Suspense>
    </MfeErrorBoundary>
  );
}
```

### Đáp án mẫu

> "Nguyên tắc là chặn lỗi trong biên của từng MFE và thay bằng fallback, phần còn lại vẫn chạy. Em bọc mỗi MFE bằng Error Boundary riêng — không phải một boundary ở gốc, vì như thế một mảnh lỗi vẫn làm trắng cả vùng con. Nhưng Error Boundary chỉ bắt lỗi render và lifecycle, không bắt được lỗi tải remote, nên với dynamic import em thêm try/catch hoặc `.catch()` để khi CDN down hay `remoteEntry.js` 404 thì trả về component fallback thay vì để promise reject làm vỡ cây; kèm timeout bằng AbortController và retry có giới hạn để remote chậm không treo vô hạn, và Suspense hiện skeleton trong lúc chờ. Cần cô lập mạnh hơn thì cho mảnh chạy trong iframe hoặc Shadow DOM để runtime và CSS không đụng nhau; với single-spa thì đăng ký error handler để unmount app lỗi mà giữ app khác sống. Cuối cùng em gắn tag MFE và version vào log và metric để biết chính xác mảnh nào hỏng và rollback đúng version."

---

## Bẫy thường gặp khi trả lời

| Sai lầm | Đúng là |
| --- | --- |
| "Đặt tên class theo BEM là đủ cô lập CSS" | Quy ước chỉ chặn trùng tên, không chặn global selector/reset rò rỉ; cần CSS Modules / Shadow DOM cho cô lập thật |
| "Shadow DOM thì không share được design token" | CSS variables *kế thừa* xuyên qua shadow root nên token vẫn dùng được; chỉ style triển khai mới bị cô lập |
| "Có Module Federation là tự động deploy độc lập" | Phải resolve version qua manifest/import map ở runtime; deploy = cập nhật manifest, rollback = trỏ về version cũ |
| "Build-time integration vẫn deploy độc lập được" | MFE là npm package thì đổi gì cũng phải rebuild + redeploy host — coupling chặt |
| "SSR MFE chỉ là render mỗi mảnh rồi nối chuỗi" | Phải lo hydration nhiều mảnh, dedupe `<head>`/asset, truyền dữ liệu server→client, và độ trễ do mảnh chậm nhất |
| "Client integration cũng tốt cho SEO như SSR" | Crawler và FCP thấy trang trống tới khi JS chạy; SSR mới có HTML sẵn cho SEO/FCP |
| "Cứ nhiều E2E là test được micro-frontend" | E2E chậm/đắt, không chạy cho mọi deploy nhỏ; contract test mới là tầng bảo vệ independent deploy |
| "Một Error Boundary ở gốc là đủ chống sập trang" | Cần boundary cho *từng* MFE, nếu không một mảnh lỗi vẫn làm trắng cả vùng con |
| "Error Boundary bắt được luôn lỗi tải remote" | Boundary chỉ bắt lỗi render/lifecycle; lỗi tải remote phải dùng try/catch + timeout + fallback riêng |
