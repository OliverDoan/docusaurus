---
sidebar_position: 2
title: "Firestore CRUD"
---

# Firestore CRUD

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
