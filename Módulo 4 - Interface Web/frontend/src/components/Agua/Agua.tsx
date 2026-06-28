import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import PageHeader from '../Layout/PageHeader';

const DNA_DARK = '#054664';
const DNA_TEAL = '#18B8D0';

const HISTORICO = [
  { data: '06/05', consumo: 48000 },
  { data: '07/05', consumo: 52000 },
  { data: '08/05', consumo: 41000 },
  { data: '09/05', consumo: 55000 },
  { data: '10/05', consumo: 38000 },
  { data: '11/05', consumo: 60000 },
  { data: '12/05', consumo: 47000 },
  { data: '13/05', consumo: 14601 },
  { data: '14/05', consumo: 52000 },
  { data: '15/05', consumo: 44000 },
  { data: '16/05', consumo: 39000 },
  { data: '17/05', consumo: 51000 },
  { data: '18/05', consumo: 43000 },
  { data: '19/05', consumo: 48000 },
];

const MEDIDORES = [
  { nome: 'Medidor Água Geral', id: 'WATER-A012-SESC-SEDE', area: 'DNA - SESC Sede', pico: '14,601 m³', media: '18,948 m³', situacao: 'Regular', status: 'Online' },
];

const Badge: React.FC<{ label: string; ok?: boolean }> = ({ label, ok = true }) => (
  <span style={{
    background: ok ? '#dcfce7' : '#fee2e2',
    color: ok ? '#166534' : '#991b1b',
    borderRadius: 12, padding: '2px 10px', fontSize: 12, fontWeight: 600,
  }}>{label}</span>
);

const KpiCard: React.FC<{ label: string; value: string; sub?: string; icon?: string; color?: string }> = ({
  label, value, sub, icon = '💧', color = DNA_DARK,
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

const Agua: React.FC = () => {
  const [periodo, setPeriodo] = useState('dia');

  return (
    <div style={{ background: '#f3f4f6', minHeight: '100vh' }}>
      <PageHeader title="Água" />

      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <KpiCard label="Consumo Total" value="587,380 m³" icon="💧" color={DNA_DARK} />
          <KpiCard label="Maior Consumo" value="587,380 m³" sub="Medidor Água Geral" icon="📈" color="#3b82f6" />
          <KpiCard label="Menor Consumo" value="587,380 m³" sub="Medidor Água Geral" icon="📉" color={DNA_TEAL} />
          <KpiCard label="Pico de Consumo" value="14,601 m³" sub="13/05/2026 · 09:57:05" icon="🔺" color="#ef4444" />
        </div>

        {/* Consumo por local */}
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,.08)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: DNA_DARK }}>💧 Consumo por Local</h3>
            <input placeholder="Pesquisar Medidores" style={{ padding: '6px 12px', borderRadius: 20, border: '1px solid #d1d5db', fontSize: 12, outline: 'none' }} />
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Medidor', 'ID', 'Área', 'Pico de Consumo', 'Média de Consumo', 'Situação', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: .3 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MEDIDORES.map((row, i) => (
                <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: DNA_DARK }}>{row.nome}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>{row.id}</td>
                  <td style={{ padding: '12px 16px', color: '#374151' }}>{row.area}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#ef4444' }}>{row.pico}</td>
                  <td style={{ padding: '12px 16px' }}>{row.media}</td>
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
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: DNA_DARK }}>📊 Histórico de Água</h3>
            <div style={{ display: 'flex', gap: 6 }}>
              {['hora', 'dia', 'mês'].map(p => (
                <button key={p} onClick={() => setPeriodo(p)} style={{
                  padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  background: periodo === p ? DNA_DARK : '#f3f4f6',
                  color: periodo === p ? '#fff' : '#6b7280',
                  border: `1px solid ${periodo === p ? DNA_DARK : '#e5e7eb'}`,
                }}>
                  Por {p}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>Local:</span>
              <select style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12 }}>
                <option>Geral</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>Sensor:</span>
              <select style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12 }}>
                <option>Medidor Água Geral</option>
              </select>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={HISTORICO}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="data" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`${v.toLocaleString('pt-BR')} L`, 'Consumo']} />
              <Legend />
              <Bar dataKey="consumo" name="Consumo (L)" fill={DNA_TEAL} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default Agua;
