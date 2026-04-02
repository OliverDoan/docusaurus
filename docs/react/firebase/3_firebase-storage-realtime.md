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
