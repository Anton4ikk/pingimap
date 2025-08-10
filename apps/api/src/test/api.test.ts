import Fastify from 'fastify'
import { connect, NatsConnection } from 'nats'
import pg from 'pg'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { servicesDb } from '../db/services.js'
import { prisma } from './setup.js'

const { Pool } = pg

describe('API Tests', () => {
  let app: any
  let db: pg.Pool
  let nats: NatsConnection

  beforeAll(async () => {
    // Create Fastify app with same configuration as server
    app = Fastify({ logger: false })

    // Setup database connection
    const databaseUrl = process.env.TEST_DATABASE_URL || 'postgresql://pingimap:pingimap@localhost:5432/pingimap_test'
    db = new Pool({ connectionString: databaseUrl })

    // Setup NATS connection (using a mock for tests)
    try {
      nats = await connect({ servers: process.env.TEST_NATS_URL || 'nats://localhost:4222' })
    } catch (error) {
      // Mock NATS connection for tests if not available
      nats = {
        isClosed: () => false,
        close: async () => {}
      } as any
    }

    // Register CORS
    await app.register(import('@fastify/cors'), { origin: true })

    // Add health endpoint
    app.get('/health', async () => {
      try {
        await db.query('SELECT 1')
        return {
          status: 'ok',
          timestamp: new Date().toISOString(),
          database: 'connected',
          nats: nats.isClosed() ? 'disconnected' : 'connected'
        }
      } catch (error: unknown) {
        return {
          status: 'error',
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    })

    // Add services routes
    app.get('/api/services', async () => {
      return await servicesDb.findAll()
    })

    app.post('/api/services', {
      schema: {
        body: {
          type: 'object',
          required: ['name', 'url'],
          properties: {
            name: { type: 'string', minLength: 1 },
            url: { type: 'string', pattern: '^https?://.+', minLength: 1 }
          },
          additionalProperties: false
        }
      }
    }, async (request: any, reply: any) => {
      const { name, url } = request.body

      try {
        // Check if URL already exists
        const existingService = await servicesDb.findByUrl(url)
        if (existingService) {
          return reply.status(409).send({
            statusCode: 409,
            error: 'Conflict',
            message: 'A service with this URL already exists'
          })
        }

        const service = await servicesDb.create({ name, url })
        return reply.status(201).send(service)
      } catch (error: unknown) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: error instanceof Error ? error.message : 'Failed to create service'
        })
      }
    })

    app.delete('/api/services/:id', {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' }
          }
        }
      }
    }, async (request: any, reply: any) => {
      const { id } = request.params

      try {
        // Check if service exists
        const existingService = await servicesDb.findById(id)
        if (!existingService) {
          return reply.status(404).send({
            statusCode: 404,
            error: 'Not Found',
            message: 'Service not found'
          })
        }

        const deletedService = await servicesDb.delete(id)
        return reply.send({
          message: 'Service deleted successfully',
          service: deletedService
        })
      } catch (error: unknown) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: error instanceof Error ? error.message : 'Failed to delete service'
        })
      }
    })

    await app.ready()
  })

  afterAll(async () => {
    await app?.close()
    await nats?.close()
    await db?.end()
  })

  beforeEach(async () => {
    // Clean up database before each test
    await prisma.serviceCheck.deleteMany({})
    await prisma.service.deleteMany({})
  })

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app.server)
        .get('/health')
        .expect(200)

      expect(response.body).toMatchObject({
        status: 'ok',
        database: 'connected',
        nats: 'connected'
      })
      expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/)
    })
  })

  describe('Services API', () => {
    describe('GET /api/services', () => {
      it('should return empty array when no services exist', async () => {
        const response = await request(app.server)
          .get('/api/services')
          .expect(200)

        expect(response.body).toEqual([])
      })

      it('should return list of services', async () => {
        // Create test services
        const service1 = await servicesDb.create({
          name: 'Test Service 1',
          url: 'https://example.com'
        })
        const service2 = await servicesDb.create({
          name: 'Test Service 2',
          url: 'https://test.com'
        })

        const response = await request(app.server)
          .get('/api/services')
          .expect(200)

        expect(response.body).toHaveLength(2)
        expect(response.body[0]).toMatchObject({
          id: service2.id,
          name: 'Test Service 2',
          url: 'https://test.com'
        })
        expect(response.body[1]).toMatchObject({
          id: service1.id,
          name: 'Test Service 1',
          url: 'https://example.com'
        })
      })
    })

    describe('POST /api/services', () => {
      it('should create a new service successfully (200 path)', async () => {
        const serviceData = {
          name: 'Test Service',
          url: 'https://example.com'
        }

        const response = await request(app.server)
          .post('/api/services')
          .send(serviceData)
          .expect(201)

        expect(response.body).toMatchObject({
          name: 'Test Service',
          url: 'https://example.com',
          lastLatencyMs: null,
          lastStatus: null,
          lastCheckedAt: null
        })
        expect(response.body.id).toBeDefined()
        expect(response.body.createdAt).toBeDefined()
        expect(response.body.updatedAt).toBeDefined()
      })

      it('should return 400 for missing name (400 path)', async () => {
        const serviceData = {
          url: 'https://example.com'
        }

        const response = await request(app.server)
          .post('/api/services')
          .send(serviceData)
          .expect(400)

        expect(response.body).toMatchObject({
          statusCode: 400,
          error: 'Bad Request'
        })
      })

      it('should return 400 for missing url (400 path)', async () => {
        const serviceData = {
          name: 'Test Service'
        }

        const response = await request(app.server)
          .post('/api/services')
          .send(serviceData)
          .expect(400)

        expect(response.body).toMatchObject({
          statusCode: 400,
          error: 'Bad Request'
        })
      })

      it('should return 400 for empty name (400 path)', async () => {
        const serviceData = {
          name: '',
          url: 'https://example.com'
        }

        const response = await request(app.server)
          .post('/api/services')
          .send(serviceData)
          .expect(400)

        expect(response.body).toMatchObject({
          statusCode: 400,
          error: 'Bad Request'
        })
      })

      it('should return 400 for invalid URL pattern (400 path)', async () => {
        const serviceData = {
          name: 'Test Service',
          url: 'invalid-url'
        }

        const response = await request(app.server)
          .post('/api/services')
          .send(serviceData)
          .expect(400)

        expect(response.body).toMatchObject({
          statusCode: 400,
          error: 'Bad Request'
        })
      })

      it('should return 409 for duplicate URL (400 path)', async () => {
        const serviceData = {
          name: 'Test Service',
          url: 'https://example.com'
        }

        // Create first service
        await request(app.server)
          .post('/api/services')
          .send(serviceData)
          .expect(201)

        // Try to create duplicate
        const response = await request(app.server)
          .post('/api/services')
          .send({ name: 'Different Name', url: 'https://example.com' })
          .expect(409)

        expect(response.body).toMatchObject({
          statusCode: 409,
          error: 'Conflict',
          message: 'A service with this URL already exists'
        })
      })
    })

    describe('DELETE /api/services/:id', () => {
      it('should delete a service successfully (200 path)', async () => {
        // Create a service first
        const service = await servicesDb.create({
          name: 'Test Service',
          url: 'https://example.com'
        })

        const response = await request(app.server)
          .delete(`/api/services/${service.id}`)
          .expect(200)

        expect(response.body).toMatchObject({
          message: 'Service deleted successfully',
          service: {
            id: service.id,
            name: 'Test Service',
            url: 'https://example.com'
          }
        })

        // Verify service is actually deleted
        const deletedService = await servicesDb.findById(service.id)
        expect(deletedService).toBeNull()
      })

      it('should return 404 for non-existent service (400 path)', async () => {
        const fakeId = '00000000-0000-4000-8000-000000000000'

        const response = await request(app.server)
          .delete(`/api/services/${fakeId}`)
          .expect(404)

        expect(response.body).toMatchObject({
          statusCode: 404,
          error: 'Not Found',
          message: 'Service not found'
        })
      })

      it('should return 400 for invalid UUID format (400 path)', async () => {
        const response = await request(app.server)
          .delete('/api/services/invalid-uuid')
          .expect(400)

        expect(response.body).toMatchObject({
          statusCode: 400,
          error: 'Bad Request'
        })
      })
    })
  })
})