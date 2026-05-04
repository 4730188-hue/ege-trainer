import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var egeTrainerPgPool: Pool | undefined;
}

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is missing");
  }

  return url;
}

export const db =
  global.egeTrainerPgPool ??
  new Pool({
    connectionString: getDatabaseUrl(),
    ssl: {
      rejectUnauthorized: false,
    },
  });

if (process.env.NODE_ENV !== "production") {
  global.egeTrainerPgPool = db;
}
