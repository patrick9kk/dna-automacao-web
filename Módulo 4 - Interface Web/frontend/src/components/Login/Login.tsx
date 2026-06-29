import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { T } from '../../theme';
import Icon from '../Layout/Icon';

const Login: React.FC = () => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [err,  setErr]  = useState('');
  const [load, setLoad] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setLoad(true);
    try {
      await login(user, pass);
      navigate('/dashboard');
    } catch {
      setErr('Usuário ou senha inválidos');
    } finally {
      setLoad(false);
    }
  };

  const field: React.CSSProperties = {
    width: '100%', padding: '12px 14px', fontSize: 14,
    border: `1.5px solid ${T.border}`, borderRadius: T.r,
    outline: 'none', background: '#F8FAFC', color: T.txtPrimary,
    transition: T.transition, boxSizing: 'border-box',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `linear-gradient(135deg, ${T.primary} 0%, #0A6E9C 50%, ${T.accent} 100%)`,
    }}>
      {/* Card */}
      <div style={{
        width: 400, background: T.bgCard, borderRadius: T.rLg,
        boxShadow: T.shadowLg, overflow: 'hidden',
      }}>
        {/* Header strip */}
        <div style={{
          background: `linear-gradient(135deg, ${T.primary}, #0A6E9C)`,
          padding: '36px 40px 32px', textAlign: 'center',
        }}>
          <img src="/logo-dna-branco.svg" alt="DNA Facilities" style={{ height: 36, marginBottom: 14 }} />
          <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 13 }}>
            Sistema de Automação Industrial
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} style={{ padding: '32px 40px 36px' }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: T.txtSecondary, letterSpacing: .4, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Usuário
            </label>
            <div style={{ position: 'relative' }}>
              <Icon name="person" size={18} color={T.txtMuted}
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                value={user} onChange={e => setUser(e.target.value)}
                placeholder="Seu usuário"
                style={{ ...field, paddingLeft: 38 }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: T.txtSecondary, letterSpacing: .4, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Senha
            </label>
            <div style={{ position: 'relative' }}>
              <Icon name="lock" size={18} color={T.txtMuted}
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password" value={pass} onChange={e => setPass(e.target.value)}
                placeholder="Sua senha"
                style={{ ...field, paddingLeft: 38 }}
              />
            </div>
          </div>

          {err && (
            <div style={{
              background: T.dangerLt, color: T.danger, borderRadius: T.r,
              padding: '10px 14px', fontSize: 13, marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Icon name="error_outline" size={16} color={T.danger} />{err}
            </div>
          )}

          <button type="submit" disabled={load} style={{
            width: '100%', padding: '13px', borderRadius: T.r, border: 'none',
            background: `linear-gradient(135deg, ${T.primary}, #0A6E9C)`,
            color: '#fff', fontSize: 14, fontWeight: 700, cursor: load ? 'not-allowed' : 'pointer',
            opacity: load ? .7 : 1, transition: T.transition,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <Icon name="login" size={18} color="#fff" />
            {load ? 'Entrando…' : 'Entrar'}
          </button>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: T.txtMuted }}>
            Demo: <strong>Patrick</strong> / <strong>1234</strong>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
