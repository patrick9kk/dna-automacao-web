import { useQuery }    from '@tanstack/react-query';
import { dashboardApi } from '../services/apiClient';
import type { Device, Reading, Alert, DashboardStats } from '../types';

// Poll stats every 30 s
export const useDashboardStats = (plant?: string, department?: string) =>
  useQuery<DashboardStats>({
    queryKey: ['dashboard-stats', plant, department],
    queryFn:  () => dashboardApi.getStats({ plant, department }),
    refetchInterval: 30_000,
    staleTime: 20_000,
  });

// Poll device list every 60 s
export const useDevices = (plant?: string, department?: string, status?: string) =>
  useQuery<Device[]>({
    queryKey: ['devices', plant, department, status],
    queryFn:  () => dashboardApi.getDevices({ plant, department, status }),
    refetchInterval: 60_000,
    staleTime: 45_000,
    placeholderData: [],
  });

// Poll readings every 60 s; default last 24 h
export const useReadings = (deviceId?: string, hours = 24) =>
  useQuery<Reading[]>({
    queryKey: ['readings', deviceId, hours],
    queryFn:  () => dashboardApi.getReadings({ device_id: deviceId, hours }),
    enabled:  true,
    refetchInterval: 60_000,
    staleTime: 45_000,
    placeholderData: [],
  });

// Poll active alerts every 30 s
export const useAlerts = (plant?: string, severity?: string) =>
  useQuery<Alert[]>({
    queryKey: ['alerts', plant, severity],
    queryFn:  () => dashboardApi.getAlerts({ plant, severity, limit: 50 }),
    refetchInterval: 30_000,
    staleTime: 20_000,
    placeholderData: [],
  });
