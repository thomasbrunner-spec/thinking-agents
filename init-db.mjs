import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // This will create the database and tables if they don't exist
  // Using Prisma Client's built-in connection which auto-creates SQLite DB
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL,
        "name" TEXT,
        "passwordHash" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`)

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "AnalysisSession" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "question" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AnalysisSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `)

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "AgentResult" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "sessionId" TEXT NOT NULL,
        "agentType" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AgentResult_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AnalysisSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `)

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "MetaSynthesis" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "sessionId" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "MetaSynthesis_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AnalysisSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `)
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "MetaSynthesis_sessionId_key" ON "MetaSynthesis"("sessionId")`)

    console.log('Database initialized successfully')
  } catch (e) {
    console.error('DB init error:', e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
