# Đối chiếu câu hỏi phỏng vấn ↔ tài liệu

> File này đối chiếu từng câu trong `question-interview.txt` (giữ nguyên thứ tự) với tài liệu trong `docs/interview/`, để dễ tra **câu nào đã có, nằm ở đâu, câu nào còn sót**.

**Chú thích trạng thái:** ✅ Đã có · ⚠️ Mới có một phần · ❌ Chưa có

> Vị trí ghi theo dạng `<file trong docs/interview/> • Câu N`.
> Lưu ý: nhóm **JavaScript** trong file nguồn thực chất là câu hỏi **React** (trùng phần đầu nhóm React) — đối chiếu với `03-react/`. Nhóm **State Management** chưa có thư mục riêng, chỉ được phủ một phần trong `03-react/3_state-management.md`.

---

## Tổng quan

| Nhóm | Tổng | ✅ | ⚠️ | ❌ |
|------|-----:|---:|---:|---:|
| JavaScript (= React, dòng 3–102) | 100 | 53 | 17 | 30 |
| TypeScript (dòng 106–164) | 59 | 30 | 11 | 18 |
| React (dòng 168–319) | 152 | 82 | 22 | 48 |
| Next.js (dòng 323–388) | 66 | 65 | 1 | 0 |
| State Management (dòng 392–454) | 63 | 16 | 8 | 39 |
| Micro-frontend (dòng 458–479) | 22 | 22 | 0 | 0 |
| **Tổng** | **462** | **268** | **59** | **135** |

> 🟢 **ĐÃ BỔ SUNG XONG — mọi câu giờ đều có nơi đọc.** Bảng `❌`/`⚠️` ở trên là hiện trạng *trước khi* bổ sung. Toàn bộ **105 câu thiếu** đã được soạn:
> - **React** (+48): `03-react/7_jsx-co-ban` → `14_thuc-chien`
> - **TypeScript** (+18): `02-typescript/5_co-ban-bo-sung`, `6_nang-cao-bo-sung`
> - **State Management** (mục mới `14-state-management/`, 62 câu): Redux, Redux Toolkit, React Query, Zustand, Jotai
>
> 👉 Xem **chính xác câu nào đọc ở file nào** tại mục [📌 Đã bổ sung — đọc ở đâu](#-đã-bổ-sung--đọc-ở-đâu) cuối trang. Các ô `❌` trong bảng chi tiết bên dưới nay đều đã được giải quyết tại mục đó.

---

## JavaScript (thực chất là React — dòng 3–102)

> Tóm tắt: ✅ 53/100 · ⚠️ 17 · ❌ 30

| # | Câu hỏi | Trạng thái | Vị trí |
|--:|---------|:---------:|--------|
| 1 | JSX là gì và tại sao React sử dụng nó? | ❌ | — |
| 2 | JSX được transpile thành gì? Ví dụ minh họa. | ❌ | — |
| 3 | Conditional rendering trong React được thực hiện như thế nào? | ❌ | — |
| 4 | React Fragment là gì và khi nào nên sử dụng? | ❌ | — |
| 5 | Key prop trong React là gì và tại sao nó quan trọng? | ✅ | `2_rendering-reconciliation.md` • Câu 2 |
| 6 | Sự khác nhau giữa biểu thức và câu lệnh trong JSX là gì? | ❌ | — |
| 7 | Event handling trong JSX khác gì so với HTML thông thường? | ❌ | — |
| 8 | Spread operator trong JSX props được dùng như thế nào? | ❌ | — |
| 9 | Khác biệt null, undefined, false và chuỗi rỗng khi render trong JSX? | ❌ | — |
| 10 | props.children là gì và cách sử dụng? | ❌ | — |
| 11 | Controlled Component là gì trong React? | ✅ | `3_state-management.md` • Câu 7 |
| 12 | Stateless và stateful component khác nhau như thế nào? | ⚠️ | `1_hooks-deep-dive.md` • Câu 7 |
| 13 | React component có thể return gì ngoài JSX? | ❌ | — |
| 14 | Sự khác nhau cơ bản giữa props và state? | ❌ | — |
| 15 | componentDidMount được gọi khi nào và dùng để làm gì? | ✅ | `1_hooks-deep-dive.md` • Câu 7 |
| 16 | componentWillUnmount dùng để làm gì? | ✅ | `1_hooks-deep-dive.md` • Câu 7 |
| 17 | useState hook hoạt động như thế nào? | ⚠️ | `1_hooks-deep-dive.md` • Câu 5 |
| 18 | Dependency array trong useEffect có ý nghĩa gì? | ✅ | `1_hooks-deep-dive.md` • Câu 2 |
| 19 | Tại sao mỗi component chỉ return một element ở cấp cao nhất? | ❌ | — |
| 20 | Pure Component là gì và khác Component thông thường? | ⚠️ | `2_rendering-reconciliation.md` • Câu 4 |
| 21 | Component composition và vì sao nên dùng thay inheritance? | ⚠️ | `5_patterns-react-19.md` • Câu 1 |
| 22 | Compound Components pattern là gì? | ✅ | `5_patterns-react-19.md` • Câu 1 |
| 23 | Khác biệt mount, update và unmount trong vòng đời? | ✅ | `1_hooks-deep-dive.md` • Câu 7 |
| 24 | Lifting state up là gì và khi nào cần thực hiện? | ❌ | — |
| 25 | Immutability trong React state là gì và tại sao quan trọng? | ❌ | — |
| 26 | Cập nhật nested state objects đúng đắn thế nào? | ❌ | — |
| 27 | Derived state là gì và vấn đề thường gặp? | ❌ | — |
| 28 | Unidirectional data flow trong React nghĩa là gì? | ❌ | — |
| 29 | Controlled vs Uncontrolled components khác nhau thế nào? | ✅ | `3_state-management.md` • Câu 7 |
| 30 | componentDidUpdate hoạt động thế nào, khi nào dùng? | ✅ | `1_hooks-deep-dive.md` • Câu 7 |
| 31 | componentDidCatch và Error Boundary liên quan thế nào? | ✅ | `5_patterns-react-19.md` • Câu 3 |
| 32 | Thứ tự lifecycle methods khi mount, update, unmount? | ✅ | `1_hooks-deep-dive.md` • Câu 7 |
| 33 | Cleanup function trong useEffect là gì, khi nào dùng? | ✅ | `1_hooks-deep-dive.md` • Câu 2 |
| 34 | Async operations trong useEffect thực hiện thế nào? | ⚠️ | `1_hooks-deep-dive.md` • Câu 2 |
| 35 | Làm sao tránh infinite loop trong useEffect? | ✅ | `1_hooks-deep-dive.md` • Câu 2 |
| 36 | Stale closure trong useEffect là gì và cách tránh? | ✅ | `1_hooks-deep-dive.md` • Câu 2 |
| 37 | Khi nào useEffect chạy trong React 18 Strict Mode? | ⚠️ | `1_hooks-deep-dive.md` • Câu 7 |
| 38 | Khác biệt useEffect và useLayoutEffect? | ✅ | `1_hooks-deep-dive.md` • Câu 6 |
| 39 | Share stateful logic giữa nhiều components với useEffect? | ✅ | `1_hooks-deep-dive.md` • Câu 4 |
| 40 | Fetch data và xử lý race conditions trong useEffect? | ✅ | `1_hooks-deep-dive.md` • Câu 4 |
| 41 | useContext hook là gì và cách sử dụng? | ✅ | `3_state-management.md` • Câu 2 |
| 42 | useReducer khác useState và khi nào nên dùng? | ✅ | `1_hooks-deep-dive.md` • Câu 5 |
| 43 | useMemo hook dùng làm gì? Khi nào nên dùng? | ✅ | `1_hooks-deep-dive.md` • Câu 3 |
| 44 | useCallback hook dùng làm gì? Khác useMemo? | ✅ | `1_hooks-deep-dive.md` • Câu 3 |
| 45 | useRef hook có những công dụng gì? | ✅ | `1_hooks-deep-dive.md` • Câu 6 |
| 46 | Quy tắc của Hooks (Rules of Hooks) là gì? | ✅ | `1_hooks-deep-dive.md` • Câu 1 |
| 47 | Tối ưu useContext để tránh re-render thừa? | ✅ | `3_state-management.md` • Câu 2 |
| 48 | Khác biệt useMemo và React.memo? | ✅ | `1_hooks-deep-dive.md` • Câu 3 & `2_rendering-reconciliation.md` • Câu 4 |
| 49 | Custom hook là gì và cách tạo? | ✅ | `1_hooks-deep-dive.md` • Câu 4 |
| 50 | Khi nào tách logic vào custom hook vs utility function? | ⚠️ | `1_hooks-deep-dive.md` • Câu 4 |
| 51 | Viết custom hook useDebounce như thế nào? | ✅ | `1_hooks-deep-dive.md` • Câu 4 |
| 52 | usePrevious hook làm gì và cách implement? | ✅ | `1_hooks-deep-dive.md` • Câu 6 |
| 53 | Context API là gì và giải quyết vấn đề gì? | ✅ | `3_state-management.md` • Câu 2 |
| 54 | Khi nào nên dùng Context thay vì props drilling? | ✅ | `3_state-management.md` • Câu 2 |
| 55 | useParams hook trong React Router dùng làm gì? | ❌ | — |
| 56 | useNavigate hook trong React Router v6 dùng thế nào? | ❌ | — |
| 57 | Nested routes trong React Router v6 hoạt động thế nào? | ❌ | — |
| 58 | Protected routes trong React Router implement thế nào? | ❌ | — |
| 59 | Multiple contexts trong một app tổ chức thế nào? | ⚠️ | `3_state-management.md` • Câu 2 |
| 60 | React Router SearchParams (query strings) xử lý thế nào? | ❌ | — |
| 61 | Uncontrolled component và useRef trong form là gì? | ✅ | `3_state-management.md` • Câu 7 |
| 62 | Formik là gì và tại sao sử dụng nó? | ❌ | — |
| 63 | React Hook Form khác Formik như thế nào? | ❌ | — |
| 64 | Form validation trong React thực hiện thế nào? | ⚠️ | `3_state-management.md` • Câu 7 |
| 65 | Error Boundary là gì và cách tạo? | ✅ | `5_patterns-react-19.md` • Câu 3 |
| 66 | Error Boundary không bắt được lỗi nào? | ✅ | `5_patterns-react-19.md` • Câu 3 |
| 67 | Dynamic form fields (thêm xóa input) implement thế nào? | ❌ | — |
| 68 | Zod integration với React Hook Form thế nào? | ❌ | — |
| 69 | React.memo là gì và cách hoạt động? | ✅ | `2_rendering-reconciliation.md` • Câu 4 |
| 70 | React.lazy và Suspense dùng làm gì? | ⚠️ | `4_performance.md` • Câu 2 |
| 71 | Virtual DOM trong React là gì? | ✅ | `2_rendering-reconciliation.md` • Câu 5 |
| 72 | Render props pattern là gì? | ✅ | `5_patterns-react-19.md` • Câu 2 |
| 73 | Windowing/virtualization trong React là gì? | ✅ | `4_performance.md` • Câu 3 |
| 74 | Tại sao không nên tạo component trong component? | ❌ | — |
| 75 | Key prop dùng để reset component state thế nào? | ⚠️ | `2_rendering-reconciliation.md` • Câu 1 |
| 76 | Khác nhau useState và useReducer? Khi nào dùng useReducer? | ✅ | `1_hooks-deep-dive.md` • Câu 5 |
| 77 | useMemo và useCallback khác nhau? Ví dụ thực tế? | ✅ | `1_hooks-deep-dive.md` • Câu 3 |
| 78 | useEffect cleanup chạy khi nào? Tại sao quan trọng? | ✅ | `1_hooks-deep-dive.md` • Câu 2 |
| 79 | Custom hooks là gì? Viết useFetch đơn giản? | ⚠️ | `1_hooks-deep-dive.md` • Câu 4 |
| 80 | React.memo dùng khi nào? Khi nào KHÔNG nên dùng? | ✅ | `2_rendering-reconciliation.md` • Câu 4 |
| 81 | Tại sao không nên tạo object/array mới trong JSX props? | ⚠️ | `2_rendering-reconciliation.md` • Câu 4 |
| 82 | Compound Components pattern là gì? Ví dụ? | ✅ | `5_patterns-react-19.md` • Câu 1 |
| 83 | Cấu trúc folder React project tổ chức thế nào? | ❌ | — |
| 84 | Component re-render liên tục, debug và fix thế nào? | ✅ | `2_rendering-reconciliation.md` • Câu 1 & Câu 4 |
| 85 | API call gọi 2 lần trong useEffect, tại sao? | ⚠️ | `1_hooks-deep-dive.md` • Câu 7 |
| 86 | State update nhưng UI không re-render, nguyên nhân? | ⚠️ | `2_rendering-reconciliation.md` • Câu 1 |
| 87 | Memory leak trong React component, phát hiện và fix? | ⚠️ | `1_hooks-deep-dive.md` • Câu 2 |
| 88 | Trang load chậm, approach debug từ đầu? | ✅ | `4_performance.md` • Câu 1 |
| 89 | Form phức tạp (20+ fields), tổ chức state hiệu quả? | ⚠️ | `1_hooks-deep-dive.md` • Câu 5 & `3_state-management.md` • Câu 7 |
| 90 | CORS error khi gọi API, cách xử lý? | ❌ | — |
| 91 | SSR/SSG content khác client-side, hydration mismatch? | ❌ | — |
| 92 | Khi nào dùng useCallback vs useMemo? Ví dụ thực tế. | ✅ | `1_hooks-deep-dive.md` • Câu 3 |
| 93 | Lỗi 'missing dependency' trong useEffect. | ✅ | `1_hooks-deep-dive.md` • Câu 2 |
| 94 | Xử lý race condition trong async useEffect? | ✅ | `1_hooks-deep-dive.md` • Câu 4 |
| 95 | Khác biệt controlled vs uncontrolled trong React form. | ✅ | `3_state-management.md` • Câu 7 |
| 96 | Prop drilling là gì? Giải quyết trong dự án lớn? | ✅ | `3_state-management.md` • Câu 2 |
| 97 | Tại sao list cần key prop? Dùng index làm key có vấn đề gì? | ✅ | `2_rendering-reconciliation.md` • Câu 2 |
| 98 | Lazy loading & code splitting. Khi nào cần? Cách implement? | ✅ | `4_performance.md` • Câu 2 |
| 99 | Optimize infinite scroll list. Virtual scrolling concept? | ✅ | `4_performance.md` • Câu 3 |
| 100 | Explain React.memo() & memo() hook. Khi nào nên dùng? | ✅ | `2_rendering-reconciliation.md` • Câu 4 |

---

## TypeScript (dòng 106–164)

> Tóm tắt: ✅ 30/59 · ⚠️ 11 · ❌ 18

| # | Câu hỏi | Trạng thái | Vị trí |
|--:|---------|:---------:|--------|
| 1 | TypeScript là gì và tại sao nên dùng thay JavaScript? | ❌ | — |
| 2 | Type annotation trong TypeScript là gì? | ❌ | — |
| 3 | any, unknown và never khác nhau như thế nào? | ✅ | `1_type-system.md` • Câu 2 |
| 4 | Union types và intersection types là gì? | ⚠️ | `1_type-system.md` • Câu 1 |
| 5 | as keyword (type assertion) là gì? Khi nào dùng? | ⚠️ | `3_utility-mapped-types.md` • Câu 6 |
| 6 | Tuple type trong TypeScript là gì? | ❌ | — |
| 7 | TypeScript strict mode bao gồm những gì? | ✅ | `1_type-system.md` • Câu 6 |
| 8 | interface và type alias khác nhau? Khi nào dùng cái nào? | ✅ | `1_type-system.md` • Câu 1 |
| 9 | Cách extend interface và type? | ⚠️ | `1_type-system.md` • Câu 1 |
| 10 | Optional properties (?) và readonly properties là gì? | ❌ | — |
| 11 | Partial và Required là gì? | ✅ | `3_utility-mapped-types.md` • Câu 1 |
| 12 | Record là gì? Khác index signature thế nào? | ⚠️ | `3_utility-mapped-types.md` • Câu 1 |
| 13 | Pick và Omit là gì? | ✅ | `3_utility-mapped-types.md` • Câu 1 |
| 14 | Literal types trong TypeScript là gì? | ⚠️ | `1_type-system.md` • Câu 4 |
| 15 | Type narrowing là gì? Các cách narrow type? | ✅ | `1_type-system.md` • Câu 3 |
| 16 | Non-null assertion operator (!) là gì? | ❌ | — |
| 17 | Enum là gì? Numeric vs string enum khác nhau? | ✅ | `1_type-system.md` • Câu 4 |
| 18 | satisfies operator trong TypeScript là gì? | ✅ | `3_utility-mapped-types.md` • Câu 6 |
| 19 | const assertion (as const) là gì? | ✅ | `1_type-system.md` • Câu 4 |
| 20 | Index signature trong TypeScript là gì? | ❌ | — |
| 21 | Discriminated unions là gì? Tại sao hữu ích? | ✅ | `4_advanced-patterns.md` • Câu 3 |
| 22 | Recursive types trong TypeScript là gì? | ⚠️ | `2_generics.md` • Câu 6 |
| 23 | Excess property checking trong TypeScript là gì? | ❌ | — |
| 24 | Generics là gì? Tại sao cần thiết? | ✅ | `2_generics.md` • Câu 1 |
| 25 | Generic constraints (extends) là gì? | ✅ | `2_generics.md` • Câu 2 |
| 26 | keyof operator là gì? | ✅ | `3_utility-mapped-types.md` • Câu 4 |
| 27 | Parameters và ConstructorParameters là gì? | ⚠️ | `3_utility-mapped-types.md` • Câu 1 |
| 28 | Generic functions với multiple type parameters thế nào? | ✅ | `2_generics.md` • Câu 2 |
| 29 | Exclude và Extract là gì? | ❌ | — |
| 30 | ReturnType và Awaited là gì? | ✅ | `3_utility-mapped-types.md` • Câu 1 |
| 31 | NonNullable là gì? | ✅ | `3_utility-mapped-types.md` • Câu 1 |
| 32 | Readonly và ReadonlyArray là gì? | ⚠️ | `2_generics.md` • Câu 6 |
| 33 | Implement Partial từ đầu để hiểu cách hoạt động | ✅ | `3_utility-mapped-types.md` • Câu 2 |
| 34 | Type guards là gì? Các loại type guards? | ✅ | `1_type-system.md` • Câu 3 |
| 35 | User-defined type guards (type predicates) là gì? | ✅ | `1_type-system.md` • Câu 3 |
| 36 | Declaration files (.d.ts) là gì? | ❌ | — |
| 37 | tsconfig.json các options quan trọng nhất là gì? | ✅ | `1_type-system.md` • Câu 6 |
| 38 | TypeScript với React: typing hooks thế nào? | ⚠️ | `4_advanced-patterns.md` • Câu 1 & `2_generics.md` • Câu 1 |
| 39 | TypeScript với React: typing events là gì? | ❌ | — |
| 40 | Path aliases trong TypeScript (paths config) là gì? | ❌ | — |
| 41 | Module augmentation là gì? | ✅ | `4_advanced-patterns.md` • Câu 4 |
| 42 | Branded types (nominal types) là gì? | ✅ | `1_type-system.md` • Câu 5 |
| 43 | Mapped types trong TypeScript là gì? | ✅ | `3_utility-mapped-types.md` • Câu 2 |
| 44 | Conditional types trong TypeScript là gì? | ✅ | `2_generics.md` • Câu 3 |
| 45 | infer keyword trong conditional types là gì? | ✅ | `2_generics.md` • Câu 4 |
| 46 | Template literal types là gì? | ✅ | `3_utility-mapped-types.md` • Câu 3 |
| 47 | Recursive conditional types là gì? | ⚠️ | `2_generics.md` • Câu 4 |
| 48 | Deep partial và deep readonly type tạo thế nào? | ✅ | `3_utility-mapped-types.md` • Câu 5 & `2_generics.md` • Câu 6 |
| 49 | Decorators trong TypeScript là gì? | ❌ | — |
| 50 | Decorator metadata và reflect-metadata là gì? | ❌ | — |
| 51 | Function overloads trong TypeScript là gì? | ❌ | — |
| 52 | Conditional types với distributive behavior? Cách disable? | ✅ | `2_generics.md` • Câu 3 |
| 53 | TypeScript với React: generics trong components là gì? | ❌ | — |
| 54 | Assertion functions trong TypeScript là gì? | ✅ | `1_type-system.md` • Câu 3 |
| 55 | Tại sao TypeScript dùng structural typing thay nominal? | ✅ | `1_type-system.md` • Câu 5 |
| 56 | Discriminated unions vs class hierarchy khi nào dùng? | ❌ | — |
| 57 | Exhaustiveness checking trong TypeScript là gì? | ⚠️ | `1_type-system.md` • Câu 2 & `4_advanced-patterns.md` • Câu 3 |
| 58 | Type-only imports và exports là gì? | ❌ | — |
| 59 | TypeScript performance: vì sao type checking chậm, cải thiện? | ❌ | — |

---

## React (dòng 168–319)

> Tóm tắt: ✅ 82/152 · ⚠️ 22 · ❌ 48. Câu 1–100 trùng nội dung với mục **JavaScript** ở trên (cùng trạng thái). Bảng dưới liệt kê đủ 152 câu để tiện tra theo số dòng.

| # | Câu hỏi | Trạng thái | Vị trí |
|--:|---------|:---------:|--------|
| 1 | JSX là gì và tại sao React sử dụng nó? | ❌ | — |
| 2 | JSX được transpile thành gì? Ví dụ minh họa. | ❌ | — |
| 3 | Conditional rendering trong React thực hiện thế nào? | ❌ | — |
| 4 | React Fragment là gì và khi nào nên sử dụng? | ❌ | — |
| 5 | Key prop là gì và tại sao quan trọng? | ✅ | `2_rendering-reconciliation.md` • Câu 2 |
| 6 | Khác nhau giữa biểu thức và câu lệnh trong JSX? | ❌ | — |
| 7 | Event handling trong JSX khác HTML thường thế nào? | ❌ | — |
| 8 | Spread operator trong JSX props dùng thế nào? | ❌ | — |
| 9 | Khác biệt null, undefined, false và chuỗi rỗng khi render? | ❌ | — |
| 10 | props.children là gì và cách sử dụng? | ❌ | — |
| 11 | Controlled Component là gì? | ✅ | `3_state-management.md` • Câu 7 |
| 12 | Stateless và stateful component khác nhau? | ⚠️ | `1_hooks-deep-dive.md` • Câu 7 |
| 13 | React component có thể return gì ngoài JSX? | ❌ | — |
| 14 | Khác nhau cơ bản giữa props và state? | ❌ | — |
| 15 | componentDidMount gọi khi nào, dùng làm gì? | ✅ | `1_hooks-deep-dive.md` • Câu 7 |
| 16 | componentWillUnmount dùng để làm gì? | ✅ | `1_hooks-deep-dive.md` • Câu 7 |
| 17 | useState hook hoạt động thế nào? | ⚠️ | `1_hooks-deep-dive.md` • Câu 5 |
| 18 | Dependency array trong useEffect có ý nghĩa gì? | ✅ | `1_hooks-deep-dive.md` • Câu 2 |
| 19 | Tại sao mỗi component chỉ return một element cấp cao nhất? | ❌ | — |
| 20 | Pure Component là gì, khác Component thường? | ⚠️ | `2_rendering-reconciliation.md` • Câu 4 |
| 21 | Component composition và vì sao thay inheritance? | ⚠️ | `5_patterns-react-19.md` • Câu 1 |
| 22 | Compound Components pattern là gì? | ✅ | `5_patterns-react-19.md` • Câu 1 |
| 23 | Khác biệt mount, update và unmount? | ✅ | `1_hooks-deep-dive.md` • Câu 7 |
| 24 | Lifting state up là gì, khi nào cần? | ❌ | — |
| 25 | Immutability trong React state và tại sao quan trọng? | ❌ | — |
| 26 | Cập nhật nested state objects đúng cách? | ❌ | — |
| 27 | Derived state là gì và vấn đề thường gặp? | ❌ | — |
| 28 | Unidirectional data flow nghĩa là gì? | ❌ | — |
| 29 | Controlled vs Uncontrolled components khác nhau? | ✅ | `3_state-management.md` • Câu 7 |
| 30 | componentDidUpdate hoạt động thế nào, khi nào dùng? | ✅ | `1_hooks-deep-dive.md` • Câu 7 |
| 31 | componentDidCatch và Error Boundary liên quan? | ✅ | `5_patterns-react-19.md` • Câu 3 |
| 32 | Thứ tự lifecycle methods khi mount/update/unmount? | ✅ | `1_hooks-deep-dive.md` • Câu 7 |
| 33 | Cleanup function trong useEffect là gì, khi nào dùng? | ✅ | `1_hooks-deep-dive.md` • Câu 2 |
| 34 | Async operations trong useEffect thế nào? | ⚠️ | `1_hooks-deep-dive.md` • Câu 2 |
| 35 | Làm sao tránh infinite loop trong useEffect? | ✅ | `1_hooks-deep-dive.md` • Câu 2 |
| 36 | Stale closure trong useEffect và cách tránh? | ✅ | `1_hooks-deep-dive.md` • Câu 2 |
| 37 | Khi nào useEffect chạy trong React 18 Strict Mode? | ⚠️ | `1_hooks-deep-dive.md` • Câu 7 |
| 38 | Khác biệt useEffect và useLayoutEffect? | ✅ | `1_hooks-deep-dive.md` • Câu 6 |
| 39 | Share stateful logic giữa components với useEffect? | ✅ | `1_hooks-deep-dive.md` • Câu 4 |
| 40 | Fetch data và xử lý race conditions trong useEffect? | ✅ | `1_hooks-deep-dive.md` • Câu 4 |
| 41 | useContext hook là gì và cách dùng? | ✅ | `3_state-management.md` • Câu 2 |
| 42 | useReducer khác useState, khi nào dùng? | ✅ | `1_hooks-deep-dive.md` • Câu 5 |
| 43 | useMemo dùng làm gì, khi nào dùng? | ✅ | `1_hooks-deep-dive.md` • Câu 3 |
| 44 | useCallback dùng làm gì, khác useMemo? | ✅ | `1_hooks-deep-dive.md` • Câu 3 |
| 45 | useRef hook có công dụng gì? | ✅ | `1_hooks-deep-dive.md` • Câu 6 |
| 46 | Rules of Hooks là gì? | ✅ | `1_hooks-deep-dive.md` • Câu 1 |
| 47 | Tối ưu useContext tránh re-render thừa? | ✅ | `3_state-management.md` • Câu 2 |
| 48 | Khác biệt useMemo và React.memo? | ✅ | `1_hooks-deep-dive.md` • Câu 3 & `2_rendering-reconciliation.md` • Câu 4 |
| 49 | Custom hook là gì và cách tạo? | ✅ | `1_hooks-deep-dive.md` • Câu 4 |
| 50 | Khi nào tách logic vào custom hook vs utility function? | ⚠️ | `1_hooks-deep-dive.md` • Câu 4 |
| 51 | Viết custom hook useDebounce thế nào? | ✅ | `1_hooks-deep-dive.md` • Câu 4 |
| 52 | usePrevious hook làm gì, implement thế nào? | ✅ | `1_hooks-deep-dive.md` • Câu 6 |
| 53 | Context API là gì, giải quyết vấn đề gì? | ✅ | `3_state-management.md` • Câu 2 |
| 54 | Khi nào dùng Context thay props drilling? | ✅ | `3_state-management.md` • Câu 2 |
| 55 | useParams trong React Router dùng làm gì? | ❌ | — |
| 56 | useNavigate trong React Router v6 dùng thế nào? | ❌ | — |
| 57 | Nested routes trong React Router v6 thế nào? | ❌ | — |
| 58 | Protected routes implement thế nào? | ❌ | — |
| 59 | Multiple contexts tổ chức thế nào? | ⚠️ | `3_state-management.md` • Câu 2 |
| 60 | React Router SearchParams xử lý thế nào? | ❌ | — |
| 61 | Uncontrolled component và useRef trong form? | ✅ | `3_state-management.md` • Câu 7 |
| 62 | Formik là gì, tại sao dùng? | ❌ | — |
| 63 | React Hook Form khác Formik thế nào? | ❌ | — |
| 64 | Form validation trong React thế nào? | ⚠️ | `3_state-management.md` • Câu 7 |
| 65 | Error Boundary là gì và cách tạo? | ✅ | `5_patterns-react-19.md` • Câu 3 |
| 66 | Error Boundary không bắt được lỗi nào? | ✅ | `5_patterns-react-19.md` • Câu 3 |
| 67 | Dynamic form fields implement thế nào? | ❌ | — |
| 68 | Zod integration với React Hook Form thế nào? | ❌ | — |
| 69 | React.memo là gì và cách hoạt động? | ✅ | `2_rendering-reconciliation.md` • Câu 4 |
| 70 | React.lazy và Suspense dùng làm gì? | ⚠️ | `4_performance.md` • Câu 2 |
| 71 | Virtual DOM trong React là gì? | ✅ | `2_rendering-reconciliation.md` • Câu 5 |
| 72 | Render props pattern là gì? | ✅ | `5_patterns-react-19.md` • Câu 2 |
| 73 | Windowing/virtualization là gì? | ✅ | `4_performance.md` • Câu 3 |
| 74 | Tại sao không nên tạo component trong component? | ❌ | — |
| 75 | Key prop dùng để reset component state thế nào? | ⚠️ | `2_rendering-reconciliation.md` • Câu 1 |
| 76 | Khác nhau useState và useReducer? Khi nào dùng useReducer? | ✅ | `1_hooks-deep-dive.md` • Câu 5 |
| 77 | useMemo và useCallback khác nhau? Ví dụ thực tế? | ✅ | `1_hooks-deep-dive.md` • Câu 3 |
| 78 | useEffect cleanup chạy khi nào? Tại sao quan trọng? | ✅ | `1_hooks-deep-dive.md` • Câu 2 |
| 79 | Custom hooks là gì? Viết useFetch đơn giản? | ⚠️ | `1_hooks-deep-dive.md` • Câu 4 |
| 80 | React.memo dùng khi nào? Khi nào KHÔNG nên dùng? | ✅ | `2_rendering-reconciliation.md` • Câu 4 |
| 81 | Tại sao không nên tạo object/array mới trong JSX props? | ⚠️ | `2_rendering-reconciliation.md` • Câu 4 |
| 82 | Compound Components pattern là gì? Ví dụ? | ✅ | `5_patterns-react-19.md` • Câu 1 |
| 83 | Cấu trúc folder React project tổ chức thế nào? | ❌ | — |
| 84 | Component re-render liên tục, debug và fix? | ✅ | `2_rendering-reconciliation.md` • Câu 1 & Câu 4 |
| 85 | API call gọi 2 lần trong useEffect, tại sao? | ⚠️ | `1_hooks-deep-dive.md` • Câu 7 |
| 86 | State update nhưng UI không re-render, nguyên nhân? | ⚠️ | `2_rendering-reconciliation.md` • Câu 1 |
| 87 | Memory leak trong React component, phát hiện và fix? | ⚠️ | `1_hooks-deep-dive.md` • Câu 2 |
| 88 | Trang load chậm, approach debug từ đầu? | ✅ | `4_performance.md` • Câu 1 |
| 89 | Form phức tạp (20+ fields), tổ chức state hiệu quả? | ⚠️ | `1_hooks-deep-dive.md` • Câu 5 & `3_state-management.md` • Câu 7 |
| 90 | CORS error khi gọi API, cách xử lý? | ❌ | — |
| 91 | SSR/SSG content khác client-side, hydration mismatch? | ❌ | — |
| 92 | Khi nào dùng useCallback vs useMemo? Ví dụ thực tế. | ✅ | `1_hooks-deep-dive.md` • Câu 3 |
| 93 | Lỗi 'missing dependency' trong useEffect. | ✅ | `1_hooks-deep-dive.md` • Câu 2 |
| 94 | Xử lý race condition trong async useEffect? | ✅ | `1_hooks-deep-dive.md` • Câu 4 |
| 95 | Khác biệt controlled vs uncontrolled trong React form. | ✅ | `3_state-management.md` • Câu 7 |
| 96 | Prop drilling là gì? Giải quyết trong dự án lớn? | ✅ | `3_state-management.md` • Câu 2 |
| 97 | Tại sao list cần key prop? Index làm key có vấn đề gì? | ✅ | `2_rendering-reconciliation.md` • Câu 2 |
| 98 | Lazy loading & code splitting. Khi nào cần, cách implement? | ✅ | `4_performance.md` • Câu 2 |
| 99 | Optimize infinite scroll list. Virtual scrolling? | ✅ | `4_performance.md` • Câu 3 |
| 100 | Explain React.memo() & memo() hook. Khi nào dùng? | ✅ | `2_rendering-reconciliation.md` • Câu 4 |
| 101 | Custom Hook pattern. Viết hook manage form state. Testing? | ⚠️ | `1_hooks-deep-dive.md` • Câu 4 |
| 102 | Error boundary. Cách implement, use case? | ✅ | `5_patterns-react-19.md` • Câu 3 |
| 103 | Compound component pattern. Vì sao hữu ích? Example? | ✅ | `5_patterns-react-19.md` • Câu 1 |
| 104 | Render prop vs HOC pattern. Modern React dùng gì? | ✅ | `5_patterns-react-19.md` • Câu 2 |
| 105 | Suspense. Fallback, error boundary, data fetching? | ✅ | `5_patterns-react-19.md` • Câu 3 & Câu 5 |
| 106 | So sánh Redux Toolkit, Zustand, Jotai, Context API — chọn cái nào? | ✅ | `3_state-management.md` • Câu 3 |
| 107 | Viết component accessible (a11y)? ARIA, focus, useId? | ❌ | — |
| 108 | Type event handler và ref trong React với TypeScript? | ❌ | — |
| 109 | Test component với RTL — nguyên tắc, query, user-event? | ❌ | — |
| 110 | react-error-boundary. Vì sao hook không bắt được lỗi render? | ✅ | `5_patterns-react-19.md` • Câu 3 |
| 111 | Forwardref là gì và khi nào cần dùng? | ✅ | `1_hooks-deep-dive.md` • Câu 6 & `5_patterns-react-19.md` • Câu 5 |
| 112 | State batching là gì? Thay đổi trong React 18? | ✅ | `2_rendering-reconciliation.md` • Câu 3 |
| 113 | Khi nào state update synchronous, khi nào asynchronous? | ⚠️ | `2_rendering-reconciliation.md` • Câu 3 |
| 114 | Tại sao không nên khởi tạo state từ props trực tiếp? | ❌ | — |
| 115 | shouldComponentUpdate hoạt động thế nào, khi nào dùng? | ⚠️ | `1_hooks-deep-dive.md` • Câu 7 |
| 116 | Strict Mode ảnh hưởng đến lifecycle thế nào? | ⚠️ | `1_hooks-deep-dive.md` • Câu 7 |
| 117 | Lazy initialization của useState là gì, khi nào dùng? | ✅ | `1_hooks-deep-dive.md` • Câu 5 |
| 118 | useInsertionEffect là gì, khi nào dùng? | ❌ | — |
| 119 | useEffect với object dependencies có vấn đề gì? | ✅ | `1_hooks-deep-dive.md` • Câu 2 |
| 120 | useTransition hook dùng làm gì? | ✅ | `2_rendering-reconciliation.md` • Câu 6 |
| 121 | useDeferredValue hook là gì? | ✅ | `2_rendering-reconciliation.md` • Câu 6 |
| 122 | useImperativeHandle hook dùng làm gì? | ❌ | — |
| 123 | useSyncExternalStore hook là gì? | ❌ | — |
| 124 | useOptimistic hook (React 19) là gì? | ✅ | `5_patterns-react-19.md` • Câu 5 |
| 125 | useActionState hook (React 19) là gì? | ✅ | `5_patterns-react-19.md` • Câu 4 & Câu 5 |
| 126 | Làm thế nào để test custom hooks? | ❌ | — |
| 127 | Composition của custom hooks là gì? | ✅ | `1_hooks-deep-dive.md` • Câu 4 |
| 128 | Patterns hay dùng trong custom hooks là gì? | ⚠️ | `1_hooks-deep-dive.md` • Câu 4 |
| 129 | Context re-render optimization là gì? | ✅ | `3_state-management.md` • Câu 2 |
| 130 | Data loading với React Router v6.4+ loader functions? | ❌ | — |
| 131 | Optimistic UI trong form submission là gì? | ✅ | `3_state-management.md` • Câu 5 |
| 132 | Server-side vs client-side form validation, khi nào dùng? | ❌ | — |
| 133 | React Fiber là gì? | ❌ | — |
| 134 | Reconciliation algorithm hoạt động thế nào? | ✅ | `2_rendering-reconciliation.md` • Câu 2 & Câu 5 |
| 135 | Suspense for data fetching hoạt động thế nào? | ✅ | `5_patterns-react-19.md` • Câu 5 |
| 136 | React Server Components khác Client Components thế nào? | ✅ | `4_performance.md` • Câu 6 |
| 137 | Tại sao setCount(count+1) ba lần chỉ tăng 1? functional updater? | ✅ | `2_rendering-reconciliation.md` • Câu 3 |
| 138 | Tại sao test phải wrap trong act()? Khi nào cần waitFor/findBy? | ❌ | — |
| 139 | React Profiler API đo gì? actualDuration, baseDuration, commitTime? | ✅ | `4_performance.md` • Câu 1 |
| 140 | Tại sao React 17 đổi attach listener từ document sang root? | ❌ | — |
| 141 | React Portal render ở DOM khác nhưng event vẫn bubble qua React tree? | ❌ | — |
| 142 | Code splitting thực hiện thế nào? Lazy loading routes? | ✅ | `4_performance.md` • Câu 2 |
| 143 | Error Boundaries hoạt động thế nào? Hạn chế gì? | ✅ | `5_patterns-react-19.md` • Câu 3 |
| 144 | Giải thích React Server Components vs Client Components? | ✅ | `4_performance.md` • Câu 6 |
| 145 | Virtual DOM và Reconciliation hoạt động thế nào? | ✅ | `2_rendering-reconciliation.md` • Câu 2 & Câu 5 |
| 146 | Migrate Class Components sang Hooks, chiến lược? | ❌ | — |
| 147 | Thiết kế authentication flow cho SPA (React)? | ❌ | — |
| 148 | i18n (đa ngôn ngữ). Triển khai multi-language trong React? | ❌ | — |
| 149 | Optimize React app cho 10,000+ items? | ✅ | `4_performance.md` • Câu 3 |
| 150 | Type props với TypeScript dùng generics và discriminated-union? | ❌ | — |
| 151 | useTransition và useDeferredValue khác nhau? Khi nào dùng? | ✅ | `2_rendering-reconciliation.md` • Câu 6 |
| 152 | React Compiler (React 19) tự động memo hóa gì? Còn cần useMemo? | ✅ | `5_patterns-react-19.md` • Câu 5 |

---

## Next.js (dòng 323–388)

> Tóm tắt: Đã có 65/66 · Một phần 1 · Chưa có 0 — gần như phủ hết. Mỗi câu khớp 1-1 với `04-nextjs/`.

| # | Câu hỏi | Trạng thái | Vị trí |
|--:|---------|:---------:|--------|
| 1 | File-based routing trong App Router thế nào? | ✅ | `1_routing-layouts.md` • Câu 1 |
| 2 | Metadata trong App Router định nghĩa thế nào? | ✅ | `6_middleware-api-scripts.md` • Câu 2 |
| 3 | 'use client' directive dùng khi nào? | ✅ | `3_server-client-components.md` • Câu 3 |
| 4 | Server-only và client-only packages là gì? | ✅ | `3_server-client-components.md` • Câu 4 |
| 5 | SSR trong Next.js là gì? | ✅ | `2_rendering.md` • Câu 5 |
| 6 | SSG trong Next.js là gì? | ✅ | `2_rendering.md` • Câu 6 |
| 7 | getStaticProps và getServerSideProps khác nhau? | ✅ | `2_rendering.md` • Câu 7 |
| 8 | Route Handlers (API Routes) là gì? | ✅ | `6_middleware-api-scripts.md` • Câu 8 |
| 9 | Deploy lên Vercel, Vercel xử lý tự động gì? | ✅ | `8_deployment-testing-migration.md` • Câu 9 |
| 10 | Vì sao CSS-in-JS runtime khó với Server Components? | ✅ | `7_optimization-styling.md` • Câu 10 |
| 11 | App Router khác Pages Router thế nào? | ✅ | `1_routing-layouts.md` • Câu 11 |
| 12 | Layouts trong App Router là gì? | ✅ | `1_routing-layouts.md` • Câu 12 |
| 13 | loading.tsx và Suspense? | ✅ | `1_routing-layouts.md` • Câu 13 |
| 14 | error.tsx và not-found.tsx hoạt động thế nào? | ✅ | `1_routing-layouts.md` • Câu 14 |
| 15 | Route Groups là gì? | ✅ | `1_routing-layouts.md` • Câu 15 |
| 16 | Dynamic routes và catch-all routes? | ✅ | `1_routing-layouts.md` • Câu 16 |
| 17 | generateStaticParams dùng làm gì? | ✅ | `1_routing-layouts.md` • Câu 17 |
| 18 | React Server Components là gì? | ✅ | `3_server-client-components.md` • Câu 18 |
| 19 | Server Component import Client Component và ngược lại? | ✅ | `3_server-client-components.md` • Câu 19 |
| 20 | Khi nào dùng Server vs Client Component? | ✅ | `3_server-client-components.md` • Câu 20 |
| 21 | Context API hoạt động với Server Components? | ✅ | `3_server-client-components.md` • Câu 21 |
| 22 | Third-party libraries và Server Components có vấn đề gì? | ✅ | `3_server-client-components.md` • Câu 22 |
| 23 | ISR là gì? | ✅ | `4_caching-revalidation.md` • Câu 23 |
| 24 | On-demand revalidation là gì? | ✅ | `4_caching-revalidation.md` • Câu 24 |
| 25 | fetch cache trong App Router hoạt động thế nào? | ✅ | `4_caching-revalidation.md` • Câu 25 |
| 26 | Khác biệt dynamic và static rendering? | ✅ | `2_rendering.md` • Câu 26 |
| 27 | Streaming SSR hoạt động thế nào? | ✅ | `2_rendering.md` • Câu 27 |
| 28 | Server Actions trong Next.js là gì? | ✅ | `5_server-actions.md` • Câu 28 |
| 29 | Server Actions với HTML forms? | ✅ | `5_server-actions.md` • Câu 29 |
| 30 | Revalidation sau mutation trong Server Actions? | ✅ | `5_server-actions.md` • Câu 30 |
| 31 | Error handling trong Server Actions? | ✅ | `5_server-actions.md` • Câu 31 |
| 32 | Middleware trong App Router là gì? | ✅ | `6_middleware-api-scripts.md` • Câu 32 |
| 33 | Cookies và Headers trong Server Components/Actions? | ✅ | `5_server-actions.md` • Câu 33 |
| 34 | Optimistic updates với Server Actions và useOptimistic? | ✅ | `5_server-actions.md` • Câu 34 |
| 35 | next/image mang lại lợi ích gì? | ✅ | `7_optimization-styling.md` • Câu 35 |
| 36 | next/font hoạt động thế nào? | ✅ | `7_optimization-styling.md` • Câu 36 |
| 37 | Link prefetching là gì, cách control? | ✅ | `6_middleware-api-scripts.md` • Câu 37 |
| 38 | next/script và loading strategies? | ✅ | `6_middleware-api-scripts.md` • Câu 38 |
| 39 | Middleware proxy pattern thế nào? | ✅ | `6_middleware-api-scripts.md` • Câu 39 |
| 40 | Core Web Vitals và Next.js tối ưu thế nào? | ✅ | `7_optimization-styling.md` • Câu 40 |
| 41 | Environment variables xử lý thế nào? | ✅ | `7_optimization-styling.md` • Câu 41 |
| 42 | Self-host + output: 'standalone' giải quyết gì? | ✅ | `8_deployment-testing-migration.md` • Câu 42 |
| 43 | Dockerfile production tối ưu multi-stage? | ✅ | `8_deployment-testing-migration.md` • Câu 43 |
| 44 | output: 'export' và tính năng không dùng được? | ✅ | `8_deployment-testing-migration.md` • Câu 44 |
| 45 | Jest + RTL và vì sao không test async Server Components? | ✅ | `8_deployment-testing-migration.md` • Câu 45 |
| 46 | Vì sao Playwright phù hợp E2E App Router? | ✅ | `8_deployment-testing-migration.md` • Câu 46 |
| 47 | _app.tsx / _document.tsx, App Router thay bằng gì? | ✅ | `8_deployment-testing-migration.md` • Câu 47 |
| 48 | revalidatePath vs revalidateTag, chọn cái nào? | ✅ | `4_caching-revalidation.md` • Câu 48 |
| 49 | i18n routing App Router, next-intl thêm gì? | ✅ | `9_i18n-security.md` • Câu 49 |
| 50 | useFormStatus và useActionState, vì sao phải trong component con? | ✅ | `5_server-actions.md` • Câu 50 |
| 51 | Draft Mode dùng để làm gì? | ✅ | `9_i18n-security.md` • Câu 51 |
| 52 | Parallel Routes và Intercepting Routes là gì? | ✅ | `1_routing-layouts.md` • Câu 52 |
| 53 | Server Component props phải tuân quy tắc gì? | ✅ | `3_server-client-components.md` • Câu 53 |
| 54 | RSC streaming và progressive rendering là gì? | ✅ | `2_rendering.md` • Câu 54 |
| 55 | Next.js có những loại cache nào? | ✅ | `4_caching-revalidation.md` • Câu 55 |
| 56 | Partial Prerendering (PPR) là gì? | ✅ | `2_rendering.md` • Câu 56 |
| 57 | Security considerations khi dùng Server Actions? | ✅ | `5_server-actions.md` • Câu 57 |
| 58 | Edge Runtime vs Node.js Runtime là gì? | ✅ | `8_deployment-testing-migration.md` • Câu 58 |
| 59 | Bundle analyzer dùng thế nào? | ✅ | `7_optimization-styling.md` • Câu 59 |
| 60 | Turbopack là gì và lợi ích? | ✅ | `7_optimization-styling.md` • Câu 60 |
| 61 | i18n implement thế nào? | ⚠️ | `9_i18n-security.md` • Câu 61 (gần trùng Câu 49) |
| 62 | CSP với nonce, vì sao tạo nonce mới mỗi request? | ✅ | `9_i18n-security.md` • Câu 62 |
| 63 | Server Actions có CSRF tích hợp không, tự lo gì? | ✅ | `5_server-actions.md` • Câu 63 |
| 64 | Connection pooling serverless, Prisma/Drizzle giải quyết? | ✅ | `9_i18n-security.md` • Câu 64 |
| 65 | Migrate Pages → App Router, chạy song song được không? | ✅ | `8_deployment-testing-migration.md` • Câu 65 |
| 66 | Parallel vs sequential data fetching, preload pattern? | ✅ | `4_caching-revalidation.md` • Câu 66 |

---

## State Management (dòng 392–454)

> Tóm tắt: ✅ 16/63 · ⚠️ 8 · ❌ 39 — **thiếu nhiều nhất.** Chỉ được phủ một phần trong `03-react/3_state-management.md`; chưa có thư mục riêng cho Redux / React Query / Zustand / Jotai.

| # | Câu hỏi | Trạng thái | Vị trí |
|--:|---------|:---------:|--------|
| 1 | Zustand là gì? So sánh với Redux về độ phức tạp? | ⚠️ | `3_state-management.md` • Câu 3 |
| 2 | Cách tạo một store với Zustand thế nào? | ✅ | `3_state-management.md` • Câu 3 |
| 3 | React Query (TanStack Query) là gì? Mục đích chính? | ⚠️ | `3_state-management.md` • Câu 4 & Câu 8 |
| 4 | useQuery hook hoạt động thế nào? Tham số cơ bản? | ⚠️ | `3_state-management.md` • Câu 4 & Câu 8 |
| 5 | QueryClientProvider là gì? Vì sao cần wrap app? | ❌ | — |
| 6 | Khác biệt isLoading và isFetching trong useQuery? | ❌ | — |
| 7 | Redux là gì? Tại sao cần dùng Redux? | ⚠️ | `3_state-management.md` • Câu 3 & Câu 4 |
| 8 | Ba nguyên tắc cốt lõi của Redux là gì? | ❌ | — |
| 9 | Action trong Redux là gì? Cấu trúc của một action? | ❌ | — |
| 10 | Reducer trong Redux là gì? Viết reducer đúng chuẩn? | ❌ | — |
| 11 | Store trong Redux là gì? Các phương thức chính? | ❌ | — |
| 12 | Redux Toolkit (RTK) là gì? Vì sao dùng thay Redux thuần? | ❌ | — |
| 13 | createSlice trong RTK hoạt động thế nào? | ✅ | `3_state-management.md` • Câu 3 |
| 14 | createAsyncThunk dùng làm gì? Các trạng thái lifecycle? | ❌ | — |
| 15 | Selector trong Redux là gì? Vì sao dùng createSelector? | ❌ | — |
| 16 | Redux middleware là gì? Ví dụ middleware phổ biến? | ❌ | — |
| 17 | useSelector và useDispatch hoạt động thế nào? | ✅ | `3_state-management.md` • Câu 3 |
| 18 | Cách định nghĩa actions trong Zustand store? | ✅ | `3_state-management.md` • Câu 3 |
| 19 | Zustand khác Redux thế nào về kiến trúc? | ✅ | `3_state-management.md` • Câu 3 |
| 20 | Tránh re-render không cần thiết trong Zustand? | ❌ | — |
| 21 | Zustand middleware là gì? Ví dụ devtools middleware? | ❌ | — |
| 22 | persist middleware trong Zustand hoạt động thế nào? | ❌ | — |
| 23 | useMutation dùng làm gì? Xử lý optimistic updates? | ✅ | `3_state-management.md` • Câu 5 |
| 24 | Cache invalidation trong React Query thế nào? | ✅ | `3_state-management.md` • Câu 4 & Câu 5 |
| 25 | staleTime và gcTime (cacheTime) là gì? Khác biệt? | ❌ | — |
| 26 | Vì sao React Query là "server state" không phải "global state"? | ✅ | `3_state-management.md` • Câu 4 |
| 27 | Cấu hình React Query với QueryClient và Provider? | ❌ | — |
| 28 | refetchOnWindowFocus là gì? Khi nào tắt? | ❌ | — |
| 29 | Cách xử lý error trong React Query? | ❌ | — |
| 30 | QueryKey nên thiết kế thế nào? | ❌ | — |
| 31 | Jotai là gì? So sánh với Recoil? | ❌ | — |
| 32 | Cách tạo và sử dụng atom trong Jotai? | ✅ | `3_state-management.md` • Câu 3 |
| 33 | Jotai Provider là gì? Khi nào cần dùng? | ❌ | — |
| 34 | So sánh RTK, Zustand, Context API, Jotai — khi nào dùng gì? | ✅ | `3_state-management.md` • Câu 3 |
| 35 | Redux Toolkit createSlice hoạt động thế nào? | ✅ | `3_state-management.md` • Câu 3 |
| 36 | Placeholder data và initial data khác gì nhau? | ❌ | — |
| 37 | select option trong useQuery dùng làm gì? | ❌ | — |
| 38 | Parallel queries và useQueries là gì? | ❌ | — |
| 39 | Cancel queries khi component unmount? | ❌ | — |
| 40 | keepPreviousData dùng khi nào? | ❌ | — |
| 41 | enabled option trong useQuery dùng làm gì? | ❌ | — |
| 42 | RTK Query là gì? Lợi ích so với fetch thủ công? | ✅ | `3_state-management.md` • Câu 8 |
| 43 | Định nghĩa API với createApi trong RTK Query? | ⚠️ | `3_state-management.md` • Câu 8 |
| 44 | Redux DevTools và time-travel debugging là gì? | ❌ | — |
| 45 | Khi nào nên dùng Redux và khi nào không cần? | ✅ | `3_state-management.md` • Câu 3 & Câu 4 |
| 46 | Chia nhỏ Zustand store thành nhiều slices? | ❌ | — |
| 47 | Dùng Zustand với TypeScript để có type safety? | ❌ | — |
| 48 | Khi nào chọn Zustand thay vì Redux Toolkit? | ✅ | `3_state-management.md` • Câu 3 |
| 49 | Prefetching trong React Query hoạt động thế nào? | ❌ | — |
| 50 | Infinite queries là gì? Dùng cho pagination? | ❌ | — |
| 51 | Dependent queries trong React Query là gì? | ❌ | — |
| 52 | Optimistic updates trong React Query thực hiện thế nào? | ✅ | `3_state-management.md` • Câu 5 |
| 53 | Kết hợp React Query với Next.js Server Components? | ❌ | — |
| 54 | Async atoms trong Jotai hoạt động thế nào? | ❌ | — |
| 55 | So sánh bundle size và performance Jotai vs Zustand? | ⚠️ | `3_state-management.md` • Câu 3 |
| 56 | Khi nào dùng atomic state (Jotai) thay Redux/Zustand? | ⚠️ | `3_state-management.md` • Câu 3 |
| 57 | Query Filters trong React Query là gì? Dùng ở đâu? | ❌ | — |
| 58 | useSuspenseQuery khác useQuery? Khi nào dùng? | ❌ | — |
| 59 | persistQueryClient dùng làm gì? | ❌ | — |
| 60 | Mutation side effects: onMutate/onSuccess/onError/onSettled? | ✅ | `3_state-management.md` • Câu 5 |
| 61 | React Query DevTools là gì? Cách sử dụng? | ❌ | — |
| 62 | Cách xử lý race conditions trong React Query? | ❌ | — |
| 63 | So sánh React Query với SWR? Khi nào chọn cái nào? | ⚠️ | `3_state-management.md` • Câu 8 |

---

## Micro-frontend (dòng 458–479)

> Tóm tắt: Đã có 22/22 · Một phần 0 · Chưa có 0 — **phủ đầy đủ** trong `12-micro-frontend/`.

| # | Câu hỏi | Trạng thái | Vị trí |
|--:|---------|:---------:|--------|
| 1 | Micro-frontend là gì? | ✅ | `1_khai-niem-trade-off.md` • Câu 1 |
| 2 | Micro-frontend khác monolith ở đâu? Khi nào nên dùng? | ✅ | `1_khai-niem-trade-off.md` • Câu 2 |
| 3 | Chia sẻ về micro-frontend ở công ty bạn? | ✅ | `1_khai-niem-trade-off.md` • Câu 5 |
| 4 | Có những cách nào để tích hợp các micro-frontend? | ✅ | `2_cach-tich-hop.md` • Câu 6 |
| 5 | Module Federation là gì? Hoạt động thế nào? | ✅ | `3_module-federation-single-spa.md` • Câu 10 |
| 6 | single-spa là gì? Giải quyết vấn đề gì? | ✅ | `3_module-federation-single-spa.md` • Câu 11 |
| 7 | Các micro-frontend giao tiếp với nhau thế nào? | ✅ | `4_giao-tiep-routing-state.md` • Câu 15 |
| 8 | Routing trong kiến trúc micro-frontend? | ✅ | `4_giao-tiep-routing-state.md` • Câu 16 |
| 9 | Tách biệt CSS để không ghi đè style của nhau? | ✅ | `5_css-deploy-ssr-test.md` • Câu 18 |
| 10 | Micro-frontend có nhược điểm và thách thức gì? | ✅ | `1_khai-niem-trade-off.md` • Câu 4 |
| 11 | Dùng iframe có ưu và nhược điểm gì? | ✅ | `2_cach-tich-hop.md` • Câu 7 |
| 12 | Dùng Web Components cho micro-frontend thế nào? | ✅ | `2_cach-tich-hop.md` • Câu 8 |
| 13 | Module Federation và single-spa khác nhau? Khi nào dùng? | ✅ | `3_module-federation-single-spa.md` • Câu 12 |
| 14 | Test micro-frontend thế nào? | ✅ | `5_css-deploy-ssr-test.md` • Câu 21 |
| 15 | Ưu và nhược điểm của micro-frontend? | ✅ | `1_khai-niem-trade-off.md` • Câu 3 |
| 16 | Có công nghệ/framework nào để xây micro-frontend? | ✅ | `2_cach-tich-hop.md` • Câu 9 |
| 17 | Chia sẻ dependency chung, tránh tải trùng React? | ✅ | `3_module-federation-single-spa.md` • Câu 14 |
| 18 | Independent deployment đạt được bằng cách nào? | ✅ | `5_css-deploy-ssr-test.md` • Câu 19 |
| 19 | Chia sẻ state toàn cục an toàn? | ✅ | `4_giao-tiep-routing-state.md` • Câu 17 |
| 20 | SSR với micro-frontend khác tích hợp ở client? | ✅ | `5_css-deploy-ssr-test.md` • Câu 20 |
| 21 | Import maps là gì và vai trò trong micro-frontend? | ✅ | `3_module-federation-single-spa.md` • Câu 13 |
| 22 | Làm sao một micro-frontend lỗi không sập cả trang? | ✅ | `5_css-deploy-ssr-test.md` • Câu 22 |

---

---

## 📌 Đã bổ sung — đọc ở đâu

> Toàn bộ câu trước đây `❌` nay đã được soạn. Dưới đây là **nơi đọc** từng nhóm câu mới (định dạng đầy đủ: Câu hỏi · Giải thích · Code · Đáp án mẫu).

### React (+48 câu) → `docs/interview/03-react/`

| File | Nội dung |
|------|----------|
| `7_jsx-co-ban.md` | JSX là gì & transpile, conditional render, Fragment, expression vs statement, event handling, spread props, render null/undefined/false, props.children, return ngoài JSX |
| `8_state-props-core.md` | props vs state, single root element, lifting state up, immutability, cập nhật nested state, derived state, unidirectional flow, inline component, cấu trúc folder, init state từ props |
| `9_react-router.md` | useParams, useNavigate, nested routes, protected routes, SearchParams, loader functions (v6.4+) |
| `10_forms.md` | Formik, React Hook Form vs Formik, dynamic form fields, Zod + RHF, server-side vs client-side validation |
| `11_advanced-hooks.md` | useImperativeHandle, useSyncExternalStore, useInsertionEffect, test custom hooks |
| `12_internals.md` | React Fiber, act() trong test, event delegation (React 17), Portal, migrate Class → Hooks |
| `13_typescript-a11y-testing.md` | Accessibility (ARIA/focus/useId), type event handler & ref, React Testing Library, type props generics/discriminated-union |
| `14_thuc-chien.md` | CORS, hydration mismatch (SSR/SSG), authentication flow cho SPA, i18n đa ngôn ngữ |

### TypeScript (+18 câu) → `docs/interview/02-typescript/`

| File | Nội dung |
|------|----------|
| `5_co-ban-bo-sung.md` | TS là gì, type annotation, tuple, optional/readonly, non-null assertion, index signature, excess property checking, `.d.ts`, type-only imports |
| `6_nang-cao-bo-sung.md` | Exclude/Extract, typing events, path aliases, decorators, decorator metadata, function overloads, generics trong components, discriminated unions vs class hierarchy, TS performance |

### State Management (mục mới) → `docs/interview/14-state-management/`

| File | Nội dung |
|------|----------|
| `1_redux-core.md` | Redux là gì & 3 nguyên tắc, action, reducer, store, useSelector/useDispatch, selector/createSelector, middleware, DevTools/time-travel, khi nào dùng Redux |
| `2_redux-toolkit.md` | RTK & vì sao dùng, createSlice, createAsyncThunk, RTK Query, createApi |
| `3_react-query-co-ban.md` | React Query là gì, useQuery, QueryClientProvider, isLoading vs isFetching, server state, cấu hình, refetchOnWindowFocus, error, QueryKey, staleTime/gcTime |
| `4_react-query-mutations.md` | useMutation, cache invalidation, optimistic updates, side effects (onMutate/onSuccess/onError/onSettled), race conditions, DevTools |
| `5_react-query-control.md` | placeholder vs initial data, select, parallel/useQueries, cancel query, keepPreviousData, enabled, query filters |
| `6_react-query-nang-cao.md` | prefetching, infinite queries, dependent queries, RQ + Next.js RSC, useSuspenseQuery, persistQueryClient, RQ vs SWR |
| `7_zustand.md` | Zustand & so Redux, tạo store, actions, kiến trúc, tránh re-render, middleware, persist, slices, TypeScript, so sánh tổng hợp RTK/Zustand/Context/Jotai |
| `8_jotai.md` | Jotai & Recoil, atom, Provider, async atoms, bundle/performance vs Zustand, khi nào dùng atomic state |

> Các nhóm **Next.js** và **Micro-frontend** đã đầy đủ từ trước (xem bảng chi tiết phía trên).
