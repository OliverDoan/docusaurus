---
sidebar_position: 5
title: "5. Nền tảng (bổ sung)"
---

# Nền tảng (bổ sung)

> _Tổng hợp các khái niệm nền tảng TypeScript hay gặp trong phỏng vấn nhưng thường bị bỏ qua — từ lý do ra đời đến các tính năng type system ít được chú ý._

:::note[Ghi nhớ nhanh]

- ⭐ **TS là superset có kiểu tĩnh của JS** — compile bằng `tsc` sang JS, bắt lỗi ở compile-time thay vì runtime; lợi cho IDE, refactor, dự án lớn.
- ⭐ **Excess property checking** — báo lỗi thuộc tính dư chỉ với object literal trực tiếp; gán qua biến trung gian hoặc `as` thì bỏ qua (structural typing).
- **Annotation vs inference** — dùng `:` khai báo tường minh; để TS tự suy luận khi có giá trị khởi tạo; bắt buộc annotate param và biến chưa gán.
- **Tuple** — mảng số phần tử cố định, kiểu theo vị trí (`[value, setter]` như `useState`); có named tuple và optional element.
- **`?` và `readonly`** — optional cần xử lý `undefined`; readonly ngăn gán lại sau khởi tạo; áp hàng loạt bằng `Partial<T>`/`Readonly<T>`.
- **Non-null assertion `!`** — chỉ compile-time, không kiểm tra runtime; ưu tiên `?.` và `??` an toàn hơn.
- **Index signature vs `Record`** — `[key: string]: V` cho key chưa biết tên; `Record<K, V>` ngắn gọn hơn và hỗ trợ union key cụ thể.
- **`.d.ts` & `import type`** — declaration file mô tả shape module JS (cài `@types/*` hoặc tự viết); `import type`/`export type` bị xoá khi compile, tránh circular dependency và tối ưu bundle.

:::

---

## Câu 1: TypeScript là gì và tại sao nên dùng TypeScript thay JavaScript? `[Basic]`

### Câu hỏi

> TypeScript là gì? Nêu những lý do chính khiến bạn chọn TypeScript thay vì JavaScript thuần?

### Giải thích lý thuyết

TypeScript là một **superset có kiểu tĩnh** (statically typed superset) của JavaScript do Microsoft phát triển. Mọi file JavaScript hợp lệ đều là TypeScript hợp lệ, nhưng TypeScript bổ sung thêm hệ thống kiểu và được biên dịch (transpile) sang JavaScript trước khi chạy.

**Lý do nên dùng TypeScript:**

| Tiêu chí | JavaScript | TypeScript |
|---|---|---|
| Phát hiện lỗi | Lúc runtime | Lúc compile-time |
| IDE support | Hạn chế | IntelliSense đầy đủ |
| Refactoring | Dễ sai sót | An toàn hơn |
| Tài liệu hóa | Cần comment | Types là tài liệu |
| Scale | Khó với dự án lớn | Phù hợp dự án lớn |

**Quy trình hoạt động:**

```
TypeScript (.ts) → tsc (compiler) → JavaScript (.js) → Runtime (Node/Browser)
```

Lỗi type được bắt ở bước `tsc`, **trước khi** code chạy.

### Code minh hoạ

```typescript
// JavaScript thuần — lỗi chỉ phát hiện lúc runtime
function tinhTong(a, b) {
  return a + b;
}
console.log(tinhTong(5, "3")); // "53" — không báo lỗi!

// TypeScript — lỗi phát hiện ngay lúc viết code
function tinhTongTS(a: number, b: number): number {
  return a + b;
}
// tinhTongTS(5, "3"); // Lỗi compile: Argument of type 'string' is not assignable to parameter of type 'number'
console.log(tinhTongTS(5, 3)); // 8 — đúng

// Types đóng vai trò tài liệu sống
interface NguoiDung {
  id: number;
  ten: string;
  email: string;
  tuoi?: number; // optional
}

function chaoNguoiDung(nguoiDung: NguoiDung): string {
  return `Xin chào, ${nguoiDung.ten}!`;
}
```

### Đáp án mẫu

> TypeScript là superset có kiểu tĩnh của JavaScript, bổ sung type annotations và được compile sang JS. Lợi ích chính: bắt lỗi sớm ở compile-time, IDE hỗ trợ tốt hơn, code dễ đọc và bảo trì hơn — đặc biệt quan trọng với các dự án lớn, nhiều người cùng làm.

---

## Câu 2: Type annotation (chú thích kiểu) trong TypeScript là gì? `[Basic]`

### Câu hỏi

> Type annotation là gì? Phân biệt type annotation tường minh và type inference (suy luận kiểu)?

### Giải thích lý thuyết

**Type annotation** là cú pháp dùng dấu `:` để khai báo kiểu dữ liệu tường minh cho biến, tham số, hay giá trị trả về.

**Type inference** là khả năng TypeScript tự suy luận kiểu dựa trên giá trị khởi tạo — không cần annotation.

**Khi nào nên dùng annotation tường minh:**
- Khai báo biến không có giá trị khởi tạo ngay
- Tham số hàm (TypeScript không tự suy luận)
- Giá trị trả về của hàm (để tài liệu hóa rõ ràng)
- Khi kiểu suy luận ra không đủ chính xác

### Code minh hoạ

```typescript
// --- Type annotation tường minh ---
let ten: string = "Thuận";
let tuoi: number = 25;
let laDangNhap: boolean = true;

// Annotation cho mảng
let danhSach: string[] = ["a", "b", "c"];
let soNguyen: number[] = [1, 2, 3];

// Annotation cho hàm
function cong(a: number, b: number): number {
  return a + b;
}

// --- Type inference (không cần annotation) ---
let ten2 = "Thuận";       // TypeScript suy luận: string
let tuoi2 = 25;            // TypeScript suy luận: number
let arr = [1, 2, 3];      // TypeScript suy luận: number[]

// --- Trường hợp cần annotation tường minh ---
// 1. Khai báo trước khi gán
let ketQua: string;
// Không có annotation → TypeScript suy luận kiểu 'any'

// 2. Kiểu union (inference không đủ chính xác)
let id: string | number;
id = "abc-123";
id = 456;

// 3. Kiểu trả về hàm để tài liệu hóa
function layNguoiDung(id: number): { ten: string; email: string } {
  return { ten: "Alice", email: "alice@example.com" };
}
```

### Đáp án mẫu

> Type annotation dùng `:` để khai báo kiểu tường minh; type inference là TypeScript tự suy luận từ giá trị. Nên dùng annotation tường minh cho tham số hàm, biến chưa khởi tạo, và kiểu trả về để code rõ ràng hơn. Với biến có giá trị khởi tạo rõ ràng, inference đủ tốt và không cần annotation dư thừa.

---

## Câu 3: Tuple type trong TypeScript là gì? `[Basic]`

### Câu hỏi

> Tuple type là gì? Khác gì so với mảng thông thường? Khi nào nên dùng tuple?

### Giải thích lý thuyết

**Tuple** là một loại mảng với **số lượng phần tử cố định** và **kiểu của từng phần tử được xác định theo vị trí**. Khác với `array` thông thường (tất cả phần tử cùng kiểu), tuple cho phép mỗi vị trí có kiểu riêng.

| Đặc điểm | `Array` | `Tuple` |
|---|---|---|
| Số phần tử | Tùy ý | Cố định |
| Kiểu phần tử | Đồng nhất | Khác nhau theo vị trí |
| Truy cập | `arr[i]` | `tuple[i]` với type chính xác |
| Dùng khi | Danh sách đồng nhất | Nhóm giá trị liên quan |

**Ứng dụng phổ biến:**
- Giá trị trả về nhiều chiều (như `useState` trong React)
- Dữ liệu có cấu trúc cố định (tọa độ, key-value pair)

### Code minh hoạ

```typescript
// Khai báo tuple
let toaDo: [number, number] = [10.5, 106.3];
let nguoiDung: [string, number, boolean] = ["Alice", 25, true];

// Truy cập — TypeScript biết chính xác kiểu từng vị trí
let ten: string = nguoiDung[0];  // string
let tuoi: number = nguoiDung[1]; // number

// Tuple với nhãn (named tuple) — TypeScript 4.0+
type DiaChi = [thanh_pho: string, quan: string, so_nha: number];
const diaChi: DiaChi = ["Hồ Chí Minh", "Quận 1", 100];

// Destructuring tuple
const [thanhPho, quan, soNha] = diaChi;

// Tuple giả lập useState của React
function useTrangThai<T>(giaTriDau: T): [T, (gt: T) => void] {
  let trangThai = giaTriDau;
  const capNhat = (gtMoi: T) => { trangThai = gtMoi; };
  return [trangThai, capNhat];
}

const [dem, setDem] = useTrangThai(0);
// dem là number, setDem là (gt: number) => void

// Optional elements trong tuple (TypeScript 4.2+)
type HoTen = [ho: string, ten: string, tenDem?: string];
const ten1: HoTen = ["Nguyễn", "Thuận"];
const ten2: HoTen = ["Nguyễn", "Văn", "Thuận"];
```

### Đáp án mẫu

> Tuple là mảng có số phần tử cố định, mỗi vị trí có kiểu xác định. Khác array ở chỗ các phần tử có thể khác kiểu nhau. Dùng tuple khi muốn nhóm các giá trị có ý nghĩa liên quan với nhau — điển hình là pattern trả về `[value, setter]` như `useState` của React.

---

## Câu 4: Optional properties (`?`) và readonly properties là gì? `[Basic]`

### Câu hỏi

> Giải thích optional properties và readonly properties trong TypeScript. Cho ví dụ thực tế?

### Giải thích lý thuyết

**Optional properties** (`?`): Thuộc tính không bắt buộc phải có khi tạo object. TypeScript cho phép bỏ qua thuộc tính đó — giá trị sẽ là `undefined`.

**Readonly properties**: Thuộc tính chỉ được gán một lần (lúc khởi tạo), không thể thay đổi sau đó. Tương tự `const` nhưng cho thuộc tính object.

| Modifier | Ý nghĩa | Lỗi nếu vi phạm |
|---|---|---|
| `?` | Thuộc tính tùy chọn | Không — chỉ cần chú ý `undefined` |
| `readonly` | Thuộc tính chỉ đọc | Compile error khi gán lại |

### Code minh hoạ

```typescript
interface NguoiDung {
  id: number;          // bắt buộc
  ten: string;         // bắt buộc
  email?: string;      // tùy chọn — có thể bỏ qua
  readonly ngayTao: Date; // chỉ đọc — không được thay đổi
}

// Optional: không cần truyền email
const nguoiDung1: NguoiDung = {
  id: 1,
  ten: "Alice",
  ngayTao: new Date(),
};

// Optional: có truyền email thì cũng được
const nguoiDung2: NguoiDung = {
  id: 2,
  ten: "Bob",
  email: "bob@example.com",
  ngayTao: new Date(),
};

// Readonly: không thể gán lại sau khi tạo
// nguoiDung1.ngayTao = new Date(); // Lỗi: Cannot assign to 'ngayTao' because it is a read-only property

// Xử lý optional property an toàn
function hienThiEmail(nd: NguoiDung): string {
  // Dùng optional chaining
  return nd.email ?? "Chưa cung cấp email";
}

// Readonly array
const danhSachBatBien: readonly string[] = ["a", "b", "c"];
// danhSachBatBien.push("d"); // Lỗi: Property 'push' does not exist on type 'readonly string[]'

// Readonly với Utility Type
type NguoiDungBatBien = Readonly<NguoiDung>;

// Optional với Utility Type
type NguoiDungTuyChon = Partial<NguoiDung>; // Tất cả đều optional
```

### Đáp án mẫu

> Optional properties dùng `?` để đánh dấu thuộc tính không bắt buộc — cần xử lý `undefined` khi truy cập. Readonly properties ngăn gán lại sau khởi tạo, phù hợp cho dữ liệu bất biến như id hay ngày tạo. TypeScript cũng cung cấp `Partial<T>` và `Readonly<T>` để áp dụng hàng loạt.

---

## Câu 5: Non-null assertion operator (`!`) là gì? `[Intermediate]`

### Câu hỏi

> Non-null assertion operator (`!`) là gì? Khi nào dùng và khi nào không nên dùng?

### Giải thích lý thuyết

**Non-null assertion operator** (`!`) là cú pháp đặt dấu `!` sau một biểu thức để **thông báo với TypeScript rằng giá trị này chắc chắn không phải `null` hay `undefined`** — dù compiler không thể tự suy luận điều đó.

**Lưu ý quan trọng:** Đây là assertion ở compile-time, **không có hiệu lực lúc runtime**. Nếu giá trị thực sự là `null`/`undefined`, lỗi runtime vẫn xảy ra.

**Khi nên dùng:**
- Bạn chắc chắn 100% giá trị không null (do logic nghiệp vụ đảm bảo)
- Làm việc với DOM — biết phần tử chắc chắn tồn tại
- Sau khi đã kiểm tra null nhưng TypeScript không nhận ra

**Khi không nên dùng:**
- Để tắt lỗi TypeScript mà không hiểu rõ nguyên nhân
- Khi chưa chắc chắn giá trị có tồn tại không

### Code minh hoạ

```typescript
// Tình huống: TypeScript không chắc phần tử DOM có tồn tại
const input = document.getElementById("ten-nguoi-dung");
// Kiểu: HTMLElement | null

// Không an toàn — có thể runtime error nếu element không tồn tại
// input.focus(); // Lỗi compile: 'input' is possibly 'null'

// Cách 1: Non-null assertion (dùng khi chắc chắn tồn tại)
const inputChacChan = document.getElementById("ten-nguoi-dung")!;
// Kiểu: HTMLElement (đã loại bỏ null)
inputChacChan.focus(); // OK với TypeScript

// Cách 2: Kiểm tra null (an toàn hơn — khuyên dùng)
if (input) {
  input.focus(); // TypeScript biết input không null trong block này
}

// Cách 3: Optional chaining (an toàn và ngắn gọn)
input?.focus();

// Ví dụ khác — class property
class XuLyDonHang {
  private nguoiDung!: NguoiDung; // Sẽ được gán trong ngOnInit / init()

  khoiTao(nd: NguoiDung): void {
    this.nguoiDung = nd;
  }

  layTen(): string {
    return this.nguoiDung.ten; // TypeScript tin rằng nguoiDung đã được gán
  }
}

// KHÔNG nên dùng ! để tắt lỗi
function layEmail(nd: NguoiDung | null): string {
  return nd!.email!; // Nguy hiểm — có thể runtime error
  // Nên dùng: return nd?.email ?? "";
}
```

### Đáp án mẫu

> Non-null assertion operator `!` nói với TypeScript "tôi đảm bảo giá trị này không null/undefined". Dùng khi bạn chắc chắn qua logic nghiệp vụ mà compiler không suy luận được — ví dụ thao tác DOM khi biết phần tử tồn tại. Tuy nhiên nên ưu tiên optional chaining `?.` và nullish coalescing `??` vì an toàn hơn ở cả compile-time lẫn runtime.

---

## Câu 6: Index signature trong TypeScript là gì? `[Intermediate]`

### Câu hỏi

> Index signature là gì? Dùng khi nào? Khác gì so với `Record<K, V>`?

### Giải thích lý thuyết

**Index signature** cho phép định nghĩa kiểu cho các thuộc tính **chưa biết tên trước** — chỉ biết kiểu của key và value. Cú pháp: `[key: KieuKey]: KieuValue`.

**Giới hạn của index signature:**
- Key chỉ được là `string`, `number`, hoặc `symbol`
- Tất cả thuộc tính tường minh phải tương thích với kiểu value của index signature

**So sánh với `Record<K, V>`:**

| Tính năng | Index Signature | `Record<K, V>` |
|---|---|---|
| Cú pháp | `[key: string]: V` | `Record<string, V>` |
| Key union cụ thể | Không | Có (`Record<"a" \| "b", V>`) |
| Kết hợp property tường minh | Có (với điều kiện) | Khó hơn |
| Dễ đọc | Trung bình | Ngắn gọn hơn |

### Code minh hoạ

```typescript
// Index signature cơ bản — object với key string bất kỳ
interface BoDemTu {
  [tu: string]: number;
}

const demTu: BoDemTu = {
  "hello": 5,
  "world": 5,
  "typescript": 10,
};

// Thêm key động
demTu["javascript"] = 10;

// Kết hợp thuộc tính tường minh và index signature
interface TrangThai {
  id: number;           // Phải là number — tương thích với index value
  [key: string]: number; // Tất cả key khác cũng phải là number
}

// Trường hợp thực tế — cấu hình dịch ngôn ngữ
interface DichNgu {
  [key: string]: string;
}

const vietAnh: DichNgu = {
  "xin chào": "hello",
  "tạm biệt": "goodbye",
  "cảm ơn": "thank you",
};

// Record<K, V> — cách ngắn gọn hơn cho index signature đơn giản
type DichNguRecord = Record<string, string>;

// Record với union key — chính xác hơn index signature
type MauSac = Record<"do" | "xanh" | "vang", string>;
const mau: MauSac = {
  do: "#FF0000",
  xanh: "#0000FF",
  vang: "#FFFF00",
};
// mau["tim"] = "#..."; // Lỗi — "tim" không nằm trong union

// Truy cập an toàn với index signature
function layGiaTri(obj: BoDemTu, key: string): number {
  return obj[key] ?? 0; // Kết quả có thể undefined nếu key không tồn tại
}
```

### Đáp án mẫu

> Index signature `[key: string]: Value` dùng khi không biết trước tên thuộc tính nhưng biết kiểu key và value — ví dụ bộ đếm từ, bản đồ dịch ngôn ngữ. `Record<K, V>` là cú pháp ngắn gọn hơn và hỗ trợ key union cụ thể. Ưu tiên `Record` cho code ngắn gọn; dùng index signature khi cần kết hợp với thuộc tính tường minh.

---

## Câu 7: Excess property checking (kiểm tra thuộc tính dư) trong TypeScript là gì? `[Intermediate]`

### Câu hỏi

> Excess property checking là gì? Tại sao TypeScript lại kiểm tra điều này và trong trường hợp nào thì không kiểm tra?

### Giải thích lý thuyết

**Excess property checking** là cơ chế TypeScript báo lỗi khi bạn gán object literal có **thuộc tính không tồn tại trong type đích**. Cơ chế này chỉ áp dụng với **object literal trực tiếp** — không áp dụng khi gán qua biến trung gian.

**Lý do tồn tại:** Giúp phát hiện lỗi đánh máy tên thuộc tính và thuộc tính không cần thiết khi tạo object.

**Khi KHÔNG áp dụng excess property checking:**
- Gán qua biến trung gian (structural typing thuần)
- Type assertion (`as`)
- Index signature trong type đích

### Code minh hoạ

```typescript
interface ToaDo {
  x: number;
  y: number;
}

// Excess property checking — áp dụng với object literal trực tiếp
// const diem: ToaDo = { x: 1, y: 2, z: 3 };
// Lỗi: Object literal may only specify known properties,
//       and 'z' does not exist in type 'ToaDo'

// Không áp dụng — gán qua biến trung gian
const diemTamThoi = { x: 1, y: 2, z: 3 };
const diem: ToaDo = diemTamThoi; // OK! Structural typing — z bị bỏ qua

// Không áp dụng — type assertion
const diemAssertion = { x: 1, y: 2, z: 3 } as ToaDo; // OK nhưng nguy hiểm

// Ví dụ thực tế — phát hiện lỗi đánh máy
interface CauHinhEmail {
  nguoiNhan: string;
  tieuDe: string;
  noidung: string;
}

// function guiEmail(ch: CauHinhEmail): void { ... }

// guiEmail({
//   nguoiNhan: "alice@example.com",
//   tieuDe: "Xin chào",
//   noiDung: "Nội dung email",  // Lỗi! 'noiDung' (D hoa) khác 'noidung' (d thường)
// });
// TypeScript phát hiện lỗi đánh máy ngay lập tức!

// Trường hợp index signature — excess property không bị cờ
interface TuyChinh {
  ten: string;
  [key: string]: unknown; // Cho phép thêm bất kỳ thuộc tính nào
}

const obj: TuyChinh = {
  ten: "Alice",
  tuoi: 25,      // OK vì có index signature
  email: "...",  // OK
};
```

### Đáp án mẫu

> Excess property checking báo lỗi khi object literal có thuộc tính không tồn tại trong type đích — giúp bắt lỗi đánh máy và thuộc tính dư thừa sớm. Cơ chế này chỉ áp dụng với object literal trực tiếp; gán qua biến trung gian sẽ dùng structural typing và không báo lỗi. Đây là một trong những điểm TypeScript nghiêm ngặt hơn structural typing thuần.

---

## Câu 8: Declaration files (`.d.ts`) là gì? `[Intermediate]`

### Câu hỏi

> File `.d.ts` là gì? Tại sao cần thiết và khi nào bạn phải tự viết?

### Giải thích lý thuyết

**Declaration files** (`.d.ts`) chứa **thông tin kiểu** (type information) mà không có code thực thi. Chúng mô tả "hình dạng" (shape) của một module JavaScript để TypeScript biết cách type-check khi sử dụng.

**Khi nào cần `.d.ts`:**

| Tình huống | Giải pháp |
|---|---|
| Thư viện JS phổ biến | Cài `@types/ten-thu-vien` từ DefinitelyTyped |
| Thư viện JS không có types | Tự viết `.d.ts` |
| Module JS nội bộ | Tự viết hoặc để TypeScript tự generate |
| Phát hành thư viện TypeScript | TypeScript tự generate khi `declaration: true` |

**DefinitelyTyped** (`@types/*`): Kho lưu trữ cộng đồng các declaration file cho hàng nghìn thư viện JS.

### Code minh hoạ

```typescript
// --- Ví dụ file thu-vien-cu.d.ts ---
// Mô tả một thư viện JavaScript không có TypeScript

// Khai báo module
declare module "thu-vien-cu" {
  // Khai báo function export
  export function tinhToan(a: number, b: number): number;

  // Khai báo class
  export class XuLyDuLieu {
    constructor(chuoi: string);
    phanTich(): string[];
    noi(phanCach?: string): string;
  }

  // Khai báo interface
  export interface KetQua {
    thanh_cong: boolean;
    du_lieu: unknown;
    loi?: string;
  }

  // Khai báo default export
  const thuVien: {
    phienBan: string;
    khoi_dong(): void;
  };
  export default thuVien;
}

// --- Khai báo biến toàn cục (global) ---
// Ví dụ: thư viện nạp qua script tag, không phải module

declare const __APP_VERSION__: string;
declare const __DEV__: boolean;

// --- Khai báo ambient module (wildcard) ---
declare module "*.svg" {
  const noiDung: string;
  export default noiDung;
}

declare module "*.png" {
  const url: string;
  export default url;
}

// --- Trong code TypeScript, dùng như bình thường ---
// import thuVien from "thu-vien-cu";
// thuVien.khoi_dong(); // TypeScript biết kiểu chính xác

// --- TypeScript tự generate .d.ts khi build thư viện ---
// tsconfig.json:
// {
//   "compilerOptions": {
//     "declaration": true,        // Tạo .d.ts
//     "declarationDir": "./dist/types"
//   }
// }
```

### Đáp án mẫu

> File `.d.ts` chứa khai báo kiểu (không có code thực thi) — giúp TypeScript hiểu shape của các module JavaScript. Với thư viện phổ biến, cài `@types/ten-thu-vien` từ DefinitelyTyped. Tự viết `.d.ts` khi dùng thư viện JS không có types, hoặc TypeScript tự generate khi bật `declaration: true` trong `tsconfig.json` để publish thư viện.

---

## Câu 9: Type-only imports và exports là gì? `[Intermediate]`

### Câu hỏi

> `import type` và `export type` là gì? Tại sao cần thiết và lợi ích mang lại?

### Giải thích lý thuyết

**Type-only imports/exports** (`import type`, `export type`) cho phép import/export **chỉ thông tin kiểu** — đảm bảo chúng hoàn toàn bị xóa sau khi biên dịch sang JavaScript, không tạo ra code runtime.

**Tại sao cần thiết:**

1. **Tránh circular dependency**: Import type không tạo dependency runtime
2. **Tối ưu bundle**: Đảm bảo types không lọt vào bundle JS
3. **Rõ ràng hơn**: Phân biệt rõ import dùng cho type hay runtime
4. **Tốc độ compile**: Một số bundler có thể tối ưu hơn

**Quy tắc:** Nếu một identifier chỉ dùng ở vị trí type (annotation, generic, interface), dùng `import type`.

### Code minh hoạ

```typescript
// --- file nguoi-dung.ts ---
export interface NguoiDung {
  id: number;
  ten: string;
}

export class DichVuNguoiDung {
  layNguoiDung(id: number): NguoiDung {
    return { id, ten: "Alice" };
  }
}

// --- file xu-ly.ts ---

// Import thông thường — cả type lẫn runtime value
import { DichVuNguoiDung, NguoiDung } from "./nguoi-dung";

// Import type-only — chỉ dùng cho annotation, bị xóa hoàn toàn sau compile
import type { NguoiDung as KieuNguoiDung } from "./nguoi-dung";

// Kết hợp trong một câu import (TypeScript 4.5+)
import { DichVuNguoiDung, type NguoiDung as KieuND } from "./nguoi-dung";

// Dùng type-only import
function chaoNguoiDung(nd: KieuND): string {
  return `Xin chào ${nd.ten}`;
}

// Dùng runtime import
const dichVu = new DichVuNguoiDung();

// --- Export type-only ---
// file index.ts — chỉ re-export types, không export implementation
export type { NguoiDung } from "./nguoi-dung";
// export type { NguoiDung, KetQua, ThamSo } from "./nguoi-dung";

// --- Sau compile sang JS, import type biến mất hoàn toàn ---
// Input TypeScript:
//   import type { NguoiDung } from "./nguoi-dung";
//   function chao(nd: NguoiDung): string { ... }
//
// Output JavaScript:
//   function chao(nd) { ... }
//   // Không có import nào! NguoiDung chỉ là type, không phải giá trị
```

### Đáp án mẫu

> `import type` và `export type` đảm bảo chỉ import/export thông tin kiểu — bị xóa hoàn toàn khi compile sang JS, không ảnh hưởng runtime. Lợi ích: tránh circular dependency runtime, tối ưu bundle, và code rõ ràng hơn về ý định. Từ TypeScript 4.5, có thể dùng cú pháp `import { type Foo, Bar }` để trộn lẫn trong một câu import.

---
