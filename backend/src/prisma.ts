import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// SQLite optimizations for better performance
async function initSqlitePragmas(prisma: PrismaClient) {
  await prisma.$queryRawUnsafe("PRAGMA journal_mode = WAL;");
  await prisma.$queryRawUnsafe("PRAGMA foreign_keys = ON;");
  await prisma.$queryRawUnsafe("PRAGMA busy_timeout = 10000;");
  await prisma.$queryRawUnsafe("PRAGMA synchronous = NORMAL;");
}

// Only run PRAGMA commands on SQLite databases
const databaseUrl = process.env.DATABASE_URL || "";
const isSqlite = databaseUrl.startsWith("file:") || databaseUrl.includes("sqlite");

if (isSqlite) {
  initSqlitePragmas(prisma).catch((err) => {
    console.error("Failed to initialize SQLite pragmas:", err);
  });
}

export { prisma };
