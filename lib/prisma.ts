// Prisma client stub — app uses mock data; run `prisma generate` to activate.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalForPrisma = globalThis as unknown as { prisma: any }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma: any = globalForPrisma.prisma ?? null

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
