import React, { useState, useCallback } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

interface LoginGateProps {
  onSuccess: () => void;
}

export default function LoginGate({ onSuccess }: LoginGateProps): React.ReactElement {
  const { siteConfig } = useDocusaurusContext();
  const sitePasswordHash = siteConfig.customFields?.sitePasswordHash as string;

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      try {
        const inputHash = await hashPassword(password);

        if (inputHash === sitePasswordHash) {
          localStorage.setItem('site-auth-token', inputHash);
          onSuccess();
        } else {
          setError('Mật khẩu không đúng. Vui lòng thử lại.');
        }
      } catch {
        setError('Đã xảy ra lỗi. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    },
    [password, sitePasswordHash, onSuccess],
  );

  return (
    <div className="login-gate">
      <div className="login-gate__card">
        <div className="login-gate__header">
          <h1 className="login-gate__title">🔒</h1>
          <p className="login-gate__subtitle">
            Nhập mật khẩu để truy cập tài liệu
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-gate__form">
          <div className="login-gate__field">
            <input
              type="password"
              className="login-gate__input"
              placeholder="Nhập mật khẩu..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              disabled={loading}
            />
          </div>

          {error && (
            <div className="login-gate__error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="button button--primary button--lg login-gate__button"
            disabled={loading || !password}
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
