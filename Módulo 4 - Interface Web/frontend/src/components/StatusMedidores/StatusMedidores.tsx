import React, { useState } from 'react';
import PageHeader from '../Layout/PageHeader';
import Icon from '../Layout/Icon';

const DNA_DARK = '#054664';
const DNA_TEAL = '#18B8D0';

type Tipo = 'Gateway' | 'Liga/Desliga' | 'Agua' | 'Energia' | 'Reservatorio';
type Status = 'Online' | 'Offline';

interface Medidor {
  nome: string;
  id: string;
  tipo: Tipo;
  area: string;
  condicao?: string;
  status: Status;
}

const MEDIDORES: Medidor[] = [
  { nome: 'GATEWAY 01 SESC-SEDE',               id: 'GATEWAY-SESC-SEDE-01',  tipo: 'Gateway',     area: 'DNA - SESC Sede',    status: 'Online' },
  { nome: 'GERADOR – MODO DE CONTROLE',          id: 'SM2ED-SESC-SEDE-50',   tipo: 'Liga/Desliga', area: 'Gerador SESC-SEDE',  condicao: 'Automatico', status: 'Online' },
  { nome: 'GERADOR – PARADA DE EMERGENCIA',      id: 'SM2ED-SESC-SEDE-52',   tipo: 'Liga/Desliga', area: 'Gerador SESC-SEDE',  condicao: 'Normal',     status: 'Online' },
  { nome: 'GERADOR – STATUS',                    id: 'SM2ED-SESC-SEDE-51',   tipo: 'Liga/Desliga', area: 'Gerador SESC-SEDE',  condicao: 'Desligado',  status: 'Online' },
  { nome: 'GERADOR – STATUS DISJUNTOR GERADOR',  id: 'SM2ED-SESC-SEDE-54',   tipo: 'Liga/Desliga', area: 'Gerador SESC-SEDE',  condicao: 'Desligado',  status: 'Online' },
  { nome: 'GERADOR – STATUS DISJUNTOR REDE',     id: 'SM2ED-SESC-SEDE-53',   tipo: 'Liga/Desliga', area: 'Gerador SESC-SEDE',  condicao: 'Ligado',     status: 'Online' },
  { nome: 'Medidor Água Geral',                  id: 'WATER-A012-SESC-SEDE', tipo: 'Agua',        area: 'DNA - SESC Sede',    status: 'Online' },
  { nome: 'Medidor Energia Gerador',             id: 'SM3W-SESC-SEDE-2',     tipo: 'Energia',     area: 'Gerador SESC-SEDE',  status: 'Online' },
  { nome: 'Medidor Energia Geral',               id: 'SM3W-SESC-SEDE-1',     tipo: 'Energia',     area: 'DNA - SESC Sede',    status: 'Online' },
  { nome: 'Nivel combustivel Gerador',           id: 'SM3EA-SESC-SEDE-1',    tipo: 'Reservatorio', area: 'Gerador SESC-SEDE', condicao: '98,05%',     status: 'Online' },
  { nome: 'QEB-INC-C11 – AUTO/MANUAL BOMBA 01', id: 'SM2ED-SESC-SEDE-4',    tipo: 'Liga/Desliga', area: 'DNA - SESC Sede',   condicao: 'Automatico', status: 'Online' },
  { nome: 'QEB-INC-C11 – AUTO/MANUAL BOMBA 02', id: 'SM2ED-SESC-SEDE-5',    tipo: 'Liga/Desliga', area: 'DNA - SESC Sede',   condicao: 'Manual',     status: 'Online' },
  { nome: 'QEB-INC-C11 – BOMBA 01 FUNCIONANDO', id: 'SM2ED-SESC-SEDE-6',    tipo: 'Liga/Desliga', area: 'DNA - SESC Sede',   condicao: 'Desligado',  status: 'Online' },
  { nome: 'QEB-INC-C11 – BOMBA 02 FUNCIONANDO', id: 'SM2ED-SESC-SEDE-7',    tipo: 'Liga/Desliga', area: 'DNA - SESC Sede',   condicao: 'Desligado',  status: 'Online' },
  { nome: 'QEB-INC-C11 – FALHA BOMBA 01',       id: 'SM2ED-SESC-SEDE-8',    tipo: 'Liga/Desliga', area: 'DNA - SESC Sede',   condicao: 'Normal',     status: 'Online' },
  { nome: 'QEB-INC-C11 – FALHA BOMBA 02',       id: 'SM2ED-SESC-SEDE-9',    tipo: 'Liga/Desliga', area: 'DNA - SESC Sede',   condicao: 'Normal',     status: 'Online' },
  { nome: 'QEB-INC-C12 – AUTO/MANUAL BOMBA 01', id: 'SM2ED-SESC-SEDE-10',   tipo: 'Liga/Desliga', area: 'DNA - SESC Sede',   condicao: 'Automatico', status: 'Online' },
  { nome: 'QEB-INC-C12 – AUTO/MANUAL BOMBA 02', id: 'SM2ED-SESC-SEDE-11',   tipo: 'Liga/Desliga', area: 'DNA - SESC Sede',   condicao: 'Automatico', status: 'Online' },
  { nome: 'QEB-INC-C12 – BOMBA 01 FUNCIONANDO', id: 'SM2ED-SESC-SEDE-12',   tipo: 'Liga/Desliga', area: 'DNA - SESC Sede',   condicao: 'Desligado',  status: 'Online' },
  { nome: 'QEB-INC-C12 – BOMBA 02 FUNCIONANDO', id: 'SM2ED-SESC-SEDE-13',   tipo: 'Liga/Desliga', area: 'DNA - SESC Sede',   condicao: 'Desligado',  status: 'Online' },
  { nome: 'QEB-INC-C12 – FALHA BOMBA 01',       id: 'SM2ED-SESC-SEDE-14',   tipo: 'Liga/Desliga', area: 'DNA - SESC Sede',   condicao: 'Normal',     status: 'Online' },
  { nome: 'QEB-INC-C12 – FALHA BOMBA 02',       id: 'SM2ED-SESC-SEDE-15',   tipo: 'Liga/Desliga', area: 'DNA - SESC Sede',   condicao: 'Normal',     status: 'Online' },
  { nome: 'RESERV. INC. – NÍVEL ALTO',           id: 'SM2ED-SESC-SEDE-20',   tipo: 'Liga/Desliga', area: 'DNA - SESC Sede',   condicao: 'Normal',     status: 'Online' },
  { nome: 'RESERV. INC. – NÍVEL BAIXO',          id: 'SM2ED-SESC-SEDE-21',   tipo: 'Liga/Desliga', area: 'DNA - SESC Sede',   condicao: 'Normal',     status: 'Online' },
  { nome: 'RESERV. INC. – NÍVEL CRÍTICO',        id: 'SM2ED-SESC-SEDE-22',   tipo: 'Liga/Desliga', area: 'DNA - SESC Sede',   condicao: 'Normal',     status: 'Online' },
  { nome: 'RESERV. POTÁVEL – NÍVEL ALTO',        id: 'SM2ED-SESC-SEDE-23',   tipo: 'Liga/Desliga', area: 'DNA - SESC Sede',   condicao: 'Normal',     status: 'Online' },
  { nome: 'RESERV. POTÁVEL – NÍVEL BAIXO',       id: 'SM2ED-SESC-SEDE-24',   tipo: 'Liga/Desliga', area: 'DNA - SESC Sede',   condicao: 'Normal',     status: 'Online' },
  { nome: 'RESERV. POTÁVEL – NÍVEL CRÍTICO',     id: 'SM2ED-SESC-SEDE-25',   tipo: 'Liga/Desliga', area: 'DNA - SESC Sede',   condicao: 'Normal',     status: 'Online' },
  { nome: 'QEB-HVAC – CHILLER 01',               id: 'SM2ED-SESC-SEDE-30',   tipo: 'Liga/Desliga', area: 'DNA - SESC Sede',   condicao: 'Desligado',  status: 'Online' },
  { nome: 'QEB-HVAC – CHILLER 02',               id: 'SM2ED-SESC-SEDE-31',   tipo: 'Liga/Desliga', area: 'DNA - SESC Sede',   condicao: 'Desligado',  status: 'Online' },
  { nome: 'QEB-HVAC – BOMBA COND 01',            id: 'SM2ED-SESC-SEDE-32',   tipo: 'Liga/Desliga', area: 'DNA - SESC Sede',   condicao: 'Desligado',  status: 'Online' },
  { nome: 'QEB-HVAC – BOMBA COND 02',            id: 'SM2ED-SESC-SEDE-33',   tipo: 'Liga/Desliga', area: 'DNA - SESC Sede',   condicao: 'Desligado',  status: 'Online' },
  { nome: 'QEB-HVAC – BOMBA EVAP 01',            id: 'SM2ED-SESC-SEDE-34',   tipo: 'Liga/Desliga', area: 'DNA - SESC Sede',   condicao: 'Desligado',  status: 'Online' },
  { nome: 'QEB-HVAC – BOMBA EVAP 02',            id: 'SM2ED-SESC-SEDE-35',   tipo: 'Liga/Desliga', area: 'DNA - SESC Sede',   condicao: 'Desligado',  status: 'Online' },
  { nome: 'QEB-HVAC – TORRE RESFR 01',           id: 'SM2ED-SESC-SEDE-36',   tipo: 'Liga/Desliga', area: 'DNA - SESC Sede',   condicao: 'Desligado',  status: 'Online' },
  { nome: 'QEB-HVAC – TORRE RESFR 02',           id: 'SM2ED-SESC-SEDE-37',   tipo: 'Liga/Desliga', area: 'DNA - SESC Sede',   condicao: 'Desligado',  status: 'Online' },
  { nome: 'QEB-HVAC – ALARME GERAL',             id: 'SM2ED-SESC-SEDE-38',   tipo: 'Liga/Desliga', area: 'DNA - SESC Sede',   condicao: 'Normal',     status: 'Online' },
  { nome: 'Nível Reserv. Potável',               id: 'SM3EA-SESC-SEDE-2',    tipo: 'Reservatorio', area: 'DNA - SESC Sede',  condicao: '72,30%',     status: 'Online' },
];

const TIPO_COLOR: Record<Tipo, { bg: string; color: string }> = {
  Gateway:     { bg: '#e0f2fe', color: '#0369a1' },
  'Liga/Desliga': { bg: '#f3e8ff', color: '#7c3aed' },
  Agua:        { bg: '#dbeafe', color: '#1d4ed8' },
  Energia:     { bg: '#fef9c3', color: '#a16207' },
  Reservatorio: { bg: '#dcfce7', color: '#15803d' },
};

const StatusMedidores: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [filterTipo, setFilterTipo] = useState<string>('Todos');
  const [lastUpdate] = useState('21:02:29');

  const tipos = ['Todos', ...Array.from(new Set(MEDIDORES.map(m => m.tipo)))];

  const filtered = MEDIDORES.filter(m => {
    const matchSearch = m.nome.toLowerCase().includes(search.toLowerCase()) ||
      m.id.toLowerCase().includes(search.toLowerCase()) ||
      m.area.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'Todos' || m.status === filterStatus;
    const matchTipo = filterTipo === 'Todos' || m.tipo === filterTipo;
    return matchSearch && matchStatus && matchTipo;
  });

  const online = MEDIDORES.filter(m => m.status === 'Online').length;

  return (
    <div style={{ background: '#f3f4f6', minHeight: '100vh' }}>
      <PageHeader title="Status de Medidores">
        <span style={{ fontSize: 12, color: '#6b7280' }}>
          <Icon name="schedule" size={14} color="#6b7280" style={{ marginRight: 4 }} /> Última atualização: <strong>{lastUpdate}</strong>
        </span>
      </PageHeader>

      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          <div style={{
            background: '#fff', borderRadius: 10, padding: '18px 20px',
            boxShadow: '0 1px 4px rgba(0,0,0,.08)', borderTop: `3px solid ${DNA_DARK}`,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: DNA_DARK }}>{MEDIDORES.length}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Total de Medidores</div>
          </div>
          <div style={{
            background: '#fff', borderRadius: 10, padding: '18px 20px',
            boxShadow: '0 1px 4px rgba(0,0,0,.08)', borderTop: '3px solid #22c55e',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#22c55e' }}>{online}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Medidores Online</div>
            <div style={{ fontSize: 11, color: '#22c55e', marginTop: 2 }}>
              {Math.round((online / MEDIDORES.length) * 100)}% do Total
            </div>
          </div>
          <div style={{
            background: '#fff', borderRadius: 10, padding: '18px 20px',
            boxShadow: '0 1px 4px rgba(0,0,0,.08)', borderTop: `3px solid ${DNA_TEAL}`,
          }}>
            <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500, marginBottom: 8 }}>Por Tipo</div>
            {Object.entries(
              MEDIDORES.reduce((acc, m) => ({ ...acc, [m.tipo]: (acc[m.tipo] || 0) + 1 }), {} as Record<string, number>)
            ).map(([tipo, count]) => (
              <div key={tipo} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                <span style={{ color: '#374151' }}>{tipo}</span>
                <span style={{ fontWeight: 700, color: DNA_DARK }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filters + Table */}
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,.08)', overflow: 'hidden' }}>
          {/* Toolbar */}
          <div style={{
            padding: '14px 20px', borderBottom: '1px solid #f3f4f6',
            display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
          }}>
            <input
              placeholder="Pesquisar medidor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: '7px 14px', borderRadius: 20, border: '1px solid #d1d5db', fontSize: 13, outline: 'none', minWidth: 220 }}
            />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, color: DNA_DARK }}>
              <option>Todos</option>
              <option>Online</option>
              <option>Offline</option>
            </select>
            <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)}
              style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, color: DNA_DARK }}>
              {tipos.map(t => <option key={t}>{t}</option>)}
            </select>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: '#6b7280' }}>
              {filtered.length} de {MEDIDORES.length} medidores
            </span>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Nome', 'ID', 'Tipo', 'Área', 'Condição', 'Status'].map(h => (
                    <th key={h} style={{
                      padding: '10px 16px', textAlign: 'left',
                      color: '#6b7280', fontWeight: 600, fontSize: 12,
                      textTransform: 'uppercase', letterSpacing: .3,
                      whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => {
                  const tc = TIPO_COLOR[m.tipo];
                  return (
                    <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}>
                      <td style={{ padding: '11px 16px', fontWeight: 600, color: DNA_DARK, whiteSpace: 'nowrap' }}>{m.nome}</td>
                      <td style={{ padding: '11px 16px', fontFamily: 'monospace', fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap' }}>{m.id}</td>
                      <td style={{ padding: '11px 16px' }}>
                        <span style={{
                          background: tc.bg, color: tc.color,
                          borderRadius: 12, padding: '2px 10px', fontSize: 11, fontWeight: 600,
                        }}>{m.tipo}</span>
                      </td>
                      <td style={{ padding: '11px 16px', color: '#374151', whiteSpace: 'nowrap' }}>{m.area}</td>
                      <td style={{ padding: '11px 16px', color: '#374151' }}>{m.condicao ?? '—'}</td>
                      <td style={{ padding: '11px 16px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                          <span style={{
                            width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                            background: m.status === 'Online' ? '#22c55e' : '#ef4444',
                            boxShadow: m.status === 'Online' ? '0 0 0 3px #dcfce7' : '0 0 0 3px #fee2e2',
                            display: 'inline-block',
                          }} />
                          <span style={{ fontWeight: 600, color: m.status === 'Online' ? '#166534' : '#991b1b', fontSize: 12 }}>
                            {m.status}
                          </span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StatusMedidores;
