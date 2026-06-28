import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import PageHeader from '../Layout/PageHeader';
import Icon from '../Layout/Icon';

const DNA_DARK = '#054664';
const DNA_TEAL = '#18B8D0';

const HISTORICO = [
  { data: '05/05', consumo: 82000 },
  { data: '07/05', consumo: 91000 },
  { data: '09/05', consumo: 78000 },
  { data: '11/05', consumo: 95000 },
  { data: '13/05', consumo: 88000 },
  { data: '14/05', consumo: 124322 },
  { data: '15/05', consumo: 103000 },
  { data: '16/05', consumo: 97000 },
  { data: '17/05', consumo: 85000 },
  { data: '18/05', consumo: 91000 },
  { data: '19/05', consumo: 76000 },
  { data: '21/05', consumo: 88000 },
  { data: '23/05', consumo: 85010 },
];

const MEDIDORES = [
  { nome: 'Medidor Energia Geral', id: 'SM3W-SESC-SEDE-1', corrA: '76,00 A', corrB: '85,00 A', corrC: '95,00 A', situacao: 'Regular', status: 'Online' },
  { nome: 'Medidor Energia Gerador', id: 'SM3W-SESC-SEDE-2', corrA: '12,00 A', corrB: '14,00 A', corrC: '11,00 A', situacao: 'Regular', status: 'Online' },
];

const Badge: React.FC<{ label: string; ok?: boolean }> = ({ label, ok = true }) => (
  <span style={{
    background: ok ? '#dcfce7' : '#fee2e2',
    color: ok ? '#166534' : '#991b1b',
    borderRadius: 12, padding: '2px 10px', fontSize: 12, fontWeight: 600,
  }}>{label}</span>
);

const KpiCard: React.FC<{ label: string; value: string; sub?: string; icon?: string; color?: string }> = ({
  label, value, sub, icon = 'bolt', color = DNA_DARK,
}) => (
  <div style={{
    background: '#fff', borderRadius: 10, padding: '18px 20px',
    boxShadow: '0 1px 4px rgba(0,0,0,.08)', borderTop: `3px solid ${color}`,
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: .4, fontWeight: 500 }}>{label}</div>
      <Icon name={icon} size={22} color={color} />
    </div>
    <div style={{ fontSize: 26, fontWeight: 700, color, marginTop: 8 }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{sub}</div>}
  </div>
);

const Energia: React.FC = () => {
  const [periodo, setPeriodo] = useState('dia');

  return (
    <div style={{ background: '#f3f4f6', minHeight: '100vh' }}>
      <PageHeader title="Energia" />

      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <KpiCard label="Consumo Total" value="85.010 MWh" icon="bolt" color={DNA_DARK} />
          <KpiCard label="Maior Consumo" value="85.010 MWh" sub="Medidor Energia Geral" icon="trending_up" color="#f59e0b" />
          <KpiCard label="Menor Consumo" value="85.010 MWh" sub="Medidor Energia Geral" icon="trending_down" color={DNA_TEAL} />
          <KpiCard label="Pico de Consumo" value="124.322 MWh" sub="14/05/2026 · 09:52:41" icon="arrow_upward" color="#ef4444" />
        </div>

        {/* Parâmetros */}
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,.08)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: DNA_DARK }}><span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="electrical_services" size={20} color={DNA_TEAL} /> Parâmetros de Energia</span></h3>
            <input placeholder="Pesquisar Medidores" style={{ padding: '6px 12px', borderRadius: 20, border: '1px solid #d1d5db', fontSize: 12, outline: 'none' }} />
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Medidor', 'ID', 'Corrente A', 'Corrente B', 'Corrente C', 'Situação', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: .3 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MEDIDORES.map((row, i) => (
                <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: DNA_DARK }}>{row.nome}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>{row.id}</td>
                  <td style={{ padding: '12px 16px' }}>{row.corrA}</td>
                  <td style={{ padding: '12px 16px' }}>{row.corrB}</td>
                  <td style={{ padding: '12px 16px' }}>{row.corrC}</td>
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
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: DNA_DARK }}><span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="show_chart" size={20} color={DNA_TEAL} /> Histórico de Energia</span></h3>
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
              <span style={{ fontSize: 12, color: '#6b7280' }}>Sensor:</span>
              <select style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12 }}>
                <option>Medidor Energia Geral</option>
                <option>Medidor Energia Gerador</option>
              </select>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={HISTORICO}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="data" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`${v.toLocaleString('pt-BR')} kWh`, 'Consumo']} />
              <Legend />
              <Line type="monotone" dataKey="consumo" name="Consumo (kWh)" stroke={DNA_TEAL} strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default Energia;
