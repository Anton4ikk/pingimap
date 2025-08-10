import { beforeEach, describe, expect, it } from 'vitest'
import { servicesDb, ServiceStatus } from '../db/services.js'
import { prisma } from './setup.js'

describe('Service Checks Pruning Logic', () => {
  beforeEach(async () => {
    // Clean up database
    await prisma.serviceCheck.deleteMany({})
    await prisma.service.deleteMany({})
  })

  describe('recordCheck pruning behavior', () => {
    it('should keep all checks when there are fewer than 50 per service', async () => {
      // Create a test service
      const service = await servicesDb.create({
        name: 'Test Service',
        url: 'https://example.com'
      })

      // Record 10 checks
      for (let i = 0; i < 10; i++) {
        await servicesDb.recordCheck({
          serviceId: service.id,
          status: ServiceStatus.UP,
          latencyMs: 100 + i,
          httpCode: 200,
          errorText: null
        })
      }

      // Verify all 10 checks are kept
      const checks = await servicesDb.getServiceChecks(service.id, 100)
      expect(checks).toHaveLength(10)
    })

    it('should prune old checks when there are more than 50 per service', async () => {
      // Create a test service
      const service = await servicesDb.create({
        name: 'Test Service',
        url: 'https://example.com'
      })

      // Record 55 checks (5 more than the limit)
      const checkPromises = []
      for (let i = 0; i < 55; i++) {
        checkPromises.push(
          servicesDb.recordCheck({
            serviceId: service.id,
            status: ServiceStatus.UP,
            latencyMs: 100 + i,
            httpCode: 200,
            errorText: null
          })
        )

        // Add small delay to ensure different timestamps
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1))
        }
      }

      await Promise.all(checkPromises)

      // Verify only the most recent 50 checks are kept
      const checks = await servicesDb.getServiceChecks(service.id, 100)
      expect(checks).toHaveLength(50)

      // Verify the checks are the most recent ones (highest latency values)
      const latencies = checks.map(check => check.latencyMs).sort((a, b) => a! - b!)
      expect(latencies[0]).toBeGreaterThanOrEqual(105) // Should be from the more recent checks
      expect(latencies[latencies.length - 1]).toBe(154) // Should be the last check (100 + 54)
    })

    it('should only prune checks for the specific service, not others', async () => {
      // Create two test services
      const service1 = await servicesDb.create({
        name: 'Test Service 1',
        url: 'https://example1.com'
      })
      const service2 = await servicesDb.create({
        name: 'Test Service 2',
        url: 'https://example2.com'
      })

      // Record 55 checks for service1 and 10 checks for service2
      const promises = []

      for (let i = 0; i < 55; i++) {
        promises.push(
          servicesDb.recordCheck({
            serviceId: service1.id,
            status: ServiceStatus.UP,
            latencyMs: 100 + i,
            httpCode: 200,
            errorText: null
          })
        )
      }

      for (let i = 0; i < 10; i++) {
        promises.push(
          servicesDb.recordCheck({
            serviceId: service2.id,
            status: ServiceStatus.SLOW,
            latencyMs: 1500 + i,
            httpCode: 200,
            errorText: null
          })
        )
      }

      await Promise.all(promises)

      // Verify service1 has 50 checks (pruned) and service2 has 10 checks (not pruned)
      const service1Checks = await servicesDb.getServiceChecks(service1.id, 100)
      const service2Checks = await servicesDb.getServiceChecks(service2.id, 100)

      expect(service1Checks).toHaveLength(50)
      expect(service2Checks).toHaveLength(10)

      // Verify service2 checks are all SLOW status (unchanged)
      service2Checks.forEach(check => {
        expect(check.status).toBe(ServiceStatus.SLOW)
        expect(check.latencyMs).toBeGreaterThanOrEqual(1500)
      })
    })

    it('should maintain correct order after pruning (most recent first)', async () => {
      // Create a test service
      const service = await servicesDb.create({
        name: 'Test Service',
        url: 'https://example.com'
      })

      // Record checks with different statuses in a specific order
      const statuses = [ServiceStatus.UP, ServiceStatus.SLOW, ServiceStatus.DOWN]

      for (let i = 0; i < 60; i++) {
        await servicesDb.recordCheck({
          serviceId: service.id,
          status: statuses[i % 3]!,
          latencyMs: 100 + i,
          httpCode: 200,
          errorText: i % 10 === 9 ? `Error ${i}` : null // Add some errors
        })

        // Small delay to ensure different timestamps
        if (i % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1))
        }
      }

      // Get the checks and verify they're in descending order by timestamp
      const checks = await servicesDb.getServiceChecks(service.id, 100)
      expect(checks).toHaveLength(50)

      // Verify order is maintained (most recent first)
      for (let i = 0; i < checks.length - 1; i++) {
        expect(new Date(checks[i]!.ts).getTime()).toBeGreaterThanOrEqual(
          new Date(checks[i + 1]!.ts).getTime()
        )
      }

      // Verify we kept the most recent checks (higher latency values)
      const latencies = checks.map(check => check.latencyMs!)
      expect(Math.min(...latencies)).toBeGreaterThanOrEqual(110) // Should skip the oldest checks
      expect(Math.max(...latencies)).toBe(159) // Should include the newest check (100 + 59)
    })

    it('should handle edge case of exactly 50 checks', async () => {
      // Create a test service
      const service = await servicesDb.create({
        name: 'Test Service',
        url: 'https://example.com'
      })

      // Record exactly 50 checks
      for (let i = 0; i < 50; i++) {
        await servicesDb.recordCheck({
          serviceId: service.id,
          status: ServiceStatus.UP,
          latencyMs: 100 + i,
          httpCode: 200,
          errorText: null
        })
      }

      // Verify all 50 checks are kept (no pruning should occur)
      const checks = await servicesDb.getServiceChecks(service.id, 100)
      expect(checks).toHaveLength(50)

      // Add one more check to trigger pruning
      await servicesDb.recordCheck({
        serviceId: service.id,
        status: ServiceStatus.SLOW,
        latencyMs: 2000,
        httpCode: 200,
        errorText: null
      })

      // Should still have 50 checks, but the oldest should be removed
      const checksAfterPruning = await servicesDb.getServiceChecks(service.id, 100)
      expect(checksAfterPruning).toHaveLength(50)

      // The new check should be first (most recent)
      expect(checksAfterPruning[0]!.status).toBe(ServiceStatus.SLOW)
      expect(checksAfterPruning[0]!.latencyMs).toBe(2000)

      // The oldest check (latency 100) should be gone
      const latencies = checksAfterPruning.map(check => check.latencyMs!)
      expect(latencies.includes(100)).toBe(false)
      expect(latencies.includes(101)).toBe(true) // Second oldest should still be there
    })

    it('should handle concurrent check recording without data corruption', async () => {
      // Create a test service
      const service = await servicesDb.create({
        name: 'Test Service',
        url: 'https://example.com'
      })

      // Record multiple checks concurrently to test transaction handling
      const concurrentChecks = []
      for (let i = 0; i < 60; i++) {
        concurrentChecks.push(
          servicesDb.recordCheck({
            serviceId: service.id,
            status: ServiceStatus.UP,
            latencyMs: 100 + i,
            httpCode: 200,
            errorText: null
          })
        )
      }

      // Wait for all concurrent operations to complete
      await Promise.all(concurrentChecks)

      // Verify we have exactly 50 checks (pruning worked correctly)
      const checks = await servicesDb.getServiceChecks(service.id, 100)
      expect(checks).toHaveLength(50)

      // Verify no data corruption occurred
      checks.forEach(check => {
        expect(check.serviceId).toBe(service.id)
        expect(check.status).toBe(ServiceStatus.UP)
        expect(check.latencyMs).toBeGreaterThanOrEqual(100)
        expect(check.httpCode).toBe(200)
        expect(check.errorText).toBeNull()
      })
    })
  })
})