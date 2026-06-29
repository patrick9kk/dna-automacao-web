import React from 'react';
import { T } from '../../theme';
import Icon from './Icon';

interface Props {
  title: string;
  subtitle?: string;
  period?: string;
  icon?: string;
  children?: React.ReactNode;
}

const PageHeader: React.FC<Props> = ({
  title,
  subtitle = 'DNA — SESC Sede',
  period = '01 mai. 26 ↔ 31 mai. 26',
  icon,
  children,
}) => (
  <div style={{
    background: T.bgCard,
    borderBottom: `1px solid ${T.border}`,
    padding: '16px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    position: 'sticky',
    top: 0,
    zIndex: 50,
    boxShadow: '0 1px 0 rgba(0,0,0,.04)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      {icon && (
        <div style={{
          width: 42, height: 42, borderRadius: 11,
          background: `linear-gradient(135deg, ${T.primary}, #0A6E9C)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon name={icon} size={22} color="#fff" />
        </div>
      )}
      <div>
        <h1 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: T.txtPrimary, letterSpacing: -.3 }}>
          {title}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
          <span style={{ fontSize: 12, color: T.txtMuted }}>{subtitle}</span>
          <span style={{ color: T.border }}>·</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 11, fontWeight: 600,
            background: T.accentLt, color: T.accent,
            borderRadius: T.rPill, padding: '2px 10px',
          }}>
            <Icon name="calendar_today" size={11} />
            {period}
          </span>
        </div>
      </div>
    </div>
    {children && <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{children}</div>}
  </div>
);

export default PageHeader;
