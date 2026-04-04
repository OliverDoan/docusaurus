---
sidebar_position: 3
title: "Firebase Storage & Realtime"
---

# Firebase Storage & Realtime Listener

## Firebase Storage

Cloud Storage dùng để lưu trữ files (images, videos, documents).

### Upload file

```tsx
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

async function uploadImage(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, `${path}/${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Tiến trình upload
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload: ${progress}%`);
      },
      (error) => reject(error),
      async () => {
        // Upload xong → lấy download URL
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}
```

### Component upload ảnh

```tsx
function ImageUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    const storageRef = ref(storage, `images/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      },
      (error) => {
        console.error('Upload failed:', error);
        setUploading(false);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        onUpload(url);
        setUploading(false);
        setProgress(0);
      }
    );
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
      {uploading && <progress value={progress} max={100} />}
    </div>
  );
}
```

### Delete file

```tsx
import { ref, deleteObject } from 'firebase/storage';

async function deleteImage(fileUrl: string) {
  const fileRef = ref(storage, fileUrl);
  await deleteObject(fileRef);
}
```

### Storage Security Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Images: chỉ user đã auth upload, ai cũng đọc
    match /images/{fileName} {
      allow read: if true;
      allow write: if request.auth != null
        && request.resource.size < 5 * 1024 * 1024   // Max 5MB
        && request.resource.contentType.matches('image/.*');
    }

    // User avatars: chỉ chủ sở hữu
    match /users/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Realtime Listeners

Firestore hỗ trợ lắng nghe data **realtime** — UI tự cập nhật khi data thay đổi trên server.

### onSnapshot — Lắng nghe document

```tsx
import { doc, onSnapshot } from 'firebase/firestore';

function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Lắng nghe thay đổi realtime
    const unsubscribe = onSnapshot(doc(db, 'users', userId), (docSnap) => {
      if (docSnap.exists()) {
        setUser({ id: docSnap.id, ...docSnap.data() } as User);
      }
    });

    // Cleanup: hủy listener khi unmount
    return () => unsubscribe();
  }, [userId]);

  return <p>{user?.name}</p>;
}
```

### onSnapshot — Lắng nghe collection

```tsx
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

function ChatMessages({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'rooms', roomId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];

      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [roomId]);

  return (
    <div>
      {messages.map((msg) => (
        <p key={msg.id}>{msg.text}</p>
      ))}
    </div>
  );
}
```

### Custom Hook: useRealtimeCollection

```tsx
function useRealtimeCollection<T>(collectionPath: string, queryConstraints: QueryConstraint[] = []) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, collectionPath), ...queryConstraints);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const results = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];

      setData(results);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [collectionPath]);

  return { data, loading };
}

// Sử dụng
function PostList() {
  const { data: posts, loading } = useRealtimeCollection<Post>('posts');
  // Tự cập nhật khi có post mới!
}
```

## Snapshot changes

Phân biệt document nào được thêm, sửa, xóa:

```tsx
onSnapshot(q, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === 'added') {
      console.log('New:', change.doc.data());
    }
    if (change.type === 'modified') {
      console.log('Modified:', change.doc.data());
    }
    if (change.type === 'removed') {
      console.log('Removed:', change.doc.data());
    }
  });
});
```

## Offline Support

Firestore tự cache data offline. Khi mất mạng:
- Reads trả về data từ cache
- Writes được queue và sync khi có mạng lại

```tsx
import { enableIndexedDbPersistence } from 'firebase/firestore';

// Bật persistence (gọi một lần khi app khởi tạo)
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Nhiều tab đang mở
  } else if (err.code === 'unimplemented') {
    // Trình duyệt không hỗ trợ
  }
});
```

---

## Câu hỏi phỏng vấn

### Câu 1: onSnapshot khác getDocs thế nào?
**Đáp án:**

| Tiêu chí | `getDocs` | `onSnapshot` |
|----------|----------|-------------|
| Kiểu | **One-time read** — lấy data một lần | **Realtime listener** — lắng nghe liên tục |
| Kết quả | Trả về `Promise<QuerySnapshot>` | Gọi callback mỗi khi data thay đổi |
| Cập nhật | Phải gọi lại thủ công để refresh | Tự động nhận data mới từ server |
| Cleanup | Không cần | **Bắt buộc** gọi `unsubscribe()` |
| Chi phí | 1 lần đọc | Tính phí mỗi lần data thay đổi |

```tsx
// getDocs — lấy data một lần, phù hợp cho báo cáo, export
async function loadPosts() {
  const snapshot = await getDocs(collection(db, 'posts'));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// onSnapshot — realtime, phù hợp cho chat, notification, dashboard
useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, 'posts'), (snapshot) => {
    const posts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setPosts(posts);
  });

  return () => unsubscribe(); // Cleanup bắt buộc
}, []);
```

Khi nào dùng cái nào:
- **getDocs**: Data ít thay đổi (profile user, settings), danh sách tĩnh, export data.
- **onSnapshot**: Chat realtime, notification feed, collaborative editing, dashboard live.

### Câu 2: Tại sao cần unsubscribe listener trong cleanup?
**Đáp án:**

Khi component unmount mà không hủy listener, sẽ xảy ra các vấn đề nghiêm trọng:

1. **Memory leak**: Listener tiếp tục chạy ngầm, giữ reference đến callback và state cũ, bộ nhớ không được giải phóng.

2. **State update on unmounted component**: Listener cố gắng gọi `setState` trên component đã unmount, gây warning hoặc lỗi.

3. **Tốn chi phí Firebase**: Mỗi lần data thay đổi, Firestore vẫn gửi snapshot cho listener đã "bỏ rơi", tính phí reads không cần thiết.

4. **Listener chồng chất**: Nếu component mount/unmount nhiều lần (ví dụ navigate qua lại), mỗi lần tạo listener mới mà không hủy cũ, dẫn đến nhiều listener chạy song song.

```tsx
// SAI: Không cleanup — memory leak
useEffect(() => {
  onSnapshot(collection(db, 'messages'), (snapshot) => {
    setMessages(snapshot.docs.map((d) => d.data()));
  });
  // Không return unsubscribe!
}, []);

// ĐÚNG: Luôn cleanup listener
useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, 'messages'), (snapshot) => {
    setMessages(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  });

  return () => unsubscribe(); // Hủy listener khi unmount
}, []);
```

Quy tắc: **Mọi `onSnapshot` trong `useEffect` đều PHẢI có `return () => unsubscribe()`** — không có ngoại lệ.

### Câu 3: Cách upload file với progress tracking?
**Đáp án:**

Sử dụng `uploadBytesResumable` thay vì `uploadBytes` để theo dõi tiến trình upload. Hàm này trả về `UploadTask` với event `state_changed` báo cáo tiến trình:

```tsx
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

function useFileUpload() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File, path: string): Promise<string> => {
    setUploading(true);
    setError(null);

    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Callback 1: Tiến trình — gọi liên tục trong quá trình upload
          const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(Math.round(pct));
        },
        (err) => {
          // Callback 2: Lỗi
          setError(err.message);
          setUploading(false);
          reject(err);
        },
        async () => {
          // Callback 3: Hoàn thành
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setUploading(false);
          setProgress(0);
          resolve(url);
        }
      );
    });
  };

  return { upload, progress, uploading, error };
}

// Sử dụng trong component
function UploadForm() {
  const { upload, progress, uploading, error } = useFileUpload();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await upload(file, 'images');
    console.log('Download URL:', url);
  };

  return (
    <div>
      <input type="file" onChange={handleFile} disabled={uploading} />
      {uploading && <progress value={progress} max={100} />}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

Lưu ý: `uploadBytesResumable` còn hỗ trợ `pause()`, `resume()`, và `cancel()` trên `UploadTask`, cho phép user tạm dừng hoặc hủy upload.

### Câu 4: Firestore offline support hoạt động ra sao?
**Đáp án:**

Firestore có cơ chế **offline persistence** tích hợp sẵn, cho phép app hoạt động khi mất mạng:

**Cách hoạt động:**
- Firestore tự động cache data đã đọc vào **IndexedDB** (trên web) hoặc SQLite (trên mobile).
- Khi mất mạng, `getDocs` và `onSnapshot` trả về data từ cache local.
- Khi user ghi data offline, Firestore **queue** các thao tác write và tự động sync lên server khi có mạng trở lại.
- `onSnapshot` vẫn fire callback với data từ cache, có metadata `fromCache: true` để phân biệt.

```tsx
import { enableIndexedDbPersistence } from 'firebase/firestore';

// Bật persistence — gọi MỘT LẦN khi app khởi tạo, trước mọi Firestore operation
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Nhiều tab đang mở — chỉ 1 tab được dùng persistence
    console.warn('Persistence failed: multiple tabs open');
  } else if (err.code === 'unimplemented') {
    // Trình duyệt không hỗ trợ IndexedDB
    console.warn('Persistence not supported');
  }
});

// Kiểm tra data đến từ cache hay server
onSnapshot(collection(db, 'posts'), (snapshot) => {
  const source = snapshot.metadata.fromCache ? 'cache' : 'server';
  console.log(`Data from: ${source}`);

  const posts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  setPosts(posts);
});
```

Lưu ý quan trọng:
- Trên web, chỉ **một tab** có thể bật persistence cùng lúc.
- Writes offline sẽ sync theo thứ tự khi có mạng, nhưng `serverTimestamp()` sẽ là `null` trong cache cho đến khi sync xong.
- Dùng `enableMultiTabIndexedDbPersistence(db)` nếu cần hỗ trợ nhiều tab (Firestore v9.8+).
