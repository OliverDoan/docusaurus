---
sidebar_position: 15
title: "Performance"
---

# Performance

## 1. Performance Optimization

Bài học: [1. Performance Optimization](../../react-native/15-performance/1_performance.md)

Những câu thường gặp về chủ đề này. Tự trả lời trước, rồi bấm **Xem đáp án** để đối chiếu.

**1. Tại sao animation `useNativeDriver` quan trọng?**

<details className="qa">
<summary>Xem đáp án</summary>

Mặc định Animated chạy **JS thread**. Nếu JS busy (React render, network), animation jank. **`useNativeDriver: true`** chuyển animation sang **UI thread** -- chạy độc lập JS, 60fps đảm bảo. Hạn chế: chỉ opacity + transform.

</details>

**2. Re-render nhiều ảnh hưởng performance?**

<details className="qa">
<summary>Xem đáp án</summary>

Mỗi re-render: React diff virtual DOM, gọi reconciler, layout. Render 100 lần thay vì 1 lần -> CPU/battery tốn. Optimize:

- `React.memo` cho component
- `useMemo`/`useCallback` cho object/function
- Avoid inline object/function trong JSX

</details>

**3. FlatList vs FlashList?**

<details className="qa">
<summary>Xem đáp án</summary>

- **FlatList**: virtualize, mount/unmount item -> tốn
- **FlashList** (Shopify): **recycle** item view -- không destroy/create -- 5x nhanh

Production app có list lớn -> FlashList.

</details>

**4. New Architecture lợi ích gì?**

<details className="qa">
<summary>Xem đáp án</summary>

- **JSI**: JS gọi native trực tiếp, sync, không qua bridge
- **Fabric**: renderer mới, đồng bộ UI ↔ JS
- **TurboModules**: lazy load, type-safe
- **Codegen**: type-safe interop

Performance lớn, bridge bottleneck biến mất.

</details>

**5. Cách profile RN?**

<details className="qa">
<summary>Xem đáp án</summary>

1. **Perf Monitor**: in-app, xem FPS/RAM realtime
2. **React DevTools Profiler**: tìm component render chậm
3. **Hermes Sampling Profiler**: JS thread profiling, mở trong Chrome
4. **Native tools**: Instruments (iOS), Android Studio Profiler

Test trên **low-end device** để thấy bottleneck thực.

</details>
