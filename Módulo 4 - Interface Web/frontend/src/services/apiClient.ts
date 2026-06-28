import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// Inject Cognito JWT on every request
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  try {
    const session = await fetchAuthSession();
    const token   = session.tokens?.idToken?.toString();
    if (token) config.headers.set('Authorization', `Bearer ${token}`);
  } catch {
    // not authenticated — let the request proceed and fail with 401
  }
  return config;
});

// ── Reports ──────────────────────────────────────────────────────────────────
import type { ReportRequest, ReportJob } from '../types';

export const reportsApi = {
  request: (payload: ReportRequest) =>
    apiClient.post<{ job_id: string }>('/reports', payload).then(r => r.data),

  getJob: (jobId: string) =>
    apiClient.get<ReportJob>(`/reports/${jobId}`).then(r => r.data),
};

// ── Dashboard ────────────────────────────────────────────────────────────────
import type { Device, Reading, Alert, DashboardStats } from '../types';

export const dashboardApi = {
  getStats: (params?: { plant?: string; department?: string }) =>
    apiClient.get<DashboardStats>('/dashboard/stats', { params }).then(r => r.data),

  getDevices: (params?: { plant?: string; department?: string; status?: string }) =>
    apiClient.get<Device[]>('/dashboard/devices', { params }).then(r => r.data),

  getReadings: (params: { device_id?: string; hours?: number }) =>
    apiClient.get<Reading[]>('/dashboard/readings', { params }).then(r => r.data),

  getAlerts: (params?: { plant?: string; severity?: string; limit?: number }) =>
    apiClient.get<Alert[]>('/dashboard/alerts', { params }).then(r => r.data),
};

export default apiClient;
