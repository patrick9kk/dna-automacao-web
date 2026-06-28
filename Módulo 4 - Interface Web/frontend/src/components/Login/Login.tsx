import React, { useState } from 'react';
import { useNavigate }     from 'react-router-dom';
import { useAuth }         from '../../contexts/AuthContext';

// ── Cores oficiais DNA Engenharia ────────────────────────────────────────────
const DNA_DARK  = '#054664';
const DNA_TEAL  = '#18B8D0';

const Login: React.FC = () => {
  const { login, loginWithSSO } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try { await login(username, password); navigate('/dashboard'); }
    catch { setError('Usuário ou senha inválidos.'); }
    finally { setLoading(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px',
    border: '1px solid #d1d5db', borderRadius: 7,
    fontSize: 14, boxSizing: 'border-box', outline: 'none',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `linear-gradient(145deg, ${DNA_DARK} 0%, #073a55 55%, ${DNA_TEAL} 100%)`,
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: '44px 40px',
        width: 380, boxShadow: '0 12px 48px rgba(5,70,100,.35)',
      }}>

        {/* Logo DNA */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img
            src="/logo-dna.svg"
            alt="DNA Engenharia"
            style={{ width: 220, marginBottom: 12 }}
          />
          <div style={{
            fontSize: 12, color: '#6b7280', letterSpacing: 2,
            textTransform: 'uppercase', fontWeight: 500,
          }}>
            Automação Industrial
          </div>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2', color: '#991b1b', borderRadius: 8,
            padding: '10px 14px', fontSize: 13, marginBottom: 16,
            border: '1px solid #fca5a5',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: '#374151', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>
              Usuário
            </label>
            <input
              style={{ ...inputStyle, marginTop: 6, borderColor: '#d1d5db' }}
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="seu.usuario"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#374151', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>
              Senha
            </label>
            <input
              type="password"
              style={{ ...inputStyle, marginTop: 6, borderColor: '#d1d5db' }}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4, padding: '12px 0',
              background: loading ? DNA_TEAL : DNA_DARK,
              color: '#fff', border: 'none', borderRadius: 9,
              fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background .2s', letterSpacing: .3,
            }}
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          <span style={{ fontSize: 12, color: '#9ca3af' }}>ou</span>
          <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
        </div>

        <button
          onClick={loginWithSSO}
          style={{
            width: '100%', padding: '11px 0',
            background: '#f8fafc', border: `1px solid ${DNA_TEAL}`,
            borderRadius: 9, fontSize: 13, cursor: 'pointer',
            color: DNA_DARK, fontWeight: 600, transition: '.2s',
          }}
        >
          🔐 Entrar com SSO (Azure AD / Okta)
        </button>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#d1d5db', marginTop: 24 }}>
          DNA Facilities © 2025 — Uso Interno
        </p>
      </div>
    </div>
  );
};

export default Login;
