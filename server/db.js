import { PrismaClient } from '../src/generated/client/index.js';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure we use the absolute path for the SQLite database
const dbPath = path.join(__dirname, '../prisma/dev.db');

// In Prisma 7, the adapter constructor expects an options object with the url
const adapter = new PrismaBetterSqlite3({
  url: `file:${dbPath}`
});

const prisma = new PrismaClient({ adapter });

export default prisma;
