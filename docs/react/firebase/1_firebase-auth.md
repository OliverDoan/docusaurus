---
sidebar_position: 1
title: "1. Firebase Authentication"
---

# Firebase Authentication


---

## Mục lục

- [Setup Firebase](#setup-firebase)
- [Email/Password Authentication](#emailpassword-authentication)
- [Google Sign-In](#google-sign-in)
- [Auth State Observer](#auth-state-observer)
- [Auth Context](#auth-context)
- [Authentication Flow](#authentication-flow)
- [Protected Routes](#protected-routes)
- [Password Reset](#password-reset)
- [Error Handling](#error-handling)
- [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Setup Firebase

### Tạo project

1. Vào [Firebase Console](https://console.firebase.google.com)
2. Tạo project mới
3. Vào Project Settings → Add Web App → Copy config

### Cài đặt

```bash
npm install firebase
```

### Cấu hình

```tsx
// firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

> **Lưu ý:** Lưu config trong `.env`, KHÔNG commit lên git.

## Email/Password Authentication

### Đăng ký

```tsx
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase/config';

async function signUp(email: string, password: string, displayName: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  // Cập nhật tên hiển thị
  await updateProfile(userCredential.user, { displayName });

  return userCredential.user;
}
```

### Đăng nhập

```tsx
import { signInWithEmailAndPassword } from 'firebase/auth';

async function signIn(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}
```

### Đăng xuất

```tsx
import { signOut } from 'firebase/auth';

async function logOut() {
  await signOut(auth);
}
```

## Google Sign-In

```tsx
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const googleProvider = new GoogleAuthProvider();

async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
  // result.user.displayName, result.user.email, result.user.photoURL
}
```

## Auth State Observer

Lắng nghe trạng thái đăng nhập thay đổi (login, logout, refresh):

```tsx
import { onAuthStateChanged, User } from 'firebase/auth';

// Custom hook
function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, isAuthenticated: !!user };
}
```

## Auth Context

```tsx
// contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../firebase/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logOut = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

## Authentication Flow

```tsx
// App.tsx
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

## Protected Routes

```tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}
```

## Password Reset

```tsx
import { sendPasswordResetEmail } from 'firebase/auth';

async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}
```

## Error Handling

```tsx
import { FirebaseError } from 'firebase/app';

async function handleSignIn(email: string, password: string) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/user-not-found':
          return 'Email không tồn tại';
        case 'auth/wrong-password':
          return 'Mật khẩu không đúng';
        case 'auth/too-many-requests':
          return 'Quá nhiều lần thử, vui lòng thử lại sau';
        case 'auth/invalid-email':
          return 'Email không hợp lệ';
        default:
          return 'Đăng nhập thất bại';
      }
    }
    return 'Lỗi không xác định';
  }
}
```

---

## Câu hỏi phỏng vấn

### Câu 1: onAuthStateChanged dùng để làm gì và tại sao cần cleanup?
**Đáp án:**

`onAuthStateChanged` là một **observer (listener)** lắng nghe mọi thay đổi trạng thái authentication của user (đăng nhập, đăng xuất, token refresh). Nó trả về một hàm `unsubscribe` dùng để hủy listener.

Cần cleanup vì khi component unmount mà listener vẫn chạy sẽ gây **memory leak** và lỗi "Can't perform a React state update on an unmounted component":

```tsx
useEffect(() => {
  // Đăng ký listener — Firebase gọi callback mỗi khi auth state thay đổi
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    setUser(user);
    setLoading(false);
  });

  // Cleanup: hủy listener khi component unmount
  return () => unsubscribe();
}, []);
```

Nếu không gọi `unsubscribe()`, listener tiếp tục chạy ngầm, cố gắng gọi `setUser` trên component đã bị unmount, dẫn đến bug và tốn tài nguyên.

### Câu 2: Cách xử lý lỗi Firebase Authentication?
**Đáp án:**

Firebase Authentication throw `FirebaseError` với `error.code` cụ thể cho từng loại lỗi. Cách xử lý đúng là dùng `try/catch` và switch theo `error.code` để hiển thị thông báo thân thiện với user:

```tsx
import { FirebaseError } from 'firebase/app';

async function handleSignIn(email: string, password: string) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/user-not-found':
          return 'Email không tồn tại';
        case 'auth/wrong-password':
          return 'Mật khẩu không đúng';
        case 'auth/too-many-requests':
          return 'Quá nhiều lần thử, vui lòng thử lại sau';
        case 'auth/invalid-email':
          return 'Email không hợp lệ';
        case 'auth/email-already-in-use':
          return 'Email đã được sử dụng';
        case 'auth/weak-password':
          return 'Mật khẩu quá yếu (tối thiểu 6 ký tự)';
        default:
          return 'Đăng nhập thất bại';
      }
    }
    return 'Lỗi không xác định';
  }
}
```

Quan trọng: **Không bao giờ** hiển thị raw error message cho user vì có thể lộ thông tin kỹ thuật nhạy cảm.

### Câu 3: So sánh signInWithPopup vs signInWithRedirect?
**Đáp án:**

| Tiêu chí | `signInWithPopup` | `signInWithRedirect` |
|----------|-------------------|---------------------|
| UX | Mở popup nhỏ, user không rời trang | Chuyển hướng sang trang Google, quay lại sau |
| Mobile | Popup có thể bị chặn bởi trình duyệt | Hoạt động tốt hơn trên mobile |
| Kết quả | Trả về `Promise<UserCredential>` ngay | Cần dùng `getRedirectResult()` khi quay lại |
| Đơn giản | Code đơn giản hơn | Cần xử lý thêm khi app reload |

```tsx
// signInWithPopup — đơn giản, phù hợp desktop
const result = await signInWithPopup(auth, googleProvider);
const user = result.user;

// signInWithRedirect — phù hợp mobile
import { signInWithRedirect, getRedirectResult } from 'firebase/auth';

// Bước 1: Redirect đến Google
await signInWithRedirect(auth, googleProvider);

// Bước 2: Xử lý kết quả khi quay lại (trong useEffect)
useEffect(() => {
  getRedirectResult(auth).then((result) => {
    if (result) {
      const user = result.user;
    }
  });
}, []);
```

Khuyến nghị: Dùng `signInWithPopup` cho desktop web, `signInWithRedirect` cho mobile web để tránh popup bị chặn.

### Câu 4: Tại sao cần AuthContext thay vì gọi Firebase trực tiếp trong component?
**Đáp án:**

Sử dụng AuthContext (React Context) thay vì gọi Firebase trực tiếp mang lại nhiều lợi ích:

1. **Single Source of Truth**: Chỉ có MỘT listener `onAuthStateChanged` thay vì mỗi component tự tạo listener riêng, tránh lãng phí tài nguyên.

2. **Tránh prop drilling**: Mọi component con đều truy cập được `user` mà không cần truyền props qua nhiều tầng.

3. **Tách biệt logic**: Component không cần biết Firebase tồn tại, chỉ cần gọi `useAuth()`. Nếu sau này đổi sang Auth0 hoặc Supabase, chỉ cần sửa AuthProvider.

4. **Đồng bộ state**: Tất cả component đều nhận cùng một `user` state, tránh tình trạng component A thấy đã login nhưng component B thì chưa.

```tsx
// AuthContext tập trung toàn bộ logic auth
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Chỉ MỘT listener cho toàn app
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Component chỉ cần gọi hook — không cần biết Firebase
function ProfilePage() {
  const { user, logOut } = useAuth();
  return <p>Hello {user?.displayName}</p>;
}
```
