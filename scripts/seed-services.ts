#!/usr/bin/env tsx

import { PrismaClient } from '../apps/api/src/generated/prisma/index.js'

const prisma = new PrismaClient()

const commonServices = [
  {
    name: 'Google',
    url: 'https://www.google.com'
  },
  {
    name: 'GitHub',
    url: 'https://github.com'
  },
  {
    name: 'Cloudflare',
    url: 'https://www.cloudflare.com'
  },
  {
    name: 'Wikipedia',
    url: 'https://www.wikipedia.org'
  },
  {
    name: 'antonbazhenov.com',
    url: 'https://antonbazhenov.com'
  },
  {
    name: 'Facebook',
    url: 'https://facebook.com'
  },
  {
    name: 'Example.org',
    url: 'https://example.org'
  }
]

async function seedServices() {
  console.log('Seeding services...')

  for (const service of commonServices) {
    try {
      await prisma.service.upsert({
        where: { url: service.url },
        update: {
          name: service.name
        },
        create: {
          name: service.name,
          url: service.url
        }
      })
      console.log(`✅ Upserted: ${service.name}`)
    } catch (error) {
      console.error(`❌ Failed to upsert ${service.name}:`, error)
    }
  }

  console.log('Seeding completed.')
}

async function main() {
  try {
    await seedServices()
  } catch (error) {
    console.error('Error during seeding:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()