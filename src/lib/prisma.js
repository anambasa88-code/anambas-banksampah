// src/lib/prisma.js
import { PrismaClient } from '../generated/prisma';

const globalForPrisma = globalThis;

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({
    log: ['warn', 'error'],
    // Connection pool configuration to prevent max clients error
    datasourceUrl: process.env.DATABASE_URL,
    // Additional connection options can be set via query params in DATABASE_URL:
    // ?connection_limit=10&pool_timeout=20
  });
}

const prisma = globalForPrisma.prisma;

export default prisma;