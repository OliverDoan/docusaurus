import React from 'react';
import { useAuth } from '@site/src/contexts/AuthContext';

export default function LogoutButton(): React.ReactElement {
  const { logout } = useAuth();

  return (
    <button
      className="navbar__item logout-button"
      onClick={logout}
      type="button"
      title="Đăng xuất"
    >
      Đăng xuất
    </button>
  );
}
