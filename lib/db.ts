import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined;
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing");
}

// Timeweb PostgreSQL может отдавать self-signed certificate.
// Для serverless API на Vercel отключаем строгую проверку цепочки сертификата.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const createPool = () =>
  new Pool({
    connectionString: databaseUrl,
    ssl: false,

    // Важно для Vercel + Timeweb PostgreSQL:
    // не даём serverless-функциям открыть слишком много подключений.
    max: 1,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
    maxUses: 100,
  });

export const db = global.pgPool ?? createPool();

global.pgPool = db;
