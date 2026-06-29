import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageHeader from '../Layout/PageHeader';
import { T } from '../../theme';
import { KpiCard, SectionCard, SectionHead, PeriodBtn, Badge } from '../shared';

const DNA_TEAL = T.accent;

const HISTORICO = [
  { data: '05/05', consumo: 82000 },{ data: '07/05', consumo: 91000 },
  { data: '09/05', consumo: 78000 },{ data: '11/05', consumo: 95000 },
  { data: '13/05', consumo: 88000 },{ data: '14/05', consumo: 124322 },
  { data: '15/05', consumo: 103000 },{ data: '16/05', consumo: 97000 },
  { data: '17/05', consumo: 85000 },{ data: '18/05', consumo: 91000 },
  { data: '19/05', consumo: 76000 },{ data: '20/05', consumo: 88000 },
  { data: '21/05', consumo: 72000 },{ data: '22/05', consumo: 79000 },
  { data: '23/05', consumo: 85010 },
];

const PARAMETROS = [
  { medidor: 'Medidor Energia Geral', corrA: '76,00 A', corrB: '85,00 A', corrC: '95,00 A', situacao: 'Regular' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px', boxShadow: T.shadowMd }}>
      <div style={{ fontSize: 11, color: T.txtMuted, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: T.primary }}>{payload[0].value.toLocaleString('pt-BR')} kWh</div>
    </div>
  );
};

const PainelInicial: React.FC = () => {
  const [periodo, setPeriodo] = useState('dia');

  return (
    <div style={{ background: T.bgBase, minHeight: '100vh' }}>
      <PageHeader title="Painel Inicial" icon="home" />

      <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
          <KpiCard label="Consumo Total" value="85.010 MWh" icon="bolt"
            gradient={`linear-gradient(135deg, ${T.primary}, #0A6E9C)`} />
          <KpiCard label="Maior Consumo" value="85.010 MWh" sub="Medidor Energia Geral" icon="trending_up"
            gradient="linear-gradient(135deg, #F59E0B, #FBBF24)" />
          <KpiCard label="Menor Consumo" value="85.010 MWh" sub="Medidor Energia Geral" icon="trending_down"
            gradient={`linear-gradient(135deg, ${T.accent}, #0EA5C8)`} />
          <KpiCard label="Pico de Consumo" value="124.322 MWh" sub="14/05/2026 · 09:52:41" icon="arrow_upward"
            gradient="linear-gradient(135deg, #EF4444, #F87171)" />
        </div>

        {/* Medidor status pill */}
        <div style={{
          background: T.bgCard, borderRadius: T.rLg, boxShadow: T.shadow,
          padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: 11,
            background: `linear-gradient(135deg, ${T.primary}, #0A6E9C)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="material-icons" style={{ color: '#fff', fontSize: 20 }}>electrical_services</span>
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: T.txtMuted, textTransform: 'uppercase', letterSpacing: .6, fontWeight: 700 }}>Medidores Ativos</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: T.txtPrimary, lineHeight: 1.2 }}>1 medidor</div>
          </div>
          <div style={{ width: 1, height: 36, background: T.border }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.txtPrimary, marginBottom: 4 }}>Medidor Energia Geral</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Badge label="Online" ok />
              <Badge label="85.010 MWh" neutral />
            </div>
          </div>
        </div>

        {/* Parâmetros */}
        <SectionCard>
          <SectionHead icon="electrical_services" title="Parâmetros de Energia — Corrente" />
          <div style={{ padding: '6px 0 0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Medidor', 'Corrente A', 'Corrente B', 'Corrente C', 'Situação'].map(h => (
                    <th key={h} style={{
                      padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700,
                      color: T.txtMuted, textTransform: 'uppercase', letterSpacing: .6,
                      background: '#F8FAFC', borderBottom: `1px solid ${T.border}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PARAMETROS.map((row, i) => (
                  <tr key={i} style={{ transition: 'background .12s' }}>
                    <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: T.txtPrimary }}>{row.medidor}</td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: T.txtSecondary }}>{row.corrA}</td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: T.txtSecondary }}>{row.corrB}</td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: T.txtSecondary }}>{row.corrC}</td>
                    <td style={{ padding: '14px 20px' }}><Badge label={row.situacao} ok /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Histórico */}
        <SectionCard>
          <SectionHead
            icon="show_chart"
            title="Histórico de Energia"
            right={
              <div style={{ display: 'flex', gap: 6 }}>
                {['hora', 'dia', 'mês'].map(p => (
                  <PeriodBtn key={p} active={periodo === p} label={`Por ${p}`} onClick={() => setPeriodo(p)} />
                ))}
              </div>
            }
          />
          <div style={{ padding: '16px 22px 10px' }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: T.txtMuted }}>Sensor:</span>
              <select style={{
                padding: '6px 12px', borderRadius: T.rPill,
                border: `1.5px solid ${T.border}`, fontSize: 12, color: T.txtPrimary,
                background: '#F8FAFC', outline: 'none',
              }}>
                <option>Medidor Energia Geral</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={270}>
              <LineChart data={HISTORICO} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="4 4" stroke={T.border} />
                <XAxis dataKey="data" tick={{ fontSize: 11, fill: T.txtMuted }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: T.txtMuted }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="consumo" stroke={DNA_TEAL} strokeWidth={2.5}
                  dot={false} activeDot={{ r: 5, fill: DNA_TEAL, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

      </div>
    </div>
  );
};

export default PainelInicial;
