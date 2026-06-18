---
sidebar_position: 0
title: "Mục lục"
---

# State Management — Câu hỏi phỏng vấn

> Bộ câu hỏi về **quản lý state** phía client: Redux & Redux Toolkit, TanStack Query (React Query), Zustand, Jotai — kèm cách hỏi thực tế, lý thuyết, code và đáp án mẫu.

Mỗi câu gồm 4 phần: **Câu hỏi · Giải thích lý thuyết · Code minh hoạ · Đáp án mẫu**. Phân cấp `[Basic]` / `[Intermediate]` / `[Advanced]`.

| # | File | Trọng tâm |
|---|------|-----------|
| 1 | [Redux Core](./1_redux-core.md) | Redux thuần: 3 nguyên tắc, action, reducer, store, middleware, selector, DevTools |
| 2 | [Redux Toolkit](./2_redux-toolkit.md) | RTK: createSlice, createAsyncThunk, RTK Query, createApi |
| 3 | [React Query — Cơ bản](./3_react-query-co-ban.md) | useQuery, QueryClient, server state, staleTime/gcTime, error, QueryKey |
| 4 | [React Query — Mutations](./4_react-query-mutations.md) | useMutation, cache invalidation, optimistic, side effects, race conditions |
| 5 | [React Query — Query control](./5_react-query-control.md) | select, placeholder/initial data, parallel, cancel, enabled, query filters |
| 6 | [React Query — Nâng cao](./6_react-query-nang-cao.md) | prefetch, infinite, dependent, RSC, useSuspenseQuery, persist, vs SWR |
| 7 | [Zustand](./7_zustand.md) | Store, actions, middleware, persist, slices, TypeScript, so sánh tổng hợp |
| 8 | [Jotai](./8_jotai.md) | Atom, Provider, async atoms, atomic state, so với Zustand/Recoil |

> So sánh tổng hợp **Redux Toolkit vs Zustand vs Context vs Jotai** nằm ở [Zustand](./7_zustand.md). Các câu hỏi về state ở mức React thuần (Context, lifting state, server vs client state) nằm ở mục [3. React](../03-react/3_state-management.md).
