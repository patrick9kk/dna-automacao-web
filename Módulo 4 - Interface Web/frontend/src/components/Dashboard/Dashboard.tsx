import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useAuth }            from '../../contexts/AuthContext';
import { useDashboardStats, useDevices, useReadings, useAlerts } from '../../hooks/useDeviceReadings';
import type { DeviceStatus, AlertSeverity } from '../../types';
import dayjs from 'dayjs';

// ── colour palette ───────────────────────────────────────────────────────────
const STATUS_COLOR: Record<DeviceStatus, string> = {
  OK: '#22c55e', ALERT: '#ef4444', WARNING: '#f59e0b', ERROR: '#dc2626', OFFLINE: '#6b7280',
};
const SEV_COLOR: Record<AlertSeverity, string> = {
  LOW: '#3b82f6', MEDIUM: '#f59e0b', HIGH: '#ef4444', CRITICAL: '#7c3aed',
};
const DNA_DARK = '#054664';
const DNA_TEAL = '#18B8D0';

// ── small stat card ──────────────────────────────────────────────────────────
interface StatCardProps { label: string; value: string | number; color?: string }
const StatCard: React.FC<StatCardProps> = ({ label, value, color = DNA_DARK }) => (
  <div style={{
    background: '#fff', borderRadius: 8, padding: '16px 20px',
    boxShadow: '0 1px 3px rgba(0,0,0,.1)', borderLeft: `4px solid ${color}`,
  }}>
    <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
  </div>
);

// ── main component ───────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const { plant, department, role } = useAuth();
  const [filterPlant, setFilterPlant]   = useState(plant ?? '');
  const [filterDept,  setFilterDept]    = useState(department ?? '');
  const [selectedDev, setSelectedDev]   = useState<string | undefined>();

  const { data: stats }   = useDashboardStats(filterPlant, filterDept);
  const { data: devices }  = useDevices(filterPlant, filterDept);
  const { data: readings } = useReadings(selectedDev, 24);
  const { data: alerts }   = useAlerts(filterPlant);

  // Format reading timestamps for the chart
  const chartData = (readings ?? []).map(r => ({
    time:  dayjs(r.reading_timestamp).format('HH:mm'),
    valor: r.value,
    nome:  r.parameter_name,
  }));

  // Device status bar data
  const statusData = [
    { status: 'OK',      qtd: stats?.devices_ok      ?? 0 },
    { status: 'Alerta',  qtd: stats?.devices_alert   ?? 0 },
    { status: 'Offline', qtd: stats?.devices_offline ?? 0 },
  ];

  return (
    <div style={{ padding: 24, background: '#f3f4f6', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, color: DNA_DARK, fontSize: 22, fontWeight: 700 }}>
          DNA Automação — Painel de Controle
        </h1>
        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13 }}>
          Perfil: <b>{role}</b> · Planta: <b>{filterPlant || 'Todas'}</b> · Depto: <b>{filterDept || 'Todos'}</b>
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          placeholder="Filtrar planta"
          value={filterPlant}
          onChange={e => setFilterPlant(e.target.value)}
          style={{ padding: '7px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}
        />
        <input
          placeholder="Filtrar departamento"
          value={filterDept}
          onChange={e => setFilterDept(e.target.value)}
          style={{ padding: '7px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}
        />
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Dispositivos"  value={stats?.total_devices    ?? '—'} color={DNA_DARK} />
        <StatCard label="Disponibilidade"     value={stats ? `${stats.availability_pct.toFixed(1)}%` : '—'} color="#22c55e" />
        <StatCard label="Alertas Ativos"      value={stats?.active_alerts    ?? '—'} color="#ef4444" />
        <StatCard label="Leituras Hoje"       value={stats?.readings_today   ?? '—'} color="#7c3aed" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Line chart: readings over time */}
        <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
          <h3 style={{ marginTop: 0, color: DNA_DARK, fontSize: 15 }}>
            Leituras — últimas 24h{selectedDev ? ` (dispositivo ${selectedDev.slice(0,8)}...)` : ' (todos)'}
          </h3>
          {chartData.length === 0
            ? <p style={{ color: '#9ca3af', textAlign: 'center' }}>Selecione um dispositivo na lista abaixo</p>
            : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="valor" stroke={DNA_TEAL} dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
        </div>

        {/* Bar chart: device status */}
        <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
          <h3 style={{ marginTop: 0, color: DNA_DARK, fontSize: 15 }}>Status dos Dispositivos</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="status" type="category" tick={{ fontSize: 11 }} width={55} />
              <Tooltip />
              <Bar dataKey="qtd" fill={DNA_TEAL} radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Devices table */}
      <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,.1)', marginBottom: 24, overflowX: 'auto' }}>
        <h3 style={{ marginTop: 0, color: DNA_DARK, fontSize: 15 }}>Dispositivos</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['Código', 'Nome', 'Tipo', 'Planta', 'Status', 'Última Leitura', 'Valor'].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(devices ?? []).map(d => (
              <tr
                key={d.device_id}
                onClick={() => setSelectedDev(d.device_id)}
                style={{ cursor: 'pointer', background: selectedDev === d.device_id ? '#eff6ff' : 'transparent' }}
              >
                <td style={{ padding: '8px 12px', borderBottom: '1px solid #f3f4f6' }}>{d.device_code}</td>
                <td style={{ padding: '8px 12px', borderBottom: '1px solid #f3f4f6' }}>{d.device_name}</td>
                <td style={{ padding: '8px 12px', borderBottom: '1px solid #f3f4f6', color: '#6b7280' }}>{d.device_type}</td>
                <td style={{ padding: '8px 12px', borderBottom: '1px solid #f3f4f6', color: '#6b7280' }}>{d.plant}</td>
                <td style={{ padding: '8px 12px', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ background: STATUS_COLOR[d.status], color: '#fff', borderRadius: 12, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>
                    {d.status}
                  </span>
                </td>
                <td style={{ padding: '8px 12px', borderBottom: '1px solid #f3f4f6', color: '#6b7280', fontSize: 11 }}>
                  {d.last_reading ? dayjs(d.last_reading).format('DD/MM HH:mm') : '—'}
                </td>
                <td style={{ padding: '8px 12px', borderBottom: '1px solid #f3f4f6' }}>
                  {d.last_value != null ? `${d.last_value} ${d.unit ?? ''}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Alerts table */}
      <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,.1)', overflowX: 'auto' }}>
        <h3 style={{ marginTop: 0, color: '#ef4444', fontSize: 15 }}>Alertas Recentes</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#fef2f2' }}>
              {['Dispositivo', 'Tipo', 'Severidade', 'Disparado em', 'Valor Real', 'Threshold'].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#374151', borderBottom: '1px solid #fecaca' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(alerts ?? []).length === 0
              ? <tr><td colSpan={6} style={{ padding: 16, color: '#9ca3af', textAlign: 'center' }}>Nenhum alerta ativo</td></tr>
              : (alerts ?? []).map(a => (
                <tr key={a.alert_id}>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid #fef2f2' }}>{a.device_name}</td>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid #fef2f2', color: '#6b7280' }}>{a.alert_type}</td>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid #fef2f2' }}>
                    <span style={{ background: SEV_COLOR[a.severity], color: '#fff', borderRadius: 12, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>
                      {a.severity}
                    </span>
                  </td>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid #fef2f2', fontSize: 11, color: '#6b7280' }}>
                    {dayjs(a.triggered_at).format('DD/MM HH:mm')}
                  </td>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid #fef2f2' }}>{a.actual_value}</td>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid #fef2f2', color: '#6b7280' }}>{a.threshold}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
