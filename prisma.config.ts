import 'dotenv/config';
import path from 'node:path';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  earlyAccess: true,
  schema: path.join(import.meta.dirname, 'prisma', 'schema.prisma'),
  datasource: {
    clientConfig: env('DATABASE_URL'),
  },
});
