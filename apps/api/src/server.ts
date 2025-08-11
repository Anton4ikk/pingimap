import { config } from '@pingimap/env-config';
import Fastify from 'fastify';
import { connect, NatsConnection } from 'nats';
import pg from 'pg';
import { CreateServiceData, servicesDb, UpdateServiceData } from './db/services.js';
import { getMonitoringStatus, startMonitoring, stopMonitoring } from './monitor.js';

const { Pool } = pg;

const server = Fastify({
  logger: true,
});

let db: pg.Pool;
let nats: NatsConnection;

// Security headers
server.addHook('onSend', async (_request, reply, payload) => {
  // Security headers
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('X-Frame-Options', 'DENY');
  reply.header('X-XSS-Protection', '1; mode=block');
  reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  reply.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // HSTS for production
  if (config.nodeEnv === 'production') {
    reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }


  return payload;
});

server.register(import('@fastify/cors'), {
  origin: true,
});

// Authentication middleware
const requireAuth = async (request: any, reply: any) => {
  // Skip auth for GET requests and auth endpoints
  if (request.method === 'GET' || request.url.startsWith('/api/auth/')) {
    return;
  }

  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Authentication required for write operations.'
    });
  }

  try {
    const token = authHeader.substring(7);
    // Simple token validation - in production, use proper JWT verification
    if (token !== 'admin-session-' + config.jwtSecret) {
      throw new Error('Invalid token');
    }
  } catch (error) {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Invalid authentication token.'
    });
  }
};

// Apply authentication protection to write operations
server.addHook('preHandler', requireAuth);

// Authentication endpoints
server.post('/auth/login', {
  schema: {
    body: {
      type: 'object',
      required: ['password'],
      properties: {
        password: { type: 'string', minLength: 1 }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          token: { type: 'string' },
          message: { type: 'string' }
        }
      },
      401: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' }
        }
      }
    }
  }
}, async (request, reply) => {
  const { password } = request.body as { password: string };

  if (password === config.adminPassword) {
    const token = 'admin-session-' + config.jwtSecret;
    return reply.send({
      success: true,
      token,
      message: 'Authentication successful'
    });
  } else {
    return reply.status(401).send({
      success: false,
      message: 'Invalid admin password'
    });
  }
});

server.get('/auth/status', async (request, reply) => {
  const authHeader = request.headers.authorization;
  const isAuthenticated = authHeader &&
    authHeader.startsWith('Bearer ') &&
    authHeader.substring(7) === 'admin-session-' + config.jwtSecret;

  return reply.send({
    authenticated: !!isAuthenticated,
    adminMode: !!isAuthenticated
  });
});

server.get('/health', async () => {
  try {
    await db.query('SELECT 1');
    const monitorStatus = getMonitoringStatus();
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      nats: nats.isClosed() ? 'disconnected' : 'connected',
      monitor: {
        running: monitorStatus.running,
        interval: `${monitorStatus.interval / 1000}s`,
        thresholds: monitorStatus.thresholds
      },
      environment: config.nodeEnv
    };
  } catch (error: unknown) {
    server.log.error({ error }, 'Health check failed');
    return {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

// Configuration endpoint
server.get('/api/config', {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          thresholds: {
            type: 'object',
            properties: {
              fast: { type: 'number' },
              slow: { type: 'number' },
              timeout: { type: 'number' }
            }
          },
          labels: {
            type: 'object',
            properties: {
              up: { type: 'string' },
              slow: { type: 'string' },
              down: { type: 'string' },
              notChecked: { type: 'string' }
            }
          }
        }
      }
    }
  }
}, async () => {
  const monitorStatus = getMonitoringStatus();
  return {
    thresholds: monitorStatus.thresholds,
    labels: {
      up: `≤ ${monitorStatus.thresholds.fast}ms`,
      slow: `${monitorStatus.thresholds.fast + 1}-${monitorStatus.thresholds.slow}ms`,
      down: `> ${monitorStatus.thresholds.slow}ms or error`,
      notChecked: 'Not checked'
    },
    environment: config.nodeEnv
  };
});

// Services routes
server.get('/api/services', {
  schema: {
    response: {
      200: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            url: { type: 'string' },
            lastLatencyMs: { type: ['number', 'null'] },
            lastStatus: { type: ['string', 'null'], enum: ['UP', 'SLOW', 'DOWN', null] },
            lastCheckedAt: { type: ['string', 'null'] },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' }
          }
        }
      }
    }
  }
}, async () => {
  return await servicesDb.findAll();
});

server.post('/api/services', {
  schema: {
    body: {
      type: 'object',
      required: ['name', 'url'],
      properties: {
        name: { type: 'string', minLength: 1 },
        url: {
          type: 'string',
          pattern: '^https?://.+',
          minLength: 1
        }
      },
      additionalProperties: false
    },
    response: {
      201: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          url: { type: 'string' },
          lastLatencyMs: { type: ['number', 'null'] },
          lastStatus: { type: ['string', 'null'], enum: ['UP', 'SLOW', 'DOWN', null] },
          lastCheckedAt: { type: ['string', 'null'] },
          createdAt: { type: 'string' },
          updatedAt: { type: 'string' }
        }
      },
      400: {
        type: 'object',
        properties: {
          statusCode: { type: 'number' },
          error: { type: 'string' },
          message: { type: 'string' }
        }
      },
      409: {
        type: 'object',
        properties: {
          statusCode: { type: 'number' },
          error: { type: 'string' },
          message: { type: 'string' }
        }
      }
    }
  }
}, async (request, reply) => {
  const { name, url } = request.body as CreateServiceData;

  try {
    // Check if URL already exists
    const existingService = await servicesDb.findByUrl(url);
    if (existingService) {
      return reply.status(409).send({
        statusCode: 409,
        error: 'Conflict',
        message: 'A service with this URL already exists'
      });
    }

    const service = await servicesDb.create({ name, url });
    return reply.status(201).send(service);
  } catch (error: unknown) {
    server.log.error({ error }, 'Failed to create service');
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: error instanceof Error ? error.message : 'Failed to create service'
    });
  }
});

server.delete('/api/services/:id', {
  schema: {
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', format: 'uuid' }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          service: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              url: { type: 'string' },
              lastLatencyMs: { type: ['number', 'null'] },
              lastStatus: { type: ['string', 'null'], enum: ['UP', 'SLOW', 'DOWN', null] },
              lastCheckedAt: { type: ['string', 'null'] },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' }
            }
          }
        }
      },
      404: {
        type: 'object',
        properties: {
          statusCode: { type: 'number' },
          error: { type: 'string' },
          message: { type: 'string' }
        }
      }
    }
  }
}, async (request, reply) => {
  const { id } = request.params as { id: string };

  try {
    // Check if service exists
    const existingService = await servicesDb.findById(id);
    if (!existingService) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Service not found'
      });
    }

    const deletedService = await servicesDb.delete(id);
    return reply.send({
      message: 'Service deleted successfully',
      service: deletedService
    });
  } catch (error: unknown) {
    server.log.error({ error }, 'Failed to delete service');
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: error instanceof Error ? error.message : 'Failed to delete service'
    });
  }
});

server.put('/api/services/:id', {
  schema: {
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', format: 'uuid' }
      }
    },
    body: {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 1 },
        url: {
          type: 'string',
          pattern: '^https?://.+',
          minLength: 1
        }
      },
      additionalProperties: false,
      minProperties: 1
    },
    response: {
      200: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          url: { type: 'string' },
          lastLatencyMs: { type: ['number', 'null'] },
          lastStatus: { type: ['string', 'null'], enum: ['UP', 'SLOW', 'DOWN', null] },
          lastCheckedAt: { type: ['string', 'null'] },
          createdAt: { type: 'string' },
          updatedAt: { type: 'string' }
        }
      },
      400: {
        type: 'object',
        properties: {
          statusCode: { type: 'number' },
          error: { type: 'string' },
          message: { type: 'string' }
        }
      },
      404: {
        type: 'object',
        properties: {
          statusCode: { type: 'number' },
          error: { type: 'string' },
          message: { type: 'string' }
        }
      },
      409: {
        type: 'object',
        properties: {
          statusCode: { type: 'number' },
          error: { type: 'string' },
          message: { type: 'string' }
        }
      }
    }
  }
}, async (request, reply) => {
  const { id } = request.params as { id: string };
  const updateData = request.body as UpdateServiceData;

  try {
    // Check if service exists
    const existingService = await servicesDb.findById(id);
    if (!existingService) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Service not found'
      });
    }

    // If URL is being updated, check if the new URL already exists
    if (updateData.url && updateData.url !== existingService.url) {
      const existingUrlService = await servicesDb.findByUrl(updateData.url);
      if (existingUrlService) {
        return reply.status(409).send({
          statusCode: 409,
          error: 'Conflict',
          message: 'A service with this URL already exists'
        });
      }
    }

    const updatedService = await servicesDb.update(id, updateData);
    return reply.send(updatedService);
  } catch (error: unknown) {
    server.log.error({ error }, 'Failed to update service');
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: error instanceof Error ? error.message : 'Failed to update service'
    });
  }
});

// Bulk import services endpoint
server.post('/api/services/bulk', {
  schema: {
    body: {
      type: 'object',
      required: ['services'],
      properties: {
        services: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'object',
            required: ['name', 'url'],
            properties: {
              name: { type: 'string', minLength: 1 },
              url: {
                type: 'string',
                pattern: '^https?://.+',
                minLength: 1
              }
            },
            additionalProperties: false
          }
        }
      },
      additionalProperties: false
    },
    response: {
      200: {
        type: 'object',
        properties: {
          imported: { type: 'number' },
          skipped: { type: 'number' },
          errors: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      },
      400: {
        type: 'object',
        properties: {
          statusCode: { type: 'number' },
          error: { type: 'string' },
          message: { type: 'string' }
        }
      }
    }
  }
}, async (request, reply) => {
  const { services } = request.body as { services: CreateServiceData[] };

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const serviceData of services) {
    try {
      // Check if URL already exists
      const existingService = await servicesDb.findByUrl(serviceData.url);
      if (existingService) {
        skipped++;
        continue;
      }

      await servicesDb.create({ name: serviceData.name, url: serviceData.url });
      imported++;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Failed to import "${serviceData.name}" (${serviceData.url}): ${errorMessage}`);
    }
  }

  return reply.send({
    imported,
    skipped,
    errors
  });
});

server.get('/api/services/:id/checks', {
  schema: {
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', format: 'uuid' }
      }
    },
    querystring: {
      type: 'object',
      properties: {
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 50,
          default: 50
        }
      },
      additionalProperties: false
    },
    response: {
      200: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            serviceId: { type: 'string' },
            ts: { type: 'string' },
            latencyMs: { type: ['number', 'null'] },
            status: { type: 'string', enum: ['UP', 'SLOW', 'DOWN'] },
            httpCode: { type: ['number', 'null'] },
            errorText: { type: ['string', 'null'] }
          }
        }
      },
      404: {
        type: 'object',
        properties: {
          statusCode: { type: 'number' },
          error: { type: 'string' },
          message: { type: 'string' }
        }
      }
    }
  }
}, async (request, reply) => {
  const { id } = request.params as { id: string };
  const { limit = 50 } = request.query as { limit?: number };

  try {
    // Check if service exists
    const existingService = await servicesDb.findById(id);
    if (!existingService) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Service not found'
      });
    }

    const checks = await servicesDb.getServiceChecks(id, limit);
    return reply.send(checks);
  } catch (error: unknown) {
    server.log.error({ error }, 'Failed to get service checks');
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: error instanceof Error ? error.message : 'Failed to get service checks'
    });
  }
});

const start = async () => {
  try {
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://pingimap:pingimap@localhost:5432/pingimap';
    const natsUrl = process.env.NATS_URL || 'nats://localhost:4222';

    db = new Pool({
      connectionString: databaseUrl,
    });

    server.log.info('Connecting to database...');
    await db.query('SELECT 1');
    server.log.info('Database connected');

    server.log.info('Connecting to NATS...');
    nats = await connect({ servers: natsUrl });
    server.log.info('NATS connected');

    await server.listen({ port: 3001, host: '0.0.0.0' });
    console.log('Server listening on http://localhost:3001');

    // Start the monitoring service
    startMonitoring();
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

process.on('SIGTERM', async () => {
  server.log.info('Received SIGTERM, shutting down gracefully...');
  stopMonitoring();
  await nats?.close();
  await db?.end();
  await server.close();
  process.exit(0);
});

start();