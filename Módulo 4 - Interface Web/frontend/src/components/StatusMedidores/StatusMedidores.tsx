import React, { useState, useMemo } from 'react';
import PageHeader from '../Layout/PageHeader';
import { T } from '../../theme';
import { SectionCard, SectionHead, Badge, SearchInput } from '../shared';
import Icon from '../Layout/Icon';

type Tipo = 'Gateway' | 'Liga/Desliga' | 'Agua' | 'Energia' | 'Reservatorio';
type Status = 'Online' | 'Offline';
interface Medidor { nome: string; id: string; tipo: Tipo; area: string; condicao?: string; status: Status; }

const MEDIDORES: Medidor[] = [
  { nome: 'GATEWAY 01 SESC-SEDE',               id: 'GATEWAY-SESC-SEDE-01',  tipo: 'Gateway',      area: 'DNA - SESC Sede',   status: 'Online' },
  { nome: 'GERADOR – MODO DE CONTROLE',          id: 'SM2ED-SESC-SEDE-50',   tipo: 'Liga/Desliga', area: 'Gerador SESC-SEDE', condicao: 'Automatico', status: 'Online' },
  { nome: 'GERADOR – PARADA DE EMERGENCIA',      id: 'SM2ED-SESC-SEDE-52',   tipo: 'Liga/Desliga', area: 'Gerador SESC-SEDE', condicao: 'Normal',     status: 'Online' },
  { nome: 'GERADOR – STATUS',                    id: 'SM2ED-SESC-SEDE-51',   tipo: 'Liga/Desliga', area: 'Gerador SESC-SEDE', condicao: 'Desligado',  status: 'Online' },
  { nome: 'GERADOR – STATUS DISJUNTOR GERADOR',  id: 'SM2ED-SESC-SEDE-54',   tipo: 'Liga/Desliga', area: 'Gerador SESC-SEDE', condicao: 'Desligado',  status: 'Online' },
  { nome: 'GERADOR – STATUS DISJUNTOR REDE',     id: 'SM2ED-SESC-SEDE-53',   tipo: 'Liga/Desliga', area: 'Gerador SESC-SEDE', condicao: 'Ligado',     status: 'Online' },
  { nome: 'Medidor Água Geral',                  id: 'WATER-A012-SESC-SEDE', tipo: 'Agua',         area: 'DNA - SESC Sede',   status: 'Online' },
  { nome: 'Medidor Energia Gerador',             id: 'SM3W-SESC-SEDE-2',     tipo: 'Energia',      area: 'Gerador SESC-SEDE', status: 'Online' },
  { nome: 'Medidor Energia Geral',               id: 'SM3W-SESC-SEDE-1',     tipo: 'Energia',      area: 'DNA - SESC Sede',   status: 'Online' },
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
  { nome: 'QEB-HVAC – BOMBA COND 03',            id: 'SM2ED-SESC-SEDE-34',   tipo: 'Liga/Desliga', area: 'DNA - SESC Sede',   condicao: 'Desligado',  status: 'Online' },
  { nome: 'QEB-HVAC – BOMBA GELADA 01',          id: 'SM2ED-SESC-SEDE-35',   tipo: 'Liga/Desliga', area: 'DNA - SESC Sede',   condicao: 'Desligado',  status: 'Online' },
  { nome: 'QEB-HVAC – BOMBA GELADA 02',          id: 'SM2ED-SESC-SEDE-36',   tipo: 'Liga/Desliga', area: 'DNA - SESC Sede',   condicao: 'Desligado',  status: 'Online' },
  { nome: 'QEB-HVAC – BOMBA GELADA 03',          id: 'SM2ED-SESC-SEDE-37',   tipo: 'Liga/Desliga', area: 'DNA - SESC Sede',   condicao: 'Desligado',  status: 'Online' },
  { nome: 'TORRE DE RESFRIAMENTO 01',            id: 'SM2ED-SESC-SEDE-40',   tipo: 'Liga/Desliga', area: 'DNA - SESC Sede',   condicao: 'Desligado',  status: 'Online' },
  { nome: 'TORRE DE RESFRIAMENTO 02',            id: 'SM2ED-SESC-SEDE-41',   tipo: 'Liga/Desliga', area: 'DNA - SESC Sede',   condicao: 'Desligado',  status: 'Online' },
];

const TYPE_META: Record<Tipo, { icon: string; color: string; bg: string; label: string }> = {
  'Gateway':      { icon: 'router',            color: '#7C3AED', bg: '#EDE9FE', label: 'Gateway'      },
  'Energia':      { icon: 'bolt',              color: T.primary, bg: T.accentLt, label: 'Energia'     },
  'Agua':         { icon: 'water_drop',        color: '#3B82F6', bg: '#DBEAFE', label: 'Água'         },
  'Reservatorio': { icon: 'local_gas_station', color: '#F59E0B', bg: '#FEF3C7', label: 'Reservatório' },
  'Liga/Desliga': { icon: 'toggle_on',         color: '#6B7280', bg: '#F1F5F9', label: 'Liga/Desliga' },
};

const SummaryPill: React.FC<{ tipo: Tipo; count: number }> = ({ tipo, count }) => {
  const m = TYPE_META[tipo];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: m.bg, borderRadius: 12, padding: '10px 16px', minWidth: 130 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={m.icon} size={16} color="#fff" />
      </div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 800, color: m.color, lineHeight: 1 }}>{count}</div>
        <div style={{ fontSize: 11, color: m.color, fontWeight: 600, opacity: .75 }}>{m.label}</div>
      </div>
    </div>
  );
};

const StatusMedidores: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Online' | 'Offline'>('Todos');
  const [tipoFilter, setTipoFilter] = useState<string>('Todos');

  const online  = MEDIDORES.filter(m => m.status === 'Online').length;
  const offline = MEDIDORES.length - online;

  const byTipo = useMemo(() => {
    const map: Partial<Record<Tipo, number>> = {};
    MEDIDORES.forEach(m => { map[m.tipo] = (map[m.tipo] ?? 0) + 1; });
    return map;
  }, []);

  const filtered = useMemo(() => MEDIDORES.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = !q || m.nome.toLowerCase().includes(q) || m.id.toLowerCase().includes(q) || m.area.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'Todos' || m.status === statusFilter;
    const matchTipo   = tipoFilter === 'Todos' || m.tipo === tipoFilter;
    return matchSearch && matchStatus && matchTipo;
  }), [search, statusFilter, tipoFilter]);

  const filterBtn = (label: string, active: boolean, onClick: () => void) => (
    <button onClick={onClick} style={{
      padding: '6px 14px', borderRadius: T.rPill, fontSize: 12, fontWeight: 600,
      border: 'none', cursor: 'pointer', transition: 'all .15s',
      background: active ? T.primary : '#F1F5F9',
      color: active ? '#fff' : T.txtSecondary,
    }}>{label}</button>
  );

  return (
    <div style={{ background: T.bgBase, minHeight: '100vh' }}>
      <PageHeader title="Status de Medidores" icon="sensors" />
      <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Summary row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14 }}>
          {/* Total */}
          <div style={{
            background: `linear-gradient(135deg, ${T.primary}, #0A6E9C)`,
            borderRadius: T.rLg, padding: '20px 22px', color: '#fff',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, opacity: .7, textTransform: 'uppercase', letterSpacing: .7, marginBottom: 8 }}>Total</div>
            <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1 }}>{MEDIDORES.length}</div>
            <div style={{ fontSize: 12, opacity: .7, marginTop: 4 }}>dispositivos</div>
          </div>
          {/* Online */}
          <div style={{ background: T.bgCard, borderRadius: T.rLg, padding: '20px 22px', boxShadow: T.shadow }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.txtMuted, textTransform: 'uppercase', letterSpacing: .7, marginBottom: 8 }}>Online</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: T.success, lineHeight: 1 }}>{online}</div>
            <div style={{ fontSize: 12, color: T.success, marginTop: 4 }}>{((online/MEDIDORES.length)*100).toFixed(0)}% disponíveis</div>
          </div>
          {/* Offline */}
          <div style={{ background: T.bgCard, borderRadius: T.rLg, padding: '20px 22px', boxShadow: T.shadow }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.txtMuted, textTransform: 'uppercase', letterSpacing: .7, marginBottom: 8 }}>Offline</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: offline > 0 ? T.danger : T.txtMuted, lineHeight: 1 }}>{offline}</div>
            <div style={{ fontSize: 12, color: T.txtMuted, marginTop: 4 }}>dispositivos</div>
          </div>
          {/* By type */}
          {(Object.entries(byTipo) as [Tipo, number][]).slice(0, 2).map(([tipo, count]) => (
            <SummaryPill key={tipo} tipo={tipo} count={count} />
          ))}
        </div>

        {/* Type pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: T.txtMuted, fontWeight: 600 }}>Tipo:</span>
          {['Todos', ...Object.keys(TYPE_META)].map(t => filterBtn(t === 'Todos' ? 'Todos os tipos' : TYPE_META[t as Tipo].label, tipoFilter === t, () => setTipoFilter(t)))}
        </div>

        {/* Table */}
        <SectionCard>
          <SectionHead icon="list" title={`Dispositivos (${filtered.length})`}
            right={
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {filterBtn('Todos', statusFilter === 'Todos', () => setStatusFilter('Todos'))}
                {filterBtn('Online', statusFilter === 'Online', () => setStatusFilter('Online'))}
                {filterBtn('Offline', statusFilter === 'Offline', () => setStatusFilter('Offline'))}
                <SearchInput value={search} onChange={setSearch} placeholder="Pesquisar dispositivo…" />
              </div>
            }
          />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr>
                  {['Dispositivo','ID','Tipo','Área','Condição','Status','Última leitura'].map(h => (
                    <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.txtMuted, textTransform: 'uppercase', letterSpacing: .6, background: '#F8FAFC', borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => {
                  const meta = TYPE_META[m.tipo];
                  return (
                    <tr key={i} style={{ borderBottom: `1px solid ${T.border}`, transition: 'background .1s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '12px 20px' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.txtPrimary }}>{m.nome}</div>
                      </td>
                      <td style={{ padding: '12px 20px', fontSize: 11, fontFamily: 'monospace', color: T.txtMuted, whiteSpace: 'nowrap' }}>{m.id}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: meta.bg, color: meta.color, borderRadius: 20, padding: '3px 10px', fontSize: 11.5, fontWeight: 600 }}>
                          <Icon name={meta.icon} size={12} color={meta.color} />
                          {meta.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px', fontSize: 12, color: T.txtSecondary }}>{m.area}</td>
                      <td style={{ padding: '12px 20px', fontSize: 12, color: T.txtSecondary }}>{m.condicao ?? '—'}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: m.status === 'Online' ? T.success : T.danger }}>
                          <span style={{
                            width: 7, height: 7, borderRadius: '50%',
                            background: m.status === 'Online' ? T.success : T.danger,
                            boxShadow: m.status === 'Online' ? `0 0 0 3px ${T.successLt}` : undefined,
                          }} />
                          {m.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px', fontSize: 11.5, color: T.txtMuted, whiteSpace: 'nowrap' }}>
                        <Icon name="schedule" size={12} style={{ marginRight: 4 }} />
                        21/05/2026 21:02
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: T.txtMuted, fontSize: 14 }}>
                <Icon name="search_off" size={32} color={T.txtMuted} />
                <div style={{ marginTop: 10 }}>Nenhum dispositivo encontrado</div>
              </div>
            )}
          </div>
        </SectionCard>

      </div>
    </div>
  );
};
export default StatusMedidores;
