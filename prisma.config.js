import { defineConfig } from '@prisma/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma/schema.prisma'),
  migrate: {
    migrations: {
      path: path.join(__dirname, 'prisma/migrations'),
    },
  },
  datasource: {
    url: process.env.DATABASE_URL || `file:${path.join(__dirname, 'prisma/dev.db')}`,
  },
});
