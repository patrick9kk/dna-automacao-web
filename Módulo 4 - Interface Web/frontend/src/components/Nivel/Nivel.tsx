import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import PageHeader from '../Layout/PageHeader';

const DNA_DARK = '#054664';
const DNA_TEAL = '#18B8D0';

const HISTORICO = [
  { data: '06/05', nivel: 95 },
  { data: '08/05', nivel: 92 },
  { data: '10/05', nivel: 88 },
  { data: '12/05', nivel: 94 },
  { data: '14/05', nivel: 98 },
  { data: '16/05', nivel: 50 },
  { data: '18/05', nivel: 72 },
  { data: '20/05', nivel: 85 },
  { data: '22/05', nivel: 91 },
  { data: '24/05', nivel: 98 },
];

const RESERVATORIOS = [
  {
    nome: 'Nivel combustivel Gerador',
    id: 'SM3EA-SESC-SEDE-1',
    area: 'Gerador SESC-SEDE',
    capMax: '300 l',
    nivel: '98,05%',
    volume: '294,15 l',
    menorNivel: '50,00%',
    situacao: 'Regular',
    status: 'Online',
  },
];

const Badge: React.FC<{ label: string; ok?: boolean }> = ({ label, ok = true }) => (
  <span style={{
    background: ok ? '#dcfce7' : '#fee2e2',
    color: ok ? '#166534' : '#991b1b',
    borderRadius: 12, padding: '2px 10px', fontSize: 12, fontWeight: 600,
  }}>{label}</span>
);

const KpiCard: React.FC<{ label: string; value: string; sub?: string; icon?: string; color?: string }> = ({
  label, value, sub, icon = '🛢️', color = DNA_DARK,
}) => (
  <div style={{
    background: '#fff', borderRadius: 10, padding: '18px 20px',
    boxShadow: '0 1px 4px rgba(0,0,0,.08)', borderTop: `3px solid ${color}`,
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: .4, fontWeight: 500 }}>{label}</div>
      <span style={{ fontSize: 20 }}>{icon}</span>
    </div>
    <div style={{ fontSize: 26, fontWeight: 700, color, marginTop: 8 }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{sub}</div>}
  </div>
);

// Gauge visual component
const GaugeBar: React.FC<{ percent: number; label: string }> = ({ percent, label }) => {
  const color = percent > 80 ? '#22c55e' : percent > 40 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ minWidth: 140 }}>
      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>{label}</div>
      <div style={{ background: '#e5e7eb', borderRadius: 99, height: 10, overflow: 'hidden' }}>
        <div style={{
          width: `${percent}%`, height: '100%', background: color,
          borderRadius: 99, transition: 'width 1s ease',
        }} />
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color, marginTop: 4 }}>{percent.toFixed(1)}%</div>
    </div>
  );
};

const Nivel: React.FC = () => {
  const [periodo, setPeriodo] = useState('dia');

  return (
    <div style={{ background: '#f3f4f6', minHeight: '100vh' }}>
      <PageHeader title="Nível" />

      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <KpiCard label="Maior Nível" value="98,05%" sub="Nivel combustivel Gerador" icon="🔝" color={DNA_DARK} />
          <KpiCard label="Menor Nível" value="50,00%" sub="Nivel combustivel Gerador · 16/05/2026" icon="🔽" color="#f59e0b" />
          <KpiCard label="Volume Atual" value="294,15 l" sub="Nivel combustivel Gerador" icon="🛢️" color={DNA_TEAL} />
          <KpiCard label="Capacidade Máxima" value="300 l" sub="Nivel combustivel Gerador" icon="📦" color="#6b7280" />
        </div>

        {/* Gauge visual */}
        <div style={{
          background: '#fff', borderRadius: 10, padding: '20px 24px',
          boxShadow: '0 1px 4px rgba(0,0,0,.08)',
          display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: DNA_DARK, marginBottom: 4 }}>Nivel combustivel Gerador</div>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 12, fontFamily: 'monospace' }}>SM3EA-SESC-SEDE-1 · Gerador SESC-SEDE</div>
            <div style={{ display: 'flex', gap: 24 }}>
              <GaugeBar percent={98.05} label="Nível atual" />
              <GaugeBar percent={50.0} label="Menor registrado" />
            </div>
          </div>
          <div style={{ borderLeft: '1px solid #e5e7eb', paddingLeft: 32 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { l: 'Capacidade', v: '300 l' },
                { l: 'Volume Atual', v: '294,15 l' },
                { l: 'Status', v: '🟢 Online' },
                { l: 'Situação', v: '✅ Regular' },
              ].map(({ l, v }) => (
                <div key={l}>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>{l}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: DNA_DARK, marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabela Capacidade */}
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,.08)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: DNA_DARK }}>🛢️ Capacidade por Reservatório</h3>
            <input placeholder="Pesquisar Medidores" style={{ padding: '6px 12px', borderRadius: 20, border: '1px solid #d1d5db', fontSize: 12, outline: 'none' }} />
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Medidor', 'ID', 'Área', 'Cap. Máxima', 'Nível', 'Volume Atual', 'Situação', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: .3 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RESERVATORIOS.map((row, i) => (
                <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: DNA_DARK }}>{row.nome}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>{row.id}</td>
                  <td style={{ padding: '12px 16px', color: '#374151' }}>{row.area}</td>
                  <td style={{ padding: '12px 16px' }}>{row.capMax}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#22c55e' }}>{row.nivel}</td>
                  <td style={{ padding: '12px 16px' }}>{row.volume}</td>
                  <td style={{ padding: '12px 16px' }}><Badge label={row.situacao} ok /></td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Histórico */}
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,.08)', padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: DNA_DARK }}>📈 Histórico de Nível</h3>
            <div style={{ display: 'flex', gap: 6 }}>
              {['hora', 'dia', 'mês'].map(p => (
                <button key={p} onClick={() => setPeriodo(p)} style={{
                  padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  background: periodo === p ? DNA_DARK : '#f3f4f6',
                  color: periodo === p ? '#fff' : '#6b7280',
                  border: `1px solid ${periodo === p ? DNA_DARK : '#e5e7eb'}`,
                }}>Por {p}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={HISTORICO}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="data" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`${v}%`, 'Nível']} />
              <Legend />
              <Line type="monotone" dataKey="nivel" name="Nível (%)" stroke={DNA_TEAL} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default Nivel;
