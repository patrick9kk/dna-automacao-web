import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import PageHeader from '../Layout/PageHeader';
import { T } from '../../theme';
import { KpiCard, SectionCard, SectionHead, PeriodBtn, Badge, SearchInput } from '../shared';

const HISTORICO = [
  { data: '06/05', consumo: 48000 },{ data: '07/05', consumo: 52000 },
  { data: '08/05', consumo: 41000 },{ data: '09/05', consumo: 55000 },
  { data: '10/05', consumo: 38000 },{ data: '11/05', consumo: 60000 },
  { data: '12/05', consumo: 47000 },{ data: '13/05', consumo: 14601 },
  { data: '14/05', consumo: 52000 },{ data: '15/05', consumo: 44000 },
  { data: '16/05', consumo: 39000 },{ data: '17/05', consumo: 51000 },
  { data: '18/05', consumo: 43000 },{ data: '19/05', consumo: 48000 },
];

const MEDIDORES = [
  { nome: 'Medidor Água Geral', id: 'WATER-A012-SESC-SEDE', area: 'DNA - SESC Sede', pico: '14,601 m³', media: '18,948 m³', situacao: 'Regular', status: true },
];

const CT = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px', boxShadow: T.shadowMd }}>
      <div style={{ fontSize: 11, color: T.txtMuted, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: '#3B82F6' }}>{payload[0].value.toLocaleString('pt-BR')} L</div>
    </div>
  );
};

const Agua: React.FC = () => {
  const [periodo, setPeriodo] = useState('dia');
  const [search, setSearch] = useState('');
  const max = Math.max(...HISTORICO.map(d => d.consumo));

  return (
    <div style={{ background: T.bgBase, minHeight: '100vh' }}>
      <PageHeader title="Água" icon="water_drop" />
      <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
          <KpiCard label="Consumo Total" value="587,380 m³" icon="water_drop" gradient={`linear-gradient(135deg, ${T.primary}, #0A6E9C)`} />
          <KpiCard label="Maior Consumo" value="587,380 m³" sub="Medidor Água Geral" icon="trending_up" gradient="linear-gradient(135deg, #3B82F6, #60A5FA)" />
          <KpiCard label="Menor Consumo" value="587,380 m³" sub="Medidor Água Geral" icon="trending_down" gradient={`linear-gradient(135deg, ${T.accent}, #0EA5C8)`} />
          <KpiCard label="Pico de Consumo" value="14,601 m³" sub="13/05/2026 · 09:57:05" icon="arrow_upward" gradient="linear-gradient(135deg, #EF4444, #F87171)" />
        </div>

        <SectionCard>
          <SectionHead icon="water_drop" title="Consumo por Local"
            right={<SearchInput value={search} onChange={setSearch} placeholder="Pesquisar medidor…" />} />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
              <thead>
                <tr>
                  {['Medidor','ID','Área','Pico de Consumo','Média de Consumo','Situação','Status'].map(h => (
                    <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.txtMuted, textTransform: 'uppercase', letterSpacing: .6, background: '#F8FAFC', borderBottom: `1px solid ${T.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MEDIDORES.filter(m => m.nome.toLowerCase().includes(search.toLowerCase())).map((row, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}>
                    <td style={{ padding: '13px 20px', fontSize: 13, fontWeight: 600, color: T.txtPrimary }}>{row.nome}</td>
                    <td style={{ padding: '13px 20px', fontSize: 11, fontFamily: 'monospace', color: T.txtMuted }}>{row.id}</td>
                    <td style={{ padding: '13px 20px', fontSize: 13, color: T.txtSecondary }}>{row.area}</td>
                    <td style={{ padding: '13px 20px', fontSize: 13, fontWeight: 700, color: '#EF4444' }}>{row.pico}</td>
                    <td style={{ padding: '13px 20px', fontSize: 13, color: T.txtSecondary }}>{row.media}</td>
                    <td style={{ padding: '13px 20px' }}><Badge label={row.situacao} ok /></td>
                    <td style={{ padding: '13px 20px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: row.status ? T.success : T.danger }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: row.status ? T.success : T.danger, boxShadow: row.status ? `0 0 0 3px ${T.successLt}` : undefined }} />
                        {row.status ? 'Online' : 'Offline'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard>
          <SectionHead icon="bar_chart" title="Histórico de Água"
            right={<div style={{ display: 'flex', gap: 6 }}>{['hora','dia','mês'].map(p => <PeriodBtn key={p} active={periodo===p} label={`Por ${p}`} onClick={() => setPeriodo(p)} />)}</div>} />
          <div style={{ padding: '16px 22px 12px' }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              {[['Área','Geral'],['Sensor','Medidor Água Geral']].map(([lbl, opt]) => (
                <div key={lbl} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: T.txtMuted }}>{lbl}:</span>
                  <select style={{ padding: '6px 12px', borderRadius: T.rPill, border: `1.5px solid ${T.border}`, fontSize: 12, color: T.txtPrimary, background: '#F8FAFC', outline: 'none' }}>
                    <option>{opt}</option>
                  </select>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={HISTORICO} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="4 4" stroke={T.border} vertical={false} />
                <XAxis dataKey="data" tick={{ fontSize: 11, fill: T.txtMuted }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: T.txtMuted }} axisLine={false} tickLine={false} />
                <Tooltip content={<CT />} cursor={{ fill: `${T.accent}10` }} />
                <Bar dataKey="consumo" radius={[6,6,0,0]}>
                  {HISTORICO.map((entry, i) => (
                    <Cell key={i} fill={entry.consumo === max ? T.primary : T.accent} fillOpacity={entry.consumo === max ? 1 : 0.7} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

      </div>
    </div>
  );
};
export default Agua;
