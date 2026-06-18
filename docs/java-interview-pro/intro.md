---
sidebar_position: 0
title: "Giới thiệu"
slug: /java-interview-pro-intro
---

# Phỏng vấn Java — Junior đến Senior (93 câu)

Đây là bộ **93 câu hỏi phỏng vấn Java** trải dài từ nền tảng tới chuyên sâu, dành
cho các vị trí **Junior → Mid → Senior**. So với bộ [Java Interview (Intern)](/java-interview-intro)
thiên về cơ bản, bộ này đi xa hơn: **đồng thời (concurrency)**, **JVM & bộ nhớ**,
**Java hiện đại (8 → 21)**, và cả **Spring Boot** từ cơ bản tới nâng cao (WebFlux,
GraalVM, OAuth 2.1, observability).

> Tài liệu biên soạn dưới góc nhìn **người phỏng vấn (interviewer)**: mỗi câu có
> kèm cách hỏi thực tế, lý thuyết nền, code minh hoạ và đáp án mẫu để bạn nói
> trong 30–90 giây.

---

## Cấu trúc mỗi câu hỏi

Mỗi câu gồm 4 phần:

1. **Câu hỏi** — đúng cách người phỏng vấn sẽ hỏi.
2. **Giải thích lý thuyết** — kiến thức nền cần có để trả lời tốt.
3. **Code minh hoạ** — ví dụ thực tế, dễ hiểu.
4. **Đáp án mẫu** — câu trả lời gọn gàng bạn có thể nói khi phỏng vấn.

---

## Phân cấp độ

- `[Basic]` — Nền tảng, bắt buộc phải biết.
- `[Intermediate]` — Nâng cao, trả lời tốt sẽ gây ấn tượng.
- `[Advanced]` — Chuyên sâu, thường hỏi ở vị trí mid/senior.

---

## Nội dung

| # | Chủ đề | Trọng tâm |
|---|--------|-----------|
| 1 | **Java Core & Cú pháp** | Java là gì, đặc điểm, JVM/JRE/JDK, `==` vs `equals`, access modifier, `final`, `static` |
| 2 | **OOP & Design Patterns** | 4 trụ cột, đa hình, abstract vs interface, SOLID, LSP, Singleton/Factory/Builder |
| 3 | **String & Xử lý chuỗi** | Immutable, StringBuilder/StringBuffer, Text Block |
| 4 | **Collections** | HashSet/TreeSet/HashMap/TreeMap, Iterator, Comparable vs Comparator, ConcurrentHashMap |
| 5 | **Functional & Java hiện đại** | Stream, lambda, Optional, Generics, Records, Sealed, Pattern Matching |
| 6 | **Xử lý ngoại lệ** | NPE, checked vs unchecked, try-with-resources |
| 7 | **Đồng thời (Concurrency)** | Thread, synchronization, deadlock, ExecutorService, CompletableFuture, Virtual Threads |
| 8 | **JVM & Bộ nhớ** | Heap/Stack, Garbage Collection, memory leak, ClassLoader, Reflection |
| 9 | **Spring Boot Core** | DI, các annotation, config, Actuator, Starters, JPA, `@Transactional` |
| 10 | **Spring nâng cao** | MVC vs WebFlux, Testcontainers, GraalVM, Spring AOT, observability, OAuth 2.1 |

---

## Lời khuyên

1. **Hiểu bản chất, đừng học vẹt** — interviewer hay hỏi *"tại sao"* và *"khi nào
   dùng"*.
2. **Tự code lại** các ví dụ, đừng chỉ đọc.
3. **Biết đánh đổi (trade-off)** — câu trả lời "tuỳ trường hợp, vì..." thường ghi
   điểm hơn câu trả lời tuyệt đối.
4. **Thành thật khi chưa rõ**, rồi trình bày hướng suy nghĩ.

Bắt đầu từ chủ đề **[1. Java Core & Cú pháp](./1_java-core.md)**.
