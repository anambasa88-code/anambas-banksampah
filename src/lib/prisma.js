// src/lib/prisma.js
import { PrismaClient } from '../generated/prisma';

const globalForPrisma = globalThis;

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({
    log: ['warn', 'error'],
  });
}

const prisma = globalForPrisma.prisma;

export default prisma;