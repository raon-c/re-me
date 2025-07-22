import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// AIDEV-NOTE: Prisma 클라이언트 설정 with prepared statement optimization
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

// AIDEV-NOTE: Graceful shutdown handler for development
if (process.env.NODE_ENV !== 'production') {
  process.on('beforeExit', async () => {
    await db.$disconnect();
  });
}
