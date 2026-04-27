---
sidebar_position: 2
title: "2. Firestore CRUD"
---

# Firestore CRUD


---

## Mục lục

- [Firestore là gì?](#firestore-là-gì)
- [Setup](#setup)
- [Create (Thêm document)](#create-thêm-document)
- [Read (Đọc data)](#read-đọc-data)
- [Update (Cập nhật)](#update-cập-nhật)
- [Delete (Xóa)](#delete-xóa)
- [Custom Hook: useFirestore](#custom-hook-usefirestore)
- [Security Rules](#security-rules)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Firestore là gì?

Cloud Firestore là NoSQL database của Firebase, lưu trữ data dạng **documents** trong **collections**. Hỗ trợ realtime sync và offline.

```
Cấu trúc:
users (collection)
├── user1 (document)
│   ├── name: "Alice"
│   ├── email: "alice@test.com"
│   └── createdAt: Timestamp
├── user2 (document)
│   ├── name: "Bob"
│   └── posts (sub-collection)
│       └── post1 (document)
```

## Setup

```tsx
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
```

## Create (Thêm document)

### addDoc — ID tự động

```tsx
async function createPost(data: { title: string; content: string; authorId: string }) {
  const docRef = await addDoc(collection(db, 'posts'), {
    ...data,
    createdAt: serverTimestamp(),
    likes: 0,
  });

  return docRef.id; // ID tự sinh
}
```

### setDoc — ID tự chọn

```tsx
import { setDoc, doc } from 'firebase/firestore';

async function createUserProfile(userId: string, data: UserProfile) {
  await setDoc(doc(db, 'users', userId), {
    ...data,
    createdAt: serverTimestamp(),
  });
}
```

## Read (Đọc data)

### Lấy một document

```tsx
async function getPost(postId: string): Promise<Post | null> {
  const docSnap = await getDoc(doc(db, 'posts', postId));

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Post;
  }

  return null;
}
```

### Lấy tất cả documents trong collection

```tsx
async function getAllPosts(): Promise<Post[]> {
  const querySnapshot = await getDocs(collection(db, 'posts'));

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Post[];
}
```

### Query với điều kiện

```tsx
async function getPostsByAuthor(authorId: string): Promise<Post[]> {
  const q = query(
    collection(db, 'posts'),
    where('authorId', '==', authorId),
    orderBy('createdAt', 'desc'),
    limit(10)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Post[];
}
```

### Operators có sẵn

| Operator | Ý nghĩa |
|----------|---------|
| `==` | Bằng |
| `!=` | Khác |
| `<`, `<=`, `>`, `>=` | So sánh |
| `in` | Nằm trong mảng giá trị |
| `not-in` | Không nằm trong |
| `array-contains` | Mảng chứa giá trị |
| `array-contains-any` | Mảng chứa bất kỳ giá trị nào |

```tsx
// Posts có category là "tech" hoặc "design"
const q = query(
  collection(db, 'posts'),
  where('category', 'in', ['tech', 'design'])
);

// Posts có tags chứa "react"
const q = query(
  collection(db, 'posts'),
  where('tags', 'array-contains', 'react')
);
```

## Update (Cập nhật)

### updateDoc — cập nhật fields cụ thể

```tsx
async function updatePost(postId: string, data: Partial<Post>) {
  await updateDoc(doc(db, 'posts', postId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// Sử dụng
await updatePost('abc123', { title: 'Updated Title' });
```

### Increment, arrayUnion, arrayRemove

```tsx
import { increment, arrayUnion, arrayRemove } from 'firebase/firestore';

// Tăng likes
await updateDoc(doc(db, 'posts', postId), {
  likes: increment(1),
});

// Thêm tag vào mảng
await updateDoc(doc(db, 'posts', postId), {
  tags: arrayUnion('react'),
});

// Xóa tag khỏi mảng
await updateDoc(doc(db, 'posts', postId), {
  tags: arrayRemove('old-tag'),
});
```

## Delete (Xóa)

```tsx
async function deletePost(postId: string) {
  await deleteDoc(doc(db, 'posts', postId));
}
```

## Custom Hook: useFirestore

```tsx
function useCollection<T>(collectionName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        const results = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        setData(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [collectionName]);

  return { data, loading, error };
}

// Sử dụng
function PostList() {
  const { data: posts, loading, error } = useCollection<Post>('posts');

  if (loading) return <Spinner />;
  if (error) return <p>Error: {error}</p>;

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

## Security Rules

Viết trong Firebase Console → Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users: chỉ chủ sở hữu đọc/ghi
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Posts: ai cũng đọc, chỉ author ghi
    match /posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null
        && request.auth.uid == resource.data.authorId;
    }
  }
}
```

### Rules quan trọng

- `request.auth != null` — user đã đăng nhập
- `request.auth.uid` — UID của user hiện tại
- `resource.data` — data hiện tại trong document
- `request.resource.data` — data mới gửi lên
- **KHÔNG BAO GIỜ** dùng `allow read, write: if true;` trong production

---

## Câu hỏi phỏng vấn

### Câu 1: addDoc vs setDoc khác nhau thế nào?
**Đáp án:**

| Tiêu chí | `addDoc` | `setDoc` |
|----------|---------|---------|
| Document ID | Firebase **tự sinh** ID ngẫu nhiên | Bạn **tự chọn** ID |
| Tham số | `addDoc(collectionRef, data)` | `setDoc(docRef, data)` |
| Khi doc tồn tại | Luôn tạo document mới | **Ghi đè** toàn bộ document (trừ khi dùng `merge`) |
| Use case | Tạo post, comment, order (không cần kiểm soát ID) | Tạo user profile theo UID, config theo key |

```tsx
// addDoc — ID tự động, luôn tạo mới
const docRef = await addDoc(collection(db, 'posts'), {
  title: 'Hello',
  createdAt: serverTimestamp(),
});
console.log('New ID:', docRef.id); // e.g., "xK9f2mZ..."

// setDoc — ID tự chọn, ghi đè nếu tồn tại
await setDoc(doc(db, 'users', userId), {
  name: 'Alice',
  email: 'alice@test.com',
});

// setDoc với merge — chỉ cập nhật fields được chỉ định, giữ nguyên fields khác
await setDoc(doc(db, 'users', userId), { name: 'Bob' }, { merge: true });
```

Lưu ý: `setDoc` không có `merge: true` sẽ **xóa toàn bộ fields cũ** và thay bằng data mới. Đây là lỗi phổ biến khi muốn update nhưng lại dùng `setDoc` thay vì `updateDoc`.

### Câu 2: Firestore Security Rules quan trọng như thế nào?
**Đáp án:**

Security Rules là lớp bảo vệ **bắt buộc** của Firestore. Không có rules đúng, bất kỳ ai biết projectId đều có thể đọc/ghi toàn bộ database.

Tại sao quan trọng:
- Firebase config (apiKey, projectId) là **public** và nằm trong client-side code, ai cũng thấy được.
- Security Rules là **cơ chế duy nhất** kiểm soát quyền truy cập ở server-side.
- Client-side validation có thể bị bypass hoàn toàn.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // NGUY HIỂM — KHÔNG BAO GIỜ dùng trong production
    // match /{document=**} {
    //   allow read, write: if true;
    // }

    // ĐÚNG: Kiểm tra authentication và ownership
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // ĐÚNG: Validate data trước khi ghi
    match /posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null
        && request.resource.data.title is string
        && request.resource.data.title.size() > 0
        && request.resource.data.title.size() <= 200;
      allow update, delete: if request.auth.uid == resource.data.authorId;
    }
  }
}
```

Nguyên tắc: **Deny by default** -- chỉ mở quyền cần thiết, validate cả data type và ownership.

### Câu 3: Cách query data với điều kiện trong Firestore?
**Đáp án:**

Firestore sử dụng các hàm `query()`, `where()`, `orderBy()`, `limit()` để tạo truy vấn có điều kiện:

```tsx
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

// Query đơn giản: lấy posts của một author
const q = query(
  collection(db, 'posts'),
  where('authorId', '==', 'user123')
);

// Query kết hợp nhiều điều kiện
const q = query(
  collection(db, 'posts'),
  where('status', '==', 'published'),
  where('category', '==', 'tech'),
  orderBy('createdAt', 'desc'),
  limit(20)
);

// Query với array-contains
const q = query(
  collection(db, 'posts'),
  where('tags', 'array-contains', 'react')
);

// Query với in operator
const q = query(
  collection(db, 'posts'),
  where('category', 'in', ['tech', 'design', 'science'])
);

// Thực thi query
const snapshot = await getDocs(q);
const results = snapshot.docs.map((doc) => ({
  id: doc.id,
  ...doc.data(),
}));
```

Lưu ý quan trọng:
- Firestore **yêu cầu composite index** khi dùng `where()` trên field khác với `orderBy()`. Firebase Console sẽ hiển thị link tạo index khi gặp lỗi.
- Không thể dùng `!=` hoặc `not-in` kết hợp với `in` hay `array-contains-any` trong cùng một query.
- Mỗi query chỉ có thể dùng range operators (`<`, `<=`, `>`, `>=`) trên **một field duy nhất**.

### Câu 4: serverTimestamp() dùng để làm gì?
**Đáp án:**

`serverTimestamp()` tạo timestamp dựa trên **đồng hồ server Firebase**, không phải đồng hồ client. Điều này đảm bảo thời gian chính xác và nhất quán giữa tất cả client.

```tsx
import { serverTimestamp } from 'firebase/firestore';

// Khi tạo document
await addDoc(collection(db, 'posts'), {
  title: 'My Post',
  content: 'Hello World',
  createdAt: serverTimestamp(), // Server quyết định thời gian
  updatedAt: serverTimestamp(),
});

// Khi update document
await updateDoc(doc(db, 'posts', postId), {
  title: 'Updated Title',
  updatedAt: serverTimestamp(), // Tự động set thời gian update
});
```

Tại sao không dùng `new Date()` hoặc `Date.now()`:
- **Đồng hồ client không đáng tin**: User có thể chỉnh sai giờ, múi giờ khác nhau, hoặc thiết bị lệch thời gian.
- **Tính nhất quán**: `serverTimestamp()` đảm bảo mọi document đều dùng cùng một nguồn thời gian.
- **orderBy chính xác**: Khi sort theo `createdAt`, server timestamp cho kết quả đúng thứ tự thực tế.
- **Security Rules**: Có thể validate `request.resource.data.createdAt == request.time` để chắc chắn client không fake timestamp.
