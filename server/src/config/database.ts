
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required.");
}

let databaseUrl: URL;

try {
  databaseUrl = new URL(connectionString);
} catch {
  throw new Error("DATABASE_URL must be a valid PostgreSQL connection URL.");
}

const databaseHost = databaseUrl.hostname;
const isLocalDatabase = ["localhost", "127.0.0.1", "[::1]"].includes(
  databaseHost,
);

if (!isLocalDatabase) {
  for (const option of [
    "ssl",
    "sslmode",
    "sslcert",
    "sslkey",
    "sslrootcert",
    "sslnegotiation",
    "uselibpqcompat",
  ]) {
    databaseUrl.searchParams.delete(option);
  }
}

const pool = new Pool({
  connectionString: databaseUrl.toString(),
  ssl: isLocalDatabase ? undefined : { rejectUnauthorized: false },
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error);
});

export default pool;
