import React from 'react';
import { T } from '../../theme';
import Icon from '../Layout/Icon';

export const Badge: React.FC<{ label: string; ok?: boolean; neutral?: boolean }> = ({ label, ok = true, neutral }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    background: neutral ? '#F1F5F9' : ok ? T.successLt : T.dangerLt,
    color:      neutral ? T.txtSecondary : ok ? T.success : T.danger,
    borderRadius: T.rPill, padding: '3px 10px', fontSize: 11.5, fontWeight: 600,
  }}>{label}</span>
);

export const StatusDot: React.FC<{ online: boolean }> = ({ online }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
    <span style={{
      width: 7, height: 7, borderRadius: '50%',
      background: online ? T.success : T.danger,
      boxShadow: online ? `0 0 0 3px ${T.successLt}` : `0 0 0 3px ${T.dangerLt}`,
    }} />
    {online ? 'Online' : 'Offline'}
  </span>
);

export const KpiCard: React.FC<{
  label: string; value: string; sub?: string; icon: string; color?: string; gradient?: string;
}> = ({ label, value, sub, icon, color, gradient }) => {
  const bg = gradient ?? `linear-gradient(135deg, ${color ?? T.primary}, ${color ? color + 'CC' : '#0A6E9C'})`;
  return (
    <div style={{
      background: T.bgCard, borderRadius: T.rLg,
      boxShadow: T.shadow, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '20px 22px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: T.txtMuted, textTransform: 'uppercase', letterSpacing: .7 }}>
            {label}
          </span>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Icon name={icon} size={18} color="#fff" />
          </div>
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: T.txtPrimary, lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: T.txtMuted, marginTop: 6 }}>{sub}</div>}
      </div>
      <div style={{ height: 3, background: bg }} />
    </div>
  );
};

export const SectionCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: T.bgCard, borderRadius: T.rLg, boxShadow: T.shadow, overflow: 'hidden', ...style }}>
    {children}
  </div>
);

export const SectionHead: React.FC<{ icon: string; title: string; right?: React.ReactNode }> = ({ icon, title, right }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 22px', borderBottom: `1px solid ${T.border}`,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <Icon name={icon} size={18} color={T.accent} />
      <span style={{ fontSize: 14, fontWeight: 700, color: T.txtPrimary }}>{title}</span>
    </div>
    {right}
  </div>
);

export const PeriodBtn: React.FC<{ active: boolean; label: string; onClick: () => void }> = ({ active, label, onClick }) => (
  <button onClick={onClick} style={{
    padding: '5px 14px', borderRadius: T.rPill, fontSize: 12, fontWeight: 600, cursor: 'pointer',
    border: 'none',
    background: active ? T.primary : '#F1F5F9',
    color: active ? '#fff' : T.txtSecondary,
    transition: 'all .15s',
  }}>{label}</button>
);

export const SearchInput: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string }> = ({ value, onChange, placeholder }) => (
  <div style={{ position: 'relative' }}>
    <Icon name="search" size={15} color={T.txtMuted}
      style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
    <input
      value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder ?? 'Pesquisar…'}
      style={{
        padding: '7px 12px 7px 30px', borderRadius: T.rPill,
        border: `1.5px solid ${T.border}`, fontSize: 12,
        outline: 'none', background: '#F8FAFC', color: T.txtPrimary,
        width: 180,
      }}
    />
  </div>
);

export const Th: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <th style={{
    padding: '10px 20px', textAlign: 'left',
    fontSize: 11, fontWeight: 700, color: T.txtMuted,
    textTransform: 'uppercase', letterSpacing: .6,
    background: '#F8FAFC', borderBottom: `1px solid ${T.border}`,
  }}>{children}</th>
);

export const Td: React.FC<{ children: React.ReactNode; bold?: boolean }> = ({ children, bold }) => (
  <td style={{
    padding: '12px 20px', fontSize: 13,
    color: bold ? T.txtPrimary : T.txtSecondary,
    fontWeight: bold ? 600 : 400,
    borderBottom: `1px solid ${T.border}`,
  }}>{children}</td>
);
