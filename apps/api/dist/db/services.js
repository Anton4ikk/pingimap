import { PrismaClient } from '../generated/prisma/index.js';
const prisma = new PrismaClient();
export const servicesDb = {
    async create(data) {
        return prisma.service.create({
            data,
        });
    },
    async findAll() {
        return prisma.service.findMany({
            orderBy: { createdAt: 'desc' },
        });
    },
    async findById(id) {
        return prisma.service.findUnique({
            where: { id },
        });
    },
    async findByUrl(url) {
        return prisma.service.findUnique({
            where: { url },
        });
    },
    async update(id, data) {
        return prisma.service.update({
            where: { id },
            data,
        });
    },
    async delete(id) {
        return prisma.service.delete({
            where: { id },
        });
    },
    async updateStatus(id, status, latencyMs) {
        return prisma.service.update({
            where: { id },
            data: {
                lastStatus: status,
                lastLatencyMs: latencyMs ?? null,
                lastCheckedAt: new Date(),
            },
        });
    },
    async getServicesWithStatus(status) {
        return prisma.service.findMany({
            where: { lastStatus: status },
            orderBy: { lastCheckedAt: 'desc' },
        });
    },
    async recordCheck(data) {
        return await prisma.$transaction(async (tx) => {
            // Insert the new check
            const check = await tx.serviceCheck.create({
                data,
            });
            // Keep only the last 50 checks per service
            const checksToDelete = await tx.serviceCheck.findMany({
                where: { serviceId: data.serviceId },
                orderBy: { ts: 'desc' },
                skip: 50,
                select: { id: true },
            });
            if (checksToDelete.length > 0) {
                await tx.serviceCheck.deleteMany({
                    where: {
                        id: { in: checksToDelete.map(c => c.id) }
                    }
                });
            }
            return check;
        });
    },
    async getServiceChecks(serviceId, limit = 50) {
        return prisma.serviceCheck.findMany({
            where: { serviceId },
            orderBy: { ts: 'desc' },
            take: limit,
        });
    },
    async getLatestCheck(serviceId) {
        return prisma.serviceCheck.findFirst({
            where: { serviceId },
            orderBy: { ts: 'desc' },
        });
    },
    async batchUpdateStatuses(updates) {
        const now = new Date();
        await prisma.$transaction(async (tx) => {
            const updatePromises = updates.map(update => tx.service.update({
                where: { id: update.id },
                data: {
                    lastStatus: update.status,
                    lastLatencyMs: update.latencyMs ?? null,
                    lastCheckedAt: now,
                },
            }));
            await Promise.all(updatePromises);
        });
    },
    async batchRecordChecks(checks) {
        await prisma.$transaction(async (tx) => {
            // Insert all checks
            await tx.serviceCheck.createMany({
                data: checks,
            });
            // For each unique service, clean up old checks
            const uniqueServiceIds = [...new Set(checks.map(c => c.serviceId))];
            const cleanupPromises = uniqueServiceIds.map(async (serviceId) => {
                const checksToDelete = await tx.serviceCheck.findMany({
                    where: { serviceId },
                    orderBy: { ts: 'desc' },
                    skip: 50,
                    select: { id: true },
                });
                if (checksToDelete.length > 0) {
                    await tx.serviceCheck.deleteMany({
                        where: {
                            id: { in: checksToDelete.map(c => c.id) }
                        }
                    });
                }
            });
            await Promise.all(cleanupPromises);
        });
    },
};
export { ServiceStatus } from '../generated/prisma/index.js';
//# sourceMappingURL=services.js.map