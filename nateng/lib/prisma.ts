import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  __prisma?: PrismaClient
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'production'
      ? ['error']
      : ['query', 'info', 'warn', 'error'],
  })
}

export const prisma = globalForPrisma.__prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma = prisma
}

export default prisma;
