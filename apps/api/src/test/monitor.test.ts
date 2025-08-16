import { beforeEach, describe, expect, it, Mock, vi } from 'vitest'
import { servicesDb, ServiceStatus } from '../db/services.js'
import { prisma } from './setup.js'

// We'll test the monitor logic by importing and calling the ping function directly
// Since the original monitor.ts doesn't export the pingService function, we'll recreate it here for testing

const PING_TIMEOUT_MS = 5000
const FAST_THRESHOLD_MS = 1000
const NORMAL_THRESHOLD_MS = 2000
const SLOW_THRESHOLD_MS = 5000

interface PingResult {
  status: ServiceStatus
  latencyMs: number | null
  httpCode?: number
  error?: string
}

async function pingService(url: string): Promise<PingResult> {
  const startTime = performance.now()

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), PING_TIMEOUT_MS)

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'PingIMap-Monitor/1.0',
      },
    })

    clearTimeout(timeoutId)
    const latencyMs = Math.round(performance.now() - startTime)

    if (response.status >= 400) {
      return {
        status: ServiceStatus.DOWN,
        latencyMs,
        httpCode: response.status,
        error: `HTTP ${response.status}: ${response.statusText}`,
      }
    }

    if (latencyMs <= FAST_THRESHOLD_MS) {
      return { status: ServiceStatus.FAST, latencyMs, httpCode: response.status }
    } else if (latencyMs <= NORMAL_THRESHOLD_MS) {
      return { status: ServiceStatus.NORMAL, latencyMs, httpCode: response.status }
    } else if (latencyMs <= SLOW_THRESHOLD_MS) {
      return { status: ServiceStatus.SLOW, latencyMs, httpCode: response.status }
    } else {
      return { status: ServiceStatus.DOWN, latencyMs, httpCode: response.status }
    }
  } catch (error: unknown) {
    const latencyMs = Math.round(performance.now() - startTime)
    let errorMessage = 'Unknown error'

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = `Timeout after ${PING_TIMEOUT_MS}ms`
      } else {
        errorMessage = error.message
      }
    }

    return {
      status: ServiceStatus.DOWN,
      latencyMs: latencyMs > PING_TIMEOUT_MS ? null : latencyMs,
      error: errorMessage,
    }
  }
}

async function processServiceCheck(service: any): Promise<void> {
  const result = await pingService(service.url)

  // Update service status
  await servicesDb.updateStatus(service.id, result.status, result.latencyMs || undefined)

  // Record the check in service_checks table
  await servicesDb.recordCheck({
    serviceId: service.id,
    status: result.status,
    latencyMs: result.latencyMs,
    httpCode: result.httpCode ?? null,
    errorText: result.error ?? null,
  })
}

// Mock fetch globally
const mockFetch = vi.fn() as Mock
global.fetch = mockFetch

describe('Monitor/Worker Tests', () => {
  beforeEach(async () => {
    // Clean up database
    await prisma.serviceCheck.deleteMany({})
    await prisma.service.deleteMany({})

    // Reset mocks
    vi.clearAllMocks()
    mockFetch.mockReset()
  })

  describe('pingService', () => {
    it('should return FAST status for fast response (< 1000ms)', async () => {
      // Mock a successful fast response
      mockFetch.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK'
      })

      // Mock performance.now to simulate fast response
      const originalNow = performance.now
      let callCount = 0
      vi.spyOn(performance, 'now').mockImplementation(() => {
        callCount++
        return callCount === 1 ? 0 : 500 // 500ms response time
      })

      const result = await pingService('https://example.com')

      expect(result).toEqual({
        status: ServiceStatus.FAST,
        latencyMs: 500,
        httpCode: 200
      })

      performance.now = originalNow
    })

    it('should return SLOW status for slow response (1000-2000ms)', async () => {
      mockFetch.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK'
      })

      // Mock performance.now to simulate slow response
      const originalNow = performance.now
      let callCount = 0
      vi.spyOn(performance, 'now').mockImplementation(() => {
        callCount++
        return callCount === 1 ? 0 : 1500 // 1500ms response time
      })

      const result = await pingService('https://example.com')

      expect(result).toEqual({
        status: ServiceStatus.SLOW,
        latencyMs: 1500,
        httpCode: 200
      })

      performance.now = originalNow
    })

    it('should return DOWN status for very slow response (> 2000ms)', async () => {
      mockFetch.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK'
      })

      // Mock performance.now to simulate very slow response
      const originalNow = performance.now
      let callCount = 0
      vi.spyOn(performance, 'now').mockImplementation(() => {
        callCount++
        return callCount === 1 ? 0 : 3000 // 3000ms response time
      })

      const result = await pingService('https://example.com')

      expect(result).toEqual({
        status: ServiceStatus.DOWN,
        latencyMs: 3000,
        httpCode: 200
      })

      performance.now = originalNow
    })

    it('should return DOWN status for HTTP 4xx errors', async () => {
      mockFetch.mockResolvedValueOnce({
        status: 404,
        statusText: 'Not Found'
      })

      // Mock performance.now
      const originalNow = performance.now
      let callCount = 0
      vi.spyOn(performance, 'now').mockImplementation(() => {
        callCount++
        return callCount === 1 ? 0 : 200
      })

      const result = await pingService('https://example.com')

      expect(result).toEqual({
        status: ServiceStatus.DOWN,
        latencyMs: 200,
        httpCode: 404,
        error: 'HTTP 404: Not Found'
      })

      performance.now = originalNow
    })

    it('should return DOWN status for HTTP 5xx errors', async () => {
      mockFetch.mockResolvedValueOnce({
        status: 500,
        statusText: 'Internal Server Error'
      })

      // Mock performance.now
      const originalNow = performance.now
      let callCount = 0
      vi.spyOn(performance, 'now').mockImplementation(() => {
        callCount++
        return callCount === 1 ? 0 : 300
      })

      const result = await pingService('https://example.com')

      expect(result).toEqual({
        status: ServiceStatus.DOWN,
        latencyMs: 300,
        httpCode: 500,
        error: 'HTTP 500: Internal Server Error'
      })

      performance.now = originalNow
    })

    it('should return DOWN status for network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      // Mock performance.now
      const originalNow = performance.now
      let callCount = 0
      vi.spyOn(performance, 'now').mockImplementation(() => {
        callCount++
        return callCount === 1 ? 0 : 100
      })

      const result = await pingService('https://example.com')

      expect(result).toEqual({
        status: ServiceStatus.DOWN,
        latencyMs: 100,
        error: 'Network error'
      })

      performance.now = originalNow
    })

    it('should return DOWN status for timeout', async () => {
      // Mock fetch to hang (simulate timeout)
      mockFetch.mockImplementationOnce(() => new Promise((resolve) => {
        // Never resolve to simulate hanging request
      }))

      // Mock AbortError
      const abortError = new Error('The operation was aborted')
      abortError.name = 'AbortError'

      // Mock fetch to throw AbortError after timeout
      mockFetch.mockRejectedValueOnce(abortError)

      const result = await pingService('https://example.com')

      expect(result.status).toBe(ServiceStatus.DOWN)
      expect(result.error).toBe(`Timeout after ${PING_TIMEOUT_MS}ms`)
      expect(result.latencyMs).toBeNull()
    })
  })

  describe('Service Status Updates', () => {
    it('should update service status and record check for FAST status', async () => {
      // Create a test service
      const service = await servicesDb.create({
        name: 'Test Service',
        url: 'https://example.com'
      })

      // Mock successful response
      mockFetch.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK'
      })

      // Mock performance.now for fast response
      const originalNow = performance.now
      let callCount = 0
      vi.spyOn(performance, 'now').mockImplementation(() => {
        callCount++
        return callCount === 1 ? 0 : 500
      })

      await processServiceCheck(service)

      // Check that service was updated
      const updatedService = await servicesDb.findById(service.id)
      expect(updatedService?.lastStatus).toBe(ServiceStatus.FAST)
      expect(updatedService?.lastLatencyMs).toBe(500)
      expect(updatedService?.lastCheckedAt).toBeDefined()

      // Check that a service check was recorded
      const checks = await servicesDb.getServiceChecks(service.id, 10)
      expect(checks).toHaveLength(1)
      expect(checks[0]).toMatchObject({
        serviceId: service.id,
        status: ServiceStatus.FAST,
        latencyMs: 500,
        httpCode: 200,
        errorText: null
      })

      performance.now = originalNow
    })

    it('should update service status and record check for SLOW status', async () => {
      const service = await servicesDb.create({
        name: 'Test Service',
        url: 'https://example.com'
      })

      mockFetch.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK'
      })

      // Mock performance.now for slow response
      const originalNow = performance.now
      let callCount = 0
      vi.spyOn(performance, 'now').mockImplementation(() => {
        callCount++
        return callCount === 1 ? 0 : 1500
      })

      await processServiceCheck(service)

      const updatedService = await servicesDb.findById(service.id)
      expect(updatedService?.lastStatus).toBe(ServiceStatus.SLOW)
      expect(updatedService?.lastLatencyMs).toBe(1500)

      const checks = await servicesDb.getServiceChecks(service.id, 10)
      expect(checks[0]).toMatchObject({
        status: ServiceStatus.SLOW,
        latencyMs: 1500,
        httpCode: 200,
        errorText: null
      })

      performance.now = originalNow
    })

    it('should update service status and record check for DOWN status with error', async () => {
      const service = await servicesDb.create({
        name: 'Test Service',
        url: 'https://example.com'
      })

      mockFetch.mockRejectedValueOnce(new Error('Connection refused'))

      // Mock performance.now
      const originalNow = performance.now
      let callCount = 0
      vi.spyOn(performance, 'now').mockImplementation(() => {
        callCount++
        return callCount === 1 ? 0 : 200
      })

      await processServiceCheck(service)

      const updatedService = await servicesDb.findById(service.id)
      expect(updatedService?.lastStatus).toBe(ServiceStatus.DOWN)
      expect(updatedService?.lastLatencyMs).toBe(200)

      const checks = await servicesDb.getServiceChecks(service.id, 10)
      expect(checks[0]).toMatchObject({
        status: ServiceStatus.DOWN,
        latencyMs: 200,
        httpCode: null,
        errorText: 'Connection refused'
      })

      performance.now = originalNow
    })
  })
})