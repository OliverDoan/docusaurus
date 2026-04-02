---
sidebar_position: 1
title: "Firebase Authentication"
---

# Firebase Authentication

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
