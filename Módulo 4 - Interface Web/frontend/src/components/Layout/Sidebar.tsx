import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const DNA_DARK = '#054664';
const DNA_TEAL = '#18B8D0';

interface MenuItem {
  label: string;
  path?: string;
  icon: string;
  children?: { label: string; path: string }[];
}

const MENU: MenuItem[] = [
  { label: 'Painel Inicial', path: '/dashboard', icon: '🏠' },
  { label: 'Status de Medidores', path: '/status-medidores', icon: '📊' },
  {
    label: 'Infra Predial', icon: '🏗️',
    children: [
      { label: 'Energia', path: '/energia' },
      { label: 'Água',   path: '/agua'   },
      { label: 'Nível',  path: '/nivel'  },
    ],
  },
  {
    label: 'Manutenção', icon: '🔧',
    children: [
      { label: 'Chamados',    path: '/manutencao/chamados'    },
      { label: 'Preventivas', path: '/manutencao/preventivas' },
      { label: 'SLA',         path: '/manutencao/sla'         },
    ],
  },
  { label: 'Alarmes', path: '/alarmes', icon: '🔔' },
];

interface Props { collapsed: boolean; onToggle: () => void }

const Sidebar: React.FC<Props> = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [openGroup, setOpenGroup] = useState<string | null>('Infra Predial');

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const linkBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: collapsed ? '11px 0' : '11px 16px',
    justifyContent: collapsed ? 'center' : 'flex-start',
    color: 'rgba(255,255,255,.75)', textDecoration: 'none',
    borderRadius: 8, fontSize: 13.5, fontWeight: 500,
    transition: 'background .15s, color .15s', cursor: 'pointer',
    margin: '1px 8px',
  };

  return (
    <aside style={{
      width: collapsed ? 60 : 220, minHeight: '100vh',
      background: '#061f30', display: 'flex', flexDirection: 'column',
      transition: 'width .25s', flexShrink: 0,
      borderRight: `1px solid rgba(255,255,255,.07)`,
    }}>
      {/* Logo + toggle */}
      <div style={{
        padding: collapsed ? '18px 0' : '18px 16px',
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        borderBottom: '1px solid rgba(255,255,255,.07)',
        minHeight: 65,
      }}>
        {!collapsed && (
          <img src="/logo-dna-branco.svg" alt="DNA" style={{ height: 30 }} />
        )}
        <button onClick={onToggle} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(255,255,255,.5)', fontSize: 18, padding: 4,
          lineHeight: 1,
        }}>
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, paddingTop: 8, overflowY: 'auto' }}>
        {MENU.map(item => {
          const hasChildren = !!item.children;
          const isOpen = openGroup === item.label;

          if (!hasChildren) {
            return (
              <NavLink
                key={item.label}
                to={item.path!}
                style={({ isActive }) => ({
                  ...linkBase,
                  background: isActive ? `${DNA_TEAL}22` : 'transparent',
                  color: isActive ? DNA_TEAL : 'rgba(255,255,255,.75)',
                  borderLeft: isActive ? `3px solid ${DNA_TEAL}` : '3px solid transparent',
                })}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          }

          return (
            <div key={item.label}>
              <div
                onClick={() => setOpenGroup(isOpen ? null : item.label)}
                style={{
                  ...linkBase,
                  justifyContent: collapsed ? 'center' : 'space-between',
                  userSelect: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </div>
                {!collapsed && (
                  <span style={{ fontSize: 10, opacity: .5, transition: 'transform .2s', transform: isOpen ? 'rotate(90deg)' : 'none' }}>▶</span>
                )}
              </div>

              {isOpen && !collapsed && (
                <div style={{ paddingLeft: 16 }}>
                  {item.children!.map(child => (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      style={({ isActive }) => ({
                        ...linkBase,
                        margin: '1px 4px',
                        padding: '9px 14px',
                        background: isActive ? `${DNA_TEAL}22` : 'transparent',
                        color: isActive ? DNA_TEAL : 'rgba(255,255,255,.6)',
                        borderLeft: isActive ? `3px solid ${DNA_TEAL}` : '3px solid transparent',
                        fontSize: 13,
                      })}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
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
      <div style={{
        borderTop: '1px solid rgba(255,255,255,.07)',
        padding: collapsed ? '14px 0' : '14px 16px',
      }}>
        {!collapsed && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>
              {user?.name ?? 'Patrick Cordeiro'}
            </div>
            <div style={{ color: 'rgba(255,255,255,.45)', fontSize: 11, marginTop: 2 }}>
              Administrador(a) · Administrativo
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          title="Sair"
          style={{
            width: '100%', padding: '8px 0', background: 'rgba(255,255,255,.06)',
            border: '1px solid rgba(255,255,255,.1)', borderRadius: 7,
            color: 'rgba(255,255,255,.6)', fontSize: 12, cursor: 'pointer',
          }}
        >
          {collapsed ? '↩' : '↩ Sair'}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
