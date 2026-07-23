import pg from "pg";

const { Pool } = pg;
pg.types.setTypeParser(1700, (value) => parseFloat(value));

const globalForPg = globalThis;

const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

if (!connectionString) {
  console.warn("DATABASE_URL no esta configurada. Las API routes de Neon fallaran hasta definirla.");
}

const pool =
  globalForPg.neonPool ||
  new Pool({
    connectionString,
    ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: false },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.neonPool = pool;
}

const query = (text, params) => pool.query(text, params);

const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export { query, transaction };
