import { Service, ServiceCheck, ServiceStatus } from '../generated/prisma/index.js';
export type CreateServiceData = {
    name: string;
    url: string;
    lastLatencyMs?: number;
    lastStatus?: ServiceStatus;
    lastCheckedAt?: Date;
};
export type UpdateServiceData = Partial<Pick<CreateServiceData, 'name' | 'url'>>;
export type CreateServiceCheckData = {
    serviceId: string;
    latencyMs?: number | null;
    status: ServiceStatus;
    httpCode?: number | null;
    errorText?: string | null;
};
export type BatchServiceUpdate = {
    id: string;
    status: ServiceStatus;
    latencyMs?: number;
};
export type BatchServiceCheckData = CreateServiceCheckData;
export declare const servicesDb: {
    create(data: CreateServiceData): Promise<Service>;
    findAll(): Promise<Service[]>;
    findById(id: string): Promise<Service | null>;
    findByUrl(url: string): Promise<Service | null>;
    update(id: string, data: UpdateServiceData): Promise<Service>;
    delete(id: string): Promise<Service>;
    updateStatus(id: string, status: ServiceStatus, latencyMs?: number): Promise<Service>;
    getServicesWithStatus(status: ServiceStatus): Promise<Service[]>;
    recordCheck(data: CreateServiceCheckData): Promise<ServiceCheck>;
    getServiceChecks(serviceId: string, limit?: number): Promise<ServiceCheck[]>;
    getLatestCheck(serviceId: string): Promise<ServiceCheck | null>;
    batchUpdateStatuses(updates: BatchServiceUpdate[]): Promise<void>;
    batchRecordChecks(checks: BatchServiceCheckData[]): Promise<void>;
};
export { ServiceStatus } from '../generated/prisma/index.js';
export type { Service, ServiceCheck } from '../generated/prisma/index.js';
//# sourceMappingURL=services.d.ts.map