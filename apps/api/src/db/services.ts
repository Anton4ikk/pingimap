import { PrismaClient, Service, ServiceCheck, ServiceStatus } from '../generated/prisma/index.js'

const prisma = new PrismaClient()

export type CreateServiceData = {
  name: string
  url: string
  lastLatencyMs?: number
  lastStatus?: ServiceStatus
  lastCheckedAt?: Date
}

export type UpdateServiceData = Partial<Pick<CreateServiceData, 'name' | 'url'>>

export type CreateServiceCheckData = {
  serviceId: string
  latencyMs?: number | null
  status: ServiceStatus
  httpCode?: number | null
  errorText?: string | null
}

export type BatchServiceUpdate = {
  id: string
  status: ServiceStatus
  latencyMs?: number
}

export type BatchServiceCheckData = CreateServiceCheckData

export const servicesDb = {
  async create(data: CreateServiceData): Promise<Service> {
    return prisma.service.create({
      data,
    })
  },

  async findAll(): Promise<Service[]> {
    return prisma.service.findMany({
      orderBy: { createdAt: 'desc' },
    })
  },

  async findById(id: string): Promise<Service | null> {
    return prisma.service.findUnique({
      where: { id },
    })
  },

  async findByUrl(url: string): Promise<Service | null> {
    return prisma.service.findUnique({
      where: { url },
    })
  },

  async update(id: string, data: UpdateServiceData): Promise<Service> {
    return prisma.service.update({
      where: { id },
      data,
    })
  },

  async delete(id: string): Promise<Service> {
    return prisma.service.delete({
      where: { id },
    })
  },

  async updateStatus(
    id: string,
    status: ServiceStatus,
    latencyMs?: number
  ): Promise<Service> {
    return prisma.service.update({
      where: { id },
      data: {
        lastStatus: status,
        lastLatencyMs: latencyMs ?? null,
        lastCheckedAt: new Date(),
      },
    })
  },

  async getServicesWithStatus(status: ServiceStatus): Promise<Service[]> {
    return prisma.service.findMany({
      where: { lastStatus: status },
      orderBy: { lastCheckedAt: 'desc' },
    })
  },

  async recordCheck(data: CreateServiceCheckData): Promise<ServiceCheck> {
    return await prisma.$transaction(async (tx) => {
      // Insert the new check
      const check = await tx.serviceCheck.create({
        data,
      })

      // Keep only the last 50 checks per service
      const checksToDelete = await tx.serviceCheck.findMany({
        where: { serviceId: data.serviceId },
        orderBy: { ts: 'desc' },
        skip: 50,
        select: { id: true },
      })

      if (checksToDelete.length > 0) {
        await tx.serviceCheck.deleteMany({
          where: {
            id: { in: checksToDelete.map(c => c.id) }
          }
        })
      }

      return check
    })
  },

  async getServiceChecks(serviceId: string, limit: number = 50): Promise<ServiceCheck[]> {
    return prisma.serviceCheck.findMany({
      where: { serviceId },
      orderBy: { ts: 'desc' },
      take: limit,
    })
  },

  async getLatestCheck(serviceId: string): Promise<ServiceCheck | null> {
    return prisma.serviceCheck.findFirst({
      where: { serviceId },
      orderBy: { ts: 'desc' },
    })
  },

  async batchUpdateStatuses(updates: BatchServiceUpdate[]): Promise<void> {
    const now = new Date()

    await prisma.$transaction(async (tx) => {
      const updatePromises = updates.map(update =>
        tx.service.update({
          where: { id: update.id },
          data: {
            lastStatus: update.status,
            lastLatencyMs: update.latencyMs ?? null,
            lastCheckedAt: now,
          },
        })
      )

      await Promise.all(updatePromises)
    })
  },

  async batchRecordChecks(checks: BatchServiceCheckData[]): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Insert all checks
      await tx.serviceCheck.createMany({
        data: checks,
      })

      // For each unique service, clean up old checks
      const uniqueServiceIds = [...new Set(checks.map(c => c.serviceId))]

      const cleanupPromises = uniqueServiceIds.map(async (serviceId) => {
        const checksToDelete = await tx.serviceCheck.findMany({
          where: { serviceId },
          orderBy: { ts: 'desc' },
          skip: 50,
          select: { id: true },
        })

        if (checksToDelete.length > 0) {
          await tx.serviceCheck.deleteMany({
            where: {
              id: { in: checksToDelete.map(c => c.id) }
            }
          })
        }
      })

      await Promise.all(cleanupPromises)
    })
  },
}

export { ServiceStatus } from '../generated/prisma/index.js'
export type { Service, ServiceCheck } from '../generated/prisma/index.js'

