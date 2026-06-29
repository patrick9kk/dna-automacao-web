import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { T } from '../../theme';
import Icon from './Icon';

interface MenuItem {
  label: string;
  path?: string;
  icon: string;
  children?: { label: string; path: string }[];
}

const MENU: MenuItem[] = [
  { label: 'Painel Inicial',      path: '/dashboard',        icon: 'home' },
  { label: 'Status de Medidores', path: '/status-medidores', icon: 'sensors' },
  {
    label: 'Infra Predial', icon: 'apartment',
    children: [
      { label: 'Energia', path: '/energia' },
      { label: 'Água',    path: '/agua'    },
      { label: 'Nível',   path: '/nivel'   },
    ],
  },
  {
    label: 'Manutenção', icon: 'build',
    children: [
      { label: 'Chamados',    path: '/manutencao/chamados'    },
      { label: 'Preventivas', path: '/manutencao/preventivas' },
      { label: 'SLA',         path: '/manutencao/sla'         },
    ],
  },
  { label: 'Alarmes', path: '/alarmes', icon: 'notifications' },
];

interface Props { collapsed: boolean; onToggle: () => void }

const Sidebar: React.FC<Props> = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [openGroup, setOpenGroup] = useState<string | null>('Infra Predial');
  const [hoverItem, setHoverItem] = useState<string | null>(null);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <aside style={{
      width: collapsed ? 64 : 230,
      minHeight: '100vh',
      background: T.bgSide,
      display: 'flex',
      flexDirection: 'column',
      transition: 'width .22s cubic-bezier(.4,0,.2,1)',
      flexShrink: 0,
      position: 'relative',
      borderRight: '1px solid rgba(255,255,255,.05)',
    }}>
      {/* Logo area */}
      <div style={{
        padding: collapsed ? '20px 0' : '20px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        borderBottom: '1px solid rgba(255,255,255,.06)',
        minHeight: 68,
      }}>
        {!collapsed && (
          <img src="/logo-dna-branco.svg" alt="DNA" style={{ height: 28, flexShrink: 0 }} />
        )}
        <button
          onClick={onToggle}
          style={{
            width: 28, height: 28, borderRadius: 7,
            background: 'rgba(255,255,255,.07)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: T.transition,
          }}
        >
          <Icon name={collapsed ? 'chevron_right' : 'chevron_left'} size={18} color="rgba(255,255,255,.5)" />
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, paddingTop: 10, paddingBottom: 10, overflowY: 'auto', overflowX: 'hidden' }}>
        {!collapsed && (
          <div style={{ padding: '8px 18px 4px', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.25)', letterSpacing: 1.2, textTransform: 'uppercase' }}>
            Menu
          </div>
        )}

        {MENU.map(item => {
          const hasChildren = !!item.children;
          const isOpen = openGroup === item.label;
          const isHov = hoverItem === item.label;

          const linkStyle = (isActive: boolean): React.CSSProperties => ({
            display: 'flex', alignItems: 'center',
            gap: 10,
            padding: collapsed ? '10px 0' : '10px 14px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            margin: '2px 8px',
            borderRadius: 9,
            textDecoration: 'none',
            fontSize: 13.5,
            fontWeight: isActive ? 600 : 400,
            transition: T.transition,
            cursor: 'pointer',
            background: isActive
              ? `linear-gradient(90deg, ${T.accent}22, ${T.accent}11)`
              : isHov ? 'rgba(255,255,255,.06)' : 'transparent',
            color: isActive ? T.accent : 'rgba(255,255,255,.72)',
            borderLeft: isActive ? `2px solid ${T.accent}` : '2px solid transparent',
            userSelect: 'none' as const,
          });

          if (!hasChildren) {
            return (
              <NavLink
                key={item.label}
                to={item.path!}
                title={collapsed ? item.label : undefined}
                style={({ isActive }) => linkStyle(isActive)}
                onMouseEnter={() => setHoverItem(item.label)}
                onMouseLeave={() => setHoverItem(null)}
              >
                <Icon name={item.icon} size={19} style={{ flexShrink: 0 }} />
                {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>{item.label}</span>}
              </NavLink>
            );
          }

          return (
            <div key={item.label}>
              <div
                onClick={() => setOpenGroup(isOpen ? null : item.label)}
                onMouseEnter={() => setHoverItem(item.label)}
                onMouseLeave={() => setHoverItem(null)}
                style={{
                  ...linkStyle(false),
                  justifyContent: collapsed ? 'center' : 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon name={item.icon} size={19} style={{ flexShrink: 0 }} />
                  {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
                </div>
                {!collapsed && (
                  <Icon
                    name="chevron_right" size={15}
                    color="rgba(255,255,255,.35)"
                    style={{ transition: 'transform .2s', transform: isOpen ? 'rotate(90deg)' : 'none', flexShrink: 0 }}
                  />
                )}
              </div>

              {isOpen && !collapsed && (
                <div style={{ paddingLeft: 10, marginBottom: 2 }}>
                  {item.children!.map(child => (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      style={({ isActive }) => ({
                        ...linkStyle(isActive),
                        margin: '1px 8px 1px 14px',
                        padding: '8px 12px',
                        fontSize: 13,
                        fontWeight: isActive ? 600 : 400,
                      })}
                    >
                      <span style={{
                        width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                        background: 'rgba(255,255,255,.3)',
                      }} />
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', padding: collapsed ? '14px 0' : '14px 12px' }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              background: `linear-gradient(135deg, ${T.accent}60, ${T.primary})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="person" size={18} color="#fff" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name ?? 'Patrick Cordeiro'}
              </div>
              <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 11 }}>Administrador</div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          title="Sair"
          style={{
            width: '100%', padding: '8px 0',
            background: 'rgba(255,255,255,.05)',
            border: '1px solid rgba(255,255,255,.08)',
            borderRadius: 8,
            color: 'rgba(255,255,255,.55)', fontSize: 12, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: T.transition,
          }}
        >
          <Icon name="logout" size={16} color="rgba(255,255,255,.55)" />
          {!collapsed && 'Sair'}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
