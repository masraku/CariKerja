import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Connection pool settings for PgBouncer/Supabase Session mode
    // Limit connections to prevent pool exhaustion
  })
}

const globalForPrisma = globalThis

// Ensure single instance across hot reloads in development
// This prevents creating new connections on every file change
if (!globalForPrisma.prismaGlobal) {
  globalForPrisma.prismaGlobal = prismaClientSingleton()
}

export const prisma = globalForPrisma.prismaGlobal

// Only set global in development to prevent memory leaks in production
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaGlobal = prisma
}

// Graceful shutdown handler to properly close connections
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}