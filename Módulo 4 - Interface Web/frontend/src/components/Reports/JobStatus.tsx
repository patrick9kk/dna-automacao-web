import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../../services/apiClient';
import type { JobStatus as IJobStatus } from '../../types';
import dayjs from 'dayjs';

const DNA_DARK = '#054664';

const STATUS_CONF: Record<IJobStatus, { label: string; color: string; bg: string }> = {
  queued:     { label: 'Na fila',      color: '#92400e', bg: '#fef3c7' },
  processing: { label: 'Processando',  color: '#1e40af', bg: '#dbeafe' },
  completed:  { label: 'Concluído',    color: '#166534', bg: '#dcfce7' },
  failed:     { label: 'Erro',         color: '#991b1b', bg: '#fee2e2' },
};

interface Props { jobId: string }

const JobStatus: React.FC<Props> = ({ jobId }) => {
  const { data: job, isLoading, isError } = useQuery({
    queryKey: ['job', jobId],
    queryFn:  () => reportsApi.getJob(jobId),
    refetchInterval: q =>
      q.state.data?.status === 'completed' || q.state.data?.status === 'failed'
        ? false : 5_000,
    staleTime: 3_000,
    enabled: !!jobId,
  });

  if (isLoading) return <p style={{ textAlign: 'center', color: '#9ca3af', padding: 24 }}>Verificando status…</p>;
  if (isError || !job) return <p style={{ color: '#ef4444', padding: 24 }}>Não foi possível obter o status do job.</p>;

  const conf = STATUS_CONF[job.status];

  return (
    <div style={{ maxWidth: 540, margin: '0 auto 32px', background: '#fff', borderRadius: 10, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,.1)' }}>
      <h3 style={{ marginTop: 0, color: DNA_DARK, fontSize: 16 }}>Status do Relatório</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13, marginBottom: 16 }}>
        <div><span style={{ color: '#6b7280' }}>Job ID</span><br /><code style={{ fontSize: 11 }}>{job.job_id}</code></div>
        <div>
          <span style={{ color: '#6b7280' }}>Status</span><br />
          <span style={{ background: conf.bg, color: conf.color, borderRadius: 12, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>{conf.label}</span>
        </div>
        <div><span style={{ color: '#6b7280' }}>Tipo</span><br />{job.report_type}</div>
        <div><span style={{ color: '#6b7280' }}>Formato</span><br />{job.format.toUpperCase()}</div>
        <div><span style={{ color: '#6b7280' }}>Solicitado em</span><br />{dayjs(job.requested_at).format('DD/MM/YYYY HH:mm')}</div>
        {job.completed_at && (
          <div><span style={{ color: '#6b7280' }}>Concluído em</span><br />{dayjs(job.completed_at).format('DD/MM/YYYY HH:mm')}</div>
        )}
      </div>

      {/* Progress bar while processing */}
      {(job.status === 'queued' || job.status === 'processing') && (
        <div style={{ background: '#e5e7eb', borderRadius: 99, height: 6, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{
            height: '100%', background: DNA_DARK,
            width: job.status === 'queued' ? '20%' : '65%',
            transition: 'width 1s ease',
          }} />
        </div>
      )}

      {/* Error detail */}
      {job.status === 'failed' && job.error && (
        <div style={{ background: '#fee2e2', borderRadius: 6, padding: '10px 14px', fontSize: 13, color: '#991b1b', marginBottom: 12 }}>
          {job.error}
        </div>
      )}

      {/* Download notice — link will arrive via e-mail (presigned URL) */}
      {job.status === 'completed' && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 8, padding: 14, fontSize: 14, color: '#166534' }}>
          ✅ Relatório pronto! O link de download foi enviado para o e-mail cadastrado e expira em 15 minutos.
        </div>
      )}
    </div>
  );
};

export default JobStatus;
