---
sidebar_position: 4
title: "4. React Query — Mutations"
---

# React Query — Mutations

> _Mutations là cơ chế giúp React Query xử lý các thao tác ghi dữ liệu (tạo, cập nhật, xoá) một cách nhất quán, đồng thời cung cấp các hook mạnh mẽ để quản lý trạng thái, side effects và đồng bộ cache._

---

## Câu 1: `useMutation` hook dùng để làm gì? `[Intermediate]`

### Câu hỏi

> `useMutation` trong React Query là gì? So sánh với `useQuery` và cho biết khi nào nên dùng?

### Giải thích lý thuyết

`useMutation` là hook dùng để thực hiện các **thao tác ghi** (POST, PUT, PATCH, DELETE) — tức là bất kỳ hành động nào thay đổi dữ liệu phía server.

Khác với `useQuery` (tự động fetch khi component mount), `useMutation` **không tự chạy** — bạn phải gọi `mutate()` hoặc `mutateAsync()` thủ công.

| Đặc điểm | `useQuery` | `useMutation` |
|---|---|---|
| Mục đích | Đọc dữ liệu (GET) | Ghi dữ liệu (POST/PUT/DELETE) |
| Kích hoạt | Tự động khi mount | Thủ công qua `mutate()` |
| Cache key | Có `queryKey` | Không có cache key |
| Re-fetch | Tự động (stale, focus...) | Không tự động |
| Kết quả | `data`, `isLoading` | `data`, `isPending`, `isSuccess`, `isError` |

### Code minh hoạ

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateTodoPayload {
  title: string;
  completed: boolean;
}

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

const createTodo = async (payload: CreateTodoPayload): Promise<Todo> => {
  const res = await fetch("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Tạo todo thất bại");
  return res.json();
};

function AddTodoForm() {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      // Sau khi tạo thành công, vô hiệu hoá cache để refetch danh sách
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const title = (form.elements.namedItem("title") as HTMLInputElement).value;
    mutate({ title, completed: false });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" placeholder="Tiêu đề todo" />
      <button type="submit" disabled={isPending}>
        {isPending ? "Đang tạo..." : "Thêm Todo"}
      </button>
      {isError && <p style={{ color: "red" }}>{error.message}</p>}
    </form>
  );
}
```

### Đáp án mẫu

> `useMutation` dùng để thực hiện thao tác ghi dữ liệu (POST/PUT/DELETE). Không tự động chạy như `useQuery` mà phải gọi `mutate()` thủ công. Thường kết hợp với `invalidateQueries` trong `onSuccess` để đồng bộ lại cache sau khi ghi thành công.

---

## Câu 2: Cache invalidation (vô hiệu hoá cache) trong React Query hoạt động như thế nào? `[Intermediate]`

### Câu hỏi

> Giải thích cơ chế cache invalidation trong React Query. Làm thế nào để sau khi mutation thành công, UI tự động hiển thị dữ liệu mới nhất?

### Giải thích lý thuyết

React Query lưu kết quả fetch theo `queryKey`. Khi dữ liệu thay đổi phía server (qua mutation), cache cũ bị **stale** (lỗi thời). Ta cần **invalidate** để React Query biết phải refetch.

Các phương thức invalidation:

| Phương thức | Mô tả |
|---|---|
| `invalidateQueries({ queryKey })` | Đánh dấu stale + refetch nếu có observer đang active |
| `removeQueries({ queryKey })` | Xoá hẳn cache khỏi bộ nhớ |
| `resetQueries({ queryKey })` | Reset về trạng thái ban đầu (như lần đầu fetch) |
| `setQueryData(queryKey, newData)` | Ghi trực tiếp dữ liệu mới vào cache (không cần refetch) |
| `refetchQueries({ queryKey })` | Buộc refetch ngay lập tức dù không stale |

Khi `invalidateQueries` được gọi:
1. Query được đánh dấu là stale.
2. Nếu có component đang dùng query đó (active observer), React Query **tự động refetch**.
3. UI cập nhật với dữ liệu mới.

### Code minh hoạ

```tsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

function TodoList() {
  const queryClient = useQueryClient();

  // Query lấy danh sách
  const { data: todos } = useQuery({
    queryKey: ["todos"],
    queryFn: () => fetch("/api/todos").then((r) => r.json()),
  });

  // Mutation xoá todo
  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/todos/${id}`, { method: "DELETE" }).then((r) => r.json()),

    onSuccess: (_data, deletedId) => {
      // Cách 1: Invalidate — React Query sẽ tự refetch
      queryClient.invalidateQueries({ queryKey: ["todos"] });

      // Cách 2: setQueryData — cập nhật cache trực tiếp, không cần round-trip
      // queryClient.setQueryData<Todo[]>(["todos"], (old = []) =>
      //   old.filter((todo) => todo.id !== deletedId)
      // );
    },
  });

  // Invalidate nhiều query cùng lúc (ví dụ: todos + user stats)
  const updateMutation = useMutation({
    mutationFn: (todo: Todo) =>
      fetch(`/api/todos/${todo.id}`, {
        method: "PUT",
        body: JSON.stringify(todo),
      }).then((r) => r.json()),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["user", "stats"] });
    },
  });

  return (
    <ul>
      {todos?.map((todo: { id: number; title: string }) => (
        <li key={todo.id}>
          {todo.title}
          <button onClick={() => deleteMutation.mutate(todo.id)}>Xoá</button>
        </li>
      ))}
    </ul>
  );
}
```

### Đáp án mẫu

> Cache invalidation hoạt động bằng cách gọi `queryClient.invalidateQueries()` trong `onSuccess` của mutation. React Query đánh dấu query là stale và tự động refetch nếu có component đang dùng query đó. Nếu muốn tránh round-trip mạng, có thể dùng `setQueryData` để cập nhật cache trực tiếp.

---

## Câu 3: Optimistic updates trong React Query thực hiện như thế nào? `[Advanced]`

### Câu hỏi

> Optimistic updates là gì? Cách triển khai trong React Query và xử lý rollback khi mutation thất bại?

### Giải thích lý thuyết

**Optimistic update** là kỹ thuật cập nhật UI **ngay lập tức** trước khi server phản hồi, tạo cảm giác nhanh hơn cho người dùng. Nếu server trả về lỗi, ta **rollback** về trạng thái cũ.

Luồng xử lý:

```
mutate() gọi  →  onMutate: cập nhật cache lạc quan
                        ↓
               Server xử lý request
                ↙             ↘
         onSuccess              onError
    invalidate cache         rollback cache
                ↓                   ↓
           onSettled (luôn chạy)
```

Trong `onMutate`, ta cần:
1. Cancel các query đang pending (tránh ghi đè optimistic update).
2. Lưu snapshot dữ liệu cũ để rollback.
3. Ghi dữ liệu mới vào cache ngay.

### Code minh hoạ

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

function TodoItem({ todo }: { todo: Todo }) {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: (updatedTodo: Todo) =>
      fetch(`/api/todos/${updatedTodo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTodo),
      }).then((r) => {
        if (!r.ok) throw new Error("Cập nhật thất bại");
        return r.json();
      }),

    // Bước 1: Trước khi mutation chạy — cập nhật cache lạc quan
    onMutate: async (updatedTodo) => {
      // Huỷ refetch đang pending để tránh ghi đè
      await queryClient.cancelQueries({ queryKey: ["todos"] });

      // Lưu snapshot dữ liệu cũ để rollback nếu lỗi
      const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]);

      // Cập nhật cache ngay lập tức (optimistic)
      queryClient.setQueryData<Todo[]>(["todos"], (old = []) =>
        old.map((t) => (t.id === updatedTodo.id ? updatedTodo : t))
      );

      // Trả về context để dùng trong onError
      return { previousTodos };
    },

    // Bước 2: Nếu lỗi — rollback về dữ liệu cũ
    onError: (_error, _updatedTodo, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos"], context.previousTodos);
      }
    },

    // Bước 3: Dù thành công hay lỗi — đồng bộ lại với server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  return (
    <label>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() =>
          toggleMutation.mutate({ ...todo, completed: !todo.completed })
        }
      />
      {todo.title}
      {toggleMutation.isPending && " (đang lưu...)"}
    </label>
  );
}
```

### Đáp án mẫu

> Optimistic update được triển khai trong `onMutate`: cancel query pending, lưu snapshot cache cũ, rồi ghi dữ liệu mới vào cache ngay. Trong `onError`, dùng snapshot để rollback. Trong `onSettled`, invalidate để đồng bộ với server. Kỹ thuật này giúp UI phản hồi tức thì ngay cả khi mạng chậm.

---

## Câu 4: Mutation side effects: `onMutate`, `onSuccess`, `onError`, `onSettled` hoạt động ra sao? `[Advanced]`

### Câu hỏi

> Giải thích thứ tự và vai trò của các callback `onMutate`, `onSuccess`, `onError`, `onSettled` trong `useMutation`. Chúng có thể được định nghĩa ở đâu?

### Giải thích lý thuyết

React Query v5 cho phép định nghĩa side effects ở **hai tầng**:

- **Tầng `useMutation`** (global với mutation đó): dùng cho logic nghiệp vụ chung (invalidate, toast chung).
- **Tầng `mutate()` / `mutateAsync()`** (per-call): dùng cho logic riêng từng lần gọi.

Thứ tự thực thi:

```
mutate() được gọi
  → onMutate (useMutation)      ← dữ liệu chưa gửi đi
  → [Gửi request đến server]
  → onSuccess / onError         ← từ useMutation trước
  → onSuccess / onError         ← từ mutate() sau
  → onSettled                   ← từ useMutation trước
  → onSettled                   ← từ mutate() sau
```

| Callback | Khi nào chạy | Nhận tham số | Dùng cho |
|---|---|---|---|
| `onMutate` | Trước khi request gửi đi | `variables` | Optimistic update, lưu snapshot |
| `onSuccess` | Request thành công | `data, variables, context` | Invalidate cache, thông báo thành công |
| `onError` | Request thất bại | `error, variables, context` | Rollback, thông báo lỗi |
| `onSettled` | Sau khi xong (dù thành công hay lỗi) | `data?, error?, variables, context` | Cleanup, đảm bảo đồng bộ |

### Code minh hoạ

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface UpdateUserPayload {
  id: number;
  name: string;
  email: string;
}

function UserEditForm({ userId }: { userId: number }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: UpdateUserPayload) =>
      fetch(`/api/users/${payload.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then((r) => {
        if (!r.ok) throw new Error("Cập nhật thất bại");
        return r.json();
      }),

    // Chạy TRƯỚC khi request — dùng cho optimistic update
    onMutate: async (variables) => {
      console.log("Chuẩn bị gửi:", variables);
      await queryClient.cancelQueries({ queryKey: ["user", userId] });
      const snapshot = queryClient.getQueryData(["user", userId]);
      queryClient.setQueryData(["user", userId], variables);
      return { snapshot };
    },

    // Chạy khi THÀNH CÔNG — nhận response data từ server
    onSuccess: (data, variables, context) => {
      console.log("Thành công, data từ server:", data);
      toast.success(`Đã cập nhật thông tin ${data.name}`);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },

    // Chạy khi CÓ LỖI — rollback nếu cần
    onError: (error, variables, context) => {
      console.error("Lỗi:", error.message);
      toast.error(error.message);
      if (context?.snapshot) {
        queryClient.setQueryData(["user", userId], context.snapshot);
      }
    },

    // Luôn chạy SAU CÙNG — dù thành công hay lỗi
    onSettled: (data, error, variables, context) => {
      console.log("Mutation hoàn tất, đồng bộ lại...");
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
    },
  });

  const handleSave = (formData: UpdateUserPayload) => {
    mutation.mutate(formData, {
      // Callback per-call — chạy SAU callbacks của useMutation
      onSuccess: () => {
        console.log("Per-call onSuccess: đóng modal");
        // closeModal()
      },
      onError: (error) => {
        console.log("Per-call onError: focus lại form");
      },
    });
  };

  return <div>{/* form UI */}</div>;
}
```

### Đáp án mẫu

> `onMutate` chạy trước khi request, dùng cho optimistic update. `onSuccess` / `onError` chạy tuỳ theo kết quả. `onSettled` luôn chạy sau cùng. Callbacks định nghĩa trong `useMutation` chạy trước, rồi đến callbacks truyền vào `mutate()`. Kết hợp hai tầng này giúp tách biệt logic chung và logic đặc thù từng lần gọi.

---

## Câu 5: Cách xử lý race conditions trong React Query? `[Advanced]`

### Câu hỏi

> Race condition trong context của React Query là gì? React Query xử lý vấn đề này như thế nào và khi nào lập trình viên cần can thiệp thêm?

### Giải thích lý thuyết

**Race condition** xảy ra khi nhiều request gửi đi gần nhau và response về không theo thứ tự đã gửi — khiến UI hiển thị dữ liệu cũ hơn mặc dù đã có dữ liệu mới hơn.

React Query xử lý race condition **tự động** ở tầng `useQuery`:

- Mỗi lần fetch, React Query tạo một "generation" (thế hệ). Chỉ response của generation **mới nhất** được chấp nhận.
- Các response cũ bị bỏ qua (không phải cancel — mà ignore).

Tuy nhiên, với **mutations** và các trường hợp đặc biệt, lập trình viên cần xử lý thêm:

| Tình huống | Giải pháp |
|---|---|
| Optimistic update + mutation thất bại | Rollback trong `onError`, dùng `cancelQueries` trong `onMutate` |
| Nhiều mutation cùng loại gửi liên tiếp | Dùng `AbortController` để cancel request cũ |
| Query refetch ghi đè optimistic update | `cancelQueries` trong `onMutate` |
| Sequential dependent mutations | Dùng `mutateAsync` với `await` |

### Code minh hoạ

```tsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";

// Tình huống 1: React Query tự xử lý race condition trong useQuery
function SearchResults({ query }: { query: string }) {
  const { data } = useQuery({
    queryKey: ["search", query],
    queryFn: ({ signal }) =>
      // Truyền signal để fetch có thể bị abort khi query key thay đổi
      fetch(`/api/search?q=${query}`, { signal }).then((r) => r.json()),
    // React Query tự cancel fetch cũ khi queryKey thay đổi
  });

  return <div>{data?.results?.map((r: { id: number; title: string }) => <p key={r.id}>{r.title}</p>)}</div>;
}

// Tình huống 2: Xử lý race condition trong mutation với AbortController
function AutoSaveEditor() {
  const abortRef = useRef<AbortController | null>(null);

  const saveMutation = useMutation({
    mutationFn: async (content: string) => {
      // Huỷ request đang chạy nếu có
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const res = await fetch("/api/document", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        signal: abortRef.current.signal, // Gắn signal vào request
      });

      if (!res.ok) throw new Error("Lưu thất bại");
      return res.json();
    },
    onError: (error) => {
      // Bỏ qua lỗi do abort (không phải lỗi thật)
      if (error.name === "AbortError") return;
      console.error("Lỗi lưu tài liệu:", error.message);
    },
  });

  return (
    <textarea
      onChange={(e) => saveMutation.mutate(e.target.value)}
      placeholder="Gõ để tự động lưu..."
    />
  );
}

// Tình huống 3: Sequential mutations với mutateAsync
function MultiStepForm() {
  const createUser = useMutation({
    mutationFn: (data: { name: string }) =>
      fetch("/api/users", {
        method: "POST",
        body: JSON.stringify(data),
      }).then((r) => r.json()),
  });

  const assignRole = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) =>
      fetch(`/api/users/${userId}/roles`, {
        method: "POST",
        body: JSON.stringify({ role }),
      }).then((r) => r.json()),
  });

  const handleSubmit = async () => {
    try {
      // Đảm bảo thứ tự: tạo user trước, rồi mới assign role
      const newUser = await createUser.mutateAsync({ name: "Nguyễn Văn A" });
      await assignRole.mutateAsync({ userId: newUser.id, role: "editor" });
      console.log("Hoàn tất tạo user và gán quyền");
    } catch (error) {
      console.error("Quy trình thất bại:", error);
    }
  };

  return <button onClick={handleSubmit}>Tạo tài khoản</button>;
}
```

### Đáp án mẫu

> React Query tự xử lý race condition trong `useQuery` bằng cách chỉ chấp nhận response của request mới nhất. Với mutations, lập trình viên cần chủ động: dùng `cancelQueries` trong `onMutate` để tránh refetch ghi đè optimistic update, dùng `AbortController` để cancel request cũ khi có mutation mới hơn, và dùng `mutateAsync` với `await` để đảm bảo thứ tự sequential mutations.

---

## Câu 6: React Query DevTools là gì? Cách sử dụng? `[Basic]`

### Câu hỏi

> React Query DevTools là gì và cách tích hợp vào dự án để debug?

### Giải thích lý thuyết

**React Query DevTools** là một panel UI có thể nhúng vào ứng dụng trong môi trường development, giúp lập trình viên quan sát toàn bộ trạng thái cache của React Query theo thời gian thực.

Các tính năng chính:

| Tính năng | Mô tả |
|---|---|
| Danh sách queries | Xem tất cả queries đang active, stale, fetching, inactive |
| Trạng thái query | `fresh`, `stale`, `fetching`, `paused`, `inactive` |
| Query data | Xem dữ liệu đang lưu trong cache |
| Mutation log | Theo dõi mutations đang pending, thành công, thất bại |
| Trigger refetch | Buộc refetch thủ công từ DevTools |
| Remove query | Xoá query khỏi cache để test |

DevTools chỉ hoạt động trong development (`NODE_ENV !== 'production'`) và không được bundle vào production build.

### Code minh hoạ

```tsx
// main.tsx hoặc App.tsx — Cài đặt cơ bản
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import App from "./App";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 phút
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />

      {/* DevTools chỉ hiện trong development */}
      <ReactQueryDevtools
        initialIsOpen={false} // Mặc định đóng, click icon để mở
        buttonPosition="bottom-right" // Vị trí nút toggle
      />
    </QueryClientProvider>
  </React.StrictMode>
);
```

```tsx
// Cài đặt package
// npm install @tanstack/react-query-devtools

// Lazy load DevTools — tránh ảnh hưởng bundle size (tùy chọn nâng cao)
import { lazy, Suspense } from "react";

const ReactQueryDevtoolsProduction = lazy(() =>
  import("@tanstack/react-query-devtools/build/modern/production.js").then(
    (d) => ({ default: d.ReactQueryDevtools })
  )
);

function App() {
  const [showDevtools, setShowDevtools] = React.useState(false);

  React.useEffect(() => {
    // Bật DevTools bằng window.toggleDevtools() trong console
    (window as Window & { toggleDevtools?: () => void }).toggleDevtools = () =>
      setShowDevtools((old) => !old);
  }, []);

  return (
    <>
      {/* App content */}
      {showDevtools && (
        <Suspense fallback={null}>
          <ReactQueryDevtoolsProduction />
        </Suspense>
      )}
    </>
  );
}
```

### Đáp án mẫu

> React Query DevTools là panel UI debug được nhúng vào app, cho phép quan sát trạng thái toàn bộ cache (queries, mutations) theo thời gian thực. Cài bằng `@tanstack/react-query-devtools`, đặt `ReactQueryDevtools` bên trong `QueryClientProvider`. Chỉ active trong development, không ảnh hưởng production build.

---
