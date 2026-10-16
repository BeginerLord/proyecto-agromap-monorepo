import type {
  Crop,
  CropPayload,
  CropQuery,
  DashboardSummary,
  Device,
  DevicePayload,
  Distribution,
  DistributionPayload,
  DistributionQuery,
  FieldLog,
  FieldLogPayload,
  FieldLogQuery,
  Harvest,
  HarvestPayload,
  HarvestQuery,
  Paginated,
  PaginationQuery,
  Plot,
  PlotPayload,
  PlotQuery,
  ReadingQuery,
  SensorProvider,
  SensorReading,
  SyncResult,
  UpdateCropPayload,
  UpdateUserPayload,
  User,
  UserQuery,
} from '@/models'
import { cleanParams, request } from './http'

export const dashboardApi = {
  summary: (horizonDays = 45) => request.get<DashboardSummary>('/dashboard/summary', { params: { horizonDays } }),
}

export const plotsApi = {
  list: (query: PlotQuery = {}) => request.get<Paginated<Plot>>('/plots', { params: cleanParams(query) }),
  get: (id: string) => request.get<Plot>(`/plots/${id}`),
  create: (payload: PlotPayload) => request.post<Plot>('/plots', payload),
  update: (id: string, payload: Partial<PlotPayload>) => request.patch<Plot>(`/plots/${id}`, payload),
  remove: (id: string) => request.delete(`/plots/${id}`),
}

export const cropsApi = {
  list: (query: CropQuery = {}) => request.get<Paginated<Crop>>('/crops', { params: cleanParams(query) }),
  get: (id: string) => request.get<Crop>(`/crops/${id}`),
  create: (payload: CropPayload) => request.post<Crop>('/crops', payload),
  update: (id: string, payload: UpdateCropPayload) => request.patch<Crop>(`/crops/${id}`, payload),
  remove: (id: string) => request.delete(`/crops/${id}`),
}

export const fieldLogsApi = {
  list: (query: FieldLogQuery = {}) =>
    request.get<Paginated<FieldLog>>('/field-logs', { params: cleanParams(query) }),
  create: (payload: FieldLogPayload) => request.post<FieldLog>('/field-logs', payload),
  remove: (id: string) => request.delete(`/field-logs/${id}`),
}

export const harvestsApi = {
  list: (query: HarvestQuery = {}) => request.get<Paginated<Harvest>>('/harvests', { params: cleanParams(query) }),
  create: (payload: HarvestPayload) => request.post<Harvest>('/harvests', payload),
  remove: (id: string) => request.delete(`/harvests/${id}`),
}

export const distributionsApi = {
  list: (query: DistributionQuery = {}) =>
    request.get<Paginated<Distribution>>('/distributions', { params: cleanParams(query) }),
  create: (payload: DistributionPayload) => request.post<Distribution>('/distributions', payload),
}

export const sensorsApi = {
  providers: () => request.get<{ enabled: boolean; providers: SensorProvider[] }>('/sensors/providers'),
  listDevices: (query: PaginationQuery = {}) =>
    request.get<Paginated<Device>>('/sensors/devices', { params: cleanParams(query) }),
  createDevice: (payload: DevicePayload) => request.post<Device>('/sensors/devices', payload),
  removeDevice: (id: string) => request.delete(`/sensors/devices/${id}`),
  readings: (id: string, query: ReadingQuery = {}) =>
    request.get<Paginated<SensorReading>>(`/sensors/devices/${id}/readings`, { params: cleanParams(query) }),
  sync: (id: string) => request.post<SyncResult>(`/sensors/devices/${id}/sync`),
}

export const usersApi = {
  list: (query: UserQuery = {}) => request.get<Paginated<User>>('/users', { params: cleanParams(query) }),
  update: (id: string, payload: UpdateUserPayload) => request.patch<User>(`/users/${id}`, payload),
}
