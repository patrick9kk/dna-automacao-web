// ── Enums ──────────────────────────────────────────────────────────────────
export type DeviceStatus    = 'OK' | 'ALERT' | 'WARNING' | 'ERROR' | 'OFFLINE';
export type ReportFormat    = 'csv' | 'xlsx' | 'pdf';
export type ReportType      = 'operational' | 'managerial' | 'executive';
export type JobStatus       = 'queued' | 'processing' | 'completed' | 'failed';
export type AlertSeverity   = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// ── Domínio ────────────────────────────────────────────────────────────────
export interface Device {
  device_id:    string;
  device_code:  string;
  device_name:  string;
  device_type:  string;
  status:       DeviceStatus;
  plant:        string;
  department:   string;
  last_reading: string | null;
  last_value:   number | null;
  unit:         string | null;
}

export interface Reading {
  reading_id:        string;
  device_id:         string;
  device_name:       string;
  reading_timestamp: string;
  parameter_name:    string;
  value:             number;
  unit:              string;
  status:            DeviceStatus;
  quality:           number;
}

export interface Alert {
  alert_id:     string;
  device_id:    string;
  device_name:  string;
  triggered_at: string;
  resolved_at:  string | null;
  alert_type:   string;
  severity:     AlertSeverity;
  actual_value: number;
  threshold:    number;
  plant:        string;
  department:   string;
}

export interface DashboardStats {
  total_devices:    number;
  devices_ok:       number;
  devices_alert:    number;
  devices_offline:  number;
  active_alerts:    number;
  readings_today:   number;
  availability_pct: number;
}

// ── Relatórios ─────────────────────────────────────────────────────────────
export interface ReportRequest {
  report_type:  ReportType;
  format:       ReportFormat;
  date_from:    string;
  date_to:      string;
  user_email:   string;
  filters?: {
    plant?:      string;
    department?: string;
    device_ids?: string[];
    status?:     DeviceStatus[];
  };
}

export interface ReportJob {
  job_id:       string;
  status:       JobStatus;
  report_type:  ReportType;
  format:       ReportFormat;
  requested_at: string;
  completed_at: string | null;
  error?:       string;
}

// ── Auth / ABAC ─────────────────────────────────────────────────────────────
export interface UserClaims {
  sub:                string;
  email:              string;
  name:               string;
  'custom:role':      string;
  'custom:department':string;
  'custom:plant':     string;
  'cognito:groups':   string[];
}
