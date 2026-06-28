import React from 'react';

const DNA_DARK = '#054664';
const DNA_TEAL = '#18B8D0';

interface Props {
  title: string;
  subtitle?: string;
  period?: string;
  children?: React.ReactNode;
}

const PageHeader: React.FC<Props> = ({ title, subtitle = 'DNA - SESC Sede', period = '01 mai. 26 ↔ 31 mai. 26', children }) => (
  <div style={{
    background: '#fff', borderBottom: '1px solid #e5e7eb',
    padding: '14px 28px', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
    position: 'sticky', top: 0, zIndex: 50,
  }}>
    <div>
      <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: DNA_DARK }}>{title}</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 3 }}>
        <span style={{ fontSize: 12, color: '#6b7280' }}>{subtitle}</span>
        <span style={{
          fontSize: 11, background: `${DNA_TEAL}15`, color: DNA_TEAL,
          borderRadius: 20, padding: '2px 10px', fontWeight: 500,
        }}>
          📅 {period}
        </span>
      </div>
    </div>
    {children && <div style={{ display: 'flex', gap: 8 }}>{children}</div>}
  </div>
);

export default PageHeader;
