import { beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '../generated/prisma/index.js';
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.TEST_DATABASE_URL || 'postgresql://pingimap:pingimap@localhost:5432/pingimap_test'
        }
    }
});
beforeAll(async () => {
    // Clean up database before all tests
    await cleanDatabase();
});
beforeEach(async () => {
    // Clean up database before each test
    await cleanDatabase();
});
afterAll(async () => {
    await prisma.$disconnect();
});
async function cleanDatabase() {
    // Delete in reverse dependency order
    await prisma.serviceCheck.deleteMany({});
    await prisma.service.deleteMany({});
}
export { prisma };
//# sourceMappingURL=setup.js.map