import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// SQLite optimizations for better performance (only run on SQLite)
async function initSqlitePragmas(prisma: PrismaClient) {
  const dbUrl = process.env.DATABASE_URL || "";
  const isSqlite = dbUrl.startsWith("file:");
  
  // Only run PRAGMAs on SQLite - PostgreSQL doesn't support them
  if (!isSqlite) {
    return;
  }
  
  await prisma.$queryRawUnsafe("PRAGMA journal_mode = WAL;");
  await prisma.$queryRawUnsafe("PRAGMA foreign_keys = ON;");
  await prisma.$queryRawUnsafe("PRAGMA busy_timeout = 10000;");
  await prisma.$queryRawUnsafe("PRAGMA synchronous = NORMAL;");
}

initSqlitePragmas(prisma);

export { prisma };
