import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Retry wrapper for Prisma queries.
 * Handles Neon cold-start P1001 errors by retrying a few times.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  attempts = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const code = (err as { code?: string })?.code;
      // P1001 = can't reach DB (cold start)
      // P1017 = server closed connection
      const retryable = code === "P1001" || code === "P1017";
      if (!retryable || i === attempts - 1) throw err;
      console.warn(
        "Prisma retry " + (i + 1) + "/" + attempts + " after " + code
      );
      await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw lastError;
}

export default prisma;