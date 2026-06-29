import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageHeader from '../Layout/PageHeader';
import { T } from '../../theme';
import { KpiCard, SectionCard, SectionHead, PeriodBtn, Badge } from '../shared';

const HISTORICO = [
  { data: '06/05', nivel: 95 },{ data: '08/05', nivel: 92 },
  { data: '10/05', nivel: 88 },{ data: '12/05', nivel: 94 },
  { data: '14/05', nivel: 98 },{ data: '16/05', nivel: 50 },
  { data: '18/05', nivel: 72 },{ data: '20/05', nivel: 85 },
  { data: '22/05', nivel: 91 },{ data: '24/05', nivel: 98 },
];

const RESERVATORIOS = [
  { nome: 'Nivel combustivel Gerador', id: 'SM3EA-SESC-SEDE-1', area: 'Gerador SESC-SEDE', capMax: '300 l', nivel: 98.05, nivelTxt: '98,05%', volume: '294,15 l', menorNivel: '50,00%', situacao: 'Regular', status: true },
];

const GaugeBar: React.FC<{ percent: number; label: string }> = ({ percent, label }) => {
  const color = percent > 70 ? T.success : percent > 35 ? T.warning : T.danger;
  const bgLight = percent > 70 ? T.successLt : percent > 35 ? T.warningLt : T.dangerLt;
  return (
    <div style={{ flex: 1, minWidth: 130 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: T.txtMuted, fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 15, fontWeight: 800, color }}>{percent.toFixed(1)}%</span>
      </div>
      <div style={{ height: 10, borderRadius: 99, background: bgLight, overflow: 'hidden' }}>
        <div style={{ width: `${percent}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 1s ease' }} />
      </div>
    </div>
  );
};

const CT = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px', boxShadow: T.shadowMd }}>
      <div style={{ fontSize: 11, color: T.txtMuted, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: T.primary }}>{payload[0].value}%</div>
    </div>
  );
};

const Nivel: React.FC = () => {
  const [periodo, setPeriodo] = useState('dia');

  return (
    <div style={{ background: T.bgBase, minHeight: '100vh' }}>
      <PageHeader title="Nível" icon="local_gas_station" />
      <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
          <KpiCard label="Maior Nível" value="98,05%" sub="Nivel combustivel Gerador" icon="vertical_align_top" gradient={`linear-gradient(135deg, ${T.primary}, #0A6E9C)`} />
          <KpiCard label="Menor Nível" value="50,00%" sub="16/05/2026" icon="vertical_align_bottom" gradient="linear-gradient(135deg, #F59E0B, #FBBF24)" />
          <KpiCard label="Volume Atual" value="294,15 l" sub="Nivel combustivel Gerador" icon="local_gas_station" gradient={`linear-gradient(135deg, ${T.accent}, #0EA5C8)`} />
          <KpiCard label="Capacidade Máx." value="300 l" sub="Nivel combustivel Gerador" icon="inventory_2" gradient="linear-gradient(135deg, #6B7280, #9CA3AF)" />
        </div>

        {/* Gauge visual */}
        <SectionCard>
          <SectionHead icon="local_gas_station" title="Nivel combustivel Gerador" />
          <div style={{ padding: '22px 24px', display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <GaugeBar percent={98.05} label="Nível atual" />
              <GaugeBar percent={50.0} label="Menor registrado" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, minWidth: 220 }}>
              {[
                { l: 'Capacidade', v: '300 l', c: T.txtPrimary },
                { l: 'Volume Atual', v: '294,15 l', c: T.txtPrimary },
                { l: 'ID', v: 'SM3EA-SESC-SEDE-1', c: T.txtMuted },
                { l: 'Área', v: 'Gerador SESC-SEDE', c: T.txtSecondary },
                { l: 'Status', v: 'Online', c: T.success },
                { l: 'Situação', v: 'Regular', c: T.success },
              ].map(({ l, v, c }) => (
                <div key={l} style={{ background: '#F8FAFC', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, color: T.txtMuted, textTransform: 'uppercase', letterSpacing: .5, fontWeight: 700 }}>{l}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: c, marginTop: 4 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* Tabela */}
        <SectionCard>
          <SectionHead icon="table_chart" title="Capacidade por Reservatório" />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr>
                  {['Medidor','ID','Área','Cap. Máx.','Nível','Volume Atual','Situação','Status'].map(h => (
                    <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.txtMuted, textTransform: 'uppercase', letterSpacing: .6, background: '#F8FAFC', borderBottom: `1px solid ${T.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RESERVATORIOS.map((row, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}>
                    <td style={{ padding: '13px 20px', fontSize: 13, fontWeight: 600, color: T.txtPrimary }}>{row.nome}</td>
                    <td style={{ padding: '13px 20px', fontSize: 11, fontFamily: 'monospace', color: T.txtMuted }}>{row.id}</td>
                    <td style={{ padding: '13px 20px', fontSize: 13, color: T.txtSecondary }}>{row.area}</td>
                    <td style={{ padding: '13px 20px', fontSize: 13, color: T.txtSecondary }}>{row.capMax}</td>
                    <td style={{ padding: '13px 20px', fontSize: 13, fontWeight: 700, color: T.success }}>{row.nivelTxt}</td>
                    <td style={{ padding: '13px 20px', fontSize: 13, color: T.txtSecondary }}>{row.volume}</td>
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

        {/* Histórico */}
        <SectionCard>
          <SectionHead icon="show_chart" title="Histórico de Nível"
            right={<div style={{ display: 'flex', gap: 6 }}>{['hora','dia','mês'].map(p => <PeriodBtn key={p} active={periodo===p} label={`Por ${p}`} onClick={() => setPeriodo(p)} />)}</div>} />
          <div style={{ padding: '16px 22px 12px' }}>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={HISTORICO} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="4 4" stroke={T.border} />
                <XAxis dataKey="data" tick={{ fontSize: 11, fill: T.txtMuted }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fill: T.txtMuted }} axisLine={false} tickLine={false} />
                <Tooltip content={<CT />} />
                <Line type="monotone" dataKey="nivel" stroke={T.accent} strokeWidth={2.5} dot={{ r: 3, fill: T.accent, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

      </div>
    </div>
  );
};
export default Nivel;
