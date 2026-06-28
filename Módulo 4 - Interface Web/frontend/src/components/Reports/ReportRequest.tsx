import React, { useState } from 'react';
import { useMutation }    from '@tanstack/react-query';
import { reportsApi }     from '../../services/apiClient';
import { useAuth }        from '../../contexts/AuthContext';
import type { ReportRequest as IReportRequest, ReportFormat, ReportType } from '../../types';
import dayjs from 'dayjs';

const DNA_DARK = '#054664';

const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: 'operational', label: 'Operacional' },
  { value: 'managerial',  label: 'Gerencial'  },
  { value: 'executive',   label: 'Executivo'  },
];
const FORMATS: { value: ReportFormat; label: string }[] = [
  { value: 'xlsx', label: 'Excel (.xlsx)' },
  { value: 'pdf',  label: 'PDF'           },
  { value: 'csv',  label: 'CSV'           },
];

interface Props { onJobCreated: (jobId: string) => void }

const ReportRequest: React.FC<Props> = ({ onJobCreated }) => {
  const { user, plant, department } = useAuth();
  const [form, setForm] = useState<IReportRequest>({
    report_type: 'operational',
    format:      'xlsx',
    date_from:   dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
    date_to:     dayjs().format('YYYY-MM-DD'),
    user_email:  user?.email ?? '',
    filters:     { plant: plant || undefined, department: department || undefined },
  });
  const [jobId, setJobId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: reportsApi.request,
    onSuccess: ({ job_id }) => {
      setJobId(job_id);
      onJobCreated(job_id);
    },
  });

  const set = (k: keyof IReportRequest, v: unknown) =>
    setForm(f => ({ ...f, [k]: v }));

  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, color: '#374151', marginBottom: 4, fontWeight: 500 };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' };
  const selectStyle: React.CSSProperties = { ...inputStyle, background: '#fff' };

  return (
    <div style={{ maxWidth: 540, margin: '32px auto', background: '#fff', borderRadius: 10, padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,.1)' }}>
      <h2 style={{ marginTop: 0, color: DNA_DARK, fontSize: 18 }}>Solicitar Relatório</h2>

      {jobId && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 8, padding: 14, marginBottom: 20, fontSize: 14 }}>
          ✅ Relatório enfileirado! Job ID: <code style={{ fontFamily: 'monospace', fontSize: 12 }}>{jobId}</code>
        </div>
      )}

      {mutation.isError && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: 14, marginBottom: 20, fontSize: 14 }}>
          ❌ Erro ao solicitar relatório. Tente novamente.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>Tipo de relatório</label>
          <select style={selectStyle} value={form.report_type}
            onChange={e => set('report_type', e.target.value as ReportType)}>
            {REPORT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Formato</label>
          <select style={selectStyle} value={form.format}
            onChange={e => set('format', e.target.value as ReportFormat)}>
            {FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Data inicial</label>
            <input type="date" style={inputStyle} value={form.date_from}
              onChange={e => set('date_from', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Data final</label>
            <input type="date" style={inputStyle} value={form.date_to}
              onChange={e => set('date_to', e.target.value)} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>E-mail para receber o link</label>
          <input type="email" style={inputStyle} value={form.user_email}
            onChange={e => set('user_email', e.target.value)} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Planta (filtro)</label>
            <input style={inputStyle} value={form.filters?.plant ?? ''}
              onChange={e => setForm(f => ({ ...f, filters: { ...f.filters, plant: e.target.value || undefined } }))} />
          </div>
          <div>
            <label style={labelStyle}>Departamento (filtro)</label>
            <input style={inputStyle} value={form.filters?.department ?? ''}
              onChange={e => setForm(f => ({ ...f, filters: { ...f.filters, department: e.target.value || undefined } }))} />
          </div>
        </div>

        <button
          disabled={mutation.isPending}
          onClick={() => mutation.mutate(form)}
          style={{
            marginTop: 8, padding: '10px 0', background: mutation.isPending ? '#93c5fd' : DNA_DARK,
            color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600,
            cursor: mutation.isPending ? 'not-allowed' : 'pointer', transition: 'background .2s',
          }}
        >
          {mutation.isPending ? 'Enfileirando…' : 'Solicitar relatório'}
        </button>
      </div>
    </div>
  );
};

export default ReportRequest;
