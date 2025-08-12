export type { Service, ServiceCheck, CreateServiceData, UpdateServiceData, CreateServiceCheckData } from '../db/services.js';
export { ServiceStatus } from '../db/services.js';

export interface ServiceResponse {
  id: string;
  name: string;
  url: string;
  lastLatencyMs: number | null;
  lastStatus: string | null;
  lastHttpCode: number | null;
  lastCheckedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceRequest {
  name: string;
  url: string;
}

export interface UpdateServiceRequest {
  name?: string;
  url?: string;
}

export interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string;
}

export interface DeleteServiceResponse {
  message: string;
  service: ServiceResponse;
}